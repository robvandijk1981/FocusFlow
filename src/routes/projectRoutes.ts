import { Router, IRouter } from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController';

const router: IRouter = Router();

/**
 * @route   GET /api/projects
 * @desc    Get all projects with goals and tasks
 * @access  Public (TODO: Add authentication)
 */
router.get('/', getAllProjects);

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project by ID
 * @access  Public (TODO: Add authentication)
 */
router.get('/:id', getProjectById);

/**
 * @route   POST /api/projects
 * @desc    Create new project
 * @access  Public (TODO: Add authentication)
 */
router.post('/', createProject);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Public (TODO: Add authentication)
 */
router.put('/:id', updateProject);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project (soft delete)
 * @access  Public (TODO: Add authentication)
 */
router.delete('/:id', deleteProject);

export default router;
