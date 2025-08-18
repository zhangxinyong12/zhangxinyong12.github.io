# 🎯 提供者 (Providers)

> **提供者是 NestJS 依赖注入系统的核心，用于创建和管理应用程序中的服务实例**

## 📚 什么是提供者？

提供者是 NestJS 中任何可以被注入到其他类中的类、函数或值。它们包括：

- 🏗️ **服务类** - 业务逻辑的主要载体
- 🔧 **工厂函数** - 动态创建实例的函数
- 💎 **值提供者** - 配置、常量等静态值
- 🔄 **异步提供者** - 异步初始化的服务

## 🏗️ 提供者的基本概念

### 1. **服务类提供者**

```typescript
// users.service.ts
@Injectable()
export class UsersService {
  private users: User[] = [];

  findAll(): User[] {
    return this.users;
  }

  create(user: CreateUserDto): User {
    const newUser = { id: Date.now(), ...user };
    this.users.push(newUser);
    return newUser;
  }
}
```

### 2. **在模块中注册**

```typescript
// users.module.ts
@Module({
  providers: [UsersService], // 注册服务提供者
  exports: [UsersService], // 导出供其他模块使用
})
export class UsersModule {}
```

### 3. **在控制器中注入**

```typescript
// users.controller.ts
@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {} // 依赖注入

  @Get()
  getUsers() {
    return this.usersService.findAll();
  }
}
```

## 🎯 提供者的类型

### 1. **类提供者 (Class Providers)**

```typescript
@Module({
  providers: [
    UsersService, // 直接使用类
    UserRepository, // 另一个服务类
  ],
})
export class UsersModule {}
```

### 2. **值提供者 (Value Providers)**

```typescript
@Module({
  providers: [
    {
      provide: "APP_NAME", // 提供者标识符
      useValue: "My NestJS App", // 提供的值
    },
    {
      provide: "DATABASE_CONFIG", // 配置对象
      useValue: {
        host: "localhost",
        port: 5432,
        database: "myapp",
      },
    },
  ],
})
export class AppModule {}
```

### 3. **工厂提供者 (Factory Providers)**

```typescript
@Module({
  providers: [
    {
      provide: "DATABASE_CONNECTION",
      useFactory: (configService: ConfigService) => {
        return new DatabaseConnection(configService.get("DB_URL"));
      },
      inject: [ConfigService], // 注入依赖
    },
    {
      provide: "LOGGER",
      useFactory: () => {
        return new LoggerService({
          level: "info",
          format: "json",
        });
      },
    },
  ],
})
export class AppModule {}
```

### 4. **别名提供者 (Alias Providers)**

```typescript
@Module({
  providers: [
    UsersService,
    {
      provide: "USERS_SERVICE", // 别名
      useExisting: UsersService, // 指向现有提供者
    },
  ],
})
export class UsersModule {}
```

## 🔧 高级提供者模式

### 1. **异步提供者**

```typescript
@Module({
  providers: [
    {
      provide: "ASYNC_SERVICE",
      useFactory: async (configService: ConfigService) => {
        // 异步初始化
        const connection = await createConnection(configService.get("DB_URL"));
        return new AsyncService(connection);
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
```

### 2. **条件提供者**

```typescript
@Module({
  providers: [
    {
      provide: "CACHE_SERVICE",
      useFactory: (configService: ConfigService) => {
        const cacheType = configService.get("CACHE_TYPE");

        if (cacheType === "redis") {
          return new RedisCacheService();
        } else if (cacheType === "memory") {
          return new MemoryCacheService();
        } else {
          return new DefaultCacheService();
        }
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
```

### 3. **循环依赖提供者**

```typescript
@Module({
  providers: [
    {
      provide: "CIRCULAR_SERVICE",
      useFactory: (forwardRef: () => OtherService) => {
        return new CircularService(forwardRef());
      },
      inject: [forwardRef(() => OtherService)],
    },
  ],
})
export class AppModule {}
```

## 🎨 提供者作用域

### 1. **默认作用域 (Singleton)**

```typescript
@Injectable()
export class UsersService {
  // 整个应用程序生命周期中只有一个实例
}
```

### 2. **请求作用域 (Request-scoped)**

