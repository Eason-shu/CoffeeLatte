---
title: Vue2 基本知识理解（一）
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

![](https://cdn.nlark.com/yuque/0/2023/jpeg/12426173/1681639400872-250b4b90-add4-4aae-b0f0-5d53e53c7ae8.jpeg#averageHue=%2394a670&clientId=u7b427bd2-ac52-4&from=paste&id=u16aceef8&originHeight=1440&originWidth=1920&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u7997c693-5ada-4283-81b1-9cb53378591&title=)
# 一 计算属性与侦听器
## 1.1 计算属性
🌈**如何来理解计算属性？**
Vue的计算属性是一个能够基于现有的Vue实例数据进行计算的属性，它们的值是根据依赖的数据动态计算而来的，只有在依赖的数据发生变化时才会重新计算，计算属性常常用于模板表达式中，可以将复杂的逻辑计算封装在计算属性中，使模板更加简洁清晰。
我的理解：通过原有的数据动态计算，才能得一个新的属性
🌈**几个概念？**

1. 计算属性是基于现有的Vue实例数据进行计算的属性，它们的值是根据依赖的数据动态计算而来的。
2. 计算属性具有缓存特性，只有在依赖的数据发生变化时才会重新计算。
3. 计算属性可以被用作模板表达式中的数据绑定。
4. 计算属性支持getter和setter方法，可以通过setter方法实现数据的双向绑定。
```vue
<!--
* @Description: 计算属性的理解
* @version: 1.0
* @Author: shu
* @Date: 2023-04-16 16:14:12
* @LastEditors: 修改者填写
* @LastEditTime: 2023-04-16 16:21:04
-->
  <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>计算属性</title>
    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
    </head>

      <body>
      <div id="app">
      <div>
      <p>商品名称：{{ product.name }}</p>
      <p>商品价格：{{ salePrice }}</p>
      <button @click="product.discount = 0.5">打五折</button>
      </div>
      </div>
      <script>
      var app = new Vue({
      el: '#app',
      data: {
        product: {
          name: '电视机',
          price: 1000,
          discount: 0.8
        }
      },
      computed: {
        salePrice() {
          return this.product.price * this.product.discount
        }
      }
    })
    </script>

    </html>
```
![动画.gif](https://cdn.nlark.com/yuque/0/2023/gif/12426173/1681634431475-fc9fee78-7770-4554-8391-d22a4a8805a3.gif#averageHue=%23f4f4f4&clientId=u7b427bd2-ac52-4&from=ui&id=uf3e123b4&originHeight=981&originWidth=1905&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=80124&status=done&style=none&taskId=uc05c5391-0787-409c-ac25-8164c14f9cd&title=)
上面的例子中，我们定义了一个商品对象，其中包含了商品的名称、价格和折扣，我们通过计算属性salePrice来计算商品的实际售价，然后在模板表达式中使用它来显示商品的价格，由于salePrice是一个计算属性，它的值会随着商品价格和折扣的变化而动态更新，在这个例子中，我们只需要更新商品对象的价格和折扣属性，就可以实现商品价格的实时更新。
## 1.2 方法
我们将上面的案例来改写一种方法，定义方法来写，它有是如何写的呢？
```vue
<!--
 * @Description: 方法
 * @version: 1.0
 * @Author: shu
 * @Date: 2023-04-16 16:29:23
 * @LastEditors: 修改者填写
 * @LastEditTime: 2023-04-16 16:30:34
-->

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>方法</title>
    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
</head>

<body>
    <div id="app">
        <div>
            <p>商品名称：{{ product.name }}</p>
            <p>商品价格：{{ salePrice() }}</p>
            <button @click="product.discount = 0.5">打五折</button>
        </div>
    </div>
    <script>
        var app = new Vue({
            el: '#app',
            data: {
                product: {
                    name: '电视机',
                    price: 1000,
                    discount: 0.8
                }
            },
            methods: {
                salePrice() {
                    return this.product.price * this.product.discount
                }
            }
        })
    </script>

</html>
```
![动画.gif](https://cdn.nlark.com/yuque/0/2023/gif/12426173/1681634456114-9e662b77-1ee5-4090-82b1-c4ea32324694.gif#averageHue=%23f4f4f4&clientId=u7b427bd2-ac52-4&from=ui&id=u0e8d97cd&originHeight=981&originWidth=1905&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=80124&status=done&style=none&taskId=u3e8980ef-707b-458f-9b4e-9754e29e56a&title=)
我们可以发现效果是一样的，但是这其实是有区别的？
⏺️使用计算属性的好处是，它具有缓存特性，只有在依赖的数据发生变化时才会重新计算，因此效率更高。
⏺️而使用methods的方法则需要每次调用都重新计算，因此效率较低，此外，使用计算属性还可以将计算逻辑封装在属性中，使代码更加清晰简洁。
⏺️总之，使用计算属性可以提高代码的可读性和可维护性，同时也可以提高程序的运行效率，但是如果逻辑比较复杂或需要处理异步操作，可能需要使用methods来实现。
## 1.3 **侦听属性**
🌈**如何理解帧听属性？**
Vue中的侦听属性（watch）是一个很有用的特性，它可以让开发者监听某个特定的数据属性，并在其发生变化时执行一些特定的操作，侦听属性通常用于处理需要在特定属性发生变化时进行异步操作或复杂逻辑处理的情况。
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
        <div>
            <p>商品名称：{{ product.name }}</p>
            <p>商品价格：{{ product.price }}</p>
            <p>商品折扣：{{ product.discount }}</p>
            <p>商品折后价：{{ salePrice }}</p>
            <button @click="product.discount = 0.5">打五折</button>
        </div>
    </div>
    <script>
        var app = new Vue({
            el: '#app',
            data: {
                product: {
                    name: '电视机',
                    price: 1000,
                    discount: 0.8
                }
            },
            computed: {
                salePrice() {
                    return this.product.price * this.product.discount
                }
            },
            watch: {
                'product.discount': function (newVal, oldVal) {
                    console.log('newVal: ' + newVal)
                    console.log('oldVal: ' + oldVal)
                }
            }
        })
    </script>
</html>
```
![动画.gif](https://cdn.nlark.com/yuque/0/2023/gif/12426173/1681635163436-16b3d4a4-89b5-4212-b23f-a5ae8565c21b.gif#averageHue=%23f3f2f2&clientId=u7b427bd2-ac52-4&from=paste&height=785&id=u4e9d9eeb&originHeight=981&originWidth=1905&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=225822&status=done&style=none&taskId=u3150b3f7-2969-4b76-b0e4-264f544bc67&title=&width=1524)
我们可以发现对我们指定的属性进行监听，可以发现一个新值，与旧值，这就方便我们进行一些特定的操作
🌈**如何来决定何时使用计算属性与帧听属性？**
在Vue中，使用计算属性和侦听属性都可以处理特定的数据变化，但它们的使用场景是不同的，通常来说，当我们需要计算一些值，并将其作为属性暴露给模板时，可以使用计算属性，而当我们需要在某些数据发生变化时，执行一些异步或复杂的操作，可以使用侦听属性。
具体来说，计算属性适用于以下情况：

- 当需要根据某些数据计算出一个值，并在模板中显示时，可以使用计算属性。例如，计算商品的折扣价格、根据用户输入的关键字过滤数据等等。
- 当需要根据其他属性或状态更新某个属性时，可以使用计算属性。例如，在计算属性中根据用户选择的语言切换页面显示的文字。

侦听属性适用于以下情况：

- 当需要在特定数据发生变化时执行异步或复杂操作时，可以使用侦听属性。例如，当用户选择某个城市时，需要通过网络请求获取该城市的天气信息。
- 当需要监听多个数据变化，并在它们发生变化时执行某些操作时，可以使用侦听属性。例如，当商品数量或价格发生变化时，需要重新计算购物车中的总价。

需要注意的是，使用计算属性和侦听属性时需要注意性能问题，计算属性具有缓存机制，只有在依赖的数据发生变化时才会重新计算，因此不会因为频繁计算而降低性能，而侦听属性则不具有缓存机制，每当侦听的属性变化时都会执行一次处理函数，如果处理函数比较耗时，可能会影响页面的性能。
综上所述，使用计算属性和侦听属性时需要根据具体的业务场景和数据变化的情况进行选择，同时也需要注意性能问题。



# 二 数据代理

## 2. 1 数据代理

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

  
# 三 列表渲染的Key的唯一性

## 3.1 列表渲染的Key的唯一性

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



# 四 数据监测的原理

## 4.1 数据监测的原理

Vue的数据检测原理是响应式编程的一种实现方式，它通过数据劫持和发布-订阅模式来实现数据的自动更新和视图的响应式更新，具体来说，Vue的数据检测原理主要包括以下几个步骤：

1. 数据劫持

当我们使用Vue创建一个实例时，Vue会对其数据对象进行递归地遍历，将每个属性都转换为getter和setter函数，这个过程就是数据劫持。这样，在我们访问或修改数据对象的属性时，Vue就能够捕获到这个操作，并通过getter和setter函数来实现响应式更新。

2. 发布-订阅模式

Vue通过一个中央事件总线（即Vue实例的$emit和$on方法）来实现发布-订阅模式。在数据对象被访问或修改时，Vue会自动触发相应的事件，并通知所有订阅了这个事件的Watcher对象。

3. Watcher对象

Watcher对象是Vue的核心概念之一，它负责监测数据的变化并更新视图。每个Watcher对象都对应着一个DOM元素或组件实例，当Watcher对象接收到数据变化的事件时，它会重新计算虚拟DOM树并更新对应的视图。在Vue的内部实现中，Watcher对象被组织成一个树状结构，并使用依赖收集的方式来管理依赖关系，这样就能够避免不必要的DOM操作，提高渲染性能。

4. 批处理

为了减少不必要的DOM操作，Vue使用了一些优化策略，例如异步更新队列和批处理机制。当数据发生变化时，Vue会将需要更新的Watcher对象添加到一个异步更新队列中，然后通过nextTick方法来异步执行队列中的更新操作。在执行更新操作时，Vue会尽可能地合并多个更新操作，以减少不必要的DOM操作和渲染开销。
```vue
<DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>测试</title>
        <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
    </head>
    <body>
        <div id="app">
            <div>
                <p>{{ message }}</p>
                <button @click="changeMessage">Change Message</button>
            </div>
        </div>
        <script>
            var app = new Vue({
                el: '#app',
                data: {
                    message: 'Hello, Vue!'
                },
                methods: {
                    changeMessage() {
                        this.message = 'Hello, World!'
                    }
                },
            })
        </script>
```

- 在这个案例中，我们有一个数据属性message和一个方法changeMessage，当用户点击按钮时，changeMessage方法会将message的值改为'Hello, World!'。

- 这时，Vue的数据检测机制会自动检测到message的变化，并触发视图的重新渲染，从而将新的值'Hello, World!'显示在页面上。

- 具体来说，当我们创建这个Vue实例时，Vue会对data对象中的message属性进行数据劫持，将其转换为getter和setter函数。

- 当用户点击按钮时，changeMessage方法会修改message的值，这个操作会触发message的setter函数，并向中央事件总线（即Vue实例）发布一个数据变化的事件。

- 此时，与message相关的Watcher对象会接收到这个事件，并将自己添加到异步更新队列中。

- 最后，通过nextTick方法异步执行队列中的更新操作，重新计算虚拟DOM树并更新对应的视图，将新的值'Hello, World!'渲染到页面上。

  
#  五 Vue的生命周期

## 5.1 Vue的生命周期

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681638350154-71c3c60b-ddba-4da9-8ba7-23a3221f0909.png#averageHue=%23fefdfb&clientId=u7b427bd2-ac52-4&from=paste&id=u3e2772be&originHeight=3039&originWidth=1200&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=223114&status=done&style=none&taskId=u4cb48399-a6b6-4a31-b339-fdfabd4adb4&title=)
Vue生命周期是指在一个Vue实例创建、更新和销毁过程中，各个阶段发生的事件和回调函数。Vue的生命周期分为以下8个阶段：

1. 创建前（beforeCreate）：在实例被创建之前调用，此时实例的属性和方法都没有被初始化。
2. 创建后（created）：在实例被创建之后立即调用，此时实例已经完成了数据观测（data observer）、属性和方法的初始化（init props、init methods、init data、init computed、init watch）。
3. 挂载前（beforeMount）：在实例被挂载到DOM之前调用，此时实例的template还没有被渲染成真实的DOM。
4. 挂载后（mounted）：在实例被挂载到DOM之后立即调用，此时实例的template已经被渲染成真实的DOM，可以对DOM进行操作。
5. 更新前（beforeUpdate）：在数据更新之前调用，此时实例的数据已经被更新，但是视图还没有被重新渲染。
6. 更新后（updated）：在数据更新之后立即调用，此时视图已经被重新渲染。
7. 销毁前（beforeDestroy）：在实例被销毁之前调用，此时实例的数据、方法、监听器都还可用。
8. 销毁后（destroyed）：在实例被销毁之后调用，此时实例的所有东西都已经被清理，无法再访问到它们。
```vue
<!--
 * @Description: 生命周期
 * @version: 1.0
 * @Author: shu
 * @Date: 2023-04-16 17:48:16
 * @LastEditors: 修改者填写
 * @LastEditTime: 2023-04-16 17:50:34
-->
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>生命周期</title>
    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
</head>


<body>
    <div id="app">
        <div>
            <p>商品名称：{{ product.name }}</p>
            <p>商品价格：{{ product.price }}</p>
            <p>商品折扣：{{ product.discount }}</p>
            <p>商品折后价：{{ salePrice() }}</p>
            <button @click="product.discount = 0.5">打五折</button>

        </div>
    </div>
    <script>
        var app = new Vue({
            el: '#app',
            data: {
                product: {
                    name: '电视机',
                    price: 1000,
                    discount: 0.8
                }
            },
            computed: {
                salePrice() {
                    return this.product.price * this.product.discount
                }
            },
            methods: {
                salePrice() {
                    return this.product.price * this.product.discount
                }
            },
            beforeCreate() {
                console.log('beforeCreate')
            },
            created() {
                console.log('created')
            },
            beforeMount() {
                console.log('beforeMount')
            },
            mounted() {
                console.log('mounted')
            },
            beforeUpdate() {
                console.log('beforeUpdate')
            },
            updated() {
                console.log('updated')
            },
            beforeDestroy() {
                console.log('beforeDestroy')
            },
            destroyed() {
                console.log('destroyed')
            }
        })
    </script>


</html>
```
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1681638688705-f216c01f-9a20-44cc-93ba-11938770d15c.png#averageHue=%23f9f6f5&clientId=u7b427bd2-ac52-4&from=paste&height=549&id=u2610a6ed&originHeight=686&originWidth=1916&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=67168&status=done&style=none&taskId=ufa447a79-05c6-4957-aab8-5d6f9296eed&title=&width=1532.8)
总结一下：
Vue生命周期钩子函数可以分为以下几类：

1. 创建阶段：从创建Vue实例到挂载到DOM上之前的阶段。
   - beforeCreate
   - created
2. 挂载阶段：将Vue实例挂载到DOM上的阶段。
   - beforeMount
   - mounted
3. 更新阶段：当Vue实例的数据发生变化时，触发重新渲染视图的阶段。
   - beforeUpdate
   - updated
4. 销毁阶段：当Vue实例被销毁时的阶段。
   - beforeDestroy
   - destroyed

下面我们来详细介绍每个钩子函数的作用和应用场景。

1. beforeCreate

在实例被创建之初，此钩子函数会被调用。此时，Vue实例的数据和方法都还未初始化，因此无法访问data、computed、methods等选项。
这个阶段的应用场景比较少，一般用于插件开发或者扩展Vue功能。例如，可以在这个钩子函数中添加全局指令或者自定义方法。

2. created

在实例初始化完成后，此钩子函数会被调用。此时，Vue实例的数据和方法已经被初始化，可以访问data、computed、methods等选项。
这个阶段的应用场景比较多，可以进行一些初始化操作，例如获取数据、初始化事件等。注意，在这个钩子函数中，尚未完成挂载阶段，因此无法访问到DOM。

3. beforeMount

在Vue实例挂载到DOM上之前，此钩子函数会被调用。此时，Vue实例已经完成了模板的编译，并且将要把编译后的模板挂载到指定的DOM元素上。
这个阶段的应用场景比较少，一般用于在DOM元素挂载之前进行一些操作，例如修改数据、添加样式等。

4. mounted

在Vue实例挂载到DOM上之后，此钩子函数会被调用。此时，Vue实例已经完成了挂载，可以访问到挂载后的DOM元素。
这个阶段的应用场景比较多，可以进行一些与DOM相关的操作，例如初始化插件、设置定时器、绑定事件等。

5. beforeUpdate

在Vue实例数据发生变化之前，此钩子函数会被调用。此时，Vue实例的数据已经更新，但是还未重新渲染视图。
这个阶段的应用场景比较少，一般用于在数据更新之前进行一些操作，例如记录数据更新前的状态、取消更新等。

6. updated

在Vue实例数据发生变化之后，此钩子函数会被调用。此时，Vue实例已经完成了数据更新和重新渲染视图。
这个阶段的应用场景比较多，可以进行一些与DOM相关的操作，例如更新插件、重新绑定事件等。
需要注意的是，在这个钩子函数中，如果修改了数据，会导致无限循环更新的问题，因此要避免在这个钩子函数中修改数据。

7. beforeDestroy

在Vue实例销毁之前，此钩子函数会被调用。此时，Vue实例还未被销毁，可以访问到Vue实例的数据和方法。
这个阶段的应用场景比较少，一般用于在Vue实例被销毁之前进行一些清理操作，例如取消定时器、解绑事件等。

8. destroyed

在Vue实例被销毁之后，此钩子函数会被调用。此时，Vue实例已经被销毁，无法访问到Vue实例的数据和方法。
这个阶段的应用场景比较少，一般用于在Vue实例被销毁之后进行一些清理操作，例如释放内存、取消引用等。

