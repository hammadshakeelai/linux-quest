import { VirtualFS } from './vfs';

export interface CommandResult {
  output: string;
  exitCode: number;
}

export class ShellService {
  private vfs: VirtualFS;
  private history: string[] = [];
  public env: Record<string, string> = {
    USER: 'user',
    HOME: '/home/user',
    SHELL: '/bin/bash',
    PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
    TERM: 'xterm-256color',
  };

  constructor(vfs: VirtualFS) {
    this.vfs = vfs;
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

  public getPrompt(): string {
    const cwd = this.vfs.getCwd();
    const displayPath = cwd.startsWith('/home/user') 
      ? '~' + cwd.slice('/home/user'.length) 
      : cwd;
    return `user@worldbanc:${displayPath}$`;
  }

  public execute(rawInput: string): CommandResult {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      return { output: '', exitCode: 0 };
    }

    this.history.push(trimmed);

    // Support pipeline: cmd1 | cmd2 | cmd3
    if (trimmed.includes('|')) {
      return this.executePipeline(trimmed);
    }

    // Support output redirection: cmd > file or cmd >> file
    if (trimmed.includes('>') || trimmed.includes('>>')) {
      return this.executeRedirection(trimmed);
    }

    return this.executeSingle(trimmed);
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
    const targetNode = this.vfs.getNode(targetFile);

    let newContent = execResult.output;
    if (isAppend && targetNode && targetNode.type === 'file') {
      newContent = (targetNode.content || '') + execResult.output;
    }

    const created = this.vfs.createFile(targetFile, newContent);
    if (!created) {
      return { output: `bash: ${targetFile}: Permission denied or invalid directory\n`, exitCode: 1 };
    }

    return { output: '', exitCode: 0 };
  }

