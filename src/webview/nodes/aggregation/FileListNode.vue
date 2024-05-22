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
      <dialog class="modal" ref="editorModal">
        <div class="modal-box max-w-full flex flex-col">
          <div class="flex flex-col flex-1 min-h-0">
            <h3 class="font-bold text-lg">
              <vscode-text-field placeholder="Search..." v-model="editorState.query"></vscode-text-field>
            </h3>

            <div class="overflow-auto">
              <table class="table">
                <tbody>
                  <tr class="hover" v-for="file in filteredItems" @dblclick="openFile(file.path)">
                    <td>{{ file.name }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-action">
            <form method="dialog">
              <vscode-button type="submit">Close</vscode-button>
            </form>
          </div>
        </div>
      </dialog>
    </Teleport>
  </NodeWrapper>
</template>

<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import NodeWrapper from "../NodeWrapper.vue";
import { useNodeState } from "@/webview/composables/use-node-state";
import { useViewData } from "@/webview/composables/use-view-data";
import { useCollapsableList } from "@/webview/composables/use-collapsable-list";
import { computed, ref } from "vue";
import { sendEventCommand } from "@/webview/event-utils";
import { EditorOpenFile } from "@/shared/events";

const { model, items, greaterThanMaxItems, otherItemsCount, toggleAll } = useCollapsableList<{ name: string; path: string; }>();
const nodeState = useNodeState<{ ignoreNodeModules: boolean }>({ ignoreNodeModules: false });
const editorState = ref<{ query: string }>({
  query: "",
});
const filteredItems = computed(() => model.value.allItems.filter((x) => x.name.includes(editorState.value.query.toLocaleLowerCase())));
const editorModal = ref<HTMLDialogElement>(null);

useViewData<{ name: string; path: string; }[]>((data) => {
  model.value.allItems = data;
});

function openModal(): void {
  editorModal.value.showModal();
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
