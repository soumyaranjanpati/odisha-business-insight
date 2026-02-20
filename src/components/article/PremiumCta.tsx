import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface PremiumCtaProps {
  className?: string;
}

/** Shown when a user hits premium (gated) content. Ready for /subscribe or Stripe checkout. */
export function PremiumCta({ className = "" }: PremiumCtaProps) {
  return (
    <div
      className={`rounded-xl border-2 border-amber-200 bg-amber-50 p-6 text-center sm:p-8 ${className}`}
    >
      <p className="text-sm font-medium uppercase tracking-wider text-amber-800">
        Premium content
      </p>
      <h2 className="headline mt-2 text-xl font-bold text-ink">
        Subscribe to read the full article
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
        Get full access to premium analysis and exclusive stories with a subscription.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/subscribe">
          <Button>View subscription plans</Button>
        </Link>
        <Link href="/contact">
          <Button variant="ghost">Contact us</Button>
        </Link>
      </div>
    </div>
  );
}
