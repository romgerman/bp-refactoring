<script setup lang="ts">
import { Elements, useVueFlow } from "@vue-flow/core";
import NodeWrapper from "./nodes/NodeWrapper.vue";
import useDragAndDrop from "./useDnD";
import { useNodeStore } from "./store";
import { computed, watch } from "vue";

const { onDragStart } = useDragAndDrop();
const nodeStore = useNodeStore();
</script>

<template>
  <div class="nodes p-2">
    <NodeWrapper
      :draggable="!nodeStore.hasProjectNode"
      @dragstart="onDragStart($event, 'project')"
      :style="{ opacity: nodeStore.hasProjectNode ? 0.5 : 1 }"
    >
      <template #header> Project </template>
    </NodeWrapper>
    <NodeWrapper :draggable="true" @dragstart="onDragStart($event, 'class-list')">
      <template #header> Class List </template>
    </NodeWrapper>
    <NodeWrapper :draggable="true" @dragstart="onDragStart($event, 'has-decorator')">
      <template #header> Has Decorator </template>
    </NodeWrapper>
  </div>
</template>

<style lang="scss">
.nodes > * {
  margin-bottom: 10px;
  cursor: grab;
  font-weight: 500;
  box-shadow: 5px 5px 10px 2px #00000040;
}
</style>
