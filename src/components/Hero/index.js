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
