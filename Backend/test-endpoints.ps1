# Pulse API Endpoint Testing Script
# Run this after starting the backend server with: npm run dev

$baseUrl = "http://localhost:5000"
$token = ""

Write-Host "🧪 Testing Pulse API Endpoints`n" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✅ Health check passed" -ForegroundColor Green
    Write-Host "   Response: $($response.message)`n"
} catch {
    Write-Host "❌ Health check failed: $_`n" -ForegroundColor Red
    exit 1
}

# Test 2: Register User
Write-Host "2. Testing User Registration..." -ForegroundColor Yellow
try {
    $registerData = @{
        name = "Test User"
        email = "test@example.com"
        password = "password123"
        role = "team_member"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $registerData -ContentType "application/json"
    $token = $response.data.token
    Write-Host "✅ User registered successfully" -ForegroundColor Green
    Write-Host "   User ID: $($response.data.user.id)" -ForegroundColor Gray
    Write-Host "   Token: $($token.Substring(0, 20))...`n" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "⚠️  User already exists, trying login..." -ForegroundColor Yellow
        # Try login instead
        $loginData = @{
            email = "test@example.com"
            password = "password123"
        } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginData -ContentType "application/json"
        $token = $response.data.token
        Write-Host "✅ Login successful, token obtained`n" -ForegroundColor Green
    } else {
        Write-Host "❌ Registration failed: $_`n" -ForegroundColor Red
    }
}

if (-not $token) {
    Write-Host "❌ No authentication token available. Cannot continue with protected endpoint tests." -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test 3: Get Current User
Write-Host "3. Testing Get Current User (Protected)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers $headers
    Write-Host "✅ Current user retrieved" -ForegroundColor Green
    Write-Host "   Name: $($response.data.name)" -ForegroundColor Gray
    Write-Host "   Email: $($response.data.email)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $_`n" -ForegroundColor Red
}

# Test 4: Create Project
Write-Host "4. Testing Create Project..." -ForegroundColor Yellow
try {
    $projectData = @{
        name = "Test Project"
        description = "This is a test project"
        dueDate = "2025-12-31T00:00:00.000Z"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/projects" -Method Post -Headers $headers -Body $projectData
    $projectId = $response.data.id
    Write-Host "✅ Project created successfully" -ForegroundColor Green
    Write-Host "   Project ID: $projectId" -ForegroundColor Gray
    Write-Host "   Columns created: $($response.data.columns.Count)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $_`n" -ForegroundColor Red
    $projectId = $null
}

# Test 5: Get All Projects
Write-Host "5. Testing Get All Projects..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/projects" -Method Get -Headers $headers
    Write-Host "✅ Projects retrieved" -ForegroundColor Green
    Write-Host "   Total projects: $($response.data.Count)" -ForegroundColor Gray
    if ($response.data.Count -gt 0) {
        Write-Host "   First project: $($response.data[0].name)`n" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Failed: $_`n" -ForegroundColor Red
}

# Test 6: Create Team Member
Write-Host "6. Testing Create Team Member..." -ForegroundColor Yellow
try {
    $teamData = @{
        name = "Sarah Johnson"
        role = "Product Designer"
        email = "sarah@example.com"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/team" -Method Post -Headers $headers -Body $teamData
    $teamMemberId = $response.data.id
    Write-Host "✅ Team member created successfully" -ForegroundColor Green
    Write-Host "   Member ID: $teamMemberId" -ForegroundColor Gray
    Write-Host "   Initials: $($response.data.initials)`n" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "⚠️  Team member already exists`n" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Failed: $_`n" -ForegroundColor Red
    }
}

# Test 7: Get All Team Members
Write-Host "7. Testing Get All Team Members..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/team" -Method Get -Headers $headers
    Write-Host "✅ Team members retrieved" -ForegroundColor Green
    Write-Host "   Total members: $($response.data.Count)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $_`n" -ForegroundColor Red
}

# Test 8: Get Columns (if project was created)
if ($projectId) {
    Write-Host "8. Testing Get Columns for Project..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/columns?projectId=$projectId" -Method Get -Headers $headers
        Write-Host "✅ Columns retrieved" -ForegroundColor Green
        Write-Host "   Total columns: $($response.data.Count)" -ForegroundColor Gray
        foreach ($col in $response.data) {
            Write-Host "   - $($col.title)" -ForegroundColor Gray
        }
        Write-Host ""
    } catch {
        Write-Host "❌ Failed: $_`n" -ForegroundColor Red
    }
}

# Test 9: Create Task (if project and columns exist)
if ($projectId) {
    Write-Host "9. Testing Create Task..." -ForegroundColor Yellow
    try {
        # Get columns first
        $columnsResponse = Invoke-RestMethod -Uri "$baseUrl/api/columns?projectId=$projectId" -Method Get -Headers $headers
        if ($columnsResponse.data.Count -gt 0) {
            $columnId = $columnsResponse.data[0].id
            $taskData = @{
                title = "Test Task"
                description = "This is a test task"
                priority = "high"
                columnId = $columnId
                projectId = $projectId
            } | ConvertTo-Json

            $response = Invoke-RestMethod -Uri "$baseUrl/api/tasks" -Method Post -Headers $headers -Body $taskData
            Write-Host "✅ Task created successfully" -ForegroundColor Green
            Write-Host "   Task ID: $($response.data.id)" -ForegroundColor Gray
            Write-Host "   Column: $($response.data.column.title)`n" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Failed: $_`n" -ForegroundColor Red
    }
}

# Test 10: Get Activities
Write-Host "10. Testing Get Recent Activities..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/activities/recent/feed" -Method Get -Headers $headers
    Write-Host "✅ Activities retrieved" -ForegroundColor Green
    Write-Host "   Total activities: $($response.data.Count)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $_`n" -ForegroundColor Red
}

Write-Host "✨ All tests completed!" -ForegroundColor Cyan
Write-Host "`n💡 Tip: Use the token for manual API testing:" -ForegroundColor Gray
Write-Host "   Authorization: Bearer $($token.Substring(0, 30))..." -ForegroundColor DarkGray

