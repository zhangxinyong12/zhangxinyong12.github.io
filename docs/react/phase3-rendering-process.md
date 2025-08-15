# 第三阶段：渲染流程解析 ✅

> 深入理解 React 的完整渲染流程，从首次渲染到更新流程，掌握协调算法和提交阶段的工作原理

## 📚 学习目标

通过本阶段学习，你将掌握：

- React 首次渲染的完整流程
- 组件更新的触发机制和处理流程
- 协调算法的 Diff 策略和实现
- 提交阶段的 DOM 操作和副作用执行

## 🚀 React 渲染流程概览

### 1. 整体渲染流程

```
1. 调度阶段 (Scheduler) → 2. 协调阶段 (Reconciler) → 3. 提交阶段 (Renderer)
```

#### 调度阶段

- 确定渲染优先级
- 分配时间片
- 调度渲染任务

#### 协调阶段

- 构建 Fiber 树
- 执行 Diff 算法
- 标记副作用

#### 提交阶段

- 执行 DOM 操作
- 执行副作用
- 更新 Fiber 树

### 2. 渲染模式

```javascript
// 同步渲染
function performSyncWorkOnRoot(root) {
  // 同步执行，不中断
  workLoopSync();
  commitRoot(root);
}

// 并发渲染
function performConcurrentWorkOnRoot(root) {
  // 可以中断和恢复
  workLoopConcurrent();
  if (workInProgress !== null) {
    // 还有工作要做，稍后继续
    return;
  }
  commitRoot(root);
}
```

## 🎯 首次渲染 (Mount)

### 1. 首次渲染的完整流程

```javascript
// packages/react-dom/src/client/ReactDOM.js
function legacyRenderSubtreeIntoContainer(
  parentComponent,
  children,
  container,
  forceHydrate,
  callback
) {
  // 1. 创建 Fiber 根节点
  const root = createFiberRoot(container, tag, options);

  // 2. 创建更新
  const update = createUpdate(NoLanes);
  update.payload = { element: children };

  // 3. 将更新加入队列
  enqueueUpdate(root.current, update);

  // 4. 开始渲染
  scheduleUpdateOnFiber(root, NoLanes);
}
```

### 2. 创建 Fiber 根节点

```javascript
// packages/react-reconciler/src/ReactFiberRoot.js
function createFiberRoot(containerInfo, tag, options, hydrate) {
  // 创建 Fiber 根节点
  const root = new FiberRootNode(containerInfo, tag, hydrate);

  // 创建未初始化的 Fiber 节点
  const uninitializedFiber = createHostRootFiber(tag, isStrictMode);

  // 建立双向引用
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;

  // 初始化更新队列
  initializeUpdateQueue(uninitializedFiber);

  return root;
}
```

## 🔄 更新流程 (Update)

### 1. 更新的触发机制

#### 状态更新触发

```javascript
// useState 更新
function updateState(initialState) {
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;

  // 创建更新对象
  const update = {
    lane: requestUpdateLane(),
    action: initialState,
    hasEagerState: false,
    eagerState: null,
    next: null,
  };

  // 将更新加入队列
  const pending = queue.pending;
  if (pending === null) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  queue.pending = update;

  // 调度更新
  scheduleUpdateOnFiber(fiber, lane);
}
```

## 🔍 协调算法 (Reconciliation)

### 1. Diff 算法的核心策略

React 的 Diff 算法基于以下假设：

- **相同类型的组件**：如果类型相同，可以复用
- **Key 属性**：帮助识别哪些元素发生了变化
- **同层比较**：只比较同层级的节点

### 2. 单元素协调

```javascript
// packages/react-reconciler/src/ReactChildFiber.js
function reconcileSingleElement(
  returnFiber,
  currentFirstChild,
  element,
  lanes
) {
  const key = element.key;
  let child = currentFirstChild;

  while (child !== null) {
    // 检查 key 是否匹配
    if (child.key === key) {
      // key 匹配，检查类型
      if (child.elementType === element.type) {
        // 类型也匹配，可以复用
        deleteRemainingChildren(returnFiber, child.sibling);

        const existing = useFiber(child, element.props);
        existing.return = returnFiber;

        return existing;
      } else {
        // 类型不匹配，删除所有子节点
        deleteRemainingChildren(returnFiber, child);
        break;
      }
    } else {
      // key 不匹配，删除当前子节点
      deleteChild(returnFiber, child);
    }
    child = child.sibling;
  }

  // 创建新的 Fiber 节点
  const created = createFiberFromElement(element, lanes);
  created.return = returnFiber;
  return created;
}
```

