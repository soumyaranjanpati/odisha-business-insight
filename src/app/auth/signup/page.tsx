import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create an account on Odisha Business Insight.",
};

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="headline text-2xl font-bold text-ink">Sign up</h1>
      <p className="mt-1 text-sm text-gray-600">
        Create an account to access the site and your profile.
      </p>
      <SignupForm />
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-primary-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
