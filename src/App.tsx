import { useEffect, useState } from 'react';
import { AcademyHub } from './components/AcademyHub';
import { CoverScreen } from './components/CoverScreen';
import { DepartmentView } from './components/DepartmentView';
import { InvestigationView } from './components/InvestigationView';
import { MissionBriefing } from './components/MissionBriefing';
import { NotebookView } from './components/NotebookView';
import { NavSection, TopBar } from './components/TopBar';
import { MYSTERY_CASES } from './data/academyData';
import { AcademyProgress, ClueChallenge, DepartmentId, MysteryCase, NotebookEntry } from './types/game';
import { audioEngine } from './utils/audio';
import {
  clearAcademyProgress,
  loadAcademyProgress,
  saveAcademyProgress,
} from './utils/progression';

type ScreenMode =
  | { type: 'cover' }
  | { type: 'hub'; focus: 'departments' | 'cases' }
  | { type: 'department'; departmentId: DepartmentId }
  | { type: 'notebook' }
  | { type: 'briefing'; mystery: MysteryCase }
  | { type: 'investigating'; mystery: MysteryCase };

export default function App() {
  const [progress, setProgress] = useState<AcademyProgress>(() => loadAcademyProgress());
  const [screen, setScreen] = useState<ScreenMode>({ type: 'cover' });

  useEffect(() => {
    saveAcademyProgress(progress);
  }, [progress]);

  useEffect(() => {
    audioEngine.setMuted(!progress.soundEnabled);
    return () => {
      audioEngine.stopSoundtrack();
    };
  }, [progress.soundEnabled]);

  const handleToggleSound = () => {
    setProgress((prev) => {
      const nextEnabled = !prev.soundEnabled;
      audioEngine.setMuted(!nextEnabled);
      if (nextEnabled) {
        audioEngine.startSoundtrack();
        audioEngine.playClick();
      } else {
        audioEngine.stopSoundtrack();
      }
      return { ...prev, soundEnabled: nextEnabled };
    });
  };

  const ensureAudioOnInteraction = () => {
    if (progress.soundEnabled) {
      audioEngine.setMuted(false);
      audioEngine.startSoundtrack();
    }
  };

  const handleStartInvestigation = () => {
    ensureAudioOnInteraction();
    audioEngine.playClick();
    const introCase = MYSTERY_CASES[0];
    if (!progress.solvedCaseIds.includes(introCase.id)) {
      setScreen({ type: 'briefing', mystery: introCase });
    } else {
      setScreen({ type: 'hub', focus: 'cases' });
    }
  };

  const handleOpenHub = () => {
    ensureAudioOnInteraction();
    audioEngine.playClick();
    setScreen({ type: 'hub', focus: 'cases' });
  };

  const handleNavigate = (section: NavSection) => {
    ensureAudioOnInteraction();
    audioEngine.playClick();
    if (section === 'cover') {
      setScreen({ type: 'cover' });
    } else if (section === 'departments') {
      setScreen({ type: 'hub', focus: 'departments' });
    } else if (section === 'cases') {
      setScreen({ type: 'hub', focus: 'cases' });
    } else if (section === 'notebook') {
      setScreen({ type: 'notebook' });
    }
  };

  const handleRecordClueExamined = (entry: NotebookEntry) => {
    setProgress((prev) => {
      if (prev.notebookEntries.some((e) => e.id === entry.id)) {
        return prev;
      }
      return {
        ...prev,
        notebookEntries: [entry, ...prev.notebookEntries],
      };
    });
  };

  const handleRecordClueCorrect = (clue: ClueChallenge, caseTitle: string): boolean => {
    const alreadyAwarded = progress.awardedChallengeIds.includes(clue.id);
    setProgress((prev) => {
      const hasEntry = prev.notebookEntries.some((e) => e.id === `${caseTitle}-${clue.id}`);
      const nextEntries = hasEntry
        ? prev.notebookEntries
        : prev.notebookEntries.some((e) => e.clueTitle === clue.clueTitle && e.caseTitle === caseTitle)
          ? prev.notebookEntries
          : [
              {
                id: `${caseTitle}-${clue.id}`,
                caseId: caseTitle,
                caseTitle,
                department: clue.department,
                clueTitle: clue.clueTitle,
                summary: clue.notebookSummary,
                discoveredAt: new Date().toISOString(),
              },
              ...prev.notebookEntries,
            ];

      if (prev.awardedChallengeIds.includes(clue.id)) {
        return { ...prev, notebookEntries: nextEntries };
      }

      return {
        ...prev,
        totalScore: prev.totalScore + 1,
        awardedChallengeIds: [...prev.awardedChallengeIds, clue.id],
        departmentPoints: {
          ...prev.departmentPoints,
          [clue.department]: (prev.departmentPoints[clue.department] ?? 0) + 1,
        },
        notebookEntries: nextEntries,
      };
    });
    return !alreadyAwarded;
  };

  const handleUseHintCost = () => {
    setProgress((prev) => ({
      ...prev,
      totalScore: Math.max(0, prev.totalScore - 1),
    }));
  };

  const handleCaseSolved = (mysteryId: string, elapsedSeconds: number, finalQuestionId: string) => {
    setProgress((prev) => {
      const solvedAlready = prev.solvedCaseIds.includes(mysteryId);
      const finalAwarded = prev.awardedChallengeIds.includes(finalQuestionId);
      const prevBest = prev.bestCaseTimesSeconds[mysteryId];
      const nextBest =
        prevBest === undefined ? elapsedSeconds : Math.min(prevBest, elapsedSeconds);

      return {
        ...prev,
        totalScore: finalAwarded ? prev.totalScore : prev.totalScore + 1,
        solvedCaseIds: solvedAlready ? prev.solvedCaseIds : [...prev.solvedCaseIds, mysteryId],
        awardedChallengeIds: finalAwarded
          ? prev.awardedChallengeIds
          : [...prev.awardedChallengeIds, finalQuestionId],
        bestCaseTimesSeconds: {
          ...prev.bestCaseTimesSeconds,
          [mysteryId]: nextBest,
        },
      };
    });
  };

  const handleResetProgress = () => {
    audioEngine.playClick();
    const fresh = clearAcademyProgress();
    setProgress({ ...fresh, soundEnabled: progress.soundEnabled });
  };

  if (screen.type === 'cover') {
    return (
      <CoverScreen
        progress={progress}
        soundEnabled={progress.soundEnabled}
        onToggleSound={handleToggleSound}
        onStartInvestigation={handleStartInvestigation}
        onOpenHub={handleOpenHub}
      />
    );
  }

  const activeNav: NavSection =
    screen.type === 'notebook'
      ? 'notebook'
      : screen.type === 'department' || (screen.type === 'hub' && screen.focus === 'departments')
        ? 'departments'
        : 'cases';

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-100">
      <TopBar
        activeSection={activeNav}
        onNavigate={handleNavigate}
        soundEnabled={progress.soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {screen.type === 'hub' && (
        <AcademyHub
          progress={progress}
          focusSection={screen.focus}
          onOpenDepartment={(deptId) => {
            audioEngine.playClick();
            setScreen({ type: 'department', departmentId: deptId });
          }}
          onSelectCase={(mystery) => {
            audioEngine.playClick();
            setScreen({ type: 'briefing', mystery });
          }}
          onResetProgress={handleResetProgress}
        />
      )}

      {screen.type === 'department' && (
        <DepartmentView
          departmentId={screen.departmentId}
          progress={progress}
          onBack={() => {
            audioEngine.playClick();
            setScreen({ type: 'hub', focus: 'departments' });
          }}
          onOpenCase={(mystery) => {
            audioEngine.playClick();
            setScreen({ type: 'briefing', mystery });
          }}
          onSolveDrill={(drill) => handleRecordClueCorrect(drill, 'Department Field Drill')}
          onUseHintCost={handleUseHintCost}
        />
      )}

      {screen.type === 'notebook' && (
        <NotebookView
          entries={progress.notebookEntries}
          onBack={() => {
            audioEngine.playClick();
            setScreen({ type: 'hub', focus: 'cases' });
          }}
        />
      )}

      {screen.type === 'briefing' && (
        <MissionBriefing
          mystery={screen.mystery}
          onStartMission={() => {
            ensureAudioOnInteraction();
            audioEngine.playClick();
            setScreen({ type: 'investigating', mystery: screen.mystery });
          }}
          onCancel={() => {
            audioEngine.playClick();
            setScreen({ type: 'hub', focus: 'cases' });
          }}
        />
      )}

      {screen.type === 'investigating' && (
        <InvestigationView
          mystery={screen.mystery}
          progress={progress}
          onRecordClueCorrect={handleRecordClueCorrect}
          onRecordClueExamined={handleRecordClueExamined}
          onUseHintCost={handleUseHintCost}
          onCaseSolved={handleCaseSolved}
          onExitToHQ={() => {
            audioEngine.playClick();
            setScreen({ type: 'hub', focus: 'cases' });
          }}
        />
      )}
    </div>
  );
}
