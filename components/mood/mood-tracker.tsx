"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, TrendingUp, TrendingDown, Minus } from "lucide-react";
import MoodForm from "./mood-form";

interface MoodEntry {
  id: string;
  score: number;
  note?: string;
  timestamp: string;
}

interface MoodTrackerProps {
  onMoodUpdate?: (mood: MoodEntry) => void;
}

export default function MoodTracker({ onMoodUpdate }: MoodTrackerProps) {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMoods();
  }, []);

  // Refresh moods when component updates (e.g., after modal submission)
  useEffect(() => {
    if (!showForm) {
      loadMoods();
    }
  }, [showForm]);

  const loadMoods = async () => {
    try {
      const res = await fetch("/api/mood", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setMoods(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error loading moods:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSubmit = async (data: { moodScore: number; note?: string }) => {
    try {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          score: data.moodScore, 
          note: data.note 
        }),
        credentials: "include",
      });

      if (res.ok) {
        const newMood = await res.json();
        setMoods(prev => [newMood, ...prev]);
        setShowForm(false);
        // Refresh moods to ensure we have the latest data
        await loadMoods();
        onMoodUpdate?.(newMood);
      } else {
        throw new Error("Failed to save mood");
      }
    } catch (error) {
      console.error("Error saving mood:", error);
      throw error;
    }
  };

  const getMoodTrend = () => {
    if (moods.length < 2) return null;
    const recent = moods.slice(0, 2);
    const diff = recent[0].score - recent[1].score;
    if (diff > 5) return "up";
    if (diff < -5) return "down";
    return "stable";
  };

  const getTodayMood = () => {
    if (moods.length === 0) return null;
    // Use the most recent mood entry for today
    return moods[0].score;
  };

  const getMoodEmoji = (score: number) => {
    if (score <= 30) return "😢";
    if (score <= 50) return "😐";
    if (score <= 70) return "🙂";
    return "😊";
  };

  const trend = getMoodTrend();
  const todayMood = getTodayMood();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  if (showForm) {
    return (
      <Card className="h-full">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-4 w-4 text-rose-500" />
            Track Your Mood
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <MoodForm
            onSubmit={handleMoodSubmit}
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-500" />
          Mood Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Mood Summary */}
        <div className="text-center p-4 bg-muted/30 rounded-lg">
          {todayMood !== null ? (
            <>
              <div className="text-4xl mb-2">{getMoodEmoji(todayMood)}</div>
              <div className="text-3xl font-bold text-primary cursor-pointer hover:text-primary/80 transition-colors">
                {todayMood}/100
              </div>
              <div className="text-sm text-muted-foreground">Today's Mood</div>
            </>
          ) : (
            <>
              <div className="text-4xl mb-2">🤔</div>
              <div className="text-3xl font-bold text-muted-foreground">
                No mood logged
              </div>
              <div className="text-sm text-muted-foreground">Track your mood today</div>
            </>
          )}
          
          {trend && (
            <div className="flex items-center justify-center gap-1 mt-2">
              {trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
              {trend === "down" && <TrendingDown className="h-4 w-4 text-red-500" />}
              {trend === "stable" && <Minus className="h-4 w-4 text-yellow-500" />}
              <span className="text-sm text-muted-foreground">
                {trend === "up" && "Improving"}
                {trend === "down" && "Declining"}
                {trend === "stable" && "Stable"}
              </span>
            </div>
          )}
        </div>

        {/* Today's Entries */}
        {moods.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Today's Entries</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {moods.slice(0, 5).map((mood) => (
                <div key={mood.id} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getMoodEmoji(mood.score)}</span>
                    <div>
                      <div className="text-sm font-medium">{mood.score}/100</div>
                      {mood.note && (
                        <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {mood.note}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(mood.timestamp).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={() => setShowForm(true)} 
          className="w-full"
          size="lg"
        >
          Log Mood
        </Button>
      </CardContent>
    </Card>
  );
}
