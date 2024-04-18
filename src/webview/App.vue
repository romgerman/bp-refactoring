<template>
  <div class="container">
    <div class="sidebar">
      <Sidebar />
    </div>
    <div class="graph-container">
      <Graph></Graph>
    </div>
  </div>
</template>

<style lang="scss">
.container {
  flex: 1;
  display: flex;
}

.sidebar {
  min-width: 180px;
}

.graph-container {
  flex: 1;
}
</style>

<script setup lang="ts">
import Graph from './Graph.vue';
import Sidebar from './Sidebar.vue';
</script>
