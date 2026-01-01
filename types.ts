
export type NoteType = 'fragment' | 'todo' | 'brainstorm' | 'review';

export interface Fragment {
  id: string;
  content: string;
  createdAt: number;
  tags: string[];
  type: NoteType;
  status?: 'pending' | 'completed';
  aiInsights?: string;
}

export interface UserPlan {
  dailyGoal: string;
  weeklyObjective: string;
}

export interface ReviewSession {
  id: string;
  date: number;
  fragmentsSummary: string;
  nextSteps: string[];
}

export enum AppView {
  FEED = 'feed',
  PLANNING = 'planning',
  REVIEW = 'review',
  BRAINSTORM = 'brainstorm'
}
