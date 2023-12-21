---
title: IO 模型
sidebar_position: 3
keywords:
  - 微服务
  - NIO
tags:
  - Java
  - Netty
  - 微服务
  - 学习笔记
last_update:
  date: 2023-12-21
  author: EasonShu
---


在linux系统中，实际上所有的I/O设备都被抽象为了文件这个概念，一切皆文件，Everything is File，磁盘、网络数据、终端，甚至进程间通信工具管道pipe等都被当做文件对待。
## 一、什么是多路复用

- 多路: 指的是多个socket网络连接;
- 复用: 指的是复用一个线程、使用一个线程来检查多个文件描述符（Socket）的就绪状态
- 多路复用主要有三种技术：select，poll，epoll。epoll是最新的, 也是目前最好的多路复用技术；
## 二、五种IO模型
```
[1]blockingIO - 阻塞IO
[2]nonblockingIO - 非阻塞IO
[3]signaldrivenIO - 信号驱动IO
[4]asynchronousIO - 异步IO
[5]IOmultiplexing - IO多路复用
```
### **阻塞式I/O模型**
![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1703162635369-00436978-070f-436f-be09-19ae07d30698.webp#averageHue=%23e4eaec&clientId=u2f2d1375-44d0-4&from=paste&id=u04fe257f&originHeight=380&originWidth=1200&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u5580101c-f717-4b1b-a61c-cdaf45beca2&title=)
进程/线程在从调用recvfrom开始到它返回的整段时间内是被阻塞的，recvfrom成功返回后，应用进程/线程开始处理数据报。主要特点是进程阻塞挂起不消耗CPU资源，能及时响应每个操作；实现难度低，适用并发量小的网络应用开发，不适用并发量大的应用，因为一个请求IO会阻塞进程，所以每请求分配一个处理进程（线程）去响应，系统开销大。
### **非阻塞式I/O模型**
![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1703162635392-b43f06a5-30d3-4fa9-8b98-cfba881b1ded.webp#averageHue=%23e4eaec&clientId=u2f2d1375-44d0-4&from=paste&id=uc772da36&originHeight=410&originWidth=1200&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uddb01bac-099d-47aa-9914-1e36f342cce&title=)
进程发起IO系统调用后，如果内核缓冲区没有数据，需要到IO设备中读取，进程返回一个错误而不会被阻塞；进程发起IO系统调用后，如果内核缓冲区有数据，内核就会把数据返回进程。

- 进程轮询（重复）调用，消耗CPU的资源；
- 实现难度低、开发应用相对阻塞IO模式较难；
- 适用并发量较小、且不需要及时响应的网络应用开发；
### 信号驱动IO
![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1703162635359-f1a82a95-f92a-4938-be30-79c2acc7c979.webp#averageHue=%23fbfaf9&clientId=u2f2d1375-44d0-4&from=paste&id=ue4b9d54c&originHeight=490&originWidth=1029&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u2ee352ec-bd84-445d-ac45-2aa1e3b5198&title=)
当进程发起一个IO操作，会向内核注册一个信号处理函数，然后进程返回不阻塞；当内核数据就绪时会发送一个信号给进程，进程便在信号处理函数中调用IO读取数据。
特点：回调机制，实现、开发应用难度大；
### 异步IO
![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1703162635369-d182f7f1-346e-4f12-b273-62c036599141.webp#averageHue=%23fbfbfa&clientId=u2f2d1375-44d0-4&from=paste&id=u6c16a202&originHeight=494&originWidth=1029&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u1b87df2a-1a84-4fef-ae76-dd59b1b1b5f&title=)
当进程发起一个IO操作，进程返回（不阻塞），但也不能返回果结；内核把整个IO处理完后，会通知进程结果。如果IO操作成功则进程直接获取到数据。
特点：

- 不阻塞，数据一步到位；Proactor模式；
- 需要操作系统的底层支持，LINUX 2.5 版本内核首现，2.6 版本产品的内核标准特性；
- 实现、开发应用难度大；
- 非常适合高性能高并发应用；
### **IO复用模型**
![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1703162635389-b116e140-c0f3-41ab-87ed-d48bf475c1ae.webp#averageHue=%23fbfaf9&clientId=u2f2d1375-44d0-4&from=paste&id=u82fb23fa&originHeight=486&originWidth=1029&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ud6735039-4ac1-405d-a4dc-cfa3ad4bd87&title=)
大多数文件系统的默认IO操作都是缓存IO。在Linux的缓存IO机制中，操作系统会将IO的数据缓存在文件系统的页缓存（page cache）。也就是说，数据会先被拷贝到操作系统内核的缓冲区中，然后才会从操作系统内核的缓存区拷贝到应用程序的地址空间中。这种做法的缺点就是，**需要在应用程序地址空间和内核进行多次拷贝，这些拷贝动作所带来的CPU以及内存开销是非常大的**。
至于为什么不能直接让磁盘控制器把数据送到应用程序的地址空间中呢？**最简单的一个原因就是应用程序不能直接操作底层硬件。**
总的来说，IO分两阶段：
1)数据准备阶段
2)内核空间复制回用户进程缓冲区阶段。如下图：
![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1703162635737-bae111c3-0d0a-4347-960f-af7319993d4f.webp#averageHue=%23ececec&clientId=u2f2d1375-44d0-4&from=paste&id=u49505fe4&originHeight=157&originWidth=554&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ua09844dc-ed8f-47ea-9c8a-b51ee38a1e2&title=)
