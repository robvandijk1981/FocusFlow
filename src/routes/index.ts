import { Router, IRouter } from 'express';
import { healthCheck } from '../controllers/healthController';
import { syncData } from '../controllers/syncController';
import projectRoutes from './projectRoutes';
import goalRoutes from './goalRoutes';
import taskRoutes from './taskRoutes';

const router: IRouter = Router();

// Health check
router.get('/health', healthCheck);

// Sync endpoint
router.post('/sync', syncData);

// Resource routes
router.use('/projects', projectRoutes);
router.use('/goals', goalRoutes);
router.use('/tasks', taskRoutes);

export default router;
