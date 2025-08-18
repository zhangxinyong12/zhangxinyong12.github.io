# 🎯 装饰器系统

> **掌握装饰器模式、元数据反射和自定义装饰器开发**  
> 深入理解 NestJS 装饰器的实现原理和高级用法

## 📚 学习内容

- [**依赖注入原理**](../di/) - IoC 容器、依赖注入原理和实现机制
- [**装饰器系统**](./index.md) - 装饰器模式、元数据反射和自定义装饰器
- [**提供者管理**](../providers/) - 服务提供、生命周期管理和作用域控制
- [**模块化架构**](../modules/) - 模块设计、动态模块和循环依赖解决方案

## 🎯 面试重点

### 核心问题：NestJS 的装饰器是如何实现元数据收集的？

这是一个面试高频问题，需要深入理解装饰器模式和元数据反射机制。

## 🔍 核心概念

### 1. 什么是装饰器？

**装饰器 (Decorator)** 是一种特殊类型的声明，它可以被附加到类声明、方法、属性或参数上：

```typescript
// 类装饰器
@Controller('users')
export class UserController {}

// 方法装饰器
@Get(':id')
findOne(@Param('id') id: string) {}

// 属性装饰器
@InjectRepository(User)
private userRepository: Repository<User>;

// 参数装饰器
@Body() createUserDto: CreateUserDto
```

### 2. 装饰器的类型

```typescript
// 1. 类装饰器
function Controller(prefix: string): ClassDecorator {
  return (target: any) => {
    // 在类上添加元数据
    Reflect.defineMetadata("nestjs:controller", { prefix }, target);
  };
}

// 2. 方法装饰器
function Get(path?: string): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    // 在方法上添加元数据
    Reflect.defineMetadata(
      "nestjs:route",
      {
        method: "GET",
        path: path || propertyKey,
      },
      target,
      propertyKey
    );
  };
}

// 3. 属性装饰器
function Inject(token?: any): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    // 在属性上添加元数据
    Reflect.defineMetadata("nestjs:inject", { token }, target, propertyKey);
  };
}

// 4. 参数装饰器
function Body(): ParameterDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number
  ) => {
    // 在参数上添加元数据
    Reflect.defineMetadata(
      "nestjs:param",
      {
        type: "body",
        index: parameterIndex,
      },
      target,
      propertyKey
    );
  };
}
```

## 🏗️ 实现原理

### 1. 元数据反射机制

NestJS 使用 `Reflect` API 来收集和存储元数据：

```typescript
// 启用元数据反射
import "reflect-metadata";

// 存储元数据
Reflect.defineMetadata("key", "value", target);

// 获取元数据
const value = Reflect.getMetadata("key", target);

// 获取所有元数据键
const keys = Reflect.getMetadataKeys(target);
```

### 2. 装饰器执行顺序

```typescript
// 装饰器执行顺序：从下到上，从右到左
@Controller("users") // 3. 最后执行
@UseGuards(AuthGuard) // 2. 然后执行
export class UserController {
  // 1. 先执行类定义

  @Get(":id") // 5. 最后执行
  @UseInterceptors(LogInterceptor) // 4. 然后执行
  findOne(@Param("id") id: string) {} // 3. 先执行方法定义
}
```

### 3. 元数据收集过程

```typescript
// 简化的元数据收集过程
class MetadataCollector {
  collectClassMetadata(target: any, decorators: any[]) {
    // 1. 收集类装饰器元数据
    decorators.forEach((decorator) => {
      const metadata = decorator(target);
      this.storeMetadata(target, metadata);
    });
  }

  collectMethodMetadata(target: any, methodName: string, decorators: any[]) {
    // 2. 收集方法装饰器元数据
    decorators.forEach((decorator) => {
      const metadata = decorator(target, methodName, target[methodName]);
      this.storeMetadata(target, methodName, metadata);
    });
  }

  collectParameterMetadata(target: any, methodName: string, decorators: any[]) {
    // 3. 收集参数装饰器元数据
    decorators.forEach((decorator, index) => {
      const metadata = decorator(target, methodName, index);
      this.storeMetadata(target, methodName, index, metadata);
    });
  }
}
```

## 🔧 内置装饰器详解

### 1. 类装饰器

