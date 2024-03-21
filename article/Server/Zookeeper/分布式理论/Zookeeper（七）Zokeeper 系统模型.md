---
title: Zookeeper（七）Zokeeper 系统模型
sidebar_position: 8
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
# 一 数据模型

- ZooKeeper的视图结构和标准的Unix文件系统非常类似，但没有引入传统文件系统中目录和文件等相关概念，而是使用了其特有的“数据节点”概念，我们称之为ZNode。
## 1.1 树

- 在ZooKeeper中，每一个数据节点都被称为一个ZNode，所有ZNode按层次化结构进行组织，形成一棵树。
- ZNode的节点路径标识方式和Unix文件系统路径非常相似，都是由一系列使用斜杠(/)进行分割的路径表示，开发人员可以向这个节点中写入数据，也可以在节点下面创建子节点。

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710934851675-fbd1f797-1256-4cb6-9ebf-06de440d3f4b.png#averageHue=%23fafafa&clientId=uf172602a-6615-4&from=paste&height=351&id=u149c6690&originHeight=439&originWidth=1718&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=133793&status=done&style=none&taskId=ufbb223be-7d39-4681-baf5-bb4762be4af&title=&width=1374.4)
## 1.2 事务ID

- 在ZooKeeper中，事务是指能够改变ZooKeeper服务器状态的操作，我们也称之为事务操作或更新操作，一般包括数据节点创建与删除、数据节点内容更新和客户端会话创建与失效等操作。
- 对于每一个事务请求，ZooKeeper都会为其分配一个全局唯一的事务ID，用ZXID来表示，通常是一个64位的数字，每一个ZXID对应一次更新操作，从这些ZXID中可以间接地识别出ZooKeeper处理这些更新操作请求的全局顺序。
## 1.3 节点特性

- 在ZooKeeper中，每个数据节点都是有生命周期的，其生命周期的长短取决于数据节点的节点类型。
- 在ZooKeeper中，节点类型可以分为持久节点(PERSISTENT)、临时节点(EPHEMERAL)和顺序节点(SEQUENTIAL)三大类。
> 持久节点(PERSISTENT)

持久节点是ZooKeeper中最常见的一种节点类型。所谓持久节点，是指该数据节点被创建后，就会一直存在于ZooKeeper服务器上，直到有删除操作来主动清除这个节点。
> 持久顺序节点(PERSISTENT_SEQUENTIAL)

- 持久顺序节点的基本特性和持久节点是一致的，额外的特性表现在顺序性上。在ZooKeeper中，每个父节点都会为它的第一级子节点维护一份顺序，用于记录下每个子节点创建的先后顺序。
- 基于这个顺序特性，在创建子节点的时候，可以设置这个标记，那么在创建节点过程中，ZooKeeper会自动为给定节点名加上一个数字后缀，作为一个新的、完整的节点名，另外需要注意的是，这个数字后缀的上限是整型的最大值。
> 临时节点(EPHEMERAL)

和持久节点不同的是，临时节点的生命周期和客户端的会话绑定在一起，也就是说，如果客户端会话失效，那么这个节点就会被自动清理掉。注意，这里提到的是客户端会话失效，而非TCP连接断开。
> 临时顺序节点(EPHEMERAL_SEQUENTIAL)

临时顺序节点的基本特性和临时节点也是一致的，同样是在临时节点的基础上，添加了顺序的特性。
> 状态信息

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710935196697-c3f9bb94-ae86-4375-9f43-5baa026b1d70.png#averageHue=%23e6e6e6&clientId=uf172602a-6615-4&from=paste&height=396&id=uf6f8e00e&originHeight=495&originWidth=1029&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=200157&status=done&style=none&taskId=u83218f83-13f6-42f2-aab7-8b1eb608572&title=&width=823.2)
## 1.4 版本（乐观锁CAS）
ZooKeeper中为数据节点引入了版本的概念，每个数据节点都具有三种类型的版本信息，对数据节点的任何更新操作都会引起版本号的变化
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710935275185-62e5edc9-2387-4d6c-a318-64839c2ad93a.png#averageHue=%23e4e4e4&clientId=uf172602a-6615-4&from=paste&height=138&id=ue99be4e5&originHeight=173&originWidth=1046&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=44194&status=done&style=none&taskId=u9bea4704-87fd-434c-a137-7baceace98a&title=&width=836.8)

