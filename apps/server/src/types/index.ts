// 类型定义
export interface User {
  id: number;
  username: string;
  email: string;
  nickname: string | null;
  avatar: string | null;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'DISABLED';
  createdAt: Date;
  updatedAt: Date;
}

export interface OperationLog {
  id: number;
  userId: number;
  action: string;
  resource: string;
  detail: string | null;
  ip: string | null;
  createdAt: Date;
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

export interface JwtPayload {
  userId: number;
  role: 'ADMIN' | 'USER';
}

export interface AuthenticatedRequest extends Express.Request {
  user?: JwtPayload;
}

export interface LoginInput {
  username: string;
  password: string;
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