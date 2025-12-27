import { Router } from "express";
import orgRoutes from "./modules/organizations/organization.routes";
import courseRoutes from "./modules/courses/course.routes";
import enrollmentRoutes from "./modules/enrollments/enrollment.routes";



const router = Router();

router.get("/health", (_, res) => {
  res.json({ status: "OK" });
});

router.use("/organizations", orgRoutes);
router.use("/courses", courseRoutes);
router.use("/enrollments", enrollmentRoutes);
export default router;
