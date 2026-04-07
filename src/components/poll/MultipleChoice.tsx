"use client";

interface MultipleChoiceProps {
  id: string;
  question: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function MultipleChoice({
  id,
  question,
  options,
  value,
  onChange,
}: MultipleChoiceProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold leading-snug">{question}</h2>

      <div className="space-y-2">
        {options.map((option, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onChange(option)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all cursor-pointer ${
              value === option
                ? "bg-primary text-white"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                value === option
                  ? "border-white bg-white"
                  : "border-muted-foreground/50"
              }`}
            >
              {value === option && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </div>
            <span className="text-[15px]">{option}</span>
          </button>
        ))}
      </div>

      <input type="hidden" name={id} value={value} />
    </div>
  );
}
