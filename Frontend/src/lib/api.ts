/**
 * API Client for Pulse Backend
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Token management
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: Array<{ path: string; message: string }>;
}

export interface PaginatedResponse<T> {
  activities: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Error class
export class ApiError extends Error {
  statusCode: number;
  details?: Array<{ path: string; message: string }>;

  constructor(message: string, statusCode: number, details?: Array<{ path: string; message: string }>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Base request function
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || 'An error occurred',
        response.status,
        data.details
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      500
    );
  }
}

// HTTP methods
export const api = {
  get: <T>(endpoint: string): Promise<ApiResponse<T>> => {
    return request<T>(endpoint, { method: 'GET' });
  },

  post: <T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> => {
    return request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  patch: <T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> => {
    return request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  delete: <T>(endpoint: string): Promise<ApiResponse<T>> => {
    return request<T>(endpoint, { method: 'DELETE' });
  },
};

// Auth API
export const authApi = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) => {
    const response = await api.post<{ user: unknown; token: string }>(
      '/api/auth/register',
      data
    );
    if (response.data?.token) {
      setToken(response.data.token);
    }
    return response;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post<{ user: unknown; token: string }>(
      '/api/auth/login',
      data
    );
    if (response.data?.token) {
      setToken(response.data.token);
    }
    return response;
  },

  logout: () => {
    removeToken();
  },

  getCurrentUser: () => {
    return api.get('/api/auth/me');
  },
};

// Team API
export const teamApi = {
  getAll: () => api.get<Array<{
    id: number;
    name: string;
    role: string;
    email: string;
    initials: string;
    tasksCompleted: number;
    avatar: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>>('/api/team'),

  getById: (id: number) => api.get(`/api/team/${id}`),

  create: (data: {
    name: string;
    role: string;
    email: string;
    initials?: string;
    avatar?: string;
    status?: 'Active' | 'Offline' | 'Away';
  }) => api.post('/api/team', data),

  update: (id: number, data: {
    name?: string;
    role?: string;
    email?: string;
    initials?: string;
    avatar?: string;
    status?: 'Active' | 'Offline' | 'Away';
    tasksCompleted?: number;
  }) => api.patch(`/api/team/${id}`, data),

  delete: (id: number) => api.delete(`/api/team/${id}`),
};

// Project API
export const projectApi = {
  getAll: () => api.get<Array<{
    id: number;
    name: string;
    description?: string;
    progress: number;
    status: string;
    dueDate?: string;
    owner?: unknown;
    ownerId?: number;
    tasks: { completed: number; total: number };
    columns: Array<{ id: string; title: string; color: string; order: number }>;
    createdAt: string;
    updatedAt: string;
  }>>('/api/projects'),

  getById: (id: number) => api.get(`/api/projects/${id}`),

  create: (data: {
    name: string;
    description?: string;
    dueDate?: string;
    ownerId?: number;
  }) => api.post('/api/projects', data),

  update: (id: number, data: {
    name?: string;
    description?: string;
    progress?: number;
    status?: string;
    dueDate?: string;
    ownerId?: number;
  }) => api.patch(`/api/projects/${id}`, data),

  delete: (id: number) => api.delete(`/api/projects/${id}`),
};

// Task API
export const taskApi = {
  getAll: (params?: {
    projectId?: number;
    columnId?: string;
    assignedToId?: number;
  }) => {
    const queryString = params
      ? '?' + new URLSearchParams(
          Object.entries(params)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : '';
    return api.get(`/api/tasks${queryString}`);
  },

  getById: (id: string) => api.get(`/api/tasks/${id}`),

  create: (data: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    columnId: string;
    projectId?: number;
    assignedToId?: number;
  }) => api.post('/api/tasks', data),

  update: (id: string, data: {
    title?: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    columnId?: string;
    projectId?: number;
    assignedToId?: number | null;
    completed?: boolean;
  }) => api.patch(`/api/tasks/${id}`, data),

  move: (id: string, data: { columnId: string; order?: number }) =>
    api.patch(`/api/tasks/${id}/move`, data),

  delete: (id: string) => api.delete(`/api/tasks/${id}`),
};

// Column API
export const columnApi = {
  getAll: (projectId?: number) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    return api.get(`/api/columns${query}`);
  },

  getById: (id: string) => api.get(`/api/columns/${id}`),

  create: (data: {
    title: string;
    color?: string;
    projectId?: number;
    order?: number;
  }) => api.post('/api/columns', data),

  update: (id: string, data: {
    title?: string;
    color?: string;
    order?: number;
  }) => api.patch(`/api/columns/${id}`, data),

  reorder: (columns: Array<{ id: string; order: number }>) =>
    api.patch('/api/columns/reorder', { columns }),

  delete: (id: string) => api.delete(`/api/columns/${id}`),
};

// Activity API
export const activityApi = {
  getAll: (params?: {
    projectId?: number;
    taskId?: string;
    userId?: number;
    type?: string;
    limit?: number;
    offset?: number;
  }) => {
    const queryString = params
      ? '?' + new URLSearchParams(
          Object.entries(params)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : '';
    return api.get<PaginatedResponse<unknown>>(`/api/activities${queryString}`);
  },

  getById: (id: number) => api.get(`/api/activities/${id}`),

  getByProject: (projectId: number, params?: { limit?: number; offset?: number }) => {
    const queryString = params
      ? '?' + new URLSearchParams(
          Object.entries(params)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : '';
    return api.get<PaginatedResponse<unknown>>(`/api/activities/project/${projectId}${queryString}`);
  },

  getRecent: (limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return api.get(`/api/activities/recent/feed${query}`);
  },
};

// User API
export const userApi = {
  getAll: () => api.get('/api/users'),
  getById: (id: number) => api.get(`/api/users/${id}`),
  update: (id: number, data: {
    name?: string;
    role?: string;
    avatar?: string;
    status?: string;
  }) => api.patch(`/api/users/${id}`, data),
  delete: (id: number) => api.delete(`/api/users/${id}`),
};

