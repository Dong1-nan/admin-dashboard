# Admin Dashboard 后台管理系统

一个精简但功能完整的企业级后台管理系统，用于学习和实践现代全栈开发到生产部署的完整流程。

## 技术栈

### 前端
- React 18 + TypeScript
- Vite（构建工具）
- Ant Design（UI 组件库）
- Zustand（状态管理）
- TanStack Query（服务端状态管理）
- React Router（路由）
- Axios（HTTP 请求）

### 后端
- Node.js + Express
- TypeScript
- Prisma（ORM）
- PostgreSQL（数据库）
- JWT（认证）
- bcrypt（密码加密）

### DevOps
- Docker + Docker Compose
- Nginx（反向代理）
- GitHub Actions（CI/CD）

## 快速开始

### 本地开发（Docker Compose）

```bash
# 启动所有服务
npm run docker:dev

# 访问
# 前端: http://localhost
# 后端 API: http://localhost/api
```

### 本地开发（手动启动）

```bash
# 1. 启动数据库
docker run -d --name postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin123 \
  -e POSTGRES_DB=dashboard \
  -p 5432:5432 \
  postgres:16-alpine

# 2. 启动后端
cd apps/server
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev

# 3. 启动前端
cd apps/web
npm install
npm run dev
```

## 项目结构

```
.
├── apps/
│   ├── web/          # 前端 React 应用
│   └── server/       # 后端 Node.js 应用
├── docker-compose.yml
├── docker-compose.prod.yml
└── docs/
    └── superpowers/
        └── specs/    # 设计规格文档
```

## 文档

详细设计文档见 [`docs/superpowers/specs/2026-07-08-admin-dashboard-design.md`](docs/superpowers/specs/2026-07-08-admin-dashboard-design.md)

## License

MIT