"use client";

import { useState, useEffect, useCallback } from "react";
import { addDays, startOfDay, isWithinInterval } from "date-fns";
import { getAllChatSessions } from "@/lib/api/chat";
import type {
  Activity,
  ChatMessage,
  ChatSession,
  ChatInsights,
  DailyStats,
} from "@/lib/types";

const DEFAULT_STATS: DailyStats = {
  moodScore: null,
  completionRate: 100,
  mindfulnessCount: 0,
  totalActivities: 0,
  lastUpdated: new Date(),
};

const DEFAULT_CHAT_INSIGHTS: ChatInsights = {
  totalSessions: 0,
  totalMessages: 0,
  lastActivityAt: null,
  avgMessagesPerSession: 0,
};

function calculateDailyStats(activities: Activity[]): DailyStats {
  const today = startOfDay(new Date());
  const todaysActivities = activities.filter((activity) =>
    isWithinInterval(new Date(activity.timestamp), {
      start: today,
      end: addDays(today, 1),
    })
  );

  const moodEntries = todaysActivities.filter(
    (a) => a.type === "mood" && a.moodScore !== null
  );
  const averageMood =
    moodEntries.length > 0
      ? Math.round(
          moodEntries.reduce((acc, curr) => acc + (curr.moodScore || 0), 0) /
            moodEntries.length
        )
      : null;

  const therapySessions = activities.filter((a) => a.type === "therapy").length;

  return {
    moodScore: averageMood,
    completionRate: 100,
    mindfulnessCount: therapySessions,
    totalActivities: todaysActivities.length,
    lastUpdated: new Date(),
  };
}

export function useDashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats>(DEFAULT_STATS);
  const [chatInsights, setChatInsights] =
    useState<ChatInsights>(DEFAULT_CHAT_INSIGHTS);
  const [refreshingStats, setRefreshingStats] = useState(false);

  // ── Activities ────────────────────────────────────────────────────────────
  const loadActivities = useCallback(async () => {
    try {
      const res = await fetch("/api/activities", { credentials: "include" });
      if (!res.ok) {
        setActivities([]);
        return;
      }
      const data = await res.json();
      const list: Activity[] = Array.isArray(data) ? data : [];
      setActivities(list);
    } catch {
      setActivities([]);
    }
  }, []);

  // Recompute daily stats whenever activities change
  useEffect(() => {
    if (activities.length > 0) {
      setDailyStats(calculateDailyStats(activities));
    }
  }, [activities]);

  // ── Chat Insights (lightweight polling) ─────────────────────────────────
  const loadChatInsights = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/insights", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setChatInsights({
        totalSessions: Number(data.totalSessions) || 0,
        totalMessages: Number(data.totalMessages) || 0,
        lastActivityAt: data.lastActivityAt || null,
        avgMessagesPerSession: Number(data.avgMessagesPerSession) || 0,
      });
    } catch {
      // leave previous value intact
    }
  }, []);

  // ── Full stats refresh (on demand + periodic) ─────────────────────────
  const fetchDailyStats = useCallback(async () => {
    setRefreshingStats(true);
    try {
      const [sessions, moodRes, activitiesRes] = await Promise.allSettled([
        getAllChatSessions(),
        fetch("/api/mood", { credentials: "include" }),
        fetch("/api/activities", { credentials: "include" }),
      ]);

      // Mood score
      let moodScore: number | null = null;
      if (moodRes.status === "fulfilled" && moodRes.value.ok) {
        const moods = await moodRes.value.json();
        if (Array.isArray(moods) && moods.length > 0) {
          moodScore = Math.round(
            moods.reduce(
              (acc: number, mood: { score: number }) => acc + mood.score,
              0
            ) / moods.length
          );
        }
      }

      // Today's activity count
      let todaysActivitiesCount = 0;
      if (
        activitiesRes.status === "fulfilled" &&
        activitiesRes.value.ok
      ) {
        const allActivities = await activitiesRes.value.json();
        const today = new Date().toDateString();
        if (Array.isArray(allActivities)) {
          todaysActivitiesCount = allActivities.filter(
            (a: { timestamp: string }) =>
              new Date(a.timestamp).toDateString() === today
          ).length;
        }
      }

      const sessionCount =
        sessions.status === "fulfilled" ? sessions.value.length : 0;

      setDailyStats({
        moodScore,
        completionRate: 100,
        mindfulnessCount: sessionCount,
        totalActivities: todaysActivitiesCount,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Error fetching daily stats:", error);
    } finally {
      setRefreshingStats(false);
    }
  }, []);

  // ── Chat sessions + messages ──────────────────────────────────────────
  const fetchChatData = useCallback(async () => {
    try {
      const sessions = await getAllChatSessions();
      setChatSessions(sessions);

      const allMessages: ChatMessage[] = [];
      await Promise.allSettled(
        sessions.map(async (session) => {
          const res = await fetch(
            `/api/chat/sessions/${session.id}/messages`,
            { credentials: "include" }
          );
          if (res.ok) {
            const msgs = await res.json();
            if (Array.isArray(msgs)) allMessages.push(...msgs);
          }
        })
      );
      setChatMessages(allMessages);
    } catch (error) {
      console.error("Error fetching chat data:", error);
    }
  }, []);

  // ── Bootstrap on mount ────────────────────────────────────────────────
  useEffect(() => {
    loadActivities();
    loadChatInsights();
    fetchDailyStats();
    fetchChatData();

    const chatInsightsInterval = setInterval(
      loadChatInsights,
      3 * 60 * 1000
    );
    const statsInterval = setInterval(fetchDailyStats, 5 * 60 * 1000);

    return () => {
      clearInterval(chatInsightsInterval);
      clearInterval(statsInterval);
    };
  }, [loadActivities, loadChatInsights, fetchDailyStats, fetchChatData]);

  return {
    activities,
    chatMessages,
    chatSessions,
    dailyStats,
    chatInsights,
    refreshingStats,
    loadActivities,
    fetchDailyStats,
  };
}
