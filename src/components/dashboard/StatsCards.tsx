"use client";

interface StatsCardsProps {
  totalResponses: number;
  totalPageViews: number;
  averageRatings: {
    customerService: number;
    delivery: number;
    tracking: number;
    cargoHandling: number;
    deliveryTime: number;
  };
}

export function StatsCards({
  totalResponses,
  totalPageViews,
  averageRatings,
}: StatsCardsProps) {
  const overallAverage =
    (averageRatings.customerService +
      averageRatings.delivery +
      averageRatings.tracking +
      averageRatings.cargoHandling +
      averageRatings.deliveryTime) /
    5;

  const cards = [
    {
      title: "Total Responses",
      value: totalResponses,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      color: "bg-[#0A84FF]",
    },
    {
      title: "Page Views",
      value: totalPageViews,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      ),
      color: "bg-[#30D158]",
    },
    {
      title: "Overall Rating",
      value: overallAverage.toFixed(1),
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ),
      color: "bg-[#FF9F0A]",
    },
    {
      title: "Conversion Rate",
      value:
        totalPageViews > 0
          ? `${((totalResponses / totalPageViews) * 100).toFixed(1)}%`
          : "0%",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      color: "bg-[#BF5AF2]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="bg-card rounded-2xl p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">{card.value}</p>
            </div>
            <div className={`${card.color} p-2.5 rounded-xl text-white`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
