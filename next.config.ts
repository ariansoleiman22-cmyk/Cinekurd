import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Prisma's engine out of the server bundle so it loads natively.
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
};

export default nextConfig;
