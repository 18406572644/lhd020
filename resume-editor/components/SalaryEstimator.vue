<template>
  <div class="salary-estimator">
    <div class="estimator-header">
      <h2 class="page-title">
        <el-icon><TrendCharts /></el-icon>
        薪资预估工具
      </h2>
      <p class="page-subtitle">基于您的简历信息和市场数据，为您提供专业的薪资参考</p>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-content">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p class="loading-text">正在分析您的简历数据...</p>
      </div>
    </div>

    <div v-else-if="result" class="estimator-content">
      <section class="salary-overview card">
        <div class="overview-header">
          <h3 class="card-title">
            <el-icon><Money /></el-icon>
            薪资预估范围
          </h3>
          <el-tag type="success" effect="dark" class="confidence-tag">
            置信度 {{ result.confidence }}%
          </el-tag>
        </div>
        
        <div class="salary-range-display">
          <div class="salary-item min">
            <span class="salary-label">最低</span>
            <span class="salary-value">{{ result.salaryRange.min }}{{ result.salaryRange.unit }}</span>
            <span class="salary-period">/月</span>
          </div>
          <div class="salary-divider"></div>
          <div class="salary-item median">
            <span class="salary-label">中位数</span>
            <span class="salary-value">{{ result.salaryRange.median }}{{ result.salaryRange.unit }}</span>
            <span class="salary-period">/月</span>
          </div>
          <div class="salary-divider"></div>
          <div class="salary-item max">
            <span class="salary-label">最高</span>
            <span class="salary-value">{{ result.salaryRange.max }}{{ result.salaryRange.unit }}</span>
            <span class="salary-period">/月</span>
          </div>
        </div>

        <div class="factors-section">
          <h4 class="section-subtitle">影响因素分析</h4>
          <div class="factors-grid">
            <div v-for="(factor, key) in factorLabels" :key="key" class="factor-item">
              <div class="factor-header">
                <el-icon :size="16">
                  <component :is="factorIcons[key as keyof typeof factorIcons]" />
                </el-icon>
                <span class="factor-name">{{ factor }}</span>
                <span class="factor-weight">({{ Math.round(result.factorWeights[key as keyof typeof result.factorWeights] * 100) }}%)</span>
              </div>
              <div class="factor-bar-container">
                <div class="factor-bar">
                  <div 
                    class="factor-bar-fill" 
                    :style="{ width: result.factors[key as keyof typeof result.factors] + '%' }"
                    :class="getFactorClass(result.factors[key as keyof typeof result.factors])"
                  ></div>
                </div>
                <span class="factor-score">{{ result.factors[key as keyof typeof result.factors] }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="content-grid">
        <section class="card">
          <h3 class="card-title">
            <el-icon><Histogram /></el-icon>
            同行业薪资分布
          </h3>
          <div class="distribution-chart">
            <div 
              v-for="(item, index) in result.distribution" 
              :key="index" 
              class="distribution-item"
            >
              <div class="distribution-bar-container">
                <div 
                  class="distribution-bar" 
                  :style="{ height: getBarHeight(item.percentage) }"
                  :class="{ 'active': isInCurrentRange(item, result.salaryRange.median) }"
                ></div>
              </div>
              <div class="distribution-info">
                <span class="distribution-range">{{ item.range }}</span>
                <span class="distribution-percentage">{{ item.percentage }}%</span>
              </div>
            </div>
          </div>
          <p class="chart-note">
            数据来源：基于 {{ result.distribution.reduce((sum, item) => sum + item.count, 0) }} 份真实薪资样本统计
          </p>
        </section>

        <section class="card">
          <h3 class="card-title">
            <el-icon><DataAnalysis /></el-icon>
            薪资对比分析
          </h3>
          <div class="comparison-list">
            <div 
              v-for="(comp, index) in result.comparisons" 
              :key="index" 
              class="comparison-item"
            >
              <div class="comparison-header">
                <span class="comparison-label">{{ getComparisonLabel(comp.category) }}：{{ comp.label }}</span>
                <el-tag 
                  :type="comp.userSalary >= comp.averageSalary ? 'success' : 'warning'"
                  size="small"
                >
                  {{ comp.userSalary >= comp.averageSalary ? '高于平均' : '低于平均' }}
                </el-tag>
              </div>
              <div class="comparison-bars">
                <div class="comparison-bar-row">
                  <span class="bar-label">您的薪资</span>
                  <div class="bar-container">
                    <div 
                      class="bar-fill user" 
                      :style="{ width: (comp.userSalary / maxComparisonSalary) * 100 + '%' }"
                    ></div>
                  </div>
                  <span class="bar-value">{{ comp.userSalary }}K</span>
                </div>
                <div class="comparison-bar-row">
                  <span class="bar-label">平均薪资</span>
                  <div class="bar-container">
                    <div 
                      class="bar-fill average" 
                      :style="{ width: (comp.averageSalary / maxComparisonSalary) * 100 + '%' }"
                    ></div>
                  </div>
                  <span class="bar-value">{{ comp.averageSalary }}K</span>
                </div>
              </div>
              <div class="comparison-percentile">
                <el-progress 
                  :percentage="comp.percentile" 
                  :color="getProgressColor(comp.percentile)"
                  :stroke-width="8"
                >
                  <span class="percentile-text">您超过了 {{ comp.percentile }}% 的同{{ getComparisonLabel(comp.category) }}从业者</span>
                </el-progress>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section class="card">
        <h3 class="card-title">
          <el-icon><TrendCharts /></el-icon>
          薪资走势分析
        </h3>
        <div class="trend-chart">
          <div class="trend-grid">
            <div class="trend-y-axis">
              <span v-for="(label, index) in trendYLabels" :key="index" class="y-label">{{ label }}K</span>
            </div>
            <div class="trend-area">
              <svg class="trend-svg" viewBox="0 0 600 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#409EFF;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#409EFF;stop-opacity:0" />
                  </linearGradient>
                </defs>
                <path :d="trendAreaPath" fill="url(#trendGradient)" />
                <path :d="trendLinePath" fill="none" stroke="#409EFF" stroke-width="3" />
                <circle 
                  v-for="(point, index) in trendPoints" 
                  :key="index"
                  :cx="point.x" 
                  :cy="point.y" 
                  r="5" 
                  fill="#409EFF"
                  stroke="#fff"
                  stroke-width="2"
                />
              </svg>
              <div class="trend-x-axis">
                <span 
                  v-for="(trend, index) in result.trends" 
                  :key="index" 
                  class="x-label"
                >
                  {{ trend.year }}
                  <span 
                    v-if="trend.growthRate > 0" 
                    class="growth-rate positive"
                  >
                    +{{ Math.round(trend.growthRate * 100) }}%
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="suggestions-header">
          <h3 class="card-title">
            <el-icon><Star /></el-icon>
            薪资提升建议
          </h3>
          <div class="suggestion-tabs">
            <el-radio-group v-model="activeSuggestionTab" size="small">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="skill">技能</el-radio-button>
              <el-radio-button label="certification">认证</el-radio-button>
              <el-radio-button label="education">学历</el-radio-button>
              <el-radio-button label="experience">经验</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        
        <div class="suggestions-list">
          <div v-if="filteredSuggestions.length === 0" class="empty-suggestions">
            <el-empty :description="`暂无${getTabLabel(activeSuggestionTab)}相关的提升建议`" :image-size="80">
              <el-button type="primary" size="small" @click="activeSuggestionTab = 'all'">查看全部建议</el-button>
            </el-empty>
          </div>
          <div 
            v-for="(suggestion, index) in filteredSuggestions" 
            :key="index" 
            class="suggestion-item"
          >
            <div class="suggestion-icon" :class="suggestion.type">
              <el-icon :size="20">
                <component :is="getSuggestionIcon(suggestion.type)" />
              </el-icon>
            </div>
            <div class="suggestion-content">
              <div class="suggestion-header">
                <h4 class="suggestion-title">{{ suggestion.title }}</h4>
                <el-tag 
                  :type="getDifficultyType(suggestion.difficulty)"
                  size="small"
                  effect="light"
                >
                  {{ getDifficultyLabel(suggestion.difficulty) }}
                </el-tag>
                <el-tag 
                  :type="getPriorityType(suggestion.priority)"
                  size="small"
                  effect="dark"
                >
                  {{ getPriorityLabel(suggestion.priority) }}优先级
                </el-tag>
              </div>
              <p class="suggestion-desc">{{ suggestion.description }}</p>
              <div class="suggestion-footer">
                <div class="salary-increase">
                  <el-icon><Top /></el-icon>
                  预计薪资提升 <span class="increase-value">+{{ suggestion.salaryIncrease }}K</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="refresh-section">
        <el-button type="primary" size="large" @click="refreshEstimate" :loading="refreshing">
          <el-icon><Refresh /></el-icon>
          重新预估
        </el-button>
        <span class="update-time">
          数据更新时间：{{ formatDate(result.lastUpdated) }}
        </span>
      </div>
    </div>

    <div v-else-if="error" class="error-container">
      <el-empty description="薪资预估失败">
        <el-button type="primary" @click="refreshEstimate">重新尝试</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  TrendCharts, 
  Money, 
  Histogram, 
  DataAnalysis, 
  Refresh, 
  Top,
  User,
  Clock,
  Location,
  Setting,
  OfficeBuilding,
  FolderOpened,
  Medal,
  Star,
  Guide,
  Loading
} from '@element-plus/icons-vue'
import { useResumeStore } from '@/stores/resume'
import { salaryApi } from '@/services/salaryApi'
import type { SalaryEstimateResult, ImprovementSuggestion } from '@/types/salary'
import { defaultResumeData } from '@/data/mockData'

