
const errorHandler = (error, res) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    data:error.stack
  });
};

module.exports = errorHandler;
