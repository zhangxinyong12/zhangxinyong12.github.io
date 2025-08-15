# 第六阶段：事件系统原理 (待创建)

> 深入探索 React 事件系统的实现原理，理解事件委托、合成事件、事件优先级等核心概念

## 📚 学习目标

通过本阶段学习，你将掌握：

- 事件委托机制的工作原理
- 合成事件的封装和实现
- 事件优先级的处理策略
- 事件池的内存管理机制
- 事件冒泡和捕获的实现

## 🎯 事件委托机制

### 1. 什么是事件委托？

事件委托是 React 事件系统的核心机制，它将所有事件监听器绑定到根节点（通常是 document），而不是每个 DOM 元素：

```javascript
// 传统方式：每个元素都绑定事件监听器
function TraditionalComponent() {
  return (
    <div>
      <button onClick={() => console.log('Button 1 clicked')}>Button 1</button>
      <button onClick={() => console.log('Button 2 clicked')}>Button 2</button>
      <button onClick={() => console.log('Button 3 clicked')}>Button 3</button>
    </div>
  );
}

// React 事件委托：所有事件都绑定到根节点
// 实际 DOM 结构：
// document.addEventListener('click', handleDocumentClick);
// 而不是每个 button 都绑定事件
```

### 2. 事件委托的优势

#### 性能优化
- **内存效率**：只需要一个事件监听器，而不是 N 个
- **动态元素**：新添加的元素自动具有事件处理能力
- **减少绑定**：避免频繁的 addEventListener/removeEventListener

#### 统一管理
- **事件处理**：所有事件在同一个地方处理
- **错误处理**：统一的错误边界和异常处理
- **调试便利**：可以在一个地方调试所有事件

### 3. 事件委托的实现原理

```javascript
// packages/react-dom/src/events/DOMPluginEventSystem.js
function listenToNativeEvent(
  domEventName,
  isCapturePhaseListener,
  target
) {
  // 获取事件优先级
  const eventPriority = getEventPriority(domEventName);
  
  // 创建事件监听器
  const listener = createEventListenerWrapperWithPriority(
    targetContainer,
    domEventName,
    eventPriority
  );
  
  // 绑定到根节点
  if (isCapturePhaseListener) {
    addEventCaptureListener(targetContainer, domEventName, listener);
  } else {
    addEventBubbleListener(targetContainer, domEventName, listener);
  }
}

// 添加事件监听器
function addEventBubbleListener(target, eventType, listener) {
  target.addEventListener(eventType, listener, false);
}

function addEventCaptureListener(target, eventType, listener) {
  target.addEventListener(eventType, listener, true);
}
```

## 🎭 合成事件 (SyntheticEvent)

### 1. 合成事件的概念

合成事件是 React 对原生 DOM 事件的封装，提供了跨浏览器的一致 API：

```javascript
// packages/react-dom/src/events/SyntheticEvent.js
function SyntheticEvent(
  reactName,
  reactEventType,
  targetInst,
  nativeEvent,
  nativeEventTarget
) {
  this._reactName = reactName;
  this._targetInst = targetInst;
  this.type = reactEventType;
  this.nativeEvent = nativeEvent;
  this.target = nativeEventTarget;
  this.currentTarget = null;
  
  // 阻止默认行为
  this.defaultPrevented = false;
  this.isDefaultPrevented = functionThatReturnsFalse;
  
  // 阻止冒泡
  this.isPropagationStopped = functionThatReturnsFalse;
  
  // 其他属性
  this.nativeEvent = nativeEvent;
  this.target = nativeEventTarget;
  this.currentTarget = null;
  
  // 时间戳
  this.timeStamp = nativeEvent.timeStamp;
  
  // 阻止默认行为
  this.preventDefault = function() {
    this.defaultPrevented = true;
    const event = this.nativeEvent;
    if (!event) {
      return;
    }
    
    if (event.preventDefault) {
      event.preventDefault();
    } else if (typeof event.returnValue !== 'unknown') {
      event.returnValue = false;
    }
    this.isDefaultPrevented = functionThatReturnsTrue;
  };
  
  // 阻止冒泡
  this.stopPropagation = function() {
    const event = this.nativeEvent;
    if (!event) {
      return;
    }
    
    if (event.stopPropagation) {
      event.stopPropagation();
    } else if (typeof event.cancelBubble !== 'unknown') {
      event.cancelBubble = true;
    }
    this.isPropagationStopped = functionThatReturnsTrue;
  };
}
```

