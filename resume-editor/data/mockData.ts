import type { ResumeData, TemplateConfig, Education, WorkExperience, Project, Skill, Certificate, ResumeModule, Chart, ChartTemplate } from '@/types/resume'

// 模板配置
export const templateConfigs: TemplateConfig[] = [
  {
    id: 'classic',
    name: '经典商务',
    description: '传统专业的商务风格，适合金融、法律等行业',
    thumbnail: '/templates/classic.png',
    primaryColor: '#1a1a2e',
    secondaryColor: '#16213e',
    fontFamily: 'serif',
    layout: 'single'
  },
  {
    id: 'modern',
    name: '现代简约',
    description: '清爽现代的设计风格，适合互联网、科技行业',
    thumbnail: '/templates/modern.png',
    primaryColor: '#2d3436',
    secondaryColor: '#0984e3',
    fontFamily: 'sans',
    layout: 'double'
  },
  {
    id: 'minimal',
    name: '极简主义',
    description: '极致简洁的设计，突出内容本身',
    thumbnail: '/templates/minimal.png',
    primaryColor: '#000000',
    secondaryColor: '#636e72',
    fontFamily: 'sans',
    layout: 'single'
  },
  {
    id: 'creative',
    name: '创意设计',
    description: '富有创意的设计，适合设计、创意行业',
    thumbnail: '/templates/creative.png',
    primaryColor: '#6c5ce7',
    secondaryColor: '#a29bfe',
    fontFamily: 'sans',
    layout: 'double'
  }
]

// 默认模块配置
export const defaultModules: ResumeModule[] = [
  { id: 'm1', type: 'basic', title: '基本信息', visible: true, order: 0 },
  { id: 'm2', type: 'work', title: '工作经历', visible: true, order: 1 },
  { id: 'm3', type: 'education', title: '教育经历', visible: true, order: 2 },
  { id: 'm4', type: 'project', title: '项目经历', visible: true, order: 3 },
  { id: 'm5', type: 'skill', title: '专业技能', visible: true, order: 4 },
  { id: 'm6', type: 'certificate', title: '证书资质', visible: true, order: 5 }
]

// 默认教育经历
export const defaultEducation: Education[] = [
  {
    id: 'edu1',
    school: '北京市第一中学',
    degree: '高中',
    major: '',
    startDate: '2015-09',
    endDate: '2018-06',
    description: ''
  }
]

// 默认工作经历
export const defaultWorkExperience: WorkExperience[] = [
  {
    id: 'work1',
    company: '字节跳动',
    position: '高级前端工程师',
    startDate: '2021-07',
    endDate: '',
    current: true,
    description: '负责抖音电商核心业务的前端架构设计和开发工作',
    highlights: [
      '主导电商首页性能优化，首屏加载时间减少 40%',
      '设计并实现组件库，提升团队开发效率 30%',
      '带领 5 人小组完成多个核心项目交付'
    ]
  },
  {
    id: 'work2',
    company: '阿里巴巴',
    position: '前端工程师',
    startDate: '2019-06',
    endDate: '2021-06',
    current: false,
    description: '参与淘宝商家后台系统的开发和维护',
    highlights: [
      '负责商家数据可视化平台的前端开发',
      '优化大型表单的渲染性能，提升用户体验',
      '参与团队技术分享，推动最佳实践落地'
    ]
  }
]

// 默认项目经历
export const defaultProjects: Project[] = [
  {
    id: 'proj1',
    name: '电商智能推荐系统',
    role: '技术负责人',
    startDate: '2022-03',
    endDate: '2023-06',
    description: '基于用户行为的个性化商品推荐系统，日活用户超千万',
    technologies: ['Vue3', 'TypeScript', 'Node.js', 'TensorFlow.js'],
    highlights: [
      '设计前后端分离的微服务架构',
      '实现实时推荐算法，点击率提升 25%',
      '搭建完整的监控和告警体系'
    ]
  },
  {
    id: 'proj2',
    name: '企业级低代码平台',
    role: '核心开发',
    startDate: '2020-09',
    endDate: '2021-12',
    description: '可视化应用搭建平台，支持快速生成企业级管理系统',
    technologies: ['React', 'Ant Design', 'Webpack', 'Monaco Editor'],
    highlights: [
      '实现可视化拖拽编辑器',
      '设计自定义 DSL 解析引擎',
      '支持复杂业务逻辑编排'
    ]
  }
]

// 默认技能数据扩展（用于图表展示）
export const defaultSkillsExtended: Skill[] = [
  { id: 'skill1', name: 'Vue.js', level: 95, category: '前端框架' },
  { id: 'skill2', name: 'React', level: 90, category: '前端框架' },
  { id: 'skill3', name: 'TypeScript', level: 92, category: '编程语言' },
  { id: 'skill4', name: 'JavaScript', level: 95, category: '编程语言' },
  { id: 'skill5', name: 'Node.js', level: 85, category: '后端开发' },
  { id: 'skill6', name: 'MySQL', level: 80, category: '数据库' },
  { id: 'skill7', name: 'MongoDB', level: 75, category: '数据库' },
  { id: 'skill8', name: 'Webpack', level: 88, category: '工程化' },
  { id: 'skill9', name: 'Vite', level: 85, category: '工程化' },
  { id: 'skill10', name: 'Git', level: 90, category: '工具' },
  { id: 'skill11', name: 'Docker', level: 78, category: '工具' },
  { id: 'skill12', name: 'CSS/Sass', level: 92, category: '前端框架' }
]

