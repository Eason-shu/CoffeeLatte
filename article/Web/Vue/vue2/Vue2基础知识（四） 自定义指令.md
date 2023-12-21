---
title: Vue2基础知识（四） 自定义指令
sidebar_position: 4
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

# 一 自定义指令
## 1.1 定义
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697939259883-726528be-2b8e-4a93-a4de-9dd2793083f5.png#averageHue=%23b3b1b0&clientId=u807e74f5-c20c-4&from=paste&height=572&id=u9823cabe&originHeight=686&originWidth=1407&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=197663&status=done&style=none&taskId=ub05370c0-8b93-4600-a9c1-4135f793310&title=&width=1172.4999534090377)

- vue官方提供很多指令，如：v-model，v-show，v-if，v-if等，他们都以v-开头。当这些指令不能满足我们实际开发需求时，我们还可以自定义指令。
- 自定义指令主要分为全局自定义指令和局部自定义指令。
- 结构：
```vue
directives: {
  focus: {
    // 指令的定义
    inserted: function (el) {
      el.focus()
    }
  }
}
```
## 1.2 自定义局部指令
```vue
<!--
 * @Author: EasonShu
 * @Date: 2023-10-22 09:15:04
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-10-22 19:09:05
 * @FilePath: \vue-demo02\src\components\CustomInstruction.vue
-->
<template>
  <div>
      <!-- <input type="text" v-gfocus> -->
      <input type="text" v-focus>
  </div>
</template>

<script>
// 目标: 创建 "自定义指令", 让输入框自动聚焦
// 1. 创建自定义指令
// 全局 / 局部
// 2. 在标签上使用自定义指令  v-指令名
// 注意:
// inserted方法 - 指令所在标签, 被插入到网页上触发(一次)
// update方法 - 指令对应数据/标签更新时, 此方法执行
export default {
    data(){
        return {
            colorStr: 'red'
        }
    },
    directives: {
        focus: {
            inserted(el){
                el.focus()
                // 提示用户输入
                el.placeholder = '请输入内容'
            }
        }
    }
}
</script>

<style>

</style>

```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697973110278-768a5a11-0abc-4174-adf0-9c6ef5ddc136.png#averageHue=%23fefefe&clientId=u807e74f5-c20c-4&from=paste&height=256&id=u2565ce2f&originHeight=307&originWidth=1920&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=8813&status=done&style=none&taskId=u8136d35f-0a94-4961-b9f7-aaba7d87830&title=&width=1599.9999364217147)
我们可以观察到输入框的变化
## 1.3 全局注册指令
**main.js**
```vue
// 自动获取焦点
Vue.directive('focus', {
  inserted: function (el) {
    el.focus()
     // 提示用户输入
    el.placeholder = '请输入内容'
  }
})
```
与组件一样，如果在Main.js注册了的话就是全局组件，项目任何地方都可以使用
## 1.4 钩子函数
一个指令定义对象可以提供如下几个钩子函数 (均为可选)：

