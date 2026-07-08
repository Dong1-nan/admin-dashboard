import { get } from './request';
import { QueryParams, PaginatedResponse, OperationLog, ApiResponse } from '../types';

export const logApi = {
  getLogs: (params?: QueryParams) => 
    get<PaginatedResponse<OperationLog>>('/logs', params),
};