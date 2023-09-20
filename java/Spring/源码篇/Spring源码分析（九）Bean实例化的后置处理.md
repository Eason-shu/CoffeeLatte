---
title: Spring源码分析（十）Bean实例化（下）
sidebar_position: 10
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

上一节我们详细的解释了Bean的创建过程，工厂，构造器等等，但是Bean创建后的处理我们还没有详细讲解，下面我们来看看Bean在创建之后做了那些处理
**_AbstractAutowireCapableBeanFactory_**
```java
   protected Object doCreateBean(final String beanName, final RootBeanDefinition mbd, final @Nullable Object[] args)
            throws BeanCreationException {

        // BeanWrapper是对Bean的包装，其接口中所定义的功能很简单包括设置获取被包装的对象，获取被包装bean的属性描述器
        BeanWrapper instanceWrapper = null;
        // 单例模型，则从未完成的 FactoryBean 缓存中删除
        if (mbd.isSingleton()) {anceWrapper = this.factoryBeanInstanceCache.remove(beanName);
        }

        // 使用合适的实例化策略来创建新的实例：工厂方法、构造函数自动注入、简单初始化
        if (instanceWrapper == null) {
            instanceWrapper = createBeanInstance(beanName, mbd, args);
        }

        // 包装的实例对象
        final Object bean = instanceWrapper.getWrappedInstance();
        // 包装的实例对象的类型
        Class<?> beanType = instanceWrapper.getWrappedClass();
        if (beanType != NullBean.class) {
            mbd.resolvedTargetType = beanType;
        }

        // 检测是否有后置处理
        // 如果有后置处理，则允许后置处理修改 BeanDefinition
        synchronized (mbd.postProcessingLock) {
            if (!mbd.postProcessed) {
                try {
                    // applyMergedBeanDefinitionPostProcessors
                    // 后置处理修改 BeanDefinition
                    applyMergedBeanDefinitionPostProcessors(mbd, beanType, beanName);
                }
                catch (Throwable ex) {
                    throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                            "Post-processing of merged bean definition failed", ex);
                }
                mbd.postProcessed = true;
            }
        }

        // 解决单例模式的循环依赖
        // 单例模式 & 运行循环依赖&当前单例 bean 是否正在被创建
        boolean earlySingletonExposure = (mbd.isSingleton() && this.allowCircularReferences &&
                isSingletonCurrentlyInCreation(beanName));
        if (earlySingletonExposure) {
            if (logger.isDebugEnabled()) {
                logger.debug("Eagerly caching bean '" + beanName +
                        "' to allow for resolving potential circular references");
            }
            // 提前将创建的 bean 实例加入到ectFactory 中
            // 这里是为了后期避免循环依赖
            addSingletonFactory(beanName, () -> getEarlyBeanReference(beanName, mbd, bean));
        }

        /*
         * 开始初始化 bean 实例对象
         */
        Object exposedObject = bean;
        try {
            // 对 bean 进行填充，将各个属性值注入，其中，可能存在依赖于其他 bean 的属性
            // 则会递归初始依赖 bean
            populateBean(beanName, mbd, instanceWrapper);
            // 调用初始化方法
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

        /**
         * 循环依赖处理
         */
        if (earlySingletonExposure) {
            // 获取 earlySingletonReference
            Object earlySingletonReference = getSingleton(beanName, false);
            // 只有在存在循环依赖的情况下，earlySingletonReference 才不会为空
            if (earlySingletonReference != null) {
                // 如果 exposedObject 没有在初始化方法中被改变，也就是没有被增强
                if (exposedObject == bean) {
                    exposedObject = earlySingletonReference;
                }
                // 处理依赖
                else if (!this.allowRawInjectionDespiteWrapping && hasDependentBean(beanName)) {
                    String[] dependentBeans = getDependentBeans(beanName);
                    Set<String> actualDependentBeans = new LinkedHashSet<>(dependentBeans.length);
                    for (String dependentBean : dependentBeans) {
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
        try {
            // 注册 bean
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
## 1.1 后置处理
```java
     // 检测是否有后置处理
        // 如果有后置处理，则允许后置处理修改 BeanDefinition
        synchronized (mbd.postProcessingLock) {
            if (!mbd.postProcessed) {
                try {
                    // applyMergedBeanDefinitionPostProcessors
                    // 后置处理修改 BeanDefinition
                    applyMergedBeanDefinitionPostProcessors(mbd, beanType, beanName);
                }
                catch (Throwable ex) {
                    throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                            "Post-processing of merged bean definition failed", ex);
                }
                mbd.postProcessed = true;
            }
        }
