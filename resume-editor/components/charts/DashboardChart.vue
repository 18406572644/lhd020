<template>
  <div class="dashboard-chart-container" ref="chartRef">
    <div v-if="!metrics.length" class="empty-state">
      <el-empty description="暂无指标数据" :image-size="60" />
    </div>
    <div 
      v-else 
      class="metrics-grid"
      :class="{
        'grid-2': config.columns === 2,
        'grid-3': config.columns === 3,
        'grid-4': config.columns === 4
      }"
    >
      <div 
        v-for="(metric, index) in metrics" 
        :key="metric.id"
        class="metric-card"
        @click="$emit('dataPointClick', metric)"
      >
        <div class="metric-icon" :style="{ backgroundColor: colors.colors[index % colors.colors.length] + '20', color: colors.colors[index % colors.colors.length] }">
          <el-icon v-if="metric.icon"><component :is="metric.icon" /></el-icon>
          <el-icon v-else><DataLine /></el-icon>
        </div>
        <div class="metric-content">
          <div class="metric-title">{{ metric.title }}</div>
          <div class="metric-value">
            <span class="value-number">{{ metric.value }}</span>
            <span v-if="metric.unit" class="value-unit">{{ metric.unit }}</span>
          </div>
          <div v-if="metric.target" class="metric-target">
            <el-progress 
              :percentage="Math.min(100, Math.round((Number(metric.value) / metric.target) * 100))"
              :stroke-width="6"
              :color="colors.colors[index % colors.colors.length]"
              :show-text="false"
            />
            <span class="target-text">目标: {{ metric.target }}{{ metric.unit || '' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { DataLine } from '@element-plus/icons-vue'
import type { Chart, DashboardChartConfig, ResumeData, DashboardMetric } from '@/types/resume'
import { useChartData } from '@/composables/useChartData'

const props = defineProps<{
  chart: Chart
  resumeData: ResumeData | null
}>()

const emit = defineEmits<{
  (e: 'dataPointClick', data: any): void
}>()

const chartRef = ref<HTMLDivElement | null>(null)

const { chartColors, transformDashboardData } = useChartData(props.resumeData, props.chart)

const config = computed(() => props.chart.config as DashboardChartConfig)

const metrics = computed<DashboardMetric[]>(() => {
  if (!props.resumeData) return []
  const defaultMetrics: DashboardMetric[] = [
    { id: 'm1', title: '技能总数', value: props.resumeData.skills.length, unit: '项', icon: 'Star' },
    { id: 'm2', title: '工作经历', value: props.resumeData.workExperience.length, unit: '份', icon: 'Briefcase' },
    { id: 'm3', title: '项目经验', value: props.resumeData.projects.length, unit: '个', icon: 'Files' },
    { id: 'm4', title: '教育经历', value: props.resumeData.education.length, unit: '段', icon: 'Reading' },
    { id: 'm5', title: '证书资质', value: props.resumeData.certificates.length, unit: '个', icon: 'Medal' },
    { id: 'm6', title: '平均技能熟练度', value: calculateAverageSkillLevel(), unit: '%', icon: 'TrendCharts' }
  ]

  if (config.value.metrics?.length) {
    const boundMetrics = transformDashboardData([], config.value)
    return boundMetrics.length ? boundMetrics : defaultMetrics
  }

  return defaultMetrics
})

const colors = computed(() => chartColors.value)

function calculateAverageSkillLevel() {
  if (!props.resumeData?.skills.length) return 0
  const sum = props.resumeData.skills.reduce((acc, skill) => acc + skill.level, 0)
  return Math.round(sum / props.resumeData.skills.length)
}

onMounted(() => {
})

watch(
  () => [props.chart.config, props.resumeData?.template, props.resumeData],
  () => {
  },
  { deep: true }
)

defineExpose({
  resize: () => {}
})
</script>

<style lang="scss" scoped>
.dashboard-chart-container {
  width: 100%;
  height: 100%;
  min-height: 200px;
  padding: $spacing-base;
  
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  
  .metrics-grid {
    display: grid;
    gap: $spacing-base;
    height: 100%;
    
    &.grid-2 {
      grid-template-columns: repeat(2, 1fr);
    }
    
    &.grid-3 {
      grid-template-columns: repeat(3, 1fr);
    }
    
    &.grid-4 {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  .metric-card {
    display: flex;
    align-items: center;
    gap: $spacing-base;
    padding: $spacing-base;
    background: $color-white;
    border: 1px solid $color-gray-200;
    border-radius: $border-radius-lg;
    cursor: pointer;
    transition: $transition-base;
    
    &:hover {
      border-color: var(--primary-color, $accent-color);
      box-shadow: $shadow-base;
      transform: translateY(-2px);
    }
    
    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: $border-radius-lg;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      
      .el-icon {
        font-size: 24px;
      }
    }
    
    .metric-content {
      flex: 1;
      min-width: 0;
      
      .metric-title {
        font-size: $font-size-sm;
        color: $color-gray-500;
        margin-bottom: $spacing-xs;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .metric-value {
        display: flex;
        align-items: baseline;
        gap: $spacing-xs;
        
        .value-number {
          font-size: $font-size-xl;
          font-weight: 700;
          color: $color-gray-800;
          line-height: 1.2;
        }
        
        .value-unit {
          font-size: $font-size-sm;
          color: $color-gray-500;
        }
      }
      
      .metric-target {
        margin-top: $spacing-sm;
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        
        .el-progress {
          flex: 1;
          max-width: 120px;
        }
        
        .target-text {
          font-size: $font-size-xs;
          color: $color-gray-500;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
