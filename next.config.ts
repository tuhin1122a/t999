import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.51939393.com" },
      { protocol: "https", hostname: "c.animaapp.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "igamingapis.com" },
      { protocol: "https", hostname: "igamingapis.live" },
      { protocol: "https", hostname: "**.gamexaglobal.com" },
      { protocol: "https", hostname: "**.jlfafafa3.com" },
      { protocol: "https", hostname: "**.wbgame.com" },
      { protocol: "https", hostname: "jsgame.live" },
    ],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: process.env.NEXT_PUBLIC_SERVER_URL || "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
