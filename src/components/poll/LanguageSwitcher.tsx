"use client";

import { useRouter } from "next/navigation";

interface LanguageSwitcherProps {
  currentLang: string;
}

export function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
  const router = useRouter();

  const switchLanguage = (lang: string) => {
    if (lang === "es") {
      router.push("/");
    } else {
      router.push(`/${lang}`);
    }
  };

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        type="button"
        onClick={() => switchLanguage("es")}
        className={`px-2 py-1 rounded transition-colors duration-200 ${
          currentLang === "es"
            ? "text-neutral-900 font-medium"
            : "text-neutral-500 hover:text-neutral-700"
        }`}
      >
        ES
      </button>
      <span className="text-neutral-300">/</span>
      <button
        type="button"
        onClick={() => switchLanguage("en")}
        className={`px-2 py-1 rounded transition-colors duration-200 ${
          currentLang === "en"
            ? "text-neutral-900 font-medium"
            : "text-neutral-500 hover:text-neutral-700"
        }`}
      >
        EN
      </button>
    </div>
  );
}
