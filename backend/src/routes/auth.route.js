import express from "express";
import { registerUser, loginUser, getAllUsers, refreshToken, logoutUser, getMe } from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";


const router = express.Router();
//public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);

//protected routes
router.post("/logout", logoutUser);
router.get("/me", authMiddleware, getMe);

//For testing purpose
router.get("/", authMiddleware, getAllUsers);

export default router;
