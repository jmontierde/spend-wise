import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@spend-wise/shared";

interface SpendingChartProps {
  data: { name: string; amount: number; color: string }[];
  currency: string;
}

export default function SpendingChart({ data, currency }: SpendingChartProps) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="amount"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value, currency)}
            contentStyle={{
              backgroundColor: "var(--tooltip-bg, #fff)",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "13px",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-2">
        {data
          .sort((a, b) => b.amount - a.amount)
          .map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {formatCurrency(item.amount, currency)}
                </span>
                <span className="text-xs text-gray-400">
                  {total > 0 ? Math.round((item.amount / total) * 100) : 0}%
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
