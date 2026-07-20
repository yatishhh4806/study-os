// src/routes/accountRoutes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { deleteAccount } from "../controllers/accountController.js";

const router = Router();

router.use(requireAuth);
router.delete("/", deleteAccount);

export default router;