/*
 * @Author: shu 3138066125@qq.com
 * @Date: 2023-08-02 22:23:23
 * @LastEditors: shu 3138066125@qq.com
 * @LastEditTime: 2023-12-21 17:05:30
 * @FilePath: \CoffeeLatte\src\components\VedioFeatures.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from "react";
import styles from "./HomepageFeatures.module.css";
import useGlobalData from '@docusaurus/useGlobalData';

function Vedio() {
  const globalData = useGlobalData();
  const blogPluginData = globalData['docusaurus-plugin-content-docs'];
  // 文章列表
  const blogList = [];
  const blogData = {
    title: '',
    url: '',
  };
  // 文章数据key
  const key = Object.keys(blogPluginData);
  // 遍历文章key，提取文章数据
  key.forEach((item) => {
    const data = blogPluginData[item].versions[0].docs;
    data.forEach((item) => {
      // 如果id=home则跳过
      if (item.id === 'home') {
        return;
      }
      blogData.title = item.id;
      blogData.url = item.path;
      blogList.push({ ...blogData });
    });
  });
  // 随机选取7篇文章
  const randomList = [];
  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * blogList.length);
    randomList.push(blogList[index]);
    blogList.splice(index, 1);
  }

  return (
    <div className="tailwind">
      {/* 遍历最近7天文章 */}

      




    </div>
  );
}

export default function VedioFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        {/* 推荐书籍 */}
        <div className={styles.recommend}>
          <div className="col col--12">
            <h2>📚📚推荐博客📚📚</h2>
          </div>
        </div>
        {/* 推荐列表 */}
        <div className="row">
          <Vedio />
        </div>
      </div>
    </section>
  );
}