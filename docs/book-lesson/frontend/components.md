# 🧩 组件开发

> **可复用组件设计与开发**  
> 学习如何设计和开发高质量的 React 组件，掌握组件化开发的最佳实践

## 📚 学习内容

- [**基础概念**](./index.md) - UmiJS 框架介绍与项目搭建
- [**组件开发**](./components.md) - 可复用组件设计与开发
- [**状态管理**](./state-management.md) - 全局状态管理与数据流
- [**路由系统**](./routing.md) - 动态路由与权限控制
- [**UI 组件库**](./ui-components.md) - Ant Design 集成与自定义

## 🎯 组件设计原则

### 1. 单一职责原则

每个组件应该只负责一个功能，保持组件的简洁性和可维护性：

```typescript
// ❌ 不好的设计：组件承担多个职责
const BookManagement = () => {
  // 图书列表、搜索、分页、编辑、删除等都在一个组件中
  return <div>{/* 太多功能混在一起 */}</div>;
};

// ✅ 好的设计：职责分离
const BookList = () => {
  // 只负责图书列表展示
  return <div>图书列表</div>;
};

const BookSearch = () => {
  // 只负责搜索功能
  return <div>搜索组件</div>;
};

const BookPagination = () => {
  // 只负责分页功能
  return <div>分页组件</div>;
};
```

### 2. 可复用性

组件应该能够在不同场景下复用：

```typescript
// 通用的表格组件
interface DataTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  loading?: boolean;
  pagination?: PaginationConfig;
  onPageChange?: (page: number, pageSize: number) => void;
  onRowSelect?: (selectedRows: T[]) => void;
}

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  onPageChange,
  onRowSelect,
}: DataTableProps<T>) => {
  // 组件实现
  return (
    <Table
      dataSource={data}
      columns={columns}
      loading={loading}
      pagination={pagination}
      onChange={(pagination) => {
        onPageChange?.(pagination.current || 1, pagination.pageSize || 10);
      }}
      rowSelection={{
        onChange: (_, selectedRows) => {
          onRowSelect?.(selectedRows);
        },
      }}
    />
  );
};
```

### 3. 可配置性

组件应该通过 props 进行配置，而不是硬编码：

```typescript
// 可配置的按钮组件
interface ActionButtonProps {
  type?: "primary" | "secondary" | "danger";
  size?: "small" | "middle" | "large";
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  type = "primary",
  size = "middle",
  icon,
  loading = false,
  disabled = false,
  onClick,
  children,
}) => {
  return (
    <Button
      type={type}
      size={size}
      icon={icon}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};
```

## 🏗️ 组件架构设计

### 1. 原子设计系统

采用原子设计理念，从原子到分子的层次化组件设计：

```typescript
// atoms/Button.tsx - 原子组件
export const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

// molecules/ButtonGroup.tsx - 分子组件
interface ButtonGroupProps {
  children: React.ReactNode;
  direction?: "horizontal" | "vertical";
  spacing?: number;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  direction = "horizontal",
  spacing = 8,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction === "horizontal" ? "row" : "column",
        gap: spacing,
      }}
    >
      {children}
    </div>
  );
};

// organisms/BookActions.tsx - 有机体组件
export const BookActions: React.FC<{ bookId: number }> = ({ bookId }) => {
  return (
    <ButtonGroup>
      <Button>查看详情</Button>
      <Button>编辑</Button>
      <Button type="danger">删除</Button>
    </ButtonGroup>
  );
};
```

### 2. 组件组合模式

使用组合模式来构建复杂的组件：

```typescript
// 使用组合模式构建表单
interface FormProps {
  children: React.ReactNode;
  onSubmit: (values: any) => void;
  initialValues?: Record<string, any>;
}

const Form: React.FC<FormProps> & {
  Item: typeof FormItem;
  Submit: typeof SubmitButton;
} = ({ children, onSubmit, initialValues }) => {
  // 表单逻辑
  return <form onSubmit={handleSubmit}>{children}</form>;
};

const FormItem: React.FC<{
  name: string;
  label: string;
  children: React.ReactNode;
}> = ({ name, label, children }) => {
  return (
    <div className="form-item">
      <label>{label}</label>
      {children}
    </div>
  );
};

const SubmitButton: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <button type="submit">{children}</button>;
};

Form.Item = FormItem;
Form.Submit = SubmitButton;

// 使用组合模式
const BookForm = () => {
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Item name="title" label="图书标题">
        <Input />
      </Form.Item>
      <Form.Item name="author" label="作者">
        <Input />
      </Form.Item>
      <Form.Submit>保存</Form.Submit>
    </Form>
  );
};
```

