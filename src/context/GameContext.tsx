import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Course, Lesson, UserStats, Achievement } from '../types';
import { LINUX_COURSE } from '../data/courses';
import { ACHIEVEMENTS, LEVEL_TILES } from '../data/achievements';
import { VirtualFS } from '../services/vfs';
import { ShellService, type CommandResult } from '../services/shell';
import confetti from 'canvas-confetti';

interface GameContextType {
  course: Course;
  currentLesson: Lesson;
  userStats: UserStats;
  shell: ShellService;
  vfs: VirtualFS;
  achievements: Achievement[];
  recentAchievement: Achievement | null;
  levelUpInfo: { level: number; title: string } | null;
  objectiveStatus: Record<string, boolean>;
  isAllCompleted: boolean;
  activeTab: 'mission' | 'sandbox' | 'stats';
  setActiveTab: (tab: 'mission' | 'sandbox' | 'stats') => void;
  selectLesson: (lessonId: string) => void;
  runCommand: (input: string) => CommandResult;
  checkObjectives: () => boolean;
  nextLesson: () => void;
  resetProgress: () => void;
  closeModals: () => void;
}

const STORAGE_KEY = 'tuxquest_user_progress_v1';

const defaultStats: UserStats = {
  xp: 0,
  level: 1,
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedLessonIds: [],
  unlockedAchievementIds: [],
  commandsRunCount: 0,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [course] = useState<Course>(LINUX_COURSE);
  const [currentLesson, setCurrentLesson] = useState<Lesson>(LINUX_COURSE.modules[0].lessons[0]);
  const [vfs, setVfs] = useState<VirtualFS>(() => new VirtualFS());
  const [shell, setShell] = useState<ShellService>(() => new ShellService(vfs));
  const [objectiveStatus, setObjectiveStatus] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'mission' | 'sandbox' | 'stats'>('mission');
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null);
  const [levelUpInfo, setLevelUpInfo] = useState<{ level: number; title: string } | null>(null);

  const [userStats, setUserStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return defaultStats;
  });

  // Persist userStats
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userStats));
    } catch (e) {
      console.error(e);
    }
  }, [userStats]);

  // Reset lesson objective tracking on lesson change
  useEffect(() => {
    const initialStatus: Record<string, boolean> = {};
    currentLesson.objectives.forEach(obj => {
      initialStatus[obj.id] = false;
    });
    setObjectiveStatus(initialStatus);
  }, [currentLesson]);

  const selectLesson = (lessonId: string) => {
    for (const mod of course.modules) {
      const found = mod.lessons.find(l => l.id === lessonId);
      if (found) {
        setCurrentLesson(found);
        break;
      }
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#38bdf8', '#10b981', '#a855f7']
      });
    } catch (e) {
      console.error(e);
    }
  };

  const awardXP = (amount: number) => {
    setUserStats(prev => {
      const newXp = prev.xp + amount;
      let newLevel = prev.level;
      let earnedTitle = '';

      for (let i = LEVEL_TILES.length - 1; i >= 0; i--) {
        if (newXp >= LEVEL_TILES[i].minXp) {
          if (LEVEL_TILES[i].level > prev.level) {
            newLevel = LEVEL_TILES[i].level;
            earnedTitle = LEVEL_TILES[i].title;
          }
          break;
        }
      }

      if (newLevel > prev.level) {
        setLevelUpInfo({ level: newLevel, title: earnedTitle });
        triggerConfetti();
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
      };
    });
  };

  const unlockAchievement = (id: string) => {
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (!ach || userStats.unlockedAchievementIds.includes(id)) return;

    setUserStats(prev => ({
      ...prev,
      unlockedAchievementIds: [...prev.unlockedAchievementIds, id],
      xp: prev.xp + ach.xpBonus
    }));
    setRecentAchievement(ach);
    triggerConfetti();
  };

  const checkObjectives = (): boolean => {
    const history = shell.getHistory();
    const updatedStatus: Record<string, boolean> = { ...objectiveStatus };
    let allPassed = true;

    for (const obj of currentLesson.objectives) {
      let passed = false;

      switch (obj.testType) {
        case 'command_run': {
          if (obj.testArg) {
            passed = history.some(h => h.trim().startsWith(obj.testArg!) || h.trim() === obj.testArg!);
          }
          break;
        }
        case 'file_exists': {
          if (obj.testArg) {
            const node = vfs.getNode(obj.testArg);
            passed = !!node && node.type === 'file';
          }
          break;
        }
        case 'dir_exists': {
          if (obj.testArg) {
            const node = vfs.getNode(obj.testArg);
            passed = !!node && node.type === 'directory';
          }
          break;
        }
        case 'file_content': {
          if (obj.testArg && obj.testExpected) {
            const node = vfs.getNode(obj.testArg);
            passed = !!node && (node.content || '').includes(obj.testExpected);
          }
          break;
        }
        case 'permission_check': {
          if (obj.testArg && obj.testExpected) {
            const node = vfs.getNode(obj.testArg);
            passed = !!node && node.permissions === obj.testExpected;
          }
          break;
        }
        case 'pipe_used': {
          passed = history.some(h => h.includes('|'));
          break;
        }
        case 'user_is': {
          if (obj.testExpected) {
            passed = vfs.getCurrentUser() === obj.testExpected;
          }
          break;
        }
        default:
          passed = false;
      }

      updatedStatus[obj.id] = passed;
      if (!passed) allPassed = false;
    }

    setObjectiveStatus(updatedStatus);

    if (allPassed && !userStats.completedLessonIds.includes(currentLesson.id)) {
      // Mark completed & award XP
      setUserStats(prev => ({
        ...prev,
        completedLessonIds: [...prev.completedLessonIds, currentLesson.id]
      }));
      awardXP(currentLesson.xpReward);
      triggerConfetti();

      // Check achievement conditions
      if (currentLesson.id === 'les-1-1') unlockAchievement('first-command');
      if (currentLesson.id === 'les-1-3') unlockAchievement('navigator');
      if (currentLesson.id === 'les-2-1') unlockAchievement('file-crafter');
      if (currentLesson.id === 'les-3-2') unlockAchievement('pipe-dream');
      if (currentLesson.id === 'les-3-1') unlockAchievement('grep-guru');
      if (currentLesson.id === 'les-4-1') unlockAchievement('security-guardian');
      if (currentLesson.id === 'les-5-1') unlockAchievement('daemon-slayer');
    }

    return allPassed;
  };

  const runCommand = (input: string): CommandResult => {
    setUserStats(prev => ({
      ...prev,
      commandsRunCount: prev.commandsRunCount + 1
    }));

    if (userStats.commandsRunCount === 0) {
      unlockAchievement('first-command');
    }

    const res = shell.execute(input);

    // Re-verify objectives dynamically
    setTimeout(() => {
      checkObjectives();
    }, 50);

    return res;
  };

  const nextLesson = () => {
    let foundCurrent = false;
    for (const mod of course.modules) {
      for (const les of mod.lessons) {
        if (foundCurrent) {
          setCurrentLesson(les);
          return;
        }
        if (les.id === currentLesson.id) {
          foundCurrent = true;
        }
      }
    }
  };

  const resetProgress = () => {
    const fresh = new VirtualFS();
    setVfs(fresh);
    setShell(new ShellService(fresh));
    setUserStats(defaultStats);
    localStorage.removeItem(STORAGE_KEY);
    setCurrentLesson(course.modules[0].lessons[0]);
  };

  const closeModals = () => {
    setRecentAchievement(null);
    setLevelUpInfo(null);
  };

  const isAllCompleted = currentLesson.objectives.every(o => objectiveStatus[o.id]);

  return (
    <GameContext.Provider
      value={{
        course,
        currentLesson,
        userStats,
        shell,
        vfs,
        achievements: ACHIEVEMENTS,
        recentAchievement,
        levelUpInfo,
        objectiveStatus,
        isAllCompleted,
        activeTab,
        setActiveTab,
        selectLesson,
        runCommand,
        checkObjectives,
        nextLesson,
        resetProgress,
        closeModals,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
