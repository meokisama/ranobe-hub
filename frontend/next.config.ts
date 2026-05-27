import type { NextConfig } from "next";

const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === "true";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hub.lightnovel.vn",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
  async rewrites() {
    if (!MAINTENANCE_MODE) return [];
    return {
      beforeFiles: [
        { source: "/", destination: "/maintenance" },
        {
          source: "/((?!maintenance|_next|api|.*\\.).*)",
          destination: "/maintenance",
        },
      ],
    };
  },
};

export default nextConfig;
