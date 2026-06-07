import { computed } from 'vue'
import type { DataBindingConfig, Chart, ResumeData, Skill, WorkExperience, Project, RadarChartConfig, BarChartConfig, HeatmapChartConfig, TimelineChartConfig, DashboardChartConfig } from '@/types/resume'

export function useChartData(resumeData: ResumeData | null, chart: Chart) {
  const boundData = computed(() => {
    if (!resumeData || !chart.dataBinding) return []
    return getBoundData(resumeData, chart.dataBinding)
  })

  const chartColors = computed(() => {
    const template = resumeData ? getTemplateColors(resumeData.template) : null
    return template || {
      primary: '#2d3436',
      secondary: '#0984e3',
      accent: '#74b9ff',
      colors: ['#0984e3', '#00b894', '#fdcb6e', '#e17055', '#6c5ce7', '#fd79a8']
    }
  })

  function getTemplateColors(templateId: string) {
    const templates: Record<string, any> = {
      classic: {
        primary: '#1a1a2e',
        secondary: '#16213e',
        accent: '#0f3460',
        colors: ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#533483', '#e94560']
      },
      modern: {
        primary: '#2d3436',
        secondary: '#0984e3',
        accent: '#74b9ff',
        colors: ['#0984e3', '#00b894', '#fdcb6e', '#e17055', '#6c5ce7', '#fd79a8']
      },
      minimal: {
        primary: '#000000',
        secondary: '#636e72',
        accent: '#2d3436',
        colors: ['#2d3436', '#636e72', '#b2bec3', '#dfe6e9', '#000000', '#636e72']
      },
      creative: {
        primary: '#6c5ce7',
        secondary: '#a29bfe',
        accent: '#fd79a8',
        colors: ['#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e', '#00b894', '#74b9ff']
      }
    }
    return templates[templateId] || templates.modern
  }

  function getBoundData(data: ResumeData, binding: DataBindingConfig): any[] {
    let sourceData: any[] = []

    switch (binding.source) {
      case 'skills':
        sourceData = data.skills
        break
      case 'workExperience':
        sourceData = data.workExperience
        break
      case 'projects':
        sourceData = data.projects
        break
      case 'education':
        sourceData = data.education
        break
      case 'certificates':
        sourceData = data.certificates
        break
      case 'basicInfo':
        sourceData = [data.basicInfo]
        break
      default:
        sourceData = []
    }

    if (binding.filter?.category) {
      sourceData = sourceData.filter(item => 
        item.category === binding.filter?.category
      )
    }

    if (binding.filter?.limit && binding.filter.limit > 0) {
      sourceData = sourceData.slice(0, binding.filter.limit)
    }

    return sourceData.map(item => {
      const result: any = {}
      if (binding.fields.name) result.name = getNestedValue(item, binding.fields.name)
      if (binding.fields.value) result.value = getNestedValue(item, binding.fields.value)
      if (binding.fields.category) result.category = getNestedValue(item, binding.fields.category)
      if (binding.fields.date) result.date = getNestedValue(item, binding.fields.date)
      if (binding.fields.description) result.description = getNestedValue(item, binding.fields.description)
      return result
    })
  }

  function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => acc?.[key], obj)
  }

  function transformRadarData(data: any[], config: RadarChartConfig) {
    const indicators = data.map(item => ({
      name: item.name || '未命名',
      max: config.indicators?.find(i => i.name === item.name)?.max || 100
    }))

    const values = data.map(item => Number(item.value) || 0)

    return {
      indicator: indicators.length > 0 ? indicators : [{ name: '暂无数据', max: 100 }],
      data: [{ value: values.length > 0 ? values : [0], name: '技能熟练度' }]
    }
  }

  function transformBarData(data: any[], config: BarChartConfig) {
    return {
      xAxis: data.map(item => item.name || '未命名'),
      series: data.map(item => {
        const val = item.value
        return Array.isArray(val) ? val.length : (Number(val) || 0)
      })
    }
  }

  function transformHeatmapData(data: any[], config: HeatmapChartConfig) {
    const categories = [...new Set(data.map(item => item.category || '未分类'))]
    const names = [...new Set(data.map(item => item.name || '未命名'))]

    const heatmapData: number[][] = []
    names.forEach((name, yIndex) => {
      categories.forEach((cat, xIndex) => {
        const item = data.find(d => d.name === name && d.category === cat)
        heatmapData.push([xIndex, yIndex, item?.value || 0])
      })
    })

    return {
      xAxis: categories,
      yAxis: names,
      data: heatmapData
    }
  }

  function transformTimelineData(data: any[], config: TimelineChartConfig) {
    return data.map((item, index) => ({
      ...item,
      timestamp: parseDate(item.date),
      index
    })).sort((a, b) => b.timestamp - a.timestamp)
  }

  function parseDate(dateStr: string): number {
    if (!dateStr) return 0
    const parts = dateStr.split('-')
    if (parts.length === 2) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1).getTime()
    }
    return new Date(dateStr).getTime()
  }

  function transformDashboardData(data: any[], config: DashboardChartConfig) {
    return config.metrics.map(metric => {
      if (metric.dataBinding) {
        const boundValue = getBoundDataForMetric(metric.dataBinding)
        return { ...metric, value: boundValue ?? metric.value }
      }
      return metric
    })
  }

  function getBoundDataForMetric(binding: DataBindingConfig): any {
    if (!resumeData) return null
    const data = getBoundData(resumeData, binding)
    if (data.length === 0) return null
    if (binding.fields.value) {
      return data[0]?.value ?? data[0]
    }
    return data.length
  }

  return {
    boundData,
    chartColors,
    transformRadarData,
    transformBarData,
    transformHeatmapData,
    transformTimelineData,
    transformDashboardData
  }
}
