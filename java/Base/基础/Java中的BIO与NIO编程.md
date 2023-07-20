---
title: Java中的BIO与NIO编程
sidebar_position: 7
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
![Java](https://img1.baidu.com/it/u=1674108507,3962600426&fm=253&fmt=auto&app=138&f=JPEG?w=889&h=500)
# BIO编程
## 一 概述

- BIO是同步阻塞IO，JDK1.4之前只有这一个IO模型，BIO操作的对象是流，一个线程只能处理一个流的IO请求，如果想要同时处理多个流就需要使用多线程。
- **流包括字符流和字节流**，流从概念上来说是一个连续的数据流。当程序需要读数据的时候就需要使用输入流读取数据，当需要往外写数据的时候就需要输出流。
- 在Linux中，当应用进程调用**recvfrom**方法调用数据的时候，如果内核没有把数据准备好不会立刻返回，而是会经历等待数据准备就绪，数据从内核复制到用户空间之后再返回，这期间应用进程一直阻塞直到返回，所以被称为阻塞IO模型。
## 二 流

- BIO中操作的流主要有两大类，字节流和字符流，两类根据流的方向都可以分为输入流和输出流

按照类型和输入输出方向可分为：**输入字节流：InputStream，输出字节流：OutputStream，输入字符流：Reader，输出字符流：Writer**。

- 字节流主要用来处理字节或二进制对象，字符流用来处理字符文本或字符串。
- InputStreamReader可以将输入字节流转化为输入字符流。
- 使用InputStreamReader可以将输入字节流转化为输入字符流。
```java
Reader reader  =  new InputStreamReader(inputStream);
```

- 使用OutputStreamWriter可以将输出字节流转化为输出字符流。
```java
Writer writer = new OutputStreamWriter(outputStream);
```
![](https://cdn.nlark.com/yuque/0/2022/webp/12426173/1645082928382-6ef86975-868c-478e-a54b-1f4830ca75f9.webp#clientId=u075b31f0-61a9-4&from=paste&id=u9c33a3de&originHeight=396&originWidth=664&originalType=url&ratio=1&rotation=0&showTitle=false&status=done&style=none&taskId=uf516d3ef-2c25-4c44-88b1-51b448715c5&title=)![](https://cdn.nlark.com/yuque/0/2022/webp/12426173/1645083399298-2a7afdc3-8829-4dd4-b653-7745f64f5728.webp#clientId=u075b31f0-61a9-4&from=paste&id=ua06a309e&originHeight=370&originWidth=553&originalType=url&ratio=1&rotation=0&showTitle=false&status=done&style=none&taskId=ub5ad7217-5e5c-4ded-a614-f011b9cdae6&title=)

- 输入字节流：**InputStream**
```java
public static void main(String[] args) throws Exception{
    File file = new File("D:/a.txt");
    InputStream inputStream = new FileInputStream(file);
    byte[] bytes = new byte[(int) file.length()];
    inputStream.read(bytes);
    System.out.println(new String(bytes));
    inputStream.close();
}
```

- 输入字符流：**Reader**
```java
public static void main(String[] args) throws Exception{
    File file = new File("D:/a.txt");
    Reader reader = new FileReader(file);
    char[] bytes = new char[(int) file.length()];
    reader.read(bytes);
    System.out.println(new String(bytes));
    reader.close();
}
```

- 输出字节流：**OutputStream**
```java
public static void main(String[] args) throws Exception{
    String var = "hai this is a test";
    File file = new File("D:/b.txt");
    OutputStream outputStream = new FileOutputStream(file);
    outputStream.write(var.getBytes());
    outputStream.close();
}
```

- 输出字符流：**Writer**
```java
public static void main(String[] args) throws Exception{
    String var = "hai this is a test";
    File file = new File("D:/b.txt");
    Writer writer = new FileWriter(file);
    writer.write(var);
    writer.close();
}
```

- 在使用InputStream的时候，都是一个字节一个字节的读或写，而BufferedInputStream为输入字节流提供了缓冲区，读数据的时候会一次读取一块数据放到缓冲区里，当缓冲区里的数据被读完之后，输入流会再次填充数据缓冲区，直到输入流被读完，有了缓冲区就能够提高很多io速度。
```java
package BIO;

import java.io.*;

/**
 * @Author shu
 * @Date: 2022/02/18/ 9:32
 * @Description 缓冲流测试
 **/
public class BufferedTest {

        public static void write(File file) throws IOException {
            // 缓冲字节流，提高了效率
            BufferedOutputStream bis = new BufferedOutputStream(new FileOutputStream(file, true));
            // 要写入的字符串
            String string = "松下问童子，言师采药去。只在此山中，云深不知处。";
            // 写入文件
            bis.write(string.getBytes());
            // 关闭流
            bis.close();
        }


        public static String read(File file) throws IOException {
            BufferedInputStream fis = new BufferedInputStream(new FileInputStream(file));
            // 一次性取多少个字节
            byte[] bytes = new byte[1024];
            // 用来接收读取的字节数组
            StringBuilder sb = new StringBuilder();
            // 读取到的字节数组长度，为-1时表示没有数据
            int length = 0;
            // 循环取数据
            while ((length = fis.read(bytes)) != -1) {
                // 将读取的内容转换成字符串
                sb.append(new String(bytes, 0, length));
            }
            // 关闭流
            fis.close();
            return sb.toString();
        }
}
```

# NIO编程

## 一 三大组件

Java NIO系统的**核心**在于：**通道(Channel)和缓冲区(Buffer)**。通道表示打开到 IO 设备(例如：文件、套接字)的连接。若需要使用 NIO 系统，需要获取用于**连接 IO 设备的通道**以及用于**容纳数据的缓冲区**。然后操作缓冲区，对数据进行处理，简而言之，**通道负责传输，缓冲区负责存储**

![](https://img-blog.csdnimg.cn/d8d1609d70284cb39ec2899fb6802998.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6ZW_5a6J5LiN5Y-K5Y2B6YeM,size_20,color_FFFFFF,t_70,g_se,x_16#pic_center#id=ndqXy&originHeight=496&originWidth=1016&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

### 1.1 Channel

![](https://img-blog.csdnimg.cn/911bf03b9154483ba96edd25c03bcc60.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6ZW_5a6J5LiN5Y-K5Y2B6YeM,size_20,color_FFFFFF,t_70,g_se,x_16#pic_center#id=Zels1&originHeight=296&originWidth=855&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

### 1.2 Buffer

![](https://img-blog.csdnimg.cn/afce35802f8c4bf5ac5bdd2ee189df76.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6ZW_5a6J5LiN5Y-K5Y2B6YeM,size_20,color_FFFFFF,t_70,g_se,x_16#pic_center#id=qq09H&originHeight=482&originWidth=741&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

![](https://img-blog.csdnimg.cn/1ac0a72a186b448ab15e962170541bf9.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6ZW_5a6J5LiN5Y-K5Y2B6YeM,size_15,color_FFFFFF,t_70,g_se,x_16#pic_center#id=eRyC4&originHeight=414&originWidth=562&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

我们用的比较多的是`ByteBuffer`

### 1.3 Selector

#### 1.3.1 使用多线程技术

![](https://img-blog.csdnimg.cn/50efd748393d4d1ca0452c81064a8c8d.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6ZW_5a6J5LiN5Y-K5Y2B6YeM,size_15,color_FFFFFF,t_70,g_se,x_16#pic_center#id=h7oLm&originHeight=249&originWidth=584&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

- 内存占用高，每个线程都需要占用一定的内存，当连接较多时，会开辟大量线程，导致占用大量内存
- 线程上下文切换成本高
- 只适合连接数少的场景，连接数过多，会导致创建很多线程，从而出现问题

#### 1.3.2 使用线程池技术

![](https://img-blog.csdnimg.cn/c5f0d4c46d424e258f08b21517316ab9.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6ZW_5a6J5LiN5Y-K5Y2B6YeM,size_20,color_FFFFFF,t_70,g_se,x_16#pic_center#id=CgKRO&originHeight=246&originWidth=771&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

-  阻塞模式下，线程仅能处理一个连接，线程池中的线程获取任务（task）后，**只有当其执行完任务之后（断开连接后），才会去获取并执行下一个任务**
-  若socke连接一直未断开，则其对应的线程无法处理其他socke连接
-  短连接即建立连接发送请求并响应后就立即断开，使得线程池中的线程可以快速处理其他连接
#### 1.3.3 Selector 技术

![](https://img-blog.csdnimg.cn/86b92901be524f2b809b6df63eed0355.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6ZW_5a6J5LiN5Y-K5Y2B6YeM,size_16,color_FFFFFF,t_70,g_se,x_16#pic_center#id=zoAW5&originHeight=356&originWidth=592&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

- **selector 的作用就是配合一个线程来管理多个 channel（fileChannel因为是阻塞式的，所以无法使用selector）**，获取这些 channel 上发生的**事件**，这些 channel 工作在**非阻塞模式**下，当一个channel中没有执行任务时，可以去执行其他channel中的任务。**适合连接数多，但流量较少的场景**
- 若事件未就绪，调用 selector 的 select() 方法会阻塞线程，直到 channel 发生了就绪事件。这些事件就绪后，select 方法就会返回这些事件交给 thread 来处理

## 二 ByteBuffer

### 2.1 基本知识了解

-  读写单个字节的绝对和相对get和put方法。
-  将连续字节序列从此缓冲区传输到数组中的相对bulk get方法。
-  bulk put字节数组或其他字节缓冲区中的连续字节序列传输到此缓冲区的相对bulk put方法。
-  读取和写入其他原始类型的值的绝对和相对get和put方法，将它们转换为特定字节顺序的字节序列和从字节序列转换。
-  创建视图缓冲区的方法，允许将字节缓冲区视为包含某些其他原始类型值的缓冲区； 和
compacting 、 duplicating和slicing字节缓冲区的方法。
-  字节缓冲区可以通过allocation （为缓冲区的内容分配空间）或通过wrapping现有字节数组wrapping到缓冲区中来创建。

### 2.2 基本结构

```java
public abstract class ByteBuffer
    extends Buffer
    implements Comparable<ByteBuffer>{
    //成员变量
    final byte[] hb;
    final int offset;
    boolean isReadOnly;

    //构造方法
    ByteBuffer(int mark, int pos, int lim, int cap,   // package-private
                 byte[] hb, int offset)
    {
        super(mark, pos, lim, cap);
        this.hb = hb;
        this.offset = offset;
    }
    //构造方法
    ByteBuffer(int mark, int pos, int lim, int cap) { // package-private
        this(mark, pos, lim, cap, null, 0);
    }
    }
```

### 2.3 基本方法

```java
/**
分配一个新的字节缓冲区。
新缓冲区的位置将为零，它的限制将是它的容量，它的标记将是未定义的，并且它的每个元素都将被初始化为零。 它将有一个backing array ，其array offset为零。
**/
public static ByteBuffer allocateDirect(int capacity) {}
public static ByteBuffer allocate(int capacity) {}

/**
将字节数组包装到缓冲区中。
新缓冲区将由给定的字节数组支持； 也就是说，对缓冲区的修改将导致数组被修改，反之亦然。 新缓冲区的容量将为array.length ，其位置为offset ，其限制为offset + length ，其标记为 undefined 。 它的backing array将是给定的数组，它的array offset将为零
**/
public static ByteBuffer wrap(byte[] array,int offset, int length){}
public static ByteBuffer wrap(byte[] array) {}
```

### 2.4 Buffer基本结构

```java
public abstract class Buffer {
    //mark <= position <= limit <= capacity
    //成员变量
 	private int mark = -1;
    //起始值
    private int position = 0;
    //最大值
    private int limit;
    //容量
    private int capacity;

     //构造器
    Buffer(int mark, int pos, int lim, int cap) {       // package-private
        if (cap < 0)
            throw new IllegalArgumentException("Negative capacity: " + cap);
        this.capacity = cap;
        limit(lim);
        position(pos);
        if (mark >= 0) {
            if (mark > pos)
                throw new IllegalArgumentException("mark > position: ("
                                                   + mark + " > " + pos + ")");
            this.mark = mark;
        }
    }

}
```

### 2.5 Buffer方法

```java
/**
设置此缓冲区的限制。 如果大于新限制，则将其设置为新限制。 如果mark已定义且大于新限制，则将其丢弃。
**/
public final Buffer limit(int newLimit) {}

/**
设置此缓冲区的位置。 如果mark已定义且大于新位置，则将其丢弃。
**/
public final Buffer position(int newPosition) {}

/**
将此缓冲区的位置重置为先前标记的位置。
**/
public final Buffer reset() {}

/**
清除此缓冲区。 将位置设置为零，将限制设置为容量，并丢弃标记。
**/
public final Buffer clear() {}

/**
翻转这个缓冲区。 将限制设置为当前位置，然后将位置设置为零。 如果定义了标记，则将其丢弃。
在一系列通道读取或放置操作之后，调用此方法以准备一系列通道写入或相关获取操作,切换模式
**/

public final Buffer flip() {}

/**
是否有下一个元素
**/
public final boolean hasRemaining() {}

/**
告诉这个缓冲区是否是只读的。
**/
public abstract boolean isReadOnly();

/**
倒带此缓冲区。 位置设置为零，标记被丢弃。
**/
public final Buffer rewind() {}
```

### 2.6 粘包与半包

-  **粘包**
发送方在发送数据时，并不是一条一条地发送数据，而是**将数据整合在一起**，当数据达到一定的数量后再一起发送。这就会导致多条信息被放在一个缓冲区中被一起发送出去
-  **半包**
接收方的缓冲区的大小是有限的，当接收方的缓冲区满了以后，就需要**将信息截断**，等缓冲区空了以后再继续放入数据。这就会发生一段完整的数据最后被截断的现象

### 2.7 简单使用

```java
package com.shu.ByteBuffer;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;

/**
 * @Author shu
 * @Date: 2021/11/12/ 16:35
 * @Description ByteBuffer基本用法
 **/
public class TestByteBuffer {
    public static void main(String[] args) {
        // 获得FileChannel
        try (FileChannel channel = new FileInputStream("shu.txt").getChannel()) {
            // 获得缓冲区
            ByteBuffer buffer = ByteBuffer.allocate(10);
            int hasNext = 0;
            StringBuilder builder = new StringBuilder();
            while((hasNext = channel.read(buffer)) > 0) {
                // 切换模式 limit=position, position=0
                buffer.flip();
                // 当buffer中还有数据时，获取其中的数据
                while(buffer.hasRemaining()) {
                    builder.append((char)buffer.get());
                }
                // 切换模式 position=0, limit=capacity
                buffer.clear();
            }
            System.out.println(builder.toString());
        } catch (IOException e) {
        }
    }
}
```

## 三 Channel

### 3.1 FileChannel

**FileChannel只能在阻塞模式下工作，所以无法搭配Selector**

#### 3.1.1 基本知识

- 用于读取、写入、映射和操作文件的通道。
- 文件通道是连接到文件的SeekableByteChannel 。 它在其文件中有一个当前位置，可以queried和modified 。
- 文件本身包含一个可变长度的字节序列，可以读取和写入，并且可以查询其当前size 。
- 当写入的字节超过其当前大小时，文件的大小会增加； 当文件被truncated时，文件的大小会减小。
- 文件还可能有一些相关的元数据，例如访问权限、内容类型和上次修改时间； 这个类没有定义元数据访问的方法。
- 除了熟悉的字节通道读取、写入和关闭操作外，该类还定义了以下特定于文件的操作：
- 可以以不影响通道当前位置的方式在文件中的绝对位置read或written字节。
- 文件的一个区域可以直接mapped到内存中； 对于大文件，这通常比调用通常的读取或写入方法更有效。
- 对文件所做的更新可能会被forced out到底层存储设备，以确保在系统崩溃时不会丢失数据。
- 字节可以从文件传输to some other channel ， vice versa ，这种方式可以被许多操作系统优化为非常快速的直接传输到文件系统缓存或从文件系统缓存传输。
- 文件的某个区域可能会被locked防止其他程序访问。

#### 3.1.2 基本结构

```java
public abstract class FileChannel
    extends AbstractInterruptibleChannel
    implements SeekableByteChannel, GatheringByteChannel, ScatteringByteChannel
{
    //构造器
    protected FileChannel() { }
}
```

#### 3.1.2 基本方法

```java
/**
打开或创建一个文件，返回一个文件通道来访问该文件。
options参数确定文件的打开方式。 READ和WRITE选项确定是否应该打开文件进行读取和/或写入。 如果数组中不包含任何选项（或APPEND选项），则打开文件进行读取。 默认情况下，读取或写入从文件的开头开始
**/
public static FileChannel open(Path path, Set<? extends OpenOption> options,FileAttribute<?>... attrs)throws IOException{}
public static FileChannel open(Path path, OpenOption... options)
        throws IOException{}

/**
从此通道读取字节序列到给定缓冲区。
从该通道的当前文件位置开始读取字节，然后使用实际读取的字节数更新文件位置。 否则，此方法的行为与ReadableByteChannel接口中指定的完全相同。
**/

 public abstract int read(ByteBuffer dst) throws IOException;

 public abstract long read(ByteBuffer[] dsts, int offset, int length)
        throws IOException;

 public final long read(ByteBuffer[] dsts) throws IOException {
        return read(dsts, 0, dsts.length);
    }


/**
从给定的缓冲区将字节序列写入此通道。
字节从该通道的当前文件位置开始写入，除非通道处于追加模式，在这种情况下，该位置首先前进到文件的末尾。 如有必要，文件会增长以容纳写入的字节，然后使用实际写入的字节数更新文件位置。 否则，此方法的行为与WritableByteChannel接口指定的完全相同。
**/

public abstract int write(ByteBuffer src) throws IOException;

public abstract long write(ByteBuffer[] srcs, int offset, int length)
        throws IOException;

public final long write(ByteBuffer[] srcs) throws IOException {
        return write(srcs, 0, srcs.length);
    }

/**
返回当前的位置
**/

public abstract long position() throws IOException;

/**
零拷贝：这种方法可能比从该通道读取并写入目标通道的简单循环更有效。 许多操作系统可以将字节直接从文件系统缓存传输到目标通道，而无需实际复制它们。
**/
public abstract long transferTo(long position, long count,
                                    WritableByteChannel target)
        throws IOException;

/**
强制写入：强制将此频道文件的任何更新写入包含它的存储设备。
**/
 public abstract void force(boolean metaData) throws IOException;
```

#### 3.1.4 基本适用

```java
public class TestChannel {
    public static void main(String[] args){
        try (FileInputStream fis = new FileInputStream("shu.txt");
             FileOutputStream fos = new FileOutputStream("student.txt");
             FileChannel inputChannel = fis.getChannel();
             FileChannel outputChannel = fos.getChannel()) {
            long size = inputChannel.size();
            long capacity = inputChannel.size();
            // 分多次传输
            while (capacity > 0) {
                // transferTo返回值为传输了的字节数
                capacity -= inputChannel.transferTo(size-capacity, capacity, outputChannel);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### 3.2 ServerSocketChannel

#### 3.2.1 阻塞

- 阻塞模式下，相关方法都会导致线程暂停
   - `ServerSocketChannel.accept` 会在**没有连接建立时**让线程暂停
   - `SocketChannel.read` 会在**通道中没有数据可读时**让线程暂停
   - 阻塞的表现其实就是线程暂停了，暂停期间不会占用 cpu，但线程相当于闲置
- 单线程下，阻塞方法之间相互影响，几乎不能正常工作，需要多线程支持
- 但多线程下，有新的问题，体现在以下方面
   - 32 位 `jvm` 一个线程 `320k`，64 位 `jvm` 一个线程 `1024k`，如果连接数过多，必然导致 `OOM`，并且线程太多，反而会因为频繁上下文切换导致性能降低
   - 可以采用线程池技术来减少线程数和线程上下文切换，但治标不治本，如果有很多连接建立，但长时间 inactive，会阻塞线程池中所有线程，因此不适合长连接，只适合短连接

#### 3.2.2 非阻塞

- 可以通过`ServerSocketChannel的configureBlocking(**false**)`方法将**获得连接设置为非阻塞的**。此时若没有连接，accept会返回null
- 可以通过`SocketChannel的configureBlocking(**false**)`方法将从通道中**读取数据设置为非阻塞的**。若此时通道中没有数据可读，read会返回-1

#### 3.2.3 基本结构

```java
public abstract class ServerSocketChannel extends AbstractSelectableChannel
 implements NetworkChannel{
    //构造器
     protected ServerSocketChannel(SelectorProvider provider) {
        super(provider);
    }
    }
```

#### 3.2.4 基本方法

```java
/**
打开一个服务器套接字通道。
新通道是通过调用系统范围默认SelectorProvider对象的openServerSocketChannel方法创建的。
新通道的套接字最初是未绑定的； 在接受连接之前，它必须通过其套接字的bind方法之一绑定到特定地址
**/
 public static ServerSocketChannel open() throws IOException {
        return SelectorProvider.provider().openServerSocketChannel();
    }


/**
绑定一个端口
**/

 public final ServerSocketChannel bind(SocketAddress local)
        throws IOException
    {
        return bind(local, 0);
    }


/**
接受与此通道的套接字建立的连接。
如果此通道处于非阻塞模式，则如果没有挂起的连接，则此方法将立即返回null 。 否则它将无限期地阻塞，直到新连接可用或发生 I/O 错误。
此方法返回的套接字通道（如果有）将处于阻塞模式，无论此通道的阻塞模式如何。
此方法执行与ServerSocket类的accept方法完全相同的安全检查。 也就是说，如果已经安装了安全管理器，那么对于每个新连接，此方法都会验证安全管理器的checkAccept方法是否允许连接的远程端点的地址和端口号。
**/
 public abstract SocketChannel accept() throws IOException;
```

#### 3.2.5 AbstractSelectableChannel基本结构

```java
/**
此类定义了处理通道注册、取消注册和关闭机制的方法。 它保持该通道的当前阻塞模式及其当前的选择键集。 它执行实现SelectableChannel规范所需的所有同步。 此类中定义的抽象受保护方法的实现不需要与可能参与相同操作的其他线程同步。
**/
public abstract class AbstractSelectableChannel extends SelectableChannel{

     // The provider that created this channel
    private final SelectorProvider provider;

    // Keys that have been created by registering this channel with selectors.
    // They are saved because if this channel is closed the keys must be
    // deregistered.  Protected by keyLock.
    //
    private SelectionKey[] keys = null;
    private int keyCount = 0;

    // Lock for key set and count
    private final Object keyLock = new Object();

    // Lock for registration and configureBlocking operations
    private final Object regLock = new Object();

    // Blocking mode, protected by regLock
    boolean blocking = true;


    protected AbstractSelectableChannel(SelectorProvider provider) {
        this.provider = provider;
    }
    }
```

#### 3.2.6 AbstractSelectableChannel 基本方法

```java
/**
调整此通道的阻塞模式。
如果给定的阻塞模式与当前的阻塞模式不同，则此方法调用implConfigureBlocking方法，同时持有适当的锁，以更改模式
**/
 public final SelectableChannel configureBlocking(boolean block)
        throws IOException
    {
        synchronized (regLock) {
            if (!isOpen())
                throw new ClosedChannelException();
            if (blocking == block)
                return this;
            if (block && haveValidKeys())
                throw new IllegalBlockingModeException();
            implConfigureBlocking(block);
            blocking = block;
        }
        return this;
    }

/**
用给定的选择器注册这个通道，返回一个选择键。
此方法首先验证此通道是否打开以及给定的初始兴趣集是否有效。
如果该频道已经向给定的选择器注册，则在将其兴趣集设置为给定值后，将返回代表该注册的选择键。
否则这个通道还没有注册到给定的选择器，所以选择器的register方法在持有适当的锁时被调用。 结果键在返回之前被添加
**/

 public final SelectionKey register(Selector sel, int ops,
                                       Object att)
        throws ClosedChannelException
    {
        synchronized (regLock) {
            if (!isOpen())
                throw new ClosedChannelException();
            if ((ops & ~validOps()) != 0)
                throw new IllegalArgumentException();
            if (blocking)
                throw new IllegalBlockingModeException();
            SelectionKey k = findKey(sel);
            if (k != null) {
                k.interestOps(ops);
                k.attach(att);
            }
            if (k == null) {
                // New registration
                synchronized (keyLock) {
                    if (!isOpen())
                        throw new ClosedChannelException();
                    k = ((AbstractSelector)sel).register(this, ops, att);
                    addKey(k);
                }
            }
            return k;
        }
    }
```

#### 3.2.7 基本实现

```java
public class Server {
    public static void main(String[] args) {
        // 创建缓冲区
        ByteBuffer buffer = ByteBuffer.allocate(16);
        // 获得服务器通道
        try(ServerSocketChannel server = ServerSocketChannel.open()) {
            // 为服务器通道绑定端口
            server.bind(new InetSocketAddress(8080));
            // 用户存放连接的集合
            ArrayList<SocketChannel> channels = new ArrayList<>();
            // 循环接收连接
            while (true) {
                // 设置为非阻塞模式，没有连接时返回null，不会阻塞线程
                server.configureBlocking(false);
                SocketChannel socketChannel = server.accept();
                // 通道不为空时才将连接放入到集合中
                if (socketChannel != null) {
                    System.out.println("after connecting...");
                    channels.add(socketChannel);
                }
                // 循环遍历集合中的连接
                for(SocketChannel channel : channels) {
                    // 处理通道中的数据
                    // 设置为非阻塞模式，若通道中没有数据，会返回0，不会阻塞线程
                    channel.configureBlocking(false);
                    int read = channel.read(buffer);
                    if(read > 0) {
                        buffer.flip();
                        ByteBufferUtil.debugRead(buffer);
                        buffer.clear();
                        System.out.println("after reading");
                    }
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}


public class Client {
    public static void main(String[] args) {
        try (SocketChannel socketChannel = SocketChannel.open()) {
            // 建立连接
            socketChannel.connect(new InetSocketAddress("localhost", 8080));
            System.out.println("waiting...");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

## 四  Selector

Selector一般称为选择器，也可以翻译为多路复用器，是Java NIO核心组件之一，主要功能是用于检查一个或者多个NIO Channel（通道）的状态是否处于可读、可写。如此可以实现单线程管理多个Channel（通道），当然也可以管理多个网络连接。

![](https://img-blog.csdnimg.cn/0dd321cf82784cc8b124ff7a65cb1e45.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6ZW_5a6J5LiN5Y-K5Y2B6YeM,size_17,color_FFFFFF,t_70,g_se,x_16#pic_center#id=vvART&originHeight=260&originWidth=636&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

### 4.1 Selector

#### 4.1.1 基本知识

-  将**通道设置为非阻塞模式**，并注册到选择器中，并设置感兴趣的事件
-  channel 必须工作在非阻塞模式
-  FileChannel 没有非阻塞模式，因此不能配合 selector 一起使用
-  connect - 客户端连接成功时触发
-  accept - 服务器端成功接受连接时触发
-  read - 数据可读入时触发，有因为接收能力弱，数据暂不能读入的情况
-  write - 数据可写出时触发，有因为发送能力弱，数据暂不能写出的情况
-  SelectableChannel对象的多路复用器。可以通过调用该类的open方法来创建选择器，该方法将使用系统默认的selector provider来创建新的选择器。
-  也可以通过调用自定义选择器提供者的openSelector方法来创建选择器。 选择器保持打开状态，直到通过其close方法关闭为止。

#### 4.1.2 基本结构

![](https://img-blog.csdnimg.cn/d752d90b478548f29b30e0f117664436.png#pic_center#id=kTuZo&originHeight=170&originWidth=1301&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

```java
public abstract class Selector implements Closeable {
     protected Selector() { }
}
```

#### 4.1.3 基本方法

```java
/**
打开一个选择器。新的选择器是通过调用系统范围默认SelectorProvider对象的openSelector方法创建的。
**/
public static Selector open() throws IOException {
    return SelectorProvider.provider().openSelector();
}

/**
使尚未返回的第一个选择操作立即返回。
如果另一个线程当前在select()或select(long)方法的调用中被阻塞，那么该调用将立即返回。
**/
 public abstract Selector wakeup();

/**
关闭此选择器。
如果一个线程当前在此选择器的选择方法之一中被阻塞，那么它将被中断，就像调用选择器的wakeup方法一样。
**/
public abstract void close() throws IOException;

/**
选择一组键，其对应的通道已准备好进行 I/O 操作。
此方法执行阻塞选择操作。 它仅在至少选择一个通道、调用此选择器的wakeup方法或当前线程被中断（以先到者为准）后返回。并获得就绪的通道个数，若没有通道就绪，线程会被阻塞
**/
public abstract int select() throws IOException;

/**
返回此选择器的选定键集,获取就绪事件并得到对应的通道
**/
public abstract Set<SelectionKey> selectedKeys();
```

### 4.2 SelectionKey

#### 4.2.1 基本知识

- 表示SelectableChannel注册到Selector令牌。
- 每次使用选择器注册频道时，都会创建一个选择键。
- 直到它被调用其取消一个关键保持有效cancel方法，通过关闭它的信道，或通过关闭它的选择器。
- 取消一个键不会立即将它从它的选择器中删除； 它会被添加到选择器的取消键集中，以便在下一次选择操作期间移除。
- 可以通过调用其isValid方法来测试密钥的有效性。

#### 4.2.2 基本结构

![](https://img-blog.csdnimg.cn/da7f1350ae7b4514804bba8f36ee23d7.png#pic_center#id=bLg7m&originHeight=95&originWidth=801&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

```java
public abstract class SelectionKey {
    protected SelectionKey() { }
}
```

#### 4.2.3 基本方法

```java
 public static final int OP_READ = 1 << 0;
 public static final int OP_WRITE = 1 << 2;
 public static final int OP_CONNECT = 1 << 3;
 public static final int OP_ACCEPT = 1 << 4;

/**
告诉此密钥是否有效。
一个键在创建时有效，并一直保持到它被取消、它的通道被关闭或它的选择器被关闭。
**/
 public abstract boolean isValid();


/**
请求取消此键的通道与其选择器的注册。 返回后，该键将无效，并将被添加到其选择器的取消键集中。 在下一次选择操作期间，该键将从所有选择器的键集中删除。
**/
 public abstract void cancel();


/**
测试此通道是否已准备好读取。
**/
 public final boolean isReadable() {
        return (readyOps() & OP_READ) != 0;
}

/**
测试通道是否已准备好写入
**/
 public final boolean isWritable() {
        return (readyOps() & OP_WRITE) != 0;
    }

/**
测试通道是否已完成或未能完成其套接字连接操作。
**/
public final boolean isConnectable() {
        return (readyOps() & OP_CONNECT) != 0;
    }

/**
测试此通道是否已准备好接受新的套接字连接。
**/

 public final boolean isAcceptable() {
        return (readyOps() & OP_ACCEPT) != 0;
    }
```

### 4.3 SelectorProvider

#### 4.3.1 基本知识

- 选择器和可选通道的服务提供者类。
- 选择器提供程序是此类的具体子类，它具有零参数构造函数并实现下面指定的抽象方法。
- Java 虚拟机的给定调用维护一个系统范围的默认提供程序实例，该实例由provider方法返回。 该方法的第一次调用将定位如下指定的默认提供程序。
- 系统范围的默认提供程序由DatagramChannel 、 Pipe 、 Selector 、 ServerSocketChannel和SocketChannel类的静态打开方法使用。
- System.inheritedChannel()方法也使用它。
- 程序可以通过实例化该提供程序然后直接调用此类中定义的开放方法来使用默认提供程序以外的提供程序。
- 此类中的所有方法对于多个并发线程使用都是安全的。

#### 4.3.2 基本结构

```java
public abstract class SelectorProvider {

    private static final Object lock = new Object();
    private static SelectorProvider provider = null;

    protected SelectorProvider() {
        SecurityManager sm = System.getSecurityManager();
        if (sm != null)
            sm.checkPermission(new RuntimePermission("selectorProvider"));
    }
    }
```

#### 4.3.3 基本方法

```java
/**
为 Java 虚拟机的此调用返回系统范围的默认选择器提供程序。
此方法的第一次调用将定位默认提供程序对象
**/
public static SelectorProvider provider() {
        synchronized (lock) {
            if (provider != null)
                return provider;
            return AccessController.doPrivileged(
                new PrivilegedAction<SelectorProvider>() {
                    public SelectorProvider run() {
                            if (loadProviderFromProperty())
                                return provider;
                            if (loadProviderAsService())
                                return provider;
                            provider = sun.nio.ch.DefaultSelectorProvider.create();
                            return provider;
                        }
                    });
        }
    }

  public abstract DatagramChannel openDatagramChannel(ProtocolFamily family)
        throws IOException;


 public abstract ServerSocketChannel openServerSocketChannel()
        throws IOException;


 public abstract SocketChannel openSocketChannel()
        throws IOException;


/**
回从创建此 Java 虚拟机的实体继承的通道。
在许多操作系统上，进程（例如 Java 虚拟机）可以以允许进程从创建进程的实体继承通道的方式启动。 这样做的方式取决于系统，通道可能连接到的可能实体也是如此。 例如，在 UNIX 系统上，当请求到达关联的网络端口时，Internet 服务守护程序 ( inetd ) 用于启动程序来为请求提供服务。 在这个例子中，启动的进程继承了一个代表网络套接字的通道。
如果继承的通道代表网络套接字，则此方法返回的Channel类型确定如下：
如果继承的通道表示面向流的连接套接字，则返回SocketChannel 。 套接字通道至少最初处于阻塞模式，绑定到套接字地址，并连接到对等方。
如果继承的通道表示面向流的侦听套接字，则返回ServerSocketChannel 。 服务器套接字通道至少在最初处于阻塞模式，并绑定到套接字地址。
如果继承的通道是面向数据报的套接字，则返回DatagramChannel 。 数据报通道至少在最初处于阻塞模式，并绑定到套接字地址。
除了描述的面向网络的通道外，该方法将来可能返回其他类型的通道。
第一次调用此方法会创建返回的通道。 此方法的后续调用返回相同的通道。
**/
   public Channel inheritedChannel() throws IOException {
        return null;
   }
```

### 4.4 基本用法

#### 4.4.1 Accpet事件

```java
public class SelectServer {
    public static void main(String[] args) {
        ByteBuffer buffer = ByteBuffer.allocate(16);
        // 获得服务器通道
        try(ServerSocketChannel server = ServerSocketChannel.open()) {
            server.bind(new InetSocketAddress(8080));
            // 创建选择器
            Selector selector = Selector.open();

            // 通道必须设置为非阻塞模式
            server.configureBlocking(false);
            // 将通道注册到选择器中，并设置感兴趣的事件
            server.register(selector, SelectionKey.OP_ACCEPT);
            while (true) {
                // 若没有事件就绪，线程会被阻塞，反之不会被阻塞。从而避免了CPU空转
                // 返回值为就绪的事件个数
                int ready = selector.select();
                System.out.println("selector ready counts : " + ready);

                // 获取所有事件
                Set<SelectionKey> selectionKeys = selector.selectedKeys();

                // 使用迭代器遍历事件
                Iterator<SelectionKey> iterator = selectionKeys.iterator();
                while (iterator.hasNext()) {
                    SelectionKey key = iterator.next();

                    // 判断key的类型
                    if(key.isAcceptable()) {
                        // 获得key对应的channel
                        ServerSocketChannel channel = (ServerSocketChannel) key.channel();
                        System.out.println("before accepting...");

        				// 获取连接并处理，而且是必须处理，否则需要取消
                        SocketChannel socketChannel = channel.accept();
                        System.out.println("after accepting...");

                        // 处理完毕后移除
                        iterator.remove();
                    }
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

#### 4.4.2 Read事件

```java
public class SelectServer {
    public static void main(String[] args) {
        ByteBuffer buffer = ByteBuffer.allocate(16);
        // 获得服务器通道
        try(ServerSocketChannel server = ServerSocketChannel.open()) {
            server.bind(new InetSocketAddress(8080));
            // 创建选择器
            Selector selector = Selector.open();
            // 通道必须设置为非阻塞模式
            server.configureBlocking(false);
            // 将通道注册到选择器中，并设置感兴趣的实践
            server.register(selector, SelectionKey.OP_ACCEPT);
            // 为serverKey设置感兴趣的事件
            while (true) {
                // 若没有事件就绪，线程会被阻塞，反之不会被阻塞。从而避免了CPU空转
                // 返回值为就绪的事件个数
                int ready = selector.select();
                System.out.println("selector ready counts : " + ready);
                // 获取所有事件
                Set<SelectionKey> selectionKeys = selector.selectedKeys();
                // 使用迭代器遍历事件
                Iterator<SelectionKey> iterator = selectionKeys.iterator();
                while (iterator.hasNext()) {
                    SelectionKey key = iterator.next();
                    // 判断key的类型
                    if(key.isAcceptable()) {
                        // 获得key对应的channel
                        ServerSocketChannel channel = (ServerSocketChannel) key.channel();
                        System.out.println("before accepting...");
                        // 获取连接
                        SocketChannel socketChannel = channel.accept();
                        System.out.println("after accepting...");
                        // 设置为非阻塞模式，同时将连接的通道也注册到选择其中
                        socketChannel.configureBlocking(false);
                        socketChannel.register(selector, SelectionKey.OP_READ);
                        // 处理完毕后移除
                        iterator.remove();
                    } else if (key.isReadable()) {
                        SocketChannel channel = (SocketChannel) key.channel();
                        System.out.println("before reading...");
                        channel.read(buffer);
                        System.out.println("after reading...");
                        buffer.flip();
                        ByteBufferUtil.debugRead(buffer);
                        buffer.clear();
                        // 处理完毕后移除
                        iterator.remove();
                    }
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

#### 4.4.3 Write事件

```java
public class WriteServer {
    public static void main(String[] args) {
        try(ServerSocketChannel server = ServerSocketChannel.open()) {
            server.bind(new InetSocketAddress(8080));
            server.configureBlocking(false);
            Selector selector = Selector.open();
            server.register(selector, SelectionKey.OP_ACCEPT);
            while (true) {
                selector.select();
                Set<SelectionKey> selectionKeys = selector.selectedKeys();
                Iterator<SelectionKey> iterator = selectionKeys.iterator();
                while (iterator.hasNext()) {
                    SelectionKey key = iterator.next();
                    // 处理后就移除事件
                    iterator.remove();
                    if (key.isAcceptable()) {
                        // 获得客户端的通道
                        SocketChannel socket = server.accept();
                        // 写入数据
                        StringBuilder builder = new StringBuilder();
                        for(int i = 0; i < 500000000; i++) {
                            builder.append("a");
                        }
                        ByteBuffer buffer = StandardCharsets.UTF_8.encode(builder.toString());
                        // 先执行一次Buffer->Channel的写入，如果未写完，就添加一个可写事件
                        int write = socket.write(buffer);
                        System.out.println(write);
                        // 通道中可能无法放入缓冲区中的所有数据
                        if (buffer.hasRemaining()) {
                            // 注册到Selector中，关注可写事件，并将buffer添加到key的附件中
                            socket.configureBlocking(false);
                            socket.register(selector, SelectionKey.OP_WRITE, buffer);
                        }
                    } else if (key.isWritable()) {
                        SocketChannel socket = (SocketChannel) key.channel();
                        // 获得buffer
                        ByteBuffer buffer = (ByteBuffer) key.attachment();
                        // 执行写操作
                        int write = socket.write(buffer);
                        System.out.println(write);
                        // 如果已经完成了写操作，需要移除key中的附件，同时不再对写事件感兴趣
                        if (!buffer.hasRemaining()) {
                            key.attach(null);
                            key.interestOps(0);
                        }
                    }
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### 4.5 多线程优化

- 思路：各个线程各司其职，像医院的看病流程一样，各个单位各司其职

```java
public class ThreadsServer {
    public static void main(String[] args) {
        try (ServerSocketChannel server = ServerSocketChannel.open()) {
            // 当前线程为Boss线程
            Thread.currentThread().setName("Boss");
            server.bind(new InetSocketAddress(8080));
            // 负责轮询Accept事件的Selector
            Selector boss = Selector.open();
            server.configureBlocking(false);
            server.register(boss, SelectionKey.OP_ACCEPT);
            // 创建固定数量的Worker
            Worker[] workers = new Worker[4];
            // 用于负载均衡的原子整数
            AtomicInteger robin = new AtomicInteger(0);
            for(int i = 0; i < workers.length; i++) {
                workers[i] = new Worker("worker-"+i);
            }
            while (true) {
                boss.select();
                Set<SelectionKey> selectionKeys = boss.selectedKeys();
                Iterator<SelectionKey> iterator = selectionKeys.iterator();
                while (iterator.hasNext()) {
                    SelectionKey key = iterator.next();
                    iterator.remove();
                    // BossSelector负责Accept事件
                    if (key.isAcceptable()) {
                        // 建立连接
                        SocketChannel socket = server.accept();
                        System.out.println("connected...");
                        socket.configureBlocking(false);
                        // socket注册到Worker的Selector中
                        System.out.println("before read...");
                        // 负载均衡，轮询分配Worker
                        workers[robin.getAndIncrement()% workers.length].register(socket);
                        System.out.println("after read...");
                    }
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    static class Worker implements Runnable {
        private Thread thread;
        private volatile Selector selector;
        private String name;
        private volatile boolean started = false;
        /**
         * 同步队列，用于Boss线程与Worker线程之间的通信
         */
        private ConcurrentLinkedQueue<Runnable> queue;

        public Worker(String name) {
            this.name = name;
        }

        public void register(final SocketChannel socket) throws IOException {
            // 只启动一次
            if (!started) {
                thread = new Thread(this, name);
                selector = Selector.open();
                queue = new ConcurrentLinkedQueue<>();
                thread.start();
                started = true;
            }

            // 向同步队列中添加SocketChannel的注册事件
            // 在Worker线程中执行注册事件
            queue.add(new Runnable() {
                @Override
                public void run() {
                    try {
                        socket.register(selector, SelectionKey.OP_READ);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            });
            // 唤醒被阻塞的Selector
            // select类似LockSupport中的park，wakeup的原理类似LockSupport中的unpark
            selector.wakeup();
        }

        @Override
        public void run() {
            while (true) {
                try {
                    selector.select();
                    // 通过同步队列获得任务并运行
                    Runnable task = queue.poll();
                    if (task != null) {
                        // 获得任务，执行注册操作
                        task.run();
                    }
                    Set<SelectionKey> selectionKeys = selector.selectedKeys();
                    Iterator<SelectionKey> iterator = selectionKeys.iterator();
                    while(iterator.hasNext()) {
                        SelectionKey key = iterator.next();
                        iterator.remove();
                        // Worker只负责Read事件
                        if (key.isReadable()) {
                            // 简化处理，省略细节
                            SocketChannel socket = (SocketChannel) key.channel();
                            ByteBuffer buffer = ByteBuffer.allocate(16);
                            socket.read(buffer);
                            buffer.flip();
                            ByteBufferUtil.debugAll(buffer);
                        }
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
```

## 五 NIO与BIO

### 5.1 Stream与Channel

- stream 不会自动缓冲数据，channel 会利用系统提供的发送缓冲区、接收缓冲区（更为底层）
- stream 仅支持阻塞 API，channel 同时支持阻塞、非阻塞 API，**网络 channel 可配合 selector 实现多路复用**
- 二者均为全双工，即读写可以同时进行
   - 虽然Stream是单向流动的，但是它也是全双工的

### 5.2 IO模型

-  同步
：线程自己去获取结果（一个线程）
   - 例如：线程调用一个方法后，需要等待方法返回结果
-  异步
：线程自己不去获取结果，而是由其它线程返回结果（至少两个线程）
   - 例如：线程A调用一个方法后，继续向下运行，运行结果由线程B返回

当调用一次 channel.**read** 或 stream.**read** 后，会由用户态切换至操作系统内核态来完成真正数据读取，而读取又分为两个阶段，分别为：

-  等待数据阶段
-  复制数据阶段

![](https://img-blog.csdnimg.cn/d7d9f5dd7e6a4fea820fb7afcac9ea66.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6ZW_5a6J5LiN5Y-K5Y2B6YeM,size_11,color_FFFFFF,t_70,g_se,x_16#pic_center#id=p4TyH&originHeight=274&originWidth=433&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

根据UNIX 网络编程 - 卷 I，IO模型主要有以下几种

#### 5.2.1 阻塞IO

![](https://img-blog.csdnimg.cn/88affeb70808426c9ed75f4220268899.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6ZW_5a6J5LiN5Y-K5Y2B6YeM,size_11,color_FFFFFF,t_70,g_se,x_16#pic_center#id=QzmsL&originHeight=269&originWidth=429&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

- 用户线程进行read操作时，**需要等待操作系统执行实际的read操作**，此期间用户线程是被阻塞的，无法执行其他操作

#### 5.2.2 非阻塞IO

![](https://img-blog.csdnimg.cn/288b94d76d554ac1a73768bbcd98029e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6ZW_5a6J5LiN5Y-K5Y2B6YeM,size_11,color_FFFFFF,t_70,g_se,x_16#pic_center#id=dUdt9&originHeight=258&originWidth=422&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

-  用户线程
在一个循环中一直调用read方法
，若内核空间中还没有数据可读，立即返回
   - **只是在等待阶段非阻塞**
-  用户线程发现内核空间中有数据后，等待内核空间执行复制数据，待复制结束后返回结果

#### 5.2.3 多路复用

![](https://img-blog.csdnimg.cn/637aa49c708b43f8b7d7a02033a1b993.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6ZW_5a6J5LiN5Y-K5Y2B6YeM,size_11,color_FFFFFF,t_70,g_se,x_16#pic_center#id=Evxl5&originHeight=370&originWidth=426&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

**Java中通过Selector实现多路复用**

- 当没有事件是，调用select方法会被阻塞住
- 一旦有一个或多个事件发生后，就会处理对应的事件，从而实现多路复用

**多路复用与阻塞IO的区别**

- 阻塞IO模式下，**若线程因accept事件被阻塞，发生read事件后，仍需等待accept事件执行完成后**，才能去处理read事件
- 多路复用模式下，一个事件发生后，若另一个事件处于阻塞状态，不会影响该事件的执行

#### 5.2.4 异步IO

![](https://img-blog.csdnimg.cn/1e868c8b832a4a3f80b2d55dc2852952.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6ZW_5a6J5LiN5Y-K5Y2B6YeM,size_11,color_FFFFFF,t_70,g_se,x_16#pic_center#id=U8EwR&originHeight=258&originWidth=420&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

- 线程1调用方法后理解返回，**不会被阻塞也不需要立即获取结果**
- 当方法的运行结果出来以后，由线程2将结果返回给线程1

参考博客：[https://nyimac.gitee.io](https://nyimac.gitee.io)
