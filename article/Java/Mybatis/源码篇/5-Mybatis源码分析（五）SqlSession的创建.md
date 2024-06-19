---
title: 5-SqlSession的创建
sidebar_position: 6
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
  date: 2023-08-08
  author: EasonShu


---

- 官网：[mybatis – MyBatis 3 | 简介](https://mybatis.org/mybatis-3/zh/index.html)

使用 MyBatis 的主要 Java 接口就是 SqlSession。你可以通过这个接口来执行命令，获取映射器实例和管理事务。在介绍 SqlSession 接口之前，我们先来了解如何获取一个 SqlSession 实例。SqlSessions 是由 SqlSessionFactory 实例创建的。SqlSessionFactory 对象包含创建 SqlSession 实例的各种方法。而 SqlSessionFactory 本身是由 SqlSessionFactoryBuilder 创建的，它可以从 XML、注解或 Java 配置代码来创建 SqlSessionFactory。
# 一 SqlSession的创建
```java
@Test
    void contextLoads() {
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
            List<User> userList =  userMapper.queryAllByLimit(userParam);
            // 打印查询结果
            for (User user : userList) {
                System.out.println("name : " + user.getName() + " ;  email : " + user.getEmail());
            }
        }

    }
```

-  我们来看看SqlSession的创建是如何创建的，在上两篇文件中完成配置文件的解析返回SqlSessionFactory
```java
          // 第二阶段：数据读写阶段
        try (SqlSession session = sqlSessionFactory.openSession()) {
```

- 可以通过调式看出，我们的SqlSessionFactory的实现是DefaultSqlSessionFactory

**DefaultSqlSessionFactory**
```java

@Override
  public SqlSession openSession() {
    return openSessionFromDataSource(configuration.getDefaultExecutorType(), null, false);
  }



public enum ExecutorType {

  SIMPLE, // 为每个语句创建新的预处理语句
  REUSE,  // 复用
  BATCH   // 执行批量操作
}


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
主要包含以下几个步骤：

1. 首先从configuration获取Environment对象，里面主要包含了DataSource和TransactionFactory对象
2. 创建TransactionFactory对象
3. 创建Transaction对象
4. 从configuration获取Executor
5. 构造DefaultSqlSession对象
## 1.1 获取environments配置元素
```java
//配置environment环境
<environments default="development">
    <environment id="development">
        /** 事务配置 type= JDBC、MANAGED 
         *  1.JDBC:这个配置直接简单使用了JDBC的提交和回滚设置。它依赖于从数据源得到的连接来管理事务范围。
         *  2.MANAGED:这个配置几乎没做什么。它从来不提交或回滚一个连接。
         */
        <transactionManager type="JDBC" />
        /** 数据源类型：type = UNPOOLED、POOLED、JNDI 
         *  1.UNPOOLED：这个数据源的实现是每次被请求时简单打开和关闭连接。
         *  2.POOLED：这是JDBC连接对象的数据源连接池的实现。 
         *  3.JNDI：这个数据源的实现是为了使用如Spring或应用服务器这类的容器
         */
        <dataSource type="POOLED">
            <property name="driver" value="com.mysql.jdbc.Driver" />
            <property name="url" value="jdbc:mysql://localhost:3306/xhm" />
            <property name="username" value="root" />
            <property name="password" value="root" />
            //默认连接事务隔离级别
            <property name="defaultTransactionIsolationLevel" value=""/> 
        </dataSource>
    </environment>
</environments>
```

- 解析我们配置文件中的environment配置元素，具体解析过程请参考前面的文章。

![image.png](https://img-blog.csdnimg.cn/img_convert/010e6e760b99e2ffd7bccdd2ff85c67d.png)
**XMLConfigBuilder**
```java
// 解析我们配置文件中的environment配置元素
private void environmentsElement(XNode context) throws Exception {
    if (context != null) {
        if (environment == null) {
            // 获取 default 属性
            environment = context.getStringAttribute("default");
        }
        for (XNode child : context.getChildren()) {
            // 获取 id 属性
            String id = child.getStringAttribute("id");
            /*
             * 检测当前 environment 节点的 id 与其父节点 environments 的属性 default 
             * 内容是否一致，一致则返回 true，否则返回 false
             * 将其default属性值与子元素environment的id属性值相等的子元素设置为当前使用的Environment对象
             */
            if (isSpecifiedEnvironment(id)) {
                // 将environment中的transactionManager标签转换为TransactionFactory对象
                TransactionFactory txFactory = transactionManagerElement(child.evalNode("transactionManager"));
                // 将environment中的dataSource标签转换为DataSourceFactory对象
                DataSourceFactory dsFactory = dataSourceElement(child.evalNode("dataSource"));
                // 创建 DataSource 对象
                DataSource dataSource = dsFactory.getDataSource();
                Environment.Builder environmentBuilder = new Environment.Builder(id)
                    .transactionFactory(txFactory)
                    .dataSource(dataSource);
                // 构建 Environment 对象，并设置到 configuration 中
                configuration.setEnvironment(environmentBuilder.build());
            }
        }
    }
}

```
## 1.2 获取事务工厂
**DefaultSqlSessionFactory**
```java
 private TransactionFactory getTransactionFactoryFromEnvironment(Environment environment) {
    if (environment == null || environment.getTransactionFactory() == null) {
         // 委托事务工厂
      return new ManagedTransactionFactory();
    }
	// 我们配置的事务工厂JdbcTransactionFactory
    return environment.getTransactionFactory();
  }

```
![image.png](https://img-blog.csdnimg.cn/img_convert/2950d23696dcf8f9e9e40697b18e7631.png)

- JdbcTransaction由JDBC进行事务管理

**JdbcTransaction**
```java
// 由JDBC进行事务管理
public class JdbcTransaction implements Transaction {

  private static final Log log = LogFactory.getLog(JdbcTransaction.class);

  // 数据库连接
  protected Connection connection;
  // 数据源
  protected DataSource dataSource;
  // 事务隔离级别
  protected TransactionIsolationLevel level;
  // 是否自动提交事务
  protected boolean autoCommit;

  public JdbcTransaction(DataSource ds, TransactionIsolationLevel desiredLevel, boolean desiredAutoCommit) {
    dataSource = ds;
    level = desiredLevel;
    autoCommit = desiredAutoCommit;
  }

  public JdbcTransaction(Connection connection) {
    this.connection = connection;
  }

  @Override
  public Connection getConnection() throws SQLException {
    if (connection == null) {
      openConnection();
    }
    return connection;
  }

  /**
   * 提交事务
   * @throws SQLException
   */
  @Override
  public void commit() throws SQLException {
    // 连接存在且不会自动提交事务
    if (connection != null && !connection.getAutoCommit()) {
      if (log.isDebugEnabled()) {
        log.debug("Committing JDBC Connection [" + connection + "]");
      }
      // 调用connection对象的方法提交事务
      connection.commit();
    }
  }

  /**
   * 回滚事务
   * @throws SQLException
   */
  @Override
  public void rollback() throws SQLException {
    if (connection != null && !connection.getAutoCommit()) {
      if (log.isDebugEnabled()) {
        log.debug("Rolling back JDBC Connection [" + connection + "]");
      }
      connection.rollback();
    }
  }

  @Override
  public void close() throws SQLException {
    if (connection != null) {
      resetAutoCommit();
      if (log.isDebugEnabled()) {
        log.debug("Closing JDBC Connection [" + connection + "]");
      }
      connection.close();
    }
  }

  protected void setDesiredAutoCommit(boolean desiredAutoCommit) {
    try {
      if (connection.getAutoCommit() != desiredAutoCommit) {
        if (log.isDebugEnabled()) {
          log.debug("Setting autocommit to " + desiredAutoCommit + " on JDBC Connection [" + connection + "]");
        }
        connection.setAutoCommit(desiredAutoCommit);
      }
    } catch (SQLException e) {
      // Only a very poorly implemented driver would fail here,
      // and there's not much we can do about that.
      throw new TransactionException("Error configuring AutoCommit.  "
          + "Your driver may not support getAutoCommit() or setAutoCommit(). "
          + "Requested setting: " + desiredAutoCommit + ".  Cause: " + e, e);
    }
  }

  protected void resetAutoCommit() {
    try {
      if (!connection.getAutoCommit()) {
        // MyBatis does not call commit/rollback on a connection if just selects were performed.
        // Some databases start transactions with select statements
        // and they mandate a commit/rollback before closing the connection.
        // A workaround is setting the autocommit to true before closing the connection.
        // Sybase throws an exception here.
        if (log.isDebugEnabled()) {
          log.debug("Resetting autocommit to true on JDBC Connection [" + connection + "]");
        }
        connection.setAutoCommit(true);
      }
    } catch (SQLException e) {
      if (log.isDebugEnabled()) {
        log.debug("Error resetting autocommit to true "
            + "before closing the connection.  Cause: " + e);
      }
    }
  }

  protected void openConnection() throws SQLException {
    if (log.isDebugEnabled()) {
      log.debug("Opening JDBC Connection");
    }
    connection = dataSource.getConnection();
    if (level != null) {
      connection.setTransactionIsolation(level.getLevel());
    }
    setDesiredAutoCommit(autoCommit);
  }

  @Override
  public Integer getTimeout() throws SQLException {
    return null;
  }

}

```
JdbcTransaction主要维护了一个默认autoCommit为false的Connection对象，对事物的提交，回滚，关闭等都是接见通过Connection完成的。
## 1.3 获取执行器Executor
![image.png](https://img-blog.csdnimg.cn/img_convert/901a5b65f519cd753b64fb990bb55da5.png)
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
        // 批处理执行器
      executor = new BatchExecutor(this, transaction);
    } else if (ExecutorType.REUSE == executorType) {
        // 可以重用执行器
      executor = new ReuseExecutor(this, transaction);
    } else {
        //一个简单的执行器
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

- 执行器的类型，我们来看看执行器的接口信息

![image.png](https://img-blog.csdnimg.cn/img_convert/4b8be7363b44707d97de71bef9408a9c.png)
**Executor**
```java
public interface Executor {

  ResultHandler NO_RESULT_HANDLER = null;

  // 数据更新操作，其中数据的增加、删除、更新均可由该方法实现
  int update(MappedStatement ms, Object parameter) throws SQLException;
  // 数据查询操作，返回结果为列表形式
  <E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, CacheKey cacheKey, BoundSql boundSql) throws SQLException;
  // 数据查询操作，返回结果为列表形式
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

}

```
executor包含了Configuration和刚刚创建的Transaction，默认的执行器为SimpleExecutor，如果开启了二级缓存(默认开启)，则CachingExecutor会包装SimpleExecutor，然后依次调用拦截器的plugin方法返回一个被代理过的Executor对象，记住这个地方，后面Sql语句具体的执行是交给执行器来进行处理的。

## 1.4 构建DefaultSqlSession
```java
 return new DefaultSqlSession(configuration, executor, autoCommit);
```
```java
public class DefaultSqlSession implements SqlSession {
  // 配置信息
  private final Configuration configuration;
  // 执行器
  private final Executor executor;
  // 是否自动提交
  private final boolean autoCommit;
  // 缓存是否已经被污染
  private boolean dirty;
  // 游标列表
  private List<Cursor<?>> cursorList;

  public DefaultSqlSession(Configuration configuration, Executor executor, boolean autoCommit) {
    this.configuration = configuration;
    this.executor = executor;
    this.dirty = false;
    this.autoCommit = autoCommit;
  }

}
```
![image.png](https://img-blog.csdnimg.cn/img_convert/087f0b75dda135858071e567016ea645.png)
SqlSession的所有查询接口最后都归结位Exector的方法调用。后面文章我们来分析其调用流程。