- ZooKeeper中的版本概念和传统意义上的软件版本有很大的区别，它表示的是对数据节点的数据内容、子节点列表，或是节点ACL信息的修改次数，我们以其中的version这种版本类型为例来说明。
- 在一个数据节点/zk-book被创建完毕之后，节点的version值是0，表示的含义是“当前节点自从创建之后，被更新过0次”，如果现在对该节点的数据内容进行更新操作，那么随后，version的值就会变成1。
- 同时需要注意的是，在上文中提到的关于version的说明，其表示的是对数据节点数据内容的变更次数，强调的是变更次数，因此即使前后两次变更并没有使得数据内容的值发生变化，version的值依然会变更。
## 1.5 Watcher数据变更的通知

- ZooKeeper提供了分布式数据的发布/订阅功能。一个典型的发布/订阅模型系统定义了一种一对多的订阅关系，能够让多个订阅者同时监听某一个主题对象，当这个主题对象自身状态变化时，会通知所有订阅者，使它们能够做出相应的处理。
- 在ZooKeeper中，引入了Watcher机制来实现这种分布式的通知功能，ZooKeeper允许客户端向服务端注册一个Watcher监听，当服务端的一些指定事件触发了这个Watcher，那么就会向指定客户端发送一个事件通知来实现分布式的通知功能。
- 简单地讲，客户端在向ZooKeeper服务器注册Watcher的同时，会将Watcher对象存储在客户端的WatchManager中。
- 当ZooKeeper服务器端触发Watcher事件后，会向客户端发送通知，客户端线程从WatchManager中取出对应的Watcher对象来执行回调逻辑。
> Watch接口

在ZooKeeper中，接口类Watcher用于表示一个标准的事件处理器，其定义了事件通知相关的逻辑，包含KeeperState和EventType两个枚举类，分别代表了通知状态和事件类型，同时定义了事件的回调方法：process(WatchedEvent event)。
> 事件类型

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710936480766-abd7b9e3-fab9-4efa-ae34-8d5a0ad242bb.png#averageHue=%23eeeeee&clientId=uf172602a-6615-4&from=paste&height=658&id=u921008a5&originHeight=823&originWidth=1058&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=255175&status=done&style=none&taskId=u38ce2396-8918-4fe0-b5f7-19e911b0898&title=&width=846.4)
具体逻辑后面我们详细介绍
## 1.6 ACL权限控制
ACL，即访问控制列表，是一种相对来说比较新颖且更细粒度的权限管理方式，可以针对任意用户和组进行细粒度的权限控制。
ZooKeeper的ACL权限控制和Unix/Linux操作系统中的ACL有一些区别，读者可以从三个方面来理解ACL机制，分别是：权限模式(Scheme)、授权对象(ID)和权限(Permission)，通常使用“scheme：id：permission”来标识一个有效的ACL信息。
> IP

- IP模式通过IP地址粒度来进行权限控制，例如配置了“ip：192.168.0.110”，即表示权限控制都是针对这个IP地址的。
- 同时，IP模式也支持按照网段的方式进行配置，例如“ip：192.168.0.1/24”表示针对192.168.0.*这个IP段进行权限控制。
> Digest

- Digest是最常用的权限控制模式，也更符合我们对于权限控制的认识，其以类似于“username：password”形式的权限标识来进行权限配置，便于区分不同应用来进行权限控制。
- 当我们通过“username：password”形式配置了权限标识后，ZooKeeper会对其先后进行两次编码处理，分别是SHA-1算法加密和BASE64编码，其具体实现DigestAuthenticationProvider.generateDigest(String idPassword)函数进行封装
> World

World是一种最开放的权限控制模式，从其名字中也可以看出，事实上这种权限控制方式几乎没有任何作用，数据节点的访问权限对所有用户开放，即所有用户都可以在不进行任何权限校验的情况下操作ZooKeeper上的数据。另外，World模式也可以看作是一种特殊的Digest模式，它只有一个权限标识，即“world：anyone”。
> Super

Super模式，顾名思义就是超级用户的意思，也是一种特殊的Digest模式。在Super模式下，超级用户可以对任意ZooKeeper上的数据节点进行任何操作。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710987110311-8151a492-e443-48f8-a2d2-b629f0b90d77.png#averageHue=%23e9e9e9&clientId=u3e6df1e8-91ab-4&from=paste&height=200&id=u491269a0&originHeight=200&originWidth=920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=49038&status=done&style=none&taskId=u6d68638f-6032-45d2-938d-9d0d1a3645c&title=&width=920)
> 权限标识

- CREATE(C)：数据节点的创建权限，允许授权对象在该数据节点下创建子节点。
- DELETE(D)：子节点的删除权限，允许授权对象删除该数据节点的子节点。
- READ(R)：数据节点的读取权限，允许授权对象访问该数据节点并读取其数据内容或子节点列表等。· 
- WRITE(W)：数据节点的更新权限，允许授权对象对该数据节点进行更新操作。
- ADMIN(A)：数据节点的管理权限，允许授权对象对该数据节点进行ACL相关的设置操作。
