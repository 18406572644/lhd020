export interface Person {
  id: string
  name: string
  avatar: string
  currentCompany: string
  currentPosition: string
  industry: string
  schools: Array<{
    school: string
    major: string
    degree: string
    startDate: string
    endDate: string
  }>
  workHistory: Array<{
    company: string
    position: string
    startDate: string
    endDate: string
  }>
  projects: Array<{
    name: string
    role: string
    company: string
  }>
  skills: string[]
  connectionDegree: 1 | 2 | 3
  connectionType: 'alumni' | 'colleague' | 'project' | 'friend'
  score: number
  lastActive: string
  anonymous: boolean
  anonymousTitle: string
}

export interface ConnectionPath {
  id: string
  persons: Person[]
  strength: number
}

export interface AlumniFilter {
  school?: string
  major?: string
  degree?: string
  graduationYear?: string
}

export interface ColleagueFilter {
  company?: string
  position?: string
  startDate?: string
  endDate?: string
}

export interface ReferralRequest {
  id: string
  targetPersonId: string
  targetCompany: string
  targetPosition: string
  resumeVersion: string
  message: string
  status: 'pending' | 'accepted' | 'rejected' | 'ignored'
  createdAt: string
  updatedAt: string
}

export interface PrivacySettings {
  showRealName: boolean
  showCurrentCompany: boolean
  showCurrentPosition: boolean
  showWorkHistory: boolean
  showEducation: boolean
  showSkills: boolean
  showProjects: boolean
  showContactInfo: boolean
  allowSearchBySchool: boolean
  allowSearchByCompany: boolean
  allowSearchBySkill: boolean
  receiveReferralRequests: boolean
  anonymousMode: boolean
}

export interface CareerPathNode {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  durationMonths: number
}

export interface CareerPath {
  id: string
  personId: string
  personName: string
  personTitle: string
  similarity: number
  nodes: CareerPathNode[]
  totalYears: number
  promotions: number
  companies: number
}

export interface NetworkStats {
  totalConnections: number
  firstDegree: number
  secondDegree: number
  thirdDegree: number
  alumniCount: number
  colleagueCount: number
  averageScore: number
  topIndustries: Array<{ name: string; count: number }>
  topCompanies: Array<{ name: string; count: number }>
}

export interface GraphNode {
  id: string
  name: string
  x: number
  y: number
  size: number
  color: string
  type: 'me' | 'alumni' | 'colleague' | 'project' | 'friend'
  degree: 1 | 2 | 3
  person?: Person
}

export interface GraphLink {
  source: string
  target: string
  strength: number
  type: 'alumni' | 'colleague' | 'project' | 'friend'
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export type NetworkTab = 'graph' | 'alumni' | 'colleague' | 'target' | 'career' | 'privacy'
