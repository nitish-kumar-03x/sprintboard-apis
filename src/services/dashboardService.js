const pool = require("../config/database");

const mapTaskResult = (row) => {
  if (!row) return null;
  return {
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
    tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags,
    isDeleted: row.isDeleted,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.creatorId
      ? {
          _id: row.creatorId,
          name: row.creatorName,
          email: row.creatorEmail,
        }
      : null,
    assignedTo: row.assigneeId
      ? {
          _id: row.assigneeId,
          name: row.assigneeName,
          email: row.assigneeEmail,
        }
      : null,
  };
};

const getDashboardStats = async (userId) => {
  const [overviewRows] = await pool.query(`
    SELECT 
      COUNT(*) as totalTasks,
      COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completedTasks,
      COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as inProgressTasks,
      COUNT(CASE WHEN status = 'BLOCKED' THEN 1 END) as blockedTasks,
      COUNT(CASE WHEN status = 'TODO' THEN 1 END) as todoTasks,
      COUNT(CASE WHEN priority = 'HIGH' THEN 1 END) as highPriorityTasks,
      COUNT(CASE WHEN priority = 'URGENT' THEN 1 END) as urgentPriorityTasks
    FROM Tasks 
    WHERE isDeleted = FALSE
  `);

  const [userStatsRows] = await pool.query(
    `
    SELECT 
      COUNT(*) as userTasks,
      COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as userCompletedTasks,
      COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as userInProgressTasks
    FROM Tasks
    WHERE assignedTo = ? AND isDeleted = FALSE
  `,
    [userId],
  );

  const [createdStatsRows] = await pool.query(
    `
    SELECT COUNT(*) as tasksCreatedByUser 
    FROM Tasks 
    WHERE createdBy = ? AND isDeleted = FALSE
  `,
    [userId],
  );

  const [recentTasksRaw] = await pool.query(`
    SELECT t.*, 
      c.id as creatorId, c.name as creatorName, c.email as creatorEmail, 
      a.id as assigneeId, a.name as assigneeName, a.email as assigneeEmail 
    FROM Tasks t 
    LEFT JOIN Users c ON t.createdBy = c.id 
    LEFT JOIN Users a ON t.assignedTo = a.id 
    WHERE t.isDeleted = FALSE
    ORDER BY t.createdAt DESC
    LIMIT 5
  `);

  const recentTasks = recentTasksRaw.map(mapTaskResult);

  return {
    overview: {
      totalTasks: overviewRows[0].totalTasks,
      completedTasks: overviewRows[0].completedTasks,
      inProgressTasks: overviewRows[0].inProgressTasks,
      blockedTasks: overviewRows[0].blockedTasks,
      todoTasks: overviewRows[0].todoTasks,
    },
    userStats: {
      userTasks: userStatsRows[0].userTasks,
      userCompletedTasks: userStatsRows[0].userCompletedTasks,
      userInProgressTasks: userStatsRows[0].userInProgressTasks,
      tasksCreatedByUser: createdStatsRows[0].tasksCreatedByUser,
    },
    priorityStats: {
      highPriorityTasks: overviewRows[0].highPriorityTasks,
      urgentPriorityTasks: overviewRows[0].urgentPriorityTasks,
    },
    recentTasks,
  };
};

module.exports = { getDashboardStats };
