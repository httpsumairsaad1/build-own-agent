import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.100.7"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allows all secure HTTPS external image sources
      },
      {
        protocol: "http",
        hostname: "**", // Allows HTTP news image sources if needed
      },
    ],
  },
};

export default nextConfig;