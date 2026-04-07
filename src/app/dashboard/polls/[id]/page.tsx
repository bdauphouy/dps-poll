import { notFound } from "next/navigation";
import { getPollStats } from "@/lib/actions/polls";
import { StatsClient } from "@/components/dashboard/StatsClient";

interface PollStatsPageProps {
  params: Promise<{ id: string }>;
}

export default async function PollStatsPage({ params }: PollStatsPageProps) {
  const { id } = await params;
  const stats = await getPollStats(id);

  if (!stats) {
    notFound();
  }

  return <StatsClient stats={stats} />;
}
