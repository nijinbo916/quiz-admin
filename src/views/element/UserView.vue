<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h2 class="page-title">用户管理</h2>
        <p class="page-desc">
          用户数据来自 Java 后端 <code>/users</code> 接口：分页、关键词查询、添加（可选角色）、删除、重置密码都是真实接口。
        </p>
      </div>
      <div class="head-tags">
        <el-tag type="info" effect="plain" size="small">共 {{ total }} 位用户</el-tag>
        <el-tag type="success" effect="plain" size="small">第 {{ currentPage }} / {{ maxPage }} 页</el-tag>
      </div>
    </div>

    <div class="panel">
      <!-- 顶部查询表单 -->
      <el-form :inline="true" class="query-form" @submit.native.prevent>
        <el-form-item label="用户名">
          <el-input
            v-model="keyword"
            placeholder="输入用户名关键词"
            clearable
            prefix-icon="el-icon-search"
            style="width: 240px"
            @keyup.enter.native="onSearch"
            @clear="handleReset"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="onSearch">查询</el-button>
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
        <span class="muted">
          {{ keyword ? '关键词「' + keyword + '」命中 ' + total + ' 条' : '当前共 ' + total + ' 位用户' }}
        </span>
      </div>

      <!-- 用户表格 -->
      <el-table
        ref="userTable"
        v-loading="loading"
        :data="tableData"
        border
        stripe
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="46" align="center" />
        <el-table-column label="ID" prop="id" width="70" align="center" />
        <el-table-column label="用户名" min-width="140">
          <template slot-scope="scope">
            <span class="cell-name">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="密码" min-width="140">
          <template slot-scope="scope">
            <span class="pwd-text">{{ scope.row.password }}</span>
          </template>
        </el-table-column>
        <el-table-column label="角色" width="110" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isAdmin ? 'warning' : 'info'" size="small" effect="plain">
              {{ scope.row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建日期" width="130" align="center">
          <template slot-scope="scope">
            <span class="cell-muted">{{ scope.row.date }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170" align="center">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="mini"
              icon="el-icon-key"
              @click="handleResetPwd(scope.row)"
            >
              重置密码
            </el-button>
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
        :current-page="currentPage"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </div>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="dialogVisible"
      width="460px"
      :close-on-click-modal="false"
      @closed="handleDialogClosed"
    >
      <el-form ref="userForm" :model="form" :rules="rules" label-width="86px" @submit.native.prevent>
        <el-form-item label="用户名" prop="name">
          <el-input v-model="form.name" placeholder="字母或数字，2 - 16 个字符" maxlength="16" show-word-limit />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" placeholder="6 - 16 位" maxlength="16" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="checkpassword">
          <el-input v-model="form.checkpassword" placeholder="再输入一遍密码" maxlength="16" show-password />
        </el-form-item>
        <!-- 验收条件 3.2 第 1 条：增加用户时要选择普通用户还是管理员 -->
        <el-form-item label="用户角色" prop="userrole">
          <el-radio-group v-model="form.userrole">
            <el-radio label="0">普通用户</el-radio>
            <el-radio label="1">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import http, { errorText } from '@/utils/http'
import { state, store } from '@/store'

/** 把后端的 User 记录转成表格要展示的行 */
function toRow(user) {
  return {
    id: user.id,
    name: user.userName,
    // 后端查询接口统一把密码打码成 ******
    password: user.userPassword || '******',
    isAdmin: user.userRole === 1,
    role: user.userRole === 1 ? '管理员' : '普通用户',
    date: user.createTime ? String(user.createTime).slice(0, 10) : '-'
  }
}

function emptyForm() {
  return {
    name: '',
    password: '',
    checkpassword: '',
    userrole: '0'
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
      if (!/^[a-zA-Z0-9]+$/.test(name)) {
        callback(new Error('用户名只能是字母和数字（后端校验规则）'))
        return
      }
      callback()
    }
    const validateCheck = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请再输入一遍密码'))
        return
      }
      if (value !== this.form.password) {
        callback(new Error('两次输入的密码不一致'))
        return
      }
      callback()
    }

    return {
      keyword: '',
      tableData: [],
      total: 0,
      currentPage: 1,
      pageSize: 5,
      loading: false,
      // 后端连不上时置为 true，表格回退到 store 里的演示数据
      demoMode: false,
      selection: [],
      dialogVisible: false,
      submitting: false,
      form: emptyForm(),
      rules: {
        name: [{ required: true, validator: validateName, trigger: 'blur' }],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '密码长度需在 6 - 16 位之间', trigger: 'blur' }
        ],
        checkpassword: [{ required: true, validator: validateCheck, trigger: 'blur' }],
        userrole: [{ required: true, message: '请选择用户角色', trigger: 'change' }]
      }
    }
  },
  computed: {
    maxPage() {
      return Math.max(1, Math.ceil(this.total / this.pageSize))
    }
  },
  mounted() {
    this.loadPage(1)
  },
  methods: {
    /** 调后端分页接口，加载指定页 */
    loadPage(page) {
      this.loading = true
      http
        .get('/users', { params: { page, pageSize: this.pageSize } })
        .then(response => {
          const result = response.data
          if (result.code !== 1) {
            throw new Error(result.msg || '加载失败')
          }
          this.demoMode = false
          this.tableData = result.data.rows.map(toRow)
          this.total = result.data.total
          this.currentPage = page
        })
        .catch(() => {
          this.useFallback(page)
        })
        .finally(() => {
          this.loading = false
        })
    },

    /** 演示兜底：线上静态版没有 Java 后端，用 store 里的演示用户照常浏览 */
    useFallback(page) {
      if (!this.demoMode) {
        this.demoMode = true
        this.$message.info('未连接到 Java 后端，当前展示演示数据；本地启动 quiz-java 后即可联调')
      }

      const kw = this.keyword.trim().toLowerCase()
      const rows = state.users
        .filter(item => !kw || item.name.toLowerCase().indexOf(kw) !== -1)
        .map(item => ({
          id: item.id,
          name: item.name,
          password: '******',
          isAdmin: item.role === '管理员',
          role: item.role === '管理员' ? '管理员' : '普通用户',
          date: item.date || '-'
        }))

      this.total = rows.length
      const start = (page - 1) * this.pageSize
      this.tableData = rows.slice(start, start + this.pageSize)
      this.currentPage = page
    },

    /** 关键词查询：走 /findUser（后端返回全量命中列表） */
    onSearch() {
      const kw = this.keyword.trim()
      if (!kw) {
        this.loadPage(1)
        return
      }

      this.loading = true
      http
        .get('/findUser', { params: { keyword: kw } })
        .then(response => {
          const result = response.data
          if (result.code !== 1) {
            throw new Error(result.msg || '查询失败')
          }
          this.demoMode = false
          this.tableData = result.data.map(toRow)
          this.total = result.data.length
          this.currentPage = 1
        })
        .catch(() => {
          this.useFallback(1)
        })
        .finally(() => {
          this.loading = false
        })
    },

    handleReset() {
      this.keyword = ''
      this.loadPage(1)
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.loadPage(1)
    },
    handleCurrentChange(val) {
      this.loadPage(val)
    },
    handleSelectionChange(rows) {
      this.selection = rows
    },
    openAdd() {
      this.form = emptyForm()
      this.dialogVisible = true
    },
    handleDialogClosed() {
      if (this.$refs.userForm) {
        this.$refs.userForm.resetFields()
      }
    },

    /** 添加用户：管理端走 /addUser，角色由表单传入（用户端注册走 /register，固定普通用户） */
    submitForm() {
      this.$refs.userForm.validate(valid => {
        if (!valid) return

        this.submitting = true
        http
          .post('/addUser', {
            username: this.form.name.trim(),
            password: this.form.password,
            checkpassword: this.form.checkpassword,
            userrole: this.form.userrole
          })
          .then(response => {
            const result = response.data
            if (result.code !== 1) {
              this.$message.error(result.msg || '添加失败')
              return
            }
            this.$message.success(this.form.userrole === '1' ? '已添加管理员' : '已添加普通用户')
            this.dialogVisible = false
            this.loadPage(1)
          })
          .catch(error => {
            this.$message.error(errorText(error, '添加失败，请确认后端已启动'))
          })
          .finally(() => {
            this.submitting = false
          })
      })
    },

    /** 重置密码（验收条件 3.2 第 4 条）：重置为初始密码 123456 */
    handleResetPwd(row) {
      this.$confirm(
        '确定要把「' + row.name + '」的密码重置为初始密码 123456 吗？',
        '重置密码',
        {
          confirmButtonText: '确定重置',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          return http.get('/resetPassword', { params: { id: row.id } })
        })
        .then(response => {
          if (!response) return
          const result = response.data
          if (result.code !== 1) {
            this.$message.error(result.msg || '重置失败')
            return
          }
          this.$message.success(result.msg || '密码已重置为 123456')
        })
        .catch(error => {
          if (error && error.response) {
            this.$message.error(errorText(error, '重置失败'))
          }
        })
    },

    handleDelete(row) {
      this.$confirm('确定要删除用户「' + row.name + '」吗？删除后该用户无法登录。', '删除确认', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          if (this.demoMode) {
            store.removeUsers([row.id])
            this.$message.success('删除成功（演示数据）')
            this.useFallback(this.currentPage)
            return
          }
          return http.get('/deleteById', { params: { id: row.id } }).then(response => {
            const result = response.data
            if (result.code !== 1) {
              this.$message.error(result.msg || '删除失败')
              return
            }
            this.$message.success('删除成功')
            this.loadPage(this.currentPage)
          })
        })
        .catch(error => {
          if (error && error.response) {
            this.$message.error(errorText(error, '删除失败'))
          }
        })
    },

    handleBatchDelete() {
      if (!this.selection.length) return
      this.$confirm('确定要删除选中的 ' + this.selection.length + ' 位用户吗？', '批量删除', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          if (this.demoMode) {
            store.removeUsers(this.selection.map(item => item.id))
            this.selection = []
            this.$message.success('批量删除成功（演示数据）')
            this.useFallback(this.currentPage)
            return
          }
          const ids = this.selection.map(item => item.id)
          // 后端只有按 id 单条删除的接口，这里逐条调用
          return Promise.all(ids.map(id => http.get('/deleteById', { params: { id } })))
        })
        .then(responses => {
          if (!responses) return
          this.selection = []
          this.$message.success('批量删除成功')
          this.loadPage(this.currentPage)
        })
        .catch(error => {
          if (error && error.response) {
            this.$message.error(errorText(error, '批量删除失败'))
          }
        })
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
