---
title: Netty整合SpringBoot
sidebar_position: 2
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
前面我们介绍了Netty的基本用法以及基本知识，但是在我们的实际开发中要用到SpringBoot，下面我们来看看SpringBoot的整合与简单的文件传输吧
# 一 Netty+SpringBoot环境搭建
🌈🌈依赖
```java

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.24</version>
        </dependency>

        <dependency>
            <groupId>io.netty</groupId>
            <artifactId>netty-all</artifactId>
            <version>4.1.65.Final</version>
        </dependency>

        <!-- 修复 Apache Log4j2 远程代码执行漏洞 -->
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-core</artifactId>
            <version>2.17.0</version>
        </dependency>

        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-api</artifactId>
            <version>2.17.0</version>
        </dependency>
```
🌈🌈yaml配置
```java
server:
  port:8080
netty:
  host: 127.0.0.1
  port: 7397
```
下面我们分别搭建服务端与客户端
## 1.1 服务端
```java
package com.shu;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.Channel;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.InetSocketAddress;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/5/7 10:27
 * @version: 1.0
 */
@Component("nettyServer")
public class NettyServer {
    private Logger logger = LoggerFactory.getLogger(NettyServer.class);

    private final EventLoopGroup parentGroup = new NioEventLoopGroup();
    private final EventLoopGroup childGroup = new NioEventLoopGroup();
    private Channel channel;


    /**
     * 绑定端口
     * @param address
     * @return
     */
    public ChannelFuture bind(InetSocketAddress address) {
        ChannelFuture channelFuture = null;
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(parentGroup, childGroup)
                    .channel(NioServerSocketChannel.class)    //非阻塞模式
                    .option(ChannelOption.SO_BACKLOG, 128)
                    .childHandler(new MyChannelInitializer());
            channelFuture = b.bind(address).syncUninterruptibly();
            channel = channelFuture.channel();
        } catch (Exception e) {
            logger.error(e.getMessage());
        } finally {
            if (null != channelFuture && channelFuture.isSuccess()) {
                logger.info("netty server start done.");
            } else {
                logger.error("netty server start error.");
            }
        }
        return channelFuture;
    }


    /**
     * 销毁
     */
    public void destroy() {
        if (null == channel) return;
        channel.close();
        parentGroup.shutdownGracefully();
        childGroup.shutdownGracefully();
    }


    /**
     * 获取通道
     * @return
     */
    public Channel getChannel() {
        return channel;
    }


}

```
```java
package com.shu;

import io.netty.channel.ChannelInitializer;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.codec.LineBasedFrameDecoder;
import io.netty.handler.codec.string.StringDecoder;
import io.netty.handler.codec.string.StringEncoder;
import io.netty.handler.logging.LogLevel;
import io.netty.handler.logging.LoggingHandler;

import java.nio.charset.Charset;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/5/7 10:31
 * @version: 1.0
 */
public class MyChannelInitializer extends ChannelInitializer<SocketChannel> {
    /**
     * 初始化channel
     * @param channel
     * @throws Exception
     */
    @Override
    protected void initChannel(SocketChannel channel) throws Exception {
        // 日志打印
        channel.pipeline().addLast(new LoggingHandler(LogLevel.INFO));
        // 基于换行符号
        channel.pipeline().addLast(new LineBasedFrameDecoder(1024));
        // 解码转String，注意调整自己的编码格式GBK、UTF-8
        channel.pipeline().addLast(new StringDecoder(Charset.forName("GBK")));
        // 解码转String，注意调整自己的编码格式GBK、UTF-8
        channel.pipeline().addLast(new StringEncoder(Charset.forName("GBK")));
        // 在管道中添加我们自己的接收数据实现方法
        channel.pipeline().addLast(new MyServerHandler());

    }
}
```
```java
package com.shu;

import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.channel.socket.SocketChannel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/5/7 10:33
 * @version: 1.0
 */
public class MyServerHandler extends ChannelInboundHandlerAdapter {

    private Logger logger = LoggerFactory.getLogger(MyServerHandler.class);

    /**
     * 当客户端主动链接服务端的链接后，这个通道就是活跃的了。也就是客户端与服务端建立了通信通道并且可以传输数据
     */
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        SocketChannel channel = (SocketChannel) ctx.channel();
        //通知客户端链接建立成功
        String str = "通知客户端链接建立成功" + " " + new Date() + " " + channel.localAddress().getHostString() + "\r\n";
        ctx.writeAndFlush(str);
    }

    /**
     * 当客户端主动断开服务端的链接后，这个通道就是不活跃的。也就是说客户端与服务端的关闭了通信通道并且不可以传输数据
     */
    @Override
    public void channelInactive(ChannelHandlerContext ctx) throws Exception {
        logger.info("客户端断开链接{}", ctx.channel().localAddress().toString());
    }


    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        //接收msg消息{与上一章节相比，此处已经不需要自己进行解码}
        logger.info(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()) + " 服务端接收到消息：" + msg);
        //通知客户端链消息发送成功
        String str = "服务端收到：" + new Date() + " " + msg + "\r\n";
        ctx.writeAndFlush(str);
    }

    /**
     * 抓住异常，当发生异常的时候，可以做一些相应的处理，比如打印日志、关闭链接
     */
    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        ctx.close();
        logger.info("异常信息：\r\n" + cause.getMessage());
    }


}
```
```java
package com.shu;

import io.netty.channel.ChannelFuture;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

import java.net.InetSocketAddress;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/5/7 10:36
 * @version: 1.0
 */
@SpringBootApplication
@ComponentScan("com.shu")
public class NettyApplication implements CommandLineRunner {

    @Value("${netty.host}")
    private String host;
    @Value("${netty.port}")
    private int port;
    @Autowired
    private NettyServer nettyServer;

    public static void main(String[] args) {
        SpringApplication.run(NettyApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        InetSocketAddress address = new InetSocketAddress(host, port);
        ChannelFuture channelFuture = nettyServer.bind(address);
        Runtime.getRuntime().addShutdownHook(new Thread(() -> nettyServer.destroy()));
        channelFuture.channel().closeFuture().syncUninterruptibly();
    }

}

```
## 1.2 客户端
```java
import io.netty.bootstrap.Bootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.LineBasedFrameDecoder;
import io.netty.handler.codec.string.StringDecoder;
import io.netty.handler.codec.string.StringEncoder;
import io.netty.handler.logging.LogLevel;
import io.netty.handler.logging.LoggingHandler;

import java.nio.charset.Charset;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/5/7 10:41
 * @version: 1.0
 */
public class ApiTest {
    public static void main(String[] args) {
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            Bootstrap b = new Bootstrap();
            b.group(workerGroup);
            b.channel(NioSocketChannel.class);
            b.option(ChannelOption.AUTO_READ, true);
            b.handler(new ChannelInitializer<SocketChannel>() {
                @Override
                protected void initChannel(SocketChannel channel) throws Exception {
                    // 日志打印
                    channel.pipeline().addLast(new LoggingHandler(LogLevel.INFO));
                    // 基于换行符号
                    channel.pipeline().addLast(new LineBasedFrameDecoder(1024));
                    // 解码转String，注意调整自己的编码格式GBK、UTF-8
                    channel.pipeline().addLast(new StringDecoder(Charset.forName("GBK")));
                    // 解码转String，注意调整自己的编码格式GBK、UTF-8
                    channel.pipeline().addLast(new StringEncoder(Charset.forName("GBK")));
                    // 在管道中添加我们自己的接收数据实现方法
                    channel.pipeline().addLast(new ChannelInboundHandlerAdapter() {
                        @Override
                        public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
                            //接收msg消息{与上一章节相比，此处已经不需要自己进行解码}
                            System.out.println(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()) + " 客户端接收到消息：" + msg);
                        }
                    });
                }
            });
            ChannelFuture f = b.connect("127.0.0.1", 7397).sync();
            System.out.println(" client start done");
            //向服务端发送信息
            f.channel().writeAndFlush("你好，SpringBoot启动的netty服务端，“我的结尾是一个换行符，用于传输半包粘包处理”\r\n");
            f.channel().writeAndFlush("你好，SpringBoot启动的netty服务端，“我的结尾是一个换行符，用于传输半包粘包处理”\r\n");
            f.channel().writeAndFlush("你好，SpringBoot启动的netty服务端，“我的结尾是一个换行符，用于传输半包粘包处理”\r\n");
            f.channel().writeAndFlush("你好，SpringBoot启动的netty服务端，“我的结尾是一个换行符，用于传输半包粘包处理”\r\n");
            f.channel().writeAndFlush("你好，SpringBoot启动的netty服务端，“我的结尾是一个换行符，用于传输半包粘包处理”\r\n");
            f.channel().closeFuture().syncUninterruptibly();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            workerGroup.shutdownGracefully();
        }
    }
}
```
## 1.3 测试
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683548461645-7dc7b109-a5bb-4c5c-b143-ba10dc97bf7a.png#averageHue=%23fbf9f9&clientId=u252ddd13-100d-4&from=paste&id=uda71e535&originHeight=447&originWidth=1392&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=136246&status=done&style=none&taskId=ub3b5bc53-0035-44c8-8c8b-f03550bfe65&title=)
我们仔细来观察一下这个日志打印，并注意一下这些字节的意思

