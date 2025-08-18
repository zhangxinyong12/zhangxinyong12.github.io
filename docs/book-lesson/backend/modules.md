# 🏗️ 模块化架构设计

> **模块化架构是构建可维护、可扩展应用程序的关键**

## 📚 模块化设计原则

### 1. **单一职责原则 (SRP)**
- 每个模块只负责一个特定的功能领域
- 模块内部高内聚，模块间低耦合
- 清晰的模块边界和接口定义

### 2. **开闭原则 (OCP)**
- 模块对扩展开放，对修改关闭
- 通过接口和抽象类实现扩展
- 支持插件化架构

### 3. **依赖倒置原则 (DIP)**
- 高层模块不依赖低层模块
- 依赖抽象而不是具体实现
- 通过依赖注入实现解耦

## 🏛️ 模块层次结构

### 1. **核心模块 (Core Module)**
```
core/
├── config/           # 配置管理
├── database/         # 数据库连接
├── logger/           # 日志系统
├── cache/            # 缓存服务
├── security/         # 安全相关
└── utils/            # 工具函数
```

### 2. **功能模块 (Feature Module)**
```
features/
├── users/            # 用户管理
├── books/            # 图书管理
├── borrowings/       # 借阅管理
├── categories/       # 分类管理
└── notifications/    # 通知系统
```

### 3. **共享模块 (Shared Module)**
```
shared/
├── dto/              # 数据传输对象
├── interfaces/       # 接口定义
├── decorators/       # 自定义装饰器
├── guards/           # 守卫
├── interceptors/     # 拦截器
└── pipes/            # 管道
```

## 🔧 核心模块设计

### 配置管理模块
```typescript
// config/config.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from './database.config';
import { JwtConfig } from './jwt.config';
import { RedisConfig } from './redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [DatabaseConfig, JwtConfig, RedisConfig],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
      }),
    }),
  ],
})
export class AppConfigModule {}
```

### 数据库模块
```typescript
// database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),
  ],
})
export class DatabaseModule {}
```

### 缓存模块
```typescript
// cache/cache.module.ts
import { Module, CacheModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        password: configService.get('REDIS_PASSWORD'),
        db: configService.get('REDIS_DB'),
        ttl: 300, // 默认5分钟
        max: 100, // 最大连接数
      }),
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class AppCacheModule {}
```

## 🎯 功能模块设计

### 用户管理模块
```typescript
// features/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile]),
    SharedModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
```

### 图书管理模块
```typescript
// features/books/books.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';
import { BookCategory } from './entities/book-category.entity';
import { SharedModule } from '../../shared/shared.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, BookCategory]),
    SharedModule,
    CategoriesModule,
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService, TypeOrmModule],
})
export class BooksModule {}
```

### 借阅管理模块
```typescript
// features/borrowings/borrowings.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowingsController } from './borrowings.controller';
import { BorrowingsService } from './borrowings.service';
import { Borrowing } from './entities/borrowing.entity';
import { UsersModule } from '../users/users.module';
import { BooksModule } from '../books/books.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Borrowing]),
    UsersModule,
    BooksModule,
    NotificationsModule,
  ],
  controllers: [BorrowingsController],
  providers: [BorrowingsService],
  exports: [BorrowingsService],
})
export class BorrowingsModule {}
```

## 🔗 模块间依赖管理

### 循环依赖处理
```typescript
// 使用 forwardRef 解决循环依赖
@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => BooksModule),
  ],
  // ...
})
export class BorrowingsModule {}

@Module({
  imports: [
    forwardRef(() => BorrowingsModule),
  ],
  // ...
})
export class UsersModule {}
```

### 动态模块
```typescript
// 动态配置模块
@Module({})
export class DatabaseModule {
  static forRoot(options: DatabaseOptions): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: 'DATABASE_OPTIONS',
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
      host: 'localhost',
      port: 5432,
      database: 'bookstore',
    }),
  ],
})
export class AppModule {}
```

## 🎨 共享模块设计

### DTO 模块
```typescript
// shared/dto/pagination.dto.ts
export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sort?: string = 'createdAt';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';
}

// shared/dto/response.dto.ts
export class ApiResponseDto<T> {
  @IsNumber()
  code: number;

  @IsString()
  message: string;

  @IsOptional()
  data?: T;

  @IsOptional()
  pagination?: PaginationMeta;

  @IsDateString()
  timestamp: string;
}
```

