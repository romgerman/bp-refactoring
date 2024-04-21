<script setup lang="ts">
import NodeWrapper from "./nodes/NodeWrapper.vue";
import useDragAndDrop from "./useDnD";
import { useNodeStore } from "./store";
import { NodeTypes } from "@/shared/node-types";

const { onDragStart } = useDragAndDrop();
const nodeStore = useNodeStore();

const NODES = [
  { group: true, name: "Data" },
  { type: NodeTypes.Constant, name: "Constant" },
  { type: NodeTypes.RegExp, name: "Regular Expression" },
  { group: true, name: "Aggregation" },
  { type: NodeTypes.ClassList, name: "Class List" },
  { type: NodeTypes.FileList, name: "File List" },
  { type: NodeTypes.FunctionList, name: "Function List" },
  { type: NodeTypes.MemberList, name: "Member List" },
  { type: NodeTypes.Preview, name: "Preview" },
  { group: true, name: "Filtering" },
  { type: NodeTypes.FilterBy, name: "Filter By" },
  { type: NodeTypes.DecoratorPredicate, name: "Has Decorator" },
  { type: NodeTypes.OfTypePredicate, name: "Of Type" },
  { group: true, name: "Actions" },
  { type: NodeTypes.RenameAction, name: "Rename" },
  { type: NodeTypes.DebugAction, name: "Debug" },
  { type: NodeTypes.ApplyAction, name: "Apply Changes" },
];
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
