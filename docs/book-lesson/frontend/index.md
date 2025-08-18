# 🎨 前端开发 (UmiJS)

> **基于 UmiJS 4.x 的现代化前端开发**  
> 学习如何构建企业级的前端应用，掌握组件化开发和状态管理

## 📚 学习内容

- [**基础概念**](./index.md) - UmiJS 框架介绍与项目搭建
- [**组件开发**](./components.md) - 可复用组件设计与开发
- [**状态管理**](./state-management.md) - 全局状态管理与数据流
- [**路由系统**](./routing.md) - 动态路由与权限控制
- [**UI 组件库**](./ui-components.md) - Ant Design 集成与自定义

## 🚀 UmiJS 框架介绍

### 什么是 UmiJS？

UmiJS 是一个可插拔的企业级 React 应用框架，它提供了：

- **开箱即用** - 内置路由、构建、部署、测试等功能
- **插件化架构** - 按需加载，灵活配置
- **TypeScript 支持** - 完整的类型定义和智能提示
- **最佳实践** - 集成了业界最佳实践和工具链

### 核心特性

- 🎯 **约定式路由** - 基于文件系统的路由配置
- 🔧 **插件系统** - 丰富的插件生态，功能可插拔
- 📱 **多端支持** - 支持 H5、小程序、桌面应用等
- 🚀 **性能优化** - 内置代码分割、懒加载等优化策略
- 🎨 **主题定制** - 支持多主题和动态主题切换

## 🏗️ 项目搭建

### 环境准备

```bash
# 确保 Node.js 版本 >= 18
node --version

# 安装 pnpm (推荐)
npm install -g pnpm

# 验证安装
pnpm --version
```

### 创建项目

```bash
# 使用 UmiJS 官方脚手架
pnpm create umi@latest book-lesson-frontend

# 选择配置
? Pick Umi App Template › - Use arrow-keys. Return to submit.
❯ Simple App
  Ant Design Pro
  Vue Simple App
  Electron
  Express
  Malagu

# 选择包管理器
? Pick Npm Client › - Use arrow-keys. Return to submit.
❯ pnpm
  npm
  yarn

# 进入项目目录
cd book-lesson-frontend
```

### 项目结构

```
book-lesson-frontend/
├── src/
│   ├── components/          # 公共组件
│   ├── pages/              # 页面组件
│   ├── services/           # API 服务
│   ├── models/             # 数据模型
│   ├── utils/              # 工具函数
│   ├── layouts/            # 布局组件
│   └── app.tsx             # 应用入口
├── public/                 # 静态资源
├── .umirc.ts              # UmiJS 配置
├── package.json           # 依赖配置
└── tsconfig.json          # TypeScript 配置
```

### 启动开发服务器

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

## 🎯 核心概念

### 1. 约定式路由

UmiJS 基于文件系统自动生成路由：

```typescript
// src/pages/index.tsx -> /
export default function HomePage() {
  return <div>首页</div>;
}

// src/pages/user/[id].tsx -> /user/:id
export default function UserPage({ params }: { params: { id: string } }) {
  return <div>用户 {params.id}</div>;
}

// src/pages/user/settings.tsx -> /user/settings
export default function UserSettingsPage() {
  return <div>用户设置</div>;
}
```

### 2. 插件系统

UmiJS 通过插件扩展功能：

```typescript
// .umirc.ts
import { defineConfig } from "umi";

export default defineConfig({
  plugins: [
    "@umijs/plugins/dist/antd", // Ant Design 集成
    "@umijs/plugins/dist/request", // 请求库
    "@umijs/plugins/dist/locale", // 国际化
    "@umijs/plugins/dist/access", // 权限控制
  ],
  antd: {
    // Ant Design 配置
  },
  request: {
    // 请求库配置
  },
  locale: {
    // 国际化配置
  },
  access: {
    // 权限配置
  },
});
```

### 3. 数据流管理

使用 `@umijs/max` 进行状态管理：

```typescript
// src/models/user.ts
import { useState } from "umi";

export default function useUserModel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const userData = await loginAPI(credentials);
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    login,
  };
}
```

## 🔧 开发工具

### 1. 代码规范

```bash
# 安装 ESLint 和 Prettier
pnpm add -D eslint prettier @umijs/lint

# 运行代码检查
pnpm lint

# 自动修复
pnpm lint:fix

# 格式化代码
pnpm format
```

### 2. 类型检查

```bash
# 运行 TypeScript 类型检查
pnpm type-check

# 构建时类型检查
pnpm build
```

### 3. 测试

```bash
# 运行单元测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 运行 E2E 测试
pnpm test:e2e
```

## 📱 响应式设计

### 1. 移动端适配

```typescript
// 使用 CSS-in-JS 或 CSS 媒体查询
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return { isMobile };
};
```

### 2. 组件适配

```typescript
// 根据屏幕尺寸渲染不同组件
const ResponsiveLayout = ({ children }: { children: React.ReactNode }) => {
  const { isMobile } = useResponsive();

  return (
    <div className={isMobile ? "mobile-layout" : "desktop-layout"}>
      {isMobile ? <MobileHeader /> : <DesktopHeader />}
      {children}
      {isMobile ? <MobileFooter /> : <DesktopFooter />}
    </div>
  );
};
```

## 🚀 性能优化

### 1. 代码分割

```typescript
// 路由级别的代码分割
import { lazy } from "react";

const UserPage = lazy(() => import("./pages/user"));
const BookPage = lazy(() => import("./pages/book"));

// 组件级别的代码分割
const HeavyComponent = lazy(() => import("./components/HeavyComponent"));
```

### 2. 图片优化

```typescript
// 使用 UmiJS 内置的图片优化
import { Image } from "umi";

// 自动优化和懒加载
<Image
  src="/api/images/book-cover.jpg"
  alt="图书封面"
  width={200}
  height={300}
  lazy
/>;
```

### 3. 缓存策略

```typescript
// 配置缓存策略
export default defineConfig({
  hash: true, // 文件名哈希
  chunks: ["vendors", "umi"], // 代码分块
  chainWebpack: (config) => {
    // 自定义 webpack 配置
    config.optimization.splitChunks({
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    });
  },
});
```

## 🔍 调试技巧

### 1. 开发工具

```bash
# 启动开发服务器并打开浏览器
pnpm dev --open

# 启动调试模式
pnpm dev --inspect

# 查看构建分析
pnpm build --analyze
```

### 2. 日志调试

```typescript
// 使用 UmiJS 内置的日志系统
import { logger } from "umi";

logger.info("用户登录成功", { userId: 123 });
logger.warn("用户权限不足", { requiredRole: "admin" });
logger.error("API 请求失败", { error: "Network Error" });
```

### 3. 性能监控

```typescript
// 使用 React DevTools Profiler
import { Profiler } from "react";

const onRenderCallback = (
  id: string,
  phase: string,
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => {
  console.log(`组件 ${id} 渲染耗时: ${actualDuration}ms`);
};

<Profiler id="BookList" onRender={onRenderCallback}>
  <BookList />
</Profiler>;
```

## 📖 下一步学习

现在你已经了解了 UmiJS 的基础概念和项目搭建，接下来可以学习：

1. **[组件开发](./components.md)** - 学习如何设计和开发可复用组件
2. **[状态管理](./state-management.md)** - 掌握全局状态管理策略
3. **[路由系统](./routing.md)** - 深入理解动态路由和权限控制
4. **[UI 组件库](./ui-components.md)** - 集成 Ant Design 并自定义组件

---

<div align="center">

**让前端开发变得简单高效** ✨

_从组件到页面，从开发到部署_ 🚀

</div>
