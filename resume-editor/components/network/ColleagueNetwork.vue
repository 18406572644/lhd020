<template>
  <div class="colleague-network-wrapper">
    <div class="network-header">
      <h3><el-icon><OfficeBuilding /></el-icon> 同事网络</h3>
      <div class="filter-bar">
        <el-input
          v-model="filter.company"
          placeholder="搜索公司"
          clearable
          size="small"
          style="width: 180px"
          :prefix-icon="Search"
        />
        <el-input
          v-model="filter.position"
          placeholder="搜索职位"
          clearable
          size="small"
          style="width: 180px"
          :prefix-icon="Search"
        />
        <el-button type="primary" size="small" @click="applyFilter">
          <el-icon><Filter /></el-icon> 筛选
        </el-button>
        <el-button size="small" @click="resetFilter">
          <el-icon><Refresh /></el-icon> 重置
        </el-button>
      </div>
    </div>

    <div class="network-content">
      <div class="company-tabs">
        <el-tabs v-model="activeCompany" type="card">
          <el-tab-pane 
            v-for="company in companies" 
            :key="company" 
            :label="company" 
            :name="company"
          >
            <span class="tab-badge">{{ getCompanyCount(company) }}</span>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div class="colleague-grid">
        <el-card 
          v-for="colleague in currentColleagues" 
          :key="colleague.id" 
          class="colleague-card"
          shadow="hover"
        >
          <div class="card-header">
            <el-avatar :size="56" class="colleague-avatar">
              {{ (colleague.anonymous ? colleague.anonymousTitle : colleague.name).charAt(0) }}
            </el-avatar>
            <div class="colleague-basic">
              <div class="colleague-name">
                {{ colleague.anonymous ? colleague.anonymousTitle : colleague.name }}
                <el-tag 
                  v-if="colleague.connectionDegree === 1" 
                  type="primary" 
                  size="small" 
                  effect="light"
                  class="degree-tag"
                >1度人脉</el-tag>
                <el-tag 
                  v-else-if="colleague.connectionDegree === 2" 
                  type="success" 
                  size="small" 
                  effect="light"
                  class="degree-tag"
                >2度人脉</el-tag>
                <el-tag 
                  v-else 
                  type="warning" 
                  size="small" 
                  effect="light"
                  class="degree-tag"
                >3度人脉</el-tag>
              </div>
              <div class="colleague-company">{{ colleague.currentCompany }}</div>
              <div class="colleague-position">{{ colleague.currentPosition }}</div>
            </div>
          </div>

          <el-divider />

          <div class="card-body">
            <div class="info-section">
              <div class="section-title">
                <el-icon><Briefcase /></el-icon> 职业发展路径
              </div>
              <el-timeline class="mini-timeline">
                <el-timeline-item
                  v-for="(work, idx) in colleague.workHistory.slice(0, 3)"
                  :key="idx"
                  :timestamp="work.startDate + (work.endDate ? ' - ' + work.endDate : ' 至今')"
                  :color="idx === 0 ? '#409EFF' : '#dcdfe6'"
                  size="small"
                >
                  <div class="timeline-content">
                    <span class="work-company">{{ work.company }}</span>
                    <span class="work-position">{{ work.position }}</span>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>

            <div class="info-section" v-if="colleague.projects.length > 0">
              <div class="section-title">
                <el-icon><Files /></el-icon> 共同项目
              </div>
              <div class="project-list">
                <el-tag 
                  v-for="project in colleague.projects.slice(0, 3)" 
                  :key="project.name"
                  size="small"
                  type="info"
                  effect="plain"
                  class="project-tag"
                >
                  {{ project.name }}
                </el-tag>
              </div>
            </div>

            <div class="info-section">
              <div class="section-title">
                <el-icon><TrendCharts /></el-icon> 人脉价值
              </div>
              <div class="score-display">
                <el-progress 
                  :percentage="colleague.score" 
                  :color="getScoreColor(colleague.score)"
                  :stroke-width="6"
                />
                <span class="score-value">{{ colleague.score }}分</span>
              </div>
              <div class="last-active">最近活跃: {{ colleague.lastActive }}</div>
            </div>
          </div>

          <div class="card-footer">
            <el-button type="primary" size="small" @click="viewProfile(colleague)">
              <el-icon><View /></el-icon> 查看详情
            </el-button>
            <el-button type="success" size="small" @click="requestReferral(colleague)">
              <el-icon><Promotion /></el-icon> 请求内推
            </el-button>
          </div>
        </el-card>
      </div>

      <div v-if="currentColleagues.length === 0" class="empty-state">
        <el-empty description="暂无符合条件的同事" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { OfficeBuilding, Search, Filter, Refresh, Briefcase, Files, TrendCharts, View, Promotion } from '@element-plus/icons-vue'
import type { Person, ColleagueFilter } from '@/types/network'

const emit = defineEmits<{
  (e: 'referral', person: Person): void
  (e: 'view', person: Person): void
}>()

