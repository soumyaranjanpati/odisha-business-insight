import Link from "next/link";
import { AdvertisementForm } from "../AdvertisementForm";

export default function NewAdvertisementPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Add Advertisement</h1>
        <Link
          href="/editor/advertisements"
          className="text-sm font-medium text-primary-600 hover:underline"
        >
          ← Manage Advz
        </Link>
      </div>
      <AdvertisementForm />
    </div>
  );
}
