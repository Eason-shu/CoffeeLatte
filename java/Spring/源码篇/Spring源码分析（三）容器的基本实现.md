---

title: Spring源码分析（三）Spring源码分析（三）容器的基本实现
sidebar_position: 3
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

![f4160ad4a041d14e895592d8c4c6028.jpg](https://cdn.nlark.com/yuque/0/2023/jpeg/12426173/1680575958355-7e7155b0-1a22-4d0e-a853-24181a9a7aa6.jpeg#averageHue=%23677ca1&clientId=u308fce44-8546-4&from=paste&height=1024&id=ud95fe598&originHeight=1280&originWidth=1707&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=174986&status=done&style=none&taskId=uc0727f72-e947-494d-bd20-3597a79bc28&title=&width=1365.6)
本图：川西旅游中拍摄的（业余摄影）
官网：[Home](https://spring.io/)
参考书籍：[Spring源码深度解析-郝佳编著-微信读书](https://weread.qq.com/web/bookDetail/0e232b205b260a0e29f3fb5)
上一篇文章我们介绍了Spring中的资源加载利器Resource接口，以及下面一些基础的实现类，下面我们按照我们编写的测试案例来分析一下一个自定义Bean是如何加载到容器之中的
**总体过程**
![XmlBeanDefinitionReader_loadBeanDefinitions.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1688087182688-421603cd-fd5c-40a5-88f7-16eb7051c5b8.png#averageHue=%23050301&clientId=uc33e4e79-3e11-4&from=paste&height=1606&id=u06991244&originHeight=2007&originWidth=1585&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=129599&status=done&style=none&taskId=u02abd071-f695-4b0b-8b9e-534ffcac3b7&title=&width=1268)

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681367905006-3c25dc20-d414-4974-b910-1b384e552021.png#averageHue=%23fbf9f8&clientId=u392fb17b-300c-4&from=paste&height=630&id=KKZyL&originHeight=787&originWidth=1318&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=255989&status=done&style=none&taskId=u16567be0-0265-4fe0-a7d9-eadcfde8672&title=&width=1054.4)
```java
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
# 一 容器基本用法
bean是Spring中最核心的东西，因为Spring就像是个大水桶，而bean就像是容器中的水，水桶脱离了水便也没什么用处了，那么我们先看看bean的定义。
1️⃣**自定义bean**
```java
package org.springframework.shu;

import org.springframework.shu.Interface.BeanInterface;

/**
 * @description: 测试Bean
 * @author: shu
 * @createDate: 2023/4/3 14:54
 * @version: 1.0
 */
public class MyTestBean {
	private String name = "EasonShu";
	public MyTestBean bean;
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
其实Bean就是我们编写的普通对象，Spring把他准换成Bean
2️⃣Application.xml配置Bean
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	   xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
	<!--配置bean id属性：给当前bean起一个名称，该名称必须保证是唯一的 class属性：设置bean的全类名-->
	<bean id="myTestBean" class="org.springframework.shu.MyTestBean">
		<!--给属性赋值name属性：设置bean属性名value属性：设置bean属性值-->
		<property name="name" value="LSTAR"></property>
	</bean>
</beans>
```
在上面的配置中我们看到了bean的声明方式，尽管Spring中bean的元素定义着N种属性来支撑我们业务的各种应用，但是我们只要声明成这样，基本上就已经可以满足我们的大多数应用了
3️⃣测试
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
4️⃣直接使用BeanFactory作为容器对于Spring的使用来说并不多见，甚至是甚少使用，因为在企业级的应用中大多数都会使用的是ApplicationContext（后续章节我们会介绍它们之间的区别），这里只是用于测试，让读者更快更好地分析Spring的内部原理。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1691591174563-e3c5c02f-0aea-48bb-9d08-873598e8faa4.png#averageHue=%23fefdfc&clientId=ub578b156-22e2-4&from=paste&height=410&id=u865103d6&originHeight=513&originWidth=1277&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=49601&status=done&style=none&taskId=u2501872c-0ccc-4182-b350-bc718154489&title=&width=1021.6)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681116850882-139fab34-070d-4f57-9382-829fe06657bb.png#averageHue=%23a28e73&clientId=ub38da42f-4160-4&from=paste&height=454&id=u48179f71&originHeight=568&originWidth=1813&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=120711&status=done&style=none&taskId=u2221bde2-c7b4-491b-a755-575fb25a465&title=&width=1450.4)
我们来总结一下上面的步骤

- 读取配置文件beanFactoryTest.xml。
- 根据beanFactoryTest.xml中的配置找到对应的类的配置，并实例化。
- 调用实例化后的实例。

上面我们编写了一个简单的案例，看起来十分简单，下面我们开始分析源码吧
# 二 基本结构
从源码的继承结构上我们可以大致划分为一下的模块，在我们的大脑中有个基本的认知
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1691633148428-73c776b2-5304-4d77-bb65-ec9da40e35a0.png#averageHue=%23f7f5f1&clientId=u4aea79de-d46b-4&from=paste&height=370&id=u7cf55296&originHeight=462&originWidth=1297&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=212187&status=done&style=none&taskId=u8da58640-e313-4410-956a-3ecc1f7c748&title=&width=1037.6)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1691717845233-c85a7d1c-9e54-4973-a9c8-223331cb54a3.png#averageHue=%23f9f7f7&clientId=u03ba19c0-a661-4&from=paste&height=636&id=uc1cfa0ab&originHeight=795&originWidth=1827&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=321799&status=done&style=none&taskId=ub88486df-ac94-4cc6-8309-04896af2a82&title=&width=1461.6)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1691717908726-f35e9452-b750-44b4-ad83-9318ba3fb686.png#averageHue=%23f7f3f0&clientId=u03ba19c0-a661-4&from=paste&height=638&id=ue068f5a3&originHeight=797&originWidth=1816&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=466129&status=done&style=none&taskId=uea313311-8de8-4334-9ad7-7b427c594ce&title=&width=1452.8)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1691717937237-74725fe0-25a4-41de-8daf-c499235196e5.png#averageHue=%23faf9f9&clientId=u03ba19c0-a661-4&from=paste&height=634&id=u8702f35c&originHeight=792&originWidth=1451&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=148245&status=done&style=none&taskId=u51d6b6fd-9a0d-4aee-b8f5-d225e904bf1&title=&width=1160.8)
下面我们以最全面的工厂类进行讲解：DefaultListableBeanFactory
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1691718050902-a1d4c911-d355-416d-86c2-a6ebbe29d58e.png#averageHue=%23202124&clientId=u03ba19c0-a661-4&from=paste&height=627&id=ub6381c14&originHeight=784&originWidth=1371&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=62789&status=done&style=none&taskId=u862d63de-1f5f-4236-9a3d-baa4f310f5c&title=&width=1096.8)
## 2.1 核心类
### 2.1.1 **DefaultListableBeanFactory**

- XmlBeanFactory继承自DefaultListableBeanFactory，DefaultListableBeanFactory是整个bean加载的核心部分，是Spring注册及加载bean的默认实现
- 而对于XmlBeanFactory与DefaultListableBeanFactory不同的地方其实是在XmlBeanFactory中使用了自定义的XML读取器XmlBeanDefinitionReader，实现了个性化的BeanDefinitionReader读取
- DefaultListableBeanFactory继承了AbstractAutowireCapableBeanFactory并实现了ConfigurableListableBeanFactory以及BeanDefinitionRegistry接口。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681117415925-d27b3dfe-242e-45f7-b341-3e050cd332ba.png#averageHue=%232e2e2e&clientId=ub38da42f-4160-4&from=paste&height=602&id=u9a34c96b&originHeight=752&originWidth=1425&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=71187&status=done&style=none&taskId=u3b605b00-5720-4a8a-8970-e2e043bd056&title=&width=1140)
🔷AliasRegistry：定义对alias的简单增删改等操作
🔷SimpleAliasRegistry：主要使用map作为alias的缓存，并对接口AliasRegistry进行实现
🔷SingletonBeanRegistry：定义对单例的注册及获取
🔷BeanFactory：定义获取bean及bean的各种属性
🔷DefaultSingletonBeanRegistry：默认对接口SingletonBeanRegistry各函数的实现
🔷HierarchicalBeanFactory：继承BeanFactory，也就是在BeanFactory定义的功能的基础上增加了对parentFactory的支持
🔷BeanDefinitionRegistry：定义对BeanDefinition的各种增删改操作
🔷FactoryBeanRegistrySupport：在DefaultSingletonBeanRegistry基础上增加了对FactoryBean的特殊处理功能
🔷ConfigurableBeanFactory：提供配置Factory的各种方法
🔷ListableBeanFactory：根据各种条件获取bean的配置清单
🔷AbstractBeanFactory：综合FactoryBeanRegistrySupport和ConfigurationBeanFactory的功能
🔷AutowireCapableBeanFactory：提供创建bean、自动注入、初始化以及应用bean的后处理器
🔷AbstractAutowireCapableBeanFactory：综合AbstractBeanFactory并对接口AutowireCapableBeanFactory进行实现
🔷ConfigurableListableBeanFactory：BeanFactory配置清单，指定忽略类型及接口等
🔷DefaultListableBeanFactory：综合上面所有功能，主要是对Bean注册后的处理XmlBeanFactory对DefaultListableBeanFactory类进行了扩展，主要用于从XML文档中读取BeanDefinition，对于注册及获取Bean都是使用从父类
📌📌
XmlBeanFactory对DefaultListableBeanFactory类进行了扩展，主要用于从XML文档中读取BeanDefinition，对于注册及获取Bean都是使用从父类DefaultListableBeanFactory继承的方法去实现，而唯独与父类不同的个性化实现就是增加了XmlBeanDefinitionReader类型的reader属性，在XmlBeanFactory中主要使用reader属性对资源文件进行读取和注册。
### 2.1.2 XmlBeanDefinitionReader
XML配置文件的读取是Spring中重要的功能，因为Spring的大部分功能都是以配置作为切入点的，那么我们可以从XmlBeanDefinitionReader中梳理一下资源文件读取、解析及注册的大致脉络，首先我们看看各个类的功能。
🔷ResourceLoader：定义资源加载器，主要应用于根据给定的资源文件地址返回对应的Resource。
🔷BeanDefinitionReader：主要定义资源文件读取并转换为BeanDefinition的各个功能。
🔷 EnvironmentCapable：定义获取Environment方法。
🔷DocumentLoader：定义从资源文件加载到转换为Document的功能。
🔷AbstractBeanDefinitionReader：对EnvironmentCapable、BeanDefinitionReader类定义的功能进行实现。
🔷BeanDefinitionDocumentReader：定义读取Docuemnt并注册BeanDefinition功能。
🔷BeanDefinitionParserDelegate：定义解析Element的各种方法。
## 2.2 XmlBeanFactory的源码分析

![XmlBeanFactory_new.svg](https://cdn.nlark.com/yuque/0/2023/svg/12426173/1681119409711-ab8ce988-af55-4fcb-add5-0d78ed39c9d9.svg#clientId=ub38da42f-4160-4&from=paste&height=358&id=uec6d8948&originHeight=447&originWidth=805&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=9696&status=done&style=none&taskId=u751566f9-abbe-4012-9df4-d9e996f1bc4&title=&width=644)
通过时序图我们可以一目了然地看到整个逻辑处理顺序，在测试的BeanFactoryTest中首先调用ClassPathResource的构造函数来构造Resource资源文件的实例对象，这样后续的资源处理就可以用Resource提供的各种服务来操作了，当我们有了Resource后就可以进行XmlBeanFactory的初始化了。那么Resource资源是如何封装的呢？
### 2.2.1 配置文件封装
详细的文章参考上一篇文章，ClassPathResource
```java
new ClassPathResource("spring-config.xml")
```
通过源码我们可以发现，他利用了Jdk的能力或者类加载器来加载资源文件
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681120959784-57a5519e-5241-4992-bedf-7062b4eeeb08.png#averageHue=%232f2c2b&clientId=u4ceeb7ff-0911-4&from=paste&height=551&id=u2479607c&originHeight=689&originWidth=1141&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=104435&status=done&style=none&taskId=u0462bdfc-0f88-4df6-9c93-99ca5d7cdb9&title=&width=912.8)
当通过Resource相关类完成了对配置文件进行封装后配置文件的读取工作就全权交给XmlBeanDefinitionReader来处理了，这里我们可以看到在Spring中对资源这种思想，那我们来总结一下。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681721922506-80a7f5d8-24e7-42f1-95fe-34d9092082e0.png#averageHue=%23505d52&clientId=uc5e05f21-3dc0-4&from=paste&height=693&id=u2001063c&originHeight=866&originWidth=1870&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=219239&status=done&style=none&taskId=u492f2cb2-23f1-41c8-84b9-d7965813686&title=&width=1496)
🌈🌈总结
资源抽象在Spring中是通过Resource接口来实现的。该接口定义了获取资源的一些基本方法，如获取资源的输入流、获取资源的URL等。Spring还提供了许多不同的Resource实现，包括：

1. UrlResource：表示一个URL资源，通过指定一个URL地址来获取资源。
2. ClassPathResource：表示一个类路径下的资源，可以通过类路径下的相对路径或绝对路径来获取资源。
3. FileSystemResource：表示一个文件系统中的资源，可以通过指定文件路径来获取资源。
4. ServletContextResource：表示一个ServletContext中的资源，可以通过指定ServletContext路径来获取资源。

除了上述实现类之外，Spring还提供了许多其他Resource实现，例如ByteArrayResource、InputStreamResource、VfsResource等。
下面我们来看看XmlBeanDefinitionReader的详细处理流程

### 2.2.2 初始化操作
![DefaultListableBeanFactory.drawio.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1691723689534-4286c987-d9d3-40f3-a2fb-26affced9a5e.png#averageHue=%23fbfaf7&clientId=u03ba19c0-a661-4&from=paste&height=1137&id=uce273e0f&originHeight=1421&originWidth=1952&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=1293583&status=done&style=none&taskId=ub0308407-b8fe-4fbc-9889-2d150b8d12e&title=&width=1561.6)
**XmlBeanFactory**
```java
	public XmlBeanFactory(Resource resource) throws BeansException {
		this(resource, null);
	}
```
```java
public XmlBeanFactory(Resource resource, BeanFactory parentBeanFactory) throws BeansException {
		super(parentBeanFactory);
		this.reader.loadBeanDefinitions(resource);
	}
```
我们可以发现他调用了父类的方法，下面我们来看看父类的初始化，我们需要关注到一个方法
**AbstractAutowireCapableBeanFactory**
```java
	public AbstractAutowireCapableBeanFactory() {
		super();
		ignoreDependencyInterface(BeanNameAware.class);
		ignoreDependencyInterface(BeanFactoryAware.class);
		ignoreDependencyInterface(BeanClassLoaderAware.class);
	}
```
这里有必要提及一下ignoreDependencyInterface方法，ignoreDependencyInterface的主要功能是忽略给定接口的自动装配功能，那么，这样做的目的是什么呢？会产生什么样的效果呢？，下面我们来看个案例

- 首先定义一个接口：
```java
package org.springframework.shu.Interface;

import org.springframework.shu.MyTestBean;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/4 11:38
 * @version: 1.0
 */
public interface BeanInterface {
	public void setBean(BeanB beanB);
}
```

- Bean对象
```java
package org.springframework.shu.Interface;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/4 11:52
 * @version: 1.0
 */
@Component
public class BeanB {

}

```
```java
package org.springframework.shu.Interface;

import org.springframework.shu.MyTestBean;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/4 11:52
 * @version: 1.0
 */
public class BeanA implements BeanInterface {

	private BeanB beanB;

	public BeanB getBeanB() {
		return beanB;
	}

	@Override
	public void setBean(BeanB beanB) {
		this.beanB=beanB;
	}
}
```
```java
package org.springframework.shu.Interface;

import org.springframework.beans.factory.annotation.Autowire;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/4 11:57
 * @version: 1.0
 */
@Configuration
public class BeanConfig {

	//开启自动装配
	@Bean(autowire = Autowire.BY_TYPE)
	public BeanA beanA() {
		return new BeanA();
	}
}
```
```java
package org.springframework.shu.Interface;

import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.shu.MyTestBean;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/4 11:34
 * @version: 1.0
 */
@ComponentScan("org.springframework.shu")
public class ignoreDependencyInterfaceTest {
	public static void main(String[] args) {
		AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
		context.register(ignoreDependencyInterfaceTest.class);
		//加了一行代码
		context.getBeanFactory().ignoreDependencyInterface(BeanInterface.class);
		context.refresh();
		BeanA beanA = context.getBean(BeanA.class);
		System.out.println(beanA);
		System.out.println(beanA.getBeanB());

	}
}
```
加了ignoreDependencyInterface（）方法
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681124759780-729e56f5-3f5b-4c3f-8193-4f5ad84f43c4.png#averageHue=%23b7b7a8&clientId=u732d4d8e-7363-4&from=paste&height=352&id=u1c99a98b&originHeight=440&originWidth=1797&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=141092&status=done&style=none&taskId=u8588230e-68cf-41db-bd5b-0226b170bac&title=&width=1437.6)
没加ignoreDependencyInterface方法
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681124822302-de366852-debf-44dd-9442-079e35cee465.png#averageHue=%23b7b7a9&clientId=u732d4d8e-7363-4&from=paste&height=329&id=u90bf8e33&originHeight=411&originWidth=1855&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=128463&status=done&style=none&taskId=u33bb6312-e23f-429a-8fb2-db4cb24baac&title=&width=1484)
我们可以发现它忽略了我们定义的Bean，但是为啥要这样设计？

这个功能的设计旨在解决自动装配过程中可能出现的歧义或不必要的循环依赖问题，具体来说，当一个bean依赖于一个实现了某个接口的另一个bean时，Spring会尝试将这个接口类型的bean注入到依赖方的属性或构造函数参数中。如果存在多个实现了该接口的bean，则Spring可能无法确定应该注入哪一个实现，或者可能会导致不必要的循环依赖问题，为了解决这个问题，Spring引入了ignoreDependencyInterface选项，允许开发人员指定哪些接口类型的bean应该被忽略。当Spring在自动装配bean时遇到这些接口类型的依赖关系时，它将跳过这些依赖关系，而不是尝试注入实现该接口的bean。
```java
@Component
@IgnoreDependencyInterface(Foo.class)
public class MyComponent {
    // ...
}
```
这将告诉Spring在自动装配MyComponent时忽略所有Foo接口的依赖关系。这个功能可以在一定程度上简化自动装配过程，并避免可能的歧义或循环依赖问题。
### 2.2.3 Bean的初始化
上面我们看到了初始化，下面类看看Bean的初始化
![XmlBeanDefinitionReader_loadBeanDefinitions.svg](https://cdn.nlark.com/yuque/0/2023/svg/12426173/1681126443979-cefb079a-d207-42ec-bd27-c013cc43d6e5.svg#clientId=u732d4d8e-7363-4&from=paste&height=916&id=u230b01b3&originHeight=1145&originWidth=961&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=20626&status=done&style=none&taskId=u2ca31671-8c42-4623-9813-43264b9d61d&title=&width=768.8)
从上面的时序图中我们尝试梳理整个的处理过程如下：

- 封装资源文件。当进入XmlBeanDefinitionReader后首先对参数Resource使用EncodedResource类进行封装。
- 获取输入流。从Resource中获取对应的InputStream并构造InputSource。
- 通过构造的InputSource实例和Resource实例继续调用函数doLoadBeanDefinitions。

下面我们来看看吧
**XmlBeanDefinitionReader**
```java
	/**
	 * Load bean definitions from the specified XML file.
	 * @param resource the resource descriptor for the XML file
	 * @return the number of bean definitions found
	 * @throws BeanDefinitionStoreException in case of loading or parsing errors
	 */
	@Override
	public int loadBeanDefinitions(Resource resource) throws BeanDefinitionStoreException {
		return loadBeanDefinitions(new EncodedResource(resource));
	}



```
首先我们可以看到它对我们的资源文件进行了一个编码资源处理
```java
        public int loadBeanDefinitions(EncodedResource encodedResource) throws BeanDefinitionStoreException {
                Assert.notNull(encodedResource, "EncodedResource must not be null");
                if (logger.isInfoEnabled()) {
                      logger.info("Loading XML bean definitions from " + encodedResource. getResource());
                }
            	//通过属性来记录已经加载的资源
                Set<EncodedResource> currentResources = this.resourcesCurrentlyBeingLoaded.get();
                if (currentResources == null) {
                      currentResources = new HashSet<EncodedResource>(4);
                      this.resourcesCurrentlyBeingLoaded.set(currentResources);
                }
                if (!currentResources.add(encodedResource)) {
                      throw new BeanDefinitionStoreException(
                                "Detected cyclic loading of " + encodedResource + " - check your
  import definitions!");
                }
                try {
            		  //从encodedResource中获取已经封装的Resource对象并再次从Resource中获取其中的inputStream
                      InputStream inputStream = encodedResource.getResource().getInputStream();
                      try {
                      //InputSource这个类并不来自于Spring，它的全路径是org.xml.sax.InputSource
                      InputSource inputSource = new InputSource(inputStream);
                      if (encodedResource.getEncoding() != null) {
                            inputSource.setEncoding(encodedResource.getEncoding());
                      }
                      //真正进入了逻辑核心部分
                            return doLoadBeanDefinitions(inputSource, encodedResource.getResource());
                      }
                      finally {
                          //关闭输入流
                          inputStream.close();
                      }
                }
                catch (IOException ex) {
                      throw new BeanDefinitionStoreException(
                              "IOException parsing XML document from " + encodedResource.getResource(), ex);
                }
                finally {
                      currentResources.remove(encodedResource);
                      if (currentResources.isEmpty()) {
                          this.resourcesCurrentlyBeingLoaded.remove();
                      }
                }
        }
```
我们再次整理一下数据准备阶段的逻辑，首先对传入的resource参数做封装，目的是考虑到Resource可能存在编码要求的情况，其次，通过SAX读取XML文件的方式来准备InputSource对象，最后将准备的数据通过参数传入真正的核心处理部doLoadBeanDefinitions(inputSource,encodedResource.getResource())。
**XmlBeanDefinitionReader**
```java
protected int doLoadBeanDefinitions(InputSource inputSource, Resource resource)
			throws BeanDefinitionStoreException {

		try {
			Document doc = doLoadDocument(inputSource, resource);
			int count = registerBeanDefinitions(doc, resource);
			if (logger.isDebugEnabled()) {
				logger.debug("Loaded " + count + " bean definitions from " + resource);
			}
			return count;
		}
		catch (BeanDefinitionStoreException ex) {
			throw ex;
		}
		catch (SAXParseException ex) {
			throw new XmlBeanDefinitionStoreException(resource.getDescription(),
					"Line " + ex.getLineNumber() + " in XML document from " + resource + " is invalid", ex);
		}
		catch (SAXException ex) {
			throw new XmlBeanDefinitionStoreException(resource.getDescription(),
					"XML document from " + resource + " is invalid", ex);
		}
		catch (ParserConfigurationException ex) {
			throw new BeanDefinitionStoreException(resource.getDescription(),
					"Parser configuration exception parsing XML from " + resource, ex);
		}
		catch (IOException ex) {
			throw new BeanDefinitionStoreException(resource.getDescription(),
					"IOException parsing XML document from " + resource, ex);
		}
		catch (Throwable ex) {
			throw new BeanDefinitionStoreException(resource.getDescription(),
					"Unexpected exception parsing XML document from " + resource, ex);
		}
	}
```
其实只做了三件事，这三件事的每一件都必不可少：

1. 获取对XML文件的验证模式。
2. 加载XML文件，并得到对应的Document。
3. 根据返回的Document注册Bean信息。
#### 2.2.3.1 获取XML文件的验证模式
前提知识：DTD和XSD，它们之间什么区别呢？
##### 2.2.3.1.1 DTD
DTD（Document Type Definition）即文档类型定义，是一种XML约束模式语言，是XML文件的验证机制，属于XML文件组成的一部分。DTD是一种保证XML文档格式正确的有效方法，可以通过比较XML文档和DTD文件来看文档是否符合规范，元素和标签使用是否正确。一个DTD文档包含：元素的定义规则，元素间关系的定义规则，元素可使用的属性，可使用的实体或符号规则。
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE beans PUBLIC "-//Spring//DTD BEAN 2.0//EN" "http://www.Springframework. org/dtd/
Spring-beans-2.0.dtd">
<beans>
  ... ...
</beans>
而以Spring为例，具体的Spring-beans-2.0.dtd部分如下：
<!ELEMENT beans (
description?,
(import | alias | bean)*
)>
<!ATTLIST beans default-lazy-init (true | false) "false">
<!ATTLIST beans default-merge (true | false) "false">
<!ATTLIST beans default-autowire (no | byName | byType | constructor | autodetect) "no">
<!ATTLIST beans default-dependency-check (none | objects | simple | all) "none">
<!ATTLIST beans default-init-method CDATA #IMPLIED>
<!ATTLIST beans default-destroy-method CDATA #IMPLIED>
... ...
```
##### 2.2.3.1.2 XSD

- XML Schema语言就是XSD（XML Schemas Definition），XML Schema描述了XML文档的结构，可以用一个指定的XML Schema来验证某个XML文档，以检查该XML文档是否符合其要求，文档设计者可以通过XML Schema指定一个XML文档所允许的结构和内容，并可据此检查一个XML文档是否是有效的，XML Schema本身是一个XML文档，它符合XML语法结构。可以用通用的XML解析器解析它。
- 在使用XML Schema文档对XML实例文档进行检验，除了要声明名称空间外（xmlns=[http://www.Springframework.org/schema/beans](http://www.Springframework.org/schema/beans)），还必须指定该名称空间所对应的XML Schema文档的存储位置。
- 通过schemaLocation属性来指定名称空间所对应的XML Schema文档的存储位置，它包含两个部分，一部分是名称空间的URI，另一部分就是该名称空间所标识的XML Schema文件位置或URL地址（xsi:schemaLocation="[http://www.Springframework.org/schema/beans](http://www.Springframework.org/schema/beans) [http://www.](http://www.) Springframework.org/schema/beans/Spring-beans.xsd）
```xml
        <?xml version="1.0" encoding="UTF-8" standalone="no"?>
        <xsd:schema xmlns="http://www.Springframework.org/schema/beans"
                xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                targetNamespace="http://www.Springframework.org/schema/beans">
            <xsd:import namespace="http://www.w3.org/XML/1998/namespace"/>
            <xsd:annotation>
                <xsd:documentation><![CDATA[
            ... ...
                ]]></xsd:documentation>
            </xsd:annotation>
            <!-- base types -->
            <xsd:complexType name="identifiedType" abstract="true">
                <xsd:annotation>
                      <xsd:documentation><![CDATA[
            The unique identifier for a bean. The scope of the identifier
            is the enclosing bean factory.
                      ]]></xsd:documentation>
                </xsd:annotation>
                <xsd:attribute name="id" type="xsd:ID">
                      <xsd:annotation>
                          <xsd:documentation><![CDATA[
            The unique identifier for a bean.
                            ]]></xsd:documentation>
                      </xsd:annotation>
                </xsd:attribute>
            </xsd:complexType>
            ... ...
        </xsd:schema>
```
总结：
DTD和XSD都是XML文档的验证机制，用于定义XML文档的结构和内容约束，但它们之间有几个重要的区别：

1. 语法：DTD使用一种比较简单的语法，而XSD使用XML语法。由于XSD使用XML语法，因此它更加灵活和可扩展，可以定义更复杂的数据类型和结构。
2. 功能：XSD提供比DTD更多的功能，例如：命名空间、数据类型、限制、继承等。这使得XSD更加适合处理大型、复杂的XML文档。
3. 可读性：由于XSD使用XML语法，因此相对于DTD来说，XSD更容易阅读和理解。XSD还提供了更好的文档化支持，可以通过注释等方式对XSD进行说明。
4. 兼容性：DTD比XSD更容易在不同的XML解析器之间进行兼容，因为DTD是在XML标准制定之前就被广泛使用的。但是，XSD相对于DTD提供更好的数据类型支持和扩展性，这使得它更加适合处理复杂的XML文档。
##### 2.2.3.1.3 分析
**XmlBeanDefinitionReader**
```java
        protected int getValidationModeForResource(Resource resource) {
                int validationModeToUse = getValidationMode();
                //如果手动指定了验证模式则使用指定的验证模式
                if (validationModeToUse != VALIDATION_AUTO) {
                      return validationModeToUse;
                }
                //如果未指定则使用自动检测
                int detectedMode = detectValidationMode(resource);
                if (detectedMode != VALIDATION_AUTO) {
                      return detectedMode;
                }
                return VALIDATION_XSD;
        }
```
手动指定模式可以调用XmlBeanDefinitionReader中的setValidationMode方法进行设定），否则使用自动检测的方式，我们来看看自动检测的源码
```java
public int detectValidationMode(InputStream inputStream) throws IOException {
BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
    try {
        boolean isDtdValidated = false;
        String content;
      while ((content = reader.readLine()) != null) {
            content = consumeCommentTokens(content);
            //如果读取的行是空或者是注释则略过
            if (this.inComment || !StringUtils.hasText(content)) {
                 continue;
                }
            if (hasDoctype(content)) {
                    isDtdValidated = true;
                    break;
            }
            //读取到<开始符号，验证模式一定会在开始符号之前
            if (hasOpeningTag(content)) {
                 break;
                          }
                      }
             return (isDtdValidated ? VALIDATION_DTD : VALIDATION_XSD);
                }
                catch (CharConversionException ex) {
                      // Choked on some character encoding...
                      // Leave the decision up to the caller.
                      return VALIDATION_AUTO;
                }
                finally {
                      reader.close();
                }
        }
            private boolean hasDoctype(String content) {
                      return (content.indexOf(DOCTYPE) > -1);
         }
```
该方法的主要作用是根据输入流中的内容来检测XML文档的验证模式，即 DTD 验证还是 XSD 验证。方法中首先创建一个 BufferedReader 对象来读取输入流中的内容。然后，该方法会一行一行地读取输入流中的内容，并检查每行中是否包含 DOCTYPE 声明或 XML 标签的开头。如果找到了 DOCTYPE 声明，该方法将认为文档采用 DTD 验证模式。如果找到了 XML 标签的开头，该方法将认为文档采用 XSD 验证模式。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681722888954-6cc2838e-ef73-484f-af8b-6e110ad90a06.png#averageHue=%234a554b&clientId=uc5e05f21-3dc0-4&from=paste&height=640&id=ud2c7a5ea&originHeight=800&originWidth=1860&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=219553&status=done&style=none&taskId=u392e14e6-67ca-4d62-b19d-9302c51d50f&title=&width=1488)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681722926445-89962f83-e989-4a0a-ad7b-e884035509d6.png#averageHue=%234a554a&clientId=uc5e05f21-3dc0-4&from=paste&height=586&id=u6f2528a4&originHeight=733&originWidth=1788&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=184263&status=done&style=none&taskId=uc8f478e6-333f-45e4-b8f8-1ea36b8e36d&title=&width=1430.4)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681723011489-0cdc5eda-05a6-47e6-b9af-8741e58d11e8.png#averageHue=%2349554a&clientId=uc5e05f21-3dc0-4&from=paste&height=624&id=u96a857bb&originHeight=780&originWidth=1831&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=189064&status=done&style=none&taskId=u5d7ea53b-7751-4b7a-8d0b-77d9d3da49d&title=&width=1464.8)
我们来总结一下验证XML的验证模式步骤：
🔷尝试获取XML的验证模式
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681180952922-1c149d61-5793-4588-8517-49821af095ef.png#averageHue=%232c2c2b&clientId=uff31eff0-69c2-4&from=paste&height=503&id=uf839c98c&originHeight=629&originWidth=1169&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=101198&status=done&style=none&taskId=ueebc355f-9b56-4b5b-a52d-4f50c018c7f&title=&width=935.2)
🔷利用流数据来读取开头文件来判断是那种XML验证模式
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681181024130-884924d3-303f-4c4f-84a6-74a1efadb7a5.png#averageHue=%232d2c2b&clientId=uff31eff0-69c2-4&from=paste&height=672&id=ud4b6b6ec&originHeight=840&originWidth=1124&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=131923&status=done&style=none&taskId=u6ba0490e-de90-40ae-be2a-7632cbad4ff&title=&width=899.2)
##### 2.2.3.1.4 EntityResolver
在我们的DocumentLoader#loadDocument的接口中我们需要注意到一个入参，EntityResolver，那EntityResolver的作用是啥？
```java

/**
 * DocumentLoader接口
 */
public interface DocumentLoader {


	/**
	 * 加载Document接口
	 * @param inputSource 输入源
	 * @param entityResolver 实体解析器
	 * @param errorHandler 错误处理器
	 * @param validationMode 验证模式
	 * @param namespaceAware 是否支持命名空间
	 * @return
	 * @throws Exception
	 */
	Document loadDocument(
			InputSource inputSource, EntityResolver entityResolver,
			ErrorHandler errorHandler, int validationMode, boolean namespaceAware)
			throws Exception;

}

```
EntityResolver的作用是项目本身就可以提供一个如何寻找DTD声明的方法，即由程序来实现寻找DTD声明的过程，比如我们将DTD文件放到项目中某处，在实现时直接将此文档读取并返回给SAX即可，这样就避免了通过网络来寻找相应的声明。
```java
	/**
	 *  获取实体解析器
	 * @return
	 */
	protected EntityResolver getEntityResolver() {
		// 如果实体解析器为空，则创建一个默认的实体解析器
		if (this.entityResolver == null) {
			// Determine default EntityResolver to use.
			// 获取资源加载器
			ResourceLoader resourceLoader = getResourceLoader();
			if (resourceLoader != null) {
				// 创建一个资源实体解析器
				this.entityResolver = new ResourceEntityResolver(resourceLoader);
			}
			else {
				// 创建一个委托实体解析器
				this.entityResolver = new DelegatingEntityResolver(getBeanClassLoader());
			}
		}
		return this.entityResolver;
	}
```
首先我们来看看EntityResolver接口
**EntityResolver**
```java
  public abstract InputSource resolveEntity (String publicId,
                                               String systemId)
        throws SAXException, IOException;
```
这里，它接收两个参数publicId和systemId，并返回一个inputSource对象。这里我们以特定配置文件来进行讲解。
**DelegatingEntityResolver**
```java

	/**
	 * 创建一个新的DelegatingEntityResolver，它委托给一个默认的BeansDtdResolver和一个默认的PluggableSchemaResolver。
	 * @param classLoader
	 */
	public DelegatingEntityResolver(@Nullable ClassLoader classLoader) {
		this.dtdResolver = new BeansDtdResolver();
		this.schemaResolver = new PluggableSchemaResolver(classLoader);
	}
```
```java

	/**
	 * 在这个方法实现中，resolveEntity方法接受两个参数：publicId和systemId，
	 * 分别表示正在解析的实体的公共标识符和系统标识符。该方法首先检查systemId参数是否为非空。
	 * 如果它不是空，并以.dtd后缀结尾，它将代理实体解析到名为dtdResolver的DTDResolver实例，
	 * 将publicId和systemId参数传递给它。
	 * 类似地，如果systemId以.xsd后缀结尾，它将代理实体解析到名为schemaResolver的SchemaResolver实例，
	 * 将publicId和systemId参数传递给它。
	 * 如果systemId不以.dtd或.xsd结尾，则方法返回null，这将导致解析器返回默认实体解析行为。
	 * 方法签名中的@Nullable注释表示其中一个或两个参数可以为空。如果实体解析过程中发生错误，
	 * 该方法可能会抛出SAXException或IOException。
	 * @param publicId The public identifier of the external entity
	 *        being referenced, or null if none was supplied.
	 * @param systemId The system identifier of the external entity
	 *        being referenced.
	 * @return
	 * @throws SAXException
	 * @throws IOException
	 */
	@Override
	@Nullable
	public InputSource resolveEntity(@Nullable String publicId, @Nullable String systemId)
			throws SAXException, IOException {
		// 系统标识符不为空
		if (systemId != null) {
			// 如果以.dtd结尾
			if (systemId.endsWith(DTD_SUFFIX)) {
				// 代理实体解析到名为dtdResolver的DTDResolver实例
				return this.dtdResolver.resolveEntity(publicId, systemId);
			}
			// 如果以.xsd结尾
			else if (systemId.endsWith(XSD_SUFFIX)) {
				// 代理实体解析到名为schemaResolver的SchemaResolver实例
				return this.schemaResolver.resolveEntity(publicId, systemId);
			}
		}

		// Fall back to the parser's default behavior.
		return null;
	}
```
对不同的验证模式，Spring使用了不同的解析器解析。这里简单描述一下原理，比如加载DTD类型的BeansDtdResolver的resolveEntity是直接截取systemId最后的xx.dtd然后去当前路径下寻找，而加载XSD类型的PluggableSchemaResolver类的resolveEntity是默认到META-INF/Spring.schemas文件中找到systemid所对应的XSD文件并加载。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1688089043831-3dba783a-5cf4-429f-8abd-b6166437e02c.png#averageHue=%2326282c&clientId=uc33e4e79-3e11-4&from=paste&height=824&id=ud2a295c3&originHeight=1030&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=523801&status=done&style=none&taskId=u740f5ef6-b585-486f-8ae2-f32059d5e58&title=&width=1536)
#### 2.2.3.2 获取Document
经过了上面验证模式的获取，我们回到第二步Docment的文档的获取
**XmlBeanDefinitionReader**
```java
/**
	 * 使用配置的DocumentLoader实际加载指定的文档。
	 * @param inputSource the SAX InputSource to read from
	 * @param resource the resource descriptor for the XML file
	 * @return
	 * @throws Exception
	 */
	protected Document doLoadDocument(InputSource inputSource, Resource resource) throws Exception {
		// 使用配置的DocumentLoader实际加载指定的文档。
		return this.documentLoader.loadDocument(inputSource, getEntityResolver(), this.errorHandler, getValidationModeForResource(resource), isNamespaceAware());
	}
```
通过源码我们可以发现它调用了DocumentLoader来家长Docment文件，那我们首先来看看DocumentLoader接口
**DocumentLoader**
```java
/**
 * DocumentLoader接口
 */
public interface DocumentLoader {


	/**
	 * 加载Document接口
	 * @param inputSource 输入源
	 * @param entityResolver 实体解析器
	 * @param errorHandler 错误处理器
	 * @param validationMode 验证模式
	 * @param namespaceAware 是否支持命名空间
	 * @return
	 * @throws Exception
	 */
	Document loadDocument(
			InputSource inputSource, EntityResolver entityResolver,
			ErrorHandler errorHandler, int validationMode, boolean namespaceAware)
			throws Exception;

}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681181397960-54607f4c-c863-4d29-adc7-90b2c51f7ab5.png#averageHue=%232d2d2c&clientId=uff31eff0-69c2-4&from=paste&height=355&id=ueef54d12&originHeight=444&originWidth=604&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=8811&status=done&style=none&taskId=ubed74ced-0e0c-4b65-9378-f3d3ae18026&title=&width=483.2)
我们可以看到他只有一个实现，那我们来看看他的具体源码吧
**DefaultDocumentLoader**
```java

	/**
	 * 加载Document
	 * @param inputSource 输入源
	 * @param entityResolver 实体解析器
	 * @param errorHandler 错误处理器
	 * @param validationMode 验证模式
	 * @param namespaceAware 是否支持命名空间
	 * @return
	 * @throws Exception
	 */
	@Override
	public Document loadDocument(InputSource inputSource, EntityResolver entityResolver,
			ErrorHandler errorHandler, int validationMode, boolean namespaceAware) throws Exception {
		// 创建DocumentBuilderFactory
		DocumentBuilderFactory factory = createDocumentBuilderFactory(validationMode, namespaceAware);
		if (logger.isTraceEnabled()) {
			logger.trace("Using JAXP provider [" + factory.getClass().getName() + "]");
		}
		// 创建DocumentBuilder
		DocumentBuilder builder = createDocumentBuilder(factory, entityResolver, errorHandler);
		// 解析XML文档
		return builder.parse(inputSource);
	}
```
我们一步一步来分析，首先来看看DocumentBuilderFactory的创建
**DefaultDocumentLoader**
```java
/**
	 * 创建DocumentBuilderFactory
	 * 这段代码创建并配置一个用于解析XML文档的DocumentBuilderFactory对象，并根据提供的参数进行相应的配置。
	 * 具体而言，它将命名空间设置为给定的值，将验证模式设置为给定的值（如果验证模式不是“无”），
	 * 并在需要时将其标记为启用验证（如果验证模式是XSD，则使用XSD验证）。
	 * 如果该方法无法为当前的JAXP提供程序设置所需的属性，则会抛出ParserConfigurationException异常。
	 * 最后，它将返回配置后的DocumentBuilderFactory对象，供XML解析器使用。
	 * @param validationMode  验证模式
	 * @param namespaceAware 是否支持命名空间
	 * @return
	 * @throws ParserConfigurationException
	 */
	protected DocumentBuilderFactory createDocumentBuilderFactory(int validationMode, boolean namespaceAware)
			throws ParserConfigurationException {
		// 创建DocumentBuilderFactory
		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		// 设置命名空间
		factory.setNamespaceAware(namespaceAware);
		// 设置验证模式: 无、DTD、XSD
		if (validationMode != XmlValidationModeDetector.VALIDATION_NONE) {
			factory.setValidating(true);
			// XSD验证
			if (validationMode == XmlValidationModeDetector.VALIDATION_XSD) {
				// Enforce namespace aware for XSD...
				factory.setNamespaceAware(true);
				try {
					//
					factory.setAttribute(SCHEMA_LANGUAGE_ATTRIBUTE, XSD_SCHEMA_LANGUAGE);
				}
				catch (IllegalArgumentException ex) {
					ParserConfigurationException pcex = new ParserConfigurationException(
							"Unable to validate using XSD: Your JAXP provider [" + factory +
							"] does not support XML Schema. Are you running on Java 1.4 with Apache Crimson? " +
							"Upgrade to Apache Xerces (or Java 1.5) for full XSD support.");
					pcex.initCause(ex);
					throw pcex;
				}
			}
		}

		return factory;
	}

```
创建DocumentBuilder
**DefaultDocumentLoader**
```java
/**
	 * 创建DocumentBuilder
	 * @param factory
	 * @param entityResolver
	 * @param errorHandler
	 * @return
	 * @throws ParserConfigurationException
	 */
	protected DocumentBuilder createDocumentBuilder(DocumentBuilderFactory factory,
			@Nullable EntityResolver entityResolver, @Nullable ErrorHandler errorHandler)
			throws ParserConfigurationException {
		// 创建DocumentBuilder
		DocumentBuilder docBuilder = factory.newDocumentBuilder();
		// 设置实体解析器
		if (entityResolver != null) {
			docBuilder.setEntityResolver(entityResolver);
		}
		// 设置错误处理器
		if (errorHandler != null) {
			docBuilder.setErrorHandler(errorHandler);
		}
		// 返回DocumentBuilder
		return docBuilder;
	}
```
解析Xml为Document对象主要依靠了Java XML API 的方法，下面我们来看个案例：
```java
package org.springframework.shu.resource;


import org.w3c.dom.Document;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.io.StringReader;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/11 11:25
 * @version: 1.0
 */
public class DocmentTest {
	public static void main(String[] args) throws ParserConfigurationException, IOException, SAXException {
		String xmlString = "<example><item>1</item><item>2</item></example>";
		InputSource inputSource = new InputSource(new StringReader(xmlString));
		DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
		DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
		Document doc = dBuilder.parse(String.valueOf(inputSource));
		System.out.println(doc);
	}
}

```
当调用 DocumentBuilder.parse(InputSource is) 方法时，它会从给定的 InputSource 中读取 XML 数据，并将其解析为一个 Document 对象，更多详细知识去百度吧，我们回到前面的的分析，我们要关注一个类EntityResolver
我们来看看他的源码：
**XmlBeanDefinitionReader**
```java
	/**
	 *  获取实体解析器
	 * @return
	 */
	protected EntityResolver getEntityResolver() {
		// 如果实体解析器为空，则创建一个默认的实体解析器
		if (this.entityResolver == null) {
			// Determine default EntityResolver to use.
			// 获取资源加载器
			ResourceLoader resourceLoader = getResourceLoader();
			if (resourceLoader != null) {
				// 创建一个资源实体解析器
				this.entityResolver = new ResourceEntityResolver(resourceLoader);
			}
			else {
				// 创建一个委托实体解析器
				this.entityResolver = new DelegatingEntityResolver(getBeanClassLoader());
			}
		}
		return this.entityResolver;
	}
```
**DelegatingEntityResolver**
```java
/**
	 * 在这个方法实现中，resolveEntity方法接受两个参数：publicId和systemId，
	 * 分别表示正在解析的实体的公共标识符和系统标识符。该方法首先检查systemId参数是否为非空。
	 * 如果它不是空，并以.dtd后缀结尾，它将代理实体解析到名为dtdResolver的DTDResolver实例，
	 * 将publicId和systemId参数传递给它。
	 * 类似地，如果systemId以.xsd后缀结尾，它将代理实体解析到名为schemaResolver的SchemaResolver实例，
	 * 将publicId和systemId参数传递给它。
	 * 如果systemId不以.dtd或.xsd结尾，则方法返回null，这将导致解析器返回默认实体解析行为。
	 * 方法签名中的@Nullable注释表示其中一个或两个参数可以为空。如果实体解析过程中发生错误，
	 * 该方法可能会抛出SAXException或IOException。
	 * @param publicId The public identifier of the external entity
	 *        being referenced, or null if none was supplied.
	 * @param systemId The system identifier of the external entity
	 *        being referenced.
	 * @return
	 * @throws SAXException
	 * @throws IOException
	 */
	@Override
	@Nullable
	public InputSource resolveEntity(@Nullable String publicId, @Nullable String systemId)
			throws SAXException, IOException {
		// 系统标识符不为空
		if (systemId != null) {
			// 如果以.dtd结尾
			if (systemId.endsWith(DTD_SUFFIX)) {
				// 代理实体解析到名为dtdResolver的DTDResolver实例
				return this.dtdResolver.resolveEntity(publicId, systemId);
			}
			// 如果以.xsd结尾
			else if (systemId.endsWith(XSD_SUFFIX)) {
				// 代理实体解析到名为schemaResolver的SchemaResolver实例
				return this.schemaResolver.resolveEntity(publicId, systemId);
			}
		}

		// Fall back to the parser's default behavior.
		return null;
	}
```
我们可以看到，对不同的验证模式，Spring使用了不同的解析器解析，这里简单描述一下原理，比如加载DTD类型的BeansDtdResolver的resolveEntity是直接截取systemId最后的xx.dtd然后去当前路径下寻找，而加载XSD类型的PluggableSchemaResolver类的resolveEntity是默认到META-INF/Spring.schemas文件中找到systemid所对应的XSD文件并加载。
**BeansDtdResolver**
```java
@Override
	@Nullable
	public InputSource resolveEntity(@Nullable String publicId, @Nullable String systemId) throws IOException {
		if (logger.isTraceEnabled()) {
			logger.trace("Trying to resolve XML entity with public ID [" + publicId +
					"] and system ID [" + systemId + "]");
		}

		if (systemId != null && systemId.endsWith(DTD_EXTENSION)) {
			int lastPathSeparator = systemId.lastIndexOf('/');
			int dtdNameStart = systemId.indexOf(DTD_NAME, lastPathSeparator);
			if (dtdNameStart != -1) {
				String dtdFile = DTD_NAME + DTD_EXTENSION;
				if (logger.isTraceEnabled()) {
					logger.trace("Trying to locate [" + dtdFile + "] in Spring jar on classpath");
				}
				try {
					Resource resource = new ClassPathResource(dtdFile, getClass());
					InputSource source = new InputSource(resource.getInputStream());
					source.setPublicId(publicId);
					source.setSystemId(systemId);
					if (logger.isTraceEnabled()) {
						logger.trace("Found beans DTD [" + systemId + "] in classpath: " + dtdFile);
					}
					return source;
				}
				catch (FileNotFoundException ex) {
					if (logger.isDebugEnabled()) {
						logger.debug("Could not resolve beans DTD [" + systemId + "]: not found in classpath", ex);
					}
				}
			}
		}

		// Fall back to the parser's default behavior.
		return null;
	}
```
#### 2.2.3.3  解析及注册BeanDefinitions
我们前面两步都分析完了，拿到了Document后，接下来的提取及注册bean就是我们的重头戏。
**XmlBeanDefinitionReader**
```java
/**
	 * 真正从指定的XML文件加载bean定义
	 * @param inputSource the SAX InputSource to read from
	 * @param resource the resource descriptor for the XML file
	 * @return
	 * @throws BeanDefinitionStoreException
	 */
	protected int doLoadBeanDefinitions(InputSource inputSource, Resource resource)
			throws BeanDefinitionStoreException {
		try {
			// 创建一个Document对象
			Document doc = doLoadDocument(inputSource, resource);
			// 注册bean定义
			int count = registerBeanDefinitions(doc, resource);
			if (logger.isDebugEnabled()) {
				logger.debug("Loaded " + count + " bean definitions from " + resource);
			}
			return count;
		}
		catch (BeanDefinitionStoreException ex) {
			throw ex;
		}
		catch (SAXParseException ex) {
			throw new XmlBeanDefinitionStoreException(resource.getDescription(),
					"Line " + ex.getLineNumber() + " in XML document from " + resource + " is invalid", ex);
		}
		catch (SAXException ex) {
			throw new XmlBeanDefinitionStoreException(resource.getDescription(),
					"XML document from " + resource + " is invalid", ex);
		}
		catch (ParserConfigurationException ex) {
			throw new BeanDefinitionStoreException(resource.getDescription(),
					"Parser configuration exception parsing XML from " + resource, ex);
		}
		catch (IOException ex) {
			throw new BeanDefinitionStoreException(resource.getDescription(),
					"IOException parsing XML document from " + resource, ex);
		}
		catch (Throwable ex) {
			throw new BeanDefinitionStoreException(resource.getDescription(),
					"Unexpected exception parsing XML document from " + resource, ex);
		}
	}
```
我们来查看关键代码：int count = registerBeanDefinitions(doc, resource)
```java
    public int registerBeanDefinitions(Document doc, Resource resource) throws BeanDefinitionStore
    Exception {
         //使用DefaultBeanDefinitionDocumentReader实例化BeanDefinitionDocumentReader
         BeanDefinitionDocumentReader documentReader = createBeanDefinitionDocumentReader();
        //将环境变量设置其中
        documentReader.setEnvironment(this.getEnvironment());
        //在实例化 BeanDefinitionReader 时候会将 BeanDefinitionRegistry 传入，默认使用继承自
   	 DefaultListableBeanFactory的子类
     //记录统计前BeanDefinition的加载个数
         int countBefore = getRegistry().getBeanDefinitionCount();
        //加载及注册bean
         documentReader.registerBeanDefinitions(doc, createReaderContext(resource));
        //记录本次加载的BeanDefinition个数
    return getRegistry().getBeanDefinitionCount() - countBefore;
        }
```
首先我们来看他的实例化，就是利用反射技术来实现DefaultBeanDefinitionDocumentReader的初始化
**XmlBeanDefinitionReader**
```java
	/**
	 * 创建一个BeanDefinitionDocumentReader对象
	 * @return
	 */
	protected BeanDefinitionDocumentReader createBeanDefinitionDocumentReader() {
		return BeanUtils.instantiateClass(this.documentReaderClass);
	}

```
**BeanUtils**
```java
/**
	 * 实例化一个类，使用它的无参构造函数，并将新实例作为指定的可分配类型返回。
	 * @param clazz
	 * @return
	 * @param <T>
	 * @throws BeanInstantiationException
	 */
	public static <T> T instantiateClass(Class<T> clazz) throws BeanInstantiationException {
		Assert.notNull(clazz, "Class must not be null");
		// 如果是接口，抛出异常
		if (clazz.isInterface()) {
			throw new BeanInstantiationException(clazz, "Specified class is an interface");
		}
		try {
			return instantiateClass(clazz.getDeclaredConstructor());
		}
		catch (NoSuchMethodException ex) {
			Constructor<T> ctor = findPrimaryConstructor(clazz);
			if (ctor != null) {
				return instantiateClass(ctor);
			}
			throw new BeanInstantiationException(clazz, "No default constructor found", ex);
		}
		catch (LinkageError err) {
			throw new BeanInstantiationException(clazz, "Unresolvable class definition", err);
		}
	}
```

- 上面我们可以发现它首先利用反射来实例化创建一个BeanDefinitionDocumentReader对象
- 获取注册之前的Bean数量
- 进行Bean注册
- 返回本次Bean注册的数量

我们重点来关注一下Bean注册
```java
	/**
	 * 该实现根据“spring-beans”XSD(或者历史上的DTD)解析bean定义。
	 * 打开一个DOM文档;然后初始化<beans/>级别指定的默认设置;然后解析包含的bean定义。
	 * @param doc the DOM document
	 * @param readerContext the current context of the reader
	 * (includes the target registry and the resource being parsed)
	 */
	@Override
	public void registerBeanDefinitions(Document doc, XmlReaderContext readerContext) {
		this.readerContext = readerContext;
        // 调用方法
		doRegisterBeanDefinitions(doc.getDocumentElement());
	}
```
如果说以前一直是XML加载解析的准备阶段，那么doRegisterBeanDefinitions算是真正地开始进行解析了，我们期待的核心部分真正开始了。
**DefaultBeanDefinitionDocumentReader**
```java
/**
	 * 注册bean定义，从给定的根{@code <beans/>}元素开始。
	 * @param root
	 */
	@SuppressWarnings("deprecation")  // for Environment.acceptsProfiles(String...)
	protected void doRegisterBeanDefinitions(Element root) {
		// 获取父类的BeanDefinitionParserDelegate
		BeanDefinitionParserDelegate parent = this.delegate;
		// 创建BeanDefinitionParserDelegate
		this.delegate = createDelegate(getReaderContext(), root, parent);
		// 如果根元素的命名空间是默认的命名空间，且根元素的profile属性不为空
		if (this.delegate.isDefaultNamespace(root)) {
			// 获取profile属性值
			String profileSpec = root.getAttribute(PROFILE_ATTRIBUTE);
			// 如果profile属性值不为空
			if (StringUtils.hasText(profileSpec)) {
				// 将profile属性值按照逗号分隔符分割成数组
				String[] specifiedProfiles = StringUtils.tokenizeToStringArray(
						profileSpec, BeanDefinitionParserDelegate.MULTI_VALUE_ATTRIBUTE_DELIMITERS);
				// 如果当前环境不包含指定的profile属性值
				if (!getReaderContext().getEnvironment().acceptsProfiles(specifiedProfiles)) {
					if (logger.isDebugEnabled()) {
						logger.debug("Skipped XML bean definition file due to specified profiles [" + profileSpec +
								"] not matching: " + getReaderContext().getResource());
					}
					return;
				}
			}
		}
		// 解析前置处理
		preProcessXml(root);
		// 解析BeanDefinition
		parseBeanDefinitions(root, this.delegate);
		// 解析后置处理
		postProcessXml(root);
		// 将父类的BeanDefinitionParserDelegate赋值给当前的BeanDefinitionParserDelegate
		this.delegate = parent;
	}
```

- 具体来说，该方法会先获取父类的 BeanDefinitionParserDelegate，然后创建一个新的 BeanDefinitionParserDelegate，将其作为当前解析的代理，用于处理当前根元素的子元素。
- 接着，该方法会检查根元素的命名空间是否为默认命名空间，并且是否有 profile 属性。如果有，则解析该属性，如果当前环境中没有与之匹配的 profile，则跳过该 XML 配置文件的解析。
- 然后，该方法会执行一些解析前置处理、解析 BeanDefinition、解析后置处理的操作，最后将当前解析代理重新设置为父类的 BeanDefinitionParserDelegate。
- 总之，该方法的作用是解析 XML 配置文件，并注册 Bean 的定义。其中，对于不匹配的 profile，会直接跳过解析。

首先我们来看看profile的配置
##### 2.2.3.3.1 profile配置
```xml
<beans xmlns="http://www.Springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  xmlns:jdbc="http://www.
  Springframework.org/schema/jdbc"
  xmlns:jee="http://www.Springframework.org/schema/jee"
  xsi:schemaLocation="...">
  ... ...
  <beans profile="dev">
    ... ...
  </beans>
  <beans profile="production">
    ... ...
  </beans>
</beans>
```
了解了profile的使用再来分析代码会清晰得多，首先程序会获取beans节点是否定义了profile属性，如果定义了则会需要到环境变量中去寻找，所以这里首先断言environment不可能为空，因为profile是可以同时指定多个的，需要程序对其拆分，并解析每个profile是都符合环境变量中所定义的，不定义则不会浪费性能去解析。
##### 2.2.3.3.2 解析注册BeanDefinition
处理了profile后就可以进行XML的读取了
```java
protected void parseBeanDefinitions(Element root, BeanDefinitionParserDelegate delegate) {
    if (delegate.isDefaultNamespace(root)) {
        NodeList nl = root.getChildNodes();
        for (int i = 0; i < nl.getLength(); i++) {
            Node node = nl.item(i);
            if (node instanceof Element) {
                Element ele = (Element) node;
                if (delegate.isDefaultNamespace(ele)) {
                    parseDefaultElement(ele, delegate);
                }
                else {
                    delegate.parseCustomElement(ele);
                }
            }
        }
    }
    else {
        delegate.parseCustomElement(root);
    }
}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681871667638-2ef82ff7-f78c-43cb-9291-84151bceeb70.png#averageHue=%234b584c&clientId=u454fdd1b-c64f-4&from=paste&height=681&id=u793b5c1f&originHeight=851&originWidth=1822&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=249534&status=done&style=none&taskId=ud8c4da97-3837-4af9-964d-fb75dc21276&title=&width=1457.6)

- 该方法的主要作用是解析XML文件中的Bean定义，并通过BeanDefinitionParserDelegate实例来完成这个任务
- 它首先检查XML文件的命名空间，如果是默认命名空间，则解析XML文件中的每个Bean定义
- 否则，它将使用BeanDefinitionParserDelegate实例来解析XML文件中的所有其他元素。在解析过程中，它将根据元素的命名空间来选择使用默认解析方法还是自定义解析方法。
- 最终，解析结果将作为BeanDefinition对象存储在Spring IoC容器中，供应用程序使用。
1. 因为在Spring的XML配置里面有两大类Bean声明，一个是默认的，
```java
        <bean id="test" class="test.TestBean"/>
```

2. 另一类就是自定义的
```java
        <tx:annotation-driven/>
```

3. 两种方式的读取及解析差别是非常大的，如果采用Spring默认的配置，Spring当然知道该怎么做，但是如果是自定义的，那么就需要用户实现一些接口及配置了。

上面我们获取到了Docment对象，下面主要针对里面的节点信息进行解析，下一篇文章我们来看对节点信息进行具体的解析，最后我们来总结一些上面的源码分析过程