const resumeStore = useResumeStore()

const loading = ref(true)
const refreshing = ref(false)
const error = ref(false)
const result = ref<SalaryEstimateResult | null>(null)
const activeSuggestionTab = ref('all')

const factorLabels = {
  education: '学历背景',
  years: '工作年限',
  city: '所在城市',
  skills: '技能栈',
  company: '公司背景',
  projects: '项目经历'
}

const factorIcons = {
  education: User,
  years: Clock,
  city: Location,
  skills: Setting,
  company: OfficeBuilding,
  projects: FolderOpened
}

const maxComparisonSalary = computed(() => {
  if (!result.value) return 100
  return Math.max(...result.value.comparisons.map(c => Math.max(c.userSalary, c.averageSalary))) * 1.2
})

const filteredSuggestions = computed(() => {
  if (!result.value) return []
  if (activeSuggestionTab.value === 'all') return result.value.suggestions
  return result.value.suggestions.filter(s => s.type === activeSuggestionTab.value)
})

const trendPoints = computed(() => {
  if (!result.value || result.value.trends.length === 0) return []
  const salaries = result.value.trends.map(t => t.averageSalary)
  const maxSalary = Math.max(...salaries) * 1.1
  const minSalary = Math.min(...salaries) * 0.9
  const range = maxSalary - minSalary
  
  return result.value.trends.map((trend, index) => ({
    x: 50 + (index / (result.value!.trends.length - 1)) * 500,
    y: 180 - ((trend.averageSalary - minSalary) / range) * 160
  }))
})

