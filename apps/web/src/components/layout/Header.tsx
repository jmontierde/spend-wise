import { useUser } from "@clerk/clerk-react";
import { Moon, Sun } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleTheme } from "@/store/slices/themeSlice";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);
  const { user } = useUser();

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#0a7ea4] dark:bg-[#4db8db] flex items-center justify-center text-white text-sm font-medium">
            {user?.firstName?.[0] || user?.primaryEmailAddress?.emailAddress?.[0] || "U"}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
            {user?.firstName || user?.primaryEmailAddress?.emailAddress}
          </span>
        </div>
      </div>
    </header>
  );
}
