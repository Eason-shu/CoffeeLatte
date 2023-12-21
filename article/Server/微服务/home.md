---
slug: /
title: 微服务
sidebar_position: 1
keywords:
  - 微服务
  - 源码分析
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

- 💌 所属专栏：【分布式技术】
- 😀 作 者：长安不及十里
- 💻 工作：目前从事电力行业开发
- 🌈 目标：全栈开发
- 🚀 个人简介：一个正在努力学技术的Java工程师，专注基础和实战分享 ，欢迎咨询！
- 💖 欢迎大家：这里是CSDN，我总结知识的地方，喜欢的话请三连，有问题请私信 😘 😘 😘

# 一 单体，SOA，微服务架构

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699267731506-9227c55b-646f-4555-9d13-133f44c69e61.png#averageHue=%23f6f6f6&clientId=u151de32d-a8a3-4&from=paste&id=u16a6d045&originHeight=263&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u34c35b90-9f3e-467c-b40c-954842a6ca2&title=)

## 1.1 单体架构

- 是指一个应用程序中所有的功能都集成在一个单一的代码库中。
- 这种设计模式简单易用，开发人员可以快速地开发和维护应用程序，但是也存在一些问题。

![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1699267041269-809aaeb0-afcd-4d85-8ea4-59943c07f3f2.webp#averageHue=%23fafafa&clientId=u151de32d-a8a3-4&from=paste&id=uc9ba8f35&originHeight=231&originWidth=679&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ufa8db355-9e7c-400a-a059-1531d774ab4&title=)

:::info
  优点
:::

1. 简单易懂：单体服务架构相对简单，易于理解和上手，开发人员可以更快地构建和部署整个应用程序。
2. 快速开发：由于所有功能模块都在同一个应用程序中，开发人员可以更方便地进行代码编写、测试和集成，加快开发速度。
3. 低成本：相对于其他架构模式，单体服务架构的开发和维护成本相对较低，因为它不需要处理分布式系统和服务间通信的复杂性

:::warning
缺点
:::

1. 难以扩展：随着应用程序规模和流量的增长，单体服务架构变得难以扩展。增加处理能力可能需要垂直扩展整个应用，增加硬件成本。
2. 单一故障点：在单体服务架构中，整个应用程序是一个单一的实体，当一个模块出现问题时，可能会导致整个系统崩溃，降低了系统的健壮性和可靠性。
3. 难以维护：由于所有功能模块都集中在一个应用程序中，当需要修改或升级某个模块时，可能会涉及整个应用程序的重新部署和测试，增加了维护的复杂性。
4. 团队协作限制：在单体服务架构中，不同功能模块之间的代码和资源是共享的，这可能导致团队之间的协作和独立开发受到限制

## 1.2 SOA架构

- SOA 是 Service-Oriented Architecture 的英文缩写，就是面向服务的架构。这里的服务可以理解为 service 层业务服务。将系统拆分为不同的服务单元，通过网络协议服务单元之间进行通信。服务单元完成一个特定功能(如：验证、支付、登录等等)，通过服务单元之间的集成组成完整的应用程序。
- SOA 架构中由两个重要的角色: 服务提供者（Provider）和服务使用者（Consumer）

![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1699267004043-c574052d-7bfc-42c2-b6d9-e0e79d0c2c3f.webp#averageHue=%23c6cfaf&clientId=u151de32d-a8a3-4&from=paste&id=u236e0ed1&originHeight=220&originWidth=715&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ud18bca5f-6094-4059-9b53-d3d55240523&title=)

:::info
  优点
:::

1. 可重用性：SOA鼓励将功能划分为独立的服务，这些服务可以在不同的应用程序中被重复使用，这种重用性可以减少开发时间和工作量，并促进系统的灵活性和可维护性。
2. 松散耦合：SOA通过标准化接口和协议来实现服务间的通信，服务之间解耦合度高，这样，当一个服务发生变化时，其他服务不会受到影响，从而提高了系统的可靠性和稳定性。
3. 系统集成：SOA支持异构系统之间的集成，通过定义和实现标准化的接口，不同的应用程序和服务可以相互通信和协作，实现系统间的无缝集成。

:::warning
缺点
:::

1. 额外的开发和管理工作：实施SOA需要额外的开发和管理工作，这包括定义服务接口、制定规范、版本管理等，这些工作增加了开发团队的负担，可能导致项目开发时间延长。
2. 性能影响：由于SOA服务间需要通过网络进行通信，因此性能和响应时间可能受到一定的影响，网络延迟和通信开销可能会增加系统的负载和响应时间，特别是在高并发和大规模的情况下。
3. 接口设计和管理挑战：SOA的成功与否取决于良好的接口设计和管理，定义清晰、灵活和易于使用的接口是一个挑战，需要深入的系统设计和架构能力，管理多个服务的版本和兼容性也可能带来一定的复杂性。

## 1.3 微服务架构

- 微服务架构是一种将应用程序拆分成小型、独立的服务的架构模式，每个服务都有自己的数据库和业务逻辑，并通过轻量级的通信机制实现服务间的交互。
- 微服务架构具有高度的可扩展性，每个服务都可以独立地扩展和部署。它还可以促进团队的自治和快速迭代开发。
- 然而，微服务架构也存在一些挑战，首先，微服务架构需要良好的服务拆分和界定边界，这需要深入的系统设计和架构能力，此外，微服务架构的复杂性要求具备强大的监控和管理机制。

![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1699267355406-02319c1b-1fcc-47d8-8732-5acc91a9f995.webp#averageHue=%23ced9ae&clientId=u151de32d-a8a3-4&from=paste&id=u2a59ce61&originHeight=1056&originWidth=1440&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uf266618c-a2f3-4932-ba63-b596081887d&title=)

:::info
  优点
:::

1. 高度可扩展性：微服务架构允许每个服务独立地扩展，使得系统能够更好地应对变化的负载需求。只需要对特定的服务进行扩展，而不需要整体扩展应用程序。
2. 独立部署：每个微服务都可以独立地进行开发、测试和部署。这使得团队能够在不影响其他服务的情况下进行快速迭代和发布，提高开发效率。
3. 高度灵活性：微服务架构允许团队使用不同的编程语言、技术栈和工具来构建每个服务。这种灵活性使得团队能够选择最适合他们需求的技术，并独立地进行技术栈升级和演进。
4. 独立自治：每个微服务都有自己的团队负责开发和维护。这种自治性使得团队能够独立做出决策，更好地满足特定服务的需求，并快速响应变化。

:::warning
缺点
:::

5. 分布式系统的复杂性：微服务架构引入了分布式系统的复杂性。服务之间的通信需要通过网络进行，可能会面临网络延迟、通信故障等问题，增加了系统的复杂性和运维成本。
6. 服务拆分的挑战：将应用程序拆分成适当的微服务需要良好的系统设计和架构能力。错误的服务拆分可能导致服务间的紧密耦合，或者服务间的边界不清晰，影响系统的可维护性和扩展性。
7. 一致性和事务管理：由于微服务架构中的数据和业务逻辑分布在不同的服务中，确保一致性和事务管理变得更加复杂。需要采用一些技术手段来解决分布式事务和数据一致性的问题。

# 二 微服务架构技术方案

业界比较成熟的服务框架有很多，比如：Hessian、CXF、Dubbo、Dubbox、Spring Cloud、gRPC、thrift等技术实现，都可以进行远程调用，具体技术实现优劣参考以下分析，这也是具体在技术方案选择过程中的重要依据。

- 区域内容分发：CDN
- 网络负载均衡：lvs
- **网关负载均衡、反向代理**：nginx+lua、Kong、Spring Cloud Zuul、Spring Cloud Gateway
- 服务网关：zuul,kong,springcloud gateway
- 熔断、降级、限流：Hystrix,Sentinel
- **服务注册与发现**：eureka,**nacos**,consul,zookeeper
- 服务配置：nacos,springcloud config,consul
- 服务负载均衡：ribbon，Load Balancer
- **组件通信**：feign,RestTemplate，Dubbo RPC,OpenFeign
- 消息队列：RabbitMQ、Kafka、ActiveMQ、RocketMQ
- 链路追踪：zipkin，Skywalking
- 服务部署：docker,kubernetes,jenkins
- 服务监控：Metrics+ELK,SpringCloud Admin
- 分布式日志：ELK
- 分布式存储：fastDFS、OSS
- 分布式事务：seata
- 分布式任务调度：SchedulerX,xxl-job
- 短信服务：SMS
- 邮件服务：mail

## 2.1 核心组件

- **注册中心**
  - **服务注册**
  - **服务发现**
- **服务网关**
  - **安全认证和授权**
  - **路由管理**
  - **协议转换**
  - **负载限流**
- **服务熔断**
  - **监控**
  - **断路器状态管理**
  - **故障恢复**
  - **限流**
- **分布式配置中心**
  - **集中化配置管理**
  - **配置信息动态刷新**
  - **配置信息版本控制**
  - **配置信息安全管理**
  - **配置信息监控**
- **负载均衡**
- **服务调用**

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699268186721-cfe7d9a2-2097-41f7-8034-6fc7ad4b5c10.png#averageHue=%23f9f8f4&clientId=u151de32d-a8a3-4&from=paste&id=ubad6bc3b&originHeight=1315&originWidth=1446&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uceeb55a0-0472-4564-b866-f211d633aa3&title=)

## 1.2 常见微服务架构

> dubbo：zookeeper + dubbo + SpringMvc / SpringBoot

- 配套通信方式：rpc
- 注册中心：zookeeper / redis
- 配置中心：diamond

> SpringCloud：全家桶 + 嵌入第三方组件（Netflix）

- 配套通信方式：http restful
- 注册中心：eruka / consul
- 配置中心：config
- 熔断器：hystrix
- 网关：zuul
- 分布式链路系统：sleuth + zipkin

> SpringCloud Alibaba（全家桶）

- Sentinel：把流量作为切入点，从流量控制、熔断降级、系统负载保护等多个维度保护服务的稳定性。
- Nacos：一个更易于构建云原生应用的动态服务发现、配置管理和服务管理平台。
- RocketMQ：一款开源的分布式消息系统，基于高可用分布式集群技术，提供低延时的、高可靠的消息发布与订阅服务。
- Dubbo：Apache Dubbo™ 是一款高性能 Java RPC 框架。
- Seata：阿里巴巴开源产品，一个易于使用的高性能微服务分布式事务解决方案。
- Alibaba Cloud OSS：阿里云对象存储服务（Object Storage Service，简称 OSS），是阿里云提供的海量、安全、低成本、高可靠的云存储服务。您可以在任何应用、任何时间、任何地点存储和访问任意类型的数据。
- Alibaba Cloud SchedulerX：阿里中间件团队开发的一款分布式任务调度产品，提供秒级、精准、高可靠、高可用的定时（基于 Cron 表达式）任务调度服务。
- Alibaba Cloud SMS：覆盖全球的短信服务，友好、高效、智能的互联化通讯能力，帮助企业迅速搭建客户触达通道。






