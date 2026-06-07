import type { ResumeData, TemplateConfig, Education, WorkExperience, Project, Skill, Certificate, ResumeModule, Chart, ChartTemplate, SavedResume, DeliveryStatus, IndustryCategory, TemplateType } from '@/types/resume'
import { searchService } from '@/services/searchService'

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

const MOCK_RESUME_TEMPLATES: Array<{
  name: string
  targetPosition: string
  targetIndustry: IndustryCategory
  deliveryStatus: DeliveryStatus
  tags: string[]
  template: TemplateType
  basicInfo: { name: string; jobTitle: string; summary: string }
  education: Education[]
  workExperience: WorkExperience[]
  projects: Project[]
  skills: Skill[]
  certificates: Certificate[]
  createdAtOffset: number
}> = [
  {
    name: '字节跳动-前端工程师',
    targetPosition: '高级前端工程师',
    targetIndustry: 'internet',
    deliveryStatus: 'interviewing',
    tags: ['技术岗', '3-5年'],
    template: 'modern',
    basicInfo: {
      name: '张三',
      jobTitle: '高级前端工程师',
      summary: '5年以上互联网大厂前端开发经验，精通Vue、React等主流框架，具备大型项目架构设计和团队管理能力。'
    },
    education: [
      { id: 'e1', school: '清华大学', degree: '硕士', major: '计算机科学与技术', startDate: '2016-09', endDate: '2019-06', description: '' }
    ],
    workExperience: [
      { id: 'w1', company: '字节跳动', position: '高级前端工程师', startDate: '2021-07', endDate: '', current: true, description: '负责抖音电商核心业务的前端架构设计和开发', highlights: ['主导电商首页性能优化，首屏加载时间减少40%', '设计并实现组件库，提升团队开发效率30%'] },
      { id: 'w2', company: '阿里巴巴', position: '前端工程师', startDate: '2019-06', endDate: '2021-06', current: false, description: '参与淘宝商家后台系统的开发', highlights: ['负责商家数据可视化平台开发', '优化大型表单渲染性能'] }
    ],
    projects: [
      { id: 'p1', name: '电商智能推荐系统', role: '技术负责人', startDate: '2022-03', endDate: '2023-06', description: '基于用户行为的个性化商品推荐系统', technologies: ['Vue3', 'TypeScript', 'Node.js'], highlights: ['设计微服务架构', '点击率提升25%'] }
    ],
    skills: [
      { id: 's1', name: 'Vue.js', level: 95, category: '前端框架' },
      { id: 's2', name: 'React', level: 90, category: '前端框架' },
      { id: 's3', name: 'TypeScript', level: 92, category: '编程语言' },
      { id: 's4', name: 'JavaScript', level: 95, category: '编程语言' },
      { id: 's5', name: 'Node.js', level: 85, category: '后端开发' }
    ],
    certificates: [
      { id: 'c1', name: 'AWS认证解决方案架构师', issuer: 'Amazon Web Services', date: '2022-08', description: '专业级认证' }
    ],
    createdAtOffset: -30
  },
  {
    name: '腾讯-后端开发工程师',
    targetPosition: '后端开发工程师',
    targetIndustry: 'internet',
    deliveryStatus: 'pending',
    tags: ['技术岗', '3-5年'],
    template: 'classic',
    basicInfo: {
      name: '李四',
      jobTitle: '后端开发工程师',
      summary: '4年后端开发经验，熟悉Java、Go语言，精通微服务架构设计，有高并发系统开发经验。'
    },
    education: [
      { id: 'e1', school: '北京大学', degree: '本科', major: '软件工程', startDate: '2016-09', endDate: '2020-06', description: '' }
    ],
    workExperience: [
      { id: 'w1', company: '腾讯', position: '后端开发工程师', startDate: '2020-07', endDate: '', current: true, description: '负责微信支付核心系统开发', highlights: ['设计高并发支付系统', '优化数据库查询性能'] }
    ],
    projects: [
      { id: 'p1', name: '分布式支付系统', role: '核心开发', startDate: '2022-01', endDate: '2023-03', description: '支持每秒10万TPS的分布式支付系统', technologies: ['Java', 'Go', 'Redis', 'Kafka'], highlights: ['实现分布式事务', '系统可用性达99.99%'] }
    ],
    skills: [
      { id: 's1', name: 'Java', level: 90, category: '编程语言' },
      { id: 's2', name: 'Go', level: 85, category: '编程语言' },
      { id: 's3', name: 'Spring Boot', level: 88, category: '后端框架' },
      { id: 's4', name: 'MySQL', level: 85, category: '数据库' },
      { id: 's5', name: 'Redis', level: 80, category: '数据库' },
      { id: 's6', name: 'Kafka', level: 75, category: '中间件' }
    ],
    certificates: [],
    createdAtOffset: -60
  },
  {
    name: '阿里-产品经理',
    targetPosition: '产品经理',
    targetIndustry: 'internet',
    deliveryStatus: 'offered',
    tags: ['产品岗', '3-5年'],
    template: 'modern',
    basicInfo: {
      name: '王五',
      jobTitle: '产品经理',
      summary: '4年互联网产品经验，主导过多款百万级用户产品，擅长用户研究和数据分析。'
    },
    education: [
      { id: 'e1', school: '复旦大学', degree: '硕士', major: '工商管理', startDate: '2016-09', endDate: '2019-06', description: '' }
    ],
    workExperience: [
      { id: 'w1', company: '阿里巴巴', position: '产品经理', startDate: '2019-07', endDate: '', current: true, description: '负责淘宝搜索产品设计', highlights: ['搜索转化率提升15%', '用户留存率提升10%'] }
    ],
    projects: [
      { id: 'p1', name: '智能搜索优化项目', role: '产品负责人', startDate: '2022-06', endDate: '2023-02', description: '基于AI的智能搜索系统', technologies: ['产品设计', '数据分析'], highlights: ['搜索准确率提升30%', '用户满意度提升20%'] }
    ],
    skills: [
      { id: 's1', name: 'Axure', level: 90, category: '产品工具' },
      { id: 's2', name: '数据分析', level: 85, category: '数据分析' },
      { id: 's3', name: '用户研究', level: 88, category: '产品能力' }
    ],
    certificates: [
      { id: 'c1', name: 'PMP项目管理专业人士', issuer: 'PMI', date: '2021-11', description: '项目管理专业认证' }
    ],
    createdAtOffset: -90
  },
  {
    name: '美团-UX设计师',
    targetPosition: '高级UI/UX设计师',
    targetIndustry: 'internet',
    deliveryStatus: 'interviewing',
    tags: ['设计岗', '1-3年'],
    template: 'creative',
    basicInfo: {
      name: '赵六',
      jobTitle: '高级UI/UX设计师',
      summary: '3年互联网设计经验，擅长用户体验设计和视觉设计，有完整的产品设计思维。'
    },
    education: [
      { id: 'e1', school: '中国美术学院', degree: '本科', major: '视觉传达设计', startDate: '2017-09', endDate: '2021-06', description: '' }
    ],
    workExperience: [
      { id: 'w1', company: '美团', position: 'UI/UX设计师', startDate: '2021-07', endDate: '', current: true, description: '负责美团外卖APP界面设计', highlights: ['设计新版首页', '用户点击率提升20%'] }
    ],
    projects: [
      { id: 'p1', name: '美团外卖品牌升级', role: '主设计师', startDate: '2023-01', endDate: '2023-04', description: '外卖APP全面品牌升级项目', technologies: ['Figma', 'Sketch', 'Principle'], highlights: ['品牌认知度提升30%', '用户好评率提升15%'] }
    ],
    skills: [
      { id: 's1', name: 'Figma', level: 95, category: '设计工具' },
      { id: 's2', name: 'Sketch', level: 90, category: '设计工具' },
      { id: 's3', name: '交互设计', level: 92, category: '设计能力' },
      { id: 's4', name: '品牌设计', level: 88, category: '设计能力' }
    ],
    certificates: [],
    createdAtOffset: -120
  },
  {
    name: '金融分析师',
    targetPosition: '金融分析师',
    targetIndustry: 'finance',
    deliveryStatus: 'pending',
    tags: ['3-5年'],
    template: 'classic',
    basicInfo: {
      name: '钱七',
      jobTitle: '金融分析师',
      summary: '5年金融行业分析经验，精通财务分析和投资研究，熟悉各类金融产品。'
    },
    education: [
      { id: 'e1', school: '上海财经大学', degree: '硕士', major: '金融学', startDate: '2015-09', endDate: '2019-06', description: '' }
    ],
    workExperience: [
      { id: 'w1', company: '国泰君安证券', position: '行业分析师', startDate: '2019-07', endDate: '', current: true, description: '负责TMT行业研究', highlights: ['发布深度研究报告20+篇', '推荐股票收益率超50%'] }
    ],
    projects: [
      { id: 'p1', name: '投资研究平台', role: '项目负责人', startDate: '2022-03', endDate: '2022-09', description: '搭建智能化投资研究平台', technologies: ['Python', '数据分析'], highlights: ['研究效率提升40%', '覆盖300+机构客户'] }
    ],
    skills: [
      { id: 's1', name: '财务分析', level: 92, category: '金融分析' },
      { id: 's2', name: '投资研究', level: 90, category: '金融分析' },
      { id: 's3', name: 'Python', level: 80, category: '数据分析' },
      { id: 's4', name: 'Wind', level: 85, category: '金融工具' }
    ],
    certificates: [
      { id: 'c1', name: 'CFA特许金融分析师', issuer: 'CFA Institute', date: '2022-06', description: 'Level III' }
    ],
    createdAtOffset: -180
  },
  {
    name: 'JAVA开发工程师',
    targetPosition: 'Java开发工程师',
    targetIndustry: 'finance',
    deliveryStatus: 'rejected',
    tags: ['技术岗', '1-3年'],
    template: 'minimal',
    basicInfo: {
      name: '孙八',
      jobTitle: 'Java开发工程师',
      summary: '2年Java开发经验，熟悉Spring全家桶，有金融行业系统开发经验。'
    },
    education: [
      { id: 'e1', school: '北京邮电大学', degree: '本科', major: '计算机科学与技术', startDate: '2018-09', endDate: '2022-06', description: '' }
    ],
    workExperience: [
      { id: 'w1', company: '招商银行', position: 'Java开发工程师', startDate: '2022-07', endDate: '', current: true, description: '负责银行核心系统开发', highlights: ['开发信贷审批系统', '处理日终批量作业'] }
    ],
    projects: [],
    skills: [
      { id: 's1', name: 'Java', level: 85, category: '编程语言' },
      { id: 's2', name: 'Spring Boot', level: 82, category: '后端框架' },
      { id: 's3', name: 'Oracle', level: 78, category: '数据库' }
    ],
    certificates: [],
    createdAtOffset: -200
  },
  {
    name: '在线教育-课程设计师',
    targetPosition: '课程设计师',
    targetIndustry: 'education',
    deliveryStatus: 'pending',
    tags: ['1-3年'],
    template: 'modern',
    basicInfo: {
      name: '周九',
      jobTitle: '课程设计师',
      summary: '3年在线教育行业课程设计经验，擅长课程体系搭建和内容策划。'
    },
    education: [
      { id: 'e1', school: '北京师范大学', degree: '硕士', major: '教育技术学', startDate: '2017-09', endDate: '2020-06', description: '' }
    ],
    workExperience: [
      { id: 'w1', company: '猿辅导', position: '课程设计师', startDate: '2020-07', endDate: '', current: true, description: '负责K12数学课程设计', highlights: ['设计课程50+节', '学员满意度95%'] }
    ],
    projects: [
      { id: 'p1', name: 'AI互动课程', role: '课程设计负责人', startDate: '2022-09', endDate: '2023-02', description: 'AI驱动的个性化学习课程', technologies: ['课程设计', 'AI教学'], highlights: ['学习效率提升50%', '续费率提升30%'] }
    ],
    skills: [
      { id: 's1', name: '课程设计', level: 90, category: '教育能力' },
      { id: 's2', name: '教学设计', level: 88, category: '教育能力' },
      { id: 's3', name: '内容策划', level: 85, category: '内容创作' }
    ],
    certificates: [
      { id: 'c1', name: '教师资格证', issuer: '教育部', date: '2020-07', description: '高级中学教师资格' }
    ],
    createdAtOffset: -240
  },
  {
    name: '医院-前端开发',
    targetPosition: '前端开发工程师',
    targetIndustry: 'healthcare',
    deliveryStatus: 'pending',
    tags: ['技术岗', '应届生'],
    template: 'modern',
    basicInfo: {
      name: '吴十',
      jobTitle: '前端开发工程师',
      summary: '应届生，掌握前端开发基础知识扎实，有医院信息系统开发实习经验。'
    },
    education: [
      { id: 'e1', school: '华中科技大学', degree: '本科', major: '生物医学工程', startDate: '2019-09', endDate: '2023-06', description: '' }
    ],
    workExperience: [
      { id: 'w1', company: '平安好医生', position: '前端开发实习生', startDate: '2022-07', endDate: '2023-05', current: false, description: '参与在线问诊系统前端开发', highlights: ['开发医生排班模块', '优化页面加载速度'] }
    ],
    projects: [
      { id: 'p1', name: '医疗数据可视化', role: '前端开发', startDate: '2023-01', endDate: '2023-05', description: '医疗健康数据可视化大屏', technologies: ['Vue3', 'ECharts', 'TypeScript'], highlights: ['实时数据展示', '支持多维度数据查询'] }
    ],
    skills: [
      { id: 's1', name: 'Vue.js', level: 80, category: '前端框架' },
      { id: 's2', name: 'JavaScript', level: 82, category: '编程语言' },
      { id: 's3', name: 'ECharts', level: 75, category: '数据可视化' }
    ],
    certificates: [],
    createdAtOffset: -30
  },
  {
    name: '制造业-Python开发',
    targetPosition: 'Python开发工程师',
    targetIndustry: 'manufacturing',
    deliveryStatus: 'interviewing',
    tags: ['技术岗', '3-5年'],
    template: 'minimal',
    basicInfo: {
      name: '郑十一',
      jobTitle: 'Python开发工程师',
      summary: '4年Python开发经验，熟悉工业自动化和智能制造系统开发。'
    },
    education: [
      { id: 'e1', school: '哈尔滨工业大学', degree: '本科', major: '自动化', startDate: '2016-09', endDate: '2020-06', description: '' }
    ],
    workExperience: [
      { id: 'w1', company: '华为', position: 'Python开发工程师', startDate: '2020-07', endDate: '', current: true, description: '负责工业互联网平台开发', highlights: ['开发设备监控系统', '设备故障率降低25%'] }
    ],
    projects: [
      { id: 'p1', name: '智能工厂MES系统', role: '核心开发', startDate: '2022-01', endDate: '2023-03', description: '智能制造执行系统', technologies: ['Python', 'Django', 'MQTT'], highlights: ['生产效率提升30%', '已部署10+工厂'] }
    ],
    skills: [
      { id: 's1', name: 'Python', level: 90, category: '编程语言' },
      { id: 's2', name: 'Django', level: 85, category: '后端框架' },
      { id: 's3', name: '工业自动化', level: 88, category: '领域知识' }
    ],
    certificates: [],
    createdAtOffset: -150
  },
  {
    name: '零售行业-运营经理',
    targetPosition: '运营经理',
    targetIndustry: 'retail',
    deliveryStatus: 'pending',
    tags: ['运营岗', '5年以上'],
    template: 'classic',
    basicInfo: {
      name: '冯十二',
      jobTitle: '运营经理',
      summary: '6年零售行业运营经验，擅长线下门店运营和数字化转型。'
    },
    education: [
      { id: 'e1', school: '浙江大学', degree: '本科', major: '市场营销', startDate: '2014-09', endDate: '2018-06', description: '' }
    ],
    workExperience: [
      { id: 'w1', company: '永辉超市', position: '运营经理', startDate: '2018-07', endDate: '', current: true, description: '负责区域门店运营管理', highlights: ['管理20+门店', '年销售额增长3亿'] }
    ],
    projects: [
      { id: 'p1', name: '门店数字化转型', role: '项目负责人', startDate: '2022-03', endDate: '2023-01', description: '线下门店数字化改造项目', technologies: ['数字化运营', '数据分析'], highlights: ['门店效率提升40%', '客户满意度提升25%'] }
    ],
    skills: [
      { id: 's1', name: '门店运营', level: 92, category: '运营能力' },
      { id: 's2', name: '数据分析', level: 85, category: '数据分析' },
      { id: 's3', name: '团队管理', level: 88, category: '管理能力' }
    ],
    certificates: [],
    createdAtOffset: -270
  },
  {
    name: '传媒-内容运营',
    targetPosition: '内容运营',
    targetIndustry: 'media',
    deliveryStatus: 'offered',
    tags: ['运营岗', '1-3年'],
    template: 'creative',
    basicInfo: {
      name: '陈十三',
      jobTitle: '内容运营',
      summary: '3年传媒行业内容运营经验，擅长短视频内容策划和社交媒体运营。'
    },
    education: [
      { id: 'e1', school: '中国传媒大学', degree: '本科', major: '广播电视学', startDate: '2017-09', endDate: '2021-06', description: '' }
    ],
    workExperience: [
      { id: 'w1', company: '抖音', position: '内容运营', startDate: '2021-07', endDate: '', current: true, description: '负责抖音创作者内容运营', highlights: ['策划爆款视频播放量超10亿+', '粉丝增长500万+'] }
    ],
    projects: [
      { id: 'p1', name: '创作者扶持计划', role: '运营负责人', startDate: '2022-06', endDate: '2023-02', description: '优质创作者扶持项目', technologies: ['内容策划', '活动运营'], highlights: ['扶持创作者1000+', '内容质量提升35%'] }
    ],
    skills: [
      { id: 's1', name: '内容策划', level: 90, category: '内容创作' },
      { id: 's2', name: '短视频运营', level: 92, category: '运营能力' },
      { id: 's3', name: '数据分析', level: 82, category: '数据分析' }
    ],
    certificates: [],
    createdAtOffset: -45
  },
  {
    name: '考研简历',
    targetPosition: '产品经理',
    targetIndustry: 'internet',
    deliveryStatus: 'pending',
    tags: ['产品岗', '1-3年'],
    template: 'minimal',
    basicInfo: {
      name: '杨十四',
      jobTitle: '产品经理',
      summary: '2年B端产品经验，擅长需求分析和产品规划能力。'
    },
    education: [
      { id: 'e1', school: '同济大学', degree: '硕士', major: '计算机科学', startDate: '2018-09', endDate: '2021-06', description: '' }
    ],
    workExperience: [
      { id: 'w1', company: '京东', position: '产品经理', startDate: '2021-07', endDate: '', current: true, description: '负责企业级SaaS产品', highlights: ['从0到1搭建产品', '客户留存率85%'] }
    ],
    projects: [
      { id: 'p1', name: '企业协作平台', role: '产品经理', startDate: '2022-03', endDate: '2022-12', description: '企业内部协作管理平台', technologies: ['产品设计', '需求分析'], highlights: ['提升团队效率40%', '服务500+企业'] }
    ],
    skills: [
      { id: 's1', name: '产品设计', level: 88, category: '产品能力' },
      { id: 's2', name: '需求分析', level: 90, category: '产品能力' },
      { id: 's3', name: '数据分析', level: 85, category: '数据分析' }
    ],
    certificates: [
      { id: 'c1', name: 'NPDP产品经理认证', issuer: 'PDMA', date: '2022-09', description: '新产品开发专业认证' }
    ],
    createdAtOffset: -100
  },
  {
    name: '海归-算法工程师',
    targetPosition: '算法工程师',
    targetIndustry: 'internet',
    deliveryStatus: 'pending',
    tags: ['技术岗', '海归', '1-3年'],
    template: 'modern',
    basicInfo: {
      name: '林十五',
      jobTitle: '算法工程师',
      summary: '美国哥伦比亚大学硕士毕业，3年机器学习算法经验，擅长推荐系统和NLP。'
    },
    education: [
      { id: 'e1', school: 'Columbia University', degree: '硕士', major: 'Data Science', startDate: '2018-09', endDate: '2020-06', description: '' },
      { id: 'e2', school: '上海交通大学', degree: '本科', major: '数学与应用数学', startDate: '2014-09', endDate: '2018-06', description: '' }
    ],
    workExperience: [
      { id: 'w1', company: 'Netflix', position: '算法工程师', startDate: '2020-07', endDate: '2022-08', current: false, description: '负责视频推荐算法', highlights: ['推荐点击率提升20%'] },
      { id: 'w2', company: '小红书', position: '高级算法工程师', startDate: '2022-09', endDate: '', current: true, description: '负责笔记推荐系统优化', highlights: ['用户停留时间提升15%'] }
    ],
    projects: [
      { id: 'p1', name: '多模态推荐系统', role: '算法负责人', startDate: '2023-01', endDate: '2023-06', description: '融合图文内容的多模态推荐', technologies: ['Python', 'TensorFlow', 'PyTorch'], highlights: ['推荐效果提升25%'] }
    ],
    skills: [
      { id: 's1', name: '机器学习', level: 92, category: '算法' },
      { id: 's2', name: '深度学习', level: 90, category: '算法' },
      { id: 's3', name: '推荐系统', level: 95, category: '算法' },
      { id: 's4', name: 'Python', level: 90, category: '编程语言' },
      { id: 's5', name: 'TensorFlow', level: 88, category: '深度学习框架' }
    ],
    certificates: [],
    createdAtOffset: -210
  },
  {
    name: '国企-党建',
    targetPosition: '行政专员',
    targetIndustry: 'government',
    deliveryStatus: 'pending',
    tags: ['1-3年'],
    template: 'classic',
    basicInfo: {
      name: '何十六',
      jobTitle: '行政专员',
      summary: '2年政府机关工作经验，熟悉公文写作和行政管理。'
    },
    education: [
      { id: 'e1', school: '中国人民大学', degree: '本科', major: '行政管理', startDate: '2017-09', endDate: '2021-06', description: '' }
    ],
    workExperience: [
      { id: 'w1', company: '某省政府办公厅', position: '行政专员', startDate: '2021-07', endDate: '', current: true, description: '负责办公室日常行政工作', highlights: ['起草各类公文100+', '组织会议50+'] }
    ],
    projects: [],
    skills: [
      { id: 's1', name: '公文写作', level: 90, category: '行政能力' },
      { id: 's2', name: '会议组织', level: 88, category: '行政能力' },
      { id: 's3', name: '沟通协调', level: 85, category: '软技能' }
    ],
    certificates: [
      { id: 'c1', name: '公务员资格证书', issuer: '国家公务员局', date: '2021-07', description: '公务员录用资格' }
    ],
    createdAtOffset: -80
  },
  {
    name: '跨行业-项目经理',
    targetPosition: '项目经理',
    targetIndustry: 'other',
    deliveryStatus: 'interviewing',
    tags: ['5年以上'],
    template: 'classic',
    basicInfo: {
      name: '罗十七',
      jobTitle: '项目经理',
      summary: '8年项目管理经验，PMP认证，跨多个行业项目经验。'
    },
    workExperience: [
      { id: 'w1', company: '埃森哲', position: '高级项目经理', startDate: '2017-07', endDate: '', current: true, description: '负责大型企业数字化转型项目', highlights: ['管理项目预算超5000万+', '项目交付率98%'] }
    ],
    education: [
      { id: 'e1', school: '西安交通大学', degree: '硕士', major: '管理科学与工程', startDate: '2012-09', endDate: '2015-06', description: '' }
    ],
    projects: [
      { id: 'p1', name: '某大型银行核心系统升级', role: '项目经理', startDate: '2021-01', endDate: '2022-06', description: '银行核心业务系统全面升级', technologies: ['项目管理', '需求管理'], highlights: ['按时按预算交付', '客户满意度100%'] }
    ],
    skills: [
      { id: 's1', name: '项目管理', level: 95, category: '管理能力' },
      { id: 's2', name: '风险管理', level: 90, category: '管理能力' },
      { id: 's3', name: '团队管理', level: 92, category: '管理能力' }
    ],
    certificates: [
      { id: 'c1', name: 'PMP项目管理专业人士', issuer: 'PMI', date: '2019-03', description: '项目管理专业认证' }
    ],
    createdAtOffset: -330
  }
]

