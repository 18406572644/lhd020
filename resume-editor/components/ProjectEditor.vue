<template>
  <div class="project-editor">
    <div class="section-header">
      <h3 class="section-title">项目经历</h3>
      <el-button type="primary" size="small" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加
      </el-button>
    </div>
    
    <div v-if="resumeStore.resumeData?.projects.length === 0" class="empty-state">
      <el-empty description="暂无项目经历，点击上方按钮添加" :image-size="80" />
    </div>
    
    <div v-else class="project-list">
      <div
        v-for="(project, index) in resumeStore.resumeData?.projects"
        :key="project.id"
        class="project-card"
      >
        <div class="card-header">
          <div class="card-title">
            <span class="name">{{ project.name || '未填写项目名称' }}</span>
          </div>
          <div class="card-actions">
            <el-button size="small" text type="primary" @click="handleEdit(index)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" text type="danger" @click="handleDelete(project.id)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
        
        <div class="card-body">
          <div class="info-row">
            <span class="role">{{ project.role }}</span>
            <span class="date">
              {{ project.startDate || '开始时间' }} - {{ project.endDate || '结束时间' }}
            </span>
          </div>
          <div class="description" v-if="project.description" v-html="project.description"></div>
          <div class="technologies" v-if="project.technologies?.length">
            <el-tag
              v-for="(tech, i) in project.technologies"
              :key="i"
              size="small"
              type="info"
              effect="plain"
            >
              {{ tech }}
            </el-tag>
          </div>
          <ul class="highlights" v-if="project.highlights?.length">
            <li v-for="(item, i) in project.highlights" :key="i" v-html="item"></li>
          </ul>
        </div>
      </div>
    </div>
    
    <el-dialog
      v-model="dialogVisible"
      :title="editingIndex >= 0 ? '编辑项目经历' : '添加项目经历'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="100px" ref="formRef" @submit.prevent>
        <el-form-item label="项目名称" prop="name" :rules="[{ required: true, message: '请输入项目名称', trigger: 'blur' }]">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        
        <el-form-item label="担任角色" prop="role" :rules="[{ required: true, message: '请输入担任角色', trigger: 'blur' }]">
          <el-input v-model="form.role" placeholder="请输入担任角色" />
        </el-form-item>
        
        <el-form-item label="开始时间" prop="startDate" :rules="[{ required: true, message: '请选择开始时间', trigger: 'change' }]">
          <el-date-picker
            v-model="form.startDate"
            type="month"
            placeholder="选择开始时间"
            value-format="YYYY-MM"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="结束时间" prop="endDate" :rules="[{ required: true, message: '请选择结束时间', trigger: 'change' }]">
          <el-date-picker
            v-model="form.endDate"
            type="month"
            placeholder="选择结束时间"
            value-format="YYYY-MM"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="项目描述">
          <ClientOnly>
            <RichTextEditor
              v-model="form.description"
              placeholder="请输入项目描述"
            />
          </ClientOnly>
        </el-form-item>
        
        <el-form-item label="技术栈">
          <el-select
            v-model="form.technologies"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入技术栈后回车添加"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="项目亮点">
          <div class="highlights-tip">
            <el-icon><Rank /></el-icon>
            <span>拖拽左侧图标调整亮点顺序</span>
          </div>
          <div class="highlights-editor" ref="highlightsContainerRef">
            <div
              v-for="(highlight, index) in form.highlights"
              :key="index"
              class="highlight-item"
              :data-index="index"
            >
              <div class="drag-handle">
                <el-icon><Rank /></el-icon>
              </div>
              <el-input v-model="form.highlights[index]" placeholder="请输入项目亮点" />
              <el-button 
                native-type="button"
                size="small" 
                type="danger" 
                text
                @click.prevent="form.highlights.splice(index, 1)"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            <el-button native-type="button" size="small" @click.prevent="form.highlights.push('')">
              <el-icon><Plus /></el-icon>
              添加亮点
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button native-type="button" @click="dialogVisible = false">取消</el-button>
        <el-button native-type="button" type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import Sortable from 'sortablejs'
import type { Project } from '@/types/resume'
import { Rank } from '@element-plus/icons-vue'

const resumeStore = useResumeStore()
const dialogVisible = ref(false)
const editingIndex = ref(-1)
const saving = ref(false)
const formRef = ref<FormInstance>()
const highlightsContainerRef = ref<HTMLElement | null>(null)
let sortableInstance: Sortable | null = null

const form = reactive<Omit<Project, 'id'>>({
  name: '',
  role: '',
  startDate: '',
  endDate: '',
  description: '',
  technologies: [],
  highlights: []
})

function initSortable() {
  if (!highlightsContainerRef.value) return
  
  if (sortableInstance) {
    sortableInstance.destroy()
  }
  
  nextTick(() => {
    if (!highlightsContainerRef.value) return
    
    sortableInstance = Sortable.create(highlightsContainerRef.value, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onEnd: (evt) => {
        const oldIndex = evt.oldIndex
        const newIndex = evt.newIndex
        if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return
        
        const item = form.highlights.splice(oldIndex, 1)[0]
        form.highlights.splice(newIndex, 0, item)
      }
    })
  })
}

watch(dialogVisible, (visible) => {
  if (visible) {
    nextTick(() => {
      initSortable()
    })
  } else {
    if (sortableInstance) {
      sortableInstance.destroy()
      sortableInstance = null
    }
  }
})

onBeforeUnmount(() => {
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
})

