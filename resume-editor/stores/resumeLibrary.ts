import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  SavedResume,
  FilterConditions,
  SearchResult,
  SmartFolder,
  SortOption,
  SimilarityResult,
  NLPParseResult
} from '@/types/resume'
import { searchService } from '@/services/searchService'
import { generateMockResumes } from '@/data/mockData'
import { generateId } from '@/data/mockData'

const SMART_FOLDERS_KEY = 'smart_folders'

export const useResumeLibraryStore = defineStore('resumeLibrary', () => {
  const allResumes = ref<SavedResume[]>([])
  const searchResults = ref<SearchResult[]>([])
  const similarityResults = ref<SimilarityResult[]>([])
  const smartFolders = ref<SmartFolder[]>([])
  const filterConditions = ref<FilterConditions>(searchService.getDefaultFilters())
  const sortOption = ref<SortOption>('relevance')
  const activeSmartFolderId = ref<string | null>(null)
  const searchMode = ref<'normal' | 'nlp' | 'similarity'>('normal')
  const nlpParseResult = ref<NLPParseResult | null>(null)
  const similarityTargetResume = ref<SavedResume | null>(null)
  const loading = ref(false)

  const filteredCount = computed(() => searchResults.value.length)
  const totalCount = computed(() => allResumes.value.length)

  const activeSmartFolder = computed(() => {
    if (!activeSmartFolderId.value) return null
    return smartFolders.value.find(f => f.id === activeSmartFolderId.value) || null
  })

  const hasActiveFilters = computed(() => {
    return !searchService.isFiltersEmpty(filterConditions.value)
  })

  async function initLibrary() {
    loading.value = true
    try {
      await Promise.all([
        loadAllResumes(),
        loadSmartFolders()
      ])
      performSearch()
    } finally {
      loading.value = false
    }
  }

  async function loadAllResumes() {
    try {
      const mockResumes = generateMockResumes()
      allResumes.value = mockResumes
    } catch (error) {
      console.error('Failed to load resumes:', error)
      allResumes.value = []
    }
  }

  async function loadSmartFolders() {
    if (typeof window === 'undefined') {
      smartFolders.value = getDefaultSmartFolders()
      return
    }
    
    const saved = localStorage.getItem(SMART_FOLDERS_KEY)
    if (saved) {
      try {
        smartFolders.value = JSON.parse(saved)
      } catch {
        smartFolders.value = getDefaultSmartFolders()
      }
    } else {
      smartFolders.value = getDefaultSmartFolders()
      saveSmartFoldersToStorage()
    }
  }

  function getDefaultSmartFolders(): SmartFolder[] {
    const now = new Date().toISOString()
    return [
      {
        id: 'sf_default_1',
        name: '待投递简历',
        description: '所有待投递状态的简历',
        filterConditions: {
          ...searchService.getDefaultFilters(),
          deliveryStatuses: ['pending']
        },
        sortOption: 'updatedAt_desc',
        createdAt: now,
        updatedAt: now,
        icon: 'Clock',
        color: '#909399'
      },
      {
        id: 'sf_default_2',
        name: '面试中',
        description: '正在面试流程中的简历',
        filterConditions: {
          ...searchService.getDefaultFilters(),
          deliveryStatuses: ['interviewing']
        },
        sortOption: 'updatedAt_desc',
        createdAt: now,
        updatedAt: now,
        icon: 'ChatDotRound',
        color: '#e6a23c'
      },
      {
        id: 'sf_default_3',
        name: '已获Offer',
        description: '已收到Offer的简历',
        filterConditions: {
          ...searchService.getDefaultFilters(),
          deliveryStatuses: ['offered']
        },
        sortOption: 'updatedAt_desc',
        createdAt: now,
        updatedAt: now,
        icon: 'CircleCheck',
        color: '#67c23a'
      },
      {
        id: 'sf_default_4',
        name: '互联网行业',
        description: '目标行业为互联网的简历',
        filterConditions: {
          ...searchService.getDefaultFilters(),
          targetIndustries: ['internet']
        },
        sortOption: 'score_desc',
        createdAt: now,
        updatedAt: now,
        icon: 'Monitor',
        color: '#409eff'
      },
      {
        id: 'sf_default_5',
        name: '高分简历',
        description: '评分80分以上的优质简历',
        filterConditions: {
          ...searchService.getDefaultFilters()
        },
        sortOption: 'score_desc',
        createdAt: now,
        updatedAt: now,
        icon: 'Star',
        color: '#f56c6c'
      }
    ]
  }

  function saveSmartFoldersToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SMART_FOLDERS_KEY, JSON.stringify(smartFolders.value))
    }
  }

  function performSearch() {
    searchMode.value = 'normal'
    nlpParseResult.value = null
    similarityTargetResume.value = null
    similarityResults.value = []

    searchResults.value = searchService.search(
      allResumes.value,
      filterConditions.value,
      sortOption.value
    )
  }

  function performNLPSearch(query: string) {
    const parseResult = searchService.parseNaturalLanguage(query)
    nlpParseResult.value = parseResult

    if (parseResult.success) {
      searchMode.value = 'nlp'
      
      const mergedFilters: FilterConditions = {
        ...searchService.getDefaultFilters(),
        ...parseResult.filterConditions
      }
      
      filterConditions.value = mergedFilters
      
      if (parseResult.sortOption) {
        sortOption.value = parseResult.sortOption
      }
      
      similarityTargetResume.value = null
      similarityResults.value = []

      searchResults.value = searchService.search(
        allResumes.value,
        filterConditions.value,
        sortOption.value
      )
    }
    
    return parseResult
  }

  function findSimilarResumes(targetResume: SavedResume, threshold: number = 30) {
    searchMode.value = 'similarity'
    similarityTargetResume.value = targetResume
    nlpParseResult.value = null
    
    similarityResults.value = searchService.findSimilarResumes(
      allResumes.value,
      targetResume,
      threshold
    )
    
    searchResults.value = similarityResults.value.map(sr => ({
      resume: sr.resume,
      relevanceScore: sr.similarityScore,
      matchedKeywords: [],
      matchedFields: sr.similarFields
    }))
  }

  function updateFilters(filters: Partial<FilterConditions>) {
    filterConditions.value = {
      ...filterConditions.value,
      ...filters
    }
    activeSmartFolderId.value = null
    performSearch()
  }

  function resetFilters() {
    filterConditions.value = searchService.getDefaultFilters()
    sortOption.value = 'relevance'
    activeSmartFolderId.value = null
    nlpParseResult.value = null
    similarityTargetResume.value = null
    performSearch()
  }

  function updateSortOption(option: SortOption) {
    sortOption.value = option
    performSearch()
  }

  function applySmartFolder(folderId: string) {
    const folder = smartFolders.value.find(f => f.id === folderId)
    if (!folder) return

    activeSmartFolderId.value = folderId
    filterConditions.value = { ...folder.filterConditions }
    sortOption.value = folder.sortOption
    performSearch()
  }

  async function createSmartFolder(
    name: string,
    description: string,
    icon: string,
    color: string
  ): Promise<SmartFolder> {
    const newFolder: SmartFolder = {
      id: generateId(),
      name,
      description,
      filterConditions: JSON.parse(JSON.stringify(filterConditions.value)),
      sortOption: sortOption.value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      icon,
      color
    }

    smartFolders.value.push(newFolder)
    saveSmartFoldersToStorage()
    
    return newFolder
  }

  async function updateSmartFolder(
    folderId: string,
    updates: Partial<SmartFolder>
  ) {
    const index = smartFolders.value.findIndex(f => f.id === folderId)
    if (index === -1) return

    smartFolders.value[index] = {
      ...smartFolders.value[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    saveSmartFoldersToStorage()
  }

  async function deleteSmartFolder(folderId: string) {
    smartFolders.value = smartFolders.value.filter(f => f.id !== folderId)
    if (activeSmartFolderId.value === folderId) {
      activeSmartFolderId.value = null
    }
    saveSmartFoldersToStorage()
  }

  function getResumeById(id: string): SavedResume | undefined {
    return allResumes.value.find(r => r.id === id)
  }

  function updateResumeMetadata(
    id: string,
    updates: Partial<Pick<SavedResume, 'tags' | 'deliveryStatus' | 'targetIndustry' | 'targetPosition' | 'name'>>
  ) {
    const index = allResumes.value.findIndex(r => r.id === id)
    if (index === -1) return

    allResumes.value[index] = {
      ...allResumes.value[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    performSearch()
  }

  function deleteResume(id: string) {
    allResumes.value = allResumes.value.filter(r => r.id !== id)
    performSearch()
  }

  return {
    allResumes,
    searchResults,
    similarityResults,
    smartFolders,
    filterConditions,
    sortOption,
    activeSmartFolderId,
    activeSmartFolder,
    searchMode,
    nlpParseResult,
    similarityTargetResume,
    loading,
    filteredCount,
    totalCount,
    hasActiveFilters,
    initLibrary,
    performSearch,
    performNLPSearch,
    findSimilarResumes,
    updateFilters,
    resetFilters,
    updateSortOption,
    applySmartFolder,
    createSmartFolder,
    updateSmartFolder,
    deleteSmartFolder,
    getResumeById,
    updateResumeMetadata,
    deleteResume
  }
})
