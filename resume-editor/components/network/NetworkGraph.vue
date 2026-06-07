<template>
  <div class="network-graph-wrapper">
    <div class="graph-header">
      <div class="graph-stats">
        <div class="stat-item">
          <span class="stat-value">{{ networkStore.networkStats?.totalConnections || 0 }}</span>
          <span class="stat-label">总人脉</span>
        </div>
        <div class="stat-item">
          <span class="stat-value primary">{{ networkStore.networkStats?.firstDegree || 0 }}</span>
          <span class="stat-label">1度人脉</span>
        </div>
        <div class="stat-item">
          <span class="stat-value success">{{ networkStore.networkStats?.secondDegree || 0 }}</span>
          <span class="stat-label">2度人脉</span>
        </div>
        <div class="stat-item">
          <span class="stat-value warning">{{ networkStore.networkStats?.thirdDegree || 0 }}</span>
          <span class="stat-label">3度人脉</span>
        </div>
        <div class="stat-item">
          <span class="stat-value info">{{ networkStore.networkStats?.averageScore || 0 }}</span>
          <span class="stat-label">平均价值分</span>
        </div>
      </div>
      <div class="graph-legend">
        <div class="legend-item">
          <span class="legend-dot" style="background: #409EFF"></span>
          <span>我</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: #67C23A"></span>
          <span>校友</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: #E6A23C"></span>
          <span>同事</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: #F56C6C"></span>
          <span>项目伙伴</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: #909399"></span>
          <span>朋友</span>
        </div>
      </div>
    </div>

    <div class="graph-container" ref="graphContainer">
      <svg :width="svgWidth" :height="svgHeight" class="graph-svg">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#c0c4cc" />
          </marker>
        </defs>
        <g class="links">
          <line
            v-for="(link, index) in graphData?.links"
            :key="'link-' + index"
            :x1="getNodeX(link.source)"
            :y1="getNodeY(link.source)"
            :x2="getNodeX(link.target)"
            :y2="getNodeY(link.target)"
            :stroke="getLinkColor(link.type)"
            :stroke-width="link.strength * 2"
            :opacity="link.strength * 0.7"
          />
        </g>
        <g class="nodes">
          <g
            v-for="node in graphData?.nodes"
            :key="node.id"
            :transform="`translate(${node.x}, ${node.y})`"
            class="node-group"
            @click="handleNodeClick(node)"
            @mouseenter="handleNodeHover(node, true)"
            @mouseleave="handleNodeHover(node, false)"
          >
            <circle
              :r="node.size"
              :fill="node.color"
              :opacity="hoveredNode?.id === node.id || selectedNode?.id === node.id ? 1 : 0.85"
              :stroke="selectedNode?.id === node.id ? '#409EFF' : 'white'"
              :stroke-width="selectedNode?.id === node.id ? 3 : 2"
              class="node-circle"
            />
            <text
              v-if="node.size >= 14"
              text-anchor="middle"
              dy="5"
              :fill="node.type === 'me' ? 'white' : '#303133'"
              :font-size="node.size >= 18 ? 11 : 9"
              :font-weight="node.type === 'me' ? 'bold' : 'normal'"
              class="node-text"
            >
              {{ node.name.length > 6 ? node.name.substring(0, 6) + '...' : node.name }}
            </text>
          </g>
        </g>
      </svg>

      <div v-if="hoveredNode && hoveredNode.person" class="node-tooltip" :style="tooltipStyle">
        <div class="tooltip-header">
          <el-avatar :size="40">{{ hoveredNode.name.charAt(0) }}</el-avatar>
          <div class="tooltip-info">
            <div class="tooltip-name">{{ hoveredNode.person.anonymous ? hoveredNode.person.anonymousTitle : hoveredNode.person.name }}</div>
            <div class="tooltip-company">{{ hoveredNode.person.currentCompany }}</div>
            <div class="tooltip-position">{{ hoveredNode.person.currentPosition }}</div>
          </div>
        </div>
        <div class="tooltip-body">
          <div class="tooltip-row">
            <span class="tooltip-label">关系类型:</span>
            <span class="tooltip-value">{{ getConnectionTypeName(hoveredNode.person.connectionType) }}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">人脉度数:</span>
            <el-tag :type="getDegreeTagType(hoveredNode.person.connectionDegree)" size="small">
              {{ hoveredNode.person.connectionDegree }}度
            </el-tag>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">价值评分:</span>
            <el-rate v-model="hoveredNode.person.score" disabled :max="100" show-score />
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">活跃时间:</span>
            <span class="tooltip-value">{{ hoveredNode.person.lastActive }}</span>
          </div>
        </div>
        <div class="tooltip-footer">
          <el-button size="small" type="primary" @click.stop="viewDetail(hoveredNode.person)">查看详情</el-button>
          <el-button size="small" type="success" @click.stop="sendReferral(hoveredNode.person)">请求内推</el-button>
        </div>
      </div>
    </div>

    <div v-if="selectedPerson" class="person-detail-panel">
      <div class="detail-header">
        <el-button size="small" text @click="closeDetail">
          <el-icon><Close /></el-icon>
        </el-button>
        <h3>人脉详情</h3>
      </div>
      <div class="detail-content">
        <div class="detail-avatar-section">
          <el-avatar :size="80">{{ (selectedPerson.anonymous ? selectedPerson.anonymousTitle : selectedPerson.name).charAt(0) }}</el-avatar>
          <div class="detail-basic">
            <h4>{{ selectedPerson.anonymous ? selectedPerson.anonymousTitle : selectedPerson.name }}</h4>
            <div class="detail-company">{{ selectedPerson.currentCompany }}</div>
            <div class="detail-position">{{ selectedPerson.currentPosition }}</div>
            <div class="detail-score">
              <el-tag :type="getScoreTagType(selectedPerson.score)" size="large">
                价值分: {{ selectedPerson.score }}
              </el-tag>
              <el-tag :type="getDegreeTagType(selectedPerson.connectionDegree)" size="large">
                {{ selectedPerson.connectionDegree }}度人脉
              </el-tag>
              <el-tag size="large">
                {{ getConnectionTypeName(selectedPerson.connectionType) }}
              </el-tag>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="detail-section">
          <h5><el-icon><School /></el-icon> 教育经历</h5>
          <div v-for="(edu, index) in selectedPerson.schools" :key="index" class="edu-item">
            <div class="edu-school">{{ edu.school }}</div>
            <div class="edu-info">{{ edu.degree }} · {{ edu.major }}</div>
            <div class="edu-date">{{ edu.startDate }} - {{ edu.endDate }}</div>
          </div>
        </div>

        <div class="detail-section">
          <h5><el-icon><Briefcase /></el-icon> 职业经历</h5>
          <el-timeline>
            <el-timeline-item
              v-for="(work, index) in selectedPerson.workHistory"
              :key="index"
              :timestamp="work.startDate + (work.endDate ? ' - ' + work.endDate : ' 至今')"
              :color="index === 0 ? '#409EFF' : '#c0c4cc'"
            >
              <div class="work-item">
                <div class="work-company">{{ work.company }}</div>
                <div class="work-position">{{ work.position }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div class="detail-section">
          <h5><el-icon><Connection /></el-icon> 人脉路径</h5>
          <div class="connection-path">
            <span class="path-node">我</span>
            <template v-for="(person, index) in connectionPath" :key="person.id">
              <el-icon class="path-arrow"><ArrowRight /></el-icon>
              <span class="path-node">{{ person.anonymous ? person.anonymousTitle : person.name }}</span>
            </template>
          </div>
        </div>

        <div class="detail-section" v-if="selectedPerson.skills.length > 0">
          <h5><el-icon><Tools /></el-icon> 技能标签</h5>
          <div class="skill-tags">
            <el-tag v-for="skill in selectedPerson.skills" :key="skill" class="skill-tag">
              {{ skill }}
            </el-tag>
          </div>
        </div>

        <div class="detail-actions">
          <el-button type="primary" size="large" @click="sendReferral(selectedPerson)">
            <el-icon><Promotion /></el-icon>
            发送内推请求
          </el-button>
          <el-button type="success" size="large">
            <el-icon><ChatDotRound /></el-icon>
            发送消息
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Close, School, Briefcase, Connection, ArrowRight, Tools, Promotion, ChatDotRound } from '@element-plus/icons-vue'
import type { GraphNode, Person } from '@/types/network'

