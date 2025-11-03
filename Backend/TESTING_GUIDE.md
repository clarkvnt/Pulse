# Testing Guide

## Prerequisites

1. **Backend Server Running**
   ```powershell
   cd Pulse/Backend
   npm run dev
   ```

2. **Database Setup** (if not already done)
   ```powershell
   # Create and run migrations
   npm run prisma:migrate
   
   # Generate Prisma client
   npm run prisma:generate
   ```

3. **Frontend Server Running** (in another terminal)
   ```powershell
   cd Pulse/Frontend
   npm run dev
   ```

## Quick Test - PowerShell Script

Run the automated test script:

```powershell
cd Pulse/Backend
.\test-endpoints.ps1
```

This will test:
- ✅ Health check
- ✅ User registration/login
- ✅ Get current user
- ✅ Create project
- ✅ Get projects
- ✅ Create team member
- ✅ Get team members
- ✅ Get columns
- ✅ Create task
- ✅ Get activities

## Manual Testing

### 1. Test Health Endpoint

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/health"
```

### 2. Register a User

```powershell
$registerData = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
    role = "team_member"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
    -Method Post -Body $registerData -ContentType "application/json"

$token = $response.data.token
Write-Host "Token: $token"
```

### 3. Login

```powershell
$loginData = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method Post -Body $loginData -ContentType "application/json"

$token = $response.data.token
```

### 4. Get Current User (Protected)

```powershell
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" `
    -Method Get -Headers $headers
```

### 5. Create Project

```powershell
$projectData = @{
    name = "Test Project"
    description = "This is a test project"
    dueDate = "2025-12-31T00:00:00.000Z"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/projects" `
    -Method Post -Headers $headers -Body $projectData

$projectId = $response.data.id
Write-Host "Project ID: $projectId"
```

### 6. Get All Projects

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/projects" `
    -Method Get -Headers $headers
```

### 7. Create Team Member

```powershell
$teamData = @{
    name = "Sarah Johnson"
    role = "Product Designer"
    email = "sarah@example.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/team" `
    -Method Post -Headers $headers -Body $teamData
```

### 8. Get Team Members

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/team" `
    -Method Get -Headers $headers
```

## Frontend Testing

1. Open `http://localhost:3000` in your browser
2. Navigate to different sections:
   - **Team** - View, add, edit, delete team members
   - **Projects** - View, add, edit, delete projects
   - **Activity** - View activity feed

## Common Issues

### Backend Not Running
- Error: "Failed to connect"
- Solution: Start backend with `npm run dev` in `Pulse/Backend`

### Database Connection Error
- Error: "Service is not ready" on `/health/ready`
- Solution: Check `.env` file has correct `DATABASE_URL`

### CORS Error
- Error: "CORS policy" in browser console
- Solution: Ensure `FRONTEND_URL` in backend `.env` matches frontend URL

### 401 Unauthorized
- Error: "No token provided"
- Solution: Register/login to get a token, or check token is stored in localStorage

### 404 Not Found
- Error: Endpoint not found
- Solution: Check route path matches `API_ENDPOINTS.md`

## Next Steps After Testing

1. ✅ API endpoints work
2. ✅ Frontend API client created
3. ✅ TeamManagement connected
4. 🔄 ProjectManagement - connecting now
5. ⏳ Task/Board components - next
6. ⏳ ActivityManagement - next

