import type {
  SavedResume,
  FilterConditions,
  SearchResult,
  SimilarityResult,
  NLPParseResult,
  SortOption,
  DeliveryStatus,
  IndustryCategory,
  ResumeData,
  ResumeScore
} from '@/types/resume'

const DELIVERY_STATUS_CONFIGS: Array<{ value: DeliveryStatus; label: string; color: string }> = [
  { value: 'pending', label: '待投递', color: '#909399' },
  { value: 'interviewing', label: '面试中', color: '#e6a23c' },
  { value: 'offered', label: '已Offer', color: '#67c23a' },
  { value: 'rejected', label: '已拒绝', color: '#f56c6c' }
]

const INDUSTRY_CONFIGS: Array<{ value: IndustryCategory; label: string }> = [
  { value: 'internet', label: '互联网' },
  { value: 'finance', label: '金融' },
  { value: 'education', label: '教育' },
  { value: 'healthcare', label: '医疗健康' },
  { value: 'manufacturing', label: '制造业' },
  { value: 'retail', label: '零售' },
  { value: 'media', label: '传媒' },
  { value: 'government', label: '政府' },
  { value: 'other', label: '其他' }
]

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'relevance', label: '相关度' },
  { value: 'updatedAt_desc', label: '更新时间（最新）' },
  { value: 'updatedAt_asc', label: '更新时间（最早）' },
  { value: 'createdAt_desc', label: '创建时间（最新）' },
  { value: 'createdAt_asc', label: '创建时间（最早）' },
  { value: 'score_desc', label: '评分（高到低）' },
  { value: 'score_asc', label: '评分（低到高）' }
]

const PRESET_TAGS: Array<{ id: string; name: string; color: string }> = [
  { id: 't1', name: '技术岗', color: '#409eff' },
  { id: 't2', name: '产品岗', color: '#67c23a' },
  { id: 't3', name: '设计岗', color: '#e6a23c' },
  { id: 't4', name: '运营岗', color: '#f56c6c' },
  { id: 't5', name: '市场岗', color: '#909399' },
  { id: 't6', name: '5年以上', color: '#6c5ce7' },
  { id: 't7', name: '3-5年', color: '#00b894' },
  { id: 't8', name: '1-3年', color: '#fdcb6e' },
  { id: 't9', name: '应届生', color: '#e17055' },
  { id: 't10', name: '海归', color: '#0984e3' }
]

function flattenResumeData(resume: SavedResume): string {
  const d = resume.data
  const parts: string[] = []

  parts.push(resume.name)
  parts.push(resume.targetPosition)
  
  if (d.basicInfo) {
    parts.push(d.basicInfo.name || '')
    parts.push(d.basicInfo.jobTitle || '')
    parts.push(d.basicInfo.summary || '')
    parts.push(d.basicInfo.location || '')
  }

  d.education?.forEach(edu => {
    parts.push(edu.school || '')
    parts.push(edu.major || '')
    parts.push(edu.degree || '')
    parts.push(edu.description || '')
  })

  d.workExperience?.forEach(work => {
    parts.push(work.company || '')
    parts.push(work.position || '')
    parts.push(work.description || '')
    work.highlights?.forEach(h => parts.push(h))
  })

  d.projects?.forEach(proj => {
    parts.push(proj.name || '')
    parts.push(proj.role || '')
    parts.push(proj.description || '')
    proj.technologies?.forEach(t => parts.push(t))
    proj.highlights?.forEach(h => parts.push(h))
  })

  d.skills?.forEach(skill => {
    parts.push(skill.name || '')
    parts.push(skill.category || '')
  })

  d.certificates?.forEach(cert => {
    parts.push(cert.name || '')
    parts.push(cert.issuer || '')
    parts.push(cert.description || '')
  })

  resume.tags?.forEach(tag => parts.push(tag))

  return parts.join(' ').toLowerCase()
}

