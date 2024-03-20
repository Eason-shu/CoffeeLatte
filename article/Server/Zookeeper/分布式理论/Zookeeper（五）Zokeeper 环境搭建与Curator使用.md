---
title: Zookeeper（五）环境搭建与Curator使用
sidebar_position: 6
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
# 一 环境搭建
## 1.1 单机环境搭建

- 必要环境：JDK
- 下载地址：[https://zookeeper.apache.org/](https://zookeeper.apache.org/)
- 历史版本：[https://archive.apache.org/dist/zookeeper/](https://archive.apache.org/dist/zookeeper/)

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710900331491-e9c6e440-4180-4eb3-b14d-88bb3c43e752.png#averageHue=%23fdfbfa&clientId=udf22d4f8-6ace-4&from=paste&height=751&id=u2ed747c4&originHeight=751&originWidth=1902&originalType=binary&ratio=1&rotation=0&showTitle=false&size=117152&status=done&style=none&taskId=u337310d6-f4f5-4192-8591-4653d8e3441&title=&width=1902)
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710900351110-8eb7b330-03e5-4551-874b-30b578e4d340.png#averageHue=%23fefdfc&clientId=udf22d4f8-6ace-4&from=paste&height=901&id=u50940588&originHeight=901&originWidth=1836&originalType=binary&ratio=1&rotation=0&showTitle=false&size=120433&status=done&style=none&taskId=u2b0274d3-7d87-4295-9deb-37ae016c3d2&title=&width=1836)
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710900467708-476e23a1-9151-483d-8062-dd753d9d6258.png#averageHue=%23fdfafa&clientId=udf22d4f8-6ace-4&from=paste&height=525&id=ue4e93cdc&originHeight=525&originWidth=1933&originalType=binary&ratio=1&rotation=0&showTitle=false&size=18014&status=done&style=none&taskId=u907e1edd-eb81-4286-9609-8c1f5d20ac6&title=&width=1933)

- 我这里是本地环境，说名一下，无脑解压一下，放在本地环境目录

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710900630928-9f85d321-e728-4e05-a676-f9c8949b8bd4.png#averageHue=%23fdfdfc&clientId=udf22d4f8-6ace-4&from=paste&height=968&id=ud4dd429f&originHeight=968&originWidth=1717&originalType=binary&ratio=1&rotation=0&showTitle=false&size=80058&status=done&style=none&taskId=ufd809e0d-9fa2-4360-9ab8-8615cac4f78&title=&width=1717)

- 复制配置文件一份zoo_sample未zoo

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710900673000-0d46a722-77a8-46a4-ac9b-286d3b7e22e9.png#averageHue=%23fdfdfd&clientId=udf22d4f8-6ace-4&from=paste&height=922&id=u6049f9c0&originHeight=922&originWidth=1350&originalType=binary&ratio=1&rotation=0&showTitle=false&size=23933&status=done&style=none&taskId=uc404c567-237d-4816-b051-03b74325037&title=&width=1350)

- 修改配置文件

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710900703892-faddd40b-1845-4eb5-8d44-439a4186be63.png#averageHue=%23252121&clientId=udf22d4f8-6ace-4&from=paste&height=940&id=ub4cb458f&originHeight=940&originWidth=1815&originalType=binary&ratio=1&rotation=0&showTitle=false&size=185122&status=done&style=none&taskId=u737e65dd-f881-40ff-ba7a-8b099f7f7cd&title=&width=1815)

- 启动

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710900732097-c483cd5a-5fd6-4a33-9001-62793c13a5d5.png#averageHue=%23fbf9f9&clientId=udf22d4f8-6ace-4&from=paste&height=1000&id=u2320ad99&originHeight=1000&originWidth=1808&originalType=binary&ratio=1&rotation=0&showTitle=false&size=148994&status=done&style=none&taskId=u3ba7a831-0069-4357-a990-c41787d9e83&title=&width=1808)

- 查看

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710900751527-6a565d21-d69f-4bbf-9bb6-8fa97f41f81d.png#averageHue=%23191818&clientId=udf22d4f8-6ace-4&from=paste&height=1140&id=uc598e1de&originHeight=1140&originWidth=1920&originalType=binary&ratio=1&rotation=0&showTitle=false&size=177037&status=done&style=none&taskId=u20b1a384-05f6-4c4f-bb63-f2c52ae8c24&title=&width=1920)
## 1.2 可视化工具ZooKeeper Assistant

- 下载地址：[http://www.redisant.cn/za](http://www.redisant.cn/za)

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710900821769-9519e9ef-69c5-41ba-8218-872494e1563c.png#averageHue=%23fdfdfc&clientId=udf22d4f8-6ace-4&from=paste&height=699&id=uf42f4b07&originHeight=699&originWidth=1222&originalType=binary&ratio=1&rotation=0&showTitle=false&size=60209&status=done&style=none&taskId=u4ec7e6aa-ab49-4df1-8738-bb9558538a7&title=&width=1222)

- 查看状况

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710900840572-70000c3f-a880-494a-a586-4f158db35cc5.png#averageHue=%23fbfbfa&clientId=udf22d4f8-6ace-4&from=paste&height=694&id=ud0ee15b5&originHeight=694&originWidth=1212&originalType=binary&ratio=1&rotation=0&showTitle=false&size=48167&status=done&style=none&taskId=u3e593062-27cd-4ecb-8d3c-c1e71b360e9&title=&width=1212)
## 1.3 集群环境搭建

- 这里我是伪集群环境搭建，注意集群环境只能是奇数

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710900957539-cfb80a07-b89d-45eb-b829-08a39b5fafda.png#averageHue=%23eeeeed&clientId=udf22d4f8-6ace-4&from=paste&height=746&id=ucd31e0a6&originHeight=746&originWidth=1833&originalType=binary&ratio=1&rotation=0&showTitle=false&size=59919&status=done&style=none&taskId=u1209a761-e5b9-4c0a-922c-d95b35131dc&title=&width=1833)

- 这里我模拟三套服务器环境，一个主节点，两个从节点，主要是配置文件的变化
```
# The number of milliseconds of each tick
tickTime=2000
# The number of ticks that the initial 
# synchronization phase can take
initLimit=10
# The number of ticks that can pass between 
# sending a request and getting an acknowledgement
syncLimit=5
# the directory where the snapshot is stored.
# do not use /tmp for storage, /tmp here is just 
# example sakes.
dataDir=D:\\Tools\\Zookeeper\\ServerA\\data
dataLogDir=D:\\Tools\\Zookeeper\\ServerA\\log
# the port at which the clients will connect
clientPort=2181
# the maximum number of client connections.
# increase this if you need to handle more clients
#maxClientCnxns=60
#
# Be sure to read the maintenance section of the 
# administrator guide before turning on autopurge.
#
# https://zookeeper.apache.org/doc/current/zookeeperAdmin.html#sc_maintenance
#
# The number of snapshots to retain in dataDir
#autopurge.snapRetainCount=3
# Purge task interval in hours
# Set to "0" to disable auto purge feature
#autopurge.purgeInterval=1

## Metrics Providers
#
# https://prometheus.io Metrics Exporter
#metricsProvider.className=org.apache.zookeeper.metrics.prometheus.PrometheusMetricsProvider
#metricsProvider.httpHost=0.0.0.0
#metricsProvider.httpPort=7000
#metricsProvider.exportJvmInfo=true
server.1=localhost:2886:3886
server.2=localhost:2887:3887
server.3=localhost:2888:3888
```
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710901058967-64c4bba7-7781-4981-b429-25d1dbac4fb8.png#averageHue=%2320201f&clientId=udf22d4f8-6ace-4&from=paste&height=237&id=ue45424a4&originHeight=237&originWidth=1795&originalType=binary&ratio=1&rotation=0&showTitle=false&size=50905&status=done&style=none&taskId=u195ace8b-56f0-4c9f-8eac-6d5ae12ae8e&title=&width=1795)
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710901073950-79d87d08-7fef-41aa-ac0c-fb2e09e7f2c2.png#averageHue=%23202020&clientId=udf22d4f8-6ace-4&from=paste&height=174&id=u4b4b62b6&originHeight=174&originWidth=1758&originalType=binary&ratio=1&rotation=0&showTitle=false&size=28416&status=done&style=none&taskId=u0cf7ca86-aede-4295-a803-27b738f1b79&title=&width=1758)
server.A=B:C:D;其中 A 是一个数字，表示这个是第几号服务器；B 是这个服务器的 ip 地址；C 表示的是这个服务器与集群中的 Leader 服务器交换信息的端口；D 表示的是万一集群中的 Leader 服务器挂了，需要一个端口来重新进行选举，选出一个新的 Leader，而这个端口就是用来执行选举时服务器相互通信的端口。如果是伪集群的配置方式，由于 B 都是一样，所以不同的 Zookeeper 实例通信端口号不能一样，所以要给它们分配不同的端口号。

- myid 建立，依次写入1，2，3，id被称为Server ID，用来标识该机器在集群中的机器序号。同时，在每台ZooKeeper机器上，我们都需要在数据目录（即dataDir参数指定的那个目录）下创建一个 myid文件，该文件只有一行内容，并且是一个数字，即对应于每台机器的Server ID数字。

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710901175683-f959ee0d-b6d6-4034-aadc-32c56f9664c5.png#averageHue=%23faf7f6&clientId=udf22d4f8-6ace-4&from=paste&height=733&id=u7f2211c7&originHeight=733&originWidth=2023&originalType=binary&ratio=1&rotation=0&showTitle=false&size=98619&status=done&style=none&taskId=u16931d8c-193a-4d48-81f9-197632d6abd&title=&width=2023)

- 后面的B,C一样的，一键启动脚本
```
@echo off
start cmd /k "cd /d D:\Tools\Zookeeper\ServerA\bin && call zkServer.cmd"
echo Starting ZooKeeper ServerA...
start cmd /k "cd /d D:\Tools\Zookeeper\ServerB\bin && call zkServer.cmd"
echo Starting ZooKeeper ServerB...
start cmd /k "cd /d D:\Tools\Zookeeper\ServerC\bin && call zkServer.cmd"
echo Starting ZooKeeper ServerC...
echo All ZooKeeper servers have been started.
```

- 查看启动日志可以看到主从节点情况

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710902132359-ee02dc86-6088-486d-82a1-79f936256ccc.png#averageHue=%232b2929&clientId=udf22d4f8-6ace-4&from=paste&height=577&id=u046991a2&originHeight=577&originWidth=2014&originalType=binary&ratio=1&rotation=0&showTitle=false&size=160217&status=done&style=none&taskId=u04b411e3-8b6d-4aad-8771-d3f34e22796&title=&width=2014)
# 二 常用命令
## 1.1 命令行语法
| **命令行语法** | **功能描述** |
| --- | --- |
| help | 显示所有操作命令 |
| ls path | 使用ls命令来查看当前znode的子节点[可监听], -w 监听子节点变化, -s 附加次级信息 |
| create | 普通创建, -s 含有序列, -e 临时(重启或超时消失) |
| get path | 获得节点的值[可监听] -w 监听节点内容变化, -s 附加次级信息 |
| set | 设置节点的具体值 |
| stat | 查看节点的状态 |
| delete | 删除节点 |
| deleteall | 递归删除节点 |

## 1.2 数据节点信息
```
[zk: bigdata01:2181(CONNECTED) 5] ls -s /
[zookeeper]cZxid = 0x0
ctime = Thu Jan 01 08:00:00 CST 1970
mZxid = 0x0
mtime = Thu Jan 01 08:00:00 CST 1970
pZxid = 0x0
cversion = -1
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 0
numChildren = 1
```

1. cZxid: 创建的事务zxid
每次修改Zookeeper状态都会产生一个zookeeper事务ID, 事务ID是Zookeeper中所有修改总的次序. 每次修改都有唯一的zxid, 如果zxid1小于zxid2, 那么zxid1在zxid2之前发生.
2. ctime: znode被创建的毫秒数(从1970开始)
3. mzxid: znode最后更新的事务zxid
4. mtime: znode最后修改的毫秒数(从1970开始)
5. pZxid: znode最后更新的子节点zxid
6. cversion: znode子节点变化号, znode子节点修改次数
7. dataversion：znode 数据变化号
8. aclVersion：znode 访问控制列表的变化号
9. ephemeralOwner：如果是临时节点，这个是 znode 拥有者的 session id。如果不是临时节点则是 0。
10. dataLength：znode 的数据长度
11. numChildren：znode 子节点数量
## 1.3 节点类型
![](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710902393875-0597ee67-d8c3-464f-baa0-4f40072bbdd2.png#averageHue=%23dcd6bb&clientId=udf22d4f8-6ace-4&from=paste&id=u8e49a769&originHeight=716&originWidth=1414&originalType=url&ratio=1&rotation=0&showTitle=false&status=done&style=none&taskId=u3a4777e0-615d-406d-b9a6-31b83d709b9&title=)
这个命令就需要自己去练了
# 三 CuratorAPI使用
## 3.1 依赖
```
        <dependency>
            <groupId>org.apache.curator</groupId>
            <artifactId>curator-framework</artifactId>
            <version>4.0.0</version>
        </dependency>
        <dependency>
            <groupId>org.apache.curator</groupId>
            <artifactId>curator-recipes</artifactId>
            <version>4.0.0</version>
        </dependency>
        <dependency>
            <groupId>org.apache.curator</groupId>
            <artifactId>curator-x-discovery</artifactId>
            <version>4.0.0</version>
        </dependency>
        <dependency>
            <groupId>org.apache.curator</groupId>
            <artifactId>curator-test</artifactId>
            <version>4.0.0</version>
            <scope>test</scope>
        </dependency>
```
## 3.1 创建会话
使用CuratorFrameworkFactory这个工厂类的两个静态方法来创建一个客户端
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710903339130-d540f5d5-db20-45e8-91de-2f42a00608b8.png#averageHue=%23f3f3f3&clientId=udf22d4f8-6ace-4&from=paste&height=199&id=ubdc2eca9&originHeight=199&originWidth=853&originalType=binary&ratio=1&rotation=0&showTitle=false&size=45090&status=done&style=none&taskId=udeede970-0633-4ae6-8582-db7a2a6df58&title=&width=853)
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710903354256-8187e737-53e3-4ab7-930c-079fa1fe0bfc.png#averageHue=%23e5e5e5&clientId=udf22d4f8-6ace-4&from=paste&height=253&id=u13f645b9&originHeight=253&originWidth=833&originalType=binary&ratio=1&rotation=0&showTitle=false&size=84050&status=done&style=none&taskId=udfe30d51-6d9a-4c3b-8a70-f4cfe3e6a71&title=&width=833)
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710903365956-c0034113-c852-493b-8bc9-078cb54999f3.png#averageHue=%23f0f0f0&clientId=udf22d4f8-6ace-4&from=paste&height=294&id=uc038f20f&originHeight=294&originWidth=892&originalType=binary&ratio=1&rotation=0&showTitle=false&size=61570&status=done&style=none&taskId=u75716502-ffdb-42d4-97fd-e3eccc29363&title=&width=892)
```java
package com.shu;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.retry.ExponentialBackoffRetry;
import org.apache.zookeeper.ZooDefs;
import org.apache.zookeeper.data.ACL;

import java.util.ArrayList;
import java.util.List;

/**
 * @author 31380
 * @description
 * @create 2024/3/16 18:39
 */
public class CuratorUtils {

    /**
     * 创建连接
     *
     * @param connectionString  连接地址
     * @param sessionTimeout    会话超时时间
     * @param connectionTimeout 连接超时时间
     * @return
     */
    public static CuratorFramework createCuratorFramework(String connectionString, int sessionTimeout, int connectionTimeout) {
        return CuratorFrameworkFactory.builder()
        .connectString(connectionString)
        .sessionTimeoutMs(sessionTimeout)
        .retryPolicy(new ExponentialBackoffRetry(1000, 3))
        .connectionTimeoutMs(connectionTimeout)
        .build();
    }


    /**
     * 创建连接
     *
     * @param connectionString  连接地址
     * @param sessionTimeout    会话超时时间
     * @param connectionTimeout 连接超时时间
     * @param retryPolicy       重试策略
     * @return
     */
    public static CuratorFramework createCuratorFrameworkWithRetry(String connectionString,
                                                                   int sessionTimeout,
                                                                   int connectionTimeout,
                                                                   RetryPolicy retryPolicy
                                                                  ) {
        return CuratorFrameworkFactory.builder()
        .connectString(connectionString)
        .sessionTimeoutMs(sessionTimeout)
        .connectionTimeoutMs(connectionTimeout)
        .retryPolicy(retryPolicy)
        .build();

    }


    /**
     * 创建一个隔离的命名空间
     */
    public static CuratorFramework createNamespaceCuratorFramework(String connectionString, int sessionTimeout, int connectionTimeout, String namespace) {
        return CuratorFrameworkFactory.builder()
        .connectString(connectionString)
        .sessionTimeoutMs(sessionTimeout)
        .connectionTimeoutMs(connectionTimeout)
        .namespace(namespace)
        .retryPolicy(new ExponentialBackoffRetry(1000, 3))
        .build();
    }




    /**
     * ZooDefs.Perms.READ：读权限
     * ZooDefs.Perms.WRITE：写权限
     * ZooDefs.Perms.CREATE：创建子节点权限
     * ZooDefs.Perms.DELETE：删除权限
     * ZooDefs.Perms.ADMIN：管理权限
     * ZooDefs.Perms.ALL：所有权限
     * 以下是一些常用的身份验证方案：
     * Ids.ANYONE_ID_UNSAFE：表示任何人都可以访问
     * Ids.AUTH_IDS：表示使用已验证的用户身份
     * Ids.OPEN_ACL_UNSAFE：表示开放的ACL，任何人都可以访问
     *  ACL acl = new ACL(ZooDefs.Perms.READ, new Id("myUser", "myPassword"));
     * @return
     */
    public static List<ACL> getAclList() {
        ArrayList<ACL> acls = new ArrayList<>();
        // 权限设置
        ACL acl = new ACL(ZooDefs.Perms.ALL, ZooDefs.Ids.ANYONE_ID_UNSAFE);
        // 添加权限
        acls.add(acl);
        return acls;
    }

}

```
## 3.2 基本使用增删改查

- 新增
```java
package com.shu.base;


import com.shu.CuratorUtils;
import org.apache.curator.framework.CuratorFramework;
import org.apache.zookeeper.CreateMode;

import java.util.List;

/**
 * @author 31380
 * @description
 * @create 2024/3/16 18:43
 */
public class CuratorCreatTest {


    /**
     * 总结：curator创建节点方法
     * 1.创建节点，如果节点已经存在则抛出异常 create().forPath()
     * 2.withMode()：节点类型: CreateMode.EPHEMERAL 临时节点，CreateMode.PERSISTENT 永久节点
     * 3.递归创建节点 creatingParentsIfNeeded()
     * 4.查询所有子节点 getChildren().forPath()
     * 5.删除节点 delete().forPath()
     * 6.判断节点是否存在 checkExists().forPath()
     * 7.关闭连接 close()
     * @param args
     * @throws Exception
     */
    public static void main(String[] args) throws Exception {
        CuratorFramework curatorClint = CuratorUtils.createCuratorFramework("127.0.0.1:2181", 1000, 1000);
        System.out.println("连接成功！");
        curatorClint.start();
        // 创建节点，如果节点已经存在则抛出异常
        try {
            curatorClint.create().forPath("/test");
        } catch (Exception e) {
            System.out.println("创建节点失败！"+e.getMessage());
        }
        // 删除节点
        try {
            curatorClint.delete().forPath("/test");
            System.out.println("删除节点成功！");
        } catch (Exception e) {
            System.out.println("删除节点失败！"+e.getMessage());
        }

        /**
         * 临时节点（EPHEMERAL）：临时创建的，会话结束节点自动被删除，也可以手动删除，临时节点不能拥有子节点.
         * 持久节点（PERSISTENT）：创建后永久存在，除非主动删除。
         */
        // 临时节点，当会话结束后，节点自动删除
        curatorClint.create().withMode(CreateMode.EPHEMERAL)
                .forPath("/secondPath", "hello,word".getBytes());
        System.out.println("临时节点："+new String(curatorClint.getData().forPath("/secondPath")));

        // 永久节点
        curatorClint.create().withMode(CreateMode.PERSISTENT)
                .forPath("/thirdPath", "hello,word".getBytes());
        System.out.println("永久节点："+new String(curatorClint.getData().forPath("/thirdPath")));

         // 递归创建节点
        curatorClint.create().creatingParentsIfNeeded()
                .withMode(CreateMode.PERSISTENT)
                .forPath("/parent/child", "hello,word".getBytes());
        System.out.println("递归创建节点："+new String(curatorClint.getData().forPath("/parent/child")));

        // 查询所有子节点
        List<String> list= curatorClint.getChildren().forPath("/");
        System.out.println(list);

        // 关闭连接
        curatorClint.close();


    }
}

```

- 读取
```java
package com.shu.base;

import com.shu.CuratorUtils;
import org.apache.curator.framework.CuratorFramework;
import org.apache.zookeeper.data.Stat;

import java.util.Date;

/**
 * @author 31380
 * @description 读取节点数据
 * @create 2024/3/17 11:28
 */
public class CuratorReadTest {

    /**
     * 总结：
     * 1. 读取单个节点数据：curatorClint.getData().forPath("/base/test")
     * 2. 读取多个节点数据：curatorClint.getChildren().forPath("/test").forEach(System.out::println)
     * 3. 读取节点数据并获取 stat：curatorClint.getData().storingStatIn(stat).forPath("/base/test")
     * 4：Stat：节点状态,包含节点的版本、数据长度、子节点数量、创建时间、修改时间、最近一次修改的事务 ID、数据版本、ACL 版本、临时节点
     * @param args
     */
    public static void main(String[] args) {
        // 地址
        String connectString = "127.0.0.1:2181"; // 确保连接字符串正确

        CuratorFramework curatorClint = CuratorUtils.createCuratorFramework(connectString, 1000, 1000);
        System.out.println("连接成功！");
        curatorClint.start();
        // 读取单个节点数据
        try {
            byte[] bytes = curatorClint.getData().forPath("/base/test");
            System.out.println(new String(bytes));
            System.out.println("读取节点数据成功！");
        } catch (Exception e) {
            System.out.println("读取节点数据失败！"+e.getMessage());
        }
        // 读取多个节点数据
        try {
            curatorClint.getChildren().forPath("/test").forEach(System.out::println);
            System.out.println("读取多个节点数据成功！");
        } catch (Exception e) {
            System.out.println("读取多个节点数据失败！"+e.getMessage());
        }
        try {
            Stat stat = new Stat();
            byte[] data = curatorClint.getData().storingStatIn(stat).forPath("/base/test");
            String dataString = new String(data);
            System.out.println("节点数据：" + dataString);
            System.out.println("节点状态：");
            System.out.println("  节点创建版本：" + stat.getCversion());
            System.out.println("  数据长度：" + stat.getDataLength());
            System.out.println("  子节点数量：" + stat.getNumChildren());
            System.out.println("  创建时间：" + new Date(stat.getCtime()));
            System.out.println("  修改时间：" + new Date(stat.getMtime()));
            System.out.println("  最近一次修改的事务 ID：" + stat.getMzxid());
            System.out.println("  数据版本：" + stat.getVersion());
            System.out.println("  ACL 版本：" + stat.getAversion());
            System.out.println("  临时节点：" + stat.getEphemeralOwner());
            System.out.println("读取节点数据并获取 stat 成功！");
        } catch (Exception e) {
            System.out.println("读取节点数据并获取 stat 失败：" + e.getMessage());
        }




        // 关闭连接
        curatorClint.close();

    }
}

```

- 删除
```java
package com.shu.base;

import com.shu.CuratorUtils;
import org.apache.curator.framework.CuratorFramework;

/**
 * @author 31380
 * @description
 * @create 2024/3/16 19:25
 */
public class CuratorDeleteTest {
    /**
     * 总结：
     * 1. 删除节点：delete().forPath("/test")
     * 2. 如果存在子节点，删除子节点：delete().deletingChildrenIfNeeded().forPath("/parent")
     * 3. 递归删除节点：delete().deletingChildrenIfNeeded().forPath("/secondPath")
     * 4. 判断节点是否存在：checkExists().forPath("/secondPath")
     * 5. 关闭连接：close()
     * @param args
     * @throws Exception
     */
    public static void main(String[] args) throws Exception {
        CuratorFramework curatorClint = CuratorUtils.createCuratorFramework("127.0.0.1:2181", 1000, 1000);
        System.out.println("连接成功！");
        curatorClint.start();
        // 删除节点
        try {
            curatorClint.delete().forPath("/test");
            System.out.println("删除节点成功！");
        } catch (Exception e) {
            System.out.println("删除节点失败！"+e.getMessage());
        }
        // 如果存在子节点，删除子节点
        try {
            curatorClint.delete().deletingChildrenIfNeeded().forPath("/parent");
            System.out.println("删除节点成功！");
        } catch (Exception e) {
            System.out.println("删除节点失败！"+e.getMessage());
        }
        // 递归删除节点
        curatorClint.delete().deletingChildrenIfNeeded().forPath("/secondPath");
        // 判断节点是否存在
        if (curatorClint.checkExists().forPath("/secondPath") == null) {
            System.out.println("节点不存在！");
        } else {
            System.out.println("节点存在！");
        }

        // 关闭连接
        curatorClint.close();
    }
}

```

- 修改
```java
package com.shu.base;

import com.shu.CuratorUtils;
import org.apache.curator.framework.CuratorFramework;
import org.apache.zookeeper.data.Stat;

/**
 * @author 31380
 * @description
 * @create 2024/3/17 11:35
 */
public class CuratorUpdateTest {
    /**
     * 总计
     * 1. 更新节点：setData().forPath("/test", "hello,word".getBytes())
     * 2. 指定版本更新节点：setData().withVersion(1).forPath("/test", "hello,word".getBytes())
     * @param args
     */
    public static void main(String[] args) throws Exception {
        // 地址
        String connectString = "127.0.0.1:2181";
        //创建节点
        CuratorFramework curatorClint = CuratorUtils.createCuratorFramework(connectString, 1000, 1000);
        System.out.println("连接成功！");
        curatorClint.start();
        // 更新节点
        try {
            curatorClint.setData().forPath("/base/test", "hello,word1111".getBytes());
            // 获取节点数据
            byte[] bytes = curatorClint.getData().forPath("/base/test");
            System.out.println(new String(bytes));
            System.out.println("更新节点成功！");
        } catch (Exception e) {
            System.out.println("更新节点失败！"+e.getMessage());
        }
        // 先获取节点的版本号
        Stat stat = new Stat();
        byte[] data = curatorClint.getData().storingStatIn(stat).forPath("/base/test");
        String dataString = new String(data);
        System.out.println("节点数据：" + dataString);
        System.out.println("节点状态：");
        System.out.println("  数据版本：" + stat.getVersion());
        // 指定版本更新节点：CAS 机制
        try {
            curatorClint.setData().withVersion(stat.getVersion()).forPath("/base/test", "hello,word2222".getBytes());
            // 获取节点数据
            byte[] bytes = curatorClint.getData().forPath("/base/test");
            System.out.println(new String(bytes));
            System.out.println("更新节点成功！");
        } catch (Exception e) {
            System.out.println("更新节点失败！"+e.getMessage());
        }


    }
}

```

- 异步创建
```java
package com.shu.base;

import com.shu.CuratorUtils;
import org.apache.curator.framework.CuratorFramework;
import org.apache.zookeeper.CreateMode;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * @author 31380
 * @description Curator异步操作
 * @create 2024/3/17 11:42
 */
public class CuratorAyncTest {
    /**
     * 总结：
     * 1 异步操作：inBackground()
     * 2.创建节点，如果节点已经存在则抛出异常 create().forPath()
     * 3.递归创建节点 creatingParentsIfNeeded()
     * @param args
     * @throws Exception
     */
    public static void main(String[] args) throws Exception {
        // 地址
        String connectString = "127.0.0.1:2181";
        //创建节点
        CuratorFramework curatorClint = CuratorUtils.createCuratorFramework(connectString, 1000, 1000);
        System.out.println("连接成功！");
        curatorClint.start();
        CountDownLatch cdl = new CountDownLatch(2);
        ExecutorService executorService = Executors.newFixedThreadPool(2);
        curatorClint.create().creatingParentsIfNeeded().withMode(CreateMode.EPHEMERAL).inBackground((client, event) -> {
            System.out.println("Code：" + event.getResultCode());
            System.out.println("Type：" + event.getType());
            System.out.println("Path：" + event.getPath());
            cdl.countDown();
        }, executorService).forPath("/test1", "hello,word".getBytes());

        curatorClint.create().creatingParentsIfNeeded().withMode(CreateMode.EPHEMERAL).inBackground((client, event) -> {
            System.out.println("Code：" + event.getResultCode());
            System.out.println("Type：" + event.getType());
            System.out.println("Path：" + event.getPath());
            cdl.countDown();
        }).forPath("/test2", "hello,word".getBytes());
        cdl.await();
        executorService.shutdown();
        curatorClint.close();



    }







    /**
     * 事件类型
     * CREATE, // 创建
     * DELETE, // 删除
     * EXISTS, // 存在
     * GET_DATA, // 获取数据
     * SET_DATA, // 设置数据
     * CHILDREN, // 子节点
     * SYNC, // 同步
     * GET_ACL, // 获取ACL
     * SET_ACL, // 设置ACL
     * TRANSACTION, // 事务
     * GET_CONFIG, // 获取配置
     * RECONFIG, // 重新配置
     * WATCHED, // 监听
     * REMOVE_WATCHES, // 移除监听
     * CLOSING; // 关闭
     * @param args
     */

    /**
     * 响应码
     * OK(0), // OK
     * CONNECTIONLOSS(-4), // 连接丢失
     * MARSHALLINGERROR(-7), // 编组错误
     * UNIMPLEMENTED(-9), // 未实现
     * OPERATIONTIMEOUT(-10), // 操作超时
     * BADARGUMENTS(-8), // 错误参数
     * APIERROR(-100), // API错误
     * NONODE(-101), // 无节点·
     */

}

```

- 不同的顺序节点
```java
package com.shu.base;

import com.shu.CuratorUtils;
import org.apache.curator.framework.CuratorFramework;
import org.apache.zookeeper.CreateMode;

/**
 * @author 31380
 * @description
 * @create 2024/3/17 11:03
 */
public class CuratorSEQCreat {
    /**
     * 临时顺序节点（EPHEMERAL_SEQUENTIAL）：具有临时节点特征，但是它会有序列号。
     * 持久顺序节点（PERSISTENT_SEQUENTIAL）：具有持久节点特征，但是它会有序列号。
     * @param args
     */
    public static void main(String[] args) {
        CuratorFramework curatorClint = CuratorUtils.createCuratorFramework("127.0.0.1:2181", 1000, 1000);
        System.out.println("连接成功！");
        curatorClint.start();
        // 创建一个持久顺序节点A-1,A-2,A-3
        try {
            curatorClint.create().creatingParentsIfNeeded().withMode(CreateMode.PERSISTENT_SEQUENTIAL).forPath("/test/A", "hello,word".getBytes());
            curatorClint.create().creatingParentsIfNeeded().withMode(CreateMode.PERSISTENT_SEQUENTIAL).forPath("/test/A", "hello,word".getBytes());
            curatorClint.create().creatingParentsIfNeeded().withMode(CreateMode.PERSISTENT_SEQUENTIAL).forPath("/test/A", "hello,word".getBytes());
            System.out.println("创建节点成功！");
        } catch (Exception e) {
            System.out.println("创建节点失败！"+e.getMessage());
        }
        // 创建一个临时顺序节点B-1,B-2,B-3
        try {
            curatorClint.create().creatingParentsIfNeeded().withMode(CreateMode.EPHEMERAL_SEQUENTIAL).forPath("/test/B", "hello,word".getBytes());
            curatorClint.create().creatingParentsIfNeeded().withMode(CreateMode.EPHEMERAL_SEQUENTIAL).forPath("/test/B", "hello,word".getBytes());
            curatorClint.create().creatingParentsIfNeeded().withMode(CreateMode.EPHEMERAL_SEQUENTIAL).forPath("/test/B", "hello,word".getBytes());
            System.out.println("创建节点成功！");
        } catch (Exception e) {
            System.out.println("创建节点失败！"+e.getMessage());
        }
        // 关闭连接
        curatorClint.close();
    }
}

```

- 事务
```java
package com.shu.base;

import com.shu.CuratorUtils;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.api.transaction.CuratorTransactionResult;

import java.util.Collection;

/**
 * @author 31380
 * @description TODO
 * @create 2024/3/16 19:28
 */
public class CuratorTransactionTest {
    public static void main(String[] args) throws Exception {
        CuratorFramework curatorClint = CuratorUtils.createCuratorFramework("127.0.0.1:2181", 1000, 1000);
        System.out.println("连接成功！");
        curatorClint.start();
        Collection<CuratorTransactionResult> commit = curatorClint.inTransaction()
                .create().forPath("/xiao", "456".getBytes()).and()
                .setData().forPath("/xiao", "123".getBytes()).and()
                .commit();
        for (CuratorTransactionResult result : commit) {
            System.out.println(result.getForPath() + "--->" + result.getType());
        }

        curatorClint.close();
    }
}

```
## 3.3 ACL权限控制
```java
package com.shu.acl;

import com.shu.CuratorUtils;
import org.apache.curator.framework.CuratorFramework;

/**
 * @author 31380
 * @description
 * @create 2024/3/16 19:56
 */
public class CuratorAclTest {
    public static void main(String[] args) {
        CuratorFramework curatorClint = CuratorUtils.createCuratorFramework("127.0.0.1:2181", 1000, 1000);
        System.out.println("连接成功！");
        curatorClint.start();
        // 创建节点，ACL为ip:
        try {
            curatorClint.create().withACL(CuratorUtils.getAclList()).forPath("/test");
            System.out.println("创建节点成功！");
        } catch (Exception e) {
            System.out.println("创建节点失败！"+e.getMessage());
        }

    }
}


/**
 * @description
 * @author 31380
 * @create 2024/3/17 11:12
 * Schema 代表权限控制模式，分别为：
 * ● World 任何人
 * ● Auth 不需要ID
 * ● Digest 用户名和密码方式的认证
 * ● IP Address IP地址方式的认证
 * perms(权限)，ZooKeeper支持如下权限
 * ● CREATE: 创建子节点
 * ● READ： 获取子节点与自身节点的数据信息
 * ● WRITE：在Znode节点上写数据
 * ● DELETE：删除子节点
 * ● ADMIN：设置ACL权限
 * ————————————————
 */
package com.shu.acl;
```
## 3.4 分布式锁
```java
package com.shu.lock;

import com.shu.CuratorUtils;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.recipes.locks.InterProcessMutex;

import java.text.SimpleDateFormat;
import java.util.concurrent.CountDownLatch;

/**
 * @author 31380
 * @description 分布式锁
 * @create 2024/3/17 13:12
 */
public class LockTest {
    /**
     * 分布式锁：InterProcessMutex
     * 1: 获取锁，acquire()
     * 2: 释放锁，release()
     * 3: 创建 InterProcessMutex 对象
     * 4: 调用 acquire() 方法获取锁
     * 5: 业务操作
     * 6: 调用 release() 方法释放锁
     * @param args
     */
    public static void main(String[] args) {
        CountDownLatch latch = new CountDownLatch(10);
        String connectString = "127.0.0.1:2181";
        String lockPath = "/lock";
        CuratorFramework curatorFramework = CuratorUtils.createCuratorFramework(connectString, 1000, 1000);
        curatorFramework.start();
        InterProcessMutex lock = new InterProcessMutex(curatorFramework, lockPath);
        for (int i = 0; i < 10; i++) {
            new Thread(() -> {
                try {
                    latch.await();
                    lock.acquire();
                    System.out.println(Thread.currentThread().getName() + "获取到锁");
                    // 模拟业务操作，生成订单号
                    Thread.sleep(1000);
                    SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss|SSS");
                    String orderNo = sdf.format(System.currentTimeMillis());
                    System.out.println("生成的订单号：" + orderNo);
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    try {
                        lock.release();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }, "Thread-" + i).start();
            latch.countDown();
        }







    }
}

```
## 3.5 分布式计数器
```java
package com.shu.lock;

import com.shu.CuratorUtils;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.recipes.atomic.AtomicValue;
import org.apache.curator.framework.recipes.atomic.DistributedAtomicInteger;

/**
 * @author 31380
 * @description 分布式计数器
 * @create 2024/3/17 13:20
 */
public class RecipeDisAtomicIntTest {
    /**
     * 分布式计数器：DistributedAtomicInteger
     * 1、创建DistributedAtomicInteger对象
     * 2、调用add方法
     * 3、获取当前值
     *
     * @param args
     */
    public static void main(String[] args) {

        String connectString = "127.0.0.1:2181";
        String connectString2 = "127.0.0.1:2182";
        String connectString3 = "127.0.0.1:2183";
        CuratorFramework curatorFramework = CuratorUtils.createCuratorFramework(connectString, 1000, 1000);
        curatorFramework.start();
        DistributedAtomicInteger atomicInteger = new DistributedAtomicInteger(curatorFramework, "/atomic", null);
        try {
            AtomicValue<Integer> added = atomicInteger.add(1);
            System.out.println("1Result: " + added.succeeded());
            // 获取当前值
            System.out.println("2Result: " + added.postValue());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        // 客户端2
        CuratorFramework curatorFramework2 = CuratorUtils.createCuratorFramework(connectString2, 1000, 1000);
        curatorFramework2.start();
        DistributedAtomicInteger atomicInteger2 = new DistributedAtomicInteger(curatorFramework2, "/atomic", null);
        try {
            AtomicValue<Integer> added = atomicInteger2.add(1);
            System.out.println("2Result: " + added.succeeded());
            // 获取当前值
            System.out.println("2Result: " + added.postValue());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        // 客户端3
        CuratorFramework curatorFramework3 = CuratorUtils.createCuratorFramework(connectString3, 1000, 1000);
        curatorFramework3.start();
        DistributedAtomicInteger atomicInteger3 = new DistributedAtomicInteger(curatorFramework3, "/atomic", null);
        try {
            AtomicValue<Integer> added = atomicInteger3.add(1);
            System.out.println("3Result: " + added.succeeded());
            // 获取当前值
            System.out.println("3Result: " + added.postValue());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}

```
## 3.6 分布式Barrier
```java
package com.shu.lock;

import com.shu.CuratorUtils;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.recipes.barriers.DistributedBarrier;

/**
 * @author 31380
 * @description
 * 分布式Barrier:分布式 Barrier 是一种常见的同步原语，用于在分布式系统中协调多个进程或线程的执行顺序。
 * 它可以用来实现诸如等待直到所有参与者都准备好，然后一起执行某项任务，或者等待直到某些条件达成后再继续执行的场景。
 * @create 2024/3/17 13:27
 */
public class CycliBarrierTest {
    static DistributedBarrier barrier;
    public static void main(String[] args) {
        String connectString = "127.0.0.1:2181";
        String path="/barrier";
        CuratorFramework curatorFramework = CuratorUtils.createCuratorFramework(connectString, 1000, 1000);
        curatorFramework.start();

        // 等待所有的线程到达barrier 10个线程
        for (int i = 0; i < 10; i++) {
            new Thread(() -> {
                try {
                    barrier = new DistributedBarrier(curatorFramework, path);
                    System.out.println(Thread.currentThread().getName() + "号barrier设置");
                    barrier.setBarrier();
                    barrier.waitOnBarrier();
                    System.out.println("启动...");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }, "Thread-" + i).start();
        }
        try {
            Thread.sleep(2000);
            barrier.removeBarrier();
        } catch (Exception e) {
            e.printStackTrace();
        }

    }
}

```
## 3.7 主从节点选举
```java
package com.shu.master;

import com.shu.CuratorUtils;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.recipes.leader.LeaderSelector;
import org.apache.curator.framework.recipes.leader.LeaderSelectorListenerAdapter;

/**
 * @author 31380
 * @description 主节点选举
 * @create 2024/3/17 13:03
 */
public class MasterSelectTest {
    /**
     * 主节点选举：LeaderSelector
     * 1、创建LeaderSelector对象
     * 2、调用start方法
     * 3、添加监听器
     * 4、关闭连接
     * @param args
     */
    public static void main(String[] args) {
            // 地址
            String connectString = "127.0.0.1:2181";
            String connectString2 = "127.0.0.1:2182";
            String connectString3 = "127.0.0.1:2183";
            // 创建并连接 CuratorFramework 实例
            CuratorFramework curatorFramework1 = CuratorUtils.createCuratorFramework(connectString, 1000, 1000);
            CuratorFramework curatorFramework2 = CuratorUtils.createCuratorFramework(connectString2, 1000, 1000);
            CuratorFramework curatorFramework3 = CuratorUtils.createCuratorFramework(connectString3, 1000, 1000);
            curatorFramework1.start();
            curatorFramework2.start();
            curatorFramework3.start();
            // 第一个节点
            LeaderSelector leaderSelector1 = new LeaderSelector(curatorFramework1, "/master1", new LeaderSelectorListenerAdapter() {
                @Override
                public void takeLeadership(CuratorFramework curatorFramework) throws Exception {
                    System.out.println("节点1成为master节点");
                    Thread.sleep(10000);
                    System.out.println("节点1完成master操作，释放master权利");
                }
            });
            leaderSelector1.autoRequeue();
            leaderSelector1.start();

            // 第二个节点
            LeaderSelector leaderSelector2 = new LeaderSelector(curatorFramework2, "/master1", new LeaderSelectorListenerAdapter() {
                @Override
                public void takeLeadership(CuratorFramework curatorFramework) throws Exception {
                    System.out.println("节点2成为master节点");
                    Thread.sleep(10000);
                    System.out.println("节点2完成master操作，释放master权利");
                }
            });
            leaderSelector2.autoRequeue();
            leaderSelector2.start();

            // 第三个节点
            LeaderSelector leaderSelector3 = new LeaderSelector(curatorFramework3, "/master1", new LeaderSelectorListenerAdapter() {
                @Override
                public void takeLeadership(CuratorFramework curatorFramework) throws Exception {
                    System.out.println("节点3成为master节点");
                    Thread.sleep(10000);
                    System.out.println("节点3完成master操作，释放master权利");
                }
            });
            leaderSelector3.autoRequeue();
            leaderSelector3.start();

            try {
                Thread.sleep(Integer.MAX_VALUE);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

}
```
## 3.8 NodeCache监听
```java
package com.shu.watch;

import com.shu.CuratorUtils;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.recipes.cache.NodeCache;
import org.apache.curator.framework.recipes.cache.NodeCacheListener;

/**
 * @author 31380
 * @description
 * @create 2024/3/16 19:38
 */
public class CuratorNodeCacheTest {
    /**
     * NodeCache：监听节点的新增、修改操作
     * 1、创建NodeCache对象
     * 2、调用start方法
     * 3、添加监听器
     * 4、关闭连接
     * @param args
     * @throws Exception
     */
    public static void main(String[] args) throws Exception {
        String path = "/test";
        CuratorFramework curatorClint = CuratorUtils.createCuratorFramework("127.0.0.1:2181", 1000, 1000);
        System.out.println("连接成功！");
        curatorClint.start();
        final NodeCache nodeCache = new NodeCache(curatorClint, path);
        nodeCache.start();
        nodeCache.getListenable().addListener(new NodeCacheListener() {
            @Override
            public void nodeChanged() throws Exception {
                System.out.println("监听事件触发");
                System.out.println("重新获得节点内容为：" + new String(nodeCache.getCurrentData().getData()));
            }
        });
        curatorClint.setData().forPath(path,"456".getBytes());
        curatorClint.setData().forPath(path,"789".getBytes());
        curatorClint.setData().forPath(path,"123".getBytes());
        curatorClint.setData().forPath(path,"222".getBytes());
        curatorClint.setData().forPath(path,"333".getBytes());
        curatorClint.setData().forPath(path,"444".getBytes());
        Thread.sleep(15000);
    }
}
```
## 3.9 PathChildrenCache监听
```java
package com.shu.watch;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.cache.PathChildrenCache;
import org.apache.curator.framework.recipes.cache.PathChildrenCacheEvent;
import org.apache.curator.framework.recipes.cache.PathChildrenCacheListener;
import org.apache.curator.retry.ExponentialBackoffRetry;
import org.apache.zookeeper.CreateMode;

/**
 * @author 31380
 * @description
 * @create 2024/3/16 19:43
 */
public class CuratorPathChildrenCacheTest {

    /**
     * PathChildrenCache：监听子节点的新增、修改、删除操作
     * @param args
     * @throws Exception
     */
    public static void main(String[] args) throws Exception {

        CuratorFramework client = getClient();
        String parentPath = "/p1";
        PathChildrenCache pathChildrenCache = new PathChildrenCache(client,parentPath,false);
        /* * StartMode：初始化方式
         * POST_INITIALIZED_EVENT：异步初始化。初始化后会触发事件
         * NORMAL：异步初始化
         * BUILD_INITIAL_CACHE：同步初始化
         * */
        pathChildrenCache.start(PathChildrenCache.StartMode.POST_INITIALIZED_EVENT);
        pathChildrenCache.getListenable().addListener(new PathChildrenCacheListener() {
            @Override
            public void childEvent(CuratorFramework client, PathChildrenCacheEvent event) throws Exception {
                System.out.println("事件类型："  + event.getType() + "；操作节点：" + event.getData().getPath());
                switch(event.getType()){
                    case CHILD_ADDED:
                        System.out.println("新增子节点：" + event.getData().getPath());
                        break;
                    case CHILD_UPDATED:
                        System.out.println("更新子节点：" + event.getData().getPath());
                        break;
                    case CHILD_REMOVED:
                        System.out.println("删除子节点：" + event.getData().getPath());
                        break;
                    default:
                        break;
                }
            }
        });
        String path = "/p1/c1";
        client.create().creatingParentsIfNeeded().withMode(CreateMode.PERSISTENT).forPath(path);
        Thread.sleep(1000); // 此处需留意，如果没有现成睡眠则无法触发监听事件
        client.delete().forPath(path);
        Thread.sleep(15000);

    }

    private static CuratorFramework getClient(){
        RetryPolicy retryPolicy = new ExponentialBackoffRetry(1000,3);
        CuratorFramework client = CuratorFrameworkFactory.builder()
                .connectString("127.0.0.1:2181")
                .retryPolicy(retryPolicy)
                .sessionTimeoutMs(6000)
                .connectionTimeoutMs(3000)
                .namespace("demo")
                .build();
        client.start();
        return client;
    }
}

```
## 3.10 TreeCache监听
```java
package com.shu.watch;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.cache.TreeCache;
import org.apache.curator.retry.ExponentialBackoffRetry;
import org.apache.zookeeper.CreateMode;

/**
 * @author 31380
 * @description
 * @create 2024/3/16 19:44
 */
public class CuratorWatcher3 {
    private static final String CONNECT_ADDR = "127.0.0.1:2181";
    private static final int SESSION_TIMEOUT = 5000;


    public static void main(String[] args) throws Exception {
        RetryPolicy policy = new ExponentialBackoffRetry(1000, 10);
        CuratorFramework curator = CuratorFrameworkFactory.builder().connectString(CONNECT_ADDR).sessionTimeoutMs(SESSION_TIMEOUT)
                .retryPolicy(policy).build();
        curator.start();
        TreeCache treeCache = new TreeCache(curator, "/treeCache");
        treeCache.start();
        treeCache.getListenable().addListener((curatorFramework, treeCacheEvent) -> {
            switch (treeCacheEvent.getType()) {
                case NODE_ADDED:
                    System.out.println("NODE_ADDED：路径：" + treeCacheEvent.getData().getPath() + "，数据：" + new String(treeCacheEvent.getData().getData())
                            + "，状态：" + treeCacheEvent.getData().getStat());
                    break;
                case NODE_UPDATED:
                    System.out.println("NODE_UPDATED：路径：" + treeCacheEvent.getData().getPath() + "，数据：" + new String(treeCacheEvent.getData().getData())
                            + "，状态：" + treeCacheEvent.getData().getStat());
                    break;
                case NODE_REMOVED:
                    System.out.println("NODE_REMOVED：路径：" + treeCacheEvent.getData().getPath() + "，数据：" + new String(treeCacheEvent.getData().getData())
                            + "，状态：" + treeCacheEvent.getData().getStat());
                    break;
                default:
                    break;
            }
        });
        curator.create().forPath("/treeCache", "123".getBytes());
        curator.create().creatingParentsIfNeeded().withMode(CreateMode.PERSISTENT).forPath("/treeCache/c1", "456".getBytes());
        curator.setData().forPath("/treeCache", "789".getBytes());
        curator.setData().forPath("/treeCache/c1", "910".getBytes());
        curator.delete().forPath("/treeCache/c1");
        curator.delete().forPath("/treeCache");
        Thread.sleep(5000);
        curator.close();
    }
}
```
详细介绍参考书籍《从Paxos到Zookeeper：分布式一致性原理与实践》
