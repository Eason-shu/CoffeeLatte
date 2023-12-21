---
title: Spring源码分析（九）Bean实例化的后置处理
sidebar_position: 9
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

**_AbstractAutowireCapableBeanFactory_**
上一节我们详细的解释了Bean的实例化的后置处理，我们接着往下看doCreateBean的方法，依赖的处理
```java
// 是否需要提前曝光，用来解决循环依赖时使用
		boolean earlySingletonExposure = (mbd.isSingleton() && this.allowCircularReferences &&
				isSingletonCurrentlyInCreation(beanName));
		if (earlySingletonExposure) {
			if (logger.isTraceEnabled()) {
				logger.trace("Eagerly caching bean '" + beanName +
						"' to allow for resolving potential circular references");
			}
			// 注释 5.2 将缓存中的 bean 信息更新，解决循环依赖 第二个参数是回调接口，实现的功能是将切面动态织入 bean
			addSingletonFactory(beanName, () -> getEarlyBeanReference(beanName, mbd, bean));
		}
```
依赖注入概念：就是A在getBean初始化时，如果依赖了另一个bean B，那么会先去调用B的getBean初始化B。但是B再去getBean时又依赖A。那么就出现了死循环。Spring按照域（Scope）进行处理，如果是非单利模式则抛出异常。
## 1.1 循环依赖
我们看到上面的代码虽然短短几行，但是解决了循环依赖的问题，我们新总体讲述一下大体步骤：
虽然只有短短的几行代码，但是这是单利模式循环依赖的实现。上面判断了三个条件：
    1、当前Bean为单例：Scope
    2、容器级别的allowCircularReferences（是否允许循环依赖），默认为true
    3、当前Bean是否标记为正在创建中，存放在（singletonsCurrentlyInCreation容器中）
如果允许提前暴露，通过addSingletonFactory()方法将生成bean的工厂ObjectFactory添加到三级缓存(singletonFactories)中，这是Spring解决循环依赖非常关键的代码。
**_DefaultSingletonBeanRegistry_**
```java
protected void addSingletonFactory(String beanName, ObjectFactory<?> singletonFactory) {
    Assert.notNull(singletonFactory, "Singleton factory must not be null");
    // 加锁
    synchronized (this.singletonObjects) {
        // 1、如果一级缓存中不存在当前beanName的时候，才能进if判断
        if (!this.singletonObjects.containsKey(beanName)) {
            // 2、将beanName => ObjectFactory的映射关系添加到三级缓存中，注意添加的是创建bean的对象工厂singletonFactory
            this.singletonFactories.put(beanName, singletonFactory);
            // 3、从二级缓存中移除当前beanName
            this.earlySingletonObjects.remove(beanName);
            // 4、将beanName添加到已注册单例集合中
            this.registeredSingletons.add(beanName);
        }
    }
}
```

- 其实是在DefaultSingletonBeanRegistry#getSingleton(java.lang.String, boolean)方法中使用到，singletonObject = singletonFactory.getObject()
- 执行singletonFactory.getObject()的时候，实际上就是执行getEarlyBeanReference()方法获取早期bean的对象引用。

我们先简单看看三级缓存代码部分，后面单独文章详细介绍：
**_DefaultSingletonBeanRegistry_**
```java
//  一级缓存：用于保存beanName和创建bean实例之间的关系，beanName -> bean instance
private final Map<String, Object> singletonObjects = new ConcurrentHashMap<>(256);

// 三级缓存：用于保存beanName和创建bean的工厂之间的关系，beanName -> ObjectFactory
private final Map<String, ObjectFactory<?>> singletonFactories = new HashMap<>(16);

// 二级缓存：用于保存beanName和创建bean实例之间的关系，beanName -> bean instance
// 与一级缓存的区别：当一个单例bean被放在二级缓存中后，当bean还在创建过程中，就可以通过getBean方法获取到了，目的是用来检测循环引用
private final Map<String, Object> earlySingletonObjects = new ConcurrentHashMap<>(16);
```

