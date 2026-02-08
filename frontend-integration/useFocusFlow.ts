/**
 * React Hook for FocusFlow API
 * 
 * This custom hook provides easy integration with the FocusFlow API
 * and handles loading states, errors, and automatic updates.
 * 
 * Usage:
 * 1. Copy this file to your React project (e.g., src/hooks/useFocusFlow.ts)
 * 2. Import and use in your components
 * 
 * Example:
 * ```tsx
 * import { useFocusFlow } from './hooks/useFocusFlow';
 * 
 * function App() {
 *   const { projects, loading, error, createProject, updateTask } = useFocusFlow();
 *   
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   
 *   return (
 *     <div>
 *       {projects.map(project => (
 *         <div key={project.id}>{project.name}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import * as api from './apiClient';
import type { Project, Goal, Task } from './apiClient';

interface UseFocusFlowReturn {
  // State
  projects: Project[];
  loading: boolean;
  error: string | null;
  syncing: boolean;
  lastSynced: Date | null;
  isOnline: boolean;

  // Project operations
  createProject: (name: string) => Promise<Project | null>;
  updateProject: (id: string, name: string) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;

  // Goal operations
  createGoal: (projectId: string, name: string) => Promise<Goal | null>;
  updateGoal: (id: string, name: string) => Promise<Goal | null>;
  deleteGoal: (id: string) => Promise<boolean>;

  // Task operations
  createTask: (
    goalId: string,
    name: string,
    options?: {
      urgency?: 'LAAG' | 'MIDDEN' | 'HOOG';
      todaysFocus?: boolean;
      completed?: boolean;
    }
  ) => Promise<Task | null>;
  updateTask: (
    id: string,
    updates: {
      name?: string;
      urgency?: 'LAAG' | 'MIDDEN' | 'HOOG';
      todaysFocus?: boolean;
      completed?: boolean;
    }
  ) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  getTodaysTasks: () => Promise<Task[]>;

  // Sync operations
  sync: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useFocusFlow(): UseFocusFlowReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Load projects
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAllProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming online
      sync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync with server
  const sync = useCallback(async () => {
    if (!isOnline) return;

    try {
      setSyncing(true);
      const success = await api.syncWithServer();
      if (success) {
        setLastSynced(new Date());
        await loadProjects();
      }
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  }, [isOnline, loadProjects]);

  // Refresh data
  const refresh = useCallback(async () => {
    await loadProjects();
  }, [loadProjects]);

  // Project operations
  const createProject = useCallback(async (name: string) => {
    const project = await api.createProject(name);
    if (project) {
      await loadProjects();
    }
    return project;
  }, [loadProjects]);

  const updateProject = useCallback(async (id: string, name: string) => {
    const project = await api.updateProject(id, name);
    if (project) {
      await loadProjects();
    }
    return project;
  }, [loadProjects]);

  const deleteProject = useCallback(async (id: string) => {
    const success = await api.deleteProject(id);
    if (success) {
      await loadProjects();
    }
    return success;
  }, [loadProjects]);

  // Goal operations
  const createGoal = useCallback(async (projectId: string, name: string) => {
    const goal = await api.createGoal(projectId, name);
    if (goal) {
      await loadProjects();
    }
    return goal;
  }, [loadProjects]);

  const updateGoal = useCallback(async (id: string, name: string) => {
    const goal = await api.updateGoal(id, name);
    if (goal) {
      await loadProjects();
    }
    return goal;
  }, [loadProjects]);

  const deleteGoal = useCallback(async (id: string) => {
    const success = await api.deleteGoal(id);
    if (success) {
      await loadProjects();
    }
    return success;
  }, [loadProjects]);

  // Task operations
  const createTask = useCallback(async (
    goalId: string,
    name: string,
    options?: {
      urgency?: 'LAAG' | 'MIDDEN' | 'HOOG';
      todaysFocus?: boolean;
      completed?: boolean;
    }
  ) => {
    const task = await api.createTask(goalId, name, options);
    if (task) {
      await loadProjects();
    }
    return task;
  }, [loadProjects]);

  const updateTask = useCallback(async (
    id: string,
    updates: {
      name?: string;
      urgency?: 'LAAG' | 'MIDDEN' | 'HOOG';
      todaysFocus?: boolean;
      completed?: boolean;
    }
  ) => {
    const task = await api.updateTask(id, updates);
    if (task) {
      await loadProjects();
    }
    return task;
  }, [loadProjects]);

  const deleteTask = useCallback(async (id: string) => {
    const success = await api.deleteTask(id);
    if (success) {
      await loadProjects();
    }
    return success;
  }, [loadProjects]);

  const getTodaysTasks = useCallback(async () => {
    return await api.getTodaysTasks();
  }, []);

  return {
    // State
    projects,
    loading,
    error,
    syncing,
    lastSynced,
    isOnline,

    // Operations
    createProject,
    updateProject,
    deleteProject,
    createGoal,
    updateGoal,
    deleteGoal,
    createTask,
    updateTask,
    deleteTask,
    getTodaysTasks,
    sync,
    refresh,
  };
}
