<template>
  <NodeWrapper>
    <template #header>Filter By</template>
    <div class="target-handles">
      <Handle id="0:array" type="target" connectable="single" :position="Position.Left" data-name="Array" />
      <Handle id="1:predicate" type="target" connectable="single" :position="Position.Left" data-name="Predicate" />
    </div>
    <Handle id="0:array" type="source" :position="Position.Right" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import NodeWrapper from "../../components/NodeWrapper.vue";
</script>
