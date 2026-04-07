"use client";

interface RecentResponse {
  id: number;
  email: string;
  avgRating: number;
  country: string | null;
  createdAt: Date;
}

interface ResponsesTableProps {
  responses: RecentResponse[];
}

export function ResponsesTable({ responses }: ResponsesTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-[#30D158] bg-[#30D158]/10";
    if (rating >= 3) return "text-[#FF9F0A] bg-[#FF9F0A]/10";
    return "text-destructive bg-destructive/10";
  };

  if (responses.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Responses</h3>
        <p className="text-muted-foreground text-center py-8">
          No responses yet
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border/50">
        <h3 className="text-lg font-semibold">Recent Responses</h3>
      </div>

      {/* Mobile view */}
      <div className="sm:hidden">
        {responses.map((response) => (
          <div
            key={response.id}
            className="p-4 border-b border-border/50 last:border-b-0"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm truncate flex-1 mr-2">
                {response.email}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRatingColor(
                  response.avgRating
                )}`}
              >
                {response.avgRating.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{response.country || "Unknown"}</span>
              <span>{formatDate(response.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">
                Email
              </th>
              <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">
                Rating
              </th>
              <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">
                Country
              </th>
              <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {responses.map((response) => (
              <tr
                key={response.id}
                className="border-b border-border/50 last:border-b-0"
              >
                <td className="px-6 py-4 text-sm">{response.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRatingColor(
                      response.avgRating
                    )}`}
                  >
                    {response.avgRating.toFixed(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {response.country || "Unknown"}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {formatDate(response.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
