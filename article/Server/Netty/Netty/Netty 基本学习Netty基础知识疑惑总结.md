---
title: Netty解惑
sidebar_position: 4
keywords:
  - 微服务
  - NIO
tags:
  - Java
  - Netty
  - 微服务
  - 学习笔记
last_update:
  date: 2023-12-30
  author: EasonShu
---



Netty官网：[Netty: Home](https://netty.io/)
参考书籍：《Netty权威指南》
# 一 NIO篇
## 1.1 用户空间与内核空间
🔷我们知道操作系统采用的是虚拟地址空间，以32位操作系统举例，它的寻址空间为4G(2的32次方)，这里解释二个概念:

1. 寻址: 是指操作系统能找到的地址范围，32位指的是地址总线的位数，你就想象32位的二进制数，每一位可以是0，可以是1，是不是有2的32次方种可能，2^32次方就是可以访问到的最大内存空间，也就是4G。
2. 虚拟地址空间：为什么叫虚拟，因为我们内存一共就4G，但操作系统为每一个进程都分配了4G的内存空间，这个内存空间实际是虚拟的，虚拟内存到真实内存有个映射关系。例如X86 cpu采用的段页式地址映射模型。

🔷操作系统将这4G可访问的内存空间分为二部分，一部分是内核空间，一部分是用户空间，内核空间是操作系统内核访问的区域，独立于普通的应用程序，是受保护的内存空间，用户空间是普通应用程序可访问的内存区域。
🔷以linux操作系统为例，将最高的1G字节（从虚拟地址0xC0000000到0xFFFFFFFF），供内核使用，称为内核空间，而将较低的3G字节（从虚拟地址0x00000000到0xBFFFFFFF），供各个进程使用，称为用户空间。
![](https://cdn.nlark.com/yuque/0/2023/jpeg/12426173/1683371789934-6aed3ac4-2f5a-4e23-8eb2-ee9ae0f65095.jpeg#averageHue=%23f7f5f1&clientId=u58de5f24-265e-4&from=paste&id=u12404fb9&originHeight=327&originWidth=598&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u27bb7154-6cdc-4022-9d36-cbb02608aea&title=)
每个进程可以通过系统调用进入内核，因此，Linux内核由系统内的所有进程共享，于是，从具体进程的角度来看，每个进程可以拥有4G字节的虚拟空间。
## 1.2 为啥区分用户空间与内核空间

- 其实早期操作系统是不区分内核空间和用户空间的，但是应用程序能访问任意内存空间，如果程序不稳定常常把系统搞崩溃，比如清除操作系统的内存数据。
- 后来觉得让应用程序随便访问内存太危险了，就按照CPU 指令的重要程度对指令进行了分级，指令分为四个级别：Ring0~Ring3 (和电影分级有点像)，linux 只使用了 Ring0 和 Ring3 两个运行级别，进程运行在 Ring3 级别时运行在用户态，指令只访问用户空间，而运行在 Ring0 级别时被称为运行在内核态，可以访问任意内存空间。
- 用户态的程序不能随意操作内核地址空间，这样对操作系统具有一定的安全保护作用。
## 1.3 用户态与内核态

- 其实很清晰：**当进程/线程运行在内核空间时就处于内核态，而进程/线程运行在用户空间时则处于用户态。**
- 在内核态下，进程运行在内核地址空间中，此时 CPU 可以执行任何指令。运行的代码也不受任何的限制，可以自由地访问任何有效地址，也可以直接进行端口的访问。
- 在用户态下，进程运行在用户地址空间中，被执行的代码要受到 CPU 的很多检查，比如：进程只能访问映射其地址空间的页表项中规定的在用户态下可访问页面的虚拟地址。

![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1683372206603-30229120-f137-42c7-bcbe-c1eb62060d40.webp#averageHue=%23bddcae&clientId=u58de5f24-265e-4&from=paste&id=ua0098d99&originHeight=354&originWidth=456&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u2a7a573a-875b-49f2-b006-b43cba1c5dd&title=)
## 1.4 用户态与内核态的切换
所有系统资源的管理都是在内存空间进行的，也就是在内核态去做的，那我们应用程序需要访问磁盘，读取网卡的数据，新建一个线程都需要通过系统调用接口，完成从用户态到内存态的切换。
比如我们 Java 中需要新建一个线程，new Thread( Runnable ...) 之后调用 start() 方法时, 看Hotspot Linux 的JVM 源码实现，最终是调pthread_create 系统方法来创建的线程，这里会从用户态切换到内核态完成系统资源的分配，线程的创建。
## 1.5 多路复用机制
> 啥是fd?

什么是fd：在linux中，内核把所有的外部设备都当成是一个文件来操作，对一个文件的读写会调用内核提供的系统命令，返回一个fd(文件描述符)。而对于一个socket的读写也会有相应的文件描述符，成为socketfd。
> 本质

- I/O多路复用的本质是通过一种机制（系统内核缓冲I/O数据），让单个进程可以监视多个文件描述符，一旦某个描述符就绪（一般是读就绪或写就绪），能够通知程序进行相应的读写操作
- 常见的IO多路复用方式有【select、poll、epoll】，都是Linux API提供的IO复用方式，那么接下来重点讲一下select、和epoll这两个模型
> select、epoll

- select：进程可以通过把一个或者多个fd传递给select系统调用，进程会阻塞在select操作上，这样select可以帮我们检测多个fd是否处于就绪状态，这个模式有两个缺点
   - 由于他能够同时监听多个文件描述符，假如说有1000个，这个时候如果其中一个fd 处于就绪状态了，那么当前进程需要线性轮询所有的fd，也就是监听的fd越多，性能开销越大。
   - 同时，select在单个进程中能打开的fd是有限制的，默认是1024，对于那些需要支持单机上万的TCP连接来说确实有点少
- epoll：linux还提供了epoll的系统调用，epoll是基于事件驱动方式来代替顺序扫描，因此性能相对来说更高，主要原理是，当被监听的fd中，有fd就绪时，会告知当前进程具体哪一个fd就绪，那么当前进程只需要去从指定的fd上读取数据即可，另外，epoll所能支持的fd上线是操作系统的最大文件句柄，这个数字要远远大于1024
- 由于epoll能够通过事件告知应用进程哪个fd是可读的，所以我们也称这种IO为异步非阻塞IO，当然它是伪异步的，因为它还需要去把数据从内核同步复制到用户空间中，真正的异步非阻塞，应该是数据已经完全准备好了，我只需要从用户空间读就行
# 二 Reactor模型
## 2.1 单Reactor模型
Reactor本质上就是基于NIO多路复用机制提出的一个高性能IO设计模式，它的核心思想是把响应IO事件和业务处理进行分离，通过一个或者多个线程来处理IO事件，然后将就绪得到事件分发到业务处理handlers线程去异步非阻塞处理
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683373053870-cfd1df11-04c8-4525-980b-a56caeb2fcc7.png#averageHue=%23fdfbfa&clientId=u58de5f24-265e-4&from=paste&id=ub95bd5d7&originHeight=441&originWidth=756&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=197357&status=done&style=none&taskId=u6bb8d08a-2944-4290-8efa-aae0ac0e535&title=)
Reactor模型有三个重要的组件：

- Reactor ：将I/O事件发派给对应的Handler
- Acceptor ：处理客户端连接请求
- Handlers ：执行非阻塞读/写

🌈其中Reactor线程，负责多路分离套接字，有新连接到来触发connect 事件之后，交由Acceptor进行处理，有IO读写事件之后交给hanlder 处理。
🌈Acceptor主要任务就是构建handler ，在获取到和client相关的SocketChannel之后 ，绑定到相应的hanlder上，对应的SocketChannel有读写事件之后，基于racotor 分发,hanlder就可以处理了（所有的IO事件都绑定到selector上，有Reactor分发）
## 2.2 多线程单Reactor模型
为了解决这种问题，有人提出使用多线程的方式来处理业务，也就是在业务处理的地方加入线程池异步处理，将reactor和handler在不同的线程来执行
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683373818221-deb90051-a0dc-47f2-a749-db5bbcf717c9.png#averageHue=%23fdfbf8&clientId=u58de5f24-265e-4&from=paste&id=u31bcbb5d&originHeight=418&originWidth=817&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=228581&status=done&style=none&taskId=ua8c828f6-d7bb-41d2-bfa0-622babaa708&title=)

在多线程单Reactor模型中，我们发现所有的I/O操作是由一个Reactor来完成，而Reactor运行在单个线程中，它需要处理包括Accept()/read()/write/connect操作，对于小容量的场景，影响不大，但是对于高负载、大并发或大数据量的应用场景时，容易成为瓶颈，主要原因如下：

- 一个NIO线程同时处理成百上千的链路，性能上无法支撑，即便NIO线程的CPU负荷达到100%，也无法满足海量消息的读取和发送
- 当NIO线程负载过重之后，处理速度将变慢，这会导致大量客户端连接超时，超时之后往往会进行重发，这更加重了NIO线程的负载，最终会导致大量消息积压和处理超时，成为系统的性能瓶颈
## 2.3 多线程多Reactor模型
Multiple Reactors 模式通常也可以等同于 Master-Workers 模式，比如 Nginx 和 Memcached 等就是采用这种多线程模型，虽然不同的项目实现细节略有区别，但总体来说模式是一致的。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683373917182-2d9bd72c-db10-4034-9cdc-4137ba3a765c.png#averageHue=%23fdfaf7&clientId=u58de5f24-265e-4&from=paste&id=ua081652f&originHeight=395&originWidth=712&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=196670&status=done&style=none&taskId=u343635f6-721e-4539-a7b3-78e32bcbf80&title=)

- Acceptor，请求接收者，在实践时其职责类似服务器，并不真正负责连接请求的建立，而只将其请求委托 Main Reactor 线程池来实现，起到一个转发的作用。
- Main Reactor，主 Reactor 线程组，主要负责连接事件，并将IO读写请求转发到 SubReactor 线程池。
- Sub Reactor，Main Reactor 通常监听客户端连接后会将通道的读写转发到 Sub Reactor 线程池中一个线程(负载均衡)，负责数据的读写。在 NIO 中 通常注册通道的读(OP_READ)、写事件(OP_WRITE)。
# 三 Netty
## 3.1 为啥在编写的时候有两个EventLoopGroup？
相信看了上面的Reactor模型，我们就应该理解了，这种设计。
```java
 EventLoopGroup bossGroup=new NioEventLoopGroup();
 EventLoopGroup workerGroup=new NioEventLoopGroup();
```
主Reactor负责处理Accept，然后把Channel注册到从Reactor，从Reactor主要负责Channel生命周期内的所有I/O事件。

