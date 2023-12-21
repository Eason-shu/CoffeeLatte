---
title: Mybatis源码分析（二）Mybatis-config.xml的初始化
sidebar_position: 4
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

![_2180074.JPG](https://cdn.nlark.com/yuque/0/2023/jpeg/12426173/1676958131337-77b7ba86-d6e6-4e43-8b92-2ccdf8fca1cc.jpeg#averageHue=%23466484&clientId=ud22a8967-cb0b-4&from=ui&id=uc6a750d5&originHeight=3888&originWidth=5184&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=13333364&status=done&style=shadow&taskId=u70ac7a38-6a0d-4b63-b21e-6a8c9a5a45d&title=)
📷📷📷（**重庆）涂鸦一条街**


---

> 学习的知识？

:::info

1. Java 类的加载机制，以及ClassLoader的加载过程
2. VFS（Virtual File System）工具类，屏蔽底层磁盘系统差异
3. ResolverUtil工具类，完成对类的筛选
4. 配置文件的初始化，文件的寻找以及转换成输入流的过程
:::

---

# 一 环境搭建

- 依赖
```javascript
      <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.26</version>
        </dependency>
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
            <version>3.5.9</version>
        </dependency>

```

- 编写Mapper
```javascript
package com.shu;

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
    List<User> queryAllByLimit(User user);
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

- 编写mapper.xml
```javascript
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.shu.UserMapper">
    <resultMap type="com.shu.User" id="UserMap">
        <result property="id" column="id" jdbcType="INTEGER"/>
        <result property="name" column="name" jdbcType="VARCHAR"/>
        <result property="email" column="email" jdbcType="VARCHAR"/>
        <result property="age" column="age" jdbcType="INTEGER"/>
        <result property="sex" column="sex" jdbcType="INTEGER"/>
        <result property="schoolname" column="schoolName" jdbcType="VARCHAR"/>
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

- 编写Mybatis-conf.xml
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
"http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
  <!-- 别名-->
  <!-- 环境   -->
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
  <mappers>
    <mapper resource="mapper/UserMapper.xml"/>
  </mappers>

</configuration>
```

- 编写测试用例
```javascript
package com.shu;

import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@SpringBootTest
class MybatisDemo02ApplicationTests {

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

}

```
到这我们的代码编写完毕，下一步我们来分析其执行过程
# 二 配置文件初始化
分析：
:::info

1. 我们配置的文件是如何配置到Mybatis的？
2. 程序是如何拿到我们的配置文件的？
3. 拿到配置文件，我们是如何转换成程序的配置文件？
:::
过程：流程图
![Mybatis-config.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673403026975-0bb85071-0089-42c2-bb49-0cc78bb3b6a1.png#averageHue=%23fcfbfb&clientId=ufa7d8d48-8808-4&from=paste&height=317&id=u8d5c7a10&originHeight=396&originWidth=2822&originalType=binary&ratio=1&rotation=0&showTitle=false&size=62147&status=done&style=none&taskId=u08b750ed-5f7a-4040-9511-6d517c5ff33&title=&width=2257.6)
上面我们写了mybatis-config.xml文件，在代码开头我们可以看见进行配置文件的初始化
下面我们来分析一下他说如何拿到mybatis-config.xml这个文件的，在分析之前我们需要里了解一下ClassLoader。
```javascript
  	 // 第一阶段：MyBatis的初始化阶段
        String resource = "mybatis-config.xml";
        // 得到配置文件的输入流
        InputStream inputStream = null;
        try {
            inputStream = Resources.getResourceAsStream(resource);
        } catch (IOException e) {
            e.printStackTrace();
        }
```
## 2.1 ClassLoader

- 我们从字面上理解就是类加载器，下面但是Jvm的类加载过程，类的加载就是 Java虚拟机将描述类的数据从 Class文件加载到 JVM的过程，在这一过程中会对 Class文件进行数据加载、连接和初始化，最终形成可以被虚拟机直接使用的 Java类。

![](https://cdn.nlark.com/yuque/0/2022/jpeg/12426173/1671005998027-10a0fc6b-ef86-44a6-af3a-8f402b4c571f.jpeg)

- 当然JVM 在一开始就可能把所有的类都加载，那么可能撑死，按需加载才是王道
### 2.1.1 Java 类加载器
![](https://cdn.nlark.com/yuque/0/2023/jpeg/12426173/1673400741601-95330237-5d66-4bdd-9044-d6f46a460eec.jpeg)
1，引导类加载器 （**BootstrapClassLoader**）
负责加载系统类（通常从JAR的rt.jar中进行加载），它是虚拟机不可分割的一部分，通常使用C语言实现，引导类加载器没有对应的ClassLoader对象
2，扩展类加载器 （**ExtClassLoader**）
扩展类加载器用于从jre/lib/txt目标加载“标准的扩展”。可以将jar文件放入该目录，这样即使没有任何类路径，扩展类加载器也可以找到其中的各个类
3，系统类加载器 （**AppClassLoader**）
系统类加载器用于加载应用类，它在由ClASSPATH环境变量或者-classpath命令行选项设置的类路径的目录或者是jar/ZIP文件里查找这些类

我们可以做个小测试，测试代码如下：
```javascript
    /**
     * 类加载机制
     */
    @Test
    public void ResourcesTest(){
        // 应用程序类加载器（Application ClassLoader）：用于加载用户类路径（Classpath）上的类，是Java应用程序的类加载器。
        ClassLoader systemClassLoader = ClassLoader.getSystemClassLoader();
        System.out.println("应用程序类加载器:"+systemClassLoader.toString());
        // 扩展类加载器（Extension ClassLoader）：用于加载Java的扩展类库，默认加载JAVA_HOME/jre/lib/ext目录下的类。
        ClassLoader parent = systemClassLoader.getParent();
        System.out.println("扩展类加载器:"+parent.toString());
        // 启动类加载器（Bootstrap ClassLoader）：用于加载Java运行时环境所需要的类，它加载的类是由C++编写的，并由虚拟机自身启动。
//        ClassLoader parentParent = parent.getParent();
//        System.out.println("启动类加载器:"+parentParent.toString());
    }

```
注意：Bootstrap ClassLoader会报错，因为Bootstrap ClassLoader是虚拟机的一部分，由C++进行编写
> 加载顺序

1. **BootstrapClassLoader**
2. **ExtClassLoader**
3. **AppClassLoader**
- 关于classLoader的详细信息请参考文章：[一看你就懂，超详细java中的ClassLoader详解](https://blog.csdn.net/briblue/article/details/54973413) 博主讲得通俗易懂
- 关于JVM的的知识，推荐一本书《深入理解Java虚拟机：JVM高级特性与最佳实践（第3版）》 周志明，我后期也会整理相关知识，敬请期待

## 2.2 获取配置文件
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
```

- 我们可以看到调用了Resources#getResourceAsStream(resource)去获取配置文件的信息，调用重载getResourceAsStream（）方法，进入Resources这个类中进行方法的调用。

**Resources**
```java
  public static InputStream getResourceAsStream(ClassLoader loader, String resource) throws IOException {
    // 去加载我们写的mybatis-config.xml 文件
    InputStream in = classLoaderWrapper.getResourceAsStream(resource, loader);
	// 没有找到，资源不存在
    if (in == null) {
      throw new IOException("Could not find resource " + resource);
    }
    return in;
  }
```
通过断点调试，我们发现Resources通过ClassLoaderWrapper来寻找文件
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1676033079841-b3d268fd-743a-4600-b2f8-eae3d846dbe5.png#averageHue=%23527b4f&clientId=u908dff5a-eec5-4&from=paste&height=443&id=qCcMd&originHeight=554&originWidth=1919&originalType=binary&ratio=1&rotation=0&showTitle=false&size=129140&status=done&style=none&taskId=ub940e651-451c-4f32-a4dc-e77b2475823&title=&width=1535.2)

- 到这我们可以看到他调用了classLoaderWrapper的方法，我们来看看这个类是啥？
- ClassLoaderWrapper 类中封装了五种类加载器，而 Resources 类又对 ClassLoaderWrapper 类进行了一些封装。
- Resources中ClassLoaderWrapper的初始化
```java
private static ClassLoaderWrapper classLoaderWrapper = new ClassLoaderWrapper();
```

**ClassLoaderWrapper**
```java
public class ClassLoaderWrapper {

  ClassLoader defaultClassLoader;

  ClassLoader systemClassLoader;

  ClassLoaderWrapper() {
    try {
   	 // AppClassLoader  获取系统类加载器
      systemClassLoader = ClassLoader.getSystemClassLoader();
    } catch (SecurityException ignored) {
      // AccessControlException on Google App Engine
    }
  }

```

- 我们可以看到在ClassLoaderWrapper的构造器中，对systemClassLoader进行初始化，而ClassLoader.getSystemClassLoader()的结果就是我们上文介绍的AppClassLoader

下面一个小案例，来证实我们的猜想？
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1671019801051-90e07586-4aea-4112-b614-ae1d6f5f7b5d.png#averageHue=%23a28b68&clientId=uefcf1607-a942-4&from=paste&height=498&id=ub7b376b2&originHeight=623&originWidth=1896&originalType=binary&ratio=1&rotation=0&showTitle=false&size=125587&status=done&style=none&taskId=u58b354b0-0ea0-4686-9507-5b0ab0ab480&title=&width=1516.8)
到这我们需要注意一下getClassLoaders(classLoader))方法，打个断点，调试一手
**ClassLoaderWrapper**
```java

public InputStream getResourceAsStream(String resource, ClassLoader classLoader) {
    return getResourceAsStream(resource, getClassLoaders(classLoader));
  }
```
:::info
这里传入5个类加载器：