```typescript
// @Controller - 定义控制器
@Controller("users")
export class UserController {
  // 所有路由都会以 /users 为前缀
}

// @Injectable - 标记可注入的服务
@Injectable()
export class UserService {}

// @Module - 定义模块
@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UsersModule {}

// @Entity - 定义数据库实体
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
}
```

### 2. 方法装饰器

```typescript
// HTTP 方法装饰器
@Get()           // GET 请求
@Post()          // POST 请求
@Put()           // PUT 请求
@Delete()        // DELETE 请求
@Patch()         // PATCH 请求

// 路由装饰器
@Get(':id')      // 带参数的路由
@Post('create')  // 特定路径

// 中间件装饰器
@UseGuards(AuthGuard)           // 使用守卫
@UseInterceptors(LogInterceptor) // 使用拦截器
@UsePipes(ValidationPipe)      // 使用管道
```

### 3. 参数装饰器

```typescript
// 请求参数装饰器
@Param()         // 路径参数
@Query()         // 查询参数
@Body()          // 请求体
@Headers()       // 请求头
@Session()       // 会话数据
@Ip()            // IP 地址
@HostParam()     // 主机参数

// 自定义参数装饰器
@User()          // 当前用户
@Roles()         // 用户角色
@CurrentUser()   // 当前用户信息
```

### 4. 属性装饰器

```typescript
// 依赖注入装饰器
@Inject()        // 注入依赖
@InjectRepository(User) // 注入 TypeORM 仓库
@InjectModel(User.name) // 注入 Mongoose 模型

// 配置装饰器
@Config()        // 注入配置
@Env()           // 注入环境变量
```

## 🎨 自定义装饰器

### 1. 参数装饰器

```typescript
// 创建用户装饰器
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// 使用装饰器
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}

// 带参数的装饰器
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// 使用装饰器
@Get('admin')
@Roles('admin', 'super-admin')
getAdminData() {}
```

### 2. 组合装饰器

```typescript
// 组合多个装饰器
export const AdminOnly = () =>
  applyDecorators(
    UseGuards(AuthGuard, RolesGuard),
    Roles("admin"),
    ApiTags("admin"),
    ApiBearerAuth()
  );

// 使用组合装饰器
@Controller("admin")
export class AdminController {
  @Get("users")
  @AdminOnly()
  getUsers() {}
}

// 或者使用函数组合
export const createAdminDecorator = (path: string) => {
  return applyDecorators(
    Get(path),
    UseGuards(AuthGuard, RolesGuard),
    Roles("admin"),
    ApiTags("admin")
  );
};
```

### 3. 元数据装饰器

```typescript
// 自定义元数据装饰器
export const ApiResponse = (options: ApiResponseOptions) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // 存储 API 响应元数据
    Reflect.defineMetadata('api:response', options, target, propertyKey);

    // 可以在这里添加其他逻辑
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (error) {
        // 错误处理逻辑
        throw error;
      }
    };

    return descriptor;
  };
};

// 使用自定义装饰器
@Get('users')
@ApiResponse({
  status: 200,
  description: '获取用户列表成功',
  type: [User],
})
async getUsers() {
  return this.userService.findAll();
}
```

## 🧪 实战示例

### 1. 权限控制装饰器

```typescript
// 权限装饰器
export const RequirePermissions = (...permissions: string[]) => {
  return applyDecorators(
    SetMetadata("permissions", permissions),
    UseGuards(PermissionGuard)
  );
};

// 权限守卫
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      "permissions",
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredPermissions.every((permission) =>
      user.permissions?.includes(permission)
    );
  }
}

// 使用权限装饰器
@Controller("admin")
export class AdminController {
  @Get("users")
  @RequirePermissions("user:read", "user:list")
  getUsers() {}
}
```

### 2. 缓存装饰器

```typescript
// 缓存装饰器
export const Cache = (ttl: number = 300) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${
        target.constructor.name
      }:${propertyKey}:${JSON.stringify(args)}`;

      // 尝试从缓存获取
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) return cached;

      // 执行原方法
      const result = await originalMethod.apply(this, args);

      // 存储到缓存
      await this.cacheManager.set(cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
};

