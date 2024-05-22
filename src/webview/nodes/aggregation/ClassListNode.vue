<template>
  <NodeWrapper @dblclick="openModal()">
    <template #header>Classes ({{ model.allItems.length }})</template>
    <template #body>
      <div class="nowheel">
        <div style="max-height: 200px; overflow: auto">
          <div v-for="cls in items">
            {{ cls }}
          </div>
        </div>
        <div class="font-bold cursor-pointer" v-if="greaterThanMaxItems" @click="toggleAll()">
          <span v-if="!model.opened">and {{ otherItemsCount }} more</span>
          <span v-else>show less</span>
        </div>
      </div>
    </template>
    <div class="target-handles">
      <Handle id="0:array" type="target" connectable="single" :position="Position.Left" data-name="Array" />
    </div>
    <Handle id="0:array" type="source" :position="Position.Right" />

    <Teleport to="body">
      <Dialog ref="editorModal">
        <template #header>
          <vscode-text-field placeholder="Search..." v-model="editorState.query"></vscode-text-field>
        </template>
        <table class="table table-sm">
          <tbody>
            <tr class="hover" v-for="className in filteredItems">
              <td>{{ className }}</td>
            </tr>
          </tbody>
        </table>
      </Dialog>
    </Teleport>
  </NodeWrapper>
</template>

<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import { useViewData } from "@/webview/composables/use-view-data";
import { useCollapsableList } from "@/webview/composables/use-collapsable-list";
import NodeWrapper from "@/webview/components/NodeWrapper.vue";
import Dialog from "@/webview/components/Dialog.vue";
import { computed, ref } from "vue";

const { model, items, greaterThanMaxItems, otherItemsCount, toggleAll } = useCollapsableList<string>();
const editorState = ref<{ query: string }>({
  query: "",
});
const filteredItems = computed(() => model.value.allItems.filter((name) => name.includes(editorState.value.query)));
const editorModal = ref<InstanceType<typeof Dialog>>();

function openModal(): void {
  editorModal.value.showDialog();
}

useViewData<string[]>(data => {
  model.value.allItems = data;
});
</script>
