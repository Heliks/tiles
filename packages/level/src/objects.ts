import { Rectangle } from '@heliks/tiles-engine';
import { ColliderShape, RigidBodyType } from '@heliks/tiles-physics';
import { Geometry } from './geometry';
import { PhysicsProps } from './physics';


export interface ObjectBodyConfig {
  damping: number;
  type: RigidBodyType;
}

export interface ObjectProps extends PhysicsProps {
  $body?: ObjectBodyConfig;
}

/**
 * Defines an object that renders a tile.
 *
 * Tile objects will inherit most properties (aE. physics) from {@link CustomTile}
 * definitions declared on the tile's tileset.
 *
 * The entity's geometry is always a {@link Rectangle} that specifies the size and
 * position of the tile as placed on the level, which may differ from the tile's
 * original tile geometry duo to scaling.
 *
 * @template `P`: Custom properties
 * @template `T`: Custom type.
 */
export interface TileObject<P = ObjectProps, T extends string = string> extends Geometry<P, Rectangle, T> {
  /** If set to `true`, the sprite of the object will be flipped along its x-axis. */
  flipX: boolean;
  /** If set to `true`, the sprite of the object will be flipped along its y-axis. */
  flipY: boolean;
  /** Global ID of the tile that this entity is using as its sprite. */
  tileId: number;
}

/**
 * Defines an object that is a geometrical shape.
 *
 * @template `P`: Custom properties
 * @template `T`: Custom type.
 */
export type LevelObject<P = ObjectProps, T extends string = string> =
  Geometry<P, ColliderShape, T> | TileObject<P, T>;

/** Returns `true` if the given entity `data` is that of a geometry. */
export function isTileObject<P = {}>(data: LevelObject<P>): data is TileObject<P> {
  return (data as TileObject<P>).tileId !== undefined;
}
