# 🔧 依赖注入 (Dependency Injection)

> **深入理解 IoC 容器、依赖注入原理和实现机制**  
> 掌握 NestJS 依赖注入的核心概念，为面试做好充分准备

## 📚 学习内容

- [**依赖注入原理**](./index.md) - IoC 容器、依赖注入原理和实现机制
- [**装饰器系统**](../decorators/) - 装饰器模式、元数据反射和自定义装饰器
- [**提供者管理**](../providers/) - 服务提供、生命周期管理和作用域控制
- [**模块化架构**](../modules/) - 模块设计、动态模块和循环依赖解决方案

## 🎯 面试重点

### 核心问题：请解释 NestJS 中的依赖注入是如何工作的？

这是一个面试高频问题，需要从概念、原理、实现三个层面来回答。

## 🔍 核心概念

### 1. 什么是依赖注入？

**依赖注入 (Dependency Injection, DI)** 是一种设计模式，它实现了**控制反转 (Inversion of Control, IoC)** 原则：

```typescript
// ❌ 传统方式：类内部创建依赖
class UserService {
  private userRepository = new UserRepository(); // 硬编码依赖

  async findUser(id: number) {
    return this.userRepository.findById(id);
  }
}

// ✅ 依赖注入：外部注入依赖
class UserService {
  constructor(private userRepository: UserRepository) {} // 依赖注入

  async findUser(id: number) {
    return this.userRepository.findById(id);
  }
}
```

### 2. IoC 容器的作用

**IoC 容器** 负责管理对象的创建、配置和生命周期：

```typescript
// NestJS 的 IoC 容器
@Module({
  providers: [
    UserService, // 容器管理 UserService 实例
    UserRepository, // 容器管理 UserRepository 实例
    {
      provide: "CONFIG", // 自定义 token
      useValue: { port: 3000 },
    },
  ],
})
export class UsersModule {}
```

## 🏗️ 实现原理

### 1. 元数据收集

NestJS 通过装饰器和反射 API 收集类的元数据：

```typescript
// @Injectable() 装饰器的作用
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService
  ) {}
}

// 装饰器内部实现原理
export function Injectable(options?: InjectableOptions): ClassDecorator {
  return (target: any) => {
    // 1. 收集构造函数参数的类型信息
    const paramTypes = Reflect.getMetadata("design:paramtypes", target) || [];

    // 2. 收集参数装饰器信息
    const paramMetadata = Reflect.getMetadata("__param__", target) || [];

    // 3. 将元数据存储到类上
    Reflect.defineMetadata(
      "nestjs:injectable",
      {
        paramTypes,
        paramMetadata,
        options,
      },
      target
    );
  };
}
```

### 2. 依赖解析过程

```typescript
// 简化的依赖解析过程
class Container {
  private providers = new Map<string, any>();

  resolve(target: any): any {
    // 1. 获取构造函数参数类型
    const paramTypes = Reflect.getMetadata("design:paramtypes", target) || [];

    // 2. 解析每个参数
    const params = paramTypes.map((paramType: any) => {
      // 3. 递归解析依赖
      return this.resolve(paramType);
    });

    // 4. 创建实例
    return new target(...params);
  }
}
```

### 3. 循环依赖解决

NestJS 通过**前向引用 (Forward Reference)** 解决循环依赖：

```typescript
// 循环依赖示例
@Injectable()
export class UserService {
  constructor(private bookService: BookService) {}
}

@Injectable()
export class BookService {
  constructor(private userService: UserService) {} // 循环依赖！
}

// 解决方案 1：使用 forwardRef
@Injectable()
export class BookService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService
  ) {}
}

// 解决方案 2：重构架构
@Injectable()
export class BookService {
  constructor(private eventEmitter: EventEmitter) {}

  // 通过事件解耦
  async createBook(bookData: CreateBookDto) {
    const book = await this.bookRepository.create(bookData);
    this.eventEmitter.emit("book.created", book);
    return book;
  }
}
```

## 🔧 依赖注入方式

### 1. 构造函数注入 (推荐)

```typescript
@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private configService: ConfigService,
    private logger: Logger
  ) {}
}
```

**优点**：

- 依赖关系明确
- 支持不可变性
- 便于测试和模拟

### 2. 属性注入

```typescript
@Injectable()
export class UserService {
  @Inject(UserRepository)
  private userRepository: UserRepository;

  @Inject(ConfigService)
  private configService: ConfigService;
}
```

**使用场景**：

- 可选依赖
- 条件依赖
- 动态依赖

### 3. 方法注入

```typescript
@Injectable()
export class UserService {
  @Inject()
  setRepository(@InjectRepository(User) repository: Repository<User>) {
    this.userRepository = repository;
  }
}
```

## 🎯 高级特性

### 1. 自定义 Token

```typescript
// 使用字符串 token
@Injectable()
export class UserService {
  constructor(
    @Inject("USER_REPOSITORY")
    private userRepository: UserRepository
  ) {}
}

// 使用 Symbol token
export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: UserRepository
  ) {}
}

// 使用类 token
@Injectable()
export class UserService {
  constructor(
    @Inject(UserRepository)
    private userRepository: UserRepository
  ) {}
}
```

### 2. 工厂提供者

```typescript
const databaseProviders = [
  {
    provide: "DATABASE_CONNECTION",
    useFactory: async (configService: ConfigService) => {
      const config = configService.get("database");
      return await createConnection(config);
    },
    inject: [ConfigService], // 注入依赖
  },
];

@Module({
  providers: [...databaseProviders],
})
export class DatabaseModule {}
```

