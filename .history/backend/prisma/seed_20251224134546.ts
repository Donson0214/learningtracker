import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─────────────────────────────
  // ORGANIZATION
  // ─────────────────────────────
  const org = await prisma.organization.create({
    data: {
      name: "Demo Learning Organization",
    },
  });

  // ─────────────────────────────
  // USERS (Firebase UID = dummy)
  // ─────────────────────────────
  const admin = await prisma.user.create({
    data: {
      firebaseUid: "firebase-admin-demo-uid",
      email: "admin@demo.com",
      name: "Demo Admin",
      role: UserRole.ORG_ADMIN,
      organizationId: org.id,
    },
  });

  const learner = await prisma.user.create({
    data: {
      firebaseUid: "firebase-learner-demo-uid",
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
      title: "Backend Development with Node.js",
      description: "Learn APIs, Prisma, and backend architecture",
      estimatedHours: 10,
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
  const lesson1 = await prisma.lesson.create({
    data: {
      title: "What is Backend?",
      estimatedMinutes: 20,
      moduleId: module1.id,
    },
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      title: "REST APIs",
      estimatedMinutes: 30,
      moduleId: module1.id,
    },
  });

  const lesson3 = await prisma.lesson.create({
    data: {
      title: "Prisma Relations",
      estimatedMinutes: 40,
      moduleId: module2.id,
    },
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

  // ─────────────────────────────
  // STUDY PLAN
  // ─────────────────────────────
  const studyPlan = await prisma.studyPlan.create({
    data: {
      userId: learner.id,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    },
  });

  await prisma.studyPlanItem.createMany({
    data: [
      {
        studyPlanId: studyPlan.id,
        courseId: course.id,
        moduleId: module1.id,
        scheduledDate: new Date(),
        durationMinutes: 30,
      },
      {
        studyPlanId: studyPlan.id,
        courseId: course.id,
        moduleId: module2.id,
        scheduledDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        durationMinutes: 40,
      },
    ],
  });

  // ─────────────────────────────
  // NOTIFICATION
  // ─────────────────────────────
  await prisma.notification.create({
    data: {
      userId: learner.id,
      title: "Welcome 🎉",
      body: "Your learning journey has started!",
    },
  });

  console.log("✅ Seed completed successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
