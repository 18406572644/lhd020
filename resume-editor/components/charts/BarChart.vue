<template>
  <div class="bar-chart-container" ref="chartRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import type { Chart, BarChartConfig, ResumeData } from '@/types/resume'
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

const { boundData, chartColors, transformBarData } = useChartData(props.resumeData, props.chart)

const config = computed(() => props.chart.config as BarChartConfig)

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

  const transformedData = transformBarData(boundData.value, config.value)
  const colors = chartColors.value

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const data = params[0]
        const item = boundData.value[data.dataIndex]
        let html = `<div style="font-weight: 600; margin-bottom: 8px;">${item.name}</div>`
        html += `<div>成果数量: ${data.value} 项</div>`
        if (item.category) html += `<div>角色: ${item.category}</div>`
        return html
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: transformedData.xAxis,
      axisLine: {
        lineStyle: {
          color: colors.secondary + '60'
        }
      },
      axisLabel: {
        color: colors.primary,
        fontSize: 11,
        interval: 0,
        rotate: 25
      },
      axisTick: {
        show: false
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
        color: colors.primary,
        fontSize: 11
      },
      splitLine: {
        show: config.value.showGrid,
        lineStyle: {
          color: colors.secondary + '20',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        type: 'bar',
        data: transformedData.series.map((value, index) => ({
          value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colors.colors[index % colors.colors.length] },
              { offset: 1, color: colors.colors[index % colors.colors.length] + '60' }
            ]),
            borderRadius: [4, 4, 0, 0]
          }
        })),
        barWidth: config.value.barWidth || 40,
        label: config.value.showValue ? {
          show: true,
          position: 'top',
          color: colors.primary,
          fontSize: 12,
          fontWeight: 600,
          formatter: '{c}'
        } : undefined
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
.bar-chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
