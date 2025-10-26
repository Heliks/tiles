import { Struct } from '@heliks/tiles-engine';
import { TmxHasPropertyData } from '../tmx';


/** Helper type that indicates a structure carries custom properties. */
export interface HasProperties<P = unknown> {
  /** Custom properties. */
  readonly properties: P;
}

/** Types that implement this interface carry custom properties. */
export interface HasCustomProps<P = {}> {
  /** Custom properties. */
  readonly props: P;
}

/**
 * Parses custom properties of `data`.
 *
 * - `P`: Expected custom properties.
 */
export function getCustomProps<P = unknown>(data: TmxHasPropertyData): P {
  const props: Struct = {};

  if (data.properties) {
    for (const item of data.properties) {
      props[ item.name ] = item.value;
    }
  }

  return props as P;
}
