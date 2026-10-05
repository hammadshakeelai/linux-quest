import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Terminal as TerminalIcon, Trash2, Sparkles } from 'lucide-react';

interface HistoryItem {
  id: string;
  type: 'input' | 'output';
  content: string;
  cwd?: string;
  exitCode?: number;
}

export const TerminalView: React.FC = () => {
  const { shell, runCommand, currentLesson } = useGame();
  const [inputVal, setInputVal] = useState('');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([
    {
      id: 'boot-1',
      type: 'output',
      content: `🐧 TuxQuest Linux Kernel v6.8.9-arch1-1 (x86_64)
WorldBanc Forensic Subsystem online. Type 'help' for commands, or run lesson tasks.
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

    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = inputVal.trim();
      const currentCwd = shell.getCwd();

      // Add user command to terminal stream
      setHistoryItems(prev => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          type: 'input',
          content: inputVal,
          cwd: currentCwd
        }
      ]);

      if (trimmed === 'clear') {
        setHistoryItems([]);
        setInputVal('');
        setHistoryIndex(-1);
        setSuggestions([]);
        return;
      }

      // Execute command in virtual shell
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

  return (
    <div 
      className="flex-1 flex flex-col bg-[#0b0f17] h-[calc(100vh-4rem)] overflow-hidden font-mono text-sm relative"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Header Bar */}
      <div className="h-10 border-b border-slate-800 bg-[#0d131f] px-4 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <TerminalIcon className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 font-semibold truncate">
            {shell.getPrompt()}
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

      {/* Terminal Output Log Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 selection:bg-amber-400/30 selection:text-white">
        {historyItems.map((item) => {
          if (item.type === 'input') {
            const displayPath = item.cwd?.startsWith('/home/user')
              ? '~' + item.cwd.slice('/home/user'.length)
              : item.cwd || '~';

            return (
              <div key={item.id} className="flex items-center space-x-2 text-slate-300">
                <span className="text-sky-400 font-bold">user@worldbanc</span>
                <span className="text-slate-500">:</span>
                <span className="text-amber-400 font-semibold">{displayPath}</span>
                <span className="text-slate-400">$</span>
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
                  : 'text-slate-300'
              }`}
            >
              {item.content}
            </div>
          );
        })}

        {/* Tab Suggestions Preview */}
        {suggestions.length > 0 && (
          <div className="p-2 rounded bg-slate-900 border border-slate-800 text-xs text-amber-300 flex flex-wrap gap-2">
            <span className="text-slate-500">Suggestions:</span>
            {suggestions.map((s, idx) => (
              <span key={idx} className="bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Current Active Command Input Line */}
        <div className="flex items-center space-x-2 text-slate-300 pt-1">
          <span className="text-sky-400 font-bold shrink-0">user@worldbanc</span>
          <span className="text-slate-500 shrink-0">:</span>
          <span className="text-amber-400 font-semibold shrink-0">
            {shell.getCwd().startsWith('/home/user')
              ? '~' + shell.getCwd().slice('/home/user'.length)
              : shell.getCwd()}
          </span>
          <span className="text-slate-400 shrink-0">$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            className="flex-1 bg-transparent outline-none text-white font-mono caret-amber-400 p-0 m-0 border-none"
          />
        </div>

        <div ref={bottomRef} />
      </div>

      {/* Terminal Helper Footer */}
      <div className="h-7 border-t border-slate-900 bg-[#090d15] px-4 flex items-center justify-between text-[11px] text-slate-500 select-none">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400">Tab</kbd>
            <span>autocomplete</span>
          </span>
          <span className="flex items-center space-x-1">
            <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400">↑↓</kbd>
            <span>history</span>
          </span>
          <span className="flex items-center space-x-1">
            <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400">|</kbd>
            <span>pipe</span>
          </span>
        </div>
        <div className="text-emerald-400/80 font-mono text-[10px] flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block mr-1" />
          <span>VFS ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
