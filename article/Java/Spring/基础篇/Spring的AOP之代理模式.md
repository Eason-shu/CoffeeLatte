---
title: Spring的AOP之代理模式
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
last_update:
  date: 2023-07-23 23:00:00
  author: EasonShu

---
# AOP
Spring AOP (Aspect-Oriented Programming) 是 Spring 框架的一个重要模块，它是一种编程范式，旨在增强现有代码的功能而不修改原始代码。理解 Spring AOP 需要了解以下几个关键概念：

1. 切面（Aspect）：
切面是一个模块化的单元，它包含一个横跨应用程序的关注点（Concern）。在 Spring AOP 中，切面通常描述了一类横切关注点，比如日志记录、性能统计、事务管理等。切面可以被认为是一个交叉关注点（cross-cutting concern），与业务逻辑独立存在，可以在应用的多个地方进行重用。

2. 连接点（Join Point）：
连接点是在应用程序执行过程中可能被拦截的点。在 Spring AOP 中，连接点通常是方法的执行点。这些点可以是方法调用、方法执行过程中的特定位置，或者是异常处理的点等。

3. 通知（Advice）：
通知是切面在连接点上执行的动作。通知定义了在连接点处何时执行什么操作。在 Spring AOP 中，有以下几种类型的通知：
   - 前置通知（Before Advice）：在连接点之前执行的通知。
   - 后置通知（After Advice）：在连接点之后执行的通知（不考虑方法的返回结果）。
   - 返回通知（After Returning Advice）：在连接点正常执行后执行的通知（考虑方法的返回结果）。
   - 异常通知（After Throwing Advice）：在连接点抛出异常后执行的通知。
   - 环绕通知（Around Advice）：包围连接点的通知，可以在连接点前后自定义操作。

4. 切点（Pointcut）：
切点是一个表达式，它定义了哪些连接点将被匹配到并应用通知。切点表达式允许开发者选择性地将通知应用于特定的连接点。切点使用 AspectJ 切点表达式语言来定义。

5. 引入（Introduction）：
引入允许我们在现有的类中添加新的方法或属性。通过引入，我们可以为一个类添加一些在源代码中不存在的方法或属性，从而改变类的行为。

6. 织入（Weaving）：
织入是指将切面与应用程序的目标对象连接起来，并创建一个通知增强的代理对象。织入可以在编译时、类加载时或运行时进行，Spring AOP 采用运行时织入的方式。

综上所述，Spring AOP 提供了一种通过将横切关注点与业务逻辑分离的方式，将通用的功能（例如日志、事务等）模块化，并将它们应用于应用程序的不同部分，以提高代码的重用性、可维护性和可扩展性。

## 1.1 代理设计模式

