/**
 * FocusFlow API Client
 * 
 * This file provides a complete API client for integrating the FocusFlow frontend
 * with the backend API. It includes offline-first functionality with localStorage
 * caching and automatic synchronization.
 * 
 * Usage:
 * 1. Copy this file to your frontend project (e.g., src/services/apiClient.ts)
 * 2. Update API_BASE_URL to point to your backend server
 * 3. Replace localStorage calls in your frontend with API calls
 * 4. Use the sync() function to synchronize offline changes
 */

// Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const CACHE_KEY = 'focusflow_cache';
const LAST_SYNC_KEY = 'focusflow_last_sync';

// Types
export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  goals?: Goal[];
}

export interface Goal {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
  completedCount?: number;
  totalCount?: number;
}

export interface Task {
  id: string;
  goalId: string;
  name: string;
  completed: boolean;
  urgency: 'LAAG' | 'MIDDEN' | 'HOOG';
  todaysFocus: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper: Check if online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Helper: Get from cache
function getCache(): Project[] {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

// Helper: Save to cache
function saveCache(data: Project[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save cache:', error);
  }
}

// Helper: Get last sync time
function getLastSync(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY);
}

// Helper: Save last sync time
function saveLastSync(timestamp: string): void {
  localStorage.setItem(LAST_SYNC_KEY, timestamp);
}

// Helper: Make API request
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: 'Network error. Using cached data.',
    };
  }
}

// ============================================================================
// PROJECTS API
// ============================================================================

export async function getAllProjects(): Promise<Project[]> {
  if (!isOnline()) {
    return getCache();
  }

  const response = await apiRequest<Project[]>('/projects');
  
  if (response.success && response.data) {
    saveCache(response.data);
    return response.data;
  }

  return getCache();
}

export async function getProjectById(id: string): Promise<Project | null> {
  const response = await apiRequest<Project>(`/projects/${id}`);
  return response.success && response.data ? response.data : null;
}

export async function createProject(name: string): Promise<Project | null> {
  const response = await apiRequest<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });

  if (response.success && response.data) {
    // Update cache
    const cache = getCache();
    cache.push(response.data);
    saveCache(cache);
    return response.data;
  }

  return null;
}

export async function updateProject(id: string, name: string): Promise<Project | null> {
  const response = await apiRequest<Project>(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });

  if (response.success && response.data) {
    // Update cache
    const cache = getCache();
    const index = cache.findIndex(p => p.id === id);
    if (index !== -1) {
      cache[index] = response.data;
      saveCache(cache);
    }
    return response.data;
  }

  return null;
}

export async function deleteProject(id: string): Promise<boolean> {
  const response = await apiRequest(`/projects/${id}`, {
    method: 'DELETE',
  });

  if (response.success) {
    // Update cache
    const cache = getCache().filter(p => p.id !== id);
    saveCache(cache);
    return true;
  }

  return false;
}

// ============================================================================
// GOALS API
// ============================================================================

export async function getAllGoals(projectId?: string): Promise<Goal[]> {
  const query = projectId ? `?projectId=${projectId}` : '';
  const response = await apiRequest<Goal[]>(`/goals${query}`);
  return response.success && response.data ? response.data : [];
}

export async function createGoal(projectId: string, name: string): Promise<Goal | null> {
  const response = await apiRequest<Goal>('/goals', {
    method: 'POST',
    body: JSON.stringify({ projectId, name }),
  });

  if (response.success && response.data) {
    // Refresh cache
    await getAllProjects();
    return response.data;
  }

  return null;
}