```typescript
@Injectable({ scope: Scope.REQUEST })
export class RequestScopedService {
  // 每个请求都会创建新实例
}
```

### 3. **瞬态作用域 (Transient)**

```typescript
@Injectable({ scope: Scope.TRANSIENT })
export class TransientService {
  // 每次注入都会创建新实例
}
```

## 🔄 提供者生命周期

### 1. **OnModuleInit 接口**

```typescript
@Injectable()
export class DatabaseService implements OnModuleInit {
  async onModuleInit() {
    // 模块初始化完成后执行
    await this.connect();
    console.log("数据库连接成功");
  }

  private async connect() {
    // 连接数据库逻辑
  }
}
```

### 2. **OnModuleDestroy 接口**

```typescript
@Injectable()
export class DatabaseService implements OnModuleDestroy {
  async onModuleDestroy() {
    // 模块销毁前执行
    await this.disconnect();
    console.log("数据库连接已关闭");
  }

  private async disconnect() {
    // 断开数据库连接逻辑
  }
}
```

### 3. **OnApplicationBootstrap 接口**

```typescript
@Injectable()
export class AppService implements OnApplicationBootstrap {
  onApplicationBootstrap() {
    // 应用程序启动完成后执行
    console.log("应用程序启动完成");
  }
}
```

## 🚀 自定义提供者

### 1. **自定义工厂函数**

```typescript
@Module({
  providers: [
    {
      provide: "CUSTOM_LOGGER",
      useFactory: (config: ConfigService) => {
        const logLevel = config.get("LOG_LEVEL", "info");
        const logFormat = config.get("LOG_FORMAT", "text");

        return new CustomLogger(logLevel, logFormat);
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
```

### 2. **异步工厂函数**

```typescript
@Module({
  providers: [
    {
      provide: "ASYNC_CONFIG",
      useFactory: async () => {
        // 从远程配置服务获取配置
        const response = await fetch("https://config.example.com/api/config");
        return response.json();
      },
    },
  ],
})
export class AppModule {}
```

### 3. **条件提供者**

```typescript
@Module({
  providers: [
    {
      provide: "PAYMENT_SERVICE",
      useFactory: (config: ConfigService) => {
        const paymentProvider = config.get("PAYMENT_PROVIDER");

        switch (paymentProvider) {
          case "stripe":
            return new StripePaymentService();
          case "paypal":
            return new PayPalPaymentService();
          default:
            return new DefaultPaymentService();
        }
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
```

## 🔧 实战示例

### 完整的用户服务提供者

```typescript
// users.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async onModuleInit() {
    console.log("用户服务模块初始化完成");
  }

  async onModuleDestroy() {
    console.log("用户服务模块即将销毁");
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error("用户不存在");
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
```

### 配置服务提供者

```typescript
// config.service.ts
import { Injectable } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";

@Injectable()
export class AppConfigService {
  constructor(private configService: NestConfigService) {}

  get database() {
    return {
      host: this.configService.get("DB_HOST", "localhost"),
      port: this.configService.get("DB_PORT", 5432),
      username: this.configService.get("DB_USERNAME", "postgres"),
      password: this.configService.get("DB_PASSWORD", ""),
      database: this.configService.get("DB_NAME", "myapp"),
    };
  }

  get jwt() {
    return {
      secret: this.configService.get("JWT_SECRET", "default-secret"),
      expiresIn: this.configService.get("JWT_EXPIRES_IN", "1d"),
    };
  }

  get app() {
    return {
      port: this.configService.get("PORT", 3000),
      environment: this.configService.get("NODE_ENV", "development"),
    };
  }
}
```

## 📝 总结

提供者是 NestJS 依赖注入系统的核心，它们提供了：

- 🔄 **依赖管理** - 自动管理类之间的依赖关系
- 🎯 **实例控制** - 控制对象的创建和生命周期
- 🧹 **代码解耦** - 降低类之间的耦合度
- 🚀 **测试友好** - 便于进行单元测试和集成测试
- 🎨 **灵活配置** - 支持多种提供者模式和配置方式

通过合理使用提供者，你可以构建出结构清晰、易于维护、高度可测试的 NestJS 应用程序！

---

**下一步学习：** [拦截器 (Interceptors)](../interceptors/)
