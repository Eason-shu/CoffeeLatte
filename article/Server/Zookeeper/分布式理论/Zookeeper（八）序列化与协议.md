---
title: Zookeeper（八）序列化与协议
sidebar_position: 9
keywords:
  - 微服务
  - 源码分析
tags:
  - 源码分析
  - Java
  - 框架
  - 微服务
  - 学习笔记
last_update:
  date: 2024-02-17
  author: EasonShu
---

- 官网：[Apache ZooKeeper](http://zookeeper.apache.org)
# 一 序列化与反序列化
对于一个网络通信，首先需要解决的就是对数据的序列化和反序列化处理，在ZooKeeper中，使用了**Jute**这一序列化组件来进行数据的序列化和反序列化操作。
## 1.1 Jute序列化工具
Zookeeper的客户端与服务端之间会进行一系列的网络通信来实现数据传输，Zookeeper使用Jute组件来完成数据的序列化和反序列化操作，其用于Zookeeper进行网络数据传输和本地磁盘数据存储的序列化和反序列化工作。
实体类要使用Jute进行序列化和反序列化步骤：

- 1.需要实现Record接口的serialize和deserialize方法；
- 2.构建一个序列化器BinaryOutputArchive；
- 3.序列化:调用实体类的serialize方法，将对象序列化到指定的tag中去，比如这里将对象序列化到header中；
- 4.反序列化:调用实体类的deserialize方法，从指定的tag中反序列化出数据内容。
```java
package com.shu.jute;

import org.apache.jute.InputArchive;
import org.apache.jute.OutputArchive;
import org.apache.jute.Record;

/**
 * @author 31380
 * @description MockReHeader
 * @create 2024/3/21 14:10
 */
public class MockReHeader implements Record {
    private long sessionId;
    private String type;
    public MockReHeader() {}

    public MockReHeader(long sessionId, String type) {
        this.sessionId = sessionId;
        this.type = type;
    }

    public void setSessionId(long sessionId) {
        this.sessionId = sessionId;
    }

    public void setType(String type) {
        this.type = type;
    }

    public long getSessionId() {
        return sessionId;
    }

    public String getType() {
        return type;
    }

    public void serialize(OutputArchive outputArchive, String tag) throws java.io.IOException {
        outputArchive.startRecord(this, tag);
        outputArchive.writeLong(sessionId, "sessionId");
        outputArchive.writeString(type, "type");
        outputArchive.endRecord(this, tag);
    }

    public void deserialize(InputArchive inputArchive, String tag) throws java.io.IOException {
        inputArchive.startRecord(tag);
        this.sessionId = inputArchive.readLong("sessionId");
        this.type = inputArchive.readString("type");
        inputArchive.endRecord(tag);
    }

    @Override
    public String toString() {
        return "sessionId = " + sessionId + ", type = " + type;
    }
}
```
```java
package com.shu.jute;

import org.apache.jute.BinaryInputArchive;
import org.apache.jute.BinaryOutputArchive;
import org.apache.zookeeper.server.ByteBufferInputStream;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;

/**
 * @author 31380
 * @description
 * @create 2024/3/21 14:11
 */
public class JuteTest {
    public static void main(String[] args) throws IOException {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        BinaryOutputArchive binaryOutputArchive = BinaryOutputArchive.getArchive(byteArrayOutputStream);
        new MockReHeader(0x3421eccb92a34el, "ping").serialize(binaryOutputArchive, "header");
        ByteBuffer byteBuffer = ByteBuffer.wrap(byteArrayOutputStream.toByteArray());
        ByteBufferInputStream byteBufferInputStream = new ByteBufferInputStream(byteBuffer);
        BinaryInputArchive binaryInputArchive = BinaryInputArchive.getArchive(byteBufferInputStream);
        MockReHeader mockReHeader = new MockReHeader();
        System.out.println(mockReHeader);
        mockReHeader.deserialize(binaryInputArchive, "header");
        System.out.println(mockReHeader);
        byteBufferInputStream.close();
        byteArrayOutputStream.close();
    }

}

```
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1711001606628-e8e43930-ff72-4868-8bfe-e9806b3a911e.png#averageHue=%23202225&clientId=u8aa0ba95-7e1d-4&from=paste&height=353&id=u1f2eb520&originHeight=353&originWidth=1795&originalType=binary&ratio=1&rotation=0&showTitle=false&size=22683&status=done&style=none&taskId=u2a82545f-ec85-47cb-b214-b8103513dea&title=&width=1795)
### 1.1 Recor接口
Zookeeper中所需要进行网络传输或是本地磁盘存储的类型定义，都实现了该接口，是Jute序列化的核心。Record定义了两个基本的方法，分别是serialize和deserialize，分别用于序列化和反序列化。其中archive是底层真正的序列化器和反序列化器，并且每个archive中可以包含对多个对象的序列化和反序列化，因此两个接口中都标记了参数tag，用于序列化器和反序列化器标识对象自己的标记。
### 1.2 OutputArchive和InputArchive

- OutputArchive和InputArchive分别是Jute底层的序列化器和反序列化器定义。有BinaryOutputArchive/BinaryInputArchive、CsvOutputArchive/CsvInputArchive和XmlOutputArchive/XmlInputArchive三种实现，无论哪种实现都是基于OutputStream和InputStream进行操作。
- BinaryOutputArchive对数据对象的序列化和反序列化，主要用于进行网络传输和本地磁盘的存储，是Zookeeper底层最主要的序列化方式。CsvOutputArchive对数据的序列化，更多的是方便数据的可视化展示，因此被用在toString方法中。XmlOutputArchive则是为了将数据对象以xml格式保存和还原，但目前在Zookeeper中基本没使用到。

**注意：在最新版本的ZooKeeper中，底层依然使用了Jute这个古老的，并且似乎没有更多其他系统在使用的序列化组件。**
# 二 通信协议
基于TCP/IP协议，ZooKeeper实现了自己的通信协议来完成客户端与服务端、服务端与服务端之间的网络通信。ZooKeeper通信协议整体上的设计非常简单，对于请求，主要包含请求头和请求体，而对于响应，则主要包含响应头和响应体
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1711001951002-2eeaff19-5ef4-4b63-84e1-7e5441a5a237.png#averageHue=%23f6f6f6&clientId=u8aa0ba95-7e1d-4&from=paste&height=203&id=u3bd0f617&originHeight=203&originWidth=1584&originalType=binary&ratio=1&rotation=0&showTitle=false&size=24364&status=done&style=none&taskId=u5f482e03-a685-42d0-b55a-24a1cac37de&title=&width=1584)
## 2.1 请求部分
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1711002003429-382938d9-8dde-4fa1-99f6-b2337c6ed7a5.png#averageHue=%23f7f7f7&clientId=u8aa0ba95-7e1d-4&from=paste&height=137&id=u5750a2e7&originHeight=137&originWidth=900&originalType=binary&ratio=1&rotation=0&showTitle=false&size=34771&status=done&style=none&taskId=u837737d3-fc2f-4e79-81ba-705b32a960e&title=&width=900)
我们将从请求头和请求体两方面分别解析ZooKeeper请求的协议设计
### 2.1.1 请求头
```java
class RequestHeader {
        int xid;
        int type;
 }
```
 从zookeeper.jute中可知RequestHeader包含了xid和type，xid用于记录客户端请求发起的先后序号，用来确保单个客户端请求的响应顺序，type代表请求的操作类型，如创建节点（OpCode.create）、删除节点（OpCode.delete）、获取节点数据（OpCode.getData）。 
### 2.2.2 请求体
协议的请求体部分是指请求的主体内容部分，包含了请求的所有操作内容。
> ConnectRequest：会话创建

```java
class ConnectRequest {
        int protocolVersion;
        long lastZxidSeen;
        int timeOut;
        long sessionId;
        buffer passwd;
    }
```
 Zookeeper客户端和服务器在创建会话时，会发送ConnectRequest请求，该请求包含协议版本号protocolVersion、最近一次接收到服务器ZXID lastZxidSeen、会话超时时间timeOut、会话标识sessionId和会话密码passwd。
> GetDataRequest：获取节点数据

```java
 class GetDataRequest {
        ustring path;
        boolean watch;
}
```
ZooKeeper客户端在向服务器发送获取节点数据请求的时候，会发送GetDataRequest请求，该请求体中包含了数据节点的节点路径path和是否注册Watcher的标识watch
> SetDataRequest：更新节点数据

```java
 class SetDataRequest {
        ustring path;
        buffer data;
        int version;
}
```
ZooKeeper客户端在向服务器发送更新节点数据请求的时候，会发送SetDataRequest请求，该请求体中包含了数据节点的节点路径path、数据内容data和节点数据的期望版本号version
### 2.1.3 案例分析

- 发出请求获取数据

我们获取到了ZooKeeper客户端请求发出后，在TCP层数据传输的十六进制表示，其中带下划线的部分就是对应的GetDataRequest请求，即[00，00，00，1d，00，00，00，01，00，00，00，04，00，00，00，10，2f，24，37，5f，32，5f，34，2f，67，65，74，5f，64，61，74，61，01]，GetDataRequest请求的完整协议定义，我们来分析下这个十六进制字节数组的含义
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1711002467054-e8e35d60-98f4-49a4-aa02-ad3388b4134f.png#averageHue=%23e7e7e7&clientId=u8aa0ba95-7e1d-4&from=paste&height=289&id=u37d97981&originHeight=289&originWidth=850&originalType=binary&ratio=1&rotation=0&showTitle=false&size=96406&status=done&style=none&taskId=u4b11cadf-d191-4b26-9929-34ba01fdf21&title=&width=850)
## 2.2 响应部分
获取节点数据响应的完整协议定义
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1711002593115-2f77a07d-cc6e-4f21-8256-09611873a60e.png#averageHue=%23f4f4f4&clientId=u8aa0ba95-7e1d-4&from=paste&height=341&id=u64c9fd96&originHeight=341&originWidth=851&originalType=binary&ratio=1&rotation=0&showTitle=false&size=124624&status=done&style=none&taskId=u362b0587-6693-4455-9e27-9c428baecad&title=&width=851)
### 2.2.1 响应头
```java
 class ReplyHeader {
        int xid;
        long zxid;
        int err;
    }
```
 xid与请求头中的xid一致，zxid表示Zookeeper服务器上当前最新的事务ID，err则是一个错误码，表示当请求处理过程出现异常情况时，就会在错误码中标识出来，常见的包括处理成功（Code.OK）、节点不存在（Code.NONODE）、没有权限（Code.NOAUTH）。
### 2.2.2 响应内容
协议的响应主体内容部分，包含了响应的所有数据，不同的响应类型请求体不同。
> ConnectResponse：会话创建

```java
 class ConnectResponse {
        int protocolVersion;
        int timeOut;
        long sessionId;
        buffer passwd;
 }
```
针对客户端的会话创建请求，服务端会返回客户端一个ConnectResponse响应，该响应体中包含了协议的版本号protocolVersion、会话的超时时间timeOut、会话标识sessionId和会话密码passwd
> GetDataResponse：获取节点数据

```java
 class GetDataResponse {
        buffer data;
        org.apache.zookeeper.data.Stat stat;
}
```
针对客户端的获取节点数据请求，服务端会返回客户端一个GetDataResponse响应，该响应体中包含了数据节点的数据内容data和节点状态stat
![](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710935196697-c3f9bb94-ae86-4375-9f43-5baa026b1d70.png?x-oss-process=image%2Fformat%2Cwebp%2Fresize%2Cw_750%2Climit_0#averageHue=%23e6e6e6&from=url&id=B44rF&originHeight=361&originWidth=750&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)
> SetDataResponse：更新节点数据

```java
 class SetDataResponse {
        org.apache.zookeeper.data.Stat stat;
 }
```
针对客户端的更新节点数据请求，服务端会返回客户端一个SetDataResponse响应，该响应体中包含了最新的节点状态stat
### 2.2.3 案例分析
我们获取到了ZooKeeper服务端响应发出之后，在TCP层数据传输的十六进制表示，其中带下划线的部分就是对应的GetDataResponse响应，即[00，00，00，63，00，00，00，05，00，00，00，00，00，00，00，04，00，00，00，00，00，00，00，0b，69，27，6d，5f，63，6f，6e，74，65，6e，74，00，00，00，00，00，00，00，04，00，00，00，00，00，00，00，04，00，00，01，43，67，bd，0e，08，00，00，01，43，67，bd，0e，08，00，00，00，00，00，00，00，00，00，00，00，00，00，00，00，00，00，00，00，00，00，00，00，0b，00，00，00，00，00，00，00，00，00，00，00，04]。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1711002938762-60df0722-2754-4afc-ba9b-d261f20f122f.png#averageHue=%23ebebeb&clientId=uf406a52e-aa4a-4&from=paste&height=461&id=ufe80141a&originHeight=461&originWidth=888&originalType=binary&ratio=1&rotation=0&showTitle=false&size=150553&status=done&style=none&taskId=u10af6e29-3a40-4575-8634-ca797e13ac1&title=&width=888)
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1711002949147-d6cbd9f5-d4d2-4a49-92bd-326dca81492c.png#clientId=uf406a52e-aa4a-4&from=paste&height=453&id=u9cce2f62&originHeight=453&originWidth=859&originalType=binary&ratio=1&rotation=0&showTitle=false&size=143448&status=done&style=none&taskId=ub54e3a5d-9658-4a4d-892f-84ab4c170d2&title=&width=859)
