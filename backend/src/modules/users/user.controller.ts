import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as userService from "./user.service";
import { broadcast } from "../../realtime/realtime";

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const user = await userService.getUserById(req.user!.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
};

export const updateMe = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { name } = req.body;

  if (name !== undefined && typeof name !== "string") {
    return res.status(400).json({ message: "name must be string" });
  }

  const updates: { name?: string | null } = {};
  if (name !== undefined) {
    updates.name = name.trim() || null;
  }

  if (!Object.keys(updates).length) {
    const user = await userService.getUserById(req.user!.id);
    return res.json(user);
  }

  const updated = await userService.updateUserById(
    req.user!.id,
    updates
  );

  broadcast({
    type: "users.changed",
    scope: { userId: req.user!.id },
  });

  res.json(updated);
};
