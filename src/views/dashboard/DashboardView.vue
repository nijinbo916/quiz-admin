<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h2 class="page-title">数据看板</h2>
        <p class="page-desc">用户与题库的整体情况一览，数据保存在浏览器本地，刷新不会丢失。</p>
      </div>
      <el-tag size="small" effect="plain" type="info">
        <i class="el-icon-time"></i>
        {{ state.savedAt ? '更新于 ' + state.savedAt : '尚未产生修改' }}
      </el-tag>
    </div>

    <!-- 指标卡 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="12" :md="6">
        <stat-card
          icon="el-icon-user-solid"
          label="用户总数"
          :value="userCount"
          unit=" 人"
          :sub="'其中管理员 ' + adminCount + ' 人'"
          color="#409eff"
          tint="rgba(64, 158, 255, 0.12)"
        />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <stat-card
          icon="el-icon-tickets"
          label="题库总量"
          :value="questionCount"
          unit=" 道"
          :sub="'覆盖 ' + categoryCount + ' 个知识分类'"
          color="#67c23a"
          tint="rgba(103, 194, 58, 0.12)"
        />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <stat-card
          icon="el-icon-connection"
          label="平均选项数"
          :value="avgOptions"
          unit=" 个"
          sub="每题选项数量均值"
          color="#e6a23c"
          tint="rgba(230, 162, 60, 0.12)"
        />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <stat-card
          icon="el-icon-document-checked"
          label="今日动态"
          :value="todayCount"
          unit=" 次"
          sub="今天的增删改操作次数"
          color="#f56c6c"
          tint="rgba(245, 108, 108, 0.12)"
        />
      </el-col>
    </el-row>

    <el-row :gutter="16" class="panel-row">
      <el-col :xs="24" :md="14">
        <div class="panel">
          <div class="panel-head">
            <span class="panel-title">题库分类分布</span>
            <el-button type="text" size="mini" @click="$router.push('/question')">管理题目</el-button>
          </div>
          <div class="bar-list">
            <div v-for="item in categoryStats" :key="item.name" class="bar-item">
              <span class="bar-name">{{ item.name }}</span>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: item.width, background: item.color }"></div>
              </div>
              <span class="bar-value">{{ item.count }} 道 · {{ item.percent }}%</span>
            </div>
          </div>
          <p v-if="!categoryStats.length" class="muted empty-tip">题库为空，去「题目管理」添加第一道题吧。</p>
        </div>
      </el-col>

      <el-col :xs="24" :md="10">
        <div class="panel">
          <div class="panel-head">
            <span class="panel-title">最近操作</span>
            <span class="muted">保留最近 30 条</span>
          </div>
          <el-timeline v-if="logs.length" class="log-list">
            <el-timeline-item
              v-for="item in logs.slice(0, 6)"
              :key="item.id"
              :timestamp="item.time"
              placement="top"
              size="normal"
              color="#409eff"
            >
              <div class="log-title">{{ item.action }}</div>
              <div class="log-detail">{{ item.detail }}</div>
            </el-timeline-item>
          </el-timeline>
          <p v-else class="muted empty-tip">还没有操作记录。</p>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :md="14">
        <div class="panel">
          <div class="panel-head">
            <span class="panel-title">最近添加的用户</span>
            <el-button type="text" size="mini" @click="$router.push('/user')">用户管理</el-button>
          </div>
          <el-table :data="recentUsers" size="small" :show-header="true">
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="name" label="用户名" />
            <el-table-column label="角色" width="100" align="center">
              <template slot-scope="scope">
                <el-tag size="mini" effect="plain" :type="scope.row.role === '管理员' ? 'warning' : 'info'">
                  {{ scope.row.role }}
                </el-tag>
              </template>
            </el-table-column>
            <template slot="empty">
              <el-empty description="暂无用户" :image-size="70" />
            </template>
          </el-table>
        </div>
      </el-col>

      <el-col :xs="24" :md="10">
        <div class="panel">
          <div class="panel-head">
            <span class="panel-title">用户角色构成</span>
          </div>
          <div class="role-wrap">
            <div class="donut" :style="{ background: donutBackground }">
              <div class="donut-hole">
                <strong>{{ userCount }}</strong>
                <span>总用户</span>
              </div>
            </div>
            <ul class="role-legend">
              <li v-for="item in roleStats" :key="item.name">
                <i :style="{ background: item.color }"></i>
                <span>{{ item.name }}</span>
                <em>{{ item.count }} 人</em>
              </li>
            </ul>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import StatCard from '@/components/StatCard.vue'
