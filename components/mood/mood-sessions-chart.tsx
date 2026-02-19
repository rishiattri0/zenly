"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { format, subDays } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp } from "lucide-react";

interface MoodEntry {
  id: string;
  score: number;
  timestamp: string;
}

interface ChatSession {
  id: string;
  created_at: string;
}

interface ChartPoint {
  date: string;
  moodScore: number;
  sessions: number;
}

const DAYS = 120;

const chartConfig = {
  moodScore: { label: "Mood Score", color: "var(--chart-1)" },
  sessions: { label: "Sessions", color: "var(--chart-2)" },
} satisfies ChartConfig;

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function MoodSessionsChart() {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [moodRes, sessionsRes] = await Promise.all([
          fetch(`/api/mood?days=${DAYS}`, { credentials: "include" }),
          fetch("/api/chat/sessions", { credentials: "include" }),
        ]);

        const nextMoods = moodRes.ok ? await moodRes.json() : [];
        const nextSessions = sessionsRes.ok ? await sessionsRes.json() : [];

        if (mounted) {
          setMoods(Array.isArray(nextMoods) ? nextMoods : []);
          setSessions(Array.isArray(nextSessions) ? nextSessions : []);
        }
      } catch {
        if (mounted) {
          setMoods([]);
          setSessions([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const chartData = useMemo(() => {
    const moodByDay = new Map<string, { sum: number; count: number }>();
    for (const mood of moods) {
      const key = toLocalDateKey(new Date(mood.timestamp));
      const prev = moodByDay.get(key) || { sum: 0, count: 0 };
      moodByDay.set(key, { sum: prev.sum + mood.score, count: prev.count + 1 });
    }

    const sessionsByDay = new Map<string, number>();
    for (const session of sessions) {
      const key = toLocalDateKey(new Date(session.created_at));
      sessionsByDay.set(key, (sessionsByDay.get(key) || 0) + 1);
    }

    const start = subDays(new Date(), DAYS - 1);
    const points: ChartPoint[] = [];

    for (let i = 0; i < DAYS; i += 1) {
      const date = subDays(start, -i);
      const key = toLocalDateKey(date);
      const moodStats = moodByDay.get(key);

      points.push({
        date: key,
        moodScore: moodStats ? Math.round(moodStats.sum / moodStats.count) : 0,
        sessions: sessionsByDay.get(key) || 0,
      });
    }

    return points;
  }, [moods, sessions]);

  const filteredData = useMemo(() => {
    if (!chartData.length) return chartData;
    const referenceDate = new Date(`${chartData[chartData.length - 1].date}T00:00:00`);
    let daysToSubtract = 90;
    if (timeRange === "30d") daysToSubtract = 30;
    if (timeRange === "7d") daysToSubtract = 7;

    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return chartData.filter((item) => new Date(`${item.date}T00:00:00`) >= startDate);
  }, [chartData, timeRange]);

  const avgMood = useMemo(() => {
    const tracked = filteredData.filter((d) => d.moodScore > 0);
    if (!tracked.length) return null;
    return Math.round(tracked.reduce((sum, point) => sum + point.moodScore, 0) / tracked.length);
  }, [filteredData]);

  const totalSessions = useMemo(() => filteredData.reduce((sum, d) => sum + d.sessions, 0), [filteredData]);

  return (
    <Card className="border-primary/20 bg-card/80 pt-0 shadow-sm backdrop-blur-sm">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="flex items-center gap-2 text-xl">
          <TrendingUp className="h-5 w-5 text-primary" />
          Mood and Sessions Trend
          </CardTitle>
          <CardDescription>Interactive chart for mood score and therapy sessions.</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex" aria-label="Select time range">
            <SelectValue placeholder="Last 7 days" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">Last 90 days</SelectItem>
            <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
            <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-4 px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
          <AreaChart data={filteredData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <defs>
                <linearGradient id="fillMoodScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-moodScore)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-moodScore)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="fillSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-sessions)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-sessions)" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={28}
                tickFormatter={(value) => format(new Date(`${value}T00:00:00`), "MMM d")}
              />
              <YAxis yAxisId="mood" domain={[0, 100]} tickLine={false} axisLine={false} width={30} />
              <YAxis yAxisId="sessions" orientation="right" allowDecimals={false} tickLine={false} axisLine={false} width={28} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(value) => format(new Date(`${String(value)}T00:00:00`), "MMMM d, yyyy")}
                  />
                }
              />
              <Area
                yAxisId="mood"
                dataKey="moodScore"
                type="monotone"
                stroke="var(--color-moodScore)"
                fill="url(#fillMoodScore)"
                strokeWidth={2}
                dot={false}
              />
              <Area
                yAxisId="sessions"
                dataKey="sessions"
                type="monotone"
                stroke="var(--color-sessions)"
                fill="url(#fillSessions)"
                strokeWidth={2}
                dot={false}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
        </ChartContainer>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/60 bg-background/50 p-3">
            <p className="text-xs text-muted-foreground">Average Mood</p>
            <p className="text-lg font-semibold">{avgMood !== null ? `${avgMood}/100` : "N/A"}</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/50 p-3">
            <p className="text-xs text-muted-foreground">Total Sessions</p>
            <p className="text-lg font-semibold">{totalSessions}</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/50 p-3">
            <p className="text-xs text-muted-foreground">Mood Logs</p>
            <p className="text-lg font-semibold">{loading ? "..." : moods.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
