---
title: Netty整合多协议
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
  date: 2023-12-30
  author: EasonShu
---



Netty官网：[Netty: Home](https://netty.io/)
参考书籍：《Netty权威指南》
在我们的开发中设计到很多协议，比如电力采集协议，汽车协议，等等，大致可以分为两大类公有协议与私有协议两大类，通信协议从广义上区分，可以分为公有协议和私有协议。
由于私有协议的灵活性，它往往会在某个公司或者组织内部使用，按需定制，也因为如此，升级起来会非常方便，灵活性好。
绝大多数的私有协议传输层都基于TCP/IP，所以利用Netty的NIO TCP协议栈可以非常方便地进行私有协议的定制和开发。
# 一 Http协议

- HTTP（超文本传输协议）协议是建立在TCP传输协议之上的应用层协议，它的发展是万维网协会和Internet工作小组IETF合作的结果。
- HTTP是一个属于应用层的面向对象的协议，由于其简捷、快速的方式，适用于分布式超媒体信息系统。它于1990年提出，经过多年的使用和发展，得到了不断地完善和扩展。
## 1.1 HTTP协议介绍
HTTP是一个属于应用层的面向对象的协议，由于其简捷、快速的方式，适用于分布式超媒体信息系统。
> 特点

- 支持Client/Server模式
-  简单——客户向服务器请求服务时，只需指定服务URL，携带必要的请求参数或者消息体
- 灵活——HTTP允许传输任意类型的数据对象，传输的内容类型由HTTP消息头中的Content-Type加以标记
- 无状态——HTTP协议是无状态协议，无状态是指协议对于事务处理没有记忆能力。
## 1.2 HTTP URL
格式：
**http://host[:port][abs_path]**
其中**http**表示要通过HTTP协议来定位网络资源。
**host**表示合法的Internet主机域名或IP地址（以点分十进制格式表示）；
**port**用于指定一个端口号，拥有被请求资源的服务器主机监听该端口的TCP连接。
如果port是空，则使用缺省的端口80。当服务器的端口不是80的时候，需要显式指定端口号。
**abs_path**指定请求资源的URI(Uniform Resource Identifier，统一资源定位符)，如果URL中没有给出abs_path，那么当它作为请求URI时，必须以“/”的形式给出。通常这个工作浏览器就帮我们完成了。
## 1.3 Http请求消息
HTTP请求由三部分组成，具体如下。◎ HTTP请求行；◎ HTTP消息头；◎ HTTP请求正文。
> 请求行

请求行以一个方法符开头，以空格分开，后面跟着请求的URI和协议的版本，格式为：Method Request-URI HTTP-Version CRLF。其中Method表示请求方法，Request-URI是一个统一资源标识符，HTTP-Version表示请求的HTTP协议版本，CRLF表示回车和换行
请求方法有多种，各方法的作用如下。

- GET：请求获取Request-URI所标识的资源
- POST：在Request-URI所标识的资源后附加新的提交数据
- HEAD：请求获取由Request-URI所标识的资源的响应消息报头
-  PUT：请求服务器存储一个资源，并用Request-URI作为其标识
- DELETE：请求服务器删除Request-URI所标识的资源
- TRACE：请求服务器回送收到的请求信息，主要用于测试或诊断
-  CONNECT：保留将来使用
-  OPTIONS：请求查询服务器的性能，或者查询与资源相关的选项和需求
> 消息头

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683339570405-cf3f0c67-136f-4ef4-9f69-cbf94295be73.png#averageHue=%23f2f2f2&clientId=u203f90df-c403-4&from=paste&height=649&id=u2eb99d70&originHeight=811&originWidth=968&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=377655&status=done&style=none&taskId=udae68bc9-3a8c-401e-95e0-501699fa52c&title=&width=774.4)
## 1.4 Http响应消息
处理完HTTP客户端的请求之后，HTTP服务端返回响应消息给客户端，HTTP响应也是由三个部分组成，分别是：状态行、消息报头、响应正文。
> 状态行

状态行的格式为：HTTP-Version Status-Code Reason-Phrase CRLF，其中HTTP-Version表示服务器HTTP协议的版本，Status-Code表示服务器返回的响应状态代码，Status-Code表示服务器返回的响应状态代码。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683339684456-92ce1695-ee88-4e96-bcc7-df2b6c70036e.png#averageHue=%23f2f2f2&clientId=u203f90df-c403-4&from=paste&height=462&id=udad9d7e9&originHeight=578&originWidth=1732&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=230537&status=done&style=none&taskId=u31880a5a-9863-4819-bcf4-f5b64f51565&title=&width=1385.6)
> 响应头

响应报头允许服务器传递不能放在状态行中的附加响应信息，以及关于服务器的信息和对Request-URI所标识的资源进行下一步访问的信息。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683339739473-7fea6b4c-150f-4fd2-ae9c-7b8591a2caec.png#averageHue=%23efefef&clientId=u203f90df-c403-4&from=paste&height=293&id=u95303a71&originHeight=366&originWidth=1735&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=207726&status=done&style=none&taskId=u4b2eb8c5-dcb3-4757-a23b-328fceb4e08&title=&width=1388)
## 1.5 Netty+Http协议开发
我们以文件服务器为例学习Netty的HTTP服务端入门开发，例程场景如下：

- 文件服务器使用HTTP协议对外提供服务
- 当客户端通过浏览器访问文件服务器时，对访问路径进行检查，检查失败返回403
- 检查通过，以链接的方式打开当前文件目录，每个目录或者都是个超链接，可以递归访问
- 如果是目录，可以继续递归访问它下面的目录或者文件，如果是文件并且可读，则可以在浏览器端直接打开，或者通过[目标另存为]下载

🌈🌈服务端代码
```java
package com.shu.HttpProtocol;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpRequestDecoder;
import io.netty.handler.codec.http.HttpResponseEncoder;
import io.netty.handler.logging.LogLevel;
import io.netty.handler.logging.LoggingHandler;
import io.netty.handler.stream.ChunkedWriteHandler;

/**
 * @Author shu
 * @Version 1.0
 * @Date: 2022/03/07/ 9:53
 * @Description Http文件请求
 **/

public class HttpFileServer {

    private static final String DEFAULT_URL = "/";

    public void run(final int port, final String url) throws Exception {
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch)
                                throws Exception {
                            ch.pipeline().addLast("log",
                                    new LoggingHandler(LogLevel.DEBUG));//日志处理
                            ch.pipeline().addLast("http-decoder",
                                    new HttpRequestDecoder()); // 请求消息解码器
                            ch.pipeline().addLast("http-aggregator",
                                    new HttpObjectAggregator(65536));// 目的是将多个消息转换为单一的request或者response对象
                            ch.pipeline().addLast("http-encoder",
                                    new HttpResponseEncoder());//响应解码器
                            ch.pipeline().addLast("http-chunked",
                                    new ChunkedWriteHandler());//目的是支持异步大文件传输（）
                            ch.pipeline().addLast("fileServerHandler",
                                    new HttpFileServerHandler(url));// 业务逻辑
                        }
                    });
            ChannelFuture future = b.bind("127.0.0.1", port).sync();
            System.out.println("HTTP文件目录服务器启动，网址是 : " + "http://127.0.0.1:"
                    + port + url);
            future.channel().closeFuture().sync();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }

    public static void main(String[] args) throws Exception {
        int port = 8080;
        if (args.length > 0) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (NumberFormatException e) {
                e.printStackTrace();
            }
        }
        String url = DEFAULT_URL;
        if (args.length > 1)
            url = args[1];
        new HttpFileServer().run(port, url);
    }
}


```
```java
package com.shu.HttpProtocol;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.*;
import io.netty.handler.codec.http.*;
import io.netty.handler.stream.ChunkedFile;
import io.netty.util.CharsetUtil;
import javax.activation.MimetypesFileTypeMap;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.RandomAccessFile;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.regex.Pattern;
import static io.netty.handler.codec.http.HttpMethod.GET;
import static io.netty.handler.codec.http.HttpResponseStatus.*;
import static io.netty.handler.codec.http.HttpVersion.HTTP_1_1;

/**
 * @Author shu
 * @Version 1.0
 * @Date: 2022/03/07/ 9:55
 * @Description 文件请求自定义处理器
 **/

public class HttpFileServerHandler extends
        SimpleChannelInboundHandler<FullHttpRequest> {
    private final String url;

    public HttpFileServerHandler(String url) {
        this.url = url;
    }


    @Override
    protected void channelRead0(ChannelHandlerContext ctx, FullHttpRequest request) throws Exception {
        /*如果无法解码400*/
        if (!request.decoderResult().isSuccess()) {
            sendError(ctx, BAD_REQUEST);
            return;
        }

        /*只支持GET方法*/
        if (request.method() != GET) {
            sendError(ctx, METHOD_NOT_ALLOWED);
            return;
        }

        final String uri = request.uri();
        /*格式化URL，并且获取路径*/
        final String path = sanitizeUri(uri);
        if (path == null) {
            sendError(ctx, FORBIDDEN);
            return;
        }
        File file = new File(path);
        /*如果文件不可访问或者文件不存在*/
        if (file.isHidden() || !file.exists()) {
            sendError(ctx, NOT_FOUND);
            return;
        }
        /*如果是目录*/
        if (file.isDirectory()) {
            //1. 以/结尾就列出所有文件
            if (uri.endsWith("/")) {
                sendListing(ctx, file);
            } else {
                //2. 否则自动+/
                sendRedirect(ctx, uri + '/');
            }
            return;
        }
        if (!file.isFile()) {
            sendError(ctx, FORBIDDEN);
            return;
        }
        RandomAccessFile randomAccessFile = null;
        try {
            randomAccessFile = new RandomAccessFile(file, "r");// 以只读的方式打开文件
        } catch (FileNotFoundException fnfe) {
            sendError(ctx, NOT_FOUND);
            return;
        }
        long fileLength = randomAccessFile.length();
        //创建一个默认的HTTP响应
        HttpResponse response = new DefaultHttpResponse(HTTP_1_1, OK);
        //设置Content Length
        HttpUtil.setContentLength(response, fileLength);
        //设置Content Type
        setContentTypeHeader(response, file);
        //如果request中有KEEP ALIVE信息
        if (HttpUtil.isKeepAlive(request)) {
            response.headers().set(HttpHeaderNames.CONNECTION, HttpHeaderValues.KEEP_ALIVE);
        }
        ctx.write(response);
        ChannelFuture sendFileFuture;
        //通过Netty的ChunkedFile对象直接将文件写入发送到缓冲区中
        sendFileFuture = ctx.write(new ChunkedFile(randomAccessFile, 0,
                fileLength, 8192), ctx.newProgressivePromise());
        sendFileFuture.addListener(new ChannelProgressiveFutureListener() {
            @Override
            public void operationProgressed(ChannelProgressiveFuture future,
                                            long progress, long total) {
                if (total < 0) { // total unknown
                    System.err.println("Transfer progress: " + progress);
                } else {
                    System.err.println("Transfer progress: " + progress + " / "
                            + total);
                }
            }

            @Override
            public void operationComplete(ChannelProgressiveFuture future)
                    throws Exception {
                System.out.println("Transfer complete.");
            }
        });
        ChannelFuture lastContentFuture = ctx
                .writeAndFlush(LastHttpContent.EMPTY_LAST_CONTENT);
        //如果不支持keep-Alive，服务器端主动关闭请求
        if (!HttpUtil.isKeepAlive(request)) {
            lastContentFuture.addListener(ChannelFutureListener.CLOSE);
        }
    }


    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause)
            throws Exception {
        cause.printStackTrace();
        if (ctx.channel().isActive()) {
            sendError(ctx, INTERNAL_SERVER_ERROR);
        }
    }

    private static final Pattern INSECURE_URI = Pattern.compile(".*[<>&\"].*");


    private String sanitizeUri(String uri) {
        try {
            uri = URLDecoder.decode(uri, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            try {
                uri = URLDecoder.decode(uri, "ISO-8859-1");
            } catch (UnsupportedEncodingException e1) {
                throw new Error();
            }
        }
        if (!uri.startsWith(url)) {
            return null;
        }
        if (!uri.startsWith("/")) {
            return null;
        }
        uri = uri.replace('/', File.separatorChar);
        if (uri.contains(File.separator + '.')
                || uri.contains('.' + File.separator) || uri.startsWith(".")
                || uri.endsWith(".") || INSECURE_URI.matcher(uri).matches()) {
            return null;
        }
        return System.getProperty("user.dir") + File.separator + uri;
    }

    private static final Pattern ALLOWED_FILE_NAME = Pattern
            .compile("[A-Za-z0-9][-_A-Za-z0-9\\.]*");

    private static void sendListing(ChannelHandlerContext ctx, File dir) {
        FullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1, OK);
        response.headers().set(HttpHeaderNames.CONTENT_TYPE, "text/html; charset=UTF-8");
        StringBuilder buf = new StringBuilder();
        String dirPath = dir.getPath();
        buf.append("<!DOCTYPE html>\r\n");
        buf.append("<html><head><title>");
        buf.append(dirPath);
        buf.append(" 目录：");
        buf.append("</title></head><body>\r\n");
        buf.append("<h3>");
        buf.append(dirPath).append(" 目录：");
        buf.append("</h3>\r\n");
        buf.append("<ul>");
        buf.append("<li>链接：<a href=\"../\">..</a></li>\r\n");
        for (File f : dir.listFiles()) {
            if (f.isHidden() || !f.canRead()) {
                continue;
            }
            String name = f.getName();
            if (!ALLOWED_FILE_NAME.matcher(name).matches()) {
                continue;
            }
            buf.append("<li>链接：<a href=\"");
            buf.append(name);
            buf.append("\">");
            buf.append(name);
            buf.append("</a></li>\r\n");
        }
        buf.append("</ul></body></html>\r\n");
        ByteBuf buffer = Unpooled.copiedBuffer(buf, CharsetUtil.UTF_8);
        response.content().writeBytes(buffer);
        buffer.release();
        ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
    }

    private static void sendRedirect(ChannelHandlerContext ctx, String newUri) {
        FullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1, FOUND);
        response.headers().set(HttpHeaderNames.LOCATION, newUri);
        ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
    }

    private static void sendError(ChannelHandlerContext ctx,
                                  HttpResponseStatus status) {
        FullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1,
                status, Unpooled.copiedBuffer("Failure: " + status.toString()
                + "\r\n", CharsetUtil.UTF_8));
        response.headers().set(HttpHeaderNames.CONTENT_TYPE, "text/plain; charset=UTF-8");
        ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
    }

    private static void setContentTypeHeader(HttpResponse response, File file) {
        MimetypesFileTypeMap mimeTypesMap = new MimetypesFileTypeMap();
        response.headers().set(HttpHeaderNames.CONTENT_TYPE,
                mimeTypesMap.getContentType(file.getPath()));
    }
}

```
🌈🌈测试
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683340070185-0a4264fb-b0f3-488d-a5f9-a641c424242b.png#averageHue=%23fefefe&clientId=u203f90df-c403-4&from=paste&id=u81b6ef6d&originHeight=898&originWidth=1872&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=57552&status=done&style=none&taskId=uef5a49d0-a149-4016-b693-42a04835d79&title=)
🌈🌈总结

- HttpServerCodec：作为服务器，使用 HttpServerCodec 作为编码器与解码器
- HttpObjectAggregator：它的作用是将多个消息转换为单一的FullHttpRequest或者FullHttpResponse，原因是HTTP解码器在每个HTTP消息中会生成多个消息对象。
- ChunkedWriteHandler：它的主要作用是支持异步发送大的码流（例如大的文件传输)，但不占用过多的内存，防止发生Java内存溢出错误。
# 二 WebSocket协议
## 2.1 啥是WebSocket协议

