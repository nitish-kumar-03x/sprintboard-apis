const pool = require("../config/database");
const CustomError = require("../utils/CustomError");

const mapTaskResult = (row) => {
  if (!row) return null;
  const task = {
    _id: row.id,
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    progress: row.progress,
    dueDate: row.dueDate,
    startDate: row.startDate,
    completedAt: row.completedAt,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
    isDeleted: row.isDeleted,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.creatorId ? {
      _id: row.creatorId,
      name: row.creatorName,
      email: row.creatorEmail
    } : null,
    assignedTo: row.assigneeId ? {
      _id: row.assigneeId,
      name: row.assigneeName,
      email: row.assigneeEmail
    } : null
  };
  return task;
};

const getTaskByIdHelper = async (id) => {
  const [tasks] = await pool.query(`
    SELECT t.*, 
      c.id as creatorId, c.name as creatorName, c.email as creatorEmail, 
      a.id as assigneeId, a.name as assigneeName, a.email as assigneeEmail 
    FROM Tasks t 
    LEFT JOIN Users c ON t.createdBy = c.id 
    LEFT JOIN Users a ON t.assignedTo = a.id 
    WHERE t.id = ? AND t.isDeleted = FALSE
  `, [id]);
  
  if (tasks.length === 0) return null;
  
  const task = mapTaskResult(tasks[0]);
  
  const [comments] = await pool.query(`
    SELECT tc.*, u.id as userId, u.name as userName, u.email as userEmail
    FROM TaskComments tc
    JOIN Users u ON tc.userId = u.id
    WHERE tc.taskId = ?
    ORDER BY tc.createdAt ASC
  `, [id]);
  
  task.comments = comments.map(c => ({
    _id: c.id,
    message: c.message,
    isEdited: c.isEdited,
    createdAt: c.createdAt,
    user: {
      _id: c.userId,
      name: c.userName,
      email: c.userEmail
    }
  }));
  
  return task;
};

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

  const tagsJson = tags ? JSON.stringify(tags) : JSON.stringify([]);

  const [result] = await pool.query(`
    INSERT INTO Tasks (title, description, status, priority, progress, createdBy, assignedTo, dueDate, startDate, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    title, description, status || 'TODO', priority || 'MEDIUM', progress || 0,
    userId, assignedTo, new Date(dueDate), new Date(startDate), tagsJson
  ]);

  return getTaskByIdHelper(result.insertId);
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

  let whereClause = "WHERE t.isDeleted = FALSE";
  const params = [];

  if (status) { whereClause += " AND t.status = ?"; params.push(status); }
  if (createdBy) { whereClause += " AND t.createdBy = ?"; params.push(createdBy); }
  if (priority) { whereClause += " AND t.priority = ?"; params.push(priority); }
  if (assignedTo) { whereClause += " AND t.assignedTo = ?"; params.push(assignedTo); }
  if (progressMin !== undefined) { whereClause += " AND t.progress >= ?"; params.push(parseInt(progressMin)); }
  if (progressMax !== undefined) { whereClause += " AND t.progress <= ?"; params.push(parseInt(progressMax)); }
  if (dueDate) { whereClause += " AND t.dueDate <= ?"; params.push(new Date(dueDate)); }

  const countQuery = `SELECT COUNT(*) as total FROM Tasks t ${whereClause}`;
  const [countResult] = await pool.query(countQuery, params);
  const totalCount = countResult[0].total;
  const totalPages = Math.ceil(totalCount / limitNum);

  const dataQuery = `
    SELECT t.*, 
      c.id as creatorId, c.name as creatorName, c.email as creatorEmail, 
      a.id as assigneeId, a.name as assigneeName, a.email as assigneeEmail 
    FROM Tasks t 
    LEFT JOIN Users c ON t.createdBy = c.id 
    LEFT JOIN Users a ON t.assignedTo = a.id 
    ${whereClause}
    ORDER BY t.createdAt DESC
    LIMIT ? OFFSET ?
  `;
  const [tasksRaw] = await pool.query(dataQuery, [...params, limitNum, skip]);

  const tasks = tasksRaw.map(mapTaskResult);

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

  const task = await getTaskByIdHelper(id);

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

  const task = await getTaskByIdHelper(id);

  if (!task) {
    throw new CustomError("Task not found", 404);
  }

  if (startDate && dueDate && new Date(startDate) > new Date(dueDate)) {
    throw new CustomError("Start date cannot be after due date", 400);
  }

  const updates = [];
  const params = [];

  if (title !== undefined) { updates.push("title = ?"); params.push(title); }
  if (description !== undefined) { updates.push("description = ?"); params.push(description); }
  if (dueDate !== undefined) { updates.push("dueDate = ?"); params.push(new Date(dueDate)); }
  if (startDate !== undefined) { updates.push("startDate = ?"); params.push(new Date(startDate)); }
  if (tags !== undefined) { updates.push("tags = ?"); params.push(JSON.stringify(tags)); }

  if (updates.length > 0) {
    params.push(id);
    await pool.query(`UPDATE Tasks SET ${updates.join(", ")} WHERE id = ?`, params);
  }

  return getTaskByIdHelper(id);
};

const deleteTask = async (id) => {
  if (!id) {
    throw new CustomError("Task ID is Required.", 400);
  }

  const task = await getTaskByIdHelper(id);

  if (!task) {
    throw new CustomError("Task not found", 404);
  }

  await pool.query("UPDATE Tasks SET isDeleted = TRUE WHERE id = ?", [id]);
};

const assignTask = async (id, assignedTo) => {
  if (!id || !assignedTo) {
    throw new CustomError("Task ID and assignedTo are required", 400);
  }

  const task = await getTaskByIdHelper(id);

  if (!task) {
    throw new CustomError("Task not found", 404);
  }

  const [users] = await pool.query("SELECT id FROM Users WHERE id = ?", [assignedTo]);
  if (users.length === 0) {
    throw new CustomError("User with provided ID does not exist", 404);
  }

  await pool.query("UPDATE Tasks SET assignedTo = ? WHERE id = ?", [assignedTo, id]);

  return getTaskByIdHelper(id);
};

const reassignTask = async (id, assignedTo) => {
  return assignTask(id, assignedTo);
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

  const task = await getTaskByIdHelper(id);

  if (!task) {
    throw new CustomError("Task not found", 404);
  }

  const completedAt = status === "COMPLETED" ? new Date() : null;
  
  if (status === "COMPLETED") {
    await pool.query("UPDATE Tasks SET status = ?, completedAt = ? WHERE id = ?", [status, completedAt, id]);
  } else {
    await pool.query("UPDATE Tasks SET status = ? WHERE id = ?", [status, id]);
  }

  return getTaskByIdHelper(id);
};

const addComment = async (id, message, userId) => {
  if (!id || !message) {
    throw new CustomError("Task ID and message are required", 400);
  }

  const task = await getTaskByIdHelper(id);

  if (!task) {
    throw new CustomError("Task not found", 404);
  }

  await pool.query("INSERT INTO TaskComments (taskId, userId, message) VALUES (?, ?, ?)", [id, userId, message]);

  return getTaskByIdHelper(id);
};

const updateProgress = async (id, progress) => {
  if (!id || progress === undefined) {
    throw new CustomError("Task ID and progress are required", 400);
  }

  if (progress < 0 || progress > 100) {
    throw new CustomError("Progress must be between 0 and 100", 400);
  }

  const task = await getTaskByIdHelper(id);

  if (!task) {
    throw new CustomError("Task not found", 404);
  }

  await pool.query("UPDATE Tasks SET progress = ? WHERE id = ?", [progress, id]);

  return getTaskByIdHelper(id);
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
