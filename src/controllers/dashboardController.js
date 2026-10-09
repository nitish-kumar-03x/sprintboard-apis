const dashboardService = require("../services/dashboardService");
const redisClient = require("../config/redis");
const sendResponse = require("../utils/responseHandler");
const errorHandler = require("../utils/errorHandler");

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `dashboard:${userId}`;

    // 1. Check Redis cache first
    try {
      if (redisClient.isOpen) {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          return sendResponse(
            res,
            200,
            true,
            "Dashboard data retrieved successfully",
            JSON.parse(cachedData)
          );
        }
      }
    } catch (redisError) {
      console.error("Redis get error:", redisError.message);
    }

    // 2. Fetch fresh data from service if not in cache
    const data = await dashboardService.getDashboardStats(userId);

    // 3. Cache data in Redis for 1 minute (60 seconds)
    try {
      if (redisClient.isOpen) {
        await redisClient.setEx(cacheKey, 60, JSON.stringify(data));
      }
    } catch (redisError) {
      console.error("Redis set error:", redisError.message);
    }

    return sendResponse(
      res,
      200,
      true,
      "Dashboard data retrieved successfully",
      data
    );
    } catch (error) {
    return errorHandler(error, res);
  }
};

module.exports = { getDashboard };
