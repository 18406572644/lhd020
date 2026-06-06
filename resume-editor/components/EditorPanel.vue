<template>
  <div class="editor-panel no-print">
    <div class="panel-header">
      <h2 class="panel-title">编辑简历</h2>
    </div>
    
    <div class="panel-tabs">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="基本信息" name="basic">
          <BasicInfoEditor />
        </el-tab-pane>
        
        <el-tab-pane label="工作经历" name="work">
          <WorkExperienceEditor />
        </el-tab-pane>
        
        <el-tab-pane label="教育经历" name="education">
          <EducationEditor />
        </el-tab-pane>
        
        <el-tab-pane label="项目经历" name="project">
          <ProjectEditor />
        </el-tab-pane>
        
        <el-tab-pane label="专业技能" name="skill">
          <SkillEditor />
        </el-tab-pane>
        
        <el-tab-pane label="证书资质" name="certificate">
          <CertificateEditor />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('basic')
</script>

<style lang="scss" scoped>
.editor-panel {
  width: 480px;
  height: 100%;
  background-color: $color-white;
  border-right: 1px solid $color-gray-200;
  display: flex;
  flex-direction: column;
  
  .panel-header {
    padding: $spacing-lg $spacing-xl;
    border-bottom: 1px solid $color-gray-200;
    
    .panel-title {
      font-size: $font-size-xl;
      font-weight: 600;
      color: $color-gray-800;
    }
  }
  
  .panel-tabs {
    flex: 1;
    overflow: hidden;
    padding: $spacing-base;
    
    :deep(.el-tabs) {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    :deep(.el-tabs__content) {
      flex: 1;
      overflow-y: auto;
      padding-right: $spacing-sm;
    }
    
    :deep(.el-tab-pane) {
      height: 100%;
    }
  }
}
</style>
