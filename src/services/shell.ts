import { VirtualFS } from './vfs';
import type { FileNode } from '../types';

export interface CommandResult {
  output: string;
  exitCode: number;
}

export class ShellService {
  private vfs: VirtualFS;
  private history: string[] = [];
  private lastExitCode: number = 0;
  private oldPwd: string = '/home/user';
  public env: Record<string, string> = {
    USER: 'user',
    HOME: '/home/user',
    SHELL: '/bin/bash',
    PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
    TERM: 'xterm-256color',
    HOSTNAME: 'worldbanc-sec-01',
    LANG: 'en_US.UTF-8',
    PWD: '/home/user',
  };
  public aliases: Record<string, string> = {
    ll: 'ls -la',
    la: 'ls -A',
    l: 'ls -CF',
  };

  constructor(vfs: VirtualFS) {
    this.vfs = vfs;
    this.env.PWD = vfs.getCwd();
    this.env.USER = vfs.getCurrentUser();
  }

  public getVFS(): VirtualFS {
    return this.vfs;
  }

  public setVFS(vfs: VirtualFS) {
    this.vfs = vfs;
  }

  public getHistory(): string[] {
    return [...this.history];
  }

  public getCwd(): string {
    return this.vfs.getCwd();
  }

  public getLastExitCode(): number {
    return this.lastExitCode;
  }

  public getPrompt(): string {
    const isRoot = this.vfs.isRoot();
    const user = isRoot ? 'root' : this.env.USER || 'user';
    const host = this.env.HOSTNAME || 'worldbanc-sec-01';
    const cwd = this.vfs.getCwd();
    const home = isRoot ? '/root' : '/home/user';
    const displayPath = cwd === home ? '~' : cwd.startsWith(home + '/') ? '~' + cwd.slice(home.length) : cwd;
    const symbol = isRoot ? '#' : '$';

    // ANSI prompt colors: green user@host, blue path, white symbol
    const userColor = isRoot ? '\x1b[1;31m' : '\x1b[1;32m';
    return `${userColor}${user}@${host}\x1b[0m:\x1b[1;34m${displayPath}\x1b[0m${symbol} `;
  }

  public execute(rawInput: string): CommandResult {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      return { output: '', exitCode: 0 };
    }

    this.history.push(trimmed);

    // Expand aliases if first word is an alias
    const firstWord = trimmed.split(' ')[0];
    let expandedInput = trimmed;
    if (this.aliases[firstWord]) {
      expandedInput = this.aliases[firstWord] + trimmed.slice(firstWord.length);
    }

    // Support sequential chaining (&& and ;)
    if (expandedInput.includes('&&')) {
      const parts = expandedInput.split('&&');
      let combinedOut = '';
      for (const part of parts) {
        const res = this.execute(part.trim());
        combinedOut += res.output;
        if (res.exitCode !== 0) {
          this.lastExitCode = res.exitCode;
          return { output: combinedOut, exitCode: res.exitCode };
        }
      }
      this.lastExitCode = 0;
      return { output: combinedOut, exitCode: 0 };
    }

    if (expandedInput.includes(';') && !expandedInput.includes('awk')) {
      const parts = expandedInput.split(';');
      let combinedOut = '';
      let lastExit = 0;
      for (const part of parts) {
        if (!part.trim()) continue;
        const res = this.execute(part.trim());
        combinedOut += res.output;
        lastExit = res.exitCode;
      }
      this.lastExitCode = lastExit;
      return { output: combinedOut, exitCode: lastExit };
    }

    // Support pipeline: cmd1 | cmd2 | cmd3
    if (expandedInput.includes('|')) {
      const res = this.executePipeline(expandedInput);
      this.lastExitCode = res.exitCode;
      return res;
    }

    // Support output redirection: cmd > file or cmd >> file
    if (expandedInput.includes('>') || expandedInput.includes('>>')) {
      const res = this.executeRedirection(expandedInput);
      this.lastExitCode = res.exitCode;
      return res;
    }

