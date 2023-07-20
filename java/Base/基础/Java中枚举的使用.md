---
title: Java中的枚举
sidebar_position: 9
keywords:
  - Java
tags:
  - Java
  - 学习笔记
  - 基础
  - 反射
  - 注解
  - 泛型
  - 集合
  - 多线程
last_update:
  date: 2023-07-01
  author: EasonShu
---

#  一 基本概述
## 1.1 概念

- enum 的全称为 enumeration， 是 JDK 1.5 中引入的新特性。
- 在Java中，被 enum 关键字修饰的类型就是枚举类型。
- 如果枚举不添加任何方法，**枚举值默认为从0开始的有序数值**。
- **枚举的好处**：可以将常量组织起来，统一进行管理。
- **枚举的典型应用场景**：错误码、状态机等。
- **枚举除了不能继承，基本上可以将 enum 看做一个常规的类**。
## 1.2 本质

- 尽管 enum 看起来像是一种新的数据类型，事实上，**enum是一种受限制的类，并且具有自己的方法**。
- 创建enum时，编译器会为你生成一个相关的类，这个类继承自 java.lang.Enum。
```java
public abstract class Enum<E extends Enum<E>>
        implements Comparable<E>, Serializable { ... }
```
## 1.3 基本方法

- values()：返回 enum 实例的数组，而且该数组中的元素严格保持在 enum 中声明时的顺序。
- name()：返回实例名。
- ordinal()：返回实例声明时的次序，从0开始。
- getDeclaringClass()：返回实例所属的 enum 类型。
- equals() ：判断是否为同一个对象。可以使用 == 来比较enum实例。
- java.lang.Enum实现了Comparable和 Serializable 接口，所以也提供 compareTo() 方法。

```java
package Enum;

/**
 * @Author shu
 * @Date: 2022/02/10/ 20:02
 * @Description 枚举方法
 **/
public class EnumMethodDemo {
    // 枚举颜色
    enum Color {RED, GREEN, BLUE;}
    // 枚举大小
    enum Size {BIG, MIDDLE, SMALL;}
    public static void main(String args[]) {
        System.out.println("=========== Print all Color ===========");
        for (Color c : Color.values()) {
            System.out.println(c + " ordinal: " + c.ordinal());
        }
        System.out.println("=========== Print all Size ===========");
        for (Size s : Size.values()) {
            System.out.println(s + " ordinal: " + s.ordinal());
        }

        Color green = Color.GREEN;
        System.out.println("green name(): " + green.name());
        System.out.println("green getDeclaringClass(): " + green.getDeclaringClass());
        System.out.println("green hashCode(): " + green.hashCode());
        System.out.println("green compareTo Color.GREEN: " + green.compareTo(Color.GREEN));
        System.out.println("green equals Color.GREEN: " + green.equals(Color.GREEN));
        System.out.println("green equals Size.MIDDLE: " + green.equals(Size.MIDDLE));
        System.out.println("green equals 1: " + green.equals(1));
        System.out.format("green == Color.BLUE: %b\n", green == Color.BLUE);
    }
}
```
## 1.4 枚举间接赋值

- 案例一
```java
package Enum;

/**
 * @Author shu
 * @Date: 2022/02/10/ 20:08
 * @Description 返回结果
 **/
public enum ErrorCode {

    OK(0, "成功"),
    ERROR_A(100, "登录成功"),
    ERROR_C(-100, "登录失败"),
    ERROR_B(200, "注册成功");


    ErrorCode(int number, String description) {
        this.code = number;
        this.description = description;
    }


    private int code;
    private String description;


    public int getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static void main(String args[]) { // 静态方法
        for (ErrorCode s : ErrorCode.values()) {
            System.out.println("code: " + s.getCode() + ", description: " + s.getDescription());
        }
    }
}



```
# 二 枚举的妙用
## 2.1 枚举代替if else

- 这样当系统里有**几十个角色**时，那几十个 if/else嵌套可以说是非常酸爽了…… 这样**一来**非常不优雅，别人阅读起来很费劲；**二来**则是以后如果再复杂一点，或者想要再加条件的话**不好扩展**；而且代码一改，以前的老功能肯定还得重测，岂不疯了……
```java
package Enum;

/**
 * @Author shu
 * @Date: 2022/02/10/ 20:24
 * @Description if - else
 **/
public class JudgeRole
{
    public String judge(String roleName)
    {
        String result = "";
        if
        (roleName.equals("ROLE_ROOT_ADMIN")) {
            // 系统管理员有A权限
            result = "ROLE_ROOT_ADMIN: " + "has AAA permission";
        } else if
        (roleName.equals("ROLE_ORDER_ADMIN")) {
            // 订单管理员有B权限
            result = "ROLE_ORDER_ADMIN: " + "has BBB permission";
        }
        else if (roleName.equals("ROLE_NORMAL"))
        {
            // 普通用户有C权限
            result = "ROLE_NORMAL: " + "has CCC permission";
        }
        else
        { result = "XXX"; }
        return result;
    }

}
```