![代理设计模式](https://refactoringguru.cn/images/patterns/content/proxy/proxy.png)

**代理模式**是一种结构型设计模式， 让你能够提供对象的替代品或其占位符， 代理控制着对于原对象的访问， 并允许在将请求提交给对象前后进行一些处理。

### 1.1.1 静态代理

**问题**

为什么要控制对于某个对象的访问呢？ 举个例子： 有这样一个消耗大量系统资源的巨型对象， 你只是偶尔需要使用它， 并非总是需要。

![代理模式解决的问题](https://refactoringguru.cn/images/patterns/diagrams/proxy/problem-zh.png)

数据库查询有可能会非常缓慢。

你可以实现延迟初始化： 在实际有需要时再创建该对象。 对象的所有客户端都要执行延迟初始代码。 不幸的是， 这很可能会带来很多重复代码。

在理想情况下， 我们希望将代码直接放入对象的类中， 但这并非总是能实现： 比如类可能是第三方封闭库的一部分。

 **解决方案**

代理模式建议新建一个与原服务对象接口相同的代理类， 然后更新应用以将代理对象传递给所有原始对象客户端。 代理类接收到客户端请求后会创建实际的服务对象， 并将所有工作委派给它。

![代理模式的解决方案](https://refactoringguru.cn/images/patterns/diagrams/proxy/solution-zh.png)

代理将自己伪装成数据库对象， 可在客户端或实际数据库对象不知情的情况下处理延迟初始化和缓存查询结果的工作。

**案例：**

```java
package com.shu.aop.demo01;

/**
 * @description: 视频类，用于存储视频信息，包括视频id，视频标题，视频数据等信息
 * @author: shu
 * @createDate: 2023/7/22 17:02
 * @version: 1.0
 */
public class Video {
    public String id;
    public String title;
    public String data;

    Video(String id, String title) {
        this.id = id;
        this.title = title;
        this.data = "Random video.";
    }
}

```

我们指定获取视频的两个接口，一个获取热门视频，一个通过视频ID获取视频

```java
package com.shu.aop.demo01;

import java.util.HashMap;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/22 17:02
 * @version: 1.0
 */
public interface ThirdPartyYouTubeLib {
    /**
     *  返回热门视频
     * @return
     */
    HashMap<String, Video> popularVideos();

    /**
     * 根据视频id获取视频
     * @param videoId
     * @return
     */
    Video getVideo(String videoId);
}

```

编写实现类

```java
package com.shu.aop.demo01;

import java.util.HashMap;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/22 17:03
 * @version: 1.0
 */
public class ThirdPartyYouTubeClass implements ThirdPartyYouTubeLib {

    /**
     * 返回热门视频
     * @return
     */
    @Override
    public HashMap<String, Video> popularVideos() {
        return getRandomVideos();
    }

    /**
     * 根据视频id获取视频
     * @param videoId
     * @return
     */
    @Override
    public Video getVideo(String videoId) {
        return getSomeVideo(videoId);
    }


    private HashMap<String, Video> getRandomVideos() {
        System.out.print("Downloading populars... ");
        HashMap<String, Video> hmap = new HashMap<String, Video>();
        hmap.put("catzzzzzzzzz", new Video("sadgahasgdas", "Catzzzz.avi"));
        hmap.put("mkafksangasj", new Video("mkafksangasj", "Dog play with ball.mp4"));
        hmap.put("dancesvideoo", new Video("asdfas3ffasd", "Dancing video.mpq"));
        hmap.put("dlsdk5jfslaf", new Video("dlsdk5jfslaf", "Barcelona vs RealM.mov"));
        hmap.put("3sdfgsd1j333", new Video("3sdfgsd1j333", "Programing lesson#1.avi"));
        System.out.print("Done!" + "\n");
        return hmap;
    }

    private Video getSomeVideo(String videoId) {
        System.out.print("Downloading video... ");
        Video video = new Video(videoId, "Some video title");
        System.out.print("Done!" + "\n");
        return video;
    }

}
```

现在我们需要通过编写代理类来时实现它，这就需要要求我们编写的代理类隐藏原始类，同时应该保持与原始类一样的方法，当然这就可以通过实现来实现

```java
package com.shu.aop.demo01;

import java.util.HashMap;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/22 17:06
 * @version: 1.0
 */
public class YouTubeCacheProxy implements ThirdPartyYouTubeLib{
    private ThirdPartyYouTubeLib youtubeService;
    private HashMap<String, Video> cachePopular = new HashMap<String, Video>();
    private HashMap<String, Video> cacheAll = new HashMap<String, Video>();

    public YouTubeCacheProxy() {
        this.youtubeService = new ThirdPartyYouTubeClass();
    }
    /**
     * 返回热门视频
     *
     * @return
     */
    @Override
    public HashMap<String, Video> popularVideos() {
        if (cachePopular.isEmpty()) {
            cachePopular = youtubeService.popularVideos();
        } else {
            System.out.println("Retrieved list from cache.");
        }
        return cachePopular;
    }

    /**
     * 根据视频id获取视频
     *
     * @param videoId
     * @return
     */
    @Override
    public Video getVideo(String videoId) {
        Video video = cacheAll.get(videoId);
        if (video == null) {
            video = youtubeService.getVideo(videoId);
            cacheAll.put(videoId, video);
        } else {
            System.out.println("Retrieved video '" + videoId + "' from cache.");
        }
        return video;
    }
}

```

编写下载器，根据传入不同的实现来渲染视频

```java
package com.shu.aop.demo01;

import java.util.HashMap;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/22 17:07
 * @version: 1.0
 */
public class YouTubeDownloader {
    private ThirdPartyYouTubeLib api;

    public YouTubeDownloader(ThirdPartyYouTubeLib api) {
        this.api = api;
    }

    /**
     *  渲染视频页面
     * @param videoId
     */
    public void renderVideoPage(String videoId) {
        Video video = api.getVideo(videoId);
        System.out.println("\n-------------------------------");
        System.out.println("Video page (imagine fancy HTML)");
        System.out.println("ID: " + video.id);
        System.out.println("Title: " + video.title);
        System.out.println("Video: " + video.data);
        System.out.println("-------------------------------\n");
    }

    /**
     * 渲染热门视频
     */
    public void renderPopularVideos() {
        HashMap<String, Video> list = api.popularVideos();
        System.out.println("\n-------------------------------");
        System.out.println("Most popular videos on YouTube (imagine fancy HTML)");
        for (Video video : list.values()) {
            System.out.println("ID: " + video.id + " / Title: " + video.title);
        }
        System.out.println("-------------------------------\n");
    }
}

```

测试

```java
package com.shu.aop.demo01;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/22 17:08
 * @version: 1.0
 */
public class ProxyTest {
    public static void main(String[] args) {
        YouTubeDownloader naiveDownloader = new YouTubeDownloader(new ThirdPartyYouTubeClass());
        YouTubeDownloader smartDownloader = new YouTubeDownloader(new YouTubeCacheProxy());

        long naive = test(naiveDownloader);
        long smart = test(smartDownloader);
        System.out.print("Time saved by caching proxy: " + (naive - smart) + "ms");

    }

    private static long test(YouTubeDownloader downloader) {
        long startTime = System.currentTimeMillis();
        // User behavior in our app:
        downloader.renderPopularVideos();
        downloader.renderVideoPage("catzzzzzzzzz");
        downloader.renderPopularVideos();
        downloader.renderVideoPage("dancesvideoo");
        // Users might visit the same page quite often.
        downloader.renderVideoPage("catzzzzzzzzz");
        downloader.renderVideoPage("someothervid");
        long estimatedTime = System.currentTimeMillis() - startTime;
        System.out.print("Time elapsed: " + estimatedTime + "ms\n");
        return estimatedTime;
    }
}

```

![image-20230722171829361](images\image-20230722171829361.png)

![image-20230722172116298](images\image-20230722172116298.png)

**缺点**

- **1、重复性：** 需要代理的业务或方法越多，重复的模板代码越多；
- **2、脆弱性：** 一旦改动基础接口，代理类也需要同步修改（因为代理类也实现了基础接口）。

### 1.1.2  动态代理

记住重要的一点，为其他对象提供一个代理以控制对某个对象的访问。代理类主要负责为委托了（真实对象）预处理消息、过滤消息、传递消息给委托类，代理类不现实具体服务，而是利用委托类来完成服务，并将执行结果封装处理。

在我们的现实生活中其实有很多这样的案例，不如商品经销商与厂家的关系，出租房的人与中介。

- 子类继承同一个接口

```java
package com.shu.agency;

/**
 * @author shu
 * @version 1.0
 * @date 2022/7/20 16:00
 * @describe 代理类和委托代理类都要实现的接口
 */
public interface Sell {
    /**
     * 销售产品
     */
    void market();

    /**
     * 生成产品
     */
    void add();
}
```

- 厂家

```java
package com.shu.agency;

/**
 * @author shu
 * @version 1.0
 * @date 2022/7/20 16:03
 * @describe 生产厂家
 */
public class Production implements Sell{

    @Override
    public void market() {
        System.out.println("生产厂家销售产品了哦！！！");
    }

    @Override
    public void add() {
        System.out.println("生产厂家销售产品了哦！！！");
    }
}
```

- 经销商

```java
package com.shu.agency;

/**
 * @author shu
 * @version 1.0
 * @date 2022/7/20 16:05
 * @describe 商家代销产品
 */
public class Merchant implements Sell{

    Sell production;

    public Merchant(Production production) {
        this.production = production;
    }

    @Override
    public void market() {
        production.market();
    }

    @Override
    public void add() {
        production.add();
    }
}
```

- 在这我们可以看出被委托类持有委托类的引用，在实际中调用还是委托者的方法。
- 这里我们也可以看到类之间的解耦，不用修改被委托的类就可以做额外处理，但是缺点就是我们需要指定被代理的类。

- 由字面意思可知，在程序运行期间生成的代理方法，我们称为动态代理，注意是在Java代码中动态生成。
- 在使用动态代理时，我们需要定义一个位于代理类与委托类之间的中介类，这个中介类被要求实现`InvocationHandler`接口。

```java
/**
 * 调用处理程序
 */
public interface InvocationHandler {
    Object invoke(Object proxy, Method method, Object[] args);
}
```

- 从`InvocationHandler`这个名称我们就可以知道，实现了这个接口的中介类用做“调用处理器”。
- 当我们调用代理类对象的方法时，这个“调用”会转送到invoke方法中，代理类对象作为proxy参数传入，参数method标识了我们具体调用的是代理类的哪个方法，args为这个方法的参数。这样一来，我们对代理类中的所有方法的调用都会变为对invoke的调用。
- 这样我们可以在invoke方法中添加统一的处理逻辑(也可以根据method参数对不同的代理类方法做不同的处理)。

**定义中介类**

```java
package com.shu.agency;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

/**
 * @author shu
 * @version 1.0
 * @date 2022/7/20 19:33
 * @describe
 */
public class DynamicProxy implements InvocationHandler {
    //obj为委托类对象;

    private Object obj;


    public DynamicProxy(Object obj) {
        this.obj = obj;
    }

    /**
     * 通过反射来执行真正的方法
     * @param proxy
     * @param method
     * @param args
     * @return
     * @throws Throwable
     */
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        Object result = method.invoke(obj, args);
        return result;
    }
}
```

**测试**

```java
package com.shu.agency;

import java.lang.reflect.Proxy;

/**
 * @author shu
 * @version 1.0
 * @date 2022/7/20 19:35
 * @describe
 */
public class ProxyTest {
    public static void main(String[] args) {
        //创建中介类实例
        DynamicProxy inter = new DynamicProxy(new Production());
        //加上这句将会产生一个$Proxy0.class文件，这个文件即为动态生成的代理类文件
        System.getProperties().put("sun.misc.ProxyGenerator.saveGeneratedFiles","true");
        //获取代理类实例sell
        Sell sell = (Sell)(Proxy.newProxyInstance(Sell.class.getClassLoader(), new Class[] {Sell.class}, inter));
        sell.market();
        sell.add();

    }
}
```

### 1.1.3 动态代理的结构

![img](https://cdn.nlark.com/yuque/0/2022/png/12426173/1663396617228-313ac55c-2066-47c4-9572-f8b30833b76e.png)

**优点**

- 你可以在客户端毫无察觉的情况下控制服务对象。
-  如果客户端对服务对象的生命周期没有特殊要求， 你可以对生命周期进行管理。
-  即使服务对象还未准备好或不存在， 代理也可以正常工作。
-  *开闭原则*。 你可以在不对服务或客户端做出修改的情况下创建新代理。

**缺点**

-  代码可能会变得复杂， 因为需要新建许多类。
-  服务响应可能会延迟。

### 1.1.4 `Proxy.newProxyInstance`分析

`Proxy.newProxyInstance(ClassLoader loader, Class<?>[] interfaces,InvocationHandler h)`
`ClassLoader loader`：表示类加载器，用于加载生成的代理类。可以通过目标类的 ClassLoader 实例或者其他合适的类加载器来指定。

`Class<?>[] interfaces`：表示代理类要实现的接口列表。这是一个数组，指定了代理类要实现的接口，通过代理对象调用接口中的方法时，实际上会被转发给 InvocationHandler 的 invoke() 方法处理。

`InvocationHandler h`：表示代理对象的调用处理程序，也是一个实现了 InvocationHandler 接口的对象。InvocationHandler 接口中只有一个方法 invoke()，当代理对象的方法被调用时，会被传递到 invoke() 方法中进行处理。
动态代理的作用是允许我们在调用方法之前或之后执行一些额外的操作，比如记录日志、实现事务管理等。通过 newProxyInstance() 方法创建的代理对象会自动关联到指定的 InvocationHandler，并将方法调用委托给 InvocationHandler 来处理。

#### 类加载器

在 Java 中，ClassLoader（类加载器）是一个关键的组件，它负责将 Java 类字节码从磁盘或其他来源加载到 Java 虚拟机（JVM）中，并将其转换为可以在运行时使用的类对象。ClassLoader 实现了 Java 虚拟机的动态加载机制，使得 Java 程序可以在运行时根据需要加载类，而不是在编译时就将所有类加载到内存中。

Java 中的ClassLoader是一个抽象类（java.lang.ClassLoader），它有几个重要的子类，如下：

1. Bootstrap ClassLoader（启动类加载器）：
Bootstrap ClassLoader 是虚拟机的内置类加载器，它负责加载 Java 核心类，如 java.lang 包下的类。它是用原生代码实现的，通常由 JVM 在启动时创建，并且在整个 JVM 生命周期中都存在。由于它是虚拟机的一部分，因此在 Java 程序中无法直接获取它的引用。

2. Extension ClassLoader（扩展类加载器）：
Extension ClassLoader 是用来加载 Java 扩展类的加载器。它负责加载 Java 标准扩展目录（JAVA_HOME/jre/lib/ext）下的类。在默认情况下，它是由 sun.misc.Launcher$ExtClassLoader 实现的，也可以通过继承 java.lang.ClassLoader 来自定义扩展类加载器。

3. System ClassLoader（系统类加载器）：
System ClassLoader，也称为应用类加载器，负责加载应用程序的类。它是通过java命令或Java API启动一个Java程序时所指定的classpath来加载类。通常，我们在自己的Java应用程序中使用这个ClassLoader。

除了上述三种类加载器，Java 还提供了一些其他特殊用途的类加载器，如URLClassLoader用于从特定URL加载类，以及自定义ClassLoader用于实现特定的类加载行为。

类加载器的工作原理是实现一个双亲委派模型。当一个类加载器加载一个类时，它首先会尝试将类委派给父类加载器进行加载。如果父类加载器找不到该类，则该类加载器会尝试加载该类。这样的层级结构使得类加载器之间形成了一个类似于树的结构，保证了类的加载顺序和类的隔离性。

类加载器在 Java 应用程序的运行中起着重要的作用，允许动态加载类，实现热部署和动态扩展等功能。

```java
package com.shu.aop;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/22 17:34
 * @version: 1.0
 */
public class ClassLoaderTest {
    public static void main(String[] args) {
        ClassLoader classLoader = ClassLoaderTest.class.getClassLoader();
        System.out.println(classLoader);
        System.out.println(classLoader.getParent());
        System.out.println(classLoader.getParent().getParent());
        // sun.misc.Launcher$AppClassLoader@18b4aac2
        // sun.misc.Launcher$ExtClassLoader@1b6d3586
        // null
    }
}
```

当然也很明显，这个类的作用就是来加载类，但是注意动态代理执行的时候是借用其他的类的类加载器

动态代理生成的代理类通常是在运行时通过字节码生成技术生成的，因此在创建代理对象时，需要一个 ClassLoader 来加载这个新生成的代理类。这里会使用调用线程的当前类加载器（即调用者的类加载器）来加载这个代理类。

通常情况下，动态代理的实现不会使用 Bootstrap ClassLoader（启动类加载器）来加载代理类，因为这样的代理类对于 JVM 来说并不是一个内置类。相反，它会使用调用者的类加载器和父类加载器来加载代理类，这样就确保了代理类的可见性和正确性。

#### `InvocationHandler `

`invoke()`
在 InvocationHandler 接口中的 invoke() 方法中，有三个参数：

`Object proxy`：代理对象本身。在 invoke() 方法中，可以使用 proxy 参数来调用代理对象的其他方法，或者在特定情况下使用代理对象本身。

`Method method`：被调用的方法对象。method 参数表示当前正在调用的方法，通过它可以获取方法的名称、参数等信息。

`Object[] args`：方法的参数数组。args 参数是一个对象数组，表示传递给方法的参数。通过这个数组，可以获取方法调用时传递的具体参数值。

```java
package com.shu.aop;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/22 17:47
 * @version: 1.0
 */
public class TestInvocationHandler implements InvocationHandler {

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {

        return null;
    }
}

```

### 1.1.5  CGLIB 动态代理

依赖

```xml
        <dependency>
            <groupId>cglib</groupId>
            <artifactId>cglib</artifactId>
            <version>2.2.2</version>
        </dependency>

```

编写代理类

```java
package com.shu.aop.demo03;

import net.sf.cglib.proxy.MethodInterceptor;
import net.sf.cglib.proxy.MethodProxy;
import org.aopalliance.intercept.MethodInvocation;

import java.lang.reflect.Method;

/**
 * @description: cglib动态代理类，实现MethodInterceptor接口
 * @author: shu
 * @createDate: 2023/7/22 17:58
 * @version: 1.0
 */
public class MyMethodInterceptor implements MethodInterceptor {

    @Override
    public Object intercept(Object obj, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
        System.out.println("这里是对目标类进行增强！！！");
        //注意这里的方法调用，不是用反射哦！！！
        Object object = methodProxy.invokeSuper(obj, args);
        return object;
    }
}
```

测试

```java
package com.shu.aop.demo03;

import com.shu.aop.demo02.Production;
import com.shu.aop.demo02.Sell;
import net.sf.cglib.proxy.Enhancer;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/22 18:00
 * @version: 1.0
 */
public class CglibTest {
    public static void main(String[] args) {
        //创建Enhancer对象，类似于JDK动态代理的Proxy类，下一步就是设置几个参数
        Enhancer enhancer = new Enhancer();
        //设置目标类的字节码文件
        enhancer.setSuperclass(Production.class);
        //设置回调函数
        enhancer.setCallback(new MyMethodInterceptor());
        //这里的creat方法就是正式创建代理类
        Production production = (Production) enhancer.create();
        production.market();
        production.add();
    }
}
```

### 1.1.6 JDK和CGLib动态代理区别

**JDK动态代理具体实现原理**：
通过实现InvocationHandler接口创建自己的调用处理器；

通过为Proxy类指定ClassLoader对象和一组interface来创建动态代理；

通过反射机制获取动态代理类的构造函数，其唯一参数类型就是调用处理器接口类型；

通过构造函数创建动态代理类实例，构造时调用处理器对象作为参数参入；

JDK动态代理是面向接口的代理模式，如果被代理目标没有接口那么Spring也无能为力，Spring通过Java的反射机制生产被代理接口的新的匿名实现类，重写了其中AOP的增强方法。

**CGLib动态代理具体实现原理：**
利用ASM开源包，对代理对象类的class文件加载进来，通过修改其字节码生成子类来处理。

**两者对比：**
JDK动态代理是面向接口的。

CGLib动态代理是通过字节码底层继承要代理类来实现，因此如果被代理类被final关键字所修饰，会失败。在创建代理这一块没有JDK动态代理快，但是运行速度比JDK动态代理要快。

**使用注意：**
如果要被代理的对象是个实现类，那么Spring会使用JDK动态代理来完成操作（Spring默认采用JDK动态代理实现机制）；

如果要被代理的对象不是个实现类那么，Spring会强制使用CGLib来实现动态代理。

**JDK和CGLib效率区别**
创建效率： CGLib由于创建多个.class文件所以创建效率肯定要慢于JDK动态代理

调用效率：CGLib是要优于JDK的，因为JDK使用的反射，而CGLib直接调用

**为什么Java反射性能慢效率低**
我们都知道 Java 代码是需要编译才能在虚拟机里运行的，但其实 Java 的编译期是一段不确定的操作过程。因为它可能是一个前端编译器（如 Javac）把 *.java 文件编译成 *.class 文件的过程；也可能是程序运行期的即时编译器（JIT 编译器，Just In Time Compiler）把字节码文件编译成机器码的过程；还可能是静态提前编译器（AOT 编译器，Ahead Of Time Compiler）直接把 *.java 文件编译成本地机器码的过程。

其中即时编译器（JIT）在运行期的优化过程对于程序运行来说更重要，Java虚拟机在编译阶段的代码优化就在这里进行，由于反射涉及动态解析的类型，因此无法执行某些Java虚拟机优化。因此，反射操作的性能要比非反射操作慢，因此应该避免在对性能敏感的应用程序中频繁使用Java反射来创建对象。

**JDK和CGLib动态代理性能对比**
关于两者之间的性能的话，网上有人对于不通版本的jdk进行测试，经过多次试验，测试结果大致是这样的，在1.6和1.7的时候，JDK动态代理的速度要比CGLib动态代理的速度要慢，但是并没有教科书上的10倍差距，在JDK1.8的时候，JDK动态代理的速度已经比CGLib动态代理的速度快很多了，但是JDK动态代理和CGLIB动态代理的适用场景还是不一样的哈！
