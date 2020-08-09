import { TmxObject } from './tmx-json';
import { Tile } from '@heliks/tiles-tilemap';

/** Creates a `Tile` from object `data`. */
export function tmxConvertObjectToTile(data: TmxObject): Tile {
  const tile = new Tile(data.id, data.gid);

  // Objects are anchored on their bottom-left corner. Normalize by converting
  // it to center.
  tile.x = data.x + (data.width / 2);
  tile.y = data.y - (data.height / 2);

  return tile;
}

/*
export function tmxConvertObjectToShape(data: TmxObject): Shape {
  const shape = new Shape();

  // Free drawn shapes are anchored on their top-left corner. Normalize by
  // converting it to center.
  tile.x = data.x + (data.width / 2);
  tile.y = data.x + (data.height / 2);

  return shape;
}
 */






