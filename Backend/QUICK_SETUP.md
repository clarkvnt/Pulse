# Quick Setup Guide

## The 500 Error is Because Database Isn't Set Up Yet

You need to run database migrations to create the tables before the API will work.

## Step-by-Step Setup

### 1. Check Your Database Connection

Make sure your `.env` file has a valid `DATABASE_URL`. It should look like:

```
DATABASE_URL="postgresql://username:password@localhost:5432/pulse_db?schema=public"
```

**Options:**
- **PostgreSQL locally**: Install PostgreSQL and create a database
- **Docker**: Use `docker-compose.yml` (easiest!)
- **Cloud database**: Use Supabase, AWS RDS, etc.

### 2. Run Database Setup (Choose ONE option)

#### Option A: Using Docker (Easiest - Recommended)

```powershell
cd Pulse/Backend
docker-compose up -d
```

This starts PostgreSQL in Docker. The `.env` file should have:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pulse_db?schema=public"
```

#### Option B: Using Local PostgreSQL

1. Install PostgreSQL
2. Create a database:
   ```sql
   CREATE DATABASE pulse_db;
   ```
3. Update `.env` with your credentials

### 3. Run Migrations

Once database is ready:

```powershell
cd Pulse/Backend

# Generate Prisma client
npm run prisma:generate

# Create database tables
npm run prisma:migrate
```

When prompted:
- Migration name: `init` (or just press Enter)

### 4. (Optional) Seed Database

```powershell
npm run prisma:seed
```

### 5. Restart Backend Server

If your server is running, restart it:
- Stop the current server (Ctrl+C)
- Start again: `npm run dev`

## Verify It Works

Test the health endpoint:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/health/ready"
```

Should return `database: "connected"` instead of `"disconnected"`.

## Quick Docker Setup (If You Have Docker)

1. Make sure your `.env` has:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pulse_db?schema=public"
   ```

2. Start database:
   ```powershell
   docker-compose up -d
   ```

3. Run migrations:
   ```powershell
   npm run prisma:migrate
   ```

4. Restart server:
   ```powershell
   npm run dev
   ```

That's it! Now try logging in again.