1. 自己定义的加载器
2. 默认的类加载器
3. 当前线程的类加载器
4. 本类的类加载器
5. 系统类加载器
:::
```java

/**
 * 获取多个ClassLoader，这一步是必须的，因为，我们就是从这个加载器中获取资源的流的
 *五种类加载器：自己传入的、默认的类加载器、当前线程的类加载器、本类的类加载器、系统类加载器
 * @param classLoader 我们定义的自己的类加载器
 * @return 类加载器的数组
 */
ClassLoader[] getClassLoaders(ClassLoader classLoader) {
    return new ClassLoader[]{
            classLoader,
            defaultClassLoader,
            Thread.currentThread().getContextClassLoader(),
            getClass().getClassLoader(),
            systemClassLoader};
}

```

- 这五种类加载器依次是：· 作为参数传入的类加载器，可能为 null；· 系统默认的类加载器，如未设置则为 null；· 当前线程的线程上下文中的类加载器；· 当前对象的类加载器；· 系统类加载器，在 ClassLoaderWrapper的构造方法中设置。以上五种类加载器的优先级由高到低。在读取类文件时，依次到上述五种类加载器中进行寻找，只要某一次寻找成功即返回结果。

![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1671020179436-8320acba-9656-479c-a0e1-2ac0f3fc6d43.png#averageHue=%234e5651&clientId=uefcf1607-a942-4&from=paste&height=610&id=u5d38b1a7&originHeight=762&originWidth=1910&originalType=binary&ratio=1&rotation=0&showTitle=false&size=220108&status=done&style=none&taskId=u4cae406f-188d-40c5-b26c-d7ce647c753&title=&width=1528)

- 用一组 ClassLoader去找到我们写的mybatis-conf.xml文件，一般情况下，类加载器会将名称转换为文件名，然后从文件系统中读取该名称的类文件，因此，类加载器具有读取外部资源的能力，这里要借助的正是类加载器的这种能力。
```java
/**
 * 从一个ClassLoader中获取资源的流，这就是我们的目的
 *
 * @param resource    资源的地址
 * @param classLoader 类加载器
 * @return 流
 */
InputStream getResourceAsStream(String resource, ClassLoader[] classLoader) {
    for (ClassLoader cl : classLoader) {
        if (null != cl) {

            // try to find the resource as passed
            InputStream returnValue = cl.getResourceAsStream(resource);

            // now, some class loaders want this leading "/", so we'll add it and try again if we didn't find the resource
            if (null == returnValue) {
                returnValue = cl.getResourceAsStream("/" + resource);
            }

            if (null != returnValue) {
                return returnValue;
            }
        }
    }
    return null;
}
```

- getResourceAsStream 方法会依次调用传入的每一个类加载器的getResourceAsStream方法来尝试获取配置文件的输入流

**ClassLoader**
```java
    public InputStream getResourceAsStream(String name) {
        // 找到文件
        URL url = getResource(name);
        try {
            if (url == null) {
                return null;
            }

            URLConnection urlc = url.openConnection();
            InputStream is = urlc.getInputStream();
            if (urlc instanceof JarURLConnection) {
                JarURLConnection juc = (JarURLConnection)urlc;
                JarFile jar = juc.getJarFile();
                synchronized (closeables) {
                    if (!closeables.containsKey(jar)) {
                        closeables.put(jar, null);
                    }
                }
            } else if (urlc instanceof sun.net.www.protocol.file.FileURLConnection) {
                synchronized (closeables) {
                    closeables.put(is, null);
                }
            }
            return is;
        } catch (IOException e) {
            return null;
        }
    }
```

- 我们来看看getResource方法吧，相信你刚才看了文章，接下来看你理解没有刚才的知识，这里需要了解一下Java虚拟机的双亲委派机制：简单来说就是先委派自己的父类来加载文件，如果父类没有，尝试子类自己加载文件。
```java
    public URL getResource(String name) {
        URL url;
        // 父类加载器能够找到该文件，由前面我们知道AppClassLoader的父类加载器是ExtClassLoader
        if (parent != null) {
            url = parent.getResource(name);
        } else {
            // 通过双亲委派机制找到文件
            url = getBootstrapResource(name);
        }
    	// 没有的话
        if (url == null) {
            url = findResource(name);
        }
        return url;
    }
```

- 由前面我们知道AppClassLoader的父类加载器是ExtClassLoader

![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1671022263093-8047c288-0fb6-416e-830a-4a11ef7982c9.png#averageHue=%234d6150&clientId=uefcf1607-a942-4&from=paste&height=588&id=u9afd78b6&originHeight=735&originWidth=1873&originalType=binary&ratio=1&rotation=0&showTitle=false&size=182130&status=done&style=none&taskId=u32ce8624-5da5-43f2-aee7-73a88806aa0&title=&width=1498.4)

- ExtClassLoader的父类加载器为空，所以通过双亲委派机制去寻找该文件，相信我，后面你还会遇到的。

![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1671022011460-872671ac-f7e0-45b1-bfc2-17573c39498f.png#averageHue=%234d6050&clientId=uefcf1607-a942-4&from=paste&height=753&id=u037beec9&originHeight=941&originWidth=1854&originalType=binary&ratio=1&rotation=0&showTitle=false&size=224158&status=done&style=none&taskId=u0015aa64-a229-4919-9471-efad454d95d&title=&width=1483.2)

- 当前类加载器(一般是appclassloader)会让父类去加载,父类找不到再通过子类自身findResource(name)方法来找资源

**URLClassLoader**
```java
 public URL findResource(final String name) {
        /*
         * The same restriction to finding classes applies to resources
         */
        URL url = AccessController.doPrivileged(
            new PrivilegedAction<URL>() {
                public URL run() {
                    return ucp.findResource(name, true);
                }
            }, acc);

        return url != null ? ucp.checkURL(url) : null;
    }
```

- URLClassLoader这个类加载器用于从引用JAR文件和目录的url的搜索路径加载类和资源。任何以“/”结尾的URL都被认为指向目录。否则，URL被假定为引用一个JAR文件，该文件将在需要时打开。 创建URLClassLoader实例的线程的AccessControlContext将在随后加载类和资源时使用，默认情况下，被加载的类只被授予访问创建URLClassLoader时指定的url的权限。
- [Java ClassLoader findResource() method with example](https://www.includehelp.com/java/classloader-findresource-method-with-example.aspx)
- AccessController.doPrivileged方法是一个native方法，无法通过IDE进去调试

**URLClassPath**
```java



public URL findResource(String var1, boolean var2) {
         // 先去缓存查询一下
        int[] var4 = this.getLookupCache(var1);
        Loader var3;
         // 这里有点不懂，有大神可以讲解？
        for(int var5 = 0; (var3 = this.getNextLoader(var4, var5)) != null; ++var5) {
            URL var6 = var3.findResource(var1, var2);
            if (var6 != null) {
                return var6;
            }
        }

        return null;
    }
```

- 找到了文件的URL路径，返回

![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1671022670055-4ef34b71-5643-494d-b20e-1f222dd7e98f.png#averageHue=%23536a50&clientId=uefcf1607-a942-4&from=paste&height=593&id=u4ad2bced&originHeight=741&originWidth=1861&originalType=binary&ratio=1&rotation=0&showTitle=false&size=208244&status=done&style=none&taskId=u8b79778b-f8c9-4687-8258-17d06f90330&title=&width=1488.8)

- 获取到了URL连接
```java
    public InputStream getResourceAsStream(String name) {
        // 找到文件
        URL url = getResource(name);
        try {
            if (url == null) {
                return null;
            }
            // 打开连接
            URLConnection urlc = url.openConnection();
            // 获取流数据
            InputStream is = urlc.getInputStream();
            // jar包连接
            if (urlc instanceof JarURLConnection) {
                JarURLConnection juc = (JarURLConnection)urlc;
                JarFile jar = juc.getJarFile();
                synchronized (closeables) {
                    if (!closeables.containsKey(jar)) {
                        closeables.put(jar, null);
                    }
                }
            }
            // 文件连接
            else if (urlc instanceof sun.net.www.protocol.file.FileURLConnection) {
                synchronized (closeables) {
                    closeables.put(is, null);
                }
            }
            return is;
        } catch (IOException e) {
            return null;
        }
    }
```
到这我们文件的解析就完毕了，到这我们就拿到了文件流数据，下篇文章我们来解释SqlSessionFactory的初始化。
总结：
> 1. Resources#getResourceAsStream（）通过名称寻找资源文件
> 2. Resources交给ClassLoaderWrapper去寻找资源文件
> 3. ClassLoaderWrapper初始化了5个类加载器，依次用类加载器去寻找资源文件
> 4. 到了类加载器，通过委派父类加载器去选择资源文件
> 5. URLClassLoader找到了资源文件的URL转换成输入流返回给调用者
> 6. 如果类加载器没有找到的话，需要调用自身URLClassPath类的方法通过名称来寻找资源文件
> 7. URLClassPath根据URL的协议类型创建不同的Loader来解析不同的资源类型返回调用者

# 三 扩展
说到输入/输出，首先想到的就是对磁盘文件的读写。在 MyBatis的工作中，与磁盘文件的交互主要是对 xml配置文件的读操作，因此，Mybatis的io包中提供对磁盘文件读操作的支持。
## 3.1 VFS
磁盘文件系统分为很多种，如 FAT、VFAT、NFS、NTFS等。不同文件系统的读写操作各不相同。VFS（Virtual File System）作为一个虚拟的文件系统将各个磁盘文件系统的差异屏蔽了起来，提供了统一的操作接口。这使得上层的软件能够用单一的方式来跟底层不同的文件系统沟通。
![](https://cdn.nlark.com/yuque/0/2023/jpeg/12426173/1673403696442-6f2f6f20-d5f8-4fc5-ac27-d368db394f2f.jpeg)

- MyBatis的 io包中 VFS的作用是从应用服务器中找寻和读取资源文件，这些资源文件可能是配置文件、类文件等。首先我们来看看VFS的抽象类信息？
```java
 private static final Log log = LogFactory.getLog(VFS.class);

    public static final Class<?>[] IMPLEMENTATIONS = { JBoss6VFS.class, DefaultVFS.class };

    public static final List<Class<? extends VFS>> USER_IMPLEMENTATIONS = new ArrayList<>();



    private static class VFSHolder {
        // 最终指定的实现类
        static final VFS INSTANCE = createVFS();

        /**
         * 给出一个VFS实现。单例模式
         * @return VFS实现
         */
        static VFS createVFS() {
            // 所有VFS实现类的列表。
            List<Class<? extends VFS>> impls = new ArrayList<>();
            // 列表中先加入用户自定义的实现类。因此，用户自定义的实现类优先级高
            impls.addAll(USER_IMPLEMENTATIONS);
            impls.addAll(Arrays.asList((Class<? extends VFS>[]) IMPLEMENTATIONS));

            VFS vfs = null;
            // 依次生成实例，找出第一个可用的
            for (int i = 0; vfs == null || !vfs.isValid(); i++) {
                Class<? extends VFS> impl = impls.get(i);
                try {
                    // 生成一个实现类的对象
                    vfs = impl.newInstance();
                    // 判断对象是否生成成功并可用
                    if (vfs == null || !vfs.isValid()) {
                        if (log.isDebugEnabled()) {
                            log.debug("VFS implementation " + impl.getName() +
                                    " is not valid in this environment.");
                        }
                    }
                } catch (InstantiationException | IllegalAccessException e) {
                    log.error("Failed to instantiate " + impl, e);
                    return null;
                }
            }

            if (log.isDebugEnabled()) {
                log.debug("Using VFS adapter " + vfs.getClass().getName());
            }

            return vfs;
        }
    }
```
在 VFSHolder类的 createVFS方法中，先组建一个 VFS实现类的列表，然后依次对列表中的实现类进行校验。第一个通过校验的实现类即被选中，在组建列表时，用户自定义的实现类放在了列表的前部，这保证了用户自定义的实现类具有更高的优先级。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673403931892-740cfdca-9e34-4775-8dd9-c0d830703cf7.png#averageHue=%232c2c2c&clientId=ufa7d8d48-8808-4&from=paste&height=445&id=u9a1ee228&originHeight=556&originWidth=1347&originalType=binary&ratio=1&rotation=0&showTitle=false&size=29541&status=done&style=none&taskId=u97d1e3ab-b6e2-4e93-8188-ecabfbfd97f&title=&width=1077.6)
### 3.1.1 DefaultVFS
DefaultVFS 作为默认的 VFS 实现类，其 isValid 函数恒返回 true。因此，只要加载DefaultVFS类，它一定能通过 VFS类中 VFSHolder单例中的校验，并且在进行实现类的校验时 DefaultVFS排在整个校验列表的最后，因此，DefaultVFS成了所有 VFS实现类的保底方案，即最后一个验证，但只要验证一定能通过。
方法：
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1673404003382-94fc05fd-482c-4b84-97a0-3605a281f60b.png#averageHue=%23927d4e&clientId=ufa7d8d48-8808-4&from=paste&height=575&id=uf560e8ba&originHeight=719&originWidth=1882&originalType=binary&ratio=1&rotation=0&showTitle=false&size=186284&status=done&style=none&taskId=u3890d86b-a96b-423c-a585-de0ec6631bc&title=&width=1505.6)

1. list（URL，String）：列出指定 url下符合条件的资源名称。
2. listResources（JarInputStream，String）：列出给定 jar包中符合条件的资源名称。
3. findJarForResource（URL）：找出指定路径上的 jar包，返回 jar包的准确路径。
4. getPackagePath（String）：将 jar包名称转为路径。
5. isJar：判断指定路径上是否是 jar包。
### 3.1.2 JBoss6VFS

- JBoss是一个基于 J2EE的开放源代码的应用服务器，JBoss6是 JBoss中的一个版本。JBoss6VFS即为借鉴 JBoss6设计的一套 VFS实现类。
- 在 JBoss6VFS中主要存在两个内部类。· VirtualFile：仿照 JBoss中的 VirtualFile类设计的一个功能子集；· VFS：仿照 JBoss中的 VFS类设计的一个功能子集。阅读 VirtualFile和 VFS中的方法便可以发现，这些方法中都没有实现具体的操作，而是调用 JBoss中的相关方法。
- 在 JBoss6VFS类中，两个内部类 VirtualFile和 VFS都是代理类，只负责完成将相关操作转给被代理类的工作。那么，要想使 JBoss6VFS类正常工作，必须确保被代理类存在。
```java
          /**
         * 获取相关的路径名
         * @param parent 父级路径名
         * @return 相关路径名
         */
        String getPathNameRelativeTo(VirtualFile parent) {
            try {
                return invoke(getPathNameRelativeTo, virtualFile, parent.virtualFile);
            } catch (IOException e) {
                // This exception is not thrown by the called method
                log.error("This should not be possible. VirtualFile.getPathNameRelativeTo() threw IOException.");
                return null;
        }


		static VirtualFile getChild(URL url) throws IOException {
            Object o = invoke(getChild, VFS, url);
            return o == null ? null : new VirtualFile(o);
        }




```
这里使用代理模式来 VirtualFile内部类是 JBoss中 VirtualFile的静态代理类，同样VFS也是JBoss的静态代理类，他是如何确定来保证代理类的呀？
```java
  /** Find all the classes and methods that are required to access the JBoss 6 VFS. */
    /**
     * 初始化JBoss6VFS类。主要是根据被代理类是否存在来判断自身是否可用
     */
    protected static synchronized void initialize() {
        if (valid == null) {
            // 首先假设是可用的
            valid = Boolean.TRUE;

            // 校验所需要的类是否存在。如果不存在，则valid设置为false
            VFS.VFS = checkNotNull(getClass("org.jboss.vfs.VFS"));
            VirtualFile.VirtualFile = checkNotNull(getClass("org.jboss.vfs.VirtualFile"));

            // 校验所需要的方法是否存在。如果不存在，则valid设置为false
            VFS.getChild = checkNotNull(getMethod(VFS.VFS, "getChild", URL.class));
            VirtualFile.getChildrenRecursively = checkNotNull(getMethod(VirtualFile.VirtualFile,
                    "getChildrenRecursively"));
            VirtualFile.getPathNameRelativeTo = checkNotNull(getMethod(VirtualFile.VirtualFile,
                    "getPathNameRelativeTo", VirtualFile.VirtualFile));

            // 判断以上所需方法的返回值是否和预期一致。如果不一致，则valid设置为false
            checkReturnType(VFS.getChild, VirtualFile.VirtualFile);
            checkReturnType(VirtualFile.getChildrenRecursively, List.class);
            checkReturnType(VirtualFile.getPathNameRelativeTo, String.class);
        }
    }
```
在初始化方法中，会尝试从 JBoss 的包中加载和校验所需要的类和方法，最后，还通过返回值对加载的方法进行了进一步的校验，而在以上的各个过程中，只要发现加载的类、方法不存在或者返回值发生了变化，则认为 JBoss 中的类不可用，在这种情况下，checkNotNull方法和 checkReturnType方法中会调用 setInvalid 方法将 JBoss6VFS的 valid字段设置为 false，表示 JBoss6VFS类不可用。
## 3.2 ResolverUtil工具类
ResolverUtil是一个工具类，主要功能是完成类的筛选，这些筛选条件可以是：·类是否是某个接口或类的子类；类是否具有某个注解。
```java
    /**
     * 筛选出指定路径下符合一定条件的类
     * @param test 测试条件
     * @param packageName 路径
     * @return ResolverUtil本身
     */
    public ResolverUtil<T> find(Test test, String packageName) {
        // 获取起始包路径
        String path = getPackagePath(packageName);
        try {
            // 找出包中的各个文件
            List<String> children = VFS.getInstance().list(path);
            for (String child : children) {
                // 对类文件进行测试
                if (child.endsWith(".class")) { // 必须是类文件
                    // 测试是否满足测试条件。如果满足，则将该类文件记录下来
                    addIfMatching(test, child);
                }
            }
        } catch (IOException ioe) {
            log.error("Could not read package: " + packageName, ioe);
        }
        return this;
    }



/**
     * 判断一个类文件是否满足条件。如果满足则记录下来
     * @param test 测试条件
     * @param fqn 类文件全名
     */
    @SuppressWarnings("unchecked")
    protected void addIfMatching(Test test, String fqn) {
        try {
            // 转化为外部名称
            String externalName = fqn.substring(0, fqn.indexOf('.')).replace('/', '.');
            // 类加载器
            ClassLoader loader = getClassLoader();
            if (log.isDebugEnabled()) {
                log.debug("Checking to see if class " + externalName + " matches criteria [" + test + "]");
            }
            // 加载类文件
            Class<?> type = loader.loadClass(externalName);
            if (test.matches(type)) { // 执行测试
                // 测试通过则记录到matches属性中
                matches.add((Class<T>) type);
            }
        } catch (Throwable t) {
            log.warn("Could not examine class '" + fqn + "'" + " due to a " +
                    t.getClass().getName() + " with message: " + t.getMessage());
        }
    }
```
## 3.3 资源的定义与区别
URL、InputStream、Reader、File都是Java中用于处理文件或数据流的类，但它们之间有一些区别？

- URL（Uniform Resource Locator）：用于表示互联网上的资源位置，是一个字符串，可以指向本地或远程文件、Web页面或其他资源。可以通过URL对象打开连接并读取数据。
```java
URL url = new URL("http://example.com/file.txt");
URLConnection connection = url.openConnection();
InputStream inputStream = connection.getInputStream();
BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
String line = null;
while ((line = reader.readLine()) != null) {
   System.out.println(line);
}
```

- InputStream：是一个字节流，用于读取字节数据。可以从文件、网络、内存中读取数据。通常用于读取二进制文件和网络传输数据。
```java
FileInputStream inputStream = new FileInputStream("file.txt");
int data;
while ((data = inputStream.read()) != -1) {
   System.out.print((char) data);
}
```

- Reader：是一个字符流，用于读取字符数据。可以从文件、网络、内存中读取数据。通常用于读取文本文件和网络传输文本数据。

```java
FileReader reader = new FileReader("file.txt");
BufferedReader bufferedReader = new BufferedReader(reader);
String line = null;
while ((line = bufferedReader.readLine()) != null) {
   System.out.println(line);
}
```

- File：代表本地文件系统中的文件或目录，可以读取、写入、删除文件等操作。
```java
File file = new File("file.txt");
if (file.exists()) {
   BufferedReader reader = new BufferedReader(new FileReader(file));
   String line = null;
   while ((line = reader.readLine()) != null) {
      System.out.println(line);
   }
}
```

- 总的来说，URL用于定位互联网上的资源，InputStream和Reader用于读取数据，File用于操作本地文件系统中的文件或目录。同时，InputStream和Reader是抽象类，需要通过具体的子类实现。
