import { SignIn as ClerkSignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#151718] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0a7ea4] dark:text-[#4db8db]">
            SpendWise
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Track your spending, grow your savings
          </p>
        </div>
        <ClerkSignIn
          routing="hash"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none w-full",
            },
          }}
        />
        <p className="text-center text-sm text-gray-500 mt-4">
          Don&apos;t have an account?{" "}
          <Link
            to="/sign-up"
            className="text-[#0a7ea4] dark:text-[#4db8db] font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