const trendLinePath = computed(() => {
  if (trendPoints.value.length === 0) return ''
  return trendPoints.value
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
})

const trendAreaPath = computed(() => {
  if (trendPoints.value.length === 0) return ''
  const linePath = trendLinePath.value
  const lastPoint = trendPoints.value[trendPoints.value.length - 1]
  const firstPoint = trendPoints.value[0]
  return `${linePath} L ${lastPoint.x} 200 L ${firstPoint.x} 200 Z`
})

const trendYLabels = computed(() => {
  if (!result.value || result.value.trends.length === 0) return ['0', '25', '50', '75', '100']
  const salaries = result.value.trends.map(t => t.averageSalary)
  const maxSalary = Math.max(...salaries) * 1.1
  const minSalary = Math.min(...salaries) * 0.9
  const step = (maxSalary - minSalary) / 4
  return Array.from({ length: 5 }, (_, i) => Math.round(maxSalary - i * step))
})

function getBarHeight(percentage: number): string {
  const maxHeight = 160
  const minHeight = 10
  const height = Math.max(minHeight, (percentage / 100) * maxHeight)
  return `${height}px`
}

function isInCurrentRange(item: { range: string }, median: number): boolean {
  const match = item.range.match(/(\d+)-(\d+)/)
  if (match) {
    const low = parseInt(match[1])
    const high = parseInt(match[2])
    return median >= low && median <= high
  }
  const belowMatch = item.range.match(/(\d+)K以下/)
  if (belowMatch) {
    return median < parseInt(belowMatch[1])
  }
  const aboveMatch = item.range.match(/(\d+)K以上/)
  if (aboveMatch) {
    return median > parseInt(aboveMatch[1])
  }
  return false
}

