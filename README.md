# 🐧 LinuxQuest: Gamified Linux & Bash Mastery (Boot.dev Style)

> Master the Linux command line, shell scripting, file systems, permissions, process management, and sysadmin skills through an interactive, gamified RPG-style course with an in-browser Linux terminal simulator.

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 Key Features

- **🎮 Gamified Learning**: Earn XP, unlock achievements, climb levels (from *Script Kiddie* to *Kernel Wizard*), and maintain daily learning streaks.
- **💻 In-Browser Virtual Linux Terminal**:
  - Full virtual file system (VFS) with directories like `/home/user`, `/etc`, `/var/log`, `/bin`.
  - Commands supported: `ls`, `cd`, `pwd`, `cat`, `head`, `tail`, `touch`, `mkdir`, `rm`, `cp`, `mv`, `echo`, `grep`, `find`, `chmod`, `chown`, `wc`, `ps`, `kill`, `man`, `history`, `clear`, pipes (`|`), and output redirection (`>`, `>>`).
  - Command history (Up/Down arrow keys) and Tab auto-completion.
- **🎯 Interactive Objective Verification**: Automated test engine evaluates commands and filesystem state in real-time with instant feedback and celebration.
- **📚 Comprehensive Course Tracks**:
  1. **Linux Navigation & File Mastery**: Traversing paths, viewing files, wildcards, directory structures.
  2. **I/O Redirection & The Power of Pipes**: Standard streams (`stdin`, `stdout`, `stderr`), pipes, filtering with `grep`, `wc`.
  3. **Permissions & Security**: `chmod` (symbolic & octal), `chown`, users, groups, sudo privileges.
  4. **Process Control & Signals**: `ps`, `top`, background jobs (`&`), `kill`, process hierarchy.
  5. **Text Wrangling & Wizardry**: Stream manipulation, pattern matching, system log auditing.
- **💡 Progressive Hint System**: Guided hints from subtle clues to full explanations so you never get stuck.
- **⚡ Free Sandbox Playground**: Toggle into open sandbox mode anytime to experiment freely with Linux commands.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/hammadshakeelai/linux-quest.git

# Enter the project directory
cd linux-quest

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173` to start your Linux quest!

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Build Tool**: Vite
- **Animations & FX**: Canvas Confetti

---

## 📜 License

MIT License © 2026 Hammad Shakeel
