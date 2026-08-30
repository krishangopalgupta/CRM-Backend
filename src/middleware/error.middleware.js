const errorHandler = async (err, _, res, next) => {
  console.log(err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server error",
  });
};

export default errorHandler;
