<template>
  <NodeWrapper>
    <template #header>
      Project
      <div class="status" :class="status ? 'bg-green-500' : 'bg-red-500'"></div>
      <vscode-progress-ring class="progress" v-if="loading"></vscode-progress-ring>
    </template>
    <template #body>
      <vscode-button class="scan-btn" @click="updateNodeData">Scan</vscode-button>
      <VueSelect
        class="nodrag nowheel"
        placeholder="Choose tsconfig"
        :options="configList"
        :reduce="(item: any) => item.value"
        v-model="model"
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
import { GraphNodeGetViewData, GraphNodeUpdateState, TsCompilerStatusChanged } from "@/shared/events";
import VueSelect from "vue-select";
import NodeWrapper from "../components/NodeWrapper.vue";
import { useViewData } from "../composables/use-view-data";

const configList = ref<{ value: string; label: string }[]>([]);
const model = ref<string | null>(null);
const status = ref<boolean>(false);
const loading = ref<boolean>(false);

const { node, id: nodeId } = useNode();
const { onNodesInitialized } = useVueFlow();

onNodesInitialized(() => {
  if (typeof node.data === "string") {
    model.value = node.data;
  }
});

// Subscribe to status of current project TS compiler
useEventCommandResult<TsCompilerStatusChanged>("lifecycle:compiler:status", (data) => {
  status.value = data!;
  loading.value = !loading.value;
});

// Subscribe to node data updates
useViewData<{ value: string; label: string }[]>((data) => {
  configList.value = data;
});

// Get current node view data
function updateNodeData(): void {
  sendEventCommand<GraphNodeGetViewData>({
    command: "graph:node-get-view-data",
    data: { id: node.id },
  });
}

watch(model, (selectedConfig) => {
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
</style>

<style lang="scss" scoped>
.scan-btn {
  margin-bottom: 10px;
}

.status {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.progress {
  display: inline-block;
  height: 14px;
}
</style>
