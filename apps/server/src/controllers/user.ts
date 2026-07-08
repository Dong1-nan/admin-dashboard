import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, CreateUserInput, UpdateUserInput, QueryParams } from '../types/index.js';
import { UserService } from '../services/user.js';
import { successResponse, errorResponse, ErrorCode } from '../utils/response.js';

const userService = new UserService();

// 验证 schema
const createUserSchema = z.object({
  username: z.string().min(3, '用户名至少 3 位').max(20, '用户名最多 20 位'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少 6 位').max(50, '密码最多 50 位'),
  nickname: z.string().max(30, '昵称最多 30 位').optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
});

const updateUserSchema = z.object({
  nickname: z.string().max(30, '昵称最多 30 位').optional(),
  email: z.string().email('邮箱格式不正确').optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
  status: z.enum(['ACTIVE', 'DISABLED']).optional(),
});

export class UserController {
  async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const params: QueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined,
        keyword: req.query.keyword as string | undefined,
      };
      const result = await userService.getUsers(params);
      return res.json(successResponse(result));
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取用户列表失败';
      return res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, message));
    }
  }

  async getUserById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, '无效的用户 ID'));
      }
      const user = await userService.getUserById(id);
      if (!user) {
        return res.status(404).json(errorResponse(ErrorCode.NOT_FOUND, '用户不存在'));
      }
      return res.json(successResponse(user));
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取用户信息失败';
      return res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, message));
    }
  }

  async createUser(req: AuthenticatedRequest, res: Response) {
    try {
      const validatedData = createUserSchema.parse(req.body) as CreateUserInput;
      const user = await userService.createUser(validatedData);
      return res.json(successResponse(user, '用户创建成功'));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, '参数验证失败', error.errors));
      }
      const message = error instanceof Error ? error.message : '创建用户失败';
      if (message === ErrorCode.DUPLICATE_ENTRY) {
        return res.status(409).json(errorResponse(ErrorCode.DUPLICATE_ENTRY, '用户名或邮箱已存在'));
      }
      return res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, message));
    }
  }

  async updateUser(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, '无效的用户 ID'));
      }
      const validatedData = updateUserSchema.parse(req.body) as UpdateUserInput;
      const user = await userService.updateUser(id, validatedData);
      return res.json(successResponse(user, '用户更新成功'));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, '参数验证失败', error.errors));
      }
      const message = error instanceof Error ? error.message : '更新用户失败';
      if (message === ErrorCode.NOT_FOUND) {
        return res.status(404).json(errorResponse(ErrorCode.NOT_FOUND, '用户不存在'));
      }
      if (message === ErrorCode.DUPLICATE_ENTRY) {
        return res.status(409).json(errorResponse(ErrorCode.DUPLICATE_ENTRY, '邮箱已被其他用户使用'));
      }
      return res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, message));
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, '无效的用户 ID'));
      }
      await userService.deleteUser(id);
      return res.json(successResponse(null, '用户删除成功'));
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除用户失败';
      if (message === ErrorCode.NOT_FOUND) {
        return res.status(404).json(errorResponse(ErrorCode.NOT_FOUND, '用户不存在'));
      }
      return res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, message));
    }
  }

  async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await userService.getStats();
      return res.json(successResponse(stats));
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取统计数据失败';
      return res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, message));
    }
  }
}