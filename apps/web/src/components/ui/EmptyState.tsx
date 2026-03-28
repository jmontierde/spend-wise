import type { ReactNode } from "react";
import Button from "./Button";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-12 px-4">
      <div className="text-gray-400 dark:text-gray-500 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6 max-w-xs">
          {subtitle}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
