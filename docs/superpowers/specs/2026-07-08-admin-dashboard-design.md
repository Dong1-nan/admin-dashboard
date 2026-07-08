# Admin Dashboard 后台管理系统 — 设计规格文档

> 版本：v1.0  
> 日期：2026-07-08  
> 目标：通过完整项目熟悉“开发 → 测试 → 容器化 → CI/CD → 云服务器部署”的全流程。

---

## 1. 项目概述

### 1.1 项目定位
一个精简但功能完整的**企业级后台管理系统（Admin Dashboard）**。包含用户认证、用户管理、角色权限、操作日志、数据看板等核心模块。

### 1.2 核心目标
1. **熟悉现代全栈开发**：从数据库设计到前后端联调。  
2. **掌握容器化技术**：使用 Docker 构建、优化镜像，Docker Compose 编排服务。  
3. **实践 CI/CD 自动化**：GitHub Actions 实现“代码提交 → 自动化测试 → 构建镜像 → 部署上线”全流程。  
4. **了解生产环境部署**：云服务器 + Nginx 反向代理 + HTTPS SSL 证书配置。

---

## 2. 技术栈详解（小白友好版）

### 2.1 前端技术栈

| 技术 | 作用 | 一句话解释 |
|------|------|-----------|
| **React 18** | UI 框架 | Facebook 开发的 JS 库，用“组件”像搭积木一样拼装页面。目前最流行的前端框架之一。 |
| **TypeScript** | 类型系统 | JavaScript 的超集，给变量加上“类型约束”，写代码时就能发现错误，不用等到运行时才暴露。 |
| **Vite** | 构建工具 | 替代 Webpack 的现代打包工具，启动极快（秒开），热更新几乎无感。 |
| **Ant Design** | UI 组件库 | 阿里巴巴出品的 React 组件库，提供现成的表格、表单、按钮等，风格专业，开箱即用。 |
| **Zustand** | 状态管理 | 管理前端“全局状态”（如登录用户信息）。比 Redux 简单十倍，几行代码就能用。 |
| **TanStack Query** | 服务端状态管理 | 专门处理“从服务器获取的数据”：自动缓存、自动重试、刷新策略，省掉大量手写请求逻辑。 |
| **React Router** | 前端路由 | 让单页应用（SPA）拥有多页面的体验，/login、/users、/dashboard 切换无刷新。 |
| **Axios** | HTTP 请求库 | 封装了浏览器原生的 fetch，更好用的 API，支持拦截器、自动转换 JSON。 |

### 2.2 后端技术栈

| 技术 | 作用 | 一句话解释 |
|------|------|-----------|
| **Node.js** | 运行环境 | 让 JavaScript 脱离浏览器，在服务器上运行。前后端用同一种语言，学习成本大幅降低。 |
| **Express** | Web 框架 | Node.js 最流行的轻量框架，几行代码就能启动一个 HTTP 服务器，处理请求和响应。 |
| **Prisma** | ORM 工具 | “对象关系映射”——用 JavaScript 代码操作数据库，不用手写复杂的 SQL。还能自动做数据库迁移。 |
| **PostgreSQL** | 关系型数据库 | 功能强大的开源数据库，支持复杂查询、事务、JSON 字段。比 MySQL 更标准，比 SQLite 更适合生产。 |
| **JWT (jsonwebtoken)** | 认证机制 | “ JSON Web Token”，登录成功后发给用户一个加密令牌，后续请求携带此令牌证明身份，无需服务器保存会话。 |
| **bcrypt** | 密码加密 | 专门用于密码的哈希算法，即使数据库泄露，攻击者也几乎无法反推出原始密码。 |

### 2.3 DevOps / 部署技术栈

