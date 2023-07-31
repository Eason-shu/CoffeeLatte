---
title: Kotlin基础知识
sidebar_position: 2
keywords:
  - Android
  - Kotlin
tags:
  - Android
  - Kotlin
  - 学习笔记
  - Java
last_update:
  date: 2023-07-31
  author: EasonShu
---

# 一 Kotlin 基本认识

- 官网：https://kotlinlang.org/
- 中文官网：https://www.kotlincn.net/

## 1.1 概述

![img](https://www.runoob.com/wp-content/uploads/2017/05/kotlin_250x250.png)

`Kotlin `是一种在 Java 虚拟机上运行的静态类型编程语言，被称之为` Android` 世界的`Swift`，由 `JetBrains` 设计开发并开源。
`Kotlin` 可以编译成`Java`字节码，也可以编译成 `JavaScript`，方便在没有 JVM 的设备上运行。
在`Google I/O 2017`中，`Google `宣布`Kotlin`成为 `Android `官方开发语言。

## 1.2 优势

- 与 Java 完全兼容，可以与 Java 代码无缝互通
- 代码更简洁，更容易阅读
- 减少了很多样板代码
- 支持扩展函数
- 支持 Lambda 表达式
- 支持空安全
- 支持函数式编程
- 支持集合过滤操作
- 支持属性代理
- 支持字符串模板
- 支持协程
- 支持类型推断
- 支持高阶函数
- 支持数据类
- 支持密封类
- 支持代数数据类型

## 1.3 跨平台

- Kotlin/Native：可以编译成本地代码，可以在嵌入式设备上运行，也可以编译成 iOS 和 MacOS 上的应用程序。
- Kotlin/JS：可以编译成 JavaScript 代码，可以在浏览器中运行，也可以编译成 Node.js 应用程序。
- Kotlin/JVM：可以编译成 Java 字节码，可以在 Java 虚拟机上运行，也可以编译成 Android 应用程序。

## 1.4 安装

- 下载地址：https://kotlinlang.org/docs/command-line.html#install-the-compiler

![image-20230731150112389](image\image-20230731150112389.png)

- 配置环境变量

![image-20230731150020198](image\image-20230731150020198.png)

- 验证（`kotlinc -version`）

![image-20230731150210506](image\image-20230731150210506.png)

## 1.5 Idea 选择 Kotlinc 项目

![image-20230731150540484](image\image-20230731150540484.png)

## 1.6 为啥要学习 Kotlin

参考视频：https://www.bilibili.com/video/BV1SY411y7T8/?spm_id_from=333.337.search-card.all.click

- 进阶安卓开发
- 了解新技术，提升自己
- 看看 Kotlin 的优势，是否可以用在自己的项目中，与 Java 相比，是否有优势
# 二 基本语法
## 2.1 Hello World

```kotlin
/**
 * @description: 程序入口
 * @author: shu
 * @createDate: 2023/7/31 13:08
 * @version: 1.0
 */
// 总结：
// 1. main函数的参数是一个字符串数组
// 2. main函数的返回值是Unit类型，相当于Java中的void
// 3. main函数的参数可以通过命令行传递
// 4. main函数可以省略不写

fun main(args: Array<String>) {
    println(args.contentToString())
}

//fun main() {
//    println("Hello World!")
//}
```

![image-20230731151411494](image\image-20230731151411494.png)
对比，Java 的 Hello World 代码如下：

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}
```
我们可以看到，Kotlin 的代码比 Java 的代码简洁很多，而且 Kotlin 的代码更加符合人类的思维，更加容易阅读，下面我们来看看 Kotlin 的基本语法。

## 2.2 基本类型

![image-20230731153057054](image\image-20230731153057054.png)

### 2.2.1 字符串

- Kotlin 中字符串用 `String` 类型表示。 通常，字符串值是双引号（`"`）中的字符序列

  ```kotlin
  val str = "abcd 123"
  ```

- 字符串是不可变的。 一旦初始化了一个字符串，就不能改变它的值或者给它赋新值。 所有转换字符串的操作都以一个新的 `String` 对象来返回结果，而保持原始字符串不变
- 字符串可以包含模板表达式 ，即一些小段代码，会求值并把结果合并到字符串中。 模板表达式以美元符（`$`）开头，由一个简单的名字构成

  ```kotlin
  val i = 10
  val s = "i = $i" // 求值结果为 "i = 10"
  ```
