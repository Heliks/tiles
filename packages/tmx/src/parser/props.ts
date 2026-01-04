import { Struct } from '@heliks/tiles-engine';
import { TmxHasPropertyData } from '../tmx';


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