- 注册

客户端
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683548512337-fde89d69-2372-47ae-aa2e-e2589a204e0f.png#averageHue=%23353332&clientId=u252ddd13-100d-4&from=paste&height=105&id=uc46d373f&originHeight=131&originWidth=1767&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=50169&status=done&style=none&taskId=u48454e65-42eb-4252-b3d6-a3125d3f230&title=&width=1413.6)
服务端
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683548560056-cc2b7387-71a0-40ca-a009-789b0fabff22.png#averageHue=%2331302f&clientId=u252ddd13-100d-4&from=paste&height=177&id=u751fdfd3&originHeight=221&originWidth=1764&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=99118&status=done&style=none&taskId=uef237297-976f-4b51-bb02-51501fd3242&title=&width=1411.2)

- 客户端建立连接

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683548621722-631bac9f-2ade-4b84-8f5b-3212d54cdfad.png#averageHue=%23363432&clientId=u252ddd13-100d-4&from=paste&height=361&id=u9c8711c6&originHeight=451&originWidth=1817&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=167376&status=done&style=none&taskId=ud50dd25a-027e-4c15-8642-f34c8770e6e&title=&width=1453.6)

- 服务端连接建立，通知客户端连接建立

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683548773827-de3ad0ec-2091-45a4-964f-00369a664b21.png#averageHue=%23302e2d&clientId=u252ddd13-100d-4&from=paste&height=278&id=u6bc5a72a&originHeight=348&originWidth=1826&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=93598&status=done&style=none&taskId=ueb095e87-e41e-402c-9379-cfe4f3e3c10&title=&width=1460.8)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683548874439-1dba7cd4-aa75-4663-bc65-9e2fdb0a3222.png#averageHue=%232f2e2d&clientId=u252ddd13-100d-4&from=paste&height=192&id=u0b652468&originHeight=240&originWidth=1807&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=47929&status=done&style=none&taskId=u407e9804-2fd5-4b00-9da7-b392e416ead&title=&width=1445.6)
看到这里我就很疑惑他到底是如何把我们的文件转换成16进制的？
通过代码我们知道我们传递的文字：通知客户端链接建立成功 Mon May 08 20:30:04 CST 2023 127.0.0.1 但是他是如何转换成16进制的，下面我们来具体分析一下？
> 前提知识?

