---

title: Spring源码分析 （六）Bean的加载过程
sidebar_position: 6
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

官网：[Home](https://spring.io/)
参考书籍：[Spring源码深度解析-郝佳编著-微信读书](https://weread.qq.com/web/bookDetail/0e232b205b260a0e29f3fb5)
经过前面的分析我们已经结束了对XML配置文件的解析，接下来我们来看对Bean的加载
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
	public static void main(String[] args) {
		BeanFactory bf = new XmlBeanFactory( new ClassPathResource("spring-config.xml"));
		MyTestBean myTestBean = (MyTestBean) bf.getBean("myTestBean");
		System.out.println(myTestBean.getName());
	}
}

```
下面我们仔细来看看呗
**AbstractBeanFactory**
```java
        public Object getBean(String name) throws BeansException {
                  return doGetBean(name, null, null, false);
        }


        protected <T> T doGetBean(
                      final String name, final Class<T> requiredType, final Object[] args, boolean
    typeCheckOnly) throws BeansException {

                  //提取对应的beanName
                  final String beanName = transformedBeanName(name);
                  Object bean;
                  /*
                  * 检查缓存中或者实例工厂中是否有对应的实例
                  * 为什么首先会使用这段代码呢,
                  * 因为在创建单例bean的时候会存在依赖注入的情况，而在创建依赖的时候为了避免循环依赖，
                  * Spring创建bean的原则是不等bean创建完成就会将创建bean的ObjectFactory提早曝光
                  * 也就是将ObjectFactory加入到缓存中，一旦下个bean创建时候需要依赖上个bean则直接使用
    ObjectFactory
                  */
                  //直接尝试从缓存获取或者singletonFactories中的ObjectFactory中获取
                  Object sharedInstance = getSingleton(beanName);
                  if (sharedInstance != null && args == null) {
                      if (logger.isDebugEnabled()) {
                          if (isSingletonCurrentlyInCreation(beanName)) {
                              logger.debug("Returning eagerly cached instance of singleton bean
    '" + beanName +
                                        "' that is not fully initialized yet - a consequence of
    a circular reference");
                          }
    else {
        logger.debug("Returning cached instance of singleton bean '" +
    beanName + "'");
    }
                      }
        //返回对应的实例，有时候存在诸如BeanFactory的情况并不是直接返回实例本身而是返回指定方法返回的实例
                      bean = getObjectForBeanInstance(sharedInstance, name, beanName, null);
                  }else {
                      //只有在单例情况才会尝试解决循环依赖，原型模式情况下，如果存在
                      //A中有B的属性，B中有A的属性，那么当依赖注入的时候，就会产生当A还未创建完的时候因为
                      //对于B的创建再次返回创建A，造成循环依赖，也就是下面的情况
                      //isPrototypeCurrentlyInCreation(beanName)为true
                      if (isPrototypeCurrentlyInCreation(beanName)) {
    throw new BeanCurrentlyInCreationException(beanName);
                      }
                      BeanFactory parentBeanFactory = getParentBeanFactory();
                      //如果 beanDefinitionMap 中也就是在所有已经加载的类中不包括 beanName 则尝试从
    parentBeanFactory中检测
                      if (parentBeanFactory != null && !containsBeanDefinition(beanName)) {
                           String nameToLookup = originalBeanName(name);
                           //递归到BeanFactory中寻找
                           if (args != null) {
                                return (T) parentBeanFactory.getBean(nameToLookup, args);
                           }
                           else {
                               return parentBeanFactory.getBean(nameToLookup, requiredType);
                           }
                      }
                      //如果不是仅仅做类型检查则是创建bean，这里要进行记录
                      if (!typeCheckOnly) {
                          markBeanAsCreated(beanName);
                      }
                      //将存储XML配置文件的GernericBeanDefinition转换为RootBeanDefinition，如果指
    定BeanName是子Bean的话同时会合并父类的相关属性
                      final RootBeanDefinition mbd = getMergedLocalBeanDefinition(beanName);
                      checkMergedBeanDefinition(mbd, beanName, args);
                      String[] dependsOn = mbd.getDependsOn();
                      //若存在依赖则需要递归实例化依赖的bean
                      if (dependsOn != null) {
                           for (String dependsOnBean : dependsOn) {
                                getBean(dependsOnBean);
                                //缓存依赖调用
                                registerDependentBean(dependsOnBean, beanName);
                           }
                      }
                      //实例化依赖的bean后便可以实例化mbd本身了
                      //singleton模式的创建
                      if (mbd.isSingleton()) {
                          sharedInstance = getSingleton(beanName, new ObjectFactory<Object>() {
                              public Object getObject() throws BeansException {
                              try {
                                  return createBean(beanName, mbd, args);
                              }
                              catch (BeansException ex) {
                                   destroySingleton(beanName);
                                   throw ex;
                              }
                           }
                       });
                       bean = getObjectForBeanInstance(sharedInstance, name, beanName, mbd);
                   }else if (mbd.isPrototype()) {
                       //prototype模式的创建(new)
                       Object prototypeInstance = null;
                       try {
                           beforePrototypeCreation(beanName);
                           prototypeInstance = createBean(beanName, mbd, args);
                       }
                       finally {
                            afterPrototypeCreation(beanName);
                       }
                       bean = getObjectForBeanInstance(prototypeInstance, name, beanName, mbd);
                  }else {
                      //指定的scope上实例化bean
                      String scopeName = mbd.getScope();
                      final Scope scope = this.scopes.get(scopeName);
                      if (scope == null) {
                           throw new IllegalStateException("No Scope registered for scope '"
 + scopeName + "'");
                      }
                      try {
                          Object scopedInstance = scope.get(beanName, new ObjectFactory<Object>() {
                               public Object getObject() throws BeansException {
                                   beforePrototypeCreation(beanName);
                                   try {
                                       return createBean(beanName, mbd, args);
                                   }
                                   finally {
                                        afterPrototypeCreation(beanName);
                                   }
                                }
                           });
                           bean=getObjectForBeanInstance(scopedInstance,name,beanName,mbd);
                       }
                       catch (IllegalStateException ex) {
                            throw new BeanCreationException(beanName,
                                     "Scope '" + scopeName + "' is not active for the current
 thread; " +
                                     "consider defining a scoped proxy for this bean if you
 intend to refer to it from a singleton",
                                     ex);
                        }
                    }
               }
                  //检查需要的类型是否符合bean的实际类型
                  if (requiredType != null && bean != null && !requiredType.isAssignableFrom
    (bean.getClass())) {
                      try {
                          return getTypeConverter().convertIfNecessary(bean, requiredType);
                      }
                      catch (TypeMismatchException ex) {
                           if (logger.isDebugEnabled()) {
                                logger.debug("Failed to convert bean '" + name + "' to required type
    [" +
                                        ClassUtils.getQualifiedName(requiredType) + "]", ex);
                           }
                           throw new BeanNotOfRequiredTypeException(name, requiredType, bean.
    getClass());
                      }
                  }
                  return (T) bean;
        }
```
上面的代码刚看可能有点蒙，下面我们来梳理一下大体的规程

:::info
> -   转换对应beanName
>
或许很多人不理解转换对应beanName是什么意思，传入的参数name不就是beanName吗？其实不是，这里传入的参数可能是别名，也可能是FactoryBean，所以需要进行一系列的解析，这些解析内容包括如下内容。
> ● 去除FactoryBean的修饰符，也就是如果name="&aa"，那么会首先去除&而使name="aa"。
> ● 取指定alias所表示的最终beanName，例如别名A指向名称为B的bean则返回B；若别名A指向别名B，别名B又指向名称为C的bean则返回C。
> - 尝试从缓存中加载单例
>
单例在Spring的同一个容器内只会被创建一次，后续再获取bean，就直接从单例缓存中获取了。当然这里也只是尝试加载，首先尝试从缓存中加载，如果加载不成功则再次尝试从singletonFactories中加载。因为在创建单例bean的时候会存在依赖注入的情况，而在创建依赖的时候为了避免循环依赖，在Spring中创建bean的原则是不等bean创建完成就会将创建bean的ObjectFactory提早曝光加入到缓存中，一旦下一个bean创建时候需要依赖上一个bean则直接使用ObjectFactory
> - bean的实例化
>
如果从缓存中得到了bean的原始状态，则需要对bean进行实例化。这里有必要强调一下，缓存中记录的只是最原始的bean状态，并不一定是我们最终想要的bean。举个例子，假如我们需要对工厂bean进行处理，那么这里得到的其实是工厂bean的初始状态，但是我们真正需要的是工厂bean中定义的factory-method方法中返回的bean，而getObjectForBeanInstance就是完成这个工作的，后续会详细讲解。
> - 原型模式的依赖检查
>
只有在单例情况下才会尝试解决循环依赖，如果存在A中有B的属性，B中有A的属性，那么当依赖注入的时候，就会产生当A还未创建完的时候因为对于B的创建再次返回创建A，造成循环依赖，也就是情况：isPrototypeCurrentlyInCreation(beanName)判断true。
> - 检测parentBeanFactory
>
从代码上看，如果缓存没有数据的话直接转到父类工厂上去加载了，这是为什么呢？可能读者忽略了一个很重要的判断条件：parentBeanFactory != null &&!containsBean Definition (beanName)，parentBeanFactory != null。parentBeanFactory如果为空，则其他一切都是浮云，这个没什么说的，但是!containsBeanDefinition(beanName)就比较重要了，它是在检测如果当前加载的XML配置文件中不包含beanName所对应的配置，就只能到parentBeanFactory去尝试下了，然后再去递归的调用getBean方法。
> - 将存储XML配置文件的GernericBeanDefinition转换为RootBeanDefinition
>
因为从XML配置文件中读取到的Bean信息是存储在GernericBeanDefinition中的，但是所有的Bean后续处理都是针对于RootBeanDefinition的，所以这里需要进行一个转换，转换的同时如果父类bean不为空的话，则会一并合并父类的属性。
> - 寻找依赖
>
因为bean的初始化过程中很可能会用到某些属性，而某些属性很可能是动态配置的，并且配置成依赖于其他的bean，那么这个时候就有必要先加载依赖的bean，所以，在Spring的加载顺寻中，在初始化某一个bean的时候首先会初始化这个bean所对应的依赖
> - 针对不同的scope进行bean的创建
>
在Spring中存在着不同的scope，其中默认的是singleton，但是还有些其他的配置诸如prototype、request之类的。在这个步骤中，Spring会根据不同的配置进行不同的初始化策略。
> - 类型转换
>
:::

程序到这里返回bean后已经基本结束了，通常对该方法的调用参数requiredType是为空的，但是可能会存在这样的情况，返回的bean其实是个String，但是requiredType却传入Integer类型，那么这时候本步骤就会起作用了，它的功能是将返回的bean转换为requiredType所指定的类型。当然，String转换为Integer是最简单的一种转换，在Spring中提供了各种各样的转换器，用户也可以自己扩展转换器来满足需求。

下面我们更具这些流程进行具体的一一讲解
## 1.1  转换对应beanName
```java
// 提取对应的beanName
String beanName = transformedBeanName(name);
```
这里我们也许会有疑问，我们一般不就传入的就是我们命名的beanName吗？为啥还需要转换一下？
我们可以从源码中可以看到，它对传入的名称进行了一下判断
**BeanFactoryUtils**
```java
	public static String transformedBeanName(String name) {
		Assert.notNull(name, "'name' must not be null");
		// String FACTORY_BEAN_PREFIX = "&";
		if (!name.startsWith(BeanFactory.FACTORY_BEAN_PREFIX)) {
			return name;
		}
    	// 如果是String FACTORY_BEAN_PREFIX = "&";
		return transformedBeanNameCache.computeIfAbsent(name, beanName -> {
			do {
				beanName = beanName.substring(BeanFactory.FACTORY_BEAN_PREFIX.length());
			}
			while (beanName.startsWith(BeanFactory.FACTORY_BEAN_PREFIX));
			return beanName;
		});
	}
```
那什么时候会在beanName前显示的加上"&" 前缀？简单来说就是继承了FactoryBean
```java
          public   class  CarFactoryBean  implements  FactoryBean<Car>  {
              private  String carInfo ;
              public  Car getObject ()   throws  Exception  {
              Car car =  new  Car () ;
              String []  infos =  carInfo .split ( "," ) ;
              car.setBrand ( infos [ 0 ]) ;
              car.setMaxSpeed ( Integer. valueOf ( infos [ 1 ])) ;
              car.setPrice ( Double. valueOf ( infos [ 2 ])) ;
              return  car;
          }
          public  Class<Car> getObjectType ()       {
              return  Car. class ;
              }
              public    boolean  isSingleton ()   {
                 return   false ;
              }
              public  String getCarInfo ()   {
                 return   this . carInfo ;
              }
              // 接受逗号分割符设置属性信息
              public    void  setCarInfo ( String carInfo )   {
                 this . carInfo  = carInfo;
              }
        }
```
而我们的配置文件中
```java
        <bean id="car" class="com.test.factorybean.CarFactoryBean" carInfo="超级跑车,400,2000000"/>
```
当调用getBean("car")时，Spring通过反射机制发现CarFactoryBean实现了FactoryBean的接口，这时Spring容器就调用接口方法CarFactoryBean#getObject()方法返回。如果希望获取CarFactoryBean的实例，则需要在使用getBean(beanName)方法时在beanName前显示的加上"&" 前缀，
## 1.2 尝试从缓存中加载单例

- 单例在Spring的同一个容器内只会被创建一次，后续再获取bean直接从单例缓存中获取，当然这里也只是尝试加载，首先尝试从缓存中加载，然后再次尝试尝试从singletonFactories中加载。
- 因为在创建单例bean的时候会存在依赖注入的情况，而在创建依赖的时候为了避免循环依赖， Spring创建bean的原则是不等bean创建完成就会将创建bean的ObjectFactory提早曝光加入到缓存中，一旦下一个bean创建时需要依赖上个bean，则直接使用ObjectFactory。

**AbstractBeanFactory**
```java
Object sharedInstance = getSingleton(beanName);
		if (sharedInstance != null && args == null) {
			if (logger.isTraceEnabled()) {
				if (isSingletonCurrentlyInCreation(beanName)) {
					logger.trace("Returning eagerly cached instance of singleton bean '" + beanName +
							"' that is not fully initialized yet - a consequence of a circular reference");
				}
				else {
					logger.trace("Returning cached instance of singleton bean '" + beanName + "'");
				}
			}
			//   //返回对应的实例，有时候存在诸如BeanFactory的情况并不是直接返回实例本身而是返回指定方法返回的实例
			bean = getObjectForBeanInstance(sharedInstance, name, beanName, null);
		}
```
我们可以看到关键的方法在于getSingleton，下面我们仔细来看看

-  singletonObjects：用于保存BeanName和创建bean实例之间的关系，bean name --> bean instance。
- singletonFactories：用于保存BeanName和创建bean的工厂之间的关系，bean name ->ObjectFactory。
-  earlySingletonObjects：也是保存BeanName和创建bean实例之间的关系，与singletonObjects的不同之处在于，当一个单例bean被放到这里面后，那么当bean还在创建过程中，就可以通过getBean方法获取到了，其目的是用来检测循环引用。
-  registeredSingletons：用来保存当前所有已注册的bean。
```java
        public Object getSingleton(String beanName) {
             //参数true设置标识允许早期依赖
           return getSingleton(beanName, true);
        }
        protected Object getSingleton(String beanName, boolean allowEarlyReference) {
                  //检查缓存中是否存在实例
                  Object singletonObject = this.singletonObjects.get(beanName);
                  if (singletonObject == null) {
                       //如果为空，则锁定全局变量并进行处理
                       synchronized (this.singletonObjects) {
                            //如果此bean正在加载则不处理
                            singletonObject = this.earlySingletonObjects.get(beanName);
                            if (singletonObject == null && allowEarlyReference) {
                                 //当某些方法需要提前初始化的时候则会调用 addSingletonFactory 方法将对应
    的ObjectFactory初始化策略存储在singletonFactories
                              ObjectFactory  singletonFactory  =  this.singletonFactories.get
    (beanName);
                              if (singletonFactory != null) {
                                   //调用预先设定的getObject方法
                                   singletonObject = singletonFactory.getObject();
                                   //记录在缓存中，earlySingletonObjects和singletonFactories互斥
                                   this.earlySingletonObjects.put(beanName, singletonObject);
                                   this.singletonFactories.remove(beanName);
                              }
                          }
                      }
                  }
                  return (singletonObject != NULL_OBJECT ? singletonObject : null);
          }
```
我们梳理一下过程：

- 这个方法首先尝试从singletonObjects里面获取实例
- 如果获取不到再从earlySingleton Objects里面获取
- 如果还获取不到，再尝试从singletonFactories里面获取beanName对应的ObjectFactory
- 然后调用这个ObjectFactory的getObject来创建bean，并放到earlySingleton Objects里面去
- 并且从singletonFacotories里面remove掉这个ObjectFactory，而对于后续的所有内存操作都只为了循环依赖检测时候使用，也就是在allowEarlyReference为true的情况下才会使用。
## 1.3 bean的实例化
接着上面我们如果从缓存中加载到了单例对象，下面就是bean的实例化，从上面的代码来看我们无论从singletonObjects还是ObjectFactory中加载的单例对象都是原始对象，所以要进行bean的实例化
```java
bean = getObjectForBeanInstance(sharedInstance, name, beanName, null);
```

- getObjectForBeanInstance是个高频率使用的方法，无论是从缓存中获得bean还是根据不同的scope策略加载bean。
- 我们得到bean的实例后要做的第一步就是调用这个方法来检测一下正确性，其实就是用于检测当前bean是否是FactoryBean类型的bean，如果是，那么需要调用该bean对应的FactoryBean实例中的getObject()作为返回值。
```java
        protected Object getObjectForBeanInstance(
                      Object beanInstance, String name, String beanName, RootBeanDefinition mbd) {
                  //如果指定的name是工厂相关(以&为前缀)且beanInstance又不是FactoryBean类型则验证不通过
                  if (BeanFactoryUtils.isFactoryDereference(name) && !(beanInstance instanceof
    FactoryBean)) {
                      throw new BeanIsNotAFactoryException(transformedBeanName(name), beanInstance.
    getClass());
                  }
                  //现在我们有了个bean的实例，这个实例可能会是正常的bean或者是FactoryBean
                  //如果是 FactoryBean 我们使用它创建实例，但是如果用户想要直接获取工厂实例而不是工厂的
    getObject方法对应的实例那么传入的name应该加入前缀&
                  if  (!(beanInstance  instanceof  FactoryBean)  ||  BeanFactoryUtils.  IsFactory
    Dereference(name)) {
                      return beanInstance;
                  }
                  //加载FactoryBean
                  Object object = null;
                  if (mbd == null) {
                       //尝试从缓存中加载bean
                       object = getCachedObjectForFactoryBean(beanName);
                  }
                  if (object == null) {
                       //到这里已经明确知道beanInstance一定是FactoryBean类型
                       FactoryBean<?> factory = (FactoryBean<?>) beanInstance;
                       //containsBeanDefinition检测beanDefinitionMap中也就是在所有已经加载的类中检测
    是否定义beanName
                       if (mbd == null && containsBeanDefinition(beanName)) {
                            //将存储XML配置文件的GernericBeanDefinition转换为RootBeanDefinition，
    如果指定BeanName是子Bean的话同时会合并父类的相关属性
                           mbd = getMergedLocalBeanDefinition(beanName);
                      }
                      //是否是用户定义的而不是应用程序本身定义的
                      boolean synthetic = (mbd != null && mbd.isSynthetic());
                      object = getObjectFromFactoryBean(factory, beanName, !synthetic);
                  }
                  return object;
        }
```
流程梳理：

- 对FactoryBean正确性的验证
- 对非FactoryBean不做任何处理
- 尝试从缓存中加载Bean，如果有直接换行，没有就交给getObjectFromFactoryBean
- 将从Factory中解析bean的工作委托给getObjectFromFactoryBean
```java
	protected Object getObjectFromFactoryBean(FactoryBean<?> factory, String beanName, boolean shouldPostProcess) {
		// 如果是单例模式
		if (factory.isSingleton() && containsSingleton(beanName)) {
			synchronized (getSingletonMutex()) {
				Object object = this.factoryBeanObjectCache.get(beanName);
				if (object == null) {
					object = doGetObjectFromFactoryBean(factory, beanName);
					// Only post-process and store if not put there already during getObject() call above
					// (e.g. because of circular reference processing triggered by custom getBean calls)
					Object alreadyThere = this.factoryBeanObjectCache.get(beanName);
					if (alreadyThere != null) {
						object = alreadyThere;
					}
					else {
						if (shouldPostProcess) {
							if (isSingletonCurrentlyInCreation(beanName)) {
								// Temporarily return non-post-processed object, not storing it yet..
								return object;
							}
							beforeSingletonCreation(beanName);
							try {
								object = postProcessObjectFromFactoryBean(object, beanName);
							}
							catch (Throwable ex) {
								throw new BeanCreationException(beanName,
										"Post-processing of FactoryBean's singleton object failed", ex);
							}
							finally {
								afterSingletonCreation(beanName);
							}
						}
						if (containsSingleton(beanName)) {
							this.factoryBeanObjectCache.put(beanName, object);
						}
					}
				}
				return object;
			}
		}
		else {
			Object object = doGetObjectFromFactoryBean(factory, beanName);
			if (shouldPostProcess) {
				try {
					object = postProcessObjectFromFactoryBean(object, beanName);
				}
				catch (Throwable ex) {
					throw new BeanCreationException(beanName, "Post-processing of FactoryBean's object failed", ex);
				}
			}
			return object;
		}
	}
```
我们简单梳理一下上面的代码逻辑：我们的目的从工厂中加载对象，让后在调用后置处理器，在实际开发过程中可以针对进行自己的业务逻辑设计
## 1.4 原型模式的依赖检查
之前我们讲解了从缓存中获取单例的过程，上面的逻辑是正对缓存中不为空的情况，下面我们来看那可能缓存如果为空咋办？
只有在单例情况下才会尝试解决循环依赖，如果存在A中有B的属性，B中有A的属性，那么当依赖注入的时候，就会产生当A还未创建完的时候因为对于B的创建再次返回创建A，造成循环依赖，也就是情况：isPrototypeCurrentlyInCreation(beanName)判断true。
```java
// Fail if we're already creating this bean instance:
			// We're assumably within a circular reference.
	if (isPrototypeCurrentlyInCreation(beanName)) {
				throw new BeanCurrentlyInCreationException(beanName);
			}


protected boolean isPrototypeCurrentlyInCreation(String beanName) {
		Object curVal = this.prototypesCurrentlyInCreation.get();
		return (curVal != null &&
				(curVal.equals(beanName) || (curVal instanceof Set && ((Set<?>) curVal).contains(beanName))));
	}
```
## 1.5 检测parentBeanFactory
若 containsBeanDefinition 中不存在 beanName 相对应的 BeanDefinition，则从 parentBeanFactory 中获取。
```java
    // 获取 parentBeanFactory
    BeanFactory parentBeanFactory = getParentBeanFactory();
    // parentBeanFactory 不为空且 beanDefinitionMap 中不存该 name 的 BeanDefinition
    if (parentBeanFactory != null && !containsBeanDefinition(beanName)) {
        // 确定原始 beanName
        String nameToLookup = originalBeanName(name);
        // 若为 AbstractBeanFactory 类型，委托父类处理
        if (parentBeanFactory instanceof AbstractBeanFactory) {
            return ((AbstractBeanFactory) parentBeanFactory).doGetBean(
                    nameToLookup, requiredType, args, typeCheckOnly);
        }
        else if (args != null) {
            // 委托给构造函数 getBean() 处理
            return (T) parentBeanFactory.getBean(nameToLookup, args);
        }
        else {
            // 没有 args，委托给标准的 getBean() 处理
            return parentBeanFactory.getBean(nameToLookup, requiredType);
        }
    }

```
整个过程较为简单，都是委托 parentBeanFactory 的 getBean() 进行处理，只不过在获取之前对 name 进行简单的处理，主要是想获取原始的 beanName，如下：
```java
	protected String originalBeanName(String name) {
		String beanName = transformedBeanName(name);
		if (name.startsWith(FACTORY_BEAN_PREFIX)) {
			beanName = FACTORY_BEAN_PREFIX + beanName;
		}
		return beanName;
	}
```
transformedBeanName() 是对 name 进行转换，获取真正的 beanName，因为我们传递的可能是 aliasName，如果 name 是以 “&” 开头的，则加上 “&”，因为在 transformedBeanName() 将 “&” 去掉了，这里补上。
## 1.6 将存储XML配置文件的GernericBeanDefinition转换为RootBeanDefinition
参考博客：[Spring中BeanDefinition的合并getMergedLocalBeanDefinition](https://blog.csdn.net/ystyaoshengting/article/details/122719594)
在GenericBeanDefinition，ChildBeanDefinition中有一个parentName属性，表示该BeanDefinition的父BeanDefinition，如果该bean在定义中设置了parentName，那么在实例化之前会进行这两个BeanDefinition的合并。
```java
RootBeanDefinition mbd = getMergedLocalBeanDefinition(beanName);
checkMergedBeanDefinition(mbd, beanName, args);
```
```java
    //返回一个合并的 RootBeanDefinition，如果该bean定义是一个子bean定义，则遍历父bean定义
	protected RootBeanDefinition getMergedLocalBeanDefinition(String beanName) throws BeansException {
		//先从mergedBeanDefinitions容器中取
		//如果有，表示该bean定义已经合并过了，则就直接返回；如果没有，则进行合并
		RootBeanDefinition mbd = this.mergedBeanDefinitions.get(beanName);
		if (mbd != null) {
			return mbd;
		}
		return getMergedBeanDefinition(beanName, getBeanDefinition(beanName));
	}
	/*
	 * 如果该bean定义是子bean定义，则通过与父级合并返回给定顶级 bean 的 RootBeanDefinition
	 * @param beanName bean定义的名称
	 * @param bd 原始的bean定义(Root/ChildBeanDefinition)
	 * @return 给定bean的（可能合并的）RootBeanDefinition
	 * @throws BeanDefinitionStoreException in case of an invalid bean definition
	 */
	protected RootBeanDefinition getMergedBeanDefinition(String beanName, BeanDefinition bd)
			throws BeanDefinitionStoreException {
		return getMergedBeanDefinition(beanName, bd, null);
	}
	/**
	 * 返回一个合并的RootBeanDefinition，如果该bean定义是一个子bean定义，则合并父bean定义
	 * @param bean定义的名称
	 * @param bd 原始的bean定义(Root/ChildBeanDefinition)
	 * @param containingBd 如果是内部bean，则包含bean定义，如果是顶级 bean，则为null
	 * @return 给定bean的（可能合并的）RootBeanDefinition
	 * @throws BeanDefinitionStoreException in case of an invalid bean definition
	 */
	protected RootBeanDefinition getMergedBeanDefinition(
			String beanName, BeanDefinition bd, @Nullable BeanDefinition containingBd)
			throws BeanDefinitionStoreException {

		synchronized (this.mergedBeanDefinitions) {
			RootBeanDefinition mbd = null;
			if (containingBd == null) {
				mbd = this.mergedBeanDefinitions.get(beanName);
			}

			if (mbd == null) {
                //如果该bean定义没有parent，则不进行合并，返回包装后的RootBeanDefinition
				if (bd.getParentName() == null) {
					//如果该bean定义是RootBeanDefinition，则直接克隆一份BeanDefinition
					if (bd instanceof RootBeanDefinition) {
						mbd = ((RootBeanDefinition) bd).cloneBeanDefinition();
					}
                    //如果不是RootBeanDefinition，则包装为RootBeanDefinition
					else {
						mbd = new RootBeanDefinition(bd);
					}
				}
                //如果该bean定义有parent
				else {
					// Child bean definition: needs to be merged with parent.
					BeanDefinition pbd;
					try {
						String parentBeanName = transformedBeanName(bd.getParentName());
                        //如果parentName不是当前的beanName，则获取父bean合并后的bean定义
						if (!beanName.equals(parentBeanName)) {
                            //递归调用进行父bean定义的合并
							pbd = getMergedBeanDefinition(parentBeanName);
						}
						else {
							BeanFactory parent = getParentBeanFactory();
							if (parent instanceof ConfigurableBeanFactory) {
								pbd = ((ConfigurableBeanFactory) parent).getMergedBeanDefinition(parentBeanName);
							}
							else {
								throw new NoSuchBeanDefinitionException(parentBeanName,
										"Parent name '" + parentBeanName + "' is equal to bean name '" + beanName +
										"': cannot be resolved without an AbstractBeanFactory parent");
							}
						}
					}
					catch (NoSuchBeanDefinitionException ex) {
						throw new BeanDefinitionStoreException(bd.getResourceDescription(), beanName,
								"Could not resolve parent bean definition '" + bd.getParentName() + "'", ex);
					}
					// Deep copy with overridden values.
					mbd = new RootBeanDefinition(pbd);
                    //进行覆盖，用子bean定义中的属性，方法覆盖父bean定义中的属性，方法
					mbd.overrideFrom(bd);
				}

				// Set default singleton scope, if not configured before.
				if (!StringUtils.hasLength(mbd.getScope())) {
					mbd.setScope(RootBeanDefinition.SCOPE_SINGLETON);
				}

				// A bean contained in a non-singleton bean cannot be a singleton itself.
				// Let's correct this on the fly here, since this might be the result of
				// parent-child merging for the outer bean, in which case the original inner bean
				// definition will not have inherited the merged outer bean's singleton status.
				if (containingBd != null && !containingBd.isSingleton() && mbd.isSingleton()) {
					mbd.setScope(containingBd.getScope());
				}

                //将合并后的bean定义放入到缓存中
				if (containingBd == null && isCacheBeanMetadata()) {
					this.mergedBeanDefinitions.put(beanName, mbd);
				}
			}
			return mbd;
		}
	}
	/**
	 * 返回给定bean名称合并后的BeanDefinition，如有必要，将子bean定义与其父 bean 合并。
	 * <p>这个getMergedBeanDefinition也考虑了祖先中的 bean 定义。
	 * @param name the name of the bean to retrieve the merged definition for
	 * (may be an alias)
	 * @return a (potentially merged) RootBeanDefinition for the given bean
	 * @throws NoSuchBeanDefinitionException if there is no bean with the given name
	 * @throws BeanDefinitionStoreException in case of an invalid bean definition
	 */
	@Override
	public BeanDefinition getMergedBeanDefinition(String name) throws BeansException {
		String beanName = transformedBeanName(name);
		// Efficiently check whether bean definition exists in this factory.
		if (!containsBeanDefinition(beanName) && getParentBeanFactory() instanceof ConfigurableBeanFactory) {
			return ((ConfigurableBeanFactory) getParentBeanFactory()).getMergedBeanDefinition(beanName);
		}
		//在本地解析合并的 bean 定义
		return getMergedLocalBeanDefinition(beanName);
	}

```
AbstractBeanDefinition中对bean定义的覆盖
```java
/**
	 * Override settings in this bean definition (presumably a copied parent
	 * from a parent-child inheritance relationship) from the given bean
	 * definition (presumably the child).
	 * <ul>
	 * <li>Will override beanClass if specified in the given bean definition.
	 * <li>Will always take {@code abstract}, {@code scope},
	 * {@code lazyInit}, {@code autowireMode}, {@code dependencyCheck},
	 * and {@code dependsOn} from the given bean definition.
	 * <li>Will add {@code constructorArgumentValues}, {@code propertyValues},
	 * {@code methodOverrides} from the given bean definition to existing ones.
	 * <li>Will override {@code factoryBeanName}, {@code factoryMethodName},
	 * {@code initMethodName}, and {@code destroyMethodName} if specified
	 * in the given bean definition.
	 * </ul>
	 */
	public void overrideFrom(BeanDefinition other) {
		//如有直接覆盖BeanClassName
		if (StringUtils.hasLength(other.getBeanClassName())) {
			setBeanClassName(other.getBeanClassName());
		}
		//如有作用域直接覆盖作用域
		if (StringUtils.hasLength(other.getScope())) {
			setScope(other.getScope());
		}
		//覆盖是否抽象
		setAbstract(other.isAbstract());
		//覆盖是否懒加载
		setLazyInit(other.isLazyInit());
		//覆盖工厂名
		if (StringUtils.hasLength(other.getFactoryBeanName())) {
			setFactoryBeanName(other.getFactoryBeanName());
		}
		//覆盖工厂方法名
		if (StringUtils.hasLength(other.getFactoryMethodName())) {
			setFactoryMethodName(other.getFactoryMethodName());
		}
		setRole(other.getRole());
		setSource(other.getSource());
		//拷贝属性
		copyAttributesFrom(other);

		if (other instanceof AbstractBeanDefinition) {
			AbstractBeanDefinition otherAbd = (AbstractBeanDefinition) other;
			if (otherAbd.hasBeanClass()) {
				setBeanClass(otherAbd.getBeanClass());
			}
			if (otherAbd.hasConstructorArgumentValues()) {
				getConstructorArgumentValues().addArgumentValues(other.getConstructorArgumentValues());
			}
			if (otherAbd.hasPropertyValues()) {
				getPropertyValues().addPropertyValues(other.getPropertyValues());
			}
			if (otherAbd.hasMethodOverrides()) {
				getMethodOverrides().addOverrides(otherAbd.getMethodOverrides());
			}
			setAutowireMode(otherAbd.getAutowireMode());
			setDependencyCheck(otherAbd.getDependencyCheck());
			setDependsOn(otherAbd.getDependsOn());
			setAutowireCandidate(otherAbd.isAutowireCandidate());
			setPrimary(otherAbd.isPrimary());
			copyQualifiersFrom(otherAbd);
			setInstanceSupplier(otherAbd.getInstanceSupplier());
			setNonPublicAccessAllowed(otherAbd.isNonPublicAccessAllowed());
			setLenientConstructorResolution(otherAbd.isLenientConstructorResolution());
			if (otherAbd.getInitMethodName() != null) {
				setInitMethodName(otherAbd.getInitMethodName());
				setEnforceInitMethod(otherAbd.isEnforceInitMethod());
			}
			if (otherAbd.getDestroyMethodName() != null) {
				setDestroyMethodName(otherAbd.getDestroyMethodName());
				setEnforceDestroyMethod(otherAbd.isEnforceDestroyMethod());
			}
			setSynthetic(otherAbd.isSynthetic());
			setResource(otherAbd.getResource());
		}
		else {
			getConstructorArgumentValues().addArgumentValues(other.getConstructorArgumentValues());
			getPropertyValues().addPropertyValues(other.getPropertyValues());
			setResourceDescription(other.getResourceDescription());
		}
	}


	protected void copyAttributesFrom(AttributeAccessor source) {
		Assert.notNull(source, "Source must not be null");
		String[] attributeNames = source.attributeNames();
		for (String attributeName : attributeNames) {
			setAttribute(attributeName, source.getAttribute(attributeName));
		}
	}

```
## 1.7 寻找依赖
如果一个 bean 有依赖 bean 的话，那么在初始化该 bean 时是需要先初始化它所依赖的 bean
```java
        // 获取依赖。
        // 在初始化 bean 时解析 depends-on 标签时设置
        String[] dependsOn = mbd.getDependsOn();
        if (dependsOn != null) {
            // 迭代依赖
        for (String dep : dependsOn) {
            // 检验依赖的bean 是否已经注册给当前 bean 获取其他传递依赖bean
            if (isDependent(beanName, dep)) {
                throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                        "Circular depends-on relationship between '" + beanName + "' and '" + dep + "'");
            }
            // 注册到依赖bean中
            registerDependentBean(dep, beanName);
            try {
                // 调用 getBean 初始化依赖bean
                getBean(dep);
            }
            catch (NoSuchBeanDefinitionException ex) {
                throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                        "'" + beanName + "' depends on missing bean '" + dep + "'", ex);
            }
        }
    }

```
这段代码逻辑是：通过迭代的方式依次对依赖 bean 进行检测、校验，如果通过则调用 getBean() 实例化依赖 bean
## 1.8 针对不同的scope进行bean的创建
```java
		// Create bean instance.
            	// 单例模式
				if (mbd.isSingleton()) {
					sharedInstance = getSingleton(beanName, () -> {
						try {
							return createBean(beanName, mbd, args);
						}
						catch (BeansException ex) {
							// Explicitly remove instance from singleton cache: It might have been put there
							// eagerly by the creation process, to allow for circular reference resolution.
							// Also remove any beans that received a temporary reference to the bean.
							destroySingleton(beanName);
							throw ex;
						}
					});
					bean = getObjectForBeanInstance(sharedInstance, name, beanName, mbd);
				}
            	// 原型模式
				else if (mbd.isPrototype()) {
					// It's a prototype -> create a new instance.
					Object prototypeInstance = null;
					try {
						beforePrototypeCreation(beanName);
						prototypeInstance = createBean(beanName, mbd, args);
					}
					finally {
						afterPrototypeCreation(beanName);
					}
					bean = getObjectForBeanInstance(prototypeInstance, name, beanName, mbd);
				}

				else {
					String scopeName = mbd.getScope();
					if (!StringUtils.hasLength(scopeName)) {
						throw new IllegalStateException("No scope name defined for bean '" + beanName + "'");
					}
					Scope scope = this.scopes.get(scopeName);
					if (scope == null) {
						throw new IllegalStateException("No Scope registered for scope name '" + scopeName + "'");
					}
					try {
						Object scopedInstance = scope.get(beanName, () -> {
							beforePrototypeCreation(beanName);
							try {
								return createBean(beanName, mbd, args);
							}
							finally {
								afterPrototypeCreation(beanName);
							}
						});
						bean = getObjectForBeanInstance(scopedInstance, name, beanName, mbd);
					}
					catch (IllegalStateException ex) {
						throw new BeanCreationException(beanName,
								"Scope '" + scopeName + "' is not active for the current thread; consider " +
								"defining a scoped proxy for this bean if you intend to refer to it from a singleton",
								ex);
					}
				}
			}
			catch (BeansException ex) {
				cleanupAfterBeanCreationFailure(beanName);
				throw ex;
			}
		}
