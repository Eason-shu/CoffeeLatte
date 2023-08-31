---

title: Spring源码分析 （八） CreateBean与DoCreateBean
sidebar_position: 8
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

上一节我们看到正对不同作用域Bean的加载，但是Bean的核心创建我们还没有说，下面我们来看看Bean的核心加载也就是CreateBean与DoCreateBean方法的核心实现
# 一 CreateBean
_**AbstractAutowireCapableBeanFactory**_
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

- 根据设置的class属性或者根据className来解析Class，这里面逻辑十分复杂，但是我们可以猜想他的作用，不就是通过类加载来实例化我们编写，并组装成RootBeanDefinition，前面我们也说过所有的Bean后续处理都是针对于RootBeanDefinition的
```java

    // 确保此时的 bean 已经被解析了
    // 如果获取的class 属性不为null，则克隆该 BeanDefinition
    // 主要是因为该动态解析的 class 无法保存到到共享的 BeanDefinition
    Class<?> resolvedClass = resolveBeanClass(mbd, beanName);
    if (resolvedClass != null && !mbd.hasBeanClass() && mbd.getBeanClassName() != null) {
        mbdToUse = new RootBeanDefinition(mbd);
        mbdToUse.setBeanClass(resolvedClass);
    }
```
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693445150886-73c1787e-c733-4388-868f-e8943c5939c7.png#averageHue=%23272a2f&from=url&id=nrHyr&originHeight=715&originWidth=1713&originalType=binary&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&title=)

- 对override属性进行标记及验证，lookup-method和replace-method的，而这两个配置的加载其实就是将配置统一存放在BeanDefinition中的methodOverrides属性里，而这个函数的操作其实也就是针对于这两个配置的
```java
    try {
        // 验证和准备覆盖方法
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

- 应用初始化前的后处理器，解析指定bean是否存在初始化前的短路操作：

在真正调用doCreate方法创建bean的实例前使用了这样一个方法resolveBeforeInstantiation (beanName, mbd)对BeanDefinigiton中的属性做些前置处理，当经过前置处理后返回的结果如果不为空，那么会直接略过后续的Bean的创建而直接返回结果。这一特性虽然很容易被忽略，但是却起着至关重要的作用，我们熟知的AOP功能就是基于这里的判断的
```java
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
```
```java
protected Object resolveBeforeInstantiation(String beanName, RootBeanDefinition mbd) {
		Object bean = null;
    	// 如果没有被解析
		if (!Boolean.FALSE.equals(mbd.beforeInstantiationResolved)) {
			// Make sure bean class is actually resolved at this point.
            // synthetic表示合成，如果某些Bean式合成的，那么则不会经过BeanPostProcessor的处理
			if (!mbd.isSynthetic() && hasInstantiationAwareBeanPostProcessors())
                // 确定目标类型
				Class<?> targetType = determineTargetType(beanName, mbd);
				if (targetType != null) {
                    // 在实例化之前应用 Bean 后处理器
					bean = applyBeanPostProcessorsBeforeInstantiation(targetType, beanName);
					if (bean != null) {
                        // 初始化后应用 Bean 后处理器
						bean = applyBeanPostProcessorsAfterInitialization(bean, beanName);
					}
				}
			}
			mbd.beforeInstantiationResolved = (bean != null);
		}
		return bean;
	}
```
此方法中最吸引我们的无疑是两个方法applyBeanPostProcessorsBeforeInstantiation以及applyBeanPostProcessorsAfterInitialization。
两个方法实现的非常简单，无非是对后处理器中的所有InstantiationAwareBeanPostProcessor类型的后处理器进行postProcessBeforeInstantiation方法和BeanPostProcessor的postProcessAfterInitialization方法的调用。（后面生命周期详细讲解）
参考文章：[spring bean扩展点：后处理器 BeanPostProcessor_postprocessbeforeinstantiation](https://blog.csdn.net/qq_36697880/article/details/113986748?ops_request_misc=&request_id=&biz_id=102&utm_term=applyBeanPostProcessorsBeforeI&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-5-113986748.nonecase&spm=1018.2226.3001.4187)
如果没有代理对象，就只能走常规的路线进行 bean 的创建了，该过程有 doCreateBean() 实现
# 二 doCreateBean
当经历过resolveBeforeInstantiation方法后，程序有两个选择，如果创建了代理或者说重写了InstantiationAwareBeanPostProcessor的postProcessBeforeInstantiation方法并在方法postProcess BeforeInstantiation中改变了bean，则直接返回就可以了，否则需要进行常规bean的创建。
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

**_我们依次来看看呗_**
## 2.1 BeanWrapper
在详细介绍之前，我们先了解BeanWrapper这个类的作用
BeanWrapper是对Bean的包装，其接口中所定义的功能很简单包括设置获取被包装的对象，获取被包装bean的属性描述器，由于BeanWrapper接口是PropertyAccessor的子接口，因此其也可以设置以及访问被包装对象的属性值。
BeanWrapper大部分情况下是在spring ioc内部进行使用，通过BeanWrapper,spring ioc容器可以用统一的方式来访问bean的属性。用户很少需要直接使用BeanWrapper进行编程。
## 2.2 缓存删除
```java
   // BeanWrapper是对Bean的包装，其接口中所定义的功能很简单包括设置获取被包装的对象，获取被包装bean的属性描述器
        BeanWrapper instanceWrapper = null;
        // 单例模型，则从未完成的 FactoryBean 缓存中删除
        if (mbd.isSingleton()) {anceWrapper = this.factoryBeanInstanceCache.remove(beanName);
        }
```
## 2.3 实例化Bean
参考博客：[Spring IoC 依赖注入（四）构造器或工厂注入 ](https://www.cnblogs.com/binarylei/p/12337123.html#6-instantiateusingfactorymethod)
```java
    	// 使用合适的实例化策略来创建新的实例：工厂方法、Spring IoC 依赖注入（四）构造器或工厂注入 - binarylei - 博客园构造函数自动注入、简单初始化
        if (instanceWrapper == null) {
            instanceWrapper = createBeanInstance(beanName, mbd, args);
        }
```
_**AbstractAutowireCapableBeanFactory**_
```java
protected BeanWrapper createBeanInstance(String beanName, RootBeanDefinition mbd, @Nullable Object[] args) {
    // 1.1 确保此时beanClassName已经加载，当然注解驱动时不会设置beanClassName属性
    Class<?> beanClass = resolveBeanClass(mbd, beanName);
    // 1.2 校验beanClass允许访问
    if (beanClass != null && !Modifier.isPublic(beanClass.getModifiers()) && !mbd.isNonPublicAccessAllowed()) {
        throw new BeanCreationException();
    }

    // 2. Supplier创建对象
    Supplier<?> instanceSupplier = mbd.getInstanceSupplier();
    if (instanceSupplier != null) {
        return obtainFromSupplier(instanceSupplier, beanName);
    }

    // ========= 工厂方法实例化 =========
    // 3. 工厂方法实例化，包括实例化工厂和静态工厂
    if (mbd.getFactoryMethodName() != null) {
        return instantiateUsingFactoryMethod(beanName, mbd, args);
    }

    // ========= 构造器实例化 =========
    // 4. 快速实例化对象，所谓的快速实例化，实际上是说使用缓存
    boolean resolved = false;
    boolean autowireNecessary = false;
    // 4.1 args: 外部化参数，只能当无外部参数时才使用缓存。不推荐使用外部化参数
    if (args == null) {
        synchronized (mbd.constructorArgumentLock) {
            // 4.2 是否使用缓存，其中autowireNecessary表示是否使用有参构造器
            //     无参时肯定不会解析，为false。有参时会解析，为true
            if (mbd.resolvedConstructorOrFactoryMethod != null) {
                resolved = true;
                autowireNecessary = mbd.constructorArgumentsResolved;
            }
        }
    }
    // 4.3 使用缓存，其中autowireNecessary表示是否使用有参构造器
    if (resolved) {
        if (autowireNecessary) {
            // 4.4 有参构造器实例化
            return autowireConstructor(beanName, mbd, null, null);
        } else {
            // 4.5 无参构造器实例化
            return instantiateBean(beanName, mbd);
        }
    }

    // 5. 到此，只能老老实实的解析，当然解析后会将解析后的构造器或参数缓存起来
    // 5.1 是否指定了构造器，ibp#determineCandidateConstructors
    Constructor<?>[] ctors = determineConstructorsFromBeanPostProcessors(beanClass, beanName);
    // 5.2 构造器实例化
    if (ctors != null || mbd.getResolvedAutowireMode() == AUTOWIRE_CONSTRUCTOR ||
        mbd.hasConstructorArgumentValues() || !ObjectUtils.isEmpty(args)) {
        return autowireConstructor(beanName, mbd, ctors, args);
    }

    // 5.3 不用管，默认都是 null。
    ctors = mbd.getPreferredConstructors();
    if (ctors != null) {
        return autowireConstructor(beanName, mbd, ctors, null);
    }

    // 5.4 无参构造器实例化
    return instantiateBean(beanName, mbd);
}

