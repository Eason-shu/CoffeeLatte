---
title: Mybatis源码分析（九）Mybatis的PreparedStatement
sidebar_position: 11
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


![_2180018.JPG](https://cdn.nlark.com/yuque/0/2023/jpeg/12426173/1676965559168-add47548-904f-436d-9ad1-1c075130317d.jpeg#averageHue=%23717874&clientId=ua356c37b-5545-4&from=ui&id=u37f65451&originHeight=3888&originWidth=5184&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=9310370&status=done&style=none&taskId=u7a0a1e3b-288d-4b8d-9f94-db12e21f00e&title=)


- 官网：[mybatis – MyBatis 3 | 简介](https://mybatis.org/mybatis-3/zh/index.html)

上一篇文章我们分析了，Select的语句的执行过程，但是在与数据库打交道的那一块，我们没有详细介绍，下面我们来看看Mybatis中是如何与数据库打交道的？

---

> 学习到的知识

:::info

1. 数据库连接池获取数据库连接，池化技术
2. Sql的预编译，以及设置参数
3. 动态代理
:::
> 过程梳理

:::warning

1. 从前面我们知道创建了一个预处理语句处理器PreparedStatementHandler
2. 接着从DataSource中获取数据库连接，返回Connection对象，当然这里的DataSource是可配置的，一般默认为池化，最后通过PooledConnection生成一个代理对象，由代理连接对象，来完成数据库的交互
3. 通过数据库连接代理对象返回ClientPreparedStatement
4. 通过不同的类型处理器，设置参数
5. 调用query方法执行真正的查询方法
:::
温馨提示：后面的代码比较打脑壳，与数据库交互这一块

---


---

**SimpleExecutor**
```java
  @Override
  public <E> List<E> doQuery(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) throws SQLException {
    Statement stmt = null;
    try {
      Configuration configuration = ms.getConfiguration();
      // 创建处理器
      StatementHandler handler = configuration.newStatementHandler(wrapper, ms, parameter, rowBounds, resultHandler, boundSql);
      // 预编译参数
      stmt = prepareStatement(handler, ms.getStatementLog());
      return handler.query(stmt, resultHandler);
    } finally {
      closeStatement(stmt);
    }
  }
```
# 一 JDBC的PreparedStatement
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673834147558-ce7742d8-5d8c-4d8c-89ca-00fad0f8160d.png#averageHue=%232c2c2c&clientId=ub495ee82-79c6-4&from=paste&height=544&id=u7c94277a&originHeight=680&originWidth=1451&originalType=binary&ratio=1&rotation=0&showTitle=false&size=25230&status=done&style=none&taskId=uee27551b-e849-4a01-a256-ccd4ff04900&title=&width=1160.8)
文档说明：
表示预编译SQL语句的对象。 SQL语句被预编译并存储在PreparedStatement对象中。然后，可以使用该对象多次有效地执行此语句。 注意:用于设置IN形参值的setter方法(setShort、setString等)必须指定与输入形参定义的SQL类型兼容的类型。例如，如果IN参数的SQL类型为INTEGER，则应该使用方法setInt。 如果需要任意参数类型转换，则应该将方法setObject与目标SQL类型一起使用。 在下面的参数设置示例中，con表示活动连接:
```java
PreparedStatement pstmt = con.prepareStatement("UPDATE EMPLOYEES . 设定工资= ?Where id = ?");
pstmt.setBigDecimal (153833.00)
pstmt.setInt (110592)
```
JDBC中java.sql.PreparedStatement是java.sql.Statement的子接口,它主要提供了无参数执行方法如executeQuery和executeUpdate等，以及大量形如set{Type}(int, {Type})形式的方法用于设置参数。
**PreparedStatement**
```java
public interface PreparedStatement extends Statement {
        // 执行PreparedStatement对象中的SQL查询，并返回由该查询生成的ResultSet对象。
       ResultSet executeQuery() throws SQLException;
        // 执行PreparedStatement对象中的SQL语句，该语句必须是SQL数据操作语言(DML)语句，如INSERT、UPDATE或DELETE;或不返回任何结果的SQL语句，如DDL语句。
         int executeUpdate() throws SQLException;
        // 其他省略
}
```
这里我们可以看到executeQuery与executeUpdate方法前者主要是处理Select语句后者处理INSERT、UPDATE或DELETE语句，这里他的子类太多了我们介绍与Mybatis相关的CallableStatement与JdbcPreparedStatement
![PreparedStatement.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673836146025-bf1511ec-c343-445d-b9b4-ffc8badbc937.png#averageHue=%232e2d2d&clientId=ub495ee82-79c6-4&from=paste&height=696&id=u3195f4d1&originHeight=870&originWidth=4796&originalType=binary&ratio=1&rotation=0&showTitle=false&size=126077&status=done&style=none&taskId=uc91bb88e-cceb-4179-88bc-42671045fc6&title=&width=3836.8)

- CallableStatement：用于执行SQL存储过程的接口。JDBC API提供了一种存储过程SQL转义语法，允许以标准方式对所有rdbms调用存储过程。此转义语法有一种形式包含结果形参，另一种形式不包含结果形参。如果使用，结果参数必须注册为OUT参数。其他参数可用于输入、输出或同时用于输入和输出。参数按数字顺序引用，第一个参数为1。 {?= call  [( ， ，…)]} {call  [( ， ，…)]}
- JdbcPreparedStatement：表示预编译SQL语句的对象。 SQL语句被预编译并存储在PreparedStatement对象中。

下面：我们来看看在JDBC中使用PreparedStatement
```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;



public class PreparedStatementTest {
    public static void main(String[] args) throws Throwable {
        Class.forName("com.mysql.jdbc.Driver");
        String url = "jdbc:mysql://localhost/test";
        // 获取连接
        try (Connection con = DriverManager.getConnection(url, "root", null)) {
            String sql = "insert into t select ?,?";
            // 预编译Sql
            PreparedStatement statement = con.prepareStatement(sql);
            // 设置参数
            statement.setInt(1, 123456);
            statement.setString(2, "abc");
            // 执行
            statement.executeUpdate();
            // 关闭
            statement.close();
        }
    }
}

```
通常我们的一条sql在db接收到最终执行完毕返回可以分为下面三个过程：

1. 词法和语义解析
2. 优化sql语句，制定执行计划
3. 执行并返回结果

我们把这种普通语句称作**Immediate Statements**。
# 二 prepareStatement的准备阶段
让我们回到之前的准备工作？
**ReuseExecutor**
```java
  @Override
  public int doUpdate(MappedStatement ms, Object parameter) throws SQLException {
    // 获取好的解析文件
    Configuration configuration = ms.getConfiguration();
    // 参数与处理器
    StatementHandler handler = configuration.newStatementHandler(this, ms, parameter, RowBounds.DEFAULT, null, null);
    Statement stmt = prepareStatement(handler, ms.getStatementLog());
    return handler.update(stmt);
  }
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1675991633931-2948525a-6741-4e86-a768-7f51f29c2fb9.png#averageHue=%23444e5b&clientId=uff5a360b-ef6f-4&from=paste&height=162&id=u0b174ce1&originHeight=202&originWidth=936&originalType=binary&ratio=1&rotation=0&showTitle=false&size=45640&status=done&style=none&taskId=uf98f8ce1-0a37-4fc2-a8cd-eeb1a2a1c85&title=&width=748.8)

- SimpleStatementHandler，这个很简单了，就是对应我们JDBC中常用的Statement接口，用于简单SQL的处理；
- PreparedStatementHandler，这个对应JDBC中的PreparedStatement，预编译SQL的接口；
- CallableStatementHandler，这个对应JDBC中CallableStatement，用于执行存储过程相关的接口；
- RoutingStatementHandler，这个接口是以上三个接口的路由，没有实际操作，只是负责上面三个StatementHandler的创建及调用。

1. 首先获取Connection
2. SQL预编译
3. 设置参数
4. 执行Sql，返回结果
5. 关闭
## 2.1 获取Connection
首先我们来看看获取Connection，是如何获取的？
**ReuseExecutor**
```java
 private Statement prepareStatement(StatementHandler handler, Log statementLog) throws SQLException {
    Statement stmt;
    BoundSql boundSql = handler.getBoundSql();
    String sql = boundSql.getSql();
    if (hasStatementFor(sql)) {
      stmt = getStatement(sql);
      applyTransactionTimeout(stmt);
    } else {
      Connection connection = getConnection(statementLog);
      stmt = handler.prepare(connection, transaction.getTimeout());
      putStatement(sql, stmt);
    }
    handler.parameterize(stmt);
    return stmt;
  }
```
**BaseExecutor**
```java
  /**
   * 获取一个Connection对象
   * @param statementLog 日志对象
   * @return Connection对象
   * @throws SQLException
   */
  protected Connection getConnection(Log statementLog) throws SQLException {
    Connection connection = transaction.getConnection();
    if (statementLog.isDebugEnabled()) { // 启用调试日志
      // 生成Connection对象的具有日志记录功能的代理对象ConnectionLogger对象
      return ConnectionLogger.newInstance(connection, statementLog, queryStack);
    } else {
      // 返回原始的Connection对象
      return connection;
    }
  }

```

transaction事务工厂，在DefaultSqlSessionFactory#openSession（）创建，在我们的配置中JdbcTransactionFactory
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1676990104942-ef1d803e-f8db-452c-8480-0432cc63db2a.png#averageHue=%23474f4d&clientId=u8a3210c7-f3b5-4&from=paste&height=626&id=u37e2da9e&originHeight=783&originWidth=1895&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=169986&status=done&style=none&taskId=u53b3aebc-a375-47f7-b10d-6c376ec15a1&title=&width=1516)
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


 private TransactionFactory getTransactionFactoryFromEnvironment(Environment environment) {
    if (environment == null || environment.getTransactionFactory() == null) {
      return new ManagedTransactionFactory();
    }
    return environment.getTransactionFactory();
  }
```
让我们来看看Transaction类的接口信息，他的实现类：JdbcTransaction与ManagedTransaction
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673838544147-02adf0c2-c6b2-436e-be84-79673c6b6319.png#averageHue=%232d2c2c&clientId=ub495ee82-79c6-4&from=paste&height=450&id=u5ab99d7f&originHeight=563&originWidth=1263&originalType=binary&ratio=1&rotation=0&showTitle=false&size=18471&status=done&style=none&taskId=u558c580c-f34b-4558-ac63-a9c5c174009&title=&width=1010.4)
**Transaction**
```java
public interface Transaction {


  /**
   * 获取该事务对应的数据库连接
   * @return 数据库连接
   * @throws SQLException
   */
  Connection getConnection() throws SQLException;

  /**
   * 提交事务
   * @throws SQLException
   */
  void commit() throws SQLException;


  /**
   * 回滚事务
   * @throws SQLException
   */
  void rollback() throws SQLException;


  /**
   * 关闭对应的数据连接
   * @throws SQLException
   */
  void close() throws SQLException;


  /**
   * 读取设置的事务超时时间
   * @return 事务超时时间
   * @throws SQLException
   */
  Integer getTimeout() throws SQLException;

}

```
Transaction接口只是定义了基本的方法，关键在于他的实现，我们来看看JdbcTransaction
**JdbcTransaction**
```java
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

  // 关闭
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

 protected void openConnection() throws SQLException {
    if (log.isDebugEnabled()) {
      log.debug("Opening JDBC Connection");
    }
    //通过dataSource来获取connection，并设置到transaction的connection属性中
    connection = dataSource.getConnection();
   if (level != null) {
      //通过connection设置事务的隔离级别
      connection.setTransactionIsolation(level.getLevel());
    }
    //设置事务是否自动提交
    setDesiredAutoCommit(autoCommmit);
  }
  // 其他方法省略
}
```
我们看到JdbcTransaction中有一个**Connection属性和dataSource属性，使用connection来进行提交、回滚、关闭等操作，也就是说JdbcTransaction其实只是在jdbc的connection上面封装了一下，实际使用的其实还是jdbc的事务。**我们看看getConnection()方法。
```java
  @Override
  public Connection getConnection() throws SQLException {
    if (connection == null) {
      openConnection();
    }
    return connection;
  }


 protected void openConnection() throws SQLException {
    if (log.isDebugEnabled()) {
      log.debug("Opening JDBC Connection");
    }
     // 从数据源中获取connection这与上面的案例是一致的
    connection = dataSource.getConnection();
    if (level != null) {
      connection.setTransactionIsolation(level.getLevel());
    }
    setDesiredAutoCommit(autoCommit);
  }
```

- 我们再来看看dataSource.getConnection()这个方法获取connection

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1676990231626-893c8326-7056-449e-a4f2-3961cc90d006.png#averageHue=%23484e4e&clientId=u8a3210c7-f3b5-4&from=paste&height=544&id=u3e670e9a&originHeight=680&originWidth=1864&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=136252&status=done&style=none&taskId=u2745cf8e-297f-4961-a6ae-08a5f744708&title=&width=1491.2)
这里先看看官方文档对dataSource的配置信息吧：虽然数据源配置是可选的，但如果要启用延迟加载特性，就必须配置数据源，有三种内建的数据源类型（也就是 type="[UNPOOLED|POOLED|JNDI]"）：
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673839161086-959319bc-0ded-4c88-aa2a-3272678e707b.png#averageHue=%23f8f5f3&clientId=ub495ee82-79c6-4&from=paste&height=716&id=ub4bea847&originHeight=895&originWidth=1722&originalType=binary&ratio=1&rotation=0&showTitle=false&size=278629&status=done&style=none&taskId=u3bfa0760-297a-4731-b07f-e5552328664&title=&width=1377.6)
对数据源元素的解析，请参考前面的文章对environments元素进行解析，下面贴关键代码
**XMLConfigBuilder**
```java
  /**
   * 解析配置信息，获取数据源工厂
   * 被解析的配置信息示例如下：
   * <dataSource type="POOLED">
   *   <property name="driver" value="{dataSource.driver}"/>
   *   <property name="url" value="{dataSource.url}"/>
   *   <property name="username" value="${dataSource.username}"/>
   *   <property name="password" value="${dataSource.password}"/>
   * </dataSource>
   *
   * @param context 被解析的节点
   * @return 数据源工厂
   * @throws Exception
   */
  private DataSourceFactory dataSourceElement(XNode context) throws Exception {
    if (context != null) {
      // 通过这里的类型判断数据源类型，例如POOLED、UNPOOLED、JNDI
      String type = context.getStringAttribute("type");
      // 获取dataSource节点下配置的property
      Properties props = context.getChildrenAsProperties();
      // 根据dataSource的type值获取相应的DataSourceFactory对象
      DataSourceFactory factory = (DataSourceFactory) resolveClass(type).newInstance();
      // 设置DataSourceFactory对象的属性
      factory.setProperties(props);
      return factory;
    }
    throw new BuilderException("Environment declaration requires a DataSourceFactory.");
  }
```
扩展问题：DefaultSqlSession线程安全吗？：[Mybatis(二)SqlSession之线程安全](https://zhuanlan.zhihu.com/p/343374447)
下面我们仔细来介绍下数据源的创建？首先我们看看DataSource接口信息
**DataSource**
```java
public interface DataSource  extends CommonDataSource, Wrapper {


  Connection getConnection() throws SQLException;


  Connection getConnection(String username, String password)
    throws SQLException;
}

```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673840166794-28b2be29-ea6f-4727-aa42-957bca01f6ff.png#averageHue=%232c2c2c&clientId=ub495ee82-79c6-4&from=paste&height=414&id=ua5f8b517&originHeight=517&originWidth=1272&originalType=binary&ratio=1&rotation=0&showTitle=false&size=17452&status=done&style=none&taskId=u3b90fcc1-d5d7-4f33-aef4-f384a67e3fc&title=&width=1017.6)
我们再来看看他的实现类PooledDataSource与UnpooledDataSource，池化与非池化，首先看看UnpooledDataSource的成员变量，他的步骤如下

1. initializeDriver - 初始化数据库驱动
2. doGetConnection - 获取数据连接
3. configureConnection - 配置数据库连接
### 2.1.1 **UnpooledDataSource**
**UnpooledDataSource**
```java
public class UnpooledDataSource implements DataSource {

  // 驱动加载器
  private ClassLoader driverClassLoader;
  // 驱动配置信息
  private Properties driverProperties;
  // 已经注册的所有驱动
  private static Map<String, Driver> registeredDrivers = new ConcurrentHashMap<>();
  // 数据库驱动
  private String driver;
  // 数据源地址
  private String url;
  // 数据源用户名
  private String username;
  // 数据源密码
  private String password;
  // 是否自动提交
  private Boolean autoCommit;
  // 默认事务隔离级别
  private Integer defaultTransactionIsolationLevel;
  // 最长等待时间。发出请求后，最长等待该时间后如果数据库还没有回应，则认为失败
  private Integer defaultNetworkTimeout;

  static {
    // 首先将java.sql.DriverManager中的驱动都加载进来
    Enumeration<Driver> drivers = DriverManager.getDrivers();
    while (drivers.hasMoreElements()) {
      Driver driver = drivers.nextElement();
      registeredDrivers.put(driver.getClass().getName(), driver);
    }
  }
}
```
**UnpooledDataSource**
```java
// 传入用户密码
@Override
  public Connection getConnection() throws SQLException {
    return doGetConnection(username, password);
  }


private Connection doGetConnection(String username, String password) throws SQLException {
    Properties props = new Properties();
    if (driverProperties != null) {
      props.putAll(driverProperties);
    }
    if (username != null) {
      props.setProperty("user", username);
    }
    if (password != null) {
      props.setProperty("password", password);
    }
    return doGetConnection(props);
  }

  /**
   * 建立数据库连接
   * @param properties 里面包含建立连接的"user"、"password"、驱动配置信息
   * @return 数据库连接对象
   * @throws SQLException
   */
  private Connection doGetConnection(Properties properties) throws SQLException {
    // 初始化驱动
    initializeDriver();
    // 通过DriverManager获取连接
    Connection connection = DriverManager.getConnection(url, properties);
    // 配置连接，要设置的属性有defaultNetworkTimeout、autoCommit、defaultTransactionIsolationLevel
    configureConnection(connection);
    return connection;
  }
```

- 我们来看看他初始化数据库驱动方法initializeDriver（）来初始化数据库驱动

**UnpooledDataSource**
```java
/**
   * 初始化数据库驱动
   * @throws SQLException
   */
  private synchronized void initializeDriver() throws SQLException {
    if (!registeredDrivers.containsKey(driver)) { // 如果所需的驱动尚未被注册到registeredDrivers
      Class<?> driverType;
      try {
        if (driverClassLoader != null) { // 如果存在驱动类加载器
          // 优先使用驱动类加载器加载驱动类
          driverType = Class.forName(driver, true, driverClassLoader);
        } else {
          // 使用Resources中的所有加载器加载驱动类
          driverType = Resources.classForName(driver);
        }
        // 实例化驱动
        Driver driverInstance = (Driver)driverType.newInstance();
        // 向DriverManager注册该驱动的代理
        DriverManager.registerDriver(new DriverProxy(driverInstance));
        // 注册到registeredDrivers，表明该驱动已经加载
        registeredDrivers.put(driver, driverInstance);
      } catch (Exception e) {
        throw new SQLException("Error setting driver on UnpooledDataSource. Cause: " + e);
      }
    }
  }
```
通过反射机制加载驱动Driver，并将其注册到DriverManager中的一个常量集合中，供后面获取连接时使用，为什么这里是一个List呢？我们实际开发中有可能使用到了多种数据库类型，如Mysql、Oracle等，其驱动都是不同的，不同的数据源获取连接时使用的是不同的驱动。

- 我们仔细从驱动管理器中来看看他说如何获取理数据库连接的

Connection connection = DriverManager.getConnection(url, properties)
**DriverManager**
```java
 //  Worker method called by the public getConnection() methods.
    private static Connection getConnection(
        String url, java.util.Properties info, Class<?> caller) throws SQLException {
        // 当callerCl为空时，我们应该检查应用程序的(间接调用该类的)类加载器，以便可以从这里加载rt.jar外部的JDBC驱动程序类。
        ClassLoader callerCL = caller != null ? caller.getClassLoader() : null;
        synchronized(DriverManager.class) {
            // synchronize loading of the correct classloader.
            if (callerCL == null) {
                callerCL = Thread.currentThread().getContextClassLoader();
            }
        }

        if(url == null) {
            throw new SQLException("The url cannot be null", "08001");
        }

        println("DriverManager.getConnection(\"" + url + "\")");

       // 遍历已加载的registeredDrivers，试图建立连接。
        // 记住第一个被引发的异常，这样我们就可以重新引发它。
        SQLException reason = null;

        // 遍历已经注册是使用驱动
        for(DriverInfo aDriver : registeredDrivers) {
           // 如果调用者没有加载驱动程序的权限，那么跳过它。
            if(isDriverAllowed(aDriver.driver, callerCL)) {
                try {
                    println("    trying " + aDriver.driver.getClass().getName());
                    Connection con = aDriver.driver.connect(url, info);
                    if (con != null) {
                        // Success!
                        println("getConnection returning " + aDriver.driver.getClass().getName());
                        return (con);
                    }
                } catch (SQLException ex) {
                    if (reason == null) {
                        reason = ex;
                    }
                }

            } else {
                println("    skipping: " + aDriver.getClass().getName());
            }

        }

        // if we got here nobody could connect.
        if (reason != null)    {
            println("getConnection failed: " + reason);
            throw reason;
        }

        println("getConnection: no suitable driver found for "+ url);
        throw new SQLException("No suitable driver found for "+ url, "08001");
    }
```

- 从配置文件中来配置连接比如：超时，自动提交，事务隔离级别

configureConnection(connection)
**UnpooledDataSource**
```java
 private void configureConnection(Connection conn) throws SQLException {
    if (defaultNetworkTimeout != null) {
      conn.setNetworkTimeout(Executors.newSingleThreadExecutor(), defaultNetworkTimeout);
    }
    if (autoCommit != null && autoCommit != conn.getAutoCommit()) {
      conn.setAutoCommit(autoCommit);
    }
    if (defaultTransactionIsolationLevel != null) {
      conn.setTransactionIsolation(defaultTransactionIsolationLevel);
    }
  }
```

### 2.1.2 PooledDataSource
PooledDataSource 内部实现了连接池功能，用于复用数据库连接。因此，从效率上来说，PooledDataSource 要高于 UnpooledDataSource，但是最终获取Connection还是通过UnpooledDataSource，只不过PooledDataSource 提供一个存储Connection的功能，也是默认实现，我们仔细来看看
**PooledDataSource**
```java
public class PooledDataSource implements DataSource {
  private static final Log log = LogFactory.getLog(PooledDataSource.class);
  // 池化状态
  private final PoolState state = new PoolState(this);

  // 持有一个UnpooledDataSource对象
  private final UnpooledDataSource dataSource;

  // 和连接池设置有关的配置项
  protected int poolMaximumActiveConnections = 10;
  protected int poolMaximumIdleConnections = 5;
  protected int poolMaximumCheckoutTime = 20000;
  protected int poolTimeToWait = 20000;
  protected int poolMaximumLocalBadConnectionTolerance = 3;
  protected String poolPingQuery = "NO PING QUERY SET";
  protected boolean poolPingEnabled;
  protected int poolPingConnectionsNotUsedFor;

  // 存储池子中的连接的编码，编码用("" + url + username + password).hashCode()算出来
  // 因此，整个池子中的所有连接的编码必须是一致的，里面的连接是等价的
  private int expectedConnectionTypeCode;


}
```
PoolState 用于记录连接池运行时的状态，比如连接获取次数，无效连接数量等。同时 PoolState 内部定义了两个 PooledConnection 集合，用于存储空闲连接和活跃连接。
**PoolState**
```java
public class PoolState {

  // 池化数据源
  protected PooledDataSource dataSource;
  // 空闲的连接
  protected final List<PooledConnection> idleConnections = new ArrayList<>();
  // 活动的连接
  protected final List<PooledConnection> activeConnections = new ArrayList<>();
  // 连接被取出的次数
  protected long requestCount = 0;
  // 取出请求花费时间的累计值。从准备取出请求到取出结束的时间为取出请求花费的时间
  protected long accumulatedRequestTime = 0;
  // 累积被检出的时间
  protected long accumulatedCheckoutTime = 0;
  // 声明的过期连接数
  protected long claimedOverdueConnectionCount = 0;
  // 过期的连接数的总检出时长
  protected long accumulatedCheckoutTimeOfOverdueConnections = 0;
  // 总等待时间
  protected long accumulatedWaitTime = 0;
  // 等待的轮次
  protected long hadToWaitCount = 0;
  // 坏连接的数目
  protected long badConnectionCount = 0;

  public PoolState(PooledDataSource dataSource) {
    this.dataSource = dataSource;
  }
}
```
PooledConnection 内部定义了一个 Connection 类型的变量，用于指向真实的数据库连接。以及一个 Connection 的代理类，用于对部分方法调用进行拦截，至于为什么要拦截，随后将进行分析。除此之外，PooledConnection 内部也定义了一些字段，用于记录数据库连接的一些运行时状态。
**PooledConnection**
```java
class PooledConnection implements InvocationHandler {

  private static final String CLOSE = "close";
  private static final Class<?>[] IFACES = new Class<?>[] { Connection.class };

  // 该连接的哈希值
  private final int hashCode;
  // 该连接所属的连接池
  private final PooledDataSource dataSource;
  // 真正的Connection
  private final Connection realConnection;
  // 代理Connection
  private final Connection proxyConnection;
  // 从连接池中取出的时间
  private long checkoutTimestamp;
  // 创建时间
  private long createdTimestamp;
  // 上次使用时间
  private long lastUsedTimestamp;
  // 标志所在连接池的连接类型编码
  private int connectionTypeCode;
  // 连接是否可用
  private boolean valid;



  public PooledConnection(Connection connection, PooledDataSource dataSource) {
    this.hashCode = connection.hashCode();
    this.realConnection = connection;
    this.dataSource = dataSource;
    this.createdTimestamp = System.currentTimeMillis();
    this.lastUsedTimestamp = System.currentTimeMillis();
    this.valid = true;
    // 参数依次是：被代理对象的类加载器  被代理对象的接口 包含代理对象的类（实现InvocationHandler接口的类）
    this.proxyConnection = (Connection) Proxy.newProxyInstance(Connection.class.getClassLoader(), IFACES, this);
  }

}
```
获取连接调用了PooledDataSource#popConnection方法
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1676990637521-57430be4-6224-41b6-abeb-5b0be39fe607.png#averageHue=%233d4146&clientId=u8a3210c7-f3b5-4&from=paste&height=485&id=u17f591ca&originHeight=606&originWidth=1740&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=85828&status=done&style=none&taskId=u4d9e4fe5-6c8c-482a-827e-1b14b0e3f61&title=&width=1392)
```java
/**
   * 从池化数据源中给出一个连接
   * @param username 用户名
   * @param password 密码
   * @return 池化的数据库连接
   * @throws SQLException
   */
  private PooledConnection popConnection(String username, String password) throws SQLException {
    boolean countedWait = false;
    PooledConnection conn = null;
    // 用于统计取出连接花费的时长的时间起点
    long t = System.currentTimeMillis();
    int localBadConnectionCount = 0;

    while (conn == null) {
      // 给state加同步锁
      synchronized (state) {
        if (!state.idleConnections.isEmpty()) { // 池中存在空闲连接
          // 左移操作，取出第一个连接
          conn = state.idleConnections.remove(0);
          if (log.isDebugEnabled()) {
            log.debug("Checked out connection " + conn.getRealHashCode() + " from pool.");
          }
        } else { // 池中没有空余连接
          if (state.activeConnections.size() < poolMaximumActiveConnections) { // 池中还有空余位置
            // 可以创建新连接，也是通过DriverManager.getConnection拿到的连接
            conn = new PooledConnection(dataSource.getConnection(), this);
            if (log.isDebugEnabled()) {
              log.debug("Created connection " + conn.getRealHashCode() + ".");
            }
          } else { // 连接池已满，不能创建新连接
            // 找到借出去最久的连接
            PooledConnection oldestActiveConnection = state.activeConnections.get(0);
            // 查看借出去最久的连接已经被借了多久
            long longestCheckoutTime = oldestActiveConnection.getCheckoutTime();
            if (longestCheckoutTime > poolMaximumCheckoutTime) { // 借出时间超过设定的借出时长
              // 声明该连接超期不还
              state.claimedOverdueConnectionCount++;
              state.accumulatedCheckoutTimeOfOverdueConnections += longestCheckoutTime;
              state.accumulatedCheckoutTime += longestCheckoutTime;
              // 因超期不还而从池中除名
              state.activeConnections.remove(oldestActiveConnection);
              if (!oldestActiveConnection.getRealConnection().getAutoCommit()) { // 如果超期不还的连接没有设置自动提交事务
                // 尝试替它提交回滚事务
                try {
                  oldestActiveConnection.getRealConnection().rollback();
                } catch (SQLException e) {
                  // 即使替它回滚事务的操作失败，也不抛出异常，仅仅做一下记录
                  log.debug("Bad connection. Could not roll back");
                }
              }
              // 新建一个连接替代超期不还连接的位置
              conn = new PooledConnection(oldestActiveConnection.getRealConnection(), this);
              conn.setCreatedTimestamp(oldestActiveConnection.getCreatedTimestamp());
              conn.setLastUsedTimestamp(oldestActiveConnection.getLastUsedTimestamp());
              oldestActiveConnection.invalidate();
              if (log.isDebugEnabled()) {
                log.debug("Claimed overdue connection " + conn.getRealHashCode() + ".");
              }
            } else { // 借出去最久的连接，并未超期
              // 继续等待，等待有连接归还到连接池
              try {
                if (!countedWait) {
                  // 记录发生等待的次数。某次请求等待多轮也只能算作发生了一次等待
                  state.hadToWaitCount++;
                  countedWait = true;
                }
                if (log.isDebugEnabled()) {
                  log.debug("Waiting as long as " + poolTimeToWait + " milliseconds for connection.");
                }
                long wt = System.currentTimeMillis();
                // 沉睡一段时间再试，防止一直占有计算资源
                state.wait(poolTimeToWait);
                state.accumulatedWaitTime += System.currentTimeMillis() - wt;
              } catch (InterruptedException e) {
                break;
              }
            }
          }
        }
        if (conn != null) { // 取到了连接
          // 判断连接是否可用
          if (conn.isValid()) { // 如果连接可用
            if (!conn.getRealConnection().getAutoCommit()) { // 该连接没有设置自动提交
              // 回滚未提交的操作
              conn.getRealConnection().rollback();
            }
            // 每个借出去的连接都到打上数据源的连接类型编码，以便在归还时确保正确
            conn.setConnectionTypeCode(assembleConnectionTypeCode(dataSource.getUrl(), username, password));
            // 数据记录操作
            conn.setCheckoutTimestamp(System.currentTimeMillis());
            conn.setLastUsedTimestamp(System.currentTimeMillis());
            state.activeConnections.add(conn);
            state.requestCount++;
            state.accumulatedRequestTime += System.currentTimeMillis() - t;
          } else { // 连接不可用
            if (log.isDebugEnabled()) {
              log.debug("A bad connection (" + conn.getRealHashCode() + ") was returned from the pool, getting another connection.");
            }
            state.badConnectionCount++;
            localBadConnectionCount++;
            // 直接删除连接
            conn = null;
            // 如果没有一个连接能用，说明连不上数据库
            if (localBadConnectionCount > (poolMaximumIdleConnections + poolMaximumLocalBadConnectionTolerance)) {
              if (log.isDebugEnabled()) {
                log.debug("PooledDataSource: Could not get a good connection to the database.");
              }
              throw new SQLException("PooledDataSource: Could not get a good connection to the database.");
            }
          }
        }
      }
      // 如果到这里还没拿到连接，则会循环此过程，继续尝试取连接
    }

    if (conn == null) {
      if (log.isDebugEnabled()) {
        log.debug("PooledDataSource: Unknown severe error condition.  The connection pool returned a null connection.");
      }
      throw new SQLException("PooledDataSource: Unknown severe error condition.  The connection pool returned a null connection.");
    }

    return conn;
  }
```
从连接池中获取连接首先会遇到两种情况：

1. 连接池中有空闲连接
2. 连接池中无空闲连接

对于第一种情况，把连接取出返回即可。对于第二种情况，则要进行细分，会有如下的情况。

1. 活跃连接数没有超出最大活跃连接数
2. 活跃连接数超出最大活跃连接数

对于上面两种情况，第一种情况比较好处理，直接创建新的连接即可。至于第二种情况，需要再次进行细分。

1. 活跃连接的运行时间超出限制，即超时了
2. 活跃连接未超时

对于第一种情况，我们直接将超时连接强行中断，并进行回滚，然后复用部分字段重新创建 PooledConnection 即可。对于第二种情况，目前没有更好的处理方式了，只能等待了。

- 回收连接相比于获取连接，回收连接的逻辑要简单的多。回收连接成功与否只取决于空闲连接集合的状态，所需处理情况很少，因此比较简单。

**PooledConnection**
```java
 /**
   * 代理方法
   * @param proxy 代理对象，未用
   * @param method 当前执行的方法
   * @param args 当前执行的方法的参数
   * @return 方法的返回值
   * @throws Throwable
   */
  @Override
  public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    // 获取方法名
    String methodName = method.getName();
    if (CLOSE.hashCode() == methodName.hashCode() && CLOSE.equals(methodName)) { // 如果调用了关闭方法
      // 那么把Connection返回给连接池，而不是真正的关闭
      dataSource.pushConnection(this);
      return null;
    }
    try {
      // 校验连接是否可用
      if (!Object.class.equals(method.getDeclaringClass())) {
        checkConnection();
      }
      // 用真正的连接去执行操作
      return method.invoke(realConnection, args);
    } catch (Throwable t) {
      throw ExceptionUtil.unwrapThrowable(t);
    }
  }
```
我们来看看pushConnection方法，回收一个连接
```java
 /**
   * 收回一个连接
   * @param conn 连接
   * @throws SQLException
   */
  protected void pushConnection(PooledConnection conn) throws SQLException {
    synchronized (state) {
      // 将该连接从活跃连接中删除
      state.activeConnections.remove(conn);
      if (conn.isValid()) { // 当前连接是可用的
        // 判断连接池未满 + 该连接确实属于该连接池
        if (state.idleConnections.size() < poolMaximumIdleConnections && conn.getConnectionTypeCode() == expectedConnectionTypeCode) {
          state.accumulatedCheckoutTime += conn.getCheckoutTime();
          if (!conn.getRealConnection().getAutoCommit()) { // 如果连接没有设置自动提交
            // 将未完成的操作回滚
            conn.getRealConnection().rollback();
          }
          // 重新整理连接
          PooledConnection newConn = new PooledConnection(conn.getRealConnection(), this);
          // 将连接放入空闲连接池
          state.idleConnections.add(newConn);
          newConn.setCreatedTimestamp(conn.getCreatedTimestamp());
          newConn.setLastUsedTimestamp(conn.getLastUsedTimestamp());
          // 设置连接为未校验，以便取出时重新校验
          conn.invalidate();
          if (log.isDebugEnabled()) {
            log.debug("Returned connection " + newConn.getRealHashCode() + " to pool.");
          }
          state.notifyAll();
        } else { // 连接池已满或者该连接不属于该连接池
          state.accumulatedCheckoutTime += conn.getCheckoutTime();
          if (!conn.getRealConnection().getAutoCommit()) {
            conn.getRealConnection().rollback();
          }
          // 直接关闭连接，而不是将其放入连接池中
          conn.getRealConnection().close();
          if (log.isDebugEnabled()) {
            log.debug("Closed connection " + conn.getRealHashCode() + ".");
          }
          conn.invalidate();
        }
      } else { // 当前连接不可用
        if (log.isDebugEnabled()) {
          log.debug("A bad connection (" + conn.getRealHashCode() + ") attempted to return to the pool, discarding connection.");
        }
        state.badConnectionCount++;
      }
    }
  }
```
先将连接从活跃连接集合中移除，如果空闲集合未满，此时复用原连接的字段信息创建新的连接，并将其放入空闲集合中即可；若空闲集合已满，此时无需回收连接，直接关闭即可
最后利用动态代理，生成代理连接对象ConnectionImpl返回
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1676991069268-c9556c49-1ca4-48ec-b009-fbda12682953.png#averageHue=%23516149&clientId=u8a3210c7-f3b5-4&from=paste&height=482&id=ufd1ab63c&originHeight=603&originWidth=1895&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=126990&status=done&style=none&taskId=u272669e5-1129-43fc-b0ab-7207ba1259c&title=&width=1516)
下面我们继续看看PooledConnection动态代理对象的执行过程，跟前面mapper接口动态大力一样我们来看看invoke方法
**PooledConnection**
```java
@Override
  public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    // 获取方法名称
    String methodName = method.getName();
    // 如果是关闭方法，就回收连接
    if (CLOSE.equals(methodName)) {
      dataSource.pushConnection(this);
      return null;
    }
    try {
      if (!Object.class.equals(method.getDeclaringClass())) {
        // issue #579 toString() should never fail
        // throw an SQLException instead of a Runtime
        checkConnection();
      }
      // 调用  ConnectionImpl的方法
      return method.invoke(realConnection, args);
    } catch (Throwable t) {
      throw ExceptionUtil.unwrapThrowable(t);
    }

  }
```
这里我们通过dataSource获取到connection连接，并通过动态代理模式设置了自动提交返回
connection连接
好了，我们已经获取到了数据库连接，接下来要创建**PrepareStatement**了，我们上面JDBC的例子是怎么获取的？ **psmt = conn.prepareStatement(sql);，直接通过Connection来获取，并且把sql传进去了**，我们看看Mybaits中是怎么创建PrepareStatement的
## 2.2 Sql的预编译PreparedStatementHandler
让我们回到之前的步骤，我们已经获取数据库连接，接下来来看看Sql的预编译，从Connection中创建一个Statement

```java
 private Statement prepareStatement(StatementHandler handler, Log statementLog) throws SQLException {
    Statement stmt;
    BoundSql boundSql = handler.getBoundSql();
    String sql = boundSql.getSql();
    if (hasStatementFor(sql)) {
      stmt = getStatement(sql);
      applyTransactionTimeout(stmt);
    } else {
      Connection connection = getConnection(statementLog);
      stmt = handler.prepare(connection, transaction.getTimeout());
      putStatement(sql, stmt);
    }
    handler.parameterize(stmt);
    return stmt;
  }
```
**BaseStatementHandler**
```java
// 从连接中获取一个Statement，并设置事务超时时间
@Override
    public Statement prepare(Connection connection, Integer transactionTimeout) throws SQLException {
    ErrorContext.instance().sql(boundSql.getSql());
    Statement statement = null;
    try {
        // 获取一个Statement对象
        statement = instantiateStatement(connection);
        // 设置设置查询超时时间
        setStatementTimeout(statement, transactionTimeout);
        // 获取数据大小限制
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
```
我们接着来看看instantiateStatemen接口，根据上面的的信息，我们这的默认实现是PreparedStatementHandler
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673870247046-a63ccfd7-bbb1-4438-a14a-bed15f5b6f2c.png#averageHue=%232f2e2d&clientId=ubc87a6d8-0fd8-4&from=paste&height=501&id=u1e1e6876&originHeight=626&originWidth=1416&originalType=binary&ratio=1&rotation=0&showTitle=false&size=138463&status=done&style=none&taskId=u51d87970-019c-48bf-aa7e-28dd25a817c&title=&width=1132.8)
**PreparedStatementHandler**
```java
  @Override
  protected Statement instantiateStatement(Connection connection) throws SQLException {
      //  //获取sql字符串，比如"select * from user where id= ?"
    String sql = boundSql.getSql();
     // / 根据条件调用不同的 prepareStatement 方法创建 PreparedStatement
    if (mappedStatement.getKeyGenerator() instanceof Jdbc3KeyGenerator) {
      String[] keyColumnNames = mappedStatement.getKeyColumns();
      if (keyColumnNames == null) {
           //通过connection获取Statement，将sql语句传进去
        return connection.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS);
      } else {
        return connection.prepareStatement(sql, keyColumnNames);
      }
    }
    // 如果是默认的话
    else if (mappedStatement.getResultSetType() == ResultSetType.DEFAULT) {
       // 通过动态代理模式
      return connection.prepareStatement(sql);
    } else {
      return connection.prepareStatement(sql, mappedStatement.getResultSetType().getValue(), ResultSet.CONCUR_READ_ONLY);
    }
  }
```
**PooledConnection**
```java

@Override
  public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    String methodName = method.getName();
    if (CLOSE.equals(methodName)) {
      dataSource.pushConnection(this);
      return null;
    }
    try {
      if (!Object.class.equals(method.getDeclaringClass())) {
        // issue #579 toString() should never fail
        // throw an SQLException instead of a Runtime
        checkConnection();
      }
      return method.invoke(realConnection, args);
    } catch (Throwable t) {
      throw ExceptionUtil.unwrapThrowable(t);
    }

  }
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677031906508-9b0b7779-15ec-4ad2-8750-b4b6fbf31904.png#averageHue=%235e7c63&clientId=uf9c1fa2e-aa14-4&from=paste&height=660&id=u5af36b57&originHeight=825&originWidth=1862&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=187933&status=done&style=none&taskId=ua8300b8a-52cd-44f1-b3f4-5f8026f6c41&title=&width=1489.6)
**ConnectionImpl**
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677033255320-4cd5ef9d-974b-4c0c-aa67-8f83fbf9449b.png#averageHue=%23576f53&clientId=uf9c1fa2e-aa14-4&from=paste&height=381&id=u34e311d5&originHeight=476&originWidth=1918&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=128003&status=done&style=none&taskId=ud8d6e8b2-949b-4063-b2cf-ed48f29324f&title=&width=1534.4)
最终他还是调用了prepareStatement方法
我们接着上面prepareStatement来看看他到底是如何创建的
**ConnectionImpl**
```java
   @Override
    public java.sql.PreparedStatement prepareStatement(String sql, int resultSetType, int resultSetConcurrency) throws SQLException {
        synchronized (getConnectionMutex()) {
            checkClosed();

            //
            // FIXME: Create warnings if can't create results of the given type or concurrency
            //
            // 客服端预处理语句
            ClientPreparedStatement pStmt = null;

            boolean canServerPrepare = true;

            String nativeSql = this.processEscapeCodesForPrepStmts.getValue() ? nativeSQL(sql) : sql;

            if (this.useServerPrepStmts.getValue() && this.emulateUnsupportedPstmts.getValue()) {
                canServerPrepare = canHandleAsServerPreparedStatement(nativeSql);
            }

            if (this.useServerPrepStmts.getValue() && canServerPrepare) {
                if (this.cachePrepStmts.getValue()) {
                    synchronized (this.serverSideStatementCache) {
                        pStmt = this.serverSideStatementCache.remove(new CompoundCacheKey(this.database, sql));

                        if (pStmt != null) {
                            ((com.mysql.cj.jdbc.ServerPreparedStatement) pStmt).setClosed(false);
                            pStmt.clearParameters();
                        }

                        if (pStmt == null) {
                            try {
                                pStmt = ServerPreparedStatement.getInstance(getMultiHostSafeProxy(), nativeSql, this.database, resultSetType,
                                        resultSetConcurrency);
                                if (sql.length() < this.prepStmtCacheSqlLimit.getValue()) {
                                    ((com.mysql.cj.jdbc.ServerPreparedStatement) pStmt).isCacheable = true;
                                }

                                pStmt.setResultSetType(resultSetType);
                                pStmt.setResultSetConcurrency(resultSetConcurrency);
                            } catch (SQLException sqlEx) {
                                // Punt, if necessary
                                if (this.emulateUnsupportedPstmts.getValue()) {
                                    pStmt = (ClientPreparedStatement) clientPrepareStatement(nativeSql, resultSetType, resultSetConcurrency, false);

                                    if (sql.length() < this.prepStmtCacheSqlLimit.getValue()) {
                                        this.serverSideStatementCheckCache.put(sql, Boolean.FALSE);
                                    }
                                } else {
                                    throw sqlEx;
                                }
                            }
                        }
                    }
                } else {
                    try {
                        pStmt = ServerPreparedStatement.getInstance(getMultiHostSafeProxy(), nativeSql, this.database, resultSetType, resultSetConcurrency);

                        pStmt.setResultSetType(resultSetType);
                        pStmt.setResultSetConcurrency(resultSetConcurrency);
                    } catch (SQLException sqlEx) {
                        // Punt, if necessary
                        if (this.emulateUnsupportedPstmts.getValue()) {
                            pStmt = (ClientPreparedStatement) clientPrepareStatement(nativeSql, resultSetType, resultSetConcurrency, false);
                        } else {
                            throw sqlEx;
                        }
                    }
                }
            } else {
                pStmt = (ClientPreparedStatement) clientPrepareStatement(nativeSql, resultSetType, resultSetConcurrency, false);
            }

            return pStmt;
        }
    }
```
上面的代码设计到JDBC代码，看不懂没关系，我们知道他返回的对象就行了，**ClientPreparedStatement**
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677033684397-8eccf94a-d9de-4b73-9f05-a6c0a7e87739.png#averageHue=%23577c55&clientId=uf9c1fa2e-aa14-4&from=paste&height=631&id=u66b7f9e4&originHeight=789&originWidth=1839&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=185000&status=done&style=none&taskId=u7080a7b3-d720-43d0-b55e-bfa1a49d8c2&title=&width=1471.2)
下面讲解如何为Statement设置参数
## 2.3 为Statement设置参数
**SimpleExecutor**
```java
  private Statement prepareStatement(StatementHandler handler, Log statementLog) throws SQLException {
    Statement stmt;
    Connection connection = getConnection(statementLog);
    stmt = handler.prepare(connection, transaction.getTimeout());
    handler.parameterize(stmt);
    return stmt;
  }
```
我们这里StatementHandler在前面我们已经看到了是PreparedStatementHandler，我们来看看他是如何处理的
**PreparedStatementHandler**
```java
 @Override
  public void parameterize(Statement statement) throws SQLException {
    parameterHandler.setParameters((PreparedStatement) statement);
  }
```
**DefaultParameterHandler**
```java
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
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677034090267-713c7578-57c1-4600-a409-4c9ec819f68b.png#averageHue=%235a8554&clientId=uf9c1fa2e-aa14-4&from=paste&height=521&id=ufb171db0&originHeight=651&originWidth=1879&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=213529&status=done&style=none&taskId=uc4fce3fb-6fb4-4427-9c9f-344d3bc48c1&title=&width=1503.2)
可以看到调用不同的参数处理器来设置参数类型，我们先看看TypeHandler这个接口信息
**TypeHandler**
```java
public interface TypeHandler<T> {

    /**
     * 设置参数
     * @param ps
     * @param i
     * @param parameter
     * @param jdbcType
     * @throws SQLException
     */
    void setParameter(PreparedStatement ps, int i, T parameter, JdbcType jdbcType) throws SQLException;

    /**
     * 获取结果
     * @param rs
     * @param columnName
     * @return
     * @throws SQLException
     */
    T getResult(ResultSet rs, String columnName) throws SQLException;

    T getResult(ResultSet rs, int columnIndex) throws SQLException;

    T getResult(CallableStatement cs, int columnIndex) throws SQLException;
}

```
调用不同的参数处理器，来设置不同的参数这里的类型调用来设置参数
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673872268183-37fa3903-7dc1-418f-972a-d5f21fff63ba.png#averageHue=%2341484f&clientId=ubc87a6d8-0fd8-4&from=paste&height=420&id=ub49815c9&originHeight=525&originWidth=914&originalType=binary&ratio=1&rotation=0&showTitle=false&size=145198&status=done&style=none&taskId=u58bf973f-7ded-4ef8-a71c-88f63740790&title=&width=731.2)
BaseTypeHandler<T>来处理的设置参数类型，而许多类型的处理器继承BaseTypeHandler
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673872745700-e99cc782-bf74-4c2a-9e5e-e8a96cf5c072.png#averageHue=%232c2c2c&clientId=ubc87a6d8-0fd8-4&from=paste&height=391&id=u98f4468d&originHeight=489&originWidth=1110&originalType=binary&ratio=1&rotation=0&showTitle=false&size=14246&status=done&style=none&taskId=u471904cf-4a7f-466e-b252-ac01a9f4ff5&title=&width=888)
最后根据参数类型，调用java.sql.PreparedStatement类中的参数赋值方法，对SQL语句中的参数赋值
**DefaultParameterHandler**
```java
typeHandler.setParameter(ps, i + 1, value, jdbcType);
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677034251249-3350e3a3-b789-4d28-bf06-9c8af306a393.png#averageHue=%23484f4f&clientId=uf9c1fa2e-aa14-4&from=paste&height=549&id=ub1dabb40&originHeight=686&originWidth=1901&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=179742&status=done&style=none&taskId=u7c5b9172-1304-4f15-bd9c-1749f6c1c16&title=&width=1520.8)
参数也设置好了，下面我们来看看执行具体的查询语句吧，最后
## 2.4 执行具体的语句过程
回到刚开始的地方
**SimpleExecutor**
```java
 @Override
  public int doUpdate(MappedStatement ms, Object parameter) throws SQLException {
    Statement stmt = null;
    try {
      Configuration configuration = ms.getConfiguration();
      // 获取不同的StatementHandler处理器
      StatementHandler handler = configuration.newStatementHandler(this, ms, parameter, RowBounds.DEFAULT, null, null);
      // 获取到不同的 Statement并完成参数绑定
      stmt = prepareStatement(handler, ms.getStatementLog());
      // 交给具体的StatementHandler实现执行
      return handler.update(stmt);
    } finally {
      closeStatement(stmt);
    }
  }
```
我们以默认为例：PreparedStatementHandler
**PreparedStatementHandler**
```java
 @Override
  public int update(Statement statement) throws SQLException {
     //ClientPreparedStatement对象
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
从前面的数据库连接开始，我们就可以知道PreparedStatement返回的对象是ClientPreparedStatement，因此我们来看看他的execute方法
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1676429971026-34429e5d-98d3-4cd3-8b47-07ccfecda0f2.png#averageHue=%232c2b2b&clientId=u7b1f45f4-7f86-4&from=paste&height=350&id=uc816b1fa&originHeight=438&originWidth=1217&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=66419&status=done&style=none&taskId=uc44fb48a-7a3a-4310-8c23-e9fb28dac65&title=&width=973.6)
**ClientPreparedStatement**
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1676430995235-e2d385b9-c3c8-4579-9e21-4167a29eaa1a.png#averageHue=%235e805f&clientId=ub693f1f9-ce12-4&from=paste&height=527&id=u6f53cbc8&originHeight=659&originWidth=1905&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=197000&status=done&style=none&taskId=u952a7cea-4473-4aee-a1fe-1d73b943d63&title=&width=1524)
**ClientPreparedStatement**
```java
  @Override
    public boolean execute() throws SQLException {
            // 其他代码省略
            rs = executeInternal(this.maxRows, sendPacket, createStreamingResultSet(),
                    (((PreparedQuery<?>) this.query).getParseInfo().getFirstStmtChar() == 'S'), cachedMetadata, false);
  			 // 其他代码省略
    }


  protected <M extends Message> ResultSetInternalMethods executeInternal(int maxRowsToRetrieve, M sendPacket, boolean createStreamingResultSet,
            boolean queryIsSelectOnly, ColumnDefinition metadata, boolean isBatch) throws SQLException {
    	  // 其他代码省略

   rs = ((NativeSession) locallyScopedConnection.getSession()).execSQL(this, null, maxRowsToRetrieve, (NativePacketPayload) sendPacket,
                            createStreamingResultSet, getResultSetFactory(), metadata, isBatch);
       	// 其他代码省略

            }
```
关键在于调用executeInternal方法，感兴趣的朋友可以自己通过Debug去查看
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1676431722925-11da94d1-d83b-4c3f-bf47-1e566a65ad24.png#averageHue=%23608469&clientId=ub693f1f9-ce12-4&from=paste&height=595&id=u3d018a14&originHeight=744&originWidth=1892&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=208307&status=done&style=none&taskId=u1dad028b-458f-4d58-b343-af332118b1c&title=&width=1513.6)
到最后我们可以拿到ResultSetImpl中拿到执行的结果
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677034948146-e2bc81a6-dcdd-4c0b-9a88-c13aab896ce9.png#averageHue=%23495252&clientId=uf9c1fa2e-aa14-4&from=paste&height=581&id=u55e505d8&originHeight=726&originWidth=1913&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=147483&status=done&style=none&taskId=u1126736e-b806-405d-ad9f-07f32443fd1&title=&width=1530.4)
**PreparedStatementHandler**
```java
   int rows = ps.getUpdateCount();
```
**ClientPreparedStatement**
```java
    @Override
    public int getUpdateCount() throws SQLException {
        // 调用父类的方法
        int count = super.getUpdateCount();
        if (containsOnDuplicateKeyUpdateInSQL() && this.compensateForOnDuplicateKeyUpdate) {
            if (count == 2 || count == 0) {
                count = 1;
            }
        }
        return count;
    }
```
详细的过程，请参考mysql驱动包的源码部分，下面介绍数据库结果对对象关系的隐射

