---
title: Redis7 （三） 基本数据类型之Hash
sidebar_position: 3
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

- 参考视频教程：[Redis零基础到进阶，最强redis7教程](https://www.bilibili.com/video/BV13R4y1v7sP/)
- 官网：[Redis](https://redis.io/)
- 参考命令：[redis 命令手册](https://redis.com.cn/commands.html#hash-%E5%91%BD%E4%BB%A4)
- 参考书籍：[Redis设计与实现-黄健宏-微信读书](https://weread.qq.com/web/reader/d35323e0597db0d35bd957bkc20321001cc20ad4d76f5ae)

我们都知道 Redis 提供了丰富的数据类型，常见的有五种：**String（字符串），Hash（哈希），List（列表），Set（集合）、Zset（有序集合）**。
# 一 基本认识
## 1.1 基本概述
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693386940938-c0ce779f-925f-40d6-857d-ef9975e0dc66.png#averageHue=%23aef864&clientId=u2bb4b512-eb21-4&from=paste&id=u703a34f6&originHeight=470&originWidth=595&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u005bb946-577e-46d1-9ab4-84f69b6a433&title=)

- Hash：是一个键值对（key-value）集合
- Redis hash 是一个 string 类型的 field（字段） 和 value（值） 的映射表，hash 特别适合用于存储对象，Redis 中每个 hash 可以存储 232 - 1 键值对（40多亿）
## 1.2 常用命令
Hash（哈希散列）是 Redis 基本数据类型，值value 中存储的是 hash 表。Hash 特别适合用于存储对象。常用的命令：

| 命令 | 说明 |
| --- | --- |
| [HDEL](https://redis.com.cn/commands/hdel.html) | 用于删除哈希表中一个或多个字段 |
| [HEXISTS](https://redis.com.cn/commands/hexists.html) | 用于判断哈希表中字段是否存在 |
| [HGET](https://redis.com.cn/commands/hget.html) | 获取存储在哈希表中指定字段的值 |
| [HGETALL](https://redis.com.cn/commands/hgetall.html) | 获取在哈希表中指定 key 的所有字段和值 |
| [HINCRBY](https://redis.com.cn/commands/hincrby.html) | 为存储在 key 中的哈希表指定字段做整数增量运算 |
| [HKEYS](https://redis.com.cn/commands/hkeys.html) | 获取存储在 key 中的哈希表的所有字段 |
| [HLEN](https://redis.com.cn/commands/hlen.html) | 获取存储在 key 中的哈希表的字段数量 |
| [HSET](https://redis.com.cn/commands/hset.html) | 用于设置存储在 key 中的哈希表字段的值 |
| [HVALS](https://redis.com.cn/commands/hvals.html) | 用于获取哈希表中的所有值 |

:::info

- Redis Hset 命令用于为存储在 key 中的哈希表的 field 字段赋值 value 。
- 如果哈希表不存在，一个新的哈希表被创建并进行 HSET 操作。
- 如果字段（field）已经存在于哈希表中，旧值将被覆盖。
- 从 Redis 4.0 起，HSET 可以一次设置一个或多个 field/value 对。
:::
```shell
# HSET KEY_NAME FIELD VALUE ：将哈希表 key 中的字段 field 的值设为 value 。
> hset person username xioami
(integer) 1
#  HGET KEY_NAME FIELD_NAME :获取存储在哈希表中指定字段的值。
> hget person username
"xioami"
> hset person age 10
(integer) 1
> hget person age
"10"
# 获取在哈希表中指定 key 的所有字段和值
> hgetall person
1) "username"
2) "xioami"
3) "age"
4) "10"
>


```
:::info
批量使用
:::
```shell
# 批量设置
> hmset student name xiaoxue age 10 school xiaomi
"OK"
# 批量获取
> hmget student name age
1) "xiaoxue"
2) "10"
# 批量删除
> hdel student name
(integer) 1
> hmget student name
1) "null"
```
:::info
基本方法
:::
```shell
# 获取数量
> hlen person
(integer) 2
#  为哈希表 key 中 field 键的值加上增量 increment
> HINCRBY student age 10
(integer) 20
> hget student age
"20"
# 是否存在
> HEXISTS student age
(integer) 1
# 所有的key
> hkeys student
1) "age"
2) "school"
# 所有的value
> HVALS student
1) "20"
2) "xiaomi"
```
## 1.3 基本数据结构
Hash 类型的底层数据结构是由**压缩列表或哈希表**实现，但是**在最新 Redis 版本中，压缩列表数据结构已经废弃了，交由 listpack 数据结构来实现了**。
### 1.3.1 压缩列表

- 压缩列表（ziplist）是列表键和哈希键的底层实现之一
- 当一个列表键只包含少量列表项，并且每个列表项要么就是小整数值，要么就是长度比较短的字符串，那么Redis就会使用压缩列表来做列表键的底层实现。
- 当一个哈希键只包含少量键值对，比且每个键值对的键和值要么就是小整数值，要么就是长度比较短的字符串，那么Redis就会使用压缩列表来做哈希键的底层实现。
:::info
构成
:::

- 压缩列表是Redis为了节约内存而开发的，是由一系列特殊编码的连续内存块组成的顺序型（sequential）数据结构。
- 一个压缩列表可以包含任意多个节点（entry），每个节点可以保存一个字节数组或者一个整数值。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693385878947-34f3ec98-168a-4fce-8bd9-1d1821dc3dcf.png#averageHue=%23b3b3b3&clientId=u39b62bbb-deb8-4&from=paste&height=70&id=u6b607325&originHeight=87&originWidth=1220&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=34273&status=done&style=none&taskId=ue58c4efb-10a2-4e1b-8a76-a542b260ea7&title=&width=976)
:::warning
解释
:::
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693385944709-e80dacf7-58f0-4750-af58-3996f463bf06.png#averageHue=%23e7e7e7&clientId=u39b62bbb-deb8-4&from=paste&height=370&id=u0d11e5af&originHeight=462&originWidth=1376&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=390592&status=done&style=none&taskId=u474fbef6-7b05-4c78-a715-f851ffdceb0&title=&width=1100.8)

- 列表zlbytes属性的值为0x50（十进制80），表示压缩列表的总长为80字节
- 列表zltail属性的值为0x3c（十进制60），这表示如果我们有一个指向压缩列表起始地址的指针p，那么只要用指针p加上偏移量60，就可以计算出表尾节点entry3的地址
- 列表zllen属性的值为0x3（十进制3），表示压缩列表包含三个节点
- 列表zlbytes属性的值为0xd2（十进制210），表示压缩列表的总长为210字节
- 列表zltail属性的值为0xb3（十进制179），这表示如果我们有一个指向压缩列表起始地址的指针p，那么只要用指针p加上偏移量179，就可以计算出表尾节点entry5的地址
- 列表zllen属性的值为0x5（十进制5），表示压缩列表包含五个节点
### 1.3.2 哈希表
**代码**
```c
typedef struct dictht {
    //哈希表数组
    dictEntry **table;
    //哈希表大小
    unsigned long size;
    //哈希表大小掩码，用于计算索引值
    //总是等于size-1
    unsigned long sizemask;
    //该哈希表已有节点的数量
    unsigned long used;
} dictht;
```

- table属性是一个数组，数组中的每个元素都是一个指向dict.h/dictEntry结构的指针，每个dictEntry结构保存着一个键值对
- size属性记录了哈希表的大小，也即是table数组的大小
- used属性则记录了哈希表目前已有节点（键值对）的数量。
- sizemask属性的值总是等于size-1，这个属性和哈希值一起决定一个键应该被放到table数组的哪个索引上面

哈希表节点使用dictEntry结构表示，每个dictEntry结构都保存着一个键值对
:::info
哈希表节点
:::
```c
typedef struct dictEntry {
    //键
    void *key;
    //值
    union{
        void *val;
        uint64_tu64;
        int64_ts64;
    } v;
    //指向下个哈希表节点，形成链表
    struct dictEntry *next;
} dictEntry;
```

- key属性保存着键值对中的键，而v属性则保存着键值对中的值，其中键值对的值可以是一个指针，或者是一个uint64_t整数，又或者是一个int64_t整数
- next属性是指向另一个哈希表节点的指针，这个指针可以将多个哈希值相同的键值对连接在一次，以此来解决键冲突（collision）的问题

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693386741401-ca667b1e-1b29-4774-82f1-9bbf1acb2660.png#averageHue=%23f2f2f2&clientId=u39b62bbb-deb8-4&from=paste&height=328&id=u57547a07&originHeight=410&originWidth=1440&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=126818&status=done&style=none&taskId=ue454779d-f7de-41f4-9fe8-a8999dcbf6e&title=&width=1152)
## 1.4 应用场景
参考文章：[谈谈Redis五种数据结构及真实应用场景 - 雨点的名字 - 博客园](https://www.cnblogs.com/qdhxhz/p/15669348.html)
Redisson分布式锁
Redisson在实现分布式锁的时候，内部的用的数据就是hash而不是String。因为Redisson为了实现可重入加锁机制。所以在hash中存入了当前线程ID。
购物车列表
以_用户id为key_，_商品id为field_，_商品数量为value_，恰好构成了购物车的3个要素，如下图所示。
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1693386840789-cfa6b055-1729-463d-940c-b6a599dd98e8.png#averageHue=%23efeeee&clientId=u2bb4b512-eb21-4&from=paste&id=ufefed200&originHeight=1266&originWidth=1122&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u74bda6e4-7be1-4626-8304-2936af65d35&title=)
这里涉及的命令如下
```shell
hset cart:{用户id} {商品id} 1  # 添加商品

hincrby cart:{用户id} {商品id} 1 # 增加数量

hlen cart:{用户id} # 获取商品总数

hdel cart:{用户id} {商品id} # 删除商品

hgetall cart:{用户id} #获取购物车所有商品
```
说明:当前仅仅是将商品ID存储到了Redis中,在回显商品具体信息的时候,还需要拿着商品id查询一次数据库。
 缓存对象
hash类型的 _(key, field, value)_ 的结构与对象的(对象id, 属性, 值)的结构相似，也可以用来存储对象。
在介绍String类型的应用场景时有所介绍，String + json也是存储对象的一种方式，那么存储对象时，到底用String + json还是用hash呢？
两种存储方式的对比如下表所示。

|
 | **string + json** | **hash** |
| --- | --- | --- |
| 效率 | 很高 | 高 |
| 容量 | 低 | 低 |
| 灵活性 | **低** | 高 |
| 序列化 | 简单 | **复杂** |

一般对象用string + json存储，对象中某些频繁变化的属性可以考虑抽出来用hash存储。
