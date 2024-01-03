---
title: Nio 详细解释
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
  date: 2023-12-21
  author: EasonShu
---

# 前言
我们试想一下这样的现实场景：

一个餐厅同时有100位客人到店，当然到店后第一件要做的事情就是点菜。但是问题来了，餐厅老板为了节约人力成本目前只有一位大堂服务员拿着唯一的一本菜单等待客人进行服务。

那么最笨（但是最简单）的方法是（方法A），无论有多少客人等待点餐，服务员都把仅有的一份菜单递给其中一位客人，然后站在客人身旁等待这个客人完成点菜过程。在记录客人点菜内容后，把点菜记录交给后堂厨师。然后是第二位客人。。。。然后是第三位客人。很明显，只有脑袋被门夹过的老板，才会这样设置服务流程。因为随后的80位客人，再等待超时后就会离店（还会给差评）。

于是还有一种办法（方法B），老板马上新雇佣99名服务员，同时印制99本新的菜单。每一名服务员手持一本菜单负责一位客人（关键不只在于服务员，还在于菜单。因为没有菜单客人也无法点菜）。在客人点完菜后，记录点菜内容交给后堂厨师（当然为了更高效，后堂厨师最好也有100名）。这样每一位客人享受的就是VIP服务咯，当然客人不会走，但是人力成本可是一个大头哦（亏死你）。

另外一种办法（方法C），就是改进点菜的方式，当客人到店后，自己申请一本菜单。想好自己要点的才后，就呼叫服务员。服务员站在自己身边后记录客人的菜单内容。将菜单递给厨师的过程也要进行改进，并不是每一份菜单记录好以后，都要交给后堂厨师。服务员可以记录号多份菜单后，同时交给厨师就行了。那么这种方式，对于老板来说人力成本是最低的；对于客人来说，虽然不再享受VIP服务并且要进行一定的等待，但是这些都是可接受的；对于服务员来说，基本上她的时间都没有浪费，基本上被老板压杆了最后一滴油水。

如果您是老板，您会采用哪种方式呢？
- 到店情况：并发量。到店情况不理想时，一个服务员一本菜单，当然是足够了。所以不同的老板在不同的场合下，将会灵活选择服务员和菜单的配置。
- 客人：客户端请求
- 点餐内容：客户端发送的实际数据
- 老板：操作系统
- 人力成本：系统资源
- 菜单：文件状态描述符。操作系统对于一个进程能够同时持有的文件状态描述符的个数是有限制的，在linux系统中$ulimit -n查看这个限制值，当然也是可以（并且应该）进行内核参数调整的。
- 服务员：操作系统内核用于IO操作的线程（内核线程）
- 厨师：应用程序线程（当然厨房就是应用程序进程咯）
- 餐单传递方式：包括了阻塞式和非阻塞式两种。
- 方法A：阻塞式/非阻塞式 同步IO
- 方法B：使用线程进行处理的 阻塞式/非阻塞式 同步IO
- 方法C：阻塞式/非阻塞式 多路复用IO






> 从Java1.4开始，为了替代Java IO和网络相关的API，提高程序的运行速度，Java提供了新的IO操作非阻塞的API即Java NIO。NIO中有三大核心组件：Buffer（缓冲区），Channel（通道），Selector（选择器）。NIO基于Channel（通道）和Buffer（缓冲区）)进行操作，数据总是从通道读取到缓冲区中，或者从缓冲区写入到通道中，而Selector（选择器）主要用于监听多个通道的事件，实现单个线程可以监听多个数据通道。



# 一 Buffer（缓冲区）- 数组块

## 1.1 Buffer 详解

缓冲区本质上是一个可以写入数据的内存块（类似数组），然后可以再次读取。此内存块包含在NIO Buffer对象中，该对象提供了一组方法，可以更轻松的使用内存块。
相对于直接操作数组，Buffer API提供了更加容易的操作和管理，其进行数据的操作分为写入和读取，主要步骤如下：

1. 将数据写入缓冲区
2. 调用buffer.flip()，转换为读取模式
3. 缓冲区读取数据
4. 调用buffer.clear()或buffer.compact()清楚缓冲区


