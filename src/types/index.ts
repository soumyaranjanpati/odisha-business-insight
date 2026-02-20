/**
 * Shared types for Odisha Business Insight
 */

export type ArticleStatus = "draft" | "pending" | "published" | "rejected" | "archived";

export type UserRole = "public" | "subscriber" | "editor" | "admin";

export interface Role {
  id: string;
  name: UserRole | string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  role_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  role?: Role;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Article {
  id: string;
  author_id: string;
  category_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  status: ArticleStatus;
  approved_by: string | null;
  approved_at: string | null;
  published_at: string | null;
  reading_time_minutes: number | null;
  meta_title: string | null;
  meta_description: string | null;
  /** Gated content; requires premium subscription to view full body. */
  is_premium?: boolean;
  /** Display "Sponsored" label and optional sponsor name. */
  is_sponsored?: boolean;
  sponsored_by?: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  tags?: Tag[];
  author?: UserProfile;
}

/** Subscription plan (e.g. Free, Premium). Ready for Stripe price_id. */
export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  amount_cents: number;
  interval: "month" | "year";
  grants_premium_access: boolean;
  stripe_price_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** User's current subscription. One active per user (unique user_id). */
export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: "active" | "canceled" | "past_due" | "expired" | "trialing";
  current_period_start: string;
  current_period_end: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
}

export interface ArticleWithRelations extends Article {
  category: Category;
  tags: Tag[];
  author?: UserProfile;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SavedArticle {
  user_id: string;
  article_id: string;
  created_at: string;
}
