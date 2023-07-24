---
title: Spring的AOP
sidebar_position: 5
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
  date: 2023-07-23 23:00:00
  author: EasonShu
---
# 一 什么是AOP

## 1.1 AOP与OOP

参考文档：[Spring AOP](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop)
- AOP: 在软件业，AOP为Aspect Oriented Programming的缩写，意为：面向切面编程，通过预编译方
式和运行期动态代理实现程序功能的统一维护的一种技术。
的一种衍生范型。
- OOP：面向对象编程，主要实现业务逻辑的封装，关注点是业务逻辑所在的类。
- OOP中模块化的关键单位是类，而AOP中模块化的单位是切面。
# 二 核心概念

## 2.1 基本概念

- `Aspect`：切面，是切入点和通知（引介）的结合。

- `Joinpoint`：连接点，程序执行过程中的某个特定的点，比如某方法调用的时候或者处理异常的时候。

- `Pointcut`：切入点，匹配连接点的断言，在AOP中通知和一个切入点表达式关联。

- `Advice`：通知，在切面的某个特定的连接点上执行的动作。

- `Introduction`：引介，一种特殊的通知，在不修改类代码的前提下，Introduction可以在运行期为类动态地添加一些方法或Field。

- `Target`：目标对象，被一个或者多个切面所通知的对象。

- `Weaving`：织入，将切面应用到目标对象并导致代理对象创建的过程。

- `Proxy`：代理，一个类被AOP织入切面后，就产生一个结果代理类。

- `AspectJ`：一个面向切面的框架，提供了声明式的语法来定义切面，定义切入点和通知的类型。
  **Spring AOP包括以下类型的advice。**

- `Before advice`: 在连接点之前运行的Advice ，但它不具备以下能力 阻止执行流进行到 join point 的能力（除非它抛出一个异常）。

- `After returning advice`: 在一个连接点正常完成后运行的Advice （例如，如果一个方法返回时没有抛出一个异常）。

- `After (finally) advice`: 无论连接点以何种方式退出（正常或特殊返回），都要运行该advice。
  Around advice: 围绕一个连接点的advice，如方法调用。这是最强大的一种advice。Around advice可以在方法调用之前和之后执行自定义行为。它还负责选择是否继续进行连接点或通过返回自己的返回值或抛出一个异常来缩短advice方法的执行。
  **白话文理解上面的概念**

  切面就是一个类，这个类中可以定义多个方法，这些方法就是通知，通知是在什么时候执行的呢？

  就是在切入点，切入点是什么呢？就是在目标方法执行的时候，这个目标方法就是连接点，连接点是什么呢？

  就是在目标对象中的方法，这个目标对象就是目标对象，目标对象是什么呢？

  就是被代理的对象，这个代理对象是什么呢？就是在织入的时候创建的对象，织入是什么呢？

  就是把切面和目标对象结合起来，创建代理对象的过程就是织入的过程。
# 三 Spring AOP的实现方式
- 基于动态代理的实现方式
- 基于字节码生成的实现方式

## 3.1 JDK动态代理
- JDK动态代理是基于接口的代理，如果目标对象没有实现接口，那么就不能使用JDK动态代理。
- JDK动态代理是通过反射来实现的，它是通过Proxy类来生成代理对象的，Proxy类中有一个方法`newProxyInstance()`，这个方法就是用来生成代理对象的，这个方法的三个参数分别是：
  - `ClassLoader loader`：指定当前目标对象使用的类加载器，获取加载器的方法是固定的。
  - `Class<?>[] interfaces`：目标对象实现的接口的类型，使用泛型方式确认类型。
  - `InvocationHandler h`：事件处理，执行目标对象的方法时，会触发事件处理器的方法，会把当前执行目标对象的方法作为参数传入。
