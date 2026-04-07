"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface CountryBreakdownProps {
  countryBreakdown: {
    country: string;
    count: number;
  }[];
}

const COLORS = [
  "#0A84FF",
  "#30D158",
  "#FF9F0A",
  "#BF5AF2",
  "#FF453A",
  "#FF375F",
  "#64D2FF",
];

export function CountryBreakdown({ countryBreakdown }: CountryBreakdownProps) {
  const total = countryBreakdown.reduce((sum, c) => sum + c.count, 0);

  if (countryBreakdown.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Responses by Country</h3>
        <p className="text-muted-foreground text-center py-8">
          No data available yet
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-4 sm:p-6">
      <h3 className="text-lg font-semibold mb-4">Responses by Country</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-[200px] sm:h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={countryBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="count"
                nameKey="country"
              >
                {countryBreakdown.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1C1C1E",
                  border: "1px solid #38383A",
                  borderRadius: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {countryBreakdown.map((item, index) => (
            <div
              key={item.country}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm">{item.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.count}</span>
                <span className="text-xs text-muted-foreground">
                  ({((item.count / total) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
