import { Struct } from '@heliks/tiles-engine';
import { TmxHasProperty } from './tmx-json';

/** Extracts the custom properties from any TMX formatted data. */
export function tmxParseProperties<T>(target: TmxHasProperty): Partial<T> {
  const data: Struct = {};

  if (target.properties) {
    for (const item of target.properties) {
      data[ item.name ] = item.value;
    }
  }

  return data as Partial<T>;
}