- WebSocket是HTML5开始提供的一种浏览器与服务器间进行全双工通信的网络技术，WebSocket通信协议于2011年被IETF定为标准RFC6455，WebSocket API被W3C定为标准。
- 在WebSocket API中，浏览器和服务器只需要做一个握手的动作，然后，浏览器和服务器之间就形成了一条快速通道，两者就可以直接互相传送数据了。
- WebSocket基于TCP双向全双工进行消息传递，在同一时刻，既可以发送消息，也可以接收消息，相比于HTTP的半双工协议，性能得到很大提升。
## 2.2 特点

- 单一的TCP连接，采用全双工模式通信
-  对代理、防火墙和路由器透明
-  无头部信息、Cookie和身份验证
- 无安全开销
- 通过“ping/pong”帧保持链路激活
-  服务器可以主动传递消息给客户端，不再需要客户端轮询
## 2.3 WebSocket+Netty
🌈🌈服务端
```java
package com.shu.WebSocket;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.logging.LogLevel;
import io.netty.handler.logging.LoggingHandler;
import io.netty.handler.stream.ChunkedWriteHandler;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/27 14:21
 * @version: 1.0
 */
public class WebSocketServer {
    public void run(int port) throws Exception {
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch)
                                throws Exception {
                            ChannelPipeline pipeline = ch.pipeline();
                            pipeline.addLast(new LoggingHandler(LogLevel.DEBUG));
                            pipeline.addLast("http-codec", new HttpServerCodec());
                            pipeline.addLast("aggregator", new HttpObjectAggregator(65536));
                            ch.pipeline().addLast("http-chunked", new ChunkedWriteHandler());
                            pipeline.addLast("handler", new WebSocketServerHandler());
                        }
                    });
            Channel ch = b.bind(port).sync().channel();
            System.out.println("Web socket server started at port " + port
                    + '.');
            System.out
                    .println("Open your browser and navigate to http://localhost:"
                            + port + '/');
            ch.closeFuture().sync();
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }

    public static void main(String[] args) throws Exception {
        int port = 8080;
        if (args.length > 0) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (NumberFormatException e) {
                e.printStackTrace();
            }
        }
        new WebSocketServer().run(port);
    }
}
```
```java
package com.shu.WebSocket;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.FullHttpResponse;
import io.netty.handler.codec.http.websocketx.*;
import io.netty.util.CharsetUtil;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static io.netty.handler.codec.http.HttpHeaders.isKeepAlive;
import static io.netty.handler.codec.http.HttpHeaders.setContentLength;
import static io.netty.handler.codec.http.HttpVersion.HTTP_1_1;
import static io.netty.handler.codec.rtsp.RtspResponseStatuses.BAD_REQUEST;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/27 14:24
 * @version: 1.0
 */
public class WebSocketServerHandler  extends SimpleChannelInboundHandler<Object> {
    private static final Logger logger = LogManager.getLogger(WebSocketServerHandler.class);

    private WebSocketServerHandshaker handshaker;

    @Override
    public void messageReceived(ChannelHandlerContext ctx, Object msg)
            throws Exception {
        // 传统的HTTP接入
        if (msg instanceof FullHttpRequest) {
            handleHttpRequest(ctx, (FullHttpRequest) msg);
        }
        // WebSocket接入
        else if (msg instanceof WebSocketFrame) {
            handleWebSocketFrame(ctx, (WebSocketFrame) msg);
        }
    }

    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
        ctx.flush();
    }

    private void handleHttpRequest(ChannelHandlerContext ctx,
                                   FullHttpRequest req) throws Exception {

        // 如果HTTP解码失败，返回HHTP异常
        if (!req.getDecoderResult().isSuccess()
                || (!"websocket".equals(req.headers().get("Upgrade")))) {
            sendHttpResponse(ctx, req, new DefaultFullHttpResponse(HTTP_1_1,
                    BAD_REQUEST));
            return;
        }

        // 构造握手响应返回，本机测试
        WebSocketServerHandshakerFactory wsFactory = new WebSocketServerHandshakerFactory(
                "ws://localhost:8080/websocket", null, false);
        handshaker = wsFactory.newHandshaker(req);
        if (handshaker == null) {
            WebSocketServerHandshakerFactory.sendUnsupportedWebSocketVersionResponse(ctx.channel());
        } else {
            handshaker.handshake(ctx.channel(), req);
        }
    }

    private void handleWebSocketFrame(ChannelHandlerContext ctx,
                                      WebSocketFrame frame) {

        logger.info("handleWebSocketFrame:{}",frame.getClass().getName());
        // 判断是否是关闭链路的指令
        if (frame instanceof CloseWebSocketFrame) {
            handshaker.close(ctx.channel(),
                    (CloseWebSocketFrame) frame.retain());
            return;
        }
        // 判断是否是Ping消息
        if (frame instanceof PingWebSocketFrame) {
            ctx.channel().write(
                    new PongWebSocketFrame(frame.content().retain()));
            return;
        }
        // 本例程仅支持文本消息，不支持二进制消息
        if (!(frame instanceof TextWebSocketFrame)) {
            throw new UnsupportedOperationException(String.format(
                    "%s frame types not supported", frame.getClass().getName()));
        }

        // 返回应答消息
        String request = ((TextWebSocketFrame) frame).text();
        logger.info(String.format("%s received %s", ctx.channel(), request));
        ctx.channel().write(
                new TextWebSocketFrame(request
                        + " , 欢迎使用Netty WebSocket服务，现在时刻："
                        + new java.util.Date().toString()));
    }

    
    private static void sendHttpResponse(ChannelHandlerContext ctx,
                                         FullHttpRequest req, FullHttpResponse res) {
        // 返回应答给客户端
        if (res.getStatus().code() != 200) {
            ByteBuf buf = Unpooled.copiedBuffer(res.getStatus().toString(),
                    CharsetUtil.UTF_8);
            res.content().writeBytes(buf);
            buf.release();
            setContentLength(res, res.content().readableBytes());
        }

        // 如果是非Keep-Alive，关闭连接
        ChannelFuture f = ctx.channel().writeAndFlush(res);
        if (!isKeepAlive(req) || res.getStatus().code() != 200) {
            f.addListener(ChannelFutureListener.CLOSE);
        }
    }

    
    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause)
            throws Exception {
        cause.printStackTrace();
        ctx.close();
    }
}


```
🌈🌈Html
```java
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    Netty WebSocket 时间服务器
</head>
<br>
<body>
<br>
<script type="text/javascript">
    var socket;
    if (!window.WebSocket)
    {
        window.WebSocket = window.MozWebSocket;
    }
    if (window.WebSocket) {
        socket = new WebSocket("ws://localhost:8080/websocket");
        socket.onmessage = function(event) {
            var ta = document.getElementById('responseText');
            ta.value="";
            ta.value = event.data
        };
        socket.onopen = function(event) {
            var ta = document.getElementById('responseText');
            ta.value = "打开WebSocket服务正常，浏览器支持WebSocket!";
        };
        socket.onclose = function(event) {
            var ta = document.getElementById('responseText');
            ta.value = "";
            ta.value = "WebSocket 关闭!";
        };
    }
    else
    {
        alert("抱歉，您的浏览器不支持WebSocket协议!");
    }

    function send(message) {
        if (!window.WebSocket) { return; }
        if (socket.readyState == WebSocket.OPEN) {
            socket.send(message);
        }
        else
        {
            alert("WebSocket连接没有建立成功!");
        }
    }
</script>
<form onsubmit="return false;">
    <input type="text" name="message" value="Netty最佳实践"/>
    <br><br>
    <input type="button" value="发送WebSocket请求消息" onclick="send(this.form.message.value)"/>
    <hr color="blue"/>
    <h3>服务端返回的应答消息</h3>
    <textarea id="responseText" style="width:500px;height:300px;"></textarea>
</form>
</body>
</html>

```
🌈🌈测试
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683340757105-809eb1c8-713f-429f-b5d1-23e413ea5085.png#averageHue=%23fdfdfd&clientId=u203f90df-c403-4&from=paste&height=618&id=uc470ba02&originHeight=773&originWidth=1855&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=30293&status=done&style=none&taskId=uffbf7ea2-3583-46da-be9d-c8beda2da83&title=&width=1484)
# 三 UDP协议
## 3.1 介绍

