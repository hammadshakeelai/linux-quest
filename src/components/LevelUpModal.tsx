import React from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, ArrowRight } from 'lucide-react';

export const LevelUpModal: React.FC = () => {
  const { levelUpInfo, closeModals } = useGame();

  if (!levelUpInfo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 p-8 text-center shadow-2xl relative overflow-hidden glow-gold">
        <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border-2 border-amber-400 mx-auto flex items-center justify-center text-amber-300 mb-5 shadow-lg shadow-amber-500/30">
          <Trophy className="w-10 h-10 animate-bounce" />
        </div>

        <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
          Level Up!
        </span>

        <h3 className="text-3xl font-black text-white mt-1 mb-2">
          Rank {levelUpInfo.level}
        </h3>

        <div className="inline-block px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-bold text-sm mb-6">
          {levelUpInfo.title}
        </div>

        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          You have demonstrated mastery over the Linux terminal and earned new permissions in the WorldBanc network!
        </p>

        <button
          onClick={closeModals}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/25 transition"
        >
          <span>Continue Quest</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
