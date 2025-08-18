# 🚀 API 设计指南

> **设计优秀的 API 是构建高质量后端服务的基础**

## 📚 API 设计原则

### 1. **RESTful 设计**
- 使用标准的 HTTP 方法 (GET, POST, PUT, DELETE)
- 资源导向的 URL 设计
- 统一的响应格式
- 适当的状态码使用

### 2. **版本控制**
- 在 URL 中包含版本号：`/api/v1/users`
- 使用 Accept 头进行版本控制
- 向后兼容性考虑

### 3. **安全性**
- 身份验证和授权
- 输入验证和清理
- 速率限制
- HTTPS 加密

## 🏗️ URL 设计规范

### 资源命名
```
✅ 好的设计
GET    /api/v1/users          # 获取用户列表
GET    /api/v1/users/123      # 获取特定用户
POST   /api/v1/users          # 创建新用户
PUT    /api/v1/users/123      # 更新用户
DELETE /api/v1/users/123      # 删除用户

❌ 不好的设计
GET    /api/v1/getUsers
POST   /api/v1/createUser
GET    /api/v1/user?id=123
```

### 查询参数
```
GET /api/v1/users?page=1&limit=10&sort=name&order=asc
GET /api/v1/users?status=active&role=admin
GET /api/v1/users?search=john&category=developer
```

## 📊 响应格式规范

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 分页响应
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "User 1"
    },
    {
      "id": 2,
      "name": "User 2"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "Bad Request",
  "errors": [
    {
      "field": "email",
      "message": "邮箱格式不正确"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔐 身份验证

### JWT Token
```typescript
// 请求头
Authorization: Bearer <token>

// Token 结构
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "admin",
  "iat": 1516239022,
  "exp": 1516242622
}
```

### 刷新 Token
```typescript
POST /api/v1/auth/refresh
{
  "refreshToken": "refresh_token_here"
}
```

## 📝 数据验证

### DTO 验证
```typescript
import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
```

### 自定义验证器
```typescript
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          return passwordRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return '密码必须包含大小写字母、数字和特殊字符，长度至少8位';
        },
      },
    });
  };
}
```

## 🚀 性能优化

### 1. **分页和限制**
```typescript
GET /api/v1/users?page=1&limit=20
```

### 2. **字段选择**
```typescript
GET /api/v1/users?fields=id,name,email
```

### 3. **缓存策略**
```typescript
// 响应头
Cache-Control: public, max-age=3600
ETag: "33a64df551"
```

### 4. **压缩**
```typescript
// 响应头
Content-Encoding: gzip
```

## 🔒 安全措施

### 1. **速率限制**
```typescript
// 响应头
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

### 2. **CORS 配置**
```typescript
app.enableCors({
  origin: ['https://yourdomain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
```

### 3. **Helmet 安全头**
```typescript
import helmet from 'helmet';

app.use(helmet());
```

## 📚 文档规范

### Swagger/OpenAPI
```typescript
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('图书管理系统 API')
  .setDescription('图书管理系统的后端 API 文档')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```

### API 端点文档
```typescript
@ApiTags('用户管理')
@Controller('users')
export class UsersController {
  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({ status: 200, description: '成功获取用户列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @Get()
  getUsers(@Query() query: GetUsersDto) {
    return this.usersService.findAll(query);
  }
}
```

## 🧪 测试策略

### 单元测试
```typescript
describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### 集成测试
```typescript
describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200);
  });
});
```

## 📊 监控和日志

### 日志记录
```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async createUser(createUserDto: CreateUserDto) {
    this.logger.log(`创建用户: ${createUserDto.email}`);
    
    try {
      const user = await this.usersRepository.save(createUserDto);
      this.logger.log(`用户创建成功: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`用户创建失败: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

### 性能监控
```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        console.log(`${method} ${url} - ${duration}ms`);
      }),
    );
  }
}
```

## 📝 总结

优秀的 API 设计应该具备：

- 🎯 **一致性** - 统一的命名规范和响应格式
- 🔒 **安全性** - 完善的认证、授权和验证机制
- 🚀 **性能** - 合理的缓存、分页和压缩策略
- 📚 **文档** - 清晰的 API 文档和示例
- 🧪 **测试** - 全面的测试覆盖
- 📊 **监控** - 完善的日志和性能监控

通过遵循这些设计原则，你可以构建出高质量、易用、安全的 API 服务！