// 默认技能（精简版，用于兼容）
export const defaultSkills: Skill[] = defaultSkillsExtended

// 默认证书
export const defaultCertificates: Certificate[] = [
  {
    id: 'cert1',
    name: 'AWS 认证解决方案架构师',
    issuer: 'Amazon Web Services',
    date: '2022-08',
    description: '专业级认证'
  },
  {
    id: 'cert2',
    name: 'PMP 项目管理专业人士',
    issuer: 'PMI',
    date: '2021-11',
    description: '项目管理专业认证'
  }
]

// 图表模板
export const chartTemplates: ChartTemplate[] = [
  {
    id: 'radar-skills',
    type: 'radar',
    name: '技能雷达图',
    description: '展示各技能维度的掌握程度',
    icon: 'Radar',
    defaultConfig: {
      type: 'radar',
      indicators: [],
      showLegend: false,
      showLabel: true
    },
    defaultDataBinding: {
      source: 'skills',
      fields: {
        name: 'name',
        value: 'level',
        category: 'category'
      }
    }
  },
  {
    id: 'timeline-career',
    type: 'timeline',
    name: '职业晋升时间线',
    description: '可视化工作经历和职业发展',
    icon: 'Clock',
    defaultConfig: {
      type: 'timeline',
      orientation: 'vertical',
      showDate: true,
      showCompany: true
    },
    defaultDataBinding: {
      source: 'workExperience',
      fields: {
        name: 'position',
        date: 'startDate',
        description: 'company',
        category: 'current'
      }
    }
  },
  {
    id: 'bar-projects',
    type: 'bar',
    name: '项目成果柱状图',
    description: '对比各项目的关键指标',
    icon: 'DataLine',
    defaultConfig: {
      type: 'bar',
      xAxisField: 'name',
      yAxisField: 'highlights',
      showGrid: true,
      showValue: true,
      barWidth: 40
    },
    defaultDataBinding: {
      source: 'projects',
      fields: {
        name: 'name',
        value: 'highlights',
        category: 'role'
      }
    }
  },
  {
    id: 'heatmap-skills',
    type: 'heatmap',
    name: '技能掌握度热力图',
    description: '按分类和熟练度展示技能分布',
    icon: 'Histogram',
    defaultConfig: {
      type: 'heatmap',
      xField: 'category',
      yField: 'name',
      valueField: 'level',
      colorScheme: 'blue'
    },
    defaultDataBinding: {
      source: 'skills',
      fields: {
        name: 'name',
        value: 'level',
        category: 'category'
      }
    }
  },
  {
    id: 'dashboard-custom',
    type: 'dashboard',
    name: '自定义仪表盘',
    description: '自由组合多个数据指标',
    icon: 'Odometer',
    defaultConfig: {
      type: 'dashboard',
      metrics: [],
      layout: 'grid',
      columns: 3
    },
    defaultDataBinding: {
      source: 'basicInfo',
      fields: {}
    }
  }
]

// 默认图表数据
export const defaultCharts: Chart[] = [
  {
    id: 'chart1',
    type: 'radar',
    title: '技能雷达图',
    description: '核心技能维度分析',
    dataBinding: {
      source: 'skills',
      fields: {
        name: 'name',
        value: 'level',
        category: 'category'
      },
      filter: {
        limit: 6
      }
    },
    config: {
      type: 'radar',
      indicators: [],
      showLegend: false,
      showLabel: true
    },
    width: 100,
    height: 320,
    visible: true,
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'chart2',
    type: 'timeline',
    title: '职业发展时间线',
    description: '工作经历可视化',
    dataBinding: {
      source: 'workExperience',
      fields: {
        name: 'position',
        date: 'startDate',
        description: 'company',
        category: 'current'
      }
    },
    config: {
      type: 'timeline',
      orientation: 'vertical',
      showDate: true,
      showCompany: true
    },
    width: 100,
    height: 280,
    visible: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// 更新默认简历数据中的技能和图表
export const defaultResumeData: ResumeData = {
  basicInfo: {
    name: '张三',
    avatar: '',
    phone: '138-0000-0000',
    email: 'zhangsan@example.com',
    location: '北京市海淀区',
    website: 'https://zhangsan.dev',
    jobTitle: '高级前端工程师',
    summary: '5 年以上互联网大厂前端开发经验，精通 Vue、React 等主流框架，具备大型项目架构设计和团队管理能力。热爱技术，持续学习，追求代码质量和用户体验的完美结合。'
  },
  education: defaultEducation,
  workExperience: defaultWorkExperience,
  projects: defaultProjects,
  skills: defaultSkillsExtended,
  certificates: defaultCertificates,
  modules: defaultModules,
  charts: defaultCharts,
  template: 'modern'
}

// 生成唯一 ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
