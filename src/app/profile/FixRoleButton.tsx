"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fixMyRole } from "@/app/actions/fix-role";
import { Button } from "@/components/ui/Button";

export function FixRoleButton({ userId, userEmail }: { userId: string; userEmail: string | undefined }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setMessage(null);
    setLoading(true);
    const result = await fixMyRole(userId, userEmail ?? undefined);
    setLoading(false);
    setMessage(result.message);
    if (result.ok) {
      router.refresh();
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-medium text-amber-800">Role showing as &quot;public&quot;?</p>
      <p className="mt-1 text-xs text-amber-700">
        If you are the editor or admin user, click below to set your role correctly (uses service role).
      </p>
      <Button
        type="button"
        variant="secondary"
        className="mt-3"
        onClick={handleClick}
        isLoading={loading}
      >
        Fix my role
      </Button>
      {message && (
        <p className={`mt-2 text-sm ${message.startsWith("Role set") || message.startsWith("Profile created") ? "text-green-700" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
