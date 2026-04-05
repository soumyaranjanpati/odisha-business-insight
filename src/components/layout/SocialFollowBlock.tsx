import { FacebookIcon, LinkedInIcon, TwitterIcon } from "@/components/icons/SocialIcons";
import { SITE_NAME } from "@/lib/seo";

const fb = process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL?.trim();
const tw = process.env.NEXT_PUBLIC_SOCIAL_TWITTER_URL?.trim();
const li = process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL?.trim();

/**
 * Footer social row: icon links to official profiles (configure via NEXT_PUBLIC_SOCIAL_* env).
 */
export function SocialFollowBlock() {
  const items: {
    href: string | undefined;
    label: string;
    Icon: typeof FacebookIcon;
  }[] = [
    { href: fb, label: "Facebook", Icon: FacebookIcon },
    { href: tw, label: "Twitter / X", Icon: TwitterIcon },
    { href: li, label: "LinkedIn", Icon: LinkedInIcon },
  ];

  return (
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Stay connected</h4>
      <p className="mt-1 text-xs text-gray-500">Follow {SITE_NAME} on social media.</p>
      <ul className="mt-3 flex items-center gap-4" role="list">
        {items.map(({ href, label, Icon }) => (
          <li key={label}>
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-md p-1 text-gray-400 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-label={`${SITE_NAME} on ${label}`}
              >
                <Icon className="h-7 w-7" />
              </a>
            ) : (
              <span
                className="inline-flex cursor-not-allowed rounded-md p-1 text-gray-600 opacity-50"
                title="Set NEXT_PUBLIC_SOCIAL_FACEBOOK_URL, NEXT_PUBLIC_SOCIAL_TWITTER_URL, or NEXT_PUBLIC_SOCIAL_LINKEDIN_URL in your deployment environment."
                aria-label={`${label} link not configured`}
              >
                <Icon className="h-7 w-7" />
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
