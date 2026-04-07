interface DeepLTranslation {
  detected_source_language: string;
  text: string;
}

interface DeepLResponse {
  translations: DeepLTranslation[];
}

// DeepL language codes mapping
const DEEPL_LANG_MAP: Record<string, string> = {
  es: "ES",
  en: "EN",
  fr: "FR",
  de: "DE",
  it: "IT",
  pt: "PT",
  nl: "NL",
  pl: "PL",
  ru: "RU",
  ja: "JA",
  zh: "ZH",
};

function getDeepLLangCode(lang: string): string {
  return DEEPL_LANG_MAP[lang.toLowerCase()] || lang.toUpperCase();
}

export async function translateText(
  text: string,
  sourceLang: string = "es",
  targetLang: string = "en"
): Promise<string> {
  const apiKey = process.env.DEEPL_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPL_API_KEY environment variable is not set");
  }

  // DeepL free tier uses api-free.deepl.com
  const url = "https://api-free.deepl.com/v2/translate";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `DeepL-Auth-Key ${apiKey}`,
      },
      body: JSON.stringify({
        text: [text],
        source_lang: getDeepLLangCode(sourceLang),
        target_lang: getDeepLLangCode(targetLang),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Translation failed: ${response.statusText} - ${errorText}`);
    }

    const data: DeepLResponse = await response.json();
    return data.translations[0].text;
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
}

export async function translateTexts(
  texts: string[],
  sourceLang: string = "es",
  targetLang: string = "en"
): Promise<string[]> {
  const apiKey = process.env.DEEPL_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPL_API_KEY environment variable is not set");
  }

  if (texts.length === 0) {
    return [];
  }

  const url = "https://api-free.deepl.com/v2/translate";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `DeepL-Auth-Key ${apiKey}`,
      },
      body: JSON.stringify({
        text: texts,
        source_lang: getDeepLLangCode(sourceLang),
        target_lang: getDeepLLangCode(targetLang),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Translation failed: ${response.statusText} - ${errorText}`);
    }

    const data: DeepLResponse = await response.json();
    return data.translations.map((t) => t.text);
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
}

export async function translatePollContent(
  content: Record<string, string>,
  sourceLang: string = "es",
  targetLang: string = "en"
): Promise<Record<string, string>> {
  const translated: Record<string, string> = {};

  for (const [key, value] of Object.entries(content)) {
    try {
      translated[key] = await translateText(value, sourceLang, targetLang);
    } catch {
      translated[key] = value; // Fallback to original if translation fails
    }
  }

  return translated;
}
