---
title: Java中的注解与反射
sidebar_position: 6
keywords:
  - Java
tags:
  - Java
  - 学习笔记
  - 基础
  - 反射
  - 注解
  - 泛型
  - 集合
  - 多线程
last_update:
  date: 2023-07-01
  author: EasonShu
---


## 一 注解的基本知识
### 1.1 概述

- 以前，『XML』是各大框架的青睐者，它以松耦合的方式完成了框架中几乎所有的配置，但是随着项目越来越庞大，『XML』的内容也越来越复杂，维护成本变高。
- 于是就有人提出来一种标记式高耦合的配置方式，『注解』。方法上可以进行注解，类上也可以注解，字段属性上也可以注解，反正几乎需要配置的地方都可以进行注解。
- 关于『注解』和『XML』两种不同的配置模式，争论了好多年了，各有各的优劣，注解可以提供更大的便捷性，易于维护修改，但耦合度高，而 XML 相对于注解则是相反的，追求低耦合就要抛弃高效率，追求效率必然会遇到耦合。
### 1.2 本质

- The common interface extended by all annotation types
- 所有的注解类型都继承自这个普通的接口（Annotation）
- 注解的本质就是一个继承了 Annotation 接口的接口。
```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.SOURCE)
public @interface Override {
}
// 本质
public interface Override extends Annotation{
}
```
### 1.3 过程

- **一个注解准确意义上来说，只不过是一种特殊的注释而已，如果没有解析它的代码，它可能连注释都不如。**
- 而解析一个类或者方法的注解往往有两种形式，一种是编译期直接的扫描，一种是运行期反射。反射的事情我们待会说，而编译器的扫描指的是编译器在对 java 代码编译字节码的过程中会检测到某个类或者方法被一些注解修饰，这时它就会对于这些注解进行某些处理。
- 典型的就是注解 @Override，一旦编译器检测到某个方法被修饰了 @Override 注解，编译器就会检查当前方法的方法签名是否真正重写了父类的某个方法，也就是比较父类中是否具有一个同样的方法签名。
- 这一种情况只适用于那些编译器已经熟知的注解类，比如 JDK 内置的几个注解，而你自定义的注解，编译器是不知道你这个注解的作用的，当然也不知道该如何处理，往往只是会根据该注解的作用范围来选择是否编译进字节码文件，仅此而已。
### 1.4 元注解

- 『元注解』是用于修饰注解的注解，通常用在注解的定义上。
```java
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface Transactional {}
```

- @Target：注解的作用目标
- @Retention：注解的生命周期
- @Documented：注解是否应当被包含在 JavaDoc 文档中
- @Inherited：是否允许子类继承该注解
#### 1.4.1 @Target注解
@Target 注解修饰的注解将只能作用在成员字段上，不能用于修饰方法或者类。其中，ElementType 是一个枚举类型，有以下一些值：

- ElementType.TYPE：允许被修饰的注解作用在类、接口和枚举上
- ElementType.FIELD：允许作用在属性字段上
- ElementType.METHOD：允许作用在方法上
- ElementType.PARAMETER：允许作用在方法参数上
- ElementType.CONSTRUCTOR：允许作用在构造器上
- ElementType.LOCAL_VARIABLE：允许作用在本地局部变量上
- ElementType.ANNOTATION_TYPE：允许作用在注解上
- ElementType.PACKAGE：允许作用在包上
```java
@Target({ElementType.METHOD, ElementType.TYPE})
public @interface Transactional {}
```
#### 1.4.2 @Retention 注解
这里的 RetentionPolicy 依然是一个枚举类型，它有以下几个枚举值可取：

- RetentionPolicy.SOURCE：当前注解编译期可见，不会写入 class 文件
- RetentionPolicy.CLASS：类加载阶段丢弃，会写入 class 文件
- RetentionPolicy.RUNTIME：永久保存，可以反射获取
- @Retention 注解指定了被修饰的注解的生命周期，一种是只能在编译期可见，编译后会被丢弃，一种会被编译器编译进 class 文件中，无论是类或是方法，乃至字段，他们都是有属性表的，而 JAVA 虚拟机也定义了几种注解属性表用于存储注解信息，但是这种可见性不能带到方法区，类加载时会予以丢弃，最后一种则是永久存在的可见性。
```java
@Retention(RetentionPolicy.RUNTIME)
public @interface Transactional {}
```
#### 1.4.3 @Documented注解

