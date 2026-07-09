import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { generateRoadmap, getRoadmap, searchResources } from "../controllers/resourceController.js";

const router = Router();

router.use(requireAuth);

router.get("/roadmap", getRoadmap);
router.post("/roadmap/generate", generateRoadmap);
router.get("/search", searchResources);

export default router;