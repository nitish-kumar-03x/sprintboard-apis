const Task = require("../models/task");
const User = require("../models/user");
const sendResponse = require("../utils/responseHandler");
const errorHandler = require("../utils/errorHandler");

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      progress,
      assignedTo,
      dueDate,
      startDate,
      tags,
    } = req.body;

    if (!title || !description || !assignedTo || !dueDate || !startDate) {
      return sendResponse(res, 400, false, "Please fill the required fields");
    }

    if (new Date(startDate) > new Date(dueDate)) {
      return sendResponse(res, 400, false, "Start date cannot be after due date");
    }

    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return sendResponse(res, 400, false, "Progress must be between 0 and 100");
    }

    const newTask = await Task.create({
      title,
      description,
      status,
      priority,
      progress,
      createdBy: req.user.id,
      assignedTo,
      dueDate,
      startDate,
      tags,
    });

    return sendResponse(res, 201, true, "Task created successfully", newTask);
  } catch (error) {
    return errorHandler(error, res);
  }
};

const getTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      dueDate,
      assignedTo,
      createdBy,
      progressMin,
      progressMax,
      page = 1,
      limit = 10,
    } = req.body;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    let filter = { isDeleted: false };
    if (status) filter.status = status;
    if (createdBy) filter.createdBy = createdBy;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (progressMin !== undefined || progressMax !== undefined) {
      filter.progress = {};
      if (progressMin !== undefined)
        filter.progress.$gte = parseInt(progressMin);
      if (progressMax !== undefined)
        filter.progress.$lte = parseInt(progressMax);
    }
    if (dueDate) {
      const date = new Date(dueDate);
      filter.dueDate = { $lte: date };
    }

    const totalCount = await Task.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limitNum);

    const tasks = await Task.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .skip(skip)
      .limit(limitNum);

    return sendResponse(res, 200, true, "Tasks retrieved successfully", {
      tasks,
      pagination: {
        currentPage: pageNum,
        pageSize: limitNum,
        totalItems: totalCount,
        totalPages: totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    return errorHandler(error, res);
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendResponse(res, 400, false, "Task ID is Required.");
    }

    const task = await Task.findOne({ _id: id, isDeleted: false })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("comments.user", "name email");

    if (!task) {
      return sendResponse(res, 404, false, "Task not found");
    }

    return sendResponse(res, 200, true, "Task retrieved successfully", task);
  } catch (error) {
    return errorHandler(error, res);
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, startDate, tags } = req.body;

    if (!id) {
      return sendResponse(res, 400, false, "Task ID is Required.");
    }

    const task = await Task.findOne({ _id: id, isDeleted: false });

    if (!task) {
      return sendResponse(res, 404, false, "Task not found");
    }

    if (startDate && dueDate && new Date(startDate) > new Date(dueDate)) {
      return sendResponse(res, 400, false, "Start date cannot be after due date");
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { title, description, dueDate, startDate, tags },
      { new: true, runValidators: true },
    )
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("comments.user", "name email");

    return sendResponse(res, 200, true, "Task updated successfully", updatedTask);
  } catch (error) {
    return errorHandler(error, res);
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendResponse(res, 400, false, "Task ID is Required.");
    }

    const task = await Task.findOne({ _id: id, isDeleted: false });

    if (!task) {
      return sendResponse(res, 404, false, "Task not found");
    }

    await Task.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    );

    return sendResponse(res, 200, true, "Task deleted successfully");
  } catch (error) {
    return errorHandler(error, res);
  }
};

const assignTask = async (req, res) => {
  try {
    const { id, assignedTo } = req.body;

    if (!id || !assignedTo) {
      return sendResponse(res, 400, false, "Task ID and assignedTo are required");
    }

    if (
      !id.match(/^[0-9a-fA-F]{24}$/) ||
      !assignedTo.match(/^[0-9a-fA-F]{24}$/)
    ) {
      return sendResponse(res, 400, false, "Invalid MongoDB ObjectId format");
    }

    const task = await Task.findOne({ _id: id, isDeleted: false });

    if (!task) {
      return sendResponse(res, 404, false, "Task not found");
    }

    const userExists = await User.findById(assignedTo);
    if (!userExists) {
      return sendResponse(res, 404, false, "User with provided ID does not exist");
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { assignedTo },
      { new: true },
    )
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("comments.user", "name email");

    return sendResponse(res, 200, true, "Task assigned successfully", updatedTask);
  } catch (error) {
    return errorHandler(error, res);
  }
};

const reassignTask = async (req, res) => {
  try {
    const { id, assignedTo } = req.body;

    if (!id || !assignedTo) {
      return sendResponse(res, 400, false, "Task ID and assignedTo are required");
    }

    const task = await Task.findOne({ _id: id, isDeleted: false });

    if (!task) {
      return sendResponse(res, 404, false, "Task not found");
    }

    const userExists = await User.findById(assignedTo);
    if (!userExists) {
      return sendResponse(res, 404, false, "User with provided ID does not exist");
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { assignedTo:assignedTo },
      { new: true },
    )
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("comments.user", "name email");

    return sendResponse(res, 200, true, "Task reassigned successfully", updatedTask);
  } catch (error) {
    return errorHandler(error, res);
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.body;
    const { status } = req.body;

    if (!id || !status) {
      return sendResponse(res, 400, false, "Task ID and status are required");
    }

    const validStatuses = [
      "TODO",
      "IN_PROGRESS",
      "COMPLETED",
      "BLOCKED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      return sendResponse(res, 400, false, `Status must be one of: ${validStatuses.join(", ")}`);
    }

    const task = await Task.findOne({ _id: id, isDeleted: false });

    if (!task) {
      return sendResponse(res, 404, false, "Task not found");
    }

    const updateData = { status };
    if (status === "COMPLETED") {
      updateData.completedAt = new Date();
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("comments.user", "name email");

    return sendResponse(res, 200, true, "Task status updated successfully", updatedTask);
  } catch (error) {
    return errorHandler(error, res);
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.body;
    const { message } = req.body;

    if (!id || !message) {
      return sendResponse(res, 400, false, "Task ID and message are required");
    }

    const task = await Task.findOne({ _id: id, isDeleted: false });

    if (!task) {
      return sendResponse(res, 404, false, "Task not found");
    }

    const newComment = {
      user: req.user.id,
      message,
      isEdited: false,
    };

    task.comments.push(newComment);
    await task.save();

    const updatedTask = await Task.findById(id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("comments.user", "name email");

    return sendResponse(res, 201, true, "Comment added successfully", updatedTask);
  } catch (error) {
    return errorHandler(error, res);
  }
};

const updateProgress = async (req, res) => {
  try {
    const { id } = req.body;
    const { progress } = req.body;

    if (!id || progress === undefined) {
      return sendResponse(res, 400, false, "Task ID and progress are required");
    }

    if (progress < 0 || progress > 100) {
      return sendResponse(res, 400, false, "Progress must be between 0 and 100");
    }

    const task = await Task.findOne({ _id: id, isDeleted: false });

    if (!task) {
      return sendResponse(res, 404, false, "Task not found");
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { progress },
      { new: true },
    )
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("comments.user", "name email");

    return sendResponse(res, 200, true, "Task progress updated successfully", updatedTask);
  } catch (error) {
    return errorHandler(error, res);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  reassignTask,
  updateTaskStatus,
  addComment,
  updateProgress,
};