## 🔧 组件开发实践

### 1. 图书卡片组件

```typescript
// components/BookCard/BookCard.tsx
import React from "react";
import { Card, Tag, Button, Space } from "antd";
import {
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { BookCardProps } from "./types";
import { useBookCard } from "./hooks/useBookCard";
import "./BookCard.css";

export const BookCard: React.FC<BookCardProps> = ({
  book,
  showActions = true,
  onEdit,
  onDelete,
  onBorrow,
}) => {
  const { handleEdit, handleDelete, handleBorrow, isBorrowed } = useBookCard({
    book,
    onEdit,
    onDelete,
    onBorrow,
  });

  return (
    <Card
      className="book-card"
      hoverable
      cover={
        <div className="book-cover">
          <img
            alt={book.title}
            src={book.coverUrl || "/default-book-cover.png"}
            onError={(e) => {
              e.currentTarget.src = "/default-book-cover.png";
            }}
          />
          {book.quantity === 0 && (
            <div className="book-unavailable">
              <Tag color="red">已借完</Tag>
            </div>
          )}
        </div>
      }
      actions={
        showActions
          ? [
              <Button
                key="edit"
                type="link"
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                编辑
              </Button>,
              <Button
                key="delete"
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={handleDelete}
              >
                删除
              </Button>,
              <Button
                key="borrow"
                type="primary"
                disabled={isBorrowed || book.quantity === 0}
                onClick={handleBorrow}
              >
                {isBorrowed ? "已借阅" : "借阅"}
              </Button>,
            ]
          : undefined
      }
    >
      <Card.Meta
        title={
          <div className="book-title">
            <BookOutlined className="book-icon" />
            {book.title}
          </div>
        }
        description={
          <div className="book-info">
            <div className="book-author">
              <UserOutlined /> {book.author}
            </div>
            <div className="book-category">
              <Tag color="blue">{book.category}</Tag>
            </div>
            <div className="book-publish-date">
              <CalendarOutlined /> {book.publishDate}
            </div>
            <div className="book-status">
              库存: {book.available}/{book.quantity}
            </div>
          </div>
        }
      />
    </Card>
  );
};
```

### 2. 组件类型定义

```typescript
// components/BookCard/types.ts
export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  description?: string;
  isbn: string;
  publishDate: string;
  price?: number;
  quantity: number;
  available: number;
  coverUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookCardProps {
  book: Book;
  showActions?: boolean;
  onEdit?: (book: Book) => void;
  onDelete?: (bookId: number) => void;
  onBorrow?: (bookId: number) => void;
}
```

### 3. 自定义 Hook

```typescript
// components/BookCard/hooks/useBookCard.ts
import { useCallback, useState } from "react";
import { message, Modal } from "antd";
import { BookCardProps } from "../types";

export const useBookCard = ({
  book,
  onEdit,
  onDelete,
  onBorrow,
}: BookCardProps) => {
  const [isBorrowed, setIsBorrowed] = useState(false);

  const handleEdit = useCallback(() => {
    onEdit?.(book);
  }, [book, onEdit]);

  const handleDelete = useCallback(() => {
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除《${book.title}》吗？此操作不可恢复。`,
      okText: "确认",
      cancelText: "取消",
      onOk: () => {
        onDelete?.(book.id);
        message.success("删除成功");
      },
    });
  }, [book, onDelete]);

  const handleBorrow = useCallback(() => {
    if (book.available === 0) {
      message.warning("图书库存不足");
      return;
    }

    Modal.confirm({
      title: "确认借阅",
      content: `确定要借阅《${book.title}》吗？`,
      okText: "确认",
      cancelText: "取消",
      onOk: () => {
        onBorrow?.(book.id);
        setIsBorrowed(true);
        message.success("借阅成功");
      },
    });
  }, [book, onBorrow]);

  return {
    handleEdit,
    handleDelete,
    handleBorrow,
    isBorrowed,
  };
};
```

### 4. 组件样式

```css
/* components/BookCard/BookCard.css */
.book-card {
  width: 100%;
  max-width: 300px;
  transition: all 0.3s ease;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.book-cover {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.book-card:hover .book-cover img {
  transform: scale(1.05);
}

.book-unavailable {
  position: absolute;
  top: 10px;
  right: 10px;
}

.book-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333;
}

.book-icon {
  color: #1890ff;
}

.book-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.book-author,
.book-publish-date {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 14px;
}

.book-category {
  margin: 8px 0;
}

.book-status {
  font-weight: 600;
  color: #52c41a;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .book-card {
    max-width: 100%;
  }

  .book-cover {
    height: 150px;
  }
}
```

## 📱 响应式组件设计

### 1. 响应式 Hook

```typescript
// hooks/useResponsive.ts
import { useState, useEffect } from "react";

