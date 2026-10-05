import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CheckCircle2, Circle, ChevronDown, ChevronRight, Terminal, FolderTree, FileCode2, GitCompare, ShieldCheck, Cpu } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  FolderTree: <FolderTree className="w-4 h-4 text-sky-400" />,
  FileCode2: <FileCode2 className="w-4 h-4 text-emerald-400" />,
  GitCompare: <GitCompare className="w-4 h-4 text-purple-400" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4 text-amber-400" />,
  Cpu: <Cpu className="w-4 h-4 text-rose-400" />,
};

export const Sidebar: React.FC = () => {
  const { course, currentLesson, selectLesson, userStats } = useGame();
  const [collapsedMods, setCollapsedMods] = useState<Record<string, boolean>>({});

  const toggleModule = (modId: string) => {
    setCollapsedMods(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  // Calculate total course completion
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedCount = userStats.completedLessonIds.length;
  const coursePercent = Math.round((completedCount / (totalLessons || 1)) * 100);

  return (
    <aside className="w-72 border-r border-slate-800 bg-slate-950/95 flex flex-col h-[calc(100vh-4rem)] select-none">
      {/* Course Header & Progress Bar */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-300">Curriculum Progress</span>
          <span className="font-mono text-amber-400 font-bold">{coursePercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
            style={{ width: `${coursePercent}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          {completedCount} of {totalLessons} Quests Completed
        </p>
      </div>

      {/* Modules & Lessons List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {course.modules.map((mod) => {
          const isCollapsed = !!collapsedMods[mod.id];
          const modCompletedCount = mod.lessons.filter(l => userStats.completedLessonIds.includes(l.id)).length;

          return (
            <div key={mod.id} className="rounded-xl border border-slate-800/80 bg-slate-900/30 overflow-hidden">
              {/* Module Accordion Header */}
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-slate-900/60 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1 rounded-lg bg-slate-800/60 border border-slate-700/50">
                    {iconMap[mod.icon] || <Terminal className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-200 line-clamp-1">
                      {mod.title}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {modCompletedCount}/{mod.lessons.length} Completed
                    </p>
                  </div>
                </div>
                <div className="text-slate-400">
                  {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </button>

              {/* Lessons Inside Module */}
              {!isCollapsed && (
                <div className="p-1.5 space-y-1 border-t border-slate-800/60 bg-slate-950/40">
                  {mod.lessons.map((les) => {
                    const isSelected = les.id === currentLesson.id;
                    const isDone = userStats.completedLessonIds.includes(les.id);

                    return (
                      <button
                        key={les.id}
                        onClick={() => selectLesson(les.id)}
                        className={`w-full px-2.5 py-2 rounded-lg text-left text-xs transition flex items-center justify-between group ${
                          isSelected
                            ? 'bg-amber-500/15 text-amber-200 border border-amber-500/40 font-semibold shadow-sm'
                            : isDone
                            ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                            : 'text-slate-400 hover:text-slate-300 hover:bg-slate-900/50'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : isSelected ? (
                            <Circle className="w-4 h-4 text-amber-400 fill-amber-400/20 shrink-0 animate-pulse" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                          <span className="truncate">{les.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 group-hover:text-amber-400/80 shrink-0 ml-1">
                          +{les.xpReward}xp
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