function resetForm() {
  form.name = ''
  form.role = ''
  form.startDate = ''
  form.endDate = ''
  form.description = ''
  form.technologies = []
  form.highlights = []
  editingIndex.value = -1
}

function handleAdd() {
  resetForm()
  dialogVisible.value = true
}

function handleEdit(index: number) {
  const project = resumeStore.resumeData?.projects[index]
  if (project) {
    form.name = project.name
    form.role = project.role
    form.startDate = project.startDate
    form.endDate = project.endDate
    form.description = project.description
    form.technologies = [...project.technologies]
    form.highlights = [...project.highlights]
    editingIndex.value = index
    dialogVisible.value = true
  }
}

async function handleDelete(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除这条项目经历吗？', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    resumeStore.removeProject(id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

async function handleSave() {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true
      try {
        const highlights = form.highlights.filter(h => h.trim())
        
        if (editingIndex.value >= 0) {
          const id = resumeStore.resumeData!.projects[editingIndex.value].id
          resumeStore.updateProject(id, { ...form, highlights })
          ElMessage.success('更新成功')
        } else {
          resumeStore.addProject({ ...form, highlights })
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
      } finally {
        saving.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.project-editor {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;
  }
  
  .section-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $color-gray-800;
  }
  
  .empty-state {
    padding: $spacing-3xl 0;
  }
  
  .project-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-base;
  }
  
  .project-card {
    border: 1px solid $color-gray-200;
    border-radius: $border-radius-base;
    overflow: hidden;
    transition: $transition-base;
    
    &:hover {
      border-color: $accent-color;
      box-shadow: $shadow-sm;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: $spacing-base;
      background-color: $color-gray-50;
      border-bottom: 1px solid $color-gray-200;
      
      .card-title {
        .name {
          font-weight: 600;
          font-size: $font-size-base;
          color: $color-gray-800;
        }
      }
      
      .card-actions {
        display: flex;
        gap: $spacing-sm;
      }
    }
    
    .card-body {
      padding: $spacing-base;
      
      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $spacing-sm;
        
        .role {
          font-weight: 500;
          color: $color-gray-700;
        }
        
        .date {
          font-size: $font-size-sm;
          color: $color-gray-500;
        }
      }
      
      .description {
        font-size: $font-size-sm;
        color: $color-gray-600;
        line-height: $line-height-base;
        margin-bottom: $spacing-sm;
        
        :deep(p) {
          margin-bottom: $spacing-xs;
        }
        
        :deep(ul),
        :deep(ol) {
          padding-left: $spacing-lg;
          margin-bottom: $spacing-xs;
        }
        
        :deep(ul) {
          list-style: disc;
        }
        
        :deep(ol) {
          list-style: decimal;
        }
        
        :deep(li) {
          margin-bottom: 2px;
        }
        
        :deep(a) {
          color: $accent-color;
          text-decoration: underline;
        }
        
        :deep(strong) {
          font-weight: 600;
        }
        
        :deep(em) {
          font-style: italic;
        }
        
        :deep(u) {
          text-decoration: underline;
        }
        
        :deep(table) {
          border-collapse: collapse;
          width: 100%;
          margin: $spacing-xs 0;
          
          td,
          th {
            border: 1px solid $color-gray-300;
            padding: $spacing-xs $spacing-sm;
            min-width: 60px;
            text-align: left;
            font-size: $font-size-xs;
          }
          
          th {
            background-color: $color-gray-100;
            font-weight: 600;
          }
        }
      }
      
      .technologies {
        display: flex;
        flex-wrap: wrap;
        gap: $spacing-xs;
        margin-bottom: $spacing-sm;
      }
      
      .highlights {
        list-style: disc;
        padding-left: $spacing-lg;
        
        li {
          font-size: $font-size-sm;
          color: $color-gray-600;
          line-height: $line-height-base;
          margin-bottom: $spacing-xs;
          
          :deep(a) {
            color: $accent-color;
            text-decoration: underline;
          }
          
          :deep(strong) {
            font-weight: 600;
          }
          
          :deep(em) {
            font-style: italic;
          }
          
          :deep(u) {
            text-decoration: underline;
          }
        }
      }
    }
  }
  
  .highlights-tip {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: $font-size-xs;
    color: $color-gray-500;
    margin-bottom: $spacing-sm;
    
    .el-icon {
      font-size: $font-size-sm;
    }
  }
  
  .highlights-editor {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    
    .highlight-item {
      display: flex;
      gap: $spacing-sm;
      align-items: flex-start;
      padding: $spacing-xs;
      border: 1px solid transparent;
      border-radius: $border-radius-base;
      transition: $transition-base;
      
      &:hover {
        border-color: $color-gray-200;
        background-color: $color-gray-50;
      }
      
      .drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 32px;
        cursor: grab;
        color: $color-gray-400;
        transition: $transition-base;
        flex-shrink: 0;
        
        &:hover {
          color: $accent-color;
        }
        
        &:active {
          cursor: grabbing;
        }
        
        .el-icon {
          font-size: 16px;
        }
      }
      
      .el-input {
        flex: 1;
      }
      
      &.sortable-chosen {
        opacity: 0.8;
      }
      
      &.sortable-ghost {
        opacity: 0.4;
        background-color: $color-gray-100;
      }
      
      &.sortable-drag {
        opacity: 1;
        background-color: $color-white;
        box-shadow: $shadow-lg;
      }
    }
  }
}
</style>
