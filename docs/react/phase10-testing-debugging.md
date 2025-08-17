# 第十阶段：测试和调试 🧪🔍

> 掌握现代前端测试策略和调试技巧，构建高质量、可维护的 React 应用！

## 📚 学习目标

通过本阶段学习，你将掌握：

- 现代测试框架的设计哲学和最佳实践
- 组件测试的策略和用户行为导向测试
- 性能分析和调试工具的高级用法
- 错误处理和性能监控的实现方法
- 测试驱动开发 (TDD) 和持续集成 (CI) 策略

## 🧪 测试体系架构概览

### 1. 测试金字塔

```
    /\
   /  \     E2E Tests (端到端测试)
  /____\    少量，覆盖关键用户流程
 /      \
/________\   Integration Tests (集成测试)
          中等数量，测试组件协作
         /          \
        /            \   Unit Tests (单元测试)
       /              \  大量，测试独立功能
      /                \
     /                  \
    /                    \
   /                      \
  /                        \
 /                          \
/____________________________\
```

### 2. 测试工具生态

| 测试类型   | 工具                  | 特点               | 适用场景              |
| ---------- | --------------------- | ------------------ | --------------------- |
| 单元测试   | Jest                  | 功能全面，生态丰富 | 函数、工具、Hook 测试 |
| 组件测试   | React Testing Library | 用户行为导向       | 组件交互和渲染测试    |
| 端到端测试 | Cypress/Playwright    | 真实浏览器环境     | 完整用户流程测试      |
| 性能测试   | Lighthouse            | 性能指标分析       | 性能优化和监控        |

## 🚀 第一阶段：Jest + React Testing Library (1-2 周)

### 学习内容

- [ ] 单元测试原理和设计原则
- [ ] 组件测试策略和最佳实践
- [ ] Mock 和 Stub 使用技巧
- [ ] 测试覆盖率分析和优化
- [ ] 快照测试和回归测试
- [ ] 异步测试和定时器处理
- [ ] 测试环境配置和调试技巧
- [ ] 性能测试和基准测试

### 核心概念

- **Test Runner**: 测试运行器和执行环境
- **Assertions**: 断言机制和匹配器
- **Mocking**: 模拟对象和依赖注入
- **Coverage**: 测试覆盖率和质量指标
- **Snapshot**: 快照测试和回归检测
- **Async Testing**: 异步测试和 Promise 处理
- **Test Environment**: 测试环境和配置管理
- **Performance Testing**: 性能测试和基准分析

### 重点源码文件

- `packages/jest-core/src/TestRunner.ts` - 测试运行器核心
- `packages/jest-runtime/src/index.ts` - 运行时环境管理
- `packages/jest-snapshot/src/index.ts` - 快照系统实现
- `packages/jest-mock/src/index.ts` - Mock 系统核心
- `packages/jest-coverage/src/index.ts` - 覆盖率计算
- `packages/jest-environment-jsdom/src/index.ts` - DOM 测试环境

### 学习重点

- 理解单元测试的设计原则和最佳实践
- 掌握组件测试的策略和测试用例设计
- 学习 Mock 和 Stub 的使用技巧和场景
- 分析测试覆盖率的计算方法和优化策略
- 深入快照测试的原理和回归测试机制
- 掌握异步测试和定时器处理的方法
- 学习测试环境配置和调试技巧
- 了解性能测试和基准测试的实现

### 实践项目

- 为 React 组件编写完整的测试用例
- 实现自定义 Jest 匹配器
- 创建测试工具和辅助函数
- 优化测试性能和覆盖率

## 🎯 第二阶段：React Testing Library (1 周)

### 学习内容

- [ ] 测试库的设计哲学和原则
- [ ] 查询方法和选择器策略
- [ ] 用户交互测试和事件模拟
- [ ] 可访问性测试和 ARIA 支持
- [ ] 测试工具和自定义 Hook 测试
- [ ] 集成测试和端到端测试
- [ ] 测试最佳实践和常见陷阱

### 核心概念

- **Testing Philosophy**: 测试哲学和用户行为导向
- **Query Methods**: 查询方法和选择器策略
- **User Interactions**: 用户交互和事件模拟
- **Accessibility**: 可访问性测试和 ARIA 支持
- **Custom Hooks**: 自定义 Hook 测试策略
- **Integration Testing**: 集成测试和组件协作
- **E2E Testing**: 端到端测试和用户流程

