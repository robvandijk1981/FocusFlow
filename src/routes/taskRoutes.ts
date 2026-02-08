import { Router } from 'express';
import {
  getAllTasks,
  getTodaysTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController';

const router = Router();

/**
 * @route   GET /api/tasks/today
 * @desc    Get all tasks marked for Today's Focus
 * @access  Public (TODO: Add authentication)
 */
router.get('/today', getTodaysTasks);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks (with optional filters)
 * @query   goalId - Filter by goal ID
 * @query   urgency - Filter by urgency (LAAG, MIDDEN, HOOG)
 * @query   todaysFocus - Filter by today's focus (true/false)
 * @query   completed - Filter by completion status (true/false)
 * @access  Public (TODO: Add authentication)
 */
router.get('/', getAllTasks);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task by ID
 * @access  Public (TODO: Add authentication)
 */
router.get('/:id', getTaskById);

/**
 * @route   POST /api/tasks
 * @desc    Create new task
 * @access  Public (TODO: Add authentication)
 */
router.post('/', createTask);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task (name, urgency, todaysFocus, completed)
 * @access  Public (TODO: Add authentication)
 */
router.put('/:id', updateTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task (soft delete)
 * @access  Public (TODO: Add authentication)
 */
router.delete('/:id', deleteTask);

export default router;
