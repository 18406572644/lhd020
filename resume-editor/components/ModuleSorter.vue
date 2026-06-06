<template>
  <el-popover placement="bottom" :width="320" trigger="click">
    <template #reference>
      <el-button>
        <el-icon><Sort /></el-icon>
        <span>模块排序</span>
      </el-button>
    </template>
    
    <div class="module-sorter">
      <h3 class="title">简历模块管理</h3>
      <p class="subtitle">拖拽调整顺序，开关控制显示</p>
      
      <div ref="sortableContainer" class="module-list">
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
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import Sortable from 'sortablejs'

const resumeStore = useResumeStore()
const sortableContainer = ref<HTMLElement | null>(null)
let sortableInstance: Sortable | null = null

const sortedModules = ref([...resumeStore.resumeData?.modules || []].sort((a, b) => a.order - b.order))

watch(
  () => resumeStore.resumeData?.modules,
  (modules) => {
    if (modules) {
      sortedModules.value = [...modules].sort((a, b) => a.order - b.order)
    }
  },
  { deep: true }
)

onMounted(async () => {
  await nextTick()
  if (sortableContainer.value) {
    sortableInstance = Sortable.create(sortableContainer.value, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onEnd: (evt) => {
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
          sortedModules.value = items
        }
      }
    })
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
