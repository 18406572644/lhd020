<template>
  <div class="career-path-wrapper">
    <div class="network-header">
      <h3><el-icon><TrendCharts /></el-icon> 职业路径参考</h3>
      <p class="header-desc">查看与您背景相似的人的典型职业发展路径，为您的职业规划提供参考</p>
    </div>

    <div class="network-content">
      <div class="paths-list">
        <el-card 
          v-for="path in careerPaths" 
          :key="path.id" 
          class="path-card"
          shadow="hover"
        >
          <div class="card-header">
            <div class="person-info">
              <el-avatar :size="56">{{ path.personName.charAt(0) }}</el-avatar>
              <div class="person-detail">
                <div class="person-name">{{ path.personName }}</div>
                <div class="person-title">{{ path.personTitle }}</div>
                <div class="similarity-badge">
                  <el-tag type="success" effect="light">
                    <el-icon><Star /></el-icon> 背景相似度 {{ path.similarity }}%
                  </el-tag>
                </div>
              </div>
            </div>
            <div class="path-stats">
              <div class="stat-item">
                <div class="stat-value">{{ path.totalYears }}</div>
                <div class="stat-label">工作年限</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ path.promotions }}</div>
                <div class="stat-label">晋升次数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ path.companies }}</div>
                <div class="stat-label">就职公司</div>
              </div>
            </div>
          </div>

          <el-divider />

          <div class="career-timeline">
            <el-timeline>
              <el-timeline-item
                v-for="(node, index) in path.nodes"
                :key="node.id"
                :timestamp="node.startDate + (node.endDate ? ' - ' + node.endDate : ' 至今')"
                :color="index === 0 ? '#67C23A' : index === path.nodes.length - 1 ? '#409EFF' : '#c0c4cc'"
                size="large"
              >
                <el-card class="timeline-card" :body-style="{ padding: '12px 16px' }">
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <div class="company-name">{{ node.company }}</div>
                      <div class="duration">
                        <el-icon><Clock /></el-icon> {{ formatDuration(node.durationMonths) }}
                      </div>
                    </div>
                    <div class="position-name">{{ node.position }}</div>
                    <div class="progress-indicator" v-if="index < path.nodes.length - 1">
                      <el-icon><ArrowDown /></el-icon>
                      <span class="promotion-text">
                        {{ getPromotionType(path.nodes[index], path.nodes[index + 1]) }}
                      </span>
                    </div>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>

          <div class="card-footer">
            <div class="path-insights">
              <h5><el-icon><Bell /></el-icon> 路径洞察</h5>
              <ul class="insights-list">
                <li v-if="path.promotions >= 3">
                  <el-tag type="success" size="small">快速晋升</el-tag>
                  在{{ path.totalYears }}年内获得{{ path.promotions }}次晋升，职业发展迅速
                </li>
                <li v-if="path.companies <= 2">
                  <el-tag type="primary" size="small">稳定发展</el-tag>
                  职业稳定性高，在{{ path.companies }}家公司深耕
                </li>
                <li v-if="path.nodes.some(n => n.position.includes('技术') || n.position.includes('架构'))">
                  <el-tag type="warning" size="small">技术路线</el-tag>
                  走技术专家路线，最终达到技术专家/架构师级别
                </li>
                <li v-if="path.nodes.some(n => n.position.includes('经理') || n.position.includes('总监'))">
                  <el-tag type="info" size="small">管理路线</el-tag>
                  转型管理路线，带领团队创造更大价值
                </li>
              </ul>
            </div>
          </div>
        </el-card>
      </div>

      <div class="tips-section">
        <el-alert title="职业规划小贴士" type="info" :closable="false" show-icon>
          <ul class="tips-list">
            <li>💡 大多数人在工作 3-5 年后会遇到第一次职业选择：继续技术路线还是转管理</li>
            <li>💡 在大公司深耕 2-3 年再考虑跳槽，更能积累核心竞争力</li>
            <li>💡 选择与您背景相似的成功路径作为参考，可以少走很多弯路</li>
            <li>💡 定期更新您的简历，记录每个阶段的成长和成就</li>
          </ul>
        </el-alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrendCharts, Star, Clock, ArrowDown, Bell } from '@element-plus/icons-vue'
import type { CareerPathNode } from '@/types/network'

const networkStore = useNetworkStore()

const careerPaths = computed(() => networkStore.getSimilarCareerPaths())

function formatDuration(months: number): string {
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (years > 0 && remainingMonths > 0) {
    return `${years}年${remainingMonths}个月`
  } else if (years > 0) {
    return `${years}年`
  } else {
    return `${remainingMonths}个月`
  }
}

