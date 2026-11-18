<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h2 class="page-title">题目管理</h2>
        <p class="page-desc">题库数据来自 Java 后端 <code>/questions</code> 接口，分页、关键词查询、增删改都走真实接口。</p>
      </div>
      <div class="head-tags">
        <el-tag type="info" effect="plain" size="small">共 {{ total }} 道题</el-tag>
        <el-tag type="success" effect="plain" size="small">第 {{ currentPage }} / {{ maxPage }} 页</el-tag>
      </div>
    </div>

    <div class="panel">
      <el-form :inline="true" class="query-form" @submit.native.prevent>
        <el-form-item label="题目">
          <el-input
            v-model="keyword"
            placeholder="输入题干关键词"
            clearable
            prefix-icon="el-icon-search"
            style="width: 260px"
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
          <el-button type="primary" icon="el-icon-plus" @click="openAdd">添加题目</el-button>
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
          {{ keyword ? '关键词「' + keyword + '」命中 ' + total + ' 条' : '当前共 ' + total + ' 道题' }}
        </span>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="46" align="center" />
        <el-table-column label="序号" width="70" align="center">
          <template slot-scope="scope">{{ (currentPage - 1) * pageSize + scope.$index + 1 }}</template>
        </el-table-column>
        <el-table-column label="题干" min-width="260">
          <template slot-scope="scope">
            <span class="stem">{{ scope.row.questionText }}</span>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="105" align="center">
          <template slot-scope="scope">
            <el-tag size="small" effect="plain">{{ scope.row.category || '未分类' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="选项" min-width="250">
          <template slot-scope="scope">
            <div class="option-line" v-for="(option, index) in scope.row.options" :key="index">
              <span class="option-label">{{ labels[index] }}</span>
              <span :class="{ 'option-right': index === answerIndexOf(scope.row) }">{{ option }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="答案" width="80" align="center">
          <template slot-scope="scope">
            <el-tag type="success" size="small">{{ scope.row.answerLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" icon="el-icon-view" @click="openPreview(scope.row)">预览</el-button>
            <el-button type="text" size="mini" icon="el-icon-edit" @click="openEdit(scope.row)">编辑</el-button>
            <el-button
              type="text"
              size="mini"
              icon="el-icon-delete"
              class="danger-text"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>

        <template slot="empty">
          <el-empty description="没有符合条件的题目" :image-size="90" />
        </template>
      </el-table>

      <el-pagination
        class="pager"
        background
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        :current-page="currentPage"
        :page-sizes="[5, 10, 20]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </div>

    <!-- 添加 / 编辑题目 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
      @closed="handleDialogClosed"
    >
      <el-form ref="questionForm" :model="form" :rules="rules" label-width="82px">
        <el-form-item label="题干" prop="question">
          <el-input
            v-model="form.question"
            type="textarea"
            :rows="2"
            maxlength="120"
            show-word-limit
            placeholder="请输入题目内容"
          />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 180px">
            <el-option v-for="item in categories" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item
          v-for="(option, index) in form.options"
          :key="index"
          :label="'选项 ' + labels[index]"
          :prop="'options.' + index"
          :rules="{ required: true, message: '选项内容不能为空', trigger: 'blur' }"
        >
          <el-input v-model="form.options[index]" maxlength="60" placeholder="选项内容" />
        </el-form-item>

        <el-form-item label="正确答案" prop="answerIndex">
          <el-radio-group v-model="form.answerIndex">
            <el-radio v-for="(option, index) in form.options" :key="index" :label="index">
              {{ labels[index] }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 预览 -->
    <el-dialog title="题目预览" :visible.sync="previewVisible" width="520px">
      <div v-if="previewRow" class="preview">
        <div class="preview-meta">
          <el-tag size="small" effect="plain">{{ previewRow.category || '未分类' }}</el-tag>
          <span class="muted">正确答案：{{ previewRow.answerLabel }} · {{ previewRow.answer }}</span>
        </div>
        <h3 class="preview-title">{{ previewRow.questionText }}</h3>
        <ul class="preview-options">
          <li
            v-for="(option, index) in previewRow.options"
            :key="index"
            :class="{ right: index === answerIndexOf(previewRow) }"
          >
            <span class="option-label">{{ labels[index] }}</span>
            {{ option }}
            <i v-if="index === answerIndexOf(previewRow)" class="el-icon-check"></i>
          </li>
        </ul>
      </div>
      <span slot="footer">
        <el-button type="primary" @click="previewVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import http from '@/utils/http'
import { state } from '@/store'

const LABELS = ['A', 'B', 'C', 'D']
const ANSWER_KEYS = ['a', 'b', 'c', 'd']
const CATEGORIES = ['HTML', 'CSS', 'JavaScript', 'Vue', '网络']

function emptyForm() {
  return {
    id: null,
    question: '',
    category: 'HTML',
    options: ['', '', '', ''],
    answerIndex: 0
  }
}

/** 后端返回的答案字母 A/B/C/D → 选项下标 0~3 */
function labelToIndex(label) {
  const index = LABELS.indexOf((label || '').toUpperCase())
  return index < 0 ? 0 : index
}

export default {
  name: 'QuestionView',
  data() {
    return {
      labels: LABELS,
      categories: CATEGORIES,
      keyword: '',
      tableData: [],
      total: 0,
      currentPage: 1,
      pageSize: 5,
      loading: false,
      // 后端连不上时置为 true，表格回退到 store 里的演示数据，线上静态预览不至于开天窗
      demoMode: false,
      selection: [],
      dialogVisible: false,
      dialogTitle: '添加题目',
      submitting: false,
      form: emptyForm(),
      previewVisible: false,
      previewRow: null,
      rules: {
        question: [
          { required: true, message: '请输入题干', trigger: 'blur' },
          { min: 4, message: '题干至少 4 个字', trigger: 'blur' }
        ],
        category: [{ required: true, message: '请选择分类', trigger: 'change' }]
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
    answerIndexOf(row) {
      return labelToIndex(row.answerLabel)
    },

    /** 调后端分页接口，加载指定页；后端没启动就回退到演示数据 */
    loadPage(page) {
      this.loading = true
      return http
        .get('/questions', { params: { page, pageSize: this.pageSize } })
        .then(response => {
          const result = response.data
          if (result.code !== 1) {
            throw new Error(result.msg || '加载失败')
          }
          this.demoMode = false
          this.tableData = result.data.qsBeanList
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

    /**
     * 演示兜底：Vercel / Pages 上的静态版没有 Java 后端，
     * 这时用 store 里的示例题库按同样的字段结构本地分页，页面照常能看。
     */
    useFallback(page) {
      if (!this.demoMode) {
        this.demoMode = true
        this.$message.info('未连接到 Java 后端，当前展示演示数据；本地启动 quiz-java 后即可联调')
      }

      const keyword = this.keyword.trim().toLowerCase()
      const rows = state.questions
        .filter(item => !keyword || item.title.toLowerCase().indexOf(keyword) !== -1)
        .map(item => ({
          id: item.id,
          questionText: item.title,
          options: item.options,
          answerLabel: LABELS[item.answer] || 'A',
          category: item.category
        }))

      this.total = rows.length
      const start = (page - 1) * this.pageSize
      this.tableData = rows.slice(start, start + this.pageSize)
      this.currentPage = page
    },

    /** 关键词查询：走 /findQuestion，同样带分页 */
    onSearch() {
      const kw = this.keyword.trim()
      if (!kw) {
        this.loadPage(1)
        return
      }

      this.loading = true
      http
        .get('/findQuestion', { params: { keyword: kw, page: 1, pageSize: this.pageSize } })
        .then(response => {
          const result = response.data
          if (result.code !== 1) {
            throw new Error(result.msg || '查询失败')
          }
          this.demoMode = false
          this.tableData = result.data.qsBeanList
          this.total = result.data.total
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

    handlePageChange(page) {
      this.loadPage(page)
    },

    handleSizeChange(size) {
      this.pageSize = size
      this.loadPage(1)
    },

    handleSelectionChange(rows) {
      this.selection = rows
    },

    openAdd() {
      this.dialogTitle = '添加题目'
      this.form = emptyForm()
      this.dialogVisible = true
    },

    openEdit(row) {
      this.dialogTitle = '编辑题目'
      this.form = {
        id: row.id,
        question: row.questionText,
        category: row.category || 'HTML',
        options: row.options.slice(0, 4),
        answerIndex: this.answerIndexOf(row)
      }
      this.dialogVisible = true
    },

    openPreview(row) {
      this.previewRow = row
      this.previewVisible = true
    },

    handleDialogClosed() {
      if (this.$refs.questionForm) {
        this.$refs.questionForm.resetFields()
      }
    },

    /** 把表单转成后端 QSBean 的结构：题干 + 四个选项 + 答案字母 */
    buildPayload() {
      const options = this.form.options.map(item => item.trim())
      return {
        question: this.form.question.trim(),
        optiona: options[0],
        optionb: options[1],
        optionc: options[2],
        optiond: options[3],
        answer: ANSWER_KEYS[this.form.answerIndex],
        category: this.form.category
      }
    },

    submitForm() {
      this.$refs.questionForm.validate(valid => {
        if (!valid) return

        if (this.demoMode) {
          this.$message.info('演示模式：请先在本地启动 quiz-java 后端，再增删改题目')
          return
        }

        const payload = this.buildPayload()
        if (!payload.optiona || !payload.optionb || !payload.optionc || !payload.optiond) {
          this.$message.warning('四个选项都要填')
          return
        }

        this.submitting = true
        const isEdit = Boolean(this.form.id)
        const request = isEdit
          ? http.post('/updateQuestion', payload, {
              params: { id: this.form.id },
              headers: { 'Content-Type': 'application/json' }
            })
          : http.post('/addQuestion', payload, {
              headers: { 'Content-Type': 'application/json' }
            })

        request
          .then(response => {
            const result = response.data
            if (result.code !== 1) {
              this.$message.error(result.msg || '保存失败')
              return
            }
            this.$message.success(isEdit ? '修改成功' : '添加成功')
            this.dialogVisible = false
            this.loadPage(this.currentPage)
          })
          .catch(error => {
            this.$message.error(this.errorText(error, '保存失败'))
          })
          .finally(() => {
            this.submitting = false
          })
      })
    },

    handleDelete(row) {
      this.$confirm('确定要删除题目「' + row.questionText + '」吗？', '删除确认', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => this.deleteById(row.id))
        .catch(() => {})
    },

    /** 后端只有按 id 删除的接口，批量删除就逐个调用 */
    handleBatchDelete() {
      if (!this.selection.length) return
      const rows = this.selection.slice()

      this.$confirm('确定要删除选中的 ' + rows.length + ' 道题目吗？', '批量删除', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          if (this.demoMode) {
            this.$message.info('演示模式：请先在本地启动 quiz-java 后端，再增删改题目')
            return
          }
          this.loading = true
          let success = 0
          for (const row of rows) {
            try {
              const response = await http.get('/delQuestion', { params: { id: row.id } })
              if (response.data.code === 1) success += 1
            } catch (error) {
              console.error('删除失败：' + row.id, error)
            }
          }
          this.loading = false
          this.selection = []
          this.$message.success('已删除 ' + success + ' 道题目')
          this.loadPage(this.currentPage)
        })
        .catch(() => {})
    },

    deleteById(id) {
      if (this.demoMode) {
        this.$message.info('演示模式：请先在本地启动 quiz-java 后端，再增删改题目')
        return
      }
      this.loading = true
      http
        .get('/delQuestion', { params: { id } })
        .then(response => {
          const result = response.data
          if (result.code !== 1) {
            this.$message.error(result.msg || '删除失败')
            return
          }
          this.$message.success('删除成功')
          // 删掉当前页最后一条时往前翻一页，避免停在空白页
          const page = this.tableData.length === 1 && this.currentPage > 1 ? this.currentPage - 1 : this.currentPage
          this.loadPage(page)
        })
        .catch(error => {
          this.$message.error(this.errorText(error, '删除失败'))
        })
        .finally(() => {
          this.loading = false
        })
    },

    errorText(error, fallback) {
      if (error && error.response && error.response.data && error.response.data.msg) {
        return error.response.data.msg
      }
      return fallback
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

.page-desc code {
  background: #f4f4f5;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 12px;
}

.stem {
  line-height: 1.6;
}

.option-line {
  line-height: 1.75;
  font-size: 13px;
  color: #5a6472;
}

.option-label {
  display: inline-block;
  width: 18px;
  color: #909399;
  font-weight: 600;
}

.option-right {
  color: #67c23a;
  font-weight: 600;
}

.danger-text {
  color: #f56c6c;
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.preview-title {
  margin: 0 0 16px;
  font-size: 16px;
  line-height: 1.6;
}

.preview-options {
  list-style: none;
  margin: 0;
  padding: 0;
}

.preview-options li {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 14px;
}

.preview-options li.right {
  border-color: #b3e19d;
  background: #f0f9eb;
  color: #529b2e;
}

.preview-options li i {
  margin-left: auto;
  font-size: 16px;
}
</style>
