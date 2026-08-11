import { PrismaClient, UserRole, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

const locals = [
  { name: "Central Assembly", code: "CENT" },
  { name: "Wioso Assembly", code: "WIO" },
  { name: "Akroma Assembly", code: "AKRO" },
  { name: "Miracle Assembly", code: "MIR" },
  { name: "Revival Assembly", code: "REV" },
  { name: "Atrama Assembly", code: "ATRA" },
  { name: "Ampabame Assembly", code: "AMP" },
  { name: "Victory Assembly", code: "VIC" },
  { name: "Sasa Assembly", code: "SAS" },
  { name: "English Assembly", code: "ENG" },
  { name: "Bomso Assembly", code: "BOM" },
];

async function main() {
  console.log("🌱 Seeding database...");

  for (const local of locals) {
    await prisma.local.upsert({
      where: { code: local.code },
      update: {
        name: local.name,
      },
      create: {
        name: local.name,
        code: local.code,
      },
    });
  }

  const central = await prisma.local.findUnique({
    where: {
      code: "CENT",
    },
  });

  await prisma.user.upsert({
    where: {
      email: "andy@test.com",
    },
    update: {},
    create: {
      firstName: "Andy",
      lastName: "Admin",

      email: "andy@test.com",

      // Plain text for development only
      password: "password123",

      role: UserRole.ADMIN,
      status: UserStatus.APPROVED,

      isActive: true,

      localId: central?.id,
    },
  });

  console.log("✅ Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  