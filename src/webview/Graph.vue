<template>
  <VueFlow v-model="elements">
    <template #node-project="projectNodeProps">
      <ProjectNode v-bind="projectNodeProps" />
    </template>
    <template #node-class-list="fileListNodeProps">
      <FileListNode v-bind="fileListNodeProps" />
    </template>
    <template #node-has-decorator="hasDecoratorNodeProps">
      <HasDecoratorNode v-bind="hasDecoratorNodeProps" />
    </template>

    <Background />
    <MiniMap pannable zoomable />
  </VueFlow>
</template>

<style>
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";
@import "@vue-flow/minimap/dist/style.css";
</style>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { Elements } from "@vue-flow/core";
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { MiniMap } from "@vue-flow/minimap";

import ProjectNode from "./nodes/ProjectNode.vue";
import FileListNode from "./nodes/ClassListNode.vue";
import HasDecoratorNode from "./nodes/filters/HasDecoratorNode.vue";
import { sendEventCommand } from "./utils";
import { UpdateNodeGraph } from "@/shared/events";

const { onConnect, addEdges, toObject } = useVueFlow();

const elements = ref<Elements>([
  { id: "1", type: "project", connectable: true, position: { x: 10, y: 5 } },
  { id: "2", type: "class-list", connectable: true, position: { x: 700, y: 10 } },
  { id: "3", type: "has-decorator", connectable: true, position: { x: 100, y: 100 } }
]);

onConnect((conn) => {
  addEdges(conn);
  // sendEventCommand<UpdateNodeGraph>({
  //   command: 'lifecycle:update-node-graph',
  //   data: toObject()
  // })
});
</script>
