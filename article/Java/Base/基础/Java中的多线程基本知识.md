---
title: Java中的多线程基本知识
sidebar_position: 4
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


# 并发编程

## 一 并发编程线程基础

### 1.1 进程与线程

![epub_25462418_2.jpg](https://cdn.nlark.com/yuque/0/2022/jpeg/12426173/1644582185035-1c90805b-214b-4b4c-addb-f81b882a8290.jpeg#clientId=ua82ea188-7f45-4&from=ui&id=u83cc68af&originHeight=687&originWidth=1000&originalType=binary&ratio=1&rotation=0&showTitle=false&size=47802&status=done&style=none&taskId=ud84d7a5a-dbda-4eba-8f52-2816c2942c4&title=)

- 进程：进程本身是不会独立存在的。进程是代码在数据集合上的一次运行活动，是系统进行资源分配和调度的基本单位，线程则是进程的一个执行路径，一个进程中至少有一个线程，进程中的多个线程共享进程的资源。
- 线程：一个进程中有多个线程，多个线程共享进程的堆和方法区资源，但是每个线程有自己的程序计数器和栈区域，线程是CPU分配的基本单位。
- 程序计数器：是一块内存区域，用来记录线程当前要执行的指令地址，其实程序计数器就是为了记录该线程让出CPU时的执行地址的，待再次分配到时间片时线程就可以从自己私有的计数器指定地址继续执行。
- 另外每个线程都有自己的栈资源，用于存储该线程的局部变量，这些局部变量是该线程私有的，其他线程是访问不了的，除此之外栈还用来存放线程的调用栈帧。
- 堆是一个进程中最大的一块内存，堆是被进程中的所有线程共享的，是进程创建时分配的，堆里面主要存放使用new操作创建的对象实例。
- 方法区则用来存放`JVM`加载的类、常量及静态变量等信息，也是线程共享的。

### 1.2 并行与并发

-  并行：**Concurrent），在操作系统中，是指一个时间段中有几个程序都处于已启动运行到运行完毕之间，且这几个程序都是在同一个处理机上运行。**、
-  并发：**当系统有一个以上CPU时，当一个CPU执行一个进程时，另一个CPU可以执行另一个进程，两个进程互不抢占CPU资源，可以同时进行，这种方式我们称之为并行(Parallel)，其实决定并行的因素不是CPU的数量，而是CPU的核心数量，比如一个CPU多个核也可以并行。**
-  **并发是在一段时间内宏观上多个程序同时运行，并行是在某一时刻，真正有多个程序在运行。**

### 1.3 线程状态
![image-20211130104936122.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1644582191890-acc650b4-13ac-468e-9ca1-f1b5789f9877.png#clientId=ua82ea188-7f45-4&from=ui&id=uee15e44c&originHeight=513&originWidth=1067&originalType=binary&ratio=1&rotation=0&showTitle=false&size=37861&status=done&style=none&taskId=ud03b2417-66a0-4025-b92f-0482948435a&title=)


- 线程的生命周期分为`新建（New）、就绪（Runnable）、运行（Running）、阻塞（Blocked）和死亡（Dead`）这5种状态。
- 新建（New）: 在Java中使用new关键字创建一个线程，新创建的线程将处于新建状态。
- 就绪状态（Runnable）：新建的线程对象在调用start方法之后将转为就绪状态，这个就绪状态是指该线程已经获取了除CPU资源外的其他资源，等待获取CPU资源后才会真正处于运行状态。
- 运行状态（Running）：就绪状态的线程在竞争到CPU的使用权并开始执行run方法的线程执行体时，会转为运行状态。
- 阻塞状态（Blocked）：运行中的线程会主动或被动地放弃CPU的使用权并暂停运行，此时该线程将转为阻塞状态。
- 线程死亡（Dead）：正常退出，或异常退出。

### 1.3 线程方法

- 线程等待：调用`wait`方法的线程会进入`WAITING`状态，只有等到其他线程的通知或被中断后才会返回。
- 线程睡眠：调用`sleep`方法会导致当前线程休眠。与`wait`方法不同的是，`sleep`方法不会释放当前占有的锁，会导致线程进入`TIMED-WATING`状态，而wait方法会导致当前线程进入`WATING`状态。
- 线程让步：调用`yield`方法会使当前线程让出（释放）CPU执行时间片，与其他线程一起重新竞争CPU时间片。
线程中断：`interrupt`方法用于向线程发行一个终止通知信号，会影响该线程内部的一个中断标识位，这个线程本身并不会因为调用了`interrupt`方法而改变状态（阻塞、终止等）。
- 线程加入：`join`方法用于等待其他线程终止，如果在当前线程中调用一个线程的`join`方法，则当前线程转为阻塞状态，等到另一个线程结束，当前线程再由阻塞状态转为就绪状态，等待获取CPU的使用权。
- 线程唤醒：Object类有个`notify`方法，用于唤醒在此对象监视器上等待的一个线程，如果所有线程都在此对象上等待，则会选择唤醒其中一个线程，选择是任意的。
- 后台守护线程：`setDaemon`方法用于定义一个守护线程，也叫作服务线程，该线程是后台线程，有一个特性，即为用户线程提供公共服务，在没有用户线程可服务时会自动离开。

### 1.4 简单实现

- Thread

```java
package com.Thread;

/**
 * @Author shu
 * @Date: 2021/11/30/ 10:59
 * @Description 线程的Thread创建方式
 **/
public class SimpleThread extends Thread{
    @Override
    public void run() {
        super.run();
        System.out.println("执行方法"+currentThread().getName());
    }

    public static void main(String[] args) {
        new SimpleThread().start();
    }
}
```

- Runnable

```java
package com.Thread;

/**
 * @Author shu
 * @Date: 2021/11/30/ 13:55
 * @Description 简单Runnable实现方式
 **/
public class SimpleRunnable implements Runnable{
    @Override
    public void run() {
        for (int i = 0; i <10 ; i++) {
            System.out.println("执行方法"+Thread.currentThread().getName()+i);
        }

    }

    public static void main(String[] args) {
        SimpleRunnable runnable = new SimpleRunnable();
        new Thread(runnable).start();


        //Lambda简写
        Runnable runs=(()->{
            for (int i = 0; i <10 ; i++) {
                System.out.println("执行方法"+Thread.currentThread().getName()+i);
            }
        });
    }
}
```

- Callable

```java
package com.Thread;

import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.FutureTask;

/**
 * @Author shu
 * @Date: 2021/11/30/ 14:00
 * @Description 简单的Callable实现
 **/
public class SimpleCallable {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        FutureTask futureTask=new FutureTask(new Callable() {
            @Override
            public Object call() throws Exception {
                int sum = 0 ;
                for(int i = 1 ; i <= 10 ; i++ ){
                    System.out.println(Thread.currentThread().getName()+" => " + i);
                    sum+=i;
                }
                return Thread.currentThread().getName()+"执行的结果是："+sum;
            }
        });
        futureTask.run();
        System.out.println(futureTask.get());
    }
}
```

> 总结一下


- Thread与Runnable其实是一致的，Thread实现了Runnable接口，唯一的缺点是无法接受线程返回的值
- Callable通过一个未来任务对象，来接受线程返回的值，两者适用于不同的环境

## 二 线程基本方法介绍

### 2.1 线程等待与唤醒

-  在工作中，我们可以随处看到线程等待，比如在BIO编程中，操作系统与JVM虚拟机是数据交换，需要线程等待内核空间从磁盘中，把数据封装好，才会交个线程等待，因此我们要了解方法，才能更好的理解高级框架中的底层逻辑问题，帮助我们更快的掌握知识点
-  当一个线程调用一个共享变量的`wait（）`方法时，该调用线程会被阻塞挂起，线程有运行状态切换到阻塞状态，且持有的锁会被让出
-  当其他线程调用了该共享对象的`notify（）`或者`notifyAll（）`方法，线程会被唤醒由阻塞状态变为运行状态
-  当其他线程调用了该线程的`interrupt（）`方法，该线程抛出`InterruptedException`异常返回，线程直接进入死亡状态
-  一个线程可以从挂起状态变为可以运行状态（也就是被唤醒），即使该线程没有被其他线程调用`notify（）、notifyAll（）`方法进行通知，或者被中断，或者等待超时，这就是所谓的虚假唤醒。

#### 2.1.1 线程等待

```java
package com.Thread.Wait;

import lombok.SneakyThrows;

/**
 * @Author shu
 * @Date: 2021/11/30/ 14:34
 * @Description
 **/
public class SimpleWaitRunnable {
    /**
     * 多线程的本质，就是对同一资源的争取
     */
    private static volatile Object resourceA = new Object();
    private static volatile Object resourceB = new Object();

    /**
     * 线程A
     */
    public static class ResourceA implements Runnable {

            @Override
            public void run() {
                try {
                    // 获取resourceA的共享资源监视器锁
                    synchronized (resourceA) {
                        System.out.println("获取线程A中resourceA的锁");
                        // 获取resourceB的共享资源的监视器锁
                        synchronized (resourceB) {
                            System.out.println("获取线程A中resourceB的锁");
                            // 线程A阻塞，并释放获取到的resourceA的锁
                            System.out.println("将线程A挂起，并释放resourceA的锁");
                            resourceA.wait();
                        }
                    }
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }


    /**
     * 线程B
     */
    public static class ResourceB implements Runnable {
            @Override
            public void run() {
                try{
                    // 休眠1s
                    Thread.sleep(1000);
                    // 获取resourceA的共享资源监视器锁
                    synchronized (resourceA) {
                        System.out.println("获取线程B中resourceA的锁");
                        System.out.println("获取线程B中resourceB的锁");
                        // 获取resourceB的共享资源的监视器锁
                        synchronized (resourceB) {
                            System.out.println("获取线程B中resourceB的锁...");
                            // 线程B阻塞，并释放获取到的resourceA的锁
                            System.out.println("获取线程B中resourceB的锁...");
                            resourceA.wait();
                        }
                    }
                } catch(InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }

    public static void main(String[] args) {
        new Thread(new ResourceA()).start();
        new Thread(new ResourceB()).start();
    }


}
```

- 线程A与线程B同时去争取A，B资源，但是线程B先休眠`1s`，线程A优先获取到资源
- 线程A先获取到共享变量`resourceA`和共享变量`resourceB`的锁，然后`resourceA`的`wait()`方法挂起了自己，并释放了`resourceA`的锁，但是`resourceB`还是有线程A占用，迟迟没有释放
- 线程B休眠结束后，肯定先尝试获取`resourceA`上的锁，如果当时线程A还没有调用wait()方法释放该锁，则线程B会被阻塞
- 当线程A释放了`resourceA上`的锁后，线程B就会获取到`resourceA上`的锁，然后尝试获取`resourceB上`的锁。由于线程A调用的是`resourceA上`的wait()方法，所以并没有将`resourceB`上的锁给释放掉，当线程B尝试获取`resourceB`上的锁时就会被阻塞

#### 2.1.2 线程打断

- 线程中断是一种线程间的协作模式，通过设置线程的中断标志并不能直接终止该线程的执行，而是被中断的线程根据中断状态自行处理。
-


```java
package com.Thread.Wait;

import lombok.SneakyThrows;

/**
 * @Author shu
 * @Date: 2021/11/30/ 14:34
 * @Description
 **/

public class SimpleWaitRunnable {
    /**
     * 多线程的本质，就是对同一资源的争取
     */
    private static volatile Object resourceA = new Object();
    private static volatile Object resourceB = new Object();


    /**
     * 线程A
     */
    public static class ResourceA implements Runnable {
            @Override
            public void run() {
                try {
                    // 获取resourceA的共享资源监视器锁
                    synchronized (resourceA) {
                        System.out.println("获取线程A中resourceA的锁");
                        // 获取resourceB的共享资源的监视器锁
                        synchronized (resourceB) {
                            System.out.println("获取线程A中resourceB的锁");
                            // 线程A阻塞，并释放获取到的resourceA的锁
                            System.out.println("将线程A挂起，并释放resourceA的锁");
                            resourceA.wait();
                        }
                    }
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }


    /**
     * 线程B
     */
    public static class ResourceB implements Runnable {
            @Override
            public void run() {
                try{
                    // 休眠1s
                    Thread.sleep(6000);
                    // 获取resourceA的共享资源监视器锁
                    synchronized (resourceA) {
                        System.out.println("获取线程B中resourceA的锁");
                        System.out.println("获取线程B中resourceB的锁");
                        // 获取resourceB的共享资源的监视器锁
                        synchronized (resourceB) {
                            System.out.println("获取线程B中resourceB的锁...");
                            // 线程B阻塞，并释放获取到的resourceA的锁
                            System.out.println("获取线程B中resourceB的锁...");
                            resourceA.wait();
                        }
                    }
                } catch(InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }

    public static void main(String[] args) throws InterruptedException {
        Thread thread = new Thread(new ResourceA());
        thread.start();
        Thread.sleep(6000);
        thread.interrupt();
        //中断线程A
        new Thread(new ResourceB()).start();
    }
}
```

- 线程A与线程B同时去争取A，B资源，但是线程B先休眠`1s`，线程A优先获取到资源
- 线程A先获取到共享变量`resourceA`和共享变量`resourceB`的锁，然后`resourceA`的`wait()`方法挂起了自己，并释放了`resourceA`的锁，但是`resourceB`还是有线程A占用，迟迟没有释放
- 线程B休眠结束后，肯定先尝试获取`resourceA`上的锁，如果当时线程A还没有调用wait()方法释放该锁，则线程B会被阻塞
- 当线程A死亡后，释放持有的锁资源，线程B就可以拿到锁资源进行逻辑处理

#### 2.1.3 线程唤醒

一个经典的案例：线程生成者与线程消费者

- 实体类

```java
package com.Thread.Wait.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @Author shu
 * @Date: 2021/11/30/ 15:39
 * @Description
 **/
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Goods {
    private int id;
    private String name;
}
```

- 生产者

```java
package com.Thread.Wait;

import com.Thread.Wait.pojo.Goods;

/**
 * @Author shu
 * @Date: 2021/12/02/ 10:48
 * @Description 生产者
 **/
public class Producer implements Runnable{
    /**
     * 生成者生成商品
     */
    private Goods goods;
    /**
     * 队列最大容量
     */
    public static final int MAX_POOL=10;
    @Override
    public void run() {
        while (true) {
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            /**
             * 商品生成者线程，商品消费者线程，抢占商品储存队列
             */
            synchronized (PC.queue) {
                //生成商品
                goods = new Goods((int) System.currentTimeMillis(), "商品");
                //如果商品队列大小小于最大值
                if (PC.queue.size() < MAX_POOL) {
                    //添加队列
                    PC.queue.add(goods);
                    System.out.println(Thread.currentThread().getName() + "生产商品" + "==>" + goods);

                }
                //防止虚假唤醒
                while (PC.queue.size() == MAX_POOL) {
                    try {
                        //线程等待，并释放当前的锁，交个商品消费者线程
                        PC.queue.wait();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            }


        }

    }
}
```

- 消费者

```java
package com.Thread.Wait;

/**
 * @Author shu
 * @Date: 2021/12/02/ 10:51
 * @Description
 **/
public class Consumer implements Runnable{
    @Override
    public void run() {

        while (true){
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            /**
             * 商品生成者线程，商品消费者线程，抢占商品储存队列
             */
            synchronized (PC.queue){
                //防止虚假消费
                while (PC.queue.size()==0){
                    try {
                        PC.queue.wait();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                //当商品储存队列不为空，开始消费
                PC.queue.poll();
                System.out.println(Thread.currentThread().getName()+"消费商品"+"==>"+PC.queue.poll());
                PC.queue.notify();

            }
        }
    }
}
```

- 测试

```java
package com.Thread.Wait;

import com.Thread.Wait.pojo.Goods;

import java.util.Queue;
import java.util.concurrent.ArrayBlockingQueue;

/**
 * @Author shu
 * @Date: 2021/12/02/ 10:50
 * @Description 商品储存队列
 **/
public  class PC {
    //商品储存队列初始容量
    public static final int MAX_POOL=10;
    //最大商品生成者
    public static final int MAX_PRODUCER=4;
    //最多消费者
    public static final int MAX_CONSUMER=4;
    //商品储存队列
    public static final Queue<Goods> queue=new ArrayBlockingQueue<>(MAX_POOL);
    public static void main(String[] args) {
        Producer producer=new Producer();
        Consumer consumer=new Consumer();
        for(int i=0;i<MAX_PRODUCER;i++) {
            Thread threadA = new Thread(producer, "生产者线程"+i);
            threadA.start();
        }
        for(int j=0;j<MAX_CONSUMER;j++) {
            Thread threadB = new Thread(consumer, "消费者线程"+j);
            threadB.start();
        }
    }

}
```

![image-20211202111401468.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1644582208033-c3c3ffe0-d7ff-45f1-8844-4abab53b9f96.png#clientId=ua82ea188-7f45-4&from=ui&id=u4aa7a6e4&originHeight=632&originWidth=1831&originalType=binary&ratio=1&rotation=0&showTitle=false&size=171102&status=done&style=none&taskId=u2b5dd581-9961-499d-a5c5-13a60d8d530&title=)

> 总结


- 一个线程调用共享对象的`notify（）`方法后，会唤醒一个在该共享变量上调用wait系列方法后被挂起的线程。一个共享变量上可能会有多个线程在等待，具体唤醒哪个等待的线程是随机的。
- 不同于在共享变量上调用notify（）函数会唤醒被阻塞到该共享变量上的一个线程，`notifyAll（）`方法则会唤醒所有在该共享变量上由于调用wait系列方法而被挂起的线程。

### 2.2 线程终止与线程休眠

#### 2.2.1 线程终止

- 比如多个线程加载资源，需要等待多个线程全部加载完毕再汇总处理。Thread类中有一个join方法就可以做这个事情

```java
package com.Thread.Join;

/**
 * @Author shu
 * @Date: 2021/12/02/ 15:59
 * @Description 一个简单的等待线程执行完毕的案列
 **/
public class SimpleJoinThread {
    public static void main(String[] args) {

        //线程A
        Thread A = new Thread(new Runnable() {
            @Override
            public void run() {
                System.out.println("执行线程A");
            }
        });

        //主线程
       final  Thread MainThread = Thread.currentThread();

        //线程B
        Thread B = new Thread(new Runnable() {
            @Override
            public void run() {
                //休眠2s
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println("执行线程B");
                MainThread.interrupt();
            }
        });

        A.start();
        B.start();
        try {
            A.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

    }
}
```

#### 2.2.2 线程休眠

- Thread类中有一个静态的`sleep`方法，当一个执行中的线程调用了Thread的`sleep`方法后，调用线程会暂时让出指定时间的执行权，也就是在这期间不参与CPU的调度，但是该线程所拥有的监视器资源，比如锁还是持有不让出的。

#### 2.2.3 执行权的yield方法

-  Thread类中有一个静态的`yield`方法，当一个线程调用`yield`方法时，实际就是在暗示线程调度器当前线程请求让出自己的CPU使用，但是线程调度器可以无条件忽略这个暗示。
-  sleep与yield方法的区别在于，当线程调用sleep方法时调用线程会被阻塞挂起指定的时间，在这期间线程调度器不会去调度该线程。
-  而调用yield方法时，线程只是让出自己剩余的时间片，并没有被阻塞挂起，而是处于就绪状态，线程调度器下一次调度时就有可能调度到当前线程执行。

#### 2.2.4 上下文切换

-  线程个数一般都大于CPU个数，而每个CPU同一时刻只能被一个线程使用，为了让用户感觉多个线程是在同时执行的，CPU资源的分配采用了时间片轮转的策略，也就是给每个线程分配一个时间片，线程在时间片内占用CPU执行任务。
-  当前线程使用完时间片后，就会处于就绪状态并让出CPU让其他线程占用，这就是上下文切换，从当前线程的上下文切换到了其他线程。
-  那么就有一个问题，让出CPU的线程等下次轮到自己占有CPU时如何知道自己之前运行到哪里了？所以在切换线程上下文时需要保存当前线程的执行现场，当再次执行时根据保存的执行现场信息恢复执行现场。
-  线程上下文切换时机有：当前线程的CPU时间片使用完处于就绪状态时，当前线程被其他线程中断时。

### 2.3 基本概念

#### 2.3.1 死锁

- 死锁是指两个或两个以上的线程在执行过程中，因争夺资源而造成的互相等待的现象，在无外力作用的情况下，这些线程会一直相互等待而无法继续运行下去，简单理解，吃着碗里的，想着锅里的。
- 互斥条件：指线程对已经获取到的资源进行排它性使用，即该资源同时只由一个线程占用。如果此时还有其他线程请求获取该资源，则请求者只能等待，直至占有资源的线程释放该资源。
- 请求并持有条件：指一个线程已经持有了至少一个资源，但又提出了新的资源请求，而新资源已被其他线程占有，所以当前线程会被阻塞，但阻塞的同时并不释放自己已经获取的资源。
- 不可剥夺条件：指线程获取到的资源在自己使用完之前不能被其他线程抢占，只有在自己使用完毕后才由自己释放该资源。
- 环路等待条件：指在发生死锁时，必然存在一个线程—资源的环形链，即线程集合{T0, T1, T2, …, Tn}中的T0正在等待一个T1占用的资源，T1正在等待T2占用的资源，……Tn正在等待已被T0占用的资源。

#### 2.3.2 守护线程与用户线程

- Java中的线程分为两类，分别为daemon线程（守护线程）和user线程（用户线程）。
- 如果你希望在主线程结束后`JVM`进程马上结束，那么在创建线程时可以将其设置为守护线程，如果你希望在主线程结束后子线程继续工作，等子线程结束后再让`JVM`进程结束，那么就将子线程设置为用户线程
-