### 2. 合成事件的创建

```javascript
// packages/react-dom/src/events/DOMPluginEventSystem.js
function extractEvents(
  domEventName,
  targetInst,
  nativeEvent,
  nativeEventTarget,
  eventSystemFlags,
  targetContainer
) {
  // 获取事件插件
  const eventPlugin = getEventPlugin(domEventName);
  
  if (!eventPlugin) {
    return null;
  }
  
  // 提取事件
  const extractedEvents = eventPlugin.extractEvents(
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer
  );
  
  return extractedEvents;
}

// 创建合成事件
function createSyntheticEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
  const event = new SyntheticEvent(
    reactName,
    reactEventType,
    targetInst,
    nativeEvent,
    nativeEventTarget
  );
  
  return event;
}
```

### 3. 合成事件的处理

```javascript
// packages/react-dom/src/events/DOMPluginEventSystem.js
function processEventQueue(eventQueue, eventSystemFlags, targetContainer, instance) {
  // 处理事件队列
  for (let i = 0; i < eventQueue.length; i++) {
    const event = eventQueue[i];
    
    // 设置当前目标
    event.currentTarget = instance;
    
    // 执行事件处理函数
    executeDispatchesAndRelease(event, eventSystemFlags);
  }
}

// 执行事件分发
function executeDispatchesAndRelease(event, eventSystemFlags) {
  const eventListeners = event._dispatchListeners;
  const eventInstances = event._dispatchInstances;
  
  if (eventListeners) {
    // 执行所有监听器
    for (let i = 0; i < eventListeners.length; i++) {
      const listener = eventListeners[i];
      const instance = eventInstances[i];
      
      try {
        // 调用事件处理函数
        listener.call(instance, event);
      } catch (error) {
        // 错误处理
        handleEventError(error, event, instance);
      }
    }
  }
  
  // 释放事件对象
  releasePooledEvent(event);
}
```

## ⚡ 事件优先级

### 1. 事件优先级系统

React 根据事件类型分配不同的优先级：

```javascript
// packages/react-dom/src/events/ReactDOMEventListener.js
function getEventPriority(domEventName) {
  switch (domEventName) {
    case 'click':
    case 'keydown':
    case 'keyup':
      return DiscreteEventPriority;
      
    case 'drag':
    case 'dragenter':
    case 'dragexit':
    case 'dragleave':
    case 'dragover':
    case 'drop':
    case 'mousemove':
    case 'mouseout':
    case 'mouseover':
    case 'pointermove':
    case 'pointerout':
    case 'pointerover':
    case 'scroll':
    case 'toggle':
    case 'touchmove':
    case 'wheel':
      return ContinuousEventPriority;
      
    default:
      return DefaultEventPriority;
  }
}

// 事件优先级常量
export const DiscreteEventPriority = SyncLane;
export const ContinuousEventPriority = InputContinuousLane;
export const DefaultEventPriority = DefaultLane;
export const IdleEventPriority = IdleLane;
```

### 2. 优先级调度