### 重点源码文件

- `src/queries/index.ts` - 查询方法实现
- `src/events/index.ts` - 事件模拟系统
- `src/helpers/index.ts` - 测试辅助函数
- `src/hooks/index.ts` - Hook 测试工具
- `src/accessibility/index.ts` - 可访问性测试

### 学习重点

- 理解测试库的设计哲学和用户行为导向
- 掌握各种查询方法和选择器策略
- 学习用户交互测试和事件模拟的实现
- 深入可访问性测试和 ARIA 支持
- 掌握自定义 Hook 和工具函数的测试
- 学习集成测试和端到端测试的策略
- 了解测试最佳实践和常见陷阱的避免

### 实践项目

- 为复杂组件编写集成测试
- 实现自定义测试工具和辅助函数
- 创建可访问性测试套件
- 优化测试性能和可维护性

## 🔍 第三阶段：React DevTools (1 周)

### 学习内容

- [ ] 开发者工具架构和实现原理
- [ ] 组件树调试和状态查看
- [ ] 性能分析和 Profiler 使用
- [ ] 组件性能优化和瓶颈识别
- [ ] 调试技巧和高级功能
- [ ] 自定义面板和扩展开发
- [ ] 生产环境调试和错误追踪

### 核心概念

- **Component Tree**: 组件树结构和层次关系
- **Props & State**: 组件属性和状态管理
- **Profiler**: 性能分析器和性能指标
- **Performance**: 性能监控和优化建议
- **Debug Tools**: 调试工具和错误追踪
- **Custom Panels**: 自定义面板和扩展功能
- **Production Debugging**: 生产环境调试策略

### 学习重点

- 理解开发者工具的架构设计和实现原理
- 掌握组件树调试和状态查看的方法
- 学习性能分析和 Profiler 的使用技巧
- 深入组件性能优化和瓶颈识别
- 掌握调试技巧和高级功能的使用
- 学习自定义面板和扩展开发的方法
- 了解生产环境调试和错误追踪的策略

### 实践项目

- 开发自定义 DevTools 面板
- 创建性能分析工具和插件
- 实现调试辅助功能和工具
- 优化开发体验和工作流程

## 🛠️ 第四阶段：调试工具和技巧 (1 周)

### 学习内容

- [ ] Chrome DevTools 高级用法
- [ ] React 错误边界和错误处理
- [ ] 性能监控和分析工具
- [ ] 内存泄漏检测和优化
- [ ] 网络请求调试和优化
- [ ] 移动端调试和响应式测试
- [ ] 调试最佳实践和工具链

### 核心概念

- **Error Boundaries**: 错误边界和错误处理机制
- **Performance Monitoring**: 性能监控和指标收集
- **Memory Leaks**: 内存泄漏检测和优化策略
- **Network Debugging**: 网络请求调试和性能优化
- **Mobile Debugging**: 移动端调试和响应式测试
- **Debug Workflow**: 调试工作流和工具链集成

### 学习重点

- 掌握 Chrome DevTools 的高级用法和技巧
- 理解 React 错误边界和错误处理机制
- 学习性能监控和分析工具的使用
- 深入内存泄漏检测和优化策略
- 掌握网络请求调试和性能优化方法
- 学习移动端调试和响应式测试技巧
- 了解调试最佳实践和工具链集成

### 实践项目

- 创建自定义调试工具和插件
- 实现性能监控和分析系统
- 开发错误处理和日志系统
- 优化调试工作流和开发体验

## 🔍 核心技术深度解析

### 1. Jest 测试运行器原理

```javascript
// Jest 测试运行器核心流程
class TestRunner {
  async runTests(tests: Array<Test>, watcher: Watcher) {
    // 1. 测试环境准备
    await this.setupTestEnvironment();

    // 2. 测试用例执行
    for (const test of tests) {
      try {
        // 执行测试用例
        const result = await this.runTest(test);

        // 收集测试结果
        this.collectResults(result);

        // 处理测试副作用
        await this.cleanupAfterTest(test);
      } catch (error) {
        // 错误处理和报告
        this.handleTestError(test, error);
      }
    }

    // 3. 生成测试报告
    return this.generateReport();
  }
}
```

**核心机制**：

- 测试环境隔离和重置
- 异步测试处理
- 错误捕获和报告
- 测试结果收集和统计

### 2. React Testing Library 查询策略