- getEarlyBeanReference()：获取早期访问指定 bean的引用
```java
/**
	 * 获取早期访问指定 bean 的引用，通常用于解析循环引用
	 * @param beanName
	 * @param mbd
	 * @param bean
	 * @return
	 */
	protected Object getEarlyBeanReference(String beanName, RootBeanDefinition mbd, Object bean) {
		Object exposedObject = bean;
		// 1、如果bean 定义不是“合成的”，并且工厂中存在创建时应用于单例 bean 的 InstantiationAwareBeanPostProcessor后置处理器，才会进入下面的逻辑
		if (!mbd.isSynthetic() && hasInstantiationAwareBeanPostProcessors()) {
			// 2、获取工厂中所有已注册的BeanPostProcessor后置增强器
			for (BeanPostProcessor bp : getBeanPostProcessors()) {
				// 3、判断是否属于SmartInstantiationAwareBeanPostProcessor类型
				if (bp instanceof SmartInstantiationAwareBeanPostProcessor) {
					SmartInstantiationAwareBeanPostProcessor ibp = (SmartInstantiationAwareBeanPostProcessor) bp;
					// 4、类型匹配的话，则执行SmartInstantiationAwareBeanPostProcessor的getEarlyBeanReference()方法获取bean的早期引用
					// getEarlyBeanReference()方法: 此回调使后处理器有机会尽早暴露包装器 - 即在目标 bean 实例完全初始化之前， 默认实现是返回原始的bean对象
					exposedObject = ibp.getEarlyBeanReference(exposedObject, beanName);
				}
			}
		}
		// 5、如果不存在SmartInstantiationAwareBeanPostProcessor，则直接返回原始的bean对象
		return exposedObject;
	}

```
:::warning
注意，上述代码中getEarlyBeanReference()方法并不是在这里就执行，这里只是将【() -> getEarlyBeanReference(beanName, mbd, bean)】这个函数式接口作为创建bean的对象工厂，添加到三级缓存中而已，后续解决循环依赖的时候，就会从三级缓存中拿出这个对象工厂，即执行ObjectFactory.getObject()方法的时候，就会回调getEarlyBeanReference(beanName, mbd, bean)方法，获取到提前暴露的bean的早期引用，从而解决循环依赖。
:::
## 1.2 属性填充
经过上面的一些了过程，终于来到实例化Bean
```java
    	// Initialize the bean instance.
		Object exposedObject = bean;
		try {
			// 对 bean 进行填充，将各个属性值注入
			// 如果存在对其它 bean 的依赖，将会递归初始化依赖的 bean
			populateBean(beanName, mbd, instanceWrapper);
			// 调用初始化方法，例如 init-method
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
首先我们来看看一个关键的方法populateBean
### 1.2.1 populateBean方法
**_AbstractAutowireCapableBeanFactory_**
```java
protected void populateBean(String beanName, RootBeanDefinition mbd, @Nullable BeanWrapper bw) {
    // 1、针对bean的包装器是否为空、是否存在为此 bean 定义的属性值，做不同的处理
    if (bw == null) {
        // 如果bean的包装器为空，但是又存在为此 bean 定义的属性值，Spring则会抛出BeanCreationException异常
        // 因为属性填充就是要给BeanWrapper 中的 bean 实例中的属性进行赋值的过程，存在属性，但是BeanWrapper为空，也就是BeanWrapper 中的 bean 实例为空，那么显然不行
        if (mbd.hasPropertyValues()) {
            throw new BeanCreationException(
                mbd.getResourceDescription(), beanName, "Cannot apply property values to null instance");
        } else {
            // 如果没有为此 bean 定义的属性值，即没有可填充的属性，则直接返回
            // Skip property population phase for null instance.
            return;
        }
    }

    // Give any InstantiationAwareBeanPostProcessors the opportunity to modify the
    // state of the bean before properties are set. This can be used, for example,
    // to support styles of field injection.

    // InstantiationAwareBeanPostProcessor后置处理器：可以在属性设置前修改bean
    // 2、如果bean定义不是合成的，并且工厂中存在创建时应用于单例 bean 的 InstantiationAwareBeanPostProcessor后置处理器，则需要处理执行它的postProcessAfterInstantiation()方法
    if (!mbd.isSynthetic() && hasInstantiationAwareBeanPostProcessors()) {
        // 获取到bean工厂所有已经注册的BeanPostProcessor
        for (BeanPostProcessor bp : getBeanPostProcessors()) {
            // 判断是否属于InstantiationAwareBeanPostProcessor类型
            if (bp instanceof InstantiationAwareBeanPostProcessor) {
                InstantiationAwareBeanPostProcessor ibp = (InstantiationAwareBeanPostProcessor) bp;
                // 如果类型匹配的话，将会执行InstantiationAwareBeanPostProcessor的postProcessAfterInstantiation()方法
                // postProcessAfterInstantiation()方法：在bean实例化后，属性填充之前被调用，允许修改bean的属性，默认实现是返回true
                if (!ibp.postProcessAfterInstantiation(bw.getWrappedInstance(), beanName)) {
                    // 如果postProcessAfterInstantiation()方法返回false，则跳过后面的属性填充过程
                    return;
                }
            }
        }
    }

    // 3、获取到bean定义中封装好的属性值
    PropertyValues pvs = (mbd.hasPropertyValues() ? mbd.getPropertyValues() : null);

    // 4、根据设置的自动注入方式（名称或者类型）获取属性bean（递归getBean）存入PropertyValues中
    int resolvedAutowireMode = mbd.getResolvedAutowireMode();
    if (resolvedAutowireMode == AUTOWIRE_BY_NAME || resolvedAutowireMode == AUTOWIRE_BY_TYPE) {
        MutablePropertyValues newPvs = new MutablePropertyValues(pvs);

        // 根据名称自动注入
        // Add property values based on autowire by name if applicable.
        if (resolvedAutowireMode == AUTOWIRE_BY_NAME) {
            autowireByName(beanName, mbd, bw, newPvs);
        }

        //根据类型自动注入
        // Add property values based on autowire by type if applicable.
        if (resolvedAutowireMode == AUTOWIRE_BY_TYPE) {
            autowireByType(beanName, mbd, bw, newPvs);
        }
        pvs = newPvs;
    }

    // hasInstAwareBpps：工厂是否存在将在创建时应用于单例 bean 的 InstantiationAwareBeanPostProcessor后置处理器
    boolean hasInstAwareBpps = hasInstantiationAwareBeanPostProcessors();
    // needsDepCheck：是否需要进行依赖检查
    boolean needsDepCheck = (mbd.getDependencyCheck() != AbstractBeanDefinition.DEPENDENCY_CHECK_NONE);

    PropertyDescriptor[] filteredPds = null;
    // 5、如果存在InstantiationAwareBeanPostProcessor后置处理器，需要执行InstantiationAwareBeanPostProcessor的postProcessProperties()以及postProcessPropertyValues()方法回调
    if (hasInstAwareBpps) {
        if (pvs == null) {
            pvs = mbd.getPropertyValues();
        }
        // 执行InstantiationAwareBeanPostProcessor的postProcessProperties()以及postProcessPropertyValues()方法回调
        // postProcessProperties(): 允许对填充前的属性进行处理（如对属性的验证）
        // postProcessPropertyValues(): 对属性值进行修改，通过基于原始的PropertyValues创建一个新的MutablePropertyValues实例，添加或删除特定的值。
        // 不过目前方法已经被标记为过期，在后续Spring版本中可能会被删除
        for (BeanPostProcessor bp : getBeanPostProcessors()) {
            if (bp instanceof InstantiationAwareBeanPostProcessor) {
                InstantiationAwareBeanPostProcessor ibp = (InstantiationAwareBeanPostProcessor) bp;
                PropertyValues pvsToUse = ibp.postProcessProperties(pvs, bw.getWrappedInstance(), beanName);
                if (pvsToUse == null) {
                    if (filteredPds == null) {
                        filteredPds = filterPropertyDescriptorsForDependencyCheck(bw, mbd.allowCaching);
                    }
                    pvsToUse = ibp.postProcessPropertyValues(pvs, filteredPds, bw.getWrappedInstance(), beanName);
                    if (pvsToUse == null) {
                        return;
                    }
                }
                pvs = pvsToUse;
            }
        }
    }

    // 6、执行依赖检查，对应depend-on属性
    if (needsDepCheck) {
        if (filteredPds == null) {
            filteredPds = filterPropertyDescriptorsForDependencyCheck(bw, mbd.allowCaching);
        }
        // 依赖检查，对应depend-on属性
        checkDependencies(beanName, mbd, filteredPds, pvs);
    }

    // 7、属性填充的具体过程，即将属性值赋值到beanWrapper中bean实例的具体属性中
    if (pvs != null) {
        // 开始填充属性值
        applyPropertyValues(beanName, mbd, bw, pvs);
    }
}
```
**_我们来梳理一下他的流程：_**

- **_针对bean的包装器是否为空、是否存在为此 bean 定义的属性值，做不同的处理。_**
- **_如果bean的包装器为空，但是又存在为此 bean 定义的属性值，Spring则会抛出BeanCreationException异常；如果没有为此 bean 定义的属性值，即没有可填充的属性，则直接返回_**
- **_如果bean定义不是合成的，并且工厂中存在创建时应用于单例 bean 的 InstantiationAwareBeanPostProcessor后置处理器，则需要处理执行它的postProcessAfterInstantiation()方法_**
- **_获取到bean定义中封装好的属性值_**
- **_根据设置的自动注入方式（名称或者类型）获取属性bean（递归getBean）存入PropertyValues中_**
- **_如果存在InstantiationAwareBeanPostProcessor后置处理器，需要执行InstantiationAwareBeanPostProcessor的postProcessProperties()以及postProcessPropertyValues()方法回调_**
- **_执行依赖检查，对应depend-on属性_**
- **_属性填充的具体过程，即将属性值赋值到beanWrapper中bean实例的具体属性中_**
> 1：Bean包装器判断

```java
	// 1、针对bean的包装器是否为空、是否存在为此 bean 定义的属性值，做不同的处理
		if (bw == null) {
			// 如果bean的包装器为空，但是又存在为此 bean 定义的属性值，Spring则会抛出BeanCreationException异常
			// 因为属性填充就是要给BeanWrapper 中的 bean 实例中的属性进行赋值的过程，存在属性，但是BeanWrapper为空，也就是BeanWrapper 中的 bean 实例为空，那么显然不行
			if (mbd.hasPropertyValues()) {
				throw new BeanCreationException(
						mbd.getResourceDescription(), beanName, "Cannot apply property values to null instance");
			} else {
				// 如果没有为此 bean 定义的属性值，即没有可填充的属性，则直接返回
				// Skip property population phase for null instance.
				return;
			}
		}
