import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Skip ESLint failures when running `next build`
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
