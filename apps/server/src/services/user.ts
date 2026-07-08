import prisma from '../utils/db.js';
import { hashPassword } from '../utils/password.js';
import { CreateUserInput, UpdateUserInput, QueryParams, User, PaginatedResponse } from '../types/index.js';
import { createPagination, validatePagination, ErrorCode } from '../utils/response.js';

export class UserService {
  async getUsers(params: QueryParams): Promise<PaginatedResponse<User>> {
    const { page, pageSize } = validatePagination(params.page, params.pageSize);

    const where = params.keyword
      ? {
          OR: [
            { username: { contains: params.keyword, mode: 'insensitive' } },
            { email: { contains: params.keyword, mode: 'insensitive' } },
            { nickname: { contains: params.keyword, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          nickname: true,
          avatar: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      list: users as User[],
      pagination: createPagination(page, pageSize, total),
    };
  }

  async getUserById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        nickname: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user as User | null;
  }

  async createUser(input: CreateUserInput): Promise<User> {
    // 检查用户名是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: input.username }, { email: input.email }],
      },
    });

    if (existingUser) {
      if (existingUser.username === input.username) {
        throw new Error(ErrorCode.DUPLICATE_ENTRY);
      }
      throw new Error(ErrorCode.DUPLICATE_ENTRY);
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        password: hashedPassword,
        nickname: input.nickname || null,
        role: input.role || 'USER',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        username: true,
        email: true,
        nickname: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user as User;
  }

  async updateUser(id: number, input: UpdateUserInput): Promise<User> {
    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new Error(ErrorCode.NOT_FOUND);
    }

    // 检查邮箱是否已被其他用户使用
    if (input.email && input.email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: { email: input.email, NOT: { id } },
      });
      if (emailExists) {
        throw new Error(ErrorCode.DUPLICATE_ENTRY);
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        nickname: input.nickname,
        email: input.email,
        role: input.role,
        status: input.status,
      },
      select: {
        id: true,
        username: true,
        email: true,
        nickname: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user as User;
  }

  async deleteUser(id: number): Promise<void> {
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new Error(ErrorCode.NOT_FOUND);
    }

    await prisma.user.delete({ where: { id } });
  }

  async getStats() {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { status: 'ACTIVE' } });
    const adminUsers = await prisma.user.count({ where: { role: 'ADMIN' } });
    const totalLogs = await prisma.operationLog.count();

    // 最近 7 天注册用户数
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      totalLogs,
      recentUsers,
    };
  }
}