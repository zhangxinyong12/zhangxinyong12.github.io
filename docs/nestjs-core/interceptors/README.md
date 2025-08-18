# 🔄 拦截器 (Interceptors)

> **拦截器是 NestJS 中用于在请求处理过程中添加额外逻辑的强大工具**

## 📚 什么是拦截器？

拦截器是一个使用 `@Injectable()` 装饰器的类，它实现了 `NestInterceptor` 接口。拦截器可以在以下时机执行：

- 🚀 **请求前** - 在路由处理程序执行之前
- 📤 **响应后** - 在路由处理程序执行之后
- 🔄 **异常时** - 在异常抛出时
- ⚡ **异步操作** - 支持异步和同步操作

## 🏗️ 拦截器的基本结构

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log("请求开始...");

    const now = Date.now();
    return next.handle().pipe(
      map((data) => {
        console.log(`请求完成，耗时: ${Date.now() - now}ms`);
        return data;
      })
    );
  }
}
```

## 🎯 拦截器的主要用途

### 1. **日志记录**

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const userAgent = request.get("User-Agent") || "";

    console.log(
      `[${new Date().toISOString()}] ${method} ${url} - ${ip} - ${userAgent}`
    );

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const contentLength = response.get("Content-Length");
        console.log(
          `[${new Date().toISOString()}] ${method} ${url} ${
            response.statusCode
          } ${contentLength} - ${Date.now() - now}ms`
        );
      })
    );
  }
}
```

### 2. **响应转换**

```typescript
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // 统一响应格式
        return {
          code: 200,
          message: "success",
          data: data,
          timestamp: new Date().toISOString(),
        };
      })
    );
  }
}
```

### 3. **缓存处理**

```typescript
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private cacheService: CacheService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.generateCacheKey(request);

    // 尝试从缓存获取数据
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return of(cached);
    }

    // 如果没有缓存，执行请求并缓存结果
    return next.handle().pipe(
      tap((data) => {
        this.cacheService.set(cacheKey, data, 300); // 缓存5分钟
      })
    );
  }

  private generateCacheKey(request: any): string {
    return `${request.method}:${request.url}:${JSON.stringify(request.query)}`;
  }
}
```

### 4. **性能监控**

```typescript
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const { method, url } = request;

        // 记录慢请求
        if (duration > 1000) {
          console.warn(`慢请求警告: ${method} ${url} 耗时 ${duration}ms`);
        }

        // 发送性能指标到监控系统
        this.sendMetrics(method, url, duration);
      })
    );
  }

  private sendMetrics(method: string, url: string, duration: number) {
    // 发送到 Prometheus、DataDog 等监控系统
  }
}
```

## 🔧 如何使用拦截器

### 1. **全局拦截器**

```typescript
// main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { LoggingInterceptor } from "./interceptors/logging.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 注册全局拦截器
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(3000);
}
bootstrap();
```

### 2. **模块级别拦截器**

```typescript
// app.module.ts
import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { LoggingInterceptor } from "./interceptors/logging.interceptor";

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
```

### 3. **控制器级别拦截器**

```typescript
@Controller("users")
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class UsersController {
  // 所有方法都会经过这两个拦截器
}
```

### 4. **方法级别拦截器**

```typescript
@Controller("users")
export class UsersController {
  @Get()
  @UseInterceptors(CacheInterceptor) // 只有这个方法会经过缓存拦截器
  getUsers() {
    return this.usersService.findAll();
  }
}
```

## 🎨 高级拦截器模式

### 1. **条件拦截器**

```typescript
@Injectable()
export class ConditionalInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // 只对特定路径应用拦截器
    if (request.url.startsWith("/api/")) {
      return this.applyApiLogic(next);
    }

    // 对其他路径直接放行
    return next.handle();
  }

  private applyApiLogic(next: CallHandler): Observable<any> {
    // API 特定的逻辑
    return next.handle().pipe(map((data) => ({ api: true, data })));
  }
}
```