Buffer中有三个重要属性：

- capacity（容量）：作为一个内存块，Buffer具有一定的固定大小，也称为容量。
- position（位置）：写入模式时代表写数据的位置，读取模式时代表读取数据的位置。
- limit（限制）：写入模式等于Buffer的容量，读取模式时等于写入的数据量。

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1703126461804-f6baf8ea-2cb0-4168-8ce3-826adc035610.png#averageHue=%23fefdfc&clientId=ue7b2a21e-8f71-4&from=paste&id=u71ac9ec1&originHeight=380&originWidth=870&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u74aebe34-4fa7-4a3d-97b8-e8258ef8ad1&title=)

Buffer有两种工作模式：写模式和读模式。在读模式下，应用程序只能从Buffer中读取数据，不能进行写操作。但是在写模式下，应用程序是可以进行读操作的，这就表示可能会出现脏读的情况。所以一旦您决定要从Buffer中读取数据，一定要将Buffer的状态改为读模式。

> 写模式：

```java
package com.shu;

import java.nio.ByteBuffer;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/12/21 10:42
 * @version: 1.0
 */
public class BufferDemo {
    public static void main(String[] args) {
        // 构建一个byte字节缓冲区，容量是4
        ByteBuffer byteBuffer = ByteBuffer.allocate(4);
        // 默认写入模式，查看三个重要的指标
        System.out.println(
                String.format(
                        "初始化：capacity容量：%s, position位置：%s, limit限制：%s",
                        byteBuffer.capacity(), byteBuffer.position(), byteBuffer.limit()));
        // 写入3个字节数据
        byteBuffer.put((byte) 1);
        byteBuffer.put((byte) 2);
        byteBuffer.put((byte) 3);
        System.out.println(
                String.format(
                        "写模式：capacity容量：%s, position位置：%s, limit限制：%s",
                        byteBuffer.capacity(), byteBuffer.position(), byteBuffer.limit()));

    }
}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1703126678518-2c73bc4b-ff16-4746-9915-04cc10ff86d3.png#averageHue=%23202225&clientId=ue7b2a21e-8f71-4&from=paste&height=293&id=u442e3aaa&originHeight=366&originWidth=1828&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=41931&status=done&style=none&taskId=u17000299-034c-42a1-931b-601ab757cc3&title=&width=1462.4)
> 读模式：

```java
package com.shu;

import java.nio.ByteBuffer;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/12/21 10:42
 * @version: 1.0
 */
public class BufferDemo {
    public static void main(String[] args) {
        // 构建一个byte字节缓冲区，容量是4
        ByteBuffer byteBuffer = ByteBuffer.allocate(4);
        // 默认写入模式，查看三个重要的指标
        System.out.println(
                String.format(
                        "初始化：capacity容量：%s, position位置：%s, limit限制：%s",
                        byteBuffer.capacity(), byteBuffer.position(), byteBuffer.limit()));
        // 写入3个字节数据
        byteBuffer.put((byte) 1);
        byteBuffer.put((byte) 2);
        byteBuffer.put((byte) 3);
        System.out.println(
                String.format(
                        "写模式：capacity容量：%s, position位置：%s, limit限制：%s",
                        byteBuffer.capacity(), byteBuffer.position(), byteBuffer.limit()));
        // 切换为读模式
        byteBuffer.flip();
        System.out.println(
                String.format(
                        "读模式：capacity容量：%s, position位置：%s, limit限制：%s",
                        byteBuffer.capacity(), byteBuffer.position(), byteBuffer.limit()));
        // 读取一个字节
        byte b1 = byteBuffer.get();
        System.out.println("b1 = " + b1);
        System.out.println(
                String.format(
                        "读取一个字节后：capacity容量：%s, position位置：%s, limit限制：%s",
                        byteBuffer.capacity(), byteBuffer.position(), byteBuffer.limit()));
        // 读取一个字节
        byte b2 = byteBuffer.get();
        System.out.println("b2 = " + b2);
        System.out.println(
                String.format(
                        "读取一个字节后：capacity容量：%s, position位置：%s, limit限制：%s",
                        byteBuffer.capacity(), byteBuffer.position(), byteBuffer.limit()));
        // 读取一个字节
        byte b3 = byteBuffer.get();
        System.out.println("b3 = " + b3);
        System.out.println(
                String.format(
                        "读取一个字节后：capacity容量：%s, position位置：%s, limit限制：%s",
                        byteBuffer.capacity(), byteBuffer.position(), byteBuffer.limit()));
    }
}

