<template>
  <div class="editor-page">
    <EditorPanel />
    <ResumePreview />
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
</style>
