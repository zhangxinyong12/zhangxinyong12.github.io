---
home: true
heroImage: /img/mine.jpg
heroImageAlt: 全栈图书管理系统
heroText: 全栈图书管理系统
tagline: 基于 UmiJS + NestJS 的现代化图书管理解决方案
actionText: 开始学习 →
actionLink: /book-lesson/frontend/
features:
  - title: 🎯 全栈架构
    details: 前端使用 UmiJS，后端使用 NestJS，前后端分离的现代化架构
  - title: 🔐 权限管理
    details: 多角色权限控制，支持图书馆管理员、普通用户等不同权限级别
  - title: 📚 图书管理
    details: 完整的图书 CRUD 操作，支持分类、搜索、借阅等核心功能
  - title: 🚀 技术栈
    details: TypeScript + UmiJS + NestJS + MySQL，企业级开发标准
  - title: 📱 响应式设计
    details: 支持多端访问，PC、平板、手机完美适配
  - title: 🧪 测试覆盖
    details: 完整的单元测试和集成测试，确保代码质量
footer: 让全栈开发变得简单高效 ✨
sidebar: auto
displayAllHeaders: true
---

## 🌟 项目概述

**全栈图书管理系统** 是一个基于现代技术栈构建的企业级应用，旨在展示如何构建一个完整的前后端分离项目。通过这个项目，你将学习到：

- **前端开发**：UmiJS 框架的使用，组件化开发，状态管理
- **后端开发**：NestJS 框架，RESTful API 设计，数据库操作
- **系统架构**：前后端分离，权限控制，数据安全
- **部署运维**：Docker 容器化，CI/CD 流程，性能优化

## 🗂️ 学习路线

### 🎨 前端开发 (UmiJS)

- **[基础概念](./frontend/)** - UmiJS 框架介绍与项目搭建
- **[组件开发](./frontend/components.md)** - 可复用组件设计与开发
- **[状态管理](./frontend/state-management.md)** - 全局状态管理与数据流
- **[路由系统](./frontend/routing.md)** - 动态路由与权限控制
- **[UI 组件库](./frontend/ui-components.md)** - Ant Design 集成与自定义

### 🖥️ 后端开发 (NestJS)

- **[框架介绍](./backend/)** - NestJS 架构设计与核心概念
- **[模块设计](./backend/modules.md)** - 模块化架构与依赖注入
- **[数据库操作](./backend/database.md)** - TypeORM 集成与数据模型
- **[权限控制](./backend/auth.md)** - JWT 认证与角色权限管理
- **[API 设计](./backend/api-design.md)** - RESTful API 规范与实现

### 🚀 部署与运维

- **[Docker 部署](./deployment/)** - 容器化部署与编排
- **[CI/CD 流程](./deployment/ci-cd.md)** - 自动化构建与部署
- **[性能优化](./deployment/optimization.md)** - 系统性能调优与监控

## 🎯 核心功能

### 📚 图书管理

- 图书信息录入、编辑、删除
- 图书分类管理
- 图书搜索与筛选
- 图书库存管理

### 👥 用户管理

- 用户注册、登录、注销
- 用户信息管理
- 角色权限分配
- 用户行为日志

### 🔐 权限控制

- 基于角色的访问控制 (RBAC)
- 功能权限管理
- 数据权限控制
- 操作审计日志

### 📖 借阅管理

- 图书借阅与归还
- 借阅历史记录
- 逾期提醒
- 借阅统计报表

## 🛠️ 技术栈

### 前端技术

- **框架**: UmiJS 4.x
- **语言**: TypeScript
- **UI 库**: Ant Design 5.x
- **状态管理**: @umijs/max
- **构建工具**: Vite
- **代码规范**: ESLint + Prettier

### 后端技术

- **框架**: NestJS 10.x
- **语言**: TypeScript
- **数据库**: MySQL 8.0
- **ORM**: TypeORM
- **认证**: JWT + Passport
- **验证**: class-validator
- **文档**: Swagger/OpenAPI

### 开发工具

- **版本控制**: Git
- **包管理**: pnpm
- **代码质量**: Husky + lint-staged
- **测试框架**: Jest + Supertest
- **容器化**: Docker + Docker Compose

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- MySQL >= 8.0
- Redis >= 6.0 (可选)

### 本地开发

```bash
# 克隆项目
git clone <repository-url>
cd book-lesson

# 安装依赖
pnpm install

# 启动前端开发服务器
cd frontend
pnpm dev

# 启动后端开发服务器
cd backend
pnpm start:dev
```

### 在线演示

🌐 **[系统演示](https://book-lesson-demo.example.com)**

## 📖 学习理念

> **全栈思维** - 前后端通吃，成为真正的全栈工程师  
> **实战驱动** - 通过真实项目学习，理论结合实践  
> **最佳实践** - 学习企业级开发标准，提升代码质量

## 🤝 交流互动

- 📧 有问题？欢迎在 GitHub 上提 Issue
- 💬 有想法？欢迎提交 Pull Request
- ⭐ 觉得不错？给个 Star 支持一下

---

<div align="center">

**让全栈开发变得简单高效** ✨

_从前端到后端，从开发到部署_ 🚀

</div>
