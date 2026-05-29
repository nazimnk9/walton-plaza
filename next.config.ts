import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.waltonplaza.com.bd',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'devcdn.waltonplaza.com.bd',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
