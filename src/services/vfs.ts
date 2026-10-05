import type { FileNode } from '../types';

export interface VFSState {
  root: FileNode;
  cwd: string; // e.g. "/home/user"
}

export class VirtualFS {
  private root: FileNode;
  private cwd: string;

  constructor(initialTree?: FileNode, initialCwd: string = '/home/user') {
    this.root = initialTree || this.getDefaultTree();
    this.cwd = initialCwd;
  }

  public getDefaultTree(): FileNode {
    return {
      name: '/',
      type: 'directory',
      permissions: 'rwxr-xr-x',
      owner: 'root',
      group: 'root',
      children: {
        'bin': {
          name: 'bin',
          type: 'directory',
          permissions: 'rwxr-xr-x',
          owner: 'root',
          group: 'root',
          children: {
            'bash': { name: 'bash', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', size: 1113504 },
            'ls': { name: 'ls', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', size: 142144 },
            'cat': { name: 'cat', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', size: 35064 },
            'grep': { name: 'grep', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', size: 154800 },
          }
        },
        'etc': {
          name: 'etc',
          type: 'directory',
          permissions: 'rwxr-xr-x',
          owner: 'root',
          group: 'root',
          children: {
            'hostname': { name: 'hostname', type: 'file', permissions: 'rw-r--r--', owner: 'root', content: 'tuxquest-node-1\n' },
            'os-release': { name: 'os-release', type: 'file', permissions: 'rw-r--r--', owner: 'root', content: 'NAME="LinuxQuest OS"\nVERSION="2.4 LTS"\nID=tuxquest\nPRETTY_NAME="LinuxQuest Arch Linux 6.8.9-arch1-1"\n' },
            'passwd': { name: 'passwd', type: 'file', permissions: 'rw-r--r--', owner: 'root', content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:Linux Explorer:/home/user:/bin/bash\n' }
          }
        },
        'var': {
          name: 'var',
          type: 'directory',
          permissions: 'rwxr-xr-x',
          owner: 'root',
          group: 'root',
          children: {
            'log': {
              name: 'log',
              type: 'directory',
              permissions: 'rwxr-xr-x',
              owner: 'root',
              group: 'root',
              children: {
                'syslog': {
                  name: 'syslog',
                  type: 'file',
                  permissions: 'rw-r--r--',
                  owner: 'root',
                  content: 'Oct 05 08:12:01 kernel: CPU0: Intel Core Processor\nOct 05 08:12:04 systemd[1]: Started Network Service.\nOct 05 08:14:22 sshd[4412]: Failed password for root from 192.168.1.102 port 42100 ssh2\nOct 05 08:15:33 auth: [ERROR] Unauthorized breach attempt detected in sector 7\nOct 05 08:16:01 cron[102]: (root) CMD (/usr/bin/security_scan.sh)\nOct 05 08:18:44 app[1299]: [INFO] Daemon health check passed (200 OK)\nOct 05 08:22:10 sshd[4490]: [ERROR] Connection timed out after 3 retries\n'
                }
              }
            }
          }
        },
        'home': {
          name: 'home',
          type: 'directory',
          permissions: 'rwxr-xr-x',
          owner: 'root',
          group: 'root',
          children: {
            'user': {
              name: 'user',
              type: 'directory',
              permissions: 'rwxr-xr-x',
              owner: 'user',
              group: 'user',
              children: {
                'welcome.txt': {
                  name: 'welcome.txt',
                  type: 'file',
                  permissions: 'rw-r--r--',
                  owner: 'user',
                  group: 'user',
                  content: 'Welcome to TuxQuest!\nYour journey into Linux terminal mastery begins here.\nRun `ls` to view files and `cat welcome.txt` to read this.\n'
                },
                'notes': {
                  name: 'notes',
                  type: 'directory',
                  permissions: 'rwxr-xr-x',
                  owner: 'user',
                  group: 'user',
                  children: {
                    'cheatsheet.txt': {
                      name: 'cheatsheet.txt',
                      type: 'file',
                      permissions: 'rw-r--r--',
                      owner: 'user',
                      group: 'user',
                      content: 'Useful Commands:\n- pwd: print working directory\n- ls: list directory contents\n- cd: change directory\n- cat: display file contents\n'
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
  }

  public getCwd(): string {
    return this.cwd;
  }

  public setCwd(newPath: string): boolean {
    const resolved = this.resolvePath(newPath);
    const node = this.getNode(resolved);
    if (node && node.type === 'directory') {
      this.cwd = resolved;
      return true;
    }
    return false;
  }

  public resolvePath(targetPath: string): string {
    if (!targetPath || targetPath === '~') return '/home/user';
    if (targetPath.startsWith('~/')) {
      targetPath = '/home/user/' + targetPath.slice(2);
    }

    let absolute = targetPath.startsWith('/') ? targetPath : `${this.cwd}/${targetPath}`;
    const parts = absolute.split('/').filter(p => p.length > 0 && p !== '.');
    const stack: string[] = [];

    for (const part of parts) {
      if (part === '..') {
        if (stack.length > 0) stack.pop();
      } else {
        stack.push(part);
      }
    }

    return '/' + stack.join('/');
  }

  public getNode(path: string): FileNode | null {
    const resolved = this.resolvePath(path);
    if (resolved === '/') return this.root;

    const parts = resolved.split('/').filter(Boolean);
    let curr: FileNode = this.root;

    for (const part of parts) {
      if (!curr.children || !curr.children[part]) {
        return null;
      }
      curr = curr.children[part];
    }
    return curr;
  }

  public listDirectory(path?: string): { name: string; node: FileNode }[] | null {
    const target = path ? this.resolvePath(path) : this.cwd;
    const node = this.getNode(target);
    if (!node || node.type !== 'directory' || !node.children) return null;

    return Object.entries(node.children).map(([name, child]) => ({
      name,
      node: child
    }));
  }

  public createFile(path: string, content: string = '', permissions: string = 'rw-r--r--'): boolean {
    const resolved = this.resolvePath(path);
    const lastSlash = resolved.lastIndexOf('/');
    const dirPath = lastSlash === 0 ? '/' : resolved.slice(0, lastSlash);
    const fileName = resolved.slice(lastSlash + 1);

    const dirNode = this.getNode(dirPath);
    if (!dirNode || dirNode.type !== 'directory') return false;

    if (!dirNode.children) dirNode.children = {};
    dirNode.children[fileName] = {
      name: fileName,
      type: 'file',
      content,
      permissions,
      owner: 'user',
      group: 'user',
      size: content.length,
      updatedAt: new Date().toISOString()
    };
    return true;
  }

  public createDirectory(path: string, recursive: boolean = false): boolean {
    const resolved = this.resolvePath(path);
    const parts = resolved.split('/').filter(Boolean);

    let curr = this.root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!curr.children) curr.children = {};

      if (!curr.children[part]) {
        if (i === parts.length - 1 || recursive) {
          curr.children[part] = {
            name: part,
            type: 'directory',
            permissions: 'rwxr-xr-x',
            owner: 'user',
            group: 'user',
            children: {}
          };
        } else {
          return false;
        }
      }
      curr = curr.children[part];
      if (curr.type !== 'directory') return false;
    }
    return true;
  }

  public removeNode(path: string, recursive: boolean = false): boolean {
    const resolved = this.resolvePath(path);
    if (resolved === '/' || resolved === '/home/user') return false;

    const lastSlash = resolved.lastIndexOf('/');
    const dirPath = lastSlash === 0 ? '/' : resolved.slice(0, lastSlash);
    const targetName = resolved.slice(lastSlash + 1);

    const dirNode = this.getNode(dirPath);
    if (!dirNode || !dirNode.children || !dirNode.children[targetName]) return false;

    const targetNode = dirNode.children[targetName];
    if (targetNode.type === 'directory' && !recursive && Object.keys(targetNode.children || {}).length > 0) {
      return false; // Directory not empty
    }

    delete dirNode.children[targetName];
    return true;
  }

  public clone(): VirtualFS {
    const copy = JSON.parse(JSON.stringify(this.root));
    return new VirtualFS(copy, this.cwd);
  }
}
