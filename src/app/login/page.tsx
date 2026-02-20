import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Editor Login",
  description: "Sign in to Odisha Business Insight editor dashboard.",
};

interface PageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { redirect } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="headline text-2xl font-bold text-ink">Editor Login</h1>
      <p className="mt-1 text-sm text-gray-600">
        Sign in to access the editor or admin dashboard.
      </p>
      <LoginForm redirectTo={redirect ?? "/editor"} />
    </div>
  );
}