```
让我们走进这个方法看看呗，将 MergedBeanDefinitionPostProcessor 应用于指定的 Bean 定义，调用其 postProcessMergedBeanDefinition 方
**_AbstractAutowireCapableBeanFactory_**
```java
	protected void applyMergedBeanDefinitionPostProcessors(RootBeanDefinition mbd, Class<?> beanType, String beanName) {
		// 循环遍历
        for (BeanPostProcessor bp : getBeanPostProcessors()) {
			if (bp instanceof MergedBeanDefinitionPostProcessor) {
				MergedBeanDefinitionPostProcessor bdp = (MergedBeanDefinitionPostProcessor) bp;
				bdp.postProcessMergedBeanDefinition(mbd, beanType, beanName);
			}
		}
	}

```
我们来看看关键方法postProcessMergedBeanDefinition，但是我们可以发现它其实是一个接口方法，有很多实现类
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693530977417-3654fe10-acbb-46ca-9194-d777d2246cbf.png#averageHue=%23202226&clientId=ub3c6cf11-2502-4&from=paste&height=566&id=u5859e1bf&originHeight=707&originWidth=1322&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=118985&status=done&style=none&taskId=u019e0a5e-9954-4bcc-a9fd-134bad1a0bc&title=&width=1057.6)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693531001355-5677d828-7ae3-4162-8b50-42f092f7550d.png#averageHue=%238a8e84&clientId=ub3c6cf11-2502-4&from=paste&height=193&id=u9d8a5b74&originHeight=241&originWidth=1812&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=111297&status=done&style=none&taskId=uadcba86c-4aca-4d92-b652-6fbb9388bc4&title=&width=1449.6)
从源码中可以看到，接口MergedBeanDefinitionPostProcessor中定义了两个方法：

- postProcessMergedBeanDefinition()
- resetBeanDefinition()
- postProcessMergedBeanDefinition()方法是**Spring用于找出所有需要注入的字段并同时做缓存的**
- resetBeanDefinition()方法是在BeanDefinition被修改后**清除容器的缓存**的
- 根据代码可以看到, Spring其实就是调用了所有类型为MergedBeanDefinitionPostProcessor后置处理器的 postProcessMergedBeanDefinition方法, 在没有手动的添加bean的后置处理器的条件下,
- 实现了该方法的后置处理器有以下几个:
- ApplicationListenerDetector
- ScheduledAnnotationBeanPostProcessor
- RequiredAnnotationBeanPostProcessor
- InitDestroyAnnotationBeanPostProcessor
- CommonAnnotationBeanPostProcessor
- AutowiredAnnotationBeanPostProcessor

由于这里的实现类很多，我们就以其中一个为案例进行源码分析：CommonAnnotationBeanPostProcessor
### 1.1.1 调用父类方法
**_CommonAnnotationBeanPostProcessor_**
```java
@Override
	public void postProcessMergedBeanDefinition(RootBeanDefinition beanDefinition, Class<?> beanType, String beanName) {
        // 调用父类方法
		super.postProcessMergedBeanDefinition(beanDefinition, beanType, beanName);
        // 调用方法获取生命周期元数据
		InjectionMetadata metadata = findResourceMetadata(beanName, beanType, null);
        // 验证相关方法
		metadata.checkConfigMembers(beanDefinition);
	}
```
那我们首先来看看父类方法的调用
**_InitDestroyAnnotationBeanPostProcessor_**
```java

	@Override
	public void postProcessMergedBeanDefinition(RootBeanDefinition beanDefinition, Class<?> beanType, String beanName) {
		// 调用方法获取生命周期元数据
		InjectionMetadata metadata = findResourceMetadata(beanName, beanType, null);
        // 验证相关方法
		metadata.checkConfigMembers(beanDefinition);
	}
