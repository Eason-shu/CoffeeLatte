---
title: Zookeeper（一）分布式理论
sidebar_position: 2
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
## 1.1 介绍
ZooKeeper 由雅虎研究院开发，后来捐赠给了 Apache。ZooKeeper 是一个开源的分布式应用程序协调服务器，其为分布式系统提供一致性服务。其一致性是通过基于 Paxos 算法的ZAB 协议完成的。其主要功能包括：配置维护、域名服务、分布式同步、集群管理等。
## 1.2 特点

- 顺序一致性：从同一个客户端发起的多个事务请求（写操作请求），最终会严格按照其发起顺序记录到 zk 中。
- 原子性：所有事务请求的结果在集群中所有 Server 上的应用情况是一致的。要么全部应用成功，要么都没有成功，不会出现部分成功，部分失败的情况。
- 单一视图：无论客户端连接的是集群中的哪台 Server，其读取到的数据模型中的数据都是一致的。
- 可靠性：一旦某事务被成功应用到了 zk，则会一直被保留下来，除非另一个事务将其修改。
- 最终一致性：一旦一个事务被成功应用，zk 可以保证在一段较短的时间内，客户端最终一定能够从服务端读取到最新的数据。但不能保证实时读取到。
## 1.3 ACID理论

- 事务(Transaction)是由一系列对系统中数据进行访问与更新的操作所组成的一个程序执行逻辑单元(Unit)，狭义上的事务特指数据库事务。

