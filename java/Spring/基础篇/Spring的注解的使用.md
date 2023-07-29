---

title: Spring的注解
sidebar_position: 7
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
    date: 2023-07-28 23:00:00
    author: EasonShu
---
# 一 为啥要用注解

## 1.1 注解的好处？

- `xml`配置文件太过繁琐，可以直接写在类上，`xml`配置文件需要在`xml`中配置
- 官方推荐使用注解，后面`SpringBoot`中配置，代码简洁，大大提高开发速度
- 发潮流 `Spring2.x`引⼊注解` Spring3.x`完善注解` SpringBoot`普及 推⼴注解编程

## 1.2 啥是注解编程？

- 指的是在类或者⽅法上加⼊特定的注解（@XXX),完成特定功能的开发。

```java
@Component
public class XXX{}
```

## 1.3 发展历程

- `Spring2.x`开始⽀持注解编程 `@Component @Service @Scope..` ⽬的：提供的这些注解只是为了在某些情况下简化`XML`的配置,作为`XML`的有益补充。
-   `Spring3.x @Configuration @Bean.. `⽬的：彻底替换XML，基于纯注解编程 
- ` Spring4.x SpringBoot `提倡使⽤注解常⻅开发

## 1.4 优缺点

- 优点
  - 简化配置
  - 使用起来直观且容易，提升开发的效率
  - 类型安全，容易检测出问题
- 缺点
  - 修改起来比`xml`麻烦
  - 如果不项目不了解，可能给开发和维护带来麻烦

# 二 Spring基本常用注解的使用

这个阶段的注解，仅仅是简化XML的配置，并不能完全替代XML

## 2.1@Component

- 作⽤：替换原有spring配置⽂件中的`<bean>标签`
- 注意： id属性 component注解 提供了默认的设置⽅式 ⾸单词⾸字⺟⼩写 class属性 通过反射获得class内容

![image-20230729225141850](images\image-20230729225141850.png)

![image-20230729230848321](images\image-20230729230848321.png)

- 细节

  - 如何显示指定⼯⼚创建对象的id值

  ```java
  @Component("u")
  ```

  - Spring配置⽂件覆盖注解配置内容

  ```xml
  applicationContext.xml 中
  <bean id="u" class="com.baizhiedu.bean.User"/>
  id值 class的值 要和 注解中的设置保持⼀值
  ```

  - 其他衍生注解

  ```java
  @Component 使用在类上用于实例化Bean
  @Controller 使用在web层类上用于实例化Bean
  @Service 使用在service层类上用于实例化Bean
  @Repository 使用在dao层类上用于实例化Bean
  这些本质上就是@Component
     
  ```

  -		 	如果注解与配置同时出现，配置会覆盖注解的配置

  ```java
  import org.junit.Test;
  import org.springframework.context.support.ClassPathXmlApplicationContext;
  
  /**
   * @description:
   * @author: shu
   * @createDate: 2023/7/29 23:05
   * @version: 1.0
   */
  public class AplTest {
  
  
      /**
       * @description: 测试组件注解
       */
      @Test
      public void componentTest(){
          ClassPathXmlApplicationContext applicationContext = new ClassPathXmlApplicationContext("applicationContext.xml");
          // 注解方式创建对象时，对象的id默认为类名首字母小写
          Object user = applicationContext.getBean("user");
          System.out.println(user);
          // 配置
          Object user1 = applicationContext.getBean("user1");
          System.out.println(user1);
      }
  }
  ```

  ![image-20230729231602420](images\image-20230729231602420.png)

- 总结

`@component`是`spring`中的一个注解，它的作用就是实现bean的注入。
在Java的web开发中，提供3个`@Component`注解衍生注解（功能与`@component`一样）

**衍生注解：**
1、`@Controller` 控制器（注入服务） 用于标注控制层，相当于struts中的action层。
2、`@Service` 服务（注入dao） 用于标注服务层，主要用来进行业务的逻辑处理。
3、`@Repository`（实现dao访问） 用于标注数据访问层，也可以说用于标注数据访问组件，即DAO组件。
@`Component`泛指各种组件，就是说当我们的类不属于各种归类的时候（不属于`@Controller、@Services`等的时候），我们就可以使用`@Component`来标注这个类。

