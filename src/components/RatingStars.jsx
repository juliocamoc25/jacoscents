import React from "react";

export default function RatingStars({ value, size = "text-xs" }) {
  if (!value || value <= 0) return null;
  return (
    <span className={`inline-flex items-center gap-0.5 ${size}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(value) ? "text-gold-500" : "text-neutral-200"}>★</span>
      ))}
    </span>
  );
}
