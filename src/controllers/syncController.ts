import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { SyncSchema } from '../utils/validation';
import { asyncHandler } from '../utils/errors';
import { successResponse } from '../utils/response';

/**
 * POST /api/sync - Sync local state with server
 * 
 * This endpoint handles bulk synchronization between client and server.
 * Strategy: Last-write-wins based on updatedAt timestamps
 * 
 * TODO: Add user authentication to scope sync to specific users
 */
export const syncData = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = SyncSchema.parse(req.body);
  const { projects, lastSyncedAt } = validatedData;

  // Get server state since last sync
  const serverProjects = await prisma.project.findMany({
    where: {
      deletedAt: null,
      ...(lastSyncedAt && {
        updatedAt: {
          gt: new Date(lastSyncedAt),
        },
      }),
    },
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

  const syncResults = {
    created: { projects: 0, goals: 0, tasks: 0 },
    updated: { projects: 0, goals: 0, tasks: 0 },
    conflicts: [] as any[],
  };

  // Process each project from client
  for (const clientProject of projects) {
    if (!clientProject.id) {
      // New project from client - create on server
      const newProject = await prisma.project.create({
        data: {
          name: clientProject.name,
          goals: {
            create: clientProject.goals.map(goal => ({
              name: goal.name,
              tasks: {
                create: goal.tasks.map(task => ({
                  name: task.name,
                  completed: task.completed,
                  urgency: task.urgency,
                  todaysFocus: task.todaysFocus,
                  completedAt: task.completedAt ? new Date(task.completedAt) : null,
                })),
              },
            })),
          },
        },
      });
      syncResults.created.projects++;
      syncResults.created.goals += clientProject.goals.length;
      syncResults.created.tasks += clientProject.goals.reduce((sum, g) => sum + g.tasks.length, 0);
    } else {
      // Existing project - check for updates
      const serverProject = await prisma.project.findUnique({
        where: { id: clientProject.id },
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

      if (serverProject) {
        // Update project if name changed
        if (serverProject.name !== clientProject.name) {
          await prisma.project.update({
            where: { id: clientProject.id },
            data: { name: clientProject.name },
          });
          syncResults.updated.projects++;
        }

        // Process goals
        for (const clientGoal of clientProject.goals) {
          if (!clientGoal.id) {
            // New goal from client
            await prisma.goal.create({
              data: {
                projectId: clientProject.id,
                name: clientGoal.name,
                tasks: {
                  create: clientGoal.tasks.map(task => ({
                    name: task.name,
                    completed: task.completed,
                    urgency: task.urgency,
                    todaysFocus: task.todaysFocus,
                    completedAt: task.completedAt ? new Date(task.completedAt) : null,
                  })),
                },
              },
            });
            syncResults.created.goals++;
            syncResults.created.tasks += clientGoal.tasks.length;
          } else {
            // Existing goal - process tasks
            const serverGoal = serverProject.goals.find(g => g.id === clientGoal.id);
            
            if (serverGoal) {
              // Update goal if name changed
              if (serverGoal.name !== clientGoal.name) {
                await prisma.goal.update({
                  where: { id: clientGoal.id },
                  data: { name: clientGoal.name },
                });
                syncResults.updated.goals++;
              }

              // Process tasks
              for (const clientTask of clientGoal.tasks) {
                if (!clientTask.id) {
                  // New task from client
                  await prisma.task.create({
                    data: {
                      goalId: clientGoal.id,
                      name: clientTask.name,
                      completed: clientTask.completed,
                      urgency: clientTask.urgency,
                      todaysFocus: clientTask.todaysFocus,
                      completedAt: clientTask.completedAt ? new Date(clientTask.completedAt) : null,
                    },
                  });
                  syncResults.created.tasks++;
                } else {
                  // Existing task - update
                  const serverTask = serverGoal.tasks.find(t => t.id === clientTask.id);
                  
                  if (serverTask) {
                    // Simple last-write-wins: always update with client data
                    await prisma.task.update({
                      where: { id: clientTask.id },
                      data: {
                        name: clientTask.name,
                        completed: clientTask.completed,
                        urgency: clientTask.urgency,
                        todaysFocus: clientTask.todaysFocus,
                        completedAt: clientTask.completedAt ? new Date(clientTask.completedAt) : null,
                      },
                    });
                    syncResults.updated.tasks++;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Get updated server state to send back to client
  const updatedServerState = await prisma.project.findMany({
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

  successResponse(res, {
    syncResults,
    serverState: updatedServerState,
    syncedAt: new Date().toISOString(),
  });
});
