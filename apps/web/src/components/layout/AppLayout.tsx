import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAppSelector } from "@/store/hooks";

export default function AppLayout() {
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main
        className={`flex-1 transition-all duration-300 ${
          collapsed ? "ml-16" : "ml-60"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
