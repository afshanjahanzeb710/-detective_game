import { ArrowLeft, ArrowRight, Clock, HelpCircle, Lightbulb, ShieldCheck, Users } from 'lucide-react';
import { MysteryCase } from '../types/game';
import { getDepartmentLabel } from '../utils/progression';

interface MissionBriefingProps {
  mystery: MysteryCase;
  onStartMission: () => void;
  onCancel: () => void;
}

export function MissionBriefing({ mystery, onStartMission, onCancel }: MissionBriefingProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <button
        type="button"
        onClick={onCancel}
        className="mb-6 inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-slate-700 bg-[#0d1424] px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-amber-400/70 hover:text-amber-300"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Back to Case Dossiers</span>
      </button>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b111e]">
        {/* Split Header */}
        <div className="grid items-stretch lg:grid-cols-5">
          <div className="relative min-h-[240px] bg-[#060910] lg:col-span-2">
            <img
              src={mystery.coverImage}
              alt={`${mystery.title} briefing scene`}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b111e] via-transparent to-black/30 lg:bg-gradient-to-r lg:from-transparent lg:to-[#0b111e]" />
          </div>

          <div className="p-6 sm:p-8 lg:col-span-3">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold tracking-wider text-amber-400">
              <span>{mystery.caseNumber}</span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span>{getDepartmentLabel(mystery.primaryDepartment)}</span>
              {mystery.isIntroductory && (
                <>
                  <span aria-hidden="true" className="text-slate-600">
                    ·
                  </span>
                  <span className="text-emerald-400">INTRODUCTORY MISSION</span>
                </>
              )}
            </div>

            <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              {mystery.title}
            </h1>
            <p className="mt-1 text-sm text-slate-400">{mystery.subtitle}</p>

            <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-200">
              <div>
                <h2 className="text-xs font-bold tracking-wider text-amber-400">MISSION STORY</h2>
                <p className="mt-1.5">{mystery.missionStory}</p>
              </div>

              <div>
                <h2 className="text-xs font-bold tracking-wider text-amber-400">YOUR OBJECTIVE</h2>
                <p className="mt-1.5">{mystery.crimeProblem}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Rules Strip */}
        <div className="grid grid-cols-2 gap-4 border-y border-slate-800 bg-[#080c15] p-5 sm:grid-cols-4 sm:px-8">
          <div className="flex items-start gap-2.5">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
            <div>
              <div className="text-xs font-semibold text-white">5:00 Timer</div>
              <div className="text-xs text-slate-400">Solve before clock expires</div>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
            <div>
              <div className="text-xs font-semibold text-white">+1 Point / Clue</div>
              <div className="text-xs text-slate-400">Max 3 attempts per clue</div>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
            <div>
              <div className="text-xs font-semibold text-white">2 Hints Max</div>
              <div className="text-xs text-slate-400">Each hint costs 1 point</div>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" aria-hidden="true" />
            <div>
              <div className="text-xs font-semibold text-white">Examine First</div>
              <div className="text-xs text-slate-400">Log clues to your Notebook</div>
            </div>
          </div>
        </div>

        {/* Suspects Preview */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-400">
            <Users className="h-4 w-4" aria-hidden="true" />
            <span>SUSPECTS & LEADS IN THIS DOSSIER</span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {mystery.suspects.map((suspect) => (
              <div
                key={suspect.id}
                className="rounded-lg border border-slate-800 bg-[#080c15] p-4"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-bold text-white">{suspect.name}</h3>
                  <span className="text-xs text-amber-400">{suspect.role}</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{suspect.alibi}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-end gap-4 border-t border-slate-800 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="min-h-[46px] rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-slate-500 hover:text-white"
            >
              Return to HQ
            </button>
            <button
              type="button"
              onClick={onStartMission}
              className="animate-golden-glow inline-flex min-h-[46px] items-center gap-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 px-7 py-3 text-sm font-bold tracking-wide text-slate-950 transition-transform hover:scale-[1.02]"
            >
              <span>Begin Investigation</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
