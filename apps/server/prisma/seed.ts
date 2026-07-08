// 初始化数据库：创建管理员账户
import prisma from '../src/utils/db.js';
import { hashPassword } from '../src/utils/password.js';

async function seed() {
  try {
    // 检查是否已存在管理员
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' },
    });

    if (existingAdmin) {
      console.log('管理员账户已存在，跳过创建');
      return;
    }

    // 创建管理员账户
    const hashedPassword = await hashPassword('admin123');
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        nickname: '系统管理员',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    console.log('管理员账户创建成功:', {
      id: admin.id,
      username: admin.username,
      email: admin.email,
    });
    console.log('默认密码: admin123');

    // 创建测试用户
    const testUserPassword = await hashPassword('user123');
    const testUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        password: testUserPassword,
        nickname: '测试用户',
        role: 'USER',
        status: 'ACTIVE',
      },
    });

    console.log('测试用户创建成功:', {
      id: testUser.id,
      username: testUser.username,
      email: testUser.email,
    });
    console.log('测试用户密码: user123');

  } catch (error) {
    console.error('种子数据创建失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();