// All functions take: habits (array), logs (array of {habit_id, log_date, status}), daysInMonth (int)

export function buildLogMap(logs) {
  // { "habitId|YYYY-MM-DD": status }
  const map = {};
  for (const log of logs) {
    map[`${log.habit_id}|${log.log_date}`] = log.status;
  }
  return map;
}

export function dailyScores(habits, logMap, year, month, daysInMonth) {
  const scores = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = toDateStr(year, month, d);
    let score = 0;
    for (const h of habits) {
      const status = logMap[`${h.id}|${dateStr}`];
      if (status === "done") score += 1;
      else if (status === "partial") score += 0.5;
    }
    scores.push({ day: d, score });
  }
  return scores;
}

export function habitCompletionPct(habit, logMap, year, month, daysInMonth) {
  let doneCount = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = toDateStr(year, month, d);
    const status = logMap[`${habit.id}|${dateStr}`];
    if (status === "done") doneCount += 1;
    else if (status === "partial") doneCount += 0.5;
  }
  return Math.round((doneCount / daysInMonth) * 100);
}

export function currentAndLongestStreak(habit, logMap, year, month, daysInMonth, today) {
  let longest = 0;
  let running = 0;
  let current = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = toDateStr(year, month, d);
    const status = logMap[`${habit.id}|${dateStr}`];
    if (status === "done") {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }

  // current streak: count backwards from today (or last day of month if viewing a past month)
  const lastDay = isCurrentMonth(year, month, today) ? today.getDate() : daysInMonth;
  for (let d = lastDay; d >= 1; d--) {
    const dateStr = toDateStr(year, month, d);
    const status = logMap[`${habit.id}|${dateStr}`];
    if (status === "done") current += 1;
    else break;
  }

  return { current, longest };
}

export function bestDay(scores) {
  if (!scores.length) return null;
  return scores.reduce((best, s) => (s.score > best.score ? s : best), scores[0]);
}

export function toDateStr(year, month, day) {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function isCurrentMonth(year, month, today) {
  return today.getFullYear() === year && today.getMonth() + 1 === month;
}
