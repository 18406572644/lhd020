<template>
  <el-dialog
    v-model="dialogVisible"
    title="版本对比"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="versionHistoryStore.compareResult" class="compare-dialog">
      <div class="compare-header">
        <div class="version-info">
          <div class="version-card">
            <div class="version-label">旧版本</div>
            <div class="version-time">
              {{ formatDateTime(versionHistoryStore.compareResult.version1.createdAt) }}
            </div>
            <el-tag
              size="small"
              :type="versionHistoryStore.compareResult.version1.type === 'manual' ? 'success' : 'info'"
            >
              {{ versionHistoryStore.compareResult.version1.type === 'manual' ? '手动保存' : '自动保存' }}
            </el-tag>
            <el-tag
              v-if="versionHistoryStore.compareResult.version1.isMilestone"
              size="small"
              type="warning"
            >
              里程碑
            </el-tag>
          </div>

          <div class="compare-arrow">
            <el-icon :size="32" color="#409eff"><Right /></el-icon>
          </div>

          <div class="version-card newer">
            <div class="version-label">新版本</div>
            <div class="version-time">
              {{ formatDateTime(versionHistoryStore.compareResult.version2.createdAt) }}
            </div>
            <el-tag
              size="small"
              :type="versionHistoryStore.compareResult.version2.type === 'manual' ? 'success' : 'info'"
            >
              {{ versionHistoryStore.compareResult.version2.type === 'manual' ? '手动保存' : '自动保存' }}
            </el-tag>
            <el-tag
              v-if="versionHistoryStore.compareResult.version2.isMilestone"
              size="small"
              type="warning"
            >
              里程碑
            </el-tag>
          </div>
        </div>

        <div class="stats-bar">
          <div class="stat-item added">
            <el-icon><Plus /></el-icon>
            <span>新增 {{ versionHistoryStore.compareResult.stats.added }}</span>
          </div>
          <div class="stat-item removed">
            <el-icon><Minus /></el-icon>
            <span>删除 {{ versionHistoryStore.compareResult.stats.removed }}</span>
          </div>
          <div class="stat-item modified">
            <el-icon><Edit /></el-icon>
            <span>修改 {{ versionHistoryStore.compareResult.stats.modified }}</span>
          </div>
        </div>
      </div>

      <div class="diff-filters">
        <el-radio-group v-model="filterType" size="small">
          <el-radio-button value="all">全部</el-radio-button>
          <el-radio-button value="added">新增</el-radio-button>
          <el-radio-button value="removed">删除</el-radio-button>
          <el-radio-button value="modified">修改</el-radio-button>
        </el-radio-group>
        <span class="diff-count">
          共 {{ filteredDiffs.length }} 处差异
        </span>
      </div>

      <div class="diff-list" v-loading="versionHistoryStore.loading">
        <template v-if="filteredDiffs.length > 0">
          <div
            v-for="(diff, index) in filteredDiffs"
            :key="index"
            class="diff-item"
            :class="diff.type"
          >
            <div class="diff-header">
              <div class="diff-type">
                <el-icon v-if="diff.type === 'added'" color="#67c23a"><Plus /></el-icon>
                <el-icon v-else-if="diff.type === 'removed'" color="#f56c6c"><Minus /></el-icon>
                <el-icon v-else color="#e6a23c"><Edit /></el-icon>
                <span :class="diff.type">
                  {{ getTypeLabel(diff.type) }}
                </span>
              </div>
              <div class="diff-path">
                <el-icon><Location /></el-icon>
                <span>{{ formatPath(diff.path) }}</span>
              </div>
            </div>

            <div class="diff-content">
              <div class="diff-column" v-if="diff.type !== 'added'">
                <div class="column-label">旧值</div>
                <div class="diff-value removed">
                  <pre>{{ formatValue(diff.oldValue) }}</pre>
                </div>
              </div>

              <div class="diff-arrow" v-if="diff.type === 'modified'">
                <el-icon><Right /></el-icon>
              </div>

              <div class="diff-column" v-if="diff.type !== 'removed'">
                <div class="column-label">新值</div>
                <div class="diff-value added">
                  <pre>{{ formatValue(diff.newValue) }}</pre>
                </div>
              </div>
            </div>
          </div>
        </template>

        <el-empty v-else description="没有差异" :image-size="120">
          <template #description>
            <p>两个版本内容完全相同</p>
          </template>
        </el-empty>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button
        type="primary"
        @click="handleRestoreNewer"
        :disabled="!versionHistoryStore.compareResult"
      >
        <el-icon><RefreshRight /></el-icon>
        恢复到新版本
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { DiffType, FieldDiff } from '@/types/resume'
import {
  Right,
  Plus,
  Minus,
  Edit,
  Location,
  RefreshRight
} from '@element-plus/icons-vue'