function getFactorClass(score: number): string {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'average'
  return 'poor'
}

function getComparisonLabel(category: string): string {
  const labels: Record<string, string> = {
    years: '年限',
    position: '岗位',
    city: '城市'
  }
  return labels[category] || category
}

function getProgressColor(percentage: number): string {
  if (percentage >= 70) return '#67C23A'
  if (percentage >= 50) return '#E6A23C'
  return '#F56C6C'
}

function getTabLabel(tab: string): string {
  const labels: Record<string, string> = {
    all: '全部',
    skill: '技能',
    certification: '认证',
    education: '学历',
    experience: '经验'
  }
  return labels[tab] || ''
}

function getSuggestionIcon(type: string): any {
  const icons: Record<string, any> = {
    skill: Setting,
    certification: Medal,
    education: Star,
    experience: Guide
  }
  return icons[type] || Star
}

function getDifficultyType(difficulty: string): string {
  const types: Record<string, string> = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return types[difficulty] || 'info'
}

function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return labels[difficulty] || difficulty
}

function getPriorityType(priority: string): string {
  const types: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[priority] || 'info'
}

function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return labels[priority] || priority
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function estimateSalary() {
  const data = defaultResumeData

  try {
    const res = await salaryApi.estimateSalary(data)
    if (res.success && res.data) {
      result.value = res.data
      error.value = false
    } else {
      error.value = true
      ElMessage.error(res.message || '薪资预估失败')
    }
  } catch (e) {
    error.value = true
    ElMessage.error('薪资预估服务异常')
  } finally {
    loading.value = false
  }
}

async function refreshEstimate() {
  refreshing.value = true
  loading.value = true
  try {
    await estimateSalary()
    ElMessage.success('薪资预估已更新')
  } finally {
    refreshing.value = false
  }
}

onMounted(() => {
  estimateSalary()
})
</script>

