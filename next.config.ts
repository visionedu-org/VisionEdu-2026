import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "enem.dev",
        pathname: "/**",
      },
    ],
  },
};

module.exports = {
  allowedDevOrigins: ['26.251.178.27'],
}

const config = process.env.ANALYZE === "true"
  ? withBundleAnalyzer()(nextConfig)
  : nextConfig;

export default config;