```javascript
// 查询方法优先级策略
const queryMethods = [
  // 1. 可访问性优先的查询
  "getByRole",
  "getByLabelText",
  "getByPlaceholderText",
  "getByText",
  "getByDisplayValue",

  // 2. 语义化查询
  "getByAltText",
  "getByTitle",
  "getByTestId", // 最后选择

  // 3. 复合查询
  "getByTestId",
  "getAllByTestId",
];

// 查询方法实现
export function getByRole(container, role, options = {}) {
  const elements = queryAllByRole(container, role, options);

  if (elements.length === 0) {
    throw new Error(`No elements with role "${role}" found`);
  }

  if (elements.length > 1) {
    throw new Error(`Multiple elements with role "${role}" found`);
  }

  return elements[0];
}
```

**设计原则**：

- 用户行为导向
- 可访问性优先
- 语义化查询
- 错误信息友好

### 3. 性能分析器实现原理

```javascript
// React Profiler 核心实现
class Profiler {
  constructor(id, onRender) {
    this.id = id;
    this.onRender = onRender;
    this.startTime = null;
    this.endTime = null;
  }

  // 开始测量
  start() {
    this.startTime = performance.now();
  }

  // 结束测量
  stop() {
    this.endTime = performance.now();

    // 计算性能指标
    const duration = this.endTime - this.startTime;

    // 触发回调
    this.onRender(this.id, "mount", duration);
  }

  // 更新测量
  update() {
    const updateTime = performance.now();
    const duration = updateTime - this.startTime;

    this.onRender(this.id, "update", duration);
  }
}
```

**性能指标**：

- 渲染时间 (Render Time)
- 提交时间 (Commit Time)
- 交互时间 (Interaction Time)
- 内存使用 (Memory Usage)

## 🧪 测试策略和最佳实践

### 1. 测试用例设计原则

#### AAA 模式 (Arrange-Act-Assert)

```javascript
describe("UserProfile Component", () => {
  test("should display user information correctly", () => {
    // Arrange: 准备测试数据和环境
    const mockUser = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      avatar: "avatar.jpg",
    };

    const mockProps = {
      user: mockUser,
      onEdit: jest.fn(),
      onDelete: jest.fn(),
    };

    // Act: 执行被测试的操作
    render(<UserProfile {...mockProps} />);

    // Assert: 验证结果
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByAltText("User avatar")).toHaveAttribute(
      "src",
      "avatar.jpg"
    );
  });
});
```

#### 测试用例命名规范

```javascript
// 好的命名示例
test("should call onEdit when edit button is clicked");
test("should display loading state while fetching data");
test("should show error message when API call fails");
test("should update form when user types in input field");

// 避免的命名示例
test("test edit button"); // 太模糊
test("works"); // 没有描述性
test("should work correctly"); // 没有具体说明
```

### 2. Mock 和 Stub 使用策略

#### 依赖注入和 Mock

```javascript
// 组件依赖外部服务
function UserList({ userService }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    userService.getUsers().then(setUsers);
  }, [userService]);

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// 测试中使用 Mock
test("should render user list", async () => {
  const mockUserService = {
    getUsers: jest.fn().mockResolvedValue([
      { id: 1, name: "John" },
      { id: 2, name: "Jane" },
    ]),
  };

  render(<UserList userService={mockUserService} />);

  await waitFor(() => {
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Jane")).toBeInTheDocument();
  });

  expect(mockUserService.getUsers).toHaveBeenCalledTimes(1);
});
```

#### 网络请求 Mock

```javascript
// 使用 MSW (Mock Service Worker) 模拟 API
import { rest } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  rest.get("/api/users", (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Smith" },
      ])
    );
  }),

  rest.post("/api/users", (req, res, ctx) => {
    const { name, email } = req.body;
    return res(ctx.json({ id: 3, name, email }), ctx.status(201));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 3. 异步测试处理

#### Promise 和 Async/Await

```javascript
test("should handle async operations correctly", async () => {
  const mockApi = {
    fetchData: jest.fn().mockResolvedValue({ data: "test" }),
  };

  render(<AsyncComponent api={mockApi} />);

  // 等待异步操作完成
  await waitFor(() => {
    expect(screen.getByText("Data loaded")).toBeInTheDocument();
  });

  expect(mockApi.fetchData).toHaveBeenCalledTimes(1);
});
```

#### 定时器处理

```javascript
// 使用 Jest 定时器 Mock
jest.useFakeTimers();

