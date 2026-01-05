import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Enable server components external packages for native modules
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
