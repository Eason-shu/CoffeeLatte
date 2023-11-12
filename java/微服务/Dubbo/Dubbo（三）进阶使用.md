---
title: Dubbo（三）进阶使用
sidebar_position: 3
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
[入门文档 - 《Apache Dubbo 3.0 教程（202212）》 - 书栈网 · BookStack](https://www.bookstack.cn/read/dubbo-3.1-zh/75b6cf67125350f0.md)
[Dubbo3 简介_w3cschool](https://www.w3cschool.cn/dubbo/dubbo-introduction.html)
# 一 服务发现
Dubbo 提供的是一种 Client-Based 的服务发现机制，依赖第三方注册中心组件来协调服务发现过程，支持常用的注册中心如 Nacos、Consul、Zookeeper 等。
以下是 Dubbo 服务发现机制的基本工作原理图：
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699754571237-04caf425-5a9c-4f5a-ace0-3f5d0b1a2b02.png#averageHue=%23f6f6f5&clientId=u6651f3b6-abca-4&from=paste&id=u3e60209f&originHeight=780&originWidth=2902&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u9319f4dc-b5b4-4a91-89f0-e4eee4ee544&title=)
服务发现包含提供者、消费者和注册中心三个参与角色，其中，Dubbo 提供者实例注册 URL 地址到注册中心，注册中心负责对数据进行聚合，Dubbo 消费者从注册中心读取地址列表并订阅变更，每当地址列表发生变化，注册中心将最新的列表通知到所有订阅的消费者实例。
### 面向百万实例集群的服务发现机制
区别于其他很多微服务框架的是，**Dubbo3 的服务发现机制诞生于阿里巴巴超大规模微服务电商集群实践场景，因此，其在性能、可伸缩性、易用性等方面的表现大幅领先于业界大多数主流开源产品**。是企业面向未来构建可伸缩的微服务集群的最佳选择。
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699754990571-c110f9be-f4bd-4fd0-840b-d19f1e966f68.png#averageHue=%23fc700e&clientId=u6651f3b6-abca-4&from=paste&id=u5a7a0b3f&originHeight=1502&originWidth=2988&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u8c19d813-8fd3-4511-8234-d28af31b721&title=)

- 首先，Dubbo 注册中心以应用粒度聚合实例数据，消费者按消费需求精准订阅，避免了大多数开源框架如 Istio、Spring Cloud 等全量订阅带来的性能瓶颈。
- 其次，Dubbo SDK 在实现上对消费端地址列表处理过程做了大量优化，地址通知增加了异步、缓存、bitmap 等多种解析优化，避免了地址更新常出现的消费端进程资源波动。
- 最后，在功能丰富度和易用性上，服务发现除了同步 ip、port 等端点基本信息到消费者外，Dubbo 还将服务端的 RPC/HTTP 服务及其配置的元数据信息同步到消费端，这让消费者、提供者两端的更细粒度的协作成为可能，Dubbo 基于此机制提供了很多差异化的治理能力。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699757314076-987fb8b8-2f4c-46f8-993d-d7c4c6722a58.png#averageHue=%23eedcb3&clientId=u6651f3b6-abca-4&from=paste&height=418&id=ue6c387f6&originHeight=502&originWidth=1908&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=38894&status=done&style=none&taskId=uc294b185-bb8a-4762-81a8-4e617ec4646&title=&width=1589.999936819079)
### 高效地址推送实现
从注册中心视角来看，它负责以应用名 (dubbo.application.name) 对整个集群的实例地址进行聚合，每个对外提供服务的实例将自身的应用名、实例ip:port 地址信息 (通常还包含少量的实例元数据，如机器所在区域、环境等) 注册到注册中心。
Dubbo2 版本注册中心以服务粒度聚合实例地址，比应用粒度更细，也就意味着传输的数据量更大，因此在大规模集群下也遇到一些性能问题。 针对 Dubbo2 与 Dubbo3 跨版本数据模型不统一的问题，Dubbo3 给出了[平滑迁移方案](https://cn.dubbo.apache.org/zh-cn/overview/mannual/java-sdk/upgrades-and-compatibility/service-discovery/migration-service-discovery/)，可做到模型变更对用户无感。
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699757249969-76889b83-4e55-4dec-9d04-a9a0cb2daeb3.png#averageHue=%23fafcfa&clientId=u6651f3b6-abca-4&from=paste&id=u2ba6e944&originHeight=584&originWidth=2460&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u31ee0b0f-e0e7-4c01-9811-3490d926da1&title=)

每个消费服务的实例从注册中心订阅实例地址列表，相比于一些产品直接将注册中心的全量数据 (应用 + 实例地址) 加载到本地进程，Dubbo 实现了按需精准订阅地址信息。比如一个消费者应用依赖 app1、app2，则只会订阅 app1、app2 的地址列表更新，大幅减轻了冗余数据推送和解析的负担。

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699757250319-bc88392c-a0b6-4ed7-a929-feb24bb256ee.png#averageHue=%23fafaf9&clientId=u6651f3b6-abca-4&from=paste&id=u84b9c202&originHeight=938&originWidth=3448&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u10b03ff8-22ab-41fd-9548-a43943fa4c3&title=)
### 丰富元数据配置
除了与注册中心的交互，Dubbo3 的完整地址发现过程还有一条额外的元数据通路，我们称之为元数据服务 (MetadataService)，实例地址与元数据共同组成了消费者端有效的地址列表。
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699757250066-f879516b-8591-4b3e-aa42-a1e33e3f9637.png#averageHue=%23bab8b6&clientId=u6651f3b6-abca-4&from=paste&id=u6aff3072&originHeight=1866&originWidth=2814&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u68b6f90b-9445-461a-b9a8-c314b3d7893&title=)
```java
[12/11/23 10:44:45:045 GMT+08:00] main-EventThread  INFO zookeeper.ZookeeperRegistry:  [DUBBO] Notify urls for subscribe url provider://192.168.2.35:20893/com.shu.interfaces.UserService?anyhost=true&application=dubbo-server03&bind.ip=192.168.2.35&bind.port=20893&category=configurators&check=false&deprecated=false&dubbo=2.0.2&dynamic=true&generic=false&group=app2&interface=com.shu.interfaces.UserService&metadata-type=remote&methods=getUserInfo&pid=368&qos.enable=false&release=3.0.2.1&revision=1.0.0&service-name-mapping=true&side=provider&timestamp=1699756823149&version=1.0.0, url size: 1, dubbo version: 3.0.2.1, current host: 192.168.2.35
```
完整工作流程如上图所示，首先，消费者从注册中心接收到地址 (ip:port) 信息，然后与提供者建立连接并通过元数据服务读取到对端的元数据配置信息，两部分信息共同组装成 Dubbo 消费端有效的面向服务的地址列表。以上两个步骤都是在实际的 RPC 服务调用发生之前。
# 二 负载均衡
在集群负载均衡时，Dubbo 提供了多种均衡策略，缺省为 weighted random 基于权重的随机负载均衡策略。
具体实现上，Dubbo 提供的是客户端负载均衡，即由 Consumer 通过负载均衡算法得出需要将请求提交到哪个 Provider 实例。
## 负载均衡策略
目前 Dubbo 内置了如下负载均衡算法，可通过调整配置项启用。

| 算法 | 特性 | 备注 |
| --- | --- | --- |
| Weighted Random LoadBalance | 加权随机 | 默认算法，默认权重相同 |
| RoundRobin LoadBalance | 加权轮询 | 借鉴于 Nginx 的平滑加权轮询算法，默认权重相同， |
| LeastActive LoadBalance | 最少活跃优先 + 加权随机 | 背后是能者多劳的思想 |
| Shortest-Response LoadBalance | 最短响应优先 + 加权随机 | 更加关注响应速度 |
| ConsistentHash LoadBalance | 一致性哈希 | 确定的入参，确定的提供者，适用于有状态请求 |
| P2C LoadBalance | Power of Two Choice | 随机选择两个节点后，继续选择“连接数”较小的那个节点。 |
| Adaptive LoadBalance | 自适应负载均衡 | 在 P2C 算法基础上，选择二者中 load 最小的那个节点 |

### Weighted Random

- **加权随机**，按权重设置随机概率。
- 在一个截面上碰撞的概率高，但调用量越大分布越均匀，而且按概率使用权重后也比较均匀，有利于动态调整提供者权重。
- 缺点：存在慢的提供者累积请求的问题，比如：第二台机器很慢，但没挂，当请求调到第二台时就卡在那，久而久之，所有请求都卡在调到第二台上。
### RoundRobin

- **加权轮询**，按公约后的权重设置轮询比率，循环调用节点
- 缺点：同样存在慢的提供者累积请求的问题。

加权轮询过程中，如果某节点权重过大，会存在某段时间内调用过于集中的问题。 例如 ABC 三节点有如下权重：{A: 3, B: 2, C: 1} 那么按照最原始的轮询算法，调用过程将变成：A A A B B C
对此，Dubbo 借鉴 Nginx 的平滑加权轮询算法，对此做了优化，调用过程可抽象成下表:

| 轮前加和权重 | 本轮胜者 | 合计权重 | 轮后权重（胜者减去合计权重） |
| --- | --- | --- | --- |
| 起始轮 | \\ | \\ | A(0), B(0), C(0) |
| A(3), B(2), C(1) | A | 6 | A(-3), B(2), C(1) |
| A(0), B(4), C(2) | B | 6 | A(0), B(-2), C(2) |
| A(3), B(0), C(3) | A | 6 | A(-3), B(0), C(3) |
| A(0), B(2), C(4) | C | 6 | A(0), B(2), C(-2) |
| A(3), B(4), C(-1) | B | 6 | A(3), B(-2), C(-1) |
| A(6), B(0), C(0) | A | 6 | A(0), B(0), C(0) |

我们发现经过合计权重（3+2+1）轮次后，循环又回到了起点，整个过程中节点流量是平滑的，且哪怕在很短的时间周期内，概率都是按期望分布的。
如果用户有加权轮询的需求，可放心使用该算法。
### LeastActive

- **加权最少活跃调用优先**，活跃数越低，越优先调用，相同活跃数的进行加权随机。活跃数指调用前后计数差（针对特定提供者：请求发送数 - 响应返回数），表示特定提供者的任务堆积量，活跃数越低，代表该提供者处理能力越强。
- 使慢的提供者收到更少请求，因为越慢的提供者的调用前后计数差会越大；相对的，处理能力越强的节点，处理更多的请求。
### ShortestResponse

- **加权最短响应优先**，在最近一个滑动窗口中，响应时间越短，越优先调用。相同响应时间的进行加权随机。
- 使得响应时间越快的提供者，处理更多的请求。
- 缺点：可能会造成流量过于集中于高性能节点的问题。

这里的响应时间 = 某个提供者在窗口时间内的平均响应时间，窗口时间默认是 30s。
### ConsistentHash

- **一致性 Hash**，相同参数的请求总是发到同一提供者。
- 当某一台提供者挂时，原本发往该提供者的请求，基于虚拟节点，平摊到其它提供者，不会引起剧烈变动。
- 算法参见：[Consistent Hashing | WIKIPEDIA](http://en.wikipedia.org/wiki/Consistent_hashing)
- 缺省只对第一个参数 Hash，如果要修改，请配置 <dubbo:parameter key="hash.arguments" value="0,1" />
- 缺省用 160 份虚拟节点，如果要修改，请配置 <dubbo:parameter key="hash.nodes" value="320" />
### P2C Load Balance
Power of Two Choice 算法简单但是经典，主要思路如下：

1. 对于每次调用，从可用的provider列表中做两次随机选择，选出两个节点providerA和providerB。
2. 比较providerA和providerB两个节点，选择其“当前正在处理的连接数”较小的那个节点。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699757918028-a55188b9-d38f-416a-9256-00e7d517a0bf.png#averageHue=%23e6c292&clientId=u6651f3b6-abca-4&from=paste&height=222&id=u3f084f3e&originHeight=267&originWidth=957&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=31836&status=done&style=none&taskId=u13c399d9-c56e-4249-9e59-afeb94f60ee&title=&width=797.4999683101985)
### 配置方式

- 注解 loadbalance
```java

/**
 * @author : EasonShu
 * @date : 2023/11/12 10:08
 * @Version: 1.0
 * @Desc :
 */
@RestController
public class ConsumerUserApp2Controller {

    @DubboReference(group = "app2", version = "1.0.0",loadbalance = "roundrobin")
    private UserService userService;

    /**
     * 获取用户信息
     */
    @GetMapping("/getUserInfoApp2")
    public User getUserInfo() {
        return  userService.getUserInfo(1L);
    }
}



/**
 * @author : EasonShu
 * @date : 2023/11/11 14:48
 * @Version: 1.0
 * @Desc :
 */
@DubboService(group = "app1", version = "1.0.0",loadbalance = "roundrobin")
@Component
@Slf4j
public class UserServiceImpl implements UserService {

    /**
     * 获取用户信息
     * @param userId
     * @return
     */
    @Override
    public User getUserInfo(long userId) {
        log.info("request from consumer: {}", getContext().getRemoteAddress());
        log.info("response from provider: {}" ,getContext().getLocalAddress());
        return new User(userId, "userName" + userId , " --->>>>response from remote RPC provider:" + RpcContext.getContext().getLocalAddress());

    }
}



```

- 配置文件
```xml
<dubbo:service interface="...">
  <dubbo:method name="..." loadbalance="roundrobin"/>
</dubbo:service>

<dubbo:reference interface="...">
    <dubbo:method name="..." loadbalance="roundrobin"/>
</dubbo:reference>
```
## 自定义负载均衡
参考文档：https://cn.dubbo.apache.org/zh-cn/docsv2.7/dev/impls

- 首先我们需要定义一个接口
```java
package com.shu.algorithm;

import org.apache.dubbo.common.URL;
import org.apache.dubbo.rpc.Invocation;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.RpcException;
import org.apache.dubbo.rpc.cluster.LoadBalance;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.List;
import java.util.Random;

/**
 * @author : EasonShu
 * @date : 2023/11/11 19:32
 * @Version: 1.0
 * @Desc :
 * 参考文档：https://cn.dubbo.apache.org/zh-cn/docsv2.7/dev/impls/
 */
@Component
public class MyLoadBalance01 implements LoadBalance {
    private final String A_MACHINE_HOST_PORT = "192.168.2.35:20892";
    private final String B_MACHINE_HOST_PORT = "192.168.2.35:20893";

    @Override
    public <T> Invoker<T> select(List<Invoker<T>> list, URL url, Invocation invocation) throws RpcException {
        System.out.println("执行自定义的负载均衡算法");
        //模拟场景
        System.out.println(url);
        int currentHour = LocalTime.now().getHour();
        if (currentHour >= 9 && currentHour <= 18) {
            System.out.println("===================>请求A机器");
            findInvokerInList(list, A_MACHINE_HOST_PORT);
        } else if (currentHour >= 18 && currentHour <= 23) {
            System.out.println("===================>请求B机器");
            findInvokerInList(list, B_MACHINE_HOST_PORT);
        }
        int randIndex = new Random().nextInt(list.size());
        return list.get(randIndex);
    }


    /**
     * 从服务列表里面进行dubbo服务地址匹配
     *
     * @param list
     * @param matchKey
     * @param <T>
     * @return
     */
    private <T> Invoker findInvokerInList(List<Invoker<T>> list, String matchKey) {
        for (Invoker tInvoker : list) {
            String addr = tInvoker.getUrl().getHost() + tInvoker.getUrl().getPort();
            if (matchKey.equals(addr)) {
                return tInvoker;
            }
        }
        return null;
    }

}


package com.shu.algorithm;

import org.apache.dubbo.common.URL;
import org.apache.dubbo.rpc.Invocation;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.RpcException;
import org.apache.dubbo.rpc.cluster.LoadBalance;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * @author : EasonShu
 * @date : 2023/11/11 18:43
 * @Version: 1.0
 * @Desc : 自定义负载均衡算法
 * 参考文档：https://cn.dubbo.apache.org/zh-cn/docsv2.7/dev/impls/
 */
@Component
public class MyLoadBalance implements LoadBalance {
    /**
     * 自定义负载均衡算法
     * @param list
     * @param url
     * @param invocation
     * @return
     * @param <T>
     * @throws RpcException
     */
    @Override
    public <T> Invoker<T> select(List<Invoker<T>> list, URL url, Invocation invocation) throws RpcException {
        list.forEach(invoker -> {
            System.out.println("提供者ip："+invoker.getUrl().getHost()+"---------->端口："+invoker.getUrl().getPort());
        });
        // 设置自定义的负载，每次都拿第一个
        Invoker<T> invoker = list.stream().sorted((v1, v2) -> {
            // 先比较ip
            int i = v1.getUrl().getIp().compareTo(v2.getUrl().getIp());
            if (i == 0) {
                // 再比较端口
                i = Integer.compare(v1.getUrl().getPort(), v2.getUrl().getPort());
            }
            return i;
        }).findFirst().get();
        return invoker;
    }
}

```

- 利用JdkSPI机制进行扩展类的加载

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699758294030-c3769940-0eea-4f34-93a2-6173bc2eed40.png#averageHue=%23253b64&clientId=u6651f3b6-abca-4&from=paste&height=752&id=u3b62c357&originHeight=902&originWidth=1820&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=219601&status=done&style=none&taskId=uae8f567a-e7f7-4374-ad53-c7718ae954d&title=&width=1516.6666063997504)

- 新建文件夹：META-INF，services
- 新建文件：org.apache.dubbo.rpc.cluster
- key=value 
```
MyLoadBalance=com.shu.algorithm.MyLoadBalance
MyLoadBalance01=com.shu.algorithm.MyLoadBalance01
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699758387118-9c737f0f-b144-46d0-9d03-8acf9c5eee35.png#averageHue=%23232528&clientId=u6651f3b6-abca-4&from=paste&height=643&id=yGs0a&originHeight=772&originWidth=1773&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=86945&status=done&style=none&taskId=u66076f2f-b2ab-41d9-84d8-6a8950dd33b&title=&width=1477.4999412894272)

- 使用：更改注解或者配置文件中的负载均衡策越

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699758483533-b145b2d9-9bf6-421d-bc92-e2e7ae5ac0e9.png#averageHue=%23232528&clientId=u6651f3b6-abca-4&from=paste&height=624&id=ub86e4658&originHeight=749&originWidth=1720&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=150590&status=done&style=none&taskId=uebbdd341-5f50-483a-8807-7fad978c6ba&title=&width=1433.3332763777862)

- 测试

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699759265893-e6318e16-02ab-4533-9180-ed6b40480570.png#averageHue=%23282b2f&clientId=u6651f3b6-abca-4&from=paste&height=723&id=ub1e6dba4&originHeight=868&originWidth=1903&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=294278&status=done&style=none&taskId=u8b705f9c-d259-4f2d-b64e-a47c3d7439e&title=&width=1585.8332703179808)
# 三 流量管控
Dubbo 提供了丰富的流量管控策略

- **地址发现与负载均衡**，地址发现支持服务实例动态上下线，负载均衡确保流量均匀的分布到每个实例上。（上面的案例）
- **基于路由规则的流量管控**，路由规则对每次请求进行条件匹配，并将符合条件的请求路由到特定的地址子集。

Dubbo 的流量管控规则可以基于应用、服务、方法、参数等粒度精准的控制流量走向，根据请求的目标服务、方法以及请求体中的其他附加参数进行匹配，符合匹配条件的流量会进一步的按照特定规则转发到一个地址子集。流量管控规则有以下几种：

- 条件路由规则
- 标签路由规则
- 脚本路由规则
- 动态配置规则
## 3.1 工作原理
以下是 Dubbo 单个路由器的工作过程，路由器接收一个服务的实例地址集合作为输入，基于请求上下文 (Request Context) 和 (Router Rule) 实际的路由规则定义对输入地址进行匹配，所有匹配成功的实例组成一个地址子集，最终地址子集作为输出结果继续交给下一个路由器或者负载均衡组件处理。
参考文章：
[框架与服务 - RPC调用上下文 - 《Apache Dubbo 3.0 教程（202212）》 - 书栈网 · BookStack](https://www.bookstack.cn/read/dubbo-3.1-zh/4f4b203994317e61.md)
```java
RpcContext.getContext()
```
| 方法名 | 用途 | 作用范围 | 说明 |
| --- | --- | --- | --- |
| getRequest | 获取 RPC 请求对象 | Consumer | 获取底层 RPC 请求对象，例如 HttpServletRequest，其他情况为 null |
| getResponse | 获取 RPC 请求响应 | Consumer | 获取底层 RPC 响应对象，例如HttpServletResponse，其他情况为 null |
| isProviderSide | 当前是否属于 Provider 上下文 | Both | 服务被调用时为 true，调用其他服务时为false |
| isConsumerSide | 当前是否属于 Consumer 上下文 | Both | 服务被调用时为 false，调用其他服务时为 true |
| getUrls | 获取当前能调用的 Url 列表 | Both | Consumer 端会根据不同的 Failover 策略实时变化 |
| getRemotePort | 获取远端端口 | Both | Consumer 端为最后一次调用的 Provider 端口，Provider 为当前请求的 Consumer 端口 |
| getRemoteHost | 获取远端主机地址 | Both |  |
| getRemoteHostName | 获取远端主机名 | Both |  |
| getRemoteAddressString | 获取远端地址 | Both |  |
| getRemoteAddress | 获取远端地址 | Both |  |
| getLocalPort | 获取本端端口 | Both |  |
| getLocalHost | 获取本端主机地址 | Both |  |
| getLocalHostName | 获取本端主机名 | Both |  |
| getLocalAddressString | 获取本端地址 | Both |  |
| getLocalAddress | 获取本端地址 | Both |  |

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699762382236-950d5197-3412-4aeb-a6f5-2483a7466078.png#averageHue=%23fcfdfc&clientId=u6651f3b6-abca-4&from=paste&id=u0dfa2575&originHeight=678&originWidth=2208&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u8430979e-0860-4268-9674-117c238f142&title=)
通常，在 Dubbo 中，多个路由器组成一条路由链共同协作，前一个路由器的输出作为另一个路由器的输入，经过层层路由规则筛选后，最终生成有效的地址集合。

- Dubbo 中的每个服务都有一条完全独立的路由链，每个服务的路由链组成可能不通，处理的规则各异，各个服务间互不影响。
- 对单条路由链而言，即使每次输入的地址集合相同，根据每次请求上下文的不同，生成的地址子集结果也可能不同。

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699762382229-f7c3d522-b5ba-480d-a9c3-c1b665acac53.png#averageHue=%2393cad1&clientId=u6651f3b6-abca-4&from=paste&id=ubc0a2cc2&originHeight=744&originWidth=3140&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=uf592ef07-41a6-4607-9451-de36f91bd6f&title=)
## 3.2 标签路由

- 标签路由通过将某一个服务的实例划分到不同的分组，约束具有特定标签的流量只能在指定分组中流转，不同分组为不同的流量场景服务，从而实现流量隔离的目的。标签路由可以作为蓝绿发布、灰度发布等场景能力的基础。
- 标签路由规则是一个非此即彼的流量隔离方案，也就是匹配标签的请求会 100% 转发到有相同标签的实例，没有匹配标签的请求会 100% 转发到其余未匹配的实例。如果您需要按比例的流量调度方案。

![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1699765960677-466bda30-cbfd-4afc-b4ba-f7bad6c7fd77.webp#averageHue=%23f2e7d0&clientId=u6651f3b6-abca-4&from=paste&id=uf51924c1&originHeight=401&originWidth=651&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=uc36f6e4e-8ab8-4d85-bcf1-8b0601d2442&title=)
上图中我们可以看到有两个机房分别是机房A、机房B，其中机房 A 只能访问到 Service A 和 Service B ，而机房B 只能访问到 Service C 和 Service D。要实现上面这种场景我们就需要用到标签路由。从机房 A 发起的调用携带标签 TAG_A 访问到 Service A 和 Service B，而从机房 B 发起的调用携带 TAG_B Service C 和 Service D 。
**测试时使用的Dubbo版本是2.7.3**

- **yaml配置**
```java
 provider:
#  统一版本号
    version: 1.0.0
#  静态标签，在dubbo-admin上可以添加动态标签，动态标签优先级高于静态标签 
    tag: wyz
```
```java
 consumer:
    timeout: 600000
    tag: wyz
  provider:
#  统一版本号
    version: 1.0.0
```

- **注解配置**
```java
@Service(version = "1.0.0", protocol = "dubbo",tag = "wyz")
```
```java
// @Reference注解里添加，这种用法写的太死
@Reference(version = "1.0.0", check = false, tag = "wyz")
//在服务调用前使用RpcContext传递标签，例
RpcContext.getContext().setAttachment(Constants.TAG_KEY,"wyz");
operatorUserService.login(loginName,loginPass);
```

- **动态配置**

可以直接通过 dubbo-admin进行配置：
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699777489985-a02ed251-4280-4190-bb2a-6344ccf3f82d.png#averageHue=%23f9f9f9&clientId=u6651f3b6-abca-4&from=paste&id=u5e12c479&originHeight=470&originWidth=1429&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=uc757cc27-46c7-4b38-b208-df3f3aafa57&title=)
这些配置可以分成全局配置和服务配置两类
**_全局配置_**
对应应用级全局路由规则配置。例如：
```
/dubbo/config/dubbo/user-info-server（应用名）.condition-router
```
上面 schema 配置中，应用名配置为为 user-info-server，即该条规则只对该应用生效。后缀 ".condition-router" 表明该条规则为条件路由。除此之外，还可用 ".tag-router" 表示标签路由。
**_服务配置_**
对应服务级所有路由规则配置。例如有如下规则 schema：
```
/dubbo/ com.ikurento.user.UserProvider（服务名） /routers
```
除了在控制面板 Dubbo Admin 中下发路由规则外，还可以在本地文件中配置相应的规则。比如说在文件 **_router_config.yml _**中配置：
```php
# dubbo router yaml configure file
priority: 1
force: true
conditions : ["host = 1.1.1.1 => host = 192.168.199.214"]
```
其他请参考官网文档

