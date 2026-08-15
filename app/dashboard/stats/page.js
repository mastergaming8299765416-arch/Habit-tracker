"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/DashboardNav";
import MonthSwitcher from "@/components/MonthSwitcher";
import StatsCards from "@/components/StatsCards";
import {
  buildLogMap,
  dailyScores,
  habitCompletionPct,
  currentAndLongestStreak,
  bestDay as computeBestDay,
} from "@/lib/utils/streaks";

function daysInMonthOf(year, month) {
  return new Date(year, month, 0).getDate();
}

export default function StatsPage() {
  const supabase = createClient();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const daysInMonth = daysInMonthOf(year, month);

  const load = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: habitsData } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", monthKey)
      .eq("archived", false)
      .order("position", { ascending: true });

    const habitIds = (habitsData || []).map((h) => h.id);
    let logsData = [];
    if (habitIds.length > 0) {
      const { data } = await supabase.from("daily_logs").select("*").in("habit_id", habitIds);
      logsData = data || [];
    }

    setHabits(habitsData || []);
    setLogs(logsData);
    setLoading(false);
  }, [monthKey, supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const logMap = buildLogMap(logs);
  const scores = dailyScores(habits, logMap, year, month, daysInMonth);
  const best = computeBestDay(scores);

  const habitStats = habits.map((h) => {
    const pct = habitCompletionPct(h, logMap, year, month, daysInMonth);
    const { current, longest } = currentAndLongestStreak(h, logMap, year, month, daysInMonth, today);
    return { ...h, pct, current, longest };
  });

  const avgCompletion = habitStats.length
    ? Math.round(habitStats.reduce((sum, h) => sum + h.pct, 0) / habitStats.length)
    : 0;
  const longestOverall = habitStats.reduce((max, h) => Math.max(max, h.longest), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <DashboardNav />

      <div className="mb-6">
        <MonthSwitcher year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
      </div>

      {loading ? (
        <div className="text-center py-16 text-ink/50">Loading...</div>
      ) : (
        <>
          <StatsCards
            totalHabits={habits.length}
            avgCompletion={avgCompletion}
            bestDay={best}
            longestStreak={longestOverall}
          />

          <div className="bg-surface border border-sand rounded-2xl p-4 mt-6">
            <h3 className="font-serif text-lg mb-3">Per-Habit Breakdown</h3>
            {habitStats.length === 0 ? (
              <p className="text-sm text-ink/50">No habits tracked this month.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink/50 text-xs">
                    <th className="pb-2">Habit</th>
                    <th className="pb-2">Completion</th>
                    <th className="pb-2">Current Streak</th>
                    <th className="pb-2">Longest Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {habitStats.map((h) => (
                    <tr key={h.id} className="border-t border-sand/60">
                      <td className="py-2">{h.name}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-sand rounded-full overflow-hidden">
                            <div className="h-full bg-sage" style={{ width: `${h.pct}%` }} />
                          </div>
                          <span className="text-xs text-ink/60">{h.pct}%</span>
                        </div>
                      </td>
                      <td className="py-2">{h.current} days</td>
                      <td className="py-2">{h.longest} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
