<template>
  <div>
    <div v-show="mounted">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
    <div v-show="!mounted" class="loading-fallback">
      <div class="loading-spinner"></div>
      <span class="loading-text">加载中...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const resumeStore = useResumeStore()
const mounted = ref(false)

onMounted(async () => {
  mounted.value = true
  await resumeStore.initResume()
})
</script>

<style>
.loading-fallback {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background-color: #f5f5f5;
  z-index: 9999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #eeeeee;
  border-top-color: #1a1a2e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  font-size: 14px;
  color: #757575;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
