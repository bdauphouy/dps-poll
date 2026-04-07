import { NextResponse } from "next/server";
import { db, pageViews } from "@/lib/db";
import { getGeoLocation, getClientIP } from "@/lib/geo";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Get geolocation from IP
    const ip = getClientIP(request);
    const geo = await getGeoLocation(ip);

    // Insert page view
    await db.insert(pageViews).values({
      pollId: body.pollId || null,
      ipAddress: geo.ip,
      country: geo.country,
      city: geo.city,
      userAgent: request.headers.get("user-agent") || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking page view:", error);
    return NextResponse.json(
      { error: "Failed to track page view" },
      { status: 500 }
    );
  }
}
