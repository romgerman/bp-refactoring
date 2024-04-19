export function parseHandleId(id?: string | null): { index: number; type: string } {
  const [rawIndex, rawType] = id?.split(":") ?? [];
  return { index: Number(rawIndex), type: rawType };
}
