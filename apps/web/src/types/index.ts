export interface User {
  id: number;
  username: string;
  email: string;
  nickname: string | null;
  avatar: string | null;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
  updatedAt: string;
}

export interface OperationLog {
  id: number;
  userId: number;
  action: string;
  resource: string;
  detail: string | null;
  ip: string | null;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    nickname: string | null;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

export interface ApiError {
  success: false;
  code: string;
  message: string;
  details?: unknown;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  list: T[];
  pagination: Pagination;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  nickname?: string;
  role?: 'ADMIN' | 'USER';
}

export interface UpdateUserInput {
  nickname?: string;
  email?: string;
  role?: 'ADMIN' | 'USER';
  status?: 'ACTIVE' | 'DISABLED';
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  totalLogs: number;
  recentUsers: number;
}