```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1703126834880-2708578f-769e-4112-81fb-01998a32528f.png#averageHue=%23212327&clientId=ue7b2a21e-8f71-4&from=paste&height=306&id=u64a9a7ff&originHeight=382&originWidth=1822&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=78717&status=done&style=none&taskId=uaef1daea-70b1-4224-85da-ed397d458f4&title=&width=1457.6)
## 1.2 ByteBuffer堆外内存
ByteBuffer为性能关键型代码提供了直接内存（direct，堆外）和非直接内存（heap，堆）两种实现。堆外内存实现将内存对象分配在Java虚拟机的堆以外的内存，这些内存直接受操作系统管理，而不是虚拟机，这样做的结果就是能够在一定程度上减少垃圾回收对应用程序造成的影响，提供运行的速度。
堆外内存的获取方式：ByteBuffer byteBuffer = ByteBuffer.allocateDirect(noBytes)
堆外内存的好处：

- 进行网络IO或者文件IO时比heap buffer少一次拷贝。（file/socket — OS memory — jvm heap）在写file和socket的过程中，GC会移动对象，JVM的实现中会把数据复制到堆外，再进行写入。
- GC范围之外，降低GC压力，但实现了自动管理，DirectByteBuffer中有一个Cleaner对象（PhantomReference），Cleaner被GC执行前会执行clean方法，触发DirectByteBuffer中定义的Deallocator

堆外内存的使用建议：

- 性能确实可观的时候才去使用，分配给大型，长寿命的对象（网络传输，文件读写等场景）
- 通过虚拟机参数MaxDirectMemorySize限制大小，防止耗尽整个机器的内存
```java
package com.shu;

import java.nio.ByteBuffer;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/12/21 10:52
 * @version: 1.0
 */
public class DirectBuffer {
    public static void main(String[] args) {
        // 直接堆外内存
        ByteBuffer byteBuffer = ByteBuffer.allocateDirect(1024);
        ByteBuffer byteBuffer01 = ByteBuffer.allocate(1024);
        // 两种方式的对比
        // 直接内存的方式
        long startTime = System.currentTimeMillis();
        for (int i = 0; i < 10000000; i++) {
            byteBuffer.putLong(0, i);
        }
        long endTime = System.currentTimeMillis();
        System.out.println("直接内存的方式耗时：" + (endTime - startTime) + "ms");
        // 非直接内存的方式
        startTime = System.currentTimeMillis();
        for (int i = 0; i < 10000000; i++) {
            byteBuffer01.putLong(0, i);
        }
        endTime = System.currentTimeMillis();
        System.out.println("非直接内存的方式耗时：" + (endTime - startTime) + "ms");
    }
}

