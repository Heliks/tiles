import { Handle } from '@heliks/tiles-assets';
import { Grid } from '@heliks/tiles-engine';
import { Texture } from 'pixi.js';
import { Tileset } from '../tileset';


/**
 * Returns a {@link Tileset} with a blank white {@link Texture} texture using the
 * given `grid` dimensions.
 */
export function createEmptyTileset(grid: Grid): Tileset {
  return new Tileset(Handle.from('noop.png'), grid.size);
}
