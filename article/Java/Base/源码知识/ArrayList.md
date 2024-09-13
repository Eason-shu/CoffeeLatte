---
title: ArrayList源码分析
sidebar_position: 2
keywords:
  - Java
tags:
  - Java
  - 学习笔记
  - 基础
last_update:
  date: 2023-07-01
  author: EasonShu
---

# ArrayList

`ArrayList` 是 Java 中的一个动态数组类，它位于 `java.util` 包中，并且实现了 `List` 接口。`ArrayList` 提供了动态调整大小的能力，这意味着它可以随着添加或删除元素而自动扩展或收缩。下面是对 `ArrayList` 源码的一些基本分析。

### 1. 类定义
```java
public class ArrayList<E> extends AbstractList<E>
    implements List<E>, RandomAccess, Cloneable, Serializable {
}
```
从这个定义可以看出，`ArrayList` 继承自 `AbstractList` 并且实现了多个接口：`List`, `RandomAccess`, `Cloneable`, 和 `Serializable`。这表明 `ArrayList` 支持快速随机访问，可以被复制，并且是可序列化的。

### 2. 成员变量
```java
transient int modCount = 0;
transient Object[] elementData;
private static final Object[] EMPTY_ELEMENTDATA = {};
private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};
```
- `modCount` 用于记录结构的修改次数，通常在迭代器中使用以检测数据结构的并发修改。
- `elementData` 是一个 Object 数组，用于存储实际的数据。
- `EMPTY_ELEMENTDATA` 和 `DEFAULTCAPACITY_EMPTY_ELEMENTDATA` 是空数组，用于初始化 `ArrayList` 时避免额外的分配。

### 3. 构造方法
`ArrayList` 有多个构造器，其中最基本的无参构造器将 `elementData` 初始化为 `DEFAULTCAPACITY_EMPTY_ELEMENTDATA`：
```java
public ArrayList() {
    this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
}
```

### 4. 扩容机制
当添加元素到 `ArrayList` 而其容量不足时，`ArrayList` 会自动扩容。扩容通常是将原数组的容量增加 50%（默认情况下）。
```java
private void grow(int minCapacity) {
    // overflow-conscious code
    int oldCapacity = elementData.length;
    int newCapacity = oldCapacity + (oldCapacity >> 1);
    if (newCapacity - minCapacity < 0)
        newCapacity = minCapacity;
    if (newCapacity - MAX_ARRAY_SIZE > 0)
        newCapacity = hugeCapacity(minCapacity);
    // minCapacity is usually close to size, so this is a win:
    elementData = Arrays.copyOf(elementData, newCapacity);
}
```

### 5. 添加元素
添加元素到 `ArrayList` 主要是调用 `ensureCapacityInternal` 方法来确保有足够的空间。
```java
public boolean add(E e) {
    ensureCapacityInternal(size + 1);  // Increments modCount!!
    elementData[size++] = e;
    return true;
}
```

### 6. 获取元素
获取元素时，`ArrayList` 直接通过索引访问数组中的元素。
```java
public E get(int index) {
    rangeCheck(index);
    return elementData(index);
}
```

### 7. 移除元素
移除元素后，需要将后面的元素向前移动一位。
```java
public E remove(int index) {
    rangeCheck(index);
    modCount++;
    E oldValue = elementData(index);
    int numMoved = size - index - 1;
    if (numMoved > 0)
        System.arraycopy(elementData, index+1, elementData, index,
                         numMoved);
    elementData[--size] = null; // clear to let GC do its work
    return oldValue;
}
```

