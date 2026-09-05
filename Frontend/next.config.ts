import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // The red "N Issue(s)" badge the reviewer saw is Next.js's built-in dev-mode
  // build indicator (bottom-left overlay in `next dev`). It never ships in a
  // production build/`next start`, but we turn it off outright rather than
  // masking it with CSS so it can't resurface during local development either.
  devIndicators: false,
};

export default nextConfig;
