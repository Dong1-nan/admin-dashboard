import { get, post, put } from './request';
import { LoginInput, LoginResponse, User, ChangePasswordInput, ApiResponse } from '../types';

export const authApi = {
  login: (data: LoginInput) => post<LoginResponse>('/auth/login', data),
  
  getCurrentUser: () => get<User>('/auth/me'),
  
  changePassword: (data: ChangePasswordInput) => 
    put<{ message: string }>('/auth/password', data),
};