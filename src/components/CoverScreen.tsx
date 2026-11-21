import { ArrowRight, BookOpen, Calculator, FlaskConical, KeyRound, Search, Volume2, VolumeX } from 'lucide-react';
import { AcademyProgress } from '../types/game';
import { getRankStatus } from '../utils/progression';

interface CoverScreenProps {
  progress: AcademyProgress;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onStartInvestigation: () => void;
  onOpenHub: () => void;
}

export function CoverScreen({
  progress,
  soundEnabled,
  onToggleSound,
  onStartInvestigation,
  onOpenHub,
}: CoverScreenProps) {
  const { currentRank } = getRankStatus(progress);
  const hasPlayedBefore = progress.solvedCaseIds.length > 0 || progress.totalScore > 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050608] text-slate-100">
      {/* Full-bleed detective hero illustration */}
      <div className="absolute inset-0">
        <img
          src="/src/assets/images/detective_academy_cover_1795257206421.jpg"
          alt="A classic detective in a trench coat and fedora holding an unfolded map and a brass magnifying glass in foggy midnight streets"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center opacity-75"
        />
        {/* Deep blackish edge vignette & midnight blue atmospheric scrim */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 42% 45%, rgba(10, 18, 36, 0.25) 0%, rgba(5, 6, 8, 0.72) 56%, rgba(3, 4, 6, 0.98) 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050608]/95 via-[#081020]/70 to-transparent" />
        <div className="animate-fog-drift pointer-events-none absolute -inset-12 bg-[radial-gradient(ellipse_at_bottom,rgba(30,58,138,0.18),transparent_65%)]" />
      </div>

      {/* Top minimal cover bar */}
      <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-amber-400" aria-hidden="true" />
          <span className="font-display text-sm font-bold tracking-[0.2em] text-amber-300">
            ACADEMY ARCHIVE
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleSound}
          className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-amber-500/30 bg-[#0b1220]/80 px-4 py-2 text-xs font-semibold text-slate-200 backdrop-blur-sm transition-colors hover:border-amber-400 hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 whitespace-nowrap shrink-0"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="h-4 w-4 text-amber-400" aria-hidden="true" />
              <span>Soundtrack On</span>
            </>
          ) : (
            <>
              <VolumeX className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <span>Soundtrack Off</span>
            </>
          )}
        </button>
      </div>

      {/* Hero Content */}
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-92px)] max-w-7xl flex-col justify-center px-6 pb-16 pt-6">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-amber-400/95">
            FOUR DEPARTMENTS · SEVEN MYSTERY CASES · ONE ARCHITECT
          </p>

          <h1
            className="font-display text-4xl font-bold tracking-[0.06em] text-white sm:text-5xl lg:text-6xl"
            style={{ textWrap: 'balance' }}
          >
            DETECTIVE ACADEMY
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
            Step into the mist, inspect crime-scene evidence, and crack mysteries woven from Maths, Science, English, and Logic. Every clue logged in your notebook brings you closer to the truth.
          </p>

          {/* Four Department Discipline Highlights — clean unboxed typography */}
          <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-slate-700/60 py-4 text-sm text-slate-200 sm:grid-cols-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
              <span>Maths</span>
            </div>
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 shrink-0 text-sky-400" aria-hidden="true" />
              <span>Science</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
              <span>English</span>
            </div>
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 shrink-0 text-indigo-400" aria-hidden="true" />
              <span>Logic</span>
            </div>
          </div>

          {/* Primary Glowing CTA */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onStartInvestigation}
              className="animate-golden-glow inline-flex min-h-[52px] items-center gap-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 px-7 py-3.5 text-sm font-bold tracking-[0.1em] text-slate-950 transition-transform duration-150 hover:scale-[1.02] hover:from-amber-400 hover:to-yellow-300 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300 whitespace-nowrap shrink-0"
            >
              <span>START INVESTIGATION</span>
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onOpenHub}
              className="inline-flex min-h-[52px] items-center gap-2 rounded-lg border border-slate-600/80 bg-[#0b1324]/85 px-5 py-3.5 text-sm font-semibold text-slate-100 backdrop-blur-sm transition-colors hover:border-amber-400/70 hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 whitespace-nowrap shrink-0"
            >
              <span>{hasPlayedBefore ? 'Open Academy Headquarters' : 'Browse Case Dossiers'}</span>
            </button>
          </div>

          {/* Saved detective summary if returning */}
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-300">
            <span>
              Current Rank: <strong className="font-semibold text-amber-300">{currentRank.title}</strong>
            </span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span className="tabular-nums">
              Score: <strong className="font-semibold text-white">{progress.totalScore}</strong> pts
            </span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span className="tabular-nums">
              Cases Solved: <strong className="font-semibold text-emerald-400">{progress.solvedCaseIds.length}</strong> / 7
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
