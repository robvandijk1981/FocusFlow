# FocusFlow Frontend Integration Guide

This guide explains how to integrate your existing FocusFlow frontend with the new backend API.

## Quick Start

### 1. Copy Integration Files

Copy these files to your frontend project:

```bash
# Copy API client
cp frontend-integration/apiClient.ts src/services/apiClient.ts

# Copy React hook (if using React)
cp frontend-integration/useFocusFlow.ts src/hooks/useFocusFlow.ts
```

### 2. Configure API URL

Create a `.env` file in your frontend project:

```env
REACT_APP_API_URL=http://localhost:3001/api
# Or for production:
# REACT_APP_API_URL=https://your-backend-domain.com/api
```

### 3. Update Your Components

#### Option A: Using the React Hook (Recommended)

```tsx
import { useFocusFlow } from './hooks/useFocusFlow';

function App() {
  const {
    projects,
    loading,
    error,
    isOnline,
    createTask,
    updateTask,
    deleteTask,
  } = useFocusFlow();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {!isOnline && <div className="offline-banner">Offline Mode</div>}
      
      {projects.map(project => (
        <div key={project.id}>
          <h2>{project.name}</h2>
          {project.goals?.map(goal => (
            <div key={goal.id}>
              <h3>{goal.name}</h3>
              <p>Progress: {goal.completedCount}/{goal.totalCount}</p>
              {goal.tasks?.map(task => (
                <div key={task.id}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => updateTask(task.id, { 
                      completed: !task.completed 
                    })}
                  />
                  <span>{task.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

#### Option B: Using the API Client Directly

```tsx
import * as api from './services/apiClient';
import { useEffect, useState } from 'react';

function App() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const data = await api.getAllProjects();
    setProjects(data);
  }

  async function handleToggleTask(taskId, completed) {
    await api.updateTask(taskId, { completed: !completed });
    await loadProjects();
  }

  return (
    <div>
      {/* Your UI here */}
    </div>
  );
}
```

## Migration from localStorage

If you have existing data in localStorage, migrate it to the backend:

```tsx
import { migrateLocalStorageToBackend } from './services/apiClient';

// Run once on app initialization
useEffect(() => {
  migrateLocalStorageToBackend('your_old_storage_key');
}, []);
```

## Offline-First Strategy

The API client automatically handles offline scenarios:

1. **When online**: All operations go to the backend API
2. **When offline**: Data is read from localStorage cache
3. **When coming back online**: Automatic sync with server

### Enable Auto-Sync

```tsx
import { setupAutoSync } from './services/apiClient';

// In your app initialization
useEffect(() => {
  setupAutoSync(5); // Sync every 5 minutes
}, []);
```

## API Reference

### Projects

```tsx
// Get all projects
const projects = await api.getAllProjects();

// Create project
const project = await api.createProject('New Project');

// Update project
const updated = await api.updateProject(projectId, 'Updated Name');

// Delete project
await api.deleteProject(projectId);
```

### Goals

```tsx
// Get all goals (optionally filter by project)
const goals = await api.getAllGoals(projectId);

// Create goal
const goal = await api.createGoal(projectId, 'New Goal');

// Update goal
const updated = await api.updateGoal(goalId, 'Updated Name');

// Delete goal
await api.deleteGoal(goalId);
```

### Tasks

```tsx
// Get all tasks with filters
const tasks = await api.getAllTasks({
  goalId: 'goal-id',
  urgency: 'HOOG',
  todaysFocus: true,
  completed: false,
});

// Get today's tasks
const todaysTasks = await api.getTodaysTasks();

// Create task
const task = await api.createTask(goalId, 'New Task', {
  urgency: 'MIDDEN',
  todaysFocus: true,
});

// Update task
const updated = await api.updateTask(taskId, {
  name: 'Updated Task',
  completed: true,
  urgency: 'HOOG',
  todaysFocus: false,
});

// Delete task
await api.deleteTask(taskId);
```

### Sync

```tsx
// Manual sync
const success = await api.syncWithServer();
```

## UI Components to Add

### Sync Indicator

```tsx
function SyncIndicator() {
  const { syncing, lastSynced, isOnline } = useFocusFlow();

  return (
    <div className="sync-indicator">
      {!isOnline && <span>🔴 Offline</span>}
      {syncing && <span>🔄 Syncing...</span>}
      {lastSynced && !syncing && (
        <span>✅ Synced {formatTimeAgo(lastSynced)}</span>
      )}
    </div>
  );
}
```

### Loading State

```tsx
function LoadingSpinner() {
  const { loading } = useFocusFlow();

  if (!loading) return null;

  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Loading your tasks...</p>
    </div>
  );
}
```

### Error Boundary

```tsx
function ErrorDisplay() {
  const { error } = useFocusFlow();

  if (!error) return null;

  return (
    <div className="error-banner">
      <p>⚠️ {error}</p>
      <button onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  );
}
```

## Testing the Integration

1. **Test online mode**: Create/update/delete items and verify they persist
2. **Test offline mode**: Disconnect network and verify localStorage cache works
3. **Test sync**: Reconnect and verify data syncs correctly
4. **Test multi-device**: Open app in two browsers and verify changes sync

## Troubleshooting

### CORS Errors

If you see CORS errors, make sure your frontend URL is added to the backend's `CORS_ORIGINS` environment variable:

```env
CORS_ORIGINS=http://localhost:3000,https://focusflow-today.manus.space
```

### Data Not Syncing

1. Check browser console for errors
2. Verify backend is running: `curl http://localhost:3001/api/health`
3. Check network tab in DevTools
4. Verify localStorage cache: `localStorage.getItem('focusflow_cache')`

### TypeScript Errors

If you get TypeScript errors, make sure you have the correct types installed:

```bash
npm install --save-dev @types/react @types/node
```

## Next Steps

1. ✅ Copy integration files to your frontend
2. ✅ Configure API URL
3. ✅ Update components to use the API
4. ✅ Migrate existing localStorage data
5. ✅ Add sync indicator UI
6. ✅ Test offline functionality
7. ✅ Deploy backend to production
8. ✅ Update frontend API URL for production

## Support

For issues or questions:
- Check the API documentation: `/docs/API.md`
- Test endpoints with curl: `/docs/TESTING.md`
- Review example requests: `/docs/examples/`
