---
title: Angualr 遇到的问题总结
sidebar_position: 3
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
## 一  关于angular异步请求的等待问题

- 问题：首先我需要发送一个请求，获取该用户的信息，让后在根据用户返回的信息，去初始化信息
- 这里就有两个异步请求，需要等待第一个异步请求返回结果，执行第二个异步请求
- 解决方法：

```typescript
//异步请求执行顺序
joinForkData(){
    forkJoin([
        this.service.getService1(),
        this.service.getService2(),
        this.service.getService3(),
    ]).subscribe((res)=>{
        this.data1=res[0];
        this.data2=res[1];
        //后面正常的逻辑，保证顺序执行
  	)}
```

## 二 关于angular前端上传的参数的加密，后端解密

- 前端

```typescript
npm install crypto-js
npm install --save @types/crypto-js
新建服务，并在app.model导入服务

/*
 * @Description: 加密解密服务
 * @version:
 * @Author: shu
 * @Date: 2021-10-19 17:25:33
 * @LastEditors: shu
 * @LastEditTime: 2021-10-20 09:12:09
 */
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js/crypto-js';

@Injectable()
export class CryptoService {

 /**
  *与后端约定的key
  *
  * @memberof CryptoService
  */
 public key = 'shu';

 /**
  * DES加密
  *
  * @param {*} data
  * @return {*}  {string}
  * @memberof CryptoService
  */
 public encrypt(data:any):string{
    const keyHex = CryptoJS.enc.Utf8.parse(this.key);
    //模式为ECB padding为Pkcs7
    const encrypted = CryptoJS.DES.encrypt(data, keyHex, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    //加密出来是一个16进制的字符串
  return encrypted.ciphertext.toString();
  }

  /**
   *
   *DES解密
   * @param {*} data
   * @return {*}
   * @memberof CryptoService
   */
  public decryptedDES(data:any):string {
    const keyHex = CryptoJS.enc.Utf8.parse(this.key);
    const decrypted = CryptoJS.DES.decrypt({
      ciphertext: CryptoJS.enc.Hex.parse(data)
    }, keyHex, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    //以utf-8的形式输出解密过后内容
    return decrypted.toString(CryptoJS.enc.Utf8);
    }
}
```

- 后端

```java
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.Locale;

/**
 * @Author shu
 * @Date: 2021/10/19/ 17:41
 * @Description Des解密工具
 **/
public class DESCryptographyUtils {

    public static void main(String[] args) {
        String s = decryptedDES("");
        System.out.println(s);
    }

    /**
     * 与前端项目约定的DES密钥
     */
    private final static String KEY = "shu";


    /**
     * 解密处理
     * @param content
     * @return
     */
    public static String decryptedDES(String content) {
        try {
            Cipher cipher = Cipher.getInstance("DES/ECB/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, generateKey(KEY));
            byte[] buf = cipher.doFinal(hexStr2Bytes(content));
            return new String(buf, StandardCharsets.UTF_8);
        } catch (Throwable e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 加密处理
     * @param content
     * @return
     */
    public static String encryptedDES(String content) {
        byte[] encrypted = DES_ECB_Encrypt(content.getBytes(), KEY.getBytes());
        if (encrypted == null) {
            return null;
        }
        return byteToHexString(encrypted);
    }


    /**
     * 加密工具
     * @param content
     * @param keyBytes
     * @return
     */
    public static byte[] DES_ECB_Encrypt(byte[] content, byte[] keyBytes) {
        try {
            DESKeySpec keySpec = new DESKeySpec(keyBytes);
            SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("DES");
            SecretKey key = keyFactory.generateSecret(keySpec);

            Cipher cipher = Cipher.getInstance("DES/ECB/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] result = cipher.doFinal(content);
            return result;
        } catch (Exception e) {
            System.out.println("exception:" + e.toString());
        }
        return null;
    }




    /**
     * 解析秘钥
     * @param secretKey
     * @return
     * @throws NoSuchAlgorithmException
     * @throws InvalidKeySpecException
     * @throws InvalidKeyException
     */
    private static SecretKey generateKey(String secretKey)throws NoSuchAlgorithmException, InvalidKeySpecException, InvalidKeyException {
        SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("DES");
        DESKeySpec keySpec = new DESKeySpec(secretKey.getBytes());
        keyFactory.generateSecret(keySpec);
        return keyFactory.generateSecret(keySpec);
    }


    /**
     * 解析hexStr
     * @param src
     * @return
     */
    public static byte[] hexStr2Bytes(String src) {
        src = src.trim().replace(" ", "").toUpperCase(Locale.US);
        int m = 0, n = 0;
        int iLen = src.length() / 2; //计算长度
        byte[] ret = new byte[iLen]; //分配存储空间

        for (int i = 0; i < iLen; i++) {
            m = i * 2 + 1;
            n = m + 1;
            ret[i] = (byte) (Integer.decode("0x" + src.substring(i * 2, m) + src.substring(m, n)) & 0xFF);
        }
        return ret;
    }


    /**
     * 解析byte
     * @param bytes
     * @return
     */
    public static String byteToHexString(byte[] bytes) {
        StringBuffer sb = new StringBuffer(bytes.length);
        String sTemp;
        for (int i = 0; i < bytes.length; i++) {
            sTemp = Integer.toHexString(0xFF & bytes[i]);
            if (sTemp.length() < 2)
                sb.append(0);
            sb.append(sTemp.toUpperCase());
        }
        return sb.toString();
    }
}
```

