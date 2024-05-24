<template>
  <div class="container w-full max-w-full">
    <TaskBar />
    <div class="border-b-1 border-vscode"></div>
    <div class="graph-container">
      <Graph />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVueFlow } from "@vue-flow/core";
import Graph from "./Graph.vue";
import TaskBar from "./components/TaskBar.vue";

useVueFlow();
</script>

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
