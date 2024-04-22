<template>
  <div class="container">
    <div><vscode-button @click="applyChanges">Apply Changes</vscode-button></div>
    <div class="graph-container">
      <Graph></Graph>
    </div>
  </div>
</template>

<style lang="scss">
.container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.graph-container {
  flex: 1;
}
</style>

<script setup lang="ts">
import { ApplyChanges } from "@/shared/events";
import Graph from "./Graph.vue";
import { sendEventCommand } from "./utils";
import { useVueFlow } from "@vue-flow/core";
import { NodeTypes } from "@/shared/node-types";

const { nodes } = useVueFlow();

function applyChanges(): void {
  if (nodes.value.find((x) => x.type === NodeTypes.ApplyAction)) {
    sendEventCommand<ApplyChanges>({
      command: "lifecycle:apply",
    });
  }
}
</script>
