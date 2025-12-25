const admin = require("firebase-admin");
const { PrismaClient, UserRole } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const prisma = new PrismaClient();

const {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_NAME = "Learning Tracker Admin",
  ADMIN_ORG_ID,
  ADMIN_ORG_NAME = "Learning Tracker",
  FIREBASE_SERVICE_ACCOUNT_PATH,
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
} = process.env;

const initFirebase = () => {
  if (admin.apps.length) {
    return;
  }

  if (FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccountPath = path.resolve(FIREBASE_SERVICE_ACCOUNT_PATH);
    const raw = fs.readFileSync(serviceAccountPath, "utf-8");
    const serviceAccount = JSON.parse(raw);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    return;
  }

  if (
    FIREBASE_PROJECT_ID &&
    FIREBASE_CLIENT_EMAIL &&
    FIREBASE_PRIVATE_KEY
  ) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
    return;
  }

  throw new Error(
    "Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT_PATH or env vars."
  );
};

const ensureOrganization = async () => {
  if (ADMIN_ORG_ID) {
    const org = await prisma.organization.findUnique({
      where: { id: ADMIN_ORG_ID },
    });
    if (!org) {
      throw new Error(`Organization not found: ${ADMIN_ORG_ID}`);
    }
    return org.id;
  }

  const existing = await prisma.organization.findFirst({
    where: { name: ADMIN_ORG_NAME },
  });
  if (existing) {
    return existing.id;
  }

  const created = await prisma.organization.create({
    data: { name: ADMIN_ORG_NAME },
  });
  return created.id;
};

const ensureFirebaseUser = async () => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD env vars.");
  }

  try {
    const existing = await admin.auth().getUserByEmail(ADMIN_EMAIL);
    return await admin.auth().updateUser(existing.uid, {
      password: ADMIN_PASSWORD,
      displayName: ADMIN_NAME,
    });
  } catch (error) {
    if (error && error.code === "auth/user-not-found") {
      return await admin.auth().createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        displayName: ADMIN_NAME,
      });
    }
    throw error;
  }
};

const upsertAdminUser = async (uid, organizationId) => {
  let user = await prisma.user.findUnique({
    where: { firebaseUid: uid },
  });

  if (!user) {
    user = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });
  }

  if (user) {
    return prisma.user.update({
      where: { id: user.id },
      data: {
        firebaseUid: uid,
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        role: UserRole.ORG_ADMIN,
        organizationId,
      },
    });
  }

  return prisma.user.create({
    data: {
      firebaseUid: uid,
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: UserRole.ORG_ADMIN,
      organizationId,
    },
  });
};

const main = async () => {
  initFirebase();
  const firebaseUser = await ensureFirebaseUser();
  const organizationId = await ensureOrganization();
  const adminUser = await upsertAdminUser(
    firebaseUser.uid,
    organizationId
  );

  console.log("Admin user ready:");
  console.log({
    id: adminUser.id,
    email: adminUser.email,
    role: adminUser.role,
    organizationId: adminUser.organizationId,
    firebaseUid: adminUser.firebaseUid,
  });
};

main()
  .catch((error) => {
    console.error("Failed to create admin user:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
