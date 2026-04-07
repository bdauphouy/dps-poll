"use client";

interface CheckboxProps {
  id: string;
  question: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  required?: boolean;
}

export function Checkbox({
  id,
  question,
  options,
  value,
  onChange,
}: CheckboxProps) {
  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold leading-snug">{question}</h2>

      <div className="space-y-2">
        {options.map((option, index) => {
          const isSelected = value.includes(option);
          return (
            <button
              key={index}
              type="button"
              onClick={() => toggleOption(option)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-primary text-white"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              <div
                className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                  isSelected
                    ? "bg-white"
                    : "border-2 border-muted-foreground/50"
                }`}
              >
                {isSelected && (
                  <svg
                    className="w-3 h-3 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span className="text-[15px]">{option}</span>
            </button>
          );
        })}
      </div>

      <input type="hidden" name={id} value={JSON.stringify(value)} />
    </div>
  );
}
