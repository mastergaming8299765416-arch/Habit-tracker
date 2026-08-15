"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ScoreGraph({ scores, maxScore }) {
  return (
    <div className="bg-surface border border-sand rounded-2xl p-4">
      <h3 className="font-serif text-lg mb-2">Daily Habits Score</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={scores} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8DFCF" />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, maxScore]} tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            formatter={(value) => [`${value} habits`, "Score"]}
            labelFormatter={(label) => `Day ${label}`}
          />
          <Line type="monotone" dataKey="score" stroke="#8FA98B" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
