# 🚀 CI/CD 持续集成与部署

> **自动化部署流程是提高开发效率和代码质量的关键**

## 📚 CI/CD 概述

### 持续集成 (Continuous Integration)
- 自动构建和测试代码
- 早期发现和修复问题
- 保持代码库的稳定性

### 持续部署 (Continuous Deployment)
- 自动部署到生产环境
- 减少人为错误
- 快速响应市场需求

## 🏗️ CI/CD 流水线设计

### 1. **开发阶段**
```
代码提交 → 代码审查 → 自动构建 → 单元测试 → 集成测试
```

### 2. **测试阶段**
```
功能测试 → 性能测试 → 安全测试 → 用户验收测试
```

### 3. **部署阶段**
```
预发布环境 → 生产环境 → 健康检查 → 监控告警
```

## 🔧 GitHub Actions 配置

### 基础工作流
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  POSTGRES_VERSION: '14'

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:${{ env.POSTGRES_VERSION }}
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run tests
      run: npm run test:ci
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

### 构建和部署工作流
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build application
      run: npm run build

    - name: Run security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

    - name: Build Docker image
      run: |
        docker build -t bookstore:${{ github.sha }} .
        docker tag bookstore:${{ github.sha }} bookstore:latest

    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push bookstore:${{ github.sha }}
        docker push bookstore:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - name: Deploy to production
      run: |
        # 部署脚本
        echo "Deploying to production..."
```

## 🐳 Docker 配置

### 多阶段构建
```dockerfile
# Dockerfile
# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装依赖
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM node:18-alpine AS production

WORKDIR /app

# 安装生产依赖
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 启动应用
CMD ["node", "dist/main"]
```

### Docker Compose 配置
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/bookstore
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - app-network

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=bookstore
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

## ☁️ 云平台部署

### AWS ECS 部署
```yaml
# .github/workflows/deploy-aws.yml
name: Deploy to AWS ECS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v2

    - name: Build and push Docker image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: bookstore
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

    - name: Deploy to ECS
      run: |
        aws ecs update-service \
          --cluster bookstore-cluster \
          --service bookstore-service \
          --force-new-deployment
```

### Kubernetes 部署
```yaml
# k8s/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bookstore-api
  labels:
    app: bookstore-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: bookstore-api
  template:
    metadata:
      labels:
        app: bookstore-api
    spec:
      containers:
      - name: bookstore-api
        image: bookstore:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: bookstore-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: bookstore-service
spec:
  selector:
    app: bookstore-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

## 🔒 安全配置

### 密钥管理
```yaml
# 使用 GitHub Secrets
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
  REDIS_URL: ${{ secrets.REDIS_URL }}

# 使用 AWS Secrets Manager
- name: Get secrets from AWS
  run: |
    DATABASE_URL=$(aws secretsmanager get-secret-value --secret-id bookstore/database-url --query SecretString --output text)
    JWT_SECRET=$(aws secretsmanager get-secret-value --secret-id bookstore/jwt-secret --query SecretString --output text)
    echo "DATABASE_URL=$DATABASE_URL" >> $GITHUB_ENV
    echo "JWT_SECRET=$JWT_SECRET" >> $GITHUB_ENV
```

### 安全扫描
```yaml
# 代码安全扫描
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'bookstore:${{ github.sha }}'
    format: 'sarif'
    output: 'trivy-results.sarif'

- name: Upload Trivy scan results
  uses: github/codeql-action/upload-sarif@v2
  with:
    sarif_file: 'trivy-results.sarif'
```

## 📊 监控和告警

### 健康检查端点
```typescript
// health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.pingCheck('redis'),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.pingCheck('redis'),
    ]);
  }
}
```

### 监控配置
```yaml
# Prometheus 配置
- name: Setup monitoring
  run: |
    # 安装 Prometheus
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm install prometheus prometheus-community/kube-prometheus-stack \
      --namespace monitoring \
      --create-namespace

    # 安装 Grafana
    helm repo add grafana https://grafana.github.io/helm-charts
    helm install grafana grafana/grafana \
      --namespace monitoring \
      --set adminPassword=admin123
```

## 🧪 测试策略

### 自动化测试
```yaml
# 测试工作流
- name: Run unit tests
  run: npm run test:unit

- name: Run integration tests
  run: npm run test:integration
  env:
    DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

- name: Run e2e tests
  run: npm run test:e2e

- name: Run performance tests
  run: npm run test:performance
```

### 测试覆盖率
```yaml
# 覆盖率检查
- name: Check test coverage
  run: |
    npm run test:coverage
    if [ $(cat coverage/coverage-summary.json | jq -r '.total.lines.pct') -lt 80 ]; then
      echo "Test coverage is below 80%"
      exit 1
    fi
```

## 📈 性能优化

### 构建优化
```yaml
# 缓存优化
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      node_modules
      */*/node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### 部署策略
```yaml
# 蓝绿部署
- name: Blue-green deployment
  run: |
    # 部署到绿色环境
    kubectl apply -f k8s/green-deployment.yml
    
    # 等待绿色环境就绪
    kubectl wait --for=condition=ready pod -l app=bookstore-green
    
    # 切换流量到绿色环境
    kubectl apply -f k8s/green-service.yml
    
    # 删除蓝色环境
    kubectl delete -f k8s/blue-deployment.yml
```

## 📝 总结

完善的 CI/CD 流水线应该包含：

- 🔄 **自动化流程** - 代码提交到部署全自动化
- 🐳 **容器化部署** - Docker 和 Kubernetes 支持
- ☁️ **云平台集成** - AWS、Azure、GCP 等云服务
- 🔒 **安全防护** - 密钥管理、安全扫描
- 📊 **监控告警** - 健康检查、性能监控
- 🧪 **测试覆盖** - 单元测试、集成测试、E2E测试
- 📈 **性能优化** - 构建缓存、部署策略

通过实现这些 CI/CD 流程，你可以构建出高效、可靠、安全的部署系统！
