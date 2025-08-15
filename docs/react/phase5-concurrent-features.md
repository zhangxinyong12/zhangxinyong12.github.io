# 第五阶段：并发特性实现 (待创建)

> 深入探索 React 18 的并发特性，理解 Concurrent Mode、Suspense、时间切片等核心概念的实现原理

## 📚 学习目标

通过本阶段学习，你将掌握：

- Concurrent Mode 的架构设计
- Suspense 的底层实现机制
- 时间切片的调度策略
- 优先级系统的实现原理
- 可中断渲染的工作机制

## 🚀 Concurrent Mode 架构

### 1. 什么是 Concurrent Mode？

Concurrent Mode 是 React 18 的核心特性，它允许 React 在渲染过程中：

- **中断渲染**：可以暂停和恢复渲染工作
- **优先级调度**：根据任务优先级进行渲染
- **时间切片**：将渲染工作分解为小块
- **并发渲染**：支持多个渲染任务同时进行

### 2. Concurrent Mode 的优势

```javascript
// 传统同步渲染的问题
function TraditionalComponent() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    // 这些更新会阻塞用户交互
    setCount((c) => c + 1000); // 大量计算
    setCount((c) => c + 1000); // 大量计算
    setCount((c) => c + 1000); // 大量计算
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>Update</button>
    </div>
  );
}

// Concurrent Mode 的解决方案
function ConcurrentComponent() {
  const [count, setCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    // 使用 startTransition 标记非紧急更新
    startTransition(() => {
      setCount((c) => c + 1000); // 可以中断
      setCount((c) => c + 1000); // 可以中断
      setCount((c) => c + 1000); // 可以中断
    });
  };

  return (
    <div>
      {isPending && <p>Updating...</p>}
      <p>Count: {count}</p>
      <button onClick={handleClick}>Update</button>
    </div>
  );
}
```

### 3. Concurrent Mode 的启用

```javascript
// 启用 Concurrent Mode
import { createRoot } from "react-dom/client";

const container = document.getElementById("root");
const root = createRoot(container); // 启用 Concurrent Mode

root.render(<App />);

// 或者使用 StrictMode 包装
import { StrictMode } from "react";

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

## ⏰ 时间切片 (Time Slicing)

### 1. 时间切片的概念

时间切片是 React 18 的核心机制，它将渲染工作分解为小的、可中断的时间块：

```javascript
// packages/scheduler/src/Scheduler.js
const frameInterval = 5; // 5ms 为一个时间片

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

  // 时间片用完，让出控制权
  if (workInProgress !== null) {
    // 还有工作要做，稍后继续
    return workInProgress;
  }

  // 工作完成
  return null;
}
```

### 2. 时间切片的实现

```javascript
// packages/scheduler/src/Scheduler.js
function requestHostCallback(callback) {
  scheduledHostCallback = callback;

  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    port.postMessage(null);
  }
}

function performWorkUntilDeadline() {
  if (scheduledHostCallback !== null) {
    const currentTime = getCurrentTime();
    deadline = currentTime + yieldInterval;

    const hasTimeRemaining = true;

    try {
      const hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);

      if (!hasMoreWork) {
        isMessageLoopRunning = false;
        scheduledHostCallback = null;
      } else {
        // 还有工作要做，继续调度
        port.postMessage(null);
      }
    } catch (error) {
      // 错误处理
      port.postMessage(null);
      throw error;
    }
  } else {
    isMessageLoopRunning = false;
  }
}

