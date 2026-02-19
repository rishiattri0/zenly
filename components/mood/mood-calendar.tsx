"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface MoodEntry {
  id: string;
  score: number;
  note?: string;
  timestamp: string;
}

interface DayCell {
  dateKey: string;
  date: Date;
  avgScore: number | null;
  count: number;
}

const WEEKDAY_ROWS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toneClass(score: number | null): string {
  if (score === null) return "bg-muted/35 border-border/50";
  if (score < 25) return "bg-rose-500/30 border-rose-400/30";
  if (score < 45) return "bg-orange-500/30 border-orange-400/30";
  if (score < 65) return "bg-amber-500/35 border-amber-400/35";
  if (score < 85) return "bg-emerald-500/35 border-emerald-400/35";
  return "bg-sky-500/35 border-sky-400/35";
}

export default function MoodCalendar() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/api/mood?days=84", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) {
          setEntries(Array.isArray(data) ? data : []);
        }
      } catch {
        // no-op
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const cells = useMemo(() => {
    const daily = new Map<string, { sum: number; count: number }>();
    for (const entry of entries) {
      const date = new Date(entry.timestamp);
      const key = toDateKey(date);
      const prev = daily.get(key) || { sum: 0, count: 0 };
      daily.set(key, { sum: prev.sum + entry.score, count: prev.count + 1 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(today);
    start.setDate(start.getDate() - 83);

    const next: DayCell[] = [];
    for (let i = 0; i < 84; i += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const key = toDateKey(date);
      const stat = daily.get(key);
      next.push({
        dateKey: key,
        date,
        avgScore: stat ? Math.round(stat.sum / stat.count) : null,
        count: stat?.count ?? 0,
      });
    }

    return next;
  }, [entries]);

  const weeks = useMemo(() => {
    const chunks: DayCell[][] = [];
    for (let i = 0; i < 12; i += 1) {
      chunks.push(cells.slice(i * 7, i * 7 + 7));
    }
    return chunks;
  }, [cells]);

  const monthLabels = useMemo(() => {
    return weeks.map((week, index) => {
      const first = week[0];
      if (!first) return "";
      if (index === 0) return first.date.toLocaleDateString("en-US", { month: "short" });
      const prev = weeks[index - 1]?.[0];
      if (!prev) return "";
      const changed = first.date.getMonth() !== prev.date.getMonth();
      return changed ? first.date.toLocaleDateString("en-US", { month: "short" }) : "";
    });
  }, [weeks]);

  const average = useMemo(() => {
    const tracked = cells.filter((c) => c.avgScore !== null);
    if (tracked.length === 0) return null;
    return Math.round(tracked.reduce((sum, cell) => sum + (cell.avgScore || 0), 0) / tracked.length);
  }, [cells]);

  const streak = useMemo(() => {
    let days = 0;
    for (let i = cells.length - 1; i >= 0; i -= 1) {
      if (cells[i].avgScore === null) break;
      days += 1;
    }
    return days;
  }, [cells]);

  const trackedDays = useMemo(() => cells.filter((c) => c.avgScore !== null).length, [cells]);

  if (loading) {
    return (
      <Card className="border-primary/20 bg-card/80 backdrop-blur-sm shadow-sm">
        <CardContent className="flex h-44 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <CalendarDays className="h-5 w-5 text-primary" />
          Mood Calendar
        </CardTitle>
        <CardDescription>
          12-week heatmap of your daily mood. Hover cells to inspect each day.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-xl border border-border/60 bg-background/50 p-3 sm:p-4">
          <div className="mx-auto w-fit">
          <div className="mb-3 flex gap-1 pl-7">
            {monthLabels.map((label, index) => (
              <div key={`month-${index}`} className="w-4 text-[10px] text-muted-foreground">
                {label}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col gap-1 pt-[2px] text-[10px] text-muted-foreground">
              {WEEKDAY_ROWS.map((row, idx) => (
                <span key={row} className="h-4 leading-4">
                  {idx % 2 === 0 ? row : ""}
                </span>
              ))}
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1">
              {weeks.map((week, weekIdx) => (
                <div key={`week-${weekIdx}`} className="flex flex-col gap-1">
                  {week.map((cell) => (
                    <div
                      key={cell.dateKey}
                      className={cn(
                        "h-4 w-4 rounded-[5px] border transition duration-150 hover:scale-110",
                        toneClass(cell.avgScore)
                      )}
                      title={`${cell.date.toLocaleDateString("en-US")}: ${
                        cell.avgScore !== null ? `${cell.avgScore}/100 (${cell.count} entr${cell.count === 1 ? "y" : "ies"})` : "No data"
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
            <span>Less</span>
            <span className="h-3 w-3 rounded-[4px] border border-border/50 bg-muted/35" />
            <span className="h-3 w-3 rounded-[4px] border border-amber-400/35 bg-amber-500/35" />
            <span className="h-3 w-3 rounded-[4px] border border-emerald-400/35 bg-emerald-500/35" />
            <span className="h-3 w-3 rounded-[4px] border border-sky-400/35 bg-sky-500/35" />
            <span>More</span>
          </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border/60 bg-background/50 p-3">
            <p className="text-xs text-muted-foreground">Average (12w)</p>
            <p className="text-lg font-semibold">{average !== null ? `${average}/100` : "N/A"}</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/50 p-3">
            <p className="text-xs text-muted-foreground">Current Streak</p>
            <p className="text-lg font-semibold">{streak} days</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/50 p-3">
            <p className="text-xs text-muted-foreground">Entries</p>
            <p className="text-lg font-semibold">{entries.length}</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/50 p-3">
            <p className="text-xs text-muted-foreground">Days Tracked</p>
            <p className="text-lg font-semibold">{trackedDays}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