test("should update countdown every second", () => {
  render(<CountdownTimer initialTime={10} />);

  expect(screen.getByText("10")).toBeInTheDocument();

  // 快进时间
  act(() => {
    jest.advanceTimersByTime(1000);
  });

  expect(screen.getByText("9")).toBeInTheDocument();

  // 清理定时器
  jest.useRealTimers();
});
```

## 📊 性能测试和监控

### 1. 性能测试策略

#### 渲染性能测试

```javascript
import { render } from "@testing-library/react";
import { Profiler } from "react";

test("should render within performance budget", () => {
  const onRender = jest.fn();

  render(
    <Profiler id="UserList" onRender={onRender}>
      <UserList users={largeUserList} />
    </Profiler>
  );

  const renderTime = onRender.mock.calls[0][2];
  expect(renderTime).toBeLessThan(16); // 60fps 预算
});
```

#### 内存泄漏检测

```javascript
test("should not cause memory leaks", () => {
  const initialMemory = performance.memory?.usedJSHeapSize || 0;

  // 多次渲染和卸载组件
  for (let i = 0; i < 100; i++) {
    const { unmount } = render(<HeavyComponent />);
    unmount();
  }

  // 强制垃圾回收
  if (global.gc) {
    global.gc();
  }

  const finalMemory = performance.memory?.usedJSHeapSize || 0;
  const memoryIncrease = finalMemory - initialMemory;

  // 内存增长应该在合理范围内
  expect(memoryIncrease).toBeLessThan(1024 * 1024); // 1MB
});
```

### 2. 性能监控工具

#### Lighthouse CI 集成

```javascript
// lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:3000"],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.8 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "first-contentful-paint": ["warn", { maxNumericValue: 2000 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 4000 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
```

#### 自定义性能指标

```javascript
// 自定义性能监控
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
  }

  // 测量组件渲染时间
  measureRenderTime(componentName, startTime) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    this.metrics.set(`${componentName}_render`, duration);

    // 触发性能警告
    if (duration > 16) {
      // 超过 60fps 预算
      this.triggerWarning(componentName, "render", duration);
    }
  }

  // 测量内存使用
  measureMemoryUsage(componentName) {
    if (performance.memory) {
      const memory = performance.memory.usedJSHeapSize;
      this.metrics.set(`${componentName}_memory`, memory);
    }
  }

  // 获取性能报告
  getReport() {
    return Object.fromEntries(this.metrics);
  }
}
```

## 🔧 调试技巧和工具链

### 1. Chrome DevTools 高级用法

#### 断点调试技巧

```javascript
// 条件断点
function processUser(user) {
  // 在 user.id === 123 时断点
  if (user.id === 123) {
    debugger; // 条件断点
  }

  // 处理用户数据
  return processUserData(user);
}

// 日志断点
function handleClick(event) {
  // 在控制台输出事件信息
  console.log("Click event:", event);

  // 继续执行
  handleClickLogic(event);
}
```

#### 性能分析工具

```javascript
// 使用 Performance API 测量性能
function measurePerformance(fn, name) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();

  console.log(`${name} took ${end - start} milliseconds`);

  // 记录到 Performance Timeline
  performance.mark(`${name}-end`);
  performance.measure(name, `${name}-start`, `${name}-end`);

  return result;
}

// 使用 Performance Observer 监控性能
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`);
  }
});

observer.observe({ entryTypes: ["measure"] });
```

### 2. React 错误边界实现

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 更新状态，下次渲染时显示错误 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误信息
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // 发送错误到监控服务
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService(error, errorInfo) {
    // 发送到错误监控服务
    console.error("Error caught by boundary:", error, errorInfo);

    // 可以发送到 Sentry、LogRocket 等
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        extra: errorInfo,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // 自定义错误 UI
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: "pre-wrap" }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 3. 网络请求调试

#### 请求拦截和 Mock

```javascript
// 使用 Service Worker 拦截请求
// sw.js
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 拦截特定 API 请求
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      // 返回 Mock 数据
      new Response(
        JSON.stringify({
          success: true,
          data: generateMockData(url.pathname),
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      )
    );
  }
});

// 生成 Mock 数据
function generateMockData(pathname) {
  switch (pathname) {
    case "/api/users":
      return [
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Smith" },
      ];
    case "/api/posts":
      return [
        { id: 1, title: "First Post", content: "Hello World" },
        { id: 2, title: "Second Post", content: "React Testing" },
      ];
    default:
      return null;
  }
}
```

