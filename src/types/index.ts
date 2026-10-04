export type AppId = 'tiktok' | 'instagram' | 'facebook' | 'snapchat' | 'games';

export interface BlockedApp {
  id: AppId;
  name: string;
  iconName: string;
  color: string;
  gradient: string;
  isMonitored: boolean; // Toggle whether this app is under TaleemGuard lock
  description: string;
  category: 'Social' | 'Video' | 'Gaming';
}

export interface ParentProfile {
  id: 'father' | 'mother';
  role: 'Father' | 'Mother';
  name: string;
  titleUrdu: string;
  pin: string;
  fingerprintEnrolled: boolean;
  fingerprintName: string;
  avatarColor: string;
}

export interface QuestionItem {
  id: string;
  type: 'conceptual' | 'definition_or_law' | 'math_problem' | 'short_question';
  question: string;
  questionUrdu?: string;
  expectedKeyPoints: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  hint?: string;
}

export interface MathChallenge {
  isMath: boolean;
  problemTitle: string;
  problemStatement: string;
  problemStatementUrdu?: string;
  requiredFormula?: string;
  expectedSteps: string[];
  finalAnswer: string;
  commonPitfalls?: string;
}

export interface CurriculumExamData {
  chapterSummary: string;
  keyConcepts: string[];
  questions: QuestionItem[];
  mathChallenge?: MathChallenge;
}

export interface QuestionEvaluation {
  isCorrect: boolean;
  score: number;
  verdict: string;
  feedbackUrdu: string;
  feedbackEnglish?: string;
  mistakeDetail?: string;
  correctTextbookAnswer?: string;
  retryRequired: boolean;
}

export interface MathStepReview {
  stepNumber: number;
  stepExpression: string;
  status: 'correct' | 'error' | 'warning';
  remark: string;
}

export interface MathEvaluation {
  isCorrect: boolean;
  score: number;
  transcribedWork?: string;
  stepByStepReview: MathStepReview[];
  exactMistakeHighlight?: string | null;
  teacherExplanationUrdu: string;
  finalVerdict: 'PASSED' | 'RETRY_REQUIRED';
  remediationTip?: string;
}

export interface DailyAyah {
  surah: string;
  arabic: string;
  transliteration: string;
  urdu: string;
  english: string;
  reflection: string;
  lesson: string;
}

export interface PrayerItem {
  name: string;
  urduName: string;
  time: string;
  rakaat: string;
  offered?: boolean;
}

export interface StudyAuditLog {
  id: string;
  timestamp: string;
  gradeClass: string;
  subject: string;
  chapterName: string;
  oralScore: number;
  mathScore: number;
  status: 'Passed & Unlocked' | 'Failed / Incomplete' | 'Parent Override';
  mistakesCount: number;
  unlockedDurationMinutes: number;
}
