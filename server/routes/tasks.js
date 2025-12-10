import express from 'express';
import { authMiddleware } from '../middleware/authmiddleware.js';
import { listTasks, createTask, updateTask, deleteTask } from '../controllers/tasksController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', listTasks);
router.post('/', createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;

