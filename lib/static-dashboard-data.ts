export interface ActivityRecord {
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

const activitiesStore: ActivityRecord[] = [];

export async function getUserActivities(userId: string): Promise<ActivityRecord[]> {
  void userId;
  return [...activitiesStore];
}

export function saveMoodData(data: { userId?: string; mood: string | number; note?: string }): void {
  const moodScore = typeof data.mood === "number" ? data.mood : 50;
  activitiesStore.push({
    id: `mood-${Date.now()}`,
    userId: data.userId ?? "default-user",
    type: "mood",
    name: "Mood check",
    description: data.note ?? null,
    timestamp: new Date(),
    duration: null,
    completed: true,
    moodScore,
    moodNote: data.note ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export function logActivity(params: {
  userId: string;
  type: string;
  name: string;
  description?: string;
  duration?: number;
}): void {
  activitiesStore.push({
    id: `act-${Date.now()}`,
    userId: params.userId,
    type: params.type,
    name: params.name,
    description: params.description ?? null,
    timestamp: new Date(),
    duration: params.duration ?? null,
    completed: true,
    moodScore: null,
    moodNote: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
