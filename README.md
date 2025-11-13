# Pulse - Project Management Tool

A minimalist project management tool designed for team collaboration and project tracking. Built with React, TypeScript, Express, and PostgreSQL.

## 🚀 Features

- **Team Management**: Add, edit, and manage team members with roles and task tracking
- **Project Management**: Track projects with progress bars, status, and due dates
- **Activity Log**: Real-time activity feed for team activities
- **Dark Mode**: Full dark mode support throughout the application
- **Session Management**: Auto-logout after inactivity (configurable)
- **Data Export**: Export team and project data as JSON or CSV
- **Secure Authentication**: JWT-based authentication system

## 📁 Project Structure

```
Pulse/
├── Frontend/          # React + TypeScript frontend application
├── Backend/           # Express + TypeScript backend API
└── README.md          # This file
```

## 🛠️ Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher) or cloud database (AWS RDS, Supabase)
- **npm** or **yarn**

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/King-Angelo/Pulse.git
cd Pulse
```

### 2. Backend Setup

```bash
cd Backend

# Install dependencies
npm install

# Set up environment variables
cp env.template .env
# Edit .env with your database credentials

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed the database
npm run prisma:seed

# Start the development server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `Backend` directory with:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pulse"
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

Create a `.env` file in the `Frontend` directory with:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 📚 Documentation

- **Frontend**: See `Frontend/README.md` for frontend-specific documentation
- **Backend**: See `Backend/README.md` for backend API documentation
- **API Endpoints**: See `Backend/API_ENDPOINTS.md` for complete API reference
- **AWS Deployment**: See `Backend/AWS_DEPLOYMENT.md` for deployment instructions

## 🧪 Development

### Backend Development

```bash
cd Backend
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run prisma:studio # Open Prisma Studio (database GUI)
```

### Frontend Development

```bash
cd Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🚢 Deployment

### Backend Deployment

The backend is Docker-ready and can be deployed to:
- AWS ECS/Fargate
- AWS App Runner
- AWS Elastic Beanstalk
- Any Docker-compatible platform

See `Backend/AWS_DEPLOYMENT.md` for detailed deployment instructions.

### Frontend Deployment

The frontend can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## 📝 Scripts

### Backend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed the database

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👥 Authors

- **King Angelo** - [GitHub](https://github.com/King-Angelo)

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Express](https://expressjs.com/), and [Prisma](https://www.prisma.io/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)

