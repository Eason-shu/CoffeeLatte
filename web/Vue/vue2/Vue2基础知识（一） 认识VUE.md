---
title: Vue2基础知识（一） 认识VUE
sidebar_position: 1
keywords:
  - Vue
tags:
  - Vue
  - 学习笔记
  - 基础
  - 前端
last_update:
  date: 2023-07-01
  author: EasonShu
---

![e89cc4b5f1864679bbe3929bcc9296f1.gif](https://cdn.nlark.com/yuque/0/2023/gif/12426173/1697707607799-74437d3b-dc5d-4b78-9f94-311691b683d7.gif#averageHue=%23fcfcfc&clientId=u9f6f6551-9ffd-4&from=ui&id=u36e750d2&originHeight=80&originWidth=640&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=18117&status=done&style=none&taskId=u85ae9de5-f75e-4ece-b23d-f9878b004d8&title=)

- 💌 所属专栏：【Vue2】
- 😀 作 者：长安不及十里
- 💻工作：目前从事电力行业开发
- 🌈目标：全栈开发
- 🚀 个人简介：一个正在努力学技术的Java工程师，专注基础和实战分享 ，欢迎咨询！
- 💖 欢迎大家：这里是CSDN，我总结知识的地方，喜欢的话请三连，有问题请私信 😘 😘 😘
- 📌 格言：把戏把戏要过手

---

- 📏 官网：[https://v2.cn.vuejs.org](https://v2.cn.vuejs.org/)
- ⛳ 参考教程：[https://www.bilibili.com/video/BV1HV4y1a7n4](https://www.bilibili.com/video/BV1HV4y1a7n4?p=1)
- 🔧 Vue脚手架：[https://cli.vuejs.org/zh](https://cli.vuejs.org/zh/)
- 🔧 VueRouter：[https://router.vuejs.org/zh](https://router.vuejs.org/zh/)
- 🔧 VueX：[https://vuex.vuejs.org/zh](https://vuex.vuejs.org/zh/)

---

# 一 认识Vue 
## 1.1 前端发展历程
前端技术开发在过去的十年里经历了从HTML、CSS到JavaScript的演变。在这个历程中，前端工程师的角色也发生了变化，他们不再只是单纯的代码开发者，还需要与设计师、产品经理、运营人员等其他团队成员协作，共同完成网站的开发。
![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1697695223739-54121852-9b79-407b-a3e7-b92ee1fc352a.webp#averageHue=%23a1a1a1&clientId=ua8dfa591-4c93-4&from=paste&id=u66975ce6&originHeight=608&originWidth=1080&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ufd95216e-02f4-4241-a2e1-a84a4a457dc&title=)

- 2010年以前，前端工程师主要负责网站的静态页面开发，如网页设计、图片处理等。在这个阶段，前端工程师的技能主要包括HTML、CSS和JavaScript等基本技术。
- 2010年，JavaScript成为了前端开发的主要语言。随着JavaScript的普及和发展，越来越多的前端工程师开始关注JavaScript的应用和开发。
- 2011年，jQuery成为了前端开发的主流库，并且HTML5和CSS3开始受到重视。这也是前端开发变得更加动态和交互性的开始。
- 2012年，响应式设计和移动设备优先的设计理念开始流行，前端开发在移动端上崭露头角。
- 2013年，Angular引入了模块化和数据绑定的概念，Bootstrap实现了响应式框架，前端开发变得更加简单和高效。
- 2014年，React发布，革新出组件化的思想，前端开发变得更加灵活和可维护。
- 2015年，ES6发布，带来了诸如箭头函数、模板字符串和解构赋值等语言的改进，使JavaScript变得更加易用和现代化。同年，Vue的发布迅速获得了广泛应用。
- 2016年，前端工具链的发展得到了加速，例如Webpack和Babel等工具的普及使得前端工程化得到了广泛推广。
- 2017年，JavaScript库和框架更加多样，Angular、React和Vue等都在不断地演进和优化。PWA技术的普及使得网页更接近原生应用的用户体验。
- 2018年，JavaScript框架的选择更加复杂，同时CSS预处理器（例如Sass和Less）和CSS-in-JS的技术也逐渐成熟。
- 2019年，前端技术继续保持快速发展的趋势，更加注重用户体验和开发效率。例如，React Hooks和Vue 3等技术的推出使得前端代码更简洁并可维护。
- 2020年，因新冠疫情影响，居家办公及远程工作成为新趋势。虚拟会议和在线教育等普及推动了前端技术的发展，也更加重视了访问性和用户体验。
- 2021年，新技术和工具不断推陈出新。Web Assembly使得前端代码获得更高的效率，而预渲染和静态站点生成等技术让前端应用可以获得更快的加载速度。
- 2022年，VR（虚拟现实）和AR（增强现实）技术的不断发展，前端开发者需要开发出更加适合VR/AR场景的应用程序。
- 2023年至今，AI（人工智能）技术的突破性进展，前端技术将在AI 技术的加持下得到更广泛的应用，从而带来更智能和更高效的前端开发体验。
## 1.2 Vue 
**Vue是什么？**
Vue (读音 /vjuː/，类似于 **view**) 是一套用于构建用户界面的**渐进式框架**。与其它大型框架不同的是，Vue 被设计为可以自底向上逐层应用。Vue 的核心库只关注视图层，不仅易于上手，还便于与第三方库或既有项目整合。另一方面，当与[现代化的工具链](https://v2.cn.vuejs.org/v2/guide/single-file-components.html)以及各种[支持类库](https://github.com/vuejs/awesome-vue#libraries--plugins)结合使用时，Vue 也完全能够为复杂的单页应用提供驱动。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697697837233-4ca184e9-cee5-45b1-93a2-ebee0095000d.png#averageHue=%235bc081&clientId=ua8dfa591-4c93-4&from=paste&height=500&id=u6058cf1a&originHeight=625&originWidth=1257&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=200636&status=done&style=none&taskId=u95cd5302-1ec1-46f8-b8e9-3d262f787f6&title=&width=1005.6)
**Vue的作者？**
尤雨溪
**Vue的特点？**

1. 遵循 MVVM 模式，借鉴 angular 的模板和数据绑定技术，借鉴 react 的组件化和虚拟 DOM 技术。
2. 适合 移动/PC 开发，代码简洁，体积小，运行效率高。
3. 它本身只关注 UI，可以轻松引入 vue 插件或其它第三库开发项目。
4. 繁荣的生态，百花齐放的组件。
5. 经过多次的迭代，稳定性号。

**Vue vs Anguar?**
**我们第一个项目由于是Angualr编写的项目，再次我想比较一下他的区别**

- 学习：Vue比较容易上手，Angualr需要自己去学习一番，比如Ts语法，当时我认为在后端开发人员看来Angualr的学习成本好像也不是很高，他有这像后端一样的语法结构树，类似的结构，View，样式，脚本分离
- 生态：可能在国内使用Anguar的团队相对于Vue的来说比较少，所以生态Vue的生态强太多，当真实开发中遇到问题可能找不到解决办法
- 性能：虽然 Angular 和 Vue 都提供了很高的性能，但由于 Vue 的虚拟 DOM 实现的重量较轻，所以可以说 Vue 的速度/性能略微领先，更简单的编程模型使 Vue 能够提供更好的性能。Angular 可能会很慢的原因是它使用脏数据检查，这意味着 Angularmonitors 会持续查看变量是否有变化。

Vue.js 是轻量级的开发框架，很适合开发小规模灵活的 Web 应用程序；而 Angular 尽管学习曲线较为陡峭，但却是构建完整复杂应用的好选择。
## 1.3 开发工具准备

- 下载插件

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697700501120-343a8e28-330e-40e1-b5ba-99410b6dce0d.png#averageHue=%23fcfaf9&clientId=ua8dfa591-4c93-4&from=paste&height=485&id=uca5e05a1&originHeight=606&originWidth=1318&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=217358&status=done&style=none&taskId=u05f9886e-2a71-4b0a-b766-6e30f4000dd&title=&width=1054.4)

- 安装调试

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697700543798-a0c85294-7006-4df2-bb76-29090ba171b5.png#averageHue=%23fcfaf9&clientId=ua8dfa591-4c93-4&from=paste&height=371&id=uc61a630a&originHeight=464&originWidth=1184&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=153537&status=done&style=none&taskId=ueb521fde-b2c2-4151-9de1-4aedaf434c6&title=&width=947.2)

- VsCode 代码开发工具安装
- 下载地址：[https://code.visualstudio.com/](https://code.visualstudio.com/)
- 傻瓜式安装ok
# 二 Vue 基础语法
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697707798143-4e073ffc-6c4c-45a0-9b99-d7013251b029.png#averageHue=%23f9f9f8&clientId=u1b95af93-b769-4&from=paste&height=594&id=u948e702e&originHeight=742&originWidth=1297&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=223624&status=done&style=none&taskId=u1100ba28-9158-43d2-8e76-b52c7964d67&title=&width=1037.6)
## 2.1 Vue 的引入

- 原生网页开发：我们学习基本语法时使用
```jsx
<!-- 开发环境版本，包含了有帮助的命令行警告 -->
<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
<!-- 生产环境版本，优化了尺寸和速度 -->
<script src="https://cdn.jsdelivr.net/npm/vue@2"></script>  
```

- 组件开发：基于Vue提供的脚手架进行开发，后面到了组件开发进行介绍，参考资料：[https://cli.vuejs.org/zh/](https://cli.vuejs.org/zh/)
## 2.2 Hello Word
```vue
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>For</title>
    <!-- 引入开发包 -->
    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
    </head>
      <body>
      <div id="app">
      <h1>{{msg}}</h1>
      </div>
      <script>
      // 创建Vue实例
      var app = new Vue({
      // 挂载点: 通过id选择器找到挂载点
      el: '#app',
      // 数据
      data: {
        msg: "hello world",
      },
    })
    </script>
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697698448144-1f946d6e-1698-45b4-80d3-096b62621cc9.png#averageHue=%23fdfdfd&clientId=ua8dfa591-4c93-4&from=paste&height=333&id=uf19928a8&originHeight=416&originWidth=1377&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=7094&status=done&style=none&taskId=u7148e477-1a6e-4f8d-922b-1b1124d5664&title=&width=1101.6)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697698472419-f096a810-761a-4b84-ab80-6fce7af4dfe3.png#averageHue=%23cfcecd&clientId=ua8dfa591-4c93-4&from=paste&height=517&id=ubdfcc734&originHeight=646&originWidth=1275&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=175256&status=done&style=none&taskId=u34ac302c-3024-498b-bde0-c9f09ddd56f&title=&width=1020)
## 2.3 Vue 实例
每个 Vue 应用都是通过用 Vue 函数创建一个新的 **Vue 实例**开始的：
```vue
var vm = new Vue({
  // 选项
  })
```
虽然没有完全遵循 [MVVM 模型](https://zh.wikipedia.org/wiki/MVVM)，但是 Vue 的设计也受到了它的启发。因此在文档中经常会使用 vm (ViewModel 的缩写) 这个变量名表示 Vue 实例。
当创建一个 Vue 实例时，你可以传入一个**选项对象**。这篇教程主要描述的就是如何使用这些选项来创建你想要的行为。作为参考，你也可以在 [API 文档](https://v2.cn.vuejs.org/v2/api/#%E9%80%89%E9%A1%B9-%E6%95%B0%E6%8D%AE)中浏览完整的选项列表。
**MVVM模型：**
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697698794557-e7686a8e-e1f6-4405-a65f-a2ff47e4e695.png#averageHue=%23e0c35c&clientId=ua8dfa591-4c93-4&from=paste&height=330&id=u9be5f1b8&originHeight=412&originWidth=1020&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=144450&status=done&style=none&taskId=ud6590503-cf7e-4905-bf90-01522d50ee7&title=&width=816)
Vue 实例：[https://v2.cn.vuejs.org/v2/api/#%E9%80%89%E9%A1%B9-%E6%95%B0%E6%8D%AE](https://v2.cn.vuejs.org/v2/api/#%E9%80%89%E9%A1%B9-%E6%95%B0%E6%8D%AE)
我们打开开发者工具F12，打印app Vue实例
### 2.3.1 el

- **类型**：string | Element
- **限制**：只在用 new 创建实例时生效。
- **详细**：提供一个在页面上已存在的 DOM 元素作为 Vue 实例的挂载目标。可以是 CSS 选择器，也可以是一个 HTMLElement 实例。在实例挂载之后，元素可以用 vm.$el 访问。如果在实例化时存在这个选项，实例将立即进入编译过程，否则，需要显式调用 vm.$mount() 手动开启编译。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697699315419-823e3712-a853-40e8-ad6a-19dc26a772d9.png#averageHue=%23fdfdfc&clientId=ua8dfa591-4c93-4&from=paste&height=406&id=u5f8bb7eb&originHeight=508&originWidth=1317&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=64540&status=done&style=none&taskId=u5714be46-6e8c-4ada-96c9-d6560572bec&title=&width=1053.6)
### 2.3.2 data

- **类型**：Object | Function
- **限制**：组件的定义只接受 function。
- **详细**：Vue 实例的数据对象。Vue 会递归地把 data 的 property 转换为 getter/setter，从而让 data 的 property 能够响应数据变化。**对象必须是纯粹的对象 (含有零个或多个的 key/value 对)**：浏览器 API 创建的原生对象，原型上的 property 会被忽略。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697699486240-f74d9ce1-4a60-47aa-bb92-92595779334b.png#averageHue=%23fdfdfd&clientId=ua8dfa591-4c93-4&from=paste&height=597&id=u12ff4399&originHeight=746&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=111416&status=done&style=none&taskId=u109380c0-b4fc-4289-8a1c-2d083e03439&title=&width=1536)
目前我们就介绍这两个，后面遇到了自己查文档，打开调试工具观察Vue实例
## 2.4 插值表达式
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697699741401-9c91f569-3a70-4970-84da-1bc766226e0b.png#averageHue=%23dad8d7&clientId=ua8dfa591-4c93-4&from=paste&height=425&id=u7d5306ef&originHeight=531&originWidth=1314&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=254446&status=done&style=none&taskId=u57cf446f-74a5-402a-9de7-37a83f38736&title=&width=1051.2)

- 案例
```javascript
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>For</title>
  <!-- 引入开发包 -->
  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
</head>

<body>
  <div id="app">
    <h1>{{msg}}</h1>
    <p>{{1==0}}</p>
    <p>{{1>0}}</p>
    <p>{{1<0}}</p>
    <p v-html="html"></p>
    <image v-bind:src="img"></image>


  </div>
  <script>
    // 创建Vue实例
    var app = new Vue({
      // 挂载点: 通过id选择器找到挂载点
      el: '#app',
      // 数据
      data: {
        msg: "我是插值表达式基本语法",
        html: "<h1>我是h1标签</h1>",
        url: "https://www.baidu.com",
        img: "https://www.baidu.com/img/bd_logo1.png?where=super",
        flag: true,
      },
    })
  </script>
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697700199943-7edb26c5-3716-4813-9afb-84272b2fe60f.png#averageHue=%23fdfafa&clientId=ua8dfa591-4c93-4&from=paste&height=747&id=ud08ad329&originHeight=934&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=51116&status=done&style=none&taskId=u4d2a0763-9c20-4fb5-8e78-f15ac777e84&title=&width=1536)

- 数据绑定最常见的形式就是使用Mustache语法 (双大括号) 的文本插值，Mustache 标签将会被替代为对应数据对象上 msg property 的值。无论何时，绑定的数据对象上 msg property 发生了改变，插值处的内容都会更新。
- 双大括号会将数据解释为普通文本，而非 HTML 代码。为了输出真正的 HTML，你需要使用 [v-html](https://v2.cn.vuejs.org/v2/api/#v-html)。
- Mustache 语法不能作用在 HTML attribute 上，遇到这种情况应该使用 [v-bind指令](https://v2.cn.vuejs.org/v2/api/#v-bind)。
- 对于所有的数据绑定，Vue.js 都提供了完全的 JavaScript 表达式支持。
## 2.5 指令

指令 (Directives) 是带有 v- 前缀的特殊 attribute。
指令 attribute 的值预期是**单个 JavaScript 表达式** (v-for 是例外情况，稍后我们再讨论)。
指令的职责是，当表达式的值改变时，将其产生的连带影响，响应式地作用于 DOM。
**这里我也不介绍完了，自己可以去查看官网，介绍我认为难理解的**
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697701199655-edcbc4b6-6521-4663-82c1-6e0f6393d925.png#averageHue=%23dfdddd&clientId=ua8dfa591-4c93-4&from=paste&height=410&id=u4ee94470&originHeight=513&originWidth=1279&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=158335&status=done&style=none&taskId=u82e8792b-6a0d-435f-9e8e-d15a3db9f8d&title=&width=1023.2)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697700717420-dbdfa6e4-3773-431d-b1ec-d274efc9a99b.png#averageHue=%23fdfcfc&clientId=ua8dfa591-4c93-4&from=paste&height=471&id=uff4905c1&originHeight=589&originWidth=1876&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=82583&status=done&style=none&taskId=u7d52b7aa-ddb4-4475-93d8-b42b6a84f4a&title=&width=1500.8)
### 2.5.1 v-show vs v-if
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697701226058-9b5f2895-bb64-446a-bb0f-462b78963809.png#averageHue=%23f5f3f2&clientId=ua8dfa591-4c93-4&from=paste&height=506&id=ucda271e3&originHeight=632&originWidth=1321&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=213704&status=done&style=none&taskId=u08f008cd-d621-42c6-8554-58001949334&title=&width=1056.8)
```vue
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>For</title>
  <!-- 引入开发包 -->
  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
</head>

<body>
  <div id="app">

  <!-- v-show -->
    <h1 v-show="isShow">我是v-show</h1>
    <button @click="isShow=!isShow">v-show切换</button>
    <!-- v-if -->
    <h1 v-if="isShow">我是v-if</h1>
    <button @click="isShow=!isShow">v-if切换</button>
    <!-- v-bind -->
    <a v-bind:href="url">百度</a>
    <img v-bind:src="img" alt="">
    <button v-bind:disabled="isButtonDisabled">Button</button>

  </div>
  <script>
    // 创建Vue实例
    var app = new Vue({
      // 挂载点: 通过id选择器找到挂载点
      el: '#app',
      // 数据
      data: {
       // 是否展示
        isShow: true,
        url: "https://www.baidu.com",
        img: "https://www.baidu.com/img/bd_logo1.png?where=super",
      },
    })
  </script>
```

- v-show是通过display:none来控制元素的显示和隐藏
- v-if是通过添加和删除元素来控制元素的显示和隐藏
-  v-show的元素始终会被渲染在DOM中，而v-if的元素只有在条件为true时才会被渲染在DOM中
### 2.5.2 v-on

- **缩写**：@
- **预期**：Function | Inline Statement | Object
- **参数**：event
- **修饰符**：
   - .stop - 调用 event.stopPropagation()。
   - .prevent - 调用 event.preventDefault()。
   - .capture - 添加事件侦听器时使用 capture 模式。
   - .self - 只当事件是从侦听器绑定的元素本身触发时才触发回调。
   - .{keyCode | keyAlias} - 只当事件是从特定键触发时才触发回调。
   - .native - 监听组件根元素的原生事件。
   - .once - 只触发一次回调。
   - .left - (2.2.0) 只当点击鼠标左键时触发。
   - .right - (2.2.0) 只当点击鼠标右键时触发。
   - .middle - (2.2.0) 只当点击鼠标中键时触发。
   - .passive - (2.3.0) 以 { passive: true } 模式添加侦听器
- **用法**：绑定事件监听器。事件类型由参数指定。表达式可以是一个方法的名字或一个内联语句，如果没有修饰符也可以省略。用在普通元素上时，只能监听[原生 DOM 事件](https://developer.mozilla.org/zh-CN/docs/Web/Events)。用在自定义元素组件上时，也可以监听子组件触发的**自定义事件**。在监听原生 DOM 事件时，方法以事件为唯一的参数。如果使用内联语句，语句可以访问一个 $event property：v-on:click="handle('ok', $event)"。从 2.4.0 开始，v-on 同样支持不带参数绑定一个事件/监听器键值对的对象。注意当使用对象语法时，是不支持任何修饰器的。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697701631068-1b0b8ef8-a31a-4385-93ef-971cb6d83009.png#averageHue=%23f0eeee&clientId=ua8dfa591-4c93-4&from=paste&height=449&id=u987e677a&originHeight=561&originWidth=1254&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=129530&status=done&style=none&taskId=u39e9e7f4-780a-4b9a-b4e1-881b1d531a4&title=&width=1003.2)
```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>For</title>
  <!-- 引入开发包 -->
  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
</head>

<body>
  <div id="app">
    <!-- v-on -->
    <h1 style="color: #f70303;">{{ message }}</h1>
    <button v-on:click="reverseMessage">逆转消息</button>
    <!-- 简写 -->
    <button @click="reverseMessage">简写逆转消息</button>
    <!-- 传参 -->
    <button @click="reverseMessage('hello v-on')">传参逆转消息</button>
  </div>
  <script>
    // 创建Vue实例
    var app = new Vue({
      // 挂载点: 通过id选择器找到挂载点
      el: '#app',
      // 数据
      data: {
        // 是否展示
        message: 'Hello Vue!'
      },
      // 方法
      methods: {
        // 逆转消息
        reverseMessage: function () {
          this.message = this.message.split('').reverse().join('')
        },
        // 传参逆转消息
        reverseMessage: function (message) {
          this.message = message.split('').reverse().join('')
        }

      },
    })
  </script>
```
本文又介绍了Vue的一个实例 ，方法区：
**methods**

- **类型**：{ [key: string]: Function }
- **详细**：methods 将被混入到 Vue 实例中。可以直接通过 VM 实例访问这些方法，或者在指令表达式中使用。方法中的 this 自动绑定为 Vue 实例。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697702021680-fc1e75ff-ba44-4e0b-a54c-e4f4f0e57d88.png#averageHue=%23fdfdfd&clientId=ua8dfa591-4c93-4&from=paste&height=597&id=u2f169dfe&originHeight=746&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=97161&status=done&style=none&taskId=u817b1c77-6311-408e-862a-fc918cb1822&title=&width=1536)
### 2.5.3 v-bind

- **缩写**：:
- **预期**：any (with argument) | Object (without argument)
- **参数**：attrOrProp (optional)
- **修饰符**：
   - .prop - 作为一个 DOM property 绑定而不是作为 attribute 绑定。([差别在哪里？](https://stackoverflow.com/questions/6003819/properties-and-attributes-in-html#answer-6004028))
   - .camel - (2.1.0+) 将 kebab-case attribute 名转换为 camelCase。(从 2.1.0 开始支持)
   - .sync (2.3.0+) 语法糖，会扩展成一个更新父组件绑定值的 v-on 侦听器。
- **用法**：动态地绑定一个或多个 attribute，或一个组件 prop 到表达式。在绑定 class 或 style attribute 时，支持其它类型的值，如数组或对象。可以通过下面的教程链接查看详情。在绑定 prop 时，prop 必须在子组件中声明。可以用修饰符指定不同的绑定类型。没有参数时，可以绑定到一个包含键值对的对象。注意此时 class 和 style 绑定不支持数组和对象。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697702181468-49732134-74ec-4ab4-afd5-baefc4be8a50.png#averageHue=%23dbd9d6&clientId=ua8dfa591-4c93-4&from=paste&height=446&id=ud217c155&originHeight=557&originWidth=1236&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=194574&status=done&style=none&taskId=u16ccd34f-f8a4-4763-9fb1-951faf62523&title=&width=988.8)
```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>For</title>
  <!-- 引入开发包 -->
  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
</head>

<body>
  <div id="app">
    <!-- v-bind -->
    <h1 style="color: #f70303;">{{ message }}</h1>
    <!-- v-bind -->
    <button v-bind:style="{color:color}">v-bind</button>
    <!-- class -->
    <div :class="class1">class</div>
    <!-- 简写 -->
    <button :style="{color:color}">简写v-bind</button>

    <!-- 改变颜色 -->
    <button @click="changeColor">改变颜色</button>

  </div>
  <script>
    // 创建Vue实例
    var app = new Vue({
      // 挂载点: 通过id选择器找到挂载点
      el: '#app',
      // 数据
      data: {
        // 是否展示
        color: '#f70303',
        message: 'Hello Vue!',
        tiele: 'Hello Vue!',
        class1: 'box',



      },
      // 方法
      methods: {
        // 改变颜色
        changeColor: function () {
          this.color = '#03f7f7',
            this.class1 = 'box1'
        },

      },
    })
  </script>

  <style>
    .box {
      width: 100px;
      height: 100px;
      background-color: #f70303;
    }

    .box1 {
      width: 100px;
      height: 100px;
      background-color: #03f7f7;
    }
  </style>
```

- 其他
```html
<!-- 绑定一个 attribute -->
<img v-bind:src="imageSrc">

<!-- 动态 attribute 名 (2.6.0+) -->
<button v-bind:[key]="value"></button>

<!-- 缩写 -->
<img :src="imageSrc">

<!-- 动态 attribute 名缩写 (2.6.0+) -->
<button :[key]="value"></button>

<!-- 内联字符串拼接 -->
<img :src="'/path/to/images/' + fileName">

<!-- class 绑定 -->
<div :class="{ red: isRed }"></div>
<div :class="[classA, classB]"></div>
<div :class="[classA, { classB: isB, classC: isC }]"></div>

<!-- style 绑定 -->
<div :style="{ fontSize: size + 'px' }"></div>
<div :style="[styleObjectA, styleObjectB]"></div>

<!-- 绑定一个全是 attribute 的对象 -->
<div v-bind="{ id: someProp, 'other-attr': otherProp }"></div>

<!-- 通过 prop 修饰符绑定 DOM attribute -->
<div v-bind:text-content.prop="text"></div>

<!-- prop 绑定。“prop”必须在 my-component 中声明。-->
<my-component :prop="someThing"></my-component>

<!-- 通过 $props 将父组件的 props 一起传给子组件 -->
<child-component v-bind="$props"></child-component>

<!-- XLink -->
<svg><a :xlink:special="foo"></a></svg>
```
### 2.5.4  v-for

- **预期**：Array | Object | number | string | Iterable (2.6 新增)
- **用法**：基于源数据多次渲染元素或模板块。此指令之值，必须使用特定语法 alias in expression，为当前遍历的元素提供别名：
| ```vue
<div v-for="item in items">
                             {{ item.text }}
</div>
```
 |
| --- |

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697704478845-e9738d1c-4a52-4cb6-992d-ed26aa608b70.png#averageHue=%23eeedec&clientId=ua8dfa591-4c93-4&from=paste&height=436&id=u51099491&originHeight=545&originWidth=1275&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=136115&status=done&style=none&taskId=u43c2d851-9668-41a8-aeeb-30bab617c72&title=&width=1020)
```vue
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>For</title>
    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
</head>
<body>
    <div id="app">
        <div>
            <ul>
                <li v-for="(item,index) in items" :key="id" >{{index}}--{{  item.name  }} </li>
            </ul>
            <button @click="add()">增加</button>
            <button @click="del()">删除</button>
            <button @click="change()">修改</button>
        </div>
    </div>
    <script>
        var app = new Vue({
            el: '#app',
            data: {
                items: [
                    { id: 1, name: 'Alice' },
                    { id: 2, name: 'Bob' },
                    { id: 3, name: 'Charlie' }
                ]
            },
            methods: {
                add() {
                   this.items.push({ id: 4, name: 'David' })
                },
                del(){
                    this.items.splice(1,1)
                },
                change(){
                    this.items[0].name = '测试'
                }
            },
        })
    </script>
```
**这个key属性有什么作用呢？**

- key属性主要用在Vue的虚拟DOM算法，在新旧nodes对比时辨识VNodes。
- 如果不使用key，Vue会使用一种最大限度减少动态元素并且尽可能的尝试就地修改/复用相同类型元素的算法；而使用key时，它会基于key的变化重新排列元素顺序，并且会移除/销毁key不存在的元素。
- 详细来说，我们知道，vue实现了一套虚拟DOM，使我们可以不直接操作DOM元素，只操作数据便可以重新渲染页面。而隐藏在背后的原理便是其高效的Diff算法。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697704689008-34cd63dd-eb4b-4dcf-8b38-32c4d641d500.png#averageHue=%23cac5c2&clientId=ua8dfa591-4c93-4&from=paste&height=452&id=ueeb97d51&originHeight=565&originWidth=1217&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=112494&status=done&style=none&taskId=ud8dc8158-5eef-44d8-8ff9-af3d8a2d594&title=&width=973.6)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697704699701-62e36ea2-b6ae-44c5-9054-375441986566.png#averageHue=%23d0cbc8&clientId=ua8dfa591-4c93-4&from=paste&height=454&id=u3bbf8026&originHeight=567&originWidth=1217&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=99526&status=done&style=none&taskId=u3a9caaf8-9165-49d8-99fd-ae46eccad15&title=&width=973.6)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697704717457-425e821a-4068-4e06-8426-beb52ba2f1c1.png#averageHue=%23eeecec&clientId=ua8dfa591-4c93-4&from=paste&height=422&id=u9b46e91e&originHeight=528&originWidth=1169&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=80787&status=done&style=none&taskId=u49a64d16-a47f-4061-ad38-3cd2ed0e573&title=&width=935.2)
### 2.5.5 v-model

- **预期**：随表单控件类型不同而不同。
- **限制**：
   - <input>
   - <select>
   - <textarea>
   - components
- **修饰符**：
   - [.lazy](https://v2.cn.vuejs.org/v2/guide/forms.html#lazy) - 取代 input 监听 change 事件
   - [.number](https://v2.cn.vuejs.org/v2/guide/forms.html#number) - 输入字符串转为有效的数字
   - [.trim](https://v2.cn.vuejs.org/v2/guide/forms.html#trim) - 输入首尾空格过滤
- **用法**：在表单控件或者组件上创建双向绑定

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697704771965-5cd3241e-2748-4c8f-81aa-86166d9cd98a.png#averageHue=%23efeded&clientId=ua8dfa591-4c93-4&from=paste&height=470&id=ub9ebfdf7&originHeight=587&originWidth=1239&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=120712&status=done&style=none&taskId=u8e20ec81-9909-492f-b4e6-9e605c4b294&title=&width=991.2)
```vue
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>For</title>
  <!-- 引入开发包 -->
  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
</head>

<body>
  <div id="app">
    <!-- v-model -->
    <div>
      <input type="text" v-model="name">
      <input type="password" v-model="password">
      <select v-model="sex">
        <option value="男">男</option>
        <option value="女">女</option>
      </select>
    </div>
    <!-- 填写的信息 -->
    <div>
      <p>姓名:{{name}}</p>
      <p>密码:{{password}}</p>
      <p>性别：{{sex}}</p>
    </div>

    <script>
      // 创建Vue实例
      var app = new Vue({
        // 挂载点: 通过id选择器找到挂载点
        el: '#app',
        // 数据
        data: {
          // 姓名
          name: '',
          // 密码
          password: "",
          // 性别
          sex: "",
          // 爱好
          hobby: [],
          // 城市
          city: "",

        },
        // 方法
        methods: {
        },
      })
    </script>
```
**lazy **
在默认情况下，v-model 在每次 input 事件触发后将输入框的值与数据进行同步 (除了[上述](https://v2.cn.vuejs.org/v2/guide/forms.html#vmodel-ime-tip)输入法组合文字时)。你可以添加 lazy 修饰符，从而转为在 change 事件_之后_进行同步：

| ```vue
<!-- 在“change”时而非“input”时更新 -->
<input v-model.lazy="msg">
```
 |
| --- |

**number **
如果想自动将用户的输入值转为数值类型，可以给 v-model 添加 number 修饰符：

| ```vue
<input v-model.number="age" type="number">
```
 |
| --- |

这通常很有用，因为即使在 type="number" 时，HTML 输入元素的值也总会返回字符串。如果这个值无法被 parseFloat() 解析，则会返回原始的值。
**trim **
如果要自动过滤用户输入的首尾空白字符，可以给 v-model 添加 trim 修饰符：

| ```vue
<input v-model.trim="msg">
```
 |
| --- |

其他的请参考官方文档，或者自己使用时查询文档
## 2.6 案例
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697705425081-d29bb8d5-6f7b-4f2b-9039-6da91b1a1ea3.png#averageHue=%23f9f7f7&clientId=ua8dfa591-4c93-4&from=paste&height=446&id=udda0bff7&originHeight=558&originWidth=1251&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=135329&status=done&style=none&taskId=uaa554e7b-aaac-49b8-982e-ad747aaeef1&title=&width=1000.8)
```vue
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="./css/index.css" />
  <title>记事本</title>
</head>
<body>
  <!-- 主体区域 -->
  <section id="app">
    <!-- 输入框 -->
    <header class="header">
      <h1>小黑记事本</h1>
      <input v-model="todoName" placeholder="请输入任务" class="new-todo" />
      <button @click="add" class="add">添加任务</button>
    </header>
    <!-- 列表区域 -->
    <section class="main">
      <ul class="todo-list">
        <li class="todo" v-for="(item, index) in list" :key="item.id">
          <div class="view">
            <span class="index">{{ index + 1 }}.</span> <label>{{ item.name }}</label>
            <button @click="del(item.id)" class="destroy"></button>
          </div>
        </li>
      </ul>
    </section>
    <!-- 统计和清空 → 如果没有任务了，底部隐藏掉 → v-show -->
    <footer class="footer" v-show="list.length > 0">
      <!-- 统计 -->
      <span class="todo-count">合 计:<strong> {{ list.length }} </strong></span>
      <!-- 清空 -->
      <button @click="clear" class="clear-completed">
        清空任务
      </button>
    </footer>
  </section>

  <!-- 底部 -->
  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
  <script>
    // 添加功能
    // 1. 通过 v-model 绑定 输入框 → 实时获取表单元素的内容
    // 2. 点击按钮，进行新增，往数组最前面加 unshift
    const app = new Vue({
      el: '#app',
      data: {
        todoName: '',
        list: [
          { id: 1, name: '跑步一公里' },
          { id: 2, name: '跳绳200个' },
          { id: 3, name: '游泳100米' },
        ]
      },
      methods: {
        del(id) {
          // console.log(id) => filter 保留所有不等于该 id 的项
          this.list = this.list.filter(item => item.id !== id)
        },
        add() {
          if (this.todoName.trim() === '') {
            alert('请输入任务名称')
            return
          }
          this.list.unshift({
            id: +new Date(),
            name: this.todoName
          })
          this.todoName = ''
        },
        clear() {
          this.list = []
        }
      }
    })

  </script>
</body>

</html>
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697705553062-85167538-824e-4ada-9041-bf2dd45ba936.png#averageHue=%23f5f4f4&clientId=ua8dfa591-4c93-4&from=paste&height=628&id=u43f09993&originHeight=785&originWidth=1838&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=50153&status=done&style=none&taskId=u0cde0ff8-5247-46af-ad24-961b9832c42&title=&width=1470.4)
## 2.7 扩展
### 2.7.1 数据代理
Vue的数据代理是一种让Vue实例直接访问data选项中定义的属性的机制，在Vue实例创建时，Vue会使用Object.defineProperty方法重新定义data选项中的属性，并将它们代理到Vue实例本身上，这样，我们就可以通过Vue实例直接访问data选项中定义的属性，而不需要使用this.$data。
```vue
<!--
 * @Description: 侦听属性
 * @version: 1.0
 * @Author: shu
 * @Date: 2023-04-16 16:46:33
 * @LastEditors: 修改者填写
 * @LastEditTime: 2023-04-16 16:46:33
-->
<!DOCTYPE html>
<html lang="en">


<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>侦听属性</title>
    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
</head>

<body>
    <div id="app">
    </div>
    <script>
        var obj = {}
        var value = 'Hello, World!'
        Object.defineProperty(obj, 'message', {
            get: function () {
                console.log('Getting value: ' + value)
                return value
            },
            set: function (newValue) {
                console.log('Setting value: ' + newValue)
                value = newValue
            }
        })
        console.log(obj.message) // 输出: Getting value: Hello, World!  Hello, World!
        obj.message = 'Hello, Vue!'
        console.log(obj.message) // 输出: Setting value: Hello, Vue!  Getting value: Hello, Vue!  Hello, Vue!


    </script>

</html>
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681636229053-1ebf4017-0099-425f-801d-670c796c1b13.png#averageHue=%23f6f3f2&clientId=u7b427bd2-ac52-4&from=paste&height=298&id=u1df7228a&originHeight=373&originWidth=1849&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=59440&status=done&style=none&taskId=u2ce927e4-b455-4555-ba41-41dea45437b&title=&width=1479.2)

- 在这个示例中，我们首先定义了一个名为obj的空对象，然后使用Object.defineProperty方法将一个名为message的属性添加到该对象中。
- 我们定义了message属性的getter和setter方法，这些方法会在属性被访问或修改时被调用。在getter方法中，我们输出当前属性的值，然后返回该值。
- 在setter方法中，我们输出新的属性值，然后将其赋给value变量。
- 当我们使用obj.message访问message属性时，getter方法会被调用，并输出属性的当前值，当我们使用obj.message = 'Hello, Vue!' 修改message属性的值时，setter方法会被调用，并输出新的属性值。
- 在Vue中，Object.defineProperty方法被使用来将data选项中的属性转换为具有响应式更新能力的属性。当我们修改Vue实例上的某个属性的值时，实际上会调用该属性的setter方法，从而触发响应式更新。
- 这样，我们就可以实现数据的自动更新，而不需要手动调用更新方法。
### 2.7.2 **列表渲染的Key的唯一性**
🌈**为啥需要保证key唯一？**
⏺️在Vue的列表渲染中，为什么要求每个子组件或元素都必须有一个唯一的key属性呢？这是因为Vue在进行列表渲染时，会基于key属性来判断两个元素是否相同，以便进行优化操作。
⏺️具体来说，当Vue进行列表渲染时，它会为每个子组件或元素创建一个虚拟节点（Virtual Node），这些虚拟节点会被缓存在内存中，以便在列表数据发生变化时进行比较和更新。在创建虚拟节点时，Vue会根据每个子组件或元素的key属性来判断它们是否相同。
⏺️如果两个子组件或元素的key属性相同，则它们被认为是同一个元素，并且不需要重新渲染；如果两个子组件或元素的key属性不同，则它们被认为是不同的元素，并且需要重新渲染。
```vue
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>For</title>
    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
</head>

<body>
    <div id="app">
        <div>
            <ul>
                <li v-for="(item,index) in items" :key="id" >{{index}}--{{  item.name  }} </li>
            </ul>
            <button @click="add()">增加</button>
            <button @click="del()">删除</button>
            <button @click="change()">修改</button>
        </div>
    </div>
    <script>
        var app = new Vue({
            el: '#app',
            data: {
                items: [
                    { id: 1, name: 'Alice' },
                    { id: 2, name: 'Bob' },
                    { id: 3, name: 'Charlie' }
                ]
            },
            methods: {
                add() {
                   this.items.push({ id: 4, name: 'David' })
                },
                del(){
                    this.items.splice(1,1)
                },
                change(){
                    this.items[0].name = '测试'
                }
            },
        })
    </script>
```
我们来总结下：

1. Vue会监测数据源数组（如items）的变化，当数组发生变化时，Vue会重新计算虚拟DOM树并比较新旧DOM树之间的差异。
2. 对于新旧DOM树之间的每个元素，Vue会根据其key属性来判断它们是否是同一个元素。如果两个元素的key相同，则Vue认为它们是同一个元素，会对其进行更新操作；否则Vue会将其视为不同的元素，会对其进行添加或删除操作。
3. 当Vue判断出需要对一个元素进行更新操作时，Vue会根据元素对应的虚拟DOM节点（如VNode）的属性来更新DOM节点的状态，例如更新文本内容、样式、属性等。在更新DOM节点的过程中，Vue也会更新对应的数据源数组中的元素。
4. 当Vue判断出需要对一个元素进行添加或删除操作时，Vue会在DOM树中插入或删除对应的DOM节点，并更新数据源数组的长度和索引。
5. 当列表中的元素数量非常大时，Vue可能会采用一些优化策略来提高渲染性能，例如使用对象池来复用已有的DOM节点，使用异步更新队列来合并多个更新操作等。

