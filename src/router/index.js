import Vue from 'vue'
import VueRouter from 'vue-router'
import { getToken } from '@/utils/http'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/element/LoginView.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { title: '数据看板' }
  },
  {
    path: '/user',
    name: 'user',
    component: () => import('@/views/element/UserView.vue'),
    meta: { title: '用户管理' }
  },
  {
    path: '/question',
    name: 'question',
    component: () => import('@/views/element/QuestionView.vue'),
    meta: { title: '题目管理' }
  },
  {
    path: '*',
    redirect: '/dashboard'
  }
]

const router = new VueRouter({
  routes
})

/**
 * 导航守卫（对应视频 10-6：实现导航守卫、退出功能）。
 * 除了登录页，其它页面都必须先登录拿到 token 才能进。
 */
router.beforeEach((to, from, next) => {
  const loggedIn = !!getToken()
  if (to.path === '/login') {
    next()
  } else if (!loggedIn) {
    next('/login')
  } else {
    next()
  }
})

router.afterEach(to => {
  document.title = to.meta && to.meta.title ? to.meta.title + ' · Quiz 后台管理' : 'Quiz 后台管理'
})

export default router