```

- **说明：** createBeanInstance 方法在 bd.beanClass 校验后进行对象实例化，而 Supplier 实例化比较简单，工厂方法实例化又全部委托给了 instantiateUsingFactoryMethod 方法，基本上主要的功能就是，判断如何使用构造器实例化对象。
1. 判断能否使用缓存快速实例化对象。使用缓存实例化有两个条件：
   - 外部化参数为 null。Spring 中获取对象时，允许使用外部化参数 args 覆盖配置参数 bd.args。此时，缓存的构造器和参数全部失效。虽然 Spring 提供了外部化参数 args，但不推荐使用 getBean(beanName, args) 。
   - 缓存命中，也就是构造器和参数已经解析完成。如果无参，则不会解析参数，此时 bd.constructorArgumentsResolved=false，而有参则为 true。也就是可以使用该变量来判断是否使用有参构造器。
2. 判断使用有参还是无参构造器实例化对象。使用有参构造器实例化对象有以下条件：
   - 指定构造器。ibp#determineCandidateConstructors 后置处理器可以指定实例化的构造器 ctors。AutowiredAnnotationBeanPostProcessor 会指定实例化的构造器。
   - 指定注入模式为构造器自动注入模式。目前这种模式只能通过 XML 方式配置。<bean id="beanA" class="com.binarylei.spring.ioc.BeanA" autowire="constructor"/>。
   - 指定参数。包括配置参数 bd.constructorArgumentValues 或外部参数 args。
3. 有参实例调用 autowireConstructor 方法。而无参实例化调用 instantiateBean 方法。无参实例化 instantiateBean 方法比较简单

首先我们了解一下Spring创建Bean的方式：
Spring创建对象的主要方式有

- 通过自定义BeanPostProcessor，生成代理对象InstantiationAwareBeanPostProcessor

createBean() -> resolveBeforeInstantiation()

- 通过supplier创建对象

createBean() -> doCreateBean() -> createBeanInstance() -> obtainFromSupplier()

- 通过FactoryMethod创建对象

createBean() -> doCreateBean() -> createBeanInstance() -> instantiateUsingFactoryMethod()

- 通过反射创建对象

createBean() -> doCreateBean() -> createBeanInstance() -> instantiateBean()

- 通过FactoryBean创建对象

下面我们一一来看一看
### 2.3.1 Supplier创建对象
我们先来写一个案例，这种用法比较偏门
**_User_**
```java
package com.shu.supplier;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/8/31 14:11
 * @version: 1.0
 */
public class User {
    private String name;

    public User() {
        System.out.println("User 无参构造函数");
    }

    public User(String name) {
        this.name = name;
        System.out.println("User 有参构造函数");
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        System.out.println("User setName");
    }

    public void init() {
        System.out.println("User init");
    }

    public void destroy() {
        System.out.println("User destroy");
    }

    @Override
    public String toString() {
        return "User{" +
                "name='" + name + '\'' +
                '}';
    }
}

```
**_CreateSupplier_**
```java
package com.shu.supplier;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/8/31 14:11
 * @version: 1.0
 */
public class CreateSupplier {
    public static User createUser() {
        User xiaomi = new User("xiaomi");
        System.out.println("CreateSupplier createUser:"+xiaomi);
        return xiaomi;
    }
}

```
**_SupplierBeanFactoryPostProcessor_**
```java
package com.shu.supplier;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.support.GenericBeanDefinition;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/8/31 14:12
 * @version: 1.0
 */
public class SupplierBeanFactoryPostProcessor implements BeanFactoryPostProcessor {
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        BeanDefinition beanDefinition = beanFactory.getBeanDefinition("user");
        GenericBeanDefinition genericBeanDefinition = (GenericBeanDefinition) beanDefinition;
        genericBeanDefinition.setInstanceSupplier(CreateSupplier::createUser);
        genericBeanDefinition.setBeanClass(User.class);
    }
}
```
**_配置_**
```java
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="user" class="com.shu.supplier.User"></bean>
    <bean id="supplierBeanFactoryPostProcessor" class="com.shu.supplier.SupplierBeanFactoryPostProcessor"></bean>
</beans>
```
**_测试_**
```java

import com.shu.supplier.User;
import org.junit.Test;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.xml.XmlBeanFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.core.io.ClassPathResource;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/29 23:05
 * @version: 1.0
 */
public class AplTest {


    /**
     * 测试FactoryBean
     */
    @Test
    public void factoryBeanTestSupplier() {
        ApplicationContext applicationContext = new ClassPathXmlApplicationContext("supplier.xml");
        User user = applicationContext.getBean(User.class);
        System.out.println(user.getName());
    }

}


```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693463133444-fdd56f18-c372-4e3c-8bde-103d2086cb1c.png#averageHue=%2325272a&clientId=u1e993840-c3e6-4&from=paste&height=413&id=uebd7c8f5&originHeight=516&originWidth=1833&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=83399&status=done&style=none&taskId=u535eb3ed-eee9-4eb6-a7b1-79db3b88718&title=&width=1466.4)
下面我们来具体分析看看呗
**_AbstractAutowireCapableBeanFactory_**
```java
// 如果获取getInstanceSupplier不为空，参考：genericBeanDefinition.setInstanceSupplier(CreateSupplier::createUser);
Supplier<?> instanceSupplier = mbd.getInstanceSupplier();
		if (instanceSupplier != null) {
			return obtainFromSupplier(instanceSupplier, beanName);
}
```
下面进入obtainFromSupplier进行看看，那么回到这个方法中，主体就是调用get()这个方法获取实例
```java
protected BeanWrapper obtainFromSupplier(Supplier instanceSupplier, String beanName) {
    Object instance;

    // 获得原当前线程正在创建的 Bean 的名称
    String outerBean = this.currentlyCreatedBean.get();
    // 设置当前线程正在创建的 Bean 的名称
    this.currentlyCreatedBean.set(beanName);
    try {
        //调用 Supplier 的 get()，返回一个实例对象
        instance = instanceSupplier.get();
    }
    finally {
        if (outerBean != null) {
            // 设置原当前线程正在创建的 Bean 的名称到当前线程变量中
            this.currentlyCreatedBean.set(outerBean);
        }
        else {
            this.currentlyCreatedBean.remove();
        }
    }

    // 未创建 Bean 对象，则创建 NullBean 空对象
    if (instance == null) {
        instance = new NullBean();
    }
    //将实例对象封装成 BeanWrapper 对象
    BeanWrapper bw = new BeanWrapperImpl(instance);
    //初始化这个 BeanWrapper 对象
    initBeanWrapper(bw);
    return bw;
}

```
**_过程如下：_**
**_调用 Supplier 接口的 get()，返回 instance 实例对象_**
**_将 instance 封装成 BeanWrapper 对象 bw_**
**_对 bw 进行初始化，设置 ConversionService 类型转换器，并注册自定义的属性编辑器_**
然后再进行实例化
**_AbstractAutowireCapableBeanFactory_**
```java
final Object bean = instanceWrapper.getWrappedInstance();
Class<?> beanType = instanceWrapper.getWrappedClass();
if (beanType != NullBean.class) {
			mbd.resolvedTargetType = beanType;
}
```
### 2.3.2 工厂创建对象
知识回顾：
**静态工厂实例化**
在定义一个用静态工厂方法创建的Bean时，使用 class 属性来指定包含 static 工厂方法的类，并使用名为 factory-method 的属性来指定工厂方法本身的名称。你应该能够调用这个方法（有可选的参数，如后文所述）并返回一个活的对象，随后该对象被视为通过构造函数创建的。
```java
package com.shu.factory;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * @description: 静态工厂, 用于书写创建复杂对象的代码
 * @author: shu
 * @createDate: 2023/7/21 20:14
 * @version: 1.0
 */
public class StaticConnectionFactory {

