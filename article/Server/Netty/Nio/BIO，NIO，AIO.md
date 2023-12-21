---
title: BIO NIO AIO
sidebar_position: 1
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

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1702794429781-7dddfadf-f68c-41fe-b7b8-94e02e95439b.png#averageHue=%23f8f7f3&clientId=u98663b6b-d3e2-4&from=paste&id=u4ebd4f91&originHeight=586&originWidth=1259&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=udc463274-a823-42f4-998d-8acbe9a2d2d&title=)
# 一 Java 中的IO原理
首先Java中的IO都是依赖操作系统内核进行的，我们程序中的IO读写其实调用的是操作系统内核中的read&write两大系统调用。
**那内核是如何进行IO交互的呢？**

1. 网卡收到经过网线传来的网络数据，并将网络数据写到内存中。
2. 当网卡把数据写入到内存后，网卡向cpu发出一个中断信号，操作系统便能得知有新数据到来，再通过网卡中断程序去处理数据。
3. 将内存中的网络数据写入到对应socket的接收缓冲区中。
4. 当接收缓冲区的数据写好之后，应用程序开始进行数据处理。

![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1702797235394-659dd427-4968-4d20-9869-f3ed244c99bc.webp#averageHue=%23f5f5f5&clientId=ud8f564b2-430a-4&from=paste&id=u2cdb4ce4&originHeight=454&originWidth=777&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u7a215b7b-3783-489f-a89f-a2e63371508&title=)

```java
package com.shu;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * @author : EasonShu
 * @date : 2023/12/17 14:44
 * @Version: 1.0
 * @Desc :
 */
public class SocketServerTest {
    public static void main(String[] args) {
        int port = 8080;
        ServerSocket server = null;
        try {
            server = new ServerSocket(port);
            // server将一直等待连接的到来
            Socket socket = server.accept();
            // 建立好连接后，从socket中获取输入流，并建立缓冲区进行读取
            InputStream inputStream = socket.getInputStream();
            // 读取数据大小
            byte[] bytes = new byte[1024];
            int len;
            while ((len = inputStream.read(bytes)) != -1) {
                //获取数据进行处理
                String message = new String(bytes, 0, len, "UTF-8");
                System.out.println("get message from client: " + message);
            }
            // socket、server，流关闭操作，省略不表
        } catch (UnsupportedEncodingException ex) {
            throw new RuntimeException(ex);
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        } finally {
            //关闭资源
            System.out.println("服务端关闭");
            try {
                server.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

    }
}

```

- 客户端发送数据

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1702795982806-0a8a380e-4049-4484-89c5-4523bb6e93f2.png#averageHue=%23f8f8f8&clientId=u2384fb56-a7dc-4&from=paste&height=805&id=uaea3f011&originHeight=966&originWidth=1915&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=46937&status=done&style=none&taskId=u8d0e4da8-72a8-44f1-be6e-388f958d529&title=&width=1595.8332699206167)

- 服务端接受数据

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1702796038696-e4f45c92-15ec-4fa4-bbb0-6e90e35e284f.png#averageHue=%23253555&clientId=u2384fb56-a7dc-4&from=paste&height=633&id=ufed3deaa&originHeight=760&originWidth=1857&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=139267&status=done&style=none&taskId=uff187be7-e502-454f-8084-6051601f1ff&title=&width=1547.4999385078772)
**read 系统调用，是把数据从内核缓冲区复制到进程缓冲区；而 write 系统调用，是把数据从进程缓冲区复制到内核缓冲区。**这个两个系统调用，都不负责数据在内核缓冲区和磁盘之间的交换。底层的读写交换，是由操作系统 kernel 内核完成的。
**内核缓冲与进程缓冲区**
缓冲区的目的，是为了减少频繁的系统 IO 调用。大家都知道，系统调用需要保存之前的进程数据和状态等信息，而结束调用之后回来还需要恢复之前的信息，为了减少这种损耗时间、也损耗性能的系统调用，于是出现了缓冲区。
有了缓冲区，操作系统使用 read 函数把数据从内核缓冲区复制到进程缓冲区，write 把数据从进程缓冲区复制到内核缓冲区中。等待缓冲区达到一定数量的时候，再进行 IO 的调用，提升性能。至于什么时候读取和存储则由内核来决定，用户程序不需要关心。
**在 linux 系统中，系统内核也有个缓冲区叫做内核缓冲区。每个进程有自己独立的缓冲区，叫做进程缓冲区**。
所以，用户程序的 IO 读写程序，大多数情况下，并没有进行实际的 IO 操作，而是在读写自己的进程缓冲区。
# 二 同步与异步

- 同步和异步指的是一个执行流程中每个方法是否必须依赖前一个方法完成后才可以继续执行。假设我们的执行流程中：依次是方法一和方法二。
- 同步指的是调用一旦开始，调用者必须等到方法调用返回后，才能继续后续的行为。即方法二一定要等到方法一执行完成后才可以执行。
- 异步指的是调用立刻返回，调用者不必等待方法内的代码执行结束，就可以继续后续的行为。（具体方法内的代码交由另外的线程执行完成后，可能会进行回调）。即执行方法一的时候，直接交给其他线程执行，不由主线程执行，也就不会阻塞主线程，所以方法二不必等到方法一完成即可开始执行。
# 三 阻塞与非阻塞

- 阻塞与非阻塞指的是单个线程内遇到同步等待时，是否在原地不做任何操作。
- 阻塞指的是遇到同步等待后，一直在原地等待同步方法处理完成。
- 非阻塞指的是遇到同步等待，不在原地等待，先去做其他的操作，隔断时间再来观察同步方法是否完成。
# 四 Java IO
在Java中，我们使用socket进行网络通信，IO主要有三种模式

1. BIO：同步阻塞IO
2. NIO：同步非阻塞IO
3. AIO：异步非阻塞IO
> 理解

- A顾客去吃海底捞，就这样干坐着等了一小时，然后才开始吃火锅。(BIO)
- B顾客去吃海底捞，他一看要等挺久，于是去逛商场，每次逛一会就跑回来看有没有排到他。于是他最后既购了物，又吃上海底捞了。（NIO）
- C顾客去吃海底捞，由于他是高级会员，所以店长说，你去商场随便玩吧，等下有位置，我立马打电话给你。于是C顾客不用干坐着等，也不用每过一会儿就跑回来看有没有等到，最后也吃上了海底捞（AIO）
## 4.1 BIO
Blocking IO。每个客户端的Socket连接请求，服务端都会对应有个处理线程与之对应，对于没有分配到处理线程的连接就会被阻塞或者拒绝。相当于是一个连接一个线程。
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1702796493578-7c330d88-897d-4a62-8b82-5a6f68e417aa.png#averageHue=%23dfde6c&clientId=u2384fb56-a7dc-4&from=paste&id=u8b98c442&originHeight=267&originWidth=888&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=udc37c2ce-c4df-4b1d-bbf9-45020c3b0d7&title=)
**特点：**

1. 使用一个独立的线程维护一个socket连接，随着连接数量的增多，对虚拟机造成一定压力。
2. 使用流来读取数据，流是阻塞的，当没有可读／可写数据时，线程等待，会造成资源的浪费。
## 4.2 NIO

- No blocking IO，同步非阻塞IO：服务器端保存一个Socket连接列表，然后对这个列表进行轮询。
- 如果发现某个Socket端口上有数据可读时说明读就绪，则调用该socket连接的相应读操作。
- 如果发现某个 Socket端口上有数据可写时说明写就绪，则调用该socket连接的相应写操作。
- 如果某个端口的Socket连接已经中断，则调用相应的析构方法关闭该端口。这样能充分利用服务器资源，效率得到了很大提高。
- 在进行IO操作请求时候再用个线程去处理，是一个请求一个线程。Java中使用Selector、Channel、Buffer来实现上述效果。

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1702796592579-574fdf91-9a62-4b13-8e7b-07e9560335cc.png#averageHue=%23e2eac7&clientId=u2384fb56-a7dc-4&from=paste&id=u8489da50&originHeight=198&originWidth=871&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u5cdedf66-ca63-49ed-a4c9-d2071266c60&title=)
每个线程中包含一个Selector对象，它相当于一个通道管理器，可以实现在一个线程中处理多个通道的目的，减少线程的创建数量。
远程连接对应一个channel，数据的读写通过buffer均在同一个channel中完成，并且数据的读写是非阻塞的。
通道创建后需要注册在selector中，同时需要为该通道注册感兴趣事件（客户端连接服务端事件、服务端接收客户端连接事件、读事件、写事件），selector线程需要采用轮训的方式调用selector的select函数，直到所有注册通道中有兴趣的事件发生，则返回，否则一直阻塞。
这里介绍一下三个相关概念：

1. selector：Selector 允许单线程处理多个Channel。如果你的应用打开了多个连接（通道），但每个连接的流量都很低，使用Selector就会很方便。要使用Selector，得向Selector注册Channel，然后调用他的select方法，这个方法会一直阻塞到某个注册的通道有事件就绪。一旦这个方法返回，线程就可以处理这些事件，事件的例子入有新连接接进来，数据接收等。
2. Channel：基本上所有的IO在NIO中都从一个Channel开始。Channel有点像流，数据可以从channel读到buffer，也可以从buffer写到channel。
3. Buffer：缓冲区本质上是一个可以读写数据的内存块，可以理解成是一个容器对象(含数组)，该对象提供了一组方法，可以更轻松的使用内存块，缓冲区对象内置了一些机制，能够跟踪和记录缓冲区的状态变换情况，Channel提供从文件，网络读取数据的渠道，但是读取或者写入的数据都必须经由Buffer。
## 4.3 AIO
AIO是真正意义上的异步非阻塞IO模型。上述NIO实现中，需要用户线程定时轮询，去检查IO缓冲区数据是否就绪，占用应用程序线程资源，其实轮询相当于还是阻塞的，并非真正解放当前线程，因为它还是需要去查询哪些IO就绪。而真正的理想的异步非阻塞IO应该让内核系统完成，用户线程只需要告诉内核，当缓冲区就绪后，通知我或者执行我交给你的回调函数。
![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1702796789052-016d83aa-6a01-4ac1-b3f8-9b48c6e5f0a7.webp#averageHue=%23f9f5f1&clientId=u2384fb56-a7dc-4&from=paste&id=u2b4912b8&originHeight=429&originWidth=720&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=ubc8db80f-7b2f-4996-955c-173d189cbdf&title=)
AIO可以做到真正的异步的操作，但实现起来比较复杂，支持纯异步IO的操作系统非常少，目前也就windows是IOCP技术实现了，而在Linux上，底层还是是使用的epoll实现的。
与NIO不同，当进行读写操作时，只需直接调用API的read或write方法即可。这两种方法均为异步的，对于读操作而言，当有流可读取时，操作系统会将可读的流传入read方法的缓冲区，并通知应用程序；对于写操作而言，当操作系统将write方法传递的流写入完毕时，操作系统主动通知应用程序。即可以理解为， read/write方法都是异步的，完成后会主动调用回调函数。 在JDK1.7中，这部分内容成为AIO

