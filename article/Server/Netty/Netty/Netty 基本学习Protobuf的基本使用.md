---
title: Netty整合Protocol Buffers
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


参考网站：[Protocol Buffers](https://protobuf.dev/)
Netty官网：[Netty: Home](https://netty.io/)
参考书籍：《Netty权威指南》
#  一 基本知识
## 1.1 定义
协议缓冲区是 Google 的语言中立、平台中立、可扩展的 序列化结构化数据的机制 – 想想 XML，但更小、更快、 简单。您只需定义一次数据的结构，然后就可以 使用特殊生成的源代码轻松编写和读取结构化数据 往返各种数据流并使用多种语言。
## 1.2 作用

- 通过将 结构化的数据 进行 串行化（序列化），从而实现 数据存储 / RPC 数据交换的功能
- 序列化： 将 数据结构或对象 转换成 二进制串 的过程
- 反序列化：将在序列化过程中所生成的二进制串 转换成 数据结构或者对象 的过程
## 1.3 特点
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683265719102-6d0a9b89-22a0-44a6-b5e5-561484d0eddf.png#averageHue=%23f9f9f8&clientId=u4e862118-5706-4&from=paste&id=u5a3cca87&originHeight=776&originWidth=1634&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=203219&status=done&style=none&taskId=ub3c1bedd-3004-4f72-8f9f-e57ae173465&title=)
## 1.4 安装与配置

- 官网下载安装包：[https://github.com/protocolbuffers/protobuf/releases/latest](https://github.com/protocolbuffers/protobuf/releases/latest)
- 配置环境变量：

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683265766751-8cd1930c-11d1-45cc-a8b5-1514ce035990.png#averageHue=%23f2f0ee&clientId=u4e862118-5706-4&from=paste&id=udc1eac28&originHeight=664&originWidth=677&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=54108&status=done&style=none&taskId=ud9276371-4da5-4809-a0a8-4535e3755e7&title=)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683265788129-85a0636a-7661-43c3-8b08-17a8baa7b4f8.png#averageHue=%231f1f1e&clientId=u4e862118-5706-4&from=paste&id=ubec3baee&originHeight=639&originWidth=1223&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=38257&status=done&style=none&taskId=uc665f6d6-d560-40f0-b232-70b43bf57c9&title=)

- idea 插件安装

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683265812275-d78e52cb-f952-492b-82d8-611d6883a3d0.png#averageHue=%23373b41&clientId=u4e862118-5706-4&from=paste&id=uf837bdd8&originHeight=879&originWidth=1229&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=143534&status=done&style=none&taskId=u262f9aaa-794b-491b-bf45-76d15eca2ef&title=)
## 1.5 为啥选择[Protocol Buffers](https://protobuf.dev/)
参考文章：[Beating JSON performance with Protobuf](https://auth0.com/blog/beating-json-performance-with-protobuf/)
Protobuf不仅仅是一种消息格式，它还是一组用于定义和交换这些消息的规则和工具。 谷歌是这个协议的创造者，已开源，并为常用的编程语言提供生成代码的工具，如JavaScript，Java，PHP，C＃，Ruby，Objective C，Python，C ++和Go。 除此之外，Protobuf具有比JSON更多的数据类型，如枚举和方法，并且还大量用于[RPC](https://link.zhihu.com/?target=https%3A//github.com/grpc)（远程过程调用）。
## 1.6 Protobuf真的比JSON快吗
有资料表明Protobuf比JSON，XML性能更好 - 就像[这个](https://link.zhihu.com/?target=https%3A//github.com/eishay/jvm-serializers/wiki)和[这个](https://link.zhihu.com/?target=https%3A//maxondev.com/serialization-performance-comparison-c-net-formats-frameworks-xmldatacontractserializer-xmlserializer-binaryformatter-json-newtonsoft-servicestack-text/) - 但是检查这些例子是否符合您的需求是很重要的。 在[Auth0](https://link.zhihu.com/?target=https%3A//auth0.com/)中，我开发了一个简单的[Spring Boot应用程序](https://link.zhihu.com/?target=https%3A//github.com/brunokrebs/auth0-speed-test)来测试几个场景并对比了JSON和Protobuf的性能。 我主要测试了java应用程序间通信、javascript web应用程序与此后端通信过程中两种协议的序列化，下面我们主要看图，有兴趣的话去看原文章
🌈🌈压缩环境下Java-JavaScript
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683266099152-9bb9a1ff-b9ab-407b-b684-8ac7614dec79.png#averageHue=%23f9f3ee&clientId=u4e862118-5706-4&from=paste&id=ub8923758&originHeight=1260&originWidth=2400&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ue2cac1a4-bb4f-4229-b58f-70efae106f5&title=)
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683266111692-7f8970e8-d8c6-47a4-87b7-d75932239db9.png#averageHue=%23f8f6ee&clientId=u4e862118-5706-4&from=paste&id=ubc3ba5fa&originHeight=1260&originWidth=2400&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ufe16c6f7-c711-46c5-bc3a-4b2299a4189&title=)
🌈🌈未压缩环境下Java-JavaScript
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683266317166-e9d5f7a5-f70e-4c99-89c2-4270080905d4.png#averageHue=%23f9f3ef&clientId=u4e862118-5706-4&from=paste&id=u723ca72c&originHeight=1260&originWidth=2400&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ua7186688-e6bf-4e30-9513-9463e6c1dd4&title=)
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683266324566-bace4d75-8514-4d6b-98a0-18c5bf25db33.png#averageHue=%23f7f5e8&clientId=u4e862118-5706-4&from=paste&id=u94e0f1d5&originHeight=1260&originWidth=2400&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u4fa5767b-cf6d-4f00-aaa2-0e97ba2a7ac&title=)
🌈🌈Java-Java
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683266369899-2d88cc10-e643-4a46-99f0-4280a06ffdb5.png#averageHue=%23f9f5f3&clientId=u4e862118-5706-4&from=paste&id=u89597868&originHeight=1260&originWidth=2400&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u87638c5c-62d3-4e13-aba3-369217daee1&title=)
# 二  proto基本使用
## 2.1 如何定义消息类型
假设您要定义搜索 请求消息格式，其中每个搜索请求都有一个查询字符串， 您感兴趣的特定结果页面，以及每个结果的数量 页。下面是用于定义消息类型的文件.proto
```java

syntax = "proto2";

message SearchRequest {
  optional string query = 1;
  optional int32 page_number = 2;
  optional int32 result_per_page = 3;
}
```

- 文件的第一行指定你使用的是语法。这 应该是文件的第一个非空、非注释行。proto2
- 消息定义指定三个字段（名称/值） 对），对于要包含在此类 消息。每个字段都有名称和类型。SearchRequest
### 2.1.1 message 

- 一个消息对象（Message） = 一个 结构化数据
- 消息对象用 修饰符 message 修饰
- 消息对象 含有 字段：消息对象（Message）里的 字段 = 结构化数据 里的成员变量
### 2.1.2 字段

- 消息对象的字段 组成主要是：字段 = 字段修饰符 + 字段类型 +字段名 +标识号
- required: 必填字段问题严重，以至于 从 proto3 中删除。必填字段的语义应在 应用层。
- optional：一个格式良好的消息可以有零个或一个这个字段（但不能超过一个）。
- repeated：该字段可以在格式良好的消息中重复任意次数（包括零次）。重复值的顺序将被保留。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683267074019-8222d888-ed22-4457-bb15-c576f23af019.png#averageHue=%23eeeeee&clientId=u4e862118-5706-4&from=paste&id=ua6bb359d&originHeight=280&originWidth=1040&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=84588&status=done&style=none&taskId=u6819c7f3-0521-4ce3-926c-1c470a8c6ab&title=)
### 2.1.3 数据类型
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683267097424-5109e9e5-7b48-47b7-9697-995f670ce1f1.png#averageHue=%23f1f1f1&clientId=u4e862118-5706-4&from=paste&id=u0ca044cd&originHeight=648&originWidth=870&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=105295&status=done&style=none&taskId=ud821a237-6817-405c-ae20-4463ad22604&title=)
### 2.1.4 为自动分配序号
必须为消息定义中的每个字段指定一个介于 和 之间的数字，并具有以下限制：1536,870,911

- 给定的数字在该消息的所有字段中**必须是唯一的**。
- 为协议缓冲区保留的字段编号 实现。如果您使用以下之一，协议缓冲区编译器将抱怨 消息中的这些保留字段编号。19,00019,999
- 您不能使用任何以前[保留](https://protobuf.dev/programming-guides/proto2/#fieldreserved)的字段编号或 已分配给[扩展的任何](https://protobuf.dev/programming-guides/proto2/#extensions)字段编号。
- 您应该将字段编号 1 到 15 用于最常设置的字段 领域，较低的字段编号值在导线格式中占用的空间较少。
### 2.1.5 可选字段与默认值
```java
optional int32 result_per_page = 3 [default = 10];
```
如果未为可选元素指定默认值，则特定于类型 而是使用默认值：对于字符串，默认值为空 字符串。对于字节，默认值为空字节字符串。对于布尔值， 默认值为 false。对于数值类型，默认值为零。对于枚举， 默认值是枚举的类型定义中列出的第一个值。
### 2.1.6 包名

- 防止不同 .proto 项目间命名 发生冲突
- 每个包会被看作是其父类包的内部类
```java
package person;

```
### 2.1.7 Option选项

- 作用：影响 特定环境下 的处理方式
- 在 ProtocolBuffers 中允许 自定义选项 并 使用
```java
option java_package = "com.carson.proto";
// 定义：Java包名
// 作用：指定生成的类应该放在什么Java包名下
// 注：如不显式指定，默认包名为：按照应用名称倒序方式进行排序

option java_outer_classname = "Demo";
// 定义：类名
// 作用：生成对应.java 文件的类名（不能跟下面message的类名相同）
// 注：如不显式指定，则默认为把.proto文件名转换为首字母大写来生成
// 如.proto文件名="my_proto.proto"，默认情况下，将使用 "MyProto" 做为类名

option optimize_for = ***;
// 作用：影响 C++  & java 代码的生成
// ***参数如下：
// 1. SPEED (默认):：protocol buffer编译器将通过在消息类型上执行序列化、语法分析及其他通用的操作。（最优方式）
// 2. CODE_SIZE:：编译器将会产生最少量的类，通过共享或基于反射的代码来实现序列化、语法分析及各种其它操作。
  // 特点：采用该方式产生的代码将比SPEED要少很多， 但是效率较低；
  // 使用场景：常用在 包含大量.proto文件 但 不追求效率 的应用中。
//3.  LITE_RUNTIME:：编译器依赖于运行时 核心类库 来生成代码（即采用libprotobuf-lite 替代libprotobuf）。
  // 特点：这种核心类库要比全类库小得多（忽略了 一些描述符及反射 ）；编译器采用该模式产生的方法实现与SPEED模式不相上下，产生的类通过实现 MessageLite接口，但它仅仅是Messager接口的一个子集。
  // 应用场景：移动手机平台应用

option cc_generic_services = false;
option java_generic_services = false;
option py_generic_services = false;
// 作用：定义在C++、java、python中，protocol buffer编译器是否应该 基于服务定义 产生 抽象服务代码（2.3.0版本前该值默认 = true）
// 自2.3.0版本以来，官方认为通过提供 代码生成器插件 来对 RPC实现 更可取，而不是依赖于“抽象”服务

optional repeated int32 samples = 4 [packed=true];
// 如果该选项在一个整型基本类型上被设置为真，则采用更紧凑的编码方式（不会对数值造成损失）
// 在2.3.0版本前，解析器将会忽略 非期望的包装值。因此，它不可能在 不破坏现有框架的兼容性上 而 改变压缩格式。
// 在2.3.0之后，这种改变将是安全的，解析器能够接受上述两种格式。

optional int32 old_field = 6 [deprecated=true];
// 作用：判断该字段是否已经被弃用
// 作用同 在java中的注解@Deprecated

```
### 2.1.8 保留字段

- 如果您通过完全删除某个字段或将其注释掉来更新消息类型，未来的用户可以在对类型进行自己的更新时重用该字段编号。
- 如果他们稍后加载相同的旧版本，这可能会导致严重问题.proto，包括数据损坏、隐私错误等。
- 确保不会发生这种情况的一种方法是指定已删除字段的字段编号（和/或名称，这也可能导致 JSON 序列化问题）为reserved. 如果将来有任何用户尝试使用这些字段标识符，protocol buffer 编译器会抱怨。
```java
message Foo {
  reserved 2, 15, 9 to 11;
  reserved "foo", "bar";
}

// 保留最大值
enum Foo {
  reserved 2, 15, 9 to 11, 40 to max;
  reserved "FOO", "BAR";
}

```
## 2.2 枚举类型

- 为字段指定一个 可能取值的字段集合。
- 枚举类型的定义可在一个消息对象的内部或外部。
- 都可以在 同一.proto文件 中的任何消息对象里使用。
- 当枚举类型是在一消息内部定义，希望在 另一个消息中 使用时，需要MessageType.EnumType的语法格式。
```java
enum Corpus {
  CORPUS_UNSPECIFIED = 0;
  CORPUS_UNIVERSAL = 1;
  CORPUS_WEB = 2;
  CORPUS_IMAGES = 3;
  CORPUS_LOCAL = 4;
  CORPUS_NEWS = 5;
  CORPUS_PRODUCTS = 6;
  CORPUS_VIDEO = 7;
}

message SearchRequest {
  optional string query = 1;
  optional int32 page_number = 2;
  optional int32 result_per_page = 3 [default = 10];
  optional Corpus corpus = 4 [default = CORPUS_UNIVERSAL];
}
```
## 2.3 消息对象的引用

- 消息内部使用
```java
package person;
option java_package="com.shu.proto";
option java_outer_classname="Person";
// 编码格式
option java_string_check_utf8=true;
// 是否生成hash与equal方法
option java_generate_equals_and_hash=true;
// 基本数据类型,message:定义消息模型
message person{
   // 必须
   required int32 id=1;
   // 可选
   optional string userName=2;
   required double check=3;
   // 可复用赋值
   repeated string sex=4;
   // 性别枚举类
   enum SexType{
      man=1;
      woman=2;
   }
   // 嵌套消息模型
   message Person_Sex {
      optional SexType type = 2 [default = man];
   }
}
```

- 外部消息使用
```java
package person;

option java_package="com.shu.proto";
option java_outer_classname="Person";
// 编码格式
option java_string_check_utf8=true;
// 是否生成hash与equal方法
option java_generate_equals_and_hash=true;


// 基本数据类型,message:定义消息模型
message person{
   // 必须
   required int32 id=1;
   // 可选
   optional string userName=2;
   required double check=3;
   // 可复用赋值
   repeated string sex=4;
   // 性别枚举类
   enum SexType{
      man=1;
      woman=2;
   }
   // 嵌套消息模型
   message Person_Sex {
      optional SexType type = 2 [default = man];
   }
}
// 外部消息
message AddressBook {
   repeated person person = 1;
   // 直接使用了 Person消息类型作为消息字段
}
```

- 使用不同的protoc文件
```java
import "myproject/other_protos.proto"
// 在A.proto 文件中添加 B.proto文件路径的导入声明
// ProtocolBuffer编译器 会在 该目录中 查找需要被导入的 .proto文件
// 如果不提供参数，编译器就在 其调用的目录下 查找
```
## 2.4 定义RPC服务

- 定义服务
```java
package person;

option java_package="com.shu.proto";
option java_outer_classname="Person";
// 编码格式
option java_string_check_utf8=true;
// 是否生成hash与equal方法
option java_generate_equals_and_hash=true;


// 返回参数
message person{
   required int32 id=1;
   optional string userName=2;
   repeated string sex=3;
}


// 查询参数
message SearchRequest {
   repeated int32 id = 1;
}


// 定义RPC服务
service SearchPersonService {
   rpc Search (SearchRequest) returns (person);
}
// // 生成命令 protoc -I=E:\Project\Java\src\Demo --java_out=E:\Project E:\Project\Java\src\Demo\Person.proto

```
## 2.5 生成命令

- Protoco Buffer提供 C++、Java、Python 三种开发语言的 API

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683273098947-78063c05-5ace-49a1-b444-57a03602d27a.png#averageHue=%23f4f3f3&clientId=u4e862118-5706-4&from=paste&id=udb218602&originHeight=221&originWidth=1120&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=48619&status=done&style=none&taskId=u88d114cd-a626-4fa0-a8f3-1f40fa25a4e&title=)
```java
// 在 终端 输入下列命令进行编译
protoc -I=$SRC_DIR --xxx_out=$DST_DIR   $SRC_DIR/addressbook.proto

// 参数说明
// 1. $SRC_DIR：指定需要编译的.proto文件目录 (如没有提供则使用当前目录)
// 2. --xxx_out：xxx根据需要生成代码的类型进行设置
// 对于 Java ，xxx =  java ，即 -- java_out
// 对于 C++ ，xxx =  cpp ，即 --cpp_out
// 对于 Python，xxx =  python，即 --python_out

// 3. $DST_DIR ：编译后代码生成的目录 (通常设置与$SRC_DIR相同)
// 4. 最后的路径参数：需要编译的.proto 文件的具体路径

// 编译通过后，Protoco Buffer会根据不同平台生成对应的代码文件
// eg:protoc -I=E:\Project\Java\src\Demo --java_out=E:\Project E:\Project\Java\src\Demo\Person.proto

```
# 三 Netty与Protobuf的案例结合
🌈🌈SubscribeReq.proto
```java
syntax = "proto2";

package com.shu;
option java_package = "com.shu";
option java_outer_classname = "SubscribeReqModel";

message SubscribeReq {
    required int32 subReqID = 1;
    required string userName = 2;
    required string productName = 3;
    optional string phoneNumber = 4;
}

//  protoc -I=E:\学习\NettyLearn\Netty-Day-05\src\main\java --java_out=E:\学习\NettyLearn E:\学习\NettyLearn\Netty-Day-05\src\ma
//in\java\SubscribeReq.proto

```
🌈🌈SubscribeResp.proto
```java
syntax = "proto2";

package com.shu;
option java_package = "com.shu";
option java_outer_classname = "SubscribeRespModel";


message SubscribeResp {
    required int32 subReqID = 1;
    required int32 respCode = 2;
    required string desc = 3;
}

//  protoc -I=E:\学习\NettyLearn\Netty-Day-05\src\main\java --java_out=E:\学习\NettyLearn E:\学习\NettyLearn\Netty-Day-05\src\ma
//in\java\SubscribeResp.proto
```
🌈🌈Netty服务端
```java
package com.shu;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.protobuf.ProtobufDecoder;
import io.netty.handler.codec.protobuf.ProtobufEncoder;
import io.netty.handler.codec.protobuf.ProtobufVarint32FrameDecoder;
import io.netty.handler.codec.protobuf.ProtobufVarint32LengthFieldPrepender;
import io.netty.handler.logging.LogLevel;
import io.netty.handler.logging.LoggingHandler;



/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/26 16:42
 * @version: 1.0
 */
public class SubReqServer {

    /**
     * 绑定端口
     * @param port
     * @throws Exception
     */
    public void bind(int port) throws Exception {
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workGroup = new NioEventLoopGroup();
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup , workGroup)
                    .channel(NioServerSocketChannel.class)
                    .option(ChannelOption.SO_BACKLOG , 100)
                    .childHandler(new LoggingHandler(LogLevel.INFO))
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {
                            // ProtobufVarint32FrameDecoder用于半包处理
                            ch.pipeline().addLast(new ProtobufVarint32FrameDecoder());
                            // ProtobufDecoder用于解码
                            ch.pipeline().addLast(new ProtobufDecoder(SubscribeReqModel.SubscribeReq.getDefaultInstance()));
                            // ProtobufVarint32LengthFieldPrepender用于半包处理
                            ch.pipeline().addLast(new ProtobufVarint32LengthFieldPrepender());
                            // ProtobufEncoder用于编码
                            ch.pipeline().addLast(new ProtobufEncoder());
                            // 添加业务处理handler
                            ch.pipeline().addLast(new SubReqServerHandler());
                        }
                    });
            // 绑定端口，同步等待成功
            ChannelFuture future = b.bind(port).sync();
            // 等待服务端监听端口关闭
            future.channel().closeFuture().sync();
            System.out.println("SubReqServer start at port : " + port);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            bossGroup.shutdownGracefully();
            workGroup.shutdownGracefully();
        }
    }

    public static void main(String[] args) {
        SubReqServer server = new SubReqServer();
        try {
            server.bind(8080);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

```
```java
package com.shu;

import io.netty.channel.ChannelHandlerAdapter;
import io.netty.channel.ChannelHandlerContext;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/26 20:02
 * @version: 1.0
 */
public class SubReqServerHandler extends ChannelHandlerAdapter {

        @Override
        public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
            ctx.close();
        }

        /**
        * 读取客户端发送的SubscribeReqModel.SubscribeReq请求，调用channelRead方法
        * @param ctx
        * @param msg
        * @throws Exception
        */
        public void channelRead(ChannelHandlerContext ctx , Object msg) throws Exception {
            SubscribeReqModel.SubscribeReq req = (SubscribeReqModel.SubscribeReq) msg;
            if ("shu".equalsIgnoreCase(req.getUserName())) {
                System.out.println("Service accept client subscribe req : [" + req.toString() + "]");
                ctx.writeAndFlush(resp(req.getSubReqID()));
            }
        }

        /**
        * 构造SubscribeRespModel.SubscribeResp响应
        * @param subReqID
        * @return
        */
        private SubscribeRespModel.SubscribeResp resp(int subReqID) {
            SubscribeRespModel.SubscribeResp.Builder builder = SubscribeRespModel.SubscribeResp.newBuilder();
            builder.setSubReqID(subReqID);
            builder.setRespCode(0);
            builder.setDesc("Netty book order succeed, 3 days later, sent to the designated address");
            return builder.build();
        }

        /**
        * 读取完成后，调用channelReadComplete方法，将消息发送队列中的消息写入到SocketChannel中发送给对方
        * @param ctx
        * @throws Exception
        */
        public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
            ctx.flush();
        }
}

```
🌈🌈客户端
```java
package com.shu;

import io.netty.bootstrap.Bootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.protobuf.ProtobufDecoder;
import io.netty.handler.codec.protobuf.ProtobufEncoder;
import io.netty.handler.codec.protobuf.ProtobufVarint32FrameDecoder;
import io.netty.handler.codec.protobuf.ProtobufVarint32LengthFieldPrepender;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/26 20:10
 * @version: 1.0
 */
public class SubReqClient {


    public void connect(int port, String host) throws Exception {
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            Bootstrap b = new Bootstrap();
            b.group(group)
                    .option(ChannelOption.TCP_NODELAY, true)
                    .channel(NioSocketChannel.class)
                    .handler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {
                            // ProtobufVarint32FrameDecoder用于半包处理
                            ch.pipeline().addLast(new ProtobufVarint32FrameDecoder());
                            // ProtobufDecoder用于解码
                            ch.pipeline().addLast(new ProtobufDecoder(SubscribeRespModel.SubscribeResp.getDefaultInstance()));
                            // ProtobufVarint32LengthFieldPrepender用于半包处理
                            ch.pipeline().addLast(new ProtobufVarint32LengthFieldPrepender());
                            // ProtobufEncoder用于编码
                            ch.pipeline().addLast(new ProtobufEncoder());
                            // 添加业务处理handler
                            ch.pipeline().addLast(new SubReqClientHandler());
                        }
                    });
            // 发起异步连接操作
            ChannelFuture future = b.connect(host, port).sync();
            // 等待客户端链路关闭
            future.channel().closeFuture().sync();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            group.shutdownGracefully();
        }

    }

    public static void main(String[] args) {
        int port = 8080;
        try {
            new SubReqClient().connect(port, "127.0.0.1");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

```
```java
package com.shu;

import io.netty.channel.ChannelHandlerAdapter;
import io.netty.channel.ChannelHandlerContext;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/26 20:14
 * @version: 1.0
 */
public class SubReqClientHandler extends ChannelHandlerAdapter {

    public SubReqClientHandler() {
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        ctx.close();
    }

    /**
     * 客户端和服务端TCP链路建立成功后，Netty的NIO线程会调用channelActive方法，发送查询时间的指令给服务端
     * 调用ChannelHandlerContext的writeAndFlush方法将请求消息发送给服务端
     * @param ctx
     * @throws Exception
     */
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        for (int i = 0; i < 10; i++) {
            ctx.write(subReq(i));
        }
        ctx.flush();
    }

    /**
     * 构造SubscribeReqModel.SubscribeReq请求
     * @param i
     * @return
     */
    private SubscribeReqModel.SubscribeReq subReq(int i) {
        SubscribeReqModel.SubscribeReq.Builder builder = SubscribeReqModel.SubscribeReq.newBuilder();
        builder.setSubReqID(i);
        builder.setUserName("shu");
        builder.setProductName("Netty Book For Protobuf");
        return builder.build();
    }

    /**
     * 服务端返回应答消息时，channelRead方法被调用
     * @param ctx
     * @param msg
     * @throws Exception
     */
    public void channelRead(ChannelHandlerContext ctx , Object msg) throws Exception {
        System.out.println("Receive server response : [" + msg + "]");
    }

    /**
     * 读取完成后，调用channelReadComplete方法，将消息发送队列中的消息写入到SocketChannel中发送给对方
     * @param ctx
     * @throws Exception
     */
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
        ctx.flush();
    }

}

```
🌈🌈测试
服务端
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683273788931-aa0a938a-2407-4c41-9749-d413d8f6adc3.png#averageHue=%232d2c2c&clientId=u4e862118-5706-4&from=paste&height=477&id=ucaef34de&originHeight=596&originWidth=1807&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=84499&status=done&style=none&taskId=udca87bdf-e9f5-4b47-8bba-c7a69de0bc3&title=&width=1445.6)
客户端
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683273810822-7e33b4e2-9ae2-409d-a69f-b8fd5bffe51e.png#averageHue=%232e2d2d&clientId=u4e862118-5706-4&from=paste&height=470&id=uf18e682e&originHeight=588&originWidth=1831&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=89873&status=done&style=none&taskId=uc411f28f-7c9f-4076-8f80-ac8bf6b0a54&title=&width=1464.8)
到这我们就了解到了Protobuf的基本使用以及与Netty的结合

 
