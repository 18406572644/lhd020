// 基本信息
export interface BasicInfo {
  name: string
  avatar: string
  phone: string
  email: string
  location: string
  website: string
  jobTitle: string
  summary: string
}

// 教育经历
export interface Education {
  id: string
  school: string
  degree: string
  major: string
  startDate: string
  endDate: string
  description: string
}

// 工作经历
export interface WorkExperience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  highlights: string[]
}

// 项目经历
export interface Project {
  id: string
  name: string
  role: string
  startDate: string
  endDate: string
  description: string
  technologies: string[]
  highlights: string[]
}

// 技能
export interface Skill {
  id: string
  name: string
  level: number
  category: string
}

// 证书
export interface Certificate {
  id: string
  name: string
  issuer: string
  date: string
  description: string
}

// 模块类型
export type ModuleType = 'basic' | 'education' | 'work' | 'project' | 'skill' | 'certificate' | 'custom'

// 简历模块
export interface ResumeModule {
  id: string
  type: ModuleType
  title: string
  visible: boolean
  order: number
}

// 模板类型
export type TemplateType = 'classic' | 'modern' | 'minimal' | 'creative'

// 模板配置
export interface TemplateConfig {
  id: TemplateType
  name: string
  description: string
  thumbnail: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  layout: 'single' | 'double'
}

// 完整简历数据
export interface ResumeData {
  basicInfo: BasicInfo
  education: Education[]
  workExperience: WorkExperience[]
  projects: Project[]
  skills: Skill[]
  certificates: Certificate[]
  modules: ResumeModule[]
  charts: Chart[]
  template: TemplateType
}

// 保存的简历记录
export interface SavedResume {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  data: ResumeData
  thumbnail: string
}

// API 响应
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

// 版本快照类型
export type SnapshotType = 'manual' | 'auto'

// 差异类型
export type DiffType = 'added' | 'removed' | 'modified'

// 字段差异
export interface FieldDiff {
  path: string
  type: DiffType
  oldValue?: any
  newValue?: any
}

// 版本快照
export interface VersionSnapshot {
  id: string
  createdAt: string
  type: SnapshotType
  data: ResumeData
  summary: string
  isMilestone: boolean
  diffs?: FieldDiff[]
}

// 版本对比结果
export interface VersionCompareResult {
  version1: VersionSnapshot
  version2: VersionSnapshot
  diffs: FieldDiff[]
  stats: {
    added: number
    removed: number
    modified: number
  }
}

// ==================== 数据可视化图表类型 ====================

// 图表类型枚举
export type ChartType = 'radar' | 'timeline' | 'bar' | 'heatmap' | 'dashboard'

// 数据绑定字段路径
export type DataFieldPath = 
  | 'skills'
  | 'workExperience'
  | 'projects'
  | 'education'
  | 'certificates'
  | 'basicInfo'

// 图表数据绑定配置
export interface DataBindingConfig {
  source: DataFieldPath
  fields: {
    name?: string
    value?: string
    category?: string
    date?: string
    description?: string
  }
  filter?: {
    category?: string
    limit?: number
  }
}

// 雷达图配置
export interface RadarChartConfig {
  type: 'radar'
  indicators: Array<{
    name: string
    max: number
  }>
  showLegend: boolean
  showLabel: boolean
}

// 时间线图配置
export interface TimelineChartConfig {
  type: 'timeline'
  orientation: 'horizontal' | 'vertical'
  showDate: boolean
  showCompany: boolean
}

// 柱状图配置
export interface BarChartConfig {
  type: 'bar'
  xAxisField: string
  yAxisField: string
  showGrid: boolean
  showValue: boolean
  barWidth: number
}

// 热力图配置
export interface HeatmapChartConfig {
  type: 'heatmap'
  xField: string
  yField: string
  valueField: string
  colorScheme: 'blue' | 'green' | 'orange' | 'purple'
}

// 仪表盘指标
export interface DashboardMetric {
  id: string
  title: string
  value: number | string
  target?: number
  unit?: string
  icon?: string
  dataBinding?: DataBindingConfig
}

// 仪表盘配置
export interface DashboardChartConfig {
  type: 'dashboard'
  metrics: DashboardMetric[]
  layout: 'grid' | 'flex'
  columns: 2 | 3 | 4
}

// 图表配置联合类型
export type ChartConfig = 
  | RadarChartConfig 
  | TimelineChartConfig 
  | BarChartConfig 
  | HeatmapChartConfig 
  | DashboardChartConfig

// 图表实例
export interface Chart {
  id: string
  type: ChartType
  title: string
  description: string
  dataBinding: DataBindingConfig
  config: ChartConfig
  width: number
  height: number
  visible: boolean
  order: number
  createdAt: string
  updatedAt: string
}

// 图表模板定义
export interface ChartTemplate {
  id: string
  type: ChartType
  name: string
  description: string
  icon: string
  defaultConfig: ChartConfig
  defaultDataBinding: DataBindingConfig
}
