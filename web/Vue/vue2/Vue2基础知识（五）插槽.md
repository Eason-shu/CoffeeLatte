---
title: Vue2基础知识（五）插槽
sidebar_position: 5
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

# 一 插槽
## 1.1 如何理解插槽

- Slot 通俗的理解就是“占坑”，在组件模板中占好了位置，当使用该组件标签时候，组件标签里面的内容就会自动填坑（替换组件模板中slot位置）。
- 并且可以作为承载分发内容的出口。
- 简单来说就是占位符。
## 1.2 默认插槽
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1698026970505-66ce4f17-7632-4564-8870-bf02f7a7a862.png#averageHue=%23f8f7f6&clientId=u1265b008-bd14-4&from=paste&height=447&id=u74c56a75&originHeight=559&originWidth=1272&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=124792&status=done&style=none&taskId=u04084e1f-c0b1-40fe-b111-87537de806c&title=&width=1017.6)
```vue
<template>
	<div class="category">
		<h3>{{title}}分类</h3>
		<!-- 定义一个插槽（挖个坑，等着组件的使用者进行填充） -->
		<slot>我是一些默认值，当使用者没有传递具体结构时，我会出现</slot>
	</div>
</template>

<script>
	export default {
    // 组件的名称
		name:'CustomSlots',
    // 组件的属性
		props:['title']
	}
</script>

<style scoped>
	.category{
		background-color: skyblue;
		width: 200px;
		height: 300px;
	}
	h3{
		text-align: center;
		background-color: orange;
	}
	video{
		width: 100%;
	}
	img{
		width: 100%;
	}
</style>

```
```vue
<template>
  <div id="app">
    <CustomSlots title="美食">
      <ul>
        <li v-for="(item,index) in foods" :key="index">{{item}}</li>
      </ul>
    </CustomSlots>
    <CustomSlots title="游戏">
      <ul>
        <li v-for="(item,index) in games" :key="index">{{item}}</li>
      </ul>
    </CustomSlots>
    <CustomSlots title="电影">
      <ul>
        <li v-for="(item,index) in films" :key="index">{{item}}</li>
      </ul>
    </CustomSlots>
  
  </div>
</template>

<script>

import CustomSlots from './components/CustomSlots.vue'

export default {
  name: 'App',
  components: {
    CustomSlots
  },
  data() {
			return {
				foods:['火锅','烧烤','小龙虾','牛排'],
				games:['红色警戒','穿越火线','劲舞团','超级玛丽'],
				films:['《教父》','《拆弹专家》','《你好，李焕英》','《小鞋子》']
			}
		},
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
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1698027239299-d98d704f-0867-4595-824d-30661bdfeeae.png#averageHue=%23fdfcfb&clientId=u1265b008-bd14-4&from=paste&height=706&id=u4b7e0523&originHeight=883&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=35231&status=done&style=none&taskId=ue610bc9e-9d7c-43c0-b418-be4c78e74cf&title=&width=1536)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1698027252117-494f1391-1d8e-4736-b2e9-8e9f00c61fe2.png#averageHue=%23fbfafa&clientId=u1265b008-bd14-4&from=paste&height=416&id=u43f52076&originHeight=520&originWidth=1318&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=104629&status=done&style=none&taskId=ue8dd90fb-3e21-4497-b6a8-9228b91ecad&title=&width=1054.4)

## 1.3 具名插槽

slot 元素有一个特殊的 **attribute：name**。通过该属性可以将内容放在指定的插槽里。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1698027437618-f73ef04c-7a46-46ea-a27c-1d678e1fd152.png#averageHue=%23acaaaa&clientId=u1265b008-bd14-4&from=paste&height=517&id=ua3b40e85&originHeight=646&originWidth=1183&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=154917&status=done&style=none&taskId=ucbab1176-4669-4e56-a1f4-59c1dbf83c8&title=&width=946.4)
```vue
<template>
	<div class="category">
		<h3>{{title}}分类</h3>
		<!-- 定义一个插槽（挖个坑，等着组件的使用者进行填充） -->
		<slot name="center">我是一些默认值，当使用者没有传递具体结构时，我会出现1</slot>
		<slot name="footer">我是一些默认值，当使用者没有传递具体结构时，我会出现2</slot>
	</div>
