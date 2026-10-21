/**
 * 初始演示数据
 * 说明：本项目是纯前端作业，没有后端接口，所有数据都存在浏览器 localStorage 里，
 * 第一次打开时用下面的数据做初始化，之后用户的增删改都会自动保存。
 */

export const seedUsers = [
  { id: 1, date: '2026-09-08', name: '吴小诚', password: '123456', role: '管理员' },
  { id: 2, date: '2026-09-08', name: '王小虎', password: '123456', role: '学生' },
  { id: 3, date: '2026-09-15', name: '李小明', password: '888888', role: '学生' },
  { id: 4, date: '2026-09-15', name: '赵小刚', password: '666666', role: '学生' },
  { id: 5, date: '2026-09-22', name: '孙小丽', password: '000000', role: '学生' },
  { id: 6, date: '2026-09-22', name: '周小强', password: '111111', role: '学生' },
  { id: 7, date: '2026-09-29', name: '郑小雨', password: '123123', role: '学生' },
  { id: 8, date: '2026-10-06', name: '冯小南', password: 'ab123456', role: '学生' },
  { id: 9, date: '2026-10-06', name: '陈小北', password: 'qwerty', role: '学生' },
  { id: 10, date: '2026-10-13', name: '褚小东', password: '246810', role: '学生' },
  { id: 11, date: '2026-10-13', name: '卫小西', password: '135791', role: '学生' },
  { id: 12, date: '2026-10-16', name: '蒋小川', password: 'admin888', role: '管理员' }
]

export const seedQuestions = [
  {
    id: 1,
    title: '在 HTML 中，用来表示页面标题栏文字的是哪个标签？',
    category: 'HTML',
    options: ['<body>', '<title>', '<head>', '<h1>'],
    answer: 1
  },
  {
    id: 2,
    title: '下列哪个标签可以在网页中插入一张图片？',
    category: 'HTML',
    options: ['<picture>', '<image>', '<img>', '<src>'],
    answer: 2
  },
  {
    id: 3,
    title: '表单提交时，用来指定提交地址的属性是？',
    category: 'HTML',
    options: ['method', 'action', 'target', 'enctype'],
    answer: 1
  },
  {
    id: 4,
    title: 'CSS 中设置文字颜色的属性是？',
    category: 'CSS',
    options: ['font-color', 'text-color', 'color', 'foreground'],
    answer: 2
  },
  {
    id: 5,
    title: '下列哪个 CSS 选择器的优先级最高？',
    category: 'CSS',
    options: ['类选择器 .box', '标签选择器 div', 'ID 选择器 #box', '通配符 *'],
    answer: 2
  },
  {
    id: 6,
    title: '想让一个块级元素在父容器里水平居中，最常用的写法是？',
    category: 'CSS',
    options: ['text-align: center', 'margin: 0 auto', 'padding: auto', 'vertical-align: middle'],
    answer: 1
  },
  {
    id: 7,
    title: '在 JavaScript 中，声明一个不能被重新赋值的变量应使用？',
    category: 'JavaScript',
    options: ['var', 'let', 'const', 'static'],
    answer: 2
  },
  {
    id: 8,
    title: '下列哪个方法可以把 JSON 字符串转成对象？',
    category: 'JavaScript',
    options: ['JSON.stringify()', 'JSON.parse()', 'JSON.toObject()', 'Object.assign()'],
    answer: 1
  },
  {
    id: 9,
    title: '给页面上的按钮绑定点击事件，正确的事件名是？',
    category: 'JavaScript',
    options: ['click', 'onclick', 'mouseover', 'submit'],
    answer: 0
  },
  {
    id: 10,
    title: '数组方法中，会给原数组追加元素并返回新长度的是？',
    category: 'JavaScript',
    options: ['push()', 'pop()', 'slice()', 'concat()'],
    answer: 0
  },
  {
    id: 11,
    title: 'Vue 实例中用来存放响应式数据的是哪个选项？',
    category: 'Vue',
    options: ['data', 'methods', 'computed', 'props'],
    answer: 0
  },
  {
    id: 12,
    title: 'Vue 中实现双向绑定的指令是？',
    category: 'Vue',
    options: ['v-bind', 'v-on', 'v-model', 'v-if'],
    answer: 2
  },
  {
    id: 13,
    title: 'v-for 循环渲染列表时，推荐给元素加上哪个属性以提升性能？',
    category: 'Vue',
    options: ['ref', 'key', 'id', 'index'],
    answer: 1
  },
  {
    id: 14,
    title: 'HTTP 状态码 404 表示的含义是？',
    category: '网络',
    options: ['服务器内部错误', '请求成功', '资源未找到', '没有权限'],
    answer: 2
  },
  {
    id: 15,
    title: '把本地代码推送到 GitHub 远程仓库用的是哪个命令？',
    category: '网络',
    options: ['git pull', 'git clone', 'git push', 'git fetch'],
    answer: 2
  },
  {
    id: 16,
    title: 'Vue Router 中，用来显示当前路由对应组件的标签是？',
    category: 'Vue',
    options: ['<router-link>', '<router-view>', '<component>', '<slot>'],
    answer: 1
  }
]

export const seedLogs = [
  { id: 1, time: '2026-10-16 09:12', action: '初始化', detail: '导入演示用户 12 条、题目 16 道' }
]