function extractResumeFields(resume: SavedResume): Record<string, string> {
  const d = resume.data
  const fields: Record<string, string> = {}

  fields.basicInfo = `${d.basicInfo?.name || ''} ${d.basicInfo?.jobTitle || ''} ${d.basicInfo?.summary || ''}`
  fields.education = d.education?.map(e => `${e.school} ${e.major} ${e.degree}`).join(' ') || ''
  fields.workExperience = d.workExperience?.map(w => `${w.company} ${w.position} ${w.description} ${w.highlights?.join(' ')}`).join(' ') || ''
  fields.projects = d.projects?.map(p => `${p.name} ${p.role} ${p.description} ${p.technologies?.join(' ')} ${p.highlights?.join(' ')}`).join(' ') || ''
  fields.skills = d.skills?.map(s => `${s.name} ${s.category}`).join(' ') || ''
  fields.certificates = d.certificates?.map(c => `${c.name} ${c.issuer}`).join(' ') || ''
  fields.tags = resume.tags?.join(' ') || ''
  fields.targetPosition = resume.targetPosition || ''

  return fields
}

function calculateKeywordScore(text: string, keywords: string[]): { score: number; matched: string[] } {
  let score = 0
  const matched: Set<string> = new Set()
  const lowerText = text.toLowerCase()

  keywords.forEach(keyword => {
    const lowerKeyword = keyword.toLowerCase().trim()
    if (!lowerKeyword) return

    const regex = new RegExp(lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    const matches = lowerText.match(regex)
    
    if (matches && matches.length > 0) {
      matched.add(keyword)
      const wordBoundaryRegex = new RegExp(`\\b${lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      const exactMatches = lowerText.match(wordBoundaryRegex)
      const exactCount = exactMatches ? exactMatches.length : 0
      const partialCount = matches.length - exactCount
      
      score += exactCount * 10 + partialCount * 2
    }
  })

  return { score, matched: Array.from(matched) }
}

function filterByTimeRange(resume: SavedResume, filter: FilterConditions['timeRange']): boolean {
  if (!filter) return true
  
  const dateField = filter.field === 'createdAt' ? resume.createdAt : resume.updatedAt
  const resumeDate = new Date(dateField).getTime()
  
  if (filter.startDate) {
    const startDate = new Date(filter.startDate).getTime()
    if (resumeDate < startDate) return false
  }
  
  if (filter.endDate) {
    const endDate = new Date(filter.endDate)
    endDate.setHours(23, 59, 59, 999)
    if (resumeDate > endDate.getTime()) return false
  }
  
  return true
}

export const searchService = {
  getDeliveryStatusConfigs() {
    return DELIVERY_STATUS_CONFIGS
  },

  getIndustryConfigs() {
    return INDUSTRY_CONFIGS
  },

  getSortOptions() {
    return SORT_OPTIONS
  },

  getPresetTags() {
    return PRESET_TAGS
  },

  getDeliveryStatusLabel(status: DeliveryStatus): string {
    return DELIVERY_STATUS_CONFIGS.find(c => c.value === status)?.label || status
  },

  getDeliveryStatusColor(status: DeliveryStatus): string {
    return DELIVERY_STATUS_CONFIGS.find(c => c.value === status)?.color || '#909399'
  },

  getIndustryLabel(industry: IndustryCategory): string {
    return INDUSTRY_CONFIGS.find(c => c.value === industry)?.label || industry
  },

  filterResumes(resumes: SavedResume[], filters: FilterConditions): SavedResume[] {
    return resumes.filter(resume => {
      if (!filterByTimeRange(resume, filters.timeRange)) return false

      if (filters.templateTypes?.length > 0) {
        if (!filters.templateTypes.includes(resume.data.template)) return false
      }

      if (filters.tags?.length > 0) {
        const hasTag = filters.tags.some(tag => resume.tags?.includes(tag))
        if (!hasTag) return false
      }

      if (filters.deliveryStatuses?.length > 0) {
        if (!filters.deliveryStatuses.includes(resume.deliveryStatus)) return false
      }

      if (filters.targetIndustries?.length > 0) {
        if (!filters.targetIndustries.includes(resume.targetIndustry)) return false
      }

      if (filters.targetPosition?.trim()) {
        if (!resume.targetPosition.toLowerCase().includes(filters.targetPosition.toLowerCase().trim())) {
          return false
        }
      }

      return true
    })
  },

  fullTextSearch(resumes: SavedResume[], keyword: string): SearchResult[] {
    const keywords = keyword.trim().split(/\s+/).filter(k => k.length > 0)
    if (keywords.length === 0) {
      return resumes.map(resume => ({
        resume,
        relevanceScore: 0,
        matchedKeywords: [],
        matchedFields: []
      }))
    }

    const results: SearchResult[] = []

    for (const resume of resumes) {
      const fields = extractResumeFields(resume)
      let totalScore = 0
      const allMatchedKeywords: Set<string> = new Set()
      const matchedFields: Set<string> = new Set()

      const fieldWeights: Record<string, number> = {
        skills: 3,
        workExperience: 2.5,
        projects: 2,
        education: 1.5,
        basicInfo: 1.5,
        targetPosition: 2,
        tags: 2,
        certificates: 1
      }

      for (const [fieldName, fieldText] of Object.entries(fields)) {
        const { score, matched } = calculateKeywordScore(fieldText, keywords)
        if (score > 0) {
          const weight = fieldWeights[fieldName] || 1
          totalScore += score * weight
          matched.forEach(m => allMatchedKeywords.add(m))
          matchedFields.add(fieldName)
        }
      }

      if (totalScore > 0) {
        results.push({
          resume,
          relevanceScore: totalScore,
          matchedKeywords: Array.from(allMatchedKeywords),
          matchedFields: Array.from(matchedFields)
        })
      }
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore)
  },

  search(resumes: SavedResume[], filters: FilterConditions, sortOption: SortOption): SearchResult[] {
    const filteredResumes = this.filterResumes(resumes, filters)
    let results = this.fullTextSearch(filteredResumes, filters.keyword || '')

    if (results.length === 0 && !filters.keyword) {
      results = filteredResumes.map(resume => ({
        resume,
        relevanceScore: 0,
        matchedKeywords: [],
        matchedFields: []
      }))
    }

    return this.sortResults(results, sortOption)
  },

  sortResults(results: SearchResult[], sortOption: SortOption): SearchResult[] {
    return [...results].sort((a, b) => {
      switch (sortOption) {
        case 'relevance':
          return b.relevanceScore - a.relevanceScore
        case 'createdAt_desc':
          return new Date(b.resume.createdAt).getTime() - new Date(a.resume.createdAt).getTime()
        case 'createdAt_asc':
          return new Date(a.resume.createdAt).getTime() - new Date(b.resume.createdAt).getTime()
        case 'updatedAt_desc':
          return new Date(b.resume.updatedAt).getTime() - new Date(a.resume.updatedAt).getTime()
        case 'updatedAt_asc':
          return new Date(a.resume.updatedAt).getTime() - new Date(b.resume.updatedAt).getTime()
        case 'score_desc':
          return b.resume.score.overall - a.resume.score.overall
        case 'score_asc':
          return a.resume.score.overall - b.resume.score.overall
        default:
          return 0
      }
    })
  },

  calculateSimilarity(resume1: SavedResume, resume2: SavedResume): { score: number; similarFields: string[] } {
    const fields1 = extractResumeFields(resume1)
    const fields2 = extractResumeFields(resume2)
    
    let totalScore = 0
    let maxPossibleScore = 0
    const similarFields: string[] = []

    const fieldWeights: Record<string, number> = {
      skills: 3,
      workExperience: 2.5,
      projects: 2,
      education: 2,
      targetPosition: 2,
      basicInfo: 1,
      certificates: 1,
      tags: 1.5
    }

    const tokenize = (text: string): Set<string> => {
      return new Set(
        text.toLowerCase()
          .replace(/[^\w\u4e00-\u9fa5\s]/g, ' ')
          .split(/\s+/)
          .filter(t => t.length > 1)
      )
    }

    for (const [fieldName, weight] of Object.entries(fieldWeights)) {
      const text1 = fields1[fieldName] || ''
      const text2 = fields2[fieldName] || ''
      
      if (!text1 || !text2) continue

      const tokens1 = tokenize(text1)
      const tokens2 = tokenize(text2)
      
      if (tokens1.size === 0 || tokens2.size === 0) continue

      const intersection = new Set([...tokens1].filter(x => tokens2.has(x)))
      const union = new Set([...tokens1, ...tokens2])
      
      const jaccardSimilarity = intersection.size / union.size
      const fieldScore = jaccardSimilarity * weight
      
      totalScore += fieldScore
      maxPossibleScore += weight
      
      if (jaccardSimilarity > 0.1) {
        similarFields.push(fieldName)
      }
    }

    const normalizedScore = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0

    return {
      score: Math.round(normalizedScore * 100),
      similarFields
    }
  },

  findSimilarResumes(resumes: SavedResume[], targetResume: SavedResume, threshold: number = 30): SimilarityResult[] {
    const results: SimilarityResult[] = []

    for (const resume of resumes) {
      if (resume.id === targetResume.id) continue

      const { score, similarFields } = this.calculateSimilarity(targetResume, resume)
      
      if (score >= threshold) {
        results.push({
          resume,
          similarityScore: score,
          similarFields
        })
      }
    }

    return results.sort((a, b) => b.similarityScore - a.similarityScore)
  },

  parseNaturalLanguage(query: string): NLPParseResult {
    const result: NLPParseResult = {
      success: false,
      filterConditions: {},
      sortOption: null,
      rawQuery: query,
      parsedQuery: ''
    }

    const lowerQuery = query.toLowerCase()
    const filters: FilterConditions = {
      timeRange: null,
      templateTypes: [],
      tags: [],
      deliveryStatuses: [],
      targetIndustries: [],
      targetPosition: '',
      keyword: ''
    }

    const now = new Date()
    const parsedParts: string[] = []

    if (/去年|2024年|2024/.test(lowerQuery)) {
      const lastYear = now.getFullYear() - 1
      filters.timeRange = {
        field: 'createdAt',
        startDate: `${lastYear}-01-01`,
        endDate: `${lastYear}-12-31`
      }
      parsedParts.push('时间：去年')
    } else if (/今年/.test(lowerQuery)) {
      const thisYear = now.getFullYear()
      filters.timeRange = {
        field: 'createdAt',
        startDate: `${thisYear}-01-01`,
        endDate: null
      }
      parsedParts.push('时间：今年')
    } else if (/上个月|上月/.test(lowerQuery)) {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      filters.timeRange = {
        field: 'createdAt',
        startDate: lastMonth.toISOString().split('T')[0],
        endDate: endOfLastMonth.toISOString().split('T')[0]
      }
      parsedParts.push('时间：上个月')
    } else if (/这个月|本月/.test(lowerQuery)) {
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      filters.timeRange = {
        field: 'createdAt',
        startDate: thisMonth.toISOString().split('T')[0],
        endDate: null
      }
      parsedParts.push('时间：本月')
    } else if (/最近一周|近一周/.test(lowerQuery)) {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filters.timeRange = {
        field: 'createdAt',
        startDate: weekAgo.toISOString().split('T')[0],
        endDate: null
      }
      parsedParts.push('时间：最近一周')
    } else if (/最近一个月|近一个月/.test(lowerQuery)) {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      filters.timeRange = {
        field: 'createdAt',
        startDate: monthAgo.toISOString().split('T')[0],
        endDate: null
      }
      parsedParts.push('时间：最近一个月')
    }

    const industryMap: Record<string, IndustryCategory> = {
      '互联网': 'internet',
      'it': 'internet',
      '科技': 'internet',
      '金融': 'finance',
      '银行': 'finance',
      '教育': 'education',
      '培训': 'education',
      '医疗': 'healthcare',
      '医院': 'healthcare',
      '健康': 'healthcare',
      '制造': 'manufacturing',
      '工业': 'manufacturing',
      '零售': 'retail',
      '电商': 'retail',
      '传媒': 'media',
      '广告': 'media',
      '政府': 'government',
      '公务员': 'government'
    }

    for (const [keyword, industry] of Object.entries(industryMap)) {
      if (lowerQuery.includes(keyword)) {
        if (!filters.targetIndustries.includes(industry)) {
          filters.targetIndustries.push(industry)
          parsedParts.push(`行业：${keyword}`)
        }
      }
    }

    const statusMap: Record<string, DeliveryStatus> = {
      '待投递': 'pending',
      '未投递': 'pending',
      '面试中': 'interviewing',
      '面试': 'interviewing',
      'offer': 'offered',
      '已offer': 'offered',
      '录用': 'offered',
      '拒绝': 'rejected',
      '已拒绝': 'rejected'
    }

    for (const [keyword, status] of Object.entries(statusMap)) {
      if (lowerQuery.includes(keyword)) {
        if (!filters.deliveryStatuses.includes(status)) {
          filters.deliveryStatuses.push(status)
          parsedParts.push(`状态：${keyword}`)
        }
      }
    }

    const positionKeywords = ['工程师', '设计师', '产品经理', '运营', '销售', '市场', '前端', '后端', '算法', '测试', '开发', '项目经理', '人事', '财务', '法务']
    for (const pos of positionKeywords) {
      if (lowerQuery.includes(pos)) {
        filters.targetPosition = pos
        parsedParts.push(`岗位：${pos}`)
        break
      }
    }

    const excludePatterns = [
      /去年|今年|上个月|这个月|最近一周|近一周|最近一个月|近一个月|2024年|2024|2025年|2025/,
      /互联网|it|科技|金融|银行|教育|培训|医疗|医院|健康|制造|工业|零售|电商|传媒|广告|政府|公务员/,
      /待投递|未投递|面试中|面试|offer|已offer|录用|拒绝|已拒绝/,
      /工程师|设计师|产品经理|运营|销售|市场|前端|后端|算法|测试|开发|项目经理|人事|财务|法务/,
      /简历|找|搜索|筛选|的|了|过|我/,
      /投递|岗位|公司|企业/
    ]

    let remainingQuery = query
    for (const pattern of excludePatterns) {
      remainingQuery = remainingQuery.replace(pattern, ' ')
    }
    remainingQuery = remainingQuery.trim()

    if (remainingQuery && remainingQuery.length > 0) {
      filters.keyword = remainingQuery
      parsedParts.push(`关键词：${remainingQuery}`)
    }

    if (/最新|最近/.test(lowerQuery)) {
      result.sortOption = 'createdAt_desc'
      parsedParts.push('排序：最新创建')
    } else if (/评分|最好|优秀/.test(lowerQuery)) {
      result.sortOption = 'score_desc'
      parsedParts.push('排序：评分最高')
    }

    result.filterConditions = filters
    result.parsedQuery = parsedParts.join(' | ')
    result.success = parsedParts.length > 0

    return result
  },

  calculateResumeScore(data: ResumeData): ResumeScore {
    const score: ResumeScore = {
      overall: 0,
      experience: 0,
      skills: 0,
      education: 0,
      projects: 0
    }

    const now = new Date()
    let totalExperienceYears = 0

    data.workExperience?.forEach(work => {
      const startDate = new Date(work.startDate)
      const endDate = work.current ? now : new Date(work.endDate || work.startDate)
      const years = (endDate.getTime() - startDate.getTime()) / (365 * 24 * 60 * 60 * 1000)
      totalExperienceYears += Math.max(0, years)
    })

    if (totalExperienceYears >= 10) score.experience = 100
    else if (totalExperienceYears >= 5) score.experience = 80 + (totalExperienceYears - 5) * 4
    else if (totalExperienceYears >= 3) score.experience = 60 + (totalExperienceYears - 3) * 10
    else if (totalExperienceYears >= 1) score.experience = 40 + (totalExperienceYears - 1) * 10
    else score.experience = totalExperienceYears * 40

    const skillCount = data.skills?.length || 0
    const avgSkillLevel = skillCount > 0
      ? (data.skills?.reduce((sum, s) => sum + s.level, 0) || 0) / skillCount
      : 0
    score.skills = Math.min(100, skillCount * 5 + avgSkillLevel * 0.4)

    const highestDegree = data.education?.reduce((highest, edu) => {
      const degreeOrder: Record<string, number> = {
        '博士': 5, '硕士': 4, '本科': 3, '大专': 2, '高中': 1, '中专': 1
      }
      return Math.max(highest, degreeOrder[edu.degree] || 0)
    }, 0) || 0
    score.education = highestDegree * 20

    const projectCount = data.projects?.length || 0
    let projectScore = 0
    data.projects?.forEach(proj => {
      let pScore = 15
      if (proj.technologies?.length) pScore += proj.technologies.length * 1.5
      if (proj.highlights?.length) pScore += proj.highlights.length * 2
      if (proj.description?.length > 50) pScore += 5
      projectScore += Math.min(25, pScore)
    })
    score.projects = Math.min(100, projectScore)

    score.overall = Math.round(
      score.experience * 0.35 +
      score.skills * 0.25 +
      score.education * 0.2 +
      score.projects * 0.2
    )

    return score
  },

  getDefaultFilters(): FilterConditions {
    return {
      timeRange: null,
      templateTypes: [],
      tags: [],
      deliveryStatuses: [],
      targetIndustries: [],
      targetPosition: '',
      keyword: ''
    }
  },

  isFiltersEmpty(filters: FilterConditions): boolean {
    return (
      !filters.timeRange &&
      filters.templateTypes.length === 0 &&
      filters.tags.length === 0 &&
      filters.deliveryStatuses.length === 0 &&
      filters.targetIndustries.length === 0 &&
      !filters.targetPosition?.trim() &&
      !filters.keyword?.trim()
    )
  }
}
