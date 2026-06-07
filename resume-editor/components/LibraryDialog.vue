<template>
  <el-dialog
    v-model="dialogVisible"
    title="我的简历库"
    width="1200px"
    :close-on-click-modal="false"
    class="library-dialog-wrapper"
  >
    <div class="library-container">
      <aside class="sidebar">
        <div class="sidebar-section">
          <div class="section-header">
            <span class="section-title">
              <el-icon><FolderOpened /></el-icon>
              智能文件夹
            </span>
            <el-button 
              size="small" 
              type="primary" 
              :icon="Plus" 
              text 
              @click="showCreateFolderDialog"
            >
              新建
            </el-button>
          </div>
          <div class="folder-list">
            <div
              class="folder-item"
              :class="{ active: !libraryStore.activeSmartFolderId }"
              @click="libraryStore.applySmartFolder('')"
            >
              <el-icon><Collection /></el-icon>
              <span class="folder-name">全部简历</span>
              <el-tag size="small" type="info">{{ libraryStore.totalCount }}</el-tag>
            </div>
            <div
              v-for="folder in libraryStore.smartFolders"
              :key="folder.id"
              class="folder-item"
              :class="{ active: libraryStore.activeSmartFolderId === folder.id }"
              @click="libraryStore.applySmartFolder(folder.id)"
            >
              <el-icon :style="{ color: folder.color }">
                <component :is="folder.icon" />
              </el-icon>
              <span class="folder-name">{{ folder.name }}</span>
              <el-dropdown trigger="click" @click.stop>
                <el-icon class="more-btn"><MoreFilled /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleEditFolder(folder)">
                      <el-icon><Edit /></el-icon>编辑
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleDeleteFolder(folder.id)">
                      <el-icon><Delete /></el-icon>删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <div class="section-header">
            <span class="section-title">
              <el-icon><Filter /></el-icon>
              高级筛选
            </span>
            <el-button 
              size="small" 
              type="danger" 
              text 
              @click="libraryStore.resetFilters"
              :disabled="!libraryStore.hasActiveFilters"
            >
              重置
            </el-button>
          </div>
          
          <div class="filter-group">
            <div class="filter-label">时间范围</div>
            <div class="filter-content">
              <el-radio-group v-model="timeRangeField" size="small" class="mb-2">
                <el-radio-button value="createdAt">创建时间</el-radio-button>
                <el-radio-button value="updatedAt">更新时间</el-radio-button>
              </el-radio-group>
              <el-date-picker
                v-model="timeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="small"
                style="width: 100%"
                @change="handleTimeRangeChange"
              />
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-label">模板类型</div>
            <div class="filter-content">
              <el-checkbox-group v-model="selectedTemplates" @change="handleTemplateChange">
                <el-checkbox v-for="tpl in templateConfigs" :key="tpl.id" :label="tpl.id" border>
                  {{ tpl.name }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-label">标签</div>
            <div class="filter-content">
              <el-select
                v-model="selectedTags"
                multiple
                filterable
                placeholder="选择标签"
                size="small"
                style="width: 100%"
                @change="handleTagsChange"
              >
                <el-option
                  v-for="tag in presetTags"
                  :key="tag.id"
                  :label="tag.name"
                  :value="tag.name"
                >
                  <el-tag :color="tag.color" size="small">{{ tag.name }}</el-tag>
                </el-option>
              </el-select>
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-label">投递状态</div>
            <div class="filter-content">
              <el-checkbox-group v-model="selectedStatuses" @change="handleStatusChange">
                <el-checkbox 
                  v-for="status in deliveryStatusConfigs" 
                  :key="status.value" 
                  :label="status.value"
                  border
                >
                  <span :style="{ color: status.color }">{{ status.label }}</span>
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-label">目标行业</div>
            <div class="filter-content">
              <el-checkbox-group v-model="selectedIndustries" @change="handleIndustryChange">
                <el-checkbox 
                  v-for="industry in industryConfigs" 
                  :key="industry.value" 
                  :label="industry.value"
                  border
                >
                  {{ industry.label }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-label">目标岗位</div>
            <div class="filter-content">
              <el-input
                v-model="targetPosition"
                placeholder="输入岗位关键词"
                size="small"
                clearable
                @input="handlePositionChange"
              />
            </div>
          </div>
        </div>
      </aside>

      <main class="main-content">
        <div class="search-bar">
          <div class="search-input-wrapper">
            <el-tabs v-model="searchTab" class="search-tabs">
              <el-tab-pane label="关键词搜索" name="keyword">
                <div class="search-input-group">
                  <el-input
                    v-model="keyword"
                    placeholder="搜索简历内容，如：Python、字节跳动、清华大学..."
                    size="large"
                    clearable
                    @keyup.enter="handleKeywordSearch"
                    @clear="handleKeywordSearch"
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                    <template #append>
                      <el-button @click="handleKeywordSearch" type="primary">搜索</el-button>
                    </template>
                  </el-input>
                </div>
              </el-tab-pane>
              <el-tab-pane label="智能搜索" name="nlp">
                <div class="search-input-group">
                  <el-input
                    v-model="nlpQuery"
                    placeholder="自然语言搜索，如：找去年投递互联网岗位的简历、找最新的高分简历..."
                    size="large"
                    clearable
                    @keyup.enter="handleNLPSearch"
                    @clear="handleNLPSearch"
                  >
                    <template #prefix>
                      <el-icon><MagicStick /></el-icon>
                    </template>
                    <template #append>
                      <el-button @click="handleNLPSearch" type="primary">
                        <el-icon><Lightning /></el-icon>智能搜索
                      </el-button>
                    </template>
                  </el-input>
                </div>
                <el-alert
                  v-if="nlpParseResult"
                  :title="nlpParseResult.success ? '解析成功' : '无法解析'"
                  :description="nlpParseResult.parsedQuery || '请尝试更明确的描述，如：找去年互联网行业的前端简历'"
                  :type="nlpParseResult.success ? 'success' : 'warning'"
                  show-icon
                  :closable="false"
                  class="nlp-alert"
                />
              </el-tab-pane>
            </el-tabs>
          </div>

          <div class="search-actions">
            <div class="result-info">
              <span v-if="libraryStore.searchMode === 'similarity'">
                找到 <strong>{{ libraryStore.filteredCount }}</strong> 份相似简历
              </span>
              <span v-else>
                找到 <strong>{{ libraryStore.filteredCount }}</strong> / {{ libraryStore.totalCount }} 份简历
              </span>
            </div>
            <el-select
              v-model="sortOption"
              size="default"
              @change="handleSortChange"
            >
              <el-option
                v-for="option in sortOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <el-button
              v-if="libraryStore.searchMode !== 'similarity'"
              @click="showSaveFolderDialog"
              :disabled="!libraryStore.hasActiveFilters"
            >
              <el-icon><FolderAdd /></el-icon>
              保存筛选条件
            </el-button>
            <el-button
              v-if="libraryStore.searchMode === 'similarity'"
              @click="libraryStore.resetFilters"
              type="warning"
            >
              <el-icon><Refresh /></el-icon>
              返回全部
            </el-button>
          </div>
        </div>

        <div v-if="libraryStore.loading" class="loading-wrapper">
          <el-loading text="加载中..." />
        </div>

        <div v-else-if="libraryStore.searchResults.length === 0" class="empty-state">
          <el-empty :description="emptyDescription">
            <el-button type="primary" @click="libraryStore.resetFilters">重置筛选</el-button>
          </el-empty>
        </div>

        <div v-else class="resume-list">
          <div
            v-for="result in libraryStore.searchResults"
            :key="result.resume.id"
            class="resume-card"
            :class="{ 'similarity-mode': libraryStore.searchMode === 'similarity' }"
          >
            <div class="card-header">
              <div class="resume-thumbnail">
                <div 
                  class="thumbnail-preview" 
                  :style="{ '--primary': getTemplateColor(result.resume.data.template) }"
                >
                  <div class="preview-head"></div>
                  <div class="preview-body"></div>
                </div>
              </div>
              
              <div class="resume-main-info">
                <div class="resume-title-row">
                  <h3 class="resume-name">{{ result.resume.name }}</h3>
                  <div class="score-badge" v-if="result.resume.score.overall > 0">
                    <el-rate 
                      v-model="result.resume.score.overall" 
                      disabled 
                      show-score
                      text-color="#ff9900"
                      score-template="{value}分"
                      :max="100"
                    />
                  </div>
                </div>
                <div class="resume-subtitle">
                  <span>{{ result.resume.data.basicInfo.name }}</span>
                  <span class="dot">·</span>
                  <span>{{ result.resume.data.basicInfo.jobTitle }}</span>
                  <span class="dot">·</span>
                  <span>{{ searchService.getIndustryLabel(result.resume.targetIndustry) }}</span>
                </div>
                <div class="resume-tags">
                  <el-tag
                    v-for="tag in result.resume.tags"
                    :key="tag"
                    :color="getTagColor(tag)"
                    size="small"
                    class="resume-tag"
                  >
                    {{ tag }}
                  </el-tag>
                  <el-tag
                    :type="getStatusType(result.resume.deliveryStatus)"
                    size="small"
                    effect="light"
                  >
                    {{ searchService.getDeliveryStatusLabel(result.resume.deliveryStatus) }}
                  </el-tag>
                </div>
                <div class="match-info" v-if="result.matchedKeywords.length > 0">
                  <el-icon color="#67c23a"><CircleCheck /></el-icon>
                  <span>匹配关键词：</span>
                  <el-tag
                    v-for="kw in result.matchedKeywords.slice(0, 5)"
                    :key="kw"
                    type="success"
                    size="small"
                    effect="plain"
                  >
                    {{ kw }}
                  </el-tag>
                  <span v-if="result.matchedKeywords.length > 5" class="more-matches">
                    +{{ result.matchedKeywords.length - 5 }}个
                  </span>
                </div>
                <div class="similarity-info" v-if="libraryStore.searchMode === 'similarity'">
                  <div class="similarity-bar">
                    <div class="similarity-progress" :style="{ width: result.relevanceScore + '%' }"></div>
                  </div>
                  <span class="similarity-score">{{ result.relevanceScore }}% 相似</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <div class="resume-meta">
                <span class="meta-item">
                  <el-icon><Clock /></el-icon>
                  创建于 {{ formatDate(result.resume.createdAt) }}
                </span>
                <span class="meta-item">
                  <el-icon><RefreshRight /></el-icon>
                  更新于 {{ formatDate(result.resume.updatedAt) }}
                </span>
                <span class="meta-item">
                  <el-icon><Monitor /></el-icon>
                  {{ getTemplateName(result.resume.data.template) }}
                </span>
              </div>
              <div class="card-actions">
                <el-dropdown trigger="click">
                  <el-button size="small">
                    <el-icon><MoreFilled /></el-icon>
                    更多操作
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="handleFindSimilar(result.resume)">
                        <el-icon><CopyDocument /></el-icon>
                        查找相似简历
                      </el-dropdown-item>
                      <el-dropdown-item divided @click="handleEditMetadata(result.resume)">
                        <el-icon><Edit /></el-icon>
                        编辑信息
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-button size="small" type="primary" @click="handleLoad(result.resume.id)">
                  <el-icon><Loading /></el-icon>
                  加载
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  :loading="deletingId === result.resume.id"
                  @click="handleDelete(result.resume.id)"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <el-dialog
      v-model="createFolderVisible"
      title="新建智能文件夹"
      width="500px"
    >
      <el-form :model="folderForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="folderForm.name" placeholder="请输入文件夹名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="folderForm.description" 
            type="textarea" 
            :rows="2"
            placeholder="请输入描述（可选）"
          />
        </el-form-item>
        <el-form-item label="图标">
          <el-radio-group v-model="folderForm.icon">
            <el-radio-button value="Folder"><el-icon><Folder /></el-icon></el-radio-button>
            <el-radio-button value="Star"><el-icon><Star /></el-icon></el-radio-button>
            <el-radio-button value="Clock"><el-icon><Clock /></el-icon></el-radio-button>
            <el-radio-button value="ChatDotRound"><el-icon><ChatDotRound /></el-icon></el-radio-button>
            <el-radio-button value="CircleCheck"><el-icon><CircleCheck /></el-icon></el-radio-button>
            <el-radio-button value="Monitor"><el-icon><Monitor /></el-icon></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="folderForm.color" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createFolderVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateFolder">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="editMetadataVisible"
      title="编辑简历信息"
      width="500px"
    >
      <el-form :model="metadataForm" label-width="100px">
        <el-form-item label="简历名称">
          <el-input v-model="metadataForm.name" />
        </el-form-item>
        <el-form-item label="目标岗位">
          <el-input v-model="metadataForm.targetPosition" />
        </el-form-item>
        <el-form-item label="目标行业">
          <el-select v-model="metadataForm.targetIndustry" style="width: 100%">
            <el-option
              v-for="ind in industryConfigs"
              :key="ind.value"
              :label="ind.label"
              :value="ind.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="投递状态">
          <el-select v-model="metadataForm.deliveryStatus" style="width: 100%">
            <el-option
              v-for="status in deliveryStatusConfigs"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="metadataForm.tags" multiple style="width: 100%">
            <el-option
              v-for="tag in presetTags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.name"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editMetadataVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveMetadata">保存</el-button>
      </template>
    </el-dialog>

    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  MagicStick,
  Lightning,
  FolderOpened,
  Folder,
  FolderAdd,
  Plus,
  Collection,
  MoreFilled,
  Edit,
  Delete,
  Filter,
  Clock,
  RefreshRight,
  Monitor,
  CircleCheck,
  Star,
  ChatDotRound,
  Refresh,
  CopyDocument,
  Loading
} from '@element-plus/icons-vue'
import type { SavedResume, SmartFolder, FilterConditions, SortOption } from '@/types/resume'
import { searchService } from '@/services/searchService'
import { useResumeLibraryStore } from '@/stores/resumeLibrary'
import { useResumeStore } from '@/stores/resume'
import { templateConfigs } from '@/data/mockData'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const libraryStore = useResumeLibraryStore()
const resumeStore = useResumeStore()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const searchTab = ref<'keyword' | 'nlp'>('keyword')
const keyword = ref('')
const nlpQuery = ref('')
const nlpParseResult = computed(() => libraryStore.nlpParseResult)

const sortOption = ref<SortOption>('relevance')
const deletingId = ref<string | null>(null)

const createFolderVisible = ref(false)
const folderForm = ref({
  name: '',
  description: '',
  icon: 'Folder',
  color: '#409eff'
})

const editMetadataVisible = ref(false)
const editingResumeId = ref<string | null>(null)
const editingFolderId = ref<string | null>(null)
const metadataForm = ref({
  name: '',
  targetPosition: '',
  targetIndustry: 'internet' as any,
  deliveryStatus: 'pending' as any,
  tags: [] as string[]
})

const timeRangeField = ref<'createdAt' | 'updatedAt'>('createdAt')
const timeRange = ref<[string, string] | null>(null)
const selectedTemplates = ref<any[]>([])
const selectedTags = ref<string[]>([])
const selectedStatuses = ref<any[]>([])
const selectedIndustries = ref<any[]>([])
const targetPosition = ref('')

const deliveryStatusConfigs = searchService.getDeliveryStatusConfigs()
const industryConfigs = searchService.getIndustryConfigs()
const sortOptions = searchService.getSortOptions()
const presetTags = searchService.getPresetTags()

const emptyDescription = computed(() => {
  if (libraryStore.searchMode === 'nlp') {
    return '没有找到匹配的简历，请尝试调整搜索条件'
  }
  if (libraryStore.searchMode === 'similarity') {
    return '没有找到相似的简历'
  }
  if (libraryStore.hasActiveFilters) {
    return '没有符合筛选条件的简历'
  }
  return '暂无保存的简历'
})

watch(dialogVisible, async (val) => {
  if (val) {
    await libraryStore.initLibrary()
    syncFiltersFromStore()
  }
})

watch(sortOption, (val) => {
  libraryStore.updateSortOption(val)
})

function syncFiltersFromStore() {
  const filters = libraryStore.filterConditions
  if (filters.timeRange) {
    timeRangeField.value = filters.timeRange.field
    if (filters.timeRange.startDate && filters.timeRange.endDate) {
      timeRange.value = [filters.timeRange.startDate, filters.timeRange.endDate]
    }
  } else {
    timeRange.value = null
  }
  selectedTemplates.value = [...filters.templateTypes] as any[]
  selectedTags.value = [...filters.tags]
  selectedStatuses.value = [...filters.deliveryStatuses] as any[]
  selectedIndustries.value = [...filters.targetIndustries] as any[]
  targetPosition.value = filters.targetPosition
  keyword.value = filters.keyword
  sortOption.value = libraryStore.sortOption
}

function handleTimeRangeChange(val: [string, string] | null) {
  if (val && val[0] && val[1]) {
    libraryStore.updateFilters({
      timeRange: {
        field: timeRangeField.value,
        startDate: val[0],
        endDate: val[1]
      }
    })
  } else {
    libraryStore.updateFilters({ timeRange: null })
  }
}

function handleTemplateChange(val: any[]) {
  libraryStore.updateFilters({ templateTypes: val as any })
}

function handleTagsChange(val: string[]) {
  libraryStore.updateFilters({ tags: val })
}

function handleStatusChange(val: any[]) {
  libraryStore.updateFilters({ deliveryStatuses: val as any })
}

function handleIndustryChange(val: any[]) {
  libraryStore.updateFilters({ targetIndustries: val as any })
}

function handlePositionChange(val: string) {
  libraryStore.updateFilters({ targetPosition: val })
}

function handleKeywordSearch() {
  libraryStore.updateFilters({ keyword: keyword.value })
}

function handleNLPSearch() {
  if (!nlpQuery.value.trim()) {
    libraryStore.resetFilters()
    return
  }
  const result = libraryStore.performNLPSearch(nlpQuery.value)
  if (result.success) {
    keyword.value = result.filterConditions.keyword || ''
    syncFiltersFromStore()
  }
}

function handleSortChange(val: SortOption) {
  libraryStore.updateSortOption(val)
}

function getTemplateColor(templateId: string): string {
  return templateConfigs.find(t => t.id === templateId)?.primaryColor || '#1a1a2e'
}

function getTemplateName(templateId: string): string {
  return templateConfigs.find(t => t.id === templateId)?.name || templateId
}

function getTagColor(tagName: string): string {
  return presetTags.find(t => t.name === tagName)?.color || '#909399'
}

function getStatusType(status: string): 'success' | 'warning' | 'info' | 'danger' {
  const typeMap: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    'pending': 'info',
    'interviewing': 'warning',
    'offered': 'success',
    'rejected': 'danger'
  }
  return typeMap[status] || 'info'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

async function handleLoad(id: string) {
  const success = await resumeStore.loadFromLibrary(id)
  if (success) {
    ElMessage.success('加载成功')
    dialogVisible.value = false
  } else {
    ElMessage.error('加载失败')
  }
}

async function handleDelete(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除这份简历吗？此操作不可恢复。', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    deletingId.value = id
    libraryStore.deleteResume(id)
    ElMessage.success('删除成功')
  } catch {
  } finally {
    deletingId.value = null
  }
}

