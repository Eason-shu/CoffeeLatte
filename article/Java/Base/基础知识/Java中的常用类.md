---
title: Java中的常用类
sidebar_position: 3
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


## 一 String，StringBuilder，StringBuffer
- 从可变性来讲String的是不可变的，StringBuilder，StringBuffer的长度是可变的。
- 从运行速度上来讲StringBuilder > StringBuffer > String。
- 从线程安全上来StringBuilder是线程不安全的，而StringBuffer是线程安全的。
- String：适用于少量的字符串操作的情况。
- StringBuilder：适用于单线程下在字符缓冲区进行大量操作的情况。
- StringBuffer：适用多线程下在字符缓冲区进行大量操作的情况。
### 1.1 String

- 为什么String的是不可变的？

![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1645418463547-9bf7196d-0c0c-4764-ac00-6b05f4168d77.png#clientId=u949336bb-2080-4&from=paste&height=90&id=ue6b36380&originHeight=180&originWidth=1433&originalType=binary&ratio=1&rotation=0&showTitle=false&size=29602&status=done&style=none&taskId=u6c9adc2b-1dc6-44da-96b7-ce839c3fbc9&title=&width=716.5)

- 为什么String是不可变，但是下面的代码运行完，却发生变化了，这是为啥呢？
```java
public class StringUtils {
    public static void main(String[] args) {
        // String的拼接
        String msg = "你好啊，";
        String notes = msg + "哈哈哈哈!";
        System.out.println(notes);
    }
}
```

- 在使用+ 进行拼接的时候，实际上jvm是初始化了一个StringBuilder进行拼接的。
```java
public class Demo {
    public static void main(String[] args) {
        String str = "你好啊";
        StringBuilder builder =new StringBuilder();
        builder.append(str);
        builder.append("哈哈哈哈");
        str = builder.toString();
        System.out.println(str);
    }
}
```

- 我们可以看下builder.toString(); 的实现， 很明显toString方法是生成了一个新的String对象而不是更改旧的str的内容，相当于把旧str的引用指向的新的String对象。这也就是str发生变化的原因。
```java
@Override
public String toString() {
  // Create a copy, don't share the array
  return new String(value, 0, count);
}
```
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1645418586982-f17f9168-d5bb-4745-bb34-9479930f904a.png#clientId=u949336bb-2080-4&from=paste&height=48&id=uabf3be61&originHeight=95&originWidth=592&originalType=binary&ratio=1&rotation=0&showTitle=false&size=16073&status=done&style=none&taskId=u3367f8f4-9276-42bd-8436-f1451421eca&title=&width=296)
### 1.2 StringBuilder

- 为什么StringBuilder不能用于多线程？
```java
public class StringUtils {
    public static void main(String[] args) {
        // StringBuilder的线程安全问题
        StringBuilder stringBuilder = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    for (int j = 0; j < 1000; j++) {
                        stringBuilder.append("a");
                    }
                }
            }).start();
        }
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println(stringBuilder.length());
    }
}
```

- 查看实现方法append（）
```java
@Override
    public StringBuilder append(String str) {
        super.append(str);
        return this;
    }
```
```java
 public AbstractStringBuilder append(String str) {
        if (str == null)
            return appendNull();
        int len = str.length();
        ensureCapacityInternal(count + len);
        str.getChars(0, len, value, count);
        count += len;
        return this;
    }
```

- 很明显在多线程环境在StringBuilder的使用是有问题的。
- 首先在count += len时，这是一个非原子性操作，假如一个线程去修改该值，其他线程也去修改该值，这就会出现问题。
### 1.3 StringBuffer

- 关于StringBuffer的多线程操作？
```java
public class StringUtils {
    public static void main(String[] args) {
    // StringBuilder的线程安全问题
        StringBuilder stringBuilder = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    for (int j = 0; j < 1000; j++) {
                        stringBuilder.append("a");
                    }
                }
            }).start();
        }
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println(stringBuilder.length());
    }}
```

- 查看实现方法append（）
```java

    @Override
    public synchronized StringBuffer append(String str) {
        toStringCache = null;
        super.append(str);
        return this;
    }
```

- 这是因为在StringBuffer类内，常用的方法都使用了synchronized 进行同步所以是线程安全的，然而StringBuilder并没有。这也就是运行速度StringBuilder > StringBuffer的原因了。
## 二 Files类的使用
Java NIO Files类（java.nio.file.Files）提供了几种方法来处理文件系统中的文件。 这个Java NIO文件教程将涵盖这些方法中最常用的。 Files类包含许多方法，所以如果你需要一个在这里没有描述的方法，那么也检查JavaDoc。
### 2.1 基本使用

- 检查文件是否存在：Files.exists(path, LinkOption.NOFOLLOW_LINKS);
```java
public class FilesUtils {
    public static void main(String[] args) {
        Path path = Paths.get("D:\\coreconfig.txt");
        // 文件是否存在，这个数组内包含了LinkOptions.NOFOLLOW_LINKS，表示检测时			不包含符号链接文件。
        boolean pathExists = Files.exists(path, LinkOption.NOFOLLOW_LINKS);
        System.out.println(pathExists);//true
    }
}
```

- 创建文件：Files.createFile(path);
```java
public class FilesUtils {
    public static void main(String[] args) throws IOException {
        Path path = Paths.get("D:\\coreconfig.txt");
        // 文件是否存在
        boolean pathExists = Files.exists(path, LinkOption.NOFOLLOW_LINKS);
        if(!pathExists){
            // 创建文件
            Files.createFile(path);
        }
    }
}
```

- 创建文件夹：Files.createDirectories(paths)
```java
public class FilesUtils {
    public static void main(String[] args) throws IOException {
        // 文件夹
        Path paths = Paths.get("D://data//test");
        try {
            // 创建文件夹
            Path newDir = Files.createDirectories(paths);
        } catch(FileAlreadyExistsException e){
            // the directory already exists.
        } catch (IOException e) {
            //something else went wrong
            e.printStackTrace();
        }
    }
}
```

- 删除文件或目录： Files.delete(path)
```java
public class FilesUtils {
    public static void main(String[] args) throws IOException {
        // 删除文件或目录
        Files.delete(path);
        Files.delete(paths);
    }
}
```

- 文件复制：Files.copy(path,paths)
```java
Files.copy(path,paths);
```

- 获取文件信息
```java
  		Path path = Paths.get("D:\\XMind\\bcl-java.txt");
        System.out.println(Files.getLastModifiedTime(path));
        System.out.println(Files.size(path));
        System.out.println(Files.isSymbolicLink(path));
        System.out.println(Files.isDirectory(path));
        System.out.println(Files.readAttributes(path, "*"));

2016-05-18T08:01:44Z
18934
false
false
{lastAccessTime=2017-04-12T01:42:21.149351Z, lastModifiedTime=2016-05-18T08:01:44Z, size=18934, creationTime=2017-04-12T01:42:21.149351Z, isSymbolicLink=false, isRegularFile=true}
```

- 遍历一个文件夹：Files.newDirectoryStream(dir))
```java
 		Path dir = Paths.get("D:\\Java");
        try(DirectoryStream<Path> stream = Files.newDirectoryStream(dir)){
            for(Path e : stream){
                System.out.println(e.getFileName());
            }
        }catch(IOException e){
        }
```

- 遍历整个文件目录
```java
package Utils;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.LinkedList;
import java.util.List;

/**
 * @Author shu
 * @Date: 2022/02/21/ 13:57
 * @Description
 **/
public class WorkFileTree {
    public static void main(String[] args) throws IOException {
        Path startingDir = Paths.get("D:\\apache-tomcat-9.0.0.M17");
        List<Path> result = new LinkedList<Path>();
        Files.walkFileTree(startingDir, new FindJavaVisitor(result));
        System.out.println("result.size()=" + result.size());
    }


    private static class FindJavaVisitor extends SimpleFileVisitor<Path> {
        private List<Path> result;
        public FindJavaVisitor(List<Path> result){
            this.result = result;
        }
        @Override
        public FileVisitResult visitFile(Path file, BasicFileAttributes attrs){
            if(file.toString().endsWith(".java")){
                result.add(file.getFileName());
            }
            return FileVisitResult.CONTINUE;
        }
    }
}

```
###

