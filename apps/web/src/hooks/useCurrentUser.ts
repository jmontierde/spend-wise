import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export function useCurrentUser() {
  const { user, isSignedIn } = useUser();
  const currentUser = useQuery(
    api.auth.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );
  return { user, currentUser, isSignedIn };
}
