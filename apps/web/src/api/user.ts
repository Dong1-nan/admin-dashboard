import { get, post, put, del } from './request';
import { 
  User, 
  CreateUserInput, 
  UpdateUserInput, 
  QueryParams, 
  PaginatedResponse,
  DashboardStats
} from '../types';

export const userApi = {
  getUsers: (params?: QueryParams) => 
    get<PaginatedResponse<User>>('/users', params),
  
  getUserById: (id: number) => 
    get<User>(`/users/${id}`),
  
  createUser: (data: CreateUserInput) => 
    post<User>('/users', data),
  
  updateUser: (id: number, data: UpdateUserInput) => 
    put<User>(`/users/${id}`, data),
  
  deleteUser: (id: number) => 
    del<null>(`/users/${id}`),
  
  getStats: () => 
    get<DashboardStats>('/dashboard/stats'),
};