    const res = this.executeSingle(expandedInput);
    this.lastExitCode = res.exitCode;
    return res;
  }

  private executePipeline(pipelineStr: string): CommandResult {
    const segments = pipelineStr.split('|').map(s => s.trim()).filter(Boolean);
    let pipedInput = '';
    let lastExit = 0;

    for (const segment of segments) {
      const res = this.executeSingle(segment, pipedInput);
      lastExit = res.exitCode;
      pipedInput = res.output;
      if (lastExit !== 0) break;
    }

    return { output: pipedInput, exitCode: lastExit };
  }

  private executeRedirection(line: string): CommandResult {
    const isAppend = line.includes('>>');
    const operator = isAppend ? '>>' : '>';
    const parts = line.split(operator);
    const cmdPart = parts[0].trim();
    const targetFile = parts[1]?.trim();

    if (!targetFile) {
      return { output: 'bash: syntax error near unexpected token `newline`\n', exitCode: 2 };
    }

    const execResult = this.execute(cmdPart);
    const resolvedPath = this.vfs.resolvePath(targetFile);
    const targetNode = this.vfs.getNode(resolvedPath);

    let newContent = execResult.output;
    if (isAppend && targetNode && targetNode.type === 'file') {
      newContent = (targetNode.content || '') + execResult.output;
    }

    const createRes = this.vfs.createFile(resolvedPath, newContent);
    if (!createRes.success) {
      return { output: `bash: ${targetFile}: ${createRes.error || 'Permission denied'}\n`, exitCode: 1 };
    }

    return { output: '', exitCode: 0 };
  }

  public executeSingle(commandLine: string, stdinText: string = ''): CommandResult {
    // 1. Expand environment variables ($VAR, $?, etc.)
    const expandedLine = this.expandVariables(commandLine);

    // 2. Tokenize with quote preservation
    const tokens = this.tokenize(expandedLine);
    if (tokens.length === 0) return { output: '', exitCode: 0 };

    // 3. Expand wildcards (*, ?)
    const parts = this.expandGlobbing(tokens);

    const cmd = parts[0];
    const args = parts.slice(1);

    // Sudo handling
    if (cmd === 'sudo') {
      if (args.length === 0) {
        return { output: 'usage: sudo command [args...]\n', exitCode: 1 };
      }

      if (args[0] === 'su' || args[0] === '-i') {
        this.vfs.setCurrentUser('root');
        this.env.USER = 'root';
        this.vfs.setCwd('/root');
        this.env.PWD = '/root';
        return { output: 'Switched to root environment.\n', exitCode: 0 };
      }

      const prevUser = this.vfs.getCurrentUser();
      this.vfs.setCurrentUser('root');
      const innerCmd = args.join(' ');
      const result = this.executeSingle(innerCmd, stdinText);
      this.vfs.setCurrentUser(prevUser);
      return result;
    }

    // Su handling
    if (cmd === 'su') {
      const targetUser = args[0] || 'root';
      this.vfs.setCurrentUser(targetUser);
      this.env.USER = targetUser;
      const targetHome = targetUser === 'root' ? '/root' : `/home/${targetUser}`;
      this.vfs.setCwd(targetHome);
      this.env.PWD = targetHome;
      return { output: `Switched session to ${targetUser}.\n`, exitCode: 0 };
    }

    switch (cmd) {
      case 'pwd':
        return { output: this.vfs.getCwd() + '\n', exitCode: 0 };

      case 'cd': {
        const target = args[0] || '~';
        let dest = target;

        if (target === '-') {
          dest = this.oldPwd;
          const current = this.vfs.getCwd();
          const res = this.vfs.setCwd(dest);
          if (res.success) {
            this.oldPwd = current;
            this.env.PWD = this.vfs.getCwd();
            return { output: this.vfs.getCwd() + '\n', exitCode: 0 };
          }
          return { output: (res.error || 'bash: cd: error') + '\n', exitCode: 1 };
        }

        const current = this.vfs.getCwd();
        const res = this.vfs.setCwd(dest);
        if (res.success) {
          this.oldPwd = current;
          this.env.PWD = this.vfs.getCwd();
          return { output: '', exitCode: 0 };
        }
        return { output: (res.error || 'bash: cd: error') + '\n', exitCode: 1 };
      }

      case 'ls': {
        const showAll = args.some(a => a.startsWith('-') && (a.includes('a') || a.includes('A')));
        const longFormat = args.some(a => a.startsWith('-') && a.includes('l'));
        const humanFormat = args.some(a => a.startsWith('-') && a.includes('h'));
        const sortTime = args.some(a => a.startsWith('-') && a.includes('t'));
        const targets = args.filter(a => !a.startsWith('-'));

        const targetArg = targets[0] || '.';
        const entries = this.vfs.listDirectory(targetArg);

        if (entries === null) {
          const fileNode = this.vfs.getNode(targetArg);
          if (fileNode) {
            return { output: this.formatFileName(fileNode.name, fileNode) + '\n', exitCode: 0 };
          }
          return { output: `ls: cannot access '${targetArg}': No such file or directory\n`, exitCode: 2 };
        }

        let filtered = showAll ? entries : entries.filter(e => !e.name.startsWith('.'));
        if (sortTime) {
          filtered = [...filtered].reverse();
        }

        if (longFormat) {
          const lines = filtered.map(e => {
            const isDir = e.node.type === 'directory';
            const permPrefix = isDir ? 'd' : '-';
            const perm = permPrefix + (e.node.permissions || (isDir ? 'rwxr-xr-x' : 'rw-r--r--'));
            const owner = e.node.owner || 'user';
            const group = e.node.group || 'user';
            const rawSize = e.node.size ?? (isDir ? 4096 : (e.node.content?.length || 0));
            const sizeStr = humanFormat ? this.formatHumanSize(rawSize) : rawSize.toString().padStart(6);
            const dateStr = 'Oct 05 12:00';
            const styledName = this.formatFileName(e.name, e.node);
            return `${perm} 1 ${owner} ${group} ${sizeStr} ${dateStr} ${styledName}`;
          });
          const totalBlocks = Math.ceil(filtered.length * 4);
          return { output: `total ${totalBlocks}\n` + lines.join('\n') + (lines.length ? '\n' : ''), exitCode: 0 };
        }

        const formattedNames = filtered.map(e => this.formatFileName(e.name, e.node)).join('  ');
        return { output: formattedNames ? formattedNames + '\n' : '', exitCode: 0 };
      }

      case 'cat': {
        if (args.length === 0) {
          return { output: stdinText, exitCode: 0 };
        }
        const numberLines = args.includes('-n');
        const fileTargets = args.filter(a => !a.startsWith('-'));

        let out = '';
        let lineCounter = 1;

        for (const filePath of fileTargets) {
          const node = this.vfs.getNode(filePath);
          if (!node) {
            return { output: `cat: ${filePath}: No such file or directory\n`, exitCode: 1 };
          }
          if (node.type === 'directory') {
            return { output: `cat: ${filePath}: Is a directory\n`, exitCode: 1 };
          }
          if (!this.vfs.canRead(node)) {
            return { output: `cat: ${filePath}: Permission denied\n`, exitCode: 1 };
          }

          const rawContent = node.content || '';
          if (numberLines) {
            const lines = rawContent.split('\n');
            const numbered = lines.map(line => `     ${lineCounter++}  ${line}`).join('\n');
            out += numbered;
          } else {
            out += rawContent;
          }
        }
        return { output: out, exitCode: 0 };
      }

      case 'head': {
        let count = 10;
        const nIndex = args.indexOf('-n');
        if (nIndex !== -1 && args[nIndex + 1]) {
          count = parseInt(args[nIndex + 1], 10) || 10;
        }

        const fileTargets = args.filter((a, i) => !a.startsWith('-') && (i === 0 || args[i - 1] !== '-n'));
        const fileTarget = fileTargets[0];

        let content = stdinText;
        if (fileTarget) {
          const node = this.vfs.getNode(fileTarget);
          if (!node || node.type !== 'file') return { output: `head: cannot open '${fileTarget}': No such file\n`, exitCode: 1 };
          content = node.content || '';
        }
        const lines = content.split('\n').slice(0, count).join('\n');
        return { output: lines + (lines.length > 0 && !lines.endsWith('\n') ? '\n' : ''), exitCode: 0 };
      }

      case 'tail': {
        let count = 10;
        const nIndex = args.indexOf('-n');
        if (nIndex !== -1 && args[nIndex + 1]) {
          count = parseInt(args[nIndex + 1], 10) || 10;
        }

        const fileTargets = args.filter((a, i) => !a.startsWith('-') && (i === 0 || args[i - 1] !== '-n'));
        const fileTarget = fileTargets[0];

        let content = stdinText;
        if (fileTarget) {
          const node = this.vfs.getNode(fileTarget);
          if (!node || node.type !== 'file') return { output: `tail: cannot open '${fileTarget}': No such file\n`, exitCode: 1 };
          content = node.content || '';
        }
        const allLines = content.split('\n');
        const lines = allLines.slice(Math.max(0, allLines.length - count)).join('\n');
        return { output: lines + (lines.length > 0 && !lines.endsWith('\n') ? '\n' : ''), exitCode: 0 };
      }

      case 'echo': {
        const noNewline = args.includes('-n');
        const textArgs = args.filter(a => a !== '-n');
        let text = textArgs.join(' ');
        text = text.replace(/^["']|["']$/g, '');
        return { output: text + (noNewline ? '' : '\n'), exitCode: 0 };
      }

      case 'mkdir': {
        const recursive = args.includes('-p');
        const paths = args.filter(a => !a.startsWith('-'));
        if (paths.length === 0) {
          return { output: 'mkdir: missing operand\n', exitCode: 1 };
        }
        for (const p of paths) {
          const res = this.vfs.createDirectory(p, recursive);
          if (!res.success) {
            return { output: `mkdir: cannot create directory '${p}': ${res.error || 'Failed'}\n`, exitCode: 1 };
          }
        }
        return { output: '', exitCode: 0 };
      }

      case 'touch': {
        const files = args.filter(a => !a.startsWith('-'));
        if (files.length === 0) {
          return { output: 'touch: missing file operand\n', exitCode: 1 };
        }
        for (const f of files) {
          const existing = this.vfs.getNode(f);
          if (!existing) {
            const res = this.vfs.createFile(f, '');
            if (!res.success) {
              return { output: `touch: cannot touch '${f}': ${res.error}\n`, exitCode: 1 };
            }
          } else {
            existing.updatedAt = new Date().toISOString();
          }
        }
        return { output: '', exitCode: 0 };
      }

      case 'rm': {
        const recursive = args.some(a => a.startsWith('-') && (a.includes('r') || a.includes('R')));
        const force = args.some(a => a.startsWith('-') && a.includes('f'));
        const targets = args.filter(a => !a.startsWith('-'));

        for (const t of targets) {
          const res = this.vfs.removeNode(t, recursive);
          if (!res.success && !force) {
            return { output: (res.error || 'rm: failed') + '\n', exitCode: 1 };
          }
        }
        return { output: '', exitCode: 0 };
      }

      case 'cp': {
        const recursive = args.some(a => a.startsWith('-') && (a.includes('r') || a.includes('R')));
        const nonFlags = args.filter(a => !a.startsWith('-'));
        if (nonFlags.length < 2) {
          return { output: 'cp: missing destination file operand\n', exitCode: 1 };
        }
        const src = nonFlags[0];
        const dest = nonFlags[1];
        const res = this.vfs.copyNode(src, dest, recursive);
        if (!res.success) {
          return { output: `cp: ${res.error}\n`, exitCode: 1 };
        }
        return { output: '', exitCode: 0 };
      }

      case 'mv': {
        const nonFlags = args.filter(a => !a.startsWith('-'));
        if (nonFlags.length < 2) {
          return { output: 'mv: missing destination file operand\n', exitCode: 1 };
        }
        const src = nonFlags[0];
        const dest = nonFlags[1];
        const res = this.vfs.moveNode(src, dest);
        if (!res.success) {
          return { output: `mv: ${res.error}\n`, exitCode: 1 };
        }
        return { output: '', exitCode: 0 };
      }

      case 'grep': {
        const ignoreCase = args.some(a => a.startsWith('-') && a.includes('i'));
        const invert = args.some(a => a.startsWith('-') && a.includes('v'));
        const lineNums = args.some(a => a.startsWith('-') && a.includes('n'));
        const countOnly = args.some(a => a.startsWith('-') && a.includes('c'));
        const nonFlags = args.filter(a => !a.startsWith('-'));

        const pattern = nonFlags[0] || '';
        const fileTarget = nonFlags[1];

        let content = stdinText;
        if (fileTarget) {
          const node = this.vfs.getNode(fileTarget);
          if (!node || node.type !== 'file') {
            return { output: `grep: ${fileTarget}: No such file or directory\n`, exitCode: 2 };
          }
          content = node.content || '';
        }

        const lines = content.split('\n');
        let matchCount = 0;
        const matchedLines: string[] = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (!line && i === lines.length - 1) continue;

          let hasMatch = false;
          try {
            const regex = new RegExp(pattern, ignoreCase ? 'i' : '');
            hasMatch = regex.test(line);
          } catch {
            hasMatch = ignoreCase
              ? line.toLowerCase().includes(pattern.toLowerCase())
              : line.includes(pattern);
          }

          const shouldInclude = invert ? !hasMatch : hasMatch;
          if (shouldInclude) {
            matchCount++;
            const linePrefix = lineNums ? `\x1b[32m${i + 1}\x1b[0m:` : '';
            matchedLines.push(`${linePrefix}${line}`);
          }
        }

        if (countOnly) {
          return { output: `${matchCount}\n`, exitCode: matchCount > 0 ? 0 : 1 };
        }

        return {
          output: matchedLines.join('\n') + (matchedLines.length > 0 ? '\n' : ''),
          exitCode: matchCount > 0 ? 0 : 1,
        };
      }

      case 'find': {
        const targetDir = args.find(a => !a.startsWith('-')) || '.';
        const nameIdx = args.indexOf('-name');
        const pattern = nameIdx !== -1 ? args[nameIdx + 1]?.replace(/['"]/g, '') : null;
        const typeIdx = args.indexOf('-type');
        const typeFilter = typeIdx !== -1 ? args[typeIdx + 1] : null;

        const all = this.vfs.getAllFiles(targetDir);
        const matches = all.filter(({ node }) => {
          if (typeFilter === 'f' && node.type !== 'file') return false;
          if (typeFilter === 'd' && node.type !== 'directory') return false;
          if (pattern) {
            const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
            return regex.test(node.name);
          }
          return true;
        });

        const paths = matches.map(m => m.path).join('\n');
        return { output: paths ? paths + '\n' : '', exitCode: 0 };
      }

      case 'wc': {
        const linesOnly = args.includes('-l');
        const wordsOnly = args.includes('-w');
        const bytesOnly = args.includes('-c');
        const fileTarget = args.find(a => !a.startsWith('-'));

        let content = stdinText;
        if (fileTarget) {
          const node = this.vfs.getNode(fileTarget);
          if (!node || node.type !== 'file') {
            return { output: `wc: ${fileTarget}: No such file or directory\n`, exitCode: 1 };
          }
          content = node.content || '';
        }

        const linesArr = content ? content.split('\n') : [];
        const numLines = linesArr.length > 0 && linesArr[linesArr.length - 1] === '' ? linesArr.length - 1 : linesArr.length;
        const numWords = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
        const numBytes = content.length;

        if (linesOnly) return { output: `${numLines} ${fileTarget || ''}\n`.trimStart(), exitCode: 0 };
        if (wordsOnly) return { output: `${numWords} ${fileTarget || ''}\n`.trimStart(), exitCode: 0 };
        if (bytesOnly) return { output: `${numBytes} ${fileTarget || ''}\n`.trimStart(), exitCode: 0 };
        return { output: `  ${numLines}   ${numWords}  ${numBytes} ${fileTarget || ''}\n`, exitCode: 0 };
      }

      case 'sort': {
        const reverse = args.includes('-r');
        const numeric = args.includes('-n');
        const unique = args.includes('-u');
        const fileTarget = args.find(a => !a.startsWith('-'));

        let content = stdinText;
        if (fileTarget) {
          const node = this.vfs.getNode(fileTarget);
          if (node && node.type === 'file') content = node.content || '';
        }

        let lines = content.split('\n').filter(Boolean);
        lines.sort((a, b) => {
          if (numeric) {
            const na = parseFloat(a) || 0;
            const nb = parseFloat(b) || 0;
            return na - nb;
          }
          return a.localeCompare(b);
        });

        if (reverse) lines.reverse();
        if (unique) lines = Array.from(new Set(lines));

        return { output: lines.join('\n') + (lines.length ? '\n' : ''), exitCode: 0 };
      }

      case 'uniq': {
        const count = args.includes('-c');
        const fileTarget = args.find(a => !a.startsWith('-'));

        let content = stdinText;
        if (fileTarget) {
          const node = this.vfs.getNode(fileTarget);
          if (node && node.type === 'file') content = node.content || '';
        }

        const lines = content.split('\n').filter(Boolean);
        const result: string[] = [];

        for (let i = 0; i < lines.length; i++) {
          if (i === 0 || lines[i] !== lines[i - 1]) {
            if (count) {
              let c = 1;
              while (i + 1 < lines.length && lines[i + 1] === lines[i]) {
                c++;
                i++;
              }
              result.push(`   ${c} ${lines[i]}`);
            } else {
              result.push(lines[i]);
            }
          }
        }

        return { output: result.join('\n') + (result.length ? '\n' : ''), exitCode: 0 };
      }

      case 'sed': {
        // Simple s/find/replace/g
        const expr = args.find(a => a.startsWith('s/'));
        const fileTarget = args.find(a => !a.startsWith('-') && a !== expr);

        let content = stdinText;
        if (fileTarget) {
          const node = this.vfs.getNode(fileTarget);
          if (node && node.type === 'file') content = node.content || '';
        }

        if (expr) {
          const parts = expr.split('/');
          const findPattern = parts[1] || '';
          const replacePattern = parts[2] || '';
          const isGlobal = (parts[3] || '').includes('g');
          const regex = new RegExp(findPattern, isGlobal ? 'g' : '');
          content = content.replace(regex, replacePattern);
        }

        return { output: content, exitCode: 0 };
      }

      case 'awk': {
        // Simple awk '{print $1, $2}'
        const script = args.find(a => a.includes('{print')) || '';
        const fileTarget = args.find(a => !a.startsWith('-') && a !== script);

        let content = stdinText;
        if (fileTarget) {
          const node = this.vfs.getNode(fileTarget);
          if (node && node.type === 'file') content = node.content || '';
        }

        const lines = content.split('\n').filter(Boolean);
        const outputLines = lines.map(line => {
          const cols = line.trim().split(/\s+/);
          if (script.includes('$1')) {
            const wanted: string[] = [];
            if (script.includes('$1')) wanted.push(cols[0] || '');
            if (script.includes('$2')) wanted.push(cols[1] || '');
            if (script.includes('$3')) wanted.push(cols[2] || '');
            if (script.includes('$4')) wanted.push(cols[3] || '');
            return wanted.join(' ');
          }
          return line;
        });

        return { output: outputLines.join('\n') + '\n', exitCode: 0 };
      }

      case 'chmod': {
        if (args.length < 2) {
          return { output: 'chmod: missing operand\nTry \'chmod --help\' for more information.\n', exitCode: 1 };
        }
        const mode = args[0];
        const fileTarget = args[1];
        const node = this.vfs.getNode(fileTarget);
        if (!node) {
          return { output: `chmod: cannot access '${fileTarget}': No such file or directory\n`, exitCode: 1 };
        }

        if (mode === '755') node.permissions = 'rwxr-xr-x';
        else if (mode === '700') node.permissions = 'rwx------';
        else if (mode === '644') node.permissions = 'rw-r--r--';
        else if (mode === '600') node.permissions = 'rw-------';
        else if (mode === '777') node.permissions = 'rwxrwxrwx';
        else if (mode.includes('+x')) node.permissions = 'rwxr-xr-x';
        else if (mode.includes('-x')) node.permissions = 'rw-r--r--';
        else node.permissions = 'rwxr-xr-x';

        return { output: '', exitCode: 0 };
      }

      case 'chown': {
        if (args.length < 2) {
          return { output: 'chown: missing operand\n', exitCode: 1 };
        }
        const [ownerGroup, target] = args;
        const node = this.vfs.getNode(target);
        if (!node) return { output: `chown: cannot access '${target}': No such file or directory\n`, exitCode: 1 };

        const [owner, group] = ownerGroup.split(':');
        if (owner) node.owner = owner;
        if (group) node.group = group;
        return { output: '', exitCode: 0 };
      }

      case 'tree': {
        const treeText = this.renderAsciiTree(this.vfs.getCwd());
        return { output: treeText, exitCode: 0 };
      }

      case 'curl': {
        const url = args.find(a => !a.startsWith('-')) || '';
        if (!url) return { output: 'curl: try \'curl --help\' for more information\n', exitCode: 2 };

        if (url.includes('health') || url.includes('status')) {
          return {
            output: `{\n  "service": "worldbanc-core-api",\n  "status": "healthy",\n  "node": "${this.env.HOSTNAME}",\n  "uptime_seconds": 142852,\n  "cluster_integrity": "OK"\n}\n`,
            exitCode: 0,
          };
        }

        return {
          output: `<!DOCTYPE html>\n<html>\n<head><title>WorldBanc Enterprise</title></head>\n<body>\n<h1>Secure Cluster Online</h1>\n<p>Node: ${this.env.HOSTNAME}</p>\n</body>\n</html>\n`,
          exitCode: 0,
        };
      }

      case 'ping': {
        const host = args.find(a => !a.startsWith('-')) || '127.0.0.1';
        const pingOutput = 
`PING ${host} (${host}) 56(84) bytes of data.
64 bytes from ${host}: icmp_seq=1 ttl=118 time=14.2 ms
64 bytes from ${host}: icmp_seq=2 ttl=118 time=13.8 ms
64 bytes from ${host}: icmp_seq=3 ttl=118 time=14.1 ms
64 bytes from ${host}: icmp_seq=4 ttl=118 time=13.9 ms

--- ${host} ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3004ms
rtt min/avg/max/mdev = 13.801/14.012/14.218/0.145 ms
`;
        return { output: pingOutput, exitCode: 0 };
      }

      case 'ss':
      case 'netstat': {
        const sockets = 
`State    Recv-Q  Send-Q   Local Address:Port    Peer Address:Port  Process
LISTEN   0       128            0.0.0.0:22           0.0.0.0:*      users:(("sshd",pid=4412,fd=3))
LISTEN   0       511            0.0.0.0:80           0.0.0.0:*      users:(("nginx",pid=1202,fd=6))
LISTEN   0       128          127.0.0.1:5432         0.0.0.0:*      users:(("postgres",pid=891,fd=4))
ESTAB    0       0          10.0.4.15:22       192.168.1.102:42100  users:(("sshd",pid=4412,fd=4))
`;
        return { output: sockets, exitCode: 0 };
      }

      case 'ps': {
        const psOut = 
`  PID TTY          TIME CMD
    1 ?        00:00:02 systemd
  102 ?        00:00:00 cron
  891 ?        00:00:04 postgres: main
 1202 ?        00:00:01 nginx: worker process
 1299 ?        00:00:05 worldbanc-sec-daemon
 4412 ?        00:00:01 sshd: user@pts/0
 7820 pts/0    00:00:00 bash
 8104 pts/0    00:00:00 ps
`;
        return { output: psOut, exitCode: 0 };
      }

      case 'kill': {
        const pid = args.find(a => !a.startsWith('-'));
        if (!pid) return { output: 'kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ...\n', exitCode: 1 };
        return { output: `[Process ${pid} terminated with SIGTERM]\n`, exitCode: 0 };
      }

      case 'systemctl':
      case 'service': {
        const action = args[0];
        const unit = args[1] || 'sshd';
        if (action === 'status') {
          return {
            output: `● ${unit}.service - OpenSSH server daemon\n   Loaded: loaded (/lib/systemd/system/${unit}.service; enabled; vendor preset: enabled)\n   Active: active (running) since Mon 2026-10-05 08:12:04 UTC; 6h ago\n Main PID: 4412 (sshd)\n    Tasks: 2 (limit: 18942)\n   Memory: 8.2M\n   CGroup: /system.slice/${unit}.service\n           └─4412 /usr/sbin/sshd -D\n`,
            exitCode: 0,
          };
        }
        return { output: `[OK] Unit ${unit}.service processed action '${action}'.\n`, exitCode: 0 };
      }

      case 'df': {
        const dfOut = 
`Filesystem     1K-blocks      Used Available Use% Mounted on
udev            16384256         0  16384256   0% /dev
tmpfs            3284092      1420   3282672   1% /run
/dev/sda1       98294720  18459200  74783520  20% /
tmpfs           16420460         0  16420460   0% /dev/shm
`;
        return { output: dfOut, exitCode: 0 };
      }

      case 'free': {
        const freeOut = 
`               total        used        free      shared  buff/cache   available
Mem:        32840920     4926064    21482012       24512     6432844    27914856
Swap:        2097148           0     2097148
`;
        return { output: freeOut, exitCode: 0 };
      }

      case 'uptime':
        return { output: ` 14:15:22 up 6:03,  2 users,  load average: 0.14, 0.08, 0.02\n`, exitCode: 0 };

      case 'id': {
        const isRoot = this.vfs.isRoot();
        if (isRoot) return { output: 'uid=0(root) gid=0(root) groups=0(root)\n', exitCode: 0 };
        return { output: 'uid=1000(user) gid=1000(user) groups=1000(user),27(sudo),100(users)\n', exitCode: 0 };
      }

      case 'whoami':
        return { output: this.vfs.getCurrentUser() + '\n', exitCode: 0 };

      case 'uname': {
        const all = args.includes('-a');
        if (all) {
          return { output: 'Linux worldbanc-sec-01 6.8.9-arch1-1-tuxquest #1 SMP PREEMPT_DYNAMIC Mon Oct 5 12:00:00 UTC 2026 x86_64 GNU/Linux\n', exitCode: 0 };
        }
        return { output: 'Linux\n', exitCode: 0 };
      }

      case 'date': {
        const d = new Date().toUTCString();
        return { output: d + '\n', exitCode: 0 };
      }

      case 'which': {
        const target = args[0];
        if (!target) return { output: '', exitCode: 1 };
        const found = this.vfs.getNode(`/bin/${target}`) || this.vfs.getNode(`/usr/bin/${target}`);
        if (found) return { output: `/bin/${target}\n`, exitCode: 0 };
        return { output: `which: no ${target} in (${this.env.PATH})\n`, exitCode: 1 };
      }

      case 'whereis': {
        const target = args[0] || '';
        return { output: `${target}: /bin/${target} /usr/bin/${target} /usr/share/man/man1/${target}.1.gz\n`, exitCode: 0 };
      }

      case 'env': {
        const envLines = Object.entries(this.env).map(([k, v]) => `${k}=${v}`).join('\n');
        return { output: envLines + '\n', exitCode: 0 };
      }

      case 'export': {
        if (args.length === 0) return this.executeSingle('env');
        for (const arg of args) {
          const [key, val] = arg.split('=');
          if (key) {
            this.env[key] = (val || '').replace(/^["']|["']$/g, '');
          }
        }
        return { output: '', exitCode: 0 };
      }

      case 'alias': {
        if (args.length === 0) {
          const aliasList = Object.entries(this.aliases).map(([k, v]) => `alias ${k}='${v}'`).join('\n');
          return { output: aliasList + '\n', exitCode: 0 };
        }
        for (const arg of args) {
          const [k, v] = arg.split('=');
          if (k && v) {
            this.aliases[k] = v.replace(/^['"]|['"]$/g, '');
          }
        }
        return { output: '', exitCode: 0 };
      }

      case 'history': {
        const lines = this.history.map((h, i) => `  ${(i + 1).toString().padStart(4)}  ${h}`).join('\n');
        return { output: lines + '\n', exitCode: 0 };
      }

      case 'clear':
        return { output: '\x1b[2J\x1b[H', exitCode: 0 };

      case 'man': {
        const subject = args[0];
        if (!subject) return { output: 'What manual page do you want?\n', exitCode: 1 };
        return { output: this.getManPage(subject), exitCode: 0 };
      }

      case 'help': {
        const helpText = 
`GNU bash, version 5.2.21(1)-release (x86_64-pc-linux-gnu)
These shell commands are defined internally. Type 'help' to see this list.
Type 'man <command>' for full documentation.

Files & Navigation:
  pwd, cd, ls (-la, -lh), tree, touch, mkdir (-p), rm (-rf), cp (-r), mv

Inspection & Processing:
  cat (-n), head (-n), tail (-n), grep (-i, -v, -n, -c), wc (-l, -w, -c),
  sort (-r, -n, -u), uniq (-c), sed, awk, find

System & Networking:
  sudo, su, whoami, id, uname (-a), date, uptime, free, df, ps, kill,
  ping, curl, ss, netstat, systemctl, which, env, export, alias, history
`;
        return { output: helpText, exitCode: 0 };
      }

      default:
        return { output: `bash: ${cmd}: command not found\n`, exitCode: 127 };
    }
  }

  private expandVariables(str: string): string {
    return str.replace(/\$(\w+|\?)/g, (_, varName) => {
      if (varName === '?') return this.lastExitCode.toString();
      return this.env[varName] !== undefined ? this.env[varName] : '';
    });
  }

  private expandGlobbing(tokens: string[]): string[] {
    const result: string[] = [];

    for (const token of tokens) {
      if (token.includes('*') || token.includes('?')) {
        const dir = token.includes('/') ? token.slice(0, token.lastIndexOf('/')) || '/' : '.';
        const pattern = token.includes('/') ? token.slice(token.lastIndexOf('/') + 1) : token;
        const entries = this.vfs.listDirectory(dir);

        if (entries) {
          const regexStr = '^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.') + '$';
          const regex = new RegExp(regexStr);
          const matched = entries.filter(e => regex.test(e.name)).map(e => {
            return dir === '.' ? e.name : `${dir}/${e.name}`;
          });

          if (matched.length > 0) {
            result.push(...matched);
            continue;
          }
        }
      }
      result.push(token);
    }

    return result;
  }

  private formatFileName(name: string, node: FileNode): string {
    if (node.type === 'directory') {
      return `\x1b[1;34m${name}\x1b[0m`; // Blue directory
    }
    const perm = node.permissions || '';
    if (perm.includes('x')) {
      return `\x1b[1;32m${name}\x1b[0m`; // Green executable
    }
    if (name.endsWith('.tar') || name.endsWith('.gz') || name.endsWith('.zip')) {
      return `\x1b[1;31m${name}\x1b[0m`; // Red archive
    }
    return name;
  }

  private formatHumanSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`.padStart(6);
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`.padStart(6);
    return `${(bytes / (1024 * 1024)).toFixed(1)}M`.padStart(6);
  }

  private renderAsciiTree(path: string): string {
    const lines: string[] = [path];
    const walk = (dir: string, prefix: string) => {
      const items = this.vfs.listDirectory(dir);
      if (!items) return;
      items.forEach((item, index) => {
        const isLast = index === items.length - 1;
        const branch = isLast ? '└── ' : '├── ';
        const childPrefix = isLast ? '    ' : '│   ';
        const formatted = this.formatFileName(item.name, item.node);
        lines.push(`${prefix}${branch}${formatted}`);
        if (item.node.type === 'directory') {
          const nextDir = dir === '/' ? `/${item.name}` : `${dir}/${item.name}`;
          walk(nextDir, prefix + childPrefix);
        }
      });
    };
    walk(path, '');
    return lines.join('\n') + '\n';
  }

  private getManPage(cmd: string): string {
    const pages: Record<string, string> = {
      grep: `GREP(1)                          User Commands                         GREP(1)

NAME
       grep - print lines that match patterns

SYNOPSIS
       grep [OPTION...] PATTERNS [FILE...]

DESCRIPTION
       grep searches for PATTERNS in each FILE. By default, grep prints
       the matching lines.

OPTIONS
       -i, --ignore-case
              Ignore case distinctions in patterns and input data.
       -v, --invert-match
              Invert the sense of matching, to select non-matching lines.
       -n, --line-number
              Prefix each line of output with the 1-based line number.
       -c, --count
              Suppress normal output; instead print a count of matching lines.

EXAMPLES
       grep "ERROR" /var/log/syslog
       cat access.log | grep -i "failed"
`,
      chmod: `CHMOD(1)                         User Commands                         CHMOD(1)

NAME
       chmod - change file mode bits

SYNOPSIS
       chmod [OPTION]... MODE[,MODE]... FILE...

DESCRIPTION
       chmod changes the file mode bits of each given file according to
       mode, which can be either a symbolic representation or an octal number.

       Octal modes:
         755: rwxr-xr-x (User read/write/exec, group/other read/exec)
         644: rw-r--r-- (User read/write, group/other read)
         600: rw------- (User read/write only, secure private)

EXAMPLES
       chmod 755 patch.sh
       chmod +x script.sh
`,
      cat: `CAT(1)                           User Commands                          CAT(1)

NAME
       cat - concatenate files and print on the standard output

SYNOPSIS
       cat [OPTION]... [FILE]...

DESCRIPTION
       Concatenate FILE(s) to standard output.
       With no FILE, or when FILE is -, read standard input.

       -n, --number
              Number all output lines.
`,
    };

    return pages[cmd] || `No manual entry for ${cmd}.\nTry 'help' or '${cmd} --help'.\n`;
  }

  public getCompletions(currentWord: string): string[] {
    const builtins = [
      'ls', 'cd', 'pwd', 'cat', 'echo', 'mkdir', 'touch', 'rm', 'cp', 'mv',
      'grep', 'wc', 'chmod', 'chown', 'whoami', 'uname', 'ps', 'kill',
      'head', 'tail', 'clear', 'history', 'help', 'man', 'sudo', 'su',
      'tree', 'curl', 'ping', 'ss', 'df', 'free', 'uptime', 'id', 'date',
      'which', 'env', 'export', 'alias', 'sort', 'uniq', 'sed', 'awk', 'find'
    ];

    if (!currentWord.includes('/')) {
      const cmdMatches = builtins.filter(b => b.startsWith(currentWord));
      const fileMatches = (this.vfs.listDirectory() || [])
        .map(e => e.name)
        .filter(n => n.startsWith(currentWord));
      return [...cmdMatches, ...fileMatches];
    }

    const lastSlash = currentWord.lastIndexOf('/');
    const dirPart = currentWord.slice(0, lastSlash) || '/';
    const prefix = currentWord.slice(lastSlash + 1);

    const entries = this.vfs.listDirectory(dirPart);
    if (!entries) return [];

    return entries
      .filter(e => e.name.startsWith(prefix))
      .map(e => dirPart === '/' ? `/${e.name}` : `${dirPart}/${e.name}`);
  }

  private tokenize(str: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = '';
      } else if (char === ' ' && !inQuotes) {
        if (current.length > 0) {
          tokens.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }
    if (current.length > 0) tokens.push(current);
    return tokens;
  }
}
