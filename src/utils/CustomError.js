class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}
module.exports = CustomError;
// For the Custom Errors like field required