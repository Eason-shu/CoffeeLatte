---
title: Mybatis源码分析（十四）Mybatis的设计模式梳理
sidebar_position: 16
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


![_DSC8055.JPG](https://cdn.nlark.com/yuque/0/2023/jpeg/12426173/1678457083016-12ecad61-4687-42eb-a80b-800212817f6d.jpeg#averageHue=%235c6f81&clientId=u2f6e3cf6-f15b-4&from=ui&id=ub1108804&originHeight=2832&originWidth=4256&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=7017830&status=done&style=none&taskId=uff9f298c-e43c-410f-868e-f1a51bb3fa9&title=)


- 官网：[mybatis – MyBatis 3 | 简介](https://mybatis.org/mybatis-3/zh/index.html)

设计模式参考网站：[设计模式目录：22种设计模式](https://refactoringguru.cn/design-patterns/catalog)

---


---

前面介绍了Mybatis的基本知识，我们通过源码可以发现，优秀的框架少不了设计模式的运用，下面我们来梳理一下Mybatis的设计模式
# 一 工厂模式
## 1.1 案例说明
**工厂方法模式**是一种创建型设计模式， 其在父类中提供一个创建对象的方法， 允许子类决定实例化对象的类型。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1678458065236-87cd70fd-a5e5-4157-994e-b5bfb7e449c6.png#averageHue=%23bfc2bc&clientId=uaecff04d-221d-4&from=paste&id=uc8869e77&originHeight=400&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=161338&status=done&style=none&taskId=uc5041dd4-347f-4158-8897-0f8f96735d6&title=)
简单来说，抽离出共同特性，创造出不同实现，我们我们以一个案例来说明，我们现在有一个家具工厂，但是需要生成出不同风格的家具，但是生产的标准是不会变动的，下面我们来看看这个案例

- 我们我们定义接口标准
```java
/**
 * @description: 抽象工厂方法
 * @author: shu
 * @createDate: 2022/9/10 12:13
 * @version: 1.0
 */
public interface FurnitureFactory {

    /**
     * 生成椅子
     * @return
     */
     Chair creatChair();

    /**
     * 生成办公桌
     * @return
     */
    CoffeeTable creatCoffeeTable();

    /**
     * 生成沙发
     * @return
     */
    Sofa creatSofa();
}
```

- 下面有多种工厂实现，但是不同的工厂的风格是不一样的

现代风格
```java
/**
 * @description: 现代风格
 * @author: shu
 * @createDate: 2022/9/10 12:25
 * @version: 1.0
 */
public class ModernFurnitureFactory implements FurnitureFactory{
    /**
     * 生成椅子
     *
     * @return
     */
    @Override
    public Chair creatChair() {
        return new Chair(180,150,"现代风格");
    }


    /**
     * 生成办公桌
     *
     * @return
     */
    @Override
    public CoffeeTable creatCoffeeTable() {
        return new CoffeeTable(180,150,"现代风格");
    }


    /**
     * 生成沙发
     *
     * @return
     */
    @Override
    public Sofa creatSofa() {
        return new Sofa(180,150,"现代风格");
    }
}

```
维多利亚 风格
```java
**
 * @description: 维多利亚
 * @author: shu
 * @createDate: 2022/9/10 12:23
 * @version: 1.0
 */
public class VictorianFurnitureFactory implements FurnitureFactory{

    /**
     * 生成椅子
     *
     * @return
     */
    @Override
    public Chair creatChair() {
        return new Chair(180,150,"维多利亚");
    }


    /**
     * 生成办公桌
     *
     * @return
     */
    @Override
    public CoffeeTable creatCoffeeTable() {
        return new CoffeeTable(180,150,"维多利亚");
    }


    /**
     * 生成沙发
     *
     * @return
     */
    @Override
    public Sofa creatSofa() {
        return new Sofa(180,150,"维多利亚");
    }
}
```
我们可以看到他有不同风格的实现，两种工厂互不干扰，互不影响，在实际开发中会有很多这样的情况，统一返回接口是一样的，但是不同类型的事务的具体处理过程是不一样的，这时我们就可以用工厂模式来简化开发，下面我们来看看Mybatis的工厂模式
## 1.2 源码设计模式分析
首先让我们来看看我们的测试类
```java
   @Test
    public void SelectById(){
        // 第一阶段：MyBatis的初始化阶段
        String resource = "mybatis-config.xml";
        // 得到配置文件的输入流
        InputStream inputStream = null;
        try {
            inputStream = Resources.getResourceAsStream(resource);
        } catch (IOException e) {
            e.printStackTrace();
        }
        // 得到SqlSessionFactory
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        // 第二阶段：数据读写阶段
        try (SqlSession session = sqlSessionFactory.openSession()) {
            // 找到接口对应的实现
            UserMapper userMapper = session.getMapper(UserMapper.class);
            // 调用接口展开数据库操作
            User user = userMapper.queryById(1);
            System.out.println(user);
        }
    }
```
我们重点来关注下SqlSessionFactory 的创建，前面我们详细的讲过他的源码，这里我们只是重点针对设计模式进行分析
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1678500706256-30b12087-58aa-48fa-b08b-a668df9d6b5e.png#averageHue=%232f2e2d&clientId=u6bbdf27f-7616-4&from=paste&height=338&id=u0f2ac1b6&originHeight=422&originWidth=1069&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=19482&status=done&style=none&taskId=u525ad382-0337-4029-ba06-4b4e3579b5d&title=&width=855.2)
首先我们来看看接口方法
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1678501038442-e2b81793-7a63-44f4-bf84-dcefba9ec11a.png#averageHue=%232d2c2b&clientId=u6bbdf27f-7616-4&from=paste&height=580&id=u815e5cfb&originHeight=725&originWidth=1344&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=91325&status=done&style=none&taskId=ub483accd-8f65-4b02-9fa0-f5ca6074904&title=&width=1075.2)
我们可以发现接口的返回结果都是一致的，但是传入的参数不同，我们再来看看他是决定如何用哪一个实现类的
**DefaultSqlSessionFactory**
```java
  /**
   * 从数据源中获取SqlSession对象
   * @param execType 执行器类型
   * @param level 事务隔离级别
   * @param autoCommit 是否自动提交事务
   * @return SqlSession对象
   */
  private SqlSession openSessionFromDataSource(ExecutorType execType, TransactionIsolationLevel level, boolean autoCommit) {
    Transaction tx = null;
    try {
      // 找出要使用的指定环境
      final Environment environment = configuration.getEnvironment();
      // 从环境中获取事务工厂
      final TransactionFactory transactionFactory = getTransactionFactoryFromEnvironment(environment);
      // 从事务工厂中生产事务
      tx = transactionFactory.newTransaction(environment.getDataSource(), level, autoCommit);
      // 创建执行器
      final Executor executor = configuration.newExecutor(tx, execType);
      // 创建DefaultSqlSession对象
      return new DefaultSqlSession(configuration, executor, autoCommit);
    } catch (Exception e) {
      closeTransaction(tx); // may have fetched a connection so lets call close()
      throw ExceptionFactory.wrapException("Error opening session.  Cause: " + e, e);
    } finally {
      ErrorContext.instance().reset();
    }
  }
```
该⽅法先从configuration读取对应的环境配置，然后初始化TransactionFactory 获得⼀个 Transaction 对象，然后通过 Transaction 获取⼀个 Executor 对象，最后通过configuration、Executor、是否autoCommit三个参数构建了 SqlSession，Mybatis还有很多地方也使用了M工厂模式，暂不分析了。
# 二 单例模式
## 2.1 案例说明
**单例模式**是一种创建型设计模式， 让你能够保证一个类只有一个实例， 并提供一个访问该实例的全局节点。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1678501996459-4129bd51-493b-4ad9-b5a1-8c21c04f1f23.png#averageHue=%23333333&clientId=u6bbdf27f-7616-4&from=paste&id=u677d705f&originHeight=400&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=116922&status=done&style=none&taskId=ubdba35c3-2467-4ae7-9a4e-13c9b42eed2&title=)

- **保证一个类只有一个实例**。
- **为该实例提供一个全局访问节点**。

单例模式（Singleton）是一种非常简单且容易理解的设计模式。顾名思义，单例即单一的实例，确切地讲就是指在某个系统中只存在一个实例，同时提供集中、统一的访问接口，以使系统行为保持协调一致。singleton一词在逻辑学中指“有且仅有一个元素的集合”，这非常恰当地概括了单例的概念，也就是“一个类仅有一个实例”。但是单例模式的实现有很多种，这里我就不一一介绍了，我们来介绍一下懒汉式单例模式。
全世界只有一个太阳？
```java
package com.shu;

/**
 * @description: 太阳类，世界上只有一个太阳，既然太阳系里只有一个太阳，我们就需要严格把控太阳实例化的过程。
 * @author: shu
 * @createDate: 2022/9/8 16:06
 * @version: 1.0
 */
public class Sun {

    // static关键字确保太阳的静态性
    private static  Sun sun;

    // 调用该方法进行类的初始化，
    private static Sun getInstance(){
        if(sun==null){
            sun=new Sun();
        }
        return sun;
    }
}

```

- 只有在某线程第一次调用getInstance()方法时才会运行对太阳进行实例化的逻辑代码，之后再请求就直接返回此实例了。
- 这样的好处是如无请求就不实例化，节省了内存空间，而坏处是第一次请求的时候速度较之前的饿汉初始化模式慢，因为要消耗CPU资源去临时造这个太阳（即使速度快到可以忽略不计）。
## 2.2 源码设计模式分析
在Mybatis中有两个地方用到单例模式，ErrorContext和LogFactory，其中ErrorContext是用在每个线程范围内的单例，用于记录该线程的执行环境错误信息，而LogFactory则是提供给整个Mybatis使用的日志工厂，用于获得针对项目配置好的日志对象。
**ErrorContext**
```java
public class ErrorContext {
  // 获得当前操作系统的换行符
  private static final String LINE_SEPARATOR = System.getProperty("line.separator","\n");

  // 将自身存储进ThreadLocal，从而进行线程间的隔离
  private static final ThreadLocal<ErrorContext> LOCAL = new ThreadLocal<>();


 // 存储上一版本的自身，从而组成错误链
  private ErrorContext stored;

  // 下面几条为错误的详细信息，可以写入一项或者多项
  private String resource;
  private String activity;
  private String object;
  private String message;
  private String sql;
  private Throwable cause;


  private ErrorContext() {
  }

  /**
   * 从ThreadLocal取出已经实例化的ErrorContext，或者实例化一个ErrorContext放入ThreadLocal
   * @return ErrorContext实例
   */
  public static ErrorContext instance() {
    ErrorContext context = LOCAL.get();
    if (context == null) {
      context = new ErrorContext();
      LOCAL.set(context);
    }
    return context;
  }

  /**
   * 创建一个包装了原有ErrorContext的新ErrorContext
   * @return 新的ErrorContext
   */
  public ErrorContext store() {
    ErrorContext newContext = new ErrorContext();
    newContext.stored = this;
    LOCAL.set(newContext);
    return LOCAL.get();
  }

  /**
   * 剥离出当前ErrorContext的内部ErrorContext
   * @return 剥离出的ErrorContext对象
   */
  public ErrorContext recall() {
    if (stored != null) {
      LOCAL.set(stored);
      stored = null;
    }
    return LOCAL.get();
  }


}
```
ErrorContext在Mybatis的很多地方都有使用，使Mybatis问题的定位十分容易，这也主要取决于ErrorContext的成员变量

- **resource**：存储异常存在于哪个资源文件中。
如：### The error may exist in mapper/AuthorMapper.xml
- **activity**：存储异常是做什么操作时发生的。
如：### The error occurred while setting parameters
- **object**：存储哪个对象操作时发生异常。
如：### The error may involve defaultParameterMap
- **message**：存储异常的概览信息。
如：### Error querying database. Cause: java.sql.SQLSyntaxErrorException: Unknown column 'id2' in 'field list'
- **sql**：存储发生日常的 SQL 语句。
如：### SQL: select id2, name, sex, phone from author where name = ?
- **cause**：存储详细的 Java 异常日志。
如：### Cause: java.sql.SQLSyntaxErrorException: Unknown column 'id2' in 'field list' at
org.apache.ibatis.exceptions.ExceptionFactory.wrapException(ExceptionFactory.java:30) at
org.apache.ibatis.session.defaults.DefaultSqlSession.selectList(DefaultSqlSession.java:150) at
org.apache.ibatis.session.defaults.DefaultSqlSession.selectList(DefaultSqlSession.java:141) at
org.apache.ibatis.binding.MapperMethod.executeForMany(MapperMethod.java:139) at org.apache.ibatis.binding.MapperMethod.execute(MapperMethod.java:76)
# 三 代理模式

- 代理模式（Proxy），顾名思义，有代表打理的意思。某些情况下，当客户端不能或不适合直接访问目标业务对象时，业务对象可以通过代理把自己的业务托管起来，使客户端间接地通过代理进行业务访问。
- 代理模式是一种结构型设计模式， 让你能够提供对象的替代品或其占位符。 代理控制着对于原对象的访问， 并允许在将请求提交给对象前后进行一些处理。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1678503084067-750123e3-5f75-44f6-a2eb-3f4191daa32b.png#averageHue=%2370706f&clientId=uc72b0747-de87-4&from=paste&id=u1bdd7d23&originHeight=400&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=168985&status=done&style=none&taskId=u13e01667-f232-4335-9bfe-1c8fe6162f7&title=)
## 3.1 动态代理案例
记住重要的一点，为其他对象提供一个代理以控制对某个对象的访问。代理类主要负责为委托了（真实对象）预处理消息、过滤消息、传递消息给委托类，代理类不现实具体服务，而是利用委托类来完成服务，并将执行结果封装处理。
在我们的现实生活中其实有很多这样的案例，不如商品经销商与厂家的关系，出租房的人与中介。

- 子类继承同一个接口
```java
package com.shu.agency;

/**
 * @author shu
 * @version 1.0
 * @date 2022/7/20 16:00
 * @describe 代理类和委托代理类都要实现的接口
 */
public interface Sell {
    /**
     * 销售产品
     */
    void market();

    /**
     * 生成产品
     */
    void add();
}
```

- 厂家
```java
package com.shu.agency;

/**
 * @author shu
 * @version 1.0
 * @date 2022/7/20 16:03
 * @describe 生产厂家
 */
public class Production implements Sell{

    @Override
    public void market() {
        System.out.println("生产厂家销售产品了哦！！！");
    }

    @Override
    public void add() {
        System.out.println("生产厂家销售产品了哦！！！");
    }
}

```

- 经销商
```java
package com.shu.agency;

/**
 * @author shu
 * @version 1.0
 * @date 2022/7/20 16:05
 * @describe 商家代销产品
 */
public class Merchant implements Sell{

    Sell production;

    public Merchant(Production production) {
        this.production = production;
    }

    @Override
    public void market() {
        production.market();
    }

    @Override
    public void add() {
        production.add();
    }
}

```

- 在这我们可以看出被委托类持有委托类的引用，在实际中调用还是委托者的方法。
- 这里我们也可以看到类之间的解耦，不用修改被委托的类就可以做额外处理，但是缺点就是我们需要指定被代理的类。
- 由字面意思可知，在程序运行期间生成的代理方法，我们称为动态代理，注意是在Java代码中动态生成。
- 在使用动态代理时，我们需要定义一个位于代理类与委托类之间的中介类，这个中介类被要求实现InvocationHandler接口。
```java
/**
 * 调用处理程序
 */
public interface InvocationHandler {
    Object invoke(Object proxy, Method method, Object[] args);
}
```

- 从InvocationHandler这个名称我们就可以知道，实现了这个接口的中介类用做“调用处理器”。
- 当我们调用代理类对象的方法时，这个“调用”会转送到invoke方法中，代理类对象作为proxy参数传入，参数method标识了我们具体调用的是代理类的哪个方法，args为这个方法的参数。这样一来，我们对代理类中的所有方法的调用都会变为对invoke的调用。
- 这样我们可以在invoke方法中添加统一的处理逻辑(也可以根据method参数对不同的代理类方法做不同的处理)。

**定义中介类**
```java
package com.shu.agency;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

/**
 * @author shu
 * @version 1.0
 * @date 2022/7/20 19:33
 * @describe
 */
public class DynamicProxy implements InvocationHandler {
    //obj为委托类对象;

    private Object obj;


    public DynamicProxy(Object obj) {
        this.obj = obj;
    }

    /**
     * 通过反射来执行真正的方法
     * @param proxy
     * @param method
     * @param args
     * @return
     * @throws Throwable
     */
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        Object result = method.invoke(obj, args);
        return result;
    }
}

```
**测试**
```java
package com.shu.agency;

import java.lang.reflect.Proxy;

/**
 * @author shu
 * @version 1.0
 * @date 2022/7/20 19:35
 * @describe
 */
public class ProxyTest {
    public static void main(String[] args) {
        //创建中介类实例
        DynamicProxy inter = new DynamicProxy(new Production());
        //加上这句将会产生一个$Proxy0.class文件，这个文件即为动态生成的代理类文件
        System.getProperties().put("sun.misc.ProxyGenerator.saveGeneratedFiles","true");
        //获取代理类实例sell
        Sell sell = (Sell)(Proxy.newProxyInstance(Sell.class.getClassLoader(), new Class[] {Sell.class}, inter));
        sell.market();
        sell.add();

    }
}

```
## 3.2 源码设计模式分析
让我们来看看Mybatis中的动态代理模式吧，一个很显著的地方接口方法的隐射，我们编写的接口方法Mybatis是如何调用的

- 解析文件时，扫描我们编写的Mybatis接口方法
```java
public <T> void addMapper(Class<T> type) {
    // 要加入的肯定是接口，否则不添加
    if (type.isInterface()) {
      // 加入的是接口
      if (hasMapper(type)) {
        // 如果添加重复
        throw new BindingException("Type " + type + " is already known to the MapperRegistry.");
      }
      boolean loadCompleted = false;
      try {
        knownMappers.put(type, new MapperProxyFactory<>(type));
        // It's important that the type is added before the parser is run
        // otherwise the binding may automatically be attempted by the
        // mapper parser. If the type is already known, it won't try.
        MapperAnnotationBuilder parser = new MapperAnnotationBuilder(config, type);
        parser.parse();
        loadCompleted = true;
      } finally {
        if (!loadCompleted) {
          knownMappers.remove(type);
        }
      }
    }
  }
```

- 根据接口类型实例化一个映射器代理工厂

**MapperProxyFactory**
```java

public class MapperProxyFactory<T> {

  // 对应SQL的java接口类
  private final Class<T> mapperInterface;
  private final Map<Method, MapperMethod> methodCache = new ConcurrentHashMap<>();

  /**
   * MapperProxyFactory构造方法
   * @param mapperInterface 映射接口
   */
  public MapperProxyFactory(Class<T> mapperInterface) {
    this.mapperInterface = mapperInterface;
  }

  public Class<T> getMapperInterface() {
    return mapperInterface;
  }

  public Map<Method, MapperMethod> getMethodCache() {
    return methodCache;
  }

  @SuppressWarnings("unchecked")
  protected T newInstance(MapperProxy<T> mapperProxy) {
    // 三个参数分别是：
    // 创建代理对象的类加载器、要代理的接口、代理类的处理器（即具体的实现）。
    return (T) Proxy.newProxyInstance(mapperInterface.getClassLoader(), new Class[] { mapperInterface }, mapperProxy);
  }

  public T newInstance(SqlSession sqlSession) {
    final MapperProxy<T> mapperProxy = new MapperProxy<>(sqlSession, mapperInterface, methodCache);
    return newInstance(mapperProxy);
  }

}

```

- 接下来在Session.getMapper方法的时候，实例化对应的代理接口方法

**MapperRegistry**
```java
  /**
   * 找到指定映射接口的映射文件，并根据映射文件信息为该映射接口生成一个代理实现
   * @param type 映射接口
   * @param sqlSession sqlSession
   * @param <T> 映射接口类型
   * @return 代理实现对象
   */
  @SuppressWarnings("unchecked")
  public <T> T getMapper(Class<T> type, SqlSession sqlSession) {
    // 找出指定映射接口的代理工厂
    final MapperProxyFactory<T> mapperProxyFactory = (MapperProxyFactory<T>) knownMappers.get(type);
    if (mapperProxyFactory == null) {
      throw new BindingException("Type " + type + " is not known to the MapperRegistry.");
    }
    try {
      // 通过mapperProxyFactory给出对应代理器的实例
      return mapperProxyFactory.newInstance(sqlSession);
    } catch (Exception e) {
      throw new BindingException("Error getting mapper instance. Cause: " + e, e);
    }
  }
```
```java
  public T newInstance(SqlSession sqlSession) {
    final MapperProxy<T> mapperProxy = new MapperProxy<>(sqlSession, mapperInterface, methodCache);
    return newInstance(mapperProxy);
  }
```

- 下面我们来看关键的地方，代理隐射方法MapperProxy

**MapperProxy**
```java
public class MapperProxy<T> implements InvocationHandler, Serializable {
    private static final long serialVersionUID = -6424540398559729838L;
  private final SqlSession sqlSession;
  private final Class<T> mapperInterface;
  // 该Map的键为方法，值为MapperMethod对象。通过该属性，完成了MapperProxy内（即映射接口内）方法和MapperMethod的绑定
  private final Map<Method, MapperMethod> methodCache;


  public MapperProxy(SqlSession sqlSession, Class<T> mapperInterface, Map<Method, MapperMethod> methodCache) {
    this.sqlSession = sqlSession;
    this.mapperInterface = mapperInterface;
    this.methodCache = methodCache;
  }


  @Override
  public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    try {
      // 继承自Object的方法
      if (Object.class.equals(method.getDeclaringClass())) {
        // 直接执行原有方法
        return method.invoke(this, args);
      } else if (method.isDefault()) { // 默认方法
        // 执行默认方法
        return invokeDefaultMethod(proxy, method, args);
      }
    } catch (Throwable t) {
      throw ExceptionUtil.unwrapThrowable(t);
    }
    // 找对对应的MapperMethod对象
    final MapperMethod mapperMethod = cachedMapperMethod(method);
    // 调用MapperMethod中的execute方法
    return mapperMethod.execute(sqlSession, args);
  }


  private MapperMethod cachedMapperMethod(Method method) {
    return methodCache.computeIfAbsent(method, k -> new MapperMethod(mapperInterface, method, sqlSession.getConfiguration()));
  }

  private Object invokeDefaultMethod(Object proxy, Method method, Object[] args)
      throws Throwable {
    final Constructor<MethodHandles.Lookup> constructor = MethodHandles.Lookup.class
        .getDeclaredConstructor(Class.class, int.class);
    if (!constructor.isAccessible()) {
      constructor.setAccessible(true);
    }
    final Class<?> declaringClass = method.getDeclaringClass();
    return constructor
        .newInstance(declaringClass,
            MethodHandles.Lookup.PRIVATE | MethodHandles.Lookup.PROTECTED
                | MethodHandles.Lookup.PACKAGE | MethodHandles.Lookup.PUBLIC)
        .unreflectSpecial(method, declaringClass).bindTo(proxy).invokeWithArguments(args);
  }
}
```
通过这种方式，我们只需要编写Mapper.java接口类，当真正执行一个Mapper接口的时候，就会转发给MapperProxy.invoke方法，而该方法则会调用后续的sqlSession.cud>executor.execute>prepareStatement等一系列方法，完成SQL的执行和返回，注意动态代理模式在Mybatis中有很多运行，我就不一一介绍了，比如：PooledConnection，Plugin等等
# 四 建造者模式

- 建造者模式（Builder）所构建的对象一定是庞大而复杂的，并且一定是按照既定的制造工序将组件组装起来的，例如计算机、汽车、建筑物等。我们通常将负责构建这些大型对象的工程师称为建造者。
- 与工厂系列模式不同的是，建造者模式的主要目的在于把烦琐的构建过程从不同对象中抽离出来，使其脱离并独立于产品类与工厂类，最终实现用同一套标准的制造工序能够产出不同的产品。

![](https://cdn.nlark.com/yuque/0/2022/png/12426173/1662789025289-c18f6e47-c9f9-4d6c-96b5-102a0b9f5908.png#averageHue=%23a2b0a2&from=url&id=kYeHY&originHeight=400&originWidth=640&originalType=binary&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&title=)
## 4.1 案例
![ef41a27a968ae364cf78d82d36cf8104_itstack-demo-design-3-02.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1662793232551-119dd08f-0a7c-45e7-9244-4835eda37807.png#averageHue=%23889f52&clientId=u7ce97644-0169-4&from=paste&height=469&id=uc8e1d639&originHeight=586&originWidth=1140&originalType=binary&ratio=1&rotation=0&showTitle=false&size=191178&status=done&style=none&taskId=u062f1cd3-cf5b-4d6f-94fc-594519f077e&title=&width=912)

- 建筑物本身应该由多个组件组成，且各组件按一定工序建造，缺一不可。
- 建筑物的组件建造是相当复杂的，为了简化其数据模型，我们将组成建筑物的模块归纳为3个组件，分别是地基、墙体、屋顶。
```java
package com.shu;

/**
 * @description: 建筑
 * @author: shu
 * @createDate: 2022/9/10 14:20
 * @version: 1.0
 */

import java.util.ArrayList;
import java.util.List;

public class Building {

    // 用List来模拟建筑物组件的组装
    private List<String> buildingComponents = new ArrayList<>();


    /**
     * 地皮
     * @param basement
     */
    public void setBasement(String basement) {// 地基
        this.buildingComponents.add(basement);
    }


    /**
     * 墙
     * @param wall
     */
    public void setWall(String wall) {// 墙体
        this.buildingComponents.add(wall);
    }

    /**
     * 吊顶
     * @param roof
     */

    public void setRoof(String roof) {// 屋顶
        this.buildingComponents.add(roof);
    }


    @Override
    public String toString() {
        String buildingStr = "";
        for (int i = buildingComponents.size() - 1; i >= 0; i--) {
            buildingStr += buildingComponents.get(i);
        }
        return buildingStr;
    }

}
```
组建专业的建筑施工团队对建筑工程项目的实施至关重要，于是地产开发商决定通过招标的方式来选择施工方。招标大会上有很多建筑公司来投标，他们各有各的房屋建造资质，有的能建别墅，有的能建多层公寓，还有能力更强的能建摩天大楼，建造工艺也各有区别。但无论如何，开发商规定施工方都应该至少具备三大组件的建造能力，于是施工标准公布出来了。
```java
package com.shu;

/**
 * @description: 建造标准
 * @author: shu
 * @createDate: 2022/9/10 14:22
 * @version: 1.0
 */
public interface Builder {

    /**
     * 建筑地基
     */
     void buildBasement();


    /**
     * 建筑墙体
     */
    void buildWall();


    /**
     * 建筑屋顶
     */
    void buildRoof();


    /**
     * 得到最后的建筑
     * @return
     */
    Building getBuilding();
}

```
A公司
```java
package com.shu;

/**
 * @description: A施工队
 * @author: shu
 * @createDate: 2022/9/10 14:26
 * @version: 1.0
 */
public class HouseBuilder implements Builder {

    private Building house;

    public HouseBuilder() {
        this.house = new Building();
    }

    /**
     * 建筑地基
     */
    @Override
    public void buildBasement() {
        System.out.println("挖土方，部署管道、线缆，水泥加固，搭建围墙、花园。");
        house.setBasement("╬╬╬╬╬╬╬╬\n");
    }

    /**
     * 建筑墙体
     */
    @Override
    public void buildWall() {
        System.out.println("搭建木质框架，石膏板封墙并粉饰内外墙。");
        house.setWall("｜田｜田 田|\n");
    }

    /**
     * 建筑屋顶
     */
    @Override
    public void buildRoof() {
        System.out.println("建造木质屋顶、阁楼，安装烟囱，做好防水。");
        house.setRoof("╱◥███◣\n");
    }

    /**
     * 得到最后的建筑
     *
     * @return
     */
    @Override
    public Building getBuilding() {
        return house;
    }
}

```
B公司
```java
package com.shu;

/**
 * @description:
 * @author: shu
 * @createDate: 2022/9/10 14:30
 * @version: 1.0
 */
public class ApartmentBuilder implements Builder {
    private Building apartment;


    public ApartmentBuilder() {
        this.apartment = new Building();
    }

    /**
     * 建筑地基
     */
    @Override
    public void buildBasement() {
        System.out.println("深挖地基，修建地下车库，部署管道、线缆、风道。");
        apartment.setBasement("╚═════════╝\n");
    }

    /**
     * 建筑墙体
     */
    @Override
    public void buildWall() {
        System.out.println("搭建多层建筑框架，建造电梯井，钢筋混凝土浇灌。");
        for (int i = 0; i < 8; i++) {// 此处假设固定8层
            apartment.setWall("║ □ □ □ □ ║\n");
        }
    }

    /**
     * 建筑屋顶
     */
    @Override
    public void buildRoof() {
        System.out.println("封顶，部署通风井，做防水层，保温层。");
        apartment.setRoof("╔═════════╗\n");
    }

    /**
     * 得到最后的建筑
     *
     * @return
     */
    @Override
    public Building getBuilding() {
        return apartment;
    }
}


```

- 虽然施工方很好地保证了建筑物三大组件的施工质量，但开发商还是不放心，因为施工方毕竟只负责干活，施工流程无法得到控制。
- 工程总监并不关心是哪个施工方来造房子，更不关心施工方有什么样的建造工艺，但他能保证对施工工序的绝对把控，也就是说，工程总监只控制施工流程。
```java
package com.shu;

/**
 * @description: 监工
 * @author: shu
 * @createDate: 2022/9/10 14:32
 * @version: 1.0
 */
public class Director {
    public Builder builder;


    public Director(Builder builder) {
        this.builder = builder;
    }


    public void setBuilder(Builder builder) {
        this.builder = builder;
    }

    /**
     * 监工规定施工步骤，工程总监并不关心是哪个施工方来造房子，更不关心施工方有什么样的建造工艺，
     * 但他能保证对施工工序的绝对把控，也就是说，工程总监只控制施工流程。
     * @return
     */
    public Building direct(){
        builder.buildBasement();
        builder.buildWall();
        builder.buildRoof();
        return builder.getBuilding();
    }
}

```
测试
```java
package com.shu;

/**
 * @description:
 * @author: shu
 * @createDate: 2022/9/10 14:36
 * @version: 1.0
 */
public class Client {
    public static void main(String[] args) {
        Director director = new Director(new HouseBuilder());
        Building direct = director.direct();
        System.out.println(direct);
        System.out.println("----------------------------------------");
        Director director1 = new Director(new ApartmentBuilder());
        Building direct1 = director1.direct();
        System.out.println(direct1);
    }
}

```
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1662792631106-7d4f9e33-2902-4251-8942-21ecbaded788.png#averageHue=%23a5946c&clientId=u7ce97644-0169-4&from=paste&height=824&id=uc51bb2bf&originHeight=1030&originWidth=1920&originalType=binary&ratio=1&rotation=0&showTitle=false&size=157371&status=done&style=none&taskId=u4b8169b3-4221-4292-b61a-88662e97092&title=&width=1536)
## 4.2 源码设计模式分析
在Mybtais中建造者模式的实现主要集中于在对配置文件进行解析的时候，比如：
SqlSessionFactoryBuilder，MappedStatement，等等，下面我们以SqlSessionFactoryBuilder来进行分析
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1678505291238-7fba0561-85aa-48aa-8bdc-ebe09f92dc46.png#averageHue=%23967e55&clientId=u3156f626-e0f8-4&from=paste&height=437&id=ubb743d47&originHeight=546&originWidth=1872&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=154600&status=done&style=none&taskId=u74581b75-d3d9-4aca-8a6b-707cf0de6ca&title=&width=1497.6)
SqlSessionFactoryBuilder即根据不同的输入参数来构建SqlSessionFactory这个工厂对象。
# 五 装饰器模式
## 5.1 代码案例

- 装饰器模式（Decorator）能够在运行时动态地为原始对象增加一些额外的功能，使其变得更加强大。
- 从某种程度上讲，装饰器非常类似于“继承”，它们都是为了增强原始对象的功能，区别在于方式的不同，后者是在编译时（compile-time）静态地通过对原始类的继承完成，而前者则是在程序运行时（run-time）通过对原始对象动态地“包装”完成，是对类实例（对象）“装饰”的结果。
- 穿衣服是使用装饰的一个例子。 觉得冷时， 你可以穿一件毛衣。 如果穿毛衣还觉得冷， 你可以再套上一件夹克。 如果遇到下雨， 你还可以再穿一件雨衣。 所有这些衣物都 “扩展” 了你的基本行为， 但它们并不是你的一部分， 如果你不再需要某件衣物， 可以方便地随时脱掉。

![](https://cdn.nlark.com/yuque/0/2022/png/12426173/1662866741111-8e05b07b-19dd-4592-95c0-e1f27c41b79c.png#averageHue=%23608063&from=url&id=J460l&originHeight=400&originWidth=640&originalType=binary&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&title=)

人们总是惊叹女生们魔法师一般的化妆技巧，可以从素面朝天变成花容月貌（如图9-2所示），化妆前后简直判若两人，这正是装饰器的粉饰效果在发挥作用。
**化妆接口**
```java
package com.shu;

/**
 * @description:
 * @author: shu
 * @createDate: 2022/9/11 11:46
 * @version: 1.0
 */
public interface Showable {

    // 展示
    public void  show();

}

```
**素颜**
```java
package com.shu;

/**
 * @description:
 * @author: shu
 * @createDate: 2022/9/11 11:47
 * @version: 1.0
 */
public class Girl implements Showable{


    @Override
    public void show() {
        System.out.println("女生的素颜");
    }
}

```
抽象类
```java
package com.shu;

/**
 * @description:
 * @author: shu
 * @createDate: 2022/9/11 11:48
 * @version: 1.0
 */
public abstract class Decorator implements Showable{


    private Showable showable;

    public Decorator(Showable showable) {
        this.showable = showable;
    }


    @Override
    public void show() {
        showable.show();
    }
}

```
粉底
```java
package com.shu;

/**
 * @description: 粉底
 * @author: shu
 * @createDate: 2022/9/11 12:06
 * @version: 1.0
 */
public class FoundationMakeup extends Decorator {

    public FoundationMakeup(Showable showable) {
        super(showable);
    }

    @Override
    public void show() {
        System.out.println("打粉底了");
        super.show();
    }
}

```
口红
```java
package com.shu;

/**
 * @description:
 * @author: shu
 * @createDate: 2022/9/11 12:07
 * @version: 1.0
 */
public class Lipstick extends Decorator{

    public Lipstick(Showable showable) {
        super(showable);
    }


    @Override
    public void show() {
        System.out.println("涂口红");
        super.show();
    }
}

```
测试
```java
package com.shu;

/**
 * @description:
 * @author: shu
 * @createDate: 2022/9/11 11:49
 * @version: 1.0
 */
public class Client {
    public static void main(String[] args) {
       new Lipstick(new FoundationMakeup(new Girl())).show();
    }
}

```

- 可以看到我们在不改变原来类的基础上，对类进行增强，进行包装，实现更多的功能。
- 装饰器模式最终的目的就在于“装饰”对象，其中装饰器抽象类扮演着至关重要的角色，它实现了组件的通用接口，并且使自身抽象化以迫使子类继承，使装饰器固定特性的延续与多态化成为可能。
- 在我看来有点无限套娃。
## 5.2 源码设计模式分析
我们来看看执行器的装饰器模式
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1678505680008-505a396c-419e-4b6b-9fcd-e1680165fdfa.png#averageHue=%232e2d2d&clientId=u3156f626-e0f8-4&from=paste&height=419&id=ue03be866&originHeight=524&originWidth=1004&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=19276&status=done&style=none&taskId=ua1f2f5ae-04bc-419f-8731-c8ff6d57084&title=&width=803.2)
CachingExecutor使用了装饰器模式来给具体的Executor添加缓存功能，他实现了Executor接口，同时内部持有某一个Executor的具体实现类(4.3中的某一个)，在主流程方法的执行过程中添加缓存相关的读取流程。CachingExecutor再实现的缓存是二级缓存，因此在整个Mybatis的查询过程中，是先查询二级缓存的再查询一级缓存的，因为二级缓存是通过这个装饰器类实现的，那么会在真正的Executor查询之前访问二级缓存，如果没有命中，那么就会会真正的走Executor的查询流程(比如SimpleExecutor的),在SimpleExecutor里面才会再去查询一级缓存(流程是在BaseExecutor中实现的)。下面是CachingExecutor代码，具体的过程可以参考前面的一级缓存与二级缓存
**CachingExecutor**
```java
/**
   * 更新数据库数据，INSERT/UPDATE/DELETE三种操作都会调用该方法
   * @param ms 映射语句
   * @param parameterObject 参数对象
   * @return 数据库操作结果
   * @throws SQLException
   */
  @Override
  public int update(MappedStatement ms, Object parameterObject) throws SQLException {
    // 根据要求判断语句执行前是否要清除二级缓存，如果需要，清除二级缓存
    flushCacheIfRequired(ms);
    return delegate.update(ms, parameterObject);
  }

  @Override
  public <E> List<E> query(MappedStatement ms, Object parameterObject, RowBounds rowBounds, ResultHandler resultHandler) throws SQLException {
    BoundSql boundSql = ms.getBoundSql(parameterObject);
    CacheKey key = createCacheKey(ms, parameterObject, rowBounds, boundSql);
    return query(ms, parameterObject, rowBounds, resultHandler, key, boundSql);
  }

  @Override
  public <E> Cursor<E> queryCursor(MappedStatement ms, Object parameter, RowBounds rowBounds) throws SQLException {
    flushCacheIfRequired(ms);
    return delegate.queryCursor(ms, parameter, rowBounds);
  }

  /**
   * 查询数据库中的数据
   * @param ms 映射语句
   * @param parameterObject 参数对象
   * @param rowBounds 翻页限制条件
   * @param resultHandler 结果处理器
   * @param key 缓存的键
   * @param boundSql 查询语句
   * @param <E> 结果类型
   * @return 结果列表
   * @throws SQLException
   */
  @Override
  public <E> List<E> query(MappedStatement ms, Object parameterObject, RowBounds rowBounds, ResultHandler resultHandler, CacheKey key, BoundSql boundSql)
      throws SQLException {
    // 获取MappedStatement对应的缓存，可能的结果有：该命名空间的缓存、共享的其它命名空间的缓存、无缓存
    Cache cache = ms.getCache();
    // 如果映射文件未设置<cache>或<cache-ref>则，此处cache变量为null
    if (cache != null) { // 存在缓存
      // 根据要求判断语句执行前是否要清除二级缓存，如果需要，清除二级缓存
      flushCacheIfRequired(ms);
      if (ms.isUseCache() && resultHandler == null) { // 该语句使用缓存且没有输出结果处理器
        // 二级缓存不支持含有输出参数的CALLABLE语句，故在这里进行判断
        ensureNoOutParams(ms, boundSql);
        // 从缓存中读取结果
        @SuppressWarnings("unchecked")
        List<E> list = (List<E>) tcm.getObject(cache, key);
        if (list == null) { // 缓存中没有结果
          // 交给被包装的执行器执行
          list = delegate.query(ms, parameterObject, rowBounds, resultHandler, key, boundSql);
          // 缓存被包装执行器返回的结果
          tcm.putObject(cache, key, list); // issue #578 and #116
        }
        return list;
      }
    }
    // 交由被包装的实际执行器执行
    return delegate.query(ms, parameterObject, rowBounds, resultHandler, key, boundSql);
  }
```
# 六 组合模式
## 6.1 案例

- 组合模式又叫部分整体模式，它创建了对象组的属性结构，将对象组合成树状结构以表示“整体-部分”的层次关系。
- 组合模式依据树形结构来组合对象，用来表示部分以及整体层次。
- 这种类型的设计模式属于结构型模式。
- 组合模式使得用户对单个对象和嘴和对象的访问具有一致性，即：组合能让客户以一致的方式处理个别对象以及组合对象。

![](https://cdn.nlark.com/yuque/0/2022/png/12426173/1662803786447-85a5fc7b-6042-484c-a0ab-5a4ec4a34922.png#averageHue=%23557758&from=url&id=ZP3E7&originHeight=400&originWidth=640&originalType=binary&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&title=)
具体参考：[重学 Java 设计模式：实战组合模式「营销差异化人群发券，决策树引擎搭建场景」](https://bugstack.cn/md/develop/design-pattern/2020-06-08-%E9%87%8D%E5%AD%A6%20Java%20%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F%E3%80%8A%E5%AE%9E%E6%88%98%E7%BB%84%E5%90%88%E6%A8%A1%E5%BC%8F%E3%80%8B.html#)![](https://cdn.nlark.com/yuque/0/2022/png/12426173/1662861213787-e176ab0d-4f18-48bd-a2e8-a0c250e8a14e.png?x-oss-process=image%2Fresize%2Cw_937%2Climit_0#averageHue=%23faf3ed&from=url&id=w161h&originHeight=393&originWidth=937&originalType=binary&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&title=)
## 6.2 源码设计模式分析
在我们Mybatis中组合模式的运用，主要在针对动态Sql的SqlNode解析
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1678506250938-a53b7687-bdd1-45af-8c98-5769ce9c1593.png#averageHue=%232d2d2c&clientId=u3156f626-e0f8-4&from=paste&height=590&id=u8e1ab8a2&originHeight=737&originWidth=1445&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=37879&status=done&style=none&taskId=ub1ab46c2-d1a3-4e0e-ab82-9e64e27275a&title=&width=1156)
处理动态Sql节点信息
**DynamicSqlSource**
```java
 /**
   * 获取一个BoundSql对象
   * @param parameterObject 参数对象
   * @return BoundSql对象
   */
  @Override
  public BoundSql getBoundSql(Object parameterObject) {
    // 创建DynamicSqlSource的辅助类，用来记录DynamicSqlSource解析出来的
    // * SQL片段信息
    // * 参数信息
    DynamicContext context = new DynamicContext(configuration, parameterObject);
    // 这里会逐层（对于mix的node而言）调用apply。最终不同的节点会调用到不同的apply,完成各自的解析
    // 解析完成的东西拼接到DynamicContext中，里面含有#{}
    // 在这里，动态节点和${}都被替换掉了。
    rootSqlNode.apply(context);
    // 处理占位符、汇总参数信息
    // RawSqlSource也会焦勇这一步
    SqlSourceBuilder sqlSourceParser = new SqlSourceBuilder(configuration);
    Class<?> parameterType = parameterObject == null ? Object.class : parameterObject.getClass();
    // 使用SqlSourceBuilder处理#{}，将其转化为？
    // 相关参数放进了context.bindings
    // *** 最终生成了StaticSqlSource对象，然后由它生成BoundSql
    SqlSource sqlSource = sqlSourceParser.parse(context.getSql(), parameterType, context.getBindings());
    BoundSql boundSql = sqlSource.getBoundSql(parameterObject);
    // 把context.getBindings()的参数放到boundSql的metaParameters中进行保存
    context.getBindings().forEach(boundSql::setAdditionalParameter);
    return boundSql;
  }
```
rootSqlNode.apply(context)，方法通过组合模式来解析动态Sql
```java
/**
 * @author Clinton Begin
 * 在我们写动态的SQL语句时，<if></if>  <where></where> 这些就是sqlNode
 */
public interface SqlNode {

  /**
   * 完成该节点自身的解析
   * @param context 上下文环境，节点自身的解析结果将合并到该上下文环境中
   * @return 解析是否成功
   */
  boolean apply(DynamicContext context);
}

```
当然Mybatis中还有其他设计模式，后面有时间在再补充

