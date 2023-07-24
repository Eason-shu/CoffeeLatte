---
title: Mybatis源码分析（十）Mybatis的结果隐射
sidebar_position: 12
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

![P2110067.JPG](https://cdn.nlark.com/yuque/0/2023/jpeg/12426173/1677035312351-084dc226-02f7-4fc2-8186-6fc956cddf50.jpeg#averageHue=%234b5556&clientId=ue14d4e49-00eb-4&from=ui&id=u3baffd50&originHeight=3888&originWidth=5184&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=9174360&status=done&style=none&taskId=u9aebe588-a357-449d-888d-31b90179ccf&title=)


- 官网：[mybatis – MyBatis 3 | 简介](https://mybatis.org/mybatis-3/zh/index.html)

上一篇文章介绍了Mybatis 是如何与数据库打交道了，我们可以拿到数据库给的结果，但是不一定是我们想要的结果，需要通过Mybatis的的结果隐射才能拿到我们想要的结果，下面我们来介绍数据库的结果隐射？我们首先来看看Jdbc方式的结果与对象的转换
```java
public static void main(String[] args) throws Exception {
    //1.注册数据库驱动
    Class.forName("com.mysql.jdbc.Driver");
    //2.获取数据库连接
    Connection conn = DriverManager.getConnection(
        "jdbc:mysql://localhost:3306/jt_db?characterEncoding=utf-8",
        "root", "root");
    //3.获取传输器
    Statement stat = conn.createStatement();
    //4.发送SQL到服务器执行并返回执行结果
    String sql = "select * from account";
    ResultSet rs = stat.executeQuery( sql );
    //5.处理结果
    while( rs.next() ) {
        int id = rs.getInt("id");
        String name = rs.getString("name");
        double money = rs.getDouble("money");
        System.out.println(id+" : "+name+" : "+money);
    }
    //6.释放资源
    rs.close();
    stat.close();
    conn.close();
    System.out.println("TestJdbc.main()....");
}

```
我们可以看到获取结果需要我们自己来选择返回的是啥结果类型，而Mybatis就已经完成了结果集与实体类的对象转换

---

> 学习到的知识

:::info

1. 数据库结果集与实体类的转换
2. 策越设计模式对不同参数类型的处理
:::
> 过程梳理

:::warning

1. 通过调用 execute()方法我们已经可以获取到执行结果，但是不是我们想要的
2. 我们需要完成不同类型的参数与数据库结果集的转换
3. 首先根据结果类型，通过反射创建一个空的对象
4. 判断是否有未指定的隐射关系的参数，和已经指定了隐射关系的参数，根据参数类型调用不同的参数处理器从ResultSet获取结果，设置实体类属性返回
:::

---


---



首先我们来看看我们写的测试类？
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
# 一 知识回顾
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
这里我们以上面的案例为例来分析查询过程结果的封装，通过调试我们可以看到调用了如下的方法，我们跟进去仔细看看
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1676439690410-c94b1dae-7fbd-4359-b39e-0522078f1dd2.png#averageHue=%23474f4e&clientId=u91408e0b-9454-4&from=paste&height=408&id=u45f8dda8&originHeight=510&originWidth=1875&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=144541&status=done&style=none&taskId=u422cdc97-1148-4266-b347-ae99a02c769&title=&width=1500)
**DefaultSqlSession**
```java
 @Override
  public <T> T selectOne(String statement, Object parameter) {
    // Popular vote was to return null on 0 results and throw exception on too many.
    List<T> list = this.selectList(statement, parameter);
    if (list.size() == 1) {
      return list.get(0);
    } else if (list.size() > 1) {
      throw new TooManyResultsException("Expected one result (or null) to be returned by selectOne(), but found: " + list.size());
    } else {
      return null;
    }
  }
```
这里判断是返回时一个集合数据，还是单个数据
```java
 private <E> List<E> selectList(String statement, Object parameter, RowBounds rowBounds, ResultHandler handler) {
    try {
      // 通过id获取隐射语句
      MappedStatement ms = configuration.getMappedStatement(statement);
      // 交给具体的执行器去执行
      return executor.query(ms, wrapCollection(parameter), rowBounds, handler);
    } catch (Exception e) {
      throw ExceptionFactory.wrapException("Error querying database.  Cause: " + e, e);
    } finally {
      ErrorContext.instance().reset();
    }
  }

```

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1676440030534-b78967b9-0675-499e-a104-74bc9ded9e64.png#averageHue=%23597556&clientId=u91408e0b-9454-4&from=paste&height=607&id=u9109dd81&originHeight=759&originWidth=1882&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=196826&status=done&style=none&taskId=u179f6b5d-1312-429f-8565-d9a4751c555&title=&width=1505.6)
从上面调试可以知道，执行器是CachingExecutor
**CachingExecutor**
```java
  @Override
  public <E> List<E> query(MappedStatement ms, Object parameterObject, RowBounds rowBounds, ResultHandler resultHandler) throws SQLException {
    // 通过sqlSource获取解析好的BoundSql
    BoundSql boundSql = ms.getBoundSql(parameterObject);
    // 创建缓存key ,后面介绍一级二级缓存详细介绍
    CacheKey key = createCacheKey(ms, parameterObject, rowBounds, boundSql);

    return query(ms, parameterObject, rowBounds, resultHandler, key, boundSql);
  }
```
```java
 @Override
  public <E> List<E> query(MappedStatement ms, Object parameterObject, RowBounds rowBounds, ResultHandler resultHandler, CacheKey key, BoundSql boundSql)
      throws SQLException {
     // 获取缓存
    Cache cache = ms.getCache();
     // 如果有缓存
    if (cache != null) {
      flushCacheIfRequired(ms);
      if (ms.isUseCache() && resultHandler == null) {
        ensureNoOutParams(ms, boundSql);
        @SuppressWarnings("unchecked")
        // 从缓存中获取结果
        List<E> list = (List<E>) tcm.getObject(cache, key);
        if (list == null) {
          // 如果为空交给数据库查询
          list = delegate.query(ms, parameterObject, rowBounds, resultHandler, key, boundSql);
            // 重新缓存
          tcm.putObject(cache, key, list); // issue #578 and #116
        }
        return list;
      }
    }
    // 没有缓存直接交给子类执行器去执行
    return delegate.query(ms, parameterObject, rowBounds, resultHandler, key, boundSql);
  }
```
从上面的代码我们可以知道，首先获取有缓存回去缓存中查询数据，如果没有再去数据库中查询，减少连接次数，减小开销，提高性能，让我们来看看他的增强类：BaseExecutor
**BaseExecutor**
```java
/**
   * 查询数据库中的数据
   * @param ms 映射语句
   * @param parameter 参数对象
   * @param rowBounds 翻页限制条件
   * @param resultHandler 结果处理器
   * @param key 缓存的键
   * @param boundSql 查询语句
   * @param <E> 结果类型
   * @return 结果列表
   * @throws SQLException
   */
  @SuppressWarnings("unchecked")
  @Override
  public <E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, CacheKey key, BoundSql boundSql) throws SQLException {
    ErrorContext.instance().resource(ms.getResource()).activity("executing a query").object(ms.getId());
    if (closed) {
      // 执行器已经关闭
      throw new ExecutorException("Executor was closed.");
    }
    if (queryStack == 0 && ms.isFlushCacheRequired()) { // 新的查询栈且要求清除缓存
      // 清除一级缓存
      clearLocalCache();
    }
    List<E> list;
    try {
      queryStack++;
      // 尝试从本地缓存获取结果
      list = resultHandler == null ? (List<E>) localCache.getObject(key) : null;
      if (list != null) {
        // 本地缓存中有结果，则对于CALLABLE语句还需要绑定到IN/INOUT参数上
        handleLocallyCachedOutputParameters(ms, key, parameter, boundSql);
      } else {
        // 本地缓存没有结果，故需要查询数据库
        list = queryFromDatabase(ms, parameter, rowBounds, resultHandler, key, boundSql);
      }
    } finally {
      queryStack--;
    }
    if (queryStack == 0) {
      // 懒加载操作的处理
      for (DeferredLoad deferredLoad : deferredLoads) {
        deferredLoad.load();
      }
      deferredLoads.clear();
      // 如果本地缓存的作用域为STATEMENT，则立刻清除本地缓存
      if (configuration.getLocalCacheScope() == LocalCacheScope.STATEMENT) {
        clearLocalCache();
      }
    }
    return list;
  }

```
```java
/**
   * 从数据库中查询结果
   * @param ms 映射语句
   * @param parameter 参数对象
   * @param rowBounds 翻页限制条件
   * @param resultHandler 结果处理器
   * @param key 缓存的键
   * @param boundSql 查询语句
   * @param <E> 结果类型
   * @return 结果列表
   * @throws SQLException
   */
  private <E> List<E> queryFromDatabase(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, CacheKey key, BoundSql boundSql) throws SQLException {
    List<E> list;
    // 向缓存中增加占位符，表示正在查询
    localCache.putObject(key, EXECUTION_PLACEHOLDER);
    try {
      list = doQuery(ms, parameter, rowBounds, resultHandler, boundSql);
    } finally {
      // 删除占位符
      localCache.removeObject(key);
    }
    // 将查询结果写入缓存
    localCache.putObject(key, list);
    if (ms.getStatementType() == StatementType.CALLABLE) {
      localOutputParameterCache.putObject(key, parameter);
    }
    return list;
  }
```
上面的代码我们应该都熟悉了，因为前面已经介绍过了，接着调用默认的执行器SimpleExecutor的方法
```java
  @Override
  public <E> List<E> doQuery(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) throws SQLException {
    Statement stmt = null;
    try {
      Configuration configuration = ms.getConfiguration();
       // 创建 StatementHandler
      StatementHandler handler = configuration.newStatementHandler(wrapper, ms, parameter, rowBounds, resultHandler, boundSql);
      // 创建Statement
      stmt = prepareStatement(handler, ms.getStatementLog());
      // 处理结果
      return handler.query(stmt, resultHandler);
    } finally {
      closeStatement(stmt);
    }
  }
```
**PreparedStatementHandler**
```java
  @Override
  public <E> List<E> query(Statement statement, ResultHandler resultHandler) throws SQLException {
    PreparedStatement ps = (PreparedStatement) statement;
    // 执行真正的查询，查询完成后，结果就在ps中了
    ps.execute();
    // 由resultSetHandler继续处理结果
    return resultSetHandler.handleResultSets(ps);
  }

```
来到这我们就应该思考一下，他咋知道我们要的啥数据类型，我们好像忽略了一个参数，ResultHandler 结果处理器，下面我们来看看ResultHandler的作用？
# 二 ResultHandler解析
源码解析：

- 获取一个预处理语句执行的结果，实际上为ResultSetImpl，最后包装成ResultSetWrapper返回

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677035956541-0cd7f6ad-938a-4b79-8255-30accc5b0707.png#averageHue=%23698268&clientId=u9f44262a-257f-4&from=paste&height=591&id=WVhVt&originHeight=739&originWidth=1881&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=168344&status=done&style=none&taskId=uf8004d89-35d8-40ef-89f1-3699c3883f1&title=&width=1504.8)

- 获取隐射语句中我们配置的实体类与数据库对象的隐射关系，返回一个ResultMap集合对象

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677036218590-3ce30374-5741-4e05-9471-db7fb7956c0d.png#averageHue=%234e595a&clientId=u9f44262a-257f-4&from=paste&height=612&id=Fc92d&originHeight=765&originWidth=1872&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=238687&status=done&style=none&taskId=u8f74968f-aedf-46d3-805f-093fd4b2229&title=&width=1497.6)

- 遍历ResultMap，调用handleResultSet方法对结果进行处理，创建一个默认的DefaultResultHandler处理器，来处理结果，结果处理完成添加到multipleResults中

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677036440711-c5169546-5f6e-47d6-9baf-c2c88085ae8f.png#averageHue=%233f614b&clientId=u9f44262a-257f-4&from=paste&height=546&id=u04f63d19&originHeight=683&originWidth=1834&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=176252&status=done&style=none&taskId=ue3ae0112-eb6a-4f6f-b684-6b523e06ecb&title=&width=1467.2)

- 具体的处理，分为两种单查询结果，还是嵌套查询结果，这里我们以但查询结果为例

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677036644571-5a10bcce-0a78-4055-a920-bd3a08d01e18.png#averageHue=%235b8061&clientId=u9f44262a-257f-4&from=paste&height=498&id=u32a6aaea&originHeight=623&originWidth=1879&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=152679&status=done&style=none&taskId=u1ca034a2-00bf-450e-9e62-a7386106628&title=&width=1503.2)

- 通过我们设置的返回结果的类型，通过反射构建一个空的对象

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677038595944-240b4306-a284-4596-8688-b9d4ed2f1539.png#averageHue=%23648465&clientId=u0383ef34-c789-4&from=paste&height=598&id=u6273b08a&originHeight=748&originWidth=1861&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=223667&status=done&style=none&taskId=ua7aecd75-abc1-433f-9389-f43307bfac0&title=&width=1488.8)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677038695196-b6db78e0-2ca9-415b-99d6-b58f54053c69.png#averageHue=%23407251&clientId=u0383ef34-c789-4&from=paste&height=525&id=ue79dc476&originHeight=656&originWidth=1877&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=147516&status=done&style=none&taskId=uec0fb63f-b69a-458c-bdba-ee162ac2288&title=&width=1501.6)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677038781976-a8e5f47f-eca0-47a3-ad88-71f4acdca5f8.png#averageHue=%23647e67&clientId=u0383ef34-c789-4&from=paste&height=590&id=u4d46dd01&originHeight=737&originWidth=1854&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=237369&status=done&style=none&taskId=ue9177fa7-7b5f-442e-bca0-4a79e71b6be&title=&width=1483.2)
具体的我们下面在解析，我们先看看前面的代码与理论

- ResultSetHandler是Mybatis的核心组件，主要负责将结果集resultSets转化成结果列表（或cursor）和处理储存过程的输出。
- DefaultResultSetHandler是Myabtis为ResultSetHandler提供的唯一一个实现类，下面我们将深入DefaultResultSetHandler的源码了解其实如何转化结果集resultSet的。

首先我们来看看他的接口信息，定义了三个接口来处理不同的结果集
**接口信息**
```java
public interface ResultSetHandler {
   // 处理多个结果集
  <E> List<E> handleResultSets(Statement stmt) throws SQLException;
  // 处理多个游标结果集
  <E> Cursor<E> handleCursorResultSets(Statement stmt) throws SQLException;
  // 处理存储过程的输出
  void handleOutputParameters(CallableStatement cs) throws SQLException;
}
```
然后我们来看看他的唯一实现DefaultResultSetHandler，首先看看成员变量
```java
public class DefaultResultSetHandler implements ResultSetHandler {
  // 延时的
  private static final Object DEFERRED = new Object();
  // 执行器
  private final Executor executor;
   // 配置文件
  private final Configuration configuration;
    // 隐射语句
  private final MappedStatement mappedStatement;
    // 行帮助器
  private final RowBounds rowBounds;

  // 处理存储过程的输出参数的处理器
  private final ParameterHandler parameterHandler;

  // 处理单条结果的处理器
  private final ResultHandler<?> resultHandler;
   // 封装了sql语句
  private final BoundSql boundSql;
    // 类型注册工厂
  private final TypeHandlerRegistry typeHandlerRegistry;
    // 对象工厂
  private final ObjectFactory objectFactory;
    // 反射工厂
  private final ReflectorFactory reflectorFactory;

  // nested resultmaps| 嵌套的
  private final Map<CacheKey, Object> nestedResultObjects = new HashMap<>();
  private final Map<String, Object> ancestorObjects = new HashMap<>();
  private Object previousRowValue;

  // multiple resultsets| 单个的
  private final Map<String, ResultMapping> nextResultMaps = new HashMap<>();
  private final Map<CacheKey, List<PendingRelation>> pendingRelations = new HashMap<>();

  // Cached Automappings|
  private final Map<String, List<UnMappedColumnAutoMapping>> autoMappingsCache = new HashMap<>();

  // temporary marking flag that indicate using constructor mapping (use field to reduce memory usage)
  private boolean useConstructorMappings;

}
```
我们来看看他的实现方法，这里我们以handleResultSets接口方法为例
**DefaultResultSetHandler**
```java
/**
   * 处理Statement得到的多结果集（也可能是单结果集，这是多结果集的一种简化形式），最终得到结果列表
   * @param stmt Statement语句
   * @return 结果列表
   * @throws SQLException
   */
  @Override
  public List<Object> handleResultSets(Statement stmt) throws SQLException {
    ErrorContext.instance().activity("handling results").object(mappedStatement.getId());
    // 用以存储处理结果的列表
    final List<Object> multipleResults = new ArrayList<>();
    // 可能会有多个结果集，该变量用来对结果集进行计数
    int resultSetCount = 0;
    // 可能会有多个结果集，先取出第一个结果集
    ResultSetWrapper rsw = getFirstResultSet(stmt);
    // 查询语句对应的resultMap节点，可能含有多个
    List<ResultMap> resultMaps = mappedStatement.getResultMaps();
    int resultMapCount = resultMaps.size();
    // 合法性校验（存在输出结果集的情况下，resultMapCount不能为0）
    validateResultMapsCount(rsw, resultMapCount);
    // 循环遍历每一个设置了resultMap的结果集
    while (rsw != null && resultMapCount > resultSetCount) {
      // 获得当前结果集对应的resultMap
      ResultMap resultMap = resultMaps.get(resultSetCount);
      // 进行结果集的处理
      handleResultSet(rsw, resultMap, multipleResults, null);
      // 获取下一结果集
      rsw = getNextResultSet(stmt);
      // 清理上一条结果集的环境
      cleanUpAfterHandlingResultSet();
      resultSetCount++;
    }
    // 获取多结果集中所有结果集的名称
    String[] resultSets = mappedStatement.getResultSets();
    if (resultSets != null) {
      // 循环遍历每一个没有设置resultMap的结果集
      while (rsw != null && resultSetCount < resultSets.length) {
        // 获取该结果集对应的父级resultMap中的resultMapping（注：resultMapping用来描述对象属性的映射关系）
        ResultMapping parentMapping = nextResultMaps.get(resultSets[resultSetCount]);
        if (parentMapping != null) {
          // 获取被嵌套的resultMap的编号
          String nestedResultMapId = parentMapping.getNestedResultMapId();
          ResultMap resultMap = configuration.getResultMap(nestedResultMapId);
          // 处理嵌套映射
          handleResultSet(rsw, resultMap, null, parentMapping);
        }
        rsw = getNextResultSet(stmt);
        cleanUpAfterHandlingResultSet();
        resultSetCount++;
      }
    }
    // 判断是否是单结果集：如果是则返回结果列表；如果否则返回结果集列表
    return collapseSingleResultList(multipleResults);
  }
```
从上面看，主要是拿到我们配置的ResultMap实体类属性与数据库字段的属性的ResultMap
```xml
<resultMap type="com.shu.User" id="UserMap">
  <result property="id" column="id" jdbcType="INTEGER"/>
  <result property="name" column="name" jdbcType="VARCHAR"/>
  <result property="email" column="email" jdbcType="VARCHAR"/>
  <result property="age" column="age" jdbcType="INTEGER"/>
  <result property="sex" column="sex" jdbcType="INTEGER"/>
  <result property="schoolname" column="schoolName" jdbcType="VARCHAR"/>
</resultMap>
```
来完成对象关系的隐射，与数据的返回，下面我们来接着看看handleResultSet方法，备注对应嵌套结果的返回我们这里就不分析了，有兴趣的话可以自行分析
**DefaultResultSetHandler**
```java
/**
* 处理单一的结果集
* @param rsw ResultSet的包装
* @param resultMap resultMap节点的信息
* @param multipleResults 用来存储处理结果的list
* @param parentMapping
* @throws SQLException
*/
private void handleResultSet(ResultSetWrapper rsw, ResultMap resultMap, List<Object> multipleResults, ResultMapping parentMapping) throws SQLException {
    try {
        if (parentMapping != null) { // 嵌套的结果
            // 向子方法传入parentMapping。处理结果中的记录。
            handleRowValues(rsw, resultMap, null, RowBounds.DEFAULT, parentMapping);
        } else { // 非嵌套的结果
            if (resultHandler == null) {
                // defaultResultHandler能够将结果对象聚合成一个List返回
                DefaultResultHandler defaultResultHandler = new DefaultResultHandler(objectFactory);
                // 处理结果中的记录。
                handleRowValues(rsw, resultMap, defaultResultHandler, rowBounds, null);
                multipleResults.add(defaultResultHandler.getResultList());
            } else {
                handleRowValues(rsw, resultMap, resultHandler, rowBounds, null);
            }
        }
    } finally {
        // issue #228 (close resultsets)
        closeResultSet(rsw.getResultSet());
    }
}
```
与上面一样，针对嵌套结果我们就不分析了，我们来看看非嵌套的结果，首先拿到一个DefaultResultHandler能够将结果对象聚合成一个List返回，接着处理数据库操作返回的航结果，处理完毕之后，将结果添加到multipleResults之中返回，所以我们应该重点关注一下
handleRowValues方法，下面接着看
**DefaultResultSetHandler**
```java
  /**
   * 处理单结果集中的属性
   * @param rsw 单结果集的包装
   * @param resultMap 结果映射
   * @param resultHandler 结果处理器
   * @param rowBounds 翻页限制条件
   * @param parentMapping 父级结果映射
   * @throws SQLException
   */
  public void handleRowValues(ResultSetWrapper rsw, ResultMap resultMap, ResultHandler<?> resultHandler,
                              RowBounds rowBounds, ResultMapping parentMapping) throws SQLException {
    if (resultMap.hasNestedResultMaps()) {
      // 前置校验
      ensureNoRowBounds();
      checkResultHandler();
      // 处理嵌套映射
      handleRowValuesForNestedResultMap(rsw, resultMap, resultHandler, rowBounds, parentMapping);
    } else {
      // 处理单层映射
      handleRowValuesForSimpleResultMap(rsw, resultMap, resultHandler, rowBounds, parentMapping);
    }
  }


  /**
   * 处理非嵌套映射的结果集
   * @param rsw 结果集包装
   * @param resultMap 结果映射
   * @param resultHandler 结果处理器
   * @param rowBounds 翻页限制条件
   * @param parentMapping 父级结果映射
   * @throws SQLException
   */
  private void handleRowValuesForSimpleResultMap(ResultSetWrapper rsw, ResultMap resultMap, ResultHandler<?> resultHandler, RowBounds rowBounds, ResultMapping parentMapping)
      throws SQLException {
    DefaultResultContext<Object> resultContext = new DefaultResultContext<>();
    // 当前要处理的结果集
    ResultSet resultSet = rsw.getResultSet();
    // 根据翻页配置，跳过指定的行
    skipRows(resultSet, rowBounds);
    // 持续处理下一条结果，判断条件为：还有结果需要处理 && 结果集没有关闭 && 还有下一条结果
    while (shouldProcessMoreRows(resultContext, rowBounds) && !resultSet.isClosed() && resultSet.next()) {
      // 经过鉴别器鉴别，确定经过鉴别器分析的最终要使用的resultMap
      ResultMap discriminatedResultMap = resolveDiscriminatedResultMap(resultSet, resultMap, null);
      // 拿到了一行记录，并且将其转化为一个对象
      Object rowValue = getRowValue(rsw, discriminatedResultMap, null);
      // 把这一行记录转化出的对象存起来
      storeObject(resultHandler, resultContext, rowValue, parentMapping, resultSet);
    }
  }

```
我们查询的结果很有可能是一个集合，所以这里要遍历集合，每条结果单独进行映射，最后映射的结果加入到**resultHandler的ResultList，我们来看看关键代码**getRowValue，将数据的记录转换成一个对象？
**DefaultResultSetHandler**
```java

  /**
   * 将一条记录转化为一个对象
   * @param rsw 结果集包装
   * @param resultMap 结果映射
   * @param columnPrefix 列前缀
   * @return 转化得到的对象
   * @throws SQLException
   */
  private Object getRowValue(ResultSetWrapper rsw, ResultMap resultMap, String columnPrefix) throws SQLException {
    // 创建一个延迟加载器
    final ResultLoaderMap lazyLoader = new ResultLoaderMap();
    // 创建这一行记录对应的对象
    Object rowValue = createResultObject(rsw, resultMap, lazyLoader, columnPrefix);
    if (rowValue != null && !hasTypeHandlerForResultObject(rsw, resultMap.getType())) {
      // 根据对象得到其MetaObject
      final MetaObject metaObject = configuration.newMetaObject(rowValue);
      boolean foundValues = this.useConstructorMappings;
      // 是否允许自动映射未明示的字段
      if (shouldApplyAutomaticMappings(resultMap, false)) {
        // 自动映射未明示的字段
        foundValues = applyAutomaticMappings(rsw, resultMap, metaObject, columnPrefix) || foundValues;
      }
      // 按照明示的字段进行重新映射
      foundValues = applyPropertyMappings(rsw, resultMap, metaObject, lazyLoader, columnPrefix) || foundValues;
      foundValues = lazyLoader.size() > 0 || foundValues;
      rowValue = foundValues || configuration.isReturnInstanceForEmptyRow() ? rowValue : null;
    }
    return rowValue;
  }

```
到这里我们就开始接触到事情的真相，原来利用第一条结果数据进行反射，构建对象，具体逻辑如下：

1. 创建实体类对象
2. 自动映射结果集中有的column，但resultMap中并没有配置
3. 根据 <resultMap> 节点中配置的映射关系进行映射
# 三 创建实体类对象
我们想将查询结果映射成实体类对象，第一步当然是要创建实体类对象了
**DefaultResultSetHandler**
```java
// 根据映射要求，创建出一个空的对象来
  private Object createResultObject(ResultSetWrapper rsw, ResultMap resultMap, ResultLoaderMap lazyLoader, String columnPrefix) throws SQLException {
    // 是否基于构造函数创建
    this.useConstructorMappings = false; // reset previous mapping result
    // 构造器参数类型
    final List<Class<?>> constructorArgTypes = new ArrayList<>();
    // 构造器参数
    final List<Object> constructorArgs = new ArrayList<>();
    // 创建输出对象
    Object resultObject = createResultObject(rsw, resultMap, constructorArgTypes, constructorArgs, columnPrefix);
    if (resultObject != null && !hasTypeHandlerForResultObject(rsw, resultMap.getType())) {
      // 因此不是基本类型
      final List<ResultMapping> propertyMappings = resultMap.getPropertyResultMappings();
      for (ResultMapping propertyMapping : propertyMappings) {
        // issue gcode #109 && issue #149
        // 如果存在嵌套查询，并且至少有一个属性是懒加载的
        if (propertyMapping.getNestedQueryId() != null && propertyMapping.isLazy()) {
          // 返回的对象被替换称为原对象的代理对象
          resultObject = configuration.getProxyFactory().createProxy(resultObject, lazyLoader, configuration, objectFactory, constructorArgTypes, constructorArgs);
          break;
        }
      }
    }
    this.useConstructorMappings = resultObject != null && !constructorArgTypes.isEmpty(); // set current mapping result
    return resultObject;
  }



 private Object createResultObject(ResultSetWrapper rsw, ResultMap resultMap, List<Class<?>> constructorArgTypes, List<Object> constructorArgs, String columnPrefix)
      throws SQLException {
    // 结果的返回类型
    final Class<?> resultType = resultMap.getType();
    // 要创建的类型的MetaClass
    final MetaClass metaType = MetaClass.forClass(resultType, reflectorFactory);
    // 所有的构造函数列表
    final List<ResultMapping> constructorMappings = resultMap.getConstructorResultMappings();
    //
    if (hasTypeHandlerForResultObject(rsw, resultType)) {
      return createPrimitiveResultObject(rsw, resultMap, columnPrefix);
    } else if (!constructorMappings.isEmpty()) {
      return createParameterizedResultObject(rsw, resultType, constructorMappings, constructorArgTypes, constructorArgs, columnPrefix);
    } else if (resultType.isInterface() || metaType.hasDefaultConstructor()) {
    //  通过 ObjectFactory 调用目标类的默认构造方法创建实例
      return objectFactory.create(resultType);
    } else if (shouldApplyAutomaticMappings(resultMap, false)) {
      return createByConstructorSignature(rsw, resultType, constructorArgTypes, constructorArgs);
    }
    throw new ExecutorException("Do not know how to create an instance of " + resultType);
  }
```
一般情况下，MyBatis 会通过 ObjectFactory 调用默认构造方法创建实体类对象。看看是如何创建的
**DefaultObjectFactory**
```java
@Override
  public <T> T create(Class<T> type, List<Class<?>> constructorArgTypes, List<Object> constructorArgs) {
    Class<?> classToCreate = resolveInterface(type);
    // we know types are assignable
    // 创建类型实例
    return (T) instantiateClass(classToCreate, constructorArgTypes, constructorArgs);
  }



  // 判断要创建的目标对象的类型，即如果传入的是接口则给出它的一种实现
  protected Class<?> resolveInterface(Class<?> type) {
    Class<?> classToCreate;
    if (type == List.class || type == Collection.class || type == Iterable.class) {
      classToCreate = ArrayList.class;
    } else if (type == Map.class) {
      classToCreate = HashMap.class;
    } else if (type == SortedSet.class) { // issue #510 Collections Support
      classToCreate = TreeSet.class;
    } else if (type == Set.class) {
      classToCreate = HashSet.class;
    } else {
      classToCreate = type;
    }
    return classToCreate;
  }



/**
   * 创建类的实例
   * @param type 要创建实例的类
   * @param constructorArgTypes 构造方法入参类型
   * @param constructorArgs 构造方法入参
   * @param <T> 实例类型
   * @return 创建的实例
   */
  private  <T> T instantiateClass(Class<T> type, List<Class<?>> constructorArgTypes, List<Object> constructorArgs) {
    try {
      // 构造方法
      Constructor<T> constructor;
      if (constructorArgTypes == null || constructorArgs == null) { // 参数类型列表为null或者参数列表为null
        // 因此获取无参构造函数
        constructor = type.getDeclaredConstructor();
        try {
          // 使用无参构造函数创建对象
          return constructor.newInstance();
        } catch (IllegalAccessException e) {
          // 如果发生异常，则修改构造函数的访问属性后再次尝试
          if (Reflector.canControlMemberAccessible()) {
            constructor.setAccessible(true);
            return constructor.newInstance();
          } else {
            throw e;
          }
        }
      }

      // 根据入参类型查找对应的构造器
      constructor = type.getDeclaredConstructor(constructorArgTypes.toArray(new Class[constructorArgTypes.size()]));
      try {
        // 采用有参构造函数创建实例
        return constructor.newInstance(constructorArgs.toArray(new Object[constructorArgs.size()]));
      } catch (IllegalAccessException e) {
        if (Reflector.canControlMemberAccessible()) {
          // 如果发生异常，则修改构造函数的访问属性后再次尝试
          constructor.setAccessible(true);
          return constructor.newInstance(constructorArgs.toArray(new Object[constructorArgs.size()]));
        } else {
          throw e;
        }
      }
    } catch (Exception e) {
      // 收集所有的参数类型
      String argTypes = Optional.ofNullable(constructorArgTypes).orElseGet(Collections::emptyList)
          .stream().map(Class::getSimpleName).collect(Collectors.joining(","));
      // 收集所有的参数
      String argValues = Optional.ofNullable(constructorArgs).orElseGet(Collections::emptyList)
          .stream().map(String::valueOf).collect(Collectors.joining(","));
      throw new ReflectionException("Error instantiating " + type + " with invalid types (" + argTypes + ") or values (" + argValues + "). Cause: " + e, e);
    }
  }
```
首先要判断传入判断要创建的目标对象的类型，即如果传入的是接口则给出它的一种实现，接着调用instantiateClass方法通过反射来实例化对象，最终返回一个空的对象，下面我们来看看结果隐射
# 四 结果隐射
参考官网：[mybatis – MyBatis 3 | XML 映射器](https://mybatis.org/mybatis-3/zh/sqlmap-xml.html#%E8%87%AA%E5%8A%A8%E6%98%A0%E5%B0%84)
## 4.1 未隐射关系
**DefaultResultSetHandler**
```java
// 将一行记录转化为对象

  /**
   * 将一条记录转化为一个对象
   * @param rsw 结果集包装
   * @param resultMap 结果映射
   * @param columnPrefix 列前缀
   * @return 转化得到的对象
   * @throws SQLException
   */
  private Object getRowValue(ResultSetWrapper rsw, ResultMap resultMap, String columnPrefix) throws SQLException {
    // 创建一个延迟加载器
    final ResultLoaderMap lazyLoader = new ResultLoaderMap();
    // 创建这一行记录对应的对象，根据返回的数据类型，创建一个空的对象
    Object rowValue = createResultObject(rsw, resultMap, lazyLoader, columnPrefix);
    if (rowValue != null && !hasTypeHandlerForResultObject(rsw, resultMap.getType())) {
      // 根据对象得到其MetaObject
      final MetaObject metaObject = configuration.newMetaObject(rowValue);
      boolean foundValues = this.useConstructorMappings;
      // 是否允许自动映射未明示的字段
      if (shouldApplyAutomaticMappings(resultMap, false)) {
        // 自动映射未明示的字段
        foundValues = applyAutomaticMappings(rsw, resultMap, metaObject, columnPrefix) || foundValues;
      }
      // 按照明示的字段进行重新映射
      foundValues = applyPropertyMappings(rsw, resultMap, metaObject, lazyLoader, columnPrefix) || foundValues;
      foundValues = lazyLoader.size() > 0 || foundValues;
      rowValue = foundValues || configuration.isReturnInstanceForEmptyRow() ? rowValue : null;
    }
    return rowValue;
  }
```
映射结果集分为两种情况：一种是自动映射(结果集有但在resultMap里没有配置的字段)，在实际应用中，都会使用自动映射，减少配置的工作。自动映射在Mybatis中也是默认开启的。第二种是映射ResultMap中配置的，我们分这两者映射来看。首先我们来看看未明示的字段。
**DefaultResultSetHandler**
```java
private boolean applyAutomaticMappings(ResultSetWrapper rsw, ResultMap resultMap, MetaObject metaObject, String columnPrefix) throws SQLException {
    // 找到未指名未映射列自动映射
    List<UnMappedColumnAutoMapping> autoMapping = createAutomaticMappings(rsw, resultMap, metaObject, columnPrefix);
    boolean foundValues = false;
    if (!autoMapping.isEmpty()) {
      // 遍历未隐射的列
      for (UnMappedColumnAutoMapping mapping : autoMapping) {
        // 通过不同的类型处理器，来处理值
        final Object value = mapping.typeHandler.getResult(rsw.getResultSet(), mapping.column);
        if (value != null) {
          foundValues = true;
        }
        if (value != null || (configuration.isCallSettersOnNulls() && !mapping.primitive)) {
          // gcode issue #377, call setter on nulls (value is not 'found')
          // 设置值
          metaObject.setValue(mapping.property, value);
        }
      }
    }
    return foundValues;
  }
```
**DefaultResultSetHandler**
```java
 private List<UnMappedColumnAutoMapping> createAutomaticMappings(ResultSetWrapper rsw, ResultMap resultMap, MetaObject metaObject, String columnPrefix)
     throws SQLException {
     // 从缓存中获取 UnMappedColumnAutoMapping 列表
    final String mapKey = resultMap.getId() + ":" + columnPrefix;

    List<UnMappedColumnAutoMapping> autoMapping = autoMappingsCache.get(mapKey);
    if (autoMapping == null) {
      autoMapping = new ArrayList<>();
      final List<String> unmappedColumnNames = rsw.getUnmappedColumnNames(resultMap, columnPrefix);
      for (String columnName : unmappedColumnNames) {
        String propertyName = columnName;
        if (columnPrefix != null && !columnPrefix.isEmpty()) {
          // When columnPrefix is specified,
          // ignore columns without the prefix.
          if (columnName.toUpperCase(Locale.ENGLISH).startsWith(columnPrefix)) {
            propertyName = columnName.substring(columnPrefix.length());
          } else {
            continue;
          }
        }
        final String property = metaObject.findProperty(propertyName, configuration.isMapUnderscoreToCamelCase());
        if (property != null && metaObject.hasSetter(property)) {
          if (resultMap.getMappedProperties().contains(property)) {
            continue;
          }
          final Class<?> propertyType = metaObject.getSetterType(property);
          if (typeHandlerRegistry.hasTypeHandler(propertyType, rsw.getJdbcType(columnName))) {
            // 获取到该字段的类型处理器
            final TypeHandler<?> typeHandler = rsw.getTypeHandler(propertyType, columnName);
            // 封装上面获取到的信息到 UnMappedColumnAutoMapping 对象中
            autoMapping.add(new UnMappedColumnAutoMapping(columnName, property, typeHandler, propertyType.isPrimitive()));
          } else {
            configuration.getAutoMappingUnknownColumnBehavior()
                .doAction(mappedStatement, columnName, property, propertyType);
          }
        } else {
          configuration.getAutoMappingUnknownColumnBehavior()
              .doAction(mappedStatement, columnName, (property != null) ? property : propertyName, null);
        }
      }
      // 写入缓存
      autoMappingsCache.put(mapKey, autoMapping);
    }
    return autoMapping;
  }
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677041902249-3969df25-3d25-4b02-9155-148e2bc0293e.png#averageHue=%233e434a&clientId=u444cdb99-bc84-4&from=paste&height=390&id=u823069b9&originHeight=488&originWidth=1883&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=91439&status=done&style=none&taskId=ua406242a-a65e-4d7e-9ee1-e4e3e499ea5&title=&width=1506.4)
我们可以看到他首先构建一个缓存Key，查询缓存中是否存在，不为空直接返回，如果为空的话，先找的未指明隐射的列名称
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677042239990-04dd681e-eefa-4701-8bf7-f86afb38721b.png#averageHue=%234f775a&clientId=u444cdb99-bc84-4&from=paste&height=623&id=ub29509a6&originHeight=779&originWidth=1875&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=270400&status=done&style=none&taskId=u986a696f-0a21-40d1-a33a-a687b79ea70&title=&width=1500)
如果隐射字段中包含该列，就向已隐射字段中添加，没有的话就向未隐射字段添加
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677042413082-78d69492-f673-4d54-902f-6e8a75f77d38.png#averageHue=%23517463&clientId=u444cdb99-bc84-4&from=paste&height=646&id=u837940ad&originHeight=807&originWidth=1800&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=237208&status=done&style=none&taskId=u320cb0d4-fd7b-45dd-8714-38d27a87c93&title=&width=1440)
如果有未隐射字段名称的话，遍历unmappedColumnNames构建UnMappedColumnAutoMapping对象添加到autoMapping集合中，返回，这里我们就不做具体分析，已前面的案例我们是做了对象关系隐射的，因此我们来看看有对象关系隐射的
## 4.2 有隐射关系
**DefaultResultSetHand**ler
```java
 private boolean applyPropertyMappings(ResultSetWrapper rsw, ResultMap resultMap, MetaObject metaObject, ResultLoaderMap lazyLoader, String columnPrefix)
      throws SQLException {
    // 获取已有关系隐射的列名
    final List<String> mappedColumnNames = rsw.getMappedColumnNames(resultMap, columnPrefix);
    boolean foundValues = false;
     // 获取属性隐射
    final List<ResultMapping> propertyMappings = resultMap.getPropertyResultMappings();
    // 遍历
     for (ResultMapping propertyMapping : propertyMappings) {
      // 获取列名
      String column = prependPrefix(propertyMapping.getColumn(), columnPrefix);
      if (propertyMapping.getNestedResultMapId() != null) {
        // the user added a column attribute to a nested result map, ignore it
        column = null;
      }
      if (propertyMapping.isCompositeResult()
          || (column != null && mappedColumnNames.contains(column.toUpperCase(Locale.ENGLISH)))
          || propertyMapping.getResultSet() != null) {
        // 调用方法获取结果
        Object value = getPropertyMappingValue(rsw.getResultSet(), metaObject, propertyMapping, lazyLoader, columnPrefix);
        // issue #541 make property optional
        final String property = propertyMapping.getProperty();
        if (property == null) {
          continue;
        } else if (value == DEFERRED) {
          foundValues = true;
          continue;
        }
        if (value != null) {
          foundValues = true;
        }
        if (value != null || (configuration.isCallSettersOnNulls() && !metaObject.getSetterType(property).isPrimitive())) {
          // gcode issue #377, call setter on nulls (value is not 'found')
          metaObject.setValue(property, value);
        }
      }
    }
    return foundValues;
  }
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677042941525-a59f33f8-90d4-4bad-a409-a2cb2b352d83.png#averageHue=%23567a60&clientId=u444cdb99-bc84-4&from=paste&height=666&id=ud435ac2f&originHeight=833&originWidth=1876&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=242492&status=done&style=none&taskId=u60d79b79-26b5-481f-a009-5040081fbd1&title=&width=1500.8)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677042969294-85a71bd8-34d1-4f5c-8dc0-d0769560a4e5.png#averageHue=%234d5554&clientId=u444cdb99-bc84-4&from=paste&height=654&id=u34ea9b5c&originHeight=818&originWidth=1896&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=272719&status=done&style=none&taskId=u4887bc69-f07d-408d-b3e6-5583197114c&title=&width=1516.8)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677043121229-85f17b21-57e2-410b-99ad-b9fdb189fbab.png#averageHue=%234e7657&clientId=u444cdb99-bc84-4&from=paste&height=590&id=u881afba7&originHeight=738&originWidth=1847&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=189924&status=done&style=none&taskId=u8c585ab8-21f7-4777-ba18-134420ea9b8&title=&width=1477.6)
```java
private Object getPropertyMappingValue(ResultSet rs, MetaObject metaResultObject, ResultMapping propertyMapping, ResultLoaderMap lazyLoader, String columnPrefix)
      throws SQLException {
    //是否具有嵌套关系
    if (propertyMapping.getNestedQueryId() != null) {
      return getNestedQueryMappingValue(rs, metaResultObject, propertyMapping, lazyLoader, columnPrefix);
    }

    else if (propertyMapping.getResultSet() != null) {
      addPendingChildRelation(rs, metaResultObject, propertyMapping);   // TODO is that OK?
      return DEFERRED;
    } else {
      // 获取属性的对应的处理器
      final TypeHandler<?> typeHandler = propertyMapping.getTypeHandler();
      // 列名
      final String column = prependPrefix(propertyMapping.getColumn(), columnPrefix);
        // 获取结果
      return typeHandler.getResult(rs, column);
    }
  }
```
这里我们以id列为案例，首先获取他的对应的处理器，他的类型是Integer
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677043341768-0edf6c9a-998c-40f6-9ec2-d9764d624801.png#averageHue=%23445a44&clientId=u444cdb99-bc84-4&from=paste&height=356&id=uc82ba282&originHeight=445&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=101986&status=done&style=none&taskId=u38ebe32c-07da-4214-94b0-bd59357371d&title=&width=1536)
根据Integer类型调用getResult方法从ResultSet中获取结果，完成对应关系的转换
**IntegerTypeHandler**
```java
  @Override
  public Integer getNullableResult(ResultSet rs, String columnName)
      throws SQLException {
    int result = rs.getInt(columnName);
    return result == 0 && rs.wasNull() ? null : result;
  }
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677043490817-b9aff0ea-a533-4878-a60b-73293a8aa8af.png#averageHue=%23545949&clientId=u444cdb99-bc84-4&from=paste&height=516&id=u678e87b8&originHeight=645&originWidth=1843&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=160215&status=done&style=none&taskId=ua1b24cd1-ccc5-47f3-b8d7-b9ff237939c&title=&width=1474.4)
这里与我们使用Jdbc一样根据不同的类型获取结果，到这我们的解析就已经完成了，解析来就是通过遍历各个字段名称，调用不同的处理器完成值的设置，当然这里涉及到单个结果集的分析，没有嵌套结果集的分析处理，后面有时间会整理


