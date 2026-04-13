import { NextResponse } from "next/server";
import { db, polls } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/polls/[id]/og-image - Get poll logo as an image for Open Graph
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const poll = await db
      .select({ logoUrl: polls.logoUrl })
      .from(polls)
      .where(eq(polls.id, id))
      .limit(1);

    if (poll.length === 0 || !poll[0].logoUrl) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const logoUrl = poll[0].logoUrl;

    // Check if it's a data URL (base64)
    if (logoUrl.startsWith("data:")) {
      // Parse the data URL
      const matches = logoUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json(
          { error: "Invalid image format" },
          { status: 400 }
        );
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const imageBuffer = Buffer.from(base64Data, "base64");

      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // If it's a regular URL, redirect to it
    return NextResponse.redirect(logoUrl);
  } catch (error) {
    console.error("Error fetching poll logo:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
