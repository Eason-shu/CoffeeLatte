---
title: Zookeeper（四） 基本介绍与ZAB协议
sidebar_position: 5
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

# 一 初识Zookeeper
## 1.1 介绍

- ZooKeeper是一个开放源代码的分布式协调服务，由知名互联网公司雅虎创建，是Google Chubby的开源实现。ZooKeeper的设计目标是将那些复杂且容易出错的分布式一致性服务封装起来，构成一个高效可靠的原语集，并以一系列简单易用的接口提供给用户使用。
- ZooKeeper是一个典型的分布式数据一致性的解决方案，分布式应用程序可以基于它实现诸如数据发布/订阅、负载均衡、命名服务、分布式协调/通知、集群管理、Master选举、分布式锁和分布式队列等功能。
## 1.2 特征

- 顺序一致性：从同一个客户端发起的事务请求，最终将会严格地按照其发起顺序被应用到ZooKeeper中去。
- 原子性：所有事务请求的处理结果在整个集群中所有机器上的应用情况是一致的，也就是说，要么整个集群所有机器都成功应用了某一个事务，要么都没有应用，一定不会出现集群中部分机器应用了该事务，而另外一部分没有应用的情况。
- 单一视图(Single System Image)：无论客户端连接的是哪个ZooKeeper服务器，其看到的服务端数据模型都是一致的。
- 可靠性：一旦服务端成功地应用了一个事务，并完成对客户端的响应，那么该事务所引起的服务端状态变更将会被一直保留下来，除非有另一个事务又对其进行了变更。
- 实时性：通常人们看到实时性的第一反应是，一旦一个事务被成功应用，那么客户端能够立即从服务端上读取到这个事务变更后的最新数据状态。这里需要注意的是，ZooKeeper仅仅保证在一定的时间段内，客户端最终一定能够从服务端上读取到最新的数据状态。
## 1.3 基本概念
### 1.3.1 集群角色

- 通常在分布式系统中，构成一个集群的每一台机器都有自己的角色，最典型的集群模式就是Master/Slave模式（主备模式）。在这种模式中，我们把能够处理所有写操作的机器称为Master机器，把所有通过异步复制方式获取最新数据，并提供读服务的机器称为Slave机器。
- 而在ZooKeeper中，这些概念被颠覆了。它没有沿用传统的Master/Slave概念，而是引入了**Leader、Follower和Observer**三种角色。ZooKeeper集群中的所有机器通过一个Leader选举过程来选定一台被称为“Leader”的机器，Leader服务器为客户端提供读和写服务。
### 1.3.2 会话

- Session是指客户端会话，在讲解会话之前，我们首先来了解一下客户端连接。在ZooKeeper中，一个客户端连接是指客户端和服务器之间的一个TCP长连接。ZooKeeper对外的服务端口默认是2181，客户端启动的时候，首先会与服务器建立一个TCP连接，从第一次连接建立开始，客户端会话的生命周期
- 也开始了，通过这个连接，客户端能够通过心跳检测与服务器保持有效的会话，也能够向ZooKeeper服务器发送请求并接受响应，同时还能够通过该连接接收来自服务器的Watch事件通知。
### 1.3.3 数据节点(Znode)