```javascript
// packages/react-dom/src/events/DOMPluginEventSystem.js
function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
  // 获取事件优先级
  const eventPriority = getEventPriority(domEventName);
  
  // 创建事件对象
  const event = createSyntheticEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent);
  
  // 根据优先级调度事件处理
  if (eventPriority === DiscreteEventPriority) {
    // 离散事件：立即处理
    flushDiscreteUpdatesIfNeeded(nativeEvent.timeStamp);
    discreteUpdates(event, eventPriority, targetContainer, nativeEvent);
  } else {
    // 连续事件：批量处理
    batchedEventUpdates(event, eventPriority, targetContainer, nativeEvent);
  }
}

// 离散事件处理
function discreteUpdates(event, eventPriority, targetContainer, nativeEvent) {
  const prevIsInsideEventHandler = isInsideEventHandler;
  isInsideEventHandler = true;
  
  try {
    // 立即执行事件处理
    executeDispatchesAndRelease(event, eventSystemFlags);
  } finally {
    isInsideEventHandler = prevIsInsideEventHandler;
  }
}

// 批量事件处理
function batchedEventUpdates(event, eventPriority, targetContainer, nativeEvent) {
  // 将事件加入批处理队列
  const batchedEventQueue = getBatchedEventQueue();
  batchedEventQueue.push({
    event,
    eventPriority,
    targetContainer,
    nativeEvent
  });
  
  // 调度批处理
  scheduleBatchedEventUpdates();
}
```

## 🏊 事件池管理

### 1. 事件池的概念

事件池是 React 优化内存使用的机制，通过复用事件对象减少垃圾回收：

```javascript
// packages/react-dom/src/events/SyntheticEvent.js
const EVENT_POOL_SIZE = 10;

// 事件池
const eventPool = [];

// 从池中获取事件对象
function getPooledEvent(dispatchConfig, targetInst, nativeEvent, nativeInst) {
  if (eventPool.length) {
    const instance = eventPool.pop();
    instance.dispatchConfig = dispatchConfig;
    instance._targetInst = targetInst;
    instance.nativeEvent = nativeEvent;
    instance.nativeEventTarget = nativeInst;
    instance.isDefaultPrevented = functionThatReturnsFalse;
    instance.isPropagationStopped = functionThatReturnsFalse;
    instance._dispatchListeners = null;
    instance._dispatchInstances = null;
    return instance;
  }
  
  return new SyntheticEvent(dispatchConfig, targetInst, nativeEvent, nativeInst);
}

// 将事件对象放回池中
function releasePooledEvent(event) {
  if (!(event instanceof SyntheticEvent)) {
    return;
  }
  
  event.dispatchConfig = null;
  event._targetInst = null;
  event.nativeEvent = null;
  event.nativeEventTarget = null;
  event.isDefaultPrevented = functionThatReturnsFalse;
  event.isPropagationStopped = functionThatReturnsFalse;
  event._dispatchListeners = null;
  event._dispatchInstances = null;
  
  if (eventPool.length < EVENT_POOL_SIZE) {
    eventPool.push(event);
  }
}
```

### 2. 事件池的优化

```javascript
// 现代 React 版本中，事件池已被移除
// 因为现代浏览器的垃圾回收器已经足够高效

// 旧版本中的使用方式
function OldComponent() {
  const handleClick = (event) => {
    // 注意：在异步回调中不能使用 event
    console.log(event.type); // 正确
    
    setTimeout(() => {
      // ❌ 错误：event 可能已被回收
      console.log(event.type);
    }, 100);
  };
  
  return <button onClick={handleClick}>Click me</button>;
}

// 现代版本中的使用方式
function ModernComponent() {
  const handleClick = (event) => {
    // 可以安全地在异步回调中使用
    setTimeout(() => {
      // ✅ 正确：event 不会被回收
      console.log(event.type);
    }, 100);
  };
  
  return <button onClick={handleClick}>Click me</button>;
}
```

## 🔄 事件冒泡和捕获

### 1. 事件传播机制

React 支持完整的事件传播机制：

```javascript
// packages/react-dom/src/events/DOMPluginEventSystem.js
function traverseEventPath(nativeEvent, targetInst, eventSystemFlags, targetContainer) {
  const eventPath = [];
  let instance = targetInst;
  
  // 构建事件路径
  while (instance) {
    eventPath.push(instance);
    instance = getParent(instance);
  }
  
  // 捕获阶段：从根到目标
  for (let i = eventPath.length - 1; i >= 0; i--) {
    const instance = eventPath[i];
    const listener = getListener(instance, 'onClickCapture');
    
    if (listener) {
      event.currentTarget = instance;
      listener.call(instance, event);
      
      if (event.isPropagationStopped) {
        break;
      }
    }
  }
  
  // 冒泡阶段：从目标到根
  for (let i = 0; i < eventPath.length; i++) {
    const instance = eventPath[i];
    const listener = getListener(instance, 'onClick');
    
    if (listener) {
      event.currentTarget = instance;
      listener.call(instance, event);
      
      if (event.isPropagationStopped) {
        break;
      }
    }
  }
}
```