- @Documented 注解修饰的注解，当我们执行 JavaDoc 文档打包时会被保存进 doc 文档，反之将在打包时丢弃。
```java
@Documented
public @interface Transactional {}
```
#### 1.4.4 @Inherited注解

- @Inherited 注解修饰的注解是具有可继承性的，也就说我们的注解修饰了一个类，而该类的子类将自动继承父类的该注解。
```java
@Inherited
public @interface Transactional {}
```
### 1.5 内置注解
#### 1.5.1 @Override 注解

- 它没有任何的属性，所以并不能存储任何其他信息。它只能作用于方法之上，编译结束后将被丢弃。
- 所以你看，它就是一种典型的『标记式注解』，仅被编译器可知，编译器在对 java 文件进行编译成字节码的过程中，一旦检测到某个方法上被修饰了该注解，就会去匹对父类中是否具有一个同样方法。
```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.SOURCE)
public @interface Override {
}
```
#### 1.5.2 @Deprecated注解

- 依然是一种『标记式注解』，永久存在，可以修饰所有的类型，作用是，标记当前的类或者方法或者字段等已经不再被推荐使用了，可能下一次的 JDK 版本就会删除。
#### 1.5.3 @SuppressWarnings注解

- 而如果我们不希望程序启动时，编译器检查代码中过时的方法，就可以使用 @SuppressWarnings 注解并给它的 value 属性传入一个参数值来压制编译器的检查。
## 二 自定义注解知识
### 2.1 注解实体类
比如，在没有注解加持时，我们想要校验 Student类
```java
public class Student {
    private Long id;
    // 学号
    private String name;
    // 姓名
    private String mobile;
    // 手机号码(11位)
}

```
### 2.2 常见的校验规则
```java
public class Student {
    @NotNull(message = "传入的姓名为null，请传值")
    @NotEmpty(message = "传入的姓名为空字符串，请传值")
    private String name;

    // 姓名
    @NotNull(message = "传入的分数为null，请传值")
    @Min(value = 0, message = "传入的学生成绩有误，分数应该在0~100之间")
    @Max(value = 100, message = "传入的学生成绩有误，分数应该在0~100之间")
    private Integer score;

    // 分数
    @NotNull(message = "传入的电话为null，请传值")
    @NotEmpty(message = "传入的电话为空字符串，请传值")
    @Length(min = 11, max = 11, message = "传入的电话号码长度有误，必须为11位")
    private String mobile;
    // 电话号码
}
```
### 2.3 手动实现注解
```java
@Target({ElementType.FIELD
})
@Retention(RetentionPolicy.RUNTIME)
public @interface Length {
    int min();
    // 允许字符串长度的最小值
    int max();
    // 允许字符串长度的最大值
    String errorMsg();
    // 自定义的错误提示信息
}
```
### 2.4 获取注解并对其进行验证
```java
public static String validate( Object object ) throws IllegalAccessException {

    // 首先通过反射获取object对象的类有哪些字段
    // 对本文来说就可以获取到Student类的id、name、mobile三个字段
    Field[] fields = object.getClass().getDeclaredFields();
    // for循环逐个字段校验，看哪个字段上标了注解
    for( Field field : fields ) {
        // if判断：检查该字段上有没有标注了@Length注解
        if( field.isAnnotationPresent(Length.class) ) {
            // 通过反射获取到该字段上标注的@Length注解的详细信息
            Length length = field.getAnnotation( Length.class );
            field.setAccessible( true ); // 让我们在反射时能访问到私有变量
            // 用过反射获取字段的实际值
            int value =( (String)field.get(object) ).length();
            // 将字段的实际值和注解上做标示的值进行比对
            if( value<length.min() || value>length.max() ) {
                return length.errorMsg();
            }
        }
    }
    return null;
}
```
### 2.5 使用注解
```java
public class Student {
    private Long id;        // 学号
    private String name;    // 姓名
    @Length(min = 11, max = 11, errorMsg = "电话号码的长度必须为11位")
    private String mobile;  // 手机号码(11位)
}
```
## 三 注解与Web日志自定义处理
### 3.1 效果图
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1644975044651-bd435388-d64d-4ade-9f9c-66fe08a1d212.png#clientId=ue1771872-7000-4&from=paste&height=864&id=ud8192c07&originHeight=1080&originWidth=1920&originalType=binary&ratio=1&rotation=0&showTitle=false&size=1373595&status=done&style=none&taskId=ud078adac-50fc-43da-ac46-8898b4d9732&title=&width=1536)
### 3.2 自定义WebLog注解
```xml
<!-- aop 依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>

<!-- 用于日志切面中，以 json 格式打印出入参 -->
<dependency>
    <groupId>com.google.code.gson</groupId>
    <artifactId>gson</artifactId>
    <version>2.8.5</version>
</dependency>

```
```java
package com.shu.Annotation;
import java.lang.annotation.*;

/**
 *自定义Web日志接口
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface WebLog {
    /**
     * 方法描述
     * @return
     */
    String description() default "";
}
```
### 3.3 自定义AOP切面
```java
package com.shu.Aop;

import com.google.gson.Gson;
import com.shu.Annotation.WebLog;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;

@Aspect
@Component
// 用于开发,测试环境,正式环境需要打开
//@Profile({"dev", "test"})
public class WebLogAspect {

    private final static Logger logger = LoggerFactory.getLogger(WebLogAspect.class);
    /** 换行符 */
    private static final String LINE_SEPARATOR = System.lineSeparator();

    /** 以自定义 @WebLog 注解为切点 */
    @Pointcut("@annotation(com.shu.Annotation.WebLog)")
    public void webLog() {}

    /**
     * 在切点之前织入
     * @param joinPoint
     * @throws Throwable
     */
    @Before("webLog()")
    public void doBefore(JoinPoint joinPoint) throws Throwable {
        // 开始打印请求日志
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes.getRequest();

        // 获取 @WebLog 注解的描述信息
        String methodDescription = getAspectLogDescription(joinPoint);

        // 打印请求相关参数
        logger.info("========================================== Start ==========================================");
        // 打印请求 url
        logger.info("URL            : {}", request.getRequestURL().toString());
        // 打印描述信息
        logger.info("Description    : {}", methodDescription);
        // 打印 Http method
        logger.info("HTTP Method    : {}", request.getMethod());
        // 打印调用 controller 的全路径以及执行方法
        logger.info("Class Method   : {}.{}", joinPoint.getSignature().getDeclaringTypeName(), joinPoint.getSignature().getName());
        // 打印请求的 IP
        logger.info("IP             : {}", request.getRemoteAddr());
        // 打印请求入参
        logger.info("Request Args   : {}", new Gson().toJson(joinPoint.getArgs()));
    }

    /**
     * 在切点之后织入
     * @throws Throwable
     */
    @After("webLog()")
    public void doAfter() throws Throwable {
        // 接口结束后换行，方便分割查看
        logger.info("=========================================== End ===========================================" + LINE_SEPARATOR);
    }

    /**
     * 环绕
     * @param proceedingJoinPoint
     * @return
     * @throws Throwable
     */
    @Around("webLog()")
    public Object doAround(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        Object result = proceedingJoinPoint.proceed();
        // 打印出参
        logger.info("Response Args  : {}", new Gson().toJson(result));
        // 执行耗时
        logger.info("Time-Consuming : {} ms", System.currentTimeMillis() - startTime);
        return result;
    }


    /**
     * 获取切面注解的描述
     *
     * @param joinPoint 切点
     * @return 描述信息
     * @throws Exception
     */
    public String getAspectLogDescription(JoinPoint joinPoint)
            throws Exception {
        String targetName = joinPoint.getTarget().getClass().getName();
        String methodName = joinPoint.getSignature().getName();
        Object[] arguments = joinPoint.getArgs();
        Class targetClass = Class.forName(targetName);
        Method[] methods = targetClass.getMethods();
        StringBuilder description = new StringBuilder("");
        for (Method method : methods) {
            if (method.getName().equals(methodName)) {
                Class[] clazzs = method.getParameterTypes();
                if (clazzs.length == arguments.length) {
                    description.append(method.getAnnotation(WebLog.class).description());
                    break;
                }
            }
        }
        return description.toString();
    }
}
```
### 3.4 使用
```java
package com.shu.Controller;

import com.shu.Annotation.WebLog;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/test")
    @WebLog(description = "测试接口")
    public String Test(){
        return  "成功";
    }
}
```
## 四 反射基本知识
### 4.1 反射的思想

