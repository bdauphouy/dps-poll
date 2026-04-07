import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, polls, pollQuestions, pollResponses } from "@/lib/db";
import { eq, count } from "drizzle-orm";
import { nanoid } from "nanoid";
import { PollStatus } from "@/types/poll";

const COOKIE_NAME = "dashboard_auth";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(COOKIE_NAME);
  return authCookie?.value === "authenticated";
}

// GET /api/polls - List all polls
export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allPolls = await db.select().from(polls).orderBy(polls.createdAt);

    // Get questions and response count for each poll
    const pollsWithDetails = await Promise.all(
      allPolls.map(async (poll) => {
        const questions = await db
          .select()
          .from(pollQuestions)
          .where(eq(pollQuestions.pollId, poll.id))
          .orderBy(pollQuestions.orderIndex);

        const responseCountResult = await db
          .select({ count: count() })
          .from(pollResponses)
          .where(eq(pollResponses.pollId, poll.id));

        return {
          ...poll,
          questions: questions.map((q) => ({
            ...q,
            options: q.options ? JSON.parse(q.options) : undefined,
            optionsEn: q.optionsEn ? JSON.parse(q.optionsEn) : undefined,
          })),
          responseCount: responseCountResult[0]?.count || 0,
        };
      })
    );

    return NextResponse.json(pollsWithDetails);
  } catch (error) {
    console.error("Error fetching polls:", error);
    return NextResponse.json({ error: "Failed to fetch polls" }, { status: 500 });
  }
}

// POST /api/polls - Create a new poll
export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      titleEn,
      description,
      descriptionEn,
      logoUrl,
      questions,
      status = "draft",
    } = body;

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Title and at least one question are required" },
        { status: 400 }
      );
    }

    const pollId = nanoid(10);

    // Create poll
    await db.insert(polls).values({
      id: pollId,
      title,
      titleEn: titleEn || null,
      description: description || null,
      descriptionEn: descriptionEn || null,
      logoUrl: logoUrl || null,
      status: status as PollStatus,
    });

    // Create questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await db.insert(pollQuestions).values({
        pollId,
        type: q.type,
        question: q.question,
        questionEn: q.questionEn || null,
        options: q.options?.length > 0 ? JSON.stringify(q.options) : null,
        optionsEn: q.optionsEn?.length > 0 ? JSON.stringify(q.optionsEn) : null,
        required: q.required ?? true,
        orderIndex: i,
      });
    }

    return NextResponse.json({ id: pollId, success: true });
  } catch (error) {
    console.error("Error creating poll:", error);
    return NextResponse.json({ error: "Failed to create poll" }, { status: 500 });
  }
}
