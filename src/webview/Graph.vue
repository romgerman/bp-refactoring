<script setup lang="ts">
import { ConnectionLineType, ConnectionMode, MarkerType, SelectionMode, ValidConnectionFunc, VueFlow, useVueFlow } from "@vue-flow/core";
import { MiniMap } from "@vue-flow/minimap";
import { useEventListener } from "@vueuse/core";
import useDragAndDrop from "./useDnD";
import { useNodeStore } from "./store";
import { GraphNodeAdded, GraphNodeConnected, GraphNodeDisconnected, GraphNodeRemoved } from "@/shared/events";
import { sendEventCommand } from "./utils";
import { parseHandleId } from "@/shared/handles";

import DropzoneBackground from "./DropzoneBackground.vue";
import ConnectionPopup from "./ConnectionPopup.vue";

import ProjectNode from "./nodes/ProjectNode.vue";
import ConstantNode from "./nodes/data/ConstantNode.vue";

import ClassListNode from "./nodes/aggregation/ClassListNode.vue";
import FileListNode from "./nodes/aggregation/FileListNode.vue";
import FunctionListNode from "./nodes/aggregation/FunctionListNode.vue";
import MemberListNode from "./nodes/aggregation/MemberListNode.vue";
import PreviewNode from "./nodes/aggregation/PreviewNode.vue";

import HasDecoratorNode from "./nodes/filters/HasDecoratorNode.vue";
import FilterByNode from "./nodes/filters/FilterByNode.vue";
import OfTypeNode from "./nodes/filters/OfTypeNode.vue";
import ByRegExpNode from "./nodes/filters/ByRegExpNode.vue";
import ByGlobNode from "./nodes/filters/ByGlobNode.vue";

import RenameClassActionNode from "./nodes/actions/RenameClassActionNode.vue";
import DebugActionNode from "./nodes/actions/DebugActionNode.vue";
import ApplyActionNode from "./nodes/actions/ApplyActionNode.vue";

const isValidConnectionFn: ValidConnectionFunc = (conn, { sourceNode, targetNode }) => {
  return sourceNode.id !== targetNode.id;
};

const { onConnect, onNodesChange, onEdgesChange, addEdges, removeNodes, getSelectedNodes } = useVueFlow({
  connectionLineOptions: {
    type: ConnectionLineType.SmoothStep,
    style: {
      strokeWidth: 2.5,
    },
  },
  defaultEdgeOptions: {
    type: "smoothstep",
    style: {
      strokeWidth: 2.5,
    },
  },
  connectionMode: ConnectionMode.Strict,
  connectionRadius: 15,
  elevateNodesOnSelect: true,
  elevateEdgesOnSelect: true,
  isValidConnection: isValidConnectionFn
});
const { onDragOver, onDrop, onDragLeave, isDragOver } = useDragAndDrop();

const nodeStore = useNodeStore();

onConnect((conn) => {
  const sourceHandle = parseHandleId(conn.sourceHandle);
  const targetHandle = parseHandleId(conn.targetHandle);
  if (sourceHandle.type === targetHandle.type || targetHandle.type === "any") {
    addEdges(conn);
  }
});

onNodesChange((changes) => {
  for (const change of changes) {
    if (change.type === "add") {
      sendEventCommand<GraphNodeAdded>({
        command: "graph:node-added",
        data: {
          id: change.item.id,
          type: change.item.type,
        },
      });
    } else if (change.type === "remove") {
      sendEventCommand<GraphNodeRemoved>({
        command: "graph:node-removed",
        data: { id: change.id },
      });
    }
  }
});

onEdgesChange((changes) => {
  for (const change of changes) {
    if (change.type === "add") {
      const sourceHandle = parseHandleId(change.item.sourceHandle);
      const targetHandle = parseHandleId(change.item.targetHandle);
      sendEventCommand<GraphNodeConnected>({
        command: "graph:node-connected",
        data: {
          sourceId: change.item.source,
          targetId: change.item.target,
          sourceIndex: sourceHandle.index,
          targetIndex: targetHandle.index,
        },
      });
    } else if (change.type === "remove") {
      sendEventCommand<GraphNodeDisconnected>({
        command: "graph:node-disconnected",
        data: { sourceId: change.source, targetId: change.target },
      });
    }
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

      <template #node-constant="nodeProps">
        <ConstantNode v-bind="nodeProps" />
      </template>

      <template #node-class-list="nodeProps">
        <ClassListNode v-bind="nodeProps" />
      </template>
      <template #node-file-list="nodeProps">
        <FileListNode v-bind="nodeProps" />
      </template>
      <template #node-function-list="nodeProps">
        <FunctionListNode v-bind="nodeProps" />
      </template>
      <template #node-member-list="nodeProps">
        <MemberListNode v-bind="nodeProps" />
      </template>
      <template #node-preview="nodeProps">
        <PreviewNode v-bind="nodeProps" />
      </template>

      <template #node-filter-by="nodeProps">
        <FilterByNode v-bind="nodeProps" />
      </template>
      <template #node-has-decorator-predicate="nodeProps">
        <HasDecoratorNode v-bind="nodeProps" />
      </template>
      <template #node-of-type-predicate="nodeProps">
        <OfTypeNode v-bind="nodeProps" />
      </template>
      <template #node-by-regexp-predicate="nodeProps">
        <ByRegExpNode v-bind="nodeProps" />
      </template>
      <template #node-by-glob-predicate="nodeProps">
        <ByGlobNode v-bind="nodeProps" />
      </template>

      <template #node-rename-action="nodeProps">
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
      <MiniMap pannable zoomable maskColor="#424a49" />
    </VueFlow>
    <ConnectionPopup />
  </div>
</template>

<style>
.dndflow {
  position: relative;
  flex-direction: column;
  display: flex;
  height: 100%;
}
</style>