- 或者用花括号括起来的任意表达式

  ```kotlin
  val s = "abc"
  val str = "$s.length is ${s.length}" // 求值结果为 "abc.length is 3"
  ```
- 原始字符串使用三个引号（`"""`）分界符括起来，内部没有转义并且可以包含换行以及任何其他字符

  ```kotlin
  val text = """
  for (c in "foo")
      print(c)
  """
  ```
- 字符串字面值可以包含以下特殊字符：

    - 转义字符：`\t`、`\b`、`\n`、`\r`、`\'`、`\"`、`\\` 以及 `\$`
    - 字符字面值：任何其他字符都可以按照字面值来使用，例如：`fun main() { val s = "abc"; println("$s.length is ${s.length}") }`
    - 字符串模板：字符串可以包含模板表达式 ，即一些小段代码，会求值并把结果合并到字符串中。 模板表达式以美元符（`$`）开头，由一个简单的名字构成，或者用花括号括起来的任意表达式，例如：`fun main() { val i = 10; val s = "i = $i"; println(s) }`

 - 字符串基本方法，例如：字符串的长度，取反，截取，去掉空格，等等方法

```kotlin
/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/31 15:32
 * @version: 1.0
 */
class StringTest {

    var name:String="Hello World 哈哈红红火火恍恍惚惚!"

    fun printInfo(){
        println(name)
    }
    // 基本方法
    fun baseMethod(){
        // 长度
        println("字符串长度：${name.length}")
        // 判断是否为空
        println("字符串是否为空：${name.isEmpty()}")
        // 判断是否为空白
        println("字符串是否为空白：${name.isBlank()}")
        // 判断不为空
        println("字符串是否不为空：${name.isNotEmpty()}")
        // 判断不为空白
        println("字符串是否不为空白：${name.isNotBlank()}")
        // 判断是否包含某个字符
        println("字符串是否包含：${name.contains("Hello")}")
        // 判断是否包含,忽略大小写
        println("字符串是否包含：${name.contains("Hello",true)}")
        // 判断是否以指定字符串开头
        println("字符串是否以Hello开头：${name.startsWith("Hello")}")
        // 判断是否以指定字符串开头,忽略大小写
        println("字符串是否以Hello开头：${name.startsWith("Hello",true)}")
        // 判断是否以指定字符串结尾
        println("字符串是否以World!结尾：${name.endsWith("World!")}")
        // 判断是否以指定字符串结尾,忽略大小写
        println("字符串是否以World!结尾：${name.endsWith("World!",true)}")
        // 截取
        println("截取字符串：${name.substring(0,5)}")
        println("截取字符串：${name.substring(0 until 5)}")
        // 反转
        println("反转字符串：${name.reversed()}")
        // 替换
        println("替换字符串：${name.replace("Hello","你好")}")
        // 分割
        println("分割字符串：${name.split(" ")}")
        // 去除空格
        println("去除空格：${name.trim()}")
        println("去除左侧空格：${name.trimStart()}")
        println("去除右侧空格：${name.trimEnd()}")
        // 去除指定字符
        println("去除指定字符：${name.trim('H','!')}")
        println("去除左侧指定字符：${name.trimStart('H','!')}")
        println("去除右侧指定字符：${name.trimEnd('H','!')}")

    }
}

fun main() {
    val stringTest = StringTest()
    stringTest.printInfo()
    stringTest.baseMethod()
}
```

![image-20230731154427887](image\image-20230731154427887.png)

### 2.2.2 数字

Kotlin 提供了一组表示数字的内置类型。 对于整数，有四种不同大小的类型，因此值的范围也不同：

| 类型    | 大小（比特数） | 最小值                            | 最大值                              |
| ------- | -------------- | --------------------------------- | ----------------------------------- |
| `Byte`  | 8              | -128                              | 127                                 |
| `Short` | 16             | -32768                            | 32767                               |
| `Int`   | 32             | -2,147,483,648 (-231)             | 2,147,483,647 (231 - 1)             |
| `Long`  | 64             | -9,223,372,036,854,775,808 (-263) | 9,223,372,036,854,775,807 (263 - 1) |