export function generateMockResumes(): SavedResume[] {
  const now = new Date()
  const resumes: SavedResume[] = []

  MOCK_RESUME_TEMPLATES.forEach((template, index) => {
    const resumeData: ResumeData = {
      basicInfo: {
        name: template.basicInfo.name,
        avatar: '',
        phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        email: `${template.basicInfo.name.toLowerCase().replace(/\s/g, '')}@example.com`,
        location: '北京市朝阳区',
        website: '',
        jobTitle: template.basicInfo.jobTitle,
        summary: template.basicInfo.summary
      },
      education: template.education.map(e => ({ ...e, id: generateId() })),
      workExperience: template.workExperience.map(w => ({ ...w, id: generateId() })),
      projects: template.projects.map(p => ({ ...p, id: generateId() })),
      skills: template.skills.map(s => ({ ...s, id: generateId() })),
      certificates: template.certificates.map(c => ({ ...c, id: generateId() })),
      modules: [...defaultModules.map(m => ({ ...m, id: generateId() }))],
      charts: [],
      template: template.template
    }

    const createdAt = new Date(now.getTime() + template.createdAtOffset * 24 * 60 * 60 * 1000)
    const updatedAt = new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)

    const score = searchService.calculateResumeScore(resumeData)

    const resume: SavedResume = {
      id: generateId(),
      name: template.name,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      data: resumeData,
      thumbnail: '',
      tags: template.tags,
      deliveryStatus: template.deliveryStatus,
      targetIndustry: template.targetIndustry,
      targetPosition: template.targetPosition,
      score
    }

    resumes.push(resume)
  })

  return resumes
}
