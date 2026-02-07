
export type Difficulty = 1 | 2 | 3;

export type StudyGroupType = 'Alpha Integrals' | 'Vector Vanguards' | 'Newton\'s Nomads' | 'Tiada';

export interface StudyGroup {
  id: string;
  name: string;
  icon: string;
  code: string;
  color: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  practicalImpact: string;
  goalValue?: number;
  statKey?: string; // Used to match problemStats keys
}

export interface Profile {
  name: string;
  description: string;
  group: string;
  avatar: string;
  correctAnswers: number;
  totalAttempts: number;
  dailyCorrectCount: number;
  lastResetDate: string;
  joinDate: string; // The date the user first used the app
  totalTimeSpent: number; // In seconds
  dailyGoalReached: boolean;
  dailyGoalTotalCount: number; 
  unlockedBadges: string[]; 
  topicHistory: string[]; 
  problemStats: Record<string, number>; // Records count of correct Topic_Difficulty
  topicAttempts: Record<string, number>; // Records total attempts per Topic
  solveHistory: MathProblem[]; // Records recently solved problems
}

export interface MathProblem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  tips: string;
  workingSteps: string;
  topic: string;
  difficulty: Difficulty;
}

export interface Reward {
  id: string;
  name: string;
  pointsNeeded: number;
  redeemed: boolean;
  createdAt: number;
}

export interface MistakeRecord {
  problem: MathProblem;
  addedAt: number;
}

export interface DiscussionComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: number;
}

export interface DiscussionPost {
  id: string;
  groupName: string;
  authorName: string;
  authorAvatar: string;
  problem: MathProblem;
  timestamp: number;
  comments: DiscussionComment[];
}

export enum GameState {
  HOME = 'HOME',
  PRACTICE = 'PRACTICE',
  REWARDS = 'REWARDS',
  NOTEBOOK = 'NOTEBOOK',
  PROFILE = 'PROFILE',
  RANKINGS = 'RANKINGS',
  GROUP = 'GROUP',
  ACHIEVEMENTS = 'ACHIEVEMENTS'
}

export const STUDY_GROUPS: StudyGroup[] = [
  { id: 'alpha', name: 'Alpha Integrals', icon: '∫', code: 'ALPHA', color: 'blue' },
  { id: 'vector', name: 'Vector Vanguards', icon: '→', code: 'VECTOR', color: 'emerald' },
  { id: 'newton', name: 'Newton\'s Nomads', icon: '🍎', code: 'NEWTON', color: 'purple' }
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'genesis', name: 'Permulaan Matematik', description: 'Selesaikan soalan pertama dengan betul.', icon: '🌱', criteria: '1 jawapan betul', practicalImpact: 'Anda telah memulakan perjalanan ke arah penguasaan matematik.' },
  { id: 'vector_apprentice', name: 'Perantis Vektor', description: 'Kuasai asas vektor ruang.', icon: '📐', criteria: 'Selesaikan 50 soalan Vektor Asas', practicalImpact: 'Pemahaman anda tentang koordinat spatial kini setaraf arkitek.', goalValue: 50, statKey: 'Vector_1' },
  { id: 'polymath', name: 'Polimat Silibus', description: 'Selesaikan soalan daripada setiap topik utama SM025.', icon: '⚛️', criteria: 'Selesaikan soalan Integrasi, Vektor, dan Penyelesaian Numerikal', practicalImpact: 'Pengetahuan anda merangkumi spektrum penuh silibus lanjutan.' },
  { id: 'legend', name: 'Legenda KMM', description: 'Capai 100 jawapan betul.', icon: '🏆', criteria: '100 jawapan betul', practicalImpact: 'Kepakaran anda diiktiraf secara rasmi di seluruh kampus.' },
  { id: 'precision', name: 'Arkitek Ketepatan', description: 'Kekalkan ketepatan melebihi 90%.', icon: '🎯', criteria: '90% penguasaan (min 20 percubaan)', practicalImpact: 'Anda menunjukkan tahap ketepatan dan fokus yang elit.' },
  { id: 'devotion', name: 'Dedikasi Harian', description: 'Capai matlamat harian sebanyak 5 kali.', icon: '🔥', criteria: '5 matlamat harian disiapkan', practicalImpact: 'Konsistensi adalah asas kejayaan akademik yang sebenar.' },
  { id: 'advanced', name: 'Pakar Penyelesai', description: 'Selesaikan soalan Lanjutan (3-bintang).', icon: '💠', criteria: 'Selesaikan soalan tahap 3', practicalImpact: 'Anda mampu menangani cabaran spatial dan numerikal yang paling kompleks.' }
];

export const AVATARS = ['👨‍🏫', '👩‍🔬', '🧙‍♂️', '🤖', '🦊', '🚀', '🧠', '🎓'];
export const TOPICS = ["Numerical Solution", "Integration", "Vector"];
