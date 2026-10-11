const errorHandler = (err, _, res, next) => {
  // console.error("=== ERROR DETAILS ===");
  // console.error("Message:", err.message);
  // console.error("Status:", err.statusCode || 500);
  // console.error("Name:", err.name);
  console.error("Stack trace:\n", err.stack);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    statusCode: err.statusCode || 500,
  });
};

export default errorHandler;

