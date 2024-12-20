import { Rectangle } from '@heliks/tiles-engine';
import { ColliderShape } from '@heliks/tiles-physics';
import { TmxObjectData } from '../tmx';
import { parseCustomType } from './custom-type';
import { hasFlag, parseGID, TmxGIDFlag } from './gid';
import { parseGeometryData, TmxGeometry } from './tmx-geometry';
import { parseCustomProperties } from './tmx-properties';


/**
 * Geometry object on a {@link TmxLayerKind.Objects object layers}.
 *
 * - `P`: Custom Properties
 * - `T`: Allowed value for "type" property.
 * - `C`: Geometric shape of the object.
 */
export type TmxGeometryObject<P = unknown, T extends string = string, S extends ColliderShape = ColliderShape> = TmxGeometry<P, S, T>;

/**
 * Tile object on a {@link TmxLayerKind.Objects object layers}.
 *
 * - `P`: Custom Properties
 * - `T`: Allowed values for "type" property.
 * - `C`: Geometric shape of the object.
 */
export interface TmxTileObject<P = unknown, T extends string = string> extends TmxGeometry<P, Rectangle, T> {

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
export type TmxObject<P = {}, T extends string = string, S extends ColliderShape = ColliderShape> = TmxGeometryObject<P, T, S> | TmxTileObject<P, T>;

/**
 * Returns `true` if `value` is a {@link TmxTileObject}.
 *
 * @see TmxShapeObject
 * @see TmxTileObject
 */
export function isTile<P = unknown>(value: TmxObject<P>): value is TmxTileObject<P> {
  return !! (value as TmxTileObject).tileId;
}

/** Parses {@link TmxObjectData} and produces a {@link TmxObject}. */
export function parseObjectData(data: TmxObjectData): TmxObject {
  if (! data.gid) {
    return parseGeometryData(data);
  }

  // Objects that are not freely placed shapes are always rectangles.
  const shape = new Rectangle(data.width, data.height, data.x, data.y);

  let tileId;

  let flipX = false;
  let flipY = false;

  if (data.gid) {
    tileId = parseGID(data.gid);

    flipX = hasFlag(data.gid, TmxGIDFlag.FlipX);
    flipY = hasFlag(data.gid, TmxGIDFlag.FlipY);
  }

  return {
    id: data.id,
    name: data.name,
    properties: parseCustomProperties(data),
    type: parseCustomType(data),
    flipX,
    flipY,
    shape,
    tileId
  };
}







