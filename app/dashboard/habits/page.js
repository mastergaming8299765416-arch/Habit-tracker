"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/DashboardNav";
import MonthSwitcher from "@/components/MonthSwitcher";

export default function ManageHabitsPage() {
  const supabase = createClient();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [habits, setHabits] = useState([]);
  const [newName, setNewName] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const monthKey = `${year}-${String(month).padStart(2, "0")}`;

  const load = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", monthKey)
      .eq("archived", false)
      .order("position", { ascending: true });

    setHabits(data || []);
    setLoading(false);
  }, [monthKey, supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function addHabit(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    const position = habits.length;
    const { data, error } = await supabase
      .from("habits")
      .insert({ user_id: userId, name: newName.trim(), month: monthKey, position })
      .select()
      .single();
    if (!error && data) {
      setHabits((prev) => [...prev, data]);
      setNewName("");
    }
  }

  async function renameHabit(id, name) {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, name } : h)));
    await supabase.from("habits").update({ name }).eq("id", id);
  }

  async function deleteHabit(id) {
    if (!confirm("Delete this habit? Its daily logs for this month will be removed too.")) return;
    setHabits((prev) => prev.filter((h) => h.id !== id));
    await supabase.from("habits").delete().eq("id", id);
  }

  async function move(id, direction) {
    const idx = habits.findIndex((h) => h.id === id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= habits.length) return;
    const reordered = [...habits];
    [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];
    setHabits(reordered);

    await Promise.all(
      reordered.map((h, i) => supabase.from("habits").update({ position: i }).eq("id", h.id))
    );
  }

  async function carryOverFromPreviousMonth() {
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const prevMonthKey = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;

    const { data: prevHabits } = await supabase
      .from("habits")
      .select("name, position")
      .eq("user_id", userId)
      .eq("month", prevMonthKey)
      .eq("archived", false)
      .order("position", { ascending: true });

    if (!prevHabits || prevHabits.length === 0) {
      alert("No habits found in the previous month.");
      return;
    }

    const toInsert = prevHabits.map((h) => ({
      user_id: userId,
      name: h.name,
      month: monthKey,
      position: h.position,
    }));

    const { data, error } = await supabase.from("habits").insert(toInsert).select();
    if (!error && data) {
      setHabits((prev) => [...prev, ...data].sort((a, b) => a.position - b.position));
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <DashboardNav />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <MonthSwitcher year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
        <button
          onClick={carryOverFromPreviousMonth}
          className="text-sm border border-sand rounded-lg px-3 py-1.5 bg-white hover:bg-sagelight"
        >
          Carry over from previous month
        </button>
      </div>

      <form onSubmit={addHabit} className="flex gap-2 mb-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New habit name (e.g. Read 10 pages)"
          className="flex-1 rounded-lg border border-sand px-3 py-2 outline-none focus:border-sage"
        />
        <button type="submit" className="bg-sage text-white rounded-lg px-4 py-2 hover:opacity-90">
          Add
        </button>
      </form>

      {loading ? (
        <div className="text-center py-10 text-ink/50">Loading...</div>
      ) : habits.length === 0 ? (
        <div className="text-center py-10 text-ink/50 text-sm">
          No habits for {monthKey} yet. Add one above or carry over last month's list.
        </div>
      ) : (
        <ul className="space-y-2">
          {habits.map((h, i) => (
            <li key={h.id} className="flex items-center gap-2 bg-white border border-sand rounded-lg px-3 py-2">
              <div className="flex flex-col">
                <button onClick={() => move(h.id, -1)} disabled={i === 0} className="text-ink/40 hover:text-ink disabled:opacity-20 leading-none">▲</button>
                <button onClick={() => move(h.id, 1)} disabled={i === habits.length - 1} className="text-ink/40 hover:text-ink disabled:opacity-20 leading-none">▼</button>
              </div>
              <input
                value={h.name}
                onChange={(e) => renameHabit(h.id, e.target.value)}
                className="flex-1 outline-none bg-transparent"
              />
              <button onClick={() => deleteHabit(h.id)} className="text-rose text-sm hover:underline">
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