```

1. 调用方法获取**生命周期元数据**并保存
2. 验证相关方法

我们来看看Spring是如何调用方法获取**生命周期元数据**并保存的，当然就是下面的方法findLifecycleMetadata方法
**_InitDestroyAnnotationBeanPostProcessor_**
```java
private LifecycleMetadata findLifecycleMetadata(Class<?> clazz) {
		if (this.lifecycleMetadataCache == null) {
			// Happens after deserialization, during destruction...
            // 销毁过程中，反序列调用
			return buildLifecycleMetadata(clazz);
		}
        // 首先尝试从缓存中获取数据
		// Quick check on the concurrent map first, with minimal locking.
		LifecycleMetadata metadata = this.lifecycleMetadataCache.get(clazz);
		if (metadata == null) {
            // 从缓存中获取数据失败，尝试再次加锁，再次获取数据
			synchronized (this.lifecycleMetadataCache) {
				metadata = this.lifecycleMetadataCache.get(clazz);
				if (metadata == null) {
                    // 构建生命周期
					metadata = buildLifecycleMetadata(clazz);
                    // 将构建好的生命周期放在缓存中
					this.lifecycleMetadataCache.put(clazz, metadata);
				}
				return metadata;
			}
		}
		return metadata;
	}
```

- 在bean销毁过程中，首先尝试从缓存中获取元数据，如果从缓存中获取失败则尝试加锁创建元数据
- 加锁后，再次获取元数据，防止多线程重复执行，构建生命周期元数据，将构建好的元数据放入缓存中

下面我们再来看看一个关键方法构建生命周期数据buildLifecycleMetadata方法
**_InitDestroyAnnotationBeanPostProcessor_**
```java
private LifecycleMetadata buildLifecycleMetadata(final Class<?> clazz) {
		// 分别实例化回调方法@PostConstruct,@PreDestroy
    	List<LifecycleElement> initMethods = new ArrayList<>();

		List<LifecycleElement> destroyMethods = new ArrayList<>();
        // 目标类
		Class<?> targetClass = clazz;

		do {
            // 保存每一轮循环的方法
            // 初始化方法
			final List<LifecycleElement> currInitMethods = new ArrayList<>();
            // 销毁方法
			final List<LifecycleElement> currDestroyMethods = new ArrayList<>();
            // 利用反射获取当前类的所有方法
			ReflectionUtils.doWithLocalMethods(targetClass, method -> {
                // 注解类型：@PostConstruct
				if (this.initAnnotationType != null && method.isAnnotationPresent(this.initAnnotationType)) {
                    // 封装成LifecycleElement
					LifecycleElement element = new LifecycleElement(method);
                    // 添加到集合中
					currInitMethods.add(element);
					if (logger.isTraceEnabled()) {
						logger.trace("Found init method on class [" + clazz.getName() + "]: " + method);
					}
				}
                // 注解类型：@PreDestroy
				if (this.destroyAnnotationType != null && method.isAnnotationPresent(this.destroyAnnotationType)) {
                    // 封装成LifecycleElement添加到集合中
					currDestroyMethods.add(new LifecycleElement(method));
					if (logger.isTraceEnabled()) {
						logger.trace("Found destroy method on class [" + clazz.getName() + "]: " + method);
					}
				}
			});
        	// 将此次循环的获取到的方法存放在总集合中
			initMethods.addAll(0, currInitMethods);
            // 将此次循环的获取到的方法存放在总集合中
			destroyMethods.addAll(currDestroyMethods);
            // 目标类
			targetClass = targetClass.getSuperclass();
		}
		while (targetClass != null && targetClass != Object.class);
    	// 返回一个LifecycleMetadata
		return new LifecycleMetadata(clazz, initMethods, destroyMethods);
	}