function handleFindSimilar(resume: SavedResume) {
  libraryStore.findSimilarResumes(resume, 20)
  ElMessage.info(`正在查找与"${resume.name}"相似的简历`)
}

function handleEditMetadata(resume: SavedResume) {
  editingResumeId.value = resume.id
  metadataForm.value = {
    name: resume.name,
    targetPosition: resume.targetPosition,
    targetIndustry: resume.targetIndustry,
    deliveryStatus: resume.deliveryStatus,
    tags: [...resume.tags]
  }
  editMetadataVisible.value = true
}

function handleSaveMetadata() {
  if (!editingResumeId.value) return
  libraryStore.updateResumeMetadata(editingResumeId.value, {
    ...metadataForm.value
  })
  ElMessage.success('保存成功')
  editMetadataVisible.value = false
}

function showCreateFolderDialog() {
  folderForm.value = {
    name: '',
    description: '',
    icon: 'Folder',
    color: '#409eff'
  }
  editingFolderId.value = null
  createFolderVisible.value = true
}

function showSaveFolderDialog() {
  const sampleFilters = JSON.stringify(libraryStore.filterConditions, null, 2).slice(0, 100)
  folderForm.value = {
    name: '我的筛选',
    description: `基于当前筛选条件自动更新：${sampleFilters}...`,
    icon: 'Folder',
    color: '#409eff'
  }
  createFolderVisible.value = true
}

