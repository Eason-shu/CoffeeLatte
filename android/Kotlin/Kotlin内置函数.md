---
title: Kotlin内置函数
sidebar_position: 6
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
`Kotlin`内置函数包括：`let`、`run`、`with`、`apply`、`also`，这些函数都是在`Any`类中定义的扩展函数，所以任何对象都可以调用这些函数。

# 一 内置函数

## 1.1 apply 函数

`apply` 是 `Kotlin` 标准库中的一个函数，它允许您在调用对象的上下文中执行一系列操作，并返回该对象本身。这在构建对象的过程中非常有用，因为它允许您在对象创建和初始化的同时进行一些链式操作。

`apply` 函数的签名如下：

```kotlin
inline fun <T> T.apply(block: T.() -> Unit): T
```

这里的 `T` 是接收者对象的类型。`block` 参数是一个函数字面值，它可以在接收者对象上执行一系列操作。在函数字面值内部，可以通过 `this` 来访问接收者对象。

下面是一个使用 `apply` 函数的示例，假设我们要创建一个 `Person` 类的对象并初始化其属性：

```kotlin
package Expetion

/**
 * @description:重点理解：apply函数的返回值是调用对象本身，也就是this
 * @author: shu
 * @createDate: 2023/8/8 19:50
 * @version: 1.0
 */
// 定义一个数据类
data class Person(var name: String = "", var age: Int = 0)
fun main(){
    val person = Person("张三", 20)
    // apply函数的返回值是调用对象本身
    val result = person.apply {
        name = "李四"
        age = 30
    }
    println(result)
    println(person)
}
```

在这个例子中，我们通过 `apply` 函数在对象初始化的过程中设置了 `name` 和 `age` 属性，然后将初始化后的对象赋值给 `person` 变量。

`apply` 函数的一个主要优势是它允许您在初始化对象的同时进行链式操作，而无需显式地创建中间变量。这在代码的可读性和简洁性方面非常有帮助。

## 1.2 let 函数

`let` 是·`Kotlin` 标准库中的另一个函数，它也用于对对象执行一系列操作，但与 `apply` 不同，它在操作完成后返回一个可能不同的值。`let` 函数的主要用途是在一个非空的对象上执行操作，同时避免空引用异常。

`let` 函数的签名如下：

```kotlin
inline fun <T, R> T.let(block: (T) -> R): R
```

在这里，`T` 是接收者对象的类型，`R` 是 `block` 函数的返回类型。`block` 参数是一个函数字面值，它接受一个参数并返回一个值。

下面是一个使用 `let` 函数的示例，假设我们要对一个非空字符串执行一些操作：

```kotlin
package Expetion

/**
 * @description: 重点理解：let函数的返回值是函数里面最后一行的返回值，也就是最后一行的返回值是什么，let函数的返回值就是什么
 * @author: shu
 * @createDate: 2023/8/8 19:55
 * @version: 1.0
 */
// 定义一个数据类
data class Person01(var name: String = "", var age: Int = 0)
// let函数的返回值是函数里面最后一行的返回值
fun main(){
    val person = Person01("张三", 20)
    val result = person.let {
        it.name = "李四"
        it.age = 30
        "返回值"
    }
    println(result)
    println(person)
}


```

在这个例子中，我们使用了安全调用操作符 `?.` 来调用 `let` 函数，以确保在 `input` 为非空的情况下才会执行 `let` 函数内部的操作。`it` 表示 `input` 的值，然后我们在 `let` 函数内部获取了字符串的长度，并将结果赋值给 `result` 变量。

`let` 函数在处理可空对象时特别有用，因为它允许您在对象非空的情况下执行一些操作，并获取一个非空的返回值。这有助于避免空引用异常并提高代码的安全性。

## 1.3 run函数

`run` 是 Kotlin 标准库中的另一个函数，它与 `apply` 和 `let` 有一些相似之处，但在使用上略有不同。`run` 函数允许您在对象上执行一系列操作，并返回最后一个操作的结果。与 `let` 不同，`run` 函数不仅可以在非空对象上使用，还可以在任何对象上使用。

`run` 函数的签名如下：

```kotlin
inline fun <T, R> T.run(block: T.() -> R): R
```

在这里，`T` 是接收者对象的类型，`R` 是 `block` 函数的返回类型。`block` 参数是一个函数字面值，它接受一个接收者对象并返回一个值。

下面是一个使用 `run` 函数的示例，假设我们要创建一个 `Person` 类的对象并执行一些操作：

```kotlin
package Expetion

/**
 * @description:
 * @author: shu
 * @createDate: 2023/8/8 19:58
 * @version: 1.0
 */
// 定义一个数据类
data class Person02(var name: String = "", var age: Int = 0)
//
fun main(){
    val person = Person02("张三", 20)
    val result = person.run {
        name = "李四"
        age = 30
        "返回值"
    }
    println(result)
    println(person)
}
```

