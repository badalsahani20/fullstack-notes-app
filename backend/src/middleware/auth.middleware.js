import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const refreshToken = req.cookies?.refreshToken;

  try {
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      req.user = user;
      return next();
    }

    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
      const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

      const user = await User.findOne({
        _id: decoded.id,
        "refreshToken.token": hashedRefreshToken,
      }).select("-password");

      if (!user) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      req.user = user;
      return next();
    }

    return res.status(401).json({
      message: "Token not found, authorization denied",
    });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
      error:
        process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
};

export default authMiddleware;
