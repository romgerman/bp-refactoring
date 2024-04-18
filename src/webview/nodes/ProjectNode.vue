<template>
  <NodeWrapper>
    <template #header>
      Project
      <div class="status" :class="tsCompilerStatus ? 'status--active' : 'status--inactive'"></div>
    </template>
    <template #body>
      <vscode-button @click="getNodeData">Scan</vscode-button>
      <div class="dropdown-container">
        <label for="my-dropdown">Choose tsconfig:</label>
        <select size="5" class="nodrag nowheel select" style="width: 100%; cursor: default" v-model="chosenConfig">
          <option v-for="config in tsConfigList" :value="config.value">
            {{ config.label }}
          </option>
        </select>
      </div>
    </template>
    <Handle id="array" type="source" :position="Position.Right" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { NodeProps } from "@vue-flow/core";
import { Position, Handle, useNode, useVueFlow } from "@vue-flow/core";
import { sendEventCommand, useEventCommandResult } from "@/webview/utils";
import { GraphNodeGetViewData, GraphNodeSendViewData, GraphNodeUpdateState, TsCompilerStatusChanged } from "@/shared/events";
import NodeWrapper from "./NodeWrapper.vue";

const tsConfigList = ref<{ value: string; label: string }[]>([]);
const chosenConfig = ref<string | null>(null);
const tsCompilerStatus = ref<boolean>(false);

const props = defineProps<NodeProps>();
const { node, id: nodeId } = useNode();

// Subscribe to status of current project TS compiler
useEventCommandResult<TsCompilerStatusChanged>("lifecycle:compiler:status", (data) => {
  tsCompilerStatus.value = data!;
});

// Subscribe to node data updates
useEventCommandResult<GraphNodeSendViewData, { id: string; data: Array<{ value: string; label: string }> }>(
  "graph:node-send-view-data",
  (data) => {
    if (nodeId === data.id) {
      tsConfigList.value = data.data;
    }
  }
);

// Get current node view data
function getNodeData(): void {
  sendEventCommand<GraphNodeGetViewData>({
    command: "graph:node-get-view-data",
    data: { id: node.id },
  });
}

watch(chosenConfig, (selectedConfig) => {
  node.data = selectedConfig;
  sendEventCommand<GraphNodeUpdateState>({
    command: "graph:node-update-state",
    data: {
      id: nodeId,
      state: selectedConfig,
    },
  });
});
</script>

<style lang="scss">
.vue-flow__node-project {
  min-width: 300px;
  min-height: 100px;
  color: #fff;
}

.select {
  background-color: transparent;
}

.status {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status--inactive {
  background-color: red;
}

.status--active {
  background-color: greenyellow;
}
</style>
