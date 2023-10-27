---
title: Vue2基础知识（七）状态管理
sidebar_position: 7
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

![](https://cdn.nlark.com/yuque/0/2023/gif/12426173/1697695389598-01376028-0111-4de9-a2de-b5f21f123b74.gif#averageHue=%23fcfcfc&clientId=ua8dfa591-4c93-4&from=paste&id=u0ed3a455&originHeight=80&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u634e7ae1-ba5e-4b6e-b637-79674a6e2cd&title=)

- 💌 所属专栏：【Vue2】
- 😀 作 者：长安不及十里
- 💻 工作：目前从事电力行业开发
- 🌈 目标：全栈开发
- 🚀 个人简介：一个正在努力学技术的Java工程师，专注基础和实战分享 ，欢迎咨询！
- 💖 欢迎大家：这里是CSDN，我总结知识的地方，喜欢的话请三连，有问题请私信 😘 😘 😘

---

- 📏 官网：[https://v2.cn.vuejs.org](https://v2.cn.vuejs.org/)
- ⛳ 参考教程：[https://www.bilibili.com/video/BV1HV4y1a7n4](https://www.bilibili.com/video/BV1HV4y1a7n4?p=1)
- 🔧 Vue脚手架：[https://cli.vuejs.org/zh](https://cli.vuejs.org/zh/)
- 🔧 VueRouter：[https://router.vuejs.org/zh](https://router.vuejs.org/zh/)
- 🔧 VueX：[https://vuex.vuejs.org/zh](https://vuex.vuejs.org/zh/)
# 一 Vuex
Vuex 是一个专为 Vue.js 应用程序开发的**状态管理模式**。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。
## 1.1 安装使用
**方法一**

- 下载
```vue
npm install vuex --save
```

- 注册
```vue
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
```
**方法二：**
在[脚手架](https://so.csdn.net/so/search?q=%E8%84%9A%E6%89%8B%E6%9E%B6&spm=1001.2101.3001.7020) 创建项目时勾选vuex的选项系统会自动创建
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1698372251875-ed5fb7bd-dbb9-4eae-9c20-f2afa2e89692.png#averageHue=%23171716&clientId=ucc910fd5-2fef-4&from=paste&id=ud425578a&originHeight=516&originWidth=1219&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uc39e4351-772f-4945-8c45-5f18d7c679c&title=)
## 1.2 核心概念

1. **State（状态）**：State 是应用程序的数据存储中心。它包含了应用程序的各种数据，以便在整个应用程序中共享和访问。在 Vuex 中，状态被存储在一个单一的数据对象中，称为状态树。
2. **Getters（获取器）**：Getters 允许您在状态中派生出一些新的数据，以便在组件中使用。它们类似于 Vue 组件中的计算属性，但它们是存储在 Vuex 中的。
3. **Mutations（突变）**：Mutations 是用来修改状态的函数。它们是同步的，用于在应用程序中更新状态。只有通过 mutation 才能修改状态，这有助于跟踪状态的变化。
4. **Actions（动作）**：Actions 用于处理异步操作或复杂逻辑，它们提交 mutations 来修改状态。通常，您将在 actions 中执行数据获取、异步操作等。Actions 可以包含异步代码，而 mutations 不应该。
5. **Modules（模块）**：当您的应用程序变得非常复杂时，可以将 Vuex 分成多个模块，每个模块有自己的状态、mutations、getters、和 actions。这有助于组织和维护大型应用程序的状态管理。
```javascript
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
export default new Vuex.Store({
  state: { // 存放数据 和data类似
  },
  mutations: { // 用来修改state和getters里面的数据
  },
  getters: { // 相当于计算属性
  },
  actions: { // vuex中用于发起异步请求
  },
  modules: {// 拆分模块
  }
})
```
## 1.3 为啥需要Vuex
![](https://cdn.nlark.com/yuque/0/2023/webp/12426173/1698372047493-af601151-c7e3-41cd-8296-2839908a078f.webp#averageHue=%23fbf4ef&clientId=ucc910fd5-2fef-4&from=paste&id=avzW4&originHeight=600&originWidth=1178&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u2b35ed75-a561-4f95-b053-8706ef86683&title=)

1. **集中式状态管理**：在大型 Vue.js 应用中，多个组件可能需要访问和共享相同的状态数据。使用 Vuex，您可以将应用的状态存储在一个单一的中央存储库（store）中，使得状态变得集中和一致。这有助于避免数据散乱和难以维护的问题。
2. **状态共享**：Vuex 允许不同的组件轻松共享状态，而无需通过复杂的 props 层层传递数据。组件可以直接从 store 中获取状态，这简化了组件之间的通信。
3. **可预测的状态管理**：在 Vuex 中，状态的变化是通过 mutation（突变）来进行的，而且只能通过 mutation 来进行。这种限制确保了状态变化是可跟踪的，使得应用程序的数据流变得可预测。这有助于调试和维护复杂的状态逻辑。
4. **支持异步操作**：在应用程序中，经常需要处理异步操作，如数据获取或 API 调用。Vuex 允许您在 actions（动作）中执行异步操作，以确保状态更新不会被阻塞，同时保持状态的一致性。
5. **开发工具支持**：Vue 开发者工具集成了 Vuex 的调试工具，使您能够实时查看状态的变化、调试 mutations 和 actions，以便更轻松地分析和修复问题。
6. **代码组织和维护**：将状态和状态逻辑集中管理在一个地方有助于更好地组织和维护应用程序代码。您可以清晰地查看应用程序的整体状态和状态变化。
7. **适用于大型应用**：虽然对于小型应用来说，状态管理可能不是绝对必要的，但在大型应用中，随着组件数量的增加，状态管理变得至关重要。Vuex 提供了一种可扩展的方式来管理状态，使得开发和维护大型应用变得更加容易。
## 1.4 state
**理解：数据存储的地方，提供唯一的公共数据源，所有共享的数据统一放到store的state进行储存，相似与data**

- 定义数据源
```javascript
 // 状态
  state: {
    user: {
      name: 'EasonShu',
      age: 18
    },
    count: 110
  },
```

- 使用
```javascript
<!-- 测试Store -->
  <p>{{ $store.state.user.name }}</p>
  <p>{{ $store.state.user.age }}</p>

mounted () {
    // 通过this.$store.state.user.name获取
    console.log(this.$store.state.user.name)
    console.log(this.$store.state.user.age)
  },
```

- 辅助函数使用
```javascript
 ...mapState({
      // 箭头函数可使代码更简练
      user: state => state.user
      // 传字符串参数 'user' 等同于 `state => state.user`
      // user: 'user'
    }),
```
## 1.5 辅助函数
在 Vuex 中，有一些辅助函数和工具，用于更方便地访问和操作状态、触发 mutations、执行 actions 等。这些辅助函数可以简化 Vuex 的使用，提高开发效率。以下是一些常用的 Vuex 辅助函数：

1.  **mapState**: `mapState` 辅助函数可以用于将 store 中的状态映射到组件的计算属性。它接受一个包含状态字段名的数组或对象，并返回一个计算属性对象，可以直接在组件中使用。这样可以简化组件中访问状态的代码。 
```javascript
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['count']) // 映射 count 状态到组件的计算属性
  }
}
```

2.  **mapGetters**: 类似于 `mapState`，`mapGetters` 用于映射 store 中的 getters 到组件的计算属性。这样，您可以轻松地在组件中获取派生状态数据。 
```javascript
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters(['doubleCount']) // 映射 getters 到组件的计算属性
  }
}
```

3.  **mapMutations**: `mapMutations` 辅助函数允许将 mutations 映射到组件的方法，使得在组件中触发 mutations 更简单。这避免了手动调用 `this.$store.commit`。 
```javascript
import { mapMutations } from 'vuex';

export default {
  methods: {
    ...mapMutations(['increment']) // 映射 mutations 到组件的方法
  }
}
```

4.  **mapActions**: 类似于 `mapMutations`，`mapActions` 辅助函数用于将 actions 映射到组件的方法。这使得在组件中执行 actions 更加方便。 
```javascript
import { mapActions } from 'vuex';

export default {
  methods: {
    ...mapActions(['incrementAsync']) // 映射 actions 到组件的方法
  }
}
```
这些辅助函数可以显著简化 Vuex 的使用，减少了在组件中编写繁琐的状态访问和触发 mutations/actions 的代码。
## 1.6 mutation
在 Vuex 中，"Mutation"（突变）是一种用于修改状态（state）的同步函数。Mutations 是 Vuex 中管理状态变化的一种方式，通过 mutations，您可以确保状态的修改是可跟踪和可预测的。以下是关于 Mutations 的一些关键信息：

1.  **Mutations 是同步的**：Mutations 必须是同步函数。它们用于对状态进行同步修改。这意味着 mutations 不应该包含异步操作，如网络请求，因为这些操作会导致状态变化不可预测。 
2.  **提交 Mutations**：要提交（触发）一个 mutation，您需要使用 `commit` 方法。在组件中，可以使用 `this.$store.commit` 来提交 mutation。 
```javascript
// 在组件中提交 mutation
this.$store.commit('increment');
```

3.  **Mutation 函数**：Mutation 函数接受两个参数，第一个参数是当前状态（state），第二个参数是可选的 payload 数据，它包含了要修改状态的信息。通过 mutation 函数可以对状态进行修改。 
```javascript
// 在 Vuex store 中定义 mutation
mutations: {
  increment(state) {
    state.count++;
  },
  incrementBy(state, amount) {
    state.count += amount;
  }
}
```

4.  **命名约定**：通常，mutation 的名称是大写字母和下划线组合的字符串。这是一种常见的命名约定，以表示 mutation 的目的和操作。 
5.  **在组件中使用 Mutation**：在组件中提交 mutation 时，您可以使用 `this.$store.commit`，并传递 mutation 的名称。如果 mutation 需要传递额外的数据，可以在第二个参数中传递。
```javascript
mutations: {
    // 修改状态
    updateUser (state, payload) {
      state.user = payload
    },
    // 新增
    increment (state, payload) {
      console.log('payload', payload)
      state.count += payload
    },
    // 减少
    decrement (state, payload) {
      state.count -= payload
    }
  },
```
```javascript
 <!-- 测试状态的修改 -->
  <button @click="$store.commit('increment', 10)">increment</button>
  <button @click="$store.commit('decrement', 10)">decrement</button>
  <!-- 修改用户信息 -->
  <button @click="$store.commit('updateUser', {name: 'EasonShu0112', age: 18000})">updateUser</button>
  <!-- 通过辅助函数来修改 -->
  <button @click="increments">辅助函数--increment</button>
  <button @click="decrements">辅助函数--decrement</button>
  <button @click="updateUsers">辅助函数--updateUser</button>
// 通过辅助函数来修改
    ...mapMutations(['updateUser', 'increment', 'decrement']),
    increments () {
      this.increment(10)
    },
    decrements () {
      this.decrement(10)
    },
    updateUsers () {
      this.updateUser({ name: 'EasonShu0112', age: 18000 })
    },
```
## 1.7 actions
在 Vuex 中，"Actions"（动作）是用于处理异步操作、执行业务逻辑和提交 Mutations 的函数。Actions 允许您在应用程序中进行异步操作，如数据获取、网络请求等，然后再提交 Mutations 来修改状态。以下是有关 Actions 的一些关键信息：

1.  **异步操作**：Actions 主要用于处理异步操作，但它们也可以包含同步操作。这对于需要在一系列操作中协调不同的步骤时非常有用，例如从服务器获取数据后再更新状态。 
2.  **提交 Mutations**：Actions 通过调用 `commit` 方法来提交 Mutations，以修改状态。这确保了状态的修改是同步的，因为 Mutations 必须是同步函数。 
```javascript
// 在 Action 中提交 Mutation
actions: {
  fetchData(context) {
    // 异步操作，例如网络请求
    fetchDataFromServer().then(data => {
      // 提交 Mutation 来修改状态
      context.commit('setData', data);
    });
  }
}
```

3.  **Action 函数**：Action 函数接受一个包含多个属性的对象，其中包括 `commit`、`state` 和 `dispatch`。您可以使用 `commit` 来提交 Mutations，`state` 来访问当前的状态，`dispatch` 来触发其他 Actions。 
4.  **命名约定**：通常，Action 的名称是驼峰式命名，以表示执行的操作。这是一种常见的命名约定，以更清晰地表达 Action 的目的。 
5.  **在组件中使用 Action**：在组件中调用 Action 时，您可以使用 `this.$store.dispatch`，并传递 Action 的名称。如果 Action 需要传递额外的数据，可以在第二个参数中传递。 
```javascript
 actions: {
    // 异步修改状态
    updateUserAsync (context, payload) {
      setTimeout(() => {
        context.commit('updateUser', payload)
      }, 1000)
    },
    // 异步新增
    incrementAsync (context, payload) {
      setTimeout(() => {
        context.commit('increment', payload)
      }, 1000)
    },
    // 异步减少
    decrementAsync (context, payload) {
      setTimeout(() => {
        context.commit('decrement', payload)
      }, 1000)
    }
  },

 <!-- 异步修改状态 -->
  <button @click="$store.dispatch('incrementAsync', 10)">incrementAsync</button>
  <button @click="$store.dispatch('decrementAsync', 10)">decrementAsync</button>
  <!-- 异步修改用户信息 -->
  <button @click="$store.dispatch('updateUserAsync', {name: 'EasonShu0112', age: 18000})">updateUserAsync</button>
  <!-- 辅助函数异步修改 -->
  <button @click="incrementAsyncs">辅助函数--incrementAsync</button>
  <button @click="decrementAsyncs">辅助函数--decrementAsync</button>
  <button @click="updateUserAsyncs">辅助函数--updateUserAsync</button>
// 异步修改
    ...mapActions(['updateUserAsync', 'incrementAsync', 'decrementAsync']),
    incrementAsyncs () {
      this.incrementAsync(10)
    },
    decrementAsyncs () {
      this.decrementAsync(10)
    },
    updateUserAsyncs () {
      this.updateUserAsync({ name: 'EasonShu0112', age: 18000 })
    }
```
## 1.8 getter
在 Vuex 中，"Getter"（获取器）是用于从状态派生出一些新的数据的函数。Getter 可以理解为用于访问 Vuex store 中状态的计算属性。它们可以接受状态作为参数，进行一些计算或转换，然后返回结果。以下是有关 Getters 的一些关键信息：

1.  **计算属性**：Getters 可以被视为存储在状态上的计算属性。它们类似于组件中的计算属性，但是它们存储在 Vuex 的 store 中，并且可以在多个组件中共享。 
2.  **从状态派生数据**：Getters 的主要目的是从状态中派生（计算）数据，以便在组件中使用。这允许您对状态进行更高级的操作，例如筛选、排序、合并等。 
3.  **Getters 函数**：Getters 是 store 中的函数，它们接受 state 作为参数，然后返回派生数据。 
```javascript
// 在 Vuex store 中定义 Getter
getters: {
  doubleCount: state => state.count * 2
}
```

4.  **在组件中使用 Getter**：在组件中使用 Getter 时，您可以像访问计算属性一样访问它们。Getter 会自动缓存，只有在依赖的状态发生变化时才会重新计算。 
```javascript
// 在组件中使用 Getter
computed: {
  computedDoubleCount() {
    return this.$store.getters.doubleCount;
  }
}
```

5.  **带参数的 Getter**：Getter 可以接受参数，以根据参数进行动态计算。这对于根据传递的参数筛选或过滤状态非常有用。 
```javascript
// 带参数的 Getter
getters: {
  getCountByAmount: state => amount => state.count + amount
}
```
```javascript
// 在组件中使用带参数的 Getter
computed: {
  computedCountByAmount() {
    return this.$store.getters.getCountByAmount(5);
  }
}
```
Getters 的主要作用是将状态树中的数据提供给组件，同时可以在获取数据时进行转换、计算或筛选。
## 1.9 module
在 Vuex 中，"Modules"（模块）是一种用于组织和拆分大型 Vuex store 的方法。模块允许您将 store 分割为多个小的 store，每个模块可以拥有自己的状态、mutations、getters 和 actions。这对于大型应用程序或团队合作开发非常有用。以下是关于 Vuex 模块的一些关键信息：

1.  **创建模块**：要创建一个 Vuex 模块，您可以在 store 中使用 `modules` 属性，为每个模块指定一个名称和相应的配置。 
```javascript
const store = new Vuex.Store({
  modules: {
    moduleA: {
      state: { /* 状态 */ },
      mutations: { /* mutations */ },
      actions: { /* actions */ },
      getters: { /* getters */ }
    },
    moduleB: {
      state: { /* 状态 */ },
      mutations: { /* mutations */ },
      actions: { /* actions */ },
      getters: { /* getters */ }
    }
  }
});
```

2.  **模块状态**：每个模块可以拥有自己的状态。这些状态将组合成根状态树。在组件中，可以使用模块名称来访问模块的状态。 
```javascript
// 访问模块状态
this.$store.state.moduleA.someState;
```

3.  **模块 Mutations 和 Actions**：模块可以拥有自己的 mutations 和 actions。它们在模块内部操作模块状态，但也可以与其他模块共享状态或通过 root actions 来触发全局操作。 
```javascript
// 在模块中定义 mutation
mutations: {
  incrementModuleA(state) {
    state.someState++;
  }
}

// 在模块中定义 action
actions: {
  async fetchDataModuleA(context) {
    // 异步操作
    const data = await fetchData();
    // 提交模块内的 mutation
    context.commit('incrementModuleA');
  }
}
```

4.  **根 Actions 和 Getters**：如果需要在模块中访问根状态或根 actions 和 getters，可以使用 `rootState`、`rootGetters` 和 `dispatch`。 
```javascript
// 在模块中使用根 state 和 dispatch
actions: {
  someAction(context, payload) {
    // 访问根状态
    console.log(context.rootState.someGlobalState);
    // 调用根 action
    context.dispatch('someGlobalAction', payload);
  }
}
```

5.  **命名空间**：默认情况下，模块内的 mutations、actions 和 getters 是全局命名的，意味着它们可以与其他模块中的同名操作冲突。您可以通过在模块配置中设置 `namespaced: true` 来创建命名空间模块，以确保模块的操作不会与其他模块冲突。 
```javascript
// 创建命名空间模块
const moduleA = {
  namespaced: true,
  state: { /* 状态 */ },
  mutations: { /* mutations */ },
  actions: { /* actions */ },
  getters: { /* getters */ }
}
```

6.  **在组件中使用模块**：在组件中访问模块的状态、提交模块的 mutations、触发模块的 actions 等时，需要使用模块名称来访问。 
```javascript
// 访问模块状态
this.$store.state.moduleA.someState;

// 提交模块内的 mutation
this.$store.commit('moduleA/incrementModuleA');

// 触发模块内的 action
this.$store.dispatch('moduleA/fetchDataModuleA');
```
模块使得大型 Vuex store 更加模块化和可维护。每个模块负责自己的状态管理，逻辑独立，有助于提高代码的可读性和维护性。通过使用命名空间，您可以更好地控制操作的命名，以避免命名冲突。模块是在构建大型 Vue.js 应用程序时的有力工具。
