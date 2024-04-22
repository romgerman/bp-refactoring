<template>
  <NodeWrapper>
    <template #header>By Regular Expression</template>
    <template #body>
      <vscode-text-field placeholder="Expression" v-model="model.value"></vscode-text-field>
    </template>
    <Handle id="0:predicate" type="source" :position="Position.Right" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import { Handle, Position, useNode } from "@vue-flow/core";
import NodeWrapper from "../NodeWrapper.vue";
import { ref, watch } from "vue";
import { sendEventCommand } from "@/webview/utils";
import { GraphNodeUpdateState } from "@/shared/events";

const { id: nodeId } = useNode();
const model = ref<{ value: string }>({ value: "" });

watch(model.value, (value) => {
  sendEventCommand<GraphNodeUpdateState>({
    command: "graph:node-update-state",
    data: {
      id: nodeId,
      state: {
        value: value.value,
      },
    },
  });
});
</script>

<style lang="scss">
.vue-flow__node-constant {
  color: #fff;
  width: 200px;
}
</style>

<style lang="scss" scoped>
.type-select {
  margin-bottom: 10px;
}
</style>
