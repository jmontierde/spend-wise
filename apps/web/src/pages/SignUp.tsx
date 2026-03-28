import { SignUp as ClerkSignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function SignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#151718] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0a7ea4] dark:text-[#4db8db]">
            SpendWise
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Create your account
          </p>
        </div>
        <ClerkSignUp
          routing="hash"
          signInUrl="/sign-in"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none w-full",
            },
          }}
        />
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link
            to="/sign-in"
            className="text-[#0a7ea4] dark:text-[#4db8db] font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
