<template>
  <ClientOnly>
    <el-popover placement="bottom-start" :width="560" trigger="click" :disabled="resumeStore.loading">
      <template #reference>
        <el-button :loading="resumeStore.loading">
          <el-icon><MagicStick /></el-icon>
          <span>选择模板</span>
        </el-button>
      </template>
      
      <div class="template-selector">
        <h3 class="title">选择简历模板</h3>
        
        <div v-if="resumeStore.loading" class="loading-state">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
        
        <div v-else-if="!resumeStore.templates || resumeStore.templates.length === 0" class="empty-state">
          <el-empty description="暂无可用模板" />
        </div>
        
        <div v-else class="template-grid">
          <div
            v-for="template in resumeStore.templates"
            :key="template.id"
            class="template-item"
            :class="{ active: resumeStore.resumeData?.template === template.id }"
            @click="handleSelectTemplate(template.id)"
          >
            <div 
              class="template-preview"
              :style="{ 
                '--primary': template.primaryColor, 
                '--secondary': template.secondaryColor 
              }"
            >
              <div class="preview-header">
                <div class="preview-name"></div>
                <div class="preview-title"></div>
              </div>
              <div class="preview-body" :class="template.layout">
                <div class="preview-section">
                  <div class="preview-line short"></div>
                  <div class="preview-line"></div>
                  <div class="preview-line"></div>
                </div>
                <div class="preview-section">
                  <div class="preview-line short"></div>
                  <div class="preview-line"></div>
                  <div class="preview-line short"></div>
                </div>
              </div>
            </div>
            <div class="template-info">
              <div class="template-name">{{ template.name }}</div>
              <div class="template-desc">{{ template.description }}</div>
            </div>
            <el-icon v-if="resumeStore.resumeData?.template === template.id" class="check-icon">
              <Check />
            </el-icon>
          </div>
        </div>
      </div>
    </el-popover>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

const resumeStore = useResumeStore()

async function handleSelectTemplate(templateId: string) {
  if (!resumeStore.resumeData) {
    ElMessage.warning('简历数据正在初始化，请稍候...')
    return
  }
  
  if (!resumeStore.templates || resumeStore.templates.length === 0) {
    ElMessage.warning('模板数据加载中，请稍候...')
    return
  }
  
  try {
    await resumeStore.switchTemplate(templateId)
    const template = resumeStore.templates.find(t => t.id === templateId)
    if (template) {
      ElMessage.success(`已切换到${template.name}模板`)
    }
  } catch (error) {
    console.error('切换模板失败:', error)
    ElMessage.error('切换模板失败')
  }
}
</script>

<style lang="scss" scoped>
.template-selector {
  .title {
    font-size: $font-size-lg;
    font-weight: 600;
    margin-bottom: $spacing-lg;
    color: $color-gray-800;
  }
  
  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-xl * 2;
    color: $color-gray-500;
    gap: $spacing-sm;
    
    .el-icon {
      font-size: $font-size-2xl;
    }
  }
  
  .loading-state {
    .is-loading {
      animation: rotating 1s linear infinite;
    }
  }
  
  @keyframes rotating {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .template-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-lg;
  }
  
  .template-item {
    position: relative;
    border: 2px solid transparent;
    border-radius: $border-radius-lg;
    padding: $spacing-base;
    cursor: pointer;
    transition: $transition-base;
    
    &:hover {
      border-color: $color-gray-300;
      background-color: $color-gray-50;
    }
    
    &.active {
      border-color: $accent-color;
      background-color: rgba(15, 52, 96, 0.05);
    }
    
    .check-icon {
      position: absolute;
      top: $spacing-sm;
      right: $spacing-sm;
      color: $accent-color;
      font-size: $font-size-xl;
    }
  }
  
  .template-preview {
    height: 140px;
    border-radius: $border-radius-base;
    overflow: hidden;
    box-shadow: $shadow-sm;
    margin-bottom: $spacing-base;
    
    .preview-header {
      background: var(--primary);
      padding: $spacing-md;
      
      .preview-name {
        height: 16px;
        width: 60%;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 2px;
        margin-bottom: $spacing-xs;
      }
      
      .preview-title {
        height: 12px;
        width: 40%;
        background: rgba(255, 255, 255, 0.7);
        border-radius: 2px;
      }
    }
    
    .preview-body {
      padding: $spacing-sm;
      background: $color-white;
      display: flex;
      gap: $spacing-sm;
      height: calc(100% - 60px);
      
      &.single {
        flex-direction: column;
      }
      
      &.double > div {
        flex: 1;
      }
      
      .preview-section {
        display: flex;
        flex-direction: column;
        gap: $spacing-xs;
        
        .preview-line {
          height: 6px;
          background: $color-gray-200;
          border-radius: 2px;
          
          &.short {
            width: 30%;
            background: var(--secondary);
          }
        }
      }
    }
  }
  
  .template-info {
    .template-name {
      font-weight: 600;
      font-size: $font-size-base;
      color: $color-gray-800;
      margin-bottom: $spacing-xs;
    }
    
    .template-desc {
      font-size: $font-size-sm;
      color: $color-gray-500;
      line-height: 1.4;
    }
  }
}
</style>
