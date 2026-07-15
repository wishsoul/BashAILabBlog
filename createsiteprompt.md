你是一名资深前端工程师、品牌设计师和静态网站架构师。

请为我开发一个可以通过 GitHub Pages 发布的个人品牌网站。这个网站不是传统简历站，也不是普通开发者 Portfolio，而是一个以 AI 研究、独立产品、Agentic Development 和个人实验成果为核心的个人品牌网站。

# 一、项目目标

网站品牌名称：

Bash AI Lab

个人定位：

AI Product Manager × Independent Developer × Agentic Development Researcher

核心品牌描述：

我是一名 AI 产品经理与独立开发者，研究如何通过 AI Agent、Codex、GitHub 和自动化研发工作流，让一个人也能够完成从产品构想到软件发布的全过程。

英文定位：

AI Product Manager and Independent Developer exploring how AI agents, product systems, and constrained interfaces can turn ideas into production-ready software.

网站目标：

1. 展示我在 AI 产品、AI Agent、Codex 协作开发和独立产品方面的研究成果
2. 展示真实项目、产品架构、研发流程和实验结果
3. 沉淀长期研究文章、Build Log 和方法论
4. 建立个人专业品牌
5. 服务于求职、行业合作、独立产品推广和未来商业化
6. 后续可扩展 Prompt Pack、教程、产品下载和咨询服务

# 二、网站整体气质

网站设计方向定义为：

Quiet Futurism / 安静的未来主义

视觉关键词：

* 大量留白
* 克制
* 前卫
* 精密
* 编辑出版物感
* 研究实验室感
* 数字产品工作室感
* 轻微未来感
* 非科幻
* 非传统简历模板
* 非传统开发者 Portfolio
* 非 Bento 卡片堆砌

需要避免：

* AI 星光图标
* 大面积紫色渐变
* 发光球体
* 粒子背景
* 玻璃卡片泛滥
* 复杂 3D 地球
* 大量彩色卡片
* 模板化技能标签墙
* 传统头像居中的个人简介
* “Hello, I am...”式老旧 Portfolio 首屏
* 过度动画
* 信息密度过高
* 视觉噪音

前卫感主要来自：

* 超大字号排版
* 非对称但严格的网格
* 精确的间距系统
* 极细分割线
* 项目编号
* 状态标签
* 编辑出版物式列表
* 产品架构图和真实 UI 截图
* 少量克制的 Motion
* 系统状态和研究档案感

# 三、技术要求

使用以下技术栈：

* Astro
* TypeScript
* Tailwind CSS
* Astro Content Collections
* Markdown / MDX
* Astro 静态输出
* GitHub Actions
* GitHub Pages

优先参考 Astro Nano 的技术结构，但不要直接沿用其视觉设计。

可以 Fork 或参考 Astro Nano 的：

* Astro 项目结构
* Markdown / MDX 内容能力
* SEO
* Sitemap
* RSS
* Light / Dark Theme
* 基础动画
* TypeScript 配置
* Tailwind 配置

不要直接照搬 Astro Nano 的页面 UI。

代码要求：

* 组件化
* 类型安全
* 可维护
* 避免过度抽象
* 不引入不必要的 React 或 Vue
* 默认尽量使用 Astro 原生组件
* 页面默认静态生成
* 所有内容尽量通过 Content Collections 管理
* 后续新增文章和项目时不需要修改核心页面代码
* 支持响应式
* 支持键盘导航
* 支持 prefers-reduced-motion
* Lighthouse Performance、SEO、Accessibility、Best Practices 尽量达到 95 分以上

# 四、品牌 Design Token

建立统一的 Design Token，不要在组件中随意写零散样式。

建议浅色主题：

* Background: #F5F5F1
* Surface: #FFFFFF
* Primary Text: #111111
* Secondary Text: #686868
* Border: rgba(0, 0, 0, 0.10)
* Accent: #5B5CFF

建议深色主题：

* Background: #0B0B0C
* Surface: #121214
* Primary Text: #F1F1EE
* Secondary Text: #99999F
* Border: rgba(255, 255, 255, 0.12)
* Accent: #8D8EFF

强调色只用于：

