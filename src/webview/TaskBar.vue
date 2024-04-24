<template>
  <div class="p-2 flex justify-center">
    <div class="flex gap-2">
      <vscode-button :disabled="inProgress" @click="loadFile">Load</vscode-button>
      <vscode-button :disabled="inProgress" @click="saveFile">Save</vscode-button>
    </div>
    <div class="flex-1"></div>
    <div class="flex gap-2">
      <vscode-progress-ring v-if="inProgress"></vscode-progress-ring>
      <vscode-button :disabled="inProgress" @click="applyChanges">Apply</vscode-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ApplyChanges,
  ApplyChangesComplete,
  GraphClean,
  GraphNodeAdded,
  GraphNodeConnected,
  LoadBlueprint,
  SaveBlueprint,
} from "@/shared/events";
import { sendEventCommand, sendEventCommandAndWaitResult, useEventCommandResultOnce } from "./event-utils";
import { useVueFlow } from "@vue-flow/core";
import { NodeTypes } from "@/shared/node-types";
import { ref } from "vue";
import { updateCounter } from "./node-id";
import { parseHandleId } from "@/shared/handles";

const { nodes, edges, toObject, fromObject, removeNodes, removeEdges } = useVueFlow();
const inProgress = ref<boolean>(false);

function applyChanges(): void {
  if (nodes.value.find((x) => x.type === NodeTypes.ApplyAction)) {
    sendEventCommand<ApplyChanges>({
      command: "lifecycle:apply",
    });
    inProgress.value = true;
    useEventCommandResultOnce<ApplyChangesComplete>("lifecycle:apply-complete", () => {
      inProgress.value = false;
    });
  }
}

function loadFileInternal(data: any) {
  const json = JSON.parse(data);
  fromObject(json);
  updateCounter(nodes.value.length);

  for (const node of nodes.value) {
    sendEventCommand<GraphNodeAdded>({
      command: "graph:node-added",
      data: {
        id: node.id,
        type: node.type,
      },
    });
  }

  for (const edge of edges.value) {
    sendEventCommand<GraphNodeConnected>({
      command: "graph:node-connected",
      data: {
        sourceId: edge.source,
        sourceIndex: parseHandleId(edge.sourceHandle).index,
        targetId: edge.target,
        targetIndex: parseHandleId(edge.targetHandle).index,
      },
    });
  }
}

function loadFile(): void {
  sendEventCommandAndWaitResult<LoadBlueprint>(
    {
      command: "lifecycle:load",
    },
    ({ data }) => {
      inProgress.value = true;
      removeEdges(edges.value);
      removeNodes(nodes.value);

      sendEventCommandAndWaitResult<GraphClean>(
        {
          command: "graph:clean",
        },
        () => {
          loadFileInternal(data);
          inProgress.value = false;
        }
      );
    }
  );
}

function saveFile(): void {
  sendEventCommand<SaveBlueprint>({
    command: "lifecycle:save",
    data: {
      data: toObject(),
    },
  });
}
</script>
