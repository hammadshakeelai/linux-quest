import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LessonPane } from './components/LessonPane';
import { TerminalView } from './components/TerminalView';
import { AchievementsModal } from './components/AchievementsModal';
import { LevelUpModal } from './components/LevelUpModal';
import { StatsModal } from './components/StatsModal';
import { Terminal, Folder, File, Eye } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, vfs } = useGame();
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [showVfsDrawer, setShowVfsDrawer] = useState(false);

  // Render VFS inspector
  const renderVfsTree = (path: string = '/home/user') => {
    const entries = vfs.listDirectory(path);
    if (!entries) return <div className="text-xs text-slate-500">Empty directory</div>;

    return (
      <div className="space-y-1">
        {entries.map(({ name, node }) => (
          <div key={name} className="flex items-center space-x-2 text-xs py-1 px-2 rounded hover:bg-slate-800/60 font-mono">
            {node.type === 'directory' ? (
              <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <File className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            )}
            <span className="text-slate-200">{name}</span>
            <span className="text-[10px] text-slate-500 ml-auto">{node.permissions || '644'}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-100 flex flex-col font-sans">
      <Header
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
      />

      <main className="flex-1 flex overflow-hidden relative">
        {/* Quest Sidebar */}
        <Sidebar />

        {/* Dynamic Mode Switcher: Mission vs Sandbox */}
        {activeTab === 'mission' ? (
          <div className="flex-1 flex overflow-hidden">
            <LessonPane />
            <TerminalView />
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden p-4">
            <div className="mb-3 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  Free Linux Sandbox Playground
                </h2>
                <p className="text-xs text-slate-400">
                  Experiment freely with Linux commands, write files, pipe streams, and build scripts.
                </p>
              </div>
              <button
                onClick={() => setShowVfsDrawer(!showVfsDrawer)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>{showVfsDrawer ? 'Hide File Tree' : 'View File Tree'}</span>
              </button>
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
              <div className="flex-1 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                <TerminalView />
              </div>

              {showVfsDrawer && (
                <div className="w-80 rounded-xl border border-slate-800 bg-slate-950/90 p-4 overflow-y-auto">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    Virtual Linux Filesystem (/home/user)
                  </h3>
                  {renderVfsTree('/home/user')}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
      />

      <LevelUpModal />
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <MainLayout />
    </GameProvider>
  );
}
