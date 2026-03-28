import { useAuth, useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "@convex/_generated/api";

export default function ProtectedRoute() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  const getOrCreateUser = useMutation(api.auth.getOrCreateUser);
  const seedCategories = useMutation(api.categories.seedDefaultCategories);

  useEffect(() => {
    async function initUser() {
      if (isSignedIn && user) {
        await getOrCreateUser({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          name: user.fullName || undefined,
        });
        await seedCategories({});
      }
    }
    initUser();
  }, [isSignedIn, user, getOrCreateUser, seedCategories]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a7ea4]" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Outlet />;
}
