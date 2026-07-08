# 阶段一：编译 TypeScript
FROM node:20-alpine AS builder

WORKDIR /app

# 安装 OpenSSL（Prisma 依赖）
RUN apk add --no-cache openssl

# 复制 package.json 并安装所有依赖
COPY package*.json ./
RUN npm install

# 复制 Prisma schema
COPY prisma ./prisma/
RUN npx prisma generate

# 复制源代码并构建
COPY . .
RUN npm run build

# 阶段二：生产镜像（仅包含生产依赖）
FROM node:20-alpine

WORKDIR /app

# 安装 OpenSSL（Prisma 运行时依赖）
RUN apk add --no-cache openssl

# 复制 package.json 并安装生产依赖
COPY package*.json ./
RUN npm install --omit=dev

# 复制构建产物
COPY --from=builder /app/dist ./dist

# 复制 Prisma 文件
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S expressuser -u 1001
USER expressuser

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# 启动命令
CMD ["node", "dist/app.js"]