import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: npm run make-admin <email>");
    process.exit(1);
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(
      `No account with email "${email}". Sign up on the site first, then run again.`,
    );
    process.exit(1);
  }
  await prisma.user.update({ where: { email }, data: { role: "admin" } });
  console.log(`✓ ${email} is now an admin. Open /admin to manage the catalogue.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
