import { Rectangle } from '@heliks/tiles-engine';
import { ColliderShape } from '@heliks/tiles-physics';
import { Geometry, LevelEntity } from '../level';
import { TmxObjectData } from '../tmx';
import { ParserConfig } from './config';
import { parseCustomType } from './custom-type';
import { parseGeometry } from './geometry';
import { hasFlag, parseGID, TmxGIDFlag } from './gid';
import { getCustomProps } from './props';


/**
 * Geometry object on a {@link TmxLayerKind.Objects object layers}.
 *
 * - `P`: Custom Properties
 * - `T`: Allowed value for "type" property.
 * - `C`: Geometric shape of the object.
 */
export type TmxGeometryObject<P = unknown, T extends string = string, S extends ColliderShape = ColliderShape> = Geometry<P, S, T>;

/**
 * Tile object on a {@link TmxLayerKind.Objects object layers}.
 *
 * - `P`: Custom Properties
 * - `T`: Allowed values for "type" property.
 * - `C`: Geometric shape of the object.
 */
export interface TmxTileObject<P = unknown, T extends string = string> extends Geometry<P, Rectangle, T> {

  /** If set to `true`, the sprite of the object will be flipped along its x-axis. */
  flipX: boolean;

  /** If set to `true`, the sprite of the object will be flipped along its y-axis. */
  flipY: boolean;

  /** Global ID of the tile that this object is using as its sprite. */
  tileId: number;

}

/**
 * An object that is placed on a {@link ObjectLayer object layer}.
 *
 * - `P`: Custom Properties
 * - `T`: Allowed value for "type" property.
 * - `C`: Geometric shape of the object.
 *
 * @see TmxGeometryObject
 * @see TmxTileobject
 */
export type TmxObject<P = unknown, T extends string = string, S extends ColliderShape = ColliderShape> = TmxGeometryObject<P, T, S> | TmxTileObject<P, T>;

/**
 * Returns `true` if `value` is a {@link TmxTileObject}.
 *
 * @see TmxShapeObject
 * @see TmxTileObject
 */
export function isTile<P = unknown>(value: TmxObject<P>): value is TmxTileObject<P> {
  return !! (value as TmxTileObject).tileId;
}

/** Parses {@link TmxObjectData} and produces a {@link LevelEntity}. */
export function parseObjectData(data: TmxObjectData, config: ParserConfig): LevelEntity {
  if (! data.gid) {
    return parseGeometry(data, config);
  }

  // Objects that are not freely placed shapes are always rectangles.
  const shape = new Rectangle(data.width, data.height, data.x, data.y).shrink(config.unitSize);
  
  shape.x /= config.unitSize;
  shape.y /= config.unitSize;

  return {
    flipX: hasFlag(data.gid, TmxGIDFlag.FlipX),
    flipY: hasFlag(data.gid, TmxGIDFlag.FlipY),
    id: data.id,
    name: data.name,
    props: getCustomProps(data),
    tileId: parseGID(data.gid),
    type: parseCustomType(data),
    shape
  };
}







