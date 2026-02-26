const errorMiddleware = (err, req, res, next) => {
  if(process.env.NODE_ENV !== "production") {
    console.error(`Error: ${err.message}` );
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

  // Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {});
    message = `Duplicate value for: ${field}. Please use another value!`;
    statusCode = 400;
  }

  // Validation error
  if (err.name === "ValidationError") {
    message = Object.values(err.errors).map((v) => v.message).join(", ");
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message: message,
  });
};

export default errorMiddleware;
