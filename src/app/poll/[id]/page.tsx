import { notFound } from "next/navigation";
import { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { getPoll } from "@/lib/actions/polls";
import { PollForm } from "@/components/poll/PollForm";

interface PollPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PollPageProps): Promise<Metadata> {
  const { id } = await params;
  const { lang } = await searchParams;
  const isEnglish = lang === "en";
  const poll = await getPoll(id);

  if (!poll) {
    return {};
  }

  // Get localized title and description
  const title = isEnglish && poll.titleEn ? poll.titleEn : poll.title;
  const description = isEnglish && poll.descriptionEn ? poll.descriptionEn : poll.description;

  // Get base URL from headers or environment
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const ogImageUrl = poll.logoUrl
    ? `${baseUrl}/api/polls/${id}/og-image`
    : undefined;

  return {
    title,
    description: description || undefined,
    icons: poll.logoUrl
      ? {
          icon: poll.logoUrl,
        }
      : undefined,
    openGraph: ogImageUrl
      ? {
          title,
          description: description || undefined,
          images: [
            {
              url: ogImageUrl,
              width: 200,
              height: 200,
              alt: title,
            },
          ],
        }
      : undefined,
    twitter: ogImageUrl
      ? {
          card: "summary",
          title,
          description: description || undefined,
          images: [ogImageUrl],
        }
      : undefined,
  };
}

export default async function PollPage({ params }: PollPageProps) {
  const { id } = await params;
  const poll = await getPoll(id);

  if (!poll) {
    notFound();
  }

  if (poll.status !== "active") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-card rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-[#FF9F0A]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-[#FF9F0A]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Survey Unavailable</h2>
            <p className="text-muted-foreground">
              {poll.status === "draft"
                ? "This survey is not yet published."
                : "This survey is no longer accepting responses."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PollForm poll={poll} />
    </Suspense>
  );
}
