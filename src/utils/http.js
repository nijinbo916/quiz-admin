import axios from 'axios'

/**
 * 后端访问的公共工具：
 * - token / 用户名的本地存取（login 成功后写入，退出时清掉）
 * - 一个统一带 token 请求头的 axios 实例，所有联调页面共用
 *
 * 老师笔记 2.7 约定：请求头名叫 token，值就是登录接口返回的 JWT。
 */

const TOKEN_KEY = 'quiz-admin-token'
const NAME_KEY = 'quiz-admin-username'

export function getToken() {
  return window.localStorage.getItem(TOKEN_KEY) || ''
}

export function getUsername() {
  return window.localStorage.getItem(NAME_KEY) || ''
}

export function setToken(token, username) {
  window.localStorage.setItem(TOKEN_KEY, token)
  window.localStorage.setItem(NAME_KEY, username || '')
}

export function clearAuth() {
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(NAME_KEY)
}

/** 从 axios 错误里取出后端回传的 msg，取不到就用兜底文案 */
export function errorText(error, fallback) {
  if (error && error.response && error.response.data && error.response.data.msg) {
    return error.response.data.msg
  }
  return fallback
}

const http = axios.create()

// 请求拦截：除了登录页自己，所有请求都带上 token 头
http.interceptors.request.use(config => {
  const token = getToken()
  if (token && token !== 'demo-token') {
    config.headers.token = token
  }
  return config
})

// 响应拦截：后端说 token 无效 / 未登录时，踢回登录页
http.interceptors.response.use(
  response => {
    const result = response.data
    if (result && result.code === 0 && /token|未登录/.test(result.msg || '')) {
      clearAuth()
      window.location.hash = '#/login'
    }
    return response
  },
  error => Promise.reject(error)
)

export default http
