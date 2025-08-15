# 第七阶段：路由系统源码 (待创建)

> 深入探索 React Router 的实现原理，理解路由匹配、动态路由、路由守卫等核心概念

## 📚 学习目标

通过本阶段学习，你将掌握：

- React Router 的核心架构设计
- 路由匹配算法的实现原理
- 动态路由和嵌套路由的机制
- 路由守卫和权限控制的策略
- 路由懒加载的实现方式

## 🏗️ React Router 架构概览

### 1. 整体架构设计

React Router 采用分层架构，主要包含以下核心模块：

```
┌─────────────────────────────────────┐
│           Router 组件层              │
├─────────────────────────────────────┤
│         Route 匹配层                │
├─────────────────────────────────────┤
│         History 管理层              │
├─────────────────────────────────────┤
│         Location 解析层             │
└─────────────────────────────────────┘
```

### 2. 核心概念关系

- **Router**: 路由容器，管理路由状态
- **Route**: 路由配置，定义路径和组件
- **History**: 历史记录管理，处理浏览器导航
- **Location**: 位置信息，包含路径、查询参数等
- **Match**: 路由匹配结果，包含参数和路径信息

## 🎯 路由核心实现

### 1. Router 组件实现

```javascript
// packages/react-router/lib/components.tsx
export function Router({
  basename,
  children,
  location: locationProp,
  navigationType = NavigationType.Pop,
  navigator,
  static: staticProp = false,
}) {
  // 创建导航上下文
  const navigationContext = React.useMemo(
    () => ({
      basename,
      navigator,
      static: staticProp,
    }),
    [basename, navigator, staticProp]
  );

  // 创建位置上下文
  const locationContext = React.useMemo(
    () => ({
      location: locationProp || navigator.location,
      navigationType,
    }),
    [locationProp, navigator.location, navigationType]
  );

  // 创建路由上下文
  const routingContext = React.useMemo(
    () => ({
      outlet: null,
      matches: [],
    }),
    []
  );

  return (
    <NavigationContext.Provider value={navigationContext}>
      <LocationContext.Provider value={locationContext}>
        <RoutingContext.Provider value={routingContext}>
          {children}
        </RoutingContext.Provider>
      </LocationContext.Provider>
    </NavigationContext.Provider>
  );
}
```

### 2. Route 组件实现

```javascript
// packages/react-router/lib/components.tsx
export function Route({
  caseSensitive = false,
  children,
  element,
  index = false,
  path,
}) {
  const context = React.useContext(RoutingContext);
  const location = useLocation();
  const pathname = location.pathname;

  // 计算路由匹配
  const matches = React.useMemo(() => {
    if (path) {
      return matchPath(path, pathname, { caseSensitive });
    }
    return null;
  }, [path, pathname, caseSensitive]);

  // 如果没有匹配，不渲染任何内容
  if (!matches) {
    return null;
  }

  // 渲染路由内容
  if (element) {
    return React.cloneElement(element, { matches });
  }

  if (children) {
    return children({ matches });
  }

  return null;
}
```

## 🔍 路由匹配算法

### 1. 路径匹配原理

```javascript
// packages/react-router/lib/utils.ts
export function matchPath(
  pattern: PathPattern | string,
  pathname: string,
  options?: PathMatchOptions
): PathMatch | null {
  // 将字符串模式转换为正则表达式
  const patternObj = typeof pattern === "string" ? { path: pattern } : pattern;
  const { path, caseSensitive = false, end = true } = patternObj;

  // 构建正则表达式
  const regex = pathToRegexp(path, [], { end, sensitive: caseSensitive });

  // 执行匹配
  const match = regex.exec(pathname);

  if (!match) {
    return null;
  }

  // 提取参数
  const params = {};
  const paramNames = regex.keys || [];

  for (let i = 0; i < paramNames.length; i++) {
    const paramName = paramNames[i].name;
    const paramValue = match[i + 1];

    if (paramValue !== undefined) {
      params[paramName] = decodeURIComponent(paramValue);
    }
  }

  return {
    params,
    pathname: match[0],
    pathnameBase: match[0].replace(/\/*$/, ""),
    pattern,
  };
}
```

