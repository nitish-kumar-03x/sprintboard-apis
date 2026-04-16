const Task = require("../models/task");

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
      return res.status(400).json({
        success: false,
        message: "Please fill the required fields",
      });
    }

    if (new Date(startDate) > new Date(dueDate)) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after due date",
      });
    }

    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return res.status(400).json({
        success: false,
        message: "Progress must be between 0 and 100",
      });
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

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: newTask,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating task",
      error: error.message,
    });
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
    } = req.query;
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
    const tasks = await Task.find(filter);

    return res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully",
      data: tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving tasks",
      error: error.message,
    });
  }
};

module.exports = { createTask, getTasks };
