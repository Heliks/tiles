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
 * Parses custom properties of `data`.
 *
 * - `P`: Expected custom properties.
 */
export function getCustomProperties<P extends Properties>(data: TmxHasProperties): P {
  const props: Properties = {};

  if (data.properties) {
    for (const item of data.properties) {
      props[ item.name ] = item.value;
    }
  }

  return props as P;
}
