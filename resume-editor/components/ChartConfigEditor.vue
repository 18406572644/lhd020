<template>
  <div class="chart-config-editor">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="基本信息" name="basic">
        <el-form :model="form" label-width="100px">
          <el-form-item label="图表标题">
            <el-input v-model="form.title" @change="emitUpdate" />
          </el-form-item>
          <el-form-item label="图表描述">
            <el-input v-model="form.description" type="textarea" :rows="2" @change="emitUpdate" />
          </el-form-item>
          <el-form-item label="图表宽度">
            <el-slider v-model="form.width" :min="50" :max="100" :step="10" @change="emitUpdate">
              <template #default="{ value }">
                <div class="slider-value">{{ value }}%</div>
              </template>
            </el-slider>
          </el-form-item>
          <el-form-item label="图表高度">
            <el-input-number v-model="form.height" :min="200" :max="600" :step="20" @change="emitUpdate" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="数据绑定" name="data">
        <el-form :model="dataBindingForm" label-width="100px">
          <el-form-item label="数据源">
            <el-select v-model="dataBindingForm.source" @change="emitDataBindingUpdate">
              <el-option label="技能数据" value="skills" />
              <el-option label="工作经历" value="workExperience" />
              <el-option label="项目经历" value="projects" />
              <el-option label="教育经历" value="education" />
              <el-option label="证书资质" value="certificates" />
              <el-option label="基本信息" value="basicInfo" />
            </el-select>
          </el-form-item>
          <el-form-item label="名称字段">
            <el-select v-model="dataBindingForm.fields.name" @change="emitDataBindingUpdate">
              <el-option v-for="field in availableFields" :key="field.value" :label="field.label" :value="field.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="数值字段">
            <el-select v-model="dataBindingForm.fields.value" @change="emitDataBindingUpdate">
              <el-option v-for="field in availableFields" :key="field.value" :label="field.label" :value="field.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="分类字段">
            <el-select v-model="dataBindingForm.fields.category" allow-create filterable @change="emitDataBindingUpdate">
              <el-option v-for="field in availableFields" :key="field.value" :label="field.label" :value="field.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期字段">
            <el-select v-model="dataBindingForm.fields.date" allow-create filterable @change="emitDataBindingUpdate">
              <el-option v-for="field in availableFields" :key="field.value" :label="field.label" :value="field.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="显示数量限制">
            <el-input-number v-model="filterForm.limit" :min="0" :max="20" @change="emitFilterUpdate" />
          </el-form-item>
          <el-form-item label="分类过滤">
            <el-select v-model="filterForm.category" allow-create filterable placeholder="选择或输入分类" @change="emitFilterUpdate">
              <el-option v-for="cat in availableCategories" :key="cat" :label="cat" :value="cat" />
            </el-select>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="样式配置" name="style">
        <el-form label-width="120px">
          <template v-if="chart.type === 'radar'">
            <el-form-item label="显示图例">
              <el-switch v-model="radarConfig.showLegend" @change="emitConfigUpdate" />
            </el-form-item>
            <el-form-item label="显示标签">
              <el-switch v-model="radarConfig.showLabel" @change="emitConfigUpdate" />
            </el-form-item>
          </template>

          <template v-else-if="chart.type === 'timeline'">
            <el-form-item label="布局方向">
              <el-radio-group v-model="timelineConfig.orientation" @change="emitConfigUpdate">
                <el-radio-button value="horizontal">水平</el-radio-button>
                <el-radio-button value="vertical">垂直</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="显示日期">
              <el-switch v-model="timelineConfig.showDate" @change="emitConfigUpdate" />
            </el-form-item>
            <el-form-item label="显示公司">
              <el-switch v-model="timelineConfig.showCompany" @change="emitConfigUpdate" />
            </el-form-item>
          </template>

          <template v-else-if="chart.type === 'bar'">
            <el-form-item label="显示网格">
              <el-switch v-model="barConfig.showGrid" @change="emitConfigUpdate" />
            </el-form-item>
            <el-form-item label="显示数值">
              <el-switch v-model="barConfig.showValue" @change="emitConfigUpdate" />
            </el-form-item>
            <el-form-item label="柱状宽度">
              <el-slider v-model="barConfig.barWidth" :min="20" :max="80" @change="emitConfigUpdate" />
            </el-form-item>
          </template>

          <template v-else-if="chart.type === 'heatmap'">
            <el-form-item label="配色方案">
              <el-select v-model="heatmapConfig.colorScheme" @change="emitConfigUpdate">
                <el-option label="蓝色系" value="blue" />
                <el-option label="绿色系" value="green" />
                <el-option label="橙色系" value="orange" />
                <el-option label="紫色系" value="purple" />
              </el-select>
            </el-form-item>
          </template>

          <template v-else-if="chart.type === 'dashboard'">
            <el-form-item label="布局方式">
              <el-radio-group v-model="dashboardConfig.layout" @change="emitConfigUpdate">
                <el-radio-button value="grid">网格</el-radio-button>
                <el-radio-button value="flex">流式</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="列数">
              <el-radio-group v-model="dashboardConfig.columns" @change="emitConfigUpdate">
                <el-radio-button :value="2">2列</el-radio-button>
                <el-radio-button :value="3">3列</el-radio-button>
                <el-radio-button :value="4">4列</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="自定义指标">
              <div class="metrics-editor">
                <div v-for="(metric, index) in dashboardConfig.metrics" :key="metric.id" class="metric-item">
                  <el-input v-model="metric.title" placeholder="指标名称" style="width: 120px" @change="emitConfigUpdate" />
                  <el-input v-model="metric.value" placeholder="数值" style="width: 100px" @change="emitConfigUpdate" />
                  <el-input v-model="metric.unit" placeholder="单位" style="width: 80px" @change="emitConfigUpdate" />
                  <el-input v-model="metric.icon" placeholder="图标" style="width: 100px" @change="emitConfigUpdate" />
                  <el-button size="small" text type="danger" @click="removeMetric(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
                <el-button size="small" @click="addMetric">
                  <el-icon><Plus /></el-icon>
                  添加指标
                </el-button>
              </div>
            </el-form-item>
          </template>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="预览" name="preview">
        <div class="preview-container">
          <ClientOnly>
            <ChartRenderer :chart="chart" :resume-data="resumeStore.resumeData" />
          </ClientOnly>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { Chart, RadarChartConfig, TimelineChartConfig, BarChartConfig, HeatmapChartConfig, DashboardChartConfig, DataFieldPath, DashboardMetric } from '@/types/resume'
