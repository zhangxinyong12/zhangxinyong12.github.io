# 第二阶段：Fiber 架构深入 ✅

> 深入理解 React 18 的核心架构——Fiber 系统，掌握并发渲染的实现原理

## 📚 学习目标

通过本阶段学习，你将掌握：

- Fiber 节点的数据结构和属性
- 双缓冲树机制的工作原理
- 工作循环 (Work Loop) 的执行流程
- 优先级调度的实现策略

## 🏗️ Fiber 架构概述

### 1. 为什么需要 Fiber？

在 React 16 之前，React 使用递归的方式处理组件树，存在以下问题：

- **无法中断**：一旦开始渲染，必须完成整个组件树
- **阻塞主线程**：长时间的计算会阻塞用户交互
- **优先级无法控制**：所有更新都是同步的

Fiber 架构解决了这些问题：

- **可中断**：渲染过程可以被中断和恢复
- **优先级调度**：根据任务优先级进行渲染
- **并发渲染**：支持多个渲染任务同时进行

### 2. Fiber 的核心思想

Fiber 将渲染工作分解为小的、可中断的工作单元：

```javascript
// Fiber 工作单元的概念
const fiber = {
  // 工作单元信息
  type: Component,
  key: "unique-key",

  // 渲染状态
  stateNode: DOMNode,
  memoizedState: state,

  // 工作进度
  flags: Update | Placement | Deletion,
  lanes: priority,

  // 树结构
  return: parentFiber,
  child: firstChildFiber,
  sibling: nextSiblingFiber,
};
```

## 🧩 Fiber 节点结构

### 1. Fiber 节点的完整结构

```javascript
// packages/react-reconciler/src/ReactFiber.js
function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode
) {
  // 标记节点类型
  this.tag = tag;
  this.key = key;
  this.elementType = null;
  this.type = null;
  this.stateNode = null;

  // 树结构指针
  this.return = null; // 父节点
  this.child = null; // 第一个子节点
  this.sibling = null; // 下一个兄弟节点
  this.index = 0; // 在兄弟节点中的索引

  // 工作进度
  this.ref = null; // ref 引用
  this.pendingProps = pendingProps; // 新的 props
  this.memoizedProps = null; // 已处理的 props
  this.memoizedState = null; // 已处理的状态
  this.updateQueue = null; // 更新队列

  // 副作用标记
  this.flags = NoFlags; // 副作用标记
  this.subtreeFlags = NoFlags; // 子树副作用标记
  this.deletions = null; // 待删除的节点

  // 优先级和调度
  this.lanes = NoLanes; // 优先级
  this.childLanes = NoLanes; // 子节点优先级

  // 双缓冲树指针
  this.alternate = null; // 对应的另一个树节点
}
```

### 2. Fiber 节点类型 (WorkTag)

