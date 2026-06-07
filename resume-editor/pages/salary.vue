<template>
  <div class="salary-page">
    <SalaryEstimator />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const resumeStore = useResumeStore()

useHead({
  title: '薪资预估工具 - 基于简历的智能薪资分析'
})

onMounted(() => {
  if (!resumeStore.resumeData) {
    resumeStore.initResume()
  }
})
</script>

<style lang="scss" scoped>
.salary-page {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>