- GBK的中文编码是双字节来表示的，英文编码是用ASC||码表示的，既用单字节表示。但GBK编码表中也有英文字符的双字节表示形式，所以英文字母可以有2中GBK表示方式。为区分中文，将其最高位都定成1。英文单字节最高位都为0。当用GBK解码时，若高字节最高位为0，则用ASC||码表解码；若高字节最高位为1，则用GBK编码表解码
- 至于UTF－8编码则是用以解决国际上字符的一种多字节编。码，它对英文使用8位（即一个字节），中文使用24位（三个字节）来编码。
> 分析

这里我们采用的是GBK编码，那我们咋看懂这些字节表示的啥，这里可能还需要一些基本知识进制的转成，1字节8bit ，有了基础知识我们再来分析，如上面说中文GBK两个字节表示一个中文，那么通这个中文对应的两个字节就是cd a8，那咋验证？
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683549764486-d6670bbd-93d3-4eb9-8716-18d571404645.png#averageHue=%23f1f1f1&clientId=u252ddd13-100d-4&from=paste&height=341&id=u6854f82b&originHeight=426&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=39221&status=done&style=none&taskId=u52c02caa-9084-4788-87ef-bb18dab6034&title=&width=1536)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683549812444-9baa07d6-6470-42d3-92ef-d3a958d672be.png#averageHue=%23f1f1f1&clientId=u252ddd13-100d-4&from=paste&height=448&id=u05dfd312&originHeight=560&originWidth=1896&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=47951&status=done&style=none&taskId=u1f71e2e8-e52f-4b90-8826-ef111cd6d8b&title=&width=1516.8)
参考网站：[GB2312简体中文编码表 - 常用参考表对照表 - 脚本之家在线工具](http://tools.jb51.net/table/gb2312)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683550056302-4bb3cbfb-96c9-45b8-b345-a489a469c84d.png#averageHue=%23cbcac8&clientId=u252ddd13-100d-4&from=paste&height=283&id=ue9d0a2a7&originHeight=354&originWidth=1444&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=40606&status=done&style=none&taskId=u842d8d11-496a-434d-b2ae-506ae4d025b&title=&width=1155.2)
我们可以发现真是CDA8代表汉字通，这也解释我心中的疑惑，这里这是汉字，下面我们看一下字母
> 字母分析？

当用GBK解码时，若高字节最高位为0，则用ASC||码表解码；若高字节最高位为1，则用GBK编码表解码？
那啥是高字节与低字节?
存放最低的8位有效位的字节被称为最低有效位字节或低位字节，而存放最高的8位有效位的字节被称为最高有效位字节或高位字节。
  高位字节                       低位字节
  ↓------------------------------↓    ↓-----------------------------↓           
 
	15  14  13  12  11  10  9.  8.  7.  6.  5.  4.  3.  2.  1.  0. 

参考链接：[ASCII码一览表，ASCII码对照表](http://c.biancheng.net/c/ascii/)
我们可以通过Ascll码表可以发现空格对应16进制的20
而M的十六进制：4D
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683550678886-6b9d6832-5593-47a9-a9cf-8ed3fd55fcf8.png#averageHue=%23fbfbfb&clientId=u252ddd13-100d-4&from=paste&height=351&id=ub5bed4e8&originHeight=439&originWidth=1408&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=30871&status=done&style=none&taskId=u145d50ce-9118-4c73-90a0-39f8af3a565&title=&width=1126.4)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683550697978-931dfb57-b11f-4c87-88dc-4164bce10645.png#averageHue=%232f2e2e&clientId=u252ddd13-100d-4&from=paste&height=227&id=ubc03a7d9&originHeight=284&originWidth=1838&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=51075&status=done&style=none&taskId=u4db6212f-fbf2-4f94-83e0-c202d844857&title=&width=1470.4)
相信进过上面的理解，应该这一看懂这段报文的理解，这也为了自己看懂协议有了会很好的铺垫，下面我们继续看服务端与客户端的连接过程

- 客户端收到消息，建立链接，可以进行消息的传递了

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683551005347-aeed33ae-0790-43f1-933e-e18ab77e7b9d.png#averageHue=%232f2e2e&clientId=u252ddd13-100d-4&from=paste&height=61&id=u7c5932fe&originHeight=76&originWidth=1758&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=18898&status=done&style=none&taskId=uf478fa84-e8bb-41b9-9d81-8c7e8eb8ed8&title=&width=1406.4)

- 客户端写消息

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683551230128-da2c1623-9d53-460c-a9e6-b652a99f20c1.png#averageHue=%232f2f2e&clientId=u252ddd13-100d-4&from=paste&height=301&id=u4c22f7cb&originHeight=376&originWidth=1830&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=72963&status=done&style=none&taskId=u8ad9a795-d41c-4653-9c19-83c4763492b&title=&width=1464)

- 服务端收消息

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683551298439-b8bda8a7-447c-4e55-86c1-529e92cba1f5.png#averageHue=%232e2d2c&clientId=u252ddd13-100d-4&from=paste&height=318&id=u7acce8f3&originHeight=397&originWidth=1794&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=78902&status=done&style=none&taskId=u283a7cc0-d242-493e-b178-73d68f0c8c3&title=&width=1435.2)
# 二 Netty实现简单的文件传输
文件传输在我们的实际开发中中非常常见，下面我们来个简单的案例
## 2.1 实体类
**主要必须实现序列化**
```java
package com.shu.file01;

import lombok.Data;

import java.io.File;
import java.io.Serializable;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/5/7 20:28
 * @version: 1.0
 */
@Data
public class FileResponse implements Serializable {
    private long length;
    private File file;

    public FileResponse() {
    }

    public FileResponse(long length, File file) {
        this.length = length;
        this.file = file;
    }

    public long getLength() {
        return length;
    }

    public File getFile() {
        return file;
    }
}

```
```java
package com.shu.file01;

import lombok.Data;

import java.io.Serializable;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/5/7 20:27
 * @version: 1.0
 */
@Data
public class FileRequest implements Serializable {
    private String fileName;

    public FileRequest() {
    }

    public FileRequest(String fileName) {
        this.fileName = fileName;
    }

    public String getFileName() {
        return fileName;
    }
}

```
## 2.2 服务端
```java
package com.shu.file01;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.serialization.ClassResolvers;
import io.netty.handler.codec.serialization.ObjectDecoder;
import io.netty.handler.codec.serialization.ObjectEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/5/7 19:57
 * @version: 1.0
 */
@Component("fileServer")
public class FileServer {

    private Logger logger = LoggerFactory.getLogger(FileServer.class);


    /**
     * 绑定端口
     *
     * @param port
     * @return
     */
    public void bind(int port) {
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            ServerBootstrap bootstrap = new ServerBootstrap()
                    .group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {
                            ch.pipeline()
                                    .addLast(new ObjectEncoder())
                                    .addLast(new ObjectDecoder(Integer.MAX_VALUE, ClassResolvers.weakCachingConcurrentResolver(null)))
                                    .addLast(new FileServerHandler());
                        }
                    });

            ChannelFuture future = bootstrap.bind(port).sync();
            future.channel().closeFuture().sync();
            System.out.println("服务端启动成功，端口：" + port);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }

    }

}
```
```java
package com.shu.file01;

import io.netty.channel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.RandomAccessFile;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/5/7 20:19
 * @version: 1.0
 */
public class FileServerHandler extends ChannelInboundHandlerAdapter  {

    private static final String FILE_PATH = "D:\\coreconfig.txt";

    private Logger logger = LoggerFactory.getLogger(FileServerHandler.class);


    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        super.channelActive(ctx);
        logger.info("channelActive");
    }


    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        logger.info("channelRead");
        if (msg instanceof FileRequest) {
            FileRequest request = (FileRequest) msg;
            if (request.getFileName().equals(FILE_PATH)) {
                File file = new File(FILE_PATH);
                if (file.exists()) {
                    RandomAccessFile raf = new RandomAccessFile(file, "r");
                    long length = raf.length();
                    FileResponse response = new FileResponse(length, file);
                    ctx.writeAndFlush(response);

                    ChannelFuture sendFileFuture = ctx.writeAndFlush(new DefaultFileRegion(raf.getChannel(), 0, length), ctx.newProgressivePromise());
                    sendFileFuture.addListener(new ChannelProgressiveFutureListener() {
                        @Override
                        public void operationComplete(ChannelProgressiveFuture future) throws Exception {
                            System.out.println("File transfer completed.");
                            raf.close();
                        }

                        @Override
                        public void operationProgressed(ChannelProgressiveFuture future, long progress, long total) throws Exception {
                            if (total < 0) {
                                System.err.println("File transfer progress: " + progress);
                            } else {
                                System.err.println("File transfer progress: " + progress + " / " + total);
                            }
                        }
                    });
                } else {
                    System.err.println("File not found: " + FILE_PATH);
                }
            } else {
                System.err.println("Invalid file name: " + request.getFileName());
            }
        }
    }

}
```
## 2.3 客户端
```java
package com.shu.file01;

import io.netty.bootstrap.Bootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.serialization.ClassResolvers;
import io.netty.handler.codec.serialization.ObjectDecoder;
import io.netty.handler.codec.serialization.ObjectEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/5/7 20:42
 * @version: 1.0
 */
public class FileClient {
    private static final int PORT = 8080;
    private static final String HOST = "localhost";
    private Logger logger = LoggerFactory.getLogger(FileClient.class);
    private final EventLoopGroup parentGroup = new NioEventLoopGroup();


    /**
     * 连接服务端
     */
    public void connect() {
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            Bootstrap bootstrap = new Bootstrap()
                    .group(group)
                    .channel(NioSocketChannel.class)
                    .option(ChannelOption.TCP_NODELAY, true)
                    .handler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {
                            ch.pipeline()
                                    .addLast(new ObjectEncoder())
                                    .addLast(new ObjectDecoder(ClassResolvers.weakCachingConcurrentResolver(null)))
                                    .addLast(new FileClientHandler());
                        }
                    });

            ChannelFuture future = bootstrap.connect(HOST, PORT).sync();
            future.channel().closeFuture().sync();
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            group.shutdownGracefully();
        }
    }
}

```
```java
package com.shu.file01;

import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.channels.FileChannel;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/5/7 20:47
 * @version: 1.0
 */
public class FileClientHandler extends ChannelInboundHandlerAdapter {


    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        FileRequest request = new FileRequest("D:\\coreconfig.txt");
        ctx.writeAndFlush(request);
    }


    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        if (msg instanceof FileResponse) {
            FileResponse response = (FileResponse) msg;
            File file = response.getFile();
            long fileLength = response.getLength();
            FileOutputStream fos = new FileOutputStream(file);
            FileChannel channel = fos.getChannel();
//            channel.transferFrom(channel, 0, fileLength);
            System.out.println("File " + file.getName() + " received.");
        } else {
            System.err.println("Invalid response type: " + msg.getClass());
        }
    }

}

```
## 2.4 测试
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683551675768-86ba2296-3701-4b8c-b56c-b95fbcc62893.png#averageHue=%2333312f&clientId=u252ddd13-100d-4&from=paste&height=345&id=u887ee5d4&originHeight=431&originWidth=1784&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=131447&status=done&style=none&taskId=u71360934-1920-4341-a8ad-77c265b76c7&title=&width=1427.2)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683551693738-f3155be8-f284-473c-bcfe-29f8b2937f77.png#averageHue=%23343331&clientId=u252ddd13-100d-4&from=paste&height=150&id=ucbe915af&originHeight=188&originWidth=1818&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=60470&status=done&style=none&taskId=u24b1a4c7-7c8d-46ca-b1dd-2796ab2e84d&title=&width=1454.4)
这就是一个简单的测试吧，实际的开发中我们需要考虑很多，比如大文件的传输，断点续点，文件传输的加密等等系列问题，这个我正在研究中，以后再说

