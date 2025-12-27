const { PrismaClient, UserRole } = require("@prisma/client");

const prisma = new PrismaClient();

const email = process.argv[2] || "admin@learningtracker.dev";
const name = process.argv[3] || "System Admin";
const placeholderUid = `seed:${email}`;

const run = async () => {
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: { role: UserRole.SYSTEM_ADMIN },
    });
    console.log(`Updated ${updated.email} to SYSTEM_ADMIN`);
    return;
  }

  const created = await prisma.user.create({
    data: {
      firebaseUid: placeholderUid,
      email,
      name,
      role: UserRole.SYSTEM_ADMIN,
    },
  });
  console.log(`Created system admin ${created.email}`);
};

run()
  .catch((error) => {
    console.error("Failed to promote system admin:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
