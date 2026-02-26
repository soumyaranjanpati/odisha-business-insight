"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { updateProfile } from "@/app/actions/update-profile";
import { Toast } from "@/components/ui/Toast";

export function ProfileEditForm({
  initialDisplayName,
  initialEmail,
}: {
  initialDisplayName: string | null;
  initialEmail: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await updateProfile(formData);
    if (res.ok) {
      setToast({ message: res.message, type: "success" });
      startTransition(() => router.refresh());
    } else {
      setToast({ message: res.message, type: "error" });
    }
  }

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="profile-display_name" className="mb-1 block text-sm font-medium text-ink">
            Name
          </label>
          <input
            id="profile-display_name"
            name="display_name"
            type="text"
            defaultValue={initialDisplayName ?? ""}
            placeholder="Your name"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-ink shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label htmlFor="profile-email" className="mb-1 block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="profile-email"
            name="email"
            type="email"
            defaultValue={initialEmail ?? ""}
            placeholder="you@example.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-ink shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </>
  );
}
