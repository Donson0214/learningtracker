import request from "supertest";
import app from "../src/app";

jest.mock("../src/middlewares/requireAuth", () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = {
      id: "user-1",
      role: "LEARNER",
      organizationId: null,
    };
    next();
  },
}));

jest.mock("../src/modules/users/user.service", () => ({
  getUserById: jest.fn(async () => ({
    id: "user-1",
    email: "user@example.com",
    name: "Test User",
    role: "LEARNER",
    organizationId: null,
  })),
}));

describe("auth + protected route integration", () => {
  it("returns user profile when authenticated", async () => {
    const res = await request(app).get("/api/users/me");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: "user-1",
      email: "user@example.com",
      name: "Test User",
      role: "LEARNER",
    });
  });
});
