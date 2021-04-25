/** @internal */
interface HasType {
  type?: string;
}

/**
 * Returns the custom user defined type for a TMX data structure `data` and normalizes
 * empty types to `undefined`.
 */
export function getCustomType(data: HasType): string | undefined {
  if (data.type && data.type.length > 0) {
    return data.type;
  }
}
