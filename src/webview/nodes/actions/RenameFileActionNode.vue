<template>
  <NodeWrapper>
    <template #header>Rename File</template>
    <template #body>
      <div class="nowheel" style="max-height: 200px; overflow: auto">
        <div v-for="item in names">{{ item }}</div>
      </div>
    </template>
    <div class="target-handles">
      <Handle id="0:array" type="target" connectable="single" :position="Position.Left" data-name="Array" />
      <Handle id="1:string" type="target" connectable="single" :position="Position.Left" data-name="Name?" />
      <Handle id="2:string" type="target" connectable="single" :position="Position.Left" data-name="Prefix?" />
      <Handle id="3:string" type="target" connectable="single" :position="Position.Left" data-name="Postfix?" />
    </div>
    <Handle id="0:array" type="source" :position="Position.Right" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Handle, Position } from "@vue-flow/core";
import NodeWrapper from "../../components/NodeWrapper.vue";
import { useViewData } from "@/webview/composables/use-view-data";

const names = ref<string[]>([]);

useViewData<string[]>((data) => {
  names.value = data;
});
</script>

<style lang="scss">
.vue-flow__node-rename-file-action {
  min-height: 100px;
  display: flex;
}
</style>
