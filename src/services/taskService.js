const Task = require("../models/task");
const User = require("../models/user");
const CustomError = require("../utils/CustomError");

const createTask = async (data, userId) => {
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
  } = data;

  if (!title || !description || !assignedTo || !dueDate || !startDate) {
    throw new CustomError("Please fill the required fields", 400);
  }

  if (new Date(startDate) > new Date(dueDate)) {
    throw new CustomError("Start date cannot be after due date", 400);
  }

  if (progress !== undefined && (progress < 0 || progress > 100)) {
    throw new CustomError("Progress must be between 0 and 100", 400);
  }

  const newTask = await Task.create({
    title,
    description,
    status,
    priority,
    progress,
    createdBy: userId,
    assignedTo,
    dueDate,
    startDate,
    tags,
  });

  return newTask;
};

const getTasks = async (queryData) => {
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
  } = queryData;

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
    if (progressMin !== undefined) filter.progress.$gte = parseInt(progressMin);
    if (progressMax !== undefined) filter.progress.$lte = parseInt(progressMax);
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

  return {
    tasks,
    pagination: {
      currentPage: pageNum,
      pageSize: limitNum,
      totalItems: totalCount,
      totalPages: totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  };
};

const getTaskById = async (id) => {
  if (!id) {
    throw new CustomError("Task ID is Required.", 400);
  }

  const task = await Task.findOne({ _id: id, isDeleted: false })
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .populate("comments.user", "name email");

  if (!task) {
    throw new CustomError("Task not found", 404);
  }

  return task;
};

const updateTask = async (id, data) => {
  const { title, description, dueDate, startDate, tags } = data;

  if (!id) {
    throw new CustomError("Task ID is Required.", 400);
  }

  const task = await Task.findOne({ _id: id, isDeleted: false });

  if (!task) {
    throw new CustomError("Task not found", 404);
  }

  if (startDate && dueDate && new Date(startDate) > new Date(dueDate)) {
    throw new CustomError("Start date cannot be after due date", 400);
  }

  const updatedTask = await Task.findByIdAndUpdate(
    id,
    { title, description, dueDate, startDate, tags },
    { new: true, runValidators: true }
  )
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .populate("comments.user", "name email");

  return updatedTask;
};

const deleteTask = async (id) => {
  if (!id) {
    throw new CustomError("Task ID is Required.", 400);
  }

  const task = await Task.findOne({ _id: id, isDeleted: false });

  if (!task) {
    throw new CustomError("Task not found", 404);
  }

  await Task.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};

const assignTask = async (id, assignedTo) => {
  if (!id || !assignedTo) {
    throw new CustomError("Task ID and assignedTo are required", 400);
  }

  if (
    !id.match(/^[0-9a-fA-F]{24}$/) ||
    !assignedTo.match(/^[0-9a-fA-F]{24}$/)
  ) {
    throw new CustomError("Invalid MongoDB ObjectId format", 400);
  }

  const task = await Task.findOne({ _id: id, isDeleted: false });

  if (!task) {
    throw new CustomError("Task not found", 404);
  }

  const userExists = await User.findById(assignedTo);
  if (!userExists) {
    throw new CustomError("User with provided ID does not exist", 404);
  }

  const updatedTask = await Task.findByIdAndUpdate(
    id,
    { assignedTo },
    { new: true }
  )
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .populate("comments.user", "name email");

  return updatedTask;
};

const reassignTask = async (id, assignedTo) => {
  if (!id || !assignedTo) {
    throw new CustomError("Task ID and assignedTo are required", 400);
  }

  const task = await Task.findOne({ _id: id, isDeleted: false });

  if (!task) {
    throw new CustomError("Task not found", 404);
  }

  const userExists = await User.findById(assignedTo);
  if (!userExists) {
    throw new CustomError("User with provided ID does not exist", 404);
  }

  const updatedTask = await Task.findByIdAndUpdate(
    id,
    { assignedTo: assignedTo },
    { new: true }
  )
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .populate("comments.user", "name email");

  return updatedTask;
};

const updateTaskStatus = async (id, status) => {
  if (!id || !status) {
    throw new CustomError("Task ID and status are required", 400);
  }

  const validStatuses = [
    "TODO",
    "IN_PROGRESS",
    "COMPLETED",
    "BLOCKED",
    "CANCELLED",
  ];
  if (!validStatuses.includes(status)) {
    throw new CustomError(
      `Status must be one of: ${validStatuses.join(", ")}`,
      400
    );
  }

  const task = await Task.findOne({ _id: id, isDeleted: false });

  if (!task) {
    throw new CustomError("Task not found", 404);
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

  return updatedTask;
};

const addComment = async (id, message, userId) => {
  if (!id || !message) {
    throw new CustomError("Task ID and message are required", 400);
  }

  const task = await Task.findOne({ _id: id, isDeleted: false });

  if (!task) {
    throw new CustomError("Task not found", 404);
  }

  const newComment = {
    user: userId,
    message,
    isEdited: false,
  };

  task.comments.push(newComment);
  await task.save();

  const updatedTask = await Task.findById(id)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .populate("comments.user", "name email");

  return updatedTask;
};

const updateProgress = async (id, progress) => {
  if (!id || progress === undefined) {
    throw new CustomError("Task ID and progress are required", 400);
  }

  if (progress < 0 || progress > 100) {
    throw new CustomError("Progress must be between 0 and 100", 400);
  }

  const task = await Task.findOne({ _id: id, isDeleted: false });

  if (!task) {
    throw new CustomError("Task not found", 404);
  }

  const updatedTask = await Task.findByIdAndUpdate(
    id,
    { progress },
    { new: true }
  )
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .populate("comments.user", "name email"); // Wait, assignedTo isn't a function, fixing typo...

  return updatedTask;
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
