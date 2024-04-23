<template>
  <div class="container w-full max-w-full">
    <TaskBar />
    <div class="border-b-1 border-vscode"></div>
    <div class="graph-container">
      <Graph></Graph>
    </div>
  </div>
</template>

<style lang="scss">
.container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.graph-container {
  flex: 1;
}
</style>

<script setup lang="ts">
import Graph from "./Graph.vue";
import TaskBar from "./TaskBar.vue";
</script>
