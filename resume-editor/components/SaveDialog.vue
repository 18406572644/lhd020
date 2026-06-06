<template>
  <el-dialog
    v-model="dialogVisible"
    title="保存到简历库"
    width="480px"
    :close-on-click-modal="false"
  >
    <el-form :model="form" label-width="80px" ref="formRef">
      <el-form-item label="简历名称" prop="name" :rules="[{ required: true, message: '请输入简历名称', trigger: 'blur' }]">
        <el-input v-model="form.name" placeholder="请输入简历名称" maxlength="50" show-word-limit />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import html2canvas from 'html2canvas'

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
const formRef = ref<FormInstance>()
const saving = ref(false)

const form = reactive({
  name: ''
})

watch(dialogVisible, (val) => {
  if (val && resumeStore.resumeData) {
    form.name = resumeStore.resumeData.basicInfo.name + '的简历'
  }
})

async function generateThumbnail(): Promise<string> {
  const resumeEl = document.querySelector('.resume-preview-content') as HTMLElement
  if (!resumeEl) return ''
  
  try {
    const canvas = await html2canvas(resumeEl, {
      scale: 0.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })
    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('生成缩略图失败:', error)
    return ''
  }
}

async function handleSave() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        const thumbnail = await generateThumbnail()
        const res = await resumeStore.saveToLibrary(form.name, thumbnail)
        if (res?.success) {
          ElMessage.success('保存成功')
          dialogVisible.value = false
        } else {
          ElMessage.error(res?.message || '保存失败')
        }
      } finally {
        saving.value = false
      }
    }
  })
}
</script>
