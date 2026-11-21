import { ArrowLeft, CheckCircle2, ChevronRight, HelpCircle, Lightbulb, Search, XCircle } from 'lucide-react';
import { useState } from 'react';
import { DEPARTMENTS, MYSTERY_CASES } from '../data/academyData';
import { AcademyProgress, ClueChallenge, DepartmentId, MysteryCase } from '../types/game';
import { audioEngine } from '../utils/audio';
import { getDepartmentColorClasses, isCaseUnlocked } from '../utils/progression';

interface DepartmentViewProps {
  departmentId: DepartmentId;
  progress: AcademyProgress;
  onBack: () => void;
  onOpenCase: (mystery: MysteryCase) => void;
  onSolveDrill: (drill: ClueChallenge) => void;
  onUseHintCost: () => void;
}

export function DepartmentView({
  departmentId,
  progress,
  onBack,
  onOpenCase,
  onSolveDrill,
  onUseHintCost,
}: DepartmentViewProps) {
  const department = DEPARTMENTS.find((d) => d.id === departmentId) ?? DEPARTMENTS[0];
  const colors = getDepartmentColorClasses(department.id);
  const [activeDrillIndex, setActiveDrillIndex] = useState(0);
  const [clueExamined, setClueExamined] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong' | 'failed'>('idle');
  const [hintRevealed, setHintRevealed] = useState(false);

  const drill = department.drills[activeDrillIndex];
  const alreadyAwarded = progress.awardedChallengeIds.includes(drill.id);

  const relatedCases = MYSTERY_CASES.filter(
    (c) => c.primaryDepartment === department.id || c.primaryDepartment === 'all'
  );

  const selectDrill = (idx: number) => {
    audioEngine.playClick();
    setActiveDrillIndex(idx);
    setClueExamined(false);
    setAttemptsLeft(3);
    setSelectedOption(null);
    setPasswordInput('');
    setFeedbackState('idle');
    setHintRevealed(false);
  };

  const handleSubmitAnswer = (candidate: string) => {
    if (feedbackState === 'correct' || feedbackState === 'failed') return;
    const trimmed = candidate.trim();
    if (!trimmed) return;

    setSelectedOption(trimmed);
    const isCorrect = trimmed.toUpperCase() === drill.correctAnswer.trim().toUpperCase();

    if (isCorrect) {
      audioEngine.playCorrect();
      setFeedbackState('correct');
      onSolveDrill(drill);
    } else {
      audioEngine.playWrong();
      const nextAttempts = attemptsLeft - 1;
      setAttemptsLeft(nextAttempts);
      if (nextAttempts <= 0) {
        setFeedbackState('failed');
      } else {
        setFeedbackState('wrong');
      }
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-slate-700 bg-[#0d1424] px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-amber-400/70 hover:text-amber-300"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Academy HQ</span>
        </button>

        <div className="font-mono-tabular text-xs text-slate-300">
          Department Score:{' '}
          <strong className="text-amber-400">{progress.departmentPoints[department.id]} pts</strong>
        </div>
      </div>

      {/* Department Header */}
      <section className="rounded-xl border border-slate-800 bg-[#0b111e] p-6 sm:p-8">
        <p className={`text-xs font-semibold tracking-[0.16em] ${colors.text}`}>
          FORENSIC TRAINING DIVISION
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-white">{department.name}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">{department.description}</p>

        {/* Drill Selector Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {department.drills.map((d, idx) => {
            const solved = progress.awardedChallengeIds.includes(d.id);
            const active = idx === activeDrillIndex;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => selectDrill(idx)}
                className={`inline-flex min-h-[42px] items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'border-amber-400 bg-amber-500/15 text-amber-200'
                    : 'border-slate-800 bg-[#080c15] text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>
                  Field Drill 0{idx + 1}: {d.clueTitle}
                </span>
                {solved && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Drill Card */}
      <section className="rounded-xl border border-slate-800 bg-[#0b111e] p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className={`text-xs font-semibold tracking-wider ${colors.text}`}>
              DRILL 0{activeDrillIndex + 1} OF {department.drills.length}
            </div>
            <h2 className="mt-1 text-xl font-bold text-white">{drill.clueTitle}</h2>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="font-mono-tabular text-slate-300">
              Attempts Left:{' '}
              <strong className={attemptsLeft <= 1 ? 'text-red-400' : 'text-amber-300'}>
                {attemptsLeft}/3
              </strong>
            </span>
            {alreadyAwarded && (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Point Banked
              </span>
            )}
          </div>
        </div>

        {/* Step 1: Examine Discovery */}
        <div className="mt-6 rounded-xl border border-slate-800/90 bg-[#080c15] p-5">
          <div className="text-xs font-semibold tracking-wider text-amber-400">SCENE EVIDENCE</div>
          <p className="mt-2 text-sm leading-relaxed text-slate-200">{drill.discoveryText}</p>

          {!clueExamined ? (
            <button
              type="button"
              onClick={() => {
                audioEngine.playClueDiscovered();
                setClueExamined(true);
              }}
              className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>Examine Evidence & Reveal Question</span>
            </button>
          ) : null}
        </div>

        {/* Step 2: Question */}
        {clueExamined && (
          <div className="mt-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="text-base font-semibold leading-relaxed text-white sm:text-lg">
                {drill.prompt}
              </h3>

              {!hintRevealed && feedbackState !== 'correct' && feedbackState !== 'failed' && (
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playHint();
                    setHintRevealed(true);
                    onUseHintCost();
                  }}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 whitespace-nowrap shrink-0"
                >
                  <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Use Hint (-1 pt)</span>
                </button>
              )}
            </div>

            {hintRevealed && (
              <div className="rounded-lg border border-amber-500/35 bg-amber-500/10 p-4 text-sm text-amber-100">
                <span className="font-semibold text-amber-300">Detective Hint: </span>
                {drill.hint}
              </div>
            )}

            {drill.questionFormat === 'multiple-choice' && drill.options ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {drill.options.map((option) => {
                  const isSelected = selectedOption === option;
                  const showGreen = isSelected && feedbackState === 'correct';
                  const showRed =
                    isSelected && (feedbackState === 'wrong' || feedbackState === 'failed');

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={feedbackState === 'correct' || feedbackState === 'failed'}
                      onClick={() => handleSubmitAnswer(option)}
                      className={`flex min-h-[52px] items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                        showGreen
                          ? 'border-emerald-500 bg-emerald-500/15 text-emerald-100'
                          : showRed
                            ? 'border-red-500 bg-red-500/15 text-red-100'
                            : 'border-slate-700/80 bg-[#101829] text-slate-100 hover:border-amber-400/70'
                      }`}
                    >
                      <span>{option}</span>
                      {showGreen && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 shrink-0">
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          CORRECT
                        </span>
                      )}
                      {showRed && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400 shrink-0">
                          <XCircle className="h-4 w-4" aria-hidden="true" />
                          WRONG
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitAnswer(passwordInput);
                }}
                className="flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <input
                  type="text"
                  value={passwordInput}
                  disabled={feedbackState === 'correct' || feedbackState === 'failed'}
                  onChange={(e) => setPasswordInput(e.target.value.toUpperCase())}
                  placeholder={drill.passwordHintLabel ?? 'Enter secret password'}
                  className={`min-h-[48px] flex-1 rounded-lg border px-4 py-2.5 font-mono-tabular text-base tracking-[0.2em] text-white outline-none ${
                    feedbackState === 'correct'
                      ? 'border-emerald-500 bg-emerald-500/15'
                      : feedbackState === 'wrong' || feedbackState === 'failed'
                        ? 'border-red-500 bg-red-500/15'
                        : 'border-slate-700 bg-[#080c15] focus:border-amber-400'
                  }`}
                />
                <button
                  type="submit"
                  disabled={feedbackState === 'correct' || feedbackState === 'failed'}
                  className="min-h-[48px] rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  Verify Password
                </button>
              </form>
            )}

            {/* Explanation / Feedback */}
            {feedbackState === 'wrong' && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
                <div className="flex items-center gap-2 font-bold text-red-400">
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                  <span>INCORRECT — 0 POINTS ({attemptsLeft} attempts remaining)</span>
                </div>
                <p className="mt-1.5 leading-relaxed">{drill.wrongExplanation}</p>
              </div>
            )}

            {feedbackState === 'failed' && (
              <div className="rounded-xl border border-red-500/50 bg-red-950/50 p-4 text-sm text-red-100">
                <div className="flex items-center gap-2 font-bold text-red-400">
                  <HelpCircle className="h-4 w-4" aria-hidden="true" />
                  <span>DRILL FAILED — OUT OF ATTEMPTS</span>
                </div>
                <p className="mt-1.5 leading-relaxed">{drill.wrongExplanation}</p>
                <button
                  type="button"
                  onClick={() => selectDrill(activeDrillIndex)}
                  className="mt-3 min-h-[40px] rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500"
                >
                  Retry Field Drill
                </button>
              </div>
            )}

            {feedbackState === 'correct' && (
              <div className="rounded-xl border border-emerald-500/45 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-bold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    <span>CORRECT! {alreadyAwarded ? 'DRILL SOLVED' : '+1 POINT EARNED'}</span>
                  </span>
                  {activeDrillIndex < department.drills.length - 1 && (
                    <button
                      type="button"
                      onClick={() => selectDrill(activeDrillIndex + 1)}
                      className="inline-flex min-h-[38px] items-center gap-1 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                    >
                      <span>Next Drill</span>
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
                <p className="mt-2 leading-relaxed">{drill.correctExplanation}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Related Full Mysteries */}
      <section className="rounded-xl border border-slate-800 bg-[#0b111e] p-6">
        <h2 className="font-display text-xl font-bold text-white">
          Full Mystery Cases Featuring {department.name}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {relatedCases.map((c) => {
            const unlocked = isCaseUnlocked(c, progress);
            return (
              <div
                key={c.id}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#080c15] p-4"
              >
                <div>
                  <div className="font-mono-tabular text-xs font-semibold text-amber-400">
                    {c.caseNumber}
                  </div>
                  <h3 className="mt-1 font-bold text-white">{c.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">{c.subtitle}</p>
                </div>
                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={() => onOpenCase(c)}
                  className="mt-4 inline-flex min-h-[40px] items-center justify-center rounded-lg border border-slate-700 bg-[#101829] px-3 py-2 text-xs font-semibold text-slate-100 hover:border-amber-400 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {unlocked ? 'Open Case Briefing' : c.unlockRequirement.label}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
