<template>
  <NodeWrapper>
    <template #header>Member List</template>
    <template #body>
      <div class="nowheel" style="max-height: 200px; overflow: auto">
        <div v-for="item in memberList">
          {{ item }}
        </div>
        <div class="font-bold" v-if="greaterThanMaxItems">and {{ otherItemsCount }} more</div>
      </div>
    </template>
    <div class="target-handles">
      <Handle id="0:array" type="target" :position="Position.Left" data-name="Array" />
    </div>
    <Handle id="0:array" type="source" :position="Position.Right" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { GraphNodeSendViewData } from "@/shared/events";
import { useEventCommandResult } from "@/webview/utils";
import { Handle, Position, useNode } from "@vue-flow/core";
import NodeWrapper from "../NodeWrapper.vue";

const MAX_ITEMS = 3;

const memberList = ref<string[]>([]);
const otherItemsCount = ref<number>(0);
const greaterThanMaxItems = computed(() => otherItemsCount.value > MAX_ITEMS);
const { id: nodeId } = useNode();

useEventCommandResult<GraphNodeSendViewData, { id: string; data: string[] }>("graph:node-send-view-data", (data) => {
  if (nodeId === data.id) {
    otherItemsCount.value = data.data.length - MAX_ITEMS;
    memberList.value = data.data.slice(0, MAX_ITEMS);
  }
});
</script>
