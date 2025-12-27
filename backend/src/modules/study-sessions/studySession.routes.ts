import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { requireActiveOrganization } from "../../middlewares/requireActiveOrganization";
import {
  createSession,
  listMySessions,
  updateSession,
  deleteSession,
} from "./studySession.controller";

const router = Router();

router.use(requireAuth);
router.use(requireActiveOrganization);

// LEARNER ONLY
router.post("/", createSession);
router.get("/", listMySessions);
router.get("/me", listMySessions);
router.put("/:id", updateSession);
router.delete("/:id", deleteSession);

export default router;
