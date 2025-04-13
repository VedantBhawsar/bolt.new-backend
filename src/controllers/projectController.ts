import { Request, Response } from "express";
import { Project, IProject } from "../models/Project";
import mongoose from "mongoose";

// Create a new project
export const createProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Destructure files and chatHistory
    const { title, description, files, isPublic, tags, chatHistory } = req.body;
    const userId = req.user?.id;

    // Validate title and files
    if (!title || !files) {
      res.status(400).json({ message: "Project title and files are required" });
      return;
    }

    // Create new project instance with files and chatHistory
    const project = new Project({
      title,
      description,
      files, // Save the files structure
      userId,
      isPublic: isPublic || false,
      tags: tags || [],
      chatHistory: chatHistory || [], // Save chat history
    });

    await project.save();

    // Return the full project object
    res.status(201).json(project);
  } catch (error: any) {
    console.error("Create project error:", error);
    res.status(500).json({
      message: "Failed to create project",
      error: error.message,
    });
  }
};

// Get all projects for user
export const getUserProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10, search } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const query: any = { userId };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Select minimal fields for list view
    const projects = await Project.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select("title description isPublic tags createdAt updatedAt");

    const total = await Project.countDocuments(query);

    res.status(200).json({
      projects,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error("Get user projects error:", error);
    res.status(500).json({
      message: "Failed to get projects",
      error: error.message,
    });
  }
};

// Get project by ID
export const getProjectById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid project ID" });
      return;
    }

    const project = await Project.findById(id);

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    if (project.userId.toString() !== userId && !project.isPublic) {
      res
        .status(403)
        .json({ message: "Not authorized to access this project" });
      res
        .status(403)
        .json({ message: "Not authorized to access this project" });
      return;
    }

    res.status(200).json({ project });
  } catch (error: any) {
    console.error("Get project error:", error);
    res.status(500).json({
      message: "Failed to get project",
      error: error.message,
    });
  }
};

// Update project
export const updateProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, html, css, js, isPublic, tags } = req.body;
    const userId = req.user?.id;

    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid project ID" });
      return;
    }

    // Find project
    const project = await Project.findById(id);

    // Check if project exists
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Check if user owns project
    if (project.userId.toString() !== userId) {
      res
        .status(403)
        .json({ message: "Not authorized to update this project" });
      return;
    }

    // Update project fields
    project.title = title || project.title;
    project.description =
      description !== undefined ? description : project.description;
    project.html = html !== undefined ? html : project.html;
    project.css = css !== undefined ? css : project.css;
    project.js = js !== undefined ? js : project.js;
    project.isPublic = isPublic !== undefined ? isPublic : project.isPublic;
    project.tags = tags || project.tags;

    await project.save();

    res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (error: any) {
    console.error("Update project error:", error);
    res.status(500).json({
      message: "Failed to update project",
      error: error.message,
    });
  }
};

// Delete project
export const deleteProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid project ID" });
      return;
    }

    // Find project
    const project = await Project.findById(id);

    // Check if project exists
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Check if user owns project
    if (project.userId.toString() !== userId) {
      res
        .status(403)
        .json({ message: "Not authorized to delete this project" });
      return;
    }

    // Delete project
    await Project.findByIdAndDelete(id);

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error: any) {
    console.error("Delete project error:", error);
    res.status(500).json({
      message: "Failed to delete project",
      error: error.message,
    });
  }
};

// Get public projects
export const getPublicProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build query for public projects
    const query: any = { isPublic: true };

    // Add search functionality if provided
    if (search) {
      query.$text = { $search: search as string };
    }

    // Execute query with pagination
    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Project.countDocuments(query);

    res.status(200).json({
      projects,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error("Get public projects error:", error);
    res.status(500).json({
      message: "Failed to get public projects",
      error: error.message,
    });
  }
};
