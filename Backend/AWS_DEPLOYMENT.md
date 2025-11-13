# AWS Deployment Guide

This document provides step-by-step instructions for deploying the Pulse backend to AWS.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured
- Docker installed (for ECS deployment)
- PostgreSQL database (AWS RDS or external)

## Deployment Architecture

```
┌─────────────────┐
│  CloudFront     │  (Optional - CDN for frontend)
└────────┬────────┘
         │
┌────────▼────────┐
│  Application    │
│  Load Balancer  │
└────────┬────────┘
         │
┌────────▼────────┐     ┌──────────────┐
│  ECS Fargate    │────▶│  AWS RDS     │
│  (Backend API)  │     │  PostgreSQL  │
└─────────────────┘     └──────────────┘
         │
         │
┌────────▼────────┐
│  CloudWatch     │
│  (Logs/Metrics)│
└─────────────────┘
```

## Quick Start: ECS/Fargate Deployment

### Step 1: Prepare AWS Resources

1. **Create RDS PostgreSQL Database:**
   ```bash
   aws rds create-db-instance \
     --db-instance-identifier pulse-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --master-username admin \
     --master-user-password <your-password> \
     --allocated-storage 20 \
     --vpc-security-group-ids sg-xxxxx \
     --backup-retention-period 7
   ```

2. **Create ECR Repository:**
   ```bash
   aws ecr create-repository --repository-name pulse-backend
   ```

3. **Store Secrets in AWS Secrets Manager:**
   ```bash
   aws secretsmanager create-secret \
     --name pulse-backend/secrets \
     --secret-string '{
       "DATABASE_URL": "postgresql://admin:password@rds-endpoint:5432/pulse_db",
       "JWT_SECRET": "your-super-secret-jwt-key-here"
     }'
   ```

### Step 2: Build and Push Docker Image

```bash
# Get ECR login
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t pulse-backend .

# Tag image
docker tag pulse-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/pulse-backend:latest

# Push image
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/pulse-backend:latest
```

### Step 3: Create ECS Task Definition

Create `task-definition.json`:

```json
{
  "family": "pulse-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "pulse-backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/pulse-backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "5000"
        },
        {
          "name": "FRONTEND_URL",
          "value": "https://your-frontend-domain.com"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:pulse-backend/secrets:DATABASE_URL::"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:pulse-backend/secrets:JWT_SECRET::"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/pulse-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:5000/health/ready || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

Register the task definition:
```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

### Step 4: Create ECS Service

```bash
aws ecs create-service \
  --cluster pulse-cluster \
  --service-name pulse-backend \
  --task-definition pulse-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-yyyyy],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --load-balancer targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:<account-id>:targetgroup/pulse-backend/xxxxx,containerName=pulse-backend,containerPort=5000
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?connection_limit=10` |
| `JWT_SECRET` | JWT signing secret | Generate a secure random string |
| `FRONTEND_URL` | Frontend domain for CORS | `https://app.pulse.com` |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_EXPIRE` | `7d` | JWT expiration time |
| `BCRYPT_ROUNDS` | `10` | Password hashing rounds |

## Database Connection String Format

For production, include connection pool parameters:

```
postgresql://username:password@host:5432/database?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=10
```

## Health Checks

Configure your load balancer health check:

- **Path:** `/health/ready`
- **Interval:** 30 seconds
- **Timeout:** 5 seconds
- **Healthy threshold:** 2
- **Unhealthy threshold:** 3

## Monitoring

### CloudWatch Logs

Logs are automatically sent to CloudWatch when using the `awslogs` log driver.

View logs:
```bash
aws logs tail /ecs/pulse-backend --follow
```

### CloudWatch Metrics

ECS automatically sends metrics:
- CPU Utilization
- Memory Utilization
- Task Count

Create alarms for:
- High CPU usage (>80%)
- High memory usage (>80%)
- Service task count < desired count

## Security Best Practices

1. **Use AWS Secrets Manager** for sensitive data
2. **Enable VPC** for database isolation
3. **Use IAM roles** instead of access keys
4. **Enable CloudWatch Logs encryption**
5. **Use HTTPS** (via ALB with SSL certificate)
6. **Set up WAF** rules if needed
7. **Regularly rotate** JWT_SECRET

## Troubleshooting

### Container won't start
- Check CloudWatch logs
- Verify environment variables
- Check database connectivity
- Verify ECR image permissions

### Database connection errors
- Check security group rules
- Verify DATABASE_URL format
- Check RDS endpoint accessibility
- Verify subnet/VPC configuration

### High latency
- Check database connection pooling
- Review CloudWatch metrics
- Consider increasing task size
- Optimize database queries

## Cost Optimization

1. **Use Fargate Spot** for non-critical workloads
2. **Auto-scaling** based on CPU/memory
3. **Reserved capacity** for consistent workloads
4. **Optimize Docker image size** (multi-stage builds)
5. **Use RDS reserved instances** for database

## Rollback Procedure

If a deployment fails:

1. **Update service** to previous task definition:
   ```bash
   aws ecs update-service --cluster pulse-cluster --service pulse-backend --task-definition pulse-backend:PREVIOUS
   ```

2. **Force new deployment**:
   ```bash
   aws ecs update-service --cluster pulse-cluster --service pulse-backend --force-new-deployment
   ```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to ECR
        run: |
          aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${{ secrets.AWS_ECR_REGISTRY }}
      
      - name: Build and push
        run: |
          docker build -t pulse-backend .
          docker tag pulse-backend:latest ${{ secrets.AWS_ECR_REGISTRY }}/pulse-backend:latest
          docker push ${{ secrets.AWS_ECR_REGISTRY }}/pulse-backend:latest
      
      - name: Update ECS service
        run: |
          aws ecs update-service --cluster pulse-cluster --service pulse-backend --force-new-deployment
```

---

For more details, see the main [README.md](./README.md).
