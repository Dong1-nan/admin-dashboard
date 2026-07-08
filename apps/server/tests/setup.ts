// Jest 测试环境设置
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

// 设置测试超时时间
jest.setTimeout(30000);