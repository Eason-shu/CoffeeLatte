/*
 * @Author: shu 3138066125@qq.com
 * @Date: 2023-08-01 17:30:54
 * @LastEditors: shu 3138066125@qq.com
 * @LastEditTime: 2023-12-22 09:33:33
 * @FilePath: \CoffeeLatte\docusaurus.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");
const { to } = require("react-spring");
/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "LotteCoffee", // 标题 | Title
  staticDirectories: ["public", "static"], // 静态文件夹 | Static directory
  tagline: "把戏把戏要过手", // 标语 | Tagline
  url: "https://www.lottecoffee.com", // 站点地址 | Your website URL
  baseUrl: "/", // 站点根目录 | Base URL for your project */
  favicon: "img/favicon.ico", // 站点图标 | Favicon
  organizationName: "lottecoffee", // 拥有这个仓库的 GitHub 用户或组织|Usually your GitHub org/user name.
  projectName: "www.lottecoffee.com", // 仓库名称 | Usually your repo name.
  i18n: {
    defaultLocale: "zh-Hans",
    locales: ["zh-Hans"],
  },
  scripts: [],
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          breadcrumbs: false,
        },
        blog: {
          blogTitle: "",
          blogDescription: "LotteCoffee 的个人生活和工作记录",
          blogSidebarCount: 7,
          blogSidebarTitle: "近期文章",
          showReadingTime: true,
          readingTime: ({ content, frontMatter, defaultReadingTime }) =>
            defaultReadingTime({ content, options: { wordsPerMinute: 300 } }),
          feedOptions: {
            title: "",
            description: "LotteCoffee 的个人生活和工作记录",
            type: "all",
            copyright: `Copyright © ${new Date().getFullYear()} LotteCoffee, Inc.`,
          },
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        sitemap: {
          changefreq: "weekly",
          priority: 0.5,
          filename: "sitemap.xml",
        },
        googleAnalytics: {
          trackingID: "G-MHMEL0F832",
          anonymizeIP: true,
        },
        gtag: {
          trackingID: "G-MHMEL0F832",
          anonymizeIP: true,
        },
      }),
    ],
  ],
  plugins: [
    // -----------------------------------------------------------------------------------
    [
      "drawio",
      {
        lib: "https://cdn.jsdelivr.net/npm/docusaurus-plugin-drawio/viewer.min.js",
      },
    ],
    // -----------------------------------------------------Java基础--------------------------------
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "Base",
        path: "article/Java/Base",
        routeBasePath: "Base",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: true,
      },
    ],
    // -----------------------------------------------------Mybatis------------------------------
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "Mybatis",
        path: "article/Java/Mybatis",
        routeBasePath: "Mybatis",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: true,
      },
    ],
    // -----------------------------------------------------Spring--------------------------------
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "Spring",
        path: "article/Java/Spring",
        routeBasePath: "Spring",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: true,
      },
    ],
    // -----------------------------------------------------Redis--------------------------------
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "Redis",
        path: "article/Java/Redis",
        routeBasePath: "Redis",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],
    // -----------------------------------------------------RPC--------------------------------
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "RPC",
        path: "article/Server/RPC",
        routeBasePath: "RPC",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: true,
      },
    ],
    // -----------------------------------------------------Netty--------------------------------
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "Netty",
        path: "article/Server/Netty",
        routeBasePath: "Netty",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: true,
      },
    ],
    // -----------------------------------------------------Angular------------------------------
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "Angular",
        path: "article/Web/Angular",
        routeBasePath: "Angular",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: true,
      },
    ],
    // -----------------------------------------------------Vue----------------------------------
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "Vue",
        path: "article/Web/Vue",
        routeBasePath: "Vue",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: true,
      },
    ],
    // -----------------------------------------------------React--------------------------------
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "React",
        path: "article/Web/React",
        routeBasePath: "React",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: true,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "Tool",
        path: "article/Web/Tool",
        routeBasePath: "Tool",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: true,
      },
    ],
    // -------------------------------------------------power-protocol------------------------------
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "power_protocol",
        path: "article/Power/Power_Protocol",
        routeBasePath: "power_protocol",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: true,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "Zookeeper",
        path: "article/Server/Zookeeper",
        routeBasePath: "Zookeeper",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: true,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "Android",
        path: "article/Android/Android",
        routeBasePath: "Android",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],
    // HarmonyOs
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "HarmonyOs",
        path: "article/Android/HarmonyOs",
        routeBasePath: "HarmonyOs",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],
    // -------------------------------------------------Kotlin------------------------------------
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "Kotlin",
        path: "article/Android/Kotlin",
        routeBasePath: "Kotlin",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],
    // -------------------------------------------------摄影-----------------------------------
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "photography",
        path: "article/Other",
        routeBasePath: "photography",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],

    "docusaurus-plugin-umami",
    "@cmfcmf/docusaurus-search-local",
    "./src/plugin/postcss-tailwind-loader.js",
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // announcementBar: {
      //   id: "support_us",
      //   content: `🎉🎉🎉 Zookeeper服务已上线！欢迎大家学习！🎉🎉🎉`,
      //   backgroundColor: "#fafbfc", // Defaults to `#fff`.
      //   textColor: "#091E42", // Defaults to `#000`.
      //   isCloseable: false, // Defaults to `true`.
      // },
      metadata: [
        {
          name: "lottecoffee",
          content: "LotteCoffee 的个人生活和工作记录，欢迎大家一起学习！",
        },
      ],
      navbar: {
        title: "LotteCoffee",
        logo: {
          alt: "LotteCoffee",
          src: "img/logo.svg",
          srcDark: "img/logo.svg",
        },
        hideOnScroll: true,
        items: [
          { to: "/blog", label: "🔝 博客", position: "right" },
          {
            label: "🚀 Java 编程系列",
            position: "right",
            items: [
              {
                label: "🔋 Java 基础",
                to: "/Base",
              },
              {
                label: "🥁 Mybatis",
                to: "/Mybatis",
              },
              {
                label: "📽 Spring",
                to: "/Spring",
              },
              {
                label: "🚧 Redis",
                to: "/Redis",
              },
              {
                label: "🗼 RPC",
                to: "/RPC",
              },
              {
                label: "🌲 Netty",
                to: "/Netty",
              },
              {
                label: "🗻 Zookeeper",
                to: "/Zookeeper",
              },
              {
                label: "🛫 算法",
                href: "https://www.hello-algo.com/chapter_preface/",
              },
            ],
          },

          {
            position: "right",
            label: "🌄 WEB 开发系列",
            items: [
              {
                label: "🔫 Angular",
                to: "/Angular",
              },
              {
                label: "🎱 Vue",
                to: "/Vue",
              },
              {
                label: "🎰 React",
                to: "/React",
              },
              {
                label: "🤡 扩展工具",
                to: "/Tool",
              },
            ],
          },
          {
            position: "right",
            label: "📱 Android 开发系列",
            items: [
              {
                label: "🛸 Kotlin",
                to: "/Kotlin",
              },
              {
                label: "💘 Android",
                to: "/Android",
              },
            ],
          },
          {
            position: "right",
            label: "🍃 生活随笔",
            items: [
              {
                label: "📷 摄影",
                to: "/photography",
              }, {
                label: "⛵ 协议文档",
                to: "/power_protocol",
              },
            ],
          },
        ],
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 5,
      },
      algolia: {
        appId: "GV6YN1ODMO",
        apiKey: "50303937b0e4630bec4a20a14e3b7872",
        indexName: "kuizuo",
      },
      umami: {
        websiteid: "7efcd733-c232-43db-9f17-10a00c53b152",
        src: "https://www.lottecoffee.com/umami.js",
      },
      footer: {
        style: "dark",
        copyright: `<p>Copyright © ${new Date().getFullYear()} LotteCoffee  Built with Docusaurus.</p><p><a href="http://beian.miit.gov.cn/" >蜀ICP备2022021919号</a></p>`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        defaultLanguage: "markdown",
        additionalLanguages: ["java", "git", "nginx", "http"],
      },
      mermaid: {
        theme: { light: "neutral", dark: "forest" },
      },
    }),
  markdown: {
    mermaid: true,
  },
  themes: ["@docusaurus/theme-mermaid"]
};

module.exports = config;