在这个例子中，我们使用 `run` 函数在对象创建和初始化的过程中对 `name` 和 `age` 属性进行赋值，然后返回一个包含人物信息的字符串。

与 `let` 不同，`run` 函数不仅可以用于非空对象，还可以用于任何对象。它对于需要在一系列操作中执行某些操作并返回结果的情况非常有用。

**使用场景区别**

虽然 `apply`、`let` 和 `run` 函数在某些方面相似，它们在使用场景和功能上有一些区别，让我们来总结一下这些区别：

1. **返回值：**
   - `apply`：始终返回接收者对象本身。
   - `let`：返回函数字面值的结果，通常是对接收者对象的处理结果。
   - `run`：返回函数字面值的结果，通常是对接收者对象的处理结果。

2. **使用场景：**
   - `apply`：适用于在对象初始化的过程中执行一系列链式操作，通常用于修改对象的属性。
   - `let`：适用于在非空对象上执行操作，可以用于执行任何类型的处理。
   - `run`：适用于执行一系列操作并返回最终结果，可以用于任何类型的对象。

3. **对象引用：**
   - `apply`：在函数字面值内部可以使用 `this` 引用接收者对象。
   - `let`：在函数字面值内部可以使用 `it` 引用接收者对象。
   - `run`：在函数字面值内部可以使用 `this` 引用接收者对象。

4. **空安全：**
   - `apply`：通常用于非空对象，但也可以用于可空对象。
   - `let`：主要用于非空对象上，避免空引用异常。
   - `run`：可以在任何对象上使用，无论是否为空。

5. **链式操作：**
   - `apply`：适用于在对象构建和初始化的同时进行一系列链式操作。
   - `let`：适用于在一系列操作中进行单独的处理。
   - `run`：适用于执行一系列操作并返回结果，但较适合复杂操作。

## 1.4 with函数

`with` 是 `Kotlin` 标准库中的另一个函数，它与之前提到的 `apply`、`let` 和 `run` 有一些相似之处，但在使用方式和语义上略有不同。`with` 函数允许您在一个特定的对象上执行一系列操作，但不需要使用函数字面值，而是直接在一个代码块内操作对象。

`with` 函数的签名如下：

```kotlin
inline fun <T, R> with(receiver: T, block: T.() -> R): R
```

在这里，`receiver` 参数是接收者对象，`T` 是接收者对象的类型，`R` 是 `block` 函数的返回类型。`block` 参数是一个函数字面值，它接受一个接收者对象并返回一个值。

下面是一个使用 `with` 函数的示例，假设我们有一个 `Rectangle` 类，我们希望计算其面积和周长：

```kotlin
package Expetion

/**
 * @description:
 * @author: shu
 * @createDate: 2023/8/8 20:03
 * @version: 1.0
 */
class Rectangle(val width: Int, val height: Int)

fun main() {
    val rectangle = Rectangle(10, 5)
    val areaAndPerimeter = with(rectangle) {
        val area = width * height
        val perimeter = 2 * (width + height)
        "Area: $area, Perimeter: $perimeter"
    }
    println(areaAndPerimeter)
}
```

在这个例子中，我们使用 `with` 函数在 `rectangle` 对象上执行一系列操作，计算了面积和周长，并将结果字符串赋值给 `areaAndPerimeter` 变量。

与之前提到的函数不同，`with` 函数更注重于在特定对象上执行一系列操作，并且不需要在函数内部使用额外的 `it` 或 `this` 来引用接收者对象。

## 1.5 also函数

`also` 是` Kotlin` 标准库中的另一个函数，类似于之前提到的 `apply`、`let`、`run` 和 `with` 函数，它也用于在对象上执行一系列操作，但在使用方式和返回值方面有一些不同。`also` 函数允许您在一系列操作中对对象进行修改，并返回该对象本身。

`also` 函数的签名如下：

```kotlin
inline fun <T> T.also(block: (T) -> Unit): T
```

在这里，`T` 是接收者对象的类型，`block` 参数是一个函数字面值，它接受一个接收者对象并不返回任何值，用于执行一系列操作。

下面是一个使用 `also` 函数的示例，假设我们要对一个列表进行操作并输出其中的元素：

```kotlin
package Expetion

/**
 * @description:
 * @author: shu
 * @createDate: 2023/8/8 20:03
 * @version: 1.0
 */

fun main() {
    val numbers = mutableListOf(1, 2, 3, 4, 5)
    numbers.also {
        it.add(6)
        it.remove(2)
    }.forEach {
        println(it)
    }
}
```

在这个例子中，我们使用 `also` 函数对 `numbers` 列表进行了添加和删除操作，然后在链式调用中调用了 `forEach` 函数来输出列表中的元素。

`also` 函数适用于那些需要在一系列操作中修改对象本身，同时返回该对象的情况。与 `apply` 不同，`also` 的主要重点是执行操作，而不是在初始化过程中进行操作。

