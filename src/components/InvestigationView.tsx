import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  KeyRound,
  LayoutGrid,
  Lightbulb,
  RotateCcw,
  Search,
  ShieldAlert,
  Compass,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  AcademyProgress,
  ClueChallenge,
  DepartmentId,
  EvidenceBoardState,
  MysteryCase,
  NotebookEntry,
  SuspectVerdict,
} from '../types/game';
import { audioEngine } from '../utils/audio';
import { getDepartmentColorClasses, getDepartmentLabel, getRankStatus } from '../utils/progression';
import { EvidenceBoard } from './EvidenceBoard';
import { NotebookView } from './NotebookView';

interface InvestigationViewProps {
  mystery: MysteryCase;
  progress: AcademyProgress;
  onRecordClueCorrect: (clue: ClueChallenge, caseTitle: string) => boolean;
  onRecordClueExamined: (entry: NotebookEntry) => void;
  onUseHintCost: () => void;
  onCaseSolved: (mysteryId: string, elapsedSeconds: number, finalQuestionId: string) => void;
  onExitToHQ: () => void;
}

type ActiveTab = 'scene' | 'board' | 'notebook';
type CaseOutcome = 'active' | 'solved' | 'game_over';

const INITIAL_SECONDS = 300; // 5 minutes per mystery
const MAX_HINTS = 2;
const MAX_ATTEMPTS = 3;

