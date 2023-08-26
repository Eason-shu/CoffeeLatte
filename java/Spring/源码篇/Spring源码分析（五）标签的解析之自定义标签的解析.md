---

title: Spring源码分析 （五）标签的解析之自定义标签的解析
sidebar_position: 4
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
  date: 2023-8-25 23:00:00
  author: EasonShu

---

本图：川西旅游中拍摄的（业余摄影）
官网：[Home](https://spring.io/)
参考书籍：[Spring源码深度解析-郝佳编著-微信读书](https://weread.qq.com/web/bookDetail/0e232b205b260a0e29f3fb5)
参考文章：[Spring IoC之存储对象BeanDefinition](https://zhuanlan.zhihu.com/p/107834587)
上一篇文章我们介绍了Bean默认标签的解析，下面我们来看看自定义标签的解析，首先让我们回到关键代码
**DefaultBeanDefinitionDocumentReader**
```java
protected void parseBeanDefinitions(Element root, BeanDefinitionParserDelegate delegate) {
		// 判断根节点使用的标签所对应的命名空间是否为Spring提供的默认命名空间，
		// 这里根节点为beans节点，该节点的命名空间通过其xmlns属性进行了定义
		if (delegate.isDefaultNamespace(root)) {
			NodeList nl = root.getChildNodes();
			for (int i = 0; i < nl.getLength(); i++) {
				Node node = nl.item(i);
				if (node instanceof Element) {
					Element ele = (Element) node;
					// 使用默认的命名空间解析，这里的默认命名空间为http://www.springframework.org/schema/beans
					if (delegate.isDefaultNamespace(ele)) {
						logger.info("root child node is "+ ele.getNodeName());
						parseDefaultElement(ele, delegate);
					}
					// 使用自定义的命名空间解析， 这里的自定义命名空间为http://www.springframework.org/schema/context
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
在介绍如何解析自定义标签之前，我们首先来看看我们在Spring中如何自定义标签
# 一 自定义标签的使用

- 在很多情况下，我们需要为系统提供可配置化支持，简单的做法可以直接基于Spring的标准bean来配置，但配置较为复杂或者需要更多丰富控制的时候，会显得非常笨拙
- Spring提供了可扩展Schema的支持，这是一个不错的折中方案，扩展Spring自定义标签配置大致需要以下几个步骤（前提是要把Spring的Core包加入项目中）

大体步骤如下：

1. 创建一个需要扩展的组件。
2. 定义一个XSD文件描述组件内容。
3.  创建一个文件，实现BeanDefinitionParser接口，用来解析XSD文件中的定义和组件定义。
4. 创建一个Handler文件，扩展自NamespaceHandlerSupport，目的是将组件注册到Spring容器。
5. 编写Spring.handlers和Spring.schemas文件。

我们来个案例：
参考教程：[【Spring学习】Spring自定义标签详细步骤 - 掘金](https://juejin.cn/post/7207065292025937957#heading-6)

- 首先我们创建一个普通的POJO
```java
package org.springframework.shu.my;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/21 9:34
 * @version: 1.0
 */
public class User {
	private String userName;
	private String id;
	private String email
    // 省略Getter与Setter方法
}

```

- 定义一个XSD文件描述组件内容
```xml
<?xml version="1.0" encoding="UTF-8"?>
<schema xmlns="http://www.w3.org/2001/XMLSchema"
  targetNamespace="http://www.lexueba.com/schema/user"
  xmlns:tns="http://www.lexueba.com/schema/user"
  elementFormDefault="qualified">
  <element name="user">
    <complexType>
      <attribute name="id" type="string"/>
      <attribute name="userName" type="string"/>
      <attribute name="email" type="string"/>
    </complexType>
  </element>
</schema>
```
在上面的XSD文件中描述了一个新的targetNamespace，并在这个空间中定义了一个name为user的element，user有3个属性password、userName和email。

- 创建一个文件，实现BeanDefinitionParser接口，用来解析XSD文件中的定义和组件定义。
```java
package org.springframework.shu.my;

import org.springframework.beans.factory.support.BeanDefinitionBuilder;
import org.springframework.beans.factory.xml.AbstractSingleBeanDefinitionParser;
import org.w3c.dom.Element;

/**
* @description:
* @author: shu
* @createDate: 2023/4/21 9:37
* @version: 1.0
*/
public class UserBeanDefinitionParser extends AbstractSingleBeanDefinitionParser{

    @Override
    protected Class<?> getBeanClass(Element element) {
        return User.class;
    }


    @Override
    protected void doParse(Element element, BeanDefinitionBuilder builder) {
        String userName = element.getAttribute("userName");
        String id = element.getAttribute("id");
        String email = element.getAttribute("email");
        builder.addPropertyValue("userName", userName);
        builder.addPropertyValue("id", id);
        builder.addPropertyValue("email", email);
    }
}

```

- 创建一个Handler文件，扩展自NamespaceHandlerSupport，目的是将组件注册到Spring容器。
```java
package org.springframework.shu.my;

import org.springframework.beans.factory.xml.NamespaceHandlerSupport;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/21 9:39
 * @version: 1.0
 */
public class MyNameSpaceHandle extends NamespaceHandlerSupport {

	/**
	 * Invoked by the {@link DefaultBeanDefinitionDocumentReader} after
	 * construction but before any custom elements are parsed.
	 *
	 * @see NamespaceHandlerSupport#registerBeanDefinitionParser(String, BeanDefinitionParser)
	 */
	@Override
	public void init() {
		registerBeanDefinitionParser("user", new UserBeanDefinitionParser());
	}
}

```

- 编写Spring.handlers和Spring.schemas文件，默认位置是在工程的/META-INF/文件夹下，当然，你可以通过Spring的扩展或者修改源码的方式改变路径。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1682042198656-9059ac08-a7e3-4b19-9293-d532a17e49c3.png#averageHue=%232a4271&clientId=u5fee0ac7-ee54-4&from=paste&height=490&id=u748dbad7&originHeight=612&originWidth=1826&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=175873&status=done&style=none&taskId=ua678ce8f-a673-432a-86ab-4d2a9ba48cc&title=&width=1460.8)
```java
http\://www.lexueba.com/schema/user=org.springframework.shu.my.MyNameSpaceHandle
```
```java
http\://www.lexueba.com/schema/user.xsd=META-INF/User.xsd
```

- 编写Bean定义文件
```xml
<beans xmlns="http://www.Springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:myname="http://www.lexueba.com/schema/user"
  xsi:schemaLocation="http://www.Springframework.org/schema/beans
  http://www.Springframework.org/schema/beans/Spring-beans-2.0.xsd
  http://www.lexueba.com/schema/user http://www.lexueba.com/schema/user.xsd">
  <myname:user id="testbean" userName="aaa" email="bbb"/>
</beans>
```

- 进行测试案例
```java
package org.springframework.shu.my;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

/**
* @description:
* @author: shu
* @createDate: 2023/4/21 9:47
* @version: 1.0
*/
public class MyTest {
    public static void main(String[] args) {
        ApplicationContext bf = new ClassPathXmlApplicationContext("user.xml");
        User user=(User) bf.getBean("testbean");
        System.out.println(user.getUserName()+","+user.getEmail());
    }
}

```

- 结果
```java
16:09:05.397 [main] DEBUG org.springframework.context.support.ClassPathXmlApplicationContext - Refreshing org.springframework.context.support.ClassPathXmlApplicationContext@2b6856dd
16:09:05.499 [main] DEBUG org.springframework.beans.factory.xml.XmlBeanDefinitionReader - Loaded 1 bean definitions from class path resource [com/cms/customtag/user.xml]
16:09:05.512 [main] DEBUG org.springframework.beans.factory.support.DefaultListableBeanFactory - Creating shared instance of singleton bean 'userBean'
aaa，bbb

Process finished with exit code 0
```
在上面的例子中，我们实现了通过自定义标签实现了通过属性的方式将user类型的Bean赋值，在Spring中自定义标签非常常用，例如我们熟知的事务标签：tx(`<tx:annotation-driven>`)，下面我们来介绍具体的源码分析过程。
# 二 源码分析

了解了自定义标签的使用后，我们带着强烈的好奇心来探究一下自定义标签的解析过程。
**BeanDefinitionParserDelegate**
```java
        public BeanDefinition parseCustomElement(Element ele) {
                return parseCustomElement(ele, null);
        }
        //containingBd为父类bean，对顶层元素的解析应设置为null
        public BeanDefinition parseCustomElement(Element ele, BeanDefinition containingBd) {
                //获取对应的命名空间
                String namespaceUri = getNamespaceURI(ele);
                  //根据命名空间找到对应的NamespaceHandler
                  NamespaceHandler handler = this.readerContext.getNamespaceHandlerResolver().
    resolve(namespaceUri);
                  if (handler == null) {
                      error("Unable to locate Spring NamespaceHandler for XML schema namespace ["
    + namespaceUri + "]", ele);
                      return null;
                  }
                  //调用自定义的NamespaceHandler进行解析
                  return   handler.parse(ele,   new   ParserContext(this.readerContext,   this,
    containingBd));
        }
```
其实思路非常的简单，无非是根据对应的bean获取对应的命名空间，根据命名空间解析对应的处理器，然后根据用户自定义的处理器进行解析，下面我们来看下如何获取Bean的命名空间吧
## 2.1 命名空间的提取
标签的解析是从命名空间的提起开始的，无论是区分Spring中默认标签和自定义标签还是区分自定义标签中不同标签的处理器都是以标签所提供的命名空间为基础的，而至于如何提取对应元素的命名空间其实并不需要我们亲自去实现，在org.w3c.dom.Node中已经提供了方法供我们直接调用
**BeanDefinitionParserDelegate**
```java
	@Nullable
	public String getNamespaceURI(Node node) {
		return node.getNamespaceURI();
	}
```
## 2.2 提取自定义标签处理器
有了命名空间，我们继续跟踪，代码分析，下一步就是根据命名空间找到对应的解析器
```java
	NamespaceHandler handler = this.readerContext.getNamespaceHandlerResolver().
				resolve(namespaceUri);
```
这里调用的resolve方法其实调用的是DefaultNamespaceHandlerResolver类中的方法。
**DefaultNamespaceHandlerResolver**
```java
        public NamespaceHandler resolve(String namespaceUri) {
                  //获取所有已经配置的handler映射
                  Map<String, Object> handlerMappings = getHandlerMappings();
                  //根据命名空间找到对应的信息
                  Object handlerOrClassName = handlerMappings.get(namespaceUri);
                  if (handlerOrClassName == null) {
                      return null;
                }else if (handlerOrClassName instanceof NamespaceHandler) {
                      //已经做过解析的情况，直接从缓存读取
                      return (NamespaceHandler) handlerOrClassName;
                }else {
                      //没有做过解析，则返回的是类路径
                      String className = (String) handlerOrClassName;
                      try {
                          //使用反射将类路径转化为类
                          Class<?> handlerClass = ClassUtils.forName(className, this.classLoader);
                          if (!NamespaceHandler.class.isAssignableFrom(handlerClass)) {
                              throw  new  FatalBeanException("Class  ["  +  className  +  "]  for
    namespace [" + namespaceUri +
                                      "] does not implement the [" + NamespaceHandler. class.
    getName() + "] interface");
                          }
                          //初始化类
                          NamespaceHandler  namespaceHandler  =  (NamespaceHandler)  BeanUtils.
    instantiateClass(handlerClass);
                          //调用自定义的NamespaceHandler的初始化方法
                          namespaceHandler.init();
                          //记录在缓存
                          handlerMappings.put(namespaceUri, namespaceHandler);
                          return namespaceHandler;
                      }catch (ClassNotFoundException ex) {
                          throw new FatalBeanException("NamespaceHandler class [" + className +
    "] for namespace [" +
                                  namespaceUri + "] not found", ex);
                      }catch (LinkageError err) {
                          throw new FatalBeanException("Invalid NamespaceHandler class [" +
    className + "] for namespace [" +
                                  namespaceUri + "]: problem with handler class file or dependent
    class", err);
                      }
                }
        }
```
其实上面的代码很简单，首先获取接口的所有实现类，在利用命名空间查找该对象，如果缓存中有的话，直接返回，如果缓存中没有的话，就通过类路径利用反射来实例类，上面代码的关键在于如何获取我们编写的所有的命名空间
```java
private Map<String, Object> getHandlerMappings() {
		//如果没有被缓存则开始进行缓存
		if (this.handlerMappings == null) {
			synchronized (this) {
				if (this.handlerMappings == null) {
					try {
						//this.handlerMappingsLocation 在构造函数中已经被初始化为:META-INF/ Spring.handlers
						Properties mappings =
								PropertiesLoaderUtils.loadAllProperties   (this.
										handlerMappingsLocation, this.classLoader);
						if (logger.isDebugEnabled()) {
							logger.debug("Loaded NamespaceHandler mappings: " + mappings);
						}
						Map<String, Object> handlerMappings = new ConcurrentHashMap<
								String, Object>();
						//将Properties格式文件合并到Map格式的handlerMappings中
						CollectionUtils.mergePropertiesIntoMap(mappings, handlerMappings);
						this.handlerMappings = handlerMappings;
					}
					catch (IOException ex) {
						throw new IllegalStateException(
								"Unable  to  load  NamespaceHandler  mappings  from location [" + this.handlerMappingsLocation + "]", ex);
					}
				}
			}
		}
		return this.handlerMappings;
	}

```
同借助了工具类PropertiesLoaderUtils对属性handlerMappingsLocation进行了配置文件的读取，handlerMappingsLocation被默认初始化为“META-INF/Spring.handlers”。
## 2.3 标签解析
```java
	public BeanDefinition parseCustomElement(Element ele, BeanDefinition containingBd) {
		//获取对应的命名空间
		String namespaceUri = getNamespaceURI(ele);
		//根据命名空间找到对应的NamespaceHandler
		NamespaceHandler handler = this.readerContext.getNamespaceHandlerResolver().
				resolve(namespaceUri);
		if (handler == null) {
			error("Unable to locate Spring NamespaceHandler for XML schema namespace ["
					+ namespaceUri + "]", ele);
			return null;
		}
		//调用自定义的NamespaceHandler进行解析
		return  handler.parse(ele,   new   ParserContext(this.readerContext,   this,
				containingBd));
	}
```
在上面我们已经完成了前面两步，获取命名空间，更具命名空间找到对应的NamespaceHandler处理器，下一步就是进行具体的解析了，也就是来到我们自定义的MyNameSpaceHandle方法，但是我们发现并没有parse（）方法
```java
package org.springframework.shu.my;

import org.springframework.beans.factory.xml.NamespaceHandlerSupport;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/21 9:39
 * @version: 1.0
 */
public class MyNameSpaceHandle extends NamespaceHandlerSupport {

	/**
	 * Invoked by the {@link DefaultBeanDefinitionDocumentReader} after
	 * construction but before any custom elements are parsed.
	 *
	 * @see NamespaceHandlerSupport#registerBeanDefinitionParser(String, BeanDefinitionParser)
	 */
	@Override
	public void init() {
		registerBeanDefinitionParser("user", new UserBeanDefinitionParser());
	}
}

```
其实这个方法是父类中的实现，查看父类NamespaceHandlerSupport中的parse方法。
**NamespaceHandlerSupport**
```java
        public BeanDefinition parse(Element element, ParserContext parserContext) {
              //寻找解析器并进行解析操作
                return findParserForElement(element,parserContext).parse(element,parserContext);
        }
```
解析过程中首先是寻找元素对应的解析器，进而调用解析器中的parse方法，那么结合示例来讲，其实就是首先获取在MyNameSpaceHandler类中的init方法中注册的对应的UserBean DefinitionParser实例，并调用其parse方法进行进一步解析。
**NamespaceHandlerSupport**
```java
        private BeanDefinitionParser findParserForElement(Element element, ParserContext parser
    Context) {
                //获取元素名称，也就是<myname:user中的user,若在示例中，此时localName为user
                String localName = parserContext.getDelegate().getLocalName(element);
              	//根据user找到对应的解析器，也就是在
        		//registerBeanDefinitionParser("user", new UserBeanDefinitionParser());
        		//注册的解析器
                BeanDefinitionParser parser = this.parsers.get(localName);
                if (parser == null) {
                      parserContext.getReaderContext().fatal(
                              "Cannot locate BeanDefinitionParser for element [" + localName +
    "]", element);
                }
                return parser;
              }
```
下面看看调用具体的解析方法
**AbstractBeanDefinitionParser**
```java
        public final BeanDefinition parse(Element element, ParserContext parserContext) {
                AbstractBeanDefinition definition = parseInternal(element, parserContext);
                if (definition != null && !parserContext.isNested()) {
                      try {
                          String id = resolveId(element, definition, parserContext);
                          if (!StringUtils.hasText(id)) {
                              parserContext.getReaderContext().error(
                                      "Id  is  required  for  element  '"  +  parserContext.
    getDelegate().getLocalName(element)
                                                  + "' when used as a top-level tag", element);
                          }
                          String[] aliases = new String[0];
                          String name = element.getAttribute(NAME_ATTRIBUTE);
                          if (StringUtils.hasLength(name)) {
                              aliases                                                         =
    StringUtils.trimArrayElements(StringUtils.commaDelimitedListToStringArray(name));
                          }
                          //将AbstractBeanDefinition转换为BeanDefinitionHolder并注册
                          BeanDefinitionHolder holder = new BeanDefinitionHolder(definition, id,
    aliases);
                          registerBeanDefinition(holder, parserContext.getRegistry());
                          if (shouldFireEvents()) {
                              //需要通知监听器则进行处理
                                BeanComponentDefinition componentDefinition = new BeanComponent
    Definition(holder);
                                postProcessComponentDefinition(componentDefinition);
                                parserContext.registerComponent(componentDefinition);
                          }
                      }
                      catch (BeanDefinitionStoreException ex) {
                          parserContext.getReaderContext().error(ex.getMessage(), element);
                          return null;
                      }
                  }
                  return definition;
        }
```

- 虽说是对自定义配置文件的解析，但是，我们可以看到，在这个函数中大部分的代码是用来处理将解析后的AbstractBeanDefinition转化为BeanDefinitionHolder并注册的功能，而真正去做解析的事情委托给了函数parseInternal，正是这句代码调用了我们自定义的解析函数。
- 在parseInternal中并不是直接调用自定义的doParse函数，而是进行了一系列的数据准备，包括对beanClass、scope、lazyInit等属性的准备。

**AbstractSingleBeanDefinitionParser**
```java
        protected  final  AbstractBeanDefinition  parseInternal(Element  element,  ParserContext
    parserContext) {
                  BeanDefinitionBuilder builder=BeanDefinitionBuilder.genericBeanDefinition();
                  String parentName = getParentName(element);
                  if (parentName != null) {
                      builder.getRawBeanDefinition().setParentName(parentName);
                  }
      //获取自定义标签中的class，此时会调用自定义解析器如UserBeanDefinitionParser中的getBeanClass
    方法。
                  Class<?> beanClass = getBeanClass(element);
                  if (beanClass != null) {
                      builder.getRawBeanDefinition().setBeanClass(beanClass);
                  }
                  else {
            //若子类没有重写getBeanClass方法则尝试检查子类是否重写getBeanClassName方法
                      String beanClassName = getBeanClassName(element);
                      if (beanClassName != null) {
                          builder.getRawBeanDefinition().setBeanClassName(beanClassName);
                      }
                  }
                  builder.getRawBeanDefinition().setSource(parserContext.extractSource(element));
                  if (parserContext.isNested()) {
        //若存在父类则使用父类的scope属性
                      builder.setScope(parserContext.getContainingBeanDefinition().getScope());
                  }
                  if (parserContext.isDefaultLazyInit()) {
                      // Default-lazy-init applies to custom bean definitions as well.
        //配置延迟加载
                      builder.setLazyInit(true);
                  }
        //调用子类重写的doParse方法进行解析
                  doParse(element, parserContext, builder);
                  return builder.getBeanDefinition();
              }
        protected  void  doParse(Element  element,  ParserContext  parserContext,  BeanDefinition
    Builder builder) {
                doParse(element, builder);
        }
```
虽然在实例中我们定义UserBeanDefinitionParser，但是在其中我们只是做了与自己业务逻辑相关的部分。不过我们没做但是并不代表没有，在这个处理过程中同样也是按照Spring中默认标签的处理方式进行，包括创建BeanDefinition以及进行相应默认属性的设置，对于这些工作Spring都默默地帮我们实现了，只是暴露出一些接口来供用户实现个性化的业务。
