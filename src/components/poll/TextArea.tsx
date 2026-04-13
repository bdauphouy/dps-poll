"use client";

interface TextAreaProps {
  id: string;
  question: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  isEnglish?: boolean;
}

export function TextArea({
  id,
  question,
  value,
  onChange,
  isEnglish = false,
}: TextAreaProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold leading-snug">{question}</h2>
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          isEnglish ? "Type your answer here..." : "Escribe tu respuesta aquí..."
        }
        rows={5}
        className="w-full p-4 bg-secondary rounded-xl text-[15px] outline-none resize-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
