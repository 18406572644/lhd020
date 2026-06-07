export interface SalaryRange {
  min: number
  median: number
  max: number
  unit: 'K' | 'W'
}

export interface SalaryDistribution {
  range: string
  percentage: number
  count: number
}

export interface ComparisonData {
  category: 'years' | 'position' | 'city'
  label: string
  userSalary: number
  averageSalary: number
  percentile: number
}

export interface SkillUpgrade {
  skill: string
  currentLevel: number
  targetLevel: number
  salaryIncrease: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface CertificationUpgrade {
  name: string
  salaryIncrease: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface SalaryTrend {
  year: number
  averageSalary: number
  growthRate: number
}

export interface ImprovementSuggestion {
  type: 'skill' | 'certification' | 'education' | 'experience'
  title: string
  description: string
  salaryIncrease: number
  difficulty: 'easy' | 'medium' | 'hard'
  priority: 'high' | 'medium' | 'low'
}

export interface SalaryFactors {
  education: number
  years: number
  city: number
  skills: number
  company: number
  projects: number
}

export interface SalaryFactorWeights {
  education: number
  years: number
  city: number
  skills: number
  company: number
  projects: number
}

export interface SalaryEstimateResult {
  salaryRange: SalaryRange
  distribution: SalaryDistribution[]
  comparisons: ComparisonData[]
  suggestions: ImprovementSuggestion[]
  trends: SalaryTrend[]
  factors: SalaryFactors
  factorWeights: SalaryFactorWeights
  confidence: number
  lastUpdated: string
}

export interface CitySalaryLevel {
  city: string
  level: number
  coefficient: number
}

export interface CompanyTier {
  name: string
  tier: 'top' | 'first' | 'second' | 'third' | 'other'
  coefficient: number
}

export interface SkillMarketValue {
  skill: string
  category: string
  demand: 'high' | 'medium' | 'low'
  baseValue: number
}
