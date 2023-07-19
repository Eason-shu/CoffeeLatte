/**
 * Code Theme
 */
const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "拿铁要加冰 | Java开发工程师", // 标题 | Title
  tagline: "活到老，学到老，作为程序员的自我修养，哈哈哈哈哈", // 标语 | Tagline
  url: "https://www.shuzhilin.top", // 站点地址 | Your website URL
  baseUrl: "/", // 站点根目录 | Base URL for your project */
  favicon: "img/favicon.ico", // 站点图标 | Favicon
  organizationName: "shuzhilin", // 拥有这个仓库的 GitHub 用户或组织|Usually your GitHub org/user name.
  projectName: "shuzhilin.top", // 仓库名称 | Usually your repo name.
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
          editUrl: "https://git.7wate.com/zhouzhongping/wiki/src/branch/master",
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          breadcrumbs: false,
        },
        blog: {
          blogTitle: "7Wate`s Blog",
          blogDescription: "7Wate 的个人生活和工作记录",
          blogSidebarCount: 7,
          blogSidebarTitle: "近期文章",
          showReadingTime: true,
          editUrl: "https://git.7wate.com/zhouzhongping/wiki/src/branch/master",
          feedOptions: {
            title: "7Wate`s Blog",
            description: "7Wate 的个人生活和工作记录",
            type: "all",
            copyright: `Copyright © ${new Date().getFullYear()} 7Wate, Inc.`,
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
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "getting-started",
        path: "wiki/getting-started",
        routeBasePath: "getting-started",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl: "https://git.7wate.com/zhouzhongping/wiki/src/branch/master",
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "programming-language",
        path: "wiki/programming-language",
        routeBasePath: "programming-language",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl: "https://git.7wate.com/zhouzhongping/wiki/src/branch/master",
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "structures-algorithms",
        path: "wiki/structures-algorithms",
        routeBasePath: "structures-algorithms",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl: "https://git.7wate.com/zhouzhongping/wiki/src/branch/master",
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "computer-composition",
        path: "wiki/computer-composition",
        routeBasePath: "computer-composition",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl: "https://git.7wate.com/zhouzhongping/wiki/src/branch/master",
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "computer-network",
        path: "wiki/computer-network",
        routeBasePath: "computer-network",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl: "https://git.7wate.com/zhouzhongping/wiki/src/branch/master",
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "operating-system",
        path: "wiki/operating-system",
        routeBasePath: "operating-system",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl: "https://git.7wate.com/zhouzhongping/wiki/src/branch/master",
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "database-system",
        path: "wiki/database-system",
        routeBasePath: "database-system",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl: "https://git.7wate.com/zhouzhongping/wiki/src/branch/master",
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "computer-security",
        path: "wiki/computer-security",
        routeBasePath: "computer-security",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl: "https://git.7wate.com/zhouzhongping/wiki/src/branch/master",
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "software-engineering",
        path: "wiki/software-engineering",
        routeBasePath: "software-engineering",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl: "https://git.7wate.com/zhouzhongping/wiki/src/branch/master",
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "compilation-principle",
        path: "wiki/compilation-principle",
        routeBasePath: "compilation-principle",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl: "https://git.7wate.com/zhouzhongping/wiki/src/branch/master",
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],
    // -----------------------------------------------------------------------------------
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "org",
        path: "group/organization",
        routeBasePath: "org",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl: "https://git.7wate.com/zhouzhongping/wiki/src/branch/master",
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "com",
        path: "group/company",
        routeBasePath: "com",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl: "https://git.7wate.com/zhouzhongping/wiki/src/branch/master",
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "gov",
        path: "group/government",
        routeBasePath: "gov",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl: "https://git.7wate.com/zhouzhongping/wiki/src/branch/master",
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],
    // -----------------------------------------------------------------------------------
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "roadmap",
        path: "work/roadmap",
        routeBasePath: "roadmap",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl: "https://git.7wate.com/zhouzhongping/wiki/src/branch/master",
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "devops",
        path: "work/devops",
        routeBasePath: "devops",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl: "https://git.7wate.com/zhouzhongping/wiki/src/branch/master",
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "sre",
        path: "work/sre",
        routeBasePath: "sre",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl: "https://git.7wate.com/zhouzhongping/wiki/src/branch/master",
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
      },
    ],

    // ----------------------------------------------------Spring-------------------------------
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "Spring",
        path: "java/Spring",
        routeBasePath: "Spring",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl: "https://git.7wate.com/zhouzhongping/wiki/src/branch/master",
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
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
        editUrl: "https://git.7wate.com/zhouzhongping/wiki/src/branch/Mybatis",
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        breadcrumbs: false,
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
          { to: "/blog", label: "🔝 首页", position: "right" },
          {
            label: "🌈 Java",
            position: "right",
            items: [
              {
                label: "1️⃣ Spring",
                to: "/Spring",
              },
              {
                label: "2️⃣ Mybatis",
                to: "/Mybatis",
              },
            ],
          },
          {
            position: "right",
            label: "👨🏻‍🎓 维基",
            items: [
              {
                label: "基础入门",
                to: "/getting-started",
              },
              {
                label: "程序设计语言",
                to: "/programming-language",
              },
              {
                label: "数据结构与算法",
                to: "/structures-algorithms",
              },
              {
                label: "计算机组成",
                to: "/computer-composition",
              },
              {
                label: "计算机网络",
                to: "/computer-network",
              },
              {
                label: "计算机安全",
                to: "/computer-security",
              },
              {
                label: "操作系统",
                to: "/operating-system",
              },
              {
                label: "数据库系统",
                to: "/database-system",
              },
              {
                label: "软件工程",
                to: "/software-engineering",
              },
              {
                label: "编译原理",
                to: "/compilation-principle",
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
              {
                label: "SRE 工程师",
                to: "/sre",
              },
              {
                label: "DevOps 工程师",
                to: "/devops",
              },
            ],
          },
          {
            position: "right",
            label: "💼 组织",
            items: [
              {
                label: "自由社区",
                to: "/org",
              },
              {
                label: "现代企业",
                to: "/com",
              },
              {
                label: "国家政府",
                to: "/gov",
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
        src: "https://umami.7wate.org/umami.js",
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
