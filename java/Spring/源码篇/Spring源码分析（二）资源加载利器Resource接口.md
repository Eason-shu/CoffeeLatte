---

title: Spring源码分析-资源的定义
sidebar_position: 2
keywords:
  - Spring
  - 源码分析
tags:
  - Spring
  - 源码分析
  - Java
  - 框架
  - IOC
  - AOP
  - 学习笔记
  - 设计模式
last_update:
  date: 2023-8-09 23:00:00
  author: EasonShu

---


![微信图片_20230403162032.jpg](https://cdn.nlark.com/yuque/0/2023/jpeg/12426173/1680510066307-8fbb67ff-4ee2-40af-8c21-a68c7d38a432.jpeg#averageHue=%23101d1b&clientId=ubcf2228e-e451-4&from=ui&id=ub02577ec&originHeight=1707&originWidth=1280&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=61442&status=done&style=none&taskId=u6badc045-2943-4e22-a332-456b2c9f3b5&title=)
本图：川西旅游中拍摄的（业余摄影）
官网：[Home](https://spring.io/)
参考书籍：[Spring源码深度解析-郝佳编著-微信读书](https://weread.qq.com/web/bookDetail/0e232b205b260a0e29f3fb5)
上一篇文章我们对Spring的基本架构有了基本的了解，以及完成了源码分析的基本环境的搭建，接下来我们开始源码分析，以案例来驱动来学习源码的知识
参考文章：[spring5 源码深度解析----- IOC 之 容器的基本实现 ](https://www.cnblogs.com/java-chen-hao/p/11113340.html)
参考官网：[Resources :: Spring Framework](https://docs.spring.io/spring-framework/reference/core/resources.html)
:::info
1：本文章主要介绍一下Spring中对资源的定义，回想我们看Mybatis的源码分析是，一切的开始都是对资源的解析，加载，封装开始的，可以说这就是程序运行的地基，万丈高楼从地起，我们要熟悉这个思想
2：其实在官方文档中对资源的定义进行了详细的解释：[https://springdoc.cn/spring/core.html#resources](https://springdoc.cn/spring/core.html#resources)
:::
# 一 准备工作
## 1.1 基本案例搭建
🔷先建测试包，我们就在源码项目中进行自己的测试用例的编写
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680510519321-313d35e3-b894-4924-a638-37d895f9498f.png#averageHue=%23665d4b&clientId=u486d7751-1675-4&from=paste&height=734&id=ufd0cdcca&originHeight=918&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=120692&status=done&style=none&taskId=u02bb524b-d8dd-4e6c-98fa-7554fb6ec18&title=&width=1536)
🔷新建Spring-config.xm配置文件
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">



</beans>
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680510608030-bda04bed-b860-41b0-ae47-34240d438a08.png#averageHue=%23695d4c&clientId=u486d7751-1675-4&from=paste&height=483&id=ud1d0c238&originHeight=604&originWidth=1886&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=49649&status=done&style=none&taskId=u3d9fb3d4-30d4-4b11-9868-6fe34e7d46f&title=&width=1508.8)
🔷编写一个Bean，并配置Bean，测试是否可以管理我们的Bean对象
```java
package org.springframework.shu;

/**
* @description: 测试Bean
* @author: shu
* @createDate: 2023/4/3 14:54
* @version: 1.0
*/
public class MyTestBean {
    private String name = "EasonShu";

    public MyTestBean(){
        System.out.println("创建对象");
    }

    public void setName(String name) {
        System.out.println("调用方法");
        this.name = name;
    }

    public void sayHello(){
        System.out.println("Hello!" + name);
    }


    public String getName() {
        return this.name;
    }

}

```
🔷配置我们的Bean
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

  <!--配置bean
  id属性：给当前bean起一个名称，该名称必须保证是唯一的
  class属性：设置bean的全类名-->
  <bean id="myTestBean" class="org.springframework.shu.MyTestBean">
    <!--给属性赋值
    name属性：设置bean属性名
    value属性：设置bean属性值-->
    <property name="name" value="LSTAR"></property>
  </bean>

</beans>
```
🔷测试
```java
package org.springframework.shu;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.xml.XmlBeanFactory;
import org.springframework.core.io.ClassPathResource;

/**
* @description: 测试Bean
* @author: shu
* @createDate: 2023/4/3 14:56
* @version: 1.0
*/
public class AppTest {
    @Test
    public void MyTestBeanTest() {
        BeanFactory bf = new XmlBeanFactory( new ClassPathResource("spring-config.xml"));
        MyTestBean myTestBean = (MyTestBean) bf.getBean("myTestBean");
        System.out.println(myTestBean.getName());
    }
}

```
🔷测试结果
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680510980780-986ebc9c-2a6f-4a79-be0d-207ddf57c862.png#averageHue=%23b2a182&clientId=u486d7751-1675-4&from=paste&height=400&id=u2d45662f&originHeight=500&originWidth=1879&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=144619&status=done&style=none&taskId=u24063a2c-60cc-483e-b326-ff732fa707d&title=&width=1503.2)
# 二 Resource接口
> Java的标准 java.net.URL 类和各种URL前缀的标准处理程序，不幸的是，还不足以满足对低级资源的所有访问。
> 例如，没有标准化的 URL 实现可用于访问需要从classpath或相对于 ServletContext 获得的资源。
> 总结来说就是Java自带的资源库满足不了Spring的要求，而Spring自己封装了对Resource接口

## 2.1 资源的定义

资源粗略的可以分为（这里以Spring的分类为例）

1. URL资源
2. File资源
3. ClassPath相关资源
4. 服务器相关资源（JBoss AS 5.x上的VFS资源）
5. ......

JDK操纵底层资源基本就是java.net.URL 、java.io.File 、java.util.Properties这些：取资源基本是根据绝对路径或当前类的相对路径来取。从类路径或Web容器上下文中获取资源的时候也不方便。**若直接使用这些方法，需要编写比较多的额外代码，例如前期文件存在判断、相对路径变绝对路径，**而Spring提供的Resource接口提供了更强大的访问底层资源的能力，首先我们来看看Jdk方法
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1691547659258-a2993af7-d863-4fb5-9766-780eba792b43.png#averageHue=%23f9f9f8&clientId=ue66b5608-c601-4&from=paste&height=578&id=ua1647804&originHeight=722&originWidth=1271&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=155193&status=done&style=none&taskId=u10e3e4ea-0eda-471b-8a07-73c103051f9&title=&width=1016.8)
### 2.1.1 Class
```java
public java.net.URL getResource(String name) {
        name = resolveName(name);
        ClassLoader cl = getClassLoader0();
        if (cl==null) {
            // A system class.
            return ClassLoader.getSystemResource(name);
        }
        return cl.getResource(name);
    }


     public InputStream getResourceAsStream(String name) {
        name = resolveName(name);
        ClassLoader cl = getClassLoader0();
        if (cl==null) {
            // A system class.
            return ClassLoader.getSystemResourceAsStream(name);
        }
        return cl.getResourceAsStream(name);
    }


    private String resolveName(String name) {
        if (name == null) {
            return name;
        }
        if (!name.startsWith("/")) {
            Class<?> c = this;
            while (c.isArray()) {
                c = c.getComponentType();
            }
            String baseName = c.getName();
            int index = baseName.lastIndexOf('.');
            if (index != -1) {
                name = baseName.substring(0, index).replace('.', '/')
                    +"/"+name;
            }
        } else {
            name = name.substring(1);
        }
        return name;
    }
```
简单来说他就是依靠类加载器的能力来加载资源，并且是当前类的路径相关的，也是支持以/开头的绝对路径的，我们在框架的源码很容易看到他的身影
🌈🌈案例
```java
/**
 * @description: Jdk资源加载测试
 * @author: shu
 * @createDate: 2023/4/3 18:56
 * @version: 1.0
 */
public class JdkResourceTest {
	public static void main(String[] args) {
		// 依赖Jdk的Class进行资源加载
		InputStream asStream = JdkResourceTest.class.getResourceAsStream("/spring-config.xml");
		System.out.println(asStream);
		URL url = JdkResourceTest.class.getResource("/spring-config.xml");
		System.out.println(url);
		URL resource = JdkResourceTest.class.getResource("/spring-config.xml");
		System.out.println(resource);
	}
}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680519604520-6bbfc1cb-63b2-4de8-bc2d-1da8e6cfc995.png#averageHue=%23b0b2a1&clientId=u8ce5a3e8-9997-4&from=paste&height=485&id=uc950171f&originHeight=606&originWidth=1786&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=149212&status=done&style=none&taskId=u5600a5e4-f59b-488d-ab5c-c337055a4ba&title=&width=1428.8)
### 2.1.2 ClassLoader
```java
    public static URL getSystemResource(String name) {
        ClassLoader system = getSystemClassLoader();
        if (system == null) {
            return getBootstrapResource(name);
        }
        return system.getResource(name);
    }


   public static InputStream getSystemResourceAsStream(String name) {
        URL url = getSystemResource(name);
        try {
            return url != null ? url.openStream() : null;
        } catch (IOException e) {
            return null;
        }
    }
```
🌈🌈案例
```java
package org.springframework.shu;

import java.io.InputStream;
import java.net.URL;

/**
 * @description: 类加载器测试
 * @author: shu
 * @createDate: 2023/4/3 19:03
 * @version: 1.0
 */
public class ClassLoaderTest {
	public static void main(String[] args) {
		URL url = ClassLoader.getSystemResource("spring-config.xml");
		System.out.println(url);
		InputStream stream = ClassLoader.getSystemResourceAsStream("spring-config.xml");
		System.out.println(stream);aa
	}
}

```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680519985201-70349b41-7976-4cb4-b48b-1d09e95185fd.png#averageHue=%23b0b1a0&clientId=u8ce5a3e8-9997-4&from=paste&height=294&id=u41d1dbc4&originHeight=368&originWidth=1823&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=77622&status=done&style=none&taskId=u07a8355d-efcf-4110-b4a4-8153dd91846&title=&width=1458.4)
需要注意的是：把java项目打包成jar包，如果jar包中存在资源文件需要访问，必须采取stream的形式访问。**可以调用getResourceAsStream()方法，而不能采用路径的方式访问（文件已经被打到jar里面了，不符合路径的）。**
### 2.1.3 File
这种方式我们应该非常熟悉，这里我就不多介绍了
```java
package org.springframework.shu;

import java.io.File;

/**
 * @description: 文件测试
 * @author: shu
 * @createDate: 2023/4/3 19:08
 * @version: 1.0
 */
public class FileTest {
	public static void main(String[] args) {
		File file = new File("D:\\workspace\\spring-framework\\spring-framework-5.2.0.RELEASE\\spring-core\\src\\main\\java\\org\\springframework\\core\\io\\AbstractFileResolvingResource.java");
		System.out.println(file.exists());
	}
}
```
📌📌注意：

1. 不管是类对象的getResource()还是类加载器的getSystemResouce()，都是走的类加载器的getResource()，类加载器会搜索自己的加载路径来匹配寻找项。而最常用的类加载器就是AppClassLoader，又因为APPClassLoader的加载路径是classpath，所以网上文章一般都会说getClass().getResouce()是返回classpath，这是不够准确的。
2. 整体来说，JDK提供的一些获取资源的方式，还是比较难用的。如果你处在Spring环境中，强烈建议使用它提供的资源访问接口，下面着重介绍，我们首先编写一个测试用例
## 2.2 Resource接口
`org.springframework.core.io.` 包中的`Spring Resource `接口，旨在成为一个更有能力的接口，用于抽象访问低级资源。
```java


package org.springframework.core.io;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.nio.channels.Channels;
import java.nio.channels.ReadableByteChannel;

import org.springframework.lang.Nullable;

/**
 * 资源接口：
 * 在Spring Framework中，资源是一个接口，它抽象了对底层资源的访问，如文件系统、类路径、Web应用程序、
 */
public interface Resource extends InputStreamSource {


    /**
	 * 是否存在
	 * @return
	 */
    boolean exists();


    /**
	 * 是否可读
	 * @return
	 */
    default boolean isReadable() {
        return exists();
    }


    /**
	 * 是否打开
	 * @return
	 */
    default boolean isOpen() {
        return false;
    }


    /**
	 * 是否是文件
	 * @return
	 */
    default boolean isFile() {
        return false;
    }


    /**
	 * 获取URL
	 * @return
	 * @throws IOException
	 */
    URL getURL() throws IOException;


    /**
	 * 获取URI
	 * @return
	 * @throws IOException
	 */
    URI getURI() throws IOException;


    /**
	 * 获取文件
	 * @return
	 * @throws IOException
	 */
    File getFile() throws IOException;


    /**
	 * 获取可读字节通道
	 * @return
	 * @throws IOException
	 */
    default ReadableByteChannel readableChannel() throws IOException {
        return Channels.newChannel(getInputStream());
    }


    /**
	 * 获取资源长度
	 * @return
	 * @throws IOException
	 */
    long contentLength() throws IOException;


    /**
	 * 上次修改时间
	 * @return
	 * @throws IOException
	 */
    long lastModified() throws IOException;


    /**
	 * 创建相对路径的资源
	 * @param relativePath
	 * @return
	 * @throws IOException
	 */
    Resource createRelative(String relativePath) throws IOException;


    /**
	 * 获取文件名
	 * @return
	 */
    @Nullable
    String getFilename();


    /**
	 * 获取描述
	 * @return
	 */
    String getDescription();

}

```
正如 Resource 接口的定义所示，它扩展了 InputStreamSource 接口，也及时上层接口
```java


package org.springframework.core.io;

import java.io.IOException;
import java.io.InputStream;

/**
 * 用于获取文件输入流的接口
 */
public interface InputStreamSource {

	/**
	 * 获取文件输入流
	 * @return
	 * @throws IOException
	 */
	InputStream getInputStream() throws IOException;

}

```
我们可以看见他对InputStream进行了封装，可以转换成流数据
Resource 接口中最重要的一些方法是。

- getInputStream(): 定位并打开资源，返回一个用于读取资源的 InputStream。我们期望每次调用都能返回一个新的 InputStream。关闭该流是调用者的责任。
- exists(): 返回一个 boolean 值，表示该资源是否以物理形式实际存在。
- isOpen(): 返回一个 boolean，表示该资源是否代表一个具有开放流的句柄。如果为 true，InputStream 不能被多次读取，必须只读一次，然后关闭以避免资源泄漏。对于所有通常的资源实现，除了 InputStreamResource 之外，返回 false。
- getDescription(): 返回该资源的描述，用于处理该资源时的错误输出。这通常是全路径的文件名或资源的实际URL。

下面主要介绍他的几大分支结构
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1691548712115-46e335a3-f3e6-4356-a10b-1b582b88917c.png#averageHue=%23a3b59f&clientId=ue66b5608-c601-4&from=paste&height=328&id=u77d3b0b8&originHeight=410&originWidth=1133&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=55327&status=done&style=none&taskId=ufcfb7580-12ed-43bf-be4a-b66755aa467&title=&width=906.4)
当涉及Spring Framework中的资源管理时，除了`Resource`接口本身外，还有几个主要的子接口和实现类，用于特定类型的资源管理和访问。以下是这些接口和实现之间的区别：

1.  **AbstractResource**:
`AbstractResource`是一个抽象类，它提供了`Resource`接口的基本实现，同时也可以作为其他自定义资源实现的基类。它处理了大部分资源操作的共通逻辑，但并没有提供直接的资源访问逻辑。这个类通常用于自定义资源实现时继承。
2.  **ContextResource**:
`ContextResource`接口是`Resource`接口的子接口之一，用于表示基于Spring应用程序上下文的资源，通常指的是`ApplicationContext`中定义的资源。它扩展了`Resource`接口，添加了一些用于管理资源在应用程序上下文中的注册和访问的方法。
3.  **HttpResource**:
`HttpResource`接口是`Resource`接口的子接口之一，用于表示HTTP资源，例如通过URL访问的远程资源。它通常用于访问Web上的文件，图像，API等。这个接口可以处理与HTTP相关的特定操作，如获取HTTP头信息等。
4.  **WritableResource**:
`WritableResource`接口也是`Resource`接口的子接口之一，用于表示可写的资源，即可以通过它来写入数据。这个接口扩展了`Resource`接口，添加了一些用于向资源写入数据的方法。

这些接口和抽象类之间的关系可以总结如下：

- `AbstractResource`是一个抽象类，提供了`Resource`接口的基本实现和通用逻辑。
- `ContextResource`、`HttpResource`、`WritableResource`都是`Resource`接口的子接口，它们在特定情境下扩展了`Resource`接口，为特定类型的资源提供了更丰富的功能。

在Spring应用程序中，根据需要，您可以使用这些不同的资源接口和实现来处理不同类型的资源，从而更方便地进行资源的加载、访问和管理。
📌基本案例
```java
package org.springframework.shu;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.xml.XmlBeanFactory;
import org.springframework.core.io.ClassPathResource;

/**
 * @description: 测试Bean
 * @author: shu
 * @createDate: 2023/4/3 14:56
 * @version: 1.0
 */
public class AppTest {
	@Test
	public void MyTestBeanTest() {
		BeanFactory bf = new XmlBeanFactory( new ClassPathResource("spring-config.xml"));
		MyTestBean myTestBean = (MyTestBean) bf.getBean("myTestBean");
		System.out.println(myTestBean.getName());
	}
}

```
我们从代码中可以看到首先将我们编写的配置文件进行加载，我们来看看他是如何实现的，首先我们先来看看下面的接口
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680518325729-63c42109-00e1-47b1-8bae-10fa9e62aac3.png#averageHue=%232d2d2d&clientId=u8ce5a3e8-9997-4&from=paste&height=444&id=ub46f3538&originHeight=555&originWidth=784&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=15691&status=done&style=none&taskId=ubc74be05-c6d9-4f06-b7c8-54bb2b9a1f4&title=&width=627.2)
🔷**InputStreamSource：**对InputStream的包装，接口获取InputStream信息
```java
public interface InputStreamSource {

	// 返回一个流数据
	InputStream getInputStream() throws IOException;

}

```
🔷**Resource：**定义了一些基本的文件操作方法
```java
public interface Resource extends InputStreamSource {
    //返回Resource所指向的底层资源是否存在
  boolean exists();
  //返回当前Resource代表的底层资源是否可读
  default boolean isReadable() {
    return true;
  }
  //返回Resource资源文件是否已经打开，**如果返回true，则只能被读取一次然后关闭以避免内存泄漏；**常见的Resource实现一般返回false
  default boolean isOpen() {
    return false;
  }
  //@since 5.0  参见：getFile()
  default boolean isFile() {
    return false;
  }
  //如果当前Resource代表的底层资源能由java.util.URL代表，则返回该URL，否则抛出IO异常
  URL getURL() throws IOException;
  //如果当前Resource代表的底层资源能由java.util.URI代表，则返回该URI，否则抛出IO异常
  URI getURI() throws IOException;
  //如果当前Resource代表的底层资源能由java.io.File代表，则返回该File，否则抛出IO异常
  File getFile() throws IOException;

  //@since 5.0  用到了nio得Channel相关的
  default ReadableByteChannel readableChannel() throws IOException {
    return Channels.newChannel(getInputStream());
  }
  // 返回当前Resource代表的底层文件资源的长度，一般是值代表的文件资源的长度
  long contentLength() throws IOException;
  //返回当前Resource代表的底层资源的最后修改时间
  long lastModified() throws IOException;

  // 用于创建相对于当前Resource代表的底层资源的资源
  // 比如当前Resource代表文件资源“d:/test/”则createRelative（“test.txt”）将返回表文件资源“d:/test/test.txt”Resource资源。
  Resource createRelative(String relativePath) throws IOException;

  //返回当前Resource代表的底层文件资源的文件路径，比如File资源“file://d:/test.txt”将返回“d:/test.txt”，而URL资源http://www.javass.cn将返回“”，因为只返回文件路径。
  @Nullable
  String getFilename();
  //返回当前Resource代表的底层资源的描述符，通常就是资源的全路径（实际文件名或实际URL地址）
  String getDescription();
}
```
🔷**AbstractResource： **直接抽象类实现类子类的方法
```java
public abstract class AbstractResource implements Resource {

  // File或者流  都从此处判断
  // 这里属于通用实现，子类大都会重写这个方法的~~~~~~
  @Override
  public boolean exists() {
    // Try file existence: can we find the file in the file system?
    try {
      return getFile().exists();
    } catch (IOException ex) {
      // Fall back to stream existence: can we open the stream?
      try {
        InputStream is = getInputStream();
        is.close();
        return true;
      } catch (Throwable isEx) {
        return false;
      }
    }
  }

  // 默认都是可读得。大多数子类都会复写
  @Override
  public boolean isReadable() {
    return true;
  }

  // 默认不是打开的。 比如InputStreamResource就会让他return true
  @Override
  public boolean isOpen() {
    return false;
  }
  // 默认不是一个File
  @Override
  public boolean isFile() {
    return false;
  }

  // 可议看到getURI方法一般都是依赖于getURL的
  @Override
  public URL getURL() throws IOException {
    throw new FileNotFoundException(getDescription() + " cannot be resolved to URL");
  }

  @Override
  public URI getURI() throws IOException {
    URL url = getURL();
    try {
      return ResourceUtils.toURI(url);
    } catch (URISyntaxException ex) {
      throw new NestedIOException("Invalid URI [" + url + "]", ex);
    }
  }

  @Override
  public File getFile() throws IOException {
    throw new FileNotFoundException(getDescription() + " cannot be resolved to absolute file path");
  }
  @Override
  public ReadableByteChannel readableChannel() throws IOException {
    return Channels.newChannel(getInputStream());
  }
  // 调用此方法，也相当于吧流的read了一遍，请务必注意
  @Override
  public long contentLength() throws IOException {
    InputStream is = getInputStream();
    try {
      long size = 0;
      byte[] buf = new byte[255];
      int read;
      while ((read = is.read(buf)) != -1) {
        size += read;
      }
      return size;
    } finally {
      try {
        is.close();
      } catch (IOException ex) {
      }
    }
  }
  @Override
  public long lastModified() throws IOException {
    long lastModified = getFileForLastModifiedCheck().lastModified();
    if (lastModified == 0L) {
      throw new FileNotFoundException(getDescription() +
          " cannot be resolved in the file system for resolving its last-modified timestamp");
    }
    return lastModified;
  }
  // 只有一个子类：`AbstractFileResolvingResource`覆盖了此方法
  protected File getFileForLastModifiedCheck() throws IOException {
    return getFile();
  }
  @Override
  public Resource createRelative(String relativePath) throws IOException {
    throw new FileNotFoundException("Cannot create a relative resource for " + getDescription());
  }
  @Override
  @Nullable
  public String getFilename() {
    return null;
  }
  // 这些基础方法，很多子类也都有重写~~~~ 但是一般来说关系不大
  @Override
  public String toString() {
    return getDescription();
  }
  // 比较的就是getDescription()
  @Override
  public boolean equals(Object obj) {
    return (obj == this ||
      (obj instanceof Resource && ((Resource) obj).getDescription().equals(getDescription())));
  }
  // getDescription()的hashCode
  @Override
  public int hashCode() {
    return getDescription().hashCode();
  }

}
```
以0AbstractResource为主要分支，下面我们仔细来介绍一下他的子类，
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680521813534-93eb6d80-0311-4732-acae-1dc411b779fb.png#averageHue=%232e2d2d&clientId=u8ce5a3e8-9997-4&from=paste&height=524&id=u8485316c&originHeight=655&originWidth=1733&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=82218&status=done&style=none&taskId=u4f8e251f-cdc9-45f4-96b4-2a911dd5721&title=&width=1386.4)
## 2.3 主要分支
![Resource.drawio.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680575800408-df3ef08b-ea86-4114-ab44-2f35c5c65fb9.png#averageHue=%2349352a&clientId=u0578365b-251e-4&from=ui&id=u5c30ea4c&originHeight=381&originWidth=951&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=85198&status=done&style=none&taskId=ua64a9eb2-5cd2-4956-86b4-61eba229aed&title=)
下面介绍主要的资源类，其余的需要读者自己去看源码，其实也比较简单，我们主要的是学习这种思想
### 2.3.1 FileSystemResource
> 这是 java.io 的 Resource 实现。文件句柄。它还支持 java.nio.file。路径句柄，应用 Spring 的标准基于 String 的路径转换，但是通过 java.nio.file 执行所有操作，文件 API。
> 对于纯 java.nio.path，基于路径的支持使用 PathResource，FileSystemResource 支持将解析作为文件和 URL。

代表java.io.File资源，对于getInputStream操作将返回底层文件的字节流，**isOpen将永远返回false，从而表示可多次读取底层文件的字节流。**
```java
public class FileSystemResource extends AbstractResource implements WritableResource {

    private final String path;

	@Nullable
	private final File file;

	private final Path filePath;

	// 构造器
    public FileSystemResource(String path) {
		Assert.notNull(path, "Path must not be null");
		this.path = StringUtils.cleanPath(path);
		this.file = new File(path);
		this.filePath = this.file.toPath();
	}


	// 是否存在
  @Override
	public boolean exists() {
		return (this.file != null ? this.file.exists() : Files.exists(this.filePath));
	}

	// 是否可读
	@Override
	public boolean isReadable() {
		return (this.file != null ? this.file.canRead() && !this.file.isDirectory() :
				Files.isReadable(this.filePath) && !Files.isDirectory(this.filePath));
	}


	@Override
	public InputStream getInputStream() throws IOException {
		try {
			return Files.newInputStream(this.filePath);
		}
		catch (NoSuchFileException ex) {
			throw new FileNotFoundException(ex.getMessage());
		}
	}

	@Override
	public boolean isWritable() {
		return (this.file != null ? this.file.canWrite() && !this.file.isDirectory() :
				Files.isWritable(this.filePath) && !Files.isDirectory(this.filePath));
	}


	@Override
	public OutputStream getOutputStream() throws IOException {
		return Files.newOutputStream(this.filePath);
	}

}
```
他的主要作用就是构建File，可以仔细查看源码
Demo:
```java
package org.springframework.shu.resource;

import org.springframework.core.io.FileSystemResource;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/3 19:53
 * @version: 1.0
 */
public class FileSystemResourceTest {
	public static void main(String[] args) {
		FileSystemResource fileSystemResource = new FileSystemResource("E:\\Spring源码学习\\integration-tests\\src\\test\\java\\org\\springframework\\shu\\resource\\FileSystemResourceTest.java");
		System.out.println(fileSystemResource.getFile());
		System.out.println(fileSystemResource.getFilename());
		System.out.println(fileSystemResource.getDescription());
		System.out.println(fileSystemResource.exists());
	}
}

```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680523089222-1831f60c-d399-46e9-8757-1b76b05b8216.png#averageHue=%23929785&clientId=u8ce5a3e8-9997-4&from=paste&height=250&id=u7c17ae9f&originHeight=313&originWidth=1865&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=70228&status=done&style=none&taskId=ue165032a-9210-44b3-aad8-e5728adeaeb&title=&width=1492)
### 2.3.2 InputStreamResource
> InputStreamResource 是给定 InputStream 的 Resource 实现。只有在没有特定的 Resource 实现可用的情况下才应该使用它。
> 特别是，在可能的情况下，更喜欢 ByteArrayResource 或任何基于文件的 Resource 实现。

InputStreamResource代表java.io.InputStream字节流，对于“getInputStream ”操作将直接返回该字节流，因此只能读取一次该字节流，即“isOpen”永远返回true。
```java
public class InputStreamResource extends AbstractResource {

	private final InputStream inputStream;

	private final String description;

	private boolean read = false;


    @Override
  	public InputStream getInputStream() throws IOException, IllegalStateException {
    if (this.read) {
      throw new IllegalStateException("InputStream has already been read - " +
          "do not use InputStreamResource if a stream needs to be read multiple times");
    }
    this.read = true;
    return this.inputStream;
  }
}
```
这个也比较简单就是把他转换成InputStream
Demo
```java
package org.springframework.shu.resource;

import org.springframework.core.io.InputStreamResource;

import java.io.*;
import java.nio.file.Files;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/3 20:01
 * @version: 1.0
 */
public class InputStreamResourceTest {
	public static void main(String[] args) throws IOException {
		File file = new File("E:\\Spring源码学习\\integration-tests\\src\\test\\java\\org\\springframework\\shu\\resource\\InputStreamResourceTest.java");
		 InputStream inputStream = Files.newInputStream(file.toPath());
		InputStreamResource inputStreamResource = new InputStreamResource(inputStream);
		System.out.println(inputStreamResource.getInputStream());
	}
}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680523682552-bc4ad69a-0e68-4641-bd6f-90043e8f049d.png#averageHue=%236c9769&clientId=u8ce5a3e8-9997-4&from=paste&height=268&id=ua8d6a69e&originHeight=335&originWidth=1866&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=77039&status=done&style=none&taskId=ue6f58c84-53c6-4a93-a066-21a97319cac&title=&width=1492.8)
### 2.3.3 BeanDefinitionResource
> 这就是把配置文件转成我们熟悉的Bean，BeanDefinition描述了一个bean实例，它具有属性值、构造函数参数值以及具体实现提供的进一步信息，关于这一块我们后面会详细介绍，这里先有个印象

```java
class BeanDefinitionResource extends AbstractResource {

	private final BeanDefinition beanDefinition;

    /**
	 * Create a new BeanDefinitionResource.
	 * @param beanDefinition the BeanDefinition object to wrap
	 */
	public BeanDefinitionResource(BeanDefinition beanDefinition) {
		Assert.notNull(beanDefinition, "BeanDefinition must not be null");
		this.beanDefinition = beanDefinition;
	}

	/**
	 * Return the wrapped BeanDefinition object.
	 */
	public final BeanDefinition getBeanDefinition() {
		return this.beanDefinition;
	}


	@Override
	public boolean exists() {
		return false;
	}

	@Override
	public boolean isReadable() {
		return false;
	}

	@Override
	public InputStream getInputStream() throws IOException {
		throw new FileNotFoundException(
				"Resource cannot be opened because it points to " + getDescription());
	}

	@Override
	public String getDescription() {
		return "BeanDefinition defined in " + this.beanDefinition.getResourceDescription();
	}


	/**
	 * This implementation compares the underlying BeanDefinition.
	 */
	@Override
	public boolean equals(@Nullable Object other) {
		return (this == other || (other instanceof BeanDefinitionResource &&
				((BeanDefinitionResource) other).beanDefinition.equals(this.beanDefinition)));
	}

	/**
	 * This implementation returns the hash code of the underlying BeanDefinition.
	 */
	@Override
	public int hashCode() {
		return this.beanDefinition.hashCode();
	}

}
```
我们可以看到其实就是将我们配置的Bean属性转换成Bean实例，后面详细介绍
### 2.2.4 DescriptiveResource
> 简单资源实现，保存资源描述，但不指向实际可读的资源。

```java
public class DescriptiveResource extends AbstractResource {

	private final String description;


	/**
	 * Create a new DescriptiveResource.
	 * @param description the resource description
	 */
	public DescriptiveResource(@Nullable String description) {
		this.description = (description != null ? description : "");
	}


	@Override
	public boolean exists() {
		return false;
	}

	@Override
	public boolean isReadable() {
		return false;
	}

	@Override
	public InputStream getInputStream() throws IOException {
		throw new FileNotFoundException(
				getDescription() + " cannot be opened because it does not point to a readable resource");
	}

	@Override
	public String getDescription() {
		return this.description;
	}


	/**
	 * This implementation compares the underlying description String.
	 */
	@Override
	public boolean equals(@Nullable Object other) {
		return (this == other || (other instanceof DescriptiveResource &&
				((DescriptiveResource) other).description.equals(this.description)));
	}

	/**
	 * This implementation returns the hash code of the underlying description String.
	 */
	@Override
	public int hashCode() {
		return this.description.hashCode();
	}

}

```
这个就不介绍了，其实很简单
### 2.2.5  ByteArrayResource
> 这是给定字节数组的 Resource 实现。它为给定字节数组创建 ByteArrayInputStream。

ByteArrayResource代表byte[]数组资源，对于“getInputStream”操作将返回一个ByteArrayInputStream。
```java
public class ByteArrayResource extends AbstractResource {

	private final byte[] byteArray;

	private final String description;


	/**
	 * Create a new {@code ByteArrayResource}.
	 * @param byteArray the byte array to wrap
	 */
	public ByteArrayResource(byte[] byteArray) {
		this(byteArray, "resource loaded from byte array");
	}

	/**
	 * Create a new {@code ByteArrayResource} with a description.
	 * @param byteArray the byte array to wrap
	 * @param description where the byte array comes from
	 */
	public ByteArrayResource(byte[] byteArray, @Nullable String description) {
		Assert.notNull(byteArray, "Byte array must not be null");
		this.byteArray = byteArray;
		this.description = (description != null ? description : "");
	}


	/**
	 * Return the underlying byte array.
	 */
	public final byte[] getByteArray() {
		return this.byteArray;
	}

	/**
	 * This implementation always returns {@code true}.
	 */
	@Override
	public boolean exists() {
		return true;
	}

	/**
	 * This implementation returns the length of the underlying byte array.
	 */
	@Override
	public long contentLength() {
		return this.byteArray.length;
	}

	/**
	 * This implementation returns a ByteArrayInputStream for the
	 * underlying byte array.
	 * @see java.io.ByteArrayInputStream
	 */
	@Override
	public InputStream getInputStream() throws IOException {
		return new ByteArrayInputStream(this.byteArray);
	}

	/**
	 * This implementation returns a description that includes the passed-in
	 * {@code description}, if any.
	 */
	@Override
	public String getDescription() {
		return "Byte array resource [" + this.description + "]";
	}


	/**
	 * This implementation compares the underlying byte array.
	 * @see java.util.Arrays#equals(byte[], byte[])
	 */
	@Override
	public boolean equals(@Nullable Object other) {
		return (this == other || (other instanceof ByteArrayResource &&
				Arrays.equals(((ByteArrayResource) other).byteArray, this.byteArray)));
	}

	/**
	 * This implementation returns the hash code based on the
	 * underlying byte array.
	 */
	@Override
	public int hashCode() {
		return (byte[].class.hashCode() * 29 * this.byteArray.length);
	}

}

```
**它可多次读取数组资源，即isOpen()永远返回false**
ByteArrayResource因为入参可以是byte[]类型，所以用途比较广泛，可以把从网络或者本地资源都转换为byte[]类型，然后用ByteArrayResource转化为资源
### 2.2.6 PathResource
> 这是 java.nio.file 的 Resource 实现，路径句柄，通过路径 API 执行所有操作和转换。它支持作为 File 和 URL 的解析，并且还实现了扩展的 WritableResource 接口。
> PathResource 实际上是一个纯 java.nio.path。具有不同创建相对行为的基于路径的 FileSystemResource 替代方案。

它是基于@since 4.0，也是基于JDK7提供的java.nio.file.Path的。实现原理也非常的简单，更像是对java.nio.file.Path进行了包装（java.nio.file.Files）
```java
public class PathResource extends AbstractResource implements WritableResource {

	private final Path path;

    public PathResource(Path path) {
		Assert.notNull(path, "Path must not be null");
		this.path = path.normalize();
	}

}
```
### 2.2.7 AbstractFileResolvingResource
它复写了`AbstractResource`大多数方法，是一个比较重要的分支。有不少非常好用的实现类
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1680525490917-117e9577-9314-44e8-9243-b16f9fbbc3cc.png#averageHue=%232d2d2c&clientId=u8ce5a3e8-9997-4&from=paste&height=622&id=u569acb07&originHeight=777&originWidth=1372&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=40069&status=done&style=none&taskId=uc9f3b683-72ca-48d1-9548-ab192a69150&title=&width=1097.6)
```java
public abstract class AbstractFileResolvingResource extends AbstractResource {


	@Override
	public boolean exists() {
		try {
			URL url = getURL();
			if (ResourceUtils.isFileURL(url)) {
				// Proceed with file system resolution
				return getFile().exists();
			}
			else {
				// Try a URL connection content-length header
				URLConnection con = url.openConnection();
				customizeConnection(con);
				HttpURLConnection httpCon =
						(con instanceof HttpURLConnection ? (HttpURLConnection) con : null);
				if (httpCon != null) {
					int code = httpCon.getResponseCode();
					if (code == HttpURLConnection.HTTP_OK) {
						return true;
					}
					else if (code == HttpURLConnection.HTTP_NOT_FOUND) {
						return false;
					}
				}
				if (con.getContentLengthLong() > 0) {
					return true;
				}
				if (httpCon != null) {
					// No HTTP OK status, and no content-length header: give up
					httpCon.disconnect();
					return false;
				}
				else {
					// Fall back to stream existence: can we open the stream?
					getInputStream().close();
					return true;
				}
			}
		}
		catch (IOException ex) {
			return false;
		}
	}

	@Override
	public boolean isReadable() {
		try {
			return checkReadable(getURL());
		}
		catch (IOException ex) {
			return false;
		}
	}

	boolean checkReadable(URL url) {
		try {
			if (ResourceUtils.isFileURL(url)) {
				// Proceed with file system resolution
				File file = getFile();
				return (file.canRead() && !file.isDirectory());
			}
			else {
				// Try InputStream resolution for jar resources
				URLConnection con = url.openConnection();
				customizeConnection(con);
				if (con instanceof HttpURLConnection) {
					HttpURLConnection httpCon = (HttpURLConnection) con;
					int code = httpCon.getResponseCode();
					if (code != HttpURLConnection.HTTP_OK) {
						httpCon.disconnect();
						return false;
					}
				}
				long contentLength = con.getContentLengthLong();
				if (contentLength > 0) {
					return true;
				}
				else if (contentLength == 0) {
					// Empty file or directory -> not considered readable...
					return false;
				}
				else {
					// Fall back to stream existence: can we open the stream?
					getInputStream().close();
					return true;
				}
			}
		}
		catch (IOException ex) {
			return false;
		}
	}

	@Override
	public boolean isFile() {
		try {
			URL url = getURL();
			if (url.getProtocol().startsWith(ResourceUtils.URL_PROTOCOL_VFS)) {
				return VfsResourceDelegate.getResource(url).isFile();
			}
			return ResourceUtils.URL_PROTOCOL_FILE.equals(url.getProtocol());
		}
		catch (IOException ex) {
			return false;
		}
	}

	/**
	 * This implementation returns a File reference for the underlying class path
	 * resource, provided that it refers to a file in the file system.
	 * @see org.springframework.util.ResourceUtils#getFile(java.net.URL, String)
	 */
	@Override
	public File getFile() throws IOException {
		URL url = getURL();
		if (url.getProtocol().startsWith(ResourceUtils.URL_PROTOCOL_VFS)) {
			return VfsResourceDelegate.getResource(url).getFile();
		}
		return ResourceUtils.getFile(url, getDescription());
	}

	/**
	 * This implementation determines the underlying File
	 * (or jar file, in case of a resource in a jar/zip).
	 */
	@Override
	protected File getFileForLastModifiedCheck() throws IOException {
		URL url = getURL();
		if (ResourceUtils.isJarURL(url)) {
			URL actualUrl = ResourceUtils.extractArchiveURL(url);
			if (actualUrl.getProtocol().startsWith(ResourceUtils.URL_PROTOCOL_VFS)) {
				return VfsResourceDelegate.getResource(actualUrl).getFile();
			}
			return ResourceUtils.getFile(actualUrl, "Jar URL");
		}
		else {
			return getFile();
		}
	}

	/**
	 * This implementation returns a File reference for the given URI-identified
	 * resource, provided that it refers to a file in the file system.
	 * @since 5.0
	 * @see #getFile(URI)
	 */
	protected boolean isFile(URI uri) {
		try {
			if (uri.getScheme().startsWith(ResourceUtils.URL_PROTOCOL_VFS)) {
				return VfsResourceDelegate.getResource(uri).isFile();
			}
			return ResourceUtils.URL_PROTOCOL_FILE.equals(uri.getScheme());
		}
		catch (IOException ex) {
			return false;
		}
	}

	/**
	 * This implementation returns a File reference for the given URI-identified
	 * resource, provided that it refers to a file in the file system.
	 * @see org.springframework.util.ResourceUtils#getFile(java.net.URI, String)
	 */
	protected File getFile(URI uri) throws IOException {
		if (uri.getScheme().startsWith(ResourceUtils.URL_PROTOCOL_VFS)) {
			return VfsResourceDelegate.getResource(uri).getFile();
		}
		return ResourceUtils.getFile(uri, getDescription());
	}

	/**
	 * This implementation returns a FileChannel for the given URI-identified
	 * resource, provided that it refers to a file in the file system.
	 * @since 5.0
	 * @see #getFile()
	 */
	@Override
	public ReadableByteChannel readableChannel() throws IOException {
		try {
			// Try file system channel
			return FileChannel.open(getFile().toPath(), StandardOpenOption.READ);
		}
		catch (FileNotFoundException | NoSuchFileException ex) {
			// Fall back to InputStream adaptation in superclass
			return super.readableChannel();
		}
	}

	@Override
	public long contentLength() throws IOException {
		URL url = getURL();
		if (ResourceUtils.isFileURL(url)) {
			// Proceed with file system resolution
			File file = getFile();
			long length = file.length();
			if (length == 0L && !file.exists()) {
				throw new FileNotFoundException(getDescription() +
						" cannot be resolved in the file system for checking its content length");
			}
			return length;
		}
		else {
			// Try a URL connection content-length header
			URLConnection con = url.openConnection();
			customizeConnection(con);
			return con.getContentLengthLong();
		}
	}

	@Override
	public long lastModified() throws IOException {
		URL url = getURL();
		boolean fileCheck = false;
		if (ResourceUtils.isFileURL(url) || ResourceUtils.isJarURL(url)) {
			// Proceed with file system resolution
			fileCheck = true;
			try {
				File fileToCheck = getFileForLastModifiedCheck();
				long lastModified = fileToCheck.lastModified();
				if (lastModified > 0L || fileToCheck.exists()) {
					return lastModified;
				}
			}
			catch (FileNotFoundException ex) {
				// Defensively fall back to URL connection check instead
			}
		}
		// Try a URL connection last-modified header
		URLConnection con = url.openConnection();
		customizeConnection(con);
		long lastModified = con.getLastModified();
		if (fileCheck && lastModified == 0 && con.getContentLengthLong() <= 0) {
			throw new FileNotFoundException(getDescription() +
					" cannot be resolved in the file system for checking its last-modified timestamp");
		}
		return lastModified;
	}

	/**
	 * Customize the given {@link URLConnection}, obtained in the course of an
	 * {@link #exists()}, {@link #contentLength()} or {@link #lastModified()} call.
	 * <p>Calls {@link ResourceUtils#useCachesIfNecessary(URLConnection)} and
	 * delegates to {@link #customizeConnection(HttpURLConnection)} if possible.
	 * Can be overridden in subclasses.
	 * @param con the URLConnection to customize
	 * @throws IOException if thrown from URLConnection methods
	 */
	protected void customizeConnection(URLConnection con) throws IOException {
		ResourceUtils.useCachesIfNecessary(con);
		if (con instanceof HttpURLConnection) {
			customizeConnection((HttpURLConnection) con);
		}
	}

	/**
	 * Customize the given {@link HttpURLConnection}, obtained in the course of an
	 * {@link #exists()}, {@link #contentLength()} or {@link #lastModified()} call.
	 * <p>Sets request method "HEAD" by default. Can be overridden in subclasses.
	 * @param con the HttpURLConnection to customize
	 * @throws IOException if thrown from HttpURLConnection methods
	 */
	protected void customizeConnection(HttpURLConnection con) throws IOException {
		con.setRequestMethod("HEAD");
	}


	/**
	 * Inner delegate class, avoiding a hard JBoss VFS API dependency at runtime.
	 */
	private static class VfsResourceDelegate {

		public static Resource getResource(URL url) throws IOException {
			return new VfsResource(VfsUtils.getRoot(url));
		}

		public static Resource getResource(URI uri) throws IOException {
			return new VfsResource(VfsUtils.getRoot(uri));
		}
	}


}
```
#### 2.2.7.1 UrlResource
> UrlResource 包装了一个 java.net.URL，可以用来访问通常可以通过 URL 访问的任何对象，比如文件、 HTTPS 目标、 FTP 目标等。所有 URL 都有一个标准化的 String 表示形式，这样就可以使用适当的标准化前缀来表示一种 URL 类型与另一种 URL 类型之间的区别。这包括 file: 用于访问文件系统路径，HTTPS: 用于通过 HTTPS 协议访问资源，FTP: 用于通过 FTP 访问资源等。

通过URL地址获取资源，可以从网络中获取资源
```java
public class UrlResource extends AbstractFileResolvingResource {

	/**
	 * Original URI, if available; used for URI and File access.
	 */
	@Nullable
	private final URI uri;

	/**
	 * Original URL, used for actual access.
	 */
	private final URL url;

	/**
	 * Cleaned URL (with normalized path), used for comparisons.
	 */
	@Nullable
	private volatile URL cleanedUrl;


	/**
	 * Create a new {@code UrlResource} based on the given URI object.
	 * @param uri a URI
	 * @throws MalformedURLException if the given URL path is not valid
	 * @since 2.5
	 */
	public UrlResource(URI uri) throws MalformedURLException {
		Assert.notNull(uri, "URI must not be null");
		this.uri = uri;
		this.url = uri.toURL();
	}

	/**
	 * Create a new {@code UrlResource} based on the given URL object.
	 * @param url a URL
	 */
	public UrlResource(URL url) {
		Assert.notNull(url, "URL must not be null");
		this.uri = null;
		this.url = url;
	}
}
```
#### 2.2.7.2 FileUrlResource
> 它提供了我们访问网络资源能像访问本地文件一样的能力

```java
public class FileUrlResource extends UrlResource implements WritableResource {

	@Nullable
	private volatile File file;


	/**
	 * Create a new {@code FileUrlResource} based on the given URL object.
	 * <p>Note that this does not enforce "file" as URL protocol. If a protocol
	 * is known to be resolvable to a file, it is acceptable for this purpose.
	 * @param url a URL
	 * @see ResourceUtils#isFileURL(URL)
	 * @see #getFile()
	 */
	public FileUrlResource(URL url) {
		super(url);
	}

    @Override
	public File getFile() throws IOException {
		File file = this.file;
		if (file != null) {
			return file;
		}
		file = super.getFile();
		this.file = file;
		return file;
	}

	@Override
	public boolean isWritable() {
		try {
			File file = getFile();
			return (file.canWrite() && !file.isDirectory());
		}
		catch (IOException ex) {
			return false;
		}
	}

	@Override
	public OutputStream getOutputStream() throws IOException {
		return Files.newOutputStream(getFile().toPath());
	}

	@Override
	public WritableByteChannel writableChannel() throws IOException {
		return FileChannel.open(getFile().toPath(), StandardOpenOption.WRITE);
	}

	@Override
	public Resource createRelative(String relativePath) throws MalformedURLException {
		return new FileUrlResource(createRelativeURL(relativePath));
	}
}
```
#### 2.2.7.3 ClassPathResource
> 此类表示应从类路径获取的资源。它使用线程上下文类加载器、给定类加载器或给定类来加载资源。
> 这个 Resource 实现支持作为 java.io 的解析。如果类路径资源驻留在文件系统中，而不是驻留在 jar 中且尚未(由 servlet 引擎或任何环境)扩展到文件系统的类路径资源，则调用。

听这名字就知道，它是直接去读取类路径下的资源文件的。
```java
public class ClassPathResource extends AbstractFileResolvingResource {
  private final String path;'
  @Nullable
  private ClassLoader classLoader;
  @Nullable
  private Class<?> clazz; // 它还可以自己指定clazz

  @Nullable
  public final ClassLoader getClassLoader() {
    return (this.clazz != null ? this.clazz.getClassLoader() : this.classLoader);
  }
  @Override
  public boolean exists() {
    return (resolveURL() != null);
  }
  // 这是它最重要的一个方法，依赖于JDK的实现嘛
  @Override
  public InputStream getInputStream() throws IOException {
    InputStream is;
    if (this.clazz != null) {
      is = this.clazz.getResourceAsStream(this.path);
    }
    else if (this.classLoader != null) {
      is = this.classLoader.getResourceAsStream(this.path);
    }
    else {
      is = ClassLoader.getSystemResourceAsStream(this.path);
    }
    if (is == null) {
      throw new FileNotFoundException(getDescription() + " cannot be opened because it does not exist");
    }
    return is;
  }
  @Override
  public URL getURL() throws IOException {
    URL url = resolveURL();
    if (url == null) {
      throw new FileNotFoundException(getDescription() + " cannot be resolved to URL because it does not exist");
    }
    return url;
  }
  // 非常简单 直接解析path即可
  @Override
  @Nullable
  public String getFilename() {
    return StringUtils.getFilename(this.path);
  }
}
```
#### 2.2.7.4 ServletContextResource
> 这是 ServletContext 资源的 Resource 实现，它解释相关 Web 应用程序根目录中的相对路径

- 这个在web包里面。org.springframework.web.context.support
- ServletContext资源的资源实现，解释web应用程序根目录中的相对路径。
- 始终支持流访问和URL访问，但仅允许在web应用程序存档扩展时访问java.io.File。
- 为访问Web容器上下文中的资源而设计的类，负责以相对于Web应用程序根目录的路径加载资源，它支持以流和URL的方式访问，在WAR解包的情况下，也可以通过File的方式访问，还可以直接从JAR包中访问资源
```java
public class ServletContextResource extends AbstractFileResolvingResource implements ContextResource {
  // 持有servletContext的引用
  private final ServletContext servletContext;
  private final String path;

  // 只提供这一个构造函数，来构造一个资源
  public ServletContextResource(ServletContext servletContext, String path) {
    // check ServletContext
    Assert.notNull(servletContext, "Cannot resolve ServletContextResource without ServletContext");
    this.servletContext = servletContext;

    // check path
    Assert.notNull(path, "Path is required");
    String pathToUse = StringUtils.cleanPath(path);
    if (!pathToUse.startsWith("/")) {
      pathToUse = "/" + pathToUse;
    }
    this.path = pathToUse;
  }

  // 我们发现，它底层都是依赖于servletContext.getResource  getResourceAsStream这些方法去找到资源的
  @Override
  public boolean isFile() {
    try {
      URL url = this.servletContext.getResource(this.path);
      if (url != null && ResourceUtils.isFileURL(url)) {
        return true;
      }
      else {
        return (this.servletContext.getRealPath(this.path) != null);
      }
    }
    catch (MalformedURLException ex) {
      return false;
    }
  }
  @Override
  public InputStream getInputStream() throws IOException {
    InputStream is = this.servletContext.getResourceAsStream(this.path);
    if (is == null) {
      throw new FileNotFoundException("Could not open " + getDescription());
    }
    return is;
  }
  // 这个有点意思。如果URL就是File类型。就ok
  // 如果不是file类型，就根据绝对路径 new一个出来
  @Override
  public File getFile() throws IOException {
    URL url = this.servletContext.getResource(this.path);
    if (url != null && ResourceUtils.isFileURL(url)) {
      // Proceed with file system resolution...
      return super.getFile();
    }
    else {
      String realPath = WebUtils.getRealPath(this.servletContext, this.path);
      return new File(realPath);
    }
  }

}
```
# 三 ResourceLoader接口

-  ResourceLoader 接口应该由可以返回(即加载) Resource 实例的对象实现。
- 所有应用程序上下文都实现 ResourceLoader 接口。
- 在Spring Framework中，所有的应用程序上下文（Application Context）都实现了ResourceLoader接口，因此它们都具有加载资源的能力。这意味着您可以使用任何应用程序上下文来获取Resource实例，无论是标准的ApplicationContext还是其他特定类型的应用程序上下文，都可以用来加载不同类型的资源。
- ResourceLoader接口的存在确保了资源加载的统一性和可扩展性，不论您使用哪种类型的应用程序上下文，您都可以通过它们来获取资源，并且在应用程序中使用这些资源。
- 例如，无论是使用基于XML配置的ClassPathXmlApplicationContext还是基于注解的AnnotationConfigApplicationContext，您都可以通过它们的实例来获取资源，加载配置文件，读取模板文件等。

![ResourceLoader.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1688026713385-57cc72f0-62c2-4227-92c3-4af062cd9135.png#averageHue=%231f2024&clientId=uc299bf2b-7399-4&from=paste&height=1499&id=u9398dd05&originHeight=1874&originWidth=7346&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=271238&status=done&style=none&taskId=ub4a9e4bf-341d-4f8a-b14a-a9ae6628daf&title=&width=5876.8)
```java
package org.springframework.shu.resource;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.core.io.Resource;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/6/29 16:58
 * @version: 1.0
 */
public class ResourceTest implements ApplicationContextAware {

	ApplicationContext applicationContext ;

	public void getResourceTest() {
		//通过applicationContext，只一步getResource()，就可以获取资源
		Resource resource = applicationContext.getResource("spring-student.xml");
		//TODO: 用此resource来获取想要的资源
		//......
	}

	@Override
	public void setApplicationContext(ApplicationContext applicationContext)
			throws BeansException {
		this.applicationContext = applicationContext;
	}
}
```
根据上面的说法，在Spring中的所有上下文都要实现ResourceLoader接口，因此   Spring框架的原则是：**applicationContext.getResource()会采用和ApplicationContext相同的策略来访问资源。**
> 理解？

- 如果用ClassPathXmlApplicationContext启动的Spring容器，则底层Resource是ClassPathResource实例
-   如果用FileSystemXmlApplicationContext启动的Spring容器，则底层Resource是FileSystemResource实例
- 如果用XmlWebApplicationContext启动的Spring容器，则底层Resource是ServletContextResource实例

这样就应该理解了吧
> 获取指定的Resource实现类


> 有时候程序员可能更擅长某种Resource实现类，或者当前项目需要大量读取某一种类型资源，使用对应的具体的实现类则更简洁与优雅。而这些实现类又有可能与当前ApplicationContext策略的Resource实现类不同，这时直接获取Spring容器的Resource实现类反而不太好用，这时候就可以使用自定义的Resource实现类

```java
Resource template = ctx.getResource("classpath:some/resource/path/myTemplate.txt");
Resource template = ctx.getResource("file:///some/resource/path/myTemplate.txt");
Resource template = ctx.getResource("https://myhost.com/resource/path/myTemplate.txt");
```
| classpath: | classpath:com/myapp/config.xml | Loaded from the classpath. |
| --- | --- | --- |
| file: | file:///data/config.xml | Loaded as a URL from the filesystem. See also [FileSystemResourceCaveats](https://docs.spring.io/spring-framework/reference/core/resources.html#resources-filesystemresource-caveats). |
| https: | https://myserver/logo.png | Loaded as a URL. |
| (none) | /data/config.xml | Depends on the underlying ApplicationContext. |

# 四 ResourcePatternResolver接口

- Spring Framework 中的 ResourcePatternResolver 接口是 Spring 提供的用于解析资源模式的接口。该接口继承自 Spring 的 ResourceLoader 接口，并在此基础上添加了对资源模式解析的能力。
- ResourcePatternResolver 接口定义了一系列方法，用于解析匹配指定资源模式的资源。其中最常用的方法是 `getResources(String locationPattern)`，该方法接收一个资源模式字符串作为参数，返回匹配该模式的所有资源的数组。

资源模式字符串可以包含通配符和特殊字符，用于匹配文件系统中的多个资源。例如，常见的资源模式包括：
- `classpath:` 前缀：用于从类路径中加载资源。例如，`classpath:com/example/*.xml` 可以匹配类路径下 `com/example/` 目录下的所有 XML 文件。
- `file:` 前缀：用于从文件系统中加载资源。例如，`file:/path/to/files/*.txt` 可以匹配指定路径下的所有文本文件。
- `**` 通配符：用于匹配任意路径，包括子目录。例如，`com/example/**/*Test.class` 可以匹配 `com/example/` 目录下的所有以 "Test" 结尾的类文件，包括子目录中的文件。
```java
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;

import java.io.IOException;

public class ResourcePatternResolverExample {
    public static void main(String[] args) throws IOException {
        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources("classpath:*.txt");
        for (Resource resource : resources) {
            System.out.println("Resource found: " + resource.getFilename());
            // 这里可以进行进一步的处理，如读取文件内容等操作
        }
    }
}

```
# 五 **ResourceLoaderAware 接口**
ResourceLoader 是 Spring 提供的一个用于加载资源的接口，它可以加载类路径中的资源、文件系统中的资源以及其他外部资源，通过实现 ResourceLoaderAware 接口，可以方便地获取 ResourceLoader 实例，并在类中使用它加载所需的资源。
当实现 ResourceLoaderAware 接口的类被实例化并由 Spring 容器管理时，Spring 将会自动调用该方法，并将相应的 ResourceLoader 实例作为参数传入，在该方法中，您可以将 ResourceLoader 实例存储在类的成员变量中，以便在需要加载资源的地方使用它。
```java
import org.springframework.context.ResourceLoaderAware;
import org.springframework.core.io.ResourceLoader;

public class MyResourceLoaderAwareBean implements ResourceLoaderAware {
    private ResourceLoader resourceLoader;

    @Override
    public void setResourceLoader(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    public void loadResource() {
        // 使用 ResourceLoader 加载资源
        Resource resource = resourceLoader.getResource("classpath:my-resource.txt");
        // 进行进一步的处理，例如读取资源内容等操作
        // ...
    }
}

```
其他的知识参考官网的知识，这里的知识都来自官网，综上我们看到Spring框架的精妙之处，把资源抽象成一个接口，不同的实现，从而达到了资源的不同的加载，到这我们也分析完成了案例的第一步资源的加载，下一篇文章来分析IOC的基本实现








