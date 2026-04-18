const verifiedMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: "Email verification required. Please verify your email to access this resource."
    });
  }

  next();
};

export default verifiedMiddleware;
