<template>
  <el-container class="app">
    <!-- 左侧导航 -->
    <el-aside width="216px" class="app-aside">
      <div class="brand">
        <div class="brand-logo">
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <path
              d="M32 13c-9.4 0-17 6.9-17 15.4 0 9 7.6 15.4 17 15.4 2.1 0 4.1-.3 5.9-.9l6.4 4.6c.8.6 2-.1 1.7-1.1l-1.7-6.1c3-2.7 4.7-6.6 4.7-11.9C49 19.9 41.4 13 32 13z"
              fill="#ffffff"
              opacity="0.95"
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
        <div class="brand-text">
          <strong>Quiz Admin</strong>
          <span>题库后台管理</span>
        </div>
      </div>

      <el-menu
        class="app-menu"
        :default-active="activeMenu"
        router
        background-color="#1f2d3d"
        text-color="#b8c4d1"
        active-text-color="#ffffff"
      >
        <el-menu-item index="/dashboard">
          <i class="el-icon-s-data"></i>
          <span slot="title" class="menu-text">数据看板</span>
        </el-menu-item>
        <el-menu-item index="/user">
          <i class="el-icon-user-solid"></i>
          <span slot="title" class="menu-text">用户管理</span>
        </el-menu-item>
        <el-menu-item index="/question">
          <i class="el-icon-edit-outline"></i>
          <span slot="title" class="menu-text">题目管理</span>
        </el-menu-item>
      </el-menu>

      <div class="aside-user">
        <div class="avatar">倪</div>
        <div class="aside-user-text">
          <strong>倪金博</strong>
          <span>2412190727 · 计科2403</span>
        </div>
      </div>
    </el-aside>

    <!-- 右侧内容 -->
    <el-container class="app-right">
      <el-header height="64px" class="app-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>后台管理</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <span class="save-tip">
            <i class="el-icon-cloudy"></i>
            <template v-if="state.savedAt">已自动保存 {{ state.savedAt }}</template>
            <template v-else>数据保存在本地浏览器</template>
          </span>
          <el-button size="mini" icon="el-icon-refresh-left" @click="handleReset">重置演示数据</el-button>
        </div>
      </el-header>

      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { state, store } from '@/store'

export default {
  name: 'App',
  data() {
    return {
      state
    }
  },
  computed: {
    activeMenu() {
      return this.$route.path
    },
    currentTitle() {
      return (this.$route.meta && this.$route.meta.title) || '数据看板'
    }
  },
  methods: {
    handleReset() {
      this.$confirm('重置后所有用户与题目都会恢复成初始演示数据，本次的增删改将丢失，确定继续吗？', '重置演示数据', {
        confirmButtonText: '确定重置',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          store.reset()
          this.$message.success('已恢复初始演示数据')
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped>
.app {
  height: 100%;
}

/* ---------- 侧边栏 ---------- */
.app-aside {
  background: #1f2d3d;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.2s ease;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 64px;
  padding: 0 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.brand-logo {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: linear-gradient(135deg, #4d8dff, #2f6bdd);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(47, 107, 221, 0.35);
}

.brand-logo svg {
  width: 24px;
  height: 24px;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  color: #fff;
  overflow: hidden;
}

.brand-text strong {
  font-size: 15px;
  letter-spacing: 0.4px;
}

.brand-text span {
  font-size: 11px;
  color: #7f8fa1;
}

.app-menu {
  border-right: none;
  flex: 1;
  padding-top: 10px;
}

.app-menu .el-menu-item {
  height: 46px;
  line-height: 46px;
  margin: 4px 10px;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.app-menu .el-menu-item i {
  color: inherit;
  margin-right: 8px;
}

.app-menu .el-menu-item:hover {
  background: rgba(255, 255, 255, 0.06) !important;
}

.app-menu .el-menu-item.is-active {
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.24), rgba(64, 158, 255, 0.06)) !important;
  font-weight: 600;
}

.app-menu .el-menu-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: #409eff;
}

.aside-user {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(64, 158, 255, 0.18);
  color: #8ec5ff;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.aside-user-text {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
  overflow: hidden;
  white-space: nowrap;
}

.aside-user-text strong {
  color: #dfe7f0;
  font-size: 13px;
}

.aside-user-text span {
  color: #7f8fa1;
  font-size: 11px;
}

/* ---------- 顶部栏 ---------- */
.app-right {
  min-width: 0;
  height: 100%;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e9edf2;
  padding: 0 24px;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.save-tip {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 5px;
}

.save-tip i {
  color: #67c23a;
  font-size: 14px;
}

.app-main {
  background: #f0f2f5;
  padding: 0;
  overflow-y: auto;
}

@media (max-width: 900px) {
  .app-aside {
    width: 64px !important;
  }

  .brand {
    justify-content: center;
    padding: 0;
  }

  .brand-text,
  .menu-text,
  .aside-user-text {
    display: none;
  }

  .app-menu .el-menu-item {
    text-align: center;
    padding: 0 !important;
  }

  .app-menu .el-menu-item i {
    margin-right: 0;
    font-size: 18px;
  }

  .aside-user {
    justify-content: center;
    padding: 14px 0;
  }

  .save-tip {
    display: none;
  }

  .app-header {
    padding: 0 14px;
  }
}
</style>
