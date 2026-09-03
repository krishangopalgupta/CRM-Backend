const errorHandler = async (err, _, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server error",
    statusCode: err.statusCode || 500,
  });
};

export default errorHandler;
