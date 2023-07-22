---

title: Spring的生命周期
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
last_update:
  date: 2023-07-22 23:00:00
  author: EasonShu

---
# Spring的生命周期
Spring作为当前Java最流行、最强大的轻量级框架，受到了程序员的热烈欢迎。准确的了解Spring Bean的生命周期是非常必要的。我们通常使用ApplicationContext作为Spring容器。这里，我们讲的也是 ApplicationContext中Bean的生命周期。而实际上BeanFactory也是差不多的，只不过处理器需要手动注册。
## 1 完整生命周期图
![file](images\life.png)

从上图可以看出，Spring Bean的生命周期管理的基本思路是：在Bean出现之前，先准备操作Bean的BeanFactory，然后操作完Bean，所有的Bean也还会交给BeanFactory进行管理。在所有Bean操作准备BeanPostProcessor作为回调。在Bean的完整生命周期管理过程中，经历了以下主要几个步骤：

### 1.1 Bean创建前的准备阶段

步骤1： Bean容器在配置文件中找到Spring Bean的定义以及相关的配置，如init-method和destroy-method指定的方法。 步骤2： 实例化回调相关的后置处理器如BeanFactoryPostProcessor、BeanPostProcessor、InstantiationAwareBeanPostProcessor等

### 1.2 创建Bean的实例

步骤3： Srping 容器使用Java反射API创建Bean的实例。 步骤4：扫描Bean声明的属性并解析。

### 1.3 开始依赖注入

步骤5：开始依赖注入，解析所有需要赋值的属性并赋值。 步骤6：如果Bean类实现BeanNameAware接口，则将通过传递Bean的名称来调用setBeanName()方法。 步骤7：如果Bean类实现BeanFactoryAware接口，则将通过传递BeanFactory对象的实例来调用setBeanFactory()方法。 步骤8：如果有任何与BeanFactory关联的BeanPostProcessors对象已加载Bean，则将在设置Bean属性之前调用postProcessBeforeInitialization()方法。 步骤9：如果Bean类实现了InitializingBean接口，则在设置了配置文件中定义的所有Bean属性后，将调用afterPropertiesSet()方法。

### 1.4 缓存到Spring容器

步骤10： 如果配置文件中的Bean定义包含init-method属性，则该属性的值将解析为Bean类中的方法名称，并将调用该方法。 步骤11：如果为Bean Factory对象附加了任何Bean 后置处理器，则将调用postProcessAfterInitialization()方法。

### 1.5 销毁Bean的实例

步骤12：如果Bean类实现DisposableBean接口，则当Application不再需要Bean引用时，将调用destroy()方法。 步骤13：如果配置文件中的Bean定义包含destroy-method属性，那么将调用Bean类中的相应方法定义



作者：Tom弹架构
链接：https://juejin.cn/post/7039202232985714695
来源：稀土掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

## 2 案例

### 2.1 1 简单的Bean

首先是一个简单的Bean，调用Bean自身的方法和Bean级生命周期接口方法，为了方便演示，它实现了BeanNameAware、BeanFactoryAware、InitializingBean和DiposableBean这4个接口，同时添加2个init-method和destory-method方法，对应配置文件中的init-method和destroy-method。

```java
package com.shu;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.*;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/22 11:26
 * @version: 1.0
 */

public class Person implements BeanFactoryAware, BeanNameAware,
        InitializingBean, DisposableBean {

    private String name;
    private String address;
    private int phone;

    private BeanFactory beanFactory;
    private String beanName;

    public Person() {
        System.out.println("-----------------调用Person的构造器实例化----------------------");
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        System.out.println("【注入属性】注入属性name");
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        System.out.println("【注入属性】注入属性address");
        this.address = address;
    }

    public int getPhone() {
        return phone;
    }

    public void setPhone(int phone) {
        System.out.println("【注入属性】注入属性phone");
        this.phone = phone;
    }

    @Override
    public String toString() {
        return "Person [address=" + address + ", name=" + name + ", phone="
                + phone + "]";
    }

    // 这是BeanFactoryAware接口方法
    @Override
    public void setBeanFactory(BeanFactory arg0) throws BeansException {
        System.out.println("-----------------调用BeanFactoryAware.setBeanFactory()----------------------");
        this.beanFactory = arg0;
    }

    // 这是BeanNameAware接口方法
    @Override
    public void setBeanName(String arg0) {
        System.out.println("-----------------调用BeanNameAware.setBeanName()----------------------");
        this.beanName = arg0;
    }

    // 这是InitializingBean接口方法
    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("-----------------调用InitializingBean.afterPropertiesSet()----------------------");
    }

    // 这是DiposibleBean接口方法
    @Override
    public void destroy() throws Exception {
        System.out.println("-----------------调用DiposibleBean.destory()----------------------");
    }

    // 通过<bean>的init-method属性指定的初始化方法
    public void myInit() {
        System.out.println("【init-method】调用<bean>的init-method属性指定的初始化方法");
    }

    // 通过<bean>的destroy-method属性指定的初始化方法
    public void myDestory() {
        System.out.println("【destroy-method】调用<bean>的destroy-method属性指定的初始化方法");
    }
}
```

