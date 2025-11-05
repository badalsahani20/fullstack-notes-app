const errorMiddleware = (err, req, res, next) => {
  let error = err;

  console.error(err.stack);

  // Mongoose bad ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    error = new Error("Resource not found");
    error.statusCode = 404;
  }

  // Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue);
    error = new Error(`Duplicate ${field} entered`);
    error.statusCode = 400;
  }

  // Validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((v) => v.message).join(", ");
    error = new Error(message);
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

export default errorMiddleware;
