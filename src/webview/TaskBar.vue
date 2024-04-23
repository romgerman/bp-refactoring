<template>
  <div class="p-2 flex justify-center">
    <div></div>
    <div class="flex-1"></div>
    <div>
      <vscode-button @click="applyChanges">Apply</vscode-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ApplyChanges } from "@/shared/events";
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
