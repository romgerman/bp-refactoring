import { Elements } from "@vue-flow/core";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useNodeStore = defineStore("nodes", () => {
  const nodes = ref<Elements>([]);

  const hasProjectNode = computed(() => nodes.value.findIndex((x) => x.type === "project") !== -1);

  return { nodes, hasProjectNode };
});
