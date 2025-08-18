# 🗄️ 数据库设计

> **优秀的数据库设计是应用程序性能和可维护性的基础**

## 📚 数据库选择

### 关系型数据库 (PostgreSQL)
- **优势**: ACID事务、复杂查询、数据完整性
- **适用场景**: 用户管理、订单系统、财务数据
- **特点**: 支持JSON、全文搜索、地理信息

### NoSQL数据库 (MongoDB)
- **优势**: 灵活模式、水平扩展、高性能
- **适用场景**: 日志系统、内容管理、实时数据
- **特点**: 文档存储、聚合管道、地理空间

## 🏗️ 数据库设计原则

### 1. **规范化设计**
- 第一范式 (1NF): 原子性，不可再分
- 第二范式 (2NF): 消除部分依赖
- 第三范式 (3NF): 消除传递依赖

### 2. **反规范化策略**
- 适当冗余提高查询性能
- 预计算常用字段
- 分表分库策略

### 3. **索引优化**
- 主键索引
- 唯一索引
- 复合索引
- 部分索引

## 📊 实体关系设计

### 用户系统
```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户配置表
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  avatar_url VARCHAR(500),
  bio TEXT,
  location VARCHAR(100),
  website VARCHAR(255),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户会话表
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 图书管理系统
```sql
-- 图书表
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isbn VARCHAR(20) UNIQUE,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_url VARCHAR(500),
  category_id UUID REFERENCES book_categories(id),
  publisher VARCHAR(255),
  publish_date DATE,
  page_count INTEGER,
  language VARCHAR(10) DEFAULT 'zh-CN',
  price DECIMAL(10,2),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 图书分类表
CREATE TABLE book_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES book_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 借阅记录表
CREATE TABLE borrowings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  book_id UUID NOT NULL REFERENCES books(id),
  borrow_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  return_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'borrowed',
  fine_amount DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔍 索引设计

### 主键索引
```sql
-- 自动创建主键索引
ALTER TABLE users ADD PRIMARY KEY (id);
```

### 唯一索引
```sql
-- 邮箱唯一索引
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- 复合唯一索引
CREATE UNIQUE INDEX idx_borrowings_user_book_active 
ON borrowings(user_id, book_id) 
WHERE status = 'borrowed';
```

### 复合索引
```sql
-- 多字段查询索引
CREATE INDEX idx_books_category_status ON books(category_id, status);

-- 排序查询索引
CREATE INDEX idx_books_publish_date ON books(publish_date DESC);

-- 全文搜索索引
CREATE INDEX idx_books_title_author ON books USING gin(to_tsvector('chinese', title || ' ' || author));
```

### 部分索引
```sql
-- 只对活跃用户建立索引
CREATE INDEX idx_users_active ON users(id) WHERE is_active = true;

-- 只对未归还的借阅建立索引
CREATE INDEX idx_borrowings_active ON borrowings(user_id, book_id) WHERE status = 'borrowed';
```

## 🚀 查询优化

### 1. **EXPLAIN 分析**
```sql
-- 分析查询执行计划
EXPLAIN (ANALYZE, BUFFERS) 
SELECT b.title, b.author, c.name as category
FROM books b
JOIN book_categories c ON b.category_id = c.id
WHERE b.status = 'available'
  AND c.is_active = true
ORDER BY b.publish_date DESC
LIMIT 20;
```

### 2. **查询重写**
```sql
-- 优化前：子查询
SELECT * FROM books 
WHERE category_id IN (
  SELECT id FROM book_categories WHERE is_active = true
);

-- 优化后：JOIN查询
SELECT b.* FROM books b
JOIN book_categories c ON b.category_id = c.id
WHERE c.is_active = true;
```

### 3. **分页优化**
```sql
-- 使用游标分页
SELECT * FROM books 
WHERE id > $1  -- 上一页的最后一个ID
ORDER BY id
LIMIT 20;

-- 使用时间分页
SELECT * FROM books 
WHERE created_at < $1  -- 上一页的最后一个时间
ORDER BY created_at DESC
LIMIT 20;
```

## 📈 性能优化

### 1. **连接池配置**
```typescript
// TypeORM 连接池配置
{
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'bookstore',
  synchronize: false,
  logging: false,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  subscribers: [__dirname + '/subscribers/*{.ts,.js}'],
  poolSize: 20,
  acquireTimeout: 60000,
  timeout: 60000,
  extra: {
    max: 20,
    min: 5,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  },
}
```

