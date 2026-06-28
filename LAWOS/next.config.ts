import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Self-contained server output. Required so the Tauri desktop build can bundle
  // and run the Next server (see src-tauri). Harmless for web/Vercel and does
  // not affect `next dev`.
  output: "standalone",
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },
};

export default nextConfig;
