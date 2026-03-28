import { TrendingUp, AlertTriangle, Lightbulb, BarChart3 } from "lucide-react";
import Card from "@/components/ui/Card";

interface InsightCardProps {
  insight: {
    _id: string;
    type: string;
    title: string;
    content: string;
  };
}

const typeConfig: Record<string, { icon: typeof TrendingUp; color: string; bg: string }> = {
  spending_pattern: { icon: BarChart3, color: "text-blue-500", bg: "bg-blue-500/10" },
  budget_prediction: { icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
  anomaly: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  saving_tip: { icon: Lightbulb, color: "text-purple-500", bg: "bg-purple-500/10" },
};

export default function InsightCard({ insight }: InsightCardProps) {
  const config = typeConfig[insight.type] || typeConfig.spending_pattern;
  const Icon = config.icon;

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <div className={`p-2 rounded-lg ${config.bg} shrink-0`}>
          <Icon size={20} className={config.color} />
        </div>
        <div>
          <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {insight.content}
          </p>
        </div>
      </div>
    </Card>
  );
}
