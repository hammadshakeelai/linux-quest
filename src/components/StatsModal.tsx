import React from 'react';
import { useGame } from '../context/GameContext';
import { X, Flame, Trophy, Terminal, Award, BookCheck } from 'lucide-react';
import { LEVEL_TILES } from '../data/achievements';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose }) => {
  const { userStats, course } = useGame();

  if (!isOpen) return null;

  const currentLevelInfo = LEVEL_TILES.find(l => l.level === userStats.level) || LEVEL_TILES[0];
  const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-black text-white mb-1">Cadet Dossier</h2>
        <p className="text-xs text-slate-400 mb-6">User Telemetry &amp; Mastery Metrics</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center space-x-2 text-amber-400 mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Rank</span>
            </div>
            <div className="text-lg font-black text-white">{currentLevelInfo.title}</div>
            <div className="text-[10px] text-slate-400">Level {userStats.level}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center space-x-2 text-yellow-400 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Experience</span>
            </div>
            <div className="text-lg font-black text-white font-mono">{userStats.xp} XP</div>
            <div className="text-[10px] text-slate-400">Total points earned</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center space-x-2 text-orange-400 mb-1">
              <Flame className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Streak</span>
            </div>
            <div className="text-lg font-black text-white font-mono">{userStats.streak} Days</div>
            <div className="text-[10px] text-slate-400">Consistent training</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center space-x-2 text-sky-400 mb-1">
              <Terminal className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Commands</span>
            </div>
            <div className="text-lg font-black text-white font-mono">{userStats.commandsRunCount}</div>
            <div className="text-[10px] text-slate-400">Executed in shell</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-xs font-bold text-white">Missions Completed</div>
              <div className="text-[11px] text-slate-400">
                {userStats.completedLessonIds.length} of {totalLessons} quests
              </div>
            </div>
          </div>
          <span className="text-sm font-black font-mono text-emerald-400">
            {Math.round((userStats.completedLessonIds.length / totalLessons) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
