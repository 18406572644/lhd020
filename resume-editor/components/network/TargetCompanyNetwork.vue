<template>
  <div class="target-company-wrapper">
    <div class="network-header">
      <h3><el-icon><OfficeBuilding /></el-icon> 目标公司人脉</h3>
      <div class="search-bar">
        <el-select 
          v-model="targetCompany" 
          placeholder="选择目标公司" 
          size="small" 
          style="width: 240px"
          filterable
        >
          <el-option 
            v-for="option in targetCompanyOptions" 
            :key="option.value" 
            :label="option.label" 
            :value="option.value"
          />
        </el-select>
        <el-input
          v-model="targetPosition"
          placeholder="目标职位（可选）"
          clearable
          size="small"
          style="width: 200px"
          :prefix-icon="Search"
        />
        <el-button type="primary" size="small" @click="searchConnections">
          <el-icon><Search /></el-icon> 查找人脉
        </el-button>
      </div>
    </div>

    <div class="network-content">
      <div v-if="!searchPerformed" class="initial-state">
        <el-empty description="请选择目标公司，查找您的人脉关系" />
      </div>

      <template v-else>
        <div class="search-summary">
          <el-alert 
            :title="`在 ${targetCompany} 找到 ${connections.length} 位人脉`" 
            type="success" 
            :closable="false"
            show-icon
          >
            <template #default>
              <span>其中 1度人脉 {{ firstDegreeCount }} 人，2度人脉 {{ secondDegreeCount }} 人，3度人脉 {{ thirdDegreeCount }} 人</span>
            </template>
          </el-alert>
        </div>

        <div class="connections-section">
          <div v-if="firstDegreeConnections.length > 0" class="degree-section">
            <h4 class="section-title">
              <el-tag type="primary" effect="dark" size="large">1度人脉</el-tag>
              <span class="section-desc">直接认识的朋友/同事</span>
            </h4>
            <div class="connections-grid">
              <el-card 
                v-for="conn in firstDegreeConnections" 
                :key="conn.person.id" 
                class="connection-card"
                shadow="hover"
              >
                <div class="card-content">
                  <div class="person-info">
                    <el-avatar :size="48">{{ (conn.person.anonymous ? conn.person.anonymousTitle : conn.person.name).charAt(0) }}</el-avatar>
                    <div class="person-detail">
                      <div class="person-name">
                        {{ conn.person.anonymous ? conn.person.anonymousTitle : conn.person.name }}
                        <el-tag type="success" size="small">{{ conn.person.currentPosition }}</el-tag>
                      </div>
                      <div class="person-company">{{ conn.person.currentCompany }}</div>
                      <div class="person-path">
                        <span class="path-label">直达:</span>
                        <span class="path-node">我</span>
                        <el-icon class="path-arrow"><ArrowRight /></el-icon>
                        <span class="path-node highlight">{{ conn.person.anonymous ? conn.person.anonymousTitle : conn.person.name }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="person-score">
                    <div class="score-label">价值分</div>
                    <el-progress 
                      type="dashboard" 
                      :percentage="conn.person.score" 
                      :width="80" 
                      :color="getScoreColor(conn.person.score)"
                    />
                  </div>
                </div>
                <div class="card-actions">
                  <el-button type="primary" size="small" @click="viewProfile(conn.person)">
                    <el-icon><View /></el-icon> 查看详情
                  </el-button>
                  <el-button type="success" size="small" @click="requestReferral(conn.person)">
                    <el-icon><Promotion /></el-icon> 直接内推
                  </el-button>
                </div>
              </el-card>
            </div>
          </div>

          <div v-if="secondDegreeConnections.length > 0" class="degree-section">
            <h4 class="section-title">
              <el-tag type="success" effect="dark" size="large">2度人脉</el-tag>
              <span class="section-desc">通过朋友认识的人脉</span>
            </h4>
            <div class="connections-grid">
              <el-card 
                v-for="conn in secondDegreeConnections" 
                :key="conn.person.id" 
                class="connection-card"
                shadow="hover"
              >
                <div class="card-content">
                  <div class="person-info">
                    <el-avatar :size="48">{{ (conn.person.anonymous ? conn.person.anonymousTitle : conn.person.name).charAt(0) }}</el-avatar>
                    <div class="person-detail">
                      <div class="person-name">
                        {{ conn.person.anonymous ? conn.person.anonymousTitle : conn.person.name }}
                        <el-tag type="success" size="small">{{ conn.person.currentPosition }}</el-tag>
                      </div>
                      <div class="person-company">{{ conn.person.currentCompany }}</div>
                      <div class="person-path">
                        <span class="path-label">路径:</span>
                        <span class="path-node">我</span>
                        <el-icon class="path-arrow"><ArrowRight /></el-icon>
                        <span v-for="(p, idx) in conn.path.slice(0, -1)" :key="p.id" class="path-node">
                          {{ p.anonymous ? p.anonymousTitle : p.name }}
                          <el-icon v-if="idx < conn.path.length - 2" class="path-arrow"><ArrowRight /></el-icon>
                        </span>
                        <el-icon class="path-arrow"><ArrowRight /></el-icon>
                        <span class="path-node highlight">{{ conn.person.anonymous ? conn.person.anonymousTitle : conn.person.name }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="person-score">
                    <div class="score-label">价值分</div>
                    <el-progress 
                      type="dashboard" 
                      :percentage="conn.person.score" 
                      :width="80" 
                      :color="getScoreColor(conn.person.score)"
                    />
                  </div>
                </div>
                <div class="card-actions">
                  <el-button type="primary" size="small" @click="viewProfile(conn.person)">
                    <el-icon><View /></el-icon> 查看详情
                  </el-button>
                  <el-button type="warning" size="small" @click="requestReferral(conn.person)">
                    <el-icon><Promotion /></el-icon> 请人引荐
                  </el-button>
                </div>
              </el-card>
            </div>
          </div>

          <div v-if="thirdDegreeConnections.length > 0" class="degree-section">
            <h4 class="section-title">
              <el-tag type="warning" effect="dark" size="large">3度人脉</el-tag>
              <span class="section-desc">需要两次引荐的人脉</span>
            </h4>
            <div class="connections-grid">
              <el-card 
                v-for="conn in thirdDegreeConnections" 
                :key="conn.person.id" 
                class="connection-card"
                shadow="hover"
              >
                <div class="card-content">
                  <div class="person-info">
                    <el-avatar :size="48">{{ (conn.person.anonymous ? conn.person.anonymousTitle : conn.person.name).charAt(0) }}</el-avatar>
                    <div class="person-detail">
                      <div class="person-name">
                        {{ conn.person.anonymous ? conn.person.anonymousTitle : conn.person.name }}
                        <el-tag type="success" size="small">{{ conn.person.currentPosition }}</el-tag>
                      </div>
                      <div class="person-company">{{ conn.person.currentCompany }}</div>
                      <div class="person-path">
                        <span class="path-label">路径:</span>
                        <span class="path-node">我</span>
                        <el-icon class="path-arrow"><ArrowRight /></el-icon>
                        <span v-for="(p, idx) in conn.path.slice(0, -1)" :key="p.id" class="path-node">
                          {{ p.anonymous ? p.anonymousTitle : p.name }}
                          <el-icon v-if="idx < conn.path.length - 2" class="path-arrow"><ArrowRight /></el-icon>
                        </span>
                        <el-icon class="path-arrow"><ArrowRight /></el-icon>
                        <span class="path-node highlight">{{ conn.person.anonymous ? conn.person.anonymousTitle : conn.person.name }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="person-score">
                    <div class="score-label">价值分</div>
                    <el-progress 
                      type="dashboard" 
                      :percentage="conn.person.score" 
                      :width="80" 
                      :color="getScoreColor(conn.person.score)"
                    />
                  </div>
                </div>
                <div class="card-actions">
                  <el-button type="primary" size="small" @click="viewProfile(conn.person)">
                    <el-icon><View /></el-icon> 查看详情
                  </el-button>
                  <el-button type="info" size="small" @click="requestReferral(conn.person)">
                    <el-icon><Promotion /></el-icon> 请求引荐
                  </el-button>
                </div>
              </el-card>
            </div>
          </div>
        </div>

        <div v-if="connections.length === 0" class="empty-state">
          <el-empty description="暂无在该公司的人脉" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { OfficeBuilding, Search, ArrowRight, View, Promotion } from '@element-plus/icons-vue'
import { targetCompanyOptions } from '@/data/networkData'
import type { Person } from '@/types/network'

const emit = defineEmits<{
  (e: 'referral', person: Person): void
  (e: 'view', person: Person): void
}>()

const networkStore = useNetworkStore()

const targetCompany = ref('')
const targetPosition = ref('')
const searchPerformed = ref(false)

type ConnectionResult = { person: Person; degree: 1 | 2 | 3; path: Person[] }

const connections = ref<ConnectionResult[]>([])

const firstDegreeConnections = computed(() => 
  connections.value.filter(c => c.degree === 1)
)
const secondDegreeConnections = computed(() => 
  connections.value.filter(c => c.degree === 2)
)
const thirdDegreeConnections = computed(() => 
  connections.value.filter(c => c.degree === 3)
)

const firstDegreeCount = computed(() => firstDegreeConnections.value.length)
const secondDegreeCount = computed(() => secondDegreeConnections.value.length)
const thirdDegreeCount = computed(() => thirdDegreeConnections.value.length)

function getScoreColor(score: number): string {
  if (score >= 80) return '#67C23A'
  if (score >= 60) return '#409EFF'
  if (score >= 40) return '#E6A23C'
  return '#F56C6C'
}

function searchConnections() {
  if (!targetCompany.value) {
    ElMessage.warning('请选择目标公司')
    return
  }
  searchPerformed.value = true
  connections.value = networkStore.findConnectionsAtCompany(targetCompany.value)
}

function viewProfile(person: Person) {
  emit('view', person)
}

function requestReferral(person: Person) {
  emit('referral', person)
}
</script>

<style lang="scss" scoped>
.target-company-wrapper {
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

    .search-bar {
      display: flex;
      gap: $spacing-sm;
      align-items: center;
    }
  }

  .network-content {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-lg;

    .initial-state,
    .empty-state {
      padding: $spacing-4xl;
    }

    .search-summary {
      margin-bottom: $spacing-lg;
    }

    .connections-section {
      .degree-section {
        margin-bottom: $spacing-2xl;

        &:last-child {
          margin-bottom: 0;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: $spacing-sm;
          margin: 0 0 $spacing-base 0;
          font-size: $font-size-base;
          font-weight: 600;

          .section-desc {
            font-size: $font-size-sm;
            font-weight: normal;
            color: $color-gray-500;
          }
        }

        .connections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: $spacing-lg;

          .connection-card {
            .card-content {
              display: flex;
              gap: $spacing-lg;
              align-items: flex-start;

              .person-info {
                flex: 1;
                display: flex;
                gap: $spacing-base;
                align-items: flex-start;

                .person-detail {
                  flex: 1;

                  .person-name {
                    display: flex;
                    align-items: center;
                    gap: $spacing-xs;
                    font-weight: 600;
                    color: $color-gray-800;
                  }

                  .person-company {
                    color: $primary-color;
                    font-size: $font-size-sm;
                    margin: $spacing-xs 0;
                  }

                  .person-path {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: $spacing-xs;
                    margin-top: $spacing-sm;
                    font-size: $font-size-xs;

                    .path-label {
                      color: $color-gray-500;
                    }

                    .path-node {
                      padding: 2px 6px;
                      background: $color-gray-100;
                      border-radius: $spacing-md;
                      color: $color-gray-700;

                      &.highlight {
                        background: $color-primary-light;
                        color: $primary-color;
                        font-weight: 500;
                      }
                    }

                    .path-arrow {
                      color: $color-gray-400;
                      font-size: 12px;
                    }
                  }
                }
              }

              .person-score {
                text-align: center;

                .score-label {
                  font-size: $font-size-xs;
                  color: $color-gray-500;
                  margin-bottom: $spacing-xs;
                }
              }
            }

            .card-actions {
              display: flex;
              gap: $spacing-sm;
              margin-top: $spacing-base;
              padding-top: $spacing-base;
              border-top: 1px solid $color-gray-100;

              .el-button {
                flex: 1;
              }
            }
          }
        }
      }
    }
  }
}
</style>
