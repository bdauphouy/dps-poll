"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface RatingChartsProps {
  averageRatings: {
    customerService: number;
    delivery: number;
    tracking: number;
    cargoHandling: number;
    deliveryTime: number;
  };
  ratingDistribution: {
    rating: number;
    customerService: number;
    delivery: number;
    tracking: number;
    cargoHandling: number;
    deliveryTime: number;
  }[];
}

export function RatingCharts({
  averageRatings,
  ratingDistribution,
}: RatingChartsProps) {
  const averageData = [
    { name: "Customer Service", value: averageRatings.customerService },
    { name: "Delivery", value: averageRatings.delivery },
    { name: "Tracking", value: averageRatings.tracking },
    { name: "Cargo", value: averageRatings.cargoHandling },
    { name: "Time", value: averageRatings.deliveryTime },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Average Ratings Chart */}
      <div className="bg-card rounded-2xl p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">Average Ratings</h3>
        <div className="h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={averageData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#38383A" />
              <XAxis type="number" domain={[0, 5]} stroke="#8E8E93" />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tick={{ fontSize: 12, fill: "#8E8E93" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1C1C1E",
                  border: "1px solid #38383A",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="value" fill="#0A84FF" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rating Distribution Chart */}
      <div className="bg-card rounded-2xl p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
        <div className="h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ratingDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#38383A" />
              <XAxis dataKey="rating" stroke="#8E8E93" />
              <YAxis stroke="#8E8E93" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1C1C1E",
                  border: "1px solid #38383A",
                  borderRadius: "12px",
                }}
              />
              <Legend />
              <Bar
                dataKey="customerService"
                name="Service"
                fill="#0A84FF"
              />
              <Bar dataKey="delivery" name="Delivery" fill="#30D158" />
              <Bar dataKey="tracking" name="Tracking" fill="#FF9F0A" />
              <Bar dataKey="cargoHandling" name="Cargo" fill="#BF5AF2" />
              <Bar dataKey="deliveryTime" name="Time" fill="#FF453A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
