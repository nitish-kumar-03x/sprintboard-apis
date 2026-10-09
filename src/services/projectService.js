const pool = require("../config/database");
const CustomError = require("../utils/CustomError");

const createProject = async (data, userId) => {
  const { name, description } = data;

  if (!name) {
    throw new CustomError("Project name is required", 400);
  }

  const [result] = await pool.query(`
    INSERT INTO Projects (name, description, createdBy)
    VALUES (?, ?, ?)
  `, [name, description || "", userId]);

  return getProjectById(result.insertId);
};

const getProjects = async () => {
  const [projects] = await pool.query(`
    SELECT p.*, u.name as creatorName, u.email as creatorEmail
    FROM Projects p
    LEFT JOIN Users u ON p.createdBy = u.id
    ORDER BY p.createdAt DESC
  `);
  
  return projects.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    createdBy: {
      id: p.createdBy,
      name: p.creatorName,
      email: p.creatorEmail
    }
  }));
};

const getProjectById = async (id) => {
  const [projects] = await pool.query(`
    SELECT p.*, u.name as creatorName, u.email as creatorEmail
    FROM Projects p
    LEFT JOIN Users u ON p.createdBy = u.id
    WHERE p.id = ?
  `, [id]);

  if (projects.length === 0) {
    throw new CustomError("Project not found", 404);
  }

  const p = projects[0];
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    createdBy: {
      id: p.createdBy,
      name: p.creatorName,
      email: p.creatorEmail
    }
  };
};

const updateProject = async (id, data) => {
  const { name, description } = data;
  
  if (!id) {
    throw new CustomError("Project ID is required", 400);
  }

  await getProjectById(id); // Check if exists

  const updates = [];
  const params = [];

  if (name !== undefined) { updates.push("name = ?"); params.push(name); }
  if (description !== undefined) { updates.push("description = ?"); params.push(description); }

  if (updates.length > 0) {
    params.push(id);
    await pool.query(`UPDATE Projects SET ${updates.join(", ")} WHERE id = ?`, params);
  }

  return getProjectById(id);
};

const deleteProject = async (id) => {
  if (!id) {
    throw new CustomError("Project ID is required", 400);
  }

  await getProjectById(id);

  // Delete tasks associated with this project
  await pool.query("DELETE FROM TaskComments WHERE taskId IN (SELECT id FROM Tasks WHERE projectId = ?)", [id]);
  await pool.query("DELETE FROM Tasks WHERE projectId = ?", [id]);
  await pool.query("DELETE FROM Projects WHERE id = ?", [id]);
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
};
