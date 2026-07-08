# 部署指南

本文档详细说明如何在云服务器上部署 Admin Dashboard 后台管理系统。

## 1. 准备工作

### 1.1 购买云服务器

推荐配置：
- **服务商**：阿里云 ECS / 腾讯云 CVM / AWS EC2
- **系统**：Ubuntu 22.04 LTS
- **配置**：2核 4G 内存 50G SSD（最低配置，可根据需求调整）
- **网络**：公网 IP + 开放 80/443 端口

### 1.2 准备域名

1. 购买域名（如阿里云万网、腾讯云 DNSPod）
2. 将域名 A 记录指向服务器公网 IP
3. 确保域名已备案（国内服务器需要）

### 1.3 准备 Docker Hub 账号

用于存储构建好的镜像：
1. 注册 Docker Hub 号：https://hub.docker.com
2. 创建 Access Token（Settings → Security → New Access Token）

---

## 2. 服务器初始化

### 2.1 连接服务器

```bash
ssh root@your-server-ip
```

### 2.2 安装 Docker

```bash
# 更换为阿里云镜像源（可选，加速下载）
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun

# 启动 Docker
systemctl start docker
systemctl enable docker

# 验证安装
docker --version
```

### 2.3 安装 Docker Compose

```bash
# 安装 Docker Compose 插件
apt update
apt install docker-compose-plugin -y

# 验证安装
docker compose version
```

### 2.4 创建部署目录

```bash
mkdir -p /opt/admin-dashboard
cd /opt/admin-dashboard
```

---

## 3. 配置 GitHub Actions Secrets

在 GitHub 仓库设置中添加以下 Secrets：

| Secret 名称 | 说明 |
|------------|------|
| `DOCKER_USERNAME` | Docker Hub 用户名 |
| `DOCKER_PASSWORD` | Docker Hub Access Token |
| `SERVER_HOST` | 服务器公网 IP |
| `SERVER_USER` | SSH 用户名（如 root） |
| `SSH_PRIVATE_KEY` | SSH 私钥内容 |

### 3.1 生成 SSH 密钥

```bash
# 在本地机器生成密钥
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 将公钥上传到服务器
ssh-copy-id root@your-server-ip

# 复制私钥内容到 GitHub Secrets
cat ~/.ssh/id_rsa
```

---

## 4. 配置环境变量

在服务器 `/opt/admin-dashboard/` 目录创建 `.env` 文件：

```bash
# .env 文件内容
POSTGRES_USER=admin
POSTGRES_PASSWORD=<你的数据库密码>
POSTGRES_DB=dashboard
JWT_SECRET=<至少32位的随机字符串>
JWT_EXPIRES_IN=24h
DOMAIN=admin.example.com
DOCKER_USERNAME=<你的Docker Hub用户名>
```

**生成随机密钥：**
```bash
# 生成 32 位随机字符串
openssl rand -base64 32
```

---

## 5. 上传配置文件

### 5.1 上传 Docker Compose 配置

从本地仓库上传：
```bash
scp docker-compose.prod.yml root@your-server-ip:/opt/admin-dashboard/
scp -r nginx root@your-server-ip:/opt/admin-dashboard/
```

### 5.2 创建 Certbot 目录

```bash
mkdir -p /opt/admin-dashboard/certbot/conf
mkdir -p /opt/admin-dashboard/certbot/www
```

---

## 6. 首次部署

### 6.1 手动拉取镜像并启动

```bash
cd /opt/admin-dashboard

# 登录 Docker Hub
docker login

# 拉取镜像（首次需要手动拉取）
docker compose -f docker-compose.prod.yml pull

# 启动服务（先不启动 nginx 和 certbot）
docker compose -f docker-compose.prod.yml up -d postgres server web

# 等待服务启动
sleep 30

# 检查服务状态
docker compose -f docker-compose.prod.yml ps
```

### 6.2 申请 SSL 证书