// 使用 MessageChannel 实现时间切片
const channel = new MessageChannel();
const port = channel.port2;
channel.port1.onmessage = performWorkUntilDeadline;
```

### 3. 时间切片的优势

```javascript
// 时间切片让 React 可以响应高优先级事件
function App() {
  const [count, setCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleInputChange = (e) => {
    // 高优先级：用户输入
    setInputValue(e.target.value);
  };

  const handleSearch = () => {
    // 低优先级：搜索操作
    startTransition(() => {
      setSearchResults(performExpensiveSearch(inputValue));
    });
  };

  return (
    <div>
      <input onChange={handleInputChange} />
      <button onClick={handleSearch}>Search</button>
      {isPending && <p>Searching...</p>}
      <p>Count: {count}</p>
    </div>
  );
}
```

## 🎯 优先级系统

### 1. Lane 模型

React 18 使用 Lane 模型来管理优先级：

```javascript
// packages/react-reconciler/src/ReactFiberLanes.js
export const NoLanes = 0b0000000000000000000000000000000;
export const NoLane = 0b0000000000000000000000000000000;

// 同步优先级（最高）
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

// 空闲优先级（最低）
export const IdleHydrationLane = 0b0000000000000000000010000000000;
export const IdleLane = 0b0000000000000000000100000000000;
```

### 2. 优先级计算

```javascript
// packages/react-reconciler/src/ReactFiberLanes.js
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

### 3. 优先级调度

```javascript
// packages/react-reconciler/src/ReactFiberWorkLoop.js
function ensureRootIsScheduled(root) {
  const existingCallbackNode = root.callbackNode;

  // 计算下一个优先级
  const nextLanes = getNextLanes(
    root,
    root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes
  );

  if (nextLanes === NoLanes) {
    // 没有待处理的工作
    if (existingCallbackNode !== null) {
      cancelCallback(existingCallbackNode);
      root.callbackNode = null;
    }
    return;
  }

  // 根据优先级选择调度策略
  let newCallbackNode = null;
  if (nextLanes === SyncLane) {
    // 同步优先级，立即执行
    scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
    scheduleMicrotask(flushSyncCallbacks);
  } else {
    // 其他优先级，使用调度器
    const schedulerPriorityLevel = lanesToSchedulerPriority(nextLanes);
    newCallbackNode = scheduleCallback(
      schedulerPriorityLevel,
      performConcurrentWorkOnRoot.bind(null, root)
    );
  }

  root.callbackNode = newCallbackNode;
}
```

## 🎭 Suspense 实现

### 1. Suspense 的基本概念

Suspense 允许组件在等待异步操作完成时显示加载状态：

```javascript
// 基本用法
import { Suspense } from "react";

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <AsyncComponent />
    </Suspense>
  );
}

// 异步组件
function AsyncComponent() {
  const data = use(fetchData()); // 假设 use 是一个新的 Hook

  return <div>{data}</div>;
}
```

### 2. Suspense 的底层实现

```javascript
// packages/react-reconciler/src/ReactFiberSuspenseComponent.js
function updateSuspenseComponent(current, workInProgress, renderLanes) {
  const mode = workInProgress.mode;
  const newProps = workInProgress.pendingProps;
  const fallbackChildren = newProps.fallback;
  const children = newProps.children;

  // 检查是否有待处理的 Suspense 状态
  const suspenseContext = getSuspenseContext();
  const shouldRenderFallback = suspenseContext.isPending;

  if (shouldRenderFallback) {
    // 显示 fallback
    const fallbackFragment = createSuspenseFallbackFragment(
      workInProgress,
      fallbackChildren,
      renderLanes
    );

    workInProgress.child = fallbackFragment;
    return fallbackFragment;
  } else {
    // 显示实际内容
    const primaryFragment = createSuspensePrimaryFragment(
      workInProgress,
      children,
      renderLanes
    );

    workInProgress.child = primaryFragment;
    return primaryFragment;
  }
}
```

### 3. Suspense 的状态管理

```javascript
// packages/react-reconciler/src/ReactFiberSuspenseComponent.js
function createSuspenseFallbackFragment(
  returnFiber,
  fallbackChildren,
  renderLanes
) {
  const fallbackFragment = createFiberFromFragment(
    fallbackChildren,
    returnFiber.mode,
    renderLanes,
    null
  );

  fallbackFragment.return = returnFiber;
  fallbackFragment.flags |= Placement;

  return fallbackFragment;
}

function createSuspensePrimaryFragment(
  returnFiber,
  primaryChildren,
  renderLanes
) {
  const primaryFragment = createFiberFromFragment(
    primaryChildren,
    returnFiber.mode,
    renderLanes,
    null
  );

  primaryFragment.return = returnFiber;

  return primaryFragment;
}
```

## 🔄 可中断渲染

### 1. 可中断渲染的实现

```javascript
// packages/react-reconciler/src/ReactFiberWorkLoop.js
function performConcurrentWorkOnRoot(root) {
  // 并发渲染，可以中断
  const prevExecutionContext = executionContext;
  executionContext |= RenderContext;

  const prevDispatcher = pushDispatcher();

  try {
    // 执行工作循环
    workLoopConcurrent();

    if (workInProgress !== null) {
      // 还有工作要做，但需要让出控制权
      return workInProgress;
    }

    // 工作完成，提交更新
    const finishedWork = root.current.alternate;
    root.finishedWork = finishedWork;
    root.finishedLanes = lanes;

    commitRoot(root);

    return null;
  } finally {
    // 清理
    popDispatcher(prevDispatcher);
    executionContext = prevExecutionContext;
  }
}
```

### 2. 中断和恢复机制

```javascript
// packages/react-reconciler/src/ReactFiberWorkLoop.js
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYieldToHost()) {
    performUnitOfWork(workInProgress);
  }
}

function shouldYieldToHost() {
  const timeElapsed = getCurrentTime() - startTime;

  if (timeElapsed < frameInterval) {
    // 时间片未用完，继续工作
    return false;
  }

  // 时间片用完，让出控制权
  return true;
}

// 恢复渲染
function resumeConcurrentWorkOnRoot(root) {
  if (workInProgress !== null) {
    // 继续之前的工作
    workLoopConcurrent();

    if (workInProgress !== null) {
      // 还有工作要做
      return workInProgress;
    }

    // 工作完成，提交更新
    commitRoot(root);
  }

  return null;
}
```

## 🔍 源码学习重点

### 1. 核心文件

- `packages/react-reconciler/src/ReactFiberWorkLoop.js` - 工作循环
- `packages/react-reconciler/src/ReactFiberLanes.js` - 优先级管理
- `packages/react-reconciler/src/ReactFiberSuspenseComponent.js` - Suspense 实现
- `packages/scheduler/src/Scheduler.js` - 调度器

### 2. 关键函数

```javascript
// 并发渲染
function performConcurrentWorkOnRoot(root)
function workLoopConcurrent()
function shouldYieldToHost()

// 优先级管理
function getNextLanes(root, wipLanes)
function getHighestPriorityLanes(lanes)
function ensureRootIsScheduled(root)

// Suspense
function updateSuspenseComponent(current, workInProgress, renderLanes)
function createSuspenseFallbackFragment(returnFiber, fallbackChildren, renderLanes)
```

## 📝 实践练习

### 1. 手写简化版时间切片

```javascript
// 简化的时间切片实现
class TimeSlicingScheduler {
  constructor() {
    this.tasks = [];
    this.isRunning = false;
    this.frameInterval = 5; // 5ms
  }

  addTask(task, priority = "normal") {
    this.tasks.push({ task, priority, id: Date.now() });
    this.schedule();
  }

  schedule() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.runNextFrame();
  }

  runNextFrame() {
    const startTime = performance.now();

    while (this.tasks.length > 0) {
      const currentTime = performance.now();

      if (currentTime - startTime >= this.frameInterval) {
        // 时间片用完，让出控制权
        requestAnimationFrame(() => this.runNextFrame());
        return;
      }

      const task = this.tasks.shift();
      try {
        task.task();
      } catch (error) {
        console.error("Task error:", error);
      }
    }

    this.isRunning = false;
  }
}

// 使用示例
const scheduler = new TimeSlicingScheduler();

function addExpensiveTask() {
  for (let i = 0; i < 1000; i++) {
    scheduler.addTask(() => {
      // 模拟昂贵的计算
      const result = Math.sqrt(i) * Math.PI;
      console.log(`Task ${i}: ${result}`);
    });
  }
}
```

### 2. 实现简化版优先级调度

```javascript
// 简化的优先级调度器
class PriorityScheduler {
  constructor() {
    this.highPriorityQueue = [];
    this.normalPriorityQueue = [];
    this.lowPriorityQueue = [];
    this.isProcessing = false;
  }

  addTask(task, priority = "normal") {
    switch (priority) {
      case "high":
        this.highPriorityQueue.push(task);
        break;
      case "normal":
        this.normalPriorityQueue.push(task);
        break;
      case "low":
        this.lowPriorityQueue.push(task);
        break;
    }

    this.process();
  }

  process() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.processNextTask();
  }

  processNextTask() {
    // 按优先级处理任务
    let task = null;

    if (this.highPriorityQueue.length > 0) {
      task = this.highPriorityQueue.shift();
    } else if (this.normalPriorityQueue.length > 0) {
      task = this.normalPriorityQueue.shift();
    } else if (this.lowPriorityQueue.length > 0) {
      task = this.lowPriorityQueue.shift();
    }

    if (task) {
      try {
        task();
      } catch (error) {
        console.error("Task error:", error);
      }

      // 继续处理下一个任务
      this.processNextTask();
    } else {
      this.isProcessing = false;
    }
  }
}

// 使用示例
const scheduler = new PriorityScheduler();

// 高优先级任务
scheduler.addTask(() => {
  console.log("High priority task");
}, "high");

// 低优先级任务
scheduler.addTask(() => {
  console.log("Low priority task");
}, "low");

// 普通优先级任务
scheduler.addTask(() => {
  console.log("Normal priority task");
}, "normal");
```

## 🎯 学习检查清单

- [ ] 理解 Concurrent Mode 的架构设计
- [ ] 掌握时间切片的实现原理
- [ ] 了解优先级系统的工作机制
- [ ] 理解 Suspense 的底层实现
- [ ] 掌握可中断渲染的原理
- [ ] 手写简化版时间切片
- [ ] 实现简化版优先级调度

## 🚀 下一步

恭喜你完成了第五阶段的学习！现在你已经深入理解了 React 18 的并发特性，可以进入下一阶段：

**[第六阶段：事件系统原理 →](./phase6-event-system.md)**

在下一阶段，我们将深入探索 React 事件系统的实现原理，理解事件委托、合成事件、事件优先级等核心概念。

---

**记住：并发特性是 React 18 的核心创新，理解它们对于掌握现代 React 开发至关重要！** 🎯
