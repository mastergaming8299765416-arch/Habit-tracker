"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import HabitGrid from "@/components/HabitGrid";
import { buildLogMap, habitCompletionPct, currentAndLongestStreak } from "@/lib/utils/streaks";

function daysInMonthOf(year, month) {
  return new Date(year, month, 0).getDate();
}

export default function AdminDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const daysInMonth = daysInMonthOf(year, month);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({ total: 0, activeWeek: 0, activeMonth: 0, topHabits: [] });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(profiles || []);

    // basic analytics
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data: recentLogsWeek } = await supabase
      .from("daily_logs")
      .select("user_id, log_date")
      .gte("log_date", weekAgo);
    const { data: recentLogsMonth } = await supabase
      .from("daily_logs")
      .select("user_id")
      .like("log_date", `${monthKey}%`);
    const { data: allHabits } = await supabase.from("habits").select("name");

    const activeWeekSet = new Set((recentLogsWeek || []).map((l) => l.user_id));
    const activeMonthSet = new Set((recentLogsMonth || []).map((l) => l.user_id));

    const nameCounts = {};
    for (const h of allHabits || []) {
      const key = h.name.trim().toLowerCase();
      nameCounts[key] = (nameCounts[key] || 0) + 1;
    }
    const topHabits = Object.entries(nameCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    setAnalytics({
      total: (profiles || []).length,
      activeWeek: activeWeekSet.size,
      activeMonth: activeMonthSet.size,
      topHabits,
    });

    setLoading(false);
  }, [supabase, monthKey]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function viewUser(user) {
    setSelectedUser(user);
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
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/secure-admin-x7q9");
  }

  const logMap = buildLogMap(logs);

  return (
    <div className="min-h-screen bg-ink text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-medium">Admin — read only</h1>
          <button onClick={handleLogout} className="text-sm text-white/60 hover:text-white">
            Log out
          </button>
        </div>

        {loading ? (
          <p className="text-white/50">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl">{analytics.total}</div>
                <div className="text-xs text-white/50">Total Users</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl">{analytics.activeWeek}</div>
                <div className="text-xs text-white/50">Active This Week</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl">{analytics.activeMonth}</div>
                <div className="text-xs text-white/50">Active This Month</div>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4 mb-8">
              <h3 className="text-sm font-medium mb-2">Most Common Habits</h3>
              {analytics.topHabits.length === 0 ? (
                <p className="text-white/40 text-sm">No data yet.</p>
              ) : (
                <ul className="text-sm text-white/80 space-y-1">
                  {analytics.topHabits.map((h) => (
                    <li key={h.name} className="flex justify-between">
                      <span className="capitalize">{h.name}</span>
                      <span className="text-white/50">{h.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-xl p-4 md:col-span-1">
                <h3 className="text-sm font-medium mb-3">Users</h3>
                <ul className="space-y-1 max-h-[500px] overflow-y-auto">
                  {users.map((u) => (
                    <li key={u.id}>
                      <button
                        onClick={() => viewUser(u)}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-sm ${
                          selectedUser?.id === u.id ? "bg-sage text-white" : "hover:bg-white/10 text-white/80"
                        }`}
                      >
                        {u.email}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 md:col-span-2 text-ink">
                {!selectedUser ? (
                  <p className="text-ink/50 text-sm">Select a user to view their current-month grid (read-only).</p>
                ) : (
                  <>
                    <h3 className="font-serif text-lg mb-3">{selectedUser.email} — {monthKey}</h3>
                    <HabitGrid
                      habits={habits}
                      logMap={logMap}
                      year={year}
                      month={month}
                      daysInMonth={daysInMonth}
                      onToggle={() => {}}
                      readOnly
                    />
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
