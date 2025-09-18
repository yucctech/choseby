import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'dist',
  images: {
    unoptimized: true
  },
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8080'
  }
};

export default nextConfig;
