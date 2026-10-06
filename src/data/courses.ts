import type { Course } from '../types';

export const LINUX_COURSE: Course = {
  id: 'linux-mastery',
  title: 'Linux & Bash: The Forensic Terminal Quest',
  tagline: 'Defend WorldBanc systems, master bash, permissions, pipes, and processes.',
  description: 'An interactive, gamified journey inspired by Boot.dev. Stop passive video watching and solve hands-on terminal quests with instant automated feedback.',
  modules: [
    {
      id: 'mod-1',
      title: 'Chapter 1: The Breach Investigation (Navigation & Inspection)',
      description: 'Explore file structures, inspect suspect directories, and read critical system logs.',
      icon: 'FolderTree',
      lessons: [
        {
          id: 'les-1-1',
          moduleId: 'mod-1',
          title: 'Mission 1: The Crime Scene (pwd & ls -la)',
          slug: 'crime-scene-pwd-ls',
          xpReward: 50,
          difficulty: 'Beginner',
          estimatedMinutes: 5,
          story: '🚨 Priority Alert from WorldBanc InfoSec: Anomalous network activity was detected on banking node worldbanc-sec-01. You have logged into the terminal as user. Determine where you are in the filesystem and reveal all files including hidden dotfiles.',
          content: `### Welcome to the Command Line

In Linux, you interact directly with the kernel and utilities via the shell.

- \`pwd\` (**P**rint **W**orking **D**irectory): Outputs the absolute path of your current working directory.
- \`ls\` (**L**i**s**t): Displays files and folders in the current directory.
- \`ls -la\`: Flags can be combined!
  - \`-l\`: Use long listing format (file permissions, owner, size, date).
  - \`-a\`: Include hidden files (names starting with a dot \`.\`, such as \`.bashrc\`).

\`\`\`bash
pwd
ls -la
\`\`\`

### Your Objectives:
1. Run \`pwd\` to identify your location.
2. Run \`ls -la\` to uncover hidden dotfiles and file permissions.`,
          tips: [
            'Type `pwd` and hit Enter to print your directory.',
            'Type `ls -la` and hit Enter to reveal hidden dotfiles.'
          ],
          objectives: [
            {
              id: 'obj-pwd',
              description: 'Print your current directory using `pwd`',
              hint: 'Type `pwd` in the terminal and press Enter.',
              testType: 'command_run',
              testArg: 'pwd'
            },
            {
              id: 'obj-ls-la',
              description: 'Inspect all files including hidden dotfiles using `ls -la`',
              hint: 'Type `ls -la` and press Enter.',
              testType: 'command_run',
              testArg: 'ls -la'
            }
          ],
          solutionCommands: ['pwd', 'ls -la']
        },
        {
          id: 'les-1-2',
          moduleId: 'mod-1',
          title: 'Mission 2: Reading the Incident Dispatch (cat & head)',
          slug: 'reading-files-cat-head',
          xpReward: 75,
          difficulty: 'Beginner',
          estimatedMinutes: 6,
          story: 'The Chief Information Security Officer left a classified dispatch `welcome.txt` in your home folder. Inspect its contents using `cat`, or use `head` to preview the top lines.',
          content: `### Inspecting Text Files

- \`cat <file>\` (**Cat**enate): Reads the file and prints its full content to \`stdout\`.
- \`cat -n <file>\`: Numbers each line for quick referencing.
- \`head -n 5 <file>\`: Shows just the first 5 lines of a file.
- \`tail -n 5 <file>\`: Shows just the last 5 lines.

\`\`\`bash
cat welcome.txt
head -n 5 welcome.txt
\`\`\`

### Your Objectives:
1. View the contents of \`welcome.txt\` using \`cat\`.`,
          tips: [
            'Type `cat welcome.txt` in the terminal.'
          ],
          objectives: [
            {
              id: 'obj-cat-welcome',
              description: 'Read the contents of `welcome.txt` using `cat`',
              hint: 'Run `cat welcome.txt` in the terminal prompt.',
              testType: 'command_run',
              testArg: 'cat welcome.txt'
            }
          ],
          solutionCommands: ['cat welcome.txt']
        },
        {
          id: 'les-1-3',
          moduleId: 'mod-1',
          title: 'Mission 3: Directory Traversal & Memory (cd, cd .., cd -)',
          slug: 'navigation-cd-traversal',
          xpReward: 90,
          difficulty: 'Beginner',
          estimatedMinutes: 7,
          story: 'There is a `notes` directory in your home workspace containing cheatsheets. Travel into it, examine the files, and practice jumping back with `cd -`.',
          content: `### Navigating the Directory Tree with \`cd\`

- \`cd <dir>\`: Change into a child directory.
- \`cd ..\`: Move one level up into the parent directory.
- \`cd ~\`: Return directly to your home directory (\`/home/user\`).
- \`cd -\`: Jump back to your previous directory (restores \`$OLDPWD\`).

\`\`\`bash
cd notes
ls
cd ..
\`\`\`

### Your Objectives:
1. Navigate into the \`notes\` folder using \`cd notes\`.
2. Step back out to your home directory using \`cd ..\` or \`cd ~\`.`,
          tips: [
            'Run `cd notes`',
            'Then run `cd ..`'
          ],
          objectives: [
            {
              id: 'obj-cd-notes',
              description: 'Navigate into the `notes` directory with `cd notes`',
              testType: 'command_run',
              testArg: 'cd notes'
            },
            {
              id: 'obj-cd-back',
              description: 'Return to home directory with `cd ..` or `cd ~`',
              testType: 'command_run',
              testArg: 'cd'
            }
          ],
          solutionCommands: ['cd notes', 'cd ..']
        }
      ]
    },
    {
      id: 'mod-2',
      title: 'Chapter 2: File Creation, Redirection & Archiving',
      description: 'Create folders, craft investigation dossiers with redirection, copy trees, and manage files.',
      icon: 'FileCode2',
      lessons: [
        {
          id: 'les-2-1',
          moduleId: 'mod-2',
          title: 'Mission 4: Setting Up the Investigation Vault (mkdir -p & touch)',
          slug: 'mkdir-and-touch',
          xpReward: 80,
          difficulty: 'Beginner',
          estimatedMinutes: 6,
          story: 'To quarantine evidence, create an `investigation/evidence` nested folder tree using `mkdir -p` and establish an empty evidence dossier file `dossier.txt`.',
          content: `### Creating Directories and Files

- \`mkdir -p <path>\`: Creates an entire folder hierarchy in one command without erroring if parents don't exist.
- \`touch <file>\`: Creates an empty file if it doesn't exist, or updates its timestamp if it does.

\`\`\`bash
mkdir -p investigation/evidence
touch investigation/evidence/dossier.txt
\`\`\`

### Your Objectives:
1. Create the directory tree \`investigation/evidence\` using \`mkdir -p\`.
2. Create the file \`investigation/evidence/dossier.txt\` using \`touch\`.`,
          objectives: [
            {
              id: 'obj-mkdir-investigation',
              description: 'Create directory hierarchy `investigation/evidence`',
              hint: 'Run `mkdir -p investigation/evidence`',
              testType: 'dir_exists',
              testArg: '/home/user/investigation/evidence'
            },
            {
              id: 'obj-touch-dossier',
              description: 'Create file `dossier.txt` inside `investigation/evidence/`',
              hint: 'Run `touch investigation/evidence/dossier.txt`',
              testType: 'file_exists',
              testArg: '/home/user/investigation/evidence/dossier.txt'
            }
          ],
          solutionCommands: ['mkdir -p investigation/evidence', 'touch investigation/evidence/dossier.txt']
        },
        {
          id: 'les-2-2',
          moduleId: 'mod-2',
          title: 'Mission 5: Writing Case Telemetry (echo & redirection > / >>)',
          slug: 'echo-and-redirection',
          xpReward: 100,
          difficulty: 'Intermediate',
          estimatedMinutes: 8,
          story: 'Record suspect telemetry into your dossier. Use `echo` combined with standard output redirection `>` to record "BREACH_SECTOR=7" into `investigation/evidence/dossier.txt`.',
          content: `### Standard Output Redirection

In Linux, standard output (\`stdout\`) usually prints to the screen. You can redirect it into a file using:

- \`>\` (Overwrite redirect): Clears the file and writes the new output.
- \`>>\` (Append redirect): Keeps existing text and appends new lines at the bottom.

\`\`\`bash
echo "BREACH_SECTOR=7" > investigation/evidence/dossier.txt
\`\`\`

You can verify the file contents afterward with \`cat investigation/evidence/dossier.txt\`!

### Your Objectives:
1. Write \`BREACH_SECTOR=7\` into \`investigation/evidence/dossier.txt\`.`,
          objectives: [
            {
              id: 'obj-echo-dossier',
              description: 'Write "BREACH_SECTOR=7" into `investigation/evidence/dossier.txt`',
              hint: 'Run `echo "BREACH_SECTOR=7" > investigation/evidence/dossier.txt`',
              testType: 'file_content',
              testArg: '/home/user/investigation/evidence/dossier.txt',
              testExpected: 'BREACH_SECTOR=7'
            }
          ],
          solutionCommands: ['echo "BREACH_SECTOR=7" > investigation/evidence/dossier.txt']
        },
        {
          id: 'les-2-3',
          moduleId: 'mod-2',
          title: 'Mission 6: Backing Up Artifacts (cp -r & tree)',
          slug: 'copy-and-tree',
          xpReward: 110,
          difficulty: 'Intermediate',
          estimatedMinutes: 7,
          story: 'Before tampering with evidence, back up the `notes` folder by copying it recursively to `notes_backup` using `cp -r`. Then visualize your directory hierarchy with `tree`.',
          content: `### Copying Files and Directories

- \`cp <src> <dest>\`: Copies a single file.
- \`cp -r <src_dir> <dest_dir>\`: Recursively copies an entire directory and its contents.
- \`tree\`: Prints a clean visual hierarchy of files and directories.

\`\`\`bash
cp -r notes notes_backup
tree
\`\`\`

### Your Objectives:
1. Copy \`notes\` to \`notes_backup\` using \`cp -r notes notes_backup\`.
2. Inspect the structure using \`tree\`.`,
          objectives: [
            {
              id: 'obj-cp-backup',
              description: 'Create recursive backup `notes_backup` using `cp -r`',
              hint: 'Run `cp -r notes notes_backup`',
              testType: 'dir_exists',
              testArg: '/home/user/notes_backup'
            },
            {
              id: 'obj-run-tree',
              description: 'Visualize directory tree with `tree`',
              hint: 'Run `tree` in the terminal.',
              testType: 'command_run',
              testArg: 'tree'
            }
          ],
          solutionCommands: ['cp -r notes notes_backup', 'tree']
        }
      ]
    },
    {
      id: 'mod-3',
      title: 'Chapter 3: The Power of Pipes & Filtering (grep, wc, |)',
      description: 'Intercept system streams, isolate breach signatures, count anomalies, and sort data.',
      icon: 'GitCompare',
      lessons: [
        {
          id: 'les-3-1',
          moduleId: 'mod-3',
          title: 'Mission 7: Hunting Intruder Signatures with Grep',
          slug: 'grep-syslog-hunting',
          xpReward: 120,
          difficulty: 'Intermediate',
          estimatedMinutes: 8,
          story: 'The system log `/var/log/syslog` contains security events. Filter out all entries with the word "ERROR" using `grep` to pinpoint the intruder\'s entry point.',
          content: `### The Power of \`grep\`

\`grep\` (**G**lobally search for a **R**egular **E**xpression and **P**rint) is the fundamental tool for searching text in Linux.

\`\`\`bash
grep "PATTERN" /path/to/file
\`\`\`

Useful flags:
- \`-i\`: Ignore case sensitivity (matches "error", "ERROR", "Error").
- \`-v\`: Invert match (show lines that do *not* match).
- \`-n\`: Show line numbers.
- \`-c\`: Print only the count of matching lines.

### Your Objectives:
1. Search for \`ERROR\` inside \`/var/log/syslog\` using \`grep\`.`,
          objectives: [
            {
              id: 'obj-grep-error',
              description: 'Run `grep ERROR /var/log/syslog` to uncover the breach logs',
              hint: 'Type `grep ERROR /var/log/syslog` and press Enter.',
              testType: 'command_run',
              testArg: 'grep ERROR /var/log/syslog'
            }
          ],
          solutionCommands: ['grep ERROR /var/log/syslog']
        },
        {
          id: 'les-3-2',
          moduleId: 'mod-3',
          title: 'Mission 8: Unix Pipelines & Counting (cat | grep | wc -l)',
          slug: 'pipes-and-wordcount',
          xpReward: 130,
          difficulty: 'Intermediate',
          estimatedMinutes: 10,
          story: 'Master the Unix Philosophy by chaining commands together using the pipe operator `|`. Chain `cat /var/log/syslog | grep ERROR` and count the error lines using `wc -l`.',
          content: `### The Unix Philosophy: Pipes (\`|\`)

*"Write programs that do one thing and do it well. Write programs to work together."* — Doug McIlroy

The pipe operator \`|\` takes the standard output (\`stdout\`) of the command on the left and connects it directly to the standard input (\`stdin\`) of the command on the right.

\`\`\`bash
cat /var/log/syslog | grep ERROR | wc -l
\`\`\`

- \`wc -l\`: Counts newline characters (lines).
- \`wc -w\`: Counts words.
- \`wc -c\`: Counts bytes.

### Your Objectives:
1. Execute a command pipeline containing \`grep\` and \`wc -l\` using the pipe operator \`|\`.`,
          objectives: [
            {
              id: 'obj-pipe-used',
              description: 'Execute a pipeline containing `cat`, `grep`, or `wc` with the `|` operator',
              hint: 'Run `cat /var/log/syslog | grep ERROR | wc -l`',
              testType: 'pipe_used',
              testArg: '|'
            }
          ],
          solutionCommands: ['cat /var/log/syslog | grep ERROR | wc -l']
        }
      ]
    },
    {
      id: 'mod-4',
      title: 'Chapter 4: Permissions, Ownership & Sudo Elevation',
      description: 'Demystify octal permissions (rwxr-xr-x), chmod, chown, and privilege escalation with sudo.',
      icon: 'ShieldCheck',
      lessons: [
        {
          id: 'les-4-1',
          moduleId: 'mod-4',
          title: 'Mission 9: Hardening Script Permissions (chmod 755 & 600)',
          slug: 'file-permissions-chmod',
          xpReward: 150,
          difficulty: 'Advanced',
          estimatedMinutes: 10,
          story: 'You discovered a mitigation patch script `patch.sh`. Create `patch.sh` and make it executable so the security daemon can execute the fix!',
          content: `### Understanding Linux Permissions

Every Linux file has 3 permission categories:
1. **User (Owner)**: \`u\`
2. **Group**: \`g\`
3. **Others**: \`o\`

With 3 permission types:
- **r** (Read) = 4
- **w** (Write) = 2
- **x** (Execute) = 1

For example:
- \`755\` = \`rwxr-xr-x\` (Owner can read/write/execute; others can read and execute).
- \`600\` = \`rw-------\` (Owner read/write only; private).

\`\`\`bash
touch patch.sh
chmod 755 patch.sh
ls -l patch.sh
\`\`\`

### Your Objectives:
1. Create \`patch.sh\` in your current directory using \`touch patch.sh\`.
2. Grant executable permissions to it using \`chmod 755 patch.sh\` or \`chmod +x patch.sh\`.`,
          objectives: [
            {
              id: 'obj-touch-patch',
              description: 'Create file `patch.sh`',
              hint: 'Run `touch patch.sh`',
              testType: 'file_exists',
              testArg: '/home/user/patch.sh'
            },
            {
              id: 'obj-chmod-patch',
              description: 'Set permissions of `patch.sh` to executable (755)',
              hint: 'Run `chmod 755 patch.sh`',
              testType: 'permission_check',
              testArg: '/home/user/patch.sh',
              testExpected: 'rwxr-xr-x'
            }
          ],
          solutionCommands: ['touch patch.sh', 'chmod 755 patch.sh']
        },
        {
          id: 'les-4-2',
          moduleId: 'mod-4',
          title: 'Mission 10: Root Clearance & Sudo Elevation',
          slug: 'sudo-privilege-elevation',
          xpReward: 160,
          difficulty: 'Advanced',
          estimatedMinutes: 8,
          story: 'WorldBanc shadow credentials are encrypted inside `/etc/shadow`. Try reading it normally — permission is denied. Elevate your privileges using `sudo` to read `/etc/shadow` or enter root shell mode with `sudo su`!',
          content: `### Privilege Escalation with \`sudo\`

In Linux, standard users cannot access root-only files like \`/etc/shadow\` or write to system directories like \`/etc\`.

- \`sudo <cmd>\`: Execute a single command with SuperUser (root) privileges.
- \`sudo su\`: Switch the active session to the \`root\` superuser environment!

\`\`\`bash
sudo cat /etc/shadow
sudo su
whoami
\`\`\`

### Your Objectives:
1. Execute a command with \`sudo\` (such as \`sudo cat /etc/shadow\` or \`sudo su\`).`,
          objectives: [
            {
              id: 'obj-sudo-run',
              description: 'Execute a privileged command using `sudo`',
              hint: 'Run `sudo cat /etc/shadow` or `sudo su`',
              testType: 'command_run',
              testArg: 'sudo'
            }
          ],
          solutionCommands: ['sudo cat /etc/shadow']
        }
      ]
    },
    {
      id: 'mod-5',
      title: 'Chapter 5: Process Control, Systemd & Networking',
      description: 'Audit running processes with ps, terminate rogue daemons with kill, and inspect network sockets.',
      icon: 'Cpu',
      lessons: [
        {
          id: 'les-5-1',
          moduleId: 'mod-5',
          title: 'Mission 11: Neutralizing Rogue Daemons (ps & kill)',
          slug: 'process-control-ps-kill',
          xpReward: 160,
          difficulty: 'Advanced',
          estimatedMinutes: 10,
          story: 'A compromised background process with PID `4412` has been brute-forcing SSH credentials. Inspect the active process table with `ps` and terminate the rogue process with `kill 4412`.',
          content: `### Process Inspection and Signals

Linux processes are tracked by numerical **Process IDs (PIDs)**.

- \`ps\`: View active processes in the current shell session.
- \`ps -ef\` / \`ps aux\`: List every process running across the entire system.
- \`kill <PID>\`: Sends \`SIGTERM\` (15) to request graceful shutdown.
- \`kill -9 <PID>\`: Sends \`SIGKILL\` (9) to immediately terminate the process.

\`\`\`bash
ps
kill 4412
\`\`\`

### Your Objectives:
1. List running processes with \`ps\`.
2. Terminate rogue process \`4412\` using \`kill 4412\`.`,
          objectives: [
            {
              id: 'obj-ps-audit',
              description: 'Audit running processes using `ps`',
              hint: 'Run `ps` in the terminal.',
              testType: 'command_run',
              testArg: 'ps'
            },
            {
              id: 'obj-kill-rogue',
              description: 'Terminate process 4412 with `kill 4412`',
              hint: 'Run `kill 4412`',
              testType: 'command_run',
              testArg: 'kill 4412'
            }
          ],
          solutionCommands: ['ps', 'kill 4412']
        },
        {
          id: 'les-5-2',
          moduleId: 'mod-5',
          title: 'Mission 12: Network Sockets & Systemd (ss & systemctl)',
          slug: 'networking-and-systemd',
          xpReward: 180,
          difficulty: 'Advanced',
          estimatedMinutes: 10,
          story: 'Final Mission! Audit open network listening ports on node worldbanc-sec-01 with `ss` and inspect the OpenSSH service status using `systemctl status sshd`.',
          content: `### Network Auditing & Systemd Services

- \`ss\` (Socket Statistics): The modern replacement for \`netstat\`.
  - \`ss -tulpn\`: Displays TCP (\`-t\`), UDP (\`-u\`), listening sockets (\`-l\`), with process names (\`-p\`).
- \`systemctl status <unit>\`: Checks the health, PID, and active state of a systemd daemon.
- \`ping <host>\`: Sends ICMP echo packets to test network connectivity.

\`\`\`bash
ss
systemctl status sshd
ping -c 2 127.0.0.1
\`\`\`

### Your Objectives:
1. Inspect listening network sockets using \`ss\` or \`netstat\`.
2. Audit the SSH daemon with \`systemctl status sshd\`.`,
          objectives: [
            {
              id: 'obj-ss-check',
              description: 'Audit network sockets using `ss` or `netstat`',
              hint: 'Run `ss` in the terminal.',
              testType: 'command_run',
              testArg: 'ss'
            },
            {
              id: 'obj-systemctl-check',
              description: 'Inspect service status with `systemctl status sshd`',
              hint: 'Run `systemctl status sshd`',
              testType: 'command_run',
              testArg: 'systemctl'
            }
          ],
          solutionCommands: ['ss', 'systemctl status sshd']
        }
      ]
    }
  ]
};
