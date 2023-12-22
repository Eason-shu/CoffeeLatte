---
title: HarmonyOs (三) ArkTS语言
sidebar_position: 3
keywords:
  - HarmonyOs
tags:
  - HarmonyOs
  - 学习笔记
last_update:
  date: 2023-10-21
  author: EasonShu
---





参考资料：
[文档中心](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-get-started-0000001504769321-V3)
# 一 认识ArkTs语言
## 1.1 ArkTs
ArkTS是HarmonyOS优选的主力应用开发语言。ArkTS围绕应用开发在[TypeScript](https://www.typescriptlang.org/)（简称TS）生态基础上做了进一步扩展，继承了TS的所有特性，是TS的超集。因此，在学习ArkTS语言之前，建议开发者具备TS语言开发能力。
当前，ArkTS在TS的基础上主要扩展了如下能力：

- [基本语法](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-basic-syntax-overview-0000001531611153-V3)：ArkTS定义了声明式UI描述、自定义组件和动态扩展UI元素的能力，再配合ArkUI开发框架中的系统组件及其相关的事件方法、属性方法等共同构成了UI开发的主体。
- [状态管理](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-state-management-overview-0000001524537145-V3)：ArkTS提供了多维度的状态管理机制。在UI开发框架中，与UI相关联的数据可以在组件内使用，也可以在不同组件层级间传递，比如父子组件之间、爷孙组件之间，还可以在应用全局范围内传递或跨设备传递。另外，从数据的传递形式来看，可分为只读的单向传递和可变更的双向传递。开发者可以灵活的利用这些能力来实现数据和UI的联动。
- [渲染控制](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-rendering-control-overview-0000001543911149-V3)：ArkTS提供了渲染控制的能力。条件渲染可根据应用的不同状态，渲染对应状态下的UI内容。循环渲染可从数据源中迭代获取数据，并在每次迭代过程中创建相应的组件。数据懒加载从数据源中按需迭代数据，并在每次迭代过程中创建相应的组件。

未来，ArkTS会结合应用开发/运行的需求持续演进，逐步提供并行和并发能力增强、系统类型增强、分布式开发范式等更多特性。
## 1.2 基本结构
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701084166917-9839a7ce-4943-420d-9a86-385635f6fd55.png#averageHue=%23fbfbfb&clientId=uf7f6d535-13bb-4&from=paste&id=ucd3f5a6b&originHeight=710&originWidth=816&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=ube775c63-3a81-4440-bf40-01a943dd707&title=)

- 装饰器： 用于装饰类、结构、方法以及变量，并赋予其特殊的含义，如上述示例中@Entry、@Component和@State都是装饰器，@Component表示自定义组件，@Entry表示该自定义组件为入口组件，@State表示组件中的状态变量，状态变量变化会触发UI刷新。
- UI描述：以声明式的方式来描述UI的结构，例如build()方法中的代码块。
- 自定义组件：可复用的UI单元，可组合其他组件，如上述被@Component装饰的struct Hello。
- 系统组件：ArkUI框架中默认内置的基础和容器组件，可直接被开发者调用，比如示例中的Column、Text、Divider、Button。
- 属性方法：组件可以通过链式调用配置多项属性，如fontSize()、width()、height()、backgroundColor()等。
- 事件方法：组件可以通过链式调用设置多个事件的响应逻辑，如跟随在Button后面的onClick()。
- 系统组件、属性方法、事件方法具体使用可参考基于ArkTS的声明式开发范式。
除此之外，ArkTS扩展了多种语法范式来使开发更加便捷：
- @Builder/@BuilderParam：特殊的封装UI描述的方法，细粒度的封装和复用UI描述。
- @Extend/@Style：扩展内置组件和封装属性样式，更灵活地组合内置组件。
- stateStyles：多态样式，可以依据组件的内部状态的不同，设置不同样式。
# 二 基本语法
## 2.1 声明式UI
ArkTS以声明方式组合和扩展组件来描述应用程序的UI，同时还提供了基本的属性、事件和子组件配置方法，帮助开发者实现应用交互逻辑。
### 2.1.1 创建组件
> - 根据组件构造方法的不同，创建组件包含有参数和无参数两种方式。
> - 创建组件时不需要new运算符。
> - 最好有Ts语法基础。

#### 2.1.1.1 无参数
注意：Column、Row、Stack、Grid、List等组件都是容器组件，我们的顶层需要在容器组件中
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701084806874-baf1497d-ed9c-4d98-9878-dbbafda2ffcf.png#averageHue=%23353b3f&clientId=uf7f6d535-13bb-4&from=paste&height=395&id=u146b8daf&originHeight=474&originWidth=704&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=200122&status=done&style=none&taskId=uff36636b-8801-49c6-90e1-1b55a374a36&title=&width=586.6666433546287)
如果组件的接口定义没有包含必选构造参数，则组件后面的“()”不需要配置任何内容。例如，Divider组件不包含构造参数
#### 2.1.1.2 有参数

- 必填参数，比如Image

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701085048218-ea34bb59-85d1-4b46-9b00-cd28f8e10be9.png#averageHue=%23323e48&clientId=uf7f6d535-13bb-4&from=paste&height=612&id=uc096074d&originHeight=735&originWidth=1286&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=457991&status=done&style=none&taskId=u10871637-93dd-4307-81c1-5dc31824e7d&title=&width=1071.666624082461)

- 非必选参数，比如Text组件的非必选参数content
```jsx
Column() {
  Text('无参数组件Column')
  Divider()
  Text('item 2')
  Divider()
  Text($r('app.string.app_name'))
  Divider()
  Text()
}
```

- 变量或表达式也可以用于参数赋值，其中表达式返回的结果类型必须满足参数类型要求。例如，设置变量或表达式来构造Image和Text组件的参数。
```jsx
Image(this.imagePath)
Image('https://' + this.imageUrl)
Text(`count: ${this.count}`)
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701085446818-204cdcf1-1363-4db3-a5ed-5977e61116b0.png#averageHue=%23343c44&clientId=uf7f6d535-13bb-4&from=paste&height=577&id=uc96a0c13&originHeight=692&originWidth=1302&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=484353&status=done&style=none&taskId=ua24b8a90-3e2a-413b-8981-abd5938a2c9&title=&width=1084.9999568859753)
#### 2.1.1.3 组件样式
组件的样式控制，有点类似Java 中的链式编程
```jsx
@Entry
@Component
struct Index {
  @State message: string = 'Hello World'
  @State url: string="https://dogefs.s3.ladydaily.com/~/source/wallhaven/full/p9/wallhaven-p97l5e.png?w=2560&h=1440&fmt=webp"
  build() {
    Row() {
      Column() {
        Text('无参数组件Column')
        Divider()
        Text('item 2')
        Divider()
        Text($r('app.string.app_name'))
        Divider()
        Text()
        Divider()
        Image(this.url)
          .alt('error.jpg')
          .width(100)
          .height(100)
      }
    }
    .height('100%')
  }
}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701085578752-4fb85e41-5d0f-42a2-b6e1-be548292c7d4.png#averageHue=%2333393f&clientId=uf7f6d535-13bb-4&from=paste&height=635&id=uf4c7ba90&originHeight=762&originWidth=1291&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=347263&status=done&style=none&taskId=u8c09aa41-532b-4879-9b25-8ceeb5a67b8&title=&width=1075.8332905835593)
#### 2.1.1.4 组件方法
事件方法以“.”链式调用的方式配置系统组件支持的事件，建议每个事件方法单独写一行
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701085965499-aa301570-6efb-4649-9fbf-340914f040b4.png#averageHue=%233a4147&clientId=uf7f6d535-13bb-4&from=paste&height=680&id=uf0b7e39f&originHeight=816&originWidth=1846&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=536841&status=done&style=none&taskId=ub76f253e-0fc0-400d-a868-5a1e40f43ed&title=&width=1538.333272205461)

- 点击按钮，改变颜色

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701086395402-9be10960-fc57-421f-a4e9-40cc2edceaeb.png#averageHue=%2357895c&clientId=uf7f6d535-13bb-4&from=paste&height=650&id=u1b53abe3&originHeight=780&originWidth=1371&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=380547&status=done&style=none&taskId=u020de3cd-9533-4436-9a44-9214c6ee3e0&title=&width=1142.4999546011306)
```jsx
@Entry
@Component
struct Index {
  @State message: string = 'Hello World'
  @State url: string="https://dogefs.s3.ladydaily.com/~/source/wallhaven/full/p9/wallhaven-p97l5e.png?w=2560&h=1440&fmt=webp"
  @State backgroundColors:Color=Color.Blue
  build() {
    Row() {
      Column() {
        Text('无参数组件Column')
        Divider()
        Text('item 2')
        Divider()
        Text($r('app.string.app_name'))
        Divider()
        Text()
        Divider()
        Image(this.url)
          .alt('error.jpg')
          .width(100)
          .height(100)
        Divider()
        Button("点击事件")
          .backgroundColor(this.backgroundColors)
          .margin(10)
          .width(100)
          .height(50)
          .onClick(()=>{
            console.log("你点击了这个按钮哦")
            this.backgroundColors=Color.Green
          })
          .onHover(e=>{
            // 改变颜色
            console.log("你点击了这个按钮哦1111")
          })

      }
    }
    .height('100%')
  }
}
```
#### 2.1.1.5 组件嵌套
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701086635969-2211fb89-9013-49c6-ac58-1942a41e2b95.png#averageHue=%235a6a68&clientId=uf7f6d535-13bb-4&from=paste&height=740&id=u2a48a9fe&originHeight=888&originWidth=1409&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=447356&status=done&style=none&taskId=u2316e167-d415-4ff2-8a7f-c07dce2da8f&title=&width=1174.1666200094771)
### 2.1.2 自定义组件
在ArkUI中，UI显示的内容均为组件，由框架直接提供的称为系统组件，由开发者定义的称为自定义组件。在进行 UI 界面开发时，通常不是简单的将系统组件进行组合使用，而是需要考虑代码可复用性、业务逻辑与UI分离，后续版本演进等因素。因此，将UI和部分业务逻辑封装成自定义组件是不可或缺的能力。
自定义组件具有以下特点：

- 可组合：允许开发者组合使用系统组件、及其属性和方法。
- 可重用：自定义组件可以被其他组件重用，并作为不同的实例在不同的父组件或容器中使用。
- 数据驱动UI更新：通过状态变量的改变，来驱动UI的刷新。

##
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701088937373-f9447fee-e325-447a-9580-104ebac717ba.png#averageHue=%232f5057&clientId=u69ced89b-8b7f-4&from=paste&height=699&id=uf5540cd3&originHeight=839&originWidth=1381&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=586958&status=done&style=none&taskId=u82e47cbf-d285-4508-bab6-aece74ef17d&title=&width=1150.833287603327)
```jsx
@Entry
@Component
struct Index {
  @State message: string = 'Hello World'
  @State url: string="https://dogefs.s3.ladydaily.com/~/source/wallhaven/full/p9/wallhaven-p97l5e.png?w=2560&h=1440&fmt=webp"
  @State backgroundColors:Color=Color.Blue
  build() {
    Row() {
      Column(){
        ImageComponent()
      }.width(200)
      Column(){
        ImageComponent()
      }.width(200)

    }
    .height('100%')
  }
}

@Component
struct ImageComponent {
  @State url: string = 'https://dogefs.s3.ladydaily.com/~/source/wallhaven/full/p9/wallhaven-p97l5e.png?w=2560&h=1440&fmt=webp';
  build() {
    Row() {
      Image(this.url)
        .width(200)
        .height(200)
    }
  }
}
```

- 传参数（{参数}）

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701089562260-1f11d648-be89-4635-ad3e-7a4513fa46bf.png#averageHue=%23314d53&clientId=u69ced89b-8b7f-4&from=paste&height=617&id=ubeb2123b&originHeight=741&originWidth=1306&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=521455&status=done&style=none&taskId=u109418c1-7065-42b1-a93d-69a46f741c8&title=&width=1088.3332900868538)
#### 2.1.2.1 基本结构

- struct：自定义组件基于struct实现，struct + 自定义组件名 + {...}的组合构成自定义组件，不能有继承关系。对于struct的实例化，可以省略new。**说明**自定义组件名、类名、函数名不能和系统组件名相同。
```jsx
@Component
  struct MyComponent {
  }
```

- @Component：@Component装饰器仅能装饰struct关键字声明的数据结构。struct被@Component装饰后具备组件化的能力，需要实现build方法描述UI，一个struct只能被一个@Component装饰。**说明**从API version 9开始，该装饰器支持在ArkTS卡片中使用。
- build()函数：build()函数用于定义自定义组件的声明式UI描述，自定义组件必须定义build()函数。
```jsx
@Component
  struct MyComponent {
    build() {
    }
  }
```

- @Entry：@Entry装饰的自定义组件将作为UI页面的入口。在单个UI页面中，最多可以使用@Entry装饰一个自定义组件。@Entry可以接受一个可选的[LocalStorage](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-localstorage-0000001524537149-V3)的参数。**说明**从API version 9开始，该装饰器支持在ArkTS卡片中使用。
```jsx
@Entry
  @Component
  struct MyComponent {
  }
```
#### 2.1.2.2 成员函数/变量
自定义组件除了必须要实现build()函数外，还可以实现其他成员函数，成员函数具有以下约束：

- 不支持静态函数。
- 成员函数的访问是私有的。

自定义组件可以包含成员变量，成员变量具有以下约束：

- 不支持静态成员变量。
- 所有成员变量都是私有的，变量的访问规则与成员函数的访问规则相同。
- 自定义组件的成员变量本地初始化有些是可选的，有些是必选的。具体是否需要本地初始化，是否需要从父组件通过参数传递初始化子组件的成员变量
#### 2.1.2.3 自定义组件的参数规定
我们已经了解到，可以在build方法或者[@Builder](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-builder-0000001524176981-V3)装饰的函数里创建自定义组件，在创建自定义组件的过程中，根据装饰器的规则来初始化自定义组件的参数。
```jsx
@Entry
@Component
struct Index {
  build() {
    Row() {
      Column(){
        ImageComponent()
      }.width(200)
      Column(){
        ImageComponent({url:"https://dogefs.s3.ladydaily.com/~/source/wallhaven/full/ex/wallhaven-exwgw8.png?w=2560&h=1440&fmt=webp"})
      }.width(200)

    }
    .height('100%')
  }
}

@Component
struct ImageComponent {
  @State url: string = 'https://dogefs.s3.ladydaily.com/~/source/wallhaven/full/p9/wallhaven-p97l5e.png?w=2560&h=1440&fmt=webp';
  build() {
    Row() {
      Image(this.url)
        .width(200)
        .height(200)
    }
  }
}
```
#### 2.1.2.4 Build函数
所有声明在build()函数的语言，我们统称为UI描述，UI描述需要遵循以下规则：

- @Entry装饰的自定义组件，其build()函数下的根节点唯一且必要，且必须为容器组件，其中ForEach禁止作为根节点。
- @Component装饰的自定义组件，其build()函数下的根节点唯一且必要，可以为非容器组件，其中ForEach禁止作为根节点。
```jsx
@Entry
@Component
struct MyComponent {
  build() {
    // 根节点唯一且必要，必须为容器组件
    Row() {
      ChildComponent() 
    }
  }
}

@Component
struct ChildComponent {
  build() {
    // 根节点唯一且必要，可为非容器组件
    Image('test.jpg')
  }
}
```

- 不允许声明本地变量
```jsx
build() {
  // 反例：不允许声明本地变量
  let a: number = 1;
}
```

- 不允许在UI描述里直接使用console.info，但允许在方法或者函数里使用，反例如下。
```jsx
build() {
  // 反例：不允许console.info
  console.info('print debug log');
}
```

- 不允许创建本地的作用域，反例如下
```jsx
build() {
  // 反例：不允许本地作用域
  {
    ...
  }
}
```

- 不允许调用没有用@Builder装饰的方法，允许系统组件的参数是TS方法的返回值
```jsx
@Component
struct ParentComponent {
  doSomeCalculations() {
  }

  calcTextValue(): string {
    return 'Hello World';
  }

  @Builder doSomeRender() {
    Text(Hello World)
  }

  build() {
    Column() {
      // 反例：不能调用没有用@Builder装饰的方法
      this.doSomeCalculations();
      // 正例：可以调用
      this.doSomeRender();
      // 正例：参数可以为调用TS方法的返回值
      Text(this.calcTextValue())
    }
  }
}
```

- 不允许switch语法，如果需要使用条件判断，请使用if。
```jsx
build() {
  Column() {
    // 反例：不允许使用switch语法
    switch (expression) {
      case 1:
        Text('...')
        break;
      case 2:
        Image('...')
        break;
      default:
        Text('...')
        break;
    }
  }
}
```
#### 2.1.2.5 自定义组件通用样式
ArkUI给自定义组件设置样式时，相当于给MyComponent2套了一个不可见的容器组件，而这些样式是设置在容器组件上的，而非直接设置给MyComponent2的Button组件。通过渲染结果我们可以很清楚的看到，背景颜色红色并没有直接生效在Button上，而是生效在Button所处的开发者不可见的容器组件上。
### 2.1.3 组件生命周期
在开始之前，我们先明确自定义组件和页面的关系：

- 自定义组件：@Component装饰的UI单元，可以组合多个系统组件实现UI的复用。
- 页面：即应用的UI页面。可以由一个或者多个自定义组件组成，@Entry装饰的自定义组件为页面的入口组件，即页面的根节点，一个页面有且仅能有一个@Entry。只有被@Entry装饰的组件才可以调用页面的生命周期。

页面生命周期，即被@Entry装饰的组件生命周期，提供以下生命周期接口：

- [onPageShow](https://developer.harmonyos.com/cn/docs/documentation/doc-references-V3/arkts-custom-component-lifecycle-0000001482395076-V3#ZH-CN_TOPIC_0000001523488850__onpageshow)：页面每次显示时触发。
- [onPageHide](https://developer.harmonyos.com/cn/docs/documentation/doc-references-V3/arkts-custom-component-lifecycle-0000001482395076-V3#ZH-CN_TOPIC_0000001523488850__onpagehide)：页面每次隐藏时触发一次。
- [onBackPress](https://developer.harmonyos.com/cn/docs/documentation/doc-references-V3/arkts-custom-component-lifecycle-0000001482395076-V3#ZH-CN_TOPIC_0000001523488850__onbackpress)：当用户点击返回按钮时触发。

组件生命周期，即一般用@Component装饰的自定义组件的生命周期，提供以下生命周期接口：

- [aboutToAppear](https://developer.harmonyos.com/cn/docs/documentation/doc-references-V3/arkts-custom-component-lifecycle-0000001482395076-V3#ZH-CN_TOPIC_0000001523488850__abouttoappear)：组件即将出现时回调该接口，具体时机为在创建自定义组件的新实例后，在执行其build()函数之前执行。
- [aboutToDisappear](https://developer.harmonyos.com/cn/docs/documentation/doc-references-V3/arkts-custom-component-lifecycle-0000001482395076-V3#ZH-CN_TOPIC_0000001523488850__abouttodisappear)：在自定义组件即将析构销毁时执行。

生命周期流程如下图所示，下图展示的是被@Entry装饰的组件（首页）生命周期。
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701090789958-fc2c0b7e-b03d-4ef8-9b75-195376559669.png#averageHue=%23fdfdfd&clientId=u69ced89b-8b7f-4&from=paste&id=ud5d5cb2a&originHeight=370&originWidth=660&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u8c0ee423-0f22-4da7-9264-fcdba34bd5f&title=)
根据上面的流程图，我们从自定义组件的初始创建、重新渲染和删除来详细解释。
```jsx
// Index.ets
import router from '@ohos.router';

@Entry
@Component
struct MyComponent {
  @State showChild: boolean = true;

  // 只有被@Entry装饰的组件才可以调用页面的生命周期
  onPageShow() {
    console.info('Index onPageShow');
  }
  // 只有被@Entry装饰的组件才可以调用页面的生命周期
  onPageHide() {
    console.info('Index onPageHide');
  }

  // 只有被@Entry装饰的组件才可以调用页面的生命周期
  onBackPress() {
    console.info('Index onBackPress');
  }

  // 组件生命周期
  aboutToAppear() {
    console.info('MyComponent aboutToAppear');
  }

  // 组件生命周期
  aboutToDisappear() {
    console.info('MyComponent aboutToDisappear');
  }

  build() {
    Column() {
      // this.showChild为true，创建Child子组件，执行Child aboutToAppear
      if (this.showChild) {
        Child()
      }
      // this.showChild为false，删除Child子组件，执行Child aboutToDisappear
      Button('create or delete Child').onClick(() => {
        this.showChild = false;
      })
      // push到Page2页面，执行onPageHide
      Button('push to next page')
        .onClick(() => {
          router.pushUrl({ url: 'pages/Page2' });
        })
    }
  }
}
@Component
struct Child {
  @State title: string = 'Hello World';
  // 组件生命周期
  aboutToDisappear() {
    console.info('[lifeCycle] Child aboutToDisappear')
  }
  // 组件生命周期
  aboutToAppear() {
    console.info('[lifeCycle] Child aboutToAppear')
  }
  build() {
    Text(this.title).fontSize(50).onClick(() => {
      this.title = 'Hello ArkUI';
    })
  }
}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701091032104-0bc863fa-5f39-48c0-923b-4093f7e1f808.png#averageHue=%23435355&clientId=u69ced89b-8b7f-4&from=paste&height=747&id=u369f5081&originHeight=896&originWidth=1908&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=668472&status=done&style=none&taskId=u529e0248-304e-40c3-96ca-918175b39b2&title=&width=1589.999936819079)

- 应用冷启动的初始化流程为：MyComponent aboutToAppear --> MyComponent build --> Child aboutToAppear --> Child build --> Child build执行完毕 --> MyComponent build执行完毕 --> Index onPageShow。
- 点击“delete Child”，if绑定的this.showChild变成false，删除Child组件，会执行Child aboutToDisappear方法。
- 点击“push to next page”，调用router.pushUrl接口，跳转到另外一个页面，当前Index页面隐藏，执行页面生命周期Index onPageHide。此处调用的是router.pushUrl接口，Index页面被隐藏，并没有销毁，所以只调用onPageHide。跳转到新页面后，执行初始化新页面的生命周期的流程。
- 如果调用的是router.replaceUrl，则当前Index页面被销毁，执行的生命周期流程将变为：Index onPageHide --> MyComponent aboutToDisappear --> Child aboutToDisappear。上文已经提到，组件的销毁是从组件树上直接摘下子树，所以先调用父组件的aboutToDisappear，再调用子组件的aboutToDisappear，然后执行初始化新页面的生命周期流程。
- 点击返回按钮，触发页面生命周期Index onBackPress，且触发返回一个页面后会导致当前Index页面被销毁。
- 最小化应用或者应用进入后台，触发Index onPageHide。当前Index页面没有被销毁，所以并不会执行组件的aboutToDisappear。应用回到前台，执行Index onPageShow。
- 退出应用，执行Index onPageHide --> MyComponent aboutToDisappear --> Child aboutToDisappear。
### 2.1.4 @Builder装饰器：自定义构建函数

- 该自定义组件内部UI结构固定，仅与使用方进行数据传递。ArkUI还提供了一种更轻量的UI元素复用机制@Builder，@Builder所装饰的函数遵循build()函数语法规则，开发者可以将重复使用的UI元素抽象成一个方法，在build方法里调用。
- 为了简化语言，我们将@Builder装饰的函数也称为“自定义构建函数”。

**说明**
从API version 9开始，该装饰器支持在ArkTS卡片中使用。
#### 2.1.4.1 自定义组件内自定义构建函数
```jsx

@Component
struct ImageComponent {
  @Builder MyBuilderFunction(){
    Row() {
      Image(this.url)
        .width(200)
        .height(200)
    }
  }
  @State url: string = 'https://dogefs.s3.ladydaily.com/~/source/wallhaven/full/p9/wallhaven-p97l5e.png?w=2560&h=1440&fmt=webp';
  build() {
    this.MyBuilderFunction()
  }
}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701092650432-649ac699-60aa-4dc9-908a-b94a990117ce.png#averageHue=%232e4b52&clientId=u69ced89b-8b7f-4&from=paste&height=625&id=u724ddb3b&originHeight=750&originWidth=1350&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=541689&status=done&style=none&taskId=u0770f13a-840b-4531-b673-844a7b801e2&title=&width=1124.9999552965182)
定义的语法：
```jsx
@Builder MyBuilderFunction(){ ... }
```
使用方法：
```jsx
this.MyBuilderFunction(){ ... }
```

- 允许在自定义组件内定义一个或多个@Builder方法，该方法被认为是该组件的私有、特殊类型的成员函数。
- 自定义构建函数可以在所属组件的build方法和其他自定义构建函数中调用，但不允许在组件外调用。
- 在自定义函数体中，this指代当前所属组件，组件的状态变量可以在自定义构建函数内访问。建议通过this访问自定义组件的状态变量而不是参数传递。
#### 2.1.4.2 全局自定义构建函数
```jsx

@Builder function MyGlobalBuilderImageComponent(){
  Row() {
    Image('https://dogefs.s3.ladydaily.com/~/source/wallhaven/full/p9/wallhaven-p97l5e.png?w=2560&h=1440&fmt=webp')
      .width(200)
      .height(200)
  }
}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701092952309-0aca3bfc-741c-4b91-a964-d83d1f536700.png#averageHue=%232e4950&clientId=u69ced89b-8b7f-4&from=paste&height=678&id=u9b79dc3b&originHeight=814&originWidth=1303&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=520879&status=done&style=none&taskId=u914a0e94-3784-471d-becf-782c10b82ba&title=&width=1085.833290186195)
定义的语法：
```jsx
@Builder function MyGlobalBuilderFunction(){ ... }
```
使用方法：
```jsx
MyGlobalBuilderFunction()
```

- 全局的自定义构建函数可以被整个应用获取，不允许使用this和bind方法。
- 如果不涉及组件状态变化，建议使用全局的自定义构建方法。
#### 2.1.4.3 参数传递规则
自定义构建函数的参数传递有[按值传递](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-builder-0000001524176981-V3#section163841721135012)和[按引用传递](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-builder-0000001524176981-V3#section1522464044212)两种，均需遵守以下规则：

- 参数的类型必须与参数声明的类型一致，不允许undefined、null和返回undefined、null的表达式。
- 在自定义构建函数内部，不允许改变参数值。如果需要改变参数值，且同步回调用点，建议使用[@Link](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-link-0000001524297305-V3)。
- @Builder内UI语法遵循[UI语法规则](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-create-custom-components-0000001473537046-V3#section1150911733811)。
##### 按引用传递参数
按引用传递参数时，传递的参数可为状态变量，且状态变量的改变会引起@Builder方法内的UI刷新。ArkUI提供$$作为按引用传递参数的范式。
```jsx
@Builder function MyGlobalBuilderImageComponent($$ : { url: string } ){
  Row() {
    Image(`${$$.url}`)
      .width(200)
      .height(200)
  }
}
```
```jsx
@Entry
@Component
struct Index {
  @State urls: string="https://dogefs.s3.ladydaily.com/~/source/wallhaven/full/9d/wallhaven-9d9111.jpg?w=2560&h=1440&fmt=webp"
  build() {
    Row() {
      Column(){
        MyGlobalBuilderImageComponent({url:this.urls })
        Divider()
        Button("改变图片").onClick(()=>{
          this.urls="https://dogefs.s3.ladydaily.com/~/source/wallhaven/full/85/wallhaven-8596q2.jpg?w=2560&h=1440&fmt=webp"
        })
          .width(200)
          .width(100)
      }.width(200)
      Column(){
        ImageComponent()
        Divider()
        Button("改变图片").onClick(()=>{
        })
          .width(200)
          .width(100)
      }.width(200)
    }
    .height('100%')
  }
}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701094245435-2e4593ea-7543-4529-b9e3-bf3921a48682.png#averageHue=%23425955&clientId=udba54de6-e5c9-4&from=paste&height=494&id=u845f1ea5&originHeight=593&originWidth=1379&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=559087&status=done&style=none&taskId=ubb7a3c6d-23c4-4c71-b0fe-4b04133b28d&title=&width=1149.166621002888)
##### 按值传递参数
调用@Builder装饰的函数默认按值传递。当传递的参数为状态变量时，状态变量的改变不会引起@Builder方法内的UI刷新。所以当使用状态变量的时候，推荐使用[按引用传递](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-builder-0000001524176981-V3#section1522464044212)。
```jsx
@Entry
@Component
struct Index {
  urls: string="https://dogefs.s3.ladydaily.com/~/source/wallhaven/full/9d/wallhaven-9d9111.jpg?w=2560&h=1440&fmt=webp"
  build() {
    Row() {
      Column(){
        MyGlobalBuilderImageComponent({url:this.urls })
        Divider()
        Button("改变图片").onClick(()=>{
          this.urls="https://dogefs.s3.ladydaily.com/~/source/wallhaven/full/85/wallhaven-8596q2.jpg?w=2560&h=1440&fmt=webp"
        })
          .width(200)
          .width(100)
      }.width(200)
      Column(){
        ImageComponent()
        Divider()
        Button("改变图片").onClick(()=>{
        })
          .width(200)
          .width(100)
      }.width(200)



    }
    .height('100%')
  }
}


@Component
struct ImageComponent {
  @State url:string="https://dogefs.s3.ladydaily.com/~/source/wallhaven/full/9d/wallhaven-9d89zw.jpg?w=2560&h=1440&fmt=webp"
  @Builder MyBuilderFunction($$ : { url: string } ){
    Row() {
      Image(`${$$.url}`)
        .width(200)
        .height(200)
    }
  }
  build() {
    this.MyBuilderFunction({ url: this.url})
  }
}


@Builder function MyGlobalBuilderImageComponent($$ : { url: string } ){
  Row() {
    Image(`${$$.url}`)
      .width(200)
      .height(200)
  }
}

```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701094367834-cc55e205-712b-4d31-a6c2-2d99643ddc88.png#averageHue=%23353e44&clientId=udba54de6-e5c9-4&from=paste&height=442&id=u927bc84a&originHeight=531&originWidth=1260&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=318376&status=done&style=none&taskId=ud3a853f2-cfe8-4e98-9e55-aea0a72ffe6&title=&width=1049.9999582767502)
点击改变图片，没有变化
### 2.1.5 @BuilderParam装饰器

- 当开发者创建了自定义组件，并想对该组件添加特定功能时，例如在自定义组件中添加一个点击跳转操作。
- 若直接在组件内嵌入事件方法，将会导致所有引入该自定义组件的地方均增加了该功能。为解决此问题，ArkUI引入了@BuilderParam装饰器，@BuilderParam用来装饰指向@Builder方法的变量，开发者可在初始化自定义组件时对此属性进行赋值，为自定义组件增加特定的功能。
- 该装饰器用于声明任意UI描述的一个元素，类似slot占位符。
```jsx
@Entry
@Component
struct Index {
  
  @Builder component1Builder() {
    Column(){
      Row() {
        Image("https://www4.bing.com//th?id=OHR.ThreeElephants_ZH-CN8708711085_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp")
          .width(200)
          .height(200)
      }
      Divider()
    }.width(200)
  }

  build() {
    Row() {
      ImageComponentSolt0({component0:MyGlobalBuilderImageComponent})
      ImageComponentSolt01({component1:this.component1Builder})
    }
    .height('100%')
  }
}





@Builder function MyGlobalBuilderImageComponent($$ : { url: string } ){
  Row() {
    Image(`${$$.url}`)
      .width(200)
      .height(200)
  }
}


@Component
struct ImageComponentSolt0 {
  // 一个插槽：内容由里面的决定(有参)
  @BuilderParam component0: ($$ : { url : string}) => void;
  build() {
    Column(){
      this.component0({url:"https://www4.bing.com//th?id=OHR.CameraSquirrel_ZH-CN3580119980_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp"})
      Divider()
    }.width(200)
  }
}


@Component
struct ImageComponentSolt01{
  // 一个插槽：内容由里面的决定(无参)
  @BuilderParam component1: () => void;
  build() {
    Column(){
      this.component1()
      Divider()
    }.width(200)
  }
}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701173736036-9ae0f3a2-06ef-4d07-8a32-99eb7ac840ff.png#averageHue=%2344534d&clientId=ue68b67e1-e56d-4&from=paste&height=654&id=uf3f71f04&originHeight=785&originWidth=1345&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=534250&status=done&style=none&taskId=ub5f1103d-6eeb-43fd-911f-c38eb3359c3&title=&width=1120.83328879542)

- @BuilderParam装饰的方法可以是有参数和无参数的两种形式，需与指向的@Builder方法类型匹配。
- @BuilderParam装饰的方法类型需要和@Builder方法类型一致。
- 在自定义组件中使用@BuilderParam装饰的属性时也可通过尾随闭包进行初始化。在初始化自定义组件时，组件后紧跟一个大括号“{}”形成尾随闭包场景。
```jsx
  build() {
    Row() {
      ImageComponentSolt0({component0:MyGlobalBuilderImageComponent})
      // ImageComponentSolt01({component1:this.component1Builder})
      ImageComponentSolt0(){
        MyGlobalBuilderImageComponent({url:"https://files.codelife.cc/wallpaper/wallspic/20231122c33j29.jpeg?x-oss-process=image/resize,limit_0,m_fill,w_2560,h_1440/quality,Q_92/format,webp"})
      }
    }
    .height('100%')
  }
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701174199246-feb2b3a6-1a69-45a2-8957-7137f8348a0b.png#averageHue=%23667f6d&clientId=ue68b67e1-e56d-4&from=paste&height=479&id=uee230997&originHeight=575&originWidth=1195&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=430177&status=done&style=none&taskId=u8c7a2acd-84dd-4418-8c25-07d81e3b8a1&title=&width=995.8332937624735)
我们来重点理解一下：@BuilderParam最重要的是对@Builder装饰器的引用
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701174378531-a520d9cf-b005-4f70-9832-396c1d1093e3.png#averageHue=%233b4246&clientId=ue68b67e1-e56d-4&from=paste&height=860&id=udef53bad&originHeight=1032&originWidth=1920&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=743132&status=done&style=none&taskId=u0563ab3a-ddd5-4a9e-af73-247babd13f9&title=&width=1599.9999364217147)
### 2.1.6 @Styles装饰器
如果每个组件的样式都需要单独设置，在开发过程中会出现大量代码在进行重复样式设置，虽然可以复制粘贴，但为了代码简洁性和后续方便维护，我们推出了可以提炼公共样式进行复用的装饰器@Styles。
@Styles装饰器可以将多条样式设置提炼成一个方法，直接在组件声明的位置调用。通过@Styles装饰器可以快速定义并复用自定义样式。用于快速定义并复用自定义样式。
在上面的案例上为他添加统一的样式，统一的高度与宽度
```jsx
@Entry
@Component
struct Index {

  @Builder component1Builder() {
    Column(){
      Row() {
        Image("https://www4.bing.com//th?id=OHR.ThreeElephants_ZH-CN8708711085_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp")
          .globalImagesStyle()
      }
      Divider()
    }.width(200)
  }

  build() {
    Row() {
      ImageComponentSolt0({component0:MyGlobalBuilderImageComponent})
      ImageComponentSolt01({component1:this.component1Builder})
      // ImageComponentSolt0(){
      //   MyGlobalBuilderImageComponent({url:"https://files.codelife.cc/wallpaper/wallspic/20231122c33j29.jpeg?x-oss-process=image/resize,limit_0,m_fill,w_2560,h_1440/quality,Q_92/format,webp"})
      // }
    }
    .height('100%')
  }
}


@Builder function MyGlobalBuilderImageComponent($$ : { url: string } ){
  Row() {
    Image(`${$$.url}`)
      .globalImagesStyle()
  }
}


@Component
struct ImageComponentSolt0 {
  // 一个插槽：内容由里面的决定(有参)
  @BuilderParam component0: ($$ : { url : string}) => void;
  build() {
    Column(){
      this.component0({url:"https://www4.bing.com//th?id=OHR.CameraSquirrel_ZH-CN3580119980_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp"})
      Divider()
    }.width(200)
  }
}


@Component
struct ImageComponentSolt01{
  // 一个插槽：内容由里面的决定(有参)
  @BuilderParam component1: () => void;
  build() {
    Column(){
      this.component1()
      Divider()
    }.width(200)
  }
}



@Styles function globalImagesStyle(){
  .width(400)
  .height(400)
  .backgroundColor(Color.Black)
}

```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701174930151-09d92cf1-16da-4e1a-9d8e-cfc355a476c8.png#averageHue=%23425b5c&clientId=ue68b67e1-e56d-4&from=paste&height=667&id=ub4c15254&originHeight=801&originWidth=1261&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=586394&status=done&style=none&taskId=u4ce3ebc0-a40c-4513-a7c2-9bd30f09014&title=&width=1050.83329157697)

- 当前@Styles仅支持[通用属性](https://developer.harmonyos.com/cn/docs/documentation/doc-references-V3/ts-universal-attributes-size-0000001428061700-V3)和[通用事件](https://developer.harmonyos.com/cn/docs/documentation/doc-references-V3/ts-universal-events-click-0000001477981153-V3)。
- @Styles方法不支持参数。
- 当让他与@Builder一样分为局部与整体，两个样式冲突时，最近原则
### 2.1.7 @Extend装饰器 
@Extend，用于扩展原生组件样式，简单来说扩展组件
我们在上一个案例上进一步扩展，改变图片的高度
```jsx
@Extend(Image) function changeHeight(h:number){
  .height(h)
}
```
```jsx
@Entry
@Component
struct Index {

  @Builder component1Builder() {
    Column(){
      Row() {
        Image("https://www4.bing.com//th?id=OHR.ThreeElephants_ZH-CN8708711085_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp")
          .globalImagesStyle()
          .changeHeight(900)
      }
      Divider()
    }.width(200)
  }

  build() {
    Row() {
      ImageComponentSolt0({component0:MyGlobalBuilderImageComponent})
      ImageComponentSolt01({component1:this.component1Builder})
      // ImageComponentSolt0(){
      //   MyGlobalBuilderImageComponent({url:"https://files.codelife.cc/wallpaper/wallspic/20231122c33j29.jpeg?x-oss-process=image/resize,limit_0,m_fill,w_2560,h_1440/quality,Q_92/format,webp"})
      // }
    }
    .height('100%')
  }
}


@Builder function MyGlobalBuilderImageComponent($$ : { url: string } ){
  Row() {
    Image(`${$$.url}`)
      .globalImagesStyle()
      .changeHeight(900)
  }
}


@Component
struct ImageComponentSolt0 {
  // 一个插槽：内容由里面的决定(有参)
  @BuilderParam component0: ($$ : { url : string}) => void;
  build() {
    Column(){
      this.component0({url:"https://www4.bing.com//th?id=OHR.CameraSquirrel_ZH-CN3580119980_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp"})
      Divider()
    }.width(200)
  }
}


@Component
struct ImageComponentSolt01{
  // 一个插槽：内容由里面的决定(有参)
  @BuilderParam component1: () => void;
  build() {
    Column(){
      this.component1()
      Divider()
    }.width(200)
  }
}



@Styles function globalImagesStyle(){
  .width(400)
  .height(400)
  .backgroundColor(Color.Black)
}


@Extend(Image) function changeHeight(h:number){
  .height(h)
}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701175375422-8a2bd615-4793-4872-a5f8-66d8e3a0671a.png#averageHue=%23364a4d&clientId=ue68b67e1-e56d-4&from=paste&height=757&id=u6e5ada17&originHeight=908&originWidth=1401&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=797449&status=done&style=none&taskId=uca9d3cf9-04bc-4b40-ae0e-f73334ebbe8&title=&width=1167.49995360772)

- @Styles不同，@Extend仅支持定义在全局，不支持在组件内部定义。
- 和@Styles不同，@Extend支持封装指定的组件的私有属性和私有事件和预定义相同组件的@Extend的方法。
- 和@Styles不同，@Extend装饰的方法支持参数，开发者可以在调用时传递参数，调用遵循TS方法传值调用。
- @Extend装饰的方法的参数可以为function，作为Event事件的句柄。
- @Extend的参数可以为[状态变量](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-state-management-overview-0000001524537145-V3)，当状态变量改变时，UI可以正常的被刷新渲染。
### 2.1.8 多态样式
stateStyles是属性方法，可以根据UI内部状态来设置样式，类似于css伪类，但语法不同。ArkUI提供以下四种状态：

- focused：获焦态。
- normal：正常态。
- pressed：按压态。
- disabled：不可用态。
```jsx
@Entry
@Component
struct MyComponent {
  @Styles normalStyle() {
    .backgroundColor(Color.Gray)
  }

  @Styles pressedStyle() {
    .backgroundColor(Color.Red)
  }

  build() {
    Column() {
      Text('Text1')
        .fontSize(50)
        .fontColor(Color.White)
        .stateStyles({
          normal: this.normalStyle,
          pressed: this.pressedStyle,
        })
    }
  }
}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701176230577-5121e331-2112-453a-ba4c-2526e98fc31b.png#averageHue=%237bb6b8&clientId=ue68b67e1-e56d-4&from=paste&height=440&id=ue1d2d4b7&originHeight=528&originWidth=1372&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=232745&status=done&style=none&taskId=u854274cf-02f5-4cca-9fe9-b0205e99941&title=&width=1143.3332879013503)

- stateStyles可以通过this绑定组件内的常规变量和状态变量
```jsx
@Entry
@Component
struct CompWithInlineStateStyles {
  @State focusedColor: Color = Color.Red;
  normalColor: Color = Color.Green

  build() {
    Button('clickMe').height(100).width(100)
      .stateStyles({
        normal: {
          .backgroundColor(this.normalColor)
        },
        focused: {
          .backgroundColor(this.focusedColor)
        }
      })
      .onClick(() => {
        this.focusedColor = Color.Pink
      })
      .margin('30%')
  }
}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701176326244-91bfe99e-6df7-41ba-8ea6-915dc3b9ae24.png#averageHue=%235f837d&clientId=ue68b67e1-e56d-4&from=paste&height=519&id=u6ccfeba9&originHeight=623&originWidth=1259&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=268814&status=done&style=none&taskId=u525bf745-5a25-48a0-bd6e-5f056ccbd5a&title=&width=1049.1666249765308)
Button默认获焦显示红色，点击事件触发后，获焦态变为粉色
## 2.2 状态管理

- 在声明式UI编程框架中，UI是程序状态的运行结果，用户构建了一个UI模型，其中应用的运行时的状态是参数。
- 当参数改变时，UI作为返回结果，也将进行对应的改变，这些运行时的状态变化所带来的UI的重新渲染，在ArkUI中统称为状态管理机制。
- **自定义组件拥有变量，变量必须被装饰器装饰才可以成为状态变量，状态变量的改变会引起UI的渲染刷新。如果不使用状态变量，UI只能在初始化时渲染，后续将不会再刷新。** 下图展示了State和View（UI）之间的关系。

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701176650072-e2150863-18d4-4fc8-b0b2-5c60b760eb26.png#averageHue=%23f1f7fc&clientId=u70f71004-ceb3-4&from=paste&id=u81c68f88&originHeight=126&originWidth=587&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u6474d7e9-70ee-46b3-ab1c-fddd994b065&title=)

- View(UI)：UI渲染，指将build方法内的UI描述和@Builder装饰的方法内的UI描述映射到界面。
- State：状态，指驱动UI更新的数据。用户通过触发组件的事件方法，改变状态数据。状态数据的改变，引起UI的重新渲染。
### 2.2.1 基本概念

- 状态变量：被状态装饰器装饰的变量，状态变量值的改变会引起UI的渲染更新。示例：@State num: number = 1,其中，@State是状态装饰器，num是状态变量。
- 常规变量：没有被状态装饰器装饰的变量，通常应用于辅助计算。它的改变永远不会引起UI的刷新。以下示例中increaseBy变量为常规变量。
- 数据源/同步源：状态变量的原始来源，可以同步给不同的状态数据。通常意义为父组件传给子组件的数据。以下示例中数据源为count: 1。
- 命名参数机制：父组件通过指定参数传递给子组件的状态变量，为父子传递同步参数的主要手段。示例：CompA: ({ aProp: this.aProp })。
- 从父组件初始化：父组件使用命名参数机制，将指定参数传递给子组件。子组件初始化的默认值在有父组件传值的情况下，会被覆盖。
- 始化子节点：父组件中状态变量可以传递给子组件，初始化子组件对应的状态变量。示例同上。
- 本地初始化：在变量声明的时候赋值，作为变量的默认值。示例：@State count: number = 0。
### 2.2.2 状态管管理
![bbeea5ea-c270-4a5b-89e9-3cf611d4ea98.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701238760518-a0eedca9-3aa1-4fdc-bd6a-e0a708da651a.png#averageHue=%23fafafa&clientId=u48bacad9-6cf1-4&from=paste&height=410&id=u8cf14df5&originHeight=512&originWidth=848&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=93648&status=done&style=none&taskId=ubfda6520-b9f2-460a-a65c-6519f568836&title=&width=678.4)
ArkUI提供了多种装饰器，通过使用这些装饰器，状态变量不仅可以观察在组件内的改变，还可以在不同组件层级间传递，比如父子组件、跨组件层级，也可以观察全局范围内的变化。根据状态变量的影响范围，将所有的装饰器可以大致分为：

- 管理组件拥有状态的装饰器：组件级别的状态管理，可以观察组件内变化，和不同组件层级的变化，但需要唯一观察同一个组件树上，即同一个页面内。
- 管理应用拥有状态的装饰器：应用级别的状态管理，可以观察不同页面，甚至不同UIAbility的状态变化，是应用内全局的状态管理。

从数据的传递形式和同步类型层面看，装饰器也可分为：

- 只读的单向传递；
- 可变更的双向传递。
### 2.2.3 基本装饰器

- @State：@State装饰的变量拥有其所属组件的状态，可以作为其子组件单向和双向同步的数据源。当其数值改变时，会引起相关组件的渲染刷新。
- @Prop：@Prop装饰的变量可以和父组件建立单向同步关系，@Prop装饰的变量是可变的，但修改不会同步回父组件。
- @Link：@Link装饰的变量和父组件构建双向同步关系的状态变量，父组件会接受来自@Link装饰的变量的修改的同步，父组件的更新也会同步给@Link装饰的变量。
- @Provide/@Consume：@Provide/@Consume装饰的变量用于跨组件层级（多层组件）同步状态变量，可以不需要通过参数命名机制传递，通过alias（别名）或者属性名绑定。
- @Observed：@Observed装饰class，需要观察多层嵌套场景的class需要被@Observed装饰。单独使用@Observed没有任何作用，需要和@ObjectLink、@Prop连用。
- @ObjectLink：@ObjectLink装饰的变量接收@Observed装饰的class的实例，应用于观察多层嵌套场景，和父组件的数据源构建双向同步。
### 2.2.3 管理组件状态
#### 2.2.3.1 @State装饰器：组件内状态

- @State装饰的变量，或称为状态变量，一旦变量拥有了状态属性，就和自定义组件的渲染绑定起来。当状态改变时，UI会发生对应的渲染改变。
- 在状态变量相关装饰器中，@State是最基础的，使变量拥有状态属性的装饰器，它也是大部分状态变量的数据源。
- @State装饰的变量，与声明式范式中的其他被装饰变量一样，是私有的，只能从组件内部访问，在声明时必须指定其类型和本地初始化。初始化也可选择使用命名参数机制从父组件完成初始化。

我们来个加法计数器案例：
```jsx
@Entry
  @Component
  struct Index {
    @State count:number=0

    build() {
      Row() {
        Column() {
          Text("总数："+this.count)
          Divider()
          Button("加法").width(100).height(30).margin(10).onClick(()=>{
            this.count ++;
          })
          Divider()
          Button("减法").width(100).height(30).margin(10).onClick(()=>{
            this.count --;
          })
        }
        .width('100%')
      }
      .height('100%')
    }
  }
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701258347889-270ca23f-955c-4c47-b3a7-e110dd29b744.png#averageHue=%2384b065&clientId=u1d7a3292-3162-4&from=paste&height=623&id=u754f13bf&originHeight=779&originWidth=1484&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=109874&status=done&style=none&taskId=u876b4688-2610-4c1f-95a3-99d2144e276&title=&width=1187.2)
**规则说明**

| **@State变量装饰器** | **说明** |
| --- | --- |
| 装饰器参数 | 无 |
| 同步类型 | 不与父组件中任何类型的变量同步。 |
| 允许装饰的变量类型 | Object、class、string、number、boolean、enum类型，以及这些类型的数组。嵌套类型的场景请参考[观察变化](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-state-0000001474017162-V3#section135631413173517)。
类型必须被指定。
不支持any，不支持简单类型和复杂类型的联合类型，不允许使用undefined和null。
**说明** |
| 被装饰变量的初始值 | 必须本地初始化。 |

其他内容参考官网：内容限制，使用能够引起UI变化条件
#### 2.2.3.2 @Prop装饰器：父子单向同步

- @Prop装饰的变量可以和父组件建立单向的同步关系。@Prop装饰的变量是可变的，但是变化不会同步回其父组件。
- @Prop变量允许在本地修改，但修改后的变化不会同步回父组件。
- 当父组件中的数据源更改时，与之相关的@Prop装饰的变量都会自动更新。如果子组件已经在本地修改了@Prop装饰的相关变量值，而在父组件中对应的@State装饰的变量被修改后，子组件本地修改的@Prop装饰的相关变量值将被覆盖。
```jsx
@Entry
@Component
struct StateManagement {
  // @State 必须初始化
  @State name: string = '帝心'

  build() {
    Row() {
      Column() {
        Text(this.name).StateManagement_textSty()
        Button('修改数据').StateManagement_btnStyle(() => {
          this.name = this.name === '帝心' ? '庄生' : '帝心'
        })
        Divider()
        StateManagement_prop({ content_prop: this.name })
        Divider()
  
      }
      .width('100%')
    }
    .height('100%')
  }
}

// 存放一个 @Prop 装饰的状态数据。方便父子组件之间进行数据传递和同步  State ----> prop
@Component
struct StateManagement_prop {
  @Prop content_prop: string

  build() {
    Column() {
      Text('prop:' + this.content_prop).StateManagement_textSty()
      Button('修改prop数据').StateManagement_btnStyle(() => {
        this.content_prop = 'HarmonyOS4.0'
      })
    }
  }
}



// 同样的样式记得复用 text
@Extend(Text) function StateManagement_textSty() {
  .fontSize(30)
  .fontWeight(FontWeight.Bold)
  .fontColor(Color.Green)
}

// button样式
@Extend(Button) function StateManagement_btnStyle(click: Function) {
  .fontSize(30)
  .onClick(() => {
    click()
  })
}
```
![动画.gif](https://cdn.nlark.com/yuque/0/2023/gif/12426173/1701259616121-390e62a4-75e5-4a0f-98c3-36a4fd12cf3e.gif#averageHue=%232e312d&clientId=u1d7a3292-3162-4&from=paste&height=785&id=u207ea707&originHeight=981&originWidth=1905&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=904198&status=done&style=none&taskId=uf067f3af-cffd-4e60-b0a5-96a183a5eea&title=&width=1524)

- 我们可以通过观察，当我们修改父组件，子组件的值发生变化，但是子组件的值发生变化，不会影响父组件的值的变化

**限制条件**

- @Prop修饰复杂类型时是深拷贝，在拷贝的过程中除了基本类型、Map、Set、Date、Array外，都会丢失类型。
- @Prop装饰器不能在@Entry装饰的自定义组件中使用。

#### 2.2.3.3 @Link装饰器：父子双向同步

- 子组件中被@Link装饰的变量与其父组件中对应的数据源建立双向数据绑定。
- @Link装饰的变量与其父组件中的数据源共享相同的值。

```jsx
@Entry
@Component
struct StateManagement {
  // @State 必须初始化： 本地初始化
  @State name: string = '我是初始化本地数据'

  build() {
    Row() {
      Column() {
        Text(this.name).StateManagement_textSty()
        Button('修改数据').StateManagement_btnStyle(() => {
          this.name = this.name === '我是初始化本地数据' ? '我是初始化本地数据01' : '我是初始化本地数据02'
        })
        Divider()
        StateManagement_prop({ content_prop: this.name })
        Divider()
        StateManagement_Link({ content_link: $name })

      }
      .width('100%')
    }
    .height('100%')
  }
}

// 存放一个 @Prop 装饰的状态数据。方便父子组件之间进行数据传递和同步  State ----> prop
@Component
struct StateManagement_prop {
  @Prop content_prop: string

  build() {
    Column() {
      Text('prop:' + this.content_prop).StateManagement_textSty()
      Button('修改prop数据').StateManagement_btnStyle(() => {
        this.content_prop = 'HarmonyOS4.0'
      })
    }
  }
}


@Component
struct StateManagement_Link {
  @Link content_link: string
  build() {
    Column() {
      Text('link:' + this.content_link).StateManagement_textSty()
      Button('修改Link数据').StateManagement_btnStyle(() => {
        this.content_link = 'HarmonyOS4.0---Link'
      })
    }
  }
}


// 同样的样式记得复用 text
@Extend(Text) function StateManagement_textSty() {
  .fontSize(30)
  .fontWeight(FontWeight.Bold)
  .fontColor(Color.Green)
}

// button样式
@Extend(Button) function StateManagement_btnStyle(click: Function) {
  .fontSize(30)
  .onClick(() => {
    click()
  })
}
```

![动画.gif](https://cdn.nlark.com/yuque/0/2023/gif/12426173/1701260571338-03acab2a-b0c7-443e-9daa-7a84299d404a.gif#averageHue=%233f484f&clientId=u1d7a3292-3162-4&from=paste&height=779&id=uea1ef0d4&originHeight=974&originWidth=1905&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=964225&status=done&style=none&taskId=u37d7c71e-2de7-4e42-a792-069b5fb51ae&title=&width=1524)
我们可以看到使用link 实现了双向绑定
**限制条件**

- @Link装饰器不能在@Entry装饰的自定义组件中使用。

**规则**

| **@Link变量装饰器** | **说明** |
| --- | --- |
| 装饰器参数 | 无 |
| 同步类型 | 双向同步。
父组件中@State, @StorageLink和@Link 和子组件@Link可以建立双向数据同步，反之亦然。 |
| 允许装饰的变量类型 | Object、class、string、number、boolean、enum类型，以及这些类型的数组。嵌套类型的场景请参考[观察变化](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-link-0000001524297305-V3#section7141136115513)。
类型必须被指定，且和双向绑定状态变量的类型相同。
不支持any，不支持简单类型和复杂类型的联合类型，不允许使用undefined和null。
**说明** |
| 被装饰变量的初始值 | 无，禁止本地初始化。 |

#### 2.2.3.4 @Provide装饰器和@Consume装饰器：同级组件通信
@Provide/@Consume装饰的状态变量有以下特性：

- @Provide装饰的状态变量自动对其所有后代组件可用，即该变量被“provide”给他的后代组件。由此可见，@Provide的方便之处在于，开发者不需要多次在组件之间传递变量。
- 后代通过使用@Consume去获取@Provide提供的变量，建立在@Provide和@Consume之间的双向数据同步，与@State/@Link不同的是，前者可以在多层级的父子组件之间传递。
- @Provide和@Consume可以通过相同的变量名或者相同的变量别名绑定，变量类型必须相同。
- @Provide和@Consume通过相同的变量名或者相同的变量别名绑定时，@Provide修饰的变量和@Consume修饰的变量是一对多的关系。不允许在同一个自定义组件内，包括其子组件中声明多个同名或者同别名的@Provide装饰的变量。
```jsx
@Component
struct CompD {
  @Consume reviewVotes: number;
  @State url: string="组件"
  build() {
    Column() {
      Text(`reviewVotes(${this.url})`)
      Button(`reviewVotes(${this.reviewVotes}), give +1`)
        .onClick(() => this.reviewVotes += 1)
    }
    .width('50%')
  }
}



@Entry
@Component
struct CompA {
  @Provide reviewVotes: number = 0;

  build() {
    Column() {
      Button(`reviewVotes(${this.reviewVotes}), give +1`)
        .onClick(() => this.reviewVotes += 1)
      CompD({url:"组件一"})
      Divider()
      CompD({url:"组件二"})
    }
  }
}
```
![动画.gif](https://cdn.nlark.com/yuque/0/2023/gif/12426173/1701262046220-3766c624-91d3-4edb-9c7c-094ab06a9bdf.gif#averageHue=%23848984&clientId=u1d7a3292-3162-4&from=paste&height=779&id=ufd5c2e75&originHeight=974&originWidth=1905&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=392290&status=done&style=none&taskId=ub9217880-e159-49e7-b0f7-1fdbb32272a&title=&width=1524)
我们可以发现同级组件中发生变化相互影响
**规则**
@State的规则同样适用于@Provide，差异为@Provide还作为多层后代的同步源。

| **@Provide变量装饰器** | **说明** |
| --- | --- |
| 装饰器参数 | 别名：常量字符串，可选。
如果指定了别名，则通过别名来绑定变量；如果未指定别名，则通过变量名绑定变量。 |
| 同步类型 | 双向同步。
从@Provide变量到所有@Consume变量以及相反的方向的数据同步。双向同步的操作与@State和@Link的组合相同。 |
| 允许装饰的变量类型 | Object、class、string、number、boolean、enum类型，以及这些类型的数组。嵌套类型的场景请参考[观察变化](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-provide-and-consume-0000001473857338-V3#section7141136115513)。
不支持any，不支持简单类型和复杂类型的联合类型，不允许使用undefined和null。
必须指定类型。@Provide变量的@Consume变量的类型必须相同。
**说明** |
| 被装饰变量的初始值 | 必须指定。 |

| **@Consume变量装饰器** | **说明** |
| --- | --- |
| 装饰器参数 | 别名：常量字符串，可选。
如果提供了别名，则必须有@Provide的变量和其有相同的别名才可以匹配成功；否则，则需要变量名相同才能匹配成功。 |
| 同步类型 | 双向：从@Provide变量（具体请参见@Provide）到所有@Consume变量，以及相反的方向。双向同步操作与@State和@Link的组合相同。 |
| 允许装饰的变量类型 | Object、class、string、number、boolean、enum类型，以及这些类型的数组。嵌套类型的场景请参考[观察变化](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-provide-and-consume-0000001473857338-V3#section7141136115513)。
不支持any，不允许使用undefined和null。
必须指定类型。@Provide变量的@Consume变量的类型必须相同。
**说明** |
| 被装饰变量的初始值 | 无，禁止本地初始化。 |

#### 2.2.3.5 @Observed装饰器和@ObjectLink装饰器：嵌套类对象属性变化

- 上文所述的装饰器仅能观察到第一层的变化，但是在实际应用开发中，应用会根据开发需要，封装自己的数据模型。对于多层嵌套的情况，比如二维数组，或者数组项class，或者class的属性是class，他们的第二层的属性变化是无法观察到的。这就引出了@Observed/@ObjectLink装饰器。
- @ObjectLink和@Observed类装饰器用于在涉及嵌套对象或数组的场景中进行双向数据同步：
- 被@Observed装饰的类，可以被观察到属性的变化；
- 子组件中@ObjectLink装饰器装饰的状态变量用于接收@Observed装饰的类的实例，和父组件中对应的状态变量建立双向数据绑定。这个实例可以是数组中的被@Observed装饰的项，或者是class object中的属性，这个属性同样也需要被@Observed装饰。
- 单独使用@Observed是没有任何作用的，需要搭配@ObjectLink或者@Prop使用。
```jsx
@Component
struct CompD {
  @ObjectLink b: ClassB
  build() {
    Column() {
      Text("@Component"+this.b.a.c)
      Text("@Component"+this.b.b)
    }
    .width('50%')
  }
}


@Entry
@Component
struct CompA {
  @State b: ClassB=new ClassB(new ClassA(1),100)
  build() {
    Column() {
      CompD({b:this.b})
      Divider()
     Button("修改值").width(100).height(30).margin(10).onClick(()=>{
       this.b=new ClassB(new ClassA(200),300)
     })
    }
  }
}


class ClassA {
  public c: number;
  constructor(c: number) {
    this.c = c;
  }
}


@Observed
class ClassB {
  public a: ClassA;
  public b: number;
  constructor(a: ClassA, b: number) {
    this.a = a;
    this.b = b;
  }
}
```
![动画.gif](https://cdn.nlark.com/yuque/0/2023/gif/12426173/1701264345912-9e184296-cb5e-4456-b747-af4be0eaac32.gif#averageHue=%23344056&clientId=u1d7a3292-3162-4&from=paste&height=778&id=u9379807d&originHeight=972&originWidth=1905&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=260550&status=done&style=none&taskId=u3b02f1ed-8d7c-4d58-9d42-4c1aed2d321&title=&width=1524)
我们可以看到当我们点击修改时，嵌套的值发生了变化
**限制条件**

- 使用@Observed装饰class会改变class原始的原型链，@Observed和其他类装饰器装饰同一个class可能会带来问题。
- @ObjectLink装饰器不能在@Entry装饰的自定义组件中使用。

**规则**

| **@Observed类装饰器** | **说明** |
| --- | --- |
| 装饰器参数 | 无 |
| 类装饰器 | 装饰class。需要放在class的定义前，使用new创建类对象。 |

| **@ObjectLink变量装饰器** | **说明** |
| --- | --- |
| 装饰器参数 | 无 |
| 同步类型 | 不与父组件中的任何类型同步变量。 |
| 允许装饰的变量类型 | 必须为被@Observed装饰的class实例，必须指定类型。
不支持简单类型，可以使用@Prop。
@ObjectLink的属性是可以改变的，但是变量的分配是不允许的，也就是说这个装饰器装饰变量是只读的，不能被改变。 |
| 被装饰变量的初始值 | 不允许。 |

### 2.2.4 应用组件状态
如果开发者要实现应用级的，或者多个页面的状态数据共享，就需要用到应用级别的状态管理的概念。ArkTS根据不同特性，提供了多种应用状态管理的能力：

- [LocalStorage](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-localstorage-0000001524537149-V3)：页面级UI状态存储，通常用于[UIAbility](https://developer.harmonyos.com/cn/docs/documentation/doc-references-V3/js-apis-app-ability-uiability-0000001493584184-V3)内、页面间的状态共享。
- [AppStorage](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-appstorage-0000001524417209-V3)：特殊的单例LocalStorage对象，由UI框架在应用程序启动时创建，为应用程序UI状态属性提供中央存储；
- [PersistentStorage](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-persiststorage-0000001474017166-V3)：持久化存储UI状态，通常和AppStorage配合使用，选择AppStorage存储的数据写入磁盘，以确保这些属性在应用程序重新启动时的值与应用程序关闭时的值相同；
- [Environment](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-environment-0000001473537710-V3)：应用程序运行的设备的环境参数，环境参数会同步到AppStorage中，可以和AppStorage搭配使用。
#### 2.2.4.1 LocalStorage：页面级UI状态存储

- LocalStorage是页面级的UI状态存储，通过@Entry装饰器接收的参数可以在页面内共享同一个LocalStorage实例。LocalStorage也可以在UIAbility内，页面间共享状态。
- 应用程序可以创建多个LocalStorage实例，LocalStorage实例可以在页面内共享，也可以通过GetShared接口，获取在UIAbility里创建的GetShared，实现跨页面、UIAbility内共享。
- 组件树的根节点，即被@Entry装饰的@Component，可以被分配一个LocalStorage实例，此组件的所有子组件实例将自动获得对该LocalStorage实例的访问权限；
- 被@Component装饰的组件最多可以访问一个LocalStorage实例和[AppStorage](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-appstorage-0000001524417209-V3)，未被@Entry装饰的组件不可被独立分配LocalStorage实例，只能接受父组件通过@Entry传递来的LocalStorage实例。一个LocalStorage实例在组件树上可以被分配给多个组件。
- LocalStorage中的所有属性都是可变的。
```jsx
// 创建新实例并使用给定对象初始化
let storage = new LocalStorage({ 'PropA': 47 });
// 使LocalStorage可从@Component组件访问
@Entry(storage)
@Component
struct CompA {
  // @LocalStorageProp变量装饰器与LocalStorage中的'PropA'属性建立单向绑定
  @LocalStorageProp('PropA') storProp1: number = 1;

  build() {
    Column() {
      Text("默认数字："+this.storProp1).StateManagement_textSty()
      Button('修改数据').StateManagement_btnStyle(() => {
        this.storProp1 += 1
      })
      Divider()
      StateManagement_prop()
      Divider()
      StateManagement_link()

    }
  }
}



// 存放一个 @Prop 装饰的状态数据。方便父子组件之间进行数据传递和同步  State ----> prop
@Component
struct StateManagement_prop {
  // @LocalStorageProp变量装饰器与LocalStorage中的'PropA'属性建立单向绑定
  @LocalStorageProp('PropA') storProp2: number = 2;
  build() {
    Column() {
      Text('prop:' + this.storProp2).StateManagement_textSty()
      Button('修改prop数据').StateManagement_btnStyle(() => {
        this.storProp2++;
      })
    }
  }
}


@Component
struct StateManagement_link {
  // @LocalStorageProp变量装饰器与LocalStorage中的'PropA'属性建立单向绑定
  @LocalStorageLink('PropA') storProp2: number = 2;
  build() {
    Column() {
      Text('link:' + this.storProp2).StateManagement_textSty()
      Button('修改link数据').StateManagement_btnStyle(() => {
        this.storProp2++;
      })
    }
  }
}




// 同样的样式记得复用 text
@Extend(Text) function StateManagement_textSty() {
  .fontSize(30)
  .fontWeight(FontWeight.Bold)
  .fontColor(Color.Green)
}

// button样式
@Extend(Button) function StateManagement_btnStyle(click: Function) {
  .fontSize(30)
  .onClick(() => {
    click()
  })
}
```
![动画.gif](https://cdn.nlark.com/yuque/0/2023/gif/12426173/1701345414614-c3ac60b0-890b-481f-9da2-6a005e6ade0f.gif#averageHue=%233c454c&clientId=ua1c2a281-ea59-4&from=paste&height=778&id=u86274e52&originHeight=972&originWidth=1905&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=873261&status=done&style=none&taskId=u436968a6-c9bd-4293-a413-c117926a42a&title=&width=1524)

- 我们可以发现当我们修改prop 数据，自身发生变化
- 修改link 是，全部数据发生变化

**规则**

| **@LocalStorageProp变量装饰器** | **说明** |
| --- | --- |
| 装饰器参数 | key：常量字符串，必填（字符串需要有引号）。 |
| 允许装饰的变量类型 | Object、class、string、number、boolean、enum类型，以及这些类型的数组。嵌套类型的场景请参考[观察变化和行为表现](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-localstorage-0000001524537149-V3#section95308721319)。
类型必须被指定，且必须和LocalStorage中对应属性相同。不支持any，不允许使用undefined和null。 |
| 同步类型 | 单向同步：从LocalStorage的对应属性到组件的状态变量。组件本地的修改是允许的，但是LocalStorage中给定的属性一旦发生变化，将覆盖本地的修改。 |
| 被装饰变量的初始值 | 必须指定，如果LocalStorage实例中不存在属性，则作为初始化默认值，并存入LocalStorage中。 |

| **@LocalStorageLink变量装饰器** | **说明** |
| --- | --- |
| 装饰器参数 | key：常量字符串，必填（字符串需要有引号）。 |
| 允许装饰的变量类型 | Object、class、string、number、boolean、enum类型，以及这些类型的数组。嵌套类型的场景请参考[观察变化和行为表现](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-localstorage-0000001524537149-V3#section0207123614516)。
类型必须被指定，且必须和LocalStorage中对应属性相同。不支持any，不允许使用undefined和null。 |
| 同步类型 | 双向同步：从LocalStorage的对应属性到自定义组件，从自定义组件到LocalStorage对应属性。 |
| 被装饰变量的初始值 | 必须指定，如果LocalStorage实例中不存在属性，则作为初始化默认值，并存入LocalStorage中。 |

#### 2.2.4.2 AppStorage：应用全局的UI状态存储

- AppStorage是应用全局的UI状态存储，是和应用的进程绑定的，由UI框架在应用程序启动时创建，为应用程序UI状态属性提供中央存储。
- 和AppStorage不同的是，LocalStorage是页面级的，通常应用于页面内的数据共享。而AppStorage是应用级的全局状态共享，还相当于整个应用的“中枢”，[持久化数据PersistentStorage](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-persiststorage-0000001474017166-V3)和[环境变量Environment](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-environment-0000001473537710-V3)都是通过和AppStorage中转，才可以和UI交互。
- AppStorage是在应用启动的时候会被创建的单例。它的目的是为了提供应用状态数据的中心存储，这些状态数据在应用级别都是可访问的。AppStorage将在应用运行过程保留其属性。属性通过唯一的键字符串值访问。
- AppStorage可以和UI组件同步，且可以在应用业务逻辑中被访问。
- AppStorage中的属性可以被双向同步，数据可以是存在于本地或远程设备上，并具有不同的功能，比如数据持久化（详见[PersistentStorage](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-persiststorage-0000001474017166-V3)）。这些数据是通过业务逻辑中实现，与UI解耦，如果希望这些数据在UI中使用，需要用到[@StorageProp](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-appstorage-0000001524417209-V3#section676113134317)和[@StorageLink](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-appstorage-0000001524417209-V3#section84115526424)。

> @StorageProp

- @StorageProp(key)是和AppStorage中key对应的属性建立单向数据同步，我们允许本地改变的发生，但是对于@StorageProp，本地的修改永远不会同步回AppStorage中，相反，如果AppStorage给定key的属性发生改变，改变会被同步给@StorageProp，并覆盖掉本地的修改。
```jsx
AppStorage.SetOrCreate('PropC', 10086);
// 创建新实例并使用给定对象初始化
let storage = new LocalStorage({ 'PropA': 47 });
// 使LocalStorage可从@Component组件访问
@Entry(storage)
@Component
struct CompA {
  // 全局 @StorageProp与AppStorage进行绑定
  @StorageProp('PropC') storLink: number = 1;
  // @LocalStorageProp变量装饰器与LocalStorage中的'PropA'属性建立单向绑定
  @LocalStorageProp('PropA') storProp1: number = 1;

  build() {
    Column() {
      Text("默认数字："+this.storProp1).StateManagement_textSty()
      Button('修改数据页面ui').StateManagement_btnStyle(() => {
        this.storProp1 += 1
      })
      Text("默认数字："+this.storLink).StateManagement_textSty()
      Button('修改数据全局ui').StateManagement_btnStyle(() => {
        this.storLink += 1
      })

    }
  }
}



// 存放一个 @Prop 装饰的状态数据。方便父子组件之间进行数据传递和同步  State ----> prop
@Component
struct StateManagement_prop {
  // @LocalStorageProp变量装饰器与LocalStorage中的'PropA'属性建立单向绑定
  @LocalStorageProp('PropA') storProp2: number = 2;
  build() {
    Column() {
      Text('prop:' + this.storProp2).StateManagement_textSty()
      Button('修改prop数据').StateManagement_btnStyle(() => {
        this.storProp2++;
      })
    }
  }
}


@Component
struct StateManagement_link {
  // @LocalStorageProp变量装饰器与LocalStorage中的'PropA'属性建立单向绑定
  @LocalStorageLink('PropA') storProp2: number = 2;
  build() {
    Column() {
      Text('link:' + this.storProp2).StateManagement_textSty()
      Button('修改link数据').StateManagement_btnStyle(() => {
        this.storProp2++;
      })
    }
  }
}




// 同样的样式记得复用 text
@Extend(Text) function StateManagement_textSty() {
  .fontSize(30)
  .fontWeight(FontWeight.Bold)
  .fontColor(Color.Green)
}

// button样式
@Extend(Button) function StateManagement_btnStyle(click: Function) {
  .fontSize(30)
  .onClick(() => {
    click()
  })
}
```
![动画.gif](https://cdn.nlark.com/yuque/0/2023/gif/12426173/1701429214054-1bc975d7-1474-44d4-9ea9-a284818d7211.gif#averageHue=%233e454c&clientId=u97119c43-7307-4&from=paste&height=778&id=u5f0ee80a&originHeight=972&originWidth=1905&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=661017&status=done&style=none&taskId=ue36a3792-7130-4f02-a4cf-de007a2ca3c&title=&width=1524)
我们可以看到一个全局的修改，一个是页面的修改并不会互相影响
**规则**

| **@StorageProp变量装饰器** | **说明** |
| --- | --- |
| 装饰器参数 | key：常量字符串，必填（字符串需要有引号）。 |
| 允许装饰的变量类型 | Object class、string、number、boolean、enum类型，以及这些类型的数组。嵌套类型的场景请参考[观察变化和行为表现](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-appstorage-0000001524417209-V3#section8970810185617)。
类型必须被指定，且必须和LocalStorage中对应属性相同。不支持any，不允许使用undefined和null。 |
| 同步类型 | 单向同步：从AppStorage的对应属性到组件的状态变量。
组件本地的修改是允许的，但是AppStorage中给定的属性一旦发生变化，将覆盖本地的修改。 |
| 被装饰变量的初始值 | 必须指定，如果AppStorage实例中不存在属性，则作为初始化默认值，并存入AppStorage中。 |

> @StorageLink

1. 本地修改发生，该修改会被写回AppStorage中；
2. AppStorage中的修改发生后，该修改会被同步到所有绑定AppStorage对应key的属性上，包括单向（@StorageProp和通过Prop创建的单向绑定变量）、双向（@StorageLink和通过Link创建的双向绑定变量）变量和其他实例（比如PersistentStorage）。
```jsx
AppStorage.SetOrCreate('PropC', 10086);
// 创建新实例并使用给定对象初始化
let storage = new LocalStorage({ 'PropA': 47 });
// 使LocalStorage可从@Component组件访问
@Entry(storage)
@Component
struct CompA {
  // 全局 @StorageProp与AppStorage进行绑定
  @StorageProp('PropC') storLink: number = 1;
  // @LocalStorageProp变量装饰器与LocalStorage中的'PropA'属性建立单向绑定
  @LocalStorageProp('PropA') storProp1: number = 1;
  @StorageLink("PropC") storLink1: number = 1;
  build() {
    Column() {
      Text("默认数字："+this.storProp1).StateManagement_textSty()
      Button('修改数据页面ui').StateManagement_btnStyle(() => {
        this.storProp1 += 1
      })
      Text("默认数字："+this.storLink).StateManagement_textSty()
      Button('修改数据全局ui-prop').StateManagement_btnStyle(() => {
        this.storLink += 1
      })
      Text("默认数字："+this.storLink1).StateManagement_textSty()
      Button('修改数据全局ui-link').StateManagement_btnStyle(() => {
        this.storLink1 += 1
      })
      Divider()
      StateManagement_link()



    }
  }
}



@Component
struct StateManagement_link {
  // @LocalStorageProp变量装饰器与LocalStorage中的'PropA'属性建立单向绑定
  @StorageLink('PropC') storProp2: number = 2;
  build() {
    Column() {
      Text('link:' + this.storProp2).StateManagement_textSty()
      Button('修改link数据').StateManagement_btnStyle(() => {
        this.storProp2++;
      })
    }
  }
}



// 同样的样式记得复用 text
@Extend(Text) function StateManagement_textSty() {
  .fontSize(30)
  .fontWeight(FontWeight.Bold)
  .fontColor(Color.Green)
}

// button样式
@Extend(Button) function StateManagement_btnStyle(click: Function) {
  .fontSize(30)
  .onClick(() => {
    click()
  })
}
```
![动画.gif](https://cdn.nlark.com/yuque/0/2023/gif/12426173/1701429729180-085e544b-5562-48fc-97c1-43c1c643df8a.gif#averageHue=%236bac6a&clientId=u97119c43-7307-4&from=paste&height=778&id=u7769a3ba&originHeight=972&originWidth=1905&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=1369719&status=done&style=none&taskId=u3459f89f-52cc-48c6-ae66-4c8182aaeb5&title=&width=1524)
我们可以观察到当我们点击全局修改后，使用了同一个Key的值进行修改
**规则**

| **@StorageLink变量装饰器** | **说明** |
| --- | --- |
| 装饰器参数 | key：常量字符串，必填（字符串需要有引号）。 |
| 允许装饰的变量类型 | Object、class、string、number、boolean、enum类型，以及这些类型的数组。嵌套类型的场景请参考[观察变化和行为表现](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-appstorage-0000001524417209-V3#section2040243611596)。
类型必须被指定，且必须和AppStorage中对应属性相同。不支持any，不允许使用undefined和null。 |
| 同步类型 | 双向同步：从AppStorage的对应属性到自定义组件，从自定义组件到AppStorage对应属性。 |
| 被装饰变量的初始值 | 必须指定，如果AppStorage实例中不存在属性，则作为初始化默认值，并存入AppStorage中。 |

#### 2.2.4.3 PersistentStorage：持久化存储UI状态

- PersistentStorage是应用程序中的可选单例对象。此对象的作用是持久化存储选定的AppStorage属性，以确保这些属性在应用程序重新启动时的值与应用程序关闭时的值相同。
- PersistentStorage将选定的AppStorage属性保留在设备磁盘上。应用程序通过API，以决定哪些AppStorage属性应借助PersistentStorage持久化。UI和业务逻辑不直接访问PersistentStorage中的属性，所有属性访问都是对AppStorage的访问，AppStorage中的更改会自动同步到PersistentStorage。
```jsx
AppStorage.SetOrCreate('PropC', 10086);
// 创建新实例并使用给定对象初始化
let storage = new LocalStorage({ 'PropA': 47 });
PersistentStorage.PersistProp('PropB', 11100215);
// 使LocalStorage可从@Component组件访问
@Entry(storage)
@Component
struct CompA {
  // 全局 @StorageProp与AppStorage进行绑定
  @StorageProp('PropC') storLink: number = 1;
  // @LocalStorageProp变量装饰器与LocalStorage中的'PropA'属性建立单向绑定
  @LocalStorageProp('PropA') storProp1: number = 1;
  @StorageLink("PropC") storLink1: number = 1;
  build() {
    Column() {
      Text("默认数字："+this.storProp1).StateManagement_textSty()
      Button('修改数据页面ui').StateManagement_btnStyle(() => {
        this.storProp1 += 1
      })
      Text("默认数字："+this.storLink).StateManagement_textSty()
      Button('修改数据全局ui-prop').StateManagement_btnStyle(() => {
        this.storLink += 1
      })
      Text("默认数字："+this.storLink1).StateManagement_textSty()
      Button('修改数据全局ui-link').StateManagement_btnStyle(() => {
        this.storLink1 += 1
      })
      Divider()
      StateManagement_link()
      Divider()
      Text(AppStorage.Get('PropB')).StateManagement_textSty()



    }
  }
}






@Component
struct StateManagement_link {
  // @LocalStorageProp变量装饰器与LocalStorage中的'PropA'属性建立单向绑定
  @StorageLink('PropC') storProp2: number = 2;
  build() {
    Column() {
      Text('link:' + this.storProp2).StateManagement_textSty()
      Button('修改link数据').StateManagement_btnStyle(() => {
        this.storProp2++;
      })
    }
  }
}




// 同样的样式记得复用 text
@Extend(Text) function StateManagement_textSty() {
  .fontSize(30)
  .fontWeight(FontWeight.Bold)
  .fontColor(Color.Green)
}

// button样式
@Extend(Button) function StateManagement_btnStyle(click: Function) {
  .fontSize(30)
  .onClick(() => {
    click()
  })
}
```
![动画.gif](https://cdn.nlark.com/yuque/0/2023/gif/12426173/1701430313809-68ed468d-f1df-44ec-8daa-7ff1b568c7eb.gif#averageHue=%23719d72&clientId=u97119c43-7307-4&from=paste&height=778&id=u8f15506a&originHeight=972&originWidth=1905&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=9682136&status=done&style=none&taskId=ubeb45cca-de08-45e0-b473-ab9b6df7a42&title=&width=1524)

1. 调用PersistProp初始化PersistentStorage，首先查询在PersistentStorage本地文件中是否存在“PropB”，查询结果为不存在，因为应用是第一次安装。
2. 接着查询属性“PropB”在AppStorage中是否存在，依旧不存在。
3. 退出的时候会自动保存，再次进入读取到参数
#### 2.2.4.4 Environment：设备环境查询
开发者如果需要应用程序运行的设备的环境参数，以此来作出不同的场景判断，比如多语言，暗黑模式等，需要用到Environment设备环境查询。
```jsx
AppStorage.SetOrCreate('PropC', 10086);
let storage = new LocalStorage({ 'PropA': 47 });
Environment.EnvProp('languageCode', 'en');
@Entry(storage)
@Component
struct CompA {
  // 全局 @StorageProp与AppStorage进行绑定
  @StorageProp('PropC') storLink: number = 1;
  // @LocalStorageProp变量装饰器与LocalStorage中的'PropA'属性建立单向绑定
  @LocalStorageProp('PropA') storProp1: number = 1;
  @StorageLink("PropC") storLink1: number = 1;
  build() {
    Column() {
      Text("默认数字："+this.storProp1).StateManagement_textSty()
      Button('修改数据页面ui').StateManagement_btnStyle(() => {
        this.storProp1 += 1
      })
      Text("默认数字："+this.storLink).StateManagement_textSty()
      Button('修改数据全局ui-prop').StateManagement_btnStyle(() => {
        this.storLink += 1
      })
      Text("默认数字："+this.storLink1).StateManagement_textSty()
      Button('修改数据全局ui-link').StateManagement_btnStyle(() => {
        this.storLink1 += 1
      })
      Divider()
      StateManagement_link()
      Divider()
      Text(AppStorage.Get('languageCode')).StateManagement_textSty()

    }
  }
}






@Component
struct StateManagement_link {
  // @LocalStorageProp变量装饰器与LocalStorage中的'PropA'属性建立单向绑定
  @StorageLink('PropC') storProp2: number = 2;
  build() {
    Column() {
      Text('link:' + this.storProp2).StateManagement_textSty()
      Button('修改link数据').StateManagement_btnStyle(() => {
        this.storProp2++;
      })
    }
  }
}




// 同样的样式记得复用 text
@Extend(Text) function StateManagement_textSty() {
  .fontSize(30)
  .fontWeight(FontWeight.Bold)
  .fontColor(Color.Green)
}

// button样式
@Extend(Button) function StateManagement_btnStyle(click: Function) {
  .fontSize(30)
  .onClick(() => {
    click()
  })
}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701430662490-aca2c9b8-0e96-441b-959f-a6873641beb2.png#averageHue=%23ececec&clientId=u97119c43-7307-4&from=paste&height=747&id=ue12e3df9&originHeight=934&originWidth=431&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=131331&status=done&style=none&taskId=u546f66c4-e843-456d-a097-0081eb80acb&title=&width=344.8)
### 2.2.5 其他状态
#### 2.2.5.1 @Watch装饰器：状态变量更改通知
@Watch用于监听状态变量的变化，当状态变量变化时，@Watch的回调方法将被调用。@Watch在ArkUI框架内部判断数值有无更新使用的是严格相等（===），遵循严格相等规范。当在严格相等为false的情况下，就会触发@Watch的回调。
```jsx
@Component
struct TotalView {
  @Prop @Watch('onCountUpdated') count: number;
  @State total: number = 0;
  // @Watch cb
  onCountUpdated(propName: string): void {
    this.total += this.count;
  }

  build() {
    Text(`Total: ${this.total}`)
  }
}

@Entry
@Component
struct CountModifier {
  @State count: number = 0;

  build() {
    Column() {
      Button('add to basket')
        .onClick(() => {
          this.count++
        })
      TotalView({ count: this.count })
    }
  }
}
```
![动画.gif](https://cdn.nlark.com/yuque/0/2023/gif/12426173/1701431822896-9ce2695c-30ba-4cc8-9372-2f341fc7116c.gif#averageHue=%23a3a698&clientId=u97119c43-7307-4&from=paste&height=778&id=u85704a60&originHeight=972&originWidth=1905&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=319655&status=done&style=none&taskId=uca23c25c-1c39-43ed-b493-1ac0eecaf9c&title=&width=1524)
简单来说，就是对某个属性的监听
**规则**

| **@Watch补充变量装饰器** | **说明** |
| --- | --- |
| 装饰器参数 | 必填。常量字符串，字符串需要有引号。是(string) => void自定义成员函数的方法的引用。 |
| 可装饰的自定义组件变量 | 可监听所有装饰器装饰的状态变量。不允许监听常规变量。 |
| 装饰器的顺序 | 建议@State、@Prop、@Link等装饰器在@Watch装饰器之前。 |

#### 2.2.5.2 $$语法：内置组件双向同步
$$运算符为系统内置组件提供TS变量的引用，使得TS变量和系统内置组件的内部状态保持同步。
```jsx
// xxx.ets
@Entry
@Component
struct RefreshExample {
  @State isRefreshing: boolean = false
  @State counter: number = 0

  build() {
    Column() {
      Text('Pull Down and isRefreshing: ' + this.isRefreshing)
        .fontSize(30)
        .margin(10)

      Refresh({ refreshing: $$this.isRefreshing, offset: 120, friction: 100 }) {
        Text('Pull Down and refresh: ' + this.counter)
          .fontSize(30)
          .margin(10)
      }
      .onStateChange((refreshStatus: RefreshStatus) => {
        console.info('Refresh onStatueChange state is ' + refreshStatus)
      })
    }
  }
}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701432136221-2ffed68d-ee33-4795-8cd5-94fdf007bfa7.png#averageHue=%23f0f0f0&clientId=u97119c43-7307-4&from=paste&height=747&id=u8d8055cf&originHeight=934&originWidth=431&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=43374&status=done&style=none&taskId=uf739fe80-4022-49c3-afe2-cd2ffe39397&title=&width=344.8)
## 2.3 渲染控制
ArkUI通过[自定义组件](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-create-custom-components-0000001473537046-V3)的build()函数和[@builder装饰器](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-builder-0000001524176981-V3)中的声明式UI描述语句构建相应的UI。在声明式描述语句中开发者除了使用系统组件外，还可以使用渲染控制语句来辅助UI的构建，这些渲染控制语句包括控制组件是否显示的条件渲染语句，基于数组数据快速生成组件的循环渲染语句以及针对大数据量场景的数据懒加载语句。
### 2.3.1 if/else：条件渲染
ArkTS提供了渲染控制的能力。条件渲染可根据应用的不同状态，使用if、else和else if渲染对应状态下的UI内容。
```jsx
// 使用Environment.EnvProp将设备运行languageCode存入AppStorage中；
Environment.EnvProp('languageCode', 'zh');
// 从AppStorage获取单向绑定的languageCode的变量
const lang: SubscribedAbstractProperty<string> = AppStorage.Prop('languageCode');
@Entry
@Component
struct RefreshExample {
  @State isRefreshing: boolean = false
  @State counter: number = 0
  build() {
    Column() {
      Text(lang.get())
      Divider()
      if (lang.get() === 'zh') {
        Text('下拉筛选状态: ' + this.isRefreshing)
          .fontSize(30)
          .margin(10)
      }
      else {
        Text('Pull Down and isRefreshing: ' + this.isRefreshing)
          .fontSize(30)
          .margin(10)
      }

      Refresh({ refreshing: $$this.isRefreshing, offset: 120, friction: 100 }) {
        if (lang.get() === 'zh') {
          Text('下拉刷新次数: ' + this.counter)
            .fontSize(30)
            .margin(10)
        }else{
          Text('Pull Down and refresh: ' + this.counter)
            .fontSize(30)
            .margin(10)
        }
      }
      .onStateChange((refreshStatus: RefreshStatus) => {
        console.info('Refresh onStatueChange state is ' + refreshStatus)
      })
    }
  }
}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701432530398-5c3ba803-4f16-44a0-a89f-35eb4ab5dbd6.png#averageHue=%23f0f0f0&clientId=u0e159c74-16da-4&from=paste&height=747&id=ueb80908e&originHeight=934&originWidth=431&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=36541&status=done&style=none&taskId=u705b9eda-1544-4ad4-982f-4743cc23564&title=&width=344.8)
### 2.3.2 ForEach：循环渲染
ForEach接口基于数组类型数据来进行循环渲染，需要与容器组件配合使用，且接口返回的组件应当是允许包含在ForEach父容器组件中的子组件。
**接口描述**
```jsx
ForEach(
  arr: Array,
  itemGenerator: (item: Array, index?: number) => void,
  keyGenerator?: (item: Array, index?: number): string => string
)
```
在ForEach循环渲染过程中，系统会为每个数组元素生成一个唯一且持久的键值，用于标识对应的组件。当这个键值变化时，ArkUI框架将视为该数组元素已被替换或修改，并会基于新的键值创建一个新的组件。
```jsx
@Entry
@Component
struct ArticleList {
  @State simpleList: Array<number> = [1, 2, 3, 4, 5];

  build() {
    Column() {
      ForEach(this.simpleList,
        (item: string,index:number) => {
        Text(index+"- " + item)
        ArticleSkeletonView().margin({ top: 20 })
      },
        (item: string) => item)
    }
    .padding(20)
    .width('100%')
    .height('100%')
  }
}

@Builder
function textArea(width: number | Resource | string = '100%', height: number | Resource | string = '100%') {
  Row()
    .width(width)
    .height(height)
    .backgroundColor('#FFF2F3F4')
}

@Component
struct ArticleSkeletonView {
  build() {
    Row() {
      Column() {
        textArea(80, 80)
      }
      .margin({ right: 20 })

      Column() {
        textArea('60%', 20)
        textArea('50%', 20)
      }
      .alignItems(HorizontalAlign.Start)
      .justifyContent(FlexAlign.SpaceAround)
      .height('100%')
    }
    .padding(20)
    .borderRadius(12)
    .backgroundColor('#FFECECEC')
    .height(120)
    .width('100%')
    .justifyContent(FlexAlign.SpaceBetween)
  }
}
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701435082974-ad7730cf-531c-4fcf-a531-a5d6d9ca36f2.png#averageHue=%23e3e3e3&clientId=u0e159c74-16da-4&from=paste&height=747&id=u5d0945ce&originHeight=934&originWidth=431&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=18138&status=done&style=none&taskId=u846f52b2-aa74-41a4-966d-d5b8fdc2d38&title=&width=344.8)
### 2.3.3 LazyForEach：数据懒加载
LazyForEach从提供的数据源中按需迭代数据，并在每次迭代过程中创建相应的组件。当在滚动容器中使用了LazyForEach，框架会根据滚动容器可视区域按需创建组件，当组件滑出可视区域外时，框架会进行组件销毁回收以降低内存占用。
**接口描述**
```jsx
LazyForEach(
    dataSource: IDataSource,             // 需要进行数据迭代的数据源
    itemGenerator: (item: any, index?: number) => void,  // 子组件生成函数
    keyGenerator?: (item: any, index?: number) => string // 键值生成函数
): void
```
**IDataSource 接口**
```jsx
interface IDataSource {
    totalCount(): number; // 获得数据总数
    getData(index: number): Object; // 获取索引值对应的数据
    registerDataChangeListener(listener: DataChangeListener): void; // 注册数据改变的监听器
    unregisterDataChangeListener(listener: DataChangeListener): void; // 注销数据改变的监听器
}
```
**registerDataChangeListener**
```jsx
interface DataChangeListener {
    onDataReloaded(): void; // 重新加载数据时调用
    onDataAdded(index: number): void; // 添加数据时调用
    onDataMoved(from: number, to: number): void; // 数据移动起始位置与数据移动目标位置交换时调用
    onDataDeleted(index: number): void; // 删除数据时调用
    onDataChanged(index: number): void; // 改变数据时调用
    onDataAdd(index: number): void; // 添加数据时调用
    onDataMove(from: number, to: number): void; // 数据移动起始位置与数据移动目标位置交换时调用
    onDataDelete(index: number): void; // 删除数据时调用
    onDataChange(index: number): void; // 改变数据时调用
}
```

- LazyForEach必须在容器组件内使用，仅有List、Grid、Swiper以及WaterFlow组件支持数据懒加载（可配置cachedCount属性，即只加载可视部分以及其前后少量数据用于缓冲），其他组件仍然是一次性加载所有的数据。
- LazyForEach在每次迭代中，必须创建且只允许创建一个子组件。
- 生成的子组件必须是允许包含在LazyForEach父容器组件中的子组件。
- 允许LazyForEach包含在if/else条件渲染语句中，也允许LazyForEach中出现if/else条件渲染语句。
- 键值生成器必须针对每个数据生成唯一的值，如果键值相同，将导致键值相同的UI组件被框架忽略，从而无法在父容器内显示。
- LazyForEach必须使用DataChangeListener对象来进行更新，第一个参数dataSource使用状态变量时，状态变量改变不会触发LazyForEach的UI刷新。
- 为了高性能渲染，通过DataChangeListener对象的onDataChange方法来更新UI时，需要生成不同于原来的键值来触发组件刷新。
```jsx


class BaseDataSource implements IDataSource {
  private listeners: DataChangeListener[] = [];
  private originDataArray: string[] = [];

  public totalCount(): number {
    return 0;
  }

  public getData(index: number): string {
    return this.originDataArray[index];
  }

  // 该方法为框架侧调用，为LazyForEach组件向其数据源处添加listener监听
  registerDataChangeListener(listener: DataChangeListener): void {
    if (this.listeners.indexOf(listener) < 0) {
      console.info('add listener');
      this.listeners.push(listener);
    }
  }

  // 该方法为框架侧调用，为对应的LazyForEach组件在数据源处去除listener监听
  unregisterDataChangeListener(listener: DataChangeListener): void {
    const pos = this.listeners.indexOf(listener);
    if (pos >= 0) {
      console.info('remove listener');
      this.listeners.splice(pos, 1);
    }
  }

  // 通知LazyForEach组件需要重载所有子组件
  notifyDataReload(): void {
    this.listeners.forEach(listener => {
      listener.onDataReloaded();
    })
  }

  // 通知LazyForEach组件需要在index对应索引处添加子组件
  notifyDataAdd(index: number): void {
    this.listeners.forEach(listener => {
      listener.onDataAdd(index);
    })
  }

  // 通知LazyForEach组件在index对应索引处数据有变化，需要重建该子组件
  notifyDataChange(index: number): void {
    this.listeners.forEach(listener => {
      listener.onDataChange(index);
    })
  }

  // 通知LazyForEach组件需要在index对应索引处删除该子组件
  notifyDataDelete(index: number): void {
    this.listeners.forEach(listener => {
      listener.onDataDelete(index);
    })
  }
}

class MyDataSource extends BaseDataSource {
  private dataArray: string[] = [];

  public totalCount(): number {
    return this.dataArray.length;
  }

  public getData(index: number): string {
    return this.dataArray[index];
  }

  public addData(index: number, data: string): void {
    this.dataArray.splice(index, 0, data);
    this.notifyDataAdd(index);
  }

  public pushData(data: string): void {
    this.dataArray.push(data);
    this.notifyDataAdd(this.dataArray.length - 1);
  }
}


@Entry
@Component
struct MyComponent {

  private data: MyDataSource = new MyDataSource();

  aboutToAppear() {
    for (let i = 0; i <= 20; i++) {
      this.data.pushData(`Hello ${i}`)
    }
  }

  build() {
    List({ space: 3 }) {
      LazyForEach(this.data, (item: string,index:number) => {
        ArticleSkeletonView({text:item}).margin({ top: 20 })
      },(item: string) => item)
    }.cachedCount(5)
  }
}


@Builder
function textArea(width: number | Resource | string = '100%', height: number | Resource | string = '100%',text: string = '') {
  Text(text)
  Row()
    .width(width)
    .height(height)
    .backgroundColor('#FFF2F3F4')

}

@Component
struct ArticleSkeletonView {
  @State text:string ="Hello"
  build() {
    Row() {
      Column() {
        textArea(80, 80)
      }
      .margin({ right: 20 })
      Column() {
        textArea('60%', 20)
        textArea('50%', 20)
      }
      .alignItems(HorizontalAlign.Start)
      .justifyContent(FlexAlign.SpaceAround)
      .height('100%')
    }
    .padding(20)
    .borderRadius(12)
    .backgroundColor('#FFECECEC')
    .height(120)
    .width('100%')
    .justifyContent(FlexAlign.SpaceBetween)
  }
}
```
键值生成规则是keyGenerator函数的返回值item。
![动画.gif](https://cdn.nlark.com/yuque/0/2023/gif/12426173/1701436039372-56817e0a-4495-45c8-8ca5-5deb801404bf.gif#averageHue=%23515d70&clientId=u0e159c74-16da-4&from=paste&height=778&id=ubbd26f03&originHeight=972&originWidth=1905&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=1125696&status=done&style=none&taskId=u7dba70fb-d134-4cad-a6da-47274a8e1b2&title=&width=1524)
到此：ArkTs基本语法学完了，请多看官网

