import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to Odisha Business Insight.",
};

interface PageProps {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { redirect, error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="headline text-2xl font-bold text-ink">Login</h1>
      <p className="mt-1 text-sm text-gray-600">
        Sign in to your account. Editors and admins can access the dashboard after login.
      </p>
      {error === "profile" && (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Your account is not set up for the editor. Please contact an administrator to assign you the Editor or Admin role.
        </p>
      )}
      <LoginForm redirectTo={redirect ?? "/"} />
      <p className="mt-4 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="font-medium text-primary-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
