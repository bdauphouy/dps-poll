import { NextResponse } from "next/server";
import { translateTexts } from "@/lib/translate";

export async function POST(request: Request) {
  try {
    const { texts, source = "es", target = "en" } = await request.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json(
        { error: "texts array is required" },
        { status: 400 }
      );
    }

    const translations = await translateTexts(texts, source, target);

    return NextResponse.json({
      translations,
      source,
      target,
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      {
        error: "Translation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
