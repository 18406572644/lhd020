<template>
  <div class="network-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon class="title-icon"><Connection /></el-icon>
          职业人脉推荐网络
        </h1>
        <p class="page-desc">基于您的简历信息，智能构建您的职业人脉关系网络</p>
      </div>
    </div>

    <div class="page-body">
      <el-tabs v-model="activeTab" class="network-tabs" type="card">
        <el-tab-pane label="人脉图谱" name="graph">
          <template #label>
            <el-icon><Share /></el-icon>
            人脉图谱
          </template>
        </el-tab-pane>
        <el-tab-pane label="校友网络" name="alumni">
          <template #label>
            <el-icon><School /></el-icon>
            校友网络
            <el-badge :value="alumniCount" class="tab-badge" />
          </template>
        </el-tab-pane>
        <el-tab-pane label="同事网络" name="colleague">
          <template #label>
            <el-icon><OfficeBuilding /></el-icon>
            同事网络
            <el-badge :value="colleagueCount" class="tab-badge" />
          </template>
        </el-tab-pane>
        <el-tab-pane label="目标公司人脉" name="target">
          <template #label>
            <el-icon><Search /></el-icon>
            目标公司人脉
          </template>
        </el-tab-pane>
        <el-tab-pane label="职业路径参考" name="career">
          <template #label>
            <el-icon><TrendCharts /></el-icon>
            职业路径参考
          </template>
        </el-tab-pane>
        <el-tab-pane label="隐私设置" name="privacy">
          <template #label>
            <el-icon><Lock /></el-icon>
            隐私设置
          </template>
        </el-tab-pane>
      </el-tabs>

      <div class="tab-content">
        <div v-if="networkStore.loading" class="loading-container">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>正在加载人脉网络...</span>
        </div>

        <template v-else>
          <NetworkGraph 
          v-if="activeTab === 'graph'"
          @referral="handleReferral"
          @view="handleViewPerson"
        />
        <AlumniNetwork 
          v-if="activeTab === 'alumni'"
          @referral="handleReferral"
          @view="handleViewPerson"
        />
        <ColleagueNetwork 
          v-if="activeTab === 'colleague'"
          @referral="handleReferral"
          @view="handleViewPerson"
        />
        <TargetCompanyNetwork 
          v-if="activeTab === 'target'"
          @referral="handleReferral"
          @view="handleViewPerson"
        />
        <CareerPathReference 
          v-if="activeTab === 'career'"
        />
        <PrivacySettings 
          v-if="activeTab === 'privacy'"
        />
        </template>
      </div>
    </div>

    <ReferralDialog 
      v-model="referralDialogVisible" 
      :target-person="selectedPerson"
      @sent="handleReferralSent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Connection, Share, School, OfficeBuilding, Search, TrendCharts, Lock, Loading } from '@element-plus/icons-vue'
import NetworkGraph from '@/components/network/NetworkGraph.vue'
import AlumniNetwork from '@/components/network/AlumniNetwork.vue'
import ColleagueNetwork from '@/components/network/ColleagueNetwork.vue'
import TargetCompanyNetwork from '@/components/network/TargetCompanyNetwork.vue'
import CareerPathReference from '@/components/network/CareerPathReference.vue'
import PrivacySettings from '@/components/network/PrivacySettings.vue'
import ReferralDialog from '@/components/network/ReferralDialog.vue'
import type { Person } from '@/types/network'

const networkStore = useNetworkStore()

useHead({
  title: '职业人脉推荐网络'
})

const activeTab = ref<'graph' | 'alumni' | 'colleague' | 'target' | 'career' | 'privacy'>('graph')
const referralDialogVisible = ref(false)
const selectedPerson = ref<Person | null>(null)

const alumniCount = computed(() => networkStore.alumniNetwork.length)
const colleagueCount = computed(() => networkStore.colleagueNetwork.length)

function handleReferral(person: Person) {
  selectedPerson.value = person
  referralDialogVisible.value = true
}

function handleViewPerson(person: Person) {
  networkStore.selectPerson(person)
  activeTab.value = 'graph'
}

function handleReferralSent() {
  selectedPerson.value = null
}

onMounted(() => {
  networkStore.initNetwork()
})
</script>

<style lang="scss" scoped>
.network-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: $color-gray-100;

  .page-header {
    background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
    color: $color-white;
    padding: $spacing-2xl $spacing-3xl;

    .page-title {
      display: flex;
      align-items: center;
      gap: $spacing-base;
      margin: 0;
      font-size: $font-size-2xl;
      font-weight: 700;

      .title-icon {
        font-size: 32px;
      }
    }

    .page-desc {
      margin: $spacing-sm 0 0 0;
      font-size: $font-size-base;
      opacity: 0.9;
    }
  }

  .page-body {
    flex: 1;
    padding: $spacing-lg $spacing-3xl;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .network-tabs {
      flex-shrink: 0;

      :deep(.el-tabs__header) {
        margin-bottom: $spacing-lg;

        .el-tabs__nav-wrap::after {
          display: none;
        }

        .el-tabs__item {
          background: $color-white;
          border: 1px solid $color-gray-200;
          border-radius: $spacing-xs $spacing-xs 0 0;
          margin-right: $spacing-sm;
          padding: $spacing-sm $spacing-lg;
          display: flex;
          align-items: center;
          gap: $spacing-xs;
          height: auto;
          line-height: 1.5;

          &.is-active {
            background: $primary-color;
            color: $color-white;
            border-color: $primary-color;
          }

          .tab-badge {
            margin-left: $spacing-xs;
          }
        }
      }

      :deep(.el-tabs__content) {
        height: calc(100% - 60px);
        padding: 0;
      }

      .tab-content {
        height: 100%;
        overflow: hidden;

        .loading-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: $spacing-base;
          color: $color-gray-500;

          .el-icon {
            font-size: 32px;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .network-page {
    .page-header {
      padding: $spacing-xl $spacing-lg;

      .page-title {
        font-size: $font-size-xl;

        .title-icon {
          font-size: 24px;
        }
      }
    }

    .page-body {
      padding: $spacing-md $spacing-lg;

      .network-tabs {
        :deep(.el-tabs__header) {
          .el-tabs__item {
            padding: $spacing-xs $spacing-base;
            font-size: $font-size-sm;
          }
        }
      }
    }
  }
}
</style>
