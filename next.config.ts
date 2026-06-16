import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Prisma's engine out of the server bundle so it loads natively.
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  // Admin photo uploads go through a Server Action; the default 1 MB body cap
  // is too small for real photos (the saver itself allows up to 6 MB files).
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  // Allow next/image to optimise admin-uploaded photos stored on Vercel Blob.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "i.ibb.co" },
    ],
  },
};

export default nextConfig;
