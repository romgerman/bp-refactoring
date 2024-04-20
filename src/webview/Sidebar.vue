<script setup lang="ts">
import NodeWrapper from "./nodes/NodeWrapper.vue";
import useDragAndDrop from "./useDnD";
import { useNodeStore } from "./store";
import { NodeTypes } from "@/shared/node-types";

const { onDragStart } = useDragAndDrop();
const nodeStore = useNodeStore();

const NODES = [
  { group: true, name: "Data" },
  { type: NodeTypes.Constant, name: 'Project' },
  { group: true, name: "Aggregation" },
  { type: NodeTypes.ClassList, name: 'Class List' },
  { type: NodeTypes.FileList, name: 'File List' },
  { group: true, name: "Filtering" },
  { type: NodeTypes.FilterBy, name: 'Filter By' },
  { type: NodeTypes.DecoratorPredicate, name: 'Has Decorator' },
  { group: true, name: "Actions" },
  { type: NodeTypes.RenameClassAction, name: 'Rename Class' },
  { type: NodeTypes.DebugAction, name: 'Debug' },
  { type: NodeTypes.ApplyAction, name: 'Apply Changes' },
];
</script>

<template>
  <div class="nodes p-2">
    <NodeWrapper
      :draggable="!nodeStore.hasProjectNode"
      @dragstart="onDragStart($event, NodeTypes.Project)"
      :style="{ opacity: nodeStore.hasProjectNode ? 0.5 : 1 }"
    >
      <template #header>Project</template>
    </NodeWrapper>

    <template v-for="node in NODES">
      <h3 v-if="node.group">{{ node.name }}</h3>
      <NodeWrapper v-if="node.type" :draggable="true" @dragstart="onDragStart($event, node.type)">
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
