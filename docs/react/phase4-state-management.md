# 第四阶段：状态管理原理 (待创建)

> 深入探索 React Hooks 的实现原理，理解 useState、useEffect、useRef 等核心 Hook 的底层机制

## 📚 学习目标

通过本阶段学习，你将掌握：

- Hooks 的底层实现原理
- useState 的状态更新机制
- useEffect 的副作用处理
- useRef 的引用管理
- 自定义 Hook 的设计模式
- Context 的实现机制

## 🎣 Hooks 基础原理

### 1. Hooks 的数据结构

```javascript
// packages/react-reconciler/src/ReactFiberHooks.js
type Hook = {
  memoizedState: any, // 当前状态值
  baseState: any, // 基础状态值
  baseQueue: Update<any, any> | null, // 基础更新队列
  queue: UpdateQueue<any, any> | null, // 更新队列
  next: Hook | null, // 下一个 Hook
};

type UpdateQueue<S, A> = {
  pending: Update<S, A> | null, // 待处理的更新
  lanes: Lanes, // 优先级
  dispatch: ((A) => mixed) | null, // 分发函数
  lastRenderedReducer: ((S, A) => S) | null, // 最后渲染的 reducer
  lastRenderedState: S | null, // 最后渲染的状态
};
```

### 2. Hooks 链表结构

```javascript
// 函数组件中的 Hooks 以链表形式存储
function FunctionComponent() {
  const [count, setCount] = useState(0); // Hook 1
  const [name, setName] = useState(""); // Hook 2
  const [flag, setFlag] = useState(false); // Hook 3

  useEffect(() => {
    console.log("Effect 1"); // Hook 4
  }, []);

  useEffect(() => {
    console.log("Effect 2"); // Hook 5
  }, [count]);

  return <div>{count}</div>;
}

// 对应的 Hooks 链表
// Hook1 -> Hook2 -> Hook3 -> Hook4 -> Hook5
```

### 3. Hooks 执行顺序的重要性

```javascript
// ❌ 错误：在条件语句中使用 Hooks
function BadComponent({ condition }) {
  if (condition) {
    const [count, setCount] = useState(0); // 违反 Hooks 规则
  }

  const [name, setName] = useState(""); // 这会导致 Hooks 顺序错乱
  return <div>{name}</div>;
}

// ✅ 正确：始终在顶层调用 Hooks
function GoodComponent({ condition }) {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");

  if (condition) {
    // 在条件语句中使用状态值，而不是调用 Hook
    return <div>{count}</div>;
  }

  return <div>{name}</div>;
}
```

## 🔄 useState 实现原理

### 1. useState 的基本实现

```javascript
// packages/react/src/ReactHooks.js
function useState(initialState) {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}

// packages/react-reconciler/src/ReactFiberHooks.js
function mountState<S>(
  initialState: (() => S) | S
): [S, Dispatch<SetStateAction<S>>] {
  // 1. 创建 Hook 对象
  const hook = mountWorkInProgressHook();

  // 2. 初始化状态
  if (typeof initialState === "function") {
    initialState = initialState();
  }
  hook.memoizedState = hook.baseState = initialState;

  // 3. 创建更新队列
  const queue = (hook.queue = {
    pending: null,
    lanes: NoLanes,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState,
  });

  // 4. 创建 dispatch 函数
  const dispatch = (queue.dispatch = dispatchSetState.bind(
    null,
    currentlyRenderingFiber,
    queue
  ));

  return [hook.memoizedState, dispatch];
}
```

### 2. dispatchSetState 的实现

```javascript
function dispatchSetState<S, A>(
  fiber: Fiber,
  queue: UpdateQueue<S, A>,
  action: A
) {
  // 1. 计算更新优先级
  const lane = requestUpdateLane(fiber);

  // 2. 创建更新对象
  const update: Update<S, A> = {
    lane,
    action,
    hasEagerState: false,
    eagerState: null,
    next: null,
  };

  // 3. 将更新加入队列
  const pending = queue.pending;
  if (pending === null) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  queue.pending = update;

  // 4. 调度更新
  scheduleUpdateOnFiber(fiber, lane);
}
```

## ⚡ useEffect 实现原理

### 1. useEffect 的基本实现

```javascript
// packages/react/src/ReactHooks.js
function useEffect(
  create: () => (() => void) | void,
  deps: Array<mixed> | void | null
) {
  const dispatcher = resolveDispatcher();
  return dispatcher.useEffect(create, deps);
}

// packages/react-reconciler/src/ReactFiberHooks.js
function mountEffect(
  create: () => (() => void) | void,
  deps: Array<mixed> | void | null
): void {
  return mountEffectImpl(
    UpdateEffect | PassiveEffect,
    HookPassive,
    create,
    deps
  );
}
```

### 2. 副作用的执行时机

