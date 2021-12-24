import { TmxHasProperties } from './tmx';


/** Custom properties. */
export interface Properties {
  [property: string]: unknown;
}

/** Helper type that indicates a structure carries custom properties. */
export interface HasProperties<T extends Properties> {
  /** Custom properties. */
  readonly properties: T;
}

/**
 * Extracts the custom properties from any TMX formatted data. This is always a
 * `Partial` of the original type `T`, as we currently can not guarantee that all the
 * required properties really exist.
 */
export function getProperties<T extends Properties>(target: TmxHasProperties): Partial<T> {
  const data: Properties = {};

  if (target.properties) {
    for (const item of target.properties) {
      data[item.name] = item.value;
    }
  }

  return data as T;
}