## 1.6 takeIf函数

在`Kotlin` 中，`takeIf` 是一个标准库函数，用于在特定条件下接收并返回对象。如果传递给 `takeIf` 函数的条件为真，则函数返回接收者对象，否则返回 `null`。

`takeIf` 函数的签名如下：

```kotlin
inline fun <T> T.takeIf(predicate: (T) -> Boolean): T?
```

在这里，`T` 是接收者对象的类型，`predicate` 参数是一个函数字面值，它接受一个接收者对象并返回一个布尔值，用于判断是否应该接受该对象。

下面是一个使用 `takeIf` 函数的示例，假设我们要从一个字符串列表中找到第一个长度大于等于 5 的字符串：

```kotlin
package Expetion

/**
 * @description:
 * @author: shu
 * @createDate: 2023/8/8 20:03
 * @version: 1.0
 */

fun main() {
    val strings = listOf("apple", "banana", "cherry", "date", "elderberry")
    val result = strings.firstOrNull { it.length >= 5 }?.takeIf { it.startsWith("e") }
    println(result)
}
```

在这个例子中，我们首先使用 `firstOrNull` 函数找到第一个满足长度大于等于 5 的字符串，然后我们通过链式调用使用 `takeIf` 函数来验证是否以字母 "e" 开头，如果是，则返回该字符串，否则返回 `null`。

`takeIf` 函数适用于那些需要基于特定条件来选择对象的情况。

## 1.7 takeUnless函数

在 Kotlin 中，`takeUnless` 是一个标准库函数，与之前提到的 `takeIf` 函数类似，它也用于在特定条件下接收并返回对象。与 `takeIf` 不同的是，`takeUnless` 在条件为假时返回接收者对象，而在条件为真时返回 `null`。

`takeUnless` 函数的签名如下：

```kotlin
inline fun <T> T.takeUnless(predicate: (T) -> Boolean): T?
```

在这里，`T` 是接收者对象的类型，`predicate` 参数是一个函数字面值，它接受一个接收者对象并返回一个布尔值，用于判断是否应该拒绝该对象。

下面是一个使用 `takeUnless` 函数的示例，假设我们要从一个整数列表中找到第一个小于 5 的整数：

```kotlin
package Expetion

/**
 * @description:
 * @author: shu
 * @createDate: 2023/8/8 20:03
 * @version: 1.0
 */
fun main() {
    val numbers = listOf(3, 8, 1, 6, 4)
    val result = numbers.firstOrNull { it < 5 }?.takeUnless { it == 1 }
    println(result)
}
```

在这个例子中，我们使用 `firstOrNull` 函数找到第一个满足小于 5 的整数，然后通过链式调用使用 `takeUnless` 函数来验证是否等于 1，如果是，则返回 `null`，否则返回该整数。

`takeUnless` 函数适用于需要基于特定条件来排除对象的情况。与 `takeIf` 函数相比，`takeUnless` 的返回逻辑相反，因此您可以根据情况选择使用哪个函数。

## 1.8 总结

让我们对之前提到的几个函数进行总结，以便更清楚地了解它们之间的区别：

1. **apply**：
   - 返回接收者对象本身。
   - 用于在对象初始化过程中执行一系列链式操作。
   - 在函数字面值内部使用 `this` 引用接收者对象。
   - 适用于对象的构建和初始化，通常用于修改属性。

2. **let**：
   - 返回函数字面值的结果。
   - 用于在非空对象上执行操作，避免空引用异常。
   - 在函数字面值内部使用 `it` 引用接收者对象。
   - 适用于在一系列操作中执行单独的处理，获取处理结果。

3. **run**：
   - 返回函数字面值的结果。
   - 可以在任何对象上使用。
   - 在函数字面值内部使用 `this` 引用接收者对象。
   - 适用于执行一系列操作并返回结果，较适合复杂操作。

4. **with**：
   - 返回函数字面值的结果。
   - 用于在特定对象上执行一系列操作。
   - 在函数字面值内部直接操作对象，无需使用 `it` 或 `this` 引用。
   - 适用于在特定对象上执行多个操作，不关注初始化过程。

5. **also**：
   - 返回接收者对象本身。
   - 用于在一系列操作中修改对象并返回其本身。
   - 在函数字面值内部使用 `it` 引用接收者对象。
   - 适用于需要执行多个操作并保持链式调用，重点在于执行操作。

6. **takeIf**：
   - 返回接收者对象本身或 `null`。
   - 用于根据条件接收对象，条件为真则返回 `null`。
   - 在函数字面值内部使用 `it` 引用接收者对象。
   - 适用于基于条件接收对象的情况。

7. **takeUnless**：
   - 返回接收者对象本身或 `null`。
   - 用于根据条件接收对象，条件为真则返回对象，否则返回 `null`。
   - 在函数字面值内部使用 `it` 引用接收者对象。
   - 适用于基于条件排除对象的情况。

