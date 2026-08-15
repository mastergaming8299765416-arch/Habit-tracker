"use client";

export default function StatsCards({ totalHabits, avgCompletion, bestDay, longestStreak }) {
  const cards = [
    { label: "Habits Tracked", value: totalHabits },
    { label: "Avg. Completion", value: `${avgCompletion}%` },
    { label: "Best Day", value: bestDay ? `Day ${bestDay.day} (${bestDay.score})` : "—" },
    { label: "Longest Streak", value: `${longestStreak} days` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="bg-surface border border-sand rounded-xl p-4 text-center">
          <div className="text-2xl font-serif text-sage">{c.value}</div>
          <div className="text-xs text-ink/50 mt-1">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
