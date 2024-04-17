<template>
  <NodeWrapper>
    <template #header>Has Decorator</template>
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
import { useConnected } from "@/webview/utils";
import { ref } from "vue";
import NodeWrapper from "../NodeWrapper.vue";

const props = defineProps<NodeProps>();
const classList = ref<string[]>([]);

const isValidConnectionTarget: ValidConnectionFunc = (conn, { sourceNode, targetNode }) => {
  return sourceNode.id !== targetNode.id;
};

useConnected((node) => {
  if (node) {
    // sendEventCommandAndWaitResult<GetClassList>({
    //   command: "project:get-classlist",
    // }, (data: string[]) => {
    //   classList.value = data;
    // });
  }
});

</script>

<style lang="scss">
.vue-flow__node-has-decorator {
  color: #fff;
}
</style>
