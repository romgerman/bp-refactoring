<script setup lang="ts">
import NodeWrapper from "./nodes/NodeWrapper.vue";
import useDragAndDrop from "./useDnD";
import { useNodeStore } from "./store";
import { NodeTypes } from "@/shared/node-types";

const { onDragStart } = useDragAndDrop();
const nodeStore = useNodeStore();
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

    <h3>Data</h3>

    <NodeWrapper :draggable="true" @dragstart="onDragStart($event, NodeTypes.Constant)">
      <template #header>Constant</template>
    </NodeWrapper>

    <h3>Aggregation</h3>

    <NodeWrapper :draggable="true" @dragstart="onDragStart($event, NodeTypes.ClassList)">
      <template #header>Class List</template>
    </NodeWrapper>
    <NodeWrapper :draggable="true" @dragstart="onDragStart($event, NodeTypes.FileList)">
      <template #header>File List</template>
    </NodeWrapper>

    <h3>Filtering</h3>

    <NodeWrapper :draggable="true" @dragstart="onDragStart($event, NodeTypes.FilterBy)">
      <template #header>Filter By</template>
    </NodeWrapper>
    <NodeWrapper :draggable="true" @dragstart="onDragStart($event, NodeTypes.DecoratorPredicate)">
      <template #header>Has Decorator</template>
    </NodeWrapper>

    <h3>Actions</h3>

    <NodeWrapper :draggable="true" @dragstart="onDragStart($event, NodeTypes.RenameClassAction)">
      <template #header>Rename Class</template>
    </NodeWrapper>
    <NodeWrapper :draggable="true" @dragstart="onDragStart($event, NodeTypes.DebugAction)">
      <template #header>Debug</template>
    </NodeWrapper>
    <NodeWrapper :draggable="true" @dragstart="onDragStart($event, NodeTypes.ApplyAction)">
      <template #header>Apply Changes</template>
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
