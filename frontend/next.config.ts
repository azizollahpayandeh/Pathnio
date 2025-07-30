import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'localhost',
      'cdn-icons-png.flaticon.com',
      // Add your production domain(s) here, e.g.:
      // 'your-production-domain.com',
    ],
  },
};

module.exports = nextConfig;
