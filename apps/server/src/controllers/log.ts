import { Response } from 'express';
import { AuthenticatedRequest, QueryParams } from '../types/index.js';
import { LogService } from '../services/log.js';
import { successResponse, errorResponse, ErrorCode } from '../utils/response.js';

const logService = new LogService();

export class LogController {
  async getLogs(req: AuthenticatedRequest, res: Response) {
    try {
      const params: QueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined,
        keyword: req.query.keyword as string | undefined,
      };
      const result = await logService.getLogs(params);
      return res.json(successResponse(result));
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取日志列表失败';
      return res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, message));
    }
  }
}