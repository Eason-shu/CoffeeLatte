---
title: Redis7 （二） 基本数据类型之String
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
参考命令：[Redis 中 String（字符串）类型的命令](https://redis.com.cn/string.html)
参考书籍：[Redis设计与实现-黄健宏-微信读书](https://weread.qq.com/web/reader/d35323e0597db0d35bd957bkc20321001cc20ad4d76f5ae)
我们都知道 Redis 提供了丰富的数据类型，常见的有五种：**String（字符串），Hash（哈希），List（列表），Set（集合）、Zset（有序集合）**。
# 一 基本认识
## 1.1 概述

- String的数据结构为简单动态字符串(Simple Dynamic String,缩写SDS)。是可以修改的字符串，内部结构实现上类似于Java的ArrayList，采用预分配冗余空间的方式来减少内存的频繁分配
- 内部为当前字符串实际分配的空间capacity一般要高于实际字符串长度len。当字符串长度小于1M时，扩容都是加倍现有的空间，如果超过1M，扩容时一次只会多扩1M的空间。需要注意的是字符串最大长度为512M
- **String** 是最基本的 key-value 结构，key 是唯一标识，value 是具体的值，value其实不仅是字符串， 也可以是数字（整数或浮点数），value 最多可以容纳的数据长度是 _512M_
1. String 是 Redis 最基本的类型，一个key对应一个value
2. String类型是二进制安全的。意思是 redis 的String可以包含任何数据。比如jpg图片或者序列化对象
3. 二进制安全是指，如果在传输数据时，保证二进制数据的信息安全，也就是不被篡改、破译，如果被攻击，能够及时检测出来

**          二进制安全特点：**

   1. 编码、解码发生在客户端，执行效率高；
   2. 不需要频繁的编解码，不会出现乱码；
## 1.2 常用指令
**SET和GET命令**
:::info
选项
:::
从2.6.12版本开始，redis为SET命令增加了一系列选项:

- EX _seconds_ – 设置键key的过期时间，单位时秒
- PX _milliseconds_ – 设置键key的过期时间，单位时毫秒
- NX – 只有键key不存在的时候才会设置key的值
- XX – 只有键key存在的时候才会设置key的值
- KEEPTTL -- 获取 key 的过期时间
- [GET](https://redis.com.cn/commands/get.html) -- 返回 key 存储的值，如果 key 不存在返回空
:::info
返回值
:::
[字符串](https://redis.com.cn/topics/protocol.html#simple-string-reply): 如果SET命令正常执行那么回返回OK [多行字符串](https://redis.com.cn/topics/protocol.html#bulk-string-reply): 使用 GET 选项，返回 key 存储的值，如果 key 不存在返回空 [空](https://redis.com.cn/topics/protocol.html#nil-reply): 否则如果加了NX 或者 XX选项，[SET](https://redis.com.cn/commands/set.html) 没执行，那么会返回nil。
:::success
案例
:::
```shell
# 设置 key-value 类型的值
127.0.0.1:6379> set user admin
OK
# 获取一个key
127.0.0.1:6379> get user
"admin"
# 对已存在的值进行设置
127.0.0.1:6379> set user xiaomi
OK
# 会覆盖原来的值
127.0.0.1:6379> get user
"xiaomi"
# 设置一个过期的值 ex: 后面为秒
127.0.0.1:6379> set user aadmin ex 30
OK
# 查看过期时间
127.0.0.1:6379> ttl user
(integer) 25
# 是否存在key
127.0.0.1:6379> EXISTS user
(integer) 0
# 设置一个过期时间 px: 后面为毫秒
127.0.0.1:6379> set user admin px 10000
OK
127.0.0.1:6379> ttl user
(integer) 6
# 设置一个值，当 只有键key不存在的时候才会设置key的值
127.0.0.1:6379> setnx user admin
(integer) 1
127.0.0.1:6379> setnx user xiaomi
(integer) 0
127.0.0.1:6379> get user
"admin"
# 当只有键key存在的时候才会设置key的值
127.0.0.1:6379> set user xioami xx
OK
127.0.0.1:6379> get user
"xioami"
127.0.0.1:6379>
```
:::warning
**Note:** 下面这种设计模式并不推荐用来实现redis分布式锁。
:::
**批量设置**
:::info
Redis [MSET](https://redis.com.cn/commands/mset.html) 命令设置多个 key 的值为各自对应的 value
:::
```shell
# 批量设置对个值 key-value
127.0.0.1:6379> mset user admin age 10 sex 1
OK
# 查看使用key
127.0.0.1:6379> keys *
1) "user"
2) "age"
3) "sex"
# 批量获取key
127.0.0.1:6379> mget age sex
1) "10"
2) "1"
127.0.0.1:6379>
```
**计数器**
:::info

- Redis [INCR](https://redis.com.cn/commands/incr.html) 命令将 key 中储存的数字值增一
- Redis [INCRBY](https://redis.com.cn/commands/incrby.html) 命令将 key 中储存的数字加上指定的增量值
- DECR为键 key 储存的数字值减去一
- DECRBY 将键 key 储存的整数值减去减量 decrement
:::
```shell
# 增加
127.0.0.1:6379> incr age
(integer) 11
# 增量增加
127.0.0.1:6379> incrby age 2
(integer) 13
# 减少
127.0.0.1:6379> decr age
(integer) 12
# 增量减少
127.0.0.1:6379> decrby age 3
(integer) 9
127.0.0.1:6379>
```
**过期时间**
:::info

- [SETEX](https://redis.com.cn/commands/setex.html) 命令将键 key 的值设置为 value ， 并将键 key 的生存时间设置为 seconds 秒钟
:::
```shell
# 设置 key 在 30 秒后过期（该方法是针对已经存在的key设置过期时间）
# expire key seconds [NX|XX|GT|LT]
127.0.0.1:6379> EXPIRE name 30
(integer) 1

# 查看数据还有多久过期
127.0.0.1:6379> TTL name
(integer) 20
# 设置 key-value 类型的值，并设置该 key 的过期时间为 20 秒
# set key value [NX|XX] [GET] [EX seconds|PX milliseconds|EXAT uni
127.0.0.1:6379> SET name sid10t EX 20
OK
# setex key seconds value
127.0.0.1:6379> SETEX name 20 sid10t
OK
```
**字符串常用方法**
:::info

- Strlen 命令用于获取指定 key 所储存的字符串值的长度
- Redis [APPEND](https://redis.com.cn/commands/append.html) 命令用于为指定的 key 追加值
- [GETRANGE](https://redis.com.cn/commands/getrange.html) 命令返回存储在 key 中的字符串的子串，由 start 和 end 偏移决定(都包括在内)。
:::
```shell
# 获取字符串的长度
127.0.0.1:6379> strlen age
(integer) 1
# 末尾追加值
127.0.0.1:6379> append user xioami
(integer) 11
127.0.0.1:6379> get user
"adminxioami"
# 范围截取
127.0.0.1:6379> getrange user 6 -1
"ioami"
127.0.0.1:6379>
```
## 1.3 基本数据结构
### 1.3.1 SDS的定义
每个sds.h/sdshdr结构表示一个SDS值
```c
struct sdshdr {
    //记录buf数组中已使用字节的数量
    //等于SDS所保存字符串的长度
    int len;
    //记录buf数组中未使用字节的数量
    int free;
    //字节数组，用于保存字符串
    char buf[];
};
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693227465106-72792bc5-8bb5-424e-b0a3-b2e235732234.png#averageHue=%23fcfcfc&clientId=u8105d2d8-8d6b-4&from=paste&height=515&id=u78bb2940&originHeight=644&originWidth=1050&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=119700&status=done&style=none&taskId=u4fb1b24b-a911-4525-afd0-5d1de585db1&title=&width=840)
SDS 和我们认识的 C 字符串不太一样，之所以没有使用 C 语言的字符串表示，因为 SDS 相比于 C 的原生字符串：

- **SDS 获取字符串长度的时间复杂度是 O(1)** 。因为 C 语言的字符串并不记录自身长度，所以获取长度的复杂度为 O(n)；而 SDS 结构里用 len 属性记录了字符串长度，所以复杂度为 O(1)。

**C**
因为C字符串并不记录自身的长度信息，所以为了获取一个C字符串的长度，程序必须遍历整个字符串，对遇到的每个字符进行计数，直到遇到代表字符串结尾的空字符为止，这个操作的复杂度为O（N）。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693227929368-a99ae86f-2766-401d-8db5-e3dd08b690c5.png#averageHue=%23e9e9e9&clientId=u8105d2d8-8d6b-4&from=paste&height=648&id=u443841da&originHeight=810&originWidth=654&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=164035&status=done&style=none&taskId=ue4c86b88-54c6-44ad-9848-524faf38579&title=&width=523.2)
**SDS **
计算C字符串长度的过程和C字符串不同，因为SDS在len属性中记录了SDS本身的长度，所以获取一个SDS长度的复杂度仅为O（1）。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693227964394-aaf03300-ab19-41b1-bb26-217f1a921920.png#averageHue=%23f2f2f2&clientId=u8105d2d8-8d6b-4&from=paste&height=254&id=u502039bb&originHeight=318&originWidth=886&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=49858&status=done&style=none&taskId=ue0ae3f87-3d18-4261-88ce-cc872d53c79&title=&width=708.8)

- **杜绝缓冲区溢出:   **除了获取字符串长度的复杂度高之外，C字符串不记录自身长度带来的另一个问题是容易造成缓冲区溢出（buffer overflow）

**C**
因为C字符串不记录自身的长度，所以strcat假定用户在执行这个函数时，已经为dest分配了足够多的内存，可以容纳src字符串中的所有内容，而一旦这个假定不成立时，就会产生缓冲区溢出。
举个例子，假设程序里有两个在内存中紧邻着的C字符串s1和s2，其中s1保存了字符串"Redis"，而s2则保存了字符串`MongoDB`
如果一个程序员决定通过执行：将s1的内容修改为"Redis Cluster"，但粗心的他却忘了在执行strcat之前为s1分配足够的空间，那么在strcat函数执行之后，s1的数据将溢出到s2所在的空间中，导致s2保存的内容被意外地修改
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693228172460-78d127a1-31ef-4355-8900-fab1178fd8e3.png#averageHue=%23d9d9d9&clientId=u8105d2d8-8d6b-4&from=paste&height=70&id=u14222523&originHeight=88&originWidth=1133&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=29041&status=done&style=none&taskId=udf79ae00-ab45-48db-9cce-d7bfed40612&title=&width=906.4)
**SDS**
SDS的API里面也有一个用于执行拼接操作的sdscat函数，它可以将一个C字符串拼接到给定SDS所保存的字符串的后面，但是在执行拼接操作之前，sdscat会先检查给定SDS的空间是否足够，如果不够的话，sdscat就会先扩展SDS的空间，然后才执行拼接操作。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693228318706-3628e582-99cb-4413-8554-4ae2489fcbe6.png#averageHue=%23f9f9f9&clientId=u8105d2d8-8d6b-4&from=paste&height=413&id=u1bcfe29f&originHeight=516&originWidth=879&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=68640&status=done&style=none&taskId=u8a9efd04-32f2-449b-9c36-a7533c3b6b4&title=&width=703.2)

- **二进制安全：**C字符串中的字符必须符合某种编码（比如ASCII），并且除了字符串的末尾之外，字符串里面不能包含空字符，否则最先被程序读入的空字符将被误认为是字符串结尾，这些限制使得C字符串只能保存文本数据，而不能保存像图片、音频、视频、压缩文件这样的二进制数据，通过使用二进制安全的SDS，而不是C字符串，使得Redis不仅可以保存文本数据，还可以保存任意格式的二进制数据。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693228537689-8a9a3c14-f479-4712-b8ac-306eac4c4878.png#averageHue=%23e1e1e1&clientId=u8105d2d8-8d6b-4&from=paste&height=279&id=u701a4764&originHeight=349&originWidth=1483&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=254920&status=done&style=none&taskId=u373f6c72-7b42-4f35-9e12-4f7425c11f9&title=&width=1186.4)
### 1.3.2 SDS API
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693228582705-be47c246-d796-426b-9705-21ed045f8a49.png#averageHue=%23ebebeb&clientId=u8105d2d8-8d6b-4&from=paste&height=641&id=u75f3a585&originHeight=801&originWidth=1029&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=520488&status=done&style=none&taskId=u71a5ee58-2b3a-44ed-9589-e4ee2a26b7b&title=&width=823.2)
### 1.3.3 字符串对象
:::info
字符串对象的编码可以是int、raw或者embstr。
:::

- 如果一个字符串对象保存的是整数值，并且这个整数值可以用long类型来表示，那么字符串对象会将整数值保存在字符串对象结构的ptr属性里面（将void*转换成long），并将字符串对象的编码设置为int。
- 如果字符串对象保存的是一个字符串值，并且这个字符串值的长度大于32字节，那么字符串对象将使用一个简单动态字符串（SDS）来保存这个字符串值，并将对象的编码设置为raw。
- 如果字符串对象保存的是一个字符串值，并且这个字符串值的长度小于等于32字节，那么字符串对象将使用embstr编码的方式来保存这个字符串值。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693228764775-c45db63f-adca-4e93-a3bb-85200ebe49f6.png#averageHue=%23e9e9e9&clientId=u8105d2d8-8d6b-4&from=paste&height=645&id=u2b5d4340&originHeight=806&originWidth=840&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=573332&status=done&style=none&taskId=ub71dd0c5-4b0d-4bfc-a06d-25b32c54495&title=&width=672)
**详细内容参考书籍**
## 1.4 应用场景
### 1.4.1 计数器
因为 Redis 处理命令是单线程，所以执行命令的过程是原子的。因此 **String** 数据类型适合计数场景，比如计算访问次数、点赞、转发、库存数量等等。
```c
# 初始化文章的阅读量
127.0.0.1:6379[3]> SET page:10086 0
OK

#阅读量 +1
127.0.0.1:6379[3]> INCR page:10086
(integer) 1

#阅读量 +1
127.0.0.1:6379[3]> INCR page:10086
(integer) 2

# 获取对应文章的阅读量
127.0.0.1:6379[3]> GET page:10086
"2"

```
### 1.4.2 分布式锁
SET 命令有个 NX 参数可以实现「key 不存在才插入」，可以用它来实现分布式锁：

- 如果 key 不存在，则显示插入成功，可以用来表示加锁成功；
- 如果 key 存在，则会显示插入失败，可以用来表示加锁失败。

一般而言，还会对分布式锁加上过期时间，分布式锁的命令如下：
```shell
127.0.0.1:6379[3]> SET lock 10001 NX PX 10000
OK
```
### 1.4.3 缓存对象
一些业务场景下我们需要缓存一些信息：比如：用户的登录状态，验证码过期时间等等