export async function updateGoal(id: string, name: string): Promise<Goal | null> {
  const response = await apiRequest<Goal>(`/goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });

  if (response.success && response.data) {
    await getAllProjects();
    return response.data;
  }

  return null;
}

export async function deleteGoal(id: string): Promise<boolean> {
  const response = await apiRequest(`/goals/${id}`, {
    method: 'DELETE',
  });

  if (response.success) {
    await getAllProjects();
    return true;
  }

  return false;
}

// ============================================================================
// TASKS API
// ============================================================================

export async function getAllTasks(filters?: {
  goalId?: string;
  urgency?: 'LAAG' | 'MIDDEN' | 'HOOG';
  todaysFocus?: boolean;
  completed?: boolean;
}): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters?.goalId) params.append('goalId', filters.goalId);
  if (filters?.urgency) params.append('urgency', filters.urgency);
  if (filters?.todaysFocus !== undefined) params.append('todaysFocus', String(filters.todaysFocus));
  if (filters?.completed !== undefined) params.append('completed', String(filters.completed));

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiRequest<Task[]>(`/tasks${query}`);
  return response.success && response.data ? response.data : [];
}

export async function getTodaysTasks(): Promise<Task[]> {
  const response = await apiRequest<Task[]>('/tasks/today');
  return response.success && response.data ? response.data : [];
}

export async function createTask(
  goalId: string,
  name: string,
  options?: {
    urgency?: 'LAAG' | 'MIDDEN' | 'HOOG';
    todaysFocus?: boolean;
    completed?: boolean;
  }
): Promise<Task | null> {
  const response = await apiRequest<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify({
      goalId,
      name,
      ...options,
    }),
  });

  if (response.success && response.data) {
    await getAllProjects();
    return response.data;
  }

  return null;
}

export async function updateTask(
  id: string,
  updates: {
    name?: string;
    urgency?: 'LAAG' | 'MIDDEN' | 'HOOG';
    todaysFocus?: boolean;
    completed?: boolean;
  }
): Promise<Task | null> {
  const response = await apiRequest<Task>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });

  if (response.success && response.data) {
    await getAllProjects();
    return response.data;
  }

  return null;
}

export async function deleteTask(id: string): Promise<boolean> {
  const response = await apiRequest(`/tasks/${id}`, {
    method: 'DELETE',
  });

  if (response.success) {
    await getAllProjects();
    return true;
  }

  return false;
}

// ============================================================================
// SYNC API
// ============================================================================

export async function syncWithServer(): Promise<boolean> {
  if (!isOnline()) {
    console.log('Offline - sync skipped');
    return false;
  }

  const cache = getCache();
  const lastSync = getLastSync();

  const response = await apiRequest<{
    syncResults: any;
    serverState: Project[];
    syncedAt: string;
  }>('/sync', {
    method: 'POST',
    body: JSON.stringify({
      projects: cache,
      lastSyncedAt: lastSync,
    }),
  });

  if (response.success && response.data) {
    saveCache(response.data.serverState);
    saveLastSync(response.data.syncedAt);
    console.log('Sync completed:', response.data.syncResults);
    return true;
  }

  return false;
}

// ============================================================================
// MIGRATION HELPER
// ============================================================================

/**
 * Migrate existing localStorage data to the backend
 * 
 * Call this once to migrate your existing FocusFlow data from localStorage
 * to the backend API.
 */
export async function migrateLocalStorageToBackend(oldStorageKey: string = 'focusflow_data'): Promise<void> {
  try {
    const oldData = localStorage.getItem(oldStorageKey);
    if (!oldData) {
      console.log('No data to migrate');
      return;
    }

    const projects = JSON.parse(oldData);
    
    // Save to cache
    saveCache(projects);
    
    // Sync with server
    const success = await syncWithServer();
    
    if (success) {
      console.log('Migration completed successfully');
      // Optionally remove old data
      // localStorage.removeItem(oldStorageKey);
    } else {
      console.error('Migration failed - data saved to cache but not synced');
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
}

// ============================================================================
// AUTO-SYNC SETUP
// ============================================================================

/**
 * Set up automatic synchronization
 * 
 * Call this in your app initialization to enable automatic sync
 * when the app comes online or at regular intervals.
 */
export function setupAutoSync(intervalMinutes: number = 5): void {
  // Sync when coming online
  window.addEventListener('online', () => {
    console.log('Back online - syncing...');
    syncWithServer();
  });

  // Periodic sync
  setInterval(() => {
    if (isOnline()) {
      syncWithServer();
    }
  }, intervalMinutes * 60 * 1000);

  // Initial sync
  if (isOnline()) {
    syncWithServer();
  }
}