  public executeSingle(commandLine: string, stdinText: string = ''): CommandResult {
    const parts = this.tokenize(commandLine);
    if (parts.length === 0) return { output: '', exitCode: 0 };

    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
      case 'pwd':
        return { output: this.vfs.getCwd() + '\n', exitCode: 0 };

      case 'cd': {
        const target = args[0] || '~';
        const ok = this.vfs.setCwd(target);
        if (!ok) {
          return { output: `bash: cd: ${target}: No such file or directory\n`, exitCode: 1 };
        }
        return { output: '', exitCode: 0 };
      }

      case 'ls': {
        const showAll = args.some(a => a.startsWith('-') && a.includes('a'));
        const longFormat = args.some(a => a.startsWith('-') && a.includes('l'));
        const targetArg = args.find(a => !a.startsWith('-')) || '.';

        const entries = this.vfs.listDirectory(targetArg);
        if (entries === null) {
          const fileNode = this.vfs.getNode(targetArg);
          if (fileNode) {
            return { output: fileNode.name + '\n', exitCode: 0 };
          }
          return { output: `ls: cannot access '${targetArg}': No such file or directory\n`, exitCode: 2 };
        }

        const filtered = showAll ? entries : entries.filter(e => !e.name.startsWith('.'));
        if (longFormat) {
          const lines = filtered.map(e => {
            const isDir = e.node.type === 'directory';
            const permPrefix = isDir ? 'd' : '-';
            const perm = permPrefix + (e.node.permissions || 'rw-r--r--');
            const owner = e.node.owner || 'user';
            const group = e.node.group || 'user';
            const size = (e.node.size ?? (isDir ? 4096 : (e.node.content?.length || 0))).toString().padStart(6);
            const dateStr = 'Oct 05 12:00';
            return `${perm} 1 ${owner} ${group} ${size} ${dateStr} ${e.name}`;
          });
          return { output: `total ${filtered.length * 4}\n` + lines.join('\n') + (lines.length ? '\n' : ''), exitCode: 0 };
        }

        const names = filtered.map(e => e.name).join('  ');
        return { output: names ? names + '\n' : '', exitCode: 0 };
      }

      case 'cat': {
        if (args.length === 0) {
          return { output: stdinText, exitCode: 0 };
        }
        let out = '';
        for (const filePath of args) {
          const node = this.vfs.getNode(filePath);
          if (!node) {
            return { output: `cat: ${filePath}: No such file or directory\n`, exitCode: 1 };
          }
          if (node.type === 'directory') {
            return { output: `cat: ${filePath}: Is a directory\n`, exitCode: 1 };
          }
          out += (node.content || '');
        }
        return { output: out, exitCode: 0 };
      }

      case 'echo': {
        const text = args.join(' ').replace(/^["']|["']$/g, '');
        return { output: text + '\n', exitCode: 0 };
      }

      case 'mkdir': {
        const recursive = args.includes('-p');
        const paths = args.filter(a => !a.startsWith('-'));
        if (paths.length === 0) {
          return { output: 'mkdir: missing operand\n', exitCode: 1 };
        }
        for (const p of paths) {
          const ok = this.vfs.createDirectory(p, recursive);
          if (!ok) {
            return { output: `mkdir: cannot create directory '${p}': No such file or directory\n`, exitCode: 1 };
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
            this.vfs.createFile(f, '');
          }
        }
        return { output: '', exitCode: 0 };
      }

      case 'rm': {
        const recursive = args.some(a => a.startsWith('-') && (a.includes('r') || a.includes('R')));
        const targets = args.filter(a => !a.startsWith('-'));
        for (const t of targets) {
          const ok = this.vfs.removeNode(t, recursive);
          if (!ok) {
            return { output: `rm: cannot remove '${t}': No such file or directory or is a non-empty directory\n`, exitCode: 1 };
          }
        }
        return { output: '', exitCode: 0 };
      }

      case 'grep': {
        const ignoreCase = args.some(a => a.startsWith('-') && a.includes('i'));
        const invert = args.some(a => a.startsWith('-') && a.includes('v'));
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
        const matched = lines.filter(line => {
          let hasMatch = false;
          if (ignoreCase) {
            hasMatch = line.toLowerCase().includes(pattern.toLowerCase());
          } else {
            hasMatch = line.includes(pattern);
          }
          return invert ? !hasMatch : hasMatch;
        });

        return { output: matched.join('\n') + (matched.length > 0 ? '\n' : ''), exitCode: matched.length > 0 ? 0 : 1 };
      }

      case 'wc': {
        const linesOnly = args.includes('-l');
        const wordsOnly = args.includes('-w');
        const fileTarget = args.find(a => !a.startsWith('-'));

        let content = stdinText;
        if (fileTarget) {
          const node = this.vfs.getNode(fileTarget);
          if (!node || node.type !== 'file') {
            return { output: `wc: ${fileTarget}: No such file or directory\n`, exitCode: 1 };
          }
          content = node.content || '';
        }

        const numLines = content ? content.split('\n').filter(Boolean).length : 0;
        const numWords = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
        const numBytes = content.length;

        if (linesOnly) {
          return { output: `${numLines} ${fileTarget || ''}\n`.trimStart(), exitCode: 0 };
        }
        if (wordsOnly) {
          return { output: `${numWords} ${fileTarget || ''}\n`.trimStart(), exitCode: 0 };
        }
        return { output: `  ${numLines}   ${numWords}  ${numBytes} ${fileTarget || ''}\n`, exitCode: 0 };
      }

      case 'chmod': {
        if (args.length < 2) {
          return { output: 'chmod: missing operand\n', exitCode: 1 };
        }
        const mode = args[0];
        const fileTarget = args[1];
        const node = this.vfs.getNode(fileTarget);
        if (!node) {
          return { output: `chmod: cannot access '${fileTarget}': No such file or directory\n`, exitCode: 1 };
        }
        if (mode.includes('+x')) {
          node.permissions = 'rwxr-xr-x';
        } else if (mode === '755') {
          node.permissions = 'rwxr-xr-x';
        } else if (mode === '700') {
          node.permissions = 'rwx------';
        } else if (mode === '644') {
          node.permissions = 'rw-r--r--';
        } else if (mode === '600') {
          node.permissions = 'rw-------';
        } else {
          node.permissions = 'rwxr-xr-x';
        }
        return { output: '', exitCode: 0 };
      }

      case 'whoami':
        return { output: 'user\n', exitCode: 0 };

      case 'uname':
        return { output: 'Linux worldbanc-node-01 6.8.9-arch1-1 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux\n', exitCode: 0 };

      case 'ps': {
        const psOut = 
`  PID TTY          TIME CMD
    1 ?        00:00:02 systemd
  102 ?        00:00:00 cron
 1299 ?        00:00:05 worldbanc-sec-daemon
 4412 ?        00:00:01 sshd
 7820 pts/0    00:00:00 bash
 7891 pts/0    00:00:00 ps
`;
        return { output: psOut, exitCode: 0 };
      }

      case 'kill': {
        const pid = args.find(a => !a.startsWith('-'));
        if (!pid) return { output: 'kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ...\n', exitCode: 1 };
        return { output: `[Process ${pid} terminated with SIGTERM]\n`, exitCode: 0 };
      }

      case 'head': {
        const fileTarget = args.find(a => !a.startsWith('-'));
        let content = stdinText;
        if (fileTarget) {
          const node = this.vfs.getNode(fileTarget);
          if (!node || node.type !== 'file') return { output: `head: ${fileTarget}: No such file\n`, exitCode: 1 };
          content = node.content || '';
        }
        const lines = content.split('\n').slice(0, 10).join('\n');
        return { output: lines + '\n', exitCode: 0 };
      }

      case 'tail': {
        const fileTarget = args.find(a => !a.startsWith('-'));
        let content = stdinText;
        if (fileTarget) {
          const node = this.vfs.getNode(fileTarget);
          if (!node || node.type !== 'file') return { output: `tail: ${fileTarget}: No such file\n`, exitCode: 1 };
          content = node.content || '';
        }
        const allLines = content.split('\n');
        const lines = allLines.slice(Math.max(0, allLines.length - 10)).join('\n');
        return { output: lines + '\n', exitCode: 0 };
      }

      case 'clear':
        return { output: '\x1b[2J\x1b[H', exitCode: 0 };

      case 'history': {
        const historyLines = this.history.map((h, i) => `  ${i + 1}  ${h}`).join('\n');
        return { output: historyLines + '\n', exitCode: 0 };
      }

      case 'man':
      case 'help': {
        const helpText = 
`TuxQuest Linux Shell - Available commands:
  Navigation:   pwd, cd, ls (-la)
  File Ops:     cat, head, tail, touch, mkdir (-p), rm (-rf), echo
  Manipulation: grep (-i, -v), wc (-l, -w), chmod
  System:       whoami, uname, ps, kill, history, clear, help
  Features:     Pipes (|), Output redirection (>, >>), Tab completion
`;
        return { output: helpText, exitCode: 0 };
      }

      default:
        return { output: `bash: ${cmd}: command not found\n`, exitCode: 127 };
    }
  }

  public getCompletions(currentWord: string): string[] {
    const builtins = ['ls', 'cd', 'pwd', 'cat', 'echo', 'mkdir', 'touch', 'rm', 'grep', 'wc', 'chmod', 'whoami', 'uname', 'ps', 'kill', 'head', 'tail', 'clear', 'history', 'help'];
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
