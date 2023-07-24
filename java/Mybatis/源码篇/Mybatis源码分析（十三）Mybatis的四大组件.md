---
title: Mybatis源码分析（十三）Mybatis的四大组件
sidebar_position: 15
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


![P2110011.JPG](https://cdn.nlark.com/yuque/0/2023/jpeg/12426173/1677548039823-8d07aa56-38f6-4f75-b66b-2814065c4a98.jpeg?x-oss-process=image/auto-orient,1#averageHue=%23666b60&clientId=u2f4e7e8d-1abb-4&from=ui&id=u576b57aa&originHeight=5184&originWidth=3888&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=9454649&status=done&style=none&taskId=u3bc19d7c-ee54-45b3-bc7e-c05e2dea2e9&title=)


- 官网：[mybatis – MyBatis 3 | 简介](https://mybatis.org/mybatis-3/zh/index.html)
> 学习到的知识

:::info

1. Mybatis的四大核心组件
2. 设计模式的应用
:::

---


---

前面我们基本的流程都已经介绍完毕，下面我们来梳理一下前面的知识，加深自己的理解，以及重复记忆
![](https://cdn.nlark.com/yuque/0/2023/jpeg/12426173/1677549035609-5a0fdfc3-8a2e-446a-8bd3-19305d650d44.jpeg)
下面我们以代码和原理的方式来解读这些组件，首先我们来介绍Mybatis中重要组件执行器Executor
# 一 Executor
![7fb19d8cb61494b4b17d6f74c8dd5611_webp.webp](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1677549111273-7af7c018-3a6d-4a13-b8f8-65977c16b439.webp#averageHue=%23eff2ec&clientId=ubf3ca0ab-2490-4&from=paste&height=450&id=u52a88852&originHeight=563&originWidth=1200&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=210528&status=done&style=none&taskId=u22bb5d75-6b3b-4455-a030-1c53093d38f&title=&width=960)

- Executor是Mybatis执行者接口，他包含的功能有：基本功能:改、查，没有增删是因为所有的增删操作都可以归结为改。
- 缓存维护：包括创建缓存Key、清理缓存、判断缓存是否存在。
- 事务管理：提交、回滚、关闭、批处理刷新。
- Executor有6个实现类，这里先介绍三个重要的实现子类看了，分别是：SimpleExecutor(简单执行器)、ReuseExecutor(重用执行器)、BatchExecutor(批处理执行器)。

首先我们来看看类结果图
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677597632355-1f289fd6-a2f6-4264-b0ee-e1e4b6dff500.png#averageHue=%232c2c2c&clientId=ua45616ca-6852-4&from=paste&height=451&id=u7fdbe19b&originHeight=564&originWidth=1153&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=17613&status=done&style=none&taskId=u8e301871-5a1c-4565-96dd-a39c8b7e466&title=&width=922.4)
> 💯💯接口方法

```java

  // 数据更新操作，其中数据的增加、删除、更新均可由该方法实现
  int update(MappedStatement ms, Object parameter) throws SQLException;
  // 数据查询操作，返回结果为列表形式
  <E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, CacheKey cacheKey, BoundSql boundSql) throws SQLException;
  // 数据查询操作，返回结果为列表形式
  <E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler) throws SQLException;
  // 数据查询操作，返回结果为游标形式
  <E> Cursor<E> queryCursor(MappedStatement ms, Object parameter, RowBounds rowBounds) throws SQLException;
  // 清理缓存
  List<BatchResult> flushStatements() throws SQLException;
  // 提交事务
  void commit(boolean required) throws SQLException;
  // 回滚事务
  void rollback(boolean required) throws SQLException;
  // 创建当前查询的缓存键值
  CacheKey createCacheKey(MappedStatement ms, Object parameterObject, RowBounds rowBounds, BoundSql boundSql);
  // 本地缓存是否有指定值
  boolean isCached(MappedStatement ms, CacheKey key);
  // 清理本地缓存
  void clearLocalCache();
  // 懒加载
  void deferLoad(MappedStatement ms, MetaObject resultObject, String property, CacheKey key, Class<?> targetType);
  // 获取事务
  Transaction getTransaction();
  // 关闭执行器
  void close(boolean forceRollback);
  // 判断执行器是否关闭
  boolean isClosed();
  // 设置执行器包装
  void setExecutorWrapper(Executor executor);

```
下面我们从案例入门来讲解几种不同的执行器，首先我们完成基本信息的初始化
> 📌📌案例

测试类中的初始化操作，完成配置文件的解析，构建会话工厂等等信息
```java
    SqlSessionFactory sqlSessionFactory;
    Configuration configuration;
    JdbcTransaction jdbcTransaction;
    MappedStatement mappedStatement;


    @BeforeEach
    public void init() {
        // 1.获取构建器
        SqlSessionFactoryBuilder factoryBuilder = new SqlSessionFactoryBuilder();
        // 2.获取配置文件的流信息
        InputStream resourceAsStream = MybatisDemo02ApplicationTests.class.getResourceAsStream("/mybatis-config.xml");
        // 3.解析XML 并构造会话工厂
         sqlSessionFactory = factoryBuilder.build(resourceAsStream);
        // 4.获取工厂配置
         configuration = sqlSessionFactory.getConfiguration();
        // 5.构建jdbc事务
         jdbcTransaction = new JdbcTransaction(sqlSessionFactory.openSession().getConnection());
        // 6.获取Mapper映射
         mappedStatement = configuration.getMappedStatement("com.shu.UserMapper.queryById");
    }

```
在单元测试之中 @BeforeEach，完成对SqlSessionFactoryBuilder，Configuration，JdbcTransaction，MappedStatement的初始化，下面我们只关注于执行器的变化，使用方式，以及比较的不同
## 1.1 SimpleExecutor
Mybatis默认的执行器，它每处理一次会话当中的sql请求都会通过StatementHandler构建一个新的statment。这个是默认的执行器，很简单，首先让我们来开启日志打印，可以详细的看到不同执行器的执行情况
> 👳👳配置

配置文件中开启日志打印
```java
<settings>
        <!-- 打印sql日志 -->
        <setting name="logImpl" value="STDOUT_LOGGING" />
    </settings>

```
> 👀👀测试代码

```java
	@Test//简单执行器
    public void simpleTest() throws SQLException {
        // 创建一个简单的执行器
        SimpleExecutor simpleExecutor = new SimpleExecutor(configuration, jdbcTransaction);
        log.info("执行器类型：{}", simpleExecutor.getClass().getName());
        // 执行查询
        List<Object> query = simpleExecutor.doQuery(mappedStatement, 1, RowBounds.DEFAULT, SimpleExecutor.NO_RESULT_HANDLER, mappedStatement.getBoundSql(1));
        log.info("查询结果：{}", query);
    }
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677552827261-f7b7198a-99e5-4340-a970-7d2fd44b2a5c.png#averageHue=%23332f2e&clientId=ubf3ca0ab-2490-4&from=paste&height=222&id=u6132d9c6&originHeight=277&originWidth=1845&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=71062&status=done&style=none&taskId=u03240e96-f422-4712-aad1-b9ba85242ec&title=&width=1476)
我们可以看到执行结果的返回
> 🚀🚀分析

前面的初始化流程，以及会话工厂的创建，请参考前面的内容，我们这里详细解释执行器，首先我们来看看SimpleExecutor的创建
**SimpleExecutor**
```java
// 构造器
public SimpleExecutor(Configuration configuration, Transaction transaction) {
    super(configuration, transaction);
  }
```
我们可以看到他调用了父类的方法，因此我们来看看他的父类BaseExecutor
**BaseExecutor**
```java
 protected BaseExecutor(Configuration configuration, Transaction transaction) {
    this.transaction = transaction;
    this.deferredLoads = new ConcurrentLinkedQueue<>();
     // 初始化本地缓存，实际上内部维护了一个HashMap
    this.localCache = new PerpetualCache("LocalCache");
    this.localOutputParameterCache = new PerpetualCache("LocalOutputParameterCache");
    this.closed = false;
    this.configuration = configuration;
    this.wrapper = this;
  }
```
下面调用具体的调用方法，doQuery，下面我们只介绍相关步骤，具体的流程前参考前面的文章
**SimpleExecutor**
```java
 @Override
  public <E> List<E> doQuery(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) throws SQLException {
    Statement stmt = null;
    try {
      // 获取我们解析好的配置文件
      Configuration configuration = ms.getConfiguration();
      // 创建一个隐射处理器
      StatementHandler handler = configuration.newStatementHandler(wrapper, ms, parameter, rowBounds, resultHandler, boundSql);
      // 参数预处理
      stmt = prepareStatement(handler, ms.getStatementLog());
      // 具体执行
      return handler.query(stmt, resultHandler);
    } finally {
      closeStatement(stmt);
    }
  }
```
有兴趣的话，自己去通过源码调试获取结果，或者参考前面的文章
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677553644460-6615b5f4-9bb1-42a5-a3f3-e45182e57298.png#averageHue=%235e7569&clientId=ubf3ca0ab-2490-4&from=paste&height=662&id=u711ab0a1&originHeight=828&originWidth=1811&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=202784&status=done&style=none&taskId=uf54ea66b-6f5b-46b2-bed0-d060128fc4f&title=&width=1448.8)
> 🐬🐬总结

SimpleExecutor 继承了 BaseExecutor 抽象类 它是最简单的 Executor 接口实现。Executor 使用了模板方法模式，一级缓存等固定不变的操作都封装到了 BaseExecutor 中，在SimpleExecutor 中就不必再关系一级缓存等操作，只需要专注实现4个基本方法的实现即可。
## 1.2 ReuseExecutor
可重用执行器，内部维护了一个statementMap来记录我们的执行语句，来减少语句的预编译，直观的效果就是，同一次查询，sql预编译了一次，减少Sql的预编译，在一定程度上提高了效率
> 👀👀测试代码

```java
    @Test//重用执行器
    public void reuseTest() throws SQLException {
        // 创建一个重用执行器
        ReuseExecutor reuseExecutor = new ReuseExecutor(configuration, jdbcTransaction);
        log.info("执行器类型：{}", reuseExecutor.getClass().getName());
        // 执行查询
        List<Object> query = reuseExecutor.doQuery(mappedStatement, 1, RowBounds.DEFAULT, SimpleExecutor.NO_RESULT_HANDLER, mappedStatement.getBoundSql(1));
        log.info("查询结果：{}", query);
        // 执行查询
        List<Object> query2 = reuseExecutor.doQuery(mappedStatement, 1, RowBounds.DEFAULT, SimpleExecutor.NO_RESULT_HANDLER, mappedStatement.getBoundSql(1));
        log.info("查询结果：{}", query2);
    }
```
仔细观察结果，我们可以发现它的Sql预编译了一次
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677554253817-1e0fb9c5-da4a-46d5-938d-f38a585bce25.png#averageHue=%23342e2d&clientId=ubf3ca0ab-2490-4&from=paste&height=378&id=u7c087208&originHeight=473&originWidth=1839&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=114181&status=done&style=none&taskId=u4aeda7c5-1136-4ccc-95a2-98cda387739&title=&width=1471.2)
我们来看看为啥只执行了一次，他的原因是啥？
> 🚀🚀分析

**ReuseExecutor**
```java
// 缓存的编译Sql
private final Map<String, Statement> statementMap = new HashMap<>();

// 预处理参数
private Statement prepareStatement(StatementHandler handler, Log statementLog) throws SQLException {
    Statement stmt;
    BoundSql boundSql = handler.getBoundSql();
    String sql = boundSql.getSql();
    // 查询下缓存中是否存在，Sql语句作为Key,查询是否以及与编译过了
    if (hasStatementFor(sql)) {
       // 获取一编译语句
      stmt = getStatement(sql);
        // 更新查询超时以应用事务超时。
      applyTransactionTimeout(stmt);
    } else {
      Connection connection = getConnection(statementLog);
      stmt = handler.prepare(connection, transaction.getTimeout());
      // 添加到缓存
      putStatement(sql, stmt);
    }
    handler.parameterize(stmt);
    return stmt;
  }



  private void putStatement(String sql, Statement stmt) {
    statementMap.put(sql, stmt);
  }

```
简单来说：就是内部维护了一个HashMap作为缓存，每次先去缓存中查询一下是否存在，存在就直接返回，没有的话，就在执行预编译，好了再次缓存，以便下次使用
> 🚀🚀总结

重用执行器，相较于 SimpleExecutor 多了 Statement 的缓存功能，其内部维护一个 Map<String, Statement>，每次编译完成的 Statement 都会进行缓存，不会关闭
## 1.3 BatchExecutor
首先需要明确一点 BachExecutor 是基于 JDBC 的 addBatch、executeBatch 功能的执行器，所以 BachExecutor 只能用于更新（insert|delete|update），不能用于查询（select）
> 👀👀测试代码

```java
    @Test//批量执行器
    public void batchTest() throws SQLException {
        // 创建一个批量执行器
        BatchExecutor batchExecutor = new BatchExecutor(configuration, jdbcTransaction);
        log.info("执行器类型：{}", batchExecutor.getClass().getName());
        // 执行插入
        for (int i = 0; i < 10; i++) {
            int update = batchExecutor.doUpdate(mappedStatement, new User(1, "张三", "18", 1 + i, 2, "123456"));
        }
    	// 刷新批处理
        batchExecutor.doFlushStatements(true);
    }

```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677598972645-6f725732-7eaf-44f8-895f-c29f8d5dfb2d.png#averageHue=%23323130&clientId=ua45616ca-6852-4&from=paste&height=343&id=u00626355&originHeight=429&originWidth=1838&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=136088&status=done&style=none&taskId=u5dd24cd6-b89a-48f5-905f-5c2a8357864&title=&width=1470.4)
我们来看看的他的执行原理，批量执行，其实依赖于JDBC 的 addBatch、executeBatch
**BatchExecutor**
```java
public class BatchExecutor extends BaseExecutor {

  public static final int BATCH_UPDATE_RETURN_VALUE = Integer.MIN_VALUE + 1002;

  /* Statement链表**/
  private final List<Statement> statementList = new ArrayList<Statement>();

  /* batch结果链表**/
  private final List<BatchResult> batchResultList = new ArrayList<BatchResult>();
  private String currentSql;
  private MappedStatement currentStatement;

  public BatchExecutor(Configuration configuration, Transaction transaction) {
    super(configuration, transaction);
  }

 // 更新方法
  @Override
  public int doUpdate(MappedStatement ms, Object parameterObject) throws SQLException {
	//获得配置信息
    final Configuration configuration = ms.getConfiguration();
	//获得StatementHandler
    final StatementHandler handler = configuration.newStatementHandler(this, ms, parameterObject, RowBounds.DEFAULT, null, null);
    final BoundSql boundSql = handler.getBoundSql();
	//获得Sql语句
    final String sql = boundSql.getSql();
    final Statement stmt;
	//如果sql语句等于当前sql MappedStatement 等于当前Map碰到Statement
    if (sql.equals(currentSql) && ms.equals(currentStatement)) {

      int last = statementList.size() - 1;
	  //获得最后一个
      stmt = statementList.get(last);
	  handler.parameterize(stmt);//fix Issues 322
	  //有相同的MappedStatement和参数
      BatchResult batchResult = batchResultList.get(last);
      batchResult.addParameterObject(parameterObject);
    } else {
	  //如果不存在就创建一个批处理操作
      Connection connection = getConnection(ms.getStatementLog());
      stmt = handler.prepare(connection);
      handler.parameterize(stmt);    //fix Issues 322
      currentSql = sql;
      currentStatement = ms;
	  //添加批量处理操作
      statementList.add(stmt);
      batchResultList.add(new BatchResult(ms, sql, parameterObject));
    }
  // handler.parameterize(stmt);
    //最终是调用jdbc的批处理操作
    handler.batch(stmt);
    return BATCH_UPDATE_RETURN_VALUE;
  }

  @Override
  public <E> List<E> doQuery(MappedStatement ms, Object parameterObject, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql)
      throws SQLException {
    Statement stmt = null;
    try {
      flushStatements();
	  //获得配置信息
      Configuration configuration = ms.getConfiguration();
	  //获得StatementHandler
      StatementHandler handler = configuration.newStatementHandler(wrapper, ms, parameterObject, rowBounds, resultHandler, boundSql);
	  //获得连接
      Connection connection = getConnection(ms.getStatementLog());
      stmt = handler.prepare(connection);
	  //获得Statement
      handler.parameterize(stmt);
      return handler.<E>query(stmt, resultHandler);
    } finally {
      closeStatement(stmt);
    }
  }

  /* 刷新Statement，记录执行次数*/
  @Override
  public List<BatchResult> doFlushStatements(boolean isRollback) throws SQLException {
    try {
      List<BatchResult> results = new ArrayList<BatchResult>();
      if (isRollback) {
        return Collections.emptyList();
      }
	  //如果进行了批量处理
      for (int i = 0, n = statementList.size(); i < n; i++) {
        Statement stmt = statementList.get(i);
        BatchResult batchResult = batchResultList.get(i);
        try {
		  //记录批量处理执行操作的条数
          batchResult.setUpdateCounts(stmt.executeBatch());
          MappedStatement ms = batchResult.getMappedStatement();
		  //参数对象集合
          List<Object> parameterObjects = batchResult.getParameterObjects();
		  //生成key
          KeyGenerator keyGenerator = ms.getKeyGenerator();
          if (Jdbc3KeyGenerator.class.equals(keyGenerator.getClass())) {
            Jdbc3KeyGenerator jdbc3KeyGenerator = (Jdbc3KeyGenerator) keyGenerator;
            jdbc3KeyGenerator.processBatch(ms, stmt, parameterObjects);
          } else if (!NoKeyGenerator.class.equals(keyGenerator.getClass())) { //issue #141
            for (Object parameter : parameterObjects) {
              keyGenerator.processAfter(this, ms, stmt, parameter);
            }
          }
        } catch (BatchUpdateException e) {
          StringBuilder message = new StringBuilder();
          message.append(batchResult.getMappedStatement().getId())
              .append(" (batch index #")
              .append(i + 1)
              .append(")")
              .append(" failed.");
          if (i > 0) {
            message.append(" ")
                .append(i)
                .append(" prior sub executor(s) completed successfully, but will be rolled back.");
          }
          throw new BatchExecutorException(message.toString(), e, results, batchResult);
        }
		//记录操作
        results.add(batchResult);
      }
      return results;
    } finally {
      for (Statement stmt : statementList) {
        closeStatement(stmt);
      }
      currentSql = null;
      statementList.clear();
      batchResultList.clear();
    }
  }

}
```
> 🚀🚀总结

BatchExecutor 的批处理添加过程相当于添加了一个没有返回值的**异步任务**，那么在什么时候执行异步任务，将数据更新到数据库呢，答案是处理 update 的任何操作，包括 select、commit、close等任何操作，具体执行的方法就是 **doFlushStatements**；**此外需要注意的是 Batch 方式插入使用 useGeneratedKeys 获取主键，在提交完任务之后，并不能马上取到，因为此时 sql 语句还在缓存中没有真正执行，当执行完 Flush 之后，会通过回调的方式反射设置主键**
## 1.4 效率对比
几种执行器效率对比

| 数据量 | **batch** | **Reuser** | **simple** | **foreach** | **foreach100** |
| --- | --- | --- | --- | --- | --- |
| 100 | 369 | 148 | 151 | 68 | 70 |
| 1000 | 485 | 735 | 911 | 679 | 148 |
| 10000 | 2745 | 4064 | 4666 | 38607 | 1002 |
| 50000 | 8838 | 17788 | 19907 | 796444 | 3703 |

从上面的结果对比可以看到：

- 整体而言 reuser 比 simple 多了缓存功能，所以无论批处理的大小，其效率都要高一些。
- 此外在批处理量小的时候使用 foreach，效果还是可以的，但是当批量交大时，sql 编译的时间就大大增加了，当 foreach 固定批大小 + reuser 时，每次的 Statement 就可以重用，从表中也可以看到效率也时最高的。
- batch 的优点则是所有的更新语句都能用。
- 所以在配置的时候建议默认使用 reuser，而使用 foreach 和 batch 需要根据具体场景分析，如果更新比较多的时候，可以在批量更新的时候单独指定 ExecutorType.BATCH，如果批量插入很多的时候，可以固定批大小。
## 1.5 BaseExecutor
首先Mybatis默认开启一级缓存，其次，执行器的设计分层遵循了软件设计的 **单一职责** 原则。BaseExecutor 只管理一级缓存，而具体的数据库交互逻辑，是交由更低层的三个执行器处理的(Simple/Reuse/Batch)。
**BaseExecutor**
```java
  protected BaseExecutor(Configuration configuration, Transaction transaction) {
    // 事物对象
    this.transaction = transaction;
    // 延迟加载队列
    this.deferredLoads = new ConcurrentLinkedQueue<>();
    // 一级缓存
    this.localCache = new PerpetualCache("LocalCache");
    // 本地输出参数缓存
    this.localOutputParameterCache = new PerpetualCache("LocalOutputParameterCache");
    // 执行器状态标识对象
    this.closed = false;
    // mybatis 配置对象
    this.configuration = configuration;
    this.wrapper = this;
  }
```
我们可以通过源码可以发现，PerpetualCache实际上对HashMap的封装
```java
public class PerpetualCache implements Cache {
  // Cache的id，一般为所在的namespace
  private final String id;
  // 用来存储要缓存的信息
  private Map<Object, Object> cache = new HashMap<>();

  public PerpetualCache(String id) {
    this.id = id;
  }
}
```
我们来看看查询方法，根据Sql，参数等信息，生成缓存Key在本地缓存中查询是否存在，如果命中，直接返回对象，没有的话，进行数据库查询，将结果写入到缓存中
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


	/**
   * 执行查询操作
   * @param ms 映射语句对象
   * @param parameter 参数对象
   * @param rowBounds 翻页限制
   * @param resultHandler 结果处理器
   * @param <E> 输出结果类型
   * @return 查询结果
   * @throws SQLException
   */
  @Override
  public <E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler) throws SQLException {
    BoundSql boundSql = ms.getBoundSql(parameter);
    // 生成缓存的键
    CacheKey key = createCacheKey(ms, parameter, rowBounds, boundSql);
    return query(ms, parameter, rowBounds, resultHandler, key, boundSql);
  }

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
详细的内容，前参考前面的一级缓存与二级缓存
> 🚀🚀总结

- BaseExecutor 处于 mybatis 执行器体系的中间层。其设计与实现遵循了 **单一职责** 原则。具体体现在 baseExecutor 主要聚焦在处理一级缓存的逻辑上，而与数据库交互的具体实现依赖于另外三个底层执行器(simple/reuse/batch)。
- 一级缓存默认是开启的，作用域默认会话层级(session)。任意更新操作都会清空一级缓存中的所有数据。一级缓存有一个 mybatis 的自定义实现类
- 影响一级缓存命中的因素有namespaceid，mybatis 分页参数 limit/offset，sql，sql 入参，mybatis 环境配置参数
## 1.6 CachingExecutor
CachingExecutor的成员变量有个Executor实例，这显然是个装饰器模式，这的类就是在其他Executor实例的方法进行了flushCacheIfRequired(),也就是刷新缓存，所以这个类在其他类上添加了缓存的功能，从query()方法中也能看出先查找缓存，缓存没有再进行调用Executor实例的query()进行数据的查询，首先我们是否开启二级缓存，如果开启了二级缓存，首先会从二级缓存中获取数据
```java
  <cache/>
```
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
**TransactionalCacheManager**
```java
public class TransactionalCacheManager {

  // 管理多个缓存的映射
  private final Map<Cache, TransactionalCache> transactionalCaches = new HashMap<>();
}
```
**TransactionalCache**
```java
public class TransactionalCache implements Cache {

  private static final Log log = LogFactory.getLog(TransactionalCache.class);

  // 被装饰的对象
  private final Cache delegate;
  // 事务提交后是否直接清理缓存
  private boolean clearOnCommit;
  // 事务提交时需要写入缓存的数据
  private final Map<Object, Object> entriesToAddOnCommit;
  // 缓存查询未命中的数据
  private final Set<Object> entriesMissedInCache;

  public TransactionalCache(Cache delegate) {
    this.delegate = delegate;
    this.clearOnCommit = false;
    this.entriesToAddOnCommit = new HashMap<>();
    this.entriesMissedInCache = new HashSet<>();
  }
}
```
实际上二级缓存的实现调用了事务管理器的TransactionalCacheManager进行管理，从源码上看实际上维护了一个TransactionalCache中的HashMap来管理。具体的内容请参考前面的二级缓存
> 🚀🚀总结

存储二级缓存对象的时候是放到TransactionalCache.entriesToAddOnCommit这个map中，但是每次查询的时候是直接从TransactionalCache.delegate中去查询的，所以这个二级缓存查询数据库后，设置缓存值是没有立刻生效的，主要是因为直接存到 delegate 会导致脏数据问题。

上一篇文章我们梳理了执行器的基本原理，下面我们来看看ParameterHandler处理器的基本作用，StatementHandler 是四大组件中最重要的一个对象，负责操作 Statement 对象与数据库进行交流，在工作时还会使用 ParameterHandler 和 ResultSetHandler 对参数进行映射，对结果进行实体类的绑定
# 二 StatementHandler
首先我们来看看类图：
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677841577704-b1af9ba2-d4ac-45fc-9e2f-9a299c0bca39.png#averageHue=%232e2e2e&clientId=u9334edd5-3674-4&from=paste&height=538&id=udfa96c04&originHeight=672&originWidth=1410&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=34305&status=done&style=none&taskId=u59b38d73-3437-46a2-8da4-2ce01e9028f&title=&width=1128)
我们再来看看他的接口方法：
**StatementHandler**
```java
public interface StatementHandler {

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

}
```
根据上面的类图结果，我们可以发现他的结构体系与Exector相似，分别有两个实现类 BaseStatementHandler 和 RoutingStatementHandler，BaseStatementHandler 有三个实现类, 他们分别是 SimpleStatementHandler、PreparedStatementHandler 和 CallableStatementHandler。

- RoutingStatementHandler: RoutingStatementHandler 并没有对 Statement 对象进行使用，只是根据StatementType 来创建一个代理，代理的就是对应Handler的三种实现类。在MyBatis工作时,使用的StatementHandler 接口对象实际上就是 RoutingStatementHandler 对象。
- BaseStatementHandler: 是 StatementHandler 接口的另一个实现类.本身是一个抽象类.用于简化StatementHandler 接口实现的难度,属于适配器设计模式体现，它主要有三个实现类
- SimpleStatementHandler: 管理 Statement 对象并向数据库中推送不需要预编译的SQL语句。
- PreparedStatementHandler: 管理 Statement 对象并向数据中推送需要预编译的SQL语句。
- CallableStatementHandler：管理 Statement 对象并调用数据库中的存储过程。
## 2.1 RoutingStatementHandler
让我们回到当调用执行器的DoUpdate方法，通过Configuration来创建一个隐射语句处理器关键代码：
**SimpleExecutor**
```java

  @Override
  public int doUpdate(MappedStatement ms, Object parameter) throws SQLException {
    Statement stmt = null;
    try {
       // 获取解析好的配置文件
      Configuration configuration = ms.getConfiguration();
        // 获取一个处理器对象
      StatementHandler handler = configuration.newStatementHandler(this, ms, parameter, RowBounds.DEFAULT, null, null);
       // 调用处理器的方法返回一个 Statement
      stmt = prepareStatement(handler, ms.getStatementLog());
      return handler.update(stmt);
    } finally {
      closeStatement(stmt);
    }
  }
```
好的我们看到了关键代码，我们下面看看：
**Configuration**
```java
  public StatementHandler newStatementHandler(Executor executor, MappedStatement mappedStatement, Object parameterObject, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) {
       //  策越模式
      StatementHandler statementHandler = new RoutingStatementHandler(executor, mappedStatement, parameterObject, rowBounds, resultHandler, boundSql);
      //  插件
      statementHandler = (StatementHandler) interceptorChain.pluginAll(statementHandler);
    return statementHandler;
  }

```
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
然后根据我们配置文件中的类型，来创建不同的对象返回，当然默认值为PREPARED一个需要预编译的Sql
> 🌈🌈总结

RoutingStatementHandler的作用十分简单，充当一个分发的角色，有不同的类型返回不对的对象，来执行
## 2.2 BaseStatementHandler
要定义了从Connection中获取Statement的方法，而对于具体的Statement操作则未定义，主要采用适配器模式来实现，下面我们来看看调用过程吧，首先是构造器实例化
在这其中初始化了后面的两大重要组件：ParameterHandler与ResultSetHandler，具体的实现我们后面再看
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
我们再来梳理一下Jdbc的执行流程：

1. 从Connection获取一个Statement
2. 为Statement设置参数

那我们来看看他是怎样获取的一个Statement的？
**BaseStatementHandler**
```java
  // 从连接中获取一个Statement，并设置事务超时时间
  @Override
  public Statement prepare(Connection connection, Integer transactionTimeout) throws SQLException {
    ErrorContext.instance().sql(boundSql.getSql());
    Statement statement = null;
    try {
       // 实际上他还是调用他的实现类类
      statement = instantiateStatement(connection);
      //  设置超时时间
      setStatementTimeout(statement, transactionTimeout);
       // 读取大小
      setFetchSize(statement);
      return statement;
    } catch (SQLException e) {
      closeStatement(statement);
      throw e;
    } catch (Exception e) {
      closeStatement(statement);
      throw new ExecutorException("Error preparing statement.  Cause: " + e, e);
    }
  }

  // 从Connection中实例化Statement
  protected abstract Statement instantiateStatement(Connection connection) throws SQLException;
```
到这就可能设计到驱动包的源码的知识，这部分我们不会多讲，我们只是梳理Mybatis的执行过程，下面我们PreparedStatementHandler以基本的案例为例
**PreparedStatementHandler**
```java
  @Override
  protected Statement instantiateStatement(Connection connection) throws SQLException {
    String sql = boundSql.getSql();
     // 自增主键
    if (mappedStatement.getKeyGenerator() instanceof Jdbc3KeyGenerator) {
      String[] keyColumnNames = mappedStatement.getKeyColumns();
      if (keyColumnNames == null) {
         // 调用
        return connection.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS);
      } else {
        return connection.prepareStatement(sql, keyColumnNames);
      }
    } else if (mappedStatement.getResultSetType() == ResultSetType.DEFAULT) {
      return connection.prepareStatement(sql);
    } else {
      return connection.prepareStatement(sql, mappedStatement.getResultSetType().getValue(), ResultSet.CONCUR_READ_ONLY);
    }
  }
```
下面的流程就是从连接对象中预处理对象。具体的逻辑请参考前面的逻辑分析
> 🌈🌈总结

简单描述一下update 方法的执行过程：

1. MyBatis 接收到 update 请求后会先找到 CachingExecutor 缓存执行器查询是否需要刷新缓存，然后找到BaseExecutor 执行 update 方法；
2. BaseExecutor 基础执行器会清空一级缓存，然后交给再根据执行器的类型找到对应的执行器，继续执行 update 方法；
3. 具体的执行器会先创建 Configuration 对象，根据 Configuration 对象调用 newStatementHandler 方法，返回 statementHandler 的句柄；
4. 具体的执行器会调用 prepareStatement 方法，找到本类的 prepareStatement 方法后，再有prepareStatement 方法调用 StatementHandler 的子类 BaseStatementHandler 中的 prepare 方法
5. BaseStatementHandler 中的 prepare 方法会调用 instantiateStatement 实例化具体的 Statement 对象并返回给具体的执行器对象
6. 由具体的执行器对象调用 parameterize 方法给参数进行赋值。
# 三 ParameterHandler
上面我们介绍了StatementHandler 组件最主要的作用在于创建 Statement 对象与数据库进行交流，还会使用 ParameterHandler 进行参数配置，使用 ResultSetHandler 把查询结果与实体类进行绑定。
## 3.1 ParameterHandler
**ParameterHandler**
```java
public interface ParameterHandler {

  // 获取参数对象
  Object getParameterObject();

  // 设置参数对象
  void setParameters(PreparedStatement ps)
      throws SQLException;
}

```
下面我们来看看他的实现类，注意ParameterHandler的创建时机在BaseStatementHandler的初始化的时候
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677853922776-8b1be0a2-2ac1-4ecb-8ea3-374a00d64dd2.png#averageHue=%232c2c2c&clientId=uccdb3f14-c9a7-4&from=paste&height=386&id=ub1457976&originHeight=482&originWidth=871&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=9212&status=done&style=none&taskId=u27f6fe20-3f06-4d58-b5b6-97b3bb8d32b&title=&width=696.8)
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
总的来说，其实很简单，通过我们传入的参数，找对应的参数处理器，设置参数
# 四 ResultSetHandler

- 终于到了最后一个组件，我们想一想在我们使用Jdbc的时候，在执行预处理语句之后返回的并不是我们想要的结果，我们需要自己来选择返回什么类型的结果，而Mybatis中采用ResultSetHandler来解析我们想要的结果。
- 首先会经过 Executor 执行器，它主要负责管理创建 StatementHandler 对象，然后由 StatementHandler 对象做数据库的连接以及生成 Statement 对象，并解析 SQL 参数，由 ParameterHandler 对象负责把 Mapper 方法中的参数映射到 XML 中的 SQL 语句中，那么是不是还少了一个步骤，就能完成一个完整的 SQL 请求了？没错，这最后一步就是 SQL 结果集的处理工作，也就是 ResultSetHandler 的主要工作
## 4.1 ResultSetHandler
首先我们来看看接口方法，而他的实现类与ParameterHandler一样，只有一个默认的实现类DefaultResultSetHandler
**ResultSetHandler**
```java
public interface ResultSetHandler {

  // 将Statement的执行结果处理为List
  <E> List<E> handleResultSets(Statement stmt) throws SQLException;

  // 将Statement的执行结果处理为Map
  <E> Cursor<E> handleCursorResultSets(Statement stmt) throws SQLException;

  // 处理存储过程的输出结果
  void handleOutputParameters(CallableStatement cs) throws SQLException;

}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677897670516-b7c86d62-d23f-4f6b-99f3-10eb42ef42d6.png#averageHue=%232d2c2c&clientId=u9f0e7b0a-53af-4&from=paste&height=296&id=u4db0748c&originHeight=370&originWidth=980&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=14875&status=done&style=none&taskId=u0e8db670-f697-4a30-b990-e281373fbd9&title=&width=784)
> 🚀🚀初始化

与上面一样ResultSetHandler的初始化在BaseStatementHandler的构造器中完成
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
	// 初始化参数处理器
    this.parameterHandler = configuration.newParameterHandler(mappedStatement, parameterObject, boundSql);
    // 初始化结果处理器
    this.resultSetHandler = configuration.newResultSetHandler(executor, mappedStatement, rowBounds, parameterHandler, resultHandler, boundSql);
  }
```
**Configuration**
```java
  public ResultSetHandler newResultSetHandler(Executor executor, MappedStatement mappedStatement, RowBounds rowBounds, ParameterHandler parameterHandler,
      ResultHandler resultHandler, BoundSql boundSql) {
    // 创建结果处理器
    ResultSetHandler resultSetHandler = new DefaultResultSetHandler(executor, mappedStatement, parameterHandler, resultHandler, boundSql, rowBounds);
    // 插件过滤链
    resultSetHandler = (ResultSetHandler) interceptorChain.pluginAll(resultSetHandler);
    return resultSetHandler;
  }
```
下面我们来讲解他的默认类：DefaultResultSetHandler
## 4.2 DefaultResultSetHandler
MyBatis 只有一个默认的实现类就是 DefaultResultSetHandler，ResultSetHandler 主要负责处理两件事

1. 处理 Statement 执行后产生的结果集，生成结果列表
2. 处理存储过程执行后的输出参数

下面我们针对关键代码进行分析，结果集的返回
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
需要详细的分析过程，请参考前面的文章，下面我们来梳理一下过程

- 首先获取一个数据库返回的结果对象，通过反射方式构造一个空的对象，带有属性
- 然后根据字段类型，调用不同的类型处理器获取值，在为对象填充属性，最后添加记录到multipleResults中，一个结果处理完毕，接着循环处理