import { state } from '@/store'

const BAR_COLORS = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#9254de']

export default {
  name: 'DashboardView',
  components: { StatCard },
  data() {
    return {
      state
    }
  },
  computed: {
    users() {
      return state.users
    },
    questions() {
      return state.questions
    },
    userCount() {
      return this.users.length
    },
    questionCount() {
      return this.questions.length
    },
    adminCount() {
      return this.users.filter(item => item.role === '管理员').length
    },
    categoryCount() {
      return new Set(this.questions.map(item => item.category)).size
    },
    avgOptions() {
      if (!this.questions.length) return '0.0'
      const total = this.questions.reduce((sum, item) => sum + item.options.length, 0)
      return (total / this.questions.length).toFixed(1)
    },
    todayCount() {
      const today = new Date()
      const pad = num => (num < 10 ? '0' + num : String(num))
      const key = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate())
      return state.logs.filter(item => item.time.indexOf(key) === 0 && item.action !== '初始化').length
    },
    categoryStats() {
      const map = {}
      this.questions.forEach(item => {
        map[item.category] = (map[item.category] || 0) + 1
      })
      const max = Math.max.apply(null, Object.keys(map).map(key => map[key]).concat([1]))
      return Object.keys(map)
        .map((name, index) => ({
          name,
          count: map[name],
          percent: this.questionCount ? Math.round((map[name] / this.questionCount) * 100) : 0,
          width: Math.round((map[name] / max) * 100) + '%',
          color: BAR_COLORS[index % BAR_COLORS.length]
        }))
        .sort((a, b) => b.count - a.count)
    },
    roleStats() {
      const map = {}
      this.users.forEach(item => {
        map[item.role] = (map[item.role] || 0) + 1
      })
      const colors = { 管理员: '#e6a23c', 学生: '#409eff' }
      return Object.keys(map).map(name => ({
        name,
        count: map[name],
        color: colors[name] || '#909399'
      }))
    },
    donutBackground() {
      if (!this.userCount) return '#eef1f6'
      let start = 0
      const parts = this.roleStats.map(item => {
        const end = start + (item.count / this.userCount) * 100
        const segment = item.color + ' ' + start.toFixed(2) + '% ' + end.toFixed(2) + '%'
        start = end
        return segment
      })
      return 'conic-gradient(' + parts.join(', ') + ')'
    },
    recentUsers() {
      return this.users.slice(0, 5)
    },
    logs() {
      return state.logs
    }
  }
}
</script>

<style scoped>
.stat-row {
  margin-bottom: 16px;
}

.panel-row {
  margin-bottom: 16px;
}

.el-row .el-col {
  margin-bottom: 16px;
}

.bar-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 4px;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-name {
  width: 84px;
  font-size: 13px;
  color: #5a6472;
  text-align: right;
  flex-shrink: 0;
}

.bar-track {
  flex: 1;
  height: 9px;
  border-radius: 5px;
  background: #f0f2f5;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.6s ease;
}

.bar-value {
  width: 96px;
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
}

.log-list {
  padding: 4px 0 0 4px;
  max-height: 268px;
  overflow-y: auto;
  margin-bottom: 0;
}

.log-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.log-detail {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-tip {
  padding: 18px 0;
  text-align: center;
}

.role-wrap {
  display: flex;
  align-items: center;
  gap: 26px;
  padding: 6px 4px 10px;
}

.donut {
  width: 132px;
  height: 132px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.donut-hole {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1.2;
}

.donut-hole strong {
  font-size: 22px;
  color: #1f2d3d;
}

.donut-hole span {
  font-size: 12px;
  color: #909399;
}

.role-legend {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
}

.role-legend li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #5a6472;
  padding: 6px 0;
}

.role-legend i {
  width: 9px;
  height: 9px;
  border-radius: 3px;
}

.role-legend em {
  margin-left: auto;
  font-style: normal;
  color: #303133;
  font-weight: 600;
}
</style>
