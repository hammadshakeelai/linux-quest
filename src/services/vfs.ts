import type { FileNode } from '../types';

export interface VFSState {
  root: FileNode;
  cwd: string;
  currentUser: string;
}

export class VirtualFS {
  private root: FileNode;
  private cwd: string;
  private currentUser: string;

  constructor(initialTree?: FileNode, initialCwd: string = '/home/user', initialUser: string = 'user') {
    this.root = initialTree || this.getDefaultTree();
    this.cwd = initialCwd;
    this.currentUser = initialUser;
  }

  public getCurrentUser(): string {
    return this.currentUser;
  }

  public setCurrentUser(user: string) {
    this.currentUser = user;
  }

  public isRoot(): boolean {
    return this.currentUser === 'root';
  }

  public getDefaultTree(): FileNode {
    return {
      name: '/',
      type: 'directory',
      permissions: 'rwxr-xr-x',
      owner: 'root',
      group: 'root',
      size: 4096,
      updatedAt: '2026-10-05T08:00:00Z',
      children: {
        'bin': {
          name: 'bin',
          type: 'directory',
          permissions: 'rwxr-xr-x',
          owner: 'root',
          group: 'root',
          size: 4096,
          children: {
            'bash': { name: 'bash', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 1245648 },
            'sh': { name: 'sh', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 1245648 },
            'ls': { name: 'ls', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 142144 },
            'cat': { name: 'cat', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 35064 },
            'grep': { name: 'grep', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 154800 },
            'mkdir': { name: 'mkdir', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 45200 },
            'rm': { name: 'rm', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 54100 },
            'cp': { name: 'cp', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 68300 },
            'mv': { name: 'mv', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 64100 },
            'chmod': { name: 'chmod', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 42100 },
            'chown': { name: 'chown', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 44200 },
            'touch': { name: 'touch', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 38200 },
            'echo': { name: 'echo', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 31000 },
            'pwd': { name: 'pwd', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 28400 },
            'ps': { name: 'ps', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 84200 },
            'kill': { name: 'kill', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 29500 },
            'head': { name: 'head', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 34100 },
            'tail': { name: 'tail', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 36200 },
            'wc': { name: 'wc', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 32000 },
            'date': { name: 'date', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 41200 },
            'uname': { name: 'uname', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 31000 },
            'whoami': { name: 'whoami', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 28000 },
            'clear': { name: 'clear', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 21000 },
          }
        },
        'usr': {
          name: 'usr',
          type: 'directory',
          permissions: 'rwxr-xr-x',
          owner: 'root',
          group: 'root',
          size: 4096,
          children: {
            'bin': {
              name: 'bin',
              type: 'directory',
              permissions: 'rwxr-xr-x',
              owner: 'root',
              group: 'root',
              size: 4096,
              children: {
                'curl': { name: 'curl', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 284000 },
                'wget': { name: 'wget', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 489000 },
                'find': { name: 'find', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 220000 },
                'sort': { name: 'sort', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 118000 },
                'uniq': { name: 'uniq', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 39000 },
                'sed': { name: 'sed', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 185000 },
                'awk': { name: 'awk', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 490000 },
                'tree': { name: 'tree', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 76000 },
                'uptime': { name: 'uptime', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 29000 },
                'free': { name: 'free', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 34000 },
                'df': { name: 'df', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 92000 },
                'which': { name: 'which', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 24000 },
                'whereis': { name: 'whereis', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 29000 },
                'id': { name: 'id', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 35000 },
                'env': { name: 'env', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 32000 },
                'ping': { name: 'ping', type: 'file', permissions: 'rwsr-xr-x', owner: 'root', group: 'root', size: 72000 },
                'sudo': { name: 'sudo', type: 'file', permissions: 'rwsr-xr-x', owner: 'root', group: 'root', size: 184000 },
              }
            }
          }
        },
        'sbin': {
          name: 'sbin',
          type: 'directory',
          permissions: 'rwxr-xr-x',
          owner: 'root',
          group: 'root',
          size: 4096,
          children: {
            'ss': { name: 'ss', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 145000 },
            'netstat': { name: 'netstat', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 138000 },
            'systemctl': { name: 'systemctl', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 840000 },
            'service': { name: 'service', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 4500 },
            'iptables': { name: 'iptables', type: 'file', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 110000 },
          }
        },
        'etc': {
          name: 'etc',
          type: 'directory',
          permissions: 'rwxr-xr-x',
          owner: 'root',
          group: 'root',
          size: 4096,
          children: {
            'hostname': { name: 'hostname', type: 'file', permissions: 'rw-r--r--', owner: 'root', group: 'root', content: 'worldbanc-sec-01\n' },
            'hosts': {
              name: 'hosts',
              type: 'file',
              permissions: 'rw-r--r--',
              owner: 'root',
              group: 'root',
              content: '127.0.0.1\tlocalhost\n127.0.1.1\tworldbanc-sec-01\n10.0.4.12\tauth.internal.worldbanc\n10.0.4.19\tdatavault.internal.worldbanc\n'
            },
            'resolv.conf': {
              name: 'resolv.conf',
              type: 'file',
              permissions: 'rw-r--r--',
              owner: 'root',
              group: 'root',
              content: '# Generated by NetworkManager\nnameserver 1.1.1.1\nnameserver 8.8.8.8\n'
            },
            'os-release': {
              name: 'os-release',
              type: 'file',
              permissions: 'rw-r--r--',
              owner: 'root',
              group: 'root',
              content: 'NAME="Ubuntu"\nVERSION="24.04 LTS (Noble Numbat)"\nID=ubuntu\nID_LIKE=debian\nPRETTY_NAME="Ubuntu 24.04 LTS"\nVERSION_ID="24.04"\nHOME_URL="https://www.ubuntu.com/"\nSUPPORT_URL="https://help.ubuntu.com/"\nBUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"\n'
            },
            'passwd': {
              name: 'passwd',
              type: 'file',
              permissions: 'rw-r--r--',
              owner: 'root',
              group: 'root',
              content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nsync:x:4:65534:sync:/bin:/bin/sync\nsshd:x:107:65534::/run/sshd:/usr/sbin/nologin\nuser:x:1000:1000:WorldBanc Investigator,,,:/home/user:/bin/bash\nsysadmin:x:1001:1001:System Administrator:/home/sysadmin:/bin/bash\n'
            },
            'shadow': {
              name: 'shadow',
              type: 'file',
              permissions: 'rw-------',
              owner: 'root',
              group: 'shadow',
              content: 'root:$6$vQ9Z8Y...$8jK1:19820:0:99999:7:::\nuser:$6$qP110x...$H5Z0:19820:0:99999:7:::\n'
            },
            'group': {
              name: 'group',
              type: 'file',
              permissions: 'rw-r--r--',
              owner: 'root',
              group: 'root',
              content: 'root:x:0:\ndaemon:x:1:\nsudo:x:27:user\nshadow:x:42:\nuser:x:1000:\n'
            },
            'sudoers': {
              name: 'sudoers',
              type: 'file',
              permissions: 'r--r-----',
              owner: 'root',
              group: 'root',
              content: '# /etc/sudoers\nDefaults\tenv_reset\nroot\tALL=(ALL:ALL) ALL\n%sudo\tALL=(ALL:ALL) NOPASSWD: ALL\n'
            },
            'issue': {
              name: 'issue',
              type: 'file',
              permissions: 'rw-r--r--',
              owner: 'root',
              group: 'root',
              content: 'Ubuntu 24.04 LTS \\n \\l\n'
            }
          }
        },
        'var': {
          name: 'var',
          type: 'directory',
          permissions: 'rwxr-xr-x',
          owner: 'root',
          group: 'root',
          size: 4096,
          children: {
            'log': {
              name: 'log',
              type: 'directory',
              permissions: 'rwxr-xr-x',
              owner: 'root',
              group: 'root',
              size: 4096,
              children: {
                'syslog': {
                  name: 'syslog',
                  type: 'file',
                  permissions: 'rw-r--r--',
                  owner: 'root',
                  group: 'adm',
                  content: 'Oct 05 08:12:01 kernel: CPU0: Intel Xeon Silver 4314 (32 cores)\nOct 05 08:12:04 systemd[1]: Started Network Service.\nOct 05 08:14:22 sshd[4412]: Failed password for root from 192.168.1.102 port 42100 ssh2\nOct 05 08:15:33 auth: [ERROR] Unauthorized breach attempt detected in sector 7\nOct 05 08:16:01 cron[102]: (root) CMD (/usr/bin/security_scan.sh)\nOct 05 08:18:44 app[1299]: [INFO] Daemon health check passed (200 OK)\nOct 05 08:22:10 sshd[4490]: [ERROR] Connection timed out after 3 retries from 203.0.113.88\nOct 05 08:24:55 kernel: [SECURITY] iptables DROP: IN=eth0 OUT= SRC=203.0.113.88 PROTO=TCP SPT=55243 DPT=22\n'
                },
                'auth.log': {
                  name: 'auth.log',
                  type: 'file',
                  permissions: 'rw-r-----',
                  owner: 'root',
                  group: 'adm',
                  content: 'Oct 05 08:14:20 worldbanc-sec-01 sshd[4412]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=192.168.1.102  user=root\nOct 05 08:15:02 worldbanc-sec-01 sudo:     user : TTY=pts/0 ; PWD=/home/user ; USER=root ; COMMAND=/bin/cat /etc/shadow\n'
                },
                'nginx': {
                  name: 'nginx',
                  type: 'directory',
                  permissions: 'rwxr-x---',
                  owner: 'www-data',
                  group: 'adm',
                  size: 4096,
                  children: {
                    'access.log': {
                      name: 'access.log',
                      type: 'file',
                      permissions: 'rw-r-----',
                      owner: 'www-data',
                      group: 'adm',
                      content: '127.0.0.1 - - [05/Oct/2026:08:10:00 +0000] "GET /health HTTP/1.1" 200 15 "-" "curl/7.88.1"\n10.0.4.12 - - [05/Oct/2026:08:15:22 +0000] "POST /api/v1/auth/verify HTTP/1.1" 401 54 "-" "Go-http-client/1.1"\n'
                    }
                  }
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
          size: 4096,
          children: {
            'user': {
              name: 'user',
              type: 'directory',
              permissions: 'rwxr-xr-x',
              owner: 'user',
              group: 'user',
              size: 4096,
              children: {
                '.bashrc': {
                  name: '.bashrc',
                  type: 'file',
                  permissions: 'rw-r--r--',
                  owner: 'user',
                  group: 'user',
                  content: '# ~/.bashrc: executed by bash(1) for non-login shells.\nalias ll=\'ls -la\'\nalias la=\'ls -A\'\nalias l=\'ls -CF\'\nexport PS1=\'\\u@\\h:\\w\\$ \'\n'
                },
                '.profile': {
                  name: '.profile',
                  type: 'file',
                  permissions: 'rw-r--r--',
                  owner: 'user',
                  group: 'user',
                  content: '# ~/.profile\nif [ -n "$BASH_VERSION" ]; then\n  [ -f "$HOME/.bashrc" ] && . "$HOME/.bashrc"\nfi\n'
                },
                '.bash_history': {
                  name: '.bash_history',
                  type: 'file',
                  permissions: 'rw-------',
                  owner: 'user',
                  group: 'user',
                  content: 'whoami\npwd\nls -la\ncat welcome.txt\n'
                },
                'welcome.txt': {
                  name: 'welcome.txt',
                  type: 'file',
                  permissions: 'rw-r--r--',
                  owner: 'user',
                  group: 'user',
                  content: '==========================================================\n         WORLDBANC INCIDENT RESPONSE BRIEFING\n==========================================================\nAgent,\nAn unauthorized intrusion was detected across sector 7.\nYour terminal session has been initialized with restricted\nforensic privileges. Traverse the filesystem, inspect\nsuspicious logs, harden security permissions, and neutralize\nthe rogue daemon.\n\nCommands to start with:\n- `pwd` to check your location\n- `ls -la` to list files including hidden dotfiles\n- `cat welcome.txt` to re-read this dispatch\n==========================================================\n'
                },
                'notes': {
                  name: 'notes',
                  type: 'directory',
                  permissions: 'rwxr-xr-x',
                  owner: 'user',
                  group: 'user',
                  size: 4096,
                  children: {
                    'cheatsheet.txt': {
                      name: 'cheatsheet.txt',
                      type: 'file',
                      permissions: 'rw-r--r--',
                      owner: 'user',
                      group: 'user',
                      content: 'LINUX CHEATSHEET:\n  pwd           - Print working directory\n  ls -la        - Detailed directory listing with hidden files\n  cd <path>     - Change directory (cd .. goes up, cd ~ goes home)\n  cat <file>    - Concatenate and display file\n  head -n 5     - View first 5 lines\n  tail -n 5     - View last 5 lines\n  mkdir -p      - Create directory tree\n  touch         - Create empty file\n  rm -rf        - Remove file/directory recursively\n  cp -r         - Copy files/directories\n  mv            - Move or rename files\n  grep -i       - Case-insensitive search\n  chmod 755     - Set read, write, execute permissions\n  ps -ef        - List running processes\n  kill -9 <PID> - Forcefully terminate process\n'
                    }
                  }
                }
              }
            }
          }
        },
        'root': {
          name: 'root',
          type: 'directory',
          permissions: 'rwx------',
          owner: 'root',
          group: 'root',
          size: 4096,
          children: {
            '.bashrc': {
              name: '.bashrc',
              type: 'file',
              permissions: 'rw-r--r--',
              owner: 'root',
              group: 'root',
              content: 'export PS1=\'\\u@\\h:\\w\\# \'\n'
            },
            'flag.txt': {
              name: 'flag.txt',
              type: 'file',
              permissions: 'rw-------',
              owner: 'root',
              group: 'root',
              content: 'ROOT_FLAG{w0rldb4nc_k3rn3l_0v3rl0rd_2026}\n'
            }
          }
        },
        'tmp': {
          name: 'tmp',
          type: 'directory',
          permissions: 'rwxrwxrwt',
          owner: 'root',
          group: 'root',
          size: 4096,
          children: {}
        },
        'proc': {
          name: 'proc',
          type: 'directory',
          permissions: 'r-xr-xr-x',
          owner: 'root',
          group: 'root',
          size: 0,
          children: {
            'cpuinfo': {
              name: 'cpuinfo',
              type: 'file',
              permissions: 'r--r--r--',
              owner: 'root',
              group: 'root',
              content: 'processor\t: 0\nvendor_id\t: GenuineIntel\ncpu family\t: 6\nmodel\t\t: 106\nmodel name\t: Intel(R) Xeon(R) Platinum 8375C CPU @ 2.90GHz\nstepping\t: 6\nmicrocode\t: 0xd0003b0\ncpu MHz\t\t: 2899.998\ncache size\t: 55296 KB\ncpu cores\t: 16\nflags\t\t: fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 ss ht syscall nx pdpe1gb rdtscp lm constant_tsc arch_perfmon rep_good nopl xtopology cpuid tsc_known_freq pni pclmulqdq vmx ssse3 fma cx16 pcid sse4_1 sse4_2 x2apic movbe popcnt tsc_deadline_timer aes xsave avx f16c rdrand hypervisor lahf_lm abm 3dnowprefetch invpcid_single ssbd ibrs ibpb stibp ibrs_enhanced tpr_shadow vnmi flexpriority ept vpid fsgsbase tsc_adjust bmi1 avx2 smep bmi2 erms invpcid avx512f avx512dq rdseed adx smap avx512ifma clflushopt clwb avx512cd sha_ni avx512bw avx512vl xsaveopt xsave cspell\n'
            },
            'meminfo': {
              name: 'meminfo',
              type: 'file',
              permissions: 'r--r--r--',
              owner: 'root',
              group: 'root',
              content: 'MemTotal:       32840920 kB\nMemFree:        21482012 kB\nMemAvailable:   27914856 kB\nBuffers:          412800 kB\nCached:          6542100 kB\nSwapTotal:       2097148 kB\nSwapFree:        2097148 kB\n'
            },
            'uptime': {
              name: 'uptime',
              type: 'file',
              permissions: 'r--r--r--',
              owner: 'root',
              group: 'root',
              content: '142852.12 458921.45\n'
            },
            'version': {
              name: 'version',
              type: 'file',
              permissions: 'r--r--r--',
              owner: 'root',
              group: 'root',
              content: 'Linux version 6.8.9-arch1-1-tuxquest (build@tuxquest-builder) (gcc version 13.2.1 20260315) #1 SMP PREEMPT_DYNAMIC Mon Oct 5 12:00:00 UTC 2026\n'
            }
          }
        },
        'dev': {
          name: 'dev',
          type: 'directory',
          permissions: 'rwxr-xr-x',
          owner: 'root',
          group: 'root',
          size: 4096,
          children: {
            'null': { name: 'null', type: 'file', permissions: 'rw-rw-rw-', owner: 'root', group: 'root', content: '' },
            'zero': { name: 'zero', type: 'file', permissions: 'rw-rw-rw-', owner: 'root', group: 'root', content: '' },
            'urandom': { name: 'urandom', type: 'file', permissions: 'r--r--r--', owner: 'root', group: 'root', content: '' },
          }
        }
      }
    };
  }

  public getCwd(): string {
    return this.cwd;
  }

  public setCwd(newPath: string): { success: boolean; error?: string } {
    const resolved = this.resolvePath(newPath);
    const node = this.getNode(resolved);
    if (!node) {
      return { success: false, error: `bash: cd: ${newPath}: No such file or directory` };
    }
    if (node.type !== 'directory') {
      return { success: false, error: `bash: cd: ${newPath}: Not a directory` };
    }
    
    // Check directory execute (traversal) permission
    if (!this.canTraverse(node)) {
      return { success: false, error: `bash: cd: ${newPath}: Permission denied` };
    }

    this.cwd = resolved;
    return { success: true };
  }

  public canTraverse(node: FileNode): boolean {
    if (this.isRoot()) return true;
    const perm = node.permissions || 'rwxr-xr-x';
    if (node.owner === this.currentUser) {
      return perm[2] === 'x';
    }
    return perm[8] === 'x';
  }

  public canRead(node: FileNode): boolean {
    if (this.isRoot()) return true;
    const perm = node.permissions || 'rw-r--r--';
    if (node.owner === this.currentUser) {
      return perm[0] === 'r';
    }
    return perm[6] === 'r';
  }

  public canWrite(node: FileNode): boolean {
    if (this.isRoot()) return true;
    const perm = node.permissions || 'rw-r--r--';
    if (node.owner === this.currentUser) {
      return perm[1] === 'w';
    }
    return perm[7] === 'w';
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

    if (!this.canRead(node) && !this.isRoot()) {
      return null;
    }

    return Object.entries(node.children).map(([name, child]) => ({
      name,
      node: child
    }));
  }

  public createFile(path: string, content: string = '', permissions: string = 'rw-r--r--'): { success: boolean; error?: string } {
    const resolved = this.resolvePath(path);
    const lastSlash = resolved.lastIndexOf('/');
    const dirPath = lastSlash === 0 ? '/' : resolved.slice(0, lastSlash);
    const fileName = resolved.slice(lastSlash + 1);

    const dirNode = this.getNode(dirPath);
    if (!dirNode || dirNode.type !== 'directory') {
      return { success: false, error: `No such file or directory` };
    }

    if (!this.canWrite(dirNode)) {
      return { success: false, error: `Permission denied` };
    }

    if (!dirNode.children) dirNode.children = {};
    dirNode.children[fileName] = {
      name: fileName,
      type: 'file',
      content,
      permissions,
      owner: this.currentUser,
      group: this.currentUser,
      size: content.length,
      updatedAt: new Date().toISOString()
    };
    return { success: true };
  }

  public createDirectory(path: string, recursive: boolean = false): { success: boolean; error?: string } {
    const resolved = this.resolvePath(path);
    const parts = resolved.split('/').filter(Boolean);

    let curr = this.root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!curr.children) curr.children = {};

      if (!curr.children[part]) {
        if (i === parts.length - 1 || recursive) {
          if (!this.canWrite(curr)) {
            return { success: false, error: `Permission denied` };
          }

          curr.children[part] = {
            name: part,
            type: 'directory',
            permissions: 'rwxr-xr-x',
            owner: this.currentUser,
            group: this.currentUser,
            size: 4096,
            children: {}
          };
        } else {
          return { success: false, error: `No such file or directory` };
        }
      }
      curr = curr.children[part];
      if (curr.type !== 'directory') return { success: false, error: `Not a directory` };
    }
    return { success: true };
  }

  public removeNode(path: string, recursive: boolean = false): { success: boolean; error?: string } {
    const resolved = this.resolvePath(path);
    if (resolved === '/' || resolved === '/home/user' || resolved === '/bin' || resolved === '/etc') {
      return { success: false, error: `rm: refusing to remove essential directory '${resolved}'` };
    }

    const lastSlash = resolved.lastIndexOf('/');
    const dirPath = lastSlash === 0 ? '/' : resolved.slice(0, lastSlash);
    const targetName = resolved.slice(lastSlash + 1);

    const dirNode = this.getNode(dirPath);
    if (!dirNode || !dirNode.children || !dirNode.children[targetName]) {
      return { success: false, error: `cannot remove '${path}': No such file or directory` };
    }

    if (!this.canWrite(dirNode)) {
      return { success: false, error: `Permission denied` };
    }

    const targetNode = dirNode.children[targetName];
    if (targetNode.type === 'directory' && !recursive && Object.keys(targetNode.children || {}).length > 0) {
      return { success: false, error: `cannot remove '${path}': Directory not empty` };
    }

    delete dirNode.children[targetName];
    return { success: true };
  }

  public copyNode(srcPath: string, destPath: string, recursive: boolean = false): { success: boolean; error?: string } {
    const srcNode = this.getNode(srcPath);
    if (!srcNode) return { success: false, error: `cannot stat '${srcPath}': No such file or directory` };

    if (srcNode.type === 'directory' && !recursive) {
      return { success: false, error: `-r not specified; omitting directory '${srcPath}'` };
    }

    const nodeClone = JSON.parse(JSON.stringify(srcNode));
    const destResolved = this.resolvePath(destPath);
    const destNode = this.getNode(destResolved);

    if (destNode && destNode.type === 'directory') {
      if (!destNode.children) destNode.children = {};
      destNode.children[srcNode.name] = nodeClone;
      return { success: true };
    }

    const lastSlash = destResolved.lastIndexOf('/');
    const parentDir = lastSlash === 0 ? '/' : destResolved.slice(0, lastSlash);
    const newName = destResolved.slice(lastSlash + 1);

    const parentNode = this.getNode(parentDir);
    if (!parentNode || parentNode.type !== 'directory') {
      return { success: false, error: `cannot create '${destPath}': No such directory` };
    }

    nodeClone.name = newName;
    if (!parentNode.children) parentNode.children = {};
    parentNode.children[newName] = nodeClone;
    return { success: true };
  }

  public moveNode(srcPath: string, destPath: string): { success: boolean; error?: string } {
    const copyRes = this.copyNode(srcPath, destPath, true);
    if (!copyRes.success) return copyRes;
    this.removeNode(srcPath, true);
    return { success: true };
  }

  public getAllFiles(basePath: string = '/'): { path: string; node: FileNode }[] {
    const result: { path: string; node: FileNode }[] = [];

    const traverse = (currentPath: string, node: FileNode) => {
      result.push({ path: currentPath, node });
      if (node.type === 'directory' && node.children) {
        for (const [name, child] of Object.entries(node.children)) {
          const childPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
          traverse(childPath, child);
        }
      }
    };

    const startNode = this.getNode(basePath);
    if (startNode) {
      traverse(this.resolvePath(basePath), startNode);
    }

    return result;
  }

  public clone(): VirtualFS {
    const copy = JSON.parse(JSON.stringify(this.root));
    return new VirtualFS(copy, this.cwd, this.currentUser);
  }
}
