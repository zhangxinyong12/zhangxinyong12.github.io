# 第八阶段：状态管理库 (待创建)

> 深入探索 Redux、Zustand、MobX 等状态管理库的实现原理，理解单向数据流、响应式编程等核心概念

## 📚 学习目标

通过本阶段学习，你将掌握：

- Redux 单向数据流的实现原理
- Zustand 轻量级状态管理的设计思想
- MobX 响应式编程模型的底层机制
- 状态管理库的选择策略和最佳实践
- 状态持久化和中间件的实现方式

## 🔄 Redux 单向数据流

### 1. Redux 核心概念

Redux 基于三个核心原则构建：

- **单一数据源**：整个应用的状态存储在一个对象中
- **状态只读**：只能通过 dispatch action 来修改状态
- **使用纯函数进行修改**：Reducer 必须是纯函数

```javascript
// Redux 数据流
// Action → Reducer → Store → View → Action
```

### 2. Store 实现原理

```javascript
// packages/redux/src/createStore.ts
export default function createStore(
  reducer: Reducer<S>,
  preloadedState?: PreloadedState<S>,
  enhancer?: StoreEnhancer<Ext, StateExt>
): Store<Ext, StateExt> {
  let currentReducer = reducer;
  let currentState = preloadedState as S;
  let currentListeners: (() => void)[] | null = [];
  let nextListeners = currentListeners;
  let isDispatching = false;

  // 获取当前状态
  function getState(): S {
    if (isDispatching) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing.'
      );
    }
    return currentState;
  }

  // 订阅状态变化
  function subscribe(listener: () => void) {
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.');
    }

    if (isDispatching) {
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing.'
      );
    }

    let isSubscribed = true;

    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      if (isDispatching) {
        throw new Error(
          'You may not unsubscribe from a store listener while the reducer is executing.'
        );
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();
      const index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
      currentListeners = null;
    };
  }

  // 分发 Action
  function dispatch(action: A): A {
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. Use custom middleware for async actions.'
      );
    }

    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. You may have missed a type property when passing an action creator to a component.'
      );
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    const listeners = (currentListeners = nextListeners);
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }

    return action;
  }

  // 初始化状态
  dispatch({ type: ActionTypes.INIT } as A);

  const store = {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
  } as Store<Ext, StateExt>;

  return store;
}
```

## ⚡ Zustand 轻量级状态管理

### 1. Zustand 核心设计

Zustand 是一个轻量级的状态管理库，基于 Hook 设计：

```javascript
// src/index.ts
export function create<T extends State>(
  stateCreator: StateCreator<T, [], [], unknown>
): UseBoundStore<T> {
  const api = typeof stateCreator === 'function' ? stateCreator : () => stateCreator;

  const useStore: any = <U>(
    selector?: Selector<T, U>,
    equalityFn?: EqualityChecker<U>
  ) => {
    const [, forceUpdate] = useReducer(c => c + 1, 0);
    const state = api.getState();
    const selectedState = selector ? selector(state) : state;

    useIsomorphicLayoutEffect(() => {
      const unsubscribe = api.subscribe((state, prevState) => {
        const newSelectedState = selector ? selector(state) : state;
        const prevSelectedState = selector ? selector(prevState) : prevState;

        if (!equalityFn(newSelectedState, prevSelectedState)) {
          forceUpdate();
        }
      });
      return unsubscribe;
    }, [selector, equalityFn]);

    return selectedState;
  };

  useStore.getState = api.getState;
  useStore.setState = api.setState;
  useStore.subscribe = api.subscribe;
  useStore.destroy = api.destroy;

  return useStore;
}
```

### 2. Store 实现

```javascript
// src/store.ts
export function createStore<TState extends object>(
  initialState: TState
): StoreApi<TState> {
  let state = initialState;
  const listeners = new Set<() => void>();

  const setState = (partial: Partial<TState> | ((state: TState) => Partial<TState>)) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    
    if (Object.is(nextState, state)) {
      return;
    }

    const previousState = state;
    state = Object.assign({}, state, nextState);

    listeners.forEach(listener => listener());
  };

  const getState = () => state;

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const destroy = () => {
    listeners.clear();
  };

  return {
    setState,
    getState,
    subscribe,
    destroy,
  };
}
```

## 🎭 MobX 响应式编程

### 1. Observable 实现原理

MobX 基于响应式编程模型，通过 Observable 自动追踪状态变化：

