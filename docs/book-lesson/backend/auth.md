# 🔐 认证与授权

> **完善的认证授权系统是保护应用程序安全的关键**

## 📚 认证 vs 授权

### 认证 (Authentication)
- 验证用户身份
- 确认用户是谁
- 通常通过用户名/密码、Token等方式

### 授权 (Authorization)
- 控制用户访问权限
- 确认用户能做什么
- 基于角色、权限等控制

## 🏗️ JWT 认证系统

### JWT 结构
```typescript
// JWT Token 组成
Header.Payload.Signature

// Payload 示例
{
  "sub": "user_id_123",
  "email": "user@example.com",
  "role": "admin",
  "permissions": ["read", "write", "delete"],
  "iat": 1516239022,
  "exp": 1516242622
}
```

### JWT 服务
```typescript
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '15m', // 访问令牌15分钟过期
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d', // 刷新令牌7天过期
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15分钟
    };
  }

  async verifyToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException('无效的令牌');
    }
  }
}
```

## 🔒 密码安全

### 密码哈希
```typescript
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  private readonly saltRounds = 12;

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async validatePassword(password: string): Promise<boolean> {
    // 密码强度验证
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  }
}
```

### 用户注册
```typescript
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private passwordService: PasswordService,
    private authService: AuthService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // 检查用户是否已存在
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('用户已存在');
    }

    // 验证密码强度
    if (!(await this.passwordService.validatePassword(password))) {
      throw new BadRequestException('密码强度不够');
    }

    // 哈希密码
    const hashedPassword = await this.passwordService.hashPassword(password);

    // 创建用户
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name,
      role: 'user', // 默认角色
    });

    // 生成令牌
    const tokens = await this.authService.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }
}
```

## 🚪 登录系统

### 用户登录
```typescript
@Injectable()
export class AuthService {
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 查找用户
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 验证密码
    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 检查用户状态
    if (!user.isActive) {
      throw new ForbiddenException('账户已被禁用');
    }

    // 生成令牌
    const tokens = await this.authService.generateTokens(user);

    // 记录登录日志
    await this.logLoginAttempt(user.id, true);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  private async logLoginAttempt(userId: string, success: boolean) {
    // 记录登录尝试
    await this.loginLogService.create({
      userId,
      success,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      timestamp: new Date(),
    });
  }
}
```

## 🛡️ 权限控制

### 角色基础访问控制 (RBAC)
```typescript
// 角色定义
export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

// 权限定义
export enum Permission {
  READ_USERS = 'read_users',
  WRITE_USERS = 'write_users',
  DELETE_USERS = 'delete_users',
  MANAGE_ROLES = 'manage_roles',
  SYSTEM_CONFIG = 'system_config',
}

// 角色权限映射
export const ROLE_PERMISSIONS = {
  [UserRole.USER]: [
    Permission.READ_USERS,
  ],
  [UserRole.MODERATOR]: [
    Permission.READ_USERS,
    Permission.WRITE_USERS,
  ],
  [UserRole.ADMIN]: [
    Permission.READ_USERS,
    Permission.WRITE_USERS,
    Permission.DELETE_USERS,
    Permission.MANAGE_ROLES,
  ],
  [UserRole.SUPER_ADMIN]: [
    Permission.READ_USERS,
    Permission.WRITE_USERS,
    Permission.DELETE_USERS,
    Permission.MANAGE_ROLES,
    Permission.SYSTEM_CONFIG,
  ],
};
```

### 权限装饰器
```typescript
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const ROLES_KEY = 'roles';
export const RequireRoles = (...roles: UserRole[]) =>
  SetMetadata(ROLES_KEY, roles);
```

### 权限守卫
```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    return requiredPermissions.every(permission =>
      user.permissions.includes(permission),
    );
  }
}
```

### 角色守卫
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    return requiredRoles.some(role => user.role === role);
  }
}
```

## 🔄 令牌刷新

### 刷新令牌
```typescript
@Injectable()
export class AuthService {
  async refreshToken(refreshToken: string) {
    try {
      // 验证刷新令牌
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // 查找用户
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      // 检查用户状态
      if (!user.isActive) {
        throw new ForbiddenException('账户已被禁用');
      }

      // 生成新的令牌
      const tokens = await this.generateTokens(user);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('无效的刷新令牌');
    }
  }
}
```

## 🚫 安全措施

### 速率限制
```typescript
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1分钟
      limit: 10,  // 最多10次请求
    }]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

