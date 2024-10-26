/** @internal */
export interface HasCustomType<T extends string = string> {

  /** Custom user defined type, if any. */
  type?: T;

}

/**
 * Returns the custom user defined type for a TMX data structure `data` and normalizes
 * empty types to `undefined`.
 */
export function parseCustomType(data: HasCustomType): string | undefined {
  if (data.type && data.type.length > 0) {
    return data.type;
  }
}
