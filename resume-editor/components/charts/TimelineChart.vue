<template>
  <div class="timeline-chart-container" ref="chartRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import type { Chart, TimelineChartConfig, ResumeData } from '@/types/resume'
import { useChartData } from '@/composables/useChartData'

const props = defineProps<{
  chart: Chart
  resumeData: ResumeData | null
}>()

const emit = defineEmits<{
  (e: 'dataPointClick', data: any): void
}>()

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const { boundData, chartColors, transformTimelineData } = useChartData(props.resumeData, props.chart)

const config = computed(() => props.chart.config as TimelineChartConfig)

function initChart() {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  chartInstance.on('click', (params: any) => {
    emit('dataPointClick', params)
  })

  updateChart()

  window.addEventListener('resize', handleResize)
}

function updateChart() {
  if (!chartInstance || !boundData.value.length) {
    if (chartInstance) {
      chartInstance.setOption({
        title: {
          text: '暂无数据',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontSize: 14
          }
        }
      })
    }
    return
  }

  const transformedData = transformTimelineData(boundData.value, config.value)
  const colors = chartColors.value
  const isHorizontal = config.value.orientation === 'horizontal'

  const yAxisData = transformedData.map(item => {
    let label = item.name || '未命名'
    if (config.value.showCompany && item.description) {
      label += ` · ${item.description}`
    }
    if (config.value.showDate && item.date) {
      label += ` (${item.date})`
    }
    return label
  })

  const xAxisData = transformedData.map((item, index) => {
    const date = new Date(item.timestamp)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`
  })

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const data = params[0]
        const item = transformedData[data.dataIndex]
        let html = `<div style="font-weight: 600; margin-bottom: 8px;">${item.name}</div>`
        if (item.description) html += `<div>公司: ${item.description}</div>`
        if (item.date) html += `<div>入职时间: ${item.date}</div>`
        if (item.category) html += `<div>当前职位: ${item.category ? '是' : '否'}</div>`
        return html
      }
    },
    grid: {
      left: '3%',
      right: '8%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLine: {
        lineStyle: {
          color: colors.secondary + '60'
        }
      },
      axisLabel: {
        color: colors.primary,
        fontSize: 11,
        rotate: isHorizontal ? 0 : 45
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      },
      splitLine: {
        show: false
      }
    },
    series: [
      {
        type: 'bar',
        data: transformedData.map((item, index) => ({
          value: transformedData.length - index,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: colors.colors[index % colors.colors.length] + 'CC' },
              { offset: 1, color: colors.colors[index % colors.colors.length] + '60' }
            ]),
            borderRadius: [0, 4, 4, 0]
          }
        })),
        barWidth: 20,
        label: {
          show: true,
          position: 'right',
          formatter: (params: any) => {
            const item = transformedData[params.dataIndex]
            return item.name || ''
          },
          color: colors.primary,
          fontSize: 12,
          fontWeight: 500
        }
      }
    ]
  }

  chartInstance.setOption(option, true)
}

function handleResize() {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
})

watch(
  () => [boundData.value, props.chart.config, props.resumeData?.template],
  () => {
    updateChart()
  },
  { deep: true }
)

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})

defineExpose({
  getChartInstance: () => chartInstance,
  resize: handleResize
})
</script>

<style lang="scss" scoped>
.timeline-chart-container {
  width: 100%;
  height: 100%;
  min-height: 280px;
}
</style>