- JDK动态代理的优点是：可以在不修改目标对象的功能前提下，对目标功能扩展。
- JDK动态代理的缺点是：只能对实现了接口的类生成代理对象。
## 3.2 CGLIB动态代理
- CGLIB动态代理是基于类的代理，它是通过继承的方式实现的，它也是通过Proxy类来生成代理对象的，但是它的newProxyInstance()方法的参数和JDK动态代理的newProxyInstance()方法的参数是不一样的，它的参数如下：
  - `Class<?> superClass`：指定当前目标对象使用的类加载器，获取加载器的方法是固定的。
  - `Class<?>[] interfaces`：目标对象实现的接口的类型，使用泛型方式确认类型。
  - `MethodInterceptor h`：事件处理，执行目标对象的方法时，会触发事件处理器的方法，会把当前执行目标对象的方法作为参数传入。
- CGLIB动态代理的优点是：可以在不修改目标对象的功能前提下，对目标功能扩展。
- CGLIB动态代理的缺点是：对于final修饰的方法，无法进行代理。

# 四 案例

假设我们有一个Web应用，其中有一个用户登录功能。我们希望在用户登录成功后记录登录日志，包括登录的用户名、登录时间和登录IP等信息。

## 4.1 开启注解的方式

- 配置式

```xml
    <aop:aspectj-autoproxy/>
```

- 注解式

```java
@Configuration
@EnableAspectJAutoProxy
public class Config {

}
```

开启了上述配置之后，所有**在容器中**，**被`@AspectJ`注解的 bean** 都会被 Spring 当做是 AOP 配置类，称为一个 Aspect。

> NOTE：这里有个要注意的地方，@AspectJ 注解只能作用于Spring Bean 上面，所以你用 @Aspect 修饰的类要么是用 @Component注解修饰，要么是在 XML中配置过的。

比如下面的写法，

```less
@Aspect
@Component
public class MyAspect {
 	//....   
}

// 如果没有在XML配置过，那这个就是无效的AOP配置类
@Aspect
public class MyAspect {
 	//....   
}
// 如果没有@Component需要xml配置
<bean id="loginLoggerAspect" class="com.example.app.MyAspect" />
```

**代码**

- 注解式定义切面，注意注解式需要开启注解，请参考上面的文章

```java
package com.shu.aop.demo04;

import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/24 10:04
 * @version: 1.0
 */
@Component
@Aspect
public class LoginLoggerAspect {
}

```

- 配置式定义切面

```javascript
public class LoginLoggerAspect01 {
}

```

```xml
    <bean id="LoginLoggerAspect01" class="com.shu.aop.demo04.LoginLoggerAspect01"/>
```

## 4.2 配置切入点

Pointcut 在大部分地方被翻译成切点，用于定义哪些方法需要被增强或者说需要被拦截。

在Spring 中，我们可以认为 Pointcut 是用来匹配Spring 容器中所有满足指定条件的bean的方法。（简单来说就是你需要增强的方法）

- 配置式

```java
package com.shu.aop.demo04;

import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/24 10:04
 * @version: 1.0
 */
@Component
@Aspect
public class LoginLoggerAspect {

    /**
     * 定义切入点：就是对哪些方法进行增强
     */
    @Pointcut("execution(* com.shu.aop.demo04.UserServiceImpl.login(..))")
    public void loginPointcut() {
    }
}

```

- XML 

```java
    <!-- 定义切面   -->
    <bean id="LoginLoggerAspect01" class="com.shu.aop.demo04.LoginLoggerAspect01"/>
    <!-- 定义切入点   -->
    <aop:config>
        <aop:pointcut id="pointcut" expression="execution(* com.shu.aop.demo04.UserServiceImpl.*(..))"/>
    </aop:config>
    
```

**切面表达式详解**

切面表达式由切点指示器（Pointcut Designator）和表达式组成，可以定义非常灵活和精确的匹配规则。下

切面表达式的一般格式为：
```xml
execution(modifiers-pattern? return-type-pattern declaring-type-pattern? method-name-pattern(param-pattern) throws-pattern?)
```

