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
 * Extracts the custom properties from any TMX formatted data.
 *
 * Note: Although the property format `P` can be type hinted the validity of that format
 *  is not actually guaranteed as there is no way to check this.
 *
 * @typeparam P Custom property format.
 */
export function getProperties<P extends Properties>(target: TmxHasProperties): P {
  const data: Properties = {};

  if (target.properties) {
    for (const item of target.properties) {
      data[item.name] = item.value;
    }
  }

  return data as P;
}