| 技术 | 作用 | 一句话解释 |
|------|------|-----------|
| **Docker** | 容器化 | 把应用和它所需的一切（环境、依赖、配置）打包成一个“集装箱”，在任何机器上运行结果都一样。 |
| **Docker Compose** | 多容器编排 | 一个配置文件定义多个容器（前端、后端、数据库），一条命令 `docker-compose up` 全部启动。 |
| **Nginx** | 反向代理 / Web 服务器 | 高性能的 Web 服务器。对外接收用户请求，对内转发给前端或后端；还能做负载均衡、静态文件托管、HTTPS。 |
| **GitHub Actions** | CI/CD 平台 | GitHub 自带的自动化流水线：你 push 代码，它自动帮你测试、构建、部署。 |
| **Let's Encrypt** | SSL 证书 | 免费的 HTTPS 证书颁发机构，配合工具可自动申请、自动续期，让网站从 HTTP 升级为安全的 HTTPS。 |

---

## 3. 架构设计

### 3.1 系统架构图

```
用户浏览器
    │
    ▼
[ 域名 admin.example.com ]
    │
    ▼
+----------------------------+
|      Nginx (443 HTTPS)     |
|  +----------------------+  |
|  |  SSL 证书 (HTTPS)    |  |
|  +----------------------+  |
|  ├── /  ───────┐         |
|  │              ▼         |
|  │      前端容器 (Nginx)  │
|  │      静态文件 (React)  │
|  │                        |
|  └── /api/* ──► 后端容器   │
|           (Node.js 3000)   |
|                  │         |
+----------------------------+
                   │
                   ▼
            数据库容器 (PostgreSQL 5432)
```

### 3.2 部署流程图

```
开发者提交代码
      │
      ▼
[ GitHub 仓库 ]
      │
      ▼
[ GitHub Actions 触发 ]
      │
      ├──► 安装依赖
      ├──► 运行测试 (Jest/Vitest)
      ├──► 构建 Docker 镜像 (多阶段优化)
      ├──► 推送镜像到 Docker Hub
      │
      ▼
[ SSH 连接云服务器 ]
      │
      ▼
[ 服务器拉取最新镜像 ]
      │
      ▼
[ docker-compose up -d ]
      │
      ▼
[ 新代码上线 ]
```

### 3.3 仓库目录结构（Monorepo）

```
project-root/
├── apps/
│   ├── web/                        # 前端应用
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── api/                # Axios 封装 + 各模块 API
│   │   │   │   ├── request.ts      # 请求实例、拦截器
│   │   │   │   ├── auth.ts         # 认证相关接口
│   │   │   │   ├── user.ts         # 用户管理接口
│   │   │   │   ├── log.ts          # 日志接口
│   │   │   │   └── dashboard.ts    # 看板数据接口
│   │   │   ├── components/         # 公共组件
│   │   │   │   ├── Layout/         # 侧边栏 + 顶部栏布局
│   │   │   │   ├── AuthGuard/      # 路由权限守卫
│   │   │   │   └── DataTable/      # 通用表格组件
│   │   │   ├── pages/              # 页面级组件
│   │   │   │   ├── login/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── users/
│   │   │   │   ├── logs/
│   │   │   │   └── profile/
│   │   │   ├── router/             # React Router 配置
│   │   │   │   └── index.tsx
│   │   │   ├── stores/             # Zustand 状态管理
│   │   │   │   ├── auth.ts         # 认证状态
│   │   │   │   └── user.ts         # 用户管理状态
│   │   │   ├── types/              # TypeScript 类型定义
│   │   │   ├── utils/              # 工具函数
│   │   │   ├── App.tsx             # 根组件
│   │   │   └── main.tsx            # 入口文件
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── Dockerfile              # 前端容器构建文件
│   │   └── nginx.conf              # Nginx 配置
│   │
│   └── server/                     # 后端应用
│       ├── src/
│       │   ├── controllers/        # 控制器：接收请求，返回响应
│       │   │   ├── auth.ts
│       │   │   ├── user.ts
│       │   │   ├── log.ts
│       │   │   └── dashboard.ts
│       │   ├── services/           # 业务逻辑层
│       │   │   ├── auth.ts
│       │   │   └── user.ts
│       │   ├── middlewares/        # 中间件
│       │   │   ├── auth.ts         # JWT 验证
│       │   │   ├── rbac.ts         # 角色权限检查
│       │   │   ├── error.ts        # 全局错误处理
│       │   │   └── logger.ts       # 操作日志记录
│       │   ├── routes/             # 路由注册
│       │   │   └── index.ts
│       │   ├── types/              # 类型定义
│       │   ├── utils/              # 工具函数
│       │   │   ├── jwt.ts
│       │   │   └── bcrypt.ts
│       │   └── app.ts              # Express 应用入口
│       ├── prisma/
│       │   └── schema.prisma       # 数据库模型定义
│       ├── tests/                  # 测试文件
│       ├── package.json
│       ├── tsconfig.json
│       ├── Dockerfile              # 后端容器构建文件
│       └── .env.example            # 环境变量示例
│
├── docker-compose.yml              # 本地开发编排
├── docker-compose.prod.yml         # 生产环境编排
├── .github/
│   └── workflows/
│       └── ci-cd.yml               # GitHub Actions 流水线
├── .gitignore
└── README.md
```

