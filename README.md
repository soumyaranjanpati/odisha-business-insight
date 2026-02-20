# Odisha Business Insight

Production-ready business news platform for Odisha. Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase** (PostgreSQL, Auth, Storage).

## Features

- **Public site**: Homepage, category pages, article detail (SEO, OpenGraph, schema.org), about, contact, search, newsletter signup
- **Editor dashboard** (`/editor`): Create/edit articles, draft/publish, featured images
- **Admin dashboard** (`/admin`): All articles, approve/reject workflow, categories, users, basic analytics
- **Roles**: Public, Subscriber, Editor, Admin (enforced via RLS and middleware)
- **SEO**: Sitemap, robots.txt, meta tags, Article JSON-LD

## Prerequisites

- Node.js 18+
- Supabase project

## Setup

### 1. Clone and install

```bash
cd odisha-business-insight
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_auth_trigger.sql`
3. In **Database → Triggers**, add a trigger on `auth.users`:
   - **After insert** → call `public.handle_new_user()` (from migration 002).
4. (Optional) Create **Storage** bucket `article-images`, public read, authenticated write for editors.
5. Copy **Project URL** and **anon key** from Settings → API. For server-side insert (newsletter, contact, seed), copy **service_role** key.

### 3. Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` = Supabase project URL  
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key  
- `SUPABASE_SERVICE_ROLE_KEY` = service role key (server only)  
- `NEXT_PUBLIC_SITE_URL` = production URL (e.g. `https://yoursite.vercel.app`) for sitemap/share links

### 4. Seed data

```bash
npm run db:seed
```

This inserts default categories and tags. It does not create users or articles.

### 5. Create first editor/admin user

1. In Supabase **Authentication → Users**, create a user (or use Sign up on your app if you add a signup page).
2. In **Table Editor → user_profiles**, find the row for that user and set `role_id` to the UUID of the `editor` or `admin` role from the `roles` table.

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Log in at `/login` (Editor Login) with your Supabase user.

## Project structure

```
src/
  app/              # App Router pages and layouts
  components/       # Reusable UI and layout components
  lib/              # Supabase clients, auth, db helpers, utils
  types/            # Shared TypeScript types
  app/actions/      # Server actions (newsletter, contact, articles, admin)
supabase/
  migrations/       # SQL schema and triggers
```

## Deployment (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`.
3. Deploy. Sitemap and robots use `NEXT_PUBLIC_SITE_URL`.

## Optional: Rich text editor

The editor uses a plain HTML textarea. For a WYSIWYG experience, replace it with [TipTap](https://tiptap.dev/) or [Lexical](https://lexical.dev/) and keep storing HTML in `body`.

## License

Private / use as needed.
