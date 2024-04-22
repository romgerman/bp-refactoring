<script setup lang="ts">
import NodeWrapper from "./nodes/NodeWrapper.vue";
import useDragAndDrop from "./useDnD";
import { useNodeStore } from "./store";
import { NodeTypes } from "@/shared/node-types";
import { NODES } from "./nodes";

const { onDragStart } = useDragAndDrop();
const nodeStore = useNodeStore();
</script>

<template>
  <div class="nodes p-2">
    <!-- Currently you can have only one project active -->
    <NodeWrapper
      condensed
      :draggable="!nodeStore.hasProjectNode"
      @dragstart="onDragStart($event, NodeTypes.Project)"
      :style="{ opacity: nodeStore.hasProjectNode ? 0.5 : 1 }"
    >
      <template #header>Project</template>
    </NodeWrapper>

    <template v-for="node in NODES">
      <h3 v-if="node.group">{{ node.name }}</h3>
      <NodeWrapper v-if="node.type" condensed :draggable="true" @dragstart="onDragStart($event, node.type)">
        <template #header>{{ node.name }}</template>
      </NodeWrapper>
    </template>
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
