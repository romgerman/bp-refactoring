<template>
  <NodeWrapper>
    <template #header>Function List</template>
    <template #body>
      <div class="nowheel">
        <div style="max-height: 200px; overflow: auto">
          <div v-for="item in items">
            {{ item }}
          </div>
        </div>
        <div class="font-bold cursor-pointer" v-if="greaterThanMaxItems" @click="toggleAll()">
          <span v-if="!model.opened">and {{ otherItemsCount }} more</span>
          <span v-else>show less</span>
        </div>
      </div>
    </template>
    <div class="target-handles">
      <Handle id="0:array" type="target" connectable="single" :position="Position.Left" data-name="Array" />
    </div>
    <Handle id="0:array" type="source" :position="Position.Right" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import NodeWrapper from "../NodeWrapper.vue";
import { useViewData } from "@/webview/composables/use-view-data";
import { useCollapsableList } from "@/webview/composables/use-collapsable-list";

const { model, items, greaterThanMaxItems, otherItemsCount, toggleAll } = useCollapsableList();

useViewData<string[]>((data) => {
  model.value.allItems = data;
});
</script>
