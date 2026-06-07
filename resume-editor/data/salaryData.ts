import type {
  CitySalaryLevel,
  CompanyTier,
  SkillMarketValue,
  SalaryTrend,
  SalaryDistribution,
  ImprovementSuggestion
} from '@/types/salary'

export const citySalaryLevels: CitySalaryLevel[] = [
  { city: '北京', level: 1, coefficient: 1.2 },
  { city: '上海', level: 1, coefficient: 1.18 },
  { city: '深圳', level: 1, coefficient: 1.15 },
  { city: '杭州', level: 2, coefficient: 1.05 },
  { city: '广州', level: 2, coefficient: 1.02 },
  { city: '苏州', level: 2, coefficient: 0.98 },
  { city: '南京', level: 2, coefficient: 0.95 },
  { city: '成都', level: 3, coefficient: 0.9 },
  { city: '武汉', level: 3, coefficient: 0.88 },
  { city: '西安', level: 3, coefficient: 0.85 },
  { city: '重庆', level: 3, coefficient: 0.82 },
  { city: '天津', level: 3, coefficient: 0.8 },
  { city: '其他', level: 4, coefficient: 0.7 }
]

export const companyTiers: CompanyTier[] = [
  { name: '字节跳动', tier: 'top', coefficient: 1.3 },
  { name: '腾讯', tier: 'top', coefficient: 1.3 },
  { name: '阿里巴巴', tier: 'top', coefficient: 1.28 },
  { name: '华为', tier: 'top', coefficient: 1.25 },
  { name: '美团', tier: 'first', coefficient: 1.15 },
  { name: '京东', tier: 'first', coefficient: 1.12 },
  { name: '百度', tier: 'first', coefficient: 1.1 },
  { name: '小米', tier: 'first', coefficient: 1.08 },
  { name: '快手', tier: 'first', coefficient: 1.05 },
  { name: '滴滴', tier: 'second', coefficient: 1.0 },
  { name: '网易', tier: 'second', coefficient: 1.0 },
  { name: '携程', tier: 'second', coefficient: 0.98 },
  { name: '哔哩哔哩', tier: 'second', coefficient: 0.95 },
  { name: '其他', tier: 'other', coefficient: 0.9 }
]

export const degreeCoefficients: Record<string, number> = {
  '博士': 1.4,
  '硕士': 1.2,
  '本科': 1.0,
  '大专': 0.85,
  '高中及以下': 0.7
}

export const skillMarketValues: SkillMarketValue[] = [
  { skill: 'Vue.js', category: '前端框架', demand: 'high', baseValue: 8 },
  { skill: 'React', category: '前端框架', demand: 'high', baseValue: 9 },
  { skill: 'Angular', category: '前端框架', demand: 'medium', baseValue: 7 },
  { skill: 'TypeScript', category: '编程语言', demand: 'high', baseValue: 10 },
  { skill: 'JavaScript', category: '编程语言', demand: 'high', baseValue: 8 },
  { skill: 'Node.js', category: '后端开发', demand: 'high', baseValue: 9 },
  { skill: 'Python', category: '编程语言', demand: 'high', baseValue: 10 },
  { skill: 'Java', category: '编程语言', demand: 'high', baseValue: 9 },
  { skill: 'Go', category: '编程语言', demand: 'high', baseValue: 12 },
  { skill: 'Rust', category: '编程语言', demand: 'medium', baseValue: 14 },
  { skill: 'MySQL', category: '数据库', demand: 'high', baseValue: 6 },
  { skill: 'PostgreSQL', category: '数据库', demand: 'medium', baseValue: 7 },
  { skill: 'MongoDB', category: '数据库', demand: 'medium', baseValue: 6 },
  { skill: 'Redis', category: '数据库', demand: 'high', baseValue: 7 },
  { skill: 'Docker', category: '容器化', demand: 'high', baseValue: 8 },
  { skill: 'Kubernetes', category: '容器化', demand: 'high', baseValue: 12 },
  { skill: 'AWS', category: '云服务', demand: 'high', baseValue: 10 },
  { skill: 'Webpack', category: '工程化', demand: 'medium', baseValue: 6 },
  { skill: 'Vite', category: '工程化', demand: 'high', baseValue: 7 },
  { skill: 'Git', category: '工具', demand: 'high', baseValue: 5 }
]

