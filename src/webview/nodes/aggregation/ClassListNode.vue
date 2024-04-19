<template>
  <NodeWrapper>
    <template #header>Class list</template>
    <template #body>
      <div class="nowheel" style="max-height: 200px; overflow: auto">
        <div v-for="cls in classList">
          {{ cls }}
        </div>
      </div>
    </template>
    <div class="target-handles">
      <Handle id="0:array" type="target" :position="Position.Left" data-name="Array" />
    </div>
    <Handle id="0:array" type="source" :position="Position.Right" :is-valid-connection="isValidConnectionTarget" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { GraphNodeSendViewData } from "@/shared/events/index";
import { useEventCommandResult } from "@/webview/utils";
import type { NodeProps, ValidConnectionFunc } from "@vue-flow/core";
import { Handle, Position, useNode } from "@vue-flow/core";

import NodeWrapper from "../NodeWrapper.vue";

const props = defineProps<NodeProps>();
const classList = ref<string[]>([]);
const { id: nodeId } = useNode();

const isValidConnectionTarget: ValidConnectionFunc = (conn, { sourceNode, targetNode }) => {
  return sourceNode.id !== targetNode.id;
};

useEventCommandResult<GraphNodeSendViewData, { id: string; data: string[] }>("graph:node-send-view-data", (data) => {
  if (nodeId === data.id) {
    classList.value = data.data;
  }
});
</script>

<style lang="scss">
.vue-flow__node-class-list {
  color: #fff;
}
</style>
