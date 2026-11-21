import { DETECTIVE_BADGES, DETECTIVE_RANKS } from '../data/academyData';
import { AcademyProgress, BadgeInfo, DepartmentId, MysteryCase, RankInfo } from '../types/game';

const STORAGE_KEY = 'detective_academy_progress_v1';

export const DEFAULT_PROGRESS: AcademyProgress = {
  totalScore: 0,
  solvedCaseIds: [],
  awardedChallengeIds: [],
  departmentPoints: {
    maths: 0,
    science: 0,
    english: 0,
    logic: 0,
  },
  notebookEntries: [],
  soundEnabled: true,
  bestCaseTimesSeconds: {},
};

export function loadAcademyProgress(): AcademyProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<AcademyProgress>;
    return {
      totalScore: typeof parsed.totalScore === 'number' ? Math.max(0, parsed.totalScore) : 0,
      solvedCaseIds: Array.isArray(parsed.solvedCaseIds) ? parsed.solvedCaseIds : [],
      awardedChallengeIds: Array.isArray(parsed.awardedChallengeIds) ? parsed.awardedChallengeIds : [],
      departmentPoints: {
        maths: parsed.departmentPoints?.maths ?? 0,
        science: parsed.departmentPoints?.science ?? 0,
        english: parsed.departmentPoints?.english ?? 0,
        logic: parsed.departmentPoints?.logic ?? 0,
      },
      notebookEntries: Array.isArray(parsed.notebookEntries) ? parsed.notebookEntries : [],
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
      bestCaseTimesSeconds: parsed.bestCaseTimesSeconds ?? {},
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveAcademyProgress(progress: AcademyProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function clearAcademyProgress(): AcademyProgress {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  return DEFAULT_PROGRESS;
}

export function getRankStatus(progress: AcademyProgress): {
  currentRank: RankInfo;
  nextRank: RankInfo | null;
  progressPercent: number;
  pointsNeeded: number;
  casesNeeded: number;
} {
  let currentRank = DETECTIVE_RANKS[0];
  for (const rank of DETECTIVE_RANKS) {
    if (progress.totalScore >= rank.minPoints && progress.solvedCaseIds.length >= rank.minCases) {
      currentRank = rank;
    }
  }

  const nextIndex = DETECTIVE_RANKS.findIndex((r) => r.level === currentRank.level) + 1;
  const nextRank = nextIndex < DETECTIVE_RANKS.length ? DETECTIVE_RANKS[nextIndex] : null;

  if (!nextRank) {
    return {
      currentRank,
      nextRank: null,
      progressPercent: 100,
      pointsNeeded: 0,
      casesNeeded: 0,
    };
  }

  const pointSpan = Math.max(1, nextRank.minPoints - currentRank.minPoints);
  const pointRatio = Math.min(1, Math.max(0, (progress.totalScore - currentRank.minPoints) / pointSpan));

  const caseSpan = Math.max(1, nextRank.minCases - currentRank.minCases);
  const caseRatio = Math.min(1, Math.max(0, (progress.solvedCaseIds.length - currentRank.minCases) / caseSpan));

  const combined = Math.round(((pointRatio + caseRatio) / 2) * 100);

  return {
    currentRank,
    nextRank,
    progressPercent: Math.min(99, Math.max(4, combined)),
    pointsNeeded: Math.max(0, nextRank.minPoints - progress.totalScore),
    casesNeeded: Math.max(0, nextRank.minCases - progress.solvedCaseIds.length),
  };
}

export function getEarnedBadgeIds(progress: AcademyProgress): Set<BadgeInfo['id']> {
  const earned = new Set<BadgeInfo['id']>();

  if (progress.solvedCaseIds.includes('case-02-diamond') || progress.departmentPoints.maths >= 5) {
    earned.add('math_master');
  }
  if (progress.solvedCaseIds.includes('case-03-lab') || progress.departmentPoints.science >= 5) {
    earned.add('science_genius');
  }
  if (progress.solvedCaseIds.includes('case-04-map') || progress.departmentPoints.english >= 5) {
    earned.add('word_wizard');
  }
  if (progress.solvedCaseIds.includes('case-05-agent') || progress.departmentPoints.logic >= 5) {
    earned.add('logic_champion');
  }
  if (progress.solvedCaseIds.includes('case-07-boss')) {
    earned.add('ultimate_detective');
  }

  return earned;
}

export function isCaseUnlocked(mystery: MysteryCase, progress: AcademyProgress): boolean {
  return progress.solvedCaseIds.length >= mystery.unlockRequirement.minCasesSolved;
}

export function getDepartmentLabel(dept: DepartmentId | 'all'): string {
  switch (dept) {
    case 'maths':
      return 'Maths Detective';
    case 'science':
      return 'Science Detective';
    case 'english':
      return 'English Detective';
    case 'logic':
      return 'Logic Detective';
    case 'all':
      return 'All Departments';
  }
}

export function getDepartmentColorClasses(dept: DepartmentId | 'all'): {
  text: string;
  border: string;
  bg: string;
} {
  switch (dept) {
    case 'maths':
      return {
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/10',
      };
    case 'science':
      return {
        text: 'text-sky-400',
        border: 'border-sky-500/30',
        bg: 'bg-sky-500/10',
      };
    case 'english':
      return {
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/10',
      };
    case 'logic':
      return {
        text: 'text-indigo-400',
        border: 'border-indigo-500/30',
        bg: 'bg-indigo-500/10',
      };
    case 'all':
      return {
        text: 'text-amber-300',
        border: 'border-amber-400/35',
        bg: 'bg-amber-500/10',
      };
  }
}

export { DETECTIVE_BADGES };
