import type { 
  ResumeData, 
  SavedResume, 
  ApiResponse, 
  TemplateConfig, 
  VersionSnapshot, 
  FieldDiff, 
  DiffType,
  SnapshotType,
  VersionCompareResult 
} from '@/types/resume'
import { defaultResumeData, templateConfigs, generateId } from '@/data/mockData'

const STORAGE_KEY = 'resume_editor_data'
const SAVED_RESUMES_KEY = 'saved_resumes'
const VERSION_HISTORY_KEY = 'version_history'
const MAX_HISTORY_DAYS = 30
const AUTO_SAVE_THROTTLE_MS = 60000

// 模拟网络延迟
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// 简历 API
export const resumeApi = {
  // 获取默认简历数据
  async getDefaultResume(): Promise<ApiResponse<ResumeData>> {
    await delay(300)
    return {
      success: true,
      data: JSON.parse(JSON.stringify(defaultResumeData))
    }
  },

  // 获取简历数据（从本地存储）
  async getResume(): Promise<ApiResponse<ResumeData>> {
    await delay(200)
    if (typeof window === 'undefined') {
      return {
        success: true,
        data: JSON.parse(JSON.stringify(defaultResumeData))
      }
    }
    
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return {
        success: true,
        data: JSON.parse(saved)
      }
    }
    return {
      success: true,
      data: JSON.parse(JSON.stringify(defaultResumeData))
    }
  },

  // 保存简历数据（到本地存储）
  async saveResume(data: ResumeData): Promise<ApiResponse<{ savedAt: string }>> {
    await delay(500)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
    return {
      success: true,
      data: { savedAt: new Date().toISOString() },
      message: '保存成功'
    }
  },

  // 重置简历数据
  async resetResume(): Promise<ApiResponse<ResumeData>> {
    await delay(300)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
    return {
      success: true,
      data: JSON.parse(JSON.stringify(defaultResumeData)),
      message: '已重置为默认模板'
    }
  },

  // 获取所有模板
  async getTemplates(): Promise<ApiResponse<TemplateConfig[]>> {
    await delay(200)
    return {
      success: true,
      data: templateConfigs
    }
  },

  // 切换模板
  async switchTemplate(templateId: string): Promise<ApiResponse<{ template: string }>> {
    await delay(300)
    return {
      success: true,
      data: { template: templateId },
      message: '模板切换成功'
    }
  }
}

// 保存的简历列表 API
export const savedResumesApi = {
  // 获取所有保存的简历
  async getList(): Promise<ApiResponse<SavedResume[]>> {
    await delay(300)
    if (typeof window === 'undefined') {
      return { success: true, data: [] }
    }
    
    const saved = localStorage.getItem(SAVED_RESUMES_KEY)
    if (saved) {
      return {
        success: true,
        data: JSON.parse(saved)
      }
    }
    return { success: true, data: [] }
  },

  // 保存简历到列表
  async save(name: string, data: ResumeData, thumbnail: string = ''): Promise<ApiResponse<SavedResume>> {
    await delay(500)
    if (typeof window === 'undefined') {
      return { success: false, message: '仅支持浏览器端操作' }
    }

    const saved = localStorage.getItem(SAVED_RESUMES_KEY)
    const list: SavedResume[] = saved ? JSON.parse(saved) : []
    
    const newResume: SavedResume = {
      id: generateId(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(data)),
      thumbnail
    }
    
    list.unshift(newResume)
    localStorage.setItem(SAVED_RESUMES_KEY, JSON.stringify(list))
    
    return {
      success: true,
      data: newResume,
      message: '简历保存成功'
    }
  },

  // 更新保存的简历
  async update(id: string, name: string, data: ResumeData, thumbnail: string = ''): Promise<ApiResponse<SavedResume>> {
    await delay(500)
    if (typeof window === 'undefined') {
      return { success: false, message: '仅支持浏览器端操作' }
    }

    const saved = localStorage.getItem(SAVED_RESUMES_KEY)
    const list: SavedResume[] = saved ? JSON.parse(saved) : []
    
    const index = list.findIndex(item => item.id === id)
    if (index === -1) {
      return { success: false, message: '简历不存在' }
    }
    
    list[index] = {
      ...list[index],
      name,
      data: JSON.parse(JSON.stringify(data)),
      thumbnail,
      updatedAt: new Date().toISOString()
    }
    
    localStorage.setItem(SAVED_RESUMES_KEY, JSON.stringify(list))
    
    return {
      success: true,
      data: list[index],
      message: '简历更新成功'
    }
  },

  // 删除保存的简历
  async delete(id: string): Promise<ApiResponse<null>> {
    await delay(300)
    if (typeof window === 'undefined') {
      return { success: false, message: '仅支持浏览器端操作' }
    }

    const saved = localStorage.getItem(SAVED_RESUMES_KEY)
    const list: SavedResume[] = saved ? JSON.parse(saved) : []
    
    const filtered = list.filter(item => item.id !== id)
    localStorage.setItem(SAVED_RESUMES_KEY, JSON.stringify(filtered))
    
    return {
      success: true,
      data: null,
      message: '删除成功'
    }
  },

  // 获取单个保存的简历
  async getById(id: string): Promise<ApiResponse<SavedResume>> {
    await delay(200)
    if (typeof window === 'undefined') {
      return { success: false, message: '仅支持浏览器端操作' }
    }

    const saved = localStorage.getItem(SAVED_RESUMES_KEY)
    const list: SavedResume[] = saved ? JSON.parse(saved) : []
    
    const resume = list.find(item => item.id === id)
    if (!resume) {
      return { success: false, message: '简历不存在' }
    }
    
    return {
      success: true,
      data: resume
    }
  }
}

