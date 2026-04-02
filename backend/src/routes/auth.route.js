    import express from "express";
    import { registerUser, loginUser, getAllUsers, refreshToken, logoutUser, getMe, googleCallback, forgotPassword, resetPassword, getShowcaseUsers } from "../controllers/auth.controller.js";
    import authMiddleware from "../middleware/auth.middleware.js";
    import passport from "passport";


    const router = express.Router();
    //public routes
    router.post("/register", registerUser);
    router.post("/login", loginUser);
    router.post("/refresh", refreshToken);
    router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
    router.get("/google/callback", passport.authenticate("google", { session: false }), googleCallback);
    router.get("/showcase", getShowcaseUsers);

    //protected routes
    router.post("/logout", logoutUser);
    router.get("/me", authMiddleware, getMe);
    router.post("/forgot-password", forgotPassword);
    router.post("/reset-password/:token", resetPassword);

    //For testing purpose
    router.get("/", authMiddleware, getAllUsers);

    export default router;
