
export type Difficulty = 1 | 2 | 3;

export type StudyGroupType = 'Alpha Integrals' | 'Vector Vanguards' | 'Newton\'s Nomads' | 'None';

export interface StudyGroup {
  id: string;
  name: StudyGroupType;
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
  statKey?: string; // 用于匹配 problemStats 中的键
}

export interface Profile {
  name: string;
  description: string;
  group: StudyGroupType;
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
  groupName: StudyGroupType;
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
  { id: 'genesis', name: 'Math Genesis', description: 'Solve your first problem successfully.', icon: '🌱', criteria: '1 correct answer', practicalImpact: 'You have begun your journey towards mathematical mastery.' },
  { id: 'vector_apprentice', name: 'Vector Apprentice', description: 'Master the basics of spatial vectors.', icon: '📐', criteria: 'Solve 50 Basic Vector problems', practicalImpact: 'Your understanding of spatial coordinates is now architect-grade.', goalValue: 50, statKey: 'Vector_1' },
  { id: 'polymath', name: 'Syllabus Polymath', description: 'Solve a problem from every major SM025 topic.', icon: '⚛️', criteria: 'Solve Integration, Vector, and Numerical problems', practicalImpact: 'Your knowledge covers the full spectrum of the advanced syllabus.' },
  { id: 'legend', name: 'KMM Legend', description: 'Reach 100 correct solutions.', icon: '🏆', criteria: '100 correct answers', practicalImpact: 'Your expertise is officially recognized across the campus.' },
  { id: 'precision', name: 'Precision Architect', description: 'Maintain over 90% accuracy.', icon: '🎯', criteria: '90% mastery (min 20 attempts)', practicalImpact: 'You demonstrate an elite level of accuracy and focus.' },
  { id: 'devotion', name: 'Daily Devotion', description: 'Hit your daily goal 5 times.', icon: '🔥', criteria: '5 daily goals completed', practicalImpact: 'Consistency is the foundation of true academic success.' },
  { id: 'advanced', name: 'Master Solver', description: 'Solve an Advanced (3-star) problem.', icon: '💠', criteria: 'Solve a difficulty 3 problem', practicalImpact: 'You can handle the most complex spatial and numerical challenges.' }
];

export const AVATARS = ['👨‍🏫', '👩‍🔬', '🧙‍♂️', '🤖', '🦊', '🚀', '🧠', '🎓'];
export const TOPICS = ["Numerical Solution", "Integration", "Vector"];
