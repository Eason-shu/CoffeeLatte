---

title: Spring源码分析 （七） 不同作用域下Bean的创建
sidebar_position: 7
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

- 官网：[Home](https://spring.io/)
- 参考书籍：[Spring源码深度解析-郝佳编著-微信读书](https://weread.qq.com/web/bookDetail/0e232b205b260a0e29f3fb5)

上一篇文章我们分析到不同的作用域创建Bean，但是我们没有详细来解释，让我们回到关键的代码片段
**AbstractBeanFactory**
```java
        // Create bean instance.
	//创建单例Bean
	if (mbd.isSingleton()) {
		//这里使用了一个匿名内部类，创建Bean实例对象，并且注册给所依赖的对象
		sharedInstance = getSingleton(beanName, () -> {
			try {
				//创建一个指定Bean实例对象，如果有父级继承，则合并子类和父类的定义
				return createBean(beanName, mbd, args);
			}
			catch (BeansException ex) {
				// Explicitly remove instance from singleton cache: It might have been put there
				// eagerly by the creation process, to allow for circular reference resolution.
				// Also remove any beans that received a temporary reference to the bean.
				//显式地从容器单例模式Bean缓存中清除实例对象
				destroySingleton(beanName);
				throw ex;
			}
		});
		//获取给定Bean的实例对象
		bean = getObjectForBeanInstance(sharedInstance, name, beanName, mbd);
	}

	//创建多例Bean
	else if (mbd.isPrototype()) {
		//原型模式(Prototype)是每次都会创建一个新的对象
		Object prototypeInstance = null;
		try {
			//加载前置处理，默认的功能是注册当前创建的原型对象
			beforePrototypeCreation(beanName);
			//创建指定Bean对象实例
			prototypeInstance = createBean(beanName, mbd, args);
		}
		finally {
			//加载后置处理，默认的功能告诉IOC容器指定Bean的原型对象不再创建
			afterPrototypeCreation(beanName);
		}
		//获取给定Bean的实例对象
		bean = getObjectForBeanInstance(prototypeInstance, name, beanName, mbd);
	}

	//要创建的Bean既不是Singleton也不是Prototype
	//如：request、session、application等生命周期
	else {
		String scopeName = mbd.getScope();
		final Scope scope = this.scopes.get(scopeName);
		//Bean定义资源中没有配置生命周期范围，则Bean定义不合法
		if (scope == null) {
			throw new IllegalStateException("No Scope registered for scope name '" + scopeName + "'");
		}
		try {
			//这里又使用了一个匿名内部类，获取一个指定生命周期范围的实例
			Object scopedInstance = scope.get(beanName, () -> {
				//前置处理
				beforePrototypeCreation(beanName);
				try {
					return createBean(beanName, mbd, args);
				}
				finally {
					//后置处理
					afterPrototypeCreation(beanName);
				}
			});
			//获取给定Bean的实例对象
			bean = getObjectForBeanInstance(scopedInstance, name, beanName, mbd);
		}
		catch (IllegalStateException ex) {
			throw new BeanCreationException(beanName,
					"Scope '" + scopeName + "' is not active for the current thread; consider " +
					"defining a scoped proxy for this bean if you intend to refer to it from a singleton",
					ex);
		}
	}

```
**_这段代码的大体逻辑可以分为如下：_**

- **_singleton Bean实例化_**
- **_Prototype Bean实例化_**
- **_其他类型 Bean 实例化(session,request等)_**

**_下面我们来具体看看呗，让我们回顾一下Spring的作用域吧_**

| Scope | 说明 |
| --- | --- |
| [**_singleton_**](https://springdoc.cn/spring/core.html#beans-factory-scopes-singleton) | （默认情况下）为每个Spring IoC容器将单个Bean定义的Scope扩大到单个对象实例。 |
| [**_prototype_**](https://springdoc.cn/spring/core.html#beans-factory-scopes-prototype) | 将单个Bean定义的Scope扩大到任何数量的对象实例。 |
| [**_request_**](https://springdoc.cn/spring/core.html#beans-factory-scopes-request) | 将单个Bean定义的Scope扩大到单个HTTP请求的生命周期。也就是说，每个HTTP请求都有自己的Bean实例，该实例是在单个Bean定义的基础上创建的。只在Web感知的Spring ApplicationContext 的上下文中有效。 |
| [**_session_**](https://springdoc.cn/spring/core.html#beans-factory-scopes-session) | 将单个Bean定义的Scope扩大到一个HTTP Session 的生命周期。只在Web感知的Spring ApplicationContext 的上下文中有效。 |
| [**_application_**](https://springdoc.cn/spring/core.html#beans-factory-scopes-application) | 将单个Bean定义的 Scope 扩大到 ServletContext 的生命周期中。只在Web感知的Spring ApplicationContext 的上下文中有效。 |
| [**_websocket_**](https://springdoc.cn/spring/web.html#websocket-stomp-websocket-scope) | 将单个Bean定义的 Scope 扩大到 WebSocket 的生命周期。仅在具有Web感知的 Spring ApplicationContext 的上下文中有效。 |

## 1.1 单例模式的实例化

- 关键代码

**AbstractBeanFactory**
```java
     // Create bean instance.
	//创建单例Bean
	if (mbd.isSingleton()) {
		//这里使用了一个匿名内部类，创建Bean实例对象，并且注册给所依赖的对象
		sharedInstance = getSingleton(beanName, () -> {
			try {
				//创建一个指定Bean实例对象，如果有父级继承，则合并子类和父类的定义
				return createBean(beanName, mbd, args);
			}
			catch (BeansException ex) {
				// Explicitly remove instance from singleton cache: It might have been put there
				// eagerly by the creation process, to allow for circular reference resolution.
				// Also remove any beans that received a temporary reference to the bean.
				//显式地从容器单例模式Bean缓存中清除实例对象
				destroySingleton(beanName);
				throw ex;
			}
		});
		//获取给定Bean的实例对象
		bean = getObjectForBeanInstance(sharedInstance, name, beanName, mbd);
	}
```
我们可以看到他的关键代码在于getSingleton方法，下面我们来看看这个方法
**_DefaultSingletonBeanRegistry_**
```java

public Object getSingleton(String beanName, ObjectFactory<?> singletonFactory) {
	Assert.notNull(beanName, "Bean name must not be null");
//全局加锁
synchronized (this.singletonObjects) {
	// 从缓存中获取单例bean
	// 因为 singleton 模式其实就是复用已经创建的 bean 所以这步骤必须检查
	Object singletonObject = this.singletonObjects.get(beanName);
	if (singletonObject == null) {
		//是否正在销毁该bean
		if (this.singletonsCurrentlyInDestruction) {
			throw new BeanCreationNotAllowedException(beanName,
					"Singleton bean creation not allowed while singletons of this factory are in destruction " +
					"(Do not request a bean from a BeanFactory in a destroy method implementation!)");
		}
		if (logger.isDebugEnabled()) {
			logger.debug("Creating shared instance of singleton bean '" + beanName + "'");
		}
		// 加载前置处理
		beforeSingletonCreation(beanName);
		boolean newSingleton = false;
		boolean recordSuppressedExceptions = (this.suppressedExceptions == null);
		if (recordSuppressedExceptions) {
			this.suppressedExceptions = new LinkedHashSet<>();
		}
		try {
			// 初始化 bean
			// 这个过程其实是调用 createBean() 方法
			singletonObject = singletonFactory.getObject();
			newSingleton = true;
		}
		catch (IllegalStateException ex) {
			// Has the singleton object implicitly appeared in the meantime ->
			// if yes, proceed with it since the exception indicates that state.
			singletonObject = this.singletonObjects.get(beanName);
			if (singletonObject == null) {
				throw ex;
			}
		}
		catch (BeanCreationException ex) {
			if (recordSuppressedExceptions) {
				for (Exception suppressedException : this.suppressedExceptions) {
					ex.addRelatedCause(suppressedException);
				}
			}
			throw ex;
		}
		finally {
			if (recordSuppressedExceptions) {
				this.suppressedExceptions = null;
			}
			//后置处理
			afterSingletonCreation(beanName);
		}
		if (newSingleton) {
			//加入缓存中
			addSingleton(beanName, singletonObject);
		}
	}
	return singletonObject;
	}
	}

```
**_它的大体流程可以分为几步：_**

- **_尝试从缓存中获取单例Bean，如果已经加载了则直接返回，否则开始加载过程_**
- **_加载前置处理_**
- **_获取Bean实例_**
- **_后置处理_**
- **_加入缓存_**
### 1.1.1 从缓存中获取
**_DefaultSingletonBeanRegistry_**
```java
// 单例缓存对象
private final Map<String, Object> singletonObjects = new ConcurrentHashMap<>(256);
```
这里的逻辑与上一篇的文章的从缓存中获取Bean差不多，这就不多概述了，我们来到下一环节，前置处理
### 1.1.2 前置处理
beforeSingletonCreation(beanName)是个标记方法，
```java
	// 用于添加标志，当前 bean 正处于创建中
	protected void beforeSingletonCreation(String beanName) {
		if (!this.inCreationCheckExclusions.contains(beanName) && !this.singletonsCurrentlyInCreation.add(beanName)) {
			//添加失败，抛出异常
			throw new BeanCurrentlyInCreationException(beanName);
		}
	}

```
把 beanName 添加到 singletonsCurrentlyInCreationmap中，用来表示该单例bean正在创建，如果添加失败，抛出异常。
### 1.1.3 获取Bean
通过createBean(beanName)方法返回的 **singletonFactory** 获取Bean。
```java
try {
					singletonObject = singletonFactory.getObject();
					newSingleton = true;
				}
				catch (IllegalStateException ex) {
					// Has the singleton object implicitly appeared in the meantime ->
					// if yes, proceed with it since the exception indicates that state.
					singletonObject = this.singletonObjects.get(beanName);
					if (singletonObject == null) {
						throw ex;
					}
				}
				catch (BeanCreationException ex) {
					if (recordSuppressedExceptions) {
						for (Exception suppressedException : this.suppressedExceptions) {
							ex.addRelatedCause(suppressedException);
						}
					}
					throw ex;
				}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693376831350-0c0e0463-bf55-4c74-a483-b9df716c9ee4.png#averageHue=%23292c31&clientId=u1a2ebd8d-412a-4&from=paste&height=824&id=u5aeaa60e&originHeight=1030&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=293604&status=done&style=none&taskId=u74777579-23a1-439b-8dcf-085f179070a&title=&width=1536)
我们来详细看看createBean方法，首先这个方法是一个接口
**_AbstractBeanFactory_**
```java
protected abstract Object createBean(String beanName, RootBeanDefinition mbd, @Nullable Object[] args)
			throws BeanCreationException;

```
该方法定义在 AbstractBeanFactory 中。其含义是根据给定的 BeanDefinition 和 args实例化一个 bean 对象，如果该 BeanDefinition 存在父类，则该 BeanDefinition 已经合并了父类的属性。所有 Bean 实例的创建都会委托给该方法实现。
**_AbstractAutowireCapableBeanFactory_**
```java
   protected Object createBean(String beanName, RootBeanDefinition mbd, @Nullable Object[] args)
            throws BeanCreationException {

        if (logger.isDebugEnabled()) {
            logger.debug("Creating instance of bean '" + beanName + "'");
        }
        RootBeanDefinition mbdToUse = mbd;

        // 确保此时的 bean 已经被解析了
        // 如果获取的class 属性不为null，则克隆该 BeanDefinition
        // 主要是因为该动态解析的 class 无法保存到到共享的 BeanDefinition
        Class<?> resolvedClass = resolveBeanClass(mbd, beanName);
        if (resolvedClass != null && !mbd.hasBeanClass() && mbd.getBeanClassName() != null) {
            mbdToUse = new RootBeanDefinition(mbd);
            mbdToUse.setBeanClass(resolvedClass);
        }

        try {
            // 验证和准备覆盖方法
            mbdToUse.prepareMethodOverrides();
        }
        catch (BeanDefinitionValidationException ex) {
            throw new BeanDefinitionStoreException(mbdToUse.getResourceDescription(),
                    beanName, "Validation of method overrides failed", ex);
        }

        try {
            // 给 BeanPostProcessors 一个机会用来返回一个代理类而不是真正的类实例
            // AOP 的功能就是基于这个地方
            Object bean = resolveBeforeInstantiation(beanName, mbdToUse);
            if (bean != null) {
                return bean;
            }
        }
        catch (Throwable ex) {
            throw new BeanCreationException(mbdToUse.getResourceDescription(), beanName,
                    "BeanPostProcessor before instantiation of bean failed", ex);
        }

        try {
            // 执行真正创建 bean 的过程
            Object beanInstance = doCreateBean(beanName, mbdToUse, args);
            if (logger.isDebugEnabled()) {
                logger.debug("Finished creating instance of bean '" + beanName + "'");
            }
            return beanInstance;
        }
        catch (BeanCreationException | ImplicitlyAppearedSingletonException ex) {
            throw ex;
        }
        catch (Throwable ex) {
            throw new BeanCreationException(
                    mbdToUse.getResourceDescription(), beanName, "Unexpected exception during bean creation", ex);
        }
    }

```
**_大体总结以上步骤：_**

- **_根据设置的class属性或者根据className来解析Class。_**
```java
Class<?> resolvedClass = resolveBeanClass(mbd, beanName)
```
主要是获取bean的class，并设置到BeanDefinition中，通过类加载器来加载到对应的Class类
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693377806115-03089be4-8e38-4c0a-9bde-47801563e451.png#averageHue=%232b2e32&clientId=u1a2ebd8d-412a-4&from=paste&height=824&id=u6183db58&originHeight=1030&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=297573&status=done&style=none&taskId=u99c0cf62-33b1-4d69-9e25-be4a1b64432&title=&width=1536)

- **_对override属性进行标记及验证。很多读者可能会不知道这个方法的作用，因为在Spring的配置里面根本就没有诸如override-method之类的配置，那么这个方法到底是干什么用的呢？其实在Spring中确实没有override-method这样的配置，但是如果读过前面的部分，可能会有所发现，在Spring配置中是存在lookup-method和replace-method的，而这两个配置的加载其实就是将配置统一存放在BeanDefinition中的methodOverrides属性里，而这个函数的操作其实也就是针对于这两个配置的，那么当bean实例化的时候，如果检测到了methodOverrides属性不为空，则动态的为当前bean生成代理并使用相应的拦截器对bean做处理_**
```java
	// Prepare method overrides.
		try {
            // 准备方法重写
			mbdToUse.prepareMethodOverrides();
		}
		catch (BeanDefinitionValidationException ex) {
			throw new BeanDefinitionStoreException(mbdToUse.getResourceDescription(),
					beanName, "Validation of method overrides failed", ex);
		}
```
```java
public void prepareMethodOverrides() throws BeanDefinitionValidationException {
	// Check that lookup methods exists.
	//检测是否存在方法注入,并循环预处理方法注入
			// Check that lookup methods exist and determine their overloaded status.
	if (hasMethodOverrides()) {
			getMethodOverrides().getOverrides().forEach(this::prepareMethodOverride);
		}
	}

protected void prepareMethodOverride(MethodOverride mo) throws BeanDefinitionValidationException {
        // 统计注入的方法个数
	int count = ClassUtils.getMethodCountForName(getBeanClass(), mo.getMethodName());
	if (count == 0) {
		throw new BeanDefinitionValidationException(
				"Invalid method override: no method with name '" + mo.getMethodName() +
				"' on class [" + getBeanClassName() + "]");
	}
        // 如果为1,则将注入方法标记为未重载
	// 注意:当有多个重载方法时,为了确定调用哪个具体的方法,Spring对重载方法的参数解析是很复杂的
	// 所以,如果注入方法没有被重载这里就将其标记,省去了对方法参数的解析过程,直接调用即可
	else if (count == 1) {
		// Mark override as not overloaded, to avoid the overhead of arg type checking.
		mo.setOverloaded(false);
	}
	}

```

- **_应用初始化前的后处理器，解析指定bean是否存在初始化前的短路操作。_**

在真正调用doCreate方法创建bean的实例前使用了这样一个方法resolveBeforeInstantiation (beanName, mbd)对BeanDefinigiton中的属性做些前置处理。
当然，无论其中是否有相应的逻辑实现我们都可以理解，因为真正逻辑实现前后留有处理函数也是可扩展的一种体现，但是，这并不是最重要的，在函数中还提供了一个短路判断，这才是最为关键的部分
```java
try {
			// Give BeanPostProcessors a chance to return a proxy instead of the target bean instance.
			Object bean = resolveBeforeInstantiation(beanName, mbdToUse);
			if (bean != null) {
				return bean;
			}
		}
		catch (Throwable ex) {
			throw new BeanCreationException(mbdToUse.getResourceDescription(), beanName,
					"BeanPostProcessor before instantiation of bean failed", ex);
		}
```
```java
        protected Object resolveBeforeInstantiation(String beanName, RootBeanDefinition mbd) {
                  Object bean = null;
       			 //如果尚未被解析
                  if (!Boolean.FALSE.equals(mbd.beforeInstantiationResolved)) {
                      // Make sure bean class is actually resolved at this point.
                      if  (mbd.hasBeanClass()  &&  !mbd.isSynthetic()  &&  hasInstantiationAware
    BeanPostProcessors()) {
                          //
                          bean = applyBeanPostProcessorsBeforeInstantiation(mbd.getBeanClass(),
    beanName);
                          if (bean != null) {
        bean = applyBeanPostProcessorsAfterInitialization(bean, beanName);
    }
                          }
                          mbd.beforeInstantiationResolved = (bean != null);
                  }
                  return bean;
            }
```

- 当经过前置处理后返回的结果如果不为空，那么会直接略过后续的Bean的创建而直接返回结果。这一特性虽然很容易被忽略，但是却起着至关重要的作用，我们熟知的AOP功能就是基于这里的判断的。
- 这个方法核心就在于 applyBeanPostProcessorsBeforeInstantiation() 和 applyBeanPostProcessorsAfterInitialization() 两个方法，before 为实例化前的后处理器应用，after 为实例化后的后处理器应用，后面详细介绍
- **_创建bean_**
```java
try {
            // 真正的创建Bean方法
			Object beanInstance = doCreateBean(beanName, mbdToUse, args);
			if (logger.isTraceEnabled()) {
				logger.trace("Finished creating instance of bean '" + beanName + "'");
			}
			return beanInstance;
		}
		catch (BeanCreationException | ImplicitlyAppearedSingletonException ex) {
			// A previously detected exception with proper bean creation context already,
			// or illegal singleton state to be communicated up to DefaultSingletonBeanRegistry.
			throw ex;
		}
		catch (Throwable ex) {
			throw new BeanCreationException(
					mbdToUse.getResourceDescription(), beanName, "Unexpected exception during bean creation", ex);
		}
```
```java
//真正创建Bean的方法
	protected Object doCreateBean(final String beanName, final RootBeanDefinition mbd, final @Nullable Object[] args)
		throws BeanCreationException {

	// Instantiate the bean.
	//BeanWrapper是对Bean的包装，其接口中所定义的功能很简单包括设置获取被包装的对象，获取被包装bean的属性描述器
	BeanWrapper instanceWrapper = null;
	if (mbd.isSingleton()) {
	        //单例模式，删除factoryBean缓存
		instanceWrapper = this.factoryBeanInstanceCache.remove(beanName);
	}
	if (instanceWrapper == null) {
	        //使用合适的实例化策略来创建Bean：工厂方法、构造函数自动注入、简单初始化
		instanceWrapper = createBeanInstance(beanName, mbd, args);
	}
	//从包装类中获取实例化的Bean
	final Object bean = instanceWrapper.getWrappedInstance();
	//获取实例化对象的类型
	Class<?> beanType = instanceWrapper.getWrappedClass();
	if (beanType != NullBean.class) {
		mbd.resolvedTargetType = beanType;
	}

	// Allow post-processors to modify the merged bean definition.
	//检查是否有后置处理
	synchronized (mbd.postProcessingLock) {
		if (!mbd.postProcessed) {
			try {
			        //调用PostProcessor后置处理器，修改 BeanDefinition
				applyMergedBeanDefinitionPostProcessors(mbd, beanType, beanName);
			}
			catch (Throwable ex) {
				throw new BeanCreationException(mbd.getResourceDescription(), beanName,
						"Post-processing of merged bean definition failed", ex);
			}
			mbd.postProcessed = true;
		}
	}

	// Eagerly cache singletons to be able to resolve circular references
	// even when triggered by lifecycle interfaces like BeanFactoryAware.
	// 解决单例模式的循环依赖
	boolean earlySingletonExposure = (mbd.isSingleton() && this.allowCircularReferences &&
			isSingletonCurrentlyInCreation(beanName));
	if (earlySingletonExposure) {
		if (logger.isDebugEnabled()) {
			logger.debug("Eagerly caching bean '" + beanName +
					"' to allow for resolving potential circular references");
		}
		//这里是一个匿名内部类，为了防止循环引用，尽早持有对象的引用
		addSingletonFactory(beanName, () -> getEarlyBeanReference(beanName, mbd, bean));
	}

	// Initialize the bean instance.
	//Bean对象的初始化，依赖注入在此触发
	//这个exposedObject在初始化完成之后返回作为依赖注入完成后的Bean
	Object exposedObject = bean;
	try {
		//将Bean实例对象封装，并且Bean定义中配置的属性值赋值给实例对象
		populateBean(beanName, mbd, instanceWrapper);
		//初始化Bean对象
		exposedObject = initializeBean(beanName, exposedObject, mbd);
	}
	catch (Throwable ex) {
		if (ex instanceof BeanCreationException && beanName.equals(((BeanCreationException) ex).getBeanName())) {
			throw (BeanCreationException) ex;
		}
		else {
			throw new BeanCreationException(
					mbd.getResourceDescription(), beanName, "Initialization of bean failed", ex);
		}
	}

	if (earlySingletonExposure) {
		//获取指定名称的已注册的单例模式Bean对象
		Object earlySingletonReference = getSingleton(beanName, false);
		if (earlySingletonReference != null) {
			//根据名称获取的已注册的Bean和正在实例化的Bean是同一个
			if (exposedObject == bean) {
				//当前实例化的Bean初始化完成
				exposedObject = earlySingletonReference;
			}
			//当前Bean依赖其他Bean，并且当发生循环引用时不允许新创建实例对象
			else if (!this.allowRawInjectionDespiteWrapping && hasDependentBean(beanName)) {
				String[] dependentBeans = getDependentBeans(beanName);
				Set<String> actualDependentBeans = new LinkedHashSet<>(dependentBeans.length);
				//获取当前Bean所依赖的其他Bean
				for (String dependentBean : dependentBeans) {
					//对依赖Bean进行类型检查
					if (!removeSingletonIfCreatedForTypeCheckOnly(dependentBean)) {
						actualDependentBeans.add(dependentBean);
					}
				}
				if (!actualDependentBeans.isEmpty()) {
					throw new BeanCurrentlyInCreationException(beanName,
							"Bean with name '" + beanName + "' has been injected into other beans [" +
							StringUtils.collectionToCommaDelimitedString(actualDependentBeans) +
							"] in its raw version as part of a circular reference, but has eventually been " +
							"wrapped. This means that said other beans do not use the final version of the " +
							"bean. This is often the result of over-eager type matching - consider using " +
							"'getBeanNamesOfType' with the 'allowEagerInit' flag turned off, for example.");
				}
			}
		}
	}

	// Register bean as disposable.
	//注册完成依赖注入的Bean
	try {
		registerDisposableBeanIfNecessary(beanName, bean, mbd);
	}
	catch (BeanDefinitionValidationException ex) {
		throw new BeanCreationException(
				mbd.getResourceDescription(), beanName, "Invalid destruction signature", ex);
	}

	return exposedObject;
	}

```
**_我们来总结一下上面函数的大体步骤：_**

- **_如果是单例则需要首先清除缓存_**
- **_实例化bean，将BeanDefinition转换为BeanWrapper_**
- **_MergedBeanDefinitionPostProcessor的应用_**
- **_依赖处理_**
- **_属性填充，将所有属性填充至bean的实例中_**
- **_循环依赖检查_**
- **_注册DisposableBean_**
- **_完成创建并返回_**

**_由于这是一个十分复杂的过程，而且涉及到循环依赖的问题，后面文章详细来解释_**
### 1.1.4 后置处理
afterSingletonCreation(beanName)同样是个表示方法
**_DefaultSingletonBeanRegistry_**
```java
// 用于移除标记，当前 Bean 不处于创建中
	protected void afterSingletonCreation(String beanName) {
		if (!this.inCreationCheckExclusions.contains(beanName) && !this.singletonsCurrentlyInCreation.remove(beanName)) {
			//移除失败，抛出异常
			throw new IllegalStateException("Singleton '" + beanName + "' isn't currently in creation");
		}
	}

```
创建Bean之后移除创建标示。前置处理和后置处理的这个创建标示，会在调用isSingletonCurrentlyInCreation(String beanName)时用到，该方法用来判断当前bean是否已经在创建中。
### 1.1.5 加入缓存
**_DefaultSingletonBeanRegistry_**
```java

if (newSingleton) {
	addSingleton(beanName, singletonObject);
}

protected void addSingleton(String beanName, Object singletonObject) {
	synchronized (this.singletonObjects) {
		this.singletonObjects.put(beanName, singletonObject);
		this.singletonFactories.remove(beanName);
		this.earlySingletonObjects.remove(beanName);
		this.registeredSingletons.add(beanName);
	    }
	}

```

- 【put】singletonObjects 属性，单例 bean 的缓存。
- 【remove】singletonFactories 属性，单例 bean Factory 的缓存。
- 【remove】earlySingletonObjects 属性，“早期”创建的单例 bean 的缓存。
- 【add】registeredSingletons 属性，已经注册的单例缓存。
## 1.2 原型模式实例化
**AbstractBeanFactory**
```java
        //创建多例Bean
	else if (mbd.isPrototype()) {
		// It's a prototype -> create a new instance.
		//原型模式(Prototype)是每次都会创建一个新的对象
		Object prototypeInstance = null;
		try {
			//加载前置处理，默认的功能是注册当前创建的原型对象
			beforePrototypeCreation(beanName);
			//创建指定Bean对象实例
			prototypeInstance = createBean(beanName, mbd, args);
		}
		finally {
			//加载后置处理，默认的功能告诉IOC容器指定Bean的原型对象不再创建
			afterPrototypeCreation(beanName);
		}
		//获取给定Bean的实例对象
		bean = getObjectForBeanInstance(prototypeInstance, name, beanName, mbd);
	}

```
原型模式很简单，直接创建一个新的实例就好了，不再从缓存中去获取，beforePrototypeCreation(beanName)前置处理，将当前bean标记为正在创建的原型，afterPrototypeCreation(beanName)后置处理，取消当前bean的正在创建标示。而getObjectForBeanInstance方法参考上一篇文章的详细解释
## 1.3 其他模式实例化
**AbstractBeanFactory**
```java
//要创建的Bean既不是Singleton也不是Prototype
	//如：request、session、application等生命周期
	else {
		String scopeName = mbd.getScope();
		final Scope scope = this.scopes.get(scopeName);
		//Bean定义资源中没有配置生命周期范围，则Bean定义不合法
		if (scope == null) {
			throw new IllegalStateException("No Scope registered for scope name '" + scopeName + "'");
		}
		try {
			//这里又使用了一个匿名内部类，获取一个指定生命周期范围的实例
			Object scopedInstance = scope.get(beanName, () -> {
				//前置处理
				beforePrototypeCreation(beanName);
				try {
					return createBean(beanName, mbd, args);
				}
				finally {
					//后置处理
					afterPrototypeCreation(beanName);
				}
			});
			//获取给定Bean的实例对象
			bean = getObjectForBeanInstance(scopedInstance, name, beanName, mbd);
		}
		catch (IllegalStateException ex) {
			throw new BeanCreationException(beanName,
					"Scope '" + scopeName + "' is not active for the current thread; consider " +
					"defining a scoped proxy for this bean if you intend to refer to it from a singleton",
					ex);
		}
	}

```
核心流程和原型模式一样，只不过获取 bean 实例是由 scope.get() 实现，我们可以发现这个作用域的调用的主要方法：

- getObjectForBeanInstance（）
- afterPrototypeCreation（）
- createBean（）

