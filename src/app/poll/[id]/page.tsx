import { notFound } from "next/navigation";
import { getPoll } from "@/lib/actions/polls";
import { PollForm } from "@/components/poll/PollForm";

interface PollPageProps {
  params: Promise<{ id: string }>;
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

  return <PollForm poll={poll} />;
}
