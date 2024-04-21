<template>
  <NodeWrapper>
    <template #header>Filter By</template>
    <div class="target-handles">
      <Handle id="0:array" type="target" :position="Position.Left" data-name="Array" />
      <Handle id="1:predicate" type="target" :position="Position.Left" data-name="Regexp"/>
    </div>
    <Handle id="0:array" type="source" :position="Position.Right" :is-valid-connection="isValidConnectionTarget" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import type { ValidConnectionFunc } from "@vue-flow/core";
import { Handle, Position } from "@vue-flow/core";
import NodeWrapper from "../NodeWrapper.vue";
const isValidConnectionTarget: ValidConnectionFunc = (conn, { sourceNode, targetNode }) => {
  return sourceNode.id !== targetNode.id;
};
</script>