* 链接
* Hover
* 当前状态
* 小型数据点
* 少量品牌识别
* 选中元素

不要大面积使用强调色。

字体建议：

主字体候选：

* Geist
* Instrument Sans
* Inter
* IBM Plex Sans

等宽字体候选：

* Geist Mono
* IBM Plex Mono
* JetBrains Mono

字体用途：

* 超大标题：主字体
* 正文：主字体
* 时间、状态、标签、项目编号：等宽字体

优先使用可公开加载或系统兼容字体，避免引入需要付费授权的字体。

# 五、页面结构

网站主导航：

* Work
* Research
* Log
* About
* GitHub

路由结构：

/
├── /work
│   ├── /mac-native-kit
│   ├── /pastepop
│   ├── /wordgrill
│   └── /tidypilot
│
├── /research
│   ├── /agentic-development
│   ├── /ai-native-interfaces
│   └── /independent-products
│
├── /log
├── /about
├── /resume
└── /404

不要使用 Projects / Blog / Contact 这种过于模板化的主导航命名。

# 六、首页结构

首页不是传统简历首页。

## 1. Header

设计一个极简固定 Header。

桌面端示例：

BASH AI LAB                    Work   Research   Log   About   GitHub ↗

要求：

* 高度克制
* 无大面积背景
* 可在滚动后出现轻微模糊或边框
* 当前页面导航状态清晰
* 移动端使用简洁菜单
* GitHub 是外链，并带外链标识
* 支持键盘访问

## 2. Hero

Hero 占据首屏约 75% 至 90% 高度。

主文案：

BASH AI LAB

Building systems that help
one person create software
with AI.

辅助文案：

I research how AI agents, product systems, and constrained interfaces turn ideas into production-ready software.

身份标签：

AI Product Research
Agentic Development
Native Software
Independent Products

地理与工作状态可简短展示：

Based in Shenzhen / Working globally

CTA：

* Explore Work
* Read Research

CTA 不要做成厚重的大按钮，可以采用文本链接、箭头和细线设计。

## 3. Current Research

使用论文目录式或研究索引式布局，不做传统卡片网格。

示例：

01  Agentic Development
How AI agents collaborate across research,
product design, engineering and validation.

02  Constrained AI Interfaces
How rules, tokens and validators improve
AI-generated native interfaces.

03  Independent Products
Building focused native software with
AI-assisted workflows.

需要支持点击进入对应 Research 分类或文章。

## 4. Selected Work

展示 3 至 4 个重点项目。

项目：

1. MacNativeKit
2. PastePop
3. WordGrill
4. TidyPilot

每个项目展示：

* 项目编号
* 项目名称
* 一句话定位
* 项目状态
* 年份
* 技术或研究标签
* 大尺寸视觉区域
* 项目详情链接

不要全部放成尺寸一致的小卡片。

采用：

* 大图
* 左右交错
* 不对称排版
* 每个项目有足够留白
* 项目之间用细线或大间距分隔

## 5. Latest Research

使用编辑出版物列表。

示例：

2026.07.15
Why Functional Tests Still Fail Real User Journeys

2026.07.14
From L3 to L4 Agentic Software Development

2026.07.09
Designing a Constraint System for AI-Generated UI

每一项展示：

* 日期
* 标题
* 分类
* 阅读时间
* 链接箭头

不要使用博客图片卡片。

## 6. Lab Status

增加一个有辨识度的个人实验室状态模块。

示例：

LAB STATUS

MacNativeKit       v0.4       Active
PastePop           MVP        Building
WordGrill          v1.2       Testing
TidyPilot          Research   Exploring

状态需要通过项目内容数据自动生成。

建议状态枚举：

* Exploring
* Researching
* Designing
* Building
* Testing
* Active
* Paused
* Shipped

不同状态可使用非常克制的文字或圆点区分。

## 7. Footer

Footer 包含：

* Bash AI Lab
* 简短品牌描述
* GitHub
* Email
* Resume
* RSS
* Copyright
* Built with Astro
* 当前年份自动生成

# 七、Work 页面

Work 页面用于展示真实项目与产品成果。

项目不要只写功能列表。

需要支持以下分类：

* Products
* Infrastructure
* Experiments

项目数据结构至少包含：

