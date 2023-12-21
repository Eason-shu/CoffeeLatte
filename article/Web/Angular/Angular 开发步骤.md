---
title: Angular 开发步骤
sidebar_position: 4
keywords:
  - Angular
tags:
  - Angular
  - 学习笔记
  - 基础
  - 前端
last_update:
  date: 2023-05-01
  author: EasonShu
---

资料：

- [Angular 中文文档](https://angular.cn/start)
- [快速上手 | NG-ZORRO](https://ng.ant.design/docs/getting-started/zh)
- [iconfont-阿里巴巴矢量图标库](https://www.iconfont.cn/)
# 一 新建页面
Angualr常用命令
```vue
1、使用 ng g module ### --routing 创建一个带路由的模块。
2、使用 ng g module ### 创建模块命令
3、使用 ng new ### 创建项目命令
4、使用 ng g component ### 创建组件命令
5、使用 ng g service 创建服务命令
6、使用 ng serve --open 启动服务
```

- 当我们拿到新需求的时候，前端如何创建新页面？

⏺️第一步，我们需要利用Angualr自带的命令来创建页面
首先我们需要利用ng g component 命令来创建页面，下面来个案例
```bash
ng g c pages/report/day-report
```
该命令就是在pages目录下新增day-report组件，这样就完成了新组件的创建
⏺️第二步，组件中心注册，ComponentFactory，进行组件的注册，方便菜单的调用，当然在这里也可以快速搜索其他组件信息
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1682213808798-0ca50844-8602-463e-ad83-b2e696a30612.png#averageHue=%2396a15d&clientId=u6b072dd3-6980-4&from=paste&height=824&id=ud67e48a7&originHeight=1030&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=533723&status=done&style=none&taskId=u9839e25a-ce5e-4cbc-9a16-e39853a0cc1&title=&width=1536)
⏺️第三步，权限系统新增菜单信息，权限系统是一个公共系统，水电通用管理
⏺️第四步，运行系统，可以看到我们新建的页面
```bash
ng serve --open
```
# 二 开发页面
Angualr 开发页面的结构，其实跟后端差不多，没有那么多的状态，插件，等等管理
开发需要关注的主要三个目录结构：
⏺️pages：自定义的组件，编写业务代码，具体的组件框架，参考[NG-ZORRO - Angular UI component library](https://ng.ant.design/version/11.4.x/docs/introduce/zh)，框架库
⏺️model：实体类定义层，主要采用Ts语法编写
🌈service：接口层，主要定义与后台交互的接口
有了上面的三个我们就可以进行页面的开发了
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1682228997819-d9436384-ee98-4ac9-8145-73cb22d29bbf.png#averageHue=%239e9665&clientId=ub923d800-f427-4&from=paste&height=742&id=u5e3fd25f&originHeight=928&originWidth=1843&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=193165&status=done&style=none&taskId=u6c83ad5a-ddca-4899-a4b4-961e4d7bf94&title=&width=1474.4)


