---
title: 理解Paxos算法
sidebar_position: 99
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

Lamport 提出的 Paxos 算法包括两个部分：

- Basic Paxos 算法：多节点如何就某个值达成共识
- Multi Paxos 思想：执行多个 Basic Paxos ，就一系列的值达成共识
## Basic Paxos
### 问题
假设一个集群包含三个节点 A, B, C，提供只读 key-value 存储服务。只读 key-value 的意思是指，当一个 key 被创建时，它的值就确定下来了，且后面不能修改。
客户端 1 和客户端 2 同时试图创建一个 X 键。客户端 1 创建值为 "leehao.me" 的 X ，客户端 2 创建值为 "www.leehao.me" 的 X。在这种情况下，集群如何达成共识，实现各节点上 X 的值一致呢？
![](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710849427315-b6258b3d-a57c-4886-93ef-97531bfbb29f.png#averageHue=%23010101&clientId=u04b86c39-2018-4&from=paste&id=ub5bf1438&originHeight=774&originWidth=1380&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u2f0aecad-40de-4899-8bc0-c1eddc45769&title=)
### Paxos 涉及的概念
在 Paxos 算法中，存在提议者（Proposer），接受者（Acceptor），学习者（Learner）三种角色，它们的关系如下：

- 提议者（Proposer）：提议一个值，用于投票表决，可以将上图客户端 1 和客户端 2 看作提议者。实际上，提议者更多是集群内的节点，这里为了演示的方便，将客户端 1 和 2 看作提议者，不影响 Paxos 算法的实质
- 接受者（Acceptor）：对每个提议的值进行投票，并存储接受的值，例如，上图集群内的节点 A、B、C
- 学习者（Learner）：被告知投票的结果，接受达成共识的值，不参与投票的过程，存储接受数据

需要指出的是，一个节点，既可以是提议者，也可以是接受者。
![](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710849427327-1fdfbe1e-dcda-4274-a105-2f137e493ed6.png#averageHue=%23080604&clientId=u04b86c39-2018-4&from=paste&id=u7fd96efd&originHeight=855&originWidth=1230&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uec9812ef-b7f2-4630-a21b-3859c791987&title=)
在 Paxos 算法中，使用**提案**表示一个提议，提案包括提案编号和提议的值。接下来，我们使用 [n, v] 表示一个提案，其中，n 是提案编号，v 是提案的值。
在 Basic Paxos 中，集群中各个节点为了达成共识，需要进行 2 个阶段的协商，即准备（Prepare）阶段和接受（Accept）阶段。
### 准备阶段
假设客户端 1 的提案编号是 1，客户端 2 的提案编号为 5，并假设节点 A, B 先收到来自客户端 1 的准备请求，节点 C 先收到来自客户端 2 的准备请求。
客户端作为提议者，向所有的接受者发送包含提案编号的准备请求。注意在准备阶段，请求中不需要指定提议的值，只需要包含提案编号即可。
![](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710849427303-91fdc1e2-e095-48a4-b638-a325b6fd0523.png#averageHue=%23010101&clientId=u04b86c39-2018-4&from=paste&id=u78d20b3f&originHeight=765&originWidth=1746&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ua737ff1f-f507-419e-8626-cb15dd3d2d2&title=)
接下来，节点 A，B 接收到客户端 1 的准备请求（提案编号为 1），节点 C 接收到客户端 2 的准备请求（提案编号为 5）。
![](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710849427365-a4b22359-a614-4498-80b7-4f52057da2bd.png#averageHue=%23030303&clientId=u04b86c39-2018-4&from=paste&id=u8c74e949&originHeight=765&originWidth=1746&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u4630e779-86db-46c4-a342-5b6a91557b7&title=)
集群中各个节点在接收到第一个准备请求的处理：

- 节点 A, B：由于之前没有通过任何提案，所以节点 A，B 将返回“尚无提案”的准备响应，并承诺以后不再响应提案编号小于等于 1 的准备请求，不会通过编号小于 1 的提案
- 节点 C：由于之前没有通过任何提案，所以节点 C 将返回“尚无提案”的准备响应，并承诺以后不再响应提案编号小于等于 5 的准备请求，不会通过编号小于 5 的提案

接下来，当节点 A，B 接收到提案编号为 5 的准备请求，节点 C 接收到提案编号为 1 的准备请求：
![](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710849427400-0d198ff4-5a2a-4cef-bc02-cbae230b2f7b.png#averageHue=%23030303&clientId=u04b86c39-2018-4&from=paste&id=u62e85ac9&originHeight=765&originWidth=1746&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u688ab02f-20c9-40b4-ab49-4f52c6d6b9c&title=)

- 节点 A, B：由于提案编号 5 大于之前响应的准备请求的提案编号 1，且节点 A, B 都没有通过任何提案，故均返回“尚无提案”的响应，并承诺以后不再响应提案编号小于等于 5 的准备请求，不会通过编号小于 5 的提案
- 节点 C：由于节点 C 接收到提案编号 1 小于节点 C 之前响应的准备请求的提案编号 5 ，所以丢弃该准备请求，不作响应
### 接受阶段
Basic Paxos 算法第二阶段为接受阶段。当客户端 1，2 在收到大多数节点的准备响应之后会开始发送接受请求。
![](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710849427884-68afed06-0ca7-4574-8989-592b0980deb1.png#averageHue=%23010101&clientId=u04b86c39-2018-4&from=paste&id=ue3f3d42c&originHeight=768&originWidth=1746&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u1677a7d7-a475-4efa-a67a-8dbba6849e9&title=)

- 客户端 1：客户端 1 接收到大多数的接受者（节点 A, B）的准备响应后，根据响应中的提案编号最大的提案的值，设置接受请求的值。由于节点 A, B 均返回“尚无提案”，即提案值为空，故客户端 1 把自己的提议值 "leehao.me" 作为提案的值，发送接受请求 [1, "leehao.me"]
- 客户端 2：客户端 2 接收到大多数接受者的准备响应后，根据响应中的提案编号最大的提案的值，设置接受请求的值。由于节点 A, B, C 均返回“尚无提案”，即提案值为空，故客户端 2 把自己的提议值 "www.leehao.me" 作为提案的值，发送接受请求 [5, "www.leehao.me"]

当节点 A, B, C 接收到客户端 1, 2 的接受请求时，对接受请求进行处理：
![](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710849427953-07d94a43-b5c1-42c2-9b58-5dc02b0d2669.png#averageHue=%23030303&clientId=u04b86c39-2018-4&from=paste&id=u4be467af&originHeight=768&originWidth=1746&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uc3c470e9-33f4-45b3-89e4-c7e15972165&title=)

- 节点 A, B, C 接收到接受请求 [1, "leehao.me"] ，由于提案编号 1 小于三个节点承诺可以通过的最小提案编号 5，所以提案 [1, "leehao.me"] 被拒绝
- 节点 A, B, C 接收到接受请求 [5, "www.leehao.me"]，由于提案编号 5 不小于三个节点承诺可以通过的最小提案编号 5 ，所以通过提案 [5, "www.leehao.me"]，即三个节点达成共识，接受 X 的值为 "www.leehao.me"

如果集群中还有学习者，当接受者通过一个提案，就通知学习者，当学习者发现大多数接受者都通过了某个提案，那么学习者也通过该提案，接受提案的值。
### 接受者存在已通过提案的情况
上面例子中，准备阶段和接受阶段均不存在接受者已经通过提案的情况。这里继续使用上面的例子，不过假设节点 A, B 已通过提案 [5, "www.leehao.me"]，节点 C 未通过任何提案。
增加一个新的提议者客户端 3，客户端 3 的提案为 [9，"leehao"] 。
接下来，客户端 3 执行准备阶段和接受阶段。
客户端 3 向节点 A, B, C 发送提案编号为 9 的准备请求：
![](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710849428011-baf56e9f-5118-490e-8a94-2883ef16b64a.png#averageHue=%23030201&clientId=u04b86c39-2018-4&from=paste&id=uca37b66d&originHeight=651&originWidth=1746&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uf853edaf-b30c-446d-8674-5117dbdb58e&title=)
节点 A, B 接收到客户端 3 的准备请求，由于节点 A, B 已通过提案 [5, "www.leehao.me"]，故在准备响应中，包含此提案信息。
节点 C 接收到客户端 3 的准备请求，由于节点 C 未通过任何提案，故节点 C 将返回“尚无提案”的准备响应。
![](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710849428037-992f815c-1afe-4490-b05c-f077f8dcc540.png#averageHue=%23080402&clientId=u04b86c39-2018-4&from=paste&id=ue3b31564&originHeight=651&originWidth=1746&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ufcf3ca1c-8c02-44ac-b7d4-5787ed879fa&title=)
客户端 3 接收到节点 A, B, C 的准备响应后，向节点 A, B, C 发送接受请求。这里需要特点指出，客户端 3 会根据响应中的提案编号最大的提案的值，设置接受请求的值。由于在准备响应中，已包含提案 [5, "www.leehao.me"]，故客户端 3 将接受请求的提案编号设置为 9，提案值设置为 "www.leehao.me" 即接受请求的提案为 [9, "www.leehao.me"]：
![](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710849428066-bb544e34-cb18-4277-a5c6-42f4221a8b32.png#averageHue=%23040201&clientId=u04b86c39-2018-4&from=paste&id=u670c7196&originHeight=645&originWidth=1746&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u745fb67b-563a-4c1e-b672-51b55f19834&title=)
节点 A, B, C 接收到客户端 3 的接受请求，由于提案编号 9 不小于三个节点承诺可以通过的最小提案编号，故均通过提案 [9, www.leehao.me]。
![](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710849428514-893fcde3-81a2-476d-854f-1b0abb09859e.png#averageHue=%23050301&clientId=u04b86c39-2018-4&from=paste&id=udc1ad2eb&originHeight=645&originWidth=1746&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ua50cca2f-fe51-42bf-9b20-43b8f6f7a4b&title=)
概括来说，Basic Paxos 具有以下特点：

- Basic Paxos 通过二阶段方式来达成共识，即准备阶段和接受阶段
- Basic Paxos 除了达成共识功能，还实现了容错，在少于一半节点出现故障时，集群也能工作
- 提案编号大小代表优先级。对于提案编号，接受者提供三个承诺：
   - 如果准备请求的提案编号，小于等于接受者已经响应的准备请求的提案编号，那么接受者承诺不响应这个准备请求
   - 如果接受请求中的提案编号，小于接受者已经响应的准备请求的提案编号，那么接受者承诺不通过这个提案
   - 如果按受者已通过提案，那些接受者承诺会在准备请求的响应中，包含已经通过的最大编号的提案信息
## Multi Paxos
Basic Paxos 算法只能对单个值达成共识，对于多个值的情形，Basic Paxos 算法就不管用了。因此，Basic Paxos 算法几乎只是用来理论研究，并不直接应用在实际工作中。
Lamport 提出的 Multi Paxos 是一种思想，并不是算法。
Multi Paxos 算法则是一个统称，是指基于 Multi Paxos 思想，通过多个 Basic Paxos 实例实现一系列值的共识的算法（例如 Raft 算法等）。
如果直接通过多次执行 Basic Paxos 实例方式，来实现一系列值的共识，存在以下问题：

- 如果集群中多个提议者同时在准备阶段提交提案，可能会出现没有提议者接收到大多数准备响应，导致需要重新提交准备请求。例如，在一个 5 个节点的集群中，有 3 个节点同时作为提议者同时提交提案，那就会出现没有一个提议者获取大多数的准备响应，而需要重新提交
- 为了达成一个值的共识，需要进行 2 轮 RPC 通讯，分别是准备阶段和接受阶段，性能低下

为了解决以上问题，Multi Paxos 引入了领导者（Leader）和优化了 Basic Paxos 的执行过程。
### 领导者
上面的问题一存在多个提议者同时提交准备请求的情况，如果引入了领导者，由领导者作为唯一的提议者，就可以解决问题一中的冲突的问题。
![](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710849428642-9f18093e-2f2f-4362-9f1b-31a98c929bb3.png#averageHue=%23010101&clientId=u04b86c39-2018-4&from=paste&id=ua2134e99&originHeight=834&originWidth=1086&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u673f6acc-20d8-451b-94f6-a28ba86cf28&title=)
Lamport 没有说明如何选举领导者，需要在实现 Multi Paxos 算法的时候自行实现。这里我们略去如何选举领导者的算法，假设已经选举出领导者。
### 优化 Basic Paxos 执行过程
准备阶段的意义，是发现接受者节点上已通过的提案的值。引入领导者后，只有领导者才可发送提议，因此，领导者的提案就已经是最新的了，不再需要通过准备阶段来发现之前被大多数节点通过的提案，领导者可以独立指定提议的值。
这样一来，准备阶段存在就没有意义了，领导者可以直接跳过准备阶段，直接进行接受阶段，减少了 RPC 通讯次数。
### Chubby 的 Multi Paxos 实现
Google 分布式锁 Chubby 实现了 Multi Paxos 算法。Chubby 的 Multi Paxos 算法主要包括：

- Chubby 引入主节点作为领导者，即主节点作为唯一提议者，不存在多个提议者同时提交提案的情况，也不存在提案冲突的情况。Chubby 通过执行 Basic Paxos 算法进行投票选举产生主节点
- 在 Chubby 中，由于引入了主节点，因此，也去除了 Basic Paxos 的准备阶段
- 在 Chubby 中，为实现强一致性，所有的读请求和写请求都由主节点来处理
1. Chubby 所有的写请求由主节点来处理

当主节点接收到客户端的写请求，作为提议者，将数据发送给所有节点，在大多数服务器接受了这个写请求后，给客户端响应写成功。
![](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710849428626-8e18068e-7e30-43a1-a895-ced688ae5f65.png#averageHue=%23e75302&clientId=u04b86c39-2018-4&from=paste&id=u8e7d18e4&originHeight=483&originWidth=1002&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u197e7e9f-366a-468a-a214-adfe5cfc3a5&title=)

1. Chubby 所有的读请求由主节点来处理

当主节点接收到读请求，主节点只需要查询本地数据，然后返回给客户端。
![](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710849428700-e8f8d7a5-3075-4368-b99e-b0c54d87c220.png#averageHue=%23e85303&clientId=u04b86c39-2018-4&from=paste&id=u6a562131&originHeight=453&originWidth=1002&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uf164f91c-3a76-4489-bd99-57540872a5f&title=)
另外，需要指出的是，Basic Paxos 是经过证明的算法。Multi Paxos 是一种思想但缺乏实现算法所需的编程细节，因此，Multi Paxos 的算法实现，是建立在一个未经证明的基础之上。实现 Multi Paxos 算法，最大的挑战是如何证明它是正确的。
