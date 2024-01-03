---
title: Netty 初步使用
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
  date: 2023-12-30
  author: EasonShu
---


Netty官网：[Netty: Home](https://netty.io/)
参考书籍：《Netty权威指南》
参考教程：[netty案例](https://bugstack.cn/md/netty/base/2019-07-30-netty%E6%A1%88%E4%BE%8B%EF%BC%8Cnetty4.1%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E7%AF%87%E9%9B%B6%E3%80%8A%E5%88%9D%E5%85%A5JavaIO%E4%B9%8B%E9%97%A8BIO%E3%80%81NIO%E3%80%81AIO%E5%AE%9E%E6%88%98%E7%BB%83%E4%B9%A0%E3%80%8B.html)
# 一 Netty 初认识
## 1.1 概述
官网：[https://netty.io/](https://netty.io/)
Netty 是一个 NIO 客户端服务器框架，它可以快速轻松地开发网络应用程序，例如协议服务器和客户端。它极大地简化和精简了 TCP 和 UDP 套接字服务器等网络编程。
Netty 是基于 Java NIO 的异步事件驱动的网络应用框架，使用 Netty 可以快速开发网络应用，Netty 提供了高层次的抽象来简化 TCP 和 UDP 服务器的编程，但是你仍然可以使用底层的 API。
Netty 的内部实现是很复杂的，但是 Netty 提供了简单易用的API从网络处理代码中解耦业务逻辑。Netty 是完全基于 NIO 实现的，所以整个 Netty 都是异步的。
Netty 是最流行的 NIO 框架，它已经得到成百上千的商业、商用项目验证，许多框架和开源组件的底层 rpc 都是使用的 Netty，如 Dubbo、Elasticsearch 等等。
## 1.2 为啥学习Netty?
> #### 传统的HTTP

创建一个ServerSocket，监听并绑定一个端口，一系列客户端来请求这个端口
服务器使用Accept，获得一个来自客户端的Socket连接对象，启动一个新线程处理连接，读Socket，得到字节流，解码协议，得到Http请求对象，处理Http请求，得到一个结果，封装成一个HttpResponse对象，编码协议，将结果序列化字节流，写Socket，将字节流发给客户端，继续循环处理http请求
HTTP服务器之所以称为HTTP服务器，是因为编码解码协议是HTTP协议，如果协议是Redis协议，那它就成了Redis服务器，如果协议是WebSocket，那它就成了WebSocket服务器，等等。
> 并发下的NIO

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683256845501-de303d48-36f9-42e4-b968-c1276f499d37.png#averageHue=%23101010&clientId=u53e8945e-9641-4&from=paste&id=ub66b54eb&originHeight=2542&originWidth=2442&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=612617&status=done&style=none&taskId=u54a476c5-5e2c-4142-b21d-a2d29968f1a&title=)

- NIO的全称是NoneBlocking IO，非阻塞IO，区别与BIO，BIO的全称是Blocking IO，阻塞IO。那这个阻塞是什么意思呢？
- Accept是阻塞的，只有新连接来了，Accept才会返回，主线程才能继
- Read是阻塞的，只有请求消息来了，Read才能返回，子线程才能继续处理
- Write是阻塞的，只有客户端把消息收了，Write才能返回，子线程才能继续读取下一个请求
- 所以传统的多线程服务器是BlockingIO模式的，从头到尾所有的线程都是阻塞的。这些线程就干等在哪里，占用了操作系统的调度资源，什么事也不干，是浪费。
- 那么NIO是怎么做到非阻塞的呢。它用的是事件机制。它可以用一个线程把Accept，读写操作，请求处理的逻辑全干了。如果什么事都没得做，它也不会死循环，它会将线程休眠起来，直到下一个事件来了再继续干活，这样的一个线程称之为NIO线程。
> Netty

Netty是建立在NIO基础之上，Netty在NIO之上又提供了更高层次的抽象。
在Netty里面，Accept连接可以使用单独的线程池去处理，读写操作又是另外的线程池来处理。
Accept连接和读写操作也可以使用同一个线程池来进行处理。而请求处理逻辑既可以使用单独的线程池进行处理，也可以跟放在读写线程一块处理。线程池中的每一个线程都是NIO线程。用户可以根据实际情况进行组装，构造出满足系统需求的并发模型。
## 1.3 Reactor线程模型
![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1683256967756-72929bf1-aa6d-4886-9812-6181edf9528f.webp#averageHue=%23f4f1ee&clientId=u53e8945e-9641-4&from=paste&id=u2feec332&originHeight=640&originWidth=1664&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u378fac6b-7cfe-4ca0-9482-a9ca997904f&title=)
![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1683256983258-6b17842e-fbbd-42c1-9020-fc6d47fabd51.webp#averageHue=%23f6f3e7&clientId=u53e8945e-9641-4&from=paste&id=u942f3e3e&originHeight=890&originWidth=1504&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u7d6070a9-c39b-49ae-8e26-3ef12cb4af2&title=)
![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1683256998660-b22254c1-bba8-4610-83c3-e6e6ea654fba.webp#averageHue=%23f3f1e8&clientId=u53e8945e-9641-4&from=paste&id=u41249d9d&originHeight=942&originWidth=1662&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u105ef757-f13c-4ffc-a83c-e0fd89ecba8&title=)
## 1.4 流程
![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1683257025307-6e019250-2aa4-4602-93d9-57b7864c098a.webp#averageHue=%23eef3e8&clientId=u53e8945e-9641-4&from=paste&id=uf3812d18&originHeight=579&originWidth=726&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ua687d8cb-8c22-4737-a01f-a75cf52499a&title=)
# 二 基本案例入门
## 2.1 服务端编写
🌈🌈基本过程

- 创建ServerSocketChannel，配置它为非阻塞模式
- 绑定监听，配置TCP参数，例如backlog大小
- 创建一个独立的I/O线程，用于轮询多路复用器Selector
- 创建Selector，将之前创建的ServerSocketChannel注册到Selector上，监听SelectionKey.ACCEPT
- 启动I/O线程，在循环体中执行Selector.select()方法，轮询就绪的Channel
- 当轮询到了处于就绪状态的Channel时，需要对其进行判断，如果是OP_ACCEPT状态，说明是新的客户端接入，则调用ServerSocketChannel.accept()方法接受新的客户端
- 设置新接入的客户端链路SocketChannel为非阻塞模式，配置其他的一些TCP参数
- 将SocketChannel注册到Selector，监听OP_READ操作位
- 如果轮询的Channel为OP_READ，则说明SocketChannel中有新的就绪的数据包需要读取，则构造ByteBuffer对象，读取数据包
- 如果轮询的Channel为OP_WRITE，说明还有数据没有发送完成，需要继续发送

🌈🌈代码
```java
package com.shu.base;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/25 10:42
 * @version: 1.0
 */
public class TimeServer {
    /**
     * 绑定端口
     * @param port
     */
    public void bind(int port){
        // NioEventLoopGroup是个线程组，它包含了一组NIO线程，专门用于网络事件的处理，实际上它们就是Reactor线程组
        // 这里创建两个的原因是一个用于服务端接受客户端的连接，另一个用于进行SocketChannel的网络读写
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try{
            // ServerBootstrap是一个启动NIO服务的辅助启动类，你可以在这个服务中直接使用Channel
            ServerBootstrap b = new ServerBootstrap();
            // 这一步是必须的，如果没有设置group将会报java.lang.IllegalStateException: group not set异常
            b.group(bossGroup, workerGroup)
                    // 这里我们指定使用NioServerSocketChannel类来举例说明一个新的Channel如何接收进来的连接
                    .channel(NioServerSocketChannel.class)
                    .option(ChannelOption.SO_BACKLOG, 1024)
                    // 这里的事件处理类经常会被用来处理一个最近的已经接收的Channel
                    .childHandler(new ChildChannelHandler());
            // 绑定端口，同步等待成功
            ChannelFuture f = b.bind(port).sync();
            // 等待服务端监听端口关闭
            f.channel().closeFuture().sync();
        }catch (Exception e) {
            e.printStackTrace();
        }finally {
            // 优雅退出，释放线程池资源
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }
}

```
```java
package com.shu.base;

import com.shu.halfpack.TimeHalfPackServerHandler;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.codec.LineBasedFrameDecoder;
import io.netty.handler.codec.string.StringDecoder;
import io.netty.handler.logging.LoggingHandler;

import javax.sound.sampled.Line;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/25 10:46
 * @version: 1.0
 */
public class ChildChannelHandler extends ChannelInitializer<SocketChannel> {
    /**
     * This method will be called once the {@link Channel} was registered. After the method returns this instance
     * will be removed from the {@link ChannelPipeline} of the {@link Channel}.
     *
     * @param ch the {@link Channel} which was registered.
     * @throws Exception is thrown if an error occurs. In that case the {@link Channel} will be closed.
     */
    @Override
    protected void initChannel(SocketChannel ch) throws Exception {
        // 添加处理器
        ch.pipeline().addLast(new TimeServerHandler());
//        ch.pipeline().addLast(new LineBasedFrameDecoder(1024));
//        ch.pipeline().addLast(new StringDecoder());
//        ch.pipeline().addLast(new TimeHalfPackServerHandler());
        // 添加日志处理器
        ch.pipeline().addLast(new LoggingHandler());
    }
}

```
```java
package com.shu.base;


import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerAdapter;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelPromise;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;


/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/25 10:47
 * @version: 1.0
 */
public class TimeServerHandler extends ChannelHandlerAdapter {

    private static final Logger logger = LogManager.getLogger(TimeServerHandler.class);
    /**
     * 连接建立时调用
     * @param ctx
     * @throws Exception
     */
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        super.channelActive(ctx);
        logger.info("channelActive");
    }

    /**
     * 读取客户端发送的数据
     * @param ctx
     * @param msg
     * @throws Exception
     */
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
//        super.channelRead(ctx, msg);
        logger.info("channelRead");
        ByteBuf byteBuf = (ByteBuf) msg;
        byte[] bytes = new byte[byteBuf.readableBytes()];
        byteBuf.readBytes(bytes);
        String body = new String(bytes, "UTF-8");
        logger.info("The time server receive order: " + body);
        String currentTime = "QUERY TIME ORDER".equalsIgnoreCase(body) ? new java.util.Date(System.currentTimeMillis()).toString() : "BAD ORDER";
        ByteBuf resp = ctx.alloc().buffer(currentTime.getBytes().length);
        resp.writeBytes(currentTime.getBytes());
        ctx.write(resp);
    }


    /**
     * 读取完毕后调用
     * @param ctx
     * @throws Exception
     */
    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
//        super.channelReadComplete(ctx);
        ctx.flush();
    }


    /**
     * 连接断开时调用
     * @param ctx               the {@link ChannelHandlerContext} for which the disconnect operation is made
     * @param promise           the {@link ChannelPromise} to notify once the operation completes
     * @throws Exception
     */
    @Override
    public void disconnect(ChannelHandlerContext ctx, ChannelPromise promise) throws Exception {
        super.disconnect(ctx, promise);
        logger.info("disconnect");
    }


    /**
     * 发生异常时调用
     * @param ctx
     * @param cause
     * @throws Exception
     */
    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        super.exceptionCaught(ctx, cause);
        ctx.close();
    }
}

```
🌈🌈启动
```java
package com.shu.base;
/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/25 11:01
 * @version: 1.0
 */
public class TimeServerTest {
    public static void main(String[] args) {
        int port = 8080;
        if (args != null && args.length > 0) {
            try {
                port = Integer.valueOf(args[0]);
            } catch (NumberFormatException e) {
                // 采用默认值
            }
        }
        new TimeServer().bind(port);
    }
}
```
这是server端的代码。就像我在前文中提到的一样，客户端是否使用了NIO技术实际上对整个系统架构的性能影响不大。您可以使用任何支持TCP/IP协议技术的代码，作为客户端。可以使用Python、C++、C#、JAVA等等任意的编程语言。
## 2.2 客户端编写
🌈🌈代码
```java
package com.shu.base;

import com.shu.halfpack.TimeHalfPackClientHandler;
import io.netty.bootstrap.Bootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.LineBasedFrameDecoder;
import io.netty.handler.codec.string.StringDecoder;
import io.netty.handler.logging.LoggingHandler;

import javax.sound.sampled.Line;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/25 10:55
 * @version: 1.0
 */
public class TimeClient {
    /**
     * 连接
     * @param port
     * @param host
     * @throws Exception
     */
    public void connect(int port, String host) throws Exception {
        // 配置客户端NIO线程组
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            Bootstrap b = new Bootstrap();
            b.group(group)
                    .channel(NioSocketChannel.class)
                    .option(ChannelOption.TCP_NODELAY, true)
                    .handler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        public void initChannel(SocketChannel ch) throws Exception {
                            ch.pipeline().addLast(new TimeClientHandler());
//                            ch.pipeline().addLast(new LineBasedFrameDecoder(1024));
//                            ch.pipeline().addLast(new StringDecoder());
//                            ch.pipeline().addLast(new TimeHalfPackClientHandler());
//                            // 添加日志处理器
//                            ch.pipeline().addLast(new LoggingHandler());
                        }
                    });
            // 发起异步连接操作
            ChannelFuture f = b.connect(host, port).sync();
            // 等待客户端链路关闭
            f.channel().closeFuture().sync();
        } finally {
            // 优雅退出，释放NIO线程组
            group.shutdownGracefully();
        }
    }
}


```
```java
package com.shu.base;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelHandlerAdapter;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelPromise;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/25 10:57
 * @version: 1.0
 */
public class TimeClientHandler extends ChannelHandlerAdapter {

    private static final Logger logger = LogManager.getLogger(TimeClientHandler.class);

    /**
     * 连接建立时调用
     * @param ctx
     * @throws Exception
     */
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        super.channelActive(ctx);
        logger.info("channelActive");
        byte[] req = "QUERY TIME ORDER".getBytes();
        ByteBuf byteBuf = Unpooled.buffer(req.length);
        byteBuf.writeBytes(req);
        ctx.writeAndFlush(byteBuf);
    }

    /**
     * 读取服务端发送的数据
     * @param ctx
     * @param msg
     * @throws Exception
     */
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
//        super.channelRead(ctx, msg);
        logger.info("channelRead");
        ByteBuf byteBuf = (ByteBuf) msg;
        byte[] bytes = new byte[byteBuf.readableBytes()];
        byteBuf.readBytes(bytes);
        String body = new String(bytes, "UTF-8");
        logger.info("Now is: " + body);
    }

    /**
     * 发生异常时调用
     * @param ctx
     * @param cause
     * @throws Exception
     */
    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        super.exceptionCaught(ctx, cause);
        logger.info("exceptionCaught");
        ctx.close();
    }

    /**
     * 读取完毕后调用
     * @param ctx
     * @throws Exception
     */
    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
        super.channelReadComplete(ctx);
        logger.info("channelReadComplete");
    }

    /**
     * 服务端返回应答消息时调用
     * @param ctx
     * @param msg
     * @throws Exception
     */
    @Override
    public void write(ChannelHandlerContext ctx, Object msg, ChannelPromise promise) throws Exception {
        super.write(ctx, msg, promise);
        logger.info("write");
    }

    /**
     * 消息从Outbound缓冲区写入到SocketChannel时调用
     * @param ctx
     * @throws Exception
     */
    @Override
    public void flush(ChannelHandlerContext ctx) throws Exception {
        super.flush(ctx);
        logger.info("flush");
    }

    /**
     * 从ChannelHandler中移除时调用
     * @param ctx
     * @throws Exception
     */
    @Override
    public void handlerRemoved(ChannelHandlerContext ctx) throws Exception {
        super.handlerRemoved(ctx);
        logger.info("handlerRemoved");
    }

    /**
     * 添加到ChannelHandler时调用
     * @param ctx
     * @throws Exception
     */
    @Override
    public void handlerAdded(ChannelHandlerContext ctx) throws Exception {
        super.handlerAdded(ctx);
        logger.info("handlerAdded");
    }

}

```
🌈🌈测试
```java
package com.shu.base;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/25 11:00
 * @version: 1.0
 */
public class TimeClientTest {
    public static void main(String[] args) throws Exception {
        int port = 8080;
        if (args != null && args.length > 0) {
            try {
                port = Integer.valueOf(args[0]);
            } catch (NumberFormatException e) {
                // 采用默认值
            }
        }
        new TimeClient().connect(port, "127.0.0.1");
    }
}

```
## 2.3 测试
服务端
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683254337122-7a889cce-ab1c-49de-a321-e59a507240c3.png#averageHue=%232d2d2c&clientId=u7a9c53cb-5527-4&from=paste&height=318&id=u6ea14da7&originHeight=398&originWidth=1838&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=47392&status=done&style=none&taskId=ud847ceb0-5ac8-4050-b7ad-f5f7bdf78f4&title=&width=1470.4)
客户端
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683254359145-392acfa3-3fd7-4251-9a93-fcaf7278639b.png#averageHue=%232f2e2d&clientId=u7a9c53cb-5527-4&from=paste&height=323&id=u294e3022&originHeight=404&originWidth=1880&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=68822&status=done&style=none&taskId=u63c62fc8-d200-475a-b19d-6e8fa9fb51b&title=&width=1504)
## 2.4 代码解释

- **BOSS线程池**
```cpp
//BOSS线程池
EventLoopGroup bossLoopGroup = new NioEventLoopGroup(1);
```
BOSS线程池实际上就是JAVA NIO框架中selector工作角色（这个后文会详细讲），针对一个本地IP的端口，BOSS线程池中有一条线程工作，工作内容也相对简单，就是发现新的连接；Netty是支持同时监听多个端口的，所以BOSS线程池的大小按照需要监听的服务器端口数量进行设置就行了。

- _**Work线程池**_
```cpp
//Work线程池
int processorsNumber = Runtime.getRuntime().availableProcessors();
EventLoopGroup workLoogGroup = new NioEventLoopGroup(processorsNumber * 2, threadFactory, SelectorProvider.provider());
```
这段代码主要是确定Netty中工作线程池的大小，这个大小一般是物理机器/虚拟机器 可用内核的个数 * 2。work线程池中的线程（如果封装的是JAVA NIO，那么具体的线程实现类就是NioEventLoop）都固定负责指派给它的网络连接的事件监听，并根据事件状态，调用不同的ChannelHandler事件方法。而最后一个参数SelectorProvider说明了这个EventLoop所使用的多路复用IO模型为操作系统决定。

- **option配置**
```cpp
serverBootstrap.option(ChannelOption.SO_BACKLOG, 128);
serverBootstrap.childOption(ChannelOption.SO_KEEPALIVE, true);
```
option方法，可以设置这个ServerChannel相应的各种属性（在代码中我们使用的是NioServerSocketChannel）；childOption方法用于设置这个ServerChannel收到客户端时间后，所生成的新的Channel的各种属性。
# 三 重要概念
## 3.1 Netty线程机制
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1703675503551-5e094d75-cb3b-4d02-8205-f6b162ddb056.png?x-oss-process=image%2Fresize%2Cw_714%2Climit_0#averageHue=%23f7d253&from=url&id=Ppxvz&originHeight=802&originWidth=714&originalType=binary&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&title=)

- JAVA对多路复用IO技术的支持中，我们说过，Selector可以是在主线程上面操作，也可以是一个独立的线程进行操作。在Netty中，这里的部分工作就是交给BOSS线程做的。BOSS线程负责发现连接到服务器的新的channel（SocketServerChannel的ACCEPT事件），并且将这个channel经过检查后注册到WORK连接池的某个EventLoop线程中。
- 而当WORK线程发现操作系统有一个它感兴趣的IO事件时（例如SocketChannel的READ事件）则调用相应的ChannelHandler事件。当某个channel失效后（例如显示调用ctx.close()）这个channel将从绑定的EventLoop中被剔除。
```cpp
   // NioEventLoopGroup是个线程组，它包含了一组NIO线程，专门用于网络事件的处理，实际上它们就是Reactor线程组
        // 这里创建两个的原因是一个用于服务端接受客户端的连接，另一个用于进行SocketChannel的网络读写
EventLoopGroup bossGroup = new NioEventLoopGroup();
EventLoopGroup workerGroup = new NioEventLoopGroup();
```

- Work线程池的线程将按照底层JAVA NIO的Selector的事件状态，决定执行ChannelHandler中的哪一个事件方法（Netty中的事件，包括了channelRegistered、channelUnregistered、channelActive、channelInactive等事件方法），执行完成后，work线程将一直轮询直到操作系统回复下一个它所管理的channel发生了新的IO事件。
## 3.2 ByteBuf
**JBOSS-Netty给出的解释是：我写的缓存比JAVA中的ByteBuffer牛**

- io.netty.buffer.EmptyByteBuf：这是一个初始容量和最大容量都为0的缓存区。一般我们用这种缓存区描述“没有任何处理结果”，并将其向下一个handler传递。
- io.netty.buffer.ReadOnlyByteBuf：这是一个不允许任何“写请求”的只读缓存区。一般是通过Unpooled.unmodifiableBuffer(ByteBuf)方法将某一个正常可读写的缓存区转变而成。如果我们需要在下一个Handler处理的过程中禁止写入任何数据到缓存区，就可以在这个handler中进行“只读缓存区”的转换。
- io.netty.buffer.UnpooledDirectByteBuf：基本的JAVA NIO框架的ByteBuffer封装。一般我们直接使用这个缓存区实现来处理Handler事件。
- io.netty.buffer.PooledByteBuf：Netty4.X版本的缓存新特性，主要是为了减少之前unpoolByteBuf在创建和销毁时的GC时间。
## 3.3 Channel
Channel，通道。您可以使用JAVA NIO中的Channel去初次理解它，但实际上它的意义和JAVA NIO中的通道意义还不一样。我们可以理解成：“更抽象、更丰富”。
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1703951409439-0d757d4f-0d9e-4dfd-9237-c40a9ad87ca1.png#averageHue=%23edcd96&clientId=u0208b43e-70a3-4&from=paste&id=u932a78c0&originHeight=282&originWidth=424&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ua877afbf-a4a9-440d-955f-b5ca411e601&title=)

- Netty中的Channel专门代表网络通信，这个和JAVA NIO框架中的Channel不一样，后者中还有类似FileChannel本地文件IO通道。由于前者专门代表网络通信，所以它是由客户端地址 + 服务器地址 + 网络操作状态构成的，请参见io.netty.channel.Channel接口的定义。
- 每一个Netty中的Channel，比JAVA NIO中的Channel更抽象。这是为什么呢？在Netty中，不止封装了JAVA NIO的IO模型，还封装了JAVA BIO的阻塞同步IO通信模型。将他们在表现上都抽象成Channel了。这就是为什么Netty中有io.netty.channel.oio.AbstractOioChannel这样的抽象类。
## 3.4 ChannelPipeline和ChannelHandler

- Netty中的每一个Channel，都有一个独立的ChannelPipeline，中文称为“通道水管”。只不过这个水管是双向的里面流淌着数据，数据可以通过这个“水管”流入到服务器，也可以通过这个“水管”从服务器流出。
- 在ChannelPipeline中，有若干的过滤器。我们称之为“ChannelHandler”（处理器或者过滤器）。同“流入”和“流出”的概念向对应：用于处理/过滤 流入数据的ChannelHandler，称之为“ChannelInboundHandler”；用于处理/过滤 流出数据的ChannelHandler，称之为“ChannelOutboundHandler”。

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1703951485400-c2c2dba7-c4ab-4728-9b72-9db502111100.png#averageHue=%23fefede&clientId=u0208b43e-70a3-4&from=paste&id=u4ddf8dab&originHeight=152&originWidth=349&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u362ec25e-a389-4ed6-971a-1951edc80ac&title=)
### 3.4.1 责任链和适配器的应用

- 数据在ChannelPipeline中有一个一个的Handler进行处理，并形成一个新的数据状态。这是典型的“责任链”模式。
- 需要注意，虽然数据管道中的Handler是按照顺序执行的，但不代表某一个Handler会处理任何一种由“上一个handler”发送过来的数据。某些Handler会检查传来的数据是否符合要求，如果不符合自己的处理要求，则不进行处理。
- 我们可以实现ChannelInboundHandler接口或者ChannelOutboundHandler接口，来实现我们自己业务的“数据流入处理器”或者“数据流出”处理器。
- 但是这两个接口的事件方法是比较多的，例如ChannelInboundHandler接口一共有11个需要实现的接口方法（包括父级ChannelHandler的，我们在下一节讲解Channel的生命周期时，回专门讲到这些事件的执行顺序和执行状态），一般情况下我们不需要把这些方法全部实现。
- 所以Netty中增加了两个适配器“ChannelInboundHandlerAdapter”和“ChannelOutboundHandlerAdapter”来帮助我们去实现我们只需要实现的事件方法。其他的事件方法我们就不需要关心了

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1703951556415-57fbfc93-1c05-4b19-bd0e-908a36c863ce.png#averageHue=%23fdfbda&clientId=u0208b43e-70a3-4&from=paste&id=u1341ac13&originHeight=63&originWidth=394&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u6201ba15-3f52-4fff-96a5-3f6a447d8ab&title=)
### 3.4.2 ChannelInboundHandler类举例

- HttpRequestDecoder：实现了Http协议的数据输入格式的解析。这个类将数据编码为HttpMessage对象，并交由下一个ChannelHandler进行处理。
- ByteArrayDecoder：最基础的数据流输入处理器，将所有的byte转换为ByteBuf对象（一般的实现类是：io.netty.buffer.UnpooledUnsafeDirectByteBuf）。我们进行一般的文本格式信息传输到服务器时，最好使用这个Handler将byte数组转换为ByteBuf对象。
- DelimiterBasedFrameDecoder：这个数据流输入处理器，会按照外部传入的数据中给定的某个关键字符/关键字符串，重新将数据组装为新的段落并发送给下一个Handler处理器。后文中，我们将使用这个处理器进行TCP半包的问题。
- 还有很多直接支持标准数据格式解析的处理器，例如支持Google Protocol Buffers 数据格式解析的ProtobufDecoder和ProtobufVarint32FrameDecoder处理器。
### 3.4.3 ChannelOutboundHandler类举例

- HttpResponseEncoder：这个类和HttpRequestDecoder相对应，是将服务器端HttpReponse对象的描述转换成ByteBuf对象形式，并向外传播。
- ByteArrayEncoder：这个类和ByteArrayDecoder，是将服务器端的ByteBuf对象转换成byte数组的形式，并向外传播。一般也和ByteArrayDecoder对象成对使用。
- 还有支持标准的编码成Google Protocol Buffers格式、JBoss Marshalling 格式、ZIP压缩格式的ProtobufEncoder、ProtobufVarint32LengthFieldPrepender、MarshallingEncoder、JZlibEncoder等
## 3.5 Channel的生命周期
在说到ChannelInHandler为什么会使用“适配器”模式的时候，特别指出了原因：因为ChannelInHandler接口中的方法加上父级接口中的方法，总共有11个接口事件方法需要实现。而事实上很多时候我们只会关心其中的一个或者两个接口方法。
那么这些方法是什么时候被触发的呢？这就要说到Netty中一个Channel的生命周期了（这里我们考虑的生命周期是指Netty对JAVA NIO技术框架的封装）：
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1703951727029-6fbbce56-5308-408e-9e24-51b59e79ddb6.png#averageHue=%23f9f0e3&clientId=u0208b43e-70a3-4&from=paste&id=u74ddf6b4&originHeight=645&originWidth=841&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u7ce0b3ff-10c0-4d1f-b98a-452c627aa44&title=)

- 这里有一个channel事件没有在图中说明，就是exceptionCaught(ChannelHandlerContext, Throwable)事件。只要在调用图中的所有事件方法时，有异常抛出，exceptionCaught方法就会被调用。
- 另外，不是channelReadComplete(ChannelHandlerContext)方法调用后就一定会调用channelInactive事件方法。channelReadComplete和channelRead是可以反复调用的，只要客户端有数据发送过来。
- 最后补充一句，这个生命周期的事件方法调用顺序只是针对Netty封装使用JAVA NIO框架时，并且在进行TCP/IP协议监听时的事件方法调用顺序。





