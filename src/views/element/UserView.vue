<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h2 class="page-title">用户管理</h2>
        <p class="page-desc">维护参与答题的用户账号，支持关键词检索、新增、编辑、删除与分页浏览。</p>
      </div>
      <div class="head-tags">
        <el-tag type="info" effect="plain" size="small">共 {{ users.length }} 位用户</el-tag>
        <el-tag type="success" effect="plain" size="small">数据自动保存</el-tag>
      </div>
    </div>

    <div class="panel">
      <!-- 顶部查询表单 -->
      <el-form :inline="true" :model="query" class="query-form" @submit.native.prevent>
        <el-form-item label="用户名">
          <el-input
            v-model="query.keyword"
            placeholder="输入用户名关键词"
            clearable
            prefix-icon="el-icon-search"
            style="width: 220px"
            @keyup.enter.native="handleQuery"
            @clear="handleQuery"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="query.role" placeholder="全部角色" clearable style="width: 130px">
            <el-option label="管理员" value="管理员" />
            <el-option label="学生" value="学生" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="toolbar">
        <div class="toolbar-group">
          <el-button type="primary" icon="el-icon-plus" @click="openAdd">添加用户</el-button>
          <el-button
            type="danger"
            plain
            icon="el-icon-delete"
            :disabled="selection.length === 0"
            @click="handleBatchDelete"
          >
            批量删除{{ selection.length ? '（' + selection.length + '）' : '' }}
          </el-button>
        </div>
        <div class="toolbar-group">
          <el-button icon="el-icon-download" @click="handleExport">导出数据</el-button>
          <span class="muted">当前筛选出 {{ filteredList.length }} 条</span>
        </div>
      </div>

      <!-- 用户表格 -->
      <el-table
        ref="userTable"
        :data="pagedList"
        border
        stripe
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="46" align="center" />
        <el-table-column label="日期" width="130">
          <template slot-scope="scope">
            <span class="cell-muted">{{ scope.row.date }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户名" min-width="140">
          <template slot-scope="scope">
            <span class="cell-name">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="密码" min-width="170">
          <template slot-scope="scope">
            <div class="pwd-cell">
              <span class="pwd-text">{{ isVisible(scope.row.id) ? scope.row.password : '••••••' }}</span>
              <el-button
                type="text"
                size="mini"
                icon="el-icon-view"
                :class="{ 'is-active': isVisible(scope.row.id) }"
                @click="togglePassword(scope.row.id)"
              >
                {{ isVisible(scope.row.id) ? '隐藏' : '显示' }}
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="角色" width="110" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.role === '管理员' ? 'warning' : 'info'" size="small" effect="plain">
              {{ scope.row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" icon="el-icon-edit" @click="openEdit(scope.row)">编辑</el-button>
            <el-button type="text" size="mini" icon="el-icon-delete" class="danger-text" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>

        <template slot="empty">
          <el-empty description="没有符合条件的用户" :image-size="90" />
        </template>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        class="pager"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filteredList.length"
      />
    </div>

    <!-- 添加 / 编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="460px"
      :close-on-click-modal="false"
      @closed="handleDialogClosed"
    >
      <el-form ref="userForm" :model="form" :rules="rules" label-width="78px" @submit.native.prevent>
        <el-form-item label="用户名" prop="name">
          <el-input v-model="form.name" placeholder="2 - 12 个字符" maxlength="12" show-word-limit />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" placeholder="6 - 12 位" maxlength="12" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-radio-group v-model="form.role">
            <el-radio label="学生">学生</el-radio>
            <el-radio label="管理员">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-alert
          type="info"
          :closable="false"
          show-icon
          title="本系统为纯前端演示，账号密码仅保存在当前浏览器 localStorage 中。"
        />
      </el-form>

      <span slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { state, store } from '@/store'

function emptyForm() {
  return {
    id: null,
    name: '',
    password: '',
    role: '学生'
  }
}

export default {
  name: 'UserView',
  data() {
    const validateName = (rule, value, callback) => {
      const name = (value || '').trim()
      if (!name) {
        callback(new Error('请输入用户名'))
        return
      }
      if (name.length < 2 || name.length > 12) {
        callback(new Error('用户名长度需在 2 - 12 个字符之间'))
        return
      }
      const exists = state.users.some(item => item.name === name && item.id !== this.form.id)
      if (exists) {
        callback(new Error('该用户名已存在'))
        return
      }
      callback()
    }

    return {
      state,
      query: {
        keyword: '',
        role: ''
      },
      page: 1,
      size: 5,
      selection: [],
      visibleIds: [],
      dialogVisible: false,
      dialogTitle: '添加用户',
      submitting: false,
      form: emptyForm(),
      rules: {
        name: [{ required: true, validator: validateName, trigger: 'blur' }],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 12, message: '密码长度需在 6 - 12 位之间', trigger: 'blur' }
        ],
        role: [{ required: true, message: '请选择角色', trigger: 'change' }]
      }
    }
  },
  computed: {
    users() {
      return state.users
    },
    filteredList() {
      const keyword = this.query.keyword.trim().toLowerCase()
      const role = this.query.role

      return this.users.filter(item => {
        const matchKeyword = !keyword || item.name.toLowerCase().indexOf(keyword) !== -1
        const matchRole = !role || item.role === role
        return matchKeyword && matchRole
      })
    },
    pagedList() {
      const start = (this.page - 1) * this.size
      return this.filteredList.slice(start, start + this.size)
    }
  },
  watch: {
    filteredList() {
      const maxPage = Math.max(1, Math.ceil(this.filteredList.length / this.size))
      if (this.page > maxPage) {
        this.page = maxPage
      }
    }
  },
  methods: {
    isVisible(id) {
      return this.visibleIds.indexOf(id) !== -1
    },
    togglePassword(id) {
      const index = this.visibleIds.indexOf(id)
      if (index === -1) {
        this.visibleIds.push(id)
      } else {
        this.visibleIds.splice(index, 1)
      }
    },
    handleQuery() {
      this.page = 1
    },
    handleReset() {
      this.query.keyword = ''
      this.query.role = ''
      this.page = 1
    },
    handleSizeChange(val) {
      this.size = val
      this.page = 1
    },
    handleCurrentChange(val) {
      this.page = val
    },
    handleSelectionChange(rows) {
      this.selection = rows
    },
    openAdd() {
      this.dialogTitle = '添加用户'
      this.form = emptyForm()
      this.dialogVisible = true
    },
    openEdit(row) {
      this.dialogTitle = '编辑用户'
      this.form = Object.assign({}, row)
      this.dialogVisible = true
    },
    handleDialogClosed() {
      if (this.$refs.userForm) {
        this.$refs.userForm.resetFields()
      }
    },
    submitForm() {
      this.$refs.userForm.validate(valid => {
        if (!valid) return

        this.submitting = true
        const payload = {
          name: this.form.name.trim(),
          password: this.form.password,
          role: this.form.role
        }

        // 模拟请求耗时，让按钮的 loading 态可见
        window.setTimeout(() => {
          if (this.form.id) {
            store.updateUser(this.form.id, payload)
            this.$message.success('修改成功')
          } else {
            store.addUser(payload)
            this.$message.success('添加成功')
          }
          this.submitting = false
          this.dialogVisible = false
        }, 260)
      })
    },
    handleDelete(row) {
      this.$confirm('确定要删除用户「' + row.name + '」吗？删除后不可恢复。', '删除确认', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          store.removeUsers([row.id])
          this.$message.success('删除成功')
        })
        .catch(() => {})
    },
    handleBatchDelete() {
      if (!this.selection.length) return
      this.$confirm('确定要删除选中的 ' + this.selection.length + ' 位用户吗？', '批量删除', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          store.removeUsers(this.selection.map(item => item.id))
          this.selection = []
          this.$message.success('批量删除成功')
        })
        .catch(() => {})
    },
    handleExport() {
      const data = {
        exportAt: new Date().toISOString(),
        users: state.users,
        questions: state.questions
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'quiz-admin-data.json'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      this.$message.success('数据已导出为 quiz-admin-data.json')
    }
  }
}
</script>

<style scoped>
.head-tags {
  display: flex;
  gap: 8px;
}

.query-form {
  padding: 2px 0 4px;
  border-bottom: 1px dashed #ebeef5;
  margin-bottom: 16px;
}

.cell-muted {
  color: #909399;
  font-variant-numeric: tabular-nums;
}

.cell-name {
  font-weight: 600;
  color: #303133;
}

.pwd-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pwd-text {
  letter-spacing: 1px;
  color: #5a6472;
  font-family: Consolas, Monaco, monospace;
}

.danger-text {
  color: #f56c6c;
}

.danger-text:hover,
.danger-text:focus {
  color: #f78989;
}
</style>