#### 性能监控

```javascript
// 网络请求性能监控
class NetworkMonitor {
  constructor() {
    this.requests = new Map();
    this.metrics = {
      totalRequests: 0,
      slowRequests: 0,
      failedRequests: 0,
    };
  }

  // 开始监控请求
  startRequest(url, method) {
    const requestId = `${method}_${url}_${Date.now()}`;

    this.requests.set(requestId, {
      url,
      method,
      startTime: performance.now(),
      status: "pending",
    });

    this.metrics.totalRequests++;

    return requestId;
  }

  // 完成请求
  completeRequest(requestId, status, duration) {
    const request = this.requests.get(requestId);

    if (request) {
      request.status = status;
      request.duration = duration;

      // 统计慢请求
      if (duration > 1000) {
        // 超过 1 秒
        this.metrics.slowRequests++;
      }

      // 统计失败请求
      if (status >= 400) {
        this.metrics.failedRequests++;
      }
    }
  }

  // 获取性能报告
  getReport() {
    return {
      ...this.metrics,
      requests: Array.from(this.requests.values()),
    };
  }
}
```

## 🧪 实践项目指南

### 项目 1：完整组件测试套件

**目标**: 为复杂组件创建完整的测试覆盖

```javascript
// UserProfile.test.js
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserProfile } from "./UserProfile";

describe("UserProfile Component", () => {
  const mockUser = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    avatar: "avatar.jpg",
    bio: "Frontend Developer",
  };

  const mockProps = {
    user: mockUser,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onFollow: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should render user information correctly", () => {
    render(<UserProfile {...mockProps} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.getByAltText("User avatar")).toHaveAttribute(
      "src",
      "avatar.jpg"
    );
  });

  test("should call onEdit when edit button is clicked", async () => {
    const user = userEvent.setup();
    render(<UserProfile {...mockProps} />);

    const editButton = screen.getByRole("button", { name: /edit/i });
    await user.click(editButton);

    expect(mockProps.onEdit).toHaveBeenCalledWith(mockUser);
  });

  test("should show confirmation dialog before deleting", async () => {
    const user = userEvent.setup();
    render(<UserProfile {...mockProps} />);

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await user.click(deleteButton);

    // 确认对话框应该出现
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();

    // 点击确认删除
    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    await user.click(confirmButton);

    expect(mockProps.onDelete).toHaveBeenCalledWith(mockUser.id);
  });

  test("should handle loading state", () => {
    render(<UserProfile {...mockProps} isLoading={true} />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });

  test("should handle error state", () => {
    const errorMessage = "Failed to load user profile";
    render(<UserProfile {...mockProps} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  test("should be accessible", () => {
    render(<UserProfile {...mockProps} />);

    // 检查语义化标签
    expect(screen.getByRole("article")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /user avatar/i })
    ).toBeInTheDocument();

    // 检查键盘导航
    const editButton = screen.getByRole("button", { name: /edit/i });
    editButton.focus();
    expect(editButton).toHaveFocus();
  });
});
```

**学习要点**:

- 完整的测试用例设计
- 用户交互测试
- 状态管理测试
- 可访问性测试
- 错误处理测试

### 项目 2：自定义测试工具

**目标**: 创建可复用的测试工具和辅助函数

```javascript
// test-utils.js
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./theme";
import { StoreProvider } from "./store";

// 自定义渲染函数，包含常用 Provider
function customRender(ui, options = {}) {
  const {
    route = "/",
    initialState = {},
    theme = "light",
    ...renderOptions
  } = options;

  // 设置路由
  window.history.pushState({}, "Test page", route);

  // 包装组件
  function Wrapper({ children }) {
    return (
      <StoreProvider initialState={initialState}>
        <ThemeProvider theme={theme}>
          <BrowserRouter>{children}</BrowserRouter>
        </ThemeProvider>
      </StoreProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// 模拟 API 响应
export function mockApiResponse(data, delay = 0) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}

// 模拟 API 错误
export function mockApiError(error, delay = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(error), delay);
  });
}

// 等待元素消失
export function waitForElementToBeRemoved(element) {
  return waitFor(() => {
    expect(element).not.toBeInTheDocument();
  });
}

// 模拟用户操作序列
export function simulateUserFlow(actions) {
  return async () => {
    const user = userEvent.setup();

    for (const action of actions) {
      const { type, target, value } = action;

      switch (type) {
        case "click":
          await user.click(screen.getByRole("button", { name: target }));
          break;
        case "type":
          await user.type(screen.getByLabelText(target), value);
          break;
        case "select":
          await user.selectOptions(screen.getByLabelText(target), value);
          break;
        default:
          throw new Error(`Unknown action type: ${type}`);
      }
    }
  };
}

// 导出自定义渲染函数
export { customRender as render };
export * from "@testing-library/react";
```

