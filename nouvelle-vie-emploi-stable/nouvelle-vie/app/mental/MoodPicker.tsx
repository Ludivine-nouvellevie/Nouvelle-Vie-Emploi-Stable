"use client";

import { useState } from "react";

const OPTIONS = [
  { value: "tres_motive", label: "Très motivé(e)", emoji: "🤩" },
  { value: "motive", label: "Motivé(e)", emoji: "🙂" },
  { value: "peu_motive", label: "Peu motivé(e)", emoji: "😐" },
  { value: "demoralise", label: "Démoralisé(e)", emoji: "😔" },
];

export default function MoodPicker({ name }: { name: string }) {
  const [selected, setSelected] = useState("motive");

  return (
    <div className="grid grid-cols-2 gap-2">
      <input type="hidden" name={name} value={selected} />
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setSelected(opt.value)}
          className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-medium transition-colors ${
            selected === opt.value
              ? "border-navy bg-navy text-white"
              : "border-line bg-white text-navy"
          }`}
        >
          <span className="text-lg">{opt.emoji}</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
