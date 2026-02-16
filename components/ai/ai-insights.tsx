"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Target, Calendar, Activity, Lightbulb, ChevronRight } from "lucide-react";

interface Activity {
  id: string;
  type: string;
  name: string;
  description: string | null;
  timestamp: Date;
  duration: number | null;
  completed: boolean;
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: "trend" | "recommendation" | "achievement" | "pattern";
  priority: "high" | "medium" | "low";
  actionable: boolean;
  data?: Record<string, unknown>;
}

interface AIInsightsProps {
  activities: Activity[];
  onActionClick?: (insight: AIInsight) => void;
}

export default function AIInsights({ activities, onActionClick }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);

  const generateInsights = useCallback(() => {
    setLoading(true);
    const newInsights: AIInsight[] = [];

    if (activities.length === 0) {
      setInsights([{
        id: "no-activities",
        title: "Start Your Wellness Journey",
        description: "Begin logging activities to receive personalized AI insights and recommendations.",
        type: "recommendation",
        priority: "high",
        actionable: true,
      }]);
      setLoading(false);
      return;
    }

    // Activity frequency analysis
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const recentActivities = activities.filter(a => a.timestamp >= lastWeek);

    // Insight 1: Activity consistency
    const activitiesByType = recentActivities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequentType = Object.entries(activitiesByType)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostFrequentType && mostFrequentType[1] >= 3) {
      newInsights.push({
        id: "consistent-activity",
        title: "Great Consistency!",
        description: `You've been consistent with ${mostFrequentType[0]} activities (${mostFrequentType[1]} times this week). Keep up the excellent work!`,
        type: "achievement",
        priority: "high",
        actionable: false,
      });
    }

    // Insight 2: Activity diversity
    const uniqueTypes = Object.keys(activitiesByType).length;
    if (uniqueTypes < 3 && recentActivities.length >= 5) {
      newInsights.push({
        id: "activity-diversity",
        title: "Try Something New",
        description: "You've been focusing on similar activities. Consider trying different types like meditation, exercise, or social activities for balanced wellness.",
        type: "recommendation",
        priority: "medium",
        actionable: true,
        data: { suggestedTypes: ["meditation", "exercise", "social", "hobby"] }
      });
    }

    // Insight 3: Duration patterns
    const activitiesWithDuration = recentActivities.filter(a => a.duration);
    if (activitiesWithDuration.length > 0) {
      const avgDuration = activitiesWithDuration.reduce((sum, a) => sum + (a.duration || 0), 0) / activitiesWithDuration.length;
      
      if (avgDuration < 15) {
        newInsights.push({
          id: "short-duration",
          title: "Consider Longer Sessions",
          description: "Your average activity duration is quite short. Try extending sessions to 20-30 minutes for deeper benefits.",
          type: "recommendation",
          priority: "medium",
          actionable: true,
        });
      } else if (avgDuration > 60) {
        newInsights.push({
          id: "long-duration",
          title: "Impressive Dedication",
          description: `Your average session is ${Math.round(avgDuration)} minutes! That's excellent commitment to your wellness.`,
          type: "achievement",
          priority: "high",
          actionable: false,
        });
      }
    }

    // Insight 4: Time patterns
    const hourCounts = recentActivities.reduce((acc, activity) => {
      const hour = activity.timestamp.getHours();
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
      else timeOfDay = "evening";

      newInsights.push({
        id: "time-pattern",
        title: "Your Peak Time",
        description: `You're most active in the ${timeOfDay} (${hour}:00). This is your optimal time for wellness activities!`,
        type: "pattern",
        priority: "medium",
        actionable: false,
      });
    }

    // Insight 5: Weekly goal tracking
    const thisWeek = recentActivities.length;
    if (thisWeek >= 7) {
      newInsights.push({
        id: "weekly-goal",
        title: "Weekly Goal Achieved!",
        description: `You've completed ${thisWeek} activities this week. You're building great momentum!`,
        type: "achievement",
        priority: "high",
        actionable: false,
      });
    } else if (thisWeek < 3) {
      newInsights.push({
        id: "weekly-goal-low",
        title: "Increase Activity Frequency",
        description: "Try to aim for 5-7 activities per week for consistent progress in your wellness journey.",
        type: "recommendation",
        priority: "high",
        actionable: true,
      });
    }

    // Sort insights by priority
    newInsights.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    setInsights(newInsights.slice(0, 4)); // Show top 4 insights
    setLoading(false);
  }, [activities]);

  useEffect(() => {
    generateInsights();
  }, [activities, generateInsights]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "trend": return <TrendingUp className="h-4 w-4" />;
      case "recommendation": return <Lightbulb className="h-4 w-4" />;
      case "achievement": return <Target className="h-4 w-4" />;
      case "pattern": return <Calendar className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string, priority: string) => {
    if (type === "achievement") return "text-green-600 bg-green-50 border-green-200";
    if (priority === "high") return "text-blue-600 bg-blue-50 border-blue-200";
    if (priority === "medium") return "text-purple-600 bg-purple-50 border-purple-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  return (
    <Card className="h-full">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Log activities to receive AI insights
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-3 rounded-lg border transition-all hover:shadow-sm ${getInsightColor(
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
                        className="mt-2 h-6 text-xs"
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
