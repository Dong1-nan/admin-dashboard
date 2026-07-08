import { ApiResponse, ApiError, Pagination } from '../types/index.js';

export const successResponse = <T>(data: T, message = '操作成功'): ApiResponse<T> => ({
  success: true,
  data,
  message,
});

export const errorResponse = (
  code: string,
  message: string,
  details?: unknown
): ApiError => ({
  success: false,
  code,
  message,
  details,
});

export const ErrorCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_DISABLED: 'USER_DISABLED',
} as const;

export const createPagination = (
  page: number,
  pageSize: number,
  total: number
): Pagination => {
  const totalPages = Math.ceil(total / pageSize);
  return {
    page,
    pageSize,
    total,
    totalPages,
  };
};

export const validatePagination = (
  page?: unknown,
  pageSize?: unknown
): { page: number; pageSize: number } => {
  const parsedPage = Math.max(1, parseInt(String(page || 1), 10));
  const parsedPageSize = Math.min(
    100,
    Math.max(1, parseInt(String(pageSize || 10), 10))
  );
  return { page: parsedPage, pageSize: parsedPageSize };
};