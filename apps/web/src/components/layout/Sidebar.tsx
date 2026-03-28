import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  PiggyBank,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/uiSlice";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/expenses", icon: Receipt, label: "Expenses" },
  { to: "/insights", icon: BarChart3, label: "Insights" },
  { to: "/savings", icon: PiggyBank, label: "Savings" },
  { to: "/budget", icon: Wallet, label: "Budget" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 z-40 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <h1 className="text-lg font-bold text-[#0a7ea4] dark:text-[#4db8db] truncate">
            SpendWise
          </h1>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 ${
            collapsed ? "mx-auto" : "ml-auto"
          }`}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#0a7ea4]/10 text-[#0a7ea4] dark:bg-[#4db8db]/10 dark:text-[#4db8db] font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            <Icon size={20} />
            {!collapsed && <span className="text-sm">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <p className="text-xs text-gray-400 text-center">SpendWise v1.0.0</p>
        )}
      </div>
    </aside>
  );
}
