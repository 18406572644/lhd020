<template>
  <div class="certificate-editor">
    <div class="section-header">
      <h3 class="section-title">证书资质</h3>
      <el-button type="primary" size="small" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加
      </el-button>
    </div>
    
    <div v-if="resumeStore.resumeData?.certificates.length === 0" class="empty-state">
      <el-empty description="暂无证书，点击上方按钮添加" :image-size="80" />
    </div>
    
    <div v-else class="certificate-list">
      <div
        v-for="(cert, index) in resumeStore.resumeData?.certificates"
        :key="cert.id"
        class="certificate-card"
      >
        <div class="card-header">
          <div class="cert-icon">
            <el-icon :size="24"><Medal /></el-icon>
          </div>
          <div class="cert-info">
            <div class="cert-name">{{ cert.name || '未填写证书名称' }}</div>
            <div class="cert-meta">
              <span>{{ cert.issuer }}</span>
              <span class="dot">·</span>
              <span>{{ cert.date }}</span>
            </div>
          </div>
          <div class="card-actions">
            <el-button size="small" text type="primary" @click="handleEdit(index)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button size="small" text type="danger" @click="handleDelete(cert.id)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="description" v-if="cert.description" v-html="cert.description"></div>
      </div>
    </div>
    
    <el-dialog
      v-model="dialogVisible"
      :title="editingIndex >= 0 ? '编辑证书' : '添加证书'"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="100px" ref="formRef" @submit.prevent>
        <el-form-item label="证书名称" prop="name" :rules="[{ required: true, message: '请输入证书名称', trigger: 'blur' }]">
          <el-input v-model="form.name" placeholder="请输入证书名称" />
        </el-form-item>
        
        <el-form-item label="颁发机构" prop="issuer" :rules="[{ required: true, message: '请输入颁发机构', trigger: 'blur' }]">
          <el-input v-model="form.issuer" placeholder="请输入颁发机构" />
        </el-form-item>
        
        <el-form-item label="获得时间" prop="date" :rules="[{ required: true, message: '请选择获得时间', trigger: 'change' }]">
          <el-date-picker
            v-model="form.date"
            type="month"
            placeholder="选择获得时间"
            value-format="YYYY-MM"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="描述">
          <ClientOnly>
            <RichTextEditor
              v-model="form.description"
              placeholder="请输入证书描述"
            />
          </ClientOnly>
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
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import type { Certificate } from '@/types/resume'

const resumeStore = useResumeStore()
const dialogVisible = ref(false)
const editingIndex = ref(-1)
const saving = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<Omit<Certificate, 'id'>>({
  name: '',
  issuer: '',
  date: '',
  description: ''
})

function resetForm() {
  form.name = ''
  form.issuer = ''
  form.date = ''
  form.description = ''
  editingIndex.value = -1
}

function handleAdd() {
  resetForm()
  dialogVisible.value = true
}

function handleEdit(index: number) {
  const cert = resumeStore.resumeData?.certificates[index]
  if (cert) {
    form.name = cert.name
    form.issuer = cert.issuer
    form.date = cert.date
    form.description = cert.description
    editingIndex.value = index
    dialogVisible.value = true
  }
}

async function handleDelete(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除这个证书吗？', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    resumeStore.removeCertificate(id)
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
        if (editingIndex.value >= 0) {
          const id = resumeStore.resumeData!.certificates[editingIndex.value].id
          resumeStore.updateCertificate(id, { ...form })
          ElMessage.success('更新成功')
        } else {
          resumeStore.addCertificate({ ...form })
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
.certificate-editor {
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
  
  .certificate-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-base;
  }
  
  .certificate-card {
    border: 1px solid $color-gray-200;
    border-radius: $border-radius-base;
    padding: $spacing-base;
    transition: $transition-base;
    
    &:hover {
      border-color: $accent-color;
      box-shadow: $shadow-sm;
    }
    
    .card-header {
      display: flex;
      align-items: center;
      gap: $spacing-base;
      margin-bottom: $spacing-sm;
      
      .cert-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(15, 52, 96, 0.1);
        color: $accent-color;
        border-radius: $border-radius-base;
        flex-shrink: 0;
      }
      
      .cert-info {
        flex: 1;
        min-width: 0;
        
        .cert-name {
          font-weight: 600;
          font-size: $font-size-base;
          color: $color-gray-800;
          margin-bottom: $spacing-xs;
        }
        
        .cert-meta {
          font-size: $font-size-sm;
          color: $color-gray-500;
          display: flex;
          align-items: center;
          gap: $spacing-xs;
          
          .dot {
            color: $color-gray-400;
          }
        }
      }
      
      .card-actions {
        display: flex;
        gap: $spacing-xs;
      }
    }
    
    .description {
      font-size: $font-size-sm;
      color: $color-gray-600;
      line-height: $line-height-base;
      padding-left: 64px;
      
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
  }
}
</style>