### 3. 异步提供者

```typescript
const asyncDatabaseProviders = [
  {
    provide: "ASYNC_DATABASE_CONNECTION",
    useFactory: async (configService: ConfigService) => {
      const config = configService.get("database");
      return await createConnection(config);
    },
    inject: [ConfigService],
  },
];

@Module({
  providers: [...asyncDatabaseProviders],
})
export class DatabaseModule {}
```

## 🧪 实战示例

### 1. 完整的依赖注入示例

```typescript
// 1. 定义接口
export interface IUserRepository {
  findById(id: number): Promise<User>;
  create(userData: CreateUserDto): Promise<User>;
}

// 2. 实现接口
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>
  ) {}

  async findById(id: number): Promise<User> {
    return this.repository.findOne({ where: { id } });
  }

  async create(userData: CreateUserDto): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }
}

// 3. 服务使用接口
@Injectable()
export class UserService {
  constructor(
    @Inject("USER_REPOSITORY")
    private userRepository: IUserRepository,
    private logger: Logger
  ) {}

  async findUser(id: number): Promise<User> {
    this.logger.log(`Finding user with id: ${id}`);
    return this.userRepository.findById(id);
  }
}

// 4. 模块配置
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    {
      provide: "USER_REPOSITORY",
      useClass: UserRepository,
    },
    UserService,
    Logger,
  ],
  exports: [UserService],
})
export class UsersModule {}
```

### 2. 条件依赖注入

```typescript
// 条件提供者
const userProviders = [
  {
    provide: UserService,
    useClass:
      process.env.NODE_ENV === "production"
        ? ProductionUserService
        : DevelopmentUserService,
  },
];

// 或者使用工厂函数
const conditionalProviders = [
  {
    provide: "USER_SERVICE",
    useFactory: (configService: ConfigService) => {
      const env = configService.get("NODE_ENV");
      return env === "production"
        ? new ProductionUserService()
        : new DevelopmentUserService();
    },
    inject: [ConfigService],
  },
];
```

### 3. 动态模块配置

```typescript
@Module({})
export class DatabaseModule {
  static forRoot(config: DatabaseConfig): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: "DATABASE_CONFIG",
          useValue: config,
        },
        {
          provide: "DATABASE_CONNECTION",
          useFactory: async (config: DatabaseConfig) => {
            return await createConnection(config);
          },
          inject: ["DATABASE_CONFIG"],
        },
      ],
      exports: ["DATABASE_CONNECTION"],
    };
  }
}

// 使用动态模块
@Module({
  imports: [
    DatabaseModule.forRoot({
      host: "localhost",
      port: 3306,
      database: "test",
    }),
  ],
})
export class AppModule {}
```

## 🔍 面试深度解析

### 问题 1：NestJS 的依赖注入是如何工作的？

**标准答案**：

1. **元数据收集阶段**：

   - 通过 `@Injectable()` 装饰器收集类的元数据
   - 使用 `Reflect.getMetadata('design:paramtypes')` 获取构造函数参数类型
   - 收集参数装饰器信息

2. **依赖解析阶段**：

   - IoC 容器根据元数据递归解析依赖
   - 创建依赖树，解决循环依赖
   - 实例化所有依赖

3. **实例创建阶段**：
   - 使用 `new` 操作符创建实例
   - 注入解析后的依赖
   - 管理实例生命周期

### 问题 2：如何解决循环依赖？

**标准答案**：

1. **使用 forwardRef**：

   ```typescript
   @Inject(forwardRef(() => UserService))
   private userService: UserService;
   ```

2. **重构架构**：

   - 提取公共逻辑到第三方服务
   - 使用事件驱动架构
   - 重新设计模块边界

3. **延迟注入**：
   ```typescript
   @Inject(forwardRef(() => UserService))
   private userService: Lazy<UserService>;
   ```

### 问题 3：依赖注入的优势是什么？

**标准答案**：

1. **解耦**：类不需要知道如何创建依赖
2. **可测试性**：便于单元测试和模拟
3. **可维护性**：依赖关系清晰，易于重构
4. **可扩展性**：支持动态配置和插件化
5. **生命周期管理**：容器统一管理对象生命周期

## 🚀 性能优化

### 1. 单例模式

```typescript
// 默认情况下，NestJS 提供者是单例的
@Injectable()
export class UserService {
  // 这个实例在整个应用生命周期中只会创建一次
}
```

### 2. 作用域控制

```typescript
// 请求作用域：每个请求创建新实例
@Injectable({ scope: Scope.REQUEST })
export class RequestScopedService {}

// 瞬态作用域：每次注入创建新实例
@Injectable({ scope: Scope.TRANSIENT })
export class TransientService {}
```

### 3. 懒加载

```typescript
// 懒加载提供者
const lazyProviders = [
  {
    provide: "LAZY_SERVICE",
    useFactory: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(new LazyService());
        }, 1000);
      });
    },
  },
];
```

## 📖 下一步学习

现在你已经深入理解了依赖注入的核心概念，接下来可以学习：

1. **[装饰器系统](../decorators/)** - 掌握装饰器模式和元数据反射
2. **[提供者管理](../providers/)** - 学习生命周期管理和作用域控制
3. **[模块化架构](../modules/)** - 理解模块设计和循环依赖解决方案

---

<div align="center">

**让依赖注入变得清晰易懂** ✨

_从概念到原理，从理论到实战_ 🚀

</div>
