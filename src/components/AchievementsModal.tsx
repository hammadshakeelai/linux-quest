import React from 'react';
import { useGame } from '../context/GameContext';
import { X, Award, CheckCircle2, Lock } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose }) => {
  const { achievements, userStats } = useGame();

  if (!isOpen) return null;

  const unlockedCount = userStats.unlockedAchievementIds.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Badges &amp; Achievements</h2>
            <p className="text-xs text-slate-400">
              Unlocked: <span className="text-amber-400 font-bold">{unlockedCount}</span> of {achievements.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {achievements.map((ach) => {
            const isUnlocked = userStats.unlockedAchievementIds.includes(ach.id);

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-xl border flex items-start space-x-3 transition ${
                  isUnlocked
                    ? 'bg-amber-950/15 border-amber-500/30'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                }`}
              >
                <div className={`p-2 rounded-lg ${isUnlocked ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'}`}>
                  {isUnlocked ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isUnlocked ? 'text-amber-200' : 'text-slate-400'}`}>
                    {ach.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {ach.description}
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                    +{ach.xpBonus} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
