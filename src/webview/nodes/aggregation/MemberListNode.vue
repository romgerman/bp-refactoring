<template>
  <NodeWrapper>
    <template #header>Member List</template>
    <template #body>
      <div class="nowheel">
        <div style="max-height: 200px; overflow: auto">
          <div v-for="item in items" :title="item.type">
            <div class="codicon" :class="getIconClass(item.type)"></div>
            {{ item.name }}
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
  </NodeWrapper>
</template>

<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import { useViewData } from "@/webview/composables/use-view-data";
import NodeWrapper from "../NodeWrapper.vue";
import { useCollapsableList } from "@/webview/composables/use-collapsable-list";
import { MemberType } from "@/blueprint/nodes/aggregation/types";

const { model, items, greaterThanMaxItems, otherItemsCount, toggleAll } = useCollapsableList<{ name: string; type: MemberType }>();

function getIconClass(type: MemberType): string {
  switch (type) {
    case MemberType.Method:
      return "codicon-symbol-method";
    case MemberType.Property:
      return "codicon-symbol-property";
    case MemberType.Constructor:
      return "codicon-symbol-class";
    case MemberType.GetAccessor:
      return "codicon-symbol-property";
    case MemberType.SetAccessor:
      return "codicon-symbol-property";
    case MemberType.Unknown:
      return "codicon-workspace-unknown";
  }
}

useViewData<{ name: string; type: MemberType }[]>((data) => {
  model.value.allItems = data;
});
</script>
