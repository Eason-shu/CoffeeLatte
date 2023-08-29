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

- 官网：[Home](https://spring.io/)
- 参考书籍：[Spring源码深度解析-郝佳编著-微信读书](https://weread.qq.com/web/bookDetail/0e232b205b260a0e29f3fb5)

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
    	// 调用重载方法
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

上面的代码刚看可能有点蒙，下面我们来梳理一下大体的流程

-  ** 转换对应beanName**

或许很多人不理解转换对应beanName是什么意思，传入的参数name不就是beanName吗？其实不是，这里传入的参数可能是别名，也可能是FactoryBean，所以需要进行一系列的解析，这些解析内容包括如下内容。
去除FactoryBean的修饰符，也就是如果name="&aa"，那么会首先去除&而使name="aa"。
取指定alias所表示的最终beanName，例如别名A指向名称为B的bean则返回B；若别名A指向别名B，别名B又指向名称为C的bean则返回C。

- **尝试从缓存中加载单例**

单例在Spring的同一个容器内只会被创建一次，后续再获取bean，就直接从单例缓存中获取了。当然这里也只是尝试加载，首先尝试从缓存中加载，如果加载不成功则再次尝试从singletonFactories中加载。因为在创建单例bean的时候会存在依赖注入的情况，而在创建依赖的时候为了避免循环依赖，在Spring中创建bean的原则是不等bean创建完成就会将创建bean的ObjectFactory提早曝光加入到缓存中，一旦下一个bean创建时候需要依赖上一个bean则直接使用ObjectFactory

- **bean的实例化**

如果从缓存中得到了bean的原始状态，则需要对bean进行实例化。这里有必要强调一下，缓存中记录的只是最原始的bean状态，并不一定是我们最终想要的bean。举个例子，假如我们需要对工厂bean进行处理，那么这里得到的其实是工厂bean的初始状态，但是我们真正需要的是工厂bean中定义的factory-method方法中返回的bean，而getObjectForBeanInstance就是完成这个工作的，后续会详细讲解。

- **原型模式的依赖检查**

只有在单例情况下才会尝试解决循环依赖，如果存在A中有B的属性，B中有A的属性，那么当依赖注入的时候，就会产生当A还未创建完的时候因为对于B的创建再次返回创建A，造成循环依赖，也就是情况：isPrototypeCurrentlyInCreation(beanName)判断true。

- **检测parentBeanFactory**

从代码上看，如果缓存没有数据的话直接转到父类工厂上去加载了，这是为什么呢？可能读者忽略了一个很重要的判断条件：parentBeanFactory != null &&!containsBean Definition (beanName)，parentBeanFactory != null。parentBeanFactory如果为空，则其他一切都是浮云，这个没什么说的，但是!containsBeanDefinition(beanName)就比较重要了，它是在检测如果当前加载的XML配置文件中不包含beanName所对应的配置，就只能到parentBeanFactory去尝试下了，然后再去递归的调用getBean方法。

- **将存储XML配置文件的GernericBeanDefinition转换为RootBeanDefinition**

因为从XML配置文件中读取到的Bean信息是存储在GernericBeanDefinition中的，但是所有的Bean后续处理都是针对于RootBeanDefinition的，所以这里需要进行一个转换，转换的同时如果父类bean不为空的话，则会一并合并父类的属性。

- **寻找依赖**

因为bean的初始化过程中很可能会用到某些属性，而某些属性很可能是动态配置的，并且配置成依赖于其他的bean，那么这个时候就有必要先加载依赖的bean，所以，在Spring的加载顺寻中，在初始化某一个bean的时候首先会初始化这个bean所对应的依赖

- **针对不同的scope进行bean的创建**

在Spring中存在着不同的scope，其中默认的是singleton，但是还有些其他的配置诸如prototype、request之类的。在这个步骤中，Spring会根据不同的配置进行不同的初始化策略。

- **类型转换**

程序到这里返回bean后已经基本结束了，通常对该方法的调用参数requiredType是为空的，但是可能会存在这样的情况，返回的bean其实是个String，但是requiredType却传入Integer类型，那么这时候本步骤就会起作用了，它的功能是将返回的bean转换为requiredType所指定的类型。当然，String转换为Integer是最简单的一种转换，在Spring中提供了各种各样的转换器，用户也可以自己扩展转换器来满足需求。
这就是上面的代码的一个基本流程，看起来代码不多，其实代码十分复杂，我们接着往下看，根据上面的流程我们一一拆解

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

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693273586385-c3f15ccb-6c6d-4c3b-b9e7-878b95ef49dd.png#averageHue=%23282c33&clientId=u8680bc5d-e9ad-4&from=paste&height=420&id=u28914aca&originHeight=525&originWidth=1446&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=82200&status=done&style=none&taskId=u2f64fd8a-547e-4dd6-9f38-c35d848305a&title=&width=1156.8)
那什么时候会在beanName前显示的加上"&" 前缀？简单来说就是继承了FactoryBean，下面我们来看代码实战

> 说明

```java
package com.shu.model;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/8/29 9:47
 * @version: 1.0
 */
public class Car {
    private int maxSpeed;
    private String brand;
    private double price;

    public int getMaxSpeed() {
        return this.maxSpeed;
    }

    public void setMaxSpeed(int maxSpeed) {
        this.maxSpeed = maxSpeed;
    }

    public String getBrand() {
        return this.brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public double getPrice() {
        return this.price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
}


package com.shu.test;

import com.shu.model.Car;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.FactoryBean;
import org.springframework.beans.factory.FactoryBeanNotInitializedException;
import org.springframework.beans.factory.ListableBeanFactory;

/**
 * @description: FactoryBean接口的实现类，用于测试FactoryBean的使用
 * @author: shu
 * @createDate: 2023/8/29 9:47
 * @version: 1.0
 */
public class CarFactoryBean implements FactoryBean<Car>{
    private  String carInfo ;


    public  Car getObject ()   throws  Exception  {
        Car car =  new  Car () ;
        car.setBrand ( "红旗CA72" ) ;
        car.setMaxSpeed ( 200 ) ;
        car.setPrice ( 1000000 ) ;
        return  car;
    }

    public  Class<Car> getObjectType ()   {
        return  Car. class ;
    }

    public   boolean  isSingleton ()   {
        return   false ;
    }

    public  String getCarInfo ()   {
        return   this . carInfo ;
    }



}

```

而我们的配置文件中

```java
<bean name="car" class="com.shu.test.CarFactoryBean" />
```

```java
/**
     * 测试FactoryBean
     */
    @Test
    public void factoryBeanTest() {
        BeanFactory bf = new XmlBeanFactory( new ClassPathResource("applicationContext.xml"));
        Object car = bf.getBean("&car");
        System.out.println(car);

    }
```

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693275228443-48d6bd78-38d0-4a8b-91ef-3f0c89c8f6d9.png#averageHue=%23292c31&clientId=u8680bc5d-e9ad-4&from=paste&height=288&id=u5407ba52&originHeight=360&originWidth=1823&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=117610&status=done&style=none&taskId=uc4f5298a-3d09-47c9-826a-617a4089a88&title=&width=1458.4)
当调用getBean("car")时，Spring通过反射机制发现CarFactoryBean实现了FactoryBean的接口，这时Spring容器就调用接口方法CarFactoryBean#getObject()方法返回。如果希望获取CarFactoryBean的实例，则需要在使用getBean(beanName)方法时在beanName前显示的加上"&" 前缀，请注意有&符号和没有&符号获取的对象不一样
最后一步，转换别名，我们的bean实例可能会有多个别名

```java
// 转换 aliasName
	public String canonicalName(String name) {
		String canonicalName = name;
		// Handle aliasing...
		String resolvedName;
		do {
			resolvedName = this.aliasMap.get(canonicalName);
			if (resolvedName != null) {
				canonicalName = resolvedName;
			}
		}
		while (resolvedName != null);
		return canonicalName;
	}

```

**总结一下：**

- **去除 FactoryBean 的修饰符。如果 name 以 “&” 为前缀，那么会去掉该 “&”**
- **指定的 alias 所表示的最终 beanName。主要是一个循环获取 beanName 的过程，例如别名 A 指向名称为 B 的 bean 则返回 B，若 别名 A 指向别名 B，别名 B 指向名称为 C 的 bean，则返回 C。**

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

首先我们理清关系：

- **singletonObjects：用于保存BeanName和创建bean实例之间的关系，bean name --> bean instance。**
- **singletonFactories：用于保存BeanName和创建bean的工厂之间的关系，bean name ->ObjectFactory。**
- ** earlySingletonObjects：也是保存BeanName和创建bean实例之间的关系，与singletonObjects的不同之处在于，当一个单例bean被放到这里面后，那么当bean还在创建过程中，就可以通过getBean方法获取到了，其目的是用来检测循环引用。**
- ** registeredSingletons：用来保存当前所有已注册的bean。**

我们可以看到关键的方法在于getSingleton，下面我们仔细来看看

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

**我们梳理一下过程：**

- **这个方法首先尝试从singletonObjects里面获取实例**
- **如果获取不到再从earlySingleton Objects里面获取**
- **如果还获取不到，再尝试从singletonFactories里面获取beanName对应的ObjectFactory**
- **然后调用这个ObjectFactory的getObject来创建bean，并放到earlySingleton Objects里面去**
- **并且从singletonFacotories里面remove掉这个ObjectFactory，而对于后续的所有内存操作都只为了循环依赖检测时候使用，也就是在allowEarlyReference为true的情况下才会使用。**

## 1.3 bean的实例化

如果我们其他地方使用了该Bean，然后我们再次获取该Bean就会发现它尝试从缓存中加载
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693276495479-ceefc703-697f-4831-9bcc-1f472482e57e.png#averageHue=%23212327&clientId=u8680bc5d-e9ad-4&from=paste&height=268&id=u221aed3c&originHeight=335&originWidth=1129&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=63748&status=done&style=none&taskId=uf6572225-51dc-42d2-a1d8-140b07b232d&title=&width=903.2)
接着上面我们如果从缓存中加载到了单例对象，下面就是bean的实例化，从上面的代码来看我们无论从singletonObjects还是ObjectFactory中加载的单例对象都是原始对象，所以要进行bean的实例化
:::warning
请注意下面的逻辑是正对实现了FactoryBean接口的bean，且缓存中存在，也就是说第二次使用
:::

```java
bean = getObjectForBeanInstance(sharedInstance, name, beanName, null);
```

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693276659472-e2585a80-fcec-4527-a03c-c8c1c009ea91.png#averageHue=%23282c33&clientId=u8680bc5d-e9ad-4&from=paste&height=360&id=u499850c9&originHeight=450&originWidth=1163&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=43302&status=done&style=none&taskId=uebac6c1b-5af6-4e02-994d-98164fdb6a0&title=&width=930.4)

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

情况一：正常的bean
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693276847610-60cdb5d0-a076-41c6-9df7-6deffc4bcca3.png#averageHue=%2322252b&clientId=u8680bc5d-e9ad-4&from=paste&height=573&id=u0e4fe33a&originHeight=716&originWidth=1291&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=141760&status=done&style=none&taskId=u7647ca8f-793e-4e19-9617-0837fdb12d2&title=&width=1032.8)
情况二：FactoryBean
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693277094077-f2313d29-23b5-4aa1-a833-306573c4344a.png#averageHue=%23282b30&clientId=u8680bc5d-e9ad-4&from=paste&height=659&id=u4e290d8b&originHeight=824&originWidth=1577&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=140634&status=done&style=none&taskId=ud27881ec-f260-468b-8863-55f283eeafa&title=&width=1261.6)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693277227872-f0994e46-035e-4183-9596-3f8f0b2a5cc2.png#averageHue=%23282c32&clientId=u8680bc5d-e9ad-4&from=paste&height=722&id=u98cfe748&originHeight=902&originWidth=1531&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=149702&status=done&style=none&taskId=u28fa0803-4eb4-42b9-b502-266e4926b96&title=&width=1224.8)
流程梳理：

- 对FactoryBean正确性的验证
- 对非FactoryBean不做任何处理
- 尝试从缓存中加载Bean，如果有直接换行，存储XML配置文件的GernericBeanDefinition转换为RootBeanDefinition后面会详细解释
- 缓存中有的话，交给getObjectFromFactoryBean方法进行处理，去执行FactoryBean接口实现类的getObject()也就是CarFactoryBean中的getObject方法

```java
	protected Object getObjectFromFactoryBean(FactoryBean<?> factory, String beanName, boolean shouldPostProcess) {
		// 判断是否是单例模式 && singletonObjects 尚未缓存该bean （containsSingleton调用的是 singletonObjects ）
		if (factory.isSingleton() && containsSingleton(beanName)) {
			synchronized (getSingletonMutex()) {
				// 尝试从 factoryBeanObjectCache 缓存中获取
				Object object = this.factoryBeanObjectCache.get(beanName);
				if (object == null) {
					// 在这个方法中进行解析。调用 FactoryBean 的 getObject 方法
					object = doGetObjectFromFactoryBean(factory, beanName);

					// 因为是单例模式，所以要保证变量的全局唯一。所以这里如果缓存中已经创建好了bean则替换为已经创建好的bean
					Object alreadyThere = this.factoryBeanObjectCache.get(beanName);
					if (alreadyThere != null) {
						object = alreadyThere;
					}
					else {
						// 如果允许调用bean的后置处理器。因为这里是直接将bean创建返回了，如果要调用后置方法则只能在这里调用。
						if (shouldPostProcess) {
							if (isSingletonCurrentlyInCreation(beanName)) {
								// Temporarily return non-post-processed object, not storing it yet..
								return object;
							}
							// 将beanName 添加到 singletonsCurrentlyInCreation 中缓存，表示当前bean正在创建中
							beforeSingletonCreation(beanName);
							try {
								// 调用了ObjectFactory的后置处理器。
								object = postProcessObjectFromFactoryBean(object, beanName);
							}
							catch (Throwable ex) {
								throw new BeanCreationException(beanName,
										"Post-processing of FactoryBean's singleton object failed", ex);
							}
							finally {
							// 将beanName 从 singletonsCurrentlyInCreation 中移除，表示当前bean已经创建结束
								afterSingletonCreation(beanName);
							}
						}
						// return this.singletonObjects.containsKey(beanName); 如果 singletonObjects缓存中存在当前beanName，则将其缓存到 factoryBeanObjectCache 中。
						if (containsSingleton(beanName)) {
							// 这里保存的是 beanName : FactoryBean
							this.factoryBeanObjectCache.put(beanName, object);
						}
					}
				}
				return object;
			}
		}
		else {
			// FactoryBean 非单例直接调用 getObject 方法
			Object object = doGetObjectFromFactoryBean(factory, beanName);
			// 如果允许调用后置方法，则调用postProcessObjectFromFactoryBean 方法
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

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693277950449-f0882e70-cd16-474d-8797-35bebd210ccf.png#averageHue=%23282c33&clientId=u8680bc5d-e9ad-4&from=paste&height=510&id=u3d6318d2&originHeight=638&originWidth=1416&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=86162&status=done&style=none&taskId=u5a6fc6aa-d3ee-4949-b844-7c7468cddaa&title=&width=1132.8)
下面我们来看看关键的核心方法doGetObjectFromFactoryBean，也就是上面CarFactoryBean实现的核心逻辑

```java
private Object doGetObjectFromFactoryBean(FactoryBean<?> factory, String beanName) throws BeanCreationException {
    Object object;
    try {
        // 权限访问
        if (System.getSecurityManager() != null) {
            AccessControlContext acc = this.getAccessControlContext();
            try {
                object = AccessController.doPrivileged(factory::getObject, acc);
            } catch (PrivilegedActionException var6) {
                throw var6.getException();
            }
        } else {
            // 自己的实现类去加载对象
            object = factory.getObject();
        }
    } catch (FactoryBeanNotInitializedException var7) {
        throw new BeanCurrentlyInCreationException(beanName, var7.toString());
    } catch (Throwable var8) {
        throw new BeanCreationException(beanName, "FactoryBean threw exception on object creation", var8);
    }

    if (object == null) {
        if (this.isSingletonCurrentlyInCreation(beanName)) {
            throw new BeanCurrentlyInCreationException(beanName, "FactoryBean which is currently in creation returned null from getObject");
        }

        object = new NullBean();
    }

    return object;
}
```

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693278286285-7e088951-4d9b-4f82-98b9-850a7bf4e058.png#averageHue=%2326292f&clientId=u8680bc5d-e9ad-4&from=paste&height=710&id=u066eda94&originHeight=888&originWidth=1720&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=151056&status=done&style=none&taskId=u6ec50e1a-2d64-4bc7-a5d5-155a16867f7&title=&width=1376)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693278303739-9c39e131-726d-4eb4-892f-a011c2db6d01.png#averageHue=%2327292e&clientId=u8680bc5d-e9ad-4&from=paste&height=824&id=u5392da4a&originHeight=1030&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=182141&status=done&style=none&taskId=u34b0e543-752f-4865-9a48-315234a4cc9&title=&width=1536)
我们简单梳理一下上面的代码逻辑：我们的目的从工厂中加载对象，让后在调用后置处理器，在实际开发过程中可以针对进行自己的业务逻辑设计
**我们来总结一下：**

- **我们尝试从缓存中加载实例对象，一般第一次使用肯定没有的，那就第二次使用的时候**
- **由于我们从缓存中尝试加载的对象是原始对象，因此我们需要实例化它**
- **但是实例化的时候分为正常情况的Bean与实现了FactoryBean接口的Bean**
- **正常情况下的Bean直接返回，复杂情况的Bean需要调用我们自己实现了FactoryBean接口的getObject方法来实例它**

## 1.4 原型模式的依赖检查

之前我们讲解了从缓存中获取单例的过程，上面的逻辑是正对缓存中不为空的情况，下面我们来看那可能缓存如果为空咋办，那就是第一次进行初始化呗，我们接着往下看？
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

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693280046413-6ad19cba-bd07-450d-94e1-b153bbcaee08.png#averageHue=%232a2e34&clientId=u8680bc5d-e9ad-4&from=paste&height=824&id=uddd494d7&originHeight=1030&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=308410&status=done&style=none&taskId=udcb212bd-0371-4b26-8a95-6cfc6a0c8c9&title=&width=1536)
**_总结一下：_**

- **_对于单例模式 Spring 在创建 bean 的时候并不是等 bean 完全创建完成后才会将 bean 添加至缓存中，而是不等 bean 创建完成就会将创建 bean 的 ObjectFactory 提早加入到缓存中，这样一旦下一个 bean 创建的时候需要依赖 bean 时则直接使用 ObjectFactroy。_**
- **_但是原型模式我们知道是没法使用缓存的，所以 Spring 对原型模式的循环依赖处理策略则是不处理_**

## 1.5 检测parentBeanFactory

若 containsBeanDefinition 中不存在 beanName 相对应的 BeanDefinition，则从 parentBeanFactory 中获取。
**AbstractBeanFactory**

```java
//AbstractBeanFactory.java

// 获取父容器
BeanFactory parentBeanFactory = getParentBeanFactory();
// 检查父容器
if (parentBeanFactory != null && !containsBeanDefinition(beanName)) {
    // 获取原始 beanName
    String nameToLookup = originalBeanName(name);
    // 如果，父类容器为 AbstractBeanFactory ，直接递归查找
    if (parentBeanFactory instanceof AbstractBeanFactory) {
        return ((AbstractBeanFactory)parentBeanFactory).doGetBean(nameToLookup, requiredType, args, typeCheckOnly);
        // 用明确的 args 从 parentBeanFactory 中，获取 Bean 对象
    } else if (args != null) {
        return (T)parentBeanFactory.getBean(nameToLookup, args);
        // 用明确的 requiredType 从 parentBeanFactory 中，获取 Bean 对象
    } else if (requiredType != null) {
        return parentBeanFactory.getBean(nameToLookup, requiredType);
        // 直接使用 nameToLookup 从 parentBeanFactory 获取 Bean 对象
    } else {
        return (T)parentBeanFactory.getBean(nameToLookup);
    }
}
```

获取父容器
**AbstractBeanFactory**

```java
//AbstractBeanFactory.java

private BeanFactory parentBeanFactory;

@Override
public BeanFactory getParentBeanFactory() {
    return this.parentBeanFactory;
}
```

若父容器不为空，并且 beanDefinitionMap 中没有找到对应的 BeanDefinition 对象
**DefaultListableBeanFactory**

```java
//DefaultListableBeanFactory.java

private final Map<String, BeanDefinition> beanDefinitionMap = new ConcurrentHashMap<>(256);

@Override
public boolean containsBeanDefinition(String beanName) {
	Assert.notNull(beanName, "Bean name must not be null");
	return this.beanDefinitionMap.containsKey(beanName);
}
```

获取原始 beanName
**AbstractBeanFactory**

```java
//AbstractBeanFactory.java

protected String originalBeanName(String name) {
    String beanName = transformedBeanName(name); // <x>
    if (name.startsWith(FACTORY_BEAN_PREFIX)) { // <y>
        beanName = FACTORY_BEAN_PREFIX + beanName;
    }
    return beanName;
}
```

- <x> 处，AbstractBeanFactory#transformedBeanName(String name) 方法，是对 name 进行转换，获取真正的 beanName。参考前面转换对应的Bean
- <y> 处，如果 name 是以 "&" 开头的，则加上 "&"  ，因为在AbstractBeanFactory#transformedBeanName(String name) 方法中把  "&"  去掉，这边需要补上

委托父容器加载 Bean 的逻辑
**AbstractBeanFactory**

```java
// 如果，父类容器为 AbstractBeanFactory ，直接递归查找
if (parentBeanFactory instanceof AbstractBeanFactory) {
    return ((AbstractBeanFactory)parentBeanFactory).doGetBean(nameToLookup, requiredType, args, typeCheckOnly);
    // 用明确的 args 从 parentBeanFactory 中，获取 Bean 对象
} else if (args != null) {
    return (T)parentBeanFactory.getBean(nameToLookup, args);
    // 用明确的 requiredType 从 parentBeanFactory 中，获取 Bean 对象
} else if (requiredType != null) {
    return parentBeanFactory.getBean(nameToLookup, requiredType);
    // 直接使用 nameToLookup 从 parentBeanFactory 获取 Bean 对象
} else {
    return (T)parentBeanFactory.getBean(nameToLookup);
}
```

## 1.6 将存储XML配置文件的GernericBeanDefinition转换为RootBeanDefinition

参考博客：[Spring中BeanDefinition的合并getMergedLocalBeanDefinition](https://blog.csdn.net/ystyaoshengting/article/details/122719594)
在GenericBeanDefinition，ChildBeanDefinition中有一个parentName属性，表示该BeanDefinition的父BeanDefinition，如果该bean在定义中设置了parentName，那么在实例化之前会进行这两个BeanDefinition的合并。
获取 RootBeanDefinition
**AbstractBeanFactory**

```java
//AbstractBeanFactory.java

// 从容器中获取 beanName 相应的 GenericBeanDefinition 对象，并将其转换为 RootBeanDefinition 对象
final RootBeanDefinition mbd = getMergedLocalBeanDefinition(beanName);
// 检查给定的合并的 BeanDefinition
checkMergedBeanDefinition(mbd, beanName, args);
```

接着获取RootBeanDefinition对象

```java
	 //返回一个合并的 RootBeanDefinition，如果该bean定义是一个子bean定义，则遍历父bean定义
	protected RootBeanDefinition getMergedLocalBeanDefinition(String beanName) throws BeansException {
		//先从mergedBeanDefinitions容器中取
		//如果有，表示该bean定义已经合并过了，则就直接返回；如果没有，则进行合并
		RootBeanDefinition mbd = this.mergedBeanDefinitions.get(beanName);
		if (mbd != null) {
			return mbd;
		}
        // // 如果返回的 BeanDefinition 是子类 bean 的话，则合并父类相关属性
		return getMergedBeanDefinition(beanName, getBeanDefinition(beanName));
	}
```

- 如果 mergedBeanDefinitions 缓存中存在对应的 RootBeanDefinition 对象，则直接返回。
- 否则调用AbstractBeanFactory#getMergedBeanDefinition(String beanName, BeanDefinition bd)获取 RootBeanDefinition 对象
  - 通过 AbstractBeanFactory#getBeanDefinition(String beanName) 获取 BeanDefinition 对象，如果没有找到就抛出 NoSuchBeanDefinitionException 异常。

```java

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

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693286164157-abcc9fc6-3308-4e07-adc1-08605c6eef80.png#averageHue=%2326282c&clientId=u8680bc5d-e9ad-4&from=paste&height=647&id=u3cbc7233&originHeight=809&originWidth=1535&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=160048&status=done&style=none&taskId=uf67ec551-9d3b-4a33-94fe-7c1b564db0c&title=&width=1228)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693286223388-4ac7aa34-6bc5-46c4-acdc-77d437386ceb.png#averageHue=%23282b30&clientId=u8680bc5d-e9ad-4&from=paste&height=678&id=u2746f85b&originHeight=848&originWidth=1462&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=144311&status=done&style=none&taskId=u4a400002-3234-47ff-84f9-dc9ab44df7d&title=&width=1169.6)
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

在spring中有一个@DependsOn注解，它的作用是依赖加载，比如A对象要在B对象加载之后才能加载，那么可以在A上面加@DependsOn(value = "B")注解，就可以达到我们的要求。

- 通过我们前面从IoC容器中拿到的BeanDefinition，调用mbd.getDependsOn()方法，获取当前bean所有的依赖。

```java
	@Override
	@Nullable
	public String[] getDependsOn() {
		return this.dependsOn;
	}
```

- 遍历这些依赖，判断此依赖是否已注册给当前的Bean

```java
	// 保存的是bean与其依赖的映射关系：B - > A
	private final Map<String, Set<String>> dependentBeanMap = new ConcurrentHashMap<>(64);

        //保存的是bean与其依赖的映射关系：A - > B
	private final Map<String, Set<String>> dependenciesForBeanMap = new ConcurrentHashMap<>(64);

	//为指定的Bean注入依赖的Bean
	public void registerDependentBean(String beanName, String dependentBeanName) {
	// A quick check for an existing entry upfront, avoiding synchronization...
	//获取原始beanName
	String canonicalName = canonicalName(beanName);
	Set<String> dependentBeans = this.dependentBeanMap.get(canonicalName);
	if (dependentBeans != null && dependentBeans.contains(dependentBeanName)) {
		return;
	}

	// No entry yet -> fully synchronized manipulation of the dependentBeans Set
	//先从容器中：bean名称-->全部依赖Bean名称集合找查找给定名称Bean的依赖Bean
	synchronized (this.dependentBeanMap) {
		//获取给定名称Bean的所有依赖Bean名称
		dependentBeans = this.dependentBeanMap.get(canonicalName);
		if (dependentBeans == null) {
			//为Bean设置依赖Bean信息
			dependentBeans = new LinkedHashSet<>(8);
			this.dependentBeanMap.put(canonicalName, dependentBeans);
		}
		//把映射关系存入集合
		dependentBeans.add(dependentBeanName);
	}
	//从容器中：bean名称-->指定名称Bean的依赖Bean集合找查找给定名称Bean的依赖Bean
	synchronized (this.dependenciesForBeanMap) {
		Set<String> dependenciesForBean = this.dependenciesForBeanMap.get(dependentBeanName);
		if (dependenciesForBean == null) {
			dependenciesForBean = new LinkedHashSet<>(8);
			this.dependenciesForBeanMap.put(dependentBeanName, dependenciesForBean);
		}
		//把映射关系存入集合
		dependenciesForBean.add(canonicalName);
	}
	}

```

套用上面的例子，如果 **A**@DependsOn(value = "B") ，也就是说A依赖于B，那么该方法registerDependentBean(dep, beanName)中，参数 dep 就是B，beanName 就是A。
这段代码中其实就是把bean之间的依赖关系注册到两个map中。

- dependentBeanMap 存入(B,A)
- dependenciesForBeanMap 存入(A,B)
- 递归调用getBean()，先生成依赖的bean

```java
try {
							getBean(dep);
						}
						catch (NoSuchBeanDefinitionException ex) {
							throw new BeanCreationException(mbd.getResourceDescription(), beanName,
									"'" + beanName + "' depends on missing bean '" + dep + "'", ex);
						}
```

**_总结一下：_**

- **_通过我们前面从IoC容器中拿到的__BeanDefinition__，调用__mbd.getDependsOn()__方法，获取当前bean所有的依赖。_**
- **_遍历这些依赖，判断此依赖是否已注册给当前的Bean_**
- **_递归调用getBean()，先生成依赖的bean_**

## 1.8 针对不同的scope进行bean的创建

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

其实这个过程并没有真正创建 bean，仅仅只是做了一部分准备和预处理步骤，真正获取单例 bean 的方法其实是由 singletonFactory.getObject() 这部分实现，而 singletonFactory 由回调方法产生。那么这个方法做了哪些准备呢？关键代码在于 **createBean(beanName, mbd, args)，后面文章详细介绍**
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693287446302-9913bbe8-dfbf-4391-868b-ed15db43ef20.png#averageHue=%23282b30&clientId=u8680bc5d-e9ad-4&from=paste&height=824&id=uc4d40feb&originHeight=1030&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=324328&status=done&style=none&taskId=u6292dc6c-d662-46c4-b04b-4ffe51adf85&title=&width=1536)
**_总结一下_**

- **_再次检查缓存是否已经加载过，如果已经加载了则直接返回，否则开始加载过程。_**
- **_调用 beforeSingletonCreation() 记录加载单例 bean 之前的加载状态，即前置处理。_**
- **_调用参数传递的 ObjectFactory 的 getObject() 实例化 bean。_**
- **_调用 afterSingletonCreation() 进行加载单例后的后置处理。_**
- **_将结果记录并加入值缓存中，同时删除加载 bean 过程中所记录的一些辅助状态。_**

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

原型模式的初始化过程很简单：直接创建一个新的实例就可以了。
**_过程如下：_**

- **_调用 beforeSingletonCreation() 记录加载原型模式 bean 之前的加载状态，即前置处理。_**
- **_调用 createBean() 创建一个 bean 实例对象。_**
- **_调用 afterSingletonCreation() 进行加载原型模式 bean 后的后置处理。_**
- **_调用 getObjectForBeanInstance() 从 bean 实例中获取对象。_**

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

程序到这里返回 bean 后基本已经结束了，通常对该方法的调用参数 requiredType 是为空的。
但是可能会存在这样一种情况：返回的 bean 是一个 String，但是 requiredType 却传入 Integer 类型，那么这时候本步骤就起作用了，它的功能是将返回的 bean 转换为 requiredType 所指定的类型。
当然，String 转换为 Integer 是最简单的转换，在 Spring 中提供了各种各样的转换器，用户可以扩展转换器来满足需求。

```java
// Check if required type matches the type of the actual bean instance.
	//对创建的Bean实例对象进行类型检查
	if (requiredType != null && !requiredType.isInstance(bean)) {
	try {
	        //执行转换
		T convertedBean = getTypeConverter().convertIfNecessary(bean, requiredType);
		// 转换失败，抛异常
		if (convertedBean == null) {
			throw new BeanNotOfRequiredTypeException(name, requiredType, bean.getClass());
		}
		return convertedBean;
	}
	catch (TypeMismatchException ex) {
		if (logger.isDebugEnabled()) {
			logger.debug("Failed to convert bean '" + name + "' to required type '" +
					ClassUtils.getQualifiedName(requiredType) + "'", ex);
		}
		throw new BeanNotOfRequiredTypeException(name, requiredType, bean.getClass());
	}
	}
	return (T) bean;

```

