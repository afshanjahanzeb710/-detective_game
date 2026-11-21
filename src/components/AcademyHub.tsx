import {
  Award,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Crown,
  FlaskConical,
  KeyRound,
  Lock,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DEPARTMENTS, DETECTIVE_BADGES, DETECTIVE_RANKS, MYSTERY_CASES } from '../data/academyData';
import { AcademyProgress, DepartmentId, MysteryCase } from '../types/game';
import {
  getDepartmentColorClasses,
  getDepartmentLabel,
  getEarnedBadgeIds,
  getRankStatus,
  isCaseUnlocked,
} from '../utils/progression';

interface AcademyHubProps {
  progress: AcademyProgress;
  focusSection: 'departments' | 'cases';
  onOpenDepartment: (deptId: DepartmentId) => void;
  onSelectCase: (mystery: MysteryCase) => void;
  onResetProgress: () => void;
}

function DepartmentIcon({ id, className }: { id: DepartmentId; className?: string }) {
  switch (id) {
    case 'maths':
      return <Calculator className={className} aria-hidden="true" />;
    case 'science':
      return <FlaskConical className={className} aria-hidden="true" />;
    case 'english':
      return <BookOpen className={className} aria-hidden="true" />;
    case 'logic':
      return <KeyRound className={className} aria-hidden="true" />;
  }
}

