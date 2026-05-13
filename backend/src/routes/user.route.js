import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { getStats, updateProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/stats", authMiddleware, getStats);
router.put("/profile", authMiddleware, updateProfile);

export default router;