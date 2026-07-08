import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, LoginInput, ChangePasswordInput } from '../types/index.js';
import { AuthService } from '../services/auth.js';
import { successResponse, errorResponse, ErrorCode } from '../utils/response.js';

const authService = new AuthService();

// 验证 schema
const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(6, '密码至少 6 位'),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(6, '密码至少 6 位'),
  newPassword: z.string().min(6, '新密码至少 6 位'),
});

export class AuthController {
  async login(req: AuthenticatedRequest, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body) as LoginInput;
      const result = await authService.login(validatedData);
      return res.json(successResponse(result, '登录成功'));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, '参数验证失败', error.errors));
      }
      const message = error instanceof Error ? error.message : '登录失败';
      if (message === ErrorCode.INVALID_CREDENTIALS) {
        return res.status(401).json(errorResponse(ErrorCode.INVALID_CREDENTIALS, '用户名或密码错误'));
      }
      if (message === ErrorCode.USER_DISABLED) {
        return res.status(403).json(errorResponse(ErrorCode.USER_DISABLED, '账户已被禁用'));
      }
      return res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, message));
    }
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(errorResponse(ErrorCode.UNAUTHORIZED, '未登录'));
      }
      const user = await authService.getCurrentUser(req.user.userId);
      if (!user) {
        return res.status(404).json(errorResponse(ErrorCode.NOT_FOUND, '用户不存在'));
      }
      return res.json(successResponse(user));
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取用户信息失败';
      return res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, message));
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(errorResponse(ErrorCode.UNAUTHORIZED, '未登录'));
      }
      const validatedData = changePasswordSchema.parse(req.body) as ChangePasswordInput;
      const result = await authService.changePassword(req.user.userId, validatedData);
      return res.json(successResponse(result, '密码修改成功'));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, '参数验证失败', error.errors));
      }
      const message = error instanceof Error ? error.message : '修改密码失败';
      if (message === ErrorCode.INVALID_CREDENTIALS) {
        return res.status(400).json(errorResponse(ErrorCode.INVALID_CREDENTIALS, '原密码错误'));
      }
      return res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, message));
    }
  }
}