import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./index.module.css";
import HomepageFeatures from "../components/HomepageFeatures";
import Head from "@docusaurus/Head";
import HeroImg from "../../static/img/Hero.jpg";
import Translate from "@docusaurus/Translate";
import { useTrail, animated } from "react-spring";
import HeroMain from "./img/hero_main.svg";
import CSDNIcon from "@site/static/icons/csdn.svg";
import YuQueIcon from "@site/static/icons/yuque.svg";
import JueJinIcon from "@site/static/icons/juejin.svg";

const svgList = [
  {
    title: "github",
    Svg: require("../../static/img/github.svg").default,
    color: "black",
    link: "https://github.com/Eason-shu",
  },
  {
    title: "yuque",
    Svg: require("../../static/img/yuque.svg").default,
    link: "https://www.yuque.com/eason_shu",
  },
  {
    title: "jueJin",
    Svg: require("../../static/img/juejin.svg").default,
    color: "#2979ff",
    link: "https://juejin.cn/user/3228642192657389",
  },
  {
    title: "csdn",
    Svg: require("../../static/img/csdn.svg").default,
    color: "#2979ff",
    link: "https://blog.csdn.net/weixin_44451022?spm=1000.2115.3001.5343",
  },
];
const Svg = ({ Svg, color, title, link }) => {
  return (
    <a href={link} target="_blank">
      <Svg className={styles.svg} style={{ fill: color }} />
    </a>
  );
};

/**
 *  主页面Hero组件
 * @returns
 */
function Hero() {
  const {
    // 当前语言
    i18n: { currentLocale },
  } = useDocusaurusContext();
  // animation
  const animatedTexts = useTrail(5, {
    from: { opacity: 0, transform: "translateY(3em)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: {
      mass: 3,
      friction: 45,
      tension: 460,
    },
  });
  return (
    <animated.div className={styles.hero}>
      <div className={styles.bloghome__intro}>
        <animated.div style={animatedTexts[0]} className={styles.hero_text}>
          <Translate description="hero greet">Hello! 我是</Translate>
          <span className={styles.intro__name}>
            <Translate description="my name">拿铁要加冰</Translate>
          </span>
        </animated.div>
        <animated.p style={animatedTexts[1]}>
          <Translate
            id="homepage.hero.text"
            description="hero text"
            values={{}}
          >
            {`我登楼观百川，入海即入我怀，遇事不决可问春风`}
          </Translate>
        </animated.p>
        <div className={styles.buttonContainer}>
          <button className={styles.button}>
            <a className={styles.hero_a} href="/">
              Click
            </a>
          </button>
          <span className={styles.buttonLeftText}>
            Get Started. <br /> 开启学习之旅.
          </span>
          <div className={styles.svgContainer}>
            {svgList.map((item, index) => {
              return <Svg {...item} key={item.title} />;
            })}
          </div>
        </div>
      </div>
      <HeroMainImage />
    </animated.div>
  );
}

/**
 * 主页面图片组建
 * @returns
 */
function HeroMainImage() {
  return (
    <div className={styles.bloghome__image}>
      <HeroMain />
    </div>
  );
}

/**
 * 主页面组件
 * @returns
 */
export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title="" description="拿铁要加冰的博客">
      <Head>
        // 百度
        <meta name="baidu-site-verification" content="code-7VeTrprZVx" />
        // 360
        <meta
          name="360-site-verification"
          content="0b0e3331bbf6d4f5bf369201bb326123"
        />
        // Bing
        <meta name="msvalidate.01" content="5723E6B938F5EE2738E056F2A58E1DB7" />
        // 搜狗
        <meta name="sogou_site_verification" content="ZwDQxSe70Y" />
        // 神马
        <meta
          name="shenma-site-verification"
          content="fed71b373d433c21d139f454bd1409b4_1663059054"
        ></meta>
        // 头条
        <meta
          name="bytedance-verification-code"
          content="G6kAPFmjdnZWEKwOqHzU"
        />
        // Google
        <meta
          name="google-site-verification"
          content="_rHzOjHo4rSNNcdH1Pyby6bwPqXCZWZ4qWPXRGj11kw"
        />
        <meta name="referrer" content="no-referrer" />
      </Head>
      <main>
        <Hero />
        {/* <MyHero /> */}
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
