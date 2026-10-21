import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
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

router.afterEach(to => {
  document.title = to.meta && to.meta.title ? to.meta.title + ' · Quiz 后台管理' : 'Quiz 后台管理'
})

export default router