const emit = defineEmits<{
  (e: 'referral', person: Person): void
}>()

const networkStore = useNetworkStore()
const graphContainer = ref<HTMLElement | null>(null)
const svgWidth = ref(800)
const svgHeight = ref(600)
const hoveredNode = ref<GraphNode | null>(null)
const selectedNode = ref<GraphNode | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })

const graphData = computed(() => networkStore.graphData)
const selectedPerson = computed(() => networkStore.selectedPerson)
const connectionPath = computed(() => {
  if (!selectedPerson.value) return []
  return networkStore.getConnectionPath(selectedPerson.value.id)
})

const tooltipStyle = computed(() => ({
  left: tooltipPosition.value.x + 'px',
  top: tooltipPosition.value.y + 'px'
}))

function getNodeX(nodeId: string): number {
  const node = graphData.value?.nodes.find(n => n.id === nodeId)
  return node?.x || 0
}

function getNodeY(nodeId: string): number {
  const node = graphData.value?.nodes.find(n => n.id === nodeId)
  return node?.y || 0
}

function getLinkColor(type: string): string {
  const colors: Record<string, string> = {
    alumni: '#67C23A',
    colleague: '#E6A23C',
    project: '#F56C6C',
    friend: '#909399'
  }
  return colors[type] || '#c0c4cc'
}