配置文件

```xml
    <bean id="person" class="com.shu.Person" init-method="myInit"
          destroy-method="myDestory" scope="singleton" p:name="张三" p:address="广州"
          p:phone="15900000"/>
```

![image-20230722141600020](images\image-20230722141600020.png)

当然我们首先要知道我们实现这几个接口的作用

- `BeanFactoryAware`：通过实现 BeanFactoryAware 接口，Bean 可以在运行时与 Spring 容器进行交互，例如获取其他 Bean 的引用、获取 Bean 的属性值等。这在某些特定的情况下可能是有用的，但通常应该避免在 Bean 中过度依赖容器，以保持代码的松耦合性和可移植性。

我们以上面的为案例加入在我的容器还存在一个Dog实例，我想获取他的属性，该咋写？

```java
package com.shu;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/22 14:23
 * @version: 1.0
 */
public class Dog {
    private String name;
    private String color;
    private int age;

    public Dog() {
        System.out.println("-----------------调用Dog的构造器实例化----------------------");
    }

    public Dog(String name, String color, int age) {
        System.out.println("-----------------调用Dog的构造器实例化----------------------");
        this.name = name;
        this.color = color;
        this.age = age;
    }


    @Override
    public String toString() {
        final StringBuffer sb = new StringBuffer("Dog{");
        sb.append("name='").append(name).append('\'');
        sb.append(", color='").append(color).append('\'');
        sb.append(", age=").append(age);
        sb.append('}');
        return sb.toString();
    }
}

```

```java

    // 这是BeanFactoryAware接口方法
    @Override
    public void setBeanFactory(BeanFactory arg0) throws BeansException {
        System.out.println("-----------------调用BeanFactoryAware.setBeanFactory()----------------------");
        Dog dog = (Dog) arg0.getBean("dog");
        System.out.println("dog = " + dog);
        this.beanFactory = arg0;
    }

```

![image-20230722142844666](images\image-20230722142844666.png)

- `BeanNameAware`：BeanNameAware 接口的作用是允许实现了该接口的 Bean 获取其在 Spring 容器中注册的名字（即 Bean 的 ID 或名称）。通过实现 BeanNameAware 接口，Bean 可以了解自己在容器中的标识，从而在需要的情况下对自身进行更多的定制和处理。

- `InitializingBean`：`InitializingBean` 接口是 Spring 框架中的一个回调接口，允许实现了该接口的 Bean 在实例化后进行一些初始化操作，当 Spring 容器创建一个 Bean 并设置了所有的属性后，如果这个 Bean 实现了 `InitializingBean` 接口，那么在初始化阶段，容器会调用该接口的 `afterPropertiesSet()` 方法，从而允许 Bean 执行特定的初始化逻辑。
- `DisposableBean`: `DisposableBean` 接口是 Spring 框架中的一个回调接口，允许实现了该接口的 Bean 在销毁时执行一些清理操作。当 Spring 容器关闭或销毁一个 Bean 时，如果这个 Bean 实现了 `DisposableBean` 接口，那么在销毁阶段，容器会调用该接口的 `destroy()` 方法，从而允许 Bean 执行特定的清理逻辑。

### 2.1.2 BeanFactoryPostProcessor

`BeanFactoryPostProcessor` 是 Spring 框架中的一个扩展接口，它允许在 Spring 容器实例化 Bean 之前对 Bean 的定义进行修改或自定义。通过实现 `BeanFactoryPostProcessor` 接口，开发者可以在容器实例化 Bean 之前干预 Bean 的创建过程，例如修改 Bean 的属性、添加新的 Bean 定义、移除 Bean 定义等。

当 Spring 容器加载了 Bean 的定义，但尚未实例化任何 Bean 时，会自动调用所有实现了 `BeanFactoryPostProcessor` 接口的类的 `postProcessBeanFactory` 方法。通过这个方法，开发者可以获取到 Spring 容器的 BeanFactory，并对其进行任何必要的更改。

