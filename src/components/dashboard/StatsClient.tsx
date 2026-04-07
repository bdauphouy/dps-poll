"use client";

import { useRouter } from "next/navigation";
import { CustomPollStats, QuestionType } from "@/types/poll";

function QuestionStatsCard({
  question,
  type,
  options,
  responses,
}: {
  question: string;
  type: QuestionType;
  options?: string[];
  responses: { value: string | number; count: number }[];
}) {
  const totalResponses = responses.reduce((sum, r) => sum + r.count, 0);

  if (type === "rating") {
    const sortedResponses = [...responses].sort(
      (a, b) => Number(a.value) - Number(b.value)
    );
    const average =
      totalResponses > 0
        ? responses.reduce((sum, r) => sum + Number(r.value) * r.count, 0) /
          totalResponses
        : 0;

    return (
      <div className="bg-card rounded-2xl p-5">
        <h3 className="font-semibold text-[15px] mb-4">{question}</h3>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl font-bold">{average.toFixed(1)}</span>
          <span className="text-muted-foreground text-sm">/ 5 average</span>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((rating) => {
            const response = sortedResponses.find(
              (r) => Number(r.value) === rating
            );
            const count = response?.count || 0;
            const percentage =
              totalResponses > 0 ? (count / totalResponses) * 100 : 0;

            return (
              <div key={rating} className="flex items-center gap-3">
                <span className="w-6 text-sm text-muted-foreground text-right">
                  {rating}
                </span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-xs text-muted-foreground text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === "multiple_choice" || type === "checkbox") {
    return (
      <div className="bg-card rounded-2xl p-5">
        <h3 className="font-semibold text-[15px] mb-4">{question}</h3>
        <div className="space-y-3">
          {options?.map((option) => {
            const response = responses.find((r) => r.value === option);
            const count = response?.count || 0;
            const percentage =
              totalResponses > 0 ? (count / totalResponses) * 100 : 0;

            return (
              <div key={option}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{option}</span>
                  <span className="text-muted-foreground">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === "text" || type === "email") {
    return (
      <div className="bg-card rounded-2xl p-5">
        <h3 className="font-semibold text-[15px] mb-4">{question}</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {responses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No responses yet</p>
          ) : (
            responses.slice(0, 10).map((response, index) => (
              <div key={index} className="text-sm p-3 bg-secondary rounded-xl">
                <span>{String(response.value)}</span>
                {response.count > 1 && (
                  <span className="text-muted-foreground ml-2">
                    ({response.count}x)
                  </span>
                )}
              </div>
            ))
          )}
          {responses.length > 10 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              +{responses.length - 10} more responses
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
}

interface StatsClientProps {
  stats: CustomPollStats;
}

export function StatsClient({ stats }: StatsClientProps) {
  const router = useRouter();

  const statusConfig = {
    draft: {
      label: "Draft",
      color: "text-muted-foreground",
      bgColor: "bg-secondary",
    },
    active: {
      label: "Active",
      color: "text-[#30D158]",
      bgColor: "bg-[#30D158]/10",
    },
    ended: {
      label: "Ended",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  };

  const config = statusConfig[stats.poll.status as keyof typeof statusConfig];

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold truncate">
                    {stats.poll.title}
                  </h1>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${config.bgColor} ${config.color}`}
                  >
                    {config.label}
                  </span>
                </div>
                {stats.poll.description && (
                  <p className="text-xs text-muted-foreground truncate hidden sm:block">
                    {stats.poll.description}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer shrink-0"
              title="Refresh"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card rounded-2xl p-5">
              <p className="text-sm text-muted-foreground mb-1">
                Total Responses
              </p>
              <p className="text-3xl font-bold">{stats.totalResponses}</p>
            </div>
            <div className="bg-card rounded-2xl p-5">
              <p className="text-sm text-muted-foreground mb-1">Total Views</p>
              <p className="text-3xl font-bold">{stats.totalViews}</p>
            </div>
            <div className="bg-card rounded-2xl p-5">
              <p className="text-sm text-muted-foreground mb-1">
                Completion Rate
              </p>
              <p className="text-3xl font-bold">
                {stats.totalViews > 0
                  ? `${((stats.totalResponses / stats.totalViews) * 100).toFixed(0)}%`
                  : "0%"}
              </p>
            </div>
          </div>

          {/* Question Stats */}
          <div>
            <p className="text-sm font-medium text-muted-foreground px-1 mb-3">
              Question Breakdown
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {stats.questionStats.map((qs) => (
                <QuestionStatsCard
                  key={qs.questionId}
                  question={qs.question}
                  type={qs.type}
                  options={qs.options}
                  responses={qs.responses}
                />
              ))}
            </div>
          </div>

          {/* Country Breakdown */}
          {stats.countryBreakdown.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground px-1 mb-3">
                Responses by Location
              </p>
              <div className="bg-card rounded-2xl p-5">
                <div className="space-y-3">
                  {stats.countryBreakdown.map((item, index) => {
                    const percentage =
                      (item.count / stats.totalResponses) * 100;
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.country}</span>
                          <span className="text-muted-foreground">
                            {item.count} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Recent Responses */}
          {stats.recentResponses.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground px-1 mb-3">
                Recent Responses
              </p>
              <div className="bg-card rounded-2xl overflow-hidden">
                {/* Mobile view */}
                <div className="sm:hidden">
                  {stats.recentResponses.map((response, index) => (
                    <div
                      key={response.id}
                      className="p-4 border-b border-border/50 last:border-b-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(response.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {response.country || "Unknown"}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(response.answers)
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <span
                              key={key}
                              className="inline-block text-xs bg-secondary px-2 py-1 rounded-lg"
                            >
                              {Array.isArray(value)
                                ? value.join(", ")
                                : String(value).slice(0, 20)}
                              {String(value).length > 20 && "..."}
                            </span>
                          ))}
                        {Object.keys(response.answers).length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{Object.keys(response.answers).length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop view */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left text-muted-foreground font-medium px-5 py-3">
                          #
                        </th>
                        <th className="text-left text-muted-foreground font-medium px-5 py-3">
                          Country
                        </th>
                        <th className="text-left text-muted-foreground font-medium px-5 py-3">
                          Date
                        </th>
                        <th className="text-left text-muted-foreground font-medium px-5 py-3">
                          Answers
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentResponses.map((response, index) => (
                        <tr
                          key={response.id}
                          className="border-b border-border/50 last:border-b-0"
                        >
                          <td className="px-5 py-3 text-muted-foreground">
                            {index + 1}
                          </td>
                          <td className="px-5 py-3">
                            {response.country || "Unknown"}
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">
                            {new Date(response.createdAt).toLocaleString()}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(response.answers)
                                .slice(0, 3)
                                .map(([key, value]) => (
                                  <span
                                    key={key}
                                    className="inline-block text-xs bg-secondary px-2 py-1 rounded-lg"
                                  >
                                    {Array.isArray(value)
                                      ? value.join(", ")
                                      : String(value).slice(0, 20)}
                                    {String(value).length > 20 && "..."}
                                  </span>
                                ))}
                              {Object.keys(response.answers).length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{Object.keys(response.answers).length - 3}{" "}
                                  more
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
