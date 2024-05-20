<template>
  <NodeWrapper>
    <template #header>File List</template>
    <template #body>
      <div class="nowheel" style="max-height: 200px; overflow: auto">
        <div v-for="file in fileList">
          {{ file }}
        </div>
        <div class="font-bold" v-if="greaterThanMaxItems">and {{ otherItemsCount }} more</div>
        <vscode-checkbox :checked="model.ignoreNodeModules" @change="model.ignoreNodeModules = !model.ignoreNodeModules">
          Ignore
          <pre style="display: inline;">node_modules</pre>
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
import { computed, ref } from "vue";
import { Handle, Position } from "@vue-flow/core";
import NodeWrapper from "../NodeWrapper.vue";
import { useNodeState } from "@/webview/composables/use-node-state";
import { FileListNode } from "@/blueprint/nodes/aggregation/file-list";
import { useViewData } from "@/webview/composables/use-view-data";

const MAX_ITEMS = 3;

const fileList = ref<string[]>([]);
const otherItemsCount = ref<number>(0);
const greaterThanMaxItems = computed(() => otherItemsCount.value > MAX_ITEMS);
const model = useNodeState<FileListNode>({ ignoreNodeModules: false });

useViewData<string[]>((data) => {
  otherItemsCount.value = data.length - MAX_ITEMS;
  fileList.value = data.slice(0, MAX_ITEMS);
});
</script>
