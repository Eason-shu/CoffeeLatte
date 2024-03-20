---
title: Zookeeper（六）Zokeeper 使用场景案例
sidebar_position: 7
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
# 一 数据发布/订阅
数据发布/订阅(Publish/Subscribe)系统，即所谓的配置中心，顾名思义就是发布者将数据发布到ZooKeeper的一个或一系列节点上，供订阅者进行数据订阅，进而达到动态获取数据的目的，实现配置信息的集中式管理和数据的动态更新。
## 1.1 配置变更

- 假设我们现在有三个服务节点，一个配置中心，两个服务器中心

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710909292893-1da44a26-d20b-43ea-9694-29c89ad25018.png#averageHue=%2324262a&clientId=uccb1f3b1-1577-4&from=paste&height=907&id=ufd04ec97&originHeight=907&originWidth=1896&originalType=binary&ratio=1&rotation=0&showTitle=false&size=253583&status=done&style=none&taskId=u1533590a-29d6-4b43-b0cf-07dbf6f6e4a&title=&width=1896)

- 依赖
```xml
<dependencies>
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
  <dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
    <version>1.8.0-beta4</version>
  </dependency>
  <dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-log4j12</artifactId>
    <version>1.8.0-beta4</version>
  </dependency>
  <dependency>
    <groupId>log4j</groupId>
    <artifactId>log4j</artifactId>
    <version>1.2.17</version>
  </dependency>
</dependencies>
```

- 大体过程：集群中每台机器在启动初始化阶段，首先会从上面提到的ZooKeeper配置节点上读取数据库信息，同时，客户端还需要在该配置节点上注册一个数据变更的Watcher监听，一旦发生节点数据变更，所有订阅的客户端都能够获取到数据变更通知。
## 1.2 代码实现

- 配置客户端
```java
package com.shu.registrationcenter;

import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.retry.ExponentialBackoffRetry;
import org.apache.zookeeper.CreateMode;
import org.codehaus.jackson.map.ObjectMapper;

import java.io.InputStream;
import java.util.Properties;
import java.util.Scanner;

/**
 * @author 31380
 * @description
 * @create 2024/3/17 13:52
 */
public class ConfigCenter {
    private static final String CONNECT_ADDR = "127.0.0.1:2181";
    private static final int SESSION_TIMEOUT = 5000;
    private static final String ROOT_PATH_DB = "/app1/configCenter/DbConfig";
    private static final String ROOT_PATH_APPSERVER1 = "/app1/configCenter/Appserver1";
    private static final String ROOT_PATH_APPERVER2 = "/app1/configCenter/Appserver2";
    private static final String DB_CONFIG_PATH = "dbConfig.properties";
    private static final String DB_CONFIG_PATH1 = "db1Config.properties";
    private static final String APPSERVER1_CONFIG_PATH = "appserver1Config.properties";
    private static final String APPSERVER1_CONFIG_PATH1 = "appserver3Config.properties";
    private static final String APPSERVER2_CONFIG_PATH = "appserver2Config.properties";
    private static final String APPSERVER2_CONFIG_PATH2 = "appserver4Config.properties";


    /**
     *  创建数据库配置中心
     * @param path 路径
     * @param configName 配置文件名
     */
    public void createConfigCenter(String path, String configName) {
        // 创建连接
        CuratorFramework curator = CuratorFrameworkFactory.builder().connectString(CONNECT_ADDR)
        .sessionTimeoutMs(SESSION_TIMEOUT)
        .retryPolicy(new ExponentialBackoffRetry(1000, 10)).build();
        curator.start();
        try {
            // 创建根节点，如果不存在则创建
            if (curator.checkExists().forPath(path) == null) {
                curator.create().creatingParentsIfNeeded().withMode(CreateMode.PERSISTENT).forPath(path);
            }
            // 使用 ClassLoader 获取资源文件的输入流
            InputStream inputStream = Appserver1.class.getClassLoader().getResourceAsStream(configName);
            if (inputStream != null) {
                // 加载属性文件
                Properties properties = new Properties();
                properties.load(inputStream);
                // 创建 ObjectMapper 实例
                ObjectMapper objectMapper = new ObjectMapper();
                // 将配置属性转换为 JSON 数据
                String jsonData = objectMapper.writeValueAsString(properties);
                // 写入 JSON 数据到 ZooKeeper 节点
                curator.setData().forPath(path, jsonData.getBytes());
                System.out.println("节点 " + path + " 写入成功！");
                // 关闭输入流
                inputStream.close();
            } else {
                System.out.println("资源文件未找到！");
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            // 关闭连接
            curator.close();
        }
    }




    /**
     * 更新数据库配置中心
     */
    public void updateConfigCenter(String path, String configName) {
        // 创建连接
        CuratorFramework curator = CuratorFrameworkFactory.builder().connectString(CONNECT_ADDR)
                .sessionTimeoutMs(SESSION_TIMEOUT)
                .retryPolicy(new ExponentialBackoffRetry(1000, 10)).build();
        curator.start();
        try {
            // 使用 ClassLoader 获取资源文件的输入流
            InputStream inputStream = Appserver1.class.getClassLoader().getResourceAsStream(configName);
            if (inputStream != null) {
                // 加载属性文件
                Properties properties = new Properties();
                properties.load(inputStream);
                // 创建 ObjectMapper 实例
                ObjectMapper objectMapper = new ObjectMapper();
                // 将配置属性转换为 JSON 数据
                String jsonData = objectMapper.writeValueAsString(properties);
                // 写入 JSON 数据到 ZooKeeper 节点
                curator.setData().forPath(path, jsonData.getBytes());
                System.out.println("节点 " + path + " 更新成功！");
                // 关闭输入流
                inputStream.close();
            } else {
                System.out.println("资源文件未找到！");
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            // 关闭连接
            curator.close();
        }
    }


    /**
     * 修改数据
     *
     * @param args
     */


    public static void main(String[] args) {
        ConfigCenter configCenter = new ConfigCenter();
        configCenter.createConfigCenter(ROOT_PATH_DB, DB_CONFIG_PATH);
        configCenter.createConfigCenter(ROOT_PATH_APPSERVER1, APPSERVER1_CONFIG_PATH);
        configCenter.createConfigCenter(ROOT_PATH_APPERVER2, APPSERVER2_CONFIG_PATH);
        // 等待键盘输入，输入任意字符后继续，1.更新数据库配置中心，2.更新 Appserver1 配置中心，3.更新 Appserver2 配置中心
        Scanner scanner = new Scanner(System.in);
        System.out.println("请选择操作：1.更新数据库配置中心，2.更新 Appserver1 配置中心，3.更新 Appserver2 配置中心, 4 退出" );
        int choice = scanner.nextInt();
        switch (choice) {
            case 1:
                configCenter.updateConfigCenter(ROOT_PATH_DB, DB_CONFIG_PATH1);
                break;
            case 2:
                configCenter.updateConfigCenter(ROOT_PATH_APPSERVER1, APPSERVER1_CONFIG_PATH1);
                break;
            case 3:
                configCenter.updateConfigCenter(ROOT_PATH_APPERVER2, APPSERVER2_CONFIG_PATH2);
                break;
            case 4:
                // 关闭 Scanner 对象
                scanner.close();
                break;
            default:
                break;
        }
    }

}

```

