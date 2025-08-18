# 🖥️ 后端开发 (NestJS)

> **基于 NestJS 10.x 的企业级后端开发**  
> 学习如何构建可扩展、可维护的后端服务，掌握模块化架构和依赖注入

## 📚 学习内容

- [**框架介绍**](./index.md) - NestJS 架构设计与核心概念
- [**模块设计**](./modules.md) - 模块化架构与依赖注入
- [**数据库操作**](./database.md) - TypeORM 集成与数据模型
- [**权限控制**](./auth.md) - JWT 认证与角色权限管理
- [**API 设计**](./api-design.md) - RESTful API 规范与实现

## 🚀 NestJS 框架介绍

### 什么是 NestJS？

NestJS 是一个用于构建高效、可扩展的 Node.js 服务器端应用程序的框架，它：

- **使用 TypeScript** - 提供完整的类型安全和智能提示
- **借鉴 Angular** - 采用装饰器、依赖注入等现代架构模式
- **模块化设计** - 清晰的代码组织和可维护性
- **开箱即用** - 内置验证、序列化、文档生成等功能

### 核心特性

- 🏗️ **模块化架构** - 基于装饰器的模块系统
- 🔧 **依赖注入** - 强大的 IoC 容器和依赖管理
- 🚀 **高性能** - 基于 Express/Fastify 的高性能 HTTP 服务器
- 🔐 **安全内置** - 内置认证、授权、CORS 等安全特性
- 📚 **文档生成** - 自动生成 Swagger/OpenAPI 文档
- 🧪 **测试友好** - 完整的测试工具链和模拟支持

## 🏗️ 项目搭建

### 环境准备

```bash
# 确保 Node.js 版本 >= 18
node --version

# 安装 NestJS CLI
npm install -g @nestjs/cli

# 验证安装
nest --version
```

### 创建项目

```bash
# 使用 NestJS CLI 创建项目
nest new book-lesson-backend

# 选择包管理器
? Which package manager would you ❯ prefer to use? (Use arrow keys)
❯ npm
  yarn
  pnpm

# 进入项目目录
cd book-lesson-backend
```

### 项目结构

```
book-lesson-backend/
├── src/
│   ├── app.module.ts         # 根模块
│   ├── app.controller.ts     # 根控制器
│   ├── app.service.ts        # 根服务
│   ├── main.ts              # 应用入口
│   ├── auth/                # 认证模块
│   ├── users/               # 用户模块
│   ├── books/               # 图书模块
│   ├── categories/          # 分类模块
│   ├── borrows/             # 借阅模块
│   └── common/              # 公共模块
├── test/                    # 测试文件
├── nest-cli.json           # NestJS CLI 配置
├── package.json            # 依赖配置
├── tsconfig.json           # TypeScript 配置
└── .env                    # 环境变量
```

### 启动开发服务器

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run start:dev

# 启动生产服务器
npm run start:prod

# 构建项目
npm run build
```

## 🎯 核心概念

### 1. 模块 (Modules)

模块是 NestJS 应用的基本构建块：

```typescript
// src/books/books.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BooksController } from "./books.controller";
import { BooksService } from "./books.service";
import { Book } from "./entities/book.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Book])],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService], // 导出服务供其他模块使用
})
export class BooksModule {}
```

### 2. 控制器 (Controllers)

控制器负责处理 HTTP 请求：

```typescript
// src/books/books.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { BooksService } from "./books.service";
import { CreateBookDto } from "./dto/create-book.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("books")
@UseGuards(JwtAuthGuard, RolesGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @Roles("admin", "librarian")
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get()
  findAll() {
    return this.booksService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.booksService.findOne(+id);
  }
}
```

### 3. 服务 (Services)

服务包含业务逻辑：

```typescript
// src/books/books.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Book } from "./entities/book.entity";
import { CreateBookDto } from "./dto/create-book.dto";
import { UpdateBookDto } from "./dto/update-book.dto";

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const book = this.booksRepository.create(createBookDto);
    return await this.booksRepository.save(book);
  }

  async findAll(): Promise<Book[]> {
    return await this.booksRepository.find({
      relations: ["category", "author"],
    });
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: { id },
      relations: ["category", "author"],
    });

    if (!book) {
      throw new NotFoundException(`图书 ID ${id} 不存在`);
    }

    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);
    Object.assign(book, updateBookDto);
    return await this.booksRepository.save(book);
  }

  async remove(id: number): Promise<void> {
    const book = await this.findOne(id);
    await this.booksRepository.remove(book);
  }
}
```

### 4. 实体 (Entities)

实体定义数据库模型：

```typescript
// src/books/entities/book.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Category } from "../../categories/entities/category.entity";
import { Author } from "../../authors/entities/author.entity";
import { Borrow } from "../../borrows/entities/borrow.entity";

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ length: 13, unique: true })
  isbn: string;

  @Column({ type: "int", default: 0 })
  quantity: number;

  @Column({ type: "int", default: 0 })
  available: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.books)
  category: Category;

  @ManyToOne(() => Author, (author) => author.books)
  author: Author;

  @OneToMany(() => Borrow, (borrow) => borrow.book)
  borrows: Borrow[];
}
```

### 5. DTO (Data Transfer Objects)

DTO 定义数据传输结构：

```typescript
// src/books/dto/create-book.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsISBN,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateBookDto {
  @ApiProperty({ description: "图书标题", example: "JavaScript高级程序设计" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: "图书描述", required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: "ISBN号", example: "9787115545381" })
  @IsString()
  @IsISBN()
  isbn: string;

  @ApiProperty({ description: "图书数量", example: 10 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ description: "图书价格", example: 99.0, required: false })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ description: "分类ID", example: 1 })
  @IsNumber()
  categoryId: number;

  @ApiProperty({ description: "作者ID", example: 1 })
  @IsNumber()
  authorId: number;
}
```

## 🔐 认证与授权

### 1. JWT 认证

```typescript
// src/auth/auth.module.ts
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersModule } from "../users/users.module";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "24h" },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