- 节点”分为两类，第一类同样是指构成集群的机器，我们称之为机器节点；第二类则是指数据模型中的数据单元，我们称之为数据节点——ZNode。
- ZooKeeper将所有数据存储在内存中，数据模型是一棵树(ZNode Tree)，由斜杠(/)进行分割的路径，就是一个Znode，例如/foo/path1。每个ZNode上都会保存自己的数据内容，同时还会保存一系列属性信息。在ZooKeeper中，ZNode可以分为持久节点和临时节点两类。
- 所谓持久节点是指一旦这个ZNode被创建了，除非主动进行ZNode的移除操作，否则这个ZNode将一直保存在ZooKeeper上。
- 而临时节点就不一样了，它的生命周期和客户端会话绑定，一旦客户端会话失效，那么这个客户端创建的所有临时节点都会被移除。
- 另外，ZooKeeper还允许用户为每个节点添加一个特殊的属性：SEQUENTIAL。一旦节点被标记上这个属性，那么在这个节点被创建的时候，ZooKeeper会自动在其节点名后面追加上一个整型数字，这个整型数字是一个由父节点维护的自增数字
### 1.3.4 版本
ZooKeeper的每个ZNode上都会存储数据，对应于每个ZNode，ZooKeeper都会为其维护一个叫作Stat的数据结构，Stat中记录了这个ZNode的三个数据版本，分别是version（当前ZNode的版本）、cversion（当前ZNode子节点的版本）和aversion（当前ZNode的ACL版本）。
### 1.3.5 Watcher
Watcher（事件监听器），是ZooKeeper中的一个很重要的特性。ZooKeeper允许用户在指定节点上注册一些Watcher，并且在一些特定事件触发的时候，ZooKeeper服务端会将事件通知到感兴趣的客户端上去，该机制是ZooKeeper实现分布式协调服务的重要特性。
### 1.3.6 ACL

- ZooKeeper采用ACL(Access Control Lists)策略来进行权限控制，类似于UNIX文件系统的权限控制。ZooKeeper定义了如下5种权限。
- · CREATE：创建子节点的权限。· READ：获取节点数据和子节点列表的权限。· WRITE：更新节点数据的权限。· DELETE：删除子节点的权限。· ADMIN：设置节点ACL的权限。其中尤其需要注意的是，CREATE和DELETE这两种权限都是针对子节点的权限控制。
# 二 ZAB协议

- ZAB协议是为分布式协调服务ZooKeeper专门设计的一种支持崩溃恢复的原子广播协议。
- ZAB协议的开发设计人员在协议设计之初并没有要求其具有很好的扩展性，最初只是为雅虎公司内部那些高吞吐量、低延迟、健壮、简单的分布式系统场景设计的。
- 在ZooKeeper的官方文档中也指出，ZAB协议并不像Paxos算法那样，是一种通用的分布式一致性算法，它是一种特别为ZooKeeper设计的崩溃可恢复的原子消息广播算法。
## 2.1 核心
Zab协议的核心：**定义了事务请求的处理方式**

1. 所有的事务请求必须由一个全局唯一的服务器来协调处理，这样的服务器被叫做 **Leader服务器**。其他剩余的服务器则是 **Follower服务器**。
2. Leader服务器 负责将一个客户端事务请求，转换成一个 **事务Proposal**，并将该 Proposal 分发给集群中所有的 Follower 服务器，也就是向所有 Follower 节点发送数据广播请求（或数据复制）
3. 分发之后Leader服务器需要等待所有 Follower 服务器的反馈（Ack请求），**在Zab协议中，只要超过半数的Follower服务器进行了正确的反馈**后（也就是收到半数以上的Follower的Ack请求），那么 Leader 就会再次向所有的 Follower服务器发送 Commit 消息，要求其将上一个 事务proposal 进行提交。