    public static Connection getConnection(){
        Connection conn = null;
        try {
            Class.forName("com.mysql.jdbc.Driver");
            conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/auth?useSSL=false", "root", "123456");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return conn;
    }
}
```
```java
<bean id="db" class="com.shu.factory.StaticConnectionFactory" factory-method="getConnection"/>
```
```java
/**
     * 静态工厂实例化bean
     */
    @Test
    public void test8(){
        ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
        Object db = context.getBean("db");
        System.out.println("db = " + db);
    }
```
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693464928196-ae979a2d-3bea-41a7-a96a-8b45b1f8d849.png#averageHue=%23222327&clientId=u1e993840-c3e6-4&from=paste&id=u1ce2a0a3&originHeight=442&originWidth=1799&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u1fc9f2c2-1b86-4341-b508-4e5af4e8cfb&title=)
**实例工厂方法进行实例化**
与 通过静态工厂方法进行的实例化 类似，用实例工厂方法进行的实例化从容器中调用现有 bean 的非静态方法来创建一个新的 bean。要使用这种机制，请将 class 属性留空，并在 factory-bean 属性中指定当前（或父代或祖代）容器中的一个 Bean 的名称，该容器包含要被调用来创建对象的实例方法。用 factory-method 属性设置工厂方法本身的名称。
```java
package com.shu.factory;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConnectionFactory {

    public Connection getConnection(){
        Connection conn = null;
        try {
            Class.forName("com.mysql.jdbc.Driver");
            conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/auth?useSSL=false", "root", "123456");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return conn;
    }
}

```
```java
<bean id="connFactory" class="com.shu.factory.ConnectionFactory"></bean>
    <bean id="conn"  factory-bean="connFactory" factory-method="getConnection"/>
```
```java
@Test
    public void test10() throws Exception {
        ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
        Object conn = context.getBean("conn");
        System.out.println("conn = " + conn);

    }

```
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693465046206-77d20d34-064e-410a-8564-1072ff3309d0.png#averageHue=%23222427&clientId=u1e993840-c3e6-4&from=paste&id=u1a1437a5&originHeight=563&originWidth=1784&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ud26b8c0f-eb2a-44f2-92c7-a0ae31aae88&title=)
让我们回到代码部分
**_AbstractAutowireCapableBeanFactory_**
```java
	//如果配置了 `factory-method` 工厂方法，则调用该方法来创建一个实例对象
    // 通过 @Bean 标注的方法会通过这里进行创建
    if (mbd.getFactoryMethodName() != null) {
        // 这个过程非常复杂，你可以理解为：
        // 找到最匹配的 Method 工厂方法，获取相关参数（依赖注入），然后通过调用该方法返回一个实例对象（反射机制）
        return instantiateUsingFactoryMethod(beanName, mbd, args);
    }

```
通过 factoryMethodName 工厂方法创建一个实例对象，例如 XML 配置的 factory-method 属性或者 @Bean 标注的方法都会解析成 factoryMethodName 属性
这个过程非常复杂，你可以理解为去找到最匹配的 Method 工厂方法，获取相关入参（依赖注入），然后调用该方法返回一个实例对象（反射机制）
**_AbstractAutowireCapableBeanFactory_**
```java
protected BeanWrapper instantiateUsingFactoryMethod(
        String beanName, RootBeanDefinition mbd, @Nullable Object[] explicitArgs) {
    return new ConstructorResolver(this).instantiateUsingFactoryMethod(beanName, mbd, explicitArgs);
}
```
创建 ConstructorResolver 对象，然后调用其 instantiateUsingFactoryMethod(...) 方法，如下：
```java
// ConstructorResolver.java
public BeanWrapper instantiateUsingFactoryMethod(
        String beanName, RootBeanDefinition mbd, @Nullable Object[] explicitArgs) {

    // 构造 BeanWrapperImpl 对象
    BeanWrapperImpl bw = new BeanWrapperImpl();
    // 初始化 BeanWrapperImpl，设置 ConversionService 类型转换器，并注册自定义的属性编辑器
    this.beanFactory.initBeanWrapper(bw);

    // -------------------------获取工厂方法的相关信息-------------------------
    //获取工厂方法的相关信息

    // 工厂方法所在类对应的 Bean（静态方法不会有）
    Object factoryBean;
    // 工厂方法所在类的 Class 对象
    Class factoryClass;
    // 是否为 static 修饰的静态方法
    boolean isStatic;

    // 获取工厂方法所在类对应的 Bean 的名称（静态方法不会有）
    String factoryBeanName = mbd.getFactoryBeanName();
    //非静态方法
    if (factoryBeanName != null) {
        if (factoryBeanName.equals(beanName)) {
            throw new BeanDefinitionStoreException(mbd.getResourceDescription(), beanName,
                    "factory-bean reference points back to the same bean definition");
        }
        // 获取工厂方法所在类对应的 Bean，不然无法调用工厂方法
        factoryBean = this.beanFactory.getBean(factoryBeanName);
        // 如果是单例模式，已经存在对应的 Bean，则抛出重复创建的异常
        if (mbd.isSingleton() && this.beanFactory.containsSingleton(beanName)) {
            throw new ImplicitlyAppearedSingletonException();
        }
        factoryClass = factoryBean.getClass();
        isStatic = false;
    }
    //静态方法
    else {
        // It's a static factory method on the bean class.
        // 静态方法没有找到对应的 Class 对象无法被调用，则抛出异常
        if (!mbd.hasBeanClass()) {
            throw new BeanDefinitionStoreException(mbd.getResourceDescription(), beanName,
                    "bean definition declares neither a bean class nor a factory-bean reference");
        }
        factoryBean = null;
        factoryClass = mbd.getBeanClass();
        isStatic = true;
    }

    // -------------------------尝试获取工厂方法对象和入参-------------------------
    //尝试获取工厂方法对象和参数

    // 工厂方法对象
    Method factoryMethodToUse = null;
    ArgumentsHolder argsHolderToUse = null;
    // 方法参数
    Object[] argsToUse = null;

    //如果方法入参指定了参数，则直接使用
    if (explicitArgs != null) {
        argsToUse = explicitArgs;
    }
    //否则，尝试从 RootBeanDefinition 中获取已解析出来的工厂方法和入参
    else {
        Object[] argsToResolve = null;
        // 因为可能前面解析了，会临时缓存，避免再次解析
        synchronized (mbd.constructorArgumentLock) { // 加锁
            factoryMethodToUse = (Method) mbd.resolvedConstructorOrFactoryMethod;
            // 如果工厂方法被解析了，那么参数也可能解析过
            if (factoryMethodToUse != null && mbd.constructorArgumentsResolved) {
                // Found a cached factory method...
                argsToUse = mbd.resolvedConstructorArguments;
                if (argsToUse == null) {
                    // 没有解析过的参数，则尝试从 RootBeanDefinition 中获取未被解析过的参数
                    argsToResolve = mbd.preparedConstructorArguments;
                }
            }
        }
        // 如果获取到了未被解析过的入参，则进行解析
        if (argsToResolve != null) {
            // 处理参数值，类型转换，例如给定方法 A(int, int)，配置了 A("1"、"2") 两个参数，则会转换为 A(1, 1)
            argsToUse = resolvePreparedArguments(beanName, mbd, bw, factoryMethodToUse, argsToResolve, true);
        }
    }

    // -------------------------找到所有匹配的工厂方法-------------------------
    //如果上一步没有找到工厂方法对象或方法入参集合，则需要进行接下来的解析过程，首先找到所有匹配的工厂方法

    if (factoryMethodToUse == null || argsToUse == null) {
        // Need to determine the factory method...
        // Try all methods with this name to see if they match the given arguments.
        //获取工厂方法所在的类的实例 Class 对象，因为可能是 Cglib 提升过的子类
        factoryClass = ClassUtils.getUserClass(factoryClass);

        //获取工厂方法所在的类中所有方法对象
        Method[] rawCandidates = getCandidateMethods(factoryClass, mbd);
        //找到这个类中匹配的工厂方法
        ListcandidateList = new ArrayList<>();
        for (Method candidate : rawCandidates) {
            if (Modifier.isStatic(candidate.getModifiers()) == isStatic // 是否和 `isStatic` 匹配
                    && mbd.isFactoryMethod(candidate)) { // 和定义的工厂方法的名称是否相等
                candidateList.add(candidate);
            }
        }

        //如果只有一个匹配的方法，且这个方法没有给指定的入参，且本身也没有定义参数，且这个方法没有定义入参
        // 则直接调用这个方法创建一个实例对象（反射机制），并返回
        if (candidateList.size() == 1 && explicitArgs == null && !mbd.hasConstructorArgumentValues()) {
            Method uniqueCandidate = candidateList.get(0);
            if (uniqueCandidate.getParameterCount() == 0) {
                mbd.factoryMethodToIntrospect = uniqueCandidate;
                synchronized (mbd.constructorArgumentLock) {
                    mbd.resolvedConstructorOrFactoryMethod = uniqueCandidate;
                    mbd.constructorArgumentsResolved = true;
                    mbd.resolvedConstructorArguments = EMPTY_ARGS;
                }
                bw.setBeanInstance(instantiate(beanName, mbd, factoryBean, uniqueCandidate, EMPTY_ARGS));
                return bw;
            }
        }

        // -------------------------开始找最匹配的工厂方法-------------------------
        //开始找最匹配的工厂方法

        // 将匹配的工厂方法转换成数组
        Method[] candidates = candidateList.toArray(new Method[0]);
        // 将匹配的方法进行排序，public 方法优先，入参个数多的优先
        AutowireUtils.sortFactoryMethods(candidates);

        // 用于承载解析后的方法参数值
        ConstructorArgumentValues resolvedValues = null;
        // 是否是构造器注入
        boolean autowiring = (mbd.getResolvedAutowireMode() == AutowireCapableBeanFactory.AUTOWIRE_CONSTRUCTOR);
        int minTypeDiffWeight = Integer.MAX_VALUE;
        // 匹配方法的集合
        SetambiguousFactoryMethods = null;

        // -------------------------确定方法参数的入参数量-------------------------
        //确定方法参数的入参数量，匹配的方法的入参数量要多余它
        // 方法的参数数量的最小值
        int minNrOfArgs;
        //如果当前方法指定了入参，则使用其个数作为最小值
        if (explicitArgs != null) {
            minNrOfArgs = explicitArgs.length;
        }
        //否则，从 RootBeanDefinition 解析出方法的参数个数作为最小值
        else {
            // We don't have arguments passed in programmatically, so we need to resolve the
            // arguments specified in the constructor arguments held in the bean definition.
            // RootBeanDefinition 定义了参数值
            if (mbd.hasConstructorArgumentValues()) {
                // 方法的参数
                ConstructorArgumentValues cargs = mbd.getConstructorArgumentValues();
                resolvedValues = new ConstructorArgumentValues();
                // 解析定义的参数值，放入 `resolvedValues` 中，并返回参数个数
                minNrOfArgs = resolveConstructorArguments(beanName, mbd, bw, cargs, resolvedValues);
            }
            else {
                minNrOfArgs = 0;
            }
        }

        // 记录 UnsatisfiedDependencyException 异常的集合
        LinkedListcauses = null;

        // 遍历匹配的方法
        for (Method candidate : candidates) {
            // 方法体的参数
            Class[] paramTypes = candidate.getParameterTypes();

            if (paramTypes.length >= minNrOfArgs) {
                // -------------------------解析出工厂方法的入参-------------------------
                //解析出工厂方法的入参

                // 保存参数的对象
                ArgumentsHolder argsHolder;

                //如果当前方法指定了入参，则直接使用
                if (explicitArgs != null) {
                    // Explicit arguments given -> arguments length must match exactly.
                    // 显示给定参数，参数长度必须完全匹配
                    if (paramTypes.length != explicitArgs.length) {
                        continue;
                    }
                    // 根据参数创建参数持有者 ArgumentsHolder 对象
                    argsHolder = new ArgumentsHolder(explicitArgs);
                }
                //否则，通过**依赖注入**获取入参
                else {
                    // Resolved constructor arguments: type conversion and/or autowiring necessary.
                    // 为提供参数，解析构造参数
                    try {
                        String[] paramNames = null;
                        // 获取 ParameterNameDiscoverer 参数名称探测器
                        ParameterNameDiscoverer pnd = this.beanFactory.getParameterNameDiscoverer();
                        // 获取方法的参数名称
                        if (pnd != null) {
                            paramNames = pnd.getParameterNames(candidate);
                        }
                        // 解析出方法的入参，参数值会被依赖注入
                        argsHolder = createArgumentArray(beanName, mbd, resolvedValues, bw,
                                paramTypes, paramNames, candidate, autowiring, candidates.length == 1);
                    }
                    catch (UnsatisfiedDependencyException ex) {
                        // 若发生 UnsatisfiedDependencyException 异常，添加到 causes 中。
                        if (logger.isTraceEnabled()) {
                            logger.trace("Ignoring factory method [" + candidate + "] of bean '" + beanName + "': " + ex);
                        }
                        // Swallow and try next overloaded factory method.
                        if (causes == null) {
                            causes = new LinkedList<>();
                        }
                        causes.add(ex);
                        continue;
                    }
                }

                // -------------------------根据权重获取最匹配的方法-------------------------
                //因为会遍历所有匹配的方法，所以需要进行权重的判断，拿到最优先的那个

                // 判断解析构造函数的时候是否以宽松模式还是严格模式，默认为 true
                // 严格模式：解析构造函数时，必须所有的都需要匹配，否则抛出异常
                // 宽松模式：使用具有"最接近的模式"进行匹配
                // typeDiffWeight：类型差异权重
                int typeDiffWeight = (mbd.isLenientConstructorResolution() ?
                        argsHolder.getTypeDifferenceWeight(paramTypes) : argsHolder.getAssignabilityWeight(paramTypes));
                // Choose this factory method if it represents the closest match.
                // 代表最匹配的结果，则选择作为符合条件的方法
                if (typeDiffWeight < minTypeDiffWeight) {
                    factoryMethodToUse = candidate;
                    argsHolderToUse = argsHolder;
                    argsToUse = argsHolder.arguments;
                    minTypeDiffWeight = typeDiffWeight;
                    ambiguousFactoryMethods = null;
                }
                // Find out about ambiguity: In case of the same type difference weight
                // for methods with the same number of parameters, collect such candidates
                // and eventually raise an ambiguity exception.
                // However, only perform that check in non-lenient constructor resolution mode,
                // and explicitly ignore overridden methods (with the same parameter signature).
                // 如果具有相同参数数量的方法具有相同的类型差异权重，则收集此类型选项
                // 但是，仅在非宽松构造函数解析模式下执行该检查，并显式忽略重写方法（具有相同的参数签名）
                else if (factoryMethodToUse != null && typeDiffWeight == minTypeDiffWeight &&
                        !mbd.isLenientConstructorResolution() &&
                        paramTypes.length == factoryMethodToUse.getParameterCount() &&
                        !Arrays.equals(paramTypes, factoryMethodToUse.getParameterTypes())) {
                    // 查找到多个可匹配的方法
                    if (ambiguousFactoryMethods == null) {
                        ambiguousFactoryMethods = new LinkedHashSet<>();
                        ambiguousFactoryMethods.add(factoryMethodToUse);
                    }
                    ambiguousFactoryMethods.add(candidate);
                }
            }
        }

        //没有找到对应的工厂方法，则抛出异常
        if (factoryMethodToUse == null) {
            if (causes != null) {
                UnsatisfiedDependencyException ex = causes.removeLast();
                for (Exception cause : causes) {
                    this.beanFactory.onSuppressedException(cause);
                }
                throw ex;
            }
            ListargTypes = new ArrayList<>(minNrOfArgs);
            if (explicitArgs != null) {
                for (Object arg : explicitArgs) {
                    argTypes.add(arg != null ? arg.getClass().getSimpleName() : "null");
                }
            }
            else if (resolvedValues != null) {
                SetvalueHolders = new LinkedHashSet<>(resolvedValues.getArgumentCount());
                valueHolders.addAll(resolvedValues.getIndexedArgumentValues().values());
                valueHolders.addAll(resolvedValues.getGenericArgumentValues());
                for (ValueHolder value : valueHolders) {
                    String argType = (value.getType() != null ? ClassUtils.getShortName(value.getType()) :
                            (value.getValue() != null ? value.getValue().getClass().getSimpleName() : "null"));
                    argTypes.add(argType);
                }
            }
            String argDesc = StringUtils.collectionToCommaDelimitedString(argTypes);
            throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                    "No matching factory method found: " +
                    (mbd.getFactoryBeanName() != null ?
                        "factory bean '" + mbd.getFactoryBeanName() + "'; " : "") +
                    "factory method '" + mbd.getFactoryMethodName() + "(" + argDesc + ")'. " +
                    "Check that a method with the specified name " +
                    (minNrOfArgs > 0 ? "and arguments " : "") +
                    "exists and that it is " +
                    (isStatic ? "static" : "non-static") + ".");
        }
        else if (void.class == factoryMethodToUse.getReturnType()) {
            throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                    "Invalid factory method '" + mbd.getFactoryMethodName() +
                    "': needs to have a non-void return type!");
        }
        else if (ambiguousFactoryMethods != null) {
            throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                    "Ambiguous factory method matches found in bean '" + beanName + "' " +
                    "(hint: specify index/type/name arguments for simple parameters to avoid type ambiguities): " +
                    ambiguousFactoryMethods);
        }

