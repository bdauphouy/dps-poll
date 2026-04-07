import { NextResponse } from "next/server";
import { db, polls, pollResponses } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getGeoLocation, getClientIP } from "@/lib/geo";

// POST /api/polls/[id]/submit - Submit a response to a poll
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { answers } = body;

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json(
        { error: "Answers are required" },
        { status: 400 }
      );
    }

    // Check if poll exists and is active
    const poll = await db.select().from(polls).where(eq(polls.id, id)).limit(1);

    if (poll.length === 0) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    if (poll[0].status !== "active") {
      return NextResponse.json({ error: "Poll is not accepting responses" }, { status: 400 });
    }

    // Get geolocation
    const ip = getClientIP(request);
    const geo = await getGeoLocation(ip);

    // Save response
    await db.insert(pollResponses).values({
      pollId: id,
      answers: JSON.stringify(answers),
      ipAddress: geo.ip,
      country: geo.country,
      city: geo.city,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting poll response:", error);
    return NextResponse.json(
      { error: "Failed to submit response" },
      { status: 500 }
    );
  }
}
