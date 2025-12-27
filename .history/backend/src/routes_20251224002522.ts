import { Router } from "express";
import orgRoutes from "./modules/organizations/organization.routes";

const router = Router();

router.get("/health", (_, res) => {
  res.json({ status: "OK" });
});

router.use("/organizations", orgRoutes);

export default router;