        //将解析出来的工厂方法和入参缓存，设置到 RootBeanDefinition 中，因为整个过程比较复杂，避免再次解析
        if (explicitArgs == null && argsHolderToUse != null) {
            mbd.factoryMethodToIntrospect = factoryMethodToUse;
            argsHolderToUse.storeCache(mbd, factoryMethodToUse);
        }
    }

    Assert.state(argsToUse != null, "Unresolved factory method arguments");
     //调用工厂方法创建一个实例对象（反射机制），并设置到 `bw` 中
    bw.setBeanInstance(instantiate(beanName, mbd, factoryBean, factoryMethodToUse, argsToUse));
    return bw;
}
```

- 先创建一个 BeanWrapperImpl 对象 bw，并初始化，设置 ConversionService 类型转换器，并注册自定义的属性编辑器
```java
	// 构造 BeanWrapperImpl 对象
    BeanWrapperImpl bw = new BeanWrapperImpl();
    // 初始化 BeanWrapperImpl，设置 ConversionService 类型转换器，并注册自定义的属性编辑器
    this.beanFactory.initBeanWrapper(bw);
```

- 获取工厂方法的相关信息，根据 RootBeanDefinition 的 factoryBeanName 属性判断是否为静态方法，这个属性表示这个工厂方法所在类对应 Bean 的名称，当然静态方法“不属于”这个 Bean，所以它的这个属性为空
- factoryBeanName 属性不为空，表示不是静态方法，则需要根据 factoryBeanName  找到（依赖查找）对应的 Bean，作为 factoryBean
- 否则，就是静态方法，获取所在类的 Class 对象即可
```java
// 获取工厂方法所在类对应的 Bean 的名称（静态方法不会有）
    String factoryBeanName = mbd.getFactoryBeanName();
    //非静态方法
    if (factoryBeanName != null) {
        if (factoryBeanName.equals(beanName)) {
            throw new BeanDefinitionStoreException(mbd.getResourceDescription(), beanName,
                    "factory-bean reference points back to the same bean definition");
        }
        // 获取工厂方法所在类对应的 Bean，不然无法调用工厂方法
        factoryBean = this.beanFactory.getBean(factoryBeanName);
        // 如果是单例模式，已经存在对应的 Bean，则抛出重复创建的异常
        if (mbd.isSingleton() && this.beanFactory.containsSingleton(beanName)) {
            throw new ImplicitlyAppearedSingletonException();
        }
        factoryClass = factoryBean.getClass();
        isStatic = false;
    }
    //静态方法
    else {
        // It's a static factory method on the bean class.
        // 静态方法没有找到对应的 Class 对象无法被调用，则抛出异常
        if (!mbd.hasBeanClass()) {
            throw new BeanDefinitionStoreException(mbd.getResourceDescription(), beanName,
                    "bean definition declares neither a bean class nor a factory-bean reference");
        }
        factoryBean = null;
        factoryClass = mbd.getBeanClass();
        isStatic = true;
    }