* title
* slug
* description
* year
* startedAt
* status
* category
* featured
* tags
* cover
* github
* demo
* platform
* role
* order

Work 列表页设计要求：

* 编辑出版物式
* 可使用大图和编号
* 可按分类过滤
* 不要使用常规三列卡片网格
* 项目 Hover 动效克制
* 项目状态清晰
* 移动端保持良好阅读顺序

# 八、项目详情页

每个项目详情页需要包含：

1. Project Hero
2. 一句话定位
3. 项目状态
4. 项目年份
5. 我的角色
6. 技术与研究标签
7. GitHub / Demo 链接
8. Problem
9. Insight
10. Product Strategy
11. Solution
12. AI / Technical Approach
13. My Role
14. Artifacts
15. Results
16. Learnings
17. Next Step

项目案例页面要体现：

* 问题是什么
* 我发现了什么
* 我做了什么判断
* 为什么这样设计
* AI 或 Agent 如何参与
* 最终完成了什么
* 有什么可验证成果

支持在 MDX 中插入：

* 图片
* 视频
* Mermaid
* 代码块
* Quote
* Callout
* 数据指标
* 架构图
* Timeline
* Before / After
* GitHub 链接

# 九、首批项目内容

建立首批项目占位内容。

## MacNativeKit

定位：

Constraint runtime for AI-generated native macOS interfaces.

中文说明：

面向 AI 生成 macOS 原生 UI 的约束式 DSL、Runtime、Design Token、Validator 和 Codegen 系统。

关键词：

* AI UI
* SwiftUI
* AppKit
* Design System
* DSL
* Runtime
* Validator
* Codegen

状态：

Active

## PastePop

定位：

A lightweight and privacy-focused clipboard history tool for macOS.

中文说明：

面向 macOS 的轻量、快速、隐私友好的剪贴板历史工具。

关键词：

* macOS
* Native App
* Clipboard
* Privacy
* Indie Product

状态：

Building

## WordGrill

定位：

An AI-assisted vocabulary learning system built around meaning, chunks, boundaries and semantic relations.

中文说明：

基于义项、语块、边界和词汇关系网络的 AI 词汇内化系统。

关键词：

* AI Education
* Vocabulary
* DeepSeek
* Knowledge Graph
* iOS
* macOS

状态：

Testing

## TidyPilot

定位：

An affordable and intelligent Mac cleanup assistant.

中文说明：

面向普通 Mac 用户的平价、智能、非骚扰式磁盘整理工具。

关键词：

* macOS
* AI Assistant
* File Management
* Privacy
* Indie Product

状态：

Researching

# 十、Research 页面

Research 页面用于展示我的长期研究方向和研究文章。

研究分类：

1. Agentic Development
2. AI-Native Interfaces
3. Independent Products
4. AI Product Management
5. Human-AI Collaboration

Research 列表页使用：

* 日期
* 标题
* 摘要
* 分类
* 阅读时间
* 状态
* 标签

文章不要强制使用封面图。

优先采用编辑出版物或研究档案式布局。

文章状态可包括：

* Note
* Essay
* Research
* Experiment
* Framework
* Case Study

首批文章占位：

1. Why Functional Tests Still Fail Real User Journeys
2. From L3 to L4 Agentic Software Development
3. Designing a Constraint System for AI-Generated UI
4. How GitHub Issues Become the Source of Truth for AI Development
5. Human Checkpoints in Autonomous Software Development

# 十一、Log 页面

Log 是短内容和开发过程记录。

支持：

* Build Log
* Research Note
* Experiment
* Changelog
* Decision

每条 Log 包含：

* date
* title
* type
* summary
* relatedProject
* tags

Log 页面采用时间轴或日期流式布局。

不要做成博客文章卡片。

示例：

2026.07.15
重新设计 Codex UX 测试方法，将测试目标从页面功能覆盖转向用户任务闭环覆盖。

2026.07.14
完成 Agentic Development Workflow 的人工审批节点设计。

2026.07.09
定义 TidyPilot v0.1 MVP 范围。

# 十二、About 页面

About 页面不要写成冗长履历。

需要包括：

