import type { ResumeData, SavedResume, ApiResponse, TemplateConfig } from '@/types/resume'
import { defaultResumeData, templateConfigs, generateId } from '@/data/mockData'

const STORAGE_KEY = 'resume_editor_data'
const SAVED_RESUMES_KEY = 'saved_resumes'

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
