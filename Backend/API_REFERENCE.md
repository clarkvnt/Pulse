# Pulse API Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Routes

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "team_member" // optional: admin, project_manager, team_member, viewer
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

## 👥 Users Routes (Protected)

### Get All Users
```http
GET /api/users
Authorization: Bearer <token>
```

### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <token>
```

### Update User
```http
PATCH /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "role": "project_manager", // optional
  "avatar": "https://...", // optional
  "status": "Active" // optional: Active, Offline, Away
}
```

### Delete User (Admin only)
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

---

## 📁 Projects Routes (Protected)

### Get All Projects
```http
GET /api/projects
Authorization: Bearer <token>
```

### Get Project by ID
```http
GET /api/projects/:id
Authorization: Bearer <token>
```

### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Project",
  "description": "Project description", // optional
  "dueDate": "2024-12-31T23:59:59Z", // optional
  "ownerId": 1 // optional (defaults to current user)
}
```

### Update Project
```http
PATCH /api/projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Project", // optional
  "description": "Updated description", // optional
  "progress": 50, // optional (0-100, auto-calculated if not provided)
  "status": "In progress", // optional: Started, In progress, On track, Almost done, Completed
  "dueDate": "2024-12-31T23:59:59Z", // optional
  "ownerId": 2 // optional
}
```

### Delete Project
```http
DELETE /api/projects/:id
Authorization: Bearer <token>
```

---

## 📋 Tasks Routes (Protected)

### Get All Tasks
```http
GET /api/tasks?projectId=1&columnId=uuid&assignedToId=1
Authorization: Bearer <token>
```

### Get Task by ID
```http
GET /api/tasks/:id
Authorization: Bearer <token>
```

### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Task",
  "description": "Task description", // optional
  "priority": "medium", // optional: low, medium, high
  "columnId": "uuid-here",
  "projectId": 1, // optional
  "assignedToId": 1 // optional
}
```

### Update Task
```http
PATCH /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Task", // optional
  "description": "Updated description", // optional
  "priority": "high", // optional: low, medium, high
  "columnId": "uuid-here", // optional
  "projectId": 1, // optional
  "assignedToId": 1, // optional (null to unassign)
  "completed": true // optional
}
```

### Move Task to Different Column
```http
PATCH /api/tasks/:id/move
Authorization: Bearer <token>
Content-Type: application/json

{
  "columnId": "new-uuid-here",
  "order": 0 // optional
}
```

### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

---

## 📊 Columns Routes (Protected)

### Get All Columns
```http
GET /api/columns?projectId=1
Authorization: Bearer <token>
```

### Get Column by ID
```http
GET /api/columns/:id
Authorization: Bearer <token>
```

### Create Column
```http
POST /api/columns
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Column",
  "color": "#3b82f6", // optional (hex color, defaults to #94a3b8)
  "projectId": 1, // optional
  "order": 0 // optional (auto-calculated if not provided)
}
```

### Update Column
```http
PATCH /api/columns/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Column", // optional
  "color": "#10b981", // optional (hex color)
  "order": 1 // optional
}
```

### Reorder Columns
```http
PATCH /api/columns/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "columns": [
    { "id": "uuid-1", "order": 0 },
    { "id": "uuid-2", "order": 1 },
    { "id": "uuid-3", "order": 2 }
  ]
}
```

### Delete Column
```http
DELETE /api/columns/:id
Authorization: Bearer <token>
```

**Note:** Cannot delete columns that have tasks assigned.

---

## 🔔 Activities Routes (Protected)

### Get All Activities
```http
GET /api/activities?projectId=1&taskId=uuid&userId=1&type=task_created&limit=50&offset=0
Authorization: Bearer <token>
```

### Get Activity by ID
```http
GET /api/activities/:id
Authorization: Bearer <token>
```

### Get Activities for Project
```http
GET /api/activities/project/:projectId?limit=50&offset=0
Authorization: Bearer <token>
```

### Get Recent Activities Feed
```http
GET /api/activities/recent/feed?limit=20
Authorization: Bearer <token>
```

---

## 📝 Response Format

All responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ] // for validation errors
}
```

---

## 🔒 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

---

## 🚀 Quick Start

1. **Register a user:**
   ```bash
   POST /api/auth/register
   ```

2. **Login to get token:**
   ```bash
   POST /api/auth/login
   # Save the token from response
   ```

3. **Create a project:**
   ```bash
   POST /api/projects
   Authorization: Bearer <token>
   ```

4. **Create tasks in the project:**
   ```bash
   POST /api/tasks
   Authorization: Bearer <token>
   ```

5. **View activities:**
   ```bash
   GET /api/activities/recent/feed
   Authorization: Bearer <token>
   ```

