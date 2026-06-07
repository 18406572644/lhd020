import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ResumeData, TemplateConfig, ModuleType, Education, WorkExperience, Project, Skill, Certificate, SnapshotType, Chart, ChartType, ChartConfig, DataBindingConfig } from '@/types/resume'
import { resumeApi, savedResumesApi, exportApi, versionHistoryApi } from '@/services/resumeApi'
import { generateId, chartTemplates } from '@/data/mockData'

export const useResumeStore = defineStore('resume', () => {
  const resumeData = ref<ResumeData | null>(null)
  const templates = ref<TemplateConfig[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const lastSavedAt = ref<string | null>(null)

  const currentTemplate = computed(() => {
    if (!resumeData.value) return null
    return templates.value.find(t => t.id === resumeData.value!.template)
  })

  const sortedModules = computed(() => {
    if (!resumeData.value) return []
    return [...resumeData.value.modules]
      .filter(m => m.visible)
      .sort((a, b) => a.order - b.order)
  })

  async function initResume() {
    loading.value = true
    try {
      const [resumeRes, templatesRes] = await Promise.all([
        resumeApi.getResume(),
        resumeApi.getTemplates()
      ])
      if (resumeRes.success && resumeRes.data) {
        resumeData.value = resumeRes.data
      }
      if (templatesRes.success && templatesRes.data) {
        templates.value = templatesRes.data
      }
    } finally {
      loading.value = false
    }
  }

  async function saveResume(type: SnapshotType = 'manual') {
    if (!resumeData.value) return
    saving.value = true
    try {
      const res = await resumeApi.saveResume(resumeData.value)
      if (res.success && res.data) {
        lastSavedAt.value = res.data.savedAt
        await versionHistoryApi.createSnapshot(resumeData.value, type)
        return true
      }
      return false
    } finally {
      saving.value = false
    }
  }

  async function autoSave() {
    return saveResume('auto')
  }

  async function resetResume() {
    loading.value = true
    try {
      const res = await resumeApi.resetResume()
      if (res.success && res.data) {
        resumeData.value = res.data
        lastSavedAt.value = null
        return true
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function switchTemplate(templateId: string) {
    if (!resumeData.value) return
    const res = await resumeApi.switchTemplate(templateId)
    if (res.success) {
      resumeData.value.template = templateId as any
    }
  }

  function updateBasicInfo(info: Partial<ResumeData['basicInfo']>) {
    if (!resumeData.value) return
    resumeData.value.basicInfo = { ...resumeData.value.basicInfo, ...info }
  }

  function updateModuleVisibility(moduleId: string, visible: boolean) {
    if (!resumeData.value) return
    const module = resumeData.value.modules.find(m => m.id === moduleId)
    if (module) {
      module.visible = visible
    }
  }

  function updateModuleOrder(modules: { id: string; order: number }[]) {
    if (!resumeData.value) return
    modules.forEach(({ id, order }) => {
      const module = resumeData.value!.modules.find(m => m.id === id)
      if (module) {
        module.order = order
      }
    })
  }

  function addEducation(edu: Omit<Education, 'id'>) {
    if (!resumeData.value) return
    resumeData.value.education.push({ ...edu, id: generateId() })
  }

  function updateEducation(id: string, edu: Partial<Education>) {
    if (!resumeData.value) return
    const index = resumeData.value.education.findIndex(e => e.id === id)
    if (index !== -1) {
      resumeData.value.education[index] = { ...resumeData.value.education[index], ...edu }
    }
  }

  function removeEducation(id: string) {
    if (!resumeData.value) return
    resumeData.value.education = resumeData.value.education.filter(e => e.id !== id)
  }

  function addWorkExperience(work: Omit<WorkExperience, 'id'>) {
    if (!resumeData.value) return
    resumeData.value.workExperience.push({ ...work, id: generateId() })
  }

  function updateWorkExperience(id: string, work: Partial<WorkExperience>) {
    if (!resumeData.value) return
    const index = resumeData.value.workExperience.findIndex(w => w.id === id)
    if (index !== -1) {
      resumeData.value.workExperience[index] = { ...resumeData.value.workExperience[index], ...work }
    }
  }

  function removeWorkExperience(id: string) {
    if (!resumeData.value) return
    resumeData.value.workExperience = resumeData.value.workExperience.filter(w => w.id !== id)
  }

  function addProject(project: Omit<Project, 'id'>) {
    if (!resumeData.value) return
    resumeData.value.projects.push({ ...project, id: generateId() })
  }

  function updateProject(id: string, project: Partial<Project>) {
    if (!resumeData.value) return
    const index = resumeData.value.projects.findIndex(p => p.id === id)
    if (index !== -1) {
      resumeData.value.projects[index] = { ...resumeData.value.projects[index], ...project }
    }
  }

  function removeProject(id: string) {
    if (!resumeData.value) return
    resumeData.value.projects = resumeData.value.projects.filter(p => p.id !== id)
  }

  function addSkill(skill: Omit<Skill, 'id'>) {
    if (!resumeData.value) return
    resumeData.value.skills.push({ ...skill, id: generateId() })
  }

  function updateSkill(id: string, skill: Partial<Skill>) {
    if (!resumeData.value) return
    const index = resumeData.value.skills.findIndex(s => s.id === id)
    if (index !== -1) {
      resumeData.value.skills[index] = { ...resumeData.value.skills[index], ...skill }
    }
  }

  function removeSkill(id: string) {
    if (!resumeData.value) return
    resumeData.value.skills = resumeData.value.skills.filter(s => s.id !== id)
  }

  function addCertificate(cert: Omit<Certificate, 'id'>) {
    if (!resumeData.value) return
    resumeData.value.certificates.push({ ...cert, id: generateId() })
  }

  function updateCertificate(id: string, cert: Partial<Certificate>) {
    if (!resumeData.value) return
    const index = resumeData.value.certificates.findIndex(c => c.id === id)
    if (index !== -1) {
      resumeData.value.certificates[index] = { ...resumeData.value.certificates[index], ...cert }
    }
  }

  function removeCertificate(id: string) {
    if (!resumeData.value) return
    resumeData.value.certificates = resumeData.value.certificates.filter(c => c.id !== id)
  }

  function setResumeData(data: ResumeData) {
    resumeData.value = data
  }

  async function saveToLibrary(name: string, thumbnail: string = '') {
    if (!resumeData.value) return
    saving.value = true
    try {
      const res = await savedResumesApi.save(name, resumeData.value, thumbnail)
      return res
    } finally {
      saving.value = false
    }
  }

  async function loadFromLibrary(id: string) {
    loading.value = true
    try {
      const res = await savedResumesApi.getById(id)
      if (res.success && res.data) {
        resumeData.value = res.data.data
        return true
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function exportJSON() {
    if (!resumeData.value) return
    const res = await exportApi.exportJSON(resumeData.value)
    if (res.success && res.data) {
      const a = document.createElement('a')
      a.href = res.data.url
      a.download = res.data.filename
      a.click()
      URL.revokeObjectURL(res.data.url)
    }
  }

  async function importJSON(file: File) {
    const res = await exportApi.importJSON(file)
    if (res.success && res.data) {
      resumeData.value = res.data
      return true
    }
    return false
  }

  // ==================== 图表管理方法 ====================

  const sortedCharts = computed(() => {
    if (!resumeData.value?.charts) return []
    return [...resumeData.value.charts]
      .filter(c => c.visible)
      .sort((a, b) => a.order - b.order)
  })

  const allCharts = computed(() => {
    if (!resumeData.value?.charts) return []
    return [...resumeData.value.charts]
      .sort((a, b) => a.order - b.order)
  })

  function addChart(type: ChartType, title?: string) {
    if (!resumeData.value) return null

    if (!resumeData.value.charts) {
      resumeData.value.charts = []
    }

    const template = chartTemplates.find(t => t.type === type)
    const now = new Date().toISOString()
    const maxOrder = resumeData.value.charts.reduce((max, c) => Math.max(max, c.order), -1)

    const newChart: Chart = {
      id: generateId(),
      type,
      title: title || template?.name || `未命名图表`,
      description: template?.description || '',
      dataBinding: template ? { ...template.defaultDataBinding } : {
        source: 'skills',
        fields: { name: 'name', value: 'level' }
      },
      config: template ? { ...template.defaultConfig } : getDefaultConfig(type),
      width: 100,
      height: type === 'dashboard' ? 240 : type === 'heatmap' ? 360 : 320,
      visible: true,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now
    }

    resumeData.value.charts.push(newChart)
    return newChart
  }

  function getDefaultConfig(type: ChartType): ChartConfig {
    switch (type) {
      case 'radar':
        return { type: 'radar', indicators: [], showLegend: false, showLabel: true }
      case 'timeline':
        return { type: 'timeline', orientation: 'vertical', showDate: true, showCompany: true }
      case 'bar':
        return { type: 'bar', xAxisField: 'name', yAxisField: 'value', showGrid: true, showValue: true, barWidth: 40 }
      case 'heatmap':
        return { type: 'heatmap', xField: 'category', yField: 'name', valueField: 'level', colorScheme: 'blue' }
      case 'dashboard':
        return { type: 'dashboard', metrics: [], layout: 'grid', columns: 3 }
      default:
        return { type: 'radar', indicators: [], showLegend: false, showLabel: true }
    }
  }

  function updateChart(id: string, updates: Partial<Chart>) {
    if (!resumeData.value?.charts) return
    const index = resumeData.value.charts.findIndex(c => c.id === id)
    if (index !== -1) {
      resumeData.value.charts[index] = {
        ...resumeData.value.charts[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
    }
  }

  function updateChartConfig(id: string, config: Partial<ChartConfig>) {
    if (!resumeData.value?.charts) return
    const chart = resumeData.value.charts.find(c => c.id === id)
    if (chart) {
      chart.config = { ...chart.config, ...config } as ChartConfig
      chart.updatedAt = new Date().toISOString()
    }
  }

  function updateChartDataBinding(id: string, dataBinding: Partial<DataBindingConfig>) {
    if (!resumeData.value?.charts) return
    const chart = resumeData.value.charts.find(c => c.id === id)
    if (chart) {
      chart.dataBinding = { ...chart.dataBinding, ...dataBinding }
      chart.updatedAt = new Date().toISOString()
    }
  }

  function removeChart(id: string) {
    if (!resumeData.value?.charts) return
    resumeData.value.charts = resumeData.value.charts.filter(c => c.id !== id)
    reorderCharts()
  }

  function updateChartVisibility(id: string, visible: boolean) {
    if (!resumeData.value?.charts) return
    const chart = resumeData.value.charts.find(c => c.id === id)
    if (chart) {
      chart.visible = visible
      chart.updatedAt = new Date().toISOString()
    }
  }

  function updateChartOrder(chartOrders: { id: string; order: number }[]) {
    if (!resumeData.value?.charts) return
    chartOrders.forEach(({ id, order }) => {
      const chart = resumeData.value!.charts!.find(c => c.id === id)
      if (chart) {
        chart.order = order
      }
    })
  }

  function reorderCharts() {
    if (!resumeData.value?.charts) return
    resumeData.value.charts.forEach((chart, index) => {
      chart.order = index
    })
  }

  function duplicateChart(id: string) {
    if (!resumeData.value?.charts) return null
    const chart = resumeData.value.charts.find(c => c.id === id)
    if (!chart) return null

    const newChart: Chart = {
      ...JSON.parse(JSON.stringify(chart)),
      id: generateId(),
      title: chart.title + ' (副本)',
      order: resumeData.value.charts.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    resumeData.value.charts.push(newChart)
    return newChart
  }

  return {
    resumeData,
    templates,
    loading,
    saving,
    lastSavedAt,
    currentTemplate,
    sortedModules,
    sortedCharts,
    allCharts,
    initResume,
    saveResume,
    autoSave,
    resetResume,
    switchTemplate,
    updateBasicInfo,
    updateModuleVisibility,
    updateModuleOrder,
    addEducation,
    updateEducation,
    removeEducation,
    addWorkExperience,
    updateWorkExperience,
    removeWorkExperience,
    addProject,
    updateProject,
    removeProject,
    addSkill,
    updateSkill,
    removeSkill,
    addCertificate,
    updateCertificate,
    removeCertificate,
    setResumeData,
    saveToLibrary,
    loadFromLibrary,
    exportJSON,
    importJSON,
    addChart,
    updateChart,
    updateChartConfig,
    updateChartDataBinding,
    removeChart,
    updateChartVisibility,
    updateChartOrder,
    reorderCharts,
    duplicateChart
  }
})
