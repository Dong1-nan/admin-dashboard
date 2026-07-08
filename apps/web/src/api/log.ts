import { get } from './request';
import { QueryParams, PaginatedResponse, OperationLog } from '../types';

export const logApi = {
  getLogs: (params?: QueryParams) => 
    get<PaginatedResponse<OperationLog>>('/logs', params),
};