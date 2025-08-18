# 🔧 管道 (Pipes)

> **管道是 NestJS 中用于数据转换和验证的强大工具，确保输入数据的正确性和一致性**

## 📚 什么是管道？

管道是一个使用 `@Injectable()` 装饰器的类，它实现了 `PipeTransform` 接口。管道主要用于：

- 🔍 **数据验证** - 验证输入数据的格式和有效性
- 🔄 **数据转换** - 将输入数据转换为所需的格式
- 🚫 **数据过滤** - 过滤掉无效或不需要的数据
- 🎯 **类型转换** - 将字符串转换为数字、布尔值等

## 🏗️ 管道的基本结构

```typescript
import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // 在这里实现你的验证和转换逻辑
    return value;
  }
}
```

## 🎯 管道的主要用途

### 1. **数据验证**
```typescript
@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // 验证用户ID是否为有效数字
    if (metadata.type === 'param' && metadata.data === 'id') {
      const id = parseInt(value);
      if (isNaN(id) || id <= 0) {
        throw new BadRequestException('无效的用户ID');
      }
      return id;
    }
    return value;
  }
}
```

### 2. **数据转换**
```typescript
@Injectable()
export class ParseIntPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // 将字符串转换为整数
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('无法转换为数字');
    }
    return val;
  }
}
```

### 3. **数据过滤**
```typescript
@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      // 过滤掉HTML标签和特殊字符
      return value
        .replace(/<[^>]*>/g, '')
        .replace(/[^\w\s]/g, '')
        .trim();
    }
    return value;
  }
}
```

## 🔧 如何使用管道

### 1. **全局管道**
```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 注册全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // 过滤掉未定义的属性
    forbidNonWhitelisted: true, // 禁止未定义的属性
    transform: true,        // 自动转换类型
  }));
  
  await app.listen(3000);
}
bootstrap();
```

### 2. **模块级别管道**
```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
```

### 3. **控制器级别管道**
```typescript
@Controller('users')
@UsePipes(ValidationPipe, SanitizePipe)
export class UsersController {
  // 所有方法都会经过这两个管道
}
```

### 4. **方法级别管道**
```typescript
@Controller('users')
export class UsersController {
  @Get(':id')
  @UsePipes(ParseIntPipe) // 只有这个方法会经过数字转换管道
  getUser(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }
}
```

### 5. **参数级别管道**
```typescript
@Controller('users')
export class UsersController {
  @Get(':id')
  getUser(@Param('id', ParseIntPipe) id: number) {
    // id 参数会自动转换为数字
    return this.usersService.findOne(id);
  }
  
  @Post()
  createUser(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    // 请求体会经过验证管道
    return this.usersService.create(createUserDto);
  }
}
```

## 🎨 内置管道

### 1. **ValidationPipe**
```typescript
// 使用 class-validator 进行验证
import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;
  
  @IsEmail()
  email: string;
}

// 在控制器中使用
@Post()
createUser(@Body(ValidationPipe) createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
```

### 2. **ParseIntPipe**
```typescript
@Get(':id')
getUser(@Param('id', ParseIntPipe) id: number) {
  // 自动将字符串ID转换为数字
  return this.usersService.findOne(id);
}
```

### 3. **ParseBoolPipe**
```typescript
@Get()
getUsers(@Query('active', ParseBoolPipe) active: boolean) {
  // 自动将字符串转换为布尔值
  return this.usersService.findByStatus(active);
}
```

### 4. **ParseArrayPipe**
```typescript
@Get()
getUsers(@Query('ids', ParseArrayPipe) ids: number[]) {
  // 自动将逗号分隔的字符串转换为数组
  return this.usersService.findByIds(ids);
}
```

### 5. **ParseUUIDPipe**
```typescript
@Get(':id')
getUser(@Param('id', ParseUUIDPipe) id: string) {
  // 验证UUID格式
  return this.usersService.findOne(id);
}
```

## 🚀 自定义管道

### 1. **基础验证管道**
```typescript
import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // 验证用户年龄
    if (metadata.data === 'age') {
      const age = parseInt(value);
      if (isNaN(age) || age < 0 || age > 150) {
        throw new BadRequestException('年龄必须在0-150之间');
      }
      return age;
    }
    
    // 验证邮箱格式
    if (metadata.data === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new BadRequestException('邮箱格式不正确');
      }
      return value.toLowerCase();
    }
    
    return value;
  }
}
```

### 2. **文件上传管道**
```typescript
import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('文件不能为空');
    }
    
    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('文件大小不能超过5MB');
    }
    
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('只支持JPEG、PNG、GIF格式的图片');
    }
    
    return file;
  }
}
```

### 3. **查询参数管道**
```typescript
import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class QueryValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const { data } = metadata;
    
    switch (data) {
      case 'page':
        const page = parseInt(value) || 1;
        if (page < 1) {
          throw new BadRequestException('页码必须大于0');
        }
        return page;
        
      case 'limit':
        const limit = parseInt(value) || 10;
        if (limit < 1 || limit > 100) {
          throw new BadRequestException('每页数量必须在1-100之间');
        }
        return limit;
        
      case 'sort':
        const allowedSorts = ['name', 'email', 'createdAt'];
        if (value && !allowedSorts.includes(value)) {
          throw new BadRequestException('无效的排序字段');
        }
        return value || 'createdAt';
        
      default:
        return value;
    }
  }
}
```

