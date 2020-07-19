import { Struct, World } from '@tiles/engine';

/** A layer inside a tilemap. */
export interface Layer<T> {

  /** Custom properties attached to this layer. */
  readonly properties: Struct;

  /**
   * Spawns the layer to `world`, using `tilemap` to resolve tilesets, properties
   * and other values.
   */
  spawn(world: World, tilemap: T): void;

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