async function handleCreateFolder() {
  if (!folderForm.value.name.trim()) {
    ElMessage.warning('请输入文件夹名称')
    return
  }
  
  if (editingFolderId.value) {
    await libraryStore.updateSmartFolder(editingFolderId.value, {
      name: folderForm.value.name,
      description: folderForm.value.description,
      icon: folderForm.value.icon,
      color: folderForm.value.color
    })
    ElMessage.success('智能文件夹更新成功')
  } else {
    await libraryStore.createSmartFolder(
      folderForm.value.name,
      folderForm.value.description,
      folderForm.value.icon,
      folderForm.value.color
    )
    ElMessage.success('智能文件夹创建成功')
  }
  
  editingFolderId.value = null
  createFolderVisible.value = false
}

function handleEditFolder(folder: SmartFolder) {
  folderForm.value = {
    name: folder.name,
    description: folder.description,
    icon: folder.icon,
    color: folder.color
  }
  editingFolderId.value = folder.id
  createFolderVisible.value = true
}

async function handleDeleteFolder(folderId: string) {
  try {
    await ElMessageBox.confirm('确定要删除这个智能文件夹吗？简历不会被删除。', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await libraryStore.deleteSmartFolder(folderId)
    ElMessage.success('删除成功')
  } catch {
  }
}
</script>

<style lang="scss" scoped>
.library-dialog-wrapper {
  .el-dialog__body {
    padding: 0;
  }
}

.library-container {
  display: flex;
  min-height: 600px;
  max-height: 75vh;
  overflow: hidden;
}

.sidebar {
  width: 300px;
  border-right: 1px solid $color-gray-200;
  overflow-y: auto;
  padding: $spacing-base;
  flex-shrink: 0;

  .sidebar-section {
    margin-bottom: $spacing-xl;

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: $spacing-base;

      .section-title {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        font-weight: 600;
        font-size: $font-size-base;
        color: $color-gray-800;
      }
    }
  }

  .folder-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;

    .folder-item {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      padding: $spacing-sm $spacing-base;
      border-radius: $border-radius-md;
      cursor: pointer;
      transition: $transition-base;
      position: relative;

      .folder-name {
        flex: 1;
        font-size: $font-size-sm;
        color: $color-gray-700;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .more-btn {
        opacity: 0;
        transition: $transition-base;
      }

      &:hover {
        background: $color-gray-50;

        .more-btn {
          opacity: 1;
        }
      }

      &.active {
        background: $color-primary-lightest;
        color: $color-primary;

        .folder-name {
          color: $color-primary;
          font-weight: 500;
        }
      }
    }
  }

  .filter-group {
    margin-bottom: $spacing-lg;

    .filter-label {
      font-size: $font-size-sm;
      color: $color-gray-600;
      margin-bottom: $spacing-sm;
      font-weight: 500;
    }

    .filter-content {
      :deep(.el-checkbox-group) {
        display: flex;
        flex-wrap: wrap;
        gap: $spacing-xs;
      }
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-bar {
  padding: $spacing-base;
  border-bottom: 1px solid $color-gray-200;
  flex-shrink: 0;

  .search-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: $spacing-sm;
    }
    
    :deep(.el-tabs__item) {
      height: 32px;
      line-height: 32px;
      font-size: $font-size-sm;
    }
  }

  .search-input-group {
    margin-bottom: $spacing-sm;
  }

  .nlp-alert {
    margin-bottom: $spacing-sm;
  }

  .search-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: $spacing-sm;

    .result-info {
      font-size: $font-size-sm;
      color: $color-gray-600;

      strong {
        color: $color-primary;
        font-size: $font-size-base;
      }
    }

    display: flex;
    gap: $spacing-sm;
  }
}