![](https://cdn.nlark.com/yuque/0/2024/webp/12426173/1710852293883-816a9fd9-d7fd-4392-adc6-7c7b1f950b20.webp#averageHue=%23fbf9e8&clientId=u0721c18a-3c2d-4&from=paste&id=u8506c54e&originHeight=396&originWidth=598&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uf63ce134-ee8e-4777-b843-b208c796913&title=)
## 2.2  原理
Zab协议要求每个 Leader 都要经历三个阶段：**发现，同步，广播**。

1. **发现**：要求 zookeeper 集群必须选举出一个 Leader 进程，同时 Leader 会维护一个 Follower 可用客户端列表。将来客户端可以和这些 Follower 节点进行通信。
2. **同步**：Leader 要负责将本身的数据与 Follower 完成同步，做到多副本存储。这样也是提现了CAP中的高可用和分区容错。Follower将队列中未处理完的请求消费完成后，写入本地事务日志中
3. **广播**：Leader 可以接受客户端新的事务 Proposal 请求，将新的 Proposal 请求广播给所有的 Follower。
## 2.3 协议内容
Zab 协议包括两种基本的模式：**崩溃恢复** 和 **消息广播**
### 2.3.1 协议过程

- 当整个集群启动过程中，或者当 Leader 服务器出现网络中弄断、崩溃退出或重启等异常时，Zab协议就会 **进入崩溃恢复模式**，选举产生新的Leader。
- 当选举产生了新的 Leader，同时集群中有过半的机器与该 Leader 服务器完成了状态同步（即数据同步）之后，Zab协议就会退出崩溃恢复模式，**进入消息广播模式**。
- 这时，如果有一台遵守 Zab 协议的服务器加入集群，那么因为此时集群中已经存在一个 Leader 服务器在广播消息，那么该新加入的服务器自动进入恢复模式：找到 Leader 服务器，并且完成数据同步。同步完成后，作为新的 Follower 一起参与到消息广播流程中。
### 2.3.2 协议状态切换
当 Leader 出现崩溃退出或者机器重启，亦或是集群中不存在超过半数的服务器与Leader保存正常通信，Zab 就会再一次进入崩溃恢复，发起新一轮Leader选举并实现数据同步。同步完成后又会进入消息广播模式，接收事务请求。
### 2.3.3 **保证消息有序**
在整个消息广播中，Leader 会将每一个事务请求转换成对应的 proposal 来进行广播，并且在广播 事务 Proposal 之前，Leader 服务器会首先为这个事务 Proposal 分配一个全局单递增的唯一ID，称之为事务ID（即zxid），由于 Zab 协议需要保证每一个消息的严格的顺序关系，因此必须将每一个 proposal 按照其 zxid 的先后顺序进行排序和处理。
## 2.4 崩溃恢复
**一旦 Leader 服务器出现崩溃或者由于网络原因导致 Leader 服务器失去了与过半 Follower 的联系，那么就会进入崩溃恢复模式。**

- 前面我们说过，崩溃恢复具有两个阶段：**Leader 选举 与 初始化同步**。当完成 Leader 选 举后，此时的 Leader 还是一个准 Leader，其要经过初始化同步后才能变为真正的 Leader。
### 2.4.1 **初始化同步**
![](https://cdn.nlark.com/yuque/0/2024/webp/12426173/1710852856951-cdd6c3bc-75f4-4728-adeb-7c7563678d4b.webp#averageHue=%23d2d469&clientId=u0721c18a-3c2d-4&from=paste&id=u75b48e1b&originHeight=592&originWidth=723&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u8a4fd33b-37b4-491b-bf4b-27dcadb83da&title=)
**具体过程如下：**

1. 为了保证 Leader 向 Learner 发送提案的有序，Leader 会为每一个 Learner 服务器准备一 个队列；
2. Leader 将那些没有被各个 Learner 同步的事务封装为 Proposal；
3. Leader 将这些 Proposal 逐条发给各个 Learner，并在每一个 Proposal 后都紧跟一个 COMMIT 消息，表示该事务已经被提交，Learner 可以直接接收并执行 ；
4. Learner 接收来自于 Leader 的 Proposal，并将其更新到本地；
5. 当 Learner 更新成功后，会向准 Leader 发送 ACK 信息；
6. Leader 服务器在收到来自 Learner 的 ACK 后就会将该 Learner 加入到真正可用的 Follower 列表或 Observer 列表。没有反馈 ACK，或反馈了但 Leader 没有收到的 Learner，Leader 不会将其加入到相应列表。
## 2.5 **恢复模式的两个原则**
当集群正在启动过程中，或 Leader 与超过半数的主机断连后，集群就进入了恢复模式。 对于要恢复的数据状态需要遵循两个原则。

1. 已被处理过的消息不能丢
当 Leader 收到超过半数 Follower 的 ACKs 后，就向各个 Follower 广播 COMMIT 消息， 批准各个 Server 执行该写操作事务。当各个 Server 在接收到 Leader 的 COMMIT 消息后就会在本地执行该写操作，然后会向客户端响应写操作成功。

但是如果在非全部 Follower 收到 COMMIT 消息之前 Leader 就挂了，这将导致一种后 果：部分 Server 已经执行了该事务，而部分 Server 尚未收到 COMMIT 消息，所以其并没有执行该事务。当新的 Leader 被选举出，集群经过恢复模式后需要保证所有 Server 上都执行 了那些已经被部分 Server 执行过的事务。

2. 被丢弃的消息不能再现
当新事务在 Leader 上已经通过，其已经将该事务更新到了本地，但所有 Follower 还都没有收到 COMMIT 之前，Leader 宕机了（比前面叙述的宕机更早），此时，所有 Follower 根本 就不知道该 Proposal 的存在。当新的 Leader 选举出来，整个集群进入正常服务状态后，之 前挂了的 Leader 主机重新启动并注册成为了 Follower。若那个别人根本不知道的 Proposal 还保留在那个主机，那么其数据就会比其它主机多出了内容，导致整个系统状态的不一致。 所以，该 Proposa 应该被丢弃。类似这样应该被丢弃的事务，是不能再次出现在集群中的， 应该被清除。
## 2.6 消息广播
当集群中的 Learner 完成了初始化状态同步，那么整个 zk 集群就进入到了正常工作模式 了。
![](https://cdn.nlark.com/yuque/0/2024/webp/12426173/1710853667903-e0f0bd82-4c25-4b6f-bcad-c8b1c978a606.webp#averageHue=%23bfd35d&clientId=u0721c18a-3c2d-4&from=paste&id=u59cff786&originHeight=576&originWidth=704&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ud941e151-1382-4cbe-b1d8-18aecab3215&title=)
如果集群中的 Learner 节点收到客户端的事务请求，那么这些 Learner 会将请求转发给 Leader 服务器。然后再执行如下的具体过程：

1. Leader 接收到事务请求后，为事务赋予一个全局唯一的 64 位自增 id，即 zxid，通过 zxid 的大小比较即可实现事务的有序性管理，然后将事务封装为一个 Proposal。
2. Leader 根据 Follower 列表获取到所有 Follower，然后再将 Proposal 通过这些 Follower 的 队列将提案发送给各个 Follower。
3. 当 Follower 接收到提案后，会先将提案的 zxid 与本地记录的事务日志中的最大的 zxid 进行比较。若当前提案的 zxid 大于最大 zxid，则将当前提案记录到本地事务日志中，并 向 Leader 返回一个 ACK。
4. 当 Leader 接收到过半的 ACKs 后，Leader 就会向所有 Follower 的队列发送 COMMIT 消息，向所有 Observer 的队列发送 Proposal。
5. 当 Follower 收到 COMMIT 消息后，就会将日志中的事务正式更新到本地。当 Observer 收到 Proposal 后，会直接将事务更新到本地。
6. 无论是 Follower 还是 Observer，在同步完成后都需要向 Leader 发送成功 ACK。
## 2.7 实现原理
### **2.7.1 三类角色**
为了避免 Zookeeper 的单点问题，zk 也是以集群的形式出现的。zk 集群中的角色主要有 以下三类：

- Leader：接收和处理客户端的读请求；zk 集群中事务请求的唯一处理者，并负责发起决议和投票，然后将通过的事务请求在本地进行处理后，将处理结果同步给集群中的其它主机。
- Follower：接收和处理客户端的读请求; 将事务请求转给 Leader；同步 Leader 中的数据； 当 Leader 挂了，参与 Leader 的选举（具有选举权与被选举权）；
- Observer：就是没有选举权与被选举权，且没有投票权的 Follower（临时工）。若 zk 集 群中的读压力很大，则需要增加 Observer，最好不要增加 Follower。因为增加 Follower 将会增大投票与统计选票的压力，降低写操作效率，及 Leader 选举的效率。

这三类角色在不同的情况下又有一些不同的名称，在zookeeper源码中的定义，可以了解下，看源码可能会少点疑惑的。

- Learner = Follower + Observer
- QuorumServer = Follower + Leader
### **2.7.2 三个数据**
在 ZAB 中有三个很重要的数据：

- zxid：是一个 64 位长度的 Long 类型。其中高 32 位表示 epoch，低 32 表示 xid。
- epoch：每个 Leader 都会具有一个不同的 epoch，用于区分不同的时期（可以理解为朝代的年号）
- xid：事务 id，是一个流水号，（每次朝代更替，即 leader 更换），从0开始递增。

每当选举产生一个新的 Leader ，就会从这个 Leader 服务器上取出本地事务日志中最大编号 Proposal 的 zxid，并从 zxid 中解析得到对应的 epoch 编号，然后再对其加1，之后该编号就作为新的 epoch 值，并将低32位数字归零，由0开始重新生成zxid。
### **2.7.3 三种状态**
zk 集群中的每一台主机，在不同的阶段会处于不同的状态。每一台主机具有四种状态。

- LOOKING：选举状态
- FOLLOWING：Follower 的正常工作状态，从 Leader 同步数据的状态
- LEADING：Leader 的正常工作状态，Leader 广播数据更新的状态

代码实现中，多了一种状态：Observing 状态这是 Zookeeper 引入 Observer 之后加入的，Observer 不参与选举，是只读节点，实际上跟 Zab 协议没有关系。这里为了阅读源码加上此概念。

- OBSERVING：Observer 的正常工作状态，从 Leader 同步数据的状态
### **2.7.4 Zab 的四个阶段**

- **myid**:这是 zk 集群中服务器的唯一标识，称为 myid。例如，有三个 zk 服务器，那么编号分别 是 1,2,3。
- **逻辑时钟**:逻辑时钟，Logicalclock，是一个整型数，该概念在选举时称为 logicalclock，而在选举结 束后称为 epoch。即 epoch 与 logicalclock 是同一个值，在不同情况下的不同名称。
#### 1).选举阶段（Leader Election）
节点在一开始都处于选举节点，只要有一个节点得到超过半数节点的票数，它就可以当选准 Leader，只有到达第三个阶段（也就是同步阶段），这个准 Leader 才会成为真正的 Leader。
**Zookeeper 规定所有有效的投票都必须在同一个 轮次 中，每个服务器在开始新一轮投票时，都会对自己维护的 logicalClock 进行自增操作**。
每个服务器在广播自己的选票前，会将自己的投票箱（recvset）清空。该投票箱记录了所收到的选票。
例如：Server_2 投票给 Server_3，Server_3 投票给 Server_1，则Server_1的投票箱为(2,3)、(3,1)、(1,1)。（每个服务器都会默认给自己投票）
前一个数字表示投票者，后一个数字表示被选举者。票箱中只会记录每一个投票者的最后一次投票记录，如果投票者更新自己的选票，则其他服务器收到该新选票后会在自己的票箱中更新该服务器的选票。
![](https://cdn.nlark.com/yuque/0/2024/webp/12426173/1710853722164-08785d25-84b6-43f7-b607-b144e509e899.webp#averageHue=%23f4f6f2&clientId=u0721c18a-3c2d-4&from=paste&id=u36e11c3f&originHeight=493&originWidth=720&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ub79125ff-901b-49d1-85ff-0d9a26bedc4&title=)
**这一阶段的目的就是为了选出一个准 Leader ，然后进入下一个阶段。**
#### 2). 发现阶段（Descovery）
在这个阶段，Followers 和上一轮选举出的准 Leader 进行通信，同步 Followers 最近接收的事务 Proposal 。
**这个阶段的主要目的是发现当前大多数节点接收的最新 Proposal，并且准 Leader 生成新的 epoch ，让 Followers 接收，更新它们的 acceptedEpoch**。
#### 3). 同步阶段（Synchronization)
**同步阶段主要是利用 Leader 前一阶段获得的最新 Proposal 历史，同步集群中所有的副本**。
只有当 quorum（超过半数的节点） 都同步完成，准 Leader 才会成为真正的 Leader。Follower 只会接收 zxid 比自己 lastZxid 大的 Proposal。
#### 4). 广播阶段（Broadcast）
到了这个阶段，Zookeeper 集群才能正式对外提供事务服务，并且 Leader 可以进行消息广播。同时，如果有新的节点加入，还需要对新节点进行同步。 需要注意的是，Zab 提交事务并不像 2PC 一样需要全部 Follower 都 Ack，只需要得到 quorum（超过半数的节点）的Ack 就可以。
### 
