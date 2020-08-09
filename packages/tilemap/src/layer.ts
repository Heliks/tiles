import { World } from '@heliks/tiles-engine';
import { Container } from '@heliks/tiles-pixi';

/**
 * A layer inside a tilemap.
 *
 * @typeparam T The kind of tilemap.
 */
export interface Layer<T> {

  /**
   * If `true` the layer counts as a floor which means that player characters can be
   * spawned here.
   */
  isFloorLayer: boolean;

  /**
   * Spawns the layer to `world`, using `tilemap` to resolve tilesets, properties and
   * other values. The `index` is the index at which the layer is supposed to be spawned.
   */
  spawn(world: World, tilemap: T, index: number): void;

  /** Renders the layer to `target`. */
  render?(world: World, tilemap: T, target: Container): void;

}