export function AcademyHub({
  progress,
  focusSection,
  onOpenDepartment,
  onSelectCase,
  onResetProgress,
}: AcademyHubProps) {
  const [confirmReset, setConfirmReset] = useState(false);
  const departmentsRef = useRef<HTMLElement | null>(null);
  const casesRef = useRef<HTMLElement | null>(null);
  const rankStatus = getRankStatus(progress);
  const earnedBadges = getEarnedBadgeIds(progress);

  useEffect(() => {
    if (focusSection === 'departments' && departmentsRef.current) {
      departmentsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (focusSection === 'cases' && casesRef.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [focusSection]);

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6 lg:py-10">
      {/* Rank & Progression Banner */}
      <section aria-labelledby="rank-heading" className="rounded-xl border border-slate-800 bg-[#0b111e] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold tracking-[0.14em] text-amber-400">
              <span>RANK {rankStatus.currentRank.level} OF 5</span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span className="tabular-nums">{progress.solvedCaseIds.length} / {MYSTERY_CASES.length} CASES SOLVED</span>
            </div>
            <h1 id="rank-heading" className="font-display text-2xl font-bold text-white sm:text-3xl">
              {rankStatus.currentRank.title}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-300">
              {rankStatus.currentRank.description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 border-t border-slate-800 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <div>
              <div className="text-xs font-medium text-slate-400">Total Score</div>
              <div className="mt-1 font-mono-tabular text-2xl font-semibold text-amber-400">
                {progress.totalScore} <span className="text-xs font-normal text-slate-400">pts</span>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400">Clues Logged</div>
              <div className="mt-1 font-mono-tabular text-2xl font-semibold text-white">
                {progress.notebookEntries.length}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400">Badges Earned</div>
              <div className="mt-1 font-mono-tabular text-2xl font-semibold text-emerald-400">
                {earnedBadges.size} / {DETECTIVE_BADGES.length}
              </div>
            </div>
          </div>
        </div>

        {/* Rank Progress Bar */}
        <div className="mt-6 border-t border-slate-800/80 pt-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            {rankStatus.nextRank ? (
              <span className="text-slate-300">
                Progress toward <strong className="font-semibold text-amber-300">{rankStatus.nextRank.title}</strong>
                {rankStatus.pointsNeeded > 0 || rankStatus.casesNeeded > 0 ? (
                  <span className="text-slate-400">
                    {' '}
                    ({rankStatus.pointsNeeded} more pts · {rankStatus.casesNeeded} more case
                    {rankStatus.casesNeeded === 1 ? '' : 's'})
                  </span>
                ) : null}
              </span>
            ) : (
              <span className="font-semibold text-emerald-400">
                Maximum Rank Achieved — Detective Legend
              </span>
            )}
            <span className="font-mono-tabular font-semibold text-amber-400">
              {rankStatus.progressPercent}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={rankStatus.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
              style={{ width: `${rankStatus.progressPercent}%` }}
            />
          </div>

          {/* 5 Rank Milestones */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
            {DETECTIVE_RANKS.map((rank) => {
              const reached = rankStatus.currentRank.level >= rank.level;
              return (
                <div
                  key={rank.level}
                  className={`rounded-lg border px-3 py-2 ${
                    reached
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                      : 'border-slate-800 bg-[#080c15] text-slate-400'
                  }`}
                >
                  <div className="font-mono-tabular text-[11px] opacity-80">
                    Rank {rank.level} · {rank.minPoints} pts
                  </div>
                  <div className="mt-0.5 truncate font-semibold">{rank.title}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Four Investigation Departments */}
      <section
        ref={departmentsRef}
        aria-labelledby="departments-heading"
        className="scroll-mt-24"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-amber-400">
              ACADEMY DIVISIONS
            </p>
            <h2 id="departments-heading" className="mt-1 font-display text-2xl font-bold text-white">
              Investigation Departments
            </h2>
          </div>
          <p className="max-w-md text-sm text-slate-400">
            Train in each forensic discipline with field drills and earn points toward specialist badges.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DEPARTMENTS.map((dept) => {
            const colors = getDepartmentColorClasses(dept.id);
            const deptScore = progress.departmentPoints[dept.id] ?? 0;
            const solvedDrills = dept.drills.filter((d) =>
              progress.awardedChallengeIds.includes(d.id)
            ).length;

            return (
              <div
                key={dept.id}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#0b111e] p-5 transition-colors hover:border-slate-700"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`inline-flex rounded-lg border p-2.5 ${colors.border} ${colors.bg}`}>
                      <DepartmentIcon id={dept.id} className={`h-5 w-5 ${colors.text}`} />
                    </div>
                    <span className="font-mono-tabular text-xs font-semibold text-slate-300">
                      {deptScore} pts
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-white">{dept.name}</h3>
                  <p className={`mt-1 text-xs font-medium ${colors.text}`}>{dept.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">{dept.description}</p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-4">
                  <span className="font-mono-tabular text-xs text-slate-400">
                    Drills: {solvedDrills}/{dept.drills.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenDepartment(dept.id)}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-700 bg-[#11192c] px-3.5 py-2 text-xs font-semibold text-slate-100 transition-colors hover:border-amber-400/70 hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 whitespace-nowrap shrink-0"
                  >
                    <span>Open Division</span>
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Mystery Case Dossiers */}
      <section ref={casesRef} aria-labelledby="cases-heading" className="scroll-mt-24">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-amber-400">
              ACTIVE DOSSIERS
            </p>
            <h2 id="cases-heading" className="mt-1 font-display text-2xl font-bold text-white">
              Mystery Investigations
            </h2>
          </div>
          <p className="max-w-md text-sm text-slate-400">
            Begin with Case 01 to clear field probation, then unlock specialized cases and the Final Boss Conspiracy.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MYSTERY_CASES.map((mystery) => {
            const unlocked = isCaseUnlocked(mystery, progress);
            const solved = progress.solvedCaseIds.includes(mystery.id);
            const deptColors = getDepartmentColorClasses(mystery.primaryDepartment);

            return (
              <article
                key={mystery.id}
                className={`flex flex-col overflow-hidden rounded-xl border transition-colors ${
                  mystery.isFinalBoss
                    ? 'border-amber-500/45 bg-[#0f1422] md:col-span-2 lg:col-span-3 lg:flex-row'
                    : 'border-slate-800 bg-[#0b111e]'
                } ${unlocked ? 'hover:border-slate-600' : 'opacity-80'}`}
              >
                {/* Case Artwork */}
                <div
                  className={`relative overflow-hidden bg-[#060910] ${
                    mystery.isFinalBoss ? 'aspect-[16/9] lg:w-2/5 lg:aspect-auto' : 'aspect-[4/3]'
                  }`}
                >
                  <img
                    src={mystery.coverImage}
                    alt={`${mystery.title} case illustration`}
                    referrerPolicy="no-referrer"
                    className={`h-full w-full object-cover ${unlocked ? '' : 'grayscale opacity-45'}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b111e] via-transparent to-black/30" />

                  {!unlocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-4 text-center">
                      <Lock className="h-7 w-7 text-amber-400" aria-hidden="true" />
                      <span className="mt-2 text-xs font-semibold text-amber-200">
                        {mystery.unlockRequirement.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Case Details */}
                <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-mono-tabular font-semibold tracking-wider text-amber-400">
                        {mystery.caseNumber}
                        {mystery.isIntroductory ? ' · INTRODUCTORY' : ''}
                        {mystery.isFinalBoss ? ' · GRAND FINALE' : ''}
                      </span>

                      {solved ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          SOLVED
                        </span>
                      ) : unlocked ? (
                        <span className={`font-medium ${deptColors.text}`}>
                          {getDepartmentLabel(mystery.primaryDepartment)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                          LOCKED
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 font-display text-xl font-bold text-white">{mystery.title}</h3>
                    <p className="mt-1 text-xs font-medium text-slate-400">{mystery.subtitle}</p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-300">{mystery.missionStory}</p>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-4">
                    <div className="text-xs text-slate-400 tabular-nums">
                      {mystery.clues.length} Clues · 5:00 Timer
                      {progress.bestCaseTimesSeconds[mystery.id] !== undefined
                        ? ` · Best: ${Math.floor(progress.bestCaseTimesSeconds[mystery.id] / 60)}m ${
                            progress.bestCaseTimesSeconds[mystery.id] % 60
                          }s`
                        : ''}
                    </div>

                    <button
                      type="button"
                      disabled={!unlocked}
                      onClick={() => onSelectCase(mystery)}
                      className={`inline-flex min-h-[42px] items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 whitespace-nowrap shrink-0 ${
                        unlocked
                          ? mystery.isFinalBoss
                            ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                            : 'bg-amber-500/90 text-slate-950 hover:bg-amber-400'
                          : 'cursor-not-allowed border border-slate-800 bg-slate-900 text-slate-500'
                      }`}
                    >
                      {unlocked ? (
                        <>
                          <span>{solved ? 'Replay Briefing' : 'Open Briefing'}</span>
                          <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </>
                      ) : (
                        <span>Locked</span>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Detective Badges */}
      <section aria-labelledby="badges-heading" className="rounded-xl border border-slate-800 bg-[#0b111e] p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-amber-400">HONORS & COMMENDATIONS</p>
            <h2 id="badges-heading" className="mt-1 font-display text-2xl font-bold text-white">
              Detective Badges
            </h2>
          </div>

          {/* Inline Reset Progress Control */}
          <div>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-700 bg-[#101829] px-3.5 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-red-500/50 hover:text-red-300 whitespace-nowrap shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset Academy Progress</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs text-red-300">
                  <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                  Clear all scores?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onResetProgress();
                    setConfirmReset(false);
                  }}
                  className="min-h-[38px] rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500 whitespace-nowrap shrink-0"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="min-h-[38px] rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white whitespace-nowrap shrink-0"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {DETECTIVE_BADGES.map((badge) => {
            const isEarned = earnedBadges.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`rounded-xl border p-4 transition-colors ${
                  isEarned
                    ? 'border-amber-500/50 bg-gradient-to-b from-amber-500/15 to-[#0d1424]'
                    : 'border-slate-800 bg-[#080c15] opacity-65'
                }`}
              >
                <div className="flex items-center justify-between">
                  {badge.id === 'ultimate_detective' ? (
                    <Crown
                      className={`h-6 w-6 ${isEarned ? 'text-amber-400' : 'text-slate-600'}`}
                      aria-hidden="true"
                    />
                  ) : (
                    <Award
                      className={`h-6 w-6 ${isEarned ? 'text-amber-400' : 'text-slate-600'}`}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`text-[11px] font-bold tracking-wider ${
                      isEarned ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {isEarned ? 'EARNED' : 'LOCKED'}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-bold text-white">{badge.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{badge.description}</p>
                <p className="mt-3 border-t border-slate-800/80 pt-2 text-[11px] text-slate-400">
                  {badge.requirementText}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
