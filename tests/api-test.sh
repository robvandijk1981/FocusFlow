#!/bin/bash

# FocusFlow API Test Script
# This script tests all API endpoints to verify functionality

set -e  # Exit on error

API_URL="http://localhost:3001/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "FocusFlow API Test Suite"
echo "======================================"
echo ""

# Helper function to print test results
test_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}: $2"
  else
    echo -e "${RED}✗ FAIL${NC}: $2"
    exit 1
  fi
}

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/health)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ] && echo "$BODY" | grep -q '"status":"ok"'; then
  test_result 0 "Health check endpoint"
else
  test_result 1 "Health check endpoint (HTTP $HTTP_CODE)"
fi

echo ""

# Test 2: Get all projects
echo -e "${YELLOW}Test 2: Get All Projects${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/projects)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ] && echo "$BODY" | grep -q '"success":true'; then
  test_result 0 "Get all projects"
else
  test_result 1 "Get all projects (HTTP $HTTP_CODE)"
fi

echo ""

# Test 3: Create a project
echo -e "${YELLOW}Test 3: Create Project${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 201 ] && echo "$BODY" | grep -q '"name":"Test Project"'; then
  PROJECT_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  test_result 0 "Create project (ID: $PROJECT_ID)"
else
  test_result 1 "Create project (HTTP $HTTP_CODE)"
fi

echo ""

# Test 4: Create a goal
echo -e "${YELLOW}Test 4: Create Goal${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/goals \
  -H "Content-Type: application/json" \
  -d "{\"projectId\": \"$PROJECT_ID\", \"name\": \"Test Goal\"}")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 201 ] && echo "$BODY" | grep -q '"name":"Test Goal"'; then
  GOAL_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  test_result 0 "Create goal (ID: $GOAL_ID)"
else
  test_result 1 "Create goal (HTTP $HTTP_CODE)"
fi

echo ""

# Test 5: Create a task
echo -e "${YELLOW}Test 5: Create Task${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/tasks \
  -H "Content-Type: application/json" \
  -d "{\"goalId\": \"$GOAL_ID\", \"name\": \"Test Task\", \"urgency\": \"HOOG\", \"todaysFocus\": true}")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 201 ] && echo "$BODY" | grep -q '"name":"Test Task"'; then
  TASK_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  test_result 0 "Create task (ID: $TASK_ID)"
else
  test_result 1 "Create task (HTTP $HTTP_CODE)"
fi

echo ""

# Test 6: Get today's tasks
echo -e "${YELLOW}Test 6: Get Today's Tasks${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/tasks/today)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ] && echo "$BODY" | grep -q '"todaysFocus":true'; then
  test_result 0 "Get today's tasks"
else
  test_result 1 "Get today's tasks (HTTP $HTTP_CODE)"
fi

echo ""

# Test 7: Update task
echo -e "${YELLOW}Test 7: Update Task${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT $API_URL/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"completed": true, "urgency": "LAAG"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ] && echo "$BODY" | grep -q '"completed":true'; then
  test_result 0 "Update task"
else
  test_result 1 "Update task (HTTP $HTTP_CODE)"
fi

echo ""

# Test 8: Delete task
echo -e "${YELLOW}Test 8: Delete Task${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE $API_URL/tasks/$TASK_ID)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" -eq 204 ]; then
  test_result 0 "Delete task"
else
  test_result 1 "Delete task (HTTP $HTTP_CODE)"
fi

echo ""

# Test 9: Delete goal
echo -e "${YELLOW}Test 9: Delete Goal${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE $API_URL/goals/$GOAL_ID)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" -eq 204 ]; then
  test_result 0 "Delete goal"
else
  test_result 1 "Delete goal (HTTP $HTTP_CODE)"
fi

echo ""

# Test 10: Delete project
echo -e "${YELLOW}Test 10: Delete Project${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE $API_URL/projects/$PROJECT_ID)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" -eq 204 ]; then
  test_result 0 "Delete project"
else
  test_result 1 "Delete project (HTTP $HTTP_CODE)"
fi

echo ""
echo "======================================"
echo -e "${GREEN}All tests passed!${NC}"
echo "======================================"