```
### 1.1 单例模式实例化
关键代码
```java
            if (mbd.isSingleton()) {
					sharedInstance = getSingleton(beanName, () -> {
						try {
							return createBean(beanName, mbd, args);
						}
						catch (BeansException ex) {
							destroySingleton(beanName);
							throw ex;
						}
					});
					bean = getObjectForBeanInstance(sharedInstance, name, beanName, mbd);
				}

```
第一部分分析了从缓存中获取单例模式的 bean，但是如果缓存中不存在呢？则需要从头开始加载 bean，这个过程由 getSingleton() 实现。
```java
  public Object getSingleton(String beanName, ObjectFactory<?> singletonFactory) {
        Assert.notNull(beanName, "Bean name must not be null");
        // 全局加锁
        synchronized (this.singletonObjects) {
            // 从缓存中检查一遍
            // 因为 singleton 模式其实就是复用已经创建的 bean 所以这步骤必须检查
            Object singletonObject = this.singletonObjects.get(beanName);
            //  为空，开始加载过程
            if (singletonObject == null) {
                // 省略 部分代码

                // 加载前置处理
                beforeSingletonCreation(beanName);
                boolean newSingleton = false;
                // 省略代码
                try {
                    // 初始化 bean
                    // 这个过程其实是调用 createBean() 方法
                    singletonObject = singletonFactory.getObject();
                    newSingleton = true;
                }
                // 省略 catch 部分
                }
                finally {
                    // 后置处理
                    afterSingletonCreation(beanName);
                }
                // 加入缓存中
                if (newSingleton) {
                    addSingleton(beanName, singletonObject);
                }
            }
            // 直接返回
            return singletonObject;
        }
    }

