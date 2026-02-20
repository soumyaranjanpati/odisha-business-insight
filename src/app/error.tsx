"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="headline text-2xl font-bold text-ink">Something went wrong</h1>
      <p className="mt-2 text-gray-600">
        We encountered an error. Please try again or return to the homepage.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="primary" onClick={() => reset()}>
          Try again
        </Button>
        <Link href="/">
          <Button variant="secondary">Go home</Button>
        </Link>
      </div>
    </div>
  );
}
