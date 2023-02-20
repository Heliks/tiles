import { TmxHasPropertyData } from './tmx';


/** Custom properties. */
export interface TmxProperties {
  [property: string]: unknown;
}

/** Helper type that indicates a structure carries custom properties. */
export interface HasProperties<T extends TmxProperties> {
  /** Custom properties. */
  readonly properties: T;
}

/**
 * Parses custom properties of `data`.
 *
 * - `P`: Expected custom properties.
 */
export function parseCustomProperties<P extends TmxProperties>(data: TmxHasPropertyData): P {
  const props: TmxProperties = {};

  if (data.properties) {
    for (const item of data.properties) {
      props[ item.name ] = item.value;
    }
  }

  return props as P;
}
