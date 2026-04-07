"use client";

interface EmailFieldProps {
  id: string;
  question: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function EmailField({ id, question, value, onChange }: EmailFieldProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold leading-snug">{question}</h2>
      <input
        type="email"
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="your@email.com"
        className="w-full h-14 px-4 bg-secondary rounded-xl text-[15px] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