![](https://cdn.nlark.com/yuque/0/2024/jpeg/12426173/1710684223815-37a2ac6c-7290-4a8f-afaf-bb54fe1d120c.jpeg#averageHue=%23f6ece4&clientId=u0564c3bd-c63d-4&from=paste&id=ud531d0f3&originHeight=360&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ude38b558-0e82-490d-8263-df57a18d614&title=)

- 一方面，当多个应用程序并发访问数据库时，事务可以在这些应用程序之间提供一个隔离方法，以防止彼此的操作互相干扰。
- 另一方面，事务为数据库操作序列提供了一个从失败中恢复到正常状态的方法，同时提供了数据库即使在异常状态下仍能保持数据一致性的方法。
- 事务具有四个特征，分别是原子性(Atomicity)、一致性(Consistency)、隔离性(Isolation)和持久性(Durability)，简称为事务的ACID特性。
### 1.3.1 原子性
事务的原子性是指事务必须是一个原子的操作序列单元。事务中包含的各项操作在一次执行过程中，只允许出现以下两种状态之一。· 全部成功执行。· 全部不执行。
![](https://cdn.nlark.com/yuque/0/2024/jpeg/12426173/1710684307799-6d3d18a9-fc32-4338-844e-0f28cfb5f65d.jpeg#averageHue=%23fbfbfb&clientId=u0564c3bd-c63d-4&from=paste&id=u3fbfd3f6&originHeight=360&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u40db2157-d5e5-49cd-8d5e-83519d38c55&title=)
例如：银行转账，从A账户转100元至B账户：
A、从A账户取100元
B、存入100元至B账户。 这两步要么一起完成，要么一起不完成，如果只完成第一步，第二步失败，钱会莫名其妙少了100元。
### 1.3.2 一致性
事务的一致性是指事务的执行不能破坏数据库数据的完整性和一致性，一个事务在执行之前和执行之后，数据库都必须处于一致性状态。
![](https://cdn.nlark.com/yuque/0/2024/jpeg/12426173/1710684336932-0dd677f8-5c6a-4a0d-823f-20fcd2680d9a.jpeg#averageHue=%23f9f9f9&clientId=u0564c3bd-c63d-4&from=paste&id=u6d41048e&originHeight=360&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u181b99eb-0386-4257-9ed0-41c345dee47&title=)
例如：现有完整性约束A+B=100，如果一个事务改变了A，那么必须得改变B，使得事务结束后依然满足A+B=100，否则事务失败。
### 1.3.3 隔离性

- 事务的隔离性是指在并发环境中，并发的事务是相互隔离的，一个事务的执行不能被其他事务干扰。
- 在标准SQL规范中，定义了4个事务隔离级别，不同的隔离级别对事务的处理不同，如未授权读取、授权读取、可重复读取和串行化

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710683743857-4cc1d539-0c0a-46f0-9b2f-01f474f9e157.png#averageHue=%23faf9f9&clientId=u0564c3bd-c63d-4&from=paste&height=594&id=u07f634a9&originHeight=743&originWidth=1728&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=345322&status=done&style=none&taskId=u1fe7e9cf-56bc-435c-b8d8-b57b153dc3c&title=&width=1382.4)

- 事务隔离级别越高，就越能保证数据的完整性和一致性，但同时对并发性能的影响也越大。
- 通常，对于绝大多数的应用程序来说，可以优先考虑将数据库系统的隔离级别设置为授权读取，这能够在避免脏读取的同时保证较好的并发性能。

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710683786484-8590aba8-8b40-4b65-8822-61c96f2b221e.png#averageHue=%23dfdfdf&clientId=u0564c3bd-c63d-4&from=paste&height=228&id=ue3691025&originHeight=285&originWidth=1728&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=117921&status=done&style=none&taskId=u879e5165-4e7d-4f32-b45b-915e141a727&title=&width=1382.4)
如：现有有个交易是从A账户转100元至B账户，在这个交易事务还未完成的情况下，如果此时B查询自己的账户，是看不到新增加的100元的。
### 1.3.4 持久性
事务的持久性也被称为永久性，是指一个事务一旦提交，它对数据库中对应数据的状态变更就应该是永久性的。
## 1.4 CAP理论
CAP理论告诉我们，一个分布式系统不可能同时满足一致性(C：Consistency)、可用性(A：Availability)和分区容错性(P：Partition tolerance)这三个基本需求，最多只能同时满足其中的两项。
![](https://cdn.nlark.com/yuque/0/2024/jpeg/12426173/1710684251683-74f8586a-a1de-4994-b5dc-4875d6224ca1.jpeg#averageHue=%23f2f2e5&clientId=u0564c3bd-c63d-4&from=paste&id=u8ea29924&originHeight=360&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ub0ff6293-f2c0-4a3c-8e12-edc36f88212&title=)
如上图，CAP的三种特性只能同时满足两个。而且在不同的两两组合，也有一些成熟的分布式产品。
接下来，我们来介绍一下CAP的三种特性，我们采用一个应用场景来分析CAP中的每个特点的含义。
![](https://cdn.nlark.com/yuque/0/2024/jpeg/12426173/1710684405488-e37b7664-a019-4b3e-a779-86573b443e61.jpeg#averageHue=%23fdfbf4&clientId=u0564c3bd-c63d-4&from=paste&id=uc1d0bd22&originHeight=360&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u79cd66a0-b1d9-485c-be9e-5327d82742a&title=)
该场景整体分为5个流程：
流程一、客户端发送请求(如:添加订单、修改订单、删除订单)
流程二、Web业务层处理业务，并修改存储成数据信息
流程三、存储层内部Master与Backup的数据同步
流程四、Web业务层从存储层取出数据
流程五、Web业务层返回数据给客户端
### 1.4.1  一致性Consistency
“all nodes see the same data at the same time”
一旦数据更新完成并成功返回客户端后，那么分布式系统中所有节点在同一时间的数据完全一致。
在CAP的一致性中还包括强一致性、弱一致性、最终一致性等级别，稍后我们在后续章节介绍。
一致性是指写操作后的读操作可以读取到最新的数据状态，当数据分布在多个节点上，从任意结点读取到的数据都是最新的状态。
> 一致性实现目标：

- Web业务层向主Master写数据库成功，从Backup读数据也成功。

![](https://cdn.nlark.com/yuque/0/2024/jpeg/12426173/1710684437977-85423fb2-b7df-439a-9ddb-ae9a3f234e87.jpeg#averageHue=%23fcfaf3&clientId=u0564c3bd-c63d-4&from=paste&id=u36cf42fd&originHeight=360&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u57ebc492-f6ef-4df2-81be-23754f003b5&title=)

- Web业务层向主Master读数据库失败，从Backup读数据也失败。

![](https://cdn.nlark.com/yuque/0/2024/jpeg/12426173/1710684438027-a413882c-fb25-4bc0-ade5-0e280acec13a.jpeg#averageHue=%23fbf9f2&clientId=u0564c3bd-c63d-4&from=paste&id=ud94dcca7&originHeight=360&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u442e4cfb-57d2-431a-80f0-0616d19fcd4&title=)
> 必要实现流程：

![](https://cdn.nlark.com/yuque/0/2024/jpeg/12426173/1710684437855-7bffb9d7-f79d-4662-8ff5-22ca217ba777.jpeg#averageHue=%23faf9f1&clientId=u0564c3bd-c63d-4&from=paste&id=u54cf4a54&originHeight=360&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ua2158df5-21cc-4fa9-98b3-e01d32bf6d8&title=)
写入主数据库后，在向从数据库同步期间要将从数据库锁定，待同步完成后再释放锁，以免在新数据写入成功后，向从数据库查询到旧的数据。
> 分布式一致性特点：

1. 由于存在数据同步的过程，写操作的响应会有一定的延迟。
2. 为了保证数据一致性会对资源暂时锁定，待数据同步完成释放锁定资源。
3. 如果请求数据同步失败的结点则会返回错误信息，一定不会返回旧数据。
### 1.4.2 可用性(Availability)
“Reads and writes always succeed”
服务一直可用，而且是正常响应时间。
对于可用性的衡量标准如下：
> 可用性实现目标：

- 当Master正在被更新，Backup数据库接收到数据查询的请求则立即能够响应数据查询结果。
- backup数据库不允许出现响应超时或响应错误。

![](https://cdn.nlark.com/yuque/0/2024/jpeg/12426173/1710684437838-3173fb32-f36a-40a9-a5e6-f063529f6519.jpeg#averageHue=%23f2e194&clientId=u0564c3bd-c63d-4&from=paste&id=ue82dc27c&originHeight=360&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u47155e5c-305c-4dd6-b08b-7f363684408&title=)
> 必要实现流程：

![](https://cdn.nlark.com/yuque/0/2024/jpeg/12426173/1710684437780-2902cfc5-e6b6-4725-95af-9f8b00253b57.jpeg#averageHue=%23fbf9f2&clientId=u0564c3bd-c63d-4&from=paste&id=u2026b7b4&originHeight=360&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u82b092d8-7fd1-44e3-bce2-d0afa6c8b50&title=)

1. 写入Master主数据库后要将数据同步到从数据库。
2. 由于要保证Backup从数据库的可用性，不可将Backup从数据库中的资源进行锁定。
3. 即时数据还没有同步过来，从数据库也要返回要查询的数据，哪怕是旧数据/或者默认数据，但不能返回错误或响应超时。
> 分布式可用性特点：

所有请求都有响应，且不会出现响应超时或响应错误。
### 1.4.3  分区容错性(Partition tolerance)
“the system continues to operate despite arbitrary message loss or failure of part of the system”
分布式系统中，尽管部分节点出现任何消息丢失或者故障，系统应继续运行。
通常分布式系统的各各结点部署在不同的子网，这就是网络分区，不可避免的会出现由于网络问题而导致结点之间通信失败，此时仍可对外提供服务。
> 分区容错性实现目标：

- 主数据库向从数据库同步数据失败不影响读写操作。

![](https://cdn.nlark.com/yuque/0/2024/jpeg/12426173/1710684438505-9992ac0e-fbcd-40fa-a1c1-87a2e92ad0e6.jpeg#averageHue=%23fbf9f2&clientId=u0564c3bd-c63d-4&from=paste&id=u76a58ce4&originHeight=360&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u0fe088cf-c0f0-47d3-b2bd-4114bb86a83&title=)

- 其一个结点挂掉不影响另一个结点对外提供服务。

![](https://cdn.nlark.com/yuque/0/2024/jpeg/12426173/1710684438580-f55d2002-3e6f-470e-bb38-f7aa06a71c7a.jpeg#averageHue=%23fbf9f2&clientId=u0564c3bd-c63d-4&from=paste&id=udd298221&originHeight=360&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u2e47a32f-ad06-48db-b497-61895882cb6&title=)
> 必要实现流程：

1. 尽量使用异步取代同步操作，例如使用异步方式将数据从主数据库同步到从数据，这样结点之间能有效的实现松耦合。
2. 添加Backup从数据库结点，其中一个Backup从结点挂掉其它Backup从结点提供服务。

![](https://cdn.nlark.com/yuque/0/2024/jpeg/12426173/1710684438651-33b25a96-7bf1-4d36-b000-9c34c86ef150.jpeg#averageHue=%23faf9f5&clientId=u0564c3bd-c63d-4&from=paste&id=u46a9d6bd&originHeight=360&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u47176f0b-fa26-47f9-b6b2-3781ffb6a51&title=)
> 分区容错性特点：

分区容忍性分是布式系统具备的基本能力。
### 1.4.4 CAP的”3选2“证明
#### 1.4.4.1  基本场景
在小结中，我们主要介绍CAP的理论为什么不能够3个特性同时满足。
![](https://cdn.nlark.com/yuque/0/2024/jpeg/12426173/1710684438850-e8f57ea0-8265-407c-97f2-4d546abdd271.jpeg#averageHue=%23fcf8f6&clientId=u0564c3bd-c63d-4&from=paste&id=u5d63cdb3&originHeight=360&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u2fa83974-bb07-45cd-8134-ab7888aadb0&title=)
如上图，是我们证明CAP的基本场景，分布式网络中有两个节点Host1和Host2，他们之间网络可以连通，Host1中运行Process1程序和对应的数据库Data，Host2中运行Process2程序和对应数据库Data。
#### 1.4.4.2 CAP特性
如果满足一致性(C)：那么Data(0) = Data(0).
如果满足可用性(A): 用户不管请求Host1或Host2，都会立刻响应结果。
如果满足分区容错性(P): Host1或Host2有一方脱离系统(故障)， 都不会影响Host1和Host2彼此之间正常运作。
#### 1.4.4.3分布式系统正常运行流程
![](https://cdn.nlark.com/yuque/0/2024/jpeg/12426173/1710684439112-b53f8f76-9a91-492d-8eb3-fccd89c5b96f.jpeg#averageHue=%23f7ece4&clientId=u0564c3bd-c63d-4&from=paste&id=ucfa99d4e&originHeight=360&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u541875d3-bf30-4cb9-96eb-d0225225b8e&title=)
如上图，是分布式系统正常运转的流程。
A、用户向Host1主机请求数据更新，程序Process1更新数据库Data(0)为Data(1)
B、分布式系统将数据进行同步操作，将中的同步的Host2中`Data(0),使中的数据也变为
C、当用户请求主机时，则Process2则响应最新的数据
根据CAP的特性：

- 和的数据库Data之间的数据是否一样为一致性(C)
- 用户对和的请求响应为可用性(A)
- 和之间的各自网络环境为分区容错性(P)

当前是一个正常运作的流程，目前CAP三个特性可以同时满足，也是一个理想状态,但是实际应用场景中，发生错误在所难免，那么如果发生错误CAP是否能同时满足，或者该如何取舍？
#### 1.4.4.4 分布式系统异常运行流程
假设和之间的网络断开了，我们要支持这种网络异常，相当于要满足分区容错性(P)，能不能同时满足一致性(C)和可用响应性(A)呢？
![](https://cdn.nlark.com/yuque/0/2024/jpeg/12426173/1710684439297-74b1c150-09dd-4ca1-85a8-06d17368bd22.jpeg#averageHue=%23f6ebe4&clientId=u0564c3bd-c63d-4&from=paste&id=ufa84aa87&originHeight=360&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u2dd6ec7f-dcdc-4168-9fc0-e6f0aa7e104&title=)
假设在N1和N2之间网络断开的时候，
A、用户向发送数据更新请求，那中的数据将被更新为
B、弱此时和网络是断开的，所以分布式系统同步操作将失败，中的数据依旧是
C、有用户向发送数据读取请求，由于数据还没有进行同步，没办法立即给用户返回最新的数据V1，那么将面临两个选择。
第一，牺牲数据一致性(c)，响应旧的数据给用户；
第二，牺牲可用性(A)，阻塞等待，直到网络连接恢复，数据同步完成之后，再给用户响应最新的数据。
这个过程，证明了要满足分区容错性(p)的分布式系统，只能在和两者中，选择其中一个。
### 1.4.5 "3选2"的必然性
通过CAP理论，我们知道无法同时满足一致性、可用性和分区容错性这三个特性，那要舍弃哪个呢？
#### 1.4.5.1 CA 放弃 P
一个分布式系统中，不可能存在不满足P，放弃，即不进行分区，不考虑由于网络不通或结点挂掉的问题，则可以实现一致性和可用性。那么系统将不是一个标准的分布式系统。我们最常用的关系型数据就满足了CA，如下：
![](https://cdn.nlark.com/yuque/0/2024/jpeg/12426173/1710684439272-8c88687d-a66c-4d72-b740-11494c3dec62.jpeg#averageHue=%23fdfcf5&clientId=u0564c3bd-c63d-4&from=paste&id=u1ae554f7&originHeight=360&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u5f2d1f22-2a4e-4d1d-a3a6-db7cdca1fd1&title=)
主数据库和从数据库中间不再进行数据同步，数据库可以响应每次的查询请求，通过事务(原子性操作)隔离级别实现每个查询请求都可以返回最新的数据。
注意：
对于一个分布式系统来说。P是一个基本要求，CAP三者中，只能在CA两者之间做权衡，并且要想尽办法提升P。
#### 1.4.5.2 CP 放弃 A
如果一个分布式系统不要求强的可用性，即容许系统停机或者长时间无响应的话，就可以在CAP三者中保障CP而舍弃A。
放弃可用性，追求一致性和分区容错性，如Redis、HBase等，还有分布式系统中常用的Zookeeper也是在CAP三者之中选择优先保证CP的。
场景：
跨行转账，一次转账请求要等待双方银行系统都完成整个事务才算完成。
#### 1.4.5.3 AP 放弃 C
放弃一致性，追求分区容忍性和可用性。这是很多分布式系统设计时的选择。实现AP，前提是只要用户可以接受所查询的到数据在一定时间内不是最新的即可。
通常实现AP都会保证最终一致性，后面讲的BASE理论就是根据AP来扩展的。
场景1
淘宝订单退款。今日退款成功，明日账户到账，只要用户可以接受在一定时间内到账即可。
场景2：
12306的买票。都是在可用性和一致性之间舍弃了一致性而选择可用性。
在12306买票的时候提示有票（但是可能实际已经没票了），用户正常去输入验证码，下单。但是过了一会系统提示下单失败，余票不足。这其实就是先在可用性方面保证系统可以正常的服务，然后在数据的一致性方面做了些牺牲，会影响一些用户体验，但是也不至于造成用户流程的严重阻塞。
但是，我们说很多网站牺牲了一致性，选择了可用性，这其实也不准确的。就比如上面的买票的例子，其实舍弃的只是强一致性。退而求其次保证了最终一致性。也就是说，虽然下单的瞬间，关于车票的库存可能存在数据不一致的情况，但是过了一段时间，还是要保证最终一致性的。
### 1.4.6 总结:
CA 放弃 P：如果不要求P（不允许分区），则C（强一致性）和A（可用性）是可以保证的。这样分区将永远不会存在，因此CA的系统更多的是允许分区后各子系统依然保持CA。
CP 放弃 A：如果不要求A（可用），相当于每个请求都需要在Server之间强一致，而P（分区）会导致同步时间无限延长，如此CP也是可以保证的。很多传统的数据库分布式事务都属于这种模式。
AP 放弃 C：要高可用并允许分区，则需放弃一致性。一旦分区发生，节点之间可能会失去联系，为了高可用，每个节点只能用本地数据提供服务，而这样会导致全局数据的不一致性。现在众多的NoSQL都属于此类。
## 1.5 分布式BASE理论
CAP 不可能同时满足，而是对于分布式系统而言是必须的。如果系统能够同时实现 CAP 是再好不过的了，所以出现了 BASE 理论。
### 1.5.1 BASE理论
通用定义
BASE是**Basically Available(基本可用）**、**Soft state(软状态）**和**Eventually consistent(最终一致性）**三个短语的简写。
BASE是对CAP中一致性和可用性权衡的结果，其来源于对大规模互联网系统分布式实践的总结，是**基于CAP定理逐步演化**而来的，其核心思想是即使无法做到强一致性，但每个应用都可以根据自身的业务特点，采用适当的方法来使系统达到**最终一致性**。
两个对冲理念：ACID和BASE
是传统数据库常用的设计理念，追求强一致性模型。
BASE支持的是大型分布式系统，提出通过牺牲强一致性获得高可用性。
### 1.5.2  Basically Available(基本可用)
实际上就是两个妥协。

- **对响应上时间的妥协**：正常情况下，一个在线搜索引擎需要在0.5秒之内返回给用户相应的查询结果，但由于出现故障（比如系统部分机房发生断电或断网故障），查询结果的响应时间增加到了1~2秒。
- **对功能损失的妥协**：正常情况下，在一个电子商务网站（比如淘宝）上购物，消费者几乎能够顺利地完成每一笔订单。但在一些节日大促购物高峰的时候（比如双十一、双十二），由于消费者的购物行为激增，为了保护系统的稳定性（或者保证一致性），部分消费者可能会被引导到一个降级页面，如下：

![](https://cdn.nlark.com/yuque/0/2024/jpeg/12426173/1710684914858-1cb207ea-5b11-428b-87d3-2c8a9c892ccc.jpeg#averageHue=%238c8480&clientId=u710c92f6-ec04-4&from=paste&id=u49f120d8&originHeight=800&originWidth=441&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u11ef6ceb-b6ac-4ea8-a2fb-626184d4203&title=)
### 1.5.3  Soft state（软状态）

- 原子性（硬状态） -> 要求多个节点的数据副本都是一致的,这是一种"硬状态"

![](https://cdn.nlark.com/yuque/0/2024/jpeg/12426173/1710684914711-5fd67190-420b-416e-8e8d-12968f896fe2.jpeg#averageHue=%23f8efe6&clientId=u710c92f6-ec04-4&from=paste&id=u56d477ae&originHeight=360&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u889842fb-14aa-439a-b0a0-3f1ab6dcc60&title=)

- 软状态（弱状态） -> 允许系统中的数据存在中间状态,并认为该状态不影响系统的整体可用性,即允许系统在多个不同节点的数据副本存在数据延迟。

![](https://cdn.nlark.com/yuque/0/2024/jpeg/12426173/1710684914553-58502ce1-f9c3-403e-b5fd-c7fe7972cab2.jpeg#averageHue=%23f7f0e8&clientId=u710c92f6-ec04-4&from=paste&id=u262732a6&originHeight=360&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ud7f369d9-66e9-4710-9fb2-5a0477dc81b&title=)
### 1.5.4  Eventually consistent（最终一致性）
上面说软状态，然后不可能一直是软状态，必须有个时间期限。在期限过后，应当保证所有副本保持数据一致性。从而达到数据的最终一致性。这个时间期限取决于网络延时，系统负载，数据复制方案设计等等因素。
![](https://cdn.nlark.com/yuque/0/2024/jpeg/12426173/1710684914721-ff1d2bd6-3b72-414b-8a57-f231a9df1e5d.jpeg#averageHue=%23f7eee6&clientId=u710c92f6-ec04-4&from=paste&id=u77ad7cc0&originHeight=360&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ua590dbc4-a939-45ac-809e-4df7776ff08&title=)
稍微官方一点的说法就是：
系统能够保证在没有其他新的更新操作的情况下，数据最终一定能够达到一致的状态，因此所有客户端对系统的数据访问最终都能够获取到最新的值。
### 1.5.5  BASE总结
总的来说，BASE 理论面向的是大型高可用可扩展的分布式系统，和传统事务的 ACID 是**相反的**，它完全不同于 ACID 的强一致性模型，而是**通过牺牲强一致性**来获得可用性，并允许数据在一段时间是不一致的。