## ✅ 提交阶段 (Commit)

### 1. 提交阶段的三个阶段

```javascript
// packages/react-reconciler/src/ReactFiberCommitWork.js
function commitRoot(root) {
  const finishedWork = root.finishedWork;

  if (finishedWork === null) {
    return;
  }

  // 第一阶段：提交前
  commitBeforeMutationEffects(root, finishedWork);

  // 第二阶段：提交变更
  commitMutationEffects(root, finishedWork);

  // 第三阶段：提交后
  commitLayoutEffects(root, finishedWork);
}
```

### 2. 提交变更阶段

```javascript
function commitMutationEffects(root, finishedWork) {
  let nextEffect = finishedWork.firstEffect;

  while (nextEffect !== null) {
    const flags = nextEffect.flags;

    if ((flags & Placement) !== NoFlags) {
      // 插入节点
      commitPlacement(nextEffect);
    }

    if ((flags & Update) !== NoFlags) {
      // 更新节点
      const current = nextEffect.alternate;
      commitUpdate(current, nextEffect);
    }

    if ((flags & Deletion) !== NoFlags) {
      // 删除节点
      commitDeletion(root, nextEffect);
    }

    nextEffect = nextEffect.nextEffect;
  }
}
```

## 🔍 源码学习重点

### 1. 核心文件

- `packages/react-reconciler/src/ReactFiberWorkLoop.js` - 工作循环
- `packages/react-reconciler/src/ReactChildFiber.js` - 子节点协调
- `packages/react-reconciler/src/ReactFiberCommitWork.js` - 提交阶段
- `packages/react-reconciler/src/ReactUpdateQueue.js` - 更新队列

### 2. 关键函数

```javascript
// 渲染根节点
function performSyncWorkOnRoot(root)
function performConcurrentWorkOnRoot(root)

// 协调子节点
function reconcileChildFibers(returnFiber, currentFirstChild, newChild, lanes)
function reconcileSingleElement(returnFiber, currentFirstChild, element, lanes)
function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, lanes)

// 提交更新
function commitRoot(root)
function commitBeforeMutationEffects(root, finishedWork)
function commitMutationEffects(root, finishedWork)
function commitLayoutEffects(root, finishedWork)
```

## 📝 实践练习

### 1. 手写简化版协调算法

```javascript
// 简化的 Diff 算法
function reconcileChildren(oldChildren, newChildren) {
  if (Array.isArray(newChildren)) {
    return reconcileChildrenArray(oldChildren, newChildren);
  } else if (newChildren && typeof newChildren === "object") {
    return reconcileSingleElement(oldChildren, newChildren);
  } else {
    return null;
  }
}

function reconcileSingleElement(oldChildren, newChild) {
  // 查找可以复用的节点
  for (let i = 0; i < oldChildren.length; i++) {
    const oldChild = oldChildren[i];
    if (oldChild.type === newChild.type && oldChild.key === newChild.key) {
      // 可以复用
      const updatedChild = { ...oldChild, props: newChild.props };
      return [updatedChild];
    }
  }

  // 无法复用，创建新节点
  return [newChild];
}
```

### 2. 实现简化版提交阶段

```javascript
// 简化的提交阶段
function commitWork(fiber) {
  if (!fiber) return;

  // 提交当前节点
  if (fiber.stateNode) {
    if (fiber.flags & Placement) {
      // 插入节点
      commitPlacement(fiber);
    }

    if (fiber.flags & Update) {
      // 更新节点
      commitUpdate(fiber);
    }

    if (fiber.flags & Deletion) {
      // 删除节点
      commitDeletion(fiber);
    }
  }

  // 递归处理子节点
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
```

## 🎯 学习检查清单

- [x] 理解 React 渲染流程的三个阶段
- [x] 掌握首次渲染的完整流程
- [x] 了解组件更新的触发机制
- [x] 理解协调算法的 Diff 策略
- [x] 掌握提交阶段的三个阶段
- [x] 手写简化版协调算法
- [x] 实现简化版提交阶段

## 🚀 下一步

恭喜你完成了第三阶段的学习！现在你已经深入理解了 React 的完整渲染流程，可以进入下一阶段：

**[第四阶段：状态管理原理 →](./phase4-state-management.md)**

在下一阶段，我们将深入探索 React Hooks 的实现原理，理解 useState、useEffect、useRef 等核心 Hook 的底层机制。

---

**记住：渲染流程是 React 的核心，理解它对于掌握整个 React 系统至关重要！** 🎯
