<template>
  <dialog class="modal" ref="dialog">
    <div class="modal-box max-w-full flex flex-col">
      <div class="flex flex-col flex-1 min-h-0">
        <h3 class="font-bold text-lg">
          <slot name="header" />
        </h3>

        <div class="overflow-auto">
          <slot />
        </div>
      </div>

      <div class="modal-action">
        <form method="dialog">
          <vscode-button type="submit">Close</vscode-button>
        </form>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

const dialog = ref<HTMLDialogElement>();

function showDialog(): void {
  dialog.value.showModal();
}

defineExpose({
  showDialog,
});
</script>