```javascript
// packages/react-reconciler/src/ReactWorkTags.js
export const FunctionComponent = 0; // 函数组件
export const ClassComponent = 1; // 类组件
export const IndeterminateComponent = 2; // 未确定的组件类型
export const HostRoot = 3; // 根节点
export const HostPortal = 4; // Portal 节点
export const HostComponent = 5; // 原生 DOM 元素
export const HostText = 6; // 文本节点
export const Fragment = 7; // Fragment
export const Mode = 8; // StrictMode
export const ContextConsumer = 9; // Context 消费者
export const ContextProvider = 10; // Context 提供者
export const ForwardRef = 11; // ForwardRef
export const Profiler = 12; // Profiler
export const SuspenseComponent = 13; // Suspense 组件
export const MemoComponent = 14; // Memo 组件
export const SimpleMemoComponent = 15; // 简单 Memo 组件
export const LazyComponent = 16; // Lazy 组件
export const IncompleteClassComponent = 17; // 未完成的类组件
export const DehydratedSuspenseComponent = 18; // 脱水 Suspense 组件
export const SuspenseListComponent = 19; // SuspenseList 组件
export const ScopeComponent = 21; // Scope 组件
export const OffscreenComponent = 22; // Offscreen 组件
export const LegacyHiddenComponent = 23; // LegacyHidden 组件
export const CacheComponent = 24; // Cache 组件
export const TracingMarkerComponent = 25; // TracingMarker 组件
export const HostHoistable = 26; // 可提升的主机组件
export const HostSingleton = 27; // 单例主机组件
export const HostSuspense = 28; // 主机 Suspense 组件
export const HostResource = 29; // 主机资源组件
export const HostModule = 30; // 主机模块组件
export const FundamentalComponent = 31; // 基础组件
export const ResponseMode = 32; // 响应模式组件
export const ReactLazyComponent = 33; // React Lazy 组件
export const IncompleteFunctionComponent = 34; // 未完成的函数组件
export const SuspenseListComponent = 35; // SuspenseList 组件
export const HostInspection = 36; // 主机检查组件
export const HostResourceRoot = 37; // 主机资源根组件
export const HostTracingMarker = 38; // 主机追踪标记组件
export const HostRootSuspense = 39; // 主机根 Suspense 组件
export const HostRootCache = 40; // 主机根缓存组件
export const HostRootCacheProvider = 41; // 主机根缓存提供者组件
export const HostRootCacheConsumer = 42; // 主机根缓存消费者组件
export const HostRootCacheBoundary = 43; // 主机根缓存边界组件
export const HostRootCacheSuspense = 44; // 主机根缓存 Suspense 组件
export const HostRootCacheList = 45; // 主机根缓存列表组件
export const HostRootCacheListSuspense = 46; // 主机根缓存列表 Suspense 组件
export const HostRootCacheListCache = 47; // 主机根缓存列表缓存组件
export const HostRootCacheListCacheSuspense = 48; // 主机根缓存列表缓存 Suspense 组件
export const HostRootCacheListCacheList = 49; // 主机根缓存列表缓存列表组件
export const HostRootCacheListCacheListSuspense = 50; // 主机根缓存列表缓存列表 Suspense 组件
```

### 3. 副作用标记 (Flags)

```javascript
// packages/react-reconciler/src/ReactFiberFlags.js
export const NoFlags = 0b0000000000000000000000000000000;
export const PerformedWork = 0b0000000000000000000000000000001;

// 插入标记
export const Placement = 0b0000000000000000000000000000010;
export const Update = 0b0000000000000000000000000000100;
export const Deletion = 0b0000000000000000000000000001000;

// 移动标记
export const ChildDeletion = 0b0000000000000000000000000010000;
export const ContentReset = 0b0000000000000000000000000100000;
export const Callback = 0b0000000000000000000000001000000;
export const DidCapture = 0b0000000000000000000000010000000;
export const ForceClientRender = 0b0000000000000000000000100000000;
export const Ref = 0b0000000000000000000001000000000;
export const Snapshot = 0b0000000000000000000010000000000;
export const TextUpdate = 0b0000000000000000000100000000000;
export const Visibility = 0b0000000000000000001000000000000;

// 生命周期标记
export const Passive = 0b0000000000000000010000000000000;
export const PassiveUnmountPendingDev = 0b0000000000000000100000000000000;
export const Hydrating = 0b0000000000000001000000000000000;
export const HydratingAndUpdate = 0b0000000000000010000000000000000;
export const Visibility = 0b0000000000000100000000000000000;
export const StoreConsistency = 0b0000000000001000000000000000000;
```

## 🔄 双缓冲树机制

### 1. 双缓冲的概念

React 使用双缓冲技术来优化渲染性能：

- **Current Tree**：当前显示在屏幕上的树
- **Work In Progress Tree**：正在构建的新树

```javascript
// 双缓冲树的关系
let current = rootFiber; // 当前树
let workInProgress = null; // 工作树

// 开始渲染时
workInProgress = createWorkInProgress(current, pendingProps);

// 渲染完成后
root.current = workInProgress; // 切换树
current = workInProgress;
workInProgress = null;
```