## 🔧 高级管道模式

### 1. **异步管道**
```typescript
import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AsyncValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): Observable<any> {
    return from(this.validateAsync(value, metadata)).pipe(
      map(validatedValue => {
        if (!validatedValue.isValid) {
          throw new BadRequestException(validatedValue.errors);
        }
        return validatedValue.data;
      }),
    );
  }
  
  private async validateAsync(value: any, metadata: ArgumentMetadata) {
    // 异步验证逻辑，比如调用外部API验证
    const response = await fetch('https://api.example.com/validate', {
      method: 'POST',
      body: JSON.stringify({ value, type: metadata.data }),
    });
    
    return response.json();
  }
}
```

### 2. **条件管道**
```typescript
import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ConditionalPipe implements PipeTransform {
  constructor(
    private readonly condition: (value: any) => boolean,
    private readonly pipe: PipeTransform,
  ) {}
  
  transform(value: any, metadata: ArgumentMetadata) {
    if (this.condition(value)) {
      return this.pipe.transform(value, metadata);
    }
    return value;
  }
}

// 使用示例
@Get()
getUsers(@Query('status', new ConditionalPipe(
  (value) => value !== undefined,
  new ParseEnumPipe(['active', 'inactive'])
)) status?: string) {
  return this.usersService.findByStatus(status);
}
```

### 3. **管道组合**
```typescript
import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class CompositePipe implements PipeTransform {
  constructor(private readonly pipes: PipeTransform[]) {}
  
  transform(value: any, metadata: ArgumentMetadata) {
    return this.pipes.reduce(
      (currentValue, pipe) => pipe.transform(currentValue, metadata),
      value
    );
  }
}

// 使用示例
@Post()
createUser(@Body(new CompositePipe([
  new ValidationPipe(),
  new SanitizePipe(),
  new TransformPipe(),
])) createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
```

## 🚀 实战示例

### 完整的用户验证管道
```typescript
import { Injectable, PipeTransform, BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UserValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;
    
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    
    // 将普通对象转换为类实例
    const object = plainToClass(metatype, value);
    
    // 验证对象
    const errors = await validate(object);
    
    if (errors.length > 0) {
      const messages = errors.map(error => 
        Object.values(error.constraints).join(', ')
      );
      throw new BadRequestException(messages);
    }
    
    return object;
  }
  
  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

### 查询参数转换管道
```typescript
import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

export interface PaginationQuery {
  page: number;
  limit: number;
  sort: string;
  order: 'ASC' | 'DESC';
  search?: string;
}

@Injectable()
export class PaginationPipe implements PipeTransform {
  transform(value: any): PaginationQuery {
    const page = Math.max(1, parseInt(value.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(value.limit) || 10));
    const sort = value.sort || 'createdAt';
    const order = value.order === 'DESC' ? 'DESC' : 'ASC';
    const search = value.search?.trim();
    
    // 验证排序字段
    const allowedSorts = ['id', 'name', 'email', 'createdAt', 'updatedAt'];
    if (!allowedSorts.includes(sort)) {
      throw new BadRequestException(`无效的排序字段: ${sort}`);
    }
    
    return { page, limit, sort, order, search };
  }
}
```

### 文件上传验证管道
```typescript
import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private options: FileValidationOptions = {}) {
    this.options = {
      maxSize: 5 * 1024 * 1024, // 默认5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif'],
      ...options,
    };
  }
  
  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('文件不能为空');
    }
    
    // 验证文件大小
    if (file.size > this.options.maxSize) {
      throw new BadRequestException(
        `文件大小不能超过${this.options.maxSize / 1024 / 1024}MB`
      );
    }
    
    // 验证文件类型
    if (!this.options.allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `不支持的文件类型: ${file.mimetype}`
      );
    }
    
    // 验证文件扩展名
    const extension = file.originalname.substring(
      file.originalname.lastIndexOf('.')
    ).toLowerCase();
    
    if (!this.options.allowedExtensions.includes(extension)) {
      throw new BadRequestException(
        `不支持的文件扩展名: ${extension}`
      );
    }
    
    return file;
  }
}
```

## 📝 总结

管道是 NestJS 中非常重要的功能，它们提供了：

- 🔍 **数据验证** - 确保输入数据的正确性和安全性
- 🔄 **数据转换** - 自动转换数据类型和格式
- 🧹 **数据清理** - 过滤和清理无效数据
- 🎯 **类型安全** - 提供类型检查和转换
- 🚀 **性能优化** - 在数据到达处理程序之前进行验证

通过合理使用管道，你可以构建出安全、可靠、类型安全的 NestJS 应用程序！

---

**下一步学习：** [异常过滤器 (Exception Filters)](../exception-filters/)
