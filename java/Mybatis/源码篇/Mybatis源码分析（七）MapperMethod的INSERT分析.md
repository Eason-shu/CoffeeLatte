---
title: Mybatis源码分析（七）MapperMethod的INSERT分析
sidebar_position: 9
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



![P2190002.JPG](https://cdn.nlark.com/yuque/0/2023/jpeg/12426173/1676960910066-8b314190-2c2d-4bbf-ad88-9cae908e10c5.jpeg#averageHue=%23565b55&clientId=u66f0f9fe-36fd-4&from=ui&id=ue34fa98a&originHeight=3888&originWidth=5184&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=8884646&status=done&style=none&taskId=u9fcec202-ac99-4f67-bab2-2f4347128aa&title=)


- 官网：[mybatis – MyBatis 3 | 简介](https://mybatis.org/mybatis-3/zh/index.html)

上一篇文章我们介绍了Mapper的接口代理，这篇文章我们来介绍一下具体的执行过程？动态代理过程的执行方法invoke（），拿到了具体的执行对象MapperMethod，下面我们来看看具体的执行过程？

---

> 学习到的知识

:::info

1. 我们传入的参数的转换成Sql命令参数对应
2. 执行器的类别，不同执行器的作用
3. 不同StatementHandler的作用
4. 不同SqlSource的作用
5. 设计模式：装饰器模式
:::
> 过程梳理

:::warning

1. 我们通过对MapperProxy的invoke方法，拿到真正的代理接口对象MapperMethod
2. 接着调用MapperMethod的execute方法，根据Sql命令的不同类型执行不同的代码
3. 首先我们来看看Insert类型的执行过程，[]args 是我们传递的参数
4. 第一步进行参数的转换，如果只有一个参数，直接返回参数，如果有多个参数，则进行与之前解析出的参数名称进行对应，返回对应关系
5. 接着调用session的insert方法，实际上调用了update方法，先通过id获取到我们解析好的MappedStatement，比如com.shu.UserMapper.insert
6. 注意MappedStatement的解析在对Sqlsession的初始化时就已经完成了
7. 接着交给执行器去执行真正的语句，在对SqlSession的创建过程我们就已经知道了默认执行器是SimpleExecutor，但是这里使用装饰器模式进行增强就是CachingExecutor类
8. 请注意在默认的语句类型是PREPARED因此创建是PreparedStatementHandler
9. 接下来调用prepareStatement方法（）预处理语句，这里与执行器一样采用装饰器模式对原有类进行增强
10. 获取数据库连接Connection，调用Prepare从Connection中创建一个Statement
11. 下面调用具体的执行器来实例化语句，首先获取BoundSql，根据不同的SqlSource
12. 最后拿到了Statement交给处理器，绑定实参，去执行获取结果
:::

---


---

**MapperMethod**
```java
  @Override
  public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    try {
      // 继承自Object的方法
      if (Object.class.equals(method.getDeclaringClass())) {
        // 直接执行原有方法
        return method.invoke(this, args);
      } else if (method.isDefault()) { // 默认方法
        // 执行默认方法
       return cachedInvoker(method).invoke(proxy, method, args, sqlSession);
      }
    } catch (Throwable t) {
      throw ExceptionUtil.unwrapThrowable(t);
    }
  }


private MapperMethodInvoker cachedInvoker(Method method) throws Throwable {
    try {
      return MapUtil.computeIfAbsent(methodCache, method, m -> {
          // 默认方法调用
        if (m.isDefault()) {
          try {
            if (privateLookupInMethod == null) {
              return new DefaultMethodInvoker(getMethodHandleJava8(method));
            } else {
              return new DefaultMethodInvoker(getMethodHandleJava9(method));
            }
          } catch (IllegalAccessException | InstantiationException | InvocationTargetException
              | NoSuchMethodException e) {
            throw new RuntimeException(e);
          }
        }
        // 普通方法调用
        else {
          return new PlainMethodInvoker(new MapperMethod(mapperInterface, method, sqlSession.getConfiguration()));
        }
      });
    } catch (RuntimeException re) {
      Throwable cause = re.getCause();
      throw cause == null ? re : cause;
    }
  }

```
MapperMethodInvoker的接口实现：DefaultMethodInvoker与PlainMethodInvoker
**PlainMethodInvoker**
```java
private static class PlainMethodInvoker implements MapperMethodInvoker {
    private final MapperMethod mapperMethod;

    public PlainMethodInvoker(MapperMethod mapperMethod) {
      super();
      this.mapperMethod = mapperMethod;
    }

    // 调用方法
    @Override
    public Object invoke(Object proxy, Method method, Object[] args, SqlSession sqlSession) throws Throwable {
      return mapperMethod.execute(sqlSession, args);
    }
  }
```
接着调用具体的执行方法，execute方法，我们具体里看看他的执行过程
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
下面我们具体来分析一下执行流程？
# 一 INSERT 语句
这里我们以insert语句开头，更新，删除都差不多，查询下一篇文章我们详细介绍
**MapperMethod**
```java
     // 如果是插入语句
	case INSERT: {
        // 将参数顺序与实参对应好
        Object param = method.convertArgsToSqlCommandParam(args);
        // 执行操作并返回结果
        result = rowCountResult(sqlSession.insert(command.getName(), param));
        break;
      }

```

1. 第一步将参数顺序与实参对应好
2. 交给Sqlsession执行返回结果

我们来看看他是如何转换参数的？首先看看ParamNameResolver对象
**ParamNameResolver**
```java
   //<li>aMethod(@Param("M") int a, @Param("N") int b) -&gt; {{0, "M"}, {1, "N"}}</li>
   //<li>aMethod(int a, int b) -&gt; {{0, "0"}, {1, "1"}}</li>
   //aMethod(int a, RowBounds rb, int b) -&gt; {{0, "0"}, {2, "1"}}</li>
  // 方法入参的参数次序表。键为参数次序，值为参数名称或者参数@Param注解的值
  private final SortedMap<Integer, String> names;
  // 该方法入参中是否含有@Param注解
  private boolean hasParamAnnotation;


  /**
   * 参数名解析器的构造方法
   * @param config 配置信息
   * @param method 要被分析的方法
   */
  public ParamNameResolver(Configuration config, Method method) {
    // 获取参数类型列表
    final Class<?>[] paramTypes = method.getParameterTypes();
    // 准备存取所有参数的注解，是二维数组
    final Annotation[][] paramAnnotations = method.getParameterAnnotations();
    final SortedMap<Integer, String> map = new TreeMap<>();
    int paramCount = paramAnnotations.length;
    // 循环处理各个参数
    for (int paramIndex = 0; paramIndex < paramCount; paramIndex++) {
      if (isSpecialParameter(paramTypes[paramIndex])) {
        // 跳过特别的参数
        continue;
      }
      // 参数名称
      String name = null;
      for (Annotation annotation : paramAnnotations[paramIndex]) {
        // 找出参数的注解
        if (annotation instanceof Param) {
          // 如果注解是Param
          hasParamAnnotation = true;
          // 那就以Param中值作为参数名
          name = ((Param) annotation).value();
          break;
        }
      }

      if (name == null) {
        // 否则，保留参数的原有名称
        if (config.isUseActualParamName()) {
          name = getActualParamName(method, paramIndex);
        }
        if (name == null) {
          // 参数名称取不到，则按照参数index命名
          name = String.valueOf(map.size());
        }
      }
      map.put(paramIndex, name);
    }
    names = Collections.unmodifiableSortedMap(map);
  }
```
我们可以看到经过ParamNameResolver的构造器对参数进行解析：比如：aMethod(@Param("M") int a, @Param("N") int b) -&gt; {{0, "M"}, {1, "N"}} 解析好放入name中

测试代码
```java
    @Test
    public void InsertTest(){
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
            // 组建查询参数
            User userParam = new User();
            userParam.setSchoolname("Sunny School");
            // 调用接口展开数据库操作
            int insert = userMapper.insert(userParam);
            System.out.println(insert);
        }
    }
```
## 1.1 参数的对应解析convertArgsToSqlCommandParam

1. 打上断点，调试一手，我们可以看到首先判断SqlCommand的类型是INSERT
2. 通过convertArgsToSqlCommandParam方法转换参数，下面我们来看看具体的convertArgsToSqlCommandParam的方法，这就需要ParamNameResolver的方法来帮助解析

**ParamNameResolver**
```java


// 获取参数
public Object getNamedParams(Object[] args) {

    final int paramCount = names.size();

    if (args == null || paramCount == 0) {
      return null;
    }
     // 不是注解且参数个数为1 aMethod(@Param("M") int a, @Param("N") int b) -> {{0, "M"}, {1, "N"}}
    else if (!hasParamAnnotation && paramCount == 1) {
      // 就返回第一个值
      Object value = args[names.firstKey()];
      //  判断是否需要返回集合类型
      return wrapToMapIfCollection(value, useActualParamName ? names.get(0) : null);
    }
    // 注解的方式
    else {
      final Map<String, Object> param = new ParamMap<>();
      int i = 0;
      for (Map.Entry<Integer, String> entry : names.entrySet()) {
        param.put(entry.getValue(), args[entry.getKey()]);
        // add generic param names (param1, param2, ...)
        final String genericParamName = GENERIC_NAME_PREFIX + (i + 1);
        // ensure not to overwrite parameter named with @Param
        if (!names.containsValue(genericParamName)) {
          param.put(genericParamName, args[entry.getKey()]);
        }
        i++;
      }
      return param;
    }
  }
```
我们可以看到通过convertArgsToSqlCommandParam的调用，参数完成了对应的转换
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1672797252342-3ddd02b2-4255-47bb-9f1d-ad812b02c328.png#averageHue=%234b584c&clientId=u01b8983c-a151-4&from=paste&height=548&id=u3ae07682&originHeight=685&originWidth=1855&originalType=binary&ratio=1&rotation=0&showTitle=false&size=210335&status=done&style=none&taskId=u909af562-4ab9-4ae1-bc7e-9900dfc4e81&title=&width=1484)
注意这注解方式传递的参数转换有点不一样
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673767038811-0c504f92-a413-43d3-a1bc-8d46ac5fa862.png#averageHue=%23597264&clientId=u13b392e5-bccf-4&from=paste&height=694&id=u625558c8&originHeight=868&originWidth=1879&originalType=binary&ratio=1&rotation=0&showTitle=false&size=193517&status=done&style=none&taskId=u7e338333-7a6f-455c-8a76-153265bf8c4&title=&width=1503.2)
## 1.2 ID获取对应的MappedStatement
经过上面的处理我们完成了对参数的转换，下面交给Sqlseeeion 具体执行

1. 下面的步骤，通过id获取到我们解析好的Sql语句，比如com.shu.UserMapper.insert
2. 交给相应的执行器，执行sql语句

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673244020863-6ed1d8b1-32ff-4ae1-83ae-0ced3dc056b9.png#averageHue=%23312d2c&clientId=ud7b9ac62-abc7-4&from=paste&height=172&id=u9dce930b&originHeight=215&originWidth=1380&originalType=binary&ratio=1&rotation=0&showTitle=false&size=47032&status=done&style=none&taskId=ua5b96ffb-aeb1-4048-b2e4-51b1175283c&title=&width=1104)
**DefaultSqlSession**
```java
// 执行语句的插入
@Override
  public int insert(String statement, Object parameter) {
    return update(statement, parameter);
  }
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1672797581570-884f9119-3d82-4beb-9011-ca4279011c66.png#averageHue=%234b584b&clientId=u01b8983c-a151-4&from=paste&height=602&id=u5cbc90fb&originHeight=752&originWidth=1906&originalType=binary&ratio=1&rotation=0&showTitle=false&size=181429&status=done&style=none&taskId=u09f9257e-5047-4ad6-8570-9644ca42069&title=&width=1524.8)
具体的执行，通过id获取具体的MappedStatement
**DefaultSqlSession**
```java
@Override
  public int update(String statement, Object parameter) {
    try {
        // 是否缓存过了
      dirty = true;
        // 通过id获取执行的sql语句
      MappedStatement ms = configuration.getMappedStatement(statement);
        // 把具体的执行sql与参数交给执行器执行返回执行结果
      return executor.update(ms, wrapCollection(parameter));
    } catch (Exception e) {
      throw ExceptionFactory.wrapException("Error updating database.  Cause: " + e, e);
    } finally {
      ErrorContext.instance().reset();
    }
  }
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1672797721855-bfbdfdd1-1b74-44ef-9e41-25cc1612027e.png#averageHue=%233d4245&clientId=u01b8983c-a151-4&from=paste&height=652&id=u0613d228&originHeight=815&originWidth=1811&originalType=binary&ratio=1&rotation=0&showTitle=false&size=211592&status=done&style=none&taskId=ubb010d15-19f7-4372-8adb-14631c8b98f&title=&width=1448.8)

- 通过id获取需要执行的Sql语句以及配置信息，MappedStatement的构建参考前面的解析。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1672798740871-11a077eb-9794-4b37-9afe-b9365dc1ed66.png#averageHue=%234c584c&clientId=u01b8983c-a151-4&from=paste&height=510&id=ud8932b47&originHeight=638&originWidth=1855&originalType=binary&ratio=1&rotation=0&showTitle=false&size=160828&status=done&style=none&taskId=u456051ee-ebc2-474c-bb21-f3db6fdc1ab&title=&width=1484)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1672798834482-7b2e6810-3345-4ea1-ba43-f9c931c51502.png#averageHue=%234c5453&clientId=u01b8983c-a151-4&from=paste&height=683&id=ub64f116e&originHeight=854&originWidth=1892&originalType=binary&ratio=1&rotation=0&showTitle=false&size=254765&status=done&style=none&taskId=u9f2f2393-fd3b-4c56-99bf-6e03e045e0b&title=&width=1513.6)
## 1.3 MappedStatement交给执行器执行

1. 在上面，我们通过id获取到了configuration中具体的MappedStatement
2. 下面我们交给具体的执行器负责处理对应的SQL语句，而Executor采用模板模式进行设计

首先我们来看看执行器
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673245222178-195c0250-fa3a-4921-bd8d-87ab7a78d96d.png#averageHue=%232d2d2d&clientId=u89a27390-41fa-4&from=paste&height=463&id=ua07a3c53&originHeight=579&originWidth=1354&originalType=binary&ratio=1&rotation=0&showTitle=false&size=27676&status=done&style=none&taskId=ud0545369-6b5b-49b7-b600-b57d8a93b99&title=&width=1083.2)

- ExecutorType.SIMPLE（**默认执行器**）

可以返回自增键，只需要在mapper文件中，增加属性： useGeneratedKeys="true" keyProperty="productId"，那么自增键会在事务提交后，自动设置到传入的 user对象中
这个类型不做特殊的事情，它只为每个语句创建一个PreparedStatement。

- ExecutorType.REUSE

这种类型将重复使用PreparedStatements。

- ExecutorType.BATCH

这个类型批量更新，且必要地区别开其中的select 语句，确保动作易于理解。
// 在我们这默认使用CachingExecutor

- 更新数据库数据，INSERT/UPDATE/DELETE三种操作都会调用该方法

执行器的创建在调用SqlSessionFactory#openSession（）方法是创建，可以看看前面的文章，利用装饰器模式（CachingExecutor）原来的执行器进行增强
**SqlSession**
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

- 因为在执行器的创建过程中利用装饰器模式对原来的执行器进行增加，因此我们首先看看CachingExecutor

**CachingExecutor**
```java
  // 事务缓存管理器
  private final TransactionalCacheManager tcm = new TransactionalCacheManager();

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


  /**
   * 根据要求判断语句执行前是否要清除二级缓存，如果需要，清除二级缓存
   * 注意：默认情况下，非SELECT语句的isFlushCacheRequired方法会返回true
   * @param ms MappedStatement
   */
  private void flushCacheIfRequired(MappedStatement ms) {
    // 获取MappedStatement对应的缓存
    Cache cache = ms.getCache();
    if (cache != null && ms.isFlushCacheRequired()) { // 存在缓存且该操作语句要求执行前清除缓存
      // 清除事务中的缓存
      tcm.clear(cache);
    }
  }
```
这里设涉及到一二级缓存，我们后面详细介绍，先跳过。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1672799194462-de141a47-1a0b-4b3d-aa92-b4f80b694d05.png#averageHue=%234b5a4c&clientId=u01b8983c-a151-4&from=paste&height=713&id=u46db1931&originHeight=891&originWidth=1848&originalType=binary&ratio=1&rotation=0&showTitle=false&size=229586&status=done&style=none&taskId=uc4bbbd61-4e0d-432c-bd58-a2a89a27965&title=&width=1478.4)

- 更新数据库数据，INSERT/UPDATE/DELETE三种操作都会调用该方法

**BaseExecutor**
```java
/**
   * 更新数据库数据，INSERT/UPDATE/DELETE三种操作都会调用该方法
   * @param ms 映射语句
   * @param parameter 参数对象
   * @return 数据库操作结果
   * @throws SQLException
   */
  @Override
  public int update(MappedStatement ms, Object parameter) throws SQLException {
    ErrorContext.instance().resource(ms.getResource())
            .activity("executing an update").object(ms.getId());
    if (closed) {
      // 执行器已经关闭
      throw new ExecutorException("Executor was closed.");
    }
    // 清理本地缓存
    clearLocalCache();
    // 返回调用子类进行操作
    return doUpdate(ms, parameter);
  }
```
默认的执行器是SimpleExecutor
```java
// 调用SimpleExecutor的方法
@Override
  public int doUpdate(MappedStatement ms, Object parameter) throws SQLException {
    Statement stmt = null;
    try {
        // 获取配置文件
      Configuration configuration = ms.getConfiguration();
        // 处理器
      StatementHandler handler = configuration.newStatementHandler(this, ms, parameter, RowBounds.DEFAULT, null, null);
      stmt = prepareStatement(handler, ms.getStatementLog());
      return handler.update(stmt);
    } finally {
      closeStatement(stmt);
    }
  }

```
## 1.4 不同的执行器获取不同的StatementHandler
StatementHandler 是四大组件中最重要的一个对象，负责操作 Statement 对象与数据库进行交流

- 首先我们来看看StatementHandler接口

**StatementHandler**
```java
// 从Connection中创建一个Statement
  Statement prepare(Connection connection, Integer transactionTimeout)
      throws SQLException;

  // 为Statement绑定实参
  void parameterize(Statement statement)
      throws SQLException;

  // 批量执行操作
  void batch(Statement statement)
      throws SQLException;

  // 执行增、删、改操作
  int update(Statement statement)
      throws SQLException;

  // 执行查找操作，返回list
  <E> List<E> query(Statement statement, ResultHandler resultHandler)
      throws SQLException;

  // 执行查询操作，返回迭代游标
  <E> Cursor<E> queryCursor(Statement statement)
      throws SQLException;

  // 获取BoundSql对象
  BoundSql getBoundSql();

  // 获取参数处理器
  ParameterHandler getParameterHandler();
```

- 对应是实现类

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673245823223-2bc43d1b-521f-4f20-aebb-3410b8edfeb8.png#averageHue=%232e2d2d&clientId=u89a27390-41fa-4&from=paste&height=458&id=u7761cf57&originHeight=573&originWidth=1247&originalType=binary&ratio=1&rotation=0&showTitle=false&size=23512&status=done&style=none&taskId=uc25dcfeb-da69-4c95-a808-6b14f13826a&title=&width=997.6)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1672799650602-c193adc9-4fcd-416f-a624-d40200a3a482.png#averageHue=%234c5c4d&clientId=u01b8983c-a151-4&from=paste&height=710&id=i42Qz&originHeight=887&originWidth=1902&originalType=binary&ratio=1&rotation=0&showTitle=false&size=258031&status=done&style=none&taskId=u388b9d7a-d5c0-4511-904b-57d26163e90&title=&width=1521.6)

- RoutingStatementHandler: RoutingStatementHandler 并没有对 Statement 对象进行使用，只是根据StatementType 来创建一个代理，代理的就是对应Handler的三种实现类。在MyBatis工作时,使用的StatementHandler 接口对象实际上就是 RoutingStatementHandler 对象。
- BaseStatementHandler: 是 StatementHandler 接口的另一个实现类.本身是一个抽象类.用于简化StatementHandler 接口实现的难度,属于适配器设计模式体现，它主要有三个实现类
- SimpleStatementHandler: 管理 Statement 对象并向数据库中推送不需要预编译的SQL语句。
- PreparedStatementHandler: 管理 Statement 对象并向数据中推送需要预编译的SQL语句。
- CallableStatementHandler：管理 Statement 对象并调用数据库中的存储过程。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673245670094-3b4c1407-60ff-441e-807a-e6424f0f4f59.png#averageHue=%23525044&clientId=u89a27390-41fa-4&from=paste&height=342&id=u64648260&originHeight=427&originWidth=1759&originalType=binary&ratio=1&rotation=0&showTitle=false&size=121813&status=done&style=none&taskId=u15329cd5-c1cc-4e94-a9b4-021e050c326&title=&width=1407.2)
**RoutingStatementHandler**
```java

  // 根据语句类型选取出的被代理类的对象
  private final StatementHandler delegate;

  public RoutingStatementHandler(Executor executor, MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) {
    // 根据语句类型选择被代理对象
    switch (ms.getStatementType()) {
      case STATEMENT:
        delegate = new SimpleStatementHandler(executor, ms, parameter, rowBounds, resultHandler, boundSql);
        break;
      case PREPARED:
        delegate = new PreparedStatementHandler(executor, ms, parameter, rowBounds, resultHandler, boundSql);
        break;
      case CALLABLE:
        delegate = new CallableStatementHandler(executor, ms, parameter, rowBounds, resultHandler, boundSql);
        break;
      default:
        throw new ExecutorException("Unknown statement type: " + ms.getStatementType());
    }
  }
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673768629521-2071beb2-f5c0-4c1d-a139-764750b78603.png#averageHue=%232e2c2b&clientId=u13b392e5-bccf-4&from=paste&height=496&id=u1ad6d656&originHeight=620&originWidth=1324&originalType=binary&ratio=1&rotation=0&showTitle=false&size=153099&status=done&style=none&taskId=u2c6c06c6-552b-4928-821a-97112e4f2bd&title=&width=1059.2)
这里我们可以看到statementType为PREPARED类型，为PreparedStatementHandler，但是他调用父类的方法，因此我们看看BaseStatementHandler
**BaseStatementHandler**
```java
/**
 * 主要定义了从Connection中获取Statement的方法，而对于具体的Statement操作则未定义
 */
public abstract class BaseStatementHandler implements StatementHandler {
  // 配置文件
  protected final Configuration configuration;
  // 对象工厂
  protected final ObjectFactory objectFactory;
  // 类型注册机
  protected final TypeHandlerRegistry typeHandlerRegistry;
  // 结果处理器
  protected final ResultSetHandler resultSetHandler;
  // 参数处理器
  protected final ParameterHandler parameterHandler;
  // 执行器
  protected final Executor executor;
  // 隐射语句
  protected final MappedStatement mappedStatement;
  // 行范围
  protected final RowBounds rowBounds;
  // 绑定的sql
  protected BoundSql boundSql;
}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1672801059054-7c5edc22-6b1f-48e9-9896-e3480acba610.png#averageHue=%233d4247&clientId=u01b8983c-a151-4&from=paste&height=606&id=ueedb8fed&originHeight=757&originWidth=1887&originalType=binary&ratio=1&rotation=0&showTitle=false&size=180588&status=done&style=none&taskId=u253ee22e-7155-4cfe-86c7-36bb7276829&title=&width=1509.6)

- 再来看看他的构造器方法

**BaseStatementHandler**
```java
  protected BaseStatementHandler(Executor executor, MappedStatement mappedStatement, Object parameterObject, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) {
    // 配置文件
    this.configuration = mappedStatement.getConfiguration();
    // 执行器
    this.executor = executor;
     // 隐射语句
    this.mappedStatement = mappedStatement;
    this.rowBounds = rowBounds;
	// 类型处理器
    this.typeHandlerRegistry = configuration.getTypeHandlerRegistry();
     // 对象工厂
    this.objectFactory = configuration.getObjectFactory();
	// 在执行是前面传入为null
    if (boundSql == null) { // issue #435, get the key before calculating the statement
      // 如果是前置主键自增，则在这里进行获得自增的键值
      generateKeys(parameterObject);
      // 获取BoundSql对象
      boundSql = mappedStatement.getBoundSql(parameterObject);
    }
	// 需要绑定的sql
    this.boundSql = boundSql;
     // 参数处理器
    this.parameterHandler = configuration.newParameterHandler(mappedStatement, parameterObject, boundSql);
      // 结果处理器
    this.resultSetHandler = configuration.newResultSetHandler(executor, mappedStatement, rowBounds, parameterHandler, resultHandler, boundSql);
  }
```

- 在他的构造器中我们需要关注到两个方法generateKeys(parameterObject)方法，mappedStatement.getBoundSql(parameterObject)方法，首先让我们来看看generateKeys（）方法

**BaseStatementHandler**
```java
 // 前置自增主键的生成
  protected void generateKeys(Object parameter) {
      // 从隐射语句中获取KeyGenerator
    KeyGenerator keyGenerator = mappedStatement.getKeyGenerator();
    ErrorContext.instance().store();
    keyGenerator.processBefore(executor, mappedStatement, null, parameter);
    ErrorContext.instance().recall();
  }


```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1672801683013-93e9c6a0-9b65-4107-8efc-74f0428c4bc6.png#averageHue=%2363756b&clientId=u01b8983c-a151-4&from=paste&height=617&id=u5635e0aa&originHeight=771&originWidth=1889&originalType=binary&ratio=1&rotation=0&showTitle=false&size=204297&status=done&style=none&taskId=ud89ce6f1-d683-45e0-8381-6aeb027dac4&title=&width=1511.2)

- 我们可以看到用于实现数据插入时主键自增的主键编号生成器有三种实现，而决定用那种在于MappedStatement的Builder方法中

**MappedStatement**
```java
      // 全局启用主键生成且是插入语句，则设置主键生成器
      mappedStatement.keyGenerator = configuration.isUseGeneratedKeys() && SqlCommandType.INSERT.equals(sqlCommandType) ? Jdbc3KeyGenerator.INSTANCE : NoKeyGenerator.INSTANCE;
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1672801819830-90a46ba9-2e81-409e-9b13-5599bd9e9a82.png#averageHue=%23554f44&clientId=u01b8983c-a151-4&from=paste&height=314&id=ucc9b7901&originHeight=392&originWidth=1433&originalType=binary&ratio=1&rotation=0&showTitle=false&size=57720&status=done&style=none&taskId=uba54b0f2-7f2a-4f77-ba1f-04e39c7a4e8&title=&width=1146.4)
## 1.5 根据参数获取BoundSql
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673246691859-3b304fac-9372-4ad1-ac0d-8e6906eb5603.png#averageHue=%232c2c2c&clientId=u89a27390-41fa-4&from=paste&height=344&id=u8717085c&originHeight=430&originWidth=1286&originalType=binary&ratio=1&rotation=0&showTitle=false&size=13702&status=done&style=none&taskId=u7fff54cb-fd15-4024-8837-5f699594c63&title=&width=1028.8)

1. DynamicSqlSource：针对动态 SQL 和 ${} 占位符的 SQL
2. RawSqlSource：针对 #{}占位符的 SQL
3. ProviderSqlSource：针对 @*Provider 注解 提供的 SQL
4. StaticSqlSource：仅包含有 ?占位符的 SQL
- 下面我们来看看getBoundSql的方法，获取一个BoundSql对象

**MappedStatement**
```java
  //SQL源码，对应于我们所写在配置文件中的SQL语句。包含占位符，无法直接执行。可以展开分析就是分行的sql语句text。
private SqlSource sqlSource;


public BoundSql getBoundSql(Object parameterObject) {
    // 获取绑定的sql
    BoundSql boundSql = sqlSource.getBoundSql(parameterObject);
	// 获取参数隐射
    List<ParameterMapping> parameterMappings = boundSql.getParameterMappings();
	// 判断是否为空或为null
    if (parameterMappings == null || parameterMappings.isEmpty()) {
      boundSql = new BoundSql(configuration, boundSql.getSql(), parameterMap.getParameterMappings(), parameterObject);
    }
    // check for nested result maps in parameter mappings (issue #30)
    for (ParameterMapping pm : boundSql.getParameterMappings()) {
      String rmId = pm.getResultMapId();
      if (rmId != null) {
        ResultMap rm = configuration.getResultMap(rmId);
        if (rm != null) {
          hasNestedResultMaps |= rm.hasNestedResultMaps();
        }
      }
    }

    return boundSql;
  }
```

```java
/**
   * 组建一个BoundSql对象
   * @param parameterObject 参数对象
   * @return 组件的BoundSql对象
   */
  @Override
  public BoundSql getBoundSql(Object parameterObject) {
    return new BoundSql(configuration, sql, parameterMappings, parameterObject);
  }
```
这里的RawSqlSource为sqlSource的实现类，但是他不是最终的执行类，StaticSqlSource才是最终的执行类，经过经过解析后，不存在${}和#{}这两种符号，只剩下?符号的SQL语句
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1672802134482-22b3cf95-e5aa-4029-9129-03271999fc93.png#averageHue=%234b5b4b&clientId=u01b8983c-a151-4&from=paste&height=518&id=ude3f617a&originHeight=648&originWidth=1874&originalType=binary&ratio=1&rotation=0&showTitle=false&size=131027&status=done&style=none&taskId=u9e7bd489-1437-4b65-aaab-70e07dbd5d2&title=&width=1499.2)
**StaticSqlSource**
```java
 /**
   * 组建一个BoundSql对象
   * @param parameterObject 参数对象
   * @return 组件的BoundSql对象
   */
  @Override
  public BoundSql getBoundSql(Object parameterObject) {
    return new BoundSql(configuration, sql, parameterMappings, parameterObject);
  }
```
我们来看看BoundSql对象？首先看看他的成员变量
**BoundSql**
```java
public class BoundSql {

  // 可能含有“?”占位符的sql语句
  private final String sql;
  // 参数映射列表
  private final List<ParameterMapping> parameterMappings;
  // 实参对象本身
  private final Object parameterObject;
  // 实参
  private final Map<String, Object> additionalParameters;
  // additionalParameters的包装对象
  private final MetaObject metaParameters;
}
```
RawSqlSource在初始化对参数进行处理，返回一个StaticSqlSource
**RawSqlSource**
```java
  public RawSqlSource(Configuration configuration, String sql, Class<?> parameterType) {
    SqlSourceBuilder sqlSourceParser = new SqlSourceBuilder(configuration);
    Class<?> clazz = parameterType == null ? Object.class : parameterType;
    // 处理RawSqlSource中的“#{}”占位符，得到StaticSqlSource
    sqlSource = sqlSourceParser.parse(sql, clazz, new HashMap<>());
  }
```
**SqlSourceBuilder**
```java
  /**
   * 将DynamicSqlSource和RawSqlSource中的“#{}”符号替换掉，从而将他们转化为StaticSqlSource
   * @param originalSql sqlNode.apply()拼接之后的sql语句。已经不包含<if> <where>等节点，也不含有${}符号
   * @param parameterType 实参类型
   * @param additionalParameters 附加参数
   * @return 解析结束的StaticSqlSource
   */
  public SqlSource parse(String originalSql, Class<?> parameterType, Map<String, Object> additionalParameters) {
    // 用来完成#{}处理的处理器
    ParameterMappingTokenHandler handler = new ParameterMappingTokenHandler(configuration, parameterType, additionalParameters);
    // 通用的占位符解析器，用来进行占位符替换
    GenericTokenParser parser = new GenericTokenParser("#{", "}", handler);
    // 将#{}替换为?的SQL语句
    String sql = parser.parse(originalSql);
    // 生成新的StaticSqlSource对象
    return new StaticSqlSource(configuration, sql, handler.getParameterMappings());
  }
```
到这我们把BaseBuilder  类的实现类全部见到了**SqlSourceBuilder负责对Sql的转换处理把他转换成标准的数据库执行SQL，这个对Sql的解析过程在下一篇文章会详细介绍，我们还是回到**getBoundSql
**BaseStatementHandler**
```java
 protected BaseStatementHandler(Executor executor, MappedStatement mappedStatement, Object parameterObject, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) {
    this.configuration = mappedStatement.getConfiguration();
    this.executor = executor;
    this.mappedStatement = mappedStatement;
    this.rowBounds = rowBounds;

    this.typeHandlerRegistry = configuration.getTypeHandlerRegistry();
    this.objectFactory = configuration.getObjectFactory();

    if (boundSql == null) { // issue #435, get the key before calculating the statement
      // 如果是前置主键自增，则在这里进行获得自增的键值
      generateKeys(parameterObject);
      // 获取BoundSql对象
      boundSql = mappedStatement.getBoundSql(parameterObject);
    }

    this.boundSql = boundSql;

    this.parameterHandler = configuration.newParameterHandler(mappedStatement, parameterObject, boundSql);
    this.resultSetHandler = configuration.newResultSetHandler(executor, mappedStatement, rowBounds, parameterHandler, resultHandler, boundSql);
  }
```
## 1.6 执行器配置参数处理器ParameterHandler
Mybatis 的 ParameterHandler 是一个接口，用于将 SQL 语句中的参数设置到 PreparedStatement 中。Mybatis 内部会使用 ParameterHandler 来处理 SQL 语句中的参数，通常不需要用户直接使用。
**Configuration**
```java
  /**
   * 创建参数处理器
   * @param mappedStatement SQL操作的信息
   * @param parameterObject 参数对象
   * @param boundSql SQL语句信息
   * @return 参数处理器
   */
  public ParameterHandler newParameterHandler(MappedStatement mappedStatement, Object parameterObject, BoundSql boundSql) {
    // 创建参数处理器
    ParameterHandler parameterHandler = mappedStatement.getLang().createParameterHandler(mappedStatement, parameterObject, boundSql);
    // 将参数处理器交给拦截器链进行替换，以便拦截器链中的拦截器能注入行为
    parameterHandler = (ParameterHandler) interceptorChain.pluginAll(parameterHandler);
    // 返回最终的参数处理器
    return parameterHandler;
  }
```

- 了解参数处理器我们首先需要看看LanguageDriver类
- Mybatis LanguageDriver 是 Mybatis 的一个功能，允许用户使用自定义的语言来编写 Mybatis 的映射语句。 Mybatis 默认支持一些常用的语言，如 SQL 和 Java，但是 LanguageDriver 功能允许用户使用自己喜欢的语言来编写映射语句，使得开发人员可以更加灵活地使用 Mybatis。

**LanguageDriver**
```java
// 脚本语言解释器
// 在接口上注解的SQL语句，就是由它进行解析的
// @Select("select * from `user` where id = #{id}")
//User queryUserById(Integer id);
public interface LanguageDriver {


  /**
   * 创建参数处理器。参数处理器能将实参传递给JDBC statement。
   * @param mappedStatement 完整的数据库操作节点
   * @param parameterObject 参数对象
   * @param boundSql 数据库操作语句转化的BoundSql对象
   * @return 参数处理器
   */
  ParameterHandler createParameterHandler(MappedStatement mappedStatement, Object parameterObject, BoundSql boundSql);


  /**
   * 创建SqlSource对象（基于映射文件的方式）。该方法在MyBatis启动阶段，读取映射接口或映射文件时被调用
   * @param configuration 配置信息
   * @param script 映射文件中的数据库操作节点
   * @param parameterType 参数类型
   * @return SqlSource对象
   */
  SqlSource createSqlSource(Configuration configuration, XNode script, Class<?> parameterType);


  /**
   * 创建SqlSource对象（基于注解的方式）。该方法在MyBatis启动阶段，读取映射接口或映射文件时被调用
   * @param configuration 配置信息
   * @param script 注解中的SQL字符串
   * @param parameterType 参数类型
   * @return SqlSource对象，具体来说是DynamicSqlSource和RawSqlSource中的一种
   */
  SqlSource createSqlSource(Configuration configuration, String script, Class<?> parameterType);
}

```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673248315227-5398f652-339d-43ce-b754-6a6930d8d502.png#averageHue=%232c2c2c&clientId=u89a27390-41fa-4&from=paste&height=400&id=u98457a1d&originHeight=500&originWidth=1210&originalType=binary&ratio=1&rotation=0&showTitle=false&size=16589&status=done&style=none&taskId=u3907515b-326b-4ad4-ae78-0eb01707925&title=&width=968)

- 返回一个默认的参数处理器，通过参数处理器为PreparedStatement设置参数

**XMLLanguageDriver**
```java
// 返回一个默认的参数处理器
@Override
  public ParameterHandler createParameterHandler(MappedStatement mappedStatement, Object parameterObject, BoundSql boundSql) {
    return new DefaultParameterHandler(mappedStatement, parameterObject, boundSql);
  }

```
**DefaultParameterHandler**
```java
public class DefaultParameterHandler implements ParameterHandler {

  // 类型处理器注册表
  private final TypeHandlerRegistry typeHandlerRegistry;
  // MappedStatement对象（包含完整的增删改查节点信息）
  private final MappedStatement mappedStatement;
  // 参数对象
  private final Object parameterObject;
  // BoundSql对象（包含SQL语句、参数、实参信息）
  private final BoundSql boundSql;
  // 配置信息
  private final Configuration configuration;

  public DefaultParameterHandler(MappedStatement mappedStatement, Object parameterObject, BoundSql boundSql) {
    this.mappedStatement = mappedStatement;
    this.configuration = mappedStatement.getConfiguration();
    this.typeHandlerRegistry = mappedStatement.getConfiguration().getTypeHandlerRegistry();
    this.parameterObject = parameterObject;
    this.boundSql = boundSql;
  }

  @Override
  public Object getParameterObject() {
    return parameterObject;
  }

  /**
   * 为语句设置参数
   * @param ps 语句
   */
  @Override
  public void setParameters(PreparedStatement ps) {
    ErrorContext.instance().activity("setting parameters").object(mappedStatement.getParameterMap().getId());
    // 取出参数列表
    List<ParameterMapping> parameterMappings = boundSql.getParameterMappings();
    if (parameterMappings != null) {
      for (int i = 0; i < parameterMappings.size(); i++) {
        ParameterMapping parameterMapping = parameterMappings.get(i);
        // ParameterMode.OUT是CallableStatement的输出参数，已经单独注册。故忽略
        if (parameterMapping.getMode() != ParameterMode.OUT) {
          Object value;
          // 取出属性名称
          String propertyName = parameterMapping.getProperty();
          if (boundSql.hasAdditionalParameter(propertyName)) {
            // 从附加参数中读取属性值
            value = boundSql.getAdditionalParameter(propertyName);
          } else if (parameterObject == null) {
            value = null;
          } else if (typeHandlerRegistry.hasTypeHandler(parameterObject.getClass())) {
            // 参数对象是基本类型，则参数对象即为参数值
            value = parameterObject;
          } else {
            // 参数对象是复杂类型，取出参数对象的该属性值
            MetaObject metaObject = configuration.newMetaObject(parameterObject);
            value = metaObject.getValue(propertyName);
          }
          // 确定该参数的处理器
          TypeHandler typeHandler = parameterMapping.getTypeHandler();
          JdbcType jdbcType = parameterMapping.getJdbcType();
          if (value == null && jdbcType == null) {
            jdbcType = configuration.getJdbcTypeForNull();
          }
          try {
            // 此方法最终根据参数类型，调用java.sql.PreparedStatement类中的参数赋值方法，对SQL语句中的参数赋值
            typeHandler.setParameter(ps, i + 1, value, jdbcType);
          } catch (TypeException | SQLException e) {
            throw new TypeException("Could not set parameters for mapping: " + parameterMapping + ". Cause: " + e, e);
          }
        }
      }
    }
  }

}
```
后面的为执行器设置一个默认的resultSetHandler结果处理器我就不说了
## 1.7 拿到StatementHandler具体的执行

1. 获取数据库连接，执行sql语句，封装结果返回

**Configuration**
```java
// 返回一个StatementHandler对象
public StatementHandler newStatementHandler(Executor executor, MappedStatement mappedStatement, Object parameterObject, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) {
    StatementHandler statementHandler = new RoutingStatementHandler(executor, mappedStatement, parameterObject, rowBounds, resultHandler, boundSql);
    statementHandler = (StatementHandler) interceptorChain.pluginAll(statementHandler);
    return statementHandler;
  }
```
通过RoutingStatementHandler返回一个PreparedStatementHandler对象
**PreparedStatementHandler**
```java
  @Override
  public int update(Statement statement) throws SQLException {
    PreparedStatement ps = (PreparedStatement) statement;
    ps.execute();
    // 返回影响条数
    int rows = ps.getUpdateCount();
    // 参数对象
    Object parameterObject = boundSql.getParameterObject();
    // 主键自增器
    KeyGenerator keyGenerator = mappedStatement.getKeyGenerator();
    // 后置执行主键自增
    keyGenerator.processAfter(executor, mappedStatement, ps, parameterObject);
    return rows;
  }
```
**SimpleExecutor**
```java

  @Override
  public int doUpdate(MappedStatement ms, Object parameter) throws SQLException {
    Statement stmt = null;
    try {
      Configuration configuration = ms.getConfiguration();
      StatementHandler handler = configuration.newStatementHandler(this, ms, parameter, RowBounds.DEFAULT, null, null);
      stmt = prepareStatement(handler, ms.getStatementLog());
      return handler.update(stmt);
    } finally {
      closeStatement(stmt);
    }


 private Statement prepareStatement(StatementHandler handler, Log statementLog) throws SQLException {
    Statement stmt;
    Connection connection = getConnection(statementLog);
    stmt = handler.prepare(connection, transaction.getTimeout());
    handler.parameterize(stmt);
    return stmt;
  }


@Override
  public int doUpdate(MappedStatement ms, Object parameter) throws SQLException {
    Statement stmt = null;
    try {
      Configuration configuration = ms.getConfiguration();
      StatementHandler handler = configuration.newStatementHandler(this, ms, parameter, RowBounds.DEFAULT, null, null);
      stmt = prepareStatement(handler, ms.getStatementLog());
      return handler.update(stmt);
    } finally {
      closeStatement(stmt);
    }
  }
```

1. 从Connection中创建一个Statement
2. 为Statement绑定实参
```java
// 准备语句
  private Statement prepareStatement(StatementHandler handler, Log statementLog) throws SQLException {
    Statement stmt;
     // 获取连接
    Connection connection = getConnection(statementLog);
     // 从Connection中创建一个Statement
    stmt = handler.prepare(connection, transaction.getTimeout());
     // 为Statement绑定实参,这就要参考具体的实现类 这里就是PreparedStatementHandler
    handler.parameterize(stmt);
    // 返回  Statement
    return stmt;
  }

```

- 交个处理器执行handler.update(stmt)，返回结果

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673249239229-3cdf9c51-dfe1-4f71-971d-9db7fed76ef4.png#averageHue=%234c5a4c&clientId=u89a27390-41fa-4&from=paste&height=721&id=uad044664&originHeight=901&originWidth=1885&originalType=binary&ratio=1&rotation=0&showTitle=false&size=278087&status=done&style=none&taskId=ub90584f1-4a36-4b86-9b1a-b2f95fafeac&title=&width=1508)

- 更新语句，
```java
  @Override
  public int update(Statement statement) throws SQLException {
    PreparedStatement ps = (PreparedStatement) statement;
    ps.execute();
    int rows = ps.getUpdateCount();
    Object parameterObject = boundSql.getParameterObject();
    KeyGenerator keyGenerator = mappedStatement.getKeyGenerator();
    keyGenerator.processAfter(executor, mappedStatement, ps, parameterObject);
    return rows;
  }

```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673249423931-f668711d-239f-4d66-abc1-609bbf0bf1e8.png#averageHue=%234c5d4b&clientId=u89a27390-41fa-4&from=paste&height=648&id=u45330f21&originHeight=810&originWidth=1884&originalType=binary&ratio=1&rotation=0&showTitle=false&size=238085&status=done&style=none&taskId=u9edd832f-b101-4e5e-b923-e26054927f0&title=&width=1507.2)
PreparedStatement.execute() 是用于执行预编译的 SQL 语句的方法。它可以通过传递参数来执行带有占位符的预编译语句。
这个方法的返回值是一个布尔值，表示该语句是否返回结果集。如果返回 true，则表示该语句返回了结果集；如果返回 false，则表示该语句没有返回结果集。
例如：
```java
PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users WHERE name=?");
stmt.set String(1, "John");
boolean hasResultSet = stmt.execute();
```
在这个例子中，我们创建了一个预编译的语句，并且使用 setString 方法为第一个占位符设置了参数。然后，我们使用 execute 方法执行该语句，并将返回值保存在 hasResultSet 变量中。