interface ResponsiveConfig {
  mobile: number;
  tablet: number;
  desktop: number;
}

const defaultConfig: ResponsiveConfig = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
};

export const useResponsive = (config: ResponsiveConfig = defaultConfig) => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenSize({ width, height });

      if (width <= config.mobile) {
        setDeviceType("mobile");
      } else if (width <= config.tablet) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [config]);

  return {
    screenSize,
    deviceType,
    isMobile: deviceType === "mobile",
    isTablet: deviceType === "tablet",
    isDesktop: deviceType === "desktop",
  };
};
```

### 2. 响应式组件

```typescript
// components/ResponsiveLayout/ResponsiveLayout.tsx
import React from "react";
import { useResponsive } from "@/hooks/useResponsive";

interface ResponsiveLayoutProps {
  mobile: React.ReactNode;
  tablet?: React.ReactNode;
  desktop: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  mobile,
  tablet,
  desktop,
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile) {
    return <>{mobile}</>;
  }

  if (isTablet && tablet) {
    return <>{tablet}</>;
  }

  return <>{desktop}</>;
};

// 使用示例
const BookList = () => {
  return (
    <ResponsiveLayout
      mobile={<MobileBookList />}
      tablet={<TabletBookList />}
      desktop={<DesktopBookList />}
    />
  );
};
```

## 🧪 组件测试

### 1. 单元测试

```typescript
// components/BookCard/__tests__/BookCard.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookCard } from "../BookCard";

const mockBook = {
  id: 1,
  title: "测试图书",
  author: "测试作者",
  category: "技术",
  isbn: "1234567890123",
  publishDate: "2024-01-01",
  quantity: 10,
  available: 8,
  coverUrl: "/test-cover.jpg",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("BookCard", () => {
  it("应该正确渲染图书信息", () => {
    render(<BookCard book={mockBook} />);

    expect(screen.getByText("测试图书")).toBeInTheDocument();
    expect(screen.getByText("测试作者")).toBeInTheDocument();
    expect(screen.getByText("技术")).toBeInTheDocument();
    expect(screen.getByText("库存: 8/10")).toBeInTheDocument();
  });

  it("应该显示借阅按钮", () => {
    render(<BookCard book={mockBook} />);

    expect(screen.getByText("借阅")).toBeInTheDocument();
  });

  it("当库存为0时应该禁用借阅按钮", () => {
    const bookWithNoStock = { ...mockBook, available: 0 };
    render(<BookCard book={bookWithNoStock} />);

    const borrowButton = screen.getByText("借阅");
    expect(borrowButton).toBeDisabled();
  });

  it("应该调用编辑回调", () => {
    const mockOnEdit = jest.fn();
    render(<BookCard book={mockBook} onEdit={mockOnEdit} />);

    fireEvent.click(screen.getByText("编辑"));
    expect(mockOnEdit).toHaveBeenCalledWith(mockBook);
  });
});
```

### 2. 快照测试

```typescript
// components/BookCard/__tests__/BookCard.snapshot.test.tsx
import React from "react";
import { render } from "@testing-library/react";
import { BookCard } from "../BookCard";

describe("BookCard Snapshot", () => {
  it("应该匹配快照", () => {
    const mockBook = {
      id: 1,
      title: "测试图书",
      author: "测试作者",
      category: "技术",
      isbn: "1234567890123",
      publishDate: "2024-01-01",
      quantity: 10,
      available: 8,
      coverUrl: "/test-cover.jpg",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };

    const { container } = render(<BookCard book={mockBook} />);
    expect(container).toMatchSnapshot();
  });
});
```

## 📖 下一步学习

现在你已经了解了组件开发的基础知识，接下来可以学习：

1. **[状态管理](./state-management.md)** - 掌握全局状态管理策略
2. **[路由系统](./routing.md)** - 深入理解动态路由和权限控制
3. **[UI 组件库](./ui-components.md)** - 集成 Ant Design 并自定义组件

---

<div align="center">

**让组件开发变得简单高效** ✨

_从原子到分子，从简单到复杂_ 🚀

</div>
