# FocusFlow API Testing Guide

This guide provides `curl` commands to test all API endpoints. These examples assume the server is running locally at `http://localhost:3001`.

## Setup

- Make sure the server is running (`pnpm dev`).
- These commands use `jq` for pretty-printing JSON. You can install it with `sudo apt-get install jq` or remove `| jq` from the commands.

## Health Check

```bash
curl http://localhost:3001/api/health | jq
```

## Projects

### Get all projects

```bash
curl http://localhost:3001/api/projects | jq
```

### Create a project

```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "New Test Project"}' | jq
```

### Update a project

```bash
# Replace <PROJECT_ID> with an actual ID
PROJECT_ID="cmlcikpa900004ivwo42uks6v"

curl -X PUT http://localhost:3001/api/projects/$PROJECT_ID \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Project Name"}' | jq
```

### Delete a project

```bash
# Replace <PROJECT_ID> with an actual ID
PROJECT_ID="cmlcikpa900004ivwo42uks6v"

curl -X DELETE http://localhost:3001/api/projects/$PROJECT_ID
```

## Goals

### Get all goals

```bash
curl http://localhost:3001/api/goals | jq
```

### Create a goal

```bash
# Replace <PROJECT_ID> with an actual ID
PROJECT_ID="cmlcikpad00084ivw80xw7upf"

curl -X POST http://localhost:3001/api/goals \
  -H "Content-Type: application/json" \
  -d '{"projectId": "'$PROJECT_ID'", "name": "New Test Goal"}' | jq
```

## Tasks

### Get all tasks

```bash
curl http://localhost:3001/api/tasks | jq
```

### Get today's tasks

```bash
curl http://localhost:3001/api/tasks/today | jq
```

### Create a task

```bash
# Replace <GOAL_ID> with an actual ID
GOAL_ID="cmlcikpad00094ivwuur9b9ij"

curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"goalId": "'$GOAL_ID'", "name": "My new important task", "todaysFocus": true, "urgency": "HOOG"}' | jq
```

### Update a task

```bash
# Replace <TASK_ID> with an actual ID
TASK_ID="cmlcikpad000a4ivwphnmwzne"

curl -X PUT http://localhost:3001/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"completed": true, "urgency": "LAAG"}' | jq
```

### Delete a task

```bash
# Replace <TASK_ID> with an actual ID
TASK_ID="cmlcikpad000a4ivwphnmwzne"

curl -X DELETE http://localhost:3001/api/tasks/$TASK_ID
```

## Sync

This is a more complex request. You would typically send your entire local state.

```bash
curl -X POST http://localhost:3001/api/sync \
  -H "Content-Type: application/json" \
  -d @- << EOF | jq
{
  "lastSyncedAt": "2026-01-01T00:00:00.000Z",
  "projects": [
    {
      "id": "cmlcikpa900004ivwo42uks6v",
      "name": "Personal Development (Client Updated)",
      "goals": [
        {
          "id": "cmlcikpaa00014ivwege9xht2",
          "name": "Health & Fitness",
          "tasks": [
            {
              "id": "cmlcikpaa00024ivwabqcpc95",
              "name": "Daily 30 min workout",
              "completed": true,
              "urgency": "HOOG",
              "todaysFocus": true
            }
          ]
        }
      ]
    }
  ]
}
EOF
```
