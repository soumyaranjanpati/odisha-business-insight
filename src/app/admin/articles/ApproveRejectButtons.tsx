"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveArticle, rejectArticle } from "@/app/actions/admin-articles";

export function ApproveRejectButtons({ articleId }: { articleId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      await approveArticle(articleId);
      router.refresh();
    });
  }

  function handleReject() {
    startTransition(async () => {
      await rejectArticle(articleId);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleApprove}
        disabled={isPending}
        className="text-sm text-green-600 hover:underline disabled:opacity-50"
      >
        Approve
      </button>
      <button
        type="button"
        onClick={handleReject}
        disabled={isPending}
        className="text-sm text-red-600 hover:underline disabled:opacity-50"
      >
        Reject
      </button>
    </>
  );
}