- 在学习反射之前，先来了解**正射**是什么。我们平常用的最多的 new 方式实例化对象的方式就是一种正射的体现。假如我需要实例化一个HashMap，代码就会是这样子。
```java
Map<Integer, Integer> map = new HashMap<>();
map.put(1, 1);
```

- 当某一天发现HashMap不能满足业务的需要，我们就改为LinkedHashMap。
```java
Map<Integer, Integer> map = new LinkedHashMap<>();
map.put(1, 1);
```

- 发现问题了吗？我们每次改变一种需求，都要去重新**修改源码**，然后对代码进行编译，打包，再到 JVM 上重启项目。这么些步骤下来，效率非常低。
- 如果在不修改源码的情况下，通过反射的方式来解决问题。
```java
/**
传入类名
**/
public Map<Integer, Integer> getMap(String className) {
    // 获取class名
    Class clazz = Class.forName(className);
    // 获取构造器
    Consructor con = clazz.getConstructor();
    // 返回实例对象
    return (Map<Integer, Integer>) con.newInstance();
}
```

- 无论使用什么 Map，只要实现了Map接口，就可以使用全类名路径传入到方法中，获得对应的 Map 实例。例如java.util.HashMap / java.util.LinkedHashMap····如果要创建其它类例如WeakHashMap，我也**不需要修改上面这段源码**。
### 4.2 基本使用
Java 反射的主要组成部分有4个：