### 2. 动态路由参数

```javascript
// 动态路由示例
function UserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}

// 路由配置
<Route path="/users/:userId" element={<UserProfile />} />;

// 匹配结果
// URL: /users/123
// 匹配: { userId: "123" }
```

### 3. 嵌套路由实现

```javascript
// packages/react-router/lib/components.tsx
export function Outlet() {
  const context = React.useContext(RoutingContext);

  if (!context) {
    throw new Error(
      `<Outlet> may be used only in the context of a <Router> component.`
    );
  }

  // 渲染嵌套路由
  return context.outlet;
}

// 嵌套路由示例
function App() {
  return (
    <Router>
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<DashboardHome />} />
        <Route path="profile" element={<DashboardProfile />} />
        <Route path="settings" element={<DashboardSettings />} />
      </Route>
    </Router>
  );
}

function Dashboard() {
  return (
    <div>
      <nav>
        <Link to="/dashboard">Home</Link>
        <Link to="/dashboard/profile">Profile</Link>
        <Link to="/dashboard/settings">Settings</Link>
      </nav>
      <main>
        <Outlet /> {/* 渲染嵌套路由 */}
      </main>
    </div>
  );
}
```

## 🌐 History 管理

### 1. Browser Router 实现

```javascript
// packages/react-router-dom/lib/components.tsx
export function BrowserRouter({ basename, children, window }) {
  // 创建 History 实例
  const historyRef = React.useRef();

  if (historyRef.current == null) {
    historyRef.current = createBrowserHistory({ window, basename });
  }

  const history = historyRef.current;
  const [state, setState] = React.useState({
    action: history.action,
    location: history.location,
  });

  // 监听历史记录变化
  React.useLayoutEffect(() => {
    history.listen(setState);
  }, [history]);

  return (
    <Router
      basename={basename}
      children={children}
      location={state.location}
      navigationType={state.action}
      navigator={history}
    />
  );
}
```

### 2. Hash Router 实现

```javascript
// packages/react-router-dom/lib/components.tsx
export function HashRouter({ basename, children, window }) {
  // 创建 Hash History 实例
  const historyRef = React.useRef();

  if (historyRef.current == null) {
    historyRef.current = createHashHistory({ window, basename });
  }

  const history = historyRef.current;
  const [state, setState] = React.useState({
    action: history.action,
    location: history.location,
  });

  // 监听历史记录变化
  React.useLayoutEffect(() => {
    history.listen(setState);
  }, [history]);

  return (
    <Router
      basename={basename}
      children={children}
      location={state.location}
      navigationType={state.action}
      navigator={history}
    />
  );
}
```

### 3. History API 封装

```javascript
// packages/history/index.ts
export function createBrowserHistory(options = {}) {
  const { window = document.defaultView, basename = "" } = options;

  const globalHistory = window.history;

  // 获取当前位置
  function getCurrentLocation(): Location {
    const { pathname, search, hash } = window.location;
    const state = globalHistory.state || {};

    return {
      pathname,
      search,
      hash,
      state,
    };
  }

  // 创建 History 对象
  const history: BrowserHistory = {
    get action() {
      return action;
    },
    get location() {
      return location;
    },

    // 导航到新位置
    push(to: To, state?: any) {
      const nextAction = Action.Push;
      const nextLocation = createLocation(to, state);

      // 更新历史记录
      globalHistory.pushState(
        { ...state, key: nextLocation.key },
        "",
        createHref(nextLocation)
      );

      // 触发变化事件
      setState({ action: nextAction, location: nextLocation });
    },

    // 替换当前位置
    replace(to: To, state?: any) {
      const nextAction = Action.Replace;
      const nextLocation = createLocation(to, state);

      // 替换历史记录
      globalHistory.replaceState(
        { ...state, key: nextLocation.key },
        "",
        createHref(nextLocation)
      );

      // 触发变化事件
      setState({ action: nextAction, location: nextLocation });
    },

    // 后退
    go(delta: number) {
      globalHistory.go(delta);
    },

    // 前进
    forward() {
      globalHistory.forward();
    },

    // 后退
    back() {
      globalHistory.back();
    },

    // 监听变化
    listen(listener: Listener) {
      return listeners.push(listener);
    },
  };

  return history;
}
```

