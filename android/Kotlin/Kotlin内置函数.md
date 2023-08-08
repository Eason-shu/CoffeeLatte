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
Kotlin内置函数包括：`let`、`run`、`with`、`apply`、`also`，这些函数都是在`Any`类中定义的扩展函数，所以任何对象都可以调用这些函数。
- 说明：这个函数持有this,返回值是函数里面最后一行，或者return的值
- 适用场景：需要对一个对象进行一系列操作，最后返回这个对象的时候，可以使用这些函数
- 优点：代码简洁，不需要写很多的变量，不需要写很多的if else