</template>

<script>
	export default {
		name:'NameSlots',
		props:['title']
	}
</script>

<style scoped>
	.category{
		background-color: skyblue;
		width: 200px;
		height: 300px;
	}
	h3{
		text-align: center;
		background-color: orange;
	}
	video{
		width: 100%;
	}
	img{
		width: 100%;
	}
</style>

```
```vue
 <NameSlots title="美食">
      <template v-slot:footer>
        <ul>
          <li v-for="(item,index) in foods" :key="index">{{item}}</li>
        </ul>
      </template>
      <template v-slot:center>
        <ul>
          <li v-for="(item,index) in foods" :key="index">{{item}}</li>
        </ul>
      </template>
    </NameSlots>
```

- 如果一个slot不带name属性的话，那么它的name默认为default
在向具名插槽提供内容的时候，我们可以在template元素上使用v-slot指令，并以参数的形式提供其名称
- 简化写法：
```vue
 <NameSlots title="美食">
      <template #footer>
        <ul>
          <li v-for="(item,index) in foods" :key="index">{{item}}</li>
        </ul>
      </template>
      <template #center>
        <ul>
          <li v-for="(item,index) in foods" :key="index">{{item}}</li>
        </ul>
      </template>
    </NameSlots>
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1698027566698-b61872f7-e97f-40e3-bb83-b86fcc18fba6.png#averageHue=%23fbfafa&clientId=u1265b008-bd14-4&from=paste&height=422&id=u15ba0b6d&originHeight=527&originWidth=1196&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=80950&status=done&style=none&taskId=u1029763f-ad0c-40a4-a290-ff1b136d803&title=&width=956.8)
## 1.4 数据作用域
**数据在组件的自身，但根据数据生成的结构需要组件的使用者来决定**。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1698027754541-0559d061-16a9-4788-aee6-3d64a54d9772.png#averageHue=%23dbd9d9&clientId=u1265b008-bd14-4&from=paste&height=490&id=uc53d78c2&originHeight=612&originWidth=1269&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=254320&status=done&style=none&taskId=u31372664-c497-4f87-a41f-f171134f106&title=&width=1015.2)
```vue
<template>
	<div class="category">
		<h3>{{title}}分类</h3>
		<slot :games="games" msg="hello">我是默认的一些内容</slot>
	</div>
</template>

<script>
	export default {
		name:'ScopeSlots',
		props:['title'],
		data() {
			return {
				games:['红色警戒','穿越火线','劲舞团','超级玛丽'],
			}
		},
	}
</script>

<style scoped>
	.category{
		background-color: skyblue;
		width: 200px;
		height: 300px;
	}
	h3{
		text-align: center;
		background-color: orange;
	}
	video{
		width: 100%;
	}
	img{
		width: 100%;
	}
</style>

```
```vue
 <ScopeSlots title="美食">
      <template scope="joney">
				<ul>
					<li v-for="(g,index) in joney.games" :key="index">{{g}}</li>
				</ul>
			</template>
    </ScopeSlots>


    <ScopeSlots title="游戏">
			<template scope="{games}">
				<ol>
					<li style="color:red" v-for="(g,index) in games" :key="index">{{g}}</li>
				</ol>
			</template>
		</ScopeSlots>


		<ScopeSlots title="游戏">
			<template slot-scope="{games}">
				<h4 v-for="(g,index) in games" :key="index">{{g}}</h4>
			</template>
		</ScopeSlots>


    <ScopeSlots title="电影">
      <template v-slot="joney">
        <h4 v-for="(f,index) in joney.films" :key="index">{{f}}</h4>
      </template>
    </ScopeSlots>
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1698030100007-a7896e55-b856-493e-8c36-1eab37ee6adb.png#averageHue=%23fbfaf9&clientId=u1265b008-bd14-4&from=paste&height=416&id=u76e8bb14&originHeight=520&originWidth=1267&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=98197&status=done&style=none&taskId=ue676d1ee-a375-4e3e-87ee-47b430cfe6b&title=&width=1013.6)