export const positionBaseSalaries: Record<string, number> = {
  '前端工程师': 25,
  '高级前端工程师': 40,
  '前端架构师': 60,
  '后端工程师': 28,
  '高级后端工程师': 45,
  '后端架构师': 65,
  '全栈工程师': 35,
  '高级全栈工程师': 50,
  '算法工程师': 45,
  '高级算法工程师': 70,
  '测试工程师': 20,
  '高级测试工程师': 35,
  '产品经理': 30,
  '高级产品经理': 50,
  '设计师': 25,
  '高级设计师': 40,
  '运维工程师': 22,
  '高级运维工程师': 38,
  '工程师': 30
}

export const yearsCoefficients: Record<string, number> = {
  '0-1': 0.7,
  '1-3': 0.85,
  '3-5': 1.0,
  '5-10': 1.3,
  '10+': 1.6
}

export function getYearsRange(years: number): string {
  if (years < 1) return '0-1'
  if (years < 3) return '1-3'
  if (years < 5) return '3-5'
  if (years < 10) return '5-10'
  return '10+'
}

export function calculateYearsFromWorkExperience(startDates: string[]): number {
  if (!startDates || startDates.length === 0) return 0
  
  const now = new Date()
  let totalMonths = 0
  
  startDates.forEach(dateStr => {
    const startDate = new Date(dateStr + '-01')
    const diffMonths = (now.getFullYear() - startDate.getFullYear()) * 12 + 
                      (now.getMonth() - startDate.getMonth())
    if (diffMonths > 0) {
      totalMonths += diffMonths
    }
  })
  
  return Math.round(totalMonths / 12)
}

export function getCityCoefficient(city: string): number {
  const match = citySalaryLevels.find(c => city.includes(c.city))
  return match ? match.coefficient : citySalaryLevels[citySalaryLevels.length - 1].coefficient
}

export function getCompanyCoefficient(company: string): number {
  const match = companyTiers.find(c => company.includes(c.name))
  return match ? match.coefficient : companyTiers[companyTiers.length - 1].coefficient
}

export function getDegreeCoefficient(degree: string): number {
  return degreeCoefficients[degree] || 1.0
}

export function calculateSkillsValue(skills: { name: string; level: number }[]): number {
  if (!skills || skills.length === 0) return 0
  
  let totalValue = 0
  skills.forEach(skill => {
    const marketValue = skillMarketValues.find(v => v.skill.toLowerCase() === skill.name.toLowerCase())
    if (marketValue) {
      totalValue += marketValue.baseValue * (skill.level / 100) * 
                    (marketValue.demand === 'high' ? 1.2 : marketValue.demand === 'medium' ? 1.0 : 0.8)
    }
  })
  
  return Math.min(totalValue / skills.length, 15)
}

export function calculateProjectsValue(projects: { technologies: string[]; highlights: string[] }[]): number {
  if (!projects || projects.length === 0) return 0
  
  let score = 0
  projects.forEach(project => {
    score += project.technologies ? project.technologies.length * 0.5 : 0
    score += project.highlights ? project.highlights.length * 0.3 : 0
  })
  
  return Math.min(score, 15)
}

export function generateSalaryTrends(position: string): SalaryTrend[] {
  const baseSalary = positionBaseSalaries[position] || 30
  const trends: SalaryTrend[] = []
  
  for (let year = 2020; year <= 2025; year++) {
    const growthRate = 0.05 + Math.random() * 0.08
    const yearSalary = baseSalary * Math.pow(1 + growthRate, year - 2020)
    trends.push({
      year,
      averageSalary: Math.round(yearSalary * 10) / 10,
      growthRate: Math.round(growthRate * 100) / 100
    })
  }
  
  return trends
}

