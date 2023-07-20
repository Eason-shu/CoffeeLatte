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
          { to: "/blog", label: "🔝 首页", position: "right" },
          {
            label: "🌈 Java",
            position: "right",
            items: [
              {
                label: "2️⃣ Mybatis",
                to: "/Mybatis",
              }
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
        src: "https://www.shuzhilin.top/umami.js",
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