```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1703127613577-0aeae5e3-8012-4188-8095-38fc4e2289c0.png#averageHue=%23222326&clientId=ue7b2a21e-8f71-4&from=paste&height=277&id=uc6a2e310&originHeight=346&originWidth=1841&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=38718&status=done&style=none&taskId=ub4bcd0d5-0163-4986-91d8-94513f8e566&title=&width=1472.8)
# 二 通道
## 2.1 Channel（通道）
Channel用于源节点与目标节点之间的连接，Channel类似于传统的IO Stream，Channel本身不能直接访问数据，Channel只能与Buffer进行交互。
Channel的API涵盖了TCP/UDP网络和文件IO，常用的类有FileChannel，DatagramChannel，SocketChannel，ServerSocketChannel
标准IO Stream通常是单向的（InputStream/OutputStream），而Channel是一个双向的通道，可以在一个通道内进行读取和写入，可以非阻塞的读取和写入通道，而且通道始终读取和写入缓冲区（即Channel必须配合Buffer进行使用）。
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1703127002192-c1ce6932-26b3-4126-b268-4bd3a12254f2.png#averageHue=%2354b98c&clientId=ue7b2a21e-8f71-4&from=paste&id=u87719926&originHeight=308&originWidth=1158&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ucc305463-36e0-4fcf-acca-4f5812552a7&title=)
## 2.2 SocketChannel
SocketChannel用于建立TCP网络连接，类似java.net.Socket。有两种创建SocketChannel的形式，一个是客户端主动发起和服务器的连接，还有一个就是服务端获取的新连接。SocketChannel中有两个重要的方法，一个是write()写方法，write()写方法有可能在尚未写入内容的时候就返回了，需要在循环中调用write()方法。还有一个就是read()读方法，read()方法可能直接返回根本不读取任何数据，可以根据返回的int值判断读取了多少字节。
核心代码代码示例片段：
```java
// 客户端主动发起连接
SocketChannel socketChannel = SocketChannel.open();
// 设置为非阻塞模式
socketChannel.configureBlocking(false);
socketChannel.connect(new InetSocketAddress("127.0.0.1", 8080));
// 发生请求数据 - 向通道写入数据
socketChannel.write(byteBuffer);
// 读取服务端返回 - 读取缓冲区数据
int readBytes = socketChannel.read(requestBuffer);
// 关闭连接
socketChannel.close();
```
## 2.3 ServerSocketChannel
ServerSocketChannel可以监听新建的TCP连接通道，类似ServerSocket。ServerSocketChannel的核心方法accept()方法，如果通道处于非阻塞模式，那么如果没有挂起的连接，该方法将立即返回null，实际使用中必须检查返回的SocketChannel是否为null。
核心代码示例片段:
```java
// 创建网络服务端
ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
// 设置为非阻塞模式
serverSocketChannel.configureBlocking(false);
// 绑定端口
serverSocketChannel.socket().bind(new InetSocketAddress(8080));
while (true) {
  // 获取新tcp连接通道
  SocketChannel socketChannel = serverSocketChannel.accept();
  if (socketChannel != null) {
    // tcp请求 读取/响应
  }
}
```
# 三 Selector选择器

## 3.1 Selector

Selector的英文含义是“选择器”，不过根据我们详细介绍的Selector的岗位职责，您可以把它称之为“轮询代理器”、“事件订阅器”、“channel容器管理机”都行。

Selector也是Java NIO核心组件，可以检查一个或多个NIO通道，并确定哪些通道已经准备好进行读取或写入。实现单个线程可以管理多个通道，从而管理多个网络连接。
一个线程使用Selector可以监听多个Channel的不同事件，其中主要有四种事件，分别对应SelectionKey中的四个常量，分别为：

- 连接事件 SelectionKey.OP_CONNECT
- 准备就绪事件 SelectionKey.OP_ACCEPT
- 读取事件 SelectionKey.OP_READ
- 写入事件 SelectionKey.OP_WRITE

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1703127719594-8c8032de-a7f9-47c2-b3d0-0bb51f1b150f.png#averageHue=%23fefefc&clientId=ue7b2a21e-8f71-4&from=paste&id=u4087c424&originHeight=392&originWidth=461&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u85cf7ea7-6b72-4f9c-aac7-be3a5764895&title=)
Selector实现一个线程处理多个通道的核心在于事件驱动机制，非阻塞的网络通道下，开发者通过Selector注册对于通道感兴趣的事件类型，线程通过监听事件来触发相应的代码执行。（更底层其实是操作系统的多路复用机制）
```java
package com.shu;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.*;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.UUID;


/**
 * @description: NIO 服务端
 * @author: shu
 * @createDate: 2023/12/21 9:47
 * @version: 1.0
 */