### 登录尝试限制
```typescript
@Injectable()
export class LoginAttemptGuard implements CanActivate {
  constructor(private loginAttemptService: LoginAttemptService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { email, ip } = request.body;

    // 检查IP地址的登录尝试次数
    const ipAttempts = await this.loginAttemptService.getAttemptsByIp(ip);
    if (ipAttempts >= 100) {
      throw new TooManyRequestsException('IP地址被临时封禁');
    }

    // 检查邮箱的登录尝试次数
    const emailAttempts = await this.loginAttemptService.getAttemptsByEmail(email);
    if (emailAttempts >= 5) {
      throw new TooManyRequestsException('账户被临时锁定');
    }

    return true;
  }
}
```

### 会话管理
```typescript
@Injectable()
export class SessionService {
  private readonly sessions = new Map<string, SessionInfo>();

  async createSession(userId: string, token: string): Promise<void> {
    const session: SessionInfo = {
      userId,
      token,
      createdAt: new Date(),
      lastActivity: new Date(),
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    };

    this.sessions.set(token, session);
  }

  async validateSession(token: string): Promise<boolean> {
    const session = this.sessions.get(token);
    if (!session) {
      return false;
    }

    // 检查会话是否过期 (24小时)
    const now = new Date();
    const sessionAge = now.getTime() - session.createdAt.getTime();
    if (sessionAge > 24 * 60 * 60 * 1000) {
      this.sessions.delete(token);
      return false;
    }

    // 更新最后活动时间
    session.lastActivity = now;
    return true;
  }

  async revokeSession(token: string): Promise<void> {
    this.sessions.delete(token);
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    for (const [token, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(token);
      }
    }
  }
}
```

## 📊 审计日志

### 审计服务
```typescript
@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async logAction(action: AuditAction, details: AuditDetails) {
    const auditLog = this.auditLogRepository.create({
      action,
      userId: details.userId,
      resource: details.resource,
      resourceId: details.resourceId,
      details: details.details,
      ip: details.ip,
      userAgent: details.userAgent,
      timestamp: new Date(),
    });

    await this.auditLogRepository.save(auditLog);
  }

  async getAuditLogs(filters: AuditLogFilters) {
    const query = this.auditLogRepository.createQueryBuilder('audit');

    if (filters.userId) {
      query.andWhere('audit.userId = :userId', { userId: filters.userId });
    }

    if (filters.action) {
      query.andWhere('audit.action = :action', { action: filters.action });
    }

    if (filters.startDate) {
      query.andWhere('audit.timestamp >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('audit.timestamp <= :endDate', { endDate: filters.endDate });
    }

    return query
      .orderBy('audit.timestamp', 'DESC')
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getManyAndCount();
  }
}
```

## 🧪 测试

### 认证测试
```typescript
describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let passwordService: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hashPassword: jest.fn(),
            comparePassword: jest.fn(),
            validatePassword: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    passwordService = module.get<PasswordService>(PasswordService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(passwordService, 'validatePassword').mockResolvedValue(true);
      jest.spyOn(passwordService, 'hashPassword').mockResolvedValue('hashedPassword');
      jest.spyOn(usersService, 'create').mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      } as any);

      const result = await service.register(registerDto);

      expect(result.user.email).toBe(registerDto.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });
});
```

## 📝 总结

完善的认证授权系统应该包含：

- 🔐 **多重认证** - 用户名密码、2FA、OAuth等
- 🛡️ **权限控制** - 基于角色和权限的访问控制
- 🔄 **令牌管理** - JWT访问令牌和刷新令牌
- 🚫 **安全防护** - 速率限制、登录尝试限制
- 📊 **审计日志** - 完整的操作记录
- 🧪 **测试覆盖** - 全面的测试用例

通过实现这些安全机制，你可以构建出安全可靠的应用程序！