// 导出 API
export const exportApi = {
  // 导出为 JSON
  async exportJSON(data: ResumeData): Promise<ApiResponse<{ url: string; filename: string }>> {
    await delay(300)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    return {
      success: true,
      data: {
        url,
        filename: `resume_${Date.now()}.json`
      }
    }
  },

  // 导入 JSON
  async importJSON(file: File): Promise<ApiResponse<ResumeData>> {
    await delay(500)
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          resolve({ success: true, data })
        } catch (error) {
          reject({ success: false, message: '文件格式错误' })
        }
      }
      reader.onerror = () => reject({ success: false, message: '文件读取失败' })
      reader.readAsText(file)
    })
  }
}

// 深度对比两个对象
function deepDiff(obj1: any, obj2: any, path: string = ''): FieldDiff[] {
  const diffs: FieldDiff[] = []

  if (obj1 === obj2) return diffs

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    const maxLen = Math.max(obj1.length, obj2.length)
    for (let i = 0; i < maxLen; i++) {
      const currentPath = path ? `${path}[${i}]` : `[${i}]`
      if (i >= obj1.length) {
        diffs.push({
          path: currentPath,
          type: 'added',
          newValue: obj2[i]
        })
      } else if (i >= obj2.length) {
        diffs.push({
          path: currentPath,
          type: 'removed',
          oldValue: obj1[i]
        })
      } else {
        diffs.push(...deepDiff(obj1[i], obj2[i], currentPath))
      }
    }
    return diffs
  }

  if (typeof obj1 === 'object' && obj1 !== null &&
      typeof obj2 === 'object' && obj2 !== null) {
    const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)])
    for (const key of keys) {
      const currentPath = path ? `${path}.${key}` : key
      if (!(key in obj1)) {
        diffs.push({
          path: currentPath,
          type: 'added',
          newValue: obj2[key]
        })
      } else if (!(key in obj2)) {
        diffs.push({
          path: currentPath,
          type: 'removed',
          oldValue: obj1[key]
        })
      } else {
        diffs.push(...deepDiff(obj1[key], obj2[key], currentPath))
      }
    }
    return diffs
  }

  diffs.push({
    path,
    type: 'modified',
    oldValue: obj1,
    newValue: obj2
  })

  return diffs
}

