---
title: Dubbo（二）基本使用
sidebar_position: 2
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
# 一 环境搭建
## 1.1 Zookeeper 搭建
#### 1.1.1 安装和配置zookeeper
ZooKeeper 是用 Java 编写的，运行在 Java 环境上，因此，在部署 zookeeper 的机器上需要安装Java 运行环境。zookeeper 是作为 duboo 的注册中心。
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699704195566-6b308fa3-135d-4eb2-9fa7-e4c982ed23ce.png#averageHue=%23fafefb&clientId=uae72bcd7-83d5-4&from=paste&id=u316bd425&originHeight=168&originWidth=616&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u708c6df9-4502-4aa9-ae00-bc93a1767d6&title=)

- 下载安装包，上传并解压


![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699704226699-93c6b2d9-a1f2-4ede-977d-3da3226bb3df.png#averageHue=%23f8f5f2&clientId=uae72bcd7-83d5-4&from=paste&id=u2fccded9&originHeight=208&originWidth=593&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u0515bbe3-f0b7-42d5-9a10-785226c4527&title=)
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699704267113-c9fb08ed-7de8-47df-8194-677d6416bc4f.png#averageHue=%230b0806&clientId=uae72bcd7-83d5-4&from=paste&id=u716fcd60&originHeight=204&originWidth=656&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u5c563f0c-aa60-4f60-a7ea-5a649480021&title=)

- 进入conf文件夹下将 zoo_simple.cfg 改名为 zoo.cfg：mv zoo_sample.cfg zoo.cfg 这样zookeeper就能读取到该配置文件。（建议在zookeeper目录下新建一个 data目录用于存放zookeeper快照日志目录）其主要配置项如下：

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699704293370-7850b09f-4a47-433e-9463-9e2215824110.png#averageHue=%230e0b08&clientId=uae72bcd7-83d5-4&from=paste&id=uea588ca6&originHeight=124&originWidth=605&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u6d743320-f1d5-45c0-af91-69eb4f69f55&title=)

- 修改完后按：Esc，在输入:wq（保存退出）

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699704310059-88309bb2-d68c-41d6-a5fd-abe7ecff37c7.png#averageHue=%23100502&clientId=uae72bcd7-83d5-4&from=paste&id=u3e707a25&originHeight=84&originWidth=527&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=ub3509a0b-ae4f-42b8-a827-8f2dc86e57c&title=)

- 参数解释

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699704347496-c21bf11a-defe-43b3-a516-53cf7d501a73.png#averageHue=%23f6f5f4&clientId=uae72bcd7-83d5-4&from=paste&height=294&id=KrMGY&originHeight=353&originWidth=949&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=36684&status=done&style=none&taskId=u9c70f754-ccaf-4090-a12a-939f9356c7e&title=&width=790.8333019084413)
#### 1.1.2 启动，停止，查看 命令
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699704419861-8eb57806-ca6f-4140-b92d-1c9957317449.png#averageHue=%237a7776&clientId=uae72bcd7-83d5-4&from=paste&height=432&id=u58ea598d&originHeight=519&originWidth=924&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=174023&status=done&style=none&taskId=u6515d8d4-7d3f-419c-af79-4c9fef61e2e&title=&width=769.9999694029502)
## 1.2 dubbo-admin 管理控制台

- Dubbo 本身并不是一个服务软件。它其实就是一个 jar 包能够帮你的 java 程序连接到zookeeper，并利用 zookeeper 消费、提供服务。所以你不用在 Linux 上启动什么 dubbo 服务。
- 旧版下载地址：[https://gitee.com/M-Analysis/dubbo-admin](https://gitee.com/M-Analysis/dubbo-admin)
- 导入idea，按照记得的需求进行修改

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699706208833-01e2a836-2af2-4605-865a-ad6d7b5052cd.png#averageHue=%2326282c&clientId=u409c8a98-8692-4&from=paste&height=833&id=ua6c16ada&originHeight=1000&originWidth=1845&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=253669&status=done&style=none&taskId=ucaebe7c3-6d60-49e7-bf4d-6212c7a59c4&title=&width=1537.4999389052416)

- 新建bat启动脚本
```bash
@echo off
echo  %~dp0
set JAVA_HOME=C:\Program Files\Java\jdk1.8.0_241
set CLASSPATH=.;%JAVA_HOME%\lib\dt.jar;%JAVA_HOME%\lib\tools.jar;
set Path=%JAVA_HOME%\bin;
java -jar G:\Microservices\Dubbo\Dubbo-Admin\dubbo-admin\target\dubbo-admin-0.0.1-SNAPSHOT.jar
pause
```

- 启动： [http://192.168.2.35:7001](http://192.168.2.35:7001/) 默认root/root

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699706386972-3e54f61b-d4d9-4b97-8c4a-56cc182de3e8.png#averageHue=%23e4b377&clientId=u409c8a98-8692-4&from=paste&height=737&id=u634901b6&originHeight=884&originWidth=1920&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=94517&status=done&style=none&taskId=u0886ae53-8755-40aa-b1e5-e9400b4e1bd&title=&width=1599.9999364217147)
## 1.3 开发环境搭建
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699706559821-314ea9bd-d036-4b8c-8313-df33c3c767fb.png#averageHue=%232c2f32&clientId=u409c8a98-8692-4&from=paste&height=614&id=ue576f697&originHeight=737&originWidth=1818&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=96072&status=done&style=none&taskId=u2d4ccd17-8926-4c84-beed-423ae43c2da&title=&width=1514.9999397993113)

- 公共pom文件
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.4.1</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>

    <groupId>com.shu</groupId>
    <artifactId>Dubbo</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>pom</packaging>
    <name>Dubbo</name>



    <description>Demo project for Apache Dubbo</description>

    <modules>
        <module>Dubbo-Server</module>
        <module>Dubbo-Consume</module>
        <module>Dubbo-Interface</module>
        <module>Dubbo-Server01</module>
        <module>Dubbo-Server02</module>
        <module>Dubbo-Server-03</module>
    </modules>

    <properties>
        <java.version>1.8</java.version>
        <source.level>1.8</source.level>
        <target.level>1.8</target.level>
        <skip_maven_deploy>true</skip_maven_deploy>
        <spring-boot-dependencies.version>2.4.1</spring-boot-dependencies.version>
        <junit.version>4.12</junit.version>
        <dubbo.version>3.0.2.1</dubbo.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <!-- 统一jar版本管理，避免使用 spring-boot-parent -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot-dependencies.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <dependency>
                <groupId>org.apache.dubbo</groupId>
                <artifactId>dubbo-bom</artifactId>
                <version>${dubbo.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <!--dubbo 和  springboot 整合的包-->
            <dependency>
                <groupId>org.apache.dubbo</groupId>
                <artifactId>dubbo-spring-boot-starter</artifactId>
                <version>${dubbo.version}</version>
            </dependency>

            <dependency>
                <groupId>junit</groupId>
                <artifactId>junit</artifactId>
                <version>${junit.version}</version>
                <scope>test</scope>
            </dependency>

            <dependency>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>1.18.30</version>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.8.1</version>
                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                    <encoding>UTF-8</encoding>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>${spring-boot-dependencies.version}</version>
                <configuration>
                    <mainClass>com.shu.Dubbo.DubboApplication</mainClass>
                    <skip>true</skip>
                </configuration>
                <executions>
                    <execution>
                        <id>repackage</id>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>

</project>

```

- 依次新建不同的模块，Dubbo-Server，Dubbo-Consume，Dubbo-Interface

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699706731886-33b6a747-4074-4cdf-a11d-cb5b28a72f0b.png#averageHue=%2325272b&clientId=u409c8a98-8692-4&from=paste&height=774&id=u7303281c&originHeight=929&originWidth=1746&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=208671&status=done&style=none&taskId=uf8f338c3-6cb8-47de-9e72-a72af461bc0&title=&width=1454.9999421834968)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699706760996-57e33d97-ff8e-4a12-bd1a-2c0992070783.png#averageHue=%232e3136&clientId=u409c8a98-8692-4&from=paste&height=733&id=ua46d8e03&originHeight=880&originWidth=784&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=80807&status=done&style=none&taskId=u12f62b6a-b8e3-4b05-a21a-1fdc1f52f45&title=&width=653.3333073722002)
**Dubbo-Consume模块**
```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.shu</groupId>
        <artifactId>Dubbo</artifactId>
        <version>0.0.1-SNAPSHOT</version>
    </parent>

    <artifactId>Dubbo-Consume</artifactId>
    <packaging>jar</packaging>

    <name>Dubbo-Consume</name>
    <url>http://maven.apache.org</url>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>3.8.1</version>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>com.shu</groupId>
            <artifactId>Dubbo-Interface</artifactId>
            <version>0.0.1-SNAPSHOT</version>
        </dependency>

        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-registry-zookeeper</artifactId>
        </dependency>
    </dependencies>
</project>
```
**Dubbo-Server模块**
```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.shu</groupId>
        <artifactId>Dubbo</artifactId>
        <version>0.0.1-SNAPSHOT</version>
    </parent>

    <artifactId>Dubbo-Server</artifactId>
    <packaging>jar</packaging>

    <name>Dubbo-Server</name>
    <url>http://maven.apache.org</url>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>3.8.1</version>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>com.shu</groupId>
            <artifactId>Dubbo-Interface</artifactId>
            <version>0.0.1-SNAPSHOT</version>
        </dependency>

        <!--dubbo 与 spring-boot 整合包-->
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-spring-boot-starter</artifactId>
        </dependency>
        <!--springboot 启动核心包-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
        <!--springboot web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-registry-zookeeper</artifactId>
        </dependency>

    </dependencies>
</project>

```
**Dubbo-Interface模块**
```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.shu</groupId>
        <artifactId>Dubbo</artifactId>
        <version>0.0.1-SNAPSHOT</version>
    </parent>

    <artifactId>Dubbo-Interface</artifactId>
    <packaging>jar</packaging>

    <name>Dubbo-Interface</name>
    <url>http://maven.apache.org</url>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>3.8.1</version>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
        </dependency>

        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-spring-boot-starter</artifactId>
        </dependency>
    </dependencies>
</project>

```
# 二 案例入门
## 2.1 接口配置
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699707037191-0d487d3e-4544-4b12-be1f-f0795b605278.png#averageHue=%23222428&clientId=ubd9ec794-45cb-4&from=paste&height=473&id=ue894063c&originHeight=568&originWidth=1787&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=89104&status=done&style=none&taskId=u8954734b-9e08-45e4-b245-2eead7d4d85&title=&width=1489.1666074925022)
```java
package com.shu.interfaces;

import com.shu.pojo.User;

/**
 * @author : EasonShu
 * @date : 2023/11/11 14:43
 * @Version: 1.0
 * @Desc : 用户服务接口
 */
public interface UserService {
    User getUserInfo(long userId);
}

```
```java
package com.shu.pojo;



import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * @author : EasonShu
 * @date : 2023/11/11 14:43
 * @Version: 1.0
 * @Desc :
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User implements Serializable {
    private static final long serialVersionUID = -4294369157631410325L;
    Long userId;
    String userName;
    String responseInfo;
}


```
## 2.2 服务提供者
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699707116345-fbca2538-4539-4270-8498-6a0881414c62.png#averageHue=%23243c6a&clientId=ubd9ec794-45cb-4&from=paste&height=343&id=u3051d569&originHeight=412&originWidth=1839&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=84139&status=done&style=none&taskId=u31d7483c-a1d1-473f-a700-44788379a6c&title=&width=1532.4999391039237)

- 配置
```yaml
server:
  port: 9998
spring:
  application:
    name: dubbo-server0
dubbo:
  application:
    name: ${spring.application.name}
  registry:
    address: zookeeper://127.0.0.1:2181
    timeout: 2000
  protocol:
    name: dubbo
    port: 20890
  # 扫描 @DubboService 注解
  scan:
    base-packages: com.shu
```

- 接口实现：注意@DubboService
```java
package com.shu;

import com.shu.interfaces.UserService;
import com.shu.pojo.User;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboService;
import org.apache.dubbo.rpc.RpcContext;
import org.springframework.stereotype.Component;

import static org.apache.dubbo.rpc.RpcContext.getContext;

/**
 * @author : EasonShu
 * @date : 2023/11/11 14:48
 * @Version: 1.0
 * @Desc :
 */
@DubboService
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

- 启动类
```java
package com.shu;


import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @author : EasonShu
 * @date : 2023/11/11 13:38
 * @Version: 1.0
 * @Desc :
 */
@SpringBootApplication
@EnableDubbo
public class DubboServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(DubboServerApplication.class, args);
    }
}

```
## 2.3 服务消费者
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699707249295-4b54bb34-bed9-4c3a-8eea-0956b6e3e975.png#averageHue=%23253c6a&clientId=ubd9ec794-45cb-4&from=paste&height=274&id=uf5f39289&originHeight=329&originWidth=1684&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=66038&status=done&style=none&taskId=u6f49905a-29ea-4a67-9244-8e00247425a&title=&width=1403.333277569879)

- 配置文件
```yaml
server:
  port: 9999
spring:
  application:
    name: dubbo-consumer
dubbo:
  application:
    name: dubbo-consumer
    qos-accept-foreign-ip: false
    qos-enable: true
    qos-port: 33333
  registry:
    address: zookeeper://127.0.0.1:2181
    timeout: 2000
  protocol:
    name: dubbo
```

- 实现类
```java
package com.shu;

import com.shu.interfaces.UserService;
import com.shu.pojo.User;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author : EasonShu
 * @date : 2023/11/11 14:57
 * @Version: 1.0
 * @Desc :
 */
@RestController
public class ConsumerUserController {

    @DubboReference
    private UserService userService;

    /**
     * 获取用户信息
     */
    @GetMapping("/getUserInfo")
    public User getUserInfo() {
        return  userService.getUserInfo(1L);
    }
}

```

- 启动类
```java
package com.shu;

import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;
import org.apache.dubbo.rpc.cluster.LoadBalance;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.ServiceLoader;

/**
 * @author : EasonShu
 * @date : 2023/11/11 13:39
 * @Version: 1.0
 * @Desc :
 */
@SpringBootApplication
@EnableDubbo
public class DubboConsumeApplication {
    public static void main(String[] args) {
        SpringApplication.run(DubboConsumeApplication.class, args);
    }
}
```
## 2.4 互相启动，查看结果
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699707422243-9ef9e511-76a5-419d-bc1b-5e2cdbf599b0.png#averageHue=%23272b30&clientId=ubd9ec794-45cb-4&from=paste&height=406&id=u9167e12e&originHeight=487&originWidth=1830&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=169664&status=done&style=none&taskId=u0c322be3-f6b9-4bb8-b2d8-2f3cd6dc057&title=&width=1524.999939401947)

- 观察结果

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699707510314-4ab1379a-4320-489e-b865-4e87ff7870a5.png#averageHue=%23292c30&clientId=ubd9ec794-45cb-4&from=paste&height=757&id=u2443d40f&originHeight=909&originWidth=1875&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=273656&status=done&style=none&taskId=u4ac314bd-fe99-4fb7-aa83-255e540020a&title=&width=1562.4999379118308)

- 监控程序中

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699707576497-21a81882-ef5e-4785-b9f2-0e9c981b920b.png#averageHue=%23b4d381&clientId=ubd9ec794-45cb-4&from=paste&height=545&id=u0247654c&originHeight=654&originWidth=1866&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=84812&status=done&style=none&taskId=u843def0c-78cb-4aca-a44d-87d77f9849d&title=&width=1554.999938209854)

- 观察zookeeper

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1699707695220-85129e2f-0f8d-4641-a926-357665717070.png#averageHue=%23fcfcfc&clientId=ubd9ec794-45cb-4&from=paste&height=730&id=u72692148&originHeight=876&originWidth=1920&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=79884&status=done&style=none&taskId=u1adb5212-f5b7-4b5c-ba88-0d40e215e33&title=&width=1599.9999364217147)
这样就完成了一个简单的案例，就完成了


