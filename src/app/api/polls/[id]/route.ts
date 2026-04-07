import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, polls, pollQuestions } from "@/lib/db";
import { eq } from "drizzle-orm";
import { PollStatus } from "@/types/poll";

const COOKIE_NAME = "dashboard_auth";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(COOKIE_NAME);
  return authCookie?.value === "authenticated";
}

// GET /api/polls/[id] - Get a single poll (public for active polls)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const poll = await db.select().from(polls).where(eq(polls.id, id)).limit(1);

    if (poll.length === 0) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    const questions = await db
      .select()
      .from(pollQuestions)
      .where(eq(pollQuestions.pollId, id))
      .orderBy(pollQuestions.orderIndex);

    return NextResponse.json({
      ...poll[0],
      questions: questions.map((q) => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : undefined,
        optionsEn: q.optionsEn ? JSON.parse(q.optionsEn) : undefined,
      })),
    });
  } catch (error) {
    console.error("Error fetching poll:", error);
    return NextResponse.json({ error: "Failed to fetch poll" }, { status: 500 });
  }
}

// PUT /api/polls/[id] - Update a poll
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      titleEn,
      description,
      descriptionEn,
      logoUrl,
      status,
      questions,
    } = body;

    // Update poll
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (titleEn !== undefined) updateData.titleEn = titleEn || null;
    if (description !== undefined) updateData.description = description || null;
    if (descriptionEn !== undefined)
      updateData.descriptionEn = descriptionEn || null;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl || null;
    if (status !== undefined) updateData.status = status as PollStatus;

    if (Object.keys(updateData).length > 0) {
      await db.update(polls).set(updateData).where(eq(polls.id, id));
    }

    // If questions are provided, replace them
    if (questions) {
      // Delete existing questions
      await db.delete(pollQuestions).where(eq(pollQuestions.pollId, id));

      // Insert new questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await db.insert(pollQuestions).values({
          pollId: id,
          type: q.type,
          question: q.question,
          questionEn: q.questionEn || null,
          options: q.options?.length > 0 ? JSON.stringify(q.options) : null,
          optionsEn: q.optionsEn?.length > 0 ? JSON.stringify(q.optionsEn) : null,
          required: q.required ?? true,
          orderIndex: i,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating poll:", error);
    return NextResponse.json({ error: "Failed to update poll" }, { status: 500 });
  }
}

// DELETE /api/polls/[id] - Delete a poll
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await db.delete(polls).where(eq(polls.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting poll:", error);
    return NextResponse.json({ error: "Failed to delete poll" }, { status: 500 });
  }
}