## 🔐 路由守卫和权限控制

### 1. 路由守卫实现

```javascript
// 自定义路由守卫组件
function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();
  const location = useLocation();

  // 检查用户权限
  if (!user || !user.roles.includes(requiredRole)) {
    // 重定向到登录页面
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// 使用路由守卫
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminPanel />
    </ProtectedRoute>
  }
/>;
```

### 2. 权限控制策略

```javascript
// 权限控制 Hook
function usePermission(requiredPermission) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !hasPermission(user, requiredPermission)) {
      // 记录尝试访问的页面
      const from = location.pathname;

      // 重定向到无权限页面
      navigate("/unauthorized", {
        state: { from, requiredPermission },
      });
    }
  }, [user, requiredPermission, location, navigate]);

  return user && hasPermission(user, requiredPermission);
}

// 权限检查函数
function hasPermission(user, permission) {
  if (!user || !user.permissions) {
    return false;
  }

  return user.permissions.includes(permission);
}

// 使用权限控制
function AdminPage() {
  const hasAccess = usePermission("admin:read");

  if (!hasAccess) {
    return null; // 组件不会渲染
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      {/* 管理员内容 */}
    </div>
  );
}
```

## ⚡ 路由懒加载

### 1. React.lazy 实现

```javascript
// 路由懒加载示例
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

// 懒加载组件
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
```

### 2. 路由预加载

```javascript
// 路由预加载 Hook
function useRoutePreload() {
  const preloadRoute = useCallback((routePath) => {
    // 预加载路由组件
    const routeComponent = routeMap[routePath];
    if (routeComponent && routeComponent.preload) {
      routeComponent.preload();
    }
  }, []);

  return preloadRoute;
}

// 路由配置
const routeMap = {
  "/about": {
    component: lazy(() => import("./pages/About")),
    preload: () => import("./pages/About"),
  },
  "/contact": {
    component: lazy(() => import("./pages/Contact")),
    preload: () => import("./pages/Contact"),
  },
};

// 使用预加载
function Navigation() {
  const preloadRoute = useRoutePreload();

  return (
    <nav>
      <Link to="/about" onMouseEnter={() => preloadRoute("/about")}>
        About
      </Link>
      <Link to="/contact" onMouseEnter={() => preloadRoute("/contact")}>
        Contact
      </Link>
    </nav>
  );
}
```

## 🔍 源码学习重点

### 1. 核心文件

- `packages/react-router/lib/components.tsx` - 路由组件实现
- `packages/react-router/lib/utils.ts` - 路由匹配工具
- `packages/history/index.ts` - History API 封装
- `packages/react-router-dom/lib/components.tsx` - DOM 路由组件

### 2. 关键函数

```javascript
// 路由匹配
function matchPath(pattern, pathname, options)
function pathToRegexp(path, keys, options)

// History 管理
function createBrowserHistory(options)
function createHashHistory(options)
function createMemoryHistory(options)

// 路由组件
function Router(props)
function Route(props)
function Outlet()
function Navigate(props)
```

## 📝 实践练习

### 1. 手写简化版路由系统

