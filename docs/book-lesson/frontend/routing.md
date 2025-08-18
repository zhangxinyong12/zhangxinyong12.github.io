# 🛣️ 前端路由系统

> **优秀的路由系统是构建单页应用的基础**

## 📚 路由系统概述

### 什么是前端路由？
前端路由是在单页应用（SPA）中，根据 URL 变化来渲染不同组件的机制。它让用户可以在不刷新页面的情况下，通过 URL 访问不同的页面内容。

### 路由系统的优势
- **用户体验** - 页面切换流畅，无刷新
- **性能优化** - 按需加载组件和资源
- **SEO 友好** - 支持服务端渲染和预渲染
- **状态管理** - 路由状态与组件状态同步

## 🏗️ 路由架构设计

### 1. **路由层次结构**
```
/                    # 首页
├── /auth           # 认证相关
│   ├── /login      # 登录页
│   ├── /register   # 注册页
│   └── /forgot     # 忘记密码
├── /books          # 图书管理
│   ├── /list       # 图书列表
│   ├── /detail/:id # 图书详情
│   └── /add        # 添加图书
├── /users          # 用户管理
│   ├── /profile    # 用户资料
│   └── /settings   # 用户设置
└── /admin          # 管理后台
    ├── /dashboard  # 仪表板
    ├── /users      # 用户管理
    └── /books      # 图书管理
```

### 2. **路由配置结构**
```typescript
// 路由配置接口
interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  children?: RouteConfig[];
  meta?: {
    title?: string;
    requiresAuth?: boolean;
    roles?: string[];
    icon?: string;
    hidden?: boolean;
  };
  layout?: React.ComponentType<any>;
}
```

## 🔧 React Router 实现

