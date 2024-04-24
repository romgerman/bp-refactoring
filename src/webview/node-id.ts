let id = 0;

/**
 * @returns {string} - A unique id.
 */
export function getId(type: "dnd" | "quick"): string {
  return `${type}_${id++}`;
}

export function updateCounter(value: number): void {
  id += value;
}