// 使用缓存装饰器
@Injectable()
export class UserService {
  @Cache(600) // 缓存 10 分钟
  async findById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }
}
```

### 3. 日志装饰器

```typescript
// 日志装饰器
export const Log = (level: "info" | "warn" | "error" = "info") => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();

      try {
        // 记录方法调用
        this.logger[level](
          `Calling ${target.constructor.name}.${propertyKey}`,
          {
            args,
            timestamp: new Date().toISOString(),
          }
        );

        const result = await originalMethod.apply(this, args);

        // 记录方法成功
        this.logger[level](
          `${target.constructor.name}.${propertyKey} completed`,
          {
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
          }
        );

        return result;
      } catch (error) {
        // 记录方法失败
        this.logger.error(`${target.constructor.name}.${propertyKey} failed`, {
          error: error.message,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        });

        throw error;
      }
    };

    return descriptor;
  };
};

// 使用日志装饰器
@Injectable()
export class UserService {
  @Log("info")
  async createUser(userData: CreateUserDto) {
    return this.userRepository.create(userData);
  }
}
```

## 🔍 面试深度解析

### 问题 1：NestJS 的装饰器是如何实现元数据收集的？

**标准答案**：

1. **装饰器执行阶段**：

   - 装饰器在类定义时执行
   - 使用 `Reflect.defineMetadata()` 存储元数据
   - 元数据与目标对象、方法、参数关联

2. **元数据存储结构**：

   ```typescript
   // 类元数据
   Reflect.defineMetadata(
     "nestjs:controller",
     { prefix: "users" },
     UserController
   );

   // 方法元数据
   Reflect.defineMetadata(
     "nestjs:route",
     { method: "GET", path: ":id" },
     UserController,
     "findOne"
   );

   // 参数元数据
   Reflect.defineMetadata(
     "nestjs:param",
     { type: "param", index: 0 },
     UserController,
     "findOne"
   );
   ```

3. **运行时收集**：
   - 使用 `Reflect.getMetadata()` 获取元数据
   - 根据元数据执行相应的逻辑
   - 支持元数据的组合和继承

### 问题 2：装饰器的执行顺序是什么？

**标准答案**：

1. **类装饰器**：从下到上执行
2. **方法装饰器**：从下到上执行
3. **参数装饰器**：从右到左执行
4. **属性装饰器**：从下到上执行

```typescript
@Controller("users") // 3. 最后执行
@UseGuards(AuthGuard) // 2. 然后执行
export class UserController {
  // 1. 先执行类定义

  @Get(":id") // 5. 最后执行
  @UseInterceptors(LogInterceptor) // 4. 然后执行
  findOne(@Param("id") id: string) {} // 3. 先执行方法定义
}
```

### 问题 3：如何创建自定义装饰器？

**标准答案**：

1. **参数装饰器**：使用 `createParamDecorator`
2. **方法装饰器**：直接返回函数，修改 descriptor
3. **类装饰器**：返回 ClassDecorator 函数
4. **组合装饰器**：使用 `applyDecorators` 组合多个装饰器

## 🚀 高级用法

### 1. 条件装饰器

```typescript
// 条件装饰器
export const ConditionalDecorator = (condition: boolean) => {
  return condition ? UseGuards(AuthGuard) : () => {};
};

// 使用条件装饰器
@Controller("api")
export class ApiController {
  @Get("public")
  getPublicData() {}

  @Get("private")
  @ConditionalDecorator(process.env.NODE_ENV === "production")
  getPrivateData() {}
}
```

### 2. 异步装饰器

```typescript
// 异步装饰器
export const AsyncDecorator = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 异步逻辑
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
};
```

### 3. 装饰器工厂

```typescript
// 装饰器工厂
export const createValidationDecorator = (schema: any) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 验证逻辑
      const validationResult = await validate(args[0], schema);
      if (validationResult.length > 0) {
        throw new BadRequestException(validationResult);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
};

// 使用装饰器工厂
@Post()
@UsePipes(ValidationPipe)
@createValidationDecorator(CreateUserSchema)
async createUser(@Body() createUserDto: CreateUserDto) {}
```

## 📖 下一步学习

现在你已经深入理解了装饰器系统，接下来可以学习：

1. **[提供者管理](../providers/)** - 学习生命周期管理和作用域控制
2. **[模块化架构](../modules/)** - 理解模块设计和循环依赖解决方案
3. **[守卫与拦截器](../guards/)** - 掌握请求生命周期和权限控制

---

<div align="center">

**让装饰器系统变得清晰易懂** ✨

_从概念到原理，从理论到实战_ 🚀

</div>
