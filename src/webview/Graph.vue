<template>
  <VueFlow v-model="elements">
    <template #node-project="projectNodeProps">
      <ProjectNode v-bind="projectNodeProps" />
    </template>
  </VueFlow>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
</style>

<script setup lang="ts">
import type { Elements } from '@vue-flow/core';
import { VueFlow } from '@vue-flow/core';
import { ref } from 'vue';

import ProjectNode from './nodes/ProjectNode.vue';

const elements = ref<Elements>([
  { id: '1', type: 'project', connectable: true, position: { x: 250, y: 5 } },
]);
</script>