* 我是谁
* 我目前研究什么
* 为什么研究一人软件开发
* 我的产品与 AI 观念
* 我的工作方式
* 核心能力
* 当前关注方向
* 简历入口
* GitHub
* Email

建议内容结构：

01 Background
02 Current Focus
03 How I Work
04 Principles
05 Selected Experience
06 Contact

可以展示少量职业经历，但不要把完整简历复制到页面。

# 十三、内容管理

使用 Astro Content Collections。

建立：

src/content/
├── work/
├── research/
├── log/
└── pages/

为每种内容建立严格 Schema。

需要：

* Zod 校验
* 类型安全
* 日期解析
* Draft 状态
* Featured 状态
* 排序字段
* 标签
* SEO 字段
* 图片字段
* 外链字段

支持草稿：

draft: true

生产构建时不展示草稿。

# 十四、组件设计

至少创建以下组件：

* SiteHeader
* MobileNavigation
* SiteFooter
* HeroSection
* SectionHeader
* ResearchIndex
* ProjectFeature
* ProjectListItem
* StatusIndicator
* LabStatus
* ArticleListItem
* LogTimeline
* TagList
* ExternalLink
* ThemeToggle
* Breadcrumb
* TableOfContents
* MDXCallout
* MetricBlock
* ProjectMetadata
* BackToTop

组件要求：

* API 清晰
* 无重复代码
* 不要过度封装
* 无障碍
* 支持深浅色
* 动效遵循 prefers-reduced-motion

# 十五、动效要求

只使用少量克制动效：

* 页面内容轻微 Fade / Translate
* 链接箭头轻微移动
* 图片轻微缩放
* Header 滚动状态变化
* 项目 Hover 的标题或线条变化
* 页面进入时的顺序动画

禁止：

* 大量滚动视差
* 粒子系统
* 3D 地球
* 持续旋转
* 大面积鼠标跟随
* 影响阅读的动画
* 首屏长时间 Loading 动画

# 十六、SEO 与分享

实现：

* 基础 SEO
* Open Graph
* Twitter Card
* Canonical URL
* Sitemap
* robots.txt
* RSS
* JSON-LD Person
* JSON-LD WebSite
* JSON-LD Article
* JSON-LD SoftwareApplication 或 CreativeWork
* 每页独立 title 和 description
* 项目和文章独立社交分享图配置

站点基础信息：

Site Name:
Bash AI Lab

Default Title:
Bash AI Lab — AI Product Research & Independent Software

Default Description:
AI product research, agentic development systems and independent software built by Bash.

# 十七、GitHub Pages 发布要求

项目必须支持 GitHub Pages 静态发布。

请创建：

.github/workflows/deploy.yml

使用 GitHub 官方 Pages Actions 或 Astro 官方推荐方式。

工作流要求：

1. main 分支 push 时触发
2. 支持手动 workflow_dispatch
3. 安装 Node.js
4. 安装依赖
5. 执行 Astro Check
6. 执行测试
7. 执行构建
8. 上传 Pages Artifact
9. 发布到 GitHub Pages

建议命令：

* npm ci
* npm run check
* npm run test
* npm run build

如果暂时没有复杂测试，至少提供：

* Astro Check
* TypeScript Check
* Build
* 基础链接检查

设置正确的 GitHub Pages 权限：

* contents: read
* pages: write
* id-token: write

设置 concurrency，避免重复部署。

# 十八、Astro GitHub Pages 配置

需要兼容两种部署方式。

## 方式一：用户主页仓库

仓库：

username.github.io

站点：

https://username.github.io

此时：

* base 不应设置为仓库子路径
* site 使用完整站点 URL

## 方式二：普通项目仓库

仓库：

bash-ai-lab

站点：

https://username.github.io/bash-ai-lab

此时：

* site 设置为 https://username.github.io
* base 设置为 /bash-ai-lab
* 所有内部资源和路由必须兼容 base path
* 不允许在代码里硬编码根路径资源

请提供清晰配置方式。

优先通过环境变量管理：

PUBLIC_SITE_URL
PUBLIC_BASE_PATH

或设计一个简单、明确、不会出错的 site config。

# 十九、自定义域名兼容

后续可能绑定：

bashai.dev
bashxu.com
bashlab.dev

