<template>
  <NodeWrapper>
    <template #header>By Glob Pattern</template>
    <template #body>
      <vscode-text-field placeholder="Pattern" v-model="model.globPattern"></vscode-text-field>
    </template>
    <Handle id="0:predicate" type="source" :position="Position.Right" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import { Handle, Position, useNode } from "@vue-flow/core";
import NodeWrapper from "../NodeWrapper.vue";
import { ref, watch, toRaw } from "vue";
import { sendEventCommand } from "@/webview/event-utils";
import { GraphNodeUpdateState } from "@/shared/events";

const { node, id: nodeId } = useNode();
const model = ref<{ globPattern: string }>({ globPattern: "" });

watch(model.value, (value) => {
  sendEventCommand<GraphNodeUpdateState>({
    command: "graph:node-update-state",
    data: {
      id: nodeId,
      state: (node.data = toRaw(value))
    },
  });
});
</script>