```javascript
// packages/react-reconciler/src/ReactFiberCommitWork.js
function commitBeforeMutationEffects(root, finishedWork) {
  let nextEffect = finishedWork.firstEffect;

  while (nextEffect !== null) {
    const flags = nextEffect.flags;

    if ((flags & Passive) !== NoFlags) {
      // 标记需要执行 Passive 效果
      if (!rootDoesHavePassiveEffects) {
        rootDoesHavePassiveEffects = true;
        scheduleCallback(NormalSchedulerPriority, () => {
          flushPassiveEffects();
          return null;
        });
      }
    }

    nextEffect = nextEffect.nextEffect;
  }
}
```

## 🎯 useRef 实现原理

### 1. useRef 的基本实现

```javascript
// packages/react/src/ReactHooks.js
function useRef<T>(initialValue: T): { current: T } {
  const dispatcher = resolveDispatcher();
  return dispatcher.useRef(initialValue);
}

// packages/react-reconciler/src/ReactFiberHooks.js
function mountRef<T>(initialValue: T): { current: T } {
  // 1. 创建 Hook
  const hook = mountWorkInProgressHook();

  // 2. 创建 ref 对象
  const ref = { current: initialValue };
  hook.memoizedState = ref;

  return ref;
}

function updateRef<T>(initialValue: T): { current: T } {
  // 1. 获取当前 Hook
  const hook = updateWorkInProgressHook();

  // 2. 返回现有的 ref 对象
  return hook.memoizedState;
}
```

## 🧩 自定义 Hook 原理

### 1. 自定义 Hook 的设计模式

```javascript
// 自定义 Hook 本质上是一个函数，内部使用其他 Hooks
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount((c) => c - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return {
    count,
    increment,
    decrement,
    reset,
  };
}
```

## 🌐 Context 实现机制

### 1. Context 的数据结构

```javascript
// packages/react/src/ReactContext.js
export function createContext<T>(
  defaultValue: T,
  calculateChangedBits: ?(a: T, b: T) => number
): ReactContext<T> {
  if (calculateChangedBits === undefined) {
    calculateChangedBits = null;
  }

  const context: ReactContext<T> = {
    $$typeof: REACT_CONTEXT_TYPE,
    _calculateChangedBits: calculateChangedBits,
    _currentValue: defaultValue,
    _currentValue2: defaultValue,
    _threadCount: 0,
    Provider: null,
    Consumer: null,
  };

  context.Provider = {
    $$typeof: REACT_PROVIDER_TYPE,
    _context: context,
  };

  context.Consumer = context;

  return context;
}
```

## 🔍 源码学习重点

### 1. 核心文件

- `packages/react/src/ReactHooks.js` - Hooks 核心实现
- `packages/react-reconciler/src/ReactFiberHooks.js` - Hooks 协调逻辑
- `packages/react/src/ReactContext.js` - Context 实现
- `packages/react-reconciler/src/ReactFiberCommitWork.js` - 副作用执行

## 📝 实践练习

### 1. 手写简化版 useState

```javascript
// 简化的 useState 实现
let currentFiber = null;
let currentHookIndex = 0;
let hooks = [];

function useState(initialValue) {
  const hookIndex = currentHookIndex++;

  if (hooks[hookIndex] === undefined) {
    // 首次调用，初始化
    hooks[hookIndex] = {
      state: typeof initialValue === "function" ? initialValue() : initialValue,
      queue: [],
    };
  }

  const hook = hooks[hookIndex];

  // 处理队列中的更新
  if (hook.queue.length > 0) {
    hook.queue.forEach((update) => {
      if (typeof update === "function") {
        hook.state = update(hook.state);
      } else {
        hook.state = update;
      }
    });
    hook.queue = [];
  }

  const setState = (newValue) => {
    hook.queue.push(newValue);
    // 触发重渲染
    scheduleUpdate();
  };

  return [hook.state, setState];
}
```

## 🎯 学习检查清单

- [ ] 理解 Hooks 的底层实现原理
- [ ] 掌握 useState 的状态更新机制
- [ ] 了解 useEffect 的副作用处理
- [ ] 理解 useRef 的引用管理
- [ ] 掌握自定义 Hook 的设计模式
- [ ] 了解 Context 的实现机制
- [ ] 手写简化版 useState
- [ ] 手写简化版 useEffect
- [ ] 手写简化版 useRef

## 🚀 下一步

恭喜你完成了第四阶段的学习！现在你已经深入理解了 React Hooks 的实现原理，可以进入下一阶段：

**[第五阶段：并发特性实现 →](./phase5-concurrent-features.md)**

在下一阶段，我们将深入探索 React 18 的并发特性，理解 Concurrent Mode、Suspense、时间切片等核心概念的实现原理。

---

**记住：Hooks 是 React 函数组件的核心，理解它们的实现原理对于掌握整个 React 系统至关重要！** 🎯
