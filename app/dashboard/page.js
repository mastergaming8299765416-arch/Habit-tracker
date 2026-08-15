"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/DashboardNav";
import MonthSwitcher from "@/components/MonthSwitcher";
import HabitGrid from "@/components/HabitGrid";
import ScoreGraph from "@/components/ScoreGraph";
import { buildLogMap, dailyScores } from "@/lib/utils/streaks";
import { exportGridToCSV } from "@/lib/utils/csvExport";

const QUOTES = [
  "Small habits today, extraordinary results tomorrow.",
  "You don't have to be great to start, but you have to start to be great.",
  "Consistency is what transforms average into excellence.",
  "Progress is progress, no matter how small.",
  "Discipline is choosing what you want most over what you want now.",
];

function daysInMonthOf(year, month) {
  return new Date(year, month, 0).getDate();
}

export default function DashboardPage() {
  const supabase = createClient();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const daysInMonth = daysInMonthOf(year, month);
  const quote = QUOTES[(year * 12 + month) % QUOTES.length];

  const loadData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

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
      const { data } = await supabase
        .from("daily_logs")
        .select("*")
        .in("habit_id", habitIds);
      logsData = data || [];
    }

    setHabits(habitsData || []);
    setLogs(logsData);
    setLoading(false);
  }, [monthKey, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const logMap = buildLogMap(logs);
  const scores = dailyScores(habits, logMap, year, month, daysInMonth);

  async function handleToggle(habitId, dateStr, newStatus) {
    // optimistic update
    setLogs((prev) => {
      const existingIdx = prev.findIndex((l) => l.habit_id === habitId && l.log_date === dateStr);
      const copy = [...prev];
      if (existingIdx >= 0) {
        copy[existingIdx] = { ...copy[existingIdx], status: newStatus };
      } else {
        copy.push({ habit_id: habitId, log_date: dateStr, status: newStatus, user_id: userId });
      }
      return copy;
    });

    await supabase
      .from("daily_logs")
      .upsert(
        { habit_id: habitId, user_id: userId, log_date: dateStr, status: newStatus },
        { onConflict: "habit_id,log_date" }
      );
  }

  function handleExport() {
    exportGridToCSV(habits, logMap, year, month, daysInMonth, monthKey);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <DashboardNav />

      <div className="bg-sagelight border border-sage/30 rounded-xl px-4 py-3 mb-6 text-sm text-ink/80 italic">
        "{quote}"
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <MonthSwitcher year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
        <button
          onClick={handleExport}
          disabled={habits.length === 0}
          className="text-sm border border-sand rounded-lg px-3 py-1.5 bg-white hover:bg-sagelight disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-ink/50">Loading...</div>
      ) : (
        <>
          <div className="bg-white border border-sand rounded-2xl p-4 mb-6">
            <HabitGrid
              habits={habits}
              logMap={logMap}
              year={year}
              month={month}
              daysInMonth={daysInMonth}
              onToggle={handleToggle}
            />
          </div>

          <ScoreGraph scores={scores} maxScore={habits.length} />
        </>
      )}
    </div>
  );
}
