import * as ts from "typescript";

export function isArrayOfType<T extends ts.Node>(items: any[], predicate: (node: ts.Node) => node is T): items is T[] {
  return Array.isArray(items) && (items.length > 0 ? predicate(items[0]) : true);
}
