const dashboardService = require("../services/dashboardService");
const sendResponse = require("../utils/responseHandler");
const errorHandler = require("../utils/errorHandler");

const getDashboard = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardStats(req.user.id);
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
