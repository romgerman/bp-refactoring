<template>
  <NodeWrapper>
    <template #header>Rename Class</template>
    <template #body>
      <div class="nowheel nodrag">
        <vscode-text-field v-model="name">New name:</vscode-text-field>
      </div>
    </template>
    <div class="target-handles">
      <Handle id="array" type="target" :position="Position.Left" data-name="Array" />
    </div>
    <Handle id="array" type="source" :position="Position.Right" :is-valid-connection="isValidConnectionTarget" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { NodeProps, ValidConnectionFunc } from "@vue-flow/core";
import { Handle, Position, useNode } from "@vue-flow/core";
import NodeWrapper from "../NodeWrapper.vue";
import { sendEventCommand } from "@/webview/utils";
import { GraphNodeUpdateState } from "@/shared/events";

const props = defineProps<NodeProps>();
const { id: nodeId } = useNode()
const name = ref<string>('');

const isValidConnectionTarget: ValidConnectionFunc = (conn, { sourceNode, targetNode }) => {
  return sourceNode.id !== targetNode.id;
};

watch(name, (value) => {
  sendEventCommand<GraphNodeUpdateState>({
    command: "graph:node-update-state",
    data: {
      id: nodeId,
      state: value,
    },
  });
});
</script>

<style lang="scss">
.vue-flow__node-rename-class-action {
  color: #fff;
}
</style>
