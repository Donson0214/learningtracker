import { requireRole } from "../src/middlewares/requireRole";
import { requireActiveOrganization } from "../src/middlewares/requireActiveOrganization";
import { ensureUserEnrolled } from "../src/modules/enrollments/enrollment.guard";
import type { AuthenticatedRequest } from "../src/middlewares/requireAuth";
import { prisma } from "../src/prisma";

jest.mock("../src/prisma", () => ({
  prisma: {
    organization: { findUnique: jest.fn() },
    enrollment: { findFirst: jest.fn() },
  },
}));

const prismaMock = prisma as {
  organization: { findUnique: jest.Mock };
  enrollment: { findFirst: jest.Mock };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("requireRole", () => {
  it("allows user with allowed role", () => {
    const req = {
      user: { id: "u1", role: "ORG_ADMIN", organizationId: null },
    } as AuthenticatedRequest;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    const middleware = requireRole(["ORG_ADMIN"]);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("blocks user with disallowed role", () => {
    const req = {
      user: { id: "u1", role: "LEARNER", organizationId: null },
    } as AuthenticatedRequest;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    const middleware = requireRole(["ORG_ADMIN"]);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
    expect(next).not.toHaveBeenCalled();
  });
});

describe("requireActiveOrganization", () => {
  it("skips when user has no organization", async () => {
    const req = {
      user: { id: "u1", role: "LEARNER", organizationId: null },
    } as AuthenticatedRequest;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    await requireActiveOrganization(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(prismaMock.organization.findUnique).not.toHaveBeenCalled();
  });

  it("blocks inactive organization", async () => {
    prismaMock.organization.findUnique.mockResolvedValue({
      isActive: false,
    });

    const req = {
      user: { id: "u1", role: "LEARNER", organizationId: "org-1" },
    } as AuthenticatedRequest;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    await requireActiveOrganization(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Organization is inactive",
    });
    expect(next).not.toHaveBeenCalled();
  });
});

describe("ensureUserEnrolled", () => {
  it("allows enrolled users", async () => {
    prismaMock.enrollment.findFirst.mockResolvedValue({
      id: "enroll-1",
    });

    await expect(
      ensureUserEnrolled("user-1", "course-1")
    ).resolves.toBeUndefined();
  });

  it("throws when user is not enrolled", async () => {
    prismaMock.enrollment.findFirst.mockResolvedValue(null);

    await expect(
      ensureUserEnrolled("user-1", "course-1")
    ).rejects.toThrow("User is not enrolled in this course");
  });
});
