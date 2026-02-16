"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, CheckCircle, Plus, Calendar } from "lucide-react";

interface Activity {
  id: string;
  type: string;
  name: string;
  description?: string;
  duration?: number;
  completed: boolean;
  timestamp: string;
}

interface ActivityLoggerProps {
  onActivityLogged?: () => void;
}

const activityTypes = [
  { value: "exercise", label: "Exercise", color: "bg-green-500" },
  { value: "meditation", label: "Meditation", color: "bg-blue-500" },
  { value: "therapy", label: "Therapy Session", color: "bg-purple-500" },
  { value: "journaling", label: "Journaling", color: "bg-yellow-500" },
  { value: "social", label: "Social Activity", color: "bg-pink-500" },
  { value: "hobby", label: "Hobby", color: "bg-orange-500" },
  { value: "sleep", label: "Sleep", color: "bg-indigo-500" },
  { value: "nutrition", label: "Nutrition", color: "bg-teal-500" },
];

const suggestedActivities = {
  exercise: ["Morning walk", "Gym workout", "Yoga session", "Running", "Cycling"],
  meditation: ["Mindfulness meditation", "Breathing exercises", "Body scan", "Loving-kindness"],
  therapy: ["CBT session", "Talk therapy", "Group therapy", "Online counseling"],
  journaling: ["Gratitude journal", "Thought record", "Dream journal", "Creative writing"],
  social: ["Call a friend", "Meet family", "Social event", "Community activity"],
  hobby: ["Reading", "Painting", "Music practice", "Gardening", "Cooking"],
  sleep: ["Bedtime routine", "Power nap", "Sleep hygiene", "Relaxation before bed"],
  nutrition: ["Healthy meal", "Meal prep", "Hydration tracking", "Mindful eating"],
};

export default function ActivityLogger({ onActivityLogged }: ActivityLoggerProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const res = await fetch("/api/activities", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setActivities(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !name.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: name.trim(),
          description: description.trim() || null,
          duration: duration ? parseInt(duration) : null,
        }),
        credentials: "include",
      });

      if (res.ok) {
        const newActivity = await res.json();
        setActivities(prev => [newActivity, ...prev]);
        setShowForm(false);
        resetForm();
        onActivityLogged?.();
      } else {
        throw new Error("Failed to save activity");
      }
    } catch (error) {
      console.error("Error saving activity:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setType("");
    setName("");
    setDescription("");
    setDuration("");
  };

  const getActivityTypeColor = (type: string) => {
    return activityTypes.find(t => t.value === type)?.color || "bg-gray-500";
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Log Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Activity Type</label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((activityType) => (
                    <SelectItem key={activityType.value} value={activityType.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${activityType.color}`} />
                        {activityType.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Activity Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What did you do?"
                required
              />
              {type && suggestedActivities[type as keyof typeof suggestedActivities] && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {suggestedActivities[type as keyof typeof suggestedActivities].map((suggestion) => (
                    <Button
                      key={suggestion}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setName(suggestion)}
                      className="text-xs h-6"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="How long did it take?"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
                maxLength={300}
              />
              <div className="text-xs text-muted-foreground text-right">
                {description.length}/300
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? "Saving..." : "Log Activity"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Logger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's Summary */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {activities.filter(a => {
                  const today = new Date().toDateString();
                  return new Date(a.timestamp).toDateString() === today;
                }).length}
              </div>
              <div className="text-sm text-muted-foreground">Activities Today</div>
            </div>
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        {/* Recent Activities */}
        {activities.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Activities</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activities.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getActivityTypeColor(activity.type)}`} />
                    <div>
                      <div className="font-medium">{activity.name}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {activityTypes.find(t => t.value === activity.type)?.label}
                        </Badge>
                        {activity.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(activity.duration)}
                          </span>
                        )}
                        {activity.completed && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Completed
                          </span>
                        )}
                      </div>
                      {activity.description && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {activity.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleDateString()}
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
          <Plus className="h-4 w-4 mr-2" />
          Log Activity
        </Button>
      </CardContent>
    </Card>
  );
}
