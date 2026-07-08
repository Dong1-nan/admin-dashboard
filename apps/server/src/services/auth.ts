import prisma from '../utils/db.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { LoginInput, ChangePasswordInput, User } from '../types/index.js';
import { ErrorCode } from '../utils/response.js';

export class AuthService {
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { username: input.username },
    });

    if (!user) {
      throw new Error(ErrorCode.INVALID_CREDENTIALS);
    }

    if (user.status === 'DISABLED') {
      throw new Error(ErrorCode.USER_DISABLED);
    }

    const isPasswordValid = await comparePassword(input.password, user.password);
    if (!isPasswordValid) {
      throw new Error(ErrorCode.INVALID_CREDENTIALS);
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
      },
    };
  }

  async getCurrentUser(userId: number): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async changePassword(userId: number, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(ErrorCode.NOT_FOUND);
    }

    const isPasswordValid = await comparePassword(input.oldPassword, user.password);
    if (!isPasswordValid) {
      throw new Error(ErrorCode.INVALID_CREDENTIALS);
    }

    const hashedPassword = await hashPassword(input.newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: '密码修改成功' };
  }
}