- AppServer1
```java
package com.shu.registrationcenter;

import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.cache.NodeCache;
import org.apache.curator.framework.recipes.cache.NodeCacheListener;
import org.apache.curator.retry.ExponentialBackoffRetry;

/**
 * @author 31380
 * @description Appserver1，NodeCache 监听节点数据变化,但是不监听节点的子节点变化，如果需要监听子节点变化，可以使用 PathChildrenCache
 * @create 2024/3/17 14:03
 */
public class Appserver1 {

    private static final String CONNECT_ADDR = "127.0.0.1:2181";
    private static final int SESSION_TIMEOUT = 5000;
    private static final String ROOT_PATH_APPERVER1 = "/app1/configCenter/Appserver1";

    public static void main(String[] args) {
        // 创建连接
        CuratorFramework curator = CuratorFrameworkFactory.builder().connectString(CONNECT_ADDR)
                .sessionTimeoutMs(SESSION_TIMEOUT)
                .retryPolicy(new ExponentialBackoffRetry(1000, 10)).build();
        curator.start();
        try {
            // 创建 NodeCache 监听指定节点
            final NodeCache nodeCache = new NodeCache(curator, ROOT_PATH_APPERVER1);
            // 设置为 true，表示缓存数据
            nodeCache.start(true);
            // 监听节点数据变化
            nodeCache.getListenable().addListener(new NodeCacheListener() {
                @Override
                public void nodeChanged() throws Exception {
                    if (nodeCache.getCurrentData() != null) {
                        // 获取节点的当前数据
                        String data = new String(nodeCache.getCurrentData().getData());
                        System.out.println("节点数据变化：" + data);
                    } else {
                        System.out.println("节点已删除！");
                    }
                }
            });
            // 读取节点数据
            System.out.println("节点数据：" + new String(nodeCache.getCurrentData().getData()));

            // 为了保持监听线程活动，让程序不退出
            Thread.sleep(Integer.MAX_VALUE);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            // 关闭连接
            curator.close();
        }
    }

}

```

