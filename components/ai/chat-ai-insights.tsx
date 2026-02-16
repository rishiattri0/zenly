"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Target, MessageSquare, Heart, Lightbulb, ChevronRight, Calendar } from "lucide-react";

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

interface ChatAIInsightsProps {
  sessions: ChatSession[];
  messages: ChatMessage[];
  onActionClick?: (insight: ChatAIInsight) => void;
}

export default function ChatAIInsights({ sessions, messages, onActionClick }: ChatAIInsightsProps) {
  const [insights, setInsights] = useState<ChatAIInsight[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateInsights();
  }, [sessions, messages]);

  const generateInsights = useCallback(() => {
    setLoading(true);
    const newInsights: ChatAIInsight[] = [];

    if (sessions.length === 0) {
      setInsights([{
        id: "no-chats",
        title: "Start Your Journey",
        description: "Begin your first therapy conversation to receive personalized AI insights and track your progress.",
        type: "recommendation",
        priority: "high",
        actionable: true,
      }]);
      setLoading(false);
      return;
    }

    // Analyze conversation patterns
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const recentSessions = sessions.filter(s => new Date(s.updated_at) >= lastWeek);
    const recentMessages = messages.filter(m => new Date(m.created_at) >= lastWeek);

    // Insight 1: Conversation frequency
    if (recentSessions.length >= 5) {
      newInsights.push({
        id: "consistent-therapy",
        title: "Excellent Consistency!",
        description: `You've had ${recentSessions.length} therapy sessions this week. Regular conversations are key to mental wellness progress.`,
        type: "achievement",
        priority: "high",
        actionable: false,
      });
    } else if (recentSessions.length < 2 && recentSessions.length > 0) {
      newInsights.push({
        id: "increase-frequency",
        title: "Consider More Sessions",
        description: "Try to have 2-3 therapy conversations per week for consistent support and progress.",
        type: "recommendation",
        "priority": "high",
        actionable: true,
      });
    }

    // Insight 2: Message depth analysis
    if (recentMessages.length > 0) {
      const avgMessageLength = recentMessages.reduce((sum, msg) => sum + msg.content.length, 0) / recentMessages.length;
      
      if (avgMessageLength < 50) {
        newInsights.push({
          id: "short-messages",
          title: "Share More Details",
          description: "Try to be more descriptive in your messages. The more context you provide, the better the AI can assist you.",
          type: "recommendation",
          priority: "medium",
          actionable: true,
        });
      } else if (avgMessageLength > 300) {
        newInsights.push({
          id: "detailed-messages",
          title: "Great Self-Expression!",
          description: "You're providing excellent detail in your messages. This helps the AI understand your needs better.",
          type: "achievement",
          priority: "high",
          actionable: false,
        });
      }
    }

    // Insight 3: Emotional themes analysis
    const emotionalKeywords = [
      "anxious", "depressed", "happy", "sad", "angry", "frustrated", "excited", "calm", "worried", "stressed", "relaxed", "confident", "lonely"
    ];
    
    const emotionalPatterns = recentMessages.reduce((acc, msg) => {
      const found = emotionalKeywords.filter(keyword => 
        msg.content.toLowerCase().includes(keyword)
      );
      found.forEach(keyword => {
        acc[keyword] = (acc[keyword] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const dominantEmotion = Object.entries(emotionalPatterns)
      .sort(([,a], [,b]) => b - a)[0];

    if (dominantEmotion && dominantEmotion[1] >= 3) {
      const emotion = dominantEmotion[0];
      if (["anxious", "depressed", "sad", "worried", "stressed"].includes(emotion)) {
        newInsights.push({
          id: "emotional-concern",
          title: "Emotional Support Available",
          description: `I notice you've expressed ${emotion} frequently. Consider discussing coping strategies during your next session.`,
          type: "concern",
          priority: "high",
          actionable: true,
        });
      } else if (["happy", "calm", "relaxed", "confident"].includes(emotion)) {
        newInsights.push({
          id: "positive-outlook",
          title: "Positive Progress!",
          description: `You're showing a lot of ${emotion} in your conversations. This is wonderful for your mental wellness journey!`,
          type: "achievement",
          priority: "high",
          actionable: false,
        });
      }
    }

    // Insight 4: Session timing patterns
    const hourCounts = recentSessions.reduce((acc, session) => {
      const hour = new Date(session.updated_at).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const peakHour = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)[0];

    if (peakHour) {
      const hour = parseInt(peakHour[0]);
      let timeOfDay = "";
      if (hour < 12) timeOfDay = "morning";
      else if (hour < 17) timeOfDay = "afternoon";
      else if (hour < 21) timeOfDay = "evening";
      else timeOfDay = "night";

      newInsights.push({
        id: "therapy-time-pattern",
        title: "Your Therapy Time",
        description: `You're most active in the ${timeOfDay} (${hour}:00). This appears to be your optimal time for therapy conversations!`,
        type: "pattern",
        priority: "medium",
        actionable: false,
      });
    }

    // Insight 5: Session length patterns
    const sessionDurations = recentSessions.map(session => {
      const sessionMessages = messages.filter(m => m.created_at >= session.created_at && m.created_at <= session.updated_at);
      const duration = sessionMessages.length > 0 ? 
        new Date(session.updated_at).getTime() - new Date(sessionMessages[0].created_at).getTime() : 0;
      return duration;
    });

    if (sessionDurations.length > 0) {
      let avgDuration = sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length;
      avgDuration = avgDuration / (1000 * 60); // Convert to minutes

      if (avgDuration < 5) {
        newInsights.push({
          id: "short-sessions",
          title: "Deeper Conversations",
          description: "Consider spending more time in therapy sessions. Longer conversations allow for deeper exploration of your thoughts and feelings.",
          type: "recommendation",
          priority: "medium",
          actionable: true,
        });
      } else if (avgDuration > 30) {
        newInsights.push({
          id: "deep-engagement",
          title: "Excellent Engagement!",
          description: `Your average session is ${Math.round(avgDuration)} minutes. You're showing great commitment to your therapy journey!`,
          type: "achievement",
          priority: "high",
          actionable: false,
        });
      }
    }

    // Insight 6: Progress tracking
    const totalSessions = sessions.length;
    if (totalSessions >= 10) {
      newInsights.push({
        id: "therapy-milestone",
        title: "Significant Progress!",
        description: `You've completed ${totalSessions} therapy sessions. That's a major commitment to your mental wellness journey!`,
        type: "achievement",
        priority: "high",
        actionable: false,
      });
    } else if (totalSessions >= 5) {
      newInsights.push({
        id: "therapy-progress",
        title: "Building Momentum",
        description: `You've had ${totalSessions} therapy sessions. You're establishing a great routine for mental wellness!`,
        type: "achievement",
        priority: "medium",
        actionable: false,
      });
    }

    // Sort insights by priority
    newInsights.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    setInsights(newInsights.slice(0, 4)); // Show top 4 insights
    setLoading(false);
  }, [sessions, messages]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "progress": return <TrendingUp className="h-4 w-4" />;
      case "recommendation": return <Lightbulb className="h-4 w-4" />;
      case "pattern": return <Calendar className="h-4 w-4" />;
      case "achievement": return <Target className="h-4 w-4" />;
      case "concern": return <Heart className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string, priority: string) => {
    if (type === "concern") {
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800";
    }
    if (type === "achievement") {
      return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800";
    }
    if (priority === "high") {
      return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800";
    }
    if (priority === "medium") {
      return "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800";
    }
    return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800";
  };

  return (
    <Card className="h-full">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          AI Therapy Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground dark:text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Start therapy conversations to receive AI insights
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-3 rounded-lg border transition-all hover:shadow-sm hover:shadow-black/5 dark:hover:shadow-black/20 ${getInsightColor(
                  insight.type,
                  insight.priority
                )}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm mb-1">
                      {insight.title}
                    </div>
                    <p className="text-xs leading-relaxed">
                      {insight.description}
                    </p>
                    {insight.actionable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-6 text-xs hover:bg-accent dark:hover:bg-accent/50"
                        onClick={() => onActionClick?.(insight)}
                      >
                        Take Action
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
