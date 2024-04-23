<template>
  <div class="p-2 flex justify-center">
    <div></div>
    <div class="flex-1"></div>
    <div class="flex gap-2">
      <vscode-progress-ring v-if="inProgress"></vscode-progress-ring>
      <vscode-button @click="applyChanges">Apply</vscode-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ApplyChanges, ApplyChangesComplete } from "@/shared/events";
import { sendEventCommand, useEventCommandResultOnce } from "./utils";
import { useVueFlow } from "@vue-flow/core";
import { NodeTypes } from "@/shared/node-types";
import { ref } from "vue";

const { nodes } = useVueFlow();
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
</script>
