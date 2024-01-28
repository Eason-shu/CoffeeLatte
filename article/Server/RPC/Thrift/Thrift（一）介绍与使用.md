---
title: Thrift（一）介绍与使用
sidebar_position: 1
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
# 一  基本介绍
## 1.1 介绍
Thrift是一种可伸缩的跨语言服务的RPC软件框架。它结合了功能强大的软件堆栈的代码生成引擎，以建设服务，高效、无缝地在多种语言间结合使用。2007年由facebook贡献到apache基金，是apache下的顶级项目，具备如下特点：

- 支持多语言：C、C++ 、C# 、D 、Delphi 、Erlang 、Go 、Haxe 、Haskell 、Java 、JavaScript、node.js 、OCaml 、Perl 、PHP 、Python 、Ruby 、SmallTalk
- 消息定义文件支持注释，数据结构与传输表现的分离，支持多种消息格式
- 包含完整的客户端/服务端堆栈，可快速实现RPC，支持同步和异步通信
## 1.2 常用的RPC

- **Thrift**：thrift是一个软件框架，用来进行可扩展且跨语言的服务的开发。它结合了功能强大的软件堆栈和代码生成引擎，以构建在 C++, Java, Python, PHP, Ruby, Erlang, Perl, Haskell, C#, Cocoa, JavaScript, Node.js, Smalltalk, and OCaml 这些编程语言间无缝结合的、高效的服务。
- **gRPC**：一开始由 google 开发，是一款语言中立、平台中立、开源的远程过程调用(RPC)系统。
- **Dubbo**：Dubbo是一个分布式服务框架，以及SOA治理方案。其功能主要包括：高性能NIO通讯及多协议集成，服务动态寻址与路由，软负载均衡与容错，依赖分析与降级等。Dubbo是阿里巴巴内部的SOA服务化治理方案的核心框架，Dubbo自2011年开源后，已被许多非阿里系公司使用。
- **Spring Cloud**：Spring Cloud由众多子项目组成，如Spring Cloud Config、Spring Cloud Netflix、Spring Cloud Consul 等，提供了搭建分布式系统及微服务常用的工具，如配置管理、服务发现、断路器、智能路由、微代理、控制总线、一次性token、全局锁、选主、分布式会话和集群状态等，满足了构建微服务所需的所有解决方案。Spring Cloud基于Spring Boot, 使得开发部署极其简单。
## 1.3 性能测试