---

## 4. 数据库设计

### 4.1 Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  nickname  String?
  avatar    String?
  role      Role     @default(USER)
  status    Status   @default(ACTIVE)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  logs OperationLog[]

  @@map("users")
}

model OperationLog {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  action    String
  resource  String
  detail    String?
  ip        String?
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@map("operation_logs")
  @@index([userId])
  @@index([createdAt])
}

enum Role {
  ADMIN
  USER
}

enum Status {
  ACTIVE
  DISABLED
}
```

### 4.2 设计说明

- **`users` 表**：核心用户表。密码用 bcrypt 加密存储，不存明文。`role` 区分管理员和普通用户，`status` 可禁用账户。  
- **`operation_logs` 表**：记录所有敏感操作（增删改），用于审计。通过 `userId` 关联用户，建立索引加速按用户和按时间的查询。  
- **软删除**：本项目使用硬删除（真实删除），如需软删除可扩展 `deletedAt` 字段。

---

## 5. API 设计

### 5.1 接口规范

- 基础路径：`/api`
- 响应格式统一：
  ```json
  {
    "success": true,
    "data": {},
    "message": "操作成功"
  }
  ```
- 错误响应：
  ```json
  {
    "success": false,
    "code": "UNAUTHORIZED",
    "message": "未登录或登录已过期"
  }
  ```

### 5.2 接口列表

| 方法 | 路径 | 功能 | 认证 | 角色 |
|------|------|------|------|------|
| POST | /api/auth/login | 登录，返回 JWT Token | 否 | - |
| GET | /api/auth/me | 获取当前登录用户信息 | 是 | - |
| PUT | /api/auth/password | 修改当前用户密码 | 是 | - |
| GET | /api/users | 用户列表（支持分页、搜索） | 是 | ADMIN |
| GET | /api/users/:id | 用户详情 | 是 | ADMIN |
| POST | /api/users | 创建用户 | 是 | ADMIN |
| PUT | /api/users/:id | 更新用户信息 | 是 | ADMIN |
| DELETE | /api/users/:id | 删除用户 | 是 | ADMIN |
| GET | /api/logs | 操作日志列表（分页） | 是 | ADMIN |
| GET | /api/dashboard/stats | 看板统计数据 | 是 | - |

### 5.3 分页规范

查询列表接口统一使用：
- `page`：当前页码（从 1 开始）
- `pageSize`：每页条数（默认 10，最大 100）
- `keyword`：搜索关键词（可选）

响应包含：
```json
{
  "success": true,
  "data": {
    "list": [],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

---

## 6. 模块详细设计

### 6.1 前端模块

#### 6.1.1 路由系统（`router/index.tsx`）

| 路径 | 页面 | 访问权限 |
|------|------|---------|
| /login | 登录页 | 公开 |
| / | Dashboard（重定向到 /dashboard） | 已登录 |
| /dashboard | 数据看板 | 已登录 |
| /users | 用户管理 | ADMIN |
| /logs | 操作日志 | ADMIN |
| /profile | 个人中心 | 已登录 |
| * | 404 页面 | 任意 |

路由守卫逻辑：
1. 访问需要登录的页面，检查 localStorage 是否有 Token，无则跳转 /login。
2. 访问 ADMIN 页面，检查当前用户 role 是否为 ADMIN，否则跳转 Dashboard 并提示无权限。

#### 6.1.2 状态管理

**Auth Store（Zustand）**：
```typescript
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginForm) => Promise<void>;
  logout: () => void;
  fetchUserInfo: () => Promise<void>;
}
```

**User Store（Zustand）**：
```typescript
interface UserState {
  users: User[];
  pagination: Pagination;
  loading: boolean;
  fetchUsers: (params: QueryParams) => Promise<void>;
  createUser: (data: CreateUserForm) => Promise<void>;
  updateUser: (id: number, data: UpdateUserForm) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
}
```

#### 6.1.3 API 请求封装（`api/request.ts`）

- 创建 Axios 实例，配置 `baseURL`。
- **请求拦截器**：自动在 Header 中附加 `Authorization: Bearer <token>`。
- **响应拦截器**：
  - 401：清除 Token，跳转登录页。
  - 403：显示“无权限”提示。
  - 5xx：显示“服务器错误”提示。
  - 其他错误：提取 `response.data.message` 显示。

### 6.2 后端模块

#### 6.2.1 中间件栈（执行顺序）

```
请求进入
  │
  ├──► CORS（跨域处理）
  ├──► Body Parser（解析 JSON）
  ├──► Logger（记录请求基础信息）
  ├──► Auth（JWT 验证，可选）
  ├──► RBAC（权限检查，可选）
  ├──► Route Handler（业务处理）
  │
  └──► Error Handler（全局错误捕获）
```

#### 6.2.2 认证流程

1. 用户 POST `/api/auth/login`，传入 username + password。
2. 后端查询用户，用 bcrypt 比对密码。
3. 密码正确，用 JWT 签发 Token（payload 包含 userId、role），有效期 24 小时。
4. 前端存储 Token（localStorage），后续请求通过 Header 携带。
5. `auth` 中间件验证 Token 签名和有效期，将解码后的用户信息挂载到 `req.user`。

#### 6.2.3 操作日志中间件（`logger.ts`）

在 User 相关路由（POST、PUT、DELETE）后挂载，自动记录：
- 操作人（从 req.user 获取）
- 操作类型（CREATE_USER / UPDATE_USER / DELETE_USER）
- 操作的资源 ID
- 客户端 IP
- 操作时间

#### 6.2.4 全局错误处理（`error.ts`）

捕获所有未处理的异常，统一响应格式：
- Prisma 错误（唯一约束、外键约束）→ 转换为友好提示
- JWT 错误（过期、无效）→ 401
- 业务错误（如用户不存在）→ 自定义 Code + Message
- 未知错误 → 500，并打印堆栈到服务端日志

---

## 7. DevOps 全流程设计

### 7.1 本地开发环境

**方式一：Docker Compose 一键启动（适合快速预览）**

```bash
docker-compose up -d
# 访问 http://localhost
```

**方式二：本地开发模式（适合编码调试，带热重载）**

```bash
# 终端 1：启动 PostgreSQL
docker-compose up -d postgres

# 终端 2：启动后端
cd apps/server
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev        # 监听 3000，代码修改自动重启

# 终端 3：启动前端
cd apps/web
npm install
npm run dev        # 监听 5173，代码修改热更新
```

### 7.2 Docker 多阶段构建

#### 前端 Dockerfile

```dockerfile
# 阶段一：构建 React 应用
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build          # 生成 dist/ 目录（静态文件）

# 阶段二：用 Nginx 提供静态文件
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**为什么分两个阶段？**  
最终镜像只需要 Nginx + 静态文件，不需要 Node.js 环境和源码。这样镜像体积可以从 1GB+ 降到 30MB 左右。

#### 后端 Dockerfile

```dockerfile
# 阶段一：编译 TypeScript
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build          # 生成 dist/ 目录（JS 文件）

# 阶段二：仅保留生产依赖
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate
EXPOSE 3000
CMD ["node", "dist/app.js"]
```

**为什么分两个阶段？**  
开发依赖（TypeScript 编译器、测试框架等）不需要进入生产镜像，减少体积和攻击面。

### 7.3 Docker Compose 配置

#### 本地开发（`docker-compose.yml`）

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
      POSTGRES_DB: dashboard
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  server:
    build: ./apps/server
    environment:
      DATABASE_URL: postgresql://admin:admin123@postgres:5432/dashboard
      JWT_SECRET: your-super-secret-key
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      - postgres

  web:
    build: ./apps/web
    ports:
      - "80:80"
    depends_on:
      - server

volumes:
  postgres_data:
```

#### 生产环境（`docker-compose.prod.yml`）

与本地版本的区别：
- 使用预构建的镜像（`image: yourname/admin-web:latest`）而非本地 build
- 数据库密码和 JWT 密钥使用服务器上的环境变量，不硬编码
- 添加 Nginx 服务统一入口，配置 HTTPS
- 添加日志卷持久化

### 7.4 CI/CD 流水线（GitHub Actions）

完整流水线定义见 [`.github/workflows/ci-cd.yml`](../../.github/workflows/ci-cd.yml)，核心阶段：

| 阶段 | 触发条件 | 任务 |
|------|---------|------|
| **Test** | PR / Push | 安装依赖 → 运行前后端单元测试和接口测试 |
| **Build** | Test 通过后 | 构建前端和后端镜像，打上 commit hash 标签 |
| **Push** | Build 通过后 | 登录 Docker Hub，推送镜像 |
| **Deploy** | Push 到 main 分支 | SSH 连接云服务器 → 拉取最新镜像 → `docker-compose up -d` → 清理旧镜像 |

### 7.5 云服务器部署步骤

1. **购买云服务器**（如阿里云 ECS / 腾讯云 CVM），系统选择 Ubuntu 22.04 LTS。
2. **服务器初始化**：
   ```bash
   # 安装 Docker
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER

   # 安装 Docker Compose
   sudo apt install docker-compose-plugin
   ```
3. **配置域名解析**：将域名 A 记录指向服务器公网 IP。
4. **上传编排文件**：将 `docker-compose.prod.yml` 和 Nginx 配置传到 `/opt/admin-dashboard/`。
5. **配置环境变量**：在服务器上创建 `.env` 文件，写入数据库密码、JWT 密钥、Docker Hub 凭证等。
6. **配置 Nginx + HTTPS**：
   - 安装 certbot：`sudo apt install certbot python3-certbot-nginx`
   - 申请证书：`sudo certbot --nginx -d admin.example.com`
   - 证书自动续期已配置好
7. **首次启动**：`docker-compose -f docker-compose.prod.yml up -d`
8. **后续更新**：由 GitHub Actions 自动完成，或手动执行 `docker-compose pull && docker-compose up -d`

---

## 8. 错误处理策略

### 8.1 后端错误处理

统一错误响应结构：
```typescript
interface ApiError {
  success: false;
  code: string;        // 错误码，前端可用作 i18n key
  message: string;     // 用户友好的错误描述
  details?: any;       // 可选的详细错误信息
}
```

错误码定义：
| 错误码 | HTTP 状态码 | 含义 |
|--------|------------|------|
| UNAUTHORIZED | 401 | 未登录或 Token 过期 |
| FORBIDDEN | 403 | 无权限访问 |
| NOT_FOUND | 404 | 资源不存在 |
| VALIDATION_ERROR | 400 | 请求参数校验失败 |
| DUPLICATE_ENTRY | 409 | 唯一约束冲突（如用户名已存在） |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

### 8.2 前端错误处理

- **请求层**：Axios 拦截器统一处理 HTTP 错误，根据状态码自动提示：
  - 401 → 清除登录态，跳转登录页
  - 403 → `message.error('您没有权限执行此操作')`
  - 5xx → `message.error('服务器繁忙，请稍后重试')`
- **业务层**：API 返回 `success: false` 时，提取 `message` 字段显示。
- **全局**：React Error Boundary 捕获组件渲染错误，避免白屏。

---

## 9. 测试策略

### 9.1 测试分层

| 类型 | 工具 | 范围 | 说明 |
|------|------|------|------|
| 单元测试 | Jest（后端）/ Vitest（前端） | 工具函数、Service 层纯逻辑 | 不依赖数据库和浏览器，执行最快 |
| 接口测试 | Jest + Supertest | 所有 HTTP 端点 | 启动测试数据库，模拟请求验证响应结构和状态码 |
| 组件测试 | Vitest + React Testing Library | 通用 UI 组件 | 验证组件渲染、用户交互、状态变化 |
| E2E 测试 | Playwright（可选） | 完整用户链路 | 如：登录 → 创建用户 → 验证列表出现 |

### 9.2 后端接口测试示例

```typescript
// 测试登录接口
request(app)
  .post('/api/auth/login')
  .send({ username: 'admin', password: 'wrong' })
  .expect(401)
  .expect(res => {
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });
```

### 9.3 CI 中的测试

GitHub Actions 每次触发时：
1. 启动 PostgreSQL Service Container（临时的，仅用于测试）。
2. 运行 Prisma Migrate 创建测试表结构。
3. 并行运行前后端测试套件。
4. 任一测试失败，后续 Build 和 Deploy 阶段自动中止。

---

## 10. 技术选型决策记录（ADR）

| 决策 | 选项 | 选择 | 理由 |
|------|------|------|------|
| 前端框架 | React / Vue / Angular | React | 岗位最多，生态最活跃，学习资料丰富 |
| 状态管理 | Zustand / Redux / MobX | Zustand | 极简单，代码量少，完全满足本项目需求 |
| 后端语言 | Node.js / Go / Java | Node.js | 与前端同语言，降低学习成本，容器构建快 |
| 数据库 | PostgreSQL / MySQL | PostgreSQL | 标准 SQL 支持更好，现代特性丰富 |
| ORM | Prisma / TypeORM / Sequelize | Prisma | 类型安全、迁移方便、开发体验最佳 |
| 部署方式 | Docker / 传统部署 | Docker | 环境一致性，现代 DevOps 标配 |
| 仓库模式 | Monorepo / Multi-repo | Monorepo | 单人项目降低复杂度，一键启动所有服务 |

---

## 11. 里程碑规划

| 阶段 | 内容 | 产出 |
|------|------|------|
| M1 | 环境搭建 + 数据库设计 | 可运行的空项目，数据库连接成功 |
| M2 | 后端核心 API | 登录、用户 CRUD、JWT 认证可用 |
| M3 | 前端基础架构 + 页面 | 可登录，用户管理页面可用 |
| M4 | 权限 + 日志 + 看板 | RBAC 生效，操作日志记录，Dashboard 展示 |
| M5 | Docker 容器化 | 本地 `docker-compose up` 一键启动完整系统 |
| M6 | CI/CD 流水线 | push 代码自动测试、构建、推送镜像 |
| M7 | 云服务器部署上线 | 公网可访问，HTTPS 启用 |

---

## 12. 附录：环境变量说明

### 后端 `.env`

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://admin:admin123@localhost:5432/dashboard` |
| `JWT_SECRET` | JWT 签名密钥 | 随机长字符串 |
| `PORT` | 后端监听端口 | `3000` |
| `NODE_ENV` | 运行环境 | `development` / `production` |

### 前端 `.env`

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `VITE_API_BASE_URL` | 后端 API 地址 | `http://localhost:3000/api` |
