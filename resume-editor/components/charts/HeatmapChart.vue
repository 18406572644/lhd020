<template>
  <div class="heatmap-chart-container" ref="chartRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import type { Chart, HeatmapChartConfig, ResumeData } from '@/types/resume'
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

const { boundData, chartColors, transformHeatmapData } = useChartData(props.resumeData, props.chart)

const config = computed(() => props.chart.config as HeatmapChartConfig)

function initChart() {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  chartInstance.on('click', (params: any) => {
    emit('dataPointClick', params)
  })

  updateChart()

  window.addEventListener('resize', handleResize)
}

function getColorScheme() {
  const schemes: Record<string, string[]> = {
    blue: ['#e6f7ff', '#91d5ff', '#69c0ff', '#40a9ff', '#1890ff', '#096dd9', '#0050b3'],
    green: ['#f6ffed', '#b7eb8f', '#95de64', '#73d13d', '#52c41a', '#389e0d', '#237804'],
    orange: ['#fff7e6', '#ffd591', '#ffc069', '#ffa940', '#fa8c16', '#d46b08', '#ad4e00'],
    purple: ['#f9f0ff', '#d3adf7', '#b37feb', '#9254de', '#722ed1', '#531dab', '#391085']
  }
  return schemes[config.value.colorScheme] || schemes.blue
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

  const transformedData = transformHeatmapData(boundData.value, config.value)
  const colors = chartColors.value
  const colorScheme = getColorScheme()

  const option: echarts.EChartsOption = {
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        const [xIndex, yIndex, value] = params.value
        const category = transformedData.xAxis[xIndex]
        const skill = transformedData.yAxis[yIndex]
        return `<div style="font-weight: 600;">${skill}</div>
                <div>分类: ${category}</div>
                <div>熟练度: ${value}%</div>`
      }
    },
    grid: {
      left: '15%',
      right: '10%',
      bottom: '15%',
      top: '5%'
    },
    xAxis: {
      type: 'category',
      data: transformedData.xAxis,
      splitArea: {
        show: true
      },
      axisLine: {
        lineStyle: {
          color: colors.secondary + '60'
        }
      },
      axisLabel: {
        color: colors.primary,
        fontSize: 11,
        rotate: 30
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'category',
      data: transformedData.yAxis,
      splitArea: {
        show: true
      },
      axisLine: {
        lineStyle: {
          color: colors.secondary + '60'
        }
      },
      axisLabel: {
        color: colors.primary,
        fontSize: 11
      },
      axisTick: {
        show: false
      }
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: {
        color: colorScheme
      },
      textStyle: {
        color: colors.primary,
        fontSize: 10
      }
    },
    series: [
      {
        type: 'heatmap',
        data: transformedData.data,
        label: {
          show: true,
          formatter: (params: any) => params.value[2] + '%',
          fontSize: 11,
          color: '#fff',
          textBorderColor: 'rgba(0,0,0,0.3)',
          textBorderWidth: 1
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
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
.heatmap-chart-container {
  width: 100%;
  height: 100%;
  min-height: 350px;
}
</style>
