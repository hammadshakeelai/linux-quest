import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { renderAnsi } from '../utils/ansi';
import { Terminal as TerminalIcon, Trash2, Sparkles, Shield, Cpu } from 'lucide-react';

interface HistoryItem {
  id: string;
  type: 'input' | 'output';
  content: string;
  cwd?: string;
  user?: string;
  exitCode?: number;
}

export const TerminalView: React.FC = () => {
  const { shell, runCommand, currentLesson, vfs } = useGame();
  const [inputVal, setInputVal] = useState('');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([
    {
      id: 'boot-1',
      type: 'output',
      content: `\x1b[1;36m🐧 LinuxQuest Kernel v6.8.9-arch1-1 (x86_64 GNU/Linux)\x1b[0m
\x1b[1;33mWorldBanc Cybersecurity Forensic Shell\x1b[0m
Type '\x1b[1;32mhelp\x1b[0m' or '\x1b[1;32mman <command>\x1b[0m' for command manuals.
`
    }
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new output
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [historyItems]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const history = shell.getHistory();

    // Ctrl+L: Clear terminal
    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      setHistoryItems([]);
      setInputVal('');
      return;
    }

    // Ctrl+C: Cancel / interrupt line
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      setHistoryItems(prev => [
        ...prev,
        {
          id: `int-${Date.now()}`,
          type: 'input',
          content: inputVal + '^C',
          cwd: shell.getCwd(),
          user: vfs.getCurrentUser(),
        }
      ]);
      setInputVal('');
      setHistoryIndex(-1);
      setSuggestions([]);
      return;
    }

    // Ctrl+U: Clear current line buffer
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      setInputVal('');
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = inputVal.trim();
      const currentCwd = shell.getCwd();
      const currentUser = vfs.getCurrentUser();

      setHistoryItems(prev => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          type: 'input',
          content: inputVal,
          cwd: currentCwd,
          user: currentUser,
        }
      ]);

      if (trimmed === 'clear') {
        setHistoryItems([]);
        setInputVal('');
        setHistoryIndex(-1);
        setSuggestions([]);
        return;
      }

      const res = runCommand(inputVal);

      if (res.output) {
        setHistoryItems(prev => [
          ...prev,
          {
            id: `out-${Date.now()}`,
            type: 'output',
            content: res.output,
            exitCode: res.exitCode
          }
        ]);
      }

      setInputVal('');
      setHistoryIndex(-1);
      setSuggestions([]);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputVal(history[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIndex);
        setInputVal(history[nextIndex]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const parts = inputVal.split(' ');
      const lastWord = parts[parts.length - 1];
      const matches = shell.getCompletions(lastWord);

      if (matches.length === 1) {
        parts[parts.length - 1] = matches[0];
        setInputVal(parts.join(' ') + (matches[0].includes('/') ? '' : ' '));
        setSuggestions([]);
      } else if (matches.length > 1) {
        setSuggestions(matches);
      }
    }
  };

  const clearTerminal = () => {
    setHistoryItems([]);
    inputRef.current?.focus();
  };

  const isRoot = vfs.isRoot();
  const currentUser = isRoot ? 'root' : vfs.getCurrentUser();
  const currentCwd = shell.getCwd();
  const home = isRoot ? '/root' : '/home/user';
  const displayCwd = currentCwd === home ? '~' : currentCwd.startsWith(home + '/') ? '~' + currentCwd.slice(home.length) : currentCwd;
  const promptSymbol = isRoot ? '#' : '$';

  return (
    <div 
      className="flex-1 flex flex-col bg-[#070b12] h-[calc(100vh-4rem)] overflow-hidden font-mono text-sm relative selection:bg-amber-400/30 selection:text-white"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Titlebar */}
      <div className="h-10 border-b border-slate-800/80 bg-[#0c111a] px-4 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <TerminalIcon className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-300 font-semibold truncate flex items-center gap-1.5">
            <span>{currentUser}@worldbanc-sec-01: {displayCwd}</span>
            {isRoot && (
              <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded font-bold">
                ROOT PRIVILEGES
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {currentLesson.solutionCommands && currentLesson.solutionCommands.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (currentLesson.solutionCommands) {
                  setInputVal(currentLesson.solutionCommands[0]);
                  inputRef.current?.focus();
                }
              }}
              title="Auto-fill solution command"
              className="text-[11px] font-medium text-amber-400 hover:text-amber-300 px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 flex items-center space-x-1 transition"
            >
              <Sparkles className="w-3 h-3" />
              <span>Fill Solution</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              clearTerminal();
            }}
            title="Clear Terminal (Ctrl+L)"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
        {historyItems.map((item) => {
          if (item.type === 'input') {
            const itemUser = item.user || 'user';
            const itemIsRoot = itemUser === 'root';
            const itemHome = itemIsRoot ? '/root' : '/home/user';
            const itemPath = item.cwd === itemHome ? '~' : item.cwd?.startsWith(itemHome + '/') ? '~' + item.cwd.slice(itemHome.length) : item.cwd || '~';
            const symbol = itemIsRoot ? '#' : '$';

            return (
              <div key={item.id} className="flex items-center space-x-2 text-slate-200">
                <span className={itemIsRoot ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {itemUser}@worldbanc-sec-01
                </span>
                <span className="text-slate-500">:</span>
                <span className="text-sky-400 font-semibold">{itemPath}</span>
                <span className="text-slate-300 font-bold">{symbol}</span>
                <span className="text-white font-medium">{item.content}</span>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              className={`whitespace-pre-wrap leading-relaxed text-xs ${
                item.exitCode !== 0 && item.exitCode !== undefined
                  ? 'text-red-400'
                  : 'text-slate-200'
              }`}
            >
              {renderAnsi(item.content)}
            </div>
          );
        })}

        {/* Tab Suggestions */}
        {suggestions.length > 0 && (
          <div className="p-2 rounded bg-slate-900/90 border border-slate-800 text-xs text-amber-300 flex flex-wrap gap-2 my-2">
            <span className="text-slate-500 text-[11px] self-center">Tab completions:</span>
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  const parts = inputVal.split(' ');
                  parts[parts.length - 1] = s;
                  setInputVal(parts.join(' ') + ' ');
                  setSuggestions([]);
                  inputRef.current?.focus();
                }}
                className="bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-[11px] text-amber-300 font-mono transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Active Input Prompt */}
        <div className="flex items-center space-x-2 text-slate-200 pt-1">
          <span className={isRoot ? 'text-red-400 font-bold shrink-0' : 'text-emerald-400 font-bold shrink-0'}>
            {currentUser}@worldbanc-sec-01
          </span>
          <span className="text-slate-500 shrink-0">:</span>
          <span className="text-sky-400 font-semibold shrink-0">{displayCwd}</span>
          <span className="text-slate-300 font-bold shrink-0">{promptSymbol}</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            className="flex-1 bg-transparent outline-none text-white font-mono caret-amber-400 p-0 m-0 border-none shadow-none focus:ring-0"
          />
        </div>

        <div ref={bottomRef} />
      </div>

      {/* Terminal Footer Status Bar */}
      <div className="h-7 border-t border-slate-800/70 bg-[#090d14] px-4 flex items-center justify-between text-[11px] text-slate-500 select-none">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <kbd className="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400">Tab</kbd>
            <span>autocomplete</span>
          </span>
          <span className="flex items-center space-x-1">
            <kbd className="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400">Ctrl+L</kbd>
            <span>clear</span>
          </span>
          <span className="flex items-center space-x-1">
            <kbd className="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400">Ctrl+C</kbd>
            <span>interrupt</span>
          </span>
          <span className="hidden md:flex items-center space-x-1">
            <kbd className="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400">↑↓</kbd>
            <span>history</span>
          </span>
        </div>
        <div className="flex items-center space-x-2 font-mono text-[10px]">
          <span className="text-slate-400 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-sky-400" />
            <span>Bash 5.2</span>
          </span>
          <span className="text-emerald-400/90 flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>POSIX VFS</span>
          </span>
        </div>
      </div>
    </div>
  );
};
