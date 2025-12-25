import { requireRole } from "../src/middlewares/requireRole";
import type { AuthenticatedRequest } from "../src/middlewares/requireAuth";

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
