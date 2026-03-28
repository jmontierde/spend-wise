import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </label>
      )}
      <input
        className={`w-full h-12 px-4 rounded-xl bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#0a7ea4]/30 dark:focus:ring-[#4db8db]/30 transition ${
          error ? "ring-2 ring-red-500/30" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
