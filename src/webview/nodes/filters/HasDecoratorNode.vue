<template>
  <NodeWrapper>
    <template #header>Has Decorator</template>
    <template #body>
      <div class="nowheel" style="max-height: 200px; overflow: auto;">
        <div v-for="cls in classList">
          {{ cls }}
        </div>
      </div>
    </template>
    <Handle type="target" :position="Position.Left" />
    <Handle type="source" :position="Position.Right" :is-valid-connection="isValidConnectionTarget" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import type { NodeProps, ValidConnectionFunc } from "@vue-flow/core";
import { Position, Handle, useNode } from "@vue-flow/core";
import { ref } from "vue";
import NodeWrapper from "../NodeWrapper.vue";
import { useEventCommandResult } from "@/webview/utils";
import { GraphNodeSendViewData } from "@/shared/events";

const props = defineProps<NodeProps>();
const classList = ref<string[]>([]);
const { id: nodeId } = useNode()

const isValidConnectionTarget: ValidConnectionFunc = (conn, { sourceNode, targetNode }) => {
  return sourceNode.id !== targetNode.id;
};

useEventCommandResult<GraphNodeSendViewData, { id: string; data: string[] }>(
  "graph:node-send-view-data",
  (data) => {
    if (nodeId === data.id) {
      classList.value = data.data;
    }
  }
);

</script>

<style lang="scss">
.vue-flow__node-has-decorator {
  color: #fff;
}
</style>
