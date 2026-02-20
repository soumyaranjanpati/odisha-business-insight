import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    // Optimize package imports for smaller bundles
    optimizePackageImports: ["@supabase/supabase-js"],
  },
};

export default nextConfig;
