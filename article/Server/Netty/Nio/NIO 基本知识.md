---
title: Nio 基本使用
sidebar_position: 5
keywords:
  - 微服务
  - NIO
tags:
  - Java
  - Netty
  - 微服务
  - 学习笔记
last_update:
  date: 2023-12-21
  author: EasonShu
---

Netty官网：[Netty: Home](https://netty.io/)
参考书籍：《Netty权威指南》
参考教程：[netty案例](https://bugstack.cn/md/netty/base/2019-07-30-netty%E6%A1%88%E4%BE%8B%EF%BC%8Cnetty4.1%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E7%AF%87%E9%9B%B6%E3%80%8A%E5%88%9D%E5%85%A5JavaIO%E4%B9%8B%E9%97%A8BIO%E3%80%81NIO%E3%80%81AIO%E5%AE%9E%E6%88%98%E7%BB%83%E4%B9%A0%E3%80%8B.html)
# 一 Linux网络IO模型
Linux的内核将所有外部设备都看做一个文件来操作，对一个文件的读写操作会调用内核提供的系统命令，返回一个file descriptor（fd，文件描述符）。
而对一个socket的读写也会有相应的描述符，称为socketfd（socket描述符），描述符就是一个数字，它指向内核中的一个结构体（文件路径，数据区等一些属性）。
## 1.1 阻塞式模型
阻塞式I/O是最简单的网络I/O模型，其特点是在执行I/O操作时，进程会被阻塞，直到I/O操作完成并返回结果。在这种模型下，进程不能同时处理多个连接或数据流，因为只有在当前I/O操作完成后，才能进行下一个I/O操作，阻塞式I/O适用于单线程、单连接的场景，实现简单，但存在I/O效率低、资源利用率低等问题。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683122735719-87460dce-c2a6-46ec-abee-865eb395846e.png#averageHue=%23f4f4f4&clientId=u340cb473-c47f-4&from=paste&height=546&id=ub322af88&originHeight=683&originWidth=1455&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=129126&status=done&style=none&taskId=u27e6e31c-fe45-4066-9974-3d2a6761582&title=&width=1164)
## 1.2 非阻塞模型
在非阻塞式I/O模型中，进程在执行I/O操作时，不会被阻塞，而是立即返回，即使I/O操作未完成也会返回一个错误码。这样，进程可以同时处理多个连接或数据流，但需要不断地轮询I/O操作的状态，从而增加了CPU负担。非阻塞式I/O适用于单线程、多连接的场景，但需要在程序中不断地检查I/O状态，实现相对复杂。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683122756877-255fd7f9-8efc-4155-8616-3437486eadf1.png#averageHue=%23ececec&clientId=u340cb473-c47f-4&from=paste&height=638&id=uf14d30b9&originHeight=798&originWidth=1643&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=264168&status=done&style=none&taskId=uad52b62e-ee0a-4b42-8b1e-a008ad7e4d0&title=&width=1314.4)
## 1.3 多路复用模型
多路复用I/O模型利用了Linux提供的select/poll/epoll等机制，将多个I/O操作封装在一个函数调用中，等待任意一个I/O操作完成并返回。这种模型可以同时处理多个连接或数据流，而且不需要轮询I/O状态，因此CPU利用率更高，效率更高。多路复用I/O适用于多线程、多连接的场景，但需要维护一个I/O事件集合，实现相对复杂。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683122782167-31c3567d-df32-4dba-88ec-2ffbb78fdbde.png#averageHue=%23f3f3f3&clientId=u340cb473-c47f-4&from=paste&height=659&id=u455228d9&originHeight=824&originWidth=1503&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=195573&status=done&style=none&taskId=ue924e513-8618-4488-b8d2-470248dc25d&title=&width=1202.4)
## 1.4 异步模型
异步I/O模型在发起I/O操作后，不需要进程等待操作完成，而是通过回调函数或信号等方式通知进程操作已完成。这种模型可以同时处理多个连接或数据流，而且不需要轮询I/O状态，因此CPU利用率更高，效率更高。异步I/O适用于高并发、多连接的场景，但需要实现相对复杂。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683122806519-6dc6a86c-86b8-4a84-92c7-7b2f2c4714ad.png#averageHue=%23efefef&clientId=u340cb473-c47f-4&from=paste&height=594&id=ub73bb115&originHeight=742&originWidth=1438&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=157297&status=done&style=none&taskId=u5ca4dada-af23-4f5c-a8c3-d93e26ea750&title=&width=1150.4)
## 1.5 信号驱动模型
信号驱动I/O模型是一种I/O处理模型，通常用于Unix和Linux操作系统中。在这种模型中，应用程序不断地执行select（）系统调用，以等待数据从一个或多个文件描述符中变得可用。
一旦文件描述符中的数据可用，select（）调用将返回，并将控制权返回给应用程序。然后，应用程序可以使用标准的I/O系统调用（如read（）和write（））来读取或写入数据。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683123030720-3e456eff-c5c5-4555-92b7-16ec83662059.png#averageHue=%23f2f2f2&clientId=u340cb473-c47f-4&from=paste&height=658&id=u085dc286&originHeight=823&originWidth=1487&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=192336&status=done&style=none&taskId=u2b1bbb86-04cf-40d2-a3c5-d6e367bd59e&title=&width=1189.6)
# 二 几种通信模型
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683253199145-5e363c56-0172-43d0-b017-05ecd182c030.png#averageHue=%23fcb69f&clientId=uc3b40acf-d56d-4&from=paste&id=u09b2df77&originHeight=626&originWidth=1435&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=54536&status=done&style=none&taskId=u6be7d985-d3eb-4d17-b5d0-f08a8c9dc66&title=)
## 2.1 BIO模型
采用BIO通信模型的服务端，通常由一个独立的Acceptor线程负责监听客户端的连接，它接收到客户端连接请求之后为每个客户端创建一个新的线程进行链路处理，处理完成之后，通过输出流返回应答给客户端，线程销毁。
🌈🌈模型结构
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683168892204-ce00d874-f758-42b8-a696-996d41471e53.png#averageHue=%23c7c7c7&clientId=u4f023639-114d-4&from=paste&height=442&id=u5f194bbd&originHeight=552&originWidth=1675&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=194751&status=done&style=none&taskId=u6f686ea1-a735-4eee-a895-42ceadc5a2b&title=&width=1340)
🌈🌈服务端
```java
package com.shu.bio;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * @description:
 * TimeService根据传入的参数设置监听端口，如果没有入参，使用默认值8080，
 * 通过构造函数创建ServerSocket，如果端口合法且没有被占用，服务端监听成功。
 * @author: shu
 * @createDate: 2023/4/24 10:22
 * @version: 1.0
 */
public class TimeServer {
    public static void main(String[] args) throws IOException {
        int port = 8080;
        if (args != null && args.length > 0) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (NumberFormatException e) {
                // 采用默认值
            }
        }
        ServerSocket server = null;
        try{
            server = new ServerSocket(port);
            System.out.println("The time server is start in port : " + port);
            Socket socket = null;
            while (true) {
                socket = server.accept();
                new Thread(new TimeServerHandler(socket)).start();
                Thread.sleep(1000);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (server != null) {
                System.out.println("The time server close");
              server.close();
                server = null;
            }
        }
    }
}
```
```java
package com.shu.bio;

import java.io.BufferedReader;
import java.io.PrintStream;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/24 10:26
 * @version: 1.0
 */
public class TimeServerHandler implements Runnable{

    private Socket socket;


    public TimeServerHandler(Socket serverSocket) {
        this.socket = serverSocket;
    }

    /**
     * When an object implementing interface <code>Runnable</code> is used
     * to create a thread, starting the thread causes the object's
     * <code>run</code> method to be called in that separately executing
     * thread.
     * <p>
     * The general contract of the method <code>run</code> is that it may
     * take any action whatsoever.
     *
     * @see Thread#run()
     */
    @Override
    public void run() {
        // TODO Auto-generated method stub
        BufferedReader in = null;
        PrintStream out = null;
        try {
            in = new BufferedReader(new java.io.InputStreamReader(socket.getInputStream()));
            out = new PrintStream(socket.getOutputStream());
            String currentTime = null;
            String body = null;
            while (true) {
                body = in.readLine();
                if (body == null) {
                    break;
                }
                System.out.println("The time server receive order : " + body);
                currentTime = "QUERY TIME ORDER".equalsIgnoreCase(body) ? new java.util.Date(System.currentTimeMillis()).toString() : "BAD ORDER";
                out.println(currentTime);
            }
        } catch (Exception e) {
            System.out.println("TimeServerHandler run error"+e.getMessage());
        }
    }
}

```
🌈🌈客户端
```java
package com.shu.bio;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

/**
 * @description: BIO客户端
 * @author: shu
 * @createDate: 2023/4/24 10:30
 * @version: 1.0
 */
public class TimeClient {
    public static void main(String[] args) {
        int port = 8080;
        if (args != null && args.length > 0) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (NumberFormatException e) {
                // 采用默认值
            }
        }
        Socket socket = null;
        BufferedReader in = null;
        PrintWriter out = null;
        try {
            socket = new Socket("127.0.0.1", port);
            in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            out = new PrintWriter(socket.getOutputStream(), true);
            out.println("QUERY TIME ORDER");
            System.out.println("Send order 2 server succeed.");
            String resp = in.readLine();
            System.out.println("Now is : " + resp);

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (in != null) {
                try {
                    in.close();
                } catch (Exception e2) {
                    e2.printStackTrace();
                }
            }
            if (out != null) {
                out.close();
                out = null;
            }
            if (socket != null) {
                try {
                    socket.close();
                } catch (Exception e2) {
                    e2.printStackTrace();
                }
                socket = null;
            }
        }


    }
}
```
🌈🌈测试
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683169202109-436d6145-48a7-4b03-abf9-e1a976f85277.png#averageHue=%232c2c2c&clientId=u4f023639-114d-4&from=paste&height=170&id=u1dbc8fde&originHeight=212&originWidth=1808&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=19006&status=done&style=none&taskId=uef06740a-72dd-4543-b9d0-6f15b405e66&title=&width=1446.4)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683169216168-332d0d7a-b7ad-4047-9d4c-9185e0becdc1.png#averageHue=%232c2b2b&clientId=u4f023639-114d-4&from=paste&height=259&id=ub4d4adba&originHeight=324&originWidth=1793&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=24752&status=done&style=none&taskId=uc86e2ab1-0fc3-4b5c-9583-d233ba2ce7b&title=&width=1434.4)
🌈🌈问题
该模型最大的问题就是缺乏弹性伸缩能力，当客户端并发访问量增加后，服务端的线程个数和客户端并发访问数呈1：1的正比关系，由于线程是Java虚拟机非常宝贵的系统资源，当线程数膨胀之后，系统的性能将急剧下降，随着并发访问量的继续增大，系统会发生线程堆栈溢出、创建新线程失败等问题，并最终导致进程宕机或者僵死，不能对外提供服务，下面我们模拟100个客服端来测试？
```java
package com.shu.bio;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/24 10:34
 * @version: 1.0
 */
public class TimeMoreClient {
    public static void main(String[] args) {
        // 模拟100个客户端
        for (int i = 0; i < 100; i++) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    int port = 8080;
                    if (args != null && args.length > 0) {
                        try {
                            port = Integer.parseInt(args[0]);
                        } catch (NumberFormatException e) {
                            // 采用默认值
                        }
                    }
                    Socket socket = null;
                    BufferedReader in = null;
                    PrintWriter out = null;
                    try {
                        socket = new Socket("", port);
                        in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                        out = new PrintWriter(socket.getOutputStream(), true);
                        out.println(Thread.currentThread().getName()+" QUERY TIME ORDER");
                        System.out.println(Thread.currentThread().getName()+" Send order 2 server succeed.");
                        String resp = in.readLine();
                        System.out.println(Thread.currentThread().getName()+" Now is : " + resp);
                    } catch (Exception e) {
                        e.printStackTrace();
                    } finally {
                        if (in != null) {
                            try {
                                in.close();
                            } catch (Exception e2) {
                                e2.printStackTrace();
                            }
                        }
                        if (out != null) {
                            out.close();
                            out = null;
                        }
                        if (socket != null) {
                            try {
                                socket.close();
                            } catch (Exception e2) {
                                e2.printStackTrace();
                            }
                            socket = null;
                        }

                    }
                }
            }
            ).start();
        }
    }
}

```
🌈🌈观察
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683169338216-aee5cec9-9656-4d19-92c3-8c5e0b447716.png#averageHue=%232d2c2c&clientId=u4f023639-114d-4&from=paste&height=422&id=ua6e0ed98&originHeight=528&originWidth=1833&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=114525&status=done&style=none&taskId=u5f42eaee-c28a-4e69-8c11-837235a29bd&title=&width=1466.4)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683169352083-43ab09f8-c54e-4a35-987f-7b39296d5117.png#averageHue=%232f2e2d&clientId=u4f023639-114d-4&from=paste&height=350&id=udfd9e997&originHeight=438&originWidth=1786&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=102248&status=done&style=none&taskId=u0ac2e937-9a9b-4aa5-bfe8-0ea0646f659&title=&width=1428.8)
🌈🌈结论

- BIO主要的问题在于每当有一个新的客户端请求接入时，服务端必须创建一个新的线程处理新接入的客户端链路，一个线程只能处理一个客户端连接。
- 在高性能服务器应用领域，往往需要面向成千上万个客户端的并发连接，这种模型显然无法满足高性能、高并发接入的场景。
- 注意：并不说他没有应用场景
## 2.2 伪异步IO模型
最初为了解决这种问题，我们利用线程池来达到解决问题的办法，但是这也是杯水车薪，下面我们来看看这种方法吧，线程池的知识自己去百度吧
当有新的客户端接入的时候，将客户端的Socket封装成一个Task（该任务实现java.lang.Runnable接口）投递到后端的线程池中进行处理，JDK的线程池维护一个消息队列和N个活跃线程对消息队列中的任务进行处理。
🌈🌈模型
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683169908226-3c764500-5d5d-4b32-98fa-c8381e770033.png#averageHue=%23c8c8c8&clientId=u4f023639-114d-4&from=paste&height=449&id=u59c045ec&originHeight=561&originWidth=1774&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=185100&status=done&style=none&taskId=ueae6cc06-4c1f-47c7-a73b-84aa95445da&title=&width=1419.2)
🌈🌈服务端
```java
package com.shu.aio;

import com.shu.bio.TimeServerHandler;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * @description: 利用线程池改造TimeServer
 * @author: shu
 * @createDate: 2023/4/24 10:58
 * @version: 1.0
 */
public class TimeServer {
    public static void main(String[] args) throws IOException {
        int port = 8080;
        if (args != null && args.length > 0) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (NumberFormatException e) {
                // 采用默认值
            }
        }
        ServerSocket server = null;
        try{
            server = new ServerSocket(port);
            System.out.println("The time server is start in port : " + port);
            TimeServerHandlerExecutePool singleExecutor = new TimeServerHandlerExecutePool(50, 10000);
            Socket socket = null;
            while (true) {
                socket = server.accept();
                singleExecutor.execute(new TimeServerHandler(socket));
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (server != null) {
                System.out.println("The time server close");
                server.close();
                server = null;
            }
        }
    }
}
```
```java
package com.shu.aio;

import java.util.concurrent.*;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/24 10:59
 * @version: 1.0
 */
public class TimeServerHandlerExecutePool {

    /**
     * 线程池
     */
    private ExecutorService executor;

    /**
     * @param maxPoolSize 最大线程数
     * @param queueSize   任务队列大小
     */
    public TimeServerHandlerExecutePool(int maxPoolSize, int queueSize) {
        // 这里自己来实现线程池
        executor = new ThreadPoolExecutor(Runtime.getRuntime().availableProcessors(),
                maxPoolSize,
                120L,
                TimeUnit.SECONDS,
                new ArrayBlockingQueue<Runnable>(queueSize));
    }


    /**
     * 执行任务
     * @param task
     */
    public void execute(Runnable task) {
        executor.execute(task);
    }

}

```
🌈🌈客户端
```java
package com.shu.aio;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/24 11:17
 * @version: 1.0
 */
public class TimeClient {
    public static void main(String[] args) {
        /**
         * 1.创建客户端Socket，指定服务器地址和端口
         */
        int port = 8080;
        if (args != null && args.length > 0) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (NumberFormatException e) {
                // 采用默认值
            }
        }
        Socket socket = null;
        BufferedReader in = null;
        PrintWriter out = null;
        try {
            socket = new Socket("127.0.0.1", port);
            in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            out = new PrintWriter(socket.getOutputStream(), true);
            out.println("QUERY TIME ORDER");
            System.out.println("Send order 2 server succeed.");
            String resp = in.readLine();
            System.out.println("Now is : " + resp);

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (in != null) {
                try {
                    in.close();
                } catch (Exception e2) {
                    e2.printStackTrace();
                }
            }
            if (out != null) {
                out.close();
                out = null;
            }
            if (socket != null) {
                try {
                    socket.close();
                } catch (Exception e2) {
                    e2.printStackTrace();
                }
                socket = null;
            }
        }

    }
}
```
🌈🌈测试
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683170092030-8a90daa5-ffe8-4618-bf73-c6483cbd5478.png#averageHue=%232d2c2b&clientId=u4f023639-114d-4&from=paste&height=279&id=ue526421a&originHeight=349&originWidth=1805&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=33354&status=done&style=none&taskId=u6a9e6e03-3813-45f6-a834-c44bd1578a7&title=&width=1444)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683170102238-af6e8f49-5332-44cb-bf12-105909828f77.png#averageHue=%232d2c2b&clientId=u4f023639-114d-4&from=paste&height=276&id=uedf9e4d1&originHeight=345&originWidth=1837&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=30644&status=done&style=none&taskId=u316180e6-d1be-4751-a5a9-d03312cf680&title=&width=1469.6)
🌈🌈结论
伪异步I/O通信框架采用了线程池实现，因此避免了为每个请求都创建一个独立线程造成的线程资源耗尽问题，但是由于它底层的通信依然采用同步阻塞模型，因此无法从根本上解决问题。
🌈🌈问题

- 服务端处理缓慢，返回应答消息耗费60s，平时只需要10ms。
- 采用伪异步I/O的线程正在读取故障服务节点的响应，由于读取输入流是阻塞的，因此，它将会被同步阻塞60s。
- 假如所有的可用线程都被故障服务器阻塞，那后续所有的I/O消息都将在队列中排队。
- 由于线程池采用阻塞队列实现，当队列积满之后，后续入队列的操作将被阻塞。
- 由于前端只有一个Accptor线程接收客户端接入，它被阻塞在线程池的同步阻塞队列之后，新的客户端请求消息将被拒绝，客户端会发生大量的连接超时。
## 2.3 AIO模型
NIO2.0的异步套接字通道是真正的异步非阻塞I/O，它对应UNIX网络编程中的事件驱动I/O(AIO)，它不需要通过多路复用器(Selector)对注册的通道进行轮询操作即可实现异步读写，从而简化了NIO的编程模型。
🌈服务端
```java
package com.shu.asyn;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/25 10:11
 * @version: 1.0
 */
public class TimeServer {
    public static void main(String[] args) {
        int port = 8081;
        if (args != null && args.length > 0) {
            try {
                port = Integer.valueOf(args[0]);
            } catch (NumberFormatException e) {
                // 采用默认值
            }
        }
        AsyncTimeServerHandler timeServer = new AsyncTimeServerHandler(port);
        new Thread(timeServer, "AIO-AsyncTimeServerHandler-001").start();
    }
}

```
```java
package com.shu.asyn;

import java.net.InetSocketAddress;
import java.nio.channels.AsynchronousServerSocketChannel;
import java.nio.channels.AsynchronousSocketChannel;
import java.util.concurrent.CountDownLatch;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/25 10:11
 * @version: 1.0
 */
public class AsyncTimeServerHandler implements Runnable{

    private int port;

    CountDownLatch latch;

    AsynchronousServerSocketChannel asynchronousServerSocketChannel;

    public AsyncTimeServerHandler(int port) {
        this.port = port;
        try{
            asynchronousServerSocketChannel = AsynchronousServerSocketChannel.open();
            asynchronousServerSocketChannel.bind(new InetSocketAddress(port));
            System.out.println("The time server is start in port : " + port);
        }catch (Exception e){
            e.printStackTrace();
        }
    }

    /**
     * When an object implementing interface <code>Runnable</code> is used
     * to create a thread, starting the thread causes the object's
     * <code>run</code> method to be called in that separately executing
     * thread.
     * <p>
     * The general contract of the method <code>run</code> is that it may
     * take any action whatsoever.
     *
     * @see Thread#run()
     */
    @Override
    public void run() {
        // TODO Auto-generated method stub
        latch = new CountDownLatch(1);
        doAccept();
        try {
            latch.await();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }


    public void doAccept(){
        asynchronousServerSocketChannel.accept(this, new AcceptCompletionHandler());
    }
}

```
```java
package com.shu.asyn;

import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousSocketChannel;
import java.nio.channels.CompletionHandler;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/25 10:18
 * @version: 1.0
 */
public class AcceptCompletionHandler implements
        CompletionHandler<AsynchronousSocketChannel, AsyncTimeServerHandler>
{




    /**
     * Invoked when an operation has completed.
     *
     * @param result     The result of the I/O operation.
     * @param attachment The object attached to the I/O operation when it was initiated.
     */
    @Override
    public void completed(AsynchronousSocketChannel result, AsyncTimeServerHandler attachment) {
        attachment.asynchronousServerSocketChannel.accept(attachment, this);
        ByteBuffer buffer = ByteBuffer.allocate(1024);
        result.read(buffer, buffer, new ReadCompletionHandler(result));

    }

    /**
     * Invoked when an operation fails.
     *
     * @param exc        The exception to indicate why the I/O operation failed
     * @param attachment The object attached to the I/O operation when it was initiated.
     */
    @Override
    public void failed(Throwable exc, AsyncTimeServerHandler attachment) {
        exc.printStackTrace();
        attachment.latch.countDown();
    }
}

```
🌈🌈客户端
```java
package com.shu.asyn;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/25 10:28
 * @version: 1.0
 */
public class TimeClient {
    public static void main(String[] args) {
        int port = 8081;
        if (args != null && args.length > 0) {
            try {
                port = Integer.valueOf(args[0]);
            } catch (NumberFormatException e) {

            }
        }
        new Thread(new AsyncTimeClientHandler("127.0.0.1", port), "AIO-AsyncTimeClientHandler-001").start();
    }
}
```
```java
package com.shu.asyn;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousSocketChannel;
import java.nio.channels.CompletionHandler;
import java.util.concurrent.CountDownLatch;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/25 10:28
 * @version: 1.0
 */
public class AsyncTimeClientHandler implements CompletionHandler<Void, AsyncTimeClientHandler>, Runnable {

    private AsynchronousSocketChannel client;
    private String host;
    private int port;
    private CountDownLatch latch;

    public AsyncTimeClientHandler(String host, int port) {
        this.host = host;
        this.port = port;
        try {
            client = AsynchronousSocketChannel.open();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void run() {
        latch = new CountDownLatch(1);
        client.connect(new InetSocketAddress(host, port), this, this);
        try {
            latch.await();
        } catch (InterruptedException e1) {
            e1.printStackTrace();
        }
        try {
            client.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void completed(Void result, AsyncTimeClientHandler attachment) {
        byte[] req = "QUERY TIME ORDER".getBytes();
        ByteBuffer writeBuffer = ByteBuffer.allocate(req.length);
        writeBuffer.put(req);
        writeBuffer.flip();
        client.write(writeBuffer, writeBuffer,
                new CompletionHandler<Integer, ByteBuffer>() {
                    @Override
                    public void completed(Integer result, ByteBuffer buffer) {
                        if (buffer.hasRemaining()) {
                            client.write(buffer, buffer, this);
                        } else {
                            ByteBuffer readBuffer = ByteBuffer.allocate(1024);
                            client.read(
                                    readBuffer,
                                    readBuffer,
                                    new CompletionHandler<Integer, ByteBuffer>() {
                                        @Override
                                        public void completed(Integer result,
                                                              ByteBuffer buffer) {
                                            buffer.flip();
                                            byte[] bytes = new byte[buffer
                                                    .remaining()];
                                            buffer.get(bytes);
                                            String body;
                                            try {
                                                body = new String(bytes,
                                                        "UTF-8");
                                                System.out.println("Now is : "
                                                        + body);
                                                latch.countDown();
                                            } catch (UnsupportedEncodingException e) {
                                                e.printStackTrace();
                                            }
                                        }

                                        @Override
                                        public void failed(Throwable exc,
                                                           ByteBuffer attachment) {
                                            try {
                                                client.close();
                                                latch.countDown();
                                            } catch (IOException e) {
                                                // ingnore on close
                                            }
                                        }
                                    });
                        }
                    }

                    @Override
                    public void failed(Throwable exc, ByteBuffer attachment) {
                        try {
                            client.close();
                            latch.countDown();
                        } catch (IOException e) {
                            // ingnore on close
                        }
                    }
                });
    }

    @Override
    public void failed(Throwable exc, AsyncTimeClientHandler attachment) {
        exc.printStackTrace();
        try {
            client.close();
            latch.countDown();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}


```
```java
package com.shu.asyn;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousSocketChannel;
import java.nio.channels.CompletionHandler;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/25 10:19
 * @version: 1.0
 */
public class ReadCompletionHandler implements
        CompletionHandler<Integer, ByteBuffer>
{


    private AsynchronousSocketChannel channel;

    public ReadCompletionHandler(AsynchronousSocketChannel channel) {
        if (this.channel == null)
            this.channel = channel;
    }


    /**
     * Invoked when an operation has completed.
     *
     * @param result     The result of the I/O operation.
     * @param attachment The object attached to the I/O operation when it was initiated.
     */
    @Override
    public void completed(Integer result, ByteBuffer attachment) {
        attachment.flip();
        byte[] body = new byte[attachment.remaining()];
        attachment.get(body);
        try {
            String req = new String(body, "UTF-8");
            System.out.println("The time server receive order : " + req);
            String currentTime = "QUERY TIME ORDER".equalsIgnoreCase(req) ? new java.util.Date(
                    System.currentTimeMillis()).toString() : "BAD ORDER";
            doWrite(currentTime);
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }

    }


    private void doWrite(String currentTime) {
        if (currentTime != null && currentTime.trim().length() > 0) {
            byte[] bytes = (currentTime).getBytes();
            ByteBuffer writeBuffer = ByteBuffer.allocate(bytes.length);
            writeBuffer.put(bytes);
            writeBuffer.flip();
            channel.write(writeBuffer, writeBuffer,
                    new CompletionHandler<Integer, ByteBuffer>() {
                        @Override
                        public void completed(Integer result, ByteBuffer buffer) {
                            // 如果没有发送完成，继续发送
                            if (buffer.hasRemaining())
                                channel.write(buffer, buffer, this);
                        }

                        @Override
                        public void failed(Throwable exc, ByteBuffer attachment) {
                            try {
                                channel.close();
                            } catch (IOException e) {
                                // ingnore on close
                            }
                        }
                    });
        }
    }


    /**
     * Invoked when an operation fails.
     *
     * @param exc        The exception to indicate why the I/O operation failed
     * @param attachment The object attached to the I/O operation when it was initiated.
     */
    @Override
    public void failed(Throwable exc, ByteBuffer attachment) {
        try {
            this.channel.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

```
🌈🌈测试
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683170947075-06b9da46-ea63-4a7e-9079-118b1244cdfe.png#averageHue=%232e2c2b&clientId=u4f023639-114d-4&from=paste&height=248&id=u8cfdde85&originHeight=310&originWidth=1810&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=29234&status=done&style=none&taskId=u553ae01e-847b-49ee-8b76-1f03b75d695&title=&width=1448)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683170956378-82f769e4-ae6d-4f00-a350-de0e806e0ddf.png#averageHue=%232d2c2b&clientId=u4f023639-114d-4&from=paste&height=243&id=u0c14fec5&originHeight=304&originWidth=1834&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=30639&status=done&style=none&taskId=udd78603e-018c-46a0-9ad0-b5c981f72d4&title=&width=1467.2)
这种方式的开发难度比较大，我就不详细介绍了，有兴趣的话自己去百度
## 2.4 NIO模型
Java NIO（New IO）是从 Java 1.4 版本开始引入的一个新的 IO API，可以替代标准的 Java IO API。NIO 与原来的 IO 有同样的作用和目的，但是使用方式完全不同，NIO 支持面向缓冲区的、基于通道的 IO 操作。NIO 将以更加高效的方式进行文件的读写操作。
🌈🌈服务端
```java
package com.shu.nio;

/**
 * @description: NIO时间服务器
 * @author: shu
 * @createDate: 2023/4/24 14:38
 * @version: 1.0
 */
public class TimeServer {
    public static void main(String[] args) {
        int port = 8081;
        if (args != null && args.length > 0) {
            try {
                port = Integer.valueOf(args[0]);
            } catch (NumberFormatException e) {
                // 采用默认值
            }
        }
        MultiplexerTimeServer timeServer = new MultiplexerTimeServer(port);
        new Thread(timeServer, "NIO-MultiplexerTimeServer-001").start();
    }
}

```
```java
package com.shu.nio;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;
import java.util.Set;

/**
 * @description: NIO时间服务器服务端
 * @author: shu
 * @createDate: 2023/4/24 14:40
 * @version: 1.0
 */
public class MultiplexerTimeServer implements Runnable {
    private Selector selector;

    private ServerSocketChannel servChannel;

    private volatile boolean stop;

    /**
     * 初始化多路复用器、绑定监听端口
     *
     * @param port
     */
    public MultiplexerTimeServer(int port) {
        try {
            selector = Selector.open();
            servChannel = ServerSocketChannel.open();
            servChannel.configureBlocking(false);
            servChannel.socket().bind(new InetSocketAddress(port), 1024);
            servChannel.register(selector, SelectionKey.OP_ACCEPT);
            System.out.println("The time server is start in port : " + port);
        } catch (IOException e) {
            e.printStackTrace();
            System.exit(1);
        }
    }

    public void stop() {
        this.stop = true;
    }



    @Override
    public void run() {
        while (!stop) {
            try {
                selector.select(1000);
                Set<SelectionKey> selectedKeys = selector.selectedKeys();
                Iterator<SelectionKey> it = selectedKeys.iterator();
                SelectionKey key = null;
                while (it.hasNext()) {
                    key = it.next();
                    it.remove();
                    try {
                        handleInput(key);
                    } catch (Exception e) {
                        if (key != null) {
                            key.cancel();
                            if (key.channel() != null) {
                                key.channel().close();
                            }
                        }
                    }
                }
            } catch (Throwable t) {
                t.printStackTrace();
            }
        }

        // 多路复用器关闭后，所有注册在上面的Channel和Pipe等资源都会被自动去注册并关闭，所以不需要重复释放资源
        if (selector != null) {
            try {
                selector.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private void handleInput(SelectionKey key) throws IOException {

        if (key.isValid()) {
            // 处理新接入的请求消息
            if (key.isAcceptable()) {
                // Accept the new connection
                ServerSocketChannel ssc = (ServerSocketChannel) key.channel();
                SocketChannel sc = ssc.accept();
                sc.configureBlocking(false);
                // Add the new connection to the selector
                sc.register(selector, SelectionKey.OP_READ);
            }
            if (key.isReadable()) {
                // Read the data
                SocketChannel sc = (SocketChannel) key.channel();
                ByteBuffer readBuffer = ByteBuffer.allocate(1024);
                int readBytes = sc.read(readBuffer);
                if (readBytes > 0) {
                    readBuffer.flip();
                    byte[] bytes = new byte[readBuffer.remaining()];
                    readBuffer.get(bytes);
                    String body = new String(bytes, "UTF-8");
                    System.out.println("The time server receive order : "
                            + body);
                    String currentTime = "QUERY TIME ORDER"
                            .equalsIgnoreCase(body) ? new java.util.Date(
                            System.currentTimeMillis()).toString()
                            : "BAD ORDER";
                    doWrite(sc, currentTime);
                } else if (readBytes < 0) {
                    // 对端链路关闭
                    key.cancel();
                    sc.close();
                } else
                    ; // 读到0字节，忽略
            }
        }
    }

    private void doWrite(SocketChannel channel, String response)
            throws IOException {
        if (response != null && response.trim().length() > 0) {
            byte[] bytes = response.getBytes();
            ByteBuffer writeBuffer = ByteBuffer.allocate(bytes.length);
            writeBuffer.put(bytes);
            writeBuffer.flip();
            channel.write(writeBuffer);
        }
    }

}

```
🌈🌈客户端
```java
package com.shu.nio;

/**
 * @description: NIO时间客户端
 * @author: shu
 * @createDate: 2023/4/24 16:49
 * @version: 1.0
 */
public class TimeClient {
    public static void main(String[] args) {
        int port = 8081;
        if (args != null && args.length > 0) {
            try {
                port = Integer.valueOf(args[0]);
            } catch (NumberFormatException e) {
                // 采用默认值
            }
        }
        new Thread(new TimeClientHandle("127.0.0.1", port), "TimeClient-001").start();
    }
}

```
```java
package com.shu.nio;

import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.SocketChannel;
import java.util.Iterator;
import java.util.Set;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/24 16:50
 * @version: 1.0
 */
public class TimeClientHandle implements Runnable{

    private String host;
    private int port;
    private Selector selector;
    private SocketChannel socketChannel;
    private volatile boolean stop;


    public  TimeClientHandle(String host, int port) {
        this.host = host;
        this.port = port;
        try{
            selector = Selector.open();
            socketChannel = SocketChannel.open();
            socketChannel.configureBlocking(false);
        }
        catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }
    }



    /**
     * When an object implementing interface <code>Runnable</code> is used
     * to create a thread, starting the thread causes the object's
     * <code>run</code> method to be called in that separately executing
     * thread.
     * <p>
     * The general contract of the method <code>run</code> is that it may
     * take any action whatsoever.
     *
     * @see Thread#run()
     */
    @Override
    public void run() {
        try{
            doConnect();
        }catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }
        while (!stop) {
            try{
                selector.select(1000);
                Set<SelectionKey> keys = selector.selectedKeys();
                Iterator<SelectionKey> iterator = keys.iterator();
                SelectionKey key = null;
                while (iterator.hasNext()) {
                    key = iterator.next();
                    iterator.remove();
                    try{
                        handleInput(key);
                    }catch (Exception e) {
                        if (key != null) {
                            key.cancel();
                            if (key.channel() != null) {
                                key.channel().close();
                            }
                        }
                    }
                }
            }catch (Exception e) {
                e.printStackTrace();
                System.exit(1);
            }
        }

        if (selector != null) {
            try{
                selector.close();
            }catch (Exception e) {
                e.printStackTrace();
            }
        }
    }


    /**
     * 处理服务响应
     * @param key
     * @throws Exception
     */
    public void handleInput(SelectionKey key) throws Exception{
        if (key.isValid()) {
            SocketChannel socketChannel = (SocketChannel) key.channel();
            // 判断是否连接成功
            if (key.isConnectable()) {
                if (socketChannel.finishConnect()) {
                    System.out.println("连接成功");
                    socketChannel.register(selector, SelectionKey.OP_READ);
                    doWrite(socketChannel);
                }
                else {
                    System.out.println("连接失败");
                    System.exit(1);
                }
            }
            if (key.isReadable()) {
                ByteBuffer readBuffer = ByteBuffer.allocate(1024);
                int readBytes = socketChannel.read(readBuffer);
                if (readBytes > 0 ) {
                    readBuffer.flip();
                    byte[] bytes = new byte[readBuffer.remaining()];
                    readBuffer.get(bytes);
                    String body = new String (bytes, "UTF-8");
                    System.out.println("Now is: " + body);
                    this.stop = true;
                }
                else if (readBytes < 0) {
                    key.cancel();
                    socketChannel.close();
                }
                else {
                    ;
                }
            }
        }
    }



    /**
     * 获取服务端响应
     * @throws Exception
     */
    public void doConnect() throws Exception{
        if (socketChannel.connect(new InetSocketAddress(host, port))) {
            socketChannel.register(selector, SelectionKey.OP_READ);
            doWrite(socketChannel);
        }
        else {
            socketChannel.register(selector, SelectionKey.OP_CONNECT);
        }
    }


    /**
     * 写数据给服务端
     * @param socketChannel
     * @throws Exception
     */
    public  void  doWrite(SocketChannel socketChannel) throws Exception{
        byte[] req = "QUERY TIME ORDER".getBytes();
        ByteBuffer writeBuffer = ByteBuffer.allocate(req.length);
        writeBuffer.put(req);
        writeBuffer.flip();
        socketChannel.write(writeBuffer);
        if (!writeBuffer.hasRemaining()) {
            System.out.println("Send order 2 server succeed.");
        }
    }

}

```
🌈🌈测试
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683171458070-f3c7c3ae-044f-4577-8f12-d77860dbae6b.png#averageHue=%232d2c2b&clientId=u4f023639-114d-4&from=paste&height=323&id=u7c493cbb&originHeight=404&originWidth=1811&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=36910&status=done&style=none&taskId=u56926470-3de5-429f-ad2c-c88d0ecb10e&title=&width=1448.8)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683171469882-3e0208fa-b5d4-4a19-a7fe-e2e792a856d8.png#averageHue=%232d2c2b&clientId=u4f023639-114d-4&from=paste&height=321&id=ubdedeb0b&originHeight=401&originWidth=1812&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=30812&status=done&style=none&taskId=u0ce42633-aab1-4c6d-8abc-700496a6a49&title=&width=1449.6)
下面我们将来详解介绍NIO的基本知识，这也是为了学习Netty的基础，最后为几种模型做下比较
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683171574878-0211d5d0-3f00-4a5d-8755-48bb1a55db7c.png#averageHue=%23f3f3f3&clientId=u4f023639-114d-4&from=paste&height=516&id=ua5ef2bd1&originHeight=645&originWidth=1764&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=231471&status=done&style=none&taskId=ua81a8215-eaae-474b-a4ae-ff66b5757f3&title=&width=1411.2)
# 三 NIO基础知识
Java NIO系统的核心在于：通道(Channel)和缓冲区(Buffer)，通道表示打开到 IO 设备(例如：文件、套接字)的连接，若需要使用 NIO 系统，需要获取用于连接 IO 设备的通道以及用于容纳数据的缓冲区，然后操作缓冲区，对数据进行处理，简而言之，通道负责传输，缓冲区负责存储
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683172197050-dd158e59-9267-4f3a-9e00-482bed827bb4.png#averageHue=%23efeeed&clientId=u4f023639-114d-4&from=paste&id=ubaba4ea6&originHeight=496&originWidth=1016&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=51930&status=done&style=none&taskId=u1cedb941-df6f-4147-9b05-c43a774a254&title=)
简单来理解，缓冲区(Buffer)是载体，通道(Channel)是方式，简而言之，**Channel 负责传输，Buffer 负责存储**
## 3.1  **Buffer**
缓冲区（Buffer）：一个用于特定基本数据类型的容器，由 java.nio 包定义的，所有缓冲区都是 Buffer 抽象类的子类。
🌈🌈类型
缓冲区（Buffer）：在 Java NIO 中负责数据的存取，缓冲区就是数组，用于存储不同类型的数据。根据数据类型的不同（boolean 除外），提供了相应类型的缓冲区：
ByteBuffer，CharBuffer，ShortBuffer，IntBuffer，LongBuffer，FloatBuffer
，DoubleBuffer，上述缓冲区管理方式几乎一致，都是通过 allocate() 来获取缓冲区
但是我们最常用的是ByteBuffer
🌈🌈存取方法

- put():存入数据到缓冲区中
- get():获取缓冲区中的数据

🌈🌈缓存区的核心属性

- capacity: 容量，表示缓冲区中最大存储数据的容量。一旦声明不能更改。
- limit: 界限，表示缓冲区中可以操作数据的大小。（limit 后的数据不能进行读写）
- position: 位置，表示缓冲区中正在操作数据的位置。
- mark: 标记，表示记录当前 position 的位置。可以通过 reset() 恢复到 mark 的位置。
- flip(): 调整模式，读写模式切换

0 <= mark <= position <= limit <= capacity
![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1683175412015-3b6311ae-758a-4de5-8061-571af31aefc1.webp#averageHue=%23f9f8f8&clientId=u4f023639-114d-4&from=paste&id=u14b70ea6&originHeight=501&originWidth=720&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ub7b2cf7c-9f77-4ba7-9dd8-dd442e13c40&title=)
```java
package com.shu.nio;

import java.nio.ByteBuffer;
import java.nio.IntBuffer;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/24 14:18
 * @version: 1.0
 */
public class BufferTest {
    public static void main(String[] args) {
        // 创建一个Buffer，大小为5，即可以存放5个int
        IntBuffer intBuffer = IntBuffer.allocate(5);
        intBuffer.put(10);
        intBuffer.put(11);
        intBuffer.put(12);
        intBuffer.put(13);
        intBuffer.put(14);
        // 抛出异常，因为已经没有空间了
        // intBuffer.put(15);
        // 将buffer转换，读写切换
//        intBuffer.flip();
//        System.out.println(intBuffer.get());
//        System.out.println(intBuffer.get());
//        System.out.println(intBuffer.get());
//        System.out.println(intBuffer.get());
//        System.out.println(intBuffer.get());
//        // 抛出异常，因为已经没有数据了
//        // System.out.println(intBuffer.get());

        // rewind()：可重复读
//        intBuffer.rewind();
//        System.out.println(intBuffer.get());
//        System.out.println(intBuffer.get());
//        System.out.println(intBuffer.get());
//        System.out.println(intBuffer.get());
//        System.out.println(intBuffer.get());
        // 抛出异常，因为已经没有数据了
        // System.out.println(intBuffer.get());

        // clear()：清空缓冲区，但是缓冲区的数据依然存在，处于“被遗忘”状态
        intBuffer.clear();
        System.out.println(intBuffer.get());
        System.out.println(intBuffer.get());
        System.out.println(intBuffer.get());
        System.out.println(intBuffer.get());
        System.out.println(intBuffer.get());
        // 抛出异常，因为已经没有数据了
        // System.out.println(intBuffer.get());

        // mark()：标记
        // reset()：恢复到mark的位置
        // limit()：界限，表示缓冲区中可以操作数据的大小。（limit后数据不能进行读写）
        // capacity()：容量，表示缓冲区中最大存储数据的容量。一旦声明不能改变。
        // position()：位置，表示缓冲区中正在操作数据的位置。
        // 0 <= mark <= position <= limit <= capacity
        ByteBuffer buffer = ByteBuffer.allocate(1024);
        System.out.println("-------------allocate()-------------");
        System.out.println(buffer.position());
        System.out.println(buffer.limit());
        System.out.println(buffer.capacity());
        buffer.put("abcde".getBytes());
        System.out.println("-------------put()-------------");
        System.out.println(buffer.position());
        System.out.println(buffer.limit());
        System.out.println(buffer.capacity());
        buffer.flip();
        System.out.println("-------------flip()-------------");
        System.out.println(buffer.position());
        System.out.println(buffer.limit());
        System.out.println(buffer.capacity());
        byte[] dst = new byte[buffer.limit()];
        buffer.get(dst);
        System.out.println("-------------get()-------------");
        System.out.println(buffer.position());
        System.out.println(buffer.limit());
        System.out.println(buffer.capacity());
        System.out.println(new String(dst, 0, dst.length));
        buffer.rewind();
        System.out.println("-------------rewind()-------------");
        System.out.println(buffer.position());
        System.out.println(buffer.limit());
        System.out.println(buffer.capacity());
        buffer.clear();
        System.out.println("-------------clear()-------------");
        System.out.println(buffer.position());
        System.out.println(buffer.limit());
        System.out.println(buffer.capacity());
        System.out.println((char) buffer.get());
        // 总结方法：
        // allocate()：分配一个指定大小的缓冲区
        // put()：存入数据到缓冲区中
        // flip()：切换读取数据模式
        // get()：获取缓冲区中的数据
        // rewind()：可重复读
        // clear()：清空缓冲区，但是缓冲区的数据依然存在，处于“被遗忘”状态
        // mark()：标记
        // reset()：恢复到mark的位置
        // limit()：界限，表示缓冲区中可以操作数据的大小。（limit后数据不能进行读写）
        // capacity()：容量，表示缓冲区中最大存储数据的容量。一旦声明不能改变。
        // position()：位置，表示缓冲区中正在操作数据的位置。
        // 0 <= mark <= position <= limit <= capacity
    }
}

```

- MappedByteBuffer：可以直接让文件在内存（堆外内存）中修改，操作系统不需要拷贝一次
```java
package com.shu.nio.buffer;

import java.io.RandomAccessFile;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;

/**
 * @author : EasonShu
 * @date : 2023/12/24 15:35
 * @Version: 1.0
 * @Desc : 内存映射文件: MappedByteBuffer
 */
public class MapperByteBufferTest {
    public static void main(String[] args) {
        MappedByteBuffer mappedByteBuffer;
        try {
         // 可以直接让文件在内存（堆外内存）中修改，操作系统不需要拷贝一次
            // 1.可以让文件直接在内存中修改
            RandomAccessFile rw = new RandomAccessFile("D:\\test.txt", "rw");
            // 获取对应的通道
            // 参数1：FileChannel.MapMode.READ_WRITE 使用的读写模式
            // 参数2：0：可以直接修改的起始位置
            // 参数3：5：是映射到内存的大小（不是索引位置），即将test.txt的多少个字节映射到内存
            mappedByteBuffer = rw.getChannel().map(FileChannel.MapMode.READ_WRITE, 0, 5);
            // 修改文件
            mappedByteBuffer.put(0, (byte) 'H');
            mappedByteBuffer.put(3, (byte) '9');
            // java.nio.DirectByteBuffer[pos=0,lim=5,cap=5]
            System.out.println(mappedByteBuffer);
            rw.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

    }
}

```
🌈🌈直接缓冲区与非直接缓冲区

- 非直接缓冲区

通过 allocate() 方法分配缓冲区，将缓冲区建立在 JVM 的内存之中。
```java
     // 分配直接缓冲区
    ByteBuffer byteBuffer = ByteBuffer.allocate(1024);
    // 判断是直接缓冲区还是非直接缓冲区
    System.out.println(byteBuffer.isDirect());
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683175907022-95560a6d-2b0a-4935-9cc2-b4507b4996a1.png#averageHue=%23f6f6f6&clientId=u4f023639-114d-4&from=paste&id=uf2fd4a1a&originHeight=398&originWidth=583&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=52468&status=done&style=none&taskId=u1b74be4f-9bfa-4001-a2ec-eaaa52a8add&title=)

- 直接缓冲区

通过 allocateDirect() 方法分配缓冲区，将缓冲区建立在物理内存之中。
```java
 // 分配直接缓冲区
    ByteBuffer byteBuffer = ByteBuffer.allocateDirect(1024);
    // 判断是直接缓冲区还是非直接缓冲区
    System.out.println(byteBuffer.isDirect());
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683175917922-d3a8c7a7-5b53-4b56-9f4f-643de636d8d3.png#averageHue=%23f4f4f4&clientId=u4f023639-114d-4&from=paste&id=u454fd367&originHeight=398&originWidth=583&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=73960&status=done&style=none&taskId=ue56f83e3-1b7d-49d0-bd6f-29641960c56&title=)
## 3.2 Channel

- 通道（channel）：由 java.nio.channels 包定义的，Channel 表示 IO 源与目标打开的连接，Channel 类似于传统的流，只不过 Channel 本身不能直接访问数据，Channel 只能与 Buffer 进行交互。
- 通道用于源节点与目标节点的连接，在 Java NIO 中负责缓冲区中数据的传输，Channel 本身不存储数据，因此需要配合缓冲区进行传输。

🌈🌈类型
java.nio.channels.Channel 包下：

- 1.FileChannel 用于文件IO操作
- 2.DatagramChannel 用于UDP的IO操作
- 3.SocketChannel 用于TCP的传输操作
- 4.ServerSocketChannel 用于TCP连接监听操作

本地 IO：FileInputStream/FileOutputStream，RandomAccessFile
网络 IO: Socket，ServerSocket，DatagramSocket
🌈🌈案例
```java
package com.shu.nio;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;

/**
 * @description:
 * @author: shu
 * @createDate: 2023/4/24 14:31
 * @version: 1.0
 */
public class ChannelTest {
    public static void main(String[] args) throws IOException {
        // Channel：用于源节点与目标节点的连接。
        // 在Java NIO中负责缓冲区中数据的传输。Channel本身不存储数据，因此需要配合缓冲区进行传输。
        // Channel的主要实现类：
        // java.nio.channels.Channel接口：
        // |--FileChannel
        // |--SocketChannel
        // |--ServerSocketChannel
        // |--DatagramChannel
        // 获取通道
        // 1. Java针对支持通道的类提供了getChannel()方法
        // 本地IO：
        // FileInputStream/FileOutputStream
        // RandomAccessFile
        // 网络IO：
        // Socket
        // ServerSocket
        // DatagramSocket
        // 2. 在JDK1.7中的NIO.2针对各个通道提供了静态方法open()
        // 3. 在JDK1.7中的NIO.2的Files工具类的newByteChannel()
        // 分散（Scatter）与聚集（Gather）
        // 分散读取（Scattering Reads）：将通道中的数据分散到多个缓冲区中
        // 聚集写入（Gathering Writes）：将多个缓冲区中的数据聚集到通道中
        // 字符集：Charset
        // 编码：字符串 -> 字节数组
        // 解码：字节数组 -> 字符串
        System.out.println("-------------FileInputStream-------------");
        FileInputStream fis = new FileInputStream("1.txt");
        // 2. 获取通道
        FileChannel channel = fis.getChannel();
        // 3. 分配指定大小的缓冲区
         ByteBuffer buf = ByteBuffer.allocate(1024);
        // 4. 将通道中的数据存入缓冲区中
         channel.read(buf);
        // 5. 切换读取数据的模式
         buf.flip();
        // 6. 将缓冲区中的数据写入通道中
         channel.write(buf);
        // 7. 关闭通道
         channel.close();
    }
}

```
```java
package com.shu.nio.channel;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.channels.FileChannel;

/**
 * @author : EasonShu
 * @date : 2023/12/24 11:37
 * @Version: 1.0
 * @Desc : FileChannel拷贝文件
 */
public class FileChannelCopyTest {
    public static void main(String[] args) {
        // 1. 从FileInputStream获取Channel
        try (FileInputStream inputStream = new FileInputStream("D:\\test.txt");
             FileChannel inChannel = inputStream.getChannel();
             FileOutputStream outputStream = new FileOutputStream("D:\\test02.txt");
             FileChannel outChannel = outputStream.getChannel()) {
            // 2. 从Channel拷贝数据
            inChannel.transferTo(0, inChannel.size(), outChannel);
            System.out.println("拷贝完成");
            inChannel.close();
            outChannel.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

- FileChannel拷贝文件
```java
package com.shu.nio.channel;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.channels.FileChannel;

/**
 * @author : EasonShu
 * @date : 2023/12/24 11:37
 * @Version: 1.0
 * @Desc : FileChannel拷贝文件
 */
public class FileChannelCopyTest {
    public static void main(String[] args) {
        // 1. 从FileInputStream获取Channel
        try (FileInputStream inputStream = new FileInputStream("D:\\test.txt");
             FileChannel inChannel = inputStream.getChannel();
             FileOutputStream outputStream = new FileOutputStream("D:\\test02.txt");
             FileChannel outChannel = outputStream.getChannel()) {
            // 2. 从Channel拷贝数据
            inChannel.transferTo(0, inChannel.size(), outChannel);
            System.out.println("拷贝完成");
            inChannel.close();
            outChannel.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

```
## 3.3 Selector
Selector一般称为选择器，也可以翻译为多路复用器，是Java NIO核心组件之一，主要功能是用于检查一个或者多个NIO Channel（通道）的状态是否处于可读、可写。如此可以实现单线程管理多个Channel（通道），当然也可以管理多个网络连接。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1683186505896-f0e72ca3-81b8-4682-bd00-303b3645950d.png#averageHue=%23dca37a&clientId=u760b8f55-ace9-4&from=paste&id=ua00a141f&originHeight=260&originWidth=636&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=71851&status=done&style=none&taskId=u7e06c9b9-0876-404d-a121-0eb49249cc4&title=)
🌈🌈IO事件
Java NIO将NIO事件进行了简化，只定义了四个事件，这四种事件用SelectionKey的四个常量来表示，我们在注册时只注册我们感兴趣的事件：

- SelectionKey.OP_CONNECT
- SelectionKey.OP_ACCEPT
- SelectionKey.OP_READ
- SelectionKey.OP_WRITE

🌈🌈案例
```java
package com.shu.nio;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;
import java.util.Set;

/**
 * @description: NIO时间服务器服务端
 * @author: shu
 * @createDate: 2023/4/24 14:40
 * @version: 1.0
 */
public class MultiplexerTimeServer implements Runnable {
    private Selector selector;

    private ServerSocketChannel servChannel;

    private volatile boolean stop;

    /**
     * 初始化多路复用器、绑定监听端口
     *
     * @param port
     */
    public MultiplexerTimeServer(int port) {
        try {
            selector = Selector.open();
            servChannel = ServerSocketChannel.open();
            servChannel.configureBlocking(false);
            servChannel.socket().bind(new InetSocketAddress(port), 1024);
            servChannel.register(selector, SelectionKey.OP_ACCEPT);
            System.out.println("The time server is start in port : " + port);
        } catch (IOException e) {
            e.printStackTrace();
            System.exit(1);
        }
    }

    public void stop() {
        this.stop = true;
    }



    @Override
    public void run() {
        while (!stop) {
            try {
                selector.select(1000);
                Set<SelectionKey> selectedKeys = selector.selectedKeys();
                Iterator<SelectionKey> it = selectedKeys.iterator();
                SelectionKey key = null;
                while (it.hasNext()) {
                    key = it.next();
                    it.remove();
                    try {
                        handleInput(key);
                    } catch (Exception e) {
                        if (key != null) {
                            key.cancel();
                            if (key.channel() != null) {
                                key.channel().close();
                            }
                        }
                    }
                }
            } catch (Throwable t) {
                t.printStackTrace();
            }
        }

        // 多路复用器关闭后，所有注册在上面的Channel和Pipe等资源都会被自动去注册并关闭，所以不需要重复释放资源
        if (selector != null) {
            try {
                selector.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private void handleInput(SelectionKey key) throws IOException {

        if (key.isValid()) {
            // 处理新接入的请求消息
            if (key.isAcceptable()) {
                // Accept the new connection
                ServerSocketChannel ssc = (ServerSocketChannel) key.channel();
                SocketChannel sc = ssc.accept();
                sc.configureBlocking(false);
                // Add the new connection to the selector
                sc.register(selector, SelectionKey.OP_READ);
            }
            if (key.isReadable()) {
                // Read the data
                SocketChannel sc = (SocketChannel) key.channel();
                ByteBuffer readBuffer = ByteBuffer.allocate(1024);
                int readBytes = sc.read(readBuffer);
                if (readBytes > 0) {
                    readBuffer.flip();
                    byte[] bytes = new byte[readBuffer.remaining()];
                    readBuffer.get(bytes);
                    String body = new String(bytes, "UTF-8");
                    System.out.println("The time server receive order : "
                            + body);
                    String currentTime = "QUERY TIME ORDER"
                            .equalsIgnoreCase(body) ? new java.util.Date(
                            System.currentTimeMillis()).toString()
                            : "BAD ORDER";
                    doWrite(sc, currentTime);
                } else if (readBytes < 0) {
                    // 对端链路关闭
                    key.cancel();
                    sc.close();
                } else
                    ; // 读到0字节，忽略
            }
        }
    }

    private void doWrite(SocketChannel channel, String response)
            throws IOException {
        if (response != null && response.trim().length() > 0) {
            byte[] bytes = response.getBytes();
            ByteBuffer writeBuffer = ByteBuffer.allocate(bytes.length);
            writeBuffer.put(bytes);
            writeBuffer.flip();
            channel.write(writeBuffer);
        }
    }

}

```
🌈🌈理解
简单理解Selector不断的轮循事件Key，查询自己注册的事件，然后做对应的事情比如
```java
 private void handleInput(SelectionKey key) throws IOException {

        if (key.isValid()) {
            // 处理新接入的请求消息
            if (key.isAcceptable()) {
                // Accept the new connection
                ServerSocketChannel ssc = (ServerSocketChannel) key.channel();
                SocketChannel sc = ssc.accept();
                sc.configureBlocking(false);
                // Add the new connection to the selector
                sc.register(selector, SelectionKey.OP_READ);
            }
            if (key.isReadable()) {
                // Read the data
                SocketChannel sc = (SocketChannel) key.channel();
                ByteBuffer readBuffer = ByteBuffer.allocate(1024);
                int readBytes = sc.read(readBuffer);
                if (readBytes > 0) {
                    readBuffer.flip();
                    byte[] bytes = new byte[readBuffer.remaining()];
                    readBuffer.get(bytes);
                    String body = new String(bytes, "UTF-8");
                    System.out.println("The time server receive order : "
                            + body);
                    String currentTime = "QUERY TIME ORDER"
                            .equalsIgnoreCase(body) ? new java.util.Date(
                            System.currentTimeMillis()).toString()
                            : "BAD ORDER";
                    doWrite(sc, currentTime);
                } else if (readBytes < 0) {
                    // 对端链路关闭
                    key.cancel();
                    sc.close();
                } else
                    ; // 读到0字节，忽略
            }
        }
    }
```
## 3.4 **Zerocopy技术介绍**

- zerocopy技术的目标就是提高IO密集型JAVA应用程序的性能。在本文的前面部分介绍了：IO操作需要数据频繁地在内核缓冲区和用户缓冲区之间拷贝，而zerocopy技术可以减少这种拷贝的次数，同时也降低了上下文切换(用户态与内核态之间的切换)的次数。
- 比如，大多数WEB应用程序执行的一项操作就是：接受用户请求--->从本地磁盘读数据--->数据进入内核缓冲区--->用户缓冲区--->内核缓冲区--->用户缓冲区--->socket发送
- 数据每次在内核缓冲区与用户缓冲区之间的拷贝会消耗CPU以及内存的带宽。而zerocopy有效减少了这种拷贝次数。
```java
Each time data traverses the user-kernel boundary, it must be copied, which consumes CPU cycles and memory bandwidth.
Fortunately, you can eliminate these copies through a technique called—appropriately enough —zero copy
```
**那它是怎么做到的呢？**
我们知道，JVM(JAVA虚拟机)为JAVA语言提供了跨平台的一致性，屏蔽了底层操作系统的具体实现细节，因此，JAVA语言也很难直接使用底层操作系统提供的一些“奇技淫巧”。
而要实现zerocopy，首先得有操作系统的支持。其次，JDK类库也要提供相应的接口支持。幸运的是，自JDK1.4以来，JDK提供了对NIO的支持，通过java.nio.channels.FileChannel类的**transferTo()**方法可以直接将字节传送到可写的通道中(Writable Channel)，并不需要将字节送入用户程序空间(用户缓冲区)
```java
You can use the transferTo()method to transfer bytes directly from the channel on which it is invoked to 
another writable byte channel, without requiring data to flow through the application
```
下面就来详细分析一下经典的web服务器(比如文件服务器)干的活：从磁盘中中读文件，并把文件通过网络(socket)发送给Client。
```java
File.read(fileDesc, buf, len);
Socket.send(socket, buf, len);
```
从代码上看，就是两步操作。第一步：将文件读入buf；第二步：将 buf 中的数据通过socket发送出去。但是，这两步操作需要**四次上下文切换**(用户态与内核态之间的切换) 和 **四次拷贝操作**才能完成。
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1703410361113-22120a8d-aab2-436d-b640-eed5b8b73e30.png#averageHue=%23f4f4f4&clientId=uf135f525-3682-4&from=paste&id=ue299a52e&originHeight=517&originWidth=594&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=uaab5227b-e66c-428f-8963-c7359218fda&title=)
①第一次上下文切换发生在 read()方法执行，表示服务器要去磁盘上读文件了，这会导致一个 sys_read()的系统调用。此时由用户态切换到内核态，完成的动作是：DMA把磁盘上的数据读入到内核缓冲区中（**这也是第一次拷贝**）。
②第二次上下文切换发生在**read()方法的返回(_这也说明read()是一个__阻塞__调用_)**，表示数据已经成功从磁盘上读到内核缓冲区了。此时，由内核态返回到用户态，完成的动作是：将内核缓冲区中的数据拷贝到用户缓冲区（**这是第二次拷贝**）。
③第三次上下文切换发生在 send()方法执行，表示服务器准备把数据发送出去了。此时，由用户态切换到内核态，完成的动作是：将用户缓冲区中的数据拷贝到内核缓冲区(**这是第三次拷贝**)
④第四次上下文切换发生在 send()方法的返回【_这里的send()方法可以异步返回，所谓异步返回就是：线程执行了send()之后立即从send()返回，剩下的数据拷贝及发送就交给底层操作系统实现了】_。此时，由内核态返回到用户态，完成的动作是：将内核缓冲区中的数据送到 protocol engine.（**这是第四次拷贝**）
这里对 protocol engine不是太了解，但是从上面的示例图来看：它是[NIC](http://baike.baidu.com/link?url=dsAR71WjxBWkQb1HTOTt2pJ0SKMCoJh5coQS_vfk_W81EVZS5Sk58pwGMVAdxtQH3M9q_8Y-UxDlnyaw9PCDY_)(NetWork Interface Card) buffer。网卡的buffer?
下面这段话，非常值得一读：**这里再一次提到了为什么需要内核缓冲区。**
```java
Use of the intermediate kernel buffer (rather than a direct transfer of the data
into the user buffer)might seem inefficient. But intermediate kernel buffers were 
introduced into the process to improve performance. Using the intermediate 
buffer on the read side allows the kernel buffer to act as a "readahead cache" 
when the application hasn't asked for as much data as the kernel buffer holds.
This significantly improves performance when the requested data amount is less
than the kernel buffer size. The intermediate buffer on the write side allows the write to complete asynchronously.
```
一个核心观点就是：内核缓冲区提高了性能。咦？是不是很奇怪？因为前面一直说正是因为引入了内核缓冲区(中间缓冲区)，使得数据来回地拷贝，降低了效率。
那先来看看，它为什么说内核缓冲区提高了性能。
对于读操作而言，内核缓冲区就相当于一个“readahead cache”，当用户程序**一次**只需要读一小部分数据时，首先操作系统从磁盘上读一大块数据到内核缓冲区，用户程序只取走了一小部分(_ 我可以只 new 了一个 128B的byte数组啊! new byte[128]_)。当用户程序下一次再读数据，就可以直接从内核缓冲区中取了，操作系统就不需要再次访问磁盘啦！因为用户要读的数据已经在内核缓冲区啦！这也是前面提到的：为什么后续的读操作(read()方法调用)要明显地比第一次快的原因。从这个角度而言，内核缓冲区确实提高了读操作的性能。
再来看写操作：可以做到 “异步写”（write asynchronously）。也即：wirte(dest[]) 时，用户程序告诉操作系统，把dest[]数组中的内容写到XX文件中去，于是write方法就返回了。操作系统则在后台默默地把用户缓冲区中的内容(dest[])拷贝到内核缓冲区，再把内核缓冲区中的数据写入磁盘。那么，只要内核缓冲区未满，用户的write操作就可以很快地返回。这应该就是异步刷盘策略吧。
_(其实，到这里。以前一个纠结的问题就是同步IO，异步IO，阻塞IO，非阻塞IO之间的区别已经没有太大的意义了。这些概念，只是针对的看问题的角度不一样而已。阻塞、非阻塞是针对线程自身而言；同步、异步是针对线程以及影响它的外部事件而言....)【更加完美、精辟的解释可以参考这个系列的文章：_[系统间通信（3）——IO通信模型和JAVA实践 上篇](http://blog.csdn.net/yinwenjie/article/details/48472237)_】_
既然，你把内核缓冲区说得这么强大和完美，那还要 zerocopy干嘛啊？？？
```
Unfortunately, this approach itself can become a performance bottleneck if the size of the data requested 
is considerably larger than the kernel buffer size. The data gets copied multiple times among the disk, kernel buffer, 
and user buffer before it is finally delivered to the application.
Zero copy improves performance by eliminating these redundant data copies.
```
终于轮到zerocopy粉墨登场了。**当需要传输的数据远远大于内核缓冲区的大小时，内核缓冲区就会成为瓶颈**。这也是为什么zerocopy技术合适大文件传输的原因。内核缓冲区为啥成为了瓶颈？---我想，很大的一个原因是它已经起不到“缓冲”的功能了，毕竟传输的数据量太大了。

**下面来看看zerocopy技术是如何来处理文件传输的。**
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1703410360848-22bbc8e3-1795-4888-b4d1-b8e11ee8a0c6.png#averageHue=%23907b3d&clientId=uf135f525-3682-4&from=paste&id=u64f3ca10&originHeight=457&originWidth=553&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=ub4b234b0-458e-47d2-9ced-0cb1e317377&title=)
当 transferTo()方法 被调用时，由用户态切换到内核态。完成的动作是：DMA将数据从磁盘读入 Read buffer中(第一次数据拷贝)。然后，还是在内核空间中，将数据从Read buffer 拷贝到 Socket buffer(第二次数据拷贝)，最终再将数据从 Socket buffer 拷贝到 NIC buffer(第三次数据拷贝)。然后，再从内核态返回到用户态。
上面整个过程就只涉及到了：三次数据拷贝和二次上下文切换。感觉也才减少了一次数据拷贝嘛。但这里已经不涉及用户空间的缓冲区了。
三次数据拷贝中，也只有一次拷贝需要到CPU的干预。（第2次拷贝），而前面的传统数据拷贝需要四次且有三次拷贝需要CPU的干预。
```java
This is an improvement: we've reduced the number of context switches from four to two and reduced the number of data copies
from four to three (only one of which involves the CPU)
```
如果说zerocopy技术只能完成到这步，那也就 just so so 了。
```java
We can further reduce the data duplication done by the kernel if the underlying network interface card supports 
gather operations. In Linux kernels 2.4 and later, the socket buffer descriptor was modified to accommodate this requirement. 
This approach not only reduces multiple context switches but also eliminates the duplicated data copies that 
require CPU involvement.
```
也就是说，**如果底层的网络硬件以及操作系统支持**，还可以进一步减少数据拷贝次数 以及 CPU干预次数。
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1703410360810-48a807cc-59b4-472f-8a5a-99ab64fcb25c.png#averageHue=%23f8f8f8&clientId=uf135f525-3682-4&from=paste&id=u16d70c75&originHeight=461&originWidth=503&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u03f801c4-54e0-4f0c-97a2-b2db896c87e&title=)
从上图看出：这里一共只有两次拷贝 和 两次上下文切换。而且这两次拷贝都是DMA copy，并不需要CPU干预(严谨一点的话就是不完全需要吧.)。
整个过程如下：

- 用户程序执行 transferTo()方法，导致一次系统调用，从用户态切换到内核态。完成的动作是：DMA将数据从磁盘中拷贝到Read buffer
- 用一个描述符标记此次待传输数据的地址以及长度，DMA直接把数据从Read buffer 传输到 NIC buffer。数据拷贝过程都不用CPU干预了。

