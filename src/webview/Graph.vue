<script setup lang="ts">
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { MiniMap } from "@vue-flow/minimap";
import { useEventListener } from "@vueuse/core";
import useDragAndDrop from "./useDnD";
import { useNodeStore } from "./store";
import { GraphNodeAdded, GraphNodeConnected, GraphNodeDisconnected, GraphNodeRemoved } from "@/shared/events";
import { sendEventCommand } from "./utils";

import ProjectNode from "./nodes/ProjectNode.vue";
import ClassListNode from "./nodes/aggregation/ClassListNode.vue";
import FileListNode from "./nodes/aggregation/FileListNode.vue";
import HasDecoratorNode from "./nodes/filters/HasDecoratorNode.vue";
import DropzoneBackground from "./DropzoneBackground.vue";
import FilterByNode from "./nodes/filters/FilterByNode.vue";
import RenameClassActionNode from "./nodes/actions/RenameClassActionNode.vue";
import DebugActionNode from './nodes/actions/DebugActionNode.vue';
import ApplyActionNode from "./nodes/actions/ApplyActionNode.vue";

const { onConnect, onNodesChange, onEdgesChange, addEdges, removeNodes, getSelectedNodes } = useVueFlow();
const { onDragOver, onDrop, onDragLeave, isDragOver } = useDragAndDrop();

const nodeStore = useNodeStore();

onConnect((conn) => {
  if (conn.sourceHandle === conn.targetHandle || conn.targetHandle === "any") {
    addEdges(conn);
  }
});

onNodesChange((changes) => {
  if (changes[0].type === "add") {
    sendEventCommand<GraphNodeAdded>({
      command: "graph:node-added",
      data: {
        id: changes[0].item.id,
        type: changes[0].item.type,
      },
    });
  } else if (changes[0].type === "remove") {
    sendEventCommand<GraphNodeRemoved>({
      command: "graph:node-removed",
      data: { id: changes[0].id },
    });
  }
});

onEdgesChange((changes) => {
  if (changes[0].type === "add") {
    sendEventCommand<GraphNodeConnected>({
      command: "graph:node-connected",
      data: { sourceId: changes[0].item.source, targetId: changes[0].item.target },
    });
  } else if (changes[0].type === "remove") {
    sendEventCommand<GraphNodeDisconnected>({
      command: "graph:node-disconnected",
      data: { sourceId: changes[0].source, targetId: changes[0].target },
    });
  }
});

useEventListener("keyup", (e) => {
  if (e.key === "Delete") {
    removeNodes(getSelectedNodes.value);
  }
});
</script>

<template>
  <div class="dndflow" @drop="onDrop">
    <VueFlow v-model="nodeStore.nodes" @dragover="onDragOver" @dragleave="onDragLeave">
      <template #node-project="nodeProps">
        <ProjectNode v-bind="nodeProps" />
      </template>

      <template #node-class-list="nodeProps">
        <ClassListNode v-bind="nodeProps" />
      </template>
      <template #node-file-list="nodeProps">
        <FileListNode v-bind="nodeProps" />
      </template>

      <template #node-filter-by="nodeProps">
        <FilterByNode v-bind="nodeProps" />
      </template>
      <template #node-has-decorator-predicate="nodeProps">
        <HasDecoratorNode v-bind="nodeProps" />
      </template>

      <template #node-rename-class-action="nodeProps">
        <RenameClassActionNode v-bind="nodeProps" />
      </template>
      <template #node-debug-action="nodeProps">
        <DebugActionNode v-bind="nodeProps" />
      </template>
      <template #node-apply-action="nodeProps">
        <ApplyActionNode v-bind="nodeProps" />
      </template>

      <DropzoneBackground
        :style="{
          backgroundColor: isDragOver ? '#424a49' : 'transparent',
          transition: 'background-color 0.2s ease',
        }"
      />
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
  height: 100%;
}
</style>
