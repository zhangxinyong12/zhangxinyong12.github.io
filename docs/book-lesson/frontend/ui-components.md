# 🎨 UI 组件系统

> **优秀的 UI 组件系统是构建一致性和可维护性前端应用的基础**

## 📚 UI 组件概述

### 什么是 UI 组件？
UI 组件是前端应用中可复用的用户界面元素，它们封装了特定的功能和样式，可以在不同页面中重复使用。

### 组件系统的优势
- **一致性** - 统一的视觉风格和交互体验
- **可复用性** - 减少重复代码，提高开发效率
- **可维护性** - 集中管理样式和逻辑
- **可测试性** - 组件可以独立测试

## 🏗️ 组件架构设计

### 1. **组件层次结构**
```
┌─────────────────────────────────────┐
│            Page Components          │  ← 页面组件
├─────────────────────────────────────┤
│         Layout Components           │  ← 布局组件
├─────────────────────────────────────┤
│         Feature Components          │  ← 功能组件
├─────────────────────────────────────┤
│         Base Components             │  ← 基础组件
└─────────────────────────────────────┘
```

### 2. **组件分类**
```typescript
// 组件类型定义
interface ComponentCategory {
  // 基础组件
  base: {
    Button: React.ComponentType<ButtonProps>;
    Input: React.ComponentType<InputProps>;
    Modal: React.ComponentType<ModalProps>;
    Table: React.ComponentType<TableProps>;
  };
  
  // 功能组件
  feature: {
    BookCard: React.ComponentType<BookCardProps>;
    SearchBar: React.ComponentType<SearchBarProps>;
    Pagination: React.ComponentType<PaginationProps>;
    FilterPanel: React.ComponentType<FilterPanelProps>;
  };
  
  // 布局组件
  layout: {
    Header: React.ComponentType<HeaderProps>;
    Sidebar: React.ComponentType<SidebarProps>;
    Footer: React.ComponentType<FooterProps>;
    Container: React.ComponentType<ContainerProps>;
  };
}
```

## 🔧 基础组件实现

### 1. **按钮组件**
```typescript
// Button.tsx
import React from 'react';
import classNames from 'classnames';
import './Button.css';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  onClick,
  className,
  type = 'button',
  ...props
}) => {
  const buttonClasses = classNames(
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    {
      'btn--disabled': disabled,
      'btn--loading': loading,
      'btn--icon-only': icon && !children,
    },
    className
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && onClick) {
      onClick(event);
    }
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn__spinner" />}
      {iconPosition === 'left' && icon}
      {children && <span className="btn__text">{children}</span>}
      {iconPosition === 'right' && icon}
    </button>
  );
};
```

### 2. **输入框组件**
```typescript
// Input.tsx
import React, { forwardRef, useState } from 'react';
import classNames from 'classnames';
import './Input.css';

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  value,
  defaultValue,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  clearable = false,
  prefix,
  suffix,
  onChange,
  className,
  size = 'medium',
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const currentValue = value !== undefined ? value : internalValue;

  const inputClasses = classNames(
    'input',
    `input--${size}`,
    {
      'input--error': error,
      'input--disabled': disabled,
      'input--with-prefix': prefix,
      'input--with-suffix': suffix || clearable,
    },
    className
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    
    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue, event);
  };

  return (
    <div className="input-wrapper">
      {label && (
        <label className="input__label">
          {label}
          {required && <span className="input__required">*</span>}
        </label>
      )}
      
      <div className={inputClasses}>
        {prefix && <span className="input__prefix">{prefix}</span>}
        
        <input
          ref={ref}
          type={type}
          value={currentValue}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onChange={handleChange}
          className="input__field"
          {...props}
        />
        
        {suffix && <span className="input__suffix">{suffix}</span>}
      </div>
      
      {error && <div className="input__error">{error}</div>}
    </div>
  );
});

Input.displayName = 'Input';
```

## 🚀 功能组件实现

### 1. **图书卡片组件**
```typescript
// BookCard.tsx
import React from 'react';
import classNames from 'classnames';
import { Button } from '../base/Button';
import './BookCard.css';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  description?: string;
  category: string;
  publishDate: string;
  isAvailable: boolean;
  rating?: number;
}

export interface BookCardProps {
  book: Book;
  onBorrow?: (bookId: string) => void;
  onView?: (bookId: string) => void;
  onEdit?: (bookId: string) => void;
  onDelete?: (bookId: string) => void;
  showActions?: boolean;
  className?: string;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onBorrow,
  onView,
  onEdit,
  onDelete,
  showActions = true,
  className,
}) => {
  const handleBorrow = () => {
    onBorrow?.(book.id);
  };

  const handleView = () => {
    onView?.(book.id);
  };

  const cardClasses = classNames(
    'book-card',
    {
      'book-card--unavailable': !book.isAvailable,
    },
    className
  );

  return (
    <div className={cardClasses}>
      <div className="book-card__cover">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={`${book.title} 封面`}
            className="book-card__image"
          />
        ) : (
          <div className="book-card__placeholder">
            <span>📚</span>
          </div>
        )}
        
        {!book.isAvailable && (
          <div className="book-card__status">
            <span>已借出</span>
          </div>
        )}
      </div>
      
      <div className="book-card__content">
        <h3 className="book-card__title" title={book.title}>
          {book.title}
        </h3>
        
        <p className="book-card__author" title={book.author}>
          作者: {book.author}
        </p>
        
        <p className="book-card__category">
          分类: {book.category}
        </p>
        
        {book.description && (
          <p className="book-card__description" title={book.description}>
            {book.description.length > 100
              ? `${book.description.substring(0, 100)}...`
              : book.description}
          </p>
        )}
        
        <p className="book-card__publish-date">
          出版日期: {new Date(book.publishDate).toLocaleDateString()}
        </p>
      </div>
      
      {showActions && (
        <div className="book-card__actions">
          <Button
            variant="primary"
            size="small"
            onClick={handleView}
            className="book-card__action"
          >
            查看详情
          </Button>
          
          {book.isAvailable && onBorrow && (
            <Button
              variant="secondary"
              size="small"
              onClick={handleBorrow}
              className="book-card__action"
            >
              借阅
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
```

