# FocusFlow API Documentation

This document provides a detailed overview of the FocusFlow API endpoints, request/response formats, and example usage.

**Base URL**: `/api`

## Authentication

Currently, the API is open and does not require authentication. In the future, authentication will be implemented using JWTs, and an `Authorization: Bearer <token>` header will be required for protected endpoints.

## Common Status Codes

-   `200 OK`: Request was successful.
-   `201 Created`: Resource was successfully created.
-   `204 No Content`: Request was successful, but there is no content to return.
-   `400 Bad Request`: The request was invalid (e.g., validation error).
-   `404 Not Found`: The requested resource does not exist.
-   `409 Conflict`: The request conflicts with the current state of the server (e.g., unique constraint violation).
-   `500 Internal Server Error`: An unexpected error occurred on the server.

---

## Health Check

### `GET /api/health`

Checks the health of the API server and its database connection.

**Response (`200 OK`)**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-02-07T16:14:42.656Z",
    "uptime": 5.08,
    "environment": "development",
    "database": "connected",
    "version": "1.0.0"
  }
}
```

---

## Projects

### `GET /api/projects`

Retrieves a list of all projects, including their associated goals and tasks.

**Response (`200 OK`)**

```json
{
  "success": true,
  "data": [
    {
      "id": "cmlcikpa900004ivwo42uks6v",
      "name": "Personal Development",
      "createdAt": "2026-02-07T16:13:52.258Z",
      "updatedAt": "2026-02-07T16:13:52.258Z",
      "goals": [
        // ... array of goal objects
      ]
    }
  ]
}
```

### `POST /api/projects`

Creates a new project.

**Request Body**

```json
{
  "name": "New Work Project"
}
```

**Response (`201 Created`)**

Returns the newly created project object.

### `PUT /api/projects/:id`

Updates an existing project.

**Request Body**

```json
{
  "name": "Updated Project Name"
}
```

**Response (`200 OK`)**

Returns the updated project object.

### `DELETE /api/projects/:id`

Soft-deletes a project and all its associated goals and tasks.

**Response (`204 No Content`)**

---

## Goals

### `GET /api/goals`

Retrieves a list of all goals. Can be filtered by `projectId`.

**Query Parameters**

-   `projectId` (optional): The ID of the project to filter by.

**Response (`200 OK`)**

Returns an array of goal objects.

### `POST /api/goals`

Creates a new goal.

**Request Body**

```json
{
  "projectId": "cmlcikpa900004ivwo42uks6v",
  "name": "Learn a New Skill"
}
```

**Response (`201 Created`)**

Returns the newly created goal object.

### `PUT /api/goals/:id`

Updates an existing goal.

**Request Body**

```json
{
  "name": "Updated Goal Name"
}
```

**Response (`200 OK`)**

Returns the updated goal object.

### `DELETE /api/goals/:id`

Soft-deletes a goal and all its associated tasks.

**Response (`204 No Content`)**

---

## Tasks

### `GET /api/tasks`

Retrieves a list of all tasks. Can be filtered by various criteria.

**Query Parameters**

-   `goalId` (optional): Filter by goal ID.
-   `urgency` (optional): Filter by urgency (`LAAG`, `MIDDEN`, `HOOG`).
-   `todaysFocus` (optional): Filter by Today's Focus status (`true`, `false`).
-   `completed` (optional): Filter by completion status (`true`, `false`).

**Response (`200 OK`)**

Returns an array of task objects.

### `GET /api/tasks/today`

Retrieves all tasks marked for "Today's Focus".

**Response (`200 OK`)**

Returns an array of task objects.

### `POST /api/tasks`

Creates a new task.

**Request Body**

```json
{
  "goalId": "cmlcikpaa00054ivwpe99hlah",
  "name": "Read a chapter of a book",
  "urgency": "MIDDEN",
  "todaysFocus": true
}
```

**Response (`201 Created`)**

Returns the newly created task object.

### `PUT /api/tasks/:id`

Updates an existing task.

**Request Body**

```json
{
  "name": "Updated Task Name",
  "completed": true,
  "urgency": "HOOG"
}
```

**Response (`200 OK`)**

Returns the updated task object.

### `DELETE /api/tasks/:id`

Soft-deletes a task.

**Response (`204 No Content`)**

---

## Sync

### `POST /api/sync`

Synchronizes the client's local state with the server. This endpoint is designed for offline-first clients.

**Request Body**

```json
{
  "projects": [
    // Full array of client-side projects, goals, and tasks
  ],
  "lastSyncedAt": "2026-02-07T16:00:00.000Z" // Optional
}
```

**Response (`200 OK`)**

```json
{
  "success": true,
  "data": {
    "syncResults": {
      "created": { "projects": 1, "goals": 2, "tasks": 5 },
      "updated": { "projects": 0, "goals": 1, "tasks": 3 }
    },
    "serverState": [
      // The complete, updated server state to be saved on the client
    ],
    "syncedAt": "2026-02-07T16:15:00.000Z"
  }
}
```
