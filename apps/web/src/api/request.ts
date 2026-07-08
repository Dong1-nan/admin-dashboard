import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';
import { ApiResponse, ApiError } from '../types';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const request: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;
    if (!data.success) {
      message.error(data.message || '请求失败');
      return Promise.reject(new Error(data.message));
    }
    return response;
  },
  (error) => {
    const errorData: ApiError = error.response?.data;
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      message.error('登录已过期，请重新登录');
      window.location.href = '/login';
    } else if (status === 403) {
      message.error('您没有权限执行此操作');
    } else if (status === 404) {
      message.error(errorData?.message || '请求的资源不存在');
    } else if (status === 500) {
      message.error('服务器错误，请稍后重试');
    } else {
      message.error(errorData?.message || '网络错误，请检查网络连接');
    }

    return Promise.reject(error);
  }
);

export default request;

// 封装 GET 请求
export const get = <T>(url: string, params?: object): Promise<AxiosResponse<ApiResponse<T>>> => {
  return request.get(url, { params });
};

// 封装 POST 请求
export const post = <T>(url: string, data?: object): Promise<AxiosResponse<ApiResponse<T>>> => {
  return request.post(url, data);
};

// 封装 PUT 请求
export const put = <T>(url: string, data?: object): Promise<AxiosResponse<ApiResponse<T>>> => {
  return request.put(url, data);
};

// 封装 DELETE 请求
export const del = <T>(url: string): Promise<AxiosResponse<ApiResponse<T>>> => {
  return request.delete(url);
};