const errorMiddleware = (err, req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(`Error: ${err.message}`);
    console.error(err.stack);
  }

  // 2. Default error state
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server Error";

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    message = `Resource not found (Invalid ID format)`;
    statusCode = 404;
  }

  // Add this near your other Mongoose handlers
  if (err.statusCode === 409) {
    message =
      err.message ||
      "Conflict detected: Data has been modified by another device.";
  }

  // Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {});
    message = `Duplicate value for: ${field}. Please use another value!`;
    statusCode = 400;
  }

  // Validation error
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((v) => v.message)
      .join(", ");
    statusCode = 400;
  }

  if (err.statusCode === 403) {
    res.clearCookie("refreshToken");
  }

  res.status(statusCode).json({
    success: false,
    message: message,
  });
};

export default errorMiddleware;