import { generateId } from '@/data/mockData'
import ChartRenderer from './charts/ChartRenderer.vue'

const props = defineProps<{
  chart: Chart
}>()

const emit = defineEmits<{
  (e: 'update', updates: Partial<Chart>): void
}>()

const resumeStore = useResumeStore()
const activeTab = ref('basic')

const form = reactive({
  title: props.chart.title,
  description: props.chart.description,
  width: props.chart.width,
  height: props.chart.height
})

const dataBindingForm = reactive<DataBindingForm>({
  source: props.chart.dataBinding.source,
  fields: { ...props.chart.dataBinding.fields }
})

const filterForm = reactive({
  limit: props.chart.dataBinding.filter?.limit || 0,
  category: props.chart.dataBinding.filter?.category || ''
})

interface DataBindingForm {
  source: DataFieldPath
  fields: {
    name?: string
    value?: string
    category?: string
    date?: string
    description?: string
  }
}

const radarConfig = computed({
  get: () => props.chart.config as RadarChartConfig,
  set: (val) => {}
})

const timelineConfig = computed({
  get: () => props.chart.config as TimelineChartConfig,
  set: (val) => {}
})

const barConfig = computed({
  get: () => props.chart.config as BarChartConfig,
  set: (val) => {}
})

const heatmapConfig = computed({
  get: () => props.chart.config as HeatmapChartConfig,
  set: (val) => {}
})

