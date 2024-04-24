<template>
  <NodeWrapper>
    <template #header>Has Decorator</template>
    <template #body>
      <div style="margin-bottom: 10px">
        <vscode-text-field class="nodrag nowheel" readonly v-model="model.customName">Decorator Name</vscode-text-field>
      </div>
      <VueSelect class="nowheel nodrag" placeholder="Or choose..." :options="decoratorList" v-model="model.selection">
      </VueSelect>
    </template>
    <div class="target-handles">
      <Handle id="0:string" type="target" connectable="single" :position="Position.Left" data-name="Name?" />
      <Handle id="1:array" type="target" connectable="single" :position="Position.Left" data-name="Array?" />
    </div>
    <Handle id="0:predicate" type="source" :position="Position.Right" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import { Position, Handle, useNode } from "@vue-flow/core";
import { ref, watch } from "vue";
import { sendEventCommand, useEventCommandResult } from "@/webview/event-utils";
import { GraphNodeSendViewData, GraphNodeUpdateState } from "@/shared/events";

import VueSelect from "vue-select";
import NodeWrapper from "../NodeWrapper.vue";

const decoratorList = ref<string[]>([]);
const model = ref({
  customName: "",
  selection: "",
});
const { id: nodeId } = useNode();

useEventCommandResult<GraphNodeSendViewData, { id: string; data: { customName: string | null; decoratorList: string[] } }>(
  "graph:node-send-view-data",
  (data) => {
    if (nodeId === data.id) {
      decoratorList.value = data.data.decoratorList;
      model.value.customName = data.data.customName ?? "";
    }
  }
);

watch(model.value, (value) => {
  sendEventCommand<GraphNodeUpdateState>({
    command: "graph:node-update-state",
    data: {
      id: nodeId,
      state: {
        customName: value.customName,
        selection: value.selection,
      },
    },
  });
});
</script>

<style lang="scss">
.vue-flow__node-has-decorator-predicate {
  width: 200px;
}
</style>
