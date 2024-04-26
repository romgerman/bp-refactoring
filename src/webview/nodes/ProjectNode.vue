<template>
  <NodeWrapper>
    <template #header>
      Project
      <div class="status" :class="tsCompilerStatus ? 'bg-green-500' : 'bg-red-500'"></div>
    </template>
    <template #body>
      <vscode-button class="scan-btn" @click="updateNodeData">Scan</vscode-button>
      <VueSelect
        class="nodrag nowheel"
        placeholder="Choose tsconfig"
        :options="tsConfigList"
        :reduce="(item: any) => item.value"
        v-model="chosenConfig"
      >
        <template v-slot:option="option">
          {{ (option as any).label }}
        </template>
      </VueSelect>
    </template>
    <Handle id="0:array" type="source" :position="Position.Right" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Position, Handle, useNode, useVueFlow } from "@vue-flow/core";
import { sendEventCommand, useEventCommandResult } from "@/webview/event-utils";
import { GraphNodeGetViewData, GraphNodeSendViewData, GraphNodeUpdateState, TsCompilerStatusChanged } from "@/shared/events";
import VueSelect from "vue-select";
import NodeWrapper from "./NodeWrapper.vue";

const tsConfigList = ref<{ value: string; label: string }[]>([]);
const chosenConfig = ref<string | null>(null);
const tsCompilerStatus = ref<boolean>(false);

const { node, id: nodeId } = useNode();
const { onNodesInitialized } = useVueFlow();

onNodesInitialized(() => {
  if (typeof node.data === "string") {
    chosenConfig.value = node.data;
  }
});

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
function updateNodeData(): void {
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
  width: 300px;
  min-height: 100px;
}

.scan-btn {
  margin-bottom: 10px;
}

.status {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
