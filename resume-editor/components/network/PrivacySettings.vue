<template>
  <div class="privacy-settings-wrapper">
    <div class="settings-header">
      <h3><el-icon><Lock /></el-icon> 隐私设置</h3>
      <p class="header-desc">控制您的哪些信息可以被人脉搜索到，保护您的隐私安全</p>
    </div>

    <div class="settings-content">
      <el-form :model="settings" class="settings-form">
        <div class="settings-section">
          <h4 class="section-title">
            <el-icon><View /></el-icon> 个人信息可见性
          </h4>
          <div class="form-items-grid">
            <el-form-item>
              <el-switch 
                v-model="settings.showRealName" 
                active-text="显示真实姓名" 
                inactive-text="隐藏真实姓名"
              />
            </el-form-item>
            <el-form-item>
              <el-switch 
                v-model="settings.showCurrentCompany" 
                active-text="显示当前公司" 
                inactive-text="隐藏当前公司"
              />
            </el-form-item>
            <el-form-item>
              <el-switch 
                v-model="settings.showCurrentPosition" 
                active-text="显示当前职位" 
                inactive-text="隐藏当前职位"
              />
            </el-form-item>
            <el-form-item>
              <el-switch 
                v-model="settings.showWorkHistory" 
                active-text="显示工作经历" 
                inactive-text="隐藏工作经历"
              />
            </el-form-item>
            <el-form-item>
              <el-switch 
                v-model="settings.showEducation" 
                active-text="显示教育经历" 
                inactive-text="隐藏教育经历"
              />
            </el-form-item>
            <el-form-item>
              <el-switch 
                v-model="settings.showSkills" 
                active-text="显示技能标签" 
                inactive-text="隐藏技能标签"
              />
            </el-form-item>
            <el-form-item>
              <el-switch 
                v-model="settings.showProjects" 
                active-text="显示项目经历" 
                inactive-text="隐藏项目经历"
              />
            </el-form-item>
            <el-form-item>
              <el-switch 
                v-model="settings.showContactInfo" 
                active-text="显示联系方式" 
                inactive-text="隐藏联系方式"
              />
            </el-form-item>
          </div>
        </div>

        <el-divider />

        <div class="settings-section">
          <h4 class="section-title">
            <el-icon><Search /></el-icon> 搜索发现设置
          </h4>
          <div class="form-items-grid">
            <el-form-item>
              <el-switch 
                v-model="settings.allowSearchBySchool" 
                active-text="允许通过学校搜索到我" 
                inactive-text="禁止通过学校搜索到我"
              />
            </el-form-item>
            <el-form-item>
              <el-switch 
                v-model="settings.allowSearchByCompany" 
                active-text="允许通过公司搜索到我" 
                inactive-text="禁止通过公司搜索到我"
              />
            </el-form-item>
            <el-form-item>
              <el-switch 
                v-model="settings.allowSearchBySkill" 
                active-text="允许通过技能搜索到我" 
                inactive-text="禁止通过技能搜索到我"
              />
            </el-form-item>
            <el-form-item>
              <el-switch 
                v-model="settings.receiveReferralRequests" 
                active-text="接收内推请求" 
                inactive-text="拒绝内推请求"
              />
            </el-form-item>
          </div>
        </div>

        <el-divider />

        <div class="settings-section">
          <h4 class="section-title">
            <el-icon><User /></el-icon> 匿名模式
          </h4>
          <div class="anonymous-mode-section">
            <el-alert 
              title="匿名模式" 
              type="warning" 
              :closable="false"
              show-icon
            >
              <template #default>
                开启匿名模式后，您的真实姓名将被隐藏，其他用户只能看到您的匿名头衔（如"某大厂高级工程师"），但您仍然可以正常使用人脉网络的所有功能。
              </template>
            </el-alert>
            <div class="anonymous-toggle">
              <el-switch 
                v-model="settings.anonymousMode" 
                size="large"
                active-text="已开启匿名模式" 
                inactive-text="点击开启匿名模式"
              />
            </div>
            <div class="anonymous-preview" v-if="settings.anonymousMode">
              <h5>您的匿名展示效果预览：</h5>
              <div class="preview-card">
                <el-avatar :size="48">匿</el-avatar>
                <div class="preview-info">
                  <div class="preview-name">某大厂高级工程师</div>
                  <div class="preview-company">**跳动</div>
                  <div class="preview-position">高级前端工程师</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="settings-section">
          <h4 class="section-title">
            <el-icon><DataLine /></el-icon> 数据管理
          </h4>
          <div class="data-management">
            <el-button type="warning" @click="exportData">
              <el-icon><Download /></el-icon> 导出我的数据
            </el-button>
            <el-button type="danger" @click="confirmDeleteData">
              <el-icon><Delete /></el-icon> 删除我的数据
            </el-button>
          </div>
        </div>
      </el-form>
    </div>

    <div class="settings-footer">
      <el-button @click="resetSettings">
        <el-icon><Refresh /></el-icon> 恢复默认
      </el-button>
      <el-button type="primary" :loading="saving" @click="saveSettings">
        <el-icon><Check /></el-icon> 保存设置
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Lock, View, Search, User, DataLine, Download, Delete, Refresh, Check } from '@element-plus/icons-vue'
import type { PrivacySettings } from '@/types/network'
import { defaultPrivacySettings } from '@/data/networkData'

