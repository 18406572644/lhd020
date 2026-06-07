import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { VersionSnapshot, VersionCompareResult, SnapshotType } from '@/types/resume'
import { versionHistoryApi } from '@/services/resumeApi'

export const useVersionHistoryStore = defineStore('versionHistory', () => {
  const versionList = ref<VersionSnapshot[]>([])
  const loading = ref(false)
  const compareResult = ref<VersionCompareResult | null>(null)
  const panelVisible = ref(false)
  const compareDialogVisible = ref(false)
  const selectedForCompare = ref<string[]>([])

  const hasVersions = computed(() => versionList.value.length > 0)

  const milestoneVersions = computed(() =>
    versionList.value.filter(v => v.isMilestone)
  )

  const groupedByDate = computed(() => {
    const groups: Record<string, VersionSnapshot[]> = {}
    versionList.value.forEach(version => {
      const date = new Date(version.createdAt).toLocaleDateString('zh-CN')
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(version)
    })
    return groups
  })

  async function loadVersions() {
    loading.value = true
    try {
      const res = await versionHistoryApi.getList()
      if (res.success && res.data) {
        versionList.value = res.data
      }
    } finally {
      loading.value = false
    }
  }

  async function createSnapshot(type: SnapshotType) {
    const resumeStore = useResumeStore()
    if (!resumeStore.resumeData) return null

    try {
      const res = await versionHistoryApi.createSnapshot(
        resumeStore.resumeData,
        type
      )
      if (res.success && res.data) {
        await loadVersions()
        return res.data
      }
      return null
    } catch (error) {
      console.error('创建版本快照失败:', error)
      return null
    }
  }

  async function restoreVersion(id: string) {
    loading.value = true
    try {
      const res = await versionHistoryApi.restoreVersion(id)
      if (res.success && res.data) {
        const resumeStore = useResumeStore()
        resumeStore.setResumeData(res.data)
        await loadVersions()
        return true
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function toggleMilestone(id: string) {
    try {
      const res = await versionHistoryApi.toggleMilestone(id)
      if (res.success) {
        await loadVersions()
        return true
      }
      return false
    } catch (error) {
      console.error('切换里程碑状态失败:', error)
      return false
    }
  }

  async function deleteVersion(id: string) {
    try {
      const res = await versionHistoryApi.deleteVersion(id)
      if (res.success) {
        await loadVersions()
        return true
      }
      return false
    } catch (error) {
      console.error('删除版本失败:', error)
      return false
    }
  }

  async function compareVersions(version1Id: string, version2Id: string) {
    loading.value = true
    try {
      const res = await versionHistoryApi.compareVersions(version1Id, version2Id)
      if (res.success && res.data) {
        compareResult.value = res.data
        compareDialogVisible.value = true
        return true
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function cleanupOldVersions() {
    try {
      const res = await versionHistoryApi.cleanupOldVersions()
      if (res.success) {
        await loadVersions()
        return res.data || 0
      }
      return 0
    } catch (error) {
      console.error('清理旧版本失败:', error)
      return 0
    }
  }

  async function clearAll() {
    try {
      const res = await versionHistoryApi.clearAll()
      if (res.success) {
        versionList.value = []
        return true
      }
      return false
    } catch (error) {
      console.error('清空版本历史失败:', error)
      return false
    }
  }

  function togglePanel() {
    panelVisible.value = !panelVisible.value
    if (panelVisible.value) {
      loadVersions()
    }
  }

  function closePanel() {
    panelVisible.value = false
  }

  function selectForCompare(id: string) {
    const index = selectedForCompare.value.indexOf(id)
    if (index === -1) {
      if (selectedForCompare.value.length < 2) {
        selectedForCompare.value.push(id)
      }
    } else {
      selectedForCompare.value.splice(index, 1)
    }
  }

  function clearCompareSelection() {
    selectedForCompare.value = []
  }

  function closeCompareDialog() {
    compareDialogVisible.value = false
    compareResult.value = null
    clearCompareSelection()
  }

  return {
    versionList,
    loading,
    compareResult,
    panelVisible,
    compareDialogVisible,
    selectedForCompare,
    hasVersions,
    milestoneVersions,
    groupedByDate,
    loadVersions,
    createSnapshot,
    restoreVersion,
    toggleMilestone,
    deleteVersion,
    compareVersions,
    cleanupOldVersions,
    clearAll,
    togglePanel,
    closePanel,
    selectForCompare,
    clearCompareSelection,
    closeCompareDialog
  }
})