// 生成修改摘要
function generateSummary(diffs: FieldDiff[], type: SnapshotType): string {
  if (diffs.length === 0) {
    return type === 'manual' ? '手动保存' : '自动保存'
  }

  const fieldMap: Record<string, string> = {
    'basicInfo.name': '姓名',
    'basicInfo.phone': '电话',
    'basicInfo.email': '邮箱',
    'basicInfo.jobTitle': '求职意向',
    'basicInfo.summary': '个人简介',
    'education': '教育经历',
    'workExperience': '工作经历',
    'projects': '项目经历',
    'skills': '技能',
    'certificates': '证书',
    'modules': '模块设置',
    'template': '模板',
    'charts': '数据可视化图表'
  }

  const changedFields = new Set<string>()
  for (const diff of diffs) {
    const topPath = diff.path.split('.')[0].split('[')[0]
    if (fieldMap[topPath]) {
      changedFields.add(fieldMap[topPath])
    } else if (fieldMap[diff.path]) {
      changedFields.add(fieldMap[diff.path])
    }
  }

  const prefix = type === 'manual' ? '手动保存' : '自动保存'
  if (changedFields.size > 0) {
    const fields = Array.from(changedFields).slice(0, 3).join('、')
    const more = changedFields.size > 3 ? `等${changedFields.size}项` : ''
    return `${prefix}：修改了${fields}${more}`
  }

  return `${prefix}：共${diffs.length}处修改`
}

