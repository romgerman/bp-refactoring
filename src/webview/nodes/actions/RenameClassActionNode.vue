<template>
  <NodeWrapper>
    <template #header>Rename Class</template>
    <template #body>
      <div class="nowheel" style="max-height: 200px; overflow: auto">
        <div v-for="item in names">{{ item }}</div>
      </div>
    </template>
    <div class="target-handles">
      <Handle id="0:array" type="target" :position="Position.Left" data-name="Array" />
      <Handle id="1:string" type="target" :position="Position.Left" data-name="Name?" />
      <Handle id="2:string" type="target" :position="Position.Left" data-name="Prefix?" />
      <Handle id="3:string" type="target" :position="Position.Left" data-name="Postfix?" />
    </div>
    <Handle id="0:array" type="source" :position="Position.Right" :is-valid-connection="isValidConnectionTarget" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { NodeProps, ValidConnectionFunc } from "@vue-flow/core";
import { Handle, Position, useNode } from "@vue-flow/core";
import NodeWrapper from "../NodeWrapper.vue";
import { sendEventCommand, useEventCommandResult } from "@/webview/utils";
import { GraphNodeSendViewData, GraphNodeUpdateState } from "@/shared/events";

const props = defineProps<NodeProps>();
const { id: nodeId } = useNode()
const names = ref<string[]>([]);

const isValidConnectionTarget: ValidConnectionFunc = (conn, { sourceNode, targetNode }) => {
  return sourceNode.id !== targetNode.id;
};

useEventCommandResult<GraphNodeSendViewData, { id: string; data: string[]; }>('graph:node-send-view-data', ({ id, data }) => {
  if (id === nodeId) {
    names.value = data;
  }
});
</script>

<style lang="scss">
.vue-flow__node-rename-class-action {
  min-height: 100px;
  display: flex;
  color: #fff;
}
</style>
