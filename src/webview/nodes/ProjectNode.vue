<template>
  <NodeWrapper>
    <template #header>
      Project
      <div class="status" :class="tsCompilerStatus ? 'status--active' : 'status--inactive'"></div>
    </template>
    <template #body>
      <vscode-button @click="scanForProjects">Scan</vscode-button>
      <div class="dropdown-container">
        <label for="my-dropdown">Choose tsconfig:</label>
        <select size="5" class="nodrag nowheel select" style="width: 100%; cursor: default" v-model="chosenConfig">
          <option v-for="config in tsConfigList" :value="config.value">
            {{ config.label }}
          </option>
        </select>
      </div>
    </template>
    <Handle type="source" :position="Position.Right" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import type { NodeProps } from "@vue-flow/core";
import { Position, Handle, useNode } from "@vue-flow/core";
import { ref, watch } from "vue";
import { sendEventCommand, sendEventCommandAndWaitResult, useEventCommandResult } from "@/webview/utils";
import NodeWrapper from "./NodeWrapper.vue";
import { ScanTsConfigs, TsCompilerStatusChanged, TsConfigChanged } from "@/shared/events";

const tsConfigList = ref<{ value: string; label: string }[]>([]);
const chosenConfig = ref<string | null>(null);
const tsCompilerStatus = ref<boolean>(false);

const props = defineProps<NodeProps>();
const { node } = useNode();

watch(chosenConfig, (conf) => {
  node.data = conf;
  sendEventCommand<TsConfigChanged>({
    command: "project:tsconfig-selected",
    data: conf!,
  });
});

function scanForProjects(): void {
  sendEventCommandAndWaitResult<ScanTsConfigs>(
    {
      command: "lifecycle:scan-tsconfigs",
    },
    (data) => {
      tsConfigList.value = data;
    }
  );
}

scanForProjects();

useEventCommandResult<TsCompilerStatusChanged>("lifecycle:compiler:status", (data) => {
  tsCompilerStatus.value = data!;
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
