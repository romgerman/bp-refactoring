<template>
  <div class="rounded-md shadow-lg bg-gray-900">
    <div class="p-2 bg-gray-700 rounded-t-md">
      <h3>
        <slot name="header" />
      </h3>
    </div>
    <div class="p-4 rounded-b-md">
      <slot name="body" />
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { useNode, useVueFlow } from '@vue-flow/core';
import { sendEventCommand } from '../utils';
import { GraphNodeGetViewData } from '@/shared/events';

const { onNodesInitialized } = useVueFlow();
const { id: nodeId } = useNode();

// After node has been added to graph request node data
onNodesInitialized(() => {
  sendEventCommand<GraphNodeGetViewData>({
    command: "graph:node-get-view-data",
    data: { id: nodeId },
  });
});
</script>
