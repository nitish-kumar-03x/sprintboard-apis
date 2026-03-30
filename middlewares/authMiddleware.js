const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const stoken = req.headers.stoken;

    if (!stoken) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const details = jwt.verify(stoken, process.env.JWT_SECRET);

    req.user = details;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;