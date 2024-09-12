---
title: 1-JDBC的详解
sidebar_position: 2
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

- 官网：[mybatis – MyBatis 3 | 简介](https://mybatis.org/mybatis-3/zh/index.html)
- 参考书籍：[MyBatis 3源码深度解析-江荣波-微信读书](https://weread.qq.com/web/bookDetail/62c3207071a4957c62cf0b7)

# 一 JDBC
### 1.1 JDBC介绍

- JDBC（Java Database Connectivity）是Java语言中提供的访问关系型数据的接口。
- JDBC API基于X/Open SQL CLI，是ODBC的基础。
- JDBC提供了一种自然的、易于使用的Java语言与数据库交互的接口，自1997年1月Java语言引入JDBC规范后，JDBC API被广泛接受，并且广大数据库厂商开始提供JDBC驱动的实现。
- JDBC API为Java程序提供了访问一个或多个数据源的方法，在大多数情况下，数据源是关系型数据库，它的数据是通过SQL语句来访问的。

> 案例

```java
 // JDBC基本使用案例
    @Test
    public void JdbcTest() throws ClassNotFoundException, SQLException {
        // 1.加载驱动
        Class.forName("com.mysql.jdbc.Driver");
        // 2.获取连接
        String url = "jdbc:mysql://localhost:3306/user?useSSL=false";
        String username = "root";
        String password = "123456";
        Connection connection = DriverManager.getConnection(url,username,password);
        // 3.获取执行器
        Statement statement = connection.createStatement();
        // 4.执行SQL
        String sql = "select * from user";
        // 5.获取结果集
        boolean execute = statement.execute(sql);
        System.out.println("执行结果："+execute);
        ResultSet resultSet = statement.getResultSet();
        // 6.处理结果集
        while (resultSet.next()){
            System.out.println(resultSet.getString("id"));
            System.out.println(resultSet.getString("name"));
            System.out.println(resultSet.getString("age"));
            System.out.println(resultSet.getString("sex"));
            System.out.println(resultSet.getString("phone"));
            System.out.println(resultSet.getString("address"));
        }
        // 7.关闭资源
        resultSet.close();
        statement.close();
        connection.close();
    }
```
我们可以看到其实步骤十分简单，但是过程很繁琐，Mybatis已经帮我们完成了封装，大体的过程也贯穿于Mybatis的执行过程，下面我们来讲解具体的执行逻辑，其实可以更好的帮助我们理解Mybatis的源码
### 1.2 建立数据源连接
- JDBC API中定义了Connection接口，用来表示与底层数据源的连接。JDBC应用程序可以使用以下两种方式获取Connection对象。
  DriverManager：这是一个在JDBC 1.0规范中就已经存在、完全由JDBC API实现的驱动管理类。当应用程序第一次尝试通过URL连接数据源时，DriverManager会自动加载CLASSPATH下所有的JDBC驱动，上面的案例使用的就是这样的方式

```java
 Connection connection = DriverManager.getConnection(url,username,password);
```
- DataSource：这个接口是在JDBC 2.0规范可选包中引入的API。它比DriverManager更受欢迎，因为它提供了更多底层数据源相关的细节，而且对应用来说，不需要关注JDBC驱动的实现，在Mybatis执行器获取数据源连接时使用的这种方式，但是其实还是交给了DriverManager

```java
  @Override
  public Connection getConnection() throws SQLException {
    return doGetConnection(username, password);
  }
```
- 需要注意的是，JDBC API中只提供了DataSource接口，没有提供DataSource的具体实现，DataSource具体的实现由JDBC驱动程序提供。另外，目前一些主流的数据库连接池（例如DBCP、C3P0、Druid等）也提供了DataSource接口的具体实现。

>源码分析

- 我们通过前面的对Mybatis的源码分析，我们就已经知道了Mybayis获取数据源连接对象实际上交给了UnpooledDataSource与PooledDataSource，但是实际上还是调用了DriverManager来获取数据库连接，所以我们先介绍Mybatis获取数据库连接
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
- 我们来到关键代码获取数据库连接Connection，可以看到实际上他的获取方式与我们的事务管理器息息相关，而Mybatis中使用的默认事务管理器JdbcTransaction，他的创建在Session的初始化的时候决定的

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
    // DataSource 中获取connection
    connection = dataSource.getConnection();
    if (level != null) {
      connection.setTransactionIsolation(level.getLevel());
    }
    setDesiredAutoCommit(autoCommit);
  }

```
- 但是Mybatis的默认DataSource是：PooledDataSource，下面我们来看看

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
- 上面代码折磨多，我们只看关键部分，其实池化技术建立在非池化技术上的，我们我们还是来看看UnpooledDataSource#getConnection方法
  **UnpooledDataSource**

```java
  @Override
  public Connection getConnection() throws SQLException {
    return doGetConnection(username, password);
  }

//
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
可以看到其实我们编写的案例代码其实差不多，最终一个Connection对象，简单来说就是通过遍历驱动获取连接，下面我们来仔细讲解一下Connection对象
### 1.3 Connection
一个Connection对象表示通过JDBC驱动与数据源建立的连接，这里的数据源可以是关系型数据库管理系统（DBMS）、文件系统或者其他通过JDBC驱动访问的数据。

- 使用JDBC API的应用程序可能需要维护多个Connection对象，一个Connection对象可能访问多个数据源，也可能访问单个数据源。
- 我们可以通过两种方式获取JDBC中的Connection对象：（1）通过JDBC API中提供的DriverManager类获取。（2）通过DataSource接口的实现类获取（实现）。

#### 1.3.1 数据库驱动
JDBC-ODBC Bridge Driver：SUN发布JDBC规范时，市场上可用的JDBC驱动程序并不多，但是已经逐渐成熟的ODBC方案使得通过ODBC驱动程序几乎可以连接所有类型的数据源。所以SUN发布了JDBC-ODBC的桥接驱动，利用现成的ODBC架构将JDBC调用转换为ODBC调用，避免了JDBC无驱动可用的窘境。

- Native API Driver：这类驱动程序会直接调用数据库提供的原生链接库或客户端，因为没有中间过程，访问速度通常表现良好，但是驱动程序与数据库和平台绑定无法达到JDBC跨平台的基本目的，在JDBC规范中也是不被推荐的选择。
- JDBC-Net Driver：这类驱动程序会将JDBC调用转换为独立于数据库的协议，然后通过特定的中间组件或服务器转换为数据库通信协议，主要目的是获得更好的架构灵活性。
  Native Protocol Driver：这是最常见的驱动程序类型，开发中使用的驱动包基本都属于此类，通常由数据库厂商直接提供，例如mysql-connector-java，驱动程序把JDBC调用转换为数据库特定的网络通信协议，使用网络通信，驱动程序可以纯Java实现，支持跨平台部署，性能也较好。

#### 1.3.2 Driver接口
- 所有的JDBC驱动都必须实现Driver接口，而且实现类必须包含一个静态初始化代码块。我们知道，类的静态初始化代码块会在类初始化时调用，驱动实现类需要在静态初始化代码块中向DriverManager注册自己的一个实例

> **Mysql驱动**

```java
public class Driver extends NonRegisteringDriver implements java.sql.Driver {
    //
    // Register ourselves with the DriverManager
    //
    static {
        try {
            java.sql.DriverManager.registerDriver(new Driver());
        } catch (SQLException E) {
            throw new RuntimeException("Can't register driver!");
        }
    }

    /**
     * Construct a new driver and register it with DriverManager
     *
     * @throws SQLException
     *             if a database error occurs.
     */
    public Driver() throws SQLException {
        // Required for Class.forName().newInstance()
    }
}
```
- DriverManager类与注册的驱动程序进行交互时会调用Driver接口中提供的方法。Driver接口中提供了一个acceptsURL()方法，DriverManager类可以通过Driver实现类的acceptsURL()来判断一个给定的URL是否能与数据库成功建立连接。
- 当我们试图使用DriverManager与数据库建立连接时，会调用Driver接口中提供的connect()方法。
- 该方法有两个参数：第一个参数为驱动能够识别的URL；第二个参数为与数据库建立连接需要的额外参数，例如用户名、密码等。
  当Driver实现类能够与数据库建立连接时，就会返回一个Connection对象，当Driver实现类无法识别URL时则会返回null。

#### 1.3.3 DriverManager
可以看到我们实际上调用数据连接上DriverManager已经完成了驱动的初始化

> **DriverManager**

```java
 /**
     * Load the initial JDBC drivers by checking the System property
     * jdbc.properties and then use the {@code ServiceLoader} mechanism
     */
    static {
        loadInitialDrivers();
        println("JDBC DriverManager initialized");
    }
```
```java
 private static void loadInitialDrivers() {
        String drivers;
        try {
            drivers = AccessController.doPrivileged(new PrivilegedAction<String>() {
                public String run() {
                    return System.getProperty("jdbc.drivers");
                }
            });
        } catch (Exception ex) {
            drivers = null;
        }
        // If the driver is packaged as a Service Provider, load it.
        // Get all the drivers through the classloader
        // exposed as a java.sql.Driver.class service.
        // ServiceLoader.load() replaces the sun.misc.Providers()

        AccessController.doPrivileged(new PrivilegedAction<Void>() {
            public Void run() {

                ServiceLoader<Driver> loadedDrivers = ServiceLoader.load(Driver.class);
                Iterator<Driver> driversIterator = loadedDrivers.iterator();

                /* Load these drivers, so that they can be instantiated.
                 * It may be the case that the driver class may not be there
                 * i.e. there may be a packaged driver with the service class
                 * as implementation of java.sql.Driver but the actual class
                 * may be missing. In that case a java.util.ServiceConfigurationError
                 * will be thrown at runtime by the VM trying to locate
                 * and load the service.
                 *
                 * Adding a try catch block to catch those runtime errors
                 * if driver not available in classpath but it's
                 * packaged as service and that service is there in classpath.
                 */
                try{
                    while(driversIterator.hasNext()) {
                        driversIterator.next();
                    }
                } catch(Throwable t) {
                // Do nothing
                }
                return null;
            }
        });

        println("DriverManager.initialize: jdbc.drivers = " + drivers);

        if (drivers == null || drivers.equals("")) {
            return;
        }
        String[] driversList = drivers.split(":");
        println("number of Drivers:" + driversList.length);
        for (String aDriver : driversList) {
            try {
                println("DriverManager.Initialize: loading " + aDriver);
                Class.forName(aDriver, true,
                        ClassLoader.getSystemClassLoader());
            } catch (Exception ex) {
                println("DriverManager.Initialize: load failed: " + ex);
            }
        }
    }
```

- 简单来说就是通过Java的SPI机制，去动态发现实现类，关键在于ServiceLoader# load方法 classpath下META-INF/services目录的java.sql.Driver文件中指定的所有实现类都会被加载。
- 在loadInitialDrivers()方法中，通过JDK内置的ServiceLoader机制加载java.sql.Driver接口的实现类，然后对所有实现类进行遍历，这样就完成了驱动类的加载。驱动实现类会在自己的静态代码块中将驱动实现类的实例注册到DriverManager中，这样就取代了通过调用Class.forName()方法加载驱动的过程。

> 具体讲解

- DriverManager类通过Driver接口为JDBC客户端管理一组可用的驱动实现，当客户端通过DriverManager类和数据库建立连接时，DriverManager类会根getConnection()方法参数中的URL找到对应的驱动实现类，然后使用具体的驱动实现连接到对应的数据库。

- registerDriver()：该方法用于将驱动的实现类注册到DriverManager类中，这个方法会在驱动加载时隐式地调用，而且通常在每个驱动实现类的静态初始化代码块中调用。

- getConnection()：这个方法是提供给JDBC客户端调用的，可以接收一个JDBC URL作为参数，DriverManager类会对所有注册驱动进行遍历，调用Driver实现的connect()方法找到能够识别JDBC URL的驱动实现后，会与数据库建立连接，然后返回Connection对象。

注册方法我们看过了，我们来看看获取数据源连接对象方法

> **DriverManager**

```java
private static Connection getConnection(
        String url, java.util.Properties info, Class<?> caller) throws SQLException {
        /*
         * When callerCl is null, we should check the application's
         * (which is invoking this class indirectly)
         * classloader, so that the JDBC driver class outside rt.jar
         * can be loaded from here.
         */
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

        // Walk through the loaded registeredDrivers attempting to make a connection.
        // Remember the first exception that gets raised so we can reraise it.
        SQLException reason = null;

        for(DriverInfo aDriver : registeredDrivers) {
            // If the caller does not have permission to load the driver then
            // skip it.
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
我们可以从上面看到遍历所有注册的驱动，交给实际上我们注册的驱动来获取数据源连接对象，这里一Mysql为例

> **NonRegisteringDriver**

```java
 @Override
    public java.sql.Connection connect(String url, Properties info) throws SQLException {

        try {
            if (!ConnectionUrl.acceptsUrl(url)) {
                /*
                 * According to JDBC spec:
                 * The driver should return "null" if it realizes it is the wrong kind of driver to connect to the given URL. This will be common, as when the
                 * JDBC driver manager is asked to connect to a given URL it passes the URL to each loaded driver in turn.
                 */
                return null;
            }

            ConnectionUrl conStr = ConnectionUrl.getConnectionUrlInstance(url, info);
            switch (conStr.getType()) {
                case SINGLE_CONNECTION:
                    return com.mysql.cj.jdbc.ConnectionImpl.getInstance(conStr.getMainHost());

                case FAILOVER_CONNECTION:
                case FAILOVER_DNS_SRV_CONNECTION:
                    return FailoverConnectionProxy.createProxyInstance(conStr);

                case LOADBALANCE_CONNECTION:
                case LOADBALANCE_DNS_SRV_CONNECTION:
                    return LoadBalancedConnectionProxy.createProxyInstance(conStr);

                case REPLICATION_CONNECTION:
                case REPLICATION_DNS_SRV_CONNECTION:
                    return ReplicationConnectionProxy.createProxyInstance(conStr);

                default:
                    return null;
            }

        } catch (UnsupportedConnectionStringException e) {
            // when Connector/J can't handle this connection string the Driver must return null
            return null;

        } catch (CJException ex) {
            throw ExceptionFactory.createException(UnableToConnectException.class,
                    Messages.getString("NonRegisteringDriver.17", new Object[] { ex.toString() }), ex);
        }
    }
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1678712845583-3ce97eec-9d7b-48ca-bc14-daebdedf8b2f.png#averageHue=%236a8464&clientId=uc58fabb7-829e-4&from=paste&height=652&id=u08f578f1&originHeight=815&originWidth=1881&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=202435&status=done&style=none&taskId=u0e96856e-3551-4721-bbf9-60c1f33098c&title=&width=1504.8)
这里传入URL，账号，密码来获取ConnectionUrl，实际上通过内部的枚举类类型来获取不同驱动的数据库连接对象
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1678713044469-737f858d-a86b-4add-b240-2cccdb88f269.png#averageHue=%234d614a&clientId=uc58fabb7-829e-4&from=paste&height=561&id=u48562d6d&originHeight=701&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=193263&status=done&style=none&taskId=u2959e89b-bcd9-4632-9d0b-f2b449ddf61&title=&width=1536)
```java
 public enum Type {
        // DNS SRV schemes (cardinality is validated by implementing classes):
        FAILOVER_DNS_SRV_CONNECTION("jdbc:mysql+srv:", HostsCardinality.ONE_OR_MORE, "com.mysql.cj.conf.url.FailoverDnsSrvConnectionUrl"), //
        LOADBALANCE_DNS_SRV_CONNECTION("jdbc:mysql+srv:loadbalance:", HostsCardinality.ONE_OR_MORE, "com.mysql.cj.conf.url.LoadBalanceDnsSrvConnectionUrl"), //
        REPLICATION_DNS_SRV_CONNECTION("jdbc:mysql+srv:replication:", HostsCardinality.ONE_OR_MORE, "com.mysql.cj.conf.url.ReplicationDnsSrvConnectionUrl"), //
        XDEVAPI_DNS_SRV_SESSION("mysqlx+srv:", HostsCardinality.ONE_OR_MORE, "com.mysql.cj.conf.url.XDevApiDnsSrvConnectionUrl"), //
        // Standard schemes:
        SINGLE_CONNECTION("jdbc:mysql:", HostsCardinality.SINGLE, "com.mysql.cj.conf.url.SingleConnectionUrl", PropertyKey.dnsSrv, FAILOVER_DNS_SRV_CONNECTION), //
        FAILOVER_CONNECTION("jdbc:mysql:", HostsCardinality.MULTIPLE, "com.mysql.cj.conf.url.FailoverConnectionUrl", PropertyKey.dnsSrv,
                FAILOVER_DNS_SRV_CONNECTION), //
        LOADBALANCE_CONNECTION("jdbc:mysql:loadbalance:", HostsCardinality.ONE_OR_MORE, "com.mysql.cj.conf.url.LoadBalanceConnectionUrl", PropertyKey.dnsSrv,
                LOADBALANCE_DNS_SRV_CONNECTION), //
        REPLICATION_CONNECTION("jdbc:mysql:replication:", HostsCardinality.ONE_OR_MORE, "com.mysql.cj.conf.url.ReplicationConnectionUrl", PropertyKey.dnsSrv,
                REPLICATION_DNS_SRV_CONNECTION), //
        XDEVAPI_SESSION("mysqlx:", HostsCardinality.ONE_OR_MORE, "com.mysql.cj.conf.url.XDevApiConnectionUrl", PropertyKey.xdevapiDnsSrv,
                XDEVAPI_DNS_SRV_SESSION);
 }
```
终止通过DriverManager获取到连接返回给Mybatis，执行下一步的操作
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1678713342523-1d1762a9-f5d0-46f2-831a-6f9a2dfc366d.png#averageHue=%236c8565&clientId=uc58fabb7-829e-4&from=paste&height=626&id=u9bc4b5df&originHeight=783&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=199577&status=done&style=none&taskId=u865fbb99-8300-4116-af7a-358d1a1aebb&title=&width=1536)
补充一点：数据库连接需要关闭哦
## 1.4 Statement
上面我们已经通过DriverManager获取到数据库连接，现在我们根据流程来执行下一步我们首先来看看Statement接口
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1678713772589-96e7a102-1be9-4207-b328-c6e42d465aff.png#averageHue=%232f2e2d&clientId=uc58fabb7-829e-4&from=paste&height=567&id=u5c68f167&originHeight=709&originWidth=1407&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=45278&status=done&style=none&taskId=u88c8dbbd-cbc6-4928-859e-8223682ec18&title=&width=1125.6)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1678713842033-8bf42c2e-b6cd-407e-89f0-8b30e25c477b.png#averageHue=%23f4f4f4&clientId=uc58fabb7-829e-4&from=paste&height=651&id=u18b31806&originHeight=814&originWidth=873&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=401209&status=done&style=none&taskId=u70553e91-2672-4c52-840b-fbe5292e68a&title=&width=698.4)

- JdbcStatement：这个接口包含了一些方法，这些方法被认为是用于MySQL实现java.sql.Statement的JDBC API的“供应商扩展”。
- CallableStatement：用于执行SQL存储过程的接口。JDBC API提供了一种存储过程SQL转义语法，允许以标准方式对所有rdbms调用存储过程。此转义语法有一种形式包含结果形参，另一种形式不包含结果形参。如果使用，结果参数必须注册为OUT参数。其他参数可用于输入、输出或同时用于输入和输出。参数按数字顺序引用，第一个参数为1。 {?= call  [( ， ，…)]} {call  [( ， ，…)]}
- PreparedStatement：表示预编译SQL语句的对象。 SQL语句被预编译并存储在PreparedStatement对象中。然后，可以使用该对象多次有效地执行此语句。

Statement接口中提供的与数据库交互的方法比较多，具体调用哪个方法取决于SQL语句的类型，下面我们仔细来讲解一下PreparedStatement接口与CallableStatement接口方法
### 1.4.1 PreparedStatement

- PreparedStatement接口继承自Statement接口，在Statement接口的基础上增加了参数占位符功能。
- PreparedStatement的实例表示可以被预编译的SQL语句，执行一次后，后续多次执行时效率会比较高。使用PreparedStatement实例执行SQL语句时，可以使用“?”作为参数占位符，然后使用PreparedStatement接口中提供的方法为占位符设置参数值。
```java
    // JDBC基本使用案例
    @Test
    public void JdbcTest() throws ClassNotFoundException, SQLException {
        // 1.加载驱动
        Class.forName("com.mysql.jdbc.Driver");
        // 2.获取连接
        String url = "jdbc:mysql://localhost:3306/db1?useSSL=false";
        String username = "root";
        String password = "123456";
        Connection connection = DriverManager.getConnection(url,username,password);
        // 3.获取执行器
        PreparedStatement statement1 = connection.prepareStatement("select * from user");
        statement1.execute();
        // 4.获取结果集
        ResultSet resultSet = statement1.getResultSet();
        // 6.处理结果集
        while (resultSet.next()){
            System.out.println(resultSet.getString("id"));
            System.out.println(resultSet.getString("name"));
            System.out.println(resultSet.getString("age"));
            System.out.println(resultSet.getString("sex"));
            System.out.println(resultSet.getString("phone"));
            System.out.println(resultSet.getString("address"));
        }
        // 7.关闭资源
        resultSet.close();
        statement1.close();
        connection.close();
    }

```
在使用PreparedStatement对象执行SQL时，JDBC驱动通过setAsciiStream()、setBinaryStream()、setCharacterStream()、setNCharacterStream()或setUnicodeStream()等方法读取参数占位符设置的值。这些参数值必须在下一次执行SQL时重置掉，否则将会抛出SQLException异常。
### 1.4.2 CallableStatement（了解）
CallableStatement接口继承自PreparedStatement接口，在PreparedStatement的基础上增加了调用存储过程并检索调用结果的功能。与Statement、PreparedStatement一样，CallableStatement对象也是通过Connection对象创建的，我们只需要调用Connection对象的prepareCall()方法即
CallableStatement对象可以使用3种类型的参数：IN、OUT和INOUT。可以将参数指定为序数参数或命名参数，必须为IN或INOUT参数的每个参数占位符设置一个值，必须为OUT或INOUT参数中的每个参数占位符调用registerOutParameter()方法。
## 1.5 ResultSet
### 1.5.1 ResultSet类型

- TYPE_FORWARD_ONLY：这种类型的ResultSet不可滚动，游标只能向前移动，从第一行到最后一行，不允许向后移动，即只能使用ResultSet接口的next()方法，而不能使用previous()方法，否则会产生错误。
- TYPE_SCROLL_INSENSITIVE：这种类型的ResultSet是可滚动的，它的游标可以相对于当前位置向前或向后移动，也可以移动到绝对位置，当ResultSet没有关闭时，ResultSet的修改对数据库不敏感，也就是说对ResultSet对象的修改不会影响对应的数据库中的记录。
- TYPE_SCROLL_SENSITIVE：这种类型的ResultSet是可滚动的，它的游标可以相对于当前位置向前或向后移动，也可以移动到绝对位置。当ResultSet没有关闭时，对ResultSet对象的修改会直接影响数据库中的记录。
- 默认情况下，ResultSet的类型为TYPE_FORWARD_ONLY。
### 1.5.2 ResultSet并行性
ResultSet对象的并行性决定了它支持更新的级别，目前JDBC中支持两个级别

1. CONCUR_READ_ONLY：为ResultSet对象设置这种属性后，只能从ResulSet对象中读取数据，但是不能更新ResultSet对象中的数据。
2. CONCUR_UPDATABLE：该属性表明，既可以从ResulSet对象中读取数据，又能更新ResultSet中的数据。
3. ResultSet对象默认并行性为CONCUR_READ_ONLY。
### 1.5.3 ResultSet可保持性
调用Connection对象的commit()方法能够关闭当前事务中创建的ResultSet对象。

1. HOLD_CURSORS_OVER_COMMIT：当调用Connection对象的commit()方法时，不关闭当前事务创建的ResultSet对象。
2. CLOSE_CURSORS_AT_COMMIT：当前事务创建的ResultSet对象在事务提交后会被关闭，对一些应用程序来说，这样能够提升系统性能。
3. ResultSet对象的默认可保持性取决于具体的驱动实现，DatabaseMetaData接口中提供了getResultSetHoldability()方法用于获取JDBC驱动的默认可保持性。

当然这些都可以在代码中进行实现
```java
        connection.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,ResultSet.CONCUR_READ_ONLY);
```
### 1.5.4 ResultSet游标移动
ResultSet对象中维护了一个游标，游标指向当前数据行。当ResultSet对象第一次创建时，游标指向数据的第一行。ResultSet接口中提供了一系列的方法，用于操作ResultSet对象中的游标，下面介绍下常用的方法

1. next()：游标向前移动一行，如果游标定位到下一行，则返回true；如果游标位于最后一行之后，则返回false。
2. previous()：游标向后移动一行，如果游标定位到上一行，则返回true；如果游标位于第一行之前，则返回false。
3. first()：游标移动到第一行，如果游标定位到第一行，则返回true；如果ResultSet对象中一行数据都没有，则返回false。
4. last()：移动游标到最后一行，如果游标定位到最后一行，则返回true；如果ResultSet不包含任何数据行，则返回false。

注意：当ResultSet对象的类型为TYPE_FORWARD_ONLY时，游标只能向前移动，调用其他方法操作游标向后移动时将会抛出SQLException异常。
### 1.5.5 关闭ResultSet对象
ResultSet对象在下面两种情况下会显式地关闭：

1. 调用ResultSet对象的close()方法。
2. 创建ResultSet对象的Statement或者Connection对象被显式地关闭。

一些JDBC驱动实现，当ResultSet类型为TYPE_FORWARD_ONLY并且next()方法返回false时，也会隐式地关闭ResultSet对象。
ResultSet对象关闭后，不会关闭由ResultSet对象创建的Blob、Clob、NClob或SQLXML对象，除非调用这些对象的free()方法。