### 2. **异步拦截器**

```typescript
@Injectable()
export class AsyncInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    // 异步预处理
    await this.preProcess(context);

    return next.handle().pipe(
      mergeMap(async (data) => {
        // 异步后处理
        const processedData = await this.postProcess(data);
        return processedData;
      })
    );
  }

  private async preProcess(context: ExecutionContext): Promise<void> {
    // 预处理逻辑
  }

  private async postProcess(data: any): Promise<any> {
    // 后处理逻辑
    return data;
  }
}
```

### 3. **错误处理拦截器**

```typescript
@Injectable()
export class ErrorHandlingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // 记录错误日志
        this.logError(error, context);

        // 转换错误格式
        const transformedError = this.transformError(error);

        // 返回转换后的错误
        return throwError(() => transformedError);
      })
    );
  }

  private logError(error: any, context: ExecutionContext): void {
    const request = context.switchToHttp().getRequest();
    console.error(`错误发生在 ${request.method} ${request.url}:`, error);
  }

  private transformError(error: any): any {
    // 统一错误格式
    return {
      statusCode: error.status || 500,
      message: error.message || "内部服务器错误",
      timestamp: new Date().toISOString(),
      path: error.path || "",
    };
  }
}
```

## 🚀 实战示例

### 完整的日志拦截器

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { Request, Response } from "express";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip, headers } = request;
    const userAgent = headers["user-agent"] || "";

    const startTime = Date.now();

    // 记录请求开始
    this.logger.log(`请求开始: ${method} ${url} - ${ip} - ${userAgent}`);

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const contentLength = response.get("content-length");

        // 记录请求完成
        this.logger.log(
          `请求完成: ${method} ${url} ${response.statusCode} ${contentLength} - ${duration}ms`
        );
      }),
      catchError((error) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // 记录错误
        this.logger.error(
          `请求错误: ${method} ${url} ${
            error.status || 500
          } - ${duration}ms - ${error.message}`,
          error.stack
        );

        throw error;
      })
    );
  }
}
```

### 响应转换拦截器

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface Response<T> {
  data: T;
  code: number;
  message: string;
  timestamp: string;
  path: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => ({
        data,
        code: 200,
        message: "success",
        timestamp: new Date().toISOString(),
        path: request.url,
      }))
    );
  }
}
```

### 缓存拦截器

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from "@nestjs/common";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { method, url, query } = request;

    // 只缓存 GET 请求
    if (method !== "GET") {
      return next.handle();
    }

    const cacheKey = this.generateCacheKey(url, query);

    try {
      // 尝试从缓存获取
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        return of(cached);
      }
    } catch (error) {
      // 缓存服务出错时，继续执行请求
      console.warn("缓存服务出错:", error);
    }

    // 执行请求并缓存结果
    return next.handle().pipe(
      tap(async (data) => {
        try {
          await this.cacheManager.set(cacheKey, data, 300000); // 缓存5分钟
        } catch (error) {
          console.warn("设置缓存失败:", error);
        }
      })
    );
  }

  private generateCacheKey(url: string, query: any): string {
    const queryString = JSON.stringify(query);
    return `cache:${url}:${queryString}`;
  }
}
```

## 📝 总结

拦截器是 NestJS 中非常强大的功能，它们提供了：

- 🔄 **横切关注点** - 处理日志、缓存、性能监控等通用逻辑
- 🎯 **灵活控制** - 可以在不同级别应用不同的拦截器
- 🚀 **性能优化** - 支持缓存、异步处理等优化手段
- 🧹 **代码复用** - 将通用逻辑集中管理，避免重复代码
- 🔧 **易于测试** - 拦截器可以独立测试，提高代码质量

通过合理使用拦截器，你可以构建出功能强大、性能优异、易于维护的 NestJS 应用程序！

---

**下一步学习：** [管道 (Pipes)](../pipes/)