### 2. 双缓冲的优势

#### 避免闪烁

- 新树完全构建完成后才切换
- 用户看不到中间状态

#### 支持中断

- 可以随时中断工作树的构建
- 不会影响当前显示的内容

#### 批量更新

- 多个更新可以合并到同一个工作树
- 减少不必要的渲染

### 3. 源码实现

```javascript
// packages/react-reconciler/src/ReactFiberWorkLoop.js
function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate;

  if (workInProgress === null) {
    // 创建新的工作节点
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
      current.mode
    );

    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;

    // 建立双向引用
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    // 复用现有节点
    workInProgress.pendingProps = pendingProps;
    workInProgress.type = current.type;

    // 清除副作用标记
    workInProgress.flags = NoFlags;
    workInProgress.subtreeFlags = NoFlags;
    workInProgress.deletions = null;
  }

  // 复制其他属性
  workInProgress.childLanes = current.childLanes;
  workInProgress.lanes = current.lanes;
  workInProgress.child = current.child;
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  workInProgress.ref = current.ref;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;

  return workInProgress;
}
```

## ⚙️ 工作循环 (Work Loop)

### 1. 工作循环的执行流程

```javascript
// packages/react-reconciler/src/ReactFiberWorkLoop.js
function workLoopSync() {
  // 同步工作循环
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function workLoopConcurrent() {
  // 并发工作循环
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}
```

### 2. 工作单元处理

```javascript
function performUnitOfWork(unitOfWork) {
  // 获取当前 Fiber 节点
  const current = unitOfWork.alternate;

  // 开始工作
  let next = beginWork(current, unitOfWork, subtreeRenderLanes);

  if (next === null) {
    // 没有子节点，完成当前节点
    completeUnitOfWork(unitOfWork);
  } else {
    // 继续处理子节点
    workInProgress = next;
  }
}
```

### 3. 开始工作 (beginWork)

```javascript
function beginWork(current, workInProgress, renderLanes) {
  // 检查是否需要更新
  if (current !== null) {
    const oldProps = current.memoizedProps;
    const newProps = workInProgress.pendingProps;

    if (
      oldProps !== newProps ||
      hasContextChanged() ||
      workInProgress.type !== current.type
    ) {
      // 需要更新
      workInProgress.flags |= Update;
    }
  }

  // 根据节点类型执行不同的工作
  workInProgress.lanes = NoLanes;

  switch (workInProgress.tag) {
    case IndeterminateComponent: {
      return mountIndeterminateComponent(
        current,
        workInProgress,
        workInProgress.type,
        renderLanes
      );
    }
    case FunctionComponent: {
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        unresolvedProps,
        renderLanes
      );
    }
    case ClassComponent: {
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      return updateClassComponent(
        current,
        workInProgress,
        Component,
        unresolvedProps,
        renderLanes
      );
    }
    case HostRoot:
      return updateHostRoot(current, workInProgress, renderLanes);
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderLanes);
    case HostText:
      return updateHostText(current, workInProgress);
    // ... 其他类型
  }
}
```

### 4. 完成工作 (completeWork)

