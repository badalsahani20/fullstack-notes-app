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

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decode.id);

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: "Unauthorized", error: error.message });
    }
  } catch (error) {}
};

export default authMiddleware;