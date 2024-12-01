---
title: Vue2基础知识（六）路由
sidebar_position: 6
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

# 一 路由
参考文档：[https://v3.router.vuejs.org/zh/installation.html](https://v3.router.vuejs.org/zh/installation.html)
## 1.1 VueRouter
Vue Router 是 [Vue.js](https://link.juejin.cn?target=https%3A%2F%2Fvuejs.org%2F) 的官方路由。它与 Vue.js 核心深度集成，允许你在 Vue 应用中构建单页面应用（SPA），并且提供了灵活的路由配置和导航功能。让用 Vue.js 构建单页应用变得轻而易举。功能包括：

- 路由映射：可以将 url 映射到 Vue组件，实现不同 url 对应不同的页面内容。
- 嵌套路由映射：可以在路由下定义子路由，实现更复杂的页面结构和嵌套组件的渲染。
- 动态路由：通过路由参数传递数据。你可以在路由配置中定义带有参数的路由路径，并通过 **$route.params** 获取传递的参数。
- 模块化、基于组件的路由配置：路由配置是基于组件的，每个路由都可以指定一个 Vue 组件作为其页面内容，将路由配置拆分为多个模块，在需要的地方引入。。
- 路由参数、查询、通配符：通过路由参数传递数据，实现页面间的数据传递和动态展示。
- 导航守卫：Vue Router 提供了全局的导航守卫和路由级别的导航守卫，可以在路由跳转前后执行一些操作，如验证用户权限、加载数据等。
- 展示由 Vue.js 的过渡系统提供的过渡效果：可以为路由组件添加过渡效果，使页面切换更加平滑和有动感。
- 细致的导航控制：可以通过编程式导航（通过 JavaScript 控制路由跳转）和声明式导航（通过  组件实现跳转）实现页面的跳转。
- 路由模式设置：Vue Router 支持两种路由模式：HTML5 history 模式或 hash 模式
- 可定制的滚动行为：当页面切换时，Vue Router 可以自动处理滚动位置。定制滚动行为，例如滚动到页面顶部或指定的元素位置。
- URL 的正确编码：Vue Router 会自动对 URL 进行正确的编码
## 1.2 安装
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1698212967798-57842d96-936d-4b57-b759-54eb7f11b9b7.png#averageHue=%23b5b4b3&clientId=u20d42635-9134-4&from=paste&height=529&id=u59587e12&originHeight=661&originWidth=1384&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=165287&status=done&style=none&taskId=u03b80b02-5285-46b4-b85d-9cb8b851dc3&title=&width=1107.2)
```bash
npm install vue-router
```
如果在一个模块化工程中使用它，必须要通过 Vue.use() 明确地安装路由功能：
```vue
import Vue from 'vue'
import VueRouter from 'vue-router'

  Vue.use(VueRouter)
```
如果使用全局的 script 标签，则无须如此 (手动安装)。
## 1.3 组件

- router-link：通过 router-link 创建链接 其本质是a标签，这使得 Vue Router 可以在不重新加载页面的情况下更改 URL，处理 URL 的生成以及编码。
- router-view：router-view 将显示与 url 对应的组件。
### 1.3.1 $router 、$route
**$route**: 是当前路由信息对象，获取和当前路由有关的信息。 route 为属性是只读的，里面的属性是 immutable (不可变) 的，不过可以通过 watch 监听路由的变化。
```javascript
fullPath: ""  // 当前路由完整路径，包含查询参数和 hash 的完整路径
hash: "" // 当前路由的 hash 值 (锚点)
matched: [] // 包含当前路由的所有嵌套路径片段的路由记录 
meta: {} // 路由文件中自赋值的meta信息
name: "" // 路由名称
params: {}  // 一个 key/value 对象，包含了动态片段和全匹配片段就是一个空对象。
path: ""  // 字符串，对应当前路由的路径
query: {}  // 一个 key/value 对象，表示 URL 查询参数。跟随在路径后用'?'带的参数
```
**$router** 是 vueRouter 实例对象，是一个全局路由对象，通过 this.$router 访问路由器, 可以获取整个路由文件或使用路由提供的方法。
```javascript
// 导航守卫
router.beforeEach((to, from, next) => {
  /* 必须调用 `next` */
})
router.beforeResolve((to, from, next) => {
  /* 必须调用 `next` */
})
router.afterEach((to, from) => {})

动态导航到新路由
router.push
router.replace
router.go
router.back
router.forward
```
## 1.4 动态路由
我们经常需要把某种模式匹配到的所有路由，全都映射到同个组件。例如，我们有一个 User 组件，对于所有 ID 各不相同的用户，都要使用这个组件来渲染。我们可以在 vueRrouter 的路由路径中使用“动态路径参数”(dynamic segment) 来达到这个效果。

- 动态路由的创建，主要是使用 path 属性过程中，使用动态路径参数，路径参数 用冒号 : 表示。

当一个路由被匹配时，它的 params 的值将在每个组件中以 this.$route.query 的形式暴露出来。因此，我们可以通过更新 User 的模板来呈现当前的用户 ID：
```javascript
const routes = [
  {
    path: '/user/:id'
      name: 'User'
components: User
}
]
```
**_vue-router _**通过配置 **_params _**和 **_query _**来实现动态路由
#### 1.4.1 params 传参

- 必须使用 命名路由 name 传值
- 参数不会显示在 url 上
- 浏览器强制刷新时传参会被清空
```javascript
// 传递参数
this.$router.push({
  name: Home，
    params: {
  number: 1 ,
    code: '999'
}
})
// 接收参数
const p = this.$route.params
```
#### 1.4.2 query 传参

- 可以用 name 也可以使用 path 传参
- 传递的参数会显示在 url 上
- 页面刷新是传参不会丢失
```javascript
// 方式一：路由拼接
this.$router.push('/home?username=xixi&age=18')

// 方式二：name + query 传参
this.$router.push({
  name: Home，
    query: {
  username: 'xixi',
    age: 18
}
})


// 方式三：path + name 传参
this.$router.push({
  path: '/home'，
query: {
  username: 'xixi',
    age: 18
}
})

// 接收参数
const q = this.$route.query
```
## 1.5 Keep-alive
keep-alive是vue中的内置组件，能在组件切换过程中将状态保留在内存中，防止重复渲染DOM。
keep-alive 包裹动态组件时，会缓存不活动的组件实例，而不是销毁它们。
和 transition 相似，keep-alive 是一个抽象组件：它自身不会渲染一个 DOM 元素，也不会出现在组件的父组件链中。
keep-alive 可以设置以下props属性：

- include - 字符串或正则表达式。只有名称匹配的组件会被缓存
- exclude - 字符串或正则表达式。任何名称匹配的组件都不会被缓存
- max - 数字。最多可以缓存多少组件实例

在不缓存组件实例的情况下，每次切换都会重新 _**render**_，执行整个生命周期，每次切换时，重新 _**render**_，重新请求，必然不满足需求。 会消耗大量的性能
### 1.5.1 keep-alive 的基本使用
只是在进入当前路由的第一次render，来回切换不会重新执行生命周期，且能缓存router-view的数据。 通过 include 来判断是否匹配缓存的组件名称： **匹配首先检查组件自身的 name 选项**，如果 name 选项不可用，则匹配它的局部注册名称 (父组件 components 选项的键值)，**匿名组件不能被匹配**
```javascript
<keep-alive>
	<router-view></router-view>
</keep-alive>

<keep-alive include="a,b">
  <component :is="view"></component>
</keep-alive>

<!-- 正则表达式 (使用 `v-bind`) -->
<keep-alive :include="/a|b/">
  <component :is="view"></component>
</keep-alive>

<!-- 数组 (使用 `v-bind`) -->
<keep-alive :include="['a', 'b']">
  <component :is="view"></component>
</keep-alive>
```
### 1.5.2 路由配置 keepAlive
在路由中设置 keepAlive 属性判断是否需要缓存
```javascript
{
  path: 'list',
    name: 'itemList', // 列表页
    component (resolve) {
    require(['@/pages/item/list'], resolve)
  },
  meta: {
    keepAlive: true,
      compName: 'ItemList'
    title: '列表页'
  }
}

{
  path: 'management/class_detail/:id/:activeIndex/:status',
    name: 'class_detail',
    meta: {
    title: '开班详情',
      keepAlive: true,
      compName: 'ClassInfoDetail',
      hideInMenu: true,
      },
      component: () => import('src/views/classManage/class_detail.vue'),
      },
```
使用
```javascript
<div id="app" class='wrapper'>
  <keep-alive>
  <!-- 需要缓存的视图组件 --> 
  <router-view v-if="$route.meta.keepAlive"></router-view>
  </keep-alive>
  <!-- 不需要缓存的视图组件 -->
  <router-view v-if="!$route.meta.keepAlive"></router-view>
  </div>
```
## 1.6 路由守卫

- 导航守卫主要用来通过跳转或取消的方式守卫导航。有多种机会植入路由导航过程中：全局的, 单个路由独享的, 或者组件级的。
- 通俗来讲：路由守卫就是路由跳转过程中的一些生命周期函数（钩子函数），我们可以利用这些钩子函数帮我们实现一些需求。
- 路由守卫又具体分为 **全局路由守卫**、**独享守卫** 及 **组件路由守卫**。
### 1.6.1 **全局路由守卫**

- 全局前置守卫router.beforeEach
- 全局解析守卫：router.beforeResolve
- 全局后置守卫：router.afterEach
#### 1.6.2 beforeEach(to,from, next)
在路由跳转前触发，参数包括to,from,next 三个，这个钩子作用主要是用于登录验证。
前置守卫也可以理解为一个路由拦截器，也就是说所有的路由在跳转前都要先被前置守卫拦截。
```javascript
router.beforeEach(async (to, from, next) => {
  // 清除面包屑导航数据
  store.commit('common/SET_BREAD_NAV', [])
  // 是否白名单
  if (isWhiteList(to)) {
    next()
  } else {
    // 未登录,先登录
    try {
      if (!store.state.user.userInfo) {
        await store.dispatch('user/getUserInfo')
        // 登录后判断，是否有角色, 无角色 到平台默认页
        if (!store.state.user.userInfo.permissions || !store.state.user.userInfo.permissions.length) {
          next({ path: '/noPermission' })
        }
      }

      // 登录后判断，是否有访问页面的权限
      if (!hasVisitPermission(to, store.state.user.userInfo)) {
        next({ path: '/404' })
      } else {
        next()
      }
    } catch (err) {
      $error(err)
    }
  }
})
```
#### 1.6.3 beforeResolve(to,from, next)
在每次导航时都会触发，区别是在导航被确认之前，同时在所有组件内守卫和异步路由组件被解析之后，解析守卫就被正确调用。
即在 beforeEach 和 组件内 beforeRouteEnter 之后，afterEach之前调用。
router.beforeResolve 是获取数据或执行任何其他操作的理想位置
```javascript
router.beforeResolve(async to => {
  if (to.meta.requiresCamera) {
    try {
      await askForCameraPermission()
    } catch (error) {
      if (error instanceof NotAllowedError) {
        // ... 处理错误，然后取消导航
        return false
      } else {
        // 意料之外的错误，取消导航并把错误传给全局处理器
        throw error
      }
    }
  }
})
```
#### 1.6.4 afterEach(to,from)
和beforeEach相反，他是在**路由跳转完成后触发**，参数包括to, from 由于此时路由已经完成跳转 所以不会再有next。
全局后置守卫对于分析、更改页面标题、声明页面等辅助功能以及许多其他事情都很有用。
```javascript
router.afterEach((to, from) => {
  // 在路由完成跳转后执行，实现分析、更改页面标题、声明页面等辅助功能
  sendToAnalytics(to.fullPath)
})
```
### 1.6.2 独享路由守卫
**beforeEnter(to,from, next)** 独享路由守卫可以直接在**路由配置**上定义，但是它**只在进入路由时触发**，不会在 params、query 或 hash 改变时触发。
```javascript
const routes = [
  {
    path: '/users/:id',
    component: UserDetails,
    // 在路由配置中定义守卫
    beforeEnter: (to, from,next) => {
      next()
    },
  },
]
```
或是使用数组的方式传递给 beforeEnter ，有利于实现路由守卫的重用
```javascript
function removeQueryParams(to) {
  if (Object.keys(to.query).length)
    return { path: to.path, query: {}, hash: to.hash }
}

function removeHash(to) {
  if (to.hash) return { path: to.path, query: to.query, hash: '' }
}

const routes = [
  {
    path: '/users/:id',
    component: UserDetails,
    beforeEnter: [removeQueryParams, removeHash],
  },
  {
    path: '/about',
    component: UserDetails,
    beforeEnter: [removeQueryParams],
  },
]
```
### 1.6.3 组件路由守卫
在组件内使用的钩子函数，类似于组件的生命周期， 钩子函数执行的顺序包括

- beforeRouteEnter(to,from, next) -- 进入前
- beforeRouteUpdate(to,from, next) -- 路由变化时
- beforeRouteLeave(to,from, next) -- 离开后

组件内路由守卫的执行时机：
```javascript
<template>
  ...
  </template>
export default{
  data(){
    //...
  },

  // 在渲染该组件的对应路由被验证前调用
  beforeRouteEnter (to, from, next) {
    // 此时 不能获取组件实例 this
    // 因为当守卫执行前，组件实例还没被创建
    next((vm)=>{
      // next 回调 在 组件 beforeMount 之后执行 此时组件实例已创建，
      // 可以通过 vm 访问组件实例
      console.log('A组件中的路由守卫==>> beforeRouteEnter 中next 回调 vm', vm)
      )
  },

  // 可用于检测路由的变化
  beforeRouteUpdate (to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用  此时组件已挂载完可以访问组件实例 `this`
    // 举例来说，对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
    // 由于会渲染同样的 Foo 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
    console.log('组件中的路由守卫==>> beforeRouteUpdate')
    next()
  },

  // 在导航离开渲染该组件的对应路由时调用
  beforeRouteLeave (to, from, next) {
    // 可以访问组件实例 `this`
    console.log('A组件中的路由守卫==>> beforeRouteLeave')
    next()
  }
}
  <style>
  ...
  </style>
```
注意 beforeRouteEnter 是支持给 next 传递回调的唯一守卫。对于 beforeRouteUpdate 和 beforeRouteLeave 来说，this 已经可用了，所以不支持 传递回调，因为没有必要了
### 1.6.4 路由守卫触发流程
**页面加载时路由守卫触发顺序：**![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1698239667852-d2dd6c1c-34e0-4ca6-bf59-ec129caaeeb4.webp#averageHue=%23f7f7f6&clientId=u05750b32-c289-4&from=paste&id=uea47685a&originHeight=262&originWidth=538&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=u586f209a-5349-4aac-af02-665f85cce97&title=)

1. 触发全局的路由守卫 beforeEach
2. 组件在路由配置的独享路由 beforeEnter
3. 进入组件中的 beforeRouteEnter，此时无法获取组件对象
4. 触发全局解析守卫 beforeResolve
5. 此时路由完成跳转 触发全局后置守卫 afterEach
6. 组件的挂载 beforeCreate --> created --> beforeMount
7. 路由守卫 beforeRouterEnter 中的 next回调， 此时能够获取到组件实例 vm
8. 完成组件的挂载 mounted

**当点击切换路由时**： A页面跳转至B页面触发的生命周期及路由守卫顺序： ![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1698239667852-fef7d4e2-29a1-4504-b89a-0169b2ae2b26.webp#averageHue=%23f6f5f5&clientId=u05750b32-c289-4&from=paste&id=ucf79a769&originHeight=282&originWidth=493&originalType=url&ratio=1.2000000476837158&rotation=0&showTitle=false&status=done&style=none&taskId=uc21aa311-1296-4a82-9f5d-77cb8e9109b&title=)

1. 导航被触发进入其他路由。
2. 在离开的路由组件中调用 beforeRouteLeave 。
3. 调用全局的前置路由守卫 beforeEach 。
4. 在重用的组件里调用 beforeRouteUpdate 守卫。
5. 调用被激活组件的路由配置中调用 beforeEnter。
6. 解析异步路由组件。
7. 在被激活的组件中调用 beforeRouteEnter。
8. 调用全局的 beforeResolve 守卫。
9. 导航被确认。
10. 调用全局后置路由 afterEach 钩子。
11. 触发 DOM 更新，激活组件的创建及挂载 beforeCreate (新)-->created (新)-->beforeMount(新) 。
12. 调用 beforeRouteEnter 守卫中传给 next 的回调函数，创建好的组件实例会作为回调函数的参数传入。
13. 失活组件的销毁 beforeDestory(旧)-->destoryed(旧)
14. 激活组件的挂载 mounted(新)

路由守卫的触发顺序 beforeRouterLeave-->beforeEach-->beforeEnter-->beforeRouteEnter-->beforeResolve-->afterEach--> beforeCreate (新)-->created (新)-->beforeMount(新) -->beforeRouteEnter中的next回调 -->beforeDestory(旧)-->destoryed(旧)-->mounted(新)
**当路由更新时**：触发 beforeRouteUpdate
注意： 但凡涉及到有next参数的钩子，必须调用next() 才能继续往下执行下一个钩子，否则路由跳转等会停止。




### 
