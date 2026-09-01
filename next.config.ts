import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `pg` ships native bindings and must not be bundled by Turbopack/webpack.
  serverExternalPackages: ["pg"],
  experimental: {
    // Server Actions are used throughout for mutations.
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
