import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CheckCircle2, Circle, Lightbulb, Play, ArrowRight, ShieldAlert, Sparkles, BookOpen, Copy, Check } from 'lucide-react';

export const LessonPane: React.FC = () => {
  const { currentLesson, objectiveStatus, isAllCompleted, nextLesson, checkObjectives, runCommand } = useGame();
  const [revealedHintIndex, setRevealedHintIndex] = useState<number>(-1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const handleRunInTerminal = (code: string) => {
    runCommand(code);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 text-slate-200 border-r border-slate-800 bg-slate-950/60 max-w-2xl">
      {/* Lesson Header Badges */}
      <div className="flex items-center space-x-2.5 mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {currentLesson.difficulty}
        </span>
        <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
          +{currentLesson.xpReward} XP
        </span>
        <span className="text-[11px] text-slate-400">
          ⏱️ ~{currentLesson.estimatedMinutes} mins
        </span>
      </div>

      <h1 className="text-2xl font-black text-white tracking-tight mb-4">
        {currentLesson.title}
      </h1>

      {/* Forensic Narrative Lore Box (Boot.dev WorldBanc style) */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-950/30 to-amber-950/20 border border-red-500/20 shadow-sm relative overflow-hidden">
        <div className="flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400/90 mb-1">
              WORLDBANC INCIDENT DOSSIER #4092
            </div>
            <p className="text-xs text-amber-200/90 leading-relaxed font-sans italic">
              "{currentLesson.story}"
            </p>
          </div>
        </div>
      </div>

      {/* Lesson Tutorial Markdown Content */}
      <div className="prose prose-invert prose-sm max-w-none mb-8 space-y-4 text-slate-300 text-sm leading-relaxed">
        {currentLesson.content.split('\n\n').map((paragraph, idx) => {
          if (paragraph.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-base font-bold text-white mt-6 mb-2 border-b border-slate-800 pb-1">
                {paragraph.replace('### ', '')}
              </h3>
            );
          }

          if (paragraph.startsWith('```')) {
            const cleanCode = paragraph.replace(/```[a-z]*\n?|```/g, '').trim();
            return (
              <div key={idx} className="my-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-900/90 relative group">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/70 border-b border-slate-800/80 text-[11px] text-slate-400 font-mono">
                  <span>bash command</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopy(cleanCode)}
                      className="hover:text-amber-300 flex items-center space-x-1 transition"
                      title="Copy code"
                    >
                      {copiedCode === cleanCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode === cleanCode ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => handleRunInTerminal(cleanCode)}
                      className="text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1 pl-2 border-l border-slate-800 transition"
                      title="Execute directly in terminal"
                    >
                      <Play className="w-3 h-3 fill-amber-400" />
                      <span>Run</span>
                    </button>
                  </div>
                </div>
                <pre className="p-3 font-mono text-xs text-emerald-300 overflow-x-auto m-0">
                  {cleanCode}
                </pre>
              </div>
            );
          }

          return (
            <p key={idx} className="leading-relaxed">
              {paragraph}
            </p>
          );
        })}
      </div>

      {/* Quest Objectives Section */}
      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Quest Objectives
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {Object.values(objectiveStatus).filter(Boolean).length} / {currentLesson.objectives.length} passed
          </span>
        </div>

        <div className="space-y-2">
          {currentLesson.objectives.map((obj) => {
            const isDone = !!objectiveStatus[obj.id];
            return (
              <div
                key={obj.id}
                className={`p-3 rounded-lg border flex items-start space-x-3 transition ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : 'bg-slate-950/50 border-slate-800/80 text-slate-300'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-xs">
                  <p className={isDone ? 'line-through text-slate-400' : 'font-medium'}>
                    {obj.description}
                  </p>
                  {obj.hint && !isDone && (
                    <p className="text-[11px] text-amber-400/80 mt-1 italic font-mono">
                      💡 {obj.hint}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Socratic Hints Accordion (Boot.dev "Boots" style) */}
      {currentLesson.tips && currentLesson.tips.length > 0 && (
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-bold text-slate-200">Need a hint? (Socratic Assistant)</span>
            </div>
            <button
              onClick={() => {
                if (revealedHintIndex < currentLesson.tips!.length - 1) {
                  setRevealedHintIndex(prev => prev + 1);
                }
              }}
              disabled={revealedHintIndex >= currentLesson.tips.length - 1}
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 disabled:opacity-40 transition"
            >
              Reveal Next Clue
            </button>
          </div>

          {revealedHintIndex >= 0 ? (
            <div className="space-y-2 mt-3">
              {currentLesson.tips.slice(0, revealedHintIndex + 1).map((hint, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-amber-200/90 font-mono">
                  Clue #{idx + 1}: {hint}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500">
              Try solving without hints for maximum learning! Click "Reveal Next Clue" if you're stuck.
            </p>
          )}
        </div>
      )}

      {/* Action Controls: Verify / Next Mission */}
      <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent flex items-center justify-between">
        <button
          onClick={() => checkObjectives()}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-2 border border-slate-700 transition"
        >
          <Play className="w-3.5 h-3.5 fill-slate-200" />
          <span>Verify Objectives</span>
        </button>

        {isAllCompleted ? (
          <button
            onClick={nextLesson}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black flex items-center space-x-2 shadow-lg shadow-amber-500/30 transition animate-bounce"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>Next Mission</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="text-[11px] text-slate-500 italic">
            Complete objectives in the terminal to advance
          </div>
        )}
      </div>
    </div>
  );
};
