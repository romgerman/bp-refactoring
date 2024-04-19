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
        @input="onTypeSelect($event)"
      ></VueSelect>
      <vscode-text-field placeholder="Value" v-model="model.value"></vscode-text-field>
    </template>
    <Handle :id="'0:' + model.type" type="source" :position="Position.Right" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import { Handle, Position, useNode } from "@vue-flow/core";
import VueSelect from "vue-select";
import NodeWrapper from "../NodeWrapper.vue";
import { ref, watch } from "vue";
import { sendEventCommand } from "@/webview/utils";
import { GraphNodeUpdateState } from "@/shared/events";

const { id: nodeId } = useNode();

const model = ref<{
  type: string | null;
  value: string;
}>({
  type: null,
  value: "",
});

const CONST_TYPES: Array<{ label: string; value: string }> = [{ label: "String", value: "string" }];

function onTypeSelect(value: string): void {
  model.value.value = "";
}

watch(model.value, (value) => {
  sendEventCommand<GraphNodeUpdateState>({
    command: "graph:node-update-state",
    data: {
      id: nodeId,
      state: {
        type: value.type,
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
