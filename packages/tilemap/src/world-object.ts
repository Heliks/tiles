import { World } from '@heliks/tiles-engine';

/**
 * An object on a tilemap that exists inside the game world. For example: Objects, tiles
 * or shapes are all considered "world objects".
 */
export abstract class WorldObject<T> {

  /** Object rotation in degrees (0-360). */
  public rotation = 0;

  /** Width in px. */
  public width = 0;

  /** Height in px. */
  public height = 0;

  /** The name of a registered world object type. */
  public type?: string | number;

  /** Position on x axis. */
  public x = 0;

  /** Position on y axis. */
  public y = 0;

  /**
   * @param id An Id that is unique on the map on which the object is contained.
   */
  protected constructor(public readonly id: number) {}

  public abstract spawn(world: World, tilemap: T, index: number): void;

}







