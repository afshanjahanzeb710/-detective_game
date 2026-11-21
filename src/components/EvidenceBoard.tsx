import { CheckCircle2, Link2, Pin, ShieldAlert, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { ClueChallenge, EvidenceBoardState, Suspect, SuspectVerdict } from '../types/game';
import { audioEngine } from '../utils/audio';
import { getDepartmentColorClasses, getDepartmentLabel } from '../utils/progression';

interface EvidenceBoardProps {
  suspects: Suspect[];
  discoveredClues: ClueChallenge[];
  boardState: EvidenceBoardState;
  onUpdateVerdict: (suspectId: string, verdict: SuspectVerdict) => void;
  onToggleClueLink: (clueId: string, suspectId: string) => void;
}

export function EvidenceBoard({
  suspects,
  discoveredClues,
  boardState,
  onUpdateVerdict,
  onToggleClueLink,
}: EvidenceBoardProps) {
  const [selectedClueId, setSelectedClueId] = useState<string | null>(
    discoveredClues.length > 0 ? discoveredClues[0].id : null
  );

  const selectedClue = discoveredClues.find((c) => c.id === selectedClueId) ?? null;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-[#080c15] p-4 text-sm text-slate-300">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-amber-300">Interactive Evidence Board</span>
          <span className="text-xs text-slate-400">
            Step 1: Select a discovered clue on the left · Step 2: Pin it to a suspect on the right and mark verdicts
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Discovered Clues */}
        <div className="space-y-3 lg:col-span-5">
          <h3 className="text-xs font-bold tracking-[0.14em] text-amber-400">
            DISCOVERED CLUES ({discoveredClues.length})
          </h3>

          {discoveredClues.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-[#080c15] p-5 text-sm text-slate-400">
              No clues examined yet. Inspect clues on the Scene &amp; Clues tab to pin them onto the Evidence Board.
            </div>
          ) : (
            discoveredClues.map((clue) => {
              const isSelected = selectedClueId === clue.id;
              const linkedCount = (boardState.clueLinks[clue.id] ?? []).length;
              const deptColors = getDepartmentColorClasses(clue.department);

              return (
                <button
                  key={clue.id}
                  type="button"
                  onClick={() => {
                    audioEngine.playClick();
                    setSelectedClueId(clue.id);
                  }}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/10'
                      : 'border-slate-800 bg-[#080c15] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className={`font-semibold ${deptColors.text}`}>
                      {getDepartmentLabel(clue.department)}
                    </span>
                    <span className="font-mono-tabular text-slate-400">
                      {linkedCount} link{linkedCount === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="mt-1 font-semibold text-white">{clue.clueTitle}</div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">{clue.notebookSummary}</p>
                </button>
              );
            })
          )}
        </div>

        {/* Right Column: Suspects & Thread Pinning */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-bold tracking-[0.14em] text-amber-400">
              SUSPECTS &amp; EVIDENCE THREADS
            </h3>
            {selectedClue && (
              <span className="text-xs text-amber-200">
                Pinning clue: <strong>{selectedClue.clueTitle}</strong>
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {suspects.map((suspect) => {
              const verdict = boardState.suspectVerdicts[suspect.id] ?? 'review';
              const linkedClues = discoveredClues.filter((c) =>
                (boardState.clueLinks[c.id] ?? []).includes(suspect.id)
              );
              const isLinkedToSelected =
                selectedClue !== null &&
                (boardState.clueLinks[selectedClue.id] ?? []).includes(suspect.id);

              return (
                <div
                  key={suspect.id}
                  className={`flex flex-col justify-between rounded-xl border p-4 transition-colors ${
                    verdict === 'prime'
                      ? 'border-red-500/55 bg-red-950/20'
                      : verdict === 'cleared'
                        ? 'border-emerald-500/45 bg-emerald-950/15'
                        : 'border-slate-800 bg-[#080c15]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-white">{suspect.name}</h4>
                        <div className="text-xs text-slate-400">{suspect.role}</div>
                      </div>
                      {verdict === 'prime' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400">
                          <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                          PRIME
                        </span>
                      )}
                      {verdict === 'cleared' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                          <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          CLEARED
                        </span>
                      )}
                    </div>

                    <p className="mt-2.5 text-xs leading-relaxed text-slate-300">{suspect.alibi}</p>
                    <p className="mt-1.5 text-xs text-slate-400">Trait: {suspect.trait}</p>

                    {/* Linked clues list */}
                    {linkedClues.length > 0 && (
                      <div className="mt-3 space-y-1 border-t border-slate-800/80 pt-2.5">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                          <Link2 className="h-3 w-3" aria-hidden="true" />
                          <span>Pinned Evidence:</span>
                        </div>
                        {linkedClues.map((lc) => (
                          <div key={lc.id} className="text-[11px] text-slate-200">
                            • {lc.clueTitle}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Controls */}
                  <div className="mt-4 space-y-2 border-t border-slate-800/80 pt-3">
                    {selectedClue && (
                      <button
                        type="button"
                        onClick={() => {
                          audioEngine.playClick();
                          onToggleClueLink(selectedClue.id, suspect.id);
                        }}
                        className={`flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          isLinkedToSelected
                            ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                            : 'border-slate-700 bg-[#101829] text-slate-200 hover:border-amber-400/70'
                        }`}
                      >
                        <Pin className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{isLinkedToSelected ? 'Unpin Selected Clue' : 'Pin Selected Clue Here'}</span>
                      </button>
                    )}

                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          { id: 'review', label: 'Review' },
                          { id: 'cleared', label: 'Cleared' },
                          { id: 'prime', label: 'Suspect' },
                        ] as const
                      ).map((status) => (
                        <button
                          key={status.id}
                          type="button"
                          onClick={() => {
                            audioEngine.playClick();
                            onUpdateVerdict(suspect.id, status.id);
                          }}
                          className={`min-h-[36px] rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors ${
                            verdict === status.id
                              ? status.id === 'prime'
                                ? 'border-red-500 bg-red-500/20 text-red-200'
                                : status.id === 'cleared'
                                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200'
                                  : 'border-amber-400 bg-amber-500/15 text-amber-200'
                              : 'border-slate-800 bg-[#0c1220] text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {status.id === 'cleared' && verdict === 'cleared' ? (
                            <span className="inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                              Cleared
                            </span>
                          ) : (
                            status.label
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
