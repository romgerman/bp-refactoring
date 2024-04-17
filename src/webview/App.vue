<template>
  <h1 class="text-4xl text-blue-700">Blueprint!</h1>
  <div class="graph-container">
    <Graph></Graph>
  </div>
</template>

<style lang="scss">
.graph-container {
  flex: 1;
}
</style>

<script setup lang="ts">
import Graph from './Graph.vue';
</script>