export function generateSalaryDistribution(median: number): SalaryDistribution[] {
  const distribution: SalaryDistribution[] = []
  const ranges = [
    { range: `${Math.round(median * 0.5)}K以下`, percentage: 10, count: 1200 },
    { range: `${Math.round(median * 0.5)}-${Math.round(median * 0.8)}K`, percentage: 20, count: 2400 },
    { range: `${Math.round(median * 0.8)}-${Math.round(median)}K`, percentage: 25, count: 3000 },
    { range: `${Math.round(median)}-${Math.round(median * 1.2)}K`, percentage: 20, count: 2400 },
    { range: `${Math.round(median * 1.2)}-${Math.round(median * 1.5)}K`, percentage: 15, count: 1800 },
    { range: `${Math.round(median * 1.5)}K以上`, percentage: 10, count: 1200 }
  ]
  
  return ranges
}

export function generateImprovementSuggestions(
  skills: { name: string; level: number }[],
  degree: string,
  years: number
): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = []
  
  const highDemandSkills = skillMarketValues.filter(v => v.demand === 'high')
  const userSkills = skills.map(s => s.name.toLowerCase())
  
  highDemandSkills.forEach(marketSkill => {
    const userSkill = skills.find(s => s.name.toLowerCase() === marketSkill.skill.toLowerCase())
    if (userSkill && userSkill.level < 80) {
      suggestions.push({
        type: 'skill',
        title: `提升 ${marketSkill.skill} 技能`,
        description: `${marketSkill.skill} 目前市场需求旺盛，将技能等级从 ${userSkill.level} 提升到 80+`,
        salaryIncrease: Math.round((80 - userSkill.level) * marketSkill.baseValue * 0.1),
        difficulty: userSkill.level >= 60 ? 'medium' : 'hard',
        priority: 'high'
      })
    } else if (!userSkills.includes(marketSkill.skill.toLowerCase())) {
      suggestions.push({
        type: 'skill',
        title: `学习 ${marketSkill.skill}`,
        description: `${marketSkill.skill} 是当前高需求技能（${marketSkill.category}），掌握后可显著提升竞争力`,
        salaryIncrease: Math.round(marketSkill.baseValue * 1.5),
        difficulty: marketSkill.baseValue > 10 ? 'hard' : marketSkill.baseValue > 7 ? 'medium' : 'easy',
        priority: 'high'
      })
    }
  })
  
  if (degree === '本科') {
    suggestions.push({
      type: 'education',
      title: '攻读硕士学位',
      description: '硕士学历平均薪资比本科高 20%，可考虑在职研究生或全日制硕士',
      salaryIncrease: 15,
      difficulty: 'hard',
      priority: 'medium'
    })
  } else if (degree === '大专') {
    suggestions.push({
      type: 'education',
      title: '提升至本科学历',
      description: '本科学历平均薪资比大专高 17%，可通过自考、成考等方式提升',
      salaryIncrease: 12,
      difficulty: 'medium',
      priority: 'medium'
    })
  }
  
  if (years < 5) {
    suggestions.push({
      type: 'experience',
      title: '积累项目管理经验',
      description: '尝试在项目中承担更多管理职责，向高级工程师或技术负责人方向发展',
      salaryIncrease: 10,
      difficulty: 'medium',
      priority: 'medium'
    })
  }
  
  suggestions.push({
    type: 'certification',
    title: '获取云服务认证',
    description: 'AWS 认证解决方案架构师或阿里云认证，提升云技术竞争力',
    salaryIncrease: 8,
    difficulty: 'medium',
    priority: 'low'
  })
  
  suggestions.push({
    type: 'certification',
    title: 'PMP 项目管理认证',
    description: '获取 PMP 认证，为转向技术管理岗位做准备',
    salaryIncrease: 6,
    difficulty: 'easy',
    priority: 'low'
  })
  
  return suggestions
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority] || b.salaryIncrease - a.salaryIncrease
    })
    .slice(0, 6)
}
