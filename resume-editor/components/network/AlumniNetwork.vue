<template>
  <div class="alumni-network-wrapper">
    <div class="network-header">
      <h3><el-icon><School /></el-icon> 校友网络</h3>
      <div class="filter-bar">
        <el-input
          v-model="filter.school"
          placeholder="搜索学校"
          clearable
          size="small"
          style="width: 180px"
          :prefix-icon="Search"
        />
        <el-input
          v-model="filter.major"
          placeholder="搜索专业"
          clearable
          size="small"
          style="width: 180px"
          :prefix-icon="Search"
        />
        <el-select v-model="filter.degree" placeholder="学历" clearable size="small" style="width: 120px">
          <el-option label="本科" value="本科" />
          <el-option label="硕士" value="硕士" />
          <el-option label="博士" value="博士" />
        </el-select>
        <el-button type="primary" size="small" @click="applyFilter">
          <el-icon><Filter /></el-icon> 筛选
        </el-button>
        <el-button size="small" @click="resetFilter">
          <el-icon><Refresh /></el-icon> 重置
        </el-button>
      </div>
    </div>

    <div class="network-content">
      <div class="network-stats">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon success"><User /></el-icon>
            <div class="stat-text">
              <div class="stat-value">{{ filteredAlumni.length }}</div>
              <div class="stat-label">校友总数</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon primary"><OfficeBuilding /></el-icon>
            <div class="stat-text">
              <div class="stat-value">{{ topCompanyCount }}</div>
              <div class="stat-label">就职公司</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon warning"><TrendCharts /></el-icon>
            <div class="stat-text">
              <div class="stat-value">{{ avgScore }}</div>
              <div class="stat-label">平均价值分</div>
            </div>
          </div>
        </el-card>
      </div>

      <div class="alumni-list">
        <el-table :data="filteredAlumni" stripe style="width: 100%">
          <el-table-column label="校友信息" width="280">
            <template #default="{ row }">
              <div class="alumni-info">
                <el-avatar :size="48">{{ (row.anonymous ? row.anonymousTitle : row.name).charAt(0) }}</el-avatar>
                <div class="alumni-detail">
                  <div class="alumni-name">
                    {{ row.anonymous ? row.anonymousTitle : row.name }}
                    <el-tag v-if="row.connectionDegree === 1" type="primary" size="small" class="degree-tag">1度</el-tag>
                    <el-tag v-else-if="row.connectionDegree === 2" type="success" size="small" class="degree-tag">2度</el-tag>
                    <el-tag v-else type="warning" size="small" class="degree-tag">3度</el-tag>
                  </div>
                  <div class="alumni-company">{{ row.currentCompany }}</div>
                  <div class="alumni-position">{{ row.currentPosition }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="学校信息">
            <template #default="{ row }">
              <div v-for="(edu, idx) in row.schools" :key="idx" class="school-info">
                <div class="school-name">{{ edu.school }}</div>
                <div class="school-major">{{ edu.degree }} · {{ edu.major }}</div>
                <div class="school-date">{{ edu.startDate }} - {{ edu.endDate }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="技能" width="200">
            <template #default="{ row }">
              <div class="skill-tags">
                <el-tag 
                  v-for="skill in row.skills.slice(0, 4)" 
                  :key="skill" 
                  size="small" 
                  type="info"
                  class="skill-tag"
                >
                  {{ skill }}
                </el-tag>
                <el-tag v-if="row.skills.length > 4" size="small" type="info" class="skill-tag">
                  +{{ row.skills.length - 4 }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="价值分" width="120">
            <template #default="{ row }">
              <div class="score-display">
                <el-progress 
                  :percentage="row.score" 
                  :color="getScoreColor(row.score)"
                  :stroke-width="8"
                />
                <span class="score-text">{{ row.score }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="viewProfile(row)">
                <el-icon><View /></el-icon> 详情
              </el-button>
              <el-button size="small" type="success" @click="requestReferral(row)">
                <el-icon><Promotion /></el-icon> 内推
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="filteredAlumni.length === 0" class="empty-state">
        <el-empty description="暂无符合条件的校友" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { School, Search, Filter, Refresh, User, OfficeBuilding, TrendCharts, View, Promotion } from '@element-plus/icons-vue'
import type { Person, AlumniFilter } from '@/types/network'

const emit = defineEmits<{
  (e: 'referral', person: Person): void
  (e: 'view', person: Person): void
}>()

const networkStore = useNetworkStore()

const filter = reactive<AlumniFilter>({
  school: '',
  major: '',
  degree: ''
})

const filteredAlumni = computed(() => {
  return networkStore.filterAlumniNetwork(filter)
})

const topCompanyCount = computed(() => {
  const companies = new Set(filteredAlumni.value.map(p => p.currentCompany))
  return companies.size
})

const avgScore = computed(() => {
  if (filteredAlumni.value.length === 0) return 0
  const total = filteredAlumni.value.reduce((sum, p) => sum + p.score, 0)
  return Math.round(total / filteredAlumni.value.length)
})

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
  filter.school = ''
  filter.major = ''
  filter.degree = ''
}

function viewProfile(person: Person) {
  emit('view', person)
}

function requestReferral(person: Person) {
  emit('referral', person)
}
</script>

<style lang="scss" scoped>
.alumni-network-wrapper {
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

    .network-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: $spacing-lg;
      margin-bottom: $spacing-lg;

      .stat-card {
        .stat-content {
          display: flex;
          align-items: center;
          gap: $spacing-lg;

          .stat-icon {
            font-size: 40px;
            padding: $spacing-base;
            border-radius: 50%;

            &.success {
              color: $color-success;
              background: rgba($color-success, 0.1);
            }

            &.primary {
              color: $primary-color;
              background: rgba($primary-color, 0.1);
            }

            &.warning {
              color: $color-warning;
              background: rgba($color-warning, 0.1);
            }
          }

          .stat-text {
            .stat-value {
              font-size: $font-size-2xl;
              font-weight: 700;
              color: $color-gray-800;
            }

            .stat-label {
              font-size: $font-size-sm;
              color: $color-gray-500;
            }
          }
        }
      }
    }

    .alumni-list {
      background: $color-white;
      border-radius: $spacing-xs;
      overflow: hidden;

      .alumni-info {
        display: flex;
        gap: $spacing-base;
        align-items: center;

        .alumni-detail {
          flex: 1;

          .alumni-name {
            font-weight: 600;
            color: $color-gray-800;
            display: flex;
            align-items: center;
            gap: $spacing-xs;

            .degree-tag {
              margin-left: $spacing-xs;
            }
          }

          .alumni-company {
            color: $primary-color;
            font-size: $font-size-sm;
            margin: $spacing-xs 0;
          }

          .alumni-position {
            color: $color-gray-600;
            font-size: $font-size-sm;
          }
        }
      }

      .school-info {
        .school-name {
          font-weight: 500;
          color: $color-gray-800;
        }

        .school-major {
          color: $color-gray-600;
          font-size: $font-size-sm;
          margin: $spacing-xs 0;
        }

        .school-date {
          color: $color-gray-500;
          font-size: $font-size-xs;
        }
      }

      .skill-tags {
        display: flex;
        flex-wrap: wrap;
        gap: $spacing-xs;

        .skill-tag {
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

        .score-text {
          font-weight: 600;
          color: $color-gray-800;
          min-width: 30px;
        }
      }
    }

    .empty-state {
      padding: $spacing-4xl;
    }
  }
}
</style>
