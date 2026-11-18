<template>
  <div class="login-wrap">
    <div class="login-card">
      <div class="login-brand">
        <div class="login-logo">
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <path
              d="M32 13c-9.4 0-17 6.9-17 15.4 0 9 7.6 15.4 17 15.4 2.1 0 4.1-.3 5.9-.9l6.4 4.6c.8.6 2-.1 1.7-1.1l-1.7-6.1c3-2.7 4.7-6.6 4.7-11.9C49 19.9 41.4 13 32 13z"
              fill="#2f6bdd"
              opacity="0.92"
            />
            <path
              d="M23.5 26.5l5 8.5 11-12"
              fill="none"
              stroke="#2f6bdd"
              stroke-width="4.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h1 class="login-title">Quiz 后台管理</h1>
        <p class="login-sub">只有管理员账号可以登录，普通用户请使用答题端</p>
      </div>

      <el-form ref="loginForm" :model="form" :rules="rules" label-width="0" @submit.native.prevent>
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名"
            prefix-icon="el-icon-user"
            clearable
            @keyup.enter.native="submitForm"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            placeholder="密码"
            prefix-icon="el-icon-lock"
            show-password
            @keyup.enter.native="submitForm"
          />
        </el-form-item>
        <el-form-item>
          <el-button class="login-btn" type="primary" :loading="submitting" @click="submitForm">
            登 录
          </el-button>
        </el-form-item>
      </el-form>

      <p class="login-tip">
        预置管理员：admin / 123456
        <template v-if="demoMode">（当前为演示模式）</template>
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { setToken, clearAuth } from '@/utils/http'

export default {
  name: 'LoginView',
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      submitting: false,
      demoMode: false
    }
  },
  mounted() {
    // 已经登录过就直接进后台
    if (window.localStorage.getItem('quiz-admin-token')) {
      this.$router.push('/dashboard')
    }
  },
  methods: {
    submitForm() {
      this.$refs.loginForm.validate(valid => {
        if (!valid) return

        this.submitting = true
        // userrole 传 "1" 表示管理端登录入口：普通用户会被后端以 invalid account 拒绝
        axios
          .post('/login', {
            username: this.form.username.trim(),
            password: this.form.password,
            userrole: '1'
          })
          .then(response => {
            const result = response.data
            if (result.code === 1) {
              setToken(result.data, this.form.username.trim())
              this.$message.success('登录成功')
              this.$router.push('/dashboard')
              return
            }
            if (result.msg === 'invalid account') {
              this.$message.error('普通用户不能登录管理端，请使用答题端')
              return
            }
            this.$message.error(result.msg || '登录失败')
          })
          .catch(() => {
            // 后端连不上（比如 Vercel 上的静态版）：给一个演示入口，页面不至于完全没法看
            this.$confirm('未连接到 Java 后端，是否以演示模式进入？演示数据只保存在本地浏览器。', '后端未启动', {
              confirmButtonText: '进入演示模式',
              cancelButtonText: '取消',
              type: 'warning'
            })
              .then(() => {
                this.demoMode = true
                setToken('demo-token', '演示管理员')
                this.$router.push('/dashboard')
              })
              .catch(() => {})
          })
          .finally(() => {
            this.submitting = false
          })
      })
    }
  }
}
</script>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1f2d3d 0%, #2f6bdd 130%);
}

.login-card {
  width: 380px;
  padding: 36px 36px 24px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 18px 45px rgba(15, 30, 50, 0.35);
}

.login-brand {
  text-align: center;
  margin-bottom: 22px;
}

.login-logo {
  width: 56px;
  height: 56px;
  margin: 0 auto 12px;
  background: #eef3fe;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-logo svg {
  width: 40px;
  height: 40px;
}

.login-title {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.login-sub {
  margin: 8px 0 0;
  font-size: 12px;
  color: #909399;
}

.login-btn {
  width: 100%;
}

.login-tip {
  margin: 4px 0 0;
  text-align: center;
  font-size: 12px;
  color: #b0b6bf;
}
</style>
