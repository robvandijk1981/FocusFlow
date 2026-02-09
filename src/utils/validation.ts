import { z } from 'zod';

// Urgency enum
export const UrgencySchema = z.enum(['LAAG', 'MIDDEN', 'HOOG']);

// Project colors enum
export const ColorSchema = z.enum(['teal', 'blue', 'purple', 'pink', 'orange', 'green', 'red', 'yellow']);

// Project validation schemas
export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255),
  color: ColorSchema.optional(),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  color: ColorSchema.optional(),
});

// Goal validation schemas
export const CreateGoalSchema = z.object({
  projectId: z.string().cuid('Invalid project ID'),
  name: z.string().min(1, 'Goal name is required').max(255),
});

export const UpdateGoalSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  projectId: z.string().cuid().optional(),
});

// Task validation schemas
export const CreateTaskSchema = z.object({
  id: z.string().optional(),  // Allow frontend to send id (will be ignored)
  goalId: z.string().cuid('Invalid goal ID'),
  name: z.string().min(1, 'Task name is required').max(500),
  urgency: UrgencySchema.nullable().optional(),
  todaysFocus: z.boolean().optional(),
  completed: z.boolean().optional(),
});

export const UpdateTaskSchema = z.object({
  name: z.string().min(1).max(500).optional(),
  urgency: UrgencySchema.nullable().optional(),
  todaysFocus: z.boolean().optional(),
  completed: z.boolean().optional(),
  goalId: z.string().cuid().optional(),
});

// Query parameter schemas
export const TaskQuerySchema = z.object({
  goalId: z.string().cuid().optional(),
  urgency: UrgencySchema.optional(),
  todaysFocus: z.enum(['true', 'false']).optional(),
  completed: z.enum(['true', 'false']).optional(),
});

export const GoalQuerySchema = z.object({
  projectId: z.string().cuid().optional(),
});

// Sync schema for bulk operations
export const SyncSchema = z.object({
  projects: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    goals: z.array(z.object({
      id: z.string().optional(),
      name: z.string(),
      tasks: z.array(z.object({
        id: z.string().optional(),
        name: z.string(),
        completed: z.boolean(),
        urgency: UrgencySchema,
        todaysFocus: z.boolean(),
        completedAt: z.string().datetime().nullable().optional(),
      })),
    })),
  })),
  lastSyncedAt: z.string().datetime().optional(),
});

// Type exports
export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;
export type CreateGoal = z.infer<typeof CreateGoalSchema>;
export type UpdateGoal = z.infer<typeof UpdateGoalSchema>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
export type TaskQuery = z.infer<typeof TaskQuerySchema>;
export type GoalQuery = z.infer<typeof GoalQuerySchema>;
export type SyncData = z.infer<typeof SyncSchema>;