### 2. 事件处理函数的绑定

```javascript
// packages/react-dom/src/events/DOMPluginEventSystem.js
function getListener(instance, eventName) {
  const props = instance.memoizedProps;
  
  if (!props) {
    return null;
  }
  
  // 获取事件处理函数
  const listener = props[eventName];
  
  if (typeof listener !== 'function') {
    return null;
  }
  
  return listener;
}

// 绑定事件处理函数
function bindEventHandler(instance, eventName, handler) {
  // 创建包装函数
  const wrappedHandler = function(event) {
    // 设置当前目标
    event.currentTarget = instance;
    
    // 调用原始处理函数
    return handler.call(instance, event);
  };
  
  // 绑定到实例
  instance[eventName] = wrappedHandler;
}
```

## 🔍 源码学习重点

### 1. 核心文件

- `packages/react-dom/src/events/DOMPluginEventSystem.js` - 事件系统核心
- `packages/react-dom/src/events/SyntheticEvent.js` - 合成事件实现
- `packages/react-dom/src/events/ReactDOMEventListener.js` - 事件监听器
- `packages/react-dom/src/events/getEventTarget.js` - 事件目标获取

### 2. 关键函数

```javascript
// 事件系统
function listenToNativeEvent(domEventName, isCapturePhaseListener, target)
function extractEvents(domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer)
function processEventQueue(eventQueue, eventSystemFlags, targetContainer, instance)

// 事件优先级
function getEventPriority(domEventName)
function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent)

// 事件池管理
function getPooledEvent(dispatchConfig, targetInst, nativeEvent, nativeInst)
function releasePooledEvent(event)
```

## 📝 实践练习

### 1. 手写简化版事件委托

```javascript
// 简化版事件委托系统
class EventDelegation {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.eventHandlers = new Map();
    this.init();
  }
  
  init() {
    // 绑定根节点事件监听器
    this.rootElement.addEventListener('click', this.handleEvent.bind(this), false);
    this.rootElement.addEventListener('keydown', this.handleEvent.bind(this), false);
  }
  
  // 注册事件处理函数
  on(eventType, selector, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Map());
    }
    
    const handlers = this.eventHandlers.get(eventType);
    handlers.set(selector, handler);
  }
  
  // 移除事件处理函数
  off(eventType, selector) {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(selector);
    }
  }
  
  // 处理事件
  handleEvent(event) {
    const eventType = event.type;
    const handlers = this.eventHandlers.get(eventType);
    
    if (!handlers) return;
    
    // 查找匹配的元素
    for (const [selector, handler] of handlers) {
      if (this.matches(event.target, selector)) {
        // 创建合成事件
        const syntheticEvent = this.createSyntheticEvent(event);
        
        // 调用处理函数
        handler.call(event.target, syntheticEvent);
        
        // 检查是否阻止冒泡
        if (syntheticEvent.isPropagationStopped) {
          break;
        }
      }
    }
  }
  
  // 检查元素是否匹配选择器
  matches(element, selector) {
    if (selector === '*') return true;
    if (selector.startsWith('.')) {
      return element.classList.contains(selector.slice(1));
    }
    if (selector.startsWith('#')) {
      return element.id === selector.slice(1);
    }
    return element.tagName.toLowerCase() === selector.toLowerCase();
  }
  
  // 创建合成事件
  createSyntheticEvent(nativeEvent) {
    const event = {
      nativeEvent,
      target: nativeEvent.target,
      currentTarget: nativeEvent.currentTarget,
      type: nativeEvent.type,
      timeStamp: nativeEvent.timeStamp,
      isPropagationStopped: false,
      isDefaultPrevented: false,
      
      preventDefault() {
        this.isDefaultPrevented = true;
        nativeEvent.preventDefault();
      },
      
      stopPropagation() {
        this.isPropagationStopped = true;
        nativeEvent.stopPropagation();
      }
    };
    
    return event;
  }
}

// 使用示例
const eventSystem = new EventDelegation(document.body);

// 注册事件处理函数
eventSystem.on('click', '.btn', function(event) {
  console.log('Button clicked:', this.textContent);
});

eventSystem.on('click', '#submit', function(event) {
  console.log('Submit button clicked');
  event.stopPropagation();
});
```

