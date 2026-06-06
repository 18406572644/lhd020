<template>
  <div class="education-editor">
    <div class="section-header">
      <h3 class="section-title">教育经历</h3>
      <el-button type="primary" size="small" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加
      </el-button>
    </div>
    
    <div v-if="resumeStore.resumeData?.education.length === 0" class="empty-state">
      <el-empty description="暂无教育经历，点击上方按钮添加" :image-size="80" />
    </div>
    
    <div v-else class="education-list">
      <div
        v-for="(edu, index) in resumeStore.resumeData?.education"
        :key="edu.id"
        class="education-card"
      >
        <div class="card-header">
          <div class="card-title">
            <span class="school">{{ edu.school || '未填写学校' }}</span>
          </div>
          <div class="card-actions">
            <el-button size="small" text type="primary" @click="handleEdit(index)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" text type="danger" @click="handleDelete(edu.id)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
        
        <div class="card-body">
          <div class="info-row">
            <span class="degree">{{ edu.degree }} · {{ edu.major }}</span>
            <span class="date">
              {{ edu.startDate || '开始时间' }} - {{ edu.endDate || '结束时间' }}
            </span>
          </div>
          <p class="description" v-if="edu.description">{{ edu.description }}</p>
        </div>
      </div>
    </div>
    
    <el-dialog
      v-model="dialogVisible"
      :title="editingIndex >= 0 ? '编辑教育经历' : '添加教育经历'"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="100px" ref="formRef">
        <el-form-item label="学校名称" prop="school" :rules="[{ required: true, message: '请输入学校名称', trigger: 'blur' }]">
          <el-input v-model="form.school" placeholder="请输入学校名称" />
        </el-form-item>
        
        <el-form-item label="学历" prop="degree" :rules="[{ required: true, message: '请选择学历', trigger: 'change' }]">
          <el-select v-model="form.degree" placeholder="请选择学历" style="width: 100%">
            <el-option label="博士" value="博士" />
            <el-option label="硕士" value="硕士" />
            <el-option label="本科" value="本科" />
            <el-option label="大专" value="大专" />
            <el-option label="高中" value="高中" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="专业" prop="major" :rules="[{ required: true, message: '请输入专业', trigger: 'blur' }]">
          <el-input v-model="form.major" placeholder="请输入专业" />
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
        
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入教育经历描述，如 GPA、奖项、荣誉等"
            maxlength="300"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import type { Education } from '@/types/resume'

const resumeStore = useResumeStore()
const dialogVisible = ref(false)
const editingIndex = ref(-1)
const saving = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<Omit<Education, 'id'>>({
  school: '',
  degree: '',
  major: '',
  startDate: '',
  endDate: '',
  description: ''
})

function resetForm() {
  form.school = ''
  form.degree = ''
  form.major = ''
  form.startDate = ''
  form.endDate = ''
  form.description = ''
  editingIndex.value = -1
}

function handleAdd() {
  resetForm()
  dialogVisible.value = true
}

function handleEdit(index: number) {
  const edu = resumeStore.resumeData?.education[index]
  if (edu) {
    form.school = edu.school
    form.degree = edu.degree
    form.major = edu.major
    form.startDate = edu.startDate
    form.endDate = edu.endDate
    form.description = edu.description
    editingIndex.value = index
    dialogVisible.value = true
  }
}

async function handleDelete(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除这条教育经历吗？', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    resumeStore.removeEducation(id)
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
          const id = resumeStore.resumeData!.education[editingIndex.value].id
          resumeStore.updateEducation(id, { ...form })
          ElMessage.success('更新成功')
        } else {
          resumeStore.addEducation({ ...form })
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
.education-editor {
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
  
  .education-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-base;
  }
  
  .education-card {
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
        .school {
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
        
        .degree {
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
      }
    }
  }
}
</style>
