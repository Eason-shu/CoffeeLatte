import React from "react";

import { useTrail, animated } from "react-spring";
import Translate, { translate } from "@docusaurus/Translate";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from "@docusaurus/Link";

import Button from "../Button";

import HeroMain from "./img/hero_main.svg";
import CSDNIcon from "@site/static/icons/csdn.svg";
import YuQueIcon from "@site/static/icons/yuque.svg";
import JueJinIcon from "@site/static/icons/juejin.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faGithub,
  faWeixin,
  faQq,
} from "@fortawesome/free-brands-svg-icons";
import useFollowers from "./useFollowers";
import styles from "./styles.module.css";

function Hero() {
  const {
    // 当前语言
    i18n: { currentLocale },
  } = useDocusaurusContext();

  // Get followers
  const followers = useFollowers();

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
            values={{
              bilibiliText: (
                <Link to="/">
                  <Translate
                    id="hompage.hero.text.bilibili"
                    description="Bilibili docs link label"
                  >
                    技术视频教程、
                  </Translate>
                </Link>
              ),
              courses: (
                <Link to="/">
                  <Translate
                    id="hompage.hero.text.course"
                    description="Course link label"
                  >
                    实战课程、
                  </Translate>
                </Link>
              ),
              blogs: (
                <Link to="#homepage_blogs">
                  <Translate
                    id="hompage.hero.text.blog"
                    description="Blog link label"
                  >
                    技术博客、
                  </Translate>
                </Link>
              ),
              links: (
                <Link to="/">
                  <Translate
                    id="hompage.hero.text.link"
                    description="Link link label"
                  >
                    前端资源导航、
                  </Translate>
                </Link>
              ),
              ideas: (
                <Link to="/lifestyle">
                  <Translate
                    id="hompage.hero.text.idea"
                    description="Idea link label"
                  >
                    想法和生活点滴
                  </Translate>
                </Link>
              ),
            }}
          >
            {`点击查看最新{bilibiliText}{courses}{blogs}{links}以及UP主的{ideas}。致力于帮助你以最直观、最快速的方式学会前端开发，并希望我的个人经历对你有所启发。`}
          </Translate>
        </animated.p>

        <SocialLinks animatedProps={animatedTexts[4]} />
        <animated.div style={animatedTexts[2]}>
          <Button
            isLink href="https://blog.csdn.net/weixin_44451022?spm=1000.2115.3001.5343"
          >
            <Translate description="follow me btn text">去CSDN关注</Translate>
          </Button>
        </animated.div>
      </div>

      <HeroMainImage />
    </animated.div>
  );
}

function SocialLinks({ animatedProps, ...props }) {
  // const { isDarkTheme } = useThemeContext();
  return (
    <animated.div className={styles.social__links} style={animatedProps}>
      {/* Github */}
      <a href="https://github.com/Eason-shu">
        <FontAwesomeIcon icon={faGithub} size="lg" />
      </a>
      {/* QQ */}
      <a href="https://qm.qq.com/cgroup/3138066125">
        <FontAwesomeIcon icon={faQq} size="lg" />
      </a>
      {/* yuQue */}
      <a href="https://www.yuque.com/eason_shu">
        <YuQueIcon />
      </a>
      {/* CSDN */}
      <a href="https://blog.csdn.net/weixin_44451022?spm=1000.2115.3001.5343">
        <CSDNIcon />
      </a>
      {/* juejin */}
      <a href="https://juejin.cn/user/3228642192657389">
        <JueJinIcon />
      </a>
    </animated.div>
  );
}

function HeroMainImage() {
  return (
    <div className={styles.bloghome__image}>
      <HeroMain />
    </div>
  );
}

export default Hero;
