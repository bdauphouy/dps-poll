"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, polls, pollQuestions, pollResponses, pageViews } from "@/lib/db";
import { eq, count, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { PollStatus, PollBuilderQuestion, CustomPoll, CustomPollStats, QuestionType } from "@/types/poll";

const COOKIE_NAME = "dashboard_auth";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(COOKIE_NAME);
  return authCookie?.value === "authenticated";
}

// Get all polls for dashboard
export async function getPolls(): Promise<CustomPoll[]> {
  if (!(await isAuthenticated())) {
    redirect("/dashboard/login");
  }

  const allPolls = await db.select().from(polls).orderBy(polls.createdAt);

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
        createdAt: poll.createdAt,
        questions: questions.map((q) => ({
          ...q,
          options: q.options ? JSON.parse(q.options) : undefined,
          optionsEn: q.optionsEn ? JSON.parse(q.optionsEn) : undefined,
        })),
        responseCount: responseCountResult[0]?.count || 0,
      } as CustomPoll;
    })
  );

  return pollsWithDetails;
}

// Get single poll (public)
export async function getPoll(id: string): Promise<CustomPoll | null> {
  const poll = await db.select().from(polls).where(eq(polls.id, id)).limit(1);

  if (poll.length === 0) {
    return null;
  }

  const questions = await db
    .select()
    .from(pollQuestions)
    .where(eq(pollQuestions.pollId, id))
    .orderBy(pollQuestions.orderIndex);

  return {
    ...poll[0],
    createdAt: poll[0].createdAt,
    questions: questions.map((q) => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : undefined,
      optionsEn: q.optionsEn ? JSON.parse(q.optionsEn) : undefined,
    })),
  } as CustomPoll;
}

// Get poll stats (authenticated)
export async function getPollStats(id: string): Promise<CustomPollStats | null> {
  if (!(await isAuthenticated())) {
    redirect("/dashboard/login");
  }

  const pollResult = await db.select().from(polls).where(eq(polls.id, id)).limit(1);

  if (pollResult.length === 0) {
    return null;
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
      type: question.type as QuestionType,
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

  return {
    poll: {
      ...poll,
      questions: questions.map((q) => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : undefined,
        optionsEn: q.optionsEn ? JSON.parse(q.optionsEn) : undefined,
      })),
    } as CustomPoll,
    totalResponses: responses.length,
    totalViews,
    questionStats,
    countryBreakdown,
    recentResponses: responses.slice(0, 20).map((r) => ({
      id: r.id,
      answers: JSON.parse(r.answers) as Record<string, string | number | string[]>,
      country: r.country || undefined,
      createdAt: r.createdAt,
    })),
  };
}

// Create poll
export async function createPoll(data: {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  logoUrl: string;
  questions: PollBuilderQuestion[];
}): Promise<{ id: string; success: boolean }> {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const { title, titleEn, description, descriptionEn, logoUrl, questions } =
    data;

  if (!title || !questions || questions.length === 0) {
    throw new Error("Title and at least one question are required");
  }

  const pollId = nanoid(10);

  await db.insert(polls).values({
    id: pollId,
    title,
    titleEn: titleEn || null,
    description: description || null,
    descriptionEn: descriptionEn || null,
    logoUrl: logoUrl || null,
    status: "draft" as PollStatus,
  });

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

  revalidatePath("/dashboard");
  return { id: pollId, success: true };
}

// Update poll
export async function updatePoll(
  id: string,
  data: {
    title?: string;
    titleEn?: string;
    description?: string;
    descriptionEn?: string;
    logoUrl?: string;
    questions?: PollBuilderQuestion[];
  }
): Promise<{ success: boolean }> {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const { title, titleEn, description, descriptionEn, logoUrl, questions } =
    data;

  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (titleEn !== undefined) updateData.titleEn = titleEn || null;
  if (description !== undefined) updateData.description = description || null;
  if (descriptionEn !== undefined)
    updateData.descriptionEn = descriptionEn || null;
  if (logoUrl !== undefined) updateData.logoUrl = logoUrl || null;

  if (Object.keys(updateData).length > 0) {
    await db.update(polls).set(updateData).where(eq(polls.id, id));
  }

  if (questions) {
    await db.delete(pollQuestions).where(eq(pollQuestions.pollId, id));

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

  revalidatePath("/dashboard");
  return { success: true };
}

// Delete poll
export async function deletePoll(id: string): Promise<{ success: boolean }> {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  await db.delete(polls).where(eq(polls.id, id));

  revalidatePath("/dashboard");
  return { success: true };
}

// Update poll status
export async function updatePollStatus(
  id: string,
  status: PollStatus
): Promise<{ success: boolean }> {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  await db.update(polls).set({ status }).where(eq(polls.id, id));

  revalidatePath("/dashboard");
  return { success: true };
}

// Submit poll response
export async function submitPollResponse(
  pollId: string,
  answers: Record<string, string | number | string[]>,
  geoData?: { ip?: string; country?: string; city?: string }
): Promise<{ success: boolean }> {
  const poll = await db
    .select()
    .from(polls)
    .where(eq(polls.id, pollId))
    .limit(1);

  if (poll.length === 0) {
    throw new Error("Poll not found");
  }

  if (poll[0].status !== "active") {
    throw new Error("Poll is not active");
  }

  await db.insert(pollResponses).values({
    pollId,
    answers: JSON.stringify(answers),
    ipAddress: geoData?.ip || null,
    country: geoData?.country || null,
    city: geoData?.city || null,
  });

  return { success: true };
}

// Track page view
export async function trackPageView(
  pollId: string,
  geoData?: {
    ip?: string;
    country?: string;
    city?: string;
    userAgent?: string;
  }
): Promise<void> {
  await db.insert(pageViews).values({
    pollId,
    ipAddress: geoData?.ip || null,
    country: geoData?.country || null,
    city: geoData?.city || null,
    userAgent: geoData?.userAgent || null,
  });
}
