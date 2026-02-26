/**
 * Seed script: run with `npm run db:seed` (requires SUPABASE_SERVICE_ROLE_KEY).
 * Inserts default categories and tags. Create an editor user in Supabase Auth first, then add articles via /editor.
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load .env.local so npm run db:seed picks up Supabase keys (Next.js only loads these for next dev/build)
dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

const CATEGORIES = [
  { name: "Economy", slug: "economy", description: "State and regional economy", sort_order: 1 },
  { name: "MSME", slug: "msme", description: "MSME and small business", sort_order: 2 },
  { name: "Startups", slug: "startups", description: "Startups and innovation", sort_order: 3 },
  { name: "Policy", slug: "policy", description: "Policy and regulation", sort_order: 4 },
  { name: "Infrastructure", slug: "infrastructure", description: "Infrastructure and projects", sort_order: 5 },
  { name: "Markets", slug: "markets", description: "Markets and investments", sort_order: 6 },
  {
    name: "IT & Semiconductor",
    slug: "it-semiconductor",
    description: "Technology, AI, software, chip manufacturing, and digital innovation in Odisha.",
    sort_order: 7,
  },
  {
    name: "Fintech",
    slug: "fintech",
    description: "Financial technology startups, digital payments, banking innovation, and financial services growth.",
    sort_order: 8,
  },
  {
    name: "Metal and Mining",
    slug: "metal-mining",
    description: "Steel, aluminum, mining projects, mineral production, and industrial investments.",
    sort_order: 9,
  },
  {
    name: "Pharmaceutical",
    slug: "pharmaceutical",
    description: "Drug manufacturing, biotech, healthcare industry growth, and pharma investments.",
    sort_order: 10,
  },
  {
    name: "Automobile",
    slug: "automobile",
    description: "Auto manufacturing, EV sector, component industries, and mobility innovation.",
    sort_order: 11,
  },
];

const TAGS = [
  "Odisha",
  "Bhubaneswar",
  "Industrial",
  "Investment",
  "Budget",
  "MSME",
  "Startup",
  "Agriculture",
  "Mining",
  "Tourism",
  "Legacy & Leadership",
].map((name) => ({
  name,
  slug: name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""),
}));

async function seed() {
  console.log("Seeding categories...");
  for (const c of CATEGORIES) {
    const { error } = await supabase.from("categories").upsert(c, { onConflict: "slug" });
    if (error) console.warn("Category", c.slug, error.message);
  }

  console.log("Seeding tags...");
  for (const t of TAGS) {
    const { error } = await supabase.from("tags").upsert(t, { onConflict: "slug" });
    if (error) console.warn("Tag", t.slug, error.message);
  }

  console.log("Seed done. Create an editor user in Supabase Auth and assign role in user_profiles.");
}

seed().catch(console.error);
