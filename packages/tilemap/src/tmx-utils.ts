import { Struct } from '@tiles/engine';
import { TmxProperty } from './tmx-json';

export function parseProperties(properties: TmxProperty[]): Struct {
  const data: Struct = {};

  for (const item of properties) {
    data[ item.name ] = item.value;
  }

  return data;
}
