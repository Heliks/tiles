import { Rectangle } from '@heliks/tiles-engine';
import { ColliderShape } from '@heliks/tiles-physics';
import { Geometry } from './geometry';


/**
 * Defines an entity that renders a tile.
 *
 * Tile entities will inherit most properties (aE. physics) from {@link CustomTile}
 * definitions declared on the tile's tileset.
 *
 * The entity's geometry is always a {@link Rectangle} that specifies the size and
 * position of the tile as placed on the level, which may differ from the tile's
 * original tile geometry duo to scaling.
 *
 * @template `P`: Custom properties
 * @template `T`: Custom type.
 */
export interface TileEntity<P = {}, T extends string = string> extends Geometry<P, Rectangle, T> {
  /** If set to `true`, the sprite of the object will be flipped along its x-axis. */
  flipX: boolean;
  /** If set to `true`, the sprite of the object will be flipped along its y-axis. */
  flipY: boolean;
  /** Global ID of the tile that this entity is using as its sprite. */
  tileId: number;
}

/**
 * Defines an entity that can be spawned by the level system.
 *
 * @template `P`: Custom properties
 * @template `T`: Custom type.
 */
export type LevelEntity<P = {}, T extends string = string> = Geometry<P, ColliderShape, T> | TileEntity<P, T>;

/** Returns `true` if the given entity `data` is that of a geometry. */
export function isTileEntity<P = {}>(data: LevelEntity<P>): data is TileEntity<P> {
  return (data as TileEntity<P>).tileId !== undefined;
}
