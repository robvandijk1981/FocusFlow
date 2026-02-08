import { Router } from 'express';
import {
  getAllGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
} from '../controllers/goalController';

const router = Router();

/**
 * @route   GET /api/goals
 * @desc    Get all goals (optionally filter by projectId)
 * @query   projectId - Filter by project ID
 * @access  Public (TODO: Add authentication)
 */
router.get('/', getAllGoals);

/**
 * @route   GET /api/goals/:id
 * @desc    Get single goal by ID
 * @access  Public (TODO: Add authentication)
 */
router.get('/:id', getGoalById);

/**
 * @route   POST /api/goals
 * @desc    Create new goal
 * @access  Public (TODO: Add authentication)
 */
router.post('/', createGoal);

/**
 * @route   PUT /api/goals/:id
 * @desc    Update goal
 * @access  Public (TODO: Add authentication)
 */
router.put('/:id', updateGoal);

/**
 * @route   DELETE /api/goals/:id
 * @desc    Delete goal (soft delete)
 * @access  Public (TODO: Add authentication)
 */
router.delete('/:id', deleteGoal);

export default router;
