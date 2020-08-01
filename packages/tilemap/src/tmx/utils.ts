import { Struct } from '@tiles/engine';
import { TmxProperty } from './tmx-json';

// Possible values for the parsed TMX property.
type PropertyValue = string | number;

/** Parses a list of tmx properties. */
export function parseProperties(properties: TmxProperty[]): Struct<PropertyValue> {
  const data: Struct<PropertyValue> = {};

  for (const item of properties) {
    data[ item.name ] = item.value;
  }

  return data;
}
