import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // env: {
    //   NEXT_PUBLIC_API_URL: "https://api.sultan-bazar.com/api/v1",
    // },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;