function getPromotionType(current: CareerPathNode, next: CareerPathNode): string {
  const isSameCompany = current.company === next.company
  const isPromotion = next.position.includes('高级') || 
                      next.position.includes('资深') || 
                      next.position.includes('专家') || 
                      next.position.includes('经理') || 
                      next.position.includes('总监') ||
                      next.position.includes('架构师')
  
  if (isSameCompany && isPromotion) {
    return '内部晋升'
  } else if (!isSameCompany && isPromotion) {
    return '跳槽晋升'
  } else if (!isSameCompany) {
    return '平级跳槽'
  } else {
    return '岗位调整'
  }
}
</script>

<style lang="scss" scoped>
.career-path-wrapper {
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
      margin: 0 0 $spacing-xs 0;
      font-size: $font-size-lg;
      font-weight: 600;

      .el-icon {
        color: $primary-color;
      }
    }

    .header-desc {
      margin: 0;
      font-size: $font-size-sm;
      color: $color-gray-500;
    }
  }

  .network-content {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-lg;

    .paths-list {
      display: flex;
      flex-direction: column;
      gap: $spacing-xl;
      margin-bottom: $spacing-xl;

      .path-card {
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;

          .person-info {
            display: flex;
            gap: $spacing-base;
            align-items: center;

            .person-detail {
              .person-name {
                font-size: $font-size-lg;
                font-weight: 600;
                color: $color-gray-800;
              }

              .person-title {
                color: $color-gray-600;
                font-size: $font-size-sm;
                margin: $spacing-xs 0;
              }

              .similarity-badge {
                .el-tag {
                  display: flex;
                  align-items: center;
                  gap: $spacing-xs;
                }
              }
            }
          }

          .path-stats {
            display: flex;
            gap: $spacing-2xl;

            .stat-item {
              text-align: center;

              .stat-value {
                font-size: $font-size-2xl;
                font-weight: 700;
                color: $primary-color;
              }

              .stat-label {
                font-size: $font-size-xs;
                color: $color-gray-500;
              }
            }
          }
        }

        .career-timeline {
          padding: $spacing-sm $spacing-base;

          :deep(.el-timeline-item__timestamp) {
            font-weight: 500;
            color: $color-gray-700;
          }

          :deep(.el-timeline-item__wrapper) {
            padding-bottom: $spacing-lg;
          }

          :deep(.el-timeline-item:last-child .el-timeline-item__wrapper) {
            padding-bottom: 0;
          }

          .timeline-card {
            :deep(.el-card__body) {
              padding: 12px 16px;
            }

            .timeline-content {
              .timeline-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: $spacing-xs;

                .company-name {
                  font-weight: 600;
                  color: $color-gray-800;
                  font-size: $font-size-base;
                }

                .duration {
                  display: flex;
                  align-items: center;
                  gap: $spacing-xs;
                  font-size: $font-size-xs;
                  color: $color-gray-500;
                }
              }

              .position-name {
                color: $primary-color;
                font-size: $font-size-sm;
                margin-bottom: $spacing-sm;
              }

              .progress-indicator {
                display: flex;
                align-items: center;
                gap: $spacing-xs;
                padding-top: $spacing-sm;
                border-top: 1px dashed $color-gray-200;
                color: $color-success;
                font-size: $font-size-xs;

                .el-icon {
                  font-size: 14px;
                }

                .promotion-text {
                  font-weight: 500;
                }
              }
            }
          }
        }

        .card-footer {
          .path-insights {
            h5 {
              display: flex;
              align-items: center;
              gap: $spacing-xs;
              margin: 0 0 $spacing-sm 0;
              font-size: $font-size-sm;
              font-weight: 600;
              color: $color-gray-700;

              .el-icon {
                color: $color-warning;
              }
            }

            .insights-list {
              list-style: none;
              padding: 0;
              margin: 0;
              display: flex;
              flex-direction: column;
              gap: $spacing-xs;

              li {
                display: flex;
                align-items: center;
                gap: $spacing-sm;
                font-size: $font-size-sm;
                color: $color-gray-600;

                .el-tag {
                  flex-shrink: 0;
                }
              }
            }
          }
        }
      }
    }

    .tips-section {
      .tips-list {
        margin: $spacing-sm 0 0 0;
        padding-left: $spacing-lg;

        li {
          margin-bottom: $spacing-xs;
          font-size: $font-size-sm;
          color: $color-gray-600;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }
}
</style>
