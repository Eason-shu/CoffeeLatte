---
title: Java基础复习（一）
tags:
  - Java
  - 学习笔记
  - 面试
authors:
- EasonShu
last_update:
  date: 2023-10-21
  author: EasonShu
---


- Java SE（Java Platform，Standard Edition）: Java 平台标准版，Java 编程语言的基础，它包含了支持 Java 应用程序开发和运行的核心类库以及虚拟机等核心组件。Java SE 可以用于构建桌面应用程序或简单的服务器应用程序。
- Java EE（Java Platform, Enterprise Edition ）：Java 平台企业版，建立在 Java SE 的基础上，包含了支持企业级应用程序开发和部署的标准和规范（比如 Servlet、JSP、EJB、JDBC、JPA、JTA、JavaMail、JMS）。 Java EE 可以用于构建分布式、可移植、健壮、可伸缩和安全的服务端 Java 应用程序，例如 Web 应用程序。

简单来说，Java SE 是 Java 的基础版本，Java EE 是 Java 的高级版本。Java SE 更适合开发桌面应用程序或简单的服务器应用程序，Java EE 更适合开发复杂的企业级应用程序或 Web 应用程序。
除了 Java SE 和 Java EE，还有一个 Java ME（Java Platform，Micro Edition）。Java ME 是 Java 的微型版本，主要用于开发嵌入式消费电子设备的应用程序，例如手机、PDA、机顶盒、冰箱、空调等。Java ME 无需重点关注，知道有这个东西就好了，现在已经用不上了。
### 1.2 JVM
Java 虚拟机（JVM）是运行 Java 字节码的虚拟机。JVM 有针对不同系统的特定实现（Windows，Linux，macOS），目的是使用相同的字节码，它们都会给出相同的结果。字节码和不同系统的 JVM 实现是 Java 语言“一次编译，随处可以运行”的关键所在。
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1698245510242-a7c5d2c1-0f60-41d7-8df7-e1ee1da9a48d.png#averageHue=%23f4fdf6&clientId=u96099136-2396-4&from=paste&id=u18c79af5&originHeight=603&originWidth=1021&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u6a48ff66-5c74-4cab-99f2-c8719f771af&title=)
运行在 Java 虚拟机之上的编程语言
**JVM 并不是只有一种！只要满足 JVM 规范，每个公司、组织或者个人都可以开发自己的专属 JVM。** 也就是说我们平时接触到的 HotSpot VM 仅仅是是 JVM 规范的一种实现而已。
除了我们平时最常用的 HotSpot VM 外，还有 J9 VM、Zing VM、JRockit VM 等 JVM 。维基百科上就有常见 JVM 的对比：[Comparison of Java virtual machinesopen in new window](https://en.wikipedia.org/wiki/Comparison_of_Java_virtual_machines) ，感兴趣的可以去看看。并且，你可以在 [Java SE Specificationsopen in new window](https://docs.oracle.com/javase/specs/index.html) 上找到各个版本的 JDK 对应的 JVM 规范。
![](https://cdn.nlark.com/yuque/0/2023/jpeg/12426173/1698245510245-93e7ebc6-f65f-4fee-94bf-9960c14c9d3c.jpeg#averageHue=%23f6f5f5&clientId=u96099136-2396-4&from=paste&id=u06e3eb81&originHeight=651&originWidth=749&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u7629dbeb-7141-482f-b7fa-de4ad12f289&title=)
### 1.3 JDK 和 JRE

- JDK（Java Development Kit），它是功能齐全的 Java SDK，是提供给开发者使用的，能够创建和编译 Java 程序。他包含了 JRE，同时还包含了编译 java 源码的编译器 javac 以及一些其他工具比如 javadoc（文档注释工具）、jdb（调试器）、jconsole（基于 JMX 的可视化监控⼯具）、javap（反编译工具）等等。
- JRE（Java Runtime Environment） 是 Java 运行时环境。它是运行已编译 Java 程序所需的所有内容的集合，主要包括 Java 虚拟机（JVM）、Java 基础类库（Class Library）。
- 也就是说，JRE 是 Java 运行时环境，仅包含 Java 应用程序的运行时环境和必要的类库。而 JDK 则包含了 JRE，同时还包括了 javac、javadoc、jdb、jconsole、javap 等工具，可以用于 Java 应用程序的开发和调试。如果需要进行 Java 编程工作，比如编写和编译 Java 程序、使用 Java API 文档等，就需要安装 JDK。而对于某些需要使用 Java 特性的应用程序，如 JSP 转换为 Java Servlet、使用反射等，也需要 JDK 来编译和运行 Java 代码。因此，即使不打算进行 Java 应用程序的开发工作，也有可能需要安装 JDK。

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1698245667659-c11f4129-9821-4c28-a1f2-663c213ae0aa.png#averageHue=%23fddd9c&clientId=u96099136-2396-4&from=paste&id=u8fcb5acc&originHeight=409&originWidth=670&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u2d0ed049-f5cf-4864-b195-348e1138332&title=)
### 1.4 什么是字节码?采用字节码的好处是什么?

- 在 Java 中，JVM 可以理解的代码就叫做字节码（即扩展名为 .class 的文件），它不面向任何特定的处理器，只面向虚拟机。Java 语言通过字节码的方式，在一定程度上解决了传统解释型语言执行效率低的问题，同时又保留了解释型语言可移植的特点。
- 所以， Java 程序运行时相对来说还是高效的（不过，和 C、 C++，Rust，Go 等语言还是有一定差距的），而且，由于字节码并不针对一种特定的机器，因此，Java 程序无须重新编译便可在多种不同操作系统的计算机上运行。

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1698246115995-a350b7b1-c5a6-455e-b948-690efacdb7eb.png#averageHue=%23f4fdf6&clientId=u96099136-2396-4&from=paste&id=ub73dbd1b&originHeight=294&originWidth=756&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=uea8d49ad-32a0-4468-82ae-fa03f3c36dd&title=)

- 我们需要格外注意的是 .class->机器码 这一步。在这一步 JVM 类加载器首先加载字节码文件，然后通过解释器逐行解释执行，这种方式的执行速度会相对比较慢。而且，有些方法和代码块是经常需要被调用的(也就是所谓的热点代码)，所以后面引进了 **JIT（Just in Time Compilation）** 编译器，而 JIT 属于运行时编译。当 JIT 编译器完成第一次编译后，其会将字节码对应的机器码保存下来，下次可以直接使用。而我们知道，机器码的运行效率肯定是高于 Java 解释器的。这也解释了我们为什么经常会说 **Java 是编译与解释共存的语言**

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1698246150665-0117cfd9-c492-4fba-94ac-869dd37768c2.png#averageHue=%23f4fdf6&clientId=u96099136-2396-4&from=paste&id=u64262061&originHeight=359&originWidth=811&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=ubb564db0-1757-406c-9f81-e183e4e4113&title=)

- HotSpot 采用了惰性评估(Lazy Evaluation)的做法，根据二八定律，消耗大部分系统资源的只有那一小部分的代码（热点代码），而这也就是 JIT 所需要编译的部分。JVM 会根据代码每次被执行的情况收集信息并相应地做出一些优化，因此执行的次数越多，它的速度就越快。
### 1.5 为什么说 Java 语言“编译与解释并存”？
我们可以将高级编程语言按照程序的执行方式分为两种：

- **编译型**：[编译型语言open in new window](https://zh.wikipedia.org/wiki/%E7%B7%A8%E8%AD%AF%E8%AA%9E%E8%A8%80) 会通过[编译器open in new window](https://zh.wikipedia.org/wiki/%E7%B7%A8%E8%AD%AF%E5%99%A8)将源代码一次性翻译成可被该平台执行的机器码。一般情况下，编译语言的执行速度比较快，开发效率比较低。常见的编译性语言有 C、C++、Go、Rust 等等。
- **解释型**：[解释型语言open in new window](https://zh.wikipedia.org/wiki/%E7%9B%B4%E8%AD%AF%E8%AA%9E%E8%A8%80)会通过[解释器open in new window](https://zh.wikipedia.org/wiki/%E7%9B%B4%E8%AD%AF%E5%99%A8)一句一句的将代码解释（interpret）为机器代码后再执行。解释型语言开发效率比较快，执行速度比较慢。常见的解释性语言有 Python、JavaScript、PHP 等等。

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1702951677007-dd3b0ad4-6b92-4f0d-ab0a-0ede4c7c5f5d.png#averageHue=%23f4fdf6&clientId=u55f1c1b9-445b-4&from=paste&id=uafc33a71&originHeight=471&originWidth=501&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u0c2807f7-8415-44a6-b26c-008ee392805&title=)
**为什么说 Java 语言“编译与解释并存”？**
这是因为 Java 语言既具有编译型语言的特征，也具有解释型语言的特征。因为 Java 程序要经过先编译，后解释两个步骤，由 Java 编写的程序需要先经过编译步骤，生成字节码（.class 文件），这种字节码必须由 Java 解释器来解释执行。
### 1.6 AOT 有什么优点？为什么不全部使用 AOT 呢？
 JDK 9 引入了一种新的编译模式 **AOT(Ahead of Time Compilation)** 。和 JIT 不同的是，这种编译模式会在程序被执行前就将其编译成机器码，属于静态编译（C、 C++，Rust，Go 等语言就是静态编译）。AOT 避免了 JIT 预热等各方面的开销，可以提高 Java 程序的启动速度，避免预热时间长。并且，AOT 还能减少内存占用和增强 Java 程序的安全性（AOT 编译后的代码不容易被反编译和修改），特别适合云原生场景。
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1702951837068-e1f72452-95e8-422a-a6de-146257b75364.png#averageHue=%23f7f4ee&clientId=u55f1c1b9-445b-4&from=paste&id=u1fb9fce3&originHeight=1262&originWidth=2055&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u544d2bb0-1d08-40cc-a53c-547dd82b7af&title=)
**既然 AOT 这么多优点，那为什么不全部使用这种编译方式呢？**
我们前面也对比过 JIT 与 AOT，两者各有优点，只能说 AOT 更适合当下的云原生场景，对微服务架构的支持也比较友好。除此之外，AOT 编译无法支持 Java 的一些动态特性，如反射、动态代理、动态加载、JNI（Java Native Interface）等。然而，很多框架和库（如 Spring、CGLIB）都用到了这些特性。如果只使用 AOT 编译，那就没办法使用这些框架和库了，或者说需要针对性地去做适配和优化。举个例子，CGLIB 动态代理使用的是 ASM 技术，而这种技术大致原理是运行时直接在内存中生成并加载修改后的字节码文件也就是 .class 文件，如果全部使用 AOT 提前编译，也就不能使用 ASM 技术了。为了支持类似的动态特性，所以选择使用 JIT 即时编译器。
### 1.7 基本数据类型
Java 中有 8 种基本数据类型，分别为：

- 6 种数字类型： 
   - 4 种整数型：byte、short、int、long
   - 2 种浮点型：float、double
- 1 种字符类型：char
- 1 种布尔型：boolean。

这 8 种基本数据类型的默认值以及所占空间的大小如下：
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1702955634638-dbe165a7-d6b7-4f5c-90d9-99f8c3139862.png#averageHue=%23fbfbfb&clientId=u55f1c1b9-445b-4&from=paste&height=444&id=ue1589402&originHeight=555&originWidth=989&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=70532&status=done&style=none&taskId=ua9c6caab-1301-4f70-b493-088e3fd9a5f&title=&width=791.2)
### 1.8 基本类型和包装类型的区别？
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1702955711056-1c6485c9-14e8-4753-8407-1f30ff55cb00.png#averageHue=%23e6f4ec&clientId=u55f1c1b9-445b-4&from=paste&id=u1ebd08aa&originHeight=152&originWidth=701&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u990f321f-e686-4c29-a2a8-98d87183e10&title=)
基本类型 vs 包装类型

- **用途**：除了定义一些常量和局部变量之外，我们在其他地方比如方法参数、对象属性中很少会使用基本类型来定义变量。并且，包装类型可用于泛型，而基本类型不可以。
- **存储方式**：基本数据类型的局部变量存放在 Java 虚拟机栈中的局部变量表中，基本数据类型的成员变量（未被 static 修饰 ）存放在 Java 虚拟机的堆中。包装类型属于对象类型，我们知道几乎所有对象实例都存在于堆中。
- **占用空间**：相比于包装类型（对象类型）， 基本数据类型占用的空间往往非常小。
- **默认值**：成员变量包装类型不赋值就是 null ，而基本类型有默认值且不是 null。
- **比较方式**：对于基本数据类型来说，== 比较的是值。对于包装数据类型来说，== 比较的是对象的内存地址。所有整型包装类对象之间值的比较，全部使用 equals() 方法。
### 1.9 静态变量有什么作用？
静态变量也就是被 static 关键字修饰的变量。它可以被类的所有实例共享，无论一个类创建了多少个对象，它们都共享同一份静态变量。也就是说，静态变量只会被分配一次内存，即使创建多个对象，这样可以节省内存。