```
其实这个过程并没有真正创建 bean，仅仅只是做了一部分准备和预处理步骤，真正获取单例 bean 的方法其实是由 singletonFactory.getObject() 这部分实现，而 singletonFactory 由回调方法产生。那么这个方法做了哪些准备呢？

- 再次检查缓存是否已经加载过，如果已经加载了则直接返回，否则开始加载过程。
- 调用 beforeSingletonCreation() 记录加载单例 bean 之前的加载状态，即前置处理。
- 调用参数传递的 ObjectFactory 的 getObject() 实例化 bean。
- 调用 afterSingletonCreation() 进行加载单例后的后置处理。
- 将结果记录并加入值缓存中，同时删除加载 bean 过程中所记录的一些辅助状态。
### 1.2 原型模式实例化
```java
				else if (mbd.isPrototype()) {
					Object prototypeInstance = null;
					try {
						beforePrototypeCreation(beanName);
						prototypeInstance = createBean(beanName, mbd, args);
					}
					finally {
						afterPrototypeCreation(beanName);
					}
					bean = getObjectForBeanInstance(prototypeInstance, name, beanName, mbd);
				}

```
原型模式的初始化过程很简单：直接创建一个新的实例就可以了。过程如下：

- 调用 beforeSingletonCreation() 记录加载原型模式 bean 之前的加载状态，即前置处理。
- 调用 createBean() 创建一个 bean 实例对象。
- 调用 afterSingletonCreation() 进行加载原型模式 bean 后的后置处理。
- 调用 getObjectForBeanInstance() 从 bean 实例中获取对象。
### 1.3 其他作用域
```java
String scopeName = mbd.getScope();
					final Scope scope = this.scopes.get(scopeName);
					if (scope == null) {
						throw new IllegalStateException("No Scope registered for scope name '" + scopeName + "'");
					}
					try {
						Object scopedInstance = scope.get(beanName, () -> {
							beforePrototypeCreation(beanName);
							try {
								return createBean(beanName, mbd, args);
							}
							finally {
								afterPrototypeCreation(beanName);
							}
						});
						bean = getObjectForBeanInstance(scopedInstance, name, beanName, mbd);
					}
					catch (IllegalStateException ex) {
						throw new BeanCreationException(beanName,
								"Scope '" + scopeName + "' is not active for the current thread; consider " +
								"defining a scoped proxy for this bean if you intend to refer to it from a singleton",
								ex);
					}

