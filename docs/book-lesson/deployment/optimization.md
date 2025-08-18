# ⚡ 性能优化策略

> **性能优化是提升用户体验和系统稳定性的关键**

## 📚 性能优化概述

### 性能指标
- **响应时间** - 请求处理时间
- **吞吐量** - 每秒处理的请求数
- **并发数** - 同时处理的请求数
- **资源利用率** - CPU、内存、磁盘、网络使用率

### 优化目标
- 减少响应时间
- 提高系统吞吐量
- 降低资源消耗
- 提升用户体验

## 🚀 应用层优化

### 1. **代码优化**
```typescript
// 优化前：重复计算
@Get('books')
async getBooks() {
  const books = await this.bookRepository.find();
  const categories = await this.categoryRepository.find();
  
  return books.map(book => ({
    ...book,
    category: categories.find(cat => cat.id === book.categoryId)
  }));
}

// 优化后：批量查询
@Get('books')
async getBooks() {
  const [books, categories] = await Promise.all([
    this.bookRepository.find(),
    this.categoryRepository.find()
  ]);
  
  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
  
  return books.map(book => ({
    ...book,
    category: categoryMap.get(book.categoryId)
  }));
}
```

### 2. **缓存策略**
```typescript
// Redis 缓存服务
@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl = 300): Promise<T> {
    let data = await this.cacheManager.get<T>(key);
    
    if (!data) {
      data = await factory();
      await this.cacheManager.set(key, data, ttl);
    }
    
    return data;
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.cacheManager.store.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map(key => this.cacheManager.del(key)));
    }
  }
}

// 使用缓存
@Get('books/:id')
async getBook(@Param('id') id: string) {
  return this.cacheService.getOrSet(
    `book:${id}`,
    () => this.bookRepository.findOne({ where: { id } }),
    600 // 缓存10分钟
  );
}
```

### 3. **数据库查询优化**
```typescript
// 优化查询
@Get('books')
async getBooks(@Query() query: GetBooksDto) {
  const queryBuilder = this.bookRepository
    .createQueryBuilder('book')
    .leftJoinAndSelect('book.category', 'category')
    .leftJoinAndSelect('book.author', 'author');

  // 动态条件查询
  if (query.categoryId) {
    queryBuilder.andWhere('category.id = :categoryId', { categoryId: query.categoryId });
  }

  if (query.search) {
    queryBuilder.andWhere(
      '(book.title ILIKE :search OR book.description ILIKE :search)',
      { search: `%${query.search}%` }
    );
  }

  // 分页和排序
  return queryBuilder
    .orderBy(`book.${query.sort || 'createdAt'}`, query.order || 'DESC')
    .skip((query.page - 1) * query.limit)
    .take(query.limit)
    .getManyAndCount();
}
```

## 🗄️ 数据库优化

### 1. **索引优化**
```sql
-- 复合索引
CREATE INDEX idx_books_category_status_date ON books(category_id, status, publish_date DESC);

-- 部分索引
CREATE INDEX idx_books_active ON books(id) WHERE status = 'available';

-- 全文搜索索引
CREATE INDEX idx_books_search ON books USING gin(to_tsvector('chinese', title || ' ' || description));

-- 函数索引
CREATE INDEX idx_books_title_lower ON books(LOWER(title));
```

### 2. **查询优化**
```sql
-- 使用 EXPLAIN 分析查询
EXPLAIN (ANALYZE, BUFFERS) 
SELECT b.title, c.name as category_name
FROM books b
JOIN book_categories c ON b.category_id = c.id
WHERE b.status = 'available'
  AND c.is_active = true
ORDER BY b.publish_date DESC
LIMIT 20;

-- 优化后的查询
SELECT b.title, c.name as category_name
FROM books b
INNER JOIN book_categories c ON b.category_id = c.id
WHERE b.status = 'available'
  AND c.is_active = true
  AND b.publish_date >= CURRENT_DATE - INTERVAL '1 year'
ORDER BY b.publish_date DESC
LIMIT 20;
```

### 3. **连接池优化**
```typescript
// TypeORM 连接池配置
{
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: false,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  poolSize: 20,
  acquireTimeout: 60000,
  timeout: 60000,
  extra: {
    max: 20,
    min: 5,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  },
}
```

## 🌐 网络层优化

### 1. **负载均衡**
```nginx
# Nginx 配置
upstream backend {
    least_conn;  # 最少连接数算法
    server 127.0.0.1:3001 weight=3;
    server 127.0.0.1:3002 weight=3;
    server 127.0.0.1:3003 weight=3;
    keepalive 32;
}

server {
    listen 80;
    server_name api.bookstore.com;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # 超时设置
        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
    }
}
```

### 2. **CDN 配置**
```typescript
// CDN 服务配置
@Injectable()
export class CdnService {
  private readonly cdnUrl = process.env.CDN_URL;

  getImageUrl(path: string, options: ImageOptions = {}): string {
    const { width, height, quality = 80, format = 'webp' } = options;
    
    let url = `${this.cdnUrl}/${path}`;
    
    if (width || height) {
      url += `?w=${width || 'auto'}&h=${height || 'auto'}&q=${quality}&f=${format}`;
    }
    
    return url;
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    // 上传到 CDN
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = `images/${fileName}`;
    
    // 实现文件上传逻辑
    
    return filePath;
  }
}
```

