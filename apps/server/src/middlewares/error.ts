import { Response } from 'express';
import { ApiError, AuthenticatedRequest } from '../types/index.js';
import { ErrorCode } from '../utils/response.js';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error,
  req: AuthenticatedRequest,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: () => void
) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // Prisma 错误处理
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      // 唯一约束冲突
      const field = (err.meta?.target as string[])?.[0] || 'field';
      return res.status(409).json({
        success: false,
        code: ErrorCode.DUPLICATE_ENTRY,
        message: `${field} 已存在`,
      } as ApiError);
    }
    if (err.code === 'P2025') {
      // 记录不存在
      return res.status(404).json({
        success: false,
        code: ErrorCode.NOT_FOUND,
        message: '资源不存在',
      } as ApiError);
    }
  }

  // 验证错误 (Zod)
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      code: ErrorCode.VALIDATION_ERROR,
      message: '参数验证失败',
      details: err.message,
    } as ApiError);
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      code: ErrorCode.UNAUTHORIZED,
      message: 'Token 无效或已过期',
    } as ApiError);
  }

  // 默认服务器错误
  res.status(500).json({
    success: false,
    code: ErrorCode.INTERNAL_ERROR,
    message: config.nodeEnv === 'production' ? '服务器内部错误' : err.message,
  } as ApiError);
};

import { config } from '../config/index.js';