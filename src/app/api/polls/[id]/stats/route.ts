import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, polls, pollQuestions, pollResponses, pageViews } from "@/lib/db";
import { eq, count, desc } from "drizzle-orm";

const COOKIE_NAME = "dashboard_auth";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(COOKIE_NAME);
  return authCookie?.value === "authenticated";
}

// GET /api/polls/[id]/stats - Get poll statistics
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get poll
    const pollResult = await db.select().from(polls).where(eq(polls.id, id)).limit(1);

    if (pollResult.length === 0) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    const poll = pollResult[0];

    // Get questions
    const questions = await db
      .select()
      .from(pollQuestions)
      .where(eq(pollQuestions.pollId, id))
      .orderBy(pollQuestions.orderIndex);

    // Get all responses
    const responses = await db
      .select()
      .from(pollResponses)
      .where(eq(pollResponses.pollId, id))
      .orderBy(desc(pollResponses.createdAt));

    // Get total views
    const viewsResult = await db
      .select({ count: count() })
      .from(pageViews)
      .where(eq(pageViews.pollId, id));

    const totalViews = viewsResult[0]?.count || 0;

    // Calculate stats for each question
    const questionStats = questions.map((question) => {
      const responseCounts: Record<string, number> = {};

      responses.forEach((response) => {
        const answers = JSON.parse(response.answers);
        const answer = answers[question.id.toString()];

        if (answer !== undefined && answer !== null && answer !== "") {
          if (Array.isArray(answer)) {
            // Checkbox - count each selected option
            answer.forEach((opt: string) => {
              responseCounts[opt] = (responseCounts[opt] || 0) + 1;
            });
          } else {
            const key = String(answer);
            responseCounts[key] = (responseCounts[key] || 0) + 1;
          }
        }
      });

      return {
        questionId: question.id,
        question: question.question,
        type: question.type,
        options: question.options ? JSON.parse(question.options) : undefined,
        responses: Object.entries(responseCounts)
          .map(([value, cnt]) => ({
            value: question.type === "rating" ? parseInt(value) : value,
            count: cnt,
          }))
          .sort((a, b) => b.count - a.count),
      };
    });

    // Country breakdown
    const countryMap: Record<string, number> = {};
    responses.forEach((response) => {
      const country = response.country || "Unknown";
      countryMap[country] = (countryMap[country] || 0) + 1;
    });

    const countryBreakdown = Object.entries(countryMap)
      .map(([country, cnt]) => ({
        country,
        count: cnt,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      poll: {
        ...poll,
        questions: questions.map((q) => ({
          ...q,
          options: q.options ? JSON.parse(q.options) : undefined,
        })),
      },
      totalResponses: responses.length,
      totalViews,
      questionStats,
      countryBreakdown,
      recentResponses: responses.slice(0, 20).map((r) => ({
        id: r.id,
        answers: JSON.parse(r.answers),
        country: r.country,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching poll stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch poll stats" },
      { status: 500 }
    );
  }
}
