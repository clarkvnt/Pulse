# Pulse Backend API

Backend API server for the Pulse project management tool, built with Express, TypeScript, and Prisma. **Ready for AWS deployment** with Docker support.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher) or use a cloud database like AWS RDS, Supabase
- npm or yarn
- Docker (optional, for containerized deployment)

## Local Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.template .env
   ```
   Then edit `.env` with your database credentials and other configuration.

3. **Set up the database:**
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate

   # (Optional) Seed the database
   npm run prisma:seed
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000` (or the PORT specified in `.env`).

## Docker Setup (Local Development)

1. **Start PostgreSQL and the app:**
   ```bash
   docker-compose up
   ```

   This will:
   - Start a PostgreSQL container
   - Build and run the application
   - Automatically run database migrations

2. **Access the API:**
   - API: `http://localhost:5000`
   - Health check: `http://localhost:5000/health`

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm run start` - Start production server (no migrations)
- `npm run start:prod` - Start production server with migrations
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations (development)
- `npm run prisma:migrate:deploy` - Deploy migrations (production)
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed the database with initial data
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container

## AWS Deployment

This backend is **AWS-ready** with the following features:

### ✅ AWS-Compatible Features

- **Docker support** - Multi-stage Dockerfile for optimized images
- **0.0.0.0 binding** - Accepts connections from any network interface
- **Health checks** - `/health`, `/health/ready`, `/health/live` endpoints
- **CloudWatch logging** - JSON-structured logs for CloudWatch Logs Insights
- **Graceful shutdown** - Handles SIGTERM/SIGINT for ECS/Fargate
- **Auto-migrations** - Runs database migrations on startup in production
- **Connection pooling** - Configured for production workloads
- **Security headers** - Production-ready security middleware

### AWS Deployment Options

#### Option 1: AWS ECS/Fargate (Recommended)

1. **Build Docker image:**
   ```bash
   docker build -t pulse-backend .
   ```

2. **Push to ECR:**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   docker tag pulse-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/pulse-backend:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/pulse-backend:latest
   ```

3. **ECS Task Definition:**
   - Use the Docker image from ECR
   - Set environment variables:
     - `NODE_ENV=production`
     - `DATABASE_URL` (from AWS RDS or Secrets Manager)
     - `JWT_SECRET` (from Secrets Manager)
     - `FRONTEND_URL` (your frontend domain)
     - `PORT=5000` (or let ECS assign it)
   - Health check: `/health/ready`

#### Option 2: AWS App Runner

1. **Push code to GitHub**
2. **Create App Runner service:**
   - Source: GitHub
   - Build command: `npm ci && npm run build`
   - Start command: `npm run start:prod`
   - Port: `5000`
   - Health check: `/health`

#### Option 3: AWS Elastic Beanstalk

1. **Create `.ebextensions/nodecommand.config`:**
   ```yaml
   option_settings:
     aws:elasticbeanstalk:container:nodejs:
       NodeCommand: "npm run start:prod"
   ```

2. **Deploy:**
   ```bash
   eb init
   eb create pulse-backend-env
   eb deploy
   ```

### Environment Variables for AWS

Set these in your AWS environment (ECS Task Definition, App Runner, or Elastic Beanstalk):

```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/pulse_db?schema=public&connection_limit=10&pool_timeout=20
JWT_SECRET=<generate-a-secure-random-string>
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend-domain.com
BCRYPT_ROUNDS=10
```

**Security Best Practices:**
- Store sensitive values (DATABASE_URL, JWT_SECRET) in **AWS Secrets Manager**
- Use IAM roles for ECS tasks to access secrets
- Enable VPC for database isolation

### Database Options for AWS

1. **AWS RDS PostgreSQL** (Recommended)
   - Managed PostgreSQL service
   - Automatic backups and multi-AZ support
   - Connection string: Use RDS endpoint

2. **Aurora Serverless PostgreSQL**
   - Auto-scaling database
   - Pay-per-use model

3. **Supabase** (External)
   - PostgreSQL-as-a-Service
   - Good for smaller projects

### Health Check Endpoints

- **`GET /health`** - Basic health check (always returns 200)
- **`GET /health/live`** - Liveness probe (process is running)
- **`GET /health/ready`** - Readiness probe (database connected)

Configure your load balancer/ECS to use `/health/ready` for health checks.

## Project Structure

```
Backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Prisma models (schema.prisma)
│   ├── routes/          # API routes
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── prisma/          # Prisma migrations and seed
│   └── server.ts        # Main server file
├── .env.example         # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## API Endpoints

API endpoints will be documented as they are implemented.

## Database

This project uses Prisma ORM with PostgreSQL. The database schema is defined in `prisma/schema.prisma`.

## Authentication

JWT-based authentication will be implemented for user sessions.
