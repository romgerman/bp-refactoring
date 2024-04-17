<script setup lang="ts">
import { onMounted, provide, ref } from "vue";
import type { Elements } from "@vue-flow/core";
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { MiniMap } from "@vue-flow/minimap";

import ProjectNode from "./nodes/ProjectNode.vue";
import FileListNode from "./nodes/ClassListNode.vue";
import HasDecoratorNode from "./nodes/filters/HasDecoratorNode.vue";
import { sendEventCommand } from "./utils";
import { UpdateNodeGraph } from "@/shared/events";
import DropzoneBackground from "./DropzoneBackground.vue";
import useDragAndDrop from './useDnD'
import { useNodeStore } from "./store";
import { useEventListener } from "@vueuse/core";

const { onConnect, addEdges, removeNodes, getSelectedNodes } = useVueFlow();
const { onDragOver, onDrop, onDragLeave, isDragOver } = useDragAndDrop()

// const nodes = ref<Elements>([
//   { id: "1", type: "project", connectable: true, position: { x: 10, y: 5 } },
//   { id: "2", type: "class-list", connectable: true, position: { x: 700, y: 10 } },
//   { id: "3", type: "has-decorator", connectable: true, position: { x: 100, y: 100 } }
// ]);

const nodeStore = useNodeStore();

onConnect((conn) => {
  addEdges(conn);
  // sendEventCommand<UpdateNodeGraph>({
  //   command: 'lifecycle:update-node-graph',
  //   data: toObject()
  // })
});

useEventListener('keyup', (e) => {
  if (e.key === 'Delete') {
    removeNodes(getSelectedNodes.value);
  }
});
</script>

<template>
  <div class="dndflow" @drop="onDrop">
    <VueFlow v-model="nodeStore.nodes" @dragover="onDragOver" @dragleave="onDragLeave">
      <template #node-project="projectNodeProps">
        <ProjectNode v-bind="projectNodeProps" />
      </template>
      <template #node-class-list="fileListNodeProps">
        <FileListNode v-bind="fileListNodeProps" />
      </template>
      <template #node-has-decorator="hasDecoratorNodeProps">
        <HasDecoratorNode v-bind="hasDecoratorNodeProps" />
      </template>

      <DropzoneBackground :style="{
        backgroundColor: isDragOver ? '#e7f3ff' : 'transparent',
        transition: 'background-color 0.2s ease',
      }" />
      <MiniMap pannable zoomable />
    </VueFlow>
  </div>
</template>

<style>
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";
@import "@vue-flow/minimap/dist/style.css";

.dndflow {
  flex-direction: column;
  display: flex;
  height: 100%
}
</style>
