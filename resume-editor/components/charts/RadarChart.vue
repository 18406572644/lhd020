<template>
  <div class="radar-chart-container" ref="chartRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import type { Chart, RadarChartConfig, ResumeData } from '@/types/resume'
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

const { boundData, chartColors, transformRadarData } = useChartData(props.resumeData, props.chart)

const config = computed(() => props.chart.config as RadarChartConfig)

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

  const transformedData = transformRadarData(boundData.value, config.value)
  const colors = chartColors.value

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (Array.isArray(params.value)) {
          const values = params.value as number[]
          return values.map((val, i) => {
            const indicator = transformedData.indicator[i]
            return `${indicator.name}: ${val}%`
          }).join('<br/>')
        }
        return `${params.name}: ${params.value}`
      }
    },
    radar: {
      indicator: transformedData.indicator,
      center: ['50%', '50%'],
      radius: '65%',
      splitNumber: 4,
      axisName: {
        color: colors.primary,
        fontSize: 12
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.05)']
        }
      },
      axisLine: {
        lineStyle: {
          color: colors.secondary + '40'
        }
      },
      splitLine: {
        lineStyle: {
          color: colors.secondary + '30'
        }
      }
    },
    series: [{
      type: 'radar',
      data: transformedData.data.map((item, index) => ({
        value: item.value,
        name: item.name,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colors.colors[index % colors.colors.length] + '60' },
            { offset: 1, color: colors.colors[index % colors.colors.length] + '20' }
          ])
        },
        lineStyle: {
          color: colors.colors[index % colors.colors.length],
          width: 2
        },
        itemStyle: {
          color: colors.colors[index % colors.colors.length]
        },
        label: config.value.showLabel ? {
          show: true,
          formatter: '{c}%',
          color: colors.primary
        } : undefined
      }))
    }]
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
.radar-chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
