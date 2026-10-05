export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  permissions?: string; // e.g. "rwxr-xr-x" or "644"
  owner?: string;
  group?: string;
  size?: number;
  updatedAt?: string;
  children?: { [key: string]: FileNode };
}

export interface Objective {
  id: string;
  description: string;
  hint?: string;
  isCompleted: boolean;
  verify: (vfs: any, history: CommandExecution[]) => boolean;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  slug: string;
  xpReward: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  story: string;
  content: string; // Markdown formatted tutorial text
  tips?: string[];
  initialVFS?: { [path: string]: string | FileNode };
  initialCwd?: string;
  objectives: {
    id: string;
    description: string;
    hint?: string;
    testType: 'command_run' | 'file_exists' | 'file_content' | 'dir_exists' | 'permission_check' | 'pipe_used' | 'custom';
    testArg?: string;
    testExpected?: string;
  }[];
  solutionCommands?: string[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  tagline: string;
  description: string;
  modules: Module[];
}

export interface CommandExecution {
  command: string;
  output: string;
  exitCode: number;
  timestamp: number;
  cwd: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  xpBonus: number;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  completedLessonIds: string[];
  unlockedAchievementIds: string[];
  commandsRunCount: number;
}
