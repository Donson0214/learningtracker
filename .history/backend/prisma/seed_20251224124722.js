import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─────────────────────────────
  // ORG
  // ─────────────────────────────
  const org = await prisma.organization.create({
    data: {
      name: "Demo Learning Org",
    },
  });

  // ─────────────────────────────
  // USERS
  // ─────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: "admin@demo.com",
      name: "Org Admin",
      role: UserRole.ORG_ADMIN,
      organizationId: org.id,
    },
  });

  const learner = await prisma.user.create({
    data: {
      email: "learner@demo.com",
      name: "Demo Learner",
      role: UserRole.LEARNER,
      organizationId: org.id,
    },
  });

  // ─────────────────────────────
  // COURSE
  // ─────────────────────────────
  const course = await prisma.course.create({
    data: {
      title: "Backend Development",
      description: "Node, Prisma, APIs",
      organizationId: org.id,
    },
  });

  // ─────────────────────────────
  // MODULES
  // ─────────────────────────────
  const module1 = await prisma.module.create({
    data: {
      title: "Introduction",
      order: 1,
      courseId: course.id,
    },
  });

  const module2 = await prisma.module.create({
    data: {
      title: "Advanced Prisma",
      order: 2,
      courseId: course.id,
    },
  });

  // ─────────────────────────────
  // LESSONS
  // ─────────────────────────────
  await prisma.lesson.createMany({
    data: [
      {
        title: "What is Backend?",
        order: 1,
        estimatedMinutes: 20,
        moduleId: module1.id,
      },
      {
        title: "REST APIs",
        order: 2,
        estimatedMinutes: 30,
        moduleId: module1.id,
      },
      {
        title: "Prisma Relations",
        order: 1,
        estimatedMinutes: 40,
        moduleId: module2.id,
      },
    ],
  });

  // ─────────────────────────────
  // ENROLLMENT
  // ─────────────────────────────
  await prisma.enrollment.create({
    data: {
      userId: learner.id,
      courseId: course.id,
    },
  });

  // ─────────────────────────────
  // STUDY SESSION
  // ─────────────────────────────
  await prisma.studySession.create({
    data: {
      userId: learner.id,
      courseId: course.id,
      moduleId: module1.id,
      durationMinutes: 45,
      studiedAt: new Date(),
      notes: "Good progress",
      mood: "focused",
    },
  });

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