**学习要点**:

- 测试工具的设计和封装
- Provider 的测试包装
- 常用测试模式的抽象
- 用户操作流程的模拟

### 项目 3：性能测试套件

**目标**: 创建组件性能测试和监控系统

```javascript
// performance-test-utils.js
import { render } from "@testing-library/react";
import { Profiler } from "react";

// 性能测试配置
const PERFORMANCE_CONFIG = {
  renderTimeThreshold: 16, // 60fps 预算
  memoryThreshold: 1024 * 1024, // 1MB 内存阈值
  reRenderThreshold: 5, // 重渲染次数阈值
};

// 性能测试结果收集器
class PerformanceCollector {
  constructor() {
    this.results = [];
    this.currentTest = null;
  }

  // 开始测试
  startTest(testName) {
    this.currentTest = {
      name: testName,
      startTime: performance.now(),
      renders: [],
      memory: [],
    };
  }

  // 记录渲染性能
  recordRender(id, phase, actualDuration) {
    if (this.currentTest) {
      this.currentTest.renders.push({
        id,
        phase,
        duration: actualDuration,
        timestamp: performance.now(),
      });
    }
  }

  // 记录内存使用
  recordMemory() {
    if (this.currentTest && performance.memory) {
      this.currentTest.memory.push({
        used: performance.memory.usedJSHeapSize,
        timestamp: performance.now(),
      });
    }
  }

  // 完成测试
  finishTest() {
    if (this.currentTest) {
      this.currentTest.endTime = performance.now();
      this.currentTest.totalTime =
        this.currentTest.endTime - this.currentTest.startTime;

      this.results.push(this.currentTest);
      this.currentTest = null;
    }
  }

  // 获取测试报告
  getReport() {
    return this.results.map((result) => ({
      name: result.name,
      totalTime: result.totalTime,
      renderCount: result.renders.length,
      averageRenderTime:
        result.renders.reduce((sum, r) => sum + r.duration, 0) /
        result.renders.length,
      maxRenderTime: Math.max(...result.renders.map((r) => r.duration)),
      memoryUsage:
        result.memory.length > 0
          ? result.memory[result.memory.length - 1].used
          : 0,
    }));
  }
}

// 全局性能收集器
const performanceCollector = new PerformanceCollector();

// 性能测试包装器
export function withPerformanceTest(Component, testName) {
  return function PerformanceTestWrapper(props) {
    return (
      <Profiler
        id={testName}
        onRender={performanceCollector.recordRender.bind(performanceCollector)}
      >
        <Component {...props} />
      </Profiler>
    );
  };
}

// 性能测试函数
export function testPerformance(Component, testCases, options = {}) {
  const { iterations = 100, ...testOptions } = options;

  describe(`Performance Tests: ${Component.name}`, () => {
    beforeEach(() => {
      performanceCollector.startTest(Component.name);
    });

    afterEach(() => {
      performanceCollector.finishTest();
    });

    testCases.forEach(({ name, props, assertions }) => {
      test(name, () => {
        // 多次渲染测试性能稳定性
        for (let i = 0; i < iterations; i++) {
          const { rerender } = render(
            withPerformanceTest(Component, name)(props)
          );

          // 记录内存使用
          performanceCollector.recordMemory();

          // 触发重渲染
          if (i < iterations - 1) {
            rerender(withPerformanceTest(Component, name)(props));
          }
        }

        // 执行性能断言
        assertions(performanceCollector.getReport().slice(-1)[0]);
      });
    });
  });
}

// 性能断言工具
export const performanceAssertions = {
  // 渲染时间应该在预算内
  renderTimeWithinBudget: (report) => {
    expect(report.averageRenderTime).toBeLessThan(
      PERFORMANCE_CONFIG.renderTimeThreshold
    );
  },

  // 重渲染次数应该在合理范围内
  reRenderCountReasonable: (report) => {
    expect(report.renderCount).toBeLessThan(
      PERFORMANCE_CONFIG.reRenderThreshold
    );
  },

  // 内存使用应该在阈值内
  memoryUsageWithinLimit: (report) => {
    expect(report.memoryUsage).toBeLessThan(PERFORMANCE_CONFIG.memoryThreshold);
  },
};
```