```javascript
function completeWork(current, workInProgress) {
  const newProps = workInProgress.pendingProps;

  switch (workInProgress.tag) {
    case FunctionComponent:
    case ClassComponent:
    case HostRoot:
      // 函数组件、类组件、根节点不需要额外工作
      break;
    case HostComponent: {
      // 原生 DOM 元素
      const type = workInProgress.type;

      if (current !== null && workInProgress.stateNode != null) {
        // 更新现有 DOM 元素
        updateHostComponent(
          current.stateNode,
          current.memoizedProps,
          newProps,
          workInProgress
        );
      } else {
        // 创建新的 DOM 元素
        const instance = createInstance(type, newProps, workInProgress);

        // 将子元素添加到 DOM 实例
        appendAllChildren(instance, workInProgress);

        // 保存 DOM 实例引用
        workInProgress.stateNode = instance;

        // 标记需要插入
        workInProgress.flags |= Placement;
      }
      break;
    }
    case HostText: {
      // 文本节点
      const newText = newProps;

      if (current && workInProgress.stateNode != null) {
        // 更新现有文本
        const oldText = current.memoizedProps;
        updateHostText(workInProgress.stateNode, oldText, newText);
      } else {
        // 创建新的文本节点
        workInProgress.stateNode = createTextInstance(newText);
        workInProgress.flags |= Placement;
      }
      break;
    }
  }
}
```

## 🎯 优先级调度

### 1. Lane 模型

React 18 使用 Lane 模型来管理优先级：

```javascript
// packages/react-reconciler/src/ReactFiberLanes.js
export const NoLanes = 0b0000000000000000000000000000000;
export const NoLane = 0b0000000000000000000000000000000;

// 同步优先级
export const SyncLane = 0b0000000000000000000000000000001;
export const SyncBatchedLane = 0b0000000000000000000000000000010;

// 用户交互优先级
export const InputDiscreteHydrationLane = 0b0000000000000000000000000000100;
export const InputDiscreteLane = 0b0000000000000000000000000001000;
export const InputContinuousHydrationLane = 0b0000000000000000000000000010000;
export const InputContinuousLane = 0b0000000000000000000000000100000;

// 默认优先级
export const DefaultHydrationLane = 0b0000000000000000000000001000000;
export const DefaultLane = 0b0000000000000000000000010000000;

// 低优先级
export const TransitionHydrationLane = 0b0000000000000000000000100000000;
export const TransitionLane = 0b0000000000000000000001000000000;

// 空闲优先级
export const IdleHydrationLane = 0b0000000000000000000010000000000;
export const IdleLane = 0b0000000000000000000100000000000;

// 离屏优先级
export const OffscreenLane = 0b0000000000000000001000000000000;
```

### 2. 优先级计算

```javascript
// 计算更新的优先级
function getNextLanes(root, wipLanes) {
  // 获取待处理的优先级
  const pendingLanes = root.pendingLanes;

  if (pendingLanes === NoLanes) {
    return NoLanes;
  }

  // 获取非空闲的优先级
  const nonIdlePendingLanes = pendingLanes & ~IdleLane;

  if (nonIdlePendingLanes !== NoLanes) {
    // 返回最高优先级
    return getHighestPriorityLanes(nonIdlePendingLanes);
  }

  // 只有空闲优先级
  return getHighestPriorityLanes(pendingLanes);
}

// 获取最高优先级
function getHighestPriorityLanes(lanes) {
  if ((lanes & InputDiscreteLane) !== NoLanes) {
    return InputDiscreteLane;
  }
  if ((lanes & InputContinuousLane) !== NoLanes) {
    return InputContinuousLane;
  }
  if ((lanes & DefaultLane) !== NoLanes) {
    return DefaultLane;
  }
  if ((lanes & TransitionLane) !== NoLanes) {
    return TransitionLane;
  }
  if ((lanes & IdleLane) !== NoLanes) {
    return IdleLane;
  }
  return NoLanes;
}
```

### 3. 时间切片

```javascript
// packages/scheduler/src/Scheduler.js
function shouldYieldToHost() {
  const timeElapsed = getCurrentTime() - startTime;

  if (timeElapsed < frameInterval) {
    // 时间片未用完，继续工作
    return false;
  }

  // 时间片用完，让出控制权
  return true;
}

function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYieldToHost()) {
    performUnitOfWork(workInProgress);
  }
}
```

## 🔍 源码学习重点

### 1. 核心文件

