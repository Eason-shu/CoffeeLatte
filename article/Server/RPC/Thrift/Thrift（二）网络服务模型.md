---
title: Thrift（二）网络服务模型
sidebar_position: 2
keywords:
  - 微服务
  - 源码分析
  - RPC
tags:
  - 源码分析
  - Java
  - 框架
  - RPC
  - 学习笔记
last_update:
  date: 2022-11-6
  author: EasonShu
---

- 官网：[https://thrift.apache.org/](https://thrift.apache.org/)
- 参考文章：[https://zhuanlan.zhihu.com/p/45194118](https://zhuanlan.zhihu.com/p/45194118)

Thrift提供的**网络服务模型**：**单线程**、**多线程**、**事件驱动**，从另一个角度划分为：**阻塞服务模型**、**非阻塞服务模型**。

- 阻塞服务模型：TSimpleServer、TThreadPoolServer。
- 非阻塞服务模型：TNonblockingServer、THsHaServer和TThreadedSelectorServer。

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1706416464834-96156b09-18aa-4556-8329-3616f38b93c0.png#averageHue=%231f2024&clientId=u8ea52056-0e15-4&from=paste&height=553&id=u65b4482c&originHeight=664&originWidth=1423&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=39812&status=done&style=none&taskId=ub9dc2641-9681-45e6-a57b-67c750c0b05&title=&width=1185.8332862125521)
## 1.1 TServer
TServer定义了静态内部类Args，Args继承自抽象类AbstractServerArgs。AbstractServerArgs采用了建造者模式，向TServer提供各种工厂：
![](https://cdn.nlark.com/yuque/0/2024/webp/12426173/1706416695526-75b88986-c1dc-4ada-8481-9f6f530d7540.webp#averageHue=%23f6f6f5&clientId=u8ea52056-0e15-4&from=paste&id=u1f00c58f&originHeight=370&originWidth=720&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u749a271b-9240-4395-a94c-d57556957a6&title=)
**_TServer_**
```java
public abstract class TServer {
    public static class Args extends org.apache.thrift.server.TServer.AbstractServerArgs<org.apache.thrift.server.TServer.Args> {
        public Args(TServerTransport transport) {
            super(transport);
        }
    }

    public static abstract class AbstractServerArgs<T extends org.apache.thrift.server.TServer.AbstractServerArgs<T>> {
        final TServerTransport serverTransport;
        TProcessorFactory processorFactory;
        TTransportFactory inputTransportFactory = new TTransportFactory();
        TTransportFactory outputTransportFactory = new TTransportFactory();
        TProtocolFactory inputProtocolFactory = new TBinaryProtocol.Factory();
        TProtocolFactory outputProtocolFactory = new TBinaryProtocol.Factory();

        public AbstractServerArgs(TServerTransport transport) {
            serverTransport = transport;
        }
    }

    protected TProcessorFactory processorFactory_;
    protected TServerTransport serverTransport_;
    protected TTransportFactory inputTransportFactory_;
    protected TTransportFactory outputTransportFactory_;
    protected TProtocolFactory inputProtocolFactory_;
    protected TProtocolFactory outputProtocolFactory_;
    private boolean isServing;

    protected TServer(org.apache.thrift.server.TServer.AbstractServerArgs args) {
        processorFactory_ = args.processorFactory;
        serverTransport_ = args.serverTransport;
        inputTransportFactory_ = args.inputTransportFactory;
        outputTransportFactory_ = args.outputTransportFactory;
        inputProtocolFactory_ = args.inputProtocolFactory;
        outputProtocolFactory_ = args.outputProtocolFactory;
    }

    public abstract void serve();
    public void stop() {}

    public boolean isServing() {
        return isServing;
    }

    protected void setServing(boolean serving) {
        isServing = serving;
    }
}
```
TServer的三个方法：serve()、stop()和isServing()。

- serve()用于启动服务
- stop()用于关闭服务
- isServing()用于检测服务的起停状态

TServer的**不同实现类**的启动方式不一样，因此serve()定义为抽象方法。不是所有的服务都需要优雅的退出, 因此stop()方法没有被定义为抽象。
### 1.1.1 TSimpleServer
TSimpleServer的**工作模式**采用最简单的**阻塞**IO，实现方法简洁明了，便于理解，但是一次只能接收和处理一个socket连接，效率比较低。它主要用于演示Thrift的工作过程，在实际开发过程中很少用到它。

- 工作流程：

![](https://cdn.nlark.com/yuque/0/2024/webp/12426173/1706416957467-a8d7c1ca-9e41-4bf2-ad15-102e45ef131e.webp#averageHue=%231d1d1d&clientId=u8ea52056-0e15-4&from=paste&id=u971c4248&originHeight=548&originWidth=626&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u9aac9d92-bd99-40ff-9b09-146f601ce03&title=)

- 关键方法
```java
@Override
  public void serve() {
    try {
        // 创建监听
      serverTransport_.listen();
    } catch (TTransportException ttx) {
      LOGGER.error("Error occurred during listening.", ttx);
      return;
    }

    // Run the preServe event
    if (eventHandler_ != null) {
      eventHandler_.preServe();
    }

    setServing(true);

    while (!stopped_) {
      TTransport client = null;
      TProcessor processor = null;
      TTransport inputTransport = null;
      TTransport outputTransport = null;
      TProtocol inputProtocol = null;
      TProtocol outputProtocol = null;
      ServerContext connectionContext = null;
      try {
          //阻塞等待结果返回
        client = serverTransport_.accept();
        if (client != null) {
          processor = processorFactory_.getProcessor(client);
          inputTransport = inputTransportFactory_.getTransport(client);
          outputTransport = outputTransportFactory_.getTransport(client);
          inputProtocol = inputProtocolFactory_.getProtocol(inputTransport);
          outputProtocol = outputProtocolFactory_.getProtocol(outputTransport);
          if (eventHandler_ != null) {
            connectionContext = eventHandler_.createContext(inputProtocol, outputProtocol);
          }
          while (true) {
            if (eventHandler_ != null) {
              eventHandler_.processContext(connectionContext, inputTransport, outputTransport);
            }
            processor.process(inputProtocol, outputProtocol);
          }
        }
      } catch (TTransportException ttx) {
        // Client died, just move on
        LOGGER.debug("Client Transportation Exception", ttx);
      } catch (TException tx) {
        if (!stopped_) {
          LOGGER.error("Thrift error occurred during processing of message.", tx);
        }
      } catch (Exception x) {
        if (!stopped_) {
          LOGGER.error("Error occurred during processing of message.", x);
        }
      }

      if (eventHandler_ != null) {
        eventHandler_.deleteContext(connectionContext, inputProtocol, outputProtocol);
      }

      if (inputTransport != null) {
        inputTransport.close();
      }

      if (outputTransport != null) {
        outputTransport.close();
      }
    }
    setServing(false);
  }
```
serve()方法的操作：

1. 设置TServerSocket的listen()方法启动连接**监听**。
2. 以**阻塞**的方式接受客户端地连接请求，每进入一个**连接**即为其创建一个通道TTransport对象。
3. 为客户端创建**处理器对象**、**输入传输通道对象**、**输出传输通道对象**、**输入协议对象**和**输出协议对象**。
4. 通过TServerEventHandler对象处理具体的业务请求。
### 1.1.2 ThreadPoolServer
TThreadPoolServer模式采用**阻塞**socket方式工作，主线程负责**阻塞式**监听是否有新socket到来，具体的业务处理交由一个**线程池**来处理。
![](https://cdn.nlark.com/yuque/0/2024/webp/12426173/1706418247820-594a665c-caf4-453b-a07e-2805835978b5.webp#averageHue=%23424242&clientId=u6083d097-3854-4&from=paste&id=u5ed3d45a&originHeight=706&originWidth=946&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u2339f000-94df-4c62-abe2-50cfeed0f43&title=)
ThreadPoolServer解决了TSimpleServer不支持**并发**和**多连接**的问题，引入了**线程池**。实现的模型是One Thread Per Connection。查看上述流程的源代码
```java
private static ExecutorService createDefaultExecutorService(Args args) {
    return new ThreadPoolExecutor(
        args.minWorkerThreads,
        args.maxWorkerThreads,
        60L,
        TimeUnit.SECONDS,
        new SynchronousQueue<>(),
        new ThreadFactory() {
          final AtomicLong count = new AtomicLong();

          @Override
          public Thread newThread(Runnable r) {
            Thread thread = new Thread(r);
            thread.setDaemon(true);
            thread.setName(
                String.format("TThreadPoolServer WorkerProcess-%d", count.getAndIncrement()));
            return thread;
          }
        });
  }
```

- server 方法
```java
@Override
  public void serve() {
    if (!preServe()) {
      return;
    }
    execute();
    executorService_.shutdownNow();
    if (!waitForShutdown()) {
      LOGGER.error("Shutdown is not done after " + stopTimeoutVal + stopTimeoutUnit);
    }
    setServing(false);
  }


protected void execute() {
    while (!stopped_) {
      try {
        TTransport client = serverTransport_.accept();
        try {
          executorService_.execute(new WorkerProcess(client));
        } catch (RejectedExecutionException ree) {
          if (!stopped_) {
            LOGGER.warn(
                "ThreadPool is saturated with incoming requests. Closing latest connection.");
          }
          client.close();
        }
      } catch (TTransportException ttx) {
        if (!stopped_) {
          LOGGER.warn("Transport error occurred during acceptance of message", ttx);
        }
      }
    }
  }


```

1. 设置TServerSocket的listen()方法启动连接**监听**。
2. 以**阻塞**的方式接受**客户端**的**连接请求**，每进入一个**连接**，将**通道对象**封装成一个WorkerProcess对象(WorkerProcess实现了Runnabel接口)，并提交到**线程池**。
3. WorkerProcess的run()方法负责**业务处理**，为客户端创建了**处理器对象**、**输入传输通道对象**、**输出传输通道对象**、**输入协议对象**和**输出协议对象**。
4. 通过TServerEventHandler对象处理具体的业务请求， 但本质没有改变
```java
@Override
    public void run() {
      TProcessor processor = null;
      TTransport inputTransport = null;
      TTransport outputTransport = null;
      TProtocol inputProtocol = null;
      TProtocol outputProtocol = null;

      Optional<TServerEventHandler> eventHandler = Optional.empty();
      ServerContext connectionContext = null;

      try {
        processor = processorFactory_.getProcessor(client_);
        inputTransport = inputTransportFactory_.getTransport(client_);
        outputTransport = outputTransportFactory_.getTransport(client_);
        inputProtocol = inputProtocolFactory_.getProtocol(inputTransport);
        outputProtocol = outputProtocolFactory_.getProtocol(outputTransport);

        eventHandler = Optional.ofNullable(getEventHandler());

        if (eventHandler.isPresent()) {
          connectionContext = eventHandler.get().createContext(inputProtocol, outputProtocol);
        }

        while (true) {
          if (Thread.currentThread().isInterrupted()) {
            LOGGER.debug("WorkerProcess requested to shutdown");
            break;
          }
          if (eventHandler.isPresent()) {
            eventHandler.get().processContext(connectionContext, inputTransport, outputTransport);
          }
          // This process cannot be interrupted by Interrupting the Thread. This
          // will return once a message has been processed or the socket timeout
          // has elapsed, at which point it will return and check the interrupt
          // state of the thread.
          processor.process(inputProtocol, outputProtocol);
        }
      } catch (Exception x) {
        logException(x);
      } finally {
        if (eventHandler.isPresent()) {
          eventHandler.get().deleteContext(connectionContext, inputProtocol, outputProtocol);
        }
        if (inputTransport != null) {
          inputTransport.close();
        }
        if (outputTransport != null) {
          outputTransport.close();
        }
        if (client_.isOpen()) {
          client_.close();
        }
      }
    }
```
**TThreadPoolServer模式的优点**
拆分了**监听线程**(Accept Thread)和处理**客户端连接**的**工作线程**(Worker Thread)，**数据读取**和**业务处理**都交给**线程池**处理。因此在**并发量较大**时新连接也能够被及时接受。
**线程池模式**比较适合**服务器端**能预知最多有多少个**客户端并发**的情况，这时每个请求都能被业务线程池及时处理，性能也非常高。
**TThreadPolServer模式的缺点**
线程池模式的处理能力受限于**线程池**的工作能力，当**并发请求数**大于线程池中的**线程数**时，新请求也只能**排队等待**。
### 1.1.3 TNonblockingServer
TNonblockingServer模式也是**单线程工作**，但是采用NIO的模式，借助Channel/Selector机制, 采用IO**事件模型**来处理。
所有的socket都被注册到selector中，在一个**线程**中通过seletor**循环监控**所有的socket。
每次selector循环结束时，处理所有的处于**就绪状态**的socket，对于有数据到来的socket进行**数据读取**操作，对于有数据发送的socket则进行**数据发送**操作，对于监听socket则产生一个新业务socket并将其**注册**到selector上。
![](https://cdn.nlark.com/yuque/0/2024/webp/12426173/1706419060050-bfde5d34-ffdb-4395-bfb4-1bd5aef931b9.webp#averageHue=%231d1d1d&clientId=u6083d097-3854-4&from=paste&id=ue7ca3756&originHeight=1136&originWidth=720&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u36bc15a5-bbd9-4fc6-a170-76702128c7c&title=)
```java
private void select() {
      try {
        // wait for io events.
        selector.select();

        // process the io events we received
        Iterator<SelectionKey> selectedKeys = selector.selectedKeys().iterator();
        while (!stopped_ && selectedKeys.hasNext()) {
          SelectionKey key = selectedKeys.next();
          selectedKeys.remove();

          // skip if not valid
          if (!key.isValid()) {
            cleanupSelectionKey(key);
            continue;
          }

          // if the key is marked Accept, then it has to be the server
          // transport.
          if (key.isAcceptable()) {
            handleAccept();
          } else if (key.isReadable()) {
            // deal with reads
            handleRead(key);
          } else if (key.isWritable()) {
            // deal with writes
            handleWrite(key);
          } else {
            LOGGER.warn("Unexpected state in select! " + key.interestOps());
          }
        }
      } catch (IOException e) {
        LOGGER.warn("Got an IOException while selecting!", e);
      }
    }
```
**TNonblockingServer模式优点**
相比于TSimpleServer效率提升主要体现在IO**多路复用上**，TNonblockingServer采用**非阻塞**IO，对accept/read/write等IO事件进行**监控**和**处理**，同时监控多个socket的状态变化。
**TNonblockingServer模式缺点**
TNonblockingServer模式在**业务处理**上还是采用**单线程顺序**来完成。在业务处理比较**复杂**、**耗时**的时候，例如某些接口函数需要读取数据库执行时间较长，会导致**整个服务**被**阻塞**住，此时该模式**效率也不高**，因为**多个调用请求任务**依然是**顺序**一个接一个执行。
### 1.1.4 THsHaServer
鉴于TNonblockingServer的缺点，THsHaServer继承于TNonblockingServer，引入了**线程池**提高了任务处理的**并发能力**。THsHaServer是**半同步半异步**(Half-Sync/Half-Async)的处理模式，Half-Aysnc用于IO**事件处理**(Accept/Read/Write)，Half-Sync用于业务handler对rpc的**同步处理**上。注意：THsHaServer和TNonblockingServer一样，要求底层的传输通道必须使用TFramedTransport。
![](https://cdn.nlark.com/yuque/0/2024/webp/12426173/1706419544878-651325d0-db05-4848-bea4-8a72f8b1b845.webp#averageHue=%23191919&clientId=u6083d097-3854-4&from=paste&id=uf59c07f3&originHeight=850&originWidth=720&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u106306b0-1440-4fc9-9d6a-ffb6542ddc8&title=)
THsHaServer继承于TNonblockingServer，新增了**线程池**并发处理工作任务的功能
```java
protected static ExecutorService createInvokerPool(Args options) {
    int minWorkerThreads = options.minWorkerThreads;
    int maxWorkerThreads = options.maxWorkerThreads;
    int stopTimeoutVal = options.stopTimeoutVal;
    TimeUnit stopTimeoutUnit = options.stopTimeoutUnit;

    LinkedBlockingQueue<Runnable> queue = new LinkedBlockingQueue<Runnable>();
    ExecutorService invoker =
        new ThreadPoolExecutor(
            minWorkerThreads, maxWorkerThreads, stopTimeoutVal, stopTimeoutUnit, queue);

    return invoker;
  }
```
**THsHaServer的优点**
THsHaServer与TNonblockingServer模式相比，THsHaServer在完成**数据读取**之后，将**业务处理**过程交由一个**线程池**来完成，**主线程**直接返回进行**下一次循环**操作，效率大大提升。
**THsHaServer的缺点**
**主线程**仍然需要完成所有socket的**监听接收**、**数据读取**和**数据写入**操作。当**并发请求数**较大时，且发送**数据量**较多时，监听socket上**新连接请求**不能被及时接受。
### 1.1.5 TThreadedSelectorServer
TThreadedSelectorServer是对THsHaServer的一种扩充，它将selector中的**读写**IO**事件**(read/write)从**主线程**中分离出来。同时引入worker**工作线程池**，它也是种Half-Sync/Half-Async的服务模型。
TThreadedSelectorServer模式是目前Thrift提供的最高级的**线程服务模型**，它内部有如果几个部分构成：

1. **一个**AcceptThread线程对象，专门用于处理监听socket上的新连接。
2. **若干个**SelectorThread对象专门用于处理业务socket的**网络**I/O**读写**操作，所有网络数据的**读写**均是有这些线程来完成。
3. 一个**负载均衡器**SelectorThreadLoadBalancer对象，主要用于AcceptThread**线程**接收到一个新socket连接请求时，决定将这个**新连接**请求分配给哪个SelectorThread**线程**。
4. 一个ExecutorService类型的**工作线程池**，在SelectorThread线程中，监听到有业务socket中有调用请求过来，则将**请求数据读取**之后，交给ExecutorService**线程池**中的线程完成此次调用的具体执行。主要用于处理每个rpc请求的handler**回调处理**(这部分是**同步的**)。

![](https://cdn.nlark.com/yuque/0/2024/webp/12426173/1706420029670-f778786c-ff67-4091-bb52-af99cda0b69f.webp#averageHue=%233f3f3f&clientId=u6083d097-3854-4&from=paste&id=u7c7b8ce5&originHeight=422&originWidth=720&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u2755425a-9f97-491b-83f0-02e3da85826&title=)

- 核心原理

以上工作流程的三个组件AcceptThread、SelectorThread和ExecutorService在源码中的定义如下：
TThreadedSelectorServer模式中有一个专门的线程AcceptThread用于处理**新连接请求**，因此能够及时响应**大量并发连接请求**；另外它将**网络I/O操作**分散到多个SelectorThread**线程**中来完成，因此能够快速对**网络**I/O进行**读写操作**，能够很好地应对**网络**I/O较多的情况。
```java
// The thread handling all accepts
  private AcceptThread acceptThread;

  // Threads handling events on client transports
  private final Set<SelectorThread> selectorThreads = new HashSet<>();

  // This wraps all the functionality of queueing and thread pool management
  // for the passing of Invocations from the selector thread(s) to the workers
  // (if any).
  private final ExecutorService invoker;
```

- 负责网络IO读写的selector默认线程数(selectorThreads)：2
- 负责业务处理的默认工作线程数(workerThreads)：5
- 工作线程池单个线程的任务队列大小(acceptQueueSizePerThread)：4

创建、初始化并启动AcceptThread和SelectorThreads，同时启动selector线程的**负载均衡器**(selectorThreads)。
```java
@Override
  protected boolean startThreads() {
    try {
      for (int i = 0; i < args.selectorThreads; ++i) {
        selectorThreads.add(new SelectorThread(args.acceptQueueSizePerThread));
      }
      acceptThread =
          new AcceptThread(
              (TNonblockingServerTransport) serverTransport_,
              createSelectorThreadLoadBalancer(selectorThreads));
      for (SelectorThread thread : selectorThreads) {
        thread.start();
      }
      acceptThread.start();
      return true;
    } catch (IOException e) {
      LOGGER.error("Failed to start threads!", e);
      return false;
    }
  }
```

