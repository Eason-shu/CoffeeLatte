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

## 2.1 什么叫事务

**事务是逻辑上的一组操作，要么都执行，要么都不执行。**

我们系统的每个业务方法可能包括了多个原子性的数据库操作，比如下面的 `savePerson()` 方法中就有两个原子性的数据库操作。这些原子性的数据库操作是有依赖的，它们要么都执行，要不就都不执行。

```java
public void savePerson() {
    
  personDao.save(person);
    
  personDetailDao.save(personDetail);
 }
```

另外，需要格外注意的是：**事务能否生效数据库引擎是否支持事务是关键。比如常用的 MySQL 数据库默认使用支持事务的`innodb`引擎。但是，如果把数据库引擎变为 `myisam`，那么程序也就不再支持事务了！**

事务最经典也经常被拿出来说例子就是转账了。假如小明要给小红转账 1000 元，这个转账会涉及到两个关键操作就是：

1. 将小明的余额减少 1000 元
2. 将小红的余额增加 1000 元。

万一在这两个操作之间突然出现错误比如银行系统崩溃或者网络故障，导致小明余额减少而小红的余额没有增加，这样就不对了。事务就是保证这两个关键操作要么都成功，要么都要失败。

## 2.2 事务的4大特点

**原子性：**原子性是指事务是一个不可分割的工作单位，事务中的操作要么全部成功，要么全部失败。比如在同一个事务中的SQL语句，要么全部执行成功，要么全部执行失败。



```mysql
begin transaction;
    update account set money = money-100 where name = '张三';
    update account set money = money+100 where name = '李四';
commit transaction;
```

**一致性：**事务必须使数据库从一个一致性状态变换到另外一个一致性状态。

换一种方式理解就是：事务按照预期生效，数据的状态是预期的状态。

举例说明：张三向李四转100元，转账前和转账后的数据是正确的状态，这就叫一致性，如果出现张三转出100元，李四账号没有增加100元这就出现了数据错误，就没有达到一致性。

**隔离性：**事务的隔离性是多个用户并发访问数据库时，数据库为每一个用户开启的事务，不能被其他事务的操作数据所干扰，多个并发事务之间要相互隔离。

**持久性:** 持久性是指一个事务一旦被提交，它对数据库中数据的改变就是永久性的，接下来即使数据库发生故障也不应该对其有任何影响。

例如我们在使用JDBC操作数据库时，在提交事务方法后，提示用户事务操作完成，当我们程序执行完成直到看到提示后，就可以认定事务以及正确提交，即使这时候数据库出现了问题，也必须要将我们的事务完全执行完成，否则就会造成我们看到提示事务处理完毕，但是数据库因为故障而没有执行事务的重大错误。

## 2.3 如何控制事务

```java
JDBC:
 Connection.setAutoCommit(false);
 Connection.commit();
 Connection.rollback();
Mybatis：
 Mybatis⾃动开启事务
 sqlSession(Connection).commit();
 sqlSession(Connection).rollback();
结论：控制事务的底层 都是Connection对象完成的。
```

## 2.4 Spring 支持两种方式的事务管理

### 2.4.1 编程式事务

通过 `TransactionTemplate`或者`TransactionManager`手动管理事务，实际应用中很少使用，但是对于你理解 Spring 事务管理原理有帮助。

```java
@Autowired
private TransactionTemplate transactionTemplate;
public void testTransaction() {

        transactionTemplate.execute(new TransactionCallbackWithoutResult() {
            @Override
            protected void doInTransactionWithoutResult(TransactionStatus transactionStatus) {
                try {
                    // ....  业务代码
                } catch (Exception e){
                    //回滚
                    transactionStatus.setRollbackOnly();
                }

            }
        });
}



@Autowired
private PlatformTransactionManager transactionManager;

public void testTransaction() {

  TransactionStatus status = transactionManager.getTransaction(new DefaultTransactionDefinition());
          try {
               // ....  业务代码
              transactionManager.commit(status);
          } catch (Exception e) {
              transactionManager.rollback(status);
          }
}
```

### 2.4.2 声明式事务

推荐使用（代码侵入性最小），实际是通过 AOP 实现（基于`@Transactional` 的全注解方式使用最多）。

```java
@Transactional(propagation=propagation.PROPAGATION_REQUIRED)
public void aMethod {
  //do something
  B b = new B();
  C c = new C();
  b.bMethod();
  c.cMethod();
}
```

## 2.5 Spring的事务属性

事务属性：描述事务特征的⼀系列值 1. 隔离属性 2. 传播属性 3. 只读属性 4. 超时属性 5. 异常属性

参考文章：https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247485085&idx=1&sn=01e5c29c49f32886bc897af7632b34ba&chksm=cea24956f9d5c040a07e4d335219f11f888a2d32444c16cade3f69c294ae0a1e416bcd221fb6&token=1613452699&lang=zh_CN&scene=21#wechat_redirect

