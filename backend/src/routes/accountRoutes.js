// src/routes/accountRoutes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { exportAccountData, deleteAccount } from "../controllers/accountController.js";

const router = Router();

router.use(requireAuth);
router.get("/export", exportAccountData);
router.delete("/", deleteAccount);

export default router;