**学习要点**:

- 性能测试的设计和实现
- React Profiler 的使用
- 性能指标的收集和分析
- 性能断言的编写

## 📊 测试覆盖率优化

### 1. 覆盖率分析工具

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/index.tsx",
    "!src/serviceWorker.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ["text", "lcov", "html"],
  coverageDirectory: "coverage",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
};
```

### 2. 覆盖率优化策略

```javascript
// 识别未覆盖的代码路径
describe("UserService", () => {
  test("should handle all error cases", () => {
    const service = new UserService();

    // 测试成功情况
    expect(service.getUser(1)).resolves.toBeDefined();

    // 测试用户不存在的情况
    expect(service.getUser(999)).rejects.toThrow("User not found");

    // 测试网络错误情况
    service.mockNetworkError();
    expect(service.getUser(1)).rejects.toThrow("Network error");

    // 测试权限不足的情况
    service.mockPermissionDenied();
    expect(service.getUser(1)).rejects.toThrow("Permission denied");
  });
});
```

## 🔧 调试工作流优化

### 1. 调试配置

```javascript
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug React Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Debug React App",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    }
  ]
}
```

### 2. 调试脚本

```json
// package.json
{
  "scripts": {
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand",
    "test:coverage": "jest --coverage --watchAll",
    "test:performance": "jest --testNamePattern='Performance'",
    "debug:build": "vite build --mode development --sourcemap",
    "debug:analyze": "npm run build && npx webpack-bundle-analyzer dist"
  }
}
```

## 📚 学习资源推荐

### 官方文档

- [Jest 官方文档](https://jestjs.io/)
- [React Testing Library 文档](https://testing-library.com/docs/react-testing-library/intro/)
- [React DevTools 文档](https://react.dev/learn/react-developer-tools)
- [Chrome DevTools 文档](https://developers.google.com/web/tools/chrome-devtools)

### 优秀文章

- React 测试最佳实践指南
- 性能测试和优化策略
- 调试技巧和工具使用
- 测试驱动开发实践

### 实践项目

- 参与开源项目测试贡献
- 创建测试工具和库
- 优化现有项目测试覆盖
- 分享测试和调试经验

## 🎯 学习检查清单

### 基础概念 ✅

- [ ] 理解测试金字塔和测试策略
- [ ] 掌握 Jest 和 React Testing Library 的使用
- [ ] 了解性能测试和监控方法
- [ ] 理解调试工具和技巧

### 工具掌握 ✅

- [ ] 熟练使用 Jest 编写测试
- [ ] 掌握 React Testing Library 测试哲学
- [ ] 熟练使用 React DevTools
- [ ] 掌握 Chrome DevTools 高级功能

### 深度理解 ✅

- [ ] 理解测试框架的设计原理
- [ ] 掌握性能测试的实现机制
- [ ] 了解调试工具的工作原理
- [ ] 理解测试驱动开发的价值

### 实践应用 ✅

- [ ] 为复杂组件编写完整测试
- [ ] 创建自定义测试工具
- [ ] 实现性能监控系统
- [ ] 解决复杂调试问题

## 🚀 下一步行动计划

### 本周目标

1. 完成 Jest 和 React Testing Library 学习
2. 开始 React DevTools 深度使用
3. 实践组件测试编写

### 本月目标

1. 完成测试和调试工具学习
2. 掌握性能测试和监控
3. 参与开源项目测试贡献

### 长期目标

1. 成为测试和调试专家
2. 能够设计测试策略和工具
3. 在团队中推广测试最佳实践

---

**记住：好的测试是代码质量的保障，好的调试是开发效率的提升！** 🧪

**性能测试帮助我们构建更快的应用，调试技巧帮助我们更快地解决问题！** 🔍

**测试驱动开发不仅是一种方法，更是一种思维方式！** 🚀

准备好了吗？让我们开始这段测试和调试的深度探索之旅吧！✨🎯