- `execution`：是切点指示器，表示对方法执行进行匹配。

  Spring AOP支持以下AspectJ的切点指定器（PCD），用于切点表达式中。

  - `execution`: 用于匹配方法执行的连接点。这是在使用Spring AOP时要使用的主要切点指定器。
  - `within`: 将匹配限制在某些类型内的连接点（使用Spring AOP时，执行在匹配类型内声明的方法）。
  - `this`: 将匹配限制在连接点（使用Spring AOP时方法的执行），其中bean引用（Spring AOP代理）是给定类型的实例。
  - `target`: 将匹配限制在连接点（使用Spring AOP时方法的执行），其中目标对象（被代理的应用程序对象）是给定类型的实例。
  - `args`: 将匹配限制在连接点（使用Spring AOP时方法的执行），其中参数是给定类型的实例。
  - `@target`: 限制匹配到连接点（使用Spring AOP时方法的执行），其中执行对象的类有一个给定类型的注解。
  - `@args`: 将匹配限制在连接点（使用Spring AOP时方法的执行），其中实际传递的参数的运行时类型有给定类型的注解。
  - `@within`: 将匹配限制在具有给定注解的类型中的连接点（使用Spring AOP时，执行在具有给定注解的类型中声明的方法）。
  - `@annotation`: 将匹配限制在连接点的主体（Spring AOP中正在运行的方法）具有给定注解的连接点上。

- `modifiers-pattern`：可选项，用于匹配方法的修饰符，例如public、protected、private等。

- `return-type-pattern`：用于匹配方法的返回类型，可以是具体的类型或通配符*。

- `declaring-type-pattern`：可选项，用于匹配方法所在的类的类型，可以是具体的类名或包名，也可以是通配符*。

- `method-name-pattern`：用于匹配方法名，可以是具体的方法名，也可以是使用通配符*匹配多个方法。

- `param-pattern`：可选项，用于匹配方法的参数类型，可以是具体的类型或通配符*。

- `throws-pattern`：可选项，用于匹配方法抛出的异常类型。

几个例子来帮助理解切面表达式：

1. 匹配所有public方法：
```
execution(public * *(..))
```

2. 匹配所有返回类型为String的方法：
```
execution(String *(..))
```

3. 匹配指定包下的所有方法：
```
execution(* com.example.app.*.*(..))
```

4. 匹配指定包及其子包下的所有方法：
```
execution(* com.example.app..*(..))
```

5. 匹配指定类中的所有方法：
```
execution(* com.example.app.UserService.*(..))
```

6. 匹配指定类中的所有public方法：
```
execution(public * com.example.app.UserService.*(..))
```

7. 匹配指定方法名的方法：
```java
execution(* com.example.app.UserService.login(..))
```

8. 匹配指定方法名和参数类型的方法：
```java
execution(* com.example.app.UserService.login(String, String))
```

9. 匹配指定方法名和任意参数的方法：
```java
execution(* com.example.app.UserService.login(..))
```

10. 匹配指定包中的所有方法，并且方法的返回类型为void：
```java
execution(void com.example.app..*(..))
```

切面表达式是Spring AOP中非常强大和灵活的特性，它使得我们可以针对不同的需求，定义精确的匹配规则，从而实现对目标方法的有选择性地拦截和处理。

## 4.3 配置通知

**注意，实际开发过程当中，Aspect 类应该遵守单一职责原则，不要把所有的Advice配置全部写在一个Aspect类里面。**

- 配置式

