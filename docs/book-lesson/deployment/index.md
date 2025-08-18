# 🚀 部署与运维

> **从开发到生产，完整的部署运维指南**  
> 学习如何使用 Docker 容器化应用，实现自动化构建和部署

## 📚 学习内容

- [**Docker 部署**](./index.md) - 容器化部署与编排
- [**CI/CD 流程**](./ci-cd.md) - 自动化构建与部署
- [**性能优化**](./optimization.md) - 系统性能调优与监控

## 🐳 Docker 容器化

### 什么是 Docker？

Docker 是一个开源的容器化平台，它允许开发者将应用程序和其依赖项打包到一个轻量级、可移植的容器中。主要优势包括：

- **一致性** - 开发、测试、生产环境完全一致
- **隔离性** - 应用之间相互隔离，互不影响
- **可移植性** - 一次构建，到处运行
- **轻量级** - 比虚拟机更轻量，启动更快

### 核心概念

- **镜像 (Image)** - 应用程序的静态模板
- **容器 (Container)** - 镜像的运行实例
- **仓库 (Registry)** - 存储和分发镜像的地方
- **Dockerfile** - 定义镜像构建过程的文件

## 🏗️ 项目容器化

### 1. 前端 Dockerfile

```dockerfile
# frontend/Dockerfile
# 多阶段构建，优化镜像大小
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制包管理文件
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 生产阶段
FROM nginx:alpine

# 复制构建产物到 nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 2. 后端 Dockerfile

```dockerfile
# backend/Dockerfile
# 多阶段构建
FROM node:18-alpine AS builder

WORKDIR /app

# 复制包管理文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM node:18-alpine

WORKDIR /app

# 安装 dumb-init 用于进程管理
RUN apk add --no-cache dumb-init

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# 复制构建产物和依赖
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# 切换到非 root 用户
USER nestjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health.js