- Appserver2
```java
package com.shu.registrationcenter;

import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.cache.NodeCache;
import org.apache.curator.framework.recipes.cache.NodeCacheListener;
import org.apache.curator.retry.ExponentialBackoffRetry;

/**
 * @author 31380
 * @description
 * @create 2024/3/17 14:03
 */
public class Appserver2 {

    private static final String CONNECT_ADDR = "127.0.0.1:2181";
    private static final int SESSION_TIMEOUT = 5000;
    private static final String ROOT_PATH_APPERVER2 = "/app1/configCenter/Appserver2";

    public static void main(String[] args) {
        // 创建连接
        CuratorFramework curator = CuratorFrameworkFactory.builder().connectString(CONNECT_ADDR)
                .sessionTimeoutMs(SESSION_TIMEOUT)
                .retryPolicy(new ExponentialBackoffRetry(1000, 10)).build();
        curator.start();
        try {
            // 创建 NodeCache 监听指定节点
            final NodeCache nodeCache = new NodeCache(curator, ROOT_PATH_APPERVER2);
            // 设置为 true，表示缓存数据
            nodeCache.start(true);
            // 监听节点数据变化
            nodeCache.getListenable().addListener(new NodeCacheListener() {
                @Override
                public void nodeChanged() throws Exception {
                    if (nodeCache.getCurrentData() != null) {
                        // 获取节点的当前数据
                        String data = new String(nodeCache.getCurrentData().getData());
                        System.out.println("节点数据变化：" + data);
                    } else {
                        System.out.println("节点已删除！");
                    }
                }
            });
            // 读取节点数据
            System.out.println("节点数据：" + new String(nodeCache.getCurrentData().getData()));

            // 为了保持监听线程活动，让程序不退出
            Thread.sleep(Integer.MAX_VALUE);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            // 关闭连接
            curator.close();
        }
    }

}
```
## 1.3 启动测试
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710912589103-38357777-5de9-46a5-932c-4b5f5325b749.png#averageHue=%23212327&clientId=uccb1f3b1-1577-4&from=paste&height=422&id=u35bb7f8c&originHeight=422&originWidth=1780&originalType=binary&ratio=1&rotation=0&showTitle=false&size=49216&status=done&style=none&taskId=u3ce49db3-dc83-4449-8167-6472e811b74&title=&width=1780)
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710912611382-1a6ac593-ece3-4f8c-9fdd-35618fab23ab.png#averageHue=%23222529&clientId=uccb1f3b1-1577-4&from=paste&height=327&id=u5bf9d973&originHeight=327&originWidth=1795&originalType=binary&ratio=1&rotation=0&showTitle=false&size=41187&status=done&style=none&taskId=u8c7b8755-a382-4c59-9a44-66e9d170916&title=&width=1795)
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710912622935-7d830f85-c522-48a5-ba77-88345b5675b6.png#averageHue=%23212327&clientId=uccb1f3b1-1577-4&from=paste&height=442&id=u3d81f5f9&originHeight=442&originWidth=1788&originalType=binary&ratio=1&rotation=0&showTitle=false&size=41764&status=done&style=none&taskId=u86af056c-11d4-40e9-bd59-a7f6fdcf65a&title=&width=1788)
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710912650918-79c4bb38-4ddd-47df-8ed1-cf1cf3798dd9.png#averageHue=%23faf9f8&clientId=uccb1f3b1-1577-4&from=paste&height=709&id=u7d30bf08&originHeight=709&originWidth=1198&originalType=binary&ratio=1&rotation=0&showTitle=false&size=100585&status=done&style=none&taskId=u0d4ecbcd-9780-402c-9052-a10d8168ffe&title=&width=1198)
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710912662403-ffb1f161-c85f-4304-8061-960007b79d66.png#averageHue=%23fbfafa&clientId=uccb1f3b1-1577-4&from=paste&height=686&id=u0f29aa2f&originHeight=686&originWidth=1191&originalType=binary&ratio=1&rotation=0&showTitle=false&size=63894&status=done&style=none&taskId=ue4b97f9c-c3d7-48fe-9f48-a631465b97a&title=&width=1191)
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710912670156-08969dfa-cd6e-4727-8205-88f916de945a.png#averageHue=%23fbfafa&clientId=uccb1f3b1-1577-4&from=paste&height=685&id=u202c1325&originHeight=685&originWidth=1198&originalType=binary&ratio=1&rotation=0&showTitle=false&size=64679&status=done&style=none&taskId=u8d0aacb4-3506-4a19-bd5c-6ef90114375&title=&width=1198)

