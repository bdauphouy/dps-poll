"use client";

import { useState } from "react";

interface RatingScaleProps {
  id: string;
  question: string;
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
  isEnglish?: boolean;
}

export function RatingScale({
  id,
  question,
  value,
  onChange,
  isEnglish = false,
}: RatingScaleProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold leading-snug">{question}</h2>

      <div>
        <div className="flex gap-2 sm:gap-3 justify-center">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => onChange(rating)}
              onMouseEnter={() => setHovered(rating)}
              onMouseLeave={() => setHovered(null)}
              className={`
                w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center
                text-base font-medium transition-all duration-150 cursor-pointer
                ${
                  value === rating
                    ? "bg-primary text-white"
                    : hovered !== null && hovered >= rating
                    ? "bg-secondary/80 text-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }
              `}
              aria-label={`Rate ${rating} out of 5`}
            >
              {rating}
            </button>
          ))}
        </div>

        <div className="flex justify-between text-xs text-muted-foreground mt-3 px-1 max-w-[280px] mx-auto">
          <span>{isEnglish ? "Not satisfied" : "No satisfecho"}</span>
          <span>{isEnglish ? "Very satisfied" : "Muy satisfecho"}</span>
        </div>
      </div>

      <input type="hidden" name={id} value={value} />
    </div>
  );
}
