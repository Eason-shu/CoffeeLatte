---
title: HarmonyOs (一) 认识HarmonyOs
sidebar_position: 1
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

- [全网最新最细鸿蒙HarmonyOS4.0教程（帝心+庄生第一季完结）_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1pb4y1g75m/?spm_id_from=333.337.search-card.all.click)
- [华为HarmonyOS智能终端操作系统官网 | 应用设备分布式开发者生态](https://www.harmonyos.com/)
# 一 HarmonyOs 背景
## 1.1 发展时间线

- 2019年8月9日：HarmonyOS 1.0
- 2020年9月10日：HarmonyOS 2.0
- 2022年11月04日：HarmonyOS 3.1 Developer Preview
- 2023年8月4日，HarmonyOS 4.0操作系统正式发布。
- 2024年：预计推出HarmonyOS Next
## 1.2 背景分析
### 1.2.1 新场景
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701061885005-b499d4f6-54c1-4203-9492-a0c20cf95b9c.png#averageHue=%2323140a&clientId=u2cd6ee3c-7655-4&from=paste&id=ufcb2205a&originHeight=514&originWidth=1002&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u30c7a3dd-d61b-49af-9f39-acddce2c73b&title=)
### 1.2.2 新挑战
 不同设备类型意味着不同的传感器能力、硬件能力、屏幕尺寸、操作系统和开发语言，还意味着差异化的交互方式。同时跨设备协作也让开发者面临分布式开发带来的各种复杂性，适配和管理工作量将非常巨大。当前移动应用开发中遇到的主要挑战包括：

- 针对不同设备上的不同操作系统，重复开发，维护多套版本。
- 多种开发框架，不同的编程范式。
- 多种语言栈，对人员技能要求高。
- 命令式编程，需关注细节，变更频繁，维护成本高。

** 移动终端应用生态面临变革， 轻量化程序实体正成为新的趋势**
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701061884978-7200798c-06d7-495a-9e3b-ba0d7e21a3eb.png#averageHue=%23faecec&clientId=u2cd6ee3c-7655-4&from=paste&id=ub8c2b849&originHeight=933&originWidth=1762&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=udabae382-5541-4683-9e02-4221c1c9f54&title=)
### 1.2.3 鸿蒙生态迎接挑战

- 单一设备延伸到多设备
- 厚重应用模式到轻量化服务模式
- 集中化分发到AI加持下的智慧分发
- 纯软件到软硬芯协同的AI能力
# 二 HarmonyOS简介

-  HarmonyOS是一款面向万物互联时代的、全新的分布式操作系统。有三大系统特性，分别是：硬件互助，资源共享；一次开发，多端部署；统一OS，弹性部署。
- HarmonyOS通过硬件互助，资源共享的能力，将多个形态不一的设备进行组网，共同构成一个超级终端，可在超级终端中实现任务分发与数据共享。
- 硬件互助依赖HarmonyOS的分布式软总线，在此基础上，HarmonyOS还具备了分布式硬件虚拟化、分布式数据管理、分布式任务调度等分布式特性。

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062028740-3d964c9c-1202-4078-945d-316748fee0f6.png#averageHue=%23bac5cc&clientId=u2cd6ee3c-7655-4&from=paste&id=u5373217b&originHeight=253&originWidth=1020&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u512214b5-6304-406b-a59e-36bd84eec79&title=)

- 在传统的单设备系统能力基础上，HarmonyOS提出了基于同一套系统能力、适配多种终端形态的分布式理念，能够支持手机、平板、智能穿戴、智慧屏、车机等多种终端设备，提供全场景（移动办公、运动健康、社交通信、媒体娱乐等）业务能力。

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062028681-d4fdd2b2-13c2-4d27-93ff-080985b25c30.png#averageHue=%23040404&clientId=u2cd6ee3c-7655-4&from=paste&id=uef66c33c&originHeight=481&originWidth=1103&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u61a2afa1-572e-4f18-b3c9-37cac5a081b&title=)
## 2.1 OpenHarmony

- HarmonyOS是华为通过OpenHarmony项目，结合商业发行版增加能力，构建华为自研产品的完整解决方案。
- OpenHarmony是由开放原子开源基金会（OpenAtom Foundation）孵化及运营的开源项目，目标是面向全场景、全连接、全智能时代，基于开源的方式，搭建一个智能终端设备操作系统的框架和平台，促进万物互联产业的繁荣发展。

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062028721-c3da960a-d9a8-4167-8528-02c5ca55d4f2.png#averageHue=%23eceae8&clientId=u2cd6ee3c-7655-4&from=paste&id=u7b91a02b&originHeight=398&originWidth=1637&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u419f70e4-9967-4cd9-883c-49ed79aa9f8&title=)
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062028677-8ed4bde5-22c8-446f-a067-6d6057777dca.png#averageHue=%23e2e2a5&clientId=u2cd6ee3c-7655-4&from=paste&id=ua30ca79d&originHeight=428&originWidth=1371&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ud67455bf-1ce6-4c42-907a-a29a5f09f49&title=)
## 2.2 HarmonyOS Connect

- HarmonyOS Connect（中文“鸿蒙智联”）是华为统一的智能硬件生态品牌。
- HarmonyOS Connect生态伙伴可以基于华为提供的芯片设计、操作系统、连接、云、AI和用户体验设计能力，为消费者提供高品质的智能硬件生态设备，使该设备能够与华为HarmonyOS设备（包括手机、全屋主机、智能座舱、智慧屏、手表等终端）以及其他的HarmonyOS Connect生态设备进行联接和协同，共同打造互联互通的HarmonyOS Connect生态。

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062028651-dfc1578d-4737-44ca-98ad-338044dfa5e4.png#averageHue=%23ced8e1&clientId=u2cd6ee3c-7655-4&from=paste&id=u5f311f2f&originHeight=179&originWidth=1538&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uc6ad1701-5159-403d-9db6-49ee90b004a&title=)
## 2.3 HarmonyOS Next

- **AOSP + HMS + OpenHarmony = HarmonyOS 4.0**
- **HMS + OpenHarmony = HarmonyOS Next**
## **2.4 ArkTS （重点掌握）**
** ArkTS是华为自研的开发语言。它在TypeScript（简称TS）的基础上，匹配ArkUI框架，扩展了声明式UI、状态管理等相应的能力，让开发者以更简洁、更自然的方式开发跨端应用。**
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062241935-8ef409ee-305d-4b50-a798-83d1403d6090.png#averageHue=%23fcfbf9&clientId=u2cd6ee3c-7655-4&from=paste&id=uccf4666a&originHeight=595&originWidth=564&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u9798f60e-0cf7-4499-9ae5-bfb0570dd50&title=)![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062241957-f4090e60-d61b-453e-b11f-a2ba1442d978.png#averageHue=%23dde4f1&clientId=u2cd6ee3c-7655-4&from=paste&id=u5e70210d&originHeight=684&originWidth=584&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=udebdd23b-cf19-42e3-bf16-da0b58f4813&title=)
## **2.5 ArkUI**
**ArkUI是一套构建分布式应用界面的声明式UI开发框架。它使用极简的UI信息语法、丰富的UI组件、以及实时界面预览工具，提升开发效率。使用一套ArkTS API，就能在多个HarmonyOS设备上提供生动而流畅的用户界面体验。**
![](https://cdn.nlark.com/yuque/0/2023/gif/12426173/1701062241960-3548f8b5-a801-446d-9c52-7ec7eb261a5d.gif#averageHue=%23406537&clientId=u2cd6ee3c-7655-4&from=paste&id=u8cdd8bbf&originHeight=706&originWidth=1256&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u6a6e91cf-489f-48c7-9518-203bb19bdf9&title=)
# 三 鸿蒙生态应用核心技术理念
** 在万物智联时代重要机遇期，鸿蒙系统结合移动生态发展的趋势，提出了三大技术理念。**

- 一次开发 多端部署
- 可分可合 自由流转
- 统一生态 原生智能

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062241968-642616e9-2953-42e7-bbd0-5f2ca35e182f.png#averageHue=%23f1efe8&clientId=u2cd6ee3c-7655-4&from=paste&id=uf1c1a1cb&originHeight=792&originWidth=1859&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u5620fab4-8b7b-467d-9d26-542f674f071&title=)
## **3.1 原子化服务定义**

- **原子化服务是HarmonyOS提供的一种全新的应用形态，具有独立入口，用户可通过点击、碰一碰、扫一扫等方式直接触发，无需显式安装，由程序框架后台静默安装后即可使用，可为用户提供便捷服务。**

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062241964-600ba6c2-8a11-47b6-8593-7be4b6a1d404.png#averageHue=%23e2d4be&clientId=u2cd6ee3c-7655-4&from=paste&id=u8e1d17a9&originHeight=439&originWidth=1195&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u1ae273a3-bc3a-4e63-94c3-5290d15092e&title=)
免安装的HAP包不能超过10MB，保持免安装属性，HAP包必须包含FA
## **3.2 流转**
![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062242588-4d08a900-1736-4c3f-b293-1b55e6cf50b0.png#averageHue=%2344423f&clientId=u2cd6ee3c-7655-4&from=paste&id=u6a3f5a96&originHeight=845&originWidth=1614&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u4c7b148b-f5cb-462e-9eb4-658fc068f24&title=)

- **多个设备通过分布式操作系统能够相互感知，进而整合成一个超级终端，使设备间取长补短、相互帮助，为使用者提供自然流畅的分布式体验。**
- **流转在HarmonyOS中泛指多设备分布式操作，按照体验可分为跨端迁移和多端协同。**
### **3.2.1系统推荐流转**

- **系统感知周边有可用设备后，主动为用户提供可选择流转的设备信息，并在用户完成设备选择后回调通知应用开始流转，将用户选择的另一个设备的设备信息提供给应用。**

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062242708-c8acb8e2-eb64-4022-a8c7-2f4257b9a3e1.png#averageHue=%23949493&clientId=u2cd6ee3c-7655-4&from=paste&id=u98d61edd&originHeight=687&originWidth=1430&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ucbb425c2-31a1-4215-99b2-8e16e778402&title=)
### **3.2.2 用户手动流转**

- ** 用户手动流转：系统在用户手动点击流转图标后，被动为用户提供可选择交互的设备信息，并在用户完成设备选择后回调通知应用开始流转，将用户所选另一个设备的设备信息提供给应用。**

![](https://cdn.nlark.com/yuque/0/2023/png/12426173/1701062242670-0ae9cf39-897d-414e-88b1-dade7135fdcc.png#averageHue=%238f908e&clientId=u2cd6ee3c-7655-4&from=paste&id=u20ffbe50&originHeight=612&originWidth=1566&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u498b1009-af78-46d8-a7e6-7f056132028&title=)

---

