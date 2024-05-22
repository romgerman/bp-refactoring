<template>
  <NodeWrapper @dblclick="openModal()">
    <template #header> Files ({{ model.allItems.length }}) </template>
    <template #body>
      <div class="nowheel">
        <div style="max-height: 200px; overflow: auto">
          <div v-for="file in items">
            {{ file.name }}
          </div>
        </div>
        <div class="font-bold cursor-pointer" v-if="greaterThanMaxItems" @click="toggleAll()">
          <span v-if="!model.opened">and {{ otherItemsCount }} more</span>
          <span v-else>show less</span>
        </div>
        <vscode-checkbox
          :checked="nodeState.ignoreNodeModules"
          @change="(event) => (nodeState.ignoreNodeModules = event.target.checked)"
        >
          Ignore
          <pre style="display: inline">node_modules</pre>
        </vscode-checkbox>
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
            <tr class="hover" v-for="file in filteredItems" @dblclick="openFile(file.path)">
              <td>{{ file.name }}</td>
            </tr>
          </tbody>
        </table>
      </Dialog>
    </Teleport>
  </NodeWrapper>
</template>

<script setup lang="ts">
import { EditorOpenFile } from "@/shared/events";
import Dialog from "@/webview/components/Dialog.vue";
import NodeWrapper from "@/webview/components/NodeWrapper.vue";
import { useCollapsableList } from "@/webview/composables/use-collapsable-list";
import { useNodeState } from "@/webview/composables/use-node-state";
import { useViewData } from "@/webview/composables/use-view-data";
import { sendEventCommand } from "@/webview/event-utils";
import { Handle, Position } from "@vue-flow/core";
import { computed, ref } from "vue";

const { model, items, greaterThanMaxItems, otherItemsCount, toggleAll } = useCollapsableList<{ name: string; path: string; }>();
const nodeState = useNodeState<{ ignoreNodeModules: boolean }>({ ignoreNodeModules: false });
const editorState = ref<{ query: string }>({
  query: "",
});
const filteredItems = computed(() => model.value.allItems.filter((x) => x.name.includes(editorState.value.query)));
const editorModal = ref<InstanceType<typeof Dialog>>();

useViewData<{ name: string; path: string; }[]>((data) => {
  model.value.allItems = data;
});

function openModal(): void {
  editorModal.value.showDialog();
}

function openFile(path: string): void {
  sendEventCommand<EditorOpenFile>({
    command: "editor:open-file",
    data: {
      path,
    },
  });
}
</script>
