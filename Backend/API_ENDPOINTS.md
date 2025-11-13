# Pulse API Endpoints

Complete list of all available API endpoints.

**Base URL**: `http://localhost:5000` (or your deployed URL)

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Health Checks

### `GET /health`
Basic health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "Pulse API is running",
  "timestamp": "2025-03-11T..."
}
```

### `GET /health/ready`
Readiness check (includes database connectivity).

### `GET /health/live`
Liveness check (basic check).

---

## Authentication Routes (`/api/auth`)

### `POST /api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "team_member" // optional: admin, project_manager, team_member, viewer
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt-token-here"
  },
  "message": "User registered successfully"
}
```

### `POST /api/auth/login`
Login user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt-token-here"
  },
  "message": "Login successful"
}
```

### `GET /api/auth/me`
Get current authenticated user. (Protected)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "team_member",
    ...
  }
}
```

---

## User Routes (`/api/users`) - Protected

### `GET /api/users`
Get all users.

### `GET /api/users/:id`
Get user by ID.

### `PATCH /api/users/:id`
Update user (users can only update themselves unless admin).

**Request Body:**
```json
{
  "name": "John Updated",
  "role": "project_manager",
  "avatar": "https://...",
  "status": "Active"
}
```

### `DELETE /api/users/:id`
Delete user (admin only).

---

## Team Routes (`/api/team`) - Protected

### `GET /api/team`
Get all team members.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Sarah Johnson",
      "role": "Product Designer",
      "email": "sarah@example.com",
      "initials": "SJ",
      "tasksCompleted": 24,
      "avatar": "bg-slate-900",
      "status": "Active"
    }
  ]
}
```

### `GET /api/team/:id`
Get team member by ID.

### `POST /api/team`
Create team member.

**Request Body:**
```json
{
  "name": "John Doe",
  "role": "Developer",
  "email": "john@example.com",
  "initials": "JD", // optional, auto-generated if not provided
  "avatar": "bg-slate-900", // optional
  "status": "Active" // optional
}
```

### `PATCH /api/team/:id`
Update team member.

**Request Body:**
```json
{
  "name": "John Updated",
  "role": "Senior Developer",
  "email": "john.new@example.com",
  "tasksCompleted": 30
}
```

### `DELETE /api/team/:id`
Delete team member.

---

## Project Routes (`/api/projects`) - Protected

### `GET /api/projects`
Get all projects with task counts and columns.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Project Alpha",
      "description": "Project description",
      "progress": 45,
      "status": "In progress",
      "dueDate": "2025-12-31T00:00:00.000Z",
      "owner": { ... },
      "tasks": {
        "completed": 9,
        "total": 20
      },
      "columns": [ ... ]
    }
  ]
}
```

### `GET /api/projects/:id`
Get project by ID with full details including tasks and columns.

### `POST /api/projects`
Create project (automatically creates default columns: To Do, In Progress, Review, Done).

**Request Body:**
```json
{
  "name": "Project Alpha",
  "description": "Project description",
  "dueDate": "2025-12-31T00:00:00.000Z", // optional, ISO string or empty string
  "ownerId": 1 // optional, defaults to current user
}
```

### `PATCH /api/projects/:id`
Update project (auto-calculates progress if not provided).

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "progress": 60,
  "status": "On track",
  "dueDate": "2025-12-31T00:00:00.000Z" // or "" to clear
}
```

### `DELETE /api/projects/:id`
Delete project (owner or admin only).

---

## Task Routes (`/api/tasks`) - Protected

### `GET /api/tasks`
Get all tasks (with optional filters).

**Query Parameters:**
- `projectId` (number) - Filter by project
- `columnId` (string) - Filter by column
- `assignedToId` (number) - Filter by assignee

**Example:** `GET /api/tasks?projectId=1&assignedToId=2`

### `GET /api/tasks/:id`
Get task by ID with full details including activities.

### `POST /api/tasks`
Create task.

**Request Body:**
```json
{
  "title": "Implement feature X",
  "description": "Task description",
  "priority": "high", // low, medium, high
  "columnId": "uuid-here",
  "projectId": 1, // optional
  "assignedToId": 2 // optional
}
```

### `PATCH /api/tasks/:id`
Update task.

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "medium",
  "columnId": "new-uuid",
  "assignedToId": 3, // or null to unassign
  "completed": true
}
```

### `PATCH /api/tasks/:id/move`
Move task to different column.

**Request Body:**
```json
{
  "columnId": "new-column-uuid",
  "order": 0 // optional
}
```

### `DELETE /api/tasks/:id`
Delete task (automatically updates project progress).

---

## Column Routes (`/api/columns`) - Protected

### `GET /api/columns`
Get all columns (optionally filtered by project).

**Query Parameters:**
- `projectId` (number) - Filter by project

### `GET /api/columns/:id`
Get column by ID with tasks.

### `POST /api/columns`
Create column.

**Request Body:**
```json
{
  "title": "New Column",
  "color": "#3b82f6", // hex color, optional
  "projectId": 1, // optional
  "order": 0 // optional, auto-calculated if not provided
}
```

### `PATCH /api/columns/:id`
Update column.

**Request Body:**
```json
{
  "title": "Updated Column",
  "color": "#10b981",
  "order": 1
}
```

### `PATCH /api/columns/reorder`
Reorder multiple columns (bulk update).

**Request Body:**
```json
{
  "columns": [
    { "id": "uuid-1", "order": 0 },
    { "id": "uuid-2", "order": 1 },
    { "id": "uuid-3", "order": 2 }
  ]
}
```

### `DELETE /api/columns/:id`
Delete column (cannot delete if column has tasks).

---

## Activity Routes (`/api/activities`) - Protected

### `GET /api/activities`
Get all activities with optional filters and pagination.

**Query Parameters:**
- `projectId` (number) - Filter by project
- `taskId` (string) - Filter by task
- `userId` (number) - Filter by user
- `type` (string) - Filter by activity type
- `limit` (number, default: 50) - Number of results
- `offset` (number, default: 0) - Pagination offset

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [ ... ],
    "pagination": {
      "total": 100,
      "limit": 50,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### `GET /api/activities/:id`
Get activity by ID.

### `GET /api/activities/project/:projectId`
Get activities for a specific project.

**Query Parameters:**
- `limit` (number, default: 50)
- `offset` (number, default: 0)

### `GET /api/activities/recent/feed`
Get recent activities for dashboard feed.

**Query Parameters:**
- `limit` (number, default: 20)

---

## Response Format

All endpoints follow a consistent response format:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful" // optional
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ] // validation errors, optional
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

---

## Activity Types

Available activity types logged by the system:
- `task_created`
- `task_updated`
- `task_completed`
- `project_created`
- `project_updated`
- `member_added`
- `member_updated`

