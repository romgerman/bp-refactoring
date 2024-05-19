<script setup lang="ts">
import { markRaw } from "vue";
import {
  ConnectionLineType,
  ConnectionMode,
  ValidConnectionFunc,
  VueFlow,
  useVueFlow,
} from "@vue-flow/core";
import { MiniMap } from "@vue-flow/minimap";
import { useEventListener } from "@vueuse/core";
import useDragAndDrop from "./useDnD";
import { useNodeStore } from "./store";
import { GraphNodeAdded, GraphNodeConnected, GraphNodeDisconnected, GraphNodeRemoved } from "@/shared/events";
import { sendEventCommand } from "./event-utils";
import { parseHandleId } from "@/shared/handles";
import { NodeTypes } from "@/shared/node-types";

import DropzoneBackground from "./components/DropzoneBackground.vue";
import ConnectionPopup from "./components/ConnectionPopup.vue";

// Node imports

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
import ByModifierNode from "./nodes/filters/ByModifierNode.vue";

import RenameSymbolActionNode from "./nodes/actions/RenameSymbolActionNode.vue";
import RenameFileActionNode from "./nodes/actions/RenameFileActionNode.vue";
import DebugActionNode from "./nodes/actions/DebugActionNode.vue";
import ApplyActionNode from "./nodes/actions/ApplyActionNode.vue";

const nodeTypes = {
  [NodeTypes.Project]: markRaw(ProjectNode),
  [NodeTypes.Constant]: markRaw(ConstantNode),
  [NodeTypes.ClassList]: markRaw(ClassListNode),
  [NodeTypes.FileList]: markRaw(FileListNode),
  [NodeTypes.FunctionList]: markRaw(FunctionListNode),
  [NodeTypes.MemberList]: markRaw(MemberListNode),
  [NodeTypes.Preview]: markRaw(PreviewNode),
  [NodeTypes.DecoratorPredicate]: markRaw(HasDecoratorNode),
  [NodeTypes.FilterBy]: markRaw(FilterByNode),
  [NodeTypes.OfTypePredicate]: markRaw(OfTypeNode),
  [NodeTypes.ByRegExpPredicate]: markRaw(ByRegExpNode),
  [NodeTypes.ByGlobPredicate]: markRaw(ByGlobNode),
  [NodeTypes.ByModifierPredicate]: markRaw(ByModifierNode),
  [NodeTypes.RenameAction]: markRaw(RenameSymbolActionNode),
  [NodeTypes.RenameFileAction]: markRaw(RenameFileActionNode),
  [NodeTypes.DebugAction]: markRaw(DebugActionNode),
  [NodeTypes.ApplyAction]: markRaw(ApplyActionNode),
}

const isValidConnectionFn: ValidConnectionFunc = (conn, { sourceNode, targetNode }) => {
  return sourceNode.id !== targetNode.id;
};

const { onConnect, onNodesChange, onEdgesChange, addEdges, removeNodes, removeEdges, getSelectedEdges, getSelectedNodes } =
  useVueFlow({
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
    isValidConnection: isValidConnectionFn,
  });
const { onDragOver, onDrop, onDragLeave, isDragOver } = useDragAndDrop();

const nodeStore = useNodeStore();

onConnect((conn) => {
  const sourceHandle = parseHandleId(conn.sourceHandle);
  const targetHandle = parseHandleId(conn.targetHandle);
  if (sourceHandle.type === targetHandle.type || targetHandle.type === "any" || sourceHandle.type === "any") {
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
    removeEdges(getSelectedEdges.value);
  }
});
</script>

<template>
  <div class="dndflow" @drop="onDrop">
    <VueFlow v-model="nodeStore.nodes" :node-types="nodeTypes" @dragover="onDragOver" @dragleave="onDragLeave">
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