- 修改数据中心数据

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710912696883-bae0b832-7c5b-41c1-a82f-34d054284038.png#averageHue=%23212327&clientId=uccb1f3b1-1577-4&from=paste&height=391&id=u942d4958&originHeight=391&originWidth=1817&originalType=binary&ratio=1&rotation=0&showTitle=false&size=56025&status=done&style=none&taskId=u6d669871-f8ba-4463-aa87-508f7e548a7&title=&width=1817)
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710912707963-4f135215-2827-4e17-92b8-41efbd3ce724.png#averageHue=%23212428&clientId=uccb1f3b1-1577-4&from=paste&height=390&id=u3079c079&originHeight=390&originWidth=1762&originalType=binary&ratio=1&rotation=0&showTitle=false&size=47488&status=done&style=none&taskId=uf081bcc4-4495-4e42-b7c0-9265e7e3810&title=&width=1762)
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710912744017-b39867ce-93f7-440a-8601-39704356e21b.png#averageHue=%23fbfaf9&clientId=uccb1f3b1-1577-4&from=paste&height=354&id=ud3835d16&originHeight=354&originWidth=1212&originalType=binary&ratio=1&rotation=0&showTitle=false&size=54144&status=done&style=none&taskId=u75a41ee2-f06e-4f7a-b5f1-6cc6992d6b6&title=&width=1212)
注意：这个这里代码监听中NodeCache只能监听子节点的变化，以上就简单的实现了发布与订阅的功能，但是设计到后面的思考，服务如何平滑过渡？
# 二 负载均衡
负载均衡(Load Balance)是一种相当常见的计算机网络技术，用来对多个计算机（计算机集群）、网络连接、CPU、磁盘驱动器或其他资源进行分配负载，以达到优化资源使用、最大化吞吐率、最小化响应时间和避免过载的目的。
## 2.1 实现
假设现在要我们拥有10台Web服务，1~10，当发生请求时依次提供服务
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710913325497-a9dec2d7-2c30-4303-ba41-16590a4e2df2.png#averageHue=%23f9f7f6&clientId=uccb1f3b1-1577-4&from=paste&height=655&id=u9158f89c&originHeight=655&originWidth=1185&originalType=binary&ratio=1&rotation=0&showTitle=false&size=155639&status=done&style=none&taskId=u06761270-e701-4b98-91ae-989c332a6da&title=&width=1185)
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710913428160-1f5c513b-7da9-42a6-bba6-0d9f35ba7f21.png#averageHue=%231f2023&clientId=uccb1f3b1-1577-4&from=paste&height=549&id=ua791478f&originHeight=549&originWidth=1774&originalType=binary&ratio=1&rotation=0&showTitle=false&size=32317&status=done&style=none&taskId=u547b1ac1-3962-43ed-8607-741962c8bef&title=&width=1774)

- 简单介绍一下，首先启动的时候注册10个服务器节点
- 然后分别监听10个节点的上线情况，当请求来到的时候分别选择在线的节点信息来处理服务
## 2.2 代码

- 服务节点
```java
package com.shu.loadbalancing;

import java.io.Serializable;
import java.util.Objects;

/**
 * @author 31380
 * @description  WebNodeData
 * @create 2024/3/17 19:31
 */
public class WebNodeData implements Serializable {
    private static final long serialVersionUID = 4848971284812662834L;

    private String ip;
    private Integer port;
    private Integer weight;
    private String path;


    public WebNodeData() {
    }

    public WebNodeData(String ip, Integer port, Integer weight, String path) {
        this.ip = ip;
        this.port = port;
        this.weight = weight;
        this.path = path;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        WebNodeData nodeData = (WebNodeData) o;
        return ip.equals(nodeData.ip) &&
                port.equals(nodeData.port);
    }

    @Override
    public int hashCode() {
        return Objects.hash(ip, port);
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getIp() {
        return ip;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }

    public Integer getPort() {
        return port;
    }

    public void setPort(Integer port) {
        this.port = port;
    }

    public Integer getWeight() {
        return weight;
    }

    public void setWeight(Integer weight) {
        this.weight = weight;
    }

    @Override
    public String toString() {
        return "NodeData{" +
                "ip='" + ip + '\'' +
                ", port=" + port +
                ", weight=" + weight +
                ", path='" + path + '\'' +
                '}';
    }
}

```

- 服务者
```java
package com.shu.loadbalancing;

import com.shu.CuratorUtils;
import org.apache.curator.framework.CuratorFramework;

/**
 * @author 31380
 * @description
 * @create 2024/3/17 19:33
 */
public class Service {
    protected CuratorFramework client;
    String connectString = "127.0.0.1:2181";
    int sessionTimeout = 5000;
    int connectionTimeout = 5000;

    /**
     * 启动客户端
     */
    public void start() {
        client = CuratorUtils.createCuratorFramework(connectString, sessionTimeout, connectionTimeout);
        client.start();
        System.out.println("客户端启动成功");
    }

    /**
     * 关闭客户端
     */
    public void close() {
        client.close();
        System.out.println("客户端关闭成功");
    }
}

```

- Web服务
```java
package com.shu.loadbalancing;

import com.shu.CuratorUtils;
import org.apache.curator.framework.CuratorFramework;
import org.apache.zookeeper.CreateMode;
import org.apache.zookeeper.data.Stat;

/**
 * @author 31380
 * @description Service
 * @create 2024/3/17 19:36
 */
public class WebService extends Service{
    public final static String SERVICE_PATH = "/web";
    private WebNodeData nodeData;


    public WebService(CuratorFramework client, WebNodeData nodeData) {
        super.client = client;
        this.nodeData = nodeData;
    }


    //节点初始化
    public void init() throws Exception {
        String path = SERVICE_PATH + "/" + nodeData.getPath();
        Stat stat = client.checkExists().forPath(path);
        if (stat == null) {
            String parentpath = CuratorUtils.getparrentpath(path);
            CuratorUtils.createParentPath(parentpath, client);
            client.create().withMode(CreateMode.EPHEMERAL).forPath(path, DataUtil.getBytesFromObject(this.nodeData));
        } else {
            //如果已经存在，则更新数据
            client.setData().forPath(path, DataUtil.getBytesFromObject(this.nodeData));
        }
    }

}

```