需要：

* 支持自定义域名
* public/CNAME 可配置
* README 中说明 DNS 和 GitHub Pages 配置方法
* 使用自定义域名时可以移除 base path
* Canonical URL 跟随站点配置

不要现在写死具体域名。

# 二十、开发体验

package.json 至少提供：

* dev
* build
* preview
* check
* lint
* format
* test

推荐：

* ESLint
* Prettier
* prettier-plugin-astro
* astro check

如果引入测试：

* Vitest 用于基础工具函数
* Playwright 用于关键页面 Smoke Test

至少实现以下 Smoke Test：

1. 首页可以正常加载
2. Work 页面可以访问
3. Research 页面可以访问
4. 项目详情页可以访问
5. 404 页面正常
6. 深浅色切换正常
7. 移动端导航可以打开和关闭
8. GitHub Pages base path 下资源不丢失

# 二十一、README

README 必须包含：

1. 项目介绍
2. 技术栈
3. 本地开发
4. 内容目录
5. 新增项目方法
6. 新增文章方法
7. 新增 Log 方法
8. 修改个人信息方法
9. 修改站点 URL 方法
10. GitHub Pages 配置
11. 自定义域名配置
12. GitHub Actions 发布说明
13. 深浅色配置
14. Design Token 修改方式
15. 构建与测试命令
16. 常见问题

# 二十二、实施步骤

请严格按阶段实施。

## Phase 1：基础工程

* 初始化 Astro
* 配置 TypeScript
* 配置 Tailwind
* 配置 Content Collections
* 配置字体
* 配置 Design Token
* 配置 GitHub Pages
* 配置 GitHub Actions
* 创建基础 Layout

## Phase 2：核心页面

* Header
* Footer
* Home
* Work
* Work Detail
* Research
* Research Detail
* Log
* About
* 404

## Phase 3：内容系统

* Work Schema
* Research Schema
* Log Schema
* MDX 组件
* RSS
* Sitemap
* SEO
* JSON-LD

## Phase 4：质量保障

* Astro Check
* ESLint
* Build
* Smoke Test
* 响应式检查
* 无障碍检查
* GitHub Pages base path 检查
* Lighthouse 检查

# 二十三、验收标准

项目完成后必须满足：

1. npm install 可以成功
2. npm run dev 可以启动
3. npm run check 通过
4. npm run build 通过
5. npm run test 通过
6. GitHub Actions 可以完成部署
7. GitHub Pages 可以正常访问
8. 子路径部署时 CSS、JS、字体、图片不丢失
9. 首页符合 Quiet Futurism 风格
10. 页面有大量留白
11. 没有传统 Portfolio 模板感
12. 没有 Bento 卡片堆砌
13. 没有泛滥的渐变、玻璃和 AI 星光元素
14. Work、Research、Log 内容由 Markdown 或 MDX 驱动
15. 后续新增内容不需要修改首页核心代码
16. 桌面端、平板端和移动端布局正常
17. 键盘导航正常
18. prefers-reduced-motion 生效
19. 深浅色模式正常
20. 404 页面正常

# 二十四、执行要求

在开始编码前：

1. 先检查当前仓库内容
2. 如果仓库为空，初始化标准 Astro 项目
3. 如果仓库已有 Astro 项目，先评估现有结构，不要盲目覆盖
4. 输出简短实施计划
5. 列出准备新增、修改和删除的文件
6. 再开始实现

开发过程中：

* 每完成一个 Phase，运行相关检查
* 不要把所有代码写完后才测试
* 发现依赖或 GitHub Pages 路径问题时立即修复
* 不要为了视觉效果引入大型依赖
* 不要保留模板中的无用示例内容
* 不要留下 Lorem Ipsum
* 所有占位内容必须与 Bash AI Lab 相关
* 不要伪造项目成果数据
* 没有真实数据的地方使用明确占位字段或定性描述

最终交付时输出：

1. 完成内容总结
2. 页面结构
3. 技术架构
4. 主要文件列表
5. 本地启动命令
6. 测试结果
7. 构建结果
8. GitHub Pages 配置步骤
9. GitHub Actions 发布步骤
10. 尚未完成或需要我补充的内容