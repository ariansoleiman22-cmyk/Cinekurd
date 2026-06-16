import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Prisma's engine out of the server bundle so it loads natively.
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  // Allow next/image to optimise admin-uploaded photos stored on Vercel Blob.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "i.ibb.co" },
    ],
  },
};

export default nextConfig;
