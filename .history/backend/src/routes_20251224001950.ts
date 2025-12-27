import { Router } from "express";

const router = Router();

// Example health check
router.get("/health", (_, res) => {
  res.json({ status: "OK" });
});

export default router;