```javascript
// packages/mobx/src/api/observable.ts
export function observable<T>(value: T): IObservableValue<T> {
  if (arguments.length > 1) {
    throw new Error('observable expects 0 or 1 arguments');
  }

  // 如果已经是 Observable，直接返回
  if (isObservable(value)) {
    return value;
  }

  // 根据值类型创建相应的 Observable
  if (isPlainObject(value)) {
    return observableObject(value);
  }

  if (Array.isArray(value)) {
    return observableArray(value);
  }

  if (isMap(value)) {
    return observableMap(value);
  }

  if (isSet(value)) {
    return observableSet(value);
  }

  // 原始值包装为 ObservableValue
  return new ObservableValue(value);
}

// ObservableValue 实现
class ObservableValue<T> implements IObservableValue<T> {
  private value: T;
  private observers = new Set<IDerivation>();

  constructor(value: T) {
    this.value = value;
  }

  get(): T {
    // 追踪依赖
    if (isTracking()) {
      trackDerivation(this.observers);
    }
    return this.value;
  }

  set(newValue: T): void {
    if (Object.is(this.value, newValue)) {
      return;
    }

    const oldValue = this.value;
    this.value = newValue;

    // 通知观察者
    this.observers.forEach(observer => {
      observer.onBecomeStale();
    });
  }

  observe(listener: (change: IValueDidChange<T>) => void): Lambda {
    const observer = new Observer(listener);
    this.observers.add(observer);
    
    return () => {
      this.observers.delete(observer);
    };
  }
}
```

## 🔍 状态管理库对比

### 1. 设计理念对比

| 特性 | Redux | Zustand | MobX |
|------|-------|---------|------|
| 架构模式 | 单向数据流 | Hook 驱动 | 响应式编程 |
| 学习曲线 | 陡峭 | 平缓 | 中等 |
| 样板代码 | 较多 | 较少 | 较少 |
| 性能 | 良好 | 优秀 | 优秀 |
| 调试工具 | 丰富 | 基础 | 丰富 |

### 2. 使用场景对比

```javascript
// Redux：复杂应用状态管理
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
  },
});

// Zustand：简单状态管理
const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

// MobX：响应式状态管理
class CounterStore {
  @observable count = 0;
  
  @action increment() {
    this.count++;
  }
  
  @action decrement() {
    this.count--;
  }
  
  @computed get doubleCount() {
    return this.count * 2;
  }
}
```

## 🔍 源码学习重点

### 1. 核心文件

#### Redux
- `packages/redux/src/createStore.ts` - Store 创建
- `packages/redux/src/combineReducers.ts` - Reducer 组合
- `packages/redux/src/applyMiddleware.ts` - 中间件应用

#### Zustand
- `src/index.ts` - 核心实现
- `src/store.ts` - Store 管理
- `src/middleware.ts` - 中间件系统

#### MobX
- `packages/mobx/src/api/observable.ts` - Observable 创建
- `packages/mobx/src/core/action.ts` - Action 实现
- `packages/mobx/src/core/computed.ts` - Computed 实现

## 📝 实践练习

### 1. 手写简化版 Redux

```javascript
// 简化版 Redux 实现
class SimpleRedux {
  constructor(reducer, initialState = {}) {
    this.reducer = reducer;
    this.state = initialState;
    this.listeners = [];
    this.isDispatching = false;
  }

  getState() {
    if (this.isDispatching) {
      throw new Error('Cannot call getState while dispatching');
    }
    return this.state;
  }

  dispatch(action) {
    if (this.isDispatching) {
      throw new Error('Reducers may not dispatch actions');
    }

    if (typeof action !== 'object' || action.type === undefined) {
      throw new Error('Actions must have a type property');
    }

    try {
      this.isDispatching = true;
      this.state = this.reducer(this.state, action);
    } finally {
      this.isDispatching = false;
    }

    // 通知所有监听器
    this.listeners.forEach(listener => listener());
    
    return action;
  }

  subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Listener must be a function');
    }

    this.listeners.push(listener);
    
    // 返回取消订阅函数
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

// 使用示例
const counterReducer = (state = { count: 0 }, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    default:
      return state;
  }
};

const store = new SimpleRedux(counterReducer);

// 订阅状态变化
const unsubscribe = store.subscribe(() => {
  console.log('State changed:', store.getState());
});

// 分发 Action
store.dispatch({ type: 'INCREMENT' });
store.dispatch({ type: 'INCREMENT' });
store.dispatch({ type: 'DECREMENT' });

// 取消订阅
unsubscribe();
```

## 🎯 学习检查清单

- [ ] 理解 Redux 单向数据流的实现原理
- [ ] 掌握 Zustand 轻量级状态管理的设计思想
- [ ] 了解 MobX 响应式编程模型的底层机制
- [ ] 理解状态管理库的选择策略和最佳实践
- [ ] 掌握状态持久化和中间件的实现方式
- [ ] 手写简化版 Redux
- [ ] 实现简化版 Zustand
- [ ] 实现简化版 MobX

## 🚀 下一步

恭喜你完成了第八阶段的学习！现在你已经深入理解了主流状态管理库的实现原理，可以进入下一阶段：

**[第九阶段：构建工具原理 →](./phase9-build-tools.md)**

在下一阶段，我们将深入探索 Vite、Webpack 等构建工具的实现原理，理解模块打包、代码分割、热更新等核心概念。

---

**记住：状态管理是前端应用的核心，理解不同状态管理库的实现原理对于选择合适的技术方案至关重要！** 🎯