需要注意的是，`BeanFactoryPostProcessor` 的执行是在 Spring 容器加载 Bean 的定义之后，实例化 Bean 之前。因此，这个阶段只能对 Bean 的定义进行修改，而不能对 Bean 实例本身进行操作。如果需要在 Bean 实例化后对 Bean 进行处理，可以使用其他的回调接口，如 `BeanPostProcessor`。

```java
package com.shu;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/22 12:29
 * @version: 1.0
 */


import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;

public class MyBeanFactoryPostProcessor implements BeanFactoryPostProcessor {

    public MyBeanFactoryPostProcessor() {
        super();
        System.out.println("-----------------这是BeanFactoryPostProcessor实现类构造器！！--------------");
    }

    /**
     * 在标准初始化后修改应用程序上下文的内部 Bean 工厂。
     * 所有 Bean 定义都将被加载，但尚未实例化任何 bean。
     * @param arg0 the bean factory used by the application context
     * @throws BeansException
     */
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory arg0)
            throws BeansException {
        System.out.println("----------------这里我们可以修改bean的定义属性---------------------");
        BeanDefinition bd = arg0.getBeanDefinition("person");
        bd.getPropertyValues().addPropertyValue("phone", "110");
        BeanDefinition dog = arg0.getBeanDefinition("dog");
        dog.getPropertyValues().addPropertyValue("name", "小花");
    }

}
```

![image-20230722145354010](images\image-20230722145354010.png)

### 2.1.3 BeanPostProcessor

`BeanPostProcessor` 接口是 Spring 框架中的一个扩展接口，它允许在 Spring 容器实例化 Bean 后对 Bean 进行一些自定义的处理和操作。通过实现 `BeanPostProcessor` 接口，开发者可以在 Bean 实例化过程中，对 Bean 进行一些自定义逻辑，例如初始化前后的处理、属性设置、代理创建等。

当 Spring 容器创建一个 Bean 后，但在 Bean 的初始化回调方法（如 `@PostConstruct` 或实现 `InitializingBean` 接口的 `afterPropertiesSet()` 方法）之前，会调用 `postProcessBeforeInitialization` 方法。在这个方法中，开发者可以对 Bean 进行一些前置处理。

接着，在 Bean 的初始化回调方法执行完成后，Spring 容器会调用 `postProcessAfterInitialization` 方法，允许开发者对 Bean 进行一些后置处理。

需要注意的是，`BeanPostProcessor` 可以用于在 Bean 初始化前后进行一些非常细粒度的处理，但同时应该注意避免在这个过程中对 Bean 进行过多的修改，以免影响 Spring 容器的正常运行。

BeanPostProcessor接口中主要有两个方法：

| 方法名                          | 解释                                                         |
| ------------------------------- | ------------------------------------------------------------ |
| postProcessBeforeInitialization | 在Bean实例化回调（例如InitializingBean的afterPropertiesSet 或者一个定制的init-method）之前应用此BeanPostProcessor |
| postProcessAfterInitialization  | 在bean实例化回调（例如InitializingBean的afterPropertiesSet 或者一个定制的init-method）之后应用此BeanPostProcessor |



作者：Tom弹架构
链接：https://juejin.cn/post/7039202232985714695
来源：稀土掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

```java
package com.shu;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/22 12:13
 * @version: 1.0
 */

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;

public class MyBeanPostProcessor implements BeanPostProcessor {

    public MyBeanPostProcessor() {
        super();
        System.out.println("----------------这是BeanPostProcessor实现类构造器！---------------------");
    }

    /**
     * 在bean的初始化方法调用前执行
     * @param arg0 the new bean instance
     * @param arg1 the name of the bean
     * @return
     * @throws BeansException
     */
    @Override
    public Object postProcessAfterInitialization(Object arg0, String arg1)
            throws BeansException {
        System.out.println("----------------这是BeanPostProcessor接口方法postProcessAfterInitialization对属性进行更改！---------------------");

        return arg0;
    }

    /**
     * 在bean的初始化方法调用后执行
     * @param arg0 the new bean instance
     * @param arg1 the name of the bean
     * @return
     * @throws BeansException
     */
    @Override
    public Object postProcessBeforeInitialization(Object arg0, String arg1)
            throws BeansException {
        System.out.println("----------------这是BeanPostProcessor接口方法postProcessBeforeInitialization对属性进行更改！---------------------");
        return arg0;
    }
}
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:p="http://www.springframework.org/schema/p"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">


    <bean id="beanPostProcessor" class="com.shu.MyBeanPostProcessor">
    </bean>

<!--    <bean id="instantiationAwareBeanPostProcessor" class="com.shu.MyInstantiationAwareBeanPostProcessor">-->
<!--    </bean>-->

    <bean id="beanFactoryPostProcessor" class="com.shu.MyBeanFactoryPostProcessor">
    </bean>

    <bean id="person" class="com.shu.Person" init-method="myInit"
          destroy-method="myDestory" scope="singleton" p:name="张三" p:address="广州"
          p:phone="15900000"/>

    <bean id="dog" class="com.shu.Dog">
        <constructor-arg name="name" value="旺财"/>
        <constructor-arg name="age" value="3"/>
        <constructor-arg name="color" value="黄色"/>
    </bean>
</beans>
```

