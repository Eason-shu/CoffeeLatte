/**
 * Code Theme
 */
const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");
const { to } = require("react-spring");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "拿铁要加冰 | Java开发工程师", // 标题 | Title
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
          blogDescription: "拿铁要加冰 的个人生活和工作记录",
          blogSidebarCount: 7,
          blogSidebarTitle: "近期文章",
          showReadingTime: true,
          feedOptions: {
            title: "",
            description: "拿铁要加冰 的个人生活和工作记录",
            type: "all",
            copyright: `Copyright © ${new Date().getFullYear()} 拿铁要加冰, Inc.`,
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
      "@docusaurus/plugin-content-docs",
      {
        id: "roadmap",
        path: "work/roadmap",
        routeBasePath: "roadmap",
        sidebarPath: require.resolve("./sidebars.js"),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
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
    "docusaurus-plugin-umami",
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      announcementBar: {
        id: "support_us",
        content: `🎉🎉🎉 Mybatis源码分析已上线！欢迎大家学习！🎉🎉🎉`,
        backgroundColor: "#fafbfc", // Defaults to `#fff`.
        textColor: "#091E42", // Defaults to `#000`.
        isCloseable: true, // Defaults to `true`.
      },
      metadata: [
        {
          name: "keywords",
          content: "7wate, wiki, blog, c, c++, java, python, linux",
        },
      ],
      navbar: {
        title: "拿铁要加冰",
        logo: {
          alt: "拿铁要加冰 | Java开发工程师",
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
            label: "👨‍💻 职业",
            items: [
              {
                label: "求职之路",
                to: "/roadmap",
              },
            ],
          },
        ],
      },
      algolia: {
        apiKey: "5d5a02bdf02df700355c8ccd84b78d13",
        appId: "8W3YJXJGF2",
        indexName: "wiki",
      },
      umami: {
        websiteid: "7efcd733-c232-43db-9f17-10a00c53b152",
        src: "https://www.lottecoffee.com/umami.js",
      },
      footer: {
        style: "dark",
        copyright: `<p>Copyright © ${new Date().getFullYear()} 拿铁要加冰  Built with Docusaurus.</p><p><a href="http://beian.miit.gov.cn/" >蜀ICP备2022021919号</a></p>`,
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