```
> 2：调用**_postProcessAfterInstantiation方法_**

```java
if (!mbd.isSynthetic() && hasInstantiationAwareBeanPostProcessors()) {
			// 获取到bean工厂所有已经注册的BeanPostProcessor
			for (BeanPostProcessor bp : getBeanPostProcessors()) {
				// 判断是否属于InstantiationAwareBeanPostProcessor类型
				if (bp instanceof InstantiationAwareBeanPostProcessor) {
					InstantiationAwareBeanPostProcessor ibp = (InstantiationAwareBeanPostProcessor) bp;
					// 如果类型匹配的话，将会执行InstantiationAwareBeanPostProcessor的postProcessAfterInstantiation()方法
					// postProcessAfterInstantiation()方法：在bean实例化后，属性填充之前被调用，允许修改bean的属性，默认实现是返回true
					if (!ibp.postProcessAfterInstantiation(bw.getWrappedInstance(), beanName)) {
						// 如果postProcessAfterInstantiation()方法返回false，则跳过后面的属性填充过程
						return;
					}
				}
			}
		}
```
> 3：封装值

```java
// 3、获取到bean定义中封装好的属性值
PropertyValues pvs = (mbd.hasPropertyValues() ? mbd.getPropertyValues() : null);
```
> 4：**_根据设置的自动注入方式（名称或者类型）获取属性bean（递归getBean）存入PropertyValues中（重点理解）_**

```java
    	// 4、根据设置的自动注入方式（名称或者类型）获取属性bean（递归getBean）存入PropertyValues中
		int resolvedAutowireMode = mbd.getResolvedAutowireMode();
		if (resolvedAutowireMode == AUTOWIRE_BY_NAME || resolvedAutowireMode == AUTOWIRE_BY_TYPE) {
			MutablePropertyValues newPvs = new MutablePropertyValues(pvs);

			// 根据名称自动注入
			// Add property values based on autowire by name if applicable.
			if (resolvedAutowireMode == AUTOWIRE_BY_NAME) {
				autowireByName(beanName, mbd, bw, newPvs);
			}

			//根据类型自动注入
			// Add property values based on autowire by type if applicable.
			if (resolvedAutowireMode == AUTOWIRE_BY_TYPE) {
				autowireByType(beanName, mbd, bw, newPvs);
			}
			pvs = newPvs;
		}

		// hasInstAwareBpps：工厂是否存在将在创建时应用于单例 bean 的 InstantiationAwareBeanPostProcessor后置处理器
		boolean hasInstAwareBpps = hasInstantiationAwareBeanPostProcessors();
		// needsDepCheck：是否需要进行依赖检查
		boolean needsDepCheck = (mbd.getDependencyCheck() != AbstractBeanDefinition.DEPENDENCY_CHECK_NONE);