```
:::warning
这一步找到了三个对象：factoryBean（工厂方法所在类对应的 Bean，静态方法不会有）、factoryClass（工厂方法所在类的 Class 对象）、isStatic（是否为静态方法）。所以想要通过工厂方法获取一个 Bean，则需要方法所在类对应的 Bean 先初始化，然后才能调用这个方法创建 Bean；而静态方法就不用，因为它可以根据所在类的 Class 对象就能调用这个方法创建 Bean，这就是两者的区别。
:::

- 尝试获取工厂方法 Method 对象和入参
- 如果方法入参指定了参数，则直接使用
- 否则，尝试从 RootBeanDefinition 中获取已解析出来的工厂方法和入参，如果获取到了未被解析过的入参，则进行解析（类型转换）
- 例如给定方法 A(int, int)，配置了 A("1"、"2") 两个参数，则会转换为 A(1, 1)，这一步尝试获取两个对象：factoryMethodToUse（对应的工厂方法 Method）、argsToUse（工厂方法的入参集合）
```java
//如果方法入参指定了参数，则直接使用
    if (explicitArgs != null) {
        argsToUse = explicitArgs;
    }
    //否则，尝试从 RootBeanDefinition 中获取已解析出来的工厂方法和入参
    else {
        Object[] argsToResolve = null;
        // 因为可能前面解析了，会临时缓存，避免再次解析
        synchronized (mbd.constructorArgumentLock) { // 加锁
            factoryMethodToUse = (Method) mbd.resolvedConstructorOrFactoryMethod;
            // 如果工厂方法被解析了，那么参数也可能解析过
            if (factoryMethodToUse != null && mbd.constructorArgumentsResolved) {
                // Found a cached factory method...
                argsToUse = mbd.resolvedConstructorArguments;
                if (argsToUse == null) {
                    // 没有解析过的参数，则尝试从 RootBeanDefinition 中获取未被解析过的参数
                    argsToResolve = mbd.preparedConstructorArguments;
                }
            }
        }
        // 如果获取到了未被解析过的入参，则进行解析
        if (argsToResolve != null) {
            // 处理参数值，类型转换，例如给定方法 A(int, int)，配置了 A("1"、"2") 两个参数，则会转换为 A(1, 1)
            argsToUse = resolvePreparedArguments(beanName, mbd, bw, factoryMethodToUse, argsToResolve, true);
        }
    }
```
:::warning
这一步尝试获取两个对象：factoryMethodToUse（对应的工厂方法 Method）、argsToUse（工厂方法的入参集合）
:::

- 如果上一步没有找到工厂方法对象或方法入参集合，找到所有匹配的工厂方法，首先找到所有匹配的工厂方法
- 获取工厂方法所在的类的实例 Class 对象，因为可能是 Cglib 提升过的子类
- 获取工厂方法所在的类中所有方法对象
- 找到这个类中匹配的工厂方法，是否和 isStatic 匹配，并且和定义的工厂方法的名称是否相等
- 如果只有一个匹配的方法，且这个方法没有给指定的入参，且本身也没有定义参数，且这个方法没有定义入参，则直接调用这个方法创建一个实例对象（反射机制），并返回
```java
  // -------------------------找到所有匹配的工厂方法-------------------------
    //如果上一步没有找到工厂方法对象或方法入参集合，则需要进行接下来的解析过程，首先找到所有匹配的工厂方法

    if (factoryMethodToUse == null || argsToUse == null) {
        // Need to determine the factory method...
        // Try all methods with this name to see if they match the given arguments.
        //获取工厂方法所在的类的实例 Class 对象，因为可能是 Cglib 提升过的子类
        factoryClass = ClassUtils.getUserClass(factoryClass);

        //获取工厂方法所在的类中所有方法对象
        Method[] rawCandidates = getCandidateMethods(factoryClass, mbd);
        //找到这个类中匹配的工厂方法
        ListcandidateList = new ArrayList<>();
        for (Method candidate : rawCandidates) {
            if (Modifier.isStatic(candidate.getModifiers()) == isStatic // 是否和 `isStatic` 匹配
                    && mbd.isFactoryMethod(candidate)) { // 和定义的工厂方法的名称是否相等
                candidateList.add(candidate);
            }
        }

        //如果只有一个匹配的方法，且这个方法没有给指定的入参，且本身也没有定义参数，且这个方法没有定义入参
        // 则直接调用这个方法创建一个实例对象（反射机制），并返回
        if (candidateList.size() == 1 && explicitArgs == null && !mbd.hasConstructorArgumentValues()) {
            Method uniqueCandidate = candidateList.get(0);
            if (uniqueCandidate.getParameterCount() == 0) {
                mbd.factoryMethodToIntrospect = uniqueCandidate;
                synchronized (mbd.constructorArgumentLock) {
                    mbd.resolvedConstructorOrFactoryMethod = uniqueCandidate;
                    mbd.constructorArgumentsResolved = true;
                    mbd.resolvedConstructorArguments = EMPTY_ARGS;
                }
                bw.setBeanInstance(instantiate(beanName, mbd, factoryBean, uniqueCandidate, EMPTY_ARGS));
                return bw;
            }
        }
```

- 开始找最匹配的工厂方法，先排序，public 方法优先，入参个数多的优先
- 确定方法参数的入参数量，匹配的方法的入参数量要多余它
- 如果当前方法指定了入参，则使用其个数作为最小值
- 否则，从 RootBeanDefinition 解析出方法的参数个数作为最小值，没有定义则设置为 0
- 这一步主要是确定入参的个数，并排序所有匹配的方法，接下来会遍历所有匹配的方法
```java
   // -------------------------开始找最匹配的工厂方法-------------------------
        //开始找最匹配的工厂方法

        // 将匹配的工厂方法转换成数组
        Method[] candidates = candidateList.toArray(new Method[0]);
        // 将匹配的方法进行排序，public 方法优先，入参个数多的优先
        AutowireUtils.sortFactoryMethods(candidates);

        // 用于承载解析后的方法参数值
        ConstructorArgumentValues resolvedValues = null;
        // 是否是构造器注入
        boolean autowiring = (mbd.getResolvedAutowireMode() == AutowireCapableBeanFactory.AUTOWIRE_CONSTRUCTOR);
        int minTypeDiffWeight = Integer.MAX_VALUE;
        // 匹配方法的集合
        SetambiguousFactoryMethods = null;

        // -------------------------确定方法参数的入参数量-------------------------
        //确定方法参数的入参数量，匹配的方法的入参数量要多余它
        // 方法的参数数量的最小值
        int minNrOfArgs;
        //如果当前方法指定了入参，则使用其个数作为最小值
        if (explicitArgs != null) {
            minNrOfArgs = explicitArgs.length;
        }
        //否则，从 RootBeanDefinition 解析出方法的参数个数作为最小值
        else {
            // We don't have arguments passed in programmatically, so we need to resolve the
            // arguments specified in the constructor arguments held in the bean definition.
            // RootBeanDefinition 定义了参数值
            if (mbd.hasConstructorArgumentValues()) {
                // 方法的参数
                ConstructorArgumentValues cargs = mbd.getConstructorArgumentValues();
                resolvedValues = new ConstructorArgumentValues();
                // 解析定义的参数值，放入 `resolvedValues` 中，并返回参数个数
                minNrOfArgs = resolveConstructorArguments(beanName, mbd, bw, cargs, resolvedValues);
            }
            else {
                minNrOfArgs = 0;
            }
        }

        // 记录 UnsatisfiedDependencyException 异常的集合
        LinkedListcauses = null;
```
:::warning
这一步会找到这个方法的入参，依赖注入的方式
:::

- 因为会遍历所有匹配的方法，所以需要进行权重的判断，拿到最优先的那个
- 通常情况下，我们只有一个匹配的方法，如果存在多个，会根据方法的参数类型进行权重
```java
// -------------------------根据权重获取最匹配的方法-------------------------
                //因为会遍历所有匹配的方法，所以需要进行权重的判断，拿到最优先的那个

                // 判断解析构造函数的时候是否以宽松模式还是严格模式，默认为 true
                // 严格模式：解析构造函数时，必须所有的都需要匹配，否则抛出异常
                // 宽松模式：使用具有"最接近的模式"进行匹配
                // typeDiffWeight：类型差异权重
                int typeDiffWeight = (mbd.isLenientConstructorResolution() ?
                        argsHolder.getTypeDifferenceWeight(paramTypes) : argsHolder.getAssignabilityWeight(paramTypes));
                // Choose this factory method if it represents the closest match.
                // 代表最匹配的结果，则选择作为符合条件的方法
                if (typeDiffWeight < minTypeDiffWeight) {
                    factoryMethodToUse = candidate;
                    argsHolderToUse = argsHolder;
                    argsToUse = argsHolder.arguments;
                    minTypeDiffWeight = typeDiffWeight;
                    ambiguousFactoryMethods = null;
                }
                // Find out about ambiguity: In case of the same type difference weight
                // for methods with the same number of parameters, collect such candidates
                // and eventually raise an ambiguity exception.
                // However, only perform that check in non-lenient constructor resolution mode,
                // and explicitly ignore overridden methods (with the same parameter signature).
                // 如果具有相同参数数量的方法具有相同的类型差异权重，则收集此类型选项
                // 但是，仅在非宽松构造函数解析模式下执行该检查，并显式忽略重写方法（具有相同的参数签名）
                else if (factoryMethodToUse != null && typeDiffWeight == minTypeDiffWeight &&
                        !mbd.isLenientConstructorResolution() &&
                        paramTypes.length == factoryMethodToUse.getParameterCount() &&
                        !Arrays.equals(paramTypes, factoryMethodToUse.getParameterTypes())) {
                    // 查找到多个可匹配的方法
                    if (ambiguousFactoryMethods == null) {
                        ambiguousFactoryMethods = new LinkedHashSet<>();
                        ambiguousFactoryMethods.add(factoryMethodToUse);
                    }
                    ambiguousFactoryMethods.add(candidate);
                }
            }
        }
