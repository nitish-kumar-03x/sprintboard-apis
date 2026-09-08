const taskService = require("../services/taskService");
const sendResponse = require("../utils/responseHandler");
const errorHandler = require("../utils/errorHandler");

const createTask = async (req, res) => {
  try {
    const task = await taskService.createTask(req.body, req.user.id);
    return sendResponse(res, 201, true, "Task created successfully", task);
  } catch (error) {
    return errorHandler(error, res);
  }
};

const getTasks = async (req, res) => {
  try {
    const data = await taskService.getTasks(req.body);
    return sendResponse(res, 200, true, "Tasks retrieved successfully", data);
  } catch (error) {
    return errorHandler(error, res);
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    return sendResponse(res, 200, true, "Task retrieved successfully", task);
  } catch (error) {
    return errorHandler(error, res);
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body);
    return sendResponse(res, 200, true, "Task updated successfully", task);
  } catch (error) {
    return errorHandler(error, res);
  }
};

const deleteTask = async (req, res) => {
  try {
    await taskService.deleteTask(req.params.id);
    return sendResponse(res, 200, true, "Task deleted successfully");
  } catch (error) {
    return errorHandler(error, res);
  }
};

const assignTask = async (req, res) => {
  try {
    const task = await taskService.assignTask(req.body.id, req.body.assignedTo);
    return sendResponse(res, 200, true, "Task assigned successfully", task);
  } catch (error) {
    return errorHandler(error, res);
  }
};

const reassignTask = async (req, res) => {
  try {
    const task = await taskService.reassignTask(
      req.body.id,
      req.body.assignedTo
    );
    return sendResponse(res, 200, true, "Task reassigned successfully", task);
  } catch (error) {
    return errorHandler(error, res);
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const task = await taskService.updateTaskStatus(
      req.body.id,
      req.body.status
    );
    return sendResponse(
      res,
      200,
      true,
      "Task status updated successfully",
      task
    );
  } catch (error) {
    return errorHandler(error, res);
  }
};

const addComment = async (req, res) => {
  try {
    const task = await taskService.addComment(
      req.body.id,
      req.body.message,
      req.user.id
    );
    return sendResponse(res, 201, true, "Comment added successfully", task);
  } catch (error) {
    return errorHandler(error, res);
  }
};

const updateProgress = async (req, res) => {
  try {
    const task = await taskService.updateProgress(
      req.body.id,
      req.body.progress
    );
    return sendResponse(
      res,
      200,
      true,
      "Task progress updated successfully",
      task
    );
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