```
首先我们看看Spring提供了那几种注入方式：
**_AutowireCapableBeanFactor_**y
```java
int AUTOWIRE_NO = 0;
// 名称
int AUTOWIRE_BY_NAME = 1;
// 类型
int AUTOWIRE_BY_TYPE = 2;
// 构造器
int AUTOWIRE_CONSTRUCTOR = 3;
// 已废弃 ，自动
@Deprecated
int AUTOWIRE_AUTODETECT = 4;
```
首先获取Bean的注入方式：
**_AbstractBeanDefinition_**
```java
	public int getResolvedAutowireMode() {
        // 自动注入
		if (this.autowireMode == AUTOWIRE_AUTODETECT) {
			// Work out whether to apply setter autowiring or constructor autowiring.
			// If it has a no-arg constructor it's deemed to be setter autowiring,
			// otherwise we'll try constructor autowiring.
			Constructor<?>[] constructors = getBeanClass().getConstructors();
			for (Constructor<?> constructor : constructors) {
                // 构造器参数为0
				if (constructor.getParameterCount() == 0) {
                    // 类型注入
					return AUTOWIRE_BY_TYPE;
				}
			}
            // 构造器注入
			return AUTOWIRE_CONSTRUCTOR;
		}
		else {
			return this.autowireMode;
		}
	}
```
我们首先来看看通过名称注入：
```java
protected void autowireByName(
			String beanName, AbstractBeanDefinition mbd, BeanWrapper bw, MutablePropertyValues pvs) {
		// 1、获取需要注入的属性名称数组，注意只获取不是“简单”属性类型（基础类型、枚举、Number等）的那些属性
		String[] propertyNames = unsatisfiedNonSimpleProperties(mbd, bw);
		// 2、循环需要注入的属性，根据名称自动注入
		for (String propertyName : propertyNames) {
			// 3、判断是否存在名称为propertyName的bean或者bean定义，如果当前工厂中没找到，还会递归所有的父工厂去查找
			if (containsBean(propertyName)) {
				// 4、通过getBean从工厂中获取到名称为propertyName的bean实例
				Object bean = getBean(propertyName);
				// 5、将propertyName以及对应的属性值bean添加到MutablePropertyValues中
				pvs.add(propertyName, bean);
				// 6、注册依赖关系到两个缓存中：dependentBeanMap、dependenciesForBeanMap
				registerDependentBean(propertyName, beanName);
				if (logger.isTraceEnabled()) {
					logger.trace("Added autowiring by name from bean name '" + beanName +
							"' via property '" + propertyName + "' to bean named '" + propertyName + "'");
				}
			} else {
				// 7、如果工厂以及父工厂都没有找到名称为propertyName的bean或者bean定义，则不处理这个属性
				if (logger.isTraceEnabled()) {
					logger.trace("Not autowiring property '" + propertyName + "' of bean '" + beanName +
							"' by name: no matching bean found");
				}
			}
		}
	}
```
注册Bean的依赖关系
**_DefaultSingletonBeanRegistry_**
```java
//为指定的Bean注入依赖的Bean
public void registerDependentBean(String beanName, String dependentBeanName) {
	// A quick check for an existing entry upfront, avoiding synchronization...
	//处理Bean名称，将别名转换为规范的Bean名称
	String canonicalName = canonicalName(beanName);
	Set<String> dependentBeans = this.dependentBeanMap.get(canonicalName);
	if (dependentBeans != null && dependentBeans.contains(dependentBeanName)) {
		return;
	}

	// No entry yet -> fully synchronized manipulation of the dependentBeans Set
	//多线程同步，保证容器内数据的一致性
	//先从容器中：bean名称-->全部依赖Bean名称集合找查找给定名称Bean的依赖Bean
	synchronized (this.dependentBeanMap) {
		//获取给定名称Bean的所有依赖Bean名称
		dependentBeans = this.dependentBeanMap.get(canonicalName);
		if (dependentBeans == null) {
			//为Bean设置依赖Bean信息
			dependentBeans = new LinkedHashSet<>(8);
			this.dependentBeanMap.put(canonicalName, dependentBeans);
		}
		//向容器中：bean名称-->全部依赖Bean名称集合添加Bean的依赖信息
		//即，将Bean所依赖的Bean添加到容器的集合中
		dependentBeans.add(dependentBeanName);
	}
	//从容器中：bean名称-->指定名称Bean的依赖Bean集合找查找给定名称Bean的依赖Bean
	synchronized (this.dependenciesForBeanMap) {
		Set<String> dependenciesForBean = this.dependenciesForBeanMap.get(dependentBeanName);
		if (dependenciesForBean == null) {
			dependenciesForBean = new LinkedHashSet<>(8);
			this.dependenciesForBeanMap.put(dependentBeanName, dependenciesForBean);
		}
		//向容器中：bean名称-->指定Bean的依赖Bean名称集合添加Bean的依赖信息
		//即，将Bean所依赖的Bean添加到容器的集合中
		dependenciesForBean.add(canonicalName);
	}
}
```
a、对Bean 的属性代调用getBean()方法，完成依赖Bean 的初始化和依赖注入。
b、将依赖Bean 的属性引用设置到被依赖的Bean 属性上。
c、将依赖Bean 的名称和被依赖Bean 的名称存储在IOC 容器的集合中。
接下来看看通过类型注入：
```java
/**
	 * 通过类型注入
	 * @param beanName
	 * @param mbd
	 * @param bw
	 * @param pvs
	 */
	protected void autowireByType(
			String beanName, AbstractBeanDefinition mbd, BeanWrapper bw, MutablePropertyValues pvs) {

		// 1、判断是否存在自定义的TypeConverter，存在则使用自定义的，否则还是使用入参指定的bw
		TypeConverter converter = getCustomTypeConverter();
		if (converter == null) {
			converter = bw;
		}

		Set<String> autowiredBeanNames = new LinkedHashSet<>(4);
		// 2、获取需要注入的属性名称数组，注意只获取不是“简单”属性类型（基础类型、枚举、Number等）的那些属性
		String[] propertyNames = unsatisfiedNonSimpleProperties(mbd, bw);
		for (String propertyName : propertyNames) {
			try {
				// 3、获取包装对象的特定属性的属性描述符
				PropertyDescriptor pd = bw.getPropertyDescriptor(propertyName);
				// Don't try autowiring by type for type Object: never makes sense,
				// even if it technically is a unsatisfied, non-simple property.
				if (Object.class != pd.getPropertyType()) {
					// 4、为指定属性的写入方法获取一个新的 MethodParameter 对象，通常指的是获取setter方法
					MethodParameter methodParam = BeanUtils.getWriteMethodParameter(pd);
					// Do not allow eager init for type matching in case of a prioritized post-processor.
					boolean eager = !(bw.getWrappedInstance() instanceof PriorityOrdered);
					DependencyDescriptor desc = new AutowireByTypeDependencyDescriptor(methodParam, eager);
					// 5、解析当前属性所匹配的bean实例，并把解析到的bean实例的beanName存入autowiredBeanNames
					Object autowiredArgument = resolveDependency(desc, beanName, autowiredBeanNames, converter);

					if (autowiredArgument != null) {
						// 6、如果解析到的bean实例不为空的话，将propertyName以及对应的属性值autowiredArgument添加到MutablePropertyValues中
						pvs.add(propertyName, autowiredArgument);
					}
					for (String autowiredBeanName : autowiredBeanNames) {
						// 7、注册依赖关系到两个缓存中：dependentBeanMap、dependenciesForBeanMap，这里是beanName依赖了autowiredBeanName
						registerDependentBean(autowiredBeanName, beanName);
						if (logger.isTraceEnabled()) {
							logger.trace("Autowiring by type from bean name '" + beanName + "' via property '" +
									propertyName + "' to bean named '" + autowiredBeanName + "'");
						}
					}
					autowiredBeanNames.clear();
				}
			} catch (BeansException ex) {
				throw new UnsatisfiedDependencyException(mbd.getResourceDescription(), beanName, propertyName, ex);
			}
		}
	}
