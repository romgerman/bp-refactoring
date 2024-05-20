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
  GraphAddNodesBatch,
  GraphClean,
  GraphConnectNodesBatch,
  LoadBlueprint,
  SaveBlueprint,
} from "@/shared/events";
import { parseHandleId } from "@/shared/handles";
import { NodeTypes } from "@/shared/node-types";
import { useVueFlow } from "@vue-flow/core";
import { ref } from "vue";
import { sendEventCommand, sendEventCommandAndWaitResult, useEventCommandResultOnce } from "../event-utils";
import { updateCounter } from "../node-id";

const { nodes, edges, toObject, fromObject, removeNodes, removeEdges, onNodesInitialized } = useVueFlow();
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

async function loadFileInternal(data: any) {
  const json = JSON.parse(data);
  await fromObject(json);
  updateCounter(nodes.value.length + edges.value.length);

  // Add nodes
  sendEventCommand<GraphAddNodesBatch>({
    command: "graph:add-nodes-batch",
    data: {
      nodes: nodes.value.map((n) => ({ id: n.id, type: n.type })),
    },
  });

  // Wait until nodes initialized
  await new Promise((resolve) => {
    const e = onNodesInitialized((n) => {
      resolve(undefined);
      e.off();
    });
  });

  // Add edges
  sendEventCommand<GraphConnectNodesBatch>({
    command: "graph:connect-nodes-batch",
    data: {
      nodes: edges.value.map((edge) => ({
        sourceId: edge.source,
        sourceIndex: parseHandleId(edge.sourceHandle).index,
        targetId: edge.target,
        targetIndex: parseHandleId(edge.targetHandle).index,
      })),
    },
  });
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
        async () => {
          await loadFileInternal(data);
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
