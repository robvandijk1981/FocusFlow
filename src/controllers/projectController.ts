import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { CreateProjectSchema, UpdateProjectSchema } from '../utils/validation';
import { successResponse, createdResponse, noContentResponse } from '../utils/response';
import { NotFoundError, asyncHandler } from '../utils/errors';

// GET /api/projects - List all projects with goals and tasks
export const getAllProjects = asyncHandler(async (req: Request, res: Response) => {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    include: {
      goals: {
        where: { deletedAt: null },
        include: {
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
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Add computed fields for goals
  const projectsWithStats = projects.map(project => ({
    ...project,
    goals: project.goals.map(goal => ({
      ...goal,
      completedCount: goal.tasks.filter(t => t.completed).length,
      totalCount: goal.tasks.length,
    })),
  }));

  successResponse(res, projectsWithStats);
});

// GET /api/projects/:id - Get single project
export const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const project = await prisma.project.findFirst({
    where: { id, deletedAt: null },
    include: {
      goals: {
        where: { deletedAt: null },
        include: {
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
      },
    },
  });

  if (!project) {
    throw new NotFoundError('Project', id);
  }

  // Add computed fields
  const projectWithStats = {
    ...project,
    goals: project.goals.map(goal => ({
      ...goal,
      completedCount: goal.tasks.filter(t => t.completed).length,
      totalCount: goal.tasks.length,
    })),
  };

  successResponse(res, projectWithStats);
});

// POST /api/projects - Create new project
export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = CreateProjectSchema.parse(req.body);

  const project = await prisma.project.create({
    data: validatedData,
    include: {
      goals: true,
    },
  });

  createdResponse(res, project);
});

// PUT /api/projects/:id - Update project
export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = UpdateProjectSchema.parse(req.body);

  // Check if project exists
  const existingProject = await prisma.project.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existingProject) {
    throw new NotFoundError('Project', id);
  }

  const project = await prisma.project.update({
    where: { id },
    data: validatedData,
    include: {
      goals: {
        where: { deletedAt: null },
        include: {
          tasks: {
            where: { deletedAt: null },
          },
        },
      },
    },
  });

  successResponse(res, project);
});

// DELETE /api/projects/:id - Soft delete project
export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if project exists
  const existingProject = await prisma.project.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existingProject) {
    throw new NotFoundError('Project', id);
  }

  // Soft delete project and cascade to goals and tasks
  await prisma.$transaction(async (tx) => {
    // Soft delete all tasks in this project
    await tx.task.updateMany({
      where: {
        goal: {
          projectId: id,
        },
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });

    // Soft delete all goals in this project
    await tx.goal.updateMany({
      where: { projectId: id, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    // Soft delete the project
    await tx.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  });

  noContentResponse(res);
});
