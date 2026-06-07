<template>
  <el-drawer
    v-model="drawerVisible"
    title="版本历史"
    direction="rtl"
    size="480px"
    :before-close="handleClose"
  >
    <div class="version-history-panel">
      <div class="panel-header">
        <div class="header-info">
          <el-icon :size="20" color="#409eff"><Clock /></el-icon>
          <span class="header-title">共 {{ versionHistoryStore.versionList.length }} 个版本</span>
        </div>
        <div class="header-actions">
          <el-tooltip content="清空历史">
            <el-button
              :disabled="!versionHistoryStore.hasVersions"
              size="small"
              @click="handleClearAll"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="清理过期版本">
            <el-button
              :disabled="!versionHistoryStore.hasVersions"
              size="small"
              @click="handleCleanup"
            >
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <div class="compare-bar" v-if="versionHistoryStore.hasVersions">
        <el-space>
          <el-tag v-if="versionHistoryStore.selectedForCompare.length > 0">
            已选择 {{ versionHistoryStore.selectedForCompare.length }}/2 个版本
          </el-tag>
          <el-button
            size="small"
            type="primary"
            :disabled="versionHistoryStore.selectedForCompare.length !== 2"
            @click="handleCompare"
          >
            <el-icon><DataLine /></el-icon>
            对比版本
          </el-button>
          <el-button
            size="small"
            :disabled="versionHistoryStore.selectedForCompare.length === 0"
            @click="versionHistoryStore.clearCompareSelection()"
          >
            取消选择
          </el-button>
        </el-space>
      </div>

      <div class="version-list" v-loading="versionHistoryStore.loading">
        <template v-if="versionHistoryStore.hasVersions">
          <div
            v-for="(versions, date) in versionHistoryStore.groupedByDate"
            :key="date"
            class="date-group"
          >
            <div class="date-header">
              <el-icon><Calendar /></el-icon>
              <span>{{ formatDate(date) }}</span>
            </div>
            <div class="timeline">
              <div
                v-for="version in versions"
                :key="version.id"
                class="version-item"
                :class="{
                  'selected': versionHistoryStore.selectedForCompare.includes(version.id),
                  'milestone': version.isMilestone
                }"
                @click="handleSelect(version.id)"
              >
                <div class="timeline-dot">
                  <el-icon v-if="version.isMilestone" :size="18" color="#e6a23c">
                    <StarFilled />
                  </el-icon>
                  <el-icon v-else :size="14">
                    <CircleCheck v-if="version.type === 'manual'" />
                    <Timer v-else />
                  </el-icon>
                </div>

                <div class="version-content">
                  <div class="version-header">
                    <div class="version-time">
                      {{ formatTime(version.createdAt) }}
                    </div>
                    <el-tag
                      size="small"
                      :type="version.type === 'manual' ? 'success' : 'info'"
                      effect="light"
                    >
                      {{ version.type === 'manual' ? '手动' : '自动' }}
                    </el-tag>
                    <el-tag
                      v-if="version.isMilestone"
                      size="small"
                      type="warning"
                      effect="light"
                    >
                      里程碑
                    </el-tag>
                  </div>
                  <div class="version-summary">
                    {{ version.summary }}
                  </div>
                  <div class="version-actions" @click.stop>
                    <el-button
                      size="small"
                      text
                      @click="handleRestore(version)"
                    >
                      <el-icon><RefreshRight /></el-icon>
                      恢复
                    </el-button>
                    <el-button
                      size="small"
                      text
                      @click="handleToggleMilestone(version)"
                    >
                      <el-icon>
                        <Star v-if="!version.isMilestone" />
                        <StarFilled v-else />
                      </el-icon>
                      {{ version.isMilestone ? '取消里程碑' : '标记里程碑' }}
                    </el-button>
                    <el-button
                      size="small"
                      text
                      type="danger"
                      @click="handleDelete(version)"
                    >
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <el-empty
          v-else
          description="暂无版本历史"
          :image-size="120"
        >
          <template #description>
            <div class="empty-tips">
              <p>保存简历后将自动生成版本快照</p>
              <p class="sub-tip">支持手动保存和自动保存两种方式</p>
            </div>
          </template>
        </el-empty>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { VersionSnapshot } from '@/types/resume'
import {
  Clock,
  Calendar,
  Star,
  StarFilled,
  Delete,
  Refresh,
  RefreshRight,
  DataLine,
  CircleCheck,
  Timer
} from '@element-plus/icons-vue'

const versionHistoryStore = useVersionHistoryStore()

