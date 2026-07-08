import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { successResponse, errorResponse, ErrorCode } from '../utils/response.js';
import { verifyToken } from '../utils/jwt.js';

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(errorResponse(ErrorCode.UNAUTHORIZED, '未登录或登录已过期'));
  }

  const token = authHeader.split(' ')[1];
  
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json(errorResponse(ErrorCode.UNAUTHORIZED, 'Token 无效或已过期'));
  }

  req.user = payload;
  next();
};

export const requireRole = (roles: ('ADMIN' | 'USER')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(errorResponse(ErrorCode.UNAUTHORIZED, '未登录'));
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(errorResponse(ErrorCode.FORBIDDEN, '无权限访问'));
    }

    next();
  };
};