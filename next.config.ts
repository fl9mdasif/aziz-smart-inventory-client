import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Every image (product/category thumbnails, avatars) goes through
      // /api/upload -> Cloudinary — a wildcard hostname here lets anyone
      // abuse the image optimizer as an open URL-fetching proxy.
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;