const networkStore = useNetworkStore()

const filter = reactive<ColleagueFilter>({
  company: '',
  position: ''
})

const activeCompany = ref('')

const companies = computed(() => {
  const allColleagues = networkStore.colleagueNetwork
  const companySet = new Set(allColleagues.map(p => p.currentCompany))
  const result = Array.from(companySet)
  if (result.length > 0 && !activeCompany.value) {
    activeCompany.value = result[0]
  }
  return result
})

const filteredColleagues = computed(() => {
  return networkStore.filterColleagueNetwork(filter)
})

const currentColleagues = computed(() => {
  return filteredColleagues.value.filter(p => p.currentCompany === activeCompany.value)
})

function getCompanyCount(company: string): number {
  return filteredColleagues.value.filter(p => p.currentCompany === company).length
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#67C23A'
  if (score >= 60) return '#409EFF'
  if (score >= 40) return '#E6A23C'
  return '#F56C6C'
}

function applyFilter() {
  // 过滤逻辑已在 computed 中实现
}

function resetFilter() {
  filter.company = ''
  filter.position = ''
}

function viewProfile(person: Person) {
  emit('view', person)
}

function requestReferral(person: Person) {
  emit('referral', person)
}
</script>

<style lang="scss" scoped>
.colleague-network-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: $color-white;
  border-radius: $spacing-xs;
  overflow: hidden;

  .network-header {
    padding: $spacing-base $spacing-xl;
    border-bottom: 1px solid $color-gray-200;
    background: $color-gray-50;

    h3 {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      margin: 0 0 $spacing-base 0;
      font-size: $font-size-lg;
      font-weight: 600;

      .el-icon {
        color: $primary-color;
      }
    }

    .filter-bar {
      display: flex;
      gap: $spacing-sm;
      align-items: center;
    }
  }

  .network-content {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-lg;

    .company-tabs {
      margin-bottom: $spacing-lg;

      .tab-badge {
        display: inline-block;
        margin-left: $spacing-xs;
        padding: 0 $spacing-sm;
        background: $primary-color;
        color: $color-white;
        border-radius: 10px;
        font-size: $font-size-xs;
      }
    }

    .colleague-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: $spacing-lg;

      .colleague-card {
        display: flex;
        flex-direction: column;

        .card-header {
          display: flex;
          gap: $spacing-base;
          align-items: center;

          .colleague-avatar {
            font-size: $font-size-xl;
            font-weight: 600;
          }

          .colleague-basic {
            flex: 1;

            .colleague-name {
              font-size: $font-size-lg;
              font-weight: 600;
              color: $color-gray-800;
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              gap: $spacing-xs;

              .degree-tag {
                margin-left: $spacing-xs;
              }
            }

            .colleague-company {
              color: $primary-color;
              font-size: $font-size-base;
              margin: $spacing-xs 0;
            }

            .colleague-position {
              color: $color-gray-600;
              font-size: $font-size-sm;
            }
          }
        }

        .card-body {
          flex: 1;

          .info-section {
            margin-bottom: $spacing-base;

            &:last-child {
              margin-bottom: 0;
            }

            .section-title {
              display: flex;
              align-items: center;
              gap: $spacing-xs;
              font-size: $font-size-sm;
              font-weight: 500;
              color: $color-gray-700;
              margin-bottom: $spacing-sm;

              .el-icon {
                color: $primary-color;
              }
            }

            .mini-timeline {
              :deep(.el-timeline-item__timestamp) {
                font-size: $font-size-xs;
                color: $color-gray-500;
              }

              :deep(.el-timeline-item__tail) {
                left: 5px;
              }

              :deep(.el-timeline-item__node) {
                width: 10px;
                height: 10px;
              }

              .timeline-content {
                display: flex;
                flex-direction: column;

                .work-company {
                  font-weight: 500;
                  color: $color-gray-800;
                }

                .work-position {
                  font-size: $font-size-xs;
                  color: $color-gray-600;
                }
              }
            }

            .project-list {
              display: flex;
              flex-wrap: wrap;
              gap: $spacing-xs;

              .project-tag {
                margin: 0;
              }
            }

            .score-display {
              display: flex;
              align-items: center;
              gap: $spacing-sm;

              .el-progress {
                flex: 1;
              }

              .score-value {
                font-weight: 600;
                color: $color-gray-800;
                font-size: $font-size-sm;
                min-width: 40px;
              }
            }

            .last-active {
              font-size: $font-size-xs;
              color: $color-gray-500;
              margin-top: $spacing-xs;
            }
          }
        }

        .card-footer {
          display: flex;
          gap: $spacing-sm;
          padding-top: $spacing-base;
          border-top: 1px solid $color-gray-100;

          .el-button {
            flex: 1;
          }
        }
      }
    }

    .empty-state {
      padding: $spacing-4xl;
    }
  }
}
</style>
