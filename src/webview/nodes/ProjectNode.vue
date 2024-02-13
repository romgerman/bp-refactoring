<template>
  <div>
    <div>Project</div>
    <Handle type="source" :position="Position.Right" />
  </div>
</template>

<style lang="scss">
.vue-flow__node-project {
    background: #9CA8B3;
    color: #fff;
    padding: 10px;
    border-radius: 2px;
}
</style>

<script setup lang="ts">
import type { NodeProps } from '@vue-flow/core';
import { Position, Handle } from '@vue-flow/core';

const props = defineProps<NodeProps>();
</script>