```
> 5：**_如果存在InstantiationAwareBeanPostProcessor后置处理器，需要执行InstantiationAwareBeanPostProcessor的postProcessProperties()以及postProcessPropertyValues()方法回调_**

```java
// 5、如果存在InstantiationAwareBeanPostProcessor后置处理器，需要执行InstantiationAwareBeanPostProcessor的postProcessProperties()以及postProcessPropertyValues()方法回调
		if (hasInstAwareBpps) {
			if (pvs == null) {
				pvs = mbd.getPropertyValues();
			}
			// 执行InstantiationAwareBeanPostProcessor的postProcessProperties()以及postProcessPropertyValues()方法回调
			// postProcessProperties(): 允许对填充前的属性进行处理（如对属性的验证）
			// postProcessPropertyValues(): 对属性值进行修改，通过基于原始的PropertyValues创建一个新的MutablePropertyValues实例，添加或删除特定的值。
			// 不过目前方法已经被标记为过期，在后续Spring版本中可能会被删除
			for (BeanPostProcessor bp : getBeanPostProcessors()) {
				if (bp instanceof InstantiationAwareBeanPostProcessor) {
					InstantiationAwareBeanPostProcessor ibp = (InstantiationAwareBeanPostProcessor) bp;
					PropertyValues pvsToUse = ibp.postProcessProperties(pvs, bw.getWrappedInstance(), beanName);
					if (pvsToUse == null) {
						if (filteredPds == null) {
							filteredPds = filterPropertyDescriptorsForDependencyCheck(bw, mbd.allowCaching);
						}
						pvsToUse = ibp.postProcessPropertyValues(pvs, filteredPds, bw.getWrappedInstance(), beanName);
						if (pvsToUse == null) {
							return;
						}
					}
					pvs = pvsToUse;
				}
			}
		}
```
> 6：依赖检查

```java
// 6、执行依赖检查，对应depend-on属性
		if (needsDepCheck) {
			if (filteredPds == null) {
				filteredPds = filterPropertyDescriptorsForDependencyCheck(bw, mbd.allowCaching);
			}
			// 依赖检查，对应depend-on属性
			checkDependencies(beanName, mbd, filteredPds, pvs);
		}
```
[spring](http://lib.csdn.net/base/javaee)默认情况下是不检查依赖的，如果要使用依赖检查需要手动的在配置文件中设置。
依赖检查有四种模式：simple,objects,all,none
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693556768975-5e84b6aa-c05c-4147-b629-8783516b3df7.png#averageHue=%231f2024&clientId=u865eb050-8750-4&from=paste&height=646&id=u4ebcf662&originHeight=808&originWidth=1153&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=119821&status=done&style=none&taskId=u8f564dfc-14a5-4e6b-a978-f8b33b39842&title=&width=922.4)
**_AbstractAutowireCapableBeanFactory_**
```java
protected void checkDependencies(
			String beanName, AbstractBeanDefinition mbd, PropertyDescriptor[] pds, @Nullable PropertyValues pvs)
			throws UnsatisfiedDependencyException {
    	// 获取检查依赖模式
		int dependencyCheck = mbd.getDependencyCheck();
    	//  循环判断
		for (PropertyDescriptor pd : pds) {
			if (pd.getWriteMethod() != null && (pvs == null || !pvs.contains(pd.getName()))) {
				boolean isSimple = BeanUtils.isSimpleProperty(pd.getPropertyType());
				boolean unsatisfied = (dependencyCheck == AbstractBeanDefinition.DEPENDENCY_CHECK_ALL) ||
						(isSimple && dependencyCheck == AbstractBeanDefinition.DEPENDENCY_CHECK_SIMPLE) ||
						(!isSimple && dependencyCheck == AbstractBeanDefinition.DEPENDENCY_CHECK_OBJECTS);
				if (unsatisfied) {
					throw new UnsatisfiedDependencyException(mbd.getResourceDescription(), beanName, pd.getName(),
							"Set this property value or disable dependency checking for this bean.");
				}
			}
		}
	}
