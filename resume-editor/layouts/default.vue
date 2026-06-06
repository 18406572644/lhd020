<template>
  <div class="app-container">
    <AppHeader class="no-print" />
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $color-gray-100;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>