```
核心流程和原型模式一样，只不过获取 bean 实例是由 scope.get() 实现，核心实现原理我们下一章具体分析
## 1.9 类型转换
程序到这里返回 bean 后基本已经结束了，通常对该方法的调用参数 requiredType 是为空的。但是可能会存在这样一种情况：返回的 bean 是一个 String，但是 requiredType 却传入 Integer 类型，那么这时候本步骤就起作用了，它的功能是将返回的 bean 转换为 requiredType 所指定的类型。当然，String 转换为 Integer 是最简单的转换，在 Spring 中提供了各种各样的转换器，用户可以扩展转换器来满足需求。
```java
// Check if required type matches the type of the actual bean instance.
		if (requiredType != null && !requiredType.isInstance(bean)) {
			try {
				T convertedBean = getTypeConverter().convertIfNecessary(bean, requiredType);
				if (convertedBean == null) {
					throw new BeanNotOfRequiredTypeException(name, requiredType, bean.getClass());
				}
				return convertedBean;
			}
			catch (TypeMismatchException ex) {
				if (logger.isTraceEnabled()) {
					logger.trace("Failed to convert bean '" + name + "' to required type '" +
							ClassUtils.getQualifiedName(requiredType) + "'", ex);
				}
				throw new BeanNotOfRequiredTypeException(name, requiredType, bean.getClass());
			}
		}
		return (T) bean;
```

