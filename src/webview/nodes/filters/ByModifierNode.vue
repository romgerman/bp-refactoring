<template>
  <NodeWrapper>
    <template #header>By Modifier</template>
    <template #body>
      <VueSelect
        placeholder="Type"
        :options="MODIFIER_TYPES"
        :reduce="(item: any) => item.value"
        v-model="model.type"
      ></VueSelect>
    </template>
    <Handle id="0:predicate" type="source" :position="Position.Right" />
  </NodeWrapper>
</template>

<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import VueSelect from "vue-select";
import NodeWrapper from "../NodeWrapper.vue";
import { type ByModifierPredicateNode } from "@/blueprint/nodes/filtering/by-modifier";
import { ByModifierType } from "@/blueprint/nodes/filtering/types";
import { useNodeState } from "@/webview/composables/use-node-state";

const MODIFIER_TYPES: Array<{ value: ByModifierType, label: string }> = [
  { value: ByModifierType.Public, label: "public" },
  { value: ByModifierType.Private, label: "private" },
  { value: ByModifierType.Protected, label: "protected" },
  { value: ByModifierType.Static, label: "static" },
  { value: ByModifierType.Abstract, label: "abstract" },
  { value: ByModifierType.Export, label: "export" }
];

const model = useNodeState<ByModifierPredicateNode>({ type: null as ByModifierType });
</script>
