<template>
  <header class="app-header">
    <div class="header-left">
      <div class="logo">
        <el-icon :size="24" color="#ffffff"><Document /></el-icon>
        <span class="logo-text">简历编辑器</span>
      </div>
    </div>
    
    <div class="header-center">
      <el-space>
        <template-selector />
        <module-sorter />
      </el-space>
    </div>
    
    <div class="header-right">
      <el-space>
        <el-button @click="handleSave" :loading="resumeStore.saving">
          <el-icon><Save /></el-icon>
          <span>保存</span>
        </el-button>
        
        <el-dropdown @command="handleExportCommand">
          <el-button type="primary">
            <el-icon><Download /></el-icon>
            <span>导出</span>
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="pdf">
                <el-icon><Document /></el-icon>
                导出 PDF
              </el-dropdown-item>
              <el-dropdown-item command="image">
                <el-icon><Picture /></el-icon>
                导出图片
              </el-dropdown-item>
              <el-dropdown-item command="json">
                <el-icon><Files /></el-icon>
                导出 JSON
              </el-dropdown-item>
              <el-dropdown-item command="print">
                <el-icon><Printer /></el-icon>
                打印
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <el-dropdown @command="handleMoreCommand">
          <el-button>
            <el-icon><MoreFilled /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="library">
                <el-icon><FolderOpened /></el-icon>
                我的简历库
              </el-dropdown-item>
              <el-dropdown-item command="import">
                <el-icon><Upload /></el-icon>
                导入 JSON
              </el-dropdown-item>
              <el-dropdown-item command="save-library">
                <el-icon><Star /></el-icon>
                保存到简历库
              </el-dropdown-item>
              <el-dropdown-item divided command="reset">
                <el-icon><RefreshRight /></el-icon>
                重置模板
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-space>
    </div>
    
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileChange"
    />
    
    <LibraryDialog v-model:visible="libraryVisible" />
    <SaveDialog v-model:visible="saveDialogVisible" />
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const resumeStore = useResumeStore()
const fileInput = ref<HTMLInputElement | null>(null)
const libraryVisible = ref(false)
const saveDialogVisible = ref(false)

// 自动保存
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  autoSaveTimer = setInterval(() => {
    if (resumeStore.resumeData) {
      resumeStore.saveResume()
    }
  }, 30000)
  
  // 键盘快捷键
  const handleKeydown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      handleSave()
    }
  }
  window.addEventListener('keydown', handleKeydown)
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
})

onUnmounted(() => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
  }
})

async function handleSave() {
  const success = await resumeStore.saveResume()
  if (success) {
    ElMessage.success('保存成功')
  } else {
    ElMessage.error('保存失败')
  }
}

async function handleExportCommand(command: string) {
  const resumeEl = document.querySelector('.resume-preview-content') as HTMLElement
  if (!resumeEl) {
    ElMessage.error('找不到预览内容')
    return
  }
  
  switch (command) {
    case 'pdf':
      await exportToPDF(resumeEl)
      break
    case 'image':
      await exportToImage(resumeEl)
      break
    case 'json':
      await resumeStore.exportJSON()
      ElMessage.success('JSON 导出成功')
      break
    case 'print':
      window.print()
      break
  }
}

async function exportToPDF(element: HTMLElement) {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const imgX = (pdfWidth - imgWidth * ratio) / 2
    const imgY = 0
    
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
    pdf.save(`resume_${Date.now()}.pdf`)
    ElMessage.success('PDF 导出成功')
  } catch (error) {
    console.error('PDF 导出失败:', error)
    ElMessage.error('PDF 导出失败')
  }
}

async function exportToImage(element: HTMLElement) {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })
    
    const link = document.createElement('a')
    link.download = `resume_${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    ElMessage.success('图片导出成功')
  } catch (error) {
    console.error('图片导出失败:', error)
    ElMessage.error('图片导出失败')
  }
}

async function handleMoreCommand(command: string) {
  switch (command) {
    case 'library':
      libraryVisible.value = true
      break
    case 'import':
      fileInput.value?.click()
      break
    case 'save-library':
      saveDialogVisible.value = true
      break
    case 'reset':
      try {
        await ElMessageBox.confirm('确定要重置为默认模板吗？当前内容将丢失。', '确认重置', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const success = await resumeStore.resetResume()
        if (success) {
          ElMessage.success('已重置为默认模板')
        }
      } catch {
        // 用户取消
      }
      break
  }
}

async function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    try {
      const success = await resumeStore.importJSON(file)
      if (success) {
        ElMessage.success('导入成功')
      } else {
        ElMessage.error('导入失败')
      }
    } catch (error) {
      ElMessage.error('文件格式错误')
    }
  }
  target.value = ''
}
</script>

<style lang="scss" scoped>
.app-header {
  height: 60px;
  background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-xl;
  box-shadow: $shadow-base;
  z-index: 100;
  
  .header-left {
    display: flex;
    align-items: center;
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    color: $color-white;
    
    .logo-text {
      font-size: $font-size-lg;
      font-weight: 600;
      letter-spacing: 1px;
    }
  }
  
  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;
  }
  
  .header-right {
    display: flex;
    align-items: center;
  }
}
</style>
