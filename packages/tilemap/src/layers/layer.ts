import { Struct, World } from '@tiles/engine';

export interface LayerProperties {
  /**
   * If set to `true` the layer counts as a floor, which means that the player character
   * can be spawned on it.
   */
  isFloorLayer?: boolean;

  depth?: number;
}

/**
 * A layer inside a tilemap.
 *
 * @typeparam T The kind of tilemap.
 * @typeparam P Possible properties.
 */
export interface Layer<T, P = LayerProperties> {

  /** Custom properties attached to this layer. */
  readonly properties: P;

  /**
   * Spawns the layer to `world`, using `tilemap` to resolve tilesets, properties and
   * other values. The `index` is the index at which the layer is supposed to be spawned.
   */
  spawn(world: World, tilemap: T, index: number): void;

}

export enum WorldObjectType {
  Unknown = '',
  Trigger = 'trigger'
}

/**
 * An object on a tilemap that exists inside the game world. For example: Objects, tiles
 * or shapes are all considered "world objects".
 */
export interface WorldObject {
  /** An Id that is unique on the map on which the object is contained. */
  id: number;
  /** Object rotation in degrees (0-360). */
  rotation: number;
  /** Width in px. */
  width: number;
  /** Height in px. */
  height: number;
  /** The Id of the tile that the world object should display. */
  tileId?: number;
  /** The name of a registered world object type. */
  type: string;
  /** Position on x axis. */
  x: number;
  /** Position on y axis. */
  y: number;
}





