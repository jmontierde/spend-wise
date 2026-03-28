import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { BrowserRouter } from "react-router-dom";
import { useAppSelector } from "./store/hooks";
import { AppRouter } from "./router";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function AppContent() {
  const theme = useAppSelector((state) => state.theme.mode);

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-white text-gray-900 dark:bg-[#151718] dark:text-gray-100">
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </div>
    </div>
  );
}

export default function App() {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

  if (!publishableKey) {
    throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <AppContent />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
