# 🗃️ 前端状态管理

> **优秀的状态管理是构建复杂前端应用的关键**

## 📚 状态管理概述

### 什么是状态管理？
状态管理是管理应用程序中数据流和状态变化的机制。它包括：
- **本地状态** - 组件内部的状态
- **全局状态** - 应用程序级别的状态
- **服务器状态** - 从后端获取的数据状态
- **UI状态** - 用户界面的交互状态

### 状态管理的挑战
- **状态同步** - 多个组件间的状态同步
- **性能优化** - 避免不必要的重渲染
- **调试困难** - 状态变化难以追踪
- **代码复杂度** - 状态逻辑分散

## 🏗️ 状态管理架构

### 1. **状态分层设计**
```
┌─────────────────────────────────────┐
│            UI Layer                 │  ← 展示层
├─────────────────────────────────────┤
│         State Layer                 │  ← 状态层
├─────────────────────────────────────┤
│         Logic Layer                 │  ← 逻辑层
├─────────────────────────────────────┤
│         Data Layer                  │  ← 数据层
└─────────────────────────────────────┘
```

### 2. **状态分类**
```typescript
// 状态类型定义
interface AppState {
  // 用户状态
  user: {
    profile: UserProfile | null;
    isAuthenticated: boolean;
    permissions: string[];
  };
  
  // 应用状态
  app: {
    theme: 'light' | 'dark';
    language: string;
    sidebar: {
      isOpen: boolean;
      activeItem: string;
    };
  };
  
  // 业务状态
  books: {
    list: Book[];
    loading: boolean;
    error: string | null;
    filters: BookFilters;
    pagination: PaginationState;
  };
  
  // UI状态
  ui: {
    modals: ModalState[];
    notifications: Notification[];
    loading: LoadingState;
  };
}
```

## 🔧 React 状态管理

### 1. **useState Hook**
```typescript
// 基础状态管理
import { useState, useCallback } from 'react';

export const BookList: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BookFilters>({
    search: '',
    category: 'all',
    sortBy: 'title',
    sortOrder: 'asc',
  });

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/books?' + new URLSearchParams(filters));
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      } else {
        setError('获取图书列表失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters: Partial<BookFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: 'all',
      sortBy: 'title',
      sortOrder: 'asc',
    });
  }, []);

  return (
    <div>
      <BookFilters 
        filters={filters}
        onUpdate={updateFilters}
        onClear={clearFilters}
      />
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      <BookGrid books={books} />
    </div>
  );
};
```

### 2. **useReducer Hook**
```typescript
// 复杂状态管理
interface BookState {
  books: Book[];
  loading: boolean;
  error: string | null;
  filters: BookFilters;
  pagination: PaginationState;
}

type BookAction =
  | { type: 'FETCH_BOOKS_START' }
  | { type: 'FETCH_BOOKS_SUCCESS'; payload: Book[] }
  | { type: 'FETCH_BOOKS_ERROR'; payload: string }
  | { type: 'UPDATE_FILTERS'; payload: Partial<BookFilters> }
  | { type: 'UPDATE_PAGINATION'; payload: Partial<PaginationState> }
  | { type: 'CLEAR_FILTERS' };

const bookReducer = (state: BookState, action: BookAction): BookState => {
  switch (action.type) {
    case 'FETCH_BOOKS_START':
      return { ...state, loading: true, error: null };
      
    case 'FETCH_BOOKS_SUCCESS':
      return { ...state, loading: false, books: action.payload };
      
    case 'FETCH_BOOKS_ERROR':
      return { ...state, loading: false, error: action.payload };
      
    case 'UPDATE_FILTERS':
      return { 
        ...state, 
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 } // 重置页码
      };
      
    case 'UPDATE_PAGINATION':
      return { 
        ...state, 
        pagination: { ...state.pagination, ...action.payload }
      };
      
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {
          search: '',
          category: 'all',
          sortBy: 'title',
          sortOrder: 'asc',
        },
        pagination: { ...state.pagination, page: 1 }
      };
      
    default:
      return state;
  }
};

// 使用 useReducer
export const BookListWithReducer: React.FC = () => {
  const [state, dispatch] = useReducer(bookReducer, {
    books: [],
    loading: false,
    error: null,
    filters: {
      search: '',
      category: 'all',
      sortBy: 'title',
      sortOrder: 'asc',
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
    },
  });

  const fetchBooks = useCallback(async () => {
    dispatch({ type: 'FETCH_BOOKS_START' });
    
    try {
      const response = await fetch('/api/books?' + new URLSearchParams(state.filters));
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'FETCH_BOOKS_SUCCESS', payload: data });
      } else {
        dispatch({ type: 'FETCH_BOOKS_ERROR', payload: '获取图书列表失败' });
      }
    } catch (err) {
      dispatch({ type: 'FETCH_BOOKS_ERROR', payload: '网络错误' });
    }
  }, [state.filters]);

  const updateFilters = useCallback((newFilters: Partial<BookFilters>) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: newFilters });
  }, []);

  return (
    <div>
      <BookFilters 
        filters={state.filters}
        onUpdate={updateFilters}
        onClear={() => dispatch({ type: 'CLEAR_FILTERS' })}
      />
      {state.loading && <LoadingSpinner />}
      {state.error && <ErrorMessage message={state.error} />}
      <BookGrid books={state.books} />
    </div>
  );
};
```