const networkStore = useNetworkStore()

const saving = ref(false)

const settings = reactive<PrivacySettings>({
  ...defaultPrivacySettings
})

watch(() => networkStore.privacySettings, (newSettings) => {
  Object.assign(settings, newSettings)
}, { deep: true, immediate: true })

async function saveSettings() {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    networkStore.updatePrivacySettings({ ...settings })
    ElMessage.success('隐私设置已保存')
  } finally {
    saving.value = false
  }
}

function resetSettings() {
  ElMessageBox.confirm(
    '确定要恢复默认隐私设置吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    Object.assign(settings, defaultPrivacySettings)
    ElMessage.success('已恢复默认设置')
  }).catch(() => {})
}

function exportData() {
  ElMessage.info('数据导出功能开发中...')
}

function confirmDeleteData() {
  ElMessageBox.confirm(
    '此操作将永久删除您在人脉网络中的所有数据，且无法恢复。确定继续吗？',
    '警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'error',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    ElMessage.success('数据删除请求已提交')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.privacy-settings-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: $color-white;
  border-radius: $spacing-xs;
  overflow: hidden;

  .settings-header {
    padding: $spacing-base $spacing-xl;
    border-bottom: 1px solid $color-gray-200;
    background: $color-gray-50;

    h3 {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      margin: 0 0 $spacing-xs 0;
      font-size: $font-size-lg;
      font-weight: 600;

      .el-icon {
        color: $primary-color;
      }
    }

    .header-desc {
      margin: 0;
      font-size: $font-size-sm;
      color: $color-gray-500;
    }
  }

  .settings-content {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-xl;

    .settings-form {
      .settings-section {
        margin-bottom: $spacing-lg;

        .section-title {
          display: flex;
          align-items: center;
          gap: $spacing-xs;
          margin: 0 0 $spacing-base 0;
          font-size: $font-size-base;
          font-weight: 600;
          color: $color-gray-800;

          .el-icon {
            color: $primary-color;
          }
        }

        .form-items-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: $spacing-base $spacing-2xl;

          .el-form-item {
            margin-bottom: 0;

            :deep(.el-form-item__content) {
              justify-content: space-between;
            }
          }
        }

        .anonymous-mode-section {
          .anonymous-toggle {
            margin: $spacing-base 0;
            padding: $spacing-base;
            background: $color-gray-50;
            border-radius: $spacing-xs;
            display: flex;
            justify-content: center;
          }

          .anonymous-preview {
            margin-top: $spacing-base;

            h5 {
              margin: 0 0 $spacing-sm 0;
              font-size: $font-size-sm;
              font-weight: 500;
              color: $color-gray-700;
            }

            .preview-card {
              display: flex;
              gap: $spacing-base;
              align-items: center;
              padding: $spacing-base;
              background: $color-gray-50;
              border: 1px dashed $color-gray-300;
              border-radius: $spacing-xs;

              .preview-info {
                .preview-name {
                  font-weight: 600;
                  color: $color-gray-800;
                }

                .preview-company {
                  color: $primary-color;
                  font-size: $font-size-sm;
                  margin: $spacing-xs 0;
                }

                .preview-position {
                  color: $color-gray-600;
                  font-size: $font-size-sm;
                }
              }
            }
          }
        }

        .data-management {
          display: flex;
          gap: $spacing-base;
        }
      }
    }
  }

  .settings-footer {
    padding: $spacing-base $spacing-xl;
    border-top: 1px solid $color-gray-200;
    background: $color-gray-50;
    display: flex;
    justify-content: flex-end;
    gap: $spacing-sm;
  }
}
</style>