- UDP是用户数据报协议(User Datagram Protocol, UDP)的简称，其主要作用是将网络数据流量压缩成数据报形式，提供面向事务的简单信息传送服务。
- 与TCP协议不同，UDP协议直接利用IP协议进行UDP数据报的传输，UDP提供的是面向无连接的、不可靠的数据报投递服务，使用UDP协议传输信息时，用户应用程序必须负责解决数据报丢失、重复、排序，差错确认等问题。
- UDP是无连接的，通信双方不需要建立物理链路连接。在网络中它用于处理数据包，在OSI模型中，它处于第四层传输层，即位于IP协议的上一层。它不对数据报分组、组装、校验和排序，因此是不可靠的。报文的发送者不知道报文是否被对方正确接收。
## 3.2 格式
UDP数据报格式有首部和数据两个部分，首部很简单，为8个字节，包括以下部分。

- 源端口：源端口号，2个字节，最大值为65535
- 目的端口：目的端口号，2个字节，最大值为65535
- 长度：2字节，UDP用户数据报的总长度
- 校验和：2字节，用于校验UDP数据报的数字段和包含UDP数据报首部的伪首部

伪首部，又称为伪包头(Pseudo Header)：是指在TCP的分段或UDP的数据报格式中，在数据报首部前面增加源IP地址、目的IP地址、IP分组的协议字段、TCP或UDP数据报的总长度等，共12字节，所构成的扩展首部结构。此伪首部是一个临时的结构，它既不向上也不向下传递，仅仅是为了保证可以校验套接字的正确性。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683341206288-778f6bde-472e-4b55-8bf3-e99a5c542f4d.png#averageHue=%23e2e1e1&clientId=u203f90df-c403-4&from=paste&height=648&id=u23fcd1bd&originHeight=810&originWidth=1564&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=161057&status=done&style=none&taskId=u7523c77b-b4e8-4fa8-ad6f-a81ed4aefbb&title=&width=1251.2)
## 3.3 特点