```java
package com.shu.aop.demo04;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/24 10:04
 * @version: 1.0
 */
@Component
@Aspect
public class LoginLoggerAspect {

    /**
     * 定义切入点：就是对哪些方法进行增强
     */
    @Pointcut("execution(* com.shu.aop.demo04.UserServiceImpl.login(..))")
    public void loginPointcut() {
    }

    /**
     * 前置通知
     */
    @Before("loginPointcut()")
    public void before(JoinPoint pointcut) {
        System.out.println("前置通知");
        System.out.println("目标类：" + pointcut.getTarget());
        System.out.println("增强方法：" + pointcut.getSignature().getName());
    }

    /**
     * 后置通知
     */
    @AfterReturning("loginPointcut()")
    public void afterReturning(JoinPoint pointcut) {
        System.out.println("后置通知");
        System.out.println("目标类：" + pointcut.getTarget());
        System.out.println("增强方法：" + pointcut.getSignature().getName());
    }

    /**
     * 返回通知
     */
    @After("loginPointcut()")
    public void after(JoinPoint pointcut) {
        System.out.println("返回通知");
        System.out.println("目标类：" + pointcut.getTarget());
        System.out.println("增强方法：" + pointcut.getSignature().getName());
    }

    /**
     * 异常通知
     */
    @AfterThrowing("loginPointcut()")
    public void afterThrowing(JoinPoint pointcut) {
        System.out.println("异常通知");
        System.out.println("目标类：" + pointcut.getTarget());
        System.out.println("增强方法：" + pointcut.getSignature().getName());
    }

    /**
     * 环绕通知
     */
    @Around("loginPointcut()")
    public Object around(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        System.out.println("环绕通知");
        return proceedingJoinPoint.proceed();
    }

}

```

- XML

```java
package com.shu.aop.demo04;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/24 10:22
 * @version: 1.0
 */
public class LoginLoggerAspect01 {
    public void before(JoinPoint joinPoint) throws Throwable {
        System.out.println("前置通知");
        System.out.println("目标类：" + joinPoint.getTarget());
        System.out.println("增强方法：" + joinPoint.getSignature().getName());
    }

    public void after(JoinPoint joinPoint) throws Throwable {
        System.out.println("后置通知");
        System.out.println("目标类：" + joinPoint.getTarget());
        System.out.println("增强方法：" + joinPoint.getSignature().getName());
    }

    public void afterReturning(JoinPoint joinPoint) throws Throwable {
        System.out.println("返回通知");
        System.out.println("目标类：" + joinPoint.getTarget());
        System.out.println("增强方法：" + joinPoint.getSignature().getName());
    }

    public void afterThrowing(JoinPoint joinPoint) throws Throwable {
    }


    public Object around(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        return proceedingJoinPoint.proceed();
    }
}

```

```xml
 <!-- 定义切面   -->
    <bean id="LoginLoggerAspect01" class="com.shu.aop.demo04.LoginLoggerAspect01"/>
    <!-- 定义切入点   -->
    <aop:config>
        <aop:pointcut id="pointcut" expression="execution(* com.shu.aop.demo04.UserServiceImpl.login(..))"/>
        <!-- 定义通知   -->
        <aop:aspect ref="LoginLoggerAspect01">
            <aop:before method="before" pointcut-ref="pointcut"/>
            <aop:after method="after" pointcut-ref="pointcut"/>
            <aop:after-returning method="afterReturning" pointcut-ref="pointcut" />
            <aop:after-throwing method="afterThrowing" pointcut-ref="pointcut" />
            <aop:around method="around" pointcut-ref="pointcut"/>
        </aop:aspect>
    </aop:config>

```

## 4.4 编写测试代码

```java
import com.shu.aop.demo04.UserServiceImpl.login.LoginService;
import com.shu.life.Person;
import org.junit.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.support.ClassPathXmlApplicationContext;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/22 12:31
 * @version: 1.0
 */
@Configuration
@EnableAspectJAutoProxy
@ComponentScan("com.shu.aop.demo04")
public class ApiTest {

    @Test
    public void test() {
        System.out.println("现在开始初始化容器");
        ApplicationContext factory = new ClassPathXmlApplicationContext("applicationContext.xml");
        System.out.println("容器初始化成功");
        //得到Preson，并使用
        Person person = factory.getBean("person", Person.class);
        System.out.println(person);
        System.out.println("现在开始关闭容器！");
        ((ClassPathXmlApplicationContext) factory).registerShutdownHook();
    }


    @Test
    public void test01() {
        ApplicationContext factory = new ClassPathXmlApplicationContext("applicationContext.xml");
        LoginService loginService = factory.getBean("loginService", LoginService.class);
        loginService.login("admin", "password");
    }
}

```

