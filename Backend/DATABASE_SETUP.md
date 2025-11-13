# Database Setup Guide

## ✅ Issue: Database is Disconnected

The 500 error is because the database isn't connected. You need to set up a PostgreSQL database.

## Option 1: Supabase (FREE - Easiest - Recommended) ⭐

Supabase provides a free PostgreSQL database. No installation needed!

### Steps:

1. **Create Supabase Account:**
   - Go to: https://supabase.com
   - Click "Start your project"
   - Sign up (free account is fine)

2. **Create a New Project:**
   - Click "New Project"
   - Choose an organization
   - Fill in:
     - **Name**: Pulse
     - **Database Password**: Create a strong password (save it!)
     - **Region**: Choose closest to you
   - Click "Create new project"
   - Wait 2-3 minutes for setup

3. **Get Your Database URL:**
   - In your project dashboard, go to **Settings** → **Database**
   - Scroll to **Connection string**
   - Select **URI** tab
   - Copy the connection string (looks like):
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
     ```

4. **Update Your `.env` File:**
   - Open `Pulse/Backend/.env`
   - Replace `DATABASE_URL` with your Supabase connection string:
     ```env
     DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?schema=public"
     ```
   - Replace `YOUR_PASSWORD` with the password you created

5. **Run Migrations:**
   ```powershell
   cd Pulse/Backend
   npm run prisma:generate
   npm run prisma:migrate
   ```
   - When prompted, enter migration name: `init`

6. **Restart Backend Server:**
   - Stop server (Ctrl+C)
   - Start again: `npm run dev`

7. **Verify:**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:5000/health/ready"
   ```
   Should show `"database": "connected"`

---

## Option 2: Install PostgreSQL Locally

### Windows Installation:

1. **Download PostgreSQL:**
   - Go to: https://www.postgresql.org/download/windows/
   - Download the installer
   - Run installer:
     - Remember the password you set for `postgres` user
     - Keep default port `5432`

2. **Create Database:**
   - Open **pgAdmin** (comes with PostgreSQL)
   - Or use command line:
     ```powershell
     psql -U postgres
     ```
   - Then run:
     ```sql
     CREATE DATABASE pulse_db;
     \q
     ```

3. **Update `.env`:**
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/pulse_db?schema=public"
   ```

4. **Run Migrations** (same as Step 5-7 above)

---

## Option 3: Install Docker Desktop

1. **Install Docker Desktop:**
   - Download: https://www.docker.com/products/docker-desktop
   - Install and restart computer
   - Make sure Docker is running

2. **Start Database:**
   ```powershell
   cd Pulse/Backend
   docker-compose up -d postgres
   ```

3. **Update `.env`:**
   ```env
   DATABASE_URL="postgresql://pulse_user:pulse_password@localhost:5432/pulse_db?schema=public"
   ```

4. **Run Migrations** (same as Step 5-7 above)

---

## Quick Check Commands

**Check if database is connected:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/health/ready"
```

**Should return:**
```json
{
  "success": true,
  "database": "connected"
}
```

---

## After Setup

Once database is connected:
1. Try logging in again at `http://localhost:3000`
2. The 500 error should be gone
3. You can create your account and start using the app!

---

## Deployment Scripts & Automatic Checks

When deploying with the provided AWS CodeDeploy scripts:

- `scripts/start_app.sh` now waits for the database endpoint defined in `.env` to become reachable before the backend starts.
- If the URL points to `localhost` and Docker (with Compose) is available on the instance, the script will attempt to launch the bundled PostgreSQL container automatically (`docker compose up -d postgres`).
- If you are using an external database (RDS, Supabase, etc.), make sure `DATABASE_URL` points to that host and that network/security groups allow the EC2 instance to connect.
- The deployment will fail fast with a clear message if the database cannot be reached, preventing half-started services.

