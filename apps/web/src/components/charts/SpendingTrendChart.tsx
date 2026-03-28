import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@spend-wise/shared";

interface SpendingTrendChartProps {
  data: { month: number; total: number; count?: number }[];
  currency: string;
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function SpendingTrendChart({
  data,
  currency,
}: SpendingTrendChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: MONTH_LABELS[(item.month % 100) - 1],
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "#9ca3af" }}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#9ca3af" }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickFormatter={(v) => formatCurrency(v, currency, true)}
        />
        <Tooltip
          formatter={(value: number) => [
            formatCurrency(value, currency),
            "Spending",
          ]}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "13px",
          }}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#0a7ea4"
          strokeWidth={2}
          dot={{ r: 4, fill: "#0a7ea4" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
