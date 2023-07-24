---
title: Mybatis源码分析（十五）Spring-Mybatis整理
sidebar_position: 17
keywords:
  - Mybatis
  - 源码分析
tags:
  - Mybatis
  - 源码分析
  - Java
  - 持久层框架
  - ORM
  - SQL
  - 数据库
  - 学习笔记
last_update:
  date: 2023-07-15
  author: EasonShu
---


![psc.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1679146381131-b11efd42-a5c3-4d89-9d3a-f245e1580419.png#averageHue=%233968a4&clientId=uaeb4c840-f9b1-4&from=ui&id=u358e9eaa&originHeight=1536&originWidth=2048&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=284374&status=done&style=none&taskId=u60011120-d53b-49ab-9d89-790e485dfab&title=)


- 官网：[mybatis – MyBatis 3 | 简介](https://mybatis.org/mybatis-3/zh/index.html)

---


---

# 一 Spring与Mybatis整合
详细参考：[Spring整合MyBatis——超详细_spring mybatis整合](https://blog.csdn.net/qq_42662759/article/details/116757078)

- 将 MyBatis 与 Spring 进行整合，主要解决的问题就是SqlSessionFactory 对象交由 Spring来管理。
- 该整合，只需要将 SqlSessionFactory 的对象生成SqlSessionFactoryBean 注册在 Spring 容器中，再将其注入给 Dao 的实现类即可完成整合。
> 🚀🚀依赖导入

```xml
<dependencies>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.11</version>
            <scope>test</scope>
        </dependency>

        <!-- Junit测试 -->
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.12</version>
            <scope>test</scope>
        </dependency>

        <!-- MyBatis核心Jar包 -->
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
            <version>3.4.6</version>
        </dependency>

        <!-- MySql驱动 -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.22</version>
        </dependency>

        <!-- Lombok工具 -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.12</version>
            <scope>provided</scope>
        </dependency>




        <!-- Spring核心 -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>5.3.3</version>
        </dependency>

        <!-- Spring-test测试 -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-test</artifactId>
            <version>5.3.3</version>
            <scope>test</scope>
        </dependency>

        <!-- slf4j日志包 -->
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-log4j12</artifactId>
            <version>1.7.25</version>
        </dependency>


        <!-- druid阿里的数据库连接池 -->
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid</artifactId>
            <version>1.1.10</version>
        </dependency>


        <!-- Spring整合ORM -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-orm</artifactId>
            <version>5.3.3</version>
        </dependency>

        <!-- Spring整合MyBatis -->
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis-spring</artifactId>
            <version>1.3.2</version>
        </dependency>



    </dependencies>
```
> 💯💯实体类

```java
package com.shu.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
* @author SHU
*/
@Data
    @AllArgsConstructor
    @NoArgsConstructor
    public class User {
        private Integer id;
        private String name;
        private String email;
        private Integer age;
        private Integer sex;
        private String schoolname;
    }
```
> 编写Mapper文件

```java
package com.shu.mapper;

import com.shu.pojo.User;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/3/18 19:46
 * @version: 1.0
 */
@Repository
public interface UserMapper {
    /**
     * 查询所有用户
     * @return
     */
     List<User> getAllUser();
}
```
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
"http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.shu.mapper.UserMapper">

  <!-- 查询所有用户-->
  <select id="getAllUser" resultType="com.shu.pojo.User">
    select * from user
  </select>
</mapper>
```
> 编写配置文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">




    <!--  数据库连接信息  -->
    <bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
        <property name="driverClassName" value="com.mysql.cj.jdbc.Driver"></property>
        <property name="url" value="jdbc:mysql://127.0.0.1:3306/mybatis?useUnicode=true"></property>
        <property name="username" value="root"></property>
        <property name="password" value="123456"></property>
    </bean>


    <!-- 配置SessionFactory的Bean -->
    <bean id="sessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
        <!-- 注入数据源 -->
        <property name="dataSource" ref="dataSource"/>
        <!-- 指定MyBatis配置文件的位置 -->
        <property name="configLocation" value="classpath:mybatis-config.xml"/>
        <!-- 指定MyBatis的Mapper文件的位置 -->
        <property name="mapperLocations" value="classpath:mapper/*.xml"/>
    </bean>


    <!-- 配置mapper接口的扫描器，将Mapper接口的实现类自动注入到IoC容器中
     实现类Bean的名称默认为接口类名的首字母小写 -->
    <bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
        <!-- basePackage属性指定自动扫描mapper接口所在的包 -->
        <property name="basePackage" value="com.shu.mapper"/>
    </bean>


</beans>
```
> 测试类

```java
package com.test;

import com.shu.mapper.UserMapper;
import com.shu.pojo.User;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.util.List;

/**
* @description:
* @author: shu
* @createDate: 2023/3/18 20:49
* @version: 1.0
*/
@RunWith(SpringJUnit4ClassRunner.class)
    @ContextConfiguration(locations = "classpath:application.xml")
    public class SpringMyBatisTest {
        @Autowired
        UserMapper mapper;

        @Test
        public void testFindUserList(){
            List<User> userList = mapper.getAllUser();
            for (User user : userList) {
                System.out.println(user);
            }
        }

    }

```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1679144495297-cd341e61-4e14-4d10-8c9f-bc3e542ad9af.png#averageHue=%23a08c70&clientId=uaeb4c840-f9b1-4&from=paste&height=354&id=uba7cc621&originHeight=443&originWidth=1892&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=134018&status=done&style=none&taskId=u44d2e5bf-eb7a-4a5a-bd58-503bde603b4&title=&width=1513.6)
上面我们把一个测试环境搭建完毕，方便我们自己更好的理解源码，根据我们上面的重点，我们可以看到一个关键类：SqlSessionFactoryBean，下面我们来看看
# 二 Spring中的一些概念
Spring中的概念可以帮助我们理解，但是这里不会详细讲解Sring的分析，后面在详细介绍
## 2.1 BeanDefinition
Spring容器在启动时，首先会对Bean的配置信息进行解析，把Bean的配置信息转换为BeanDefinition对象，BeanDefinition是一个接口，通过不同的实现类来描述不同方式配置的Bean信息。
BeanDefinition用于描述Spring Bean的配置信息，Spring配置Bean的方式通常有3种

- XML配置文件。
- Java注解，例如@Service、@Component等注解。
- Java Config方式，Spring从3.0版本开始支持使用@Configuration注解

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1679145305673-9f02567e-2245-4693-aa59-95ae2070ae42.png#averageHue=%232e2e2e&clientId=uaeb4c840-f9b1-4&from=paste&height=612&id=u48240483&originHeight=765&originWidth=1382&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=57146&status=done&style=none&taskId=u4a4f9482-792f-487c-a916-af92f9638dd&title=&width=1105.6)
## 2.2 BeanDefinitionRegistry
BeanDefinitionRegistry是BeanDefinition容器，所有的Bean配置解析后生成的BeanDefinition对象都会注册到BeanDefinitionRegistry对象中，Spring提供了扩展机制，允许用户在Spring框架启动时，动态地往BeanDefinitionRegistry容器中注册BeanDefinition对象。
## 2.3 BeanFactory
BeanFactory是Spring的Bean工厂，负责Bean的创建及属性注入，它同时是一个Bean容器，Spring框架启动后，会根据BeanDefinition对象创建Bean实例，所有的单例Bean都会注册到BeanFactory容器中。
## 2.4 BeanFactoryPostProcessor
BeanFactoryPostProcessor是Spring提供的扩展机制，用于在所有的Bean配置信息解析完成后修改Bean工厂信息。
## 2.5 ImportBeanDefinitionRegistrar
ImportBeanDefinitionRegistrar是一个接口，该接口的实现类作用于Spring解析Bean的配置阶段，当解析@Configuration注解时，可以通过ImportBeanDefinitionRegistrar接口的实现类向BeanDefinitionRegistry容器中添加额外的BeanDefinition对象。
## 2.6 BeanPostProcessor
Bean的后置处理器，在Bean初始化方法（init-method属性指定的方法或afterPropertiesSet()方法）调用前后，会执行BeanPostProcessor中定义的拦截逻辑。
## 2.7 ClassPathBeanDefinitionScanner
ClassPathBeanDefinitionScanner是BeanDefinition扫描器，能够对指定包下的Class进行扫描，将Class信息转换为BeanDefinition对象注册到BeanDefinitionRegistry容器中。
## 2.8  FactoryBean
FactoryBean是Spring中的工厂Bean，通常用于处理Spring中配置较为复杂或者由动态代理生成的Bean实例。
SqlSessionFactoryBean是一个FactoryBean，通过名称sqlSessionFactory从Spring容器中获取Bean时，获取到的实际上是SqlSessionFactoryBean对象的getObject()方法返回的对象。
## 2.9 Spring容器启动过程

- 对所有Bean的配置信息进行解析，其中包括XML配置文件、Java注解以及Java Config方式配置的Bean，将Bean的配置信息转换为BeanDefinition对象，注册到BeanDefinitionRegistry容器中。
- 从BeanDefinitionRegistry容器中获取实现了BeanFactoryPostProcessor接口的Bean定义，然后实例化Bean，调用所有BeanFactoryPostProcessor对象的postProcessBeanFactory()方法，在postProcessBeanFactory()方法中可以对Bean工厂的信息进行修改。
- 根据BeanDefinitionRegistry容器中的BeanDefinition对象实例化所有的单例Bean，并对Bean的属性进行填充。
- 执行所有实现了BeanPostProcessor接口的Bean的postProcessBeforeInitialization()方法，该方法中可以对原始的Bean进行包装。
- 执行Bean的初始化方法，初始化方法包括配置Bean时通过init-method属性指定的方法，或者通过实现InitializingBean接口重写的afterPropertiesSet()方法。
- 执行所有实现了BeanPostProcessor接口的Bean的  postProcessAfterInitialization()方法。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1679146248011-5daff3b2-ee28-4d3e-b9e6-3246bf8c3202.png#averageHue=%23e9e9e9&clientId=uaeb4c840-f9b1-4&from=paste&height=652&id=u877af918&originHeight=815&originWidth=588&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=135064&status=done&style=none&taskId=ueab59e45-1805-4856-adac-fa4ec37175c&title=&width=470.4)
# 三 SqlSessionFactoryBean
首先看看我们的配置文件，我们配置的SessionFactory的Bean，我们再来看看这个接口信息
```java
    <!-- 配置SessionFactory的Bean -->
    <bean id="sessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
        <!-- 注入数据源 -->
        <property name="dataSource" ref="dataSource"/>
        <!-- 指定MyBatis配置文件的位置 -->
        <property name="configLocation" value="classpath:mybatis-config.xml"/>
        <!-- 指定MyBatis的Mapper文件的位置 -->
        <property name="mapperLocations" value="classpath:mapper/*.xml"/>
    </bean>
```
**SqlSessionFactoryBean**
```java
// 解析mybatisConfig.xml文件和mapper.xml，设置数据源和所使用的事务管理机制，将这些封装到Configuration对象
// 使用Configuration对象作为构造参数，创建SqlSessionFactory对象，其中SqlSessionFactory为单例bean，最后将SqlSessionFactory单例对象注册到spring容器。
public class SqlSessionFactoryBean implements FactoryBean<SqlSessionFactory>, InitializingBean, ApplicationListener<ApplicationEvent> {

  private static final Logger LOGGER = LoggerFactory.getLogger(SqlSessionFactoryBean.class);

  // mybatis配置mybatisConfig.xml的资源文件
  private Resource configLocation;

  //解析完mybatisConfig.xml后生成Configuration对象
  private Configuration configuration;

  // mapper.xml的资源文件
  private Resource[] mapperLocations;

  // 数据源
  private DataSource dataSource;

  // 事务管理，mybatis接入spring的一个重要原因也是可以直接使用spring提供的事务管理
  private TransactionFactory transactionFactory;

  private Properties configurationProperties;

  // mybatis的SqlSessionFactoryBuidler和SqlSessionFactory
  private SqlSessionFactoryBuilder sqlSessionFactoryBuilder = new SqlSessionFactoryBuilder();

  private SqlSessionFactory sqlSessionFactory;


  // 实现FactoryBean的getObject方法
  @Override
  public SqlSessionFactory getObject() throws Exception {

    //...

  }

  // 实现InitializingBean的
  @Override
  public void afterPropertiesSet() throws Exception {

    //...

  }
  // 为单例
  public boolean isSingleton() {
    return true;
  }
}
```
我们可以 看到SqlSessionFactory的接口设计如下：实现了spring提供的**FactoryBean，InitializingBean和ApplicationListener这三个接口，在内部封装了mybatis的相关组件作为内部属性，如mybatisConfig.xml配置资源文件引用，mapper.xml配置资源文件引用，以及SqlSessionFactoryBuilder构造器和SqlSessionFactory引用。**
## 3.2 InitializingBean接口
bean实现的接口，这些bean需要在BeanFactory设置其所有属性后做出反应:例如，执行自定义初始化，或者仅仅检查是否已设置了所有强制属性。
```java
public interface InitializingBean {
	/**
	 * Invoked by the containing {@code BeanFactory} after it has set all bean properties
	 * and satisfied {@link BeanFactoryAware}, {@code ApplicationContextAware} etc.
	 * <p>This method allows the bean instance to perform validation of its overall
	 * configuration and final initialization when all bean properties have been set.
	 * @throws Exception in the event of misconfiguration (such as failure to set an
	 * essential property) or if initialization fails for any other reason
	 */
	void afterPropertiesSet() throws Exception;
}
```
我们来看看SqlSessionFactoryBean组件的初始化代码，其实就是SqlSessionFactory的初始化构建，当然我们也可以自定义一个类，实现这个接口来完成一些组件类的初始化
**SqlSessionFactoryBean**
```java
@Override
public void afterPropertiesSet() throws Exception {
    notNull(dataSource, "Property 'dataSource' is required");
    notNull(sqlSessionFactoryBuilder, "Property 'sqlSessionFactoryBuilder' is required");
    state((configuration == null && configLocation == null) || !(configuration != null && configLocation != null),
              "Property 'configuration' and 'configLocation' can not specified with together");
    // 创建sqlSessionFactory
    this.sqlSessionFactory = buildSqlSessionFactory();
}
```
```java
protected SqlSessionFactory buildSqlSessionFactory() throws IOException {
    // 配置类
   Configuration configuration;
    // 解析mybatis-Config.xml文件，
    // 将相关配置信息保存到configuration
   XMLConfigBuilder xmlConfigBuilder = null;
   if (this.configuration != null) {
     configuration = this.configuration;
     if (configuration.getVariables() == null) {
       configuration.setVariables(this.configurationProperties);
     } else if (this.configurationProperties != null) {
       configuration.getVariables().putAll(this.configurationProperties);
     }
    //资源文件不为空
   } else if (this.configLocation != null) {
     //根据configLocation创建xmlConfigBuilder，XMLConfigBuilder构造器中会创建Configuration对象
     xmlConfigBuilder = new XMLConfigBuilder(this.configLocation.getInputStream(), null, this.configurationProperties);
     //将XMLConfigBuilder构造器中创建的Configuration对象直接赋值给configuration属性
     configuration = xmlConfigBuilder.getConfiguration();
   }

    //略....

   if (xmlConfigBuilder != null) {
     try {
       //解析mybatis-Config.xml文件，并将相关配置信息保存到configuration
       xmlConfigBuilder.parse();
       if (LOGGER.isDebugEnabled()) {
         LOGGER.debug("Parsed configuration file: '" + this.configLocation + "'");
       }
     } catch (Exception ex) {
       throw new NestedIOException("Failed to parse config resource: " + this.configLocation, ex);
     }
   }

   if (this.transactionFactory == null) {
     //事务默认采用SpringManagedTransaction，这一块非常重要，我将在后买你单独写一篇文章讲解Mybatis和Spring事务的关系
     this.transactionFactory = new SpringManagedTransactionFactory();
   }
    // 为sqlSessionFactory绑定事务管理器和数据源
    // 这样sqlSessionFactory在创建sqlSession的时候可以通过该事务管理器获取jdbc连接，从而执行SQL
   configuration.setEnvironment(new Environment(this.environment, this.transactionFactory, this.dataSource));
    // 解析mapper.xml
   if (!isEmpty(this.mapperLocations)) {
     for (Resource mapperLocation : this.mapperLocations) {
       if (mapperLocation == null) {
         continue;
       }
       try {
         // 解析mapper.xml文件，并注册到configuration对象的mapperRegistry
         XMLMapperBuilder xmlMapperBuilder = new XMLMapperBuilder(mapperLocation.getInputStream(),
             configuration, mapperLocation.toString(), configuration.getSqlFragments());
         xmlMapperBuilder.parse();
       } catch (Exception e) {
         throw new NestedIOException("Failed to parse mapping resource: '" + mapperLocation + "'", e);
       } finally {
         ErrorContext.instance().reset();
       }

       if (LOGGER.isDebugEnabled()) {
         LOGGER.debug("Parsed mapper file: '" + mapperLocation + "'");
       }
     }
   } else {
     if (LOGGER.isDebugEnabled()) {
       LOGGER.debug("Property 'mapperLocations' was not specified or no matching resources found");
     }
   }

    // 将Configuration对象实例作为参数，
    // 调用sqlSessionFactoryBuilder创建sqlSessionFactory对象实例
   return this.sqlSessionFactoryBuilder.build(configuration);
}
```

- 第一步我们可以看到configuration的解析，其实就是mybatis-config.xml的解析

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1679148913143-3033c67a-995c-4ef6-9fd8-ed7604db9cd5.png#averageHue=%234f6753&clientId=u08bcc9b8-631c-4&from=paste&height=546&id=u5a51e2b9&originHeight=682&originWidth=1908&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=183108&status=done&style=none&taskId=u414b9df6-c4b6-4014-9903-1d7265bf9cb&title=&width=1526.4)

- 第二步为configuration设置属性，比如objectFactory，objectWrapperFactory，vfs，typeAliasesPackage等等信息
- 第三步开始解析配置文件，其实就是xmlConfigBuilder对configuration 文件的解析，这里与Mybatis单个中，对configuration的解析是一样的
- 第四步为configuration配置环境

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1679149231429-c673f59e-8099-412a-a64d-5197f9184d11.png#averageHue=%234d594e&clientId=u08bcc9b8-631c-4&from=paste&height=560&id=u182d00e6&originHeight=700&originWidth=1912&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=149430&status=done&style=none&taskId=u57deb6ad-9766-4a89-8395-0926574cd4f&title=&width=1529.6)

- 第五步我们编写的mapperLocations所在的位置对我们编写的Mapper文件进行解析，遍历我们编写的配置文件，通过XMLMapperBuilder进行解析，这里可以参考前面的代码分析，到这返回一个DefaultSqlSessionFactory对象

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1679149307606-c18a31fb-b152-47d3-96c8-beb9122cb424.png#averageHue=%234c544e&clientId=u08bcc9b8-631c-4&from=paste&height=564&id=ub2489997&originHeight=705&originWidth=1902&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=165122&status=done&style=none&taskId=u68d6c456-d9e9-4295-9f0d-d2e91d3f9fa&title=&width=1521.6)
> 总结

buildSqlSessionFactory的核心逻辑：解析mybatis配置文件mybatisConfig.xml和mapper配置文件mapper.xml并封装到Configuration对象中，最后调用mybatis的sqlSessionFactoryBuilder来创建SqlSessionFactory对象。这一点相当于前面介绍的原生的mybatis的初始化过程。另外，当**配置中未指定事务时，mybatis-spring默认采用SpringManagedTransaction，这一点非常重要，请大家先在心里做好准备**。此时SqlSessionFactory已经创建好了，并且赋值到了SqlSessionFactoryBean的sqlSessionFactory属性中。
## 3.2 FactoryBean
由BeanFactory中使用的对象实现的接口，这些对象本身就是单个对象的工厂，如果一个bean实现了这个接口，那么它将被用作要公开的对象的工厂，而不是直接用作将自己公开的bean实例。
spring的IOC容器在启动，创建好bean对象实例后，会检查这个bean对象是否实现了FactoryBean接口，如果是，则调用该bean对象的getObject方法，在getObject方法中实现创建并返回实际需要的bean对象实例，然后将该实际需要的bean对象实例注册到spring容器；如果不是则直接将该bean对象实例注册到spring容器。
我们来看看getObject()方法
```java
 @Override
  public SqlSessionFactory getObject() throws Exception {
    if (this.sqlSessionFactory == null) {
      afterPropertiesSet();
    }
    return this.sqlSessionFactory;
  }

```
> 总结

SqlSessionFactoryBean的getObject方法实现如下：由于spring在创建SqlSessionFactoryBean自身的bean对象时，已经调用了InitializingBean的afterPropertiesSet方法创建了sqlSessionFactory对象，故可以直接返回sqlSessionFactory对象给spring的IOC容器，从而完成sqlSessionFactory的bean对象的注册，之后可以直接在应用代码注入或者spring在创建其他bean对象时，依赖注入sqlSessionFactory对象。
> 📌📌注意

等我们学习了Spring的源码，再来分析Spring与Mybatis的动态代理与事务