```
构建生命周期元数据（解析带@PostConstruct和@PreDestroy注解的方法），当构建完成后会封装成LifecycleMetadata对象，将元数据缓存到lifecycleMetadataCache集合中并返回，此时就完成✅相关方法（初始化方法和销毁方法）的扫描解析和缓存工作
示例中并未显式调用被@PostContruct注解的init()方法和被@PreDestroy注解修饰的destroy()方法，那么问题来了：这些被添加进回调方法列表中的方法是在哪里调用呢执行的？@PostContruct注解的init()方法和被@PreDestroy注解修饰的destroy()方法是在哪里调用执行的呢？，让我们回到我们刚开始的源码部分，开始实例化Bean
**_AbstractAutowireCapableBeanFactory_**
```java
 /*
         * 开始初始化 bean 实例对象
         */
        Object exposedObject = bean;
        try {
            // 对 bean 进行填充，将各个属性值注入，其中，可能存在依赖于其他 bean 的属性
            // 则会递归初始依赖 bean
            populateBean(beanName, mbd, instanceWrapper);
            // 调用初始化方法
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
```
当然是实例化Bean的时候
**_AbstractAutowireCapableBeanFactory_**
```java
protected Object initializeBean(final String beanName, final Object bean, @Nullable RootBeanDefinition mbd) {
		// 注释 4.12 securityManage 是啥，不确定=-=
		if (System.getSecurityManager() != null) {
			AccessController.doPrivileged((PrivilegedAction<Object>) () -> {
				invokeAwareMethods(beanName, bean);
				return null;
			}, getAccessControlContext());
		}
		else {
			// 如果没有 securityManage，方法里面校验了 bean 的类型，需要引用 Aware 接口
			// 对特殊的 bean 处理：Aware/ BeanClassLoader / BeanFactoryAware
			invokeAwareMethods(beanName, bean);
		}

		Object wrappedBean = bean;
		if (mbd == null || !mbd.isSynthetic()) {
			// 熟悉么，后处理器又来了
			// 注释 7.3 bean 实例化阶段，调用已经注册好的 beanPostProcessor 的 postProcessBeforeInitialization 方法
			wrappedBean = applyBeanPostProcessorsBeforeInitialization(wrappedBean, beanName);
		}

		try {
			// 激活用户自定义的 init-method 方法
			invokeInitMethods(beanName, wrappedBean, mbd);
		}
		catch (Throwable ex) {
			throw new BeanCreationException(
					(mbd != null ? mbd.getResourceDescription() : null),
					beanName, "Invocation of init method failed", ex);
		}
		if (mbd == null || !mbd.isSynthetic()) {
			// bean 实例化阶段，调用已经注册好的 beanPostProcessor 的 postProcessAfterInitialization 方法
			wrappedBean = applyBeanPostProcessorsAfterInitialization(wrappedBean, beanName);
		}

		return wrappedBean;
	}
```
下面会到我们的主题，当我们从生命周期中有了元数据，接下里就是如何获取了，下面就验证方法
**_InitDestroyAnnotationBeanPostProcessor_**
```java

	@Override
	public void postProcessMergedBeanDefinition(RootBeanDefinition beanDefinition, Class<?> beanType, String beanName) {
		// 调用方法获取生命周期元数据
		InjectionMetadata metadata = findResourceMetadata(beanName, beanType, null);
        // 验证相关方法
		metadata.checkConfigMembers(beanDefinition);
	}
```
**_InitDestroyAnnotationBeanPostProcessor_**
将初始化和销毁的回调方法注册到beanDefinition中，并且标记已经检查过的方法，放入checkedInitMethods中的checkedInitMethods/checkedDestroyMethods集合中
```java
/**
		 * 检查配置。将初始化与销毁的回调方法放在beanDefinition中
		 * @param beanDefinition
		 */
		public void checkConfigMembers(RootBeanDefinition beanDefinition) {
			Set<LifecycleElement> checkedInitMethods = new LinkedHashSet<>(this.initMethods.size());
			for (LifecycleElement element : this.initMethods) {
				String methodIdentifier = element.getIdentifier();
				if (!beanDefinition.isExternallyManagedInitMethod(methodIdentifier)) {
					// 初始化方法
					beanDefinition.registerExternallyManagedInitMethod(methodIdentifier);
					checkedInitMethods.add(element);
					if (logger.isTraceEnabled()) {
						logger.trace("Registered init method on class [" + this.targetClass.getName() + "]: " + element);
					}
				}
			}
			Set<LifecycleElement> checkedDestroyMethods = new LinkedHashSet<>(this.destroyMethods.size());
			for (LifecycleElement element : this.destroyMethods) {
				String methodIdentifier = element.getIdentifier();
				if (!beanDefinition.isExternallyManagedDestroyMethod(methodIdentifier)) {
					// 销毁方法
					beanDefinition.registerExternallyManagedDestroyMethod(methodIdentifier);
					checkedDestroyMethods.add(element);
					if (logger.isTraceEnabled()) {
						logger.trace("Registered destroy method on class [" + this.targetClass.getName() + "]: " + element);
					}
				}
			}
			this.checkedInitMethods = checkedInitMethods;
			this.checkedDestroyMethods = checkedDestroyMethods;
		}
```
导致父类的初始化方法已经分析完毕，下面我们来到子类的分析
**_CommonAnnotationBeanPostProcessor_**
```java
@Override
	public void postProcessMergedBeanDefinition(RootBeanDefinition beanDefinition, Class<?> beanType, String beanName) {
        // 调用父类方法
		super.postProcessMergedBeanDefinition(beanDefinition, beanType, beanName);
        // 调用方法获取生命周期元数据
		InjectionMetadata metadata = findResourceMetadata(beanName, beanType, null);
        // 验证相关方法
		metadata.checkConfigMembers(beanDefinition);
	}
```
那我们看看调用方法获取生命周期元数据
### 1.1.2 获取元数据
```java
	/**
	 * 获取元数据
	 * @param beanName
	 * @param clazz
	 * @param pvs
	 * @return
	 */
	private InjectionMetadata findResourceMetadata(String beanName, final Class<?> clazz, @Nullable PropertyValues pvs) {
		// Fall back to class name as cache key, for backwards compatibility with custom callers.
		// 缓存key
		String cacheKey = (StringUtils.hasLength(beanName) ? beanName : clazz.getName());
		// Quick check on the concurrent map first, with minimal locking.
		// 从缓存中获取元数据
		InjectionMetadata metadata = this.injectionMetadataCache.get(cacheKey);
		// 如果缓存中没有，则创建一个新的
		if (InjectionMetadata.needsRefresh(metadata, clazz)) {
			synchronized (this.injectionMetadataCache) {
				metadata = this.injectionMetadataCache.get(cacheKey);
				if (InjectionMetadata.needsRefresh(metadata, clazz)) {
					if (metadata != null) {
						metadata.clear(pvs);
					}
					// 创建元数据
					metadata = buildResourceMetadata(clazz);
					this.injectionMetadataCache.put(cacheKey, metadata);
				}
			}
		}
		return metadata;
	}
```
Spring会先从缓存injectionMetadataCache中获取当前bean对应得注入元数据, 如果needsRefresh返回了true, 那么Spring就会调用buildAutowiringMetadata方法开始构建注入元数据, 构建完成后就会将其放入 到缓存injectionMetadataCache中
**_InjectionMetadata_**
```java
	public static boolean needsRefresh(@Nullable InjectionMetadata metadata, Class<?> clazz) {
		return (metadata == null || metadata.targetClass != clazz);
	}

```

- needsRefresh的判断很简单, 即metadata == null || metadata.targetClass != clazz
- 当metadata不存在于缓存的时候肯定是要进行构建的, 由于findAutowiringMetadata方法会在属性注入的时 候也被调用, 所以通常情况下会拿到缓存中的数据

**_buildAutowiringMetadata_**
```java
	/**
	 * 构建元数据
	 * @param clazz
	 * @return
	 */
	private InjectionMetadata buildResourceMetadata(final Class<?> clazz) {
		// 如果不是候选类，则返回空
		if (!AnnotationUtils.isCandidateClass(clazz, resourceAnnotationTypes)) {
			return InjectionMetadata.EMPTY;
		}
		// 构建元数据
		List<InjectionMetadata.InjectedElement> elements = new ArrayList<>();
		Class<?> targetClass = clazz;

		do {
			// 当前元素
			final List<InjectionMetadata.InjectedElement> currElements = new ArrayList<>();
			// 遍历字段
			ReflectionUtils.doWithLocalFields(targetClass, field -> {
				// 如果是 @WebServiceRef 注解字段
				if (webServiceRefClass != null && field.isAnnotationPresent(webServiceRefClass)) {
					if (Modifier.isStatic(field.getModifiers())) {
						throw new IllegalStateException("@WebServiceRef annotation is not supported on static fields");
					}
					currElements.add(new WebServiceRefElement(field, field, null));
				}
				// 如果是@EJB 注解字段
				else if (ejbRefClass != null && field.isAnnotationPresent(ejbRefClass)) {
					if (Modifier.isStatic(field.getModifiers())) {
						throw new IllegalStateException("@EJB annotation is not supported on static fields");
					}
					currElements.add(new EjbRefElement(field, field, null));
				}
				// 如果是@Resource注解字段
				else if (field.isAnnotationPresent(Resource.class)) {
					if (Modifier.isStatic(field.getModifiers())) {
						throw new IllegalStateException("@Resource annotation is not supported on static fields");
					}
					if (!this.ignoredResourceTypes.contains(field.getType().getName())) {
						currElements.add(new ResourceElement(field, field, null));
					}
				}
			});

			// 遍历方法
			ReflectionUtils.doWithLocalMethods(targetClass, method -> {

				Method bridgedMethod = BridgeMethodResolver.findBridgedMethod(method);
				//
				if (!BridgeMethodResolver.isVisibilityBridgeMethodPair(method, bridgedMethod)) {
					return;
				}

				if (method.equals(ClassUtils.getMostSpecificMethod(method, clazz))) {
					// 如果是 @WebServiceRef 注解字段
					if (webServiceRefClass != null && bridgedMethod.isAnnotationPresent(webServiceRefClass)) {
						if (Modifier.isStatic(method.getModifiers())) {
							throw new IllegalStateException("@WebServiceRef annotation is not supported on static methods");
						}
						if (method.getParameterCount() != 1) {
							throw new IllegalStateException("@WebServiceRef annotation requires a single-arg method: " + method);
						}
						PropertyDescriptor pd = BeanUtils.findPropertyForMethod(bridgedMethod, clazz);
						currElements.add(new WebServiceRefElement(method, bridgedMethod, pd));
					}
					// 如果是@EJB 注解字段
					else if (ejbRefClass != null && bridgedMethod.isAnnotationPresent(ejbRefClass)) {
						if (Modifier.isStatic(method.getModifiers())) {
							throw new IllegalStateException("@EJB annotation is not supported on static methods");
						}
						if (method.getParameterCount() != 1) {
							throw new IllegalStateException("@EJB annotation requires a single-arg method: " + method);
						}
						PropertyDescriptor pd = BeanUtils.findPropertyForMethod(bridgedMethod, clazz);
						currElements.add(new EjbRefElement(method, bridgedMethod, pd));
					}
					// 如果是@Resource注解字段
					else if (bridgedMethod.isAnnotationPresent(Resource.class)) {
						if (Modifier.isStatic(method.getModifiers())) {
							throw new IllegalStateException("@Resource annotation is not supported on static methods");
						}
						// 获取参数类型
						Class<?>[] paramTypes = method.getParameterTypes();
						if (paramTypes.length != 1) {
							throw new IllegalStateException("@Resource annotation requires a single-arg method: " + method);
						}
						if (!this.ignoredResourceTypes.contains(paramTypes[0].getName())) {
							// 获取属性描述符
							PropertyDescriptor pd = BeanUtils.findPropertyForMethod(bridgedMethod, clazz);
							currElements.add(new ResourceElement(method, bridgedMethod, pd));
						}
					}
				}
			});
			// 添加到元素集合中
			elements.addAll(0, currElements);
			// 获取父类
			targetClass = targetClass.getSuperclass();
		}
		while (targetClass != null && targetClass != Object.class);
		// 构建元数据
		return InjectionMetadata.forElements(elements, clazz);
	}

```

-  可以看到, Spring会创建一个elements的list来存放所有需要被注入的数据, 然后在while循环中, 开始取该targetClass中的元数据, 获取完成后放入到elements中, 之后开始获取targetClass的父类中素有需要被注入的数据, 直到Object为止
- 当一个类及其所有的祖先类中的元数据被扫描完成后, Spring就会将其放入到InjectionMetadata中返回, 接下来我们开始分析Spring在这个while循环是如何获取一个个的InjectedElement的，首先是字段元数据的获取
```java
ReflectionUtils.doWithLocalFields(targetClass, field -> {
   // 省略 @WebServiceRef 和 @EJB 相关的处理逻辑
   else if (field.isAnnotationPresent(Resource.class)) {
      if (Modifier.isStatic(field.getModifiers())) {
         throw new IllegalStateException("@Resource annotation is not supported on static fields");
      }
      if (!this.ignoredResourceTypes.contains(field.getType().getName())) {
         currElements.add(new ResourceElement(field, field, null));
      }
   }
});

```
根首先是对当前类型所有属性的判断，再次要对属性判断三个条件。

1. 属性需要被@Resource注解标记。
2. 属性不能是静态的。
3. 属性类型不在ignoredResourceTypes集合中

符合条件的属性信息会被封装成 ResourceElement 对象并添加到currElements集合中。
下面是对方法的获取
```java
ReflectionUtils.doWithLocalMethods(targetClass, method -> {
    // 找到我们定义的方法
   Method bridgedMethod = BridgeMethodResolver.findBridgedMethod(method);
   if (!BridgeMethodResolver.isVisibilityBridgeMethodPair(method, bridgedMethod)) {
      return;
   }
   if (method.equals(ClassUtils.getMostSpecificMethod(method, clazz))) {
      // 省略 @WebServiceRef 和 @EJB 相关的处理逻辑
      else if (bridgedMethod.isAnnotationPresent(Resource.class)) {
         if (Modifier.isStatic(method.getModifiers())) {
            throw new IllegalStateException("@Resource annotation is not supported on static methods");
         }
         Class<?>[] paramTypes = method.getParameterTypes();
         if (paramTypes.length != 1) {
            throw new IllegalStateException("@Resource annotation requires a single-arg method: " + method);
         }
         if (!this.ignoredResourceTypes.contains(paramTypes[0].getName())) {
            PropertyDescriptor pd = BeanUtils.findPropertyForMethod(bridgedMethod, clazz);
            currElements.add(new ResourceElement(method, bridgedMethod, pd));
         }
      }
   }
});

```
对于当前类型中的每一个方法，首先要确保是代码中定义的方法而非编译器生成的方法，然后是对方法信息的判断条件。

1. 方法被@Resource注解标记。
2. 方法不是静态的。
3. 方法的必须有且只有一个参数。
4. 方法的参数类型名称不在ignoredResourceTypes集合中。

符合条件的方法信息，也会被封装成一个 ResourceElement 对象，并添加到currElements集合中。
至此，buildResourceMetadata方法就结束了。回到postProcessMergedBeanDefinition方法中，我们看最后一行代码。
### 1.1.3 注解元信息检查
**_CommonAnnotationBeanPostProcessor_**
```java
@Override
	public void postProcessMergedBeanDefinition(RootBeanDefinition beanDefinition, Class<?> beanType, String beanName) {
        // 调用父类方法
		super.postProcessMergedBeanDefinition(beanDefinition, beanType, beanName);
        // 调用方法获取生命周期元数据
		InjectionMetadata metadata = findResourceMetadata(beanName, beanType, null);
        // 验证相关方法
		metadata.checkConfigMembers(beanDefinition);
	}
```
**_InjectionMetadata_**
```java
InjectionMetadatapublic void checkConfigMembers(RootBeanDefinition beanDefinition) {
   Set<InjectedElement> checkedElements = new LinkedHashSet<>(this.injectedElements.size());
   for (InjectedElement element : this.injectedElements) {
      Member member = element.getMember();
      if (!beanDefinition.isExternallyManagedConfigMember(member)) {
         beanDefinition.registerExternallyManagedConfigMember(member);
         checkedElements.add(element);
         if (logger.isTraceEnabled()) {
            logger.trace("Registered injected element on class [" + this.targetClass.getName() + "]: " + element);
         }
      }
   }
   this.checkedElements = checkedElements;
}

```
逻辑比较清晰，遍历注入元信息中的所有成员，也就是之前处理过的属性和方法信息，对于没有注册为 BeanDefinition 的外部管理配置成员的元素进行注册，并添加到元信息的checkedElements集合中。这一步主要是为了防止重复处理通过注解注入的元素。
:::info

- applyMergedBeanDefinitionPostProcessors方法通过调用一个个的MergedBeanDefinitionPostProcessor中的postProcessMergedBeanDefinition方法完成了对被@Autowired等注解标注的方法、属性的处理, 将其变为一个个的InjectionMetadata, 最终放入到该后置处理器中的injectionMetadataCache缓存中, 之后便可以通过该后置处理器取得这些注入元数据, 进而完成属性的注入, 这里Spring也通过策略模式, 对不同类型的元数据利用不同的后置处理器进行处理
:::
### 1.1.4 Member、InjectedElement、InjectionMetadata

- 在Java反射中, 我们会经常的遇到Field、Method、Constructor类, 而本次我们提到的第一个类就是Member
- 该类就是上面几个类的父类, Spring为了能够使得获取到的方法、属性都放在一个地方, 采用了接口编程, 将其

都变成了Member类型

- 当Spring扫描到一个方法加了@Autowired的时候, 就会将该方法反射获得到Method变为一个Member, 然后将其放到InjectedElement中, 换句话说, InjectedElement就是对一个方法或者属性的一个封装, 除了有Member存储原始的反射信息外, 还会有额外的信息, 比如required属性, 表示是否是必须注入的

一个类中可能会有很多个方法、属性被标注了@Autowired注解, 那么每一个被标注的方法、属性都用一个
InjectedElement表示, 而所有这些InjectedElement均被放入到一个Collections中, 这个集合则存在于
InjectionMetadata中, 即InjectionMetadata中的Collection InjectedElement injectedElements存储
了所有需要被注入的信息, 里面有一个targetClass属性则是存储了这些方法、属性所在的类Class对象
```java
public class InjectionMetadata {
	private final Class<?> targetClass;

	private final Collection<InjectedElement> injectedElements;

  private volatile Set<InjectedElement> checkedElements;
}
```
可以看到, 在InjectionMetadata中还有一个checkedElements, 里面也是存储了InjectedElement, 之前提到
injectedElements的时候, 有人可能会认为, 难道Spring在后面进行属性填充的时候, 就是取injectedElements
中的一个个InjectedElement进行反射操作进行注入的吗, 其实不是的, Spring实际取的是checkedElements中
的InjectedElement, 在MergedBeanDefinitionPostProcessor中postProcessMergedBeanDefinition方法中, Spring主要是找到所有被@PostConstruct、@PreDestory、@Autowired、@Resource、@Value标注的属性或者方法, 将其封装成一个个的InjectedElement, 最后放到一个新创建的InjectedMetada中, 完成这些工作后, Spring又会经过一些判断, 最终将这些InjectedElement从injectedElements取出来放到checkedElements中, 在进行属性填充的时候, Spring就会取出一个个的InjectedElement, 通过反射的方完成属性填充
 那么上述提到的三个后置处理器有什么作用呢, 其实这是一个策略模式的典型应用, Spring对@PostConstruct、@PreDestory注解的处理(转为InjectedElement)用的InitDestroyAnnotationBeanPostProcessor,
而对@Resource的处理用的CommonAnnotationBeanPostProcessor,
对于@Autowired以及@Value的处理则是用的AutowiredAnnotationBeanPostProcessor,
不同的后置处理器处理不同的注解, 下面我们以@Autowired注解
的处理为例子进行讲解, 其它注解的处理的代码跟这个是类似的, 就不再进行展开了