```

- 没有找到对应的工厂方法，则抛出异常
- 将解析出来的工厂方法和入参缓存，设置到 RootBeanDefinition 中，因为整个过程比较复杂，避免再次解析

会缓存这几个数据：resolvedConstructorOrFactoryMethod（已经解析出来的工厂方法）、constructorArgumentsResolved（方法入参已经解析出来了 true）、resolvedConstructorArguments（解析出来的入参）
```java
//没有找到对应的工厂方法，则抛出异常
        if (factoryMethodToUse == null) {
            if (causes != null) {
                UnsatisfiedDependencyException ex = causes.removeLast();
                for (Exception cause : causes) {
                    this.beanFactory.onSuppressedException(cause);
                }
                throw ex;
            }
            ListargTypes = new ArrayList<>(minNrOfArgs);
            if (explicitArgs != null) {
                for (Object arg : explicitArgs) {
                    argTypes.add(arg != null ? arg.getClass().getSimpleName() : "null");
                }
            }
            else if (resolvedValues != null) {
                SetvalueHolders = new LinkedHashSet<>(resolvedValues.getArgumentCount());
                valueHolders.addAll(resolvedValues.getIndexedArgumentValues().values());
                valueHolders.addAll(resolvedValues.getGenericArgumentValues());
                for (ValueHolder value : valueHolders) {
                    String argType = (value.getType() != null ? ClassUtils.getShortName(value.getType()) :
                            (value.getValue() != null ? value.getValue().getClass().getSimpleName() : "null"));
                    argTypes.add(argType);
                }
            }
            String argDesc = StringUtils.collectionToCommaDelimitedString(argTypes);
            throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                    "No matching factory method found: " +
                    (mbd.getFactoryBeanName() != null ?
                        "factory bean '" + mbd.getFactoryBeanName() + "'; " : "") +
                    "factory method '" + mbd.getFactoryMethodName() + "(" + argDesc + ")'. " +
                    "Check that a method with the specified name " +
                    (minNrOfArgs > 0 ? "and arguments " : "") +
                    "exists and that it is " +
                    (isStatic ? "static" : "non-static") + ".");
        }
        else if (void.class == factoryMethodToUse.getReturnType()) {
            throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                    "Invalid factory method '" + mbd.getFactoryMethodName() +
                    "': needs to have a non-void return type!");
        }
        else if (ambiguousFactoryMethods != null) {
            throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                    "Ambiguous factory method matches found in bean '" + beanName + "' " +
                    "(hint: specify index/type/name arguments for simple parameters to avoid type ambiguities): " +
                    ambiguousFactoryMethods);
        }

        //将解析出来的工厂方法和入参缓存，设置到 RootBeanDefinition 中，因为整个过程比较复杂，避免再次解析
        if (explicitArgs == null && argsHolderToUse != null) {
            mbd.factoryMethodToIntrospect = factoryMethodToUse;
            argsHolderToUse.storeCache(mbd, factoryMethodToUse);
        }
    }
```

- 调用工厂方法创建一个实例对象（反射机制），并设置到 bw 中
```java
  Assert.state(argsToUse != null, "Unresolved factory method arguments");
     //调用工厂方法创建一个实例对象（反射机制），并设置到 `bw` 中
    bw.setBeanInstance(instantiate(beanName, mbd, factoryBean, factoryMethodToUse, argsToUse));
    return bw;
```
**_上面整个过程非常复杂，这里进行简单概括：_**

- **_找到对应的工厂方法，如果是非静态方法，则需要先依赖查找到所在类对应的 Bean，因为需要根据这个 Bean 去调用对应的工厂方法，而静态方法不用，可以根据其 Class 对象调用对应的工厂方法_**
- **_如果工厂方法有入参，则需要注入相关对象（依赖注入）_**
- **_调用这个方法（反射机制），返回一个实例对象_**
### 2.3.3 构造器创建实例
当你用构造函数的方法创建一个Bean时，所有普通的类都可以被Spring使用并与之兼容。也就是说，被开发的类不需要实现任何特定的接口，也不需要以特定的方式进行编码。只需指定Bean类就足够了。然而，根据你对该特定Bean使用的IoC类型，你可能需要一个默认（空）构造函数。
#### 无参构造
```java
package com.shu.pojo;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/20 23:34
 * @version: 1.0
 */
public class User {
    private String name;

    public User() {
        System.out.println("User的无参构造");
    }

    public User(String name) {
        this.name = name;
        System.out.println("User的有参构造");
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        System.out.println("User的setName方法");
    }

    public void show() {
        System.out.println("name=" + name);
    }
}

```
```java
<!-- 无参构造   -->
    <bean id="user" class="com.shu.pojo.User"/>

```
```java
/**
     * 构造函数实例化bean
     */
    @Test
    public void test6(){
        ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
        User user = (User) context.getBean("user");
        user.show();
    }

```
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693467953332-09faa5c2-9b83-4e91-b4a4-064cae784fcd.png#averageHue=%23212326&clientId=u1e993840-c3e6-4&from=paste&id=u169eed14&originHeight=509&originWidth=1862&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u8e57f924-6518-421c-baae-bc12bd8f62e&title=)
**有参构造**
介绍有参构造之前我们需要了解依赖注入的概念？

- 依赖注入（DI）是一个过程，对象仅通过构造参数、工厂方法的参数或在对象实例被构造或从工厂方法返回后在其上设置的属性来定义它们的依赖（即与它们一起工作的其它对象）。然后，容器在创建 bean 时注入这些依赖。这个过程从根本上说是Bean本身通过使用类的直接构造或服务定位模式来控制其依赖的实例化或位置的逆过程（因此被称为控制反转）。
- 采用DI原则，代码会更干净，当对象被提供其依赖时，解耦会更有效。对象不会查找其依赖，也不知道依赖的位置或类别。因此，你的类变得更容易测试，特别是当依赖是在接口或抽象基类上时，这允许在单元测试中使用stub或mock实现。DI有两个主要的变体，基于构造器的依赖注入 和 基于setter的依赖注入。
#### 构造器依赖注入
基于构造函数的 DI 是通过容器调用带有许多参数的构造函数来完成的，每个参数代表一个依赖。
```java
<!-- 有参构造   -->
    <bean id="user2" class="com.shu.pojo.User">
        <constructor-arg name="name" value="shu"/>
    </bean>

```
```java
package com.shu.pojo;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/20 23:34
 * @version: 1.0
 */
public class User {
    private String name;

    public User() {
        System.out.println("User的无参构造");
    }

    public User(String name) {
        this.name = name;
        System.out.println("User的有参构造");
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        System.out.println("User的setName方法");
    }

    public void show() {
        System.out.println("name=" + name);
    }
}

```
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693468108244-54ca7ffb-e2cf-4c5e-9f5f-5635f1cb08bd.png#averageHue=%23212327&clientId=u1e993840-c3e6-4&from=paste&id=u1e0012b0&originHeight=384&originWidth=1794&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u01fec15a-2cf4-4259-823b-cbcc1e52c83&title=)
#### Setter的依赖注入
基于 Setter 的 DI 是通过容器在调用无参数的构造函数或无参数的 static 工厂方法来实例化你的 bean 之后调用 Setter 方法来实现的。简单来说就是调用了你的set发放，完成赋值，这也决定我们需要编写Set方法的实现，当然这也是我们Spring中常用的实例化
```java
<bean id="user" class="com.shu.pojo.User">
        <property name="name" value="shu"/>
    </bean>