- UDP传送数据前并不与对方建立连接，即UDP是无连接的。在传输数据前，发送方和接收方相互交换信息使双方同步
- UDP对接收到的数据报不发送确认信号，发送端不知道数据是否被正确接收，也不会重发数据
- UDP传送数据比TCP快速，系统开销也少：UDP比较简单，UDP头包含了源端口、目的端口、消息长度和校验和等很少的字节。由于UDP比TCP简单、灵活，常用于可靠性要求不高的数据传输，如视频、图片以及简单文件传输系统(TFTP)等。
- TCP则适用于可靠性要求很高但实时性要求不高的应用，如文件传输协议FTP、超文本传输协议HTTP、简单邮件传输协议SMTP等
## 3.4 Netty+UDP协议
🌈🌈服务端
```java
package com.shu.UDP;

import io.netty.bootstrap.Bootstrap;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioDatagramChannel;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/27 14:44
 * @version: 1.0
 */
public class ChineseProverbServer {
    public void run(int port) throws Exception {
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            Bootstrap b = new Bootstrap();
            b.group(group).channel(NioDatagramChannel.class)
                    .option(ChannelOption.SO_BROADCAST, true)
                    .handler(new ChineseProverbServerHandler());
            b.bind(port).sync().channel().closeFuture().await();
        } finally {
            group.shutdownGracefully();
        }
    }

    public static void main(String[] args) throws Exception {
        int port = 8080;
        if (args.length > 0) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (NumberFormatException e) {
                e.printStackTrace();
            }
        }
        new ChineseProverbServer().run(port);
    }

}

```
```java
package com.shu.UDP;

import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.channel.socket.DatagramPacket;
import io.netty.util.CharsetUtil;

import java.util.concurrent.ThreadLocalRandom;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/27 14:45
 * @version: 1.0
 */
public class ChineseProverbServerHandler extends
        SimpleChannelInboundHandler<DatagramPacket> {

    // 谚语列表
    private static final String[] DICTIONARY = { "只要功夫深，铁棒磨成针。",
            "旧时王谢堂前燕，飞入寻常百姓家。", "洛阳亲友如相问，一片冰心在玉壶。", "一寸光阴一寸金，寸金难买寸光阴。",
            "老骥伏枥，志在千里。烈士暮年，壮心不已!" };

    private String nextQuote() {
        int quoteId = ThreadLocalRandom.current().nextInt(DICTIONARY.length);
        return DICTIONARY[quoteId];
    }

    @Override
    public void messageReceived(ChannelHandlerContext ctx, DatagramPacket packet)
            throws Exception {
        String req = packet.content().toString(CharsetUtil.UTF_8);
        System.out.println(req);
        if ("谚语字典查询?".equals(req)) {
            ctx.writeAndFlush(new DatagramPacket(Unpooled.copiedBuffer(
                    "谚语查询结果: " + nextQuote(), CharsetUtil.UTF_8), packet
                    .sender()));
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause)
            throws Exception {
        ctx.close();
        cause.printStackTrace();
    }
}

```
🌈🌈客户端
```java
package com.shu.UDP;

import io.netty.bootstrap.Bootstrap;
import io.netty.buffer.Unpooled;
import io.netty.channel.Channel;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.DatagramPacket;
import io.netty.channel.socket.nio.NioDatagramChannel;
import io.netty.util.CharsetUtil;

import java.net.InetSocketAddress;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/27 14:49
 * @version: 1.0
 */
public class ChineseProverbClient {
    public void run(int port) throws Exception {
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            Bootstrap b = new Bootstrap();
            b.group(group).channel(NioDatagramChannel.class)
                    .option(ChannelOption.SO_BROADCAST, true)
                    .handler(new ChineseProverbClientHandler());
            Channel ch = b.bind(0).sync().channel();
            // 向网段内的所有机器广播UDP消息
            ch.writeAndFlush(
                    new DatagramPacket(Unpooled.copiedBuffer("谚语字典查询?",
                            CharsetUtil.UTF_8), new InetSocketAddress(
                            "255.255.255.255", port))).sync();
            if (!ch.closeFuture().await(15000)) {
                System.out.println("查询超时!");
            }
        } finally {
            group.shutdownGracefully();
        }
    }

    public static void main(String[] args) throws Exception {
        int port = 8080;
        if (args.length > 0) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (NumberFormatException e) {
                e.printStackTrace();
            }
        }
        new ChineseProverbClient().run(port);
    }

}

```
```java
package com.shu.UDP;

import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.channel.socket.DatagramPacket;
import io.netty.util.CharsetUtil;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/27 14:49
 * @version: 1.0
 */
public class ChineseProverbClientHandler extends
        SimpleChannelInboundHandler<DatagramPacket> {

    @Override
    public void messageReceived(ChannelHandlerContext ctx, DatagramPacket msg)
            throws Exception {
        String response = msg.content().toString(CharsetUtil.UTF_8);
        if (response.startsWith("谚语查询结果: ")) {
            System.out.println(response);
            ctx.close();
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause)
            throws Exception {
        cause.printStackTrace();
        ctx.close();
    }
}

```
🌈🌈测试
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683341451149-041147a4-d9bc-4183-aba6-55a3e464a2aa.png#averageHue=%232c2b2b&clientId=u203f90df-c403-4&from=paste&height=400&id=ue0948222&originHeight=500&originWidth=1819&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=34104&status=done&style=none&taskId=u6598aeb1-6425-4e56-adf6-83678eb8d06&title=&width=1455.2)
# 四 私有协议
## 4.1 私有协议定义