- 整体上看，长连接性能优于短连接，性能差距在两倍以上
- 对比Go语言的两个RPC框架，Thrift性能明显优于gRPC，性能差距也在两倍以上；
- 对比Thrift框架下的的两种语言，长连接下Go 与C++的RPC性能基本在同一个量级，在短连接下，Go性能大概是C++的二倍；
- 对比Thrift&C++下的TSimpleServer与TNonblockingServer，在单进程客户端长连接的场景下，TNonblockingServer因为存在线程管理开销，性能较TSimpleServer差一些；但在短连接时，主要开销在连接建立上，线程池管理开销可忽略；
- 两套RPC框架，以及两大语言运行都非常稳定，5w次请求耗时约是1w次的5倍；
## 1.4 **Thrift框架结构**
Thrift是一套包含序列化功能和支持服务通信的RPC（远程服务调用）框架，也是一种微服务框架。其主要特点是可以跨语言使用，这也是这个框架最吸引人的地方。
![](https://cdn.nlark.com/yuque/0/2024/webp/12426173/1706372449836-611bef08-1bb1-4eb5-b575-d92876474a7b.webp#averageHue=%23e0c399&clientId=u47c2d215-c7bd-4&from=paste&id=fwKlR&originHeight=551&originWidth=720&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u7ca96976-edcd-4222-bc68-711dd2bab23&title=)
Thrift**软件栈**分层**从下向上**分别为：**传输层**(Transport Layer)、**协议层**(Protocol Layer)、**处理层**(Processor Layer)和**服务层**(Server Layer)。

- **传输层**(Transport Layer)：传输层负责直接从网络中**读取**和**写入**数据，它定义了具体的**网络传输协议**；比如说TCP/IP传输等。
- **协议层**(Protocol Layer)：协议层定义了**数据传输格式**，负责网络传输数据的**序列化**和**反序列化**；比如说JSON、XML、**二进制数据**等。
- **处理层**(Processor Layer)：处理层是由具体的IDL（**接口描述语言**）生成的，封装了具体的**底层网络传输**和**序列化方式**，并委托给用户实现的Handler进行处理。
- **服务层**(Server Layer)：整合上述组件，提供具体的**网络线程/IO服务模型**，形成最终的服务。
## 1.5 特点
### (一) 开发速度快
通过编写RPC接口Thrift IDL文件，利用**编译生成器**自动生成**服务端骨架**(Skeletons)和**客户端桩**(Stubs)。从而省去开发者**自定义**和**维护接口编解码**、**消息传输**、**服务器多线程模型**等基础工作。
- 服务端：只需要按照**服务骨架**即**接口**，编写好具体的**业务处理程序**(Handler)即**实现类**即可。
- 客户端：只需要拷贝IDL定义好的**客户端桩**和**服务对象**，然后就像调用本地对象的方法一样调用远端服务。
### (二) 接口维护简单
通过维护Thrift格式的IDL（**接口描述语言**）文件（注意写好注释），即可作为给Client使用的接口文档使用，也**自动生成**接口代码，始终保持代码和文档的一致性。且Thrift协议可灵活支持**接口**的**可扩展性**。
### (三) 学习成本低
因为其来自Google Protobuf开发团队，所以其IDL文件风格类似Google Protobuf，且更加**易读易懂**；特别是RPC**服务接口**的风格就像写一个**面向对象**的Class一样简单。
初学者只需参照：[thrift.apache.org/](https://link.zhihu.com/?target=https%3A//link.juejin.cn/%3Ftarget%3Dhttp%253A%252F%252Fthrift.apache.org%252F)，一个多小时就可以理解Thrift IDL文件的语法使用。
### (四) 多语言/跨语言支持
Thrift支持C++、 Java、Python、PHP、Ruby、Erlang、Perl、Haskell、C#、Cocoa、JavaScript、Node.js、Smalltalk等多种语言，即可生成上述语言的**服务器端**和**客户端程序**。
对于我们经常使用的Java、PHP、Python、C++支持良好，虽然对iOS环境的Objective-C(Cocoa)支持稍逊，但也完全满足我们的使用要求。
### (五) 稳定/广泛使用
Thrift在很多开源项目中已经被验证是**稳定**和**高效**的，例如Cassandra、Hadoop、HBase等；国外在Facebook中有广泛使用，国内包括百度、美团小米、和饿了么等公司。
![](https://cdn.nlark.com/yuque/0/2024/webp/12426173/1706372611138-cc5112c9-e5ea-45e3-8d60-e3804f1d4065.webp#averageHue=%23faf7f5&clientId=u47c2d215-c7bd-4&from=paste&id=sZuvJ&originHeight=485&originWidth=707&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u8f3e2e7f-e6b5-49cf-8cf2-03f9b914eef&title=)

# 二 环境搭建
## 2.1 下载环境搭建

- 下载地址：[https://www.apache.org/dyn/closer.cgi?path=/thrift/0.19.0/thrift-0.19.0.exe](https://www.apache.org/dyn/closer.cgi?path=/thrift/0.19.0/thrift-0.19.0.exe)
- 下载完成改成thrift.exe，放到指定文件夹

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1706372782250-a6223d95-8455-4bdf-941a-2f0d5e0c7ea4.png#averageHue=%23fcfcfc&clientId=u47c2d215-c7bd-4&from=paste&height=380&id=u1a233027&originHeight=456&originWidth=1756&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=26460&status=done&style=none&taskId=ub9726114-31f2-4adc-8f9e-d0552173691&title=&width=1463.3332751856933)

- 配置环境变量：path添加
```bash
C:\Windows\System32
D:\environment\Thrift
```

- 版本验证
```xml
thrift -version
```
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1706373451173-86176e3f-133f-45aa-a074-55b30447b69d.png#averageHue=%230e0e0e&clientId=u47c2d215-c7bd-4&from=paste&height=220&id=ud00d22d1&originHeight=264&originWidth=1108&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=13343&status=done&style=none&taskId=uf203b0db-c969-499b-9ae7-6262ffaec74&title=&width=923.3332966433645)

- Idea 插件下载

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1706372893179-72bfaf70-dd3a-4bcd-841c-2e174762a2ad.png#averageHue=%232d3037&clientId=u47c2d215-c7bd-4&from=paste&height=649&id=u162eb9d8&originHeight=779&originWidth=1047&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=71983&status=done&style=none&taskId=u0a9d1031-c3f1-4dd0-b7e9-8cda10ad33e&title=&width=872.4999653299664)

- idea 配置

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1706372923489-849ab9fd-ea0a-4bde-a584-0b202d123761.png#averageHue=%232b2e32&clientId=u47c2d215-c7bd-4&from=paste&height=760&id=ucc2b390d&originHeight=912&originWidth=1216&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=78285&status=done&style=none&taskId=ude29f45f-c548-43ba-b8fa-8aa126b5699&title=&width=1013.3332930670861)

## 2.2 编译测试

- mave 编译插件配置：编写的thrift在src/main/thrift下
```xml
<build>
    <plugins>
      <plugin>
        <groupId>org.apache.thrift.tools</groupId>
        <artifactId>maven-thrift-plugin</artifactId>
        <version>0.1.11</version>
        <configuration>
          <!--<thriftExecutable>/usr/local/bin/thrift</thriftExecutable>-->
<!--          <thriftSourceRoot>src/main/thrift</thriftSourceRoot>-->
          <outputDirectory>src/main/java</outputDirectory>
          <generator>java</generator>
        </configuration>
        <executions>
          <execution>
            <id>thrift-sources</id>
            <phase>generate-sources</phase>
            <goals>
              <goal>compile</goal>
            </goals>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>
```
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1706373050754-151c52c9-0524-49f3-b9ac-85c6612b0cfb.png#averageHue=%232b2e31&clientId=u47c2d215-c7bd-4&from=paste&height=860&id=u83533fd1&originHeight=1032&originWidth=1920&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=113803&status=done&style=none&taskId=u2e662e36-ad01-47ff-8294-ab40633df05&title=&width=1599.9999364217147)
```xml
namespace java com.shu

service HelloService{
string sayHello(1:string username)
}

```

- Maven编译插件进行编译，查看编译后的代码

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1706373138344-c25b8097-64c1-4a3d-aff1-381af3bd94ae.png#averageHue=%23262a31&clientId=u47c2d215-c7bd-4&from=paste&height=860&id=u2673ab4b&originHeight=1032&originWidth=1920&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=178219&status=done&style=none&taskId=u49e49ac2-d34c-4611-84d6-89388efc7e8&title=&width=1599.9999364217147)
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1706373277008-1268f9ed-0343-4788-8ff4-3e14fc119019.png#averageHue=%23232528&clientId=u47c2d215-c7bd-4&from=paste&height=860&id=ud73fdfb8&originHeight=1032&originWidth=1920&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=183828&status=done&style=none&taskId=ueac6d068-6937-4b6b-a7a1-f18b97ab930&title=&width=1599.9999364217147)
对于开发人员而言，使用原生的Thrift框架，仅需要关注以下四个核心**内部接口/类**：Iface, AsyncIface, Client和AsyncClient。

- **Iface**：**服务端**通过实现HelloWorldService.Iface接口，向**客户端**的提供具体的**同步**业务逻辑。
- **AsyncIface**：**服务端**通过实现HelloWorldService.Iface接口，向**客户端**的提供具体的**异步**业务逻辑。
- **Client**：**客户端**通过HelloWorldService.Client的实例对象，以**同步**的方式**访问服务端**提供的服务方法。
- **AsyncClient**：**客户端**通过HelloWorldService.AsyncClient的实例对象，以**异步**的方式**访问服务端**提供的服务方法。
# 三 基本语法
## 3.1 基本类型
Thrift 脚本可定义的数据类型包括以下几种类型：

1. **基本类型：bool**: 布尔值 **byte**: 8位有符号整数 **i16**: 16位有符号整数 **i32**: 32位有符号整数 **i64**: 64位有符号整数 **double**: 64位浮点数 **string**: UTF-8编码的字符串 **binary**: 二进制串
2. **结构体类型：struct**: 定义的结构体对象
3. **容器类型：list**: 有序元素列表 **set**: 无序无重复元素集合 **map**: 有序的key/value集合
4. **异常类型：exception**: 异常类型
5. **服务类型：service**: 具体对应服务的类

```xml
namespace java com.shu

// 定义别名:将thrift基本数据类型别名为Java数据类型，方便使用
typedef i16 short
typedef i32 int
typedef i64 long
typedef string String
typedef bool  Boolean
typedef double Double

// 定义一个struct:相当于Java中的类
struct PersonModel{
1:optional String id;
2:optional String userName;
3:optional String passWord;
4:optional Boolean isCheck;
}

// 定义一个异常
exception PersonException{
1:optional int code;
2:optional String message;
}

// 定义一个服务集合
service PersonService{
 // 通过用户名获取信息,并扔出异常
 PersonModel getPersonInfoByUserNmae(1:required String username) throws (1: PersonException exce )
 // 通过用户名检查是否可用
 Boolean IsCheck(1:required String username)

}

```

- 编译后的文件

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1706405850224-aea0a838-539b-46aa-a82e-1da3c4985870.png#averageHue=%23222428&clientId=ua40b781c-61a6-4&from=paste&height=583&id=ua3a519e9&originHeight=700&originWidth=1828&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=136520&status=done&style=none&taskId=ufc4cec7a-9688-4cb0-b3d7-540078c6de8&title=&width=1523.3332728015075)
## 3.2 一个简单的案例

- 依赖：注意需要跟你的版本进行对应
```xml
<dependency>
  <groupId>org.apache.thrift</groupId>
  <artifactId>libthrift</artifactId>
  <version>0.19.0</version>
</dependency>

<dependency>
  <groupId>org.slf4j</groupId>
  <artifactId>slf4j-api</artifactId>
  <version>1.7.30</version>
</dependency>
<!-- https://mvnrepository.com/artifact/ch.qos.logback/logback-classic -->
<dependency>
  <groupId>ch.qos.logback</groupId>
  <artifactId>logback-classic</artifactId>
  <version>1.2.3</version>
</dependency>

```

- 实现类：主要是你需要实现的业务逻辑
```java
package com.shu;

import org.apache.thrift.TException;

/**
 * @author : EasonShu
 * @date : 2024/1/28 9:38
 * @Version: 1.0
 * @Desc : person service
 */
public class PersonServiceImpl implements PersonService.Iface{
    @Override
    public PersonModel getPersonInfoByUserNmae(String username) throws PersonException, TException {
        System.out.println("getPersonInfoByUserNmae"+username);
        PersonModel personModel = new PersonModel();
        personModel.setId("1");
        personModel.setUserName(username);
        return personModel;
    }

    @Override
    public boolean IsCheck(String username) throws TException {
        System.out.println("IsCheck"+username);
        return false;
    }
}
```

- 服务启动类：
```java
package com.shu;

import org.apache.thrift.TProcessorFactory;
import org.apache.thrift.protocol.TCompactProtocol;
import org.apache.thrift.server.THsHaServer;
import org.apache.thrift.server.TServer;
import org.apache.thrift.transport.TNonblockingServerSocket;
import org.apache.thrift.transport.TTransportException;
import org.apache.thrift.transport.layered.TFastFramedTransport;

/**
 * @author : EasonShu
 * @date : 2024/1/28 9:42
 * @Version: 1.0
 * @Desc :
 */
public class PersonThriftServer {
    public static void main(String[] args) throws TTransportException {
        // 建立连接
        TNonblockingServerSocket serverSocket =new TNonblockingServerSocket(8803);
        // 建立高可用server
        THsHaServer.Args arg=new THsHaServer.Args(serverSocket).maxWorkerThreads(4).minWorkerThreads(2);
        // 处理器
        PersonService.Processor processor = new PersonService.Processor(new PersonServiceImpl());
        // 设置协议处理器
        arg.protocolFactory(new TCompactProtocol.Factory());
        // 设置传输处理器
        arg.transportFactory(new TFastFramedTransport.Factory());
        // 处理器工厂
        arg.processorFactory(new TProcessorFactory(processor));
        // 开始执行
        TServer tServer = new THsHaServer(arg);
        System.out.println("Running Simple Server");
        tServer.serve();
    }
}
```

- 客户端启动类
```java
package com.shu;

import org.apache.thrift.TException;
import org.apache.thrift.protocol.TCompactProtocol;
import org.apache.thrift.protocol.TProtocol;
import org.apache.thrift.transport.TSocket;
import org.apache.thrift.transport.TTransport;
import org.apache.thrift.transport.layered.TFramedTransport;

/**
 * @author : EasonShu
 * @date : 2024/1/28 9:46
 * @Version: 1.0
 * @Desc : PersonThriftClient
 */
public class PersonThriftClient {
    public static void main(String[] args) {
        TTransport transport =null;
        try {
            // 连接
            transport = new TFramedTransport(new TSocket("127.0.0.1",8803),600);
            // 协议,注意服务端保持一致
            TProtocol protocol = new TCompactProtocol(transport);
            // 调用方法
            PersonService.Client client = new PersonService.Client(protocol);
            // 打开连接
            transport.open();
            // 调用方法
            PersonModel result = client.getPersonInfoByUserNmae("shu");
            System.out.println("Result =: " + result);
        } catch (TException e) {
            e.printStackTrace();
        } finally {
            if (null != transport) {
                transport.close();
            }
        }
    }
}

```

- 测试结果：

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1706406540590-7d1d5cfa-6622-4d51-8f11-9f6079bc61dd.png#averageHue=%23232529&clientId=ua40b781c-61a6-4&from=paste&height=274&id=ue0e5267a&originHeight=329&originWidth=1491&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=27619&status=done&style=none&taskId=ue758a62e-de7c-43e6-bee4-cdba80277ed&title=&width=1242.4999506274878)
## 3.3 关键知识讲解
![](https://cdn.nlark.com/yuque/0/2024/webp/12426173/1706372449836-611bef08-1bb1-4eb5-b575-d92876474a7b.webp?x-oss-process=image%2Fresize%2Cw_720%2Climit_0#averageHue=%23e0c399&from=url&id=kVKO8&originHeight=551&originWidth=720&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&title=)
结合上面的架构图看
### Thrift的协议
Thrift可以让用户选择**客户端**与**服务端**之间**传输通信协议**的类别，在**传输协议**上总体划分为**文本**(text)和**二进制**(binary)传输协议。为**节约带宽**，**提高传输效率**，一般情况下使用**二进制**类型的传输协议为多数，有时还会使用基于**文本类型**的协议，这需要根据项目/产品中的实际需求。常用协议有以下几种：

- TBinaryProtocol：**二进制**编码格式进行数据传输
- TCompactProtocol：**高效率**的、**密集**的**二进制**编码格式进行数据传输
- TJSONProtocol： 使用JSON**文本**的数据编码协议进行数据传输
- TSimpleJSONProtocol：只提供JSON**只写**的协议，适用于通过**脚本语言解析**
### Thrift的传输层
常用的传输层有以下几种：

- TSocket：使用**阻塞式**I/O进行传输，是最常见的模式
- TNonblockingTransport：使用**非阻塞方式**，用于构建**异步客户端**
- TFramedTransport：使用**非阻塞方式**，按**块的大小**进行传输，类似于Java中的NIO
### Thrift的服务端类型

- TSimpleServer：**单线程**服务器端，使用标准的**阻塞式**I/O
- TThreadPoolServer：**多线程**服务器端，使用标准的**阻塞式**I/O
- TNonblockingServer：**单线程**服务器端，使用**非阻塞式**I/O
- THsHaServer：**半同步半异步**服务器端，基于**非阻塞式**IO读写和**多线程**工作任务处理
- TThreadedSelectorServer：**多线程选择器**服务器端，对THsHaServer在**异步**IO模型上进行增强
## 3.4 基本语法详解
### 3.4.1 基本数据类型
```xml
bool: A boolean value (true or false)
byte: An 8-bit signed integer
i16: A 16-bit signed integer
i32: A 32-bit signed integer
i64: A 64-bit signed integer
double: A 64-bit floating point number
string: A text string encoded using UTF-8 encoding

// 定义别名:将thrift基本数据类型别名为Java数据类型，方便使用
typedef i16 short
typedef i32 int
typedef i64 long
typedef string String
typedef bool  Boolean
typedef double Double

```

- 基本上与Java语法差不多，理解起来很简单
### 3.4.2 复杂结构
```xml
list: An ordered list of elements. Translates to an STL vector, Java ArrayList, native arrays in scripting languages, etc.
set: An unordered set of unique elements. Translates to an STL set, Java HashSet, set in Python, etc. Note: PHP does not support sets, so it is treated similar to a List
map: A map of strictly unique keys to values. Translates to an STL map, Java HashMap, PHP associative array, Python/Ruby dictionary, etc. While defaults are provided, the type mappings are not explicitly fixed. Custom code generator directives have been added to allow substitution of custom types in various destination languages
list<t>：元素类型为t的有序表，容许元素重复。对应java的ArrayList
set<t>：元素类型为t的无序表，不容许元素重复。对应java的HashSet
map<t,t>：键类型为t，值类型为t的kv对，键不容许重复。对对应Java的HashMap
```

- 其实就是容器，list set map
### 3.4.3 struct

- 用来定义一个类。
- struct 不能继承，但是可以嵌套，不能嵌套自己,其成员都是有明确类型。
- 成员是被正整数编号过的，其中的编号使不能重复的，这个是为了在传输过程中编码使用。
- 成员分割符可以是逗号（,）或是分号（;），而且可以混用，但是为了清晰期间，比如java学习者可以就使用逗号（;）。
- 字段会有optional和required之分。
- 每个字段可以设置默认值。
- 同一文件可以定义多个struct，也可以定义在不同的文件，进行include引入。
```xml
// 定义一个struct:相当于Java中的类
struct person{
  	1: required string name; // 必须字段，很明确
    2: required i64 age;
    3: optional string addr; // 可选字段
    4: optional string defaultValue = "DEFAULT"; // 默认字段
    5: string otherValue; // 不是很明确!
}
```
### 3.4.4 service

- 可以把他理解为方法的集合。
- 服务的定义方法在语义上等同于面向对象语言中的接口。Thrift 编译器会产生执行这些接口的 client 和 server 存根（详情下一节会具体描述）。
```xml
// 定义一个异常
exception personexception{
1:optional int code;
2:optional String message;
}

// 定义一个服务集合
service personservice{

 // 通过用户名获取信息,并扔出异常
 person getPersonInfoByUserNmae(1:required String username) throws (1: personexception exce )

 // 通过用户名检查是否可用
 Boolean IsCheck(1:required String username)

}
```
### 3.4.5 exception
关于异常，在[Thrift](https://so.csdn.net/so/search?q=Thrift&spm=1001.2101.3001.7020)中就像定义 struct 一样，因为exception从概念上讲，也是一种class，所谓『万事万物皆对象』嘛。不过现在我们用『exception』这个关键字，也正好符合我前文所讲的，清晰的语义。
```xml
// 定义一个异常
exception personexception{
1:optional int code;
2:optional String message;
}
```
### 3.4.6 枚举
枚举这个东西，真的是太重要了，和前面的exception类似，它也不过是一种class而已。不过Thrift中只支持枚举 int 值，比较遗憾，其实很多时候，对枚举的要求，我们是很丰富的，比如支持 枚举 string。Thrift中枚举如下：
```xml
enum Operation { // 功能着实比较孱弱
  ADD = 1,
  SUBTRACT = 2,
  MULTIPLY = 3,
  DIVIDE = 4
}
```
### 3.4.5  namespace
定义生成文件的包名。
Thrift 中的命名空间类似于 java 中的 package，它们提供了一种组织（隔离）代码的简便方式。名字空间也可以用于解决类型定义中的名字冲突。
```xml
namespace java com.shu.demo.thrift

```
### 3.4.6 typedef
将基本数据类型取别名
```xml
// 定义别名:将thrift基本数据类型别名为Java数据类型，方便使用
typedef i16 short
typedef i32 int
typedef i64 long
typedef string String
typedef bool  Boolean
typedef double Double
```
