import type { Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-command',
    title: 'First Terminal Blood',
    description: 'Execute your very first command in the Linux shell.',
    icon: 'Terminal',
    xpBonus: 25
  },
  {
    id: 'navigator',
    title: 'Pathfinder',
    description: 'Navigate directories using both relative and absolute paths.',
    icon: 'Compass',
    xpBonus: 50
  },
  {
    id: 'file-crafter',
    title: 'Digital Carpenter',
    description: 'Create directories and files using mkdir and touch.',
    icon: 'FolderPlus',
    xpBonus: 50
  },
  {
    id: 'pipe-dream',
    title: 'Pipe Dreamer',
    description: 'Master standard stream piping (|) to chain commands together.',
    icon: 'GitFork',
    xpBonus: 75
  },
  {
    id: 'grep-guru',
    title: 'Pattern Hunter',
    description: 'Filter system logs and uncover intrusion vectors using grep.',
    icon: 'Search',
    xpBonus: 75
  },
  {
    id: 'security-guardian',
    title: 'Permissions Sentinel',
    description: 'Configure octal chmod permissions and lock down script execution.',
    icon: 'Shield',
    xpBonus: 100
  },
  {
    id: 'daemon-slayer',
    title: 'Daemon Slayer',
    description: 'Track rogue processes and terminate them with kill signals.',
    icon: 'Skull',
    xpBonus: 100
  },
  {
    id: 'course-complete',
    title: 'Kernel Overlord',
    description: 'Complete all missions in the WorldBanc forensic Linux campaign.',
    icon: 'Crown',
    xpBonus: 250
  }
];

export const LEVEL_TILES = [
  { level: 1, title: 'Script Novice', minXp: 0 },
  { level: 2, title: 'Bash Apprentice', minXp: 100 },
  { level: 3, title: 'Terminal Hacker', minXp: 250 },
  { level: 4, title: 'Sysadmin Paladin', minXp: 450 },
  { level: 5, title: 'DevOps Vanguard', minXp: 700 },
  { level: 6, title: 'Kernel Overlord', minXp: 1000 },
];
