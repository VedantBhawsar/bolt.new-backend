import express from 'express';
import {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getPublicProjects,
} from '../controllers/projectController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Protected routes (require authentication)
router.post('/', protect, createProject);
router.get('/user', protect, getUserProjects);
router.get('/:id', protect, getProjectById);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

// Public routes
router.get('/public/all', getPublicProjects);

export default router;
