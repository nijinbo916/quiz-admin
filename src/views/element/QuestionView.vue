<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h2 class="page-title">题目管理</h2>
        <p class="page-desc">维护 quiz-game 的题库：编辑题干与选项、标记正确答案，并可按分类筛选。</p>
      </div>
      <div class="head-tags">
        <el-tag type="info" effect="plain" size="small">共 {{ questions.length }} 道题</el-tag>
        <el-tag type="success" effect="plain" size="small">{{ categories.length }} 个分类</el-tag>
      </div>
    </div>

    <div class="panel">
      <el-form :inline="true" :model="query" class="query-form" @submit.native.prevent>
        <el-form-item label="题目">
          <el-input
            v-model="query.keyword"
            placeholder="输入题干关键词"
            clearable
            prefix-icon="el-icon-search"
            style="width: 220px"
            @keyup.enter.native="handleQuery"
            @clear="handleQuery"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="query.category" placeholder="全部分类" clearable style="width: 140px">
            <el-option v-for="item in categories" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
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
        <span class="muted">当前筛选出 {{ filteredList.length }} 道题</span>
      </div>

      <el-table
        :data="pagedList"
        border
        stripe
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="46" align="center" />
        <el-table-column label="序号" width="70" align="center">
          <template slot-scope="scope">{{ (page - 1) * size + scope.$index + 1 }}</template>
        </el-table-column>
        <el-table-column label="题干" min-width="260">
          <template slot-scope="scope">
            <span class="stem">{{ scope.row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="105" align="center">
          <template slot-scope="scope">
            <el-tag size="small" effect="plain">{{ scope.row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="选项" min-width="250">
          <template slot-scope="scope">
            <div class="option-line" v-for="(option, index) in scope.row.options" :key="index">
              <span class="option-label">{{ labels[index] }}</span>
              <span :class="{ 'option-right': index === scope.row.answer }">{{ option }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="答案" width="80" align="center">
          <template slot-scope="scope">
            <el-tag type="success" size="small">{{ labels[scope.row.answer] }}</el-tag>
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
        @current-change="handleCurrentChange"
        :current-page="page"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filteredList.length"
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
        <el-form-item label="题干" prop="title">
          <el-input
            v-model="form.title"
            type="textarea"
            :rows="2"
            maxlength="120"
            show-word-limit
            placeholder="请输入题目内容"
          />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 180px">
            <el-option v-for="item in allCategories" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item
          v-for="(option, index) in form.options"
          :key="index"
          :label="'选项 ' + labels[index]"
          :prop="'options.' + index"
          :rules="{ required: true, message: '选项内容不能为空', trigger: 'blur' }"
        >
          <div class="option-edit">
            <el-input v-model="form.options[index]" maxlength="60" placeholder="选项内容" />
            <el-button
              type="text"
              class="danger-text"
              icon="el-icon-remove-outline"
              :disabled="form.options.length <= 2"
              @click="removeOption(index)"
            >
              删除
            </el-button>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="text"
            icon="el-icon-circle-plus-outline"
            :disabled="form.options.length >= 6"
            @click="addOption"
          >
            添加选项（最多 6 个）
          </el-button>
        </el-form-item>

        <el-form-item label="正确答案" prop="answer">
          <el-radio-group v-model="form.answer">
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
          <el-tag size="small" effect="plain">{{ previewRow.category }}</el-tag>
          <span class="muted">正确答案：{{ labels[previewRow.answer] }}</span>
        </div>
        <h3 class="preview-title">{{ previewRow.title }}</h3>
        <ul class="preview-options">
          <li v-for="(option, index) in previewRow.options" :key="index" :class="{ right: index === previewRow.answer }">
            <span class="option-label">{{ labels[index] }}</span>
            {{ option }}
            <i v-if="index === previewRow.answer" class="el-icon-check"></i>
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
import { state, store } from '@/store'

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F']
const FIXED_CATEGORIES = ['HTML', 'CSS', 'JavaScript', 'Vue', '网络']

function emptyForm() {
  return {
    id: null,
    title: '',
    category: 'HTML',
    options: ['', '', '', ''],
    answer: 0
  }
}

export default {
  name: 'QuestionView',
  data() {
    return {
      state,
      labels: LABELS,
      allCategories: FIXED_CATEGORIES,
      query: {
        keyword: '',
        category: ''
      },
      page: 1,
      size: 5,
      selection: [],
      dialogVisible: false,
      dialogTitle: '添加题目',
      submitting: false,
      form: emptyForm(),
      previewVisible: false,
      previewRow: null,
      rules: {
        title: [
          { required: true, message: '请输入题干', trigger: 'blur' },
          { min: 4, message: '题干至少 4 个字', trigger: 'blur' }
        ],
        category: [{ required: true, message: '请选择分类', trigger: 'change' }],
        answer: [{ required: true, message: '请选择正确答案', trigger: 'change' }]
      }
    }
  },
  computed: {
    questions() {
      return state.questions
    },
    categories() {
      const set = {}
      this.questions.forEach(item => {
        if (item.category) set[item.category] = true
      })
      return Object.keys(set)
    },
    filteredList() {
      const keyword = this.query.keyword.trim().toLowerCase()
      const category = this.query.category

      return this.questions.filter(item => {
        const matchKeyword = !keyword || item.title.toLowerCase().indexOf(keyword) !== -1
        const matchCategory = !category || item.category === category
        return matchKeyword && matchCategory
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
    handleQuery() {
      this.page = 1
    },
    handleReset() {
      this.query.keyword = ''
      this.query.category = ''
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
    addOption() {
      if (this.form.options.length >= 6) return
      this.form.options.push('')
    },
    removeOption(index) {
      if (this.form.options.length <= 2) return
      this.form.options.splice(index, 1)

      // 删除后同步修正正确答案的下标，避免答案错位
      if (this.form.answer > index) {
        this.form.answer -= 1
      } else if (this.form.answer === index) {
        this.form.answer = Math.min(index, this.form.options.length - 1)
      }
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
        title: row.title,
        category: row.category,
        options: row.options.slice(),
        answer: row.answer
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
    submitForm() {
      this.$refs.questionForm.validate(valid => {
        if (!valid) return

        const options = this.form.options.map(item => item.trim())
        if (options.filter(item => item).length < 2) {
          this.$message.warning('至少需要 2 个非空选项')
          return
        }

        this.submitting = true
        const payload = {
          title: this.form.title.trim(),
          category: this.form.category,
          options,
          answer: this.form.answer
        }

        window.setTimeout(() => {
          if (this.form.id) {
            store.updateQuestion(this.form.id, payload)
            this.$message.success('修改成功')
          } else {
            store.addQuestion(payload)
            this.$message.success('添加成功')
          }
          this.submitting = false
          this.dialogVisible = false
        }, 260)
      })
    },
    handleDelete(row) {
      this.$confirm('确定要删除题目「' + row.title + '」吗？', '删除确认', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          store.removeQuestions([row.id])
          this.$message.success('删除成功')
        })
        .catch(() => {})
    },
    handleBatchDelete() {
      if (!this.selection.length) return
      this.$confirm('确定要删除选中的 ' + this.selection.length + ' 道题目吗？', '批量删除', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          store.removeQuestions(this.selection.map(item => item.id))
          this.selection = []
          this.$message.success('批量删除成功')
        })
        .catch(() => {})
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

.option-edit {
  display: flex;
  align-items: center;
  gap: 10px;
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