function getConnectionTypeName(type: string): string {
  const names: Record<string, string> = {
    alumni: '校友',
    colleague: '同事',
    project: '项目伙伴',
    friend: '朋友'
  }
  return names[type] || type
}

function getDegreeTagType(degree: number): 'primary' | 'success' | 'warning' | 'info' {
  const types: Record<number, 'primary' | 'success' | 'warning' | 'info'> = {
    1: 'primary',
    2: 'success',
    3: 'warning'
  }
  return types[degree] || 'info'
}

function getScoreTagType(score: number): 'primary' | 'success' | 'warning' | 'info' {
  if (score >= 80) return 'success'
  if (score >= 60) return 'primary'
  if (score >= 40) return 'warning'
  return 'info'
}

function handleNodeClick(node: GraphNode) {
  if (node.person) {
    selectedNode.value = node
    networkStore.selectPerson(node.person)
  }
}

function handleNodeHover(node: GraphNode, isHover: boolean) {
  if (isHover) {
    hoveredNode.value = node
    tooltipPosition.value = {
      x: node.x + 50,
      y: node.y - 50
    }
  } else {
    hoveredNode.value = null
  }
}

function viewDetail(person: Person) {
  networkStore.selectPerson(person)
}

function sendReferral(person: Person) {
  emit('referral', person)
}

function closeDetail() {
  networkStore.selectPerson(null)
  selectedNode.value = null
}

onMounted(() => {
  if (graphContainer.value) {
    svgWidth.value = graphContainer.value.clientWidth
    svgHeight.value = graphContainer.value.clientHeight
  }
})
</script>