const dashboardConfig = computed({
  get: () => props.chart.config as DashboardChartConfig,
  set: (val) => {}
})

const fieldOptions: Record<string, Array<{ label: string; value: string }>> = {
  skills: [
    { label: '技能名称', value: 'name' },
    { label: '熟练度', value: 'level' },
    { label: '分类', value: 'category' }
  ],
  workExperience: [
    { label: '职位', value: 'position' },
    { label: '公司', value: 'company' },
    { label: '开始时间', value: 'startDate' },
    { label: '结束时间', value: 'endDate' },
    { label: '当前职位', value: 'current' },
    { label: '工作亮点', value: 'highlights' }
  ],
  projects: [
    { label: '项目名称', value: 'name' },
    { label: '角色', value: 'role' },
    { label: '开始时间', value: 'startDate' },
    { label: '结束时间', value: 'endDate' },
    { label: '技术栈', value: 'technologies' },
    { label: '项目亮点', value: 'highlights' }
  ],
  education: [
    { label: '学校', value: 'school' },
    { label: '学位', value: 'degree' },
    { label: '专业', value: 'major' },
    { label: '开始时间', value: 'startDate' },
    { label: '结束时间', value: 'endDate' }
  ],
  certificates: [
    { label: '证书名称', value: 'name' },
    { label: '颁发机构', value: 'issuer' },
    { label: '颁发日期', value: 'date' }
  ],
  basicInfo: [
    { label: '姓名', value: 'name' },
    { label: '职位', value: 'jobTitle' },
    { label: '所在城市', value: 'location' }
  ]
}

const availableFields = computed(() => {
  return fieldOptions[dataBindingForm.source] || []
})

const availableCategories = computed(() => {
  if (!resumeStore.resumeData) return []
  const data = resumeStore.resumeData[dataBindingForm.source as keyof typeof resumeStore.resumeData]
  if (Array.isArray(data)) {
    return [...new Set(data.map(item => (item as any).category).filter(Boolean))]
  }
  return []
})

function emitUpdate() {
  emit('update', {
    title: form.title,
    description: form.description,
    width: form.width,
    height: form.height
  })
}

function emitDataBindingUpdate() {
  emit('update', {
    dataBinding: {
      source: dataBindingForm.source,
      fields: { ...dataBindingForm.fields },
      filter: {
        limit: filterForm.limit || undefined,
        category: filterForm.category || undefined
      }
    }
  })
}

function emitFilterUpdate() {
  emitDataBindingUpdate()
}

function emitConfigUpdate() {
  emit('update', {
    config: { ...props.chart.config }
  })
}

function addMetric() {
  const newMetric: DashboardMetric = {
    id: generateId(),
    title: '新指标',
    value: 0,
    unit: '',
    icon: 'Star'
  }
  dashboardConfig.value.metrics.push(newMetric)
  emitConfigUpdate()
}

function removeMetric(index: number) {
  dashboardConfig.value.metrics.splice(index, 1)
  emitConfigUpdate()
}

watch(
  () => props.chart,
  (newChart) => {
    form.title = newChart.title
    form.description = newChart.description
    form.width = newChart.width
    form.height = newChart.height
    dataBindingForm.source = newChart.dataBinding.source
    dataBindingForm.fields = { ...newChart.dataBinding.fields }
    filterForm.limit = newChart.dataBinding.filter?.limit || 0
    filterForm.category = newChart.dataBinding.filter?.category || ''
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.chart-config-editor {
  .slider-value {
    font-size: $font-size-sm;
    color: $color-gray-600;
    min-width: 40px;
  }
  
  .metrics-editor {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    
    .metric-item {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      padding: $spacing-sm;
      background: $color-gray-50;
      border-radius: $border-radius-base;
    }
  }
  
  .preview-container {
    min-height: 300px;
    padding: $spacing-base;
    background: $color-gray-50;
    border-radius: $border-radius-base;
  }
}

:deep(.el-tabs__content) {
  padding-top: $spacing-base;
}
</style>
