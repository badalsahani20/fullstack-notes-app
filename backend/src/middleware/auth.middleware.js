import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      res
        .status(401)
        .json({ message: "Token not found, Authorization Denied" }); //401 Unauthorized
      return;
    }
    
    //Verification
    try {
      const decode = jwt.verify(token, process.env.ACCESS_SECRET);
      const user = await User.findById(decode.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User no longer exists" });
      }
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token",
      error: process.env.NODE_ENV !== "production" ? error.message : undefined });
    }
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({ message: "Internal Server Error during Authentication" });
  }
};

export default authMiddleware;