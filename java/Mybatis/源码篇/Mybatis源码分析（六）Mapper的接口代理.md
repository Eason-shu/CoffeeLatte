---
title: Mybatis源码分析（六）Mapper的接口代理
sidebar_position: 8
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



![P2190113.JPG](https://cdn.nlark.com/yuque/0/2023/jpeg/12426173/1676960748296-6b9a556b-f037-48ec-a270-d37c57b9d0ab.jpeg#averageHue=%235d695c&clientId=ue08d7b12-06e7-4&from=ui&id=u4995f6de&originHeight=3888&originWidth=5184&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=8818462&status=done&style=none&taskId=ueb30d741-f776-40d6-912c-febbd115fea&title=)

- 官网：[mybatis – MyBatis 3 | 简介](https://mybatis.org/mybatis-3/zh/index.html)

在Mapper文件的对sql语句的解析过程中，我们发现MapperRegistry.addMapper其实就是获取当前映射文件的命名空间，并获取其Class，也就是获取每个Mapper接口，然后为每个Mapper接口创建一个代理类工厂，new MapperProxyFactory T (type)，并放进 knownMappers 这个HashMap中，我们来看看这个MapperProxyFactory。下面我们来看看为啥我们可以直接调用接口的方法？

---

> 学习到的知识

:::info

1. 动态代理的实现，是如何直接可以调用我们写的接口方法？
:::
> 过程梳理

:::warning

1. 首先通过类名，来获取到接口的信息，调用DefaultSqlSession#getMapper方法来获取Mapper的接口信息
2. 接着调用Configuration中获取隐射注册表的方法来获取到他的代理接口，拿到MapperProxyFactory代理对象
3. 注意动态接口的生成在SqlSessionFactory的初始化是就已经解析好了，请参考前面的文章对Mapper文件进行解析时
4. 上面我们拿到了代理工厂对象，实际上是他的代理类MapperProxy在执行
5. 根据动态代理的执行方式，下面应该调用invoke（）方法，来执行真正的代码
6. 接着从缓存中获取真正的执行对象MapperMethod，如果 缓存不存在就创建一个MapperMethod对象返回
7. 注意在MapperMethod的初始化过程中我们需要关注到两个类：SqlCommand与MethodSignature
8. 在MapperMethod实例化后调用execute方法执行映射接口中的方法
:::

---

```java
       // 第二阶段：数据读写阶段
        try (SqlSession session = sqlSessionFactory.openSession()) {
            // 找到接口对应的实现
            UserMapper userMapper = session.getMapper(UserMapper.class);
            // 组建查询参数
            User userParam = new User();
            userParam.setSchoolname("Sunny School");
            // 调用接口展开数据库操作
            List<User> userList =  userMapper.queryAllByLimit(userParam);
            // 打印查询结果
            for (User user : userList) {
                System.out.println("name : " + user.getName() + " ;  email : " + user.getEmail());
            }
        }
```
# 一 动态代理
Java的动态代理是一种在运行时生成代理类的方式，可以在不修改源码的情况下对已有类进行代理。动态代理的使用需要用到Java反射包中的Proxy类和InvocationHandler接口。
使用动态代理的一般步骤如下：

-  定义一个接口，该接口包含要代理类所实现的所有方法。
-  创建一个InvocationHandler接口的实现类，并实现其中的invoke()方法。
-  使用Proxy的静态方法newProxyInstance()创建动态代理类的实例。
-  通过动态代理类的实例调用接口中的方法，实际上会调用到InvocationHandler接口的实现类中的invoke()方法。

案例：
**动物接口**
```java
package com.mybatis.test;

/**
 * @description:  动物接口
 * @author: shu
 * @createDate: 2023/1/3 15:15
 * @version: 1.0
 */
public interface Animal {
    void makeSound();
}

```
**实现类**
```java
package com.mybatis.test;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/1/3 15:16
 * @version: 1.0
 */
public class Dog implements Animal{
    @Override
    public void makeSound() {
        System.out.println("汪汪汪");
    }
}

```
**代理接口**
```java
package com.mybatis.test;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/1/3 15:17
 * @version: 1.0
 */
public class AnimalInvocationHandler implements InvocationHandler {

    private Animal animal;

    public AnimalInvocationHandler(Animal animal) {
        this.animal = animal;
    }


    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("动态代理前的操作");
        Object result = method.invoke(animal, args);
        System.out.println("动态代理后的操作");
        return result;
    }
}

```
**测试**
```java
package com.mybatis.test;

import java.lang.reflect.Proxy;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/1/3 15:18
 * @version: 1.0
 */
public class AnimalProxy {
    public static void main(String[] args) {
        Animal dog = new Dog();
        Animal animalProxy = (Animal) Proxy.newProxyInstance(Animal.class.getClassLoader(), new Class[] { Animal.class }, new AnimalInvocationHandler(dog));
        animalProxy.makeSound();
    }
}

```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673514630195-d468be0f-0f10-4047-b2cf-59eb227e1a85.png#averageHue=%232c2c2c&clientId=ue04a2fa3-170d-4&from=paste&height=398&id=u402dde50&originHeight=498&originWidth=1891&originalType=binary&ratio=1&rotation=0&showTitle=false&size=56535&status=done&style=none&taskId=u4802096d-f890-45d9-b761-1369c4aa132&title=&width=1512.8)
# 二 DefaultSqlSession的解析
DefaultSqlSession 是 MyBatis 的一个默认实现类。它继承自 SqlSession 接口，并实现了 SqlSession 接口的所有方法。SqlSession 接口是 MyBatis 中的一个核心接口，用于执行映射的 SQL 语句，它的实例可以通过 SqlSessionFactory 的 openSession() 方法创建。
DefaultSqlSession 实现了 SqlSession 接口的所有方法，包括对数据库的增删改查、事务管理等功能。使用 DefaultSqlSession 可以方便地进行数据库操作，而无需直接使用 JDBC API。
**DefaultSqlSession**
```java
public class DefaultSqlSession implements SqlSession {
  // 配置信息，前面的流程解析的信息全部存储到Configuration中
  private final Configuration configuration;
  // 执行器，执行器，默认SimpleExecutor
  private final Executor executor;
  // 是否自动提交
  private final boolean autoCommit;
  // 缓存是否已经被污染
  private boolean dirty;
  // 游标列表
  private List<Cursor<?>> cursorList;

  // 构造方法
  public DefaultSqlSession(Configuration configuration, Executor executor, boolean autoCommit) {
    this.configuration = configuration;
    this.executor = executor;
    this.dirty = false;
    this.autoCommit = autoCommit;
  }

  public DefaultSqlSession(Configuration configuration, Executor executor) {
    this(configuration, executor, false);
  }
}
```

- 首先我们来看看session.getMapper（）方法，在前面对Mapper文件的解析中已经把代理接口注册到了knownMappers之中，现在我们只需要获取接口信息，交给MapperProxyFactory完成对接口的代理

**Configuration**
```java
  @Override
  public <T> T getMapper(Class<T> type) {
    return configuration.getMapper(type, this);
  }

  // mapper注册机中获取代理的对象
  public <T> T getMapper(Class<T> type, SqlSession sqlSession) {
    return mapperRegistry.getMapper(type, sqlSession);
  }


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

- 接下里这有个疑问？很明显是从knownMappers获取的对象信息，他是何时注册到系统中的呢？我们仔细看看Mapper文件的解析过程，对Sql文件的解析过程？

```java
  public void parse() {
    // 该节点是否被解析过
    if (!configuration.isResourceLoaded(resource)) {
      // 处理mapper节点
      configurationElement(parser.evalNode("/mapper"));
      // 加入到已经解析的列表，防止重复解析
      configuration.addLoadedResource(resource);
      // 将mapper注册给Configuration
      bindMapperForNamespace();
    }

    // 下面分别用来处理失败的<resultMap>、<cache-ref>、SQL语句
    parsePendingResultMaps();
    parsePendingCacheRefs();
    parsePendingStatements();
  }



private void bindMapperForNamespace() {
    // 获取映射文件的命名空间
    String namespace = builderAssistant.getCurrentNamespace();
    if (namespace != null) {
        Class<?> boundType = null;
        try {
            // 根据命名空间解析 mapper 类型
            boundType = Resources.classForName(namespace);
        } catch (ClassNotFoundException e) {
        }
        if (boundType != null) {
            // 检测当前 mapper 类是否被绑定过
            if (!configuration.hasMapper(boundType)) {
                configuration.addLoadedResource("namespace:" + namespace);
                // 绑定 mapper 类
                configuration.addMapper(boundType);
            }
        }
    }
}

// Configuration
public <T> void addMapper(Class<T> type) {
    // 通过 MapperRegistry 绑定 mapper 类
    mapperRegistry.addMapper(type);
}

// MapperRegistry
public <T> void addMapper(Class<T> type) {
    if (type.isInterface()) {
        if (hasMapper(type)) {
            throw new BindingException("Type " + type + " is already known to the MapperRegistry.");
        }
        boolean loadCompleted = false;
        try {
            /*
             * 将 type 和 MapperProxyFactory 进行绑定，MapperProxyFactory 可为 mapper 接口生成代理类
             */
            knownMappers.put(type, new MapperProxyFactory<T>(type));

            MapperAnnotationBuilder parser = new MapperAnnotationBuilder(config, type);
            // 解析注解中的信息
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

- 在解析Mapper.xml的最后阶段，获取到Mapper.xml的namespace，然后利用反射，获取到namespace的Class,并创建一个**MapperProxyFactory的实例，namespace的Class作为参数，最后将namespace的Class为key，MapperProxyFactory的实例为value存入knownMappers。**
- **了解到了MapperProxyFactory是如何来到，我们来看看他是如何实例化的？**

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
        /*
         * 创建 MapperProxy 对象，MapperProxy 实现了 InvocationHandler 接口，代理逻辑封装在此类中
         * 将sqlSession传入MapperProxy对象中，第二个参数是Mapper的接口，并不是其实现类
         */
    final MapperProxy<T> mapperProxy = new MapperProxy<>(sqlSession, mapperInterface, methodCache);
    return newInstance(mapperProxy);
  }

}

```

- 上面的代码首先创建了一个 MapperProxy 对象，该对象实现了 InvocationHandler 接口。然后将对象作为参数传给重载方法，并在重载方法中调用 JDK 动态代理接口为 Mapper接口 生成代理对象。
- 这里要注意一点，MapperProxy这个InvocationHandler 创建的时候，传入的参数并不是Mapper接口的实现类，我们以前是怎么创建JDK动态代理的？先创建一个接口，然后再创建一个接口的实现类，最后创建一个InvocationHandler并将实现类传入其中作为目标类，创建接口的代理类，然后调用代理类方法时会回调InvocationHandler的invoke方法，最后在invoke方法中调用目标类的方法，但是我们这里调用Mapper接口代理类的方法时，需要调用其实现类的方法吗？不需要，我们需要调用对应的配置文件的SQL，所以这里并不需要传入Mapper的实现类到MapperProxy中，那Mapper接口的代理对象是如何调用对应配置文件的SQL呢？下面我们来看看。
# 二 Mapper类动态执行方法
在上面创建了MapperProxy对象，当然我们来看看这个类？Mybatis MapperProxy是Mybatis框架中的一个类，它实现了接口Mapper，代表了一个映射器对象，用于与数据库交互，通常情况下，我们不会直接使用MapperProxy，而是在Mybatis配置文件中配置映射器接口的实现类，然后通过SqlSession来调用映射器的方法，MapperProxy使用了Java的动态代理技术，在调用映射器的方法时会自动生成SQL语句并执行，从而实现对数据库的访问。
**MapperProxy**
```java
public class MapperProxy<T> implements InvocationHandler, Serializable {

  private static final long serialVersionUID = -6424540398559729838L;
    // DefaultSqlSession
  private final SqlSession sqlSession;
    // mapper 接口
  private final Class<T> mapperInterface;
  // 该Map的键为方法，值为MapperMethod对象。通过该属性，完成了MapperProxy内（即映射接口内）方法和MapperMethod的绑定
  private final Map<Method, MapperMethod> methodCache;

  public MapperProxy(SqlSession sqlSession, Class<T> mapperInterface, Map<Method, MapperMethod> methodCache) {
    this.sqlSession = sqlSession;
    this.mapperInterface = mapperInterface;
    this.methodCache = methodCache;
  }


    // 真正的执行方法
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        // 如果方法是定义在 Object 类中的，则直接调用
        if (Object.class.equals(method.getDeclaringClass())) {
            try {
                return method.invoke(this, args);
            } catch (Throwable var5) {
                throw ExceptionUtil.unwrapThrowable(var5);
            }
        } else {
            // 从缓存中获取 MapperMethod 对象，若缓存未命中，则创建 MapperMethod 对象
            MapperMethod mapperMethod = this.cachedMapperMethod(method);
            // 调用 execute执行器 方法执行 SQL
            return mapperMethod.execute(this.sqlSession, args);
        }
    }

    // 缓存中
   private MapperMethod cachedMapperMethod(Method method) {
    return methodCache.computeIfAbsent(method, k -> new MapperMethod(mapperInterface, method, sqlSession.getConfiguration()));
  }

}
```

- Mybatis MapperProxy 的 invoke 方法是一个用来执行 SQL 语句的方法。它通过反射来调用接口中声明的方法，并将参数传递给 SQL 语句，然后执行该 SQL 语句并返回结果。 invoke 方法的作用是将接口方法的调用转化为对底层数据库的调用。

接下来我们来看看如何生成一个MapperMethod对象
**MapperMethod**
```java
public class MapperMethod {

  // 记录了sql的名称和类型
  private final SqlCommand command;
  // 对应的方法签名
  private final MethodSignature method;

  // 参数： 方法所在的接口、方法、Configuration

  /**
   * MapperMethod的构造方法
   * @param mapperInterface 映射接口
   * @param method 映射接口中的具体方法
   * @param config 配置信息Configuration
   */
  public MapperMethod(Class<?> mapperInterface, Method method, Configuration config) {
    this.command = new SqlCommand(config, mapperInterface, method);
    this.method = new MethodSignature(config, mapperInterface, method);
  }

}
```
# 三 SqlCommand的创建过程
MyBatis 的 SqlCommand 类是一个用于表示 SQL 语句的 Java 类。它用于封装 SQL 语句、设置参数值、以及执行该 SQL 语句的相关信息。
**SqlCommand**
```java
public static class SqlCommand {

    // SQL语句的名称
    private final String name;
    // SQL语句的种类，一共分为以下六种：增、删、改、查、清缓存、未知
    private final SqlCommandType type;

    public SqlCommand(Configuration configuration, Class<?> mapperInterface, Method method) {
      // 方法名称
      final String methodName = method.getName();
      // 方法所在的类。可能是mapperInterface，也可能是mapperInterface的子类
      final Class<?> declaringClass = method.getDeclaringClass();
      MappedStatement ms = resolveMappedStatement(mapperInterface, methodName, declaringClass,
          configuration);
      if (ms == null) {
        if (method.getAnnotation(Flush.class) != null) {
          name = null;
          type = SqlCommandType.FLUSH;
        } else {
          throw new BindingException("Invalid bound statement (not found): "
              + mapperInterface.getName() + "." + methodName);
        }
      } else {
        name = ms.getId();
        type = ms.getSqlCommandType();
        if (type == SqlCommandType.UNKNOWN) {
          throw new BindingException("Unknown execution method for: " + name);
        }
      }
    }

    public String getName() {
      return name;
    }

    public SqlCommandType getType() {
      return type;
    }

    /**
     * 找出指定接口指定方法对应的MappedStatement对象
     * @param mapperInterface 映射接口
     * @param methodName 映射接口中具体操作方法名
     * @param declaringClass 操作方法所在的类。一般是映射接口本身，也可能是映射接口的子类
     * @param configuration 配置信息
     * @return MappedStatement对象
     */
    private MappedStatement resolveMappedStatement(Class<?> mapperInterface, String methodName,
        Class<?> declaringClass, Configuration configuration) {
      // 数据库操作语句的编号是：接口名.方法名
      String statementId = mapperInterface.getName() + "." + methodName;
      // configuration保存了解析后的所有操作语句，去查找该语句
      if (configuration.hasStatement(statementId)) {
        // 从configuration中找到了对应的语句，返回
        return configuration.getMappedStatement(statementId);
      } else if (mapperInterface.equals(declaringClass)) {
        // 说明递归调用已经到终点，但是仍然没有找到匹配的结果
        return null;
      }
      // 从方法的定义类开始，沿着父类向上寻找。找到接口类时停止
      for (Class<?> superInterface : mapperInterface.getInterfaces()) {
        if (declaringClass.isAssignableFrom(superInterface)) {
          MappedStatement ms = resolveMappedStatement(superInterface, methodName,
              declaringClass, configuration);
          if (ms != null) {
            return ms;
          }
        }
      }
      return null;
    }
  }
```
通过拼接接口名和方法名，在configuration获取对应的MappedStatement，并设置设置 name 和 type 变量，那从configuration中通过id获取MappedStatement是如何注册进configuration中的，答案其实很简单
就是在就.xml文件进行解析是就已经注册进来。
```java
	// 处理各个数据库操作语句
      buildStatementFromContext(context.evalNodes("select|insert|update|delete"));

```
# 四 MethodSignature的创建过程
**MethodSignature**
```java
 public static class MethodSignature {

    // 返回类型是否为集合类型
    private final boolean returnsMany;
    // 返回类型是否是map
    private final boolean returnsMap;
    // 返回类型是否是空
    private final boolean returnsVoid;
    // 返回类型是否是cursor类型
    private final boolean returnsCursor;
    // 返回类型是否是optional类型
    private final boolean returnsOptional;
    // 返回类型
    private final Class<?> returnType;
    // 如果返回为map,这里记录所有的map的key
    private final String mapKey;
    // resultHandler参数的位置
    private final Integer resultHandlerIndex;
    // rowBounds参数的位置
    private final Integer rowBoundsIndex;
    // 引用参数名称解析器
    private final ParamNameResolver paramNameResolver;


    public MethodSignature(Configuration configuration, Class<?> mapperInterface, Method method) {
        // 通过反射获取方法返回类型
      Type resolvedReturnType = TypeParameterResolver.resolveReturnType(method, mapperInterface);
      if (resolvedReturnType instanceof Class<?>) {
        this.returnType = (Class<?>) resolvedReturnType;
      } else if (resolvedReturnType instanceof ParameterizedType) {
        this.returnType = (Class<?>) ((ParameterizedType) resolvedReturnType).getRawType();
      } else {
        this.returnType = method.getReturnType();
      }
      this.returnsVoid = void.class.equals(this.returnType);
       // 检测返回值类型是否是 void、集合或数组、Cursor、Map 等
      this.returnsMany = configuration.getObjectFactory().isCollection(this.returnType) || this.returnType.isArray();
      this.returnsCursor = Cursor.class.equals(this.returnType);
      this.returnsOptional = Optional.class.equals(this.returnType);
        // 解析 @MapKey 注解，获取注解内容
        this.mapKey = getMapKey(method);
        this.returnsMap = this.mapKey != null;
        /*
         * 获取 RowBounds 参数在参数列表中的位置，如果参数列表中
         * 包含多个 RowBounds 参数，此方法会抛出异常
         */
        this.rowBoundsIndex = getUniqueParamIndex(method, RowBounds.class);
        // 获取 ResultHandler 参数在参数列表中的位置
        this.resultHandlerIndex = getUniqueParamIndex(method, ResultHandler.class);
        // 解析参数列表
        this.paramNameResolver = new ParamNameResolver(configuration, method);
    }


  }
```
# 五 MapperMethod的execute方法
上面SqlCommand与MethodSignature初始化完毕就来到了真正的代理环节
**MapperMethod**
```java
/**
   * 执行映射接口中的方法
   * @param sqlSession sqlSession接口的实例，通过它可以进行数据库的操作
   * @param args 执行接口方法时传入的参数
   * @return 数据库操作结果
   */
  public Object execute(SqlSession sqlSession, Object[] args) {
    Object result;
    switch (command.getType()) { // 根据SQL语句类型，执行不同操作
      case INSERT: { // 如果是插入语句
        // 将参数顺序与实参对应好
        Object param = method.convertArgsToSqlCommandParam(args);
        // 执行操作并返回结果
        result = rowCountResult(sqlSession.insert(command.getName(), param));
        break;
      }
      case UPDATE: { // 如果是更新语句
        // 将参数顺序与实参对应好
        Object param = method.convertArgsToSqlCommandParam(args);
        // 执行操作并返回结果
        result = rowCountResult(sqlSession.update(command.getName(), param));
        break;
      }
      case DELETE: { // 如果是删除语句MappedStatement
        // 将参数顺序与实参对应好
        Object param = method.convertArgsToSqlCommandParam(args);
        // 执行操作并返回结果
        result = rowCountResult(sqlSession.delete(command.getName(), param));
        break;
      }
      case SELECT: // 如果是查询语句
        if (method.returnsVoid() && method.hasResultHandler()) { // 方法返回值为void，且有结果处理器
          // 使用结果处理器执行查询
          executeWithResultHandler(sqlSession, args);
          result = null;
        } else if (method.returnsMany()) { // 多条结果查询
          result = executeForMany(sqlSession, args);
        } else if (method.returnsMap()) { // Map结果查询
          result = executeForMap(sqlSession, args);
        } else if (method.returnsCursor()) { // 游标类型结果查询
          result = executeForCursor(sqlSession, args);
        } else { // 单条结果查询
          Object param = method.convertArgsToSqlCommandParam(args);
          result = sqlSession.selectOne(command.getName(), param);
          if (method.returnsOptional()
              && (result == null || !method.getReturnType().equals(result.getClass()))) {
            result = Optional.ofNullable(result);
          }
        }
        break;
      case FLUSH: // 清空缓存语句
        result = sqlSession.flushStatements();
        break;
      default: // 未知语句类型，抛出异常
        throw new BindingException("Unknown execution method for: " + command.getName());
    }
    if (result == null && method.getReturnType().isPrimitive() && !method.returnsVoid()) {
      // 查询结果为null,但返回类型为基本类型。因此返回变量无法接收查询结果，抛出异常。
      throw new BindingException("Mapper method '" + command.getName()
          + " attempted to return null from a method with a primitive return type (" + method.getReturnType() + ").");
    }
    return result;
  }
```
MapperMethod的execute方法是一个用来执行映射操作的方法，它的作用是将输入的参数映射到对应的方法上，然后执行相应的操作，通常情况下，MapperMethod类会被用在Mybatis框架中，用来将SQL语句映射到相应的Java方法上。越来越接近真相，具体的执行流程我们后面来看。
总结：
![Mapper-Proxy.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673759455829-80522bb4-f45c-4adf-bc9d-ec63cb7c04ff.png#averageHue=%23fafafa&clientId=u5a4c7710-2c74-4&from=paste&height=195&id=ub0b62fce&originHeight=244&originWidth=2119&originalType=binary&ratio=1&rotation=0&showTitle=false&size=38736&status=done&style=none&taskId=u172ad8ff-77f1-4dbb-9130-a82cc030591&title=&width=1695.2)

1. 首先我前面已经获取到了SqlSessionFactory对象，他的默认实现实DefaultSqlSession
2. 调用DefaultSqlSession#getMapper（）方法获取真正的接口信息
3. DefaultSqlSession在配置文件中寻找MapperRegistry我们已经注册的接口信息
4. MapperRegistry通过动态代理的模式返回接口信息
5. MapperProxyFactory调用newInstance方法生成真正的代理接口对象返回
