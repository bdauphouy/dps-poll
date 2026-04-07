import { getPolls } from "@/lib/actions/polls";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const polls = await getPolls();

  return <DashboardClient initialPolls={polls} />;
}
