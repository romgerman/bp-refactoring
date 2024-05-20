<template>
  <NodeWrapper>
    <template #header>Class List</template>
    <template #body>
      <div class="nowheel" style="max-height: 200px; overflow: auto">
        <div v-for="cls in classList">
          {{ cls }}
        </div>
        <div class="font-bold" v-if="greaterThanMaxItems">and {{ otherItemsCount }} more</div>
      </div>
    </template>
    <div class="target-handles">
      <Handle id="0:array" type="target" connectable="single" :position="Position.Left" data-name="Array" />
    </div>
    <Handle id="0:array" type="source" :position="Position.Right" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Handle, Position } from "@vue-flow/core";
import { useViewData } from "@/webview/composables/use-view-data";
import NodeWrapper from "../NodeWrapper.vue";

const MAX_ITEMS = 3;

const classList = ref<string[]>([]);
const otherItemsCount = ref<number>(0);
const greaterThanMaxItems = computed(() => otherItemsCount.value > MAX_ITEMS);

useViewData<string[]>(data => {
  otherItemsCount.value = data.length - MAX_ITEMS;
  classList.value = data.slice(0, MAX_ITEMS);
});
</script>