- 负载均衡服务
```java
package com.shu.loadbalancing;

import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.recipes.cache.PathChildrenCache;
import org.apache.curator.framework.recipes.cache.PathChildrenCacheEvent;
import org.apache.curator.framework.recipes.cache.PathChildrenCacheListener;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

/**
 * @author 31380
 * @description
 * @create 2024/3/17 19:40
 */
public class LoadBalanceService extends Service {

    private List<WebNodeData> nodeDatas = new ArrayList<>(16);

    public LoadBalanceService(CuratorFramework client) {
        super.client = client;
    }

    //拿去已经注册上来的所有节点
    public void init() throws Exception {
        List<String> children = client.getChildren().forPath(WebService.SERVICE_PATH);
        for (String path : children) {
            path = WebService.SERVICE_PATH + "/" + path;
            try {
                byte[] data = client.getData().forPath(path);
                WebNodeData nodeData = (WebNodeData) DataUtil.getObjectFromBytes(data);
                nodeDatas.add(nodeData);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public void register() throws Exception {
        PathChildrenCache watcher = new PathChildrenCache(client, WebService.SERVICE_PATH, true/*,false, service*/);
        watcher.getListenable().addListener(new PathChildrenCacheListener() {
            @Override
            public void childEvent(CuratorFramework curatorFramework, PathChildrenCacheEvent pathChildrenCacheEvent) throws Exception {
                if (pathChildrenCacheEvent.getType().equals(PathChildrenCacheEvent.Type.CHILD_ADDED)) {
                    System.out.println(pathChildrenCacheEvent.getData().getPath() + "上线");
                    //新服务注册
                    WebNodeData data = (WebNodeData) DataUtil.getObjectFromBytes(pathChildrenCacheEvent.getData().getData());
                    nodeDatas.add(data);
                }
                if (pathChildrenCacheEvent.getType().equals(PathChildrenCacheEvent.Type.CHILD_REMOVED)) {
                    //服务下架或宕机
                    System.out.println(pathChildrenCacheEvent.getData().getPath() + "下线");
                    WebNodeData data = (WebNodeData) DataUtil.getObjectFromBytes(pathChildrenCacheEvent.getData().getData());
                    nodeDatas.remove(data);
                }
            }
        });
        watcher.start(PathChildrenCache.StartMode.NORMAL);
    }


    //负载算法，随机选择当前在线的一台服务
    public WebNodeData loadBalance() {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        WebNodeData result = null;
        if (nodeDatas.isEmpty()) {
            return null;
        }
        synchronized (nodeDatas) {
            if (nodeDatas.isEmpty()) {
                return null;
            }
            int all = 0;
            for (WebNodeData nodeData : nodeDatas) {
                all += nodeData.getWeight();
            }
            int index = random.nextInt(all);
            for (WebNodeData nodeData : nodeDatas) {
                if (index <= nodeData.getWeight()) {
                    result = nodeData;
                    break;
                }
                index -= nodeData.getWeight();
            }
        }
        return result;
    }

}

```

- 工具类
```java
package com.shu.loadbalancing;

import java.io.*;

/**
 * @author 31380
 * @description
 * @create 2024/3/17 19:32
 */
public class DataUtil {

    //将object转换为bytes
    public static byte[] getBytesFromObject(Object object) throws IOException {
        ObjectOutputStream out = null;
        ByteArrayOutputStream bos = null;
        try {
//            System.out.println(object);
            bos = new ByteArrayOutputStream();
            out = new ObjectOutputStream(bos);
            out.writeObject(object);
            out.flush();
            byte[] yourBytes = bos.toByteArray();
            return yourBytes;
        } finally {
            if (bos != null) {
                bos.close();
            }
            if (out != null) {
                out.close();
            }
        }
    }

    //
    public static Object getObjectFromBytes(byte[] bytes) throws IOException, ClassNotFoundException {
        ObjectInputStream in = null;
        try {
            in = new ObjectInputStream(new ByteArrayInputStream(bytes));
            return in.readObject();
        } finally {
            if (in != null) {
                in.close();
            }
        }
    }

}

```

