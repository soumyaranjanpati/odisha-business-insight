"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAdvertisement } from "@/app/actions/advertisements";
import { Toast } from "@/components/ui/Toast";

type Ad = {
  id: string;
  image_url: string;
  description: string | null;
  advertiser: string | null;
  amount_per_month: number | null;
  total_amount: number | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
};

function getStatus(start: string | null, end: string | null): "Active" | "Expired" {
  const today = new Date().toISOString().slice(0, 10);
  if (end && end < today) return "Expired";
  if (start && start > today) return "Expired"; // not started yet could be "Scheduled" but spec says Active/Expired
  return "Active";
}

export function ManageAdsClient({
  ads,
  isAdmin,
}: {
  ads: Ad[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this advertisement?")) return;
    setDeletingId(id);
    const result = await deleteAdvertisement(id);
    setDeletingId(null);
    setToast({ message: result.message, type: result.success ? "success" : "error" });
    if (result.success) router.refresh();
  }

  if (ads.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        No advertisements yet.{" "}
        <Link href="/editor/advertisements/new" className="text-primary-600 hover:underline">
          Add one
        </Link>
        .
      </div>
    );
  }

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Image
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Advertiser
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Start Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                End Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Amount/Month
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Total Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {ads.map((a) => {
              const status = getStatus(a.start_date, a.end_date);
              return (
                <tr key={a.id}>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="relative h-12 w-20 overflow-hidden rounded border bg-gray-100">
                      <Image
                        src={a.image_url}
                        alt={a.advertiser || "Ad"}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink">
                    {a.advertiser || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {a.start_date || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {a.end_date || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {a.amount_per_month != null ? `₹${a.amount_per_month}` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {a.total_amount != null ? `₹${a.total_amount}` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    <Link
                      href={`/editor/advertisements/${a.id}/edit`}
                      className="font-medium text-primary-600 hover:underline"
                    >
                      Edit
                    </Link>
                    {isAdmin && (
                      <>
                        <span className="mx-2 text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(a.id)}
                          disabled={deletingId === a.id}
                          className="font-medium text-red-600 hover:underline disabled:opacity-50"
                        >
                          {deletingId === a.id ? "Deleting…" : "Delete"}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
