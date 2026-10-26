import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local IP only
  allowedDevOrigins: [
    "192.168.0.150", 
    "192.168.0.150:3000",
    "192.168.0.150:3001"
  ],
  // Empty turbopack config to silence warning
  turbopack: {},
  // Reduce file system scanning
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Skip static image optimization checks
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:5000/api/:path*",
      },
      {
        source: "/api/:path*/",
        destination: "http://127.0.0.1:5000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
