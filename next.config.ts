import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the local network address shown by `next dev` to request HMR and
  // development diagnostics. This setting applies only during development.
  allowedDevOrigins: ["192.168.100.7"],
};

export default nextConfig;
