---

title: Spring的介绍
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
  date: 2023-07-20 23:00:00
  author: EasonShu  
---

# 一 Spring的介绍

官网：

[Home](https://spring.io/)

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

![img](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680054921468-64881a3f-ccb8-4d0b-8073-2e3c80eb5b3d.png)

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

#  二  工厂设计模式

- 关于24中设计模式可以参考网站：https://refactoringguru.cn/design-patterns/singleton
- 请记住万物皆对象，无论是我们写的类还是啥，为啥这里这里先介绍工厂模式，因为Spring的核心就在于工厂产生的对象而构成了我们强大的Spring

## 2.1 简单工厂模式

![工厂方法模式](https://refactoringguru.cn/images/patterns/content/factory-method/factory-method-zh.png?id=eb7978e462e88f2ef03aec83d7510389)

**工厂方法模式**是一种创建型设计模式， 其在父类中提供一个创建对象的方法， 允许子类决定实例化对象的类型。

- 硬编码方式获取对象，缺点：代码强耦合，一方的改变影响其他的一方

```java
import com.shu.service.UserServer;
import com.shu.service.UserServerImpl;
import org.junit.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/20 23:38
 * @version: 1.0
 */
public class ApiTest {

    /**
     * 硬编码方式获取对象
     */
    @Test
    public void test1(){
        UserServer userServer = new UserServerImpl();
        userServer.getUser();
    }

}

```

![image-20230720235126449](images\image-20230720235126449.png)

- 简单工厂的实现，首先我们需要维护一个key-Value的关系，新建applicationContext.properties文件

![image-20230720234942873](images\image-20230720234942873.png)

实现我们的工厂，通过反射来获取我们的实现类

```java
package com.shu.factory;

import com.shu.service.UserService;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * @description: Bean工厂类，用于创建对象，解耦合，降低程序间的依赖关系，提高程序的可扩展性
 * @author: shu
 * @createDate: 2023/7/20 23:46
 * @version: 1.0
 */
public class BeanFactory {
    private static Properties env = new Properties();

    static{
        try {
            //第一步 获得IO输入流
            InputStream inputStream = BeanFactory.class.getResourceAsStream("/applicationContext.properties");
            //第二步 文件内容 封装 Properties集合中 key = userService
            env.load(inputStream);
            inputStream.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * 对象的创建方式：
     * @return
     */
    public static UserService getUserService() {
        UserService userService = null;
        try {
            Class clazz = Class.forName(env.getProperty("userService"));
            userService = (UserService) clazz.newInstance();
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (InstantiationException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
        return userService;

    }

}

```

- 测试

```java
import com.shu.factory.BeanFactory;
import com.shu.service.UserService;
import com.shu.service.UserServerImpl;
import org.junit.Test;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/20 23:38
 * @version: 1.0
 */
public class ApiTest {

    /**
     * 硬编码方式获取对象
     */
    @Test
    public void test1(){
        UserService userServer = new UserServerImpl();
        userServer.getUser();
    }

    /**
     * 通过工厂类获取对象
     */
    @Test
    public void test2(){
        UserService userService = BeanFactory.getUserService();
        userService.getUser();
    }

}

```

![image-20230720235126449](images\image-20230720235126449.png)