### 3. **API 限流**
```typescript
// 限流中间件
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const clientId = request.ip;
    const now = Date.now();
    const limit = 100; // 每分钟100次请求
    const windowMs = 60 * 1000; // 1分钟

    const clientData = this.rateLimitStore.get(clientId);
    
    if (!clientData || now > clientData.resetTime) {
      this.rateLimitStore.set(clientId, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (clientData.count >= limit) {
      return false;
    }

    clientData.count++;
    return true;
  }
}
```

## 📊 监控和告警

### 1. **性能监控**
```typescript
// 性能监控中间件
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        
        // 记录慢请求
        if (duration > 1000) {
          console.warn(`慢请求: ${method} ${url} - ${duration}ms`);
        }

        // 发送到监控系统
        this.sendMetrics(method, url, duration);
      }),
    );
  }

  private sendMetrics(method: string, url: string, duration: number) {
    // 发送到 Prometheus、DataDog 等监控系统
  }
}
```

### 2. **健康检查**
```typescript
// 健康检查控制器
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
      () => this.checkExternalServices(),
    ]);
  }

  private async checkExternalServices() {
    try {
      // 检查外部服务
      const response = await fetch('https://api.external.com/health');
      if (response.ok) {
        return { external: { status: 'up' } };
      }
      throw new Error('External service is down');
    } catch (error) {
      throw new HealthCheckError('External service check failed', error);
    }
  }
}
```

### 3. **日志聚合**
```typescript
// 结构化日志
@Injectable()
export class LoggerService {
  private readonly logger = new Logger(LoggerService.name);

  log(message: string, context?: any) {
    this.logger.log(JSON.stringify({
      message,
      timestamp: new Date().toISOString(),
      level: 'info',
      context,
    }));
  }

  error(message: string, error?: any, context?: any) {
    this.logger.error(JSON.stringify({
      message,
      timestamp: new Date().toISOString(),
      level: 'error',
      error: error?.message || error,
      stack: error?.stack,
      context,
    }));
  }
}
```

## 🔧 系统级优化

### 1. **进程管理**
```typescript
// PM2 配置
module.exports = {
  apps: [{
    name: 'bookstore-api',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    // 自动重启
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    // 错误日志
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
  }],
};
```

### 2. **内存优化**
```typescript
// 内存泄漏检测
@Injectable()
export class MemoryMonitorService {
  private readonly interval = 60000; // 每分钟检查一次

  startMonitoring() {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      
      console.log('内存使用情况:', {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)} MB`,
      });

      // 内存使用过高时告警
      if (memUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
        console.warn('内存使用过高，可能存在内存泄漏');
      }
    }, this.interval);
  }
}
```

### 3. **垃圾回收优化**
```bash
# Node.js 启动参数
node --max-old-space-size=2048 --optimize-for-size dist/main.js

# 或者使用环境变量
export NODE_OPTIONS="--max-old-space-size=2048 --optimize-for-size"
```

## 📈 性能测试

### 1. **压力测试**
```typescript
// 使用 Artillery 进行压力测试
import { test, expect } from '@playwright/test';

test('API 性能测试', async ({ request }) => {
  const startTime = Date.now();
  
  const response = await request.get('/api/books');
  
  const duration = Date.now() - startTime;
  
  // 响应时间应该在500ms以内
  expect(duration).toBeLessThan(500);
  expect(response.ok()).toBeTruthy();
});

// Artillery 配置文件
export default {
  target: 'http://localhost:3000',
  phases: [
    { duration: 60, arrivalRate: 10 },  // 1分钟内，每秒10个用户
    { duration: 120, arrivalRate: 20 }, // 2分钟内，每秒20个用户
    { duration: 60, arrivalRate: 50 },  // 1分钟内，每秒50个用户
  ],
  scenarios: [
    {
      name: '获取图书列表',
      weight: 70,
      flow: [
        { get: { url: '/api/books' } },
        { think: 1 },
      ],
    },
    {
      name: '获取图书详情',
      weight: 30,
      flow: [
        { get: { url: '/api/books/1' } },
        { think: 2 },
      ],
    },
  ],
};
```

### 2. **性能基准**
```typescript
// 性能基准测试
describe('Performance Benchmarks', () => {
  it('should handle 1000 concurrent requests', async () => {
    const startTime = Date.now();
    const concurrentRequests = 1000;
    
    const promises = Array.from({ length: concurrentRequests }, () =>
      request(app.getHttpServer()).get('/api/books')
    );
    
    const responses = await Promise.all(promises);
    const duration = Date.now() - startTime;
    
    // 所有请求都应该成功
    expect(responses.every(res => res.status === 200)).toBe(true);
    
    // 总时间应该在10秒以内
    expect(duration).toBeLessThan(10000);
    
    console.log(`处理 ${concurrentRequests} 个并发请求耗时: ${duration}ms`);
  });
});
```

## 📝 总结

全面的性能优化应该包含：

- 🚀 **应用层优化** - 代码优化、缓存策略、数据库查询优化
- 🗄️ **数据库优化** - 索引优化、查询优化、连接池优化
- 🌐 **网络层优化** - 负载均衡、CDN配置、API限流
- 📊 **监控告警** - 性能监控、健康检查、日志聚合
- 🔧 **系统优化** - 进程管理、内存优化、垃圾回收优化
- 📈 **性能测试** - 压力测试、性能基准、持续监控

通过实施这些优化策略，你可以构建出高性能、高可用的应用程序！
