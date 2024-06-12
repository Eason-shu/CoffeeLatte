---
title: Jetpack Compose 中的布局
sidebar_position: 4
keywords:
  - 工具
tags:
  - 工具
  - 学习笔记
last_update:
  date: 2024-06-12
  author: EasonShu

---

Jetpack Compose 中的 布局

## 1.1 线性布局

线性布局也是Android中最常用的布局方式，对应了传统视图中的LinearLayout,Compose根据orientation的不同又分为Column和Row，因为两者内部子元素在父容器中的布局和对齐方式不同，分成两个组件更有助于提供类型安全的Modifier修饰符。

### 1.1.1 Column

- Column是一个垂直线性布局组件，它能够将子项按照从上到下的顺序垂直排列。

```kotlin
@Composable
inline fun Column(
    modifier: Modifier? = Modifier,
    verticalArrangement: Arrangement.Vertical? = Arrangement.Top,
    horizontalAlignment: Alignment.Horizontal? = Alignment.Start,
    content: (@Composable @ExtensionFunctionType ColumnScope.() -> Unit)?
): Unit
```

- `verticalArrangment` 和 `horizontalAlignment` 参数分别可以帮助我们安排子项的垂直/水平位置，在默认的情况下，子项会以垂直方向上靠上（Arrangment.Top），水平方向上靠左（Alignment.Start）来排布。

- 只有指定了高度或者宽度，才能使用verticalArrangement或horizontalAlignment来定位子项在Column中的位置

```kotlin
@Composable
fun Greeting(name: String) {
    Text(text = "Hello $name!")
}

//Column
@Preview(showBackground = true)
@Composable
fun ColumnView() {
    Column(modifier = Modifier.fillMaxSize()) {
        Greeting("Android")
        Greeting("Android")
    }
}
```