```
> 7：具体的属性填充

```java
// 7、属性填充的具体过程，即将属性值赋值到beanWrapper中bean实例的具体属性中
		if (pvs != null) {
			// 开始填充属性值
			applyPropertyValues(beanName, mbd, bw, pvs);
		}
```

```java
/**
	 * Apply the given property values, resolving any runtime references
	 * to other beans in this bean factory. Must use deep copy, so we
	 * don't permanently modify this property.
	 * <p>应用给定的属性值，解决任何在这个bean工厂运行时其他bean的引用。必须使用深拷贝，所以我们
	 * 不会永久地修改这个属性</p>
	 * @param beanName the bean name passed for better exception information
	 *                 -- 传递bean名以获得更好的异常信息
	 * @param mbd the merged bean definition
	 *            -- 合并后的bean定义
	 * @param bw the BeanWrapper wrapping the target object
	 *           -- 包装目标对象的BeanWrapper
	 * @param pvs the new property values
	 *            -- 新得属性值
	 */
	protected void applyPropertyValues(String beanName, BeanDefinition mbd, BeanWrapper bw, PropertyValues pvs) {
		//如果pvs没有PropertyValue
		if (pvs.isEmpty()) {
			//直接结束方法
			return;
		}

		//如果有安全管理器 且 bw是BeanWrapperImpld恶实例
		if (System.getSecurityManager() != null && bw instanceof BeanWrapperImpl) {
			//设置bw的安全上下文为工厂的访问控制上下文
			((BeanWrapperImpl) bw).setSecurityContext(getAccessControlContext());
		}
		//MutablePropertyValues：PropertyValues接口的默认实现。允许对属性进行简单操作，并提供构造函数来支持从映射 进行深度复制和构造
		MutablePropertyValues mpvs = null;
		//原始属性值列表
		List<PropertyValue> original;
		//如果pvs是MutablePropertyValues实例
		if (pvs instanceof MutablePropertyValues) {
			//将pvs强转为MutablePropertyValue实例
			mpvs = (MutablePropertyValues) pvs;
			//isConverted:返回该holder是否只包含转换后的值(true),或者是否仍然需要转换这些值
			//如果mpvs只包含转换后的值
			if (mpvs.isConverted()) {
				// Shortcut: use the pre-converted values as-is.
				// 快捷方式：使用 pre-conveted初始值
				try {
					//使用mpvs批量设置bw包装的Bean对象属性
					bw.setPropertyValues(mpvs);
					//终止方法。
					return;
				}
				catch (BeansException ex) {
					//捕捉Bean异常，重新抛出Bean创佳异常：错误设置属性值。
					throw new BeanCreationException(
							mbd.getResourceDescription(), beanName, "Error setting property values", ex);
				}
			}
			//获取mpvs的PropertyValue对象列表
			original = mpvs.getPropertyValueList();
		}
		else {
			//获取pvs的PropertyValue对象数组，并将其转换成列表
			original = Arrays.asList(pvs.getPropertyValues());
		}

		//获取工厂的自定义类型转换器
		TypeConverter converter = getCustomTypeConverter();
		//如果工厂中没有设置自定义类型转换器
		if (converter == null) {
			//使用bw作为转换器
			converter = bw;
		}
		//BeanDefinitionValueResolver:在bean工厂实现中使用Helper类，它将beanDefinition对象中包含的值解析为应用于 目标bean实例的实际值
		BeanDefinitionValueResolver valueResolver = new BeanDefinitionValueResolver(this, beanName, mbd, converter);

		// Create a deep copy, resolving any references for values.
		// 创建一个深拷贝，解析任何值引用
		List<PropertyValue> deepCopy = new ArrayList<>(original.size());
		//是否还需要解析标记
		boolean resolveNecessary = false;
		//遍历orgininal
		for (PropertyValue pv : original) {
			//如果pv已经是转换后的值
			if (pv.isConverted()) {
				//将pv添加到deepCopy中
				deepCopy.add(pv);
			}
			else {//pv需要转换值
				//获取pv的属性名
				String propertyName = pv.getName();
				//获取pv的原始属性值
				Object originalValue = pv.getValue();
				//AutowiredPropertyMarker.INSTANCE：自动生成标记的规范实例
				if (originalValue == AutowiredPropertyMarker.INSTANCE) {
					//获取propertyName在bw中的setter方法
					Method writeMethod = bw.getPropertyDescriptor(propertyName).getWriteMethod();
					//如果setter方法为null
					if (writeMethod == null) {
						//抛出非法参数异常：自动装配标记属性没有写方法。
						throw new IllegalArgumentException("Autowire marker for property without write method: " + pv);
					}
					//将writerMethod封装到DependencyDescriptor对象
					originalValue = new DependencyDescriptor(new MethodParameter(writeMethod, 0), true);
				}
				//交由valueResolver根据pv解析出originalValue所封装的对象
				Object resolvedValue = valueResolver.resolveValueIfNecessary(pv, originalValue);
				//默认转换后的值是刚解析出来的值
				Object convertedValue = resolvedValue;
				//可转换标记: propertyName是否bw中的可写属性 && prepertyName不是表示索引属性或嵌套属性（如果propertyName中有'.'||'['就认为是索引属性或嵌套属性）
				boolean convertible = bw.isWritableProperty(propertyName) &&
						!PropertyAccessorUtils.isNestedOrIndexedProperty(propertyName);
				//如果可转换
				if (convertible) {
					//将resolvedValue转换为指定的目标属性对象
					convertedValue = convertForProperty(resolvedValue, propertyName, bw, converter);
				}
				// Possibly store converted value in merged bean definition,
				// in order to avoid re-conversion for every created bean instance.
				// 可以将转换后的值存储合并后BeanDefinition中，以避免对每个创建的Bean实例进行重新转换
				//如果resolvedValue与originalValue是同一个对象
				if (resolvedValue == originalValue) {
					//如果可转换
					if (convertible) {
						//将convertedValue设置到pv中
						pv.setConvertedValue(convertedValue);
					}
					//将pv添加到deepCopy中
					deepCopy.add(pv);
				}
				//TypedStringValue:类型字符串的Holder,这个holder将只存储字符串值和目标类型。实际得转换将由Bean工厂执行
				//如果可转换 && originalValue是TypedStringValue的实例 && orginalValue不是标记为动态【即不是一个表达式】&&
				// 	convertedValue不是Collection对象 或 数组
				else if (convertible && originalValue instanceof TypedStringValue &&
						!((TypedStringValue) originalValue).isDynamic() &&
						!(convertedValue instanceof Collection || ObjectUtils.isArray(convertedValue))) {
					//将convertedValue设置到pv中
					pv.setConvertedValue(convertedValue);
					//将pv添加到deepCopy中
					deepCopy.add(pv);
				}
				else {
					//标记还需要解析
					resolveNecessary = true;
					//根据pv,convertedValue构建PropertyValue对象，并添加到deepCopy中
					deepCopy.add(new PropertyValue(pv, convertedValue));
				}
			}
		}
		//mpvs不为null && 已经不需要解析
		if (mpvs != null && !resolveNecessary) {
			//将此holder标记为只包含转换后的值
			mpvs.setConverted();
		}

		// Set our (possibly massaged) deep copy.
		// 设置我们的深层拷贝(可能时按摩过的)
		try {

			//按原样使用deepCopy构造一个新的MutablePropertyValues对象然后设置到bw中以对bw的属性值更新
			bw.setPropertyValues(new MutablePropertyValues(deepCopy));
		}
		catch (BeansException ex) {//捕捉更新属性值的Bean异常
			//重新抛出Bean创建异常：错误设置属性值
			throw new BeanCreationException(
					mbd.getResourceDescription(), beanName, "Error setting property values", ex);
		}
	}