```
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693468168165-c1c5f420-d1ab-424a-ac11-5dc0dde614e5.png#averageHue=%23222428&clientId=u1e993840-c3e6-4&from=paste&id=ub25abbe5&originHeight=458&originWidth=1832&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ud44ead0a-2ee7-4d5a-ba8a-8acfab3c138&title=)
下面我们来具体看看代码部分
_**AbstractAutowireCapableBeanFactory**_
```java
// ========= 构造器实例化 =========
    // 4. 快速实例化对象，所谓的快速实例化，实际上是说使用缓存
    boolean resolved = false;
    boolean autowireNecessary = false;
    // 4.1 args: 外部化参数，只能当无外部参数时才使用缓存。不推荐使用外部化参数
    if (args == null) {
        synchronized (mbd.constructorArgumentLock) {
            // 4.2 是否使用缓存，其中autowireNecessary表示是否使用有参构造器
            //     无参时肯定不会解析，为false。有参时会解析，为true
            if (mbd.resolvedConstructorOrFactoryMethod != null) {
                resolved = true;
                autowireNecessary = mbd.constructorArgumentsResolved;
            }
        }
    }
    // 4.3 使用缓存，其中autowireNecessary表示是否使用有参构造器
    if (resolved) {
        if (autowireNecessary) {
            // 4.4 有参构造器实例化
            return autowireConstructor(beanName, mbd, null, null);
        } else {
            // 4.5 无参构造器实例化
            return instantiateBean(beanName, mbd);
        }
    }

    // 5. 到此，只能老老实实的解析，当然解析后会将解析后的构造器或参数缓存起来
    // 5.1 是否指定了构造器，ibp#determineCandidateConstructors
    Constructor<?>[] ctors = determineConstructorsFromBeanPostProcessors(beanClass, beanName);
    // 5.2 构造器实例化
    if (ctors != null || mbd.getResolvedAutowireMode() == AUTOWIRE_CONSTRUCTOR ||
        mbd.hasConstructorArgumentValues() || !ObjectUtils.isEmpty(args)) {
        return autowireConstructor(beanName, mbd, ctors, args);
    }

    // 5.3 不用管，默认都是 null。
    ctors = mbd.getPreferredConstructors();
    if (ctors != null) {
        return autowireConstructor(beanName, mbd, ctors, null);
    }

    // 5.4 无参构造器实例化
    return instantiateBean(beanName, mbd);
}
```
我们可以看到上面代码的两个关键方法有参实例化与无参实例化
#### autowireConstructor实例化
这个过程和上一个方法一样非常复杂，不过差不太多，你可以理解为去找到当前 Bean 的构造方法，获取相关入参（构造器注入），然后调用该构造方法返回一个实例对象（反射机制）
**_AbstractAutowireCapableBeanFactory_**
```java
protected BeanWrapper autowireConstructor(
        String beanName, RootBeanDefinition mbd, @Nullable Constructor[] ctors, @Nullable Object[] explicitArgs) {
    return new ConstructorResolver(this).autowireConstructor(beanName, mbd, ctors, explicitArgs);
}
```
创建 ConstructorResolver 对象，然后调用其 autowireConstructor(...) 方法
**_ConstructorResolver_**
```java
// ConstructorResolver.java
public BeanWrapper autowireConstructor(String beanName, RootBeanDefinition mbd,
        @Nullable Constructor[] chosenCtors, @Nullable Object[] explicitArgs) {

    // 构造 BeanWrapperImpl 对象
    BeanWrapperImpl bw = new BeanWrapperImpl();
    // 初始化 BeanWrapperImpl，设置 ConversionService 类型转换器，并注册自定义的属性编辑器
    this.beanFactory.initBeanWrapper(bw);

    // -------------------------尝试获取构造方法和入参-------------------------
    //尝试获取构造方法和入参

    // 构造方法
    Constructor constructorToUse = null;
    ArgumentsHolder argsHolderToUse = null;
    // 构造方法的入参集合
    Object[] argsToUse = null;

    //如果当前方法入参指定了参数，则直接使用
    if (explicitArgs != null) {
        argsToUse = explicitArgs;
    }
    //否则，尝试从 RootBeanDefinition 中获取已解析出来的构造方法和入参
    else {
        // 因为可能前面解析了，会临时缓存，避免再次解析
        Object[] argsToResolve = null;
        synchronized (mbd.constructorArgumentLock) {
            constructorToUse = (Constructor) mbd.resolvedConstructorOrFactoryMethod;
            // 如果构造方法被解析了，那么参数也可能解析过
            if (constructorToUse != null && mbd.constructorArgumentsResolved) {
                // Found a cached constructor...
                argsToUse = mbd.resolvedConstructorArguments;
                if (argsToUse == null) {
                    // 没有解析过的参数，则尝试从 RootBeanDefinition（合并后）中获取未被解析过的参数
                    argsToResolve = mbd.preparedConstructorArguments;
                }
            }
        }
        // 如果获取到了未被解析过的入参
        if (argsToResolve != null) {
            // 处理参数值，类型转换，例如给定方法 A(int, int)，配配置了 A("1"、"2") 两个参数，则会转换为 A(1, 1)
            argsToUse = resolvePreparedArguments(beanName, mbd, bw, constructorToUse, argsToResolve, true);
        }
    }

    // -------------------------开始获取构造方法和入参-------------------------
    //如果上一步没有找到构造方法或入参集合，找到所有匹配的工厂方法，首先找到所有匹配的构造方法

    if (constructorToUse == null || argsToUse == null) {
        // Take specified constructors, if any.
        //获取所有的构造方法，如果当前方法指定了构造方法的集合，则使用这个集合
        Constructor[] candidates = chosenCtors;
        if (candidates == null) {
            Class beanClass = mbd.getBeanClass();
            try {
                candidates = (mbd.isNonPublicAccessAllowed() ?
                        beanClass.getDeclaredConstructors() : beanClass.getConstructors());
            }
            catch (Throwable ex) {
                throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                        "Resolution of declared constructors on bean Class [" + beanClass.getName() +
                        "] from ClassLoader [" + beanClass.getClassLoader() + "] failed", ex);
            }
        }

        //如果构造方法只有一个，且当前方法的入参没有指定参数，且本身也没有定义参数，且这个构造方法没有定义入参
        // 则直接调用这个构造方法创建一个实例对象（反射机制），并返回
        if (candidates.length == 1 && explicitArgs == null && !mbd.hasConstructorArgumentValues()) {
            Constructor uniqueCandidate = candidates[0];
            if (uniqueCandidate.getParameterCount() == 0) {
                synchronized (mbd.constructorArgumentLock) {
                    mbd.resolvedConstructorOrFactoryMethod = uniqueCandidate;
                    mbd.constructorArgumentsResolved = true;
                    mbd.resolvedConstructorArguments = EMPTY_ARGS;
                }
                bw.setBeanInstance(instantiate(beanName, mbd, uniqueCandidate, EMPTY_ARGS));
                return bw;
            }
        }

        // Need to resolve the constructor.
        // 是否是构造器注入
        boolean autowiring = (chosenCtors != null ||
                mbd.getResolvedAutowireMode() == AutowireCapableBeanFactory.AUTOWIRE_CONSTRUCTOR);
        // 用于承载解析后的方法参数值
        ConstructorArgumentValues resolvedValues = null;

        // -------------------------确定构造方法的入参数量-------------------------
        //确定构造参数的入参数量，匹配的方法的入参数量要多余它
        // 方法的参数数量的最小值
        int minNrOfArgs;
        if (explicitArgs != null) {
            minNrOfArgs = explicitArgs.length;
        }
        // 从 RootBeanDefinition 解析出方法的参数个数作为最小值
        else {
            ConstructorArgumentValues cargs = mbd.getConstructorArgumentValues();
            resolvedValues = new ConstructorArgumentValues();
            minNrOfArgs = resolveConstructorArguments(beanName, mbd, bw, cargs, resolvedValues);
        }

        //将所有的构造方法进行排序，public 方法优先，入参个数多的优先
        AutowireUtils.sortConstructors(candidates);
        int minTypeDiffWeight = Integer.MAX_VALUE;
        Set<Constructor> ambiguousConstructors = null;
        LinkedListcauses = null;

        // 遍历所有构造函数
        for (Constructor candidate : candidates) {
            // 获取该构造方法的参数类型
            Class[] paramTypes = candidate.getParameterTypes();

            // 如果前面已经找到匹配的构造方法和入参，则直接结束循环
            if (constructorToUse != null && argsToUse != null && argsToUse.length > paramTypes.length) {
                // Already found greedy constructor that can be satisfied ->
                // do not look any further, there are only less greedy constructors left.
                break;
            }
            // 如果这个构造方法的参数个数小于入参数量，则跳过
            if (paramTypes.length < minNrOfArgs) {
                continue;
            }

            // -------------------------解析出构造方法的入参-------------------------
            //解析出构造方法的入参

            // 保存参数的对象
            ArgumentsHolder argsHolder;
            //通过**依赖注入**获取入参
            if (resolvedValues != null) {
                try {
                    // 获取构造方法的参数名称（@ConstructorProperties 注解）
                    String[] paramNames = ConstructorPropertiesChecker.evaluate(candidate, paramTypes.length);
                    if (paramNames == null) {
                        // 没有获取到则通过 ParameterNameDiscoverer 参数探测器获取参数名称
                        ParameterNameDiscoverer pnd = this.beanFactory.getParameterNameDiscoverer();
                        if (pnd != null) {
                            paramNames = pnd.getParameterNames(candidate);
                        }
                    }
                    // 解析出方法的入参，参数值会被依赖注入
                    argsHolder = createArgumentArray(beanName, mbd, resolvedValues, bw, paramTypes, paramNames,
                            getUserDeclaredConstructor(candidate), autowiring, candidates.length == 1);
                }
                catch (UnsatisfiedDependencyException ex) {
                    if (logger.isTraceEnabled()) {
                        logger.trace("Ignoring constructor [" + candidate + "] of bean '" + beanName + "': " + ex);
                    }
                    // Swallow and try next constructor.
                    if (causes == null) {
                        causes = new LinkedList<>();
                    }
                    causes.add(ex);
                    continue;
                }
            }
            //如果当前方法的入参指定了参数，如果个数相等则直接使用
            else {
                // Explicit arguments given -> arguments length must match exactly.
                if (paramTypes.length != explicitArgs.length) {
                    continue;
                }
                argsHolder = new ArgumentsHolder(explicitArgs);
            }

            // -------------------------根据权重获取最匹配的方法-------------------------
            //因为会遍历所有匹配的方法，所以需要进行权重的判断，拿到最优先的那个

            // 判断解析构造函数的时候是否以宽松模式还是严格模式，默认为 true
            // 严格模式：解析构造函数时，必须所有的都需要匹配，否则抛出异常
            // 宽松模式：使用具有"最接近的模式"进行匹配
            // typeDiffWeight：类型差异权重
            int typeDiffWeight = (mbd.isLenientConstructorResolution() ?
                    argsHolder.getTypeDifferenceWeight(paramTypes) : argsHolder.getAssignabilityWeight(paramTypes));
            // Choose this constructor if it represents the closest match.
            // 代表最匹配的结果，则选择作为符合条件的方法
            if (typeDiffWeight < minTypeDiffWeight) {
                constructorToUse = candidate;
                argsHolderToUse = argsHolder;
                argsToUse = argsHolder.arguments;
                minTypeDiffWeight = typeDiffWeight;
                ambiguousConstructors = null;
            }
            else if (constructorToUse != null && typeDiffWeight == minTypeDiffWeight) {
                if (ambiguousConstructors == null) {
                    ambiguousConstructors = new LinkedHashSet<>();
                    ambiguousConstructors.add(constructorToUse);
                }
                ambiguousConstructors.add(candidate);
            }
        }

        //没有找到对应的构造方法，则抛出异常
        if (constructorToUse == null) {
            if (causes != null) {
                UnsatisfiedDependencyException ex = causes.removeLast();
                for (Exception cause : causes) {
                    this.beanFactory.onSuppressedException(cause);
                }
                throw ex;
            }
            throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                    "Could not resolve matching constructor " +
                    "(hint: specify index/type/name arguments for simple parameters to avoid type ambiguities)");
        }
        else if (ambiguousConstructors != null && !mbd.isLenientConstructorResolution()) {
            throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                    "Ambiguous constructor matches found in bean '" + beanName + "' " +
                    "(hint: specify index/type/name arguments for simple parameters to avoid type ambiguities): " +
                    ambiguousConstructors);
        }

        //将解析出来的工厂方法和入参缓存，设置到 RootBeanDefinition 中，因为整个过程比较复杂，避免再次解析
        if (explicitArgs == null && argsHolderToUse != null) {
            argsHolderToUse.storeCache(mbd, constructorToUse);
        }
    }

    Assert.state(argsToUse != null, "Unresolved constructor arguments");
    //调用这个构造方法返回一个实例对象（反射机制），并设置到 `bw` 中
    bw.setBeanInstance(instantiate(beanName, mbd, constructorToUse, argsToUse));
    return bw;
}
```
详细的步骤参考上面的工厂创建的解析，我们这里总结一下’
上**_面整个过程非常复杂，这里进行简单概括：_**

- **_找到最匹配的构造方法_**
- **_如果构造方法有入参，则需要注入相关对象（构造器注入，其实也是依赖注入获取到的参数）_**
- **_调用这个构造方法（反射机制），返回一个实例对象_**
#### instantiateBean 方法
兜底方法，如果构造方法找不到（或者已经解析出来的构造方法），则直接使用默认的构造方法（或者已经解析出来的构造方法），返回一个实例对象
**_AbstractAutowireCapableBeanFactory_**
```java
// AbstractAutowireCapableBeanFactory.java
protected BeanWrapper instantiateBean(final String beanName, final RootBeanDefinition mbd) {
    try {
        Object beanInstance;
        final BeanFactory parent = this;
        // 安全模式
        if (System.getSecurityManager() != null) {
            beanInstance = AccessController.doPrivileged((PrivilegedAction) () ->
                    // 获得 InstantiationStrategy 对象，并使用它，创建 Bean 对象
                    getInstantiationStrategy().instantiate(mbd, beanName, parent),
                    getAccessControlContext());
        }
        else {
             // 获得 InstantiationStrategy 对象，并使用它，创建 Bean 对象
            beanInstance = getInstantiationStrategy().instantiate(mbd, beanName, parent);
        }
        BeanWrapper bw = new BeanWrapperImpl(beanInstance);
        initBeanWrapper(bw);
        return bw;
    }
    catch (Throwable ex) {
        throw new BeanCreationException(
                mbd.getResourceDescription(), beanName, "Instantiation of bean failed", ex);
    }
}
```
可以看到会通过 CglibSubclassingInstantiationStrategy#instantiate(...) 方法创建一个实例对象，该方法如下
**_SimpleInstantiationStrategy_**
```java
@Override
public Object instantiate(RootBeanDefinition bd, @Nullable String beanName, BeanFactory owner) {
    // Don't override the class with CGLIB if no overrides.
    //没有 MethodOverride 对象，也就是没有需要覆盖或替换的方法，则直接使用反射机制进行实例化即可
    if (!bd.hasMethodOverrides()) {
        Constructor constructorToUse;
        synchronized (bd.constructorArgumentLock) {
            //尝试从 RootBeanDefinition 获得已经解析出来的构造方法 `resolvedConstructorOrFactoryMethod`
            constructorToUse = (Constructor) bd.resolvedConstructorOrFactoryMethod;
            //没有解析出来的构造方法，则获取默认的构造方法
            if (constructorToUse == null) {
                final Class clazz = bd.getBeanClass();
                // 如果是接口，抛出 BeanInstantiationException 异常
                if (clazz.isInterface()) {
                    throw new BeanInstantiationException(clazz, "Specified class is an interface");
                }
                try {
                    // 从 clazz 中，获得构造方法
                    if (System.getSecurityManager() != null) { // 安全模式
                        constructorToUse = AccessController.doPrivileged(
                                (PrivilegedExceptionAction<Constructor>) clazz::getDeclaredConstructor);
                    }
                    else {
                        constructorToUse = clazz.getDeclaredConstructor();
                    }
                    // 标记 resolvedConstructorOrFactoryMethod 属性
                    bd.resolvedConstructorOrFactoryMethod = constructorToUse;
                }
                catch (Throwable ex) {
                    throw new BeanInstantiationException(clazz, "No default constructor found", ex);
                }
            }
        }
        //通过这个构造方法实例化一个对象（反射机制）
        return BeanUtils.instantiateClass(constructorToUse);
    }
    //否则，通过 CGLIB 生成一个子类对象
    else {
        // Must generate CGLIB subclass.
        return instantiateWithMethodInjection(bd, beanName, owner);
    }
}
```
**_过程大致如下：_**

- **_没有 MethodOverride 对象，也就是没有需要覆盖或替换的方法，则直接使用反射机制进行实例化即可_**
- **_尝试从 RootBeanDefinition 获得已经解析出来的构造方法 resolvedConstructorOrFactoryMethod_**
- **_没有解析出来的构造方法，则获取默认的构造方法_**
- **_通过这个构造方法实例化一个对象（反射机制）_**
- **_否则，通过 CGLIB 生成一个子类对象_**

到这我们就介绍完了Bean的创建，基础知识参考：[Spring 的基本介绍_长安不及十里的博客-CSDN博客](https://blog.csdn.net/weixin_44451022/article/details/132040631)
下面回到doCreatBean方法中
## 2.4 Bean的前置处理
**_AbstractAutowireCapableBeanFactory_**
```java
// Allow post-processors to modify the merged bean definition.
		synchronized (mbd.postProcessingLock) {
			if (!mbd.postProcessed) {
				try {
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
找到所有实现了MergedBeanDefinitionPostProcessor的实例 ，然后访问其postProcessMergedBeanDefinition()方法。这里主要是为了后面填充Bean属性做一些前置准备。
由于篇幅原因我们下篇文章详细解决下面的流程
