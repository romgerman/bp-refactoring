<template>
  <NodeWrapper>
    <template #header>Has Decorator</template>
    <template #body>
      <div>
        <vscode-text-field class="nodrag nowheel" v-model="model.customName">Custom Decorator Name</vscode-text-field>
      </div>
      <div class="nowheel" style="max-height: 200px; overflow: auto">
        <div class="dropdown-container">
          <label for="my-dropdown">Or choose from used decorators:</label>
          <select size="5" class="nodrag nowheel select" style="width: 100%; cursor: default" v-model="model.selection">
            <option v-for="cls in decoratorList" :value="cls">
              {{ cls }}
            </option>
          </select>
        </div>
      </div>
    </template>
    <div class="target-handles">
      <Handle id="0:array" type="target" :position="Position.Left" data-name="Array?" />
    </div>
    <Handle id="0:predicate" type="source" :position="Position.Right" :is-valid-connection="isValidConnectionTarget" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import type { NodeProps, ValidConnectionFunc } from "@vue-flow/core";
import { Position, Handle, useNode } from "@vue-flow/core";
import { ref, watch } from "vue";
import NodeWrapper from "../NodeWrapper.vue";
import { sendEventCommand, useEventCommandResult } from "@/webview/utils";
import { GraphNodeSendViewData, GraphNodeUpdateState } from "@/shared/events";

const props = defineProps<NodeProps>();
const decoratorList = ref<string[]>([]);
const model = ref({
  customName: '',
  selection: ''
});
const { id: nodeId } = useNode();

const isValidConnectionTarget: ValidConnectionFunc = (conn, { sourceNode, targetNode }) => {
  return sourceNode.id !== targetNode.id;
};

useEventCommandResult<GraphNodeSendViewData, { id: string; data: string[] }>("graph:node-send-view-data", (data) => {
  if (nodeId === data.id) {
    decoratorList.value = data.data;
  }
});

watch(model.value, (value) => {
  sendEventCommand<GraphNodeUpdateState>({
    command: "graph:node-update-state",
    data: {
      id: nodeId,
      state: {
        customName: value.customName,
        selection: value.selection
      },
    },
  });
});
</script>

<style lang="scss">
.vue-flow__node-has-decorator-predicate {
  color: #fff;
}
</style>