```
大体步骤：

- 首先检查是否存在要应用的属性值，如果属性值为空，直接返回。
- 如果有安全管理器且**bw**是**BeanWrapperImpl**的实例，设置**bw**的安全上下文为工厂的访问控制上下文。
- 创建**MutablePropertyValues**对象，并根据传入的属性值对象（**pvs**）初始化。
- 进行属性值的解析和类型转换，确保属性值可以正确地应用到Bean实例中。
- 最后，将转换后的属性值设置到**bw**包装的Bean对象中，更新Bean的属性值。

后面会出文章详细介绍的，到这我们就完成了属性填充
### 1.2.2 initializeBean方法
initializeBean()主要完成如执行aware接口、执行init-method方法、BeanPostProcessor后置增强等工作。
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
**_initializeBean()方法处理过程：_**
**_1、执行Aware方法，如BeanNameAware、BeanClassLoaderAware、BeanFactoryAware_**
**_2、执行BeanPostProcessor后置处理器的前置处理方法：postProcessBeforeInitialization()，允许对bean实例进行包装_**
**_3、执行初始化方法,包括InitializingBean的afterPropertiesSet()方法、自定义的初始化方法init-method_**
**_4、执行BeanPostProcessor后置处理器的后置处理方法：postProcessAfterInitialization()，允许对bean实例进行包装_**
####  执行Aware方法
**_AbstractAutowireCapableBeanFactory_**
```java
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
```

- invokeAwareMethods()：执行Aware方法，如BeanNameAware、BeanClassLoaderAware、BeanFactoryAware
```java
// 实现Aware接口的bean在被初始化后，可以取得一些相对应的资源，如BeanFactory、ApplicationContext等，下面就是具体的赋值过程
private void invokeAwareMethods(String beanName, Object bean) {
    if (bean instanceof Aware) {
        // 1、如果bean实现了BeanNameAware接口，那么在bean内部可以获取到BeanName属性
        if (bean instanceof BeanNameAware) {
            ((BeanNameAware) bean).setBeanName(beanName);
        }

        // 2、如果bean实现了BeanClassLoaderAware接口，那么在bean内部可以获取到BeanClassLoader对象
        if (bean instanceof BeanClassLoaderAware) {
            ClassLoader bcl = getBeanClassLoader();
            if (bcl != null) {
                ((BeanClassLoaderAware) bean).setBeanClassLoader(bcl);
            }
        }

        // 3、如果bean实现了BeanFactoryAware接口，那么在bean内部可以获取到BeanFactory工厂对象
        if (bean instanceof BeanFactoryAware) {
            ((BeanFactoryAware) bean).setBeanFactory(AbstractAutowireCapableBeanFactory.this);
        }
    }
}
```
#### 执行BeanPostProcessor后置处理器的前置处理方法
这里需要看一下上一篇的Bean的后置处理
```java
Object wrappedBean = bean;
		if (mbd == null || !mbd.isSynthetic()) {
			// 2、执行BeanPostProcessor后置处理器的前置处理方法：postProcessBeforeInitialization()，允许对bean实例进行包装
			wrappedBean = applyBeanPostProcessorsBeforeInitialization(wrappedBean, beanName);
		}
```

- applyBeanPostProcessorsBeforeInitialization()：执行BeanPostProcessor后置处理器的前置处理方法
```java
	@Override
	public Object applyBeanPostProcessorsBeforeInitialization(Object existingBean, String beanName)
			throws BeansException {

		Object result = existingBean;
		// 1、获取到当前工厂中注册的所有BeanPostProcessor后置处理器
		for (BeanPostProcessor processor : getBeanPostProcessors()) {
			// 2、执行每一个BeanPostProcessor的前置增强方法：postProcessBeforeInitialization()
			Object current = processor.postProcessBeforeInitialization(result, beanName);
			if (current == null) {
				// 3、如果postProcessBeforeInitialization()返回为空，则直接返回，将不会执行后续的BeanPostProcessor后置处理器的增强
				return result;
			}
			// 4、使用增强后的bean current，赋值给result，然后返回
			result = current;
		}
		return result;
	}