public class NioSever {
    public static void main(String[] args) {
        // NIO 服务端
        int port = 8081;
        ServerSocketChannel serverSocketChannel = null;
        try {
            // 打开一个服务端通道: ServerSocketChannel
            serverSocketChannel = ServerSocketChannel.open();
            // 绑定端口
            serverSocketChannel.socket().bind(new java.net.InetSocketAddress(port));
            // 设置为非阻塞
            serverSocketChannel.configureBlocking(false);
            // 创建多路复用器
            Selector selector = Selector.open();
            // 注册到多路复用器上
            serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);
            // 多路复用器开始监听
            System.out.println("NIO 服务端启动成功，监听端口：" + port);
            while (true) {
                // 多路复用器开始监听：阻塞
                selector.select();
                // 获取多路复用器中的通道
                Set<SelectionKey> keys = selector.selectedKeys();
                // 遍历通道
                for (SelectionKey selectionKey : keys) {
                    // 第一次连接时，应该是一个ServerSocketChannel,因为第一次连接时，是客户端连接服务器
                    // 之后，客户端和服务器建立了通道，就是SocketChannel
                    System.out.println("selectionKey.channel() = " + selectionKey.channel());
                    // 处理通道
                    handle(selectionKey,selector);
                }
                // 清空通道
                keys.clear();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 处理通道
     *
     * @param selectionKey
     */
    private static void handle(SelectionKey selectionKey, Selector selector) {
        if (selectionKey.isAcceptable()) {
            // 处理连接
            handleAccept(selectionKey,selector);
        } else if (selectionKey.isReadable()) {
            // 处理读
            handleRead(selectionKey,selector);
        }else if (selectionKey.isWritable()){
            // 处理写
            handleWrite(selectionKey,selector);
        }
    }

    /**
     * 处理写: 表示服务器向客户端写数据
     * @param selectionKey
     * @param selector
     */
    private static void handleWrite(SelectionKey selectionKey, Selector selector) {
        SocketChannel channel = (SocketChannel) selectionKey.channel();
        ByteBuffer writeBuffer = ByteBuffer.allocate(1024);
        writeBuffer.put("hello client".getBytes());
        writeBuffer.flip();
        try {
            channel.write(writeBuffer);
        } catch (IOException e) {
            e.printStackTrace();
        }
        // 当数据回写完毕之后，当前Channel不应该再对WRITE事件感性趣，因此这里设置为READ
        if(0 == writeBuffer.remaining()) {
            selectionKey.interestOps(SelectionKey.OP_READ);
        }
    }


    /**
     * 处理读: 表示服务器从客户端读取数据
     *
     * @param selectionKey
     */
    private static void handleRead(SelectionKey selectionKey,Selector selector) {
        // 连接成功后selector下的channel集合会增加一个sc（获得的SocketChannel），它关注read事件
        SocketChannel channel = (SocketChannel) selectionKey.channel();
        ByteBuffer readBuffer = ByteBuffer.allocate(1024);
        int count = 0;
        try {
            count = channel.read(readBuffer);
        } catch (IOException e) {
            e.printStackTrace();
        }
        if (count>0){
            readBuffer.flip();
            Charset charset = StandardCharsets.UTF_8;
            String receiveMassage = String.valueOf(charset.decode(readBuffer).array());
            System.out.println(channel +": "+receiveMassage);
        }

    }

    /**
     * 处理ServerSocketChannel的连接: 表示服务器监听到了客户端连接，服务器可以接收这个连接了
     *
     * @param selectionKey
     */
    private static void handleAccept(SelectionKey selectionKey, Selector selector) {
        // 一开始selector集合只有一个ssc（新建的ServerSocketChannel），它关注accept事件，而事件集合为空
        ServerSocketChannel serverChannel = (ServerSocketChannel) selectionKey.channel();
        try {
            SocketChannel accept = serverChannel.accept();//新的channel 和客户端建立了通道
            accept.configureBlocking(false);//非阻塞
            accept.register(selector,SelectionKey.OP_READ);//将新的channel和selector，绑定
            String clientKey = "【"+ UUID.randomUUID() +"】";//用UUID，标识客户端client
            System.out.println(clientKey+"已经连接");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}

```

- ServerSocketChannel只关注Accect事件的连接
- SocketChannel只关注读写事件
# 四 NIO与BIO的比较

## 4.1 比较

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1703127917277-c20de11e-33e8-4120-9c64-7c8f205a13ec.png#averageHue=%23f2f2f2&clientId=ue7b2a21e-8f71-4&from=paste&id=u8e3fec34&originHeight=443&originWidth=1137&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ua7c04eef-c7f8-4858-af6f-e4c9c35bd4d&title=)
# 五 select、poll、epoll详解
目前支持I/O多路复用的系统调用有select，pselect，poll，epoll。与多进程和多线程技术相比，I/O多路复用技术的最大优势是系统开销小，系统不必创建进程/线程，也不必维护这些进程/线程，从而大大减小了系统的开销。
I/O多路复用就是通过一种机制，一个进程可以监视多个描述符，一旦某个描述符就绪（一般是读就绪或者写就绪），能够通知程序进行相应的读写操作。但select，poll，epoll本质上都是同步I/O，因为他们都需要在读写事件就绪后自己负责进行读写，也就是说这个读写过程是阻塞的，而异步I/O则无需自己负责进行读写，异步I/O的实现会负责把数据从内核拷贝到用户空间
## 5.1 select

```cpp
int select (int n, fd_set *readfds, fd_set *writefds, fd_set *exceptfds, struct timeval timeout);
```

- readfds：内核检测该集合中的IO是否可读。如果想让内核帮忙检测某个IO是否可读，需要手动把文件描述符加入该集合。
- writefds：内核检测该集合中的IO是否可写。同readfds，需要手动把文件描述符加入该集合。
- exceptfds：内核检测该集合中的IO是否异常。同readfds，需要手动把文件描述符加入该集合。
- nfds：以上三个集合中最大的文件描述符数值 + 1，例如集合是{0,1,5,10}，那么 maxfd 就是 11
- timeout：用户线程调用select的超时时长。
   - 设置成NULL，表示如果没有 I/O 事件发生，则 select 一直等待下去。
   - 设置为非0的值，这个表示等待固定的一段时间后从 select 阻塞调用中返回。
   - 设置成 0，表示根本不等待，检测完毕立即返回。

函数返回值：

- 大于0：成功，返回集合中已就绪的IO总个数
- 等于-1：调用失败
- 等于0：没有就绪的IO

select 函数监视的文件描述符分3类，分别是writefds、readfds、和exceptfds，当用户process调用select的时候，select会将需要监控的readfds集合拷贝到内核空间（假设监控的仅仅是socket可读），然后遍历自己监控的skb(SocketBuffer)，挨个调用skb的poll逻辑以便检查该socket是否有可读事件，遍历完所有的skb后，如果没有任何一个socket可读，那么select会调用schedule_timeout进入schedule循环，使得process进入睡眠。如果在timeout时间内某个socket上有数据可读了，或者等待timeout了，则调用select的process会被唤醒，接下来select就是遍历监控的集合，挨个收集可读事件并返回给用户了



通过上面的select逻辑过程分析，相信大家都意识到，select存在三个问题：

- [1] 每次调用select，都需要把被监控的fds集合从用户态空间拷贝到内核态空间，高并发场景下这样的拷贝会使得消耗的资源是很大的。
- [2] 能监听端口的数量有限，单个进程所能打开的最大连接数由FD_SETSIZE宏定义，监听上限就等于fds_bits位数组中所有元素的二进制位总数，其大小是32个整数的大小（在32位的机器上，大小就是3232，同理64位机器上为3264），当然我们可以对宏FD_SETSIZE进行修改，然后重新编译内核，但是性能可能会受到影响，一般该数和系统内存关系很大，具体数目可以cat /proc/sys/fs/file-max察看。32位机默认1024个，64位默认2048。

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1703128746892-e4b95c1a-0049-479e-aeb0-ea0ab8c3bcc5.png#averageHue=%232b2c24&clientId=ua27bdcca-2c18-4&from=paste&id=ua104dd74&originHeight=86&originWidth=684&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u20fd3c9c-bbff-4552-bcb0-fdf69f1a1e7&title=)

- [3] 被监控的fds集合中，只要有一个有数据可读，整个socket集合就会被遍历一次调用sk的poll函数收集可读事件：由于当初的需求是朴素，仅仅关心是否有数据可读这样一个事件，当事件通知来的时候，由于数据的到来是异步的，我们不知道事件来的时候，有多少个被监控的socket有数据可读了，于是，只能挨个遍历每个socket来收集可读事件了。
## 5.2 poll
poll的实现和select非常相似，只是描述fd集合的方式不同。针对select遗留的三个问题中（问题(2)是fd限制问题，问题(1)和(3)则是性能问题），poll只是使用pollfd结构而不是select的fd_set结构，这就解决了select的问题(2)fds集合大小1024限制问题。但poll和select同样存在一个性能缺点就是包含大量文件描述符的数组被整体复制于用户态和内核的地址空间之间，而不论这些文件描述符是否就绪，它的开销随着文件描述符数量的增加而线性增大。

```cpp
struct pollfd {
　　 int fd;           /*文件描述符*/
　　 short events;     /*监控的事件*/
　　 short revents;    /*监控事件中满足条件返回的事件*/
};
int poll(struct pollfd *fds, unsigned long nfds, int timeout); 
```

函数参数：

- fds：struct pollfd类型的数组, 存储了待检测的文件描述符，struct pollfd有三个成员：
- fd：委托内核检测的文件描述符
- events：委托内核检测的fd事件（输入、输出、错误），每一个事件有多个取值
- revents：这是一个传出参数，数据由内核写入，存储内核检测之后的结果
- nfds：描述的是数组 fds 的大小
- timeout: 指定poll函数的阻塞时长
   - -1：一直阻塞，直到检测的集合中有就绪的IO事件，然后解除阻塞函数返回
   - 0：不阻塞，不管检测集合中有没有已就绪的IO事件，函数马上返回
   - 大于0：表示 poll 调用方等待指定的毫秒数后返回

函数返回值：

- -1：失败
- 大于0：表示检测的集合中已就绪的文件描述符的总个数

下面是poll的函数原型，poll改变了fds集合的描述方式，使用了pollfd结构而不是select的fd_set结构，使得poll支持的fds集合限制远大于select的1024。poll虽然解决了fds集合大小1024的限制问题，从实现来看。很明显它并没优化大量描述符数组被整体复制于用户态和内核态的地址空间之间，以及个别描述符就绪触发整体描述符集合的遍历的低效问题。poll随着监控的socket集合的增加性能线性下降，使得poll也并不适合用于大并发场景。
## 5.3 epoll
在linux的网络编程中，很长的时间都在使用select来做事件触发。在linux新的内核中，有了一种替换它的机制，就是epoll。相比于select，epoll最大的好处在于它不会随着监听fd数目的增长而降低效率。如前面我们所说，在内核中的select实现中，它是采用轮询来处理的，轮询的fd数目越多，自然耗时越多。并且，在linux/posix_types.h头文件有这样的声明：
#define __FD_SETSIZE 1024
表示select最多同时监听1024个fd，当然，可以通过修改头文件再重编译内核来扩大这个数目，但这似乎并不治本。
创建一个epoll的句柄，size用来告诉内核这个监听的数目一共有多大。这个参数不同于select()中的第一个参数，给出最大监听的fd+1的值。需要注意的是，当创建好epoll句柄后，它就是会占用一个fd值，在linux下如果查看/proc/进程id/fd/，是能够看到这个fd的，所以在使用完epoll后，必须调用close()关闭，否则可能导致fd被耗尽。
epoll的接口非常简单，一共就三个函数：

- epoll_create：创建一个epoll句柄
- epoll_ctl：向 epoll 对象中添加/修改/删除要管理的连接
- epoll_wait：等待其管理的连接上的 IO 事件

epoll_create 函数

```cpp
int epoll_create(int size);
```

- 功能：该函数生成一个 epoll 专用的文件描述符。
- 参数size: 用来告诉内核这个监听的数目一共有多大，参数 size 并不是限制了 epoll 所能监听的描述符最大个数，只是对内核初始分配内部数据结构的一个建议。自从 linux 2.6.8 之后，size 参数是被忽略的，也就是说可以填只有大于 0 的任意值。
- 返回值：如果成功，返回poll 专用的文件描述符，否者失败，返回-1。

**epoll_ctl 函数**

```cpp
int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);
```

- **功能：**epoll 的事件注册函数，它不同于 select() 是在监听事件时告诉内核要监听什么类型的事件，而是在这里先注册要监听的事件类型。
- **参数epfd: **epoll 专用的文件描述符，epoll_create()的返回值
- **参数op:** 表示动作，用三个宏来表示：
1. EPOLL_CTL_ADD：注册新的 fd 到 epfd 中；
2. EPOLL_CTL_MOD：修改已经注册的fd的监听事件；
3. EPOLL_CTL_DEL：从 epfd 中删除一个 fd；
- **参数fd:** 需要监听的文件描述符
- **参数event:** 告诉内核要监听什么事件，struct epoll_event 结构如:
- **events可以是以下几个宏的集合：**
- EPOLLIN ：表示对应的文件描述符可以读（包括对端 SOCKET 正常关闭）；
- EPOLLOUT：表示对应的文件描述符可以写；
- EPOLLPRI：表示对应的文件描述符有紧急的数据可读（这里应该表示有带外数据到来）；
- EPOLLERR：表示对应的文件描述符发生错误；
- EPOLLHUP：表示对应的文件描述符被挂断；
- EPOLLET ：将 EPOLL 设为边缘触发(Edge Trigger)模式，这是相对于水平触发(Level Trigger)来说的。
- EPOLLONESHOT：只监听一次事件，当监听完这次事件之后，如果还需要继续监听这个 socket 的话，需要再次把这个 socket 加入到 EPOLL 队列里
- **返回值：**0表示成功，-1表示失败。

**epoll_wait函数**
```cpp
int epoll_wait(int epfd, struct epoll_event * events, int maxevents, int timeout);
```

- **功能：**等待事件的产生，收集在 epoll 监控的事件中已经发送的事件，类似于 select() 调用。
- **参数epfd:** epoll 专用的文件描述符，epoll_create()的返回值
- **参数events:** 分配好的 epoll_event 结构体数组，epoll 将会把发生的事件赋值到events 数组中（events 不可以是空指针，内核只负责把数据复制到这个 events 数组中，不会去帮助我们在用户态中分配内存）。
- **参数maxevents: **maxevents 告之内核这个 events 有多少个 。
- **参数timeout: **超时时间，单位为毫秒，为 -1 时，函数为阻塞。
- **返回值：**
1. 如果成功，表示返回需要处理的事件数目
2. 如果返回0，表示已超时
3. 如果返回-1，表示失败


## 5.4 epoll的边缘触发与水平触发
**水平触发(LT)**
关注点是数据是否有无，只要读缓冲区不为空，写缓冲区不满，那么epoll_wait就会一直返回就绪，水平触发是epoll的默认工作方式。
**边缘触发(ET)**
关注点是变化，只要缓冲区的数据有变化，epoll_wait就会返回就绪。
这里的数据变化并不单纯指缓冲区从有数据变为没有数据，或者从没有数据变为有数据，还包括了数据变多或者变少。即当buffer长度有变化时，就会触发。
假设epoll被设置为了边缘触发，当客户端写入了100个字符，由于缓冲区从0变为了100，于是服务端epoll_wait触发一次就绪，服务端读取了2个字节后不再读取。这个时候再去调用epoll_wait会发现不会就绪，只有当客户端再次写入数据后，才会触发就绪。
这就导致如果使用ET模式，那就必须保证要「一次性把数据读取&写入完」，否则会导致数据长期无法读取/写入。

## **5.5 epoll 为什么比select、poll更高效？**

- epoll 采用红黑树管理文件描述符
从上图可以看出，epoll使用红黑树管理文件描述符，红黑树插入和删除的都是时间复杂度 O(logN)，不会随着文件描述符数量增加而改变。
select、poll采用数组或者链表的形式管理文件描述符，那么在遍历文件描述符时，时间复杂度会随着文件描述的增加而增加。
- epoll 将文件描述符添加和检测分离，减少了文件描述符拷贝的消耗
select&poll 调用时会将全部监听的 fd 从用户态空间拷贝至内核态空间并线性扫描一遍找出就绪的 fd 再返回到用户态。下次需要监听时，又需要把之前已经传递过的文件描述符再读传递进去，增加了拷贝文件的无效消耗，当文件描述很多时，性能瓶颈更加明显。
而epoll只需要使用epoll_ctl添加一次，后续的检查使用epoll_wait，减少了文件拷贝的消耗。
