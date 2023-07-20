import React from 'react'
import clsx from 'clsx'
import styles from './HomepageFeatures.module.css'

const FeatureList = [
  {
    title: '《深入理解Java虚拟机：JVM高级特性与最佳实践》',
    author: '周志明',
    Svg: require('../../static/img/book01.svg').default,
    description: (
      <>
       JVM（Java Virtual Machine，Java 虚拟机）顾名思义就是用来执行 Java 程序的“虚拟主机”，实际的工作是将编译生成的.class 文件（字节码）翻译成底层操作系统可以运行的机器码并且进行调用执行，这也是 Java 程序能够跨平台（“一次编写，到处运行”）的原因（因为它会根据特定的操作系统生成对应的操作指令），Java语言最重要的特点就是跨平台运行。
       使用JVM就是为了支持与操作系统无关，实现跨平台。
      </>
    ),
  },
  {
    title: '《第一行代码——Android》',
    author: '郭霖',
    Svg: require('../../static/img/book02.svg').default,
    description: <>第一行代码这本书很详细的讲解了Android的各个组件、布局、控件，适合于初学者的一本书！而且里面也讲了Android工具的安装，开发环境的配置；但是这本书里面没有Java或者kotlin的任何东西，如果正真要做自己的APP的话，读者还需要，先学习一下Java或者Kotlin！在这里建议去看看Java基础，这本书的源码就是用Java写的！这两给大家也分享两本Java的初级书！1:《Java编程规范（第三版）》; 2：《Java编程思想(第4版)》</>,
  },
  {
    title: '《从0到1：html+CSS快速上手》',
    author: '莫振杰',
    Svg: require('../../static/img/book03.svg').default,
    description: (
      <>
       这书很好，很有体系。本书分两个部分，HTML与CSS，但这两部分对应的目录基本是一致的，作者挺细心，内容对初学者也很友好。
       有很多问题点到为止我觉得是这本书的精髓所在，想要知道更深入的，那就去看其他的深入书籍，这本书就是针对初学者，大部分初学者不需要也没有必要知道那么深入，看完这本书你基本会在脑海里形成一个框架，这就是它是一本好的入门书的原因。
      </>
    ),
  },
]

function Feature({ Svg,author, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className='text--center'>
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className='text--center padding-horiz--md'>
        <h3><a>{title}</a></h3>
        <h4>{author}</h4>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        {/* 推荐书籍 */}
        <div className={styles.recommend}>
          <div className="col col--12">
            <h2>📚📚推荐书籍📚📚</h2>
          </div>
        </div>
        {/* 推荐列表 */}
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