### 接口定义
```typescript
// shared/interfaces/crud.interface.ts
export interface ICrudService<T, CreateDto, UpdateDto> {
  create(createDto: CreateDto): Promise<T>;
  findAll(query: PaginationDto): Promise<[T[], number]>;
  findOne(id: string): Promise<T>;
  update(id: string, updateDto: UpdateDto): Promise<T>;
  remove(id: string): Promise<void>;
}

// shared/interfaces/entity.interface.ts
export interface IEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserEntity extends IEntity {
  email: string;
  name: string;
  role: string;
  isActive: boolean;
}
```

### 自定义装饰器
```typescript
// shared/decorators/api-paginated-response.decorator.ts
export const ApiPaginatedResponse = <T extends Type<any>>(model: T) => {
  return applyDecorators(
    ApiOkResponse({
      description: '分页数据响应',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              pagination: {
                $ref: getSchemaPath(PaginationMeta),
              },
            },
          },
        ],
      },
    }),
  );
};

// shared/decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

## 🚀 模块配置和初始化

### 模块配置接口
```typescript
// shared/interfaces/module-config.interface.ts
export interface ModuleConfig {
  name: string;
  version: string;
  description?: string;
  dependencies?: string[];
  config?: Record<string, any>;
}

// 模块配置装饰器
export const ModuleConfig = (config: ModuleConfig) => {
  return (target: any) => {
    Reflect.defineMetadata('module:config', config, target);
    return target;
  };
};
```

### 模块生命周期
```typescript
// 模块初始化服务
@Injectable()
export class ModuleInitializationService implements OnModuleInit {
  constructor(
    @Inject(forwardRef(() => DatabaseModule))
    private databaseModule: DatabaseModule,
    @Inject(forwardRef(() => CacheModule))
    private cacheModule: CacheModule,
  ) {}

  async onModuleInit() {
    // 等待数据库连接
    await this.databaseModule.waitForConnection();
    
    // 初始化缓存
    await this.cacheModule.initialize();
    
    console.log('所有模块初始化完成');
  }
}
```

## 🧪 模块测试

### 模块单元测试
```typescript
describe('UsersModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, UserProfile],
          synchronize: true,
        }),
        UsersModule,
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have UsersService', () => {
    const service = module.get<UsersService>(UsersService);
    expect(service).toBeDefined();
  });

  it('should have UsersController', () => {
    const controller = module.get<UsersController>(UsersController);
    expect(controller).toBeDefined();
  });
});
```

### 模块集成测试
```typescript
describe('UsersModule Integration', () => {
  let app: INestApplication;
  let usersService: UsersService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    usersService = moduleFixture.get<UsersService>(UsersService);
  });

  it('should create user successfully', async () => {
    const createUserDto = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
    };

    const user = await usersService.create(createUserDto);
    expect(user.email).toBe(createUserDto.email);
    expect(user.name).toBe(createUserDto.name);
  });
});
```

## 📊 模块监控

### 模块性能监控
```typescript
// 模块性能装饰器
export const MonitorModule = () => {
  return (target: any) => {
    const originalOnModuleInit = target.prototype.onModuleInit;
    
    target.prototype.onModuleInit = async function() {
      const startTime = Date.now();
      
      try {
        if (originalOnModuleInit) {
          await originalOnModuleInit.call(this);
        }
        
        const duration = Date.now() - startTime;
        console.log(`模块 ${target.name} 初始化完成，耗时: ${duration}ms`);
      } catch (error) {
        console.error(`模块 ${target.name} 初始化失败:`, error);
        throw error;
      }
    };
    
    return target;
  };
};
```

### 模块健康检查
```typescript
// 模块健康检查服务
@Injectable()
export class ModuleHealthService {
  private moduleStatus = new Map<string, boolean>();

  registerModule(name: string) {
    this.moduleStatus.set(name, true);
  }

  unregisterModule(name: string) {
    this.moduleStatus.set(name, false);
  }

  getHealthStatus() {
    const status = {};
    for (const [name, isHealthy] of this.moduleStatus) {
      status[name] = isHealthy ? 'healthy' : 'unhealthy';
    }
    return status;
  }
}
```

## 📝 总结

优秀的模块化架构应该具备：

- 🏗️ **清晰层次** - 核心模块、功能模块、共享模块
- 🔗 **依赖管理** - 合理的依赖关系和循环依赖处理
- 🎯 **单一职责** - 每个模块专注特定功能
- 🔧 **配置灵活** - 支持动态配置和条件加载
- 🧪 **测试友好** - 模块可以独立测试
- 📊 **监控完善** - 模块性能和健康状态监控
- 🚀 **扩展性强** - 支持插件化和动态加载

通过遵循这些设计原则，你可以构建出结构清晰、易于维护、高度可扩展的模块化应用程序！
