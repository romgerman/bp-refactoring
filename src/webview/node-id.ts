let id = 0;

/**
 * @returns {string} - A unique id.
 */
export function getId(type: "dnd" | "quick") {
  return `${type}_${id++}`;
}
