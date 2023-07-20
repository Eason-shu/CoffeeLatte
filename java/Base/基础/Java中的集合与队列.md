---
title: Java中的集合
sidebar_position: 2
keywords:
  - Java
tags:
  - Java
  - 学习笔记
  - 基础
  - 反射
  - 注解
  - 泛型
  - 集合
  - 多线程
last_update:
  date: 2023-07-01
  author: EasonShu
---


## 一 集合
Java中的集合分为两大类Collection接口，与Map接口。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1645606870947-ec3e946d-e042-4bb8-8664-1678d1cf13fe.png#clientId=u56d09305-91bf-4&from=paste&id=u8bac21f4&originHeight=551&originWidth=1031&originalType=url&ratio=1&rotation=0&showTitle=false&size=63343&status=done&style=none&taskId=u69517c5a-89f6-4d73-831c-9107c572c84&title=)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1645606902835-fca1afa4-7ff8-4098-b32a-47e892a90bf0.png#clientId=u56d09305-91bf-4&from=paste&id=uc2414ef7&originHeight=438&originWidth=908&originalType=url&ratio=1&rotation=0&showTitle=false&size=38032&status=done&style=none&taskId=udab7ae7b-61f4-4095-a4c4-1ea70840642&title=)
### 1.1 Iterable与Iterator

- Iterable接口是单列集合的最高级。
```java
public interface Iterable<T> {

    // 返回一个迭代器对象
    Iterator<T> iterator();

  	// 对Iterable的每个元素执行给定的操作，直到处理完所有元素或该操作引发异常。
    default void forEach(Consumer<? super T> action) {
        Objects.requireNonNull(action);
        for (T t : this) {
            action.accept(t);
        }
    }

	// 并行遍历迭代器
    default Spliterator<T> spliterator() {
        return Spliterators.spliteratorUnknownSize(iterator(), 0);
    }
}
```

- Iterator迭代器对象
```java
public interface Iterator<E> {

    // 是否有下一个元素
    boolean hasNext();

   // 下一个元素
    E next();

  	// 从基础集合中移除此迭代器返回的最后一个元素（可选操作）
    default void remove() {
        throw new UnsupportedOperationException("remove");
    }

  // 对每个剩余元素执行给定的操作，直到所有元素都已处理
    default void forEachRemaining(Consumer<? super E> action) {
        Objects.requireNonNull(action);
        while (hasNext())
            action.accept(next());
    }
}

```
### 1.2 Collection接口

- 在add方法加上断点调试
```java
/**
 * @Author shu
 * @Date: 2022/02/25/ 9:22
 * @Description
 **/
public class ArrayListTest {
    public static void main(String[] args) {
        ArrayList<Integer> list =new ArrayList<>();
        for (int i = 0; i < 15; i++) {
            list.add(i);
        }
    }
}
```
```java
public interface Collection<E> extends Iterable<E> {
   	// 返回集合大小
    int size();
	// 是否为空
    boolean isEmpty();
 	// 是否包含这个元素
    boolean contains(Object o);
	// 迭代器
    Iterator<E> iterator();
	// 转换成数组
    Object[] toArray();
	// 增加一个元素
    boolean add(E e);
	// 移除一个元素
    boolean remove(Object o);
	// 包含一个数组对象
    boolean containsAll(Collection<?> c);
	// 增加一个数组对象
    boolean addAll(Collection<? extends E> c);
	// 移除一个数组对象
    boolean removeAll(Collection<?> c);
	// 并行遍历
    @Override
    default Spliterator<E> spliterator() {
        return Spliterators.spliterator(this, 0);
    }
	// 流计算
    default Stream<E> stream() {
        return StreamSupport.stream(spliterator(), false);
    }
	// 并行流
    default Stream<E> parallelStream() {
        return StreamSupport.stream(spliterator(), true);
    }
}
```
#### 1.2.1 ArrayList
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650118029906-3204e7f5-304e-4bf2-96bb-d584339c19d9.png#clientId=u4f1fdc3c-bf5c-4&from=paste&height=496&id=ub0f44d7f&originHeight=620&originWidth=1092&originalType=binary&ratio=1&rotation=0&showTitle=false&size=41900&status=done&style=none&taskId=ufdd79351-2921-454a-8c19-8ea674f501b&title=&width=873.6)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1649740517369-59e15a9d-e500-4fed-8da0-1d982d0ef4cb.png#clientId=udb6e56c6-193c-4&from=paste&height=512&id=u8a2ad282&originHeight=640&originWidth=1042&originalType=binary&ratio=1&rotation=0&showTitle=false&size=48548&status=done&style=none&taskId=u1a425bd8-5b3a-4e92-a57f-3932a6f926e&title=&width=833.6)
##### 1.2.1.1 重要参数
```java
	// 初始化容器容量
    private static final int DEFAULT_CAPACITY = 10;

   	// 空数组
    private static final Object[] EMPTY_ELEMENTDATA = {};

  	// 用于默认大小的空实例的共享空数组实例。
    private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};

 	// 缓存数组，用于扩容
    transient Object[] elementData; // non-private to simplify nested class access

   	// 大小
    private int size;
```
##### 1.2.1.2 构造器
```java
// 指定了初始化容量,就以指定容量初始化
public ArrayList(int initialCapacity) {
        if (initialCapacity > 0) {

            this.elementData = new Object[initialCapacity];
        } else if (initialCapacity == 0) {
            this.elementData = EMPTY_ELEMENTDATA;
        } else {
            throw new IllegalArgumentException("Illegal Capacity: "+
                                               initialCapacity);
        }
    }

// 无参构造器
 public ArrayList() {
        this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
    }

// 指定集合
public ArrayList(Collection<? extends E> c) {
        elementData = c.toArray();
        if ((size = elementData.length) != 0) {
            // c.toArray might (incorrectly) not return Object[] (see 6260652)
            if (elementData.getClass() != Object[].class)
                elementData = Arrays.copyOf(elementData, size, Object[].class);
        } else {
            // replace with empty array.
            this.elementData = EMPTY_ELEMENTDATA;
        }
    }
```
##### 1.2.1.3扩容过程
ArrayList在调用无参构造方法时创建的是一个长度为0的空数组，当调用add()方法添加元素时，ArrayList才会触发扩容机制
```java
public boolean add(E e) {
    	// 检查是否扩容
        ensureCapacityInternal(size + 1);  // Increments modCount!!
        elementData[size++] = e;
        return true;
    }


private void ensureCapacityInternal(int minCapacity) {
    	// 是否为空数组
        if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
            // 最大值，默认10
            minCapacity = Math.max(DEFAULT_CAPACITY, minCapacity);
        }
		// 确定是否真正的扩容
        ensureExplicitCapacity(minCapacity);
    }


private void ensureExplicitCapacity(int minCapacity) {
    	// 当前集合修改的次数
        modCount++;

        // 说明容量不够了
        if (minCapacity - elementData.length > 0)
            // 进行扩容操作
            grow(minCapacity);
    }

/**
先将旧容量右移1位，再加上旧容量就得到了新容量，正数右移1位相当于除以2，在该基础上加旧容量，则等价于新容量 = 旧容量 * 1.5，所以才有ArrayList每次扩容为旧容量的1.5倍的说法，最后调用Arrays.copyOf()方法进行拷贝，并将elementData指向新数组，而旧数组因为没有引用指向它，很快就会被垃圾收集器回收掉。
**/
 private void grow(int minCapacity) {
        // overflow-conscious code
        int oldCapacity = elementData.length;
     	// 位移运算，向右移动以为除以2
     	// 默认为10 ，新数组容量为10+5=15
        int newCapacity = oldCapacity + (oldCapacity >> 1);
        if (newCapacity - minCapacity < 0)
            newCapacity = minCapacity;
        if (newCapacity - MAX_ARRAY_SIZE > 0)
            newCapacity = hugeCapacity(minCapacity);
        // minCapacity is usually close to size, so this is a win:
     	// 复制成新数组，保留原来的元素
        elementData = Arrays.copyOf(elementData, newCapacity);
    }
```
##### 1.2.1.4 增加方法
```java
    public boolean add(E e) {
        // 确保内部容量是否够
        ensureCapacityInternal(size + 1);  // Increments modCount!!
        // 增加新元素
        elementData[size++] = e;
        return true;
    }

```
##### 1.2.1.5 总结
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650117885955-b4ba2ec8-e461-41ab-a3b0-8c8b246bde30.png#clientId=u4f1fdc3c-bf5c-4&from=paste&id=uf0cc8e0d&originHeight=690&originWidth=1353&originalType=url&ratio=1&rotation=0&showTitle=false&size=100713&status=done&style=none&taskId=u453c2f54-c72d-434b-a390-4ba8dd8f875&title=)
#### 1.2.2 Vector
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650117997294-af3c00a3-1c60-4091-9aac-84d569b74a37.png#clientId=u4f1fdc3c-bf5c-4&from=paste&height=510&id=u7a21de45&originHeight=638&originWidth=1192&originalType=binary&ratio=1&rotation=0&showTitle=false&size=43809&status=done&style=none&taskId=u63c0a205-22ef-4255-987d-b84bee04a80&title=&width=953.6)

