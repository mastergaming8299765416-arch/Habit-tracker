"use client";

import { toDateStr } from "@/lib/utils/streaks";

// Cycles: not_done -> done -> partial -> not_done
function nextStatus(current) {
  if (current === "done") return "partial";
  if (current === "partial") return "not_done";
  return "done";
}

function cellClass(status) {
  if (status === "done") return "cell cell-done";
  if (status === "partial") return "cell cell-partial";
  return "cell cell-empty";
}

function cellGlyph(status) {
  if (status === "done") return "✓";
  if (status === "partial") return "•";
  return "";
}

export default function HabitGrid({ habits, logMap, year, month, daysInMonth, onToggle, readOnly = false }) {
  if (habits.length === 0) {
    return (
      <div className="text-center py-16 text-ink/50 text-sm">
        No habits yet. Add your first habit to start tracking.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 bg-cream text-left text-sm font-medium px-3 py-2 min-w-[160px]">
              Habit
            </th>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
              <th key={d} className="text-xs font-normal text-ink/50 w-9 text-center pb-1">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {habits.map((h) => (
            <tr key={h.id}>
              <td className="sticky left-0 bg-cream text-sm px-3 py-1 whitespace-nowrap">{h.name}</td>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                const dateStr = toDateStr(year, month, d);
                const key = `${h.id}|${dateStr}`;
                const status = logMap[key] || "not_done";
                return (
                  <td key={d} className="p-0.5 text-center">
                    <div
                      className={cellClass(status)}
                      onClick={() => !readOnly && onToggle(h.id, dateStr, nextStatus(status))}
                      role={readOnly ? undefined : "button"}
                      title={status.replace("_", " ")}
                    >
                      {cellGlyph(status)}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-ink/40 mt-2">Tap a cell to cycle: empty → done → partial → empty</p>
    </div>
  );
}
