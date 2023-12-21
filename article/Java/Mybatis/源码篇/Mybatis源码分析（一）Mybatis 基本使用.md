---
title: Mybatis源码分析（一）Mybatis的基本使用
sidebar_position: 3
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
![Mybatis](http://mybatis.org/images/mybatis-logo.png)

- 官网：[mybatis – MyBatis 3 | 简介](https://mybatis.org/mybatis-3/zh/index.html)
# 一 知识回顾
## 1.1 简介

- MyBatis 是一款优秀的持久层框架，它支持自定义 SQL、存储过程以及高级映射。
- MyBatis 免除了几乎所有的 JDBC 代码以及设置参数和获取结果集的工作。
- MyBatis 可以通过简单的 XML 或注解来配置和映射原始类型、接口和 Java POJO（Plain Old Java Objects，普通老式 Java 对象）为数据库中的记录。
- 简单来学，就是一个保存数据的工具，就像我们存钱一样，总要有个介质来帮助我们来存钱，不用过多理解。
- 最重要的一点，在于融汇贯通，你不可能就只学这一个持久层框架，当然基本且扎实的sql功底是企业开发的必备技能。
## 1.2 其他
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
# 二 基本使用

- sql 文件
```javascript
/*
 Navicat Premium Data Transfer

 Source Server         : LocalHostMysql
 Source Server Type    : MySQL
 Source Server Version : 80022
 Source Host           : localhost:3306
 Source Schema         : mybatis

 Target Server Type    : MySQL
 Target Server Version : 80022
 File Encoding         : 65001

 Date: 14/12/2022 15:30:24
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for task
-- ----------------------------
DROP TABLE IF EXISTS `task`;
CREATE TABLE `task`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `taskName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 35 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of task
-- ----------------------------
INSERT INTO `task` VALUES (1, 1, 'Clean classroom.');
INSERT INTO `task` VALUES (2, 1, 'Open the door.');
INSERT INTO `task` VALUES (3, 2, 'Open windows.');
INSERT INTO `task` VALUES (4, 3, 'Clean the blackboard.');
INSERT INTO `task` VALUES (5, 2, 'Buy some boos.');
INSERT INTO `task` VALUES (6, 3, 'Buy some pens.');
INSERT INTO `task` VALUES (7, 4, 'Buy some flowers.');

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `age` int NULL DEFAULT NULL,
  `sex` int NULL DEFAULT NULL,
  `schoolName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, '易哥', 'yeecode@sample.com', 18, 0, 'Sunny School');
INSERT INTO `user` VALUES (2, '莉莉', 'lili@sample.com', 15, 1, 'Garden School');
INSERT INTO `user` VALUES (3, '杰克', 'jack@sample.com', 25, 0, 'Sunny School');
INSERT INTO `user` VALUES (4, '张大壮', 'zdazhaung@sample.com', 16, 0, 'Garden School');
INSERT INTO `user` VALUES (5, '王小壮', 'wxiaozhuang@sample.com', 27, 0, 'Sunny School');
INSERT INTO `user` VALUES (6, '露西', 'lucy@sample.com', 14, 1, 'Garden School');
INSERT INTO `user` VALUES (7, '李二壮', 'lerzhuang@sample.com', 9, 0, 'Sunny School');

SET FOREIGN_KEY_CHECKS = 1;

```

- 依赖
```xml
<dependency>
  <groupId>org.mybatis.spring.boot</groupId>
  <artifactId>mybatis-spring-boot-starter</artifactId>
  <version>2.1.0</version>
</dependency>


<dependency>
  <groupId>mysql</groupId>
  <artifactId>mysql-connector-java</artifactId>
  <version>8.0.26</version>
</dependency>


<dependency>
  <groupId>org.projectlombok</groupId>
  <artifactId>lombok</artifactId>
  <optional>true</optional>
</dependency>
```

- 编写Mapper
```javascript
package com.shu;

import com.shu.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.awt.print.Pageable;
import java.util.List;

/**
 * @description:
 * @author: shu
 * @createDate: 2022/12/13 19:43
 * @version: 1.0
 */
@Mapper
@Repository
public interface UserMapper {
  /**
     * 通过ID查询单条数据
     *
     * @param id 主键
     * @return 实例对象
     */
  User queryById(Integer id);
  /**
     * 分页查询指定行数据
     *
     * @param user 查询条件
     * @param pageable 分页对象
     * @return 对象列表
     */
  List<User> queryAllByLimit(User user, @Param("pageable") Pageable pageable);
  /**
     * 统计总行数
     *
     * @param user 查询条件
     * @return 总行数
     */
  long count(User user);
  /**
     * 新增数据
     *
     * @param user 实例对象
     * @return 影响行数
     */
  int insert(User user);
  /**
     * 批量新增数据
     *
     * @param entities List<User> 实例对象列表
     * @return 影响行数
     */
  int insertBatch(@Param("entities") List<User> entities);
  /**
     * 批量新增或按主键更新数据
     *
     * @param entities List<User> 实例对象列表
     * @return 影响行数
     */
  int insertOrUpdateBatch(@Param("entities") List<User> entities);
  /**
     * 更新数据
     *
     * @param user 实例对象
     * @return 影响行数
     */
  int update(User user);
  /**
     * 通过主键删除数据
     *
     * @param id 主键
     * @return 影响行数
     */
  int deleteById(Integer id);
}

```

- mapper.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.shu.UserMapper">
  <resultMap type="com.shu.model.User" id="UserMap">
    <result property="id" column="id" jdbcType="INTEGER"/>
    <result property="name" column="name" jdbcType="VARCHAR"/>
    <result property="email" column="email" jdbcType="VARCHAR"/>
    <result property="age" column="age" jdbcType="INTEGER"/>
    <result property="sex" column="sex" jdbcType="INTEGER"/>
    <result property="schoolName" column="schoolName" jdbcType="VARCHAR"/>
  </resultMap>

  <!-- 通过ID查询单条数据 -->
  <select id="queryById" resultMap="UserMap">
    select
    id,name,email,age,sex,schoolName
    from user
    where id = #{id}
  </select>

  <!--分页查询指定行数据-->
  <select id="queryAllByLimit" resultMap="UserMap">
    select
    id,name,email,age,sex,schoolName
    from user
    <where>
      <if test="id != null and id != ''">
        and id = #{id}
      </if>
      <if test="name != null and name != ''">
        and name = #{name}
      </if>
      <if test="email != null and email != ''">
        and email = #{email}
      </if>
      <if test="age != null and age != ''">
        and age = #{age}
      </if>
      <if test="sex != null and sex != ''">
        and sex = #{sex}
      </if>
      <if test="schoolname != null and schoolname != ''">
        and schoolName = #{schoolname}
      </if>
    </where>
    limit #{pageable.offset}, #{pageable.pageSize}
  </select>

  <!--统计总行数-->
  <select id="count" resultType="java.lang.Long">
    select count(1)
    from user
    <where>
      <if test="id != null and id != ''">
        and id = #{id}
      </if>
      <if test="name != null and name != ''">
        and name = #{name}
      </if>
      <if test="email != null and email != ''">
        and email = #{email}
      </if>
      <if test="age != null and age != ''">
        and age = #{age}
      </if>
      <if test="sex != null and sex != ''">
        and sex = #{sex}
      </if>
      <if test="schoolname != null and schoolname != ''">
        and schoolName = #{schoolname}
      </if>
    </where>
  </select>

  <!--新增数据-->
  <insert id="insert" keyProperty="id" useGeneratedKeys="true">
    insert into user(id,name,email,age,sex,schoolName)
    values (#{id},#{name},#{email},#{age},#{sex},#{schoolname})
  </insert>

  <!-- 批量新增数据 -->
  <insert id="insertBatch" keyProperty="id" useGeneratedKeys="true">
    insert into user(id,name,email,age,sex,schoolName)
    values
    <foreach collection="entities" item="entity" separator=",">
      (#{entity.id},#{entity.name},#{entity.email},#{entity.age},#{entity.sex},#{entity.schoolname})
      </foreach>
      </insert>

      <!-- 批量新增或按主键更新数据 -->
      <insert id="insertOrUpdateBatch" keyProperty="id" useGeneratedKeys="true">
      insert into user(id,name,email,age,sex,schoolName)
      values
      <foreach collection="entities" item="entity" separator=",">
      (#{entity.id},#{entity.name},#{entity.email},#{entity.age},#{entity.sex},#{entity.schoolname})
      </foreach>
      on duplicate key update
      id=values(id),
      name=values(name),
      email=values(email),
      age=values(age),
      sex=values(sex),
      schoolName=values(schoolName)
      </insert>

      <!-- 更新数据 -->
      <update id="update">
      update user
      <set>
      <if test="id != null and id != ''">
      id = #{id},
      </if>
      <if test="name != null and name != ''">
      name = #{name},
      </if>
      <if test="email != null and email != ''">
      email = #{email},
      </if>
      <if test="age != null and age != ''">
      age = #{age},
      </if>
      <if test="sex != null and sex != ''">
      sex = #{sex},
      </if>
      <if test="schoolname != null and schoolname != ''">
      schoolName = #{schoolname},
      </if>
      </set>
      where id = #{id}
      </update>

      <!--通过主键删除-->
      <delete id="deleteById">
      delete from user where id = #{id}
      </delete>
      </mapper>
```

- 配置文件
```yaml
spring:
# mysql配置
datasource:
username: root
password: 123456
# 如果时区报错就需要添加 serverTimezone=UTC
url: jdbc:mysql://127.0.0.1:3306/mybatis?useUnicode=true&characterEncoding=utf-8&serverTimezone=UTC&useSSL=false
driver-class-name: com.mysql.cj.jdbc.Driver


#mybatis的相关配置
mybatis:
#mapper配置文件
mapper-locations: classpath:mapper/*.xml
#指定包的别名
type-aliases-package: com.mapper
#开启驼峰命名
configuration:
map-underscore-to-camel-case: true


#日志打印
logging:
level:
com:
shu:
mapper: debug
```

- 测试用例
```javascript
package com.shu;


import com.shu.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;



@SpringBootTest
class MybatisDemo01ApplicationTests {

  @Autowired
  UserMapper userMapper;

  @Test
  void contextLoads() {

  }

  @Test
  public void UserTest(){
    User user = userMapper.queryById(1);
    System.out.println(user);
  }

}

```

- 结果

![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1671003353898-da08ce53-8e3b-4465-9e42-b68a1646b48b.png#averageHue=%23312e2d&clientId=uac1cd4f9-179d-4&from=paste&height=414&id=ue8e9a6b3&originHeight=517&originWidth=1741&originalType=binary&ratio=1&rotation=0&showTitle=false&size=100160&status=done&style=none&taskId=ud3a8d741-d970-4645-8485-33d17d418b0&title=&width=1392.8)
到这我们一个基本的环就搭建完毕了，记住我们在使用中配置了那些东西，等下我们看源码回来看，就会恍然大悟