### 2. **搜索栏组件**
```typescript
// SearchBar.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '../base/Input';
import { Button } from '../base/Button';
import './SearchBar.css';

export interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  showClearButton?: boolean;
  showSearchButton?: boolean;
  debounceMs?: number;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '搜索...',
  defaultValue = '',
  onSearch,
  onClear,
  showClearButton = true,
  showSearchButton = true,
  debounceMs = 300,
  className,
  size = 'medium',
}) => {
  const [query, setQuery] = useState(defaultValue);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback((searchQuery: string) => {
    setIsSearching(true);
    onSearch?.(searchQuery);
    
    // 模拟搜索完成
    setTimeout(() => setIsSearching(false), 1000);
  }, [onSearch]);

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    
    // 清除之前的定时器
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // 设置新的定时器
    if (value.trim()) {
      debounceTimeoutRef.current = setTimeout(() => {
        handleSearch(value.trim());
      }, debounceMs);
    }
  }, [debounceMs, handleSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onClear?.();
    inputRef.current?.focus();
  }, [onClear]);

  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim()) {
      handleSearch(query.trim());
    }
  }, [query, handleSearch]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form className={`search-bar search-bar--${size} ${className || ''}`} onSubmit={handleSubmit}>
      <div className="search-bar__input-wrapper">
        <Input
          ref={inputRef}
          type="search"
          value={query}
          placeholder={placeholder}
          onChange={handleInputChange}
          prefix={<span className="search-bar__icon">🔍</span>}
          clearable={showClearButton && !!query}
          onClear={handleClear}
          size={size}
          className="search-bar__input"
        />
      </div>
      
      {showSearchButton && (
        <Button
          type="submit"
          variant="primary"
          size={size}
          disabled={!query.trim()}
          loading={isSearching}
          className="search-bar__button"
        >
          {isSearching ? '搜索中...' : '搜索'}
        </Button>
      )}
    </form>
  );
};
```

## 🎨 样式系统

### 1. **CSS 变量系统**
```css
/* variables.css */
:root {
  /* 颜色系统 */
  --color-primary: #007bff;
  --color-primary-light: #3391ff;
  --color-primary-dark: #0056b3;
  
  --color-secondary: #6c757d;
  --color-secondary-light: #8a9299;
  --color-secondary-dark: #495057;
  
  --color-success: #28a745;
  --color-warning: #ffc107;
  --color-danger: #dc3545;
  --color-info: #17a2b8;
  
  --color-white: #ffffff;
  --color-gray-100: #f8f9fa;
  --color-gray-200: #e9ecef;
  --color-gray-300: #dee2e6;
  --color-gray-400: #ced4da;
  --color-gray-500: #adb5bd;
  --color-gray-600: #6c757d;
  --color-gray-700: #495057;
  --color-gray-800: #343a40;
  --color-gray-900: #212529;
  --color-black: #000000;
  
  /* 字体系统 */
  --font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-family-monospace: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-3xl: 30px;
  
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* 间距系统 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;
  
  /* 圆角系统 */
  --border-radius-sm: 4px;
  --border-radius-md: 6px;
  --border-radius-lg: 8px;
  --border-radius-xl: 12px;
  --border-radius-full: 9999px;
  
  /* 阴影系统 */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  /* 过渡系统 */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;
  
  /* 断点系统 */
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
  --breakpoint-2xl: 1400px;
}
```

## 🧪 组件测试

### 1. **组件单元测试**
```typescript
// Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn', 'btn--primary', 'btn--medium');
  });

  it('should render with custom variant and size', () => {
    render(
      <Button variant="danger" size="large">
        Delete
      </Button>
    );
    
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toHaveClass('btn--danger', 'btn--large');
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not handle click when disabled', () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Click me
      </Button>
    );
    
    const button = screen.getByRole('button', { name: 'Click me' });
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });
});
```

## 📝 总结

优秀的 UI 组件系统应该具备：

- 🏗️ **清晰架构** - 分层设计、组件分类
- 🔧 **功能完整** - 基础组件、功能组件、布局组件
- 🎨 **样式系统** - CSS变量、响应式设计、工具类
- 🚀 **性能优化** - 懒加载、代码分割、缓存
- 🧪 **测试覆盖** - 单元测试、集成测试、视觉回归测试
- 📚 **文档完善** - 组件文档、使用示例、最佳实践

通过实现这些功能，你可以构建出功能强大、样式一致、易于维护的 UI 组件系统！
