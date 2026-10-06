import React from 'react';

/**
 * Converts text containing standard ANSI escape codes into React spans with Tailwind classes
 */
export function renderAnsi(text: string): React.ReactNode[] {
  // Regex matching ANSI escape sequences: \x1b[...m
  const ansiRegex = /\x1b\[([0-9;]*)m/g;
  const elements: React.ReactNode[] = [];

  let lastIndex = 0;
  let currentClasses: string[] = [];
  let match: RegExpExecArray | null;

  const colorMap: Record<string, string> = {
    '0': 'reset',
    '1': 'font-bold',
    '2': 'opacity-70',
    '4': 'underline',
    '30': 'text-slate-500',
    '31': 'text-red-400',
    '32': 'text-emerald-400',
    '33': 'text-amber-400',
    '34': 'text-sky-400 font-semibold',
    '35': 'text-purple-400',
    '36': 'text-cyan-400',
    '37': 'text-slate-200',
    '90': 'text-slate-500',
    '91': 'text-red-300 font-bold',
    '92': 'text-emerald-300 font-bold',
    '93': 'text-yellow-300 font-bold',
    '94': 'text-blue-400 font-bold',
    '95': 'text-fuchsia-300',
    '96': 'text-cyan-300 font-bold',
    '97': 'text-white',
  };

  let keyIndex = 0;

  while ((match = ansiRegex.exec(text)) !== null) {
    const textChunk = text.slice(lastIndex, match.index);
    if (textChunk) {
      elements.push(
        <span key={`ansi-${keyIndex++}`} className={currentClasses.join(' ')}>
          {textChunk}
        </span>
      );
    }

    const codes = match[1] ? match[1].split(';') : ['0'];
    for (const code of codes) {
      if (code === '0' || code === '') {
        currentClasses = [];
      } else if (colorMap[code]) {
        if (code.startsWith('3') || code.startsWith('9')) {
          currentClasses = currentClasses.filter(c => !c.startsWith('text-'));
        }
        currentClasses.push(colorMap[code]);
      }
    }

    lastIndex = ansiRegex.lastIndex;
  }

  const remaining = text.slice(lastIndex);
  if (remaining) {
    elements.push(
      <span key={`ansi-${keyIndex++}`} className={currentClasses.join(' ')}>
        {remaining}
      </span>
    );
  }

  return elements.length > 0 ? elements : [text];
}
