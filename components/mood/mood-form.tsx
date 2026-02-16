"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Frown, Meh, Smile, Laugh } from "lucide-react";

interface MoodFormProps {
  onSubmit: (data: { moodScore: number; note?: string }) => void;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const moodEmojis = [
  { value: 20, icon: Frown, label: "Very Bad", color: "text-red-500" },
  { value: 40, icon: Meh, label: "Bad", color: "text-orange-500" },
  { value: 60, icon: Smile, label: "Good", color: "text-yellow-500" },
  { value: 80, icon: Laugh, label: "Great", color: "text-green-500" },
];

export default function MoodForm({ onSubmit, onSuccess, onCancel }: MoodFormProps) {
  const [moodScore, setMoodScore] = useState([50]);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCurrentMoodEmoji = () => {
    const score = moodScore[0];
    if (score <= 30) return moodEmojis[0];
    if (score <= 50) return moodEmojis[1];
    if (score <= 70) return moodEmojis[2];
    return moodEmojis[3];
  };

  const currentMood = getCurrentMoodEmoji();
  const CurrentIcon = currentMood.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ 
        moodScore: moodScore[0], 
        note: note.trim() || undefined 
      });
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting mood:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mood Emoji Display */}
      <div className="flex justify-center">
        <div className={`text-5xl ${currentMood.color} transition-all duration-300`}>
          <CurrentIcon />
        </div>
      </div>

        {/* Mood Labels */}
        <div className="flex justify-between text-xs text-muted-foreground px-2">
          <span>Very Bad</span>
          <span>Neutral</span>
          <span>Great</span>
        </div>

        {/* Mood Slider */}
        <div className="space-y-1">
          <Slider
            value={moodScore}
            onValueChange={setMoodScore}
            max={100}
            min={0}
            step={1}
            className="w-full"
            disabled={isSubmitting}
          />
          <div className="text-center">
            <span className="text-xl font-bold">{moodScore[0]}</span>
            <span className="text-sm text-muted-foreground ml-1">/100</span>
          </div>
        </div>

        {/* Quick Mood Buttons */}
        <div className="grid grid-cols-4 gap-1">
          {moodEmojis.map((mood) => {
            const Icon = mood.icon;
            return (
              <Button
                key={mood.value}
                variant="outline"
                size="sm"
                onClick={() => setMoodScore([mood.value])}
                className={`flex flex-col gap-1 h-16 py-1 ${
                  Math.abs(moodScore[0] - mood.value) < 10 ? 'border-primary' : ''
                }`}
                disabled={isSubmitting}
              >
                <Icon className={`h-3 w-3 ${mood.color}`} />
                <span className="text-xs">{mood.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Optional Note */}
        <div className="space-y-1">
          <label htmlFor="mood-note" className="text-sm font-medium">
            What&apos;s on your mind? (optional)
          </label>
          <textarea
            id="mood-note"
            value={note}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
            placeholder="Describe how you're feeling..."
            className="w-full p-2 border rounded-md resize-none h-16 text-sm"
            disabled={isSubmitting}
            maxLength={200}
          />
          <div className="text-xs text-muted-foreground text-right">
            {note.length}/200
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Saving..." : "Save Mood"}
          </Button>
        </div>
    </div>
  );
}
