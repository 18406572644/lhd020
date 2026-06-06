<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const resumeStore = useResumeStore()

onMounted(async () => {
  await resumeStore.initResume()
})
</script>
