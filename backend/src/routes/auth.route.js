import express from "express";
import { registerUser, loginUser, getAllUsers, refreshToken } from "../controllers/auth.controller.js";
import { logoutUser } from "../services/auth.service.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);
router.get("/", getAllUsers);

export default router;
