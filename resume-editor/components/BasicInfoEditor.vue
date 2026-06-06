<template>
  <div class="basic-info-editor">
    <el-form v-if="resumeStore.resumeData" :model="resumeStore.resumeData.basicInfo" label-width="100px">
      <div class="avatar-section">
        <div class="avatar-wrapper">
          <el-avatar
            :size="100"
            :src="resumeStore.resumeData.basicInfo.avatar"
            class="avatar"
          >
            <el-icon :size="40"><User /></el-icon>
          </el-avatar>
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :before-upload="handleAvatarUpload"
            accept="image/*"
          >
            <el-button size="small" type="primary">
              <el-icon><Camera /></el-icon>
              更换头像
            </el-button>
          </el-upload>
        </div>
      </div>
      
      <el-form-item label="姓名">
        <el-input v-model="resumeStore.resumeData.basicInfo.name" placeholder="请输入姓名" />
      </el-form-item>
      
      <el-form-item label="求职意向">
        <el-input v-model="resumeStore.resumeData.basicInfo.jobTitle" placeholder="请输入求职意向" />
      </el-form-item>
      
      <el-form-item label="手机号码">
        <el-input v-model="resumeStore.resumeData.basicInfo.phone" placeholder="请输入手机号码" />
      </el-form-item>
      
      <el-form-item label="电子邮箱">
        <el-input v-model="resumeStore.resumeData.basicInfo.email" placeholder="请输入电子邮箱" />
      </el-form-item>
      
      <el-form-item label="所在城市">
        <el-input v-model="resumeStore.resumeData.basicInfo.location" placeholder="请输入所在城市" />
      </el-form-item>
      
      <el-form-item label="个人网站">
        <el-input v-model="resumeStore.resumeData.basicInfo.website" placeholder="请输入个人网站/博客" />
      </el-form-item>
      
      <el-form-item label="个人简介">
        <el-input
          v-model="resumeStore.resumeData.basicInfo.summary"
          type="textarea"
          :rows="4"
          placeholder="简要介绍您的专业背景、核心优势和职业目标"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    
    <el-empty v-else description="加载中..." />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

const resumeStore = useResumeStore()

function handleAvatarUpload(file: File) {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isImage) {
    ElMessage.error('请上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    resumeStore.updateBasicInfo({ avatar: e.target?.result as string })
  }
  reader.readAsDataURL(file)
  
  return false
}
</script>

<style lang="scss" scoped>
.basic-info-editor {
  .avatar-section {
    display: flex;
    justify-content: center;
    margin-bottom: $spacing-xl;
    padding-bottom: $spacing-xl;
    border-bottom: 1px solid $color-gray-200;
    
    .avatar-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: $spacing-base;
      
      .avatar {
        border: 3px solid $color-gray-200;
      }
      
      .avatar-uploader {
        :deep(.el-upload) {
          display: block;
        }
      }
    }
  }
}
</style>
