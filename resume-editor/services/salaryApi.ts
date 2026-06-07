import type { ResumeData } from '@/types/resume'
import type { SalaryEstimateResult, ComparisonData } from '@/types/salary'
import {
  positionBaseSalaries,
  yearsCoefficients,
  getYearsRange,
  calculateYearsFromWorkExperience,
  getCityCoefficient,
  getCompanyCoefficient,
  getDegreeCoefficient,
  calculateSkillsValue,
  calculateProjectsValue,
  generateSalaryTrends,
  generateSalaryDistribution,
  generateImprovementSuggestions
} from '@/data/salaryData'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

function matchPosition(position: string): string {
  const positions = Object.keys(positionBaseSalaries)
  for (const p of positions) {
    if (position.includes(p) || p.includes(position)) {
      return p
    }
  }
  return '工程师'
}

function estimateSalary(resumeData: ResumeData): SalaryEstimateResult {
  const { basicInfo, education, workExperience, skills, projects } = resumeData

  const position = basicInfo.jobTitle || '工程师'
  const matchedPosition = matchPosition(position)
  const baseSalary = positionBaseSalaries[matchedPosition] || 30

  const highestDegree = education.length > 0 
    ? education.sort((a, b) => {
        const order: Record<string, number> = { '博士': 4, '硕士': 3, '本科': 2, '大专': 1 }
        return (order[b.degree] || 0) - (order[a.degree] || 0)
      })[0].degree
    : '本科'

  const startDates = workExperience.map(w => w.startDate).filter(d => d)
  const workYears = calculateYearsFromWorkExperience(startDates)
  const yearsRange = getYearsRange(workYears)

  const city = basicInfo.location || '北京'
  const topCompany = workExperience.length > 0 ? workExperience[0].company : '其他'

  const educationScore = getDegreeCoefficient(highestDegree) * 100
  const yearsScore = yearsCoefficients[yearsRange] * 100
  const cityScore = getCityCoefficient(city) * 100
  const companyScore = getCompanyCoefficient(topCompany) * 100
  const skillsScore = (calculateSkillsValue(skills) / 15) * 100
  const projectsScore = (calculateProjectsValue(projects) / 15) * 100

  const factorWeights = {
    education: 0.15,
    years: 0.3,
    city: 0.15,
    skills: 0.2,
    company: 0.12,
    projects: 0.08
  }

  const overallScore = 
    educationScore * factorWeights.education +
    yearsScore * factorWeights.years +
    cityScore * factorWeights.city +
    skillsScore * factorWeights.skills +
    companyScore * factorWeights.company +
    projectsScore * factorWeights.projects

  const medianSalary = Math.round(baseSalary * (overallScore / 100) * 10) / 10
  const minSalary = Math.round(medianSalary * 0.7 * 10) / 10
  const maxSalary = Math.round(medianSalary * 1.5 * 10) / 10

  const confidence = Math.min(95, 70 + workExperience.length * 3 + skills.length * 2 + projects.length * 2)

  const comparisons: ComparisonData[] = [
    {
      category: 'years',
      label: `${yearsRange}年经验`,
      userSalary: medianSalary,
      averageSalary: Math.round(baseSalary * yearsCoefficients[yearsRange] * 10) / 10,
      percentile: Math.min(95, 50 + (overallScore - 100) * 0.5)
    },
    {
      category: 'position',
      label: matchedPosition,
      userSalary: medianSalary,
      averageSalary: baseSalary,
      percentile: Math.min(95, 50 + (overallScore - 100) * 0.5)
    },
    {
      category: 'city',
      label: city,
      userSalary: medianSalary,
      averageSalary: Math.round(baseSalary * getCityCoefficient(city) * 10) / 10,
      percentile: Math.min(95, 50 + (overallScore - 100) * 0.5)
    }
  ]

  return {
    salaryRange: {
      min: minSalary,
      median: medianSalary,
      max: maxSalary,
      unit: 'K'
    },
    distribution: generateSalaryDistribution(medianSalary),
    comparisons,
    suggestions: generateImprovementSuggestions(skills, highestDegree, workYears),
    trends: generateSalaryTrends(matchedPosition),
    factors: {
      education: Math.round(educationScore),
      years: Math.round(yearsScore),
      city: Math.round(cityScore),
      skills: Math.round(skillsScore),
      company: Math.round(companyScore),
      projects: Math.round(projectsScore)
    },
    factorWeights,
    confidence,
    lastUpdated: new Date().toISOString()
  }
}

export const salaryApi = {
  async estimateSalary(resumeData: ResumeData): Promise<ApiResponse<SalaryEstimateResult>> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    try {
      const result = estimateSalary(resumeData)
      return {
        success: true,
        data: result
      }
    } catch (error) {
      return {
        success: false,
        message: '薪资预估失败，请稍后重试'
      }
    }
  }
}
