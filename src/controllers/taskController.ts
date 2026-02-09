import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { CreateTaskSchema, UpdateTaskSchema, TaskQuerySchema } from '../utils/validation';
import { successResponse, createdResponse, noContentResponse } from '../utils/response';
import { NotFoundError, asyncHandler } from '../utils/errors';

// GET /api/tasks - List all tasks (with optional filters)
export const getAllTasks = asyncHandler(async (req: Request, res: Response) => {
  const query = TaskQuerySchema.parse(req.query);

  const tasks = await prisma.task.findMany({
    where: {
      deletedAt: null,
      ...(query.goalId && { goalId: String(query.goalId) }),
      ...(query.urgency && { urgency: String(query.urgency) }),
      ...(query.todaysFocus && { todaysFocus: query.todaysFocus === 'true' }),
      ...(query.completed && { completed: query.completed === 'true' }),
    },
    include: {
      goal: {
        include: {
          project: true,
        },
      },
    },
    orderBy: [
      { todaysFocus: 'desc' },
      { completed: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  successResponse(res, tasks);
});

// GET /api/tasks/today - Get all tasks marked for Today's Focus
export const getTodaysTasks = asyncHandler(async (_req: Request, res: Response) => {
  const tasks = await prisma.task.findMany({
    where: {
      deletedAt: null,
      todaysFocus: true,
    },
    include: {
      goal: {
        include: {
          project: true,
        },
      },
    },
    orderBy: [
      { completed: 'asc' },
      { urgency: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  successResponse(res, tasks);
});

// GET /api/tasks/:id - Get single task
export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const task = await prisma.task.findFirst({
    where: { id, deletedAt: null },
    include: {
      goal: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!task) {
    throw new NotFoundError('Task', id);
  }

  successResponse(res, task);
});

// POST /api/tasks - Create new task
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = CreateTaskSchema.parse(req.body);

  // Verify goal exists
  const goal = await prisma.goal.findFirst({
    where: { id: String(validatedData.goalId), deletedAt: null },
  });

  if (!goal) {
    throw new NotFoundError('Goal', String(validatedData.goalId));
  }

  const task = await prisma.task.create({
    data: {
      name: validatedData.name,
      goalId: validatedData.goalId,
      urgency: validatedData.urgency ?? 'MIDDEN',
      todaysFocus: validatedData.todaysFocus ?? false,
      completed: validatedData.completed ?? false,
    },
    include: {
      goal: {
        include: {
          project: true,
        },
      },
    },
  });

  createdResponse(res, task);
});

// PUT /api/tasks/:id - Update task
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const validatedData = UpdateTaskSchema.parse(req.body);

  // Check if task exists
  const existingTask = await prisma.task.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existingTask) {
    throw new NotFoundError('Task', id);
  }

  // If updating goalId, verify new goal exists
  if (validatedData.goalId) {
    const goal = await prisma.goal.findFirst({
      where: { id: String(validatedData.goalId), deletedAt: null },
    });

    if (!goal) {
      throw new NotFoundError('Goal', String(validatedData.goalId));
    }
  }

  // Handle completion timestamp
  const updateData: any = { ...validatedData };
  if (validatedData.completed !== undefined) {
    if (validatedData.completed && !existingTask.completed) {
      // Task is being marked as completed
      updateData.completedAt = new Date();
    } else if (!validatedData.completed && existingTask.completed) {
      // Task is being marked as incomplete
      updateData.completedAt = null;
    }
  }

  const task = await prisma.task.update({
    where: { id },
    data: updateData,
    include: {
      goal: {
        include: {
          project: true,
        },
      },
    },
  });

  successResponse(res, task);
});

// DELETE /api/tasks/:id - Soft delete task
export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  // Check if task exists
  const existingTask = await prisma.task.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existingTask) {
    throw new NotFoundError('Task', id);
  }

  await prisma.task.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  successResponse(res, { deleted: true, id });
});