### 2. **查询缓存**
```typescript
// Redis 缓存配置
@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getBooksByCategory(categoryId: string): Promise<Book[]> {
    const cacheKey = `books:category:${categoryId}`;
    
    // 尝试从缓存获取
    let books = await this.cacheManager.get<Book[]>(cacheKey);
    
    if (!books) {
      // 从数据库查询
      books = await this.bookRepository.find({
        where: { categoryId, status: 'available' },
        order: { publishDate: 'DESC' },
      });
      
      // 缓存结果 (5分钟)
      await this.cacheManager.set(cacheKey, books, 300);
    }
    
    return books;
  }
}
```

### 3. **批量操作**
```typescript
// 批量插入
async createManyBooks(books: CreateBookDto[]): Promise<Book[]> {
  const bookEntities = books.map(book => this.bookRepository.create(book));
  return this.bookRepository.save(bookEntities);
}

// 批量更新
async updateBookStatus(bookIds: string[], status: string): Promise<void> {
  await this.bookRepository
    .createQueryBuilder()
    .update(Book)
    .set({ status, updatedAt: new Date() })
    .whereInIds(bookIds)
    .execute();
}
```

## 🔄 数据迁移

### 1. **迁移文件**
```typescript
// 创建迁移
export class CreateUsersTable1234567890123 implements MigrationInterface {
  name = 'CreateUsersTable1234567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    await queryRunner.query(`
      CREATE INDEX idx_users_email ON users(email)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE users`);
  }
}
```

### 2. **种子数据**
```typescript
// 数据种子
export class SeedUsers1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO users (email, password_hash, name) VALUES
      ('admin@example.com', '$2b$12$...', '管理员'),
      ('user@example.com', '$2b$12$...', '普通用户')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM users WHERE email IN ('admin@example.com', 'user@example.com')`);
  }
}
```

## 🧪 测试策略

### 1. **单元测试**
```typescript
describe('BookService', () => {
  let service: BookService;
  let repository: Repository<Book>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: getRepositoryToken(Book),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<BookService>(BookService);
    repository = module.get<Repository<Book>>(getRepositoryToken(Book));
  });

  it('should find books by category', async () => {
    const mockBooks = [
      { id: '1', title: 'Book 1', categoryId: 'cat1' },
      { id: '2', title: 'Book 2', categoryId: 'cat1' },
    ];

    jest.spyOn(repository, 'find').mockResolvedValue(mockBooks as Book[]);

    const result = await service.findByCategory('cat1');
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Book 1');
  });
});
```

### 2. **集成测试**
```typescript
describe('BookController (e2e)', () => {
  let app: INestApplication;
  let bookRepository: Repository<Book>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    bookRepository = moduleFixture.get<Repository<Book>>(getRepositoryToken(Book));
  });

  it('/books (GET)', async () => {
    // 创建测试数据
    const book = bookRepository.create({
      title: 'Test Book',
      author: 'Test Author',
      isbn: '1234567890',
    });
    await bookRepository.save(book);

    // 测试API
    const response = await request(app.getHttpServer())
      .get('/books')
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toBe('Test Book');
  });
});
```

## 📊 监控和维护

### 1. **慢查询监控**
```sql
-- 启用慢查询日志
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- 1秒
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();

-- 查看慢查询
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC;
```

### 2. **性能统计**
```sql
-- 表大小统计
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 索引使用统计
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### 3. **定期维护**
```sql
-- 更新统计信息
ANALYZE;

-- 清理死锁
VACUUM ANALYZE;

-- 重建索引
REINDEX INDEX CONCURRENTLY idx_books_title_author;
```

## 📝 总结

优秀的数据库设计应该具备：

- 🏗️ **规范化设计** - 遵循数据库设计范式
- 🔍 **索引优化** - 合理的索引策略
- 🚀 **查询优化** - 高效的SQL查询
- 📈 **性能优化** - 连接池、缓存、批量操作
- 🔄 **数据迁移** - 版本控制和数据种子
- 🧪 **测试覆盖** - 单元测试和集成测试
- 📊 **监控维护** - 性能监控和定期维护

通过遵循这些设计原则，你可以构建出高性能、可维护的数据库系统！
