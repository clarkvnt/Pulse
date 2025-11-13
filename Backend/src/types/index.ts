// Type definitions matching frontend models

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  initials: string;
  tasksCompleted: number;
  avatar: string;
  status?: 'Active' | 'Offline' | 'Away';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Project {
  id: number;
  name: string;
  progress: number;
  tasks: {
    completed: number;
    total: number;
  };
  status: string;
  dueDate: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  columnId: string;
  projectId?: number;
  assignedToId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Column {
  id: string;
  title: string;
  color: string;
  projectId?: number;
  order?: number;
}

export interface Activity {
  id: number;
  type: 'task_created' | 'task_updated' | 'task_completed' | 'project_created' | 'member_added' | 'member_updated';
  description: string;
  userId?: number;
  projectId?: number;
  taskId?: string;
  createdAt: Date;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'project_manager' | 'team_member' | 'viewer';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
