-- ============================================================
-- Subscription-ready structure, premium content, sponsored posts
-- ============================================================

-- Add premium and sponsored flags to articles
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sponsored_by TEXT;

CREATE INDEX IF NOT EXISTS idx_articles_is_premium ON public.articles(is_premium) WHERE is_premium = true;
CREATE INDEX IF NOT EXISTS idx_articles_is_sponsored ON public.articles(is_sponsored) WHERE is_sponsored = true;

COMMENT ON COLUMN public.articles.is_premium IS 'Gated content; requires active premium subscription to view full body';
COMMENT ON COLUMN public.articles.is_sponsored IS 'Sponsored content; display sponsor label';
COMMENT ON COLUMN public.articles.sponsored_by IS 'Name or brand of sponsor (optional)';

-- ============================================================
-- SUBSCRIPTION PLANS (ready for Stripe/payment integration)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  amount_cents INT NOT NULL DEFAULT 0,
  interval TEXT NOT NULL DEFAULT 'month' CHECK (interval IN ('month', 'year')),
  grants_premium_access BOOLEAN NOT NULL DEFAULT false,
  stripe_price_id TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscription_plans_slug ON public.subscription_plans(slug);
CREATE INDEX idx_subscription_plans_active ON public.subscription_plans(is_active) WHERE is_active = true;

-- ============================================================
-- USER SUBSCRIPTIONS (links user to plan; plug Stripe later)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'expired', 'trialing')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_period_end ON public.user_subscriptions(current_period_end);

-- Updated_at trigger for new tables
CREATE TRIGGER subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Plans: public read active plans
CREATE POLICY "subscription_plans_select_active" ON public.subscription_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "subscription_plans_all_admin" ON public.subscription_plans FOR ALL
  USING (public.is_admin());

-- User subscriptions: users see own only
CREATE POLICY "user_subscriptions_select_own" ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_insert_own" ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_update_own" ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_all_admin" ON public.user_subscriptions FOR ALL
  USING (public.is_admin());

-- ============================================================
-- Seed default plans (free + premium)
-- ============================================================
INSERT INTO public.subscription_plans (name, slug, description, amount_cents, interval, grants_premium_access, sort_order)
VALUES
  ('Free', 'free', 'Access to standard articles and newsletter', 0, 'month', false, 0),
  ('Premium', 'premium', 'Full access including premium content', 299, 'month', true, 1)
ON CONFLICT (slug) DO NOTHING;
