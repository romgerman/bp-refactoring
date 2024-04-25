<template>
  <NodeWrapper>
    <template #header>By Glob Pattern</template>
    <template #body>
      <vscode-text-field class="nodrag" placeholder="Pattern" v-model="model.globPattern"></vscode-text-field>
    </template>
    <Handle id="0:predicate" type="source" :position="Position.Right" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import { Handle, Position, useNode, useVueFlow } from "@vue-flow/core";
import NodeWrapper from "../NodeWrapper.vue";
import { ref, watch, toRaw } from "vue";
import { sendEventCommand } from "@/webview/event-utils";
import { GraphNodeUpdateState } from "@/shared/events";

const { node, id: nodeId } = useNode();
const model = ref<{ globPattern: string }>({ globPattern: "" });
const { onNodesInitialized } = useVueFlow();
onNodesInitialized(() => {
  if (Object.keys(node.data).length > 0) {
    model.value = toRaw(node.data);
  }
});

watch(
  model,
  (value) => {
    sendEventCommand<GraphNodeUpdateState>({
      command: "graph:node-update-state",
      data: {
        id: nodeId,
        state: (node.data = toRaw(value)),
      },
    });
  },
  { deep: true }
);
</script>
