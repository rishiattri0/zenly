"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Brain,
  Calendar,
  Activity,
  Sun,
  Moon,
  Heart,
  Trophy,
  Sparkles,
  MessageSquare,
  ArrowRight,
  X,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { getUserActivities } from "@/lib/static-dashboard-data";
import MoodTracker from "@/components/mood/mood-tracker";
import MoodForm from "@/components/mood/mood-form";
import ActivityLogger from "@/components/activities/activity-logger";
import ChatAIInsights from "@/components/ai/chat-ai-insights";
import {
  addDays,
  format,
  subDays,
  startOfDay,
  isWithinInterval,
} from "date-fns";
import { useSession } from "@/lib/contexts/session-context";
import { getAllChatSessions } from "@/lib/api/chat";
import FooterSection from "@/components/footer";

// Type definitions
interface Activity {
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

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface ChatSession {
  id: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

interface ChatAIInsight {
  id: string;
  title: string;
  description: string;
  type: "progress" | "recommendation" | "pattern" | "achievement" | "concern";
  priority: "high" | "medium" | "low";
  actionable: boolean;
  data?: Record<string, unknown>;
}

// Add this interface for stats
interface DailyStats {
  moodScore: number | null;
  completionRate: number;
  mindfulnessCount: number;
  totalActivities: number;
  lastUpdated: Date;
}

// Update the calculateDailyStats function to show correct stats
const calculateDailyStats = (activities: Activity[]): DailyStats => {
  const today = startOfDay(new Date());
  const todaysActivities = activities.filter((activity) =>
    isWithinInterval(new Date(activity.timestamp), {
      start: today,
      end: addDays(today, 1),
    })
  );

  // Calculate mood score (average of today's mood entries)
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

  // Count therapy sessions (all sessions ever)
  const therapySessions = activities.filter((a) => a.type === "therapy").length;

  return {
    moodScore: averageMood,
    completionRate: 100, // Always 100% as requested
    mindfulnessCount: therapySessions, // Total number of therapy sessions
    totalActivities: todaysActivities.length,
    lastUpdated: new Date(),
  };
};

// Rename the function
const generateInsights = (activities: Activity[]) => {
  const insights: {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    priority: "low" | "medium" | "high";
  }[] = [];

  // Get activities from last 7 days
  const lastWeek = subDays(new Date(), 7);
  const recentActivities = activities.filter(
    (a) => new Date(a.timestamp) >= lastWeek
  );

  // Analyze mood patterns
  const moodEntries = recentActivities.filter(
    (a) => a.type === "mood" && a.moodScore !== null
  );
  if (moodEntries.length >= 2) {
    const averageMood =
      moodEntries.reduce((acc, curr) => acc + (curr.moodScore || 0), 0) /
      moodEntries.length;
    const latestMood = moodEntries[moodEntries.length - 1].moodScore || 0;

    if (latestMood > averageMood) {
      insights.push({
        title: "Mood Improvement",
        description:
          "Your recent mood scores are above your weekly average. Keep up the good work!",
        icon: Brain,
        priority: "high",
      });
    } else if (latestMood < averageMood - 20) {
      insights.push({
        title: "Mood Change Detected",
        description:
          "I've noticed a dip in your mood. Would you like to try some mood-lifting activities?",
        icon: Heart,
        priority: "high",
      });
    }
  }

  // Analyze activity patterns
  const mindfulnessActivities = recentActivities.filter((a) =>
    ["game", "meditation", "breathing"].includes(a.type)
  );
  if (mindfulnessActivities.length > 0) {
    const dailyAverage = mindfulnessActivities.length / 7;
    if (dailyAverage >= 1) {
      insights.push({
        title: "Consistent Practice",
        description: `You've been regularly engaging in mindfulness activities. This can help reduce stress and improve focus.`,
        icon: Trophy,
        priority: "medium",
      });
    } else {
      insights.push({
        title: "Mindfulness Opportunity",
        description:
          "Try incorporating more mindfulness activities into your daily routine.",
        icon: Sparkles,
        priority: "low",
      });
    }
  }

  // Check activity completion rate
  const completedActivities = recentActivities.filter((a) => a.completed);
  const completionRate =
    recentActivities.length > 0
      ? (completedActivities.length / recentActivities.length) * 100
      : 0;

  if (completionRate >= 80) {
    insights.push({
      title: "High Achievement",
      description: `You've completed ${Math.round(
        completionRate
      )}% of your activities this week. Excellent commitment!`,
      icon: Trophy,
      priority: "high",
    });
  } else if (completionRate < 50) {
    insights.push({
      title: "Activity Reminder",
      description:
        "You might benefit from setting smaller, more achievable daily goals.",
      icon: Calendar,
      priority: "medium",
    });
  }

  // Time pattern analysis
  const morningActivities = recentActivities.filter(
    (a) => new Date(a.timestamp).getHours() < 12
  );
  const eveningActivities = recentActivities.filter(
    (a) => new Date(a.timestamp).getHours() >= 18
  );

  if (morningActivities.length > eveningActivities.length) {
    insights.push({
      title: "Morning Person",
      description:
        "You're most active in the mornings. Consider scheduling important tasks during your peak hours.",
      icon: Sun,
      priority: "medium",
    });
  } else if (eveningActivities.length > morningActivities.length) {
    insights.push({
      title: "Evening Routine",
      description:
        "You tend to be more active in the evenings. Make sure to wind down before bedtime.",
      icon: Moon,
      priority: "medium",
    });
  }

  // Sort insights by priority and return top 3
  return insights
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 3);
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();
  const { user, isAuthenticated, loading: sessionLoading } = useSession();

  useEffect(() => {
    if (!sessionLoading && !isAuthenticated) {
      router.replace("/login?redirect=/dashboard");
    }
  }, [isAuthenticated, sessionLoading, router]);

  // Rename the state variable
  const [insights, setInsights] = useState<
    {
      title: string;
      description: string;
      icon: React.ComponentType<{ className?: string }>;
      priority: "low" | "medium" | "high";
    }[]
  >([]);

  // New states for activities and wearables
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showCheckInChat, setShowCheckInChat] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showActivityLogger, setShowActivityLogger] = useState(false);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    moodScore: null,
    completionRate: 100,
    mindfulnessCount: 0,
    totalActivities: 0,
    lastUpdated: new Date(),
  });

  // Chat insights state
  const [chatInsights, setChatInsights] = useState<{
    totalSessions: number;
    totalMessages: number;
    lastActivityAt: string | null;
    avgMessagesPerSession: number;
  }>({ totalSessions: 0, totalMessages: 0, lastActivityAt: null, avgMessagesPerSession: 0 });

  // Chat messages state for AI insights
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  
  const loadActivities = useCallback(async () => {
    try {
      const res = await fetch("/api/activities", { credentials: "include" });
      if (!res.ok) {
        const fallback = await getUserActivities("default-user");
        setActivities(fallback);
        return;
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setActivities(list);
    } catch (error) {
      console.error("Error loading activities:", error);
      const fallback = await getUserActivities("default-user");
      setActivities(fallback);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load chat insights on mount
  useEffect(() => {
    const loadChatInsights = async () => {
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
      } catch (e) {
        // no-op
      }
    };
    loadChatInsights();
    const interval = setInterval(loadChatInsights, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Add this effect to update stats when activities change
  useEffect(() => {
    if (activities.length > 0) {
      setDailyStats(calculateDailyStats(activities));
    }
  }, [activities]);

  // Update the effect
  useEffect(() => {
    if (activities.length > 0) {
      setInsights(generateInsights(activities));
    }
  }, [activities]);

  // Add function to fetch daily stats
  const fetchDailyStats = useCallback(async () => {
    try {
      const sessions = await getAllChatSessions();
      
      // Get mood data from mood API
      let moodScore = null;
      try {
        const moodResponse = await fetch("/api/mood", { credentials: "include" });
        if (moodResponse.ok) {
          const moods = await moodResponse.json();
          if (Array.isArray(moods) && moods.length > 0) {
            const averageMood = Math.round(
              moods.reduce((acc: number, mood: { score: number }) => acc + mood.score, 0) / moods.length
            );
            moodScore = averageMood;
          }
        }
      } catch {
        // If mood API fails, try activities as fallback
        let activities: Activity[] = [];
        try {
          const activitiesResponse = await fetch("/api/activities/today", { credentials: "include" });
          if (activitiesResponse.ok) {
            activities = await activitiesResponse.json();
          } else {
            activities = []; 
          }
        } catch {
          activities = []; 
        }
        const moodEntries = activities.filter(
          (a: Activity) => a.type === "mood" && a.moodScore !== null
        );
        if (moodEntries.length > 0) {
          moodScore = Math.round(
            moodEntries.reduce(
              (acc: number, curr: Activity) => acc + (curr.moodScore || 0),
              0
            ) / moodEntries.length
          );
        }
      }
      
      // Get today's activities count
      let todaysActivitiesCount = 0;
      try {
        const activitiesResponse = await fetch("/api/activities", { credentials: "include" });
        if (activitiesResponse.ok) {
          const allActivities = await activitiesResponse.json();
          const today = new Date().toDateString();
          todaysActivitiesCount = allActivities.filter((activity: { timestamp: string }) => 
            new Date(activity.timestamp).toDateString() === today
          ).length;
        }
      } catch {
        // Fallback to local activities state
        const today = new Date().toDateString();
        todaysActivitiesCount = activities.filter((activity: { timestamp: Date }) => 
          new Date(activity.timestamp).toDateString() === today
        ).length;
      }
      
      setDailyStats({
        moodScore: moodScore,
        completionRate: 100,
        mindfulnessCount: sessions.length,
        totalActivities: todaysActivitiesCount,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Error fetching daily stats:", error);
    }
  }, [activities]);

  // Fetch stats on mount and every 5 minutes
  useEffect(() => {
    fetchDailyStats();
    const interval = setInterval(fetchDailyStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDailyStats]);

  // Update wellness stats to reflect the changes
  const wellnessStats = [
    {
      title: "Mood Score",
      value: dailyStats.moodScore ? `${dailyStats.moodScore}%` : "No data",
      icon: Brain,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      description: "Today's average mood",
    },
    {
      title: "Completion Rate",
      value: "100%",
      icon: Trophy,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      description: "Perfect completion rate",
    },
    {
      title: "Therapy Sessions",
      value: `${dailyStats.mindfulnessCount} sessions`,
      icon: Heart,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      description: "Total sessions completed",
    },
    {
      title: "Today's Activities",
      value: dailyStats.totalActivities.toString(),
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "Activities completed today",
    },
  ];

  // Load activities on mount
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Fetch chat sessions and messages on mount
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const sessions = await getAllChatSessions();
        setChatSessions(sessions);
        
        // Fetch messages for all sessions
        const allMessages: ChatMessage[] = [];
        for (const session of sessions) {
          try {
            const res = await fetch(`/api/chat/sessions/${session.id}/messages`, { credentials: "include" });
            if (res.ok) {
              const sessionMessages = await res.json();
              allMessages.push(...sessionMessages);
            }
          } catch (error) {
            console.error("Error fetching messages for session", session.id, error);
          }
        }
        setChatMessages(allMessages);
      } catch (error) {
        console.error("Error fetching chat sessions:", error);
      }
    };
    
    fetchChatData();
  }, []);

  // Add these action handlers
  const handleStartTherapy = () => {
    router.push("/chat");
  };

  const handleActivityLogged = () => {
    setShowActivityLogger(false);
    loadActivities();
  };

  const handleMoodSubmit = async (data: { moodScore: number; note?: string }) => {
    try {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: data.moodScore, note: data.note }),
        credentials: "include",
      });
      if (res.ok) {
        setShowMoodModal(false);
        fetchDailyStats();
      } else {
        const err = await res.json().catch(() => ({}));
        console.error("Mood save error:", err?.error);
      }
    } catch (error) {
      console.error("Error saving mood:", error);
    }
  };


  if (!mounted || sessionLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1">
      <Container className="pt-20 pb-8 space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <h1 className="text-3xl font-bold text-foreground">
              {(() => {
                const hour = currentTime.getHours();
                if (hour < 12) return "Good morning";
                if (hour < 17) return "Good afternoon";
                if (hour < 21) return "Good evening";
                return "Good night";
              })()}, {user?.name || "there"}
            </h1>
            <p className="text-muted-foreground">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </motion.div>
        </div>

        {/* Main Grid Layout */}
        <div className="space-y-6">
          {/* Top Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Quick Actions Card */}
            <Card className="border-primary/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
              <CardContent className="p-6 relative">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Quick Actions</h3>
                      <p className="text-sm text-muted-foreground">
                        Start your wellness journey
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Button
                      variant="default"
                      className={cn(
                        "w-full justify-between items-center p-6 h-auto group/button",
                        "bg-white text-black hover:bg-white/90 dark:bg-black dark:text-white dark:hover:bg-black/90",
                        "border border-border/40 dark:border-border/30",
                        "transition-all duration-200 group-hover:translate-y-[-2px]"
                      )}
                      onClick={handleStartTherapy}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center border border-black/10 dark:border-white/10">
                          <MessageSquare className="w-4 h-4 text-current" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-current">
                            Start Therapy
                          </div>
                          <div className="text-xs text-current/80">
                            Begin a new session
                          </div>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover/button:opacity-100 transition-opacity">
                        <ArrowRight className="w-5 h-5 text-current" />
                      </div>
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className={cn(
                          "flex flex-col h-[120px] px-4 py-3 group/mood hover:border-primary/50",
                          "justify-center items-center text-center",
                          "transition-all duration-200 group-hover:translate-y-[-2px]"
                        )}
                        onClick={() => setShowMoodModal(true)}
                      >
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center mb-2">
                          <Heart className="w-5 h-5 text-rose-500" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Track Mood</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            How are you feeling?
                          </div>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className={cn(
                          "flex flex-col h-[120px] px-4 py-3 group/activity hover:border-primary/50",
                          "justify-center items-center text-center",
                          "transition-all duration-200 group-hover:translate-y-[-2px]"
                        )}
                        onClick={() => setShowActivityLogger(true)}
                      >
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                          <Activity className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Log Activity</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Track your progress
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Overview Card */}
            <Card className="border-primary/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Today&apos;s Overview</CardTitle>
                    <CardDescription>
                      Your wellness metrics for{" "}
                      {format(new Date(), "MMMM d, yyyy")}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchDailyStats}
                    className="h-8 w-8"
                  >
                    <Loader2 className={cn("h-4 w-4", "animate-spin")} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {wellnessStats.map((stat) => (
                    <div
                      key={stat.title}
                      className={cn(
                        "p-4 rounded-lg transition-all duration-200 hover:scale-[1.02]",
                        stat.bgColor
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                        <p className="text-sm font-medium">{stat.title}</p>
                      </div>
                      <p className="text-2xl font-bold mt-2">{stat.value}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {stat.description}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs text-muted-foreground text-right">
                  Last updated: {format(dailyStats.lastUpdated, "h:mm a")}
                </div>
              </CardContent>
            </Card>

            {/* Chat AI Insights Card */}
            <ChatAIInsights 
              sessions={chatSessions} 
              messages={chatMessages}
              onActionClick={(insight: ChatAIInsight) => {
                console.log("Chat AI Insight clicked:", insight);
                // Handle AI insight actions here
              }}
            />

            {/* Chat Insights Card */}
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>Chat Insights</CardTitle>
                <CardDescription>Overview of your conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg bg-primary/10">
                    <p className="text-sm text-muted-foreground">Total Chats</p>
                    <p className="text-2xl font-bold mt-1">{chatInsights.totalSessions}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/10">
                    <p className="text-sm text-muted-foreground">Total Messages</p>
                    <p className="text-2xl font-bold mt-1">{chatInsights.totalMessages}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/10">
                    <p className="text-sm text-muted-foreground">Avg Msgs / Chat</p>
                    <p className="text-2xl font-bold mt-1">{chatInsights.avgMessagesPerSession.toFixed(1)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/10">
                    <p className="text-sm text-muted-foreground">Last Activity</p>
                    <p className="text-2xl font-bold mt-1">
                      {chatInsights.lastActivityAt
                        ? format(new Date(chatInsights.lastActivityAt), "MMM d, h:mm a")
                        : "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mood Tracker */}
            <MoodTracker onMoodUpdate={fetchDailyStats} />
            
            {/* Activity Logger */}
            <ActivityLogger onActivityLogged={handleActivityLogged} />
          </div>
        </div>
      </Container>


      {/* AI check-in chat */}
      {showCheckInChat && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background border-l shadow-lg">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold">AI Check-in</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCheckInChat(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4"></div>
            </div>
          </div>
        </div>
      )}

      {/* Mood tracking modal */}
      {showMoodModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Track Your Mood</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMoodModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <MoodForm
                onSubmit={handleMoodSubmit}
                onSuccess={() => setShowMoodModal(false)}
                onCancel={() => setShowMoodModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Activity logger modal */}
      {showActivityLogger && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Log Activity</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowActivityLogger(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ActivityLogger onActivityLogged={handleActivityLogged} />
            </div>
          </div>
        </div>
      )}

      </div>

      <footer className="mt-auto">
        <FooterSection />
      </footer>
    </div>
  );
}