const drawerVisible = computed({
  get: () => versionHistoryStore.panelVisible,
  set: (val) => {
    if (!val) {
      versionHistoryStore.closePanel()
    } else {
      versionHistoryStore.togglePanel()
    }
  }
})

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function handleSelect(id: string) {
  versionHistoryStore.selectForCompare(id)
}

async function handleRestore(version: VersionSnapshot) {
  try {
    await ElMessageBox.confirm(
      `确定要恢复到 ${formatTime(version.createdAt)} 的版本吗？\n当前未保存的内容将会丢失。`,
      '确认恢复',
      {
        confirmButtonText: '确定恢复',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const success = await versionHistoryStore.restoreVersion(version.id)
    if (success) {
      ElMessage.success('版本恢复成功')
    } else {
      ElMessage.error('版本恢复失败')
    }
  } catch {
    // 用户取消
  }
}

async function handleToggleMilestone(version: VersionSnapshot) {
  const success = await versionHistoryStore.toggleMilestone(version.id)
  if (success) {
    ElMessage.success(
      version.isMilestone ? '已取消里程碑标记' : '已标记为里程碑'
    )
  }
}

async function handleDelete(version: VersionSnapshot) {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个版本吗？删除后无法恢复。',
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const success = await versionHistoryStore.deleteVersion(version.id)
    if (success) {
      ElMessage.success('删除成功')
    } else {
      ElMessage.error('删除失败')
    }
  } catch {
    // 用户取消
  }
}

async function handleClearAll() {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有版本历史吗？此操作不可撤销。',
      '确认清空',
      {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const success = await versionHistoryStore.clearAll()
    if (success) {
      ElMessage.success('已清空所有版本历史')
    }
  } catch {
    // 用户取消
  }
}

async function handleCleanup() {
  const count = await versionHistoryStore.cleanupOldVersions()
  if (count > 0) {
    ElMessage.success(`已清理 ${count} 条过期记录`)
  } else {
    ElMessage.info('没有需要清理的过期记录')
  }
}

async function handleCompare() {
  if (versionHistoryStore.selectedForCompare.length === 2) {
    const [v1, v2] = versionHistoryStore.selectedForCompare
    await versionHistoryStore.compareVersions(v1, v2)
  }
}

function handleClose() {
  versionHistoryStore.closePanel()
}
</script>

<style lang="scss" scoped>
.version-history-panel {
  height: 100%;
  display: flex;
  flex-direction: column;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0 16px;
    border-bottom: 1px solid $border-color-lighter;
    margin-bottom: 16px;

    .header-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: $text-color-primary;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .compare-bar {
    margin-bottom: 16px;
    padding: 12px 16px;
    background: $color-info-lighter;
    border-radius: $border-radius-base;
  }

  .version-list {
    flex: 1;
    overflow-y: auto;
    padding-right: 8px;
  }

  .date-group {
    margin-bottom: 24px;

    .date-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      color: $text-color-secondary;
      font-size: $font-size-sm;
      margin-bottom: 12px;
      position: sticky;
      top: 0;
      background: $color-white;
      z-index: 10;
      padding: 4px 0;
    }
  }

  .timeline {
    position: relative;
    padding-left: 24px;

    &::before {
      content: '';
      position: absolute;
      left: 7px;
      top: 8px;
      bottom: 8px;
      width: 2px;
      background: $border-color-light;
    }
  }

  .version-item {
    position: relative;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: $color-white;
    border: 1px solid $border-color-lighter;
    border-radius: $border-radius-base;
    cursor: pointer;
    transition: $transition-base;

    &:hover {
      border-color: $primary-color;
      box-shadow: $shadow-light;
    }

    &.selected {
      border-color: $primary-color;
      background: $color-primary-lighter;
    }

    &.milestone {
      border-left: 3px solid $color-warning;
    }

    .timeline-dot {
      position: absolute;
      left: -28px;
      top: 16px;
      width: 16px;
      height: 16px;
      background: $color-white;
      border: 2px solid $border-color-light;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
      color: $text-color-secondary;
    }

    .version-content {
      .version-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        .version-time {
          font-weight: 600;
          color: $text-color-primary;
          font-size: $font-size-base;
        }
      }

      .version-summary {
        color: $text-color-secondary;
        font-size: $font-size-sm;
        margin-bottom: 8px;
        line-height: 1.5;
      }

      .version-actions {
        display: flex;
        gap: 4px;
        padding-top: 8px;
        border-top: 1px dashed $border-color-lighter;
      }
    }
  }

  .empty-tips {
    color: $text-color-secondary;
    line-height: 1.8;

    .sub-tip {
      font-size: $font-size-sm;
      color: $text-color-placeholder;
    }
  }
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
}
</style>
