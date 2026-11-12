# Quiz 后台管理（Vue 2 + Element UI）

Web 开发技术课程第五次作业：使用 **Vue 2 + Element UI** 搭建一个题库后台管理系统，
包含数据看板、用户管理、题目管理三个页面，把 quiz-game 的用户与题目搬到后台里维护。

第八次课（11-6）完成**题目页与 Java 后端的前后端联调**：题目的分页、关键词查询、增删改
全部改为调用 `quiz-java` 后端的真实接口（axios），数据看板的题库统计也改为读后端数据。

## 在线预览

| 地址 | 说明 |
| --- | --- |
| Vercel（提交用） | https://quiz-admin-kohl.vercel.app/ |
| GitHub Pages（备用） | https://nijinbo916.github.io/quiz-admin/ |

> 国内访问 `*.vercel.app` 可能被 DNS 污染，打不开时请使用上面的 GitHub Pages 备用地址。
> 线上静态版没有 Java 后端，题目页会自动回退到演示数据并提示；本地启动后端后即是完整的联调版本。

## 技术栈

- Vue 2.7.16 + vue-router 3.6.5（hash 模式，静态托管无需服务端重写）
- Element UI 2.15.14（表格、表单、对话框、分页、菜单、时间线等组件）
- axios：题目管理、数据看板调用 Java 后端接口（`/questions`、`/findQuestion`、`/addQuestion`、`/updateQuestion`、`/delQuestion`）
- Vue CLI 5（webpack 5）打包，`publicPath: './'`，产物可放任意子目录
- 用户数据：`Vue.observable` 轻量全局 store + `localStorage` 持久化

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

**题目管理 `/question`（前后端联调版）**

- 题目列表、分页走后端 `GET /questions?page=&pageSize=`，共 N 条、第 N 页由后端 total 驱动
- 关键词查询走 `GET /findQuestion?keyword=`，同样支持分页
- 新增 / 编辑弹窗提交 JSON 到 `POST /addQuestion`、`POST /updateQuestion?id=`，选项固定 4 个（与后端 questions 表结构对应），答案用 a/b/c/d 表示
- 删除走 `GET /delQuestion?id=`（后端逻辑删除），批量删除逐条调用并汇总结果
- 题目预览（学生视角查看题干与选项，正确答案高亮）
- 后端未启动时自动回退演示数据，并提示进入演示模式

**数据看板 `/dashboard`**

- 题库总量 / 分类数 / 平均选项数改为统计后端题库；后端没开时回退示例数据

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

题目页需要 Java 后端（仓库 `nijinbo916/quiz-java`）：

```bash
# 1. 先启动后端（默认 8080）：启动 MySQL 后在 quiz-java 目录执行
mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8080

# 2. 再启动前端
npm install
npm run serve     # http://localhost:8081
```

- 前端开发服务器端口是 **8081**（8080 留给 Java 后端）
- `vue.config.js` 里已配代理：页面里写 `/questions` 这样的相对路径，开发时自动转发到 `http://localhost:8080`，不用处理跨域
- 后端没启动时页面也能打开，题目页会进入演示模式

## 打包部署

```bash
npm run build     # 产物在 dist/
```

- **Vercel**：仓库根目录已提交 `dist/`，并用 `vercel.json` 指定静态托管，导入仓库后无需额外配置。
- **GitHub Pages**：`dist/` 内容推到 `gh-pages` 分支，或在仓库 Settings → Pages 里选择该分支根目录。