<style lang="scss" scoped>
.network-graph-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: $color-white;
  border-radius: $spacing-xs;
  overflow: hidden;

  .graph-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-base $spacing-xl;
    border-bottom: 1px solid $color-gray-200;
    background: $color-gray-50;

    .graph-stats {
      display: flex;
      gap: $spacing-2xl;

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;

        .stat-value {
          font-size: $font-size-xl;
          font-weight: 700;
          color: $color-gray-800;

          &.primary { color: $primary-color; }
          &.success { color: $color-success; }
          &.warning { color: $color-warning; }
          &.info { color: $color-info; }
        }

        .stat-label {
          font-size: $font-size-xs;
          color: $color-gray-500;
        }
      }
    }

    .graph-legend {
      display: flex;
      gap: $spacing-xl;

      .legend-item {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        font-size: $font-size-sm;
        color: $color-gray-600;

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
      }
    }
  }

  .graph-container {
    flex: 1;
    position: relative;
    overflow: hidden;

    .graph-svg {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);

      .node-group {
        cursor: pointer;

        .node-circle {
          transition: all 0.3s ease;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));

          &:hover {
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
          }
        }

        .node-text {
          pointer-events: none;
        }
      }
    }

    .node-tooltip {
      position: absolute;
      background: $color-white;
      border-radius: $spacing-xs;
      box-shadow: $shadow-lg;
      padding: $spacing-base;
      min-width: 280px;
      z-index: 100;
      pointer-events: auto;

      .tooltip-header {
        display: flex;
        gap: $spacing-base;
        margin-bottom: $spacing-base;

        .tooltip-info {
          flex: 1;

          .tooltip-name {
            font-weight: 600;
            font-size: $font-size-base;
            color: $color-gray-800;
          }

          .tooltip-company {
            font-size: $font-size-sm;
            color: $primary-color;
            margin: $spacing-xs 0;
          }

          .tooltip-position {
            font-size: $font-size-sm;
            color: $color-gray-600;
          }
        }
      }

      .tooltip-body {
        padding: $spacing-sm 0;
        border-top: 1px solid $color-gray-200;
        border-bottom: 1px solid $color-gray-200;

        .tooltip-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: $spacing-xs 0;

          .tooltip-label {
            font-size: $font-size-sm;
            color: $color-gray-500;
          }

          .tooltip-value {
            font-size: $font-size-sm;
            color: $color-gray-800;
          }
        }
      }

      .tooltip-footer {
        display: flex;
        gap: $spacing-sm;
        justify-content: flex-end;
        margin-top: $spacing-base;
      }
    }
  }

  .person-detail-panel {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 400px;
    background: $color-white;
    box-shadow: -4px 0 12px rgba(0,0,0,0.1);
    z-index: 50;
    display: flex;
    flex-direction: column;

    .detail-header {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      padding: $spacing-base $spacing-lg;
      border-bottom: 1px solid $color-gray-200;

      h3 {
        flex: 1;
        margin: 0;
        font-size: $font-size-lg;
        font-weight: 600;
      }
    }

    .detail-content {
      flex: 1;
      overflow-y: auto;
      padding: $spacing-lg;

      .detail-avatar-section {
        display: flex;
        gap: $spacing-lg;
        align-items: flex-start;

        .detail-basic {
          flex: 1;

          h4 {
            margin: 0 0 $spacing-xs 0;
            font-size: $font-size-xl;
            font-weight: 600;
          }

          .detail-company {
            color: $primary-color;
            font-size: $font-size-base;
            margin-bottom: $spacing-xs;
          }

          .detail-position {
            color: $color-gray-600;
            font-size: $font-size-sm;
            margin-bottom: $spacing-sm;
          }

          .detail-score {
            display: flex;
            flex-wrap: wrap;
            gap: $spacing-xs;
          }
        }
      }

      .detail-section {
        margin-top: $spacing-lg;

        h5 {
          display: flex;
          align-items: center;
          gap: $spacing-xs;
          margin: 0 0 $spacing-base 0;
          font-size: $font-size-base;
          font-weight: 600;
          color: $color-gray-800;

          .el-icon {
            color: $primary-color;
          }
        }

        .edu-item {
          padding: $spacing-sm 0;
          border-bottom: 1px solid $color-gray-100;

          &:last-child {
            border-bottom: none;
          }

          .edu-school {
            font-weight: 500;
            color: $color-gray-800;
          }

          .edu-info {
            font-size: $font-size-sm;
            color: $color-gray-600;
            margin: $spacing-xs 0;
          }

          .edu-date {
            font-size: $font-size-xs;
            color: $color-gray-500;
          }
        }

        .work-item {
          .work-company {
            font-weight: 500;
            color: $color-gray-800;
          }

          .work-position {
            font-size: $font-size-sm;
            color: $color-gray-600;
          }
        }

        .connection-path {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: $spacing-xs;

          .path-node {
            padding: $spacing-xs $spacing-sm;
            background: $color-primary-light;
            color: $primary-color;
            border-radius: $spacing-md;
            font-size: $font-size-sm;
          }

          .path-arrow {
            color: $color-gray-400;
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
      }

      .detail-actions {
        display: flex;
        gap: $spacing-base;
        margin-top: $spacing-xl;
        padding-top: $spacing-lg;
        border-top: 1px solid $color-gray-200;

        .el-button {
          flex: 1;
        }
      }
    }
  }
}
</style>
