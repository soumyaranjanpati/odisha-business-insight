"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Toast } from "@/components/ui/Toast";
import { uploadAdImage, saveAdvertisement } from "@/app/actions/advertisements";

type Props = {
  ad?: {
    id: string;
    image_url: string;
    description: string | null;
    advertiser: string | null;
    amount_per_month: number | null;
    total_amount: number | null;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean;
  } | null;
};

export function AdvertisementForm({ ad }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(ad?.image_url ?? null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setToast(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    let imageUrl = (formData.get("image_url") as string)?.trim() || ad?.image_url || "";
    const file = formData.get("file") as File | null;
    if (file?.size) {
      const uploadData = new FormData();
      uploadData.set("file", file);
      const result = await uploadAdImage(uploadData);
      if ("error" in result) {
        setToast({ message: result.error, type: "error" });
        setPending(false);
        return;
      }
      imageUrl = result.url;
    }

    if (!imageUrl) {
      setToast({ message: "Please upload an image or provide an image URL.", type: "error" });
      setPending(false);
      return;
    }

    const result = await saveAdvertisement({
      id: ad?.id,
      image_url: imageUrl,
      description: (formData.get("description") as string)?.trim() || null,
      advertiser: (formData.get("advertiser") as string)?.trim() || null,
      amount_per_month: formData.get("amount_per_month")
        ? Number((formData.get("amount_per_month") as string))
        : null,
      total_amount: formData.get("total_amount")
        ? Number((formData.get("total_amount") as string))
        : null,
      start_date: (formData.get("start_date") as string)?.trim() || null,
      end_date: (formData.get("end_date") as string)?.trim() || null,
      is_active: true,
    });

    setPending(false);
    if (result.success) {
      setToast({ message: "Advertisement saved successfully.", type: "success" });
      if (!ad) {
        router.push("/editor/advertisements");
        router.refresh();
      } else {
        setImagePreview(imageUrl);
        router.refresh();
      }
    } else {
      setToast({ message: result.message, type: "error" });
    }
  }

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Upload Image
              </label>
              <input
                type="file"
                name="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setImagePreview(URL.createObjectURL(f));
                }}
              />
              <p className="mt-1 text-xs text-gray-500">
                JPEG, PNG, GIF or WebP. Max 5MB. Stored in advertisement-images bucket.
              </p>
              {imagePreview && (
                <div className="mt-2 relative w-48 h-24 rounded border bg-gray-100 overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
            <Input
              label="Image URL (if not uploading)"
              name="image_url"
              placeholder="https://..."
              defaultValue={ad?.image_url ?? ""}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description (shown on hover)
              </label>
              <textarea
                name="description"
                rows={2}
                defaultValue={ad?.description ?? ""}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-ink focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="Short description for overlay"
              />
            </div>
            <Input
              label="Advertiser Name"
              name="advertiser"
              defaultValue={ad?.advertiser ?? ""}
              placeholder="Company or brand name"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Amount Per Month"
                name="amount_per_month"
                type="number"
                step="0.01"
                min="0"
                defaultValue={ad?.amount_per_month ?? ""}
                placeholder="0"
              />
              <Input
                label="Total Amount"
                name="total_amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={ad?.total_amount ?? ""}
                placeholder="0"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Start Date"
                name="start_date"
                type="date"
                defaultValue={ad?.start_date ?? ""}
              />
              <Input
                label="End Date"
                name="end_date"
                type="date"
                defaultValue={ad?.end_date ?? ""}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={pending} isLoading={pending}>
                {ad ? "Update" : "Save"} Advertisement
              </Button>
              <Link href="/editor/advertisements">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
