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
          title: 'Mission 1: The Crime Scene (pwd & ls)',
          slug: 'crime-scene-pwd-ls',
          xpReward: 50,
          difficulty: 'Beginner',
          estimatedMinutes: 5,
          story: '🚨 Priority Alert from WorldBanc InfoSec: Anomalous network activity was detected on node tuxquest-node-1. You have logged into the terminal as user. Determine where you are in the filesystem and list the contents of your directory.',
          content: `### Welcome to the Command Line

In Linux, you are not clicking icons with a mouse. You interact directly with the shell via commands.

- \`pwd\` (**P**rint **W**orking **D**irectory): Outputs the absolute path of your current location.
- \`ls\` (**L**i**s**t): Displays files and folders in the current directory.
- \`ls -la\`: Shows all files including hidden ones (starting with a dot \`.\`) alongside permissions, owner, and sizes.

### Your Objectives:
1. Run \`pwd\` to identify your current working directory.
2. Run \`ls\` to view files in the current folder.`,
          tips: [
            'Type "pwd" and hit Enter.',
            'Then type "ls" and hit Enter.'
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
              id: 'obj-ls',
              description: 'List current files using `ls`',
              hint: 'Type `ls` and press Enter.',
              testType: 'command_run',
              testArg: 'ls'
            }
          ],
          solutionCommands: ['pwd', 'ls']
        },
        {
          id: 'les-1-2',
          moduleId: 'mod-1',
          title: 'Mission 2: Reading the Welcome Wiretap (cat)',
          slug: 'reading-files-cat',
          xpReward: 75,
          difficulty: 'Beginner',
          estimatedMinutes: 6,
          story: 'There is a `welcome.txt` file sitting in your home directory. An informant may have left vital clues inside. Inspect its contents using `cat`.',
          content: `### Viewing File Contents with \`cat\`

The \`cat\` command (short for concatenate) reads one or more files and prints their contents directly to the standard output (\`stdout\`).

\`\`\`bash
cat filename.txt
\`\`\`

You can also view the first 10 lines with \`head filename.txt\` or the last 10 lines with \`tail filename.txt\`.

### Your Objectives:
1. View the contents of \`welcome.txt\` using the \`cat\` command.`,
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
          title: 'Mission 3: Traversal & Hidden Evidence (cd & ls -la)',
          slug: 'navigation-cd-hidden',
          xpReward: 90,
          difficulty: 'Beginner',
          estimatedMinutes: 7,
          story: 'There is a `notes` directory inside your workspace. Travel into it, inspect what cheatsheets exist, and step back out.',
          content: `### Navigating Directories with \`cd\`

- \`cd <dir>\`: Move into a directory (e.g. \`cd notes\`).
- \`cd ..\`: Move one level up into the parent directory.
- \`cd ~\`: Return to your home directory (\`/home/user\`).
- \`cd -\`: Jump back to your previous directory.

### Your Objectives:
1. Change directory into \`notes\` using \`cd notes\`.
2. Inspect files in \`notes\` using \`ls\`.
3. Return back to your home directory using \`cd ..\` or \`cd ~\`.`,
          tips: [
            'First run `cd notes`',
            'Then run `ls` to see what is inside',
            'Finally run `cd ..` to go back'
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
          solutionCommands: ['cd notes', 'ls', 'cd ..']
        }
      ]
    },
    {
      id: 'mod-2',
      title: 'Chapter 2: File Creation & Manipulation',
      description: 'Create folders, craft investigation notes, move files, and clean clutter.',
      icon: 'FileCode2',
      lessons: [
        {
          id: 'les-2-1',
          moduleId: 'mod-2',
          title: 'Mission 4: Setting Up the War Room (mkdir & touch)',
          slug: 'mkdir-and-touch',
          xpReward: 80,
          difficulty: 'Beginner',
          estimatedMinutes: 6,
          story: 'To organize evidence without contaminating production files, create an `investigation` directory and establish an empty case dossier `dossier.txt`.',
          content: `### Creating Directories and Files

- \`mkdir <name>\`: Makes a new directory. With \`-p\`, it creates nested parent folders if they don't exist yet (e.g. \`mkdir -p a/b/c\`).
- \`touch <name>\`: Updates the timestamp of a file or creates an empty file if it does not exist.

### Your Objectives:
1. Create a directory named \`investigation\`.
2. Create an empty file named \`investigation/dossier.txt\` (or \`touch dossier.txt\` inside that folder).`,
          objectives: [
            {
              id: 'obj-mkdir-investigation',
              description: 'Create directory `investigation`',
              hint: 'Run `mkdir investigation`',
              testType: 'dir_exists',
              testArg: '/home/user/investigation'
            },
            {
              id: 'obj-touch-dossier',
              description: 'Create file `dossier.txt` inside `investigation/`',
              hint: 'Run `touch investigation/dossier.txt`',
              testType: 'file_exists',
              testArg: '/home/user/investigation/dossier.txt'
            }
          ],
          solutionCommands: ['mkdir investigation', 'touch investigation/dossier.txt']
        },
        {
          id: 'les-2-2',
          moduleId: 'mod-2',
          title: 'Mission 5: Writing Case Notes (echo & redirection >)',
          slug: 'echo-and-redirection',
          xpReward: 100,
          difficulty: 'Intermediate',
          estimatedMinutes: 8,
          story: 'Log suspect telemetry into your dossier. Use `echo` combined with standard output redirection `>` to record "SUSPECT_ID=4299" into `investigation/dossier.txt`.',
          content: `### Standard Output Redirection

In Linux, standard output (\`stdout\`) usually prints to the screen. You can redirect it into a file using:

- \`>\` (Overwrite redirect): Clears the file and writes the new output.
- \`>>\` (Append redirect): Keeps existing text and appends new lines at the bottom.

\`\`\`bash
echo "SUSPECT_ID=4299" > investigation/dossier.txt
\`\`\`

### Your Objectives:
1. Write \`SUSPECT_ID=4299\` into \`investigation/dossier.txt\`.`,
          objectives: [
            {
              id: 'obj-echo-dossier',
              description: 'Write "SUSPECT_ID=4299" into `investigation/dossier.txt`',
              hint: 'Run `echo "SUSPECT_ID=4299" > investigation/dossier.txt`',
              testType: 'file_content',
              testArg: '/home/user/investigation/dossier.txt',
              testExpected: 'SUSPECT_ID=4299'
            }
          ],
          solutionCommands: ['echo "SUSPECT_ID=4299" > investigation/dossier.txt']
        }
      ]
    },
    {
      id: 'mod-3',
      title: 'Chapter 3: The Power of Pipes & Filtering (grep, wc, |)',
      description: 'Intercept system streams, isolate breach signatures, and count anomalies.',
      icon: 'GitCompare',
      lessons: [
        {
          id: 'les-3-1',
          moduleId: 'mod-3',
          title: 'Mission 6: Hunting the Breach with Grep',
          slug: 'grep-syslog-hunting',
          xpReward: 120,
          difficulty: 'Intermediate',
          estimatedMinutes: 8,
          story: 'The system log `/var/log/syslog` contains hundreds of events. Filter out all entries with the word "ERROR" to pinpoint the intruder\'s entry point.',
          content: `### The Power of \`grep\`

\`grep\` (**G**lobally search for a **R**egular **E**xpression and **P**rint) is the primary tool for searching text.

\`\`\`bash
grep "PATTERN" /path/to/file
\`\`\`

Useful flags:
- \`-i\`: Ignore case sensitivity (matches "error", "ERROR", "Error").
- \`-v\`: Invert match (show lines that do *not* match).
- \`-n\`: Show line numbers.

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
          title: 'Mission 7: Piping and Counting (cat | grep | wc -l)',
          slug: 'pipes-and-wordcount',
          xpReward: 130,
          difficulty: 'Intermediate',
          estimatedMinutes: 10,
          story: 'A true Linux master chains simple commands into powerful pipelines using the pipe operator \`|\`. Chain \`cat /var/log/syslog | grep ERROR\` and count how many error occurrences exist with \`wc -l\`.',
          content: `### The Unix Philosophy: Pipes (\`|\`)

*"Write programs that do one thing and do it well. Write programs to work together."* — Doug McIlroy

The pipe operator \`|\` takes the standard output (\`stdout\`) of the command on the left and connects it directly as the standard input (\`stdin\`) of the command on the right.

\`\`\`bash
cat /var/log/syslog | grep ERROR | wc -l
\`\`\`

### Your Objectives:
1. Use a pipe to send output from \`cat /var/log/syslog\` into \`grep ERROR\`.
2. Count the occurrences by chaining \`wc -l\`!`,
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
      title: 'Chapter 4: Permissions & Security Hardening',
      description: 'Demystify octal permissions (rwxr-xr-x), lock down sensitive files with chmod.',
      icon: 'ShieldCheck',
      lessons: [
        {
          id: 'les-4-1',
          moduleId: 'mod-4',
          title: 'Mission 8: Locking Down the Vault (chmod 755 & 600)',
          slug: 'file-permissions-chmod',
          xpReward: 150,
          difficulty: 'Advanced',
          estimatedMinutes: 10,
          story: 'You discovered a mitigation patch script `investigation/patch.sh`. Before running it, make it executable so the security daemon can execute the fix!',
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
- \`600\` = \`rw-------\` (Owner only; completely private).

\`\`\`bash
touch investigation/patch.sh
chmod 755 investigation/patch.sh
\`\`\`

### Your Objectives:
1. Create \`investigation/patch.sh\` using \`touch\`.
2. Grant executable permissions to it using \`chmod 755 investigation/patch.sh\` or \`chmod +x investigation/patch.sh\`.`,
          objectives: [
            {
              id: 'obj-touch-patch',
              description: 'Create file `investigation/patch.sh`',
              hint: 'Run `touch investigation/patch.sh`',
              testType: 'file_exists',
              testArg: '/home/user/investigation/patch.sh'
            },
            {
              id: 'obj-chmod-patch',
              description: 'Set permissions of `investigation/patch.sh` to executable (755)',
              hint: 'Run `chmod 755 investigation/patch.sh`',
              testType: 'permission_check',
              testArg: '/home/user/investigation/patch.sh',
              testExpected: 'rwxr-xr-x'
            }
          ],
          solutionCommands: ['touch investigation/patch.sh', 'chmod 755 investigation/patch.sh']
        }
      ]
    },
    {
      id: 'mod-5',
      title: 'Chapter 5: Process Control & Systemd',
      description: 'Audit running processes with ps, terminate rogue demons, inspect system resources.',
      icon: 'Cpu',
      lessons: [
        {
          id: 'les-5-1',
          moduleId: 'mod-5',
          title: 'Mission 9: Neutralizing Rogue Daemons (ps & kill)',
          slug: 'process-control-ps-kill',
          xpReward: 160,
          difficulty: 'Advanced',
          estimatedMinutes: 10,
          story: 'A compromised background daemon `sshd[4412]` has been brute-forcing credentials. Inspect the active process table with `ps` and terminate the rogue process with `kill 4412`.',
          content: `### Process Inspection and Termination

Linux runs processes identified by numerical **Process IDs (PIDs)**.

- \`ps\`: View active processes in the current shell session.
- \`kill <PID>\`: Sends the termination signal (\`SIGTERM\`) to terminate a process.
- \`kill -9 <PID>\`: Sends \`SIGKILL\` to forcefully shut down an unresponsive process.

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
        }
      ]
    }
  ]
};