### 1. **基础路由配置**
```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { BookList } from './pages/BookList';
import { BookDetail } from './pages/BookDetail';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="auth">
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
          <Route path="books">
            <Route index element={<BookList />} />
            <Route path=":id" element={<BookDetail />} />
          </Route>
          <Route
            path="admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="books" element={<BookManagement />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### 2. **路由守卫组件**
```typescript
// ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles = [],
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // 重定向到登录页，并保存当前路径
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && user && !roles.includes(user.role)) {
    // 用户角色不匹配，重定向到首页
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
```

### 3. **动态路由参数**
```typescript
// BookDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBook(id);
    }
  }, [id]);

  const fetchBook = async (bookId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/books/${bookId}`);
      if (response.ok) {
        const bookData = await response.json();
        setBook(bookData);
      } else {
        navigate('/books', { replace: true });
      }
    } catch (error) {
      console.error('获取图书详情失败:', error);
      navigate('/books', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!book) {
    return <div>图书不存在</div>;
  }

  return (
    <div className="book-detail">
      <h1>{book.title}</h1>
      <p>作者: {book.author}</p>
      <p>分类: {book.category}</p>
      <p>描述: {book.description}</p>
    </div>
  );
};
```

## 🎨 路由状态管理

### 1. **路由状态 Hook**
```typescript
// useRouteState.ts
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useRouteState = <T>(key: string, defaultValue: T) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<T>(() => {
    const searchParams = new URLSearchParams(location.search);
    const value = searchParams.get(key);
    return value ? JSON.parse(value) : defaultValue;
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (state !== defaultValue) {
      searchParams.set(key, JSON.stringify(state));
    } else {
      searchParams.delete(key);
    }
    
    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: true,
    });
  }, [state, key, defaultValue, location.pathname, navigate]);

  return [state, setState] as const;
};
```

### 2. **路由历史管理**
```typescript
// useRouteHistory.ts
import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useRouteHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const goForward = useCallback(() => {
    navigate(1);
  }, [navigate]);

  const goTo = useCallback((path: string, replace = false) => {
    navigate(path, { replace });
  }, [navigate]);

  const goToWithState = useCallback((path: string, state: any, replace = false) => {
    navigate(path, { state, replace });
  }, [navigate]);

  return {
    goBack,
    goForward,
    goTo,
    goToWithState,
    currentPath: location.pathname,
    currentSearch: location.search,
    currentState: location.state,
  };
};
```

## 🚀 路由性能优化

### 1. **代码分割和懒加载**
```typescript
// 使用 React.lazy 进行代码分割
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from './components/LoadingSpinner';

const Home = lazy(() => import('./pages/Home'));
const BookList = lazy(() => import('./pages/BookList'));
const BookDetail = lazy(() => import('./pages/BookDetail'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// 路由配置
const routes: RouteConfig[] = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/books',
    children: [
      {
        path: 'list',
        component: BookList,
      },
      {
        path: ':id',
        component: BookDetail,
      },
    ],
  },
  {
    path: '/admin',
    component: AdminDashboard,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
];

// 路由渲染组件
export const RouteRenderer: React.FC<{ routes: RouteConfig[] }> = ({ routes }) => {
  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <route.component />
            </Suspense>
          }
        />
      ))}
    </Routes>
  );
};
```

### 2. **路由预加载**
```typescript
// useRoutePreload.ts
import { useCallback } from 'react';

export const useRoutePreload = () => {
  const preloadRoute = useCallback((path: string) => {
    const routeMap: Record<string, () => Promise<any>> = {
      '/books': () => import('./pages/BookList'),
      '/books/detail': () => import('./pages/BookDetail'),
      '/admin': () => import('./pages/AdminDashboard'),
    };

    const preloadFn = routeMap[path];
    if (preloadFn) {
      preloadFn();
    }
  }, []);

  const preloadOnHover = useCallback((path: string) => {
    return {
      onMouseEnter: () => preloadRoute(path),
    };
  }, [preloadRoute]);

  return { preloadRoute, preloadOnHover };
};

// 在导航组件中使用
export const Navigation: React.FC = () => {
  const { preloadOnHover } = useRoutePreload();

  return (
    <nav>
      <Link to="/books" {...preloadOnHover('/books')}>
        图书管理
      </Link>
      <Link to="/admin" {...preloadOnHover('/admin')}>
        管理后台
      </Link>
    </nav>
  );
};
```

## 🔍 路由搜索和过滤

### 1. **搜索参数管理**
```typescript
// useSearchParams.ts
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useSearchParamsState = <T>(
  key: string,
  defaultValue: T,
  parser?: (value: string) => T
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState<T>(() => {
    const value = searchParams.get(key);
    if (value && parser) {
      try {
        return parser(value);
      } catch {
        return defaultValue;
      }
    }
    return value ? JSON.parse(value) : defaultValue;
  });

  const updateState = useCallback((newState: T) => {
    setState(newState);
    if (newState === defaultValue) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, JSON.stringify(newState));
    }
    setSearchParams(searchParams);
  }, [key, defaultValue, searchParams, setSearchParams]);

  return [state, updateState] as const;
};

// 在组件中使用
export const BookList: React.FC = () => {
  const [search, setSearch] = useSearchParamsState('search', '');
  const [category, setCategory] = useSearchParamsState('category', 'all');
  const [sortBy, setSortBy] = useSearchParamsState('sortBy', 'title');
  const [page, setPage] = useSearchParamsState('page', 1, Number);

  // 搜索参数变化时重新获取数据
  useEffect(() => {
    fetchBooks({ search, category, sortBy, page });
  }, [search, category, sortBy, page]);

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="搜索图书..."
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">全部分类</option>
        <option value="fiction">小说</option>
        <option value="non-fiction">非小说</option>
      </select>
      {/* 其他过滤和排序控件 */}
    </div>
  );
};
```

### 2. **URL 同步状态**
```typescript
// useUrlSync.ts
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const useUrlSync = <T>(
  state: T,
  updateState: (newState: T) => void,
  key: string
) => {
  const location = useLocation();
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const urlValue = searchParams.get(key);
    
    if (urlValue) {
      try {
        const parsedValue = JSON.parse(urlValue);
        if (parsedValue !== state) {
          updateState(parsedValue);
        }
      } catch {
        // 解析失败，忽略
      }
    }
  }, [location.search, key, state, updateState]);
};
```

## 📱 移动端路由优化

### 1. **触摸手势支持**
```typescript
// useSwipeNavigation.ts
import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSwipeNavigation = () => {
  const navigate = useNavigate();
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return;

    const distanceX = touchStart.current.x - touchEnd.current.x;
    const distanceY = touchStart.current.y - touchEnd.current.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0) {
        // 向左滑动，前进
        navigate(1);
      } else {
        // 向右滑动，后退
        navigate(-1);
      }
    }
  }, [navigate]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};
```

### 2. **响应式路由**
```typescript
// useResponsiveRoute.ts
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useResponsiveRoute = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigateResponsive = (path: string, mobilePath?: string) => {
    const targetPath = isMobile && mobilePath ? mobilePath : path;
    navigate(targetPath);
  };

  return { isMobile, navigateResponsive };
};
```

## 🧪 路由测试

### 1. **路由组件测试**
```typescript
// BookDetail.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BookDetail } from './BookDetail';

// Mock useParams hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '123' }),
}));

// Mock fetch
global.fetch = jest.fn();

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('BookDetail', () => {
  it('should fetch and display book details', async () => {
    const mockBook = {
      id: '123',
      title: '测试图书',
      author: '测试作者',
      category: '测试分类',
      description: '测试描述',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBook,
    });

    renderWithRouter(<BookDetail />);

    expect(screen.getByText('加载中...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('测试图书')).toBeInTheDocument();
      expect(screen.getByText('作者: 测试作者')).toBeInTheDocument();
    });
  });
});
```

### 2. **路由导航测试**
```typescript
// Navigation.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navigation } from './Navigation';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Navigation', () => {
  it('should navigate to correct routes', () => {
    renderWithRouter(<Navigation />);

    const bookLink = screen.getByText('图书管理');
    const adminLink = screen.getByText('管理后台');

    expect(bookLink).toHaveAttribute('href', '/books');
    expect(adminLink).toHaveAttribute('href', '/admin');
  });

  it('should preload routes on hover', () => {
    const mockPreload = jest.fn();
    jest.mock('./hooks/useRoutePreload', () => ({
      useRoutePreload: () => ({
        preloadOnHover: () => ({ onMouseEnter: mockPreload }),
      }),
    }));

    renderWithRouter(<Navigation />);

    const bookLink = screen.getByText('图书管理');
    fireEvent.mouseEnter(bookLink);

    expect(mockPreload).toHaveBeenCalled();
  });
});
```

## 📝 总结

优秀的前端路由系统应该具备：

- 🏗️ **清晰架构** - 层次化的路由结构
- 🔧 **功能完整** - 路由守卫、参数管理、状态同步
- 🚀 **性能优化** - 代码分割、懒加载、预加载
- 🔍 **搜索过滤** - URL 参数同步、状态管理
- 📱 **移动适配** - 触摸手势、响应式路由
- 🧪 **测试覆盖** - 组件测试、导航测试

通过实现这些功能，你可以构建出功能强大、性能优异的前端路由系统！