.loading-wrapper,
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-4xl;
}

.resume-list {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-base;
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.resume-card {
  border: 1px solid $color-gray-200;
  border-radius: $border-radius-lg;
  padding: $spacing-base;
  transition: $transition-base;
  background: $color-white;

  &:hover {
    border-color: $accent-color;
    box-shadow: $shadow-base;
  }

  &.similarity-mode {
    border-left: 4px solid $color-success;
  }

  .card-header {
    display: flex;
    gap: $spacing-base;
    margin-bottom: $spacing-base;

    .resume-thumbnail {
      width: 70px;
      height: 90px;
      flex-shrink: 0;

      .thumbnail-preview {
        width: 100%;
        height: 100%;
        border-radius: $border-radius-sm;
        overflow: hidden;
        border: 1px solid $color-gray-200;

        .preview-head {
          height: 30%;
          background: var(--primary);
        }

        .preview-body {
          height: 70%;
          background: $color-white;
          padding: $spacing-xs;

          &::before,
          &::after {
            content: '';
            display: block;
            height: 4px;
            background: $color-gray-200;
            margin-bottom: $spacing-xs;
            border-radius: 2px;
          }

          &::before {
            width: 70%;
          }

          &::after {
            width: 100%;
          }
        }
      }
    }

    .resume-main-info {
      flex: 1;
      min-width: 0;

      .resume-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: $spacing-xs;

        .resume-name {
          font-size: $font-size-lg;
          font-weight: 600;
          color: $color-gray-800;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .score-badge {
          flex-shrink: 0;
          :deep(.el-rate__text) {
            font-size: $font-size-sm;
            font-weight: 600;
          }
        }
      }

      .resume-subtitle {
        font-size: $font-size-sm;
        color: $color-gray-600;
        margin-bottom: $spacing-sm;
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        flex-wrap: wrap;

        .dot {
          color: $color-gray-400;
        }
      }

      .resume-tags {
        display: flex;
        flex-wrap: wrap;
        gap: $spacing-xs;
        margin-bottom: $spacing-sm;

        .resume-tag {
          margin-right: 0;
        }
      }

      .match-info {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        flex-wrap: wrap;
        font-size: $font-size-sm;
        color: $color-gray-600;
        margin-bottom: $spacing-xs;

        .more-matches {
          color: $color-gray-500;
          font-size: $font-size-xs;
        }
      }

      .similarity-info {
        display: flex;
        align-items: center;
        gap: $spacing-sm;

        .similarity-bar {
          flex: 1;
          height: 8px;
          background: $color-gray-100;
          border-radius: 4px;
          overflow: hidden;

          .similarity-progress {
            height: 100%;
            background: linear-gradient(90deg, $color-success, $color-warning);
            border-radius: 4px;
            transition: width $transition-base;
          }
        }

        .similarity-score {
          font-size: $font-size-sm;
          font-weight: 600;
          color: $color-success;
          flex-shrink: 0;
        }
      }
    }
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: $spacing-base;
    border-top: 1px solid $color-gray-100;

    .resume-meta {
      display: flex;
      align-items: center;
      gap: $spacing-lg;
      flex-wrap: wrap;

      .meta-item {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        font-size: $font-size-xs;
        color: $color-gray-500;
      }
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
    }
  }
}

.mb-2 {
  margin-bottom: $spacing-sm;
}
</style>
