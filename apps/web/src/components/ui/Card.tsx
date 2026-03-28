import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
