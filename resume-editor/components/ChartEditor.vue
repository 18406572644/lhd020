<template>
  <div class="chart-editor">
    <div class="section-header">
      <h3 class="section-title">数据可视化图表</h3>
      <el-dropdown @command="handleAddChart" trigger="click">
        <el-button type="primary" size="small">
          <el-icon><Plus /></el-icon>
          添加图表
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="template in chartTemplates" :key="template.id" :command="template.type">
              <el-icon><component :is="template.icon" /></el-icon>
              <span>{{ template.name }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div v-if="!resumeStore.allCharts.length" class="empty-state">
      <el-empty description="暂无图表，点击上方按钮添加" :image-size="80" />
    </div>

    <div v-else class="chart-list" ref="listRef">
      <div
        v-for="(chart, index) in resumeStore.allCharts"
        :key="chart.id"
        class="chart-item"
        :class="{ 'is-disabled': !chart.visible, 'is-dragging': dragIndex === index }"
        draggable="true"
        @dragstart="handleDragStart(index, $event)"
        @dragend="handleDragEnd"
        @dragover.prevent="handleDragOver(index)"
        @drop="handleDrop(index)"
      >
        <div class="chart-item-header">
          <div class="chart-item-info">
            <div class="chart-icon" :class="`chart-icon-${chart.type}`">
              <el-icon><component :is="getChartIcon(chart.type)" /></el-icon>
            </div>
            <div class="chart-item-meta">
              <div class="chart-item-title">{{ chart.title }}</div>
              <div class="chart-item-desc">
                <el-tag size="small" type="info" effect="plain">{{ getChartTypeName(chart.type) }}</el-tag>
                <span class="chart-item-source">数据源: {{ getDataSourceName(chart.dataBinding.source) }}</span>
              </div>
            </div>
          </div>
          <div class="chart-item-actions">
            <el-switch
              :model-value="chart.visible"
              @change="(val) => resumeStore.updateChartVisibility(chart.id, Boolean(val))"
              size="small"
            />
            <el-button size="small" text type="primary" @click="handleEdit(chart)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button size="small" text type="info" @click="handleDuplicate(chart.id)">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
            <el-button size="small" text type="danger" @click="handleDelete(chart.id)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="chart-item-preview">
          <ClientOnly>
            <ChartRenderer :chart="chart" :resume-data="resumeStore.resumeData" />
          </ClientOnly>
        </div>
        <div class="chart-item-drag-handle">
          <el-icon><Rank /></el-icon>
          <span>拖拽排序</span>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="configDialogVisible"
      title="图表配置"
      width="720px"
      :close-on-click-modal="false"
      class="chart-config-dialog"
    >
      <ChartConfigEditor
        v-if="editingChart"
        :chart="editingChart"
        @update="handleChartUpdate"
      />
      <template #footer>
        <el-button @click="configDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowDown, Edit, Delete, CopyDocument, Rank, Clock, DataLine, Histogram, Odometer } from '@element-plus/icons-vue'
import type { Chart, ChartType } from '@/types/resume'
import { chartTemplates } from '@/data/mockData'
import ChartRenderer from './charts/ChartRenderer.vue'
import ChartConfigEditor from './ChartConfigEditor.vue'

const resumeStore = useResumeStore()
const configDialogVisible = ref(false)
const editingChart = ref<Chart | null>(null)
const listRef = ref<HTMLElement | null>(null)
const dragIndex = ref<number | null>(null)

const iconMap: Record<ChartType, any> = {
  radar: DataLine,
  timeline: Clock,
  bar: Histogram,
  heatmap: DataLine,
  dashboard: Odometer
}

const typeNameMap: Record<ChartType, string> = {
  radar: '雷达图',
  timeline: '时间线',
  bar: '柱状图',
  heatmap: '热力图',
  dashboard: '仪表盘'
}

const dataSourceMap: Record<string, string> = {
  skills: '技能数据',
  workExperience: '工作经历',
  projects: '项目经历',
  education: '教育经历',
  certificates: '证书资质',
  basicInfo: '基本信息'
}

function getChartIcon(type: ChartType) {
  return iconMap[type] || DataLine
}

function getChartTypeName(type: ChartType) {
  return typeNameMap[type] || type
}

function getDataSourceName(source: string) {
  return dataSourceMap[source] || source
}

function handleAddChart(type: ChartType) {
  const newChart = resumeStore.addChart(type)
  if (newChart) {
    ElMessage.success('图表添加成功')
    setTimeout(() => {
      handleEdit(newChart)
    }, 300)
  }
}

function handleEdit(chart: Chart) {
  editingChart.value = { ...chart }
  configDialogVisible.value = true
}

function handleChartUpdate(updates: Partial<Chart>) {
  if (editingChart.value) {
    resumeStore.updateChart(editingChart.value.id, updates)
    editingChart.value = { ...editingChart.value, ...updates }
    ElMessage.success('配置已更新')
  }
}

function handleDuplicate(id: string) {
  const newChart = resumeStore.duplicateChart(id)
  if (newChart) {
    ElMessage.success('图表已复制')
  }
}

async function handleDelete(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除这个图表吗？', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    resumeStore.removeChart(id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

function handleDragStart(index: number, event: DragEvent) {
  dragIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function handleDragEnd() {
  dragIndex.value = null
}

function handleDragOver(index: number) {
  if (dragIndex.value === null || dragIndex.value === index) return
  
  const charts = [...resumeStore.allCharts]
  const dragItem = charts[dragIndex.value]
  charts.splice(dragIndex.value, 1)
  charts.splice(index, 0, dragItem)
  
  const orders = charts.map((chart, i) => ({ id: chart.id, order: i }))
  resumeStore.updateChartOrder(orders)
  dragIndex.value = index
}

function handleDrop(index: number) {
  dragIndex.value = null
}
</script>

<style lang="scss" scoped>
.chart-editor {
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
  
  .chart-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-base;
  }
  
  .chart-item {
    border: 1px solid $color-gray-200;
    border-radius: $border-radius-base;
    overflow: hidden;
    transition: $transition-base;
    background: $color-white;
    
    &.is-disabled {
      opacity: 0.6;
      
      .chart-item-preview {
        filter: grayscale(1);
      }
    }
    
    &.is-dragging {
      opacity: 0.8;
      transform: scale(1.02);
      box-shadow: $shadow-lg;
    }
    
    &:hover {
      border-color: $accent-color;
      box-shadow: $shadow-sm;
    }
    
    .chart-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: $spacing-base;
      background: $color-gray-50;
      border-bottom: 1px solid $color-gray-100;
      
      .chart-item-info {
        display: flex;
        align-items: center;
        gap: $spacing-base;
        
        .chart-icon {
          width: 40px;
          height: 40px;
          border-radius: $border-radius-base;
          display: flex;
          align-items: center;
          justify-content: center;
          
          &.chart-icon-radar { background: #e6f7ff; color: #1890ff; }
          &.chart-icon-timeline { background: #f6ffed; color: #52c41a; }
          &.chart-icon-bar { background: #fff7e6; color: #fa8c16; }
          &.chart-icon-heatmap { background: #f9f0ff; color: #722ed1; }
          &.chart-icon-dashboard { background: #fff1f0; color: #f5222d; }
          
          .el-icon {
            font-size: 20px;
          }
        }
        
        .chart-item-meta {
          .chart-item-title {
            font-weight: 600;
            color: $color-gray-800;
            margin-bottom: $spacing-xs;
          }
          
          .chart-item-desc {
            display: flex;
            align-items: center;
            gap: $spacing-sm;
            
            .chart-item-source {
              font-size: $font-size-sm;
              color: $color-gray-500;
            }
          }
        }
      }
      
      .chart-item-actions {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
      }
    }
    
    .chart-item-preview {
      padding: $spacing-base;
      background: $color-white;
    }
    
    .chart-item-drag-handle {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: $spacing-xs;
      padding: $spacing-sm;
      background: $color-gray-50;
      border-top: 1px solid $color-gray-100;
      font-size: $font-size-xs;
      color: $color-gray-400;
      cursor: grab;
      
      &:active {
        cursor: grabbing;
      }
    }
  }
}

:deep(.chart-config-dialog) {
  .el-dialog__body {
    padding-top: 0;
  }
}
</style>