### 2. 角色权限控制

```typescript
// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

## 🗄️ 数据库集成

### 1. TypeORM 配置

```typescript
// src/app.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get("DB_HOST"),
        port: configService.get("DB_PORT"),
        username: configService.get("DB_USERNAME"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_DATABASE"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: configService.get("NODE_ENV") === "development",
        logging: configService.get("NODE_ENV") === "development",
      }),
      inject: [ConfigService],
    }),
    // 其他模块...
  ],
})
export class AppModule {}
```

### 2. 数据库迁移

```bash
# 生成迁移文件
npm run migration:generate -- -n CreateInitialTables

# 运行迁移
npm run migration:run

# 回滚迁移
npm run migration:revert
```

## 📚 API 文档

### 1. Swagger 集成

```typescript
// src/main.ts
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Swagger 文档配置
  const config = new DocumentBuilder()
    .setTitle("图书管理系统 API")
    .setDescription("基于 NestJS 的图书管理系统后端 API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(3000);
}
bootstrap();
```

### 2. API 响应格式

```typescript
// src/common/interceptors/transform.interceptor.ts
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
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        data,
        code: 200,
        message: "success",
        timestamp: new Date().toISOString(),
      }))
    );
  }
}
```

## 🧪 测试

### 1. 单元测试

```typescript
// src/books/books.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BooksService } from "./books.service";
import { Book } from "./entities/book.entity";

describe("BooksService", () => {
  let service: BooksService;
  let repository: Repository<Book>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(Book),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    repository = module.get<Repository<Book>>(getRepositoryToken(Book));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a book", async () => {
      const createBookDto = {
        title: "测试图书",
        isbn: "1234567890123",
        quantity: 10,
        categoryId: 1,
        authorId: 1,
      };

      const book = { id: 1, ...createBookDto };
      mockRepository.create.mockReturnValue(book);
      mockRepository.save.mockResolvedValue(book);

      const result = await service.create(createBookDto);
      expect(result).toEqual(book);
      expect(mockRepository.create).toHaveBeenCalledWith(createBookDto);
      expect(mockRepository.save).toHaveBeenCalledWith(book);
    });
  });
});
```

### 2. E2E 测试

```typescript
// test/books.e2e-spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";

describe("BooksController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/books (GET)", () => {
    return request(app.getHttpServer())
      .get("/books")
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
```

## 🚀 性能优化

### 1. 缓存策略

```typescript
// src/books/books.service.ts
import { Injectable, Inject, CACHE_MANAGER } from "@nestjs/common";
import { Cache } from "cache-manager";

@Injectable()
export class BooksService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache // ... 其他依赖
  ) {}

  async findAll(): Promise<Book[]> {
    // 尝试从缓存获取
    const cached = await this.cacheManager.get<Book[]>("books:all");
    if (cached) {
      return cached;
    }

    // 从数据库获取
    const books = await this.booksRepository.find({
      relations: ["category", "author"],
    });

    // 设置缓存，过期时间 5 分钟
    await this.cacheManager.set("books:all", books, 300000);

    return books;
  }
}
```

### 2. 分页查询

```typescript
// src/common/dto/pagination.dto.ts
import { IsOptional, IsPositive, Min } from "class-validator";
import { Type } from "class-transformer";

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  search?: string;

  @IsOptional()
  sortBy?: string;

  @IsOptional()
  sortOrder?: "ASC" | "DESC" = "DESC";
}
```

## 🔍 调试技巧

### 1. 日志系统

```typescript
// src/common/logger/logger.service.ts
import { Injectable, LoggerService } from "@nestjs/common";
import * as winston from "winston";

@Injectable()
export class CustomLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: "error.log", level: "error" }),
        new winston.transports.File({ filename: "combined.log" }),
      ],
    });

    if (process.env.NODE_ENV !== "production") {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.simple(),
        })
      );
    }
  }

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace: string) {
    this.logger.error(message, { trace });
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  verbose(message: string) {
    this.logger.verbose(message);
  }
}
```

### 2. 健康检查

```typescript
// src/health/health.controller.ts
import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from "@nestjs/terminus";

@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.db.pingCheck("database")]);
  }
}
```

## 📖 下一步学习

现在你已经了解了 NestJS 的基础概念和项目搭建，接下来可以学习：

1. **[模块设计](./modules.md)** - 学习如何设计模块化架构
2. **[数据库操作](./database.md)** - 掌握 TypeORM 的使用
3. **[权限控制](./auth.md)** - 实现完整的认证授权系统
4. **[API 设计](./api-design.md)** - 设计 RESTful API 接口

---

<div align="center">

**让后端开发变得简单高效** ✨

_从模块到服务，从开发到部署_ 🚀

</div>