### 3. **Context API**
```typescript
// 创建 Context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查用户是否已登录
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const userData = await fetchUserProfile(token);
        setUser(userData);
      }
    } catch (error) {
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const { token, user: userData } = await response.json();
        localStorage.setItem('authToken', token);
        setUser(userData);
      } else {
        throw new Error('登录失败');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
      } else {
        throw new Error('更新资料失败');
      }
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    updateProfile,
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 使用 Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## 🚀 高级状态管理

### 1. **自定义 Hooks**
```typescript
// 数据获取 Hook
export const useData = <T>(
  url: string,
  options: {
    dependencies?: any[];
    transform?: (data: any) => T;
    onError?: (error: Error) => void;
  } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(url);
      if (response.ok) {
        const rawData = await response.json();
        const transformedData = options.transform ? options.transform(rawData) : rawData;
        setData(transformedData);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('未知错误');
      setError(error);
      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [url, options.transform, options.onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...(options.dependencies || [])]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

// 表单状态 Hook
export const useForm = <T extends Record<string, any>>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = useCallback((key: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [key]: value }));
    // 清除该字段的错误
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  }, [errors]);

  const setError = useCallback((key: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [key]: error }));
  }, []);

  const setTouchedField = useCallback((key: keyof T) => {
    setTouched(prev => ({ ...prev, [key]: true }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const validate = useCallback((validationSchema: ValidationSchema<T>) => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    
    Object.keys(validationSchema).forEach((key) => {
      const fieldKey = key as keyof T;
      const value = values[fieldKey];
      const rules = validationSchema[fieldKey];
      
      if (rules.required && !value) {
        newErrors[fieldKey] = `${key} 是必填项`;
      } else if (rules.minLength && value && value.length < rules.minLength) {
        newErrors[fieldKey] = `${key} 最少需要 ${rules.minLength} 个字符`;
      } else if (rules.pattern && value && !rules.pattern.test(value)) {
        newErrors[fieldKey] = rules.message || `${key} 格式不正确`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values]);

  return {
    values,
    errors,
    touched,
    setValue,
    setError,
    setTouchedField,
    reset,
    validate,
  };
};
```

### 2. **状态持久化**
```typescript
// 本地存储 Hook
export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  options: {
    serializer?: (value: T) => string;
    deserializer?: (value: string) => T;
  } = {}
) => {
  const { serializer = JSON.stringify, deserializer = JSON.parse } = options;

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, serializer(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serializer, storedValue]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
};

// 会话存储 Hook
export const useSessionStorage = <T>(
  key: string,
  initialValue: T
) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
};
```

## 🔄 状态同步

### 1. **状态同步 Hook**
```typescript
// URL 状态同步
export const useUrlState = <T>(
  key: string,
  defaultValue: T,
  options: {
    replace?: boolean;
    parser?: (value: string) => T;
    serializer?: (value: T) => string;
  } = {}
) => {
  const { replace = true, parser = JSON.parse, serializer = JSON.stringify } = options;
  const location = useLocation();
  const navigate = useNavigate();

  const [state, setState] = useState<T>(() => {
    const searchParams = new URLSearchParams(location.search);
    const value = searchParams.get(key);
    return value ? parser(value) : defaultValue;
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (state !== defaultValue) {
      searchParams.set(key, serializer(state));
    } else {
      searchParams.delete(key);
    }
    
    const newSearch = searchParams.toString();
    const newUrl = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
    
    navigate(newUrl, { replace });
  }, [state, key, defaultValue, location.pathname, navigate, replace, serializer]);

  return [state, setState] as const;
};

// 跨组件状态同步
export const useSharedState = <T>(
  key: string,
  defaultValue: T
) => {
  const [state, setState] = useState<T>(defaultValue);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setState(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing shared state:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  const updateState = useCallback((newState: T | ((val: T) => T)) => {
    const valueToStore = newState instanceof Function ? newState(state) : newState;
    setState(valueToStore);
    
    // 通知其他标签页
    localStorage.setItem(key, JSON.stringify(valueToStore));
    localStorage.removeItem(key);
  }, [key, state]);

  return [state, updateState] as const;
};
```

### 2. **状态广播**
```typescript
// 事件总线
class EventBus {
  private events: Map<string, Set<Function>> = new Map();

  on(event: string, callback: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  emit(event: string, data?: any) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

const eventBus = new EventBus();

// 状态广播 Hook
export const useBroadcastState = <T>(
  key: string,
  defaultValue: T
) => {
  const [state, setState] = useState<T>(defaultValue);

  useEffect(() => {
    const handleStateChange = (data: T) => {
      setState(data);
    };

    eventBus.on(key, handleStateChange);
    return () => eventBus.off(key, handleStateChange);
  }, [key]);

  const broadcastState = useCallback((newState: T) => {
    setState(newState);
    eventBus.emit(key, newState);
  }, [key]);

  return [state, broadcastState] as const;
};
```

## 📊 状态监控和调试

### 1. **状态变化监控**
```typescript
// 状态监控 Hook
export const useStateMonitor = <T>(
  state: T,
  name: string,
  options: {
    logChanges?: boolean;
    logHistory?: boolean;
    maxHistory?: number;
  } = {}
) => {
  const { logChanges = true, logHistory = false, maxHistory = 10 } = options;
  const prevStateRef = useRef<T>(state);
  const historyRef = useRef<T[]>([]);

  useEffect(() => {
    if (logChanges && prevStateRef.current !== state) {
      console.log(`[${name}] State changed:`, {
        from: prevStateRef.current,
        to: state,
        timestamp: new Date().toISOString(),
      });
    }

    if (logHistory) {
      historyRef.current.push(state);
      if (historyRef.current.length > maxHistory) {
        historyRef.current.shift();
      }
    }

    prevStateRef.current = state;
  }, [state, name, logChanges, logHistory, maxHistory]);

  const getHistory = useCallback(() => {
    return [...historyRef.current];
  }, []);

  const clearHistory = useCallback(() => {
    historyRef.current = [];
  }, []);

  return { getHistory, clearHistory };
};
```

### 2. **状态调试工具**
```typescript
// 开发环境状态调试
export const useDebugState = <T>(
  state: T,
  name: string
) => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔍 ${name} State Debug`);
      console.log('Current State:', state);
      console.log('State Type:', typeof state);
      console.log('State Keys:', Object.keys(state as object));
      console.groupEnd();
    }
  }, [state, name]);
};

// 状态变化追踪
export const useStateTracker = <T>(
  state: T,
  name: string
) => {
  const prevStateRef = useRef<T>(state);
  const changeCountRef = useRef(0);

  useEffect(() => {
    if (prevStateRef.current !== state) {
      changeCountRef.current += 1;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 ${name} State Change #${changeCountRef.current}:`, {
          from: prevStateRef.current,
          to: state,
          changeCount: changeCountRef.current,
          timestamp: new Date().toISOString(),
        });
      }
    }
    
    prevStateRef.current = state;
  }, [state, name]);

  return changeCountRef.current;
};
```

## 🧪 状态管理测试

### 1. **Hook 测试**
```typescript
// useForm.test.ts
import { renderHook, act } from '@testing-library/react';
import { useForm } from './useForm';

