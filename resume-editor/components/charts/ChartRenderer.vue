<template>
  <div class="chart-renderer" :style="{ height: chart.height + 'px' }">
    <ClientOnly>
      <RadarChart 
        v-if="chart.type === 'radar'" 
        :chart="chart" 
        :resume-data="resumeData"
        @data-point-click="handleDataPointClick"
        ref="chartInstance"
      />
      <TimelineChart 
        v-else-if="chart.type === 'timeline'" 
        :chart="chart" 
        :resume-data="resumeData"
        @data-point-click="handleDataPointClick"
        ref="chartInstance"
      />
      <BarChart 
        v-else-if="chart.type === 'bar'" 
        :chart="chart" 
        :resume-data="resumeData"
        @data-point-click="handleDataPointClick"
        ref="chartInstance"
      />
      <HeatmapChart 
        v-else-if="chart.type === 'heatmap'" 
        :chart="chart" 
        :resume-data="resumeData"
        @data-point-click="handleDataPointClick"
        ref="chartInstance"
      />
      <DashboardChart 
        v-else-if="chart.type === 'dashboard'" 
        :chart="chart" 
        :resume-data="resumeData"
        @data-point-click="handleDataPointClick"
        ref="chartInstance"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Chart, ResumeData } from '@/types/resume'
import RadarChart from './RadarChart.vue'
import TimelineChart from './TimelineChart.vue'
import BarChart from './BarChart.vue'
import HeatmapChart from './HeatmapChart.vue'
import DashboardChart from './DashboardChart.vue'

const props = defineProps<{
  chart: Chart
  resumeData: ResumeData | null
}>()

const emit = defineEmits<{
  (e: 'dataPointClick', data: any): void
}>()

const chartInstance = ref<InstanceType<typeof RadarChart> | null>(null)

function handleDataPointClick(data: any) {
  emit('dataPointClick', { chart: props.chart, data })
}

defineExpose({
  getChartInstance: () => chartInstance.value?.getChartInstance?.(),
  resize: () => chartInstance.value?.resize?.()
})
</script>

<style lang="scss" scoped>
.chart-renderer {
  width: 100%;
  position: relative;
}
</style>
