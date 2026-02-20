-- ============================================================
-- Odisha Business Insight - Initial Database Schema
-- Supabase (PostgreSQL)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ROLES (custom app roles; auth.users is managed by Supabase Auth)
-- ============================================================
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_roles_name ON public.roles(name);

INSERT INTO public.roles (name, description) VALUES
  ('public', 'Anonymous visitor'),
  ('subscriber', 'Registered user - can save articles, comment (future)'),
  ('editor', 'Can create/edit/delete own articles, upload images'),
  ('admin', 'Full access: approve articles, manage categories, users, analytics');

-- ============================================================
-- USER PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_role ON public.user_profiles(role_id);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_sort ON public.categories(sort_order);

-- ============================================================
-- TAGS
-- ============================================================
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_tags_slug ON public.tags(slug);

-- ============================================================
-- ARTICLES
-- ============================================================
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  body TEXT NOT NULL,
  featured_image_url TEXT,
  featured_image_alt TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected', 'archived')),
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  reading_time_minutes INT,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(slug)
);

CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_published_at ON public.articles(published_at DESC NULLS LAST);
CREATE INDEX idx_articles_author ON public.articles(author_id);
CREATE INDEX idx_articles_category ON public.articles(category_id);
CREATE INDEX idx_articles_created_at ON public.articles(created_at DESC);

-- ============================================================
-- ARTICLE_TAGS (many-to-many)
-- ============================================================
CREATE TABLE public.article_tags (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

CREATE INDEX idx_article_tags_article ON public.article_tags(article_id);
CREATE INDEX idx_article_tags_tag ON public.article_tags(tag_id);

-- ============================================================
-- COMMENTS (future ready)
-- ============================================================
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_article ON public.comments(article_id);
CREATE INDEX idx_comments_user ON public.comments(user_id);

-- ============================================================
-- SAVED ARTICLES (registered users)
-- ============================================================
CREATE TABLE public.saved_articles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, article_id)
);

CREATE INDEX idx_saved_articles_user ON public.saved_articles(user_id);

-- ============================================================
-- NEWSLETTER SUBSCRIBERS
-- ============================================================
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_newsletter_email ON public.newsletter_subscribers(email);

-- ============================================================
-- CONTACT MESSAGES
-- ============================================================
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_messages_created ON public.contact_messages(created_at DESC);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Roles: everyone can read
CREATE POLICY "roles_select_all" ON public.roles FOR SELECT USING (true);

-- User profiles: read own or if admin/editor need to see others
CREATE POLICY "user_profiles_select_own" ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "user_profiles_select_editors" ON public.user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name IN ('admin', 'editor')
    )
  );
CREATE POLICY "user_profiles_update_own" ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Categories: public read
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_all_admin" ON public.categories FOR ALL
  USING (public.is_admin());

-- Tags: public read
CREATE POLICY "tags_select_all" ON public.tags FOR SELECT USING (true);
CREATE POLICY "tags_all_admin" ON public.tags FOR ALL
  USING (public.is_admin());

-- Articles: public can read published only
CREATE POLICY "articles_select_published" ON public.articles FOR SELECT
  USING (status = 'published' AND published_at <= NOW());
CREATE POLICY "articles_select_own" ON public.articles FOR SELECT
  USING (author_id = auth.uid());
CREATE POLICY "articles_select_admin" ON public.articles FOR SELECT
  USING (public.is_admin());
CREATE POLICY "articles_insert_editor" ON public.articles FOR INSERT
  WITH CHECK (public.is_editor_or_admin() AND author_id = auth.uid());
CREATE POLICY "articles_update_own" ON public.articles FOR UPDATE
  USING (author_id = auth.uid());
CREATE POLICY "articles_update_admin" ON public.articles FOR UPDATE
  USING (public.is_admin());
CREATE POLICY "articles_delete_own" ON public.articles FOR DELETE
  USING (author_id = auth.uid());
CREATE POLICY "articles_delete_admin" ON public.articles FOR DELETE
  USING (public.is_admin());

-- Article tags: read with article; modify by editor/admin
CREATE POLICY "article_tags_select_all" ON public.article_tags FOR SELECT USING (true);
CREATE POLICY "article_tags_all_editor" ON public.article_tags FOR ALL
  USING (public.is_editor_or_admin());

-- Comments: future
CREATE POLICY "comments_select_approved" ON public.comments FOR SELECT
  USING (is_approved = true);
CREATE POLICY "comments_select_own" ON public.comments FOR SELECT
  USING (user_id = auth.uid());

-- Saved articles: own only
CREATE POLICY "saved_articles_select_own" ON public.saved_articles FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "saved_articles_insert_own" ON public.saved_articles FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "saved_articles_delete_own" ON public.saved_articles FOR DELETE
  USING (user_id = auth.uid());

-- Newsletter: service role / API only (no direct user insert for spam control)
-- Contact: service role / API only
-- We'll use service role in server actions for newsletter and contact

-- ============================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT r.name FROM public.user_profiles up
  JOIN public.roles r ON up.role_id = r.id
  WHERE up.id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT public.get_user_role() = 'admin';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_editor_or_admin()
RETURNS BOOLEAN AS $$
  SELECT public.get_user_role() IN ('editor', 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- STORAGE BUCKET (run in Supabase dashboard or via API)
-- Bucket: article-images, public read, authenticated upload for editors
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('article-images', 'article-images', true);
-- Storage RLS: allow public read; allow insert/update if is_editor_or_admin()
