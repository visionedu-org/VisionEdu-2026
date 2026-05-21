import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  /* config options here */
};

const config = process.env.ANALYZE === "true"
  ? withBundleAnalyzer()(nextConfig)
  : nextConfig;

export default config;
