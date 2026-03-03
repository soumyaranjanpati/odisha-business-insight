import Image from "next/image";
import { getActiveSidebarAds } from "@/lib/ads";

export async function SidebarAds() {
  const ads = await getActiveSidebarAds();
  if (ads.length === 0) return null;

  return (
    <aside className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
        Advertisement
      </h3>
      <div className="flex flex-col gap-4">
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-[2/1] w-full overflow-hidden bg-gray-100">
              <Image
                src={ad.image_url}
                alt={ad.advertiser || "Advertisement"}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, 320px"
                loading="lazy"
              />
              {ad.description && (
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <p className="p-3 text-sm text-white">{ad.description}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
