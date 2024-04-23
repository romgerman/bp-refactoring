<template>
  <div class="rounded-md shadow-lg border-1 border-vscode bg-vscode-side-bar wrapper">
    <div
      class="p-2 px-4 bg-vscode-cmd-center rounded-t-md items-center flex"
      :class="{ 'rounded-md': !$slots.body, 'no-content-header': !$slots.body && !condensed }"
    >
      <h3>
        <slot name="header" />
      </h3>
    </div>
    <div class="p-4 rounded-b-md" v-if="$slots.body">
      <slot name="body" />
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  condensed: Boolean,
});
</script>

<style lang="scss">
.wrapper {
  min-width: 124px;
}

.no-content-header {
  min-height: 48px;
}

.target-handles {
  position: absolute;
  top: 50%;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transform: translate(-50%, -50%);

  & > .target {
    position: relative;
    transform: none;

    &::before {
      content: attr(data-name);
      position: absolute;
      top: -60%;
      right: 16px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 4px;
      padding: 0 6px;
    }
  }
}
</style>