export function InvestigationView({
  mystery,
  progress,
  onRecordClueCorrect,
  onRecordClueExamined,
  onUseHintCost,
  onCaseSolved,
  onExitToHQ,
}: InvestigationViewProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('scene');
  const [clueIndex, setClueIndex] = useState(0);
  const [isFinalStage, setIsFinalStage] = useState(false);
  const [clueExamined, setClueExamined] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [hintsLeft, setHintsLeft] = useState(MAX_HINTS);
  const [hintVisible, setHintVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SECONDS);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [outcome, setOutcome] = useState<CaseOutcome>('active');
  const [gameOverReason, setGameOverReason] = useState('');
  const [caseSessionPoints, setCaseSessionPoints] = useState(0);
  const [earnedThisClue, setEarnedThisClue] = useState(false);
  const [boardState, setBoardState] = useState<EvidenceBoardState>({
    suspectVerdicts: {},
    clueLinks: {},
  });

  // Countdown Timer (5 minutes)
  useEffect(() => {
    if (outcome !== 'active') return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          audioEngine.playGameOver();
          setOutcome('game_over');
          setGameOverReason('Time expired! The five-minute investigation window closed before the mystery was solved.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [outcome]);

  const currentClue = !isFinalStage ? mystery.clues[clueIndex] : null;

  // Clues examined so far in this case (for Evidence Board)
  const discoveredClues = mystery.clues.filter((_, idx) => {
    if (isFinalStage) return true;
    if (idx < clueIndex) return true;
    if (idx === clueIndex && clueExamined) return true;
    return false;
  });

  const caseNotebookEntries = progress.notebookEntries.filter(
    (entry) => entry.caseId === mystery.id
  );

  const restartCase = () => {
    audioEngine.playClick();
    setActiveTab('scene');
    setClueIndex(0);
    setIsFinalStage(false);
    setClueExamined(false);
    setAttemptsLeft(MAX_ATTEMPTS);
    setHintsLeft(MAX_HINTS);
    setHintVisible(false);
    setSecondsLeft(INITIAL_SECONDS);
    setSelectedChoice(null);
    setPasswordInput('');
    setFeedback('idle');
    setFeedbackMessage('');
    setOutcome('active');
    setGameOverReason('');
    setCaseSessionPoints(0);
    setEarnedThisClue(false);
    setBoardState({ suspectVerdicts: {}, clueLinks: {} });
  };

  const handleExamineClue = () => {
    if (!currentClue) return;
    audioEngine.playClueDiscovered();
    setClueExamined(true);
    onRecordClueExamined({
      id: `${mystery.id}-${currentClue.id}`,
      caseId: mystery.id,
      caseTitle: mystery.title,
      department: currentClue.department,
      clueTitle: currentClue.clueTitle,
      summary: currentClue.notebookSummary,
      discoveredAt: new Date().toISOString(),
    });
  };

  const handleUseHint = () => {
    if (hintsLeft <= 0 || hintVisible || feedback === 'correct') return;
    audioEngine.playHint();
    setHintsLeft((h) => h - 1);
    setHintVisible(true);
    onUseHintCost();
  };

  const handleAnswerSubmit = (candidate: string) => {
    if (outcome !== 'active' || feedback === 'correct') return;
    const trimmed = candidate.trim();
    if (!trimmed) return;

    setSelectedChoice(trimmed);

    if (!isFinalStage && currentClue) {
      const isRight = trimmed.toUpperCase() === currentClue.correctAnswer.trim().toUpperCase();
      if (isRight) {
        audioEngine.playCorrect();
        setFeedback('correct');
        setFeedbackMessage(currentClue.correctExplanation);
        const pointNewlyBanked = onRecordClueCorrect(currentClue, mystery.title);
        setEarnedThisClue(pointNewlyBanked);
        if (pointNewlyBanked) {
          setCaseSessionPoints((p) => p + 1);
        }
      } else {
        audioEngine.playWrong();
        const remaining = attemptsLeft - 1;
        setAttemptsLeft(remaining);
        if (remaining <= 0) {
          audioEngine.playGameOver();
          setOutcome('game_over');
          setGameOverReason(
            `You used all 3 attempts on "${currentClue.clueTitle}". Review the evidence and restart the investigation.`
          );
        } else {
          setFeedback('wrong');
          setFeedbackMessage(currentClue.wrongExplanation);
        }
      }
      return;
    }

    if (isFinalStage) {
      const isRight =
        trimmed.toUpperCase() === mystery.finalQuestion.correctAnswer.trim().toUpperCase();
      if (isRight) {
        audioEngine.playVictory();
        setFeedback('correct');
        setFeedbackMessage(mystery.finalQuestion.correctExplanation);
        const finalId = `${mystery.id}-final`;
        if (!progress.awardedChallengeIds.includes(finalId)) {
          setCaseSessionPoints((p) => p + 1);
        }
        onCaseSolved(mystery.id, INITIAL_SECONDS - secondsLeft, finalId);
        setOutcome('solved');
      } else {
        audioEngine.playWrong();
        const remaining = attemptsLeft - 1;
        setAttemptsLeft(remaining);
        if (remaining <= 0) {
          audioEngine.playGameOver();
          setOutcome('game_over');
          setGameOverReason(
            'You used all 3 attempts on the Final Deduction! Study the suspect alibis on the Evidence Board and try again.'
          );
        } else {
          setFeedback('wrong');
          setFeedbackMessage(mystery.finalQuestion.wrongExplanation);
        }
      }
    }
  };

  const handleProceed = () => {
    audioEngine.playClick();
    setSelectedChoice(null);
    setPasswordInput('');
    setFeedback('idle');
    setFeedbackMessage('');
    setAttemptsLeft(MAX_ATTEMPTS);
    setHintVisible(false);
    setEarnedThisClue(false);

    if (clueIndex < mystery.clues.length - 1) {
      setClueIndex((i) => i + 1);
      setClueExamined(false);
    } else {
      setIsFinalStage(true);
    }
  };

  const handleUpdateVerdict = (suspectId: string, verdict: SuspectVerdict) => {
    setBoardState((prev) => ({
      ...prev,
      suspectVerdicts: { ...prev.suspectVerdicts, [suspectId]: verdict },
    }));
  };

  const handleToggleClueLink = (clueId: string, suspectId: string) => {
    setBoardState((prev) => {
      const existing = prev.clueLinks[clueId] ?? [];
      const updated = existing.includes(suspectId)
        ? existing.filter((id) => id !== suspectId)
        : [...existing, suspectId];
      return {
        ...prev,
        clueLinks: { ...prev.clueLinks, [clueId]: updated },
      };
    });
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const timerColor =
    secondsLeft <= 20
      ? 'text-red-400 border-red-500/40 bg-red-500/10'
      : secondsLeft <= 60
        ? 'text-amber-300 border-amber-500/40 bg-amber-500/10'
        : 'text-slate-100 border-slate-700/80 bg-[#0d1424]';

  const rankStatus = getRankStatus(progress);

  // Victory Overlay State
  if (outcome === 'solved') {
    const elapsed = INITIAL_SECONDS - secondsLeft;
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="animate-victory-pop rounded-2xl border border-emerald-500/50 bg-gradient-to-b from-emerald-950/45 via-[#0b131f] to-[#080c15] p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-500/20">
            <CheckCircle2 className="h-9 w-9 text-emerald-400" aria-hidden="true" />
          </div>

          <p className="mt-4 text-xs font-bold tracking-[0.2em] text-emerald-400">
            CASE CLOSED · VERDICT CONFIRMED
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            MYSTERY SOLVED
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-emerald-100">
            {mystery.finalQuestion.correctExplanation}
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4 rounded-xl border border-emerald-500/25 bg-[#080e18] p-5">
            <div>
              <div className="text-xs text-slate-400">Points This Run</div>
              <div className="mt-1 font-mono-tabular text-xl font-bold text-emerald-400">
                +{caseSessionPoints}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Time Taken</div>
              <div className="mt-1 font-mono-tabular text-xl font-bold text-white">
                {formatTime(elapsed)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Academy Rank</div>
              <div className="mt-1 text-sm font-bold text-amber-300">{rankStatus.currentRank.title}</div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-800 bg-[#080c15] p-4 text-left">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 font-semibold text-amber-300">
                <Award className="h-4 w-4" aria-hidden="true" />
                Rank Progress · Total Score: {progress.totalScore} pts
              </span>
              <span className="font-mono-tabular text-amber-400">{rankStatus.progressPercent}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400"
                style={{ width: `${rankStatus.progressPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onExitToHQ}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
            >
              <span>Return to Academy HQ</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={restartCase}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-lg border border-slate-700 bg-[#0d1424] px-5 py-3 text-sm font-semibold text-slate-200 hover:border-amber-400"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Replay Case</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game Over State
  if (outcome === 'game_over') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-red-500/50 bg-gradient-to-b from-red-950/45 via-[#0f1018] to-[#080a0f] p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-500/50 bg-red-500/20">
            <ShieldAlert className="h-9 w-9 text-red-400" aria-hidden="true" />
          </div>
          <p className="mt-4 text-xs font-bold tracking-[0.2em] text-red-400">
            INVESTIGATION COMPROMISED
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">GAME OVER</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-red-100">
            {gameOverReason}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={restartCase}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-500"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Restart Mystery</span>
            </button>
            <button
              type="button"
              onClick={onExitToHQ}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-lg border border-slate-700 bg-[#0d1424] px-5 py-3 text-sm font-semibold text-slate-200 hover:border-slate-500"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Return to Academy HQ</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeDepartment: DepartmentId | 'all' = currentClue
    ? currentClue.department
    : mystery.primaryDepartment;
  const deptColors = getDepartmentColorClasses(activeDepartment);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
      {/* Investigation Top HUD */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-[#0b111e] p-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExitToHQ}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-700 bg-[#080c15] px-3 py-2 text-xs font-semibold text-slate-200 hover:border-amber-400/70 hover:text-amber-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>HQ</span>
          </button>
          <div>
            <div className="font-mono-tabular text-[11px] font-semibold text-amber-400">
              {mystery.caseNumber}
            </div>
            <h1 className="font-display text-base font-bold text-white sm:text-lg">
              {mystery.title}
            </h1>
          </div>
        </div>

        {/* Live HUD Metrics */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg border px-3.5 py-1.5 font-mono-tabular text-sm font-bold ${timerColor}`}>
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>{formatTime(secondsLeft)}</span>
          </div>

          <div className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-700/80 bg-[#080c15] px-3.5 py-1.5 text-xs font-semibold text-slate-200">
            <Lightbulb className="h-4 w-4 text-amber-400" aria-hidden="true" />
            <span className="font-mono-tabular">Hints: {hintsLeft}/2</span>
          </div>

          <div className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-700/80 bg-[#080c15] px-3.5 py-1.5 font-mono-tabular text-xs font-semibold text-amber-300">
            <span>Score: {progress.totalScore} pts</span>
          </div>

          <button
            type="button"
            onClick={restartCase}
            aria-label="Restart current mystery"
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-700 bg-[#080c15] px-3 py-2 text-xs font-semibold text-slate-300 hover:border-amber-400/70 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* Investigation Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0b111e] p-1">
          <button
            type="button"
            onClick={() => {
              audioEngine.playClick();
              setActiveTab('scene');
            }}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'scene'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Scene &amp; Clues</span>
          </button>
          <button
            type="button"
            onClick={() => {
              audioEngine.playClick();
              setActiveTab('board');
            }}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'board'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Evidence Board</span>
          </button>
          <button
            type="button"
            onClick={() => {
              audioEngine.playClick();
              setActiveTab('notebook');
            }}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'notebook'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="tabular-nums">Case Notebook ({caseNotebookEntries.length})</span>
          </button>
        </div>

        {/* Clue Step Progress Indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {mystery.clues.map((c, idx) => {
            const done = isFinalStage || idx < clueIndex || (idx === clueIndex && feedback === 'correct');
            const current = !isFinalStage && idx === clueIndex;
            return (
              <span
                key={c.id}
                className={`inline-flex h-7 w-7 items-center justify-center rounded-md border font-mono-tabular text-xs font-bold ${
                  done
                    ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300'
                    : current
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                      : 'border-slate-800 bg-[#0b111e] text-slate-500'
                }`}
              >
                {idx + 1}
              </span>
            );
          })}
          <span
            className={`inline-flex h-7 items-center rounded-md border px-2.5 font-mono-tabular text-xs font-bold ${
              isFinalStage
                ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                : 'border-slate-800 bg-[#0b111e] text-slate-500'
            }`}
          >
            FINAL
          </span>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'board' ? (
        <EvidenceBoard
          suspects={mystery.suspects}
          discoveredClues={discoveredClues}
          boardState={boardState}
          onUpdateVerdict={handleUpdateVerdict}
          onToggleClueLink={handleToggleClueLink}
        />
      ) : activeTab === 'notebook' ? (
        <NotebookView entries={caseNotebookEntries} embedded />
      ) : (
        /* Active Scene & Clues Workspace */
        <div className="rounded-xl border border-slate-800 bg-[#0b111e] p-6 sm:p-8">
          {!isFinalStage && currentClue ? (
            <div className="space-y-6">
              {/* Clue Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className={`text-xs font-bold tracking-wider ${deptColors.text}`}>
                    CLUE {clueIndex + 1} OF {mystery.clues.length} · {getDepartmentLabel(currentClue.department)}
                  </div>
                  <h2 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">
                    {currentClue.clueTitle}
                  </h2>
                </div>

                <div className="font-mono-tabular text-xs font-semibold text-slate-300">
                  Attempts Left:{' '}
                  <span className={attemptsLeft <= 1 ? 'text-red-400' : 'text-amber-300'}>
                    {attemptsLeft}/{MAX_ATTEMPTS}
                  </span>
                </div>
              </div>

              {/* Discovery Box */}
              <div className="rounded-xl border border-slate-800 bg-[#080c15] p-5">
                <div className="text-xs font-bold tracking-wider text-amber-400">
                  CRIME SCENE DISCOVERY
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-200 sm:text-base">
                  {currentClue.discoveryText}
                </p>

                {!clueExamined && (
                  <button
                    type="button"
                    onClick={handleExamineClue}
                    className="animate-golden-glow mt-5 inline-flex min-h-[46px] items-center gap-2.5 rounded-lg bg-amber-500 px-6 py-2.5 text-xs font-bold tracking-wider text-slate-950 transition-colors hover:bg-amber-400"
                  >
                    <Search className="h-4 w-4" aria-hidden="true" />
                    <span>EXAMINE CLUE &amp; LOG TO NOTEBOOK</span>
                  </button>
                )}
              </div>

              {/* Investigation Question (appears only after examining clue!) */}
              {clueExamined && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <h3 className="text-base font-semibold leading-relaxed text-white sm:text-lg">
                      {currentClue.prompt}
                    </h3>

                    {feedback !== 'correct' && (
                      <button
                        type="button"
                        disabled={hintsLeft <= 0 || hintVisible}
                        onClick={handleUseHint}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-45 whitespace-nowrap shrink-0"
                      >
                        <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>
                          {hintVisible
                            ? 'Hint Active'
                            : hintsLeft > 0
                              ? `Use Hint (-1 pt · ${hintsLeft} left)`
                              : 'No Hints Left'}
                        </span>
                      </button>
                    )}
                  </div>

                  {hintVisible && (
                    <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-4 text-sm text-amber-100">
                      <span className="font-bold text-amber-300">Academy Hint: </span>
                      {currentClue.hint}
                    </div>
                  )}

                  {currentClue.questionFormat === 'multiple-choice' && currentClue.options ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {currentClue.options.map((option) => {
                        const isSelected = selectedChoice === option;
                        const isGreen = isSelected && feedback === 'correct';
                        const isRed = isSelected && feedback === 'wrong';

                        return (
                          <button
                            key={option}
                            type="button"
                            disabled={feedback === 'correct'}
                            onClick={() => handleAnswerSubmit(option)}
                            className={`flex min-h-[54px] items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-colors ${
                              isGreen
                                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-100'
                                : isRed
                                  ? 'border-red-500 bg-red-500/15 text-red-100'
                                  : 'border-slate-700/80 bg-[#101829] text-slate-100 hover:border-amber-400/70'
                            }`}
                          >
                            <span>{option}</span>
                            {isGreen && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 shrink-0">
                                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                CORRECT
                              </span>
                            )}
                            {isRed && (
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
                    /* Secret Password Entry */
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAnswerSubmit(passwordInput);
                      }}
                      className="rounded-xl border border-slate-800 bg-[#080c15] p-5"
                    >
                      <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-indigo-300">
                        <KeyRound className="h-4 w-4" aria-hidden="true" />
                        <span>SECRET PASSWORD LOCK</span>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                          type="text"
                          value={passwordInput}
                          disabled={feedback === 'correct'}
                          onChange={(e) => setPasswordInput(e.target.value.toUpperCase())}
                          placeholder={currentClue.passwordHintLabel ?? 'ENTER PASSWORD'}
                          className={`min-h-[50px] flex-1 rounded-lg border px-4 py-2.5 font-mono-tabular text-base font-bold tracking-[0.22em] text-white outline-none ${
                            feedback === 'correct'
                              ? 'border-emerald-500 bg-emerald-500/15'
                              : feedback === 'wrong'
                                ? 'border-red-500 bg-red-500/15'
                                : 'border-slate-700 bg-[#0b111e] focus:border-amber-400'
                          }`}
                        />
                        <button
                          type="submit"
                          disabled={feedback === 'correct' || !passwordInput.trim()}
                          className="min-h-[50px] rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50 whitespace-nowrap shrink-0"
                        >
                          Unlock Code
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Feedback Explanation Box */}
                  {feedback === 'wrong' && (
                    <div className="rounded-xl border border-red-500/45 bg-red-500/10 p-4 text-sm text-red-100">
                      <div className="flex items-center gap-2 font-bold text-red-400">
                        <XCircle className="h-4 w-4" aria-hidden="true" />
                        <span>INCORRECT — 0 POINTS ({attemptsLeft} attempts remaining)</span>
                      </div>
                      <p className="mt-1.5 leading-relaxed">{feedbackMessage}</p>
                    </div>
                  )}

                  {feedback === 'correct' && (
                    <div className="rounded-xl border border-emerald-500/45 bg-emerald-500/10 p-5 text-sm text-emerald-100">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="flex items-center gap-2 font-bold text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          <span>
                            CORRECT DEDUCTION ·{' '}
                            {earnedThisClue ? '+1 POINT EARNED' : 'SOLVED (POINT ALREADY BANKED)'}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={handleProceed}
                          className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-emerald-400 whitespace-nowrap shrink-0"
                        >
                          <span>
                            {clueIndex < mystery.clues.length - 1
                              ? 'Investigate Next Clue'
                              : 'Proceed to Final Investigation'}
                          </span>
                          <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="mt-2.5 leading-relaxed">{feedbackMessage}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Final Investigation Stage: Identify Culprit / Final Answer */
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-400">
                    <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>FINAL INVESTIGATION · ACCUSATION</span>
                  </div>
                  <h2 className="mt-1 font-display text-2xl font-bold text-white">
                    Name the Culprit &amp; Solve the Mystery
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('board')}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-700 bg-[#080c15] px-3 py-1.5 text-xs font-semibold text-amber-300 hover:border-amber-400"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Check Evidence Board</span>
                  </button>
                  <span className="font-mono-tabular text-xs font-semibold text-slate-300">
                    Attempts:{' '}
                    <span className={attemptsLeft <= 1 ? 'text-red-400' : 'text-amber-300'}>
                      {attemptsLeft}/{MAX_ATTEMPTS}
                    </span>
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#080c15] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="text-base font-semibold leading-relaxed text-white sm:text-lg">
                    {mystery.finalQuestion.prompt}
                  </p>
                  <button
                    type="button"
                    disabled={hintsLeft <= 0 || hintVisible}
                    onClick={handleUseHint}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-45 whitespace-nowrap shrink-0"
                  >
                    <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{hintVisible ? 'Hint Active' : `Use Hint (-1 pt · ${hintsLeft} left)`}</span>
                  </button>
                </div>

                {hintVisible && (
                  <div className="mt-4 rounded-lg border border-amber-500/35 bg-amber-500/10 p-3.5 text-sm text-amber-100">
                    <span className="font-bold text-amber-300">Academy Hint: </span>
                    {mystery.finalQuestion.hint}
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {mystery.finalQuestion.options.map((option) => {
                  const isSelected = selectedChoice === option;
                  const isRed = isSelected && feedback === 'wrong';

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleAnswerSubmit(option)}
                      className={`flex min-h-[58px] items-center justify-between gap-3 rounded-xl border px-5 py-4 text-left text-sm font-semibold transition-colors ${
                        isRed
                          ? 'border-red-500 bg-red-500/15 text-red-100'
                          : 'border-slate-700/80 bg-[#101829] text-white hover:border-amber-400'
                      }`}
                    >
                      <span>{option}</span>
                      {isRed && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400 shrink-0">
                          <XCircle className="h-4 w-4" aria-hidden="true" />
                          WRONG
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {feedback === 'wrong' && (
                <div className="rounded-xl border border-red-500/45 bg-red-500/10 p-4 text-sm text-red-100">
                  <div className="flex items-center gap-2 font-bold text-red-400">
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                    <span>INCORRECT ACCUSATION — 0 POINTS ({attemptsLeft} attempts left)</span>
                  </div>
                  <p className="mt-1.5 leading-relaxed">{feedbackMessage}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
