export type DepartmentId = 'maths' | 'science' | 'english' | 'logic';

export type QuestionFormat = 'multiple-choice' | 'password';

export interface ClueChallenge {
  id: string;
  department: DepartmentId;
  clueTitle: string;
  discoveryText: string;
  notebookSummary: string;
  questionFormat: QuestionFormat;
  prompt: string;
  options?: string[];
  correctAnswer: string;
  hint: string;
  wrongExplanation: string;
  correctExplanation: string;
  passwordHintLabel?: string;
}

export interface Suspect {
  id: string;
  name: string;
  role: string;
  alibi: string;
  trait: string;
}

export interface MysteryCase {
  id: string;
  caseNumber: string;
  title: string;
  subtitle: string;
  primaryDepartment: DepartmentId | 'all';
  isIntroductory?: boolean;
  isFinalBoss?: boolean;
  unlockRequirement: {
    minCasesSolved: number;
    label: string;
  };
  coverImage: string;
  missionStory: string;
  crimeProblem: string;
  suspects: Suspect[];
  clues: ClueChallenge[];
  finalQuestion: {
    prompt: string;
    options: string[];
    correctAnswer: string;
    hint: string;
    wrongExplanation: string;
    correctExplanation: string;
  };
}

export interface DepartmentInfo {
  id: DepartmentId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  accentHex: string;
  drills: ClueChallenge[];
}

export interface RankInfo {
  level: number;
  title: string;
  minPoints: number;
  minCases: number;
  description: string;
}

export interface BadgeInfo {
  id: 'math_master' | 'science_genius' | 'word_wizard' | 'logic_champion' | 'ultimate_detective';
  title: string;
  description: string;
  requirementText: string;
  department?: DepartmentId;
}

export interface NotebookEntry {
  id: string;
  caseId: string;
  caseTitle: string;
  department: DepartmentId;
  clueTitle: string;
  summary: string;
  discoveredAt: string;
}

export type SuspectVerdict = 'review' | 'cleared' | 'prime';

export interface EvidenceBoardState {
  suspectVerdicts: Record<string, SuspectVerdict>;
  clueLinks: Record<string, string[]>; // clueId -> suspectIds[]
}

export interface AcademyProgress {
  totalScore: number;
  solvedCaseIds: string[];
  awardedChallengeIds: string[];
  departmentPoints: Record<DepartmentId, number>;
  notebookEntries: NotebookEntry[];
  soundEnabled: boolean;
  bestCaseTimesSeconds: Record<string, number>;
}
