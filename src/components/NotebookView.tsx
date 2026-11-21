import { ArrowLeft, BookOpen, FileText } from 'lucide-react';
import { useState } from 'react';
import { DepartmentId, NotebookEntry } from '../types/game';
import { getDepartmentColorClasses, getDepartmentLabel } from '../utils/progression';

interface NotebookViewProps {
  entries: NotebookEntry[];
  onBack?: () => void;
  embedded?: boolean;
}

export function NotebookView({ entries, onBack, embedded = false }: NotebookViewProps) {
  const [filter, setFilter] = useState<DepartmentId | 'all'>('all');

  const filtered =
    filter === 'all' ? entries : entries.filter((entry) => entry.department === filter);

  return (
    <div className={embedded ? 'space-y-5' : 'mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6'}>
      {!embedded && onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-slate-700 bg-[#0d1424] px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-amber-400/70 hover:text-amber-300"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Academy HQ</span>
        </button>
      )}

      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-[#0b111e] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-amber-400">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>DETECTIVE NOTEBOOK</span>
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold text-white">
            Recorded Clues &amp; Deductions
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Every examined clue and solved password is automatically preserved here for review.
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-800 bg-[#080c15] p-1">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'maths', label: 'Maths' },
              { id: 'science', label: 'Science' },
              { id: 'english', label: 'English' },
              { id: 'logic', label: 'Logic' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`min-h-[36px] rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                filter === tab.id
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#0b111e] p-10 text-center">
          <FileText className="mx-auto h-8 w-8 text-slate-500" aria-hidden="true" />
          <h3 className="mt-3 text-base font-semibold text-white">No Clues Logged Yet</h3>
          <p className="mt-1 text-sm text-slate-400">
            Start an investigation and examine crime-scene clues to record findings in your notebook.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((entry) => {
            const colors = getDepartmentColorClasses(entry.department);
            return (
              <article
                key={entry.id}
                className="rounded-xl border border-slate-800 bg-[#0b111e] p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className={`font-semibold ${colors.text}`}>
                    {getDepartmentLabel(entry.department)}
                  </span>
                  <span className="text-slate-400">{entry.caseTitle}</span>
                </div>
                <h3 className="mt-2 font-bold text-white">{entry.clueTitle}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{entry.summary}</p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
