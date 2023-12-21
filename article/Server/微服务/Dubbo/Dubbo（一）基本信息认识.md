---
title: Dubbo（一）基本信息认识
sidebar_position: 1
keywords:
  - 微服务
  - 源码分析
  - Dubbo
tags:
  - Spring
  - 源码分析
  - Java
  - 框架
  - 微服务
  - 学习笔记
last_update:
  date: 2023-11-6
  author: EasonShu
---


![](https://cdn.nlark.com/yuque/0/2023/gif/12426173/1697695389598-01376028-0111-4de9-a2de-b5f21f123b74.gif#averageHue=%23fcfcfc&clientId=ua8dfa591-4c93-4&from=paste&id=u0ed3a455&originHeight=80&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u634e7ae1-ba5e-4b6e-b637-79674a6e2cd&title=)

- 💌 所属专栏：【微服务】
- 😀 作 者：长安不及十里
- 💻 工作：目前从事电力行业开发
- 🌈 目标：全栈开发
- 🚀 个人简介：一个正在努力学技术的Java工程师，专注基础和实战分享 ，欢迎咨询！
- 💖 欢迎大家：这里是CSDN，我总结知识的地方，喜欢的话请三连，有问题请私信 😘 😘 😘

---

[Apache Dubbo 中文](https://cn.dubbo.apache.org/zh-cn)
# 一 Dubbo
## 1.1 Dubbo 介绍
Apache Dubbo 是一款 RPC 服务开发框架，用于解决微服务架构下的服务治理与通信问题，官方提供了 Java、Golang 等多语言 SDK 实现。使用 Dubbo 开发的微服务原生具备相互之间的远程地址发现与通信能力， 利用 Dubbo 提供的丰富服务治理特性，可以实现诸如服务发现、负载均衡、流量调度等服务治理诉求。Dubbo 被设计为高度可扩展，用户可以方便的实现流量拦截、选址的各种定制逻辑。
## 1.2 发展历程

- Apache Dubbo 最初是为了解决阿里巴巴内部的微服务架构问题而设计并开发的，在十多年的时间里，它在阿里巴巴公司内部的很多业务系统得到了非常广泛的应用。最早在 2008 年，阿里巴巴就将 Dubbo 捐献到开源社区，它很快成为了国内开源服务框架选型的事实标准框架，得到了业界更广泛的应用。在 2017 年，Dubbo 被正式捐献 Apache 软件基金会并成为 Apache 顶级项目，开始了一段新的征程。
- Dubbo 被证实能很好的满足企业的大规模微服务实践，并且能有效降低微服务建设的开发与管理成本，不论是阿里巴巴还是工商银行、中国平安、携程、海尔等社区用户，它们都通过多年的大规模生产环境流量对 Dubbo 的稳定性与性能进行了充分验证。后来 Dubbo 在很多大企业内部衍生出了独立版本，比如在阿里巴巴内部就基于 Dubbo 衍生出了 HSF，HSF 见证了阿里巴巴以电商业务为首的微服务系统的快速发展。自云原生概念推广以来，各大厂商都开始拥抱开源标准实现，阿里巴巴将其内部 HSF 系统与开源社区 Dubbo 相融合，与社区一同推出了云原生时代的 Dubbo3 架构，截止 2022 年双十一结束，**Dubbo3 已经在阿里巴巴内部全面取代 HSF 系统，包括电商核心、阿里云等核心系统已经全面运行在 Dubbo3 之上**。
## 1.3 作用

- Dubbo 支持基于 IDL 或语言特定方式的服务定义，提供多种形式的服务调用形式（如同步、异步、流式等）
- Dubbo 帮助解决微服务组件之间的通信问题，提供了基于 HTTP、HTTP/2、TCP 等的多种高性能通信协议实现，并支持序列化协议扩展，在实现上解决网络连接管理、数据传输等基础问题。
- Dubbo 官方提供的服务发现、动态配置、负载均衡、流量路由等基础组件可以很好的帮助解决微服务基础实践的问题。除此之外，您还可以用 Admin 控制台监控微服务状态，通过周边生态完成限流降级、数据一致性、链路追踪等能力。
## 1.4 架构
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699676609579-b1957596-f619-41be-bc8e-f20c8641fcbf.png#averageHue=%238f908f&clientId=uc83cf453-b097-4&from=paste&id=u46a7f762&originHeight=1370&originWidth=2364&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=ue3b3e58a-fc2c-43a3-b959-250895f23c4&title=)
以上是 Dubbo 的工作原理图，从抽象架构上分为两层：**服务治理抽象控制面** 和 **Dubbo 数据面** 。

- **服务治理控制面**。服务治理控制面不是特指如注册中心类的单个具体组件，而是对 Dubbo 治理体系的抽象表达。控制面包含协调服务发现的注册中心、流量管控策略、Dubbo Admin 控制台等，如果采用了 Service Mesh 架构则还包含 Istio 等服务网格控制面。
- **Dubbo 数据面**。数据面代表集群部署的所有 Dubbo 进程，进程之间通过 RPC 协议实现数据交换，Dubbo 定义了微服务应用开发与调用规范并负责完成数据传输的编解码工作。
   - 服务消费者 (Dubbo Consumer)，发起业务调用或 RPC 通信的 Dubbo 进程
   - 服务提供者 (Dubbo Provider)，接收业务调用或 RPC 通信的 Dubbo 进程
## 1.5 优势

- 快速易用

无论你是计划采用微服务架构开发一套全新的业务系统，还是准备将已有业务从单体架构迁移到微服务架构，Dubbo 框架都可以帮助到你。Dubbo 让微服务开发变得非常容易，它允许你选择多种编程语言、使用任意通信协议，并且它还提供了一系列针对微服务场景的开发、测试工具帮助提升研发效率。

- 多SDK

Dubbo 提供几乎所有主流语言的 SDK 实现，定义了一套统一的微服务开发范式。Dubbo 与每种语言体系的主流应用开发框架做了适配，总体编程方式、配置符合大多数开发者已有编程习惯。
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699678529877-caaab4fa-33ee-4c94-ad59-1104b16d6114.png#averageHue=%23fdfdfd&clientId=uc83cf453-b097-4&from=paste&id=u33ef0a8c&originHeight=1150&originWidth=2432&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u8e83cc03-ba1c-46b2-9160-15e5ec74aac&title=)

- 任意通信协议

Dubbo 微服务间远程通信实现细节，支持 HTTP、HTTP/2、gRPC、TCP 等所有主流通信协议。与普通 RPC 框架不同，Dubbo 不是某个单一 RPC 协议的实现，它通过上层的 RPC 抽象可以将任意 RPC 协议接入 Dubbo 的开发、治理体系。
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699678562047-852447f2-fd59-4a33-a47c-30d3046aa5f3.png#averageHue=%23fbfdfb&clientId=uc83cf453-b097-4&from=paste&id=u26dcea32&originHeight=740&originWidth=2290&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u7f92b88e-3b10-4e85-9f7e-d25eb197379&title=)

- 超高性能

Dubbo 被设计用于解决阿里巴巴超大规模的电商微服务集群实践，并在各个行业头部企业经过多年的十万、百万规模的微服务实践检验，因此，Dubbo 在通信性能、稳定性方面具有无可比拟的优势，非常适合构建近乎无限水平伸缩的微服务集群，这也是 Dubbo 从实践层面优于业界很多同类的产品的巨大优势。

- 高性能数据传输

Dubbo 内置支持 Dubbo2、Triple 两款高性能通信协议。其中

- Dubbo2 是基于 TCP 传输协议之上构建的二进制私有 RPC 通信协议，是一款非常简单、紧凑、高效的通信协议。
- Triple 是基于 HTTP/2 的新一代 RPC 通信协议，在网关穿透性、通用性以及 Streaming 通信上具备优势，Triple 完全兼容 gRPC 协议。

以下是基于 Dubbo 3.2 版本得出的压测指标数据，您也可以通过 [dubbo-benchmark](https://github.com/apache/dubbo-benchmark) 项目自行压测。
**TCP protocol benchmark**
对比 Dubbo 2.x 及早期 3.x 版本

- 较小报文场景 createUser、getUser 下，提升率约 180%。
- 极小报文 existUser(仅一个boolean值)下提升率约 24%
- 较大报文 listUser 提升率最高，达到了 1000%！

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699678661823-c3e9e9e2-83ab-421b-87b4-18f73c2a6876.png#averageHue=%23fcfcfc&clientId=uc83cf453-b097-4&from=paste&id=ufc7b6f8c&originHeight=1335&originWidth=2000&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u4ab1f023-10c5-4a52-9435-952948d79af&title=)
**Triple protocol benchmark**

- 较小报文场景 createUser、existUser、getUser 下，较 3.1 版本性能提升约 40-45%，提升后的性能与 gRPC 同场景的性能基本持平。
- 较大报文场景 listUser 下较 3.1 版本提升了约 17%，相较于同场景下的 gRPC 低 11%。

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699678661590-54d30b65-88b7-4cdc-8eaf-c7a030d65071.png#averageHue=%23fdbf85&clientId=uc83cf453-b097-4&from=paste&id=u12c2b6b1&originHeight=989&originWidth=2000&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=ua1a1353b-9764-42bf-bd01-3a4bd499615&title=)
# 二 对比
## 2.1 Dubbo 与 Spring Cloud
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699703117674-4ed13cbb-d7e9-417f-9011-7deef7982c29.png#averageHue=%23d9f2d1&clientId=uc83cf453-b097-4&from=paste&id=ub3995f64&originHeight=746&originWidth=1724&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u9e9826ec-9c8e-4a9c-a8bd-d3d5cff76e7&title=)
从上图我们可以看出，Dubbo 和 Spring Cloud 有很多相似之处，它们都在整个架构图的相同位置并提供一些相似的功能。

- **Dubbo 和 Spring Cloud 都侧重在对分布式系统中常见问题模式的抽象（如服务发现、负载均衡、动态配置等）**，同时对每一个问题都提供了配套组件实现，形成了一套微服务整体解决方案，让使用 Dubbo 及 Spring Cloud 的用户在开发微服务应用时可以专注在业务逻辑开发上。
- **Dubbo 和 Spring Cloud 都完全兼容 Spring 体系的应用开发模式**，Dubbo 对 Spring 应用开发框架、Spring Boot 微服务框架都做了很好的适配，由于 Spring Cloud 出自 Spring 体系，在这一点上自然更不必多说。

虽然两者有很多相似之处，但由于它们在诞生背景与架构设计上的巨大差异，**两者在性能、适用的微服务集群规模、生产稳定性保障、服务治理等方面都有很大差异**。
Spring Cloud 的优势在于：

- 同样都支持 Spring 开发体系的情况下，Spring Cloud 得到更多的原生支持
- 对一些常用的微服务模式做了抽象如服务发现、动态配置、异步消息等，同时包括一些批处理任务、定时任务、持久化数据访问等领域也有涉猎。
- 基于 HTTP 的通信模式，加上相对比较完善的入门文档和演示 demo 和 starters，让开发者在第一感觉上更易于上手

Spring Cloud 的问题有：

- 只提供抽象模式的定义不提供官方稳定实现，开发者只能寻求类似 Netflix、Alibaba、Azure 等不同厂商的实现套件，而每个厂商支持的完善度、稳定性、活跃度各异
- 有微服务全家桶却不是能拿来就用的全家桶，demo 上手容易，但落地推广与长期使用的成本非常高
- 欠缺服务治理能力，尤其是流量管控方面如负载均衡、流量路由方面能力都比较弱
- 编程模型与通信协议绑定 HTTP，在性能、与其他 RPC 体系互通上存在障碍
- 总体架构与实现只适用于小规模微服务集群实践，当集群规模增长后就会遇到地址推送效率、内存占用等各种瓶颈的问题，但此时迁移到其他体系却很难实现
- 很多微服务实践场景的问题需要用户独自解决，比如优雅停机、启动预热、服务测试，再比如双注册、双订阅、延迟注册、服务按分组隔离、集群容错等

而以上这些点，都是 **Dubbo 的优势**所在：

- 完全支持 Spring & Spring Boot 开发模式，同时在服务发现、动态配置等基础模式上提供与 Spring Cloud 对等的能力。
- 是企业级微服务实践方案的整体输出，Dubbo 考虑到了企业微服务实践中会遇到的各种问题如优雅上下线、多注册中心、流量管理等，因此其在生产环境的长期维护成本更低
- 在通信协议和编码上选择更灵活，包括 rpc 通信层协议如 HTTP、HTTP/2(Triple、gRPC)、TCP 二进制协议、rest等，序列化编码协议Protobuf、JSON、Hessian2 等，支持单端口多协议。
- Dubbo 从设计上突出服务服务治理能力，如权重动态调整、标签路由、条件路由等，支持 Proxyless 等多种模式接入 Service Mesh 体系
- 高性能的 RPC 协议编码与实现，
- Dubbo 是在超大规模微服务集群实践场景下开发的框架，可以做到百万实例规模的集群水平扩容，应对集群增长带来的各种问题
- Dubbo 提供 Java 外的多语言实现，使得构建多语言异构的微服务体系成为可能

如果您的目标是构建企业级应用，并期待在未来的持久维护中能够更省心、更稳定，我们建议你能更深入的了解 Dubbo 的使用和其提供的能力。
Dubbo 在入门资料上的欠缺是对比 Spring Cloud 的一个劣势，这体现在依赖配置管理、文档、demo 示例完善度上，当前整个社区在重点投入这一部分的建设，期望能降低用户在第一天体验和学习 Dubbo 时的门槛，不让开发者因为缺乏文档而错失 Dubbo 这样一款优秀的产品。
## 2.2 Dubbo 与 gRPC
Dubbo 与 gRPC 最大的差异在于两者的定位上：

- **gRPC 定位为一款 RPC 框架**，Google 推出它的核心目标是定义云原生时代的 rpc 通信规范与标准实现；
- **Dubbo 定位是一款微服务开发框架**，它侧重解决微服务实践从服务定义、开发、通信到治理的问题，因此 Dubbo 同时提供了 RPC 通信、与应用开发框架的适配、服务治理等能力。

Dubbo 不绑定特定的通信协议，即 Dubbo 服务间可通过多种 RPC 协议通信并支持灵活切换。因此，你可以在 Dubbo 开发的微服务中选用 gRPC 通信，**Dubbo 完全兼容 gRPC，并将 gRPC 设计为内置原生支持的协议之一**。
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699703117908-57b2cda5-45bb-4dbd-acd9-09f83ff2e85b.png#averageHue=%23ecf1f7&clientId=uc83cf453-b097-4&from=paste&id=uf3460928&originHeight=584&originWidth=2388&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u41c349d4-16fa-4310-9d1f-dbbfff00612&title=)
如果您看中基于 HTTP/2 的通信协议、基于 Protobuf 的服务定义，并基于此决定选型 gRPC 作为微服务开发框架，那很有可能您会在未来的微服务业务开发中遇到障碍，这主要源于 gRPC 没有为开发者提供以下能力：

- 缺乏与业务应用框架集成的开发模式，用户需要基于 gRPC 底层的 RPC API 定义、发布或调用微服务，中间可能还有与业务应用开发框架整合的问题
- 缺乏微服务周边生态扩展与适配，如服务发现、限流降级、链路追踪等没有多少可供选择的官方实现，且扩展起来非常困难
- 缺乏服务治理能力，作为一款 rpc 框架，缺乏对服务治理能力的抽象

因此，gRPC 更适合作为底层的通信协议规范或编解码包，而 Dubbo 则可用作微服务整体解决方案。**对于 gRPC 协议，我们推荐的使用模式 Dubbo + gRPC 的组合**，这个时候，gRPC 只是隐藏在底层的一个通信协议，不被微服务开发者感知，开发者基于 Dubbo 提供的 API 和配置开发服务，并基于 dubbo 的服务治理能力治理服务，在未来，开发者还能使用 Dubbo 生态和开源的 IDL 配套工具管理服务定义与发布。
如果我们忽略 gRPC 在应用开发框架侧的空白，只考虑如何给 gRPC 带来服务治理能力，则另一种可以采用的模式就是在 Service Mesh 架构下使用 gRPC，这就引出了我们下一小节要讨论的内容：Dubbo 与 Service Mesh 架构的关系。
## 2.3 Dubbo 与 Istio
Service Mesh 是近年来在云原生背景下诞生的一种微服务架构，在 Kubernetes 体系下，让微服务开发中的更多能力如流量拦截、服务治理等下沉并成为基础设施，让微服务开发、升级更轻量。Istio 是 Service Mesh 的开源代表实现，它从部署架构上分为数据面与控制面，从这一点上与 [Dubbo 总体架构](https://cn.dubbo.apache.org/zh-cn/overview/what/overview) 是基本一致的，Istio 带来的主要变化在于：

- 数据面，Istio 通过引入 Sidecar 实现了对服务流量的透明拦截，Sidecar 通常是与 Dubbo 等开发的传统微服务组件部署在一起
- 控制面，将之前抽象的服务治理中心聚合为一个具有统一实现的具体组件，并实现了与底层基础设施如 Kubernetes 无缝适配

**Dubbo 已经实现了对 Istio 体系的全面接入，可以用 Istio 控制面治理 Dubbo 服务，而在数据面部署架构上，针对 Sidecar 引入的复杂性与性能问题，Dubbo 还支持无代理的 Proxyless 模式。** 除此之外，Dubbo Mesh 体系还解决了 Istio 架构落地过程中的很多问题，包括提供更灵活的数据面部署架构、更低的迁移成本等。
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699703117910-f18d1060-3d54-4d85-bf63-b1d2ffd8cd48.png#averageHue=%23edeffb&clientId=uc83cf453-b097-4&from=paste&id=ueea3cda1&originHeight=882&originWidth=2152&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=ub2c595fe-8177-4818-8fbd-18130a703cd&title=)
从**数据面**的视角，Dubbo 支持如下两种开发和部署模式，可以通过 Istio、Consul、Linkerd 等控制面组件实现对数据面服务的治理。

- Proxy 模式，Dubbo 与 Envoy 一起部署，Dubbo 作为编程框架 & 协议通信组件存在，流量管控由 Envoy 与 Istio 控制面交互实现。
- Proxyless 模式，Dubbo 进程保持独立部署，Dubbo 通过标准 xDS 协议直接接入 Istio 等控制面组件。

从**控制面**视角，Dubbo 可接入原生 Istio 标准控制面和规则体系，而对于一些 Dubbo 老版本用户，Dubbo Mesh 提供了平滑迁移方案，具体请查看 [Dubbo Mesh 服务网格](https://cn.dubbo.apache.org/zh-cn/overview/tasks/mesh/)。