- 测试
```java
package com.shu.loadbalancing;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.retry.RetryNTimes;

import java.util.Scanner;

/**
 * @author 31380
 * @description
 * @create 2024/3/17 19:43
 */
public class LoadBalancingTest {
    public static void main(String[] args) throws Exception {
        RetryPolicy retryPolicy = new RetryNTimes(3, 100);
        for(int i = 0; i < 10; i ++){
            CuratorFramework client = CuratorFrameworkFactory.newClient("127.0.0.1:2181",
                    30*60*1000, 5*1000, retryPolicy);
            WebNodeData nodeData = new WebNodeData("127.0.0.1:2181"+i, 8080, i, "web"+i);
            WebService webService = new WebService(client, nodeData);
            webService.start();
            webService.init();
        }
        CuratorFramework client = CuratorFrameworkFactory.newClient("127.0.0.1:2181",
                30*60*1000, 5*1000, retryPolicy);
        LoadBalanceService loadBalanceService = new LoadBalanceService(client);
        loadBalanceService.start();
        loadBalanceService.init();
        loadBalanceService.register();

        while (true){
            Scanner sc = new Scanner( System.in);
            String nextCommand = sc.nextLine();
            WebNodeData nodeData = loadBalanceService.loadBalance();
            System.out.println("本次请求由：" + nodeData.getIp() + ":" + nodeData.getPort() + " 执行");
        }

    }
}

```
## 2.3 启动测试
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710914245578-c4bc5e86-4dc4-4e9c-a069-04d157ed88ca.png#averageHue=%23202124&clientId=uccb1f3b1-1577-4&from=paste&height=565&id=u2d8b9158&originHeight=565&originWidth=1812&originalType=binary&ratio=1&rotation=0&showTitle=false&size=38008&status=done&style=none&taskId=ub7855cf4-df91-4176-88fa-44f68015249&title=&width=1812)
# 三 分布式ID

- 在过去的单库单表型系统中，通常可以使用数据库字段自带的auto_increment属性来自动为每条数据库记录生成一个唯一的ID，数据库会保证生成的这个ID在全局唯一。
- 但是随着数据库数据规模的不断增大，分库分表随之出现，而auto_increment属性仅能针对单一表中的记录自动生成ID，因此在这种情况下，就无法再依靠数据库的auto_increment属性来唯一标识一条记录了。于是，我们必须寻求一种能够在分布式环境下生成全局唯一ID的方法。
- UUID是一个非常不错的全局唯一ID生成方式，能够非常简便地保证分布式环境中的唯一性。一个标准的UUID是一个包含32位字符和4个短线的字符串，例如“e70f1357-f260-46ff-a32d-53a086c57ade”,但是于生成的字符串过长，浪费空间，含义不明

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710914677934-250f243b-5b9f-43f1-a6ad-60aee9ecce2b.png#averageHue=%23fdfdfd&clientId=uccb1f3b1-1577-4&from=paste&height=798&id=uf5d660bc&originHeight=798&originWidth=1575&originalType=binary&ratio=1&rotation=0&showTitle=false&size=124117&status=done&style=none&taskId=u93409e97-ab4c-40b4-8ed8-d04f1cb0b54&title=&width=1575)
## 3.1 代码实现
```java
package com.shu.id;

import com.shu.CuratorUtils;
import org.apache.curator.framework.CuratorFramework;
import org.apache.zookeeper.CreateMode;

/**
 * @author 31380
 * @description
 * @create 2024/3/20 14:10
 */
public class ZookeeperUniqueIDGenerator {

    private static final String CONNECT_STRING = "localhost:2181"; // ZooKeeper连接字符串
    private static final int SESSION_TIMEOUT = 5000; // 会话超时时间
    private static final String ROOT_PATH = "/jdbs"; // 根节点路径

    CuratorFramework client;


    public ZookeeperUniqueIDGenerator() {
        // 创建连接
        client = CuratorUtils.createCuratorFramework(CONNECT_STRING, SESSION_TIMEOUT, 5000);
        // 启动连接
        client.start();
    }


    /**
     * 生成唯一ID
     * @param path   节点路径
     * @param prefix 节点前缀
     * @return
     */
    public String generate(String path, String prefix) {
        // 指定类型的任务下面通过调用create()接口来创建一个顺序节点，例如创建“job-”节点。
        String fullPath = ROOT_PATH + "/" + path + "/" + prefix + "-";
        try {
            // 创建一个顺序节点
            String createdPath = client.create().creatingParentsIfNeeded().withMode(CreateMode.EPHEMERAL_SEQUENTIAL).forPath(fullPath);
            // 返回节点名称
            return path+"-"+createdPath.substring(createdPath.lastIndexOf("/") + 1);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }


    /**
     * 关闭
     */
    public void close() {
        client.close();
    }



    public static void main(String[] args) {
        ZookeeperUniqueIDGenerator zookeeperUniqueIDGenerator = new ZookeeperUniqueIDGenerator();
        // 循环生成10个唯一ID
        for (int i = 0; i < 10; i++) {
            System.out.println(zookeeperUniqueIDGenerator.generate("web", "job"));
        }
        zookeeperUniqueIDGenerator.close();

    }


}

```
## 3.2 效果
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710916118783-f22b422c-e5ec-46f3-97b1-dc1492c252f1.png#averageHue=%231f2124&clientId=uccb1f3b1-1577-4&from=paste&height=535&id=u1e4cbd69&originHeight=535&originWidth=1757&originalType=binary&ratio=1&rotation=0&showTitle=false&size=49580&status=done&style=none&taskId=udbb34cdb-7cfa-46b5-b7af-b09084959b2&title=&width=1757)
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710916135592-5622c351-9410-468a-9825-1c3fdfc63267.png#averageHue=%23202226&clientId=uccb1f3b1-1577-4&from=paste&height=552&id=ucf7e7e42&originHeight=552&originWidth=1796&originalType=binary&ratio=1&rotation=0&showTitle=false&size=55598&status=done&style=none&taskId=ua8edb476-c97b-4756-857e-f38ced45d68&title=&width=1796)
# 四 服务器集群监控
参考第一个数据发布与订阅
# 五 分布式锁