# 启动应用
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
```

### 3. Nginx 配置

```nginx
# frontend/nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # 启用 gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # API 代理
    location /api/ {
        proxy_pass http://backend:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🚀 Docker Compose 编排

### 1. 开发环境配置

```yaml
# docker-compose.dev.yml
version: "3.8"

services:
  # MySQL 数据库
  mysql:
    image: mysql:8.0
    container_name: book-lesson-mysql-dev
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: book_lesson_dev
      MYSQL_USER: book_user
      MYSQL_PASSWORD: book_pass
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - book-lesson-network

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: book-lesson-redis-dev
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - book-lesson-network

  # 后端服务
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: book-lesson-backend-dev
    environment:
      NODE_ENV: development
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USERNAME: book_user
      DB_PASSWORD: book_pass
      DB_DATABASE: book_lesson_dev
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: dev-secret-key
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - mysql
      - redis
    networks:
      - book-lesson-network
    command: npm run start:dev

  # 前端服务
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: book-lesson-frontend-dev
    ports:
      - "8000:8000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - book-lesson-network
    command: pnpm dev

volumes:
  mysql_data:
  redis_data:

networks:
  book-lesson-network:
    driver: bridge
```

### 2. 生产环境配置

```yaml
# docker-compose.prod.yml
version: "3.8"

services:
  # MySQL 数据库
  mysql:
    image: mysql:8.0
    container_name: book-lesson-mysql-prod
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backup:/backup
    networks:
      - book-lesson-network
    restart: unless-stopped

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: book-lesson-redis-prod
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - book-lesson-network
    restart: unless-stopped

  # 后端服务
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: book-lesson-backend-prod
    environment:
      NODE_ENV: production
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USERNAME: ${MYSQL_USER}
      DB_PASSWORD: ${MYSQL_PASSWORD}
      DB_DATABASE: ${MYSQL_DATABASE}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - mysql
      - redis
    networks:
      - book-lesson-network
    restart: unless-stopped

  # 前端服务
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: book-lesson-frontend-prod
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - book-lesson-network
    restart: unless-stopped

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    container_name: book-lesson-nginx-prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - frontend
      - backend
    networks:
      - book-lesson-network
    restart: unless-stopped

volumes:
  mysql_data:
  redis_data:

networks:
  book-lesson-network:
    driver: bridge
```

## 🔧 环境变量配置

### 1. 环境变量文件

```bash
# .env.development
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=book_user
DB_PASSWORD=book_pass
DB_DATABASE=book_lesson_dev
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:8000
```

```bash
# .env.production
NODE_ENV=production
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=book_user
DB_PASSWORD=strong-production-password
DB_DATABASE=book_lesson_prod
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=very-strong-production-secret-key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://yourdomain.com
```

### 2. 配置验证

```typescript
// backend/src/config/configuration.ts
import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:8000",
  },
}));
```

## 📊 监控与日志

### 1. 应用监控

```typescript
// backend/src/monitoring/monitoring.module.ts
import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { MetricsController } from "./metrics.controller";

@Module({
  imports: [TerminusModule],
  controllers: [HealthController, MetricsController],
})
export class MonitoringModule {}
```

### 2. 健康检查

```typescript
// backend/src/monitoring/health.controller.ts
import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  RedisHealthIndicator,
} from "@nestjs/terminus";

@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck("database"),
      () => this.redis.pingCheck("redis"),
    ]);
  }
}
```

### 3. 日志收集

```yaml
# docker-compose.logging.yml
version: "3.8"

services:
  # ELK Stack 日志收集
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    container_name: book-lesson-elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - book-lesson-network

  logstash:
    image: docker.elastic.co/logstash/logstash:8.8.0
    container_name: book-lesson-logstash
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
      - ./logs:/logs
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch
    networks:
      - book-lesson-network

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    container_name: book-lesson-kibana
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
    networks:
      - book-lesson-network

volumes:
  elasticsearch_data:

networks:
  book-lesson-network:
    external: true
```

## 🔒 安全配置

### 1. 网络安全

```yaml
# docker-compose.security.yml
version: "3.8"

services:
  # 防火墙配置
  ufw:
    image: ubuntu:20.04
    container_name: book-lesson-ufw
    cap_add:
      - NET_ADMIN
    volumes:
      - /lib/modules:/lib/modules:ro
      - ./ufw:/etc/ufw
    networks:
      - book-lesson-network
    command: ufw --force enable

  # SSL 证书管理
  certbot:
    image: certbot/certbot
    container_name: book-lesson-certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    networks:
      - book-lesson-network
    command: certonly --webroot -w /var/www/certbot -d yourdomain.com
```

### 2. 数据备份

```bash
#!/bin/bash
# backup.sh
#!/bin/bash

# 设置变量
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
MYSQL_CONTAINER="book-lesson-mysql-prod"
REDIS_CONTAINER="book-lesson-redis-prod"

# 创建备份目录
mkdir -p $BACKUP_DIR/$DATE

# MySQL 备份
echo "备份 MySQL 数据库..."
docker exec $MYSQL_CONTAINER mysqldump -u root -p$MYSQL_ROOT_PASSWORD \
  --all-databases > $BACKUP_DIR/$DATE/mysql_backup.sql

# Redis 备份
echo "备份 Redis 数据..."
docker exec $REDIS_CONTAINER redis-cli BGSAVE
sleep 5
docker cp $REDIS_CONTAINER:/data/dump.rdb $BACKUP_DIR/$DATE/redis_backup.rdb

# 压缩备份文件
cd $BACKUP_DIR
tar -czf $DATE.tar.gz $DATE
rm -rf $DATE

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "备份完成: $BACKUP_DIR/$DATE.tar.gz"
```

## 🚀 性能优化

### 1. 容器资源限制

```yaml
# docker-compose.optimized.yml
version: "3.8"

services:
  backend:
    # ... 其他配置
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 1G
        reservations:
          cpus: "0.5"
          memory: 512M
    ulimits:
      nofile:
        soft: 65536
        hard: 65536

  frontend:
    # ... 其他配置
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 256M
```

### 2. 负载均衡

```yaml
# docker-compose.scale.yml
version: "3.8"

services:
  backend:
    # ... 其他配置
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s

  nginx:
    # ... 其他配置
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/upstream.conf:/etc/nginx/upstream.conf
```

## 📖 下一步学习

现在你已经了解了 Docker 容器化和基础部署，接下来可以学习：

1. **[CI/CD 流程](./ci-cd.md)** - 实现自动化构建和部署
2. **[性能优化](./optimization.md)** - 系统性能调优和监控
3. **Kubernetes 部署** - 容器编排和集群管理
4. **云原生架构** - 微服务和云服务集成

---

<div align="center">

**让部署变得简单高效** ✨

_从容器到集群，从开发到生产_ 🚀

</div>
