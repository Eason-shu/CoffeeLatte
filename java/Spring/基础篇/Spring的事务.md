---
title: Spring的事务
sidebar_position: 6
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
last_update:
  date: 2023-07-25 23:00:00
  author: EasonShu
---

# 一 Spring与Mybatis整合

## 1.1 单独使用Mybatis 的问题

- 配置繁琐，如果我们单独使用Mybatis需要写多个Mapper的配置，配置文件臃肿
- 代码冗余，系统中存在冗余代码，特别是APl调用的时候

## 1.2 Spring为啥需要与Mybatis整合

-  JavaEE开发需要持久层进⾏数据库的访问操作
- JDBC Hibernate MyBatis进⾏持久开发过程存在⼤量的代码冗余
- Spring基于模板设计模式对于上述的持久层技术进⾏了封装，极大的简化了代码

##  1.3 Spring可以与那些持久层技术进⾏整合

```javascript
1.JDBC
 |- JDBCTemplate
2. Hibernate (JPA)
 |- HibernateTemplate
3. MyBatis
 |- SqlSessionFactoryBean MapperScannerConfigure
```

## 1.4 Mybatis的开发步骤

```
1. 实体
2. 实体别名
3. 表
4. 创建DAO接⼝
5. 实现Mapper⽂件
6. 注册Mapper⽂件
7. MybatisAPI调⽤
```

- 数据源的封装，在Mybatis中我们用SqlSessionFactory来执行增删改查操作，但是在我们的Spring中提供了SqlSessionFactoryBean这个类来封装数据源的连接
- 包扫描的封装，在我们原来的Mybatis中我们需要配置包扫描的方式，在Spring中提供了一个MapperScannerConfigurer类对我们的接口进行扫描

![未命名绘图.drawio](images\Spring.png)

##  1.5 Mybatis与Spring整合

- 依赖

```xml
    <dependencies>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.31</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-jdbc</artifactId>
            <version>5.1.14.RELEASE</version>
        </dependency>
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis-spring</artifactId>
            <version>2.0.2</version>
        </dependency>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid</artifactId>
            <version>1.1.18</version>
        </dependency>
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
            <version>3.4.6</version>
        </dependency>

    </dependencies>
```

- 配置文件的配置主要包括：数据源的配置，SqlSessionFactory的配置，MapperScannerConfigurer的配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:p="http://www.springframework.org/schema/p"
       xmlns:aop="http://www.springframework.org/schema/aop" xmlns:tx="http://www.springframework.org/schema/tx"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/aop https://www.springframework.org/schema/aop/spring-aop.xsd http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx.xsd">

    <!-- 连接池   -->
    <bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource"
          init-method="init" destroy-method="close">
        <property name="driverClassName" value="com.mysql.cj.jdbc.Driver"></property>
        <property name="url" value="jdbc:mysql://localhost:3306/auth"></property>
        <property name="username" value="root"></property>
        <property name="password" value="123456"></property>
    </bean>


    <!-- SqlSessionFactory   -->
    <bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
        <!--   数据源     -->
        <property name="dataSource" ref="dataSource"></property>
        <!--   包别名     -->
        <property name="typeAliasesPackage" value="com.shu.pojo"></property>
        <!--  mapper位置      -->
        <property name="mapperLocations" >
            <list>
                <value>classpath:mapper/*Mapper.xml</value>
            </list>
        </property>
        <!--   开启日志打印     -->
        <property name="configLocation" value="classpath:mybatis-config.xml"></property>
    </bean>

    <!-- MapperScannerConfigurer -->
    <bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
        <!--  Mapper      -->
        <property name="basePackage" value="com.shu.mapper"></property>
        <!--  SqlSessionFactoryBeanName      -->
        <property name="sqlSessionFactoryBeanName" value="sqlSessionFactory"></property>
    </bean>

    <bean id="UserService" class="com.shu.service.UserService">
        <property name="userMapper" ref="userMapper"></property>
    </bean>

</beans>
```

- 代码结构，代码就自己编写吧很简单

![image-20230726104019082](images\image-20230726104019082.png)

- 详细日志配置

```xml
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>2.6.1</version>
  </dependency>
```

log4j.properties配置文件

```properties
log4j.rootLogger=DEBUG,console,file

log4j.appender.console = org.apache.log4j.ConsoleAppender
log4j.appender.console.Target = System.out
log4j.appender.console.Threshold=DEBUG
log4j.appender.console.layout = org.apache.log4j.PatternLayout
log4j.appender.console.layout.ConversionPattern=[%c]-%m%n

log4j.appender.file = org.apache.log4j.RollingFileAppender

log4j.appender.file.File=log/tibet.log

log4j.appender.file.MaxFileSize=10mb
log4j.appender.file.Threshold=ERROR
log4j.appender.file.layout=org.apache.log4j.PatternLayout
log4j.appender.file.layout.ConversionPattern=[%p][%d{yy-MM-dd}][%c]%m%n

log4j.logger.org.mybatis=DEBUG
log4j.logger.java.sql=DEBUG
log4j.logger.java.sql.Statement=DEBUG
log4j.logger.java.sql.ResultSet=DEBUG
log4j.logger.java.sql.PreparedStatement=INFO
```

mybatis-config.xml配置文件

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
   <settings>
       <setting name="logImpl" value="STDOUT_LOGGING"></setting>
   </settings>
</configuration>

```

- 编写测试代码

```java
import com.shu.mapper.UserMapper;
import com.shu.pojo.User;
import com.shu.service.UserService;
import org.junit.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/26 9:45
 * @version: 1.0
 */
public class APlTest {


    @Test
    public void MybatisTest(){
        ApplicationContext factory = new ClassPathXmlApplicationContext("applicationContext.xml");
        UserService userService = factory.getBean("UserService", UserService.class);
        userService.getUser();
        userService.addUser();
        userService.updateUser();
    }

}

```

![image-20230726104336986](images\image-20230726104336986.png)

## 1.6 思考？

Spring与Mybatis整合后，为什么DAO不提交事务，但是数据能够插⼊数据库中？

Connection --> tx Mybatis(Connection) 本质上控制连接对象

(Connection) ---> 连接池(DataSource)

1. Mybatis提供的连接池对象 ---> 创建Connection Connection.setAutoCommit(false) ⼿⼯的控制了事务 ， 操作完成后，⼿ ⼯提交
2. Druid（C3P0 DBCP）作为连接池 ---> 创建Connection Connection.setAutoCommit(true) true默认值 保持⾃动控制事务，⼀条 sql ⾃动提交 
3. 答案：因为Spring与Mybatis整合时，引⼊了外部连接池对象，保持⾃动的事务提交这 个机制(Connection.setAutoCommit(true)),不需要⼿⼯进⾏事务的操作，也能进 ⾏事务的提交 
4. 注意：未来实战中，还会⼿⼯控制事务(多条sql⼀起成功，⼀起失败)，后续Spring通过 事务控制解决这个问题

# 二 Spring中的事务

