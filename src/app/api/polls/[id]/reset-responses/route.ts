import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, pollResponses, pageViews } from "@/lib/db";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "dashboard_auth";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(COOKIE_NAME);
  return authCookie?.value === "authenticated";
}

// DELETE /api/polls/[id]/reset-responses - Reset all responses for a poll
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Delete all responses for this poll
    await db.delete(pollResponses).where(eq(pollResponses.pollId, id));

    // Delete all page views for this poll
    await db.delete(pageViews).where(eq(pageViews.pollId, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resetting poll responses:", error);
    return NextResponse.json(
      { error: "Failed to reset responses" },
      { status: 500 }
    );
  }
}
