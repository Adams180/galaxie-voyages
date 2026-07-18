import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // News images are supplied by admins as arbitrary URLs.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
