---
title: Redis7 （一） 初步认识Redis
sidebar_position: 2
keywords:
  - Redis
  - 源码分析
tags:
  - Redis
  - Java
  - 数据库
  - 学习笔记
last_update:
  date: 2023-07-01
  author: EasonShu
---

参考视频教程：[Redis零基础到进阶，最强redis7教程](https://www.bilibili.com/video/BV13R4y1v7sP/)
官网：[Redis](https://redis.io/)
中文官网：[Redis中文网](https://www.redis.net.cn/)
Redis命令手册：[redis 命令手册](https://redis.com.cn/commands.html)
# 一 Redis 初步认识
![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1693133313208-c0d5dbef-333d-42a9-a98e-06be43159af4.webp#averageHue=%23f9fbf7&clientId=uf2a1a716-71d7-4&from=paste&id=ue4d0b011&originHeight=509&originWidth=720&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uc87e3455-a354-4aff-a61a-a6dd9e51210&title=)
## 1.1 Redis

- Redis（**Re**mote **Di**ctionary **S**erver )，即远程字典服务；

是一个开源的使用 ANSI C 语言编写、支持网络、可基于内存亦可持久化的日志型、Key-Value 数据库，并提供多种语言的 API。

- Redis是一个开源（BSD许可），内存存储的数据结构服务器，可用作数据库，高速缓存和消息队列代理。它支持[字符串](https://www.redis.net.cn/tutorial/3508.html)、[哈希表](https://www.redis.net.cn/tutorial/3509.html)、[列表](https://www.redis.net.cn/tutorial/3510.html)、[集合](https://www.redis.net.cn/tutorial/3511.html)、[有序集合](https://www.redis.net.cn/tutorial/3512.html)，[位图](https://www.redis.net.cn/tutorial/3508.html)，[hyperloglogs](https://www.redis.net.cn/tutorial/3513.html)等数据类型。内置复制、[Lua脚本](https://www.redis.net.cn/tutorial/3516.html)、LRU收回、[事务](https://www.redis.net.cn/tutorial/3515.html)以及不同级别磁盘持久化功能，同时通过Redis Sentinel提供高可用，通过Redis Cluster提供自动[分区](https://www.redis.net.cn/tutorial/3524.html)。
- REmote DIctionary Server(Redis) 是一个由Salvatore Sanfilippo写的key-value存储系统。
- Redis是一个开源的使用ANSI C语言编写、遵守BSD协议、支持网络、可基于内存亦可持久化的日志型、Key-Value数据库，并提供多种语言的API。
- 它通常被称为数据结构服务器，因为值（value）可以是 字符串(String), 哈希(Map), 列表(list), 集合(sets) 和 有序集合(sorted sets)等类型。
## 1.2 作用

1. 基于内存，性能极高 – Redis能读的速度是110000次/s,写的速度是81000次/s ，作为Mysql，缓存的补充，减少Mysql的消耗，提交性能
2. 内部存储+持久化（AOF+RDB）Redis支持异步将内存数据写入硬盘，不影响其他服务
3. 分布式缓存，分布式锁，缓存穿透，击穿，雪崩
4. 高可用架构，单机，主从，哨兵，集群
## 1.3 优势

- 性能极高 – Redis能读的速度是110000次/s,写的速度是81000次/s 。
- 丰富的数据类型 – Redis支持二进制案例的 Strings, Lists, Hashes, Sets 及 Ordered Sets 数据类型操作。
- 原子 – Redis的所有操作都是原子性的，同时Redis还支持对几个操作全并后的原子性执行。
- 丰富的特性 – Redis还支持 publish/subscribe, 通知, key 过期等等特性。
## 1.4 Redis与其他key-value存储有什么不同？

- Redis有着更为复杂的数据结构并且提供对他们的原子性操作，这是一个不同于其他数据库的进化路径。
- Redis的数据类型都是基于基本数据结构的同时对程序员透明，无需进行额外的抽象。
- Redis运行在内存中但是可以持久化到磁盘，所以在对不同数据集进行高速读写时需要权衡内存，应为数据量不能大于硬件内存，在内存数据库方面的另一个优点是， 相比在磁盘上相同的复杂的数据结构，在内存中操作起来非常简单，这样Redis可以做很多内部复杂性很强的事情。 同时，在磁盘格式方面他们是紧凑的以追加的方式产生的，因为他们并不需要进行随机访问。
## 1.5 Redis7新特性

- Redis Functions：Redis函数，一种新的通过服务端脚本扩展Redis的方式，函数与数据本身一起存储。函数还被持久化到AOF文件，并从主文件复制到副本，因此它们与数据本身一样持久，见：[https://redis.io/topics/functions-intro](https://redis.io/topics/functions-intro)；
- ACL改进：支持基于key的细粒度的权限，允许用户支持多个带有选择器的命令规则集，见：[https://redis.io/topics/acl#key-permissions](https://redis.io/topics/acl#key-permissions) 和[https://redis.io/topics/acl#selectors](https://redis.io/topics/acl#selectors)；
- sharded-pubsub：分片发布/订阅支持，之前消息会在整个集群中广播，而与订阅特定频道/模式无关。发布行为会连接到集群中的所有节点，而不用客户端连接到所有节点都会收到订阅消息。见 [https://redis.io/topics/pubsub#sharded-pubsub](https://redis.io/topics/pubsub#sharded-pubsub)
- 在大多数情况下把子命令当作一类命令处理（Treat subcommands as commands）（影响 ACL类别、INFO 命令统计等）
- 文档更新：提供命令的元数据和文档，文档更完善，见[https://redis.io/commands/command-docs](https://redis.io/commands/command-docs) [https://redis.io/topics/command-tips](https://redis.io/topics/command-tips)
- Command key-specs：为客户端定位key参数和读/写目的提供一种更好的方式；
- 多部分 AOF 机制避免了 AOF 重写的开销；
- 集群支持主机名配置，而不仅仅是 IP 地址；
- 客户端驱逐策略：改进了对网络缓冲区消耗的内存的管理，并且提供一个选项，当总内存超过限制时，剔除对应的客户端；
- 提供一种断开集群总线连接的机制，来防止不受控制的缓冲区增长；
- AOF：增加时间戳和对基于时间点恢复的支持；
- Lua：支持 EVAL 脚本中的函数标志；
- Lua：支持 Verbatim 和 Big-Number 类型的 RESP3 回复；
- Lua：可以通过 redis.REDIS_VERSION、redis.REDIS_VERSION_NUM来获取 Redis 版本。
## 1.6 演进
>  单机Sql

90年代，一个基本的网站访问量一般不会太大，单个数据库完全足够！ 那个时候，更多的去使用静态网页 Html ~ 服务器根本没有太大的压力！
思考一下，这种情况下：整个网站的瓶颈是什么？
1、数据量如果太大、一个机器放不下了！
2、数据的索引 （B+ Tree），一个机器内存也放不下
3、访问量（读写混合），一个服务器承受不了
只要你开始出现以上的三种情况之一，那么你就必须要晋级！
> Memcached（缓存） + MySQL + 垂直拆分 （读写分离）

网站80%的情况都是在读，每次都要去查询数据库的话就十分的麻烦！所以说我们希望减轻数据的压 力，我们可以使用缓存来保证效率！
发展过程： 优化数据结构和索引–> 文件缓存（IO）—> Memcached（当时最热门的技术！）
分库分表 + 水平拆分 + MySQL集群
本质：数据库（读，写）
早些年MyISAM： 表锁，十分影响效率！高并发下就会出现严重的锁问题
转战Innodb：行锁 慢慢的就开始使用分库分表来解决写的压力！
MySQL 在哪个年代推出 了表分区！这个并没有多少公司 使用！ MySQL 的 集群，很好满足哪个年代的所有需求！
> 如今最近的年代

2010–2020 十年之间，世界已经发生了翻天覆地的变化；（定位，也是一种数据，音乐，热榜！） MySQL 等关系型数据库就不够用了！数据量很多，变化很快~！
MySQL 有的使用它来存储一些比较大的文件，博客，图片！数据库表很大，效率就低了！如果有一种数 据库来专门处理这种数据, MySQL压力就变得十分小（研究如何处理这些问题！）大数据的IO压力下，表几乎没法更大！
# 二 环境安装与配置
## 2.1 下载
### 2.1.1 ubuntu20 安装（7.0）
注意：我这里是ubuntu20

- 安装地址：[Download](https://redis.io/download/)
```java
shu@shu-virtual-machine:/environment$ sudo wget https://github.com/redis/redis/archive/7.0.9.tar.gz

shu@shu-virtual-machine:/environment$ ls
7.0.9.tar.gz
shu@shu-virtual-machine:/environment$

```

- 解压安装
```java
shu@shu-virtual-machine:/environment$ sudo tar -zxvf 7.0.9.tar.gz
```

- 进入目录
```java
shu@shu-virtual-machine:/environment$ cd redis-7.0.9/
shu@shu-virtual-machine:/environment/redis-7.0.9$ ls
00-RELEASENOTES  CODE_OF_CONDUCT.md  COPYING  INSTALL   MANIFESTO  redis.conf  runtest-cluster    runtest-sentinel  sentinel.conf  tests   utils
BUGS             CONTRIBUTING.md     deps     Makefile  README.md  runtest     runtest-moduleapi  SECURITY.md       src            TLS.md
```

- 依赖安装
```java
sudo apt-get install  gcc automake autoconf libtool make -y
```

- 安装
```java
sudo make
```

- 进行编译

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677769143230-9fcb7505-0e53-4686-a134-91b2afb5ca35.png#averageHue=%2383a6d2&clientId=ua11deeec-bc3e-4&from=paste&height=831&id=u8cdbb575&originHeight=1039&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=465672&status=done&style=none&taskId=uc7e72136-79d3-40f5-adb6-a701555fd40&title=&width=1536)

- 错误
```java
shu@shu-virtual-machine:/environment/redis-7.0.9$ sudo apt install tcl
Reading package lists... Done
Building dependency tree
Reading state information... Done
The following additional packages will be installed:
  libtcl8.6 tcl8.6
Suggested packages:
  tcl-tclreadline
The following NEW packages will be installed:
  libtcl8.6 tcl tcl8.6
0 upgraded, 3 newly installed, 0 to remove and 501 not upgraded.
Need to get 922 kB of archives.
After this operation, 4,197 kB of additional disk space will be used.
Do you want to continue? [Y/n] y
Get:1 http://us.archive.ubuntu.com/ubuntu focal/main amd64 libtcl8.6 amd64 8.6.10+dfsg-1 [902 kB]
Get:2 http://us.archive.ubuntu.com/ubuntu focal/main amd64 tcl8.6 amd64 8.6.10+dfsg-1 [14.8 kB]
Get:3 http://us.archive.ubuntu.com/ubuntu focal/universe amd64 tcl amd64 8.6.9+1 [5,112 B]
Fetched 922 kB in 7s (124 kB/s)
Selecting previously unselected package libtcl8.6:amd64.
(Reading database ... 185435 files and directories currently installed.)
Preparing to unpack .../libtcl8.6_8.6.10+dfsg-1_amd64.deb ...
Unpacking libtcl8.6:amd64 (8.6.10+dfsg-1) ...
Selecting previously unselected package tcl8.6.
Preparing to unpack .../tcl8.6_8.6.10+dfsg-1_amd64.deb ...
Unpacking tcl8.6 (8.6.10+dfsg-1) ...
Selecting previously unselected package tcl.
Preparing to unpack .../archives/tcl_8.6.9+1_amd64.deb ...
Unpacking tcl (8.6.9+1) ...
Setting up libtcl8.6:amd64 (8.6.10+dfsg-1) ...
Setting up tcl8.6 (8.6.10+dfsg-1) ...
Setting up tcl (8.6.9+1) ...
Processing triggers for man-db (2.9.1-1) ...
Processing triggers for libc-bin (2.31-0ubuntu9.2) ...
shu@shu-virtual-machine:/environment/redis-7.0.9$ sudo apt-get update
Hit:1 http://security.ubuntu.com/ubuntu focal-security InRelease
Hit:2 http://us.archive.ubuntu.com/ubuntu focal InRelease
Hit:3 http://us.archive.ubuntu.com/ubuntu focal-updates InRelease
Hit:4 http://us.archive.ubuntu.com/ubuntu focal-backports InRelease
Reading package lists... Done
shu@shu-virtual-machine:/environment/redis-7.0.9$
```

- 验证
```java
make test
```

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677770277899-df73dfa6-80dd-4c63-b6c7-b552624e690b.png#averageHue=%237697c7&clientId=ua11deeec-bc3e-4&from=paste&height=831&id=ucbc89eb4&originHeight=1039&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=413203&status=done&style=none&taskId=udb8d52ed-86e9-47b5-b18e-b0d2851161d&title=&width=1536)

- 查看网络ip
```java
# 安装工具
sudo apt install net-tools
shu@shu-virtual-machine:/environment/redis-7.0.9$ ifconfig
ens33: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.102  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::3074:62fc:f667:b639  prefixlen 64  scopeid 0x20<link>
        ether 00:0c:29:0c:5e:fa  txqueuelen 1000  (Ethernet)
        RX packets 4756  bytes 3651443 (3.6 MB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 3050  bytes 259458 (259.4 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 174  bytes 15256 (15.2 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 174  bytes 15256 (15.2 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

- 修改配置文件redis.conf

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677807400770-9c5a195b-8519-45de-b226-c7aebba03fe3.png#averageHue=%23f7f4f2&clientId=udb441212-55ad-4&from=paste&height=326&id=ud65378cd&originHeight=407&originWidth=1708&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=109353&status=done&style=none&taskId=u6bb5e391-ad41-43cb-a3a3-243ca2afed5&title=&width=1366.4)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677807441949-593626a6-68d7-4682-b2aa-a115c8873233.png#averageHue=%23eceae9&clientId=udb441212-55ad-4&from=paste&height=358&id=uc6dfc843&originHeight=448&originWidth=1790&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=95275&status=done&style=none&taskId=u1740355c-1204-4602-b5f8-b7fe55a1d3c&title=&width=1432)

- 启动
```java
shu@shu-virtual-machine:/environment/redis-7.0.9/src$ ./redis-server ../redis.conf
shu@shu-virtual-machine:/environment/redis-7.0.9/src$ ps -ef|grep redis
shu         4083    1522  0 17:38 ?        00:00:00 ./redis-server 127.0.0.1:6379
shu         4089    4015  0 17:39 pts/0    00:00:00 grep --color=auto redis
shu@shu-virtual-machine:/environment/redis-7.0.9/src$
shu@shu-virtual-machine:/environment/redis-7.0.9/src$ ./redis-cli -h 127.0.0.1 -p 6379
127.0.0.1:6379>

```

- 验证
```java
shu@shu-virtual-machine:/environment/redis-7.0.9/src$ ./redis-cli -h 127.0.0.1 -p 6379
127.0.0.1:6379> ping
PONG
127.0.0.1:6379> set age 10
OK
127.0.0.1:6379> get age
"10"
127.0.0.1:6379>
```
### 2.1.2 Linux 安装 (6.0)

- 上传文件到服务器

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677904427544-716c3b22-82c7-47a3-928e-b149d2eaa3ce.png#averageHue=%23f6f5f4&clientId=ucc4e2175-d7ff-4&from=paste&id=u72c41b2c&originHeight=380&originWidth=1230&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=53619&status=done&style=none&taskId=u1ed97e75-0a34-4b49-bf42-1a3331aa306&title=)

- 解压文件
```java
tar -zxvf redis-6.0.6.tar.gz
```

- 复制文件
```java
cp -d redis-6.0.6 /opt/local/redis
```

- 进入/opt/local/redis
```java
cd /opt/local/redis
```

- vim redis.conf 修改配置文件
```java
# 监听地址，默认是 127.0.0.1，会导致只能在本地访问。修改成 0.0.0.0 则可以在任意 IP 访问，生产环境不要设置 0.0.0.0
bind 0.0.0.0
# 守护进程，修改为 yes 后即可后台运行
daemonize yes
# 密码，设置后访问 redis 必须输入密码
requirepass 123456
```

- 环境安装
```java
yum install gcc-c++
make
```

- 启动服务端
```java
./src/redis-server redis.conf
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677906147855-24b173df-d246-4f33-a841-a1889c2e1669.png#averageHue=%23716f6f&clientId=ucc4e2175-d7ff-4&from=paste&id=ucbd7e73d&originHeight=546&originWidth=984&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=388771&status=done&style=none&taskId=u51dd9712-2e2c-4812-be03-7cf4cdb9c23&title=)

- 启动客服端
```java
./src/redis-cli
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677906191197-d738d2eb-667b-433b-8e3f-3593e9fc3e0e.png#averageHue=%23090605&clientId=ucc4e2175-d7ff-4&from=paste&id=u2e0992c3&originHeight=82&originWidth=440&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=5398&status=done&style=none&taskId=u22c22fb6-2d93-4eae-830c-f7871cee1ea&title=)

- 查看进程
```java
ps -ef|grep redis
```
## 2.2 RedisInsight
RedisInsight提供以下功能：

- 易于使用基于浏览器的界面来搜索键、查看和编辑数据
- 唯一支持Redis集群的GUI工具
- 支持基于SSL/TLS的连接
- 运行内存分析
> 下载安装

下载地址：[RedisInsight | The Best Redis GUI](https://redis.com/redis-enterprise/redis-insight/)
参考网站：[Linux安装Redis监控工具RedisInsight_LifeIsForSharing](https://blog.csdn.net/sl1992/article/details/106065438)
我这是是Window的，下载安装包无脑安装就行了
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677808188442-5fffdccb-6b7a-4472-8f65-fb8d425036a9.png#averageHue=%23f5e7bd&clientId=udb441212-55ad-4&from=paste&height=818&id=ube3440a0&originHeight=1022&originWidth=1609&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=76178&status=done&style=none&taskId=ua99937ef-b207-4149-afa1-ea9ce30c783&title=&width=1287.2)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1677808248562-80360489-30c7-4218-a93e-77f5def576b2.png#averageHue=%2382260d&clientId=udb441212-55ad-4&from=paste&height=818&id=u34f9a173&originHeight=1022&originWidth=1609&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=60742&status=done&style=none&taskId=ue7399757-a268-41a5-825e-8e911f292fb&title=&width=1287.2)
# 三 基础知识
## 3.1 基础知识

- redis拥有16个数据库， 默认使用的是第0个
- 切换数据库：select 序号
- 查询数据库大小：sizedb
- 查看所有的数据库key: key *
- 清除当前数据库：fulshdb
- 清除所有数据库：flushall
- 默认端口号6379（粉丝效益）
- redis是单线程运行的
- 明白Redis是很快的，官方表示，Redis是基于内存操作，CPU不是Redis性能瓶颈，Redis的瓶颈是根据 机器的内存和网络带宽，既然可以使用单线程来实现，就使用单线程了！所有就使用了单线程了！
- Redis 是C 语言写的，官方提供的数据为 100000+ 的QPS，完全不比同样是使用 key-vale的 Memecache差！

Redis 为什么单线程还这么快？

1. 误区1：高性能的服务器一定是多线程的？
2. 误区2：多线程（CPU上下文会切换！）一定比单线程效率高！
3. 核心：redis 是将所有的数据全部放在内存中的，所以说使用单线程去操作效率就是最高的，多线程 （CPU上下文会切换：耗时的操作！！！），对于内存系统来说，如果没有上下文切换效率就是最高 的！多次读写都是在一个CPU上的，在内存情况下，这个就是最佳的方案！
## 3.2 key基本命令
参考命令：[Redis 键(Keys)](https://redis.com.cn/redis-keys.html)

| 命令 | 描述 |
| --- | --- |
| [DEL](https://redis.com.cn/commands/del.html) | 用于删除 key |
| [DUMP](https://redis.com.cn/commands/dump.html) | 序列化给定 key ，并返回被序列化的值 |
| [EXISTS](https://redis.com.cn/commands/exists.html) | 检查给定 key 是否存在 |
| [EXPIRE](https://redis.com.cn/commands/expire.html) | 为给定 key 设置过期时间 |
| [EXPIREAT](https://redis.com.cn/commands/expireat.html) | 用于为 key 设置过期时间，接受的时间参数是 UNIX 时间戳 |
| [PEXPIRE](https://redis.com.cn/commands/pexpire.html) | 设置 key 的过期时间，以毫秒计 |
| [PEXPIREAT](https://redis.com.cn/commands/pexpireat.html) | 设置 key 过期时间的时间戳(unix timestamp)，以毫秒计 |
| [KEYS](https://redis.com.cn/commands/keys.html) | 查找所有符合给定模式的 key |
| [MOVE](https://redis.com.cn/commands/move.html) | 将当前数据库的 key 移动到给定的数据库中 |
| [PERSIST](https://redis.com.cn/commands/persist.html) | 移除 key 的过期时间，key 将持久保持 |
| [PTTL](https://redis.com.cn/commands/pttl.html) | 以毫秒为单位返回 key 的剩余的过期时间 |
| [TTL](https://redis.com.cn/commands/ttl.html) | 以秒为单位，返回给定 key 的剩余生存时间( |
| [RANDOMKEY](https://redis.com.cn/commands/randomkey.html) | 从当前数据库中随机返回一个 key |
| [RENAME](https://redis.com.cn/commands/rename.html) | 修改 key 的名称 |
| [RENAMENX](https://redis.com.cn/commands/renamenx.html) | 仅当 newkey 不存在时，将 key 改名为 newkey |
| [TYPE](https://redis.com.cn/commands/type.html) | 返回 key 所储存的值的类型 |
| [UNLINK ](https://redis.com.cn/commands/unlink.html) | 该命令会执行命令之外的线程中执行实际的内存回收，因此它不是阻塞，而 [DEL](https://redis.com.cn/commands/del.html) 是阻塞的。 |
| [ WAIT ](https://redis.com.cn/commands/wait.html) | Redis [WAIT](https://redis.com.cn/commands/wait.html) 命令用来阻塞当前客户端，直到所有先前的写入命令成功传输并且至少由指定数量的从节点复制完成。 |

具体使用参考官方文档
> 💯💯总结

- keys *：查看当前库所有key
- exists key：判断某个key是否存在
- type key ：查看你的key是什么类型
- del key：删除指定的key数据
- unlink key：根据value选择非阻塞删除，仅将keys从keyspace元数据中删除，真正的删除会在后续异步操作。
- expire key 10 ：10秒钟：为给定的key设置过期时间
- ttl key ：查看还有多少秒过期，-1表示永不过期，-2表示已过期
- select：命令切换数据库
- dbsize：查看当前数据库的key的数量
- flushdb：清空当前库
- flushall：通杀全部库

