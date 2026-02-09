import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { CreateGoalSchema, UpdateGoalSchema, GoalQuerySchema } from '../utils/validation';
import { successResponse, createdResponse, noContentResponse } from '../utils/response';
import { NotFoundError, asyncHandler } from '../utils/errors';

// GET /api/goals - List all goals (optionally filter by projectId)
export const getAllGoals = asyncHandler(async (req: Request, res: Response) => {
  const query = GoalQuerySchema.parse(req.query);

  const goals = await prisma.goal.findMany({
    where: {
      deletedAt: null,
      ...(query.projectId && { projectId: String(query.projectId) }),
    },
    include: {
      project: true,
      tasks: {
        where: { deletedAt: null },
        orderBy: [
          { todaysFocus: 'desc' },
          { completed: 'asc' },
          { createdAt: 'desc' },
        ],
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Add computed fields
  const goalsWithStats = goals.map((goal: any) => ({
    ...goal,
    completedCount: goal.tasks.filter((t: any) => t.completed).length,
    totalCount: goal.tasks.length,
  }));

  successResponse(res, goalsWithStats);
});

// GET /api/goals/:id - Get single goal
export const getGoalById = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const goal = await prisma.goal.findFirst({
    where: { id, deletedAt: null },
    include: {
      project: true,
      tasks: {
        where: { deletedAt: null },
        orderBy: [
          { todaysFocus: 'desc' },
          { completed: 'asc' },
          { createdAt: 'desc' },
        ],
      },
    },
  });

  if (!goal) {
    throw new NotFoundError('Goal', id);
  }

  // Add computed fields
  const goalWithStats = {
    ...goal,
    completedCount: (goal as any).tasks.filter((t: any) => t.completed).length,
    totalCount: (goal as any).tasks.length,
  };

  successResponse(res, goalWithStats);
});

// POST /api/goals - Create new goal
export const createGoal = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = CreateGoalSchema.parse(req.body);

  // Verify project exists
  const project = await prisma.project.findFirst({
    where: { id: String(validatedData.projectId), deletedAt: null },
  });

  if (!project) {
    throw new NotFoundError('Project', String(validatedData.projectId));
  }

  const goal = await prisma.goal.create({
    data: {
      name: validatedData.name,
      projectId: validatedData.projectId,
    },
    include: {
      project: true,
      tasks: true,
    },
  });

  createdResponse(res, goal);
});

// PUT /api/goals/:id - Update goal
export const updateGoal = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const validatedData = UpdateGoalSchema.parse(req.body);

  // Check if goal exists
  const existingGoal = await prisma.goal.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existingGoal) {
    throw new NotFoundError('Goal', id);
  }

  // If updating projectId, verify new project exists
  if (validatedData.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: String(validatedData.projectId), deletedAt: null },
    });

    if (!project) {
      throw new NotFoundError('Project', String(validatedData.projectId));
    }
  }

  const goal = await prisma.goal.update({
    where: { id },
    data: validatedData,
    include: {
      project: true,
      tasks: {
        where: { deletedAt: null },
      },
    },
  });

  successResponse(res, goal);
});

// DELETE /api/goals/:id - Soft delete goal
export const deleteGoal = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  // Check if goal exists
  const existingGoal = await prisma.goal.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existingGoal) {
    throw new NotFoundError('Goal', id);
  }

  // Soft delete goal and cascade to tasks
  await prisma.$transaction(async (tx) => {
    // Soft delete all tasks in this goal
    await tx.task.updateMany({
      where: { goalId: id, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    // Soft delete the goal
    await tx.goal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  });

  successResponse(res, { deleted: true, id });
});