describe('useForm', () => {
  const initialValues = {
    name: '',
    email: '',
    age: 0,
  };

  it('should initialize with initial values', () => {
    const { result } = renderHook(() => useForm(initialValues));
    
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  it('should update values correctly', () => {
    const { result } = renderHook(() => useForm(initialValues));
    
    act(() => {
      result.current.setValue('name', 'John Doe');
    });
    
    expect(result.current.values.name).toBe('John Doe');
  });

  it('should validate required fields', () => {
    const { result } = renderHook(() => useForm(initialValues));
    
    const validationSchema = {
      name: { required: true },
      email: { required: true },
    };
    
    act(() => {
      const isValid = result.current.validate(validationSchema);
      expect(isValid).toBe(false);
      expect(result.current.errors.name).toBe('name 是必填项');
      expect(result.current.errors.email).toBe('email 是必填项');
    });
  });
});
```

### 2. **状态集成测试**
```typescript
// BookList.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BookList } from './BookList';
import { BookProvider } from './BookProvider';

// Mock fetch
global.fetch = jest.fn();

const renderWithProvider = (component: React.ReactElement) => {
  return render(<BookProvider>{component}</BookProvider>);
};

describe('BookList Integration', () => {
  it('should fetch and display books', async () => {
    const mockBooks = [
      { id: '1', title: 'Book 1', author: 'Author 1' },
      { id: '2', title: 'Book 2', author: 'Author 2' },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBooks,
    });

    renderWithProvider(<BookList />);

    expect(screen.getByText('加载中...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Book 1')).toBeInTheDocument();
      expect(screen.getByText('Book 2')).toBeInTheDocument();
    });
  });

  it('should update filters and refetch data', async () => {
    const mockBooks = [{ id: '1', title: 'Filtered Book', author: 'Author' }];

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBooks,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBooks,
      });

    renderWithProvider(<BookList />);

    const searchInput = screen.getByPlaceholderText('搜索图书...');
    fireEvent.change(searchInput, { target: { value: 'Filtered' } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});
```

## 📝 总结

优秀的状态管理系统应该具备：

- 🏗️ **清晰架构** - 分层设计、状态分类
- 🔧 **功能完整** - 本地状态、全局状态、服务器状态
- 🚀 **性能优化** - 避免重渲染、状态持久化
- 🔄 **状态同步** - URL同步、跨组件同步、状态广播
- 📊 **监控调试** - 状态变化监控、调试工具
- 🧪 **测试覆盖** - Hook测试、集成测试

通过实现这些功能，你可以构建出功能强大、性能优异的状态管理系统！
