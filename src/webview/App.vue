<template>
  <h1>Hello World!</h1>
  <vscode-button>Run</vscode-button>
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