![image-20230722150028050](images\image-20230722150028050.png)

### 2.1.4 InstantiationAwareBeanPostProcessor

`InstantiationAwareBeanPostProcessor` 接口是 Spring 框架中的一个扩展接口，它继承自 `BeanPostProcessor` 接口，并在其基础上提供了更丰富的 Bean 实例化阶段的回调方法。通过实现 `InstantiationAwareBeanPostProcessor` 接口，开发者可以在 Spring 容器实例化 Bean 的不同阶段进行更细粒度的控制和自定义处理。

`InstantiationAwareBeanPostProcessor` 接口定义了多个方法，其中包括了在 Bean 实例化过程中多个阶段的回调方法，以下是其中几个主要的方法：

1. `postProcessBeforeInstantiation(Class<?> beanClass, String beanName)`: 在 Bean 实例化之前，允许开发者返回一个自定义的 Bean 实例。如果在这个方法中返回了一个非空的对象，Spring 将跳过常规的 Bean 实例化流程，直接使用返回的实例作为 Bean，并不会调用构造函数或其他后续的初始化方法。

2. `postProcessAfterInstantiation(Object bean, String beanName)`: 在 Bean 实例化之后、在调用构造函数之后，但在应用属性填充之前调用。允许开发者在这个方法中对 Bean 进行进一步的自定义处理。

3. `postProcessPropertyValues(MutablePropertyValues pvs, PropertyDescriptor[] pds, Object bean, String beanName)`: 在 Bean 的属性填充之后调用。允许开发者检查或修改 Bean 的属性值。

通过实现 `InstantiationAwareBeanPostProcessor` 接口，可以在 Bean 实例化和属性填充的各个阶段进行更灵活的控制和处理。但需要谨慎使用，以免影响 Spring 容器的正常运行和 Bean 的初始化过程。

以下是一个简单的示例，展示如何使用 `InstantiationAwareBeanPostProcessor` 接口来在 Bean 实例化和属性填充的不同阶段进行自定义处理：

```java
import org.springframework.beans.BeansException;
import org.springframework.beans.PropertyValues;
import org.springframework.beans.factory.config.InstantiationAwareBeanPostProcessor;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.beans.factory.support.RootBeanDefinition;
import org.springframework.stereotype.Component;

import java.beans.PropertyDescriptor;

@Component
public class MyInstantiationAwareBeanPostProcessor implements InstantiationAwareBeanPostProcessor {

    @Override
    public Object postProcessBeforeInstantiation(Class<?> beanClass, String beanName) throws BeansException {
        // 在 Bean 实例化之前进行处理
        if ("myBean".equals(beanName) && beanClass == MyBean.class) {
            // 返回自定义的 Bean 实例
            return new MyBean("Custom message from postProcessBeforeInstantiation");
        }
        return null; // 返回 null 表示按照常规流程进行 Bean 实例化
    }

    @Override
    public boolean postProcessAfterInstantiation(Object bean, String beanName) throws BeansException {
        // 在 Bean 实例化之后、在调用构造函数之后，但在应用属性填充之前调用
        if ("myBean".equals(beanName) && bean instanceof MyBean) {
            MyBean myBean = (MyBean) bean;
            // 修改 Bean 的属性值
            myBean.setMessage("Modified message from postProcessAfterInstantiation");
        }
        return true; // 返回 true 表示继续后续的属性填充流程
    }

    @Override
    public PropertyValues postProcessPropertyValues(PropertyValues pvs, PropertyDescriptor[] pds, Object bean, String beanName) throws BeansException {
        // 在 Bean 的属性填充之后调用
        if ("myBean".equals(beanName) && bean instanceof MyBean) {
            // 修改属性值
            // 这里可以进一步操作 pvs，例如添加新的属性值，修改现有属性值等
        }
        return pvs;
    }
}
```

在上述示例中，我们创建了一个名为 `MyInstantiationAwareBeanPostProcessor` 的类，它实现了 `InstantiationAwareBeanPostProcessor` 接口，并在各个回调方法中分别进行了不同阶段的处理。

