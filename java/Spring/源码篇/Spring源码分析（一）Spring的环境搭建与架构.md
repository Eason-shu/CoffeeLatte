---

title: Spring源码分析（一）Spring的环境搭建与架构
sidebar_position: 1
keywords:
  - Spring
  - 源码分析
tags:
  - Spring
  - 源码分析
  - Java
  - 框架
  - IOC
  - AOP
  - 学习笔记
  - 设计模式
last_update:
  date: 2023-8-09 23:00:00
  author: EasonShu

---

![a32e41535150d5a4efb0608c283d501.jpg](https://cdn.nlark.com/yuque/0/2023/jpeg/12426173/1680181123681-55abbc61-2210-484a-9384-a3560d89f527.jpeg#averageHue=%238c9cb9&clientId=ub30f95e9-d85a-4&from=paste&height=1024&id=u360a88b7&originHeight=1280&originWidth=1707&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=415981&status=done&style=none&taskId=u1535b8af-6aa6-4491-84d2-c018d86b530&title=&width=1365.6)
本图：川西旅游中拍摄的（业余摄影）
官网：
[Home](https://spring.io/)
参考书籍：
[Spring源码深度解析-郝佳编著-微信读书](https://weread.qq.com/web/bookDetail/0e232b205b260a0e29f3fb5)

:::info
建议先熟悉一下Spring的基本知识，这样对源码的理解会更加深刻，不然无法理解其中的设计思想
作者本人就是，在看到Bean的定义是时候，一脸懵逼，不知道这是干嘛的，后面看了一下Spring的基本知识，再回来看源码，就豁然开朗了
:::


# 一 Spring的基本信息
## 1.1 Spring 概述
Spring是一个分层的Java SE/EE应用一站式的轻量级开源框架，Spring核心是IOC和AOP。
Spring主要优点包括：

- 方便解耦，简化开发，通过Spring提供的IoC容器，我们可以将对象之间的依赖关系交由Spring进行控制，避免硬编码造成的程序耦合度高。
- AOP编程的支持，通过Spring提供的AOP功能，方便进行面向切面编程。
- 声明式事务的支持，在Spring中，我们可以从单调烦闷的事务管理代码中解脱出来，通过声明式方式灵活地进行事务的管理，提高开发效率和质量。
- 方便程序的测试，可以用非容器依赖的编程方式进行几乎所有的测试工作。
- 方便集成各种优秀框架，Spring提供了对各种优秀框架的直接支持。
## 1.2 架构
整个spring框架按其所属功能可以划分为五个主要模块，这五个模块几乎为企业应用提供了所需的一切，从持久层、业务层到表现层都拥有相应的支持，这就是为什么称Spring是一站式框架的原因。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680054921468-64881a3f-ccb8-4d0b-8073-2e3c80eb5b3d.png#averageHue=%2395da99&clientId=ub7e9b39b-effc-4&from=paste&id=ubb853d1b&originHeight=482&originWidth=734&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=111759&status=done&style=none&taskId=u6817be02-3cdd-48cd-85d2-e12cceb5ea6&title=)
🔷核心模块(Core Container)

- Spring的核心模块实现了IoC的功能，它将类和类之间的依赖从代码中脱离出来，用配置的方式进行依赖关系描述，由IoC容器负责类的创建，管理，获取等。BeanFactory接口是Spring框架的核心接口，实现了容器很多核心的功能。
- Context模块构建于核心模块之上，扩展了BeanFactory的功能，包括国际化，资源加载，邮件服务，任务调度等多项功能，ApplicationContext是Context模块的核心接口。
- 表达式语言(Expression Language)是统一表达式语言(EL)的一个扩展，支持设置和获取对象属性，调用对象方法，操作数组、集合等，使用它可以很方便的通过表达式和Spring IoC容器进行交互。

🔷AOP模块

- Spring AOP模块提供了满足AOP Alliance规范的实现，还整合了AspectJ这种AOP语言级的框架，通过AOP能降低耦合。

🔷数据访问集成模块（Data Access/Integration ）

- 事务模块：该模块用于Spring管理事务，只要是Spring管理对象都能得到Spring管理事务的好处，无需在代码中进行事务控制了，而且支持编程和声明性的事务管理。
- JDBC模块：提供了一个JBDC的样例模板，使用这些模板能消除传统冗长的JDBC编码还有必须的事务控制，而且能享受到Spring管理事务的好处。
- ORM模块：提供与流行的“对象-关系”映射框架的无缝集成，包括hibernate、JPA、MyBatis等。而且可以使用Spring事务管理，无需额外控制事务。
- OXM模块：提供了一个对Object/XML映射实现，将Java对象映射成XML数据，或者将XML数据映射成java对象，Object/XML映射实现包括JAXB、Castor、XMLBeans和XStream。
- JMS模块：用于JMS(Java Messaging Service)，提供一套“消息生产者、消息消费者”模板用于更加简单的使用JMS，JMS用于在两个应用程序之间，或分布式系统中发送消息，进行异步通信。

🔷Web模块

- 该模块建立在ApplicationContext模块之上，提供了Web应用的功能，如文件上传、FreeMarker等，Spring可以整合Struts2等MVC框架。此外，Spring自己提供了MVC框架Spring MVC。

🔷测试模块

- Spring可以用非容器依赖的编程方式进行几乎所有的测试工作，支持JUnit和TestNG等测试框架。
# 二 环境搭建
参考文章：[Spring 5.2.x 源码环境搭建(Windows 系统环境下)](https://www.cnblogs.com/qubo520/p/13264036.html)
## 2.1 gradle的安装与配置
➡️官方：[Gradle | Releases](https://gradle.org/releases/)
我这里下载的是5.6.4 ：[Gradle | Thank you for downloading Gradle!](https://gradle.org/next-steps/?version=5.6.4&format=bin)

- 下载解压到指定目录

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680179972176-35e5dad7-99a6-4b2b-83ed-f887fd1787fd.png#averageHue=%23fdfdfc&clientId=ub30f95e9-d85a-4&from=paste&height=405&id=u3ec3d69c&originHeight=506&originWidth=1822&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=65595&status=done&style=none&taskId=u0e982368-fa15-41c5-9442-7f0468b30b9&title=&width=1457.6)

- 配置环境变化

GRADLE_HOME：自己的安装目录
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680180018252-c6d6b8f3-c23d-4fdf-bb06-abd20e4f5d4d.png#averageHue=%23d9c6c1&clientId=ub30f95e9-d85a-4&from=paste&height=174&id=ube392459&originHeight=217&originWidth=839&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=12990&status=done&style=none&taskId=u7d100993-ff98-4f39-b6d3-1e304d9c67c&title=&width=671.2)
GRADLE_USER_HOME：仓库地址
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680180052617-d47dd8a3-73da-4b8e-a6a4-4e58ab9b05ef.png#averageHue=%23d8c6c1&clientId=ub30f95e9-d85a-4&from=paste&height=174&id=ubb243f3f&originHeight=217&originWidth=839&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=13190&status=done&style=none&taskId=u97a658ba-09ff-4b71-86b0-c2886a322fc&title=&width=671.2)
%GRADLE_HOME%\bin
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680180083492-d94e1f5d-ea7d-4326-b061-3e23bb5ad95c.png#averageHue=%23ebe4e1&clientId=ub30f95e9-d85a-4&from=paste&height=531&id=u89d1259f&originHeight=664&originWidth=677&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=47837&status=done&style=none&taskId=ubdccea3a-7760-4d34-bec5-adc925fc7a2&title=&width=541.6)

- 验证

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680180137461-a2d4715e-f43e-41de-8e65-ea1059fbb534.png#averageHue=%23181210&clientId=ub30f95e9-d85a-4&from=paste&height=511&id=uc0221efc&originHeight=639&originWidth=1223&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=42289&status=done&style=none&taskId=u5b4cab6a-8138-425f-82cb-bdfd840c9b1&title=&width=978.4)
## 2.2 Spring源码构建
源码地址：[https://github.com/spring-projects/spring-framework/tree/5.2.x](https://github.com/spring-projects/spring-framework/tree/5.2.x)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680180322680-1b7b02b2-17e3-4c71-9e32-28bfc0a0828d.png#averageHue=%23e0c49b&clientId=ub30f95e9-d85a-4&from=paste&height=797&id=ucb915f53&originHeight=996&originWidth=1966&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=219518&status=done&style=none&taskId=u52e373ee-f74e-4e9b-8722-14de19e45ad&title=&width=1572.8)
这里我们以5.2版本源码构建

- 在编译过程中，Spring 会自动下载依赖包，默认使用的是官方镜像，下载比较慢，所以我们提前添加好国内镜像，将下面这行代码粘贴到 build.gradle 文件中的 repositories
```java
//添加阿里云镜像
maven { url "http://maven.aliyun.com/nexus/content/groups/public" }
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680180469705-8dfc1558-c59b-4ffc-82f5-d3c56c826839.png#averageHue=%23f8f4f2&clientId=ub30f95e9-d85a-4&from=paste&height=824&id=ubc126e6d&originHeight=1030&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=208809&status=done&style=none&taskId=u32c13bff-330f-4aea-af9d-0d521d0a554&title=&width=1536)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680180536267-75ac733e-d847-4600-8718-03d63a2eb516.png#averageHue=%23ece5e3&clientId=ub30f95e9-d85a-4&from=paste&height=746&id=u383617c8&originHeight=932&originWidth=1372&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=109196&status=done&style=none&taskId=u58bd1fb9-427c-433b-a365-444dec0bcc7&title=&width=1097.6)

- 点击gradlew.bat完成源码的初步构建

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680180625295-5e410611-3317-4489-a5ec-4e6796cc1f77.png#averageHue=%23f8f4f2&clientId=ub30f95e9-d85a-4&from=paste&height=824&id=ueefbc3a4&originHeight=1030&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=204110&status=done&style=none&taskId=u4dfa29f7-7a95-47f1-85ed-d33522a69f3&title=&width=1536)

- idea 配置，我这里是2022的，其余版本可能有不一样的

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680180666536-8275cecc-3521-4a2e-bc08-8be24e7bfafb.png#averageHue=%233d4246&clientId=ub30f95e9-d85a-4&from=paste&height=714&id=u1ff5cb4e&originHeight=892&originWidth=1229&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=108739&status=done&style=none&taskId=uef6b4a51-c225-42cb-9ad9-e35ab68d9a0&title=&width=983.2)

- 给 Gradle 配置国内镜像

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680180752432-9521905f-c483-45f0-a296-23155c86852a.png#averageHue=%23fcfcfb&clientId=ub30f95e9-d85a-4&from=paste&height=418&id=uff84f8e3&originHeight=522&originWidth=1572&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=50017&status=done&style=none&taskId=uf6ee88b9-099e-4c97-a1b0-9c73758612d&title=&width=1257.6)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680180766333-cf34a333-5cfb-48af-b397-93798a6867c2.png#averageHue=%23fdfdfd&clientId=ub30f95e9-d85a-4&from=paste&height=455&id=u280f2f12&originHeight=569&originWidth=1648&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=50305&status=done&style=none&taskId=u3513d01d-5525-4e3b-b0fe-6e7d7c9ae79&title=&width=1318.4)
```java
allprojects{
    repositories {
        def REPOSITORY_URL = 'http://maven.aliyun.com/nexus/content/groups/public/'
        all { ArtifactRepository repo ->
            def url = repo.url.toString()
            if ((repo instanceof MavenArtifactRepository) && (url.startsWith('https://repo1.maven.org/maven2') || url.startsWith('https://jcenter.bintray.com'))) {
                project.logger.lifecycle 'Repository ${repo.url} replaced by $REPOSITORY_URL .'
                remove repo
            }
        }
        maven {
            url REPOSITORY_URL
        }
    }
}
```

- 进入Idea 进行依赖的下载，知道入下图才是源码构建成功

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680180856740-c93db187-9af3-4244-aeea-1be1230d9b13.png#averageHue=%2386795e&clientId=ub30f95e9-d85a-4&from=paste&height=824&id=u7dda073c&originHeight=1030&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=163236&status=done&style=none&taskId=ub6ea3c2a-9aff-44c8-900b-1f07dcdb0a6&title=&width=1536)
到了这我们基本的源码分析环境就搭建完毕了，下面我们来分析源码，从源码中吸收优秀的思想以及设计

