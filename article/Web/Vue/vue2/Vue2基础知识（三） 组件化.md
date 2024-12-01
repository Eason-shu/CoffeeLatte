---
title: Vue2基础知识（三） 组件化
sidebar_position: 3
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

 

---

- 📏 官网：[https://v2.cn.vuejs.org](https://v2.cn.vuejs.org/)
- ⛳ 参考教程：[https://www.bilibili.com/video/BV1HV4y1a7n4](https://www.bilibili.com/video/BV1HV4y1a7n4?p=1)
- 🔧 Vue脚手架：[https://cli.vuejs.org/zh](https://cli.vuejs.org/zh/)
- 🔧 VueRouter：[https://router.vuejs.org/zh](https://router.vuejs.org/zh/)
- 🔧 VueX：[https://vuex.vuejs.org/zh](https://vuex.vuejs.org/zh/)

---

# 一 组件
参考官网：[Vue.js](https://v2.cn.vuejs.org/)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1682130523281-bab1da2e-d5c2-4f7d-9b8e-cfd6bb506113.png#averageHue=%23ededed&clientId=u02baa243-174e-4&from=paste&id=u201407b8&originHeight=544&originWidth=1406&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=32923&status=done&style=none&taskId=u5c195007-2b93-4884-a56b-5d5bbdd2747&title=)
## 1.1 组件的定义

-  官方定义：组件（Component）是 Vue.js 最强大的功能之一，组件可以扩展 HTML 元素，封装可重用的代码。在较高层面上，组件是自定义元素， Vue.js 的编译器为它添加特殊功能。在有些情况下，组件也可以是原生 HTML 元素的形式，以 is 特性扩展。
- 组件机制的设计，可以让开发者把一个复杂的应用分割成一个个功能独立组件，降低开发的难度的同时，也提供了极好的复用性和可维护性，组件的出现，就是为了拆分Vue实例的代码量的，能够让我们以不同的组件，来划分不同的功能模块，将来我们需要什么样的功能，就可以去调用对应的组件即可。
- 组件是可复用的 Vue 实例，所以它们与 new Vue 接收相同的选项，例如 data、computed、watch、methods 以及生命周期钩子等。仅有的例外是像 el 这样根实例特有的选项。
## 1.2 特点 

- 模块化： 是从代码逻辑的角度进行划分的；方便代码分层开发，保证每个功能模块的职能单一。
- 组件化： 是从UI界面的角度进行划分的；前端的组件化，方便UI组件的重用。
## 1.3 Vue-extend
参考官网：[API — Vue.js](https://v2.cn.vuejs.org/v2/api/#Vue-extend)
使用基础 Vue 构造器，创建一个子类，数是一个包含组件选项的对象。
简单来说，就是创建一个新的组件，也就是我们说的局部注册一个组件
```vue
<!DOCTYPE html>
<html lang="en">

  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>组件的定义</title>
    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
    </head>

      <body>
      <div id="app">
      <my-component></my-component>
      <my-components></my-components>

      </div>
      <script>
      // 注册一个组件，全局注册
      Vue.component('my-component', {
        template: '<div>这是一个组件</div>',
        // 注意：zai组件中，data必须是一个函数，而不能直接是一个对象
        data() {
          return {
            name: 'shu'
          }
        },
        // methods
        methods: {
          sayHi() {
            console.log('hi');
          }
        },
        // computed
        computed: {
          sayHello() {
            return 'hello'
          }
        },
        // 过滤器
        filters: {
          sayGoodbye() {
            return 'goodbye'
          }
        },
      })
      // 注册一个局部组件
      const MyComponent = Vue.extend({
        data() {
          return {
            message: 'Hello, World!'
          }
        },
        template: '<div>{{ message }}</div>'
      })


      // 创建一个根实例
      var app = new Vue({
        el: '#app',
        components: {
          'my-components': MyComponent
        },

      })
      // 原型链
      Vue.prototype.$myMixin = {
        created() {
          console.log('Hello from $myMixin!')
        }
      }


      // 打印原型链
      console.log('@', MyComponent.prototype.__proto__);
      // 打印Vue原型链
      console.log('@', Vue.prototype);
      // 总结：组件的定义，有两种方式，一种是全局注册，一种是局部注册，
      // 全局注册：Vue.component('my-component', {template: '<div>这是一个组件</div>'})
      // 局部注册：const MyComponent = Vue.extend({template: '<div>这是一个组件</div>'})
      // 组件是一个独立的可复用的Vue实例，它有自己的data、methods、computed、watch、生命周期钩子等
    </script>
```
🌈总结

1. 一个组件的 data 选项必须是一个函数，因此每个实例可以维护一份被返回对象的独立的拷贝
2. 全局注册：Vue.component('my-component', {template: '<div>这是一个组件</div>'})
3. 局部注册：const MyComponent = Vue.extend({template: '<div>这是一个组件</div>'})

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697881724332-857dbf35-1ed6-4382-b0c9-87c44a187131.png#averageHue=%23dddcdb&clientId=u47d6ef6c-0074-4&from=paste&height=458&id=u4ef79021&originHeight=550&originWidth=1104&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=100072&status=done&style=none&taskId=ube563102-2d60-4c3e-9c0f-6953a41d54b&title=&width=919.999963442486)
## 1.4 VueCompent 

- 组件其实是一个名为VueComponent的构造函数，且不是程序员定义的，是Vue.extend自动生成的
- 每写一个组件Vue会通过Vue.extend生成一个全新的VueComponent,写一个school组件，新生成一个VueComponent，当我们再写一个student组件时，又会重新生成一个全新的VueComponent，注意：这里只是针对于非单文件组件。

🌈Vue与VueComponent的关系
显示原型（prototype）与隐式原型（proto）：

- 函数的prototype属性：在定义函数时自动添加的，默认值时一个空Object对象
- 对象的__proto__属性：创建对象时自动添加的，默认值为构造函数的prototype属性

访问一个对象属性时：

- 先在自身属性中查找，找到返回
- 如果没有，再沿着 __proto__这条链向上查找，找到返回
- 如果最终没有找到，返回undefined

Object[原型对象](https://so.csdn.net/so/search?q=%E5%8E%9F%E5%9E%8B%E5%AF%B9%E8%B1%A1&spm=1001.2101.3001.7020)是原型链的尽头（proto=null）
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1682155054092-24590cce-c57a-4245-8b74-ea878f72e4e5.png#averageHue=%23423e39&clientId=u02baa243-174e-4&from=paste&id=u41d259a6&originHeight=1080&originWidth=1440&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=580836&status=done&style=none&taskId=uc0ca5cb6-9c9a-48e8-9081-bc33018355b&title=)
核心重点： Vue强制更改了VueComponent的原型对象指向Object的原型对象的隐式链，将其改到指向Vue的原型对象上。
# 二 脚手架
参考官网：[Vue CLI](https://cli.vuejs.org/zh/)
## 2.1 安装
Node 版本要求
Vue CLI 4.x 需要 [Node.js](https://nodejs.org/) v8.9 或更高版本 (推荐 v10 以上)。你可以使用 [n](https://github.com/tj/n)，[nvm](https://github.com/creationix/nvm) 或 [nvm-windows](https://github.com/coreybutler/nvm-windows) 在同一台电脑中管理多个 Node 版本。

- 安装
```vue
npm install -g @vue/cli
# OR
yarn global add @vue/cli
```

- 校验
```vue
vue --version
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1682155469850-51cb6185-b071-474e-ad6b-6bc95b1d6226.png#averageHue=%230c0c0c&clientId=u02baa243-174e-4&from=paste&height=480&id=ua6c3a37d&originHeight=600&originWidth=1200&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=17786&status=done&style=none&taskId=u1dcfd122-d6d2-47ac-928a-b098d86d90d&title=&width=960)

- 命令创建一个项目
```vue
用法：create [options] <app-name>

创建一个由 `vue-cli-service` 提供支持的新项目


选项：

  -p, --preset <presetName>       忽略提示符并使用已保存的或远程的预设选项
  -d, --default                   忽略提示符并使用默认预设选项
  -i, --inlinePreset <json>       忽略提示符并使用内联的 JSON 字符串预设选项
  -m, --packageManager <command>  在安装依赖时使用指定的 npm 客户端
  -r, --registry <url>            在安装依赖时使用指定的 npm registry
  -g, --git [message]             强制 / 跳过 git 初始化，并可选的指定初始化提交信息
  -n, --no-git                    跳过 git 初始化
  -f, --force                     覆写目标目录可能存在的配置
  -c, --clone                     使用 git clone 获取远程预设选项
  -x, --proxy                     使用指定的代理创建项目
  -b, --bare                      创建项目时省略默认组件中的新手指导信息
  -h, --help                      输出使用帮助信息
```

- 图像化创建、
```vue
vue ui
```
上述命令会打开一个浏览器窗口，并以图形化界面将你引导至项目创建的流程。

- 案例：

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697878291181-8b68db76-913e-482f-9db5-bf85b1d351b7.png#averageHue=%23101010&clientId=u47d6ef6c-0074-4&from=paste&height=502&id=ub855cec1&originHeight=603&originWidth=1110&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=56896&status=done&style=none&taskId=u0ed288c7-d0dd-4279-98bf-ecfe04bc356&title=&width=924.9999632438039)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697878324307-e89d4b51-0494-408f-815b-8cbdbe818308.png#averageHue=%23101010&clientId=u47d6ef6c-0074-4&from=paste&height=519&id=u6c9ddd5a&originHeight=623&originWidth=1110&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=45458&status=done&style=none&taskId=ub0af29b4-5ff0-42db-9fcb-a727949fb1a&title=&width=924.9999632438039)
## 2.2 结构目录
```vue
├── build --------------------------------- 项目构建(webpack)相关配置文件，配置参数什么的，一般不用动 
│   ├── build.js --------------------------webpack打包配置文件
│   ├── check-versions.js ------------------------------ 检查npm,nodejs版本
│   ├── dev-client.js ---------------------------------- 设置环境
│   ├── dev-server.js ---------------------------------- 创建express服务器，配置中间件，启动可热重载的服务器，用于开发项目
│   ├── utils.js --------------------------------------- 配置资源路径，配置css加载器
│   ├── vue-loader.conf.js ----------------------------- 配置css加载器等
│   ├── webpack.base.conf.js --------------------------- webpack基本配置
│   ├── webpack.dev.conf.js ---------------------------- 用于开发的webpack设置
│   ├── webpack.prod.conf.js --------------------------- 用于打包的webpack设置
├── config ---------------------------------- 配置目录，包括端口号等。我们初学可以使用默认的。
│   ├── dev.env.js -------------------------- 开发环境变量
│   ├── index.js ---------------------------- 项目配置文件
│   ├── prod.env.js ------------------------- 生产环境变量
│   ├── test.env.js ------------------------- 测试环境变量
├── node_modules ---------------------------- npm 加载的项目依赖模块
├── src ------------------------------------- 我们要开发的目录，基本上要做的事情都在这个目录里。
│   ├── assets ------------------------------ 静态文件，放置一些图片，如logo等
│   ├── components -------------------------- 组件目录，存放组件文件，可以不用。
│   ├── main.js ----------------------------- 主js
│   ├── App.vue ----------------------------- 项目入口组件，我们也可以直接将组件写这里，而不使用 components 目录。
│   ├── router ------------------------------ 路由
├── static ---------------------------- 静态资源目录，如图片、字体等。
├── .babelrc--------------------------------- babel配置文件
├── .editorconfig---------------------------- 编辑器配置
├── .gitignore------------------------------- 配置git可忽略的文件
├── index.html ------------------------------ 	首页入口文件，你可以添加一些 meta 信息或统计代码啥的。
├── package.json ---------------------------- node配置文件，记载着一些命令和依赖还有简要的项目描述信息 
├── .README.md------------------------------- 项目的说明文档，markdown 格式。想怎么写怎么写，不会写就参照github上star多的项目，看人家怎么写的
```
## 2.3 Render函数
参考官网：[API — Vue.js](https://v2.cn.vuejs.org/v2/api/#render)

- 简单的说，在vue中我们使用模板HTML语法组建页面的，使用render函数我们可以用js语言来构建DOM。 因为vue是虚拟DOM，所以在拿到template模板时也要转译成VNode的函数，而用render函数构建DOM，vue就免去了转译的过程。
- render 函数即渲染函数，它接收一个createElement 方法作为第一个参数用来创建 VNode。（简单的说就是 render函数的参数也是一个函数）
```vue
/*
* render: 渲染函数
* 参数: createElement
* 参数类型: Function
*/
render: function (createElement) {}
```
createElement也是一个函数，它接受三个参数

- 【必填】一个 HTML 标签名、组件选项对象，或者resolve 了上述任何一种的一个 async 函数。类型：{String | Object | Function}
- 【可选】一个与模板中 attribute 对应的数据对象。 类型:{Object}
- 【可选】子级虚拟节点 (VNodes) 类型：{String | Array}

示例：
```php
//模板写法
 <div id="demo" style="color: #ff0000" @click="handleClick">
     Hello Vue!
 </div>

//渲染函数写法
render: function (createElement) {
      return createElement('div', {
        attrs: {
          id: 'demo'
        },
        //给div绑定样式
        style:{
          color: '#ff0000'
        },
        //给div绑定点击事件　
        on: {
          click: this.handleClick
        }
      }, 'Hello Vue!')
 },
```
将 h 作为 createElement 的别名是 Vue 生态系统中的一个通用惯例，当然我们也可以看到一个页面在组成结构：结构+逻辑+样式
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697879974836-1190a118-faeb-425d-8e4c-479030214f3d.png#averageHue=%23b2b0b0&clientId=u47d6ef6c-0074-4&from=paste&height=528&id=u97fb907a&originHeight=634&originWidth=1398&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=196081&status=done&style=none&taskId=u47c56a74-6561-4d18-91c3-5dc7476d291&title=&width=1164.999953707061)
## 2.4 修改默认配置
参考官网：[配置参考 | Vue CLI](https://cli.vuejs.org/zh/config/)
就是Vue.config.js的配置
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1682156128780-9be85202-74cf-4c1f-a185-7e53f3a65078.png#averageHue=%23a5925d&clientId=u02baa243-174e-4&from=paste&height=653&id=u92d9e614&originHeight=816&originWidth=1958&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=175205&status=done&style=none&taskId=u2c9bd0a5-03bc-4092-b7d0-77fff38ae5b&title=&width=1566.4)
## 2.5 Ref 属性
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697885802758-36c3470d-8187-4adc-b42f-a95d62837803.png#averageHue=%23f9f7f6&clientId=u47d6ef6c-0074-4&from=paste&height=426&id=u338659f2&originHeight=511&originWidth=1438&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=121851&status=done&style=none&taskId=uec286072-3f60-4c06-b735-306d13194cb&title=&width=1198.3332857158468)
Vue中的ref属性用于在模板或组件中给某个元素或组件注册一个唯一标识符。这个标识符可以被用来访问这个元素或组件的实例或属性。ref可以绑定到DOM元素、组件或是子组件上。
```vue
<template>
  <div>
    <input ref="myInput" type="text">
    <button @click="focusInput">Focus Input</button>
  </div>
</template>

<script>
export default {
  methods: {
    focusInput() {
      this.$refs.myInput.focus()
    }
  }
}
</script>
```

- 我们在input元素上使用ref属性来注册一个名为myInput的标识符，然后在focusInput方法中使用this.$refs.myInput来访问该元素的实例，并调用focus()方法聚焦该元素。
- 需要注意的是，$refs是一个特殊属性，它包含了所有通过ref注册的元素和组件的实例。这个属性只在组件渲染完成后才会被填充。
- 在组件中，ref可以绑定到子组件上，如下面的例子所示：
```vue
<template>
  <div>
    <my-component ref="myComponent"></my-component>
    <button @click="callChildMethod">Call Child Method</button>
  </div>
</template>

<script>
import MyComponent from './MyComponent.vue'

export default {
  components: {
    MyComponent
  },
  methods: {
    callChildMethod() {
      this.$refs.myComponent.childMethod()
    }
  }
}
</script>

```
需要注意的是，当ref用于绑定到组件上时，$refs属性将引用组件实例而不是DOM元素。
## 2.6 Prop 属性
参考官网：[组件基础 — Vue.js](https://v2.cn.vuejs.org/v2/guide/components.html#%E9%80%9A%E8%BF%87-Prop-%E5%90%91%E5%AD%90%E7%BB%84%E4%BB%B6%E4%BC%A0%E9%80%92%E6%95%B0%E6%8D%AE)

- 我的理解，在我们的实际开发过程中，我们的组件存在父子组件的关系，但是父子组件需要通信，这时就需要prop属性
- Prop 是你可以在组件上注册的一些自定义 attribute，当一个值传递给一个 prop attribute 的时候，它就变成了那个组件实例的一个 property

下面我们来看个案例
```vue
<template>
    <div>
        <h1 >son</h1>
        <h2>来自父亲的消息{{msg}}</h2>
    </div>
</template>

<script>

export default {
    name: "SonComponent",
    // 通过props接收父组件传递过来的数据
    props: {
        msg: String
    },
    methods: {
        click() {
            this.$emit('click')
        }
    }
}
</script>
```
```vue
<template>
    <div>
        <h1>father</h1>
        <button @click="click">给儿子发送消息</button>
        <SonComponent :msg="msg"></SonComponent>
    </div>
</template>

<script>
import SonComponent from './Son.vue'
export default {
    name: "FatherComponent",
    data: function () {
        return {
            msg: '我是你爸爸'
        }
    },
    components: {
        SonComponent
    },
    methods: {
        click() {
            this.msg = '我是你爸爸，我给你发了一条消息'
        }
    }
}
</script>
```
当我们点击按钮时，子组件可以接受到父组件传递的值，具体参考官网，其中还包括类型检查，动态传递Prop，单向数据流等等
## 2.7 Mixin 属性

- 混入 (mixin) 提供了一种非常灵活的方式，来分发 Vue 组件中的可复用功能。一个混入对象可以包含任意组件选项。当组件使用混入对象时，所有混入对象的选项将被“混合”进入该组件本身的选项。
- 将组件的公共逻辑或者配置提取出来，哪个组件需要用到时，直接将提取的这部分混入到组件内部即可。这样既可以减少代码冗余度，也可以让后期维护起来更加容易。
- 这里需要注意的是：提取的是逻辑或配置，而不是HTML代码和CSS代码。其实大家也可以换一种想法，mixin就是组件中的组件，Vue组件化让我们的代码复用性更高，那么组件与组件之间还有重复部分，我们使用Mixin在抽离一遍。
```vue
// 定义一个混入对象
var myMixin = {
  created: function () {
    this.hello()
  },
  methods: {
    hello: function () {
      console.log('hello from mixin!')
    }
  }
}

// 定义一个使用混入对象的组件
var Component = Vue.extend({
  mixins: [myMixin]
})

var component = new Component() // => "hello from mixin!"
```
## 2.8 插件
参考官网：[API — Vue.js](https://v2.cn.vuejs.org/v2/api/#Vue-use)
安装 Vue.js 插件。如果插件是一个对象，必须提供 install 方法。如果插件是一个函数，它会被作为 install 方法。install 方法调用时，会将 Vue 作为参数传入，该方法需要在调用 new Vue() 之前被调用，当 install 方法被同一个插件多次调用，插件将只会被安装一次。
来个案例：
```vue
// myPlugin.js

const MyPlugin = {}

MyPlugin.install = function (Vue, options) {
  // 添加全局方法或属性
  Vue.myGlobalMethod = function () {
    console.log('myGlobalMethod is called')
  }

  // 添加全局资源（指令、过滤器、组件）
  Vue.directive('my-directive', {
    bind (el, binding, vnode, oldVnode) {
      // 绑定时的逻辑
    },
    // ...其他生命周期钩子
  })

  Vue.filter('my-filter', function (value) {
    // 过滤器的实现逻辑
  })

  Vue.component('my-component', {
    // 组件选项
  })
}

export default MyPlugin

```
我们首先定义了一个名为 MyPlugin 的对象，并向其添加了一个名为 install 的方法。然后，在 install 方法中，我们可以添加全局方法或属性、全局资源（指令、过滤器、组件）等，这些添加的全局内容可以在 Vue 实例中直接使用。
使用：
```vue
// main.js

import Vue from 'vue'
import MyPlugin from './myPlugin.js'

Vue.use(MyPlugin)

// 现在可以在应用程序中使用 Vue.myGlobalMethod、<my-component> 等全局内容了

```
需要注意的是，我们在自定义插件时，应该尽可能保持插件的功能单一性，将不同的功能分散在不同的插件中。这样可以提高插件的可复用性，并方便我们管理和维护应用程序的功能。
## 2.9 Scoped 
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697881629051-858b654a-c7c6-4b84-89a9-960c5a7d55f4.png#averageHue=%23f9f7f5&clientId=u47d6ef6c-0074-4&from=paste&height=461&id=u33a1ab67&originHeight=553&originWidth=1023&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=151275&status=done&style=none&taskId=u16aa1979-889e-45d7-a9b7-8f5d34ffbfb&title=&width=852.4999661246949)
Vue中的style标签上有一个特殊的属性scoped，当style标签拥有scoped属性时候，它的css样式只能作用于当前的Vue组件，防止组件之间污染。
```vue
<!-- Add "scoped" attribute to limit CSS to this component only -->
  <style scoped>h3 {
    margin: 40px 0 0;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  a {
    color: #42b983;
}</style>
```
# 三 组件
## 3.1 组件的注册
我们的组件必须先注册才能使用，分为局部注册于全局注册
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697880228198-27ac7347-b0a6-4138-bfc8-ec045747633f.png#averageHue=%23fbe7d7&clientId=u47d6ef6c-0074-4&from=paste&height=484&id=ua4c3e583&originHeight=581&originWidth=1236&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=80246&status=done&style=none&taskId=u095d3367-4153-47ba-8323-f4f33eb5674&title=&width=1029.9999590714788)
### 3.1.1 局部注册
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697880477504-6c91b7ad-bc27-4f3a-8b48-95d7b8974e2a.png#averageHue=%23b7b5b4&clientId=u47d6ef6c-0074-4&from=paste&height=453&id=uaf4b7aad&originHeight=544&originWidth=1222&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=146468&status=done&style=none&taskId=u9ffb6aa2-c42c-49ea-aa91-b8dbcce82f2&title=&width=1018.3332928684039)

- 首先我们定义一个组件：PartialRegistration
```vue
<template>
  <div class="part">我是局部注册组件</div>
</template>
<script>
export default {
  // 组件名称
  name: 'PartialRegistration',
  // 组件数据
  data() {
    return {
      // ...
    }
  },
}
</script>

<style scoped>
.part {
  color: red;
  width: 100px;
  height: 100px;
  background-color: antiquewhite;
  text-align: center;
}
</style>


```

- 在需要使用的组件中注册该组件
```vue
<!--
 * @Author: EasonShu
 * @Date: 2023-10-21 16:49:48
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-10-21 17:30:38
 * @FilePath: \vue-demo01\src\App.vue
-->
<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <PartialRegistration/>
  </div>
</template>

<script>
// 引入组件
import PartialRegistration from './components/PartialRegistration.vue'
export default {
  name: 'App',
  // 局部注册组件
  components: {
    // 简写形式
    PartialRegistration
    // 完整形式
    // PartialRegistration: PartialRegistration
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

```
我们可以通过浏览器的Vue工具进行查看
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697880987345-026809cd-3b8c-42fd-818e-07c206fb478b.png#averageHue=%23fefefe&clientId=u47d6ef6c-0074-4&from=paste&height=547&id=u2cd35cdf&originHeight=657&originWidth=1916&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=45897&status=done&style=none&taskId=u2c32bfab-0f3a-47f5-a25e-355991e10f6&title=&width=1596.6666032208361)
### 3.1.2 全局注册
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697881072154-3769dffe-db29-441e-90c7-121a7da41522.png#averageHue=%23d6d4d3&clientId=u47d6ef6c-0074-4&from=paste&height=479&id=u77f2ada9&originHeight=575&originWidth=1182&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=157693&status=done&style=none&taskId=u60b447e1-09e0-4eb7-bd30-a7c625bb789&title=&width=984.9999608596181)

- 全局注册组件一般是我们需要常用的组件进行封装，供组件的其他地方进行使用
- 首先我们定义一个全局组件：GlobalRegistration
```vue
<!--
 * @Author: EasonShu
 * @Date: 2023-10-21 17:38:59
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-10-21 17:41:19
 * @FilePath: \vue-demo01\src\components\GlobalRegistration.vue
-->
<template>
  <div class="global">我是全局注册组件</div>
</template>
<script>
export default {
  // 组件名称
  name: 'GlobalRegistration',
  // 组件数据
  data() {
    return {
      // ...
    }
  },
}

</script>
<style scoped>
.global {
  color: rgb(0, 38, 255);
  width: 100px;
  height: 100px;
  margin-left: 200px;
  background-color: antiquewhite;
  text-align: center;
}

</style>
```

- 由于是全局使用组件，所以我们需要在main.js中来注册他
```vue
/*
 * @Author: EasonShu
 * @Date: 2023-10-21 16:49:48
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-10-21 17:42:25
 * @FilePath: \vue-demo01\src\main.js
 */
import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

// 注册全局组件
import GlobalRegistration from './components/GlobalRegistration.vue'
Vue.component('GlobalRegistration', GlobalRegistration)

new Vue({
  render: h => h(App),
}).$mount('#app')


```

- 使用
```vue
<!--
 * @Author: EasonShu
 * @Date: 2023-10-21 16:49:48
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-10-21 17:30:38
 * @FilePath: \vue-demo01\src\App.vue
-->
<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <PartialRegistration/>
    <GlobalRegistration />
  </div>
</template>

<script>
// 局部注册组件
import PartialRegistration from './components/PartialRegistration.vue'
export default {
  name: 'App',
  // 局部注册组件
  components: {
    // 简写形式
    PartialRegistration
    // 完整形式
    // PartialRegistration: PartialRegistration
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697881509592-acd3a66f-3214-45a4-9c08-52a917e573ab.png#averageHue=%23fefdfd&clientId=u47d6ef6c-0074-4&from=paste&height=530&id=uaccc5a55&originHeight=636&originWidth=1913&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=53751&status=done&style=none&taskId=u669a63b6-ff64-45b6-b787-58d9319f683&title=&width=1594.1666033201773)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697881527747-fbc70ab8-fea0-4fd7-88e7-6b66bf934bbd.png#averageHue=%23f9f6f5&clientId=u47d6ef6c-0074-4&from=paste&height=448&id=u76fd27f5&originHeight=538&originWidth=1193&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=112985&status=done&style=none&taskId=uf2ff0ab2-3713-42a9-b3c5-568873098b8&title=&width=994.1666271620343)
## 3.2 组件的通信
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697881754171-4e546bea-8eac-4c25-a999-efd41dc56950.png#averageHue=%23fbefe6&clientId=u47d6ef6c-0074-4&from=paste&height=442&id=u58d246ce&originHeight=530&originWidth=1093&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=107851&status=done&style=none&taskId=u93622021-864f-45ba-ac72-024bc0a40ce&title=&width=910.8332971400699)
### 3.2.1 父子关系通信
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697881806355-a1100353-4d31-4aef-803a-4da3ae1fe425.png#averageHue=%239dbc5d&clientId=u47d6ef6c-0074-4&from=paste&height=439&id=u1c2f3eb5&originHeight=527&originWidth=1036&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=64371&status=done&style=none&taskId=u9ba41da6-0896-447c-b2b7-b1bcd58f62e&title=&width=863.3332990275503)
父->子
父组件通过 props 将数据传递给子组件

- 我们首先定义一个父组件：FatherComponent，首先介绍将父组件消息传递给子组件
```vue
<template>
<div> 
  <h1 class="father">我是父组件</h1>
  <hr>
  <SonComponent :msg="msg"></SonComponent>
</div>
</template>
<script>
import SonComponent from './SonComponent.vue'
export default {
  // father组件中注册了son组件
  name: 'FatherComponent',
  // 局部注册组件
  components: {
    SonComponent
  },
  data() {
    return {
      msg: '我是父组件的数据,我会传给子组件'
    }
  },
}

</script>

<style>
.father {
  color: blue;
}
</style>
```

- 子组件需要用prop属性来接受父组件的值
```vue
<template>
  <div> 
    <h1 class="son">我是子组件</h1>
    <hr>
    <p class="son">我是父组件传递过来的数据: {{msg}}</p>
  </div>
  
  </template>
  
  <script>
  export default {
    // 组件名称
    name: 'SonComponent',
    // 接收父组件传递过来的数据
    props: ['msg'],
    data() {
      return {
       
      }
    },
    // 父组件传递过来的数据
    mounted() {
      console.log("xxxxx"+this.msg)
    }
  }
  
  </script>
  
  <style>
  .son {
    color: red;
  }
  </style>
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697882406473-739b62cb-b930-4d40-85f3-06fc39c06ec8.png#averageHue=%23fefdfd&clientId=u47d6ef6c-0074-4&from=paste&height=664&id=u76bd9e3d&originHeight=797&originWidth=1882&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=63988&status=done&style=none&taskId=ucd99f3ba-2b59-482e-a745-d5a48bc3ea4&title=&width=1568.3332710133684)
子->父
子组件利用 $emit 通知父组件，进行修改更新
父组件
```vue
<template>
<div> 
  <h1 class="father">我是父组件</h1>
  <hr>
  <SonComponent :msg="msg" @son-change="handleChanges"></SonComponent>
  <hr>
  <p class="father">我是子组件传递过来的数据: {{msg}}</p>
</div>
</template>
<script>
import SonComponent from './SonComponent.vue'
export default {
  // father组件中注册了son组件
  name: 'FatherComponent',
  // 局部注册组件
  components: {
    SonComponent
  },
  data() {
    return {
      msg: '我是父组件的数据,我会传给子组件'
    }
  },
  methods: {
    // 监听子组件传递过来的数据
    handleChanges(val) {
      console.log("xxxxxx"+val)
      this.msg = val
    }
  }
}

</script>

<style>
.father {
  color: blue;
}
</style>
```
子组件
```vue
<template>
  <div> 
    <h1 class="son">我是子组件</h1>
    <hr>
    <p class="son">我是父组件传递过来的数据: {{msg}}</p>
    <hr>
    <button @click="handleClick">点击我向父组件传递数据</button>
  </div>
  
  </template>
  
  <script>
  export default {
    // 组件名称
    name: 'SonComponent',
    // 接收父组件传递过来的数据
    props: ['msg'],
    data() {
      return {
       
      }
    },
    // 父组件传递过来的数据
    mounted() {
      console.log("xxxxx"+this.msg)
    },
    methods: {
      handleClick() {
        // 向父组件传递数据
        this.$emit('son-change', '哈哈哈，我是子组件传递过来的数据')
      }
    }
  }
  
  </script>
  
  <style>
  .son {
    color: red;
  }
  </style>
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697882858295-7693a8e0-770d-4361-b4f6-332f4522b7d1.png#averageHue=%23fdfcfc&clientId=u47d6ef6c-0074-4&from=paste&height=657&id=u6ea38c5c&originHeight=788&originWidth=1907&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=69591&status=done&style=none&taskId=u3df943a7-7e9f-40be-b52f-ebf27567129&title=&width=1589.1666035188593)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697882872461-7fe698d4-05a9-4d74-a356-d9a33448457a.png#averageHue=%23faf7f6&clientId=u47d6ef6c-0074-4&from=paste&height=460&id=uf375704c&originHeight=552&originWidth=1171&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=107672&status=done&style=none&taskId=u1c0ebbe4-2d94-45dc-9ddc-1bd996dd6ef&title=&width=975.8332945572021)
### 3.2.2 Prop 详解
props主要用于组件的传值，他的工作就是为了接收外面传过来的数据，与data、el、ref是一个级别的配置项，基本的使用上面都讲了下面我们来看看具体的配置信息，props 校验
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697883394739-63f1e91a-f797-4b17-aaa0-7b22c474a75b.png#averageHue=%23adacac&clientId=u47d6ef6c-0074-4&from=paste&height=480&id=u682f3ac8&originHeight=576&originWidth=1195&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=140182&status=done&style=none&taskId=ub1782be8-fa21-46ea-a5d0-6da3da9f296&title=&width=995.8332937624735)

- 父组件
```vue
<template>
<div> 
  <h1 class="father">我是父组件</h1>
  <hr>
  <SonComponent :msg="msg" @son-change="handleChanges" :person="person"></SonComponent>
  <hr>
  <p class="father">我是子组件传递过来的数据: {{msg}}</p>
</div>
</template>
<script>
import SonComponent from './SonComponent.vue'
export default {
  // father组件中注册了son组件
  name: 'FatherComponent',
  // 局部注册组件
  components: {
    SonComponent
  },
  data() {
    return {
      msg: '我是父组件的数据,我会传给子组件',
      person: {
        name: '张三',
        age: 18,
        school: '清华大学',
        city: '北京',
        isMarry: false
      }

    }
  },
  methods: {
    // 监听子组件传递过来的数据
    handleChanges(val) {
      console.log("xxxxxx"+val)
      this.msg = val
    }
  }

}

</script>

<style>
.father {
  color: blue;
}
</style>
```
子组件：
```vue
<template>
  <div> 
    <h1 class="son">我是子组件</h1>
    <hr>
    <p class="son">我是父组件传递过来的数据: {{msg}}</p>
    <hr>
    <button @click="handleClick">点击我向父组件传递数据</button>
    <hr>
    <h1 class="son">我是父组件传递过来的对象数据</h1>
    <p class="son">姓名: {{person.name}}</p>
    <p class="son">年龄: {{person.age}}</p>
    <p class="son">学校: {{person.school}}</p>
    <p class="son">城市: {{person.city}}</p>
    <p class="son">是否结婚: {{person.isMarry}}</p>
  </div>
  
  </template>
  
  <script>
  export default {
    // 组件名称
    name: 'SonComponent',
    // 接收父组件传递过来的数据
    props: {
      msg: {
        type: String, // 数据类型
        default: '我是子组件的默认数据' ,// 默认值
        required: true ,// 是否必须传递
        validator: (value) => {
          // value是父组件传递过来的数据
          // 如果返回true，表示验证通过，如果返回false，表示验证不通过
          return value.length > 5
        }
      },
      person: {
        type: Object,
        default: () => {
          return {
            name: '张三',
            age: 18,
            school: '清华大学',
            city: '北京',
            isMarry: false
          }
        }
      }
    },
    data() {
      return {
       
      }
    },
    // 父组件传递过来的数据
    mounted() {
      console.log("xxxxx"+this.msg)
    },
    methods: {
      handleClick() {
        // 向父组件传递数据
        this.$emit('son-change', '哈哈哈，我是子组件传递过来的数据')
      }
    }
  }
  
  </script>
  
  <style>
  .son {
    color: red;
  }
  </style>
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697883510465-5a4a5121-e0f3-4f2a-a1cb-f915fb3e5a7a.png#averageHue=%23fdfaf9&clientId=u47d6ef6c-0074-4&from=paste&height=372&id=ua48ddc45&originHeight=446&originWidth=1912&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=35221&status=done&style=none&taskId=u8816d6b7-49ab-47f3-b802-36e96edea4d&title=&width=1593.3332700199576)
注意：

- 所有 prop 都使得其父子 prop 之间形成了一个单向下行绑定：父级 prop 的更新会向下流动到子组件中，但是反过来不行。这样会防止子组件意外变更父组件的状态，从而导致你的应用的数据流向难以理解。
- 每次父级组件发生变更时，子组件中所有的 prop 都将会刷新为最新的值。如果你在一个子组件内部改变 prop，Vue 会在浏览器的控制台中发出警告
- 点击按钮子组件会修改父组件传递过来的 prop，浏览器会报错

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697883584647-c8afa1c1-9bdb-477e-b1bd-a52385f6154d.png#averageHue=%23a5bb61&clientId=u47d6ef6c-0074-4&from=paste&height=475&id=u3d136298&originHeight=570&originWidth=1182&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=107193&status=done&style=none&taskId=u35f2396f-0d19-4e50-9ef4-96aa34cb27e&title=&width=984.9999608596181)
### 3.2.3 非父子组件通信
event bus 事件总线
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697884425873-c0eb1190-10bb-447a-9944-f9e7c8b660ca.png#averageHue=%23f0f0f0&clientId=u47d6ef6c-0074-4&from=paste&id=ud42f7b48&originHeight=714&originWidth=1330&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=ud8f74d9e-fa26-43a7-9445-d44c0f4d10b&title=)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697883781981-5e9c738e-59cc-4207-8c77-c0c79329580d.png#averageHue=%23cac6c5&clientId=u47d6ef6c-0074-4&from=paste&height=478&id=u4636a7cb&originHeight=574&originWidth=1196&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=171492&status=done&style=none&taskId=u8a7cdde6-5e0b-490f-b0b7-e4d90456a73&title=&width=996.6666270626931)

- 写一个工具类
```vue
/*
 * @Author: EasonShu
 * @Date: 2023-10-21 18:23:38
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-10-21 18:23:42
 * @FilePath: \vue-demo01\src\utils\EventBus.js
 */
import Vue from 'vue'
const EventBus = new Vue()
export default EventBus
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697884252463-c80c8a9e-0af5-4561-bef2-5ef5b68670b9.png#averageHue=%23242a2f&clientId=u47d6ef6c-0074-4&from=paste&height=372&id=u7cefba69&originHeight=446&originWidth=1819&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=75889&status=done&style=none&taskId=ud581731f-f5ba-4ddc-83d2-d992dbde3ee&title=&width=1515.8332730995307)

- 将这个方法全局注册
```vue
/*
 * @Author: EasonShu
 * @Date: 2023-10-21 16:49:48
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-10-21 18:26:18
 * @FilePath: \vue-demo01\src\main.js
 */
import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

// 注册全局组件
import GlobalRegistration from './components/GlobalRegistration.vue'
Vue.component('GlobalRegistration', GlobalRegistration)
// 注册EventBus
import EventBus from './utils/EventBus.js'
Vue.prototype.$bus = EventBus

new Vue({
  render: h => h(App),
}).$mount('#app')


```

- 父组件
```vue
<template>
<div> 
  <h1 class="father">我是父组件</h1>
  <hr>
  <SonComponent :msg="msg" @son-change="handleChanges" :person="person"></SonComponent>
  <hr>
  <p class="father">我是子组件传递过来的数据: {{msg}}</p>
  <hr>
  <!-- 利用EventBus 传递消息 -->
  <button @click="handleClick">利用EventBus 传递消息</button>
</div>
</template>
<script>
import SonComponent from './SonComponent.vue'
export default {
  // father组件中注册了son组件
  name: 'FatherComponent',
  // 局部注册组件
  components: {
    SonComponent
  },
  data() {
    return {
      msg: '我是父组件的数据,我会传给子组件',
      person: {
        name: '张三',
        age: 18,
        school: '清华大学',
        city: '北京',
        isMarry: false
      }

    }
  },
  methods: {
    // 监听子组件传递过来的数据
    handleChanges(val) {
      console.log("xxxxxx"+val)
      this.msg = val
    },
    handleClick() {
      // 利用EventBus 传递消息
      this.$bus.$emit('father-change', '哈哈哈，我是父组件传递过来的数据')
    }
  }

}

</script>

<style>
.father {
  color: blue;
}
</style>
```

- 子组件
```vue
<template>
  <div> 
    <h1 class="son">我是子组件</h1>
    <hr>
    <p class="son">我是父组件传递过来的数据: {{msg}}</p>
    <hr>
    <button @click="handleClick">点击我向父组件传递数据</button>
    <hr>
    <h1 class="son">我是父组件传递过来的对象数据</h1>
    <p class="son">姓名: {{person.name}}</p>
    <p class="son">年龄: {{person.age}}</p>
    <p class="son">学校: {{person.school}}</p>
    <p class="son">城市: {{person.city}}</p>
    <p class="son">是否结婚: {{person.isMarry}}</p>
    <hr>
    <!-- 接受来EventBus的消息 -->
    <p class="son">接受来EventBus的消息的数据: {{events}}</p>

  </div>
  
  </template>
  
  <script>
  export default {
    // 组件名称
    name: 'SonComponent',
    // 接收父组件传递过来的数据
    props: {
      msg: {
        type: String, // 数据类型
        default: '我是子组件的默认数据' ,// 默认值
        required: true ,// 是否必须传递
        validator: (value) => {
          // value是父组件传递过来的数据
          // 如果返回true，表示验证通过，如果返回false，表示验证不通过
          return value.length > 5
        }
      },
      person: {
        type: Object,
        default: () => {
          return {
            name: '张三',
            age: 18,
            school: '清华大学',
            city: '北京',
            isMarry: false
          }
        }
      }
    },
    data() {
      return {
       events: ''
      }
    },
    // 父组件传递过来的数据
    mounted() {
      console.log("xxxxx"+this.msg)
      // 接受来EventBus的消息
      this.$bus.$on('father-change', (val) => {
        this.events = val
      })
    },
    methods: {
      handleClick() {
        // 向父组件传递数据
        this.$emit('son-change', '哈哈哈，我是子组件传递过来的数据')
      }
    }
  }
  </script>
  <style>
  .son {
    color: red;
  }
  </style>
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697884333201-8dcd40a2-cd0b-45c4-b437-a1632224a1ff.png#averageHue=%23fdfcfc&clientId=u47d6ef6c-0074-4&from=paste&height=461&id=uf56e462f&originHeight=553&originWidth=1920&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=53966&status=done&style=none&taskId=uc17bc62b-af10-490c-abf6-8e68711fe7b&title=&width=1599.9999364217147)
后面我们还会介绍Vuex
## 3.3 组件的其他知识
### 3.3.1 .sync 修饰符

- .[sync](https://so.csdn.net/so/search?q=sync&spm=1001.2101.3001.7020)修饰符可以实现子组件与父组件的双向绑定，并且可以实现子组件同步修改父组件的值。
- 一般情况下，想要实现父子组件间值的传递，通常使用的是 props 和自定义事件 $emit 。
- 其中，父组件通过 props 将值传给子组件，子组件再通过 $emit 将值传给父组件，父组件通过事件j监听获取子组件传过来的值。
- 如果想要简化这里的代码，可以使用.sync修饰符，实际上就是一个语法糖。

父组件
```vue
<!--
 * @Author: EasonShu
 * @Date: 2023-10-21 17:50:39
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-10-21 18:46:16
 * @FilePath: \vue-demo01\src\components\FatherComponent.vue
-->
<template>
<div> 
  <h1 class="father">我是父组件</h1>
  <hr>
  <SonComponent :msg="msg" @son-change="handleChanges" :isShow.sync="isShow" :person="person"></SonComponent>
  <hr>
  <p class="father">我是子组件传递过来的数据: {{msg}}</p>
  <hr>
  <!-- 利用EventBus 传递消息 -->
  <button @click="handleClick">利用EventBus 传递消息</button>
  <hr>
  <!-- 监听子组件按钮的显示状态 -->
  <p>子组件按钮状态：{{ isShow }} </p>
</div>
</template>
<script>
import SonComponent from './SonComponent.vue'
export default {
  // father组件中注册了son组件
  name: 'FatherComponent',
  // 局部注册组件
  components: {
    SonComponent
  },
  data() {
    return {
      msg: '我是父组件的数据,我会传给子组件',
      person: {
        name: '张三',
        age: 18,
        school: '清华大学',
        city: '北京',
        isMarry: false
      },
      isShow: true
    }
  },
  methods: {
    // 监听子组件传递过来的数据
    handleChanges(val) {
      console.log("xxxxxx"+val)
      this.msg = val
    },
    handleClick() {
      // 利用EventBus 传递消息
      this.$bus.$emit('father-change', '哈哈哈，我是父组件传递过来的数据')
    }
  }

}

</script>

<style>
.father {
  color: blue;
}
</style>
```

- 子组件
```vue
<!--
 * @Author: EasonShu
 * @Date: 2023-10-21 17:51:40
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-10-21 18:48:38
 * @FilePath: \vue-demo01\src\components\SonComponent.vue
-->
<template>
  <div> 
    <h1 class="son">我是子组件</h1>
    <hr>
    <p class="son">我是父组件传递过来的数据: {{msg}}</p>
    <hr>
    <button @click="handleClick">点击我向父组件传递数据</button>
    <hr>
    <h1 class="son">我是父组件传递过来的对象数据</h1>
    <p class="son">姓名: {{person.name}}</p>
    <p class="son">年龄: {{person.age}}</p>
    <p class="son">学校: {{person.school}}</p>
    <p class="son">城市: {{person.city}}</p>
    <p class="son">是否结婚: {{person.isMarry}}</p>
    <hr>
    <!-- 接受来EventBus的消息 -->
    <p class="son">接受来EventBus的消息的数据: {{events}}</p>
    <!-- 按钮的可用状态 -->
    <button :disabled="isShow">我是按钮</button>
    <!-- 改变按钮的状态 -->
    <button @click="changeStatus">改变按钮的状态</button>
  </div>
  
  </template>
  
  <script>
  export default {
    // 组件名称
    name: 'SonComponent',
    // 接收父组件传递过来的数据
    props: {
      msg: {
        type: String, // 数据类型
        default: '我是子组件的默认数据' ,// 默认值
        required: true ,// 是否必须传递
        validator: (value) => {
          // value是父组件传递过来的数据
          // 如果返回true，表示验证通过，如果返回false，表示验证不通过
          return value.length > 5
        }
      },
      person: {
        type: Object,
        default: () => {
          return {
            name: '张三',
            age: 18,
            school: '清华大学',
            city: '北京',
            isMarry: false
          }
        }
      },
      isShow: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
       events: '',
       isShows: true
      }
    },
    // 父组件传递过来的数据
    mounted() {
      console.log("xxxxx"+this.msg)
      // 接受来EventBus的消息
      this.$bus.$on('father-change', (val) => {
        this.events = val
      })
    },
    methods: {
      handleClick() {
        // 向父组件传递数据
        this.$emit('son-change', '哈哈哈，我是子组件传递过来的数据')
      },
      changeStatus() {
        // 向父组件传递数据
        this.$emit('update:isShow', !this.isShow)
      }
    }
  }
  
  </script>
  
  <style>
  .son {
    color: red;
  }
  </style>
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697885577639-5194bdce-8109-4c57-bca1-f32b048b1614.png#averageHue=%23fdfcfc&clientId=u47d6ef6c-0074-4&from=paste&height=517&id=uf566ca46&originHeight=621&originWidth=1906&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=55395&status=done&style=none&taskId=u84ef1100-93ae-405e-abb2-2efb0ded884&title=&width=1588.3332702186397)
### 3.3.2 Vue异步更新
**Vue的异步更新**

- Vue.js是一种用于构建用户界面的渐进式 JavaScript 框架。
- 其中一个非常重要的特性是异步更新。
- 异步更新是指当数据发生变化时，Vue不会立即更新DOM。
- 相反，它会在下一个“tick”或渲染循环中异步执行DOM更新。这种机制可以提高性能，减少不必要的操作
- 当我们直接修改 Vue 实例的数据时，Vue 会在内部将数据更新操作放入一个异步队列中，而不是立即进行更新。
### 3.3.3 $nextTick()
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697889289309-ba3cc4be-2596-4767-a4ea-5cbf42db3a5f.png#averageHue=%23faf9f8&clientId=u47d6ef6c-0074-4&from=paste&height=493&id=ue40ce92f&originHeight=592&originWidth=1385&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=91589&status=done&style=none&taskId=uf1fce37d-6a1b-4653-8d86-1468e2c1725&title=&width=1154.1666208042056)

- $nextTick() 是 Vue.js 框架中的一个方法，它主要用于 DOM 操作。当我们修改 Vue 组件中的数据时，Vue.js 会在下次事件循环前自动更新视图，并异步执行 $nextTick() 中的回调函数。这个过程可以确保 DOM 已经被更新，以及可以操作到最新的 DOM。
- 具体来说，当修改了 Vue 组件中的数据时，Vue.js 并不会立即进行视图更新。Vue.js 会将修改的数据记录下来，并在下一次事件循环时才更新视图。而 $nextTick() 方法则是用于等待这个事件循环结束后再执行回调函数。这样可以确保我们操作 DOM 的时候，DOM 已经被 Vue 更新过了。

案例：
```vue
<!--
 * @Author: EasonShu
 * @Date: 2023-10-21 19:50:08
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-10-21 19:51:18
 * @FilePath: \vue-demo01\src\components\NextTickComponent.vue
-->
<template>
  <div>
  <div>{{message}}</div>
  <!-- 更新消息 -->
  <button @click="updateMessage">Update Message</button>
  </div>
</template>
<script>
  export default {
    name: 'NextTickComponent',
    data () {
      return {
        message: 'Hello Vue'
      }
    },
    methods: {
      updateMessage () {
        this.message = 'Updated Message'
        // 在 DOM 更新后操作 DOM
        this.$nextTick(() => {
          // 通过 DOM API 更新文本
          this.$el.textContent = 'DOM Updated!'
        })
      }
    }
  }
</script>
```