```bash
# 临时启动 nginx 用于 Certbot 验证
docker compose -f docker-compose.prod.yml up -d nginx

# 申请证书（替换 your-domain.com）
docker run -it --rm \
  -v /opt/admin-dashboard/certbot/conf:/etc/letsencrypt \
  -v /opt/admin-dashboard/certbot/www:/var/www/certbot \
  certbot/certbot certonly --webroot \
  -w /var/www/certbot \
  -d your-domain.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email

# 重启 nginx 使证书生效
docker compose -f docker-compose.prod.yml restart nginx
```

### 6.3 启动 Certbot 自动续期

```bash
docker compose -f docker-compose.prod.yml up -d certbot
```

---

## 7. 验证部署

### 7.1 检查服务状态

```bash
docker compose -f docker-compose.prod.yml ps
```

所有服务应该显示 `running` 状态。

### 7.2 检查日志

```bash
# 查看所有日志
docker compose -f docker-compose.prod.yml logs

# 查看特定服务日志
docker compose -f docker-compose.prod.yml logs server
docker compose -f docker-compose.prod.yml logs nginx
```

### 7.3 访问网站

浏览器访问：`https://your-domain.com`

默认登录账号：
- 管理员：admin / admin123
- 测试用户：testuser / user123

---

## 8. 后续更新

当推送代码到 GitHub main 分支时，CI/CD 流水线会自动：

1. 运行测试
2. 构建新镜像
3. 推送到 Docker Hub
4. SSH 连接服务器，拉取新镜像并重启服务

### 8.1 手动更新

如果需要手动更新：

```bash
cd /opt/admin-dashboard

# 拉取最新镜像
docker compose -f docker-compose.prod.yml pull

# 重启服务
docker compose -f docker-compose.prod.yml up -d

# 清理旧镜像
docker image prune -af
```

---

## 9. 常见问题

### 9.1 数据库连接失败

检查 PostgreSQL 容器状态：
```bash
docker compose -f docker-compose.prod.yml logs postgres
```

常见原因：
- 密码不匹配（检查 `.env` 文件）
- 数据库未初始化（等待 30 秒后重试）

### 9.2 SSL 证书申请失败

常见原因：
- 域名 DNS 解析未生效
- 服务器防火墙阻止 80 端口
- Nginx 未正确配置

检查 DNS 解析：
```bash
dig your-domain.com
```

### 9.3 镜像拉取失败

检查 Docker Hub 登录状态：
```bash
docker logout
docker login
```

---

## 10. 监控与备份

### 10.1 设置日志轮转

Docker 会自动管理容器日志，但可以限制大小：
```yaml
# 在 docker-compose.prod.yml 中添加
services:
  server:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 10.2 数据库备份

```bash
# 创建备份脚本
cat > /opt/admin-dashboard/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/opt/backups
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

docker exec admin-postgres-prod pg_dump -U admin dashboard > $BACKUP_DIR/dashboard_$DATE.sql

# 保留最近 7 天备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
EOF

chmod +x /opt/admin-dashboard/backup.sh

# 添加定时任务（每天凌晨 2 点执行）
crontab -e
# 添加：0 2 * * * /opt/admin-dashboard/backup.sh
```

---

## 11. 安全建议

1. **修改默认密码**：首次登录后立即修改 admin 和 testuser 的密码
2. **更换 JWT Secret**：使用足够长的随机字符串
3. **设置防火墙**：仅开放必要端口（80、443、SSH 端口）
4. **定期更新**：保持系统和 Docker 版本更新
5. **监控日志**：定期检查异常访问日志

---

## 附录：端口说明

| 端口 | 服务 | 说明 |
|-----|------|------|
| 80 | Nginx | HTTP 入口（用于 Certbot 验证） |
| 443 | Nginx | HTTPS 入口 |
| 3000 | Node.js | 后端服务（仅容器内部） |
| 5432 | PostgreSQL | 数据库（仅容器内部） |

---

## 附录：常用命令

```bash
# 查看所有容器状态
docker compose -f docker-compose.prod.yml ps

# 查看日志
docker compose -f docker-compose.prod.yml logs -f

# 重启单个服务
docker compose -f docker-compose.prod.yml restart server

# 停止所有服务
docker compose -f docker-compose.prod.yml down

# 进入容器内部
docker exec -it admin-server-prod sh

# 查看数据库内容
docker exec -it admin-postgres-prod psql -U admin -d dashboard
```