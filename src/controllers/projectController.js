const projectService = require("../services/projectService");
const sendResponse = require("../utils/responseHandler");
const errorHandler = require("../utils/errorHandler");

const createProject = async (req, res) => {
  try {
    const project = await projectService.createProject(req.body, req.user.id);
    return sendResponse(res, 201, true, "Project created successfully", project);
    } catch (error) {
    return errorHandler(error, res);
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await projectService.getProjects();
    return sendResponse(res, 200, true, "Projects retrieved successfully", projects);
    } catch (error) {
    return errorHandler(error, res);
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    return sendResponse(res, 200, true, "Project retrieved successfully", project);
    } catch (error) {
    return errorHandler(error, res);
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    return sendResponse(res, 200, true, "Project updated successfully", project);
    } catch (error) {
    return errorHandler(error, res);
  }
};

const deleteProject = async (req, res) => {
  try {
    await projectService.deleteProject(req.params.id);
    return sendResponse(res, 200, true, "Project deleted successfully");
    } catch (error) {
    return errorHandler(error, res);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
};
