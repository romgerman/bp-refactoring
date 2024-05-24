<template>
  <div v-if="reference" ref="floating" :style="floatingStyles" class="node-selection-popup">
    <div
      class="rounded-md bg-vscode-side-bar shadow-lg ring-1 ring-black ring-opacity-5 border-1 border-vscode p-3 h-full flex flex-col"
    >
      <vscode-text-field placeholder="search..." autofocus class="w-full mb-2" v-model="query"></vscode-text-field>
      <div class="node-list pr-1">
        <NodeWrapper
          v-if="!nodeStore.hasProjectNode"
          condensed
          class="cursor-pointer"
          draggable="true"
          @dragstart="onDragStart($event, NodeTypes.Project)"
          @click="addNode('project')"
        >
          <template #header>Project</template>
        </NodeWrapper>
        <template v-for="node in nodes">
          <h3 v-if="node.group" class="my-1">{{ node.name }}</h3>
          <NodeWrapper
            v-if="node.type"
            condensed
            class="cursor-pointer mb-1"
            draggable="true"
            @dragstart="onDragStart($event, node.type)"
            @click="addNode(node.type)"
          >
            <template #header>{{ node.name }}</template>
          </NodeWrapper>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { flip, useFloating } from "@floating-ui/vue";
import { useVueFlow } from "@vue-flow/core";
import { onClickOutside } from "@vueuse/core";
import { NodeTypes } from "@/shared/node-types";
import { useConnectionPopup } from "@/webview/composables/useConnectionPopup";
import useDragAndDrop from "@/webview/composables/useDnD";
import { getId } from "@/webview/node-id";
import { NODES } from "@/webview/nodes";
import { useNodeStore } from "@/webview/store";

import NodeWrapper from "./NodeWrapper.vue";

const { onDragStart } = useDragAndDrop();
const { addNodes, screenToFlowCoordinate } = useVueFlow();
const nodeStore = useNodeStore();

const reference = ref(null);
const floating = ref(null);
const {
  floatingStyles,
  x: popupX,
  y: popupY,
} = useFloating(reference, floating, {
  placement: "bottom-start",
  middleware: [flip()],
});
onClickOutside(floating, () => closePopup());
const query = ref<string>("");
const nodes = computed(() =>
  NODES.filter(
    (x) =>
      x.name.toLocaleLowerCase().includes(query.value.toLocaleLowerCase()) || x.type?.includes(query.value.toLocaleLowerCase())
  )
);

function addNode(type: string): void {
  const targetId = getId("quick");
  const position = screenToFlowCoordinate({
    x: popupX.value,
    y: popupY.value
  })
  addNodes([{ id: targetId, type: type, position }]);
  closePopup();
}

function closePopup(): void {
  reference.value = null;
}

function handleClick({ clientX, clientY }) {
  reference.value = {
    getBoundingClientRect() {
      return {
        width: 0,
        height: 0,
        x: clientX,
        y: clientY,
        top: clientY,
        left: clientX,
        right: clientX,
        bottom: clientY,
      };
    },
    contextElement: floating.value,
  };
}

useConnectionPopup(
  (e) => {
    query.value = "";
    handleClick({ clientX: e.clientX, clientY: e.clientY });
  },
  () => closePopup()
);
</script>

<style lang="scss" scoped>
.node-selection-popup {
  width: 220px;
  height: 300px;
}

.node-list {
  height: 100%;
  overflow: auto;
}
</style>