当初始化一个没有显式指定类型的变量时，编译器会自动推断为足以表示该值的最小类型。 如果不超过 `Int` 的表示范围，那么类型是 `Int`。 如果超过了， 那么类型是 `Long`。 如需显式指定 `Long` 值，请给该值追加后缀 `L`。 显式指定类型会触发编译器检测该值是否超出指定类型的表示范围。

对于实数，Kotlin 提供了浮点类型 `Float` 与 `Double` 类型，遵循 [IEEE 754 标准](https://zh.wikipedia.org/wiki/IEEE_754)。 `Float` 表达 IEEE 754 *单精度*，而 `Double` 表达*双精度*。

这两个类型的大小不同，并为两种不同精度的浮点数提供存储：

| 类型     | 大小（比特数） | 有效数字比特数 | 指数比特数 | 十进制位数 |
| -------- | -------------- | -------------- | ---------- | ---------- |
| `Float`  | 32             | 24             | 8          | 6-7        |
| `Double` | 64             | 53             | 11         | 15-16      |

```kotlin
/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/31 15:47
 * @version: 1.0
 */
class NumberTest {
    // 十进制
    var a: Int = 100
    // 十六进制
    var b: Int = 0x100
    // 二进制
    var c: Int = 0b100
    // Long类型需要加L
    var d: Long = 100L
    // Float类型需要加f
    var e: Float = 100.0f
    // Double类型可以不加
    var f: Double = 100.0
    // Short类型
    var g: Short = 100
    // Byte类型
    var h: Byte = 100

}
fun main(){
    var numberTest = NumberTest()
    println(numberTest.a)
    println(numberTest.b)
    println(numberTest.c)
    println(numberTest.d)
    println(numberTest.e)
    println(numberTest.f)
    println(numberTest.g)
    println(numberTest.h)
}
```

注意：与一些其他语言不同，Kotlin 中的数字没有隐式拓宽转换。 例如，具有 `Double` 参数的函数只能对 `Double` 值调用，而不能对 `Float`、 `Int` 或者其他数字值调用

**Java中的面试题？**

```kotlin
fun main() {
//sampleStart
    val a: Int = 100
    val boxedA: Int? = a
    val anotherBoxedA: Int? = a

    val b: Int = 10000
    val boxedB: Int? = b
    val anotherBoxedB: Int? = b

    println(boxedA === anotherBoxedA) // true
    println(boxedB === anotherBoxedB) // false
//sampleEnd
}
```

由于 JVM 对 `-128` 到 `127` 的整数（`Integer`）应用了内存优化，因此，`a` 的所有可空引用实际上都是同一对象。但是没有对 `b` 应用内存优化，所以它们是不同对象。

**所有数字类型都支持转换为其他类型**

```kotlin
/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/31 15:47
 * @version: 1.0
 */
class NumberTest {
    // 十进制
    var a: Int = 100
    // 十六进制
    var b: Int = 0x100
    // 二进制
    var c: Int = 0b100
    // Long类型需要加L
    var d: Long = 100L
    // Float类型需要加f
    var e: Float = 100.0f
    // Double类型可以不加
    var f: Double = 100.0
    // Short类型
    var g: Short = 100
    // Byte类型
    var h: Byte = 100

}
fun main(){
    var numberTest = NumberTest()
//    println(numberTest.a)
//    println(numberTest.b)
//    println(numberTest.c)
//    println(numberTest.d)
//    println(numberTest.e)
//    println(numberTest.f)
//    println(numberTest.g)
//    println(numberTest.h)
    // 所有数字类型都支持转换为其他类型
    println(numberTest.a.toLong())
    println(numberTest.a.toFloat())
    println(numberTest.a.toDouble())
    println(numberTest.a.toShort())
    println(numberTest.a.toByte())

}
```

所有数字类型都支持转换为其他类型：

- `toByte(): Byte`
- `toShort(): Short`
- `toInt(): Int`
- `toLong(): Long`
- `toFloat(): Float`
- `toDouble(): Double`

**数字运算**

- Kotlin 支持数字运算的标准集，运算被定义为相应的类成员（但编译器会将函数调用优化为相应的指令）
- 对于位运算，没有特殊字符来表示，而只可用中缀方式调用具名函数，例如：`shl`（位左移）、`shr`（位右移）、`ushr`（无符号位右移）、`and`（位与）、`or`（位或）、`xor`（位异或）和 `inv`（位非）

```kotlin
/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/31 15:47
 * @version: 1.0
 */
class NumberTest {
    // 十进制
    var a: Int = 100
    // 十六进制
    var b: Int = 0x100
    // 二进制
    var c: Int = 0b100
    // Long类型需要加L
    var d: Long = 100L
    // Float类型需要加f
    var e: Float = 100.0f
    // Double类型可以不加
    var f: Double = 100.0
    // Short类型
    var g: Short = 100
    // Byte类型
    var h: Byte = 100

}
fun main(){
    var numberTest = NumberTest()
//    println(numberTest.a)
//    println(numberTest.b)
//    println(numberTest.c)
//    println(numberTest.d)
//    println(numberTest.e)
//    println(numberTest.f)
//    println(numberTest.g)
//    println(numberTest.h)
    // 所有数字类型都支持转换为其他类型
    println(numberTest.a.toLong())
    println(numberTest.a.toFloat())
    println(numberTest.a.toDouble())
    println(numberTest.a.toShort())
    println(numberTest.a.toByte())
    // 数字运算
    println(numberTest.a + numberTest.b)
    println(numberTest.a - numberTest.b)
    println(numberTest.a * numberTest.b)
    println(numberTest.a / numberTest.b)
    println(numberTest.a % numberTest.b)
    // 位运算
    println(numberTest.a and numberTest.b)
    println(numberTest.a or numberTest.b)
    println(numberTest.a xor numberTest.b)
    println(numberTest.a shl 2)
    println(numberTest.a shr 2)
    println(numberTest.a ushr 2)
    println(numberTest.a.inv())
    // 比较运算
    println(numberTest.a > numberTest.b)
    println(numberTest.a < numberTest.b)
    println(numberTest.a >= numberTest.b)
    println(numberTest.a <= numberTest.b)
    println(numberTest.a == numberTest.b)
    println(numberTest.a != numberTest.b)
    // 逻辑运算
    println(numberTest.a > numberTest.b && numberTest.a < numberTest.b)
    println(numberTest.a > numberTest.b || numberTest.a < numberTest.b)
    println(!numberTest.a.equals(numberTest.b))
}
```

### 2.2.3 字串

字符可以以转义反斜杠 `\` 开始。 支持这几个转义序列：

- `\t`——制表符
- `\b`——退格符
- `\n`——换行（LF）
- `\r`——回车（CR）
- `\'`——单引号
- `\"`——双引号
- `\\`——反斜杠
- `\$`——美元符

```kotlin
println("Hello\tWorld!")
println("Hello\bWorld!")
println("Hello\nWorld!")
println("Hello\rWorld!")
println("Hello\'World!")
println("Hello\"World!")
println("Hello\\World!")
println("Hello\$World!")
```
### 2.2.4 布尔

布尔用 `Boolean` 类型表示，它有两个值：`true` 和 `false`。
布尔值的内置运算有：
||——析取（逻辑或）
&&——合取（逻辑与）
!——否定（逻辑非）
|| 与 && 都是惰性（短路）的。

```kotlin
val b = true
val c = false
println(b || c)
println(b && c)
println(!b)
```
### 2.2.5 数组

数组在 Kotlin 中使用 `Array` 类来表示，它定义了 `get` 和 `set` 函数（按照运算符重载约定这会转变为 `[]`）以及 `size` 属性，以及一些其他有用的成员函数：

```kotlin
/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/31 16:10
 * @version: 1.0
 */
class ArrayTest {

    // 数组的创建
    var arr1 = arrayOf(1, 2, 3, 4, 5)
    var arr2 = arrayOfNulls<Int>(5)
    var arr3 = Array(5) { i -> (i * 2) }
    // 数组的遍历
    fun printArray() {
        for (i in arr1) {
            println(i)
        }
        for (i in arr2) {
            println(i)
        }
        for (i in arr3) {
            println(i)
        }
    }
    // 原生类型数组
    var intArr = intArrayOf(1, 2, 3, 4, 5)
    var charArr = charArrayOf('a', 'b', 'c')
    var longArr = longArrayOf(1, 2, 3, 4, 5)
    var doubleArr = doubleArrayOf(1.0, 2.0, 3.0, 4.0, 5.0)
    var booleanArr = booleanArrayOf(true, false, true)
    // 数组的遍历
    fun printArray2() {
        for (i in intArr) {
            println(i)
        }
        for (i in charArr) {
            println(i)
        }
        for (i in longArr) {
            println(i)
        }
        for (i in doubleArr) {
            println(i)
        }
        for (i in booleanArr) {
            println(i)
        }
    }
}

fun main() {
    var arrayTest = ArrayTest()
    arrayTest.printArray()
    arrayTest.printArray2()
}
```
- `arrayOf()` 函数用于创建一个指定元素的数组，这个函数的返回值是一个数组，数组的元素类型是根据传递的参数来决定的，如果传递的是整数，那么数组的元素类型就是 `Int`，如果传递的是字符串，那么数组的元素类型就是 `String`，以此类推。
- `arrayOfNulls()` 函数用于创建一个指定元素的数组，这个函数的返回值是一个数组，数组的元素类型是根据传递的参数来决定的，如果传递的是整数，那么数组的元素类型就是 `Int`，如果传递的是字符串，那么数组的元素类型就是 `String`，以此类推。与 `arrayOf()` 函数不同的是，`arrayOfNulls()` 函数创建的数组的元素都是 `null`。
- `Array()` 函数用于创建一个指定元素的数组，这个函数的返回值是一个数组，数组的元素类型是根据传递的参数来决定的，如果传递的是整数，那么数组的元素类型就是 `Int`，如果传递的是字符串，那么数组的元素类型就是 `String`，以此类推。与 `arrayOf()` 函数不同的是，`Array()` 函数创建的数组的元素都是 `null`。
- `intArrayOf()` 函数用于创建一个指定元素的 `Int` 数组，这个函数的返回值是一个 `Int` 数组。
- `charArrayOf()` 函数用于创建一个指定元素的 `Char` 数组，这个函数的返回值是一个 `Char` 数组。
- `longArrayOf()` 函数用于创建一个指定元素的 `Long` 数组，这个函数的返回值是一个 `Long` 数组。
- `doubleArrayOf()` 函数用于创建一个指定元素的 `Double` 数组，这个函数的返回值是一个 `Double` 数组。
- `booleanArrayOf()` 函数用于创建一个指定元素的 `Boolean` 数组，这个函数的返回值是一个 `Boolean` 数组。
- 数组的遍历，可以使用 `for` 循环，也可以使用 `forEach()` 函数，`forEach()` 函数的参数是一个函数，这个函数的参数是数组的元素，这个函数的返回值是 `Unit`，`Unit` 相当于 Java 中的 `void`。
### 2.2.6 无符号类型

Kotlin 提供了一组无符号类型，用来改善对数字溢出的处理。这些类型在 Kotlin/JVM 中不可用。

| 类型    | 大小（比特数） | 最小值 | 最大值 |
| ------- | -------------- | ------ | ------ |
| `UByte` | 8              | 0      | 255    |
| `UShort`| 16             | 0      | 65535  |
| `UInt`  | 32             | 0      | 2^32-1 |
| `ULong` | 64             | 0      | 2^64-1 |

无符号类型的字面值分为两类：十进制和十六进制。对于十进制，没有前缀；对于十六进制，前缀是 `0x`。例如：

```kotlin
val a: UInt = 23u
val b: ULong = 23uL
val c: ULong = 0xCAFEBABEu
```

无符号类型支持常用的算术运算，以及位运算。请注意，无符号类型不支持有符号类型的减法或者除法。

```kotlin

val a: UInt = 23u
val b: UInt = 22u
val c: UInt = a + b
val d: UInt = a shl 2
```

无符号类型支持转换为有符号类型，反之亦然。转换时，有符号类型的负数会被转换为大的无符号类型。例如：

```kotlin
val x: Int = -1
val y: Long = x.toULong()
```





## 2.2 变量

变量：在程序运行过程中，其值可以发生改变的量。
基本语法：`var 变量名: 变量类型 = 变量值`

```kotlin
/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/31 14:15
 * @version: 1.0
 */
class VariableTest {
    // 总结：
    // 1. 变量的格式：var 变量名: 变量类型 = 变量值
    // 2. 变量的类型可以省略不写，由编译器自动推断
    // 3. 变量的类型可以省略不写，但是变量的值不能省略不写
    // 4. 变量的类型可以省略不写，但是变量的值不能省略不写，变量的值可以通过后面的赋值语句赋值


    var name: String = "张三"
    var age: Int = 18
    var height: Double = 1.75
    var isMarried: Boolean = false
}

fun main(args: Array<String>) {
    val variableTest = VariableTest()
    println("姓名：${variableTest.name}")
    println("年龄：${variableTest.age}")
    println("身高：${variableTest.height}")
    println("婚否：${variableTest.isMarried}")
    // 不指定类型，由编译器自动推断
    var name = "李四"
    var age = 20
    var height = 1.80
    var isMarried = true
    // 指定类型，不允许修改
    val name1: String = "王五"
    val age1: Int = 22
    val height1: Double = 1.85
    val isMarried1: Boolean = false
    println("姓名：${name}")
    println("年龄：${age}")
    println("身高：${height}")
    println("婚否：${isMarried}")
    println("姓名：${name1}")
    println("年龄：${age1}")
    println("身高：${height1}")
    println("婚否：${isMarried1}")
    // 指定类型，不赋值，由编译器自动推断
    val name2: String
    val age2: Int
    val height2: Double
    val isMarried2: Boolean
    name2 = "赵六"
    age2 = 24
    height2 = 1.90
    isMarried2 = true
    println("姓名：${name2}")
    println("年龄：${age2}")
    println("身高：${height2}")
    println("婚否：${isMarried2}")
}
```

![image-20230731151808714](image\image-20230731151808714.png)

我们可以对比一下 Java 的变量定义：

```java
// 定义变量
String name = "张三";
int age = 18;
double height = 1.75;
boolean isMarried = false;
// 定义常量
final String name1 = "李四";
final int age1 = 20;
final double height1 = 1.80;
final boolean isMarried1 = true;
```
我们可以一发现变量的定义，Kotlin 比 Java 的代码简洁很多，而且 Kotlin 的代码更加符合人类的思维，更加容易阅读，但是这只是正对学习 Kotlin 的人来说，对于 Java 开发者来说，Java 的代码更加容易阅读。
## 2.3 函数
函数：完成某个功能的代码块。
基本语法：`fun 函数名(参数列表): 返回值类型 { 函数体 }`

```kotlin
/**
 * @description:
 * @author: shu
 * @createDate: 2023/7/31 14:04
 * @version: 1.0
 */
class FuntionTest {

    // 格式：fun 函数名(参数名: 参数类型): 返回值类型 {}
    // 总结：
    // 1. 函数的参数可以有多个，用逗号隔开
    // 2. 函数的参数格式：参数名: 参数类型
    // 3. 函数的返回值类型在函数名后面用冒号隔开
    // 4. 函数的返回值类型可以省略不写，如果省略不写，那么函数的返回值类型就是Unit，相当于Java中的void
    // 5. ${}是字符串模板，可以在字符串中使用变量, 也可以使用表达式

    /**
     * 加法
     */
    fun sum(a: Int, b: Int): Int {
        return a + b
    }

    /**
     * 减法
     */
    fun sub(a: Int, b: Int): Int {
        return a - b
    }

    /**
     * 乘法
     */
    fun mul(a: Int, b: Int): Int {
        return a * b
    }

    /**
     * 除法
     */
    fun div(a: Int, b: Int): Int {
        return a / b
    }

    /**
     * 取余
     */
    fun mod(a: Int, b: Int): Int {
        return a % b
    }

}


fun main(args: Array<String>) {
    val funtionTest = FuntionTest()
    println("加法：${funtionTest.sum(1, 2)}")
    println("减法：${funtionTest.sub(1, 2)}")
    println("乘法：${funtionTest.mul(1, 2)}")
    println("除法：${funtionTest.div(1, 2)}")
    println("取余：${funtionTest.mod(1, 2)}")
}
```

![image-20230731152250543](image\image-20230731152250543.png)