---
title: Mybatis源码分析（三）SqlSessionFactory的初始化
sidebar_position: 5
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

![XMLConfigBuilder.drawio.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681353611874-d4341657-9392-4e6b-8b0f-07fb9952e3ab.png#averageHue=%23f8f7f6&clientId=u2b273130-a14b-4&from=ui&id=u3a1a1383&originHeight=701&originWidth=1981&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=444034&status=done&style=none&taskId=u02ff3473-0dd2-405c-afa6-f313aadf46b&title=)
上篇文件我们介绍了如何获取到Mybatis-conf.xml文件的过程，现在我们来看看获取获取SqlSessionFactory，上一篇文章我们介绍了Mybatis-conf.xml的文件获取，相当于我们现在已经拿到了配置文件交给SqlSessionFactory进行解析，下面我们来看看SqlSessionFactory是如何进行解析的?

---

> 学习到的知识

:::info

1. XMLConfigBuilder对Xml文件的解析
2. XPathParser解析器对各种文件的解析
3. Configuration的初始化，各种配置文件的初始化
4. Mapper 文件的解析，动态代理的实现（下一篇文章详细介绍）
5. 设计模式：建造者模式
:::

---

> 过程梳理

:::warning

1. 我们通过Resources获取到配置文件，转换成输入流
2. 通过SqlSessionFactoryBuilder的build的方法对配置文件解析
3. build的方法调用XMLConfigBuilder的方法进行解析
4. XMLConfigBuilder类的构造器，完成对Configuration类的初始化
5. Configuration主要完成对类型别名处理器的注册，语言驱动的注册
6. 完成对XMLConfigBuilder类的初始化后，调用parse（）方法，进行XML节点解析
7. 开始对XML文件进行解析，XML文件必须以/configuration节点为开头节点
8. 接着对我们配置的各个节点进行解析（具体配置参考官网）
9. 首先解析properties，以保证在解析其他节点时便可以生效，解析完成对Configuration进行设置
10. 解析settings节点信息，解析完成对Configuration进行设置，主要对VFS加载系统和LOGS日志的实现，但是可以不配置有默认实现类
11. 解析typeAliases节点信息，主要对我们Mybatis中编写的别名，可以通过包扫描或者手动的方式完成对别名的注册
12. 解析plugins节点信息，主要可以自己定义实现，通过拦截器的方式，完成插件的功能
13. 解析objectFactory节点，主要解析自定义的对象工厂
14. 解析reflectorFactory节点信息，主要解析自定义的反射工厂
15. 解析environments节点信息，主要是对数据库的操作配置信息，事务工厂，数据库连接，用户名，密码等等配置进行解析
16. 解析databaseIdProvider节点信息，主要是数据库厂商标识
17. 解析typeHandler节点，类型处理器，针对不同的类型进行处理
18. 解析Mapper节点信息，增删改查语句，结果隐射
19. 最后完成了Configuration的初始化，构建DefaultSqlSession对象
:::

---

# 一 解析配置文件入口
```java
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
```

- 我们看到代码中Build方法，就是程序的入口，我们来看一看吧

_**SqlSessionFactory**_
```java
// 第一步调用这个方法
public SqlSessionFactory build(InputStream inputStream) {
    return build(inputStream, null, null);
  }
// 第二部调用重载方法
 public SqlSessionFactory build(Reader reader, String environment, Properties properties) {
    try {
        // 创建文件解析器
      XMLConfigBuilder parser = new XMLConfigBuilder(reader, environment, properties);
        // 调用解析器的parse方法
      return build(parser.parse());
    } catch (Exception e) {
      throw ExceptionFactory.wrapException("Error building SqlSession.", e);
    } finally {
      ErrorContext.instance().reset();
      try {
        reader.close();
      } catch (IOException e) {
        // Intentionally ignore. Prefer previous error.
      }
    }
  }


```

- 看到这个结构，我们应该感到熟悉，啊，这不就是建造者模式吗？没错，SqlSessionFactory中用了设计模式中的建造者模式

_**SqlSessionFactory**_
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1671100016363-4fd350d1-6acd-442b-a147-1a90d16ac451.png#averageHue=%238b7951&clientId=uf55608f6-550b-4&from=paste&height=698&id=u1f4f30da&originHeight=873&originWidth=1885&originalType=binary&ratio=1&rotation=0&showTitle=false&size=251181&status=done&style=none&taskId=ud2501ff8-c923-4dbd-ac22-0220f500f51&title=&width=1508)

- 我们可以看到重载方法中调用了XMLConfigBuilder（）方法，来解析文件，所以我们来瞅瞅?

**XMLConfigBuilder**
```java
  private XMLConfigBuilder(XPathParser parser, String environment, Properties props) {
        // 调用父类的方法
      super(new Configuration());
    ErrorContext.instance().resource("SQL Mapper Configuration");
    this.configuration.setVariables(props);
    this.parsed = false;
    this.environment = environment;
    this.parser = parser;
  }

```
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1671100800255-7de667e0-ba6a-4864-a72c-b3e68b276a85.png#averageHue=%232d2c2c&clientId=uf55608f6-550b-4&from=paste&height=127&id=u54fdd664&originHeight=159&originWidth=1292&originalType=binary&ratio=1&rotation=0&showTitle=false&size=14939&status=done&style=none&taskId=u514f46b0-641f-4ee6-a8e9-b19f4f23571&title=&width=1033.6)

- 可以看到XMLConfigBuilder继承BaseBuilder，我们先来看看这个方法吧，这个方法有多个实现类，每一个子类多是以XMLXXXXXBuilder命名的，也就是其子类都对应解析一种xml文件或xml文件中一种元素。

![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1671100875666-a179f416-a5c9-40ce-ad54-ffcdc166e933.png#averageHue=%232f2e2e&clientId=uf55608f6-550b-4&from=paste&height=549&id=ua6eed993&originHeight=686&originWidth=1864&originalType=binary&ratio=1&rotation=0&showTitle=false&size=87592&status=done&style=none&taskId=u0aff2e35-02fa-463a-bdf3-21adbc2b592&title=&width=1491.2)
![](https://cdn.nlark.com/yuque/0/2023/jpeg/12426173/1673415344760-84b79374-cbd2-4b84-8122-1866711ca65a.jpeg)

- **XMLConfigBuilder：**解析mybatis配置文件
- **XMLMapperBuilder：**解析mybatis映射文件
- **MapperBuilderAssistant**：XMLMapperBuilder的帮助类
- **XMLStatementBuilder：**解析映射文件中的sql语句标签insert|update|delete|select
- **XMLScriptBuilder：** SQL语句在XML文件中，处理动态SQL语句标签
- **SQLSourceBuilder**：在RawSqlSource使用

BaseBuilder中只有三个成员变量,而typeAliasRegistry和typeHandlerRegistry都是直接从Configuration的成员变量获得的，接着我们看看Configuration这个类
Configuration类位于mybatis包的org.apache.ibatis.session目录下，其属性就是对应于mybatis的全局配置文件mybatis-config.xml的配置，将XML配置中的内容解析赋值到Configuration对象中。
**BaseBuilder**
```java
public abstract class BaseBuilder {
    // 配置文件，对应其属性就是对应于mybatis的全局配置文件mybatis-config.xml的配置，将XML配置中的内容解析赋值到Configuration对象中。
  protected final Configuration configuration;
    // 类型注册
  protected final TypeAliasRegistry typeAliasRegistry;
    // 类型处理器
  protected final TypeHandlerRegistry typeHandlerRegistry;

  public BaseBuilder(Configuration configuration) {
    this.configuration = configuration;
    this.typeAliasRegistry = this.configuration.getTypeAliasRegistry();
    this.typeHandlerRegistry = this.configuration.getTypeHandlerRegistry();
  }
}
```
**BaseBuilder常用方法**

- **protected Class<? extends T> resolveClass(String alias)** 根据别名从别名注册器获得Class对象
- **protected Object createInstance(String alias)** 使用反射获得别名类型的对象
- **protected TypeHandler resolveTypeHandler(Class javaType, Class> typeHandlerType)** 获得TypeHandler对象

从上面的代码来看首先调用了父类的构造器方法super(new Configuration())，因此我们来看看Configuration这个类。

- 由于XML配置项有很多，所以Configuration类的属性也很多。先来看下Configuration对于的XML配置文件示例：
```xml
<?xml version="1.0" encoding="UTF-8"?>

<!DOCTYPE configuration PUBLIC "-//mybatis.org//DTD Config 3.0//EN" "http://mybatis.org/dtd/mybatis-3-config.dtd">
<!-- 全局配置顶级节点 -->
<configuration>

     <!-- 属性配置,读取properties中的配置文件 -->
    <properties resource="db.propertis">
       <property name="XXX" value="XXX"/>
    </properties>

    <!-- 类型别名 -->
    <typeAliases>
       <!-- 在用到User类型的时候,可以直接使用别名,不需要输入User类的全部路径 -->
       <typeAlias type="com.luck.codehelp.entity.User" alias="user"/>
    </typeAliases>

    <!-- 类型处理器 -->
    <typeHandlers>
        <!-- 类型处理器的作用是完成JDBC类型和java类型的转换,mybatis默认已经由了很多类型处理器,正常无需自定义-->
    </typeHandlers>

    <!-- 对象工厂 -->
    <!-- mybatis创建结果对象的新实例时,会通过对象工厂来完成，mybatis有默认的对象工厂，正常无需配置 -->
    <objectFactory type=""></objectFactory>

    <!-- 插件 -->
    <plugins>
        <!-- 可以自定义拦截器通过plugin标签加入 -->
       <plugin interceptor="com.lucky.interceptor.MyPlugin"></plugin>
    </plugins>

    <!-- 全局配置参数 -->
    <settings>
        <setting name="cacheEnabled" value="false" />
        <setting name="useGeneratedKeys" value="true" /><!-- 是否自动生成主键 -->
        <setting name="defaultExecutorType" value="REUSE" />
        <setting name="lazyLoadingEnabled" value="true"/><!-- 延迟加载标识 -->
        <setting name="aggressiveLazyLoading" value="true"/><!--有延迟加载属性的对象是否延迟加载 -->
        <setting name="multipleResultSetsEnabled" value="true"/><!-- 是否允许单个语句返回多个结果集 -->
        <setting name="useColumnLabel" value="true"/><!-- 使用列标签而不是列名 -->
        <setting name="autoMappingBehavior" value="PARTIAL"/><!-- 指定mybatis如何自动映射列到字段属性;NONE:自动映射;PARTIAL:只会映射结果没有嵌套的结果;FULL:可以映射任何复杂的结果 -->
        <setting name="defaultExecutorType" value="SIMPLE"/><!-- 默认执行器类型 -->
        <setting name="defaultFetchSize" value=""/>
        <setting name="defaultStatementTimeout" value="5"/><!-- 驱动等待数据库相应的超时时间 ,单位是秒-->
        <setting name="safeRowBoundsEnabled" value="false"/><!-- 是否允许使用嵌套语句RowBounds -->
        <setting name="safeResultHandlerEnabled" value="true"/>
        <setting name="mapUnderscoreToCamelCase" value="false"/><!-- 下划线列名是否自动映射到驼峰属性：如user_id映射到userId -->
        <setting name="localCacheScope" value="SESSION"/><!-- 本地缓存（session是会话级别） -->
        <setting name="jdbcTypeForNull" value="OTHER"/><!-- 数据为空值时,没有特定的JDBC类型的参数的JDBC类型 -->
        <setting name="lazyLoadTriggerMethods" value="equals,clone,hashCode,toString"/><!-- 指定触发延迟加载的对象的方法 -->
        <setting name="callSettersOnNulls" value="false"/><!--如果setter方法或map的put方法，如果检索到的值为null时，数据是否有用  -->
        <setting name="logPrefix" value="XXXX"/><!-- mybatis日志文件前缀字符串 -->
        <setting name="logImpl" value="SLF4J"/><!-- mybatis日志的实现类 -->
        <setting name="proxyFactory" value="CGLIB"/><!-- mybatis代理工具 -->
    </settings>

    <!-- 环境配置集合 -->
    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/><!-- 事务管理器 -->
            <dataSource type="POOLED"><!-- 数据库连接池 -->
                <property name="driver" value="com.mysql.jdbc.Driver" />
                <property name="url" value="jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=UTF-8" />
                <property name="username" value="root" />
                <property name="password" value="root" />
            </dataSource>
        </environment>
    </environments>

    <!-- mapper文件映射配置 -->
    <mappers>
        <mapper resource="com/luck/codehelp/mapper/UserMapper.xml"/>
    </mappers>
</configuration>
```

- 我们来看看Configuration这个类的成员变量

**Configuration**
```javascript

// <environment>节点的信息
  protected Environment environment;

  // 以下为<settings>节点中的配置信息
  protected boolean safeRowBoundsEnabled;
  protected boolean safeResultHandlerEnabled = true;
  protected boolean mapUnderscoreToCamelCase;
  protected boolean aggressiveLazyLoading;
  protected boolean multipleResultSetsEnabled = true;
  protected boolean useGeneratedKeys;
  protected boolean useColumnLabel = true;
  protected boolean cacheEnabled = true;
  protected boolean callSettersOnNulls;
  protected boolean useActualParamName = true;
  protected boolean returnInstanceForEmptyRow;

  protected String logPrefix;
  protected Class<? extends Log> logImpl;
  protected Class<? extends VFS> vfsImpl;
  protected LocalCacheScope localCacheScope = LocalCacheScope.SESSION;
  protected JdbcType jdbcTypeForNull = JdbcType.OTHER;
  protected Set<String> lazyLoadTriggerMethods = new HashSet<>(Arrays.asList("equals", "clone", "hashCode", "toString"));
  protected Integer defaultStatementTimeout;
  protected Integer defaultFetchSize;
  protected ResultSetType defaultResultSetType;
  protected ExecutorType defaultExecutorType = ExecutorType.SIMPLE;
  protected AutoMappingBehavior autoMappingBehavior = AutoMappingBehavior.PARTIAL;
  protected AutoMappingUnknownColumnBehavior autoMappingUnknownColumnBehavior = AutoMappingUnknownColumnBehavior.NONE;
  // 以上为<settings>节点中的配置信息

  // <properties>节点信息
  protected Properties variables = new Properties();
  // 反射工厂
  protected ReflectorFactory reflectorFactory = new DefaultReflectorFactory();
  // 对象工厂
  protected ObjectFactory objectFactory = new DefaultObjectFactory();
  // 对象包装工厂
  protected ObjectWrapperFactory objectWrapperFactory = new DefaultObjectWrapperFactory();
  // 是否启用懒加载，该配置来自<settings>节点
  protected boolean lazyLoadingEnabled = false;
  // 代理工厂
  protected ProxyFactory proxyFactory = new JavassistProxyFactory(); // #224 Using internal Javassist instead of OGNL
  // 数据库编号
  protected String databaseId;
  // 配置工厂，用来创建用于加载反序列化的未读属性的配置。
  protected Class<?> configurationFactory;
  // 映射注册表
  protected final MapperRegistry mapperRegistry = new MapperRegistry(this);
  // 拦截器链（用来支持插件的插入）
  protected final InterceptorChain interceptorChain = new InterceptorChain();
  // 类型处理器注册表，内置许多，可以通过<typeHandlers>节点补充
  protected final TypeHandlerRegistry typeHandlerRegistry = new TypeHandlerRegistry();
  // 类型别名注册表，内置许多，可以通过<typeAliases>节点补充
  protected final TypeAliasRegistry typeAliasRegistry = new TypeAliasRegistry();
  // 语言驱动注册表
  protected final LanguageDriverRegistry languageRegistry = new LanguageDriverRegistry();
  // 映射的数据库操作语句
  protected final Map<String, MappedStatement> mappedStatements = new StrictMap<MappedStatement>("Mapped Statements collection")
      .conflictMessageProducer((savedValue, targetValue) ->
          ". please check " + savedValue.getResource() + " and " + targetValue.getResource());
  // 缓存
  protected final Map<String, Cache> caches = new StrictMap<>("Caches collection");
  // 结果映射，即所有的<resultMap>节点
  protected final Map<String, ResultMap> resultMaps = new StrictMap<>("Result Maps collection");
  // 参数映射，即所有的<parameterMap>节点
  protected final Map<String, ParameterMap> parameterMaps = new StrictMap<>("Parameter Maps collection");
  // 主键生成器映射
  protected final Map<String, KeyGenerator> keyGenerators = new StrictMap<>("Key Generators collection");
  // 载入的资源，例如映射文件资源
  protected final Set<String> loadedResources = new HashSet<>();
  // SQL语句片段，即所有的<sql>节点
  protected final Map<String, XNode> sqlFragments = new StrictMap<>("XML fragments parsed from previous mappers");

  // 暂存未处理完成的一些节点
  protected final Collection<XMLStatementBuilder> incompleteStatements = new LinkedList<>();
  protected final Collection<CacheRefResolver> incompleteCacheRefs = new LinkedList<>();
  protected final Collection<ResultMapResolver> incompleteResultMaps = new LinkedList<>();
  protected final Collection<MethodResolver> incompleteMethods = new LinkedList<>();

  // 用来存储跨namespace的缓存共享设置
  protected final Map<String, String> cacheRefMap = new HashMap<>();
```

- 我们可以通过代码看到代码调用了的Configuration无参构造代码， typeAliasRegistry 注册了很多别名，我们看看TypeAliasRegistry

**Configuration**
```javascript
public Configuration() {

    typeAliasRegistry.registerAlias("JDBC", JdbcTransactionFactory.class);
    typeAliasRegistry.registerAlias("MANAGED", ManagedTransactionFactory.class);

    typeAliasRegistry.registerAlias("JNDI", JndiDataSourceFactory.class);
    typeAliasRegistry.registerAlias("POOLED", PooledDataSourceFactory.class);
    typeAliasRegistry.registerAlias("UNPOOLED", UnpooledDataSourceFactory.class);

    typeAliasRegistry.registerAlias("PERPETUAL", PerpetualCache.class);
    typeAliasRegistry.registerAlias("FIFO", FifoCache.class);
    typeAliasRegistry.registerAlias("LRU", LruCache.class);
    typeAliasRegistry.registerAlias("SOFT", SoftCache.class);
    typeAliasRegistry.registerAlias("WEAK", WeakCache.class);

    typeAliasRegistry.registerAlias("DB_VENDOR", VendorDatabaseIdProvider.class);

    typeAliasRegistry.registerAlias("XML", XMLLanguageDriver.class);
    typeAliasRegistry.registerAlias("RAW", RawLanguageDriver.class);

    typeAliasRegistry.registerAlias("SLF4J", Slf4jImpl.class);
    typeAliasRegistry.registerAlias("COMMONS_LOGGING", JakartaCommonsLoggingImpl.class);
    typeAliasRegistry.registerAlias("LOG4J", Log4jImpl.class);
    typeAliasRegistry.registerAlias("LOG4J2", Log4j2Impl.class);
    typeAliasRegistry.registerAlias("JDK_LOGGING", Jdk14LoggingImpl.class);
    typeAliasRegistry.registerAlias("STDOUT_LOGGING", StdOutImpl.class);
    typeAliasRegistry.registerAlias("NO_LOGGING", NoLoggingImpl.class);

    typeAliasRegistry.registerAlias("CGLIB", CglibProxyFactory.class);
    typeAliasRegistry.registerAlias("JAVASSIST", JavassistProxyFactory.class);

    languageRegistry.setDefaultDriverClass(XMLLanguageDriver.class);
    languageRegistry.register(RawLanguageDriver.class);
  }
```

- 我们来看看别名注册表，我们可以发现其中已经有注册的文件，好了完成了这些，我们就可以得到一个 Configuration 对象，并且把我们Mybatis-conf.xml文件解析到其中。

**Configuration**
```javascript
// 存储中心其实TypeAliasRegistry里面有一个HashMap，并且在TypeAliasRegistry的构造器中注册很多别名到这个hashMap中。
private final Map<String, Class<?>> typeAliases = new HashMap<>();

public TypeAliasRegistry() {
    registerAlias("string", String.class);

    registerAlias("byte", Byte.class);
    registerAlias("long", Long.class);
    registerAlias("short", Short.class);
    registerAlias("int", Integer.class);
    registerAlias("integer", Integer.class);
    registerAlias("double", Double.class);
    registerAlias("float", Float.class);
    registerAlias("boolean", Boolean.class);

    registerAlias("byte[]", Byte[].class);
    registerAlias("long[]", Long[].class);
    registerAlias("short[]", Short[].class);
    registerAlias("int[]", Integer[].class);
    registerAlias("integer[]", Integer[].class);
    registerAlias("double[]", Double[].class);
    registerAlias("float[]", Float[].class);
    registerAlias("boolean[]", Boolean[].class);

    registerAlias("_byte", byte.class);
    registerAlias("_long", long.class);
    registerAlias("_short", short.class);
    registerAlias("_int", int.class);
    registerAlias("_integer", int.class);
    registerAlias("_double", double.class);
    registerAlias("_float", float.class);
    registerAlias("_boolean", boolean.class);

    registerAlias("_byte[]", byte[].class);
    registerAlias("_long[]", long[].class);
    registerAlias("_short[]", short[].class);
    registerAlias("_int[]", int[].class);
    registerAlias("_integer[]", int[].class);
    registerAlias("_double[]", double[].class);
    registerAlias("_float[]", float[].class);
    registerAlias("_boolean[]", boolean[].class);

    registerAlias("date", Date.class);
    registerAlias("decimal", BigDecimal.class);
    registerAlias("bigdecimal", BigDecimal.class);
    registerAlias("biginteger", BigInteger.class);
    registerAlias("object", Object.class);

    registerAlias("date[]", Date[].class);
    registerAlias("decimal[]", BigDecimal[].class);
    registerAlias("bigdecimal[]", BigDecimal[].class);
    registerAlias("biginteger[]", BigInteger[].class);
    registerAlias("object[]", Object[].class);

    registerAlias("map", Map.class);
    registerAlias("hashmap", HashMap.class);
    registerAlias("list", List.class);
    registerAlias("arraylist", ArrayList.class);
    registerAlias("collection", Collection.class);
    registerAlias("iterator", Iterator.class);

    registerAlias("ResultSet", ResultSet.class);
  }

```

- 开始调用parser.parse()方法，进行文件的解析

**XMLConfigBuilder**
```javascript
  public Configuration parse() {
    // 是否加载过
    if (parsed) {
      throw new BuilderException("Each XMLConfigBuilder can only be used once.");
    }
    parsed = true;
    // 解析配置文件  configuration为开始节点
    parseConfiguration(parser.evalNode("/configuration"));
    return configuration;
  }
```

- 注意一个 xpath 表达式 - /configuration。这个表达式代表的是 MyBatis 的configuration标签，这里选中这个标签，并传递给parseConfiguration方法。

- mybatis parseConfiguration的过程是指mybatis解析配置文件的过程。在这个过程中，mybatis会读取配置文件中的信息，并将其解析为内存中的对象，以便后续使用，具体来说，mybatis在解析配置文件时会创建一个Configuration对象，并通过调用XMLConfigBuilder类的parse()方法来解析配置文件，XMLConfigBuilder类会读取配置文件中的信息，并将其转换为Configuration对象中的各种属性。
- 例如，配置文件中的environment元素会被转换为Configuration对象的environment属性，mappers元素会被转换为Configuration对象的mapperRegistry属性，等等，总之，mybatis parseConfiguration的过程就是将配置文件中的信息解析为内存中的对象的过程。
```javascript
private void parseConfiguration(XNode root) {
    try {
        // 解析 properties 配置
        propertiesElement(root.evalNode("properties"));

        // 解析 settings 配置，并将其转换为 Properties 对象
        Properties settings = settingsAsProperties(root.evalNode("settings"));

        // 加载 vfs
        loadCustomVfs(settings);

        // 解析 typeAliases 配置
        typeAliasesElement(root.evalNode("typeAliases"));

        // 解析 plugins 配置
        pluginElement(root.evalNode("plugins"));

        // 解析 objectFactory 配置
        objectFactoryElement(root.evalNode("objectFactory"));

        // 解析 objectWrapperFactory 配置
        objectWrapperFactoryElement(root.evalNode("objectWrapperFactory"));

        // 解析 reflectorFactory 配置
        reflectorFactoryElement(root.evalNode("reflectorFactory"));

        // settings 中的信息设置到 Configuration 对象中
        settingsElement(settings);

        // 解析 environments 配置
        environmentsElement(root.evalNode("environments"));

        // 解析 databaseIdProvider，获取并设置 databaseId 到 Configuration 对象
        databaseIdProviderElement(root.evalNode("databaseIdProvider"));

        // 解析 typeHandlers 配置
        typeHandlerElement(root.evalNode("typeHandlers"));

        // 解析 mappers 配置
        mapperElement(root.evalNode("mappers"));
    } catch (Exception e) {
        throw new BuilderException("Error parsing SQL Mapper Configuration. Cause: " + e, e);
    }
}
```
总结：
![SqlSessionFactoryBuilder.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673416757214-7d71b889-0f0d-4fe8-9d44-9e6c73e63eaa.png#averageHue=%23faf8f7&clientId=ufd03a3e5-2741-4&from=paste&height=220&id=udbd7096f&originHeight=275&originWidth=1491&originalType=binary&ratio=1&rotation=0&showTitle=false&size=38390&status=done&style=none&taskId=ufade5c7e-73b9-44b5-a78e-46d458bfaeb&title=&width=1192.8)
下面我们来介绍各个节点的详细解析过程
# 二 解析properties文件
参考官网：[mybatis – MyBatis 3 | 配置](https://mybatis.org/mybatis-3/zh/configuration.html#properties)
这些属性可以在外部进行配置，并可以进行动态替换。你既可以在典型的 Java 属性文件中配置这些属性，也可以在 properties 元素的子元素中设置。
```xml
<properties resource="org/mybatis/example/config.properties">
  <property name="username" value="dev_user"/>
  <property name="password" value="F2Fa3!33TYyg"/>
</properties>
```
设置好的属性可以在整个配置文件中用来替换需要动态配置的属性值。比如:
```xml
<dataSource type="POOLED">
  <property name="driver" value="${driver}"/>
  <property name="url" value="${url}"/>
  <property name="username" value="${username}"/>
  <property name="password" value="${password}"/>
</dataSource>
```
**XMLConfigBuilder**
```java
 propertiesElement(root.evalNode("properties"));
```

```java
// 解析properties文件
private void propertiesElement(XNode context) throws Exception {
    // properties节点信息不能为空
    if (context != null) {
        // 解析成Properties文件
        Properties defaults = context.getChildrenAsProperties();
        // 解析resource
        String resource = context.getStringAttribute("resource");
        // 解析url
        String url = context.getStringAttribute("url");
        // resource不为空，url不为空
        if (resource != null && url != null) {
            throw new BuilderException("The properties element cannot specify both a URL and a resource based property file reference.  Please specify one or the other.");
        }
        // // 从文件系统中加载并解析属性文件
        if (resource != null) {
            // Resources类加载资源resource，这里与前面mybatis-conf.xml的解析过程一样
            defaults.putAll(Resources.getResourceAsProperties(resource));
        } else if (url != null) {
            // 通过 url 加载并解析属性文件
            defaults.putAll(Resources.getUrlAsProperties(url));
        }
        Properties vars = configuration.getVariables();
        if (vars != null) {
            defaults.putAll(vars);
        }
        parser.setVariables(defaults);
          // 将属性值设置到 configuration 中
        configuration.setVariables(defaults);
    }
}
```

- root.evalNode()方法，解析指定标签文件
```java
 /**
   * 进行XML节点的解析
   * @param expression 解析的语句
   * @param root 解析根
   * @param returnType 返回值类型
   * @return 解析结果
   */
  private Object evaluate(String expression, Object root, QName returnType) {
    try {
      // 对指定节点root运行解析语法expression，获得returnType类型的解析结果
      return xpath.evaluate(expression, root, returnType);
    } catch (Exception e) {
      throw new BuilderException("Error evaluating XPath.  Cause: " + e, e);
    }
  }
```

![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1671105366188-b860c6e0-ce5e-40a1-bae0-385c1d1b8166.png#averageHue=%237d6448&clientId=uf55608f6-550b-4&from=paste&height=290&id=u7d578cd5&originHeight=363&originWidth=1900&originalType=binary&ratio=1&rotation=0&showTitle=false&size=98626&status=done&style=none&taskId=u35f8a39f-9186-403f-bcab-bc4fd790315&title=&width=1520)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1671105569397-43bbb927-472c-43a0-8da3-bcfe035a5d98.png#averageHue=%232c2b2b&clientId=uf55608f6-550b-4&from=paste&height=358&id=ub5abf1bb&originHeight=447&originWidth=1410&originalType=binary&ratio=1&rotation=0&showTitle=false&size=53424&status=done&style=none&taskId=u0db216fb-651b-4776-8607-daa483a404e&title=&width=1128)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1671105587279-13c8b5e1-c858-4fb0-adb6-eb11d8333eb6.png#averageHue=%232c2c2b&clientId=uf55608f6-550b-4&from=paste&height=304&id=u1f68cb02&originHeight=380&originWidth=1452&originalType=binary&ratio=1&rotation=0&showTitle=false&size=51072&status=done&style=none&taskId=ub74a02b1-1a02-4b15-919b-eb51602795c&title=&width=1161.6)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1671105763740-fff3d5a7-bbd4-487e-a491-6db5f0467f11.png#averageHue=%232e2d2c&clientId=uf55608f6-550b-4&from=paste&height=116&id=uea8a1bf8&originHeight=145&originWidth=1228&originalType=binary&ratio=1&rotation=0&showTitle=false&size=16865&status=done&style=none&taskId=u8840b379-b6db-4dfb-bcb5-e9baed6a0c0&title=&width=982.4)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1671105779601-240a187d-ddef-4c66-a047-5da40b39148e.png#averageHue=%232c2b2b&clientId=uf55608f6-550b-4&from=paste&height=95&id=u8882722a&originHeight=119&originWidth=1263&originalType=binary&ratio=1&rotation=0&showTitle=false&size=14319&status=done&style=none&taskId=ufb63b26c-d379-4cf9-add0-2a36df9b7b6&title=&width=1010.4)
总结：

1. 判断 properties是否为空，properties不能为空
2. 将XNode节点转换成Properties
3. 获取XNode的属性：resource，url属性
4. 判断是通过resource还是url 获取信息并转换成resource
5. 覆盖掉原来的configuration中的Properties
6. 设置到configuration的Properties属性中

需要注意的是，propertiesElement 方法是先解析 properties 节点的子节点内容，后再从文件系统或者网络读取属性配置，并将所有的属性及属性值都放入到 defaults 属性对象中。这就会存在同名属性覆盖的问题，也就是从文件系统，或者网络上读取到的属性及属性值会覆盖掉 properties 子节点中同名的属性和及值。
# 三 解析settings文件
参考官网：[mybatis – MyBatis 3 | 配置](https://mybatis.org/mybatis-3/zh/configuration.html#settings)
这是 MyBatis 中极为重要的调整设置，它们会改变 MyBatis 的运行时行为。 下表描述了设置中各项设置的含义、默认值等。

```xml
<settings>
  <setting name="cacheEnabled" value="true"/>
  <setting name="lazyLoadingEnabled" value="true"/>
  <setting name="aggressiveLazyLoading" value="true"/>
  <setting name="multipleResultSetsEnabled" value="true"/>
  <setting name="useColumnLabel" value="true"/>
  <setting name="useGeneratedKeys" value="false"/>
  <setting name="autoMappingBehavior" value="PARTIAL"/>
  <setting name="autoMappingUnknownColumnBehavior" value="WARNING"/>
  <setting name="defaultExecutorType" value="SIMPLE"/>
  <setting name="defaultStatementTimeout" value="25"/>
  <setting name="defaultFetchSize" value="100"/>
  <setting name="safeRowBoundsEnabled" value="false"/>
  <setting name="safeResultHandlerEnabled" value="true"/>
  <setting name="mapUnderscoreToCamelCase" value="false"/>
  <setting name="localCacheScope" value="SESSION"/>
  <setting name="jdbcTypeForNull" value="OTHER"/>
  <setting name="lazyLoadTriggerMethods" value="equals,clone,hashCode,toString"/>
  <setting name="defaultScriptingLanguage" value="org.apache.ibatis.scripting.xmltags.XMLLanguageDriver"/>
  <setting name="defaultEnumTypeHandler" value="org.apache.ibatis.type.EnumTypeHandler"/>
  <setting name="callSettersOnNulls" value="false"/>
  <setting name="returnInstanceForEmptyRow" value="false"/>
  <setting name="logPrefix" value="exampleLogPreFix_"/>
  <setting name="logImpl" value="SLF4J | LOG4J | LOG4J2 | JDK_LOGGING | COMMONS_LOGGING | STDOUT_LOGGING | NO_LOGGING"/>
  <setting name="proxyFactory" value="CGLIB | JAVASSIST"/>
  <setting name="vfsImpl" value="org.mybatis.example.YourselfVfsImpl"/>
  <setting name="useActualParamName" value="true"/>
  <setting name="configurationFactory" value="org.mybatis.example.ConfigurationFactory"/>
</settings>

```
**XMLConfigBuilder**
```java
Properties settings = settingsAsProperties(root.evalNode("settings"));
// 自定义 VFS 的实现的类全限定名，以逗号分隔。
loadCustomVfs(settings);
// 指定 MyBatis 所用日志的具体实现，未指定时将自动查找。
loadCustomLogImpl(settings);
```

- 我们可以看到调用settingsAsProperties的方法，看他是如何解析settings文件的

**XMLConfigBuilder**
```java
private Properties settingsAsProperties(XNode context) {
    if (context == null) {
      return new Properties();
    }
	// 解析settings文件
    Properties props = context.getChildrenAsProperties();

    // 创建 Configuration 类的“元信息”对象
    MetaClass metaConfig = MetaClass.forClass(Configuration.class, localReflectorFactory);
	// 检测Configuration对象中是否包含每个配置项的setter方法
    for (Object key : props.keySet()) {
      if (!metaConfig.hasSetter(String.valueOf(key))) {
        throw new BuilderException("The setting " + key + " is not known.  Make sure you spelled it correctly (case sensitive).");
      }
    }
    return props;
  }
```
这里解释一下MetaClass这个类：主要通过反射工厂对类进行信息的解析：其中解析的信息在Reflector这个类中，主要调用Reflector的构造器对类信息进行解析。
**Reflector**
```java
// 要被反射解析的类
    private final Class<?> type;
    // 能够读的属性列表，即有get方法的属性列表
    private final String[] readablePropertyNames;
    // 能够写的属性列表，即有set方法的属性列表
    private final String[] writablePropertyNames;
    // set方法映射表。键为属性名，值为对应的set方法
    private final Map<String, Invoker> setMethods = new HashMap<>();
    // get方法映射表。键为属性名，值为对应的get方法
    private final Map<String, Invoker> getMethods = new HashMap<>();
    // set方法输入类型。键为属性名，值为对应的该属性的set方法的类型（实际为set方法的第一个参数的类型）
    private final Map<String, Class<?>> setTypes = new HashMap<>();
    // get方法输出类型。键为属性名，值为对应的该属性的set方法的类型（实际为set方法的返回值类型）
    private final Map<String, Class<?>> getTypes = new HashMap<>();
    // 默认构造函数
    private Constructor<?> defaultConstructor;
    // 大小写无关的属性映射表。键为属性名全大写值，值为属性名
    private Map<String, String> caseInsensitivePropertyMap = new HashMap<>();

/**
     * Reflector的构造方法
     * @param clazz 需要被反射处理的目标类
     */
    public Reflector(Class<?> clazz) {
        // 要被反射解析的类
        type = clazz;
        // 设置默认构造器属性
        addDefaultConstructor(clazz);
        // 解析所有的getter
        addGetMethods(clazz);
        // 解析所有有setter
        addSetMethods(clazz);
        // 解析所有属性
        addFields(clazz);
        // 设定可读属性
        readablePropertyNames = getMethods.keySet().toArray(new String[0]);
        // 设定可写属性
        writablePropertyNames = setMethods.keySet().toArray(new String[0]);
        // 将可读或者可写的属性放入大小写无关的属性映射表
        for (String propName : readablePropertyNames) {
            caseInsensitivePropertyMap.put(propName.toUpperCase(Locale.ENGLISH), propName);
        }
        for (String propName : writablePropertyNames) {
            caseInsensitivePropertyMap.put(propName.toUpperCase(Locale.ENGLISH), propName);
        }
    }
```

- 我们回到解析代码
```java
    private void parseConfiguration(XNode root) {
    try {
      // 解析信息放入Configuration
      // 首先解析properties，以保证在解析其他节点时便可以生效
      propertiesElement(root.evalNode("properties"));
      Properties settings = settingsAsProperties(root.evalNode("settings"));
      loadCustomVfs(settings);
      loadCustomLogImpl(settings);
      typeAliasesElement(root.evalNode("typeAliases"));
      pluginElement(root.evalNode("plugins"));
      objectFactoryElement(root.evalNode("objectFactory"));
      objectWrapperFactoryElement(root.evalNode("objectWrapperFactory"));
      reflectorFactoryElement(root.evalNode("reflectorFactory"));
      settingsElement(settings);
      // read it after objectFactory and objectWrapperFactory issue #631
      environmentsElement(root.evalNode("environments"));
      databaseIdProviderElement(root.evalNode("databaseIdProvider"));
      typeHandlerElement(root.evalNode("typeHandlers"));
      mapperElement(root.evalNode("mappers"));
    } catch (Exception e) {
      throw new BuilderException("Error parsing SQL Mapper Configuration. Cause: " + e, e);
    }
  }
```
我们来看看loadCustomVfs（）这个方法：主要是加载自己定义的VFS磁盘加载，关于VFS的介绍请参考上篇文章：[Mybatis源码分析（二）Mybatis-config.xml的初始化_长安不及十里的博客-CSDN博客](https://blog.csdn.net/weixin_44451022/article/details/128641020?spm=1001.2014.3001.5501)
**Configuration**
```java
  private void loadCustomVfs(Properties props) throws ClassNotFoundException {
    String value = props.getProperty("vfsImpl");
    if (value != null) {
      String[] clazzes = value.split(",");
      for (String clazz : clazzes) {
        if (!clazz.isEmpty()) {
          @SuppressWarnings("unchecked")
          Class<? extends VFS> vfsImpl = (Class<? extends VFS>)Resources.classForName(clazz);
          configuration.setVfsImpl(vfsImpl);
        }
      }
    }
  }


  public void setVfsImpl(Class<? extends VFS> vfsImpl) {
    if (vfsImpl != null) {
      this.vfsImpl = vfsImpl;
      VFS.addImplClass(this.vfsImpl);
    }
  }
```
我们接着往下面看：loadCustomLogImpl(settings)方法，主要是设置自定义了Mybatisd的日志实现
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673419253548-faa87c41-2d46-4602-8728-98ac18e1efd9.png#averageHue=%23fcfbfa&clientId=uc4fd59c4-ed24-4&from=paste&height=130&id=u1d754d8d&originHeight=163&originWidth=1584&originalType=binary&ratio=1&rotation=0&showTitle=false&size=25076&status=done&style=none&taskId=u9d780187-973e-44f1-a959-13a81b799c0&title=&width=1267.2)
**LogFactory**
```java
  private void loadCustomLogImpl(Properties props) {
    Class<? extends Log> logImpl = resolveClass(props.getProperty("logImpl"));
    configuration.setLogImpl(logImpl);
  }


  public void setLogImpl(Class<? extends Log> logImpl) {
    if (logImpl != null) {
      this.logImpl = logImpl;
      LogFactory.useCustomLogging(this.logImpl);
    }
  }


  /**
   * 设置日志实现
   * @param implClass 日志实现类
   */
  private static void setImplementation(Class<? extends Log> implClass) {
    try {
      // 当前日志实现类的构造方法
      Constructor<? extends Log> candidate = implClass.getConstructor(String.class);
      // 尝试生成日志实现类的实例
      Log log = candidate.newInstance(LogFactory.class.getName());
      if (log.isDebugEnabled()) {
        log.debug("Logging initialized using '" + implClass + "' adapter.");
      }
      // 如果运行到这里，说明没有异常发生。则实例化日志实现类成功。
      logConstructor = candidate;
    } catch (Throwable t) {
      throw new LogException("Error setting Log implementation.  Cause: " + t, t);
    }
  }

```
接下来看看settingsElement（）方法，主要把刚才解析的属性色值到configuration中
**XMLConfigBuilder**
```java
private void settingsElement(Properties props) {
    configuration.setAutoMappingBehavior(AutoMappingBehavior.valueOf(props.getProperty("autoMappingBehavior", "PARTIAL")));
    configuration.setAutoMappingUnknownColumnBehavior(AutoMappingUnknownColumnBehavior.valueOf(props.getProperty("autoMappingUnknownColumnBehavior", "NONE")));
    configuration.setCacheEnabled(booleanValueOf(props.getProperty("cacheEnabled"), true));
    configuration.setProxyFactory((ProxyFactory) createInstance(props.getProperty("proxyFactory")));
    configuration.setLazyLoadingEnabled(booleanValueOf(props.getProperty("lazyLoadingEnabled"), false));
    configuration.setAggressiveLazyLoading(booleanValueOf(props.getProperty("aggressiveLazyLoading"), false));
    configuration.setMultipleResultSetsEnabled(booleanValueOf(props.getProperty("multipleResultSetsEnabled"), true));
    configuration.setUseColumnLabel(booleanValueOf(props.getProperty("useColumnLabel"), true));
    configuration.setUseGeneratedKeys(booleanValueOf(props.getProperty("useGeneratedKeys"), false));
    configuration.setDefaultExecutorType(ExecutorType.valueOf(props.getProperty("defaultExecutorType", "SIMPLE")));
    configuration.setDefaultStatementTimeout(integerValueOf(props.getProperty("defaultStatementTimeout"), null));
    configuration.setDefaultFetchSize(integerValueOf(props.getProperty("defaultFetchSize"), null));
    configuration.setDefaultResultSetType(resolveResultSetType(props.getProperty("defaultResultSetType")));
    configuration.setMapUnderscoreToCamelCase(booleanValueOf(props.getProperty("mapUnderscoreToCamelCase"), false));
    configuration.setSafeRowBoundsEnabled(booleanValueOf(props.getProperty("safeRowBoundsEnabled"), false));
    configuration.setLocalCacheScope(LocalCacheScope.valueOf(props.getProperty("localCacheScope", "SESSION")));
    configuration.setJdbcTypeForNull(JdbcType.valueOf(props.getProperty("jdbcTypeForNull", "OTHER")));
    configuration.setLazyLoadTriggerMethods(stringSetValueOf(props.getProperty("lazyLoadTriggerMethods"), "equals,clone,hashCode,toString"));
    configuration.setSafeResultHandlerEnabled(booleanValueOf(props.getProperty("safeResultHandlerEnabled"), true));
    configuration.setDefaultScriptingLanguage(resolveClass(props.getProperty("defaultScriptingLanguage")));
    configuration.setDefaultEnumTypeHandler(resolveClass(props.getProperty("defaultEnumTypeHandler")));
    configuration.setCallSettersOnNulls(booleanValueOf(props.getProperty("callSettersOnNulls"), false));
    configuration.setUseActualParamName(booleanValueOf(props.getProperty("useActualParamName"), true));
    configuration.setReturnInstanceForEmptyRow(booleanValueOf(props.getProperty("returnInstanceForEmptyRow"), false));
    configuration.setLogPrefix(props.getProperty("logPrefix"));
    configuration.setConfigurationFactory(resolveClass(props.getProperty("configurationFactory")));
  }
```
具体的配置信息请参考官方文档：[mybatis – MyBatis 3 | 配置](https://mybatis.org/mybatis-3/zh/configuration.html#settings)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673419513241-97ebaf7e-55cb-4a07-bca9-e074d6635537.png#averageHue=%23f8f7f6&clientId=uc4fd59c4-ed24-4&from=paste&height=712&id=u001d931c&originHeight=890&originWidth=1907&originalType=binary&ratio=1&rotation=0&showTitle=false&size=202582&status=done&style=none&taskId=u05c7343e-5924-4f6b-9be9-971151bf51a&title=&width=1525.6)
总结：

1. 将XNode转换成Properties属性
2. 检查Configuration对象中是否包含每个配置项的setter方法，否则抛出异常
3. 是否设置自定义VFS
4. 是否设置自定义日志
5. 填充Configuration的属性
# 四 解析typeAliases文件
参考官网：[mybatis – MyBatis 3 | 配置](https://mybatis.org/mybatis-3/zh/configuration.html#%E7%B1%BB%E5%9E%8B%E5%88%AB%E5%90%8D%EF%BC%88typealiases%EF%BC%89)
在 MyBatis 中，可以为我们自己写的有些类定义一个别名。这样在使用的时候，我们只需要输入别名即可，无需再把全限定的类名写出来。在 MyBatis 中，我们有两种方式进行别名配置。

- 第一种是仅配置包名，让 MyBatis 去扫描包中的类型，并根据类型得到相应的别名
```java
<typeAliases>
    <package name="com.mybatis.model"/>
    </typeAliases>
```

- 第二种方式是通过手动的方式，明确为某个类型配置别名。这种方式的配置如下：
```xml
<typeAliases>
  <typeAlias alias="employe" type="com.mybatis.model.Employe" />
  <typeAlias type="com.mybatis.model.User" />
</typeAliases>
```

- 下面我们来看一下两种不同的别名配置是怎样解析的

**XMLConfigBuilder**
```java
 typeAliasesElement(root.evalNode("typeAliases"));
```
```java
 private void typeAliasesElement(XNode parent) {
    if (parent != null) {

      for (XNode child : parent.getChildren()) {
           // 从指定的包中解析别名和类型的映射
        if ("package".equals(child.getName())) {

          String typeAliasPackage = child.getStringAttribute("name");
            // configuration文件中注册他
          configuration.getTypeAliasRegistry().registerAliases(typeAliasPackage);
        }
           //  从 typeAlias 节点中解析别名和类型的映射
        else {
            //   获取 alias 和 type 属性值，alias 不是必填项，可为空
          String alias = child.getStringAttribute("alias");
          String type = child.getStringAttribute("type");
          try {
              // 加载 type 对应的类型
            Class<?> clazz = Resources.classForName(type);
              // 注册别名到类型的映射
            if (alias == null) {
              typeAliasRegistry.registerAlias(clazz);
            } else {
              typeAliasRegistry.registerAlias(alias, clazz);
            }
          } catch (ClassNotFoundException e) {
            throw new BuilderException("Error registering typeAlias for '" + alias + "'. Cause: " + e, e);
          }
        }
      }
    }
  }
```

-  我们实现看看，通过手动的方式注册别名到类型的映射

**TypeAliasRegistry**
```java
  public void registerAlias(Class<?> type) {
      // 别名
    String alias = type.getSimpleName();
      // 从@Alias注解中取出别名
    Alias aliasAnnotation = type.getAnnotation(Alias.class);
    if (aliasAnnotation != null) {
      alias = aliasAnnotation.value();
    }
      // 重载方法
    registerAlias(alias, type);
  }


  public void registerAlias(String alias, Class<?> value) {
    if (alias == null) {
      throw new TypeException("The parameter alias cannot be null");
    }
    // 将别名转成小写
    String key = alias.toLowerCase(Locale.ENGLISH);
    /*
     * 如果 TYPE_ALIASES 中存在了某个类型映射，这里判断当前类型与映射中的类型是否一致，
     * 不一致则抛出异常，不允许一个别名对应两种类型
     */
    if (typeAliases.containsKey(key) && typeAliases.get(key) != null && !typeAliases.get(key).equals(value)) {
      throw new TypeException("The alias '" + alias + "' is already mapped to the value '" + typeAliases.get(key).getName() + "'.");
    }
      // 缓存到typeAliases
    typeAliases.put(key, value);
  }

```
实际上就会追加到typeAliases这个Map中，完成别名的注册
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1671108223253-5828eac2-75eb-44b8-8126-69a80b2e2ea3.png#averageHue=%232e2d2b&clientId=uf55608f6-550b-4&from=paste&height=409&id=uba1ccd21&originHeight=511&originWidth=1188&originalType=binary&ratio=1&rotation=0&showTitle=false&size=97171&status=done&style=none&taskId=u58c49daf-c9d0-4a56-a910-c96fb9f9a55&title=&width=950.4)

- 从指定的包中解析并注册别名
```java
// 需要扫描的包路径
String typeAliasPackage = child.getStringAttribute("name");
configuration.getTypeAliasRegistry().registerAliases(typeAliasPackage);
```
**TypeAliasRegistry**
```java

public void registerAliases(String packageName, Class<?> superType) {
    ResolverUtil<Class<?>> resolverUtil = new ResolverUtil<>();

     /*
     * 查找包下的父类为 Object.class 的类。
     * 查找完成后，查找结果将会被缓存到resolverUtil的内部集合中。
     */
    resolverUtil.find(new ResolverUtil.IsA(superType), packageName);
    // 获取查找结果
    Set<Class<? extends Class<?>>> typeSet = resolverUtil.getClasses();
    for (Class<?> type : typeSet) {
        // 忽略匿名类，接口，内部类
        if (!type.isAnonymousClass() && !type.isInterface() && !type.isMemberClass()) {
            // 为类型注册别名
            registerAlias(type);
        }
    }
  }
```

- 我们看看查找指定包下的所有类

**ResolverUtil**
```java
private Set<Class<? extends T>> matches = new HashSet();

public ResolverUtil<T> find(ResolverUtil.Test test, String packageName) {
    //将包名转换成文件路径
    String path = this.getPackagePath(packageName);

    try {
        //通过 VFS（虚拟文件系统）获取指定包下的所有文件的路径名，比如com/mybatis/model/Employe.class
        List<String> children = VFS.getInstance().list(path);
        Iterator i$ = children.iterator();

        while(i$.hasNext()) {
            String child = (String)i$.next();
            //以.class结尾的文件就加入到Set集合中
            if (child.endsWith(".class")) {
                this.addIfMatching(test, child);
            }
        }
    } catch (IOException var7) {
        log.error("Could not read package: " + packageName, var7);
    }

    return this;
}

protected String getPackagePath(String packageName) {
    //将包名转换成文件路径
    return packageName == null ? null : packageName.replace('.', '/');
}

protected void addIfMatching(ResolverUtil.Test test, String fqn) {
    try {
        //将路径名转成全限定的类名，通过类加载器加载类名，比如com.mybatis.model.Employe.class
        String externalName = fqn.substring(0, fqn.indexOf(46)).replace('/', '.');
        ClassLoader loader = this.getClassLoader();
        if (log.isDebugEnabled()) {
            log.debug("Checking to see if class " + externalName + " matches criteria [" + test + "]");
        }

        Class<?> type = loader.loadClass(externalName);
        if (test.matches(type)) {
            //加入到matches集合中
            this.matches.add(type);
        }
    } catch (Throwable var6) {
        log.warn("Could not examine class '" + fqn + "'" + " due to a " + var6.getClass().getName() + " with message: " + var6.getMessage());
    }

}
```
总结：
typeAliasesElement 在 MyBatis 中用于定义类型别名。在解析过程中，MyBatis 首先会将其中的类型别名注册到它的类型别名注册器中，然后，在执行 SQL 语句时，MyBatis 就可以使用这些类型别名来解析映射关系。
具体来说，当 MyBatis 在解析 typeAliasesElement 时，会执行以下步骤：

1. 遍历所有的类型别名元素。
2. 对于每个类型别名元素，获取其中的类型别名和类名。
3. 将类型别名与类名注册到类型别名注册器中。
4. 重复步骤 1-3，直到遍历完所有的类型别名元素。

在解析过程中，MyBatis 会使用类加载器加载类型别名所对应的类，这样，在执行 SQL 语句时，MyBatis 就可以使用这些类来解析映射关系。
# 五 解析 Plugin文件
参考官网：[mybatis – MyBatis 3 | 配置](https://mybatis.org/mybatis-3/zh/configuration.html#%E6%8F%92%E4%BB%B6%EF%BC%88plugins%EF%BC%89)
MyBatis 允许你在映射语句执行过程中的某一点进行拦截调用。
默认情况下，MyBatis 允许使用插件来拦截的方法调用包括：

- 执行器Executor (update、query、commit、rollback等方法)
- SQL语法构建器StatementHandler (prepare、parameterize、batch、updates query等方法)
- 参数处理器ParameterHandler (getParameterObject、setParameters方法)
- 结果集处理器ResultSetHandler (handleResultSets、handleOutputParameters等方法)

插件是 MyBatis 提供的一个拓展机制，通过插件机制我们可在 SQL 执行过程中的某些点上做一些自定义操作。比喻分页插件，在SQL执行之前动态拼接语句，我们后面会单独来讲插件机制，先来了解插件的配置。如下：
```xml
<plugins>
  <plugin interceptor="com.github.pagehelper.PageInterceptor">
  <property name="helperDialect" value="mysql"/>
  </plugin>
</plugins>
```
**XMLConfigBuilder**
```java
pluginElement(root.evalNode("plugins"));
```
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

- 根据别名解析Class，然后创建实例
```java
protected <T> Class<? extends T> resolveClass(String alias) {
    if (alias == null) {
      return null;
    }
    try {
      return resolveAlias(alias);
    } catch (Exception e) {
      throw new BuilderException("Error resolving class. Cause: " + e, e);
    }
  }

```

- 从上一步的类型注册机中获取实例对象

**TypeAliasRegistry**
```java
 public <T> Class<T> resolveAlias(String string) {
    try {
      if (string == null) {
        return null;
      }
      // issue #748
      String key = string.toLowerCase(Locale.ENGLISH);
      Class<T> value;
      if (typeAliases.containsKey(key)) {
        value = (Class<T>) typeAliases.get(key);
      } else {
        value = (Class<T>) Resources.classForName(string);
      }
      return value;
    } catch (ClassNotFoundException e) {
      throw new TypeException("Could not resolve type alias '" + string + "'.  Cause: " + e, e);
    }
  }
```

- Intercepto类：这是插件接口，所有插件需要实现该接口

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
我们自定义一个插件：只需实现 Interceptor 接口，并指定想要拦截的方法签名即可
```java
// ExamplePlugin.java
@Intercepts({@Signature(
  type= Executor.class,
  method = "update",
  args = {MappedStatement.class,Object.class})})
public class ExamplePlugin implements Interceptor {
  private Properties properties = new Properties();

  @Override
  public Object intercept(Invocation invocation) throws Throwable {
    // implement pre processing if need
    Object returnObject = invocation.proceed();
    // implement post processing if need
    return returnObject;
  }

  @Override
  public void setProperties(Properties properties) {
    this.properties = properties;
  }
}
```

- InterceptorChain：拦截链

**InterceptorChain**
```java
ublic class InterceptorChain {
    // 拦截器链
    private final List<Interceptor> interceptors = new ArrayList<>();

    // target是支持拦截的几个类的实例。该方法依次向所有拦截器插入这几个类的实例
    // 如果某个插件真的需要发挥作用，则返回一个代理对象即可。如果不需要发挥作用，则返回原对象即可

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

    /**
     * 向拦截器链增加一个拦截器
     * @param interceptor 要增加的拦截器
     */
    public void addInterceptor(Interceptor interceptor) {
        interceptors.add(interceptor);
    }

    /**
     * 获取拦截器列表
     * @return 拦截器列表
     */
    public List<Interceptor> getInterceptors() {
        return Collections.unmodifiableList(interceptors);
    }

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
关于Mybatis的插件的介绍我后面会详细出一篇文章来介绍
# 六 解析objectFactory文件
参考官网：[mybatis – MyBatis 3 | 配置](https://mybatis.org/mybatis-3/zh/configuration.html#%E5%AF%B9%E8%B1%A1%E5%B7%A5%E5%8E%82%EF%BC%88objectfactory%EF%BC%89)

- 每次 MyBatis 创建结果对象的新实例时，它都会使用一个对象工厂（ObjectFactory）实例来完成实例化工作。
-  默认的对象工厂需要做的仅仅是实例化目标类，要么通过默认无参构造方法，要么通过存在的参数映射来调用带有参数的构造方法。
- 如果想覆盖对象工厂的默认行为，可以通过创建自己的对象工厂来实现。
```java
// ExampleObjectFactory.java
public class ExampleObjectFactory extends DefaultObjectFactory {
  @Override
  public <T> T create(Class<T> type) {
    return super.create(type);
  }

  @Override
  public <T> T create(Class<T> type, List<Class<?>> constructorArgTypes, List<Object> constructorArgs) {
    return super.create(type, constructorArgTypes, constructorArgs);
  }

  @Override
  public void setProperties(Properties properties) {
    super.setProperties(properties);
  }

  @Override
  public <T> boolean isCollection(Class<T> type) {
    return Collection.class.isAssignableFrom(type);
  }}
```
```java
!-- mybatis-config.xml -->
<objectFactory type="org.mybatis.example.ExampleObjectFactory">
  <property name="someProperty" value="100"/>
</objectFactory>
```
**XMLConfigBuilder**
```java
  private void objectFactoryElement(XNode context) throws Exception {
    if (context != null) {
        // 获取type属性：eg:org.mybatis.example.ExampleObjectFactory
      String type = context.getStringAttribute("type");
        // 解析成Properties文件
      Properties properties = context.getChildrenAsProperties();
        // 通过type 获取类型注册器的的实例对象
      ObjectFactory factory = (ObjectFactory) resolveClass(type).newInstance();
      factory.setProperties(properties);
        // configuration设置该属性
      configuration.setObjectFactory(factory);
    }
  }
```
# 七 解析 Environments 文件
参考官网：[mybatis – MyBatis 3 | 配置](https://mybatis.org/mybatis-3/zh/configuration.html#%E7%8E%AF%E5%A2%83%E9%85%8D%E7%BD%AE%EF%BC%88environments%EF%BC%89)
MyBatis 可以配置成适应多种环境，这种机制有助于将 SQL 映射应用于多种数据库之中， 现实情况下有多种理由需要这么做。例如，开发、测试和生产环境需要有不同的配置；或者想在具有相同 Schema 的多个生产数据库中使用相同的 SQL 映射。还有许多类似的使用场景。
注意一些关键点:

- 默认使用的环境 ID（比如：default="development"）。
- 每个 environment 元素定义的环境 ID（比如：id="development"）。
- 事务管理器的配置（比如：type="JDBC"）。
- 数据源的配置（比如：type="POOLED"）。

默认环境和环境 ID 顾名思义。 环境可以随意命名，但务必保证默认的环境 ID 要匹配其中一个环境 ID。
```xml
<environments default="development">
  <environment id="development">
    <transactionManager type="JDBC"/>
    <dataSource type="POOLED">
      <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
      <property name="url" value="jdbc:mysql://127.0.0.1:3306/mybatis?useUnicode=true"/>
      <property name="username" value="root"/>
      <property name="password" value="123456"/>
    </dataSource>
  </environment>
</environments>
```
**XMLConfigBuilder**
```java
 environmentsElement(root.evalNode("environments"));
```
```java
private void environmentsElement(XNode context) throws Exception {
    if (context != null) {
        if (environment == null) {
            environment = context.getStringAttribute("default");
        }
        for (XNode child : context.getChildren()) {
            // 获取Id属性
            String id = child.getStringAttribute("id");

             //检测当前 environment 节点的 id 与其父节点 environments 的属性 default 内容是否一致
            if (isSpecifiedEnvironment(id)) {
                // 事务管理器
                   // 将environment中的transactionManager标签转换为TransactionFactory对象
                TransactionFactory txFactory = transactionManagerElement(child.evalNode("transactionManager"));
                // 将environment中的dataSource标签转换为DataSourceFactory对象
                DataSourceFactory dsFactory = dataSourceElement(child.evalNode("dataSource"));
                 // 数据源
                DataSource dataSource = dsFactory.getDataSource();
                // 创建 DataSource 对象
                Environment.Builder environmentBuilder = new Environment.Builder(id)
                    .transactionFactory(txFactory)
                    .dataSource(dataSource);
                 // configuration设置
                configuration.setEnvironment(environmentBuilder.build());
            }
        }
    }
}
```

- transactionManagerElement()：获取事务管理器：有两种配置信息如下
1. JDBC – 这个配置直接使用了 JDBC 的提交和回滚功能，它依赖从数据源获得的连接来管理事务作用域。默认情况下，为了与某些驱动程序兼容，它在关闭连接时启用自动提交。然而，对于某些驱动程序来说，启用自动提交不仅是不必要的，而且是一个代价高昂的操作。因此，从 3.5.10 版本开始，你可以通过将 "skipSetAutoCommitOnClose" 属性设置为 "true" 来跳过这个步骤。
2. MANAGED – 这个配置几乎没做什么。它从不提交或回滚一个连接，而是让容器来管理事务的整个生命周期（比如 JEE 应用服务器的上下文）。 默认情况下它会关闭连接。然而一些容器并不希望连接被关闭，因此需要将 closeConnection 属性设置为 false 来阻止默认的关闭行为。
3. 如果你正在使用 Spring + MyBatis，则没有必要配置事务管理器，因为 Spring 模块会使用自带的管理器来覆盖前面的配置。
```java
  private TransactionFactory transactionManagerElement(XNode context) throws Exception {
    if (context != null) {
      String type = context.getStringAttribute("type");
      Properties props = context.getChildrenAsProperties();
        // 实例化
      TransactionFactory factory = (TransactionFactory) resolveClass(type).newInstance();
      factory.setProperties(props);
      return factory;
    }
    throw new BuilderException("Environment declaration requires a TransactionFactory.");
  }
```

- dataSourceElement（）：获取数据源工厂
- dataSource 元素使用标准的 JDBC 数据源接口来配置 JDBC 连接对象的资源。
- 大多数 MyBatis 应用程序会按示例中的例子来配置数据源。
- 虽然数据源配置是可选的，但如果要启用延迟加载特性，就必须配置数据源，有三种内建的数据源类型（也就是 type="[UNPOOLED|POOLED|JNDI]"）：
1. **UNPOOLED**– 这个数据源的实现会每次请求时打开和关闭连接。虽然有点慢，但对那些数据库连接可用性要求不高的简单应用程序来说，是一个很好的选择。 性能表现则依赖于使用的数据库，对某些数据库来说，使用连接池并不重要，这个配置就很适合这种情形。
2. **POOLED**– 这种数据源的实现利用“池”的概念将 JDBC 连接对象组织起来，避免了创建新的连接实例时所必需的初始化和认证时间。 这种处理方式很流行，能使并发 Web 应用快速响应请求。
3. **JNDI** – 这个数据源实现是为了能在如 EJB 或应用服务器这类容器中使用，容器可以集中或在外部配置数据源，然后放置一个 JNDI 上下文的数据源引用。
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
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1671110175237-50c2e29b-1ff8-4587-b434-4e063deeb346.png#averageHue=%23465365&clientId=uf55608f6-550b-4&from=paste&height=108&id=ue0f74b10&originHeight=135&originWidth=961&originalType=binary&ratio=1&rotation=0&showTitle=false&size=29955&status=done&style=none&taskId=u6fd7480e-c614-4acd-b2d0-3a77fe7ea83&title=&width=768.8)
总结：

1. 获取配置的事务工厂
2. 获取配置的获取数据源工厂
# 七 解析Mapper 文件
官网：[mybatis – MyBatis 3 | 配置](https://mybatis.org/mybatis-3/zh/configuration.html#%E6%98%A0%E5%B0%84%E5%99%A8%EF%BC%88mappers%EF%BC%89)

- 既然 MyBatis 的行为已经由上述元素配置完了，我们现在就要来定义 SQL 映射语句了。 但首先，我们需要告诉 MyBatis 到哪里去找到这些语句。
-  在自动查找资源方面，Java 并没有提供一个很好的解决方案，所以最好的办法是直接告诉 MyBatis 到哪里去找映射文件。
-  你可以使用相对于类路径的资源引用，或完全限定资源定位符（包括 file:/// 形式的 URL），或类名和包名等。
```java
<!-- 使用相对于类路径的资源引用 -->
<mappers>
  <mapper resource="org/mybatis/builder/AuthorMapper.xml"/>
  <mapper resource="org/mybatis/builder/BlogMapper.xml"/>
  <mapper resource="org/mybatis/builder/PostMapper.xml"/>
</mappers>
 <!-- 使用完全限定资源定位符（URL） -->
<mappers>
  <mapper url="file:///var/mappers/AuthorMapper.xml"/>
  <mapper url="file:///var/mappers/BlogMapper.xml"/>
  <mapper url="file:///var/mappers/PostMapper.xml"/>
</mappers>
    <!-- 使用映射器接口实现类的完全限定类名 -->
<mappers>
  <mapper class="org.mybatis.builder.AuthorMapper"/>
  <mapper class="org.mybatis.builder.BlogMapper"/>
  <mapper class="org.mybatis.builder.PostMapper"/>
</mappers>
    <!-- 将包内的映射器接口全部注册为映射器 -->
<mappers>
  <package name="org.mybatis.builder"/>
</mappers>
```
后面我们会详细介绍Mapper文件的解析过程：请参考：[Mybatis源码分析（四）Mapper文件的解析_长安不及十里的博客-CSDN博客](https://blog.csdn.net/weixin_44451022/article/details/128520296?spm=1001.2014.3001.5502)
```java
 /**
   * 解析mappers节点，例如：
   * <mappers>
   *    <mapper resource="com/github/yeecode/mybatisDemo/UserDao.xml"/>
   *    <package name="com.github.yeecode.mybatisDemo" />
   * </mappers>
   * @param parent mappers节点
   * @throws Exception
   */
  private void mapperElement(XNode parent) throws Exception {

    if (parent != null) {
      for (XNode child : parent.getChildren()) {
        // 处理mappers的子节点，即mapper节点或者package节点
        if ("package".equals(child.getName())) { // package节点
          // 取出包的路径
          String mapperPackage = child.getStringAttribute("name");
          // 全部加入Mappers中
          configuration.addMappers(mapperPackage);
        } else {
          // resource、url、class这三个属性只有一个生效
          String resource = child.getStringAttribute("resource");
          String url = child.getStringAttribute("url");
          String mapperClass = child.getStringAttribute("class");
          if (resource != null && url == null && mapperClass == null) {
            ErrorContext.instance().resource(resource);
            // 获取文件的输入流
            InputStream inputStream = Resources.getResourceAsStream(resource);
            // 使用XMLMapperBuilder解析Mapper文件
            XMLMapperBuilder mapperParser = new XMLMapperBuilder(inputStream, configuration, resource, configuration.getSqlFragments());
            mapperParser.parse();
          } else if (resource == null && url != null && mapperClass == null) {
            ErrorContext.instance().resource(url);
            // 从网络获得输入流
            InputStream inputStream = Resources.getUrlAsStream(url);
            // 使用XMLMapperBuilder解析Mapper文件
            XMLMapperBuilder mapperParser = new XMLMapperBuilder(inputStream, configuration, url, configuration.getSqlFragments());
            mapperParser.parse();
          } else if (resource == null && url == null && mapperClass != null) {
            // 配置的不是Mapper文件，而是Mapper接口
            Class<?> mapperInterface = Resources.classForName(mapperClass);
            configuration.addMapper(mapperInterface);
          } else {
            throw new BuilderException("A mapper element may only specify a url, resource or class, but not more than one.");
          }
        }
      }
    }
  }
```
下一文章我会详细介绍一下Mapper的解析，其他不重要文件的解析，其实更上面有些解析类似，或者很简单就不一一解释了，当这些文件解析完毕，就返回一个Configuration对象，最终我们拿到了SqlSessionFactory
```java
  public SqlSessionFactory build(Configuration config) {
    return new DefaultSqlSessionFactory(config);
  }
```
**到了最后我们总结一下步骤：**

1. **我们已经通过Resources.getResourceAsStream（）方法获取到我们需要的配置信息。**
2. **将配置信息传递给SqlSessionFactoryBuilder#build（）方法，进行文件的解析**
3. **SqlSessionFactoryBuilder调用自身的重载方法进行解析。**
4. **SqlSessionFactoryBuilder#build（）接着完成XMLConfigBuilder（）的初始化**
5. **XMLConfigBuilder#super(new Configuration())调用父类Configuration进行初始化。**
6. **接着调用XMLConfigBuilder#parse（）方法对配置文件进行解析。**
7. **调用XMLConfigBuilder#parseConfiguration（）方法对各个节点进行解析，解析完成对Configuration属性的设置。**
8. **解析完成返回Configuration对象，并生成DefaultSqlSessionFactory（）对象，完成了对DefaultSqlSessionFactory的解析。**

![](https://cdn.nlark.com/yuque/0/2023/jpeg/12426173/1673423618130-876ccd93-8c86-4926-ab67-de43b949d795.jpeg)