## 三  关于angular组件的通信知识的强化

### 3.1 父组件与组件通信@Input()

- 子组件

```typescript
import { Component, Input } from '@angular/core';
import { Hero } from './hero';

@Component({
  selector: 'app-hero-child',
  template: `
    <h3>{{hero.name}} says:</h3>
    <p>I, {{hero.name}}, am at your service, {{masterName}}.</p>
  `
})
export class HeroChildComponent {
  @Input() hero!: Hero;
  @Input() OrderName = ''; // 接受父组件传递的值
	//执行后面的逻辑
}
```

- 父组件

```typescript
import { Component } from '@angular/core';

import { HEROES } from './hero';

@Component({
  selector: 'app-hero-parent',
  template: `
    <h2>{{master}} controls {{heroes.length}} heroes</h2>
    <app-hero-child
      *ngFor="let hero of heroes"
      [hero]="hero"
      [OrderName]="OrderName">
    </app-hero-child>
  `
})
export class HeroParentComponent {
  heroes = HEROES;
  //将这个值传递给子组件
  OrderName = 'shu';
}
```

### 3.2 子组件与父组件通信

- 子组件

```typescript
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-voter',
  template: `
    <h4>{{name}}</h4>
    <button (click)="vote(true)"  [disabled]="didVote">Agree</button>
    <button (click)="vote(false)" [disabled]="didVote">Disagree</button>
  `
})
export class VoterComponent {
  @Input()  name = '';
  //向父组件暴露一个EventEmitter属性，
  @Output() voted = new EventEmitter<boolean>();
  didVote = false;

  vote(agreed: boolean) {
     //发送
    this.voted.emit(agreed);
    this.didVote = true;
  }
}
```

- 父组件

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-vote-taker',
  template: `
    <h2>Should mankind colonize the Universe?</h2>
    <h3>Agree: {{agreed}}, Disagree: {{disagreed}}</h3>
    <app-voter
      *ngFor="let voter of voters"
      [name]="voter"
      (voted)="onVoted($event)">
    </app-voter>
  `
})
export class VoteTakerComponent {
  agreed = 0;
  disagreed = 0;
  voters = ['Narco', 'Celeritas', 'Bombasto'];

  onVoted(agreed: boolean) {
    agreed ? this.agreed++ : this.disagreed++;
  }
}
```

## 四 本地存储方式

### 4.1 基本介绍

本地存储方式，基本上有三种：`sessionStorage`，`localStorage`，`cookie`，其实本质上可以把他理解为`Key-Value`键值对

- 相同点：都保存在浏览器端
- 不同的：
   - `sessionStorage`：仅在当前浏览器窗口关闭前有效，自然也就不可能持久保持
   - `localStorage`：始终有效，窗口或浏览器关闭也一直保存，因此用作持久数据
   - `cookie`：cookie只在设置的cookie过期时间之前一直有效，即使窗口或浏览器关闭

### 4.2 主要方法

- 设置值：`setItem(key,value)`
- 取出值：`getItem(key)`
- 清理值：`removeItem(key)`

```javascript
//保存本地
localStorage.setItem("currentUser",this.user)
//取出值
JSON.stringify(localStorage.getItem("currentUser"));
//清理值
localStorage.removeIteem("currentUser")
```

### 4.3 深拷贝与浅拷贝

- 深拷贝

```typescript
JSON.parse(JSON.stringify(m));
```

- 浅拷贝

```typescript
Object.assign{}
```
