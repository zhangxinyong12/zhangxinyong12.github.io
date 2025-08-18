# 📦 模块 (Modules)

> **模块是 NestJS 应用程序的基本构建块，用于组织相关的功能组件**

## 📚 什么是模块？

模块是一个使用 `@Module()` 装饰器的类，它包含了：

- 🏗️ **组件** - 控制器、服务、提供者等
- 🔗 **依赖关系** - 模块之间的导入和导出
- 🎯 **功能边界** - 将相关功能组织在一起
- 🚀 **启动配置** - 应用程序的启动模块

## 🏗️ 模块的基本结构

```typescript
import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  imports: [], // 导入其他模块
  controllers: [], // 控制器数组
  providers: [], // 提供者数组
  exports: [], // 导出的提供者
})
export class UsersModule {}
```

## 🎯 模块的四个核心属性

### 1. **imports** - 导入依赖

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // 导入数据库模块
    JwtModule, // 导入JWT模块
    ConfigModule, // 导入配置模块
  ],
})
export class UsersModule {}
```

### 2. **controllers** - 路由控制器

```typescript
@Module({
  controllers: [
    UsersController, // 用户控制器
    AuthController, // 认证控制器
  ],
})
export class UsersModule {}
```

### 3. **providers** - 服务提供者

```typescript
@Module({
  providers: [
    UsersService, // 用户服务
    AuthService, // 认证服务
    {
      // 自定义提供者
      provide: "CONFIG",
      useValue: { apiKey: "your-api-key" },
    },
  ],
})
export class UsersModule {}
```

### 4. **exports** - 导出服务

```typescript
@Module({
  providers: [UsersService],
  exports: [UsersService], // 其他模块可以注入这个服务
})
export class UsersModule {}
```

## 🔗 模块间的依赖关系

### 1. **导入模块**

```typescript
// users.module.ts
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

// 现在 UsersService 可以使用 DatabaseModule 和 AuthModule 中的服务
```

### 2. **导出服务**

```typescript
// shared.module.ts
@Module({
  providers: [SharedService, LoggerService],
  exports: [SharedService, LoggerService], // 导出供其他模块使用
})
export class SharedModule {}

// 其他模块导入后就可以使用这些服务
@Module({
  imports: [SharedModule],
  // ...
})
export class AppModule {}
```

### 3. **循环依赖处理**

```typescript
// 使用 forwardRef 解决循环依赖
@Module({
  imports: [forwardRef(() => AuthModule)],
  exports: [UsersService],
})
export class UsersModule {}

@Module({
  imports: [forwardRef(() => UsersModule)],
  exports: [AuthService],
})
export class AuthModule {}
```

## 🏛️ 模块类型

### 1. **根模块 (Root Module)**

```typescript
// app.module.ts
@Module({
  imports: [UsersModule, AuthModule, DatabaseModule],
})
export class AppModule {}
```

### 2. **功能模块 (Feature Module)**

```typescript
// users.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

### 3. **共享模块 (Shared Module)**

```typescript
// shared.module.ts
@Module({
  providers: [LoggerService, ConfigService, ValidationService],
  exports: [LoggerService, ConfigService, ValidationService],
})
export class SharedModule {}
```

### 4. **全局模块 (Global Module)**

```typescript
// config.module.ts
@Global() // 标记为全局模块，无需导入即可使用
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
```

## 🚀 动态模块

动态模块允许在运行时配置模块：

```typescript
// database.module.ts
@Module({})
export class DatabaseModule {
  static forRoot(options: DatabaseOptions): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: "DATABASE_OPTIONS",
          useValue: options,
        },
        DatabaseService,
      ],
      exports: [DatabaseService],
    };
  }
}

// 使用动态模块
@Module({
  imports: [
    DatabaseModule.forRoot({
      host: "localhost",
      port: 5432,
      database: "myapp",
    }),
  ],
})
export class AppModule {}
```

## 🎨 模块设计最佳实践

### 1. **单一职责原则**

```typescript
// 好的设计：每个模块只负责一个功能领域
@Module({
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
})
export class UsersModule {}

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtService],
  exports: [AuthService],
})
export class AuthModule {}
```

### 2. **依赖注入优化**

```typescript
@Module({
  providers: [
    UsersService,
    {
      provide: "USER_REPOSITORY",
      useClass: UserRepository, // 使用类作为提供者
    },
    {
      provide: "API_CONFIG",
      useValue: { baseUrl: "https://api.example.com" }, // 使用值作为提供者
    },
    {
      provide: "LOGGER_FACTORY",
      useFactory: (config: ConfigService) => {
        return new LoggerService(config.get("logLevel"));
      },
      inject: [ConfigService], // 注入依赖
    },
  ],
})
export class UsersModule {}
```

### 3. **模块组织策略**

```
src/
├── modules/
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   └── auth.service.ts
│   └── shared/
│       ├── shared.module.ts
│       ├── logger.service.ts
│       └── config.service.ts
├── app.module.ts
└── main.ts
```

## 🔧 实战示例

### 完整的用户模块

```typescript
// users.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";
import { SharedModule } from "../shared/shared.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // 导入实体
    SharedModule, // 导入共享模块
  ],
  controllers: [UsersController], // 注册控制器
  providers: [UsersService], // 注册服务
  exports: [UsersService], // 导出服务供其他模块使用
})
export class UsersModule {}
```

### 应用程序根模块

```typescript
// app.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./modules/auth/auth.module";
import { SharedModule } from "./modules/shared/shared.module";

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // 数据库模块
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === "development",
    }),

    // 功能模块
    UsersModule,
    AuthModule,

    // 共享模块
    SharedModule,
  ],
})
export class AppModule {}
```

## 📝 总结

模块是 NestJS 应用程序的骨架，它们提供了：

- 🏗️ **组织结构** - 清晰的功能边界和依赖关系
- 🔄 **可重用性** - 模块可以在不同应用程序中复用
- 🧹 **可维护性** - 代码组织清晰，易于维护和扩展
- 🚀 **性能优化** - 支持懒加载和按需导入
- 🎯 **测试友好** - 模块可以独立测试

通过合理设计模块结构，你可以构建出清晰、可维护、可扩展的 NestJS 应用程序！

---

**下一步学习：** [管道 (Pipes)](../pipes/)