- 分布式锁是控制分布式系统之间同步访问共享资源的一种方式。如果不同的系统或是同一个系统的不同主机之间共享了一个或一组资源，那么访问这些资源的时候，往往需要通过一些互斥手段来防止彼此之间的干扰，以保证一致性，在这种情况下，就需要使用分布式锁了。
- 在平时的实际项目开发中，我们往往很少会去在意分布式锁，而是依赖于关系型数据库固有的排他性来实现不同进程之间的互斥。这确实是一种非常简便且被广泛使用的分布式锁实现方式。然而有一个不争的事实是，目前绝大多数大型分布式系统的性能瓶颈都集中在数据库操作上。
- 因此，如果上层业务再给数据库添加一些额外的锁，例如行锁、表锁甚至是繁重的事务处理，那么是不是会让数据库更加不堪重负呢？下面我们来看看使用ZooKeeper如何实现分布式锁，这里主要讲解排他锁和共享锁两类分布式锁。
## 2.1 排他锁
排他锁（Exclusive Locks，简称X锁），又称为写锁或独占锁，是一种基本的锁类型。如果事务T1对数据对象O1加上了排他锁，那么在整个加锁期间，只允许事务T1对O1进行读取和更新操作，其他任何事务都不能再对这个数据对象进行任何类型的操作——直到T1释放了排他锁
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710920651665-a7c11af9-7b26-49d9-98e3-28fbfd890b83.png#averageHue=%23fbfbfb&clientId=uccb1f3b1-1577-4&from=paste&height=734&id=ua0312c30&originHeight=734&originWidth=1588&originalType=binary&ratio=1&rotation=0&showTitle=false&size=105523&status=done&style=none&taskId=u9b7c2abe-b71f-48d4-adc7-a7a3256c215&title=&width=1588)
```java
package com.shu.lock;

import com.shu.CuratorUtils;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.recipes.locks.InterProcessMutex;

/**
 * @author 31380
 * @description
 * @create 2024/3/20 14:59
 */
public class ExclusiveLocksTest {

    private static final String ZK_ADDRESS = "127.0.0.1:2181";
    private static final String LOCK_PATH = "/exclusive_lock";
    // 客户端数量
    private static final int CLIENT_COUNT = 10;

    public static void main(String[] args) {
        for (int i = 0; i < CLIENT_COUNT; i++) {
            new Thread(() -> {
                CuratorFramework client = CuratorUtils.createCuratorFramework(ZK_ADDRESS, 5000, 5000);
                client.start();
                InterProcessMutex locks = new InterProcessMutex(client, LOCK_PATH);
                try {
                    locks.acquire();
                    System.out.println(Thread.currentThread().getName() + "获取到锁");
                    // 模拟业务处理
                    Thread.sleep(1000);
                    System.out.println(Thread.currentThread().getName() + "释放锁");
                } catch (Exception e) {
                    e.printStackTrace();
                }finally {
                    try {
                        locks.release();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    client.close();
                }
            }).start();
        }
    }
}
```
## 2.2 共享锁
共享锁（Shared Locks，简称S锁），又称为读锁，同样是一种基本的锁类型。如果事务T1对数据对象O1加上了共享锁，那么当前事务只能对O1进行读取操作，其他事务也只能对这个数据对象加共享锁——直到该数据对象上的所有共享锁都被释放。共享锁和排他锁最根本的区别在于，加上排他锁后，数据对象只对一个事务可见，而加上共享锁后，数据对所有事务都可见。下面我们就来看看如何借助ZooKeeper来实现共享锁。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1710920921934-b639996f-89eb-43e4-ba08-58c41edad9d3.png#averageHue=%23f8f8f8&clientId=uccb1f3b1-1577-4&from=paste&height=821&id=u3b14dcab&originHeight=821&originWidth=1138&originalType=binary&ratio=1&rotation=0&showTitle=false&size=188871&status=done&style=none&taskId=u5c1521a8-cb28-44e7-9111-977af9e709c&title=&width=1138)
```java
package com.shu.lock;

import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.locks.InterProcessMutex;
import org.apache.curator.framework.recipes.locks.InterProcessReadWriteLock;
import org.apache.curator.retry.RetryNTimes;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * @author 31380
 * @description
 * @create 2024/3/20 16:53
 */
public class InterProcessReadWriteLockTest {
    private static DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss.SSS");

    private static ExecutorService threadPool = Executors.newFixedThreadPool(10);

    private static String zkLockPath = "/Aaron/Lock2";

    private static CuratorFramework zkClient;

    public static void init() {
        // 创建客户端
        zkClient = CuratorFrameworkFactory.builder()
                .connectString("127.0.0.1:2181")    // ZK Server地址信息
                .connectionTimeoutMs(15 * 1000) // 连接超时时间: 15s
                .sessionTimeoutMs( 60 * 1000 )  // 会话超时时间: 60s
                // 重试策略: 重试3次, 每次间隔1s
                .retryPolicy(new RetryNTimes(3, 1000))
                .build();
        // 启动客户端
        zkClient.start();
        System.out.println("---------------------- 系统上线 ----------------------");
    }

    /**
     * 测试: 读锁为共享锁
     */
    public void test1Read() {
        System.out.println("\n---------------------- Test 1 : Read ----------------------");
        for(int i=1; i<=3; i++) {
            String taskName = "读任务#"+i;
            Runnable task = new ReadTask(taskName, zkClient, zkLockPath);
            threadPool.execute( task );
        }
        // 主线程等待所有任务执行完毕
        try{ Thread.sleep( 10*1000 ); } catch (Exception e) {}
    }

    /**
     * 测试: 写锁为互斥锁
     */
    public void test2Write() {
        System.out.println("\n---------------------- Test 2 : Write ----------------------");
        for(int i=1; i<=3; i++) {
            String taskName = "写任务#"+i;
            Runnable task = new WriteTask(taskName, zkClient, zkLockPath);
            threadPool.execute( task );
        }
        // 主线程等待所有任务执行完毕
        try{ Thread.sleep( 30*1000 ); } catch (Exception e) {}
    }

    /**
     * 测试: 读写互斥
     */
    public void test2ReadWrite() {
        System.out.println("\n---------------------- Test 3 : Read Write ----------------------");
        for(int i=1; i<=8; i++) {
            Runnable task = null;
            Boolean isReadTask = i%2 == 0;
            if( isReadTask ) {
                task = new ReadTask( "读任务#"+i, zkClient, zkLockPath );
            } else {
                task = new WriteTask( "写任务#"+i, zkClient, zkLockPath );
            }
            threadPool.execute( task );
        }
        // 主线程等待所有任务执行完毕
        try{ Thread.sleep( 40*1000 ); } catch (Exception e) {}
    }

    public static void close() {
        // 关闭客户端
        zkClient.close();
        System.out.println("---------------------- 系统下线 ----------------------");
    }

    /**
     * 打印信息
     * @param msg
     */
    private static void info(String msg) {
        String time = formatter.format(LocalTime.now());
        String thread = Thread.currentThread().getName();
        String log = "["+time+"] "+ " <"+ thread +"> " + msg;
        System.out.println(log);
    }

    /**
     * 读任务
     */
    private static class ReadTask implements Runnable {
        private String taskName;

        private InterProcessMutex readLock;

        public ReadTask(String taskName, CuratorFramework zkClient, String zkLockPath) {
            this.taskName = taskName;
            InterProcessReadWriteLock interProcessReadWriteLock = new InterProcessReadWriteLock(zkClient, zkLockPath);
            this.readLock = interProcessReadWriteLock.readLock();
        }

        @Override
        public void run() {
            try{
                readLock.acquire();
                info(taskName + ": 成功获取读锁 #1");
                // 模拟业务耗时
                Thread.sleep( RandomUtils.nextLong(100, 500) );
            } catch (Exception e) {
                System.out.println( taskName + ": Happen Exception: " + e.getMessage());
            } finally {
                info(taskName + ": 释放读锁 #1");
                try {
                    readLock.release();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }

    /**
     * 写任务
     */
    private static class WriteTask implements Runnable {
        private String taskName;

        private InterProcessMutex writeLock;

        public WriteTask(String taskName, CuratorFramework zkClient, String zkLockPath) {
            this.taskName = taskName;
            InterProcessReadWriteLock interProcessReadWriteLock = new InterProcessReadWriteLock(zkClient, zkLockPath);
            this.writeLock = interProcessReadWriteLock.writeLock();
        }

        @Override
        public void run() {
            try{
                writeLock.acquire();
                info(taskName + ": 成功获取写锁 #1");
                // 模拟业务耗时
                Thread.sleep(RandomUtils.nextLong(100, 500));
            } catch (Exception e) {
                System.out.println( taskName + ": Happen Exception: " + e.getMessage());
            } finally {
                info(taskName + ": 释放写锁 #1\n");
                try {
                    writeLock.release();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }



    // 随机数工具类
     static class RandomUtils {
        public static long nextLong(int min, int max) {
            return min + (long)(Math.random() * ((max - min) + 1));
        }
    }


    public static void main(String[] args) {
        InterProcessReadWriteLockTest test = new InterProcessReadWriteLockTest();
        init();
        test.test1Read();
        test.test2Write();
        test.test2ReadWrite();
        close();

    }
}

```


