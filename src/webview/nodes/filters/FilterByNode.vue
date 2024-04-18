<template>
  <NodeWrapper>
    <template #header>Filter By</template>
    <div class="target-handles">
      <Handle id="array" type="target" :position="Position.Left" data-name="Array" />
      <Handle id="predicate" type="target" :position="Position.Left" data-name="Predicate"/>
    </div>
    <Handle type="source" :position="Position.Right" :is-valid-connection="isValidConnectionTarget" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { NodeProps, ValidConnectionFunc } from "@vue-flow/core";
import { Handle, Position, useNode } from "@vue-flow/core";
import NodeWrapper from "../NodeWrapper.vue";

const props = defineProps<NodeProps>();
const { id: nodeId } = useNode()

const isValidConnectionTarget: ValidConnectionFunc = (conn, { sourceNode, targetNode }) => {
  return sourceNode.id !== targetNode.id;
};

// useEventCommandResult<GraphNodeSendViewData, { id: string; data: string[] }>(
//   "graph:node-send-view-data",
//   (data) => {
//     if (nodeId === data.id) {
//       classList.value = data.data;
//     }
//   }
// );
</script>

<style lang="scss">
.vue-flow__node-filter-by {
  color: #fff;
}
</style>