- 私有协议本质上是厂商内部发展和采用的标准，除非授权，其他厂商一般无权使用该协议。私有协议也称非标准协议，就是未经国际或国家标准化组织采纳或批准，由某个企业自己制订，协议实现细节不愿公开，只在企业自己生产的设备之间使用的协议。私有协议具有封闭性、垄断性、排他性等特点。如果网上大量存在私有（非标准）协议，现行网络或用户一旦使用了它，后进入的厂家设备就必须跟着使用这种非标准协议，才能够互连互通，否则根本不可能进入现行网络。这样，使用非标准协议的厂家就实现了垄断市场的愿望。
- 尽管私有协议具有垄断性的特征，但并非所有的私有协议设计者的初衷就是为了垄断。由于现代软件系统的复杂性，一个大型软件系统往往会被人为地拆分成多个模块，另外随着移动互联网的兴起，网站的规模也越来越大，业务的功能越来越多，为了能够支撑业务的发展，往往需要集群和分布式部署，这样，各个模块之间就要进行跨节点通信。
- 跨节点的远程服务调用，除了链路层的物理连接外，还需要对请求和响应消息进行编解码。在请求和应答消息本身以外，也需要携带一些其他控制和管理类指令，例如链路建立的握手请求和响应消息、链路检测的心跳消息等。当这些功能组合到一起之后，就会形成私有协议。
- 事实上，私有协议并没有标准的定义，只要是能够用于跨进程、跨主机数据交换的非标准协议，都可以称为私有协议。通常情况下，正规的私有协议都有具体的协议规范文档，类似于《XXXX协议VXX规范》，但是在实际的项目中，内部使用的私有协议往往是口头约定的规范，由于并不需要对外呈现或者被外部调用，所以一般不会单独写相关的内部私有协议规范文档。
## 4.2 功能栈描述
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683341764224-8bdc86b5-69a1-429b-bfda-ae2c978408ad.png#averageHue=%23faf9f9&clientId=u203f90df-c403-4&from=paste&id=u6f74299d&originHeight=671&originWidth=1504&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=101451&status=done&style=none&taskId=u327288f2-1934-44ac-ac1f-c39fefd7bd0&title=)
Netty协议栈承载了业务内部各模块之间的消息交互和服务调用，它的主要功能如下。
(1）基于Netty 的NIO通信框架，提供高性能的异步通信能力。
(2）提供消息的编解码框架，可以实现POJO的序列化和反序列化。
(3）提供基于IP地址的白名单接入认证机制。
(4）链路的有效性校验机制。
(5）链路的断连重连机制。
注意：需要指出的是，Netty协议通信双方链路建立成功之后，双方可以进行全双工通信，无论客户端还是服务端，都可以主动发送请求消息给对方，通信方式可以是 TWOWAY或者ONE WAY。双方之间的心跳采用Ping-Pong机制，当链路处于空闲状态时，客户端主动发送Ping消息给服务端,服务端接收到Ping消息后发送应答消息 Pong给客户端，如果客户端连续发送N条Ping消息都没有接收到服务端返回的Pong消息，说明链路已经挂死或者对方处于异常状态，客户端主动关闭连接，间隔周期T后发起重连操作，直到重连成功。
## 4.3 基本搭建
🌈🌈消息实体类
```java
package com.shu.Pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @Project_Name PrivateProctol-Netty
 * @Author shu
 * @Version 1.0
 * @Date: 2022/03/10/ 14:53
 * @Description 消息格式
 **/
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NettyMessage {
    private Head header; // 头部
    private Object body; // 消息正文
}
```
```java
package com.shu.Pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

/**
 * @Project_Name PrivateProctol-Netty
 * @Author shu
 * @Version 1.0
 * @Date: 2022/03/10/ 14:53
 * @Description 头部
 **/
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Head {
    // 1010 1011 1101 1110 0000 0001 0000 0001
    private int crcCode = 0xabef0101; // 固定值，表名这是Netty消息 4字节
    private int length;// 消息长度
    private long sessionID;// 会话ID
    /**
     * 0:业务请求消息;
     * 1:业务响应消息;
     * 2:业务ONE WAY 消息（既是请求又是响应消息);
     * 3:握手请求消息;
     * 4:握手应答消息;
     * 5:心跳请求消息;
     * 6:心跳应答消息。
     */
    private byte type;// 消息类型
    private byte priority;// 消息优先级
    private Map<String, Object> attachment = new HashMap<String, Object>(); // 扩展消息头
}
```
🌈🌈序列化器
```java
package com.shu.Factory;
import org.jboss.marshalling.*;
import java.io.IOException;

/**
 * @Project_Name PrivateProctol-Netty
 * @Author shu
 * @Version 1.0
 * @Date: 2022/03/10/ 15:03
 * @Description Marshalling工厂
 **/
public class MarshallingCodecFactory {

    /**
     * 创建Jboss Marshaller
     *
     * @return
     * @throws IOException
     */
    protected static Marshaller buildMarshalling() throws IOException {
        final MarshallerFactory marshallerFactory = Marshalling.getProvidedMarshallerFactory("serial");
        final MarshallingConfiguration configuration = new MarshallingConfiguration();
        configuration.setVersion(5);
        Marshaller marshaller = marshallerFactory
                .createMarshaller(configuration);
        return marshaller;
    }

    /**
     * 创建Jboss Unmarshaller
     *
     * @return
     * @throws IOException
     */
    protected static Unmarshaller buildUnMarshalling() throws IOException {
        final MarshallerFactory marshallerFactory = Marshalling
                .getProvidedMarshallerFactory("serial");
        final MarshallingConfiguration configuration = new MarshallingConfiguration();
        configuration.setVersion(5);
        final Unmarshaller unmarshaller = marshallerFactory
                .createUnmarshaller(configuration);
        return unmarshaller;
    }

}

```
```java
package com.shu.Factory;

import com.shu.MyByteOutput.ChannelBufferByteInput;
import io.netty.buffer.ByteBuf;
import org.jboss.marshalling.ByteInput;
import org.jboss.marshalling.Unmarshaller;

import java.io.IOException;

/**
 * @Project_Name PrivateProctol-Netty
 * @Author shu
 * @Version 1.0
 * @Date: 2022/03/10/ 15:56
 * @Description 解码器
 **/
public class MarshallingDecoder {

    private final Unmarshaller unmarshaller;

    /**
     * Creates a new decoder whose maximum object size is {@code 1048576} bytes.
     * If the size of the received object is greater than {@code 1048576} bytes,
     * a {@link IOException} will be raised.
     *
     * @throws IOException
     */
    public MarshallingDecoder() throws IOException {
        unmarshaller = MarshallingCodecFactory.buildUnMarshalling();
    }

    protected Object decode(ByteBuf in) throws Exception {
        //1. 读取第一个4bytes，里面放置的是object对象的byte长度
        int objectSize = in.readInt();
        ByteBuf buf = in.slice(in.readerIndex(), objectSize);
        //2 . 使用bytebuf的代理类
        ByteInput input = new ChannelBufferByteInput(buf);
        try {
            //3. 开始解码
            unmarshaller.start(input);
            Object obj = unmarshaller.readObject();
            unmarshaller.finish();
            //4. 读完之后设置读取的位置
            in.readerIndex(in.readerIndex() + objectSize);
            return obj;
        } finally {
            unmarshaller.close();
        }
    }
}

```
```java
package com.shu.Factory;
import org.jboss.marshalling.*;
import java.io.IOException;

/**
 * @Project_Name PrivateProctol-Netty
 * @Author shu
 * @Version 1.0
 * @Date: 2022/03/10/ 15:03
 * @Description Marshalling工厂
 **/
public class MarshallingCodecFactory {

    /**
     * 创建Jboss Marshaller
     *
     * @return
     * @throws IOException
     */
    protected static Marshaller buildMarshalling() throws IOException {
        final MarshallerFactory marshallerFactory = Marshalling.getProvidedMarshallerFactory("serial");
        final MarshallingConfiguration configuration = new MarshallingConfiguration();
        configuration.setVersion(5);
        Marshaller marshaller = marshallerFactory
                .createMarshaller(configuration);
        return marshaller;
    }

    /**
     * 创建Jboss Unmarshaller
     *
     * @return
     * @throws IOException
     */
    protected static Unmarshaller buildUnMarshalling() throws IOException {
        final MarshallerFactory marshallerFactory = Marshalling
                .getProvidedMarshallerFactory("serial");
        final MarshallingConfiguration configuration = new MarshallingConfiguration();
        configuration.setVersion(5);
        final Unmarshaller unmarshaller = marshallerFactory
                .createUnmarshaller(configuration);
        return unmarshaller;
    }

}

```
## 4.4 编解码
🌈🌈编码
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683342014250-ace26a1c-759f-4d6b-a916-708e886fe13d.png#averageHue=%23f4f4f4&clientId=u203f90df-c403-4&from=paste&id=u5e4d9db2&originHeight=732&originWidth=832&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=222074&status=done&style=none&taskId=u26683e2d-bd2e-4047-939c-d0038b04329&title=)
```java
package com.shu.MyByteOutput;

import com.shu.Factory.MarshallingEncoder;
import com.shu.Pojo.NettyMessage;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.MessageToByteEncoder;

import java.io.IOException;
import java.util.Map;

/**
 * @Project_Name PrivateProctol-Netty
 * @Author shu
 * @Version 1.0
 * @Date: 2022/03/14/ 19:46
 * @Description netty消息编码器
 **/
public class NettyMessageEncoder extends MessageToByteEncoder<NettyMessage> {

    MarshallingEncoder marshallingEncoder;

    public NettyMessageEncoder() throws IOException {
        this.marshallingEncoder = new MarshallingEncoder();
    }

    @Override
    protected void encode(ChannelHandlerContext ctx, NettyMessage msg, ByteBuf sendBuf) throws Exception {
        if (null == msg || null == msg.getHeader()) {
            throw new Exception("The encode message is null");
        }
        //---写入crcCode---
        sendBuf.writeInt((msg.getHeader().getCrcCode()));
        //---写入length---
        sendBuf.writeInt((msg.getHeader().getLength()));
        //---写入sessionId---
        sendBuf.writeLong((msg.getHeader().getSessionID()));
        //---写入type---
        sendBuf.writeByte((msg.getHeader().getType()));
        //---写入priority---
        sendBuf.writeByte((msg.getHeader().getPriority()));
        //---写入附件大小---
        sendBuf.writeInt((msg.getHeader().getAttachment().size()));

        String key = null;
        byte[] keyArray = null;
        Object value = null;
        for (Map.Entry<String, Object> param : msg.getHeader().getAttachment()
                .entrySet()) {
            key = param.getKey();
            keyArray = key.getBytes("UTF-8");
            sendBuf.writeInt(keyArray.length);
            sendBuf.writeBytes(keyArray);
            value = param.getValue();
            // marshallingEncoder.encode(value, sendBuf);
        }
        // for gc
        key = null;
        keyArray = null;
        value = null;

        if (msg.getBody() != null) {
            marshallingEncoder.encode(msg.getBody(), sendBuf);
        } else
            sendBuf.writeInt(0);
        // 之前写了crcCode 4bytes，除去crcCode和length 8bytes即为更新之后的字节
        sendBuf.setInt(4, sendBuf.readableBytes() - 8);
    }
}


```
🌈🌈解码
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683342056216-0362d713-74e3-4704-88eb-9d22418276bf.png#averageHue=%23f2f2f2&clientId=u203f90df-c403-4&from=paste&id=u44688155&originHeight=631&originWidth=893&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=197058&status=done&style=none&taskId=u5bb91b9c-ac55-4b0b-9307-6357019a082&title=)
```java
package com.shu.MyByteOutput;

import com.shu.Factory.MarshallingDecoder;
import com.shu.Pojo.Head;
import com.shu.Pojo.NettyMessage;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.LengthFieldBasedFrameDecoder;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * @Project_Name PrivateProctol-Netty
 * @Author shu
 * @Version 1.0
 * @Date: 2022/03/14/ 19:49
 * @Description netty消息解码器
 **/
public class NettyMessageDecoder extends LengthFieldBasedFrameDecoder {

    MarshallingDecoder marshallingDecoder;

    public NettyMessageDecoder(int maxFrameLength, int lengthFieldOffset,
                               int lengthFieldLength) throws IOException {
        super(maxFrameLength, lengthFieldOffset, lengthFieldLength);
        marshallingDecoder = new MarshallingDecoder();
    }

    @Override
    protected Object decode(ChannelHandlerContext ctx, ByteBuf in)
            throws Exception {
        ByteBuf frame = (ByteBuf) super.decode(ctx, in);
        if (frame == null) {
            return null;
        }

        NettyMessage message = new NettyMessage();
        Head header = new Head();
        header.setCrcCode(frame.readInt());
        header.setLength(frame.readInt());
        header.setSessionID(frame.readLong());
        header.setType(frame.readByte());
        header.setPriority(frame.readByte());

        int size = frame.readInt();
        if (size > 0) {
            Map<String, Object> attch = new HashMap<String, Object>(size);
            int keySize = 0;
            byte[] keyArray = null;
            String key = null;
            for (int i = 0; i < size; i++) {
                keySize = frame.readInt();
                keyArray = new byte[keySize];
                frame.readBytes(keyArray);
                key = new String(keyArray, "UTF-8");
                attch.put(key, marshallingDecoder.decode(frame));
            }
            keyArray = null;
            key = null;
            header.setAttachment(attch);
        }
        if (frame.readableBytes() > 4) {
            message.setBody(marshallingDecoder.decode(frame));
        }
        message.setHeader(header);
        return message;
    }
}


```
## 4.5 握手与安全认证

- 握手的发起是在客户端和服务端TCP链路建立成功通道激活时，握手消息的接入和安全认证在服务端处理。
- 为了保证整个集群环境的安全，内部长连接采用基于IP地址的安全认证机制，服务端对握手请求消息的IP地址进行合法性校验:如果在白名单之内，则校验通过;否则，拒绝对方连接。
- 如果将Netty协议栈放到公网中使用，需要采用更加严格的安全认证机制，例如基于密钥和AES 加密的用户名+密码认证机制，也可以采用SSL/TSL安全传输。

🌈🌈消息枚举类
```java
package com.shu.Pojo;

/**
 * @Author shu
 * @Version 1.0
 * @Date: 2022/03/19/ 19:57
 * @Description 消息枚举类
 **/
public enum MessageType {
    BUZ_REQUEST(0,"业务请求"),
    BUZ_RESPONSE(1,"业务相应"),
    BUZ_ONEWAY(2,"即是请求也是响应"),
    HANDSHAKE_REQUEST(3,"握手请求"),
    HANDSHAKE_RESPONSE(4,"握手响应"),
    HEARTBEAT_REQUEST(5,"心跳请求"),
    HEARTBEAT_RESPONSE(6,"心跳响应"),
    ;
    private Integer type;
    private String name;
    MessageType(Integer type,String name){
        this.name = name;
        this.type = type;
    }

    public Integer getType() {
        return type;
    }
    public String getName(){
        return name;
    }
}
```
🌈🌈**握手请求处理器**
```java
package com.shu.Handler;

import com.shu.Pojo.Head;
import com.shu.Pojo.MessageType;
import com.shu.Pojo.NettyMessage;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * @Author shu
 * @Version 1.0
 * @Date: 2022/03/19/ 20:10
 * @Description 握手请求
 **/


public class LoginAuthReqHandler extends ChannelInboundHandlerAdapter {

    private static final Log LOG = LogFactory.getLog(LoginAuthReqHandler.class);

    /**
     * 连接建立时，发起认证
     * @param ctx
     * @throws Exception
     */
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        ctx.writeAndFlush(buildLoginReq());
    }


    /**
     * 收到服务端消息
     * @param ctx
     * @param msg
     * @throws Exception
     */
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg)
            throws Exception {
        NettyMessage message = (NettyMessage) msg;

        // 如果是握手应答消息，需要判断是否认证成功
        if (message.getHeader() != null
                && message.getHeader().getType() == MessageType.HANDSHAKE_REQUEST.getType()) {
            byte loginResult = (byte) message.getBody();
            if (loginResult != (byte) 0) {
                // 握手失败，关闭连接
                ctx.close();
            } else {
                LOG.info("Login is ok : " + message);
                ctx.fireChannelRead(msg);
            }
        } else
            //调用下一个channel链..
            ctx.fireChannelRead(msg);
    }

    /**
     * 构建登录请求
     */
    private NettyMessage buildLoginReq() {
        NettyMessage message = new NettyMessage();
        Head header = new Head();
        header.setType(MessageType.HANDSHAKE_REQUEST.getType().byteValue());
        message.setHeader(header);
        return message;
    }

    /**
     * 异常处理
     * @param ctx
     * @param cause
     * @throws Exception
     */
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause)
            throws Exception {
        ctx.fireExceptionCaught(cause);
    }
}

```
🌈🌈**握手响应处理器**
```java
package com.shu.Handler;

import com.shu.Pojo.Head;
import com.shu.Pojo.MessageType;
import com.shu.Pojo.NettyMessage;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.net.InetSocketAddress;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @Author shu
 * @Version 1.0
 * @Date: 2022/03/19/ 19:52
 * @Description 请求握手认证响应
 **/
public class LoginAuthRespHandler extends ChannelInboundHandlerAdapter {

    private final static Log LOG = LogFactory.getLog(LoginAuthRespHandler.class);

    /**
     * ip本地缓存
     */
    private final Map<String, Boolean> nodeCheck = new ConcurrentHashMap<String, Boolean>();

    /**
     * 白名单
     */
    private final String[] whitekList = {"127.0.0.1", "192.168.1.104"};


    /**
     * 读取到客服端消息
     * @param ctx
     * @param msg
     * @throws Exception
     */
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg)
            throws Exception {
        NettyMessage message = (NettyMessage) msg;
        // 如果是握手请求消息，处理，其它消息透传
        if (message.getHeader() != null && message.getHeader().getType() == MessageType.HANDSHAKE_REQUEST.getType()) {
            // 获取远程IP地址
            String nodeIndex = ctx.channel().remoteAddress().toString();
            // 响应消息
            NettyMessage loginResp = null;
            // 重复登陆，拒绝
            if (nodeCheck.containsKey(nodeIndex)) {
                loginResp = buildResponse((byte) -1);
            } else {
                InetSocketAddress address = (InetSocketAddress) ctx.channel().remoteAddress();
                String ip = address.getAddress().getHostAddress();
                // 判断是否是白名单
                boolean isOK = false;
                for (String WIP : whitekList) {
                    if (WIP.equals(ip)) {
                        isOK = true;
                        break;
                    }
                }
                // 登录响应消息
                loginResp = isOK ? buildResponse((byte) 0)
                        : buildResponse((byte) -1);
                if (isOK)
                    nodeCheck.put(nodeIndex, true);
            }
            LOG.info("The login response is : " + loginResp
                    + " body [" + loginResp.getBody() + "]");
            ctx.writeAndFlush(loginResp);
        } else {
            ctx.fireChannelRead(msg);
        }
    }

    /**
     * 构建响应报文
     * @param result
     * @return
     */
    private NettyMessage buildResponse(byte result) {
        NettyMessage message = new NettyMessage();
        Head header = new Head();
        header.setType(MessageType.HANDSHAKE_RESPONSE.getType().byteValue());
        message.setHeader(header);
        message.setBody(result);
        return message;
    }


    /**
     * 异常处理
     * @param ctx
     * @param cause
     * @throws Exception
     */
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause)
            throws Exception {
        cause.printStackTrace();
        nodeCheck.remove(ctx.channel().remoteAddress().toString());// 删除缓存
        ctx.close();
        ctx.fireExceptionCaught(cause);
    }
}

```
## 4.6 心跳检测
在凌晨等业务低谷期时段，如果发生网络闪断、连接被Hang 住等网络问题时，由于没有业务消息，应用进程很难发现。到了白天业务高峰期时，会发生大量的网络通信失败，严重的会导致一段时间进程内无法处理业务消息。为了解决这个问题，在网络空闲时采用心跳机制来检测链路的互通性，一旦发现网络故障，立即关闭链路，主动重连。
(1）当网络处于空闲状态持续时间达到T(连续周期T没有读写消息）时，客户端主动发送 Ping 心跳消息给服务端;
(2）如果在下一个周期T到来时客户端没有收到对方发送的Pong心跳应答消息或者读取到服务端发送的其他业务消息，则心跳失败计数器加1;
(3)每当客户端接收到服务的业务消息或者Pong应答消息，将心跳失败计数器清零;当连续N次没有接收到服务端的 Pong消息或者业务消息，则关闭链路，间隔INTERVAL时间后发起重连操作;
(4）服务端网络空闲状态持续时间达到T后，服务端将心跳失败计数器加1;只要接收到客户端发送的Ping 消息或者其他业务消息，计数器清零;
(5）服务端连续N次没有接收到客户端的Ping消息或者其他业务消息，则关闭链路，释放资源，等待客户端重连。
通过Ping-Pong双向心跳机制，可以保证无论通信哪一方出现网络故障，都能被及时地检测出来。为了防止由于对方短时间内繁忙没有及时返回应答造成的误判，只有连续N次心跳检测都失败才认定链路已经损害，需要关闭链路并重建链路。
当读或者写心跳消息发生IO 异常的时候，说明链路已经中断，此时需要立即关闭链路，如果是客户端，需要重新发起连接。如果是服务端，需要清空缓存的半包信息，等待客户端重连。
🌈🌈心跳请求处理器
```java
package com.shu.Handler;

import com.shu.Pojo.Head;
import com.shu.Pojo.MessageType;
import com.shu.Pojo.NettyMessage;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.util.concurrent.ScheduledFuture;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.util.concurrent.TimeUnit;

/**
 * @Author shu
 * @Version 1.0
 * @Date: 2022/03/19/ 20:30
 * @Description 心跳请求
 **/
public class HeartBeatReqHandler extends ChannelInboundHandlerAdapter {

    private static final Log LOG = LogFactory.getLog(HeartBeatReqHandler.class);

    //使用定时任务发送
    private volatile ScheduledFuture<?> heartBeat;

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg)
            throws Exception {
        NettyMessage message = (NettyMessage) msg;
        // 当握手成功后，Login响应向下透传，主动发送心跳消息
        if (message.getHeader() != null && message.getHeader().getType() == MessageType.HANDSHAKE_RESPONSE.getType()) {
            //NioEventLoop是一个Schedule,因此支持定时器的执行，创建心跳计时器
            heartBeat = ctx.executor().scheduleAtFixedRate(new HeartBeatTask(ctx), 0, 5000, TimeUnit.MILLISECONDS);
        } else if (message.getHeader() != null && message.getHeader().getType() == MessageType.HEARTBEAT_RESPONSE.getType()) {
            LOG.info("Client receive server heart beat message : ---> " + message);
        } else
            ctx.fireChannelRead(msg);
    }


    //Ping消息任务类
    private static class HeartBeatTask implements Runnable {
        private final ChannelHandlerContext ctx;

        public HeartBeatTask(final ChannelHandlerContext ctx) {
            this.ctx = ctx;
        }

        @Override
        public void run() {
            NettyMessage heatBeat = buildHeatBeat();
            LOG.info("Client send heart beat messsage to server : ---> " + heatBeat);
            ctx.writeAndFlush(heatBeat);
        }

        /**
         * 发送心跳请求
         * @return
         */
        private NettyMessage buildHeatBeat() {
            NettyMessage message = new NettyMessage();
            Head header = new Head();
            header.setType(MessageType.HEARTBEAT_REQUEST.getType().byteValue());
            message.setHeader(header);
            return message;
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause)
            throws Exception {
        cause.printStackTrace();
        if (heartBeat != null) {
            heartBeat.cancel(true);
            heartBeat = null;
        }
        ctx.fireExceptionCaught(cause);
    }
}

```
🌈🌈**心跳响应处理器**
```java
package com.shu.Handler;

import com.shu.Pojo.Head;
import com.shu.Pojo.MessageType;
import com.shu.Pojo.NettyMessage;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * @Author shu
 * @Version 1.0
 * @Date: 2022/03/19/ 20:42
 * @Description 心跳响应
 **/
public class HeartBeatRespHandler extends ChannelInboundHandlerAdapter {

    private static final Log LOG = LogFactory.getLog(HeartBeatRespHandler.class);


    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg)
            throws Exception {
        NettyMessage message = (NettyMessage) msg;
        // 返回心跳应答消息
        if (message.getHeader() != null
                && message.getHeader().getType() == MessageType.HEARTBEAT_REQUEST.getType()) {
            LOG.info("Receive client heart beat message : ---> "
                    + message);
            NettyMessage heartBeat = buildHeatBeat();
            LOG.info("Send heart beat response message to client : ---> "
                    + heartBeat);
            ctx.writeAndFlush(heartBeat);
        } else
            ctx.fireChannelRead(msg);
    }

    /**
     * 返回心跳响应
     * @return
     */
    private NettyMessage buildHeatBeat() {
        NettyMessage message = new NettyMessage();
        Head header = new Head();
        header.setType(MessageType.HEARTBEAT_REQUEST.getType().byteValue());
        message.setHeader(header);
        return message;
    }

}

```
心跳超时的机制非常简单，直接利用Netty的ReadTimeoutHandler进行实现，当一定周期内(50s)没有接收到任何对方消息时，需要主动关闭链路。如果是客户端，则重新发起连接，如果是服务端，则释放资源，清除客户端登录缓存信息，等待服务器端重连。
## 4.7 服务端与客户端
🌈🌈服务端
```java
package com.shu.Pojo;

/**
 * @Author shu
 * @Version 1.0
 * @Date: 2022/03/19/ 20:52
 * @Description 常量
 **/
public final class NettyConstant {
    public static final String REMOTEIP = "127.0.0.1";
    public static final int PORT = 8080;
    public static final int LOCAL_PORT = 12088;
    public static final String LOCALIP = "127.0.0.1";
}

```
```java
package com.shu.Server;

import com.shu.Handler.HeartBeatRespHandler;
import com.shu.Handler.LoginAuthRespHandler;
import com.shu.MyByteOutput.NettyMessageDecoder;
import com.shu.MyByteOutput.NettyMessageEncoder;
import com.shu.Pojo.NettyConstant;
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.logging.LogLevel;
import io.netty.handler.logging.LoggingHandler;
import io.netty.handler.timeout.ReadTimeoutHandler;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.IOException;

/**
 * @Author shu
 * @Version 1.0
 * @Date: 2022/03/19/ 20:55
 * @Description
 **/
public class NettyServer {

    private static final Log LOG = LogFactory.getLog(NettyServer.class);

    public void bind() throws Exception {
        // 配置服务端的NIO线程组
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        ServerBootstrap b = new ServerBootstrap();
        b.group(bossGroup, workerGroup).channel(NioServerSocketChannel.class)
                .option(ChannelOption.SO_BACKLOG, 100)
                .handler(new LoggingHandler(LogLevel.INFO))
                .childHandler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    public void initChannel(SocketChannel ch)
                            throws IOException {
                        ch.pipeline().addLast(
                                new NettyMessageDecoder(1024 * 1024, 4, 4));
                        ch.pipeline().addLast(new NettyMessageEncoder());
                        ch.pipeline().addLast("readTimeoutHandler",
                                new ReadTimeoutHandler(50));
                        ch.pipeline().addLast(new LoginAuthRespHandler());
                        ch.pipeline().addLast("HeartBeatHandler",
                                new HeartBeatRespHandler());
                    }
                });

        // 绑定端口，同步等待成功
        b.bind(NettyConstant.REMOTEIP, NettyConstant.PORT).sync();
        LOG.info("Netty server start ok : "
                + (NettyConstant.REMOTEIP + " : " + NettyConstant.PORT));
    }

    public static void main(String[] args) throws Exception {
        new NettyServer().bind();
    }
}

```
🌈🌈客户端
```java
package com.shu.Client;

import com.shu.Handler.HeartBeatReqHandler;
import com.shu.Handler.LoginAuthReqHandler;
import com.shu.MyByteOutput.NettyMessageDecoder;
import com.shu.MyByteOutput.NettyMessageEncoder;
import com.shu.Pojo.NettyConstant;
import io.netty.bootstrap.Bootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.timeout.ReadTimeoutHandler;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.net.InetSocketAddress;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * @Author shu
 * @Version 1.0
 * @Date: 2022/03/19/ 20:53
 * @Description 客服端
 **/
public class NettyClient {

    private static final Log LOG = LogFactory.getLog(NettyClient.class);

    private final ScheduledExecutorService executor = Executors.newScheduledThreadPool(1);


    EventLoopGroup group = new NioEventLoopGroup();


    public void connect(int port, String host) throws Exception {
        // 配置客户端NIO线程组
        try {
            Bootstrap b = new Bootstrap();
            b.group(group).channel(NioSocketChannel.class)
                    .option(ChannelOption.TCP_NODELAY, true)
                    .handler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        public void initChannel(SocketChannel ch)
                                throws Exception {
                            ch.pipeline().addLast(
                                    new NettyMessageDecoder(1024 * 1024, 4, 4));
                            ch.pipeline().addLast("MessageEncoder",
                                    new NettyMessageEncoder());
                            ch.pipeline().addLast("readTimeoutHandler",
                                    new ReadTimeoutHandler(50));
                            ch.pipeline().addLast("LoginAuthHandler",
                                    new LoginAuthReqHandler());
                            ch.pipeline().addLast("HeartBeatHandler",
                                    new HeartBeatReqHandler());
                        }
                    });
            // 发起异步连接操作
            ChannelFuture future = b.connect(
                    new InetSocketAddress(host, port),
                    new InetSocketAddress(NettyConstant.LOCALIP,
                            NettyConstant.LOCAL_PORT)).sync();
            // 当对应的channel关闭的时候，就会返回对应的channel。
            // Returns the ChannelFuture which will be notified when this channel is closed. This method always returns the same future instance.
            future.channel().closeFuture().sync();
        } finally {
            // 所有资源释放完成之后，清空资源，再次发起重连操作
            executor.execute(new Runnable() {
                @Override
                public void run() {
                    try {
                        TimeUnit.SECONDS.sleep(1);
                        try {
                            connect(NettyConstant.PORT, NettyConstant.REMOTEIP);// 发起重连操作
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            });
        }
    }


    /**
     * @param args
     * @throws Exception
     */
    public static void main(String[] args) throws Exception {
        new NettyClient().connect(NettyConstant.PORT, NettyConstant.REMOTEIP);
    }

```
🌈🌈测试
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683342567301-a81e5994-7f66-4b30-850e-fee77bbecfe8.png#averageHue=%23383633&clientId=u203f90df-c403-4&from=paste&id=ucd745915&originHeight=640&originWidth=1828&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=320271&status=done&style=none&taskId=u70407948-32c9-41ca-80ce-60829b6c826&title=)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683342570470-da338248-02f8-4813-ac51-dc9595a6310c.png#averageHue=%23383633&clientId=u203f90df-c403-4&from=paste&id=uadadf911&originHeight=637&originWidth=1859&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=303677&status=done&style=none&taskId=u429536fc-393e-4297-9513-f1f87473fa3&title=)


