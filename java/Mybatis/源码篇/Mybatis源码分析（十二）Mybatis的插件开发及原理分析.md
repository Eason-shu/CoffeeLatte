---
title: Mybatis源码分析（十二）Mybatis的插件开发及原理分析
sidebar_position: 14
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

![P2110066.JPG](https://cdn.nlark.com/yuque/0/2023/jpeg/12426173/1677292434864-e92def18-a366-4430-9b83-88d5dec08536.jpeg#averageHue=%23656359&clientId=ubb7dc126-c028-4&from=ui&id=u2603120e&originHeight=3888&originWidth=5184&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=7767103&status=done&style=none&taskId=u3d274aa3-864b-4e42-ab95-65fcfdf3805&title=)


- 官网：[mybatis – MyBatis 3 | 简介](https://mybatis.org/mybatis-3/zh/index.html)
> 学习到的知识

:::info

1. 插件的原理，以及自定义插件
2. 设计模式，代理模式，责任链模式
:::
> 过程梳理

:::warning

1. 通过XMLConfigBuilder 对我们配置的插件文件进行解析，解析完毕添加到**Configuration之中**
2. 我们的插件可以再执行器，隐射处理器，sql处理，结果等地方进行配置，如果开启了插件，会在上面四处地方进行开启，然后通过动态代理模式，来调用我们自己写的插件的方法
:::

---


---

# 一 Mybatis 插件
参考网站：[mybatis – MyBatis 3 | 配置](http://www.mybatis.org/mybatis-3/zh/configuration.html#plugins)
[MyBatis](https://so.csdn.net/so/search?q=MyBatis&spm=1001.2101.3001.7020) 通过提供插件机制，让我们可以根据自己的需要去增强MyBatis 的功
能。MyBatis 的插件可以在不修改原来的代码的情况下，通过拦截的方式，改变四大核心对象的行为，比如处理参数，处理SQL，处理结果。
![729c5ec5718eaa2d4d5cb266611d68ca_4e0250afe4b89163e28e277e04a2246e.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677293479172-b3ca4779-ee15-418f-a489-003542825c08.png#averageHue=%23f0efee&clientId=u4a8ba120-7b28-4&from=paste&height=376&id=u56f62ed1&originHeight=470&originWidth=842&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=113652&status=done&style=none&taskId=u7e3fb700-e50e-4578-ab72-975f8c1618b&title=&width=673.6)
> **🌈🌈支持拦截的方法**

- 执行器Executor（update、query、commit、rollback等方法）；
- 参数处理器ParameterHandler（getParameterObject、setParameters方法）；
- 结果集处理器ResultSetHandler（handleResultSets、handleOutputParameters等方法）；
- SQL语法构建器StatementHandler（prepare、parameterize、batch、update、query等方法）；
> 📌📌**如何使用**

- 自定义拦截器核心就是我们自定义一个类实现Interceptor接口，并实现里边的关键方法：
- Intercept方法，插件的核心方法
- plugin方法，生成target的代理对象
- setProperties方法，传递插件所需参数
```java
package com.shu;


import org.apache.ibatis.executor.statement.StatementHandler;
import org.apache.ibatis.plugin.*;

import java.sql.Connection;
import java.util.Properties;

/**
* @description:
* @author: shu
* @createDate: 2023/2/25 10:57
* @version: 1.0
*/
@Intercepts({
    //注意看这个大花括号，也就这说这里可以定义多个@Signature对多个地方拦截，都用这个拦截器
    @Signature(type = StatementHandler.class,method = "prepare", args = {Connection.class, Integer.class})
})
    public class MyPlugin implements Interceptor {
        /**
*  拦截方法：只要被拦截得目标对象的目标方法被执行时，该方法就会执行
*/
        @Override
        public Object intercept(Invocation invocation) throws Throwable {
            System.out.println("自定义逻辑，对方法进行了增强");
            return invocation.proceed();
        }

        /**
* 将当前的拦截器生成代理对象存到拦截器链中
*/
        @Override
        public Object plugin(Object target) {
            return Plugin.wrap(target, this);
        }

        /**
* 获取配置文件参数
*/
        @Override
        public void setProperties(Properties properties) {
            System.out.println("获取到的配置文件的参数是："+properties);
        }


    }

```
> 👀👀解释

@Signature的三个属性

- type:指拦截哪个接口
- method: 指拦截哪个具体的方法
- args:声明该方法的参数，必须按接口定义的顺序写，主要为了在有方法重载的情况下精确定位到我们要拦截的方法
> 🚀🚀配置文件配置

在Mybatis-config文件中配置我们定义的插件
```xml
<plugins>
  <plugin interceptor="com.shu.MyPlugin">
    <!-- 设置参数，这里随便定义的  -->
    <property name="name" value="1001"/>
  </plugin>
</plugins>

```
测试一下，到这一个简单的插件配置就完成了，下面我们来看看具体的执行原理
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677294589964-6678728a-770d-4ea2-b761-5c414399501f.png#averageHue=%232f2e2d&clientId=u4a8ba120-7b28-4&from=paste&height=278&id=u105baa57&originHeight=347&originWidth=1811&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=70304&status=done&style=none&taskId=u7ebdc387-cf7d-4a49-8290-3dfb201ec0a&title=&width=1448.8)
# 二 原理分析
根据前面的知识，我们可以了解到插件可以对执行器，参数处理器，处理Sql，处理结果，我们首先来看看执行器的拦截
更改拦截方法配置，对查询方法进行拦截
```java
@Intercepts({
    //注意看这个大花括号，也就这说这里可以定义多个@Signature对多个地方拦截，都用这个拦截器
    @Signature(type = Executor.class,method = "query", args = {MappedStatement.class, Object.class , RowBounds.class , ResultHandler.class , CacheKey.class, BoundSql.class})
})
```

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677297578418-b88924a5-6ac3-4887-a98f-1bc95526c3cc.png#averageHue=%232e2d2c&clientId=u4a8ba120-7b28-4&from=paste&height=178&id=uacdac8b0&originHeight=223&originWidth=1113&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=40549&status=done&style=none&taskId=u2fe594f5-be36-49ff-ae9b-a2dcc73c60e&title=&width=890.4)

- 第一步对配置文件中插件的解析，解析完毕添加到configuration中
```java
    <plugins>
        <plugin interceptor="com.shu.MyPlugin">
            <!-- 设置参数，这里随便定义的  -->
            <property name="name" value="1001"/>
        </plugin>
    </plugins>

```
**XMLConfigBuilder**
```java
  /**
   * 解析<plugins>节点
   * @param parent <plugins>节点
   * @throws Exception
   */
  private void pluginElement(XNode parent) throws Exception {
    if (parent != null) { // <plugins>节点存在
      for (XNode child : parent.getChildren()) { // 依次<plugins>节点下的取出每个<plugin>节点
        // 读取拦截器类名
        String interceptor = child.getStringAttribute("interceptor");
        // 读取拦截器属性
        Properties properties = child.getChildrenAsProperties();
        // 实例化拦截器类
        Interceptor interceptorInstance = (Interceptor) resolveClass(interceptor).newInstance();
        // 设置拦截器的属性
        interceptorInstance.setProperties(properties);
        // 将当前拦截器加入到拦截器链中
        configuration.addInterceptor(interceptorInstance);
      }
    }
  }

```

- 为执行器增加为执行器增加拦截器（插件），以启用各个拦截器的功能

**Configuration**
```java
 /**
   * 创建一个执行器
   * @param transaction 事务
   * @param executorType 数据库操作类型
   * @return 执行器
   */
  public Executor newExecutor(Transaction transaction, ExecutorType executorType) {
    executorType = executorType == null ? defaultExecutorType : executorType;
    executorType = executorType == null ? ExecutorType.SIMPLE : executorType;
    Executor executor;
    // 根据数据操作类型创建实际执行器
    if (ExecutorType.BATCH == executorType) {
      executor = new BatchExecutor(this, transaction);
    } else if (ExecutorType.REUSE == executorType) {
      executor = new ReuseExecutor(this, transaction);
    } else {
      executor = new SimpleExecutor(this, transaction);
    }
    // 根据配置文件中settings节点cacheEnabled配置项确定是否启用缓存
    if (cacheEnabled) { // 如果配置启用缓存
      // 使用CachingExecutor装饰实际执行器
      executor = new CachingExecutor(executor);
    }
    // 为执行器增加拦截器（插件），以启用各个拦截器的功能
    executor = (Executor) interceptorChain.pluginAll(executor);
    return executor;
  }
```
我们来看看启用插件的方法
**InterceptorChain**
```java
    /**
     * 向所有的拦截器链提供目标对象，由拦截器链给出替换目标对象的对象
     * @param target 目标对象，是MyBatis中支持拦截的几个类（ParameterHandler、ResultSetHandler、StatementHandler、Executor）的实例
     * @return 用来替换目标对象的对象
     */
    public Object pluginAll(Object target) {
        // 依次交给每个拦截器完成目标对象的替换工作
        for (Interceptor interceptor : interceptors) {
            target = interceptor.plugin(target);
        }
        return target;
    }
```
**Interceptor**
```java
public interface Interceptor {
  /**
   * 该方法内是拦截器拦截到目标方法时的操作
   * @param invocation 拦截到的目标方法的信息
   * @return 经过拦截器处理后的返回结果
   * @throws Throwable
   */
  Object intercept(Invocation invocation) throws Throwable;

  /**
   * 用返回值替代入参对象。
   * 通常情况下，可以调用Plugin的warp方法来完成，因为warp方法能判断目标对象是否需要拦截，并根据判断结果返回相应的对象来替换目标对象
   * @param target MyBatis传入的支持拦截的几个类（ParameterHandler、ResultSetHandler、StatementHandler、Executor）的实例
   * @return 如果当前拦截器要拦截该实例，则返回该实例的代理；如果不需要拦截该实例，则直接返回该实例本身
   */
  default Object plugin(Object target) {
    return Plugin.wrap(target, this);
  }

  /**
   * 设置拦截器的属性
   * @param properties 要给拦截器设置的属性
   */
  default void setProperties(Properties properties) {
    // NOP
  }

}
```
实际上这个采用代理模式与职责链模式InterceptorChain通过下面代码，**逐层**插入拦截**。**如果存在拦截器，在执行目标方法前就会调用拦截器的intercept方法对其进行插入拦截。这样可以改变Mybatis的默认行为（像SQL重写等），我们具体离开你看Plugin这个类，我们看到他实现类InvocationHandle接口

**Plugin**
```java
public class Plugin implements InvocationHandler {
  // 被代理对象
  private final Object target;
  // 拦截器
  private final Interceptor interceptor;
  // 拦截器要拦截的所有的类，以及类中的方法
  private final Map<Class<?>, Set<Method>> signatureMap;

  private Plugin(Object target, Interceptor interceptor, Map<Class<?>, Set<Method>> signatureMap) {
    this.target = target;
    this.interceptor = interceptor;
    this.signatureMap = signatureMap;
  }


/**
   * 根据拦截器的配置来生成一个对象用来替换被代理对象
   * @param target 被代理对象
   * @param interceptor 拦截器
   * @return 用来替换被代理对象的对象
   */
  public static Object wrap(Object target, Interceptor interceptor) {
    // 得到拦截器interceptor要拦截的类型与方法
    Map<Class<?>, Set<Method>> signatureMap = getSignatureMap(interceptor);
    // 被代理对象的类型
    Class<?> type = target.getClass();
    // 逐级寻找被代理对象类型的父类，将父类中需要被拦截的全部找出
    Class<?>[] interfaces = getAllInterfaces(type, signatureMap);
    // 只要父类中有一个需要拦截，说明被代理对象是需要拦截的
    if (interfaces.length > 0) {
      // 创建并返回一个代理对象，是Plugin类的实例
      return Proxy.newProxyInstance(
          type.getClassLoader(),
          interfaces,
          new Plugin(target, interceptor, signatureMap));
    }
    // 直接返回原有被代理对象，这意味着被代理对象的方法不需要被拦截
    return target;
  }

```
动态代理的执行我们前面也讲过，所以我们直接来看invoke方法
**Plugin**
```java
  /**
   * 代理对象的拦截方法，当被代理对象中方法被触发时会进入这里
   * @param proxy 代理类
   * @param method 被触发的方法
   * @param args 被触发的方法的参数
   * @return 被触发的方法的返回结果
   * @throws Throwable
   */
  @Override
  public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    try {
      // 获取该类所有需要拦截的方法
      Set<Method> methods = signatureMap.get(method.getDeclaringClass());
      if (methods != null && methods.contains(method)) {
        // 该方法确实需要被拦截器拦截，因此交给拦截器处理
        return interceptor.intercept(new Invocation(target, method, args));
      }
      // 这说明该方法不需要拦截，交给被代理对象处理
      return method.invoke(target, args);
    } catch (Exception e) {
      throw ExceptionUtil.unwrapThrowable(e);
    }
  }

```
经过动态代理我们就可以调用到我们自己写的插件类，的具体的方法，这里以执行器作为案例讲解，其他也是一样的
> 🐬🐬总结

MyBatis在启动时可以加载插件，并保存插件实例到相关对象(InterceptorChain，拦截器链) 中。待准备工作做完后，MyBatis处于就绪状态。我们在执行SQL时，需要先通过DefaultSqlSessionFactory创建SqlSession。Executor实例会在创建 SqlSession 的过程中被创建，Executor实例创建完毕后，MyBatis会通过JDK动态代理为实例生成代理类。这样，插件逻辑即可在Executor相关方法被调用前执行。