<style lang="scss" scoped>
.salary-estimator {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-xl;
  background-color: $color-gray-50;

  .estimator-header {
    text-align: center;
    margin-bottom: $spacing-xl;

    .page-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: $spacing-sm;
      font-size: $font-size-2xl;
      font-weight: 700;
      color: $color-gray-800;
      margin-bottom: $spacing-sm;

      .el-icon {
        color: $primary-color;
      }
    }

    .page-subtitle {
      font-size: $font-size-base;
      color: $color-gray-500;
    }
  }

  .loading-container {
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: $spacing-lg;
      color: $color-gray-600;

      .loading-icon {
        font-size: 48px;
        color: $primary-color;
        animation: rotate 1.2s linear infinite;
      }

      .loading-text {
        font-size: $font-size-base;
        margin: 0;
      }
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .error-container {
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .estimator-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: $spacing-xl;
  }

  .card {
    background: $color-white;
    border-radius: $border-radius-lg;
    padding: $spacing-xl;
    box-shadow: $shadow-sm;
    transition: $transition-base;

    &:hover {
      box-shadow: $shadow-base;
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      font-size: $font-size-lg;
      font-weight: 600;
      color: $color-gray-800;
      margin-bottom: $spacing-lg;

      .el-icon {
        color: $primary-color;
      }
    }

    .section-subtitle {
      font-size: $font-size-base;
      font-weight: 600;
      color: $color-gray-700;
      margin-bottom: $spacing-md;
    }
  }

  .salary-overview {
    .overview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-lg;

      .card-title {
        margin-bottom: 0;
      }

      .confidence-tag {
        font-size: $font-size-sm;
      }
    }

    .salary-range-display {
      display: flex;
      justify-content: center;
      align-items: stretch;
      gap: $spacing-lg;
      padding: $spacing-xl 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: $border-radius-lg;
      margin-bottom: $spacing-xl;

      .salary-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: $color-white;

        .salary-label {
          font-size: $font-size-base;
          opacity: 0.9;
          margin-bottom: $spacing-sm;
        }

        .salary-value {
          font-size: $font-size-4xl;
          font-weight: 700;
          line-height: 1;
        }

        .salary-period {
          font-size: $font-size-sm;
          opacity: 0.8;
          margin-top: $spacing-xs;
        }

        &.median {
          .salary-value {
            font-size: $font-size-4xl;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          }
        }
      }

      .salary-divider {
        width: 1px;
        background: rgba(255, 255, 255, 0.3);
      }
    }

    .factors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: $spacing-lg;

      .factor-item {
        .factor-header {
          display: flex;
          align-items: center;
          gap: $spacing-sm;
          margin-bottom: $spacing-xs;

          .el-icon {
            color: $primary-color;
          }

          .factor-name {
            font-size: $font-size-sm;
            color: $color-gray-700;
            font-weight: 500;
          }

          .factor-weight {
            font-size: $font-size-xs;
            color: $color-gray-500;
          }
        }

        .factor-bar-container {
          display: flex;
          align-items: center;
          gap: $spacing-sm;

          .factor-bar {
            flex: 1;
            height: 8px;
            background: $color-gray-100;
            border-radius: 4px;
            overflow: hidden;

            .factor-bar-fill {
              height: 100%;
              border-radius: 4px;
              transition: width 0.5s ease;

              &.excellent {
                background: linear-gradient(90deg, #67C23A, #95D475);
              }

              &.good {
                background: linear-gradient(90deg, #409EFF, #66B1FF);
              }

              &.average {
                background: linear-gradient(90deg, #E6A23C, #EEBE77);
              }

              &.poor {
                background: linear-gradient(90deg, #F56C6C, #F78989);
              }
            }
          }

          .factor-score {
            font-size: $font-size-sm;
            font-weight: 600;
            color: $color-gray-800;
            min-width: 30px;
            text-align: right;
          }
        }
      }
    }
  }

  .content-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: $spacing-xl;
  }

  .distribution-chart {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 200px;
    padding: $spacing-lg 0;

    .distribution-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: $spacing-sm;

      .distribution-bar-container {
        flex: 1;
        width: 100%;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding: 0 $spacing-xs;

        .distribution-bar {
          width: 32px;
          background: linear-gradient(180deg, #409EFF, #66B1FF);
          border-radius: 4px 4px 0 0;
          transition: all 0.3s ease;

          &:hover {
            opacity: 0.8;
            transform: scaleY(1.02);
          }

          &.active {
            background: linear-gradient(180deg, #E94560, #F78989);
            box-shadow: 0 0 10px rgba(233, 69, 96, 0.3);
          }
        }
      }

      .distribution-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;

        .distribution-range {
          font-size: $font-size-xs;
          color: $color-gray-600;
          white-space: nowrap;
        }

        .distribution-percentage {
          font-size: $font-size-xs;
          font-weight: 600;
          color: $color-gray-800;
        }
      }
    }
  }

  .chart-note {
    font-size: $font-size-xs;
    color: $color-gray-500;
    text-align: center;
    margin-top: $spacing-md;
  }

  .comparison-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;

    .comparison-item {
      padding: $spacing-lg;
      background: $color-gray-50;
      border-radius: $border-radius-base;

      .comparison-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $spacing-md;

        .comparison-label {
          font-size: $font-size-base;
          font-weight: 600;
          color: $color-gray-800;
        }
      }

      .comparison-bars {
        display: flex;
        flex-direction: column;
        gap: $spacing-sm;
        margin-bottom: $spacing-md;

        .comparison-bar-row {
          display: flex;
          align-items: center;
          gap: $spacing-sm;

          .bar-label {
            font-size: $font-size-sm;
            color: $color-gray-600;
            min-width: 60px;
          }

          .bar-container {
            flex: 1;
            height: 20px;
            background: $color-gray-200;
            border-radius: 10px;
            overflow: hidden;

            .bar-fill {
              height: 100%;
              border-radius: 10px;
              transition: width 0.5s ease;

              &.user {
                background: linear-gradient(90deg, #409EFF, #66B1FF);
              }

              &.average {
                background: linear-gradient(90deg, #909399, #A6A9AD);
              }
            }
          }

          .bar-value {
            font-size: $font-size-sm;
            font-weight: 600;
            color: $color-gray-800;
            min-width: 45px;
            text-align: right;
          }
        }
      }

      .comparison-percentile {
        .percentile-text {
          font-size: $font-size-xs;
          color: $color-gray-600;
        }
      }
    }
  }

  .trend-chart {
    .trend-grid {
      display: flex;
      gap: $spacing-sm;

      .trend-y-axis {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: $spacing-md 0;

        .y-label {
          font-size: $font-size-xs;
          color: $color-gray-500;
        }
      }

      .trend-area {
        flex: 1;

        .trend-svg {
          width: 100%;
          height: 200px;
        }

        .trend-x-axis {
          display: flex;
          justify-content: space-between;
          padding: 0 20px;
          margin-top: $spacing-sm;

          .x-label {
            display: flex;
            flex-direction: column;
            align-items: center;
            font-size: $font-size-sm;
            color: $color-gray-700;
            font-weight: 500;

            .growth-rate {
              font-size: $font-size-xs;
              margin-top: 2px;

              &.positive {
                color: $color-green-600;
              }
            }
          }
        }
      }
    }
  }

  .suggestions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;
    flex-wrap: wrap;
    gap: $spacing-md;

    .card-title {
      margin-bottom: 0;
    }
  }

  .suggestions-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;

    .empty-suggestions {
      padding: $spacing-2xl 0;
    }

    .suggestion-item {
      display: flex;
      gap: $spacing-lg;
      padding: $spacing-lg;
      background: $color-gray-50;
      border-radius: $border-radius-base;
      transition: $transition-base;
      border-left: 4px solid transparent;

      &:hover {
        background: $color-gray-100;
        transform: translateX(4px);
      }

      .suggestion-icon {
        width: 48px;
        height: 48px;
        border-radius: $border-radius-base;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        &.skill {
          background: rgba(64, 158, 255, 0.1);
          color: #409EFF;
        }

        &.certification {
          background: rgba(103, 194, 58, 0.1);
          color: #67C23A;
        }

        &.education {
          background: rgba(230, 162, 60, 0.1);
          color: #E6A23C;
        }

        &.experience {
          background: rgba(155, 89, 182, 0.1);
          color: #9B59B6;
        }
      }

      .suggestion-content {
        flex: 1;

        .suggestion-header {
          display: flex;
          align-items: center;
          gap: $spacing-sm;
          margin-bottom: $spacing-xs;
          flex-wrap: wrap;

          .suggestion-title {
            font-size: $font-size-base;
            font-weight: 600;
            color: $color-gray-800;
            margin: 0;
          }
        }

        .suggestion-desc {
          font-size: $font-size-sm;
          color: $color-gray-600;
          margin-bottom: $spacing-sm;
          line-height: 1.6;
        }

        .suggestion-footer {
          .salary-increase {
            display: inline-flex;
            align-items: center;
            gap: $spacing-xs;
            font-size: $font-size-sm;
            color: $color-gray-700;
            background: rgba(103, 194, 58, 0.1);
            padding: $spacing-xs $spacing-md;
            border-radius: 16px;

            .el-icon {
              color: #67C23A;
            }

            .increase-value {
              font-weight: 700;
              color: #67C23A;
            }
          }
        }
      }
    }
  }

  .refresh-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-xl 0;

    .update-time {
      font-size: $font-size-xs;
      color: $color-gray-500;
    }
  }
}

@media (max-width: 768px) {
  .salary-estimator {
    padding: $spacing-lg;

    .salary-range-display {
      flex-direction: column;
      gap: $spacing-lg;

      .salary-divider {
        width: 100%;
        height: 1px;
      }
    }

    .content-grid {
      grid-template-columns: 1fr;
    }

    .distribution-chart {
      .distribution-item {
        .distribution-bar-container {
          .distribution-bar {
            width: 24px;
          }
        }

        .distribution-info {
          .distribution-range {
            font-size: 10px;
          }
        }
      }
    }
  }
}
</style>
