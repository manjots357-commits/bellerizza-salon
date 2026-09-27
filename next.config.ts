import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the workspace root (a lockfile higher up the tree would otherwise be picked).
  turbopack: { root: process.cwd() },
  images: {
    // Unsplash serves resized, format-negotiated images from its own CDN,
    // so we generate srcsets against it directly instead of re-optimising.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
};

export default nextConfig;
