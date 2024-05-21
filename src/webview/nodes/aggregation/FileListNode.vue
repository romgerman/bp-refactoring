<template>
  <NodeWrapper>
    <template #header>File List</template>
    <template #body>
      <div class="nowheel">
        <div style="max-height: 200px; overflow: auto">
          <div v-for="file in items">
            {{ file }}
          </div>
        </div>
        <div class="font-bold cursor-pointer" v-if="greaterThanMaxItems" @click="toggleAll()">
          <span v-if="!model.opened">and {{ otherItemsCount }} more</span>
          <span v-else>show less</span>
        </div>
        <vscode-checkbox
          :checked="nodeState.ignoreNodeModules"
          @change="(event) => (nodeState.ignoreNodeModules = event.target.checked)"
        >
          Ignore
          <pre style="display: inline">node_modules</pre>
        </vscode-checkbox>
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
import { useNodeState } from "@/webview/composables/use-node-state";
import { useViewData } from "@/webview/composables/use-view-data";
import { useCollapsableList } from "@/webview/composables/use-collapsable-list";

const { model, items, greaterThanMaxItems, otherItemsCount, toggleAll } = useCollapsableList();
const nodeState = useNodeState<{ ignoreNodeModules: boolean }>({ ignoreNodeModules: false });

useViewData<string[]>((data) => {
  model.value.allItems = data;
});
</script>
