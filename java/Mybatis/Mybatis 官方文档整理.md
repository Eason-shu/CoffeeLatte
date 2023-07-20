---
title: Mybatis官方文档整理
description: Mybatis官方文档整理
keywords:
- Mybatis
- 源码分析
tags:
- Mybatis
authors:
- EasonShu
date: <% tp.date.now("YYYY-MM-DD") %>
---
# 一 基本介绍

- 官网：[https://mybatis.org/mybatis-3/zh/index.html](https://mybatis.org/mybatis-3/zh/index.html)
## 1.1 简介

- MyBatis 是一款优秀的持久层框架，它支持自定义 SQL、存储过程以及高级映射。
- MyBatis 免除了几乎所有的 JDBC 代码以及设置参数和获取结果集的工作。
- MyBatis 可以通过简单的 XML 或注解来配置和映射原始类型、接口和 Java POJO（Plain Old Java Objects，普通老式 Java 对象）为数据库中的记录。
- 简单来学，就是一个保存数据的工具，就像我们存钱一样，总要有个介质来帮助我们来存钱，不用过多理解。
- 最重要的一点，在于融汇贯通，你不可能就只学这一个持久层框架，当然基本且扎实的sql功底是企业开发的必备技能。
## 1.2 其他

- 目的：写博客的目的在于帮助自己理解知识，同一个事物，每看一遍就有不同的理解，更重要的是帮助自己形成完成的知识体系。

**优点：**

- 简单易学：本身就很小且简单。没有任何第三方依赖，最简单安装只要两个jar文件+配置几个sql映射文件易于学习，易于使用，通过文档和源代码，可以比较完全的掌握它的设计思路和实现。
- 灵活：mybatis不会对应用程序或者数据库的现有设计强加任何影响。 sql写在xml里，便于统一管理和优化。通过sql基本上可以实现我们不使用数据访问框架可以实现的所有功能，或许更多。
- 解除sql与程序代码的耦合：通过提供DAL层，将业务逻辑和数据访问逻辑分离，使系统的设计更清晰，更易维护，更易单元测试。sql和代码的分离，提高了可维护性。
- 提供映射标签，支持对象与数据库的orm字段关系映射。
- 提供对象关系映射标签，支持对象关系组建维护。
- 提供xml标签，支持编写动态sql。

**缺点：**

- 编写SQL语句时工作量很大，尤其是字段多、关联表多时，更是如此。
- SQL语句依赖于数据库，导致数据库移植性差，不能更换数据库。
- 框架还是比较简陋，功能尚有缺失，虽然简化了数据绑定代码，但是整个底层数据库查询实际还是要自己写的，工作量也比较大，而且不太容易适应快速数据库修改。
- 二级缓存机制不佳。
# 二 基本环境搭建
## 2.1 idea 插件推荐

- MybatisLog：可以输出自己写的sql语句，方便自己检测错误，确定就是付费
- 破解版：链接：[https://pan.baidu.com/s/1gNHlehNn16Z0kHPRe92kTg?pwd=6666](https://pan.baidu.com/s/1gNHlehNn16Z0kHPRe92kTg?pwd=6666)
- MybatisX：插件应用商城下载安装
## 2.2 idea 创建项目

- pom文件
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.shu</groupId>
  <artifactId>MybatisDemo</artifactId>
  <version>1.0-SNAPSHOT</version>

  <properties>
    <maven.compiler.source>8</maven.compiler.source>
    <maven.compiler.target>8</maven.compiler.target>
  </properties>

  <dependencies>
    <!-- MyBatis 依赖 -->
    <dependency>
      <groupId>org.mybatis</groupId>
      <artifactId>mybatis</artifactId>
      <version>3.5.4</version>
    </dependency>
    <!-- mysql 驱动 -->
    <dependency>
      <groupId>mysql</groupId>
      <artifactId>mysql-connector-java</artifactId>
      <version>8.0.18</version>
    </dependency>
    <!-- 日志依赖 -->
    <dependency>
      <groupId>ch.qos.logback</groupId>
      <artifactId>logback-classic</artifactId>
      <version>1.2.3</version>
    </dependency>
  </dependencies>
  <!-- 文件打包配置 -->
  <build>
    <resources>
      <resource>
        <directory>src/main/resources</directory>
        <filtering>false</filtering>
      </resource>
      <resource>
        <directory>src/main/java</directory>
        <includes>
          <include>**/*.properties</include>
          <include>**/*.xml</include>
          <include>**/*.tld</include>
        </includes>
        <filtering>false</filtering>
      </resource>
    </resources>
  </build>


</project>
```

- 练习sql
```sql
/*
Navicat Premium Data Transfer

Source Server         : LocalHostMysql
Source Server Type    : MySQL
Source Server Version : 80022
Source Host           : localhost:3306
Source Schema         : oasys

Target Server Type    : MySQL
Target Server Version : 80022
File Encoding         : 65001

Date: 18/07/2022 20:35:55
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for aoa_user_log
-- ----------------------------
DROP TABLE IF EXISTS `aoa_user_log`;
CREATE TABLE `aoa_user_log`  (
  `log_id` bigint NOT NULL AUTO_INCREMENT,
  `ip_addr` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `log_time` datetime(0) NULL DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `user_id` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`log_id`) USING BTREE,
  INDEX `FKherb88q97dxbtcge09ii875qm`(`user_id`) USING BTREE,
  CONSTRAINT `FKherb88q97dxbtcge09ii875qm` FOREIGN KEY (`user_id`) REFERENCES `aoa_user` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2563 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of aoa_user_log
-- ----------------------------
INSERT INTO `aoa_user_log` VALUES (2551, '0:0:0:0:0:0:0:1', '2022-02-24 13:41:25', '菜单信息', 'http://localhost:9091/index', 1);
INSERT INTO `aoa_user_log` VALUES (2552, '0:0:0:0:0:0:0:1', '2022-02-24 13:41:25', '首页信息', 'http://localhost:9091/home', 1);
INSERT INTO `aoa_user_log` VALUES (2553, '0:0:0:0:0:0:0:1', '2022-02-24 14:10:59', '菜单信息', 'http://localhost:9091/index', 1);
INSERT INTO `aoa_user_log` VALUES (2554, '0:0:0:0:0:0:0:1', '2022-02-24 14:11:00', '首页信息', 'http://localhost:9091/home', 1);
INSERT INTO `aoa_user_log` VALUES (2555, '0:0:0:0:0:0:0:1', '2022-02-24 17:00:20', '菜单信息', 'http://localhost:9091/index', 1);
INSERT INTO `aoa_user_log` VALUES (2556, '0:0:0:0:0:0:0:1', '2022-02-24 17:00:21', '首页信息', 'http://localhost:9091/home', 1);
INSERT INTO `aoa_user_log` VALUES (2557, '0:0:0:0:0:0:0:1', '2022-02-24 17:00:35', '首页信息', 'http://localhost:9091/home', 1);
INSERT INTO `aoa_user_log` VALUES (2558, '0:0:0:0:0:0:0:1', '2022-02-24 17:00:50', '首页信息', 'http://localhost:9091/home', 1);
INSERT INTO `aoa_user_log` VALUES (2559, '0:0:0:0:0:0:0:1', '2022-02-24 17:02:43', '菜单信息', 'http://localhost:9091/index', 1);
INSERT INTO `aoa_user_log` VALUES (2560, '0:0:0:0:0:0:0:1', '2022-02-24 17:02:43', '首页信息', 'http://localhost:9091/home', 1);
INSERT INTO `aoa_user_log` VALUES (2561, '0:0:0:0:0:0:0:1', '2022-02-24 17:07:26', '首页信息', 'http://localhost:9091/home', 1);
INSERT INTO `aoa_user_log` VALUES (2562, '0:0:0:0:0:0:0:1', '2022-02-24 17:08:19', '菜单信息', 'http://localhost:9091/index', 1);
INSERT INTO `aoa_user_log` VALUES (2563, '0:0:0:0:0:0:0:1', '2022-02-24 17:08:19', '首页信息', 'http://localhost:9091/home', 1);

SET FOREIGN_KEY_CHECKS = 1;

```
## 2.3 编程式使用

- 在实际的开发中，你几乎没有机会去写这段代码。但是它可能是你面试的重点（mybatis中的工厂模式）
```java
package com.shu.mybatis;

import org.apache.ibatis.datasource.pooled.PooledDataSource;
import org.apache.ibatis.mapping.Environment;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.apache.ibatis.transaction.jdbc.JdbcTransactionFactory;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
* @author shu
* @version 1.0
* @date 2022/7/18 20:38
* @describe 编程式测试
*/
public class MybatisTest {
    public static void main(String[] args) throws SQLException {
        // Jdbc工厂
        JdbcTransactionFactory factory = new JdbcTransactionFactory();
        /**
        * url:url地址
        * username:用户名
        * password:密码
        */
        PooledDataSource dataSource = new PooledDataSource("com.mysql.cj.jdbc.Driver", "jdbc:mysql://localhost:3306/mybatis?useSSL=false", "root", "123456");
        // 配置环境，向环境中指定环境id、事务和数据源
        Environment environment = new Environment.Builder("development").transactionFactory(factory).dataSource(dataSource).build();
        // 新建 MyBatis 配置类
        Configuration configuration = new Configuration(environment);
        // 得到 SqlSessionFactory 核心类
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(configuration);
        // 开始一个 sql 会话
        SqlSession session = sqlSessionFactory.openSession();
        // 得到 sql 连接并运行 sql 语句
        PreparedStatement preStatement = session.getConnection().prepareStatement("SELECT * FROM  aoa_user_log WHERE log_id = ?");
        preStatement.setInt(1, 1);
        // 执行结果
        ResultSet result = preStatement.executeQuery();
        // 验证结果
        while (result.next()) {
            System.out.println("ip_addr : " + result.getString("ip_addr "));
        }
        // 关闭会话
        session.close();
    }
}

```
## 2.4 配置式编程
配置式开发针对SSM开发，我们可以了解，后面主要的一般是SpringBoot整合开发

- 编写配置文件mybatis-config.xml
```java
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                <property name="url" value="jdbc:mysql://localhost:3306/imooc?useSSL=false"/>
                <property name="username" value="root"/>
                <property name="password" value="123456"/>
            </dataSource>
        </environment>
    </environments>
</configuration>

```

- 编写代码文件
```java
package com.shu.mybatis;

import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;

import java.io.IOException;
import java.io.InputStream;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * @author shu
 * @version 1.0
 * @date 2022/7/18 21:52
 * @describe 配置式mybatis
 */
public class MybatisConfigTest {
    public static void main(String[] args) throws IOException, SQLException {
        // 配置式使用MyBatis
        String resource = "mybatis-config.xml";
        // 读取配置文件
        InputStream inputStream = Resources.getResourceAsStream(resource);
        // 按照配置文件得到 SqlSessionFactory
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        // 新建会话
        SqlSession session = sqlSessionFactory.openSession();
        // 执行SQL
        PreparedStatement preStatement = session.getConnection().prepareStatement("SELECT * FROM  aoa_user_log WHERE log_id = ?");
        preStatement.setInt(1, 1);
        ResultSet result = preStatement.executeQuery();
        while (result.next()) {
            System.out.println("ip_addr : " + result.getString("ip_addr "));
        }
        // 关闭会话
        session.close();
    }
}

```
# 三 基本功能的使用
## 3.1 Mapper的使用
定义一个Mapper接口
```java
@Mapper
public interface UserLogMapper {
}
```
### 3.1.1 注解式开发

- 优点：快速，高效，方便，缺点：不方便维护，不能发挥mybatis的全部功能
- 注解式开发，直接写好的sql语句填充到注解中
```java
package com.shu.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

/**
 * @author shu
 * @version 1.0
 * @date 2022/7/19 9:09
 * @describe
 */
@Mapper
public interface UserLogMapper {

    /**
     * 注解式查询方法
     * @param id
     * @return
     */
    @Select("select * from aoa_user_log where log_id=#{id}")
    String selectUserLogByIds(Integer id);
}

```
### 3.1.2 配置式开发
```java
package com.shu.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

/**
 * @author shu
 * @version 1.0
 * @date 2022/7/19 9:09
 * @describe
 */
@Mapper
public interface UserLogMapper {
    /**
     * 查询日志信息配置文件写法
     * @param id
     * @return
     */
    String selectUserLogById(Integer id);
}

```
强烈建议插件：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1658217173784-e72a55eb-6582-493f-9630-5154617ee68b.png#averageHue=%23373a3f&clientId=u48de3c14-5e51-4&from=paste&height=703&id=uebf7f67f&originHeight=879&originWidth=1229&originalType=binary&ratio=1&rotation=0&showTitle=false&size=89108&status=done&style=none&taskId=uc3b99d33-616f-4f0c-989c-660776d72e6&title=&width=983.2)
编写配置文件（注意配置文件必须在同一个mapper包文件下）
```java
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<!-- 命名空间表示：对应那个mapper -->
<mapper namespace="com.shu.mapper.UserLogMapper">

    <!--  id:唯一属性表示对应的那个方法 ,resultType:结果类型 -->
    <select id="selectUserLogById" resultType="java.lang.String">
        select log_title from aoa_user_log where log_id=#{id}
    </select>

</mapper>

```
插件的作用：可以快速点击到对应是配置文件
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1658217265846-6d704bf4-7de4-4839-b6de-f61f990107fa.png#averageHue=%23605d41&clientId=u48de3c14-5e51-4&from=paste&height=460&id=u433bda87&originHeight=575&originWidth=1817&originalType=binary&ratio=1&rotation=0&showTitle=false&size=120376&status=done&style=none&taskId=u62b973b8-28b3-45dc-8298-d38e8594181&title=&width=1453.6)
最重要的一步，注册到配置管理文件中
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1658217348290-cf797bde-333b-4a9e-b097-4301e1a3e431.png#averageHue=%238c8e5c&clientId=u48de3c14-5e51-4&from=paste&height=734&id=u3574a040&originHeight=918&originWidth=1912&originalType=binary&ratio=1&rotation=0&showTitle=false&size=203789&status=done&style=none&taskId=u0bbca2b2-1225-4ef2-a659-811ab9117a4&title=&width=1529.6)
到这我们基本上了解了Mapper的两种基本使用方式
## 3.2 Select 标签
在 MyBatis 中，select 标签对应于 SQL 语句中的 select 查询，我们会在 select 标签中填充 SQL 查询语句，然后在代码中通过对应接口方法来调用。
### 3.2.1 注解式
```java
 /**
     * 注解式查询方法
     * @param id
     * @return
     */
    @Select("select * from aoa_user_log where log_id=#{id}")
    String selectUserLogByIds(Integer id);
```
 使用注解来书写 MyBatis 相对会方便一些，但是注解无法发挥 MyBatis 动态 SQL 真正的威力，因此大部分人都还是会选择 xml 的方式来书写 SQL，但是对于一些 demo 的展示，注解无疑容易上手一些。在后面的学习中，我们都会介绍到注解的使用，但是在实践中我们默认使用 xml 方式。
### 3.2.2 配置式
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<!-- 命名空间表示：对应那个mapper -->
<mapper namespace="com.shu.mapper.UserLogMapper">

  <!--  id:唯一属性表示对应的那个方法 ,resultType:结果类型 -->
  <select id="selectUserLogById" resultType="java.lang.String">
    select log_title from aoa_user_log where log_id=#{id}
  </select>

</mapper>

```
**select属性标签**

| 属性 | 描述 |
| --- | --- |
| id | 在命名空间中唯一的标识符 |
| parameterType | 语句的参数类型，默认可选，MyBatis 会自动推断 |
| resultType | 语句返回值类型，如果返回的是集合，那应该设置为集合包含的类型 |
| resultMap | 语句返回映射的 id；可以使用 resultType 或 resultMap，但不能同时使用。 |
| flushCache | 设置为 true 后，只要语句被调用，都会导致本地缓存和二级缓存被清空，默认为 false |
| useCache | 设置为 true 后，本条语句的查询结果被二级缓存缓存起来，默认 select 标签为 true。 |
| timeout | 设置超时时间 |
| fetchSize | 设置预期返回的记录数量 |
| statementType | STATEMENT，PREPARED 或 CALLABLE 中的一个，默认为 PREPARED（预处理） |

**参数配置**

- 对象参数（就是传入的参数是一个实体类，注意大小写一致）
```xml
    <select id="selectUserLogByIdS" resultType="com.shu.pojo.UserLog">
        select log_title from aoa_user_log where log_id=#{id}
    </select>

```

- #{}不仅可以传入参数名称，还可以传入参数类型和类型处理器。
- 对于参数配置，90% 的情况你都只需要传入参数名即可，因为 MyBatis 都会自动推断出配置。

**对于这个地方的难点在于一对多，或多对一的联合查询**
```java
/**
* 获取所有菜单信息
* @return
*/
@Select("select * from oa_menu m1\n" +
        "where m1.pid=0 and m1.isDelete=0")
@Results({
    @Result(column="id", property="id", jdbcType= JdbcType.BIGINT, id=true),
    @Result(property = "children", column = "id",javaType = List.class,
            many = @Many(select = "com.oa.mapper.OaMenuMapper.findByFid"))
})
List<OaMenu> getAllMenuInfo();


/**
* 获取子菜单
* @param fid
* @return
*/
@Select("select * from oa_menu where pid=#{fid} and isDelete=0")
    List<OaMenu> findByFid(@Param("fid") Integer fid);
```
## 3.3 resultMap标签

- MyBatis 可以自动帮助我们映射数据库数据和 Java 对象，其实这是 MyBatis 在幕后帮我们创建了 resultMap 对象；
- 虽然 MyBatis 可以自动帮助我们做数据映射，但是对于复杂的对象，我们就必须自定义 resultMap 了。
### 3.3.1 注解式
**property：对象字段，column：数据库字段**

-  Results 注解以及 ResultMap 注解虽然存在，但是很少在实际的开发中使用，只需了解即可。
```java
@Results({
  @Result(property = "id", column = "id", id = true),
  @Result(property = "username", column = "username"),
  @Result(property = "age", column = "age"),
  @Result(property = "score", column = "score")
})
@Select("SELECT * FROM imooc_user WHERE id = #{id}")
User selectUserById(Integer id);
```
### 3.3.2 配置式
**其实这跟注解式其实是一样的**
```java
<resultMap id="userMap" type="com.imooc.mybatis.model.User">
  <id property="id" column="id"/>
  <result property="username" column="username"/>
  <result property="age" column="age"/>
  <result property="score" column="score"/>
</resultMap>

<select id="selectUserByAgeAndScore" parameterType="com.imooc.mybatis.model.User"
        resultMap="userMap">
  SELECT * FROM imooc_user WHERE age = #{age} AND score = #{score}
</select>

```
### 3.3.3 Sql 标签
对于我们需要重复使用的sql，我们可以定义为Sql标签，方便重复使用
```xml
<sql id="selectUser">
  select log_title from aoa_user_log where log_id=#{id}
</sql>

```
使用sql标签
```xml
<select id="selectUserByAgeAndScore" parameterType="com.shu.pojo.UserLog"
        resultMap="userMap">
  <include refid="selectUser"/>
  WHERE age = #{age} AND score = #{score}
</select>

```
## 3.4 Insert标签
**对于insert标签其实就是我们sql中的插入语句**
### 3.4.1 注解式
注解式其实很简单，但是我们要注意其sql语句的正确性
```java
@Insert(" insert into aoa_user_log(log_id,ip_addr,log_time,title,url,user_id)\n" +
        "        values (#{log_id},#{ip_addr},#{log_time},#{title},#{url},#{user_id})")
    int insertUserLogs(UserLog userLog);
```
### 3.4.2 配置式
```xml
<!-- 插入记录   -->
<insert id="insertUserLog" parameterType="com.shu.pojo.UserLog">
  insert into aoa_user_log(log_id,ip_addr,log_time,title,url,user_id)
  values (#{log_id},#{ip_addr},#{log_time},#{title},#{url},#{user_id})
</insert>
```
**常用属性**

| 属性 | 描述 |
| --- | --- |
| id | 在命名空间中的唯一标识符 |
| parameterType | 语句的参数类型，默认可选，MyBatis 会自动推断 |
| flushCache | 设置为 true 后，只要语句被调用，都会导致本地缓存和二级缓存被清空，默认为 false |
| timeout | 设置超时时间 |
| statementType | STATEMENT，PREPARED 或 CALLABLE 中的一个，默认为 PREPARED（预处理） |
| useGeneratedKeys | 取出由数据库自动生成的主键，仅对支持主键自动生成的数据库有效，默认为 false |
| keyProperty | 主键的名称，必须与useGeneratedKeys 一起使用，默认未设置 |

### 3.4.3 主键的获取

- 对于insert语句我们可能最难的就是有时会用到insert语句返回的的主键
```xml
    <insert id="insertUserLog" parameterType="com.shu.pojo.UserLog"  useGeneratedKeys="true" keyProperty="log_id">
        insert into aoa_user_log(log_id,ip_addr,log_time,title,url,user_id)
        values (#{log_id},#{ip_addr},#{log_time},#{title},#{url},#{user_id})
    </insert>
```
```java
@Insert(" insert into aoa_user_log(log_id,ip_addr,log_time,title,url,user_id)\n" +
        "        values (#{log_id},#{ip_addr},#{log_time},#{title},#{url},#{user_id})")
@Options(useGeneratedKeys = true, keyProperty = "log_id")
    int insertUserLogs(UserLog userLog);
```
### 3.4.4 selectKey
前面的情况主要针对是有主键自增的，但是我们有时使用的数据库没有自增，比如oracle
这是就需要借鉴到selectKey,如果是mysql数据库的可以忽略。

| 属性 | 描述 |
| --- | --- |
| keyColumn | 数据库字段名，对应返回结果集中的名称 |
| keyProperty | 目标字段名称，对应Java 对象的字段名 |
| resultType | id字段的类型 |
| order | 执行的顺序，在 insert 之前调用为 BEFORE，之后为 AFTER |


```xml
<selectKey keyColumn="id" resultType="long" keyProperty="id" order="AFTER">
  SELECT LAST_INSERT_ID()
  </selectKey>
```

```java
@SelectKey(statement = "SELECT LAST_INSERT_ID()", keyProperty = "id", before = false, resultType = Long.class)
```
## 3.5 update标签
### 3.5.1 注解式
```java
@Update("update aoa_user_log set ip_addr=#{ip_addr} where log_id=#{log_id}")
    int updateUserLogByIds(UserLog userLog);
```
### 3.5.2 配置式
```xml
<!-- 更新语句-->
<update id="updateUserLogById" parameterType="com.shu.pojo.UserLog">
  update aoa_user_log set ip_addr=#{ip_addr} where log_id=#{log_id}
</update>

```
| 属性 | 描述 |
| --- | --- |
| id | 在命名空间中的唯一标识符 |
| parameterType | 语句的参数类型，默认可选，MyBatis 会自动推断 |
| flushCache | 设置为 true 后，只要语句被调用，都会导致本地缓存和二级缓存被清空，默认为 false |
| timeout | 设置超时时间 |
| statementType | STATEMENT，PREPARED 或 CALLABLE 中的一个，默认为 PREPARED（预处理） |

## 3.6 delete标签
**在真实开发中，我们要注意慎用delete语句，一般我们的删除主要是逻辑删除不是物理删除**
### 3.6.1 注解式
```java
@Delete(" delete from  aoa_user_log where log_id=#{log_id}")
    int deleteUserLogByIds(UserLog userLog);
```
### 3.6.2 配置式
```xml
<!--  删除语句  -->
<delete id="deleteUserLogById" parameterType="com.shu.pojo.UserLog">
  delete from  aoa_user_log where log_id=#{log_id}
    </delete>
```
## 3.7 动态sql
MyBatis 的动态 SQL 广泛应用到了OGNL 表达式，OGNL 表达式可以灵活的组装 SQL 语句，从而完成更多的功能。
OGNL 全称 Object-Graph Navigation Language，是 Java 中的一个开源的表达式语言，用于访问对象数据。
配置式
```xml
    <sql id="test">
        <if test="log_id!=null">
       and log_id=#{log_id}
        </if>
    </sql>
```
注解式
```java
/**
* 查询用户信息
* @param page
* @param size
* @param username
* @param email
* @param deptTree_select_input
* @param deptId
* @param status
* @return
*/
@Select("<script>" +
        "select u.*, d1.dept_name as deptName from oa_user u\n" +
        "inner join oa_dept_user d on d.user_id=u.user_id\n" +
        "inner join oa_dept d1 on d1.id=d.dept_id where u.is_delete=0 " +
        ""+"<if test='email !=null'>"+"and u.email=#{email}"+"</if>" +
        ""+"<if test='deptId !=-1'>"+"and d.dept_id in (select id from oa_dept d where FIND_IN_SET(d.id,(select `getChildList`(#{deptId}))))"+"</if>" +
        ""+"<if test='status !=-1'>"+"and u.is_lock=#{status}"+"</if>" +
        ""+"<if test='username !=null'>"+"and u.real_name like concat(concat('%',#{username,jdbcType=VARCHAR}),'%')"+"</if>" +
        "limit #{page},#{size}"+
        "</script>"
       )
List<OaUser> getListUserInfo(@Param("page") int page,
                             @Param("size") int size,
                             @Param("username") String username,
                             @Param("email") String email,
                             @Param("deptTree_select_input") String deptTree_select_input,
                             @Param("deptId") Integer deptId,
                                 @Param("status") Integer status);
```
### 3.7.1 if标签
if 常用于 where 语句中，通过判断参数来决定在 select 语句中是否使用某个查询条件，或者在 update 语句中判断是否更新一个字段，还可以在 insert 语句中决定是否插入一个满足条件的值。（此标签应该是工作中经常用到）
**上面有案例，我就不写了**
### 3.7.2 Choose与Bind标签

- choose 标签是 if 标签的增强版，适用于更加复杂的条件判断逻辑；而bind 标签则可以在 OGNL 上下文环境中新绑定一个变量，供后面的 SQL 使用。
- choose 标签相当于编程语言 if…else 语句，用于动态 SQL 中的多条件判断，是 if 标签的增强版。
- bind 标签可以在动态 SQL 中通过 OGNL 表达式来创建一个新的变量绑定到上下文中，供后续的 SQL 使用。
```xml
<select id="selectUserByLikeName" resultType="com.imooc.mybatis.model.User">
  SELECT * FROM imooc_user
  WHERE username LIKE
  <choose>
    <when test="_databaseId == 'mysql'">
      CONCAT('%',#{username},'%')
    </when>
    <when test="_databaseId == 'postgre'">
      '%' || #{username} || '%'
    </when>
    <otherwise>
      <bind name="usernameLike" value="'%' + username + '%'"/>
      #{usernameLike}
    </otherwise>
  </choose>
</select>
```
### 3.7.3 where标签
```xml
<select id="selectUserByIdAndName" resultType="com.imooc.mybatis.model.User">
  SELECT * FROM imooc_user
  <where>
    <if test="id != null">
      id = #{id}
    </if>
    <if test="username != null">
      AND username = #{username}
    </if>
  </where>
</select>
```
### 3.7.4 set标签
set标签会在前面添加set字段表示来修改那个值
```xml
<update id="updateUsernameAndScoreById">
  UPDATE imooc_user
  <set>
    <if test="username != null">
      username = #{username},
    </if>
    id = #{id}
  </set>
  WHERE id = #{id}
</update>

```
### 3.7.5 trim 标签
trim 标签共有 4 个属性，它们的作用分别如下：

- **prefix：** 前缀属性，若标签内不为空则在 SQL 中添加上前缀；
- **prefixOverrides：** 前缀覆盖属性，若标签中有多余的前缀，将会被覆盖（其实就是丢弃该前缀）；
- **suffix：** 后缀属性，若标签内不为空则在 SQL 中添加上后缀；
- **suffixOverrides：** 后缀覆盖属性，若标签中有多余的后缀，将会被覆盖（其实就是丢弃该后缀）。
```xml
<update id="updateUsernameAndScoreById">
  UPDATE imooc_user
  <trim prefix="SET" suffixOverrides=",">
    <if test="username != null">
      username = #{username},
    </if>
    <if test="id != null">
      id = #{id}
    </if>
  </trim>
  WHERE id = #{id}
</update>

```
### 3.7.6 foreach标签
foreach 标签用来遍历数组、列表和 Map 等集合参数，常与 in 关键字搭配使用。（假如你从前端传入的是一个数组或集合，那么你就可以使用这个标签）

- **collection：** 被遍历集合参数的名称，如 list，或者数组array；
- **open：** 遍历开始时插入到 SQL 中的字符串，如 ( ；
- **close：** 遍历结束时插入到 SQL 中的字符串，如 ) ；
- **separator：** 分割符，在每个元素的后面都会插入分割符；
- **item：** 元素值，遍历集合时元素的值；
- **index：** 元素序列，遍历集合时元素的序列。
```xml
<select id="selectUserInIds" resultType="com.imooc.mybatis.model.User">
  SELECT * FROM imooc_user
  WHERE id IN
  <foreach collection="list" open="(" close=")" separator="," item="item" index="index">
    #{item}
  </foreach>
</select>

```
其他配置信息请参考官方文档：[https://mybatis.org/mybatis-3/zh/configuration.html](https://mybatis.org/mybatis-3/zh/configuration.html)
## 3.8 缓存

- 多次的去查数据库，必然会造成数据库压力过大，因此mybatis的设计者设计了一级缓存以及二级缓存来缓解查询的压力
- MyBatis 一级缓存是默认开启的，缓存的有效范围是一个会话内。一个会话内的 select 查询语句的结果会被缓存起来，当在该会话内调用 update、delete 和 insert 时，会话缓存会被刷新，以前的缓存会失效。
- elect 默认会启用一级缓存，我们也可通过配置来关闭掉 select 缓存。我们通过 flushCache 属性来关闭 select 查询的缓存。
- MyBatis 二级缓存默认关闭，我们可以通过简单的设置来开启二级缓存。二级缓存的有效范围为一个 SqlSessionFactory 生命周期，绝大多数情况下，应用都会只有一个 SqlSessionFactory，因此我们可以把二级缓存理解为全局缓存。（当然我们在正式开发中一般很少使用二级缓存，毕竟内存资源宝贵，不容浪费）
### 3.8.1 配置式
| 属性 | 描述 |
| --- | --- |
| eviction | 回收策略，默认 LRU，可选择的有 FIFO（先进先出），SOFT（软引用），WEAK（弱引用） |
| flushInterval | 刷新时间 |
| size | 最多缓存对象数 |
| readOnly | 是否只读 |

- 全局开启
```xml
<settings>
  <setting name="cacheEnabled" value="true"/>
</settings>

```

- 单个mapper开启
```xml
 <cache
    eviction="FIFO"
    flushInterval="60000"
    size="512"
    readOnly="true"/>

```
### 3.8.2 注解式
```java
@CacheNamespace(
    eviction = FifoCache.class,
    flushInterval = 60000,
    size = 512,
    readWrite = false
)
```
### 3.8.3 缓存共享
有时候，我们想在不同的 mapper 中共享缓存，为了解决这类问题，MyBatis 提供了 cache-ref 配置。
```java
<cache-ref namespace="com.imooc.mybatis.mapper.UserMapper"/>
```
```java
@CacheNamespaceRef(UserMapper.class)
public interface BlogMapper {
}
```
**当然基本知识就介绍到这，后面的高级知识需要阅读源码，博客，书籍来提示自己**
# 四 整合
## 4.1 SpringBoot+Mybatis整合

- 依赖
```xml
<dependency>
  <groupId>mysql</groupId>
  <artifactId>mysql-connector-java</artifactId>
  <version>8.0.27</version>
</dependency>


<dependency>
  <groupId>org.mybatis.spring.boot</groupId>
  <artifactId>mybatis-spring-boot-starter</artifactId>
  <version>1.3.0</version>
</dependency>

<dependency>
  <groupId>com.alibaba</groupId>
  <artifactId>druid-spring-boot-starter</artifactId>
  <version>1.1.10</version>
</dependency>


```

- 编写配置文件
```yaml
#mybatis的相关配置
mybatis:
  #mapper配置文件
  mapper-locations: classpath:mapper/*.xml
  #指定包的别名
  type-aliases-package: com.shu.mapper
  #开启驼峰命名
  configuration:
    map-underscore-to-camel-case: true

server:
  servlet:
    session:
      timeout: 3600 # 单位秒


########## 配置数据源 （Druid）##########
spring:
  datasource:
    ########## JDBC 基本配置 ##########
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver   # mysql8 的连接驱动
    url: jdbc:mysql://localhost:3306/oasy?autoReconnect=true&useSSL=false&characterEncoding=utf-8
    platform: mysql                               # 数据库类型
    type: com.alibaba.druid.pool.DruidDataSource  # 指定数据源类型

```

- 编写mapper（我这用的注解式,当然你也可以用配置式）
```java
package com.oa.mapper;

import com.oa.model.OaVersion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
* @Author shu
* @Version 1.0
* @Date: 2022/05/13/ 9:32
* @Description 系统更新日志
**/
@Mapper
@Repository
public interface OaVersionMapper {

    /**
    * 获取系统更新日志信息
    * @return
    */
    @Select("select id, version, content,DATE_FORMAT(publish_time,'%Y-%m-%d') as publishTime  from oa_version ORDER BY publish_time DESC ")
    List<OaVersion> getListVersionInfo();
}

```
配置式的文件编写地方
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1658295197617-433cf9b1-d614-40ea-881c-d545e65029a3.png#averageHue=%232e436a&clientId=u2cc0d34f-9246-4&from=paste&height=214&id=u12e26063&originHeight=267&originWidth=1893&originalType=binary&ratio=1&rotation=0&showTitle=false&size=51926&status=done&style=none&taskId=ua53c238e-19aa-4fa1-acb8-0b450f593b5&title=&width=1514.4)

- 就可以编写sql了和自己的业务逻辑了
