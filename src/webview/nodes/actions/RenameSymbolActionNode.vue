<template>
  <NodeWrapper>
    <template #header>Rename Symbol</template>
    <template #body>
      <div class="nowheel" style="max-height: 200px; overflow: auto">
        <div v-for="item in names">{{ item }}</div>
      </div>
    </template>
    <div class="target-handles">
      <Handle id="0:array" type="target" connectable="single" :position="Position.Left" data-name="Array" />
      <Handle id="1:string" type="target" connectable="single" :position="Position.Left" data-name="Name?" />
      <Handle id="2:string" type="target" connectable="single" :position="Position.Left" data-name="Prefix?" />
      <Handle id="3:string" type="target" connectable="single" :position="Position.Left" data-name="Postfix?" />
    </div>
    <Handle id="0:array" type="source" :position="Position.Right" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Handle, Position, useNode } from "@vue-flow/core";
import { useEventCommandResult } from "@/webview/event-utils";
import { GraphNodeSendViewData } from "@/shared/events";
import NodeWrapper from "../NodeWrapper.vue";

const { id: nodeId } = useNode();
const names = ref<string[]>([]);

useEventCommandResult<GraphNodeSendViewData, { id: string; data: string[] }>("graph:node-send-view-data", ({ id, data }) => {
  if (id === nodeId) {
    names.value = data;
  }
});
</script>

<style lang="scss">
.vue-flow__node-rename-action {
  min-height: 100px;
  display: flex;
}
</style>
