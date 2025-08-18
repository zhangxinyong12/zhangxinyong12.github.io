# 🛡️ 守卫 (Guards)

> **守卫是 NestJS 中用于在请求处理之前进行验证和授权的机制**

## 📚 什么是守卫？

守卫是一个使用 `@Injectable()` 装饰器的类，它实现了 `CanActivate` 接口。守卫在路由处理程序执行之前被调用，用于：

- 🔐 **身份验证** - 验证用户是否已登录
- 🚫 **权限控制** - 检查用户是否有访问特定资源的权限
- 📝 **请求验证** - 验证请求参数和格式
- 🚦 **路由控制** - 决定是否允许请求继续执行

## 🏗️ 守卫的工作原理

```typescript
// 守卫的基本结构
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    // 在这里实现你的验证逻辑
    return true; // 返回 true 允许请求继续，false 则拒绝
  }
}
```

## 🎯 常用守卫类型

### 1. **身份验证守卫**

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.user != null; // 检查用户是否已认证
  }
}
```

### 2. **角色权限守卫**

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      "roles",
      context.getHandler()
    );
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

### 3. **请求频率限制守卫**

```typescript
@Injectable()
export class ThrottleGuard implements CanActivate {
  private requestCount = new Map<string, number>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const clientId = request.ip;
    const currentCount = this.requestCount.get(clientId) || 0;

    if (currentCount >= 100) {
      // 每分钟最多100次请求
      return false;
    }

    this.requestCount.set(clientId, currentCount + 1);
    return true;
  }
}
```

## 🔧 如何使用守卫

### 1. **全局守卫**

```typescript
// main.ts
const app = await NestFactory.create(AppModule);
app.useGlobalGuards(new AuthGuard());
```

### 2. **控制器级别守卫**

```typescript
@Controller("users")
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  // 所有路由都会经过这两个守卫
}
```

### 3. **方法级别守卫**

```typescript
@Controller("users")
export class UsersController {
  @Get("profile")
  @UseGuards(AuthGuard) // 只有这个方法会经过守卫
  getProfile() {
    return "用户资料";
  }
}
```

### 4. **自定义装饰器结合使用**

```typescript
// 创建角色装饰器
export const Roles = (...roles: string[]) => SetMetadata("roles", roles);

// 在控制器中使用
@Controller("admin")
export class AdminController {
  @Get("dashboard")
  @Roles("admin")
  @UseGuards(RolesGuard)
  getDashboard() {
    return "管理员仪表板";
  }
}
```

## 🎨 守卫的最佳实践

### 1. **单一职责原则**

- 每个守卫只负责一个特定的验证逻辑
- 避免在一个守卫中处理多种验证

### 2. **错误处理**

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    try {
      // 验证逻辑
      return this.validateRequest(context);
    } catch (error) {
      // 记录错误日志
      console.error("Auth guard error:", error);
      return false;
    }
  }
}
```

### 3. **性能优化**

```typescript
@Injectable()
export class CacheGuard implements CanActivate {
  constructor(private cacheService: CacheService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const cacheKey = this.generateCacheKey(context);
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await this.performValidation(context);
    await this.cacheService.set(cacheKey, result, 300); // 缓存5分钟
    return result;
  }
}
```

## 🚀 实战示例

### 完整的身份验证守卫

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException("缺少访问令牌");
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request["user"] = payload; // 将用户信息附加到请求对象
      return true;
    } catch {
      throw new UnauthorizedException("无效的访问令牌");
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
```

## 📝 总结

守卫是 NestJS 中非常重要的概念，它们提供了：

- 🔒 **安全性** - 保护你的 API 端点
- 🎯 **灵活性** - 可以在不同级别应用不同的验证逻辑
- 🚀 **性能** - 在请求到达处理程序之前就进行验证
- 🧹 **可维护性** - 将验证逻辑集中管理

通过合理使用守卫，你可以构建出安全、高效、易维护的 NestJS 应用程序！

---

**下一步学习：** [拦截器 (Interceptors)](../interceptors/)
