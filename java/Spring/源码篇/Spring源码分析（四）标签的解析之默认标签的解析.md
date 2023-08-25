---

title: Spring源码分析（四）标签的解析之默认标签的解析
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


![7f233cf5de98caadc304aee20a1a491.jpg](https://cdn.nlark.com/yuque/0/2023/jpeg/12426173/1681476692443-6add98b3-06e6-48e2-90b0-22df086cab83.jpeg#averageHue=%234f6b8d&clientId=u505f7fa5-711c-4&from=paste&height=1024&id=ub2123dbe&originHeight=1280&originWidth=1707&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=325662&status=done&style=none&taskId=u5d785769-45e8-4333-9339-0ea34f13711&title=&width=1365.6)
本图：川西旅游中拍摄的（业余摄影）
官网：[Home](https://spring.io/)
参考书籍：[Spring源码深度解析-郝佳编著-微信读书](https://weread.qq.com/web/bookDetail/0e232b205b260a0e29f3fb5)
参考文章：[Spring IoC之存储对象BeanDefinition](https://zhuanlan.zhihu.com/p/107834587)
上一篇文章我们介绍了Spring容器注册的流程有了一个基本的了解，但是还没有进行具体的解析，这里我感觉与Mybatis的源码很相似，首先都是XML格式转换成Docment对象，在进行标签节点的解析，下面我们来看看Spring中对标签节点的解析，这里我们分析默认标签的解析
**DefaultBeanDefinitionDocumentReader**
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1692929988294-41c1f4bc-b622-4ba7-9dff-700350bafabb.png#averageHue=%23f8f5f1&clientId=ubcf3d8ca-500e-4&from=paste&height=545&id=u8546d85a&originHeight=681&originWidth=1170&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=277430&status=done&style=none&taskId=ufc569930-13af-425a-9bce-915d3aeeeb0&title=&width=936)
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
BeanDefinitionParserDelegate 用于解析XML bean定义，preProcessXml()方法在当前类中属于空方法，重点是 parseBeanDefinitions(root, this.delegate)。
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
						parseDefaultElement(ele, delegate);
					}
					// 使用自定义的命名空间解析
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
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681882532555-ea01d60e-0437-411f-a133-960a54597d98.png#averageHue=%234c5a4c&clientId=ud2aaa960-e53e-4&from=paste&height=569&id=u262deb54&originHeight=711&originWidth=1822&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=210218&status=done&style=none&taskId=u2f63aad8-433e-4f2b-99c5-414b4b0f755&title=&width=1457.6)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681882575381-a1a6c2f4-f3e5-493f-8fff-4916f0bd300f.png#averageHue=%234c584c&clientId=ud2aaa960-e53e-4&from=paste&height=653&id=u9cc5cc9e&originHeight=816&originWidth=1858&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=237301&status=done&style=none&taskId=u5331cbe2-891f-466d-9861-42c9d14538d&title=&width=1486.4)

- 该方法用来遍历 root 节点下的子节点，比如说 root 节点为<beans>节点，则遍历它所包含的<bean>、<alias>等节点
- 如果根节点或者子节点采用默认命名空间的话，则调用 parseDefaultElement() 进行默认标签解析
- 否则调用 delegate.parseCustomElement() 方法进行自定义解析
- 下面我们先来分析默认标签的解析

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1692942242450-57569330-1633-4821-9b46-6e18dffd700d.png#averageHue=%23f8f4f1&clientId=u5d7fe55b-7e1c-4&from=paste&height=310&id=u34f2ace2&originHeight=388&originWidth=653&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=89154&status=done&style=none&taskId=u1bad8377-d1b9-4858-8936-0822d8fed7a&title=&width=522.4)
# 一 默认标签解析
```java
private void parseDefaultElement(Element ele, BeanDefinitionParserDelegate delegate) {
		// 如果标签名为import
		if (delegate.nodeNameEquals(ele, IMPORT_ELEMENT)) {
			importBeanDefinitionResource(ele);
		}
		// 如果标签名为alias
		else if (delegate.nodeNameEquals(ele, ALIAS_ELEMENT)) {
			processAliasRegistration(ele);
		}
		// 如果标签名为bean
		else if (delegate.nodeNameEquals(ele, BEAN_ELEMENT)) {
			logger.info("parse bean element "+ ele.getNodeName());
			processBeanDefinition(ele, delegate);
		}
		// 如果标签名为beans
		else if (delegate.nodeNameEquals(ele, NESTED_BEANS_ELEMENT)) {
			// recurse
			doRegisterBeanDefinitions(ele);
		}
	}
```

- 方法的功能一目了然，分别是对四种不同的标签进行解析，分别是 import、alias、bean、beans。
- 对应 bean 标签的解析是最核心的功能，对于 alias、import、beans 标签的解析都是基于 bean 标签解析的。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1692946836874-3b9dde85-d8e9-4c81-b299-c113c04eb0b5.png#averageHue=%23f7f2e1&clientId=u5d7fe55b-7e1c-4&from=paste&height=318&id=u5bdb8f1d&originHeight=398&originWidth=909&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=100153&status=done&style=none&taskId=u72f6ce0d-1b46-45e1-ba03-7f633ef880a&title=&width=727.2)
## 1.1 Bean标签的解析

- Spring 中最复杂也是最重要的是 bean 标签的解析过程。
- 在方法 parseDefaultElement() 中，如果遇到标签 为 bean 则调用 processBeanDefinition() 方法进行 bean 标签解析，通过代码我们可以发现关键方法processBeanDefinition（）
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	   xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

	<bean id="myTestBean"  class="org.springframework.shu.MyTestBean"/>

</beans>
```
```java
/**
	 * 解析bean标签
	 * @param ele
	 * @param delegate
	 */
	protected void processBeanDefinition(Element ele, BeanDefinitionParserDelegate delegate) {
		// 解析bean标签，返回BeanDefinitionHolder对象
		BeanDefinitionHolder bdHolder = delegate.parseBeanDefinitionElement(ele);
		// 判空处理
		if (bdHolder != null) {
			// 解析bean标签的子标签
			bdHolder = delegate.decorateBeanDefinitionIfRequired(ele, bdHolder);
			try {
				// Register the final decorated instance.
				// 注册bean
				BeanDefinitionReaderUtils.registerBeanDefinition(bdHolder, getReaderContext().getRegistry());
			}
			catch (BeanDefinitionStoreException ex) {
				getReaderContext().error("Failed to register bean definition with name '" +
						bdHolder.getBeanName() + "'", ele, ex);
			}
			// Send registration event.
			// 解析成功后，进行监听器激活处理
			getReaderContext().fireComponentRegistered(new BeanComponentDefinition(bdHolder));
		}
	}
```
我们来梳理一下上面的步骤，刚开始看的话很懵逼
（1）首先委托BeanDefinitionDelegate类的parseBeanDefinitionElement方法进行元素解析，返回BeanDefinitionHolder类型的实例bdHolder，经过这个方法后，bdHolder实例已经包含我们配置文件中配置的各种属性了，例如class、name、id、alias之类的属性。
（2）当返回的bdHolder不为空的情况下若存在默认标签的子节点下再有自定义属性，还需要再次对自定义标签进行解析。
（3）解析完成后，需要对解析后的bdHolder进行注册，同样，注册操作委托给了Bean DefinitionReaderUtils的registerBeanDefinition方法。
（4）最后发出响应事件，通知想关的监听器，这个bean已经加载完成了。
![DefaultBeanDefinitionDocumentReader_processBeanDefinition.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681383542727-c487d411-cc6b-49f6-a710-5e6f7c4a600f.png#averageHue=%23020101&clientId=u5e16b653-d8f0-4&from=paste&height=1514&id=uf781e2c1&originHeight=1893&originWidth=1912&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=96169&status=done&style=none&taskId=uc20d5cc2-e071-4c3e-8d78-25fbe1f5ce6&title=&width=1529.6)
### 1.3.1 解析BeanDefinition
首先我们从元素解析及信息提取开始，进入BeanDefinition Delegate类的parseBeanDefinitionElement方法。
**BeanDefinitionParserDelegate**
```java
/**
	 * 解析bean定义元素
	 * @param ele
	 * @param containingBean
	 * @return
	 */
	@Nullable
	public BeanDefinitionHolder parseBeanDefinitionElement(Element ele, @Nullable BeanDefinition containingBean) {
		// 解析id和name属性
		String id = ele.getAttribute(ID_ATTRIBUTE);
		String nameAttr = ele.getAttribute(NAME_ATTRIBUTE);
		List<String> aliases = new ArrayList<>();
		// 解析name属性
		if (StringUtils.hasLength(nameAttr)) {
			// 解析name属性，可能是多个，用逗号分隔
			String[] nameArr = StringUtils.tokenizeToStringArray(nameAttr, MULTI_VALUE_ATTRIBUTE_DELIMITERS);
			// 将name属性添加到别名集合中
			aliases.addAll(Arrays.asList(nameArr));
		}
		// 获取beanName
		String beanName = id;
		if (!StringUtils.hasText(beanName) && !aliases.isEmpty()) {
			beanName = aliases.remove(0);
			if (logger.isTraceEnabled()) {
				logger.trace("No XML 'id' specified - using '" + beanName +
						"' as bean name and " + aliases + " as aliases");
			}
		}
		if (containingBean == null) {
			// 检查beanName和aliases是否唯一
			checkNameUniqueness(beanName, aliases, ele);
		}
		// 解析属性，构造 AbstractBeanDefinition
		AbstractBeanDefinition beanDefinition = parseBeanDefinitionElement(ele, beanName, containingBean);
		if (beanDefinition != null) {
			//   如果 beanName 不存在，则根据条件构造一个 beanName
			if (!StringUtils.hasText(beanName)) {
				try {
                    //
					if (containingBean != null) {
						beanName = BeanDefinitionReaderUtils.generateBeanName(
								beanDefinition, this.readerContext.getRegistry(), true);
					}
					else {
						beanName = this.readerContext.generateBeanName(beanDefinition);
						// Register an alias for the plain bean class name, if still possible,
						// if the generator returned the class name plus a suffix.
						// This is expected for Spring 1.2/2.0 backwards compatibility.
						String beanClassName = beanDefinition.getBeanClassName();
						if (beanClassName != null &&
								beanName.startsWith(beanClassName) && beanName.length() > beanClassName.length() &&
								!this.readerContext.getRegistry().isBeanNameInUse(beanClassName)) {
							aliases.add(beanClassName);
						}
					}
					if (logger.isTraceEnabled()) {
						logger.trace("Neither XML 'id' nor 'name' specified - " +
								"using generated bean name [" + beanName + "]");
					}
				}
				catch (Exception ex) {
					error(ex.getMessage(), ele);
					return null;
				}
			}
			String[] aliasesArray = StringUtils.toStringArray(aliases);
			//  /封装 BeanDefinitionHolder
			return new BeanDefinitionHolder(beanDefinition, beanName, aliasesArray);
		}

		return null;
	}
```
总结一下上面代码的步骤：
（1）提取元素中的id以及name属性，并检查名称唯一性
（2）进一步解析其他所有属性并统一封装至GenericBeanDefinition类型的实例中
（3）如果检测到bean没有指定beanName，那么使用默认规则为此Bean生成beanName
（4）将获取到的信息封装到BeanDefinitionHolder的实例中
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681883689791-98a0c78b-24c7-4f27-8613-9cb8f3d487d2.png#averageHue=%234a564b&clientId=ud2aaa960-e53e-4&from=paste&height=702&id=ua2441a6c&originHeight=878&originWidth=1881&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=272659&status=done&style=none&taskId=u7a5747bc-880c-44df-883b-46ee682d1fe&title=&width=1504.8)![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681883939391-6f641a87-ed35-4e75-a0d9-f50d14359003.png#averageHue=%234b574c&clientId=ud2aaa960-e53e-4&from=paste&height=824&id=u489e7eec&originHeight=1030&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=285181&status=done&style=none&taskId=u0fa77326-32cd-4b4a-9edf-a738f4ee9fa&title=&width=1536)
我们再来看看第二步解析其他属性进行封装，看看他是如何解析其他属性的
**BeanDefinitionParserDelegate**
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1692948572844-8ab1185f-39f4-4dbf-a93f-ad205baf7a8e.png#averageHue=%23968b5f&clientId=u5d7fe55b-7e1c-4&from=paste&height=606&id=u39fdd0f8&originHeight=757&originWidth=986&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=150196&status=done&style=none&taskId=u918da45e-cf33-4696-9349-908f8dac333&title=&width=788.8)
```java
@Nullable
	public AbstractBeanDefinition parseBeanDefinitionElement(Element ele, String beanName, @Nullable BeanDefinition containingBean) {
		// 解析状态新增一个 BeanEntry
		this.parseState.push(new BeanEntry(beanName));
		// 解析class属性
		String className = null;
		if (ele.hasAttribute("class")) {
			className = ele.getAttribute("class").trim();
		}
		// 解析parent属性
		String parent = null;
		if (ele.hasAttribute("parent")) {
			parent = ele.getAttribute("parent");
		}
		// 下面是关键代码，我们仔细看看
		try {
			//创建用于承载属性的AbstractBeanDefinition类型的GenericBeanDefinition实例
			AbstractBeanDefinition bd = this.createBeanDefinition(className, parent);
			//硬编码解析bean的各种属性
			this.parseBeanDefinitionAttributes(ele, beanName, containingBean, bd);
			//设置description属性
			bd.setDescription(DomUtils.getChildElementValueByTagName(ele, "description"));
			//解析元素
			this.parseMetaElements(ele, bd);
			//解析lookup-method属性
			this.parseLookupOverrideSubElements(ele, bd.getMethodOverrides());
			//解析replace-method属性
			this.parseReplacedMethodSubElements(ele, bd.getMethodOverrides());
			//解析构造函数的参数
			this.parseConstructorArgElements(ele, bd);
			//解析properties子元素
			this.parsePropertyElements(ele, bd);
			//解析qualifier子元素
			this.parseQualifierElements(ele, bd);
			bd.setResource(this.readerContext.getResource());
			bd.setSource(this.extractSource(ele));
			AbstractBeanDefinition var7 = bd;
			return var7;
		} catch (ClassNotFoundException var13) {
			this.error("Bean class [" + className + "] not found", ele, var13);
		} catch (NoClassDefFoundError var14) {
			this.error("Class that bean class [" + className + "] depends on not found", ele, var14);
		} catch (Throwable var15) {
			this.error("Unexpected failure during bean definition parsing", ele, var15);
		} finally {
			this.parseState.pop();
		}

		return null;
	}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681884131457-ef780def-6490-42c3-993d-c424158442a3.png#averageHue=%234a554b&clientId=ud2aaa960-e53e-4&from=paste&height=586&id=u8b851780&originHeight=732&originWidth=1836&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=234501&status=done&style=none&taskId=u29c3e016-7b50-4abb-b95f-4e813601198&title=&width=1468.8)
#### 1.3.1.1 AbstractBeanDefinition的创建

- **BeanDefinition是一个接口，在Spring中存在三种实现：RootBeanDefinition、ChildBeanDefinition以及GenericBeanDefinition。**
- 三种实现均继承了AbstractBeanDefiniton，其中BeanDefinition是配置文件<bean>元素标签在容器中的内部表示形式
- <bean>元素标签拥有class、scope、lazy-init等配置属性，BeanDefinition则提供了相应的beanClass、scope、lazyInit属性，BeanDefinition和<bean>中的属性是一一对应的。
- 其中RootBeanDefinition是最常用的实现类，它对应一般性的<bean>元素标签，GenericBeanDefinition是自2.5版本以后新加入的bean文件配置属性定义类，是一站式服务类。
- 在配置文件中可以定义父<bean>和子<bean>，父<bean>用RootBeanDefinition表示，而子<bean>用ChildBeanDefiniton表示，而没有父<bean>的<bean>就使用RootBeanDefinition表示。
- Spring通过BeanDefinition将配置文件中的<bean>配置信息转换为容器的内部表示，并将这些BeanDefiniton注册到BeanDefinitonRegistry中。
- Spring容器的BeanDefinitionRegistry就像是Spring配置信息的内存数据库，主要是以map的形式保存，后续操作直接从BeanDefinition Registry中读取配置信息。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681384541704-312b949d-a4f1-486d-bffb-1153408d99af.png#averageHue=%23fcfcf9&clientId=u5e16b653-d8f0-4&from=paste&height=343&id=u82c4309d&originHeight=429&originWidth=718&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=99502&status=done&style=none&taskId=ub91ff538-c58b-48d2-8000-7994bc3c47b&title=&width=574.4)

- 由此可知，要解析属性首先要创建用于承载属性的实例，也就是创建   GenericBeanDefinition类型的实例
- 而代码createBeanDefinition(className,parent)的作用就是实现此功能。

**BeanDefinitionParserDelegate**
```java
    protected AbstractBeanDefinition createBeanDefinition(String className, String parentName)
    throws ClassNotFoundException {
                  return BeanDefinitionReaderUtils.createBeanDefinition(
                          parentName, className, this.readerContext.getBeanClassLoader());
        }
```
**BeanDefinitionReaderUtils**
```java
	public static AbstractBeanDefinition createBeanDefinition(
			@Nullable String parentName, @Nullable String className, @Nullable ClassLoader classLoader) throws ClassNotFoundException {
		// Create bean definition instance.
		GenericBeanDefinition bd = new GenericBeanDefinition();
		// Set parent name, if any.
		bd.setParentName(parentName);
		if (className != null) {
			if (classLoader != null) {
				bd.setBeanClass(ClassUtils.forName(className, classLoader));
			}
			else {
				bd.setBeanClassName(className);
			}
		}
		return bd;
	}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681884303587-64e2f9ce-197a-4e6c-87d5-8e9c7b16688a.png#averageHue=%234b574b&clientId=ud2aaa960-e53e-4&from=paste&height=635&id=u235be952&originHeight=794&originWidth=1819&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=202662&status=done&style=none&taskId=u9b9351c4-8c34-43f0-aaa4-53295f33758&title=&width=1455.2)
上面很简单就是创建了一个容器对象，但是我这里有疑问?GenericBeanDefinition，RootBeanDefinition，ChildBeanDefinition有啥区别？
解答：
在Spring框架中，这三个类都是用于定义Bean的类。

- GenericBeanDefinition是最通用的Bean定义类。它允许您定义Bean的类名、Bean的属性以及Bean之间的依赖关系。
- RootBeanDefinition是GenericBeanDefinition的子类。除了GenericBeanDefinition定义的内容之外，它还可以定义一些特殊的属性，例如Bean的作用域、是否延迟初始化等。
- ChildBeanDefinition同样是GenericBeanDefinition的子类。它用于定义一个已有Bean定义的子Bean定义。在这种情况下，ChildBeanDefinition继承其父Bean定义的所有属性，但可以通过重写属性来自定义特定的属性。

综上所述，GenericBeanDefinition是最通用的Bean定义类，RootBeanDefinition是GenericBeanDefinition的子类，用于定义更具体的Bean属性，而ChildBeanDefinition是用于定义已有Bean定义的子Bean定义。
上面我们有一个装容器的东西，下面就是解析不同的属性填充其中，这里的思想与MyBatis中对Mybatis.config.xml 的解析一致，下面我们来看看属性的解析
#### 1.3.1.2 解析bean的各种属性
参考官网：[核心技术](https://springdoc.cn/spring/core.html#beans-introduction)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681885578912-9e022b45-69ce-457b-bc4d-9e9cb1d28055.png#averageHue=%23fefefe&clientId=ud2aaa960-e53e-4&from=paste&height=469&id=ubb0957e2&originHeight=586&originWidth=1317&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=39408&status=done&style=none&taskId=u31171c96-8ada-4565-81a0-fecf46cf3db&title=&width=1053.6)
一个Spring IoC容器管理着一个或多个Bean。这些Bean是用你提供给容器的配置元数据创建的（例如，以XML <bean/> 定义的形式）。
在容器本身中，这些Bean定义被表示为 BeanDefinition 对象，它包含（除其他信息外）以下元数据。

- 一个全路径类名：通常，被定义的Bean的实际实现类。
- Bean的行为配置元素，它说明了Bean在容器中的行为方式（scope、生命周期回调，等等）。
- 对其他Bean的引用，这些Bean需要做它的工作。这些引用也被称为合作者或依赖。
- 要在新创建的对象中设置的其他配置设置—例如，pool的大小限制或在管理连接池的Bean中使用的连接数。
##### 1.3.1.2.1 Scope
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681885612633-041d89fe-89d4-4e18-bace-63ae7e9d8747.png#averageHue=%23fdfcfa&clientId=ud2aaa960-e53e-4&from=paste&height=420&id=uf038e6af&originHeight=525&originWidth=1293&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=82514&status=done&style=none&taskId=u1453df09-d429-42b2-b5c9-4988e3bdcde&title=&width=1034.4)
当通过spring容器创建一个Bean实例时，不仅可以完成Bean实例的实例化，还可以为Bean指定特定的作用域。Spring支持如下5种作用域：

- singleton：单例模式，在整个Spring IoC容器中，使用singleton定义的Bean将只有一个实例
- prototype：原型模式，每次通过容器的getBean方法获取prototype定义的Bean时，都将产生一个新的Bean实例
- request：对于每次HTTP请求，使用request定义的Bean都将产生一个新实例，即每次HTTP请求将会产生不同的Bean实例。只有在Web应用中使用Spring时，该作用域才有效
- session：对于每次HTTP Session，使用session定义的Bean豆浆产生一个新实例。同样只有在Web应用中使用Spring时，该作用域才有效
- globalsession：每个全局的HTTP Session，使用session定义的Bean都将产生一个新实例。典型情况下，仅在使用portlet context的时候有效。同样只有在Web应用中使用Spring时，该作用域才有效
- 其中比较常用的是singleton和prototype两种作用域，对于singleton作用域的Bean，每次请求该Bean都将获得相同的实例。
- 容器负责跟踪Bean实例的状态，负责维护Bean实例的生命周期行为，如果一个Bean被设置成prototype作用域，程序每次请求该id的Bean，Spring都会新建一个Bean实例，然后返回给程序。
- 在这种情况下，Spring容器仅仅使用new 关键字创建Bean实例，一旦创建成功，容器不在跟踪实例，也不会维护Bean实例的状态。
- 如果不指定Bean的作用域，Spring默认使用singleton作用域。Java在创建Java实例时，需要进行内存申请；销毁实例时，需要完成垃圾回收，这些工作都会导致系统开销的增加。
- 因此，prototype作用域Bean的创建、销毁代价比较大。而singleton作用域的Bean实例一旦创建成功，可以重复使用，因此，除非必要，否则尽量避免将Bean被设置成prototype作用域。

**BeanDefinitionParserDelegate**
```java
/**
	 * 解析bean的各种属性
	 * @param ele
	 * @param beanName
	 * @param containingBean
	 * @param bd
	 * @return
	 */
	public AbstractBeanDefinition parseBeanDefinitionAttributes(Element ele, String beanName,
			@Nullable BeanDefinition containingBean, AbstractBeanDefinition bd) {
		// 有singleton属性，报错
		if (ele.hasAttribute(SINGLETON_ATTRIBUTE)) {
			error("Old 1.x 'singleton' attribute in use - upgrade to 'scope' declaration", ele);
		}
		// scope属性作用域：singleton、prototype、request、session、global-session
		else if (ele.hasAttribute(SCOPE_ATTRIBUTE)) {
			bd.setScope(ele.getAttribute(SCOPE_ATTRIBUTE));
		}
		// 如果containingBean不为空，说明是内部bean，那么就从containingBean中获取scope属性
		else if (containingBean != null) {
			// Take default from containing bean in case of an inner bean definition.
			bd.setScope(containingBean.getScope());
		}
    }
```
##### 1.3.1.2.2 Abstrat

- abstract 英文含义是抽象的意思，在 java 中用来修饰类代表的意思是该类为抽象类,不能被实例化,而 Spring 中 bean 标签里的 abstract 的含义也是差不多，该属性的默认值是 false ，表示当前 bean 是一个抽象的 bean 不能被实例化，那么这就有问题了，既然一个 bean 不能被实例化,那么这个 bean 存在的意义是什么?
- Spring 之所以这么设计，必然有其存在的道理,在说 abstract 属性之前，我们再来说 bean 标签中的另外一个属性 parent ,顾名思义，就是一个认爸爸的属性，用来表明当前的 bean 的老爸是谁，是继承它的属性。

**BeanDefinitionParserDelegate**
```java
    	// 是否抽象类
		if (ele.hasAttribute(ABSTRACT_ATTRIBUTE)) {
			bd.setAbstract(TRUE_VALUE.equals(ele.getAttribute(ABSTRACT_ATTRIBUTE)));
		}
```
##### 1.3.1.2.3 Lazy-init
延迟加载，ApplicationContext实现的默认行为就是在启动服务器时将所有singleton bean提前进行实例化(也就是依赖注入)，如果你不想让一个singleton bean在ApplicationContext，实现初始化时被提前实例化，那么可以将bean设置为延时实例化。
**BeanDefinitionParserDelegate**
```java
    	// 是否延迟初始化
		String lazyInit = ele.getAttribute(LAZY_INIT_ATTRIBUTE);
		if (isDefaultValue(lazyInit)) {
			lazyInit = this.defaults.getLazyInit();
		}
		bd.setLazyInit(TRUE_VALUE.equals(lazyInit));
```
##### 1.3.1.2.4 Autowire

- no	(默认)不采用autowire机制，当我们需要使用依赖注入，只能用 ref
- byName	通过属性的名称自动装配（注入）。Spring会在容器中查找名称与bean属性名称一致的bean，并自动注入到bean属性中。当然bean的属性需要有setter方法。例如：bean A有个属性master，master的setter方法就是setMaster，A设置了autowire=“byName”，那么Spring就会在容器中查找名为master的bean通过setMaster方法注入到A中。
- byType	通过类型自动装配（注入）。Spring会在容器中查找类（Class）与bean属性类一致的bean，并自动注入到bean属性中，如果容器中包含多个这个类型的bean，Spring将抛出异常。如果没有找到这个类型的bean，那么注入动作将不会执行。
- constructor	类似于byType，但是是通过构造函数的参数类型来匹配。假设bean A有构造函数A(B b, C c)，那么Spring会在容器中查找类型为B和C的bean通过构造函数A(B b, C c)注入到A中。与byType一样，如果存在多个bean类型为B或者C，则会抛出异常。但时与byType不同的是，如果在容器中找不到匹配的类的bean，将抛出异常，因为Spring无法调用构造函数实例化这个bean。
- default采用父级标签的配置，（即beans的default-autowire属性）

**BeanDefinitionParserDelegate**
```java
	String autowire = ele.getAttribute(AUTOWIRE_ATTRIBUTE);
		bd.setAutowireMode(getAutowireMode(autowire));
```
##### 1.3.1.2.5 Depends-on
depend-on用来表示一个Bean的实例化依靠另一个Bean先实例化。如果在一个bean A上定义了depend-on B那么就表示：A 实例化前先实例化 B。
**BeanDefinitionParserDelegate**
```java
if (ele.hasAttribute(DEPENDS_ON_ATTRIBUTE)) {
String dependsOn = ele.getAttribute(DEPENDS_ON_ATTRIBUTE);
bd.setDependsOn(StringUtils.tokenizeToStringArray(dependsOn, MULTI_VALUE_ATTRIBUTE_DELIMITERS));
}
```
##### 1.3.1.2.6 Autowire-candidates
beans元素是xml中定义bean的根元素，beans元素有个default-autowire-candidates属性，再来说一下bean元素的autowire-candidate属性，这个属性有3个可选值：
default：这个是默认值，autowire-candidate如果不设置，其值就是default
true：作为候选者
false：不作为候选者
**BeanDefinitionParserDelegate**
```java
    	// 是否自动装配候选
		String autowireCandidate = ele.getAttribute(AUTOWIRE_CANDIDATE_ATTRIBUTE);
		if (isDefaultValue(autowireCandidate)) {
			String candidatePattern = this.defaults.getAutowireCandidates();
			if (candidatePattern != null) {
				String[] patterns = StringUtils.commaDelimitedListToStringArray(candidatePattern);
				bd.setAutowireCandidate(PatternMatchUtils.simpleMatch(patterns, beanName));
			}
		}
		else {
			bd.setAutowireCandidate(TRUE_VALUE.equals(autowireCandidate));
		}
```
##### 1.3.1.2.7 Primary
primary的值有true和false两个可以选择，默认为false。
当一个bean的primary设置为true，然后容器中有多个与该bean相同类型的其他bean，此时，当使用@Autowired想要注入一个这个类型的bean时，就不会因为容器中存在多个该类型的bean而出现异常。而是优先使用primary为true的bean。
**BeanDefinitionParserDelegate**
```java
	if (ele.hasAttribute(PRIMARY_ATTRIBUTE)) {
			bd.setPrimary(TRUE_VALUE.equals(ele.getAttribute(PRIMARY_ATTRIBUTE)));
		}
```
##### 1.3.1.2.8 Init-method
bean 配置文件属性 init-method 用于在bean初始化时指定执行方法，用来替代继承 InitializingBean接口。
**BeanDefinitionParserDelegate**
```java
	// 是否初始化
		if (ele.hasAttribute(INIT_METHOD_ATTRIBUTE)) {
			String initMethodName = ele.getAttribute(INIT_METHOD_ATTRIBUTE);
			bd.setInitMethodName(initMethodName);
		}
		else if (this.defaults.getInitMethod() != null) {
			bd.setInitMethodName(this.defaults.getInitMethod());
			bd.setEnforceInitMethod(false);
		}
```
##### 1.3.1.2.9 Destroy-method
销毁方法
**BeanDefinitionParserDelegate**
```java
	// 是否销毁
		if (ele.hasAttribute(DESTROY_METHOD_ATTRIBUTE)) {
			String destroyMethodName = ele.getAttribute(DESTROY_METHOD_ATTRIBUTE);
			bd.setDestroyMethodName(destroyMethodName);
		}
		else if (this.defaults.getDestroyMethod() != null) {
			bd.setDestroyMethodName(this.defaults.getDestroyMethod());
			bd.setEnforceDestroyMethod(false);
		}
```
##### 1.3.1.2.10 Factory-method
工厂方法
**BeanDefinitionParserDelegate**
```java
if (ele.hasAttribute(FACTORY_METHOD_ATTRIBUTE)) {
			bd.setFactoryMethodName(ele.getAttribute(FACTORY_METHOD_ATTRIBUTE));
		}
		if (ele.hasAttribute(FACTORY_BEAN_ATTRIBUTE)) {
			bd.setFactoryBeanName(ele.getAttribute(FACTORY_BEAN_ATTRIBUTE));
}
```
我们可以清楚地看到Spring完成了对所有bean属性的解析，这些属性中有很多是我们经常使用的，同时我相信也一定会有或多或少的属性是读者不熟悉或者是没有使用过的，有兴趣的读者可以查阅相关资料进一步了解每个属性
#### 1.3.1.3 解析description标签
**BeanDefinitionParserDelegate**
```java
	bd.setDescription(DomUtils.getChildElementValueByTagName(ele, "description"));
```
这个没啥说的
#### 1.3.1.4 解析meta标签
在开始解析元数据的分析前，我们先回顾下元数据meta属性的使用。
```java
        <bean id="myTestBean" class="bean.MyTestBean">
                <meta key="testStr" value="aaaaaaaa"/>
        </bean>
```
**BeanDefinitionParserDelegate**
```java
              public void parseMetaElements(Element ele, BeanMetadataAttributeAccessor attributeAccessor) {
                //获取当前节点的所有子元素
                NodeList nl = ele.getChildNodes();
                for (int i = 0; i < nl.getLength(); i++) {
                      Node node = nl.item(i);
                      //提取meta
                      if (isCandidateElement(node) && nodeNameEquals(node, META_ELEMENT)) {
                          Element metaElement = (Element) node;
                          String key = metaElement.getAttribute(KEY_ATTRIBUTE);
                          String value = metaElement.getAttribute(VALUE_ATTRIBUTE);
                          //使用key、value构造BeanMetadataAttribute
                          BeanMetadataAttribute attribute = new BeanMetadataAttribute(key, value);
                          attribute.setSource(extractSource(metaElement));
                          //记录信息
                          attributeAccessor.addMetadataAttribute(attribute);
                      }
                  }
        }
```
#### 1.3.1.5 解析lookup-method标签
同样，子元素lookup-method似乎并不是很常用，但是在某些时候它的确是非常有用的属性，通常我们称它为获取器注入，引用《Spring in Action》中的一句话：获取器注入是一种特殊的方法注入，它是把一个方法声明为返回某种类型的bean，但实际要返回的bean是在配置文件里面配置的，此方法可用在设计有些可插拔的功能上，解除程序依赖。
我们来个案例来理解它，首先我们定义一个类
```java
package org.springframework.shu.Test;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/13 20:25
 * @version: 1.0
 */
public class User {
	/**
	 * @description: show
	 */
	public void show(){
		System.out.println("I am a user");
	}
}

```
```java
package org.springframework.shu.Test;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/13 20:36
 * @version: 1.0
 */
public class Student extends User{
	/**
	 * @description: show
	 */
	@Override
	public void show() {
		System.out.println("I am a student");
	}
}

```
```java
package org.springframework.shu.Test;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/13 20:36
 * @version: 1.0
 */
public class Student extends User{
	/**
	 * @description: show
	 */
	@Override
	public void show() {
		System.out.println("I am a student");
	}
}

```
```java
package org.springframework.shu.Test;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/13 20:26
 * @version: 1.0
 */
public abstract class GetBeanTest {

	public void showMe(){
		this.getBean().show();
	}

	public abstract User getBean();
}
```
配置文件配置Xml
```java
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	   xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

	<bean id="getBeanTest" class="org.springframework.shu.Test.GetBeanTest">
		<lookup-method name="getBean" bean="student"/>
	</bean>

	<bean id="student" class="org.springframework.shu.Test.Student"/>


</beans>
```
```java
package org.springframework.shu.Test;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/13 20:27
 * @version: 1.0
 */
public class BeanUserTest {
	public static void main(String[] args) {
		ApplicationContext bf = new ClassPathXmlApplicationContext("spring-config.xml");
		GetBeanTest test=(GetBeanTest) bf.getBean("getBeanTest");
		test.showMe();
	}
}

```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681389627648-a77e2a72-4ce1-4959-836d-fbd7569641ce.png#averageHue=%23b2b4a3&clientId=u5e16b653-d8f0-4&from=paste&height=331&id=u4b60d9c2&originHeight=414&originWidth=1865&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=105206&status=done&style=none&taskId=u06463513-dcf5-49ec-8f7c-782f9e03571&title=&width=1492)到现在为止，除了配置文件外，整个测试方法就完成了，如果之前没有接触过获取器注入的读者们可能会有疑问：抽象方法还没有被实现，怎么可以直接调用呢？
在配置文件中，我们看到了源码解析中提到的lookup-method子元素，这个配置完成的功能是动态地将teacher所代表的bean作为getBean的返回值，我们可以替换配置文件
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681389740624-6a182bbf-5ad8-41c7-bf8c-e28239a64d51.png#averageHue=%23525b4d&clientId=u5e16b653-d8f0-4&from=paste&height=686&id=u1efdcb56&originHeight=857&originWidth=1897&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=196143&status=done&style=none&taskId=u4e1cb173-c3be-4062-91ee-8372ea637fb&title=&width=1517.6)
上面我们知道了什么样的效果，下面我们来看他的源码分析吧
```java
public void parseLookupOverrideSubElements(Element beanEle, MethodOverrides overrides) {
                      NodeList nl = beanEle.getChildNodes();
                      for (int i = 0; i < nl.getLength(); i++) {
                          Node node = nl.item(i);
                          //仅当在Spring默认bean的子元素下且为    <lookup-method时有效
                          if    (isCandidateElement(node) && nodeNameEquals(node,LOOKUP_METHOD_ELEMENT)) {
                                Element ele = (Element) node;
                                //获取要修饰的方法
                                String methodName = ele.getAttribute(NAME_ATTRIBUTE);
                                //获取配置返回的bean
                                String beanRef = ele.getAttribute(BEAN_ELEMENT);
                                LookupOverride override = new LookupOverride(methodName, beanRef);
                                override.setSource(extractSource(ele));
                                overrides.addOverride(override);
                          }
                      }
              }
```

- 上面的代码很眼熟，似乎与parseMetaElements的代码大同小异，最大的区别就是在if判断中的节点名称在这里被修改LOOKUP_METHOD_ELEMENT。
- 还有，在数据存储上面通过使用LookupOverride类型的实体类来进行数据承载并记录在AbstractBeanDefinition中的methodOverrides属性中。
#### 1.3.1.6 解析replaced-method标签
这个方法主要是对bean中replaced-method子元素的提取，在开始提取分析之前我们还是预先介绍下这个元素的用法，方法替换：可以在运行时用新的方法替换现有的方法。
与之前的look-up不同的是， replaced-method不但可以动态地替换返回实体bean，而且还能动态地更改原有方法的逻辑，下面我们来看看代码分析
**BeanDefinitionParserDelegate**
```java
	public void parseReplacedMethodSubElements(Element beanEle, MethodOverrides overrides) {
		// 获取bean元素的所有子节点
		NodeList nl = beanEle.getChildNodes();
		for (int i = 0; i < nl.getLength(); i++) {
			Node node = nl.item(i);
			// 如果是替换方法节点
			if (isCandidateElement(node) && nodeNameEquals(node, REPLACED_METHOD_ELEMENT)) {
				Element replacedMethodEle = (Element) node;
				// 获取name和replacer属性
				String name = replacedMethodEle.getAttribute(NAME_ATTRIBUTE);
				String callback = replacedMethodEle.getAttribute(REPLACER_ATTRIBUTE);
				// 构造ReplaceOverride
				ReplaceOverride replaceOverride = new ReplaceOverride(name, callback);
				// Look for arg-type match elements.
				List<Element> argTypeEles = DomUtils.getChildElementsByTagName(replacedMethodEle, ARG_TYPE_ELEMENT);
				// 遍历arg-type元素
				for (Element argTypeEle : argTypeEles) {
					// 获取match属性
					String match = argTypeEle.getAttribute(ARG_TYPE_MATCH_ATTRIBUTE);
					// 如果没有match属性，则获取文本值
					match = (StringUtils.hasText(match) ? match : DomUtils.getTextValue(argTypeEle));
					if (StringUtils.hasText(match)) {
						// 添加到ReplaceOverride
						replaceOverride.addTypeIdentifier(match);
					}
				}
				// 设置source
				replaceOverride.setSource(extractSource(replacedMethodEle));
				// 添加到MethodOverrides
				overrides.addOverride(replaceOverride);
			}
		}
	}
```
replaced-method都是构造了一个MethodOverride，并最终记录在了AbstractBeanDefinition中的methodOverrides属性中，后面我们会详细介绍的
#### 1.3.1.7 解析constructor-arg元素
对构造函数的解析是非常常用的，同时也是非常复杂的，也相信大家对构造函数的配置都不陌生，举个简单的小例子：
```java
	  <beans>
        <!-- 默认的情况下是按照参数的顺序注入，当指定index索引后就可以改变注入参数的顺序 -->
        <bean id="helloBean" class="com.HelloBean">
            <constructor-arg index="0">
                <value>郝佳</value>
            </constructor-arg>
            <constructor-arg index="1">
                <value>你好</value>
            </constructor-arg>
        </bean>
        </beans>
```
上面的配置是Spring构造函数配置中最基础的配置，实现的功能就是对HelloBean自动寻找对应的构造函数，并在初始化的时候将设置的参数传入进去，那么让我们来看看具体的XML解析过程。
**BeanDefinitionParserDelegate**
```java
	public void parseConstructorArgElements(Element beanEle, BeanDefinition bd) {
		// 获取bean元素的所有子节点
		NodeList nl = beanEle.getChildNodes();
		// 遍历子节点
		for (int i = 0; i < nl.getLength(); i++) {
			Node node = nl.item(i);
			// 判断是否为候选元素，且节点名称是否为constructor-arg
			if (isCandidateElement(node) && nodeNameEquals(node, CONSTRUCTOR_ARG_ELEMENT)) {
				// 解析constructor-arg元素
				parseConstructorArgElement((Element) node, bd);
			}
		}
	}
```
**BeanDefinitionParserDelegate**
```java
public void parseConstructorArgElement(Element ele, BeanDefinition bd) {
		// 获取index属性
		String indexAttr = ele.getAttribute(INDEX_ATTRIBUTE);
		// 获取type属性
		String typeAttr = ele.getAttribute(TYPE_ATTRIBUTE);
		// 获取name属性
		String nameAttr = ele.getAttribute(NAME_ATTRIBUTE);
		// 如果index属性为空，则使用非索引模式
		if (StringUtils.hasLength(indexAttr)) {
			try {
				int index = Integer.parseInt(indexAttr);
				if (index < 0) {
					error("'index' cannot be lower than 0", ele);
				}
				else {
					try {
						// 将当前解析状态压入栈中
						this.parseState.push(new ConstructorArgumentEntry(index));
						Object value = parsePropertyValue(ele, bd, null);
						// 构造ValueHolder
						ConstructorArgumentValues.ValueHolder valueHolder = new ConstructorArgumentValues.ValueHolder(value);
						if (StringUtils.hasLength(typeAttr)) {
							valueHolder.setType(typeAttr);
						}
						if (StringUtils.hasLength(nameAttr)) {
							valueHolder.setName(nameAttr);
						}
						valueHolder.setSource(extractSource(ele));
						if (bd.getConstructorArgumentValues().hasIndexedArgumentValue(index)) {
							error("Ambiguous constructor-arg entries for index " + index, ele);
						}
						else {
							bd.getConstructorArgumentValues().addIndexedArgumentValue(index, valueHolder);
						}
					}
					finally {
						this.parseState.pop();
					}
				}
			}
			catch (NumberFormatException ex) {
				error("Attribute 'index' of tag 'constructor-arg' must be an integer", ele);
			}
		}
		// 如果index属性不为空，则使用索引模式, 自动寻找
		else {
			try {
				this.parseState.push(new ConstructorArgumentEntry());
				Object value = parsePropertyValue(ele, bd, null);
				ConstructorArgumentValues.ValueHolder valueHolder = new ConstructorArgumentValues.ValueHolder(value);
				if (StringUtils.hasLength(typeAttr)) {
					valueHolder.setType(typeAttr);
				}
				if (StringUtils.hasLength(nameAttr)) {
					valueHolder.setName(nameAttr);
				}
				valueHolder.setSource(extractSource(ele));
				bd.getConstructorArgumentValues().addGenericArgumentValue(valueHolder);
			}
			finally {
				this.parseState.pop();
			}
		}
	}
```
🔷首先是提取constructor-arg上必要的属性（index、type、name）：
🔷 如果配置中指定了index属性，那么操作步骤如下：

- 解析constructor-arg的子元素。
- 使用ConstructorArgumentValues.ValueHolder类型来封装解析出来的元素，将type、name和index属性一并封装
- ConstructorArgumentValues.ValueHolder类型中并添加至当前BeanDefinition的constructorArgumentValues的indexedArgumentValues属性中。

🔷 如果没有指定index属性，那么操作步骤如下：

- 解析constructor-arg的子元素。
- 使用ConstructorArgumentValues.ValueHolder类型来封装解析出来的元素，将type、name和index属性一并封装ConstructorArgumentValues.ValueHolder类型中并添加至当前BeanDefinition的constructorArgumentValues的genericArgumentValues属性中。

可以看到，对于是否制定index属性来讲，Spring的处理流程是不同的，关键在于属性信息被保存的位置，上面都涉及到一段关键代码我们再来看他的分析
**BeanDefinitionParserDelegate**
```java
	@Nullable
	public Object parsePropertyValue(Element ele, BeanDefinition bd, @Nullable String propertyName) {
		String elementName = (propertyName != null ?
				"<property> element for property '" + propertyName + "'" :
				"<constructor-arg> element");

		// Should only have one child element: ref, value, list, etc.
		// 应该只有一个子元素：ref，value，list等。
		NodeList nl = ele.getChildNodes();
		Element subElement = null;
		// 遍历子元素
		for (int i = 0; i < nl.getLength(); i++) {
			Node node = nl.item(i);
			// 如果是元素节点, 并且不是description或者meta元素
			if (node instanceof Element && !nodeNameEquals(node, DESCRIPTION_ELEMENT) &&
					!nodeNameEquals(node, META_ELEMENT)) {
				// Child element is what we're looking for.
				if (subElement != null) {
					error(elementName + " must not contain more than one sub-element", ele);
				}
				else {
					subElement = (Element) node;
				}
			}
		}
		// ref属性
		boolean hasRefAttribute = ele.hasAttribute(REF_ATTRIBUTE);
		// value属性
		boolean hasValueAttribute = ele.hasAttribute(VALUE_ATTRIBUTE);
		// 如果ref属性和value属性都存在, 或者ref属性和value属性都不存在, 并且子元素不为空
		if ((hasRefAttribute && hasValueAttribute) ||
				((hasRefAttribute || hasValueAttribute) && subElement != null)) {
			error(elementName +
					" is only allowed to contain either 'ref' attribute OR 'value' attribute OR sub-element", ele);
		}
		// 如果有ref属性
		if (hasRefAttribute) {
			// 获取ref属性的值
			String refName = ele.getAttribute(REF_ATTRIBUTE);
			if (!StringUtils.hasText(refName)) {
				error(elementName + " contains empty 'ref' attribute", ele);
			}
			// 创建RuntimeBeanReference对象
			RuntimeBeanReference ref = new RuntimeBeanReference(refName);
			// 设置source
			ref.setSource(extractSource(ele));
			return ref;
		}
		// 如果有value属性
		else if (hasValueAttribute) {
			// 创建TypedStringValue对象
			TypedStringValue valueHolder = new TypedStringValue(ele.getAttribute(VALUE_ATTRIBUTE));
			// 设置source
			valueHolder.setSource(extractSource(ele));
			return valueHolder;
		}
		else if (subElement != null) {
			return parsePropertySubElement(subElement, bd);
		}
		else {
			// Neither child element nor "ref" or "value" attribute found.
			error(elementName + " must specify a ref or value", ele);
			return null;
		}
	}
```
我们来总结一下上面的代码步骤：
🔷略过description或者meta
🔷提取constructor-arg上的ref和value属性，以便于根据规则验证正确性，其规则为在constructor-arg上不存在以下情况。

-  同时既有ref属性又有value属性。
- 存在ref属性或者value属性且又有子元素。

🔷ref属性的处理。使用RuntimeBeanReference封装对应的ref名称。
```java
        <constructor-arg ref="a" >
```
🔷value属性的处理。使用TypedStringValue封装。
```java
        <constructor-arg value="a" >
```
🔷子元素的处理
```java
            <constructor-arg>
                   <map>
                      <entry key="key" value="value" />
                </map>
            </constructor-arg>
```
对于子元素的处理我们接着看看方法
**BeanDefinitionParserDelegate**
```java
        public Object parsePropertySubElement(Element ele, BeanDefinition bd) {
                  return parsePropertySubElement(ele, bd, null);
        }

        public Object parsePropertySubElement(Element ele, BeanDefinition bd, String defaultValueType) {
                  if (!isDefaultNamespace(ele)) {
                      return parseNestedCustomElement(ele, bd);
                  }
                  else if (nodeNameEquals(ele, BEAN_ELEMENT)) {
                      BeanDefinitionHolder nestedBd = parseBeanDefinitionElement(ele, bd);
                      if (nestedBd != null) {
                          nestedBd = decorateBeanDefinitionIfRequired(ele, nestedBd, bd);
                      }
                      return nestedBd;
                  }
                  else if (nodeNameEquals(ele, REF_ELEMENT)) {
                      // A generic reference to any name of any bean.
                      String refName = ele.getAttribute(BEAN_REF_ATTRIBUTE);
                      boolean toParent = false;
                      if (!StringUtils.hasLength(refName)) {
                          //解析local
                          refName = ele.getAttribute(LOCAL_REF_ATTRIBUTE);
                          if (!StringUtils.hasLength(refName)) {
                                //解析parent
                                refName = ele.getAttribute(PARENT_REF_ATTRIBUTE);
                                toParent = true;
                                if (!StringUtils.hasLength(refName)) {
                  error("'bean', 'local' or 'parent' is required for <ref> element", ele);
                  return null;
                                }
                          }
                      }
                      if (!StringUtils.hasText(refName)) {
                          error("<ref> element contains empty target attribute", ele);
                          return null;
                      }
                      RuntimeBeanReference ref = new RuntimeBeanReference(refName, toParent);
                      ref.setSource(extractSource(ele));
                      return ref;
                  }
                  //对idref元素的解析
                else if (nodeNameEquals(ele, IDREF_ELEMENT)) {
                      return parseIdRefElement(ele);
                }
                //对value子元素的解析
                else if (nodeNameEquals(ele, VALUE_ELEMENT)) {
                      return parseValueElement(ele, defaultValueType);
                }
                //对null子元素的解析
                else if (nodeNameEquals(ele, NULL_ELEMENT)) {
                      // It's a distinguished null value. Let's wrap it in a TypedStringValue
                      // object in order to preserve the source location.
                      TypedStringValue nullHolder = new TypedStringValue(null);
                      nullHolder.setSource(extractSource(ele));
                      return nullHolder;
                }
                else if (nodeNameEquals(ele, ARRAY_ELEMENT)) {
                      //解析array子元素
                      return parseArrayElement(ele, bd);
                }
                else if (nodeNameEquals(ele, LIST_ELEMENT)) {
                      //解析list子元素
                      return parseListElement(ele, bd);
                }
                else if (nodeNameEquals(ele, SET_ELEMENT)) {
                      //解析set子元素
                      return parseSetElement(ele, bd);
                }
                else if (nodeNameEquals(ele, MAP_ELEMENT)) {
                      //解析map子元素
                      return parseMapElement(ele, bd);
                }
                else if (nodeNameEquals(ele, PROPS_ELEMENT)) {
                      //解析props子元素
                      return parsePropsElement(ele);
                }
                else {
                      error("Unknown property sub-element: [" + ele.getNodeName() + "]", ele);
                      return null;
                }
        }
```
后面我们在详细介绍
#### 1.3.1.8 解析property元素
parsePropertyElement函数完成了对property属性的提取
```java
    <bean id="test" class="test.TestClass">
      <property name="testStr" value="aaa"/>
    </bean>
```
```java
    <bean id="a">
        <property name="p">
             <list>
                <value>aa</value>
                <value>bb</value>
                </list>
             </property>
    </bean>
```
**BeanDefinitionParserDelegate**
```java
 public void parsePropertyElements(Element beanEle, BeanDefinition bd) {
                  NodeList nl = beanEle.getChildNodes();
                  for (int i = 0; i < nl.getLength(); i++) {
                      Node node = nl.item(i);
                      if (isCandidateElement(node) && nodeNameEquals(node, PROPERTY_ELEMENT)) {
                          parsePropertyElement((Element) node, bd);
                      }
                  }
        }
```
```java
	public void parsePropertyElement(Element ele, BeanDefinition bd) {
		//获取配置元素中name的值
		String propertyName = ele.getAttribute(NAME_ATTRIBUTE);
		if (!StringUtils.hasLength(propertyName)) {
			error("Tag 'property' must have a 'name' attribute", ele);
			return;
		}
		this.parseState.push(new PropertyEntry(propertyName));
		try {
			//不允许多次对同一属性配置
			if (bd.getPropertyValues().contains(propertyName)) {
				error("Multiple 'property' definitions for property '" + propertyName + "'", ele);
				return;
			}
			Object val = parsePropertyValue(ele, bd, propertyName);
			PropertyValue pv = new PropertyValue(propertyName, val);
			parseMetaElements(ele, pv);
			pv.setSource(extractSource(ele));
			bd.getPropertyValues().addPropertyValue(pv);
		}
		finally {
			this.parseState.pop();
		}

```
可以看到上面函数与构造函数注入方式不同的是将返回值使用PropertyValue进行封装，并记录在了BeanDefinition中的propertyValues属性中。
#### 1.3.1.9 解析qualifier元素

- 对于qualifier元素的获取，我们接触更多的是注解的形式，在使用Spring框架中进行自动注入时，Spring容器中匹配的候选Bean数目必须有且仅有一个。
- 当找不到一个匹配的Bean时， Spring容器将抛出BeanCreationException异常，并指出必须至少拥有一个匹配的Bean。
```java
        <bean id="myTestBean" class="bean.MyTestBean">
            <qualifier type="org.Springframework.beans.factory.annotation.Qualifier" value="qf"/>
        </bean>
```
**BeanDefinitionParserDelegate**
```java
	public void parseQualifierElement(Element ele, AbstractBeanDefinition bd) {
		String typeName = ele.getAttribute(TYPE_ATTRIBUTE);
		if (!StringUtils.hasLength(typeName)) {
			error("Tag 'qualifier' must have a 'type' attribute", ele);
			return;
		}
		this.parseState.push(new QualifierEntry(typeName));
		try {
			AutowireCandidateQualifier qualifier = new AutowireCandidateQualifier(typeName);
			qualifier.setSource(extractSource(ele));
			String value = ele.getAttribute(VALUE_ATTRIBUTE);
			if (StringUtils.hasLength(value)) {
				qualifier.setAttribute(AutowireCandidateQualifier.VALUE_KEY, value);
			}
			NodeList nl = ele.getChildNodes();
			for (int i = 0; i < nl.getLength(); i++) {
				Node node = nl.item(i);
				if (isCandidateElement(node) && nodeNameEquals(node, QUALIFIER_ATTRIBUTE_ELEMENT)) {
					Element attributeEle = (Element) node;
					String attributeName = attributeEle.getAttribute(KEY_ATTRIBUTE);
					String attributeValue = attributeEle.getAttribute(VALUE_ATTRIBUTE);
					if (StringUtils.hasLength(attributeName) && StringUtils.hasLength(attributeValue)) {
						BeanMetadataAttribute attribute = new BeanMetadataAttribute(attributeName, attributeValue);
						attribute.setSource(extractSource(attributeEle));
						qualifier.addMetadataAttribute(attribute);
					}
					else {
						error("Qualifier 'attribute' tag must have a 'name' and 'value'", attributeEle);
						return;
					}
				}
			}
			bd.addQualifier(qualifier);
		}
		finally {
			this.parseState.pop();
		}
	}
```

- 对此我们就完成对XML文档到GenericBeanDefinition的转换，也就是说到这里，XML中所有的配置都可以在GenericBeanDefinition的实例类中找到对应的配置。
- 从前面的代码中我们可以看到，AbstractBeanDefinition就是一个载体，装载了我们配置解析的元素，下面我们具体来看看这个类的配置信息
### 1.3.2 AbstractBeanDefinition
**AbstractBeanDefinition**
```java
public abstract class AbstractBeanDefinition extends BeanMetadataAttributeAccessor
		implements BeanDefinition, Cloneable {
	//此处省略静态变量以及final常量
	/**
	 * bean的作用范围,对应bean属性scope
	 */
	private String scope = SCOPE_DEFAULT;
	/**
	 * 是否是单例,来自bean属性scope
	 */
	private boolean singleton = true;
	/**
	 * 是否是原型,来自bean属性scope
	 */
	private boolean prototype = false;
	/**
	 * 是否是抽象，对应bean属性abstract
	 */
	private boolean abstractFlag = false;
	/**
	 * 是否延迟加载,对应bean属性lazy-init
	 */
	private boolean lazyInit = false;
	/**
	 * 自动注入模式,对应bean属性autowire
	 */
	private int autowireMode = AUTOWIRE_NO;
	/**
	 * 依赖检查，Spring 3.0后弃用这个属性
	 */
	private int dependencyCheck = DEPENDENCY_CHECK_NONE;
	/**
	 * 用来表示一个bean的实例化依靠另一个bean先实例化,对应bean属性depend-on
	 */
	private String[] dependsOn;
	/**
	 * autowire-candidate属性设置为false，这样容器在查找自动装配对象时，
	 * 将不考虑该bean，即它不会被考虑作为其他bean自动装配的候选者，但是该bean本身还是可以使用自动
	 装配来注入其他bean的。
	 *  对应bean属性autowire-candidate
	 */
	private boolean autowireCandidate = true;
	/**
	 * 自动装配时当出现多个bean候选者时，将作为首选者,对应bean属性primary
	 */
	private boolean primary = false;
	/**
	 * 用于记录Qualifier，对应子元素qualifier
	 */
	private final Map<String, AutowireCandidateQualifier> qualifiers =
			new LinkedHashMap<String, AutowireCandidateQualifier>(0);
	/**
	 * 允许访问非公开的构造器和方法，程序设置
	 */
	private boolean nonPublicAccessAllowed = true;
	/**
	 * 是否以一种宽松的模式解析构造函数，默认为true,
	 * 如果为false,则在如下情况
	 * interface ITest{}
	 * class  ITestImpl implements ITest{};
	 * class Main{
	 *   Main(ITest i){}
	 *   Main(ITestImpl i){}
	 * }
	 * 抛出异常，因为Spring无法准确定位哪个构造函数
	 * 程序设置
	 */
	private boolean lenientConstructorResolution = true;
	/**
	 * 记录构造函数注入属性，对应bean属性constructor-arg
	 */
	private ConstructorArgumentValues constructorArgumentValues;
	/**
	 * 普通属性集合
	 */
	private MutablePropertyValues propertyValues;
	/**
	 * 方法重写的持有者 ,记录lookup-method、replaced-method元素
	 */
	private MethodOverrides methodOverrides = new MethodOverrides();
	/**
	 * 对应bean属性factory-bean，用法：
	 * <bean id="instanceFactoryBean" class="example.chapter3.InstanceFactoryBean"/>
	 *  <bean  id="currentTime"  factory-bean="instanceFactoryBean"  factory-method="
	 createTime"/>
	 */
	private String factoryBeanName;
	/**
	 * 对应bean属性factory-method
	 */
	private String factoryMethodName;
	/**
	 * 初始化方法，对应bean属性init-method
	 */
	private String initMethodName;
	/**
	 * 销毁方法，对应bean属性destory-method
	 */
	private String destroyMethodName;
	/**
	 * 是否执行init-method，程序设置
	 */
	private boolean enforceInitMethod = true;
	/**
	 * 是否执行destory-method，程序设置
	 */
	private boolean enforceDestroyMethod = true;
	/**
	 * 是否是用户定义的而不是应用程序本身定义的,创建AOP时候为true，程序设置
	 */
	private boolean synthetic = false;
	/**
	 *定义这个bean的应用 ，APPLICATION：用户，INFRASTRUCTURE：完全内部使用，与用户无关，SUPPORT：
	 某些复杂配置的一部分
	 * 程序设置
	 */
	private int role = BeanDefinition.ROLE_APPLICATION;
	/**
	 * bean的描述信息
	 */
	private String description;
	/**
	 * 这个bean定义的资源
	 */
	private Resource resource;
	//此处省略set/get方法
}
```
到这我们已经对分析默认标签的解析与提取过程的分析完毕，让我们回到最开始的地方的源码分析
**DefaultBeanDefinitionDocumentReader**
```java
/**
	 * 解析bean标签
	 * @param ele
	 * @param delegate
	 */
	protected void processBeanDefinition(Element ele, BeanDefinitionParserDelegate delegate) {
		// 解析bean标签，返回BeanDefinitionHolder对象
		BeanDefinitionHolder bdHolder = delegate.parseBeanDefinitionElement(ele);
		// 判空处理
		if (bdHolder != null) {
			// 解析bean标签的子标签
			bdHolder = delegate.decorateBeanDefinitionIfRequired(ele, bdHolder);
			try {
				// Register the final decorated instance.
				// 注册bean
				BeanDefinitionReaderUtils.registerBeanDefinition(bdHolder, getReaderContext().getRegistry());
			}
			catch (BeanDefinitionStoreException ex) {
				getReaderContext().error("Failed to register bean definition with name '" +
						bdHolder.getBeanName() + "'", ele, ex);
			}
			// Send registration event.
			// 解析成功后，进行监听器激活处理
			getReaderContext().fireComponentRegistered(new BeanComponentDefinition(bdHolder));
		}
	}
```

- 接下来，我们要进行bdHolder = delegate.decorateBean DefinitionIfRequired(ele, bdHolder)代码的分析，当Spring中的bean使用的是默认的标签配置，但是其中的子元素却使用了自定义的配置时，这句代码便会起作用了。
```java
              <bean id="test" class="test.MyClass">
                      <mybean:user username="aaa"/>
              </bean>
```
可能有人会有疑问，之前讲过，对bean的解析分为两种类型，一种是默认类型的解析，另一种是自定义类型的解析，这不正是自定义类型的解析吗？为什么会在默认类型解析中单独添加一个方法处理呢？确实，这个问题很让人迷惑，但是，不知道聪明的读者是否有发现，这个自定义类型并不是以Bean的形式出现的呢？我们之前讲过的两种类型的不同处理只是针对Bean的，这里我们看到，这个自定义类型其实是属性。
**DefaultBeanDefinitionDocumentReader**
```java
        public BeanDefinitionHolder decorateBeanDefinitionIfRequired(
            Element ele, BeanDefinitionHolder definitionHolder, BeanDefinition containingBd) {
                    BeanDefinitionHolder finalDefinition = definitionHolder;
                    NamedNodeMap attributes = ele.getAttributes();
                //遍历所有的属性，看看是否有适用于修饰的属性
                    for (int i = 0; i < attributes.getLength(); i++) {
                        Node node = attributes.item(i);
                        finalDefinition=decorateIfRequired(node,finalDefinition,containingBd);
                    }
                NodeList children = ele.getChildNodes();
                //遍历所有的子节点，看看是否有适用于修饰的子元素
                    for (int i = 0; i < children.getLength(); i++) {
                        Node node = children.item(i);
                        if (node.getNodeType() == Node.ELEMENT_NODE) {
                            finalDefinition=decorateIfRequired(node,finalDefinition,containingBd);
                        }
                    }
                    return finalDefinition;
        }
```
上面的代码，我们看到decorateIfRequired方法 ，我们继续分析
**DefaultBeanDefinitionDocumentReader**
```java
        private BeanDefinitionHolder decorateIfRequired(
                Node node, BeanDefinitionHolder originalDef, BeanDefinition containingBd) {
              //获取自定义标签的命名空间
                String namespaceUri = getNamespaceURI(node);
              //对于非默认标签进行修饰
                if (!isDefaultNamespace(namespaceUri)) {
              //根据命名空间找到对应的处理器
                          NamespaceHandler handler=this.readerContext.getNamespaceHandler Resolver().
    resolve(namespaceUri);
                      if (handler != null) {
              //进行修饰
                          return handler.decorate(node, originalDef, new ParserContext(this.readerContext,
    this, containingBd));
                      }
                      else if (namespaceUri != null && namespaceUri.startsWith("http: //www.
    Springframework.org/")) {
                          error("Unable to locate Spring NamespaceHandler for XML schema namespace
    [" + namespaceUri + "]", node);
                      }
                      else {
                          // A custom namespace, not to be handled by Spring - maybe "xml:...".
                          if (logger.isDebugEnabled()) {
                                logger.debug("No Spring NamespaceHandler found for XML schema
    namespace [" + namespaceUri + "]");
                          }
                      }
                  }
                  return originalDef;
        }
        public String getNamespaceURI(Node node) {
                  return node.getNamespaceURI();
        }
        public boolean isDefaultNamespace(String namespaceUri) {
                  //BEANS_NAMESPACE_URI = "http://www.Springframework.org/schema/beans";
                  return  (!StringUtils.hasLength(namespaceUri)  ||  BEANS_NAMESPACE_URI.equals
    (namespaceUri));
        }
```
程序走到这里，条理其实已经非常清楚了，首先获取属性或者元素的命名空间，以此来判断该元素或者属性是否适用于自定义标签的解析条件，找出自定义类型所对应的NamespaceHandler并进行进一步解析，具体的解析我们后面自定义标签再来分析
### 1.3.3 注册解析的BeanDefinition
对于配置文件，解析也解析完了，装饰也装饰完了，对于得到的beanDinition已经可以满足后续的使用要求了，唯一还剩下的工作就是注册了，下面我们来分析注册吧
```java
public static void registerBeanDefinition(
                      BeanDefinitionHolder definitionHolder, BeanDefinitionRegistry registry)
                      throws BeanDefinitionStoreException {
                //使用beanName做唯一标识注册
                String beanName = definitionHolder.getBeanName();
                registry.registerBeanDefinition(beanName, definitionHolder.getBeanDefinition());
              //注册所有的别名
                String[] aliases = definitionHolder.getAliases();
                if (aliases != null) {
                      for (String aliase : aliases) {
                          registry.registerAlias(beanName, aliase);
                      }
                }
              }
```
从上面的代码可以看出，解析的beanDefinition都会被注册到BeanDefinitionRegistry类型的实例registry中，而对于beanDefinition的注册分成了两部分：通过beanName的注册以及通过别名的注册下面我们分别来看看。
#### 1.3.3.1 通过beanName注册BeanDefinition
```java
        public void registerBeanDefinition(String beanName, BeanDefinition beanDefinition)
                      throws BeanDefinitionStoreException {
                Assert.hasText(beanName, "Bean name must not be empty");
                Assert.notNull(beanDefinition, "BeanDefinition must not be null");
                if (beanDefinition instanceof AbstractBeanDefinition) {
                      try {
                          /*
                          * 注册前的最后一次校验，这里的校验不同于之前的XML文件校验，
                          * 主要是对于AbstractBeanDefinition属性中的methodOverrides校验，
                          * 校验methodOverrides是否与工厂方法并存或者methodOverrides对应的方法根本不存在
                          */
                          ((AbstractBeanDefinition) beanDefinition).validate();
                      }
                      catch (BeanDefinitionValidationException ex) {
                          throw new BeanDefinitionStoreException (beanDefinition. getResource
    Description(), beanName,
                                  "Validation of bean definition failed", ex);
                      }
                }
                //因为beanDefinitionMap是全局变量，这里定会存在并发访问的情况
                synchronized (this.beanDefinitionMap) {
                      Object oldBeanDefinition = this.beanDefinitionMap.get(beanName);
                      //处理注册已经注册的beanName情况
                      if (oldBeanDefinition != null) {
                          //如果对应的BeanName已经注册且在配置中配置了bean不允许被覆盖，则抛出异常。
                          if (!this.allowBeanDefinitionOverriding) {
                                throw new BeanDefinitionStoreException(beanDefinition. getResource
    Description(), beanName,
                                        "Cannot register bean definition [" + beanDefinition +
    "] for bean '" + beanName +
                                        "': There is already [" + oldBeanDefinition + "] bound.");
                          }else {
                                if (this.logger.isInfoEnabled()) {
                  this.logger.info("Overriding bean definition for bean '" + beanName +
                                            "': replacing [" + oldBeanDefinition + "] with ["
    + beanDefinition + "]");
                                }
                          }
                      }else {
                          //记录beanName
                          this.beanDefinitionNames.add(beanName);
                          this.frozenBeanDefinitionNames = null;
                      }
                      //注册beanDefinition
                      this.beanDefinitionMap.put(beanName, beanDefinition);
                  }
                  //重置所有beanName对应的缓存
                  resetBeanDefinition(beanName);
        }
```
上面的代码中我们看到，在对于bean的注册处理方式上，主要进行了几个步骤。
（1）对AbstractBeanDefinition的校验，在解析XML文件的时候我们提过校验，但是此校验非彼校验，之前的校验时针对于XML格式的校验，而此时的校验时针是对于AbstractBean Definition的methodOverrides属性的
（2）对beanName已经注册的情况的处理，如果设置了不允许bean的覆盖，则需要抛出异常，否则直接覆盖
（3）加入map缓存
（4）清除解析之前留下的对应beanName的缓存
#### 1.3.3.2 通过别名注册BeanDefinition
在理解了注册bean的原理后，理解注册别名的原理就容易多了。
```java
        public void registerAlias(String name, String alias) {
                  Assert.hasText(name, "'name' must not be empty");
                  Assert.hasText(alias, "'alias' must not be empty");
                  //如果beanName与alias相同的话不记录alias,并删除对应的alias
                  if (alias.equals(name)) {
                      this.aliasMap.remove(alias);
                  }else {
                      //如果alias不允许被覆盖则抛出异常
                      if (!allowAliasOverriding()) {
                          String registeredName = this.aliasMap.get(alias);
                          if (registeredName != null && !registeredName.equals(name)) {
                              throw new IllegalStateException("Cannot register alias '" + alias
    + "' for name '" +
                                      name  +  "':  It  is  already  registered  for  name  '"  +
    registeredName + "'.");
                          }
                      }
                      //当A->B存在时，若再次出现A->C->B时候则会抛出异常
                      checkForAliasCircle(name, alias);
                      this.aliasMap.put(alias, name);
                }
        }
```
由以上代码中可以得知注册alias的步骤如下：
（1）alias与beanName相同情况处理。若alias与beanName并名称相同则不需要处理并删除掉原有alias。
（2）alias覆盖处理。若aliasName已经使用并已经指向了另一beanName则需要用户的设置进行处理。
（3）alias循环检查。当A->B存在时，若再次出现A->C->B时候则会抛出异常。
（4）注册alias。
### 1.3.4 通知监听器解析及注册完成

- getReaderContext().fireComponentRegistered(newBeanComponentDefinition(bdHolder))完成此工作，这里的实现只为扩展。
- 当程序开发人员需要对注册BeanDefinition事件进行监听时可以通过注册监听器的方式并将处理逻辑写入监听器中，目前在Spring中并没有对此事件做任何逻辑处理。
## 1.2 import标签的解析
当项目工程比较大，需要维护的配置文件也会更加复杂，数量也会更多，由于维护的人员分工不同，可能会产生很多个配置文件，这个时候如果想要将所有的配置文件整合到一个 XML 文件中，就需要利用 import 标签。
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd">

    <import resource="spring-student.xml"/>
    <import resource="spring-user.xml"/>
</beans>
```
我们来编写一个测试案例
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681882822899-e174cfda-3481-48f1-88ce-8a65cb6a2194.png#averageHue=%23ab755d&clientId=ud2aaa960-e53e-4&from=paste&height=385&id=Z23aB&originHeight=481&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=42934&status=done&style=none&taskId=u2c9130f7-5a55-47f8-9b0a-7ab22535235&title=&width=1536)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
  <import resource="spring-student.xml"/>
</beans>
```
打上断点，调试看一下
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681882978108-84288bfd-e9d3-4f7d-8a64-2ebfd39fd352.png#averageHue=%234b564b&clientId=ud2aaa960-e53e-4&from=paste&height=589&id=ETOwJ&originHeight=736&originWidth=1879&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=226114&status=done&style=none&taskId=u552a0a30-96e2-4f3f-a77b-2cb3b274cf7&title=&width=1503.2)
**DefaultBeanDefinitionDocumentReader**
```java
protected void importBeanDefinitionResource(Element ele) {
    // 获取 resource 的属性值
    String location = ele.getAttribute("resource");
//判空处理
if (!StringUtils.hasText(location)) {
    this.getReaderContext().error("Resource location must not be empty", ele);
} else {
    // 解析系统属性，格式如 ："${user.dir}",也就是占位符替换
    location = this.getReaderContext().getEnvironment().resolveRequiredPlaceholders(location);
    Set<Resource> actualResources = new LinkedHashSet(4);
    // 判断 location 是相对路径还是绝对路径
    boolean absoluteLocation = false;

    try {
        absoluteLocation = ResourcePatternUtils.isUrl(location) || ResourceUtils.toURI(location).isAbsolute();
    } catch (URISyntaxException var11) {
    }

    int importCount;
    // 绝对路径
    if (absoluteLocation) {
        try {
            // 直接根据地质加载相应的配置文件
            importCount = this.getReaderContext().getReader().loadBeanDefinitions(location, actualResources);
            if (this.logger.isTraceEnabled()) {
                this.logger.trace("Imported " + importCount + " bean definitions from URL location [" + location + "]");
            }
        } catch (BeanDefinitionStoreException var10) {
            this.getReaderContext().error("Failed to import bean definitions from URL location [" + location + "]", ele, var10);
        }
    } else {
        try {
            // 相对路径则根据相应的地质计算出绝对路径地址
            Resource relativeResource = this.getReaderContext().getResource().createRelative(location);
            if (relativeResource.exists()) {
                importCount = this.getReaderContext().getReader().loadBeanDefinitions(relativeResource);
                actualResources.add(relativeResource);
            } else {
                String baseLocation = this.getReaderContext().getResource().getURL().toString();
                importCount = this.getReaderContext().getReader().loadBeanDefinitions(StringUtils.applyRelativePath(baseLocation, location), actualResources);
            }

            if (this.logger.isTraceEnabled()) {
                this.logger.trace("Imported " + importCount + " bean definitions from relative location [" + location + "]");
            }
        } catch (IOException var8) {
            this.getReaderContext().error("Failed to resolve current resource location", ele, var8);
        } catch (BeanDefinitionStoreException var9) {
            this.getReaderContext().error("Failed to import bean definitions from relative location [" + location + "]", ele, var9);
        }
    }

    // 解析成功后，进行监听器激活处理
    Resource[] actResArray = (Resource[])actualResources.toArray(new Resource[0]);
    this.getReaderContext().fireImportProcessed(location, actResArray, this.extractSource(ele));
}
}
```
我们来看看上面的步骤：

1. 获取 source 属性的值，该值表示资源的路径
2. 解析路径中的系统属性，如"${user.dir}"
3. 判断资源路径 location 是绝对路径还是相对路径
4. 如果是绝对路径，则调递归调用 Bean 的解析过程，进行另一次的解析
5. 如果是相对路径，则先计算出绝对路径得到 Resource，然后进行解析
6. 通知监听器，完成解析

首先我们来看看绝对路径的判断标准吧
```java
absoluteLocation = ResourcePatternUtils.isUrl(location) || ResourceUtils.toURI(location).isAbsolute();
```
判断绝对路径的规则如下：

- 以 classpath*: 或者 classpath: 开头为绝对路径
- 能够通过该 location 构建出 java.net.URL为绝对路径
- 根据 location 构造 java.net.URI 判断调用 isAbsolute() 判断是否为绝对路径

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681883152428-7354e2f5-2bec-469b-9cfe-7512dbfbc7eb.png#averageHue=%234b564b&clientId=ud2aaa960-e53e-4&from=paste&height=608&id=Q39wn&originHeight=760&originWidth=1865&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=218022&status=done&style=none&taskId=u4fc6519f-3366-4778-9b12-49b57739bef&title=&width=1492)
绝对路径判断完毕之后，我们就可以发现实际上关键代码loadBeanDefinitions()
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681883233081-eb40140d-6fc1-4285-9488-c8510c040585.png#averageHue=%234b574b&clientId=ud2aaa960-e53e-4&from=paste&height=689&id=oR6qH&originHeight=861&originWidth=1881&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=254870&status=done&style=none&taskId=u902b6167-efcb-41aa-aa46-a89ba868ea5&title=&width=1504.8)
```java
// 直接根据地址加载相应的配置文件
importCount = this.getReaderContext().getReader().loadBeanDefinitions(location, actualResources);
```
我们可以来分析一下他的源码设计吧
**AbstractBeanDefinitionReader**
```java

/**
	 * 从指定的资源位置加载bean定义。
	 * @param location
	 * @param actualResources
	 * @return
	 * @throws BeanDefinitionStoreException
	 */
	public int loadBeanDefinitions(String location, @Nullable Set<Resource> actualResources) throws BeanDefinitionStoreException {
		ResourceLoader resourceLoader = getResourceLoader();
		if (resourceLoader == null) {
			throw new BeanDefinitionStoreException(
					"Cannot load bean definitions from location [" + location + "]: no ResourceLoader available");
		}
		// ResourcePatternResolver是ResourceLoader的子接口，用于加载资源的匹配模式。
		if (resourceLoader instanceof ResourcePatternResolver) {
			// Resource pattern matching available.
			try {
				Resource[] resources = ((ResourcePatternResolver) resourceLoader).getResources(location);
				int count = loadBeanDefinitions(resources);
				if (actualResources != null) {
					Collections.addAll(actualResources, resources);
				}
				if (logger.isTraceEnabled()) {
					logger.trace("Loaded " + count + " bean definitions from location pattern [" + location + "]");
				}
				return count;
			}
			catch (IOException ex) {
				throw new BeanDefinitionStoreException(
						"Could not resolve bean definition resource pattern [" + location + "]", ex);
			}
		}
		// 只能加载单个资源的绝对URL。
		else {
			// Can only load single resources by absolute URL.
			Resource resource = resourceLoader.getResource(location);
			int count = loadBeanDefinitions(resource);
			if (actualResources != null) {
				actualResources.add(resource);
			}
			if (logger.isTraceEnabled()) {
				logger.trace("Loaded " + count + " bean definitions from location [" + location + "]");
			}
			return count;
		}
	}

```

- 该方法首先获取资源加载器（ResourceLoader），如果没有可用的资源加载器，则抛出BeanDefinitionStoreException异常。
- 该方法检查资源加载器是否实现了ResourcePatternResolver接口，如果是，则可以使用资源模式匹配加载多个资源，并调用loadBeanDefinitions(resources)方法加载Bean定义。如果actualResources参数不为null，则记录已加载的资源。
- 如果资源加载器没有实现ResourcePatternResolver接口，则只能加载单个资源的绝对URL，方法调用resourceLoader.getResource(location)获取单个资源，并调用loadBeanDefinitions(resource)方法加载Bean定义。如果actualResources参数不为null，则记录已加载的资源。
- 最后，方法返回已加载的Bean定义数量，并在日志中记录此次加载操作的结果。如果日志级别为TRACE，则记录详细的信息。如果加载失败，则抛出BeanDefinitionStoreException异常。
- 但是最终都会回归到 XmlBeanDefinitionReader.loadBeanDefinitions() ，所以这是一个递归的过程。

至此，import 标签解析完毕，整个过程比较清晰明了：**获取 source 属性值，得到正确的资源路径，然后调用 loadBeanDefinitions() 方法进行递归的 BeanDefinition 加载。**
## 1.3 alias标签的解析
对 bean 进行定义时，除了用id来 指定名称外，为了提供多个名称，可以使用 name 属性来指定。而所有这些名称都指向同一个 bean。在 XML 配置文件中，可用单独的元素来完成 bean 别名的定义。我们可以直接使用 bean 标签中的 name 属性
```java
<bean id="user" class="com.msdn.bean.User" name="user2,user3">
    <constructor-arg name="name" value="hresh" />
</bean>
```
在 Spring 还可以使用 alias 来声明别名：
```java
<bean id="user" class="com.msdn.bean.User" />
<alias name="user" alias="user2,user3"/>
```
下面我们来看看关于alias标签的解析，主要方法processAliasRegistration（）
**DefaultBeanDefinitionDocumentReader**
```java
	/**
	 * 解析alias标签
	 * @param ele
	 */
	protected void processAliasRegistration(Element ele) {
		// 获取name和alias属性值
		String name = ele.getAttribute(NAME_ATTRIBUTE);
		String alias = ele.getAttribute(ALIAS_ATTRIBUTE);
		boolean valid = true;
		// 判空处理
		if (!StringUtils.hasText(name)) {
			getReaderContext().error("Name must not be empty", ele);
			valid = false;
		}
		if (!StringUtils.hasText(alias)) {
			getReaderContext().error("Alias must not be empty", ele);
			valid = false;
		}
		//
		if (valid) {
			try {
				// 注册别名
				getReaderContext().getRegistry().registerAlias(name, alias);
			}
			catch (Exception ex) {
				getReaderContext().error("Failed to register alias '" + alias +
						"' for bean with name '" + name + "'", ele, ex);
			}
			// 解析成功后，进行监听器激活处理
			getReaderContext().fireAliasRegistered(name, alias, extractSource(ele));
		}
	}
```
通过代码可以发现主要是将 beanName 与别名 alias 组成一对注册到 registry 中。跟踪代码最终使用了 SimpleAliasRegistry 中的 registerAlias(String name, String alias)方法 。
**SimpleAliasRegistry**
```java
	@Override
	public void registerAlias(String name, String alias) {
		Assert.hasText(name, "'name' must not be empty");
		Assert.hasText(alias, "'alias' must not be empty");
		synchronized (this.aliasMap) {
			// 检查别名是否已经存在
			if (alias.equals(name)) {
				//
				this.aliasMap.remove(alias);
				if (logger.isDebugEnabled()) {
					logger.debug("Alias definition '" + alias + "' ignored since it points to same name");
				}
			}
			else {
				// 检查别名是否已经存在
				String registeredName = this.aliasMap.get(alias);
				if (registeredName != null) {
					if (registeredName.equals(name)) {
						// An existing alias - no need to re-register
						return;
					}
					if (!allowAliasOverriding()) {
						throw new IllegalStateException("Cannot define alias '" + alias + "' for name '" +
								name + "': It is already registered for name '" + registeredName + "'.");
					}
					if (logger.isDebugEnabled()) {
						logger.debug("Overriding alias '" + alias + "' definition for registered name '" +
								registeredName + "' with new target name '" + name + "'");
					}
				}
                // 检查是否有循环引用
				checkForAliasCircle(name, alias);
				this.aliasMap.put(alias, name);
				if (logger.isTraceEnabled()) {
					logger.trace("Alias definition '" + alias + "' registered for name '" + name + "'");
				}
			}
		}
	}
```
上述代码的流程总结如下：

- alias 与 beanName 相同则不需要处理并删除原有的 alias
- alias 覆盖处理。 若 aliasName 已经使用并已经指向了另一 beanName 则需要用户的设置进行处理
- alias 循环检查，当A->B存在时，若再次出现A->C->B时候则会抛出异常。
