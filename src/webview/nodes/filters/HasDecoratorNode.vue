<template>
  <NodeWrapper>
    <template #header>Has Decorators</template>
    <template #body>
      <div class="nowheel" style="max-height: 200px; overflow: auto;">
        <div v-for="cls in classList">
          {{ cls }}
        </div>
      </div>
    </template>
    <Handle type="target" :position="Position.Left" :is-valid-connection="isValidConnectionTarget" />
    <Handle type="source" :position="Position.Right" :is-valid-connection="isValidConnectionSource" />
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

const isValidConnectionTarget: ValidConnectionFunc = (conn, { sourceNode }) => {
  return sourceNode.type === "class-list";
};

const isValidConnectionSource: ValidConnectionFunc = (conn, { targetNode }) => {
  return false;
};

useConnected((node) => {
  if (node) {
    // sendEventCommandAndWaitResult<GetClassList>({
    //   command: "project:classlist",
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