### 2.5.1 隔离属性 (ISOLATION)

#### 2.5.1.1 并发带来的问题？

在典型的应用程序中，多个事务并发运行，经常会操作相同的数据来完成各自的任务（多个用户对统一数据进行操作）。并发虽然是必须的，但可能会导致以下的问题。

•**脏读（Dirty read）:** 当一个事务正在访问数据并且对数据进行了修改，而这种修改还没有提交到数据库中，这时另外一个事务也访问了这个数据，然后使用了这个数据。因为这个数据是还没有提交的数据，那么另外一个事务读到的这个数据是“脏数据”，依据“脏数据”所做的操作可能是不正确的。

```
@Transactional(isolation=Isolation.READ_COMMITTED)
```

•**丢失修改（Lost to modify）:** 指在一个事务读取一个数据时，另外一个事务也访问了该数据，那么在第一个事务中修改了这个数据后，第二个事务也修改了这个数据。这样第一个事务内的修改结果就被丢失，因此称为丢失修改。 例如：事务1读取某表中的数据A=20，事务2也读取A=20，事务1修改A=A-1，事务2也修改A=A-1，最终结果A=19，事务1的修改被丢失。

```

```

•**不可重复读（Unrepeatableread）:** 指在一个事务内多次读同一数据。在这个事务还没有结束时，另一个事务也访问该数据。那么，在第一个事务中的两次读数据之间，由于第二个事务的修改导致第一个事务两次读取的数据可能不太一样。这就发生了在一个事务内两次读到的数据是不一样的情况，因此称为不可重复读。

```
解决⽅案 @Transactional(isolation=Isolation.REPEATABLE_READ)
本质： ⼀把⾏锁
```

•**幻读（Phantom read）:** 幻读与不可重复读类似。它发生在一个事务（T1）读取了几行数据，接着另一个并发事务（T2）插入了一些数据时。在随后的查询中，第一个事务（T1）就会发现多了一些原本不存在的记录，就好像发生了幻觉一样，所以称为幻读。

```
解决⽅案 @Transactional(isolation=Isolation.SERIALIZABLE)
本质：表锁
```

**不可重复度和幻读区别：**

不可重复读的重点是修改，幻读的重点在于新增或者删除。

例1（同样的条件, 你读取过的数据, 再次读取出来发现值不一样了 ）：事务1中的A先生读取自己的工资为 1000的操作还没完成，事务2中的B先生就修改了A的工资为2000，导 致A再读自己的工资时工资变为 2000；这就是不可重复读。

例2（同样的条件, 第1次和第2次读出来的记录数不一样 ）：假某工资单表中工资大于3000的有4人，事务1读取了所有工资大于3000的人，共查到4条记录，这时事务2 又插入了一条工资大于3000的记录，事务1再次读取时查到的记录就变为了5条，这样就导致了幻读。

#### 2.5.1.2 事务隔离级别

**SQL 标准定义了四个隔离级别：**

•**READ-UNCOMMITTED(读取未提交)：** 最低的隔离级别，允许读取尚未提交的数据变更，**可能会导致脏读、幻读或不可重复读**

•**READ-COMMITTED(读取已提交):** 允许读取并发事务已经提交的数据，**可以阻止脏读，但是幻读或不可重复读仍有可能发生**

•**REPEATABLE-READ（可重读）:** 对同一字段的多次读取结果都是一致的，除非数据是被本身事务自己所修改，**可以阻止脏读和不可重复读，但幻读仍有可能发生。**

•**SERIALIZABLE(可串行化):** 最高的隔离级别，完全服从ACID的隔离级别。所有的事务依次逐个执行，这样事务之间就完全不可能产生干扰，也就是说，**该级别可以防止脏读、不可重复读以及幻读**。

**数据库对于隔离属性的⽀持**

![image-20230727093429852](images\2.png)

```
Oracle不⽀持REPEATABLE_READ值 如何解决不可重复读
采⽤的是多版本⽐对的⽅式 解决不可重复读的问题
```

**默认隔离属性**

```
ISOLATION_DEFAULT：会调⽤不同数据库所设置的默认隔离属性
MySQL : REPEATABLE_READ
Oracle: READ_COMMITTED

```

**查看数据库默认隔离属性**

Mysql

```sql
select @@tx_isolation
```

Oracle

```sql
SELECT s.sid, s.serial#,
 CASE BITAND(t.flag, POWER(2, 28))
 WHEN 0 THEN 'READ COMMITTED'
 ELSE 'SERIALIZABLE'
 END AS isolation_level
FROM v$transaction t
JOIN v$session s ON t.addr = s.taddr
AND s.sid = sys_context('USERENV', 'SID');
```

