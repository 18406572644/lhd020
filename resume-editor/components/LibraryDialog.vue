<template>
  <el-dialog
    v-model="dialogVisible"
    title="我的简历库"
    width="800px"
    :close-on-click-modal="false"
  >
    <div class="library-dialog">
      <div v-if="loading" class="loading-wrapper">
        <el-loading text="加载中..." />
      </div>
      
      <div v-else-if="savedResumes.length === 0" class="empty-state">
        <el-empty description="暂无保存的简历">
          <el-button type="primary" @click="dialogVisible = false">去编辑</el-button>
        </el-empty>
      </div>
      
      <div v-else class="resume-grid">
        <div
          v-for="resume in savedResumes"
          :key="resume.id"
          class="resume-card"
        >
          <div class="resume-thumbnail">
            <div class="thumbnail-preview" :style="{ '--primary': getTemplateColor(resume.data.template) }">
              <div class="preview-head"></div>
              <div class="preview-body"></div>
            </div>
          </div>
          
          <div class="resume-info">
            <div class="resume-name">{{ resume.name }}</div>
            <div class="resume-meta">
              <span>{{ resume.data.basicInfo.name }}</span>
              <span class="dot">·</span>
              <span>{{ resume.data.basicInfo.jobTitle }}</span>
            </div>
            <div class="resume-date">
              更新于 {{ formatDate(resume.updatedAt) }}
            </div>
          </div>
          
          <div class="resume-actions">
            <el-button size="small" @click="handleLoad(resume.id)">
              <el-icon><Loading /></el-icon>
              加载
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              :loading="deletingId === resume.id"
              @click="handleDelete(resume.id)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { SavedResume } from '@/types/resume'
import { savedResumesApi } from '@/services/resumeApi'
import { templateConfigs } from '@/data/mockData'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const resumeStore = useResumeStore()
const savedResumes = ref<SavedResume[]>([])
const loading = ref(false)
const deletingId = ref<string | null>(null)

watch(dialogVisible, async (val) => {
  if (val) {
    await loadSavedResumes()
  }
})

async function loadSavedResumes() {
  loading.value = true
  try {
    const res = await savedResumesApi.getList()
    if (res.success && res.data) {
      savedResumes.value = res.data
    }
  } finally {
    loading.value = false
  }
}

function getTemplateColor(templateId: string): string {
  return templateConfigs.find(t => t.id === templateId)?.primaryColor || '#1a1a2e'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function handleLoad(id: string) {
  const success = await resumeStore.loadFromLibrary(id)
  if (success) {
    ElMessage.success('加载成功')
    dialogVisible.value = false
  } else {
    ElMessage.error('加载失败')
  }
}

async function handleDelete(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除这份简历吗？此操作不可恢复。', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    deletingId.value = id
    const res = await savedResumesApi.delete(id)
    if (res.success) {
      savedResumes.value = savedResumes.value.filter(r => r.id !== id)
      ElMessage.success('删除成功')
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch {
    // 用户取消
  } finally {
    deletingId.value = null
  }
}
</script>

<style lang="scss" scoped>
.library-dialog {
  .loading-wrapper {
    display: flex;
    justify-content: center;
    padding: $spacing-4xl;
  }
  
  .empty-state {
    padding: $spacing-4xl;
  }
  
  .resume-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-lg;
    max-height: 500px;
    overflow-y: auto;
    padding: $spacing-sm;
  }
  
  .resume-card {
    display: flex;
    gap: $spacing-base;
    padding: $spacing-base;
    border: 1px solid $color-gray-200;
    border-radius: $border-radius-lg;
    transition: $transition-base;
    
    &:hover {
      border-color: $accent-color;
      box-shadow: $shadow-base;
    }
    
    .resume-thumbnail {
      width: 80px;
      height: 100px;
      flex-shrink: 0;
      
      .thumbnail-preview {
        width: 100%;
        height: 100%;
        border-radius: $border-radius-sm;
        overflow: hidden;
        border: 1px solid $color-gray-200;
        
        .preview-head {
          height: 30%;
          background: var(--primary);
        }
        
        .preview-body {
          height: 70%;
          background: $color-white;
          padding: $spacing-xs;
          
          &::before,
          &::after {
            content: '';
            display: block;
            height: 4px;
            background: $color-gray-200;
            margin-bottom: $spacing-xs;
            border-radius: 2px;
          }
          
          &::before {
            width: 70%;
          }
          
          &::after {
            width: 100%;
          }
        }
      }
    }
    
    .resume-info {
      flex: 1;
      min-width: 0;
      
      .resume-name {
        font-weight: 600;
        font-size: $font-size-base;
        color: $color-gray-800;
        margin-bottom: $spacing-xs;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .resume-meta {
        font-size: $font-size-sm;
        color: $color-gray-600;
        margin-bottom: $spacing-xs;
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        
        .dot {
          color: $color-gray-400;
        }
      }
      
      .resume-date {
        font-size: $font-size-xs;
        color: $color-gray-500;
      }
    }
    
    .resume-actions {
      display: flex;
      flex-direction: column;
      gap: $spacing-sm;
      align-self: center;
    }
  }
}
</style>