- 枚举类
```java
package Enum;

/**
 * @Author shu
 * @Date: 2022/02/10/ 20:23
 * @Description 角色接口
 **/
public interface RoleOperation {

    String op();// 表示某个角色可以做哪些op操作
}
```
```java
package Enum;

/**
 * @Author shu
 * @Date: 2022/02/10/ 20:31
 * @Description
 **/
public enum RoleEnum implements RoleOperation
{
// 系统管理员(有A操作权限)
    ROLE_ROOT_ADMIN
        {
            @Override
             public String op() {
                    return "ROLE_ROOT_ADMIN:" + " has AAA permission";
                }
            },

// 订单管理员(有B操作权限)
    ROLE_ORDER_ADMIN
            {
                @Override
                public String op() {
                    return "ROLE_ORDER_ADMIN:" + " has BBB permission";
                }
            },


// 普通用户(有C操作权限)
    ROLE_NORMAL
            {
                @Override
                public String op() {
                    return "ROLE_NORMAL:" + " has CCC permission";

                }
            };

}
```
```java
package Enum;

/**
 * @Author shu
 * @Date: 2022/02/10/ 20:24
 * @Description
 **/
public class JudgeRole
{
    public String judge(String roleName)
    {
        return RoleEnum.valueOf(roleName).op();
    }
}
```
这样一来就十分简洁，干净
## 2.2 定义后端返回数据
```java
package com.music.common;

import java.io.Serializable;

/**
 * @Author shu
 * @Date: 2021/10/04/ 8:32
 * @Description 响应结果
 **/
public class JsonResult<T> implements Serializable {
    private static final long serialVersionUID = -6209802555693381640L;
    private Integer code;
    private String message;
    private T data;
    private String result;
    private Integer count;
    private String traceMessage;
    public Integer getCode() {
        return code;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }

    public void setSuccess() {
        this.setCode(JsonResponseStatus.SUCCESS.getCode());
        this.setMessage(JsonResponseStatus.SUCCESS.getMessage());
    }

    public void setSuccess(T data) {
        this.setCode(JsonResponseStatus.SUCCESS.getCode());
        this.setMessage(JsonResponseStatus.SUCCESS.getMessage());
        this.setData(data);
        this.setResult(result);
    }

    public void setSuccessNoMessage(T data) {
        this.setCode(JsonResponseStatus.SUCCESS.getCode());
        this.setData(data);
    }

    public void setFail(Integer code, String message) {
        this.setCode(code);
        this.setMessage(message);
        this.setData(null);
    }

    public void setFailBusinessError(String messge) {
        this.setCode(JsonResponseStatus.BusinessError.getCode());
        this.setMessage(messge);
        this.setData(null);
    }

    public void setFailLoginError(String messge) {
        this.setCode(JsonResponseStatus.LoginError.getCode());
        this.setMessage(messge);
        this.setData(null);
    }

    public void setFailSystemError(String message) {
        this.setCode(JsonResponseStatus.SystemError.getCode());
        this.setMessage(message);
        this.setData(null);
    }

    //短信验证码发送成功
    public void setSuccessCode(String code){
        this.setCode(JsonResponseStatus.SuccessCode.getCode());
        this.setMessage(JsonResponseStatus.SuccessCode.getMessage());
        this.setResult(code);
    }


    public void setSuccessRegister(){
        this.setCode(JsonResponseStatus.SuccessRegister.getCode());
        this.setMessage(JsonResponseStatus.SuccessRegister.getMessage());
    }

    public void setFailRegister(){
        this.setCode(JsonResponseStatus.FailRegister.getCode());
        this.setMessage(JsonResponseStatus.FailRegister.getMessage());
    }

    public void setFailSystemError() {
        this.setFailSystemError(JsonResponseStatus.SystemError.getMessage());
    }

    public String getTraceMessage() {
        return traceMessage;
    }

    public void setTraceMessage(String traceMessage) {
        this.traceMessage = traceMessage;
    }

    public void setStatus(boolean success, Integer failCode, String failMessage, T data) {
        if (success) {
            this.setCode(JsonResponseStatus.SUCCESS.getCode());
            this.setMessage(JsonResponseStatus.SUCCESS.getMessage());
            this.setData(data);
        } else {
            this.setCode(failCode);
            this.setMessage(failMessage);
            this.setData(data);
        }
    }

}
```
```java
package com.music.common;

/**
 * @Author shu
 * @Date: 2021/10/04/ 8:34
 * @Description 响应结果枚举类
 **/
public enum  JsonResponseStatus {

    SUCCESS(1000,"登录成功")

	,TokenFail(2001,"Token 过期")

	,FAILURE(2000,"登录失败")

	,LoginError(2021,"验证登录失败")

	,NoRight(2013,"没有权限")

	,BusinessError(2100,"业务异常")

	,BlankParamsError(2101,"空参数")

	,ParamsFormatError(2102,"参数格式错误")

	,SystemError(2200,"系统错误")

    ,SuccessCode(100,"发送成功")

    ,SuccessRegister(120,"注册成功")

    ,FailRegister(110,"注册失败");

    private int code;

    private String Message;

    private JsonResponseStatus(int code, String message) {
        this.code=code;
        this.Message=message;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return Message;
    }

    public void setMessage(String message) {
        Message = message;
    }

}
```
