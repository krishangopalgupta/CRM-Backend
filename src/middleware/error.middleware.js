const errorHandler = async (err, req, res, next) => {
  console.log(err);
  res.status(500).json({
    success: false,
    message: "internal server error",
  });
};

export default errorHandler