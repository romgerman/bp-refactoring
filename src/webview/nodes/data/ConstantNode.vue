<template>
  <NodeWrapper>
    <template #header>Constant</template>
    <template #body>
      <VueSelect
        class="type-select"
        placeholder="Type"
        :options="CONST_TYPES"
        :reduce="(item: any) => item.value"
        v-model="model.type"
      ></VueSelect>
      <vscode-text-field placeholder="Value" v-model="model.value"></vscode-text-field>
    </template>
    <Handle :id="'0:' + model.type" type="source" :position="Position.Right" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import { nextTick, ref, toRaw, watch } from "vue";
import { Handle, Position, useNode, useVueFlow } from "@vue-flow/core";
import VueSelect from "vue-select";
import { sendEventCommand } from "@/webview/event-utils";
import { GraphNodeUpdateState } from "@/shared/events";
import NodeWrapper from "../NodeWrapper.vue";

const { node, id: nodeId } = useNode();
const { updateNodeInternals } = useVueFlow();

const model = ref<{
  type: string | null;
  value: string;
}>({
  type: null,
  value: "",
});

const CONST_TYPES: Array<{ label: string; value: string }> = [{ label: "String", value: "string" }];

watch(model.value, (value) => {
  nextTick(() => updateNodeInternals([nodeId]));
  sendEventCommand<GraphNodeUpdateState>({
    command: "graph:node-update-state",
    data: {
      id: nodeId,
      state: (node.data = toRaw(value)),
    },
  });
});
</script>

<style lang="scss">
.vue-flow__node-constant {
  width: 200px;
}
</style>

<style lang="scss" scoped>
.type-select {
  margin-bottom: 10px;
}
</style>
