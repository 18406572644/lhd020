<template>
  <ClientOnly>
    <el-popover placement="bottom" :width="320" trigger="click" :disabled="resumeStore.loading">
      <template #reference>
        <el-button :loading="resumeStore.loading">
          <el-icon><Sort /></el-icon>
          <span>模块排序</span>
        </el-button>
      </template>
      
      <div class="module-sorter">
        <h3 class="title">简历模块管理</h3>
        <p class="subtitle">拖拽调整顺序，开关控制显示</p>
        
        <div v-if="resumeStore.loading" class="empty-state">
          <span>加载中...</span>
        </div>
        
        <div v-else-if="!sortedModules || sortedModules.length === 0" class="empty-state">
          <span>暂无模块数据</span>
        </div>
        
        <div v-else ref="sortableContainer" class="module-list">
          <div
            v-for="module in sortedModules"
            :key="module.id"
            :data-id="module.id"
            class="module-item"
          >
            <div class="drag-handle">
              <el-icon><Rank /></el-icon>
            </div>
            <span class="module-title">{{ module.title }}</span>
            <div class="module-actions">
              <el-switch
                :model-value="module.visible"
                size="small"
                @change="(val: boolean) => handleVisibilityChange(module.id, val)"
              />
            </div>
          </div>
        </div>
        
        <div class="tip">
          <el-icon><InfoFilled /></el-icon>
          <span>拖动左侧图标调整模块显示顺序</span>
        </div>
      </div>
    </el-popover>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'

const resumeStore = useResumeStore()
const sortableContainer = ref<HTMLElement | null>(null)
let sortableInstance: any = null

const sortedModules = computed(() => {
  if (!resumeStore.resumeData?.modules) return []
  return [...resumeStore.resumeData.modules].sort((a, b) => a.order - b.order)
})

watch(
  () => resumeStore.resumeData?.modules,
  (modules) => {
    if (modules && sortableInstance) {
      sortableInstance.sort(
        [...modules]
          .sort((a, b) => a.order - b.order)
          .map(m => m.id)
      )
    }
  },
  { deep: true }
)

onMounted(async () => {
  await nextTick()
  if (!sortableContainer.value) return
  
  if (!resumeStore.resumeData?.modules) {
    return
  }
  
  try {
    const { default: Sortable } = await import('sortablejs')
    sortableInstance = Sortable.create(sortableContainer.value, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onEnd: (evt: any) => {
        const { oldIndex, newIndex } = evt
        if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
          const items = [...sortedModules.value]
          const [movedItem] = items.splice(oldIndex, 1)
          items.splice(newIndex, 0, movedItem)
          
          const orderUpdates = items.map((item, index) => ({
            id: item.id,
            order: index
          }))
          
          resumeStore.updateModuleOrder(orderUpdates)
        }
      }
    })
  } catch (error) {
    console.error('初始化拖拽排序失败:', error)
    ElMessage.error('拖拽功能初始化失败')
  }
})

function handleVisibilityChange(moduleId: string, visible: boolean) {
  resumeStore.updateModuleVisibility(moduleId, visible)
}
</script>

<style lang="scss" scoped>
.module-sorter {
  .title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $color-gray-800;
    margin-bottom: $spacing-xs;
  }
  
  .subtitle {
    font-size: $font-size-sm;
    color: $color-gray-500;
    margin-bottom: $spacing-lg;
  }
  
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-xl * 2;
    color: $color-gray-500;
    margin-bottom: $spacing-lg;
  }
  
  .module-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    margin-bottom: $spacing-lg;
  }
  
  .module-item {
    display: flex;
    align-items: center;
    gap: $spacing-base;
    padding: $spacing-md $spacing-base;
    background-color: $color-gray-50;
    border-radius: $border-radius-base;
    border: 1px solid $color-gray-200;
    transition: $transition-base;
    
    &:hover {
      background-color: $color-gray-100;
    }
    
    .drag-handle {
      cursor: grab;
      color: $color-gray-400;
      display: flex;
      align-items: center;
      
      &:active {
        cursor: grabbing;
      }
      
      &:hover {
        color: $accent-color;
      }
    }
    
    .module-title {
      flex: 1;
      font-size: $font-size-base;
      color: $color-gray-700;
    }
    
    .module-actions {
      display: flex;
      align-items: center;
    }
  }
  
  .sortable-ghost {
    opacity: 0.5;
    background-color: $accent-color;
    border-color: $accent-color;
    
    .module-title {
      color: $color-white;
    }
  }
  
  .sortable-chosen {
    box-shadow: $shadow-lg;
  }
  
  .tip {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-base;
    background-color: rgba(15, 52, 96, 0.05);
    border-radius: $border-radius-base;
    font-size: $font-size-sm;
    color: $color-gray-600;
    
    .el-icon {
      color: $accent-color;
    }
  }
}
</style>
