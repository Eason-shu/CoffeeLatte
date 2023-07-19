// Description: Docusaurus 站点信息配置文件: https://docusaurus.io/zh-CN/docs/configuration#site-metadata
// Author: shu
// Last Modified: 2023-07-01
// License: MIT
const path = require("path");
const math = require("remark-math");
const katex = require("rehype-katex");
const adsense = require("./src/plugin/remark-adsense");

// own info config：https://docusaurus.io/zh-CN/docs/api/docusaurus-config
module.exports = {
  title: "拿铁要加冰 | Java开发工程师", // 标题 | Title
  tagline: "活到老，学到老，作为程序员的自我修养，哈哈哈哈哈", // 标语 | Tagline
  url: "https://www.shuzhilin.top", // 站点地址 | Your website URL
  baseUrl: "/", // 站点根目录 | Base URL for your project */
  favicon: "img/favicon.ico", // 站点图标 | Favicon
  organizationName: "shuzhilin", // 拥有这个仓库的 GitHub 用户或组织|Usually your GitHub org/user name.
  projectName: "shuzhilin.top", // 仓库名称 | Usually your repo name.
  themeConfig: {
    // 主题配置 | Theme configuration
    image: "img/logo.jpg", // 站点图片 | Image for meta tag
    announcementBar: {
      // 公告栏 | Announcement Bar
      id: "feature_release", //  Any value that will identify this message.
      content: `🎉🎉🎉 Mybatis源码分析已上线！欢迎大家学习！🎉🎉🎉`,
      backgroundColor: "#fafbfc", // Defaults to `#fff`.
      textColor: "#091E42", // Defaults to `#000`.
      isCloseable: false, // Defaults to `true`.
    },
    hideableSidebar: true, // 是否隐藏侧边栏 | Whether to show or hide the sidebar
    navbar: {
      title: "拿铁要加冰 | Java开发工程师",
      logo: {
        alt: "拿铁要加冰 | Java开发工程师",
        src: "img/logo.jpg",
        srcDark: "img/logo.jpg",
      },
      items: [
        // ------------------------------------首页--------------------------------------------------
        {
          label: "🔝 首页",
          position: "right",
          items: [
            {
              label: "随笔",
              to: "lifestyle",
            },
            {
              label: "职业",
              to: "tags/职业",
            },
            {
              label: "健康",
              to: "tags/健康",
            },
          ],
        },
        // -----------------------------------------Java-----------------------------------------
        {
          label: "🚀 Java",
          position: "right",
          items: [
            {
              label: "Java基础",
              to: "docs/java/java-basic/",
            },
            {
              label: "Java进阶",
              to: "docs/java/java-advanced/",
            },
          ],
        },
        // {
        //   label: "🌄 WEB",
        //   position: "right",
        //   items: [
        //     {
        //       label: "Css",
        //       to: "docs/spring/spring-intro",
        //     },
        //     {
        //       label: "Html",
        //       to: "docs/spring/spring-intro",
        //     },
        //     {
        //       label: "Javascript",
        //       to: "docs/spring/spring-intro",
        //     },
        //     {
        //       label: "Vue",
        //       to: "docs/spring/spring-intro",
        //     },
        //     {
        //       label: "React",
        //       to: "docs/spring/spring-intro",
        //     },
        //     {
        //       label: "Angular",
        //       to: "docs/spring/spring-intro",
        //     },
        //   ],
        // },
        // {
        //   label: "⌨ Ops",
        //   position: "right",
        //   items: [
        //     {
        //       label: "Linux",
        //       to: "docs/spring/spring-intro",
        //     },
        //     {
        //       label: "Docker",
        //       to: "docs/spring/spring-intro",
        //     },
        //     {
        //       label: "Kubernetes",
        //       to: "docs/spring/spring-intro",
        //     },
        //     {
        //       label: "Jenkins",
        //       to: "docs/spring/spring-intro",
        //     },
        //     {
        //       label: "Git",
        //       to: "docs/spring/spring-intro",
        //     },
        //     {
        //       label: "Svn",
        //       to: "docs/spring/spring-intro",
        //     },
        //   ],
        // },
        // {
        //   label: "🏟 数据库",
        //   position: "right",
        //   items: [
        //     {
        //       label: "Mysql",
        //       to: "docs/spring/spring-intro",
        //     },
        //     {
        //       label: "Oracle",
        //       to: "docs/spring/spring-intro",
        //     },
        //     {
        //       label: "Redis",
        //       to: "docs/spring/spring-intro",
        //     },
        //   ],
        // },
        // {
        //   label: "🧰 工具",
        //   position: "right",
        //   items: [
        //     {
        //       label: "开发工具",
        //       to: "docs/spring/spring-intro",
        //     },
        //     {
        //       label: "插件推荐",
        //       to: "docs/spring/spring-intro",
        //     },
        //   ],
        // },
        // {
        //   label: "📚 读书笔记",
        //   position: "right",
        //   items: [
        //     {
        //       label: "《Java编程思想》",
        //       to: "docs/spring/spring-intro",
        //     },
        //     {
        //       label: "《深入理解Java虚拟机》",
        //       to: "docs/spring/spring-intro",
        //     },
        //   ],
        // },
        // {
        //   label: "🎲 生活",
        //   position: "right",
        //   items: [
        //     {
        //       label: "健康",
        //       to: "docs/spring/spring-intro",
        //     },
        //   ],
        // },
      ],
    },
    algolia: {
      apiKey: "fabfb0e9997e101154ed85d64b7b6a3c",
      indexName: "ZXUQIANCN",
      appId: "LIJMO3C9C4",
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "学习",
          items: [],
        },
        {
          title: "社交媒体",
          items: [],
        },
      ],
      copyright: `<p>Copyright © ${new Date().getFullYear()} 拿铁要加冰  Built with Docusaurus.</p><p><a href="http://beian.miit.gov.cn/" >蜀ICP备2022021919号</a></p>`,
    },
    prism: {
      theme: require("prism-react-renderer/themes/github"),
      darkTheme: require("prism-react-renderer/themes/oceanicNext"),
      defaultLanguage: "javascript",
    },
    // googleAnalytics: {
    //   trackingID: "UA-118572241-1",
    //   anonymizeIP: true, // Should IPs be anonymized?
    // },
    gtag: {
      trackingID: "G-6PSESJX0BM",
      // Optional fields.
      anonymizeIP: true, // Should IPs be anonymized?
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/zxuqian/www.shuzhilin.top/tree/master",
          remarkPlugins: [math, adsense],
          rehypePlugins: [katex],
          showLastUpdateTime: true,
        },
        blog: {
          path: "./blog",
          routeBasePath: "/",
          blogSidebarTitle: "近期文章",
          remarkPlugins: [math],
          rehypePlugins: [katex],
          feedOptions: {
            type: "all",
            title: "拿铁要加冰",
            copyright: `Copyright © ${new Date().getFullYear()} 拿铁要加冰 () Built with Docusaurus.<p><a href="http://beian.miit.gov.cn/" class="footer_lin">蜀ICP备2022021919号</a></p>`,
          },
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        sitemap: {
          changefreq: "daily",
          priority: 0.5,
        },
      },
    ],
  ],
  // themes: ["@docusaurus/theme-live-codeblock"],
  plugins: [
    path.resolve(__dirname, "./src/plugin/plugin-baidu-analytics"),
    path.resolve(__dirname, "./src/plugin/plugin-baidu-push"),
    // "@docusaurus/plugin-ideal-image",
    path.resolve(__dirname, "./src/plugin/plugin-onesignal-push"),
    path.resolve(__dirname, "./src/plugin/plugin-latest-docs"),
    "docusaurus2-dotenv",
    [
      "@docusaurus/plugin-content-blog",
      {
        id: "secret-garden",
        routeBasePath: "lifestyle",
        path: "./lifestyle",
        feedOptions: {
          type: "all",
          title: "拿铁要加冰",
          copyright: `Copyright © ${new Date().getFullYear()} 拿铁要加冰  Built with Docusaurus.<p><a href="http://beian.miit.gov.cn/" >蜀ICP备2022021919号</a></p>`,
        },
      },
    ],
    // [
    //   "@easyops-cn/docusaurus-search-local",
    //   {
    //     hashed: true,
    //     // indexPages: true,
    //     blogRouteBasePath: "/",
    //     language: ["en", "zh"],
    //   },
    // ],
  ],
  stylesheets: [
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      type: "text/css",
    },
    {
      href: "/katex/katex.min.css",
      type: "text/css",
      integrity:
        "sha384-AfEj0r4/OFrOo5t7NnNe46zW/tFgW6x/bCJG8FqQCEo3+Aro6EYUG4+cU+KJWu/X",
      crossorigin: "anonymous",
    },
    {
      href: "https://fonts.font.im/css?family=Raleway:500,700&display=swap",
      type: "text/css",
      rel: "stylesheet",
    },
    // {
    //   href: "https://fonts.googleapis.com/css2?family=Fira+Code&display=swap",
    //   type: "text/css",
    //   rel: "stylesheet",
    // },
  ],
  i18n: {
    defaultLocale: "zh-CN",
    locales: ["zh-CN"],
  },
};
