// Shared TypeScript interfaces for Zenly

export interface Activity {
  id: string;
  userId: string | null;
  type: string;
  name: string;
  description: string | null;
  timestamp: Date;
  duration: number | null;
  completed: boolean;
  moodScore: number | null;
  moodNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatAIInsight {
  id: string;
  title: string;
  description: string;
  type: "progress" | "recommendation" | "pattern" | "achievement" | "concern";
  priority: "high" | "medium" | "low";
  actionable: boolean;
  data?: Record<string, unknown>;
}

export interface DailyStats {
  moodScore: number | null;
  completionRate: number;
  mindfulnessCount: number;
  totalActivities: number;
  lastUpdated: Date;
}

export interface ChatInsights {
  totalSessions: number;
  totalMessages: number;
  lastActivityAt: string | null;
  avgMessagesPerSession: number;
}
