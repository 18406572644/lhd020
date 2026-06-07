import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Person, ReferralRequest, PrivacySettings, CareerPath, NetworkStats, GraphData, AlumniFilter, ColleagueFilter } from '@/types/network'
import { mockPersons, mockCareerPaths, defaultPrivacySettings, mockReferralRequests, mockNetworkStats, generateGraphData } from '@/data/networkData'
import { generateId } from '@/data/mockData'

export const useNetworkStore = defineStore('network', () => {
  const persons = ref<Person[]>([])
  const careerPaths = ref<CareerPath[]>([])
  const referralRequests = ref<ReferralRequest[]>([])
  const privacySettings = ref<PrivacySettings>({ ...defaultPrivacySettings })
  const networkStats = ref<NetworkStats | null>(null)
  const graphData = ref<GraphData | null>(null)
  const loading = ref(false)
  const selectedPerson = ref<Person | null>(null)
  const activeTab = ref<'graph' | 'alumni' | 'colleague' | 'target' | 'career' | 'privacy'>('graph')

  const alumniNetwork = computed(() => {
    return persons.value.filter(p => p.connectionType === 'alumni')
  })

  const colleagueNetwork = computed(() => {
    return persons.value.filter(p => p.connectionType === 'colleague')
  })

  const firstDegreeConnections = computed(() => {
    return persons.value.filter(p => p.connectionDegree === 1)
  })

  const secondDegreeConnections = computed(() => {
    return persons.value.filter(p => p.connectionDegree === 2)
  })

  const thirdDegreeConnections = computed(() => {
    return persons.value.filter(p => p.connectionDegree === 3)
  })

  const topScoredPersons = computed(() => {
    return [...persons.value].sort((a, b) => b.score - a.score).slice(0, 10)
  })

  async function initNetwork() {
    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      persons.value = [...mockPersons]
      careerPaths.value = [...mockCareerPaths]
      referralRequests.value = [...mockReferralRequests]
      networkStats.value = { ...mockNetworkStats }
      graphData.value = generateGraphData()
    } finally {
      loading.value = false
    }
  }

  function filterAlumniNetwork(filter: AlumniFilter): Person[] {
    return alumniNetwork.value.filter(person => {
      if (filter.school && !person.schools.some(s => s.school.includes(filter.school!))) return false
      if (filter.major && !person.schools.some(s => s.major.includes(filter.major!))) return false
      if (filter.degree && !person.schools.some(s => s.degree === filter.degree)) return false
      if (filter.graduationYear && !person.schools.some(s => s.endDate.startsWith(filter.graduationYear!))) return false
      return true
    })
  }

  function filterColleagueNetwork(filter: ColleagueFilter): Person[] {
    return colleagueNetwork.value.filter(person => {
      if (filter.company && !person.workHistory.some(w => w.company.includes(filter.company!))) return false
      if (filter.position && !person.workHistory.some(w => w.position.includes(filter.position!))) return false
      return true
    })
  }

  function findConnectionsAtCompany(company: string): Array<{ person: Person; degree: 1 | 2 | 3; path: Person[] }> {
    const results: Array<{ person: Person; degree: 1 | 2 | 3; path: Person[] }> = []
    const firstDegreeAtCompany = persons.value.filter(p => 
      p.connectionDegree === 1 && p.currentCompany === company
    )
    firstDegreeAtCompany.forEach(person => {
      results.push({ person, degree: 1, path: [person] })
    })
    const secondDegreeAtCompany = persons.value.filter(p => 
      p.connectionDegree === 2 && p.currentCompany === company
    )
    secondDegreeAtCompany.forEach(person => {
      const firstDegreeConnection = firstDegreeConnections.value.find(f => 
        f.connectionType === person.connectionType
      )
      results.push({ 
        person, 
        degree: 2, 
        path: firstDegreeConnection ? [firstDegreeConnection, person] : [person] 
      })
    })
    const thirdDegreeAtCompany = persons.value.filter(p => 
      p.connectionDegree === 3 && p.currentCompany === company
    )
    thirdDegreeAtCompany.forEach(person => {
      const secondDegreeConnection = secondDegreeConnections.value.find(s => 
        s.connectionType === person.connectionType
      )
      const firstDegreeConnection = firstDegreeConnections.value.find(f => 
        f.connectionType === person.connectionType
      )
      const path: Person[] = []
      if (firstDegreeConnection) path.push(firstDegreeConnection)
      if (secondDegreeConnection) path.push(secondDegreeConnection)
      path.push(person)
      results.push({ person, degree: 3, path })
    })
    return results
  }

  function sendReferralRequest(
    targetPersonId: string, 
    targetCompany: string, 
    targetPosition: string, 
    resumeVersion: string, 
    message: string
  ): ReferralRequest {
    const request: ReferralRequest = {
      id: generateId(),
      targetPersonId,
      targetCompany,
      targetPosition,
      resumeVersion,
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    referralRequests.value.push(request)
    return request
  }

  function updateReferralRequestStatus(id: string, status: ReferralRequest['status']) {
    const request = referralRequests.value.find(r => r.id === id)
    if (request) {
      request.status = status
      request.updatedAt = new Date().toISOString()
    }
  }

  function updatePrivacySettings(settings: Partial<PrivacySettings>) {
    privacySettings.value = { ...privacySettings.value, ...settings }
  }

  function selectPerson(person: Person | null) {
    selectedPerson.value = person
  }

  function setActiveTab(tab: typeof activeTab.value) {
    activeTab.value = tab
  }

  function refreshGraphData() {
    graphData.value = generateGraphData()
  }

  function getConnectionPath(targetPersonId: string): Person[] {
    const target = persons.value.find(p => p.id === targetPersonId)
    if (!target) return []
    
    if (target.connectionDegree === 1) {
      return [target]
    } else if (target.connectionDegree === 2) {
      const firstDegree = firstDegreeConnections.value.find(f => f.connectionType === target.connectionType)
      return firstDegree ? [firstDegree, target] : [target]
    } else {
      const firstDegree = firstDegreeConnections.value.find(f => f.connectionType === target.connectionType)
      const secondDegree = secondDegreeConnections.value.find(s => s.connectionType === target.connectionType)
      const path: Person[] = []
      if (firstDegree) path.push(firstDegree)
      if (secondDegree) path.push(secondDegree)
      path.push(target)
      return path
    }
  }

  function getSimilarCareerPaths(): CareerPath[] {
    return [...careerPaths.value].sort((a, b) => b.similarity - a.similarity)
  }

  return {
    persons,
    careerPaths,
    referralRequests,
    privacySettings,
    networkStats,
    graphData,
    loading,
    selectedPerson,
    activeTab,
    alumniNetwork,
    colleagueNetwork,
    firstDegreeConnections,
    secondDegreeConnections,
    thirdDegreeConnections,
    topScoredPersons,
    initNetwork,
    filterAlumniNetwork,
    filterColleagueNetwork,
    findConnectionsAtCompany,
    sendReferralRequest,
    updateReferralRequestStatus,
    updatePrivacySettings,
    selectPerson,
    setActiveTab,
    refreshGraphData,
    getConnectionPath,
    getSimilarCareerPaths
  }
})
