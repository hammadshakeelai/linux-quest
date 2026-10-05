import React from 'react';
import { useGame } from '../context/GameContext';
import { Terminal, Flame, Award, RefreshCw, ExternalLink, Sparkles } from 'lucide-react';
import { LEVEL_TILES } from '../data/achievements';

interface HeaderProps {
  onOpenAchievements: () => void;
  onOpenStats: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAchievements, onOpenStats }) => {
  const { userStats, activeTab, setActiveTab, resetProgress, currentLesson } = useGame();

  const currentLevelInfo = LEVEL_TILES.find(l => l.level === userStats.level) || LEVEL_TILES[0];
  const nextLevelInfo = LEVEL_TILES.find(l => l.level === userStats.level + 1);
  const prevLevelXp = currentLevelInfo.minXp;
  const nextLevelXp = nextLevelInfo ? nextLevelInfo.minXp : currentLevelInfo.minXp + 500;
  
  const xpInCurrentLevel = userStats.xp - prevLevelXp;
  const xpNeededForNext = nextLevelXp - prevLevelXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpNeededForNext) * 100)));

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 flex items-center justify-between select-none z-30 sticky top-0">
      {/* Brand & Course Title */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl">
          🐧
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold tracking-tight text-white text-base">LINUX<span className="text-amber-400">QUEST</span></span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
              BOOT.DEV STYLE
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">
            {currentLesson.title}
          </p>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
        <button
          onClick={() => setActiveTab('mission')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'mission'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          Mission Quest
        </button>
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'sandbox'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Free Sandbox
        </button>
      </div>

      {/* Gamification Stats: Level, XP, Streak, Achievements */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Streak Counter */}
        <div 
          title="Daily Streak - Practice daily to keep the flame alive!"
          className="flex items-center space-x-1.5 bg-orange-950/40 border border-orange-500/30 px-2.5 py-1 rounded-lg text-orange-400 text-xs font-bold shadow-sm"
        >
          <Flame className="w-4 h-4 fill-orange-500 text-orange-400 animate-pulse" />
          <span>{userStats.streak}d</span>
        </div>

        {/* Level & XP Progress */}
        <div 
          onClick={onOpenStats}
          className="cursor-pointer group flex items-center space-x-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl transition"
        >
          <div className="w-6 h-6 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-extrabold text-xs">
            {userStats.level}
          </div>
          <div className="hidden sm:block text-left">
            <div className="flex items-center justify-between text-[11px] gap-2">
              <span className="font-semibold text-slate-200">{currentLevelInfo.title}</span>
              <span className="text-amber-400 font-mono font-bold">{userStats.xp} XP</span>
            </div>
            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Badges / Achievements Button */}
        <button
          onClick={onOpenAchievements}
          title="View Badges & Achievements"
          className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition"
        >
          <Award className="w-4 h-4 text-amber-400" />
          {userStats.unlockedAchievementIds.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
              {userStats.unlockedAchievementIds.length}
            </span>
          )}
        </button>

        {/* GitHub link */}
        <a
          href="https://github.com/hammadshakeelai/linux-quest"
          target="_blank"
          rel="noopener noreferrer"
          title="View on GitHub"
          className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 transition"
        >
          <span>GitHub</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        {/* Reset Button */}
        <button
          onClick={() => {
            if (window.confirm('Reset all progress, XP, and virtual terminal filesystem?')) {
              resetProgress();
            }
          }}
          title="Reset Progress"
          className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
