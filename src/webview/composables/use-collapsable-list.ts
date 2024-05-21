import { computed, ref } from "vue";

const MAX_ITEMS = 3;

export function useCollapsableList<T = any>() {
  const model = ref<{ allItems: T[]; opened: boolean }>({
    allItems: [],
    opened: false,
  });
  const otherItemsCount = computed(() => model.value.allItems.length - MAX_ITEMS);
  const greaterThanMaxItems = computed(() => otherItemsCount.value > MAX_ITEMS);
  const items = computed(() => (model.value.opened ? model.value.allItems : model.value.allItems.slice(0, MAX_ITEMS)));

  function toggleAll(): void {
    model.value.opened = !model.value.opened;
  }

  return {
    model,
    otherItemsCount,
    greaterThanMaxItems,
    items,
    toggleAll,
  };
}
