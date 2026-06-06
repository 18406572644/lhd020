<template>
  <div class="editor-page">
    <EditorPanel v-if="!resumeStore.loading" />
    <ResumePreview v-if="!resumeStore.loading" />
    
    <div v-else class="loading-state">
      <el-loading text="加载中..." :fullscreen="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
const resumeStore = useResumeStore()

useHead({
  title: '个人简历编辑器 - 极简商务风格'
})
</script>

<style lang="scss" scoped>
.editor-page {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.loading-state {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $color-gray-100;
}
</style>
