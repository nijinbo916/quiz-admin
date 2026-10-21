# Quiz 后台管理（Vue 2 + Element UI）

Web 开发技术课程第五次作业：使用 **Vue 2 + Element UI** 搭建一个题库后台管理系统，
包含数据看板、用户管理、题目管理三个页面，把 quiz-game 的用户与题目搬到后台里维护。

## 在线预览

| 地址 | 说明 |
| --- | --- |
| Vercel（提交用） | https://quiz-admin-<to-be-filled>.vercel.app/ |
| GitHub Pages（备用） | https://nijinbo916.github.io/quiz-admin/ |

> 国内访问 `*.vercel.app` 可能被 DNS 污染，打不开时请使用上面的 GitHub Pages 备用地址。

## 技术栈

- Vue 2.7.16 + vue-router 3.6.5（hash 模式，静态托管无需服务端重写）
- Element UI 2.15.14（表格、表单、对话框、分页、菜单、时间线等组件）
- Vue CLI 5（webpack 5）打包，`publicPath: './'`，产物可放任意子目录
- 数据层：`Vue.observable` 轻量全局 store + `localStorage` 持久化（本项目无后端）

## 功能清单

**数据看板 `/dashboard`**

- 用户总数 / 题库总量 / 平均选项数 / 今日新增 四张指标卡
- 题库分类分布条形图、用户角色构成环形图（纯 CSS 计算，不依赖图表库）
- 最近操作时间线（新增、编辑、删除、重置都会留痕，保留最近 30 条）
- 最近添加的用户表格

**用户管理 `/user`**

- 关键词 + 角色双条件筛选，回车即可查询
- 表格展示日期、用户名、密码（默认打码，可单条切换显示）、角色标签
- 新增 / 编辑弹窗：用户名唯一性校验、长度校验、角色单选
- 单条删除、多选批量删除，均带二次确认
- 分页（5 / 10 / 20 / 50 条每页），删除后自动修正页码
- 一键导出全部用户与题目为 JSON 文件

**题目管理 `/question`**

- 关键词 + 分类筛选
- 表格展示题干、分类、选项（正确答案标绿）、答案字母
- 新增 / 编辑弹窗：支持 2 - 6 个动态增减选项、单选标记正确答案
- 题目预览（学生视角查看题干与选项，正确答案高亮）
- 单条删除、批量删除、分页

**通用**

- 左侧导航 + 顶部面包屑的经典后台布局，窄屏自动收起为图标模式
- 所有增删改自动写入 `localStorage`，顶部显示「已自动保存」时间
- 「重置演示数据」可一键恢复初始数据

## 目录结构

```
quiz-admin/
├── public/
│   ├── index.html
│   └── favicon.svg
├── src/
│   ├── App.vue                 # 整体布局：侧边栏 + 顶栏 + router-view
│   ├── main.js                 # 入口，注册 Element UI
│   ├── router/index.js         # 路由：/dashboard、/user、/question
│   ├── store/index.js          # Vue.observable 全局状态 + localStorage 持久化
│   ├── data/seed.js            # 初始演示数据（12 位用户 / 16 道题）
│   ├── components/StatCard.vue # 指标卡组件
│   ├── styles/index.css        # 全局样式与 Element 细节调整
│   └── views/
│       ├── dashboard/DashboardView.vue
│       └── element/
│           ├── UserView.vue    # 用户管理
│           └── QuestionView.vue# 题目管理
├── vue.config.js
└── vercel.json                 # 直接用打包好的 dist 做静态托管
```

## 本地运行

```bash
npm install
npm run serve     # http://localhost:8080
```

## 打包部署

```bash
npm run build     # 产物在 dist/
```

- **Vercel**：仓库根目录已提交 `dist/`，并用 `vercel.json` 指定静态托管，导入仓库后无需额外配置。
- **GitHub Pages**：`dist/` 内容推到 `gh-pages` 分支，或在仓库 Settings → Pages 里选择该分支根目录。
