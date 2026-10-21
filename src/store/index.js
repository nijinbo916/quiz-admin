import Vue from 'vue'
import { seedUsers, seedQuestions, seedLogs } from '@/data/seed'

const STORAGE_KEY = 'quiz-admin-data-v1'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function pad(num) {
  return num < 10 ? '0' + num : String(num)
}

function formatNow() {
  const d = new Date()
  return (
    d.getFullYear() +
    '-' +
    pad(d.getMonth() + 1) +
    '-' +
    pad(d.getDate()) +
    ' ' +
    pad(d.getHours()) +
    ':' +
    pad(d.getMinutes())
  )
}

function today() {
  return formatNow().slice(0, 10)
}

function nextId(list) {
  return list.reduce((max, item) => (item.id > max ? item.id : max), 0) + 1
}

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || !Array.isArray(data.users) || !Array.isArray(data.questions)) return null
    return data
  } catch (e) {
    return null
  }
}

const cached = readStorage()

export const state = Vue.observable({
  users: cached ? cached.users : clone(seedUsers),
  questions: cached ? cached.questions : clone(seedQuestions),
  logs: cached ? cached.logs || [] : clone(seedLogs),
  savedAt: cached ? cached.savedAt || '' : ''
})

function persist() {
  state.savedAt = formatNow()
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        users: state.users,
        questions: state.questions,
        logs: state.logs,
        savedAt: state.savedAt
      })
    )
  } catch (e) {
    // 隐私模式下 localStorage 可能不可写，此时只保留内存数据，不影响演示
  }
}

function addLog(action, detail) {
  state.logs.unshift({
    id: Date.now(),
    time: formatNow(),
    action,
    detail
  })
  if (state.logs.length > 30) {
    state.logs.splice(30)
  }
}

export const store = {
  addUser(payload) {
    const user = Object.assign({}, payload, { id: nextId(state.users), date: today() })
    state.users.unshift(user)
    addLog('新增用户', user.name)
    persist()
    return user
  },

  updateUser(id, payload) {
    const index = state.users.findIndex(item => item.id === id)
    if (index === -1) return
    state.users.splice(index, 1, Object.assign({}, state.users[index], payload))
    addLog('编辑用户', payload.name || state.users[index].name)
    persist()
  },

  removeUsers(ids) {
    const names = state.users.filter(item => ids.indexOf(item.id) !== -1).map(item => item.name)
    state.users = state.users.filter(item => ids.indexOf(item.id) === -1)
    addLog('删除用户', names.join('、') || ('共 ' + ids.length + ' 人'))
    persist()
  },

  addQuestion(payload) {
    const question = Object.assign({}, payload, { id: nextId(state.questions) })
    state.questions.unshift(question)
    addLog('新增题目', question.title)
    persist()
    return question
  },

  updateQuestion(id, payload) {
    const index = state.questions.findIndex(item => item.id === id)
    if (index === -1) return
    state.questions.splice(index, 1, Object.assign({}, state.questions[index], payload))
    addLog('编辑题目', payload.title || '')
    persist()
  },

  removeQuestions(ids) {
    const titles = state.questions.filter(item => ids.indexOf(item.id) !== -1).map(item => item.title)
    state.questions = state.questions.filter(item => ids.indexOf(item.id) === -1)
    addLog('删除题目', titles.length === 1 ? titles[0] : '共 ' + ids.length + ' 道')
    persist()
  },

  reset() {
    state.users = clone(seedUsers)
    state.questions = clone(seedQuestions)
    state.logs = clone(seedLogs)
    state.logs.unshift({ id: Date.now(), time: formatNow(), action: '重置数据', detail: '已恢复初始演示数据' })
    persist()
  }
}

export default store