// 版本历史 API
export const versionHistoryApi = {
  // 获取版本历史列表
  async getList(): Promise<ApiResponse<VersionSnapshot[]>> {
    await delay(200)
    if (typeof window === 'undefined') {
      return { success: true, data: [] }
    }

    const saved = localStorage.getItem(VERSION_HISTORY_KEY)
    if (saved) {
      const list: VersionSnapshot[] = JSON.parse(saved)
      return {
        success: true,
        data: list.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      }
    }
    return { success: true, data: [] }
  },

  // 创建版本快照
  async createSnapshot(
    data: ResumeData,
    type: SnapshotType,
    previousData?: ResumeData
  ): Promise<ApiResponse<VersionSnapshot>> {
    await delay(300)
    if (typeof window === 'undefined') {
      return { success: false, message: '仅支持浏览器端操作' }
    }

    if (type === 'auto') {
      const lastAutoSave = localStorage.getItem('last_auto_save')
      if (lastAutoSave) {
        const lastTime = parseInt(lastAutoSave)
        if (Date.now() - lastTime < AUTO_SAVE_THROTTLE_MS) {
          return { success: false, message: '自动保存节流中' }
        }
      }
      localStorage.setItem('last_auto_save', Date.now().toString())
    }

    const saved = localStorage.getItem(VERSION_HISTORY_KEY)
    const list: VersionSnapshot[] = saved ? JSON.parse(saved) : []

    const previousSnapshot = list.length > 0 ? list[0] : null

    const dataToCompare = previousData || previousSnapshot?.data

    const diffs = dataToCompare ? deepDiff(dataToCompare, data) : []

    // 自动保存时，如果没有差异则跳过
    if (type === 'auto' && diffs.length === 0) {
      return { success: false, message: '内容无变化' }
    }

    const summary = generateSummary(diffs, type)

    const snapshot: VersionSnapshot = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      type,
      data: JSON.parse(JSON.stringify(data)),
      summary,
      isMilestone: false,
      diffs: diffs.slice(0, 100)
    }

    list.unshift(snapshot)

    await this.cleanupOldVersions()

    localStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(list))

    return {
      success: true,
      data: snapshot,
      message: '版本快照创建成功'
    }
  },

  // 获取单个版本快照
  async getById(id: string): Promise<ApiResponse<VersionSnapshot>> {
    await delay(200)
    if (typeof window === 'undefined') {
      return { success: false, message: '仅支持浏览器端操作' }
    }

    const saved = localStorage.getItem(VERSION_HISTORY_KEY)
    const list: VersionSnapshot[] = saved ? JSON.parse(saved) : []

    const snapshot = list.find(item => item.id === id)
    if (!snapshot) {
      return { success: false, message: '版本不存在' }
    }

    return {
      success: true,
      data: snapshot
    }
  },

  // 对比两个版本
  async compareVersions(
    version1Id: string,
    version2Id: string
  ): Promise<ApiResponse<VersionCompareResult>> {
    await delay(300)
    if (typeof window === 'undefined') {
      return { success: false, message: '仅支持浏览器端操作' }
    }

    const saved = localStorage.getItem(VERSION_HISTORY_KEY)
    const list: VersionSnapshot[] = saved ? JSON.parse(saved) : []

    const v1 = list.find(item => item.id === version1Id)
    const v2 = list.find(item => item.id === version2Id)

    if (!v1 || !v2) {
      return { success: false, message: '版本不存在' }
    }

    const diffs = deepDiff(v1.data, v2.data)

    const stats = {
      added: diffs.filter(d => d.type === 'added').length,
      removed: diffs.filter(d => d.type === 'removed').length,
      modified: diffs.filter(d => d.type === 'modified').length
    }

    return {
      success: true,
      data: {
        version1: v1,
        version2: v2,
        diffs: diffs.slice(0, 200),
        stats
      }
    }
  },

  // 恢复到指定版本
  async restoreVersion(id: string): Promise<ApiResponse<ResumeData>> {
    await delay(300)
    if (typeof window === 'undefined') {
      return { success: false, message: '仅支持浏览器端操作' }
    }

    const saved = localStorage.getItem(VERSION_HISTORY_KEY)
    const list: VersionSnapshot[] = saved ? JSON.parse(saved) : []

    const snapshot = list.find(item => item.id === id)
    if (!snapshot) {
      return { success: false, message: '版本不存在' }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot.data))

    return {
      success: true,
      data: JSON.parse(JSON.stringify(snapshot.data)),
      message: '版本恢复成功'
    }
  },

  // 标记/取消里程碑
  async toggleMilestone(id: string): Promise<ApiResponse<VersionSnapshot>> {
    await delay(200)
    if (typeof window === 'undefined') {
      return { success: false, message: '仅支持浏览器端操作' }
    }

    const saved = localStorage.getItem(VERSION_HISTORY_KEY)
    const list: VersionSnapshot[] = saved ? JSON.parse(saved) : []

    const index = list.findIndex(item => item.id === id)
    if (index === -1) {
      return { success: false, message: '版本不存在' }
    }

    list[index].isMilestone = !list[index].isMilestone
    localStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(list))

    return {
      success: true,
      data: list[index],
      message: list[index].isMilestone ? '已标记为里程碑' : '已取消里程碑标记'
    }
  },

  // 删除版本
  async deleteVersion(id: string): Promise<ApiResponse<null>> {
    await delay(200)
    if (typeof window === 'undefined') {
      return { success: false, message: '仅支持浏览器端操作' }
    }

    const saved = localStorage.getItem(VERSION_HISTORY_KEY)
    const list: VersionSnapshot[] = saved ? JSON.parse(saved) : []

    const filtered = list.filter(item => item.id !== id)
    localStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(filtered))

    return {
      success: true,
      data: null,
      message: '删除成功'
    }
  },

  // 清理过期版本（保留最近30天，里程碑永久保留）
  async cleanupOldVersions(): Promise<ApiResponse<number>> {
    if (typeof window === 'undefined') {
      return { success: true, data: 0 }
    }

    const saved = localStorage.getItem(VERSION_HISTORY_KEY)
    const list: VersionSnapshot[] = saved ? JSON.parse(saved) : []

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - MAX_HISTORY_DAYS)
    const cutoffTime = cutoffDate.getTime()

    let deletedCount = 0
    const filtered = list.filter(item => {
      const itemTime = new Date(item.createdAt).getTime()
      if (item.isMilestone || itemTime >= cutoffTime) {
        return true
      }
      deletedCount++
      return false
    })

    if (deletedCount > 0) {
      localStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(filtered))
    }

    return {
      success: true,
      data: deletedCount,
      message: deletedCount > 0 ? `已清理${deletedCount}条过期记录` : '无需清理'
    }
  },

  // 清除所有版本历史
  async clearAll(): Promise<ApiResponse<null>> {
    await delay(200)
    if (typeof window === 'undefined') {
      return { success: false, message: '仅支持浏览器端操作' }
    }

    localStorage.removeItem(VERSION_HISTORY_KEY)

    return {
      success: true,
      data: null,
      message: '版本历史已清空'
    }
  }
}