```javascript
// 简化版路由系统
class SimpleRouter {
  constructor(routes) {
    this.routes = routes;
    this.currentRoute = null;
    this.listeners = [];

    // 监听浏览器历史记录变化
    window.addEventListener("popstate", this.handlePopState.bind(this));

    // 初始化路由
    this.navigate(window.location.pathname, { replace: true });
  }

  // 路由匹配
  matchRoute(pathname) {
    for (const route of this.routes) {
      const match = this.matchPath(route.path, pathname);
      if (match) {
        return { ...route, match };
      }
    }
    return null;
  }

  // 路径匹配
  matchPath(pattern, pathname) {
    // 简单的路径匹配实现
    if (pattern === pathname) {
      return { params: {} };
    }

    // 动态路由匹配
    const patternParts = pattern.split("/");
    const pathnameParts = pathname.split("/");

    if (patternParts.length !== pathnameParts.length) {
      return null;
    }

    const params = {};

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathnamePart = pathnameParts[i];

      if (patternPart.startsWith(":")) {
        // 动态参数
        const paramName = patternPart.slice(1);
        params[paramName] = pathnamePart;
      } else if (patternPart !== pathnamePart) {
        // 静态路径不匹配
        return null;
      }
    }

    return { params };
  }

  // 导航
  navigate(pathname, options = {}) {
    const route = this.matchRoute(pathname);

    if (!route) {
      console.error(`Route not found: ${pathname}`);
      return;
    }

    // 更新浏览器历史记录
    if (options.replace) {
      window.history.replaceState(null, "", pathname);
    } else {
      window.history.pushState(null, "", pathname);
    }

    // 更新当前路由
    this.currentRoute = route;

    // 通知监听器
    this.notifyListeners();
  }

  // 处理浏览器历史记录变化
  handlePopState() {
    this.navigate(window.location.pathname, { replace: true });
  }

  // 添加监听器
  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // 通知监听器
  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.currentRoute));
  }
}

// 使用示例
const routes = [
  { path: "/", component: Home },
  { path: "/about", component: About },
  { path: "/users/:userId", component: UserProfile },
];

const router = new SimpleRouter(routes);

// 路由组件
function App() {
  const [currentRoute, setCurrentRoute] = useState(router.currentRoute);

  useEffect(() => {
    const unsubscribe = router.addListener(setCurrentRoute);
    return unsubscribe;
  }, []);

  if (!currentRoute) {
    return <div>Route not found</div>;
  }

  const Component = currentRoute.component;
  return <Component {...currentRoute.match.params} />;
}
```

### 2. 实现路由守卫

```javascript
// 路由守卫系统
class RouteGuard {
  constructor() {
    this.guards = new Map();
    this.fallbacks = new Map();
  }

  // 添加路由守卫
  addGuard(path, guard, fallback) {
    this.guards.set(path, guard);
    if (fallback) {
      this.fallbacks.set(path, fallback);
    }
  }

  // 检查路由权限
  async checkGuard(path, context) {
    const guard = this.guards.get(path);

    if (!guard) {
      return true; // 没有守卫，允许访问
    }

    try {
      const result = await guard(context);
      return result;
    } catch (error) {
      console.error("Route guard error:", error);
      return false;
    }
  }

  // 获取回退路由
  getFallback(path) {
    return this.fallbacks.get(path);
  }
}

// 使用示例
const routeGuard = new RouteGuard();

// 添加管理员路由守卫
routeGuard.addGuard(
  "/admin",
  async (context) => {
    const { user } = context;
    return user && user.role === "admin";
  },
  "/unauthorized"
);

// 添加认证守卫
routeGuard.addGuard(
  "/profile",
  async (context) => {
    const { user } = context;
    return !!user;
  },
  "/login"
);

// 在路由组件中使用
function ProtectedRoute({ path, children, context }) {
  const [hasAccess, setHasAccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAccess() {
      const access = await routeGuard.checkGuard(path, context);
      setHasAccess(access);

      if (!access) {
        const fallback = routeGuard.getFallback(path);
        if (fallback) {
          navigate(fallback);
        }
      }
    }

    checkAccess();
  }, [path, context, navigate]);

  if (hasAccess === null) {
    return <div>Checking access...</div>;
  }

  if (!hasAccess) {
    return <div>Access denied</div>;
  }

  return children;
}
```

## 🎯 学习检查清单

- [ ] 理解 React Router 的核心架构设计
- [ ] 掌握路由匹配算法的实现原理
- [ ] 了解动态路由和嵌套路由的机制
- [ ] 理解路由守卫和权限控制的策略
- [ ] 掌握路由懒加载的实现方式
- [ ] 手写简化版路由系统
- [ ] 实现路由守卫功能

## 🚀 下一步

恭喜你完成了第七阶段的学习！现在你已经深入理解了 React Router 的实现原理，可以进入下一阶段：

**[第八阶段：状态管理库 →](./phase8-state-libraries.md)**

在下一阶段，我们将深入探索 Redux、Zustand、MobX 等状态管理库的实现原理，理解单向数据流、响应式编程等核心概念。

---

**记住：路由系统是单页应用的核心，理解它对于掌握现代前端开发至关重要！** 🎯
