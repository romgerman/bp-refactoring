<template>
  <NodeWrapper>
    <template #header>Of Type</template>
    <template #body>
      <VueSelect
        class="nowheel nodrag"
        placeholder="Select type"
        :options="types"
        :reduce="(item) => item.value"
        v-model="selection"
      >
        <template #option="option">
          {{ (option as any).label }}
        </template>
      </VueSelect>
    </template>
    <Handle id="0:predicate" type="source" :position="Position.Right" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import { ref, toRaw, watch } from "vue";
import { Position, Handle, useNode, useVueFlow } from "@vue-flow/core";
import VueSelect from "vue-select";
import NodeWrapper from "../NodeWrapper.vue";
import { sendEventCommand } from "@/webview/event-utils";
import { GraphNodeUpdateState } from "@/shared/events";

const { node, id: nodeId } = useNode();
const selection = ref<string | null>(null);
const { onNodesInitialized } = useVueFlow()

const types = [
  { value: "class-decl", label: "Class" },
  { value: "function-decl", label: "Function" },
  { value: "method-decl", label: "Method" },
];

onNodesInitialized(() => {
  if (typeof node.data === "string") {
    selection.value = toRaw(node.data);
  }
});

watch(selection, (value) => {
  sendEventCommand<GraphNodeUpdateState>({
    command: "graph:node-update-state",
    data: {
      id: nodeId,
      state: {
        type: (node.data = value),
      },
    },
  });
});
</script>

<style lang="scss">
.vue-flow__node-of-type-predicate {
  width: 200px;
}
</style>