- `packages/react-reconciler/src/ReactFiber.js` - Fiber 节点定义
- `packages/react-reconciler/src/ReactFiberWorkLoop.js` - 工作循环
- `packages/react-reconciler/src/ReactFiberBeginWork.js` - 开始工作
- `packages/react-reconciler/src/ReactFiberCompleteWork.js` - 完成工作
- `packages/react-reconciler/src/ReactFiberLanes.js` - 优先级管理

### 2. 关键数据结构

```javascript
// Fiber 节点
interface Fiber {
  // 节点类型
  tag: WorkTag;
  key: null | string;
  elementType: any;
  type: any;
  stateNode: any;

  // 树结构
  return: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  index: number;

  // 工作状态
  pendingProps: any;
  memoizedProps: any;
  memoizedState: any;
  updateQueue: any;

  // 副作用
  flags: Flags;
  subtreeFlags: Flags;
  deletions: Array<Fiber> | null;

  // 优先级
  lanes: Lanes;
  childLanes: Lanes;

  // 双缓冲
  alternate: Fiber | null;
}
```

## 📝 实践练习

### 1. 手写简化版 Fiber

```javascript
// 简化的 Fiber 节点
class Fiber {
  constructor(type, props) {
    this.type = type;
    this.props = props;

    // 树结构
    this.return = null;
    this.child = null;
    this.sibling = null;

    // 工作状态
    this.stateNode = null;
    this.alternate = null;
    this.flags = 0;
  }
}

// 简化的双缓冲树
class FiberTree {
  constructor() {
    this.current = null;
    this.workInProgress = null;
  }

  // 开始渲染
  beginWork() {
    if (this.workInProgress === null) {
      this.workInProgress = this.createWorkInProgress(this.current);
    }
  }

  // 创建工作节点
  createWorkInProgress(current) {
    if (current === null) {
      return new Fiber("div", {});
    }

    const workInProgress = new Fiber(current.type, current.props);
    workInProgress.stateNode = current.stateNode;
    workInProgress.alternate = current;
    current.alternate = workInProgress;

    return workInProgress;
  }

  // 完成渲染
  completeWork() {
    if (this.workInProgress !== null) {
      this.current = this.workInProgress;
      this.workInProgress = null;
    }
  }
}
```

### 2. 实现工作循环

```javascript
// 简化的工作循环
function workLoop(fiber) {
  let nextFiber = fiber;

  while (nextFiber && !shouldYield()) {
    nextFiber = performUnitOfWork(nextFiber);
  }

  return nextFiber;
}

function performUnitOfWork(fiber) {
  // 开始工作
  const nextFiber = beginWork(fiber);

  if (nextFiber) {
    return nextFiber;
  }

  // 完成工作
  while (fiber) {
    completeUnitOfWork(fiber);

    if (fiber.sibling) {
      return fiber.sibling;
    }

    fiber = fiber.return;
  }

  return null;
}

function beginWork(fiber) {
  // 根据类型执行不同的工作
  switch (fiber.type) {
    case "div":
      // 处理 div 元素
      return fiber.child;
    default:
      return null;
  }
}

function completeUnitOfWork(fiber) {
  // 完成当前节点的工作
  console.log("Completed:", fiber.type);
}
```

## 🎯 学习检查清单

- [x] 理解 Fiber 架构的设计思想
- [x] 掌握 Fiber 节点的数据结构
- [x] 了解双缓冲树的工作原理
- [x] 理解工作循环的执行流程
- [x] 掌握优先级调度的实现
- [x] 手写简化版 Fiber 系统

## 🚀 下一步

恭喜你完成了第二阶段的学习！现在你已经深入理解了 React 18 的核心架构，可以进入下一阶段：

**[第三阶段：渲染流程解析 →](./phase3-rendering-process.md)**

在下一阶段，我们将深入探索 React 的完整渲染流程，从首次渲染到更新流程，理解协调算法和提交阶段的工作原理。

---

**记住：Fiber 架构是 React 18 的核心，理解它对于掌握整个 React 系统至关重要！** 🎯