```
#### 执行初始化方法
```java
try {
			// 3、执行初始化方法,包括InitializingBean的afterPropertiesSet()方法、自定义的初始化方法init-method
			invokeInitMethods(beanName, wrappedBean, mbd);
		} catch (Throwable ex) {
			throw new BeanCreationException(
					(mbd != null ? mbd.getResourceDescription() : null),
					beanName, "Invocation of init method failed", ex);
		}
```

- invokeInitMethods()：执行初始化方法,包括InitializingBean的afterPropertiesSet()方法、自定义的初始化方法init-method
```java
protected void invokeInitMethods(String beanName, Object bean, @Nullable RootBeanDefinition mbd)
    throws Throwable {
    // 1、检查bean是否实现了InitializingBean接口，如果实现了，则需要执行InitializingBean接口的afterPropertiesSet()方法
    boolean isInitializingBean = (bean instanceof InitializingBean);
    if (isInitializingBean && (mbd == null || !mbd.isExternallyManagedInitMethod("afterPropertiesSet"))) {
        if (logger.isTraceEnabled()) {
            logger.trace("Invoking afterPropertiesSet() on bean with name '" + beanName + "'");
        }

        // 2、调用InitializingBean接口的afterPropertiesSet()方法
        if (System.getSecurityManager() != null) {
            try {
                AccessController.doPrivileged((PrivilegedExceptionAction<Object>) () -> {
                    ((InitializingBean) bean).afterPropertiesSet();
                    return null;
                }, getAccessControlContext());
            } catch (PrivilegedActionException pae) {
                throw pae.getException();
            }
        } else {
            ((InitializingBean) bean).afterPropertiesSet();
        }
    }

    // 3、调用用户自定义的初始化方法，比如init-method等
    if (mbd != null && bean.getClass() != NullBean.class) {
        String initMethodName = mbd.getInitMethodName();
        if (StringUtils.hasLength(initMethodName) &&
            !(isInitializingBean && "afterPropertiesSet".equals(initMethodName)) &&
            !mbd.isExternallyManagedInitMethod(initMethodName)) {
            // 执行用户自定义的初始化方法
            invokeCustomInitMethod(beanName, bean, mbd);
        }
    }
}
```
#### 执行BeanPostProcessor后置处理器的后置处理方法：postProcessAfterInitialization()，允许对bean实例进行包装
```java
if (mbd == null || !mbd.isSynthetic()) {
			// 4、执行BeanPostProcessor后置处理器的后置处理方法：postProcessAfterInitialization()，允许对bean实例进行包装
			wrappedBean = applyBeanPostProcessorsAfterInitialization(wrappedBean, beanName);
		}
```

- applyBeanPostProcessorsAfterInitialization()：执行BeanPostProcessor后置处理器的后置处理方法：postProcessAfterInitialization()，允许对bean实例进行包装
```java
	public Object applyBeanPostProcessorsAfterInitialization(Object existingBean, String beanName)
			throws BeansException {

		Object result = existingBean;
		// 1、获取到工厂中注册的所有BeanPostProcessor后置增强器
		for (BeanPostProcessor processor : getBeanPostProcessors()) {
			// 2、执行BeanPostProcessor的后置增强方法postProcessAfterInitialization()
			Object current = processor.postProcessAfterInitialization(result, beanName);
			if (current == null) {
				// 3、如果postProcessAfterInitialization()返回为空，则直接返回，将不会执行后续的BeanPostProcessor后置处理器的增强
				return result;
			}
			// 4、使用增强后的bean current，赋值给result，然后返回
			result = current;
		}
		return result;
	}
```
## 1.3 根据 scope 注册 bean
注册DisposableBean的实现，在注销时执行来源于DestructionAwareBeanPostProcessors、实现的DisposableBean的destroy方法还有自己配置的destroy-method的处理。
```java
// Register bean as disposable.
		// 根据 scope 注册 bean
		try {
			registerDisposableBeanIfNecessary(beanName, bean, mbd);
		}
		catch (BeanDefinitionValidationException ex) {
			throw new BeanCreationException(
					mbd.getResourceDescription(), beanName, "Invalid destruction signature", ex);
		}

```
**_AbstractBeanFactory_**
```java
	protected void registerDisposableBeanIfNecessary(String beanName, Object bean, RootBeanDefinition mbd) {
		AccessControlContext acc = (System.getSecurityManager() != null ? getAccessControlContext() : null);
		// 如果bean的作用域不是prototype，且bean需要在关闭时进行销毁
		if (!mbd.isPrototype() && requiresDestruction(bean, mbd)) {
			// 如果bean的作用域是singleton，则会注册用于销毁的bean到disposableBeans缓存，执行给定bean的所有销毁工作
			if (mbd.isSingleton()) {
				// Register a DisposableBean implementation that performs all destruction
				// work for the given bean: DestructionAwareBeanPostProcessors,
				// DisposableBean interface, custom destroy method.
				registerDisposableBean(beanName, new DisposableBeanAdapter(bean, beanName, mbd, getBeanPostProcessors(), acc));
			} else {
				// 如果bean的作用域不是prototype、也不是singleton，而是其他作自定义用域的话，则注册一个回调，以在销毁作用域内的指定对象时执行

				// A bean with a custom scope...
				Scope scope = this.scopes.get(mbd.getScope());
				if (scope == null) {
					throw new IllegalStateException("No Scope registered for scope name '" + mbd.getScope() + "'");
				}
				scope.registerDestructionCallback(beanName, new DisposableBeanAdapter(bean, beanName, mbd, getBeanPostProcessors(), acc));
			}
		}
	}



public void registerDisposableBean(String beanName, DisposableBean bean) {
    // 注册用于销毁的bean到disposableBeans缓存
    synchronized (this.disposableBeans) {
        // private final Map<String, Object> disposableBeans = new LinkedHashMap<>();
        this.disposableBeans.put(beanName, bean);
    }
}
```
我们后面来详细分析，到这我们就完成了Bean的整个流程，后面我们正对各个模块来进行分析，前面的分析这是一个整体流程的概述，相当于下面的代码部分，这只是正对下面的一个流程的分析
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
