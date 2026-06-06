<template>
  <div class="skill-editor">
    <div class="section-header">
      <h3 class="section-title">专业技能</h3>
      <el-button type="primary" size="small" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加
      </el-button>
    </div>
    
    <div v-if="resumeStore.resumeData?.skills.length === 0" class="empty-state">
      <el-empty description="暂无技能，点击上方按钮添加" :image-size="80" />
    </div>
    
    <div v-else class="skill-list">
      <div
        v-for="(skill, index) in resumeStore.resumeData?.skills"
        :key="skill.id"
        class="skill-item"
      >
        <div class="skill-info">
          <div class="skill-header">
            <span class="skill-name">{{ skill.name }}</span>
            <el-tag size="small" type="info" effect="plain" v-if="skill.category">
              {{ skill.category }}
            </el-tag>
          </div>
          <div class="skill-level">
            <el-slider
              :model-value="skill.level"
              disabled
              :show-tooltip="false"
              :min="0"
              :max="100"
            />
            <span class="level-text">{{ skill.level }}%</span>
          </div>
        </div>
        <div class="skill-actions">
          <el-button size="small" text type="primary" @click="handleEdit(index)">
            <el-icon><Edit /></el-icon>
          </el-button>
          <el-button size="small" text type="danger" @click="handleDelete(skill.id)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
    
    <el-dialog
      v-model="dialogVisible"
      :title="editingIndex >= 0 ? '编辑技能' : '添加技能'"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="100px" ref="formRef">
        <el-form-item label="技能名称" prop="name" :rules="[{ required: true, message: '请输入技能名称', trigger: 'blur' }]">
          <el-input v-model="form.name" placeholder="请输入技能名称" />
        </el-form-item>
        
        <el-form-item label="技能分类">
          <el-select v-model="form.category" placeholder="请选择或输入分类" allow-create filterable style="width: 100%">
            <el-option label="前端框架" value="前端框架" />
            <el-option label="后端开发" value="后端开发" />
            <el-option label="编程语言" value="编程语言" />
            <el-option label="数据库" value="数据库" />
            <el-option label="工程化" value="工程化" />
            <el-option label="工具" value="工具" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="熟练程度">
          <div class="level-editor">
            <el-slider
              v-model="form.level"
              :min="0"
              :max="100"
              :step="5"
              show-stops
            />
            <span class="level-value">{{ form.level }}%</span>
          </div>
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
import type { Skill } from '@/types/resume'

const resumeStore = useResumeStore()
const dialogVisible = ref(false)
const editingIndex = ref(-1)
const saving = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<Omit<Skill, 'id'>>({
  name: '',
  level: 80,
  category: ''
})

function resetForm() {
  form.name = ''
  form.level = 80
  form.category = ''
  editingIndex.value = -1
}

function handleAdd() {
  resetForm()
  dialogVisible.value = true
}

function handleEdit(index: number) {
  const skill = resumeStore.resumeData?.skills[index]
  if (skill) {
    form.name = skill.name
    form.level = skill.level
    form.category = skill.category
    editingIndex.value = index
    dialogVisible.value = true
  }
}

async function handleDelete(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除这个技能吗？', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    resumeStore.removeSkill(id)
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
          const id = resumeStore.resumeData!.skills[editingIndex.value].id
          resumeStore.updateSkill(id, { ...form })
          ElMessage.success('更新成功')
        } else {
          resumeStore.addSkill({ ...form })
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
.skill-editor {
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
  
  .skill-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-base;
  }
  
  .skill-item {
    display: flex;
    align-items: center;
    gap: $spacing-base;
    padding: $spacing-base;
    border: 1px solid $color-gray-200;
    border-radius: $border-radius-base;
    transition: $transition-base;
    
    &:hover {
      border-color: $accent-color;
      box-shadow: $shadow-sm;
    }
    
    .skill-info {
      flex: 1;
      min-width: 0;
      
      .skill-header {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        margin-bottom: $spacing-xs;
        
        .skill-name {
          font-weight: 500;
          color: $color-gray-800;
        }
      }
      
      .skill-level {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        
        .el-slider {
          flex: 1;
        }
        
        .level-text {
          font-size: $font-size-sm;
          color: $color-gray-500;
          min-width: 40px;
          text-align: right;
        }
      }
    }
    
    .skill-actions {
      display: flex;
      gap: $spacing-xs;
    }
  }
  
  .level-editor {
    display: flex;
    align-items: center;
    gap: $spacing-base;
    
    .el-slider {
      flex: 1;
    }
    
    .level-value {
      font-weight: 600;
      color: $accent-color;
      min-width: 50px;
    }
  }
}
</style>