const versionHistoryStore = useVersionHistoryStore()

const filterType = ref<'all' | DiffType>('all')

const dialogVisible = computed({
  get: () => versionHistoryStore.compareDialogVisible,
  set: (val) => {
    if (!val) {
      versionHistoryStore.closeCompareDialog()
    }
  }
})

const filteredDiffs = computed(() => {
  if (!versionHistoryStore.compareResult) return []
  if (filterType.value === 'all') {
    return versionHistoryStore.compareResult.diffs
  }
  return versionHistoryStore.compareResult.diffs.filter(
    (d: FieldDiff) => d.type === filterType.value
  )
})

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function getTypeLabel(type: DiffType): string {
  const labels: Record<DiffType, string> = {
    added: '新增',
    removed: '删除',
    modified: '修改'
  }
  return labels[type]
}

const fieldNameMap: Record<string, string> = {
  'basicInfo.name': '姓名',
  'basicInfo.phone': '电话',
  'basicInfo.email': '邮箱',
  'basicInfo.location': '所在城市',
  'basicInfo.website': '个人网站',
  'basicInfo.jobTitle': '求职意向',
  'basicInfo.summary': '个人简介',
  'basicInfo.avatar': '头像',
  'education': '教育经历',
  'workExperience': '工作经历',
  'projects': '项目经历',
  'skills': '技能',
  'certificates': '证书',
  'modules': '模块设置',
  'template': '模板'
}

function formatPath(path: string): string {
  const parts = path.split('.')
  const topPath = parts[0].split('[')[0]
  
  if (fieldNameMap[path]) {
    return fieldNameMap[path]
  }
  
  if (fieldNameMap[topPath]) {
    const indexMatch = path.match(/\[(\d+)\]/)
    if (indexMatch) {
      const index = parseInt(indexMatch[1]) + 1
      const field = parts[parts.length - 1]
      const fieldLabel = getFieldLabel(topPath, field)
      return `${fieldNameMap[topPath]} - 第${index}项${fieldLabel ? ` - ${fieldLabel}` : ''}`
    }
    return fieldNameMap[topPath]
  }
  
  return path
}

function getFieldLabel(category: string, field: string): string {
  const fieldLabels: Record<string, Record<string, string>> = {
    education: {
      school: '学校',
      degree: '学历',
      major: '专业',
      startDate: '开始时间',
      endDate: '结束时间',
      description: '描述'
    },
    workExperience: {
      company: '公司',
      position: '职位',
      startDate: '开始时间',
      endDate: '结束时间',
      current: '在职',
      description: '工作描述',
      highlights: '工作亮点'
    },
    projects: {
      name: '项目名称',
      role: '担任角色',
      startDate: '开始时间',
      endDate: '结束时间',
      description: '项目描述',
      technologies: '技术栈',
      highlights: '项目亮点'
    },
    skills: {
      name: '技能名称',
      level: '熟练程度',
      category: '分类'
    },
    certificates: {
      name: '证书名称',
      issuer: '颁发机构',
      date: '获得时间',
      description: '描述'
    },
    modules: {
      title: '模块标题',
      visible: '是否显示',
      order: '排序'
    }
  }
  
  return fieldLabels[category]?.[field] || ''
}

