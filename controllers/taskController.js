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

module.exports = { createTask };