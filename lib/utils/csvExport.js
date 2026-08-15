export function exportGridToCSV(habits, logMap, year, month, daysInMonth, monthLabel) {
  const header = ["Habit", ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const rows = [header];

  for (const h of habits) {
    const row = [h.name];
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(month).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      const status = logMap[`${h.id}|${year}-${mm}-${dd}`] || "";
      row.push(status === "done" ? "1" : status === "partial" ? "0.5" : "0");
    }
    rows.push(row);
  }

  const csvContent = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `habit-tracker-${monthLabel}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