- bind：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
- inserted：被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。
- update：所在组件的 VNode 更新时调用，**但是可能发生在其子 VNode 更新之前**。指令的值可能发生了改变，也可能没有。但是你可以通过比较更新前后的值来忽略不必要的模板更新 (详细的钩子函数参数见下)。
- componentUpdated：指令所在组件的 VNode **及其子 VNode** 全部更新后调用。
- unbind：只调用一次，指令与元素解绑时调用。
```vue
directives: {
    focus: {
      // 只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
      bind(el) {
        console.log(el);
      },
      // 被绑定元素插入父节点时调用(父节点存在即可调用，不必存在于document中)
      inserted(el) {
        el.focus();
        // 提示用户输入
        el.placeholder = "请输入内容";
      },
      // 所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。
      update(el) {
        console.log(el);
      },
      // 指令所在标签, 从网页上移除时触发
      unbind() {
        console.log("指令被移除了");
      },
      // 指令所在标签, 被更新了
      componentUpdated() {
        console.log("指令所在标签, 被更新了");
      },
    },
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697973811454-a0f141cb-46e0-47ae-8feb-4ef1101ffd04.png#averageHue=%23fbfaf8&clientId=u4ef09e7e-d347-4&from=paste&height=144&id=ubcd7ec4c&originHeight=173&originWidth=1900&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=68939&status=done&style=none&taskId=u6b581064-3a54-4146-b433-8883875cc0c&title=&width=1583.333270417322)
指令钩子函数会被传入以下参数：

- el：指令所绑定的元素，可以用来直接操作 DOM。
- binding：一个对象，包含以下 property：
   - name：指令名，不包括 v- 前缀。
   - value：指令的绑定值，例如：v-my-directive="1 + 1" 中，绑定值为 2。
   - oldValue：指令绑定的前一个值，仅在 update 和 componentUpdated 钩子中可用。无论值是否改变都可用。
   - expression：字符串形式的指令表达式。例如 v-my-directive="1 + 1" 中，表达式为 "1 + 1"。
   - arg：传给指令的参数，可选。例如 v-my-directive:foo 中，参数为 "foo"。
   - modifiers：一个包含修饰符的对象。例如：v-my-directive.foo.bar 中，修饰符对象为 { foo: true, bar: true }。
- vnode：Vue 编译生成的虚拟节点。移步 [VNode API](https://v2.cn.vuejs.org/v2/api/#VNode-%E6%8E%A5%E5%8F%A3) 来了解更多详情。
- oldVnode：上一个虚拟节点，仅在 update 和 componentUpdated 钩子中可用。
## 1.5 动态传参
指令的参数可以是动态的。例如，在 v-mydirective:[argument]="value" 中，argument 参数可以根据组件实例数据进行更新！这使得自定义指令可以在应用中被灵活使用。
```vue
 focus: {
      // 只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
      bind(el, binding, vnode, oldVnode) {
        console.log(el);
        console.log(binding);
        console.log(vnode);
        console.log(oldVnode);
      },
      // 被绑定元素插入父节点时调用(父节点存在即可调用，不必存在于document中)
      inserted(el, binding) {
        console.log(binding);
        el.focus();
        // 提示用户输入
        el.placeholder = "请输入内容";
        // 动态指令传参
        el.style.color = binding.value;
      },
      // 所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。
      update(el) {
        console.log(el);
      },
      // 指令所在标签, 从网页上移除时触发
      unbind() {
        console.log("指令被移除了");
      },
      // 指令所在标签, 被更新了
      componentUpdated() {
        console.log("指令所在标签, 被更新了");
      },
    },
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697974061061-a5c61da4-e5ad-478e-b9fc-999d3a203d45.png#averageHue=%23fefefd&clientId=u4ef09e7e-d347-4&from=paste&height=711&id=u142513bf&originHeight=853&originWidth=1899&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=58032&status=done&style=none&taskId=uddfd0347-7942-4999-a31e-2f89a6b7834&title=&width=1582.4999371171023)
在很多时候，你可能想在 bind 和 update 时触发相同行为，而不关心其它的钩子
注意：这里我们可以简写，我们一般也采用的简写的方式
```vue
Vue.directive('color-swatch', function (el, binding) {
  el.style.backgroundColor = binding.value
})
```
## 1.6 使用场景

- 防止重复提交
```vue
// 1.设置v-throttle自定义指令
Vue.directive('throttle', {
  bind: (el, binding) => {
    let throttleTime = binding.value; // 节流时间
    if (!throttleTime) { // 用户若不设置节流时间，则默认2s
      throttleTime = 2000;
    }
    let cbFun;
    el.addEventListener('click', event => {
      if (!cbFun) { // 第一次执行
        cbFun = setTimeout(() => {
          cbFun = null;
        }, throttleTime);
      } else {
        event && event.stopImmediatePropagation();
      }
    }, true);
  },
});
// 2.为button标签设置v-throttle自定义指令
<button @click="sayHello" v-throttle>提交</button>
```

- 水印
```vue
Vue.directive('mark', {
  inserted(el, text) {
        let dom=document.createElement('div');//创建节点
        // 设置css样式
        dom.setAttribute('style','width:100%;transform: rotate(-45deg);top: 50%;position:absolute;opacity:0.1;')
        let time=new Date()
        dom.innerText=text.value||time.toDateString()
        // 如果没有定位则添加定位
        if(getComputedStyle(el,null)["position"]==="static"){
            el.style.position='relative'
        }
        el.appendChild(dom)
    }
})

<div v-mark="11212">
    <!-- <input type="text" v-gfocus> -->
    <input type="text" v-focus />
    <!-- 动态指令传参 -->
    <input type="text" v-focus="colorStr" />
  </div>
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1697974876768-21a529e8-31f9-4cd6-9a08-26951f52a2b9.png#averageHue=%23fefefe&clientId=u4ef09e7e-d347-4&from=paste&height=229&id=u8fcee738&originHeight=275&originWidth=1919&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=3917&status=done&style=none&taskId=ua22e27d0-ad6c-4420-b129-c3d38ced020&title=&width=1599.1666031214952)

