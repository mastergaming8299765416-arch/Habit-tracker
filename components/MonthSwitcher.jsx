"use client";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function MonthSwitcher({ year, month, onChange }) {
  function shift(delta) {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y += 1; }
    if (m < 1) { m = 12; y -= 1; }
    onChange(y, m);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => shift(-1)}
        className="w-8 h-8 rounded-full border border-sand bg-white hover:bg-sagelight flex items-center justify-center"
        aria-label="Previous month"
      >
        ‹
      </button>
      <div className="font-serif text-lg w-40 text-center">
        {MONTH_NAMES[month - 1]} {year}
      </div>
      <button
        onClick={() => shift(1)}
        className="w-8 h-8 rounded-full border border-sand bg-white hover:bg-sagelight flex items-center justify-center"
        aria-label="Next month"
      >
        ›
      </button>
    </div>
  );
}
