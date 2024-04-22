<template>
  <div v-if="reference" ref="floating" :style="floatingStyles" class="node-selection-popup">
    <div class="rounded-md bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 text-gray-50 p-3 h-full flex flex-col">
      <vscode-text-field placeholder="search..." autofocus class="w-full" v-model="query"></vscode-text-field>
      <div class="node-list">
        <template v-for="node in nodes">
          <h3 v-if="node.group" class="py-1">{{ node.name }}</h3>
          <NodeWrapper v-if="node.type" condensed class="cursor-pointer" @click="addNode(node.type)">
            <template #header>{{ node.name }}</template>
          </NodeWrapper>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { flip, offset, useFloating } from "@floating-ui/vue";
import { useConnectionPopup } from "./useConnectionPopup";
import { onClickOutside } from "@vueuse/core";
import NodeWrapper from "./nodes/NodeWrapper.vue";
import { NODES } from "./nodes";
import { Connection, OnConnectStartParams, useVueFlow } from "@vue-flow/core";
import { getId } from "./node-id";

const reference = ref(null);
const floating = ref(null);
const {
  floatingStyles,
  x: popupX,
  y: popupY,
} = useFloating(reference, floating, {
  placement: "bottom-start",
  middleware: [offset(10), flip()],
});
onClickOutside(floating, () => closePopup());
const query = ref<string>("");
const nodes = computed(() =>
  NODES.filter(
    (x) =>
      x.name.toLocaleLowerCase().includes(query.value.toLocaleLowerCase()) || x.type?.includes(query.value.toLocaleLowerCase())
  )
);

const { addNodes, addEdges } = useVueFlow();
const connectParams = ref<OnConnectStartParams>()

function addNode(type: string): void {
  const targetId = getId("quick");
  addNodes([{ id: targetId, type: type, position: { x: popupX.value, y: popupY.value } }]);
  addEdges([
    {
      source: connectParams.value.nodeId!,
      target: targetId,
      sourceHandle: connectParams.value.handleId,
    } satisfies Connection
  ]);

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
  (e, params) => {
    connectParams.value = params;
    handleClick({ clientX: e.clientX, clientY: e.clientY });
  },
  () => closePopup()
);
</script>

<style lang="scss" scoped>
.node-selection-popup {
  width: 200px;
  height: 300px;
}

.node-list {
  height: 100%;
  overflow: auto;
}
</style>
