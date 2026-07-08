import prisma from '../utils/db.js';
import { QueryParams, OperationLog, PaginatedResponse } from '../types/index.js';
import { createPagination, validatePagination } from '../utils/response.js';

export class LogService {
  async getLogs(params: QueryParams): Promise<PaginatedResponse<OperationLog>> {
    const { page, pageSize } = validatePagination(params.page, params.pageSize);

    const where = params.keyword
      ? {
          OR: [
            { action: { contains: params.keyword, mode: 'insensitive' } },
            { resource: { contains: params.keyword, mode: 'insensitive' } },
          ],
        }
      : {};

    const [logs, total] = await Promise.all([
      prisma.operationLog.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              nickname: true,
            },
          },
        },
      }),
      prisma.operationLog.count({ where }),
    ]);

    return {
      list: logs as OperationLog[],
      pagination: createPagination(page, pageSize, total),
    };
  }

  async createLog(data: {
    userId: number;
    action: string;
    resource: string;
    detail?: string;
    ip?: string;
  }) {
    await prisma.operationLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        detail: data.detail || null,
        ip: data.ip || null,
      },
    });
  }
}