下面详细介绍一下InstantiationAwareBeanPostProcessorAdapter接口中的所有方法：

| 方法名                         | 解释                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| postProcessBeforeInstantiation | 在实例化目标Bean之前应用此BeanPostProcessor。这个返回的Bean也许是一个代理代替目标Bean，有效地抑制目标Bean的默认实例化。如果此方法返回一个非空对象，则Bean的创建过程将被短路。唯一的进一步处理被应用是BeanPostProcessor.postProcessAfterInitialization(java.lang.Object, java.lang.String)方法（改变了Bean的生命周期实例化之后直接进入BeanPostProcessor.postProcessAfterInitialization）回调来自于配置好的BeanPostProcessors。这个回调将仅被应用于有Bean Class的BeanDefintions。特别是，它不会应用于采用”factory-method“的Bean。后处理器可以实现扩展的SmartInstantiationAwareBeanPostProcessor接口，以便预测它们将返回的Bean对象的类型 |
| postProcessPropertyValues      | 在工厂将给定的属性值应用到给定的Bean之前，对给定的属性值进行后处理。允许检查全部依赖是否已经全部满足，例如基于一个@Required在Bean属性的Setter方法上。还允许替换要应用的属性值，通常通过基于原始的PropertyValues创建一个新的MutablePropertyValues实例，添加或删除特定的值 |
| postProcessAfterInitialization | 在Bean初始化回调（如InitializingBean的afterPropertiesSet或者定制的init-method）之后，应用这个BeanPostProcessor去给一个新的Bean实例。Bean已经配置了属性值，返回的Bean实例可能已经被包装。 如果是FactoryBean，这个回调将为FactoryBean实例和其他被FactoryBean创建的对象所调用。这个post-processor可以通过相应的FactoryBean实例去检查决定是否应用FactoryBean或者被创建的对象或者两个都有。这个回调在一个由InstantiationAwareBeanPostProcessor短路的触发之后将被调用 |



```java
package com.shu;

/**
 * @description: Bean 初始化前后的处理器，实现InstantiationAwareBeanPostProcessor接口，需要实现三个方法
 * @author: shu
 * @createDate: 2023/7/22 12:15
 * @version: 1.0
 */



import java.beans.PropertyDescriptor;

import org.springframework.beans.BeansException;
import org.springframework.beans.PropertyValues;
import org.springframework.beans.factory.config.InstantiationAwareBeanPostProcessorAdapter;

public class MyInstantiationAwareBeanPostProcessor extends InstantiationAwareBeanPostProcessorAdapter {

    public MyInstantiationAwareBeanPostProcessor() {
        super();
        System.out.println("-------------------调用InstantiationAwareBeanPostProcessorAdapter构造器-------------------");
    }

    // 接口方法、实例化Bean之前调用
    @Override
    public Object postProcessBeforeInstantiation(Class beanClass,
                                                 String beanName) throws BeansException {
        System.out.println("-------------------调用InstantiationAwareBeanPostProcessorAdapter.postProcessBeforeInstantiation方法-------------------");
        return null;
    }

    // 接口方法、实例化Bean之后调用
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName)
            throws BeansException {
        System.out.println("-------------------调用InstantiationAwareBeanPostProcessorAdapter.postProcessAfterInitialization方法-------------------");
        return bean;
    }

    // 接口方法、设置某个属性时调用
    @Override
    public PropertyValues postProcessPropertyValues(PropertyValues pvs,
                                                    PropertyDescriptor[] pds, Object bean, String beanName)
            throws BeansException {
        System.out.println("-------------------调用InstantiationAwareBeanPostProcessorAdapter.postProcessPropertyValues方法-------------------");
        return pvs;
    }
}

```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:p="http://www.springframework.org/schema/p"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">


    <bean id="beanPostProcessor" class="com.shu.MyBeanPostProcessor">
    </bean>

    <bean id="instantiationAwareBeanPostProcessor" class="com.shu.MyInstantiationAwareBeanPostProcessor">
    </bean>

    <bean id="beanFactoryPostProcessor" class="com.shu.MyBeanFactoryPostProcessor">
    </bean>

    <bean id="person" class="com.shu.Person" init-method="myInit"
          destroy-method="myDestory" scope="singleton" p:name="张三" p:address="广州"
          p:phone="15900000"/>

    <bean id="dog" class="com.shu.Dog">
        <constructor-arg name="name" value="旺财"/>
        <constructor-arg name="age" value="3"/>
        <constructor-arg name="color" value="黄色"/>
    </bean>
</beans>
```

![image-20230722150406447](images\image-20230722150406447.png)

![file](images\life2.png)