function formatValue(value: any): string {
  if (value === undefined || value === null) {
    return '(空)'
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }
  if (typeof value === 'boolean') {
    return value ? '是' : '否'
  }
  return String(value)
}

async function handleRestoreNewer() {
  if (!versionHistoryStore.compareResult) return
  
  const version = versionHistoryStore.compareResult.version2
  
  try {
    await ElMessageBox.confirm(
      `确定要恢复到 ${formatDateTime(version.createdAt)} 的版本吗？\n当前未保存的内容将会丢失。`,
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
      handleClose()
    } else {
      ElMessage.error('版本恢复失败')
    }
  } catch {
    // 用户取消
  }
}

function handleClose() {
  versionHistoryStore.closeCompareDialog()
}
</script>

<style lang="scss" scoped>
.compare-dialog {
  .compare-header {
    margin-bottom: 20px;

    .version-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      .version-card {
        flex: 1;
        padding: 16px;
        background: $color-info-lighter;
        border-radius: $border-radius-base;
        text-align: center;
        border: 1px solid $border-color-lighter;

        &.newer {
          background: $color-success-lighter;
          border-color: $color-success-light;
        }

        .version-label {
          font-size: $font-size-sm;
          color: $text-color-secondary;
          margin-bottom: 8px;
        }

        .version-time {
          font-weight: 600;
          font-size: $font-size-base;
          color: $text-color-primary;
          margin-bottom: 8px;
        }
      }

      .compare-arrow {
        padding: 0 24px;
      }
    }

    .stats-bar {
      display: flex;
      gap: 16px;
      padding: 12px 16px;
      background: $color-bg-page;
      border-radius: $border-radius-base;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;

        &.added {
          color: $color-success;
        }

        &.removed {
          color: $color-danger;
        }

        &.modified {
          color: $color-warning;
        }
      }
    }
  }

  .diff-filters {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: $color-bg-page;
    border-radius: $border-radius-base;

    .diff-count {
      font-size: $font-size-sm;
      color: $text-color-secondary;
    }
  }

  .diff-list {
    max-height: 500px;
    overflow-y: auto;
    padding-right: 8px;
  }

  .diff-item {
    margin-bottom: 12px;
    border: 1px solid $border-color-lighter;
    border-radius: $border-radius-base;
    overflow: hidden;

    &.added {
      border-left: 4px solid $color-success;
    }

    &.removed {
      border-left: 4px solid $color-danger;
    }

    &.modified {
      border-left: 4px solid $color-warning;
    }

    .diff-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      background: $color-bg-page;
      border-bottom: 1px solid $border-color-lighter;

      .diff-type {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
        font-size: $font-size-sm;

        &.added,
        .added {
          color: $color-success;
        }

        &.removed,
        .removed {
          color: $color-danger;
        }

        &.modified,
        .modified {
          color: $color-warning;
        }
      }

      .diff-path {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: $font-size-sm;
        color: $text-color-secondary;
      }
    }

    .diff-content {
      display: flex;
      align-items: stretch;
      padding: 12px 16px;
      gap: 12px;

      .diff-column {
        flex: 1;
        min-width: 0;

        .column-label {
          font-size: $font-size-xs;
          color: $text-color-secondary;
          margin-bottom: 6px;
          font-weight: 500;
        }

        .diff-value {
          pre {
            margin: 0;
            padding: 8px 12px;
            border-radius: $border-radius-base;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: $font-size-sm;
            white-space: pre-wrap;
            word-break: break-all;
            max-height: 200px;
            overflow-y: auto;
          }

          &.added pre {
            background: $color-success-lighter;
            color: $color-success;
          }

          &.removed pre {
            background: $color-danger-lighter;
            color: $color-danger;
            text-decoration: line-through;
          }
        }
      }

      .diff-arrow {
        display: flex;
        align-items: center;
        color: $text-color-placeholder;
        padding-top: 24px;
      }
    }
  }
}
</style>