### 2. 实现简化版合成事件

```javascript
// 简化版合成事件
class SyntheticEvent {
  constructor(nativeEvent, targetInst) {
    this.nativeEvent = nativeEvent;
    this._targetInst = targetInst;
    this.target = nativeEvent.target;
    this.currentTarget = null;
    this.type = nativeEvent.type;
    this.timeStamp = nativeEvent.timeStamp;
    
    // 状态标记
    this.isDefaultPrevented = false;
    this.isPropagationStopped = false;
    
    // 绑定方法
    this.preventDefault = this.preventDefault.bind(this);
    this.stopPropagation = this.stopPropagation.bind(this);
  }
  
  preventDefault() {
    this.isDefaultPrevented = true;
    this.nativeEvent.preventDefault();
  }
  
  stopPropagation() {
    this.isPropagationStopped = true;
    this.nativeEvent.stopPropagation();
  }
  
  // 获取事件属性
  get bubbles() {
    return this.nativeEvent.bubbles;
  }
  
  get cancelable() {
    return this.nativeEvent.cancelable;
  }
  
  get defaultPrevented() {
    return this.isDefaultPrevented;
  }
  
  get eventPhase() {
    return this.nativeEvent.eventPhase;
  }
  
  get isTrusted() {
    return this.nativeEvent.isTrusted;
  }
}

// 事件池管理
class EventPool {
  constructor(size = 10) {
    this.size = size;
    this.pool = [];
  }
  
  get(nativeEvent, targetInst) {
    if (this.pool.length > 0) {
      const event = this.pool.pop();
      event.nativeEvent = nativeEvent;
      event._targetInst = targetInst;
      event.target = nativeEvent.target;
      event.currentTarget = null;
      event.isDefaultPrevented = false;
      event.isPropagationStopped = false;
      return event;
    }
    
    return new SyntheticEvent(nativeEvent, targetInst);
  }
  
  release(event) {
    if (this.pool.length < this.size) {
      event.nativeEvent = null;
      event._targetInst = null;
      event.target = null;
      event.currentTarget = null;
      this.pool.push(event);
    }
  }
}

// 使用示例
const eventPool = new EventPool(5);

function handleClick(nativeEvent, targetInst) {
  // 从池中获取事件对象
  const event = eventPool.get(nativeEvent, targetInst);
  
  // 使用事件对象
  console.log('Event type:', event.type);
  console.log('Event target:', event.target);
  
  // 处理完成后释放
  eventPool.release(event);
}
```

## 🎯 学习检查清单

- [ ] 理解事件委托机制的工作原理
- [ ] 掌握合成事件的封装和实现
- [ ] 了解事件优先级的处理策略
- [ ] 理解事件池的内存管理机制
- [ ] 掌握事件冒泡和捕获的实现
- [ ] 手写简化版事件委托系统
- [ ] 实现简化版合成事件

## 🚀 下一步

恭喜你完成了第六阶段的学习！现在你已经深入理解了 React 事件系统的实现原理，可以进入下一阶段：

**[第七阶段：路由系统源码 →](./phase7-routing-system.md)**

在下一阶段，我们将深入探索 React Router 的实现原理，理解路由匹配、动态路由、路由守卫等核心概念。

---

**记住：事件系统是 React 用户交互的基础，理解它对于掌握完整的 React 开发至关重要！** 🎯
