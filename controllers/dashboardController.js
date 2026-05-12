const Task = require("../models/task");
const sendResponse = require("../utils/responseHandler");
const errorHandler = require("../utils/errorHandler");

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalTasks = await Task.countDocuments({ isDeleted: false });
    const completedTasks = await Task.countDocuments({
      status: "COMPLETED",
      isDeleted: false,
    });
    const inProgressTasks = await Task.countDocuments({
      status: "IN_PROGRESS",
      isDeleted: false,
    });
    const blockedTasks = await Task.countDocuments({
      status: "BLOCKED",
      isDeleted: false,
    });
    const todoTasks = await Task.countDocuments({
      status: "TODO",
      isDeleted: false,
    });

    const userTasks = await Task.countDocuments({
      assignedTo: userId,
      isDeleted: false,
    });
    const userCompletedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "COMPLETED",
      isDeleted: false,
    });
    const userInProgressTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "IN_PROGRESS",
      isDeleted: false,
    });

    const recentTasks = await Task.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    const tasksCreatedByUser = await Task.countDocuments({
      createdBy: userId,
      isDeleted: false,
    });

    const highPriorityTasks = await Task.countDocuments({
      priority: "HIGH",
      isDeleted: false,
    });
    const urgentPriorityTasks = await Task.countDocuments({
      priority: "URGENT",
      isDeleted: false,
    });

    return sendResponse(res, 200, true, "Dashboard data retrieved successfully", {
      overview: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        blockedTasks,
        todoTasks,
      },
      userStats: {
        userTasks,
        userCompletedTasks,
        userInProgressTasks,
        tasksCreatedByUser,
      },
      priorityStats: {
        highPriorityTasks,
        urgentPriorityTasks,
      },
      recentTasks,
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

module.exports = { getDashboard };
