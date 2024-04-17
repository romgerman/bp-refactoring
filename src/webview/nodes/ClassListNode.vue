<template>
  <NodeWrapper>
    <template #header>Class list</template>
    <template #body>
      <div class="nowheel" style="max-height: 200px; overflow: auto;">
        <div v-for="cls in classList">
          {{ cls }}
        </div>
      </div>
    </template>
    <Handle type="target" :position="Position.Left" />
    <Handle type="source" :position="Position.Right" :is-valid-connection="isValidConnectionTarget" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import type { NodeProps, ValidConnectionFunc } from "@vue-flow/core";
import { Position, Handle } from "@vue-flow/core";
import { useConnected, useEventCommandResult } from "@/webview/utils";
import { GetClassList, UpdateAllNodes } from "@/shared/events/index";
import { sendEventCommandAndWaitResult } from "@/webview/utils";
import { ref } from "vue";
import NodeWrapper from "./NodeWrapper.vue";

const props = defineProps<NodeProps>();
const classList = ref<string[]>([]);

const isValidConnectionTarget: ValidConnectionFunc = (conn, { sourceNode, targetNode }) => {
  return sourceNode.id !== targetNode.id;
};

function refresh(): void {
  sendEventCommandAndWaitResult<GetClassList>({
    command: "project:get-classlist",
  }, (data: string[]) => {
    classList.value = data;
  });
}

useConnected((node) => {
  if (node) {
    refresh();
  }
});

useEventCommandResult<UpdateAllNodes>("lifecycle:update-all-nodes", (data) => {
  refresh();
});
</script>

<style lang="scss">
.vue-flow__node-class-list {
  color: #fff;
}
</style>