- 在add方法加上断点调试
```java
package Collection;
import java.util.Vector;


/**
 * @Author shu
 * @Date: 2022/02/25/ 9:30
 * @Description
 **/

public class VectorTest {
    public static void main(String[] args) {
        Vector<Integer> list =new Vector<>();
        for (int i = 0; i < 15; i++) {
            list.add(i);
        }
    }
}

```
##### 1.2.2.1 重要参数
```java
	// 缓存数组，用于扩容
    protected Object[] elementData;

	// 计算缓存数组大小
    protected int elementCount;

 	// 缓存数组大小
    protected int capacityIncrement;
```
##### 1.2.2.2 构造器
```java
 // 构造一个具有指定初始容量和容量增量的空向量。
public Vector(int initialCapacity, int capacityIncrement) {
        super();
        if (initialCapacity < 0)
            throw new IllegalArgumentException("Illegal Capacity: "+
                                               initialCapacity);
        this.elementData = new Object[initialCapacity];
        this.capacityIncrement = capacityIncrement;
    }

 // 指定了初始化容量
public Vector(int initialCapacity) {
        this(initialCapacity, 0);
    }



// 无参构造，默认初始化容量为10
public Vector() {
        this(10);
    }
```
##### 1.2.2.3 扩容过程
```java
// synchronized关键字修饰，线程安全
public synchronized boolean add(E e) {
    // 修改次数
        modCount++;
    // 是否需要扩容
        ensureCapacityHelper(elementCount + 1);
        elementData[elementCount++] = e;
        return true;
    }

// 扩容
 private void ensureCapacityHelper(int minCapacity) {
        // 计算是否扩容
        if (minCapacity - elementData.length > 0)
            grow(minCapacity);
    }

// 具体扩容过程
  private void grow(int minCapacity) {
        // overflow-conscious code
        int oldCapacity = elementData.length;
      	// 扩容为原来的两倍
        int newCapacity = oldCapacity + ((capacityIncrement > 0) ?
                                         capacityIncrement : oldCapacity);
        if (newCapacity - minCapacity < 0)
            newCapacity = minCapacity;
        if (newCapacity - MAX_ARRAY_SIZE > 0)
            newCapacity = hugeCapacity(minCapacity);
      // 复制成新数组，保留原来的元素
        elementData = Arrays.copyOf(elementData, newCapacity);
    }
```
##### 1.2.2.4 总结
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1649685234762-5ba60b68-faff-4c01-a7b9-5c7323c587a4.png#clientId=u0163a5d3-67e0-4&from=paste&height=540&id=ufe6f6f89&originHeight=675&originWidth=1417&originalType=binary&ratio=1&rotation=0&showTitle=false&size=565212&status=done&style=none&taskId=u16c15ed7-b9aa-433c-a725-e8aedd9b0b3&title=&width=1133.6)
#### 1.2.3 LinkedList
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650118184502-853ded51-a71f-4c1a-ab3d-05392290c193.png#clientId=u4f1fdc3c-bf5c-4&from=paste&height=588&id=u3901ec5b&originHeight=735&originWidth=1000&originalType=binary&ratio=1&rotation=0&showTitle=false&size=50135&status=done&style=none&taskId=ua0ef30c4-c688-424a-9c7d-4b99d5dc3b8&title=&width=800)
```java
package Collection;

import java.util.LinkedList;

/**
 * @Author shu
 * @Date: 2022/02/25/ 9:44
 * @Description
 **/
public class LinkListTest {
    public static void main(String[] args) {
        LinkedList<Integer> list =new LinkedList<>();
        for (int i = 0; i < 15; i++) {
            list.add(i);
        }
    }
}
```
##### 1.2.3.1 重要属性
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1649740921457-80a2795e-2f8f-40b7-97e8-bd73bba7e98c.png#clientId=udb6e56c6-193c-4&from=paste&height=383&id=u83e61b3a&originHeight=479&originWidth=1052&originalType=binary&ratio=1&rotation=0&showTitle=false&size=26665&status=done&style=none&taskId=uce9e7faa-554f-415f-9e3b-7af32b90020&title=&width=841.6)
```java
 private static class Node<E> {
     	// 节点内容
        E item;
     	// 节点上一个指向
        Node<E> next;
     	// 节点上一个指向
        Node<E> prev;

        Node(Node<E> prev, E element, Node<E> next) {
            this.item = element;
            this.next = next;
            this.prev = prev;
        }
    }


 	transient int size = 0;

  	// 指向第一个节点的指针。
    transient Node<E> first;

	// 指向最后一个节点的指针。
    transient Node<E> last;
```
##### 1.2.3.2 基本方法
```java
	// 获取第一个元素
    public E getFirst() {
        final Node<E> f = first;
        if (f == null)
            throw new NoSuchElementException();
        return f.item;
    }

   	// 获取最后一个元素
    public E getLast() {
        final Node<E> l = last;
        if (l == null)
            throw new NoSuchElementException();
        return l.item;
    }

	// 移除第一个元素
    public E removeFirst() {
        final Node<E> f = first;
        if (f == null)
            throw new NoSuchElementException();
        return unlinkFirst(f);
    }

   // 移除最后一个元素
    public E removeLast() {
        final Node<E> l = last;
        if (l == null)
            throw new NoSuchElementException();
        return unlinkLast(l);
    }

  	// 增加第一个元素
    public void addFirst(E e) {
        linkFirst(e);
    }

   	// 增加最后一个元素
    public void addLast(E e) {
        linkLast(e);
    }

	// 增加一个元素
    public boolean add(E e) {
        linkLast(e);
        return true;
    }

```
##### 1.2.3.3 基本执行流程
```java
  public boolean add(E e) {
        linkLast(e);
        return true;
    }


	/**
     * Links e as last element.第一次的话，first,next都指向一个node
     */
    void linkLast(E e) {
        final Node<E> l = last;
        final Node<E> newNode = new Node<>(l, e, null);
        last = newNode;
        if (l == null)
            first = newNode;
        else
            l.next = newNode;
        size++;
        modCount++;
    }


 	/**
     * Unlinks non-null first node f.
     */
    private E unlinkFirst(Node<E> f) {
        // assert f == first && f != null;
        //获取元素信息
        final E element = f.item;
        // 获取下一个节点元素
        final Node<E> next = f.next;
        // 赋值为空
        f.item = null;
        f.next = null; // help GC
        // 上一个元素指向一个元素
        first = next;
        if (next == null)
            last = null;
        else
            next.prev = null;
        size--;
        modCount++;
        return element;
    }
```
##### 1.2.3.4 总结
![](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650118329210-f09f0e40-21a4-400f-b077-03c75bc6d491.png#clientId=u4f1fdc3c-bf5c-4&from=paste&id=uaec2af88&originHeight=541&originWidth=1359&originalType=url&ratio=1&rotation=0&showTitle=false&status=done&style=none&taskId=u4a964e80-51b4-4eca-b96b-eeb76cd3fb6&title=)
### 1.3 Set接口
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650071568417-de0f76cc-df27-4369-9172-e0ff9f2d5e16.png#clientId=ud4cb1ee8-ca22-4&from=paste&height=536&id=u07e83fa0&originHeight=670&originWidth=1519&originalType=binary&ratio=1&rotation=0&showTitle=false&size=278880&status=done&style=none&taskId=u72e26112-b975-4695-bab6-ac3ba99220d&title=&width=1215.2)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650071593166-789c41d3-e11d-480a-817e-fb4475dfec75.png#clientId=ud4cb1ee8-ca22-4&from=paste&height=462&id=ue9c22ee4&originHeight=578&originWidth=1395&originalType=binary&ratio=1&rotation=0&showTitle=false&size=967786&status=done&style=none&taskId=u298f6d33-41ed-494d-aba7-31faa338364&title=&width=1116)
```java
public interface Set<E> extends Collection<E> {
   	// 大小
    int size();
	// 是否为空
    boolean isEmpty();
	// 包含元素
    boolean contains(Object o);
	// 迭代器
    Iterator<E> iterator();
	// 转换成数组
    Object[] toArray();
	// 添加元素
    boolean add(E e);
	// 移除元素
    boolean remove(Object o);

    boolean containsAll(Collection<?> c);


    boolean addAll(Collection<? extends E> c);


    boolean retainAll(Collection<?> c);

    boolean removeAll(Collection<?> c);

    void clear();

    boolean equals(Object o);


    int hashCode();


    @Override
    default Spliterator<E> spliterator() {
        return Spliterators.spliterator(this, Spliterator.DISTINCT);
    }
}

```
#### 1.3.1 HashSet
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650073603622-1b04b5b4-ae7c-48b8-bbec-f3f437955253.png#clientId=ud4cb1ee8-ca22-4&from=paste&height=536&id=ub82853a0&originHeight=670&originWidth=1222&originalType=binary&ratio=1&rotation=0&showTitle=false&size=978768&status=done&style=none&taskId=ud674371f-99cc-4cfa-94ed-8bd933529b4&title=&width=977.6)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650118400136-c13bb138-9f3d-47a8-93ad-b6ab78043154.png#clientId=u4f1fdc3c-bf5c-4&from=paste&height=501&id=ua9739d7f&originHeight=626&originWidth=968&originalType=binary&ratio=1&rotation=0&showTitle=false&size=38794&status=done&style=none&taskId=ua5d96d8c-6b93-4d9f-b7f3-6495f5bf494&title=&width=774.4)
```java
package Set;
import java.util.HashSet;

/**
 * @Author shu
 * @Date: 2022/02/25/ 10:47
 * @Description
 **/
public class HashSetTest {
    public static void main(String[] args) {
        HashSet<Object> hashSet = new HashSet<>();
        hashSet.add("hhhh");
        hashSet.add("bbb");
    }
}
```
##### 1.3.1.1构造器

 从构造器中可以看出其底层实际是HashMap
```java
 public HashSet() {
        map = new HashMap<>();
    }

 public HashSet(Collection<? extends E> c) {
        map = new HashMap<>(Math.max((int) (c.size()/.75f) + 1, 16));
        addAll(c);
    }

 public HashSet(int initialCapacity, float loadFactor) {
        map = new HashMap<>(initialCapacity, loadFactor);
    }
```
##### 1.3.1.2 添加流程

- 基本流程，add方法进行断点调式，添加第一个元素
```java
// 添加方法
public boolean add(E e) {
    	// PRENTMap 中的对象关联的虚拟值
        return map.put(e, PRESENT)==null;
    }


public V put(K key, V value) {
        return putVal(hash(key), key, value, false, true);
    }

// 进行Hash计算
static final int hash(Object key) {
        int h;
    	// 采用位运算，避免指针碰撞
        return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
 }

final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
        Node<K,V>[] tab; Node<K,V> p; int n, i;
        // 判断数组是否为空，长度是否为0，是则进行扩容数组初始化
        if ((tab = table) == null || (n = tab.length) == 0)
            n = (tab = resize()).length;
        // 通过hash算法找到数组下标得到数组元素，为空则新建
        if ((p = tab[i = (n - 1) & hash]) == null)
            tab[i] = newNode(hash, key, value, null);
        else {
            Node<K,V> e; K k;
             // 找到数组元素，hash相等同时key相等，则直接覆盖
            if (p.hash == hash &&
                ((k = p.key) == key || (key != null && key.equals(k))))
                e = p;
            // 该数组元素在链表长度>8后形成红黑树结构的对象
            else if (p instanceof TreeNode)
                e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
            else {
                // 该数组元素hash相等，key不等，同时链表长度<8.进行遍历寻找元素，有就覆盖无则新建
                for (int binCount = 0; ; ++binCount) {
                    if ((e = p.next) == null) {
                        // 新建链表中数据元素
                        p.next = newNode(hash, key, value, null);
                        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                            // 链表长度>=8 结构转为 红黑树
                            treeifyBin(tab, hash);
                        break;
                    }
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        break;
                    p = e;
                }
            }
            if (e != null) { // existing mapping for key
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                afterNodeAccess(e);
                return oldValue;
            }
        }
        ++modCount;
        if (++size > threshold)
            resize();
        afterNodeInsertion(evict);
        return null;
    }



/**
初始化或加倍表大小。如果为空，则按照字段阈值中保存的初始容量目标进行分配。否则，因为我们使用二次幂展开，每个 bin 中的元素必须保持相同的索引，或者在新表中以二次幂的偏移量移动
**/
final Node<K,V>[] resize() {

        Node<K,V>[] oldTab = table;

        int oldCap = (oldTab == null) ? 0 : oldTab.length;
    	// 临界值=（容量）*（负载因子）
        int oldThr = threshold;

        int newCap, newThr = 0;

        if (oldCap > 0) {
            if (oldCap >= MAXIMUM_CAPACITY) {
                threshold = Integer.MAX_VALUE;
                return oldTab;
            }
            else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                     oldCap >= DEFAULT_INITIAL_CAPACITY)
                newThr = oldThr << 1; // double threshold
        }

        else if (oldThr > 0) // initial capacity was placed in threshold
            newCap = oldThr;
    	// 第一次初始化
        else {
            // table默认16
            newCap = DEFAULT_INITIAL_CAPACITY;
            // 临界值：临界值=（容量）*（负载因子）=16*0.75=12
            newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
        }
        if (newThr == 0) {
            float ft = (float)newCap * loadFactor;
            newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                      (int)ft : Integer.MAX_VALUE);
        }
    	//临界值
        threshold = newThr;
        @SuppressWarnings({"rawtypes","unchecked"})
            Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
    	// 表结构初始化完毕，并返回
        table = newTab;
        if (oldTab != null) {
            for (int j = 0; j < oldCap; ++j) {
                Node<K,V> e;
                if ((e = oldTab[j]) != null) {
                    oldTab[j] = null;
                    if (e.next == null)
                        newTab[e.hash & (newCap - 1)] = e;
                    else if (e instanceof TreeNode)
                        ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                    else { // preserve order
                        Node<K,V> loHead = null, loTail = null;
                        Node<K,V> hiHead = null, hiTail = null;
                        Node<K,V> next;
                        do {
                            next = e.next;
                            if ((e.hash & oldCap) == 0) {
                                if (loTail == null)
                                    loHead = e;
                                else
                                    loTail.next = e;
                                loTail = e;
                            }
                            else {
                                if (hiTail == null)
                                    hiHead = e;
                                else
                                    hiTail.next = e;
                                hiTail = e;
                            }
                        } while ((e = next) != null);
                        if (loTail != null) {
                            loTail.next = null;
                            newTab[j] = loHead;
                        }
                        if (hiTail != null) {
                            hiTail.next = null;
                            newTab[j + oldCap] = hiHead;
                        }
                    }
                }
            }
        }
        return newTab;
    }




```
**重点理解**
```java
 final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {

        Node<K,V>[] tab;
     	Node<K,V> p;
     	int n, i;

        if ((tab = table) == null || (n = tab.length) == 0)
            n = (tab = resize()).length;

        if ((p = tab[i = (n - 1) & hash]) == null)
            tab[i] = newNode(hash, key, value, null);

 		// 重复元素
        else {
            Node<K,V> e;
            K k;
            // (1)准备加入的key 和p指向的Node 结点的key 是同一个对象
            // (2) p指向的Node 结点的key 的equals()和准备加入的key比较后相同
            if (p.hash == hash &&
                ((k = p.key) == key
                 || (key != null && key.equals(k))))
                // 将节点
                e = p;

            // 是不是一颗红黑树
            else if (p instanceof TreeNode)
                e = ((TreeNode<K,V>)p)
                .putTreeVal(this, tab, hash, key, value);

            else
            {
                // 加入链表后面
                // 依次和该链表的每一个元素比较后，都不相同，则加入到该链表的最后
                for (int binCount = 0; ; ++binCount) {
                    if ((e = p.next) == null) {
                        p.next = newNode(hash, key, value, null);
                        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                            // 是否转成红黑树，table的size大于64
                            // if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)
                            treeifyBin(tab, hash);
                        break;
                    }
                  // 依次和该链表的每六个元素比较过程中，如果有相同情况,就break
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        break;
                    p = e;
                }
            }

            // 返回旧数据
            if (e != null) { // existing mapping for key
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                afterNodeAccess(e);
                return oldValue;
            }
        }

        ++modCount;
        if (++size > threshold)
            resize();
        afterNodeInsertion(evict);

        return null;

    }
```
##### 1.3.1.3 总结
![](https://cdn.nlark.com/yuque/0/2022/webp/12426173/1646013674112-f0492ec1-9e92-431d-bff1-45240c38b9ba.webp#clientId=u8c90cd2b-f2d5-4&from=paste&id=uf5e71f1c&originHeight=1360&originWidth=1716&originalType=url&ratio=1&rotation=0&showTitle=false&status=done&style=none&taskId=u824b4faf-3775-4011-9d79-e9e1f55c4ac&title=)

- 首选判断table是否为空，数组长度为空，将会进行第一次初始化。（在实例化HashMap是，并不会进行初始化数组）。
- 进行第一次resize()扩容之后。开始通过hash算法寻址找到数组下标。若数组元素为空，则创建新的数组元素。若数组元素不为空，同时hash相等，key不相等，同时不是TreeNode数据对象，将遍历该数组元素下的链表元素。若找到对应的元素，则覆盖，如果没有找到，就新建元素，放入上一个链表元素的next中，在放入元素之后，如果条件满足"链表元素长度>8"，则将该链表结构转为"红黑树结构"。
- 找到对应的数组元素或者链表元素，同时创建新的数据元素或者覆盖元素之后。如果条件满足元素大小size>允许的最大元素数量threshold，则再一次进行扩容操作。每次扩容操作，新的数组大小将是原始的数组长度的两倍。
- put操作完成。
#### 1.3.2 LinkedHashSet
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650118740584-34f47752-6116-4757-870a-60a38c2a575c.png#clientId=u4f1fdc3c-bf5c-4&from=paste&height=556&id=u77570fd1&originHeight=695&originWidth=1008&originalType=binary&ratio=1&rotation=0&showTitle=false&size=47749&status=done&style=none&taskId=u233bb709-8433-4c8b-b223-4b00002bfdf&title=&width=806.4)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650076045010-4a4f8d84-2138-4887-a517-0662bc66cdc7.png#clientId=ud4cb1ee8-ca22-4&from=paste&height=506&id=ubad8cef3&originHeight=633&originWidth=1262&originalType=binary&ratio=1&rotation=0&showTitle=false&size=1015440&status=done&style=none&taskId=u93c5ebd8-d4b4-4d8e-a355-00c8365fee0&title=&width=1009.6)
```java
package Set;

import java.util.LinkedHashSet;

/**
 * @Author shu
 * @Date: 2022/02/28/ 9:41
 * @Description
 **/
public class LinkedHashSetTest {
    public static void main(String[] args) {
        LinkedHashSet<Integer> hashSet=new LinkedHashSet<>();
        hashSet.add(1);
        hashSet.add(2);
        hashSet.add(3);
    }
}

```
##### 1.3.2.1 构造器
我们可以看出LinkHashSet 其实是LinkedHashMap
```java
 public LinkedHashSet(int initialCapacity) {
        super(initialCapacity, .75f, true);
    }
// 初始化容量16 ，负载因子0.75f
    public LinkedHashSet() {
        super(16, .75f, true);
    }

   HashSet(int initialCapacity, float loadFactor, boolean dummy) {
        map = new LinkedHashMap<>(initialCapacity, loadFactor);
    }

```
##### 1.3.2.2 数据节点类型 Entry
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650077388978-016a5822-f7bb-44b1-8ced-cc010e4226a6.png#clientId=u4ab71584-2ad5-4&from=paste&height=218&id=ub6a11afd&originHeight=272&originWidth=1742&originalType=binary&ratio=1&rotation=0&showTitle=false&size=138990&status=done&style=none&taskId=u228f05ff-4d6c-4102-97bb-13f276887be&title=&width=1393.6)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650077619924-8b0f080e-3fae-41d1-b2de-dcc30a0df06b.png#clientId=u4ab71584-2ad5-4&from=paste&height=315&id=u06c80c0b&originHeight=394&originWidth=1573&originalType=binary&ratio=1&rotation=0&showTitle=false&size=195515&status=done&style=none&taskId=uc00081fb-f1af-4569-be3d-97cb82aab97&title=&width=1258.4)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650078497801-a4173a95-d3c1-4297-bf92-8baf8e7fb11f.png#clientId=udb839a3e-87a4-4&from=paste&height=367&id=u82c732da&originHeight=459&originWidth=1624&originalType=binary&ratio=1&rotation=0&showTitle=false&size=495974&status=done&style=none&taskId=uffe3d067-db2e-495e-80f9-d6e017d0dfa&title=&width=1299.2)
```java

    /**
     * HashMap.Node subclass for normal LinkedHashMap entries.
     */
    static class Entry<K,V> extends HashMap.Node<K,V> {
        Entry<K,V> before, after;
        Entry(int hash, K key, V value, Node<K,V> next) {
            super(hash, key, value, next);
        }
    }
```
##### 1.3.2.3 添加元素
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650078100096-e8dc1b16-8570-4e74-9820-08de425f1f3c.png#clientId=u4ab71584-2ad5-4&from=paste&height=295&id=u98f4d929&originHeight=369&originWidth=1500&originalType=binary&ratio=1&rotation=0&showTitle=false&size=262452&status=done&style=none&taskId=uc9965d7b-d396-4087-a81e-d62ce413fff&title=&width=1200)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650078243884-05a7026b-414e-430a-8639-75d5ddde2952.png#clientId=u4ab71584-2ad5-4&from=paste&height=382&id=u5d789b2a&originHeight=477&originWidth=1240&originalType=binary&ratio=1&rotation=0&showTitle=false&size=191820&status=done&style=none&taskId=uef58f45a-0d4e-4ab0-b80f-74300d45141&title=&width=992)
```java
// 调用添加方法
public boolean add(E e) {
        return map.put(e, PRESENT)==null;
    }
// 调用Map添加方法
 public V put(K key, V value) {
        return putVal(hash(key), key, value, false, true);
    }
// 计算Hadh值
static final int hash(Object key) {
        int h;
        return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
    }

真正添加元素
final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {

        Node<K,V>[] tab;
     	Node<K,V> p;
     	int n, i;

        if ((tab = table) == null || (n = tab.length) == 0)
            n = (tab = resize()).length;

        if ((p = tab[i = (n - 1) & hash]) == null)
            tab[i] = newNode(hash, key, value, null);

 		// 重复元素
        else {
            Node<K,V> e;
            K k;
            // (1)准备加入的key 和p指向的Node 结点的key 是同一个对象
            // (2) p指向的Node 结点的key 的equals()和准备加入的key比较后相同
            if (p.hash == hash &&
                ((k = p.key) == key
                 || (key != null && key.equals(k))))
                // 将节点
                e = p;

            // 是不是一颗红黑树
            else if (p instanceof TreeNode)
                e = ((TreeNode<K,V>)p)
                .putTreeVal(this, tab, hash, key, value);

            else
            {
                // 加入链表后面
                // 依次和该链表的每一个元素比较后，都不相同，则加入到该链表的最后
                for (int binCount = 0; ; ++binCount) {
                    if ((e = p.next) == null) {
                        p.next = newNode(hash, key, value, null);
                        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                            // 是否转成红黑树，table的size大于64
                            // if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)
                            treeifyBin(tab, hash);
                        break;
                    }
                  // 依次和该链表的每六个元素比较过程中，如果有相同情况,就break
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        break;
                    p = e;
                }
            }

            // 返回旧数据
            if (e != null) { // existing mapping for key
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                afterNodeAccess(e);
                return oldValue;
            }
        }

        ++modCount;
        if (++size > threshold)
            resize();
        afterNodeInsertion(evict);

        return null;

    }
```
##### 1.2.3.4 总结

- 哈希表和[链表](https://so.csdn.net/so/search?q=%E9%93%BE%E8%A1%A8&spm=1001.2101.3001.7020)实现的Set接口， 具有可预测的迭代次序;
- 由链表保证元素有序，也就是说元素的存储和取出顺序是一致的;
- 由哈希表保证元素唯一， 也就是说没有重复的元素;

#### 1.3.4 TreeSet
TreeMap：基于红黑二叉树的NavigableMap的实现，线程非安全，不允许null，key不可以重复，value允许重复，存入TreeMap的元素应当实现Comparable接口或者实现Comparator接口，会按照排序后的顺序迭代元素，两个相比较的key不得抛出classCastException。主要用于存入元素的时候对元素进行自动排序，迭代输出的时候就按排序顺序输出
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650114430128-80f5aafd-7043-4b62-aae7-4bd7bb257ccb.png#clientId=u4f1fdc3c-bf5c-4&from=paste&height=549&id=u86ea693a&originHeight=686&originWidth=1119&originalType=binary&ratio=1&rotation=0&showTitle=false&size=47969&status=done&style=none&taskId=uacf3ae20-bafc-46ae-8212-3a0d33a0ca3&title=&width=895.2)
##### 1.3.4.1 构造器
```java
TreeSet(NavigableMap<E,Object> m) {
        this.m = m;
    }

// 由无参构造器可以看出底层是TreeMap
public TreeSet() {
        this(new TreeMap<E,Object>());
    }

public TreeSet(Comparator<? super E> comparator) {
        this(new TreeMap<>(comparator));
    }

```
##### 1.3.4.2 树节点
```java
 static final class Entry<K,V> implements Map.Entry<K,V> {
        K key;
        V value;
        Entry<K,V> left;
        Entry<K,V> right;
        Entry<K,V> parent;
        boolean color = BLACK;

        /**
         * Make a new cell with given key, value, and parent, and with
         * {@code null} child links, and BLACK color.
         */
        Entry(K key, V value, Entry<K,V> parent) {
            this.key = key;
            this.value = value;
            this.parent = parent;
        }
 }
```
##### 1.3.2.3 增加方法
```java
public V put(K key, V value) {
      //定义一个数节点来保存根元素
        Entry<K,V> t = root;
        //如果t==null，表明是一个空链表
        if (t == null) {
        //如果根节点为null，将传入的键值对构造成根节点（根节点没有父节点，所以传入的父节点为null）
            root = new Entry<K,V>(key, value, null);
            //设置该集合的size为1
            size = 1;
            //修改此时+1
            modCount++;
            return null;
        }
        // 记录比较结果
        int cmp;
        Entry<K,V> parent;
        // 分割比较器和可比较接口的处理
        Comparator<? super K> cpr = comparator;
        // 有比较器的处理，即采用定制排序
        if (cpr != null) {
            // do while实现在root为根节点移动寻找传入键值对需要插入的位置
            do {
                //使用parent上次循环后的t所引用的Entry
                // 记录将要被掺入新的键值对将要节点(即新节点的父节点)
                parent = t;
                // 使用比较器比较父节点和插入键值对的key值的大小
                cmp = cpr.compare(key, t.key);
                // 插入的key较大
                if (cmp < 0)
                    t = t.left;
                // 插入的key较小
                else if (cmp > 0)
                    t = t.right;
                // key值相等，替换并返回t节点的value(put方法结束)
                else
                    return t.setValue(value);
            } while (t != null);
        }
        // 没有比较器的处理
        else {
            // key为null抛出NullPointerException异常
            if (key == null)
                throw new NullPointerException();
            Comparable<? super K> k = (Comparable<? super K>) key;
            // 与if中的do while类似，只是比较的方式不同
            do {
                parent = t;
                cmp = k.compareTo(t.key);
                if (cmp < 0)
                    t = t.left;
                else if (cmp > 0)
                    t = t.right;
                else
                    return t.setValue(value);
            } while (t != null);
        }
        // 没有找到key相同的节点才会有下面的操作
        // 根据传入的键值对和找到的“父节点”创建新节点
        Entry<K,V> e = new Entry<K,V>(key, value, parent);
        // 根据最后一次的判断结果确认新节点是“父节点”的左孩子还是又孩子
        if (cmp < 0)
            parent.left = e;
        else
            parent.right = e;
        // 对加入新节点的树进行调整
        fixAfterInsertion(e);
        // 记录size和modCount
        size++;
        modCount++;
        // 因为是插入新节点，所以返回的是null
        return null;
    }

```

### 1.4 Map接口
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650087296746-dbf5f2e6-8d42-40c1-861c-7b6ae44aecee.png#clientId=udb839a3e-87a4-4&from=paste&height=428&id=ua4e012f0&originHeight=535&originWidth=1307&originalType=binary&ratio=1&rotation=0&showTitle=false&size=177163&status=done&style=none&taskId=u706552cc-8a1b-4e1f-95cc-c3b3cbf64ba&title=&width=1045.6)

- Map集合是一个双列集合，一个元素包含两个值(一个key,一个value)
- Map集合中的元素,key和value的数据类型可以相同，也可以不同
- Map集合中的元素,key不允许重复，value可以重复
- Map集合中的元素,key和value是一一对应的
- Map为了方便程序员的遍历，还会创建 EntrySet集合，该集合存放的元素的类型 Entry，而一个Entry对象就有k,v EntrySet<Entry<K,V>>即: transient Set<Map.Entry<K,V>> entrySet
#### 1.4.1 HashMap
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650094417035-ecc63711-ad42-4868-89bf-0457997c8fc6.png#clientId=u4f1fdc3c-bf5c-4&from=paste&height=424&id=ufb98f0ac&originHeight=530&originWidth=1336&originalType=binary&ratio=1&rotation=0&showTitle=false&size=1226016&status=done&style=none&taskId=u456454c6-3033-4c44-834a-13732f86334&title=&width=1068.8)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650096613609-12e64b01-f030-4b86-9f78-a954a1ba966c.png#clientId=u4f1fdc3c-bf5c-4&from=paste&height=561&id=ue6251ef7&originHeight=701&originWidth=1360&originalType=binary&ratio=1&rotation=0&showTitle=false&size=1212753&status=done&style=none&taskId=u1f4687a2-9218-45b7-bcf5-09267e25b42&title=&width=1088)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650096677302-3261bb71-89df-44d6-9ed5-b8b4ad17f1c1.png#clientId=u4f1fdc3c-bf5c-4&from=paste&height=539&id=u36da4937&originHeight=674&originWidth=1401&originalType=binary&ratio=1&rotation=0&showTitle=false&size=1599528&status=done&style=none&taskId=u893738e4-7890-4fb6-8d0f-f3c196fdee4&title=&width=1120.8)
```java
package Map;

import java.util.HashMap;
import java.util.Map;

/**
 * @Author shu
 * @Version 1.0
 * @Date: 2022/04/16/ 14:05
 * @Description debug测试
 **/
public class HashMapTest {
    public static void main(String[] args) {
        Map<String,Integer> map=new HashMap<String,Integer>();
        map.put("1",101);
        map.put("2",102);
    }
}

```
##### 1.4.1.1 构造器与构造器
```java
  /** 默认容量
     * The default initial capacity - MUST be a power of two.
     */
    static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; // aka 16

     * The load factor used when none specified in constructor.
     */ 负载因子
    static final float DEFAULT_LOAD_FACTOR = 0.75f;

/**
     * Constructs an empty <tt>HashMap</tt> with the specified initial
     * capacity and the default load factor (0.75).
     *
     * @param  initialCapacity the initial capacity.
     * @throws IllegalArgumentException if the initial capacity is negative.
     */
    public HashMap(int initialCapacity) {
        this(initialCapacity, DEFAULT_LOAD_FACTOR);
    }

    /**
     * Constructs an empty <tt>HashMap</tt> with the default initial capacity
     * (16) and the default load factor (0.75).
     */
    public HashMap() {
        this.loadFactor = DEFAULT_LOAD_FACTOR; // all other fields defaulted
    }
```
##### 1.4.1.2 增加过程
```java
// 调用put方法
    public V put(K key, V value) {
        return putVal(hash(key), key, value, false, true);
    }

//
真正添加元素
final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {

        Node<K,V>[] tab;
     	Node<K,V> p;
     	int n, i;
         // 默认初始容量16
        if ((tab = table) == null || (n = tab.length) == 0)
            n = (tab = resize()).length;
         // 是否在tab表中存在该值
        if ((p = tab[i = (n - 1) & hash]) == null)
            // 不存在该值直接添加
            tab[i] = newNode(hash, key, value, null);
 		// 在tab表中存在该值
        else {
            Node<K,V> e;
            K k;

            // 如果加入该值的Hash值相等且key相等，就替换原来的的key对应的值
            if (p.hash == hash &&
                ((k = p.key) == key
                 || (key != null && key.equals(k))))
                // 将节点
                e = p;

            // 是不是一颗红黑树
            else if (p instanceof TreeNode)
                // 进添加到树节点中
                e = ((TreeNode<K,V>)p)
                .putTreeVal(this, tab, hash, key, value);

            else
            {
                // 加入链表后面
                // 依次和该链表的每一个元素比较后，都不相同，则加入到该链表的最后
                for (int binCount = 0; ; ++binCount) {
                    if ((e = p.next) == null) {
                        p.next = newNode(hash, key, value, null);
                        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                            // 是否转成红黑树，table的size大于64
                            // if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)
                            treeifyBin(tab, hash);
                        break;
                    }
                  // 依次和该链表的每六个元素比较过程中，如果有相同情况,就break
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        break;
                    p = e;
                }
            }

            // 返回旧数据
            if (e != null) { // existing mapping for key
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                afterNodeAccess(e);
                return oldValue;
            }
        }

        ++modCount;
        // 看大小是否达到阈值
        if (++size > threshold)
            resize();
        afterNodeInsertion(evict);

        return null;

    }
```
##### 1.4.1.3 进行树化
```java

    final void treeifyBin(Node<K,V>[] tab, int hash) {
        int n, index; Node<K,V> e;
        if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)
            resize();
        else if ((e = tab[index = (n - 1) & hash]) != null) {
            TreeNode<K,V> hd = null, tl = null;
            do {
                TreeNode<K,V> p = replacementTreeNode(e, null);
                if (tl == null)
                    hd = p;
                else {
                    p.prev = tl;
                    tl.next = p;
                }
                tl = p;
            } while ((e = e.next) != null);
            if ((tab[index] = hd) != null)
                hd.treeify(tab);
        }
    }
```

#### 1.4.2 HashTable
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650104032910-509e4262-de7c-437f-b6db-2aa6d73dd497.png#clientId=u4f1fdc3c-bf5c-4&from=paste&height=263&id=u81f50dd8&originHeight=329&originWidth=1303&originalType=binary&ratio=1&rotation=0&showTitle=false&size=562504&status=done&style=none&taskId=uc516e979-368b-48c6-a0fa-1491a29981f&title=&width=1042.4)
##### 1.4.2.1 构造器
初始化容量为11，阈值8
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650111200761-46a8c6ff-1773-4227-990e-bb8b11067a05.png#clientId=u4f1fdc3c-bf5c-4&from=paste&height=482&id=u346587d7&originHeight=602&originWidth=1785&originalType=binary&ratio=1&rotation=0&showTitle=false&size=62361&status=done&style=none&taskId=u7d88652a-9dcd-4c6e-8d5f-67b1439b59b&title=&width=1428)
```java
// 使用指定的初始容量和默认加载因子 (0.75) 构造一个新的空哈希表。
public Hashtable() {
        this(11, 0.75f);
    }

// 使用指定的初始容量和指定的负载因子构造一个新的空哈希表。
public Hashtable(int initialCapacity, float loadFactor) {
        if (initialCapacity < 0)
            throw new IllegalArgumentException("Illegal Capacity: "+
                                               initialCapacity);
        if (loadFactor <= 0 || Float.isNaN(loadFactor))
            throw new IllegalArgumentException("Illegal Load: "+loadFactor);

        if (initialCapacity==0)
            initialCapacity = 1;
        this.loadFactor = loadFactor;
        table = new Entry<?,?>[initialCapacity];
        threshold = (int)Math.min(initialCapacity * loadFactor, MAX_ARRAY_SIZE + 1);
    }

// 构造一个与给定 Map 具有相同映射的新哈希表。哈希表的初始容量足以容纳给定 Map 中的映射和默认加载因子 (0.75)
 public Hashtable(Map<? extends K, ? extends V> t) {
        this(Math.max(2*t.size(), 11), 0.75f);
        putAll(t);
    }
```
##### 1.4.2.2 添加方法
```java
// 指定key映射到此哈希表中的指定value 。键和值都不能为null 。
可以通过使用与原始键相同的键调用get方法来检索该值。
public synchronized V put(K key, V value) {
        // 先判断值不能为Null
        // Make sure the value is not null
        if (value == null) {
            throw new NullPointerException();
        }

        // 确报key的Hash值唯一
        Entry<?,?> tab[] = table;
        int hash = key.hashCode();
        int index = (hash & 0x7FFFFFFF) % tab.length;
        @SuppressWarnings("unchecked")
        Entry<K,V> entry = (Entry<K,V>)tab[index];
        // 判断是否重复值
        for(; entry != null ; entry = entry.next) {
            // 交换值
            if ((entry.hash == hash) && entry.key.equals(key)) {
                V old = entry.value;
                entry.value = value;
                return old;
            }
        }
        // 增加到HashTable$Entry中
        addEntry(hash, key, value, index);
        return null;
    }

// 添加元素
private void addEntry(int hash, K key, V value, int index) {
        modCount++;

        Entry<?,?> tab[] = table;
        // 是否大于阈值，需要扩容
        if (count >= threshold) {
            // Rehash the table if the threshold is exceeded
            rehash();

            tab = table;
            hash = key.hashCode();
            index = (hash & 0x7FFFFFFF) % tab.length;
        }
        // 真正的添加动作
        // Creates the new entry.
        @SuppressWarnings("unchecked")
        Entry<K,V> e = (Entry<K,V>) tab[index];
        tab[index] = new Entry<>(hash, key, value, e);
        count++;
    }


//增加此哈希表的容量并在内部重新组织此哈希表，以便更有效地容纳和访问其条目。当哈希表中的键数超过此哈希表的容量和负载因子时，将自动调用此方法。
protected void rehash() {
        int oldCapacity = table.length;
        Entry<?,?>[] oldMap = table;

        // 新数组的容量=旧数组长度*2+1
        int newCapacity = (oldCapacity << 1) + 1;
        // 保证新数组的大小永远小于等于MAX_ARRAY_SIZE
        // MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8
        if (newCapacity - MAX_ARRAY_SIZE > 0) {
            if (oldCapacity == MAX_ARRAY_SIZE)
                return;
            newCapacity = MAX_ARRAY_SIZE;
        }
        // 创建新数组
        Entry<?,?>[] newMap = new Entry<?,?>[newCapacity];

        modCount++;
        // 计算新的临界值
        threshold = (int)Math.min(newCapacity * loadFactor, MAX_ARRAY_SIZE + 1);
        table = newMap;

        // 将旧数组中的元素迁移到新数组中
        for (int i = oldCapacity ; i-- > 0 ;) {
            for (Entry<K,V> old = (Entry<K,V>)oldMap[i] ; old != null ; ) {
                Entry<K,V> e = old;
                old = old.next;

                //计算新数组下标
                int index = (e.hash & 0x7FFFFFFF) % newCapacity;
                // 头插法的方式迁移旧数组的元素
                e.next = (Entry<K,V>)newMap[index];
                newMap[index] = e;
            }
        }
    }

```
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650112613990-5e474aad-f0d8-4984-8c2e-488d14d76d03.png#clientId=u4f1fdc3c-bf5c-4&from=paste&height=354&id=u0e11db0f&originHeight=442&originWidth=1758&originalType=binary&ratio=1&rotation=0&showTitle=false&size=42511&status=done&style=none&taskId=u66df3305-83eb-45df-a23a-eaaae7c74f2&title=&width=1406.4)
##### 1.4.2.3 总结

- Hashtable扩容的数组长度是旧数组长度乘以2加1
- Hashtable采用取模的方式来计算数组下标，同时数组的长度尽量为素数或者奇数，这样的目的是为了减少Hash碰撞，计算出来的数组下标更加分散，让元素均匀的分布在数组各个位置。
- 与HashMap不同的是。在扩容时Hashtable采用头插法的方式迁移数据，使用头插法效率会更高。因为头插法减少了遍历链表的时间，效率更高。
- 虽然rehash()方法没有被synchronized修饰，这并不意味着rehash()方法非线程安全，这是因为所有调用rehash()的方法均被synchronized修饰。
- 所以即使HashMap因为线程安全问题在JDK1.8抛弃了头插法而采用高地位平移算法，Hashtable在JDK1.8仍采用头插法迁移元素，因为Hashtable为了线程安全而设计，不会存在HashMap类似的问题。
- Hashtable处于一个比较尴尬的位置，以至于官方也推荐如果不考虑线程安全，建议使用HashMap，如果考虑到同步效率，建议使用ConcurrentHashMap。
#### 1.4.3 TreeMap
**  **TreeMap继承AbstractMap，实现NavigableMap、Cloneable、Serializable三个接口。其中AbstractMap表明TreeMap为一个Map即支持key-value的集合， NavigableMap（[更多](http://docs.oracle.com/javase/7/docs/api/java/util/NavigableMap.html)）则意味着它支持一系列的导航方法，具备针对给定搜索目标返回最接近匹配项的导航方法 。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650116260539-17e83c8e-2a37-4ce5-a72f-7b94161661a0.png#clientId=u4f1fdc3c-bf5c-4&from=paste&height=429&id=u3194b2ba&originHeight=536&originWidth=1025&originalType=binary&ratio=1&rotation=0&showTitle=false&size=32902&status=done&style=none&taskId=uf44fb94f-1b81-4d39-9fd9-cef9f06ab0b&title=&width=820)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1650116294748-8b28f3a8-ea30-4b9e-ad40-471d8617b406.png#clientId=u4f1fdc3c-bf5c-4&from=paste&id=u005c6f68&originHeight=461&originWidth=701&originalType=url&ratio=1&rotation=0&showTitle=false&size=46989&status=done&style=none&taskId=u8a81662f-19fe-400a-a54d-ab5e4c0e7ec&title=)
原理同上TreeSet

[
](https://blog.csdn.net/weixin_41884010/article/details/100886250)
