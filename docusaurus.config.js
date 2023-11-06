/**
 * Code Theme
 */
const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");
const { to } = require("react-spring");
/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "LotteCoffee", // 标题 | Title
  staticDirectories: ["public", "static"], // 静态文件夹 | Static directory
  tagline: "活到老，学到老，作为程序员的自我修养，哈哈哈哈哈", // 标语 | Tagline
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
    // -----------------------------------------------------Base--------------------------------
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "Base",
        path: "java/Base",
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
        path: "java/Mybatis",
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
        path: "java/Spring",
        routeBasePath: "Spring",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: true,
      },
    ],
     // -----------------------------------------------------微服务--------------------------------
     [
      "@docusaurus/plugin-content-docs",
      {
        id: "Microservices",
        path: "java/微服务",
        routeBasePath: "Microservices",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: true,
      },
    ],
    // -----------------------------------------------------Idea--------------------------------
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "Idea",
        path: "java/Idea",
        routeBasePath: "Idea",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],
    // -----------------------------------------------------Redis--------------------------------
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "Redis",
        path: "java/Redis",
        routeBasePath: "Redis",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],
    // -----------------------------------------------------Angular------------------------------
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "Angular",
        path: "web/Angular",
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
        path: "web/Vue",
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
        path: "web/React",
        routeBasePath: "React",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: true,
      },
    ],
    // --------------------------------------------------Power-Base-------------------------------
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "power_base",
        path: "power/Power_Base",
        routeBasePath: "power_base",
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
        path: "power/Power_Protocol",
        routeBasePath: "power_protocol",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: true,
      },
    ],
    // -------------------------------------------------Kotlin------------------------------------
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "Kotlin",
        path: "android/Kotlin",
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
        path: "hobby/photography",
        routeBasePath: "photography",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],

    "docusaurus-plugin-umami",
    "./src/plugin/postcss-tailwind-loader.js",
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      announcementBar: {
        id: "support_us",
        content: `🎉🎉🎉 微服务教程已上线！欢迎大家学习！🎉🎉🎉`,
        backgroundColor: "#fafbfc", // Defaults to `#fff`.
        textColor: "#091E42", // Defaults to `#000`.
        isCloseable: false, // Defaults to `true`.
      },
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
          src: "img/logo.jpg",
          srcDark: "img/logo.jpg",
        },
        hideOnScroll: true,
        items: [
          { to: "/blog", label: "🔝 博客", position: "right" },
          {
            label: "🚀 Java",
            position: "right",
            items: [
              {
                label: "1️⃣ Java基础",
                to: "/Base",
              },
              {
                label: "2️⃣ Mybatis",
                to: "/Mybatis",
              },
              {
                label: "3️⃣ Spring",
                to: "/Spring",
              },
              {
                label: "4️⃣ Redis",
                to: "/Redis",
              },
              {
                label: "5️⃣ Idea",
                to: "/Idea",
              },
              {
                label: "6️⃣ 算法",
                href: "https://www.hello-algo.com/chapter_preface/",
              },
              {
                label: "7️⃣ 微服务",
                to: "/Microservices",
              },
            ],
          },
          {
            position: "right",
            label: "🌄 WEB",
            items: [
              {
                label: "1️⃣ Angular",
                to: "/Angular",
              },
              {
                label: "2️⃣ Vue",
                to: "/Vue",
              },
              {
                label: "3️⃣ React",
                to: "/React",
              },
            ],
          },
          {
            position: "right",
            label: "📱 Android",
            items: [
              {
                label: "1️⃣ Kotlin",
                to: "/Kotlin",
              },
            ],
          },
          {
            position: "right",
            label: "⚡ 业务知识",
            items: [
              {
                label: "基本理论知识",
                to: "/power_base",
              },
              {
                label: "协议文档",
                to: "/power_protocol",
              },
            ],
          },
          {
            position: "right",
            label: "🎮 爱好",
            items: [
              {
                label: "摄影",
                to: "/photography",
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
  themes: ["@docusaurus/theme-mermaid"],
};

module.exports = config;
