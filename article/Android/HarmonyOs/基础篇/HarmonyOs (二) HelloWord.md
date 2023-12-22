---
title: HarmonyOs (二) HelloWord
sidebar_position: 2
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
[文档中心](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/application-model-composition-0000001544384013-V3)
# 一 开发工具下载安装
> 要求电脑内存8G以上，建议16+

## 1.1 下载安装包

1. 进入官网点击下载

[HUAWEI DevEco Studio和SDK下载和升级 | HarmonyOS开发者](https://developer.harmonyos.com/cn/develop/deveco-studio/)
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062862304-cff02e23-4f18-4e07-bc49-515cae0a8e50.png#averageHue=%2354748f&clientId=ue7e73c7c-d4dc-4&from=paste&id=u843ffdd8&originHeight=926&originWidth=1828&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uae105dfc-1cff-4824-a181-7d1804c23fb&title=)

1. 解压并安装

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062862341-f964bca0-4ff9-4c35-bcb1-4f318622d012.png#averageHue=%23fdfcfb&clientId=ue7e73c7c-d4dc-4&from=paste&id=u514309fd&originHeight=171&originWidth=775&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u8bc544e7-5375-4011-9406-650c8884319&title=)

1. 一路next进行安装

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062862360-fe39a1f5-d3fe-4206-94e9-dac874c4257a.png#averageHue=%23ecd18d&clientId=ue7e73c7c-d4dc-4&from=paste&id=ub474de28&originHeight=477&originWidth=581&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u665a50c5-f0e4-422e-b1bc-06c09f21bcf&title=)
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062862390-5c9c4a21-c3e7-42ff-a939-1e4ca048ed3f.png#averageHue=%23f0efee&clientId=ue7e73c7c-d4dc-4&from=paste&id=u3a8e77fc&originHeight=477&originWidth=581&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u6d716df7-86b1-46e8-9d2d-cc7dbb36cb0&title=)
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062862353-0679ef88-77c3-4312-af8b-06ae5890ccd2.png#averageHue=%23f0efef&clientId=ue7e73c7c-d4dc-4&from=paste&id=u448d1d7f&originHeight=477&originWidth=581&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u6afe5196-927d-4282-9104-312184c2662&title=)
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062862910-4fc8be50-7328-443c-92d3-cb9477a62351.png#averageHue=%23f5f4f3&clientId=ue7e73c7c-d4dc-4&from=paste&id=ua50b5487&originHeight=477&originWidth=581&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u63eb76ff-3507-4a3f-b1ff-5d83d06f3ac&title=)
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062862999-0890bf3f-4356-4a34-90b9-36793472a535.png#averageHue=%23e9ca8c&clientId=ue7e73c7c-d4dc-4&from=paste&id=uae2ce016&originHeight=477&originWidth=581&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u069b7b21-f620-4c39-94d6-00284aa1776&title=)
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062863034-d7a7fa9d-af1c-404d-937e-e27b88d983b8.png#averageHue=%23f1f1f0&clientId=ue7e73c7c-d4dc-4&from=paste&id=u5ff61192&originHeight=521&originWidth=684&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u4c42078e-eae2-4083-902e-d1ad8c6455f&title=)
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062863016-567382a4-96c2-4c17-aa4c-ed9c80708a77.png#averageHue=%23f1f0f0&clientId=ue7e73c7c-d4dc-4&from=paste&id=ude7507ba&originHeight=212&originWidth=466&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u2d6d1669-f968-438e-8dc7-551b2e7a26c&title=)
## 1.2 下载相关依赖
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062863345-72edfc56-9036-4a13-b7b4-ee05a45676cd.png#averageHue=%233c4044&clientId=ue7e73c7c-d4dc-4&from=paste&id=u3f19495a&originHeight=725&originWidth=1124&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u0c46964c-f32c-49fd-a712-3f7b2105f4b&title=)
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062863452-65dab7ec-e541-4a2c-8a25-4fa12649c07f.png#averageHue=%233c4044&clientId=ue7e73c7c-d4dc-4&from=paste&id=u33ad48d6&originHeight=725&originWidth=1124&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u503b797d-9f8e-4737-a5ea-0d967026ad9&title=)
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062863675-1ba05d22-c5fa-498f-9c7f-1f7f9ebbf952.png#averageHue=%233c4044&clientId=ue7e73c7c-d4dc-4&from=paste&id=u87b9e5ef&originHeight=725&originWidth=1124&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uc65b968e-1816-43aa-9cc7-f0ff295af75&title=)
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062863716-ca0d2581-500a-413f-93cc-0d4b50404032.png#averageHue=%233d4247&clientId=ue7e73c7c-d4dc-4&from=paste&id=u5a9bda02&originHeight=702&originWidth=1120&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ufae9225e-f039-4c50-b6e5-433f8e3bd7d&title=)
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062863714-53f7de10-c04e-4117-a753-311dc607e641.png#averageHue=%233d4145&clientId=ue7e73c7c-d4dc-4&from=paste&id=u3028774d&originHeight=725&originWidth=1124&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u3ce541e9-a961-4ce6-8719-1520049a69e&title=)
如下截图出现了警告信息，根据提示信息点击Finish按钮。
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062863959-426b1c78-1a3a-4997-8488-40e0de3c1b0a.png#averageHue=%233c4042&clientId=ue7e73c7c-d4dc-4&from=paste&id=uae65014f&originHeight=725&originWidth=1124&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u576aadad-8db3-4400-b2b5-4c4a7091be4&title=)
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062864013-53426325-48f4-4eb2-b000-f971f47c7bd8.png#averageHue=%233d4042&clientId=ue7e73c7c-d4dc-4&from=paste&id=u7e0161d3&originHeight=890&originWidth=1227&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u0b2398bf-cde9-497a-ba01-cd3c0394fc4&title=)
到此位置，安装完成，叉掉当前检测界面即可使用该编辑器。使用教程见课堂内容。
# 二 开发者注册与个人实名认证
点击如下链接，参考文档指导，完成开发者注册与**个人**实名认证。（多种认证方式，任选其一。好像是银行卡认证效率最高，建议选择）
[文档中心](https://developer.huawei.com/consumer/cn/doc/start/registration-and-verification-0000001053628148?ha_linker=eyJ0cyI6MTY5NjkyMDE3ODQ3MiwiaWQiOiIwYjdmODYzNjY3OGE5ZWY2MWE4MjRlYjk2ZjMxNTg5YSJ9)
# 三 第一个程序
## 2.1 创建第一个程序

- 点击开发工具创建第一个项目

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701063138351-790660c9-d431-47b0-8f4e-6ab7bd79c758.png#averageHue=%2331363e&clientId=ue7e73c7c-d4dc-4&from=paste&height=693&id=udab07779&originHeight=866&originWidth=1367&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=51364&status=done&style=none&taskId=u41aeed09-a701-4b15-949d-c1966c599c3&title=&width=1093.6)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701063203693-b5d32a5f-6f82-42e6-b665-232880715cbc.png#averageHue=%233d4042&clientId=ue7e73c7c-d4dc-4&from=paste&height=656&id=uf250fa96&originHeight=820&originWidth=1227&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=51873&status=done&style=none&taskId=uee1a7d04-12c4-47cf-9e52-dbffb326671&title=&width=981.6)

- 输入相关信息进行创建

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701063284168-575f0032-5d15-4fc6-8cca-89d6e5b6a477.png#averageHue=%233e4042&clientId=ue7e73c7c-d4dc-4&from=paste&height=656&id=uab3538f2&originHeight=820&originWidth=1227&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=46502&status=done&style=none&taskId=u7f74da72-9240-4b07-b39a-10e89ce7168&title=&width=981.6)
> Satge，FA模型

- FA（Feature Ability）模型：HarmonyOS早期版本开始支持的模型，已经不再主推。
- Stage模型：HarmonyOS 3.1 Developer Preview版本开始新增的模型，是目前主推且会长期演进的模型。在该模型中，由于提供了AbilityStage、WindowStage等类作为应用组件和Window窗口的“舞台”，因此称这种应用模型为Stage模型。
- Stage模型之所以成为主推模型，源于其设计思想。Stage模型的设计基于如下出发点。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701063463829-df2e77c6-7324-4672-8b1a-c1f32b1f0294.png#averageHue=%233e4042&clientId=u5edf9858-542b-4&from=paste&height=656&id=u2f75867d&originHeight=820&originWidth=1227&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=69836&status=done&style=none&taskId=u4910533b-3a8b-48f5-b482-65e1578c527&title=&width=981.6)
> SDK版本对应关系

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701063651575-4c1daf5e-421c-46a9-92ea-46f0bc7f1137.png#averageHue=%23fafaf9&clientId=u5edf9858-542b-4&from=paste&height=331&id=u429f2b67&originHeight=414&originWidth=1243&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=23769&status=done&style=none&taskId=u146bc5a9-3f97-4aae-a8e0-1ce79a22145&title=&width=994.4)

- 点击完成，进行创建，进入开发页面

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701063689047-236bb677-0fd8-4977-9676-f40feb5916de.png#averageHue=%2395a069&clientId=u5edf9858-542b-4&from=paste&height=824&id=ufe27a71f&originHeight=1030&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=210954&status=done&style=none&taskId=u517bdce1-1a0e-47c8-954a-7d87a252003&title=&width=1536)
## 2.2 认识开发者界面

- 汉化配置

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701063967791-39237d9f-779e-461d-9177-2004908e334f.png#averageHue=%23373a3e&clientId=u5edf9858-542b-4&from=paste&height=713&id=u96c14551&originHeight=891&originWidth=1227&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=55426&status=done&style=none&taskId=u4d045872-a445-4148-8d93-1026ad567b3&title=&width=981.6)

- 重启工具，来到汉化界面

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701064011704-6fbf2947-407c-429f-b94b-008d02cea470.png#averageHue=%237b7d55&clientId=u5edf9858-542b-4&from=paste&height=824&id=u00f7ca4a&originHeight=1030&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=207299&status=done&style=none&taskId=ue31b1d0a-b816-442e-9357-72f098894fa&title=&width=1536)

- 目录机构切换

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701064063525-d5533ebb-7574-42c0-ad47-60b55354cb9d.png#averageHue=%23767c55&clientId=u5edf9858-542b-4&from=paste&height=824&id=u1482f77a&originHeight=1030&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=226784&status=done&style=none&taskId=ueef9c875-5511-4ff1-8fa1-44d42f6a93a&title=&width=1536)

- 日志查看

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701064106156-b81c6d91-23f5-4f2c-8791-7beabe2d03ed.png#averageHue=%23777c55&clientId=u5edf9858-542b-4&from=paste&height=824&id=u37395c89&originHeight=1030&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=214422&status=done&style=none&taskId=u9781b2cf-d494-4776-9fb5-a54ebd85eb4&title=&width=1536)

- 效果预览

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701064170629-d04bb4b5-dc6c-4f1a-aa08-c69b4c893054.png#averageHue=%23648256&clientId=u5edf9858-542b-4&from=paste&height=824&id=ua8b91ad3&originHeight=1030&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=208031&status=done&style=none&taskId=u49d7dade-2eb2-43dc-be9a-b01121d52db&title=&width=1536)

- 运行设备：目前分为真机和运程虚拟设备，建议真机（可以自己二手淘一个，我的机器荣耀30pro才800）

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701064248358-4c3004ab-90d7-49af-8fee-3dc9d7d13e1c.png#averageHue=%23648156&clientId=u5edf9858-542b-4&from=paste&height=824&id=u35802aa0&originHeight=1030&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=184706&status=done&style=none&taskId=ufacc3bbc-271d-4a4a-86ae-b3b4bb85803&title=&width=1536)

- SDK 版本管理

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701064410751-5b759dce-2e26-4c76-aa7e-dd3d555f8831.png#averageHue=%233d4145&clientId=u5edf9858-542b-4&from=paste&height=824&id=ufa7b541b&originHeight=1030&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=225472&status=done&style=none&taskId=ud283d45e-29b6-4c11-8251-f4ba36453e5&title=&width=1536)
## 2.3 目录结构认识
### 2.3.1 父目录认识
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701065130768-da196c4c-2c26-4965-922e-4743f0910e86.png#averageHue=%2385a594&clientId=uf6dccdc2-711e-4&from=paste&height=770&id=u660a8b96&originHeight=963&originWidth=643&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=105810&status=done&style=none&taskId=u5b64a29c-cc11-4744-9c59-17b3b3586f9&title=&width=514.4)

- AppScope中存放应用全局所需要的资源文件。
- entry是应用的主模块，存放HarmonyOS应用的代码、资源等。
- oh_modules是工程的依赖包，存放工程依赖的源文件。
- build-profile.json5是工程级配置信息，包括签名、产品配置等。
- hvigorfile.ts是工程级编译构建任务脚本，hvigor是基于任务管理机制实现的一款全新的自动化构建工具，主要提供任务注册编排，工程模型管理、配置管理等核心能力。
- oh-package.json5是工程级依赖配置文件，用于记录引入包的配置信息。
### 2.3.2 AppScope 目录
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701065318461-37ad42da-21ae-442b-b7e1-ed205b60a485.png#averageHue=%2380745b&clientId=uf6dccdc2-711e-4&from=paste&height=824&id=ucef34222&originHeight=1030&originWidth=1920&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=152620&status=done&style=none&taskId=uc07026f1-923b-420a-bcf4-1ca008a50e4&title=&width=1536)

- element文件夹主要存放公共的字符串、布局文件等资源。
- media存放全局公共的多媒体资源文件。
- app.json5全局配置文件
### 2.3.3 entry目录
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701065663700-3361a5f9-23a1-4735-8377-4bdb8e5fe9ac.png#averageHue=%233a4142&clientId=uf6dccdc2-711e-4&from=paste&height=738&id=ub7dd552e&originHeight=922&originWidth=677&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=116247&status=done&style=none&taskId=u029042e2-8c5b-46e3-b1d8-8ee03fef906&title=&width=541.6)

- ets文件夹用于存放ets代码。
- resources文件存放模块内的多媒体及布局文件等，module.json5文件为模块的配置文件。
- ohosTest是单元测试目录。
- build-profile.json5是模块级配置信息，包括编译构建配置项。
- hvigorfile.ts文件是模块级构建脚本。
- oh-package.json5是模块级依赖配置信息文件。、
#### 2.3.3.1 ets 目录
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701066714483-ca181a4a-e80f-4482-9ff0-5759590027ba.png#averageHue=%233a8854&clientId=uf6dccdc2-711e-4&from=paste&height=723&id=Nm09A&originHeight=904&originWidth=756&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=92931&status=done&style=none&taskId=ubcdb303a-e2a2-41f3-adc4-8a67697d16e&title=&width=604.8)

- ets目录中，其分为entryability、pages两个文件夹。
- entryability存放ability文件，用于当前ability应用逻辑和生命周期管理
- pages存放UI界面相关代码文件，初始会生产一个Index页面。
#### 2.3.3.2 resources目录
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701066922600-d81492ec-824a-4207-ac06-5f42d55a7fb4.png#averageHue=%233e934f&clientId=uf6dccdc2-711e-4&from=paste&height=638&id=ue1cce28a&originHeight=797&originWidth=1151&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=90383&status=done&style=none&taskId=ude1a27a8-0392-4c51-b761-79a4796e042&title=&width=920.8)
### 2.3.4 认识配置文件
#### 2.3.4.1 **app.json5**
app.json5是应用的全局的配置文件，用于存放应用公共的配置信息。
```json
{
  "app": {
    "bundleName": "com.shu",
    "vendor": "example",
    "versionCode": 1000000,
    "versionName": "1.0.0",
    "icon": "$media:app_icon",
    "label": "$string:app_name"
  }
}
```

- bundleName是包名。
- vendor是应用程序供应商。
- versionCode是用于区分应用版本。
- versionName是版本号。
- icon对于应用的显示图标。
- label是应用名。
- distributedNotificationEnabled描述应用程序是否已分发通知。
#### 2.3.4.2 **module.json5**
```json
{
  "module": {
    "name": "entry",
    "type": "entry",
    "description": "$string:module_desc",
    "mainElement": "EntryAbility",
    "deviceTypes": [
      "phone",
      "tablet"
    ],
    "deliveryWithInstall": true,
    "installationFree": false,
    "pages": "$profile:main_pages",
    "abilities": [
      {
        "name": "EntryAbility",
        "srcEntry": "./ets/entryability/EntryAbility.ts",
        "description": "$string:EntryAbility_desc",
        "icon": "$media:icon",
        "label": "$string:EntryAbility_label",
        "startWindowIcon": "$media:icon",
        "startWindowBackground": "$color:start_window_background",
        "exported": true,
        "skills": [
          {
            "entities": [
              "entity.system.home"
            ],
            "actions": [
              "action.system.home"
            ]
          }
        ]
      }
    ]
  }
}
```
其中module对应的是模块的配置信息，一个模块对应一个打包后的hap包，hap包全称是HarmonyOS Ability Package，其中包含了ability、第三方库、资源和配置文件。

- 默认标签和属性

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701075549856-bcd1d26f-3a12-404a-85dd-fd0b74d32349.png#averageHue=%23f8f7f6&clientId=u564b9f3b-d8d2-4&from=paste&height=552&id=gkyof&originHeight=662&originWidth=895&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=65094&status=done&style=none&taskId=ue905901b-c582-412c-9dc0-beda4da62de&title=&width=745.8333036965806)

-  abilities中对象的默认配置属性及描述

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701075642971-aca5d482-25a4-4592-9ffe-f132cea01b46.png#averageHue=%23f7f6f5&clientId=u564b9f3b-d8d2-4&from=paste&height=592&id=u6cf29879&originHeight=711&originWidth=786&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=65862&status=done&style=none&taskId=u3f4796d0-a81b-43b9-888c-916262c2858&title=&width=654.9999739726395)
#### 2.4.4.3 **main_pages.json**
```json
{
  "src": [
    "pages/Index"
  ]
}

```
main_pages.json文件保存的是页面page的路径配置信息，所有需要进行路由跳转的page页面都要在这里进行配置。
参考资料：
[华为开发者学堂](https://developer.huawei.com/consumer/cn/training/course/mooc/C101667303102887820?fchapterNo=C101667473758541869&chapterNo=C101667303864911499&outline=true)
## 2.4 投屏工具
[scrcpy-win64-v2.2.zip · 吴名112/WsqTools - Gitee.com](https://gitee.com/wushengqi/wsq-tools/blob/master/scrcpy-win64-v2.2.zip)

- 点击运行程序

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701075937705-eb364e09-d74e-4b6b-b36e-5ce611dd9e89.png#averageHue=%23fcfbfb&clientId=u564b9f3b-d8d2-4&from=paste&height=860&id=u955f5da1&originHeight=1032&originWidth=1920&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=132301&status=done&style=none&taskId=u14766701-a032-44fc-a65b-70cb3935a8f&title=&width=1599.9999364217147)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701076042797-1ed57e6e-2970-4aa9-adff-2f041fcfde92.png#averageHue=%237eb271&clientId=u564b9f3b-d8d2-4&from=paste&height=831&id=ubb93ba82&originHeight=997&originWidth=1531&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=691436&status=done&style=none&taskId=uad6ff6b4-3516-4376-81da-7799ccdcacd&title=&width=1275.8332826362737)
这样我们就把手机投屏到电脑上了
## 2.5 运行第一个程序

- 点击项目结构，登录华为账号，生成凭证

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701076155412-22d870a1-d991-4442-afed-c2ccd567ce4d.png#averageHue=%233d4347&clientId=u564b9f3b-d8d2-4&from=paste&height=860&id=u8984958e&originHeight=1032&originWidth=1920&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=399681&status=done&style=none&taskId=u3278c20a-4f76-4a0e-9c87-2653df2978e&title=&width=1599.9999364217147)

- 点击运行，查看效果，到此我们的第一个程序就完成了

![image.png](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701076202761-e781cf0a-161e-4a54-a3c8-ca5239ef775f.png#averageHue=%23374d4f&clientId=u564b9f3b-d8d2-4&from=paste&height=860&id=ua3705306&originHeight=1032&originWidth=1920&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=736630&status=done&style=none&taskId=u9f7edea1-b3dc-4149-a3af-176af946745&title=&width=1599.9999364217147)
