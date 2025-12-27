const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const keepEmails = new Set();
let keepSystemAdmins = true;
let dryRun = false;
let confirmed = false;

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === "--keep-email" || arg === "--keep") {
    const email = args[i + 1];
    if (!email) {
      console.error("Missing email after --keep-email");
      process.exit(1);
    }
    keepEmails.add(email.toLowerCase());
    i += 1;
  } else if (arg === "--no-keep-system-admins") {
    keepSystemAdmins = false;
  } else if (arg === "--dry-run") {
    dryRun = true;
  } else if (arg === "--confirm") {
    confirmed = true;
  }
}

const envConfirm = process.env.SAFE_RESET_CONFIRM;
if (!confirmed && envConfirm !== "YES") {
  console.log("Safe reset aborted.");
  console.log("Run with --confirm or set SAFE_RESET_CONFIRM=YES");
  process.exit(1);
}

const envKeep = process.env.SAFE_RESET_KEEP_EMAILS;
if (envKeep) {
  envKeep
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .forEach((email) => keepEmails.add(email));
}

const describeKeep = (users) => {
  if (!users.length) {
    return "none";
  }
  return users.map((user) => `${user.email} (${user.role})`).join(", ");
};

const run = async () => {
  const keepUsers = [];

  if (keepSystemAdmins) {
    const systemAdmins = await prisma.user.findMany({
      where: { role: "SYSTEM_ADMIN" },
      select: { id: true, email: true, role: true },
    });
    keepUsers.push(...systemAdmins);
  }

  if (keepEmails.size) {
    const emailUsers = await prisma.user.findMany({
      where: { email: { in: Array.from(keepEmails) } },
      select: { id: true, email: true, role: true },
    });
    keepUsers.push(...emailUsers);
  }

  const keepById = new Map();
  keepUsers.forEach((user) => {
    keepById.set(user.id, user);
  });
  const keepList = Array.from(keepById.values());
  const keepIds = keepList.map((user) => user.id);

  if (dryRun) {
    console.log("Safe reset dry-run.");
    console.log(`Keep users: ${describeKeep(keepList)}`);
    await prisma.$disconnect();
    return;
  }

  if (keepIds.length) {
    await prisma.user.updateMany({
      where: { id: { in: keepIds } },
      data: { organizationId: null },
    });
    await prisma.user.updateMany({
      where: { id: { in: keepIds }, role: { not: "SYSTEM_ADMIN" } },
      data: { role: "LEARNER" },
    });
  }

  await prisma.studyPlanItem.deleteMany({});
  await prisma.studyPlan.deleteMany({});
  await prisma.studySession.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.studyGoal.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.deviceToken.deleteMany({});
  await prisma.organizationInvite.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.course.deleteMany({});

  if (keepIds.length) {
    await prisma.user.deleteMany({
      where: { id: { notIn: keepIds } },
    });
  } else {
    await prisma.user.deleteMany({});
  }

  await prisma.organization.deleteMany({});

  console.log("Safe reset complete.");
  console.log(`Kept users: ${describeKeep(keepList)}`);
};

run()
  .catch((error) => {
    console.error("Safe reset failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