- Class：任何运行在内存中的所有类都是该 Class 类的实例对象，每个 Class 类对象内部都包含了本来的**所有信息**。记着一句话，通过反射干任何事，先找 Class 准没错！
- Field：描述一个类的**属性**，内部包含了该属性的所有信息，例如**数据类型，属性名，访问修饰符**······
- Constructor：描述一个类的**构造方法**，内部包含了构造方法的所有信息，例如**参数类型，参数名字，访问修饰符**······
- Method：描述一个类的**所有方法**（包括抽象方法），内部包含了该方法的所有信息，与Constructor类似，不同之处是 Method 拥有**返回值类型**信息，因为构造方法是没有返回值的。

![](https://cdn.nlark.com/yuque/0/2022/webp/12426173/1644991357258-e8c79550-6c36-41b9-be1a-d04f7c59145a.webp#clientId=ubcac305a-a236-4&from=paste&id=u43b4874c&originHeight=974&originWidth=1578&originalType=url&ratio=1&rotation=0&showTitle=false&status=done&style=none&taskId=u93475448-141f-4d5b-82b3-836a758f046&title=)
案例：
```java
public class SmallPineapple {
    public String name;
    public int age;
    private double weight; // 体重只有自己知道

    public SmallPineapple() {}

    public SmallPineapple(String name, int age) {
        this.name = name;
        this.age = age;
    }
    public void getInfo() {
        System.out.print("["+ name + " 的年龄是：" + age + "]");
    }
}
```
#### 4.2.1 获取Class类信息

- 在 Java 中，每一个类都会有专属于自己的 Class 对象，当我们编写完.java文件后，使用javac编译后，就会产生一个字节码文件.class，在字节码文件中包含类的所有信息，如属性，构造方法，方法······当字节码文件被装载进虚拟机执行时，会在内存中生成 Class 对象，它包含了该类内部的所有信息，在程序运行时可以获取这些信息。
- 类名.class：这种获取方式只有在编译前已经声明了该类的类型才能获取到
```java
Class clazz = SmallPineapple.class;
```

- 实例.getClass()：通过实例化对象获取该实例的 Class 对象
```java
SmallPineapple sp = new SmallPineapple();
Class clazz = sp.getClass();
```

- Class.forName(className)：通过类的**全限定名**获取该类的 Class 对象
```java
Class clazz = Class.forName("com.shu.Reflect");
```

- 拿到 Class对象就可以对它为所欲为了：剥开它的皮（获取**类信息**）、指挥它做事（调用它的**方法**），看透它的一切（获取**属性**），总之它就没有隐私了。

```java
package com.shu.Reflect;
public class TestReflect {
    public static void main(String[] args) throws ClassNotFoundException {
        // 通过类名，直接获取class
        Class<SmallPineapple> smallPineappleClass = SmallPineapple.class;
        // 实体类获取class
        SmallPineapple sp = new SmallPineapple();
        Class clazz = sp.getClass();
        // 全类名获取class
        Class clazs = Class.forName("com.shu.Reflect");
    }
}
```
#### 4.2.2 构造类的实例对象

- Class 对象调用newInstance()方法
- 通过 newInstance() 创建的实例中，所有属性值都是对应类型的初始值，因为 newInstance() 构造实例会**调用默认无参构造器**。
```java
// 获取类信息
Class clazz = Class.forName("com.shu.Reflect");
// 获取到对象的方法
SmallPineapple smallPineapple = (SmallPineapple) clazz.newInstance();
// 调用方法
smallPineapple.getInfo();
// [null 的年龄是：0]
```

- Constructor 构造器调用newInstance()方法
- 通过 getConstructor(Object... paramTypes) 方法指定获取**指定参数类型**的 Constructor， Constructor 调用 newInstance(Object... paramValues) 时传入构造方法参数的值，同样可以构造一个实例，且内部属性已经被赋值。
- 通过Class对象调用 newInstance() 会走**默认无参构造方法**，如果想通过**显式构造方法**构造实例，需要提前从Class中调用getConstructor()方法获取对应的构造器，通过构造器去实例化对象。
```java
// 获取类信息
Class clazz = Class.forName("com.shu.Reflect");
// 构造器
Constructor constructor = clazz.getConstructor(String.class, int.class);
constructor.setAccessible(true);
// 构造器实例化
SmallPineapple smallPineapple2 = (SmallPineapple) constructor.newInstance("小菠萝", 21);
// 调用方法
smallPineapple2.getInfo();
// [小菠萝 的年龄是：21]
```
#### 4.2.3 获取类的所有信息

- **Class 对象中包含了该类的所有信息，在编译期我们能看到的信息就是该类的变量、方法、构造器，在运行时最常被获取的也是这些信息。**

![](https://cdn.nlark.com/yuque/0/2022/webp/12426173/1644992868597-ad04279a-8567-4f78-bfb8-9023e9c3477c.webp#clientId=ubcac305a-a236-4&from=paste&id=u9a97de45&originHeight=418&originWidth=1566&originalType=url&ratio=1&rotation=0&showTitle=false&status=done&style=none&taskId=u7a814066-ea21-4da0-90a8-f9d99501dd6&title=)
**获取变量信息**

- Field[] getFields()：获取类中所有被public修饰的所有变量
- Field getField(String name)：根据**变量名**获取类中的一个变量，该**变量必须被public修饰**
- Field[] getDeclaredFields()：获取类中所有的变量，但**无法获取继承下来的变量**
- Field getDeclaredField(String name)：根据姓名获取类中的某个变量，**无法获取继承下来的变量**

**获取方法信息**

- Method[] getMethods()：获取类中被public修饰的所有方法
- Method getMethod(String name, Class...<?> paramTypes)：根据**名字和参数类型**获取对应方法，该方法必须被public修饰
- Method[] getDeclaredMethods()：获取所有方法，但**无法获取继承下来的方法**
- Method getDeclaredMethod(String name, Class...<?> paramTypes)：根据**名字和参数类型**获取对应方法，**无法获取继承下来的方法**

**获取构造器信息**

- Constuctor[] getConstructors()：获取类中所有被public修饰的构造器
- Constructor getConstructor(Class...<?> paramTypes)：根据参数类型获取类中某个构造器，该构造器必须被public修饰
- Constructor[] getDeclaredConstructors()：获取类中所有构造器
- Constructor getDeclaredConstructor(class...<?> paramTypes)：根据参数类型获取对应的构造器

**注意点：**

- 有Declared修饰的方法：可以获取该类内部包含的**所有**变量、方法和构造器，但是**无法获取继承下来的信息**
- 无Declared修饰的方法：可以获取该类中public修饰的变量、方法和构造器，可**获取继承下来的信息**
```java
Class clazz = Class.forName("com.shu.Reflect");
// 获取 public 属性，包括继承
Field[] fields1 = clazz.getFields();
// 获取所有属性，不包括继承
Field[] fields2 = clazz.getDeclaredFields();
// 将所有属性汇总到 set
Set<Field> allFields = new HashSet<>();
allFields.addAll(Arrays.asList(fields1));
allFields.addAll(Arrays.asList(fields2));
```
#### 4.2.4 获取注解信息
**获取注解单独拧了出来，因为它并不是专属于 Class 对象的一种信息，每个变量，方法和构造器都可以被注解修饰，所以在反射中，Field，Constructor 和 Method 类对象都可以调用下面这些方法获取标注在它们之上的注解。**

- Annotation[] getAnnotations()：获取该对象上的**所有注解**
- Annotation getAnnotation(Class annotaionClass)：传入注解类型，获取该对象上的特定一个注解
- Annotation[] getDeclaredAnnotations()：获取该对象上的显式标注的所有注解，无法获取继承下来的注解
- Annotation getDeclaredAnnotation(Class annotationClass)：根据注解类型，获取该对象上的特定一个注解，无法获取继承下来的注解
- 只有注解的@Retension标注为RUNTIME时，才能够通过反射获取到该注解
```java
 /**
     * 获取切面注解的描述
     *
     * @param joinPoint 切点
     * @return 描述信息
     * @throws Exception
     */
    public String getAspectLogDescription(JoinPoint joinPoint)
            throws Exception {
        String targetName = joinPoint.getTarget().getClass().getName();
        String methodName = joinPoint.getSignature().getName();
        Object[] arguments = joinPoint.getArgs();
        Class targetClass = Class.forName(targetName);
        Method[] methods = targetClass.getMethods();
        StringBuilder description = new StringBuilder("");
        for (Method method : methods) {
            if (method.getName().equals(methodName)) {
                Class[] clazzs = method.getParameterTypes();
                if (clazzs.length == arguments.length) {
                    description.append(method.getAnnotation(WebLog.class).description());
                    break;
                }
            }
        }
        return description.toString();
    }
```
#### 4.2.5 通过反射调用方法

- 通过反射获取到某个 Method 类对象后，可以通过调用invoke方法执行。
- invoke(Oject obj, Object... args)：参数指定调用该方法的对象，参数2`是方法的参数列表值。
- 可以像下面这种做法，通过反射实例化一个对象，然后获取Method方法对象，调用invoke()指定SmallPineapple的getInfo()方法。
### 4.3 反射的应用场景
#### 4.3.1 Spring的IOC容器

- 在 Spring 中，经常会编写一个上下文配置文件applicationContext.xml，里面就是关于bean的配置，程序启动时会读取该 xml 文件，解析出所有的 bean标签，并实例化对象放入IOC容器中。
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd">
    <bean id="smallpineapple" class="com.bean.SmallPineapple">
        <constructor-arg type="java.lang.String" value="哈哈哈哈"/>
        <constructor-arg type="int" value="21"/>
    </bean>
</beans>
```

- 在定义好上面的文件后，通过ClassPathXmlApplicationContext加载该配置文件，程序启动时，Spring 会将该配置文件中的所有bean都实例化，放入 IOC 容器中，IOC 容器本质上就是一个工厂，通过该工厂传入 bean 标签的id属性获取到对应的实例。
```java
public class Main {
    public static void main(String[] args) {
        ApplicationContext ac =
                new ClassPathXmlApplicationContext("applicationContext.xml");
        SmallPineapple smallPineapple = (SmallPineapple) ac.getBean("smallpineapple");
        smallPineapple.getInfo(); // [小菠萝的年龄是：21]
    }
}
```
#### 4.3.2 JDBC加载驱动

- 在导入第三方库时，JVM不会主动去加载外部导入的类，而是**等到真正使用时，才去加载需要的类**，正是如此，我们可以在获取数据库连接时传入驱动类的全限定名，交给 JVM 加载该类。
- 在我们开发 SpringBoot 项目时，会经常遇到这个类，但是可能习惯成自然了，就没多大在乎，我在这里给你们看看常见的application.yml中的数据库配置，我想你应该会恍然大悟吧。
```java
public class DBConnectionUtil {
    /** 指定数据库的驱动类 */
    private static final String DRIVER_CLASS_NAME = "com.mysql.jdbc.Driver";

    public static Connection getConnection() {
        Connection conn = null;
        // 加载驱动类，配置文件中的驱动
        Class.forName(DRIVER_CLASS_NAME);
        // 获取数据库连接对象
        conn = DriverManager.getConnection("jdbc:mysql://···", "root", "root");
        return conn;
    }
}
```


####

####


####

####


